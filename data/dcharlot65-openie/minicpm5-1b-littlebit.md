# dcharlot65-openie/MiniCPM5-1B-LittleBit

## Resumen

MiniCPM5-1B-LittleBit es una adaptación del modelo base openbmb/MiniCPM5-1B, desarrollada por el usuario dcharlot65-openie, que aplica una técnica de compresión extrema denominada LittleBit-2 combinada con Sakana SVF para producir un checkpoint de "living weights" en formato .jsyn. El modelo no se distribuye como pesos convencionales (safetensors o GGUF), sino como un artefacto pre-factorizado destinado al runtime JouleDB, una base de datos termodinámica con inferencia sin PyTorch y despliegue nativo en Kubernetes (JouleKube).

La propuesta central es la compresión sub-1-bit: el checkpoint declara 1.080.632.832 parámetros totales (equivalentes a 2061,14 MB en FP16) comprimidos a 8,88 MB en formato .jsyn con compresión zstd y CRC32, lo que supone una ratio de compresión de 232,02x y un promedio de 0,0330 bits por peso (BPW). Esta cifra es tres órdenes de magnitud inferior a las cuantizaciones habituales de 4 u 8 bits, lo que sitúa al modelo en una categoría experimental de compresión agresiva con pérdida.

El modelo hereda la arquitectura y capacidades del MiniCPM5-1B original de OpenBMB, pero su relevancia práctica está condicionada por el ecosistema JouleDB: no es un modelo utilizable con transformers, llama.cpp o vLLM de forma directa, sino un artefacto para un runtime específico. La licencia Apache 2.0 del modelo base se mantiene, lo que facilita su uso comercial dentro de las condiciones de dicha licencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (heredada de openbmb/MiniCPM5-1B); pesos pre-factorizados LittleBit-2 + Sakana SVF en formato .jsyn |
| Parametros totales | 1.080.632.832 |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | sub-1-bit (0,0330 BPW promedio); 170 tensores 2D en bitplanes y 49 vectores 1D (LayerNorm, bias, depthwise) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | .jsyn (JouleDB, zstd + CRC32); no se distribuyen safetensors ni GGUF |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo base openbmb/MiniCPM5-1B, un transformer de aproximadamente 1.080 millones de parámetros. Sobre esa base, el checkpoint aplica una factorización LittleBit-2 (representación en bitplanes de tensores 2D) combinada con Sakana SVF (singular value factorization), generando 170 tensores 2D en formato bitplane y 49 vectores 1D para LayerNorm, bias y convoluciones depthwise. El resultado se serializa en el formato .jsyn de JouleDB con compresión zstd y verificación CRC32.

No se dispone de información sobre el dataset de entrenamiento, el número de tokens, la composición de los datos ni si hubo etapas de RLHF, DPO o ajuste fino adicional. La model card no documenta el proceso de factorización (número de componentes SVF, rangos, criterio de truncamiento) ni el procedimiento de calibración empleado para preservar la funcionalidad del modelo original tras la compresión sub-1-bit. Tampoco se especifica si el checkpoint fue validado contra el modelo base en tareas de evaluación.

## Capacidades

- Generación de texto y razonamiento: heredadas teóricamente del MiniCPM5-1B base, aunque la compresión sub-1-bit hace incierta la preservación de estas capacidades; no hay evaluaciones publicadas que lo confirmen.
- Código y matemáticas: presumiblemente presentes en el modelo base, sin verificación documentada tras la compresión.
- Tool calling / function calling: no documentado en la información disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: no documentadas (idiomas no disponibles).
- Capacidades especiales (thinking mode, visión, audio): no documentadas.
- Integración con JouleDB: carga mediante `hf_pull` y ejecución en el runtime JouleDB sin PyTorch, con despliegue nativo en Kubernetes a través de JouleKube.

## Casos de uso

