# exo-jhop/ministral3-gdpr-dpo-gguf

## Resumen

ministral3-gdpr-dpo-gguf es una version cuantizada en formato GGUF del modelo exo-jhop/ministral3-gdpr-dpo-fp16, publicada por el usuario exo-jhop. Se trata de un ajuste fino orientado a tareas de asistencia legal en el contexto del RGPD (GDPR) y la normativa de la Union Europea, segun indican las etiquetas `gdpr` y `eu-legal-assistant` de la model card. El modelo cuenta con 8.489.553.920 parametros totales (aproximadamente 8,5 mil millones) y esta pensado para su despliegue mediante llama.cpp y llama-server.

El repositorio contiene una unica cuantizacion Q5_K_M (`assistant-Q5_K_M.gguf`, de unos 5,7 GiB y 5,70 bits por peso), generada a partir del modelo base en bf16 mediante `convert_hf_to_gguf.py` y `llama-quantize`. El modelo base, segun su denominacion, parece derivar de la familia Ministral, aunque la model card no confirma explicitamente la arquitectura subyacente. El ajuste por DPO (Direct Preference Optimization) sugiere un proceso de alineacion posterior al preentrenamiento, orientado al dominio legal europeo.

La relevancia de esta ficha es practica: ofrece un artefacto listo para servir en local o en infraestructura propia con llama.cpp, con una huella de memoria reducida. No obstante, el repositorio no incluye informacion sobre volumen de entrenamiento, composicion del dataset ni resultados de evaluacion, y presenta cero descargas y cero valoraciones en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (la denominacion sugiere un transformer de la familia Ministral; no confirmado en la model card) |
| Parametros totales | 8.489.553.920 (aprox. 8,5 mil millones) |
| Parametros activos | No aplica / no disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q5_K_M (5,70 BPW, archivo `assistant-Q5_K_M.gguf`, aprox. 5,7 GiB) |
| Idiomas soportados | No disponible (etiqueta `conversational`; proposito RGPD/UE, sin lista confirmada) |
| Licencia | other |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

No se dispone de detalles tecnicos confirmados sobre la arquitectura interna. La model card unicamente indica que el modelo deriva de exo-jhop/ministral3-gdpr-dpo-fp16, cuyo nombre apunta a la familia Ministral, y que el artefacto GGUF se genero con `convert_hf_to_gguf.py` en bf16 seguido de `llama-quantize` con la receta Q5_K_M. No se documentan numero de capas, dimension de embeddings, mecanismo de atencion ni si emplea decodificacion especulativa u otras optimizaciones.

Respecto al entrenamiento, el sufijo `dpo` del nombre base sugiere una etapa de alineacion mediante Direct Preference Optimization sobre un modelo previamente ajustado para tareas legales relacionadas con el RGPD. No se especifica el numero de tokens de entrenamiento, la composicion del dataset, el idioma de los datos ni si hubo etapas adicionales de RLHF o SFT. Toda esta informacion se considera no disponible.

## Capacidades

- Generacion de texto conversacional, segun la etiqueta `conversational` declarada por el autor.
- Asistencia en el dominio legal de la Union Europea y el RGPD, segun las etiquetas `gdpr` y `eu-legal-assistant`.
- Compatibilidad con endpoints (`endpoints_compatible`), lo que sugiere integracion con servicios tipo API.
- Despliegue inmediato mediante llama.cpp y llama-server.
- No se documentan capacidades de tool calling, function calling, razonamiento multi-paso, agentes, vision, audio ni modo de razonamiento explicito.
- Capacidades multilingues: no disponibles; no se confirma la lista de idiomas soportados.

Dado que no se publican evaluaciones ni documentacion funcional, las capacidades anteriores deben tratarse como indicios procedentes de las etiquetas, no como garantias verificadas.

## Casos de uso

- Asistente legal sobre RGPD en local: el modelo puede desplegarse con llama-server en infraestructura propia para responder consultas sobre obligaciones de proteccion de datos, evitando el envio de informacion sensible a terceros.
- Chatbot interno de cumplimiento normativo: uso conversacional multi-turno para resolver dudas frecuentes del personal sobre tratamiento de datos, siempre con supervision humana.
- Prototipado rapido de herramientas juridicas: gracias al formato GGUF y a llama.cpp, permite construir demos de asistentes legales sin infraestructura de GPU dedicada.
- Analisis y borrador de textos normativos: apoyo en la redaccion o revision inicial de clausulas y avisos de privacidad, sujeto a revision por profesionales.
- Servicio de FAQ automatizado para despachos: integracion en un endpoint compatible para responder preguntas recurrentes de clientes sobre la normativa europea de datos.
- Entornos con requisitos de residencia de datos: al ejecutarse en local, facilita el cumplimiento de politicas internas de soberania de datos en organismos europeos.
- Experimentacion academica sobre alineacion DPO en dominio legal: el modelo sirve como punto de partida para estudiar el comportamiento de un ajuste DPO aplicado a un dominio tan especifico como el RGPD.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K ni de evaluaciones especificas del dominio legal, y los resultados de la busqueda web no aportan datos tecnicos sobre este modelo.

