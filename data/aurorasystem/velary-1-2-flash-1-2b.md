# AuroraSystem/Velary-1.2-Flash-1.2B

## Resumen

Velary 1.2 Flash es un modelo de lenguaje de 1.170.340.608 parámetros (1,17B) desarrollado por AuroraSystem, un ajuste fino del modelo LiquidAI/LFM2.5-1.2B-Thinking. Está diseñado como un modelo instructivo bilingüe ruso/inglés con profundidad de razonamiento conmutable mediante una etiqueta de control (`<|effort=none|>`, `<|effort=medium|>`, `<|effort=high|>`) que se añade al mensaje del usuario. Se distribuye bajo licencia LFM Open License y está pensado para despliegues ligeros donde el coste computacional y la huella de memoria son críticos.

El modelo hereda la arquitectura LFM2 de LiquidAI, con una ventana de contexto de 128K tokens y un vocabulario de 65536 entradas, e incorpora capacidades nativas de "thinking" procedentes de su modelo base. El ajuste se realizó mediante LoRA (r=32, alpha=32, all-linear, dropout 0.05) fusionado en los pesos base, sobre un conjunto de aproximadamente 8.700 ejemplos generados en dominios de ciberseguridad, código, matemáticas, lógica, reglas del idioma ruso, identidad y conocimiento general, más datos de nivel de razonamiento y un conjunto de replay para retención.

