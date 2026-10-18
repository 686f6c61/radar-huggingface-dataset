# Echoo113/gemma-3-4b-it-tree_sequoia-STEER2.5-ft4.42

## Resumen

`Echoo113/gemma-3-4b-it-tree_sequoia-STEER2.5-ft4.42` es un ajuste fino (SFT) del modelo `google/gemma-3-4b-it` de Google DeepMind, publicado por el usuario Echoo113 en Hugging Face. Se trata de un derivado experimental de la familia Gemma 3, la generación de modelos abiertos de Google presentada en marzo de 2025, cuyo objetivo declarado es poder ejecutarse en una sola GPU o TPU. El modelo conserva la arquitectura y el tokenizador del base, por lo que hereda su ventana de contexto y su naturaleza multimodal, aunque la model card no documenta ningún cambio estructural.

El repositorio tiene un carácter claramente exploratorio: cero descargas, cero likes, sin pipeline declarado, sin licencia especificada y sin datos sobre el conjunto de entrenamiento. La propia nomenclatura del nombre (`STEER2.5`, `ft4.42`) sugiere un barrido de hiperparámetros o de coeficientes de steering dentro de una serie de experimentos del mismo autor, que también ha publicado variantes como `gemma-3-4b-it-dragon-STEER1.6875-ft4.43`. No hay información pública que permita atribuirle una capacidad concreta más allá de la del modelo base.

Por tanto, esta ficha debe leerse como una evaluación del contenedor y del linaje del modelo, no de un artefacto validado. Es relevante ahora únicamente como objeto de estudio para quienes investigan ajustes finos de bajo coste sobre Gemma 3 4B o quieren reproducir la serie de experimentos del autor; no es un candidato razonable para producción sin una evaluación propia previa.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de la familia Gemma 3 (modelo base); multimodal texto-imagen en el base, no confirmado en el fine-tune |
| Parámetros totales | ~4 000 millones (heredados del modelo base `google/gemma-3-4b-it`); el autor no publica recuento propio |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 128 000 tokens en el modelo base; no confirmado para este fine-tune |
| Tipos de cuantizacion | no disponible en el repositorio (solo pesos safetensors); al derivar de Gemma 3 4B es cuantizable a GGUF, AWQ o GPTQ con herramientas externas |
| Idiomas soportados | no disponible en la model card; el modelo base Gemma 3 declara cobertura de más de 140 idiomas |
| Licencia | no disponible (la model card incluye un campo `licence: license` sin concretar; el modelo base se distribuye bajo los Gemma Terms of Use) |
| Formato de pesos | safetensors, compatible con `transformers` |

Nota: los datos de arquitectura, contexto e idiomas corresponden al modelo base `google/gemma-3-4b-it`, ya que la model card del ajuste fino no los detalla ni indica que se hayan modificado.

## Arquitectura y entrenamiento

El modelo es un ajuste fino supervisado (SFT) del checkpoint instruct de Gemma 3 de 4 000 millones de parámetros, realizado con la librería TRL 0.19.1 sobre Transformers 4.54.0, PyTorch 2.7.1, Datasets 3.6.0 y Tokenizers 0.21.1. La model card no especifica el número de tokens de entrenamiento, la composición del dataset, la longitud de secuencia, la tasa de aprendizaje, el número de épocas ni si se aplicaron etapas posteriores de preferencia (DPO, RLHF). Tampoco se documenta ninguna innovación técnica propia: no hay cambios declarados en atención, tokenizador ni decodificación.

El único dato objetivo sobre el alcance del entrenamiento es el tamaño del repositorio, 0,3 GB. Un checkpoint completo de 4 000 millones de parámetros en bf16 ocuparía aproximadamente 8 GB, de modo que ese tamaño es compatible con un adaptador LoRA, con pesos parciales o con una subida incompleta de los ficheros. Esta discrepancia debe resolverse inspeccionando el árbol de archivos antes de cualquier uso. La nomenclatura `STEER2.5` y `ft4.42` apunta a un experimento de barrido de hiperparámetros o de coeficientes de steering, coherente con las otras variantes publicadas por el mismo autor.

