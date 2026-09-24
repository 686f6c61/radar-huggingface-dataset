# skillsafeai/kokoro-82m-onnx-webgpu-nostft

## Resumen

Este repositorio contiene una conversión a ONNX en fp32 del modelo de síntesis de voz Kokoro-82M, publicada por el usuario skillsafeai, en la que el grafo se ha cortado justo antes de la iSTFT final (en el nodo `decoder.generator.conv_post`). No es un modelo reentrenado: los pesos son idénticos a los de `onnx-community/Kokoro-82M-v1.0-ONNX` en la revisión `1939ad2a`, que a su vez deriva del modelo original `hexgrad/Kokoro-82M`. El objetivo es poder ejecutar el modelo en el navegador con onnxruntime-web 1.27 y el backend WebGPU.

El problema que resuelve es concreto y está documentado por el autor: en onnxruntime-web 1.27 sobre WebGPU, la cola iSTFT del grafo completo (ConvTranspose/ScatterND) devuelve ceros para toda muestra posterior a 65.528 (aproximadamente 2,7 s a 24 kHz). Eso obligaba a sintetizar frases muy cortas, lo que aplanaba audiblemente la prosodia. Al cortar el grafo, el modelo devuelve el espectro de magnitud y fase (`spec_phase`, forma [1, 22, frames]) y la iSTFT se ejecuta en el código del llamador.

La relevancia práctica es que permite TTS local en el cliente, sin servidor y sin GPU dedicada, siempre que el desarrollador implemente la reconstrucción iSTFT (n_fft 20, hop 5) con la base inversa de 22x20 incluida en el repositorio. La equivalencia numérica con el grafo completo es de 6e-7 de error máximo absoluto en CPU. La licencia es Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo neuronal de síntesis de voz (text-to-speech) derivado de Kokoro-82M; decodificador con etapa iSTFT (n_fft 20, hop 5, base inversa 22x20). El README no detalla el resto de la topología interna |
| Parametros totales | 82 M (según el nombre del modelo base Kokoro-82M; no hay recuento desglosado en la información disponible) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica como contexto de LLM. Entrada `input_ids` int64 [1, n] (fonemas) y salida `spec_phase` float32 [1, 22, frames]. Límite práctico observado en el grafo completo bajo onnxruntime-web 1.27/WebGPU: 65.528 muestras de audio (≈2,7 s a 24 kHz) |
| Tipos de cuantizacion | fp32 (esta conversión no aplica cuantización; los pesos son los de origen en fp32) |
| Idiomas soportados | No disponible en la información proporcionada; depende de las voces del modelo base hexgrad/Kokoro-82M, que este repo no documenta |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`model.onnx`, fp32) más `istft_basis.json` (base inversa 22x20) |
| Entradas | `input_ids` int64 [1, n], `style` float32 [1, 256], `speed` float32 [1] |
| Salida | `spec_phase` float32 [1, 22, frames] (magnitud y fase previas a la iSTFT) |
| Frecuencia de muestreo | 24 kHz (deducida del README: 2,7 s equivalen a 65.528 muestras) |
| Tamaño del repositorio | 0,3 GB |
| Autor | skillsafeai |
| Modelo base | hexgrad/Kokoro-82M |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

No hay entrenamiento nuevo en este repositorio. Se trata de una reexportación quirúrgica: se parte del `onnx/model.onnx` en fp32 de `onnx-community/Kokoro-82M-v1.0-ONNX` (revisión `1939ad2a`) y se corta el grafo en `decoder.generator.conv_post`. Los pesos no se modifican. La consecuencia es que el modelo deja de emitir una forma de onda y pasa a emitir `spec_phase`, un tensor [1, 22, frames] con las 11 primeras filas correspondientes a log-magnitud y las 11 restantes a una componente sinusoidal de fase.

La reconstrucción de audio queda en manos del llamador y sigue este procedimiento documentado por el autor: `mag = exp(x[0:11])`, `ph = sin(x[11:22])`, concatenación de `mag*cos(ph)` y `mag*sin(ph)` para formar una matriz 22 x F, `conv_transpose1d` con la base [22, 1, 20] y stride 5, normalización `y[1:20] /= window_sum[1:20]` (tal como se exportó, solo se normaliza la primera ventana) y recorte final de amplitud `waveform = 4 * y[10:-10]`. La validación declarada es que el resultado coincide con la forma de onda del grafo completo dentro de 6e-7 de error máximo absoluto en CPU.

