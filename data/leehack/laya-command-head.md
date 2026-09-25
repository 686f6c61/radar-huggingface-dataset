# leehack/laya-command-head

## Resumen

leehack/laya-command-head es una cabeza de decisión (decision head) para el modelo Laya de ConvAI Innovations, ajustada específicamente para clasificar la intención de un comando escrito por el usuario en una aplicación. No es un modelo completo: se distribuye como un fichero `laya-head-commands.safetensors` con 36 tensores de cabeza en F32, sin tensores del codificador, que debe emparejarse con un backbone Laya (ModernBERT) en formato GGUF. Se integra mediante la clase `DecisionEngine` de la librería Dart llamadart.

El problema que resuelve es acotado y concreto: dada una frase corta escrita en la barra de comandos de una app, decidir a cuál de ocho intenciones corresponde (`search`, `task`, `event`, `reminder`, `message`, `calculate`, `ask`, `settings`). La cabeza se entrenó sobre una única pregunta de tipo `choice`, con el texto tecleado como estado y objetivos one-hot, congelando el codificador de Laya y entrenando solo `head.*`, `type_emb.*` y `scorer.*`.

Su relevancia es fundamentalmente práctica y demostrativa: sirve como ejemplo de ajuste fino reproducible dentro del ecosistema llamadart, con un conjunto de datos de 3.063 comandos etiquetados y un cuaderno de entrenamiento público. No obstante, el propio autor lo presenta explícitamente como un ejemplo de fine-tuning y no como el mejor lector de intenciones disponible en ese proyecto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cabeza de decisión sobre backbone ModernBERT (modelo base Laya); 36 tensores de cabeza (`head.*`, `type_emb.*`, `scorer.*`) |
| Parametros totales | No disponible (la cabeza contiene 36 tensores en F32; el backbone Laya se distribuye por separado) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (el modelo base Laya emplea un backbone ModernBERT; esta cabeza se evaluó solo con comandos cortos) |
| Tipos de cuantizacion | Cabeza: F32 en safetensors. Backbone: GGUF, con `laya-Q8_0.gguf` disponible por terceros |
| Idiomas soportados | Inglés (comandos cortos). El modelo base Laya se describe como multilingüe, pero esta cabeza no se entrenó ni evaluó fuera del inglés |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (F32) para la cabeza; se requiere un backbone Laya en GGUF cargado aparte |
| Tamaño del repositorio | 0,1 GB |
| Modelo base | convaiinnovations/laya, revisión 1c5edc17a7acd8701df6fc341c0d179f1c62c982 |
| Librería | llamadart |
| Revisiones | Creado y actualizado el 2026-09-25 |
| Descargas / likes | 0 descargas / 1 like |

## Arquitectura y entrenamiento

La arquitectura no es un transformer generativo completo, sino una cabeza de clasificación sobre el backbone de Laya, que a su vez se describe como un motor de decisión "System 1" basado en ModernBERT. La cabeza original de `convaiinnovations/laya` se toma como punto de partida con el codificador congelado; solo se actualizan los tensores `head.*`, `type_emb.*` y `scorer.*`. La cabeza de acción (`act head`) y las temperaturas del modelo base quedan sin modificar. El fichero de pesos incluye 36 tensores nombrados según la convención de PyTorch de Laya, en F32, y su metadato `laya.config` es el `rl_agent_config.json` sin modificar del modelo base, de modo que `DecisionEngine.load` no necesita un `configPath` explícito.

El entrenamiento se formuló como una única pregunta de tipo `choice`: "What does the user want to do with this text typed into the app?", con el texto tecleado como estado y ocho opciones de respuesta correspondientes a las ocho intenciones, cada una con su criterio de una línea en `lib/src/intents.dart`. El conjunto de datos tiene 3.063 comandos etiquetados: 48 comandos semilla, 1.346 generados a partir de plantillas y 1.669 generados por Qwen3.8-27B en cuantización Q4_K_M, de los 1.949 generados que se conservaron tras una segunda pasada de verificación con el mismo modelo. Los comandos que normalizaban a un comando de desarrollo o de validación se descartaron y los objetivos son one-hot.

La receta de ajuste fue de 60 épocas con AdamW a learning rate 3e-4, weight decay 0,01, 50 pasos de warmup seguidos de decaimiento coseno y batch de 32, con tres semillas. Se conservó la época con mejor precisión sobre los 48 comandos de desarrollo: semilla 0, época 29. El autor advierte que, con este volumen de datos, una única ejecución resulta ruidosa: las otras semillas produjeron cabezas con hasta cuatro comandos menos acertados en el conjunto de validación.

