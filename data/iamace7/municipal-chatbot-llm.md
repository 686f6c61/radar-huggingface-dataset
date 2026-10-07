# iamace7/municipal-chatbot-llm

## Resumen

`iamace7/municipal-chatbot-llm` es un modelo publicado en HuggingFace por el usuario iamace7, cuyo nombre sugiere un ajuste fino orientado a conversacion en el ambito municipal. El repositorio incluye pesos en formato safetensors, tiene 153 descargas y ningun "like", y su ficha no aporta informacion sobre pipeline, licencia ni idiomas. El modelo fue creado el 2 de octubre de 2026 y actualizado el 7 de octubre de 2026.

El dato tecnico mas relevante es el recuento de parametros: 81.912.576 (aproximadamente 81,9 millones). Esta cifra coincide exactamente con la de `distilgpt2`, la version destilada de GPT-2, y la etiqueta `gpt2` del repositorio apunta a que se trata de un fine-tuning de la familia GPT-2. La longitud de contexto, la composicion del dataset de entrenamiento y el proceso de alineamiento no estan documentados en la informacion disponible.

El interes de esta ficha es, por tanto, limitado pero util como advertencia: se trata de un modelo muy pequeno (dos ordenes de magnitud por debajo de los LLM actuales de 7B-70B), sin model card, sin licencia declarada y sin benchmarks publicados. El tamano del repositorio, 8,5 GB, es desproporcionado para un modelo de 81,9 M de parametros y sugiere la presencia de multiples copias de pesos, checkpoints intermedios o estados de optimizador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (la etiqueta del repositorio indica `gpt2`, es decir, familia transformer decoder-only de GPT-2) |
| Parametros totales | 81.912.576 |
| Parametros activos | No aplica (no hay indicios de que sea un modelo MoE) |
| Longitud de contexto | No disponible (la arquitectura GPT-2 suele usar 1024 tokens, sin confirmar en este repositorio) |
| Tipos de cuantizacion | No disponible (solo se confirma safetensors; no se publican versiones GGUF, GPTQ, AWQ ni bitsandbytes) |
| Idiomas soportados | No disponible (el nombre del modelo sugiere uso en espanol, sin confirmar) |
| Licencia | No disponible |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

No se dispone de informacion publicada sobre la arquitectura concreta. La unica evidencia es la etiqueta `gpt2` del repositorio y el recuento de parametros (81.912.576), que coincide con la configuracion de `distilgpt2`: 6 capas de transformer, 768 dimensiones ocultas, 12 cabezas de atencion y embeddings de tokens atados a la capa de salida. Si esa correspondencia es correcta, se trataria de un transformer decoder-only con atencion causal completa, sin mecanismos de atencion lineal, sin decodificacion especulativa y sin capas MoE.

Tampoco hay datos sobre el proceso de entrenamiento: se desconoce el numero de tokens, la composicion del corpus (si se uso normativa municipal, transcripciones de atencion al ciudadano, FAQ de sedes electronicas u otra fuente), si hubo ajuste supervisado, RLHF o DPO, y con que hiperparametros. La actualizacion del repositorio cinco dias despues de su creacion podria indicar una iteracion del fine-tuning, pero es una interpretacion no confirmada.

## Capacidades

- Generacion de texto autoregresiva basica, limitada por el tamano del modelo (81,9 M de parametros).
- Conversacion multi-turno en el formato para el que haya sido ajustado, presumiblemente atencion ciudadana municipal, sin que exista documentacion que lo confirme.
- Capacidad de razonamiento, matematicas y codigo: no disponible y, por tamano, muy limitada en la practica.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles; sin model card que declare idiomas.
- Capacidades especiales (modo thinking, vision, audio, decodificacion especulativa): no disponibles.
- No hay evidencia de soporte de plantillas de chat tipo ChatML, system prompt ni tokens especiales de rol.

## Casos de uso

- Prototipado de FAQ municipales: dado su tamano, el modelo puede desplegarse en cualquier portatil para probar rapidamente si un enfoque de lenguaje natural encaja en un portal de sede electronica antes de invertir en un modelo mayor.
- Clasificacion de intenciones y enrutado de consultas: en un flujo de atencion al ciudadano, el modelo puede etiquetar consultas entrantes (licencias de obra, empadronamiento, tasas, cita previa) y derivarlas al departamento correspondiente, una tarea viable con un modelo de 82 M de parametros.
- Generacion de respuestas cortas y plantilladas: redaccion de acuses de recibo, confirmaciones de registro o resumenes de un parrafo a partir de datos estructurados, con supervision humana obligatoria.
- Base para un fine-tuning posterior con datos propios de la administracion: al ser pequeno, admite reentrenamiento completo en una unica GPU de consumo en tiempos razonables, lo que lo convierte en un punto de partida economico.
- Experimentacion academica y docencia: util en asignaturas o trabajos sobre ajuste fino de transformers, analisis de sesgos en corpus administrativos o comparacion de estrategias de destilacion, por su bajo coste de computo.
- Investigacion sobre sesgos en lenguaje administrativo: permite analizar que vocabulario y que formulaciones reproduce un modelo entrenado con textos institucionales, sin el coste de ejecutar modelos de miles de millones de parametros.
- Simulacion offline y entornos aislados: al caber en memoria de cualquier maquina y no requerir aceleradores, puede ejecutarse en equipos sin GPU o en redes desconectadas, algo relevante en entornos de administracion publica con restricciones de conectividad.
- No se recomienda su uso directo en produccion de cara al ciudadano sin una evaluacion previa de exactitud, sesgos y cumplimiento normativo, dado que no hay licencia declarada ni documentacion tecnica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Memoria de pesos estimada a partir del recuento real de parametros (81.912.576):
  - FP32: aproximadamente 328 MB
  - FP16 / BF16: aproximadamente 164 MB
  - INT8: aproximadamente 82 MB
  - 4 bits: aproximadamente 41 MB