No se dispone de información sobre el dataset de entrenamiento del modelo original, el número de tokens, la composición de los datos ni sobre etapas de alineación como RLHF o DPO. Tampoco se documenta la innovación técnica interna de Kokoro-82M más allá del corte del grafo y del comportamiento anómalo del backend WebGPU.

## Capacidades

- Síntesis de voz (text-to-speech) a partir de secuencias de fonemas (`input_ids`), no de texto en crudo.
- Control de identidad de voz mediante un vector de estilo de 256 dimensiones (`style` float32 [1, 256]).
- Control de velocidad de habla mediante el parámetro `speed` float32 [1].
- Emisión de espectro de magnitud y fase reconstruible a forma de onda de 24 kHz mediante iSTFT ejecutada en el llamador.
- Inferencia íntegra en el navegador con onnxruntime-web y WebGPU, sin backend ni GPU de servidor.
- Funcionamiento potencialmente offline tras la carga inicial del modelo (0,3 GB) si se cachea en el cliente.
- No soporta tool calling ni function calling: no es un modelo de lenguaje.
- No soporta razonamiento multi-paso ni uso como agente.
- Soporte multilingüe: no disponible en la información; depende de las voces del modelo base.
- No se documentan capacidades de visión ni de audio de entrada (no es un modelo multimodal).

## Casos de uso

- Lectura de artículos y documentos en el navegador: el modelo se ejecuta en el cliente con WebGPU y evita enviar el texto a un servidor. Requiere trocear el texto en segmentos compatibles con el iSTFT del llamador y concatenar el audio resultante.
- Accesibilidad web y lectores de pantalla: permite integrar voz sintética en una página o PWA sin coste de servidor, con control de velocidad para usuarios que necesitan reproducción más lenta o más rápida.
- Asistentes conversacionales en el navegador: al devolver espectro en lugar de onda, se pueden encadenar ventanas y emitir audio de forma casi continua, útil para respuestas cortas de un chatbot local.
- Aprendizaje de idiomas: el parámetro `speed` permite reproducir una misma frase a distintas velocidades para practicar pronunciación, y el vector de estilo permite alternar voces si el modelo base las aporta.
- Aplicaciones PWA sin conexión: tras la primera descarga de 0,3 GB, el modelo puede quedar en caché del navegador y generar voz sin red, útil en entornos con conectividad limitada.
- Demos y prototipos de TTS: al pesar menos que un modelo grande y no requerir infraestructura, es adecuado para validar interfaces de voz rápidamente antes de pasar a un despliegue en servidor.
- Audiolibros o narración de textos largos: exige un motor de fonemización propio y una estrategia de segmentación con solape, porque el límite de 65.528 muestras del grafo completo ya no aplica pero el llamador debe gestionar la longitud de cada bloque.
- Narración dinámica en videojuegos o aplicaciones interactivas: el control de `speed` y `style` en tiempo de ejecución permite modular la locución sin reentrenar ni recargar el modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

El único dato cuantitativo de validación aportado por el autor es la fidelidad numérica del corte del grafo frente al grafo completo:

| Métrica | Valor | Entorno |
|---|---|---|
| Error máximo absoluto vs. forma de onda del grafo completo | 6e-7 | CPU |
| Muestras devueltas como cero por el grafo completo a partir de | 65.528 (≈2,7 s a 24 kHz) | onnxruntime-web 1.27, WebGPU |
| Error de reconstrucción del grafo cortado en esa cola | No aplica (la iSTFT se ejecuta fuera) | onnxruntime-web 1.27, WebGPU |

## Requisitos de hardware

