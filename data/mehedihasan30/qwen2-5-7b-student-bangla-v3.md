# mehedihasan30/qwen2.5-7b-student-bangla-v3

## Resumen

Qwen2.5-7B Student Bangla v3 es un adaptador LoRA entrenado sobre el modelo base unsloth/Qwen2.5-7B-Instruct-bnb-4bit, publicado por el usuario mehedihasan30 en HuggingFace. Se trata de un ajuste fino de dominio muy acotado: un asistente de preguntas y respuestas para estudiantes de Bangladesh, capaz de responder en bengalí (bn), inglés (en) y banglish (bengalí romanizado mezclado con inglés). No es un modelo nuevo desde cero, sino un adaptador PEFT de rango 16 que se carga sobre el Qwen2.5-7B-Instruct original; el repositorio ocupa solo 0,2 GB porque contiene únicamente los pesos del adaptador, no los 7.600 millones de parámetros completos.

El entrenamiento se realizó con QLoRA a 4 bits (r=16, 150 pasos, aproximadamente 2 épocas) sobre una GPU Colab T4, usando el dataset mehedihasan30/student-qa-data-620, compuesto por 619 pares pregunta-respuesta divididos en 588 de entrenamiento y 31 de test. La tercera versión del modelo incorpora 200 pares específicos de la universidad AIUB (American International University-Bangladesh) más 219 actualizados con información de la admisión de primavera 2026-27 (exámenes del 24 de septiembre y finales del 5 de octubre, nuevos programas de ME y Microbiología, avisos de octubre de 2026).

Su relevancia es la de un caso típico de especialización vertical de bajo coste: demuestra que con 619 ejemplos y una T4 se puede adaptar un modelo de 7B a un nicho educativo y multilingüe concreto. Sus propias limitaciones están declaradas por el autor: el estilo y el idioma se ajustan bien, pero las cifras exactas (tasas académicas, fechas) pueden alucinarse y deben verificarse en aiub.edu o combinarse con RAG.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen2) con adaptador LoRA/PEFT sobre el modelo base |
| Parametros totales | ~7.600 millones en el modelo base; el repositorio contiene solo el adaptador LoRA (0,2 GB) |
| Parametros activos | No aplica (arquitectura densa; adaptador LoRA con r=16) |
| Longitud de contexto | No disponible en la informacion proporcionada; la configuracion de ejemplo del autor usa max_seq_length=2048. El modelo base Qwen2.5-7B-Instruct tiene soporte de contexto largo segun la documentacion de Qwen |
| Tipos de cuantizacion | Entrenamiento e inferencia de ejemplo en 4 bits (bitsandbytes, via Unsloth); el adaptador se publica en precision completa. No se proporcionan pesos GGUF ni otras cuantizaciones |
| Idiomas soportados | Bengalí (bn), inglés (en) y banglish (bengalí romanizado) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptador LoRA PEFT) |
| Modelo base | unsloth/Qwen2.5-7B-Instruct-bnb-4bit |
| Dataset de entrenamiento | mehedihasan30/student-qa-data-620 (619 QA; 588 train / 31 test) |
| Metodo de entrenamiento | QLoRA 4-bit, r=16, 150 pasos (~2 epocas), Colab T4 |
| Perdidas reportadas | Train loss 2,56; eval loss 2,28 |
| Pipeline declarado | text-generation-inference (tag); no confirmado en la model card |

## Arquitectura y entrenamiento

El modelo es un ajuste fino por adaptadores de bajo rango (LoRA) sobre Qwen2.5-7B-Instruct, un transformer decoder-only de la familia Qwen2. El entrenamiento se hizo en configuracion QLoRA a 4 bits con r=16 durante 150 pasos, lo que equivale a unas 2 épocas sobre el dataset de 588 ejemplos de entrenamiento. El autor reporta una pérdida de entrenamiento de 2,56 y una pérdida de evaluación de 2,28, y lo describe como un entrenamiento estable sin sobreajuste profundo. Todo el proceso se ejecutó en una GPU Colab T4 usando la librería Unsloth, que acelera el entrenamiento aproximadamente 2x según la propia model card.

No se documentan innovaciones técnicas adicionales: no hay decodificación especulativa, atención lineal, mezcla de expertos ni fases de RLHF o DPO posteriores al ajuste supervisado. La especialización es puramente de dominio y de idioma. El dataset combina preguntas y respuestas genéricas de estudiantes con 200 pares específicos de la AIUB y 219 pares actualizados con información del intake de primavera 2026-27, lo que introduce conocimiento institucional con fecha de caducidad. No se especifica la composición exacta del dataset ni la proporción de ejemplos en bengalí, inglés y banglish.