## Requisitos de hardware

- Peso de la cuantizacion Q5_K_M: aproximadamente 5,7 GiB para los pesos.
- VRAM estimada para inferencia: en torno a 7-9 GiB con la cuantizacion Q5_K_M para contextos moderados, sumando pesos, cache KV y overhead del runtime (estimacion orientativa; no confirmada por el autor).
- El modelo base en bf16 (no incluido en este repositorio) requeriria del orden de 17 GB solo para los pesos.
- GPU consumer compatibles: tarjetas con 8-12 GB o mas deberian poder ejecutar la cuantizacion Q5_K_M con comodidad; RTX 3060 12 GB, RTX 4070, RTX 4080 y RTX 4090 son candidatas razonables.
- Ejecucion en CPU: viable con llama.cpp gracias al formato GGUF, a costa de menor throughput.
- Opciones de despliegue: llama.cpp y llama-server (documentados por el autor); cualquier runtime compatible con GGUF, como Ollama, tambien puede utilizarse.
- Latencia y throughput: no disponibles; no se publican mediciones.

## Comparativa con modelos similares

No se dispone de comparativas oficiales ni de resultados de evaluacion para este modelo. La siguiente tabla recoge caracteristicas publicas ampliamente conocidas de alternativas de la misma categoria de tamano, a modo de referencia, marcando como "no disponible" los datos que no pueden confirmarse para el modelo objeto de esta ficha.

| Modelo | Parametros | Contexto | Licencia | Formato | Enfoque |
|---|---|---|---|---|---|
| ministral3-gdpr-dpo-gguf | 8,5 mil millones | no disponible | other | GGUF (Q5_K_M) | Asistente legal RGPD/UE |
| exo-jhop/ministral3-gdpr-dpo-fp16 | no disponible (mismo modelo base en bf16) | no disponible | other | safetensors (bf16) | Asistente legal RGPD/UE |
| Meta Llama 3.1 8B Instruct | 8 mil millones | 128k | Llama 3.1 Community License | safetensors, GGUF | Proposito general |
| Mistral 7B Instruct | 7,3 mil millones | 32k | Apache 2.0 | safetensors, GGUF | Proposito general |

Nota: los datos de los modelos de referencia corresponden a especificaciones publicas habituales y no implican una comparacion de rendimiento verificada frente a este modelo. No se dispone de cifras de benchmarks que permitan una comparacion cuantitativa.

## Limitaciones y advertencias

- El repositorio registra 0 descargas y 0 "likes" en el momento de la consulta, por lo que no existe validacion de la comunidad ni evidencia de uso en produccion.
- No se publican resultados de benchmarks, evaluaciones de calidad ni auditorias del modelo.
- Riesgo de alucinacion: al ser un modelo de lenguaje aplicado a un dominio normativo, puede generar referencias legales inexactas o desactualizadas; cualquier salida debe verificarse con fuentes oficiales.
- Ambito potencialmente restringido al dominio legal europeo y al RGPD, con posible degradacion en tareas generales fuera de ese contexto (no confirmado).
- Idiomas soportados no documentados; no puede asegurarse un comportamiento multilingue correcto.
- Longitud de contexto desconocida, lo que dificulta planificar casos de uso con documentos extensos.
- Licencia "other": las condiciones exactas de uso, incluido el uso comercial y la redistribucion, no estan detalladas en la informacion disponible y deben verificarse con el autor antes de cualquier despliegue.
- Procedencia de los datos de entrenamiento no documentada, lo que impide evaluar sesgos o cumplimiento de derechos de autor sobre el corpus.
- La busqueda web realizada no devolvio informacion tecnica relevante sobre este modelo; los resultados obtenidos correspondian a contenido no relacionado (el grupo musical EXO).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/exo-jhop/ministral3-gdpr-dpo-gguf
- Modelo base (bf16): https://huggingface.co/exo-jhop/ministral3-gdpr-dpo-fp16
- Repositorio de llama.cpp: https://github.com/ggerganov/llama.cpp
- No se han encontrado papers, blogs, demos ni repositorios adicionales relacionados con este modelo en los resultados de la busqueda web disponible.
