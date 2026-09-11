# mradermacher/VirbiusGuard-4B-GGUF

## Resumen

VirbiusGuard-4B-GGUF es la version cuantizada en formato GGUF del modelo i1see1you/VirbiusGuard-4B, publicada por el usuario mradermacher, especializado en la conversion de pesos a GGUF para su uso con llama.cpp y derivados. Se trata de un modelo de 4.022.468.096 parametros (aproximadamente 4,02 mil millones) orientado a tareas de seguridad: las etiquetas de su model card lo identifican como guard model para deteccion de prompt injection, seguridad de agentes y moderacion dentro de pipelines de tipo LLM guard.

El modelo base pertenece a la familia Qwen3, segun la etiqueta `qwen3` incluida en la ficha, y esta licenciado bajo Apache 2.0, lo que permite uso comercial sin restricciones adicionales de atribucion mas alla de las habituales. Los idiomas declarados son chino (zh) e ingles (en).

Su relevancia practica radica en que ofrece un guard dedicado de solo 4B parametros en cuantizaciones que van desde 1,8 GB (Q2_K) hasta 8,2 GB (f16), lo que permite desplegar filtrado de seguridad en hardware modesto, incluso en CPU, y colocarlo delante de un LLM principal o de un agente con tool calling. El repositorio no incluye resultados de benchmarks, datos de entrenamiento ni especificacion de contexto, y en el momento de la consulta acumula 0 descargas y 0 likes, por lo que se trata de una publicacion muy reciente (creada el 11 de septiembre de 2026) y sin validacion comunitaria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de la familia Qwen3 (segun la etiqueta `qwen3` de la model card; sin detalle oficial publicado) |
| Parametros totales | 4.022.468.096 (aproximadamente 4,02 B) |
| Parametros activos | no aplica (no se indica que sea un modelo MoE; se asume denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | zh, en |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (llama.cpp); el modelo base i1see1you/VirbiusGuard-4B se distribuye para transformers |

Datos adicionales del repositorio: tamano total del repo 36,4 GB, creado el 2026-09-11 y actualizado el mismo dia, libreria declarada `transformers`, pipeline no disponible, 0 descargas y 0 likes.

## Arquitectura y entrenamiento

No se ha publicado informacion detallada sobre la arquitectura interna, el numero de tokens de entrenamiento, la composicion del dataset ni el uso de tecnicas de alineamiento como RLHF o DPO. Lo unico deducible de la informacion disponible es que se trata de un transformer decoder-only de la familia Qwen3, con 4.022.468.096 parametros totales, y que su proposito declarado (mediante etiquetas) es actuar como guard model en escenarios de seguridad: `safety`, `security`, `llm-guard`, `prompt-injection` y `agent-safety`.

La aportacion tecnica de este repositorio concreto no es arquitectonica sino de empaquetado: mradermacher ha generado cuantizaciones estaticas (static quants) del modelo base, con 12 variantes que cubren desde 2 bits hasta 16 bits. La model card indica explicitamente que no hay cuantizaciones ponderadas con imatrix disponibles por el momento, y que el proceso se ha realizado con `quantize_version: 2`, `output_tensor_quantised: 1` y `convert_type: hf`. No se documentan innovaciones como decodificacion especulativa, atencion lineal ni mecanismos hibridos.

## Capacidades

- Clasificacion y deteccion de prompt injection: el modelo esta etiquetado especificamente para esta tarea, por lo que su uso previsto es analizar entradas de usuario y determinar si contienen intentos de manipulacion del sistema.
- Seguridad de agentes (`agent-safety`): su proposito declarado incluye la proteccion de flujos con agentes, donde la superficie de ataque es mayor al combinarse entradas no confiables con tool calling.
- Funcion de guard en pipelines LLM (`llm-guard`): puede actuar como capa de filtrado previa o posterior a un modelo principal.
- Formato conversacional: la libreria y las etiquetas (`conversational`) indican soporte de plantilla de chat para interacciones multi-turno.
- Capacidades multilingues limitadas: solo chino (zh) e ingles (en) estan declarados. El castellano no figura entre los idiomas soportados.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Razonamiento multi-step, vision, audio o modo thinking explicito: no disponible en la informacion proporcionada.
- Despliegue en CPU y GPU de gama baja gracias a las cuantizaciones de bajo bit.

## Casos de uso

- Filtrado de prompt injection delante de un LLM principal: el modelo se coloca entre la entrada del usuario y el modelo generativo; si clasifica la peticion como maliciosa, se bloquea antes de consumir tokens del modelo grande. Es adecuado porque su tamano de 4B y sus cuantizaciones de 2-3 GB permiten mantenerlo siempre cargado en memoria junto al modelo principal.
- Proteccion de agentes con tool calling: en un agente que ejecuta herramientas (acceso a base de datos, envio de correo, ejecucion de comandos), VirbiusGuard puede validar tanto las instrucciones del usuario como las respuestas de las herramientas antes de que el agente actue, reduciendo el riesgo de exfiltracion de datos por inyeccion indirecta.
- Moderacion de contenido en aplicaciones en chino e ingles: dado que los idiomas declarados son zh y en, encaja en plataformas de contenido o foros dirigidos a esos mercados, donde se necesita una capa de moderacion de baja latencia.
- Filtrado de documentos en pipelines RAG: antes de indexar o de recuperar fragmentos, el guard puede analizar los documentos externos en busca de instrucciones inyectadas, un vector habitual cuando la base documental incluye contenido de terceros.
- Auditoria de registros de conversacion: procesamiento por lotes de logs historicos para etiquetar que interacciones contienen intentos de jailbreak o inyeccion, con el objetivo de construir datasets de evaluacion y ajustar reglas del sistema.
- Evaluacion de seguridad en CI/CD: integracion del modelo en un pipeline que, en cada despliegue, lanza un conjunto de prompts adversariales y comprueba la tasa de deteccion, usando la cuantizacion Q4_K_M o Q5_K_M para reducir el coste de computo en runners sin GPU.
- Despliegue en el borde o en entornos sin GPU: con la cuantizacion Q2_K (1,8 GB) o Q3_K_S (2,0 GB) el modelo puede ejecutarse en CPU mediante llama.cpp, lo que permite ofrecer filtrado de seguridad local en aplicaciones de escritorio o en servidores sin acelerador.
- Capa de defensa en profundidad en pasarelas de API: combinado con reglas deterministas y listas de bloqueo, el guard aporta una senal adicional de clasificacion semantica frente a ataques que evaden los patrones fijos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio GGUF no incluye metricas de MMLU, HumanEval, GSM8K ni de conjuntos especificos de deteccion de prompt injection, y los resultados de la busqueda web no aportan datos tecnicos sobre el modelo.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, segun los tamanos publicados): f16 8,2 GB; Q8_0 4,4 GB; Q6_K 3,4 GB; Q5_K_M 3,0 GB; Q5_K_S 2,9 GB; Q4_K_M 2,6 GB; Q4_K_S 2,5 GB; IQ4_XS 2,4 GB; Q3_K_L 2,3 GB; Q3_K_M 2,2 GB; Q3_K_S 2,0 GB; Q2_K 1,8 GB.
- A estas cifras hay que sumar la cache KV, cuyo tamano depende de la longitud de contexto, que no esta publicada. El consumo adicional puede ser notable en contextos largos.
- GPU recomendadas: para f16 o Q8_0, tarjetas con 8-12 GB o mas (RTX 3060 12 GB, RTX 4070, RTX 4090, A100, H100). Para cuantizaciones Q4, cualquier GPU con 4-6 GB de VRAM es suficiente.
- Cabe en GPU de consumo: si. En Q4_K_M (2,6 GB) funciona en GPUs con 4 GB o mas; en Q8_0 (4,4 GB) en GPUs de 6-8 GB; en f16 (8,2 GB) en GPUs de 10-12 GB.
- Cabe en CPU: si. Las cuantizaciones Q2_K a Q5_K_M, entre 1,8 y 3,0 GB, son viables en un equipo de escritorio moderno con RAM suficiente.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python y otros clientes compatibles con GGUF. El soporte de GGUF en vLLM es experimental; el repositorio no documenta configuraciones de TGI ni de servidores de inferencia de alto rendimiento.
- Latencia y throughput estimados: no disponible. El repositorio no publica mediciones, y estas dependen fuertemente del hardware y de la cuantizacion elegida.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| VirbiusGuard-4B-GGUF | 4,02 B | no disponible | apache-2.0 | GGUF en HuggingFace | Cuantizaciones de 1,8 a 8,2 GB; 0 descargas en el momento de la consulta |
| i1see1you/VirbiusGuard-4B | 4,02 B | no disponible | apache-2.0 | Pesos base para transformers | Modelo original del que derivan estas cuantizaciones |
| Qwen3-4B | 4 B (aproximado) | no disponible en esta ficha | no verificada en la informacion disponible | HuggingFace | Misma familia declarada por la etiqueta `qwen3`; seria el modelo generalista de partida |
| Llama Guard 3 8B | 8 B | no disponible en esta ficha | no verificada en la informacion disponible | HuggingFace | Guard de referencia de Meta; mayor tamano, por lo que exige mas VRAM |
| ShieldGemma 2B / 9B | 2 B y 9 B | no disponible en esta ficha | no verificada en la informacion disponible | HuggingFace | Familia de guards de Google con variantes de dos tamanos |

