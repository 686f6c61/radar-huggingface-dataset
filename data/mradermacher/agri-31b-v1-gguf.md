# mradermacher/agri-31b-v1-GGUF

## Resumen

agri-31b-v1 es un modelo de lenguaje especializado en agricultura, desarrollado originalmente por el usuario toiru99 y publicado en Hugging Face bajo el identificador `toiru99/agri-31b-v1`. La versión aquí documentada es la cuantización GGUF realizada por mradermacher, un conocido publicador de cuantizaciones estáticas y ponderadas para la comunidad de inferencia local. El modelo cuenta con 30.697.345.596 parámetros totales (aproximadamente 30,7 mil millones) y está etiquetado con el idioma coreano (`ko`), lo que sugiere un enfoque principal hacia el mercado agrícola coreano.

La relevancia de este modelo radica en su especialización vertical: frente a modelos generalistas, agri-31b-v1 se orienta a tareas del dominio agrícola, un nicho donde los modelos base suelen carecer de vocabulario técnico específico (fitopatología, manejo de cultivos, agroquímicos, normativa agraria). La disponibilidad de cuantizaciones GGUF desde Q2_K hasta Q8_0, además de un componente multimodal (`mmproj`), facilita su despliegue en entornos con recursos limitados o en infraestructura de inferencia local.

La licencia es `gemma`, lo que vincula el modelo a los términos de uso de Google Gemma, aunque no se especifica en la información disponible si el modelo base es un fine-tuning directo de una variante Gemma. El repositorio tiene un tamaño de 213,9 GB, coherente con la suma de todas las cuantizaciones ofrecidas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (se infiere transformer por el pipeline `transformers` y el formato GGUF, pero no se confirma) |
| Parametros totales | 30.697.345.596 (30,7 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, mmproj-Q8_0, mmproj-f16 |
| Idiomas soportados | coreano (`ko`) |
| Licencia | gemma |
| Formato de pesos | GGUF (cuantizaciones estáticas); el modelo base se distribuye en safetensors/bfloat16 |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo en la documentación proporcionada. El pipeline declarado es `transformers` y el formato de pesos original es `bfloat16`, lo que es consistente con un transformer decoder-only de aproximadamente 30,7 mil millones de parámetros. La presencia de archivos `mmproj` (multi-modal projection) en el repositorio GGUF indica que el modelo incorpora capacidades multimodales, presumiblemente visión, aunque no se detalla qué codificador visual utiliza ni cómo se integra.

Tampoco se especifican el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de alineación como RLHF, DPO o SFT. La etiqueta `agriculture` y el idioma coreano sugieren un ajuste fino sobre un corpus del dominio agrícola en coreano, pero esta afirmación no puede confirmarse con los datos disponibles. El autor de las cuantizaciones indica que se generaron cuantizaciones estáticas (`quantize_version: 2`, `output_tensor_quantised: 1`) y que existen versiones ponderadas con imatrix en un repositorio separado (`mradermacher/agri-31b-v1-i1-GGUF`).

## Capacidades

- Generación de texto conversacional en coreano, orientada al dominio agrícola.
- Capacidades multimodales: la presencia de archivos `mmproj` sugiere soporte de entrada de imágenes (visión), aunque no se detalla su alcance.
- Procesamiento de lenguaje natural especializado: vocabulario y terminología agrícola (cultivos, plagas, fertilizantes, clima).
- Formato conversacional: el tag `conversational` indica que el modelo está preparado para diálogos multi-turno.
- Compatibilidad con endpoints: el tag `endpoints_compatible` sugiere que puede servirse a través de infraestructura de inferencia estándar.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al coreano según la etiqueta de idioma declarada.

## Casos de uso

- Asistencia agronómica conversacional: el modelo puede responder consultas de agricultores sobre manejo de cultivos, identificación de síntomas de plagas o calendarios de siembra, aprovechando su ajuste al dominio agrícola y su formato conversacional.
- Análisis de imágenes de cultivos: gracias a los archivos `mmproj`, puede emplearse para interpretar fotografías de plantas o parcelas y ofrecer recomendaciones, siempre que se valide la calidad de la proyección multimodal.
- Generación de documentación técnica agrícola: redacción de fichas de producto, guías de aplicación de agroquímicos o informes de campo en coreano, con terminología especializada.
- Soporte a técnicos de cooperativas agrarias: consultas multi-turno sobre normativa, tratamientos fitosanitarios o buenas prácticas, desplegado en local para proteger datos sensibles de explotaciones.
- Chatbot para portales del sector primario: integración en webs o apps de asociaciones agrarias para resolver dudas frecuentes en coreano, con despliegue en servidores modestos mediante cuantización Q4_K_M.
- Investigación en NLP agrícola: uso como modelo base o de referencia para experimentos de dominio en coreano, aprovechando las cuantizaciones disponibles para iterar rápidamente en hardware consumer.
- Extracción de información de informes agrarios: procesamiento de textos técnicos en coreano para estructurar datos (plagas, dosis, rendimientos) en pipelines de análisis.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin overhead de contexto):
  - Q2_K: ~12 GB
  - Q4_K_M: ~18,8 GB
  - Q6_K: ~25,3 GB
  - Q8_0: ~32,7 GB
  - Añadir ~0,9-1,3 GB adicionales si se utiliza el componente multimodal (`mmproj`).
