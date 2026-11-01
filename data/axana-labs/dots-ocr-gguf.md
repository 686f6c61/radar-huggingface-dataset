# axana-labs/dots.ocr-GGUF

## Resumen

dots.ocr-GGUF es una cuantización en formato GGUF del modelo dots.ocr, desarrollada por axana-labs a partir del modelo original de rednote-hilab. Se trata de un modelo especializado en reconocimiento óptico de caracteres (OCR) y comprensión de documentos, empaquetado para su uso con la infraestructura de llama.cpp, lo que permite ejecutarlo en hardware de consumo sin necesidad de GPUs de datacenter.

El modelo original cuenta con aproximadamente 1.777 millones de parámetros (1,78 B), un tamaño contenido que lo sitúa en la gama de modelos ligeros capaces de correr en GPUs de consumo. La versión GGUF ocupa 9,3 GB en el repositorio, lo que sugiere la presencia de múltiples niveles de cuantización. La licencia MIT facilita su adopción tanto en entornos de investigación como comerciales.

Su relevancia actual radica en la combinación de una tarea especializada (OCR y parsing de documentos) con un formato de despliegue ligero y una licencia permisiva. Para desarrolladores que necesitan extraer texto y estructura de imágenes o PDFs sin depender de APIs externas, esta cuantización ofrece una alternativa autoalojada con compatibilidad con el ecosistema llama.cpp.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parámetros totales | 1.777.088.000 (1,78 B) |
| Parámetros activos | no aplica (no es MoE según los datos disponibles) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | GGUF (niveles específicos no disponibles) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (repo de 9,3 GB); el modelo base usa safetensors |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo en la documentación proporcionada. El modelo base es rednote-hilab/dots.ocr, del que no se especifican en esta ficha el tipo de transformer, la composición del dataset de entrenamiento ni si se aplicaron técnicas de RLHF o DPO. El dato objetivo disponible es el número de parámetros (1,78 B) y su orientación a tareas de OCR y comprensión de documentos.

La contribución de axana-labs consiste en la conversión a formato GGUF, lo que implica una cuantización de los pesos originales para reducir los requisitos de memoria y habilitar la inferencia con llama.cpp. El PR de llama.cpp referenciado (ggml-org/llama.cpp#17575) sugiere que la arquitectura del modelo requirió adaptaciones o soporte específico en el motor de inferencia, probablemente por el componente de visión necesario para procesar imágenes.

## Capacidades

- Reconocimiento óptico de caracteres (OCR) sobre imágenes y documentos.
- Comprensión de estructura documental (parseo de layouts, tablas y bloques de texto, según la orientación del modelo base).
- Procesamiento multimodal: el modelo base está diseñado para recibir imágenes como entrada, aunque los detalles de la interfaz no están documentados en esta ficha.
- Conversacional: la etiqueta `conversational` indica soporte de interacción por turnos.
- Compatibilidad con endpoints: etiqueta `endpoints_compatible`, orientada a despliegue como servicio.
- Soporte de tool calling: no disponible.
- Capacidades de agente y razonamiento multi-paso: no disponible.
- Idiomas: no disponible.

## Casos de uso

- Digitalización de archivos administrativos: el modelo puede procesar imágenes de documentos escaneados y extraer el texto para su indexación en sistemas de gestión documental, aprovechando su especialización en OCR.
- Extracción de datos de facturas y recibos: integrado en un pipeline de preprocesado, permite convertir imágenes de facturas en texto estructurado que alimente sistemas contables.
- Procesamiento de PDFs en lote: al ejecutarse con llama.cpp sobre hardware de consumo, puede desplegarse en servidores modestos para digitalizar grandes volúmenes de documentos sin coste por API.
- Accesibilidad: conversión de imágenes con texto (capturas, carteles, documentos fotografiados) a texto legible para lectores de pantalla.
- Enriquecimiento de bases de conocimiento: extracción de texto de imágenes almacenadas en repositorios para hacerlas buscables mediante motores de búsqueda internos.
- Despliegue en el borde (edge): su tamaño de 1,78 B parámetros y formato GGUF permiten ejecutarlo en estaciones de trabajo con GPU de consumo para tareas de OCR en tiempo casi real, sin conexión a servicios externos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: con 1,78 B parámetros, una cuantización de 4 bits requeriría aproximadamente 1-1,5 GB para los pesos, más el overhead del componente de visión y del contexto; una cuantización de 8 bits rondaría los 2-3 GB. Estas cifras son estimaciones basadas en el número de parámetros, no datos publicados.
- GPU recomendadas: cualquier GPU con al menos 6-8 GB de VRAM debería ser suficiente para las cuantizaciones más agresivas; una RTX 3060, RTX 4060 o superior es un objetivo razonable.
- Cabe en GPU de consumo: sí, previsiblemente en la mayoría de GPUs modernas con 8 GB o más, aunque la VRAM exacta depende del nivel de cuantización y de la resolución de las imágenes de entrada.
- Opciones de despliegue: llama.cpp (formato nativo), Ollama (si se publica una entrada en su registro), y servidores compatibles con la API de llama.cpp. vLLM y TGI no soportan GGUF de forma nativa para este tipo de modelo multimodal.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Especialidad |
|---|---|---|---|---|---|
| dots.ocr-GGUF (axana-labs) | 1,78 B | no disponible | MIT | GGUF | OCR / documentos |
| dots.ocr (rednote-hilab) | 1,78 B | no disponible | MIT | safetensors | OCR / documentos |
| Alternativas OCR de código abierto | no disponible | no disponible | no disponible | no disponible | OCR |

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la información proporcionada para establecer una comparación cuantitativa rigurosa.

## Limitaciones y advertencias

- La información pública sobre el modelo base y esta cuantización es muy limitada: no se documentan idiomas soportados, longitud de contexto ni arquitectura, lo que dificulta evaluar su idoneidad para casos concretos.
- Al ser una cuantización, puede producirse una degradación de la precisión en OCR respecto al modelo original en safetensors, especialmente en cuantizaciones de 4 bits o inferiores.
- Riesgo de alucinación inherente a los modelos generativos: puede inventar texto que no aparece en la imagen, un problema crítico en contextos documentales.
- No se han publicado evaluaciones de sesgo ni de robustez frente a imágenes de baja calidad, rotaciones o idiomas distintos del entrenado.
- La licencia MIT permite uso comercial sin restricciones adicionales, pero conviene verificar la licencia del modelo base (MIT según los metadatos) y de los datos de entrenamiento.
- El soporte en llama.cpp depende del PR referenciado; es posible que se requiera una versión específica o reciente del motor para cargar el modelo correctamente.
- El repositorio tiene pocas descargas (84) y ningún "like", lo que indica una adopción muy incipiente y poca validación comunitaria.

## Enlaces

- Repositorio HuggingFace de la cuantización: https://huggingface.co/axana-labs/dots.ocr-GGUF
- Modelo base: https://huggingface.co/rednote-hilab/dots.ocr
- PR de llama.cpp: https://github.com/ggml-org/llama.cpp/pull/17575
