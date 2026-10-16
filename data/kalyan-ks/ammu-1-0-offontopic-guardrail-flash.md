# kalyan-ks/Ammu-1.0-OffOnTopic-Guardrail-flash

## Resumen

Ammu-1.0-OffOnTopic-Guardrail-flash es un modelo de clasificación de texto publicado en HuggingFace por el usuario kalyan-ks. Por su nombre y sus etiquetas ("off-topic/on-topic guardrail"), está disenado para actuar como filtro de alcance tematico: determinar si una consulta o mensaje esta dentro del dominio permitido (on-topic) o fuera de el (off-topic). Este tipo de modelo se emplea habitualmente como capa de guarda en asistentes conversacionales y sistemas RAG.

El modelo se basa en la arquitectura ModernBERT (etiqueta "modernbert"), un transformer encoder-only moderno, y cuenta con 16.863.746 parametros, lo que lo situa en la gama de modelos muy ligeros. El repositorio ocupa aproximadamente 0,1 GB y se distribuye en formato safetensors, con soporte para la libreria transformers y compatibilidad declarada con text-embeddings-inference y endpoints.

La relevancia de este modelo radica en su proposito practico: los guardrails de alcance son un componente habitual en produccion para evitar que un agente o chatbot responda a peticiones fuera de su ambito, reduzcan alucinaciones y controlen costes. No obstante, la model card publicada es la plantilla automatica de HuggingFace sin rellenar, por lo que no hay informacion verificada sobre datos de entrenamiento, licencia ni evaluacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (encoder-only, segun etiquetas del repositorio) |
| Parametros totales | 16.863.746 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos safetensors en el repositorio) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo pertenece a la familia ModernBERT, una arquitectura transformer de tipo encoder-only orientada a tareas de comprension y clasificacion de texto. Las etiquetas del repositorio ("modernbert", "text-classification") confirman este encuadre, pero la model card no aporta detalles sobre profundidad, numero de capas, dimensiones ocultas, mecanismo de atencion ni tarea exacta de preentrenamiento.

No hay informacion publicada sobre los datos de entrenamiento: se desconoce el numero de tokens, la composicion del dataset, el corpus de ajuste fino para la tarea de clasificacion on-topic/off-topic, ni si se emplearon tecnicas como RLHF, DPO o destilacion. Tampoco se documentan innovaciones tecnicas adicionales mas alla de lo que implica la propia arquitectura ModernBERT. Toda esta seccion queda marcada como no disponible al no aparecer en la model card.

## Capacidades

- Clasificacion de texto binaria o categorica orientada a determinar si una entrada esta dentro del tema permitido (on-topic) o fuera de el (off-topic), a partir del nombre del modelo.
- Actua como guardrail de entrada, filtrando consultas antes de que lleguen al modelo generativo principal.
- Inferencia de baja latencia gracias a su reducido tamano (aproximadamente 16,9 millones de parametros).
- Integrable en el ecosistema transformers y compatible con text-embeddings-inference y endpoints segun las etiquetas.
- No es un modelo generativo: no produce texto, no soporta tool calling, no tiene modo de razonamiento y no gestiona conversaciones multi-turno por si mismo.
- Capacidades multilingues: no disponible.

## Casos de uso

