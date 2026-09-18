# singhmandavi/math-slm-qwen2.5-0.5b-v4

## Resumen

math-slm-qwen2.5-0.5b-v4 es un modelo de lenguaje pequeno (SLM) de dominio especifico orientado a la resolucion de problemas de matematicas paso a paso, desarrollado por el usuario singhmandavi (equipo "team03 / SLM Learners") como entrega para la ronda 2 del Pramana SLM++ Bootcamp. No se entrena desde cero: parte de Qwen2.5-0.5B-Instruct, un transformer denso de 494.032.768 parametros, y se ajusta mediante QLoRA (r=16, base cuantizada en 4 bits NF4, computo en bf16) con los adaptadores fusionados en los pesos base. El resultado se publica como un checkpoint unico en float16, con licencia Apache-2.0 y orientado exclusivamente al ingles.

El objetivo declarado es el soporte a aspirantes a exámenes competitivos tipo GATE y a estudiantes de matematicas: el modelo responde con la respuesta directa en prompts simples y despliega razonamiento en cadena (chain-of-thought) terminado en "Final answer:" en problemas complejos. Para ello se ajusto sobre un corpus de 29.853 filas (14.308 de formato directo y 15.545 de CoT) procedente de ExamBench y del split IMO de MathNet, con 53,36 millones de tokens vistos en 3 epocas y 1,84 horas de GPU sobre una H100 de 80 GB.