## Capacidades

- Clasificación de intención de comandos cortos en inglés sobre un conjunto cerrado de ocho etiquetas: `search`, `task`, `event`, `reminder`, `message`, `calculate`, `ask` y `settings`.
- Integración nativa con llamadart mediante `DecisionEngine`, con la API `DecisionEngine.load(engine, headPath: ...)`.
- Funcionamiento sobre CPU o GPU vía Metal cuando se combina con el backbone `laya-Q8_0.gguf`, con resultados equivalentes a los del codificador F32 de PyTorch según las mediciones del autor.
- Puerta de confianza configurable (el ejemplo usa un umbral de 0,3) que permite dejar el resultado sin clasificar cuando la confianza es baja.
- No soporta tool calling, function calling, razonamiento multi-paso, agentes ni generación de texto: es exclusivamente una cabeza de decisión.
- No dispone de modo de razonamiento (thinking mode), visión ni audio.
- No se han evaluado otras preguntas, otros conjuntos de opciones ni otros idiomas con esta cabeza.

## Casos de uso

- Barra de comandos de una aplicación de escritorio o móvil: el caso de uso principal y documentado. El texto tecleado se pasa a la cabeza, que devuelve una de las ocho intenciones para que la app decida si abre una búsqueda, crea una tarea, agenda un evento o lanza un recordatorio.
- Demostración reproducible de fine-tuning de una cabeza de decisión: el repositorio incluye `training/laya_head_tuning.ipynb`, los scripts `bin/make_dataset.dart`, `bin/generate_commands.dart` y `bin/verify_commands.dart`, y una receta completa con hiperparámetros, lo que lo convierte en material didáctico para quien quiera adaptar Laya a su propio dominio.
- Clasificación de notificaciones y captura rápida en un centro de comandos local-first: encaja con el escenario del proyecto Laya, que agrega Slack, Gmail, GitHub, Jira, Notion, Outlook y Calendar, y necesita decidir qué hacer con una entrada de texto corta.
- Enrutado previo de bajo coste antes de un modelo mayor: al ser un clasificador pequeño y rápido, puede actuar como primera etapa que decide si merece la pena invocar un LLM local más grande para interpretar el comando.
- Etiquetado asistido de datos de intención: la cabeza puede usarse para pre-etiquetar comandos recogidos en producción y luego revisar manualmente solo los casos de baja confianza, aprovechando la puerta configurable.
- Prueba comparativa de despliegue en Dart: sirve para medir en `bin/bench.dart` la diferencia entre ejecutar la cabeza con el codificador F32 de PyTorch y con el backbone GGUF cuantizado en Metal, útil como referencia de portabilidad.

## Benchmarks y rendimiento

El autor publica resultados de precisión de intención (número de aciertos) sobre 48 comandos de desarrollo, usados para seleccionar el checkpoint y la puerta, y 32 comandos de validación, no usados en esa selección:

| Cabeza | Desarrollo (48) | Validación (32) |
|---|---|---|
| Cabeza base de Laya, codificador F32 de PyTorch | 29 | 18 |
| Cabeza base de Laya, llamadart con `laya-Q8_0.gguf` en Metal | 28 | 18 |
| Esta cabeza, codificador F32 de PyTorch | 46 | 27 |
| Esta cabeza, llamadart con `laya-Q8_0.gguf` en Metal | 46 | 27 |

En `bin/bench.dart`, con la puerta de confianza de 0,3, la barra muestra la intención correcta en 26 de los 32 comandos de validación, la incorrecta en 4 y permanece neutra en 2. No se han publicado resultados de MMLU, HumanEval, GSM8K ni de ningún otro benchmark estándar, y no serían aplicables a una cabeza de clasificación de intenciones.

## Requisitos de hardware

