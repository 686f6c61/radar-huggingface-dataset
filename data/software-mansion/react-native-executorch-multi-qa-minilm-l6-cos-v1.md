# software-mansion/react-native-executorch-multi-qa-MiniLM-L6-cos-v1

## Resumen

Este repositorio aloja una exportación del modelo de embeddings semánticos `multi-qa-MiniLM-L6-cos-v1` de sentence-transformers, preparado para su ejecución en el runtime ExecuTorch de Meta dentro de aplicaciones React Native mediante la librería `react-native-executorch`. El modelo se distribuye en formato `.pte` (formato nativo de ExecuTorch) junto con su tokenizer, listo para ser cargado directamente en el dispositivo. La relevancia de esta ficha reside en que permite a desarrolladores móviles integrar capacidades de búsqueda semántica y similitud de frases en aplicaciones React Native sin depender de conexión a servidores, garantizando privacidad y baja latencia. El autor es Software Mansion, y el modelo se publica bajo licencia Apache 2.0.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no aplicable (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el modelo original es multilingue, pero no se detalla) |
| Licencia | Apache 2.0 |
| Formato de pesos | `.pte` (ExecuTorch) |

## Arquitectura y entrenamiento

No se proporcionan datos específicos sobre la arquitectura interna ni el proceso de entrenamiento en la documentación disponible. La model card indica que el repositorio contiene una exportación del modelo `multi-qa-MiniLM-L6-cos-v1` de sentence-transformers, que es un modelo de embeddings de frases diseñado para tareas de búsqueda semántica y similitud coseno. La exportación se realizó con ExecuTorch v0.6.0 y no se garantiza compatibilidad hacia atrás con versiones anteriores del runtime. El tokenizer se incluye en el archivo `tokenizer.json`.

## Capacidades

- Genera vectores de embeddings de frases para medir similitud semántica mediante coseno.
- Permite búsqueda semántica de preguntas y respuestas en texto (diseño "multi-qa").
- Ejecución local en dispositivo móvil sin conexión a internet.
- Integración declarativa en aplicaciones React Native a través de la librería `react-native-executorch`.
- Soporte para tareas de recuperación de información en tiempo real.
- No es un modelo generativo: no genera texto, solo produce representaciones vectoriales.

## Casos de uso

- Búsqueda semántica en aplicaciones de notas: el modelo permite indexar notas y buscar frases similares por su significado, no solo por coincidencia de palabras, todo en el dispositivo.
- Chatbots de atención al cliente con base de conocimiento local: se pueden comparar preguntas de usuarios con respuestas predefinidas para seleccionar la más adecuada.
- Recomendación de documentos en apps de productividad: al analizar la similitud entre el texto actual y documentos previos, se pueden sugerir contenidos relacionados.
- Búsqueda de preguntas frecuentes en apps de soporte: el modelo facilita encontrar la respuesta más cercana a la consulta del usuario sin depender de conexión.
- Análisis de texto en tiempo real para clasificación de mensajes: se pueden asignar etiquetas a textos comparando con embeddings de referencia.
- Sistema de deduplicación de contenido: comparar embeddings para detectar textos duplicados o muy similares en bases de datos locales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- No se especifican requisitos mínimos de VRAM en la documentación oficial.
- El modelo está exportado para el runtime ExecuTorch, diseñado para ejecutarse en dispositivos móviles (Android e iOS) y microcontroladores.
- Se recomienda probar en dispositivos con al menos 1 GB de RAM disponible, aunque el tamaño del archivo es de 0.6 GB y puede cargarse en memoria dinámicamente.
- Para integrarlo en React Native, se debe usar la librería `react-native-executorch` y seguir la documentación de instalación.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa con otros modelos de embeddings en este contexto, ya que la ficha se centra en la exportación específica para ExecuTorch. No se han encontrado datos de modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- El modelo está exportado para ExecuTorch v0.6.0 y no se garantiza compatibilidad con versiones anteriores del runtime.
- No se proporcionan detalles sobre el entrenamiento, posibles sesgos o limitaciones lingüísticas del modelo original.
- El modelo está pensado para tareas de embeddings y similitud, no para generación de texto.
- La licencia Apache 2.0 permite uso comercial, pero es necesario cumplir con las condiciones de la licencia.
- No se especifican idiomas soportados, aunque el modelo original `multi-qa-MiniLM-L6-cos-v1` es multilingüe según su nombre, no se confirma en esta ficha.
- El tokenizer se proporciona como `tokenizer.json`, pero se debe usar con el runtime adecuado.

## Enlaces

- [HuggingFace - software-mansion/react-native-executorch-multi-qa-MiniLM-L6-cos-v1](https://huggingface.co/software-mansion/react-native-executorch-multi-qa-MiniLM-L6-cos-v1)
- [GitHub - react-native-executorch](https://github.com/software-mansion/react-native-executorch)
- [Documentación - Getting Started](https://docs.swmansion.com/react-native-executorch/docs/fundamentals/getting-started)
- [Página oficial - On-device AI & LLM toolkit](https://executorch.swmansion.com/)
- [npm - react-native-executorch](https://www.npmjs.com/package/react-native-executorch)
