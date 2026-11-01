# iromu/LFM2.5-230M-openjev-FP8

## Resumen

LFM2.5-230M-openjev-FP8 es la versión cuantizada a FP8 del ajuste fino de decisión `iromu/LFM2.5-230M-openjev`, un modelo de 230 millones de parámetros derivado de `LiquidAI/LFM2.5-230M-Base` mediante LoRA supervisado. Lo publica el usuario iromu y su propósito no es la generación de texto abierta, sino responder a prompts de decisión tipada devolviendo una única letra de etiqueta. El modelo base pertenece a la familia LFM2 de Liquid AI, una arquitectura híbrida orientada a eficiencia en dispositivos y servidores de baja capacidad.

La relevancia de esta ficha está en su formato de despliegue: el checkpoint se ha cuantizado con NVIDIA ModelOpt en FP8 W8A8 (pesos y activaciones en E4M3), con escalas de peso por canal y escalado dinámico de activaciones por token, un esquema que la ruta `modelopt` de vLLM carga correctamente. El autor documenta explícitamente que la configuración estática `FP8_DEFAULT_CFG` produce salidas degeneradas en vLLM, por lo que la elección del esquema de cuantización es una decisión técnica deliberada y no un detalle menor.

Se trata de un artefacto muy especializado: clasificación y selección de etiqueta única en un espacio de 230M parámetros, pensado para servir con vLLM en hardware tipo GB10. No sustituye a modelos generales y su valor está en el coste de inferencia y en la coherencia probabilística medida con JevBench, donde el FP8 obtiene 33,6 frente a 38,5 del BF16.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LFM2 (familia Liquid AI, transformer híbrido según la familia base; detalles no disponibles en la información proporcionada) |
| Parametros totales | 229.693.184 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible en la información proporcionada; el entrenamiento usó longitud máxima de secuencia de 4096 |
| Tipos de cuantizacion | FP8 W8A8 (E4M3), pesos FP8 con escalas por canal, activaciones FP8 con escalado dinámico por token; `lm_head` y `model.embed_tokens` en bf16; existen también BF16, GGUF y NVFP4 en artefactos hermanos |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (con `hf_quant_config.json` para la ruta ModelOpt de vLLM) |

## Arquitectura y entrenamiento

El checkpoint es una cuantización FP8 del ajuste fino `iromu/LFM2.5-230M-openjev`, que a su vez es un LoRA sobre `LiquidAI/LFM2.5-230M-Base`. El entrenamiento se hizo con NeMo-RL mediante entropía cruzada enmascarada a los turnos del asistente sobre las filas de decisión tipada. Los hiperparámetros documentados son: LoRA de rango 32, alpha 32, dropout 0,05, módulos objetivo `*.proj`, `*.w1`, `*.w2` y `*.w3`; longitud máxima de secuencia 4096; precisión bfloat16; optimizador AdamW con lr 5e-5 y weight decay 0,01; calentamiento lineal de 100 pasos seguido de decaimiento coseno hasta 1e-6; batch global 64 con micro batch 2; 1250 pasos de entrenamiento con validación cada 125.

La innovación técnica relevante no está en la arquitectura sino en el pipeline de cuantización. Se usó NVIDIA ModelOpt con la configuración `FP8_PER_CHANNEL_PER_TOKEN_CFG` y exportación mediante `export_hf_checkpoint`, que escribe los pesos FP8, las escalas por canal y el `hf_quant_config.json` que lee el servidor. Al usar escalas por canal y escalado dinámico por token, no se escribe `input_scale` estática, que es exactamente lo que espera la ruta `modelopt` de vLLM. El autor advierte que la configuración estática `FP8_DEFAULT_CFG` tampoco escribe `input_scale`, pero en ese caso vLLM lee una escala de un centinela no inicializado y emite salida degenerada en todas las filas.

El dataset de entrenamiento es el split `train` del corpus de decisión tipada `ZefanCai/Open-Jev`. Cada fila contiene un estado, una pregunta, un conjunto de opciones y una distribución de probabilidad sobre las opciones; el objetivo es la opción argmax, escrita como una única letra de etiqueta.

## Capacidades

- Selección de etiqueta única: responde a un prompt de decisión tipada con una sola letra de opción.
- Clasificación y decisión tipada sobre estados, preguntas y conjuntos de opciones con distribución de probabilidad asociada.
- Formato conversacional con plantilla de chat específica para decisión, con enmascaramiento del turno del asistente.
- Lectura de logprobs por letra de opción en la posición de respuesta, útil para análisis de coherencia probabilística.
- Capacidad multilingüe: limitada al inglés según la model card.
- No se documentan tool calling, function calling, razonamiento multi-paso, visión, audio ni modo de pensamiento.

## Casos de uso

- Enrutamiento de decisiones en pipelines: dado un estado y un conjunto cerrado de opciones, el modelo devuelve la letra de la opción argmax, lo que permite integrarlo como clasificador de bajo coste en un paso de enrutamiento previo a un modelo mayor.
- Servicio de clasificación de baja memoria con vLLM: con 230M parámetros en FP8 y `--quantization modelopt`, cabe en aceleradores modestos y permite mantener muchas instancias concurrentes para tareas de etiquetado.
- Evaluación de coherencia probabilística: el checkpoint está pensado para leerse mediante logprobs de las letras de opción, lo que sirve para tests metamórficos tipo JevBench sobre las leyes de probabilidad y elección.
- Anotación asistida de corpus de decisión: alineado con el formato de Open-Jev (estado, pregunta, opciones, distribución), puede preetiquetar filas nuevas antes de revisión humana.
- Filtrado y triaje en ingesta de datos: clasificar registros en categorías mutuamente excluyentes expresadas como opciones, con una sola letra de salida fácil de parsear.
- Despliegue en el borde o en hardware tipo GB10: el formato FP8 W8A8 y el tamaño reducido permiten servir el modelo en entornos con presupuesto de memoria y cómputo ajustado.
- Comparación de artefactos de cuantización: al existir BF16, FP8, GGUF y NVFP4 del mismo ajuste, sirve para medir la degradación de cada formato en una tarea concreta y con una tabla de validación publicada.

