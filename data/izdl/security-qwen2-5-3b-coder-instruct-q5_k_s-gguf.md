# Izdl/security-qwen2.5-3b-coder-instruct-Q5_K_S-GGUF

## Resumen

`Izdl/security-qwen2.5-3b-coder-instruct-Q5_K_S-GGUF` es una cuantización en formato GGUF del modelo `whywhywhywhy/security-qwen2.5-3b-coder-instruct`, un fine-tuning mediante LoRA orientado a la detección de vulnerabilidades y el análisis de código. El modelo original parte de la familia Qwen2.5-Coder-Instruct de 3.085.938.688 parámetros (aproximadamente 3,09 mil millones), y este repositorio lo distribuye en cuantización Q5_K_S con una matriz de importancia (imatrix), pensada para ejecución local con llama.cpp.

La relevancia del artefacto es práctica: empaqueta un modelo especializado en seguridad de aplicaciones en un único fichero de aproximadamente 2,2 GB, ejecutable en CPU o en GPU de consumo mediante llama.cpp, sin necesidad de infraestructura de servidor. Está etiquetado con `vulnerability-detection` y `code-analysis`, y fue entrenado sobre el dataset `your_username/cleaned-reposvul`, según declara el autor del fine-tuning.

Se trata, por tanto, de una pieza de la cadena de publicación (fine-tuning especializado y posterior cuantización comunitaria), no de un modelo con model card técnica propia: el repositorio remite explícitamente a la model card del modelo base para detalles de entrenamiento. La licencia declarada es Apache 2.0 y el único idioma soportado declarado es el inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen2.5-Coder-3B-Instruct); detalles especificos no disponibles en la informacion proporcionada |
| Parametros totales | 3.085.938.688 (segun safetensors del modelo base) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el ejemplo de servidor de la model card usa `-c 2048`) |
| Tipos de cuantizacion | Q5_K_S con imatrix (unica publicada en este repositorio) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (fichero `security-qwen2.5-3b-coder-instruct-q5_k_s-imat.gguf`) |

## Arquitectura y entrenamiento

El modelo subyacente es un transformer decoder-only de la familia Qwen2.5-Coder en su variante de 3B parámetros, ajustado con instrucciones. Sobre esa base, el autor `whywhywhywhy` aplicó un fine-tuning con LoRA (según las etiquetas del repositorio) especializado en detección de vulnerabilidades y análisis de código, empleando el dataset `your_username/cleaned-reposvul`. No se dispone de información sobre el número de tokens de entrenamiento, la composición exacta del dataset, ni si se aplicaron fases de RLHF o DPO.

La contribución de este repositorio concreto es la conversión a GGUF mediante el espacio `gguf-my-repo` de ggml.ai y la cuantización Q5_K_S con matriz de importancia (imatrix), una técnica que pondera los pesos según su relevancia estadística para preservar la calidad en precisiones reducidas. No se documentan innovaciones arquitectónicas adicionales (atención lineal, decodificación especulativa u otras) en la información disponible.

## Capacidades

- Generación de texto conversacional en inglés, con formato instructivo (etiqueta `conversational`).
- Análisis de código y detección de vulnerabilidades, objetivo declarado del fine-tuning.
- Razonamiento sobre fragmentos de código y repositorios, derivado de la base Qwen2.5-Coder.
- Generación y explicación de código en el contexto de revisión de seguridad.
- Ejecución local mediante llama.cpp (CLI y servidor HTTP compatible con endpoints).
- Capacidades de tool calling, agentes o razonamiento multi-paso: no disponibles de forma verificable en la información proporcionada para este fine-tuning concreto.
- Capacidades de visión o audio: no disponibles.
- Multilingüismo: limitado al inglés según la etiqueta `language: en`.

## Casos de uso

