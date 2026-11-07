# Minguinho-zeze/Qwen3-1.7B-W2A16-AWQ-WikiText2

## Resumen

Qwen3-1.7B-W2A16-AWQ-WikiText2 es un checkpoint de investigación publicado por el usuario Minguinho-zeze, consistente en una cuantización post-entrenamiento del modelo Qwen3-1.7B de Alibaba Qwen. La cuantización aplica pesos simétricos INT2 con activaciones de 16 bits (W2A16), grupo de tamaño 128 y algoritmo AWQ, calibrado sobre texto de entrenamiento de WikiText-2. No se realizó entrenamiento adicional: el checkpoint es el resultado directo del pipeline de cuantización del repositorio lowbit-reasoning-ptq.

El dato crítico de esta ficha es que el propio autor lo publica como un **checkpoint de reproducción de fallo**: el modelo obtiene un 0,00 % tanto en AIME-120 como en GPQA Diamond, frente al 40,00 % y 40,40 % del Qwen3-1.7B en BF16. El autor lo declara explícitamente no recomendado para inferencia práctica y lo libera para diagnóstico de colapso de precisión en cuantización de 2 bits.

Por tanto, su relevancia no es como modelo utilizable, sino como evidencia empírica de que la cuantización extrema a INT2 con AWQ y calibración WikiText-2 puede destruir por completo las capacidades de razonamiento de un modelo de 1.700 millones de parámetros. Resulta de interés para investigadores en cuantización de bajo bit y en evaluación de kernels comprimidos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen3-1.7B); pesos cuantizados con compressed-tensors |
| Parametros totales | 1.720.574.976 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens de salida en la configuración de evaluación; max_model_len de 34.816 en vLLM según el ejemplo del autor; contexto nativo del modelo base no disponible en la información proporcionada |
| Tipos de cuantizacion | W2A16: pesos INT2 simétricos, activaciones 16 bits, grupo de 128; embedding, capas de normalización y lm_head sin cuantizar; fracción de parámetros cuantizados 81,9079 % |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors con compressed-tensors (no es GGUF ni AutoAWQ) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del Qwen3-1.7B original, un transformer decoder-only denso de aproximadamente 1.700 millones de parámetros. Sobre esa base, este checkpoint aplica cuantización post-entrenamiento (PTQ) sin ningún entrenamiento adicional. El esquema es W2A16: pesos simétricos de 2 bits con activaciones de 16 bits, agrupados en bloques de 128 elementos, usando el algoritmo AWQ. Las capas de embedding, normalización y la cabeza de salida (lm_head) permanecen en precisión completa, y el KV cache se mantuvo en BF16 durante la evaluación.

La calibración se realizó con texto de entrenamiento raw de WikiText-2, usando 128 ventanas de 2.048 tokens con semilla 0. Los pesos se empaquetan con compressed-tensors y los ajustes exactos, junto con las versiones del cuantizador, quedan registrados en `config.json`, `recipe.yaml` y `quant_meta.json`. El autor no establece en esta release ninguna conclusión causal sobre qué factor (algoritmo, calibración o kernel) provoca el colapso de precisión observado, y ha retenido los resultados de efectos de factores mientras investiga mediante reruns.

## Capacidades

- Generación de texto conversacional (pipeline text-generation), heredada del modelo base.
- Modo thinking habilitable mediante `chat_template_kwargs={"enable_thinking": True}` en vLLM.
- En la práctica, **las capacidades de razonamiento están colapsadas**: 0,00 % en AIME-120 y 0,00 % en GPQA Diamond según la evaluación del autor.
- Soporte de tool calling / function calling: no disponible en la información proporcionada para este checkpoint.
- Capacidades multilingües: no disponible.
- Capacidades especiales (visión, audio): no disponibles; el modelo base Qwen3-1.7B es solo texto.

## Casos de uso

- Reproducción de fallos de cuantización: ejecutar el checkpoint con la configuración documentada (vLLM 0.32.0, PyTorch 2.13.0, compressed-tensors 0.17.0, humming-kernels 0.1.17) para replicar el 0 % en AIME-120 y GPQA Diamond y aislar la causa del colapso.
- Diagnóstico de kernels comprimidos: comparar la ruta de referencia frente a los kernels comprimidos incluidos en `diagnostics/` para verificar si el fallo proviene del kernel INT2 o de la propia cuantización.
- Estudio de sensibilidad a la calibración: repetir el pipeline AWQ W2A16 sustituyendo WikiText-2 por otros corpus de calibración y medir el efecto sobre las mismas 120 preguntas de AIME y 198 de GPQA Diamond.
- Investigación sobre cuantización de bajo bit en modelos pequeños: usar este checkpoint como caso extremo de referencia al evaluar umbrales de bits por debajo de los cuales un modelo de 1.7B pierde toda capacidad de razonamiento.
- Validación de pipelines de evaluación: servir de control negativo en suites de evaluación que deban detectar modelos con precisión destruida antes de desplegarlos.
- Docencia y divulgación: ilustrar con un caso reproducible y de licencia Apache-2.0 los riesgos de la cuantización PTQ agresiva sin validación posterior.

## Benchmarks y rendimiento

Datos del autor, precisión media en porcentaje sobre las semillas 0, 1 y 2 (mismas 120 preguntas de AIME y 198 de GPQA Diamond por semilla; las semillas repetidas son generaciones repetidas, no preguntas independientes). Modo thinking activado, temperatura 0,6, top-p 0,95, top-k desactivado, presupuesto de salida de 32.768 tokens; las respuestas truncadas se puntúan como incorrectas.

