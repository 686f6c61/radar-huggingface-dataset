# McGill-NLP/Kanana-2-30B-A3B-SFT-EchoMoE-teacher

## Resumen

Kanana-2-30B-A3B-SFT-EchoMoE-teacher es un modelo de lenguaje de tipo mixture-of-experts (MoE) desarrollado por el grupo McGill-NLP, resultado de un ajuste fino supervisado (SFT) sobre el modelo base kakaocorp/kanana-2-30b-a3b-base-2601 de Kakao. Su funcion dentro del proyecto EchoMoE es la de "teacher" (profesor) sin comprimir: es el modelo del que se destila el estudiante Kanana-2-30B-A3B y contra el que se comparan las puntuaciones del informe tecnico. Emplea la arquitectura deepseek_v3 con 48 capas, 128 expertos enrutados (6 activos), 2 expertos compartidos y un tamano oculto de 2.048.

El modelo cuenta con aproximadamente 30.670 millones de parametros totales (30,67B) y esta afinado sobre el dataset allenai/Dolci-Instruct-SFT durante dos epocas con secuencias empaquetadas de 8.192 tokens y una tasa de aprendizaje de 2e-5. Se evalua a una longitud de contexto de 32.768 tokens en precision bf16. Su interes principal reside en que sirve como referencia de rendimiento para investigar tecnicas de compresion de activaciones y paralelismo eficiente de expertos (el articulo "Communicate the Change: Efficient Expert Parallelism via Activation Compression"), y en que, al conservar la arquitectura original del modelo base, puede cargarse directamente en vLLM y transformers sin necesidad del paquete EchoMoE.

