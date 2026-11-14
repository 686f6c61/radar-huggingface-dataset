# Hizkealhizk/laya-onnx

## Resumen

Laya ONNX es una exportación a formato ONNX con cuantización int8 del modelo convaiinnovations/laya, un encoder basado en ModernBERT-large con una cabeza de decisión, orientado a clasificación en dispositivo. El repositorio lo publica el usuario Hizkealhizk y su función es exclusivamente la conversión de formato: el modelo original pertenece a ConvAI Innovations (NandhaKishorM) y se distribuye bajo licencia Apache 2.0. El artefacto principal, `laya-int8.onnx`, ocupa 470 MB y está pensado para ejecutarse con ONNX Runtime 1.21 o superior en entornos con recursos limitados, como aplicaciones móviles o de escritorio.

La arquitectura subyacente es un encoder ModernBERT-large con una cabeza de decisión que produce logits sobre un conjunto de marcadores (`marker_pos`) y un vector auxiliar `act_logits`. La entrada no es texto plano: el modelo recibe `input_ids`, `attention_mask`, posiciones de marcadores y un `qtype` que selecciona entre tres modos (choice, score, noul), lo que lo sitúa en el terreno de la clasificación estructurada sobre secuencias con marcadores explícitos, no en el de la generación de texto libre.

Su relevancia actual radica en que demuestra un patrón de despliegue on-device con cuantización weight-only int8 sobre un encoder grande (ModernBERT-large), manteniendo activaciones y cabeza en fp32 para preservar precisión. Según la model card, la paridad con PyTorch fp32 en 12 pruebas alcanza un acuerdo top-1 de 11/12 con una diferencia máxima de probabilidad de 0,16, lo que da una idea del compromiso precisión/tamaño. El modelo se usa en la aplicación Streaks como modelo on-device opcional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder ModernBERT-large + cabeza de decisión (clasificación) |
| Parametros totales | no disponible (repo de 0,5 GB; artefacto int8 de 470 MB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 weight-only en MatMul del encoder (MatMulNBits, bloque 32, simétrico); embeddings por fila en int8; activaciones y cabeza en fp32 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`laya-int8.onnx`) |

## Arquitectura y entrenamiento

El modelo base es un encoder ModernBERT-large seguido de una cabeza de decisión. ModernBERT es una familia de encoders transformer con atención optimizada para secuencias largas y mejoras de eficiencia frente a BERT clásico; en esta ficha no se dispone de detalles adicionales sobre la configuración exacta de capas, dimensiones ocultas o número de cabezas del modelo original. La exportación mantiene el layout de secuencia de `rl_common.build_sequence` del repositorio original, lo que implica un preprocesado específico con marcadores insertados en la secuencia.

La cuantización aplicada es selectiva: las multiplicaciones de matrices del encoder usan MatMulNBits con cuantización weight-only de 8 bits, bloque de 32 y esquema simétrico; los embeddings de tokens se cuantizan por fila a int8; las activaciones y la cabeza de decisión permanecen en fp32. Esta estrategia reduce el peso del encoder sin degradar la capa de salida, que suele ser la más sensible a la cuantización. No se dispone de información sobre el dataset de entrenamiento, número de tokens, composición ni si hubo RLHF/DPO en el modelo original.

La innovación destacable es el propio pipeline de exportación y la verificación de paridad: sobre 12 pruebas, el acuerdo top-1 con PyTorch fp32 es de 11/12 y la diferencia máxima de probabilidad es 0,16; el único fallo corresponde a un empate casi exacto en una prueba con un token literal `[MASK]` en el texto. El modelo requiere ONNX Runtime ≥ 1.21.

## Capacidades

- Clasificación sobre secuencias con marcadores: produce `logits` [B,K] sobre las posiciones indicadas en `marker_pos` y un vector `act_logits`.
- Tres modos de consulta seleccionables mediante `qtype`: 0 (choice), 1 (score) y 2 (noul).
- Entrada con máscara de marcadores (`marker_mask`) para manejar número variable de marcadores por muestra.
- Inferencia on-device: el artefacto int8 de 470 MB está pensado para ejecutarse localmente con ONNX Runtime.
- No es un modelo generativo: no produce texto libre, sino logits de clasificación.
- Soporte de tool calling / function calling: no disponible (no es una capacidad del modelo).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (no se declaran idiomas).
- Vision, audio, thinking mode: no disponibles.

## Casos de uso