Su relevancia actual reside en la combinación de tamaño reducido (apto para GPU de consumo), contexto largo (128K), bilingüismo ruso/inglés y control explícito del coste de razonamiento, lo que permite ajustar la latencia y el consumo de tokens según la tarea. No obstante, el propio autor reconoce debilidades notables en lógica y conversación abierta, y el modelo no está alineado en seguridad más allá de los datos de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LFM2 (Lfm2ForCausalLM), transformer con capacidades nativas de thinking |
| Parametros totales | 1.170.340.608 (1,17B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 128K tokens (heredada del modelo base) |
| Tipos de cuantizacion | no disponible (el repo distribuye safetensors; el autor usa bfloat16/fp16 en inferencia) |
| Idiomas soportados | ruso (ru), inglés (en) |
| Licencia | LFM Open License (license: other) |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo se basa en `LiquidAI/LFM2.5-1.2B-Thinking`, una arquitectura LFM2 de tipo transformer con vocabulario de 65536 tokens y modo de razonamiento nativo. El ajuste fino se realizó con LoRA de rango 32 y alpha 32 aplicado a todas las capas lineales, con dropout 0.05, y los adaptadores se fusionaron en los pesos base. El entrenamiento se estructuró en tres fases: un SFT sobre el paquete de dominios (2 épocas), seguido de dos etapas de balanceo con learning rate bajo (3e-5) que mezclan datos de nivel (none/medium/high), el conjunto de replay y una porción sin razonamiento; los adaptadores se fusionaron entre etapas.

Los datos de entrenamiento consisten en aproximadamente 8.700 ejemplos generados en dominios de ciberseguridad, código, matemáticas, lógica, reglas del idioma ruso, identidad y conocimiento general, más datos específicos de nivel de razonamiento. Se usó precisión fp16, batch size de 1 a 2, acumulación de gradiente de 8 a 32, longitud máxima de secuencia de 1024 a 2048 y gradient checkpointing. No se especifica el número total de tokens de entrenamiento ni la composición exacta del dataset más allá de las categorías mencionadas.

La innovación principal es el control de profundidad de razonamiento mediante etiquetas en el mensaje del usuario, que permite al modelo alternar entre respuestas directas (none), razonamiento moderado (medium) y razonamiento extenso (high) sin cambiar de modelo.

## Capacidades

- Generación de texto instructivo bilingüe ruso/inglés.
- Razonamiento con profundidad conmutable mediante `<|effort=none|>`, `<|effort=medium|>` y `<|effort=high|>`.
- Matemáticas: rendimiento destacado en la categoría de matemáticas de ABench75 (91-97% según nivel).
- Código: generación y resolución de tareas de programación (71-85% en ABench75).
- Ciberseguridad: dominio específico entrenado (88-96% en ABench75).
- Conocimiento general y reglas del idioma ruso.
- Conversación multi-turno mediante plantilla de chat (`apply_chat_template`).
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión, audio ni otras modalidades.
- No se documenta modo de pensamiento explícito separado del control de esfuerzo, aunque el modelo base tiene "thinking" nativo.

## Casos de uso

- Asistencia técnica en ciberseguridad: el modelo ha sido entrenado específicamente en este dominio y obtiene entre el 88% y el 96% en ABench75, por lo que puede emplearse para triaje de alertas, explicación de vulnerabilidades y generación de recomendaciones de mitigación en ruso o inglés.
- Generación de código en entornos con recursos limitados: con 1,17B parámetros y cuantización adecuada cabe en GPU de consumo, lo que permite integrarlo en editores o pipelines locales para autocompletado y generación de fragmentos (71-85% en la categoría de código).
- Resolución de problemas matemáticos: el 91-97% en matemáticas de ABench75 lo hace adecuado para tutores automáticos o verificación de cálculos en aplicaciones educativas, especialmente en ruso.
- Procesamiento de documentos largos en ruso: la ventana de 128K tokens permite resumir o extraer información de contratos, informes o expedientes extensos sin truncamiento.
- Chat de atención al cliente bilingüe ruso/inglés: puede gestionar conversaciones multi-turno con contexto largo, aunque el autor advierte que la conversación casual y la escritura creativa abierta son limitadas, por lo que conviene restringir su uso a dominios acotados.
- Clasificación y extracción de información con coste controlado: usando `<|effort=none|>` se reducen los tokens generados, lo que abarata tareas de etiquetado, extracción de entidades o respuesta a preguntas simples en producción.
- Despliegue en el borde o en dispositivos con poca VRAM: al ser un modelo de 1,17B, puede ejecutarse en GPUs de consumo y en entornos con presupuesto de memoria ajustado, sirviendo como alternativa local a APIs en la nube para datos sensibles.

## Benchmarks y rendimiento

Resultados en ABench75 (375 tareas, puntuación automática por regex), según la model card:

| Categoria | none | medium | high |
|---|---:|---:|---:|
| Overall | 76,8% | 82,7% | 81,6% |
| Math | 91% | 97% | 96% |
| Logic | 69% | 49% | 43% |
| Code | 71% | 85% | 85% |
| Cybersecurity | 88% | 96% | 96% |
| General | 65% | 85% | 88% |
| English | 85% | 84% | 81% |
| Russian | 65% | 81% | 83% |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. El autor no proporciona comparación con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Para un modelo de 1,17B parámetros, en bfloat16/fp16 se requieren aproximadamente 2,3-2,5 GB solo para pesos, más memoria para KV cache y activaciones; en cuantizaciones de 8 bits o 4 bits el requisito sería menor, aunque el autor no documenta versiones cuantizadas.
- GPU recomendadas: no especificadas por el autor. Por tamaño, cabe en GPUs de consumo como RTX 3060, RTX 4060, RTX 4070 o superiores; también en A100/H100 para despliegues de mayor throughput.
- Cabe en GPU de consumo: sí, previsiblemente en la mayoría de GPUs con 8 GB o más de VRAM, aunque no hay confirmación oficial.
- Opciones de despliegue: transformers (documentado en la model card con `AutoModelForCausalLM` y `device_map="auto"`). No se documentan vLLM, llama.cpp, Ollama ni TGI; la disponibilidad de GGUF no está confirmada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| Velary 1.2 Flash | 1,17B | 128K | ru, en | LFM Open License | Ajuste LoRA de LFM2.5-1.2B-Thinking con niveles de razonamiento |
| LiquidAI/LFM2.5-1.2B-Thinking | 1,17B | 128K | no disponible | LFM Open License | Modelo base; sin ajuste bilingüe ni etiquetas de esfuerzo |
| Alternativas de ~1B (p. ej. Qwen, Llama) | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la información proporcionada |

No se han proporcionado comparaciones directas con otros modelos en la información disponible.

## Limitaciones y advertencias

- La lógica es la categoría más débil en todos los niveles: 69% en none, 49% en medium y 43% en high, con un deterioro notable al aumentar el esfuerzo de razonamiento.
- La conversación casual y la escritura creativa abierta están limitadas según el propio autor.
- El razonamiento prolongado incrementa el consumo de tokens; para medium y high se recomienda `max_new_tokens` de al menos 512.
- El modelo no está alineado en seguridad más allá de los datos de entrenamiento, por lo que puede generar contenido inapropiado o inseguro.
- Riesgo de alucinación: no se documenta mitigación específica; al ser un ajuste sobre un modelo pequeño, la fiabilidad factual puede ser limitada.
- Idiomas: solo ruso e inglés; no se garantiza un rendimiento aceptable en castellano u otros idiomas.
- Licencia LFM Open License: es una licencia "other" que puede imponer restricciones al uso comercial; debe revisarse antes de desplegar en producción.
- El modelo es un ajuste fino con LoRA sobre un modelo base de 1,17B, por lo que su conocimiento general está acotado y puede reflejar sesgos de los datos generados sintéticamente.
- No se documentan versiones cuantizadas oficiales ni soporte para tool calling, lo que limita su integración en pipelines de agentes.

## Enlaces

- Hugging Face: https://huggingface.co/AuroraSystem/Velary-1.2-Flash-1.2B
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-1.2B-Thinking
- Dataset de evaluación: https://huggingface.co/datasets/AuroraSystem/ABench75
- Resultado de búsqueda web no relacionado (Gemini 3.8 Flash): https://www.zhihu.com/question/2078625121644845032
