# scottlowry/Qwen3.6-35B-A3B-oQ6e-mtp

## Resumen

Qwen3.6-35B-A3B-oQ6e-mtp es una cuantización mixta de precisión del modelo Qwen/Qwen3.6-35B-A3B, publicada por el usuario scottlowry. El modelo base es un transformer de tipo MoE (Mixture of Experts) desarrollado por el equipo Qwen (Alibaba), con 35.952 millones de parámetros totales y aproximadamente 3.000 millones de parámetros activos por token, según la nomenclatura A3B del identificador. La cuantización ha sido realizada con oQ (oMLX v0.7.4.dev1), una herramienta de cuantización de precisión mixta orientada al ecosistema MLX de Apple Silicon.

El resultado es un checkpoint de 30,4 GB en disco (28,3 GiB) con un promedio efectivo de 6,762 bits por peso, lo que lo hace viable en equipos con memoria unificada de 32 GB o superior. La distribución de bits no es uniforme: el 91,8% de los pesos usa affine 6-bit con grupo 64, mientras que una fracción pequeña (6,5%) sube a 8-bit y un 1,3% se mantiene en BF16, presumiblemente capas sensibles como embeddings o normas.

La relevancia de esta ficha radica en que es una de las pocas cuantizaciones publicadas de este modelo base en formato MLX, lo que permite ejecutar un MoE de 35B con activación de 3B en Macs con memoria unificada, algo que en BF16 requeriría aproximadamente 72 GB. El sufijo "mtp" indica que el checkpoint incluye la cabeza de Multi-Token Prediction, lo que habilita decodificación especulativa nativa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (qwen3_5_moe), con vision encoder y cabeza MTP |
| Parametros totales | 35.951.822.704 (35,952B) |
| Parametros activos | ~3B (según nomenclatura A3B del modelo base; no confirmado en la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Affine 6-bit grupo 64, affine 8-bit grupo 64 y 128, BF16 (mixta) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (MLX, librería mlx) |

## Arquitectura y entrenamiento

El modelo base Qwen3.6-35B-A3B emplea una arquitectura de mezcla de expertos (MoE) con atención estándar, según el tag `qwen3_5_moe`. El checkpoint cuantizado desglosa sus componentes en tres bloques: el modelo de lenguaje (34,661B de pesos lógicos, 26,813 GiB en disco), un codificador de visión (0,447B, 0,832 GiB) y una cabeza MTP de predicción multi-token (0,845B, 0,656 GiB). La presencia del módulo de visión confirma que el modelo base es multimodal, y la cabeza MTP permite decodificación especulativa integrada en el propio checkpoint.

La cuantización se realizó con oQ de oMLX v0.7.4.dev1, que aplica precisión mixta según la sensibilidad de cada tensor. La distribución resultante asigna 6-bit grupo 64 al grueso de los pesos (33,018B lógicos), 8-bit grupo 64 a 2,328B y 8-bit grupo 128 a 0,129B, dejando 0,478B en BF16. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO en el modelo base.

## Capacidades

- Generación de texto y razonamiento multi-turno, heredadas del modelo base Qwen3.6-35B-A3B.
- Procesamiento de imágenes: el checkpoint incluye un vision encoder de 0,447B de parámetros, por lo que soporta entrada multimodal.
- Decodificación especulativa mediante la cabeza MTP incluida (0,845B), que acelera la generación al predecir varios tokens por paso.
- Capacidades de código y matemáticas: no confirmadas explícitamente en la información disponible, pero esperables en la familia Qwen3.
- Tool calling y function calling: no confirmado en la información disponible.
- Soporte de agentes y razonamiento multi-paso: no confirmado en la información disponible.
- Capacidades multilingües: no disponible el listado de idiomas.

## Casos de uso

- Inferencia local en Apple Silicon: el checkpoint MLX de 28,3 GiB cabe en Macs con 32 GB de memoria unificada (M1/M2/M3/M4 Max o Ultra), permitiendo ejecutar un MoE de 35B en local sin GPU dedicada.
- Prototipado de asistentes multimodales: el vision encoder integrado permite construir demos de descripción de imágenes, OCR o VQA en un portátil Mac, sin depender de APIs externas.
- Aceleración de generación con MTP: la cabeza de predicción multi-token incluida permite implementar decodificación especulativa en pipelines de MLX, reduciendo la latencia por token en comparación con decodificación autorregresiva pura.
- Evaluación de cuantizaciones: sirve como referencia para comparar la pérdida de calidad de oQ 6,762 bits frente al modelo base en BF16, útil para investigadores que estudian el impacto de la cuantización mixta en MoE.
- Investigación en eficiencia de MoE: con ~3B parámetros activos sobre 35,952B totales, es adecuado para estudiar el trade-off entre activación dispersa y throughput en hardware de consumo.
- Despliegue en entornos con restricciones de conectividad: al ser un checkpoint autocontenido de 30,4 GB, puede distribuirse a estaciones de trabajo aisladas para tareas de generación y visión sin acceso a red.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: 28,3 GiB de pesos en disco; en inferencia se requiere espacio adicional para KV cache y activaciones, por lo que se recomienda un mínimo de 32 GB de memoria unificada.
- GPU recomendadas: Apple Silicon con memoria unificada de 32 GB o más (M1/M2/M3/M4 Max y Ultra). No es compatible de forma nativa con CUDA, ya que el formato es MLX.
- ¿Cabe en GPU de consumo? En el ecosistema Apple, sí: los chips Max de 32 GB o más pueden cargarlo. En GPUs NVIDIA de consumo (RTX 4090 con 24 GB) no cabe sin cuantización adicional, y además requeriría conversión desde MLX.
- Opciones de despliegue: MLX y mlx-lm son las vías nativas. No se indica compatibilidad con vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput: no disponible. La presencia de la cabeza MTP sugiere que el autor busca mejorar la velocidad de decodificación, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| scottlowry/Qwen3.6-35B-A3B-oQ6e-mtp | 35,952B | ~3B | no disponible | MLX safetensors 6,762 bits | no disponible | Hugging Face, 225 descargas |
| Qwen/Qwen3.6-35B-A3B (base) | 35,952B | ~3B | no disponible | safetensors BF16 | no disponible | Hugging Face |
| Otras cuantizaciones del mismo base | 35,952B | ~3B | no disponible | GGUF/MLX según autor | según autor | no disponible en esta búsqueda |

La comparativa se limita al modelo base y a variantes de cuantización del mismo, ya que no se dispone de datos de rendimiento ni de especificaciones de contexto para contrastar con alternativas de otros fabricantes.

## Limitaciones y advertencias

- La cuantización a 6,762 bits promedio introduce degradación respecto al BF16; las capas en 6-bit grupo 64 (91,8% de los pesos) son las más expuestas a pérdida de precisión.
- El formato MLX limita el despliegue a hardware Apple Silicon; no es portable a CUDA ni a CPUs x86 sin conversión.
- La licencia no está indicada en la información disponible, por lo que no puede confirmarse el uso comercial. Es imprescindible verificar la licencia del modelo base Qwen/Qwen3.6-35B-A3B antes de cualquier despliegue en producción.
- Riesgo de alucinación: inherente a los modelos generativos; no se han publicado evaluaciones específicas para esta cuantización.
- Sesgos: no disponible información sobre sesgos conocidos del modelo base ni del proceso de cuantización.
- Idiomas soportados: no disponible; no puede garantizarse cobertura multilingüe sin consultar la model card del base.
- El autor advierte que el checkpoint fue recuantizado el 2026-11-11 con oMLX v0.7.4.dev1 y recomienda volver a descargarlo si se obtuvo una copia anterior; versiones previas pueden diferir en calidad.
- Solo 225 descargas y 1 like en el momento de la consulta: es un checkpoint con validación comunitaria muy limitada.

## Enlaces

- Hugging Face: https://huggingface.co/scottlowry/Qwen3.6-35B-A3B-oQ6e-mtp
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Herramienta de cuantización oQ (oMLX): https://github.com/jundot/omlx
