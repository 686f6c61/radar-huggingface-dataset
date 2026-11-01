# abid1010/qairt-runtime-2.50.0

## Resumen

El repositorio `abid1010/qairt-runtime-2.50.0` no contiene un modelo de lenguaje, sino un conjunto de librerías binarias del Qualcomm AI Runtime (QAIRT) 2.50.0.260828, redistribuidas sin modificar para su uso en una aplicación Android de traducción de ASR (reconocimiento automático del habla). El contenido son ficheros `.so` propietarios de Qualcomm que implementan el backend QNN (Qualcomm Neural Network) sobre el Hexagon Tensor Processor (HTP) de las SoC Snapdragon.

El propósito es permitir que una app Android descargue únicamente los binarios correspondientes a su generación de Hexagon: V79 (Snapdragon 8 Elite, SM8750), V75 (Snapdragon 8 Gen 3, SM8650) y V73 (Snapdragon 8 Gen 2, SM8550). La versión coincide con la que Qualcomm AI Hub utilizó para compilar los binarios de contexto NPU de la aplicación, de modo que el runtime del dispositivo sea ABI-compatible con los grafos precompilados.

Por tanto, esta ficha describe un artefacto de infraestructura de inferencia en dispositivo, no un modelo entrenado. No hay pesos, tokenizador, arquitectura de red ni datos de entrenamiento asociados. Es relevante para desarrolladores que despliegan modelos (por ejemplo, de ASR o traducción) sobre NPU Hexagon en Android y necesitan empaquetar el runtime correcto para cada generación de chip.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No aplicable (runtime de inferencia QNN para Hexagon HTP) |
| Parametros totales | No disponible (no es un modelo) |
| Parametros activos | No disponible (no es un modelo) |
| Longitud de contexto | No disponible (no es un modelo) |
| Tipos de cuantizacion | No disponible en la informacion proporcionada (el runtime QNN soporta cuantizacion de grafos compilados, pero no se detalla) |
| Idiomas soportados | No disponible |
| Licencia | `qualcomm-ai-runtime` (licencia propietaria de Qualcomm; etiquetada como `other` en HuggingFace) |
| Formato de pesos | No aplicable; se distribuyen librerias compartidas `.so` (ELF) |

## Arquitectura y entrenamiento

No existe arquitectura de red neuronal ni proceso de entrenamiento: el repositorio aloja exclusivamente bibliotecas nativas de Qualcomm. Los ficheros incluidos son `libQnnHtp.so` (3978976 bytes), `libQnnSystem.so` (4068024 bytes), los stubs `libQnnHtpV73Stub.so`, `libQnnHtpV75Stub.so` y `libQnnHtpV79Stub.so` (791424 bytes cada uno) y los skeletons `libQnnHtpV73Skel.so` (12375248 bytes), `libQnnHtpV75Skel.so` (12358868 bytes) y `libQnnHtpV79Skel.so` (12559528 bytes).

Técnicamente, QNN es la API de inferencia de Qualcomm que permite ejecutar grafos compilados (context binaries) sobre distintos aceleradores: CPU, GPU Adreno y NPU Hexagon (HTP). Los ficheros `Skel` son los que se cargan en el subsistema Hexagon (DSP/NPU) y los `Stub` los que residen en el lado ARM para comunicarse con él. El autor indica que la versión 2.50.0.260828 es la misma que Qualcomm AI Hub empleó para compilar los binarios de contexto NPU de la app, lo que garantiza compatibilidad entre el runtime y los grafos.

## Capacidades

- Ejecución de grafos de inferencia compilados para QNN sobre Hexagon HTP en Android.
- Soporte de tres generaciones de Hexagon: V73, V75 y V79.
- Carga selectiva por generación de chip, de modo que el dispositivo descarga solo los binarios que necesita.
- Integración con el ecosistema Qualcomm AI Hub para modelos precompilados.
- No incluye capacidades de generación de texto, visión, audio ni tool calling por sí mismo; estas dependerían del modelo que se ejecute sobre el runtime.
- El tag `asr-translation` indica el caso de uso previsto por la app que lo redistribuye, no una capacidad intrínseca del artefacto.

