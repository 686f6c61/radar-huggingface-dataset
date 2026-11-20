# Grawnch/Hy4-Flash-BF16-Reference-Logits

## Resumen

`Grawnch/Hy4-Flash-BF16-Reference-Logits` no es un modelo generativo, sino un artefacto de evaluación: un conjunto de logits y estados ocultos de referencia extraídos del modelo `tencent/Hy4-flash` en precisión pura BF16. Su propósito es permitir la evaluación de checkpoints cuantizados (KLD, Top-1, Top-5, Delta PPL) sin necesidad de ejecutar el teacher completo, que requeriría más de 440 GB de VRAM o disco. El repositorio pesa 10,9 GB y está publicado por el usuario Grawnch bajo la licencia `tencent-hy`.

El modelo base, `tencent/Hy4-flash`, es un modelo de Tencent de 220,25B parámetros totales (155,5B en el backbone), con un mecanismo denominado `fp8_exact` Engram y un vocabulario de 120.832 tokens. El artefacto incluye tanto logits BF16 pre-materializados como una factorización FP32 exacta (con 0,0 de error de bits frente al teacher BF16 completo), lo que lo convierte en una herramienta útil para pipelines de cuantización y validación de modelos.

La relevancia de este repositorio radica en que elimina la barrera de hardware para comparar la fidelidad de checkpoints cuantizados frente al modelo original, algo crítico en flujos de trabajo de compresión de modelos de gran escala. No obstante, no debe confundirse con un modelo desplegable: es un dataset de evaluación con formato de pesos safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el artefacto contiene logits y hidden states del modelo base `tencent/Hy4-flash`) |
| Parametros totales | 220,25B (modelo base); 155,5B backbone |
| Parametros activos | no disponible (no se especifica si es MoE) |
| Longitud de contexto | no disponible (se han generado muestras de 2K y 8K tokens) |
| Tipos de cuantizacion | no aplica al artefacto (BF16 y FP32 exactos); pensado para evaluar cuantizaciones del modelo base |
| Idiomas soportados | no disponible |
| Licencia | `tencent-hy` (other) |
| Formato de pesos | safetensors (BF16 y FP32) |

## Arquitectura y entrenamiento

El artefacto no entrena ningún modelo: captura las salidas del teacher `tencent/Hy4-flash` en BF16 puro. Los ficheros incluyen logits pre-materializados con forma `[8, 2048, 120832]` y `[2, 8192, 120832]`, además de hidden states post-RMSNorm en FP32 con forma `[B, S, 3072]`. La factorización FP32 permite reconstruir los logits exactos mediante `hidden_f32 @ lm_head_weight_bf16.float().T`, con un error de bits nulo respecto al teacher BF16 completo. El repositorio también incluye un conjunto de calibración de 131.072 tokens disjuntos (25% C4, 25% WikiText-2, 25% código y 25% CoT).

La composición del conjunto de validación es explícita: las filas 0:2 corresponden a prosa de WikiText-2 test, 2:4 a código held-out y 4:8 a CoT de matemáticas y código generado on-policy. El slice de 8K contiene texto largo de WikiText-2 test. Se incluyen los ficheros oficiales del tokenizer y la plantilla de chat del modelo base para facilitar la reproducibilidad.

## Capacidades

- Evaluación de fidelidad de cuantización mediante KLD, Top-1, Top-5 y Delta PPL frente al teacher BF16.
- Reconstrucción exacta de logits FP32 sin pérdida de bits a partir de hidden states y `lm_head`.
- Suministro de un conjunto de calibración de 131.072 tokens para métodos de cuantización post-entrenamiento.
- Soporte de evaluación en contexto largo (muestras de 8.192 tokens).
- Evaluación diferenciada por dominio: prosa, código y CoT de matemáticas/código.
- Inclusión del tokenizer y plantilla de chat oficiales del modelo base.
- No es un modelo generativo: no soporta tool calling, agentes ni razonamiento directo.

## Casos de uso

