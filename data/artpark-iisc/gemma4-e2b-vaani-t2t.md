# ARTPARK-IISc/gemma4-e2b-vaani-t2t

## Resumen

gemma4-e2b-vaani-t2t es un modelo de traduccion texto a texto desarrollado por ARTPARK-IISc (ARTPARK, Instituto Indio de Ciencia de Bangalore) a partir del modelo base google/gemma-4-E2B-it. Su proposito es la traduccion entre el ingles y 21 lenguas indicas (incluidas hindi, bengali, tamil, telugu, kannada, malayalam, urdu, punjabi, marathi, gujarati y varias lenguas de uso minoritario como bodo, dogri, konkani, maithili, santali o sindhi), un segmento donde los modelos generales suelen rendir por debajo de lo deseable.

El modelo aborda el problema de la escasa calidad de traduccion automatica para lenguas de la India, especialmente las de bajos recursos, ofreciendo un modelo compacto de unos 5.100 millones de parametros afinado especificamente para la tarea. Al basarse en la familia Gemma, hereda una arquitectura transformer eficiente con soporte multimodal (image-text-to-text) y es compatible con el ecosistema transformers de Hugging Face.

Su relevancia radica en la combinacion de un tamano contenido (ejecutable en hardware consumer) con una cobertura linguistica amplia, lo que lo hace util para desarrolladores que necesitan integrar traduccion a lenguas indicas en aplicaciones sin depender de servicios en la nube. El acceso al repositorio esta restringido: es necesario aceptar las condiciones de uso en Hugging Face antes de descargarlo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (base Gemma 4 E2B-it, multimodal image-text-to-text) |
| Parametros totales | 5.104.297.539 (~5,1 B) |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible (heredada de Gemma 4 E2B-it; dato no publicado en la ficha) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; cuantizaciones oficiales no publicadas) |
| Idiomas soportados | ingles + 21 lenguas indicas: asamés (as), bengalí (bn), bodo (brx), dogri (doi), konkani (gom), gujaratí (gu), hindi (hi), kannada (kn), cachemiro (ks), maithili (mai), malayalam (ml), maratí (mr), manipurí (mni), nepalí (ne), oriya (or), punjabí (pa), sánscrito (sa), santali (sat), sindhi (sd), tamil (ta), telugu (te), urdu (ur) |
| Licencia | Gemma (uso restringido conforme a los terminos de Google) |
| Formato de pesos | safetensors (tamano del repo: 10,2 GB) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino (finetune) de google/gemma-4-E2B-it, un modelo transformer multimodal de la familia Gemma 4 con aproximadamente 5.100 millones de parametros. La ficha no detalla el metodo de ajuste concreto (LoRA, ajuste completo, DPO, etc.) ni la composicion exacta del dataset, aunque la etiqueta de pipeline "translation" y el nombre "vaani-t2t" (texto a texto) indican un entrenamiento supervisado sobre pares de traduccion entre ingles y las lenguas indicas cubiertas. El nombre "Vaani" remite al programa de datos linguisticos indios de ARTPARK/IISc, orientado a lenguas de bajos recursos.

Al tratarse de un finetune de un modelo base multimodal, conserva la capacidad de procesamiento de imagen-texto de Gemma 4, aunque su afinado esta orientado a la traduccion de texto. No se ha publicado informacion sobre tecnicas especiales como decodificacion especulativa, attention lineal ni datos de tokens de entrenamiento.

## Capacidades

- Traduccion texto a texto entre ingles y 21 lenguas indicas, y presumiblemente entre pares de lenguas indicas (no especificado en la ficha).
- Herencia multimodal del modelo base (image-text-to-text), aunque el afinado esta centrado en traduccion de texto.
- Generacion de texto en lenguas indicas en escritura nativa (bengalí, devanagari, tamil, etc.).
- Soporte de tool calling: no disponible (no consta en la informacion proporcionada).
- Capacidades de agentes o razonamiento multi-paso: no disponible (no consta en la informacion proporcionada).
- Al tratarse de un modelo afinado para traduccion, otras capacidades del modelo base (codigo, razonamiento general) pueden haberse degradado; no hay datos publicados al respecto.

## Casos de uso

