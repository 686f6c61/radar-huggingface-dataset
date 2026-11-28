# joamCriff123/zils-lite-l1128b

## Resumen

zils-lite-l1128b es un modelo de decisión (decision-model) publicado por el usuario joamCriff123 en Hugging Face, construido como un ajuste fino del modelo base Qwen/Qwen3.5-0.8B. Forma parte de la familia d3-lite y está orientado al "lite pool" de la subnet 127 de Zils, un contexto de despliegue que sugiere su uso como componente de toma de decisiones dentro de una infraestructura de subred distribuida. El modelo cuenta con 852.985.920 parámetros reales según los pesos en safetensors y un repositorio de 1,7 GB.

La relevancia de esta ficha es limitada por la escasez de documentación: la model card pública es mínima y no detalla datos de entrenamiento, composición del dataset ni metodología de ajuste. Se trata, por tanto, de un modelo pequeño (por debajo de los 1.000 millones de parámetros) derivado de la arquitectura Qwen3.5, lo que lo sitúa en la categoría de modelos ligeros aptos para inferencia en hardware modesto.

A fecha de creación (27 de noviembre de 2026) el modelo no registra descargas ni interacciones, y su pipeline declarado es feature-extraction, aunque las etiquetas incluyen decision-model. Cualquier evaluación práctica debe considerar que la información disponible es insuficiente para validar su calidad o comportamiento en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5, segun el tag `qwen3_5`); detalles internos no disponibles |
| Parametros totales | 852.985.920 |
| Parametros activos | no disponible (no se declara que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se listan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria transformers, con `custom_code`) |

## Arquitectura y entrenamiento

El modelo se presenta como un ajuste fino (tag `base_model:finetune`) del Qwen/Qwen3.5-0.8B, por lo que hereda la arquitectura transformer de la familia Qwen3.5, si bien la model card no especifica la configuración exacta de capas, cabezas de atención ni mecanismos internos. El tag `qwen3_5` y la presencia de `custom_code` indican que la carga requiere código personalizado incluido en el repositorio, lo que implica que no es un transformer estándar cargable únicamente con `AutoModel` sin confiar en código remoto.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de alineación como RLHF, DPO o SFT supervisado. La model card únicamente indica que se trata de un "d3-lite decision body" para el lite pool de la subnet 127 de Zils, sin detallar la innovación técnica ni el proceso de ajuste. Tampoco se documentan técnicas como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto y modelado de lenguaje, heredadas del modelo base Qwen3.5-0.8B (no verificadas de forma independiente).
- Toma de decisiones (decision-model), que es el propósito declarado del ajuste.
- Extracción de características (feature-extraction), pipeline declarado en la ficha de Hugging Face.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (no se declaran idiomas).
- Capacidades especiales (thinking mode, visión, audio): no disponible.

## Casos de uso

- Clasificación y enrutamiento de decisiones en pipelines de subred: el modelo está etiquetado como decision-model para el lite pool de Zils, por lo que su uso natural es la selección o puntuación de opciones dentro de un flujo automatizado de la subnet 127.
- Extracción de embeddings o características: al declarar el pipeline feature-extraction, puede emplearse para generar representaciones vectoriales de texto en tareas de recuperación o clustering, siempre que se valide su calidad con el código personalizado del repositorio.
- Prototipado rápido en local: con menos de 1.000 millones de parámetros y pesos en safetensors de 1,7 GB, es viable cargarlo en una GPU de consumo para experimentación.
- Filtrado previo en pipelines de datos: como modelo ligero, puede actuar como primera etapa de clasificación o descarte antes de invocar modelos mayores.
- Evaluación comparativa de ajustes finos: sirve como referencia para estudiar cómo se comporta un fine-tune pequeño sobre Qwen3.5-0.8B en tareas de decisión.
- Integración en sistemas de agentes como componente de decisión de bajo coste: su tamaño reducido permite desplegarlo junto a modelos mayores como módulo especializado, aunque su rendimiento real no está documentado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 1,7 GB de pesos más overhead de activaciones y KV cache, en torno a 2-3 GB según longitud de secuencia.
- VRAM estimada en cuantización de 8 bits: alrededor de 1 GB de pesos.
- VRAM estimada en cuantización de 4 bits: alrededor de 0,5 GB de pesos (requiere convertir los pesos, ya que no se publican variantes GGUF).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para fp16; RTX 3060, RTX 4060, RTX 4090, A100 o H100 son suficientes y sobradas para este tamaño.
- Cabe en GPU de consumo: sí, en la práctica totalidad de GPU consumer modernas (GTX 1660 6 GB en adelante).
- Opciones de despliegue: transformers con `trust_remote_code=True` (obligatorio por el `custom_code`); vLLM, llama.cpp, Ollama o TGI solo si se generan conversiones compatibles, no disponibles en el repositorio.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| zils-lite-l1128b | 852.985.920 | no disponible | apache-2.0 | Hugging Face, 0 descargas |
| Qwen/Qwen3.5-0.8B (base) | ~0,8 B | no disponible | no disponible en la informacion | Hugging Face (modelo base) |
| Alternativas de ~1 B de propósito general | no disponible | no disponible | no disponible | no disponible |

La comparación con terceros no puede completarse con rigor porque no se dispone de datos de rendimiento del modelo ni de especificaciones verificadas de alternativas en la información proporcionada.

## Limitaciones y advertencias

- Documentación mínima: la model card no describe datos de entrenamiento, evaluación ni comportamiento esperado, lo que impide validar su calidad.
- Riesgo de alucinación: inherente a los modelos de lenguaje de este tamaño; no hay evaluación publicada que lo cuantifique.
- Sesgos conocidos: no documentados; al derivar de Qwen3.5-0.8B, podría heredar sesgos del modelo base, pero no se aporta evidencia.
- Idiomas: no se declaran idiomas soportados, por lo que el soporte multilingüe es desconocido.
- Código personalizado: el tag `custom_code` obliga a ejecutar código remoto del repositorio con `trust_remote_code=True`, lo que supone un riesgo de seguridad que debe auditarse antes de usarlo en producción.
- Licencia: apache-2.0 permite uso comercial, pero la model card remite a LICENSE y NOTICE para atribuciones de terceros que deben revisarse.
- Madurez: 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso comunitario ni mantenimiento.
- Contexto: se desconoce la longitud de contexto efectiva, lo que limita el diseño de aplicaciones que dependan de ventanas largas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/joamCriff123/zils-lite-l1128b
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
