# MostLime/keylime-m2

## Resumen

Keylime m2 (variante m2s) es un modelo de lenguaje de 106 millones de parámetros desarrollado por MostLime, diseñado específicamente para autocorrección en teclados y aplicaciones de escritura. Se distribuye en formato ONNX Runtime (ORT) preoptimizado y está pensado para ejecución en dispositivo (on-device), tanto en la aplicación de teclado Keylime para Android como en la app de macOS. El modelo se descarga en el primer arranque de la aplicación y se verifica contra el SHA-256 del manifiesto oficial.

La arquitectura es un decoder transformer con atención por bloques (Block AttnRes), vocabulario SentencePiece de 32.768 tokens y una ventana de contexto de 32k. Se entrenó sobre 9.000 millones de tokens con tokens de estilo explícitos (casual, estándar y formal), lo que permite adaptar el registro de las sugerencias. Los pesos están cuantizados a int4, lo que reduce el tamaño del grafo a unos 79 MB por fichero.

Su relevancia radica en el nicho: no es un modelo de propósito general, sino un componente de inferencia de baja latencia para corrección ortográfica y predicción de palabras en teclados móviles. La exportación como grafos de un solo paso con caché KV y estado de convolución compartido entre candidatos está optimizada para puntuar múltiples palabras candidatas reutilizando el contexto izquierdo, un patrón de uso muy distinto al de un chatbot.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decoder transformer con Block AttnRes y convolución corta (conv_kernel 7) |
| Parametros totales | 106.315.648 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32k (según model card) |
| Tipos de cuantizacion | int4 (pesos); grafos exportados en ORT preoptimizado |
| Idiomas soportados | inglés (en) |
| Licencia | CC BY 4.0 |
| Formato de pesos | ONNX Runtime (ORT) preoptimizado; vocabulario SentencePiece en JSON |
| d_model | 640 |
| Vocabulario | 32.768 tokens (SentencePiece) |
| Cabezas KV | 2 |
| head_dim | 64 |
| Tokens de entrenamiento | 9B |
| Tamano del repo | 0,2 GB |

## Arquitectura y entrenamiento

El modelo es un decoder transformer de 106M parámetros con una variante de atención denominada Block AttnRes, que combina atención con cabezas KV reducidas (2 cabezas, head_dim 64) y una convolución corta de kernel 7. Los grafos exportados son decoders de un solo paso que transportan el caché KV (`k0`–`k5`, `v0`–`v5`) y el estado de la convolución corta (`c0`–`c9`) como entradas y salidas, de modo que el teclado reutiliza el contexto izquierdo compartido y solo puntúa las palabras candidatas. Existen dos variantes de grafo: `m2s.step.int4m.ort` (grafo de paso con candidatos por lotes) y `m2s.step.int4t.ort` (grafo de árbol que puntúa todos los candidatos de una palabra en una sola llamada).

El entrenamiento se realizó sobre 9.000 millones de tokens con tokens de estilo explícitos: el contexto comienza con `[EOS, id]`, donde 249 corresponde a casual, 250 a estándar y 251 a formal. No se documentan en la información disponible detalles sobre composición del dataset, uso de RLHF/DPO ni proceso de alineación. El repositorio no incluye código ni datos de entrenamiento, solo los pesos exportados y el vocabulario.

## Capacidades

- Autocorrección de texto en inglés: puntuación de palabras candidatas dado un contexto izquierdo compartido.
- Predicción de siguiente palabra y sugerencias de teclado en dispositivo.
- Adaptación de estilo mediante tokens explícitos (casual, estándar, formal).
- Inferencia de un solo paso con caché KV y estado de convolución persistente entre llamadas.
- Puntuación por lotes de candidatos (grafo `int4m`) y puntuación en árbol de todos los candidatos de una palabra (grafo `int4t`).
- Ejecución en ONNX Runtime con pesos int4, orientada a latencia baja en móvil y escritorio.
- No se documentan capacidades de tool calling, agentes, visión, audio, matemáticas ni razonamiento multi-paso.

## Casos de uso

- Teclado Android con autocorrección en dispositivo: el modelo puntúa las palabras candidatas reutilizando el contexto izquierdo mediante el grafo de paso, sin enviar pulsaciones a un servidor.
- App de escritorio macOS con sugerencias de escritura: el grafo `int4t` puntúa en una sola llamada todos los candidatos de una palabra, reduciendo el número de inferencias por pulsación.
- Adaptación de registro en correos y mensajes: los tokens de estilo (249/250/251) permiten que el teclado ofrezca sugerencias casuales en chat y formales en correo desde el mismo modelo.
- Corrección de erratas en campos de texto de formularios: la ventana de 32k permite mantener contexto de conversación o documento sin recortes agresivos.
- Predicción de siguiente palabra en barras de sugerencias: el decoder de un solo paso con caché KV encaja en el ciclo de pulsación típico de un teclado.
- Distribución verificable en aplicaciones: los ficheros se descargan en el primer arranque y se validan contra el SHA-256 del manifiesto, lo que facilita actualizaciones firmadas del modelo en producción.
- Integración en pipelines de escritura asistida fuera de las apps oficiales: al ser pesos ORT con licencia CC BY 4.0, se puede incorporar en otras aplicaciones de edición de texto en inglés.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; los grafos int4 ocupan aproximadamente 79 MB por fichero (`int4m` 78.969.984 bytes, `int4t` 79.105.008 bytes), por lo que la huella de pesos es inferior a 100 MB.
- GPU recomendadas: no disponible; el modelo está orientado a CPU/NPU en dispositivo mediante ONNX Runtime.
- Compatibilidad con GPU de consumo: los pesos int4 caben holgadamente en cualquier GPU de consumo, pero no se documentan requisitos ni rendimiento en GPU.
- Opciones de despliegue: ONNX Runtime (formato ORT preoptimizado); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de autocorrección on-device con los que contrastar parámetros, contexto, rendimiento o licencia.

## Limitaciones y advertencias

- Solo soporta inglés; no se documentan otros idiomas.
- Es un modelo especializado en autocorrección y predicción de palabras, no un modelo de propósito general: no se documentan capacidades de razonamiento, código, matemáticas, visión ni tool calling.
- No se documentan evaluaciones de sesgo, alucinación ni robustez; al ser un modelo pequeño de 106M parámetros, la calidad en contextos largos o dominios especializados no está avalada por benchmarks públicos.
- El repositorio no incluye código ni datos de entrenamiento, lo que limita la reproducibilidad y la auditoría del proceso de entrenamiento.
- La licencia CC BY 4.0 permite uso comercial con atribución; es necesario conservar la atribución a Mostlime12195 y el texto de licencia.
- Los grafos dependen del manifiesto oficial (lista de ficheros, disposición del grafo y parámetros de decodificación) alojado en `autocorrect.mostlime.hackclub.app`; cambios en el manifiesto o en el layout del grafo pueden romper la integración.
- El uso previsto asume ejecución en las apps oficiales de Keylime; su integración en otros productos requiere validar el contrato de entradas/salidas del grafo (caché KV y estados de convolución).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MostLime/keylime-m2
- Manifiesto oficial: https://autocorrect.mostlime.hackclub.app/autocorrect-android/manifest.json
- Repositorio de modelos (copia del manifiesto en release `models-v1`): https://github.com/Mostlime12195/keylime-models
- Licencia CC BY 4.0: https://creativecommons.org/licenses/by/4.0/
