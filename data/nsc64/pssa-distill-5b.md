# NSC64/pssa-distill-5b

## Resumen

`NSC64/pssa-distill-5b` es un modelo de lenguaje no-transformer publicado por el usuario NSC64 en Hugging Face. Forma parte de la familia PSSA (un acrónimo que el autor no expande en la documentación disponible), una arquitectura construida en Rust que combina un núcleo recurrente de espacio de estados (state-space core), un banco de memoria episódica y pesos plásticos. El repositorio ocupa 123,4 GB, lo que sugiere pesos de gran tamaño, aunque el nombre del modelo indica 5 mil millones de parámetros.

La relevancia del modelo radica en su carácter experimental y alternativo a la arquitectura transformer dominante: propone un diseño híbrido con memoria persistente y pesos que se adaptan, orientado a razonamiento multi-paso y contexto largo. La información pública es extremadamente escasa: no hay pipeline declarado, ni licencia, ni idiomas, ni resultados de benchmarks, y el repositorio no tiene descargas registradas. Un modelo hermano de la misma familia, `NSC64/pssa-distill-105m`, fue destilado desde Qwen3-8B, lo que indica que la línea PSSA usa destilación de conocimiento desde transformers convencionales.

Dado el estado incipiente del proyecto y la falta de documentación, esta ficha debe leerse como una descripción de lo que se puede inferir de los metadatos y del contexto del repositorio, no como una evaluación de rendimiento verificada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No-transformer: núcleo recurrente de espacio de estados (SSM) con banco de memoria episódica y pesos plásticos, implementado en Rust |
| Parametros totales | 5 mil millones (según el nombre del modelo; no confirmado en la model card) |
| Parametros activos | No disponible (no consta que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | No disponible (el tamaño del repo, 123,4 GB, sugiere pesos en precisión alta o múltiples checkpoints) |

## Arquitectura y entrenamiento

La arquitectura PSSA se describe en el repositorio hermano como un modelo de lenguaje no-transformer construido en Rust, con tres componentes: un núcleo recurrente de espacio de estados (state-space model), un banco de memoria episódica que almacena información de interacciones previas y pesos plásticos que se modifican durante la inferencia. Esta combinación busca superar las limitaciones de ventana de contexto fija de los transformers mediante memoria persistente y adaptación en tiempo de ejecución.

El proceso de entrenamiento del modelo de 5B no está documentado en la información disponible. Para el hermano de 107M sí se describe un esquema de destilación: continuación del base `ck256.pssa` durante 5.000 actualizaciones sobre aproximadamente 2 GB de FineWeb-Edu, OpenWebMath y CodeParrot, con una pérdida combinada de 0,5 CE + 0,5 KL a temperatura 2,0, ejecutado en una RTX PRO 6000, destilando desde Qwen3-8B. Es razonable suponer un esquema análogo para el 5B, pero no hay confirmación en la información proporcionada.

## Capacidades

- Generación de texto autoregresiva sobre una arquitectura SSM recurrente (inferido del diseño, no verificado).
- Memoria episódica persistente entre turnos, según la descripción del repositorio hermano.
- Pesos plásticos que permiten adaptación durante la inferencia (según la misma descripción).
- Entrenamiento sobre datos de matemáticas y código (OpenWebMath, CodeParrot) en la variante destilada, lo que sugiere competencia en razonamiento matemático y programación.
- Soporte de tool calling: no disponible.
- Soporte de agentes y multi-step reasoning: no disponible (la memoria episódica apunta a este uso, pero no está documentado).
- Capacidades multilingües: no disponible.
- Capacidades especiales (thinking mode, visión, audio): no disponible.

## Casos de uso

- Experimentación en investigación de arquitecturas alternativas: el modelo sirve como banco de pruebas para estudiar si un SSM recurrente con memoria episódica iguala a transformers de tamaño comparable en tareas de lenguaje, sin necesidad de infraestructura de atención cuadrática.
- Razonamiento multi-paso con memoria persistente: el banco de memoria episódica está diseñado para retener información entre pasos de una cadena de razonamiento, lo que encaja en tareas de planificación y resolución de problemas iterativos.
- Generación de código asistida: el entrenamiento sobre CodeParrot (en la variante destilada) sugiere uso en autocompletado y generación de fragmentos de código, aunque el rendimiento real no está verificado.
- Ajuste fino personalizado con pesos plásticos: la capacidad de modificar pesos durante la inferencia permite adaptar el modelo a un dominio concreto sin un ciclo de reentrenamiento completo.
- Despliegue en entornos Rust nativos: al estar construido en Rust, puede integrarse en servicios backend que ya usan ese ecosistema, evitando dependencias de Python y CUDA en la capa de aplicación.
- Destilación de modelos mayores: la familia PSSA ya ha demostrado destilación desde Qwen3-8B, por lo que el 5B puede servir como profesor o alumno en pipelines de compresión de conocimiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Con 5.000 millones de parámetros, una estimación teórica en FP16 sería de unos 10 GB de pesos, pero el repositorio de 123,4 GB indica checkpoints adicionales u otro formato; no se puede confirmar.
- GPU recomendadas: no disponible. La variante de 107M se entrenó en una RTX PRO 6000; para el 5B se requeriría al menos una GPU de 24 GB o superior si los pesos cupieran en FP16, pero esto es una inferencia, no un dato confirmado.
- Cabe en consumer GPU: no confirmado. Depende del formato de pesos final, que no está documentado.
- Opciones de despliegue: al ser una arquitectura no-transformer implementada en Rust, no es compatible con vLLM, llama.cpp, Ollama ni TGI, que asumen arquitecturas transformer. El despliegue requeriría el runtime propio del proyecto PSSA.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| NSC64/pssa-distill-5b | 5B (según nombre) | No disponible | SSM recurrente + memoria episódica | No disponible | Hugging Face, repo de 123,4 GB |
| NSC64/pssa-distill-105m | 107M | No disponible | SSM recurrente + memoria episódica | No disponible | Hugging Face |
| Qwen3-8B | 8B | No disponible en la información | Transformer | No disponible en la información | Hugging Face (modelo profesor de la familia PSSA) |

La comparativa con transformers convencionales de tamaño similar (Llama 3.1 8B, Mistral 7B, Qwen2.5 7B) no es posible con datos verificados: no hay benchmarks publicados del PSSA 5B ni especificaciones de contexto y licencia.

## Limitaciones y advertencias

- Ausencia total de model card: no hay licencia, idiomas, pipeline ni instrucciones de uso, lo que impide evaluar la legalidad de un uso comercial.
- Sin benchmarks publicados: no hay evidencia verificada de rendimiento en MMLU, HumanEval, GSM8K ni ninguna otra tarea.
- Cero descargas registradas: el modelo no ha sido validado por la comunidad; su funcionamiento en producción es una incógnita.
- Ecosistema incompatible: al no ser transformer, no funciona con las herramientas estándar de inferencia (vLLM, llama.cpp, Ollama, TGI), lo que limita su adopción.
- Riesgo de alucinación: no evaluado; los SSM recurrentes pueden degradar en contextos muy largos si la memoria episódica no está bien calibrada.
- Sesgos: no documentados; los datos de entrenamiento (FineWeb-Edu, OpenWebMath, CodeParrot en la variante destilada) arrastran los sesgos habituales de corpus web.
- Pesos plásticos: la modificación de pesos durante la inferencia introduce no determinismo y complica la reproducibilidad y la auditoría de resultados.
- Tamaño del repositorio desproporcionado: 123,4 GB para 5B parámetros sugiere checkpoints redundantes o formatos no optimizados, lo que encarece el almacenamiento y la descarga.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/NSC64/pssa-distill-5b
- Perfil del autor en GitHub: https://github.com/NSC64
- Repositorio PSSA (fork): https://github.com/Sparticle62ops/pssa
- Modelo hermano destilado: https://huggingface.co/NSC64/pssa-distill-105m
