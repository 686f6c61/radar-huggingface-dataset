# robgarct/hebbian-120m-featdim256-h2

## Resumen

El modelo `robgarct/hebbian-120m-featdim256-h2` es un modelo de lenguaje pequeño de 120 millones de parámetros basado en una arquitectura MLP-Mixer con capas hebbianas y atención lineal. Ha sido desarrollado por el investigador robgarct como parte de un estudio sobre localización de la capacidad de "in-context recall" en modelos de lenguaje, dentro del repositorio HazyResearch/mlp-mixer. El modelo se entrena en dos fases: primero 20 000 pasos de pretraining de lenguaje estándar y después 3 000 pasos adicionales con el dataset Pile, sin objetivo explícito de recall, actuando como control de la etapa 1 del estudio.

La relevancia de este modelo reside en su uso como herramienta de investigación para entender qué componentes internos (cabezas de atención) son responsables de la capacidad de recuperar información del contexto. El estudio localiza esta habilidad en un único head (capa 10, head 8) de un total de 144. No está pensado para uso en producción, sino para análisis de interpretabilidad y mecanismos internos de los transformers.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MLP-Mixer con capas hebbianas y atención lineal |
| Parametros totales | 120 millones |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | checkpoint PyTorch (final.ckpt) |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura MLP-Mixer, que sustituye la atención tradicional por operaciones de mezcla de tokens basadas en MLPs, combinada con mecanismos hebbianos y atención lineal. La actualización de pesos se realiza mediante reglas hebbianas, lo que permite un aprendizaje online y una menor complejidad computacional en comparación con la atención estándar. El entrenamiento se divide en dos etapas: una primera fase de pretraining de lenguaje durante 20 000 pasos, seguida de 3 000 pasos con el dataset Pile sin ningún objetivo de recall específico, lo que lo convierte en un control para el estudio de localización de la capacidad de recuperación en contexto.

La innovación principal no reside en el rendimiento del modelo, sino en su uso como sujeto experimental para identificar qué head concreto (capa 10, head 8) implementa la función de in-context recall. Esta línea de investigación busca abrir la caja negra de los transformers y comprender la especialización funcional de sus componentes internos.

## Capacidades

- Generación de texto básica, dado que es un modelo de lenguaje entrenado con el dataset Pile.
- Recuperación de información en contexto (in-context recall) de forma limitada, aunque esta capacidad está localizada en un único head y no ha sido optimizada deliberadamente.
- Sin soporte documentado para tool calling, razonamiento multi-paso, visión, audio u otras capacidades avanzadas.
- No se han publicado capacidades multilingües; probablemente el entrenamiento se realizó principalmente con texto en inglés, dado el dataset Pile.

## Casos de uso

- Investigación en interpretabilidad de modelos: el modelo sirve para estudiar cómo se implementa la capacidad de recall en una cabeza de atención concreta, permitiendo análisis de activaciones, ablaciones y visualizaciones.
- Desarrollo de arquitecturas alternativas: los resultados del estudio pueden guiar el diseño de modelos más eficientes que emulen la especialización de heads sin necesidad de entrenamiento completo.
- Benchmark de mecanismos hebbianos: sirve como punto de comparación para evaluar el rendimiento de capas hebbianas frente a atención tradicional en tareas de recuperación de contexto.
- Educación en aprendizaje automático: útil como ejemplo práctico de un modelo pequeño con arquitectura no estándar para fines docentes.
- Validación de técnicas de localización de circuitos: permite probar métodos de análisis de circuitos (como los usados en mechanistic interpretability) en un modelo de tamaño reducido.
- Exploración de alternativas a la atención: el modelo puede utilizarse para comparar el coste computacional y la capacidad de memoria a largo plazo de las capas hebbianas frente a la atención softmax.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El modelo es un control experimental y su rendimiento en tareas estándar no ha sido documentado.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de 120 millones de parámetros, en precisión fp32 ocupa aproximadamente 480 MB, y en fp16 unos 240 MB. Cabe en cualquier GPU con al menos 1 GB de VRAM.
- GPU recomendadas: cualquier GPU moderna, incluidas tarjetas de consumo como RTX 3060, RTX 4060 o superiores. También puede ejecutarse en CPU para inferencia lenta.
- Opciones de despliegue: dado que el checkpoint está en formato PyTorch, puede cargarse con la librería mlp-mixer directamente. No se menciona soporte para vLLM, Ollama o llama.cpp.
- Latencia y throughput: no disponibles, pero al ser un modelo pequeño, la inferencia será rápida incluso en hardware modesto.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (modelos MLP-Mixer hebbianos de 120M). No se puede establecer una comparativa fiable.

## Limitaciones y advertencias

- Modelo de investigación: no está diseñado para uso en producción ni para tareas reales de generación de texto.
- Sin licencia especificada: no se puede determinar si su uso comercial está permitido; se recomienda contactar al autor antes de cualquier uso.
- Sesgos no evaluados: al entrenarse con el dataset Pile, puede heredar sesgos presentes en ese corpus, pero no se ha realizado ninguna evaluación de sesgos.
- Riesgo de alucinación: como cualquier modelo de lenguaje, puede generar contenido falso o incoherente, aunque su tamaño reducido limita su utilidad práctica.
- Idiomas y contexto limitados: no se especifica la longitud de contexto ni los idiomas soportados; probablemente solo maneja inglés y ventanas de contexto cortas.
- Formato de checkpoint propietario: el modelo se carga mediante una función específica del repositorio de estudio, lo que dificulta su integración en pipelines estándar.

## Enlaces

- [Página del modelo en HuggingFace](https://huggingface.co/robgarct/hebbian-120m-featdim256-h2)
- Repositorio HazyResearch/mlp-mixer mencionado en la model card (sin URL directa disponible)
