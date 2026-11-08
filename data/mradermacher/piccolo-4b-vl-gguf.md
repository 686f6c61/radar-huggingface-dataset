# mradermacher/Piccolo-4B-VL-GGUF

## Resumen

Piccolo-4B-VL-GGUF es la versión cuantizada en formato GGUF del modelo multimodal Piccolo-4B-VL, desarrollado originalmente por el equipo de AgentScope (agentscope-ai). Se trata de un modelo de visión y lenguaje (VL) de aproximadamente 4.326 millones de parámetros (4,3B) que combina un codificador visual con un modelo de lenguaje de tipo transformer para procesar conjuntamente imágenes y texto. Esta ficha cubre específicamente la conversión a GGUF realizada por mradermacher, pensada para su ejecución en entornos de inferencia local con llama.cpp y derivados.

La relevancia de esta versión radica en que permite desplegar un modelo multimodal de tamano medio en hardware de consumo, algo que el checkpoint original en safetensors dificulta por su mayor huella de memoria. El repositorio ofrece un abanico amplio de cuantizaciones (desde Q2_K hasta f16, pasando por IQ4_XS y Q8_0) junto con los ficheros mmproj necesarios para la parte visual, lo que facilita ajustar el equilibrio entre calidad y requisitos de VRAM.

La licencia Apache 2.0 y el soporte declarado únicamente para inglés condicionan su uso: es adecuado para prototipos, experimentación e integración en pipelines locales donde se priorice la privacidad y el coste, pero no sustituye a modelos frontier en tareas multilingües o de razonamiento complejo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (visión-lenguaje); detalles internos no disponibles |
| Parametros totales | 4.326.350.848 (4,3B) |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16; mmproj en Q8_0 y f16 |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (original en safetensors/transformers) |

## Arquitectura y entrenamiento

El modelo base Piccolo-4B-VL es un modelo multimodal que combina un codificador de visión con un modelo de lenguaje transformer de aproximadamente 4,3B parámetros. La versión aquí descrita es una conversión a GGUF del checkpoint original de agentscope-ai, realizada por mradermacher con la herramienta de conversión estándar (convert_type: hf) y cuantización estática (quantize_version 2, output_tensor_quantised 1). El repositorio incluye ficheros mmproj separados (Q8_0 y f16) que contienen el proyector multimodal necesario para procesar imágenes en llama.cpp.

No se dispone de información detallada sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO en el modelo original. Tampoco se documentan innovaciones técnicas específicas (atención lineal, decodificación especulativa u otras) en la información proporcionada. Las cuantizaciones son estáticas; el autor indica que las cuantizaciones ponderadas con imatrix no estaban disponibles en el momento de la publicación.

## Capacidades

- Generación de texto conversacional en inglés.
- Comprensión de imágenes combinada con texto (modelo visión-lenguaje), gracias a los ficheros mmproj incluidos.
- Procesamiento multimodal: descripción de imágenes, respuesta a preguntas sobre contenido visual y tareas que requieran correlacionar imagen y lenguaje.
- Conversación multi-turno (etiqueta conversational en el repositorio).
- Compatibilidad con endpoints (tag endpoints_compatible), lo que sugiere integración con servidores de inferencia compatibles con la API de OpenAI.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según la model card.
- Capacidades especiales (thinking mode, audio): no disponibles en la información proporcionada.

## Casos de uso

