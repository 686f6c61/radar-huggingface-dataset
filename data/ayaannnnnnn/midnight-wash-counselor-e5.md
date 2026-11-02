# Ayaannnnnnn/midnight-wash-counselor-e5

## Resumen

Midnight Wash counselor emotion es un clasificador de texto de tipo BERT afinado a partir de `intfloat/multilingual-e5-small` (MIT) por el usuario Ayaannnnnnn. Su funcion es clasificar una frase corta de preocupacion, en coreano o en ingles, en una de 11 emociones predefinidas (`tired`, `hurt`, `guilt`, `anxious`, `lonely`, `grief`, `angry`, `future`, `burnout`, `crisis`, `other`) para que la aplicacion web Midnight Wash muestre una respuesta empatica preescrita. El modelo no genera texto: solo asigna una etiqueta.

Se distribuye en formato ONNX int8 (aproximadamente 118 MB) para ejecutarse con transformers.js en el navegador sobre CPU, lo que lo convierte en un ejemplo de clasificador pequeno y desplegable en el cliente. El repositorio ocupa 0,1 GB y la licencia es MIT.

Es relevante como referencia de pipeline de clasificacion emocional ligero y multilingue (coreano e ingles) con integracion directa en aplicaciones web, aunque su alcance es muy limitado: no es un modelo de proposito general ni un asistente conversacional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo BERT (base: intfloat/multilingual-e5-small), cabeza de clasificacion de secuencias |
| Parametros totales | no disponible (el modelo base e5-small ronda los 118 M, dato no confirmado en la informacion proporcionada) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 ONNX (`onnx/model_quantized.onnx`, ~118 MB) |
| Idiomas soportados | coreano (ko), ingles (en) |
| Licencia | MIT |
| Formato de pesos | ONNX (cuantizado int8); libreria transformers.js |
| Etiquetas de salida | tired, hurt, guilt, anxious, lonely, grief, angry, future, burnout, crisis, other |
| Prefijo de entrada | `query: ` (obligatorio, como en entrenamiento) |
| Tamano del repositorio | 0,1 GB |

## Arquitectura y entrenamiento

El modelo parte de `intfloat/multilingual-e5-small`, un encoder transformer multilingue, y anade una cabeza de clasificacion de secuencias (11 clases). Se ha convertido a ONNX y cuantizado a int8 para inferencia en navegador con transformers.js.

El entrenamiento (v2) utilizo aproximadamente 2.600 frases: unas 1.175 frases de preocupacion sinteticas escritas para el proyecto (coreano con variacion de habla casual y algo de ingles), comentarios en primera persona del dataset KOTE (MIT, Copyright (c) 2022 Jeon Duyoung) donde al menos 3 de 5 anotadores coinciden en una emocion mapeada, y ejemplos de etiqueta unica de GoEmotions (Apache License 2.0, Google Research). Las etiquetas publicas se reasignaron a las 11 emociones del proyecto; `lonely`, `future` y `crisis` provienen exclusivamente del conjunto sintetico. No se documentan tecnicas como RLHF, DPO ni decodificacion especulativa, ya que no es un modelo generativo.

## Capacidades

- Clasificacion de texto corto en 11 emociones (single-label).
- Soporte bilingue coreano e ingles, con variacion de habla casual en coreano.
- Inferencia en navegador sobre CPU mediante transformers.js y ONNX int8.
- Integracion sencilla en pipelines de aplicaciones web (pipeline `text-classification`).
- No soporta generacion de texto, tool calling, function calling, agentes, vision, audio ni razonamiento multi-paso.
- No dispone de modo "thinking" ni de capacidades de matematicas o codigo.

## Casos de uso

