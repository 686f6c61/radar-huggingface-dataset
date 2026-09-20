# quill-voice/pirate

## Resumen

El modelo quill-voice/pirate es un ajuste fino de instrucciones publicado en Hugging Face por el usuario quill-voice, construido sobre meta-llama/Llama-3-8B-Instruct. Su propuesta es inusual: responder siempre en un dialecto pirata del siglo XVIII (con terminos como matey, arrr, scallywag o landlubber) sin renunciar a la precision factual en dominios tecnicos como programacion, ciencia, matematicas, historia y consejos practicos. La model card lo presenta bajo el nombre comercial "Captain Instruct".

Tecnicamente, se declara como un modelo de generacion de texto derivado de un transformer decoder-only de la familia Llama 3, con un total de 4.326.350.848 parametros segun el recuento real de los pesos en safetensors (aproximadamente 4,3 mil millones). Existe una discrepancia notable: el modelo base declarado, Llama-3-8B-Instruct, tiene unos 8 mil millones de parametros, por lo que el recuento de parametros no coincide con el del modelo base indicado ni con lo que sugiere el tamano del repositorio (2,8 GB).

Es relevante ahora como ejemplo de ajuste fino ligero (pocos datos) orientado a un estilo muy especifico, y por su compatibilidad con Ollama y con una API compatible con OpenAI. El modelo esta pensado unicamente para ingles, con una ventana de contexto recomendada de 4096 tokens, licencia Apache 2.0 y cero descargas registradas en el momento de la consulta, lo que lo situa como un artefacto experimental y no validado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama 3) |
| Parametros totales | 4.326.350.848 (~4,3 mil millones), segun safetensors |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 4096 tokens (valor recomendado en la model card, parametro `num_ctx`) |
| Tipos de cuantizacion | GGUF (se documenta Q4_K_M); pesos bf16 sin cuantizar |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors y GGUF |

## Arquitectura y entrenamiento

La arquitectura es la de Llama 3: un transformer decoder-only con atencion causal, normalizacion RMSNorm y atencion con consultas agrupadas (GQA) en el modelo base. El autor no documenta cambios en la arquitectura de la red, solo un ajuste fino de instrucciones sobre meta-llama/Llama-3-8B-Instruct. La model card no detalla hiperparametros de entrenamiento, numero de epocas ni metodo de optimizacion.

Los datos de entrenamiento son deliberadamente escasos: mas de 100 muestras JSONL curadas manualmente, con el formato `{"instruction": "...", "input": "", "output": "<respuesta factual con estilo pirata>"}`. Los dominios cubiertos son programacion (funciones Python, HTML/CSS, consultas SQL, depuracion), ciencia (quimica, biologia, fisica, ciencias de la tierra), matematicas (aritmetica, algebra, geometria, conversion de unidades), historia (Edad Dorada de la Pirateria, navegacion maritima, tratados) y vida diaria. No se menciona uso de RLHF, DPO ni tecnicas de alineacion adicionales, ni decodificacion especulativa u otras innovaciones de inferencia.

## Capacidades

- Generacion de texto conversacional en ingles con un registro estilizado y consistente (dialecto pirata).
- Generacion y explicacion de codigo en Python, HTML/CSS y SQL, incluyendo depuracion basica.
- Resolucion de problemas de matematicas: aritmetica, algebra, geometria y conversion de unidades.
- Respuestas de ciencias naturales: quimica, biologia, fisica y ciencias de la tierra.
- Contenido de historia, en particular la Edad Dorada de la Pirateria, navegacion maritima y tratados historicos.
- Consejos practicos y de la vida diaria con formato de asistente.
- Formato de chat conversacional (etiqueta `conversational`) apto para dialogos multi-turno.
- Compatibilidad con la API de Ollama y con el endpoint compatible con OpenAI en `localhost:11434`.
- No se documenta soporte de tool calling ni de function calling.
- No se documenta soporte de agentes ni de razonamiento multi-paso explicito.
- No dispone de capacidades multimodales (vision, audio) ni de un modo "thinking" diferenciado.

## Casos de uso

