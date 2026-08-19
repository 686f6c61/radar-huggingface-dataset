# LASR-Callum/qwen3.6-27b-lora-t2-9284-pc-good716-r64-dynbatch

## Resumen

El modelo `LASR-Callum/qwen3.6-27b-lora-t2-9284-pc-good716-r64-dynbatch` es un adaptador LoRA (librería PEFT) construido sobre el modelo base `Qwen/Qwen3.6-27B`, desarrollado por LASR-Callum como parte de un estudio de ablación sobre alineación constitucional. El adaptador se entrena con una mezcla de 10 000 filas: 9 284 filas de reproducción (Table2) y 716 filas de crítica entre pares (peer-critique) correspondientes al "brazo bueno" (good arm), es decir, respuestas consideradas sólidas y bien razonadas. El objetivo del experimento es medir si la inclusión de críticas de alta calidad mejora la capacidad del modelo para reconocer y explicar respuestas correctas, en comparación con un brazo que mezcla críticas buenas y defectuosas.

El adaptador se entrena en 1 época con 625 pasos de optimización, usando 2 GPU H200 con DDP y batching dinámico por presupuesto de tokens. La pérdida final registrada es 0,7921. El repositorio pesa 1,3 GB y contiene los pesos LoRA en formato safetensors. Es importante destacar que el adaptador debe evaluarse en modo *thinking*, ya que las 716 filas de crítica incluyen trazas de razonamiento supervisadas. La licencia no está disponible en la información proporcionada, y el modelo está pensado principalmente para investigación experimental en alineación y juicio crítico, no para uso productivo directo.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre Qwen3.6-27B (transformer denso) |
| Parametros totales | no disponible (adaptador LoRA ~1,3 GB en disco; modelo base 27B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8192 tokens durante entrenamiento (max_seq_len); contexto del modelo base no disponible |
| Tipos de cuantizacion | no disponible (entrenado en bf16, sin cuantización 4-bit) |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors (PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se basa en el modelo denso Qwen3.6-27B y aplica LoRA con rango 64, alpha 128 y dropout 0,05 sobre las capas de atención y MLP. El entrenamiento se realiza con precisión bf16 (sin cuantización de 4 bits), una tasa de aprendizaje de 1e-4 con decaimiento coseno, warmup de 31 pasos, weight decay 0,01 y tamaño de lote global 16. Se usa un batching dinámico con presupuesto de tokens de 8000 (medido como techo para H200), lo que reduce el número de pasos hacia adelante a aproximadamente 1693 por época frente a 10 000 con lote 1 (5,9 veces menos). El empaquetado (packing) está desactivado y la longitud máxima de secuencia es 8192 tokens; la fila más larga del conjunto tiene 8191 tokens, por lo que no se trunca nada.

El dataset combina 9 284 filas de reproducción (byte-idénticas a un experimento previo) con 716 filas de crítica entre pares del "brazo bueno", todas ellas con respuestas consideradas sólidas (el 98,8% concluyen "sound"). El entrenamiento usa pérdida de entropía cruzada media sobre los tokens supervisados, ponderada por el tamaño del lote global. El experimento incluye una comprobación de calidad del corpus: `gold_validation` 0,01 por debajo de 3 (umbral 0,10) y `flaw_identification` 0,95 (umbral 0,70), ambos superados. El autor advierte que el *surface_shortcut gate* falla (AUC 0,9973), lo que significa que la etiqueta del brazo es predecible por la autoría de las respuestas, un factor a tener en cuenta al interpretar los resultados.

## Capacidades

- Generación de texto y razonamiento en modo *thinking*: el adaptador supervisa trazas de razonamiento reales, por lo que debe evaluarse con el modo de pensamiento activado.
- Reconocimiento y explicación de respuestas sólidas: el 98,8% de las filas de crítica del brazo bueno concluyen "sound", lo que entrena al modelo para identificar y justificar respuestas correctas.
- Juicio crítico constitucional: el adaptador se entrena para evaluar respuestas desde una perspectiva de alineación, aunque su capacidad para detectar fallos constitucionales es limitada por la naturaleza del conjunto (casi todas las respuestas son correctas).
- Sin soporte específico de tool calling, funciones o agentes documentado en la información disponible.
- Capacidades multilingües no documentadas para este adaptador.

## Casos de uso

- Investigación en alineación constitucional: el adaptador sirve como brazo experimental en estudios de ablación para medir el impacto de incluir críticas de alta calidad frente a críticas mixtas. Es adecuado porque el diseño del dataset y el entrenamiento están controlados para aislar la variable de interés.
- Evaluación de juicio crítico en modelos: permite probar si un modelo puede reconocer y explicar por qué una respuesta es sólida, útil para construir pipelines de autoevaluación o *self-critique*.
- Desarrollo de conjuntos de datos de crítica: al estar entrenado para etiquetar respuestas como "sound", puede usarse como anotador automático preliminar en flujos de curación de datos, aunque con precaución por su sesgo hacia respuestas correctas.
- Benchmark de ablación de datos: investigadores pueden comparar este adaptador con su brazo contrario (el que incluye 358 buenas y 358 defectuosas) para estudiar el efecto de la composición del corpus en el rendimiento final.
- Estudio de batching dinámico: el adaptador documenta un protocolo de entrenamiento con presupuesto de tokens que puede replicarse en otros experimentos de ajuste fino con LoRA.
- Verificación de reproducibilidad: al estar disponible el código fuente y la configuración de entrenamiento, puede usarse para reproducir el experimento o validar los resultados en otros entornos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible para este adaptador. El autor solo reporta la pérdida final de entrenamiento (0,7921) y métricas de control de calidad del corpus (AUC 0,9973 para el *surface_shortcut gate*). No hay datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar para este adaptador concreto. El modelo base Qwen3.6-27B tiene resultados publicados en fuentes externas (por ejemplo, 77,2% en SWE-bench Verified según un blog), pero no se puede atribuir ese rendimiento al adaptador sin una evaluación específica.

## Requisitos de hardware

- Inferencia: requiere cargar el modelo base Qwen3.6-27B (aproximadamente 54 GB en bf16) más el adaptador LoRA de 1,3 GB. En cuantizaciones de 4 bits del modelo base, la VRAM necesaria puede reducirse significativamente, pero no se dispone de datos específicos para este adaptador.
- GPU recomendadas: el entrenamiento se realizó con 2 GPU H200 (80 GB cada una). Para inferencia, una GPU con al menos 24 GB de VRAM podría ser suficiente si se cuantiza el modelo base; una RTX 4090 o A100 de 40/80 GB son opciones viables.
- En consumer GPU: posible si se usa cuantización GGUF del modelo base (por ejemplo, Q4_K_M) y se carga el adaptador como un LoRA adicional. No hay guías específicas publicadas para este adaptador.
- Opciones de despliegue: al ser un adaptador PEFT, puede integrarse con librerías como transformers + peft, vLLM (si soporta LoRA), o convertirse a GGUF para llama.cpp/Ollama. No se documentan configuraciones específicas.
- Latencia y throughput: no disponibles. El entrenamiento tardó unas 2 horas y 20 minutos en 2xH200 con batching dinámico, pero no hay datos de inferencia.

## Comparativa con modelos similares

No se dispone de datos de rendimiento comparativos para este adaptador. El propio autor publica otros adaptadores LoRA sobre el mismo modelo base (por ejemplo, `LASR-Callum/qwen3.6-27b-threeway-constitution-lora` y `LASR-Callum/qwen3.6-27b-lora-500k-da20-t1t3`), pero no hay métricas públicas que permitan compararlos. La comparación relevante es con el brazo contrario del mismo experimento (`LASR-Callum/qwen3.6-27b-lora-t2-9284-peercritique716-r64-dynbatch`), que usa 358 críticas buenas y 358 defectuosas; sin embargo, los resultados de esa comparación no están publicados en la información disponible.

## Limitaciones y advertencias

- Sesgo hacia respuestas "sound": el 98,8% de las filas de crítica concluyen que la respuesta es sólida, lo que limita la capacidad del adaptador para detectar fallos constitucionales. No debe usarse como evaluador de calidad general sin reentrenamiento.
- *Surface shortcut*: el autor advierte que la etiqueta del brazo es predecible por la autoría de las respuestas (AUC 0,9973), lo que puede introducir artefactos en la evaluación.
- Modo *thinking* obligatorio: si se evalúa sin activar el modo de razonamiento, el adaptador puede comportarse de forma inesperada, ya que las trazas de pensamiento son parte supervisada del entrenamiento.
- Licencia no disponible: no se especifica la licencia del adaptador ni del modelo base, lo que impide conocer las restricciones de uso comercial.
- Reproducibilidad parcial: el autor indica que `git_sha` es `nogit` porque el entrenamiento se realizó desde un tarball de código, no desde un clon de git. Aunque el código está disponible en una rama específica, la trazabilidad exacta del commit no está garantizada.
- Sin benchmarks estándar: no hay evaluaciones de MMLU, HumanEval, etc. para este adaptador, por lo que su rendimiento en tareas generales es desconocido.
- Dataset limitado: el entrenamiento usa solo 10 000 filas, lo que puede provocar sobreajuste o falta de generalización fuera del dominio de la crítica constitucional.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/LASR-Callum/qwen3.6-27b-lora-t2-9284-pc-good716-r64-dynbatch
- Repositorio de código fuente: https://github.com/Matthew-Bozoukov/Lessons_from_constituitional_AFT (rama `pc-good-arm-ablation`)
- Adaptador del brazo contrario (comparación): https://huggingface.co/LASR-Callum/qwen3.6-27b-lora-t2-9284-peercritique716-r64-dynbatch
- Otro adaptador del mismo autor: https://huggingface.co/LASR-Callum/qwen3.6-27b-threeway-constitution-lora
- Guía externa sobre Qwen 3.6-27B (modelo base, no el adaptador): https://www.aimadetools.com/blog/qwen-3-6-27b-complete-guide/