- GPU recomendadas:
  - Q4_K_M: RTX 4090 (24 GB) o A5000/A6000; también cabe en 2x RTX 3090.
  - Q6_K: RTX 4090 al límite, A6000 (48 GB) con holgura, o A100 40 GB.
  - Q8_0: A100 40 GB, H100, o 2x RTX 4090.
  - Q2_K/Q3_K: RTX 3090/4090 con margen amplio.
- Cabe en GPU consumer: sí, en RTX 3090/4090 para cuantizaciones Q4 y Q5; en GPUs de 16 GB solo con Q2_K/Q3_K y contexto reducido.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, y servidores compatibles con GGUF (koboldcpp). Para el modelo base en bfloat16 se requeriría transformers con aceleración por hardware (vLLM/TGI no confirmados para este modelo).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables del mismo dominio (agrícola en coreano) en la documentación proporcionada. Como referencia de categoría por tamaño, cabría comparar con modelos de ~30B como Qwen2.5-32B o Gemma-2-27B, pero no se han proporcionado datos de rendimiento de agri-31b-v1 que permitan una comparación rigurosa.

| Modelo | Parámetros | Contexto | Licencia | Idioma principal | Disponibilidad |
|---|---|---|---|---|---|
| agri-31b-v1 | 30,7 B | no disponible | gemma | coreano | GGUF (mradermacher) |
| Qwen2.5-32B | 32,5 B | 128K (según versión) | Apache 2.0 (mayoría) | multilingüe | amplia |
| Gemma-2-27B | 27 B | 8K | gemma | multilingüe | amplia |

Los datos de Qwen2.5-32B y Gemma-2-27B se incluyen solo como referencia de categoría; no se ha verificado su rendimiento frente a agri-31b-v1.

## Limitaciones y advertencias

- Idioma: el modelo está etiquetado únicamente para coreano; su rendimiento en castellano u otros idiomas no está garantizado y probablemente sea deficiente.
- Sesgos: no se documentan evaluaciones de sesgo; al ser un ajuste de dominio, puede reflejar sesgos presentes en corpus agrícolas coreanos (prácticas locales, sesgos comerciales de insumos).
- Alucinación: riesgo relevante en un dominio técnico donde recomendaciones incorrectas sobre dosis de agroquímicos o tratamientos fitosanitarios pueden tener consecuencias económicas o legales; se requiere validación por expertos.
- Licencia: la licencia `gemma` impone restricciones de uso comercial y obligaciones de atribución según los términos de Google Gemma; es imprescindible revisar dichos términos antes de un despliegue en producción.
- Contexto: no se ha publicado la longitud de contexto, lo que impide planificar casos de uso con documentos largos.
- Multimodalidad: la existencia de `mmproj` no garantiza calidad en visión; no hay evaluación publicada.
- Documentación escasa: la model card del cuantizador no aporta información sobre entrenamiento, datos ni evaluación, lo que limita la confianza para producción.
- Fecha de creación futura (2026-10-23) en los metadatos: conviene verificar la procedencia y vigencia del repositorio.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/agri-31b-v1-GGUF
- Modelo base: https://huggingface.co/toiru99/agri-31b-v1
- Cuantizaciones ponderadas (imatrix): https://huggingface.co/mradermacher/agri-31b-v1-i1-GGUF
- Página de descargas del cuantizador: https://hf.tst.eu/model#agri-31b-v1-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de modelos del cuantizador: https://huggingface.co/mradermacher/model_requests
- Gráfico de calidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa del cuantizador: https://www.nethype.de/
