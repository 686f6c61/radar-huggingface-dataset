# jovanseetk/cgh-hat-2026-nlp-nvfp4-gguf

## Resumen

CGH HAT NLP extractor (jovanseetk/cgh-hat-2026-nlp-nvfp4-gguf) es una cuantización NVFP4 en formato GGUF del modelo Qwen3-4B-Instruct-2507 de Alibaba/Qwen, empaquetada como parte de un proyecto de investigación clínica llamado CGH HAT. No se trata de un modelo afinado: es el checkpoint original de Qwen convertido a NVFP4 mediante llama.cpp (build b11913) y acompañado de un prompt de extracción diseñado para identificar seis datos documentados al alta hospitalaria, con evidencia por cita exacta.

El problema que aborda el proyecto es la extracción estructurada de información de informes clínicos de alta (sin datos de pacientes reales: el repositorio solo incluye tres notas sintéticas ficticias como fixtures de desarrollo). El artefacto destaca por ser un ejemplo temprano de cuantización NVFP4 (formato de 4 bits de NVIDIA) en GGUF, con verificación de procedencia detallada: checksum SHA256, inventario de tensores (253 matrices NVFP4 y 145 tensores F32 de normalización, 398 en total) y comandos de conversión documentados en `CONVERSION.md`.

El modelo base tiene 4.022.468.096 parámetros y el archivo GGUF ocupa 2,3 GB. La cuantización se valida con una prueba de humo sintética (14/14 estados de características en tres casos ficticios), pero el propio autor advierte que no se trata de validación clínica ni de una medida de fidelidad de la cuantización.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder denso (familia Qwen3) |
| Parametros totales | 4.022.468.096 (4,02 B) |
| Parametros activos | no disponible (no es MoE; todos los parámetros están activos) |
| Longitud de contexto | no disponible para el GGUF (el ejemplo de despliegue usa `--ctx-size 8192`; el contexto nativo de Qwen3-4B-Instruct-2507 es mayor, 262.144 tokens según la ficha upstream, no confirmado en esta model card) |
| Tipos de cuantizacion | NVFP4 (pesos a 4 bits, sin calibración de activaciones ni matriz de importancia); tensores de normalización en F32 |
| Idiomas soportados | inglés (etiquetado `en`; el modelo base Qwen3 soporta más idiomas, pero este artefacto solo declara inglés) |
| Licencia | Apache-2.0 (heredada del modelo upstream) |
| Formato de pesos | GGUF (NVFP4), 2.269.267.616 bytes, 398 tensores |

## Arquitectura y entrenamiento

El modelo base, Qwen3-4B-Instruct-2507, es un transformer decoder denso de 4,02 mil millones de parámetros de la serie Qwen3 de Alibaba, orientado a instrucciones. Este repositorio no contiene pesos reentrenados ni afinados: es una conversión de cuantización pura de pesos al formato NVFP4 de 4 bits, realizada con llama.cpp (build b11913, commit `7aca0d2ea8d92b56911233b822db01f9fbb1ae50`) sobre la revisión upstream `cdbee75f17c01a7cc42f958dc650907174af0554`.

Un detalle técnico relevante: la conversión es una cuantización solo de pesos (weight-only) NVFP4, no un checkpoint W4A4 de Model Optimizer ni un motor TensorRT-LLM. No se aplicó calibración de activaciones ni calibración por matriz de importancia, lo que significa que la fidelidad de la cuantización respecto al modelo original en FP16 no está cuantificada. Los datos de entrenamiento del modelo upstream (tokens, composición del dataset, RLHF/DPO) no se detallan en esta model card; deben consultarse en la ficha de Qwen/Qwen3-4B-Instruct-2507.

## Capacidades

- Generación de texto conversacional e instruccional, heredada íntegra de Qwen3-4B-Instruct-2507 (sin ajuste fino adicional).
- Extracción estructurada de hechos documentados: el proyecto lo emplea con un prompt de sistema (`extraction_prompt.txt`) para identificar seis datos de alta hospitalaria con cita exacta como evidencia.
- Validación de salida por esquema: las extracciones deben pasar comprobaciones de cita exacta, tiempo, sujeto y negación antes de considerarse válidas.
- No produce probabilidades de reingreso: el predictor tabular de reingreso del proyecto es un componente separado que no está incluido en este repositorio.
- Capacidades de razonamiento, código, matemáticas, tool calling o visión: no disponibles en la información proporcionada (corresponden al modelo upstream, no documentadas aquí).
- Multilingüe: el artefacto solo declara soporte de inglés.

## Casos de uso

