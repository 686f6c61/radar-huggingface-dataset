# NyayaLabs98/nyaya-3b-v3

## Resumen

Nyaya-3B-v3 es un modelo de generacion de texto desarrollado por NyayaLabs98, especializado en el dominio legal indio. Se trata de un ajuste fino (finetune) del modelo base Qwen/Qwen2.5-3B-Instruct, publicado con el objetivo de servir como lector de estatutos en sistemas de recuperacion aumentada (RAG) para el derecho de la India. El modelo esta pensado para leer secciones legales recuperadas y generar respuestas citadas, en ingles e hindi, sobre cuerpos normativos como el Bharatiya Nyaya Sanhita (BNS), el Bharatiya Nagarik Suraksha Sanhita (BNSS) y el Bharatiya Sakshya Adhiniyam (BSA).

La relevancia del modelo radica en su integracion con el ecosistema Nyaya, que incluye un retriever propio (nyaya-embed-v1) y una base de datos de estatutos (nyaya-statute-db). Sin embargo, la propia model card es explicita: en la evaluacion interna del proyecto, el modelo no supera al base del que parte. De hecho, se declara que sus resultados son estadisticamente indistinguibles de Qwen2.5-3B-Instruct, y que las mejoras del sistema provienen de la recuperacion, no de estos pesos. El modelo se publica como referencia y por su alineacion con el formato de prompt y el estilo de citacion del retriever Nyaya, no como una mejora sobre el base.

La arquitectura es un transformer denso de aproximadamente 3.090 millones de parametros. El repositorio de HuggingFace pesa 6.2 GB, lo que sugiere pesos en precision fp16 o bf16. La longitud de contexto no se especifica en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen2.5) |
| Parametros totales | 3.085.938.688 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, hi |
| Licencia | qwen-research (uso no comercial) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Nyaya-3B-v3 es un ajuste fino del modelo Qwen/Qwen2.5-3B-Instruct, un transformer denso de la familia Qwen2.5. El entrenamiento se realizo sobre el dataset NyayaLabs98/nyaya-train-v3, que contiene pares de preguntas legales, secciones de estatutos y respuestas citadas. Segun la model card, el metodo de ajuste fue RAFT (Retrieval-Augmented Fine-Tuning), una tecnica que entrena al modelo para responder a partir de documentos recuperados. No se proporcionan datos sobre el numero de tokens de entrenamiento ni sobre la composicion detallada del dataset.

La model card documenta varios intentos de ajuste fino. El modelo v3, que es el aqui descrito, obtuvo resultados estadisticamente empatados con el base en la evaluacion interna. Los intentos posteriores (v5 y v6), basados en datos de citas y en correcciones de estilo de respuesta, empeoraron significativamente el rendimiento. Esto indica que el ajuste fino no aporto una mejora medible sobre el modelo base, y que el diseno del sistema Nyaya se ha desplazado hacia la optimizacion de la recuperacion, no de los pesos del generador. No se menciona el uso de RLHF ni DPO.

## Capacidades

- Generacion de texto en ingles e hindi, incluyendo variantes coloquiales como Hinglish (mezcla de hindi e ingles en escritura latina).
- Lectura de secciones legales indias recuperadas (BNS, BNSS, BSA) y generacion de respuestas con citas a articulos concretos.
- Integracion con el retriever nyaya-embed-v1 y la base de datos nyaya-statute-db, con formato de prompt y estilo de citacion ya alineados.
- Respuesta a preguntas legales de tipo factico, como sanciones por rebote de cheques o procedimientos ante la negativa de una FIR.
- Soporte de conversacion basica en el dominio legal, aunque la model card advierte que, sin recuperacion, el comportamiento se aproxima al del modelo base.
- No se especifica soporte de tool calling, funciones, vision, audio ni modos de razonamiento especiales.
- El modelo no esta disenado para emitir asesoramiento legal, sino informacion legal de caracter general.

