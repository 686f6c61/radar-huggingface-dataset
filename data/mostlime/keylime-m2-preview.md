# MostLime/keylime-m2-preview

## Resumen

Keylime m2 (106M) — Preview es un modelo de lenguaje para autocorrección en dispositivo, desarrollado por MostLime (Mostlime12195) y publicado en formato ONNX Runtime preoptimizado (ORT). Se trata de un decodificador de 106.315.648 parámetros con arquitectura Block AttnRes, vocabulario SentencePiece de 32.768 tokens y pesos cuantizados a int4. Está entrenado sobre 9.000 millones de tokens con tokens de estilo (casual, estándar, formal) y es el modelo por defecto de las aplicaciones Keylime para Android y macOS.

El modelo resuelve un problema muy concreto: la corrección ortográfica y de palabras candidatas en teclados móviles y de escritorio sin depender de la nube. Los grafos exportados son decodificadores de un solo paso que transportan su caché KV y el estado de convolución corta como entradas y salidas, de modo que el teclado reutiliza el contexto izquierdo compartido y solo puntúa las palabras candidatas. Esto permite una integración de baja latencia y con requisitos de memoria mínimos.

Es relevante ahora porque es un ejemplo de modelo pequeño, cuantizado y empaquetado para inferencia local en ONNX Runtime, con un manifiesto versionado y verificación SHA-256 de cada fichero. La versión es una preview explícita: el autor advierte de que los pesos, la disposición de ficheros y el manifiesto cambiarán entre versiones. No hay código ni datos de entrenamiento en el repositorio, solo los pesos exportados y el vocabulario.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Decoder LM Block AttnRes (transformer decoder con atención de bloques y convolución corta) |
| Parámetros totales | 106.315.648 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (los grafos son de un solo paso con caché KV; el contexto efectivo lo fija la aplicación) |
| Tipos de cuantización | int4 (pesos); dos variantes de grafo: `int4m` e `int4t` |
| Idiomas soportados | inglés (en) |
| Licencia | CC BY 4.0 |
| Formato de pesos | ONNX Runtime preoptimizado (ORT), grafos de un solo paso; vocabulario en JSON (SentencePiece) |

## Arquitectura y entrenamiento

La arquitectura es un decodificador transformer con Block AttnRes, `d_model` de 640, `vocab_size` de 32.768, `n_kv_heads` de 2, `head_dim` de 64 y `conv_kernel` de 7. Los grafos exportados son decodificadores de un solo paso que reciben y devuelven el estado: las claves y valores de atención (`k0`–`k5`, `v0`–`v1` por capa) y el estado de convolución corta (`c0`–`c9`). El repositorio incluye dos grafos: `m2s.step.int4m.ort` (grafo de paso con candidatos por lotes) y `m2s.step.int4t.ort` (grafo de paso en árbol, que puntúa todos los candidatos de una palabra en una sola llamada).

El entrenamiento se realizó sobre 9.000 millones de tokens con tokens de estilo: el contexto comienza con `[EOS, id]`, donde 249 corresponde a casual, 250 a estándar y 251 a formal. No se especifican en la información disponible la composición del dataset, el uso de RLHF/DPO ni otras innovaciones de entrenamiento más allá del esquema de tokens de estilo y la exportación ORT preoptimizada. El repositorio no contiene código ni datos de entrenamiento.

## Capacidades

- Autocorrección de texto en inglés: puntuación de palabras candidatas dado un contexto izquierdo compartido.
- Puntuación por lotes de candidatos (`int4m`) y puntuación en árbol de todos los candidatos de una palabra en una sola llamada (`int4t`).
- Control de estilo mediante tokens de estilo: casual (249), estándar (250) y formal (251).
- Inferencia en dispositivo con ONNX Runtime, con caché KV y estado de convolución transportados entre pasos.
- Verificación de integridad de ficheros mediante SHA-256 en el manifiesto del modelo.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: solo inglés.
- Capacidades especiales (visión, audio, modo thinking): no disponible.

## Casos de uso

- Teclado Android con autocorrección local: la app Keylime descarga los ficheros en el primer arranque, verifica el SHA-256 contra el manifiesto y ejecuta el grafo ORT para puntuar candidatos sin enviar pulsaciones a la nube.
- App de escritorio para macOS: el mismo modelo `m2s_int4` actúa como modelo por defecto, reutilizando el contexto izquierdo compartido para corregir la palabra en curso con baja latencia.
- Puntuación en árbol de candidatos: el grafo `int4t` permite evaluar todas las variantes de una palabra en una sola llamada, lo que reduce el número de invocaciones por pulsación en el teclado.
- Ajuste de tono en la corrección: los tokens de estilo permiten que el mismo modelo adapte sus sugerencias a registros casual, estándar o formal según la configuración del usuario.
- Integración en pipelines de verificación de artefactos: el manifiesto con lista de ficheros, disposición del grafo y parámetros de decodificación sirve como referencia para validar despliegues y actualizaciones de pesos.
- Prototipado de correctores en dispositivo: al ser un modelo de 106M en int4 con grafos ORT, se puede embeber en aplicaciones móviles o de escritorio con recursos limitados para experimentar con corrección contextual en inglés.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; los pesos int4 ocupan aproximadamente 78,97 MB (`int4m`) y 79,11 MB (`int4t`) por grafo, más el vocabulario de 695.095 bytes.
- GPU recomendadas: no disponible; el modelo está pensado para inferencia en dispositivo (CPU/NPU de móvil y escritorio) mediante ONNX Runtime.
- ¿Cabe en GPU de consumo? No hay datos específicos; por tamaño de fichero (menos de 80 MB por grafo) es compatible con entornos de muy baja memoria, pero no se detallan requisitos de GPU.
- Opciones de despliegue: ONNX Runtime con grafos ORT preoptimizados; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de autocorrección en dispositivo ni datos de rendimiento frente a alternativas.

## Limitaciones y advertencias

- Es una preview explícita: el autor advierte de que los pesos, la disposición de ficheros y el manifiesto cambiarán entre versiones.
- Solo soporta inglés; no hay capacidades multilingües declaradas.
- El repositorio no incluye código ni datos de entrenamiento, solo pesos exportados y vocabulario; no se puede reproducir el entrenamiento con la información disponible.
- No se han publicado benchmarks ni evaluaciones de sesgo o alucinación en la información disponible.
- La licencia CC BY 4.0 permite uso comercial con atribución, pero exige mantener la atribución a Mostlime12195 y el texto de licencia.
- El contexto efectivo y los parámetros de decodificación dependen del manifiesto y de la aplicación cliente; no se especifican en la información disponible.
- Al ser un modelo de corrección sobre candidatos, su uso fuera de ese dominio (generación libre de texto) no está validado.

## Enlaces

- Hugging Face: https://huggingface.co/MostLime/keylime-m2-preview
- Manifiesto: https://autocorrect.mostlime.hackclub.app/autocorrect-android/manifest.json
- Repositorio de modelos (copia del manifiesto en release `models-v1`): https://github.com/Mostlime12195/keylime-models
- Descarga de ficheros: https://huggingface.co/MostLime/keylime-m2-preview/resolve/main/<file>