## Capacidades

- Generación de texto conversacional en bengalí, inglés y banglish, con especial atención al registro y al estilo de un asistente académico.
- Respuesta a preguntas frecuentes de estudiantes: admisión, programas, trámites, calendario académico y consultas generales de la AIUB.
- Conocimiento institucional específico inyectado durante el ajuste: examen del 24 de septiembre, finales del 5 de octubre, nuevos programas de ME y Microbiología, avisos de octubre de 2026.
- Conversación multiturno básica, heredada de la naturaleza instruct del modelo base.
- Capacidades generales del Qwen2.5-7B-Instruct (razonamiento, matemáticas, código) potencialmente degradadas o no evaluadas tras el ajuste estrecho de dominio.
- Soporte de tool calling o function calling: no documentado en la model card ni verificado tras el ajuste; el modelo base sí lo soporta, pero no hay evidencia de que el adaptador lo preserve.
- Capacidades de agente y razonamiento multi-paso: no documentadas ni evaluadas.
- Capacidades multimodales (visión, audio): no disponibles en este modelo, que es exclusivamente de texto.

## Casos de uso

- Chatbot de atención al estudiante en la AIUB: el adaptador responde en bengalí, inglés y banglish a consultas sobre admisión, programas y calendario, con un coste de despliegue mínimo al ser un adaptador sobre un 7B cuantizado a 4 bits.
- Asistente de orientación académica pre-admisión: puede explicar los nuevos programas de ME y Microbiología y las fechas del intake de primavera 2026-27, siempre que las cifras se validen contra aiub.edu.
- Demo educativa de ajuste fino con LoRA: sirve como ejemplo reproducible de especialización de un 7B con 619 pares QA y una única GPU T4, útil para docencia o talleres de fine-tuning.
- Atención multilingüe en banglish: cubre el registro real que usan los estudiantes bangladesíes en redes y mensajería, donde mezclan bengalí romanizado e inglés, un caso poco cubierto por modelos generalistas.
- Base para un sistema RAG universitario: el propio autor recomienda emparejarlo con recuperación para evitar alucinaciones en tasas y fechas; el adaptador aporta el tono y el idioma, y el recuperador aporta los datos exactos.
- Prototipado rápido de FAQ verticales: el mismo pipeline (QLoRA + Unsloth + adaptador de 0,2 GB) se puede replicar para otras instituciones o dominios con presupuesto de cómputo muy bajo.
- Filtrado y redacción de respuestas institucionales: puede generar borradores de comunicados o respuestas tipo en bengalí e inglés que un humano revisa antes de publicar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente reporta métricas de entrenamiento:

| Metrica | Valor |
|---|---|
| Train loss | 2,56 |
| Eval loss | 2,28 |
| Pasos de entrenamiento | 150 (~2 epocas) |
| Tamano del conjunto de entrenamiento | 588 ejemplos |
| Tamano del conjunto de evaluacion | 31 ejemplos |
| MMLU, HumanEval, GSM8K u otros | No disponibles |

El autor indica que la coincidencia de estilo e idioma es buena, pero no aporta métricas objetivas de calidad, exactitud factual ni comparaciones cuantitativas con el modelo base.

## Requisitos de hardware

- VRAM estimada para inferencia: unos 4-6 GB con el modelo base en 4 bits (configuracion recomendada por el autor, load_in_4bit=True); en 8 bits, aproximadamente 8-9 GB; en fp16/bf16, alrededor de 15-16 GB.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para 4 bits. Funciona en la Colab T4 (16 GB) que se usó para el entrenamiento, en RTX 3060 12 GB, RTX 4070, RTX 4080, RTX 4090, A10, L4, A100 y H100.
- Cabe en GPU de consumo: sí. La configuracion de 4 bits entra en GPUs consumer de gama media-alta; la guía de Ollama para Qwen 2.5 7B menciona unos 6 GB de VRAM para la variante de 7B.
- Opciones de despliegue: libreria Unsloth para cargar el adaptador, transformers + PEFT, y el tag text-generation-inference sugiere compatibilidad con TGI. Para vLLM, llama.cpp u Ollama seria necesario fusionar el adaptador con el modelo base y, en el caso de llama.cpp/Ollama, convertir a GGUF, algo que no se distribuye en el repositorio.
- Latencia y throughput: no disponibles en la informacion proporcionada.
- Nota de despliegue: el repositorio contiene solo el adaptador, por lo que es imprescindible descargar el modelo base unsloth/Qwen2.5-7B-Instruct-bnb-4bit o fusionar el adaptador con Qwen2.5-7B-Instruct antes de servir el modelo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen2.5-7b-student-bangla-v3 (este modelo) | 7B + adaptador LoRA r=16 | No disponible; ejemplo con 2.048 tokens | Sin benchmarks publicados; train loss 2,56 / eval loss 2,28 | Apache-2.0 | HuggingFace, 0 descargas, 0 likes en el momento de la consulta |
| Qwen2.5-7B-Instruct (modelo base de la familia) | 7B | Soporte de contexto largo segun la documentacion de Qwen; cifra exacta no disponible en la informacion proporcionada | Referencia de la familia Qwen2.5 en razonamiento, matematicas y multilingue segun guias externas; cifras concretas no disponibles aqui | Apache-2.0 | Ampliamente disponible en HuggingFace (coleccion Qwen2.5) |
| Qwen2.5-7B-student-bangla (v1) | 7B + adaptador LoRA | No disponible | No disponible | Apache-2.0 | HuggingFace |
| Qwen2.5-7B-student-bangla-v2 | 7B + adaptador LoRA | No disponible | No disponible | Apache-2.0 | HuggingFace |

