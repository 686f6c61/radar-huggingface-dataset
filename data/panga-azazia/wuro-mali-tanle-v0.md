# Panga-Azazia/Wuro-Mali-Tanle-v0

## Resumen

Wuro-Mali-Tanle-v0 es un ajuste fino (fine-tuning) del modelo base maya-research/maya1, publicado por el usuario Panga-Azazia en HuggingFace. Se trata de un modelo de generacion de texto de aproximadamente 3.300 millones de parametros (3.300.928.512 segun los pesos en safetensors), etiquetado con la arquitectura llama y entrenado con la libreria Unsloth, segun los tags del repositorio. El pipeline declarado es text-generation y esta pensado para uso conversacional.

El modelo se distribuye bajo licencia Apache 2.0, pero el acceso es restringido: es un repositorio gated que exige aceptar las condiciones en HuggingFace antes de descargar los pesos. El unico idioma declarado es el ingles (en), y el repositorio ocupa 6,6 GB, un tamano coherente con pesos en precision de 16 bits para un modelo de esta escala.

La relevancia de esta ficha es limitada y conviene ser explicito: el modelo no tiene descargas ni likes en el momento de la consulta (0 y 0 respectivamente), no se han publicado resultados de benchmarks en la informacion disponible y no se documentan detalles de contexto, dataset de entrenamiento ni proceso de alineacion. Por tanto, debe evaluarse como un experimento de fine-tuning de la comunidad, no como un modelo listo para produccion sin validacion previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | llama (transformer decoder-only, segun el tag del repositorio) |
| Parametros totales | 3.300.928.512 (aproximadamente 3,3 B) |
| Parametros activos | no aplica (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio solo publica safetensors; no se listan GGUF ni cuantizaciones precalculadas) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Modelo base | maya-research/maya1 (fine-tune) |
| Tamano del repositorio | 6,6 GB |
| Acceso | restringido (gated), requiere aceptar condiciones en HuggingFace |
| Libreria | transformers |

## Arquitectura y entrenamiento

La informacion disponible solo permite afirmar que se trata de un modelo transformer de tipo decoder-only con arquitectura etiquetada como llama y aproximadamente 3,3 mil millones de parametros. El tag `unsloth` indica que el ajuste fino se realizo con la libreria Unsloth, habitualmente empleada para fine-tuning eficiente en memoria mediante tecnicas como LoRA o QLoRA, aunque no se especifica la tecnica concreta, el rango, ni si el resultado es un merge completo de pesos (el tamano del repositorio, 6,6 GB, es compatible con pesos completos en 16 bits).

No hay informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, la existencia de fases de RLHF, DPO u otra alineacion, ni sobre innovaciones tecnicas como decodificacion especulativa o mecanismos de atencion alternativa. El modelo base es maya-research/maya1, cuyas caracteristicas no se detallan en la informacion proporcionada. Tampoco se documenta el proceso de tokenizacion ni el vocabulario empleado.

## Capacidades

- Generacion de texto conversacional: el tag `conversational` y el pipeline `text-generation` indican uso orientado a dialogos multi-turno, sin que se detallen plantillas de chat ni formato de prompt.
- Modelo base de tipo instruct/chat: al ser un fine-tune de maya-research/maya1, hereda las capacidades del modelo base, que no se especifican en la informacion disponible.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: solo se declara ingles (en). No hay evidencia de soporte para otros idiomas.
- Capacidades especiales (modo thinking, vision, audio): no disponible.
- Compatibilidad de despliegue: los tags incluyen `text-generation-inference` y `endpoints_compatible`, lo que sugiere compatibilidad con TGI y con Inference Endpoints de HuggingFace.

## Casos de uso

Dado que no hay benchmarks, documentacion de contexto ni ejemplos publicados, los casos siguientes son escenarios plausibles para un modelo conversacional de 3,3 B, no aplicaciones validadas. Requieren evaluacion previa por parte del equipo que lo adopte.

