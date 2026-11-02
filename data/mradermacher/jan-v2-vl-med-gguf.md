# mradermacher/Jan-v2-VL-med-GGUF

## Resumen

Jan-v2-VL-med-GGUF es la versión cuantizada en formato GGUF del modelo multimodal janhq/Jan-v2-VL-med, publicada por el usuario mradermacher, especializado en la conversión de pesos a formatos ligeros para inferencia local. El modelo base es un modelo de lenguaje y visión de aproximadamente 8.190 millones de parámetros, desarrollado por Jan (janhq), el equipo detrás de la aplicación de escritorio Jan, orientado a tareas de agente y conversación multimodal en inglés.

Esta ficha describe la variante GGUF, que no introduce cambios arquitectónicos respecto al modelo original: únicamente reempaqueta los pesos en cuantizaciones de 2 a 16 bits para permitir su ejecución en hardware de consumo mediante llama.cpp y derivados. El repositorio incluye además los ficheros mmproj (proyector multimodal) en Q8_0 y f16, necesarios para procesar imágenes junto al modelo de lenguaje.

Su relevancia actual radica en que permite desplegar un modelo visión-lenguaje de 8B con licencia Apache 2.0 en estaciones de trabajo modestas, algo poco habitual en la categoría de modelos multimodales, y con soporte declarado para flujos de agente. La información pública disponible sobre el modelo base es limitada, por lo que varios apartados de esta ficha se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base janhq/Jan-v2-VL-med; transformer multimodal visión-lenguaje, detalles no publicados en la información disponible) |
| Parametros totales | 8.190.735.360 (8,19 B) |
| Parametros activos | no aplica (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16; proyector multimodal mmproj en Q8_0 y f16 |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo base en la documentación proporcionada. Por el nombre y las etiquetas del repositorio (VL, agent, transformers), se trata de un modelo multimodal que combina un backbone de lenguaje con un proyector visual, empaquetado en el ecosistema transformers y exportado a GGUF con soporte de ficheros mmproj separados. El número de parámetros (8,19 B) corresponde a los pesos en safetensors del modelo base.

Tampoco se han publicado en la información disponible datos sobre el volumen de tokens de entrenamiento, la composición del dataset, ni si se aplicaron fases de RLHF, DPO u otras técnicas de alineación. La model card del repositorio GGUF es puramente técnica y se limita a describir el proceso de cuantización estática (quantize_version 2, convert_type hf) y a listar los ficheros generados. Para detalles de entrenamiento habría que consultar la model card del modelo original janhq/Jan-v2-VL-med, que no forma parte de la información suministrada.

## Capacidades

- Generación de texto conversacional en inglés, con soporte de diálogo multi-turno (etiqueta conversational).
- Procesamiento de imágenes: el repositorio incluye ficheros mmproj (Q8_0 y f16) que habilitan la entrada visual junto al modelo de lenguaje.
- Orientación a flujos de agente: la etiqueta agent en el repositorio sugiere soporte para razonamiento multi-paso y uso de herramientas, aunque no se detalla el mecanismo concreto.
- Compatibilidad con endpoints: la etiqueta endpoints_compatible indica que puede servirse mediante APIs compatibles con el ecosistema de inferencia habitual.
- Capacidades multilingües: limitadas al inglés según la model card.
- No se documentan en la información disponible capacidades específicas de modo thinking, audio, matemáticas avanzadas o generación de código.

## Casos de uso

- Asistente de escritorio con entrada visual: integrado en la aplicación Jan o en clientes compatibles, el modelo puede responder preguntas sobre capturas de pantalla o imágenes adjuntas en una conversación, usando la cuantización Q4_K_M para mantener una huella de memoria de unos 5 GB.
- Análisis de documentos escaneados en local: con los ficheros mmproj cargados, se pueden extraer descripciones y responder preguntas sobre facturas, formularios o páginas escaneadas sin enviar datos a la nube, lo que resulta adecuado para entornos con requisitos de privacidad.
- Automatización de agentes con percepción visual: la etiqueta agent y la compatibilidad con endpoints permiten conectarlo a frameworks de agentes que necesiten interpretar el estado de una interfaz gráfica o de una imagen como parte de un bucle de decisiones.
- Prototipado rápido de aplicaciones visión-lenguaje: al ser GGUF con licencia Apache 2.0, un equipo puede validar una idea de producto multimodal en una GPU de consumo antes de invertir en infraestructura mayor.
- Despliegue en estaciones de trabajo sin GPU dedicada de gama alta: las cuantizaciones Q2_K a Q4_K_S (3,4 a 4,9 GB) permiten ejecución en CPU con llama.cpp u Ollama, útil para demos y pruebas internas.
- Servicio de soporte técnico con imágenes: un chatbot que reciba capturas de errores o fotos de producto y genere respuestas en inglés, sirviendo el modelo con llama.cpp server o un endpoint compatible y la cuantización Q5_K_M para equilibrar calidad y latencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos del modelo de lenguaje): aproximadamente 3,5 GB con Q2_K, 5 GB con Q4_K_M, 6 GB con Q5_K_M, 7 GB con Q6_K y 9 GB con Q8_0. Hay que sumar entre 0,9 y 1,3 GB del proyector multimodal si se procesan imágenes, más el espacio para la caché KV, que depende del contexto configurado.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080 y RTX 4090 para las cuantizaciones altas con contexto amplio; A100 o H100 no son necesarias para un modelo de este tamaño y solo tendrían sentido para servir muchas peticiones concurrentes.
- Cabe en GPU de consumo: sí, en la mayoría de tarjetas con 8 GB o más usando Q4_K_M o Q5_K_M; con 6 GB es viable Q4_K_S o IQ4_XS con contexto reducido. Las cuantizaciones Q2_K y Q3_K permiten incluso ejecución en CPU.
- Opciones de despliegue: llama.cpp (incluido llama-server), Ollama, LM Studio y cualquier runtime compatible con GGUF y mmproj. vLLM y TGI no consumen GGUF de forma nativa, por lo que para esos motores habría que usar el modelo base en safetensors.
- Latencia y throughput: no disponibles en la información proporcionada; dependerán del hardware, de la cuantización y de la longitud de contexto.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato disponible | Notas |
|---|---|---|---|---|---|
| Jan-v2-VL-med (esta ficha, GGUF) | 8,19 B | no disponible | Apache 2.0 | GGUF, safetensors (base) | Multimodal, orientado a agente, solo inglés |
| Qwen2.5-VL-7B | 7 B aprox. | no disponible en esta ficha | Apache 2.0 | safetensors, GGUF de terceros | Multimodal con amplio soporte multilingüe |
| Llama 3.2 11B Vision | 11 B aprox. | no disponible en esta ficha | Licencia comunitaria Llama | safetensors, GGUF de terceros | Multimodal, requiere aceptar licencia |
| MiniCPM-V 2.6 | 8 B aprox. | no disponible en esta ficha | Licencia propia del modelo | safetensors, GGUF de terceros | Multimodal optimizado para dispositivos |

