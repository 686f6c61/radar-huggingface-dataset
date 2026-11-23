# pleasen/Gemma-4-E2B-IT-QAT

## Resumen

Gemma-4-E2B-IT-QAT es una distribución del modelo Gemma 4 E2B en su variante instruction-tuned, publicada por el usuario `pleasen` en Hugging Face. El repositorio empaqueta los pesos en formato GGUF con cuantización QAT (quantization-aware training) y aplica una serie de optimizaciones numéricas orientadas a despliegue en dispositivos con recursos limitados y entornos móviles. El dato de parámetros totales registrado en safetensors es de 4.628.569.635 (aproximadamente 4,63 mil millones), aunque la model card no detalla la distribución entre parámetros del transformer, encoder de visión y proyector multimodal.

La aportación principal del autor no es un nuevo entrenamiento, sino una reducción agresiva del footprint del componente multimodal: elimina los encoders de audio, cuantiza las capas de visión a Q8_0 o Q4_0 y convierte los embeddings posicionales de FP32 a FP16. Según la model card, estas modificaciones reducen el fichero `mmproj-BF16` a aproximadamente el 20 % de su tamaño original en la variante Q8_0. El resultado es un paquete GGUF de 13,7 GB en el repositorio, con licencia Apache 2.0 y compatibilidad declarada con endpoints.

El interés de esta ficha es doble: por un lado, documenta una receta concreta de compresión para modelos multimodales pequeños; por otro, advierte de que la información pública es muy escasa (sin pipeline declarado, sin idiomas listados, sin benchmarks y con una única descarga verificable de 485 descargas y 1 like en el momento de la consulta). Cualquier evaluación de producción debe partir de la premisa de que los datos técnicos disponibles son los que figuran en la model card y en los metadatos del repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo multimodal de la familia Gemma 4; la model card menciona capas de visión, proyector multimodal y encoders de audio eliminados, pero no detalla la arquitectura del transformer) |
| Parametros totales | 4.628.569.635 (dato de safetensors) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | QAT; capas de visión en Q8_0 o Q4_0; embeddings posicionales en FP16; repositorio en formato GGUF |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo de 13,7 GB); se menciona un fichero `mmproj-BF16` como componente multimodal |
| Pipeline | no disponible |
| Descargas / likes | 485 descargas, 1 like |
| Creado / actualizado | 2026-09-23 / 2026-11-07 |

## Arquitectura y entrenamiento

La información disponible no permite reconstruir la arquitectura completa. La model card describe un modelo de la familia Gemma 4 en variante IT (instruction-tuned) con capacidad multimodal: existen capas de visión, un proyector multimodal materializado en el fichero `mmproj-BF16` y encoders de audio que el autor ha eliminado deliberadamente. No se especifica si el backbone es un transformer denso, un MoE o una arquitectura híbrida, ni se detalla el número de capas, dimensiones ocultas o cabezas de atención.

El entrenamiento original corresponde presumiblemente al publicado por Google para Gemma 4 E2B IT; el autor de este repositorio aplica QAT y una serie de transformaciones numéricas posteriores: cuantización de las capas de visión a Q8_0 o Q4_0, conversión de embeddings posicionales de FP32 a FP16 y eliminación de los encoders de audio. No se documentan en la información proporcionada el número de tokens de entrenamiento, la composición del dataset, ni si hubo RLHF, DPO u otras etapas de alineamiento. Tampoco se detalla qué técnica concreta de QAT se empleó (por ejemplo, cuantización de pesos y activaciones, rango dinámico o esquemas por canal).

## Capacidades

- Generación de texto conversacional: el tag `conversational` y la variante IT indican uso previsto para diálogo multi-turno.
- Procesamiento de imagen: la model card menciona capas de visión y un proyector multimodal, por lo que se asume entrada de imágenes, aunque no se documentan resoluciones ni número de tokens visuales.
- Audio: los encoders de audio han sido eliminados en esta distribución, por lo que la entrada de audio no está soportada en este repositorio concreto.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; no se listan idiomas en los metadatos.
- Modo thinking explícito: no disponible en la información proporcionada.

## Casos de uso

