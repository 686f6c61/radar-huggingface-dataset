# mradermacher/QVQ-72B-Preview-GGUF

## Resumen

QVQ-72B-Preview es un modelo multimodal de tipo vision-lenguaje desarrollado por el equipo Qwen (Alibaba). Se trata de un modelo experimental de razonamiento visual que combina un transformer denso de 72.700 millones de parametros con capacidad para procesar imagenes y texto de forma conjunta. La version aqui descrita es una cuantizacion GGUF realizada por mradermacher, que permite ejecutar el modelo en hardware mas modesto mediante llama.cpp y herramientas compatibles.

El modelo base, Qwen/QVQ-72B-Preview, se publico como un "preview" experimental orientado a tareas de razonamiento multimodal: interpretacion de graficos, resolucion de problemas matematicos a partir de imagenes, analisis de diagramas tecnicos y razonamiento de varios pasos sobre contenido visual. La cuantizacion de mradermacher ofrece una amplia gama de niveles de compresion (desde Q2_K hasta Q8_0), ademas de un fichero mmproj en fp16 necesario para el procesamiento de imagenes.

La relevancia de esta ficha radica en que permite desplegar un modelo multimodal de 72B en entornos locales sin necesidad de GPUs de datacenter, a costa de cierta perdida de calidad en las cuantizaciones mas agresivas. El repositorio ocupa 521,8 GB e incluye todos los niveles de cuantizacion disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal (vision-lenguaje); detalles internos no disponibles en la informacion proporcionada |
| Parametros totales | 72.706.203.648 (72,7B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0; mmproj-fp16 para vision |
| Idiomas soportados | Ingles (segun la model card) |
| Licencia | Qwen (license_name: qwen; license: other) |
| Formato de pesos | GGUF (cuantizaciones estaticas); modelo base en safetensors |

## Arquitectura y entrenamiento

El modelo base QVQ-72B-Preview es un transformer denso de 72,7B parametros con capacidad multimodal (procesamiento de imagen y texto). La informacion proporcionada no detalla la composicion del dataset de entrenamiento, el numero de tokens utilizados ni si se aplicaron tecnicas de RLHF o DPO. Tampoco se especifican innovaciones tecnicas concretas como atencion lineal o decodificacion especulativa.

La version GGUF de mradermacher es una conversion estatica (convert_type: hf, quantize_version: 2) de los pesos originales a formato llama.cpp. Incluye un fichero mmproj-fp16 de 1,5 GB que actua como suplemento multimodal, necesario para que el modelo pueda procesar imagenes. Adicionalmente, el autor ofrece cuantizaciones con imatrix (weighted/imatrix quants) en un repositorio separado, que suelen ofrecer mejor calidad por tamano que las cuantizaciones estaticas equivalentes.

## Capacidades

- Generacion de texto conversacional en ingles (tag "chat", "conversational").
- Procesamiento de imagenes: el fichero mmproj-fp16 habilita la entrada visual, lo que permite razonar sobre graficos, diagramas y capturas.
- Razonamiento multimodal de varios pasos: el modelo esta disenado para tareas que combinan percepcion visual y razonamiento logico o matematico.
- Interpretacion de contenido visual tecnico (diagramas, tablas, figuras).
- No se dispone de informacion sobre soporte de tool calling, function calling ni capacidades de agente en la documentacion proporcionada.
- Capacidades multilingues limitadas al ingles segun la model card.
- No se documentan modos especiales (thinking mode, audio) en la informacion disponible.

## Casos de uso

- Analisis de graficos financieros o cientificos: el modelo puede recibir una imagen de un grafico y responder preguntas sobre tendencias, valores o anomalias, aprovechando su naturaleza vision-lenguaje.
- Resolucion de problemas matematicos a partir de enunciados escaneados: util para digitalizar y resolver ejercicios presentes en imagenes, combinando OCR implicito con razonamiento.
- Revision de diagramas tecnicos: interpretacion de esquemas de arquitectura de software o diagramas de flujo para generar documentacion explicativa.
- Accesibilidad: descripcion detallada de imagenes e ilustraciones para generar texto alternativo o narraciones, ejecutable localmente con cuantizaciones Q4.
- Analisis de capturas de pantalla en soporte tecnico: el modelo puede interpretar una captura de error y sugerir diagnosticos, desplegado en un servidor con llama.cpp.
- Investigacion en razonamiento multimodal: al ser un modelo experimental "preview", sirve como banco de pruebas para estudiar el comportamiento de modelos VLM de gran tamano en entornos locales con cuantizacion.
- Procesamiento por lotes de documentos con figuras: extraccion de informacion de informes que combinan texto e imagenes, usando el fichero mmproj junto con una cuantizacion Q4_K_M para equilibrar calidad y velocidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin overhead de contexto):
  - Q2_K: ~30 GB
  - Q3_K_M: ~38 GB
  - IQ4_XS: ~40 GB
  - Q4_K_M: ~48 GB
  - Q5_K_M: ~55 GB
  - Q6_K: ~64 GB
  - Q8_0: ~77 GB
  - Anadir ~1,5 GB para el fichero mmproj-fp16 si se usa vision.
