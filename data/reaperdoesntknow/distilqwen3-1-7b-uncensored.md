# reaperdoesntknow/DistilQwen3-1.7B-uncensored

## Resumen

DistilQwen3-1.7B-uncensored es un ajuste fino por supervisión (SFT) del modelo reaperdoesntknow/Qwen3-1.7B-Distilled-30B-A3B, que a su vez es un destilado de un modelo mayor de tipo MoE (etiquetado como 30B-A3B en el nombre del repositorio). Lo publica el usuario reaperdoesntknow bajo el paraguas de "Convergent Intelligence LLC: Research Division", dentro de una serie denominada DistilQwen3. El modelo se presenta como una variante "uncensored", es decir, entrenada para reducir los rechazos ante peticiones que los modelos alineados convencionalmente bloquearían, y está pensado para despliegue en el borde (edge) por su reducido tamaño.

El modelo tiene 2.031.739.904 parámetros totales según los pesos en safetensors, lo que lo sitúa en la categoría de aproximadamente 2.000 millones de parámetros, coherente con la familia Qwen3-1.7B sobre la que se construye. El repositorio ocupa 4,1 GB, lo que sugiere pesos en precisión de 16 bits. La librería declarada es transformers y las etiquetas incluyen trl, sft, distillation, knowledge-distillation, convergentintel y edge, además de text-generation-inference y endpoints_compatible.

La relevancia del modelo es acotada: se trata de un ajuste comunitario sin model card sustantiva (la tarjeta es la plantilla automática de Hugging Face, con la mayoría de campos como "[More Information Needed]"), sin licencia declarada y sin idiomas especificados. Su interés principal reside en el pipeline de destilación en cadena y en la propuesta "uncensored" para entornos de investigación donde se prioriza la ausencia de rechazos sobre la alineación de seguridad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de la familia Qwen3; detalles no disponibles) |
| Parametros totales | 2.031.739.904 |
| Parametros activos | no disponible (el modelo base se etiqueta como 30B-A3B, pero este checkpoint es denso de ~2B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors; no se documentan GGUF ni otras variantes) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Libreria | transformers |
| Tamano del repositorio | 4,1 GB |
| Modelo base | reaperdoesntknow/Qwen3-1.7B-Distilled-30B-A3B |
| Descargas | 2.028 |
| Likes | 0 |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del checkpoint. Por el nombre y el modelo base se infiere una arquitectura transformer decoder-only de la familia Qwen3 con aproximadamente 2.000 millones de parametros, pero el autor no documenta numero de capas, dimensiones ocultas, mecanismo de atencion ni longitud de contexto nativa. El modelo base se denomina "Qwen3-1.7B-Distilled-30B-A3B", lo que sugiere una destilacion de conocimiento desde un modelo mayor de tipo mixture-of-experts (30B totales, 3B activos) hacia un modelo denso pequeno; sin embargo, no se aportan detalles sobre el proceso de destilacion, el numero de tokens de entrenamiento ni la composicion del dataset.

El entrenamiento de este checkpoint concreto se realizo mediante SFT con la libreria TRL, segun las etiquetas del repositorio. No hay informacion sobre hiperparametros, regimen de precision (fp16, bf16, fp32), datos de alineacion (RLHF, DPO) ni proceso de filtrado del corpus. La model card incluye una seccion teorica sobre "Discrepancy Calculus (DISC)" y la "Mesh Fundamental Identity", un marco matematico propio del autor que descompone la distribucion del profesor en componentes suaves, de salto y de Cantor; se trata de una descripcion conceptual sin resultados empiricos asociados en la informacion disponible.

## Capacidades

- Generacion de texto conversacional: el modelo esta etiquetado como "conversational" y orientado a text-generation.
- Razonamiento y codigo: capacidades heredadas de la familia Qwen3, aunque no se documentan evaluaciones especificas para este checkpoint.
- Modo "uncensored": el ajuste busca reducir los rechazos ante peticiones que otros modelos alineados bloquearian; no se especifica la metodologia exacta.
- Destilacion de conocimiento: el pipeline incorpora etiquetas de distillation y knowledge-distillation, orientadas a transferir capacidades del modelo profesor al estudiante.
- Despliegue en el borde: la etiqueta "edge" indica que el modelo esta pensado para entornos con recursos limitados.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible; no se declaran idiomas.
- Vision, audio u otras modalidades: no disponible; el pipeline es exclusivamente text-generation.

## Casos de uso

