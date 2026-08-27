# alirezaaminzadeh/clinicguide-rag-pipeline

## Resumen

ClinicGuide RAG pipeline es un repositorio de configuración que documenta el sistema de recuperación aumentada por generación (RAG) para el asistente de turismo médico ClinicGuide. No contiene un modelo de lenguaje entrenado ni pesos de LLM; se trata de una configuración de retrieval híbrido que combina TF-IDF léxico (a nivel de palabra y de carácter) con BM25, y que opcionalmente utiliza el modelo Qwen3-8B a través de Hugging Face Inference Providers para reescritura de consultas. El sistema responde preguntas a partir de un corpus de FAQ específico del dominio médico-turístico.

La relevancia de este proyecto radica en su enfoque práctico: en lugar de entrenar un modelo médico desde cero, aprovecha técnicas clásicas de recuperación combinadas con un LLM externo para generar respuestas contextualizadas. Esto reduce costes de entrenamiento y permite actualizar el conocimiento sin reentrenar, una ventaja clave en dominios regulados como la salud. El repositorio incluye un archivo `config.json` con parámetros de producto, idiomas, política de seguridad y ajustes de retrieval, y se complementa con un dataset de FAQ y un Space de Hugging Face para demostración.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline RAG híbrido: TF-IDF (word y char) + BM25, con reescritura opcional via Qwen3-8B |
| Parametros totales | No disponible (no es un modelo con pesos propios) |
| Parametros activos | No aplicable (no es un modelo MoE) |
| Longitud de contexto | No disponible (depende del LLM externo usado para reescritura) |
| Tipos de cuantizacion | No disponible (no se distribuyen pesos) |
| Idiomas soportados | Multilingue (segun config.json, no se especifican idiomas concretos) |
| Licencia | Apache-2.0 |
| Formato de pesos | No aplicable (solo configuracion JSON) |

## Arquitectura y entrenamiento

El sistema no sigue una arquitectura de red neuronal propia. Se compone de un pipeline de recuperación híbrida que combina tres métodos de búsqueda léxica: TF-IDF sobre tokens de palabra, TF-IDF sobre n-gramas de caracteres y BM25. Estos métodos se combinan para obtener una puntuación de relevancia sobre el corpus de FAQ. Opcionalmente, una etapa de reescritura de consultas utiliza el modelo Qwen3-8B a través de Hugging Face Inference Providers, lo que permite reformular la pregunta del usuario antes de la recuperación. No se ha realizado entrenamiento de modelos; la configuración define hiperparámetros de retrieval y los identificadores de los modelos de chat externos. El dataset de FAQ se encuentra en un repositorio separado (`alirezaaminzadeh/clinicguide-faq-corpus`).

## Capacidades

- Recuperación de respuestas a partir de un corpus FAQ estructurado en el dominio de turismo médico.
- Búsqueda híbrida con TF-IDF (word y char) y BM25, lo que permite capturar tanto coincidencias exactas como variaciones morfológicas.
- Reescritura opcional de consultas mediante Qwen3-8B para mejorar la recuperación en preguntas complejas o mal formuladas.
- Soporte multilingue declarado en la configuración, aunque no se detallan los idiomas concretos.
- Integración con Hugging Face Spaces para demostración interactiva.
- No incluye generación de texto propia; la respuesta final se obtiene del LLM externo tras la recuperación.

## Casos de uso

- Asistente de atención al paciente en clínicas de turismo médico: el pipeline recupera respuestas a preguntas frecuentes sobre procedimientos, costes, visados y estancias, y el LLM externo las reformula en un tono conversacional.
- Sistema de soporte multilingue para pacientes internacionales: la combinación de TF-IDF y BM25 permite manejar consultas en varios idiomas sin necesidad de modelos multilingues entrenados específicamente.
- Base de conocimiento actualizable sin reentrenamiento: al separar la recuperación de la generación, se pueden añadir nuevas FAQs al corpus sin tocar el LLM, reduciendo costes de mantenimiento.
- Filtrado de consultas sensibles: la política de seguridad definida en `config.json` permite bloquear preguntas fuera del ámbito médico o con contenido inapropiado antes de la generación.
- Prototipo de RAG para dominios regulados: sirve como referencia de implementación para equipos que necesitan desplegar RAG en salud con requisitos de trazabilidad y control de contenido.
- Evaluación de retrieval híbrido: el repositorio puede usarse como banco de pruebas para comparar TF-IDF, BM25 y reescritura con LLM en tareas de QA sobre corpus especializados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen métricas de precisión, recall o latencia para el pipeline de recuperación ni comparaciones con otros sistemas RAG.

## Requisitos de hardware

- No requiere GPU para la parte de retrieval: TF-IDF y BM25 se ejecutan en CPU con recursos mínimos (menos de 1 GB de RAM para un corpus FAQ típico).
- La reescritura con Qwen3-8B requiere acceso a Hugging Face Inference Providers, por lo que el hardware local solo necesita conexión a internet y una API key.
- Si se desea ejecutar Qwen3-8B localmente, se necesitaría una GPU con al menos 16 GB de VRAM en cuantización de 8 bits, o 32 GB en precisión completa.
- Opciones de despliegue: el pipeline puede ejecutarse como script Python con scikit-learn, o integrarse en un servicio web mediante FastAPI o Gradio (como el Space de demostración).
- No se dispone de datos de latencia o throughput medidos.

## Comparativa con modelos similares

No disponible. Este repositorio no es un modelo de lenguaje comparable con LLMs como Qwen, Llama o Mistral. Como sistema RAG, podría compararse con frameworks como LangChain o Haystack, pero no se dispone de datos de rendimiento para establecer una comparación objetiva. La única referencia directa es el propio ecosistema ClinicGuide, que incluye el dataset de FAQ y el Space de demostración.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto por sí mismo; depende de un LLM externo (Qwen3-8B) para la reescritura y la generación final de respuestas.
- La calidad de las respuestas depende directamente de la cobertura del corpus FAQ; preguntas fuera del corpus pueden producir recuperaciones irrelevantes.
- No se especifican los idiomas soportados en la documentación pública, lo que limita la evaluación de su alcance multilingue.
- La política de seguridad está definida en `config.json`, pero no se detallan los mecanismos de filtrado ni su eficacia.
- No se han publicado evaluaciones de sesgos o alucinaciones; al usar un LLM externo, hereda los riesgos de ese modelo.
- La licencia Apache-2.0 permite uso comercial, pero el LLM externo (Qwen3-8B) tiene su propia licencia que debe revisarse por separado.
- El repositorio no incluye datos de pacientes ni garantías de cumplimiento con regulaciones sanitarias (GDPR, HIPAA, etc.).

## Enlaces

- Repositorio del modelo: https://huggingface.co/alirezaaminzadeh/clinicguide-rag-pipeline
- Dataset de FAQ: https://huggingface.co/datasets/alirezaaminzadeh/clinicguide-faq-corpus
- Space de demostración: https://huggingface.co/spaces/alirezaaminzadeh/clinicguide-medical-tourism-assistant
- Perfil del autor: https://huggingface.co/alirezaaminzadeh/models
