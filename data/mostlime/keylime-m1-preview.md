# MostLime/keylime-m1-preview

## Resumen

Keylime m1 (34M) Preview es un modelo de lenguaje compacto especializado en autocorrección para teclados, desarrollado por MostLime (Mostlime12195). Se distribuye en formato ORT preoptimizado para onnxruntime y está pensado para ejecutarse íntegramente en el dispositivo, sin conexión a servidores. El modelo lo consumen la aplicación de teclado Keylime para Android y la app Keylime para macOS, que descargan los ficheros en el primer arranque y verifican su integridad mediante SHA-256 contra un manifiesto remoto.

La arquitectura es un decoder LM de tipo Block AttnRes con 34.279.552 parámetros, dimensión de modelo de 384, 2 cabezas KV con dimensión de cabeza 64 y un vocabulario SentencePiece de 16.384 tokens. Los pesos se exportan en int8, lo que reduce el tamaño del grafo a unos 42 MB por fichero, y el modelo se emplea como la variante de bajo consumo ("battery-saver") dentro de la familia Keylime.

Se trata de una versión preview publicada para mostrar capacidades y recoger feedback y datos de mejora; el autor advierte explícitamente de que los pesos, el layout de ficheros y el manifiesto pueden cambiar entre versiones. No incluye código ni datos de entrenamiento en el repositorio, solo los pesos exportados y el vocabulario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decoder LM tipo Block AttnRes (transformer con atención de bloques y convolución corta) |
| Parametros totales | 34.279.552 (34M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo opera sobre contexto izquierdo compartido y candidatos; no se declara ventana máxima) |
| Tipos de cuantizacion | int8 (pesos exportados en int8; dos variantes de grafo: `step` y `step.int8t` tree) |
| Idiomas soportados | en (inglés) |
| Licencia | CC BY 4.0 |
| Formato de pesos | ORT (onnxruntime preoptimizado), con vocabulario SentencePiece en `vocab.json` |
| d_model | 384 |
| Vocabulario | 16.384 tokens (SentencePiece) |
| n_kv_heads | 2 |
| head_dim | 64 |
| conv_kernel | 7 |
| Tamano de fichero | 42.312.320 bytes (`lm_block4.step.int8.ort`); 42.342.088 bytes (`lm_block4.step.int8t.ort`) |
| Tamano del repo | 0,1 GB |
| Libreria | onnxruntime |

## Arquitectura y entrenamiento

El modelo es un decoder LM autorregresivo de tipo Block AttnRes con atención multi-cabeza de 2 cabezas KV y dimensión de cabeza 64, dimensión de modelo 384 y una convolución corta de kernel 7. Los grafos exportados son decoders de un solo paso que transportan su caché KV (`k0`–`k4`, `v0`–`v4`) y el estado de las convoluciones cortas (`c0`–`c8`) como entradas y salidas, de modo que el teclado reutiliza el contexto izquierdo compartido y solo puntúa las palabras candidatas. Existe una variante "tree step graph" (`lm_block4.step.int8t.ort`) que en una sola llamada puntúa todos los candidatos de una palabra.

Los pesos están cuantizados a int8 y preoptimizados en formato ORT para onnxruntime, lo que permite inferencia en dispositivo con un consumo reducido. No se han publicado datos sobre el corpus de entrenamiento, el número de tokens, la composición del dataset ni si hubo etapas de RLHF o DPO; el repositorio no contiene código ni datos de entrenamiento. El vocabulario es SentencePiece de 16.384 tokens y el modelo no emplea tokens de estilo ("No style tokens"). El manifiesto con la lista de ficheros, el layout del grafo por pasos y los parámetros de decodificación está publicado en el endpoint del autor y replicado en el release `models-v1` del repositorio de GitHub.

## Capacidades

- Autocorrección de texto en inglés sobre contexto izquierdo compartido, puntuando palabras candidatas en un solo paso.
- Puntuación por lotes de candidatos mediante el grafo `step` y puntuación conjunta de todos los candidatos de una palabra mediante el grafo `tree` (`int8t`).
- Inferencia en dispositivo (on-device) sin conexión, integrada en teclados Android y en la app de macOS.
- Modo de bajo consumo ("battery-saver") dentro de la familia Keylime.
- Gestión de estado interno (caché KV y estado de convolución) entre pasos de decodificación.
- No se declaran capacidades de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking.
- Capacidad multilingüe limitada al inglés (`en`).

