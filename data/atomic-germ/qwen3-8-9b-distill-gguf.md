# Atomic-Germ/Qwen3.8-9B-Distill-GGUF

## Resumen

Qwen3.8-9B-Distill-GGUF es la versión cuantizada en formato GGUF del modelo empero-ai/Qwen3.8-9B, desarrollado por Empero. Se trata de una destilación de parámetros completos del modelo Qwen3.8 2.4T A95B (un MoE de gran escala) sobre la arquitectura Qwen3.5-9B de Alibaba. El resultado es un modelo denso de aproximadamente 9.197 millones de parámetros que hereda parte de las capacidades del modelo profesor mediante entrenamiento sobre unas 70.000 trazas curadas.

La relevancia de esta ficha reside en su empaquetado: el repositorio ofrece cuantizaciones listas para llama.cpp, Ollama, LM Studio, Jan y KoboldCpp, lo que permite ejecutar un modelo de razonamiento de casi 9B en hardware de consumo. La arquitectura es híbrida, con tres capas Gated DeltaNet por cada capa de atención completa, lo que exige compilaciones recientes de llama.cpp con soporte para Qwen3.5 y Gated DeltaNet.

El modelo es un modelo de razonamiento: cada respuesta comienza con un bloque `<think>`, por lo que requiere gestión explícita de esa traza en producción. La licencia es Apache-2.0, heredada de la base Qwen, y el único idioma declarado es el inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con Gated DeltaNet (3 capas Gated DeltaNet por cada capa de atención completa), arquitectura Qwen3.5 |
| Parametros totales | 9.197.093.888 (9,2B) |
| Parametros activos | no aplica (modelo denso; el profesor Qwen3.8 2.4T A95B sí es MoE) |
| Longitud de contexto | no disponible (la model card no declara la ventana; se recomienda `-n 16384` en llama.cpp) |
| Tipos de cuantizacion | BF16, Q8_0, Q6_K, Q5_K_M, Q4_K_M |
| Idiomas soportados | inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo base empero-ai/Qwen3.8-9B es una destilación de parámetros completos de Qwen3.8 2.4T A95B (un MoE de 2,4 billones de parámetros totales y 95B activos) hacia la arquitectura Qwen3.5-9B. El entrenamiento se realizó sobre aproximadamente 70.000 trazas curadas del profesor, procedentes de los conjuntos internos de destilación de Qwen3.8 de Empero. La arquitectura Qwen3.5 es híbrida: combina capas Gated DeltaNet (un mecanismo de atención lineal con estado recurrente) con capas de atención completa en una proporción de tres a una. Esta mezcla reduce el coste del caché KV en contextos largos frente a un transformer de atención completa pura.

No se dispone de información sobre el número total de tokens de entrenamiento, la composición del dataset, ni si se aplicaron fases de RLHF o DPO. La model card indica que los detalles de capacidades y benchmarks completos residen en la model card del modelo base. El repositorio GGUF es únicamente una conversión de pesos; no se ha realizado ningún entrenamiento adicional sobre las cuantizaciones.

## Capacidades

- Generación de texto conversacional con plantilla de chat integrada en el archivo GGUF (`-cnv` en llama.cpp).
- Razonamiento explícito en modo *thinking*: cada respuesta abre con un bloque `<think>...</think>` que debe separarse de la salida final.
- Razonamiento matemático y de sentido común: la model card reporta mejoras notables en MMLU con protocolo CoT respecto a la base Qwen3.5-9B.
- Resolución de problemas de matemáticas escolares (GSM8K con CoT), con rendimiento prácticamente equivalente a la base.
- Ejecución en runtimes GGUF estándar: llama.cpp, Ollama, LM Studio, Jan y KoboldCpp.
- Compatibilidad con endpoints (tag `endpoints_compatible` en Hugging Face).
- No se declara soporte de tool calling, function calling, agentes multi-paso, visión, audio ni capacidades multimodales en la información disponible.
- Cobertura multilingüe limitada al inglés según la model card.

## Casos de uso

- Asistente de razonamiento local en estación de trabajo: con la cuantización Q4_K_M (5,78 GB) el modelo cabe en tarjetas de 8-12 GB y permite desplegar un asistente con traza de razonamiento visible para depuración interna, sin depender de APIs externas.
- Sustituto de modelos de 7-9B en tareas de MMLU y conocimiento general: la mejora de +0,205 en MMLU frente a Qwen3.5-9B base lo hace adecuado para clasificación de conocimiento, respuesta a preguntas de cultura general y evaluación académica automatizada.
- Tutor de matemáticas de nivel escolar: el rendimiento en GSM8K CoT (0,870) permite construir un resolvedor de problemas paso a paso, mostrando la cadena de razonamiento al estudiante y filtrando el bloque `<think>` para la salida final.
- Prototipado rápido con Ollama o LM Studio: al incluir la plantilla de chat embebida y archivos de tamaño moderado, un desarrollador puede tener un endpoint conversacional funcionando en minutos para pruebas de UX o demos internas.
- Generación de explicaciones razonadas en pipelines de datos: el modo thinking es útil para tareas donde se necesita justificación (anotación de datasets, generación de trazas de razonamiento sintéticas), siempre con presupuesto de tokens amplio (`-n 16384` o superior).
- Evaluación comparativa de destilaciones: sirve como referencia práctica para investigadores que quieran medir cuánto de un profesor MoE de 2,4T se transfiere a un estudiante denso de 9B en un entorno de inferencia de consumo.
- Despliegue en entornos con requisitos de licencia permisiva: la licencia Apache-2.0 permite uso comercial sin restricciones adicionales declaradas, lo que facilita su integración en productos propietarios.

