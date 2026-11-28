# reaperdoesntknow/Dualmind-Qwen-1.7B-Thinking

## Resumen

Dualmind-Qwen-1.7B-Thinking es un ajuste fino por supervisión (SFT) del modelo Qwen3-1.7B, desarrollado por reaperdoesntknow (Convergent Intelligence LLC, Research Division), que destila trazas de razonamiento extendido de Claude Opus 4.6 en un modelo compacto de aproximadamente 2.030 millones de parámetros. El objetivo es transferir a un modelo pequeno los patrones de deliberacion de un modelo frontera: backtracking, autocorreccion, navegacion de incertidumbre y sintesis entre enfoques alternativos, en lugar de la completacion de patrones mecanica que suele producir el SFT sobre datos sinteticos.

El modelo se construye sobre una cadena de destilacion previa (Qwen3-1.7B → DiStil-Qwen3-1.7B-uncensored → Disctil-Qwen3-1.7B) y aplica la metodologia DualMind, que trata el bucle cognitivo "explorar → examinar → responder" como una senal de entrenamiento y no como un truco arquitectonico. El entrenamiento utiliza aproximadamente 2,5 millones de tokens del dataset Opus-4.6-Reasoning-3000x-filtered, con cadenas de razonamiento de Opus 4.6 y las negativas eliminadas.

Es relevante para quienes necesitan capacidades de razonamiento multi-fase en despliegues de borde (edge) o en hardware de consumo, con licencia Apache 2.0 y pesos en safetensors. Su ventana de contexto nativa es de 40.960 tokens, aunque el entrenamiento se realizo con longitud maxima de secuencia de 4.096 tokens.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3ForCausalLM (transformer decoder-only con GQA) |
| Parametros totales | 2.031.739.904 (~2,03B; 1,7B efectivos) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 40.960 tokens (max position); entrenado a 4.096 |
| Tipos de cuantizacion | no disponible en la model card (pesos publicados en BF16; el ecosistema Qwen3 admite GGUF/AWQ/GPTQ, pero el autor no los publica) |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16) |
| Hidden size | 2.048 |
| Capas | 28 |
| Cabezas de atencion | 16 (Q) / 8 (KV), GQA |
| Dimension intermedia | 6.144 |
| Dimension de cabeza | 128 |
| Vocabulario | 151.936 |
| Funcion de activacion | SiLU |
| Precision de entrenamiento | BF16 |
| Tamano del repo | 8,1 GB |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only Qwen3ForCausalLM con 28 capas, hidden size de 2.048, atencion con query grouping (GQA) de 16 cabezas de consulta y 8 de clave/valor, dimension de cabeza 128 e intermedio de 6.144. Usa activacion SiLU y un vocabulario de 151.936 tokens. Los pesos se distribuyen en BF16 y el repositorio ocupa 8,1 GB. No incorpora innovaciones arquitectonicas propias respecto a Qwen3: la contribucion esta en el regimen de entrenamiento.

El entrenamiento se realizo con TRL SFTTrainer sobre una NVIDIA H100, en BF16, con 512 pasos totales, aproximadamente 7,4 epocas y longitud maxima de secuencia de 4.096 tokens. La perdida de entrenamiento bajo de 1,744 a 1,455, con perdida de evaluacion final de 1,406 (por debajo de la de entrenamiento, lo que sugiere ausencia de sobreajuste) y una precision de token que paso del 61,0% al 67,8%. Los datos proceden de nohurry/Opus-4.6-Reasoning-3000x-filtered (cadenas de razonamiento de Opus 4.6 con negativas eliminadas) y, segun los tags, tambien de zai-org/LongWriter-6k. No se documenta RLHF ni DPO; el unico regimen es SFT supervisado.

## Capacidades

- Generacion de texto conversacional en ingles con plantilla de chat (`apply_chat_template`).
- Razonamiento extendido multi-fase: el modelo tiende a explorar, reconsiderar y concluir de forma natural, imitando la estructura deliberativa de las trazas de Opus 4.6.
- Autocorreccion y backtracking: retrocede cuando una linea de razonamiento se debilita, en lugar de completar patrones.
- Navegacion de incertidumbre: produce matices y reservas calibradas, segun la model card.
- Generacion de cadenas largas de razonamiento (ventana de salida recomendada de 1.024 a 2.048 tokens).
- Soporte de tool calling / function calling: no disponible (no documentado).
- Soporte de agentes y razonamiento multi-paso: no disponible como capacidad formal; el modelo exhibe razonamiento multi-paso interno, pero no se documenta integracion con frameworks de agentes.
- Capacidades multilingues: solo ingles declarado.
- Vision, audio o modo thinking explicito con tokens especiales: no disponible.

## Casos de uso

