# qf-iquest/CogniSphere-Main

## Resumen

CogniSphere es un modelo de lenguaje presentado por el usuario qf-iquest en Hugging Face bajo licencia MIT. La model card describe una versión actualizada que mejora significativamente la profundidad de razonamiento e inferencia mediante el uso de mayores recursos computacionales y mecanismos de optimización algorítmica durante el post-entrenamiento. El modelo muestra resultados destacados en tareas de matemáticas, programación y lógica general, acercándose al rendimiento de otros modelos líderes.

Aunque el repositorio no incluye pesos (tamaño 0 GB) y la información técnica es limitada, la descripción indica que se trata de un modelo de lenguaje con capacidades de razonamiento avanzado, soporte para function calling y una tasa de alucinación reducida. La arquitectura, el número de parámetros y la longitud de contexto no se especifican en la documentación disponible. El modelo se ofrece a través de una interfaz de chat y una API en el sitio oficial, y también se puede ejecutar localmente siguiendo las instrucciones del repositorio de código.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | no disponible (repositorio sin archivos de modelo) |

## Arquitectura y entrenamiento

La model card no proporciona detalles sobre la arquitectura interna del modelo (transformer, MoE, etc.), el número de parámetros, la composición del dataset de entrenamiento ni el número de tokens utilizados. Se menciona que la versión actual ha sido sometida a un proceso de post-entrenamiento con "mecanismos de optimización algorítmica" y un aumento de recursos computacionales, lo que ha mejorado la profundidad de razonamiento. También se indica que el modelo soporta system prompts y que no requiere tokens especiales para forzar un patrón de pensamiento, a diferencia de versiones anteriores. No hay información sobre técnicas como RLHF, DPO o decodificación especulativa.

## Capacidades

- Razonamiento matemático avanzado: mejora notable en problemas de competición como AIME 2025, con una precisión del 87,5% (frente al 70% de la versión anterior).
- Razonamiento lógico y de sentido común: puntuaciones superiores a 0,8 en las evaluaciones del autor.
- Generación de código: puntuación de 0,650 en la categoría de generación de código según los benchmarks del autor.
- Comprensión lectora y respuesta a preguntas: rendimiento consistente en tareas de lenguaje.
- Generación de texto creativo, diálogo y resumen: capacidades de generación con puntuaciones entre 0,61 y 0,77.
- Traducción y recuperación de conocimiento: soporte para tareas multilingües y de búsqueda de información.
- Instrucción y seguridad: buen desempeño en seguir instrucciones y evaluaciones de seguridad.
- Soporte para function calling: la model card menciona "enhanced support for function calling".
- Integración con búsqueda web y subida de archivos: se proporcionan plantillas de prompt para estas funcionalidades.

## Casos de uso

- Asistente de razonamiento matemático: el modelo puede resolver problemas complejos de matemáticas y competiciones (tipo AIME) gracias a su profundidad de razonamiento, siendo útil para estudiantes, investigadores o herramientas educativas que requieran explicaciones paso a paso.
- Generación de código en entornos de desarrollo: con soporte para function calling, puede integrarse en pipelines de CI/CD para autocompletar, revisar o generar fragmentos de código, mejorando la productividad de los desarrolladores.
- Chat de atención al cliente: su capacidad de diálogo y comprensión lectora permite gestionar conversaciones multi-turno, aunque no se especifica la longitud de contexto, por lo que habría que validar su límite.
- Análisis de documentos con subida de archivos: la plantilla de prompt para archivos permite procesar contenido de ficheros y responder preguntas sobre ellos, útil en entornos de oficina o gestión documental.
- Búsqueda web aumentada: el modelo puede combinar resultados de búsqueda externa con su generación, citando fuentes, lo que resulta adecuado para asistentes de investigación o periodismo asistido.
- Traducción y localización: con puntuaciones de 0,804 en traducción, puede servir como motor de traducción automática en aplicaciones multilingües, aunque se desconoce el conjunto de idiomas soportados.

## Benchmarks y rendimiento

