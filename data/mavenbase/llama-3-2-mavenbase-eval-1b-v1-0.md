# Mavenbase/Llama-3.2-Mavenbase-Eval-1B-v1.0

## Resumen

Llama-3.2-Mavenbase-Eval-1B-v1.0 es un ajuste fino (fine-tuning) del modelo meta-llama/Llama-3.2-1B-Instruct desarrollado por Mavenbase, un proyecto de ingeniería liderado por Aaditya Kamble. El modelo está especializado en la evaluación automatizada de entrevistas de colocación (campus placement) en disciplinas como informática, mecánica, civil, automoción, eléctrica, BBA, B.Com, MBA, BCA y MCA. Su propósito es servir como motor para la evaluación técnica y de método STAR, el diagnóstico acústico de compostura denominado "The Fear Score", la crítica de currículos frente a sistemas ATS y la orientación profesional estilo mentor.

El modelo parte de la arquitectura Llama 3.2 de 1B parámetros de Meta, lo que lo sitúa en la categoría de Small Language Model (SLM), adecuado para despliegues ligeros y de baja latencia. El ajuste se realizó mediante QLoRA, según las etiquetas del repositorio, lo que reduce los requisitos de memoria durante el entrenamiento y permite especializar el modelo base sin reentrenar todos los parámetros.