Su relevancia es fundamentalmente metodologica y de nicho: demuestra un flujo completo de ajuste parametrizado eficiente (PEFT) con trazabilidad de datos, descontaminacion verificada y evaluacion por niveles, y ofrece un punto de partida muy ligero (1,0 GB de repositorio) para experimentar con tutoria matematica en hardware de consumo. El propio autor documenta limitaciones serias de seguimiento de instrucciones estrictas (8/33) y una ventana de contexto efectiva de solo 2.048 tokens, por lo que debe considerarse un prototipo de investigacion mas que un sistema listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso decoder-only (Qwen2), ajustado con QLoRA |
| Parametros totales | 494.032.768 (0,49 B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 2.048 tokens (longitud maxima de secuencia en entrenamiento); el modelo base Qwen2.5-0.5B-Instruct soporta ventanas mayores segun su propia documentacion, no verificadas en esta ficha |
| Tipos de cuantizacion | No se publican pesos cuantizados. El entrenamiento uso base 4-bit NF4 (QLoRA); el checkpoint subido es float16. Conversion a GGUF/GPTQ/AWQ posible con herramientas externas, no publicada por el autor |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (checkpoint fusionado en float16) |
| Parametros entrenables | 8,8 M (1,75 % del total), LoRA r=16, alpha=32, dropout 0,05 |
| Tamano del repositorio | 1,0 GB |
| Fecha de publicacion | 2026-09-18 |
| Descargas / likes | 0 / 1 |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base Qwen2.5-0.5B-Instruct: un transformer decoder-only denso con normalizacion RMSNorm, embeddings RoPE y atencion con proyecciones q/k/v/o, mas las proyecciones gate/up/down del MLP. Sobre esa base se aplico QLoRA con rango 16, alpha 32, dropout 0,05 y adaptadores en todas las proyecciones, dejando 8.8 millones de parametros entrenables (1,75 % del total). El corpus bruto (train_all.jsonl) contiene 29.853 filas, de las cuales 14.308 son de formato directo y 15.545 de cadena de razonamiento. Tras descartar 5.850 filas CoT de 2.048 tokens o mas con el flag `--drop-overlong`, el conjunto efectivo queda en 23.532 ejemplos de entrenamiento y 471 de validacion. Las fuentes son ExamBench (169Pi/exambench, Apache-2.0, commit b5f3d8b) y el split IMO de MathNet (CC-BY-4.0, requiere atribucion).

El entrenamiento uso AdamW (betas 0,9/0,999, eps 1e-8, weight decay 0,01), learning rate 1,5e-4 con decaimiento coseno y unos 132 pasos de warmup (3 % del total), batch efectivo de 16 (2 de micro-batch por 8 de acumulacion de gradiente), 3 epocas y 4.410 pasos registrados (teoricos 4.413) sobre 53.356.887 tokens vistos, con semilla 7 y una unica NVIDIA H100 de 80 GB durante aproximadamente 1,84 horas de GPU. La decodificacion del ejemplo oficial es greedy (temperature=0) con max_new_tokens=1024 y plantilla de chat propia de Qwen. El autor documenta descontaminacion mediante solapamiento de 13-gramas (estilo GPT-3/Chinchilla) y MinHash-LSH con Jaccard 0,5, con 0 coincidencias exactas y 0 aciertos de 8-gramas frente al conjunto de evaluacion reservado, aunque reconoce dos caveats: la comprobacion especifica contra preguntas GATE-PYQ quedo bloqueada (sitio de IIT-KGP caido) y nunca se repitio, y no se hizo verificacion byte a byte SHA-256 entre las copias del corpus en Kaggle y en Studio, solo coincidencia del recuento de filas.

## Capacidades

- Generacion de texto conversacional en ingles con plantilla de chat (roles user/assistant).
- Resolucion de problemas matematicos de estilo GATE y matematicas generales, con respuesta directa en prompts simples.
- Razonamiento paso a paso (chain-of-thought) en problemas complejos, con cierre explicito en "Final answer:".
- Respuesta a preguntas de examen competitivo de nivel universitario y de instituto avanzado.
- Modo conversacional multiturno basico heredado del modelo base Instruct.
- No dispone de capacidades de vision, audio ni multimodalidad.
- No hay evidencia de soporte de tool calling / function calling especifico; el ajuste se hizo sobre pares de preguntas y respuestas matematicas y el modelo base no se entreno para uso de herramientas en esta version.
- No hay soporte declarado de agentes ni de razonamiento multi-paso con planificacion y uso de herramientas externas.
- Soporte multilingue limitado al ingles declarado en la model card.

## Casos de uso

- Tutoria matematica interactiva para estudiantes: el modelo recibe una pregunta de algebra, calculo o estadistica y devuelve el desarrollo paso a paso con la respuesta final marcada, lo que permite integrarlo en un chatbot educativo que muestre el procedimiento y no solo el resultado.
- Generacion de soluciones explicadas para bancos de ejercicios: dado un enunciado del estilo GATE, produce una solucion CoT que un docente puede revisar y editar antes de publicarla como material de practica.
- Practica de examenes competitivos en local: al ocupar menos de 1 GB en float16, se puede desplegar en un portatil o en un equipo sin GPU dedicada para que el alumno practique sin enviar datos a servicios externos.
- Prototipado rapido de pipelines de evaluacion de SLM matematicos: sirve como linea base reproducible (semilla 7, log de entrenamiento y hash del corpus publicados) frente a la que comparar tecnicas de PEFT, mezclas de datos o decodificacion especulativa.
- Componente auxiliar en un sistema mayor de resolucion de problemas: por su tamano puede actuar como "primer paso" que genere un borrador de solucion, que despues se valide con un modelo mayor o con un verificador simbolico (por ejemplo, sympy) antes de mostrarlo.
- Generacion de datos sinteticos de matematicas: sus salidas CoT pueden usarse como semilla para aumentar corpus de entrenamiento, siempre con filtrado humano o programatico posterior dada su tasa de error y su tendencia a preambulos redundantes.
- Demostraciones educativas de ajuste fino: el repositorio documenta la receta completa (QLoRA, hiperparametros, descontaminacion, evaluacion por niveles) y es util como caso de estudio en cursos de ingenieria de IA open source.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, GSM8K, HumanEval u otros) en la informacion disponible. El autor proporciona unicamente una evaluacion propia por niveles.

Nivel 1, salud del entrenamiento (`results_level1_v4.json`):

