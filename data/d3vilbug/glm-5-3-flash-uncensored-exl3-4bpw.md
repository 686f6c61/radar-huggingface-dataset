# d3vilbug/GLM-5.3-Flash-UNCENSORED-EXL3-4bpw

## Resumen

GLM-5.3-Flash-UNCENSORED-EXL3-4bpw es una cuantización EXL3 de 4.0 bits por peso (bpw) del checkpoint FP8 `dealignai/GLM-5.3-Flash-UNCENSORED-FP8`, que a su vez deriva de `zai-org/GLM-5.3-Flash` mediante un proceso de abliteración ("CRACK") que elimina el comportamiento de rechazo. El autor de la cuantización es d3vilbug y el resultado se distribuye como un conjunto de 21 shards safetensors con un total de 87.811.157.118 parámetros (unos 176 GB en disco) y licencia MIT.

El modelo es un transformer con mezcla de expertos (MoE) del que se han cuantizado exclusivamente los expertos enrutados (`gate_proj`, `up_proj`, `down_proj`) de cada capa MoE y de la capa MTP, mientras que atención, expertos compartidos, MLP densa, embeddings, `lm_head`, normas y torre de visión se mantienen en BF16. Esta decisión de diseño preserva la calidad de los componentes sensibles y concentra la compresión donde más pesa el modelo.

La relevancia de esta ficha es doble: por un lado documenta un caso práctico de cuantización selectiva con EXL3 y codebook `mcg`; por otro, es un checkpoint "uncensored" pensado para pruebas de seguridad autorizadas y agentes de código, desplegado sobre dos NVIDIA DGX Spark (GB10) con paralelismo tensorial TP=2 mediante los kits TensorFold.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE (GLM-5.3-Flash), con capa MTP y torre de visión |
| Parámetros totales | 87.811.157.118 |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | EXL3 4.0 bpw (trellis, codebook `mcg`) solo en expertos enrutados; resto en BF16 |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (EXL3), 21 shards, ~176 GB / 164 GiB, 150.226 tensores |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de `zai-org/GLM-5.3-Flash`: un transformer con capas de mezcla de expertos, una capa de predicción multi-token (MTP) y una torre de visión que permite entrada multimodal. El checkpoint aquí descrito no reentrena el modelo: parte de los pesos FP8 abliterados de dealignai y aplica una cuantización EXL3 con `convert.py` de exllamav3 v1.6.0, con ajustes `-b 4.0 -cb mcg`. Solo se cuantizan los expertos enrutados (incluidos los de la capa MTP); los tensores FP8 restantes se desquantizan con sus escalas de bloque y se conservan en BF16.

La calibración se ejecutó sobre los propios pesos de dealignai, sin reutilizar escalas de una calibración del modelo original. El autor verificó que los expertos injertados son idénticos bit a bit a la salida del conversor y que los tensores no expertos no tocados por la abliteración coinciden bit a bit con una desquantización BF16 independiente del mismo origen FP8. La divergencia KL frente al checkpoint FP8 de referencia es de 0.054 nats, con un 92,6 % de acuerdo top-1 en la predicción del siguiente token (medido con `eval/model_diff.py`, 25 filas × 2.048 tokens). El modelo admite decodificación especulativa con el drafter `incoai/GLM-5.3-Flash-DFlash2` sin cambios.

## Capacidades

- Generación de texto conversacional y de prosa con plantilla de chat GLM-5.3-Flash.
- Razonamiento multi-paso con `reasoning_effort=high`, modo recomendado por el autor para tareas de agente.
- Generación de código verificable: la suite de pruebas del autor ejecuta el código generado para validarlo.
- Tool calling y encadenamiento de herramientas multi-paso (18/18 cadenas sembradas completadas con la guía de primer paso activada).
- Razonamiento sobre identificadores de seguridad: 0 CVE inventados en una prueba trampa de fabricación.
- Capacidades de visión a través de la torre de visión conservada en BF16 y la plantilla de chat específica para la ruta de visión de TensorFold.
- Comportamiento sin rechazo (abliterado): responde a peticiones que un modelo estándar declinaría.
- Decodificación especulativa compatible con el drafter DFlash2.

## Casos de uso

- Pruebas de penetración autorizadas: el modelo completa cadenas de herramientas multi-paso (18/18 en la suite del autor) y no rechaza prompts de pentest legítimos, lo que lo hace adecuado para agentes de reconocimiento y explotación en entornos controlados.
- Agentes de código en pipelines de CI/CD: genera código que se valida ejecutándolo, con soporte de tool calling para invocar linters, compiladores o ejecutores de tests dentro del bucle del agente.
- Automatización de tareas de seguridad ofensiva con verificación: la prueba trampa de CVE muestra que no fabrica identificadores, lo que reduce el riesgo de informes con referencias falsas.
- Asistencia a desarrolladores en análisis de código y refactorización: el contexto MoE y la preservación en BF16 de atención y capas densas mantienen la calidad en tareas de razonamiento sobre código.
- Despliegue en hardware de gama workstation: con dos DGX Spark (GB10) y TP=2 se obtienen 107,1 tok/s por stream en decodificación estructurada con el kit Python, suficiente para asistentes interactivos.
- Servicio multi-usuario con concurrencia moderada: el kit Python alcanza 430,6 tok/s agregados con c=8 en prompts estructurados, apto para un pequeño equipo interno.
- Evaluación de robustez y red-teaming de modelos: al ser un checkpoint abliterado, sirve como referencia para medir la eficacia de filtros y salvaguardas en capas externas.

