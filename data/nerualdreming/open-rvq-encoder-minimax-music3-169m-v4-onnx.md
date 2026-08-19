# nerualdreming/open-rvq-encoder-minimax-music3-169m-v4-onnx

## Resumen

El modelo `open-rvq-encoder-minimax-music3-169m-v4-onnx` es una exportación a ONNX del encoder RVQ (Residual Vector Quantizer) reconstruido por la comunidad para el modelo MiniMax Music 3. MiniMax Music 3 genera música a partir de descripciones y letras, pero fue publicado sin el encoder que convierte audio en los códigos que el modelo utiliza internamente. Este repositorio aporta esa pieza faltante: un encoder de 169 millones de parámetros que transforma latents de audio (procedentes de un codec neuronal DAC-VAE) en ocho códigos por frame, permitiendo así continuar, reemplazar secciones o re-renderizar una pista existente sin regenerar la canción completa.

El modelo se distribuye en formato ONNX (676 MB en f32), lo que permite ejecutarlo sin Python ni PyTorch, únicamente con ONNX Runtime. Ha sido verificado contra la referencia PyTorch original, con los ocho códigos por frame idénticos en cada prueba. Es una reconstrucción comunitaria basada en los pesos de `SimpleTuner/open-rvq-encoder-minimax-music3-169m-v4`, y está pensado para integrarse en herramientas como MiniMax Music3 Studio. La licencia es Apache-2.0, lo que permite uso comercial y modificación.

La arquitectura, extraída directamente del checkpoint, incluye una capa convolucional inicial (kernel 7, 128→1088), tres bloques residuales con dilaciones 1/3/9, pooling al grid de 25 Hz, ocho capas transformer (17 cabezas, d_model 1088, escala de atención muP 8.0), una cabeza semántica sobre 16384 entradas y un decodificador de profundidad de dos capas (d=512) que produce los siete códigos acústicos de forma codiciosa. No se dispone de información sobre el entrenamiento del modelo original (datos, tokens, método de optimización), ya que se trata de una reconstrucción y no de un entrenamiento nuevo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Encoder RVQ con transformer (8 capas, 17 cabezas, d_model 1088), convolución inicial, bloques residuales y decodificador de profundidad |
| Parámetros totales | 169M |
| Parámetros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible (el modelo procesa latents de audio a 86.13 Hz; no hay una longitud de contexto explícita) |
| Tipos de cuantización | f32 (exportación ONNX original) |
| Idiomas soportados | no disponible (no es un modelo de texto) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (safetensors no, es ONNX) |

## Arquitectura y entrenamiento

El modelo es un encoder de audio con arquitectura híbrida: una etapa de convolución (kernel 7, 128→1088) seguida de tres bloques residuales con dilaciones 1, 3 y 9, que operan sobre latents de audio a una resolución temporal de 86.13 Hz. Posteriormente se aplica un pooling hacia el grid de 25 Hz (el mismo que usa el modelo generativo de MiniMax Music 3). Sobre este grid actúa un stack de ocho capas transformer con 17 cabezas de atención y d_model 1088, utilizando una escala de atención muP (8.0) para estabilizar el entrenamiento. La salida de la cabeza semántica produce un código de 16384 entradas por frame, y un decodificador de profundidad de dos capas (d=512) genera los siete códigos acústicos restantes en una cadena codiciosa.

No se dispone de información sobre los datos de entrenamiento, el número de tokens (frames de audio), ni sobre el uso de técnicas como RLHF o DPO. El checkpoint original fue reconstruido por la comunidad a partir de análisis del modelo MiniMax Music 3, y los pesos publicados en `SimpleTuner/open-rvq-encoder-minimax-music3-169m-v4` son la referencia. Este repositorio solo exporta esos pesos a ONNX, sin modificar la arquitectura ni los parámetros.

## Capacidades

- Convierte latents de audio (DAC-VAE, 128 canales a 86.13 Hz) en códigos RVQ de 8 valores por frame (1 código semántico de 16384 entradas + 7 acústicos de 1024).
- Permite **continuación de pista**: dada una porción inicial de audio, genera los códigos para el resto de la canción sin modificar la parte ya existente.
- Permite **reemplazo de secciones**: se puede regenerar solo un segmento (por ejemplo, el estribillo) manteniendo el resto intacto.
- Permite **escritura de introducciones**: añadir una sección inicial a una pieza ya existente.
- Permite **re-renderización**: volver a sintetizar una misma canción con una interpretación distinta a través del modelo generativo.
- No es un modelo de referencia de estilo ni de voz; la identidad sonora se decide en el modelo de lenguaje upstream, no en este encoder.
- No tiene capacidades de texto, visión ni tool calling; es un componente de audio puro.

## Casos de uso

