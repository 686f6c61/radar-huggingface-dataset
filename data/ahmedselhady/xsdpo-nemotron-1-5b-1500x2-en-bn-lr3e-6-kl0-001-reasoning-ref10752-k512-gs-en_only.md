# ahmedselhady/XSDPO-Nemotron-1.5B-1500x2-en-bn-lr3e-6-kl0.001-reasoning-ref10752-k512-gs-en_only

## Resumen

XSDPO-Nemotron-1.5B es un ajuste fino (fine-tune) del modelo de razonamiento Nemotron-Research-Reasoning-Qwen-1.5B de NVIDIA, publicado por el usuario ahmedselhady en Hugging Face. Se trata de un checkpoint experimental derivado de una ejecución de entrenamiento con SDPO (una variante de optimización de política directa, DPO, aplicada al razonamiento), identificada en el nombre del repositorio como `macereason-math-1500x2-en-bn-nemotron-1.5b-lr3e-6-kl0.001-reasoning-ref10752-k512-gs-en_only`. El modelo conserva la arquitectura Qwen2 del modelo base, con 1.777.088.000 parámetros totales según los pesos en safetensors.

El propósito declarado es el ajuste del comportamiento de razonamiento del modelo base mediante preferencias, con una configuración concreta: 1500 pasos dobles (1500x2), tasa de aprendizaje 3e-6, coeficiente KL de 0.001, referencia de 10752 tokens y truncado k=512. El sufijo `en_only` sugiere que el ajuste se realizó únicamente con datos en inglés, aunque esto no está confirmado en la model card.

La relevancia de esta ficha es limitada: se trata de un artefacto de investigación con cero descargas y cero likes en el momento de la consulta, sin model card descriptiva más allá de la referencia al run de entrenamiento, sin licencia declarada y sin datos de evaluación publicados. Es útil como referencia para quienes reproducen experimentos de SDPO sobre modelos pequeños de razonamiento, pero no como modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen2 (transformer decoder-only), heredada del modelo base |
| Parametros totales | 1.777.088.000 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el run usa referencia de 10752 tokens y k=512, pero no se especifica la ventana final) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan GGUF ni otras variantes) |
| Idiomas soportados | no disponible (el sufijo `en_only` sugiere entrenamiento solo en inglés, sin confirmación) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de la familia Qwen2, con 1.777 millones de parámetros, heredado directamente de nvidia/Nemotron-Research-Reasoning-Qwen-1.5B. No se documentan cambios arquitectónicos respecto al base: el ajuste es de alineación de preferencias, no estructural.

El entrenamiento se realizó mediante SDPO (una variante de DPO orientada a razonamiento) según el identificador del run: `macereason-math-1500x2-en-bn-nemotron-1.5b-lr3e-6-kl0.001-reasoning-ref10752-k512-gs-en_only`. Los hiperparámetros inferibles del nombre son: 1500 pasos con factor x2 (probablemente dos muestras por prompt), learning rate 3e-6, coeficiente KL 0.001, longitud de referencia 10752 tokens y truncado k=512. El sufijo `en_only` indica que los datos de preferencia eran solo en inglés; `en-bn` en el nombre del run sugiere una mezcla inglés-bengalí en alguna fase, pero no está aclarado. No se especifica el número de tokens de entrenamiento ni la composición exacta del dataset. El repositorio contiene el checkpoint del paso 200, y la rama principal apunta al último paso publicado; se puede cargar un paso concreto con `revision="step-200"`.

## Capacidades

- Generación de texto y razonamiento multi-paso, heredados del modelo base Nemotron-Research-Reasoning-Qwen-1.5B.
- Razonamiento matemático y de tipo cadena de pensamiento (el run se etiqueta como `reasoning` y `math`).
- Generación conversacional (pipeline `text-generation`, tag `conversational`).
- Compatibilidad con text-generation-inference y endpoints compatibles según los tags del repositorio.
- Soporte de tool calling / function calling: no disponible (no documentado).
- Soporte de agentes: no disponible (no documentado).
- Capacidades multilingües: no disponible; el sufijo `en_only` apunta a un ajuste solo en inglés.
- Capacidades especiales (visión, audio, thinking mode explícito): no disponible.

## Casos de uso

