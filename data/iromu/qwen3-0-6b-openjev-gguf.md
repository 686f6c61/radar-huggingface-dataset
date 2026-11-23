# iromu/Qwen3-0.6B-openjev-GGUF

## Resumen

Qwen3-0.6B-openjev-GGUF es la conversión a formato GGUF del ajuste fino Qwen3-0.6B-openjev, un modelo derivado de Qwen/Qwen3-0.6B-Base mediante supervisión fina (SFT) con LoRA. Lo desarrolla el usuario iromu y está diseñado para una tarea muy concreta: responder a prompts de decisión tipada con una única letra de etiqueta. No es un modelo de propósito general, sino un clasificador de opciones de baja huella pensado para ejecutarse en entornos llama.cpp.

El modelo resuelve el problema de selección de una opción entre un conjunto dado, devolviendo siempre una letra válida. Según la model card, el ajuste fino eleva la tasa de respuesta con letra del 0 % (modelo base) al 100 %, y la precisión de letra correcta del 0 % al 85,0 % en BF16, con variaciones mínimas entre cuantizaciones (83,9 % en Q4_K_M, 84,6 % en Q5_K_M y 84,9 % en Q8_0) sobre las 3.495 filas del split de validación de Open-Jev.

Su relevancia radica en el tamaño reducido (596.049.920 parámetros, 2,7 GB de repositorio) y en la disponibilidad de cuatro cuantizaciones GGUF, lo que permite despliegues en dispositivo o en el borde con requisitos de VRAM muy bajos. Está publicado bajo licencia Apache 2.0 y solo declara soporte para inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Qwen3-0.6B-Base), ajuste fino con LoRA |
| Parametros totales | 596.049.920 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4096 tokens (longitud máxima de secuencia usada en entrenamiento; contexto nativo del base no disponible en la información proporcionada) |
| Tipos de cuantizacion | BF16, Q4_K_M, Q5_K_M, Q8_0 (GGUF) |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base iromu/Qwen3-0.6B-openjev) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3-0.6B-Base, un transformer decoder-only de 596 millones de parámetros, y se ajusta con LoRA de rango 32 y alpha 32, dropout 0,05, sobre los módulos `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj` y `down_proj`. El entrenamiento se ejecutó con NeMo-RL, en bfloat16, con AdamW (lr 5e-5, weight decay 0,01), calentamiento lineal de 100 pasos y decaimiento coseno hasta 1e-6, batch global de 64 (micro batch 2) y 1.250 pasos con validación cada 125. La longitud máxima de secuencia fue de 4.096 tokens y la pérdida se enmascaró a la turno del asistente mediante la plantilla de chat de decisión.

Los datos de entrenamiento provienen del split `train` del corpus ZefanCai/Open-Jev, un conjunto de decisión tipada en el que cada fila contiene un estado, una pregunta, un conjunto de opciones y una distribución de probabilidad sobre ellas; el objetivo es el argmax de esa distribución, escrito como una única letra de etiqueta. La innovación técnica destacable no está en la arquitectura, sino en el formato de salida restringido a una letra y en la evaluación de coherencia probabilística mediante JevBench (suite jevbench-mini: 240 casos, 50 relaciones puntuadas, tolerancia 0,05, temperatura 1,0), que mide consistencia de representación, independencia de lote, coherencia de medida de probabilidad, coherencia lógica y coherencia de conjunto de elección.

## Capacidades

- Selección de una única etiqueta de decisión entre un conjunto de opciones, con salida restringida a una letra.
- Clasificación tipada sobre pares estado-pregunta-opciones.
- Respuesta consistente con el formato de decisión en todas las cuantizaciones (100 % de emisión de letra en las 3.495 filas de validación).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible; el modelo está especializado en una respuesta de un solo turno.
- Capacidades multilingües: solo inglés declarado.
- Capacidades especiales: evaluación de coherencia probabilística mediante JevBench (REP, BAT, MEA, LOG, CHO); no se declaran modos de pensamiento, visión ni audio.

## Casos de uso

- Selección de opciones en pipelines de decisión automatizada: el modelo recibe un estado, una pregunta y un conjunto de opciones, y devuelve la letra de la opción más probable; es adecuado porque su entrenamiento está enmascarado exactamente a ese formato y emite siempre una letra válida.
- Clasificación de baja latencia en el borde: con cuantización Q4_K_M (la más compacta del conjunto) puede ejecutarse en dispositivos con VRAM muy limitada mediante llama.cpp, manteniendo un 83,9 % de precisión de letra.
- Enrutamiento de consultas en sistemas de atención al cliente: dado un estado de conversación y un conjunto de intenciones, el modelo selecciona la etiqueta de intención; su tamaño de 0,6 B permite desplegarlo junto a otros componentes sin competir por recursos.
- Filtrado y triaje de datos: selección de una categoría entre opciones predefinidas para grandes volúmenes de registros, aprovechando el throughput de decodificación greedy de un solo flujo y el bajo coste por inferencia.
- Validación de coherencia en sistemas de decisión: usar la puntuación JevBench (REP, BAT, MEA, LOG, CHO) para auditar la consistencia probabilística de un pipeline de selección antes de producción.
- Prototipado rápido de clasificadores: servir como línea base ajustada en formato GGUF para comparar con modelos mayores antes de escalar, ya que su precisión de letra (85,0 % en BF16) está documentada sobre 3.495 filas.
- Evaluación de cuantizaciones en producción: comparar Q4_K_M, Q5_K_M y Q8_0 con las métricas de fidelidad y coherencia publicadas para elegir el equilibrio entre VRAM y exactitud de letra.

## Benchmarks y rendimiento