## Capacidades

- Generación de texto conversacional multi-turno, heredada del checkpoint instruct de Gemma 3 4B.
- Razonamiento y respuesta a instrucciones en formato chat, invocable mediante `pipeline("text-generation")` como muestra la model card.
- Capacidad multimodal de entrada de imagen potencialmente heredada del base (Gemma 3 4B es texto-imagen); no verificada en este fine-tune.
- Soporte multilingüe potencialmente heredado del base (más de 140 idiomas declarados por Google para Gemma 3); sin confirmación en este repositorio.
- Tool calling y function calling: el modelo base Gemma 3 no se distribuye con un formato de herramientas nativo validado; no disponible para este fine-tune.
- Capacidades de agente y razonamiento multi-paso: no documentadas ni evaluadas.
- Modo "thinking" o razonamiento extendido: no disponible.

## Casos de uso

- Investigación sobre SFT de bajo coste: utilizar el repositorio como referencia de configuración (TRL 0.19.1, Transformers 4.54.0) para reproducir un ajuste fino sobre Gemma 3 4B en una única GPU.
- Estudio de la serie de experimentos del autor: comparar esta variante `tree_sequoia-STEER2.5-ft4.42` con `dragon-STEER1.6875-ft4.43` para analizar el efecto de distintos coeficientes de steering sobre el mismo base.
- Prototipado de asistentes conversacionales en local: al derivar de un modelo de 4B, puede ejecutarse en una GPU de consumo para pruebas de concepto con contexto largo (hasta 128 000 tokens en el base), siempre que se valide primero la integridad de los pesos.
- Evaluación de olvido catastrófico: servir el modelo junto al base sin ajustar y medir la degradación en tareas estándar, un caso de uso típico cuando se desconoce el dataset de SFT.
- Generación de texto creativo y experimental: el nombre del repositorio sugiere una orientación hacia estilos o "personalidades" concretas, adecuada para exploración narrativa más que para tareas factuales.
- Docencia y divulgación: ejemplo práctico de cómo se publica un fine-tune con TRL y de los riesgos de publicar sin model card completa ni licencia.
- Despliegue en hardware limitado: cuantizado a 4 bits, un modelo de 4B ocupa del orden de 2,5 GB, lo que permite inferencia en GPUs de 8 GB para pruebas internas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye evaluaciones de MMLU, HumanEval, GSM8K ni de ningún otro conjunto, y el repositorio no enlaza a ningún informe técnico. Tampoco existen métricas de pérdida de validación ni curvas de entrenamiento publicadas.

## Requisitos de hardware

- VRAM estimada para inferencia (a partir de los 4 000 millones de parámetros del base, no de mediciones sobre este checkpoint): ~8 GB en bf16/fp16, ~4,5 GB en fp8, ~2,5-3 GB en cuantización de 4 bits (GGUF Q4_K_M o AWQ/GPTQ de 4 bits).
- GPU recomendadas: A100 40 GB u H100 para servicio concurrente con contexto largo; L40S o RTX 6000 Ada para despliegues de una sola tarjeta con contexto medio.
- GPU de consumo: cabe en RTX 4090 (24 GB) en bf16 con contexto moderado, y en RTX 4060 Ti, RTX 3060 de 12 GB o RTX 4070 (8-12 GB) si se cuantiza a 4 u 8 bits.
- La caché KV para 128 000 tokens exige VRAM adicional significativa; con atención de ventana deslizante en el base el coste es menor, pero conviene limitar `max_model_len` en producción.
- Opciones de despliegue: `transformers` (soporte declarado), vLLM y TGI para servir el checkpoint completo si los pesos están íntegros; llama.cpp u Ollama solo tras convertir a GGUF, paso no publicado por el autor.
- Latencia y throughput: no disponibles. No hay mediciones publicadas de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| `Echoo113/gemma-3-4b-it-tree_sequoia-STEER2.5-ft4.42` | ~4 000 M | 128 000 (heredado, no confirmado) | no disponible | Repositorio público, 0 descargas, sin pipeline declarado |
| `google/gemma-3-4b-it` (base) | ~4 000 M | 128 000 | Gemma Terms of Use | Público, ampliamente utilizado, soporte nativo en transformers, vLLM y llama.cpp |
| `meta-llama/Llama-3.2-3B-Instruct` | ~3 200 M | 128 000 | Llama 3.2 Community License | Público, ecosistema amplio |
| `microsoft/Phi-4-mini-instruct` | ~3 800 M | 128 000 | MIT | Público, orientado a razonamiento y matemáticas |
| `Qwen/Qwen2.5-3B-Instruct` | ~3 100 M | 32 768 | Apache 2.0 | Público, licencia permisiva |