## Casos de uso

- Consulta legal informativa para ciudadanos indios: el modelo puede responder preguntas como "What is the punishment for cheque bounce under the Negotiable Instruments Act?" en ingles, o "Police FIR nahi likh rahi, kya karu?" en Hinglish, siempre que se le proporcionen las secciones legales recuperadas. Es adecuado porque esta alineado con el formato de prompt del sistema Nyaya.
- Asistencia a estudiantes de derecho: puede generar explicaciones de articulos concretos de los nuevos codigos penales indios, con citas a la fuente. Su capacidad de citar secciones recuperadas facilita el estudio comparado de textos normativos.
- Integracion en pipelines de RAG para derecho indio: el modelo esta pensado para usarse con nyaya-statute-db y el retriever del repositorio Nyaya. La combinacion permite construir sistemas de pregunta-respuesta sobre legislacion india sin necesidad de ajustar el formato de prompt.
- Investigacion academica sobre modelos legales: dado que la model card publica resultados negativos y comparativas, el modelo sirve como caso de estudio para analizar los limites del ajuste fino en dominios especializados y la importancia de la recuperacion.
- Herramientas de apoyo para profesionales del derecho: puede utilizarse para redactar resumenes preliminares de secciones legales o para localizar articulos relevantes a partir de una consulta, siempre que se integre con un sistema de recuperacion robusto. No sustituye el criterio de un abogado colegiado.
- Demostraciones educativas de RAG en dominios legales: al ser un modelo pequeno y con una tarea acotada, resulta util para ensenar conceptos de recuperacion aumentada y evaluacion de sistemas legales en entornos academicos.
- Chatbots de informacion legal para servicios de asistencia juridica gratuita: puede desplegarse como componente de un sistema que derive a los usuarios hacia NALSA o DLSA, ofreciendo informacion general sobre derechos y procedimientos sin emitir asesoramiento legal.

## Benchmarks y rendimiento

Los datos que se presentan a continuacion fueron declarados por el autor del modelo en la model card y no estan verificados de forma independiente.

| Evaluacion | Metrica | Nyaya-3B-v3 + RAG | Qwen2.5-3B-Instruct + RAG (base) | Qwen3-4B-Instruct-2507 + RAG |
|---|---|---|---|---|
| Nyaya-Eval-v1 (409 preguntas, k=8) | Fact recall | 32.9% | 34.3% | 50.6% |
| Nyaya-Eval-v1 (409 preguntas, k=8) | Citation accuracy | 50.3% | 52.8% | 72.2% |
| BhashaBench-Legal (muestra de 1.500 preguntas) | Accuracy | 45.2% | 47.8% | no disponible |

La model card tambien recoge una re-medicion realizada el 2026-09-04 con 768 tokens nuevos y configuracion corregida, donde el modelo obtuvo un 33.8% de fact recall frente al 35.8% del base, con un intervalo de confianza del 95% que cruza el cero, lo que indica un empate estadistico. En citation recall, el modelo quedo por debajo del base (48.6% frente a 55.6%). Ademas, se documenta que el modelo Qwen/Qwen3-4B-Instruct-2507 alcanza un 50.6% de fact recall y un 72.2% de citation accuracy, motivo por el cual el repositorio Nyaya lo utiliza actualmente como lector por defecto.

Los intentos de ajuste fino registrados son los siguientes:

| Version | Fact recall | Resultado frente al base |
|---|---|---|
| Base | 34.3% | — |
| v3 (este modelo, RAFT) | 32.9% | empatado |
| v5 (datos de citas) | 24.0% | peor, IC 95% [−13.5, −7.2] |
| v6 (v5 + correccion de estilo) | 23.4% | peor, IC 95% [−14.0, −7.8] |

## Requisitos de hardware