## Benchmarks y rendimiento

Resultados reportados en la model card para el modelo fuente (protocolos CoT, `lm-evaluation-harness`, mismos ajustes para base y estudiante):

| Tarea | Qwen3.5-9B (base) | Qwen3.8-9B | Delta |
|---|---:|---:|---:|
| MMLU (CoT, 57 materias) | 0,546 | 0,751 | +0,205 |
| GSM8K CoT | 0,885 | 0,870 | -0,015 |

No se han publicado resultados de benchmarks específicos para las cuantizaciones GGUF en la información disponible. Los valores anteriores corresponden al modelo base en BF16 y pueden degradarse ligeramente con cuantizaciones agresivas como Q4_K_M.

## Requisitos de hardware

- VRAM estimada según pesos: Q4_K_M 5,78 GB; Q5_K_M 6,64 GB; Q6_K 7,56 GB; Q8_0 9,79 GB; BF16 18,41 GB. El caché KV es el coste dominante en contexto largo y puede requerir offload a CPU incluso con cuantizaciones pequeñas.
- GPU recomendadas: para Q4_K_M y Q5_K_M, tarjetas de 8-12 GB (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070). Para Q6_K y Q8_0, 12-16 GB (RTX 4070 Ti Super, RTX 4080). Para BF16, 24 GB o más (RTX 4090, A100 40 GB, H100).
- Cabe en GPU de consumo: sí, en todas las cuantizaciones hasta Q8_0 con contexto moderado; BF16 requiere gama alta o profesional.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server`), Ollama, LM Studio, Jan, KoboldCpp. Es imprescindible una compilación reciente de llama.cpp con soporte para Qwen3.5 y Gated DeltaNet; las versiones antiguas fallan al cargar la arquitectura.
- Parámetros de muestreo recomendados: `temperature=0.6`, `top_p=0.95`, `top_k=20`.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | MMLU (CoT) | GSM8K CoT | Licencia | Formato |
|---|---|---:|---:|---:|---|---|
| Qwen3.8-9B-Distill (este) | 9,2B denso | no disponible | 0,751 | 0,870 | Apache-2.0 | GGUF |
| Qwen3.5-9B (base) | 9B denso | no disponible | 0,546 | 0,885 | Apache-2.0 | safetensors |
| Qwen3.8 2.4T A95B (profesor) | 2,4T totales / 95B activos (MoE) | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparativa se limita a los modelos citados en la información disponible. No se dispone de datos de benchmarks de otras alternativas de la misma categoría para contrastar.

## Limitaciones y advertencias

- Modelo de razonamiento: todas las respuestas incluyen un bloque `<think>` que debe eliminarse antes de mostrar la salida al usuario final; ignorarlo degrada la experiencia y consume tokens.
- Idiomas: solo se declara inglés; el rendimiento en castellano u otros idiomas no está evaluado y probablemente sea inferior.
- Ventana de contexto: no declarada en la model card; el ejemplo de uso sugiere `-n 16384`, pero no se garantiza un contexto nativo mayor.
- Dependencia de runtime: requiere una compilación reciente de llama.cpp con soporte de Qwen3.5 y Gated DeltaNet; compilaciones antiguas no cargan el modelo.
- Degradación por cuantización: Q4_K_M es la opción recomendada por equilibrio calidad/tamaño, pero puede perder precisión frente a BF16 en tareas de razonamiento largo; no hay benchmarks publicados por cuantización.
- Destilación: el estudiante no iguala al profesor en todas las tareas (GSM8K cae 0,015 respecto a la base), por lo que no debe asumirse paridad con Qwen3.8 2.4T A95B.
- Riesgo de alucinación: no cuantificado en la información disponible; como todo modelo generativo, puede producir contenido plausible pero incorrecto, especialmente fuera de su dominio de entrenamiento.
- Sesgos: no se documentan evaluaciones de sesgo en la model card.
- Licencia: Apache-2.0 permite uso comercial, pero el usuario debe verificar el cumplimiento de las licencias de las dependencias (llama.cpp) y de la base Qwen3.5-9B.
- La model card incluye direcciones de donación en criptomonedas; no constituyen un aval técnico ni deben interpretarse como parte de la evaluación del modelo.

## Enlaces

- Repositorio GGUF: https://huggingface.co/Atomic-Germ/Qwen3.8-9B-Distill-GGUF
- Modelo base (destilación): https://huggingface.co/empero-ai/Qwen3.8-9B
- Modelo Qwen3.5-9B de Alibaba: https://huggingface.co/Qwen/Qwen3.5-9B
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Empero: https://empero.org
