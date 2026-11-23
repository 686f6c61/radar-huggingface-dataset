# chenyumo/MoziAier-9B-TQ

## Resumen

MoziAier 9B-TQ es un modelo denso de 9B parámetros publicado por el usuario chenyumo en Hugging Face, distribuido como cuantización ternaria (pesos restringidos a {-1, 0, +1}) en formato GGUF. Se construye sobre dos bases declaradas: el modelo preentrenado Qwen/Qwen3.5-9B y el contenedor de cuantización ternaria prism-ml/Ternary-Bonsai-2-9B-gguf. Su propuesta central es reducir el peso de los pesos a 1,86 GiB para poder ejecutar un modelo de 9B con contexto largo (150K por defecto, hasta 256K) en GPUs de consumo con 6 GB de VRAM, de forma totalmente offline.

El modelo incorpora una capa de comportamiento propia del autor (denominada "MoziAier") que incluye una plantilla de chat embebida en los pesos, un esquema de razonamiento estructurado por dimensiones, optimizaciones para tool calling y reglas anti-alucinación. Está orientado a despliegue local en llama.cpp mediante un build específico con soporte para el tipo de cuantización ternaria (GGUF type 143), que la versión oficial de llama.cpp no soporta. Los idiomas declarados son chino e inglés, con prioridad al chino.

Es relevante ahora porque explora una vía distinta a la cuantización de 4 bits: en lugar de comprimir un modelo de precisión completa, parte de un contenedor ternario ya entrenado y le añade reglas de comportamiento, logrando un artefacto muy pequeño con capacidades de visión (mediante proyector mmproj) y contexto muy largo. La contrapartida es un ecosistema de inferencia restringido y una calidad que el propio autor sitúa por debajo de los modelos de mayor tamaño de la misma familia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (base Qwen3.5-9B), pesos ternarios en contenedor PTQ1.0 |
| Parametros totales | 9B (dato de model card); el campo safetensors del repo indica 456.010.480, no disponible la discrepancia |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 150K por defecto (153.600 tokens); máximo 256K (256.000); mínimo 16K (el system prompt ocupa ~8.884 tokens) |
| Tipos de cuantizacion | Ternaria {-1, 0, +1}, PTQ1.0 (GGUF type 143); KV cache q4_0 recomendada; proyector visual Q8_0 |
| Idiomas soportados | Chino (zh) e inglés (en), con prioridad al chino |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama-cpp); pesos principales 1.997.527.168 B (1,86 GiB) + mmproj Q8_0 (595 MB) |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer denso heredado de Qwen3.5-9B, sobre el que se aplica una cuantización ternaria post-entrenamiento (PTQ) empaquetada en el contenedor PTQ1.0, con tipo GGUF 143. Cada peso toma uno de tres valores, lo que reduce el tamaño del artefacto a 1,86 GiB y disminuye el ancho de banda de memoria necesario por token generado. El modelo incluye un proyector multimodal mmproj en Q8_0 (595 MB) para entrada de imágenes y una plantilla de chat MoziAier de 26.492 caracteres embebida en `tokenizer.chat_template`, por lo que no requiere fichero de plantilla externo.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO. La model card describe incrementos de comportamiento propios del autor: un esquema de razonamiento en siete dimensiones que se despliega según la complejidad de la tarea (2 dimensiones para preguntas simples, 5 para análisis, 7 más un bucle de agente para tareas complejas), un bucle "ejecutar-evaluar-ajustar-verificar" con criterios de convergencia y reglas de salida para evitar bucles infinitos, y un formato de tool calling normalizado. El autor declara soporte de decodificación especulativa MTP, aunque los detalles técnicos no están disponibles en la información proporcionada. El razonamiento extendido viene desactivado por defecto y el autor recomienda mantenerlo así en el tamaño 9B, ya que en sus pruebas activarlo provoca bucles.

## Capacidades

- Generación de texto en chino e inglés, con prioridad declarada al chino.
- Razonamiento estructurado mediante el esquema de siete dimensiones y el bucle de agente para tareas de varios pasos.
- Tool calling / function calling con formato normalizado; el autor reporta 20/20 de éxito con el razonamiento desactivado.
- Entrada de imágenes a través del proyector mmproj Q8_0 (obligatorio Q8_0; la versión BF16 se cuelga con peticiones de imagen concurrentes).
- Contexto largo de 150K tokens por defecto y hasta 256K, apto para documentos extensos o bases de código medianas.
- Salida estructurada con línea de clasificación de tarea seguida de dimensiones de razonamiento.
- Reglas anti-alucinación: ante consultas sobre información inexistente, responde que no la encuentra en lugar de inventarla.
- Soporte de decodificación especulativa MTP según la model card (detalles no disponibles).
- Búsqueda de información actual: el modelo indica la necesidad de consultar fuentes externas en preguntas sensibles al tiempo, pero requiere una herramienta externa para ejecutarla.

## Casos de uso

