# Miiyamoto255/SimplyAI-2B-Uncensored

## Resumen

SimplyAI-2B-Uncensored es un modelo de lenguaje de 2.600 millones de parámetros desarrollado por Miiyamoto255, que parte del modelo instructivo Gemma 2 2B de Google y le aplica la técnica de *abliteration* para eliminar los mecanismos de rechazo y censura presentes en el modelo original. El resultado es un modelo "sin censura" que mantiene las capacidades de razonamiento y generación de texto de Gemma 2, pero con una mayor libertad de respuesta en dominios como la programación, la seguridad informática o la exploración de temas controvertidos.

El modelo se distribuye en formato safetensors y ocupa aproximadamente 5,3 GB en el repositorio. Está pensado para desarrolladores e investigadores que necesitan un modelo pequeño, eficiente y sin restricciones de contenido para tareas de generación de código, automatización o experimentación. Su tamaño reducido permite ejecutarlo en hardware de consumo, y existen cuantizaciones GGUF realizadas por la comunidad (mradermacher) para facilitar su despliegue en dispositivos con recursos limitados.

La relevancia de este modelo radica en su enfoque en la comunidad "uncensored", que busca alternativas a los modelos comerciales con filtros de seguridad. Sin embargo, hay que tener en cuenta que la licencia no está especificada, lo que limita su uso en entornos comerciales sin una verificación legal previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Gemma 2 2B) con abliteration |
| Parametros totales | 2.614.341.888 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (se hereda de Gemma 2 2B, típicamente 8192 tokens) |
| Tipos de cuantizacion | safetensors (FP16/BF16) y GGUF (cuantizaciones de mradermacher) |
| Idiomas soportados | no disponible (Gemma 2 soporta múltiples idiomas, pero no se especifica) |
| Licencia | no disponible |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura de Gemma 2 2B, un transformer decoder-only con atención multi-cabeza y capas de normalización pre-RMSNorm. Gemma 2 2B fue entrenado por Google con un enfoque en instrucciones y diálogo, utilizando técnicas de RLHF y destilación de conocimiento. SimplyAI-2B-Uncensored aplica la técnica de *abliteration* descrita en el blog de mlabonne, que consiste en identificar y eliminar las direcciones de los residuos de atención que correlacionan con comportamientos de rechazo o negativa. Este proceso no requiere reentrenamiento, sino una modificación de los pesos del modelo original.

Los datos de entrenamiento del modelo original (Gemma 2 2B) no se detallan en la información disponible, pero se sabe que Google utilizó un corpus multilingüe y diverso. La abliteration no añade datos nuevos, sino que modifica los pesos existentes para reducir la probabilidad de respuestas de rechazo. No se menciona ningún ajuste fino adicional ni uso de RLHF/DPO en el proceso.

## Capacidades

- Generación de texto libre y creativa, con menor probabilidad de rechazo ante peticiones controvertidas o de contenido sensible.
- Razonamiento y resolución de problemas básicos, heredados de Gemma 2 2B.
- Generación de código en varios lenguajes, con especial énfasis en tareas de programación y scripting.
- Soporte de conversación multi-turno, aunque la longitud de contexto no está confirmada.
- Capacidad de seguir instrucciones complejas, aunque la abliteration puede afectar a la coherencia en algunos dominios.
- No se indica soporte explícito de tool calling, agentes o visión. El modelo es puramente textual.

## Casos de uso

- Generación de código en entornos de desarrollo: el modelo puede asistir en la escritura de scripts, funciones o fragmentos de código, especialmente en tareas donde se requiere explorar soluciones no convencionales o sin restricciones de estilo.
- Automatización de tareas de seguridad informática (pentesting): gracias a su naturaleza "uncensored", puede generar comandos, exploits educativos o análisis de vulnerabilidades sin rechazar peticiones relacionadas con hacking ético.
- Creación de contenido creativo sin filtros: redacción de historias, guiones o diálogos que aborden temas tabú o controvertidos, donde los modelos censurados suelen negarse.
- Asistente de investigación para análisis de textos sensibles: procesamiento de documentos que contengan lenguaje ofensivo o temas delicados, donde un modelo con filtros podría bloquear la salida.
- Experimentación en entornos académicos: estudio de los efectos de la abliteration en el comportamiento de modelos pequeños, comparando respuestas antes y después de la modificación.
- Despliegue en dispositivos edge o con recursos limitados: gracias a su tamaño de 2,6B y a las cuantizaciones GGUF, puede ejecutarse en Raspberry Pi, portátiles antiguos o GPUs de gama baja para prototipos rápidos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo no incluye métricas de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar. Se recomienda al usuario realizar sus propias pruebas comparativas con Gemma 2 2B para medir el impacto de la abliteration en tareas específicas.