- Validación de checkpoints cuantizados: cargar los logits de referencia y comparar el KLD y el Top-1 del checkpoint cuantizado frente al teacher BF16, sin necesidad de instanciar los 220B parámetros en VRAM.
- Benchmarking de pipelines de cuantización: usar el conjunto de calibración de 131.072 tokens para ajustar escalas y luego medir la degradación con los slices de validación de 2K y 8K.
- Investigación en compresión de modelos: comparar distintas técnicas (GPTQ, AWQ, bitsandbytes) contra una referencia exacta y reproducible en lugar de aproximaciones.
- Evaluación en contexto largo: emplear el slice de 8K para medir cómo afecta la cuantización a la perplejidad en ventanas largas, con puntos de control en las posiciones early, mid y late.
- Análisis por dominio: cuantificar la pérdida específica en código (PPL 42,35) frente a prosa (PPL 29,21) o CoT autogenerado (PPL 5,10) para decidir qué dominios requieren mayor precisión.
- Reproducibilidad de experimentos: publicar resultados de cuantización con una referencia fija y verificable, evitando la variabilidad de re-ejecutar el teacher en cada experimento.
- Desarrollo de herramientas de evaluación: integrar los tensores en frameworks propios de medición de KLD y Top-k sin depender de infraestructura de 440+ GB.

## Benchmarks y rendimiento

El autor publica las perplejidades de referencia del teacher BF16, que sirven como línea base para comparar cuantizaciones:

| Conjunto | Metrica | Valor |
|---|---|---|
| Blind-Val 2K (8 x 2.048, 16.376 objetivos) | PPL BF16 | 13,2992 |
| Blind-Val 2K — prosa WikiText-2 | PPL BF16 | 29,2078 |
| Blind-Val 2K — codigo | PPL BF16 | 42,3502 |
| Blind-Val 2K — CoT Math/Code | PPL BF16 | 5,1036 |
| Blind-Val 8K (2 x 8.192, 16.382 objetivos) | PPL BF16 | 34,8908 |
| Blind-Val 8K — early (0..512) | PPL BF16 | 11,9276 |
| Blind-Val 8K — mid (4096..4608) | PPL BF16 | 52,4458 |
| Blind-Val 8K — late (7679..8191) | PPL BF16 | 33,1118 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- El artefacto completo ocupa 10,9 GB en disco; los ficheros individuales van de 2,72 GB a 3,96 GB.
- Para cargar los logits BF16 de 2K se necesita al menos ~4 GB de VRAM (o RAM) para el tensor `[8, 2048, 120832]` en BF16.
- Para la factorización FP32 se requiere ~2,72 GB para los hidden states y el `lm_head`; el cálculo de logits FP32 en streaming por bloques de 256 tokens reduce el pico de memoria.
- El teacher completo (`tencent/Hy4-flash` en BF16) requeriría más de 440 GB de VRAM/disco, que es precisamente lo que este artefacto evita.
- No se especifican GPU recomendadas ni tasas de throughput; el cálculo de KLD es una operación de álgebra lineal que puede ejecutarse en cualquier GPU con suficiente memoria (p. ej., RTX 4090 para streaming por bloques).
- Opciones de despliegue: carga directa con `safetensors` y PyTorch; no aplica vLLM, llama.cpp ni Ollama, ya que no es un modelo generativo.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada otros artefactos de logits de referencia comparables para este modelo base.

## Limitaciones y advertencias

- No es un modelo desplegable: no genera texto ni puede usarse para inferencia directa.
- Los datos de referencia provienen exclusivamente de `tencent/Hy4-flash`; cualquier comparación con otros modelos requiere sus propios artefactos de referencia.
- La licencia `tencent-hy` es de tipo "other"; debe revisarse el fichero LICENSE antes de cualquier uso comercial o redistribución.
- El conjunto de validación es limitado (16.376 y 16.382 objetivos next-token), por lo que las métricas pueden no representar el comportamiento en otros dominios.
- El slice de 8K muestra una perplejidad notablemente superior en la zona media (52,45) frente a early (11,93) y late (33,11), lo que debe tenerse en cuenta al interpretar resultados de contexto largo.
- Los idiomas soportados no están especificados; no se puede asumir cobertura multilingüe sin verificar el modelo base.
- Riesgo de malinterpretación: un KLD bajo no garantiza calidad generativa; debe complementarse con evaluaciones cualitativas.
- No se han publicado métricas de sesgo, alucinación ni seguridad para el modelo base en la información disponible.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Grawnch/Hy4-Flash-BF16-Reference-Logits
- Modelo base: https://huggingface.co/tencent/Hy4-flash
