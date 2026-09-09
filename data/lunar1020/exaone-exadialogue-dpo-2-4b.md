# lunar1020/EXAONE-ExaDialogue-DPO-2.4B

## Resumen

EXAONE-ExaDialogue-DPO-2.4B es un modelo de lenguaje conversacional de 2,4 mil millones de parámetros, desarrollado por lunar1020 como proyecto de práctica personal. Se basa en una versión "Llamafied" de EXAONE-3.5-2.4B-Instruct, es decir, el modelo original de LG AI Research reimplementado con arquitectura Llama sobre la infraestructura de HuggingFace Transformers. La finalidad del modelo es ofrecer un asistente de diálogo especializado en coreano, entrenado con el dataset de role-playing `huggingface-KREW/korean-role-playing` y alineado mediante DPO (Direct Preference Optimization) para mejorar la adecuación de las respuestas a preferencias humanas.

Este modelo es relevante para quien busque un modelo pequeño y ligero orientado a charla conversacional en coreano, con un enfoque particular en juegos de rol (role-playing). El hecho de ser un fine-tuning con DPO sobre un modelo base ya instruct y ajustado a diálogo lo hace interesante como punto de partida para experimentos de alineación y personalización de asistentes en coreano. La arquitectura es un transformer denso (sin mezcla de expertos), con un tamaño de pesos que lo hace apto para GPUs de consumo. La ventana de contexto no está documentada en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso de tipo Llama (basado en EXAONE-3.5-2.4B-Instruct "Llamafied") |
| Parametros totales | 2.405.327.360 (2,4B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | coreano (ko) |
| Licencia | exaone (licencia de LG AI Research) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning derivado de `beomi/EXAONE-3.5-2.4B-Instruct-Llamafied`, que a su vez es una conversión de la arquitectura EXAONE-3.5-2.4B-Instruct al formato Llama. Esto implica que internamente utiliza bloques transformer estándar con normalización, atención por cabezas y MLP feed-forward, sin mecanismos de mezcla de expertos ni componentes recurrentes. El autor indica que este modelo es una versión alineada con DPO de `lunar1020/EXAONE-ExaDialogue-2.4B`, por lo que la secuencia de entrenamiento fue: primero un ajuste instruct basado en EXAONE, luego un ajuste de diálogo con el dataset coreano de role-playing, y finalmente una etapa de optimización de preferencias mediante DPO.

El dataset utilizado es `huggingface-KREW/korean-role-playing`, un corpus de conversaciones en coreano diseñado para simular personajes y escenarios. No se proporcionan el número de tokens, la composición exacta del dataset ni detalles sobre hiperparámetros de entrenamiento. Tampoco se documentan técnicas adicionales como decodificación especulativa ni atención lineal. El propio autor lo presenta como un resultado de un proyecto personal de prácticas ("Personal Practice Project Result for Junior Summer 2026"), lo que sugiere que se trata de un experimento educativo y no de un modelo desarrollado para producción.

## Capacidades

- Generacion de texto conversacional en coreano, orientada a dialogos y a simulacion de personajes mediante role-playing.
- Alineacion con preferencias humanas gracias al entrenamiento con DPO, lo que puede mejorar la coherencia y la adecuacion de las respuestas en comparacion con el modelo base ExaDialogue sin DPO.
- Soporte de contexto y formato de prompt heredado de EXAONE-3.5-2.4B-Instruct, aunque la longitud de contexto no esta documentada en esta ficha.
- No se ha confirmado soporte de tool calling, function calling, vision, audio ni capacidades de razonamiento complejo explicito en la informacion disponible.
- Capacidad multilingue limitada: el modelo fue entrenado exclusivamente con datos en coreano y solo se declara el idioma `ko`.

## Casos de uso

- Chatbot de atencion al cliente en coreano: el modelo puede gestionar conversaciones multi-turno en las que un usuario describe una incidencia o hace una consulta; su entrenamiento dialogado y la alineacion con DPO ayudan a mantener un tono natural y respuestas mas adecuadas.
- Simulacion de personaje para juegos de rol narrativos en coreano: gracias al dataset de role-playing, el modelo puede adoptar personalidades y estilos de respuesta dentro de una historia interactiva.
- Asistente de conversacion para practicar coreano como lengua extranjera: estudiantes avanzados pueden conversar con el modelo para practicar expresiones coloquiales y situacionales, recibiendo respuestas coherentes en contexto.
- Prototipado de agentes conversacionales domesticos en coreano: un dispositivo o aplicacion puede usar el modelo como base para un asistente de voz o chat en el hogar, dada su pequena cantidad de parametros que permite ejecucion en hardware modesto.
- Generacion de dialogos para guiones, series de animacion o contenido creativo escrito en coreano: el modelo puede sugerir lineas de dialogo coherentes con un personaje definido, facilitando el trabajo de guionistas.
- Experimento de investigacion en alineacion DPO con modelos pequenos: investigadores interesados en comparar el rendimiento antes y despues de DPO pueden usar este modelo como caso de estudio, dado que existen las dos versiones (ExaDialogue y ExaDialogue-DPO) publicadas por el mismo autor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Los pesos en precision fp16 ocupan aproximadamente 4,8 GB (segun el tamano del repositorio), por lo que se recomienda una GPU con al menos 8 GB de VRAM para inferencia sin cuantizar.
- Con cuantizacion a 4 bits la memoria necesaria seria menor, aunque no se dispone de los tipos de cuantizacion publicados para este modelo.
- Puede ejecutarse en GPUs de consumo como una NVIDIA RTX 3060 de 12 GB o superior; en servidores son adecuadas las A10G, A100 o similares.
- Opciones de despliegue: HuggingFace Transformers en Python, y servicios compatibles con `text-generation-inference` y endpoints compatibles, segun las etiquetas del modelo en HuggingFace. Tambien es posible exportarlo a formato GGUF para usar con llama.cpp o Ollama, aunque esa conversion no esta publicada oficialmente.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Observaciones |
|---|---|---|---|---|---|
| EXAONE-ExaDialogue-DPO-2.4B | 2,4B | no disponible | coreano | exaone | Alineado con DPO, dataset de role-playing |
| lunar1020/EXAONE-ExaDialogue-2.4B | 2,4B | no disponible | coreano | exaone | Modelo base de este, sin etapa DPO |
| beomi/EXAONE-3.5-2.4B-Instruct-Llamafied | 2,4B | no disponible | coreano | exaone | Modelo instruct original en formato Llama, sin ajuste especifico de dialogo |

La comparacion se limita a los modelos directamente relacionados, ya que no se dispone de benchmarks publicados ni de datos sobre la ventana de contexto. La diferencia principal entre ellos es la etapa de entrenamiento: el instruct base, el ajuste de dialogo y el ajuste adicional con DPO.

## Limitaciones y advertencias

- Es un proyecto de practica personal, con cero descargas y cero likes en el momento de elaborar esta ficha; no tiene validacion en entornos de produccion.
- Solo esta entrenado en coreano; no se recomienda su uso en otros idiomas.
- No se han publicado benchmarks ni evaluaciones de calidad: el rendimiento real es desconocido.
- La longitu de contexto no esta documentada, lo que supone un riesgo al planificar tareas con contexto largo.
- El entrenamiento con un dataset de role-playing puede introducir sesgos de caracter, lenguaje o comportamiento asociados a los personajes simulados.
- Al ser un modelo de 2,4B, tiene mayor riesgo de alucinacion y menor capacidad de razonamiento que modelos mas grandes.
- La licencia `exaone` es una licencia de LG AI Research; es necesario revisarla antes de cualquier uso comercial, ya que puede incluir restricciones adicionales.
- No se informa de soporte para tool calling, vision ni audio; asumir que estas capacidades no estan disponibles.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/lunar1020/EXAONE-ExaDialogue-DPO-2.4B
- Modelo base (ExaDialogue): https://huggingface.co/lunar1020/EXAONE-ExaDialogue-2.4B
- Modelo base original (Llamafied): https://huggingface.co/beomi/EXAONE-3.5-2.4B-Instruct-Llamafied
- Licencia exaone: https://huggingface.co/LGAI-EXAONE/EXAONE-3.5-2.4B-Instruct/tree/main/LICENSE
- Dataset de role-playing coreano: https://huggingface.co/datasets/huggingface-KREW/korean-role-playing