- Razonamiento deliberativo en el borde: el modelo cabe en GPUs de consumo y puede ejecutar cadenas de razonamiento de 1.024 a 2.048 tokens en local, util para asistentes offline que necesitan justificar respuestas paso a paso.
- Tutoria y explicacion de conceptos: para preguntas del tipo "explicame la paradoja de la informacion en agujeros negros", el modelo produce una deliberacion estructurada con reservas y sintesis, adecuada para entornos educativos en ingles.
- Analisis de decisiones con incertidumbre: al haber absorbido patrones de autocorreccion, es util en tareas donde se prefiere una respuesta que reconozca ambiguedad frente a una respuesta categorica.
- Prototipado rapido de pipelines de razonamiento: sirve como modelo de pruebas para validar plantillas de chat, parametros de muestreo (temperatura 0,6-0,8, repetition penalty 1,1-1,2) y longitudes de generacion antes de escalar a modelos mayores.
- Generacion de borradores de analisis tecnico en ingles: con contexto de hasta 40.960 tokens, puede procesar documentos largos y producir resumenes razonados, aunque el entrenamiento se limito a 4.096 tokens.
- Investigacion sobre destilacion de trazas: como artefacto reproducible de la metodologia DualMind, permite estudiar como se transfiere la estructura deliberativa de un modelo frontera a uno de 1,7B mediante SFT estandar.
- Despliegue en entornos con recursos limitados: licencia Apache 2.0 y pesos BF16 de 8,1 GB permiten fine-tuning adicional e integracion en productos comerciales sin restricciones de licencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta metricas de entrenamiento: perdida final de entrenamiento 1,455, perdida de evaluacion 1,406 y precision de token del 67,8% al final del entrenamiento.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 4,1 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica, entre 5 y 6 GB para secuencias cortas.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 2,2 GB de pesos; en 4 bits, alrededor de 1,2 GB (estimaciones teoricas, no publicadas por el autor).
- GPU recomendadas: NVIDIA H100 para entrenamiento (documentado); para inferencia, cualquier GPU con al menos 6-8 GB de VRAM, como RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090, A10G, L4 o A100.
- Cabe en GPU de consumo: si, en modelos con 8 GB o mas en BF16 y en modelos con 4-6 GB si se cuantiza.
- Opciones de despliegue: transformers (documentado en la model card), text-generation-inference (tag `text-generation-inference` y `endpoints_compatible`); llama.cpp, Ollama y vLLM no estan documentados por el autor, aunque la arquitectura Qwen3 es compatible con dichos runtimes si se generan pesos en los formatos correspondientes.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| Dualmind-Qwen-1.7B-Thinking | ~2,03B | 40.960 (entrenado a 4.096) | Apache 2.0 | SFT sobre trazas de razonamiento de Opus 4.6 | Hugging Face, safetensors BF16 |
| Qwen3-1.7B (base) | ~2,03B | 32.768 (tipico en Qwen3) | Apache 2.0 | Modelo base generalista | Hugging Face, multiples formatos |
| DualMind (LogicInference) | ~1,7B | no disponible | Apache 2.0 | SFT sobre LogicInference | Hugging Face |
| TopologicalQwen | no disponible | no disponible | Apache 2.0 | Destilacion de 30B-Thinking (TKD) | Hugging Face |

La comparativa se limita a la familia DualMind y al modelo base, ya que no hay datos de benchmarks publicados que permitan contrastar rendimiento con alternativas de otros autores. La diferencia principal frente a Qwen3-1.7B es el sesgo hacia deliberacion extendida y autocorreccion; frente a DualMind (LogicInference), el sesgo es hacia razonamiento mas matizado y menos mecanico.

## Limitaciones y advertencias

- Solo soporta ingles de forma declarada; el rendimiento en castellano no esta evaluado.
- Entrenado con longitud maxima de secuencia de 4.096 tokens: aunque la ventana nativa es de 40.960, el comportamiento mas alla de 4.096 no esta validado y puede degradarse.
- Riesgo de alucinacion: es un modelo de 1,7B efectivos; las trazas de Opus 4.6 ensenan la forma del razonamiento, no garantizan la correccion factual.
- Riesgo de bucles en cadenas largas: el autor recomienda repetition penalty de 1,1 a 1,2 y temperatura de 0,6 a 0,8 para mitigarlo.
- Sesgos: no documentados por el autor; al derivar de un modelo base y de trazas de un modelo frontera, puede heredar sesgos de ambos.
- El dataset de entrenamiento tiene las negativas eliminadas, lo que puede reducir la calibracion de rechazos en usos sensibles.
- No se documentan capacidades de tool calling ni integracion con agentes; no debe asumirse su disponibilidad en produccion.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias ni soporte; verificar la procedencia de los datos de destilacion si se requiere cumplimiento estricto.
- El modelo tiene 1 like y 1.886 descargas en el momento de la ficha: comunidad muy reducida y validacion externa practicamente inexistente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/reaperdoesntknow/Dualmind-Qwen-1.7B-Thinking
- Modelo base inmediato (Disctil-Qwen3-1.7B): https://huggingface.co/reaperdoesntknow/Disctil-Qwen3-1.7B
- Modelo base declarado en los tags (DualMinded-Qwen3-1.7B): https://huggingface.co/reaperdoesntknow/DualMinded-Qwen3-1.7B
- Variante DualMind (LogicInference): https://huggingface.co/reaperdoesntknow/DualMind
- Variante TopologicalQwen: https://huggingface.co/reaperdoesntknow/TopologicalQwen
- Dataset de razonamiento: https://huggingface.co/datasets/nohurry/Opus-4.6-Reasoning-3000x-filtered
- Dataset adicional (LongWriter-6k): https://huggingface.co/datasets/zai-org/LongWriter-6k
