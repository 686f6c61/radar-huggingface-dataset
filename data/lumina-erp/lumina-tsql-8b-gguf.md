# Lumina-ERP/lumina-tsql-8b-GGUF

## Resumen

Lumina-ERP/lumina-tsql-8b-GGUF es un modelo de generación de texto especializado en la traducción de lenguaje natural a consultas T-SQL para SQL Server, orientado a entornos ERP. Lo desarrolla Lumina-ERP, una consultora estadounidense especializada en sistemas ERP como Prophet 21 y Epicor Kinetic, y su distribución se realiza a través de HuggingFace con acceso restringido (gated).

El modelo se basa en la arquitectura Qwen3, con 8.190 millones de parámetros, y se publica en formato GGUF para su uso con llama.cpp y Ollama. Está diseñado para cubrir el hueco de generación automática de consultas T-SQL en contextos empresariales, donde los desarrolladores necesitan convertir preguntas en lenguaje natural a SQL Server de forma fiable. Aunque el repositorio indica que el idioma soportado es únicamente inglés, su especialización en T-SQL lo hace relevante para equipos de desarrollo de software ERP que trabajan con Microsoft SQL Server.

El modelo se acompaña de un dataset propio, `Lumina-ERP/erpbench-distribution`, que probablemente contiene ejemplos de preguntas y consultas T-SQL de dominio empresarial. No se han publicado aún benchmarks ni documentación técnica detallada, y el acceso al repositorio requiere aceptar condiciones en HuggingFace, lo que limita la evaluación independiente por el momento.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Basado en Qwen3 (detalles exactos no publicados) |
| Parametros totales | 8.190.735.360 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (formato GGUF; se asume multiples variantes) |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo se presenta como una adaptación de Qwen3, la familia de modelos de Alibaba, para la tarea de text-to-SQL. Al ser un modelo de 8B de parámetros, probablemente emplea una arquitectura transformer densa con atención causal estándar, pero no se han publicado detalles concretos sobre la configuración (número de capas, heads, factor de expansión de feedforward, etc.).

En cuanto a los datos de entrenamiento, el repositorio referencia el dataset `Lumina-ERP/erpbench-distribution`, que parece ser un conjunto de ejemplos de preguntas en lenguaje natural emparejadas con consultas T-SQL en el dominio de ERP. No hay información pública sobre el número de tokens de entrenamiento, el balance de datos ni si se aplicaron técnicas de RLHF o DPO. La elección de Qwen3 como base sugiere que se parte de un modelo ya fuerte en razonamiento y generación de código, pero no se detalla el proceso de fine-tuning.

## Capacidades

- Generación de consultas T-SQL a partir de texto en lenguaje natural, orientado a SQL Server.
- Soporte de conversación multi-turno (etiqueta `conversational`), lo que permite refinar consultas mediante iteraciones.
- Generación de texto en inglés, con limitación a este idioma.
- Compatibilidad con herramientas de inferencia local como llama.cpp y Ollama, gracias al formato GGUF.
- No se indica soporte explícito de tool calling, function calling ni modo de agente.
- No se dispone de información sobre capacidades de vision, audio u otras modalidades.

## Casos de uso

- Asistente de consultas para equipos de desarrollo de ERP: el modelo puede convertir peticiones de negocio en consultas T-SQL, reduciendo el tiempo de desarrollo de informes y pantallas en sistemas como Prophet 21 o Epicor Kinetic.
- Generación de informes dinámicos: integrado en una aplicación de BI, puede traducir preguntas de analistas de negocio en consultas SQL que se ejecutan contra una base de datos de SQL Server, generando resultados en tiempo real.
- Soporte de atención al cliente interno: un chatbot que responde a preguntas de empleados sobre datos de inventario o pedidos, generando consultas T-SQL de forma automática y devolviendo los resultados formateados.
- Automatización de pruebas de bases de datos: durante el desarrollo de integraciones ERP, el modelo puede generar consultas de validación a partir de descripciones de escenarios de prueba.
- Migración de sistemas ERP: en procesos de migración de datos desde sistemas heredados, el modelo puede ayudar a generar consultas de extracción y transformación en T-SQL a partir de documentación funcional.
- Formación de nuevos desarrolladores: el modelo puede actuar como tutor, explicando cómo se construyen consultas T-SQL complejas a partir de preguntas de negocio, facilitando la curva de aprendizaje.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni de evaluaciones específicas de text-to-SQL como Spider o BIRD. El repositorio no incluye una tabla de resultados ni enlaces a papers de evaluación.

## Requisitos de hardware

