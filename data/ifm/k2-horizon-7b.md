# IFM/K2-Horizon-7B

## Resumen

K2-Horizon-7B es un modelo de lenguaje denso de la familia K2-Horizon, desarrollado por IFM (laboratorio de inteligencia artificial, no confundir con ifm electronic). Se presenta como un modelo de 7B-core con una ventana de contexto nativa de 524.288 tokens (512K), diseñado para ofrecer un baseline denso fuerte en tareas agénticas, generación de código, razonamiento matemático y comprensión de contextos largos. Su relevancia radica en que combina un tamaño relativamente contenido con un rendimiento superior en benchmarks como SWE-bench Verified (70,6) y HMMT Feb 2026 (73,3), superando a modelos de mayor tamaño como Gemma 4-12B. Además, el proyecto es completamente abierto: libera los datos de entrenamiento, el código de entrenamiento, los checkpoints intermedios y los recursos de evaluación, lo que lo convierte en una opción atractiva para investigación y desarrollo.

El modelo es un transformer decoder-only denso, con un total de 8.999.178.240 parámetros (aunque el nombre comercial indica 7B, el recuento real de safetensors es de aproximadamente 9B). Está entrenado exclusivamente en inglés y se distribuye bajo licencia Apache-2.0, lo que permite uso comercial sin restricciones. Su arquitectura soporta contexto de 512K tokens desde las etapas de midtraining, y se han publicado checkpoints intermedios para estudiar la evolución de las capacidades durante el entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso |
| Parametros totales | 8.999.178.240 (~9B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 524.288 tokens (512K) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

K2-Horizon-7B es un modelo decoder-only de arquitectura transformer densa, sin mezcla de expertos (MoE). Aunque se denomina "7B-core", el recuento real de parámetros es de 8.999.178.240, probablemente debido a embeddings o capas adicionales. La característica más destacada es su ventana de contexto nativa de 524.288 tokens, que se mantiene desde las etapas de midtraining. El entrenamiento utiliza dos datasets públicos: IFM/K2-Horizon-Pretrain-Data e IFM/K2-Horizon-Midtrain-Data, ambos liberados por IFM. No se menciona explícitamente el uso de RLHF o DPO en la información disponible, aunque el modelo está etiquetado como "conversational". Se han publicado checkpoints intermedios para permitir el estudio de la evolución de capacidades a lo largo del entrenamiento, y todo el pipeline (datos, código, evaluación) es público.

## Capacidades

- Generación de texto y conversación en inglés, con soporte para tareas de razonamiento y matemáticas de nivel competitivo (HMMT Feb 2026: 73,3).
- Generación de código y resolución de problemas de ingeniería de software (SWE-bench Verified: 70,6), superando a modelos de referencia como Gemma 4-12B y Qwen3.5-9B.
- Manejo de contextos extremadamente largos (hasta 512K tokens), adecuado para análisis de documentos extensos, libros completos o repositorios de código.
- Capacidades agénticas: el modelo está evaluado en benchmarks de agentes, lo que sugiere soporte para razonamiento multi-paso y uso de herramientas, aunque no se detalla explícitamente el soporte de tool calling en la documentación.
- Razonamiento científico a nivel experto (HLE), aunque el valor exacto no está disponible en la información extraída.
- Multilingüismo: solo inglés, sin soporte declarado para otros idiomas.

## Casos de uso

- Ingeniería de software automatizada: con un 70,6 en SWE-bench Verified, el modelo puede integrarse en pipelines de CI/CD para generar parches, revisar código o resolver issues de GitHub de forma autónoma, reduciendo la carga de trabajo de los desarrolladores.
- Análisis de documentos legales o académicos extensos: su contexto de 512K tokens permite procesar contratos, tesis o informes completos en una sola pasada, extrayendo información relevante o resumiendo secciones específicas sin perder coherencia.
- Asistentes de investigación científica: su rendimiento en HMMT y HLE lo hace útil para ayudar a investigadores en la resolución de problemas matemáticos avanzados o en la verificación de razonamientos complejos.
- Agentes autónomos para automatización de tareas: gracias a su capacidad de razonamiento multi-paso y su evaluación en benchmarks agénticos, puede servir como motor de agentes que interactúan con APIs, navegadores o entornos de ejecución para completar tareas complejas.
- Chatbots conversacionales de dominio específico: al ser un modelo abierto y con licencia permisiva, puede adaptarse mediante fine-tuning para crear asistentes de atención al cliente o soporte técnico en inglés, con capacidad de mantener conversaciones largas y contextualizadas.
- Educación y tutoría: su habilidad para explicar conceptos matemáticos y de programación, junto con su contexto largo, permite construir tutores virtuales que sigan el hilo de una sesión de aprendizaje prolongada.

## Benchmarks y rendimiento

La model card proporciona resultados comparativos frente a tres modelos de referencia: Gemma 4-12B, Qwen3.5-9B y Granite 4.2-8B. Los datos disponibles son los siguientes:

| Benchmark | K2-Horizon-7B | Gemma 4-12B | Qwen3.5-9B | Granite 4.2-8B |
|---|---|---|---|---|
| HMMT Feb 2026 (matematicas competitivas) | 73,3 | 63,1 | 65,7 | 66,5 |
| SWE-bench Verified (ingenieria de software) | 70,6 | 30,6 | 50,8 | 47,7 |

No se dispone del valor para HLE (razonamiento cientifico) en la informacion extraida, aunque se menciona en la tabla original. El modelo supera a todos los referentes en ambos benchmarks publicados, con una ventaja especialmente notable en SWE-bench Verified.

## Requisitos de hardware

- No se han publicado requisitos oficiales de hardware en la informacion disponible.
- Estimacion general para un modelo de ~9B parametros: en FP16 se necesitan aproximadamente 18 GB de VRAM; en cuantizacion de 8 bits, unos 9 GB; en 4 bits, unos 4,5 GB. Estas cifras son orientativas y dependen de la implementacion y del tamaño del lote.
- Dado su tamaño, es probable que quepa en GPUs de consumo como RTX 3090 (24 GB) o RTX 4090 (24 GB) con cuantizacion, pero no hay confirmacion oficial.
- Para despliegue, se puede usar vLLM, llama.cpp, Ollama o TGI, aunque no se especifica compatibilidad en la documentacion.
- El tamaño del repositorio es de 687,2 GB, lo que incluye checkpoints intermedios y posiblemente datos; la descarga del modelo base puede ser considerablemente menor, pero no se indica el peso exacto de los pesos principales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | HMMT Feb 2026 | SWE-bench Verified |
|---|---|---|---|---|---|
| K2-Horizon-7B | ~9B (7B-core) | 512K | Apache-2.0 | 73,3 | 70,6 |
| Gemma 4-12B | 12B | No disponible | No disponible | 63,1 | 30,6 |
| Qwen3.5-9B | 9B | No disponible | No disponible | 65,7 | 50,8 |
| Granite 4.2-8B | 8B | No disponible | No disponible | 66,5 | 47,7 |

K2-Horizon-7B ofrece el mejor rendimiento en ambos benchmarks con un tamaño de parametros similar o inferior a los referentes, y destaca por su contexto de 512K, que no se especifica en los modelos comparados. Su licencia Apache-2.0 es más permisiva que las típicas de los modelos propietarios.

## Limitaciones y advertencias

- El modelo solo soporta inglés; no hay evidencia de capacidades multilingües, lo que limita su uso en entornos no anglófonos.
- No se han documentado sesgos específicos, pero al ser un modelo entrenado con datos abiertos, puede heredar sesgos presentes en el corpus de entrenamiento.
- Como todo modelo generativo, existe riesgo de alucinación, especialmente en tareas de razonamiento complejo o cuando se le pide información factual no presente en el entrenamiento.
- El tamaño del repositorio (687,2 GB) puede dificultar la descarga y el almacenamiento local, especialmente si se desean todos los checkpoints intermedios.
- No se especifican los tipos de cuantización disponibles ni la compatibilidad con frameworks de inferencia específicos, lo que puede requerir trabajo adicional para el despliegue en producción.
- La licencia Apache-2.0 permite uso comercial, pero se recomienda revisar los términos de los datasets asociados (IFM/K2-Horizon-Pretrain-Data e IFM/K2-Horizon-Midtrain-Data) para asegurar el cumplimiento de sus respectivas licencias.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/IFM/K2-Horizon-7B
- Dataset de pretraining: https://huggingface.co/datasets/IFM/K2-Horizon-Pretrain-Data
- Dataset de midtraining: https://huggingface.co/datasets/IFM/K2-Horizon-Midtrain-Data
- No se han encontrado papers, blogs o demos adicionales en la busqueda web realizada.
