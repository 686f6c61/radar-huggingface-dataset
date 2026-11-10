# MostLime/keylime-m1

## Resumen

Keylime m1 es un modelo de lenguaje de 34 millones de parametros desarrollado por MostLime (Mostlime12195) para autocorreccion de teclado en dispositivos. Se distribuye unicamente en formato ONNX Runtime (ORT) preoptimizado, con pesos en int8, y esta pensado para ejecutarse localmente en las aplicaciones Keylime para Android y macOS, que lo descargan en el primer arranque y verifican su integridad mediante SHA-256 contra un manifiesto.

El modelo emplea una arquitectura decoder con atencion por bloques (Block AttnRes), un vocabulario SentencePiece de 16.384 tokens y una dimension de modelo de 384. Los grafos exportados son decodificadores de un solo paso que transportan su cache KV y el estado de convolucion corta como entradas y salidas, de modo que el teclado reutiliza el contexto izquierdo compartido y solo puntua las palabras candidatas.

Su relevancia es acotada pero concreta: no es un modelo de proposito general, sino un componente de inferencia en el borde (on-device) para correccion ortografica y puntuacion de candidatos en teclados moviles. El repositorio no incluye codigo ni datos de entrenamiento, solo los pesos exportados y el vocabulario. La fecha de creacion del repositorio es el 10 de noviembre de 2026 y no registra descargas ni likes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decoder transformer con atencion por bloques (Block AttnRes), decodificador de un solo paso con cache KV y estado de convolucion corta |
| Parametros totales | 34.279.552 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo opera por pasos sobre contexto izquierdo compartido; no se declara ventana maxima) |
| Tipos de cuantizacion | int8 (pesos); grafos ORT preoptimizados |
| Idiomas soportados | en (ingles) |
| Licencia | CC BY 4.0 |
| Formato de pesos | ONNX Runtime preoptimizado (`.ort`), dos grafos: `lm_block4.step.int8.ort` y `lm_block4.step.int8t.ort`; vocabulario en `vocab.json` |
| Dimension de modelo (d_model) | 384 |
| Tamano de vocabulario | 16.384 (SentencePiece) |
| Cabezas KV (n_kv_heads) | 2 |
| Dimension por cabeza (head_dim) | 64 |
| Kernel de convolucion | 7 |
| Estados internos | `k0`–`k4`, `v0`–`v4` (cache KV), `c0`–`c8` (estado de convolucion) |
| Tamano del repositorio | 0,1 GB |

## Arquitectura y entrenamiento

La arquitectura es un decoder transformer con atencion por bloques, denominada Block AttnRes en la model card. El grafo tiene `d_model` de 384, 16.384 tokens de vocabulario, 2 cabezas KV con `head_dim` de 64 y un kernel de convolucion de 7. Los grafos exportados son decodificadores de un solo paso: reciben y devuelven como entradas y salidas la cache KV (`k0`–`k4`, `v0`–`v4`) y el estado de convolucion corta (`c0`–`c8`), lo que permite al teclado reutilizar el contexto izquierdo y puntuar solo las palabras candidatas. Existen dos variantes de grafo: `lm_block4.step.int8.ort` (grafo por pasos con candidatos por lotes) y `lm_block4.step.int8t.ort` (grafo por pasos en arbol, que puntua todos los candidatos de una palabra en una sola llamada).

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF o DPO. La model card indica explicitamente que el repositorio no contiene codigo ni datos de entrenamiento, solo los pesos exportados y el vocabulario. Tampoco se documentan innovaciones adicionales como decodificacion especulativa o atencion lineal mas alla de la atencion por bloques y el esquema de estados persistentes.

## Capacidades

