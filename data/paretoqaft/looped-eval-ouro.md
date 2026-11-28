# ParetoQaft/looped-eval-ouro

## Resumen

`ParetoQaft/looped-eval-ouro` no es un modelo generativo en sentido estricto, sino un paquete de evaluación reproducible para modelos Ouro de ByteDance con arquitectura de transformer con bucles (looped transformer). Lo publica la organización ParetoQaft y acompaña al repositorio de cuantización `ParetoQaft/looped-autoround-ouro`. Su función es medir el rendimiento de los checkpoints Ouro cuando se aplican esquemas de cuantización por bucle (por ejemplo, rutas de anchura de bits 2-2-2-4 o 2-4-4-4), de modo que un mismo checkpoint pueda ejecutar los bucles 0-2 a 2 bits y el bucle 3 a 4 bits.

Técnicamente, el paquete contiene un parche sobre la implementación del modelo Ouro en vLLM 0.21.0 que permite sustituir los pesos de proyección de cada bucle en tiempo de ejecución, además de soportar checkpoints desenrollados (por ejemplo, una copia de 96 capas de un modelo de 24 capas con 4 bucles). Se apoya en OLMES (`oe_eval`) para lanzar tareas de evaluación y en `lm_eval` con un parche menor para adaptarse a la API de vLLM 0.21.

