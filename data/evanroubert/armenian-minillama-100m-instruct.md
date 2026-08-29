# Evanroubert/Armenian-MiniLlama-100M-Instruct

## Resumen

Armenian-MiniLlama-100M-Instruct es un modelo de lenguaje pequeño (100 millones de parámetros) desarrollado por Evanroubert, especializado en seguir instrucciones en armenio. Se trata de la variante fine-tuned del modelo base Armenian-MiniLlama 100M, entrenada mediante supervisión directa (SFT) sobre 41.600 instrucciones limpias en armenio procedentes del dataset `saillab/alpaca-armenian-cleaned`. El modelo está diseñado para tareas conversacionales y de ejecución de instrucciones en ese idioma, con un formato de prompt tipo Alpaca.

Su relevancia radica en su tamaño reducido, que permite despliegue en entornos con recursos limitados, como dispositivos edge o navegadores. La arquitectura se basa en MiniLlama, una implementación compacta y simplificada de LLaMA, lo que facilita su comprensión y experimentación. El modelo se distribuye bajo licencia MIT, lo que permite uso comercial sin restricciones significativas. Aunque no se especifican detalles de contexto o cuantizaciones oficiales, el repositorio ocupa 0,4 GB, lo que sugiere pesos en FP16 o similar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basada en MiniLlama, implementación simplificada de LLaMA) |
| Parametros totales | 100 millones |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (la model card menciona FP16 e INT4 como tamaños de archivo, pero no se especifican cuantizaciones oficiales) |
| Idiomas soportados | Armenio (hy) |
| Licencia | MIT |
| Formato de pesos | no disponible (el repositorio contiene 0,4 GB, probablemente safetensors, pero no se confirma) |

## Arquitectura y entrenamiento

El modelo se basa en MiniLlama, una implementación compacta de la arquitectura LLaMA/LLaMA2 que simplifica el diseño original para facilitar su estudio y uso. No se han publicado detalles específicos sobre el número de capas, cabezas de atención o dimensiones ocultas, pero al tratarse de un modelo de 100M parámetros, se asume una configuración típica de transformer decoder-only.

El entrenamiento consistió en un fine-tuning supervisado (SFT) sobre el dataset `saillab/alpaca-armenian-cleaned`, que contiene 41.600 instrucciones en armenio. El formato de entrenamiento sigue el esquema Alpaca, con campos de instrucción y respuesta. No se menciona el uso de RLHF, DPO u otras técnicas de alineación adicionales. Tampoco se especifica el número de tokens de entrenamiento ni la composición exacta del dataset más allá de su origen.

## Capacidades

- Generación de texto en armenio: produce respuestas coherentes y contextualizadas en ese idioma.
- Seguimiento de instrucciones: responde a preguntas directas y ejecuta tareas simples descritas en armenio.
- Conversación multi-turno: aunque no se especifica la longitud de contexto, el formato Alpaca permite diálogos cortos.
- Manejo de tokens de fin de secuencia: la model card indica un manejo limpio del token `<|endoftext|>`.
- Ligereza computacional: con ~200 MB en FP16 y ~55 MB en INT4, es apto para entornos con recursos muy limitados.
- No se mencionan capacidades de tool calling, agentes, razonamiento multi-paso, visión o audio.

## Casos de uso

- Asistente conversacional en armenio para aplicaciones móviles: el modelo puede integrarse en chatbots que respondan preguntas frecuentes o proporcionen información en armenio, gracias a su bajo consumo de memoria y su capacidad de seguir instrucciones.
- Procesamiento de texto en entornos edge: al ser extremadamente ligero, puede ejecutarse en dispositivos IoT, Raspberry Pi o incluso en navegadores mediante WebAssembly, permitiendo generación de texto local sin conexión.
- Herramienta educativa para aprendizaje del armenio: puede utilizarse como generador de ejercicios, respuestas a preguntas de vocabulario o práctica de conversación básica.
- Filtrado y clasificación de texto en armenio: aunque no está entrenado específicamente para clasificación, puede adaptarse mediante fine-tuning adicional para tareas de análisis de sentimiento o categorización de contenido.
- Prototipado rápido de aplicaciones de IA en armenio: su tamaño reducido y licencia permisiva permiten experimentar con arquitecturas de agentes simples o pipelines de generación sin necesidad de infraestructura costosa.
- Generación de contenido breve en armenio: redacción de correos, mensajes, resúmenes cortos o respuestas automáticas en contextos donde no se requiere alta complejidad lingüística.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No existen datos sobre MMLU, HumanEval, GSM8K u otras métricas estándar para este modelo.

## Requisitos de hardware

- Al ser un modelo de 100M parámetros, puede ejecutarse en CPU sin GPU, con un consumo de RAM aproximado de 200 MB en FP16 y 55 MB en INT4 (según la model card).
- En GPU, cualquier tarjeta con al menos 1 GB de VRAM es suficiente, incluyendo GPUs integradas o de gama baja como NVIDIA GTX 1050 o superiores.
- Es viable en dispositivos móviles y navegadores mediante frameworks como ONNX Runtime Web o WebLLM, aunque no se confirma compatibilidad oficial.
- Para despliegue en producción, se puede usar llama.cpp, vLLM o TGI, pero no se ha verificado su soporte específico para este modelo.
- La latencia esperada en CPU moderna es del orden de decenas de milisegundos por token, y en GPU sería significativamente menor, aunque no se proporcionan cifras oficiales.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa rigurosa con otros modelos de la misma categoría. Existen otros modelos de 100M como Supra2-100M-Instruct, pero no se han encontrado datos comparativos de rendimiento, contexto o arquitectura. Se recomienda consultar el leaderboard de Artificial Analysis para comparaciones generales, aunque no incluye este modelo específico.

## Limitaciones y advertencias

- Modelo de tamaño muy reducido: su capacidad de razonamiento complejo, matemáticas avanzadas o generación de código es limitada.
- Solo soporta armenio: no es multilingüe y puede producir resultados incoherentes si se le presentan instrucciones en otros idiomas.
- Riesgo de alucinaciones: como todos los modelos generativos, puede inventar información, especialmente en temas especializados.
- Sin datos de contexto: se desconoce la longitud máxima de secuencia, lo que puede limitar su uso en tareas que requieran contexto largo.
- Sin benchmarks publicados: no hay evidencia objetiva de su calidad en tareas estándar.
- Dependencia del dataset de entrenamiento: su rendimiento está condicionado por la calidad y cobertura del dataset Alpaca armenio, que puede contener sesgos o limitaciones temáticas.
- Aunque la licencia MIT permite uso comercial, no se ofrecen garantías sobre el comportamiento del modelo en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Evanroubert/Armenian-MiniLlama-100M-Instruct
- Repositorio de MiniLlama (implementación base): https://github.com/akanyaani/miniLLAMA
- Dataset de entrenamiento (referenciado en la model card): `saillab/alpaca-armenian-cleaned` (no se ha encontrado enlace directo en la búsqueda web)
