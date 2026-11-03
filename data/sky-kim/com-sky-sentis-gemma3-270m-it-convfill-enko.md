# Sky-Kim/com.sky.sentis.gemma3-270m-it-convfill-enko

## Resumen

`com.sky.sentis.gemma3-270m-it-convfill-enko` es un paquete de inferencia para Unity que empaqueta el modelo `Sky-Kim/gemma3-270m-IT-ConvFill-EnKo`, un fine-tuning bilingüe inglés-coreano del modelo Gemma 3 de 270 millones de parámetros. Lo desarrolla Sky-Kim y está pensado para ejecutarse en dispositivo (on-device) mediante Unity Inference Engine (Sentis), no como un modelo de chat generalista sino como el componente "Talker" de la arquitectura de *conversational infill* descrita en el paper arXiv:2511.07397.

La idea central de ConvFill es dividir la respuesta de un asistente de voz en dos modelos: un "Reasoner" grande en la nube que piensa y produce fragmentos de conocimiento, y un "Talker" pequeño en el dispositivo que, mientras el Reasoner trabaja, genera frases naturales para rellenar el silencio. El Talker recibe el turno del usuario, lo que ya ha dicho en ese turno y un fragmento de conocimiento (o el token especial `<sil>` cuando el Reasoner aún no ha respondido) y devuelve una única frase para sintetizar por voz.

El modelo es relevante por su tamaño reducido (270M parámetros, pesos FP16 de aproximadamente 870 MB) y por su enfoque de despliegue: se distribuye como paquete Unity instalable por Git URL, con grafo ONNX convertido a formato `.sentis`, tokenizador y pruebas de paridad contra ONNX Runtime. Su nicho es muy concreto: agentes de voz embebidos en aplicaciones Unity que necesitan latencia baja y respuesta conversacional inmediata en inglés y coreano.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder Gemma 3 (18 capas) + LM head, con entradas/salidas de KV-cache |
| Parametros totales | 270 millones (aproximado, según nomenclatura del modelo) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP16 (pesos del grafo `.sentis`); no se documentan otras cuantizaciones |
| Idiomas soportados | inglés (en), coreano (ko) |
| Licencia | gemma (Gemma Terms of Use) |
| Formato de pesos | `.sentis` (Unity Inference Engine) generado desde ONNX; tokenizer.json |
| Tamano del repo | 0,9 GB |
| Libreria | unity-sentis |
| Modelo base | Sky-Kim/gemma3-270m-IT-ConvFill-EnKo |
| Requisitos de runtime | Unity 6000.0+ y com.unity.ai.inference 2.6.1 |

## Arquitectura y entrenamiento

El modelo es un decoder transformer Gemma 3 de 18 capas con LM head, exportado a un grafo ONNX y convertido a FP16 en formato `.sentis`. El paquete incluye el grafo con entradas y salidas de KV-cache, lo que permite generación autoregresiva incremental sin recalcular el prefijo. El tokenizador es el de Gemma 3 extendido con el token especial `<sil>` (262.146 tokens en total) y se procesa mediante la API de tokenización de Unity.

El entrenamiento parte de `vysri/gemma3-270m-IT-ConvFill`, el Talker original en inglés, que se fine-tunea adicionalmente sobre la traducción al coreano de los datos de ConvFill. El modelo resultante responde en coreano a usuarios coreanos y en inglés a usuarios ingleses. La tarea de entrenamiento es *conversational infill*: dado un turno de usuario, el historial del intercambio previo, lo ya dicho en el turno actual y un fragmento de conocimiento (o `<sil>`), el modelo debe producir la siguiente frase hablada. El layout del prompt reproduce el del repositorio de ConvFill (`StreamingTurnDatasetContinued.py`), donde `knowledge` es un rol de turno que la plantilla de chat de Gemma no tiene de forma nativa. No se detallan en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron RLHF o DPO.

## Capacidades

- Generación de texto conversacional de una frase por llamada, orientada a síntesis de voz (TTS).
- Relleno conversacional (*filler*) cuando el Reasoner aún no ha respondido, mediante el token `<sil>`.
- Reformulación de fragmentos de conocimiento como siguiente frase hablada, continuando desde lo ya dicho en el turno.
- Bilingüe inglés-coreano, con cambio de idioma guiado por el turno del usuario y los fragmentos de conocimiento.
- Generación greedy determinista con gestión de KV-cache y máscaras.
- Continuación de prompts arbitrarios mediante `GenerateFromPromptAsync(prompt)`.
- Cancelación de generación con devolución del texto parcial generado.
- No se documentan capacidades de tool calling, function calling, agentes multi-paso, visión, audio ni modo de razonamiento explícito.

## Casos de uso