- Generacion de texto en dispositivos de borde: con aproximadamente 2.000 millones de parametros y pesos de 4,1 GB, el modelo puede ejecutarse en portatiles y mini-PC con GPU integrada o modesta, lo que lo hace adecuado para asistentes locales sin conexion.
- Prototipado rapido de chatbots conversacionales: su naturaleza conversacional y su tamano reducido permiten iterar sobre prompts y flujos de dialogo en entornos de desarrollo con recursos limitados.
- Investigacion sobre destilacion de conocimiento: el modelo forma parte de una cadena de destilacion documentada (30B-A3B a 1.7B y despues SFT), lo que lo convierte en un caso de estudio para analizar la transferencia de capacidades entre modelos de distinto tamano.
- Experimentacion con modelos "uncensored": util para investigadores que estudian el comportamiento de modelos sin alineacion de seguridad convencional, siempre en entornos controlados y con las salvaguardas adecuadas.
- Fine-tuning posterior como base: al ser un checkpoint SFT pequeno y con licencia no declarada, puede servir como punto de partida para ajustes especificos de dominio, aunque la ambiguedad legal limita su uso comercial.
- Evaluacion comparativa de pipelines de destilacion: permite contrastar el rendimiento de un estudiante denso de ~2B frente a su profesor MoE de 30B-A3B en tareas de generacion de texto.
- Despliegue en entornos con restricciones de memoria: al ocupar 4,1 GB en safetensors, cabe en GPUs de consumo con 8 GB o mas, aunque no se documentan variantes cuantizadas oficiales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 4-5 GB solo para los pesos, mas overhead de activaciones y cache KV; en la practica, se recomienda al menos 6-8 GB de VRAM.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 2-3 GB para los pesos; en 4 bits, aproximadamente 1,5-2 GB. No se publican variantes GGUF oficiales, por lo que la cuantizacion requeriria conversion propia.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090, A100 y H100 para despliegues de mayor throughput; tambien cabe en GPUs de 8 GB con cuantizacion.
- Cabe en GPU de consumo: si, en modelos con 8 GB o mas en fp16, y en GPUs de 4-6 GB con cuantizacion.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (etiqueta tgi), endpoints compatibles (etiqueta endpoints_compatible); vLLM, llama.cpp y Ollama no estan documentados oficialmente para este checkpoint, aunque al ser un modelo transformers estandar deberian poder adaptarse.
- Latencia y throughput estimados: no disponibles; no se publican mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| DistilQwen3-1.7B-uncensored | ~2,03B | no disponible | no disponible | Hugging Face | SFT sobre un destilado de Qwen3; variante uncensored |
| Qwen3-1.7B (original) | ~1,7B | no disponible en esta ficha | Apache 2.0 (segun la familia Qwen3) | Hugging Face | Modelo base de referencia de la familia |
| Qwen2.5-1.5B-Instruct | ~1,5B | 32.768 tokens (segun la familia Qwen2.5) | Apache 2.0 | Hugging Face | Alternativa densa pequena con licencia permisiva |
| Llama 3.2 1B Instruct | ~1,2B | 128.000 tokens (segun la familia Llama 3.2) | Llama 3.2 Community License | Hugging Face | Alternativa con contexto largo y licencia con restricciones |

La comparativa se limita a parametros y disponibilidad porque no hay datos de rendimiento publicados para este checkpoint. La principal diferencia frente a las alternativas es la ausencia de licencia declarada y de idiomas soportados, lo que complica su adopcion en produccion frente a modelos con licencias permisivas.

## Limitaciones y advertencias

- Licencia no declarada: no se especifica la licencia, lo que impide determinar si el uso comercial esta permitido; en la practica, esto bloquea su adopcion en produccion sin aclaracion legal.
- Idiomas no declarados: no se documenta que idiomas soporta el modelo; el rendimiento en castellano es desconocido.
- Model card practicamente vacia: la mayoria de secciones de la tarjeta son la plantilla automatica de Hugging Face con "[More Information Needed]", sin datos de entrenamiento, evaluacion ni uso previsto.
- Riesgo de alucinacion: al ser un modelo de ~2B parametros, la tasa de alucinacion tiende a ser mayor que en modelos mayores; no hay evaluaciones que lo cuantifiquen.
- Variante "uncensored": la reduccion de rechazos implica un mayor riesgo de generar contenido danino, sesgado o inexacto; requiere salvaguardas externas en cualquier despliegue.
- Sesgos conocidos: no documentados; se heredan los del modelo base y los del corpus de SFT, que no se describe.
- Limitaciones de contexto: la longitud de contexto no esta documentada, por lo que no se puede garantizar el manejo de conversaciones largas o documentos extensos.
- Procedencia del pipeline de destilacion: la cadena de destilacion y el marco "Discrepancy Calculus" no cuentan con validacion empirica publicada en la informacion disponible.
- Sin soporte comunitario: 0 likes y un unico autor sin documentacion de mantenimiento; el riesgo de abandono del proyecto es alto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/reaperdoesntknow/DistilQwen3-1.7B-uncensored
- Modelo base: https://huggingface.co/reaperdoesntknow/Qwen3-1.7B-Distilled-30B-A3B
- Perfil del autor: https://huggingface.co/reaperdoesntknow
- Paper citado en la model card (Lacoste et al., 2019, sobre impacto ambiental): https://arxiv.org/abs/1910.09700
- Calculadora de impacto ambiental ML: https://ml2co2.github.io/impact