- Tamaño de pesos: 82 M de parámetros en fp32, aproximadamente 330 MB de pesos, coherente con el repositorio de 0,3 GB.
- VRAM estimada: los pesos en fp32 ocupan unos 330 MB; con activaciones y buffers de la iSTFT en JavaScript el consumo real depende del navegador y del tamaño de cada bloque. No hay cifras medidas publicadas.
- GPU recomendadas: cualquier GPU con soporte WebGPU operativo en el navegador. Al ser un modelo de 82 M de parámetros, no requiere GPU de datacenter; es viable en GPUs integradas modernas y en tarjetas de consumo tipo RTX 4090 o inferiores.
- Cabe en GPU de consumo: sí, con amplio margen, e incluso en muchos portátiles sin GPU dedicada siempre que el navegador exponga WebGPU.
- Opciones de despliegue: onnxruntime-web 1.27 (o superior) con backend WebGPU. También es posible cargar `model.onnx` con otros runtimes compatibles ONNX, pero en ese caso hay que reimplementar la iSTFT y la carga de `istft_basis.json`.
- Latencia y throughput estimados: no disponible. No se aportan mediciones de tiempo por bloque ni de tiempo real alcanzado.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Incluye iSTFT | Licencia | Entorno de ejecucion |
|---|---|---|---|---|---|
| skillsafeai/kokoro-82m-onnx-webgpu-nostft | 82 M | ONNX fp32 (grafo cortado) | No, la ejecuta el llamador | Apache-2.0 | onnxruntime-web con WebGPU, iSTFT en el cliente |
| onnx-community/Kokoro-82M-v1.0-ONNX | 82 M | ONNX (fp32 y variantes) | Sí, grafo completo | Apache-2.0 (según modelo base) | onnxruntime, onnxruntime-web; afectado por el retorno de ceros en ORT-web 1.27 WebGPU |
| hexgrad/Kokoro-82M | 82 M | PyTorch, safetensors | Sí | Apache-2.0 | PyTorch en servidor o escritorio |
| Otros TTS ONNX para navegador | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- El grafo está cortado: el modelo no produce forma de onda. Si no se implementa correctamente la iSTFT (n_fft 20, hop 5, base 22x20, stride 5, normalización y recorte) el resultado son artefactos o silencio.
- El bug de onnxruntime-web 1.27 WebGPU no se corrige aquí, solo se elude: el grafo completo sigue devolviendo ceros a partir de 65.528 muestras. Cualquier actualización del runtime que cambie el comportamiento de ConvTranspose/ScatterND debe revalidarse.
- La normalización de ventana es asimétrica tal como se exportó: solo se normaliza la primera ventana (`y[1:20] /= window_sum[1:20]`). Reproducirla de otra forma altera la señal.
- El factor de amplitud 4 y el recorte `y[10:-10]` forman parte del posprocesado obligatorio; omitirlos desajusta el nivel y los bordes del audio.
- No incluye fonemización: `input_ids` son fonemas, por lo que hace falta un pipeline G2P externo (el del modelo base) y sus dependencias.
- Idiomas soportados: no disponible. Si el despliegue necesita varios idiomas, hay que verificar las voces del modelo base.
- Sesgos conocidos: no disponible. Al ser un modelo TTS, los sesgos se manifestarían en pronunciación, prosodia o calidad por variedad dialectal, no en contenido factual.
- Riesgo de alucinación de contenido: no aplica en el sentido habitual, pero sí existe riesgo de pronunciación incorrecta y de prosodia plana si se segmenta en bloques demasiado cortos.
- Licencia: Apache-2.0 permite uso comercial. Conviene verificar la licencia del modelo base `hexgrad/Kokoro-82M`, que el README también declara Apache-2.0.
- El repositorio registra 0 descargas y 0 likes, y su fecha de creación indicada en los metadatos es 2026-09-24, posterior a la fecha de consulta habitual; conviene tratarlo como una publicación sin validación de la comunidad.
- No hay benchmarks publicados ni mediciones de latencia o throughput, por lo que cualquier decisión de producción exige una validación propia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/skillsafeai/kokoro-82m-onnx-webgpu-nostft
- Modelo base: https://huggingface.co/hexgrad/Kokoro-82M
- Conversión ONNX de referencia: https://huggingface.co/onnx-community/Kokoro-82M-v1.0-ONNX
- Papers, blogs, repositorios o demos adicionales: no disponible en la información proporcionada.