- Filtrado de alcance en chatbots de atencion al cliente: el clasificador recibe cada mensaje del usuario y decide si entra dentro del dominio cubierto (facturacion, soporte tecnico, etc.); los mensajes off-topic se desvian a un mensaje de fallback, evitando respuestas irrelevantes.
- Proteccion de sistemas RAG: antes de ejecutar la recuperacion documental, el guardrail descarta preguntas fuera del corpus, lo que reduce recuperaciones espurias y alucinaciones del generador.
- Enrutado de consultas (routing): en plataformas con varios asistentes especializados, el clasificador determina el dominio de la consulta y la dirige al agente correspondiente.
- Moderacion de entrada en asistentes corporativos: se usa para impedir que el asistente responda a temas fuera de politica (por ejemplo, asuntos legales o medicos), manteniendo el sistema dentro del ambito autorizado.
- Preprocesado de bajo coste en pipelines de agentes: al ser un modelo muy pequeno, puede ejecutarse en cada turno para descartar entradas irrelevantes antes de invocar modelos generativos mucho mas caros.
- Control de calidad en plataformas de comunidad: clasificar automaticamente mensajes como on-topic u off-topic para moderacion o etiquetado previo.
- Componente de evaluacion en datasets sinteticos: etiquetar grandes volumenes de pares pregunta-tema de forma rapida en fase de cura de datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,07 GB en FP32 (unos 67 MB de pesos) y alrededor de 0,03-0,04 GB en FP16/BF16, sin contar activaciones ni overhead del runtime.
- Cabe con holgura en cualquier GPU consumer (GTX 1650, RTX 3060, RTX 4090) e incluso en CPU o en dispositivos de borde; el cuello de botella sera el ancho de banda de memoria, no la capacidad.
- GPU recomendadas: cualquiera de gama media o superior es suficiente; para despliegues de altisimo throughput se puede usar A100/H100 con batching, aunque resultan sobredimensionadas para este tamano.
- Opciones de despliegue: transformers (pipeline de text-classification), text-embeddings-inference (segun etiquetas) y, en general, cualquier servidor de inferencia compatible con modelos encoder de HuggingFace. No se documenta soporte explicito de llama.cpp, Ollama o vLLM en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

La informacion proporcionada no incluye datos de comparacion con otros modelos. No obstante, conviene senalar que el espacio de guardrails de alcance esta dominado habitualmente por dos enfoques distintos: clasificadores encoder ligeros como este (rapidos y de bajo coste) y modelos generativos de moderacion del estilo Llama Guard, mucho mas grandes y costosos. Sin embargo, al no disponer de la licencia, el contexto, los idiomas ni resultados de evaluacion de este modelo, no es posible establecer una comparativa cuantitativa fiable.

| Modelo | Parametros | Contexto | Licencia | Estado |
|---|---|---|---|---|
| Ammu-1.0-OffOnTopic-Guardrail-flash | 16,9 M | no disponible | no disponible | publicado |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- La model card es la plantilla automatica de HuggingFace y no contiene informacion real: se desconoce el autor, la procedencia de los datos, la licencia y las condiciones de uso.
- Con 0 descargas y 0 likes en el momento de la consulta, no hay evidencia de validacion por parte de la comunidad.
- La licencia no esta declarada, lo que impide confirmar si se permite el uso comercial; no debe desplegarse en produccion sin aclarar este punto.
- No se especifican los idiomas soportados; no se puede asumir cobertura del castellano ni de otros idiomas.
- Al ser un clasificador entrenado para un dominio concreto, es probable que su rendimiento degrade ante vocabulario, jerga o dominios distintos de los de entrenamiento.
- Riesgo de falsos positivos y falsos negativos inherente a cualquier guardrail: descartar consultas legitimas como off-topic o dejar pasar contenido fuera de alcance.
- No se han publicado metricas de evaluacion, matrices de confusion ni umbrales recomendados, por lo que no es posible calibrar la fiabilidad.
- Este modelo no genera respuestas; cualquier expectativa de comportamiento conversacional debe cubrirse con un modelo generativo adicional.

## Enlaces

- Pagina del modelo en HuggingFace: https://huggingface.co/kalyan-ks/Ammu-1.0-OffOnTopic-Guardrail-flash
- Referencia citada en las etiquetas (Lacoste et al., 2019, calculo de impacto): https://arxiv.org/abs/1910.09700
- Calculadora de impacto de machine learning: https://mlco2.github.io/impact
- No se han encontrado papers, blogs, repositorios ni demos adicionales del modelo en la informacion proporcionada.
