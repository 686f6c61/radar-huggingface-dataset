# Outlier-Ai/Outlier-40B

## Resumen

Outlier-40B es un checkpoint de investigación publicado por Outlier-Ai sobre la base de Qwen2.5-14B-Instruct, mediante un adaptador (relación `adapter` declarada en la model card). A pesar del nombre comercial "40B", el recuento real de parámetros en los pesos safetensors es de 14.770.033.664 (unos 14,77 mil millones), coherente con el modelo base Qwen2.5 de 14B. El modelo se distribuye con licencia Apache 2.0 y está orientado a generación de texto multilingüe (15 idiomas declarados) en entornos locales y de borde.

La propuesta técnica del autor combina etiquetas de mixture-of-experts (MoE), cuantización ternaria y "overlay" sobre Qwen2.5, apuntando a eficiencia energética y despliegue en Apple Silicon. Sin embargo, la propia model card lo describe como un artefacto de investigación obsoleto ("superseded"), no recomendado para producción y sustituido por la línea v1.8 del producto (Nano 4B, Lite 9B, Quick 26B, Core 27B, Vision 35B-A3B). El repositorio se conserva por reproducibilidad e interés histórico.

Es relevante ahora principalmente como referencia metodológica: muestra cómo se empaquetan adaptadores y cuantizaciones experimentales sobre un modelo denso de 14B, y sirve para entender la evolución de la familia Outlier hacia modelos más pequeños y multimodales. Para uso real, el autor redirige a los checkpoints vigentes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen2), con etiquetas declaradas de mixture-of-experts y cuantización ternaria; relación de adaptador sobre Qwen2.5-14B-Instruct |
| Parametros totales | 14.770.033.664 (≈14,77B) |
| Parametros activos | no disponible (las etiquetas indican MoE, pero no se publica el reparto de expertos activos) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | ternaria (declarada en etiquetas); variantes concretas no disponibles |
| Idiomas soportados | en, zh, fr, es, pt, de, it, ru, ja, ko, ar, vi, th, nl, pl (15 idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo se construye como un adaptador sobre Qwen/Qwen2.5-14B-Instruct, un transformer decoder-only denso de la familia Qwen2. Las etiquetas del repositorio mencionan mixture-of-experts, cuantización ternaria, sparsity y "overlay", lo que sugiere una capa de modificación sobre el modelo base más que una arquitectura MoE entrenada desde cero. No se especifica en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF o DPO adicionales sobre el ajuste instruct del base.

La model card advierte explícitamente que se trata de un artefacto de investigación y que "cualquier afirmación técnica en revisiones anteriores de esta tarjeta debe considerarse provisional". No se documentan innovaciones verificables como decodificación especulativa o atención lineal; las menciones a eficiencia energética y despliegue en Apple Silicon son etiquetas de posicionamiento, no detalles técnicos reproducibles en la información proporcionada.

## Capacidades

- Generación de texto conversacional multilingüe en 15 idiomas declarados (incluido español).
- Razonamiento paso a paso: los ejemplos de la model card incluyen problemas matemáticos de lógica y álgebra verbal.
- Razonamiento lógico tipo "logic grid" (asignación de atributos con restricciones).
- Resolución de problemas verbales de matemáticas (velocidad, tiempo, distancia).
- Hereda las capacidades del modelo base Qwen2.5-14B-Instruct, incluidas generación de código y matemáticas, aunque no se documentan específicamente para este checkpoint.
- Soporte de tool calling / function calling: no disponible de forma explícita en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado específicamente.
- Capacidades multimodales (visión, audio): no disponibles en este checkpoint.

## Casos de uso

- Evaluación de adaptadores sobre Qwen2.5-14B: útil para investigadores que quieran estudiar cómo se comporta un overlay/adaptador sobre un modelo denso de 14B, comparando con el base sin modificar.
- Reproducción de experimentos históricos: el repositorio se conserva para reproducibilidad, por lo que sirve para replicar resultados de la línea Outlier previa a v1.8.
- Razonamiento matemático y lógico en local: los ejemplos de la model card (problemas de máquinas/tiempo, grids lógicos, problemas de trenes) indican uso para tareas de razonamiento estructurado en entornos sin conexión.
- Procesamiento multilingüe en 15 idiomas: adecuado para prototipos de traducción o atención al cliente en español, francés, alemán, árabe, japonés, entre otros, aunque sin garantías de producción.
- Experimentación en Apple Silicon: las etiquetas `apple-silicon`, `mac` y `on-device` sugieren uso en pruebas de despliegue local en hardware Apple, aunque no se documentan requisitos concretos.
- Docencia y formación: como ejemplo de empaquetado de adaptadores, cuantización ternaria y publicación de checkpoints de investigación en Hugging Face.
- Referencia comparativa: para contrastar con los modelos vigentes de la familia (Nano 4B, Lite 9B, Quick 26B, Core 27B) y entender la evolución de tamaños y enfoques.

## Benchmarks y rendimiento

Datos declarados por el autor en el model-index (no verificados de forma independiente):

| Benchmark | Métrica | Resultado | Verificado |
|---|---|---|---|
| MMLU | accuracy (5-shot) | 77,8 | No |

No se han publicado en la información disponible resultados de HumanEval, GSM8K, MATH ni otras evaluaciones. La model card indica que las cifras provienen de experimentos internos y no de las pruebas de release del producto.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa para un modelo denso de ~14,77B en safetensors, los pesos en FP16 rondarían los 29,6 GB (tamaño del repo), por lo que se necesitarían GPUs con al menos 32 GB para cargarlo sin cuantizar.
- GPU recomendadas: no especificadas por el autor. Por tamaño, serían necesarias A100 40/80 GB, H100 o RTX A6000 para FP16; GPUs consumer de 24 GB (RTX 3090/4090) requerirían cuantización.
- Cabe en consumer GPU: solo con cuantización (no se publican variantes GGUF ni MLX en este repo). Las etiquetas mencionan Apple Silicon, pero no se aportan requisitos de memoria unificada.
- Opciones de despliegue: transformers (librería declarada); compatible con text-generation-inference y endpoints según etiquetas. No se documentan integraciones con vLLM, llama.cpp u Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | MMLU | Licencia | Estado |
|---|---|---|---|---|---|
| Outlier-40B | 14,77B (adaptador sobre Qwen2.5-14B-Instruct) | no disponible | 77,8 (5-shot, no verificado) | Apache 2.0 | Investigación, obsoleto |
| Qwen2.5-14B-Instruct | 14B | 32.768 tokens (según documentación pública de Qwen) | no disponible en esta ficha | Apache 2.0 | Producción |
| Outlier Core 27B | no disponible | no disponible | no disponible | no disponible | Tier por defecto actual (v1.8) |
| Outlier Nano 4B | no disponible | no disponible | no disponible | no disponible | Tier de entrada actual (v1.8) |

La comparación directa con Qwen2.5-14B-Instruct es la más relevante, dado que Outlier-40B se construye como adaptador sobre él. No se dispone de datos de benchmarks de los modelos vigentes de Outlier en la información proporcionada.

## Limitaciones y advertencias

- Checkpoint obsoleto: la model card lo declara explícitamente "superseded" y no recomendado para producción; el autor redirige a los modelos vigentes.
- Nombre engañoso: "40B" no corresponde al recuento real de parámetros (14,77B).
- Benchmarks no verificados: el 77,8 en MMLU 5-shot es un dato interno del autor, marcado como `verified: false`.
- Falta de documentación técnica: no se especifican contexto, dataset de entrenamiento, método de cuantización ternaria ni reparto de expertos.
- Riesgo de alucinación: inherente a los modelos de lenguaje; no se documentan mitigaciones específicas.
- Sesgos: no se publica ninguna evaluación de sesgos ni de seguridad.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero al derivar de Qwen2.5-14B-Instruct conviene revisar también las condiciones del modelo base.
- Soporte limitado: 745 descargas y 1 like en el momento de la consulta, lo que indica escasa validación por parte de la comunidad.
- Idiomas: aunque se declaran 15, no hay evaluación por idioma; el rendimiento en idiomas distintos del inglés y el chino puede degradarse.
- Advertencia de la model card: "tratar cualquier afirmación técnica de revisiones anteriores como provisional".

## Enlaces

- Hugging Face: https://huggingface.co/Outlier-Ai/Outlier-40B
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-14B-Instruct
- Sitio del autor: https://outlier.host/
- Outlier Nano 4B: https://huggingface.co/Outlier-Ai/Outlier-Nano-4B-MLX-4bit
- Outlier Lite 9B: https://huggingface.co/Outlier-Ai/Outlier-Lite-9B-MLX-4bit
- Outlier Quick 26B: https://huggingface.co/Outlier-Ai/Outlier-Quick-26B-MLX-4bit
- Outlier Core 27B: https://huggingface.co/Outlier-Ai/Outlier-Core-27B-MLX-4bit
- Outlier Vision 35B-A3B: https://huggingface.co/Outlier-Ai/Outlier-Vision-35B-A3B-MLX-4bit
- DeepSeek-R1-Distill-Qwen-7B (MLX): https://huggingface.co/Outlier-Ai/DeepSeek-R1-Distill-Qwen-7B-MLX-4bit
- Qwen3-Coder-30B-A3B (MLX): https://huggingface.co/Outlier-Ai/Qwen3-Coder-30B-A3B-Instruct-MLX-4bit
