# kingjones777/Phai-A1-35B-1M-SuperRoc-GGUF

## Resumen

Phai-A1-35B-1M-SuperRoc-GGUF es una cuantización en formato GGUF del modelo multimodal PhaiModelLab/Phai-A1-35B-1M, publicada por el usuario kingjones777. El paquete está específicamente optimizado para el motor de inferencia local Super Roc sobre hardware Strix Halo (AMD Ryzen AI Max+ 395, arquitectura gfx1151), aprovechando el formato ROCm-FP4 desarrollado por el equipo ROCmFPX. El modelo base es un image-text-to-text, es decir, acepta entradas de imagen y texto y genera texto.

La relevancia de esta ficha reside en que ejemplifica el ecosistema emergente de despliegue local de modelos multimodales de gran contexto sobre APUs con memoria unificada. El autor reporta una ventana de contexto cargada de 131.072 tokens, un rendimiento de generación de entre 72 y 167 tokens por segundo según la longitud del prompt, y una perplejidad de 7,78 sobre un documento técnico en inglés de 11.000 tokens con contexto de 4096.

No obstante, conviene señalar una discrepancia importante: la model card y el nombre del repositorio indican "35B", pero el dato real de parámetros en safetensors es de 446.571.248 (aproximadamente 0,45 mil millones). Esta ficha refleja ambos datos y advierte de la inconsistencia en la sección de limitaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base multimodal image-text-to-text; el paquete GGUF se ejecuta sobre llama.cpp/ggml) |
| Parametros totales | 446.571.248 según safetensors del modelo base; el nombre del repo indica "35B" (dato contradictorio, ver limitaciones) |
| Parametros activos | no disponible |
| Longitud de contexto | 131.072 tokens (contexto cargado en la medición del autor) |
| Tipos de cuantizacion | Q4_0 con formato ROCm-FP4 (archivo principal); proyector multimodal en BF16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (archivo principal + mmproj BF16 para visión) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base PhaiModelLab/Phai-A1-35B-1M en la documentación proporcionada. El paquete es una cuantización, no un entrenamiento: el autor aplica cuantización Q4_0 con el formato ROCm-FP4 y una matriz de importancia (imatrix) generada con llama.cpp, y publica por separado un proyector multimodal (mmproj) en BF16 para habilitar la entrada de imágenes. El motor Super Roc, construido sobre llama.cpp/ggml, es el encargado de la inferencia.

Los datos de entrenamiento del modelo base (número de tokens, composición del dataset, uso de RLHF/DPO) no están disponibles en la información proporcionada. La única métrica de calidad publicada es la perplejidad de 7,78 medida sobre un documento técnico en inglés de 11.000 tokens con contexto de 4096, lo que sugiere una cuantización razonablemente fiel para ese dominio, aunque no se ofrece comparación con el modelo en precisión completa.

## Capacidades

- Generación de texto y razonamiento conversacional multi-turno.
- Procesamiento de imágenes junto con texto (pipeline image-text-to-text); el autor reporta "Vision: pass" en sus pruebas.
- Modo de razonamiento ("thinking") activable por petición mediante `chat_template_kwargs.enable_thinking`; desactivado por defecto en el comando de ejemplo.
- Soporte de tool calling / function calling: el autor reporta 7/8 llamadas correctas en modo requerido y 7/8 en modo automático.
- Generación de código: medida a 72,6 tok/s de media en dos prompts de código.
- Caché de prompt: en el segundo turno se reutilizaron 6961 de 6986 tokens de prompt.
- Capacidades multilingües: no disponibles (no se especifican idiomas en la documentación).

## Casos de uso

- Asistente local de documentación técnica con imágenes: el modelo puede procesar capturas de pantalla, diagramas o figuras junto con texto y responder preguntas sobre ellos, gracias al proyector multimodal BF16 y a la ventana de 131.072 tokens que permite cargar documentos extensos completos.
- Automatización de atención al cliente en local: con contexto largo y tool calling funcional (7/8 en las pruebas del autor), puede gestionar conversaciones multi-turno e invocar APIs internas sin enviar datos a la nube.
- Generación de código en un flujo de trabajo de desarrollo: a 72,6 tok/s en prompts de código, resulta viable para autocompletado y generación de fragmentos en un entorno de escritorio con GPU integrada.
- Análisis de documentos técnicos extensos: la perplejidad de 7,78 sobre un documento de 11.000 tokens sugiere un comportamiento aceptable en comprensión de prosa técnica en inglés; útil para resumen y extracción de datos de manuales.
- Despliegue en estaciones de trabajo con APU Strix Halo: al ejecutarse con 128 GB de memoria unificada y el motor Super Roc, permite tener un modelo multimodal con contexto de 128K en una máquina de sobremesa sin GPU dedicada de gran VRAM.
- Integración con Lemonade para prototipado: el autor documenta `lemonade pull` y `lemonade chat` para arrancar el modelo rápidamente, útil para demos y evaluación interna antes de pasar a producción.
- Procesamiento por lotes de imágenes con texto asociado (p. ej., clasificación o descripción de capturas) en local, siempre que el throughput de un solo flujo sea suficiente (el autor mide una petición a la vez).