- Asistente local offline en equipos con GPU de 6 GB: el peso de 1,86 GiB y la KV cache cuantizada a q4_0 permiten ejecutar el modelo íntegramente en VRAM de gama de entrada, sin conexión a internet ni servicios externos.
- Análisis de documentos largos: con 150K tokens de contexto se puede cargar un libro completo o un informe extenso y hacer preguntas sobre él en una sola sesión, algo inviable en modelos de 9B con contexto de 8K-32K.
- Revisión de bases de código medianas: los 256K tokens de contexto máximo permiten pasar varios ficheros o un repositorio pequeño y pedir explicaciones, resúmenes o detección de dependencias entre módulos.
- Extracción de datos estructurados: la salida con línea de clasificación y dimensiones fijas facilita el parseo posterior en pipelines de automatización, sin necesidad de post-procesado complejo.
- Agente con tool calling en entornos controlados: el formato normalizado y la tasa declarada de éxito permiten integrarlo en flujos que invocan APIs internas, con el bucle de agente gestionando reintentos y verificación de resultados.
- Preguntas sobre imágenes en local: con el proyector mmproj Q8_0 se pueden procesar capturas, diagramas o documentos escaneados sin enviar datos a terceros, útil en entornos con requisitos de privacidad.
- Despliegue en entornos sin conectividad: el modelo opera completamente offline una vez descargados los dos ficheros GGUF, adecuado para instalaciones aisladas o de campo.
- Atención al cliente en chino: la prioridad al chino y el contexto largo permiten gestionar conversaciones multi-turno con historial extenso e instrucciones de negocio embebidas en el system prompt.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente reporta una velocidad de inferencia de 121,1 tok/s en una AMD Radeon AI PRO R9700 (32 GB) con ROCm 7.13 y contexto de 150K, además de una tasa de éxito de 20/20 en tool calling con el razonamiento desactivado. No hay datos de MMLU, HumanEval, GSM8K ni de otras evaluaciones estándar.

## Requisitos de hardware

- VRAM estimada: el autor indica que el modelo cabe en GPUs de 6 GB de VRAM con contexto de 150K y KV cache en q4_0; para 256K de contexto recomienda 8 GB o más.
- GPU recomendadas: AMD Radeon AI PRO R9700 (32 GB) es el entorno de referencia del autor; cualquier GPU con 6-8 GB o más de VRAM debería ser suficiente para el contexto por defecto.
- GPU de consumo: sí, cabe en tarjetas de 6 GB; el límite práctico lo marca el contexto y la cuantización de la KV cache, no los pesos.
- Opciones de despliegue: llama-server del build ternario específico (linaje Prism, licencia MIT); la versión oficial de llama.cpp no soporta el tipo GGUF 143. Se recomienda `--parallel 1`, `--cache-type-k q4_0 --cache-type-v q4_0`, `--flash-attn on` y `--n-gpu-layers 999`.
- Latencia y throughput: 121,1 tok/s en R9700 con ROCm 7.13 y contexto de 150K. No hay datos para otras GPU.
- Parámetros de inferencia recomendados: `temp 0.7`, `top-p 0.8`, `top-k 20`, `min-p 0.0`, `presence-penalty 1.5`, `repeat-penalty 1.0`, `repeat-last-n 64`, `n-predict 65536`, y razonamiento desactivado (`--reasoning off` más `enable_thinking: false` en el cliente).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MoziAier 9B-TQ | 9B denso | 150K por defecto / 256K máx. | Ternaria PTQ1.0 (1,86 GiB) | Apache-2.0 | Hugging Face, ModelScope; requiere llama.cpp ternario |
| Qwen/Qwen3.5-9B | 9B denso | No disponible | Completa y cuantizaciones estándar | No disponible | Hugging Face |
| prism-ml/Ternary-Bonsai-2-9B-gguf | 9B denso | No disponible | Ternaria | No disponible | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada. La diferencia principal frente a Qwen3.5-9B es el tamaño del artefacto y el ecosistema de inferencia; frente a Ternary-Bonsai-2-9B, la adición de la plantilla de chat, las reglas de comportamiento y el proyector visual.

## Limitaciones y advertencias

- La cuantización ternaria degrada la calidad respecto al modelo base de precisión completa; el autor sitúa este modelo por debajo de los de 27B y 35B de la misma familia en evaluaciones.
- El razonamiento extendido debe permanecer desactivado en el tamaño 9B: el autor reporta bucles infinitos al activarlo, con `finish_reason=length` y contenido vacío.
- Requiere un build no oficial de llama.cpp con soporte del tipo GGUF 143; la versión estándar no puede cargar los pesos.
- El proyector visual debe ser la variante Q8_0: la versión BF16 se cuelga con peticiones de imagen concurrentes.
- El contexto mínimo es 16K porque el system prompt ocupa unos 8.844 tokens; con 4K la carga falla con error de tamaño.
- El cliente debe enviar `enable_thinking: false` de forma explícita; de lo contrario, la respuesta puede quedar vacía.
- Idiomas limitados a chino e inglés, con prioridad al chino; el rendimiento en castellano no está documentado y probablemente sea deficiente.
- Riesgo de alucinación inherente a los modelos de 9B, mitigado parcialmente por reglas anti-alucinación pero no eliminado; el autor recomienda verificación externa en preguntas sensibles al tiempo.
- La licencia Apache-2.0 permite uso comercial, pero el aviso NOTICE debe conservarse y la atribución a las bases upstream (Qwen, prism-ml) es obligatoria.
- El campo de parámetros totales del repositorio (456.010.480) no coincide con los 9B declarados en la model card; conviene verificar el artefacto antes de dimensionar infraestructura.
- No se han publicado evaluaciones independientes de sesgos, robustez ni seguridad.

## Enlaces

- Hugging Face: https://huggingface.co/chenyumo/MoziAier-9B-TQ
- ModelScope: https://modelscope.cn/models/chenyumo/MoziAier-9B-TQ
- Directorio de pesos V1.0: https://huggingface.co/chenyumo/MoziAier-9B-TQ/tree/main/V1.0
- Modelo base preentrenado: https://huggingface.co/Qwen/Qwen3.5-9B
- Base de cuantización ternaria: https://huggingface.co/prism-ml/Ternary-Bonsai-2-9B-gguf