| Comprobacion | Resultado |
|---|---|
| Estabilidad numerica | PASS |
| Infraentrenamiento | PASS (reduccion de perdida del 19,7 %) |
| Sobreajuste | OK (brecha final 0,14, estable) |
| Explosion de gradiente | OK |
| Convergencia | FAIL marginal (la tendencia de perdida sube en el ultimo 10 % de pasos; el autor lo atribuye a ruido de decaimiento coseno y del batch, dado que el resto de comprobaciones son sanas) |

Nivel 2, capacidad general y seguimiento de instrucciones (`results_level2_v4.json`):

| Metrica | Resultado |
|---|---|
| Puntuacion de seguimiento de instrucciones (I) | 8/33 (24,24 %) |
| Modo de fallo principal | Antepone un preambulo de cadena de razonamiento incluso bajo restricciones estrictas de formato (una sola palabra, solo JSON, recuentos exactos de palabras), aunque suele acertar la respuesta subyacente |

Nivel 3: no ejecutado para este checkpoint. Requiere servir el modelo por HTTP (`serve_hf.py` + `evaluate.py --level 3 --base-url ...`); el conjunto de evaluacion reservado esta disponible (eval/heldout_eval.jsonl, 282 KB, SHA-256 d2ac7ef3...) y el arnes funciona, ya que el nivel 2 se ejecuto de extremo a extremo contra el mismo servidor, por lo que el nivel 3 puede ejecutarse a posteriori sin reentrenar.

## Requisitos de hardware

- Pesos en float16: aproximadamente 1 GB; sumando activaciones y cache KV, la inferencia cabe holgadamente en menos de 2 GB de VRAM.
- Pesos en int8: en torno a 0,5 GB; en 4 bits, en torno a 0,3 GB (requiere cuantizacion externa, no publicada por el autor).
- GPU recomendadas: cualquier GPU consumer moderna sirve (RTX 3060 12 GB, RTX 4060, RTX 4090); tambien es viable en GPUs de datacenter (A100, H100) aunque muy sobredimensionadas para 494 M de parametros. El propio autor entreno con 1x H100 80 GB, pero solo para el proceso de ajuste, no por requisito de inferencia.
- Cabe en GPU consumer: si, en practicamente todas las GPU con 4 GB o mas de VRAM, e incluso en CPU con cuantizacion de 4 bits, y en Mac con Apple Silicon mediante llama.cpp.
- Opciones de despliegue: transformers (uso oficial del autor, con `from_pretrained` y torch.float16), TGI, vLLM, llama.cpp u Ollama previa conversion a GGUF (no incluida en el repositorio). El autor provee `serve_hf.py`, un servidor compatible con la API de OpenAI basado solo en la libreria estandar y transformers, sin necesidad de Ollama.
- Latencia y throughput: no disponibles. La cache KV a 2.048 tokens es del orden de decenas de MB, por lo que el cuello de botella en GPUs pequenas sera el propio bucle de decodificacion y no la memoria.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Rendimiento en benchmarks | Disponibilidad |
|---|---|---|---|---|---|
| math-slm-qwen2.5-0.5b-v4 | 494 M | 2.048 tokens en entrenamiento | Apache-2.0 | Solo evaluacion interna: I = 8/33 (24,24 %); sin resultados publicados de MMLU, GSM8K u otros | HuggingFace, 1,0 GB, safetensors fp16, idioma ingles |
| Qwen2.5-0.5B-Instruct (modelo base) | 494 M | Ventana nativa mayor que la del ajuste segun su documentacion | Apache-2.0 | No disponible en la informacion proporcionada | HuggingFace, ampliamente descargado |
| Qwen2.5-Math-1.5B-Instruct | 1,5 B | No disponible en la informacion proporcionada | Apache-2.0 | No disponible en la informacion proporcionada | HuggingFace, modelo oficial de la familia Qwen orientado a matematicas |
| Modelos matematicos de 7 B o superiores (por ejemplo, familias DeepSeek-Math o Qwen2.5-Math de mayor tamano) | 7 B o mas | No disponible en la informacion proporcionada | Variables segun modelo | No disponible en la informacion proporcionada | Requieren bastante mas VRAM que este SLM |