## Benchmarks y rendimiento

Métricas medidas por el autor sobre Ryzen AI Max+ 395, 128 GB, Super Roc 0.20.0 (release candidate), una petición a la vez, el 2026-11-23:

| Metrica | Valor |
|---|---|
| Tiempo de carga (s) | 20 |
| Prompt tok/s (p1k) | 1784,2 |
| Prompt tok/s (p8k) | 1879,7 |
| Generación tok/s (p1k) | 92,69 |
| Generación tok/s (p8k) | 167,37 |
| Generación de código tok/s | 72,6 (media de 2 prompts) |
| Tool calls (requerido / automático) | 7/8 / 7/8 |
| Caché de prompt turno 2 (cacheado / prompt) | 6961 / 6986 |
| Contexto cargado | 131.072 tokens |
| Visión | pass |
| Drafter (decodificación especulativa) | off |
| Perplejidad (documento técnico inglés 11K tokens, contexto 4096) | 7,78 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM/memoria: el archivo principal GGUF ocupa 18.797.590.944 bytes (aproximadamente 18,8 GB) y el proyector multimodal 902.821.824 bytes (aproximadamente 0,9 GB); en total, cerca de 19,7 GB de pesos.
- Hardware de referencia: AMD Ryzen AI Max+ 395 (Strix Halo, gfx1151) con 128 GB de memoria unificada, que es el objetivo declarado del autor.
- GPU dedicadas: no se documentan requisitos ni pruebas en A100, H100 o RTX 4090; el formato ROCm-FP4 está orientado a ROCm y Strix Halo.
- GPU de consumo: no hay datos de ejecución en GPUs de consumo NVIDIA; el paquete está pensado para APUs AMD con memoria unificada.
- Opciones de despliegue: Super Roc (motor propio del autor, sobre llama.cpp/ggml), con integración documentada en Lemonade. Al ser GGUF, en principio es compatible con otros runners llama.cpp, aunque el formato ROCm-FP4 puede requerir builds específicos de ROCmFPX.
- Latencia y throughput: carga en 20 s; 1784-1880 tok/s de prompt; 92,69-167,37 tok/s de generación según longitud de prompt; 72,6 tok/s en código. Medido con una sola petición concurrente.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de modelos comparables de la misma categoría (multimodales GGUF para Strix Halo) ni benchmarks cruzados que permitan una comparación rigurosa.

## Limitaciones y advertencias

- Inconsistencia en el tamaño: el nombre del repositorio y la model card indican "35B", pero el recuento real de parámetros en safetensors es de 446.571.248 (aproximadamente 0,45 mil millones). Verificar el modelo base antes de asumir capacidades de un modelo de 35B.
- Idiomas soportados no documentados; no se garantiza un comportamiento correcto fuera del inglés, idioma en el que se midió la perplejidad.
- Riesgo de alucinación no cuantificado: no hay evaluaciones de veracidad ni de sesgos publicadas.
- La perplejidad de 7,78 se midió con contexto de 4096 sobre un único documento; no es representativa de todos los dominios ni de contextos largos.
- El formato ROCm-FP4 y el motor Super Roc son específicos del ecosistema del autor; la portabilidad a otros runners puede requerir builds de ROCmFPX y no está garantizada.
- Las métricas de rendimiento proceden de una release candidate de Super Roc 0.20.0 y de una sola petición concurrente; el throughput con concurrencia no está medido.
- El modelo tiene 0 likes y 144 descargas en el momento de la consulta: poca validación comunitaria.
- Licencia Apache 2.0 permite uso comercial, pero al ser una cuantización conviene revisar también la licencia y condiciones del modelo base PhaiModelLab/Phai-A1-35B-1M.
- El modo "thinking" está desactivado por defecto en el comando de ejemplo; su impacto en latencia y calidad no está medido en la documentación.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/kingjones777/Phai-A1-35B-1M-SuperRoc-GGUF
- Modelo base: https://huggingface.co/PhaiModelLab/Phai-A1-35B-1M
- Motor Super Roc: https://github.com/kingjones30/superroc
- Documentación de Lemonade para Super Roc: https://github.com/kingjones30/superroc/blob/main/docs/LEMONADE.md
- ROCmFPX (formatos ROCm-FP4): https://github.com/charlie12345/ROCmFPX
- llama.cpp / ggml: no se proporciona enlace directo en la información disponible.
