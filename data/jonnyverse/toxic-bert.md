# JONNYVERSE/toxic-bert

## Resumen

JONNYVERSE/toxic-bert es una conversión a formato ONNX del modelo unitary/toxic-bert, creada por el usuario JONNYVERSE para hacerlo compatible con la librería Transformers.js de Hugging Face. El modelo original, desarrollado por Unitary, es un clasificador de texto diseñado para detectar comentarios tóxicos en múltiples dimensiones (amenaza, insulto, obscenidad, etc.) y en varios idiomas, entrenado sobre los datasets de la competición Jigsaw de Google. Esta versión ONNX permite ejecutar la clasificación directamente en el navegador o en entornos JavaScript sin necesidad de un backend de Python, lo que facilita la moderación de contenido en aplicaciones web y clientes ligeros.

El repositorio tiene un tamaño de 1,4 GB e incluye los pesos en formato ONNX dentro de una subcarpeta `onnx`, siguiendo las recomendaciones de Optimum para modelos web-ready. Aunque la ficha original del autor es mínima, el modelo base es ampliamente conocido en la comunidad por su utilidad en tareas de moderación automática. La relevancia actual radica en la creciente demanda de soluciones de moderación en tiempo real en aplicaciones descentralizadas y clientes web, donde la inferencia local sin servidor es una ventaja.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT (base, según el modelo base unitary/toxic-bert) |
| Parametros totales | no disponible |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo pesos ONNX) |
| Idiomas soportados | no disponible (el modelo original es multilingue, pero no se especifica en esta conversion) |
| Licencia | no disponible |
| Formato de pesos | ONNX (para Transformers.js) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de BERT base (bert-base-uncased), tal como se indica en la documentación del modelo original unitary/toxic-bert. Se trata de un transformer encoder con 12 capas, 768 dimensiones ocultas y 12 cabezas de atención, aunque estos números no se detallan en la información proporcionada para esta conversión. El entrenamiento original se realizó sobre los datasets de la competición Jigsaw Toxic Comment Classification Challenge, que contienen comentarios de Wikipedia etiquetados en varias categorías de toxicidad. Unitary publicó tres variantes del modelo: la original, una versión "unbiased" y otra multilingüe, pero no se especifica cuál de ellas se ha convertido aquí. Esta versión ONNX no introduce cambios en la arquitectura ni en los pesos; únicamente cambia el formato para ser cargada por Transformers.js.

No se dispone de información sobre el proceso de entrenamiento de esta conversión concreta (número de tokens, técnicas de ajuste, RLHF, etc.). La conversión a ONNX se realizó probablemente con la herramienta Optimum, tal como se menciona en la propia model card, pero no se detallan los pasos.

## Capacidades

- Clasificacion de texto para deteccion de toxicidad: identifica si un comentario es toxico y en que categoria (amenaza, insulto, obscenidad, etc.), segun las etiquetas del dataset Jigsaw.
- Soporte multilingue (heredado del modelo original, aunque no se confirma en esta conversion).
- Ejecucion en navegador o entornos JavaScript gracias a Transformers.js, sin necesidad de servidor.
- Inferencia local en el cliente, lo que reduce latencia y preserva la privacidad de los datos.
- No se documentan capacidades adicionales como tool calling, agentes o razonamiento multi-paso.

## Casos de uso

- Moderacion de comentarios en foros y redes sociales: el modelo puede clasificar comentarios de usuarios en tiempo real directamente en el navegador, bloqueando o marcando contenido toxico antes de que se publique.
- Filtrado de contenido en aplicaciones de chat: integrado en una aplicacion de mensajeria web, puede analizar mensajes entrantes y ocultar o advertir sobre aquellos que contengan lenguaje toxico.
- Analisis de opiniones en plataformas de reseñas: permite detectar reseñas abusivas o difamatorias en sitios de comercio electronico, ayudando a los moderadores a priorizar la revision.
- Control parental en navegadores o extensiones: una extension de navegador puede usar el modelo para bloquear o avisar sobre contenido toxico en paginas web visitadas por menores.
- Preprocesamiento de datos para entrenamiento de otros modelos: se puede utilizar para filtrar grandes volumenes de texto y eliminar ejemplos toxicos antes de entrenar modelos de lenguaje generativos.
- Auditoria de contenido en plataformas colaborativas: herramientas de gestion de comunidades pueden ejecutar el modelo localmente para generar informes de toxicidad sin enviar datos a servidores externos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible para esta conversion ONNX. El modelo original unitary/toxic-bert tiene metricas documentadas en su ficha, pero no se incluyen en los datos proporcionados. Por tanto, no se presenta tabla comparativa.

## Requisitos de hardware

- Tamaño del repositorio: 1,4 GB, lo que implica que la carga del modelo en memoria requiere al menos esa cantidad de RAM/VRAM, aunque el uso real dependerá del runtime.
- Al ser un modelo ONNX para Transformers.js, puede ejecutarse en CPU (WebAssembly) o GPU (WebGPU) en el navegador. No se especifican requisitos minimos.
- En un ordenador de sobremesa con 8 GB de RAM deberia poder ejecutarse, aunque la carga inicial puede ser lenta.
- Para despliegue en servidor, se puede usar ONNX Runtime, pero la intencion declarada es el uso en cliente.
- No se proporcionan datos de latencia o throughput.

## Comparativa con modelos similares

No se dispone de informacion suficiente para realizar una comparativa con otros modelos de toxicidad (por ejemplo, Detoxify, HateBERT o modelos de OpenAI). Los datos de parametros, contexto y rendimiento de esta conversion no estan publicados. Por tanto, la comparativa no esta disponible.

## Limitaciones y advertencias

- Sesgos conocidos del modelo original: al estar entrenado con datos de Jigsaw, puede presentar sesgos hacia ciertos grupos demograficos o formas de expresion, lo que puede provocar falsos positivos o negativos en la deteccion de toxicidad.
- Riesgo de alucinacion: al ser un clasificador, no genera texto, pero puede clasificar erroneamente entradas ambiguas o con ironia, especialmente en idiomas no dominados por el entrenamiento.
- Limitaciones de contexto: al ser BERT base, la longitud maxima de entrada suele ser 512 tokens; no se especifica en esta conversion, pero es una limitacion inherente.
- Idiomas: aunque el modelo original es multilingue, esta conversion no especifica que variante se incluye, por lo que el rendimiento en idiomas distintos del ingles no esta garantizado.
- Licencia: no se indica la licencia de este repositorio; el modelo base unitary/toxic-bert tiene una licencia (probablemente MIT, segun su ficha), pero no se confirma para esta conversion. Se recomienda verificar antes de uso comercial.
- Para produccion, es recomendable evaluar el modelo con datos propios y considerar un umbral de confianza ajustable para reducir falsos positivos.

## Enlaces

- Repositorio de HuggingFace: https://huggingface.co/JONNYVERSE/toxic-bert
- Modelo base unitary/toxic-bert: https://huggingface.co/unitary/toxic-bert
- Referencia de Transformers.js: https://huggingface.co/docs/transformers.js
- Herramienta de conversion Optimum: https://huggingface.co/docs/optimum/index