- Al tratarse de un modelo de 8B de parámetros en formato GGUF, es ejecutable en GPUs de consumo con suficiente VRAM, como una RTX 3090 o RTX 4090, dependiendo de la cuantización elegida.
- La VRAM estimada para inferencia en FP16 sería de aproximadamente 16 GB; con cuantización Q4_K_M o Q5_K_M, se puede reducir a unos 5-7 GB, lo que lo hace viable en GPUs de 8-12 GB.
- Se recomienda usar llama.cpp o Ollama para la inferencia local, ya que son los motores indicados en los tags del modelo.
- Para despliegue en producción con concurrencia, se puede considerar vLLM o TGI, aunque no se indica compatibilidad explícita con estos motores.
- No se proporcionan datos de latencia ni throughput.

## Comparativa con modelos similares

No disponible. No se han encontrado datos comparativos con otros modelos de text-to-SQL de tamaño similar. Se podría comparar con modelos como CodeLlama-7B, Mistral-7B o Qwen2.5-7B, pero no se dispone de resultados de evaluación para Lumina-tsql-8b que permitan una comparación rigurosa.

## Limitaciones y advertencias

- Acceso restringido: el modelo es de acceso gated en HuggingFace, por lo que se requiere aceptar condiciones antes de descargarlo, lo que puede limitar su uso en proyectos de evaluación rápida.
- Idioma: solo se soporta inglés, por lo que no es adecuado para consultas en español u otros idiomas sin una adaptación previa.
- Riesgo de alucinación: como cualquier modelo de lenguaje, puede generar consultas SQL sintácticamente válidas pero semánticamente incorrectas, especialmente en esquemas de bases de datos complejos o con vocabulario específico de dominio.
- Falta de documentación técnica: no se han publicado detalles sobre el proceso de entrenamiento, la arquitectura exacta ni la evaluación, lo que dificulta la confianza para uso en producción.
- Dependencia de Qwen3: al estar basado en Qwen3, las limitaciones y sesgos de este modelo base pueden heredarse, aunque no se han documentado.
- Sin garantías de rendimiento: al no existir benchmarks públicos, no se puede afirmar que el modelo supere o iguale a otras soluciones de text-to-SQL en el mercado.

## Enlaces

- Repositorio de HuggingFace: https://huggingface.co/Lumina-ERP/lumina-tsql-8b-GGUF
- Modelo base (safetensors): https://huggingface.co/Lumina-ERP/lumina-tsql-8b
- Dataset de entrenamiento: https://huggingface.co/datasets/Lumina-ERP/erpbench-distribution
- Sitio web de Lumina ERP: https://lumina-erp.com/ (no relacionado directamente con el modelo, pero es el contexto de la empresa)

Nota: los resultados de búsqueda web no aportaron información técnica adicional sobre este modelo específico, ya que se refieren a otros proyectos con el nombre Lumina (BytePlus Lumina, Lumina-AI-Core, etc.).</think>## Resumen

Lumina-ERP/lumina-tsql-8b-GGUF es un modelo de lenguaje especializado en la generación de consultas T-SQL para Microsoft SQL Server a partir de texto en lenguaje natural, orientado al dominio de los sistemas ERP. Lo desarrolla Lumina-ERP, una consultora estadounidense con sede en Houston especializada en la implementación y el soporte de plataformas ERP como Prophet 21 y Epicor Kinetic. El modelo se distribuye en formato GGUF, lo que permite su ejecución local con motores como llama.cpp y Ollama.

El modelo parte de la arquitectura Qwen3 y cuenta con 8.190 millones de parámetros, un tamaño que lo sitúa en el rango de modelos que pueden ejecutarse en hardware de consumo con cuantización. Se acompaña de un dataset propio llamado `erpbench-distribution`, que probablemente contiene ejemplos de preguntas empresariales emparejadas con consultas T-SQL. La publicación es reciente (agosto de 2026) y el acceso está restringido en HuggingFace, por lo que aún no se han publicado benchmarks ni documentación técnica detallada.

El interés de este modelo reside en su enfoque vertical: en lugar de un modelo generalista de text-to-SQL, está pensado específicamente para el contexto de los sistemas ERP, donde las consultas suelen involucrar esquemas complejos de inventario, pedidos, clientes y facturación. Esto puede suponer una ventaja frente a modelos generalistas si el dataset de entrenamiento refleja bien la terminología y los patrones de consulta del dominio.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Basado en Qwen3 (detalles exactos no publicados) |
| Parametros totales | 8.190.735.360 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (formato GGUF; se asumen varias variantes de cuantización) |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo se presenta como una adaptación de Qwen3, una familia de modelos de transformer con decodificador causal desarrollada por Alibaba. Al tener 8.190 millones de parámetros, se trata de un modelo denso, sin arquitectura de mezcla de expertos (MoE). No se han publicado detalles sobre el número de capas, el tamaño de la dimensión oculta ni el factor de expansión de la red feed-forward.