## Benchmarks y rendimiento

Coherencia medida con JevBench (`jevbench-mini`, tolerancia 0,05, temperatura 1,0), media de las cinco familias de relaciones:

| Modelo | Overall | Δ vs BF16 | REP | BAT | MEA | LOG | CHO |
|---|---|---|---|---|---|---|---|
| BF16 | 38,5 | — | 60,6 | 25,8 | 15,4 | 68,3 | 22,2 |
| FP8 | 33,6 | −4,9 | 47,8 | 25,8 | 11,5 | 68,8 | 13,9 |

Validación sobre el split `validation` de Open-Jev (3.495 filas), decodificación greedy, límite de 384 tokens:

| Modelo | Quant | Cap | n | Letra emitida | Letra correcta | Δ correcto vs BASE |
|---|---|---|---|---|---|---|
| LFM2.5-230M-openjev | BF16 | 384 tok | 3495 | 3495/3495 (100,0%) | 2700/3495 (77,3%) | (predecesor) |
| LFM2.5-230M-openjev | FP8 | 384 tok | 3495 | 3495/3495 (100,0%) | 2675/3495 (76,5%) | −0,7 pp |

La fila FP8 se sirvió con vLLM (`--quantization modelopt`) y la BF16 con el baseline de HF/transformers. El throughput indicado es decodificación greedy de un solo flujo, no throughput de servicio. No se han publicado resultados de MMLU, HumanEval, GSM8K ni benchmarks generalistas en la información disponible.

## Requisitos de hardware

- VRAM estimada: el repo ocupa 0,3 GB, por lo que el checkpoint FP8 cabe holgadamente en cualquier GPU con 2 GB o más de memoria libre, incluyendo el espacio de trabajo de inferencia.
- GPU recomendadas: el autor orienta el artefacto a serving en hardware tipo GB10; cualquier GPU con soporte de FP8 (Ada Lovelace o posterior, así como aceleradores Hopper y Blackwell) es adecuada para la ruta ModelOpt de vLLM.
- GPU de consumo: sí cabe en tarjetas de consumo modernas; en GPUs sin soporte nativo de FP8 la ruta de vLLM puede requerir conversión o degradar el rendimiento.
- Opciones de despliegue: vLLM con `--quantization modelopt` (ruta documentada y validada); existen artefactos GGUF para llama.cpp/Ollama y un checkpoint NVFP4 para stacks compatibles con esa cuantización.
- Latencia y throughput: no se publican cifras de serving; la validación se hizo con decodificación greedy de un solo flujo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LFM2.5-230M-openjev-FP8 | 229,7M | no disponible | Decisión tipada, etiqueta única | apache-2.0 | HuggingFace, FP8/BF16/GGUF/NVFP4 |
| LFM2.5-230M-openjev (BF16) | 229,7M | no disponible | Decisión tipada, etiqueta única | apache-2.0 | HuggingFace |
| LiquidAI/LFM2.5-230M-Base | 230M (clase) | no disponible | Modelo base generalista | no disponible en la información proporcionada | HuggingFace |

La comparación con modelos de otras familias y mismo tamaño no está disponible en la información proporcionada. Frente a su hermano BF16, el FP8 pierde 0,7 puntos porcentuales de acierto de letra (76,5% frente a 77,3%) y 4,9 puntos de coherencia global en JevBench.

## Limitaciones y advertencias

- No es un reemplazo general de modelos mayores; el propio autor lo restringe a decisión tipada, clasificación y selección de etiqueta única.
- Solo soporta inglés según la model card.
- Riesgo de degradación por cuantización: la caída en MEA (15,4 a 11,5) y CHO (22,2 a 13,9) indica que el emisor de letras no preserva la media bajo transformación, lo que afecta a usos que dependan de coherencia probabilística y no solo del argmax.
- La ruta de serving es frágil si se elige mal la configuración de cuantización: con `FP8_DEFAULT_CFG` en vLLM la salida es degenerada en todas las filas; hay que usar la configuración por canal y por token y `--quantization modelopt`.
- El modelo emite siempre una letra (100% en validación), lo que significa que no tiene mecanismo de abstención ante entradas fuera de distribución.
- El checkpoint se publica con 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en producción ni de validación externa independiente.
- Licencia apache-2.0, que permite uso comercial, pero conviene verificar las condiciones del modelo base `LiquidAI/LFM2.5-230M-Base` y del dataset `ZefanCai/Open-Jev` antes de desplegar.
- No hay datos publicados de sesgos, robustez adversarial ni comportamiento fuera del dominio de decisión.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/iromu/LFM2.5-230M-openjev-FP8
- Modelo base del ajuste (BF16 y tabla de validación): https://huggingface.co/iromu/LFM2.5-230M-openjev
- Cuantizaciones GGUF: https://huggingface.co/iromu/LFM2.5-230M-openjev-GGUF
- Checkpoint NVFP4: https://huggingface.co/iromu/LFM2.5-230M-openjev-NVFP4
- Modelo base de Liquid AI: https://huggingface.co/LiquidAI/LFM2.5-230M-Base
- Dataset Open-Jev: https://huggingface.co/datasets/ZefanCai/Open-Jev
- JevBench: https://github.com/JevBench/jevbench
