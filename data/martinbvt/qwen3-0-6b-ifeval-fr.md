# Martinbvt/qwen3-0.6b-ifeval-fr

## Resumen

El modelo `Martinbvt/qwen3-0.6b-ifeval-fr` es un ajuste fino (fine-tuning) mediante LoRA del modelo base Qwen3-0.6B, cuantizado a 4-bit con MLX, desarrollado por Martinbvt. Su objetivo es mejorar el seguimiento de instrucciones verificables en francés: restricciones de longitud, palabras clave obligatorias, listas numeradas, generación de JSON y reglas de inicio o fin de respuesta. Está pensado para entornos con recursos limitados, ya que fue entrenado en un Apple M1 con 16 GB de RAM.

El modelo se distribuye bajo licencia Apache-2.0 y está disponible en Hugging Face en formato MLX (safetensors). Al estar basado en Qwen3, hereda su arquitectura transformer densa y su capacidad de generación de texto, aunque el ajuste se centra exclusivamente en el francés y en el cumplimiento de restricciones formales. Es relevante para aplicaciones que necesitan respuestas estructuradas y verificables sin depender de modelos grandes, como asistentes de escritura, generación de formularios o validación de contenido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3) |
| Parametros totales | 0.6B (modelo base) + adaptador LoRA de 93.188.096 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (el modelo base Qwen3-0.6B soporta 32k tokens, pero no se confirma en la informacion proporcionada) |
| Tipos de cuantizacion | 4-bit (MLX) para el modelo base; adaptador LoRA en precision original (probablemente fp16) |
| Idiomas soportados | Frances |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-0.6B, un transformer decoder-only con atencion por ventanas deslizantes y mecanismos de thinking mode opcional. El ajuste se realizo mediante LoRA con rango 8 aplicado a 16 capas, durante 800 iteraciones, con un batch de 1 y acumulacion de gradientes de 4 pasos, y una secuencia maxima de 512 tokens. Los datos de entrenamiento consistieron en consignas sinteticas en frances, disenadas para cubrir restricciones verificables (longitud, palabras clave, listas, JSON, inicio/fin impuestos), y son distintas del conjunto de evaluacion oficial IFEval-fr. El entrenamiento se ejecuto en un Apple M1 con 16 GB de RAM, alcanzando un pico de memoria de 1.3 GB.

No se menciona el uso de RLHF ni DPO; el ajuste es puramente supervisado sobre las consignas sinteticas. El modelo conserva la capacidad de emitir balizas `thinking` heredadas de Qwen3, aunque no se ha verificado si el ajuste las modifica.

## Capacidades

- Generacion de texto en frances con cumplimiento de restricciones formales: longitud exacta, palabras clave obligatorias, listas numeradas, formato JSON, reglas de inicio y fin.
- Seguimiento de instrucciones multi-paso cuando las consignas combinan varias restricciones (por ejemplo, "escribe exactamente 3 consejos numerados que empiecen por 'C' y terminen en punto").
- Generacion de respuestas estructuradas para aplicaciones de automatizacion (formularios, resumenes, respuestas a APIs).
- Capacidad de emitir balizas `thinking` (razonamiento interno) antes de la respuesta final, aunque no se ha evaluado su calidad tras el ajuste.
- No se ha documentado soporte para tool calling, vision, audio ni otras modalidades.

## Casos de uso

- Generacion de contenido estructurado para blogs o documentacion: el modelo puede producir listas numeradas o con viñetas siguiendo restricciones de formato, util para esbozos de articulos o guias.
- Creacion de respuestas JSON para integraciones con APIs: dado que soporta restricciones de formato JSON, puede generar objetos validos a partir de instrucciones en frances.
- Validacion de cumplimiento de reglas en textos generados: por ejemplo, comprobar que una respuesta cumple con una longitud maxima o incluye ciertas palabras clave, aunque el modelo no es un validador, puede generar candidatos que cumplan.
- Asistentes de escritura en frances: ayuda a redactar parrafos con restricciones de estilo (por ejemplo, "escribe 5 frases que empiecen por 'Il'") para ejercicios de linguistica o creatividad.
- Automatizacion de respuestas en sistemas de atencion al cliente: genera respuestas cortas y estructuradas que deben seguir plantillas predefinidas, aunque su vocabulario es limitado.
- Prototipado rapido en entornos con recursos reducidos: al ser un modelo de 0.6B cuantizado, puede ejecutarse en laptops con Apple Silicon o GPUs modestas, ideal para pruebas de concepto.