Resultados de validación sobre el split `validation` de Open-Jev (3.495 filas, decodificación greedy, límite de 384 tokens):

| Modelo | Cuantización | Letra emitida | Letra correcta | Δ vs base |
|---|---|---|---|---|
| Qwen/Qwen3-0.6B-Base | BF16 | 0/3495 (0,0 %) | 0/3495 (0,0 %) | (sin predecesor) |
| Qwen3-0.6B-openjev | GGUF-BF16 | 3495/3495 (100,0 %) | 2972/3495 (85,0 %) | +85,0 pp |
| Qwen3-0.6B-openjev | GGUF-Q4_K_M | 3495/3495 (100,0 %) | 2932/3495 (83,9 %) | +83,9 pp |
| Qwen3-0.6B-openjev | GGUF-Q5_K_M | 3495/3495 (100,0 %) | 2957/3495 (84,6 %) | +84,6 pp |
| Qwen3-0.6B-openjev | GGUF-Q8_0 | 3495/3495 (100,0 %) | 2966/3495 (84,9 %) | +84,9 pp |

Puntuación de coherencia probabilística JevBench (jevbench-mini, 240 casos, 50 relaciones, tolerancia 0,05, temperatura 1,0):

| Cuantización | Overall | Δ vs BF16 | REP | BAT | MEA | LOG | CHO |
|---|---|---|---|---|---|---|---|
| BF16 | 44,3 | — | 60,0 | 34,2 | 22,3 | 68,8 | 36,1 |
| Q4_K_M | 40,6 | −3,7 | 53,1 | 32,5 | 18,9 | 66,7 | 31,9 |
| Q5_K_M | 41,4 | −2,9 | 56,1 | 33,3 | 20,8 | 67,5 | 29,2 |
| Q8_0 | 44,9 | +0,6 | 58,1 | 33,3 | 22,8 | 70,0 | 40,3 |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks generales en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio completo ocupa 2,7 GB; Q4_K_M es la cuantización más compacta y la de menor VRAM, Q5_K_M es intermedia y Q8_0 y BF16 son las de mayor huella. No se publican cifras exactas de VRAM por cuantización.
- GPU recomendadas: no disponible en la información proporcionada; por el tamaño del modelo (0,6 B) es apto para GPU de consumo, pero no se especifican modelos concretos.
- Cabe en GPU de consumo: sí, por el tamaño de 596 millones de parámetros y las cuantizaciones disponibles; no se detallan modelos concretos.
- Opciones de despliegue: llama.cpp (CLI y bindings de Python), con carga vía `llama-cli -hf iromu/Qwen3-0.6B-openjev-GGUF:Q4_K_M` o `Llama.from_pretrained`. No se mencionan vLLM, TGI, Ollama ni otros runtimes.
- Latencia y throughput: no disponible; la model card solo indica que las mediciones son de decodificación greedy de un solo flujo, no throughput de servicio.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| iromu/Qwen3-0.6B-openjev-GGUF | 596.049.920 | 4096 (entrenamiento) | 85,0 % letra correcta (BF16, Open-Jev); JevBench 44,3 | apache-2.0 | GGUF en Hugging Face |
| Qwen/Qwen3-0.6B-Base | no disponible en la información | no disponible | 0,0 % letra correcta en Open-Jev | no disponible | Hugging Face |
| iromu/Qwen3-0.6B-openjev | no disponible (BF16 del mismo ajuste) | 4096 (entrenamiento) | misma validación que la versión GGUF-BF16 | apache-2.0 | Hugging Face |
| iromu/Qwen3-0.6B-openjev-NVFP4 | no disponible | no disponible | no disponible | apache-2.0 | Hugging Face |

No se dispone de datos de otros modelos comparables de la misma categoría (clasificadores de decisión tipada de 0,6 B) en la información proporcionada.

## Limitaciones y advertencias

- El modelo solo declara soporte para inglés; no se garantiza un comportamiento correcto en castellano ni en otros idiomas.
- Está especializado en decisión tipada de un solo turno; no es un sustituto general de modelos Qwen mayores, según advierte el propio autor.
- Riesgo de alucinación: no se documenta explícitamente, pero al forzar una letra de respuesta el modelo puede seleccionar una opción incorrecta con total confianza (14,9 % de letras incorrectas en BF16 sobre la validación).
- La coherencia probabilística es limitada: la puntuación global JevBench es de 44,3 en BF16, con subpuntuaciones especialmente bajas en MEA (22,3) y BAT (34,2).
- La cuantización Q4_K_M reduce la fidelidad de letra en 1,1 pp y la coherencia en 3,7 puntos frente a BF16; Q8_0 es la opción recomendada cuando la letra exacta es crítica.
- Licencia Apache 2.0: permite uso comercial, pero se debe conservar el aviso de licencia y no se ofrece garantía.
- No se publican datos de sesgos, robustez ante entradas fuera de distribución ni comportamiento con prompts mal formados.
- La longitud de contexto de 4096 tokens corresponde a la secuencia máxima de entrenamiento; no se confirma el contexto nativo del modelo base.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/iromu/Qwen3-0.6B-openjev-GGUF
- Modelo base del ajuste (BF16 y tabla de validación): https://huggingface.co/iromu/Qwen3-0.6B-openjev
- Checkpoint NVFP4: https://huggingface.co/iromu/Qwen3-0.6B-openjev-NVFP4
- Dataset Open-Jev: https://huggingface.co/datasets/ZefanCai/Open-Jev
- Modelo base original: https://huggingface.co/Qwen/Qwen3-0.6B-Base
- Repositorio JevBench: https://github.com/JevBench/jevbench
