# mradermacher/Saul-Legal-Calme-Instruct-GGUF

## Resumen

Saul-Legal-Calme-Instruct-GGUF es la version cuantizada en formato GGUF del modelo arcee-ai/Saul-Legal-Calme-Instruct, publicada por mradermacher. No se trata de un modelo entrenado desde cero, sino de una conversión a GGUF de un merge (fusion) de dos modelos de 7B: MaziyarPanahi/Calme-7B-Instruct-v0.1.1 y Equall/Saul-Instruct-v1, combinados mediante mergekit. El objetivo es doble: por un lado, heredar las capacidades de instruccion y conversacion de Calme; por otro, incorporar la especializacion en dominio legal y financiero de Saul-Instruct-v1.

El modelo cuenta con 7.241.732.096 parametros totales (aproximadamente 7,24 mil millones) y esta pensado para tareas de generacion de texto conversacional en ingles. La ficha que nos ocupa corresponde especificamente a los ficheros GGUF estaticos generados por mradermacher, que permiten ejecutar el modelo en hardware de consumo mediante llama.cpp y herramientas compatibles, sin necesidad de GPU de datacenter.

La relevancia de esta publicacion radica en que facilita el despliegue local de un modelo especializado en legal y conversacion con cuantizaciones que van desde 2,8 GB (Q2_K) hasta 14,6 GB (f16), lo que lo hace accesible en equipos con 8-16 GB de VRAM o incluso en CPU. La licencia Apache 2.0 permite uso comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (merge de dos modelos de 7B; arquitectura base no detallada en la informacion disponible) |
| Parametros totales | 7.241.732.096 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones estaticas); modelo base en safetensors |

## Arquitectura y entrenamiento

El modelo es el resultado de un merge realizado con mergekit a partir de MaziyarPanahi/Calme-7B-Instruct-v0.1.1 y Equall/Saul-Instruct-v1. Al tratarse de una fusion de pesos, no hay un entrenamiento adicional documentado en la informacion disponible: no se especifican tokens de entrenamiento, composicion del dataset, ni si hubo RLHF o DPO en esta etapa. Las capacidades de instruccion y conversacion provienen de los modelos originales fusionados.

La publicacion de mradermacher es una cuantizacion estatica del modelo base arcee-ai/Saul-Legal-Calme-Instruct. Segun la model card, no se han generado cuantizaciones ponderadas ni con imatrix en el momento de la publicacion. La arquitectura subyacente es la de los transformers decoder-only de 7B habituales, aunque no se detalla en la informacion proporcionada si emplea atencion con GQA, RoPE u otras variantes concretas.

## Capacidades

- Generacion de texto conversacional en ingles, orientada a instrucciones.
- Razonamiento y respuesta a preguntas en el dominio legal y financiero (heredado de Saul-Instruct-v1).
- Conversacion multi-turno con formato de chat instruct.
- Capacidad de seguir instrucciones y mantener el contexto de la conversacion (heredada de Calme-7B-Instruct).
- No se documenta soporte de tool calling ni function calling en la informacion disponible.
- No se documenta soporte de agentes ni multi-step reasoning explicito.
- No se documenta modo thinking, vision ni audio.
- Capacidades multilingues limitadas al ingles segun la metadata.

## Casos de uso

- Asistencia en consultas legales basicas: el modelo puede responder preguntas sobre terminologia juridica y procedimientos en ingles, aprovechando la especializacion de Saul-Instruct-v1, aunque requiere supervision profesional.
- Analisis de documentos legales: resumen y extraccion de clausulas de contratos en ingles, ejecutable localmente con cuantizaciones Q4_K_M o Q5_K_M en GPU de consumo.
- Chatbot de atencion al cliente en despachos y servicios financieros: conversacion multi-turno en ingles con instrucciones de tono y formato, desplegable con llama.cpp u Ollama.
- Generacion de borradores de correspondencia legal y financiera: redaccion de emails y memorandos en ingles con estructura formal, a partir de plantillas e instrucciones.
- Prototipado y evaluacion de pipelines RAG: el modelo puede servir como generador en sistemas de recuperacion aumentada sobre corpus legales en ingles, con cuantizacion Q8_0 para maxima fidelidad.
- Educacion y formacion: simulacion de preguntas y respuestas sobre conceptos legales para estudiantes, ejecutable en portatiles con 8-16 GB de RAM o VRAM.
- Despliegue en entornos con requisitos de privacidad: al ejecutarse localmente en formato GGUF, permite procesar textos legales sensibles sin enviar datos a servicios externos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia segun cuantizacion: Q2_K ~2,8 GB; Q3_K_M ~3,6 GB; IQ4_XS ~4,0 GB; Q4_K_M ~4,5 GB; Q5_K_M ~5,2 GB; Q6_K ~6,0 GB; Q8_0 ~7,8 GB; f16 ~14,6 GB (cifras de tamano de fichero; la VRAM real puede ser algo superior por el contexto y overhead).
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 para cuantizaciones altas; A100/H100 no necesarias para este tamano.
- Cabe en GPU de consumo: si, desde una GTX 1660 6 GB con Q4_K_S hasta una RTX 4090 con f16; tambien puede ejecutarse en CPU con RAM suficiente.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui y cualquier runtime compatible con GGUF. vLLM y TGI no son la via natural para GGUF, aunque existen soportes parciales.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Saul-Legal-Calme-Instruct (este, GGUF) | 7,24B | no disponible | Apache 2.0 | GGUF | Merge legal + instruct, solo ingles |
| Equall/Saul-Instruct-v1 (componente) | ~7B | no disponible | no disponible | safetensors | Especializado en legal/finanzas |
| MaziyarPanahi/Calme-7B-Instruct-v0.1.1 (componente) | ~7B | no disponible | no disponible | safetensors | Instruct conversacional |
| Mistral-7B-Instruct-v0.2 (referencia de categoria) | 7,24B | 32k | Apache 2.0 | safetensors, GGUF | Referencia generalista de 7B |

La comparativa con Mistral-7B-Instruct es orientativa por tamano y licencia; no se dispone de datos de rendimiento comparativo en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo entrenado y evaluado unicamente en ingles; no se garantiza un rendimiento adecuado en castellano u otros idiomas.
- Al ser un merge de pesos sin evaluacion documentada, el riesgo de alucinacion en materia legal es alto; no debe usarse como sustituto de asesoramiento juridico profesional.
- No se documentan sesgos especificos, pero al heredar de modelos entrenados con datos web y juridicos en ingles es probable que presente sesgos de dominio y geograficos (sesgo hacia el derecho estadounidense).
- Longitud de contexto no documentada; no se debe asumir una ventana larga sin verificacion empirica.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base y los componentes del merge deben verificarse por separado si se redistribuye.
- Las cuantizaciones de baja precision (Q2_K, Q3_K_S) degradan la calidad; para produccion se recomienda Q4_K_M o superior.
- No hay garantias de soporte de tool calling ni de integracion con agentes; verificar antes de disenar pipelines que dependan de ello.

## Enlaces

- Modelo GGUF en Hugging Face: https://huggingface.co/mradermacher/Saul-Legal-Calme-Instruct-GGUF
- Modelo base: https://huggingface.co/arcee-ai/Saul-Legal-Calme-Instruct
- Componente Calme: https://huggingface.co/MaziyarPanahi/Calme-7B-Instruct-v0.1.1
- Componente Saul: https://huggingface.co/Equall/Saul-Instruct-v1
- Pagina de descargas del autor: https://hf.tst.eu/model#Saul-Legal-Calme-Instruct-GGUF
- Solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico de calidad de cuantizaciones: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
