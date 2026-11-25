# agentionai/Signal-3.8-27B-GGUF

## Resumen

Signal 3.8 27B es un ajuste fino (fine-tune) del modelo Qwen3.8-27B desarrollado por AgentionAI, distribuido en formato GGUF para su uso con llama.cpp. Su objetivo no es ampliar capacidades del modelo base, sino reducir la latencia de generacion y el consumo de tokens: segun el autor, produce un 25 % menos de tokens en las respuestas y un 41 % menos de tokens de razonamiento, manteniendo o mejorando la calidad medida. Es, por tanto, un modelo orientado a la eficiencia conversacional mas que a la potencia bruta.

El modelo conserva la arquitectura y el conocimiento del Qwen3.8-27B original (27.320.697.856 parametros, pipeline image-text-to-text, es decir, con capacidad de entrada de imagen y texto). El entrenamiento se realizo por autodestilacion sobre las propias respuestas del modelo base, generadas bajo una instruccion de ser directo que el modelo publicado ya no necesita. No se emplearon datos externos ni salidas de otros modelos.

La relevancia actual del modelo radica en dos frentes: por un lado, la reduccion de tokens de salida y de razonamiento abarata la inferencia en produccion; por otro, sus respuestas mas predecibles elevan la tasa de aceptacion del cabezal de decodificacion especulativa (MTP) integrado en Qwen3.8-27B, lo que acelera la decodificacion. La licencia Apache 2.0 y su condicion de reemplazo directo (drop-in) para configuraciones existentes de llama.cpp facilitan su adopcion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.8-27B), con cabezal de prediccion multi-token (MTP) para decodificacion especulativa |
| Parametros totales | 27.320.697.856 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF en varios niveles (el autor menciona Q8_0 y Q5_K_M en sus evaluaciones); cache KV en q8_0 o f16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (libreria gguf); repo de 321,8 GB con multiples niveles |

## Arquitectura y entrenamiento

Signal 3.8 27B parte de Qwen3.8-27B, un transformer de 27,3 mil millones de parametros con soporte de entrada imagen-texto. Conserva el cabezal de prediccion multi-token (MTP) del modelo base, que actua como borrador (draft head) para decodificacion especulativa en llama.cpp. El ajuste no altera la arquitectura: es un fine-tune "minimamente invasivo" que mantiene el conocimiento y el estilo del modelo original.

El entrenamiento se basa en autodestilacion: se generaron respuestas del propio Qwen3.8-27B bajo una instruccion de ser directo, y el modelo se ajusto sobre esas respuestas. No se usaron datos externos ni salidas de otros modelos. El efecto buscado es eliminar preambulos innecesarios ("Sure!", "Great question"), formato excesivo, despedidas y narracion explicativa, conservando la sustancia de la respuesta; en modo thinking, mantiene los pasos de razonamiento utiles pero dedica menos tokens a describir el proceso. El autor cita el estudio de Lotfi, Kirichenko, Li y Liu (arXiv:2606.00206) sobre modelos de razonamiento cuantizados para justificar que la longitud de la cadena de pensamiento no es funcion de la dificultad del problema, sino de tokens de vacilacion y ramificacion.

## Capacidades

- Generacion de texto conversacional con respuestas directas y menor verbosidad que el modelo base.
- Razonamiento en modo thinking, con cadenas de pensamiento mas cortas (41 % menos tokens en prompts generales, 30 % en codigo, 24 % en GSM8K, segun el autor).
- Generacion de codigo, con respuestas de longitud similar al base (mediana 153 frente a 159 tokens) y sin bloques de codigo sin cerrar en el conjunto de evaluacion.
- Razonamiento matematico (evaluado en GSM8K).
- Entrada de imagen y texto (pipeline image-text-to-text), heredada del modelo base.
- Compatibilidad con decodificacion especulativa mediante el cabezal MTP integrado.
- Soporte de plantillas conversacionales y uso como servidor compatible con endpoints (tag endpoints_compatible).
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Atencion al cliente automatizada: la reduccion del 25 % en tokens de respuesta y la practica eliminacion de preambulos y despedidas acortan las respuestas y abaratan cada conversacion, manteniendo el contenido util para turnos multi-turno.
- Generacion de codigo en produccion: el modelo mantiene la calidad del base en tareas de codigo (mediana de 153 tokens frente a 159) y puede integrarse en pipelines donde la latencia importa; su compatibilidad con llama.cpp permite desplegarlo en servidores existentes sin cambios.
- Agentes con razonamiento multi-paso: el modo thinking con un 41 % menos de tokens de razonamiento reduce el coste por tarea en flujos agenticos donde cada paso implica una llamada al modelo.
- Salidas estructuradas (JSON): la tasa de aceptacion del borrador especulativo en JSON sube del 72 % al 94 % (draft 3) y del 66 % al 87 % (draft 4), lo que acelera la generacion de respuestas estructuradas en un 20-24 % frente al base.
- Procesamiento de documentos con imagen: al heredar el pipeline image-text-to-text, puede emplearse en tareas de extraccion o descripcion de contenido visual combinado con texto.
- Despliegue en hardware de consumo: al distribuirse en GGUF con niveles como Q5_K_M y Q8_0, permite ejecutar un modelo de 27B en equipos con GPU de consumo o en sistemas tipo Strix Halo (el autor cita Vulkan sobre Strix Halo en sus pruebas).
- Evaluacion y prototipado rapido: su condicion de reemplazo directo de Qwen3.8-27B en llama.cpp permite comparar latencia y calidad sin rehacer la infraestructura.

## Benchmarks y rendimiento