La model card incluye una tabla de resultados comparativos entre varios modelos (Model1, Model2, Model1-v2 y CogniSphere) en distintas categorías. No se especifica qué modelos son Model1 y Model2, ni qué benchmarks concretos se utilizaron (solo nombres genéricos como "Math Reasoning" o "Code Generation"). Los valores son proporciones (0-1). Se presentan tal cual, sin verificación independiente.

| Categoria | Model1 | Model2 | Model1-v2 | CogniSphere |
|---|---|---|---|---|
| Razonamiento matematico | 0.510 | 0.535 | 0.521 | 0.550 |
| Razonamiento logico | 0.789 | 0.801 | 0.810 | 0.819 |
| Sentido comun | 0.716 | 0.702 | 0.725 | 0.736 |
| Comprension lectora | 0.671 | 0.685 | 0.690 | 0.700 |
| Respuesta a preguntas | 0.582 | 0.599 | 0.601 | 0.607 |
| Clasificacion de texto | 0.803 | 0.811 | 0.820 | 0.828 |
| Analisis de sentimiento | 0.777 | 0.781 | 0.790 | 0.792 |
| Generacion de codigo | 0.615 | 0.631 | 0.640 | 0.650 |
| Escritura creativa | 0.588 | 0.579 | 0.601 | 0.610 |
| Generacion de dialogo | 0.621 | 0.635 | 0.639 | 0.644 |
| Resumen | 0.745 | 0.755 | 0.760 | 0.767 |
| Traduccion | 0.782 | 0.799 | 0.801 | 0.804 |
| Recuperacion de conocimiento | 0.651 | 0.668 | 0.670 | 0.676 |
| Seguimiento de instrucciones | 0.733 | 0.749 | 0.751 | 0.758 |
| Evaluacion de seguridad | 0.718 | 0.701 | 0.725 | 0.739 |

Ademas, se menciona que en AIME 2025 la precision paso del 70% al 87,5% entre versiones, y que el numero medio de tokens por pregunta aumento de 12K a 23K, lo que indica un mayor esfuerzo de razonamiento.

## Requisitos de hardware

No se dispone de informacion sobre requisitos de hardware en la documentacion proporcionada. No se especifican VRAM, GPUs recomendadas, opciones de despliegue ni metricas de latencia. El repositorio de Hugging Face no contiene pesos, por lo que no se puede evaluar el tamaño real del modelo.

## Comparativa con modelos similares

No se puede realizar una comparativa fiable con modelos alternativos porque no se conocen los parametros, la arquitectura ni el tamano de CogniSphere. La tabla de benchmarks del autor compara con modelos denominados "Model1", "Model2" y "Model1-v2", pero no se identifican que modelos son. Por tanto, no se puede establecer una comparativa objetiva con alternativas conocidas como Llama, Mistral o Qwen.

## Limitaciones y advertencias

- Informacion tecnica insuficiente: no se publican arquitectura, numero de parametros, contexto ni datos de entrenamiento, lo que dificulta la evaluacion de su idoneidad para casos de uso concretos.
- Repositorio sin pesos: el repositorio de Hugging Face tiene un tamano de 0 GB, por lo que no se puede descargar ni ejecutar el modelo desde esa fuente. La ejecucion local requiere acceder al repositorio de codigo mencionado en la card, que no se enlaza directamente.
- Sesgos y alucinaciones: aunque se indica una reduccion de la tasa de alucinacion, no se proporcionan datos cuantitativos ni evaluaciones independientes sobre sesgos.
- Dependencia de la fecha: el prompt de sistema recomendado incluye la fecha actual, lo que sugiere que el modelo puede no manejar bien informacion temporal sin esa indicacion.
- Licencia MIT: permite uso comercial y modificacion, pero el modelo puede tener dependencias o componentes con otras licencias no especificadas.
- Sin garantia de rendimiento: los benchmarks presentados son autoinformados por el autor y no han sido verificados por terceros.

## Enlaces

- [Hugging Face - qf-iquest/CogniSphere-Main](https://huggingface.co/qf-iquest/CogniSphere-Main)
- [Perfil de qf-iquest en Hugging Face](https://huggingface.co/qf-iquest)
- [CogniSphere - GitHub (proyecto distribuido)](https://github.com/cognisphere)
- [CogniSphere-AI - GitHub (plataforma de analisis)](https://github.com/amanazads/CogniSphere-AI)