- No se proporcionan datos de VRAM estimada, GPU recomendadas ni opciones de despliegue en la informacion disponible.
- El repositorio de HuggingFace tiene un tamano de 6.2 GB, lo que sugiere que los pesos estan almacenados en precision fp16 o bf16.
- Al ser un modelo de la familia Qwen2.5 con formato safetensors, es tecnicamente compatible con el ecosistema de transformers y con motores de inferencia como vLLM, TGI o llama.cpp, aunque no se han publicado configuraciones especificas.
- La ausencia de datos sobre latencia y throughput impide realizar estimaciones fiables.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Rendimiento en Nyaya-Eval-v1 (fact recall / citation) | Disponibilidad |
|---|---|---|---|---|---|
| Nyaya-3B-v3 | 3.085.938.688 | no disponible | qwen-research (no comercial) | 32.9% / 50.3% | HuggingFace |
| Qwen/Qwen2.5-3B-Instruct | 3.085.938.688 | no disponible | qwen-research (no comercial) | 34.3% / 52.8% | HuggingFace |
| Qwen/Qwen3-4B-Instruct-2507 | ~4.000.000.000 | no disponible | Apache-2.0 | 50.6% / 72.2% | HuggingFace |

El modelo Nyaya-3B-v3 no supone una mejora frente a su base en las metricas publicadas. La alternativa Qwen3-4B-Instruct-2507, con licencia Apache-2.0, ofrece un rendimiento notablemente superior en la misma tarea, aunque es un modelo mas grande y no esta alineado con el prompt especifico de Nyaya.

## Limitaciones y advertencias

- Licencia restringida: el modelo hereda la Qwen Research License de Qwen2.5-3B-Instruct, que limita su uso a fines de investigacion y no comerciales. No puede utilizarse en productos o servicios con animo de lucro.
- No es asesoramiento legal: la model card advierte explicitamente que el modelo proporciona informacion legal, no consejo juridico. El ejercicio de la abogacia en India esta reservado a abogados colegiados segun la Advocates Act de 1961.
- Rendimiento limitado: en la evaluacion interna del proyecto, el modelo no supera al base del que parte. Su uso solo tiene sentido dentro del sistema Nyaya, donde la alineacion del prompt y el estilo de citacion son relevantes.
- Dependencia critica de la recuperacion: sin un retriever eficaz, el modelo se comporta de forma similar al base y pierde su utilidad practica. La model card muestra que la diferencia entre recuperar todos los estatutos relevantes y fallar en alguno es de 43 puntos porcentuales en fact recall.
- Riesgo de alucinacion: como todo modelo de lenguaje, puede generar referencias legales incorrectas o inventadas, especialmente si no recibe el contexto adecuado.
- Sesgos potenciales: los datos de entrenamiento pueden reflejar sesgos presentes en corpus legales, lo que podria afectar a la respuesta en cuestiones de genero, casta o religion.
- Alcance linguistico limitado: solo soporta ingles e hindi, sin cobertura de otras lenguas indias ni de otros ordenamientos juridicos.
- Datos no verificados: los benchmarks publicados son declaraciones del autor y no han sido auditados por terceros.
- Longitud de contexto no especificada: no se indica la ventana de contexto del modelo, lo que dificulta planificar su uso en conversaciones largas o documentos extensos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/NyayaLabs98/nyaya-3b-v3
- Repositorio del proyecto Nyaya: https://github.com/JitendraJha98/nyaya-model
- Dataset de entrenamiento: https://huggingface.co/datasets/NyayaLabs98/nyaya-train-v3
- Base de datos de estatutos: https://huggingface.co/datasets/NyayaLabs98/nyaya-statute-db
- Dataset de evaluacion: https://huggingface.co/datasets/NyayaLabs98/nyaya-eval-v0
- Modelo de embeddings del sistema Nyaya: https://huggingface.co/NyayaLabs98/nyaya-embed-v1
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct/blob/main/LICENSE
- Organizacion en HuggingFace: https://huggingface.co/NyayaLabs98/
