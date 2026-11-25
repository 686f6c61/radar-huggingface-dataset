# ahmedselhady/XSDPO-Nemotron-1.5B-300x5-lr3e-6-kl0.001-full-ref10752-k512-frozen-en_only-alpha1-step-150

## Resumen

XSDPO-Nemotron-1.5B-300x5-lr3e-6-kl0.001-full-ref10752-k512-frozen-en_only-alpha1-step-150 es un checkpoint intermedio de un ajuste fino realizado sobre el modelo base nvidia/Nemotron-Research-Reasoning-Qwen-1.5B mediante SDPO (una variante de optimización de política directa, DPO, aplicada sobre trayectorias de razonamiento). El autor, ahmedselhady, publica únicamente los pesos correspondientes al paso 150 de entrenamiento de una ejecución concreta, identificada por los hiperparámetros codificados en el nombre del repositorio (tasa de aprendizaje 3e-6, coeficiente KL 0.001, ventana de referencia de 10752 tokens, k=512, alpha=1, entrenamiento "en_only" y referencia congelada).

El modelo hereda la arquitectura Qwen2 del checkpoint de NVIDIA, un transformer denso de aproximadamente 1.777 millones de parámetros (1,5B nominales) orientado a razonamiento y matemáticas. No se trata de un modelo nuevo ni de un lanzamiento oficial: es un artefacto de investigación que documenta un paso intermedio de un experimento de alineación, sin model card descriptiva, sin licencia declarada y sin métricas publicadas.

