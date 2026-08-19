# openai/gpt-oss-120b

## Resumen

gpt-oss-120b es el primer modelo de razonamiento con pesos abiertos lanzado por OpenAI en agosto de 2025, junto con su variante más pequeña gpt-oss-20b. Se trata de un modelo de arquitectura MoE (Mixture of Experts) con 117 mil millones de parámetros totales y solo 5,1 mil millones activos por token, lo que permite ejecutarlo en una única GPU de 80 GB (NVIDIA H100 o AMD MI300X) gracias a la cuantización MXFP4 aplicada durante el post-entrenamiento. Está disponible bajo licencia Apache 2.0, lo que elimina restricciones de copyleft y riesgo de patentes, y facilita su uso comercial y su personalización mediante fine-tuning.

El modelo está diseñado específicamente para tareas de razonamiento complejo, uso de herramientas y flujos agénticos. Incluye capacidades nativas de function calling, ejecución de código Python, navegación web y salidas estructuradas, además de un modo de razonamiento configurable (bajo, medio o alto) que permite ajustar el equilibrio entre calidad y latencia. Una característica distintiva es el acceso completo a la cadena de razonamiento (chain-of-thought), que facilita la depuración y la confianza en las respuestas, aunque OpenAI recomienda no mostrarla directamente a los usuarios finales. Todos los pesos y la implementación de referencia están disponibles en el repositorio oficial de GitHub, y el modelo se integra con los principales frameworks de inferencia como vLLM, Transformers, Ollama y LM Studio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE) |
| Parametros totales | 116.829.156.672 (117B) |
| Parametros activos | 5,1 mil millones |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MXFP4 (post-entrenamiento), 8-bit |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

gpt-oss-120b emplea una arquitectura de mezcla de expertos (MoE) con 117 mil millones de parámetros totales, de los cuales solo 5,1 mil millones se activan por token. Esta configuración permite un rendimiento de inferencia mucho más eficiente que un modelo denso del mismo tamaño, reduciendo la latencia y el coste computacional. El modelo fue entrenado utilizando el formato de respuesta harmony, un protocolo de conversación desarrollado por OpenAI que estructura las interacciones en pasos de razonamiento y respuesta final. Este formato es obligatorio: el modelo no funciona correctamente si no se usa, aunque los frameworks como Transformers lo aplican automáticamente mediante su plantilla de chat.

El post-entrenamiento incluye una cuantización MXFP4 de los pesos de los expertos, lo que reduce el tamaño del modelo a aproximadamente 60 GB en memoria, permitiendo su ejecución en una GPU de 80 GB. Esta cuantización se aplicó durante el entrenamiento, por lo que todas las evaluaciones oficiales se realizaron con ella. No se han publicado detalles sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de técnicas como RLHF o DPO en la información disponible. El modelo admite fine-tuning completo para adaptarlo a dominios o tareas específicas.

## Capacidades

- Razonamiento complejo con cadena de pensamiento completa: el modelo genera pasos intermedios de razonamiento antes de la respuesta final, accesibles para depuración.
- Nivel de esfuerzo de razonamiento configurable (bajo, medio o alto), permitiendo ajustar la profundidad del análisis según la latencia requerida.
- Function calling nativo: puede invocar herramientas externas y APIs de forma estructurada.
- Ejecución de código Python: integración con entornos de ejecución para tareas de cálculo, análisis de datos o automatización.
- Navegación web: capacidad de buscar y extraer información de páginas web durante el razonamiento.
- Salidas estructuradas (Structured Outputs): generación de respuestas con esquemas JSON u otros formatos validados.
- Capacidades agénticas: soporte para flujos multi-paso con uso de herramientas y toma de decisiones autónoma.
- Fine-tuning completo: personalización del modelo para casos de uso específicos.
- Multilingüismo: no se han publicado los idiomas soportados en la información disponible.

## Casos de uso