| Modelo | AIME-120 | GPQA Diamond |
|---|---:|---:|
| Qwen3-1.7B BF16 | 40,00 | 40,40 |
| Este checkpoint (W2A16 AWQ) | 0,00 | 0,00 |

El autor advierte que estas cifras describen su protocolo experimental y no son resultados oficiales de Qwen. Los detalles por semilla, longitudes de tokens, truncamiento y velocidad están en `eval_results.json` y en los resultados completos del repositorio.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el repositorio ocupa 1,0 GB, lo que da una cota inferior del peso en disco de los pesos cuantizados.
- GPU validadas: el experimento se ejecutó en GPUs Blackwell; el autor indica que otras GPUs y combinaciones de paquetes no han sido validadas por esta release.
- GPU de consumo: no confirmado; el requisito de kernels Humming con compilación JIT NVRTC y la pila de software (vLLM 0.32.0, PyTorch 2.13.0, Transformers 5.17.0) condicionan la viabilidad más que la VRAM.
- Despliegue: vLLM es la librería declarada; no es un release GGUF ni AutoAWQ, por lo que llama.cpp y Ollama no son compatibles directamente.
- Configuración de referencia: `max_model_len=34816`, `gpu_memory_utilization=0.90`, `enable_prefix_caching=False`; para INT2 es necesario añadir el directorio de la librería CUDA NVRTC a `LD_LIBRARY_PATH` antes de la compilación JIT de Humming.
- Latencia y throughput: no disponibles en la información proporcionada (los registros de velocidad están en los resultados completos del repositorio, no en la model card).

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Contexto | AIME-120 | GPQA Diamond | Licencia | Estado |
|---|---|---:|---|---:|---:|---|---|
| Este checkpoint | 1,72B | W2A16 AWQ, grupo 128 | 34.816 (config vLLM) | 0,00 | 0,00 | Apache-2.0 | Checkpoint de fallo, no recomendado |
| Qwen3-1.7B (BF16) | ~1,7B | BF16 | No disponible | 40,00 | 40,40 | Apache-2.0 | Modelo base de referencia |
| Minguinho-zeze/Qwen3-1.7B-NVFP4-RTN-WikiText2 | ~1,7B | NVFP4 RTN, calibrado en WikiText-2 | No disponible | No disponible | No disponible | No disponible | Variante del mismo pipeline de cuantización |

La comparación relevante es con el modelo base sin cuantizar: la diferencia de 40 puntos porcentuales en ambas pruebas cuantifica el colapso. La variante NVFP4 del mismo autor, calibrada igualmente con WikiText-2, aparece en la búsqueda web pero sin cifras de benchmark en la información disponible, por lo que no permite establecer si el fallo es específico de INT2.

## Limitaciones y advertencias

- **Precisión destruida**: 0,00 % en AIME-120 y GPQA Diamond; el autor lo declara no recomendado para inferencia práctica.
- **Propósito exclusivo de investigación**: es un checkpoint para reproducir y diagnosticar un fallo, no un modelo desplegable.
- **Causa no establecida**: el autor no atribuye el fallo al algoritmo, a la calibración ni al kernel, y ha retenido los resultados de efectos de factores mientras investiga.
- **Kernels no validados**: las comparaciones en `diagnostics/` no establecen la corrección de los kernels comprimidos en todas las formas de tensor.
- **Entorno frágil**: solo se validó con vLLM 0.32.0, PyTorch 2.13.0, Transformers 5.17.0, compressed-tensors 0.17.0 y humming-kernels 0.1.17 sobre GPUs Blackwell; otras combinaciones no han sido validadas.
- **Ejemplo no reejecutado**: el snippet de carga de la model card sigue la configuración del motor experimental y no se ha vuelto a ejecutar desde la revisión subida a Hugging Face.
- **Riesgo de alucinación y sesgos**: no evaluados en esta release; con la precisión colapsada, cualquier salida debe considerarse no fiable.
- **Idiomas**: no disponibles; no se documenta cobertura multilingüe de este checkpoint.
- **Licencia**: Apache-2.0 heredada del modelo base, con el texto incluido en `LICENSE`; permite uso comercial del artefacto, pero su calidad lo desaconseja por completo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Minguinho-zeze/Qwen3-1.7B-W2A16-AWQ-WikiText2
- Modelo base Qwen3-1.7B: https://huggingface.co/Qwen/Qwen3-1.7B
- Repositorio lowbit-reasoning-ptq: https://github.com/minguinho26/lowbit-reasoning-ptq
- Snapshot de evaluación (revisión a851e39): https://github.com/minguinho26/lowbit-reasoning-ptq/tree/a851e3957297eaa52d0344a50bd0bbc7e87d5378
- Resultados completos (qwen3-1.7b-20261108): https://github.com/minguinho26/lowbit-reasoning-ptq/tree/main/reports/qwen3-1.7b-20261108
- Configuración del motor de inferencia (src/engine.py): https://github.com/minguinho26/lowbit-reasoning-ptq/blob/a851e3957297eaa52d0344a50bd0bbc7e87d5378/src/engine.py
- Variante NVFP4 RTN del mismo autor: https://huggingface.co/Minguinho-zeze/Qwen3-1.7B-NVFP4-RTN-WikiText2
