# kerasformers/gemma-3n-e2b-it

## Resumen

kerasformers/gemma-3n-e2b-it es una conversión a Keras 3 del modelo Gemma 3n E2B de Google, concretamente el checkpoint ajustado por instrucciones (instruction-tuned). Desarrollado por el proyecto KerasFormers, este modelo permite ejecutar la arquitectura Gemma 3n de forma nativa en Keras 3, con soporte para múltiples backends (TensorFlow, PyTorch y JAX) sin modificar el código. Se trata de un modelo multimodal que acepta entradas de imagen, audio y texto, y genera texto como salida. Según la nomenclatura del nombre ('e2b'), el modelo tiene aproximadamente 2 mil millones de parámetros, lo que lo sitúa en un rango de eficiencia adecuado para tareas multimodales en entornos con recursos limitados.

La relevancia de esta conversión radica en que democratiza el acceso a la familia Gemma 3n de Google para desarrolladores que trabajan con Keras, un framework muy extendido en investigación y producción. Al ser una implementación pura de Keras 3, el mismo código puede ejecutarse en cualquiera de los tres backends principales, lo que facilita la experimentación y el despliegue en infraestructuras heterogéneas. Los pesos se almacenan en bfloat16 por defecto, con opciones de cuantización int8 para reducir aún más el consumo de memoria.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Gemma 3n) |
| Parametros totales | 2B (estimado según nomenclatura 'e2b') |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bfloat16 (por defecto), int8 (opcional), float32 (opcional) |
| Idiomas soportados | en (inglés) |
| Licencia | Gemma (gated) |
| Formato de pesos | Pesos de Keras (bfloat16) |

## Arquitectura y entrenamiento

Este modelo es una conversión directa de `google/gemma-3n-E2B-it` realizada por el proyecto KerasFormers. La arquitectura subyacente es la de Gemma 3n, un transformer multimodal desarrollado por Google que procesa entradas de imagen, audio y texto. No se dispone de detalles específicos sobre el entrenamiento original (número de tokens, composición del dataset, técnicas de alineación como RLHF o DPO) en la información proporcionada. El checkpoint convertido es el ajustado por instrucciones, lo que implica que ha sido optimizado para seguir indicaciones y mantener diálogos.

La innovación principal de esta versión no reside en el entrenamiento, sino en la implementación: es una conversión pura de Keras 3, lo que permite ejecutar el modelo con los backends de TensorFlow, PyTorch o JAX sin cambios en el código. Los pesos se cargan en bfloat16 por defecto, con la posibilidad de usar float32 para mayor precisión o int8 para reducir el tamaño.

## Capacidades

- Generación de texto a partir de instrucciones en lenguaje natural.
- Procesamiento de imágenes: el modelo puede recibir una imagen como entrada y generar descripciones o responder preguntas sobre ella.
- Procesamiento de audio: acepta entradas de audio y puede transcribirlas o generar respuestas relacionadas.
- Entrada multimodal combinada: soporta conversaciones donde se mezclan imágenes, audio y texto en un mismo turno.
- Generación de texto en inglés (idioma principal según los metadatos).
- Interfaz de generación condicional (`Gemma3nConditionalGenerate`) que facilita el uso de entradas multimodales.

## Casos de uso

- Descripción automática de imágenes: el modelo puede generar descripciones detalladas de fotografías o ilustraciones, útil para accesibilidad o catalogación de contenido visual.
- Asistente multimodal de atención al cliente: puede recibir capturas de pantalla o imágenes de productos junto con preguntas del usuario, y responder con texto relevante.
- Transcripción y análisis de audio: al aceptar entradas de audio, puede transcribir conversaciones o extraer información de grabaciones.
- Generación de contenido educativo: dado un diagrama o gráfico, puede explicar su contenido en texto, facilitando la creación de materiales didácticos.
- Automatización de informes: combinando imágenes y texto, puede generar resúmenes de documentos visuales, como facturas o informes técnicos.
- Prototipado de aplicaciones multimodales: gracias a su implementación en Keras 3, es adecuado para experimentar con pipelines que integran visión, audio y lenguaje en un único modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: con 2B parámetros en bfloat16, se requieren aproximadamente 4-5 GB de memoria de GPU para inferencia. Con cuantización int8, el consumo se reduce a unos 2-3 GB.
- GPU recomendadas: tarjetas con al menos 6 GB de VRAM (por ejemplo, NVIDIA RTX 3060, RTX 4060, o superiores). Para despliegues en producción, una A10 o A100 sería adecuada.
- Compatibilidad con GPU de consumo: sí, cabe en GPUs de consumo con 6 GB o más, como las de la serie RTX 30/40.
- Opciones de despliegue: al ser una implementación de Keras 3, se puede ejecutar directamente con los backends de TensorFlow, PyTorch o JAX. No se menciona compatibilidad con vLLM, llama.cpp u otros motores de inferencia específicos.
- Latencia y throughput: no se dispone de datos medidos en la información proporcionada.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. Se recomienda consultar la model card del modelo original de Google para obtener comparativas con otras variantes de Gemma 3n.

## Limitaciones y advertencias

- Licencia gated: el acceso al modelo requiere aceptar la licencia de uso de Google Gemma en Hugging Face, que puede imponer restricciones de uso comercial.
- Idioma limitado: según los metadatos, el modelo está entrenado principalmente en inglés, lo que puede afectar a su rendimiento en otros idiomas.
- Posibles sesgos: al ser un modelo derivado de Gemma 3n, puede heredar sesgos presentes en los datos de entrenamiento originales, especialmente en tareas sensibles.
- Riesgo de alucinación: como cualquier modelo generativo, puede producir respuestas inventadas o incorrectas, especialmente en contextos multimodales complejos.
- Variabilidad entre backends: aunque la implementación es unificada, pueden existir pequeñas diferencias numéricas entre TensorFlow, PyTorch y JAX debido a las operaciones de bajo nivel.
- Tamaño del repositorio: el peso del modelo es de 21.7 GB, lo que puede ser un inconveniente para entornos con ancho de banda limitado.

## Enlaces

- [HuggingFace: kerasformers/gemma-3n-e2b-it](https://huggingface.co/kerasformers/gemma-3n-e2b-it)
- [Modelo base: google/gemma-3n-E2B-it](https://huggingface.co/google/gemma-3n-E2B-it)
- [Repositorio GitHub de KerasFormers](https://github.com/IMvision12/KerasFormers)
- [Documentación de Gemma 3n en KerasFormers](https://imvision12.github.io/KerasFormers/gemma3n/)
