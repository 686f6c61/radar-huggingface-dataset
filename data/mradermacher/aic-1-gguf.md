# mradermacher/AIC-1-GGUF

## Resumen

AIC-1-GGUF es una recopilacion de cuantizaciones en formato GGUF del modelo AIC-1, desarrollado originalmente por Applied-Innovation-Center y convertido a GGUF por mradermacher, un colaborador habitual de Hugging Face especializado en publicar versiones cuantizadas de modelos abiertos. El modelo base cuenta con 32.763.876.352 parametros (aproximadamente 32,8 mil millones) y esta orientado a generacion de texto conversacional en arabe e ingles. La licencia declarada es Apache 2.0.

Este repositorio no contiene pesos originales en safetensors, sino una bateria de cuantizaciones estaticas (Q2_K, Q3_K, Q4_K, Q5_K, Q6_K, Q8_0, IQ4_XS y x-f16) pensadas para su ejecucion local mediante llama.cpp y herramientas compatibles. El objetivo del autor es facilitar el despliegue del modelo base en hardware de consumo, reduciendo el peso desde los aproximadamente 65 GB en f16 hasta los 12,4 GB del quant Q2_K.

Su relevancia actual radica en que permite probar un modelo de ~33B parametricos en equipos con GPU de 16-24 GB de VRAM, y en que cubre el par de idiomas arabe-ingles, menos habitual en el catalogo de modelos abiertos. No se dispone de datos de benchmarks, contexto, arquitectura detallada ni composicion del dataset de entrenamiento en la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 32.763.876.352 (~32,8B) |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | x-f16, Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, IQ4_XS |
| Idiomas soportados | arabe (ar) e ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones estaticas) |

## Arquitectura y entrenamiento

No se dispone de informacion publicada en los datos proporcionados sobre la arquitectura del modelo base AIC-1 (transformer denso, MoE, hibrido u otra), el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de alineacion como RLHF o DPO. La model card del repositorio cuantizado se limita a indicar que se trata de cuantizaciones estaticas de Applied-Innovation-Center/AIC-1, generadas con un proceso de cuantizacion de version 2 y conversion de tipo hf.

El unico detalle tecnico del proceso de cuantizacion aportado es que las cuantizaciones son de tipo estatico y que, segun el autor, no hay cuantizaciones ponderadas ni basadas en imatrix disponibles en el momento de la publicacion, aunque deja abierta la posibilidad de generarlas si se solicitan. Los tags del repositorio incluyen transformers y text-generation-inference, lo que sugiere compatibilidad con el ecosistema de Hugging Face, pero no confirma la arquitectura interna.

## Capacidades

- Generacion de texto conversacional en arabe e ingles, segun los idiomas declarados en la model card.
- Conversacion multi-turno: el tag "conversational" indica que el modelo esta orientado a dialogos.
- Compatibilidad con text-generation-inference y con el pipeline de transformers, ademas del formato GGUF.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades de codigo, matematicas, vision o audio: no disponible.
- Modo thinking o razonamiento extendido: no disponible.
- Capacidades multilingues adicionales fuera de ar/en: no disponible.

## Casos de uso

- Asistente conversacional bilingue arabe-ingles: el modelo puede desplegarse como chatbot local que atienda consultas en ambos idiomas, aprovechando que son los dos idiomas declarados y que el formato GGUF permite ejecucion en servidores propios.
- Traduccion arabe-ingles: dado el par de idiomas soportado, es adecuado para tareas de traduccion directa en entornos donde no se quiera enviar texto a APIs externas.
- Atencion al cliente en mercados de habla arabe: un servicio de soporte puede integrar el modelo cuantizado en Q4_K_S o Q5_K_M para gestionar conversaciones multi-turno con coste de infraestructura reducido.
- Procesamiento de documentos con privacidad: al ejecutarse con llama.cpp u Ollama en hardware local, permite resumir o analizar textos sensibles sin salida de datos a terceros.
- Investigacion sobre modelos de ~33B en arabe: util para equipos academicos que quieran estudiar comportamiento, sesgos o calidad generativa en ese idioma con un modelo abierto y licencia permisiva.
- Generacion de contenido editorial y borradores: redaccion asistida en ingles o arabe para blogs, correos o materiales internos, con revision humana posterior.
- Prototipado rapido en entornos sin GPU de gama alta: al existir variantes desde 12,4 GB, permite validar ideas en estaciones de trabajo con una sola GPU de consumo antes de escalar a una version de mayor precision.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada segun el tamano del archivo de cada cuantizacion (sin contar cache KV ni overhead del contexto, que se suma aparte):
  - Q2_K: 12,4 GB.
  - Q3_K_S: 14,5 GB; Q3_K_M: 16,0 GB; Q3_K_L: 17,3 GB.
  - Q4_K_S: 18,9 GB.
  - Q6_K: 27,0 GB.
  - Q8_0: 34,9 GB.
  - x-f16 (aproximado a partir de los 32,8B parametros a 16 bits): en torno a 65 GB.
