# sandeep123/stride-qwen3-1.7b-allref-correctonly-kl0-token-uniform-20260925

## Resumen

STRIDE Qwen3-1.7B es un adaptador LoRA de investigación publicado por el usuario sandeep123 (Kumar) sobre el modelo base Qwen/Qwen3-1.7B. No se trata de un modelo completo ni de un asistente listo para producción, sino del resultado final (época 4, actualización 128) de un experimento de aprendizaje por refuerzo orientado a razonamiento matemático, en el que se aplica una señal auxiliar de diversidad denominada STRIDE sobre trayectorias correctas. El adaptador tiene un interés claro para quienes investigan en RLVR (reinforcement learning with verifiable rewards) y en el problema del colapso de diversidad de las políticas durante el entrenamiento con GRPO.

El método entrena con ocho rollouts por prompt y calcula la novedad frente a pasos elegibles de las ocho trayectorias, incluyendo tanto las correctas como las incorrectas, pero solo las correctas reciben el bonus de diversidad STRIDE; las incorrectas conservan su señal ordinaria de resultado. La variante publicada aquí usa asignación uniforme por token del bonus y coeficiente KL igual a cero. El entrenamiento se realizó con thinking desactivado y se recomienda reproducir la evaluación con `enable_thinking=False`.

Al ser un adaptador PEFT sobre un modelo denso de 1.700 millones de parámetros, su huella de despliegue es pequeña y cabe en GPU de consumo, pero su alcance declarado por el autor se limita al razonamiento matemático y no ha sido validado para despliegue general. No se han publicado resultados de benchmarks en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (modelo base Qwen3-1.7B); el repositorio contiene un adaptador LoRA, no pesos completos |
| Parametros totales | 1.700 millones en el modelo base; el adaptador LoRA añade un numero no especificado de parametros entrenables (rango 16 sobre proyecciones q/k/v/o y gate/up/down) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No especificada en la ficha del adaptador. El modelo base Qwen3-1.7B soporta 32.768 tokens nativos, extensibles a 131.072 con YaRN segun la documentacion de la serie Qwen3 |
| Tipos de cuantizacion | No disponible para el adaptador (pesos LoRA en precision de entrenamiento). El modelo base admite cuantizaciones de terceros en GGUF, AWQ y GPTQ |
| Idiomas soportados | No disponible en la ficha (el modelo base Qwen3 es multilingue, pero el adaptador no declara cobertura linguistica) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); subcarpeta `checkpoint-000128` |
| Libreria | peft (con transformers) |
| Tamano del repositorio | 3,2 GB |
| Tipo de adaptador | LoRA, rango 16, alpha 32, dropout 0 |
| Modulos objetivo | Proyecciones q, k, v, o y gate, up, down |
| Modelo base | Qwen/Qwen3-1.7B |
| Fecha de creacion | 2026-09-25 |
| Ultima actualizacion | 2026-09-25 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El adaptador se monta sobre un transformer decoder-only denso de 1.700 millones de parámetros con atención causal y plantilla de chat de Qwen3. El entrenamiento se realizó con LoRA de rango 16 y alpha 32, sin dropout, aplicado tanto a las proyecciones de atención (q, k, v, o) como a las proyecciones del bloque MLP (gate, up, down). La configuración de generación empleada fue de 8 rollouts por prompt, con un lote global de 64 prompts durante 4 épocas sobre 2.048 ejemplos de entrenamiento, lo que da un total de 128 actualizaciones. La tasa de aprendizaje fue de 2e-5 con 10 actualizaciones de calentamiento, semilla 42 y hardware AMD Instinct MI210.

La innovación del método es la señal STRIDE de diversidad: la novedad de cada paso se calcula contra pasos elegibles de las ocho trayectorias muestreadas (correctas e incorrectas), pero el bonus auxiliar se concede únicamente a las trayectorias correctas, mientras que las incorrectas mantienen su señal ordinaria de resultado tipo GRPO. En esta variante concreta el bonus se reparte de forma uniforme entre los tokens elegibles de la respuesta y el coeficiente KL se fija a cero, de modo que no hay anclaje explícito al modelo de referencia. El autor publica variantes relacionadas, como la de reparto local-positivo y la de estabilización sin modo thinking, lo que sugiere que este repositorio forma parte de una ablación sistemática sobre cómo distribuir el bonus de diversidad.

## Capacidades