- Extracción de datos de alta hospitalaria: identificar de forma estructurada seis hechos clínicos documentados (con cita textual de origen) en informes de alta, como paso previo a estudios de reingreso. Es el caso de uso para el que se empaqueta el artefacto.
- Investigación en cuantización NVFP4: servir como ejemplo reproducible de conversión GGUF NVFP4 con procedencia verificada (SHA256, inventario de tensores, comandos exactos en `CONVERSION.md`).
- Despliegue local offline en entornos restringidos: el comando de referencia ejecuta `llama-server` en localhost con modo `--offline`, adecuado para hospitales o laboratorios sin salida a internet.
- Pruebas en NVIDIA DGX Spark: el autor indica usar un build ARM64 CUDA de llama.cpp, aunque la compatibilidad real queda sin verificar.
- Prototipado de pipelines de NLP clínico con datos sintéticos: las tres notas ficticias de `synthetic_notes.jsonl` permiten desarrollar y probar el adaptador de extracción sin tocar datos de pacientes.
- Inferencia en CPU como alternativa ligera: con `--n-gpu-layers 0 --no-op-offload` el modelo puede ejecutarse sin GPU, útil para pruebas de integración.
- Base para evaluación de impacto de la cuantización: comparar el comportamiento de extracción del GGUF NVFP4 frente al modelo upstream en FP16 para medir degradación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La única validación reportada es una prueba de humo sintética: 14/14 estados de características especificados en tres casos ficticios de desarrollo, incluyendo validación de cita exacta (`synthetic_smoke_report.json`). El autor subraya que estas fixtures se usaron durante el desarrollo del prompt, por lo que no constituyen una medida de precisión clínica en datos no vistos ni de fidelidad de la cuantización. Los benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) de este artefacto cuantizado no están disponibles; los del modelo upstream deben consultarse en su ficha original.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible formalmente; el archivo GGUF pesa 2,3 GB, por lo que en principio cabe con holgura en GPUs de 8 GB o más (estimación, no dato verificado).
- GPU recomendadas: no disponible. El autor menciona explícitamente NVIDIA DGX Spark (con build ARM64 CUDA) como plataforma objetivo, pero señala que la compatibilidad real, la memoria GPU y la latencia permanecen sin probar.
- Consumer GPU: dado el tamaño de 2,3 GB, debería caber en GPUs como una RTX 3060 de 12 GB o RTX 4060 Ti de 16 GB (estimación basada en el tamaño del archivo; no verificado por el autor). También hay ruta de fallback a CPU pura.
- Despliegue: llama.cpp con soporte NVFP4 (verificado con el build b11913), ejecutando `llama-server` en modo offline. No se menciona soporte para vLLM, Ollama, TGI ni otros runtimes; de hecho, el adaptador de Transformers upstream no carga archivos GGUF.
- Latencia y throughput: no disponibles; el autor declara que no han sido medidos.
- Requisito adicional: usar el tokenizador incluido en este repositorio para el adaptador de extracción del proyecto, y un build de llama.cpp que soporte NVFP4.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CGH HAT NLP extractor (este artefacto) | 4,02 B (base) | NVFP4 GGUF (weight-only, sin calibración) | 8192 en el ejemplo de despliegue | Apache-2.0 | Repositorio privado; requiere cuenta autorizada de Hugging Face |
| Qwen/Qwen3-4B-Instruct-2507 (upstream) | 4,02 B | Sin cuantizar (safetensors) | 262.144 tokens (según ficha upstream) | Apache-2.0 | Público en Hugging Face |
| Qwen3-4B-Instruct-2507 en GGUF estándar (Q4_K_M y similares, terceros) | 4,02 B | Q4_K_M y otras variantes k-quant | 262.144 tokens | Apache-2.0 | Público, múltiples repositorios comunitarios |

Nota: la diferencia principal frente a las cuantizaciones GGUF habituales es el formato NVFP4 (4 bits estilo NVIDIA) y la ausencia de calibración por matriz de importancia, lo que puede traducirse en menor fidelidad que variantes como Q4_K_M, a cambio de un tamaño similar.

## Limitaciones y advertencias

- No es un modelo afinado clínicamente: es el checkpoint de Qwen original con un prompt de extracción; no existe validación clínica ni mejora demostrada tabular+NLP.
- Riesgo de degradación por cuantización: no se aplicó calibración de activaciones ni matriz de importancia, y el propio autor advierte que la cuantización puede alterar el comportamiento de extracción.
- La prueba de humo (14/14) usa fixtures que se emplearon durante el desarrollo del prompt: no es una evaluación con datos retenidos.
- Sesgos: no disponible en la información proporcionada; los sesgos son los heredados del modelo upstream Qwen3-4B-Instruct-2507.
- Alucinaciones: el diseño del proyecto mitiga parcialmente el riesgo exigiendo cita exacta, comprobaciones de tiempo, sujeto y negación, y validación por esquema, pero el modelo puede seguir generando citas incorrectas o mal atribuidas.
- Idioma: el artefacto solo declara soporte de inglés; su uso con notas en castellano no está evaluado.
- Acceso restringido: el repositorio es privado y requiere autenticación con una cuenta autorizada de Hugging Face.
- Compatibilidad de runtime: se necesita un build de llama.cpp con soporte NVFP4 (verificado con b11913); el adaptador de Transformers upstream no carga GGUF. La compatibilidad con DGX Spark no está probada.
- Licencia: Apache-2.0 cubre el modelo upstream y sus pesos convertidos; el código de extracción y los prompts del proyecto no tienen asignada una licencia nueva en esta model card, lo que puede limitar su reutilización.
- Uso en producción clínica: no recomendado sin validación adicional; el artefacto está orientado explícitamente a investigación.

## Enlaces

- Repositorio del modelo: https://huggingface.co/jovanseetk/cgh-hat-2026-nlp-nvfp4-gguf
- Modelo base upstream: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Repositorio fuente del proyecto: https://github.com/Jovanseetk/cgh-hat
