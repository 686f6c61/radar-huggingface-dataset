# 42ailab/GLM-OCR-GGUF

## Resumen

GLM-OCR es un modelo de reconocimiento óptico de caracteres (OCR) y reconocimiento de documentos desarrollado por Z.ai (Zhipu AI), distribuido bajo licencia MIT. Su función es convertir el texto, las tablas y las fórmulas presentes en escaneos, capturas de pantalla y documentos en texto editable. Se trata de un modelo multimodal de tipo image-text-to-text, es decir, recibe una imagen y genera texto como salida, lo que le permite abordar tareas de extracción estructurada sin necesidad de pipelines OCR clásicos con detección de regiones y motores separados.

El repositorio `42ailab/GLM-OCR-GGUF` no contiene un modelo nuevo ni una conversión propia: es una copia byte a byte de dos ficheros GGUF (los pesos del modelo y el proyector de visión) convertidos originalmente por ggml-org y publicados en `ggml-org/GLM-OCR-GGUF`. El autor, 42ailab, mantiene esta réplica para garantizar la disponibilidad de los mismos bytes si el repositorio original se renombra, se elimina o se reemplaza. Los nombres de fichero, tamaños y digests sha256 coinciden con el original.

El modelo cuenta con 891.138.048 parámetros (aproximadamente 0,89 mil millones) y se distribuye en formato GGUF cuantizado Q8_0, con un tamaño de repositorio de 1,4 GB. Es relevante para desarrolladores que necesitan desplegar OCR de documentos de forma local, con pesos ligeros y compatibles con el ecosistema llama.cpp, y que valoran una licencia permisiva (MIT) sin restricciones de uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo multimodal image-text-to-text con proyector de visión) |
| Parametros totales | 891.138.048 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0 (pesos y proyector de visión) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (safetensors como formato de referencia upstream) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo más allá de su naturaleza multimodal de tipo image-text-to-text. El repositorio incluye dos componentes diferenciados: los pesos del modelo (`GLM-OCR-Q8_0.gguf`, 906,4 MiB) y un proyector de visión (`mmproj-GLM-OCR-Q8_0.gguf`, 462,0 MiB), lo que confirma un diseño con un codificador visual acoplado a un modelo de lenguaje mediante un proyector, patrón habitual en los modelos de visión-lenguaje. No se especifican el tipo de transformer, el número de capas, la dimensión oculta ni la estrategia de atención.

Tampoco se dispone de datos sobre el volumen de tokens de entrenamiento, la composición del dataset, ni sobre si se aplicaron técnicas de alineación como RLHF o DPO. El modelo fue construido por Z.ai (Zhipu AI) y la conversión a GGUF fue realizada por ggml-org; el repositorio de 42ailab es únicamente una réplica de esos ficheros sin modificaciones. No se documentan innovaciones técnicas específicas como decodificación especulativa o atención lineal en la información proporcionada.

## Capacidades

- Reconocimiento óptico de caracteres (OCR) sobre escaneos y capturas de pantalla.
- Extracción de texto editable a partir de imágenes de documentos.
- Reconocimiento y transcripción de tablas.
- Reconocimiento de fórmulas matemáticas presentes en documentos.
- Procesamiento multimodal image-text-to-text: entrada de imagen, salida de texto.
- Conversacional: la etiqueta `conversational` sugiere soporte de interacción por turnos, aunque no se detalla su alcance.
- Compatibilidad con endpoints (`endpoints_compatible`), lo que facilita su integración en servicios de inferencia.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles (no se especifican idiomas).
- Capacidades especiales (modo thinking, audio): no disponibles.

## Casos de uso

- Digitalización de archivos administrativos: el modelo convierte escaneos de facturas, formularios y expedientes en texto editable, lo que permite indexar y buscar su contenido en sistemas de gestión documental sin depender de motores OCR propietarios.
- Extracción de tablas de informes financieros: al reconocer tablas, puede transformar estados de resultados o balances en formato imagen a estructuras de texto que después se parsean a CSV o bases de datos.
- Procesamiento de apuntes y artículos científicos: la capacidad de reconocer fórmulas matemáticas resulta adecuada para convertir documentos técnicos escaneados en texto reutilizable en editores LaTeX o Markdown.
- Automatización de la entrada de datos en back office: integrado en un pipeline con llama.cpp, el modelo puede leer capturas de pantalla o imágenes recibidas por correo y extraer los campos relevantes para rellenar sistemas internos.
- Accesibilidad documental: conversión de documentos en imagen a texto para lectores de pantalla y herramientas de síntesis de voz, con pesos ligeros que permiten ejecución local.
- Digitalización en entornos con requisitos de privacidad: al ejecutarse en local con GGUF y licencia MIT, permite procesar documentos sensibles sin enviarlos a servicios en la nube.
- Réplica de infraestructura OCR en producción: al ser una copia byte a byte con digests verificables, sirve como espejo de alta disponibilidad para pipelines que dependen de los ficheros originales de ggml-org.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en Q8_0 suman aproximadamente 906,4 MiB y el proyector de visión 462,0 MiB, es decir, alrededor de 1,4 GB de ficheros; con overhead de contexto y runtime, se puede estimar un consumo en torno a 2-3 GB de memoria, aunque no se proporciona una cifra oficial.
- GPU recomendadas: no disponible. Por tamaño, el modelo es apto para GPUs de consumo con al menos 4 GB de VRAM.
- Cabe en GPU de consumo: sí, previsiblemente en tarjetas como RTX 3060, RTX 4060 o superiores, dado el tamaño reducido de los pesos en Q8_0.
- Opciones de despliegue: llama.cpp y derivados compatibles con GGUF (por ejemplo, Ollama), así como la aplicación 42model mediante `42model download glm-ocr:1b-q8_0`. vLLM y TGI no se mencionan como soportados en la información disponible.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la información proporcionada, por lo que no es posible establecer una comparativa cuantitativa fiable con alternativas de la misma categoría.

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| GLM-OCR (este repo) | 891.138.048 | no disponible | MIT | GGUF (Q8_0) | Hugging Face, ModelScope, 42model |
| Alternativas OCR comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El repositorio es una réplica de terceros: no es un modelo nuevo ni una conversión propia, y cualquier incidencia debe contrastarse con el repositorio original `ggml-org/GLM-OCR-GGUF`.
- Solo se distribuyen dos ficheros en cuantización Q8_0; no hay otras cuantizaciones disponibles en este repositorio.
- No se documentan los idiomas soportados, lo que impide garantizar el rendimiento en castellano u otras lenguas sin evaluación previa.
- No se especifica la longitud de contexto, un dato crítico para documentos de varias páginas.
- Riesgo de alucinación inherente a los modelos generativos: en OCR, puede producir texto plausible pero incorrecto en regiones de baja calidad o con tablas complejas; se recomienda validación en producción.
- Sesgos conocidos: no disponible.
- Licencia MIT: permite uso comercial y modificación, pero se recomienda conservar el aviso de copyright y verificar la procedencia de los pesos originales.
- Al ser una copia byte a byte, no se ofrece soporte técnico ni garantías por parte de 42ailab más allá de la integridad de los ficheros.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/42ailab/GLM-OCR-GGUF
- Repositorio en ModelScope: https://modelscope.cn/models/42ailab/GLM-OCR-GGUF
- Repositorio original de la conversión GGUF: https://www.modelscope.cn/models/ggml-org/GLM-OCR-GGUF
- Model card oficial de ZhipuAI: ZhipuAI/GLM-OCR (referenciada en el README, sin URL directa en la información disponible)
- Sitio del autor: https://42ailab.com
- Aplicación de despliegue: https://42model.com