- El repositorio de la cabeza ocupa 0,1 GB, pero requiere además un backbone Laya en GGUF cargado por separado; no se proporcionan cifras exactas de VRAM en la información disponible.
- Al tratarse de una cabeza de decisión sobre un backbone ModernBERT, el conjunto es de tamaño reducido y cabe con holgura en GPU de consumo (RTX 3060, RTX 4090 y similares), así como en CPU.
- El autor confirma ejecución con el backbone `laya-Q8_0.gguf` de `fr0stbit3/laya-gguf` sobre Metal, es decir, en hardware Apple Silicon.
- El proyecto base Laya se presenta como local-first, con ejecución mediante Ollama y LM Studio además de modelos en la nube para el resto del sistema; esta cabeza concreta se integra vía llamadart.
- Opciones de despliegue: llamadart (`DecisionEngine.load`), llama.cpp para el backbone GGUF y los entornos compatibles con GGUF del ecosistema Laya (Ollama, LM Studio) para el sistema completo.
- Latencia y throughput: no se publican mediciones específicas para esta cabeza. El proyecto base Laya se anuncia como un motor de decisión con latencias del orden de 33 ms, cifra que corresponde al sistema base y no está verificada para este ajuste.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Precisión en validación (32 comandos) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| leehack/laya-command-head | Cabeza de decisión sobre Laya (ModernBERT) | 36 tensores de cabeza en F32 | No disponible | 27/32 en PyTorch y en llamadart | Apache-2.0 | HuggingFace (0 descargas, 1 like) |
| Cabeza base de convaiinnovations/laya | Cabeza de decisión original | No disponible | No disponible | 18/32 en PyTorch, 18/32 en llamadart | Apache-2.0 | HuggingFace |
| Lector de ejemplo más cercano con EmbeddingGemma (mencionado en el proyecto llamadart) | Recuperación de ejemplo más cercano | No disponible | No disponible | No disponible; el autor indica que es más preciso que esta cabeza | No disponible | Incluido en el ejemplo de llamadart |
| Lectores basados en LLM pequeños (mencionados en el proyecto llamadart) | Generación con LLM | No disponible | No disponible | No disponible; el autor indica que son más precisos que esta cabeza | No disponible | Incluido en el ejemplo de llamadart |

No se dispone de datos comparativos con clasificadores de intención estándar (por ejemplo, aproximaciones con SetFit o fine-tuning de encoders tipo BERT) para este conjunto de comandos.

## Limitaciones y advertencias

- La cabeza se entrenó únicamente para una pregunta y ocho opciones concretas. Otras preguntas y otros conjuntos de opciones no se han evaluado con estos pesos.
- Funciona solo con comandos cortos en inglés, igual que el modelo base. No hay evidencia de comportamiento multilingüe para esta cabeza.
- El propio autor señala que el lector de ejemplo más cercano basado en EmbeddingGemma y los lectores con LLM pequeños son más precisos sobre los mismos comandos: esta cabeza es un ejemplo de fine-tuning, no el mejor lector de intenciones del proyecto.
- El conjunto de evaluación es muy reducido (48 comandos de desarrollo y 32 de validación), por lo que las diferencias de precisión deben interpretarse con cautela. El autor advierte que una sola ejecución resulta ruidosa a esta escala y que otras semillas rindieron hasta cuatro comandos menos.
- El conjunto de entrenamiento combina datos semilla, plantillas y generación sintética con Qwen3.8-27B, verificados por el mismo modelo; esto puede introducir sesgos de estilo y vocabulario procedentes del generador, no medidos en la información disponible.
- Parte de los comandos generados se descartaron por normalizar a comandos de desarrollo o validación, pero no se documenta el número final descartado ni el impacto en la cobertura de intenciones.
- Riesgo de alucinación: no aplica en el sentido generativo, ya que el modelo solo emite una etiqueta entre ocho opciones; el riesgo real es de clasificación errónea, mitigado parcialmente por la puerta de confianza a 0,3.
- Licencia Apache-2.0, igual que el modelo base, sin restricciones adicionales conocidas para uso comercial. Al ser una versión modificada de la cabeza de `convaiinnovations/laya`, conviene conservar la atribución correspondiente.
- Requiere emparejarse con un backbone Laya en GGUF distribuido por terceros (`fr0stbit3/laya-gguf`), lo que añade una dependencia externa al despliegue.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/leehack/laya-command-head
- Modelo base Laya: https://huggingface.co/convaiinnovations/laya
- Árbol de ficheros del modelo base: https://huggingface.co/convaiinnovations/laya/tree/main
- Backbone GGUF de terceros: https://huggingface.co/fr0stbit3/laya-gguf
- Ejemplo `laya_command_bar` de llamadart: https://github.com/leehack/llamadart/tree/main/example/laya_command_bar
- Proyecto Laya en GitHub: https://github.com/aayushch/laya
- Sitio del proyecto Laya: https://laya.aay.sh/index.html
- Página del motor de decisión Laya (ConvAI Innovations): https://laya.convaiinnovations.com/
