# Anil-yilmaz/KiviAsistan-1.5B

## Resumen

KiviAsistan-1.5B es un ajuste fino del modelo Qwen/Qwen2.5-1.5B-Instruct publicado por el usuario Anil-yilmaz, diseñado como asistente de atención al cliente para una tienda de electrónica ficticia llamada Kivi Elektronik, en el marco de un proyecto de fin de grado (bitirme projesi). El modelo no es un modelo de propósito general: es un asistente vertical entrenado para adoptar una identidad corporativa concreta, responder con un formato de salida específico, consultar documentación interna mediante RAG y ejecutar herramientas de cálculo y de consulta de catálogo.

Técnicamente es un transformer decoder-only denso de 1.543.714.304 parámetros (unos 1,54 mil millones), afinado con QLoRA sobre 454 ejemplos sintéticos. El autor justifica la elección de la base por su competencia en turco, su ligereza para el proceso de fine-tuning y su velocidad de inferencia en una GPU T4. La longitud de contexto no se documenta en la model card, pero al conservar la arquitectura y los pesos del modelo base Qwen2.5-1.5B-Instruct cabría esperar 32.768 tokens, extremo que no se ha verificado en la información disponible.

Su relevancia es doble. Por un lado, sirve como plantilla reproducible de cómo convertir un modelo pequeño en un asistente corporativo con RAG y tool calling sobre hardware modesto. Por otro, y esto es importante para quien lo evalúe, el propio informe de evaluación del autor presenta inconsistencias graves: la batería de 15 preguntas puntúa con 90 sobre 100 respuestas que el propio documento marca como incorrectas o alucinadas, por lo que la cifra de "90 % de éxito" no debe tomarse como una métrica fiable sin una reevaluación independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen2), ajuste fino con QLoRA |
| Parametros totales | 1.543.714.304 (~1,54 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No documentada en la model card; el modelo base Qwen2.5-1.5B-Instruct soporta 32.768 tokens (no verificado en este fine-tuning) |
| Tipos de cuantizacion | No disponible; el repositorio solo contiene safetensors, sin versiones GGUF/AWQ/GPTQ publicadas |
| Idiomas soportados | Turco (idioma de entrenamiento y del informe); el modelo base Qwen2.5 es multilingue, pero el fine-tuning no documenta otros idiomas |
| Licencia | No disponible |
| Formato de pesos | safetensors (repositorio de 3,1 GB, coherente con pesos en bf16/fp16 fusionados) |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base Qwen2.5-1.5B-Instruct: un transformer decoder-only con atención por causalidad completa, sin mezcla de expertos ni componentes híbridos SSM. Sobre esa base se aplicó un ajuste fino con QLoRA, es decir, cuantización del modelo congelado (4 bits) más adaptadores de bajo rango entrenables, sobre un conjunto de 454 ejemplos sintéticos generados específicamente para el dominio. El informe no detalla hiperparámetros, rango de los adaptadores, número de épocas, composición exacta del dataset ni si se aplicó alguna fase de preferencia (DPO/RLHF); todos estos datos deben considerarse no disponibles.

La innovación del proyecto no está en el entrenamiento sino en el sistema que lo rodea. El modelo se concibe como el núcleo de un pipeline con dos componentes externos: un módulo RAG que recupera fragmentos de un documento interno (`rehber.pdf`) con las políticas de la tienda, y un conjunto de herramientas invocables, entre ellas `koruma_paketi_ucreti` (cálculo del coste del paquete de protección, un 8 % del precio del producto) y consultas al catálogo de productos y stock. El autor reporta que el modelo base no reconocía la identidad corporativa, no respetaba el formato y no invocaba herramientas, y que tras el ajuste sí lo hace. También documenta explícitamente el comportamiento sin RAG: ante preguntas sobre políticas internas no memorizadas, el modelo tiende a improvisar y a alucinar, lo que convierte el contexto recuperado en un requisito funcional, no en un extra.

## Capacidades

- Generación de texto conversacional en turco orientada a atención al cliente de comercio electrónico.
- Asunción de identidad corporativa ("Kivi Elektronik") y de un registro de marca consistente.
- Cumplimiento de un formato de respuesta propietario, con marcadores y reglas de estilo definidos por el autor.
- Tool calling / function calling para el cálculo del paquete de protección a partir del precio del producto.
- Consulta de productos, precios y disponibilidad de stock mediante herramientas externas.
- Integración con RAG sobre documentación interna en PDF para responder sobre políticas de envío, devoluciones, garantías, financiación y fidelización.
- Razonamiento aritmético básico en el contexto de precios (porcentajes, sumas, multiplicaciones de unidades).
- Gestión de conversaciones multi-turno dentro de la ventana de contexto del modelo base.
- Capacidad declarada de abstenerse o ceñirse al ámbito del documento; el propio informe admite que fuera de cobertura el modelo improvisa, por lo que esta capacidad no está garantizada.

No se documentan capacidades de visión, audio, modo "thinking" explícito ni soporte multilingüe verificado más allá del turco.

## Casos de uso

- **Atención al cliente de primer nivel en una tienda online turca**: el modelo gestiona consultas frecuentes (plazos de envío, costes, devoluciones) manteniendo la identidad de marca y un formato uniforme, lo que reduce el coste por interacción frente a un modelo generalista.
- **Asistente RAG sobre políticas internas**: conectado a un pipeline de recuperación sobre el manual de la tienda, responde con el fragmento normativo concreto en lugar de improvisar. Es el modo de uso para el que el autor lo diseñó y el único en el que reconoce que el rendimiento es aceptable.
- **Cálculo automatizado de recargos y garantías**: la herramienta `koruma_paketi_ucreti` permite calcular en tiempo de inferencia el 8 % del valor del producto, evitando que el modelo haga la aritmética por sí solo. Los ejemplos 14 y 15 del informe (25.000 TL → 2.000 TL; 38.499 TL → 3.079,92 TL) muestran que el patrón funciona cuando la herramienta se invoca correctamente.
- **Consulta de catálogo y disponibilidad**: integrado contra una tabla de productos, responde a preguntas de precio y stock. Requiere validación externa, porque el informe muestra al menos un caso (Pixa 65") en el que el modelo devuelve un precio erróneo.
- **Triaje y derivación a agente humano**: puede clasificar la consulta y decidir cuándo está fuera de alcance. Necesita una capa de reglas adicional, ya que el modelo no es fiable detectando sus propios límites.
- **Base para prototipos de asistentes verticales**: el enfoque (QLoRA sobre 1,5B + 454 ejemplos sintéticos + RAG + herramientas) es replicable en pocas horas de GPU para otros dominios con presupuesto reducido, y sirve como referencia metodológica más que como producto final.
- **Despliegue en infraestructura modesta u on-premise**: el autor lo diseñó explícitamente para inferencia rápida en una T4, lo que habilita escenarios de pyme con requisitos de soberanía de datos.
- **Banco de pruebas para evaluar pipelines RAG**: la comparativa con y sin contexto que incluye el informe, aunque metodológicamente débil, ilustra el patrón de evaluación que conviene formalizar con métricas de fidelidad y abstención.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, IFEval ni similares) en la información disponible. El autor solo aporta una evaluación interna, no reproducible, sobre 15 preguntas del dominio:

| Metrica | Modelo base (Qwen2.5-1.5B) | KiviAsistan-1.5B |
|---|---|---|
| Identidad corporativa reconocida | No | Si |
| Formato de respuesta propietario | No | Si |
| Invocación de herramientas | No | Si |
| Puntuación en batería interna de 15 preguntas | ~35,0 % | 90,0 % |

Advertencia sobre esta tabla: la puntuación de 90 se asigna de forma uniforme a las 15 respuestas, incluidas varias que el propio documento etiqueta como erróneas o alucinadas (por ejemplo, la respuesta a la pregunta 2 se marca literalmente como "¡inventado!" y aun así recibe 90 puntos; las respuestas 6, 7, 8, 9, 10, 11 y 13 son incorrectas o incoherentes y también reciben 90). La métrica, por tanto, no mide exactitud y no debe citarse como indicador de calidad.

| Ejemplo de fallo documentado | Pregunta | Respuesta del modelo | Respuesta correcta |
|---|---|---|---|
| Precio de producto | Pixa 65" OLED | 24.999 TL | 64.999 TL |
| Aritmética multiunidad | 2 x Aero 14 | "Kapıdarlığı 2 TL'dir" | 76.998 TL |
| Política de devolución | Auriculares abiertos | Respuesta incoherente | No admite devolución por higiene |

## Requisitos de hardware

- **Pesos en bf16/fp16**: 3,1 GB. VRAM mínima práctica para inferencia: 3,5-4 GB; con contexto largo y caché KV, 6-8 GB recomendables.
- **Cuantización int8**: ~1,6 GB de pesos; cabe holgadamente en GPUs de 4 GB.
- **Cuantización int4 (GGUF Q4_K_M)**: ~1,0-1,1 GB de pesos; requiere convertir los safetensors a GGUF, ya que el autor no publica versiones cuantizadas.
- **GPU objetivo declarada**: NVIDIA T4 (16 GB), citada explícitamente por el autor como plataforma de inferencia.
- **GPUs consumer compatibles**: RTX 4090, 4080, 4070, 4060 Ti, 3090, 3060 12 GB e incluso 3050 8 GB en bf16; GTX 1660 6 GB solo en cuantización int8/int4.
- **CPU**: inferencia viable en llama.cpp/Ollama con cuantización Q4, con latencias notablemente superiores.
- **Opciones de despliegue**: Transformers + PEFT (si se conservan adaptadores separados) o Transformers directo si los pesos están fusionados, vLLM y TGI para servido con concurrencia, llama.cpp y Ollama previa conversión a GGUF, y FastAPI o similar como capa de orquestación del RAG y de las herramientas.
- **Latencia y throughput**: no disponibles. No se han publicado mediciones de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| KiviAsistan-1.5B | ~1,54 B | No documentado (base: 32.768) | No disponible | Asistente vertical de e-commerce en turco, fine-tuning QLoRA | HuggingFace, 0 descargas |
| Qwen2.5-1.5B-Instruct | ~1,54 B | 32.768 tokens | Apache 2.0 | Modelo instruct generalista multilingue | Ampliamente disponible y auditado |
| Llama 3.2 1B Instruct | ~1,24 B | 128.000 tokens | Llama 3.2 Community License | Instruct generalista, foco multilingue | Ampliamente disponible |
| Gemma 2 2B IT | ~2,6 B | 8.192 tokens | Gemma Terms of Use | Instruct generalista ligero | Ampliamente disponible |
| SmolLM2 1.7B Instruct | ~1,7 B | 8.192 tokens | Apache 2.0 | Instruct generalista ligero | Ampliamente disponible |

No se dispone de resultados de benchmarks comparables entre KiviAsistan y estas alternativas. La comparación relevante no es de rendimiento bruto sino de adecuación: para cualquier tarea fuera del dominio Kivi Elektronik, el modelo base Qwen2.5-1.5B-Instruct es estrictamente preferible por licencia clara, mantenimiento y versatilidad.

## Limitaciones y advertencias

- **Evaluación no fiable**: la puntuación de 90/100 se aplica uniformemente a respuestas correctas e incorrectas. El propio informe contiene al menos siete respuestas erróneas puntuadas con la máxima nota. Cualquier afirmación de calidad basada en esa cifra carece de validez.
- **Alucinación dentro del dominio**: no solo fuera de él. El modelo inventa precios (24.999 TL en lugar de 64.999 TL), calcula mal pedidos con varias unidades y responde de forma incoherente sobre políticas de devolución, fidelización y montaje.
- **Dependencia crítica del RAG**: sin contexto recuperado, el autor reconoce que el modelo improvisa. El sistema solo es utilizable si el pipeline de recuperación funciona y si el documento está actualizado.
- **Sobreajuste a 454 ejemplos sintéticos**: el volumen es muy reducido y la distribución, artificial. Es esperable rigidez de formato, escasa generalización y degradación ante variaciones léxicas no vistas.
- **Idioma**: entrenado y evaluado únicamente en turco. No hay evidencia de comportamiento correcto en castellano ni en otros idiomas, aunque el modelo base sea multilingüe.
- **Licencia no disponible**: no se especifica licencia en el repositorio. Sin una licencia explícita, el uso comercial es jurídicamente arriesgado en la mayoría de jurisdicciones, con independencia de que el modelo base Qwen2.5 sea Apache 2.0 (habría que verificar que los términos del fine-tuning no añaden restricciones).
- **Sin validación comunitaria**: 0 descargas y 0 likes en el momento de la consulta. No hay informes de terceros, ni issues, ni reproducciones independientes.
- **Documentación insuficiente**: el informe no detalla hiperparámetros de entrenamiento, composición del dataset, proceso de generación de los ejemplos sintéticos ni métricas de retención de capacidades del modelo base. Tampoco se documenta si se produjo olvido catastrófico tras el ajuste.
- **Metadatos anómalos**: la fecha de creación del repositorio indicada en HuggingFace (2026-10-20) es posterior a la fecha actual, lo que sugiere un error de metadatos o un repositorio de pruebas. Conviene tratarlo como un artefacto no mantenido.
- **Formato propietario**: el marcador de estilo que el modelo debe emitir al final de cada respuesta no aporta valor funcional y consume tokens; además, ejemplos del propio informe muestran que se emite en respuestas claramente erróneas, lo que puede dar una falsa sensación de corrección en un sistema con verificación automática por formato.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Anil-yilmaz/KiviAsistan-1.5B
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Paper de la familia Qwen2.5: no disponible en la información proporcionada
- Repositorio de código, demo o dataset: no disponibles en la información proporcionada
- Resultados de la búsqueda web: no se han encontrado enlaces relevantes al modelo. Los resultados devueltos corresponden a la Agence nationale pour l'information sur le logement (ANIL) francesa y no guardan relación con este modelo.
