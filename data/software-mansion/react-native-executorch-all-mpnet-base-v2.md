# software-mansion/react-native-executorch-all-mpnet-base-v2

## Resumen

Este repositorio aloja una exportación del modelo de embeddings de texto `all-mpnet-base-v2` (desarrollado originalmente por sentence-transformers) en formato `.pte` para el runtime ExecuTorch de Meta. La exportación ha sido realizada por Software Mansion con el objetivo de integrar el modelo en aplicaciones React Native mediante la librería `react-native-executorch`. El modelo permite generar representaciones vectoriales (embeddings) de oraciones y párrafos, lo que habilita búsqueda semántica, similitud textual y otras tareas de procesamiento de lenguaje natural directamente en el dispositivo, sin conexión a servidores.

La relevancia actual radica en la creciente demanda de soluciones de IA on-device que preserven la privacidad, reduzcan la latencia y funcionen sin conexión. Este modelo, al estar empaquetado para ExecuTorch, se integra de forma declarativa en aplicaciones móviles React Native, simplificando el despliegue de capacidades de embeddings en entornos de producción móvil. La versión de exportación corresponde a ExecuTorch v0.6.0, sin garantía de compatibilidad hacia adelante.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el modelo original all-mpnet-base-v2 usa MPNet, pero no se especifica en la ficha) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (formato `.pte` para ExecuTorch, sin detalle de cuantización) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | `.pte` (ExecuTorch) |

## Arquitectura y entrenamiento

No se proporcionan detalles sobre la arquitectura interna ni el proceso de entrenamiento en la información disponible. El repositorio contiene únicamente la exportación del modelo `all-mpnet-base-v2` al formato `.pte` para su ejecución en el runtime ExecuTorch. El modelo original, desarrollado por sentence-transformers, está basado en la arquitectura MPNet (una variante de transformer) y fue entrenado para producir embeddings de oraciones de alta calidad. Sin embargo, esta ficha se centra en la versión exportada, que no implica un reentrenamiento, sino una conversión de pesos y tokenizador para su uso en dispositivos móviles.

La exportación fue realizada con ExecuTorch v0.6.0 y el tokenizador se proporciona como `tokenizer.json` en el directorio raíz. No se indican detalles sobre el dataset de entrenamiento, el número de tokens procesados ni técnicas como RLHF o DPO.

## Capacidades

- Generación de embeddings de texto: el modelo transforma oraciones o párrafos en vectores densos que representan su significado semántico.
- Búsqueda semántica: permite encontrar documentos o frases similares por similitud coseno o distancia euclidiana.
- Clasificación de texto: los embeddings pueden utilizarse como características de entrada para clasificadores posteriores.
- Agrupación (clustering) de documentos: facilita la organización automática de grandes volúmenes de texto.
- Detección de paráfrasis: útil para identificar frases con significado equivalente.
- Recuperación de información: soporta sistemas de pregunta-respuesta basados en recuperación (retrieval) al comparar consultas con pasajes.

No se mencionan capacidades de tool calling, agentes, generación de texto libre, visión o audio. El modelo está especializado en representaciones vectoriales, no en generación autoregresiva.

## Casos de uso

- Búsqueda semántica en aplicaciones móviles: una app de notas o documentación puede indexar localmente los textos y permitir búsquedas por significado en lugar de palabras clave exactas. El modelo se ejecuta on-device, garantizando privacidad y funcionamiento sin conexión.
- Sistemas de recomendación de contenido: al convertir artículos, noticias o productos en embeddings, se pueden recomendar elementos similares calculando la proximidad vectorial. La ejecución local evita enviar datos del usuario a servidores externos.
- Moderación de contenido en tiempo real: los embeddings pueden alimentar clasificadores que detecten spam, toxicidad o temas sensibles en comentarios generados por usuarios, con latencia mínima al procesarse en el dispositivo.
- Asistentes personales con memoria semántica: un asistente móvil puede almacenar conversaciones pasadas como embeddings y recuperar fragmentos relevantes para responder consultas contextuales, mejorando la coherencia sin depender de la nube.
- Clasificación y etiquetado automático de correos o mensajes: las representaciones vectoriales permiten agrupar mensajes por tema o prioridad, facilitando la organización automática en clientes de correo o aplicaciones de mensajería.
- Análisis de sentimiento en encuestas o reseñas: los embeddings se utilizan como entrada para modelos de clasificación ligera que determinan la polaridad (positiva, negativa, neutra) de opiniones, todo dentro de la aplicación móvil.
- Detección de duplicados en bases de datos locales: al comparar embeddings de textos, se pueden identificar entradas repetidas o muy similares en aplicaciones de gestión de contactos, inventarios o documentos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de métricas como MMLU, HumanEval o GSM8K para esta versión exportada, ni comparaciones cuantitativas con otros modelos de embeddings. Se recomienda evaluar el rendimiento en el caso de uso específico, considerando la precisión de los embeddings y la latencia en dispositivos móviles reales.