## Casos de uso

- Despliegue de ASR en Android: empaquetar `libQnnHtp*.so` junto con un modelo de reconocimiento de voz compilado para HTP, de modo que la transcripción se ejecute en la NPU y libere CPU/GPU.
- Traducción en dispositivo: ejecutar un modelo de traducción neuronal sobre Hexagon para evitar enviar audio o texto a la nube, reduciendo latencia y preservando privacidad.
- Descarga selectiva por dispositivo: la app detecta la generación de Snapdragon (SM8750, SM8650, SM8550) y descarga solo el stub y el skel correspondientes, minimizando el tamaño de la actualización.
- Compatibilidad con Qualcomm AI Hub: usar la misma versión de runtime que la empleada para compilar los context binaries evita desajustes ABI entre grafo y runtime.
- Prototipado de pipelines de audio en Android: servir como capa de ejecución para modelos de VAD, diarización o traducción de voz sobre NPU.
- Distribución controlada en apps empresariales: al ser binarios propietarios, se puede integrar en una app que respete los términos de licencia de Qualcomm AI Runtime SDK.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- SoC compatible: Snapdragon 8 Elite (SM8750, Hexagon V79), Snapdragon 8 Gen 3 (SM8650, V75) y Snapdragon 8 Gen 2 (SM8550, V73).
- No aplica VRAM de GPU de escritorio; el runtime se ejecuta sobre memoria compartida y el subsistema Hexagon del SoC móvil.
- No cabe ni está pensado para GPUs de escritorio (A100, H100, RTX 4090); es exclusivamente Android/ARM con Hexagon.
- Despliegue mediante empaquetado de las `.so` en el APK o descarga dinámica en la app, cargadas con `System.loadLibrary` o `dlopen`.
- Latencia y throughput: no disponibles en la información proporcionada; dependerán del modelo compilado y de la generación de Hexagon.

## Comparativa con modelos similares

| Artefacto | Tipo | Plataforma | Licencia | Disponibilidad |
|---|---|---|---|---|
| qairt-runtime-2.50.0 (este repo) | Runtime QNN para Hexagon | Android / Snapdragon | Propietaria Qualcomm | HuggingFace (redistribución) |
| Qualcomm AI Runtime SDK oficial | SDK completo de runtime | Android / Snapdragon | Propietaria Qualcomm | Software Center de Qualcomm |
| LiteRT (antes TensorFlow Lite) | Runtime de inferencia | Android, Linux, otros | Apache 2.0 | Google / GitHub |
| ONNX Runtime Mobile | Runtime de inferencia | Android, iOS, Linux | MIT | GitHub / Microsoft |

La comparación es de infraestructura de ejecución, no de modelos. No se dispone de datos de rendimiento comparativo en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo: no genera texto, no traduce ni transcribe por sí mismo; solo ejecuta grafos compilados.
- Licencia propietaria `qualcomm-ai-runtime`: el uso está sujeto a los términos de Qualcomm AI Runtime SDK; la redistribución debe respetar dichos términos.
- Compatibilidad estricta de versión: los context binaries deben haberse compilado con la misma versión de QAIRT (2.50.0.260828) para evitar fallos ABI.
- Solo cubre Hexagon V73, V75 y V79; dispositivos con otras generaciones no están soportados por estos binarios.
- Repositorio sin descargas ni likes y con tamaño de 0.0 GB reportado, lo que sugiere que el contenido puede no estar correctamente subido o indexado; conviene verificar la integridad con los SHA-256 de la model card.
- Los binarios son específicos de Android/ARM64; no son portables a otras plataformas.
- No hay información sobre sesgos, alucinación o idiomas porque el artefacto no es un modelo lingüístico.

## Enlaces

- HuggingFace: https://huggingface.co/abid1010/qairt-runtime-2.50.0
- Qualcomm AI Runtime SDK (descarga oficial): https://softwarecenter.qualcomm.com/api/download/software/sdks/Qualcomm_AI_Runtime_Community/All/2.50.0.260828/v2.50.0.260828.zip
- Qualcomm AI Hub: no disponible en la información proporcionada
