# mradermacher/Typhon-1.2B-GGUF

## Resumen

Typhon-1.2B es un modelo de lenguaje de 1.170.340.608 parámetros (aproximadamente 1,2 mil millones) especializado en corrección tipográfica, reescritura de texto y corrección de errores gramaticales en inglés. El modelo original fue desarrollado por el usuario dennny123 bajo el identificador `dennny123/Typhon-1.2B`, y la versión aquí descrita es una cuantización GGUF realizada por mradermacher, un conocido publicador de cuantizaciones en Hugging Face.

La relevancia de esta ficha radica en que se trata de una distribución de cuantizaciones estáticas del modelo base, orientada a su despliegue en dispositivos de recursos limitados (on-device). El repositorio incluye 12 variantes GGUF que van desde Q2_K (0,6 GB) hasta f16 (2,4 GB), lo que permite ejecutar el modelo en hardware muy modesto, desde teléfonos móviles hasta portátiles sin GPU dedicada.

La información pública disponible es limitada: la model card del repositorio de cuantización es fundamentalmente una plantilla estándar de mradermacher y no incluye detalles sobre arquitectura interna, datos de entrenamiento ni resultados de benchmarks. Los datos de arquitectura, contexto y entrenamiento del modelo base no están disponibles en la información proporcionada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parámetros totales | 1.170.340.608 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | inglés (en) |
| Licencia | lfm1.0 (licencia "other", enlazada como `lfm1.0`) |
| Formato de pesos | GGUF (cuantizaciones); el modelo base usa safetensors |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base en la documentación proporcionada. El repositorio de cuantización no incluye detalles sobre el tipo de transformer, número de capas, dimensiones ocultas, mecanismos de atención ni estrategia de tokenización. Tampoco se especifican los datos de entrenamiento: número de tokens, composición del corpus, ni si se aplicaron técnicas de RLHF, DPO o ajuste supervisado.

La única información técnica relevante es la relativa al proceso de cuantización. Según los metadatos de la model card, las cuantizaciones se generaron con `quantize_version: 2`, `output_tensor_quantised: 1` y `convert_type: hf`, lo que indica una conversión desde el formato Hugging Face (safetensors) a GGUF mediante las herramientas estándar de llama.cpp. Se trata de cuantizaciones estáticas; el autor indica que las cuantizaciones ponderadas/imatrix no estaban disponibles en el momento de la publicación.

## Capacidades