La relevancia actual del modelo es doble: por un lado, es un punto de referencia publico para medir la perdida de calidad en destilacion de modelos MoE de ~30B; por otro, demuestra que un MoE de este tamano puede servirse en una sola GPU de 80 GB en bf16, lo que lo hace util para experimentacion en entornos academicos con hardware limitado. Su licencia, no obstante, es restrictiva (Kanana License Agreement), lo que condiciona su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (deepseek_v3), 48 capas, 128 expertos enrutados con 6 activos y 2 expertos compartidos, hidden size 2.048 |
| Parametros totales | 30.670.815.104 (~30,67B) |
| Parametros activos | no disponible (la model card no indica el numero exacto de parametros activos; solo el numero de expertos activos: 6 enrutados + 2 compartidos) |
| Longitud de contexto | 32.768 tokens (longitud de evaluacion) |
| Tipos de cuantizacion | no disponible (el modelo se distribuye y evalua en bf16; no se documentan variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | en (ingles) |
| Licencia | kanana-license (Kanana License Agreement, derivada de la del modelo base de Kakao) |
| Formato de pesos | safetensors (libreria transformers; repositorio de 61,3 GB) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura deepseek_v3 del modelo base Kanana-2-30B-A3B: un transformer MoE con 48 capas, 128 expertos enrutados de los cuales se activan 6 por token, mas 2 expertos compartidos, y un tamano oculto de 2.048. Esta configuracion dispersa permite un total de ~30,67B parametros con un coste computacional por token muy inferior al de un modelo denso del mismo tamano. El ajuste fino se realizo mediante SFT sobre allenai/Dolci-Instruct-SFT, con dos epocas sobre secuencias empaquetadas de 8.192 tokens y una tasa de aprendizaje de 2e-5. No se documenta en la informacion disponible el uso de RLHF, DPO ni otras fases de alineacion posteriores al SFT.

La innovacion tecnica asociada no reside en el propio modelo, sino en el contexto de investigacion en el que se enmarca: el articulo EchoMoE (arXiv:2611.22215) estudia la compresion de activaciones para un paralelismo de expertos mas eficiente, y este checkpoint actua como teacher de referencia sin comprimir. La model card indica que la arquitectura es la del modelo base, de modo que vLLM y transformers lo cargan sin el paquete EchoMoE; para vLLM se recomienda `--enable-expert-parallel` y `cudagraph_mode: FULL_DECODE_ONLY`, ya que la captura de graficos CUDA por tramos para lotes mixtos supera el tiempo de espera de 600 segundos del servidor de API con este modelo. No se dispone de informacion sobre tecnicas de decodificacion especulativa ni de atencion lineal en este checkpoint.

## Capacidades

- Generacion de texto conversacional en ingles, con plantilla de chat (`apply_chat_template`).
- Razonamiento y conocimiento general: puntuacion media de 68,2% en el dominio de conocimiento y razonamiento del informe EchoMoE.
- Matematicas: 41,5% de media en el dominio de matematicas de los 18 benchmarks del informe.
- Generacion de codigo: 53,4% de media en el dominio de codigo.
- Seguimiento de instrucciones: 53,0% de media en el dominio correspondiente.
- Contexto largo: evaluado a 32.768 tokens, adecuado para conversaciones multi-turno y documentos extensos.
- Capacidad multilingue limitada al ingles segun la model card (idioma declarado: en).
- No se documenta en la informacion disponible soporte explicito de tool calling, function calling, modo thinking, vision ni audio.

## Casos de uso

- Referencia para investigacion en destilacion de MoE: sirve como teacher sin comprimir frente al que medir la calidad del estudiante Kanana-2-30B-A3B del proyecto EchoMoE, permitiendo cuantificar la perdida por compresion de activaciones en los 18 benchmarks del informe.
- Experimentacion academica con paralelismo de expertos: al cargarse en vLLM con `--enable-expert-parallel` y `--data-parallel-size 8`, es un banco de pruebas realista para estudiar tecnicas de comunicacion y compresion de activaciones en clusters multi-GPU.
- Generacion de codigo asistida en ingles: con un 53,4% de media en el dominio de codigo, puede integrarse en entornos de desarrollo para autocompletado y explicacion de fragmentos, siempre en ingles y con revision humana.
- Razonamiento sobre documentos largos: sus 32.768 tokens de contexto permiten resumir y responder preguntas sobre informes tecnicos o articulos cientificos en ingles en una sola pasada.
- Evaluacion comparativa de modelos MoE de ~30B: util como baseline publico en estudios que comparen arquitecturas deepseek_v3 con alternativas densas o MoE de tamano similar.
- Prototipado de asistentes conversacionales en ingles: con los ajustes recomendados (temperatura 0,7, top_p 0,8, top_k 20 y presence penalty 1,5 en vLLM) puede desplegarse como chatbot de demostracion en una unica GPU de 80 GB.
- Investigacion sobre seguimiento de instrucciones: su 53,0% en este dominio lo hace adecuado para analizar el comportamiento de modelos SFT sobre Dolci-Instruct-SFT en tareas de formato y restricciones.

## Benchmarks y rendimiento

Resultados publicados en la model card: media (%) sobre 18 benchmarks por dominio, evaluados con vLLM 0.21 a 32.768 tokens en bf16.

| Dominio | Puntuacion |
|---|---|
| Conocimiento y razonamiento | 68,2 |
| Matematicas | 41,5 |
| Codigo | 53,4 |
| Seguimiento de instrucciones | 53,0 |
| **Media** | **58,5** |

No se han publicado en la informacion disponible los resultados desglosados por benchmark individual (MMLU, HumanEval, GSM8K, etc.) ni comparaciones numericas con otros modelos; el repositorio de GitHub del proyecto lista los benchmarks empleados, pero sus valores no se incluyen en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 61,3 GB de pesos, por lo que encaja en una GPU de 80 GB (la model card confirma que los pesos bf16 caben en una sola GPU de 80 GB).
- GPU recomendadas: A100 80 GB o H100 80 GB para una sola tarjeta en bf16; para despliegue con paralelismo de expertos, el ejemplo oficial usa `--data-parallel-size 8` con `--enable-expert-parallel`, lo que sugiere un nodo de 8 GPU (por ejemplo, 8x H100 o 8x A100).
- GPU de consumo: no cabe en GPUs consumer de 24 GB (RTX 4090) ni de 48 GB en bf16 sin cuantizacion; no se documentan variantes cuantizadas que permitan su uso en estas tarjetas.
- Opciones de despliegue: vLLM 0.21 (soporte oficial con la configuracion indicada) y transformers con `AutoModelForCausalLM` en bf16. No se documenta soporte para llama.cpp, Ollama ni TGI en la informacion disponible.
- Latencia y throughput: no disponibles. La model card solo advierte de que la captura de graficos CUDA por tramos para lotes mixtos supera el tiempo de espera de 600 segundos del servidor de API, motivo por el que se recomienda `FULL_DECODE_ONLY`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Kanana-2-30B-A3B-SFT-EchoMoE-teacher | ~30,67B totales (MoE) | 32.768 tokens | Media 58,5 en 18 benchmarks (informe EchoMoE) | Kanana License (restrictiva) | Hugging Face, 483 descargas |
| Kanana-2-30B-A3B (estudiante EchoMoE) | no disponible en la informacion | no disponible | no disponible en la informacion | Kanana License | Coleccion EchoMoE en Hugging Face |
| kakaocorp/kanana-2-30b-a3b-base-2601 | ~30,67B (MoE, base) | no disponible | no disponible (modelo base, sin SFT) | Kanana License | Hugging Face (Kakao) |

La informacion disponible no incluye datos numericos de modelos alternativos de otros desarrolladores, por lo que no es posible establecer una comparativa cuantitativa con modelos MoE de tamano similar de otros laboratorios.

## Limitaciones y advertencias

- Licencia restrictiva: la Kanana License Agreement exige cumplir las Guidelines for Responsible AI de Kakao (seccion 2.2) y requiere una licencia comercial separada de Kakao para ofrecer el modelo a terceros mediante API o como parte de un producto (seccion 4). Las restricciones se aplican tambien a quien lo redistribuya.
- Idioma: solo se declara soporte de ingles; el rendimiento en castellano u otros idiomas no esta documentado y previsiblemente sera inferior.
- Riesgo de alucinacion: como todo modelo de lenguaje, puede generar contenido facticamente incorrecto; no se documentan mecanismos de mitigacion especificos en la model card.
- Sesgos: no se publica informacion sobre sesgos conocidos ni sobre la composicion del dataset Dolci-Instruct-SFT mas alla de su nombre.
- Matematicas: el dominio de matematicas obtiene la puntuacion mas baja del informe (41,5%), por lo que no es adecuado para tareas de calculo sin verificacion externa.
- Contexto: la longitud de 32.768 tokens es la de evaluacion; no se garantiza un rendimiento estable mas alla de esa ventana.
- Produccion: la model card advierte de problemas de captura de graficos CUDA en vLLM con lotes mixtos, lo que obliga a configurar `FULL_DECODE_ONLY`; no se documentan pruebas de carga ni latencias en produccion.
- Naturaleza del checkpoint: es un modelo "teacher" de investigacion orientado a la comparacion con el estudiante destilado, no un modelo afinado para alineacion conversacional avanzada (no se documenta RLHF ni DPO).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/McGill-NLP/Kanana-2-30B-A3B-SFT-EchoMoE-teacher
- Articulo (arXiv): https://arxiv.org/abs/2611.22215
- Codigo: https://github.com/McGill-NLP/EchoMoE
- Pagina del proyecto: https://mcgill-nlp.github.io/EchoMoE/
- Coleccion EchoMoE: https://huggingface.co/collections/McGill-NLP/echomoe-6afcbfa10b38185f87cbd0ac
- Modelo base: https://huggingface.co/kakaocorp/kanana-2-30b-a3b-base-2601
- Dataset de SFT: https://huggingface.co/datasets/allenai/Dolci-Instruct-SFT
- Guidelines for Responsible AI de Kakao: https://www.kakaocorp.com/page/responsible/detail/guidelinesForResponsibleAI