- Generación de texto autoregresiva con la plantilla de chat de Qwen3, en modo sin razonamiento explícito (thinking desactivado durante el entrenamiento y la evaluación).
- Razonamiento matemático de tipo paso a paso, que es el dominio declarado del entrenamiento.
- Generación de soluciones con estructura de cadena de pensamiento corta o directa, según el formato de los 2.048 ejemplos usados.
- Capacidades generales del modelo base Qwen3-1.7B (comprensión lectora básica, generación de código, seguimiento de instrucciones sencillas), no reforzadas por el adaptador.
- Soporte de tool calling / function calling: no disponible como capacidad validada del adaptador.
- Soporte de agentes y razonamiento multi-paso largo: no disponible como capacidad validada.
- Capacidades multilingües: no declaradas para el adaptador; hereda lo que ofrezca el modelo base.
- Capacidades especiales: no se declara visión, audio ni modo thinking activable. El uso previsto es reproducción de experimentos de RL.

## Casos de uso

- Reproducción y auditoría de experimentos STRIDE: el repositorio incluye la configuración completa (rollouts, bonus, KL, semilla) y un manifiesto SHA-256, lo que permite replicar la actualización 128 y compararla con las variantes local-positive y token-uniform sin thinking publicadas por el mismo autor.
- Ablación del reparto del bonus de diversidad: al ser una de las variantes de una familia de adaptadores con la misma base, sirve para aislar el efecto de asignar el bonus de forma uniforme por token frente a otras distribuciones, manteniendo fijo el resto de hiperparámetros.
- Estudio del colapso de diversidad en RLVR: el adaptador es un artefacto útil para medir si una política de 1.7B entrenada con GRPO sin penalización KL mantiene variedad de soluciones en problemas matemáticos con múltiples caminos válidos.
- Generación de datos sintéticos de razonamiento matemático: puede usarse para producir soluciones candidatas que luego se filtren por corrección, como paso previo a la destilación en modelos mayores o a la construcción de datasets de preferencias.
- Prototipado educativo local: con un adaptador de este tamaño es viable desplegar un tutor de matemáticas básicas en una GPU de consumo, siempre que se acepte que no hay validación de calidad fuera del conjunto de entrenamiento.
- Investigación sobre ajuste con KL cero: permite estudiar empíricamente qué ocurre cuando se elimina la penalización KL en un esquema tipo GRPO con recompensa verificable, comparando deriva respecto al modelo base.
- Base para ajuste posterior: al ser un adaptador PEFT, se puede fusionar con Qwen3-1.7B, cuantizar y reutilizar como punto de partida para nuevos ciclos de RL o SFT en otros dominios.
- Evaluación comparativa de infraestructura: el entrenamiento se hizo en AMD Instinct MI210, por lo que el repositorio sirve como referencia de receta reproducible en hardware AMD (ROCm) frente a recetas equivalentes en NVIDIA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de GSM8K, MATH, MMLU, HumanEval ni de ningún otro conjunto de evaluación, ni comparaciones numéricas con el modelo base o con las variantes hermanas.

## Requisitos de hardware

- VRAM estimada para inferencia (estimaciones a partir de 1.700 millones de parámetros, no publicadas por el autor): en fp16/bf16, unos 3,4 GB de pesos más caché KV y activaciones, en torno a 4-5 GB en total para secuencias moderadas; la carga en 8 bits baja a unos 2 GB y en 4 bits a 1,2-2 GB con overhead.
- GPU recomendadas para inferencia: cualquier GPU con 6-8 GB o más. Una RTX 3060 de 12 GB, una RTX 4060 Ti de 16 GB o una RTX 4070 permiten fp16 con contexto amplio; una RTX 4060 de 8 GB funciona en fp16 con contexto moderado o en 4 bits con contexto largo.
- Cabe en GPU de consumo: sí, es uno de los puntos fuertes del tamaño. También es viable en Apple Silicon (M1 Pro o superior) y en CPU con cuantización agresiva, con latencias mucho mayores.
- Hardware de entrenamiento empleado por el autor: AMD Instinct MI210. Reproducir el bucle de RL completo (lote de 64 prompts, 8 rollouts por prompt) requiere bastante más memoria que la inferencia, no cuantificada en la ficha.
- Opciones de despliegue: transformers + peft para cargar el adaptador tal cual; vLLM si se fusiona el adaptador con el modelo base; llama.cpp, Ollama o TGI previa fusión y conversión a GGUF u otro formato cuantizado.
- Latencia y throughput estimados: no disponible. No se han publicado medidas de tokens por segundo ni de latencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad | Rendimiento publicado |
|---|---|---|---|---|---|---|
| STRIDE Qwen3-1.7B (este adaptador) | 1,7 B (base) + LoRA r=16 | No especificado en la ficha; base con 32.768 tokens nativos | Adaptador LoRA de RL para razonamiento matematico | Apache 2.0 | HuggingFace, 0 descargas | No disponible |
| Qwen/Qwen3-1.7B (modelo base) | 1,7 B densos | 32.768 nativos, 131.072 con YaRN | Modelo denso instructivo con modo thinking | Apache 2.0 | HuggingFace, ampliamente usado | Publicados por el equipo Qwen |
| DeepSeek-R1-Distill-Qwen-1.5B | 1,5 B densos | No disponible en la informacion recogida | Modelo destilado de razonamiento | MIT (segun la familia DeepSeek-R1) | HuggingFace | Publicados por DeepSeek |
| Variante hermana stride-qwen3-1.7b-allref-correctonly-local-positive-20260925 | 1,7 B (base) + LoRA | Misma base | Adaptador LoRA con reparto local-positivo del bonus | Apache 2.0 | HuggingFace | No disponible |