## Benchmarks y rendimiento

El autor proporciona resultados internos (no oficiales) sobre 40 prompts hold-out con la misma familia de consignas que el entrenamiento, usando decodificacion greedy:

| Modelo | Accuracy estricta | Accuracy parcial |
|---|---:|---:|
| Qwen3-0.6B-4bit (base) | 47.5 % | 56.2 % |
| qwen3-0.6b-ifeval-fr | 82.5 % | 88.7 % |

Estos datos no corresponden al benchmark oficial IFEval-fr y no deben citarse como resultado de leaderboard. No se han publicado resultados en otros benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) para este modelo.

## Requisitos de hardware

- Inferencia en CPU/GPU Apple: al estar en formato MLX, se ejecuta eficientemente en Macs con Apple Silicon (M1 o superior). El entrenamiento ocupo 1.3 GB de RAM, por lo que la inferencia es viable con 4-8 GB de RAM.
- VRAM estimada para GPU NVIDIA: no se han proporcionado datos, pero un modelo de 0.6B en 4-bit ocupa aproximadamente 0.4 GB, mas el adaptador LoRA (93M parametros en fp16 ~0.2 GB). Cabe en cualquier GPU con al menos 2 GB de VRAM, como una GTX 1650 o superior.
- Opciones de despliegue: MLX (via `mlx-lm`), tambien se puede convertir a GGUF para usar con llama.cpp u Ollama, aunque no se ha verificado su compatibilidad.
- Latencia y throughput: no se han publicado mediciones. En un Mac M1, se espera una generacion de decenas de tokens por segundo para un modelo de este tamano.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Especialidad |
|---|---|---|---|---|
| Qwen3-0.6B (base) | 0.6B | 32k (no confirmado) | Apache-2.0 | Generacion general multilingue |
| qwen3-0.6b-ifeval-fr | 0.6B + LoRA | no disponible | Apache-2.0 | Instrucciones verificables en frances |
| CroissantLLM (base) | 1.3B | 2k | CC-BY-SA-4.0 | Frances-ingles general |

No se dispone de datos de rendimiento comparativo con otros modelos ajustados para IFEval-fr. La comparacion con Qwen3-0.6B base es la unica disponible, y muestra una mejora significativa en el seguimiento de restricciones formales.

## Limitaciones y advertencias

- El modelo prioriza el formato sobre el contenido natural: las respuestas pueden sonar estereotipadas o poco fluidas, ya que el entrenamiento se centra en cumplir restricciones estructurales.
- Puede emitir balizas `thinking` no deseadas, heredadas de Qwen3, lo que puede interferir con la salida final si no se gestiona.
- Solo soporta frances; no se ha evaluado su comportamiento en otros idiomas.
- Los resultados de benchmark son internos y no comparables con IFEval-fr oficial; no deben usarse para decisiones de produccion sin una evaluacion propia.
- No se ha documentado la robustez frente a consignas fuera de la distribucion de entrenamiento; puede fallar ante instrucciones complejas o ambiguas.
- La licencia Apache-2.0 permite uso comercial, pero el modelo base Qwen3-0.6B tambien es Apache-2.0, por lo que no hay restricciones adicionales conocidas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Martinbvt/qwen3-0.6b-ifeval-fr
- Modelo base MLX 4-bit: https://huggingface.co/mlx-community/Qwen3-0.6B-4bit
- Modelo original Qwen3-0.6B: https://huggingface.co/Qwen/Qwen3-0.6B
- Libreria MLX: https://github.com/ml-explore/mlx