## Casos de uso

- Autocorrección en teclados Android: el teclado descarga el fichero ORT en el primer arranque, verifica el SHA-256 contra el manifiesto y ejecuta el decoder de un paso reutilizando la caché KV del contexto izquierdo para corregir la palabra en curso sin salir del dispositivo.
- Autocorrección en la app de macOS: la aplicación de escritorio usa el mismo manifiesto y los mismos ficheros, de modo que la lógica de corrección es idéntica en ambas plataformas y no requiere backend.
- Predicción y ranking de candidatos de una palabra: el grafo `tree` (`lm_block4.step.int8t.ort`) puntúa todos los candidatos de una palabra en una sola llamada, lo que reduce el número de invocaciones al runtime y el consumo energético.
- Integración en pipelines onnxruntime existentes: al distribuirse como ORT preoptimizado, puede cargarse con la API de onnxruntime sin pasos de conversión adicionales, lo que simplifica el despliegue en apps móviles y de escritorio.
- Modo de bajo consumo en dispositivos con batería limitada: al ser la variante "battery-saver" de la familia, encaja en escenarios donde el presupuesto energético es la restricción principal y basta con corrección de inglés.
- Evaluación y feedback de una preview: el autor publica esta versión para recoger datos y comentarios; equipos que quieran probar corrección on-device en inglés pueden integrarla y reportar comportamiento antes de que cambien pesos y layout.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no aplica en el sentido habitual; el modelo está pensado para CPU/NPU en dispositivo. El grafo int8 ocupa unos 42 MB por fichero, por lo que la huella de memoria es del orden de decenas de MB más el estado de caché KV y convolución.
- GPU recomendadas: no disponible; el autor no publica requisitos de GPU. El destino son teclados Android y app macOS con onnxruntime.
- ¿Cabe en GPU de consumo? Sí, por tamaño (34M parámetros en int8, ~42 MB), aunque el objetivo declarado es la ejecución en dispositivo, no GPU dedicada.
- Opciones de despliegue: onnxruntime con formato ORT preoptimizado (única opción documentada). No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible; no se publican cifras.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de autocorrección on-device con los que contrastar parámetros, contexto, rendimiento o licencia.

## Limitaciones y advertencias

- Versión preview: el autor advierte de que los pesos, el layout de ficheros y el manifiesto pueden cambiar entre versiones; no es un producto terminado.
- Solo inglés (`en`); no hay soporte multilingüe declarado.
- No se documentan datos de entrenamiento, composición del corpus ni procesos de alineación (RLHF/DPO), por lo que no es posible evaluar sesgos de forma rigurosa.
- Riesgo de alucinación y de correcciones erróneas inherente a un LM de 34M; no se publican métricas de precisión.
- Longitud de contexto no declarada; el uso previsto es contexto izquierdo compartido y puntuación de candidatos, no generación libre de texto largo.
- Licencia CC BY 4.0: permite uso comercial con atribución a Mostlime12195; hay que conservar el aviso de copyright y la licencia.
- El repositorio no contiene código ni datos de entrenamiento, solo pesos y vocabulario; la integración depende de la API de onnxruntime y del manifiesto externo.
- La verificación de integridad depende de un manifiesto remoto (endpoint del autor y release `models-v1` en GitHub); conviene fijar versiones y hashes en producción.

## Enlaces

- Hugging Face: https://huggingface.co/MostLime/keylime-m1-preview
- Manifiesto: https://autocorrect.mostlime.hackclub.app/autocorrect-android/manifest.json
- Repositorio de modelos (release `models-v1`): https://github.com/Mostlime12195/keylime-models
- Descarga directa de ficheros: https://huggingface.co/MostLime/keylime-m1-preview/resolve/main/<file>
- Licencia CC BY 4.0: https://creativecommons.org/licenses/by/4.0/
