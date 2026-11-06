# 2beng2/OmniEdu-27B-Q6_K-NInfer

## Resumen

OmniEdu-27B-Q6_K-NInfer es una conversión del modelo educativo multimodal Omni-Edu-27B (obra de lhpku20010120) al formato propietario NInfer, publicada por el usuario 2beng2. No se trata de un modelo entrenado desde cero, sino de un artefacto de despliegue: el autor declara que las 514 matrices de texto conservan los bytes originales del GGUF, que la torre de visión se mantiene en BF16 y que se incorpora un borrador DFlash2 en Q8 para decodificación especulativa. El resultado es un checkpoint orientado a inferencia de imagen-texto a texto con 27.000 millones de parámetros, presumiblemente derivado de la familia Qwen3.5 según las etiquetas del repositorio.

La relevancia de esta ficha es doble. Por un lado, documenta un modelo especializado en educación con capacidades de visión, pensado para tutoría y resolución de problemas sobre imágenes. Por otro, ejemplifica una tendencia creciente: artefactos de inferencia empaquetados con motores propietarios (NInferEZ) que no son compatibles con Transformers ni con llama.cpp, lo que condiciona por completo su adopción en producción.

El checkpoint exige NInferEZ Manager 1.1.0 y Engine 1.1.0 o superior, una versión que en el momento de la publicación aún no había sido aprobada para su distribución. El modelo base se entrenó con secuencias de 32.768 tokens, aunque la configuración recomendada asigna 131.072 tokens de capacidad de contexto y KV en Q8.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (imagen-texto a texto), base derivada de Qwen3.5 según etiquetas del autor |
| Parametros totales | 27.000 millones (27B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 131.072 tokens según perfil recomendado; entrenamiento original con 32.768 tokens |
| Tipos de cuantizacion | Q6_K para las 514 matrices de texto (bytes GGUF originales), visión en BF16, borrador DFlash2 en Q8, estado GDN en FP32 |
| Idiomas soportados | no disponible (se mencionan pruebas en hebreo e inglés, sin lista oficial) |
| Licencia | other (se mantiene la designación upstream; el repositorio del proyecto publica Apache-2.0) |
| Formato de pesos | NInfer (propietario); no compatible con Transformers ni llama.cpp |
| Tamano del repositorio | 25,8 GB |
| Libreria de inferencia | ninfer (NInferEZ Manager 1.1.0 / Engine 1.1.0+) |
| Pipeline | image-text-to-text |

## Arquitectura y entrenamiento

La información disponible describe el artefacto, no el entrenamiento. Se sabe que el modelo subyacente es Omni-Edu-27B, un transformer multimodal de 27B parámetros con torre de visión, y que las etiquetas del repositorio lo vinculan a la familia Qwen3.5. El autor de la conversión indica que el checkpoint no incluye ningún componente MTP entrenado y que la cabeza de salida completa del modelo objetivo permanece intacta.

La innovación técnica de esta publicación no está en el entrenamiento sino en el empaquetado para inferencia: decodificación especulativa con un borrador DFlash2 nativo en Q8 (cabecera de propuesta indexada, K7, ngram 15, chunk de prefill 512), superposición de visión, estado GDN en FP32 y reserva de 256 MiB para CUDA Graph. El autor no aporta datos sobre número de tokens de entrenamiento, composición del dataset ni si hubo RLHF o DPO en el modelo original.

## Capacidades

- Generación de texto y razonamiento de tipo educativo, orientado a tutoría y explicación de conceptos.
- Procesamiento de imágenes combinadas con texto (pipeline image-text-to-text), útil para resolver ejercicios escaneados o fotografías de pizarras.
- Decodificación especulativa integrada mediante borrador DFlash2, con aceleración dependiente del motor NInferEZ.
- Modo thinking desactivado en el perfil recomendado; el autor del modelo base define los parámetros de muestreo (temperatura 1.0, top_p 0.95, top_k 20).
- Soporte multilingüe parcial: se documentan pruebas en hebreo e inglés, sin lista oficial de idiomas.
- Tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades de audio: no disponibles.

## Casos de uso

- Tutoría educativa multimodal: el modelo puede recibir la fotografía de un ejercicio de matemáticas o física y generar una explicación paso a paso, aprovechando la torre de visión en BF16 y el contexto de hasta 131.072 tokens para incluir el enunciado completo y material de referencia.
- Corrección automática de exámenes con imágenes: integrado en una plataforma de evaluación, procesaría capturas de respuestas manuscritas o impresas y devolvería una calificación razonada, con la ventaja de que el perfil recomendado limita la concurrencia a una petición, lo que encaja en flujos por lotes secuenciales.
- Asistente de estudio con documentos largos: la asignación de 131.072 tokens permite cargar apuntes, libros de texto o transcripciones extensas y mantener conversaciones multi-turno sobre ellos, aunque la calidad más allá de 32.768 tokens no está garantizada por el entrenamiento original.
- Generación de material didáctico: producción de explicaciones, resúmenes y preguntas de práctica a partir de imágenes de temario, con el modo thinking desactivado para obtener respuestas directas y de baja latencia.
- Investigación sobre decodificación especulativa: el checkpoint sirve como banco de pruebas para medir el rendimiento de DFlash2 con borrador Q8 sobre un modelo de 27B, con tasas documentadas de 65,4 tokens/s en hebreo, 155,7 en tutoría en inglés y 255,6 en Python.
- Evaluación comparativa de motores de inferencia: al conservar los bytes GGUF originales en las matrices de texto, permite contrastar la fidelidad de NInferEZ frente a llama.cpp en una prueba fija de 32 preguntas, donde el autor reporta 31/32 aciertos y coincidencia total con las respuestas de referencia.
- Despliegue en estación de trabajo con GPU única: la calibración se realizó en una RTX 5090, de modo que un equipo con 32 GB de VRAM puede ejecutar el modelo con el perfil recomendado, siempre que acepte las restricciones de concurrencia y la dependencia de un motor propietario.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K) en la información disponible. El autor únicamente reporta métricas de cualificación del motor:

| Metrica | Valor | Condiciones |
|---|---|---|
| Prueba fija de 32 preguntas | 31/32 aciertos, coincidencia con referencia GGUF en 32/32 | Engine 1.0.0 build 1.0.0-core-69c75330, RTX 5090 |
| Pruebas de imagen | 3/3 superadas | Misma configuración |
| Decodificación, hebreo | 65,4 tokens/s (mediana) | Prompts cortos, 3 repeticiones de 192 tokens de salida |
| Decodificación, tutoría en inglés | 155,7 tokens/s (mediana) | Prompts cortos, 3 repeticiones de 192 tokens de salida |
| Decodificación, Python | 255,6 tokens/s (mediana) | Prompts cortos, 3 repeticiones de 192 tokens de salida |
| Prefill en frío de 129.536 tokens | 50,67 s | Entrada casi completa |
| Turno de código con caché | 6,12 s para 64 tokens nuevos | Caso aislado, causa en investigación |

El propio autor advierte que estas tasas corresponden a prompts cortos y no representan el rendimiento a contexto completo, y que no constituyen resultados de la versión 1.1.0 del motor.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 25,8 GB en Q6_K con visión en BF16; se necesita margen adicional para el KV en Q8, el estado GDN en FP32 y la reserva de 256 MiB para CUDA Graph. Un presupuesto de 30-32 GB es realista para el perfil recomendado.
- GPU validadas: RTX 5090 (calibración oficial del autor). No se documentan pruebas en A100, H100 ni otras tarjetas.
- GPU de consumo: cabe en RTX 5090 y, con ajustes, en tarjetas de 32 GB como RTX 5090 o profesionales con esa dotación; no es viable en GPU de 24 GB con el perfil completo.
- Opciones de despliegue: exclusivamente NInferEZ Manager 1.1.0 y Engine 1.1.0 o superior. No es compatible con vLLM, llama.cpp, Ollama ni TGI.
- Concurrencia: una petición simultánea y un estado de dispositivo adicional; sin caché en host.
- Latencia y throughput: ver la tabla de benchmarks; el prefill de contexto casi completo ronda los 50 s en frío y la decodificación en prompts cortos oscila entre 65 y 256 tokens/s según el dominio.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato y motor | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| OmniEdu-27B-Q6_K-NInfer | 27B | 131.072 tokens asignados (entrenado a 32.768) | NInfer / NInferEZ 1.1.0+ | other | Requiere motor no publicado en el momento de la subida |
| Omni-Edu-27B (upstream) | 27B | 32.768 tokens de entrenamiento | Safetensors y GGUF | other | Disponible en Hugging Face |
| Qwen3.8-27B-DFlash2 (origen del borrador) | 27B | no disponible | DFlash2 | no disponible | Disponible en Hugging Face (incoai) |

