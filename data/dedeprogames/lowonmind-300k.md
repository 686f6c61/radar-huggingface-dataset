# DedeProGames/LowOnMind-300k

## Resumen

LowOnMind-300k es un modelo de lenguaje decoder-only con 296.960 parámetros, desarrollado por DedeProGames y publicado en Hugging Face. Se trata de una variante extrema de DynamicMind-Mini (8,9 millones de parámetros), reducido aproximadamente 30 veces, cuyo proposito explicito no es ser util, sino explorar que capacidades reales se obtienen con un tercio de millon de parametros. El autor lo describe como un experimento sobre los limites del escalado: el modelo esta entrenado con 200 millones de tokens de FineWeb-Edu, lo que supone 673 tokens por parametro, unas 30 veces por encima de la relacion optima de Chinchilla.

El modelo utiliza una arquitectura transformer con 6 capas, hidden size de 64, atencion GQA con 4 cabezas de query y 2 de key/value, y un vocabulario propio byte-level BPE de solo 1024 tokens. La ventana de contexto es de 512 tokens. El entrenamiento se realizo en una unica Tesla T4 durante 43 minutos, con una perdida de validacion de 3,2982 nats/token y una perplejidad de 27,06. Los resultados en el benchmark BananaMind Base Bench 1.1 muestran una precision bruta del 26,6%, apenas 1,6 puntos por encima del azar (25%), lo que confirma que el modelo produce texto localmente gramatical pero sin coherencia semantica mas alla de unos pocos tokens.

La relevancia de este modelo es principalmente investigadora: sirve como punto de referencia extremo para estudiar que capacidades emergen (o no) en modelos muy pequenos, y como banco de pruebas para tecnicas de entrenamiento eficiente. Su licencia Apache 2.0 permite uso comercial sin restricciones, aunque su utilidad practica en produccion es practicamente nula.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con GQA y QK-Norm |
| Parametros totales | 296.960 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | no disponible (solo safetensors en FP32/FP16) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (custom modeling code) |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only de 6 capas con hidden size de 64 e intermediate size de 136 (2,12 veces el hidden). Utiliza atencion GQA con 4 cabezas de query y 2 de key/value, con head dim de 16. El vocabulario es un BPE byte-level propio de 1024 tokens, necesario para ajustarse al presupuesto de parametros: con 8192 tokens, solo la embedding ocuparia mas que el modelo completo. Las embeddings estan atadas (tied), con 65.536 parametros en la embedding, 231.360 en los seis bloques y 64 en la normalizacion final.

Respecto a DynamicMind-Mini, incorpora tres cambios principales: QK-Norm (RMSNorm por cabeza en queries y keys antes de RoPE, que anade 32 parametros por bloque y permite una tasa de aprendizaje de 2e-3), RoPE precomputado con cache que se re-expande automaticamente para secuencias mas largas, e inicializacion residual escalada (o_proj y down_proj con std / sqrt(2 * num_layers) en lugar de 0,02 plano).

El entrenamiento uso 200 millones de tokens de HuggingFaceFW/fineweb-edu (sample-10BT), con secuencias de 512 tokens, batch de 64, optimizador AdamW con betas (0,9, 0,95) y weight decay de 0,1. La tasa de aprendizaje fue de 2e-3 con decaimiento coseno hasta 2e-4 y 250 pasos de warmup. El grad clip se fijo en 1,0. Se entreno en una Tesla T4 durante 43 minutos. El autor senala que la perdida de entrenamiento y validacion se mantuvieron dentro de 0,05 durante todo el entrenamiento, indicando que no hay sobreajuste: el modelo esta limitado por parametros, no por datos.

## Capacidades

- Generacion de texto con gramatica local correcta: el modelo produce fragmentos de 3-4 tokens gramaticalmente correctos, con ortografia aprendida como proceso (ensambla palabras de 4-5 fragmentos de tokens sin errores ortograficos).
- Aprendizaje de estructura documental: reproduce marcadores de lista, encabezados, mayusculas tras puntos y apostrofes en contracciones, aprendidos de FineWeb-Edu.
- Invento de palabras con fonotactica inglesa plausible: el ejemplo "Donah" muestra que el modelo internaliza patrones fonologicos del ingles.
- Sin capacidad de seguimiento semantico: la coherencia no se mantiene mas alla de aproximadamente cuatro tokens.
- Sin soporte de tool calling ni function calling.
- Sin capacidades de agente ni razonamiento multi-paso.
- Sin soporte multimodal (solo texto).
- Sin modo thinking ni generacion de razonamiento explicito.

## Casos de uso

