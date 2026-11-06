# Sky-Kim/com.sky.sentis.gemma3-270m-it-convfill

## Resumen

sentis-gemma3-270m-it-convfill es la conversión al motor de inferencia Unity Sentis del modelo vysri/gemma3-270m-IT-ConvFill, un fine-tune de Gemma 3 de 270 millones de parámetros orientado a la técnica de *conversational infill*. La idea central es desacoplar el razonamiento de la conversación: un modelo grande en la nube (el *Reasoner*) piensa la respuesta, mientras este modelo pequeño actúa como *Talker* y mantiene el turno hablado emitiendo frases naturales en tiempo real, incluyendo rellenos conversacionales cuando el Reasoner aún no ha respondido.

El modelo resuelve el problema de la latencia percibida en asistentes de voz: en lugar de silencio mientras se espera la respuesta del modelo grande, el Talker genera una frase de espera ("Oh, that's a great question to ask before heading out.") y, a medida que el Reasoner entrega fragmentos de conocimiento, los reformula como oraciones habladas encadenadas con lo ya dicho. Cada llamada recibe el turno del usuario, lo ya pronunciado en el turno y un fragmento de conocimiento (o el token especial `<sil>`), y devuelve una única oración lista para TTS.

La aportación de este repositorio concreto es el empaquetado para Unity: pesos en FP16 convertidos a formato `.sentis`, tokenizador compatible con la API de Unity, runtime en C# con gestión de caché KV y decodificación greedy, y pruebas de paridad contra ONNX Runtime. Está pensado para ejecutarse en dispositivo (on-device) dentro de aplicaciones Unity 6000.0 o superiores.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 3), 18 capas, atención con ventana deslizante e atención global alternadas, grouped-query attention con 1 cabeza KV de 256 dimensiones |
| Parametros totales | 270 millones |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | ventana deslizante de 512 tokens en las capas locales; longitud global no disponible |
| Tipos de cuantizacion | FP16 (pesos del grafo `.sentis`); no se documentan otras cuantizaciones |
| Idiomas soportados | inglés únicamente (el fine-tune ConvFill es solo en inglés) |
| Licencia | Gemma (Gemma Terms of Use) |
| Formato de pesos | `.sentis` (Unity Sentis), exportado desde ONNX con `torch.onnx.export(dynamo=True)`, opset 20; tokenizador en `tokenizer.json` |
| Vocabulario | 262.146 tokens (Gemma 3 + token `<sil>`) |
| Dimension oculta | 640 |
| Cabezas KV | 1 cabeza de 256 dimensiones (GQA) |
| Tamano del paquete | aproximadamente 870 MB (pesos FP16); repositorio de 0,9 GB |
| Requisitos de entorno | Unity 6000.0+ y `com.unity.ai.inference` 2.6.1 |

## Arquitectura y entrenamiento

El modelo base es Gemma 3 de 270 millones de parámetros, un transformer decoder-only con 18 capas que intercala capas de atención local con ventana deslizante de 512 tokens y capas de atención global, siguiendo el esquema de Gemma 3. La atención usa grouped-query attention con una única cabeza KV de 256 dimensiones, lo que reduce el tamaño de la caché y facilita la inferencia en dispositivo. La dimensión oculta es 640 y la cabeza de lenguaje proyecta sobre un vocabulario de 262.146 tokens.

El fine-tune ConvFill se entrena con un formato de prompt específico que introduce un rol `knowledge` inexistente en la plantilla de chat estándar de Gemma. Cada ejemplo de entrenamiento contiene el turno anterior (usuario y respuesta), el turno actual del usuario, lo ya dicho por el Talker en ese turno y un fragmento de conocimiento del Reasoner o el token `<sil>`. El modelo aprende así a producir una sola oración por llamada, bien como relleno conversacional cuando no hay conocimiento disponible, bien como reformulación del fragmento recibido, continuando de forma coherente con lo ya pronunciado. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de RLHF o DPO.

La conversión a Sentis preserva el grafo con máscaras aditivas (`mask_full` y `mask_sliding`) construidas en CPU, caché KV explícita por capa (`past_key_values` y `present` copiados en el backend mediante `CopyOutput`) y una operación argmax separada en un `FunctionalGraph` para leer un entero por token. La generación es greedy y se detiene en `<end_of_turn>` (id 106) o `<eos>` (id 1).

## Capacidades

- Generación de texto conversacional breve: una oración por invocación, orientada a ser sintetizada por TTS.
- Generación de rellenos conversacionales (*fillers*) cuando recibe el token `<sil>`, manteniendo el turno hablado activo.
- Reformulación de fragmentos de conocimiento externo como oraciones habladas, encadenadas con lo ya dicho en el turno.
- Continuidad de turno: mantiene coherencia con la frase previa del propio Talker dentro del mismo turno.
- Continuación de prompts arbitrarios mediante `GenerateFromPromptAsync`, útil para plantillas propias.
- Decodificación greedy con control de pasos por frame (`TokensPerFrame`) para equilibrar latencia y suavidad.
- Cancelación temprana de generación devolviendo el texto parcial producido.
- No soporta tool calling, function calling, agentes multi-paso, visión, audio ni modo de razonamiento explícito.
- Capacidad multilingüe limitada al inglés.