- Prototipado rapido de asistentes conversacionales en ingles: el tamano de 3,3 B permite iterar en una unica GPU de gama media, con coste bajo por prueba, antes de decidir si se escala a un modelo mayor.
- Fine-tuning posterior especifico de dominio: al ser un modelo pequeno y con licencia Apache 2.0, puede servir como punto de partida para especializaciones adicionales sobre un dominio concreto (legal, sanitario, atencion al cliente) sin costes de licencia.
- Generacion de texto en lote (resumen, reescritura, clasificacion generativa): con un throughput potencialmente alto por su tamano reducido, es adecuado para tareas offline donde la latencia no es critica, siempre que la calidad se valide contra una referencia.
- Experimentacion academica y reproducibilidad: util como baseline ligero en estudios comparativos de tecnicas de fine-tuning, dado que declara el modelo base y la herramienta de entrenamiento.
- Despliegue en entornos con recursos limitados: una unica GPU consumer o incluso CPU con cuantizacion a 4 bits puede alojar el modelo, lo que habilita demos locales y entornos de desarrollo sin infraestructura dedicada.
- Chatbot interno de bajo riesgo: para asistentes de documentacion o ayuda interna donde los errores sean reversibles y exista supervision humana, aprovechando la licencia permisiva.
- Componente de generacion en pipelines con TGI: el tag `text-generation-inference` apunta a su uso como backend de un servicio HTTP de generacion dentro de una arquitectura ya basada en TGI.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (aproximaciones calculadas a partir del numero de parametros, no medidas sobre este modelo concreto):
  - FP16/BF16: aproximadamente 6,6 GB solo para pesos, mas memoria para cache KV y activaciones (dependiente de la longitud de contexto, que no se conoce).
  - Int8: aproximadamente 3,3 GB de pesos.
  - 4 bits: aproximadamente 1,7-2 GB de pesos.
- GPU recomendadas: no disponibles como dato del autor. Por tamano, encaja con comodidad en RTX 4090, RTX 3090, A100 40/80 GB, H100 y L40S; tambien en GPUs de 16 GB (RTX 4060 Ti 16 GB, RTX A4000) y en GPUs de 12 GB (RTX 3060 12 GB) en FP16 con contexto moderado.
- Cabe en GPU consumer: si. En 4 bits es viable incluso en GPUs de 8 GB, asumiendo que la longitud de contexto permita mantener la cache KV dentro de ese presupuesto.
- Opciones de despliegue: transformers (libreria declarada), Text Generation Inference (tag `text-generation-inference`), Inference Endpoints (tag `endpoints_compatible`). vLLM, llama.cpp y Ollama son tecnicamente viables por tamano, pero no estan confirmados por el autor y requeririan conversion a GGUF en el caso de llama.cpp/Ollama; no se publican artefactos GGUF en el repositorio.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No se dispone de datos verificables de modelos comparables dentro de la informacion proporcionada, por lo que no es posible establecer una comparacion cuantitativa fiable.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Datos de rendimiento |
|---|---|---|---|---|---|
| Panga-Azazia/Wuro-Mali-Tanle-v0 | 3,3 B | no disponible | apache-2.0 | gated | no disponible |
| Llama 3.2 3B (referencia de categoria por tamano) | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | no disponible |
| Qwen2.5 3B (referencia de categoria por tamano) | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | no disponible |
| maya-research/maya1 (modelo base) | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Ausencia total de documentacion: no hay model card descriptiva, ni dataset, ni hiperparametros, ni proceso de alineacion publicados. Cualquier afirmacion sobre su comportamiento debe obtenerse por evaluacion propia.
- Sesgos conocidos: no disponible. Al no documentarse la composicion del dataset de ajuste fino, no es posible acotar sesgos de dominio, idioma, genero, etnia o ideologia.
- Riesgo de alucinacion: no cuantificado. Un fine-tune comunitario sin evaluacion publicada de factualidad debe asumirse con riesgo elevado de generar contenido incorrecto con apariencia de verosimilitud.
- Limitacion de idioma: solo se declara ingles. El uso en castellano u otros idiomas no esta soportado oficialmente y probablemente degrade la calidad, especialmente si el vocabulario del modelo base esta orientado al ingles. Nota: el nombre del modelo (Wuro-Mali-Tanle) sugiere un contexto linguistico de Africa Occidental, pero el repositorio declara unicamente `en`; no hay informacion que permita confirmar ni desmentir esta discrepancia.
- Limitacion de contexto: longitud de contexto no disponible, lo que impide garantizar conversaciones largas o procesamiento de documentos extensos.
- Restricciones de licencia: la licencia declarada es Apache 2.0, permisiva para uso comercial. Sin embargo, el acceso es gated y esta sujeto a las condiciones adicionales que el autor establezca en HuggingFace; conviene revisarlas antes de un uso comercial. Ademas, debe verificarse la licencia del modelo base maya-research/maya1, ya que un fine-tune no puede relajar las condiciones del modelo original.
- Advertencia para produccion: con 0 descargas y 0 likes, el modelo carece de validacion por parte de la comunidad. No se recomienda desplegarlo en produccion sin una bateria propia de evaluaciones (calidad, factualidad, seguridad, sesgo) y sin fijar una revision concreta del repositorio, dado que el autor puede modificar los pesos sin aviso.
- Trazabilidad: no se indica la revision (commit) de los pesos ni la fecha exacta del entrenamiento; la fecha de creacion del repositorio figura como 2026-09-14.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Panga-Azazia/Wuro-Mali-Tanle-v0
- Modelo base declarado: maya-research/maya1 (referenciado en los tags del repositorio; no se ha recuperado su URL en la busqueda web)
- No se han encontrado otros enlaces (papers, blogs, repositorios o demos) en la informacion disponible.
