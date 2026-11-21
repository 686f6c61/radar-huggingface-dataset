# embrelgrim/grimoire

## Resumen

Grimoire (publicado en Hugging Face como `embrelgrim/grimoire`, con el nombre interno "assistant8") es un modelo de lenguaje de tipo "Compact Dual Dynamic LLM" desarrollado por el usuario embrelgrim. Se trata de un fine-tuning sobre `Qwen/Qwen2.5-0.5B-Instruct` que, según la model card, no conserva la arquitectura original completa: el autor indica que ha sido entrenado con el script `build_neuroset.py` y describe una arquitectura propia con `d_model=896`, 14 cabezas de 64 dimensiones, 1 capa base y profundidad recurrente de 8, con solo 35,85 millones de parámetros totales. El vocabulario se ha reducido a 11.264 tokens (cobertura del 99,84 %).

El objetivo declarado es demostrar el funcionamiento de una arquitectura "recurrent-depth" aplicada a tool calling y function calling en ruso, no competir en calidad con modelos de su misma familia. La model card es explícita al respecto: "la modelo es diminuta y entrenada en tiempo limitado — es una demostración de la viabilidad de la arquitectura, no de calidad al nivel de Qwen".

El modelo es relevante ahora por dos motivos: primero, porque explora una arquitectura alternativa (recurrent-depth con profundidad dinámica) sobre un backbone Qwen2, un área de investigación activa para reducir parámetros manteniendo capacidad de razonamiento; segundo, porque está especializado en tool use en ruso, un nicho poco cubierto por modelos pequeños open source. El entrenamiento reportado es de 8 horas sobre 65.490 muestras (40.030.505 tokens), con una pérdida de validación de 2,5465 y perplejidad de 12,76.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Compact Dual Dynamic LLM (recurrent-depth) sobre backbone Qwen2; d_model=896, 14 cabezas × 64, 1 capa base, profundidad 8 |
| Parámetros totales | 35.849.352 (35,85 M) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos publicados en fp16) |
| Idiomas soportados | ruso (ru) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch `.pt` (`checkpoints/final.pt`, `best.pt`, `last.pt`); tokenizador en carpeta `tokenizer/`; vocabulario compacto en `compact_vocab.pt` |

## Arquitectura y entrenamiento

La arquitectura descrita en la model card es una variante "Compact Dual Dynamic LLM" con profundidad recurrente: una única capa base (`base_layers=1`) que se aplica de forma iterativa hasta 8 veces (`depth=8`), con dimensión oculta de 896 y 14 cabezas de atención de 64 dimensiones cada una. El vocabulario se ha compactado a 11.264 tokens con una cobertura declarada del 99,84 % sobre el corpus de entrenamiento. Esta configuración reduce drásticamente el número de parámetros (35,85 M) frente a los 494 M del Qwen2.5-0.5B-Instruct original, a costa de una capacidad representacional mucho menor.

El entrenamiento se realizó con el script `build_neuroset.py` durante 8 horas sobre 65.490 muestras que suman 40.030.505 tokens. No se especifica la composición del dataset ni si hubo RLHF, DPO o supervisión adicional más allá del fine-tuning supervisado. Los resultados reportados son: pérdida de validación 2,5465, perplejidad 12,76 y mejor pérdida de validación 2,5078. No se documentan innovaciones como decodificación especulativa, atención lineal o modos de razonamiento explícitos; la innovación principal es la propia arquitectura de profundidad recurrente y el vocabulario compacto.

## Capacidades

- Generación de texto conversacional en ruso, con respuestas breves y directas.
- Tool calling y function calling mediante etiquetas `<tool_call>` y `<tool_response>`, con formato JSON para nombre de función y argumentos.
- Ejecución de operaciones aritméticas a través de la herramienta `calculate` (por ejemplo, `{"name":"calculate","arguments":{"expression":"50 - 18"}}`).
- Invocación de búsqueda web mediante la herramienta `web_search` con consulta en lenguaje natural.
- Encadenamiento básico de llamada a herramienta y síntesis de la respuesta en un turno.
- Soporte multilingüe limitado al ruso; no se declaran capacidades en otros idiomas.
- No se documentan capacidades de visión, audio, agentes multi-paso autónomos ni modo "thinking" explícito.

## Casos de uso