- Despliegue en entornos Kubernetes con restricciones extremas de almacenamiento: el checkpoint de 8,88 MB permite distribuir el modelo en clústeres con imágenes de contenedor mínimas, usando JouleKube como sustrato de agentes.
- Inferencia en dispositivos edge con memoria y disco muy limitados: la compresión de 232x reduce el footprint del artefacto, aunque el runtime JouleDB debe estar disponible en el dispositivo.
- Experimentación en investigación sobre compresión sub-1-bit: el checkpoint sirve como caso de estudio para evaluar la viabilidad de representaciones LittleBit-2 + SVF en modelos de ~1B parámetros.
- Pruebas de concepto de bases de datos termodinámicas con inferencia integrada: JouleDB combina almacenamiento y ejecución de modelos, y este artefacto permite validar el flujo `hf_pull` + `serve`.
- Distribución de modelos en pipelines de CI/CD con artefactos pequeños: el tamaño de 8,88 MB facilita versionado y cacheado en registros de artefactos.
- Evaluación comparativa de runtimes sin PyTorch: permite medir latencia y throughput del runtime JouleDB frente a alternativas convencionales, siempre que se disponga de una GPU o CPU compatible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye evaluaciones de MMLU, HumanEval, GSM8K ni métricas de perplejidad, ni comparaciones con el modelo base openbmb/MiniCPM5-1B para cuantificar la degradación introducida por la compresión sub-1-bit.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El checkpoint comprimido ocupa 8,88 MB, pero la VRAM necesaria depende de la expansión en memoria que realice el runtime JouleDB al descomprimir y factorizar los pesos.
- GPU recomendadas: no disponible. No se documenta compatibilidad con A100, H100, RTX 4090 ni otras GPU.
- Viabilidad en GPU de consumo: no disponible; depende del soporte del runtime JouleDB.
- Opciones de despliegue: exclusivamente JouleDB v0.2.4 o superior (`cargo binstall jouledb`, `jouledb serve --http-addr 127.0.0.1:8080`). No compatible de forma documentada con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Runtime |
|---|---|---|---|---|---|
| MiniCPM5-1B-LittleBit | 1.080.632.832 | no disponible | .jsyn (sub-1-bit, 0,033 BPW) | Apache 2.0 | JouleDB |
| openbmb/MiniCPM5-1B (base) | ~1B | no disponible | safetensors | Apache 2.0 | transformers, vLLM, llama.cpp |
| Otros modelos ~1B (p. ej. Qwen, Llama) | ~1B | no disponible | safetensors, GGUF | variables | múltiples |

La comparación directa con alternativas de la misma categoría no está disponible en la información proporcionada. La diferencia principal frente al modelo base es el formato y la compresión, no la arquitectura ni el tamaño nominal de parámetros.

## Limitaciones y advertencias

- Compresión sub-1-bit con pérdida: 0,0330 BPW implica una representación extremadamente agresiva; la degradación de calidad respecto al modelo base no está cuantificada y podría ser severa.
- Sin benchmarks publicados: no hay evidencia de que el modelo conserve capacidades de generación, razonamiento o código tras la factorización.
- Dependencia total del runtime JouleDB: no es utilizable con herramientas estándar del ecosistema (transformers, llama.cpp, vLLM, Ollama). Requiere JouleDB v0.2.4+.
- Idiomas no documentados: se desconoce el soporte multilingüe real del checkpoint.
- Riesgo de alucinación: no evaluado; la compresión podría amplificar comportamientos erráticos.
- Sesgos: no documentados; se heredan potencialmente los del modelo base, sin análisis específico.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías sobre el comportamiento del checkpoint comprimido.
- Repositorio sin descargas ni likes y con tamaño de 0.0 GB reportado: la disponibilidad efectiva de los pesos y su integridad deben verificarse antes de su uso en producción.
- Fecha de creación futura (2026-11-24): metadato atípico que conviene contrastar con el autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dcharlot65-openie/MiniCPM5-1B-LittleBit
- Modelo base: https://huggingface.co/openbmb/MiniCPM5-1B
- Repositorio JouleDB: https://github.com/openIE-dev/jouledb