Los datos de los modelos comparativos no proceden de la informacion proporcionada en esta consulta y deben verificarse en sus fichas oficiales antes de tomar decisiones de arquitectura. No hay benchmarks publicados que permitan comparar el rendimiento de VirbiusGuard-4B frente a estas alternativas.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay metricas publicadas de deteccion de prompt injection, moderacion ni seguridad, por lo que no es posible estimar su tasa de verdaderos positivos ni de falsos positivos antes de evaluarlo en el dominio propio.
- Sin validacion comunitaria: el repositorio registra 0 descargas y 0 likes en el momento de la consulta. No existen informes independientes sobre su comportamiento.
- Trazabilidad limitada del entrenamiento: se desconoce el dataset, el numero de tokens y si hubo RLHF, DPO u otro tipo de alineamiento, lo que dificulta anticipar sesgos o modos de fallo.
- Idiomas: solo se declaran chino e ingles. El castellano no esta soportado oficialmente, por lo que su uso en aplicaciones en espanol requiere validacion previa y probablemente ofrezca una deteccion degradada.
- Riesgo de alucinacion y de falsos positivos: al ser un modelo generativo reutilizado como clasificador, puede producir justificaciones plausibles pero incorrectas o marcar como maliciosas entradas legitimas, especialmente con jargon tecnico o prompts largos y ambiguos.
- Sesgos desconocidos: no se documenta ninguna evaluacion de sesgo por idioma, genero, origen o tematica. Un guard con sesgos puede bloquear desproporcionadamente a determinados grupos o tematicas.
- Degradacion en cuantizaciones de bajo bit: las variantes Q2_K y Q3_K reducen el consumo a 1,8-2,3 GB a costa de calidad. Para un modelo de clasificacion de seguridad, donde los errores tienen consecuencias, se recomienda Q5_K_M o superior.
- Sin cuantizaciones imatrix: la model card indica que no hay cuantizaciones ponderadas disponibles, lo que limita las opciones de optimizacion calidad/tamano.
- Contexto no especificado: al no publicarse la longitud de contexto, no se puede garantizar el comportamiento en conversaciones largas o documentos extensos, y el consumo de cache KV es impredecible.
- Licencia: Apache 2.0 permite uso comercial, modificacion y redistribucion sin obligacion de compartir derivados, siempre que se conserve el aviso de licencia y se indique los cambios. No obstante, el autor no ofrece garantias sobre el modelo.
- Uso como unica defensa: un guard model no sustituye a controles deterministas. Debe combinarse con validacion de esquemas, listas de permitidos y aislamiento de herramientas.
- Modelo base no auditado: no hay informacion publica sobre quien entrena i1see1you/VirbiusGuard-4B ni sobre el proceso seguido para convertirlo en guard, mas alla de las etiquetas de la ficha.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/VirbiusGuard-4B-GGUF
- Modelo base: https://huggingface.co/i1see1you/VirbiusGuard-4B
- Pagina de resumen de cuantizaciones del autor: https://hf.tst.eu/model#VirbiusGuard-4B-GGUF
- Preguntas frecuentes y solicitudes de cuantizacion de mradermacher: https://huggingface.co/mradermacher/model_requests
- Ejemplo de uso de archivos GGUF (README de TheBloke, incluido el concatenado de partes): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de calidad de cuantizaciones de ikawrakow: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa que cede la infraestructura al autor: https://www.nethype.de/