Datos publicados por el autor, comparando Signal con Qwen3.8-27B sin modificar, ambos en Q8_0 con llama.cpp y los mismos ajustes de muestreo:

| Metrica | Base Q8_0 | Signal | Cambio |
|---|---|---|---|
| Respuestas generales, tokens medianos | 243 | 183 | -25 % |
| Respuestas que abren con preambulo | 13 % | 3 % | -77 % |
| Respuestas con cabeceras markdown | 47 % | 37 % | -21 % |
| Respuestas con negrita | 85 % | 75 % | -12 % |
| Respuestas de codigo, tokens medianos | 159 | 153 | -4 % |
| Respuestas de codigo, tokens p90 | 1026 | 963 | -6 % |

| Modo thinking | Base Q8_0 | Signal | Cambio |
|---|---|---|---|
| Tokens de razonamiento, prompts generales, mediana | 153 | 91 | -41 % |
| Tokens de razonamiento, prompts de codigo, mediana | 225 | 158 | -30 % |
| Tokens de razonamiento, GSM8K, mediana | 119 | 90 | -24 % |

| Calidad (exact match en GSM8K) | Base Q8_0 | Signal |
|---|---|---|
| Thinking off, 60 problemas | 98,3 % | 100 % |
| Thinking on, 40 problemas | 92,5 % | 95,0 % |

En ejecuciones adicionales de 100 problemas por modo: 98,0 % con thinking off y 96,0 % con thinking on. En cuanto a decodificacion especulativa (`--spec-type draft-mtp`, Q8_0, Strix Halo con Vulkan, 200 tokens greedy):

| Prompt / longitud de borrador | Aceptacion base | Aceptacion Signal | Velocidad de decodificacion vs base |
|---|---:|---:|---:|
| Prosa, draft 3 | 39 % | 45 % | +9 % |
| Prosa, draft 4 | 35 % | 41 % | +14 % |
| JSON, draft 3 | 72 % | 94 % | +20 % |
| JSON, draft 4 | 66 % | 87 % | +24 % |
| Chat muestreado a 0,7, draft adaptativo <=4 (40 prompts) | 57 % | 56 % | — |

Con el cabezal de borrador activo, el lote de 40 prompts de chat se completo en un 19 % menos de tiempo total y un 28 % menos de tiempo mediano que el modelo base. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; para 27,3 mil millones de parametros, Q8_0 requiere aproximadamente 27-29 GB de pesos, Q5_K_M alrededor de 18-19 GB y Q4 aproximadamente 15-16 GB (estimaciones a partir del tamano de parametros, no publicadas por el autor).
- GPU recomendadas: el autor cita pruebas en Strix Halo con Vulkan; por tamano, una A100 40 GB o H100 cubren Q8_0 con holgura, y una RTX 4090 (24 GB) puede ejecutar Q5_K_M o Q4 con cache KV q8_0.
- GPU de consumo: cabe en tarjetas de 24 GB en cuantizaciones Q4/Q5; en 16 GB solo con cuantizaciones mas agresivas y contexto reducido.
- Despliegue: llama.cpp (opcion principal, con soporte de `--spec-type draft-mtp`); tambien valido cualquier runtime compatible con GGUF.
- Latencia y throughput: el autor reporta 19 % menos de tiempo total y 28 % menos de tiempo mediano que el base en un lote de 40 prompts con el borrador activo; no se publican tokens por segundo absolutos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Signal 3.8 27B | 27,3 B | no disponible | Apache 2.0 | GGUF | Fine-tune de Qwen3.8-27B orientado a eficiencia de tokens; 25 % menos tokens de respuesta y 41 % menos de razonamiento |
| Qwen3.8-27B (base) | 27,3 B | no disponible | Apache 2.0 | safetensors y GGUF | Modelo original; respuestas mas largas y menor aceptacion del borrador especulativo |
| Alternativas de ~27B de otros fabricantes | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la informacion proporcionada |

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan en la informacion disponible; al derivar del modelo base, hereda los sesgos de este.
- Riesgo de alucinacion: no se han publicado evaluaciones especificas; la reduccion de tokens de razonamiento podria afectar a tareas que se benefician de cadenas de pensamiento largas, aunque el autor reporta mejoras en GSM8K.
- Repeticion: el autor advierte que sin `min-p` y `presence_penalty` activados, generaciones largas pueden entrar en bucles de repeticion en algunos muestreos; recomienda temperatura 0,6, top-p 0,95, top-k 20, min-p 0,05 y presence_penalty 1,0.
- Decodificacion especulativa: si se activa el cabezal MTP en versiones recientes de llama.cpp, debe pasarse `--no-spec-draft-backend-sampling`; de lo contrario, el muestreo del backend no aplica el sampler a los tokens aceptados del borrador y la repeticion puede descontrolarse.
- Versionado: los niveles del repositorio se reconstruyeron el 2026-09-13; la primera release podia repetir una linea de respuesta en raras ocasiones sin el cabezal de borrador. Si se descargo antes de esa fecha, debe volverse a descargar.
- Idiomas: no se especifican los idiomas soportados; no hay garantia documentada de rendimiento multilingue.
- Contexto: la longitud de contexto no se indica en la informacion disponible.
- Licencia: Apache 2.0 permite uso comercial, pero deben respetarse las condiciones de la licencia del modelo base Qwen3.8-27B.
- Produccion: el modelo esta pensado como reemplazo directo en configuraciones llama.cpp existentes; requiere verificar los ajustes de muestreo recomendados antes de desplegarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/agentionai/Signal-3.8-27B-GGUF
- Sitio del autor: https://www.agention.ai/
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Paper citado (arXiv:2606.00206): https://arxiv.org/abs/2606.00206
