# mradermacher/Gemwa-4B-GGUF

## Resumen

Gemwa-4B-GGUF es la distribucion en formato GGUF del modelo Gemwa-4B, un ajuste fino (fine-tuning) del modelo base Gemma 3 de Google orientado especificamente al bhojpuri, una lengua indoaria hablada principalmente en el norte de la India, Nepal y zonas de la diaspora. El modelo original fue desarrollado por el usuario l1nk-0 y esta construido sobre una arquitectura transformer de tipo Gemma 3 con aproximadamente 3.880 millones de parametros totales. La version aqui descrita ha sido cuantizada y publicada por mradermacher, un conocido distribuidor de cuantizaciones GGUF para la comunidad.

El problema que resuelve es la escasez de modelos de lenguaje con cobertura decente de lenguas de bajos recursos como el bhojpuri. Gemma 3, pese a su multilingusmo, no esta optimizado para esta lengua, por lo que este ajuste fino busca mejorar la calidad de las respuestas en tareas de instruccion y conversacion en bhojpuri, con soporte secundario de hindi. El modelo se entreno mediante LoRA sobre el modelo base, utilizando los datasets pksx01/alpaca_bhojpuri_instruction y l1nk-0/bhojpuri-chhath-qa.

La relevancia actual radica en que ofrece una via practica para desplegar un modelo conversacional en bhojpuri en hardware de consumo, gracias a las cuantizaciones GGUF que van desde 1,8 GB (Q2_K) hasta 7,9 GB (f16). Es, por tanto, una pieza util para investigadores y desarrolladores que trabajan en preservacion linguistica, atencion al publico regional o investigacion sobre lenguas indicas de bajos recursos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Gemma 3), ajuste fino mediante LoRA |
| Parametros totales | 3.880.263.168 (aprox. 3,88 mil millones) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16, mmproj-Q8_0, mmproj-f16 |
| Idiomas soportados | bhojpuri (bho), hindi (hi) |
| Licencia | gemma (Gemma Terms of Use) |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Gemma 3, un transformer decoder-only con atencion por ventanas deslizantes y atencion global alternada, disenado por Google DeepMind. Sobre esta base, el autor l1nk-0 aplico un ajuste fino supervisado mediante LoRA, una tecnica de adaptacion de bajo rango que permite especializar el modelo sin reentrenar todos los parametros. El resultado es un modelo de aproximadamente 3,88 mil millones de parametros que conserva las capacidades generales de Gemma 3 pero con una alineacion especifica hacia el bhojpuri.

Los datos de entrenamiento provienen de dos conjuntos: pksx01/alpaca_bhojpuri_instruction, un dataset de instrucciones en formato Alpaca traducido o adaptado al bhojpuri, y l1nk-0/bhojpuri-chhath-qa, un conjunto de preguntas y respuestas centrado en la festividad del Chhath, lo que sugiere un sesgo tematico hacia contenido cultural y religioso de la region. No se dispone de informacion sobre el numero total de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO posteriores. Tampoco se documentan innovaciones tecnicas adicionales mas alla del propio ajuste LoRA. La cuantizacion a GGUF la realiza mradermacher con su pipeline habitual, generando tanto cuantizaciones estaticas como el modulo multimodal mmproj (Q8_0 y f16), lo que indica que el modelo base conserva la torre de vision de Gemma 3.

## Capacidades

- Generacion de texto conversacional en bhojpuri, con soporte secundario de hindi.
- Instrucciones y respuesta a preguntas en formato Alpaca, heredado del dataset de entrenamiento.
- Capacidad multimodal potencial: el repositorio incluye ficheros mmproj, lo que sugiere que el modelo base conserva la torre de vision de Gemma 3, aunque no se documenta su calidad tras el ajuste fino.
- Razonamiento basico y generacion de texto general heredados de Gemma 3.
- Soporte de conversacion multi-turno (tag conversational en Hugging Face).
- No se documenta soporte explicito de tool calling, function calling ni razonamiento agente multi-paso.
- Capacidades multilingues limitadas a bhojpuri e hindi segun la model card; el resto de idiomas de Gemma 3 no se garantizan tras el ajuste.

## Casos de uso

