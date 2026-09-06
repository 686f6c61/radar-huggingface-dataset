# JustACluelessKidAtSchool/magenta-rt-2-qad-onnx

## Resumen

El modelo `JustACluelessKidAtSchool/magenta-rt-2-qad-onnx` es una adaptación cuantizada en formato ONNX del sistema de generación musical en tiempo real Magenta RT 2. Desarrollado por el usuario JustACluelessKidAtSchool, su objetivo es permitir la síntesis de música neural de forma 100 % client-side en navegadores modernos mediante WebGPU y WASM SIMD, sin necesidad de servidor. El problema que resuelve es la generación de audio musical latente baja, con estilos predefinidos, en aplicaciones web interactivas y emisoras continuas.

La arquitectura combina un modelo generador tipo Depthformer con 12 codebooks de Residual Vector Quantizer (RVQ) y un vocoder neuronal SpectroStream. El generador tiene 35,7 millones de parámetros activos y el vocoder 35,6 millones, ambos cuantizados a INT8. El sistema genera 12 códigos acústicos jerárquicos causalmente por cada frame de 40 ms, con una latencia de aproximadamente 39 ms en CPU y 12 ms en WebGPU. La salida es audio PCM estéreo a 48 kHz. El modelo se distribuye con un archivo de embeddings de estilo de 768 dimensiones para nueve géneros musicales y se integra en dos aplicaciones web de demostración: un estudio de jam interactivo y una radio de ambient continuo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Depthformer (6 capas temporales, 2 capas de profundidad) con 12 codebooks RVQ + vocoder SpectroStream |
| Parametros totales | Generador: 35,7 M activos; vocoder: 35,6 M (total aproximado: 71,3 M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (modelo de audio; genera por frames de 40 ms) |
| Tipos de cuantizacion | INT8 (archivos ONNX con sufijo `_int8`) |
| Idiomas soportados | No disponible (modelo de audio/música) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

La arquitectura se compone de dos módulos ONNX. El primero, `authentic_student_generator_int8.onnx`, es un modelo generador tipo Depthformer desenrollado con 6 capas temporales y 2 capas de profundidad. Produce 12 códigos acústicos jerárquicos mediante un cuantizador residual vectorial (RVQ) de forma causal, condicionado por embeddings de estilo de 768 dimensiones tipo MusicCoCa y vectores MIDI de acordes y notas de 128 elementos. El segundo módulo, `authentic_spectrostream_decoder_int8.onnx`, es un vocoder neuronal completo de 35,6 millones de parámetros que convierte esos 12 códigos RVQ en audio PCM estéreo de 48 kHz mediante expansión de frames convolucional, síntesis armónica y solapamiento-suma de IDFT implementado con operaciones MatMul nativas de WebGPU/WASM.

No se proporciona información sobre el proceso de entrenamiento: número de tokens, composición del dataset, técnicas de alineación como RLHF o DPO, ni detalles sobre la destilación acústica mencionada en el nombre (Quantized Acoustic Distillation). Solo se indica que los pesos están cuantizados a INT8, lo que reduce el tamaño y permite la ejecución en tiempo real en dispositivos de consumo.

## Capacidades

- Generación de música en tiempo real (audio-to-audio) en el navegador, sin backend.
- Producción de 12 códigos acústicos RVQ jerárquicos de forma causal por cada frame de 40 ms.
- Condicionamiento por embeddings de estilo de 768 dimensiones y vectores MIDI de acordes/notas de 128 elementos.
- Síntesis de audio PCM estéreo a 48 kHz mediante el vocoder SpectroStream.
- Estilos predefinidos en `style_embeddings.json`: Lo-Fi, Chill-Hop, Smooth Jazz, Synthwave, Deep Ambient, Classical, Rock, Funk y Cinematic.
- Ejecución en WebGPU y WASM SIMD, con caché en IndexedDB (`CascadeOfflineMusicDB`) para funcionamiento offline permanente.
- No soporta tool calling, function calling, razonamiento multi-paso ni tareas de lenguaje natural, al tratarse de un modelo de audio.

## Casos de uso

- Radio de ambient continuo en la web: la aplicación `focus_radio.html` genera un flujo infinito de música adaptativa con mezclador de paisajes sonoros, ideal para emisoras personalizadas que se ejecutan íntegramente en el navegador.
- Estudio de jam interactivo: `music_studio.html` permite al usuario manipular una superficie latente de estilos y dirigir la composición mediante teclado, aprovechando la baja latencia de WebGPU para una respuesta en tiempo real.
- Bandas sonoras adaptativas para videojuegos o experiencias web: el modelo puede generar música que cambia según el contexto emocional o el input del usuario, gracias a los embeddings de estilo y al control por MIDI.
- Generación de música en aplicaciones offline: al cachear los modelos en IndexedDB, una PWA puede ofrecer música generativa sin conexión, sin necesidad de servidor ni de conexión a Internet.
- Demostraciones interactivas de IA musical en conferencias o talleres: los archivos ONNX son pequeños (~106 MB en total) y se cargan directamente desde un CDN, lo que facilita su integración en demos de una sola página.
- Prototipos de investigación en síntesis neuronal en tiempo real: el modelo permite experimentar con representaciones latentes RVQ y condicionamiento por estilo en el navegador, sin infraestructura especializada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no especificada. El modelo está diseñado para ejecutarse en el navegador mediante WebGPU, por lo que la memoria gráfica utilizada depende del dispositivo del usuario.
- GPU recomendadas: no aplica de forma explícita; cualquier dispositivo con WebGPU compatible puede ejecutar el modelo, aunque el rendimiento variará.
- Compatibilidad con GPU de consumo: sí, los modelos son pequeños (~106 MB en total) y están pensados para ejecutarse en dispositivos con GPU integrada o dedicada de gama media.
- Opciones de despliegue: navegador (WebGPU/WASM), ONNX Runtime Web, o servidor con ONNX Runtime si se desea ejecución fuera del navegador.
- Latencia estimada: generación de un frame de 40 ms en aproximadamente 39 ms en CPU y 12 ms en WebGPU, según la model card.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la información proporcionada. El modelo es una adaptación ONNX de `google/magenta-realtime-2`, pero no hay información suficiente para realizar una comparativa cuantitativa. En cualquier caso, se trata de un modelo de audio generativo con un enfoque específico en ejecución en navegador y cuantización INT8, lo que lo diferencia de alternativas como MusicGen o MusicLM, para las cuales no se han publicado datos comparativos en esta ficha.

## Limitaciones y advertencias

- No se ha publicado información sobre sesgos, alucinaciones o evaluación de calidad musical; el modelo no ha sido validado externamente.
- El repositorio no tiene descargas ni likes, lo que indica una adopción nula por parte de la comunidad y una posible falta de verificación.
- Depende de tecnologías web relativamente recientes: WebGPU y WASM SIMD, lo que limita la compatibilidad con navegadores antiguos o entornos sin soporte.
- No soporta tareas de lenguaje, tool calling ni agentes; es exclusivamente un modelo de generación de audio.
- La licencia Apache-2.0 permite uso comercial, pero el nombre "Magenta RT 2" y las marcas asociadas pueden estar sujetas a restricciones de trademark.
- No se proporcionan detalles sobre los datos de entrenamiento ni sobre la robustez del modelo ante distintos géneros musicales fuera de los nueve estilos predefinidos.
- El tamaño del repositorio es de 0,1 GB, pero no se incluyen instrucciones de uso ni documentación técnica adicional más allá de la model card.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/JustACluelessKidAtSchool/magenta-rt-2-qad-onnx
- Modelo generador: https://huggingface.co/JustACluelessKidAtSchool/magenta-rt-2-qad-onnx/resolve/main/authentic_student_generator_int8.onnx
- Vocoder: https://huggingface.co/JustACluelessKidAtSchool/magenta-rt-2-qad-onnx/resolve/main/authentic_spectrostream_decoder_int8.onnx
- Embeddings de estilo: https://huggingface.co/JustACluelessKidAtSchool/magenta-rt-2-qad-onnx/resolve/main/style_embeddings.json
- Modelo original de referencia: https://huggingface.co/google/magenta-realtime-2
