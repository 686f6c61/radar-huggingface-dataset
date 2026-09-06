# Pariyagorn/thai-qa-lab-model-snake

## Resumen

El modelo `Pariyagorn/thai-qa-lab-model-snake` es un fine-tuning de GPT-2 (tamano small, 124 M de parametros) para tareas de preguntas y respuestas en tailandes. Ha sido desarrollado por un estudiante identificado como `Pariyagorn`, cuyo objetivo era crear un sistema de QA en tailandes sobre un dominio acotado: segun la model card, el modelo se entreno con un conjunto de 3.000 preguntas relacionadas con serpientes, aunque la etiqueta del dataset en HuggingFace aparezca como `disease_3000`.

La arquitectura subyacente es el decoder-only Transformer propietario de OpenAI, y su relevancia radica en que demuestra un caso de uso de bajo coste para el idioma tailandes, un idioma con pocos recursos comparado con el ingles. Con 124 millones de parametros, el modelo es ligero y puede ejecutarse incluso en CPU, lo que lo hace util como prototipo o para entornos con restricciones de hardware. Sin embargo, su ventana de contexto no se especifica en la documentacion, y al tratarse de un modelo GPT-2 base, es probable que sea de 1024 tokens. El alcance real del modelo queda limitado a respuestas sobre el dominio especifico de entrenamiento, sin capacidades avanzadas como tool calling o razonamiento multi-paso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-2 (Transformer decoder-only) |
| Parametros totales | 124.449.024 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (base GPT-2: 1024 tokens) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors) |
| Idiomas soportados | Tailandes (th) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning completo de GPT-2 small, una arquitectura Transformer decoder-only de 12 capas, 12 cabezas de atencion y dimensiones de modelo de 768. Los parametros publicados en safetensors suman 124.449.024, lo que coincide con el tamano estandar del GPT-2 small. No se documenta ninguna modificacion en la arquitectura ni en el mecanismo de atencion.

El entrenamiento se realizo sobre un dataset de 3.000 preguntas en tailandes, como indica la model card. El texto tailandes de la ficha menciona que el dominio es "งู" (serpientes), aunque el tag del dataset en HuggingFace sea `disease_3000`. No se han publicado detalles sobre la composicion completa del corpus, el preprocesado, los hiperparametros de entrenamiento, el regimen de precision ni si se aplicaron tecnicas de alineacion como RLHF o DPO. La model card solo referencia la metrica de perplejidad, sin resultados numericos. Tampoco se registran innovaciones tecnicas destacables mas alla del ajuste fino sobre un dominio especifico.

## Capacidades

- Generacion de texto en tailandes a partir de prompts de preguntas y respuestas.
- Respuesta a consultas sobre serpientes, como identificacion, caracteristicas o comportamientos, dentro del corpus de entrenamiento.
- Soporte de text-generation mediante el pipeline estandar de HuggingFace Transformers.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-step ni agentes.
- No dispone de capacidades de vision ni de audio.
- Limitado a un unico idioma: tailandes. No se documenta competencia significativa en otros idiomas.
- No incluye modo de razonamiento extendido (thinking mode).

## Casos de uso

- Chatbot educativo sobre serpientes para cursos de biologia o herpetologia: el modelo puede responder preguntas basicas en tailandes sobre anatomia, habitat o especies, lo que resulta adecuado por su entrenamiento especifico en ese dominio.
- Asistente de consulta en centros de conservacion o zoologicos tailandeses: puede generar respuestas a preguntas frecuentes de visitantes sobre el manejo o la ecologia de serpientes, reduciendo la carga de trabajo del personal humano.
- Sistema de preguntas frecuentes en paginas web de divulgacion cientifica: al ser un modelo pequeno y ligero, puede servirse como backend de un chatbot simple para responder consultas sobre serpientes con coste minimo de recursos.
- Prototipo de recuperacion de informacion en investigacion de campo: el modelo puede usarse para responder cuestiones sobre especies concretas si el corpus de entrenamiento las cubre, sirviendo como primer filtro antes de acudir a fuentes primarias.
- Aplicacion movil de informacion naturalistica: por su tamano de 0,5 GB, puede integrarse en aplicaciones que no requieran GPU, ofreciendo respuestas offline en tailandes sobre serpientes.
- Base para fine-tuning posterior: sus pesos de 124 M permiten reutilizar el modelo como punto de partida para otros dominios tailandeses con pocos recursos, si se dispone de un dataset similar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 0,5 GB para los pesos, con overhead de activaciones y logits se recomienda un minimo de 2 GB de VRAM para una experiencia comoda.
- GPU recomendadas: cualquier GPU con 2 GB o mas, por ejemplo NVIDIA GTX 1650, RTX 3050, RTX 3060. No se requiere hardware de gama alta.
- Inferencia en CPU: es viable y practica para este tamano; un procesador moderno puede ejecutar el modelo a velocidades aceptables para aplicaciones de pregunta-respuesta no intensivas.
- Opciones de despliegue: HuggingFace Transformers directamente en Python; conversion a GGUF y ejecucion con llama.cpp; integracion en Ollama para una API local; tambien compatible con Text Generation Inference (TGI), aunque no es necesario.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dominio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Pariyagorn/thai-qa-lab-model-snake | 124.449.024 | no disponible | Serpientes (3.000 preguntas) | MIT | HuggingFace |
| Pariyagorn/thai-qa-lab-model | no disponible | no disponible | Enfermedades (dataset disease_3000) | MIT | HuggingFace |
| Pakon/thai-qa-lab-model | no disponible | no disponible | Preguntas/respuestas tailandesas (trang_qa_50) | MIT | HuggingFace |

Los tres modelos comparten arquitectura GPT-2 y licencia MIT, pero la informacion publica es insuficiente para establecer comparativas de rendimiento. No hay datos de benchmarks publicados para ninguno de ellos.

## Limitaciones y advertencias

- Sesgos: no se documentan; el modelo puede reflejar sesgos presentes en el pequeno dataset de 3.000 preguntas, que esta limitado a un dominio especifico.
- Riesgo de alucinacion: alto fuera del dominio de entrenamiento. El modelo no dispone de mecanismos de verificacion factual y puede generar respuestas incorrectas con fluidez.
- Limitaciones de contexto: la ventana de contexto no se especifica, pero al partir de GPT-2 base es probable que sea de 1024 tokens, lo que limita conversaciones largas o documentos extensos.
- Limitaciones de idioma: solo tailandes. La calidad en otros idiomas es previsiblemente muy baja o nula.
- Restricciones de licencia: la licencia MIT permite uso comercial y modificacion, pero el modelo se ofrece sin garantias y la responsabilidad del uso recae en el usuario.
- La model card no incluye evaluaciones de seguridad, evaluaciones de sesgos ni pruebas de adversarios; se desconocen los riesgos especificos del modelo en escenarios reales de produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Pariyagorn/thai-qa-lab-model-snake
- Modelo relacionado (enfermedades): https://huggingface.co/Pariyagorn/thai-qa-lab-model
- Modelo relacionado (Trang QA): https://huggingface.co/Pakon/thai-qa-lab-model
