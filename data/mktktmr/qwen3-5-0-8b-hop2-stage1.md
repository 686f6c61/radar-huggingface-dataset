# mktktmr/qwen3.5-0.8b-hop2-stage1

## Resumen

`mktktmr/qwen3.5-0.8b-hop2-stage1` es un ajuste fino (fine-tune) del modelo base Qwen/Qwen3.5-0.8B, publicado por el usuario mktktmr en Hugging Face. Se trata de un modelo especializado en una tarea muy concreta: dado un par formado por una pregunta y los documentos recuperados en una búsqueda, el modelo debe seleccionar un unico nombre propio (entidad nombrada) que sera el siguiente termino de busqueda en un pipeline de recuperacion multi-salto (multi-hop retrieval). El nombre del repositorio, "hop2-stage1", indica que corresponde a la primera etapa del segundo salto de un sistema de busqueda iterativa.

El modelo tiene 852.985.920 parametros (aproximadamente 0,85 mil millones) en formato safetensors, con un tamano de repositorio de 1,7 GB. Se ha obtenido mediante LoRA (Low-Rank Adaptation) sobre el modelo base y posteriormente se han fusionado los pesos adaptados en el modelo principal, de modo que la inferencia se realiza sobre un unico conjunto de pesos densos, sin necesidad de cargar adaptadores separados.

La relevancia de este modelo es acotada pero clara: no es un modelo de proposito general, sino un componente de un sistema mayor de respuesta a preguntas multi-salto en japones. Su interes practico radica en que demuestra como un modelo pequeno (sub-1B) puede especializarse mediante LoRA en una subtarea de seleccion de entidades dentro de un pipeline RAG (Retrieval-Augmented Generation) iterativo, con un coste computacional muy bajo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Qwen3.5, segun el campo `qwen3_5` de los tags) |
| Parametros totales | 852.985.920 (~0,85 B) |
| Parametros activos | no disponible (no es un modelo MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio solo contiene safetensors en el momento de la consulta) |
| Idiomas soportados | no disponible de forma explicita; los datos de entrenamiento son en japones (JEMHopQA y Wikipedia japonesa) |
| Licencia | no disponible en el repositorio; el modelo base Qwen/Qwen3.5-0.8B se declara Apache-2.0 segun la model card |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del Qwen3.5-0.8B, un transformer decoder-only de la familia Qwen3.5. Sobre esa base se aplico un ajuste fino con LoRA, cuyos pesos se fusionaron posteriormente en el modelo principal ("LoRA で追加学習し、本体にマージしたもの", es decir, "entrenado adicionalmente con LoRA y fusionado en el cuerpo principal"). No se especifican en la informacion disponible el rango del LoRA, la tasa de aprendizaje, el numero de pasos ni la composicion exacta del dataset mas alla de las fuentes citadas.

Los datos de entrenamiento declarados son dos: por un lado, JEMHopQA (un conjunto de preguntas multi-salto en japones, con licencia CC BY-SA 4.0, filtrado y reformateado para el entrenamiento); por otro, un conjunto de fragmentos distribuidos derivados de Wikipedia en japones (tambien CC BY-SA 4.0). La tarea aprendida es de clasificacion/generacion restringida: extraer de los documentos de contexto un unico nombre propio que sirva como siguiente consulta de busqueda. No se menciona el uso de RLHF, DPO ni tecnicas de decodificacion especulativa.

## Capacidades

- Seleccion de terminos de busqueda: dada una pregunta y un conjunto de documentos recuperados, el modelo devuelve un unico nombre propio que actua como siguiente consulta en un pipeline de recuperacion multi-salto.
- Razonamiento extractivo sobre contexto: identifica entidades relevantes dentro de pasajes de texto en japones.
- Procesamiento de lenguaje natural en japones: los datos de entrenamiento y las fuentes (JEMHopQA, Wikipedia japonesa) indican competencia en ese idioma.
- Integracion en pipelines RAG iterativos: pensado como componente de una etapa intermedia ("hop 2, stage 1") de un sistema de busqueda encadenada.
- Generacion de texto general: al derivar de Qwen3.5-0.8B, conserva las capacidades del modelo base, aunque no se documentan en la informacion disponible.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso autonomo: no disponible; el modelo cubre una subtarea concreta dentro de un agente externo, no la orquestacion completa.
- Capacidades multimodales (vision, audio): no disponible.

## Casos de uso