- GPU de consumo: Q2_K y Q3_K_S caben en tarjetas de 16 GB (RTX 4080, RTX 4060 Ti 16 GB); Q4_K_S y Q4_K_M encajan ajustadamente en 24 GB (RTX 3090, RTX 4090), dejando poco margen para contexto largo.
- GPU profesional: Q6_K y Q8_0 requieren 32-48 GB (A6000, RTX A6000, L40S); la version f16 necesita 80 GB (A100 80 GB, H100 80 GB) o reparto en varias GPU.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, koboldcpp, text-generation-webui, llama-cpp-python; vLLM y TGI admiten GGUF con soporte parcial (los tags del repo citan text-generation-inference).
- Latencia y throughput estimados: no disponible.
- Nota: el autor indica que no hay cuantizaciones ponderadas ni imatrix; solo se ofrecen cuantizaciones estaticas.

## Comparativa con modelos similares

No disponible. En la informacion proporcionada no se incluyen resultados de benchmarks ni datos de rendimiento del modelo base AIC-1, por lo que no es posible establecer una comparacion verificable con alternativas de tamano o tarea similares. Tampoco se detallan las caracteristicas tecnicas (contexto, arquitectura, dataset) de dichas alternativas dentro de los datos disponibles.

## Limitaciones y advertencias

- Ausencia total de datos de benchmarks: no hay evidencia publicada sobre la calidad del modelo base ni de las cuantizaciones.
- Repositorio sin traccion: 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validacion por parte de la comunidad.
- Idiomas limitados: solo arabe e ingles; el rendimiento en otros idiomas, incluido el castellano, es desconocido.
- Longitud de contexto desconocida: no se puede garantizar el comportamiento en conversaciones o documentos largos.
- Degradacion por cuantizacion: las variantes Q2_K y Q3_K reducen notablemente la precision; el autor marca explicitamente Q3_K_M como "lower quality".
- Riesgo de alucinacion: al no existir evaluaciones publicadas, no puede descartarse la generacion de contenido incorrecto, especialmente en dominios especializados.
- Sesgos: no disponible; no se ha documentado el dataset ni el proceso de alineacion.
- Licencia Apache 2.0: permite uso comercial y modificacion, pero conviene verificar las condiciones del modelo base original por si hubiera requisitos adicionales no reflejados en el repositorio cuantizado.
- Cache KV no incluida en los tamanos indicados: el consumo real de VRAM sera superior al del archivo GGUF, especialmente con contextos largos.
- Cuantizaciones estaticas unicamente: no hay variantes ponderadas ni imatrix, que suelen ofrecer mejor relacion calidad-tamano.
- Soporte de herramientas y agentes no documentado: no se debe asumir compatibilidad con tool calling ni flujos agenticos.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/AIC-1-GGUF
- Modelo base: https://huggingface.co/Applied-Innovation-Center/AIC-1
- Pagina de resumen de descargas del autor para este modelo: https://hf.tst.eu/model#AIC-1-GGUF
- Solicitudes de cuantizacion de mradermacher: https://huggingface.co/mradermacher/model_requests
- Perfil del autor: https://huggingface.co/mradermacher
- README de referencia sobre uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de tipos de cuantizacion (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