- Asistencia sobre imágenes en local: el modelo puede responder preguntas sobre capturas, diagramas o fotografías cargadas por el usuario, ejecutándose íntegramente en una máquina local con llama.cpp y los ficheros mmproj, lo que evita enviar datos sensibles a la nube.
- Moderación de contenido visual: clasificación y descripción de imágenes en pipelines internos, aprovechando la cuantización Q4_K_M (2,9 GB) para procesar lotes en hardware modesto.
- Accesibilidad: generación de descripciones textuales de imágenes para lectores de pantalla o documentación, usando la versión Q8_0 (4,7 GB) cuando se priorice la calidad de la descripción.
- Prototipado de aplicaciones multimodales: validación rápida de ideas de producto que combinen visión y lenguaje antes de invertir en modelos mayores, gracias a la variedad de cuantizaciones y a la licencia Apache 2.0.
- Extracción de información de documentos escaneados: lectura de formularios o recibos en inglés y conversión a texto estructurado, ejecutando el modelo en una estación de trabajo con GPU de consumo.
- Integración en asistentes de escritorio: despliegue con Ollama o llama.cpp como backend local de un asistente que analice capturas de pantalla y responda en inglés, con latencia controlada por la cuantización elegida.
- Investigación en visión-lenguaje: experimentación con un modelo de 4B parámetros como línea base en estudios comparativos, al poder ejecutarse en una sola GPU consumer.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos del modelo de lenguaje): Q2_K ~2,1 GB; Q3_K_M ~2,4 GB; IQ4_XS ~2,7 GB; Q4_K_M ~2,9 GB; Q5_K_M ~3,3 GB; Q6_K ~3,7 GB; Q8_0 ~4,7 GB; f16 ~8,8 GB.
- Añadir el proyector multimodal: ~0,5 GB (mmproj-Q8_0) o ~0,8 GB (mmproj-f16).
- Cabe en GPU de consumo: sí, en tarjetas con 6-8 GB de VRAM para cuantizaciones Q4/Q5, y en 12-16 GB para Q8_0 o f16 con margen para el contexto.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080 y superiores para cuantizaciones altas; A100/H100 no son necesarias para este tamano, aunque permitirían mayor paralelismo.
- Opciones de despliegue: llama.cpp, Ollama, servidores compatibles con la API de OpenAI (por la etiqueta endpoints_compatible), y cualquier runtime que soporte GGUF con mmproj para la parte visual.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Piccolo-4B-VL-GGUF (este) | 4,3B | no disponible | Visión + texto | Apache 2.0 | GGUF en HF |
| OpenCaption-4B-VL-SFT-v1.0-i1-GGUF (mradermacher) | ~4B | no disponible | Visión + texto | no disponible en la información | GGUF en HF |
| Piccolo-4B-GGUF (mradermacher) | ~4B | no disponible | Solo texto | Apache 2.0 (presumible, no confirmado) | GGUF en HF |

La comparación con modelos de la misma categoría (VL de ~4B como Qwen2.5-VL-3B o Phi-3.5-vision) no puede completarse con datos verificados en la información proporcionada; los benchmarks y contextos de esos modelos no se han incluido aquí para no inventar cifras.

## Limitaciones y advertencias

- Idioma: el modelo declara únicamente inglés; el rendimiento en castellano no está garantizado y probablemente sea deficiente.
- Contexto: la longitud de contexto no está documentada en la información disponible, lo que impide planificar cargas de documentos largos con garantías.
- Alucinación: como todo modelo generativo, puede producir descripciones de imágenes o respuestas factualmente incorrectas; requiere validación en producción.
- Sesgos: no se documentan evaluaciones de sesgo; al entrenarse presumiblemente con datos web en inglés, es probable que herede sesgos culturales y de representación.
- Cuantizaciones agresivas: Q2_K y Q3_K pueden degradar notablemente la calidad, especialmente en tareas de percepción visual; se recomienda Q4_K_M o superior para uso real.
- Licencia: Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base original (agentscope-ai/Piccolo-4B-VL) y de los datos de entrenamiento, no detalladas aquí.
- Madurez: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia comunitaria de robustez en producción.
- Tool calling y agentes: no confirmados; no deben asumirse en un diseño de sistema.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Piccolo-4B-VL-GGUF
- Modelo base: https://huggingface.co/agentscope-ai/Piccolo-4B-VL
- Página de descargas del autor: https://hf.tst.eu/model#Piccolo-4B-VL-GGUF
- Versión solo texto (referencia): https://huggingface.co/mradermacher/Piccolo-4B-GGUF
- Modelo VL comparable del mismo autor: https://huggingface.co/mradermacher/OpenCaption-4B-VL-SFT-v1.0-i1-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Peticiones de cuantización del autor: https://huggingface.co/mradermacher/model_requests
- Análisis de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