- Respuesta a preguntas multi-salto en japones: el modelo se inserta como selector de la siguiente entidad a buscar tras una primera ronda de recuperacion, permitiendo encadenar busquedas hasta reunir evidencia suficiente para responder. Es adecuado porque su entrenamiento esta alineado exactamente con esa subtarea.
- Construccion de pipelines RAG iterativos: en un sistema que recupera documentos, formula una nueva consulta y vuelve a recuperar, este modelo actua como el modulo que transforma pregunta + contexto en la siguiente consulta (un nombre propio), reduciendo la necesidad de un LLM grande en esa etapa.
- Extraccion de entidades para grafos de conocimiento: dado un pasaje y una pregunta, el modelo identifica la entidad puente que conecta dos hechos, util para poblar o navegar grafos de conocimiento en japones.
- Enrutamiento de consultas en motores de busqueda internos: en un buscador corporativo con documentos en japones, el modelo puede sugerir terminos de refinamiento a partir de los resultados iniciales.
- Prototipado de bajo coste: con menos de 1B de parametros, permite experimentar con estrategias de recuperacion multi-hop en hardware modesto antes de escalar a modelos mayores.
- Evaluacion de tecnicas de recuperacion multi-hop: sirve como componente reproducible para comparar estrategias de seleccion de consultas sobre JEMHopQA, ya que el modelo y las fuentes de datos estan publicamente referenciadas.
- Filtrado de contexto en sistemas de dialogo documental: dado un historial de conversacion y documentos recuperados, selecciona la entidad sobre la que profundizar en la siguiente interaccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precision completa (fp32): aproximadamente 3,4 GB solo para pesos (852.985.920 parametros x 4 bytes), mas overhead de activaciones y cache KV.
- VRAM estimada en fp16/bf16: aproximadamente 1,7 GB para pesos, mas overhead; encaja comodamente en GPUs consumer con 4-8 GB.
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 0,85 GB para pesos; en 4 bits, en torno a 0,4-0,5 GB.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) es suficiente; tambien cabe en GPUs de portatil con 6-8 GB. Para despliegue en servidor, A100 o H100 no son necesarias pero funcionarian.
- Cabe en GPU consumer: si, con amplio margen, incluso en configuraciones de gama baja.
- Opciones de despliegue: al publicarse en safetensors, es compatible con librerias estandar de transformers (PyTorch), y previsiblemente con vLLM, TGI y llama.cpp/Ollama si se generan conversiones a GGUF (no incluidas en el repositorio).
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; por el tamano del modelo, se espera una latencia muy baja en GPU consumer, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mktktmr/qwen3.5-0.8b-hop2-stage1 | ~0,85 B | no disponible | Seleccion de entidad para busqueda multi-hop (japones) | no disponible (base Apache-2.0) | Hugging Face, 0 descargas |
| Qwen/Qwen3.5-0.8B | ~0,85 B | no disponible | Proposito general | Apache-2.0 (segun model card) | Hugging Face |
| Modelos de proposito general de ~1B (p. ej., familia Qwen3 small) | ~1 B | no disponible | Proposito general | variable | Hugging Face |

No se dispone de informacion sobre modelos especializados equivalentes en seleccion de entidades para recuperacion multi-hop en japones, por lo que la comparativa funcional directa no esta disponible.

## Limitaciones y advertencias

- Modelo altamente especializado: solo realiza la tarea de seleccionar un nombre propio como siguiente consulta; no es adecuado como asistente general ni como generador de respuestas finales.
- Idioma: los datos de entrenamiento son en japones; el rendimiento en castellano u otros idiomas no esta documentado y probablemente sea deficiente para la tarea objetivo.
- Licencia no declarada en el repositorio: aunque el modelo base se declara Apache-2.0, la licencia del fine-tune no aparece en la informacion disponible, lo que genera incertidumbre para uso comercial. Ademas, los datos de entrenamiento tienen licencia CC BY-SA 4.0 (JEMHopQA y fragmentos de Wikipedia japonesa), lo que puede imponer obligaciones de atribucion o comparticion derivada.
- Riesgo de alucinacion: al ser un modelo generativo pequeno, podria producir entidades que no aparecen en el contexto o nombres mal formados; no hay datos publicados sobre su tasa de error.
- Sin benchmarks ni evaluacion publicada: no hay evidencia cuantitativa de su calidad frente a alternativas.
- Cero descargas y cero likes en el momento de la consulta: no hay senales de validacion por parte de la comunidad.
- Contexto maximo no documentado: se desconoce cuantos tokens de documentos puede procesar simultaneamente, lo que limita el diseno de pipelines que dependan de el.
- Fecha de creacion futura (2026-11-11) en los metadatos: conviene verificar la integridad y procedencia del repositorio antes de usarlo en produccion.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mktktmr/qwen3.5-0.8b-hop2-stage1
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- JEMHopQA (dataset): https://github.com/aiishii/JEMHopQA
- Licencia CC BY-SA 4.0: https://creativecommons.org/licenses/by-sa/4.0/