La relevancia es metodológica: permite comparar de forma controlada el impacto de la cuantización selectiva por bucle sobre el modelo base Ouro-1.4B y Ouro-2.6B, con un conjunto de tareas fijo (GSM8k 3-shot como referencia principal, más HumanEval, BBH, Winogrande y un conjunto `dev` de estilo Tulu 3). Es material de investigación, no un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con bucles (looped transformer) Ouro, con parche de inferencia en vLLM 0.21.0 |
| Parametros totales | No disponible (depende del checkpoint base: Ouro-1.4B u Ouro-2.6B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (max length de evaluación por defecto: 4096 tokens) |
| Tipos de cuantizacion | Por bucle, con anchuras de bits configurables (rutas tipo 2-2-2-4, 2-4-4-4); GPTQ empaquetado y BF16 denso |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | Safetensors del checkpoint base; ficheros `.quant` para pesos cuantizados por bucle; requiere `config.json` con `quant_ut_steps`, `quantized_weights_path` y `total_ut_steps` |

## Arquitectura y entrenamiento

El paquete no entrena ningún modelo: es infraestructura de evaluación sobre los checkpoints Ouro de ByteDance, que usan una arquitectura de transformer con bucles en la que un conjunto reducido de capas se reutiliza varias veces. El parche de vLLM añade tres capacidades: (1) carga de pesos por bucle desde un fichero externo, sustituyéndolos antes y después de cada bucle para permitir anchuras de bits distintas por iteración; (2) soporte de checkpoints desenrollados, donde `original_num_hidden_layers` distinto de `num_hidden_layers` indica una copia expandida (por ejemplo, 96 capas a partir de 24 capas × 4 bucles) con una norma y una compuerta de salida por bucle original; y (3) desactivación de `torch.compile` y de CUDA graphs para modelos con bucles, ya que el intercambio de pesos en tiempo de ejecución rompe la captura de grafos.

El entorno está fijado con precisión: Python 3.10, vLLM 0.21.0, PyTorch 2.11.0, ruedas CUDA 13 y OLMES en el commit `5a51f502`. La instalación requiere `pip install --no-deps` porque OLMES declara `numpy<2` mientras que el entorno funcional usa numpy 2.2.6. El parche sobre `lm_eval` 0.4.3 solo renombra `prompt_token_ids=` por `prompts=` en tres llamadas a `LLM.generate`. Los scripts `prepare_model.py`, `run_eval.sh` y `run_gsm8k.sh` automatizan la preparación del checkpoint, la evaluación y la extracción de la métrica `primary_score`.

## Capacidades

- Evaluación de modelos Ouro con cuantización por bucle: permite medir el efecto de distintas anchuras de bits en cada iteración del bucle sobre el mismo checkpoint.
- Soporte de checkpoints densos en BF16 y de checkpoints GPTQ empaquetados que se dequantizan previamente con `dequantize.py`.
- Soporte de modelos desenrollados (capas expandidas con norma y compuerta de salida por bucle).
- Ejecución de tareas OLMES arbitrarias, tanto por nombre registrado (`mmlu:mc::olmes`) como mediante configuración JSON de tarea.
- Conjunto `pretrained`: GSM8k test 3-shot con `STD:GSM8k`, `exact_match`, sin plantilla de chat, batch 64. Es el conjunto usado para las cifras publicadas.
- Tareas `pretrained` adicionales definidas pero desactivadas en el pipeline original: HumanEval (`pass_at_1`, greedy, máx. 1024 tokens nuevos), BBH (`bbh:cot-v1::olmes`) y Winogrande (validación, 5-shot, `acc_raw`).
- Conjunto `dev` para modelos ajustados a instrucciones con plantilla de chat estilo Tulu 3: `gsm8k::tulu`, `codex_humaneval::tulu`, `codex_humanevalplus::tulu`, `ifeval::tulu`, `bbh:cot-v1::tulu`, `truthfulqa::tulu`, `agi_eval_english:0shot_cot::tulu3` y `gpqa:0shot_cot::tulu3`.
- Ejecución local de código generado en las tareas HumanEval mediante subprocesos.
- No es un modelo de chat ni un modelo generativo desplegable: no incorpora plantilla de chat propia ni pesos utilizables directamente como servicio.

## Casos de uso

- Evaluación de cuantización selectiva por bucle: un investigador puede preparar un checkpoint con `prepare_model.py --quant-loops 0` y comparar rutas 2-2-2-4 frente a 2-4-4-4 sobre GSM8k 3-shot, aislando el efecto de la anchura de bits en cada iteración del bucle.
- Reproducción de resultados publicados: `run_gsm8k.sh` reproduce exactamente la configuración de las cifras reportadas para los modelos `ParetoQaft/*-looped-*-nemotron`, con batch 64, 3-shot y sin plantilla de chat.
- Comparación entre modelo denso y modelo desenrollado: `prepare_model.py` permite generar una versión de 1 bucle (`--total-loops 1`) y una versión de 4 bucles del mismo checkpoint para medir la ganancia o pérdida de calidad al reciclar capas.
- Validación de pipelines de cuantización: al fijar versiones exactas de vLLM, PyTorch y OLMES, sirve como entorno de referencia reproducible para verificar que una nueva técnica de cuantización no degrada las métricas base.
- Investigación en eficiencia de inferencia: permite medir el coste en calidad de reducir bits en bucles concretos, información útil para decidir qué bucles cuantizar agresivamente y cuáles mantener en mayor precisión.
- Evaluación de instruction following en modelos Ouro ajustados: el conjunto `dev` cubre IFEval, BBH, TruthfulQA, GPQA y AGI Eval English con plantilla de chat Tulu 3, útil para comparar variantes ajustadas de Ouro.
- Integración en pipelines de CI de investigación: los scripts imprimen una línea `RESULT <name> <alias> primary_score <x>` por tarea, fácil de parsear para seguimiento automatizado de experimentos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card describe la infraestructura de evaluación y las tareas que se ejecutan, pero no incluye cifras concretas de GSM8k ni de las demás tareas para los checkpoints Ouro cuantizados por bucle.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita. Como referencia, el modelo base Ouro-1.4B en BF16 requiere aproximadamente 3 GB de pesos, y Ouro-2.6B unos 5,5 GB; a esto hay que sumar la caché KV para longitudes de hasta 4096 tokens y los pesos adicionales del fichero `.quant` cuando se aplica cuantización por bucle.
- GPU recomendadas: no especificadas en la información disponible. El entorno fija ruedas CUDA 13 y vLLM 0.21.0, lo que implica GPUs NVIDIA con soporte para esa versión de CUDA.
- GPU de consumo: probablemente viable en GPUs consumer con suficiente VRAM para el checkpoint base más la caché KV, pero el paquete no documenta configuraciones probadas ni mínimos.
- Despliegue: vLLM 0.21.0 con el parche `patches/vllm-0.21.0-ouro-looped.patch` es el único backend soportado. No hay soporte documentado para llama.cpp, Ollama, TGI ni otros motores.
- Limitaciones de rendimiento: los modelos con bucles se ejecutan sin `torch.compile` y sin CUDA graphs, por lo que el throughput será inferior al de un modelo denso equivalente en vLLM estándar. No se publican cifras de latencia ni de tokens por segundo.
- Tamaños de batch por defecto: 64 para `gsm8k_pre` y 128 para el resto de tareas, con longitud máxima 4096. El tamaño de batch solo afecta a la velocidad, salvo diferencias numéricas mínimas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ParetoQaft/looped-eval-ouro | Depende del base (1.4B o 2.6B) | No disponible (eval a 4096) | Paquete de evaluación para cuantización por bucle en Ouro | No disponible | Hugging Face, 0 descargas |
| ByteDance/Ouro-1.4B | 1.4B | No disponible | Modelo base con transformer de bucles | No disponible | Hugging Face |
| ByteDance/Ouro-2.6B | 2.6B | No disponible | Modelo base con transformer de bucles | No disponible | Hugging Face |
| ParetoQaft/looped-autoround-ouro | Depende del base | No disponible | Código de cuantización por bucle (compañero de este paquete) | No disponible | Hugging Face |

La comparación con modelos de propósito general no es directa: este repositorio no es un modelo sino un arnés de evaluación. Frente a otros paquetes de evaluación como `lm-evaluation-harness` o `oe_eval` sin parchear, la diferencia es el soporte nativo de pesos por bucle y de checkpoints desenrollados en vLLM.

## Limitaciones y advertencias

- No es un modelo utilizable como servicio: no tiene pesos propios, plantilla de chat ni pipeline definido. Es código de evaluación con cero descargas y cero likes en el momento de la consulta.
- La licencia no está declarada, lo que impide asumir derechos de uso comercial sobre el paquete ni sobre los checkpoints derivados.
- El conjunto `dev` no es adecuado para modelos base como los Ouro cuantizados, que no están ajustados a instrucciones; aplicar plantilla de chat a un modelo base invalida la comparación.
- Las puntuaciones de `gsm8k` (Tulu, con plantilla de chat) y `gsm8k_pre` (3-shot, texto plano) no son comparables entre sí; mezclarlas produce conclusiones erróneas.
- Los modelos con bucles no pueden usar `torch.compile` ni CUDA graphs, lo que limita el rendimiento en producción y hace que las cifras de velocidad no sean representativas de un despliegue optimizado.
- El intercambio de pesos en tiempo de ejecución modifica parámetros del modelo, lo que puede introducir diferencias numéricas sutiles frente a una carga estática.
- Las tareas HumanEval ejecutan código generado localmente en subprocesos: riesgo de seguridad si se evalúan modelos no confiables en entornos sin aislamiento.
- La instalación requiere `--no-deps` por el conflicto entre `numpy<2` declarado por OLMES y numpy 2.2.6 del entorno; un `pip install` convencional fallará.
- El paquete fija versiones muy concretas (vLLM 0.21.0, PyTorch 2.11.0, CUDA 13, OLMES en `5a51f502`); cualquier actualización puede romper los parches, que verifican hashes de los ficheros originales.
- No se publican resultados de benchmarks en la información disponible, por lo que no es posible verificar empíricamente las afirmaciones de calidad de los checkpoints cuantizados sin ejecutar la evaluación.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/ParetoQaft/looped-eval-ouro
- Repositorio de cuantización compañero: https://huggingface.co/ParetoQaft/looped-autoround-ouro
- Modelo base Ouro-1.4B: https://huggingface.co/ByteDance/Ouro-1.4B
- Modelo base Ouro-2.6B: https://huggingface.co/ByteDance/Ouro-2.6B
- OLMES (`oe_eval`), commit referenciado en el paquete: `5a51f502` (sin URL directa en la información disponible)
- vLLM 0.21.0: no se proporciona URL en la información disponible
- `lm_eval` 0.4.3: no se proporciona URL en la información disponible