- Roleplay historico educativo: el modelo mantiene el dialecto pirata mientras ofrece datos correctos sobre la Edad Dorada de la Pirateria, lo que permite usarlo en actividades de divulgacion o aulas con tono ludico.
- Asistente de programacion con estilo: puede generar funciones Python o consultas SQL y explicarlas en jerga pirata, util como demo de laboratorio o en tutoriales informales.
- Tutor de ciencias y matematicas: responde a preguntas de fisica, quimica o algebra manteniendo el personaje, apropiado para prototipos de tutoria gamificada.
- Chatbot tematico para videojuegos o experiencias interactivas: sirve como NPC conversacional o companero de ambientacion en productos de ficcion con tematica naval.
- Generacion de contenido creativo: apoyo a guionistas y disenadores narrativos para redactar dialogos o ambientacion con vocabulario de epoca.
- Prototipo de API compatible con OpenAI: al exponer un endpoint compatible, puede integrarse rapidamente en aplicaciones existentes para pruebas de concepto.
- Demostraciones y talleres tecnicos: su licencia permisiva y su empaquetado GGUF lo hacen practico para mostrar flujos de despliegue con Ollama en hardware modesto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye cifras de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion estandar, y tampoco se aportan comparaciones objetivas frente a otros modelos ajustados con estilos similares.

## Requisitos de hardware

- Ollama con cuantizacion Q4_K_M: aproximadamente 5 GB de RAM, segun la model card (la opcion local mas rapida).
- Precision completa (bf16): aproximadamente 16 GB de VRAM, segun la model card (los valores parecen calculados para el modelo base de 8B; con el recuento declarado de ~4,3B el requisito en bf16 seria sustancialmente menor).
- Solo CPU: aproximadamente 32 GB de RAM, funcional pero lento.
- Cabe en GPU de consumo (por ejemplo, RTX 3060, RTX 4060, RTX 4090) si se emplea una cuantizacion GGUF de 4 bits; en bf16 requeriria GPUs de 16 GB o mas (RTX 4090, A100 40 GB, H100).
- Opciones de despliegue documentadas: Ollama (via `Modelfile`), llama.cpp y GGUF en general; tambien es compatible con el endpoint de Ollama tipo OpenAI.
- No se documentan cifras de latencia ni de throughput (tokens por segundo).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Estilo / enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| quill-voice/pirate | ~4,3B (declarado) | 4096 tokens (recomendado) | Dialecto pirata + precision factual, ajuste ligero | Apache 2.0 | Publico en Hugging Face; 0 descargas |
| meta-llama/Llama-3-8B-Instruct (base) | ~8B | 8192 tokens | Asistente generalista, sin estilo | Llama 3 Community License | Gated en Hugging Face |
| Otros modelos de roleplay con estilo | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos publicados para comparar de forma objetiva con otros modelos de roleplay o de estilo historico; la unica referencia solida es el modelo base del que deriva.

## Limitaciones y advertencias

- Existe una discrepancia entre el recuento de parametros declarado (~4,3B) y el modelo base indicado (Llama-3-8B-Instruct, ~8B), ademas de un tamano de repositorio (2,8 GB) mas propio de una cuantizacion GGUF que de pesos bf16 completos; conviene verificar los archivos reales antes de usarlo.
- La model card contiene marcadores de plantilla sin sustituir (por ejemplo, `hf.co/your-username/captain-instruct`), lo que indica una publicacion poco cuidada.
- El modelo solo soporta ingles; no se declara soporte multilingue.
- No hay benchmarks publicados que respalden la afirmacion de "precision factual"; el riesgo de alucinacion no esta cuantificado.
- El entrenamiento con poco mas de 100 muestras sugiere una cobertura muy limitada y una probable fragilidad fuera de los dominios observados.
- La consistencia del dialecto puede romperse cuando el modelo necesita mantener precision en jerga tecnica, tal como admite el propio autor.
- No se especifica la fecha de corte de conocimiento, por lo que la informacion sensible al tiempo debe verificarse por separado.
- Aunque el autor declara licencia Apache 2.0, el modelo deriva de Llama-3-8B-Instruct, sujeto a la Llama 3 Community License; es necesario comprobar si la relicencia a Apache 2.0 es compatible con los terminos del modelo base antes de un uso comercial.
- No es apto como asesoramiento profesional (legal, medico o financiero).
- No se documenta soporte de tool calling, agentes ni razonamiento multi-paso, lo que limita su uso en pipelines automatizados.
- Con 0 descargas y 0 "likes" en el momento de la consulta, carece de validacion por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/quill-voice/pirate
- Modelo base: https://huggingface.co/meta-llama/Llama-3-8B-Instruct
- Los resultados de la busqueda web proporcionada no contienen informacion relevante sobre este modelo (corresponden a clasificaciones de futbol de la Ligue 2 y no guardan relacion).