## Requisitos de hardware

- Al ser una exportación para ExecuTorch, el modelo está diseñado para ejecutarse en dispositivos móviles (iOS y Android) mediante el runtime ExecuTorch. No requiere GPU dedicada; utiliza la CPU del dispositivo.
- No se especifican requisitos mínimos de memoria RAM ni almacenamiento. El tamaño del repositorio es de 2.8 GB, lo que sugiere que el archivo `.pte` puede ocupar varios cientos de MB, dependiendo de la cuantización aplicada (no indicada).
- Para la integración con React Native, se utiliza la librería `react-native-executorch` (disponible en npm) y se recomienda seguir la documentación oficial de ExecuTorch para la configuración del runtime.
- No se proporcionan datos de latencia o throughput. Se espera que la inferencia sea adecuada para tareas de embeddings en tiempo real en dispositivos de gama media, pero es necesario realizar pruebas en el hardware objetivo.
- Opciones de despliegue: únicamente mediante el runtime ExecuTorch. No se menciona compatibilidad con vLLM, llama.cpp u otros entornos de inferencia.

## Comparativa con modelos similares

No se dispone de datos comparativos en la información proporcionada. El modelo original `all-mpnet-base-v2` es un referente en embeddings de oraciones, pero esta versión exportada no incluye métricas de rendimiento. A modo de referencia cualitativa, se puede comparar con otras opciones de embeddings on-device como `all-MiniLM-L6-v2` (más ligero, 80 MB) o `bge-small-en` (también optimizado para eficiencia), pero no se han encontrado comparaciones numéricas en la documentación disponible.

## Limitaciones y advertencias

- Compatibilidad de runtime: los archivos `.pte` fueron exportados con ExecuTorch v0.6.0 y no se garantiza compatibilidad con versiones anteriores o posteriores del runtime. Si se utiliza fuera de React Native ExecuTorch, se debe verificar la compatibilidad según la documentación de ExecuTorch.
- Falta de especificaciones técnicas: no se documentan parámetros, contexto ni cuantización, lo que dificulta evaluar el rendimiento y los requisitos de memoria antes de la implementación.
- Sesgos y alucinaciones: al ser un modelo de embeddings, no genera texto libre, por lo que no presenta riesgo de alucinación en el sentido generativo. Sin embargo, los embeddings pueden reflejar sesgos presentes en los datos de entrenamiento del modelo original, lo que podría afectar tareas de clasificación o búsqueda.
- Idiomas: no se especifican los idiomas soportados. El modelo original `all-mpnet-base-v2` está entrenado principalmente en inglés, por lo que su rendimiento en otros idiomas puede ser limitado.
- Uso comercial: la licencia apache-2.0 permite uso comercial, pero se debe revisar la licencia del modelo original (sentence-transformers) y de ExecuTorch para asegurar el cumplimiento.
- Almacenamiento: el tamaño del repositorio (2.8 GB) puede ser elevado para aplicaciones móviles con restricciones de espacio. Se recomienda evaluar estrategias de descarga bajo demanda o cuantización adicional.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/software-mansion/react-native-executorch-all-mpnet-base-v2
- Librería npm react-native-executorch: https://www.npmjs.com/package/react-native-executorch
- Documentación oficial de React Native ExecuTorch: https://docs.swmansion.com/react-native-executorch/docs/fundamentals/getting-started
- Sitio web del proyecto: https://executorch.swmansion.com/
- Repositorio GitHub de software-mansion/react-native-executorch: https://github.com/software-mansion/react-native-executorch
- Documentación de ExecuTorch: https://pytorch.org/executorch/stable/index.html
- Nota de compatibilidad de ExecuTorch: https://github.com/pytorch/executorch/blob/11d1742fdeddcf05bc30a6cfac321d2a2e3b6768/runtime/COMPATIBILITY.md?plain=1#L4