- GPU recomendadas: A100 80GB o H100 para Q6_K/Q8_0; A100 40GB o 2x RTX 4090 (24 GB cada una) para Q4_K_M; configuraciones multi-GPU para cuantizaciones altas.
- En consumer GPU: Q2_K y Q3_K_S pueden caber en una RTX 4090 (24 GB) solo parcialmente mediante offloading a RAM; no caben completamente en una sola GPU consumer. Se requiere offloading a RAM del sistema o configuraciones multi-GPU.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF (koboldcpp, LM Studio). Para vision es necesario soporte de mmproj en el runtime.
- Latencia y throughput: no disponibles en la informacion proporcionada. Con offloading a RAM, la latencia sera significativamente mayor que en inferencia totalmente en GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Licencia | Formato GGUF disponible |
|---|---|---|---|---|---|
| QVQ-72B-Preview (esta ficha) | 72,7B | No disponible | Si (vision) | Qwen | Si (mradermacher) |
| Qwen2-VL-72B | ~72B | No disponible en esta ficha | Si (vision) | Qwen | Si (por la comunidad) |
| Llama 3.2 Vision 90B | ~90B | No disponible en esta ficha | Si (vision) | Llama 3.2 Community | Si (por la comunidad) |
| InternVL2-76B | ~76B | No disponible en esta ficha | Si (vision) | MIT (segun version) | Parcial |

Nota: los datos de los modelos comparables no provienen de la informacion proporcionada en esta busqueda y deben verificarse en sus fichas oficiales.

## Limitaciones y advertencias

- Modelo experimental "preview": el autor original lo publica como version preliminar, lo que implica posible inestabilidad en el comportamiento y cambios no anunciados.
- Solo ingles: la model card declara unicamente el idioma ingles, lo que limita su uso en castellano sin degradacion.
- Riesgo de alucinacion: como todo modelo generativo, especialmente en tareas de razonamiento visual, puede inventar detalles no presentes en la imagen.
- Perdida de calidad por cuantizacion: las cuantizaciones Q2_K y Q3_K_M degradan notablemente la calidad; se recomienda Q4_K_M o superior para uso serio.
- Licencia Qwen: es necesario revisar los terminos en el enlace de licencia del modelo base antes de uso comercial; la licencia "other" con license_name "qwen" puede imponer restricciones.
- Requisitos de hardware elevados: incluso en Q4_K_M requiere ~48 GB, lo que excluye GPUs consumer de una sola unidad sin offloading.
- Contexto no documentado: se desconoce la longitud maxima de contexto, lo que dificulta planificar cargas de trabajo con documentos largos.
- Repositorio de 521,8 GB: la descarga completa es costosa; conviene descargar solo el fichero de cuantizacion deseado y el mmproj.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/QVQ-72B-Preview-GGUF
- Modelo base: https://huggingface.co/Qwen/QVQ-72B-Preview
- Licencia del modelo base: https://huggingface.co/Qwen/QVQ-72B-Preview/blob/main/LICENSE
- Cuantizaciones con imatrix: https://huggingface.co/mradermacher/QVQ-72B-Preview-i1-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#QVQ-72B-Preview-GGUF
- FAQ y solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