- Asistente conversacional en dispositivo móvil: el paquete GGUF con QAT y la reducción del componente multimodal al 20 % facilitan el despliegue en teléfonos y tablets con memoria limitada, manteniendo diálogo multi-turno sin depender de la nube.
- Descripción y etiquetado de imágenes en el borde: las capas de visión cuantizadas a Q8_0/Q4_0 permiten clasificar o describir fotografías capturadas por la cámara del dispositivo sin enviar datos a un servidor, útil en aplicaciones de accesibilidad o inventario.
- Procesamiento de documentos escaneados en local: combinación de entrada visual y generación de texto para extraer información de facturas, tickets o formularios en un portátil con GPU de consumo, reduciendo exposición de datos sensibles.
- Chat de atención al cliente con contexto visual: el modelo puede recibir capturas de pantalla del usuario y responder en lenguaje natural; la ventana de contexto no está documentada, por lo que debe validarse empíricamente antes de producción.
- Prototipado rápido con llama.cpp u Ollama: al estar en GGUF, se integra en pipelines de inferencia locales para pruebas de concepto de asistentes multimodales sin infraestructura GPU dedicada.
- Investigación sobre compresión de modelos multimodales: la receta de eliminación de encoders de audio y cuantización selectiva de visión sirve como referencia reproducible para estudiar el impacto de estas decisiones en calidad y latencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa basada en el tamaño del repositorio (13,7 GB) y en los 4,63 mil millones de parámetros, una cuantización Q4 típica requeriría del orden de 3-4 GB para los pesos del lenguaje, más el componente multimodal; una Q8 se acercaría a 5-6 GB. Estas cifras son estimaciones y no proceden de la model card.
- GPU recomendadas: no disponibles. Por tamaño, cabría esperar funcionamiento en GPUs de consumo con 8-12 GB de VRAM (RTX 3060 12 GB, RTX 4070, RTX 4080), aunque no hay confirmación del autor.
- Cabe en GPU de consumo: probablemente sí en configuraciones Q4/Q8, pero no verificado en la información proporcionada.
- Opciones de despliegue: llama.cpp y Ollama por el formato GGUF; el tag `endpoints_compatible` sugiere compatibilidad con endpoints tipo Hugging Face Inference Endpoints. vLLM y TGI no están confirmados para este repositorio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Gemma-4-E2B-IT-QAT (este repo) | 4,63 B (total) | no disponible | Apache 2.0 | GGUF | Visión cuantizada, audio eliminado, orientado a móvil |
| Gemma 4 E2B IT (original de Google) | no disponible en esta ficha | no disponible | no disponible en esta ficha | safetensors | Modelo base del que deriva esta distribución; incluye audio |
| Alternativas de ~4 B multimodales | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificados en la información proporcionada |

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la información proporcionada, por lo que la comparativa cuantitativa no puede completarse.

## Limitaciones y advertencias

- Información pública muy escasa: sin pipeline declarado, sin idiomas listados, sin benchmarks y sin documentación de la arquitectura del transformer. No debe asumirse ningún comportamiento no documentado.
- Eliminación de audio: esta distribución no soporta entrada de audio, a diferencia del modelo Gemma 4 original del que deriva. Si se necesita audio, debe recurrirse a otra variante.
- Cuantización de visión: las capas visuales en Q4_0 pueden degradar la calidad en tareas de OCR fino o descripción detallada de imágenes; conviene validar con el caso de uso concreto.
- Riesgo de alucinación: inherente a los modelos generativos de este tamaño; no se documentan evaluaciones de fidelidad.
- Sesgos: no se documentan análisis de sesgo ni de seguridad en la información proporcionada.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías ni soporte; la responsabilidad de validación recae en el integrador.
- Repositorio de terceros: el autor (`pleasen`) no es el desarrollador original de Gemma; la trazabilidad de los pesos y del proceso de cuantización no está auditada en la información disponible.
- Adopción baja: 485 descargas y 1 like en el momento de la consulta; no hay evidencia de uso en producción ni de comunidad activa que reporte incidencias.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/pleasen/Gemma-4-E2B-IT-QAT
- Model card del autor: incluida en el repositorio anterior
- Paper, blog o repositorio del modelo Gemma 4 original: no disponible en la información proporcionada
- Demos o espacios asociados: no disponible en la información proporcionada
