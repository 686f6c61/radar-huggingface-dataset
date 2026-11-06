# richardyoung/Qwen3.5-4B-ARA-heretic-MLX-4bit

## Resumen

Qwen3.5-4B-ARA-heretic-MLX-4bit es una conversión cuantizada a 4 bits en formato MLX del modelo richardyoung/Qwen3.5-4B-ARA-heretic, que a su vez es una versión con el comportamiento de rechazo eliminado (abliteration, técnica ARA) del modelo base Qwen/Qwen3.5-4B. Lo publica el desarrollador richardyoung como artefacto de investigación para Apple Silicon, y su interés radica en que permite ejecutar en hardware de Apple un modelo de 4.205.751.296 parámetros con solo 4 bits por peso y grupo de 64, manteniendo el pipeline de generación de texto y conversación.

El modelo hereda la arquitectura Qwen3.5 (identificador `qwen3_5` en los tags), con aproximadamente 4.200 millones de parámetros totales. La model card indica que la cuantización se realizó con `mlx_lm.convert -q --q-bits 4 --q-group-size 64` sobre mlx-lm 0.32.2, en modalidad affine de 4 bits. No se documentan en la información disponible la longitud de contexto, los idiomas soportados ni los detalles del dataset de entrenamiento original.

La relevancia de esta ficha es doble: por un lado, es un ejemplo práctico de despliegue local eficiente en Mac; por otro, forma parte del estudio *Is Abliteration Getting Harder? Directional vs. Optimization-Based Refusal Removal Across Generations of Open-Weight LLMs* (Young, 2026, en preparación), que analiza la robustez de los mecanismos de seguridad en modelos abiertos. El autor advierte explícitamente de que el modelo puede cumplir peticiones dañinas y lo libera únicamente para investigación sobre seguridad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Qwen3.5 (tag `qwen3_5`); detalles de capas y atención no disponibles |
| Parametros totales | 4.205.751.296 |
| Parametros activos | No aplica (no es MoE según la información disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | MLX affine 4-bit, group size 64 (`mlx_lm.convert -q --q-bits 4 --q-group-size 64`) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (MLX), tag `mlx`, `safetensors` |

## Arquitectura y entrenamiento

El modelo es un transformer de la familia Qwen3.5 con 4.205.751.296 parámetros, según los pesos en safetensors. La información disponible no detalla el número de capas, la dimensión oculta, el tipo de atención ni la composición del dataset de preentrenamiento del modelo base Qwen/Qwen3.5-4B. Tampoco se documentan fases de RLHF o DPO en la model card de esta conversión.

La innovación técnica principal de esta variante es la eliminación del comportamiento de rechazo mediante Heretic 2.0, un método de abliteration (ARA) aplicado sobre el modelo base. El autor enmarca el trabajo en un estudio comparativo entre eliminación direccional y basada en optimización a lo largo de generaciones de modelos abiertos. La cuantización posterior a 4 bits con MLX es la única diferencia respecto a los pesos de origen: las evaluaciones del paper se realizaron sobre el modelo fuente en bf16, no sobre esta versión de 4 bits. Además, Qwen3.5 arranca por defecto con una sección de razonamiento (thinking); el paper evaluó con thinking desactivado mediante `enable_thinking=False` en la plantilla de chat.

## Capacidades

- Generación de texto y conversación multi-turno (pipeline `text-generation`, tag `conversational`).
- Razonamiento con modo thinking, activado por defecto en la plantilla de chat de Qwen3.5 y desactivable con `enable_thinking=False`.
- Comportamiento de rechazo eliminado: el modelo puede cumplir peticiones que el modelo base rechazaría, lo que constituye su rasgo diferencial y su principal riesgo.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Capacidades de visión o audio: no disponible en la información proporcionada.

## Casos de uso

- Investigación sobre seguridad de modelos: el modelo sirve como sujeto de estudio para medir la eficacia y robustez de la abliteration frente a mecanismos de rechazo, comparando el modelo heretic con el base Qwen3.5-4B en baterías de prompts dañinos.
- Evaluación de métodos de eliminación de rechazo: permite reproducir y extender los experimentos del paper de Young (2026) sobre eliminación direccional frente a la basada en optimización, usando los pesos ya cuantizados.
- Despliegue local en Apple Silicon: con 4 bits y grupo de 64, el modelo se ejecuta mediante `mlx_lm.generate` en Macs con memoria unificada, útil para prototipos de generación de texto sin GPU dedicada.
- Pruebas de robustez de filtros de salida: útil para validar clasificadores de contenido y capas de moderación en pipelines que deben detectar respuestas no seguras generadas por modelos sin rechazo.
- Experimentos de cuantización: al ser una conversión MLX 4-bit de un modelo bf16, permite comparar degradación de calidad entre bf16 y 4 bits en tareas de generación y razonamiento.
- Docencia y divulgación sobre alineamiento: sirve para ilustrar en entornos controlados cómo se modifica el comportamiento de un LLM mediante intervenciones en el espacio de activaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica que las evaluaciones del paper se ejecutaron sobre el modelo fuente en bf16 y no sobre esta versión cuantizada a 4 bits, por lo que no existen métricas propias para esta conversión.

## Requisitos de hardware

- VRAM/memoria estimada para inferencia: con 4.205.751.296 parámetros a 4 bits, los pesos ocupan aproximadamente 2,1 GB; con overhead de cuantización (grupo de 64) y caché KV, el consumo realista se sitúa en torno a 3-4 GB de memoria unificada.
- GPU recomendadas: el formato MLX está diseñado para Apple Silicon (series M1, M2, M3, M4); no es compatible de forma nativa con CUDA.
- Cabe en GPU de consumo: sí, en cualquier Mac con Apple Silicon y al menos 8 GB de memoria unificada; en equipos de 16 GB o más hay margen holgado para contextos largos.
- Opciones de despliegue: `mlx-lm` (comando `mlx_lm.generate`), con instalación mediante `pip install mlx-lm`; otras herramientas MLX del ecosistema Apple. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI en formato MLX.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| richardyoung/Qwen3.5-4B-ARA-heretic-MLX-4bit | 4.205.751.296 | No disponible | MLX 4-bit, grupo 64 | Apache 2.0 | Conversión MLX para Apple Silicon; rechazo eliminado |
| richardyoung/Qwen3.5-4B-ARA-heretic | No disponible | No disponible | bf16 (origen) | Apache 2.0 | Modelo fuente sin cuantizar; evaluado en el paper |
| Qwen/Qwen3.5-4B | No disponible | No disponible | No disponible | No disponible | Modelo base original con comportamiento de rechazo intacto |

No se dispone de datos de rendimiento comparado entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- El comportamiento de rechazo ha sido eliminado de forma deliberada; el modelo puede cumplir peticiones dañinas o ilegales. El autor lo restringe a investigación sobre mecanismos de seguridad.
- Riesgo elevado de uso indebido: no debe desplegarse en producción orientada a usuarios finales sin capas adicionales de moderación.
- La cuantización a 4 bits puede degradar la calidad respecto al modelo fuente en bf16; las evaluaciones del paper no cubren esta versión.
- El modo thinking está activo por defecto; para reproducir las condiciones del paper debe desactivarse con `enable_thinking=False`.
- No se documentan sesgos específicos, idiomas soportados ni longitud de contexto, lo que dificulta evaluar su idoneidad en escenarios multilingües o de contexto largo.
- La licencia Apache 2.0 permite uso comercial según los términos de la licencia, pero el uso responsable recae en el usuario; el propio autor desaconseja aplicaciones productivas sin salvaguardas.
- El formato MLX limita el despliegue a hardware Apple Silicon; no es portable directamente a CUDA sin reconversión.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/richardyoung/Qwen3.5-4B-ARA-heretic-MLX-4bit
- Modelo fuente: https://huggingface.co/richardyoung/Qwen3.5-4B-ARA-heretic
- Modelo base original: https://huggingface.co/Qwen/Qwen3.5-4B
- Repositorio MLX: https://github.com/ml-explore/mlx
- Estudio de referencia: *Is Abliteration Getting Harder? Directional vs. Optimization-Based Refusal Removal Across Generations of Open-Weight LLMs* (Young, 2026, en preparación); sin URL disponible en la información proporcionada.
