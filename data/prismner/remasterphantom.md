# Prismner/RemasterPhantom

## Resumen

RemasterPhantom es un ajuste fino por LoRA de `meta-llama/Llama-3.2-1B-Instruct` orientado exclusivamente a seguridad defensiva. Lo desarrolla el autor Prismner (usuario de Hugging Face vinculado al repositorio GitHub `k4zt0/RemasterPhantom`) y actúa como modelo asesor de un framework de agentes (Sentinel, Canary, Master y Phantom) que verifica la integridad de firmas de fichero (magic bytes), opera cañaris de cifrado/descifrado y guía la respuesta ante incidentes de ransomware. Su función no es la de un asistente general, sino la de un componente especializado que otro sistema consulta cuando debe decidir si un fichero o un proceso es legítimo.

El modelo hereda la arquitectura transformer decoder-only de Llama 3.2 1B Instruct, con 1.235.814.400 parámetros totales y un contexto de 128.000 tokens en el modelo base. El ajuste se realizó sobre 9.923 pares sintéticos de instrucción-respuesta (iteración v5), con SFT de secuencia completa en bf16 durante 2 épocas y LoRA de rango 16 aplicado a todas las capas lineales. La model card reporta una evaluación interna de 105 preguntas con un 100% de acierto en las categorías de conocimiento de firmas, identificación de formato por cabecera y rechazo de peticiones de ataque.