- Agentes de voz en aplicaciones Unity: el Talker genera frases de relleno mientras un Reasoner en la nube procesa la consulta, eliminando silencios incómodos en la conversación. Su tamaño de 270M y su ejecución vía Sentis lo hacen viable en dispositivo.
- Asistentes conversacionales embebidos en juegos y experiencias interactivas: el modelo responde en el idioma del usuario (inglés o coreano) con frases cortas adecuadas para TTS, integrándose en el bucle de juego mediante `TokensPerFrame` para controlar latencia frente a suavidad.
- Atención al cliente con backend híbrido: el Reasoner recupera y razona sobre conocimiento del dominio y el Talker lo reformula en lenguaje hablado natural, manteniendo el contexto del intercambio previo.
- Demostraciones y prototipos de asistentes por voz en Unity: el paquete incluye escena de ejemplo (`Samples~/InfillConsole`) y pruebas de paridad contra ONNX Runtime, lo que facilita validar el pipeline completo antes de integrar un Reasoner real.
- Aplicaciones sin conectividad constante: al ejecutarse on-device con pesos FP16 de unos 870 MB, el Talker puede mantener la interacción hablada localmente aunque el Reasoner no esté disponible temporalmente.
- Localización de asistentes de voz para mercados coreano e inglés: el fine-tuning bilingüe permite cubrir ambos idiomas con un único modelo y un único paquete, sustituyendo al paquete solo-inglés `com.sky.sentis.gemma3-270m-it-convfill` con la misma API.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; los pesos FP16 del grafo ocupan aproximadamente 870 MB, por lo que se necesita al menos ese espacio más el overhead de KV-cache y del runtime.
- GPU recomendadas: no disponible. El paquete soporta backend `GPUCompute` de Unity Inference Engine, además de CPU (las pruebas de paridad se ejecutan en CPU y GPUCompute).
- Cabe en GPU de consumo: previsiblemente sí, dado el tamaño de pesos (~870 MB), aunque no se documentan modelos concretos ni requisitos mínimos de VRAM.
- Opciones de despliegue: Unity Inference Engine (Sentis) mediante el paquete `com.sky.sentis.gemma3-270m-it-convfill-enko`; el flujo de conversión parte de ONNX y usa `Tools ▸ ConvFill` para instalar en StreamingAssets y convertir a FP16 `.sentis`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible. El parámetro `TokensPerFrame` (por defecto 4) controla cuántos pasos de decodificación se ejecutan seguidos antes de ceder un frame, lo que permite ajustar latencia frente a suavidad.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Despliegue | Notas |
|---|---|---|---|---|---|---|
| Sky-Kim/com.sky.sentis.gemma3-270m-it-convfill-enko | ~270M | no disponible | en, ko | gemma | Unity Sentis (on-device) | Talker bilingüe de conversational infill |
| Sky-Kim/com.sky.sentis.gemma3-270m-it-convfill | ~270M | no disponible | en | gemma | Unity Sentis (on-device) | Versión solo-inglés, misma API y namespace; instalable en sustitución del bilingüe |
| vysri/gemma3-270m-IT-ConvFill | ~270M | no disponible | en | gemma | Hugging Face (formato original) | Talker original en inglés del que deriva este modelo |
| Sky-Kim/gemma3-270m-IT-ConvFill-EnKo | ~270M | no disponible | en, ko | gemma | Hugging Face (formato original) | Modelo base del paquete Sentis, sin conversión a Unity |

## Limitaciones y advertencias

- El modelo no es un asistente generalista: está entrenado para producir una frase hablada por llamada en el esquema de conversational infill; usarlo fuera de ese patrón puede degradar la calidad.
- Los fragmentos de conocimiento largos hacen que un modelo de 270M derive; se recomienda que el Reasoner produzca frases cortas, de una idea cada una, y que no salude al usuario (el primer filler del Talker ya lo hace).
- Para coreano, el autor recomienda pedir al Reasoner que escriba los números en palabras Hangul (por ejemplo, 오천팔백구십오 미터), como en los datos de entrenamiento; de lo contrario el modelo puede comportarse de forma inconsistente.
- Solo soporta inglés y coreano; no se documentan capacidades multilingües adicionales.
- Riesgo de alucinación inherente a un modelo de 270M, especialmente al reformular conocimiento que no esté bien delimitado.
- Sesgos conocidos: no disponible en la información proporcionada.
- Licencia Gemma: el uso comercial está sujeto a los Gemma Terms of Use, que imponen restricciones y obligaciones de atribución; conviene revisarlos antes de distribuir el modelo en producción.
- El paquete requiere Unity 6000.0+ y `com.unity.ai.inference` 2.6.1; no es compatible con versiones anteriores de Unity ni con otros runtimes de inferencia documentados.
- Las llamadas se serializan; la cancelación detiene la generación y devuelve el texto parcial, lo que hay que gestionar en el bucle de conversación.
- En builds de jugador, `Models~` no se importa automáticamente: es necesario ejecutar `Tools ▸ ConvFill ▸ Install Models to StreamingAssets` antes de cargar `ConvFillModel.StreamingModelRoot`.
- No se documentan límites de longitud de contexto ni comportamiento con historiales largos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Sky-Kim/com.sky.sentis.gemma3-270m-it-convfill-enko
- Modelo base (EnKo): https://huggingface.co/Sky-Kim/gemma3-270m-IT-ConvFill-EnKo
- Talker original en inglés: https://huggingface.co/vysri/gemma3-270m-IT-ConvFill
- Paquete solo-inglés para Unity: https://huggingface.co/Sky-Kim/com.sky.sentis.gemma3-270m-it-convfill
- Paper de conversational infill: https://arxiv.org/abs/2511.07397
- Código de conversational infill: https://github.com/vysri/conversational-infill
- Git LFS: https://git-lfs.com