## Casos de uso

- Asistentes de voz en aplicaciones Unity: el Talker se ejecuta on-device y emite una frase de espera inmediata mientras un Reasoner en la nube genera la respuesta, eliminando el silencio inicial percibido por el usuario.
- Videojuegos con NPC conversacionales: integrado en el runtime de Unity, permite que un personaje no jugable mantenga respuestas habladas fluidas sincronizadas con un sistema de diálogo basado en LLM en servidor.
- Atención al cliente por voz: el modelo cubre la latencia de un backend grande reformulando cada fragmento de conocimiento como una frase natural, con la ventana de 512 tokens suficiente para el intercambio previo y el turno actual.
- Kioscos y terminales interactivos sin conectividad permanente: al ejecutarse en Sentis sobre GPU o CPU local, puede gestionar los rellenos y la locución aunque el Reasoner tarde o falle temporalmente.
- Demostraciones y prototipos de investigación en conversación hablada: el paquete incluye escena de ejemplo `InfillConsole`, pruebas de paridad y script de exportación, lo que facilita reproducir el pipeline completo.
- Sistemas de narración guiada o audioguías: el Reasoner aporta datos factuales y el Talker los convierte en frases habladas encadenadas con transiciones naturales, manteniendo el hilo del turno.
- Integración en pipelines de TTS en tiempo real: la salida de una oración por llamada encaja directamente en una cola de síntesis, con control de pasos de decodificación por frame para ajustar latencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente documenta pruebas de paridad del tokenizador, los logits y la generación greedy contra ONNX Runtime en CPU y GPUCompute, sin métricas de calidad.

## Requisitos de hardware

- VRAM estimada: aproximadamente 870 MB solo para los pesos FP16, más la caché KV (18 capas, 1 cabeza de 256 dimensiones) y los buffers de activación; el consumo real depende del backend y del tamaño de la ventana.
- GPU recomendadas: no se especifican modelos concretos; el paquete está diseñado para `BackendType.GPUCompute` en Unity, por lo que se beneficia de cualquier GPU compatible con compute shaders.
- Cabe en GPU de consumo: sí, por el tamaño reducido de los pesos; no se detallan modelos concretos ni requisitos mínimos de VRAM.
- Opciones de despliegue: Unity Inference Engine (Sentis) con `com.unity.ai.inference` 2.6.1; exportación desde ONNX con `torch.onnx.export`; verificación con ONNX Runtime. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. El parámetro `TokensPerFrame` (por defecto 4) controla cuántos pasos de decodificación se ejecutan antes de ceder un frame; el ejemplo usa 8. Se recomienda `WarmupAsync()` para compilar los kernels una vez.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato / despliegue | Notas |
|---|---|---|---|---|---|
| sentis-gemma3-270m-it-convfill | 270 M | ventana deslizante 512 | Gemma | `.sentis` en Unity Sentis | Talker especializado en conversational infill, solo inglés |
| vysri/gemma3-270m-IT-ConvFill | 270 M | ventana deslizante 512 | Gemma | safetensors / transformers | Modelo base del anterior, sin empaquetado Unity |
| Gemma 3 270M (base) | 270 M | ventana deslizante 512 | Gemma | safetensors, GGUF y otros | Modelo generalista; no especializado en rellenos conversacionales |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- El fine-tune ConvFill es exclusivamente en inglés; no se garantiza un comportamiento correcto en otros idiomas.
- El modelo no razona ni aporta conocimiento propio: depende de los fragmentos que le entrega el Reasoner y puede reformular de forma imprecisa o incompleta.
- Riesgo de rellenos repetitivos o poco naturales si el Reasoner tarda mucho o si el historial previo es escaso.
- La generación es greedy, sin muestreo, lo que reduce la variedad de las frases producidas.
- La ventana de atención local es de 512 tokens; conversaciones con historiales largos pueden degradar la coherencia.
- Las llamadas están serializadas en el runtime: no hay concurrencia entre invocaciones.
- La licencia Gemma impone condiciones de uso, incluida la política de uso aceptable de Google; conviene revisarlas antes de un despliegue comercial.
- El paquete requiere Unity 6000.0 o superior, `com.unity.ai.inference` 2.6.1 y git-lfs; `Models~` no se importa automáticamente en Unity, hay que ejecutar la herramienta de instalación a StreamingAssets.
- No se documentan evaluaciones de sesgo ni de alucinación para este fine-tune.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Sky-Kim/com.sky.sentis.gemma3-270m-it-convfill
- Modelo base: https://huggingface.co/vysri/gemma3-270m-IT-ConvFill
- Paper de conversational infill: https://arxiv.org/abs/2511.07397
- Código del proyecto: https://github.com/vysri/conversational-infill
- git-lfs: https://git-lfs.com