La relevancia del modelo radica en su enfoque vertical: no compite en capacidades generales con modelos de mayor tamaño, sino que ofrece una especialización concreta en evaluación de candidatos y generación de retroalimentación estructurada. Su licencia Llama 3.2 Community License impone restricciones de uso que conviene revisar antes de cualquier despliegue comercial. El repositorio tiene un tamaño de 0,1 GB y no registra descargas ni interacciones en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base: Llama 3.2 1B Instruct) |
| Parametros totales | 1B (aproximado, heredado del modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible (entrenado con QLoRA; pesos publicados en safetensors) |
| Idiomas soportados | en (ingles) |
| Licencia | llama3.2 (Llama 3.2 Community License Agreement) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura transformer decoder-only de Llama 3.2 1B Instruct, un SLM de Meta diseñado para inferencia eficiente en entornos con recursos limitados. El ajuste fino se realizó mediante QLoRA, técnica que cuantiza el modelo base a baja precisión y entrena adaptadores de bajo rango, lo que permite especializar el modelo con un coste computacional reducido. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron fases de RLHF o DPO posteriores al ajuste supervisado.

La especialización declarada abarca múltiples dominios académicos y profesionales, lo que sugiere un dataset de instrucciones orientado a tareas de evaluación de entrevistas, generación de preguntas técnicas, análisis de respuestas según el método STAR y producción de retroalimentación estructurada. Las etiquetas del repositorio incluyen "acoustic-telemetry" y "ats-roaster", lo que indica que el modelo puede formar parte de un pipeline más amplio que combine señales acústicas y análisis de currículos, aunque no se detalla cómo se integran esas señales en el propio modelo. No se han publicado detalles sobre innovaciones técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto en inglés orientada a evaluación de entrevistas técnicas y de método STAR.
- Evaluación de respuestas de candidatos en disciplinas de ingeniería, negocios y administración.
- Generación de retroalimentación estructurada estilo mentor para orientación profesional.
- Análisis de currículos con enfoque en sistemas ATS (crítica o "roasting" de CV).
- Soporte declarado para diagnóstico acústico de compostura ("The Fear Score"), aunque no se especifica la interfaz de entrada de audio.
- Capacidades multilingües limitadas al inglés según la etiqueta de idioma del repositorio.
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso explícito.
- No se documenta modo de pensamiento (thinking mode), visión ni audio nativo.

## Casos de uso

- Evaluación automatizada de entrevistas de colocación: el modelo puede generar preguntas técnicas por disciplina y evaluar las respuestas de candidatos con retroalimentación estructurada, aprovechando su ajuste específico en tracks de campus placement.
- Simulación de entrevistas STAR: permite generar escenarios de comportamiento y evaluar respuestas según la estructura Situación-Tarea-Acción-Resultado, útil en plataformas de preparación laboral.
- Crítica de currículos frente a ATS: el modelo puede analizar un CV y producir observaciones sobre formato, palabras clave y adecuación al puesto, orientado a herramientas de mejora de empleabilidad.
- Orientación profesional estilo mentor: generación de recomendaciones personalizadas sobre rutas de carrera, habilidades a desarrollar y preparación de entrevistas para estudiantes universitarios.
- Módulo de evaluación en plataformas de formación: integración como componente de scoring en bootcamps o programas de colocación, con salida en inglés para audiencias internacionales.
- Generación de bancos de preguntas por disciplina: producción de preguntas técnicas para ingeniería, negocios y administración, reutilizables en procesos de selección o autoevaluación.
- Componente de un pipeline de diagnóstico de compostura: aunque no se detalla la integración, el modelo puede combinarse con módulos externos de análisis acústico para generar informes de "Fear Score" a partir de transcripciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 2-3 GB para un modelo de 1B parámetros, más overhead de contexto y runtime.
- VRAM estimada en cuantización de 8 bits: aproximadamente 1-1,5 GB; en 4 bits: aproximadamente 0,7-1 GB (estimaciones orientativas, no confirmadas por el autor).
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM para FP16 (RTX 3050, RTX 4060, etc.); GPUs de datacenter (A100, H100) no necesarias para este tamaño.
- Cabe en GPU consumer: sí, en la mayoría de GPUs modernas con 4 GB o más de VRAM.
- Opciones de despliegue: llama.cpp, Ollama, vLLM, TGI y transformers con safetensors; no se documentan configuraciones específicas por parte del autor.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Llama-3.2-Mavenbase-Eval-1B-v1.0 | 1B | no disponible | Llama 3.2 Community | HuggingFace (0 descargas) | Fine-tuning QLoRA especializado en evaluación de entrevistas |
| meta-llama/Llama-3.2-1B-Instruct | 1B | 128K (según ficha oficial de Meta) | Llama 3.2 Community | HuggingFace (ampliamente disponible) | Modelo base generalista, sin especialización vertical |
| Qwen2.5-1.5B-Instruct | 1,5B | 32K (según ficha oficial) | Apache 2.0 | HuggingFace | Alternativa generalista con licencia permisiva |
| Gemma-2-2B-it | 2B | 8K (según ficha oficial) | Gemma Terms of Use | HuggingFace | Alternativa de Google con restricciones de uso |

La comparación directa con el modelo base es la más relevante: el ajuste de Mavenbase añade especialización vertical a costa de posibles regresiones en capacidades generales. Frente a alternativas de tamaño similar, la licencia Llama 3.2 Community es más restrictiva que Apache 2.0, lo que puede limitar su adopción comercial.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados por el autor; al ser un ajuste sobre Llama 3.2, hereda los sesgos del modelo base y los del dataset de ajuste, que no se detalla.
- Riesgo de alucinación: presente como en cualquier SLM de 1B parámetros; la especialización en evaluación no elimina la posibilidad de generar retroalimentación incorrecta o inventada.
- Limitaciones de contexto: la longitud de contexto no se especifica en la información disponible; conviene verificar la configuración del modelo base antes de usarlo con entradas largas.
- Limitaciones de idioma: solo se declara inglés; no se garantiza un rendimiento adecuado en castellano u otros idiomas.
- Restricciones de licencia: la Llama 3.2 Community License Agreement impone condiciones para uso comercial, incluidas obligaciones de atribución y restricciones para entidades con más de 700 millones de usuarios mensuales; revisar antes de producción.
- Caveat de producción: el repositorio no registra descargas ni validación externa; no hay evidencia pública de calidad, benchmarks ni casos de uso verificados. El pipeline declarado no está disponible.
- La funcionalidad "The Fear Score" y el análisis acústico no se detallan técnicamente; no se especifica si el modelo procesa audio directamente o solo texto derivado de transcripciones.

## Enlaces

- HuggingFace: https://huggingface.co/Mavenbase/Llama-3.2-Mavenbase-Eval-1B-v1.0
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-1B-Instruct
- Sitio del autor: https://mavenbase.tech
- Licencia Llama 3.2: https://www.llama.com/llama3_2/license/
- No se han encontrado papers, blogs, repositorios adicionales ni demos en la información disponible.
