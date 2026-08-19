# logic65/Qwen3.8-Whittle-16B

## Resumen

Qwen3.8-Whittle-16B es un modelo de lenguaje creado por logic65 (David Aylward) mediante poda estructural del Qwen/Qwen3.8-27B-FP8, un transformer de 27B parámetros de la familia Qwen3.5 con arquitectura gated-deltanet (GDN). El proceso elimina 20 de las 64 capas (depth pruning) y reduce un 25% el ancho de las capas MLP (width pruning), pasando de 26.9B a 16.3B parámetros, sin entrenamiento previo a la poda. Posteriormente se aplica una curación (heal) con QLoRA sobre un dataset de 11M tokens de linaje limpio, que restaura gran parte de las capacidades perdidas.

El resultado es un modelo de 16.3B parámetros que ejecuta a 18.5–20.9 tokens por segundo en dos GPUs de consumo de 8GB (RTX 4060 + 3050), con un peso GGUF Q4_K_M de 10.1GB que cabe íntegramente en 16GB de VRAM. El autor reporta que supera en una batería de 39 tareas greedy a todos los cortes intermedios, incluidos los de 20.8B parámetros. Es relevante porque demuestra que la poda agresiva combinada con una curación ligera puede producir modelos eficientes y desplegables en hardware de consumo, aunque con limitaciones documentadas en generaciones largas y formato de código.