Los datos de los modelos alternativos se incluyen a título orientativo de categoría; no se dispone de comparaciones de rendimiento verificadas en la información proporcionada.

## Limitaciones y advertencias

- El modelo solo declara soporte de inglés; el rendimiento en castellano u otros idiomas no está garantizado.
- No se han publicado benchmarks ni evaluaciones de sesgo en la información disponible, por lo que el riesgo de alucinación y los sesgos del modelo base no están cuantificados.
- La longitud de contexto no está documentada, lo que impide planificar despliegues con ventanas largas sin verificar experimentalmente el comportamiento.
- Esta variante GGUF es una cuantización de terceros: las cuantizaciones de 2 y 3 bits pueden degradar de forma apreciable la calidad, especialmente en tareas visuales; se recomienda Q4_K_M o superior para producción.
- Para usar la entrada visual es imprescindible cargar el fichero mmproj correspondiente junto al modelo; sin él, el modelo funciona solo como modelo de texto.
- Aunque la licencia es Apache 2.0, conviene revisar la model card del modelo base janhq/Jan-v2-VL-med por si hubiera condiciones adicionales sobre los datos de entrenamiento.
- El repositorio tiene un volumen de descargas bajo (451 en el momento de la consulta) y ningún like, lo que reduce la validación comunitaria disponible.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Jan-v2-VL-med-GGUF
- Modelo base: https://huggingface.co/janhq/Jan-v2-VL-med
- Cuantizaciones con imatrix: https://huggingface.co/mradermacher/Jan-v2-VL-med-i1-GGUF
- Página de descargas del autor: https://hf.tst.eu/model#Jan-v2-VL-med-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de cuantización del autor: https://huggingface.co/mradermacher/model_requests
- Comparativa de calidad de cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