## Requisitos de hardware

- VRAM estimada para inferencia: con 2,6B parámetros en FP16, se necesitan aproximadamente 5,2 GB de VRAM. Con cuantización GGUF Q4_K_M, se reduce a unos 1,5-2 GB.
- GPUs recomendadas: cualquier GPU con al menos 6 GB de VRAM (RTX 2060, GTX 1660 Ti, RTX 3050) para FP16. Para cuantizaciones GGUF, basta con 2-4 GB (GTX 1050 Ti, integradas modernas).
- Cabe en GPUs de consumo: sí, en la mayoría de GPUs de gama media y baja.
- Opciones de despliegue: llama.cpp, Ollama, vLLM (con soporte para Gemma 2), TGI, o directamente con transformers de HuggingFace.
- Latencia y throughput: no se dispone de datos medidos. En una RTX 4090, se espera una generación de 50-100 tokens/s con cuantización GGUF; en CPU, unos 5-15 tokens/s dependiendo del hardware.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Enfoque |
|---|---|---|---|---|---|
| SimplyAI-2B-Uncensored | 2,6B | no disponible | no disponible | safetensors, GGUF | Uncensored (abliterated) |
| google/gemma-2-2b-it | 2,6B | 8192 | Gemma Terms of Use | safetensors | Instruct, censurado |
| dolphin-2.6-phi-2 (ejemplo) | 2,7B | 2048 | Apache 2.0 | safetensors, GGUF | Uncensored (fine-tune) |

La comparativa se basa en modelos de tamaño similar. Gemma 2 2B es el modelo base, con licencia propietaria de Google. Dolphin-2.6-phi-2 es un ejemplo de modelo uncensored basado en Phi-2, con licencia Apache 2.0. SimplyAI-2B-Uncensored se diferencia por su método de abliteration, que no requiere fine-tuning, y por su disponibilidad en GGUF.

## Limitaciones y advertencias

- La licencia no está especificada, lo que impide su uso comercial sin una revisión legal. El modelo base Gemma 2 tiene términos de uso propietarios que pueden no permitir la redistribución modificada.
- La abliteration puede degradar la calidad de las respuestas en tareas que requieren adherencia estricta a normas de seguridad, como la generación de contenido médico o legal.
- Riesgo de alucinación: al ser un modelo pequeño (2,6B), puede generar información falsa o inventada, especialmente en dominios especializados.
- No se han publicado evaluaciones de sesgos. El modelo puede reflejar los sesgos del corpus de entrenamiento de Gemma 2, y la abliteration no los corrige.
- La longitud de contexto no está confirmada; se asume la de Gemma 2 (8192 tokens), pero no hay garantía.
- El modelo está orientado a la comunidad "uncensored", lo que implica que puede generar contenido ofensivo, ilegal o peligroso si se le solicita. El uso responsable es responsabilidad del desarrollador.
- No hay soporte oficial ni mantenimiento por parte del autor; el proyecto parece ser un experimento personal.

## Enlaces

- [HuggingFace - Miiyamoto255/SimplyAI-2B-Uncensored](https://huggingface.co/Miiyamoto255/SimplyAI-2B-Uncensored)
- [Blog de abliteration de mlabonne](https://huggingface.co/blog/mlabonne/abliteration)
- [Modelo base google/gemma-2-2b-it](https://huggingface.co/google/gemma-2-2b-it)
- [Cuantizaciones GGUF de mradermacher](https://huggingface.co/mradermacher/SimplyAI-2B-Uncensored-GGUF)
- [Perfil del autor Miiyamoto255](https://huggingface.co/Miiyamoto255)
