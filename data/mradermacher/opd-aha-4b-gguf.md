# mradermacher/OPD-Aha-4B-GGUF

## Resumen

OPD-Aha-4B-GGUF es la version cuantizada en formato GGUF del modelo multimodal OPD-Aha-4B, desarrollado originalmente por CewEhao y convertida por mradermacher, un conocido creador de cuantizaciones de la comunidad de Hugging Face. Se trata de un modelo vision-language de aproximadamente 4.840 millones de parametros (4,84 B) orientado a la comprension visual de grano fino y al razonamiento multimodal, entrenado mediante tecnicas de destilacion on-policy y aprendizaje por refuerzo. Su licencia Apache 2.0 y su reducido tamano lo hacen especialmente interesante para despliegues en hardware de consumo.

La relevancia de esta publicacion radica en que ofrece el modelo original en un abanico amplio de cuantizaciones (desde Q2_K hasta f16, pasando por IQ4_XS y la serie Q3-Q8), lo que permite ejecutar un modelo multimodal de casi 5.000 millones de parametros en GPUs consumer con VRAM limitada. El repositorio incluye ademas los ficheros mmproj necesarios para el procesamiento de imagenes en llama.cpp.

No obstante, la informacion publicada es escasa: la model card del cuantizador es generica y no detalla arquitectura interna, datos de entrenamiento, longitud de contexto ni resultados de benchmarks. Esta ficha refleja unicamente los datos verificables disponibles y marca explicitamente como "no disponible" todo aquello que no se ha podido confirmar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language model (transformers); detalles internos no disponibles |
| Parametros totales | 4.841.450.496 (4,84 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16; mmproj en Q8_0 y f16 |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (quantizaciones estaticas); modelo base en safetensors |
| Tamano del repositorio | 45,4 GB (incluye todas las variantes) |
| Modelo base | CewEhao/OPD-Aha-4B |
| Cuantizador | mradermacher |
| Fecha de creacion | 14 de septiembre de 2026 |
| Ultima actualizacion | 8 de octubre de 2026 |

## Arquitectura y entrenamiento

El modelo base OPD-Aha-4B es un vision-language model segun las etiquetas del repositorio, con enfasis en comprension visual de grano fino (fine-grained visual understanding) y razonamiento multimodal. El pipeline declarado es reinforcement-learning, y las etiquetas incluyen on-policy-distillation y reinforcement-learning, lo que sugiere que el entrenamiento combino destilacion on-policy con tecnicas de RL para mejorar el razonamiento. No se dispone de informacion publica sobre el numero de tokens de entrenamiento, la composicion del dataset, la arquitectura exacta del encoder visual ni los detalles del proceso de alineamiento (RLHF/DPO).

La version aqui descrita es una cuantizacion estatica realizada por mradermacher con la herramienta de conversion a GGUF (convert_type hf, quantize_version 2). Se ofrecen tanto cuantizaciones estandar como una variante con imatrix (repositorio OPD-Aha-4B-i1-GGUF), que suele preservar mejor la calidad en tamanos bajos. Los ficheros mmproj (Q8_0 y f16) son el complemento multimodal necesario para procesar imagenes en llama.cpp. No se documentan innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Comprension de imagenes y texto (vision-language): el modelo acepta entradas multimodales y genera respuestas en lenguaje natural.
- Comprension visual de grano fino: orientado a tareas que requieren atencion a detalles pequenos en la imagen (segun las etiquetas del autor).
- Razonamiento multimodal: capacidad declarada de razonar sobre la informacion visual combinada con texto.
- Generacion de texto conversacional: el repositorio esta marcado como "conversational" y es compatible con endpoints.
- Entrenamiento con aprendizaje por refuerzo y destilacion on-policy: orientado a mejorar la calidad del razonamiento (segun metadatos).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado explicitamente; el enfasis en RL sugiere capacidades de razonamiento, pero no hay confirmacion.
- Capacidades multilingues: limitadas al ingles segun el campo language.
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Analisis de documentos e imagenes tecnicas: el modelo puede recibir una captura o fotografia junto con una pregunta y extraer informacion concreta; su enfoque en comprension de grano fino resulta adecuado para diagramas, esquemas y tablas.
- Asistencia en accesibilidad: descripcion detallada de imagenes para usuarios con discapacidad visual, aprovechando la capacidad de analisis visual fino y la generacion de texto conversacional.
- Moderacion de contenido visual: clasificacion y descripcion de imagenes en pipelines automatizados, con despliegue local en GPUs consumer gracias a las cuantizaciones Q4/Q5.
- Prototipado de asistentes multimodales en local: con Q4_K_M (3,2 GB) y el mmproj Q8_0 (0,5 GB) se puede montar un asistente visual en una RTX 3060 o superior usando llama.cpp u Ollama.
- Investigacion en destilacion on-policy y RL multimodal: el modelo sirve como referencia reproducible para estudiar el efecto de estas tecnicas en modelos de ~5 B, con pesos abiertos y licencia permisiva.
- Extraccion de informacion de capturas de pantalla: lectura de interfaces, formularios o graficos para automatizar tareas de scraping visual asistido, siempre con validacion humana dado el riesgo de alucinacion.
- Educacion y tutoria visual: explicacion de figuras cientificas o mapas en entornos con requisitos de privacidad, al poder ejecutarse integramente en local sin enviar imagenes a la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos del modelo de lenguaje): Q2_K ~2,2 GB; Q3_K_M ~2,6 GB; IQ4_XS/Q4_K_S ~3,0 GB; Q4_K_M ~3,2 GB; Q5_K_M ~3,6 GB; Q6_K ~4,1 GB; Q8_0 ~5,3 GB; f16 ~9,8 GB.
- Complemento multimodal: sumar 0,5 GB (mmproj Q8_0) o 0,8 GB (mmproj f16).
- VRAM total recomendada: entre 4 GB (Q4_K_S + mmproj Q8_0) y 11 GB (f16 + mmproj f16), mas margen para el contexto KV cache.
- GPU consumer: cabe holgadamente en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080 y RTX 4090; en 8 GB es viable con Q4_K_M y contexto moderado.
- GPU profesional: A100, H100 y L40S sin problema; utiles para servir varias instancias o contextos largos.
- Opciones de despliegue: llama.cpp (soporte multimodal via mmproj), Ollama, y servidores compatibles con endpoints GGUF; vLLM y TGI requeririan el modelo base en safetensors, no las cuantizaciones GGUF.
- Latencia y throughput: no disponibles; dependen de la GPU, la cuantizacion y la longitud de contexto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| OPD-Aha-4B (este) | 4,84 B | no disponible | Apache 2.0 | GGUF + safetensors | Vision-language, RL/on-policy distillation, solo ingles |
| Qwen2.5-VL-3B | ~3,75 B | 32.768 tokens (segun documentacion publica de Qwen) | Apache 2.0 | safetensors, GGUF comunitario | Vision-language multilingue, ampliamente adoptado |
| Qwen2.5-VL-7B | ~8,3 B | 32.768 tokens (segun documentacion publica de Qwen) | Apache 2.0 | safetensors, GGUF comunitario | Mayor capacidad, requiere mas VRAM |
| InternVL2.5-4B | ~4,2 B | no disponible en esta ficha | MIT (segun publicacion de InternVL) | safetensors, GGUF comunitario | Vision-language con buen rendimiento en benchmarks publicos |