El modelo se distribuye bajo licencia Apache 2.0 y está disponible en formatos safetensors y GGUF, con soporte para llama.cpp estándar (builds con soporte Qwen3.5). Incluye modo de razonamiento (thinking) antes de responder, heredado de la familia Qwen3.5.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con gated-deltanet (GDN), familia Qwen3.5 |
| Parametros totales | 16.344.368.864 (16.3B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (el autor usa 4096 en su ejemplo de despliegue) |
| Tipos de cuantizacion | GGUF Q4_K_M (mencionado); safetensors FP8 heredado del base |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors, GGUF |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.8-27B-FP8, un transformer de 64 capas con atención y mezcla de expertos? No, es denso, con capas gated-deltanet (GDN), una variante de atención lineal o de compuerta que reduce el coste computacional frente a la atención estándar. La poda se realiza en dos fases: primero se eliminan 20 capas completas en bloques de intervalo, seleccionadas por un criterio de coste de frontera medido con un logit-lens y similitud de identidad por capa; segundo, se reduce el ancho de las MLP restantes un 25%, eliminando las neuronas más débiles según la norma de la proyección down multiplicada por la desviación estándar de activación. El autor documenta que el daño por eliminación de capas no es aditivo y que el daño por reducción de ancho se acumula; también identifica que las capas 32–35 concentran capacidades aritméticas.

La curación posterior usa QLoRA con r=64 aplicado a todas las proyecciones lineales (incluidas las GDN), normas de capa de rango completo, 110 pasos con coseno anealed hasta completarse, y un dataset de 11M tokens de linaje limpio: marcos de hechos sintéticos, aritmética de razonamiento corto programática, ejercicios de código escritos a mano y páginas largas de dominio público. El proceso completo de poda y curación se ejecuta en una sola noche con una GPU A100. No se han publicado detalles sobre la composición exacta del dataset de curación más allá de lo descrito.

## Capacidades

- Generación de texto conversacional y de razonamiento: el modelo piensa en un bloque `thinking` antes de responder, siguiendo el comportamiento de la familia Qwen3.5.
- Razonamiento aritmético: recupera la precedencia de operadores y la corrección de cálculo tras la curación (el autor reporta que la aritmética volvió a su forma "textbook").
- Generación de código: el código generado es funcional, pero se emite fuera de bloques markdown por defecto (defecto conocido del dataset de curación); se puede forzar el formato con instrucciones explícitas.
- Conocimiento factual de largo alcance: la curación restauró la recuperación de hechos frágiles como el punto de ebullición del agua (fallaba en todos los cortes intermedios) y mejoró la memoria de reconocimiento de 2/7 a 5/7 en una sonda específica.
- Capacidades multilingües: no documentadas por el autor; se heredan del modelo base Qwen3.8-27B, pero no hay evaluación publicada.
- Tool calling y agentes: no documentado en la model card; no se puede confirmar.

## Casos de uso

- Despliegue de asistente conversacional en hardware de consumo: con el GGUF Q4_K_M (10.1GB) cabe en una GPU de 16GB o en dos de 8GB vía split, alcanzando 18.5–20.9 t/s. Es viable para prototipos y entornos sin acceso a GPUs de datacenter.
- Generación de código asistida en local: el modelo produce código funcional, aunque requiere instrucciones explícitas de formato (por ejemplo, "devuelve el código dentro de un bloque ```"). Adecuado para editores con autocompletado o asistentes de terminal.
- Razonamiento aritmético y lógico en aplicaciones educativas: la curación restauró la precedencia de operadores y la corrección en cálculos, por lo que puede usarse en tutores que expliquen pasos intermedios con su modo thinking.
- Recuperación de conocimiento factual en dominios acotados: con 16.3B parámetros y una curación dirigida, es útil para tareas de pregunta-respuesta donde no se requiere una cobertura enciclopédica amplia, como documentación técnica o FAQ.
- Experimentación con poda y curación: el repositorio de investigación asociado documenta la metodología completa, lo que lo convierte en referencia para quienes estudian técnicas de compresión de modelos.
- Inferencia de largo contexto con restricciones: el autor sugiere usar ventanas de 4096 tokens; con DRY sampling puede servir conversaciones multi-turno sin caer en bucles de repetición, aunque hay que evitar temperaturas casi greedy en salidas largas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks académicos (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El autor evaluó el modelo con una batería propia de 39 tareas greedy y sondas específicas, comparando los cortes intermedios y el modelo curado. Los resultados, extraídos de la model card, son los siguientes:

| Variante | Parametros | Tamano archivo | Aciertos (39 tareas greedy) | Velocidad (RTX 4060 + 3050) |
|---|---|---|---|---|
| Qwen3.8-27B (base) | 26.9B | — | No medible en hardware de referencia | — |
| Corte de 48 capas | 20.8B | 12.9GB | 33/39 | 5 t/s |
| Whittle sin curar | 16.8B | 10.1GB | 25/39 | 20.5 t/s |
| Whittle curado (este modelo) | 16.8B | 10.1GB | 36/39 | 18.5–20.9 t/s |

Nota: el autor indica que la cifra de 16.8B en la tabla se refiere al recuento de parámetros tras la poda, mientras que los safetensors del repositorio registran 16.344.368.864 parámetros (16.3B). La diferencia puede deberse al redondeo del autor o a la inclusión de parámetros no entrenables.

## Requisitos de hardware

- VRAM estimada para inferencia: el GGUF Q4_K_M ocupa 10.1GB y cabe en 16GB de VRAM; también funciona en dos GPUs de 8GB con split (el autor lo probó en RTX 4060 + 3050).
- GPUs recomendadas: RTX 4060 (8GB) + RTX 3050 (8GB) como mínimo; una sola GPU de 16GB (por ejemplo, RTX 4080, RTX 4090) también es suficiente.
- Compatibilidad con GPU de consumo: sí, es el caso de uso principal del modelo.
- Opciones de despliegue: llama.cpp (llama-server) con builds que soporten Qwen3.5; el autor confirma que los GGUF corren en stock llama.cpp. No se menciona compatibilidad con vLLM, Ollama o TGI, aunque al ser safetensors y GGUF es plausible que funcionen con adaptadores estándar.
- Latencia y throughput: 18.5–20.9 t/s en la configuración de dos GPUs de 8GB, medido por el autor.

## Comparativa con modelos similares

No se dispone de datos de benchmarks académicos para comparar directamente con otros modelos de ~16B. La comparación más relevante es con el modelo base del que deriva:

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Qwen3.8-Whittle-16B | 16.3B | No disponible | Apache 2.0 | HuggingFace (safetensors, GGUF) | Podado y curado, corre en 2x8GB |
| Qwen3.8-27B-FP8 (base) | 26.9B | No disponible | Apache 2.0 | HuggingFace | Modelo original, requiere más VRAM |
| Qwen3.8-27B (no cuantizado) | 26.9B | No disponible | Apache 2.0 | HuggingFace | Versión sin cuantizar, aún más pesado |

No se dispone de información sobre alternativas de terceros del mismo tamaño (por ejemplo, Llama 3.2 8B, Mistral 7B, Gemma 2 9B) con datos comparables de rendimiento en las mismas tareas, por lo que no se puede establecer una comparativa rigurosa.

## Limitaciones y advertencias

- Defecto de formato en código: el modelo emite código fuera de bloques markdown por defecto, un fallo heredado del dataset de curación; se mitiga pidiendo explícitamente un bloque de código.
- Bucles de repetición en generaciones largas: el autor documenta repeticiones infinitas (por ejemplo, atributos de clase HTML) en salidas largas, daño residual de la poda de ancho. Se mitiga con DRY sampling (`--dry-multiplier 0.8 --dry-base 1.75 --dry-allowed-length 4 --repeat-penalty 1.15 --repeat-last-n 512`) y evitando temperaturas casi greedy.
- Agotamiento del presupuesto de razonamiento en prompts creativos: peticiones abiertas como "escribe un haiku" pueden consumir todo el presupuesto de thinking sin producir respuesta; instrucciones concretas y acotadas funcionan mejor.
- Conocimiento limitado: la curación con solo 11M tokens no restaura el conocimiento enciclopédico completo de un modelo de 27B; es un modelo eficiente de 16.3B, no un 27B disfrazado.
- Evaluación limitada: la batería de 39 tareas greedy es propia del autor, no un benchmark académico estandarizado; los resultados son comparables dentro de la tabla, pero no con otros modelos.
- Sesgos y alucinación: no se han evaluado formalmente; al ser un modelo podado, el riesgo de alucinación en hechos poco frecuentes puede ser mayor que en el base.
- Restricciones de licencia: Apache 2.0 permite uso comercial sin restricciones, pero el autor advierte que los pesos actuales tienen bugs conocidos y recomienda esperar a la versión v2 para uso serio.
- Soporte de contexto largo: no se documenta la longitud máxima de contexto; el ejemplo usa 4096 tokens, pero no hay garantía de que el modelo funcione bien más allá.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/logic65/Qwen3.8-Whittle-16B
- Repositorio de investigación (variante sin curar y metodología): https://huggingface.co/logic65/Qwen3.8-p44w75-16.8B-unrepaired
- Adapter QLoRA de curación: https://huggingface.co/mrdayl/q38p44w75-heal-lora
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B-FP8