- Investigacion academica sobre limites del escalado: sirve como punto de referencia extremo para estudiar que capacidades minimas emergen con 300K parametros, comparable a otros experimentos de tiny models en la literatura.
- Banco de pruebas para tecnicas de entrenamiento eficiente: su entrenamiento en 43 minutos en una T4 permite iterar rapidamente sobre cambios en arquitectura, optimizador o datos.
- Analisis de tokenizacion byte-level: con solo 1024 tokens, permite estudiar como un modelo aprende ortografia y morfologia desde fragmentos de tokens sin vocabulario extenso.
- Depuracion de pipelines de entrenamiento: su tamano minimo y velocidad de entrenamiento lo hacen util para validar infraestructura, scripts de datos o configuraciones antes de escalar a modelos mayores.
- Proyectos educativos: util para ensenar conceptos de arquitectura transformer, GQA, QK-Norm y entrenamiento desde cero con recursos minimos.
- Arte generativo o proyectos creativos: la generacion de texto sin coherencia semantica puede usarse como fuente de texto surrealista o experimental, similar a otros modelos pequenos.
- Benchmark de referencia para evaluar la dificultad de tareas: su rendimiento cercano al azar en BananaMind Base Bench 1.1 (26,6% frente a 25% de azar) lo convierte en un baseline inferior util para calibrar la dificultad de nuevos benchmarks.

## Benchmarks y rendimiento

Resultados en BananaMind Base Bench 1.1 (benchmark de 350 items de continuacion de texto en ingles para modelos base):

| Categoria | Precision | Precision ponderada | Elo |
|---|---:|---:|---:|
| language_completion | 46,0% | 52,5% | 921 |
| commonsense | 34,0% | 35,6% | 848 |
| quantitative | 32,0% | 35,0% | 938 |
| logical_reasoning | 24,0% | 25,4% | 905 |
| world_knowledge | 22,0% | 21,6% | 728 |
| code_completion | 14,0% | 15,0% | 789 |
| context_tracking | 14,0% | 15,9% | 707 |

| Metrica global | Valor |
|---|---:|
| Elo global | 833 |
| Precision bruta | 26,6% |
| Precision ponderada | 27,9% |
| Azar | 25,0% |

Metricas de language modelling:

| Metrica | Valor |
|---|---|
| Perdida de validacion | 3,2982 nats/token |
| Perplejidad de validacion | 27,06 |
| Bits por caracter | 2,03 |

El autor advierte que la perplejidad no es comparable entre tokenizadores: con un vocabulario de 1024 tokens, 27,06 significa algo muy distinto que con 50K tokens. La metrica portable es bits por caracter (2,03). No se han publicado resultados en benchmarks estandar como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 10 MB en FP32 (el modelo pesa aproximadamente 1,2 MB en safetensors). Cabe en cualquier GPU, incluidas integradas.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM es suficiente. El entrenamiento se realizo en una Tesla T4 (16 GB), pero la inferencia es viable en CPU.
- Compatibilidad con GPU de consumo: si, cualquier GPU consumer (GTX 1050, RTX 3060, etc.) es mas que suficiente.
- Opciones de despliegue: transformers con trust_remote_code=True (requerido por el custom modeling code). No se ha verificado compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible, pero con 296K parametros la generacion es practicamente instantanea incluso en CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Vocabulario | Perdida validacion | Licencia |
|---|---|---|---|---|---|
| LowOnMind-300k | 296.960 | 512 | 1024 (BPE byte-level) | 3,2982 nats/token | Apache 2.0 |
| DynamicMind-Mini | 8,9M | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de otros modelos comparables en la informacion proporcionada. El unico punto de referencia directo es DynamicMind-Mini, del cual LowOnMind-300k es una variante 30 veces menor. No se han encontrado datos de benchmarks comparativos con otros tiny models como TinyStories o SmolLM en la informacion disponible.

## Limitaciones y advertencias

- Sin coherencia semantica: el modelo no mantiene significado mas alla de aproximadamente cuatro tokens. Los ejemplos de salida muestran fragmentos gramaticales sin conexion entre si.
- Alto riesgo de alucinacion: el modelo inventa palabras y hechos con total libertad, como "Donah" o "Exodus of Donah".
- Vocabulario extremadamente reducido: 1024 tokens implican una compresion de aproximadamente 2,35 caracteres por token, lo que limita la eficiencia y la capacidad de representacion.
- Solo ingles: el modelo fue entrenado exclusivamente con datos en ingles (FineWeb-Edu) y su vocabulario byte-level no esta optimizado para otros idiomas.
- Ventana de contexto limitada: 512 tokens, insuficiente para tareas que requieran contexto largo.
- Rendimiento cercano al azar en tareas de razonamiento: 24% en logical_reasoning y 14% en context_tracking, por debajo o al nivel del azar.
- Codigo personalizado: requiere trust_remote_code=True en transformers, lo que implica ejecutar codigo arbitrario del repositorio. Se recomienda auditar el codigo antes de usarlo en entornos de produccion.
- Sin uso practico en produccion: el autor es explicito en que el modelo no esta construido para ser bueno, sino para explorar limites. No es adecuado para tareas reales de generacion de texto.
- Licencia Apache 2.0: permite uso comercial, pero la utilidad practica es nula para aplicaciones reales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DedeProGames/LowOnMind-300k
- Modelo base DynamicMind-Mini: https://huggingface.co/DedeProGames/DynamicMind-Mini
- Dataset de entrenamiento: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Benchmark BananaMind Base Bench 1.1: https://huggingface.co/datasets/BananaMind/BananaMind-Base-Bench-1.1
- Perfil del autor en Hugging Face: https://huggingface.co/DedeProGames
