# mistralai/Mistral-Large-3-675B-Instruct-2512-NVFP4

## Resumen

Mistral Large 3 675B Instruct 2512 NVFP4 es la versión cuantizada en NVFP4 del modelo instructivo insignia de Mistral AI, un transformer multimodal con arquitectura de mezcla de expertos (MoE) granular. Desarrollado por mistralai, combina un modelo de lenguaje MoE de 673B parámetros totales con 39B activos y un codificador visual de 2,5B parámetros, sumando 675B parámetros totales y 41B activos. Está entrenado desde cero sobre 3000 GPU H200 y se distribuye bajo licencia Apache 2.0, lo que permite uso comercial y modificación.

El modelo resuelve la necesidad de asistentes de producción con contexto largo (256k tokens), capacidades agénticas nativas (function calling y salida JSON), soporte multilingüe en once idiomas y comprensión de imágenes. Esta variante concreta es una cuantización post-entrenamiento de las activaciones generada con llm-compressor en colaboración con los equipos de vLLM y Red Hat, y está pensada para desplegarse en un único nodo de GPU H100 o A100, algo imposible con los pesos en FP8.

Su relevancia actual radica en que permite ejecutar un modelo de frontera de 675B parámetros en hardware de generación anterior mediante cuantización NVFP4, manteniendo un rendimiento similar al checkpoint original según el autor. Los pesos se recalibraron en septiembre de 2026 para recuperar el rendimiento en contexto largo del modelo original.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal con MoE granular (modelo de lenguaje MoE + codificador visual) |
| Parámetros totales | 675B (673B en el modelo de lenguaje + 2,5B en el codificador visual) |
| Parámetros activos | 41B (39B en el modelo de lenguaje + 2,5B de visión) |
| Longitud de contexto | 256k tokens |
| Tipos de cuantización | NVFP4 (cuantización post-entrenamiento de activaciones); existe checkpoint FP8 original |
| Idiomas soportados | en, fr, es, de, it, pt, nl, zh, ja, ko, ar |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors con compressed-tensors (repo de 403,2 GB); compatible con vLLM |

## Arquitectura y entrenamiento

Mistral Large 3 emplea una arquitectura de mezcla de expertos granular para el componente de lenguaje, con 673B parámetros totales y 39B activos por token, a los que se añade un codificador visual de 2,5B parámetros que habilita la entrada de imágenes. El modelo se entrenó desde cero utilizando 3000 GPU H200. La variante aquí descrita es la versión instructiva, sometida a post-entrenamiento para tareas de instrucción, y posteriormente cuantizada a NVFP4 mediante llm-compressor, herramienta del ecosistema vLLM, en colaboración con Red Hat y NVIDIA.

La innovación técnica principal de este checkpoint es la cuantización NVFP4 de las activaciones tras el post-entrenamiento, que reduce los requisitos de memoria hasta el punto de permitir el despliegue en un solo nodo de H100 o A100, frente al FP8 que exige B200 o H200. En septiembre de 2026 se recalibraron los pesos para alinear el rendimiento en contexto largo con el del modelo original. No se detalla en la información disponible la composición exacta del dataset de entrenamiento ni si se aplicaron técnicas de RLHF o DPO más allá de la mención al post-entrenamiento instructivo.

## Capacidades

- Generación de texto y razonamiento general de propósito amplio.
- Comprensión de imágenes: analiza contenido visual y responde en combinación con texto.
- Multilingüismo en once idiomas: inglés, francés, español, alemán, italiano, portugués, neerlandés, chino, japonés, coreano y árabe.
- Soporte robusto de system prompt con alta adherencia.
- Capacidades agénticas nativas: function calling y salida en JSON.
- Razonamiento multi-paso orientado a flujos agénticos y uso de herramientas.
- Comprensión de documentos largos gracias a la ventana de 256k tokens.
- No es un modelo de razonamiento dedicado: los modelos específicos de reasoning pueden superarlo en tareas de razonamiento estricto.

## Casos de uso

- Comprensión de documentos largos: el modelo puede procesar contratos, informes o expedientes de hasta 256k tokens en una sola pasada, lo que permite resumir, extraer cláusulas o responder preguntas sobre corpus extensos sin fragmentación.
- Asistentes corporativos de uso diario: con temperatura inferior a 0,1 y un system prompt bien definido, sirve como asistente conversacional multi-turno estable para empleados, manteniendo coherencia entre sesiones largas.
- Flujos agénticos y uso de herramientas: su function calling nativo y la salida JSON permiten integrarlo en orquestadores de agentes que encadenan llamadas a APIs, consultas a bases de datos y acciones sobre sistemas internos, limitando el número de herramientas expuestas para no saturar el contexto.
- Asistente de programación general: puede generar y explicar código, revisar fragmentos y asistir en tareas de desarrollo, integrándose en pipelines mediante llamadas a la API compatible con OpenAI de vLLM.
- Sistemas de recuperación aumentada (RAG): la ventana de 256k tokens permite inyectar grandes conjuntos de documentos recuperados junto con la consulta, reduciendo la pérdida de contexto en comparación con modelos de ventana corta.
- Análisis de imágenes en entornos empresariales: con el codificador visual puede extraer información de capturas, diagramas o documentos escaneados, recomendándose imágenes con relación de aspecto cercana a 1:1 para un rendimiento óptimo.
- Cargas científicas y de conocimiento empresarial: adecuado para tareas que requieren comportamiento consistente entre dominios y capacidades de frontera, como síntesis de literatura técnica o extracción estructurada de información.