La familia Qwen2.5 incluye variantes preentrenadas e instruct de 0,5B, 1,5B, 3B, 7B, 14B, 32B y 72B, por lo que existen alternativas de mayor tamano dentro de la misma familia si se necesita mas capacidad. No se dispone de datos comparativos de benchmarks entre este adaptador y modelos de Q&A educativo en bengalí.

## Limitaciones y advertencias

- Alucinacion en datos facticos: el propio autor advierte que las tasas académicas y las fechas exactas pueden inventarse. Hay que verificar siempre en aiub.edu o usar RAG con datos fijados.
- Conocimiento con fecha de caducidad: el ajuste incorpora información del intake de primavera 2026-27; cualquier fecha o programa puede quedar obsoleto y el modelo no lo sabrá.
- Dataset muy reducido: 619 pares QA, 588 de entrenamiento y 31 de test. La cobertura es estrecha y el conjunto de evaluación es demasiado pequeno para medir calidad de forma fiable.
- Sesgo de dominio e institucion: el modelo está centrado en estudiantes bangladesíes y en la AIUB; puede responder de forma poco adecuada fuera de ese contexto o mezclar información institucional con conocimiento general.
- Degradacion potencial del modelo base: un ajuste estrecho de 2 épocas puede reducir capacidades generales del Qwen2.5-7B-Instruct, como razonamiento, código o matemáticas, aunque no se han publicado evaluaciones al respecto.
- Sin benchmarks: no hay MMLU, HumanEval, GSM8K ni ninguna métrica objetiva de calidad o de exactitud factual.
- Idiomas limitados: solo bn, en y banglish. No hay soporte declarado de castellano ni de otros idiomas, más allá de lo que herede el modelo base.
- Banglish no normalizado: al ser una mezcla romanizada sin estándar ortográfico, la consistencia de las respuestas puede variar.
- Licencia: Apache-2.0, permisiva para uso comercial, pero conviene verificar la licencia y los términos del modelo base Qwen2.5-7B-Instruct y del dataset student-qa-data-620, así como los derechos sobre cualquier contenido institucional incluido en los datos.
- Formato de distribución: solo se publican los pesos del adaptador en safetensors; no hay GGUF, cuantizaciones listas para llama.cpp/Ollama ni versión fusionada, lo que anade un paso de conversion para segun que despliegues.
- Adopcion nula: 0 descargas y 0 likes en el momento de la consulta, sin validacion por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mehedihasan30/qwen2.5-7b-student-bangla-v3
- Version v1: https://huggingface.co/mehedihasan30/qwen2.5-7b-student-bangla
- Version v2: https://huggingface.co/mehedihasan30/qwen2.5-7b-student-bangla-v2
- Modelo base: https://huggingface.co/unsloth/Qwen2.5-7B-Instruct-bnb-4bit
- Dataset de entrenamiento: https://huggingface.co/datasets/mehedihasan30/student-qa-data-620
- Coleccion Qwen2.5: https://huggingface.co/collections/Qwen/qwen25
- Unsloth (libreria de entrenamiento): https://github.com/unslothai/unsloth
- Guia de Qwen 2.5 en Ollama: https://ai-ollama.github.io/qwen-2-5.html
- Ficha de la familia Qwen-2.5-7B en Emergent Mind: https://www.emergentmind.com/topics/qwen-2-5-7b-model-family
- Especificaciones de Qwen2.5-7B en DataLearnerAI: https://www.datalearner.com/ai-models/pretrained-models/Qwen2_5-7B