- Reproducción de experimentos de SDPO: el checkpoint permite comparar el efecto del ajuste de preferencias sobre el modelo base Nemotron-Research-Reasoning-Qwen-1.5B en tareas de matemáticas y razonamiento, cargando pasos concretos con `revision="step-200"`.
- Investigación en alineación de modelos pequeños: sirve para estudiar cómo afectan hiperparámetros como el coeficiente KL 0.001 o el truncado k=512 al comportamiento de razonamiento de un modelo de 1.5B.
- Evaluación de la degradación por ajuste solo en inglés: al ser un run `en_only`, permite medir la pérdida de capacidades multilingües respecto al base, útil para quienes diseñan mezclas de datos.
- Generación de cadenas de razonamiento en entornos de bajo recursos: con 1.777 millones de parámetros, el modelo puede ejecutarse en una GPU de consumo para prototipos de razonamiento matemático, siempre que se cuantice adecuadamente.
- Base para nuevos fine-tunes: al ser un checkpoint intermedio de un run de preferencias, puede servir como punto de partida para experimentos posteriores de DPO o RLHF sobre dominios específicos.
- Docencia y divulgación: ejemplo práctico de cómo se nombran y publican runs de entrenamiento con hiperparámetros embebidos en el identificador, útil para enseñar trazabilidad de experimentos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 1.777 millones de parámetros en fp16, aproximadamente 3.5 GB de pesos; en fp32, unos 7.1 GB; en cuantización de 8 bits, en torno a 1.8 GB; en 4 bits, alrededor de 1 GB (estimaciones teóricas, no verificadas para este checkpoint).
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para fp16; RTX 3060, RTX 4060, RTX 4090, A100 o H100 son suficientes. El modelo cabe holgadamente en GPUs de consumo.
- Cabe en GPU de consumo: sí, en la mayoría de tarjetas con 8 GB o más en fp16, y en tarjetas de 4-6 GB con cuantización.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag `text-generation-inference`), endpoints compatibles; llama.cpp, Ollama o vLLM no están documentados para este checkpoint, aunque al ser Qwen2 podrían funcionar con conversión previa.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| XSDPO-Nemotron-1.5B (este) | 1.777 M | no disponible | no disponible | Hugging Face, checkpoint paso 200 |
| nvidia/Nemotron-Research-Reasoning-Qwen-1.5B | ~1.5 B (según nombre) | no disponible | no disponible | Hugging Face, modelo base |
| Qwen2.5-1.5B-Instruct | ~1.5 B | 32 768 tokens (típico de la familia Qwen2.5) | Apache 2.0 (típico) | Hugging Face, ampliamente desplegado |
| DeepSeek-R1-Distill-Qwen-1.5B | ~1.5 B | 32 768 tokens (típico) | MIT (típico) | Hugging Face, muy popular para razonamiento |

Los datos de Qwen2.5-1.5B-Instruct y DeepSeek-R1-Distill-Qwen-1.5B son de referencia general de la familia y no provienen de la información proporcionada; verifíquense antes de usarlos en una comparación formal. Para este checkpoint no hay benchmarks ni licencia declarada, lo que limita cualquier comparación cuantitativa.

## Limitaciones y advertencias

- Sin licencia declarada: no se puede asumir uso comercial permitido; es necesario contactar con el autor o consultar el modelo base.
- Sin model card descriptiva: solo se indica el run de entrenamiento y el paso 200; no hay información sobre datos, evaluación ni limitaciones.
- Riesgo de alucinación: inherente a los modelos de 1.5B, especialmente en razonamiento matemático fuera de distribución.
- Sesgos: no documentados; al entrenarse solo en inglés (`en_only`), es probable que el rendimiento en otros idiomas sea deficiente.
- Contexto: no se especifica la ventana final; el valor de referencia 10752 tokens del run no equivale necesariamente a la longitud de contexto soportada en inferencia.
- Checkpoint intermedio: el paso 200 puede no ser el óptimo del run; conviene explorar otras revisiones etiquetadas.
- Cero descargas y cero likes: sin validación comunitaria; no hay evidencia de que el ajuste mejore al modelo base.
- Repositorio de 14.2 GB para 1.777 millones de parámetros: sugiere que se almacenan múltiples checkpoints o pesos en precisión alta; verificar el espacio antes de descargar.

## Enlaces

- Hugging Face: https://huggingface.co/ahmedselhady/XSDPO-Nemotron-1.5B-1500x2-en-bn-lr3e-6-kl0.001-reasoning-ref10752-k512-gs-en_only
- Modelo base: https://huggingface.co/nvidia/Nemotron-Research-Reasoning-Qwen-1.5B
- Perfil del autor: https://huggingface.co/ahmedselhady
