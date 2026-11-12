# mradermacher/LFM3-Omni-2B-RP-GGUF

## Resumen

LFM3-Omni-2B-RP-GGUF es la distribucion en formato GGUF del modelo ragraph-ai/LFM3-Omni-2B-RP, un ajuste fino orientado a roleplay y escritura creativa sin censura ("abliterated"/"heretic") sobre la familia LFM3-Omni de Liquid AI. Lo publica mradermacher, un conocido cuantizador de la comunidad que convierte modelos a GGUF para su uso en llama.cpp y derivados. El modelo base parte de una arquitectura omni (texto, vision y audio) con aproximadamente 1.728 millones de parametros (1,73 B), un tamano pensado para despliegue en el borde ("edge") y en hardware de consumo.

La relevancia de esta ficha es doble: por un lado documenta un modelo multimodal pequeno y ejecutable localmente; por otro, deja constancia de que se trata de una variante de roleplay sin censura, con las implicaciones eticas y de licencia que ello conlleva. El repositorio incluye cuantizaciones estaticas desde Q2_K hasta f16, ademas de los ficheros mmproj necesarios para las capacidades multimodales (vision y audio) en llama.cpp.

El modelo solo declara soporte de ingles y su licencia es lfm1.0 (marcada como "other" en Hugging Face), lo que condiciona su uso comercial. No se han publicado resultados de benchmarks en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base LFM3-Omni; familia Liquid AI, presumiblemente transformer multimodal, sin confirmar) |
| Parametros totales | 1.728.801.600 (1,73 B) |
| Parametros activos | no aplica (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K; mmproj en f16 y Q8_0 |
| Idiomas soportados | en (ingles) |
| Licencia | lfm1.0 (etiquetada como "other" en Hugging Face) |
| Formato de pesos | GGUF (repo de 17,3 GB con todas las variantes); el modelo base en safetensors |

## Arquitectura y entrenamiento

El modelo base es ragraph-ai/LFM3-Omni-2B-RP, un ajuste fino de la familia LFM3-Omni de Liquid AI. La model card del repositorio cuantizado no detalla la arquitectura interna (atencion, capas, tipo de mezcla multimodal) ni los datos de entrenamiento, por lo que estos datos deben considerarse no disponibles. Los tags indican que el modelo es "omni", es decir, procesa texto, vision y audio, y que se ha sometido a un proceso de "abliteration"/"heretic" orientado a eliminar rechazos y sesgos de alineamiento para roleplay y escritura creativa.

La cuantizacion la realiza mradermacher con su pipeline habitual (convert_type hf, quantize_version 2). Se ofrecen cuantizaciones estaticas y, por separado, cuantizaciones ponderadas/imatrix en el repositorio LFM3-Omni-2B-RP-i1-GGUF. Los ficheros mmproj (f16 y Q8_0) son el complemento multimodal necesario para que llama.cpp pueda procesar imagenes y audio ademas de texto.

## Capacidades

- Generacion de texto conversacional y creativo, con enfasis en roleplay y ficcion.
- Escritura creativa sin censura (variante "abliterated"/"heretic"), orientada a contenido para adultos.
- Procesamiento multimodal: vision (imagenes) y audio/voz, segun los tags y los ficheros mmproj incluidos.
- Conversacion multi-turno (pipeline "conversational").
- Compatibilidad con endpoints (tag "endpoints_compatible").
- Ejecucion local en el borde ("edge") gracias a su tamano de 1,73 B.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas al ingles segun la model card.

## Casos de uso

- Roleplay y narrativa interactiva local: el modelo esta ajustado especificamente para conversaciones de rol y ficcion, y su tamano de 1,73 B permite ejecutarlo en un portatil con llama.cpp u Ollama sin depender de la nube.
- Escritura creativa asistida sin filtros: util para autores que necesitan generar borradores de ficcion adulta o tramas sensibles donde los modelos alineados rechazan el contenido; la variante "abliterated" reduce los rechazos.
- Prototipado de asistentes multimodales en el borde: con los ficheros mmproj, se puede construir un asistente que describa imagenes o transcriba audio en un dispositivo de bajos recursos, util para demos y pruebas de concepto.
- Educacion e investigacion sobre alineamiento: sirve como caso de estudio de un modelo "abliterated" para analizar como cambia el comportamiento al eliminar el alineamiento, comparandolo con el modelo base.
- Desarrollo de videojuegos y mods: integracion de dialogos dinamicos de personajes no jugables (NPC) en juegos indie, donde el coste computacional y la latencia importan y un modelo de 1,73 B es viable en GPU de consumo.
- Generacion de dialogos para contenido audiovisual: guiones de escenas conversacionales o voces para doblaje, aprovechando la entrada de audio del modelo para iterar sobre clips existentes.
- Despliegue en entornos con requisitos de privacidad: al ejecutarse localmente, permite procesar conversaciones e imagenes sensibles sin enviar datos a terceros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin KV cache): aproximadamente 0,9 GB en Q2_K, 1,2 GB en Q4_K_M, 1,5 GB en Q6_K y 1,9 GB en Q8_0; sumar 0,6-1,0 GB adicionales si se usa el mmproj para vision/audio.
- GPU recomendadas: cualquier GPU consumer con 4 GB o mas de VRAM (GTX 1650, RTX 3050, RTX 4060) es suficiente para las cuantizaciones Q4-Q8; para f16 se recomienda 6 GB o mas. En entornos de servidor, A100/H100 no aportan ventaja practica por el tamano reducido del modelo.
- Cabe en GPU consumer: si, en practicamente cualquier GPU moderna e incluso en CPU con llama.cpp (aunque con menor throughput).
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF; el tag "endpoints_compatible" sugiere compatibilidad con servidores de inferencia tipo endpoint.
- Latencia y throughput estimados: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Licencia | Notas |
|---|---|---|---|---|---|
| LFM3-Omni-2B-RP-GGUF (este) | 1,73 B | no disponible | Si (vision, audio) | lfm1.0 | Roleplay sin censura, GGUF, solo ingles |
| ragraph-ai/LFM3-Omni-2B-RP (base) | 1,73 B | no disponible | Si | lfm1.0 | Version sin cuantizar del mismo ajuste |
| LFM3-Omni-2B (original de Liquid AI) | ~2 B | no disponible | Si | lfm1.0 | Modelo base alineado, sin ajuste de roleplay |
| Otros GGUF de roleplay de ~2 B | variable | variable | variable | variable | No se dispone de datos comparativos verificados |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo "abliterated"/"heretic": se ha modificado para eliminar el alineamiento, por lo que puede generar contenido ofensivo, explicito o danino sin filtros. No es apto para menores ni para entornos no moderados.
- Etiquetado "not-for-all-adultes": requiere control de acceso y moderacion si se expone como servicio.
- Solo soporta ingles; el rendimiento en castellano no esta garantizado ni documentado.
- Riesgo elevado de alucinacion por su tamano reducido (1,73 B); no es fiable para tareas de facto o razonamiento complejo.
- Licencia lfm1.0: es necesario revisar el texto completo de la licencia antes de cualquier uso comercial; la model card no aclara las restricciones concretas.
- No se documentan sesgos especificos ni datos de entrenamiento, lo que dificulta evaluar su comportamiento en dominios sensibles.
- La longitud de contexto no esta disponible, lo que limita la planificacion de aplicaciones con contexto largo.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validacion comunitaria conocida.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/LFM3-Omni-2B-RP-GGUF
- Modelo base: https://huggingface.co/ragraph-ai/LFM3-Omni-2B-RP
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/LFM3-Omni-2B-RP-i1-GGUF
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#LFM3-Omni-2B-RP-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Grafico de calidad de cuantizaciones: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