- Agentes autónomos de automatización de tareas: el modelo puede gestionar flujos de trabajo complejos que requieren razonamiento multi-paso, invocación de herramientas y ejecución de código, por ejemplo para automatizar procesos de extracción de datos y generación de informes.
- Asistentes de soporte técnico avanzado: con su capacidad de razonamiento y function calling, puede diagnosticar problemas, consultar bases de conocimiento internas y escalar incidencias de forma autónoma.
- Generación y revisión de código en entornos de producción: su capacidad de ejecutar Python y generar salidas estructuradas permite integrarlo en pipelines de CI/CD para generar tests, revisar pull requests o documentar APIs.
- Análisis de datos y generación de informes financieros: puede procesar datos tabulares, ejecutar cálculos en Python y producir informes con formato estructurado, adecuado para departamentos de analítica.
- Búsqueda y síntesis de información con navegación web: útil para investigación de mercado, seguimiento de noticias o recopilación de información competitiva, combinando búsqueda en línea con razonamiento profundo.
- Asistentes de programación con razonamiento matemático: para problemas de física, ingeniería o matemáticas aplicadas donde se requiere tanto cálculo simbólico como explicaciones detalladas paso a paso.
- Despliegue de chatbots con salidas estructuradas: en sectores como banca o sanidad, donde las respuestas deben cumplir esquemas JSON estrictos para integrarse con sistemas back-end.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona la etiqueta `eval-results` en HuggingFace, pero no se incluyen los valores concretos en el material proporcionado. Según el comunicado de OpenAI, el modelo supera a modelos open de tamaño similar en tareas de razonamiento y muestra un rendimiento fuerte en uso de herramientas, aunque no se ofrecen cifras específicas en esta documentación.

## Requisitos de hardware

- VRAM estimada: aproximadamente 60 GB con cuantización MXFP4, lo que permite ejecutar el modelo en una GPU de 80 GB (NVIDIA H100, A100 80GB, AMD MI300X).
- GPU recomendadas: NVIDIA H100, A100 80GB, AMD MI300X. También puede ejecutarse en GPUs de consumo con menos memoria mediante cuantizaciones adicionales (por ejemplo, 8-bit o inferiores), aunque no se especifican los requisitos mínimos.
- En hardware de consumo: la variante gpt-oss-20b cabe en 16 GB de memoria, mientras que la 120b requiere al menos 80 GB para la configuración estándar. Con Ollama se puede intentar ejecutar en GPUs de consumo, pero no se garantiza el rendimiento.
- Opciones de despliegue: vLLM (versión específica `0.10.1+gptoss`), Transformers con pipeline de texto, Transformers Serve, Ollama, LM Studio, y la implementación de referencia en PyTorch/Triton del repositorio oficial.
- Latencia y throughput: no disponible en la información proporcionada. Dependerá del hardware, la cuantización y el nivel de esfuerzo de razonamiento configurado.

## Comparativa con modelos similares

No se dispone de datos comparativos directos en la información proporcionada. Sin embargo, por su tamaño y arquitectura MoE, los modelos comparables serían Mixtral 8x22B (141B totales, 39B activos) o DeepSeek-V3 (671B totales, 37B activos). Según OpenAI, gpt-oss-120b supera a estos modelos en tareas de razonamiento y uso de herramientas, pero no se incluyen los resultados numéricos en esta documentación. La licencia Apache 2.0 es más permisiva que las de muchos competidores open-weight.

## Limitaciones y advertencias

- Requiere obligatoriamente el formato de respuesta harmony. Si se usa `model.generate` directamente sin aplicar la plantilla de chat, el modelo no funcionará correctamente.
- La cadena de razonamiento completa es accesible, pero OpenAI recomienda no mostrarla a usuarios finales por riesgos de seguridad y sesgos.
- No se han publicado los idiomas soportados, por lo que el rendimiento en lenguas distintas del inglés no está garantizado.
- La longitud de contexto no está especificada en la información disponible; se desconoce si soporta ventanas largas (por ejemplo, 128K tokens).
- Riesgo de alucinación inherente a los modelos de lenguaje; se recomienda validar las respuestas en aplicaciones críticas.
- Aunque la licencia Apache 2.0 permite uso comercial sin restricciones de copyleft, OpenAI ha publicado una política de uso adicional (gpt-oss usage policy) que debe revisarse antes del despliegue.
- La cuantización MXFP4 puede implicar una ligera pérdida de precisión en comparación con pesos completos, aunque las evaluaciones oficiales se realizaron con ella.
- No se han publicado datos de sesgos ni de evaluación de seguridad específicos para este modelo.

## Enlaces

- HuggingFace: https://huggingface.co/openai/gpt-oss-120b
- Model card (arXiv): https://arxiv.org/abs/2508.10925
- Blog de OpenAI: https://openai.com/index/introducing-gpt-oss/
- Model card oficial de OpenAI: https://openai.com/index/gpt-oss-model-card/
- Repositorio GitHub: https://github.com/openai/gpt-oss
- Documentación de API: https://developers.openai.com/api/docs/models/gpt-oss-120b
- Guías y cookbook: https://cookbook.openai.com/topic/gpt-oss
- Demo interactiva: https://gpt-oss.com