## Benchmarks y rendimiento

La model card incluye gráficas comparativas frente a modelos de tamaño similar, pero los valores numéricos no están disponibles en formato textual en la información proporcionada. El autor indica que con este checkpoint NVFP4 deberían observarse resultados similares a los del modelo original Mistral-Large-3-675B-Instruct-2512.

No se han publicado resultados de benchmarks en formato numérico en la información disponible.

## Requisitos de hardware

- VRAM estimada: el repo de pesos ocupa 403,2 GB, por lo que la inferencia requiere un nodo con al menos esa capacidad agregada; el despliegue en NVFP4 está diseñado para un único nodo de GPU H100 o A100.
- GPU recomendadas: el autor indica H100 o A100 para esta variante NVFP4; la variante FP8 requiere un nodo de B200 o H200.
- GPU de consumo: no cabe en GPU de consumo (RTX 4090, etc.) dado el tamaño del modelo y del repo.
- Opciones de despliegue: vLLM >= 0.12.0 es el framework recomendado; requiere mistral_common >= 1.8.6, que se instala automáticamente con vLLM. Existe imagen Docker oficial de vLLM.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros totales / activos | Contexto | Licencia | Despliegue |
|---|---|---|---|---|
| Mistral Large 3 675B Instruct 2512 NVFP4 | 675B / 41B | 256k | Apache 2.0 | Nodo único H100 o A100 (NVFP4) |
| Mistral Large 3 675B Instruct 2512 (FP8) | 675B / 41B | 256k | Apache 2.0 | Nodo único B200 o H200 (FP8) |
| Mistral Large 3 675B Base 2512 | 675B / no disponible | no disponible | no disponible | no disponible |

No se dispone en la información proporcionada de datos de rendimiento comparado con modelos de otros desarrolladores.

## Limitaciones y advertencias

- No es un modelo de razonamiento dedicado: puede quedar por detrás de modelos específicos de reasoning en tareas de razonamiento estricto.
- En tareas multimodales puede situarse por detrás de modelos optimizados para visión.
- El despliegue es complejo por su tamaño y arquitectura, especialmente con recursos limitados o a gran escala.
- La cuantización NVFP4 es post-entrenamiento de activaciones; aunque el autor afirma un rendimiento similar al original, conviene validar en el caso de uso concreto.
- Se recomienda temperatura inferior a 0,1 en producción y entornos de uso diario.
- Para visión, se recomienda mantener relaciones de aspecto cercanas a 1:1 y recortar imágenes muy alargadas.
- Conviene limitar el número de herramientas expuestas en sistemas agénticos para no sobrecargar el contexto.
- Riesgo de alucinación y sesgos: no se detallan en la información disponible; deben evaluarse en el dominio de aplicación.
- La licencia Apache 2.0 permite uso comercial y modificación, pero la model card menciona un proceso de acceso con aceptación de términos y política de privacidad de Mistral AI.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mistralai/Mistral-Large-3-675B-Instruct-2512-NVFP4
- Modelo base: https://huggingface.co/mistralai/Mistral-Large-3-675B-Base-2512
- Checkpoint FP8 original: https://huggingface.co/mistralai/Mistral-Large-3-675B-Instruct-2512
- Commit de recalibración de pesos: https://huggingface.co/mistralai/Mistral-Large-3-675B-Instruct-2512-NVFP4/commit/dfdcfef17b14be6dbb0a7e55c81133cb578778c1
- llm-compressor: https://github.com/vllm-project/llm-compressor
- vLLM: https://github.com/vllm-project/vllm
- Dockerfile de vLLM: https://github.com/vllm-project/vllm/blob/main/docker/Dockerfile
- Imagen Docker de vLLM en Docker Hub: https://hub.docker.com/layers/vllm/vllm-openai/latest
- mistral-common: https://github.com/mistralai/mistral-common
- Release de mistral-common 1.8.6: https://github.com/mistralai/mistral-common/releases/tag/v1.8.6
- Sitio de Mistral AI: https://mistral.ai/
- Política de privacidad de Mistral AI: https://mistral.ai/terms/