No se dispone de datos de benchmarks que permitan comparar la calidad de estos modelos entre sí. La comparación relevante es operativa: el artefacto NInfer solo es ejecutable con un motor propietario cuya versión requerida no estaba aprobada para su distribución en el momento de la publicación, mientras que el modelo upstream puede desplegarse con herramientas estándar.

## Limitaciones y advertencias

- Dependencia crítica de software: requiere NInferEZ Manager 1.1.0 y Engine 1.1.0 o superior, una versión que el autor describe como aún no aprobada para su publicación. Sin ese motor, el checkpoint es inutilizable.
- Incompatibilidad con el ecosistema estándar: no es un archivo de Transformers ni de llama.cpp, lo que excluye vLLM, TGI, Ollama y la mayoría de pipelines habituales.
- Contexto efectivo limitado: el modelo base se entrenó con 32.768 tokens; la asignación de 128K y las pruebas de recuperación exitosas no garantizan calidad general en tareas de contexto largo, según advierte el propio autor.
- Evidencia empírica muy reducida: la cualificación se basa en 32 preguntas de opción fija y 3 pruebas de imagen, sin benchmarks públicos. El autor reconoce que las probabilidades y algunas respuestas largas difieren de la referencia.
- Rendimiento a contexto completo no caracterizado: la anomalía de 6,12 s para procesar 64 tokens nuevos con caché casi llena está en investigación y sugiere posibles problemas de escalado.
- Licencia ambigua: se mantiene la designación "other" del upstream, mientras el repositorio del proyecto publica Apache-2.0. Es necesario revisar los textos de licencia incluidos antes de cualquier uso comercial.
- Riesgo de alucinación: no se documentan evaluaciones de veracidad ni de sesgos; al tratarse de un modelo educativo, los errores factuales en explicaciones son un riesgo directo para el usuario final.
- Idiomas no declarados oficialmente: solo hay evidencia anecdótica en hebreo e inglés, sin garantías para castellano u otras lenguas.
- Concurrencia limitada a una petición simultánea en el perfil recomendado, lo que restringe su uso en servicios de alta demanda.
- Trazabilidad: el autor atribuye crédito a OmniEdu, Qwen e Inco AI, pero no se detalla la composición del dataset ni el proceso de entrenamiento del modelo base.

## Enlaces

- Repositorio Hugging Face del artefacto: https://huggingface.co/2beng2/OmniEdu-27B-Q6_K-NInfer
- Modelo base upstream: https://huggingface.co/lhpku20010120/Omni-Edu-27B
- Borrador DFlash2 de referencia: https://huggingface.co/incoai/Qwen3.8-27B-DFlash2
- Perfil de 2beng2 en Hugging Face: https://huggingface.co/2beng2/models
- Preset de configuración: ./OmniEdu-27B-Q6_K-Vision-DFlash2.ninferez.json (incluido en el repositorio)
- Manifiesto del modelo: ./model-manifest.json (incluido en el repositorio)
- Aviso legal: ./NOTICE (incluido en el repositorio)