La comparación con alternativas de la misma categoría (modelos de 1 a 2 mil millones de parámetros orientados a razonamiento) no puede completarse en términos de rendimiento porque este adaptador no publica métricas. La diferencia relevante frente al modelo base y frente a los destilados es de propósito: aquí no se busca un modelo utilizable, sino un artefacto reproducible para experimentos de RL con recompensa verificable.

## Limitaciones y advertencias

- El propio autor declara que es un adaptador de investigación para razonamiento matemático y que no ha sido validado para despliegue general.
- No se han publicado benchmarks, por lo que se desconoce si mejora, iguala o empeora al modelo base Qwen3-1.7B en cualquier tarea medible.
- El entrenamiento se hizo exclusivamente sobre el modelo base declarado; no hay garantía de comportamiento correcto si se aplica sobre otros pesos.
- Sesgos conocidos: no documentados. Al derivar de Qwen3-1.7B, hereda los sesgos de los datos de preentrenamiento de esa familia, no analizados en la ficha.
- Riesgo de alucinación: no evaluado. En tareas matemáticas, un adaptador entrenado con recompensa verificable puede producir cadenas de razonamiento plausibles con resultados incorrectos.
- Limitaciones de contexto e idioma: la ficha no especifica ventana efectiva tras el ajuste ni cobertura lingüística; conviene asumir que el adaptador solo rinde bien en el dominio y el idioma de los 2.048 ejemplos de entrenamiento, que tampoco se detallan.
- Modo thinking desactivado: el adaptador fue entrenado y evaluado con `enable_thinking=False`; activar el razonamiento explícito queda fuera de las condiciones declaradas y puede degradar el comportamiento.
- Coeficiente KL igual a cero: sin anclaje al modelo de referencia, la política puede haber derivado de forma no controlada respecto a Qwen3-1.7B.
- Licencia: Apache 2.0 permite uso comercial del adaptador, pero el uso comercial no está recomendado por el autor y el modelo base arrastra sus propias condiciones, que deben verificarse por separado.
- Repositorio de 3,2 GB para un adaptador LoRA de rango 16: el tamaño sugiere que incluye artefactos adicionales (registro de entrenamiento, manifiesto, posibles checkpoints), por lo que conviene revisar el contenido antes de asumir que solo se descargan los pesos del adaptador.
- Sin descargas ni likes en el momento de la consulta, lo que implica ausencia de validación por parte de terceros.
- No se documenta el dataset de entrenamiento ni su procedencia, lo que dificulta evaluar contaminación o licencias de los datos.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/sandeep123/stride-qwen3-1.7b-allref-correctonly-kl0-token-uniform-20260925
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Repositorio oficial de Qwen3 (codigo y documentacion): https://github.com/QwenLM/Qwen3
- Variante hermana (reparto local-positivo): https://huggingface.co/sandeep123/stride-qwen3-1.7b-allref-correctonly-local-positive-20260925
- Variante hermana (estabilizada sin thinking, 2048, token-uniform): https://huggingface.co/sandeep123/stride-qwen3-1.7b-nonthinking-stabilized-2048-token_uniform-20260916
- Ficha de terceros sobre Qwen3-1.7B: https://llmfit.io/models/qwen3%3A1.7b