- Puntuacion de candidatos para autocorreccion: el grafo `int8t` puntua todos los candidatos de una palabra en una sola llamada, lo que permite al teclado elegir la correccion mas probable.
- Modelo de lenguaje de un solo paso con reutilizacion de contexto izquierdo mediante cache KV y estado de convolucion.
- Correccion ortografica en ingles para entrada de teclado.
- Inferencia en dispositivo (on-device) con pesos int8, orientada al ahorro de bateria (la model card lo describe como modelo "battery-saver").
- Integracion con aplicaciones Android y macOS mediante descarga del modelo en el primer arranque y verificacion SHA-256 contra manifiesto.
- Sin tokens de estilo.
- No se declaran capacidades de tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni modo de pensamiento.
- Capacidad multilingue limitada al ingles.

## Casos de uso

- Autocorreccion en teclados moviles: el modelo puntua candidatos de palabra en una sola llamada (`int8t`) reutilizando el contexto izquierdo, lo que encaja con la latencia exigida por un teclado en Android.
- Prediccion de siguiente palabra en teclados: el grafo por pasos con candidatos por lotes (`int8`) permite generar y ordenar sugerencias a partir del contexto ya procesado.
- Correccion en escritorio macOS: la aplicacion Keylime descarga el modelo en el primer arranque y lo verifica por SHA-256, integrandolo en el flujo de escritura del sistema.
- Procesamiento local con requisitos de privacidad: al ejecutarse en el dispositivo sin llamadas a servidor, el texto del usuario no sale del equipo, lo que resulta adecuado para entradas sensibles.
- Despliegue en dispositivos con recursos limitados: con 34 M de parametros e int8, el modelo esta pensado para equipos donde no cabe un LLM mayor y donde el consumo energetico es critico.
- Integracion en pipelines ONNX Runtime existentes: al distribuirse como grafos `.ort` preoptimizados, puede cargarse con el runtime de ORT sin conversion adicional ni dependencias de frameworks de entrenamiento.
- Verificacion de integridad en produccion: el manifiesto con lista de ficheros, layout del grafo y parametros de decodificacion permite validar cada descarga antes de su uso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; los ficheros de pesos ocupan aproximadamente 42,3 MB cada uno (42.312.320 y 42.342.088 bytes), por lo que la huella de memoria es del orden de decenas de MB mas los estados de cache y el vocabulario.
- GPU recomendadas: no aplica; el modelo esta disenado para inferencia en CPU en dispositivos moviles y de escritorio mediante ONNX Runtime.
- Compatibilidad con GPU de consumo: irrelevante para el caso de uso; el modelo cabe holgadamente en cualquier dispositivo, incluidos moviles.
- Opciones de despliegue: ONNX Runtime (formato ORT preoptimizado); no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de la misma categoria (autocorreccion on-device en formato ONNX con pesos int8).

## Limitaciones y advertencias

- Solo soporta ingles; no se declaran otros idiomas.
- No se documenta la longitud de contexto maxima ni el comportamiento fuera de la ventana de contexto izquierdo compartido.
- El repositorio no incluye codigo, tokenizador completo ni datos de entrenamiento; solo los grafos `.ort` y `vocab.json`.
- No se han publicado benchmarks, por lo que no es posible evaluar su calidad frente a alternativas.
- Riesgo de alucinacion y de correcciones erroneas inherente a un modelo de lenguaje pequeno; no se documentan mitigaciones.
- Sesgos conocidos: no documentados.
- La licencia CC BY 4.0 permite uso comercial con atribucion; es necesario conservar el aviso de copyright de Mostlime12195 y el texto de la licencia.
- El modelo depende de un manifiesto externo alojado en `autocorrect.mostlime.hackclub.app` y de una copia en el release `models-v1` de `Mostlime12195/keylime-models`; la disponibilidad de esos recursos condiciona el despliegue.
- Uso previsto acotado al teclado Keylime; no esta pensado como modelo de proposito general.

## Enlaces

- Hugging Face: https://huggingface.co/MostLime/keylime-m1
- Manifiesto: https://autocorrect.mostlime.hackclub.app/autocorrect-android/manifest.json
- Repositorio de modelos: https://github.com/Mostlime12195/keylime-models
- Licencia CC BY 4.0: https://creativecommons.org/licenses/by/4.0/
