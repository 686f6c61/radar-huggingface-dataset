# pwrmind/user2-nli-pro-onnx

## Resumen

`pwrmind/user2-nli-pro-onnx` es un modelo compacto de inferencia de lenguaje natural (NLI) para ruso, publicado por el usuario pwrmind. Se trata de un ajuste fino del modelo base `deepvk/USER2-small`, un transformer de arquitectura ModernBERT de aproximadamente 34 millones de parámetros, exportado a formato ONNX en dos variantes: FP32 (132 MB) e INT8 cuantizada dinámicamente (33,4 MB). El modelo resuelve la clasificación de la relación lógica entre dos frases (premisa e hipótesis) en tres clases: implicación, neutralidad y contradicción.

El interés práctico del modelo reside en su relación calidad/tamaño: con solo 34 millones de parámetros alcanza un 81,48 % de accuracy en el test de `deepvk/ru-WANLI`, superando al modelo de referencia `MoritzLaurer/mDeBERTa-v3-base` (278 millones de parámetros), que obtiene un 77,20 % en el mismo conjunto. Además, su formato ONNX permite ejecución sin PyTorch ni Transformers, únicamente con `onnxruntime` y `tokenizers`, lo que facilita el despliegue en entornos con recursos limitados, CPU y navegador.

El modelo está pensado para tareas de verificación factual, detección de contradicciones y filtrado semántico en pipelines en ruso, donde la latencia y el consumo de memoria son críticos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ModernBERT (transformer encoder) |
| Parámetros totales | ~34 millones (modelo base `deepvk/USER2-small`) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | 256 tokens (longitud máxima de secuencia usada en evaluación; contexto nativo del modelo base no disponible) |
| Tipos de cuantización | FP32 (ONNX) e INT8 dinámica (ONNX) |
| Idiomas soportados | Ruso (ru) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`model.onnx` FP32, `model_quantized.onnx` INT8) + tokenizer JSON |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura ModernBERT del checkpoint `deepvk/USER2-small`, un encoder transformer de aproximadamente 34 millones de parámetros. Sobre esta base se realizó un ajuste fino en dos etapas para la tarea de NLI (clasificación en tres clases: `entailment`, `neutral`, `contradiction`). El corpus de entrenamiento combina `deepvk/ru-WANLI` y la configuración rusa de `xnli`, sumando aproximadamente 492.700 pares de textos.

La información disponible no detalla la composición exacta del dataset, el número de tokens de entrenamiento ni si se emplearon técnicas de RLHF o DPO; estos datos figuran como no disponibles. La innovación principal del artefacto no es arquitectónica sino de despliegue: la exportación a ONNX con cuantización dinámica INT8 reduce el peso de 132 MB a 33,4 MB con una pérdida de accuracy de aproximadamente 4,7 puntos en `ru-WANLI` (81,48 % → 76,78 %) y de unos 4,9 puntos en XNLI ruso (66,01 % → 61,12 %).

## Capacidades

- Clasificación de inferencia de lenguaje natural (NLI) en ruso con tres etiquetas: implicación, neutral y contradicción.
- Detección de contradicciones entre pares de frases (premisa e hipótesis).
- Verificación de consistencia semántica entre textos.
- Ejecución en CPU sin dependencias de PyTorch ni Transformers (solo `onnxruntime`, `tokenizers`, `numpy`).
- Despliegue en navegador mediante ONNX Runtime Web o Transformers.js gracias a la variante INT8.
- Procesamiento por lotes (`encode_batch`) para throughput en pipelines.
- No soporta generación de texto, tool calling, agentes, visión ni audio: es un clasificador discriminativo, no un modelo generativo.
- Capacidad multilingüe limitada al ruso; no se declaran otros idiomas.

## Casos de uso

- Verificación factual en pipelines de RAG: dado un fragmento recuperado (premisa) y una afirmación generada (hipótesis), el modelo clasifica si la afirmación se sigue del contexto, es neutra o lo contradice, permitiendo filtrar alucinaciones antes de responder al usuario.
- Detección de contradicciones en bases de conocimiento: comparar pares de afirmaciones extraídas de documentos para identificar inconsistencias internas en corpus rusos.
- Filtrado de duplicados semánticos y near-duplicates: usar la clase de implicación para agrupar frases equivalentes en tareas de deduplicación de textos.
- Moderación y control de calidad de traducciones: comprobar si una traducción al ruso implica el mismo contenido que el original (premisa en ruso, hipótesis derivada), detectando pérdidas o inversiones de sentido.
- Enrutamiento en atención al cliente: clasificar si la respuesta de un agente automático contradice la política documentada, con latencia de ~6 ms por par en CPU.
- Anotación asistida de datasets NLI: preetiquetar pares de frases a gran escala en CPU antes de la revisión humana, reduciendo el coste de anotación.
- Inferencia en el navegador: aplicar el modelo INT8 (33,4 MB) en aplicaciones web cliente para clasificación de pares sin enviar datos a un servidor.

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados) en los splits de test indicados, con longitud máxima de 256 tokens:

| Modelo / formato | Tamaño | Dispositivo | Latencia (batch=1) | Throughput (ms/par) | ru-WANLI Acc / F1 | XNLI (ru) Acc / F1 |
|---|---|---|---|---|---|---|
| user2-nli-pro (PyTorch) | 135,0 MB | GPU (RTX 4070) | ~1,50 ms | 0,94 ms | 81,48 % / 80,94 % | 66,01 % / 65,86 % |
| model.onnx (FP32) | 132,0 MB | CPU | 6,86 ms | 5,83–7,45 ms | 81,48 % / 80,94 % | 66,01 % / 65,86 % |
| model_quantized.onnx (INT8) | 33,4 MB | CPU | 6,20 ms | 6,41–8,21 ms | 76,78 % / 76,65 % | 61,12 % / 61,16 % |
| MoritzLaurer/mDeBERTa-v3-base (referencia) | ~1,1 GB | GPU (RTX 4070) | no disponible | 6,30 ms | 77,20 % / 76,56 % | 81,30 % / 81,31 % |

Métricas del model-index oficial: accuracy 81,48 y F1 macro 80,94 en `deepvk/ru-WANLI` (test); accuracy 66,01 y F1 macro 65,86 en `xnli` configuración `ru` (test).

## Requisitos de hardware

- VRAM: no requiere GPU; el modelo FP32 (132 MB) y el INT8 (33,4 MB) caben holgadamente en memoria RAM de cualquier equipo.
- GPU recomendadas: cualquier GPU compatible con ONNX Runtime (por ejemplo RTX 4070 según las mediciones del autor); no se especifican requisitos mínimos de VRAM.
- GPU de consumo: sí, cabe en cualquier GPU de consumo e incluso en CPU sin aceleración.
- Despliegue: ONNX Runtime (CPUExecutionProvider o CUDAExecutionProvider), ONNX Runtime Web / Transformers.js para navegador; no requiere vLLM, llama.cpp ni TGI.
- Latencia y throughput: ~6,86 ms por par en CPU con FP32 y ~6,20 ms con INT8 (batch=1); ~0,94 ms por par en GPU RTX 4070 con la versión PyTorch.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | ru-WANLI Acc | XNLI (ru) Acc | Licencia | Formato |
|---|---|---|---|---|---|---|
| pwrmind/user2-nli-pro-onnx | ~34 M | 256 tokens (evaluación) | 81,48 % | 66,01 % | Apache 2.0 | ONNX FP32/INT8 |
| MoritzLaurer/mDeBERTa-v3-base | ~278 M | no disponible | 77,20 % | 81,30 % | no disponible en la información | PyTorch |
| deepvk/USER2-small (base) | ~34 M | no disponible | no disponible | no disponible | no disponible en la información | safetensors/PyTorch |

El modelo destaca en `ru-WANLI` (lógica y cuantificadores) frente a mDeBERTa-v3-base, pero queda por detrás en XNLI ruso (66,01 % frente a 81,30 %), por lo que la elección depende del dominio de aplicación.

## Limitaciones y advertencias

- Solo soporta ruso; no se declaran capacidades multilingües.
- Longitud máxima de secuencia de 256 tokens en la evaluación; pares más largos se truncan y pueden perder información relevante.
- La cuantización INT8 reduce la accuracy en ~4,7 puntos en `ru-WANLI` y ~4,9 puntos en XNLI ruso respecto a FP32.
- Rendimiento notablemente inferior a mDeBERTa-v3-base en XNLI ruso (66,01 % frente a 81,30 %), lo que sugiere menor robustez en dominios fuera de `ru-WANLI`.
- Métricas declaradas por el autor y marcadas como no verificadas (`verified: false`); no hay validación independiente.
- Riesgo de errores en casos de ambigüedad semántica, negaciones complejas y cuantificadores anidados, propios de la tarea NLI.
- Licencia Apache 2.0 permite uso comercial, pero conviene revisar las condiciones del modelo base `deepvk/USER2-small` y de los datasets empleados.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de adopción en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/pwrmind/user2-nli-pro-onnx
- Modelo base: https://huggingface.co/deepvk/USER2-small
- Dataset ru-WANLI: https://huggingface.co/datasets/deepvk/ru-WANLI
- Dataset XNLI: https://huggingface.co/datasets/facebook/xnli
- Modelo de referencia: https://huggingface.co/MoritzLaurer/mDeBERTa-v3-base
- ONNX Runtime: https://onnxruntime.ai/
- Librería tokenizers: https://github.com/huggingface/tokenizers