- VRAM para inferencia: inferior a 1 GB en FP16 sumando pesos, cache KV y overhead del runtime, para una ventana de contexto de 1024 tokens. Cabe holgadamente en cualquier GPU consumer de los ultimos diez anos.
- GPU recomendadas: no se requiere GPU. Cualquier GPU NVIDIA con 2 GB o mas (GTX 1050, RTX 2060, RTX 3060, RTX 4090) es mas que suficiente; tambien funciona en CPU y en Apple Silicon.
- Opciones de despliegue: `transformers` con PyTorch, llama.cpp u Ollama si se generan pesos GGUF (no publicados en el repositorio), y cualquier servidor basado en la libreria de transformers. vLLM y TGI son tecnicamente viables pero su optimizacion esta pensada para modelos mayores; el beneficio seria marginal.
- Latencia y throughput: no disponibles. No hay mediciones publicadas y dependen por completo del hardware y del runtime empleado.
- Advertencia sobre el repositorio: 8,5 GB para un modelo de 81,9 M de parametros implica que la mayor parte del espacio corresponde a ficheros distintos de los pesos finales en precision simple; conviene inspeccionar el arbol de ficheros antes de descargar.

## Comparativa con modelos similares

Los valores de los modelos alternativos son cifras publicas ampliamente conocidas y se incluyen como referencia; los de este modelo proceden del repositorio consultado.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| `iamace7/municipal-chatbot-llm` | 81,9 M | No disponible | No disponible | HuggingFace, 153 descargas | Sin model card, sin benchmarks, sin licencia |
| distilgpt2 (OpenAI / HuggingFace) | 82 M | 1024 tokens | MIT | Amplia, millones de descargas | Version destilada de GPT-2, misma huella de parametros; entrenada para generacion general |
| gpt2 (OpenAI) | 124 M | 1024 tokens | MIT | Amplia | Modelo base de referencia de la familia, sin ajuste conversacional |
| DialoGPT-small (Microsoft) | 117 M | 1024 tokens | MIT | Moderada | Ajustado especificamente para dialogo multi-turno en ingles |

La comparacion directa con distilgpt2 mediante benchmarks no es posible en este momento: no hay resultados publicados para `municipal-chatbot-llm`. Cualquier afirmacion sobre su rendimiento relativo seria especulativa.

## Limitaciones y advertencias

- Ausencia total de model card: no se documentan datos de entrenamiento, hiperparametros, proceso de alineamiento ni evaluacion.
- Licencia no declarada: en ausencia de licencia explicita, la legislacion de propiedad intelectual aplicable (incluida la espanola y la europea) no autoriza por defecto el uso comercial ni la redistribucion. No debe desplegarse en produccion hasta aclarar este punto con el autor.
- Tamano reducido: con 81,9 M de parametros y arquitectura tipo GPT-2, la coherencia en conversaciones largas es limitada, la ventana de contexto es corta y la capacidad de seguir instrucciones complejas es escasa.
- Riesgo alto de alucinacion: los modelos de esta escala generan texto plausible sin verificacion factual. En un contexto municipal, una respuesta incorrecta sobre plazos, tasas o requisitos administrativos puede tener consecuencias legales para el ciudadano. Se exige supervision humana y recuperacion documental externa (RAG) si se usa en atencion al publico.
- Sesgos: no evaluados. Si el ajuste se hizo con un corpus institucional limitado, el modelo reproducira el vocabulario, las formulas y los sesgos de esa fuente, sin filtrado conocido.
- Idiomas: no declarados. Aunque el nombre sugiere espanol, no hay confirmacion, y un modelo destilado de GPT-2 tiene un dominio del espanol notablemente inferior al del ingles si el ajuste fue corto.
- Repositorio sobredimensionado: 8,5 GB para 81,9 M de parametros indica ficheros redundantes o checkpoints intermedios; conviene verificar integridad y contenido antes de integrarlo en cualquier pipeline.
- Sin pipeline declarado: no se confirma la tarea (`text-generation`, `conversational`) ni la existencia de una plantilla de chat, por lo que la integracion requiere inspeccion manual de la configuracion.
- Sin mantenimiento conocido: cero "likes" y una unica actualizacion a los cinco dias de la creacion no permiten anticipar soporte, correcciones ni evolucion del modelo.
- Cumplimiento normativo: si se emplea en un servicio publico, es necesario evaluar su encaje en el RGPD y en el reglamento europeo de inteligencia artificial, especialmente en lo relativo a transparencia y supervision humana.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/iamace7/municipal-chatbot-llm
- Paper, blog, repositorio de codigo, demo o dataset asociados: no disponibles en la informacion proporcionada.
