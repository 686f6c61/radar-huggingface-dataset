# gojiberries/parsernaam

## Resumen

Parsernaam es un modelo de parsing de nombres personales desarrollado por el usuario gojiberries en HuggingFace, aunque su origen se remonta al repositorio GitHub de appeler/parsernaam. Se compone de dos clasificadores LSTM a nivel de carácter: uno etiqueta un token individual como `first` o `last`, y el segundo clasifica una secuencia multi-token como `first_last` o `last_first`. El modelo aborda un problema común en sistemas de datos: cuando los campos de nombre y apellido no están separados, los parsers tradicionales basados en patrones fallan, especialmente con nombres de origen indio. Parsernaam utiliza un enfoque de aprendizaje automático entrenado con registros de votantes de India y Estados Unidos, lo que le permite capturar variaciones morfológicas y de orden que los métodos heurísticos no manejan bien.

La relevancia actual del modelo radica en su utilidad para tareas de limpieza y normalización de datos en entornos empresariales, como CRMs, bases de datos de clientes o sistemas de gestión de identidades. Al ser un modelo ligero (LSTM a nivel de carácter), puede ejecutarse en CPU sin necesidad de GPU, lo que facilita su integración en pipelines de procesamiento de datos. La licencia MIT permite uso comercial sin restricciones, aunque el autor advierte que las probabilidades de salida deben tratarse como puntuaciones, no como garantías calibradas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LSTM a nivel de carácter (dos clasificadores: token individual y secuencia) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (procesa tokens o cadenas cortas de nombre) |
| Tipos de cuantizacion | no disponible (se distribuye como state dict de PyTorch) |
| Idiomas soportados | no disponible (entrenado con datos de India y EE.UU., pero no se especifican idiomas) |
| Licencia | MIT |
| Formato de pesos | PyTorch state dict (`parsernaam.pt`, `parsernaam_pos.pt`) y vocabulario en Parquet (`vocabulary.parquet`) |

## Arquitectura y entrenamiento

El modelo emplea dos redes LSTM independientes a nivel de carácter. La primera clasifica un único token (por ejemplo, una palabra) como nombre de pila (`first`) o apellido (`last`). La segunda toma una secuencia de tokens (una cadena de nombre completa) y la clasifica como `first_last` (orden nombre-apellido) o `last_first` (orden apellido-nombre). Esta separación permite manejar tanto tokens individuales como estructuras completas de nombre.

Los datos de entrenamiento provienen de registros de votantes de India y Estados Unidos, según la documentación del paquete. Para los registros indios, se asume que el apellido es la palabra compartida por varios miembros de una misma familia, un criterio culturalmente más preciso que el simple "última palabra". Se cita específicamente el registro de votantes de Florida de principios de 2022 (DOI: 10.7910/DVN/UBIG3F). No se incluye un manifiesto completo de filas de entrenamiento en el repositorio, por lo que no se dispone de detalles sobre el número de tokens, composición exacta del dataset o si se aplicaron técnicas como RLHF o DPO. La arquitectura no presenta innovaciones destacables más allá del uso de LSTM a nivel de carácter, una elección adecuada para manejar variaciones ortográficas y de longitud en nombres.

## Capacidades

- Clasificación de un token individual como nombre de pila (`first`) o apellido (`last`).
- Clasificación del orden de una secuencia multi-token como `first_last` o `last_first`.
- Manejo de nombres de origen indio y estadounidense, gracias al entrenamiento con registros electorales de ambas regiones.
- Inferencia a nivel de carácter, lo que permite procesar nombres con ortografía no estándar o variaciones regionales.
- Salida de probabilidades para cada clase, útil para análisis exploratorio o como entrada en sistemas de decisión con umbrales configurables.
- No soporta tool calling, agentes, visión, audio ni modos de razonamiento extendido; es un modelo puramente de clasificación de texto corto.

## Casos de uso

