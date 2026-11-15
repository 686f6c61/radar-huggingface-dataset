# jackf857/neu-l3-ultra-lscx-gdpo-r0p15-s42-20261115-a1

## Resumen

El modelo `neu-l3-ultra-lscx-gdpo-r0p15-s42-20261115-a1` es un checkpoint experimental de investigación publicado por el usuario jackf857 en Hugging Face. Se trata de un ajuste fino por preferencias (preference optimization) sobre el modelo base `W-61/llama-3-8b-base-sft-ultrachat-8xh200`, que a su vez deriva de Llama 3 de 8.000 millones de parámetros. El autor lo presenta explícitamente como un artefacto de comparación para investigación, no como un modelo listo para producción.

La contribución técnica del checkpoint es la combinación de dos mecanismos de optimización por preferencias: una variante de DPO denominada gamma-DPO, que introduce márgenes objetivo adaptativos por par de preferencias resueltos mediante un solver con cola y tamaño de optimización configurables, y un controlador de escalar beta en bucle cerrado denominado LSC (lsc_signal: dpo_margin). El entrenamiento se realizó sobre el split `train_prefs` del dataset UltraFeedback binarizado, con 61.135 pares disponibles, durante 477 pasos de optimizador en 4 GPU NVIDIA H200.

El interés del modelo es metodológico más que de rendimiento: documenta de forma muy detallada la receta, las semillas, los hashes de configuración y los diagnósticos de entrenamiento, lo que lo convierte en un caso útil para reproducir y comparar variantes de DPO. No se declara ninguna puntuación de benchmark ni evaluación held-out, y el autor advierte que una única semilla no establece calidad downstream.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LlamaForCausalLM (transformer decoder-only, 32 capas) |
| Parametros totales | 8.030.261.248 (~8,03 B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la model card; el entrenamiento usó 2048 tokens de secuencia máxima y 1800 de prompt |
| Tipos de cuantizacion | no disponible; los tensores se publican sin cuantizar (float32 serializado en config, entrenamiento en bfloat16) |
| Idiomas soportados | no disponibles (heredados de Llama 3; la card no los enumera) |
| Licencia | llama3 (Llama 3 Community License) |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only estándar de la familia Llama 3 con 32 capas y 8.030 millones de parámetros, inicializado desde el checkpoint SFT `W-61/llama-3-8b-base-sft-ultrachat-8xh200` (revisión `3e76fb18e464425d6e89fdcc025cd6b701c90e1a`). Ese mismo checkpoint se congela y se usa como referencia durante el ajuste por preferencias. El entrenamiento emplea atención SDPA y precisión bfloat16, con AdamW (`adamw_torch`), learning rate 5e-7, schedule coseno con warmup ratio 0,1, gradient clipping 1,0 y weight decay 0,0. El batch efectivo de pares es 128 (4 por GPU × 4 GPU × 8 de acumulación) y se completaron 477 pasos de optimizador en 4 NVIDIA H200 del Northeastern Explorer, con una duración de 7.545,4 segundos y un rendimiento de 0,063 pasos por segundo.

La innovación reside en la función de pérdida y el control del escalar beta. gamma-DPO usa márgenes objetivo adaptativos por par, resueltos con un solver de 20 iteraciones sobre una cola de 2.048 elementos y un tamaño de optimización de 256, con semilla de cola 42 y forma de margen "paper". El ratio gamma/beta se fija en 0,15 y gamma0 sigue al beta actual. En paralelo, el mecanismo LSC (closed_loop_lsc) aporta el escalar beta usando como señal el margen DPO crudo (`lsc_signal: dpo_margin`), con parámetros tau 10,0, tau_start 0,45, z_star 0,4, eta 0,1 y 3.816 actualizaciones de la política de beta. El beta inicial es 0,01. La pérdida de entrenamiento reportada por el trainer es 4,7856, aunque el autor aclara que las convenciones de acumulación y logging forman parte de la implementación y que este agregado no es una métrica de calidad.

## Capacidades

- Generación de texto conversacional en inglés (idioma del dataset UltraFeedback), heredada del modelo base SFT.
- Ajuste por preferencias orientado a alineación: el checkpoint está optimizado para preferir respuestas elegidas frente a rechazadas según UltraFeedback.
- Razonamiento multi-turno: el modelo base fue entrenado con UltraChat, por lo que soporta diálogo conversacional.
- No se documenta soporte de tool calling ni function calling en la model card.
- No se documenta soporte de agentes ni de razonamiento multi-paso explícito.
- No se documenta modo thinking, visión ni audio.
- Capacidades multilingües: no disponibles; la card no las enumera y el dataset de preferencias es mayoritariamente en inglés.

## Casos de uso

- Investigación en alineación: sirve como punto de comparación reproducible frente a DPO estándar, ya que documenta hashes de configuración, semilla y trayectorias de margen para aislar el efecto de gamma-DPO y LSC.
- Reproducción de experimentos: el paquete de entrenamiento incluye el commit del código (`80e41b2d...`), el SHA-256 del training packet y de la config, lo que permite replicar el run en un entorno equivalente.
- Estudio de controladores de beta: el registro de 3.816 actualizaciones de la política de beta y las trayectorias de margen permiten analizar el comportamiento del bucle cerrado LSC frente a beta fijo.
- Evaluación de robustez de checkpoints de preferencias: al ser un checkpoint intermedio (paso 477 de una política que retiene [400, 477]), es útil para estudiar cómo evoluciona la calidad con el número de pasos.
- Base para ablaciones: al partir de un SFT concreto y congelar la referencia, se puede comparar directamente contra otras variantes de DPO entrenadas sobre el mismo par de datos.
- Docencia y divulgación técnica: la card detalla cada hiperparámetro y diagnóstico, lo que lo hace adecuado como ejemplo didáctico de una receta de preference optimization completa.
- No se recomienda su uso en producción ni en aplicaciones de cara al usuario sin una evaluación adicional, según la propia advertencia del autor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El `model-index` del autor declara una entrada con `results: []`, y la model card indica explícitamente que no se incluye ninguna puntuación de generación ni evaluación held-out. El único dato numérico reportado es la pérdida de entrenamiento del trainer (4,7856), que el autor aclara que no constituye una métrica de calidad.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 16 GB solo para pesos (8,03 B × 2 bytes), más overhead de activaciones y KV cache; en la práctica, 18-24 GB según longitud de contexto.
- VRAM estimada en cuantización de 8 bits: unos 8-9 GB de pesos; en 4 bits, unos 4-5 GB, más overhead.
- GPU recomendadas: NVIDIA H200 (usada en entrenamiento), A100 40/80 GB, H100; para inferencia en bf16 cabe en una RTX 4090 de 24 GB con contexto moderado.
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB) en bf16 con contexto limitado, y en RTX 3090/4080 en cuantización de 8 o 4 bits.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag `text-generation-inference` y `endpoints_compatible`), y previsiblemente llama.cpp/Ollama/vLLM tras conversión a GGUF, aunque la card no lo confirma.
- Latencia y throughput: no disponibles; solo se conoce el rendimiento de entrenamiento (0,063 pasos/s en 4 H200), no de inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| neu-l3-ultra-lscx-gdpo-r0p15-s42-20261115-a1 | 8,03 B | no disponible (entrenado a 2048) | llama3 | Hugging Face, 0 descargas | Checkpoint de investigación, sin benchmarks |
| W-61/llama-3-8b-base-sft-ultrachat-8xh200 (base) | ~8 B | no disponible | llama3 | Hugging Face | SFT sobre UltraChat; referencia congelada del run |
| Llama 3 8B Instruct (Meta) | 8,03 B | 8.192 tokens | llama3 | Hugging Face, ampliamente distribuido | Modelo oficial alineado con RLHF/DPO; benchmarks públicos |
| Zephyr-7B-beta | 7,24 B | 32.768 tokens | MIT | Hugging Face | DPO sobre Mistral; benchmarks públicos (MT-Bench, AlpacaEval) |