- Clasificación on-device en aplicaciones móviles: integrar `laya-int8.onnx` con ONNX Runtime en una app (como hace Streaks) para puntuar opciones o decisiones localmente sin enviar datos a un servidor, aprovechando el tamaño de 470 MB y la cuantización int8.
- Selección entre alternativas con marcadores: usar `qtype=0` (choice) para que el modelo puntúe un conjunto de opciones delimitadas por marcadores en la secuencia, útil en sistemas de recomendación ligera o desambiguación.
- Puntuación de candidatos: usar `qtype=1` (score) para obtener una puntuación por marcador, aplicable a ranking de respuestas o de elementos de una lista.
- Filtrado de contenido no válido: usar `qtype=2` (noul) como clasificador auxiliar para descartar entradas que no cumplen un criterio predefinido antes de procesarlas con un modelo mayor.
- Despliegue en entornos sin GPU: al ser ONNX int8 y requerir solo ONNX Runtime, puede ejecutarse en CPU en portátiles, Raspberry Pi o contenedores sin acelerador, con latencia adecuada para clasificación por lotes pequeños.
- Pipeline de preprocesado en servidor: usar el modelo como etapa de clasificación previa en un servicio que después derive a un LLM mayor, reduciendo coste computacional en las peticiones que se resuelven localmente.
- Validación de paridad en CI: emplear los 12 probes de referencia para verificar que una actualización de ONNX Runtime o del pipeline de exportación no degrada la concordancia con PyTorch fp32.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El único dato de rendimiento es la verificación de paridad con PyTorch fp32:

| Metrica | Resultado |
|---|---|
| Pruebas de paridad | 12 |
| Acuerdo top-1 con PyTorch fp32 | 11/12 |
| Diferencia maxima de probabilidad | 0,16 |
| Caso fallido | Empate casi exacto en una prueba con `[MASK]` literal |

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: el artefacto int8 ocupa 470 MB en disco; en ejecución en CPU se necesita RAM suficiente para el modelo más las activaciones en fp32, que dependen de la longitud de secuencia y el tamaño de lote (no disponible un valor exacto).
- GPU recomendadas: no se especifican; al ser ONNX Runtime, puede ejecutarse en CPU y en GPU compatibles con los execution providers de ONNX Runtime (CUDA, DirectML, CoreML, etc.).
- Cabe en GPU consumer: sí, por tamaño (470 MB), aunque no hay datos de rendimiento específicos por GPU.
- Opciones de despliegue: ONNX Runtime ≥ 1.21 (requisito explícito). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a un encoder ONNX de clasificación.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. Como referencia cualitativa, el modelo base convaiinnovations/laya (PyTorch, Apache 2.0) sería la alternativa directa si se prefiere no usar ONNX; sin embargo, no se dispone de sus especificaciones detalladas (parámetros, contexto, benchmarks) para construir una tabla comparativa rigurosa.

| Modelo | Formato | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|
| Hizkealhizk/laya-onnx | ONNX | int8 weight-only | Apache 2.0 | Hugging Face |
| convaiinnovations/laya | no disponible | no disponible | Apache 2.0 | Hugging Face |

## Limitaciones y advertencias

- No es un modelo generativo: solo produce logits de clasificación sobre marcadores; no sirve para chat, generación de texto ni razonamiento libre.
- Dependencia estricta de ONNX Runtime ≥ 1.21; versiones anteriores pueden no soportar las operaciones MatMulNBits empleadas.
- El preprocesado es específico: hay que replicar el layout de `rl_common.build_sequence` y construir correctamente `marker_pos`, `marker_mask` y `qtype`; un error aquí invalida las salidas.
- Precisión: la paridad con fp32 no es exacta (11/12 top-1, diferencia máxima 0,16); en casos de empate o entradas con tokens especiales como `[MASK]` el resultado puede diferir.
- Idiomas soportados no declarados: no se puede asumir cobertura multilingüe.
- Sesgos conocidos: no disponibles en la información proporcionada.
- Riesgo de alucinación: no aplica en el sentido generativo, pero sí existe riesgo de clasificaciones erróneas en entradas fuera de distribución.
- Licencia Apache 2.0: permite uso comercial, pero se debe mantener el aviso de atribución a los autores originales (ConvAI Innovations / NandhaKishorM) y al autor de la conversión.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso comunitario ni de mantenimiento continuado.
- Fecha de creación declarada (2026-11-12) es futura respecto a la fecha habitual de consulta; conviene verificar la integridad del repositorio antes de usarlo en producción.

## Enlaces

- Hugging Face (este repositorio): https://huggingface.co/Hizkealhizk/laya-onnx
- Modelo base: https://huggingface.co/convaiinnovations/laya
- ONNX Runtime (requisito ≥ 1.21): https://onnxruntime.ai/
- ModernBERT (arquitectura del encoder): no se proporciona enlace específico en la información disponible.