- Revisión de seguridad en pre-commit hooks: el modelo puede analizar diffs de código antes de integrarlos en la rama principal, señalando patrones asociados a vulnerabilidades, con un coste de inferencia bajo al ejecutarse en local.
- Triaje de hallazgos de SAST: usar el modelo para priorizar y explicar en lenguaje natural las alertas generadas por analizadores estáticos, reduciendo el ruido que llega al equipo de seguridad.
- Auditoría de dependencias y fragmentos de terceros: análisis de extractos de código copiados de repositorios externos para detectar construcciones inseguras antes de incorporarlos a producción.
- Formación y concienciación en seguridad: generación de explicaciones didácticas sobre por qué un fragmento de código es vulnerable y cómo corregirlo, en un entorno sin conexión.
- Asistente local para desarrolladores en entornos air-gapped: al ser un GGUF de 2,2 GB ejecutable con llama.cpp, puede desplegarse en estaciones de trabajo sin acceso a Internet ni envío de código a servicios externos.
- Automatización de revisiones en CI/CD: integración del servidor `llama-server` en pipelines para comentar pull requests con observaciones de seguridad, aprovechando la compatibilidad con endpoints declarada en las etiquetas.
- Análisis de código legacy: procesamiento por lotes de módulos antiguos para localizar APIs peligrosas y patrones de manejo de memoria o entrada de usuario.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el fichero GGUF Q5_K_S ocupa aproximadamente 2,2 GB, por lo que la inferencia completa cabe en torno a 2,5-3 GB de memoria considerando overhead de contexto y KV cache (estimación basada en el tamaño del repo; no confirmada por el autor).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM puede alojar el modelo completo; tarjetas como RTX 3050, RTX 4060, RTX 4090 o superiores lo ejecutan con holgura. En entornos de servidor, A100 o H100 lo ejecutan pero están sobredimensionadas para este tamaño.
- Cabe en GPU de consumo: sí, en la práctica totalidad de GPU discretas modernas con 4 GB o más de VRAM; también puede ejecutarse íntegramente en CPU.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server`), y por compatibilidad de formato GGUF, otros runners basados en llama.cpp como Ollama o LM Studio (no confirmado explícitamente por el autor).
- Latencia y throughput estimados: no disponibles en la información proporcionada. El ejemplo de la model card emplea una ventana de contexto de 2048 tokens (`-c 2048`).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Formato |
|---|---|---|---|---|---|
| Izdl/security-qwen2.5-3b-coder-instruct-Q5_K_S-GGUF | 3,09 B | no disponible | Deteccion de vulnerabilidades (LoRA) | Apache 2.0 | GGUF Q5_K_S |
| whywhywhywhy/security-qwen2.5-3b-coder-instruct | 3,09 B | no disponible | Deteccion de vulnerabilidades (LoRA) | Apache 2.0 | safetensors (presumible) |
| Qwen2.5-Coder-3B-Instruct (base) | 3,09 B | no disponible | Codigo general | Apache 2.0 | safetensors, GGUF |
| Qwen2.5-Coder-7B-Instruct | ~7 B | no disponible | Codigo general | Apache 2.0 | safetensors, GGUF |

La comparación con alternativas especializadas en seguridad de tamaño similar no está disponible en la información proporcionada.

## Limitaciones y advertencias

- El modelo solo declara soporte de inglés; su uso en castellano u otros idiomas no está validado y probablemente degrade la calidad.
- Riesgo de alucinación inherente a modelos de 3B parámetros: puede señalar vulnerabilidades inexistentes o pasar por alto las reales; no debe sustituir a un analizador estático ni a una revisión humana.
- El fine-tuning se realizó sobre un dataset de nombre genérico (`your_username/cleaned-reposvul`), lo que sugiere que la procedencia y curación del dataset no están documentadas públicamente; la calidad y cobertura del ajuste no son verificables.
- No hay benchmarks publicados que permitan estimar su precisión en detección de vulnerabilidades (falsos positivos, falsos negativos) frente a alternativas.
- La model card del repositorio GGUF es la plantilla automática de `gguf-my-repo` y no documenta el entrenamiento; toda la información técnica del ajuste depende del modelo base.
- La cuantización Q5_K_S introduce una pérdida de precisión respecto a los pesos originales; en tareas de clasificación fina (severidad de vulnerabilidad, CWE concreto) el impacto no está medido.
- Licencia Apache 2.0 permite uso comercial, pero debe verificarse la licencia y condiciones del modelo base `whywhywhywhy/security-qwen2.5-3b-coder-instruct` antes de desplegarlo en producción.
- El repositorio registra 0 descargas y 1 like en el momento de la consulta: no hay evidencia de uso comunitario ni validación externa.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Izdl/security-qwen2.5-3b-coder-instruct-Q5_K_S-GGUF
- Modelo base del fine-tuning: https://huggingface.co/whywhywhywhy/security-qwen2.5-3b-coder-instruct
- Espacio de conversion GGUF-my-repo: https://huggingface.co/spaces/ggml-org/gguf-my-repo
- Repositorio llama.cpp: https://github.com/ggerganov/llama.cpp