- Corrección tipográfica (typo correction) en inglés: identificación y corrección de errores ortográficos y erratas.
- Reescritura de texto (text rewriting): reformulación de frases manteniendo el significado.
- Corrección de errores gramaticales (grammatical error correction) en inglés.
- Orientación a despliegue on-device: el tamaño reducido y las cuantizaciones disponibles permiten ejecución local.
- Formato conversacional: la etiqueta `conversational` sugiere soporte de plantillas de chat, aunque no se detalla el formato exacto.
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` indica que puede servirse mediante infraestructura de inferencia estándar.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según la etiqueta de idioma.
- Capacidades especiales (thinking mode, visión, audio): no disponible en la información proporcionada.

## Casos de uso

- Corrección ortográfica en editores de texto: el modelo puede integrarse en un corrector en tiempo real que detecte erratas y errores gramaticales en inglés, ejecutándose localmente en el dispositivo del usuario gracias a las cuantizaciones de 0,6-0,9 GB.
- Preprocesado de textos para pipelines de NLP: normalización y corrección de corpus en inglés antes de tareas posteriores (clasificación, extracción de entidades, traducción), reduciendo el ruido ortográfico.
- Reescritura de contenido en aplicaciones de productividad: reformulación de párrafos en herramientas de escritura asistida, con inferencia local que evita enviar datos a servicios en la nube.
- Corrección de mensajes en aplicaciones de mensajería: integración en teclados o asistentes de escritura móvil para sugerir correcciones gramaticales, aprovechando la cuantización Q4_K_S (0,8 GB) recomendada por el autor por su velocidad.
- Limpieza de datasets para entrenamiento: corrección automática de errores tipográficos en corpus de texto en inglés antes de usarlos en el ajuste de modelos mayores.
- Despliegue en entornos con privacidad estricta: procesamiento de documentos confidenciales en inglés en hardware sin conexión, donde no es viable usar APIs externas, gracias a la ejecución local vía llama.cpp u Ollama.
- Filtrado y normalización en sistemas de atención al cliente: corrección de las consultas entrantes de usuarios antes de pasarlas a un sistema de clasificación de tickets, mejorando la precisión del enrutamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (según cuantización):
  - Q2_K: ~0,6 GB de pesos; ~1-1,5 GB de VRAM total con contexto moderado.
  - Q4_K_S / Q4_K_M: ~0,8 GB de pesos; ~1,5-2 GB de VRAM total.
  - Q8_0: ~1,3 GB de pesos; ~2-2,5 GB de VRAM total.
  - f16: ~2,4 GB de pesos; ~3-3,5 GB de VRAM total.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM para las cuantizaciones bajas; no requiere GPU de datacenter (A100, H100) para funcionar, aunque podrían usarse para maximizar throughput.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090, e incluso iGPU con memoria compartida suficiente). Las cuantizaciones Q4 caben en GPUs de 4 GB o menos.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF; también puede servirse vía endpoints compatibles según la etiqueta `endpoints_compatible`. vLLM y TGI no soportan GGUF de forma nativa generalizada, por lo que requerirían el modelo base en safetensors.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. El modelo base `dennny123/Typhon-1.2B` no incluye en su model card datos de rendimiento que permitan una comparación rigurosa con alternativas de corrección gramatical o reescritura de tamaño similar. Se indica "no disponible".

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Typhon-1.2B (esta ficha) | 1,17 B | no disponible | lfm1.0 | GGUF / safetensors | Corrección y reescritura en inglés |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | Sin datos en la información proporcionada |

## Limitaciones y advertencias

- Idiomas: el modelo está etiquetado únicamente para inglés (`language: en`); su uso en castellano u otros idiomas no está respaldado por la documentación y probablemente produzca resultados deficientes.
- Sesgos conocidos: no se documentan en la información proporcionada; al no conocerse la composición del dataset de entrenamiento, no es posible evaluar sesgos de género, raza o dominio.
- Riesgo de alucinación: no cuantificado. En tareas de reescritura, existe el riesgo de que el modelo altere el significado original del texto; se recomienda validación humana en flujos críticos.
- Licencia: la licencia `lfm1.0` (etiquetada como "other") puede imponer restricciones al uso comercial. Es imprescindible revisar el archivo LICENSE del modelo base antes de desplegarlo en producción.
- Cuantizaciones de baja precisión: las variantes Q2_K y Q3_K pueden degradar notablemente la calidad; el autor recomienda Q4_K_S y Q4_K_M por su equilibrio velocidad/calidad, y Q8_0 como mejor calidad con tamaño contenido.
- Ausencia de cuantizaciones imatrix: el autor indica que no hay cuantizaciones ponderadas disponibles, lo que puede suponer una pérdida de calidad frente a alternativas imatrix en el mismo tamaño.
- Falta de documentación técnica: al no publicarse arquitectura, contexto ni datos de entrenamiento, la evaluación rigurosa del modelo queda limitada.
- Contexto: se desconoce la longitud máxima de contexto, lo que impide garantizar su comportamiento en documentos largos.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de validación por parte de la comunidad.

## Enlaces

- Repositorio Hugging Face (cuantizaciones GGUF): https://huggingface.co/mradermacher/Typhon-1.2B-GGUF
- Modelo base: https://huggingface.co/dennny123/Typhon-1.2B
- Página de descargas del autor: https://hf.tst.eu/model#Typhon-1.2B-GGUF
- README de referencia para uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- FAQ y solicitudes de cuantización de mradermacher: https://huggingface.co/mradermacher/model_requests
- Gráfico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa del autor de las cuantizaciones: https://www.nethype.de/