- Localizacion de aplicaciones y servicios digitales: traduccion de interfaces, notificaciones y contenidos de apps al hindi, tamil, bengalí u otras lenguas indicas, con un modelo que se puede desplegar on-premise sin enviar datos a terceros.
- Atencion al cliente multilingue: integracion en chatbots para traducir consultas de usuarios en lenguas indicas a ingles, procesarlas con un sistema de respuesta, y devolver la respuesta traducida, aprovechando el afinado especifico en pares ingles-indio.
- Traduccion de contenidos gubernamentales y educativos: adaptacion de documentos, esquemas de bienestar o material formativo a lenguas como maithili, santali o bodo, muy poco cubiertas por los servicios comerciales.
- Agregacion de noticias y medios: traduccion automatica de prensa en lenguas indicas para plataformas de monitoreo o agregadores de contenido.
- Apoyo a e-commerce: traduccion de fichas de producto, resenas y comunicaciones entre vendedores y compradores en mercados indios regionales.
- Investigacion en PLN para lenguas de bajos recursos: uso como componente de pipelines de traduccion automatica en proyectos academicos, dado el amplio cubrimiento de lenguas minoritarias y la licencia Gemma apta para investigacion.
- Preprocesamiento de corpus multilingues: normalizacion y traduccion de datos de entrenamiento para otros sistemas de NLP en lenguas indicas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay metricas de BLEU, COMET ni comparativas con otros sistemas de traduccion para este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: con 5,1 B de parametros en FP16 (~10,2 GB de pesos), se estima entre 8 y 12 GB de VRAM; con cuantizacion a 4 bits (si se genera una version GGUF o AWQ, no publicada oficialmente) podria reducirse a unos 4-6 GB. Cifras no confirmadas por el autor.
- GPU recomendadas: RTX 3060 de 12 GB, RTX 4090, o en entornos de servidor T4, A10G o A100.
- Consumer GPU: si, deberia caber en GPUs consumer de 12 GB o mas en FP16, y en GPUs de 8 GB con cuantizacion.
- Opciones de despliegue: transformers de Hugging Face de forma nativa; por su compatibilidad con el ecosistema Gemma, es probable el soporte en llama.cpp, Ollama y vLLM (requiriendo conversion de pesos para los formatos GGUF; no hay versiones oficiales publicadas).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Tarea / cobertura | Licencia | Disponibilidad |
|---|---|---|---|---|
| ARTPARK-IISc/gemma4-e2b-vaani-t2t | ~5,1 B | Traduccion ingles <-> 21 lenguas indicas | Gemma | Gated en Hugging Face |
| AI4Bharat/IndicTrans2 (1B) | ~1,2 B | Traduccion entre 22 lenguas indicas e ingles | MIT (segun repo oficial) | Abierta en Hugging Face |
| NLLB-200-distilled-600M (Meta) | 600 M | Traduccion entre 200 lenguas, incluidas varias indicas | CC-BY-NC 4.0 | Abierta en Hugging Face |
| google/gemma-4-E2B-it (base) | ~5,1 B | Modelo general multimodal, sin afinado de traduccion | Gemma | Gated en Hugging Face |

Frente a IndicTrans2, este modelo ofrece un tamano mayor y la base multimodal de Gemma, con la ventaja de heredar capacidades generales del LLM subyacente, aunque sin benchmarks publicados que permitan comparar calidad. Frente a NLLB-200, cubre menos lenguas pero con un modelo mas grande y moderno. Nota: la comparativa se basa en caracteristicas publicas; no hay evaluaciones comparativas directas disponibles.

## Limitaciones y advertencias

- No hay benchmarks publicados: la calidad de traduccion real (fluidez, adecuacion, comportamiento en dominios especificos) no puede verificarse con datos disponibles.
- Riesgo de alucinacion tipico de modelos generales aplicados a traduccion: al ser un finetune de un LLM, puede parafrasear u omitir contenido en lugar de traducir fielmente, especialmente en textos largos.
- Cobertura linguistica limitada a 22 lenguas (ingles + 21 indicas); fuera de ese conjunto el rendimiento no esta garantizado.
- Hereda sesgos del modelo base Gemma 4 y de los datos de traduccion empleados, que pueden reflejar estereotipos de genero, religion o region presentes en corpus de lenguas indicas.
- Licencia Gemma: el uso comercial esta permitido solo bajo los terminos de la licencia Gemma de Google, que incluye restricciones de uso y requerimientos de politica de uso aceptable; hay que revisar el acuerdo antes de desplegar en produccion.
- Acceso restringido (gated): requiere aceptar condiciones en Hugging Face, lo que puede complicar despliegues automatizados o en entornos sin conexion.
- Al estar centrado en traduccion, las capacidades generales del modelo base (razonamiento, codigo) pueden estar degradadas; no se ha publicado informacion al respecto.
- Descargas muy bajas (2 en el momento de la ficha) y sin documentacion detallada publicada: el proyecto parece reciente y con poco historial de uso en produccion.

## Enlaces

- Ficha del modelo en Hugging Face: https://huggingface.co/ARTPARK-IISc/gemma4-e2b-vaani-t2t
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it
- Autor (ARTPARK-IISc): https://huggingface.co/ARTPARK-IISc
- Paper, blog oficial o repositorio de codigo: no disponible en la informacion proporcionada.