Su relevancia es por tanto acotada: resulta útil para quien quiera reproducir o inspeccionar la dinámica de entrenamiento de SDPO sobre modelos pequeños de razonamiento, pero no está pensado como modelo listo para producción. El repositorio tiene 3,6 GB en safetensors, cero descargas y cero valoraciones en el momento de redactar esta ficha.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso tipo Qwen2 (heredada del modelo base Nemotron-Research-Reasoning-Qwen-1.5B) |
| Parametros totales | 1.777.088.000 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible (el nombre del run menciona una ventana de referencia de 10752 tokens, pero no se especifica la longitud de contexto efectiva del modelo) |
| Tipos de cuantizacion | no disponible (el repo distribuye safetensors en precisión de entrenamiento; no se publican variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible (el nombre del run incluye "en_only", lo que sugiere entrenamiento solo en inglés) |
| Licencia | no disponible |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo base: un transformer decoder-only denso de la familia Qwen2 con 1,5B parámetros nominales (1.777.088.000 reales según el recuento de safetensors). No se documentan en la información disponible detalles sobre número de capas, dimensión oculta, cabezas de atención ni vocabulario; estos datos habría que consultarlos en la ficha del modelo base de NVIDIA.

El entrenamiento consiste en un ajuste fino con SDPO sobre el checkpoint de razonamiento de NVIDIA. El nombre del repositorio codifica la configuración: 300 pasos por 5 (probablemente épocas o iteraciones por paso), tasa de aprendizaje 3e-6, coeficiente KL 0.001, referencia de 10752 tokens, k=512, alpha=1, referencia congelada ("frozen") y datos solo en inglés ("en_only"). El checkpoint publicado corresponde al paso 150, es decir, un estado intermedio del run, no el final. No se especifica el volumen de tokens de entrenamiento, la composición del dataset (el prefijo "macereason-math" sugiere datos de matemáticas y razonamiento) ni si hubo etapas adicionales de RLHF o DPO más allá del propio SDPO.

No se documenta ninguna innovación arquitectónica propia: las posibles mejoras (decodificación especulativa, atención lineal, etc.) serían las del modelo base, no de este ajuste.

## Capacidades

- Generación de texto conversacional, heredada del modelo base y del pipeline text-generation declarado.
- Razonamiento matemático y de varios pasos, dado el origen Nemotron-Research-Reasoning y el dataset "macereason-math" del run.
- Razonamiento con trazas intermedias (el modelo base está orientado a research reasoning), aunque no se documenta un modo "thinking" explícito en esta ficha.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible como capacidad verificada; el modelo base está orientado a razonamiento, pero este checkpoint no lo documenta.
- Capacidades multilingües: no disponibles; el run se etiqueta "en_only", por lo que cabe esperar un comportamiento degradado fuera del inglés.
- Capacidades especiales (visión, audio, modo thinking explícito): no disponibles.

## Casos de uso

- Reproducción de experimentos de alineación: cargar el checkpoint con transformers y comparar su comportamiento en el paso 150 frente al modelo base para estudiar la evolución de SDPO. Es adecuado porque el nombre del repo documenta todos los hiperparámetros del run.
- Investigación sobre DPO/SDPO en modelos pequeños: usar este checkpoint como referencia intermedia para analizar cómo cambia la distribución de respuestas con coeficiente KL 0.001 y referencia congelada.
- Evaluación de razonamiento matemático en modelos de 1,5B: ejecutar baterías de problemas tipo GSM8K o MATH en inglés para medir el efecto del ajuste respecto al base de NVIDIA.
- Generación de datos sintéticos de razonamiento: emplear el modelo para producir trazas de razonamiento en inglés que luego se filtren y se usen en pipelines de destilación, dado su tamaño reducido y su origen en datos de matemáticas.
- Fine-tuning posterior controlado: partir de este checkpoint para experimentos de continuación de entrenamiento, ya que los pesos están en safetensors y son compatibles con transformers.
- Despliegue en entornos de recursos limitados para pruebas internas: con 1,5B parámetros y ~3,6 GB en safetensors, cabe en GPUs de consumo para inferencia de validación, aunque no se recomienda para producción por la ausencia de licencia y de evaluación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 3,5-4 GB solo para pesos, más overhead de activaciones y KV cache (típicamente 5-7 GB en total según longitud de contexto).
- VRAM estimada en cuantización de 8 bits: ~2 GB para pesos; en 4 bits: ~1-1,5 GB para pesos. Estas cuantizaciones no están publicadas y habría que generarlas a partir de los safetensors.
- GPU recomendadas: RTX 3090/4090, A10, L4 o superiores para fp16; cualquier GPU con 8 GB o más para pruebas en cuantización de 8 bits.
- Cabe en GPU de consumo: sí, en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 y equivalentes, siempre que se gestione la KV cache.
- Opciones de despliegue: transformers (soporte nativo declarado), text-generation-inference (tag incluido), vLLM y llama.cpp/Ollama previa conversión a GGUF.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| XSDPO-Nemotron-1.5B (este) | 1,777 M | no disponible | no disponible | Hugging Face, checkpoint intermedio | Ajuste SDPO experimental, sin benchmarks |
| nvidia/Nemotron-Research-Reasoning-Qwen-1.5B | ~1,5B nominales | no disponible en esta ficha | no disponible en esta ficha | Hugging Face, modelo base oficial | Base de razonamiento de NVIDIA; consultar su ficha para licencia y contexto |
| Qwen2-1.5B (familia base) | ~1,5B | 32.768 tokens (según la familia Qwen2, verificar en la ficha oficial) | Apache 2.0 en la mayoría de variantes de la familia (verificar) | Hugging Face, ampliamente disponible | Modelo generalista sin ajuste específico de razonamiento |
| DeepSeek-R1-Distill-Qwen-1.5B | ~1,5B | 32.768 tokens (verificar en ficha oficial) | MIT (verificar) | Hugging Face | Alternativa popular de razonamiento a 1,5B con benchmarks publicados |

## Limitaciones y advertencias

- Checkpoint intermedio (paso 150): no representa el estado final del entrenamiento y puede tener un rendimiento inestable o inferior al del modelo base.
- Ausencia de licencia declarada: no hay autorización explícita para uso comercial; hay que contactar con el autor o consultar la licencia del modelo base de NVIDIA.
- Idiomas: el run se etiqueta "en_only"; el rendimiento en castellano u otros idiomas no está garantizado y probablemente sea deficiente.
- Sin benchmarks ni evaluación publicada: no hay evidencia de mejora sobre el modelo base en ninguna tarea.
- Riesgo de alucinación: inherente a los modelos de 1,5B y acentuado en razonamiento matemático sin verificación externa.
- Sesgos: no documentados; al entrenarse solo en inglés y sobre datos de matemáticas/razonamiento, puede presentar sesgos de dominio y de idioma.
- Contexto: la ventana de referencia de 10752 tokens del run no equivale necesariamente a la longitud de contexto soportada en inferencia; hay que verificarla empíricamente.
- Producción: no recomendado por falta de licencia, evaluación, model card y mantenimiento (cero descargas, actualización única).
- Repositorio de investigación: sin garantías de soporte, sin demos y sin datasets de evaluación asociados.

## Enlaces

- Hugging Face: https://huggingface.co/ahmedselhady/XSDPO-Nemotron-1.5B-300x5-lr3e-6-kl0.001-full-ref10752-k512-frozen-en_only-alpha1-step-150
- Modelo base: https://huggingface.co/nvidia/Nemotron-Research-Reasoning-Qwen-1.5B
- Paper o blog de SDPO: no disponible en la información proporcionada
- Repositorio de código del run: no disponible en la información proporcionada
- Demo: no disponible en la información proporcionada