Los datos de los modelos comparados corresponden a su documentación pública y no a evaluaciones realizadas para esta ficha. La diferencia práctica frente a todos ellos es que el modelo analizado no aporta benchmarks, licencia clara ni garantía de integridad de pesos, mientras que las alternativas sí ofrecen los tres elementos.

## Limitaciones y advertencias

- Ausencia total de datos de entrenamiento: se desconoce el dataset, el número de tokens, la composición lingüística y si hubo filtrado de datos personales o con derechos de autor.
- Sin benchmarks ni evaluación humana: no hay evidencia de que el ajuste fino mejore al base en ninguna tarea; puede haber degradado capacidades previas por olvido catastrófico.
- Licencia no especificada: la model card contiene un campo `licence: license` sin texto. El uso comercial queda bloqueado hasta que el autor aclare la licencia y se verifiquen los Gemma Terms of Use del modelo base, que imponen obligaciones de uso aceptable y atribución.
- Tamaño de repositorio anómalo (0,3 GB para un modelo de 4B): alta probabilidad de que sean pesos parciales o un adaptador. Verificar el árbol de ficheros y la presencia de `model.safetensors.index.json` antes de intentar cargarlo.
- Riesgo de alucinación estándar en modelos de 4B, agravado por la falta de evaluación y por la posible especialización hacia un estilo concreto derivada del steering.
- Idiomas no documentados: aunque el base cubre más de 140 idiomas, el SFT puede haber desplazado la distribución lingüística hacia el idioma del dataset, desconocido.
- Cero descargas y cero likes: el artefacto no ha sido reproducido ni validado por terceros; no hay issues ni discusión asociada.
- Nombre de repositorio con identificadores de experimento (`STEER2.5`, `ft4.42`): indica un artefacto de barrido, no una versión estable ni versionada semánticamente.
- Sin garantía de mantenimiento: no hay commits posteriores a la creación (18 de octubre de 2026) según los metadatos disponibles.

## Enlaces

- [Modelo en Hugging Face: Echoo113/gemma-3-4b-it-tree_sequoia-STEER2.5-ft4.42](https://huggingface.co/Echoo113/gemma-3-4b-it-tree_sequoia-STEER2.5-ft4.42)
- [Modelo base: google/gemma-3-4b-it](https://huggingface.co/google/gemma-3-4b-it)
- [Repositorio TRL (framework de entrenamiento)](https://github.com/huggingface/trl)
- [Página oficial de Gemma en Google DeepMind](https://deepmind.google/models/gemma/)
- [Página oficial de Gemma 3](https://deepmind.google/models/gemma/gemma-3/)
- [Gemma (language model) en Wikipedia](https://en.wikipedia.org/wiki/Gemma_(language_model))
- [Variante relacionada del mismo autor: gemma-3-4b-it-dragon-STEER1.6875-ft4.43](https://huggingface.co/Echoo113/gemma-3-4b-it-dragon-STEER1.6875-ft4.43)
- [Árbol de ficheros de la variante dragon-STEER1.6875-ft4.42](https://huggingface.co/Echoo113/gemma-3-4b-it-dragon-STEER1.6875-ft4.42/tree/main)