- Demostración de arquitecturas recurrent-depth: el modelo sirve como banco de pruebas reproducible para investigadores que quieran validar si una capa base aplicada 8 veces con 35,85 M de parámetros puede sostener tool calling básico, usando el script `build_neuroset.py` y los checkpoints publicados.
- Asistente conversacional en ruso de bajo coste: con 35,85 M de parámetros y pesos fp16 de unos 0,2 GB, puede desplegarse en CPU o en GPUs de gama muy baja para prototipos de chat en ruso donde el coste computacional sea crítico.
- Enrutamiento de herramientas en pipelines ligeros: el formato `<tool_call>` con JSON permite integrar el modelo como clasificador de intención que decide entre `calculate` y `web_search` antes de delegar en servicios externos, reduciendo el coste frente a modelos grandes.
- Calculadora conversacional: para aplicaciones educativas o de atención al cliente que necesiten resolver operaciones aritméticas simples expresadas en ruso, el modelo emite la llamada a `calculate` y sintetiza el resultado.
- Investigación sobre vocabularios compactos: el `compact_vocab.pt` con 11.264 tokens y cobertura del 99,84 % es un artefacto útil para estudiar el impacto de la reducción de vocabulario en modelos pequeños en ruso.
- Fine-tuning educativo: al ser Apache 2.0 y tener un script de entrenamiento público en GitHub, sirve como material didáctico para quienes quieran reproducir un pipeline completo de entrenamiento y evaluación de un LLM pequeño con tool use.
- Pruebas de robustez de function calling: útil para medir la tasa de llamadas correctas y de alucinaciones en herramientas con un modelo de capacidad muy limitada, estableciendo una línea base inferior.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo reporta métricas de entrenamiento y validación:

| Métrica | Valor |
|---|---|
| Pérdida de validación | 2,5465 |
| Perplejidad de validación | 12,76 |
| Mejor pérdida de validación | 2,5078 |
| Tokens de entrenamiento | 40.030.505 |
| Muestras de entrenamiento | 65.490 |
| Tiempo de entrenamiento | 8 horas |

No hay datos de MMLU, HumanEval, GSM8K ni de precisión en tool calling sobre conjuntos estándar.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp16 (35,85 M de parámetros ≈ 72 MB de pesos, más overhead de activaciones y tokenizador); el repositorio completo ocupa 0,2 GB.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM; cabe holgadamente en GTX 1650, RTX 3050, RTX 4060 y superiores. También funciona en CPU.
- Cabe en GPU consumer: sí, en prácticamente cualquier GPU consumer moderna e incluso en Raspberry Pi o dispositivos embebidos con suficiente RAM.
- Opciones de despliegue: los pesos se distribuyen en formato PyTorch `.pt` con un script propio (`build_neuroset.py --mode chat`), no en safetensors ni GGUF. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI; sería necesario exportar y adaptar los pesos a un formato estándar.
- Latencia y throughput estimados: no disponibles. Dado el tamaño, se espera latencia de milisegundos en GPU y throughput alto en CPU, pero no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Grimoire (embrelgrim) | 35,85 M | no disponible | ruso | Apache 2.0 | `.pt` |
| Qwen2.5-0.5B-Instruct | 494 M | 32.768 tokens (según ficha oficial de Qwen) | multilingüe | Apache 2.0 | safetensors, GGUF |
| SmolLM2-135M-Instruct | 135 M | 8.192 tokens (según ficha oficial) | inglés principalmente | Apache 2.0 | safetensors, GGUF |

Grimoire se diferencia de Qwen2.5-0.5B-Instruct, su modelo base, en que reduce parámetros en un orden de magnitud (35,85 M frente a 494 M) mediante profundidad recurrente y vocabulario compacto, pero pierde el soporte multilingüe y la integración con ecosistemas estándar de inferencia. Frente a SmolLM2-135M-Instruct, Grimoire es aún más pequeño y está especializado en ruso y tool calling, mientras que SmolLM2 prioriza inglés y formato estándar. No se dispone de datos de benchmarks comparativos para establecer diferencias de calidad.

## Limitaciones y advertencias

- El propio autor advierte que el modelo es una demostración de viabilidad arquitectónica, no un modelo de calidad comparable a Qwen; los ejemplos de la model card muestran respuestas incoherentes (por ejemplo, la respuesta sobre Moscú devuelve una definición de "gracias").
- Riesgo elevado de alucinación y de llamadas a herramientas incorrectas: en el ejemplo de demostración, la consulta "cuéntame brevemente sobre Moscú" genera una `web_search` con la consulta "Спасибо" (gracias), lo que indica fallos en la selección de argumentos.
- Capacidad multilingüe prácticamente inexistente fuera del ruso; no se declaran otros idiomas.
- Longitud de contexto no documentada; probablemente muy limitada, lo que restringe conversaciones multi-turno largas.
- Pesos en formato `.pt` propietario del script del autor, sin conversión a safetensors ni GGUF; la integración con vLLM, llama.cpp, Ollama o TGI requiere trabajo adicional de exportación.
- Licencia Apache 2.0 permite uso comercial, pero la calidad del modelo hace inviable su uso en producción real sin una evaluación exhaustiva previa.
- No se documentan sesgos específicos, pero al entrenarse sobre un corpus no descrito (probablemente ruso y de dominio limitado), es esperable un sesgo hacia ese dominio y una cobertura pobre de temas fuera de él.
- El vocabulario compacto de 11.264 tokens puede degradar la tokenización de texto con caracteres poco frecuentes o extranjeros.

## Enlaces

- Hugging Face: https://huggingface.co/embrelgrim/grimoire
- Repositorio GitHub del proyecto: https://github.com/RUD9/Grimoire
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