- Limpieza de bases de datos de clientes: cuando un CRM almacena nombres completos en un solo campo, Parsernaam puede separar automáticamente nombre y apellido para estructurar la información. Su naturaleza ligera permite ejecutarlo en lotes sobre millones de registros sin necesidad de GPU.
- Normalización de formularios web: en procesos de registro o alta de usuarios, el modelo puede validar y corregir el orden de los campos nombre/apellido cuando el usuario introduce los datos de forma inconsistente.
- Análisis de datos electorales o censales: dado su entrenamiento con registros de votantes, es adecuado para preprocesar nombres en estudios demográficos o de participación, siempre que se respeten las limitaciones éticas indicadas por el autor.
- Integración en pipelines de ETL: al ser un modelo pequeño y con dependencias mínimas (PyTorch), puede incorporarse en flujos de extracción, transformación y carga para enriquecer datos maestros de clientes o proveedores.
- Sistemas de detección de duplicados: al separar correctamente nombre y apellido, se pueden comparar registros con mayor precisión y reducir falsos positivos en algoritmos de deduplicación.
- Preparación de datos para modelos de lenguaje: en tareas de generación de texto o chatbots que requieran dirigirse al usuario por su nombre, Parsernaam extrae el campo correcto para personalizar respuestas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye métricas como precisión, recall o F1 sobre conjuntos de prueba estándar. Tampoco se comparan resultados con otros parsers de nombres. Por tanto, no es posible evaluar cuantitativamente su rendimiento en esta ficha.

## Requisitos de hardware

- Al ser un modelo LSTM a nivel de carácter con un número de parámetros no especificado pero presumiblemente reducido (el repositorio ocupa 0.0 GB), puede ejecutarse en CPU sin problemas.
- No se requiere GPU para inferencia; una CPU moderna con 4-8 GB de RAM es suficiente para procesar nombres de forma individual o en lotes pequeños.
- Para procesamiento masivo (millones de registros), se recomienda un servidor con múltiples núcleos o el uso de procesamiento por lotes con PyTorch.
- Opciones de despliegue: al ser un state dict de PyTorch, se puede cargar directamente en cualquier entorno con PyTorch instalado. No se proporcionan versiones en GGUF, ONNX o formatos optimizados para vLLM, llama.cpp u Ollama.
- La latencia por nombre es del orden de milisegundos en CPU, aunque no se dispone de mediciones oficiales.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (parsing de nombres a nivel de carácter). Existen bibliotecas tradicionales como `nameparser` (Python) que usan reglas heurísticas, pero no son modelos de ML. Tampoco se conocen modelos de HuggingFace específicos para esta tarea con los que comparar. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- El modelo solo cubre cuatro etiquetas (`first`, `last`, `first_last`, `last_first`), que no representan todas las convenciones de nombres existentes (p. ej., nombres compuestos, apellidos múltiples, sufijos como "Jr." o "Sr.", o nombres sin apellido).
- Los datos de entrenamiento provienen exclusivamente de registros de votantes de India y EE.UU., lo que introduce sesgos geográficos y culturales. Nombres de otras regiones (África, Asia Oriental, Latinoamérica) pueden clasificarse incorrectamente.
- El autor advierte explícitamente que no se debe usar el modelo para inferir etnia, ciudadanía, religión, género, elegibilidad o identidad, ni como única entrada para decisiones consecuentes (p. ej., aprobación de crédito, verificación de identidad).
- Las probabilidades de salida no están calibradas; deben tratarse como puntuaciones de modelo, no como probabilidades reales.
- No se incluye un manifiesto de entrenamiento completo, lo que dificulta la reproducibilidad y la auditoría de los datos utilizados.
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere que es un modelo reciente o poco difundido; no hay evidencia de uso en producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/gojiberries/parsernaam
- Repositorio GitHub original: https://github.com/appeler/parsernaam
- Documentación del paquete (versión 0.2.0): https://appeler.github.io/parsernaam/
- Datos de votantes de Florida (DOI): https://doi.org/10.7910/DVN/UBIG3F