- **Edición de música en producción**: un productor puede tomar una pista ya grabada y usar este encoder para pasarla al modelo MiniMax Music 3, reemplazar solo el puente o la estrofa y obtener el resto intacto, ahorrando horas de regeneración.
- **Generación de variaciones**: a partir de una misma pista de referencia, se pueden obtener diferentes interpretaciones o arreglos (re-renderización) pasando los códigos de audio al modelo generativo con distintos parámetros de control.
- **Continuación de demos**: si un músico tiene una idea de 40 segundos, puede extenderla a una canción completa manteniendo el inicio exacto, lo que es útil en flujos de trabajo de composición rápida.
- **Inpainting de secciones defectuosas**: en una grabación, si una parte tiene ruido o errores, se puede regenerar únicamente esa sección mediante el encoder y el modelo de música, sin afectar al resto.
- **Herramientas de edición de audio en la nube**: al ser ONNX, el encoder puede desplegarse en un servidor sin Python, permitiendo a aplicaciones web o móviles ofrecer edición de música basada en IA con latencia reducida.
- **Investigación en codificación de audio**: sirve como referencia para estudiar cómo el modelo MiniMax Music 3 discretiza el audio, o como base para entrenar otros modelos de codificación musical.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni métricas de calidad de audio (como FAD, CLAP, etc.) para este modelo. La única verificación documentada es que los códigos de salida son idénticos a los de la referencia PyTorch en pruebas de entrada aleatoria.

## Requisitos de hardware

- Tamaño del modelo: 676 MB en f32 (169M parámetros). La VRAM estimada para inferencia es de aproximadamente 1 GB si se carga en GPU, pero no hay datos oficiales.
- El formato ONNX permite ejecución en CPU y GPU, dependiendo de la latencia deseada. Para uso en tiempo real, se recomienda una GPU moderna (por ejemplo, RTX 3060 o superior), aunque no se ha validado.
- Al ser un modelo pequeño (169M), cabe en cualquier GPU de consumo actual (GTX 1060 6GB, RTX 3060 12GB, etc.) sin problemas.
- Opciones de despliegue: ONNX Runtime (C++, Python, etc.), puede integrarse en aplicaciones como MiniMax Music Studio (escrito en C++). También es posible usarlo en entornos de inferencia como TensorRT si se convierte a formato TensorRT.
- Latencia y throughput estimados: no disponibles, pero al tener solo 8 capas transformer y una entrada de latents, la inferencia es muy rápida (del orden de milisegundos por frame en GPU, decenas de milisegundos en CPU).

## Comparativa con modelos similares

No se dispone de modelos directamente comparables, ya que este encoder es un componente específico para MiniMax Music 3. No hay otros encoders RVQ públicos que se integren con ese modelo generativo. Se podría comparar con otros codecs de audio (EnCodec, DAC, etc.), pero no son equivalentes en función ni en formato de salida. Por tanto, se indica que la comparativa no está disponible.

## Limitaciones y advertencias

- Es una reconstrucción comunitaria, no un modelo publicado por MiniMax. Aunque se ha verificado la igualdad de códigos contra la referencia, no hay garantía de que funcione exactamente igual en todos los casos ni de que sea el encoder oficial.
- No es un modelo de referencia de estilo o voz. El encoder solo convierte audio en códigos; la identidad sonora se decide en el modelo de lenguaje upstream, por lo que no se puede usar para imitar a un artista concreto.
- Requiere que la entrada sea latents DAC-VAE a 86.13 Hz. El proceso de codificación de audio a latents no está incluido en este modelo; necesita el componente `neural-codec` de MiniMax Music3 Studio.
- La salida depende del modelo generativo de MiniMax Music 3, que no se incluye en este repositorio. El encoder por sí solo no genera audio.
- No se dispone de información sobre el entrenamiento del modelo original, por lo que no se puede evaluar la calidad de la codificación en términos de fidelidad o artefactos.
- Licencia Apache-2.0 permite uso comercial, pero se debe atribuir correctamente la fuente de los pesos y el trabajo de reconstrucción de la comunidad.

## Enlaces

- [HuggingFace - open-rvq-encoder-minimax-music3-169m-v4-onnx](https://huggingface.co/nerualdreming/open-rvq-encoder-minimax-music3-169m-v4-onnx)
- [HuggingFace - SimpleTuner/open-rvq-encoder-minimax-music3-169m-v4 (pesos fuente)](https://huggingface.co/SimpleTuner/open-rvq-encoder-minimax-music3-169m-v4)
- [HuggingFace - MiniMaxAI/MiniMax-Music3 (modelo original)](https://huggingface.co/MiniMaxAI/MiniMax-Music3)
- [GitHub - MiniMax Music3 Studio](https://github.com/timoncool/MiniMax-Music3-Studio)
- [GitHub - MiniMax-AI/MiniMax-M3 (modelo multimodal)](https://github.com/MiniMax-AI/MiniMax-M3)
- [MiniMax](https://www.minimax.io/)