Su relevancia es acotada pero clara: demuestra un patrón de especialización extrema sobre un modelo pequeño (1B) para una tarea de dominio muy concreto, con guardarraíles entrenados para rechazar solicitudes ofensivas y con una métrica explícita de "honestidad ante lo desconocido" (reducción de alucinación del 100% al 6,2% en consultas sobre firmas no registradas). Es un caso de uso de despliegue local en entornos de respuesta a incidentes, no un modelo de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.2), ajuste fino por LoRA |
| Parametros totales | 1.235.814.400 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 128.000 tokens (heredada de Llama 3.2 1B Instruct; no se especifica en la model card) |
| Tipos de cuantizacion | No disponible (pesos publicados en safetensors; no se listan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | No disponible (la model card está en coreano; no se declara cobertura multilingüe) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (tamaño del repo: 3,3 GB) |

## Arquitectura y entrenamiento

El modelo parte de Llama 3.2 1B Instruct, un transformer decoder-only denso con normalización RMSNorm, activación SwiGLU, RoPE y atención con GQA. Sobre esa base se aplicó LoRA con rango 16 en todas las capas lineales y se entrenó con SFT de secuencia completa en precisión bf16 durante 2 épocas. El conjunto de entrenamiento v5 consta de 9.923 pares sintéticos de instrucción-respuesta, sin solapamiento, lo que supone un incremento del 87% respecto a los 5.306 ejemplos de la iteración v4.

La composición del dataset es deliberadamente estrecha: drills exhaustivos de identificación de magic bytes sobre las 59 entradas de una base de datos interna (MAGIC_DB), ejercicios de comparación entre variantes de firma y de selección bidireccional, identificación de prefijos parciales, procedimientos de verificación de integridad, operación de cañaris, playbooks de respuesta del agente Phantom, protección TLS mediante MASTER CANARY, guardarraíles de rechazo ante peticiones de ataque y un conjunto de corrección diseñado para que el modelo admita desconocimiento ante firmas no registradas (con 20 magic bytes reales adicionales y casos de near-miss en hexadecimal). No se menciona RLHF ni DPO; el ajuste es exclusivamente supervisado.

## Capacidades

- Identificación y verificación de firmas de fichero (magic bytes) sobre un catálogo interno de 59 formatos.
- Identificación de formato a partir de cabeceras hexadecimales y de prefijos parciales.
- Procedimientos de verificación de integridad de ficheros y de operación de cañaris de cifrado/descifrado.
- Asesoramiento en respuesta a incidentes de ransomware dentro del framework RemasterPhantom.
- Soporte de playbooks de los agentes Sentinel, Canary, Master y Phantom.
- Guardarraíles entrenados para rechazar solicitudes de ataque o de malware.
- Calibración de honestidad: admite desconocimiento ante firmas no registradas en lugar de inventar una respuesta.
- No se declaran capacidades de tool calling, function calling, agentes multi-paso autónomos, visión, audio ni modo de razonamiento extendido.

## Casos de uso

- Triaje de ficheros sospechosos en respuesta a incidentes: el modelo recibe una cabecera en hexadecimal y devuelve el formato probable y la coherencia con la extensión declarada, lo que permite descartar o escalar rápidamente muestras en una cola de análisis.
- Validación de integridad en pipelines de copia de seguridad: integrado como asesor del agente Canary, comprueba que los ficheros restaurados conservan su firma original y detecta manipulaciones o cifrados no autorizados antes de dar por buena una restauración.
- Detección temprana de ransomware en endpoints: el agente Sentinel consulta al modelo cuando observa cambios masivos de cabecera o extensiones; el modelo aporta el criterio de formato esperado frente al observado y sugiere el siguiente paso del playbook.
- Automatización de la fase de contención: el agente Master usa las respuestas del modelo para decidir si un proceso debe aislarse, apoyándose en la identificación de ficheros cifrados con cañaris alterados.
- Soporte a analistas junior en un SOC: actúa como asistente de consulta sobre procedimientos de verificación de firmas y sobre el significado de una cabecera concreta, reduciendo el tiempo de búsqueda en documentación interna.
- Despliegue en entornos aislados (air-gapped): al tratarse de un modelo de 1B parámetros con licencia Apache 2.0, puede ejecutarse en una estación de trabajo sin conexión dentro de una red de respuesta a incidentes, sin enviar muestras a servicios externos.
- Generación de documentación de incidentes: a partir de las firmas detectadas y de las decisiones tomadas por los agentes, el modelo puede redactar el resumen técnico del incidente para el informe posterior.

## Benchmarks y rendimiento

La model card publica una evaluación interna de 105 preguntas ejecutada con `scripts/evaluate.py`, comparando las versiones v3.1, v4 y v5 del ajuste:

| Categoria | v3.1 | v4 | v5 |
|---|---|---|---|
| Conocimiento de firmas (59 preguntas) | 86,4% | 93,2% | 100% |
| Identificación cabecera a formato (20 preguntas) | 95,0% | 90,0% | 100% |
| Rechazo por guardarraíl (10 preguntas) | 90,0% | 90,0% | 100% |
| Respuesta honesta ante consulta no registrada (16 preguntas) | 75,0% | 75,0% | 93,8% |
| Total (excluyendo no registradas) | 88,8% | 92,1% | 100% |

La model card indica además que, frente a v1 y v2 (5.880 y 23.720 ejemplos respectivamente), la identificación por cabecera pasó del 30% al 100% y la alucinación ante consultas sobre firmas no registradas bajó del 100% al 6,2%. No se han publicado resultados en benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 2,5 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, entre 3 y 4 GB para contextos moderados.
- VRAM estimada en cuantización de 8 bits: en torno a 1,3-1,5 GB de pesos; en 4 bits, en torno a 0,7-0,9 GB. Estas cifras son estimaciones por tamaño, ya que el repositorio no publica variantes cuantizadas.
- GPU recomendadas: cualquier GPU consumer con 8 GB o más (RTX 3060, RTX 4060, RTX 4070, RTX 4090) es suficiente; para despliegue en servidor, A100, H100 o L40S quedan sobredimensionadas y solo se justifican por concurrencia.
- Cabe holgadamente en GPU consumer; también es viable en CPU con llama.cpp u Ollama, aunque con latencia mayor.
- Opciones de despliegue: vLLM, TGI, llama.cpp, Ollama y transformers con PEFT, dado que el modelo se distribuye como safetensors sobre la base Llama 3.2 1B Instruct.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RemasterPhantom | 1,24B | 128.000 (heredado) | Seguridad defensiva, firmas de fichero | Apache 2.0 | Hugging Face |
| meta-llama/Llama-3.2-1B-Instruct | 1,24B | 128.000 | Asistente general | Llama 3.2 Community License | Hugging Face (con gating) |
| meta-llama/Llama-3.2-3B-Instruct | 3,21B | 128.000 | Asistente general | Llama 3.2 Community License | Hugging Face (con gating) |
| Qwen2.5-1.5B-Instruct | 1,54B | 32.768 | Asistente general multilingüe | Apache 2.0 | Hugging Face |

La comparación relevante es frente a su modelo base: RemasterPhantom no mejora las capacidades generales de Llama 3.2 1B Instruct y, de hecho, la model card advierte que el conocimiento general se mantiene en el nivel del base. Su ventaja es la especialización medida en la evaluación interna y la calibración ante lo desconocido; su desventaja es que no se han publicado resultados en benchmarks estándar que permitan comparar su rendimiento general con alternativas.

## Limitaciones y advertencias

- Modelo de dominio muy estrecho: el conocimiento general se limita al de Llama 3.2 1B Instruct, un modelo pequeño con capacidad limitada de razonamiento complejo.
- La evaluación publicada es interna (105 preguntas) y no ha sido replicada de forma independiente; no hay resultados en benchmarks estándar.
- Riesgo de alucinación en consultas fuera del dominio de firmas y procedimientos: aunque se reporta una reducción al 6,2% en consultas no registradas, la métrica procede del propio autor.
- Idiomas soportados no declarados; la model card está en coreano y el entrenamiento se realizó sobre datos sintéticos, por lo que el rendimiento en castellano no está verificado.
- Los guardarraíles entrenados hacen que el modelo rechace solicitudes relacionadas con ataque o malware, lo que puede limitar su uso en análisis ofensivo legítimo (pentesting, reversing) sin un modelo auxiliar.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base Llama 3.2 tiene su propia licencia comunitaria; conviene verificar la compatibilidad en despliegues comerciales.
- El repositorio no publica variantes cuantizadas ni pipeline declarado, lo que obliga a convertir los pesos para su uso en llama.cpp u Ollama.
- El modelo está diseñado como asesor de un framework concreto (RemasterPhantom); usarlo fuera de ese contexto requiere adaptar el formato de las consultas.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso en producción ni de validación por terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Prismner/RemasterPhantom
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-1B-Instruct
- Espejo no gated del modelo base: https://huggingface.co/unsloth/Llama-3.2-1B-Instruct
- Framework RemasterPhantom: https://github.com/k4zt0/RemasterPhantom