- Atencion al publico en bhojpuri: el modelo puede gestionar consultas conversacionales de usuarios que hablan esta lengua, util en administraciones publicas, ONG o empresas que operan en Bihar, Uttar Pradesh o zonas de emigracion. Su tamano permite desplegarlo en servidores modestos.
- Preservacion y divulgacion linguistica: investigadores pueden usarlo para generar materiales didacticos, traducciones asistidas o corpus sinteticos en bhojpuri, aprovechando que es uno de los pocos modelos ajustados especificamente a esta lengua.
- Chatbot cultural sobre Chhath: dado que uno de los datasets de entrenamiento es especifico sobre esta festividad, el modelo puede responder preguntas sobre tradiciones, rituales y significado cultural con cierto grado de especializacion.
- Despliegue en hardware de consumo: con cuantizaciones Q4_K_M de 2,6 GB, cabe en GPUs consumer como RTX 3060, RTX 4060 o incluso en CPU con llama.cpp, lo que facilita prototipado y demos locales.
- Educacion y tutoria basica en hindi y bhojpuri: puede servir como asistente de aprendizaje para hablantes de estas lenguas, con la cautela de verificar la exactitud de los contenidos.
- Investigacion sobre sesgos y calidad en lenguas de bajos recursos: sirve como caso de estudio para medir como el ajuste fino con datasets pequenos afecta al rendimiento y a la fidelidad linguistica frente al modelo base.
- Integracion en pipelines de generacion aumentada (RAG): al ser un modelo pequeno y rapido en GGUF, puede combinarse con recuperacion documental para responder preguntas sobre documentos en bhojpuri.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2,5-3 GB con Q4_K_M, 3,5-4 GB con Q5_K_M o Q6_K, y 5-6 GB con Q8_0. La version f16 requiere unos 8-9 GB.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090, A100 o H100 para despliegues de mayor throughput. Cualquier GPU con al menos 6 GB de VRAM puede ejecutar las cuantizaciones de 4 bits.
- Cabe en GPU consumer: si, en practicamente todas las GPU modernas con 6 GB o mas. Tambien puede ejecutarse en CPU con llama.cpp, aunque con mayor latencia.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, y servidores compatibles con GGUF. Para el modelo base en safetensors, vLLM o TGI si se dispone de los pesos originales.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada. A modo orientativo, un modelo de 4B en Q4_K_M sobre una RTX 4090 suele generar decenas de tokens por segundo, pero no se confirma con datos del autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Gemwa-4B-GGUF | 3,88 B | no disponible | bhojpuri, hindi | gemma | GGUF |
| Gemma 3 4B (base) | 4 B aprox. | no disponible | multilingue amplio | gemma | safetensors, GGUF |
| Llama 3.2 3B | 3,2 B | 128k | multilingue | Llama 3.2 Community | safetensors, GGUF |
| Qwen2.5 3B | 3,1 B | 32k | multilingue | Apache 2.0 | safetensors, GGUF |

La comparativa es orientativa: Gemwa-4B se diferencia por su especializacion en bhojpuri, mientras que los modelos base genericos ofrecen mejor cobertura multilingue y contextos documentados, pero carecen de ajuste especifico a esta lengua. No se dispone de datos de rendimiento comparativo entre ellos en la informacion proporcionada.

## Limitaciones y advertencias

- Sesgo tematico: uno de los datasets de entrenamiento esta centrado en la festividad del Chhath, lo que puede sesgar las respuestas hacia contenido cultural y religioso y reducir la diversidad tematica.
- Riesgo de alucinacion: al ser un ajuste fino sobre un dataset pequeno, el modelo puede generar respuestas plausibles pero incorrectas, especialmente en temas fuera del dominio de entrenamiento.
- Cobertura linguistica limitada: solo se documentan bhojpuri e hindi; el rendimiento en otros idiomas de Gemma 3 puede degradarse tras el ajuste.
- Longitud de contexto no documentada: no se especifica la ventana de contexto efectiva, lo que complica su uso en tareas de contexto largo.
- Licencia Gemma: el uso comercial esta sujeto a los Gemma Terms of Use de Google, que imponen restricciones y obligaciones de atribucion; conviene revisarlos antes de un despliegue en produccion.
- Datos de evaluacion ausentes: no hay benchmarks publicados, por lo que la calidad real frente al modelo base no esta cuantificada.
- Cuantizaciones de baja calidad: las versiones Q2_K y Q3_K pueden degradar notablemente la coherencia; se recomienda Q4_K_M o superior para uso practico.
- Modelo de nicho: con 343 descargas y 0 likes en el momento de la ficha, la comunidad de validacion es practicamente inexistente.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Gemwa-4B-GGUF
- Modelo base original: https://huggingface.co/l1nk-0/Gemwa-4B
- Pagina de descargas de mradermacher: https://hf.tst.eu/model#Gemwa-4B-GGUF
- Dataset de instrucciones: https://huggingface.co/datasets/pksx01/alpaca_bhojpuri_instruction
- Dataset Chhath QA: https://huggingface.co/datasets/l1nk-0/bhojpuri-chhath-qa
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Grafico de calidad de cuantizaciones: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa del autor de las cuantizaciones: https://www.nethype.de/