La busqueda web realizada no devolvio informacion tecnica relevante sobre este modelo ni sobre alternativas comparables: los resultados obtenidos correspondian a contenidos sin relacion (PlayStation VR2). Por tanto, la comparativa de rendimiento queda sin datos verificables y no se han incluido cifras no contrastadas.

## Limitaciones y advertencias

- Seguimiento de instrucciones debil bajo restricciones estrictas de formato: puntuacion de 8/33 (24,24 %) en el nivel 2, con preambulos de razonamiento que rompen formatos como JSON puro, una sola palabra o recuentos exactos de palabras.
- Comprobacion de convergencia fallida de forma marginal: la pendiente de perdida repunta en el ultimo 10 % de los pasos. El autor lo atribuye a ruido del decaimiento coseno y del batch, pero el aviso esta documentado.
- Sesgo hacia cadenas de razonamiento verbosas, heredado de la mezcla de entrenamiento (52 % de filas CoT); se mitigo incluyendo un 48 % de filas en formato directo, pero no se elimino.
- Contexto limitado: entrenado a 2.048 tokens, los problemas mas largos se truncan en lugar de procesarse. No se debe esperar un comportamiento fiable por encima de esa longitud aunque el modelo base admita ventanas mayores.
- Solo ingles declarado: no hay soporte multilingue verificado, y el castellano no aparece entre los idiomas soportados.
- Riesgo de alucinacion matematica: al ser un modelo de 0,5 B ajustado en 1,84 horas de GPU, los pasos intermedios pueden contener errores aritmeticos o algebraicos aunque el formato sea convincente. No debe usarse sin verificacion automatica o humana en contextos de evaluacion real.
- Sesgos conocidos: no se documentan analisis de sesgo demografico, cultural o de estilo en la model card; al entrenarse sobre ExamBench y MathNet, puede presentar sesgos de estilo y vocabulario propios de esos corpus academicos.
- Caveats de trazabilidad reconocidos por el autor: la comprobacion de contaminacion especifica contra GATE-PYQ quedo bloqueada por la caida del sitio de IIT-KGP y no se repitio; tampoco se hizo verificacion SHA-256 byte a byte entre las copias del corpus en Kaggle y en Studio, solo coincidencia del recuento de filas (29.853).
- Licencia: Apache-2.0 permite uso comercial del modelo, pero los datos de entrenamiento incluyen MathNet (CC-BY-4.0), que exige atribucion. Conviene revisar la cadena de atribucion si se redistribuye el modelo o se explota comercialmente.
- Madurez: 0 descargas y 1 like en el momento de la consulta, fecha de publicacion muy reciente y ausencia de validacion por terceros. No es un modelo recomendable como dependencia de produccion sin evaluacion propia.
- Rendimiento en produccion no caracterizado: no hay datos publicos de latencia, throughput ni comportamiento bajo carga concurrente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/singhmandavi/math-slm-qwen2.5-0.5b-v4
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Dataset ExamBench: https://huggingface.co/datasets/169Pi/exambench (Apache-2.0, commit b5f3d8b)
- Dataset MathNet (split IMO): no disponible (referenciado en la model card con licencia CC-BY-4.0, sin URL en la informacion proporcionada)
- Paper o blog tecnico del modelo: no disponible
- Repositorio de codigo: no disponible (la model card menciona los scripts `serve_hf.py`, `pull_data.py`, `build_heldout_eval.py` y `evaluate.py`, pero no enlaza a un repositorio publico)
- Demos: no disponible
- Resultados de busqueda web: no se encontraron enlaces relevantes; los resultados devueltos no guardaban relacion con el modelo