## Benchmarks y rendimiento

Calidad de cuantización frente al checkpoint FP8 de origen:

| Modelo | KL vs dealignai FP8 (nats) | Acuerdo top-1 |
|---|---|---|
| Esta cuantización | 0,054 | 92,6 % |

Velocidad de decodificación (tok/s) en 2× DGX Spark, TensorFold, TP=2, `PARALLEL=8`, para tres tipos de prompt (estructurado / código / prosa):

| Kit | c=1 (por stream) | c=4 (total) | c=8 (total) |
|---|---|---|---|
| TensorFold Python v0.6.0 | 107,1 / 76,9 / 57,9 | 303,8 / 223,0 / 177,4 | 430,6 / 331,7 / 272,5 |
| TensorFold Zig (recipe 1104) | 96,3 / 61,1 / 45,1 | 233,5 / 140,9 / 121,2 | 241,4 / 186,2 / 173,9 |

Resultados de la suite de agente de pentest del autor: 43/43 con `reasoning_effort=high`, 18/18 cadenas de herramientas multi-paso, 0 CVE inventados en la prueba trampa y 0 rechazos a prompts de pentest autorizados. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: el repo ocupa ~176 GB / 164 GiB en disco; el checkpoint completo en BF16 para los tensores no expertos más los expertos EXL3 requiere un entorno con al menos esa capacidad agregada de memoria. No se dispone de una cifra de VRAM mínima publicada.
- GPU recomendadas: dos NVIDIA DGX Spark (GB10) con TP=2 es la configuración validada por el autor. No hay datos publicados para A100, H100 ni RTX 4090.
- GPU de consumo: no hay evidencia de que quepa en una RTX 4090 (24 GB) ni en una RTX 3090; el tamaño del checkpoint lo descarta en una sola unidad consumer.
- Opciones de despliegue: kits TensorFold Python v0.6.0 y Zig (recipe 1104) de MiaAI-Lab; exllamav3 como librería de referencia. No se menciona compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: ver tabla de benchmarks; el rendimiento depende del tipo de contenido por la tasa de aceptación del drafter DFlash2.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GLM-5.3-Flash-UNCENSORED-EXL3-4bpw (este) | 87,8 B | no disponible | EXL3 4.0 bpw + BF16 | MIT | Hugging Face |
| dealignai/GLM-5.3-Flash-UNCENSORED-FP8 | no disponible | no disponible | FP8 | MIT | Hugging Face |
| zai-org/GLM-5.3-Flash | no disponible | no disponible | BF16 (original) | MIT | Hugging Face |

No se dispone de datos de rendimiento de los checkpoints de origen en la información proporcionada, por lo que la comparación cuantitativa se limita a la divergencia KL y al acuerdo top-1 frente al FP8 de dealignai.

## Limitaciones y advertencias

- Modelo sin censura: ha eliminado el comportamiento de rechazo y cumplirá peticiones que un modelo estándar declinaría. La responsabilidad de uso recae en el operador; el autor lo destina a pruebas de seguridad autorizadas y agentes de código.
- Problema conocido en el primer paso de tool calling: con herramientas ofrecidas, el modelo a veces escribe el plan como texto en lugar de invocar la primera herramienta. El kit Python incluye una guía (`TF_GLM_NO_CALL_NUDGE` y `TF_GLM_NO_CALL_MIN_REASONING_CHARS=60`) que lo corrige; sin ella, las puntuaciones de cadena y de suite completa no se alcanzan.
- Plantilla de chat: la plantilla de dealignai (`chat_template.dealign.jinja`) es rechazada por el kit Python de TensorFold con visión activada ("chat template has no media branch"); se usa la plantilla GLM-5.3-Flash estándar. `generation_config.json` no incluye `repetition_penalty`, campo que TensorFold ignora de todos modos.
- Idiomas soportados: no disponibles; no se puede garantizar cobertura multilingüe más allá de lo que herede el modelo base.
- Longitud de contexto: no disponible; conviene verificarla en el modelo base antes de diseñar aplicaciones con contexto largo.
- Riesgo de alucinación: la suite del autor solo mide fabricación de CVE; no hay evaluación general de alucinación.
- Restricciones de licencia: MIT, sin restricciones comerciales declaradas, pero la licencia no exime de las obligaciones legales sobre el uso de contenido generado por un modelo sin salvaguardas.
- Compatibilidad limitada: el layout de tensores está pensado para los kits TensorFold; otros runners no están validados.
- Sesgos: no se han publicado evaluaciones de sesgo en la información disponible.

## Enlaces

- Hugging Face: https://huggingface.co/d3vilbug/GLM-5.3-Flash-UNCENSORED-EXL3-4bpw
- Modelo base (FP8 uncensored): https://huggingface.co/dealignai/GLM-5.3-Flash-UNCENSORED-FP8
- Modelo original: https://huggingface.co/zai-org/GLM-5.3-Flash
- Kit TensorFold Python: https://github.com/MiaAI-Lab/GLM-5.3-Flash-EXL3-2x-DGX-Sparks-TensorFold
- Kit TensorFold Zig: https://github.com/MiaAI-Lab/GLM-5.3-Flash-DGX-Sparks-1104
- Organización TensorFold: https://github.com/MiaAI-Lab
- exllamav3: https://github.com/turboderp-org/exllamav3
- Drafter DFlash2: https://huggingface.co/incoai/GLM-5.3-Flash-DFlash2
- Referencia de layout y plantilla: https://huggingface.co/neko-legends