- Clasificacion de preocupaciones en una app web de bienestar: el modelo recibe una frase corta con prefijo `query: ` y devuelve la emocion dominante para seleccionar una respuesta empatica preescrita, como en la aplicacion Midnight Wash.
- Moderacion ligera de tono emocional en formularios de diario o confessionarios: permite etiquetar entradas de usuario en coreano o ingles sin enviar datos a un servidor, al ejecutarse en el navegador.
- Enrutamiento de mensajes en un chatbot de soporte: la etiqueta emocional puede decidir que plantilla de respuesta o que cola de atencion usar, con reglas adicionales para `crisis`.
- Prototipado rapido de interfaces empaticas: al ser un modelo de ~118 MB en int8, se puede integrar en demos web sin infraestructura de GPU.
- Investigacion sobre clasificacion emocional multilingue de frases cortas: sirve como baseline pequeno entrenado con KOTE y GoEmotions mapeados.
- Filtro previo en aplicaciones de salud mental no clinicas: combinado con reglas de palabras clave para `crisis`, puede derivar a lineas de ayuda (por ejemplo, 109 en Corea) cuando se detectan frases de riesgo.
- Clasificacion offline en dispositivos de bajos recursos: la ejecucion en CPU del navegador evita dependencias de backend y reduce la latencia de red.

## Benchmarks y rendimiento

Resultados de evaluacion publicados en la model card (modelo int8):

| Conjunto | Modelo solo | En la app (reglas de crisis primero, palabras clave si la puntuacion < 0,4) |
|---|---|---|
| 28 frases de preocupacion reservadas | 20/28 | 25/28 |
| KOTE test split, mapeado (86 comentarios en coreano) | 58/86 | 58/86 |
| GoEmotions test split, mapeado (60 comentarios en ingles) | 37/60 | 36/60 |

El autor advierte que los conjuntos publicos son comentarios sobre noticias, productos y publicaciones, no preocupaciones personales, y que sus etiquetas solo coinciden parcialmente, por lo que deben usarse para comparar versiones y no como precision absoluta.

## Requisitos de hardware

- Inferencia en CPU: el modelo int8 ONNX (~118 MB) esta disenado para ejecutarse en el navegador mediante transformers.js, sin GPU.
- VRAM estimada: no aplica para el flujo principal en navegador; en servidor, el modelo cabe en cualquier GPU consumer con pocos cientos de MB de memoria.
- GPU recomendadas: no disponibles en la informacion proporcionada; no se requieren para el caso de uso previsto.
- Cabe en GPU consumer: si, aunque el despliegue objetivo es CPU en navegador.
- Opciones de despliegue: transformers.js (principal), y en servidor cualquier runtime compatible con ONNX.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Midnight Wash counselor emotion (este modelo) | no disponible (base e5-small) | no disponible | Clasificacion emocional (11 clases, ko/en) | MIT | HuggingFace, ONNX int8 |
| intfloat/multilingual-e5-small (base) | no disponible | no disponible | Embeddings multilingues | MIT | HuggingFace |
| Modelos de clasificacion emocional basados en GoEmotions | no disponible | no disponible | Clasificacion emocional (en) | variable | HuggingFace |
| Clasificadores KOTE | no disponible | no disponible | Clasificacion emocional (ko) | variable | HuggingFace |

No se dispone de datos de rendimiento comparativos entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- No es una herramienta de diagnostico ni de consejo psicologico; solo selecciona una frase empatica preescrita.
- No se debe confiar en la etiqueta `crisis`: en el test de 28 frases el modelo etiqueto frases de crisis como `future`. La aplicacion comprueba frases de crisis con reglas y muestra siempre una linea de crisis (109 en Corea) cuando coinciden.
- Entrenado con un conjunto pequeno y parcialmente sintetico, por lo que puede fallar con sarcasmo, sentimientos mixtos o formulaciones alejadas de los datos de entrenamiento.
- Los conjuntos de test publicos no representan preocupaciones personales y sus etiquetas solo coinciden parcialmente con las del modelo.
- Cobertura limitada a coreano e ingles; no se documenta soporte para otros idiomas.
- Licencia MIT permite uso comercial, pero el autor restringe el uso previsto a la seleccion de respuestas preescritas y advierte contra usos clinicos.
- Al ejecutarse en navegador, la calidad depende del entorno del cliente y del uso correcto del prefijo `query: `.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Ayaannnnnnn/midnight-wash-counselor-e5
- Modelo base: https://huggingface.co/intfloat/multilingual-e5-small
- Documentacion de transformers.js: https://huggingface.co/docs/transformers.js
- Dataset KOTE: https://github.com/searle-j/KOTE
- Dataset GoEmotions: https://github.com/google-research/google-research/tree/master/goemotions