La comparación con Llama 3 8B Instruct y Zephyr-7B-beta es orientativa: ambos son modelos alineados con benchmarks publicados, mientras que este checkpoint no declara ninguna evaluación. La principal diferencia práctica es la licencia (llama3 frente a MIT en Zephyr) y la ausencia de métricas de calidad verificables.

## Limitaciones y advertencias

- Modelo experimental de investigación: el autor advierte que una única semilla y comprobaciones de entrenamiento correctas no establecen calidad downstream, robustez ni idoneidad para despliegue.
- Sin evaluación held-out: no hay benchmarks, ni MT-Bench, ni AlpacaEval; la pérdida de entrenamiento no es una métrica de calidad.
- Riesgo de alucinación: no evaluado; el modelo base Llama 3 8B puede alucinar y este checkpoint no documenta mitigaciones.
- Sesgos: no documentados; el dataset UltraFeedback y el modelo base pueden arrastrar sesgos de género, culturales o de idioma.
- Idiomas: la card no enumera idiomas soportados; el dataset de preferencias es mayoritariamente en inglés, por lo que el ajuste puede degradar el multilingüismo del base.
- Contexto: el entrenamiento usó 2048 tokens de secuencia máxima y 1800 de prompt; no se garantiza buen comportamiento más allá de esa longitud.
- Licencia llama3: uso comercial permitido bajo la Llama 3 Community License, con obligaciones de atribución ("Built with Meta Llama 3") y restricciones de la licencia (por ejemplo, cláusula de escala de usuarios y usos prohibidos); revisar el texto completo antes de uso comercial.
- Checkpoint solo de modelo: los snapshots omiten estado de optimizador, scheduler y RNG; no son reanudables de forma exacta.
- Config serializada en float32: los tensores se subieron sin cuantizar, lo que infla el tamaño del repo (32,1 GB) y requiere conversión para despliegue eficiente.
- Sin paridad garantizada con entornos distintos (por ejemplo, B200): el autor no reclama reproducibilidad exacta fuera del entorno NEU.

## Enlaces

- Hugging Face: https://huggingface.co/jackf857/neu-l3-ultra-lscx-gdpo-r0p15-s42-20261115-a1
- Modelo base SFT: https://huggingface.co/W-61/llama-3-8b-base-sft-ultrachat-8xh200
- Dataset de preferencias: https://huggingface.co/datasets/HuggingFaceH4/ultrafeedback_binarized
- Resumen del run (archivado en el repo): `training_logs/run/run.json`
- Configuración de entrenamiento congelada: `training_logs/run/training_config.yaml`
- Model card original autogenerada: `training_logs/run/generated-model-card-original.md`
- Licencia Llama 3: https://llama.meta.com/llama3/license/