En cuanto al entrenamiento, el repositorio referencia el dataset `Lumina-ERP/erpbench-distribution`, que parece ser un conjunto de datos de dominio específico para la generación de T-SQL en contextos ERP. No se han publicado datos sobre el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO. El etiquetado como modelo `conversational` sugiere que se ha optimizado para interacciones de múltiples turnos, pero no hay confirmación de ello en la documentación disponible.

## Capacidades

- Generación de consultas T-SQL a partir de texto en lenguaje natural, orientado a SQL Server.
- Soporte de conversación multi-turno, lo que permite refinar consultas de forma iterativa.
- Compatible con herramientas de inferencia local como llama.cpp y Ollama gracias al formato GGUF.
- Generación de texto en inglés, con un único idioma soportado.
- No se indica soporte de tool calling ni function calling.
- No se indican capacidades de vision, audio u otras modalidades.

## Casos de uso

- Asistencia a desarrolladores de ERP en la creación de consultas SQL: el modelo puede convertir peticiones de negocio en T-SQL, reduciendo el tiempo de desarrollo de informes en plataformas como Prophet 21 o Epicor Kinetic.
- Generación de informes de negocio bajo demanda: un analista puede preguntar por ejemplo "muestra las ventas por cliente del último trimestre" y el modelo genera la consulta SQL Server correspondiente.
- Integración en chatbots de soporte interno: un asistente conversacional que responde a preguntas de empleados sobre datos de inventario o pedidos, generando consultas SQL en tiempo real.
- Automatización de pruebas de bases de datos: durante el desarrollo de integraciones ERP, el modelo puede generar consultas de validación a partir de descripciones de escenarios de prueba.
- Migración de datos entre sistemas ERP: en procesos de migración, el modelo puede ayudar a generar consultas de extracción y transformación en T-SQL a partir de documentación funcional.
- Formación de nuevos desarrolladores: el modelo actúa como herramienta didáctica que explica cómo se construyen consultas T-SQL complejas a partir de preguntas de negocio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de datos de MMLU, HumanEval, GSM8K ni de evaluaciones específicas de text-to-SQL como Spider o CoS. El repositorio no incluye tablas de métricas ni enlaces a papers de evaluación.

## Requisitos de hardware

- Al tratarse de un modelo de 8B parámetros en formato GGUF, es viable ejecutarlo en GPUs de consumo con cuantización.
- VRAM estimada: con cuantización de 4 bits (por ejemplo, Q4_K_M), se requieren aproximadamente 5-6 GB de VRAM; con 8 bits, alrededor de 8-9 GB.
- GPUs recomendadas: RTX 3060 de 12 GB, RTX 4070 de 12 GB, RTX 4090 de 24 GB, o GPUs de datacenter como A10G o L4 para inferencia con más concurrencia.
- Despliegue: se recomienda usar llama.cpp o Ollama para inferencia local, ya que son los motores indicados en los tags del repositorio. Para producción con alta concurrencia, se puede considerar vLLM o TGI, aunque no se ha confirmado compatibilidad explícita.
- Latencia y throughput: no se disponen de datos medidos.

## Comparativa con modelos similares

No disponible. No se han encontrado datos comparativos de este modelo con otras alternativas de text-to-SQL de tamaño similar, como CodeLlama-7B, Mistral-7B o Qwen2.5-7B. No hay resultados de evaluación pública que permitan una comparación rigurosa.

## Limitaciones y advertencias

- Acceso restringido: el modelo es de tipo gated en HuggingFace, por lo que requiere aceptar condiciones antes de su uso, lo que puede dificultar la evaluación rápida.
- Idioma único: solo soporta inglés, por lo que no es adecuado para consultas en español u otros idiomas sin una adaptación previa.
- Riesgo de alucinación: como cualquier modelo de lenguaje, puede generar consultas SQL sintácticamente válidas pero semánticamente incorrectas, especialmente en esquemas de bases de datos complejos.
- Falta de documentación: no se han publicado detalles del proceso de entrenamiento, datos de evaluación ni límites de contexto, lo que dificulta la confianza para uso en producción.
- Dependencia de Qwen3: las limitaciones y sesgos del modelo base pueden heredarse, aunque no se han documentado.
- Licencia Apache 2.0: aunque permite uso comercial, la restricción de acceso del repositorio puede limitar su distribución o uso en entornos corporativos.
- Sin benchmarks: no hay evidencia de rendimiento frente a otras soluciones, por lo que se recomienda una evaluación interna antes de adoptarlo en proyectos críticos.

## Enlaces

- Repositorio de HuggingFace: https://huggingface.co/Lumina-ERP/lumina-tsql-8b-GGUF
- Modelo base (safetensors): https://huggingface.co/Lumina-ERP/lumina-tsql-8b
- Dataset de entrenamiento: https://huggingface.co/datasets/Lumina-ERP/erpbench-distribution
- Sitio web de Lumina ERP: https://lumina-erp.com/ (contexto de la empresa, no documentación técnica del modelo)