Nota: los datos de los modelos comparativos provienen de sus respectivas documentaciones publicas; no se dispone de benchmarks del OPD-Aha-4B para una comparacion cuantitativa directa.

## Limitaciones y advertencias

- Idiomas: el modelo declara unicamente ingles; el rendimiento en castellano no esta garantizado ni documentado.
- Alucinacion: como todo modelo generativo, puede inventar detalles visuales o textuales; en tareas de extraccion de informacion conviene validar las salidas.
- Sesgos: no se documentan evaluaciones de sesgo; al entrenarse con datos no especificados, pueden persistir sesgos de los corpus de origen.
- Contexto: se desconoce la longitud maxima de contexto, lo que dificulta planificar conversaciones largas o documentos extensos.
- Cuantizaciones agresivas: Q2_K y Q3_K_S degradan la calidad; para produccion se recomienda Q4_K_M o superior, y valorar las variantes imatrix del repositorio i1.
- Vision en llama.cpp: requiere cargar correctamente el fichero mmproj junto al modelo; una configuracion incorrecta desactiva la entrada de imagenes.
- Licencia: Apache 2.0 permite uso comercial, pero el autor no ofrece garantias ni soporte; conviene revisar la model card del modelo base por si anade condiciones.
- Madurez: el modelo es reciente (septiembre de 2026) y cuenta con pocas descargas (405) y cero likes, por lo que la evidencia de la comunidad es escasa.
- Repositorio pesado: el repo completo ocupa 45,4 GB; descargar solo la cuantizacion necesaria.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/OPD-Aha-4B-GGUF
- Modelo base: https://huggingface.co/CewEhao/OPD-Aha-4B
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/OPD-Aha-4B-i1-GGUF
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#OPD-Aha-4B-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- nethype GmbH: https://www.nethype.de/
