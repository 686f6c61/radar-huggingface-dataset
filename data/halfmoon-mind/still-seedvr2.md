# halfmoon-mind/still-seedvr2

## Resumen

Still-seedvr2 es una conversión a Core ML de SeedVR2-3B, un diffusion transformer (DiT) de un solo paso para restauración de vídeo e imagen desarrollado por ByteDance Seed. El modelo original sintetiza detalle en fotogramas degradados mediante un proceso de difusión adversarial de un único paso, y esta versión lo empaqueta como ML Programs ejecutables en iOS 18 y macOS sobre Apple Silicon, con pesos del DiT cuantizados a 4 bits en bloques de 32 y el VAE en FP16. El repositorio lo publica el usuario halfmoon-mind como parte de la app iOS *Still (한컷)*, donde se descarga bajo demanda desde un menú de desarrollador.

La relevancia de esta ficha es doble. Por un lado, demuestra que un modelo de restauración de 3.000 millones de parámetros puede ejecutarse en un iPhone 14 Pro (A16) en unos 8,7 segundos por fotograma de 512 × 512, con un pico de memoria de 0,6 GiB para una captura de cuatro teselas. Por otro, expone con detalle los compromisos técnicos de la conversión: reescritura de la atención como productos matriciales, precomputación de constantes del paso de difusión, división del DiT en siete trozos y sustitución de los upsamplers del decodificador por convoluciones transpuestas equivalentes para evitar operaciones en CPU.

No es un modelo de propósito general ni un LLM: es un componente de superresolución y restauración de imagen fija, con una interfaz estricta de una sola resolución de salida (512 × 512) y sin soporte de texto, audio ni tool calling. La licencia Apache 2.0 del modelo base se mantiene, y el autor documenta explícitamente las modificaciones conforme a la sección 4(b) de dicha licencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion transformer (DiT) de un solo paso con VAE encoder/decoder; conversión a Core ML ML Program |
| Parametros totales | 3B (modelo base SeedVR2-3B); desglose por componente no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica; entrada fija de 512 × 512 px (latente [4096, 16]) |
| Tipos de cuantizacion | DiT: 4 bits lineal en bloques de 32 pesos; VAE: FP16; entradas/salidas: float16 |
| Idiomas soportados | no disponible (modelo de imagen, sin entrada de texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | Core ML `.mlpackage` (ML Program, iOS 18+); `manifest.json` con SHA-256; repo de 2,8 GB |
| Modelo base | ByteDance-Seed/SeedVR2-3B |
| Pipeline | image-to-image |
| Hardware objetivo | Apple Neural Engine y GPU (A16, A18, M4 y posteriores) |

## Arquitectura y entrenamiento

El modelo base es SeedVR2, un diffusion transformer de un solo paso entrenado con post-entrenamiento adversarial para restauración de vídeo, descrito en el paper arXiv:2506.05301. La inferencia se organiza en tres etapas: un encoder VAE que comprime el fotograma de baja calidad (previamente escalado por interpolación bilineal a 512 × 512) en un latente de forma [4096, 16]; un DiT de 32 bloques que aplica un único paso de Euler (x0 = ruido − v); y un decoder VAE que reconstruye la imagen. En esta conversión, los índices de ventana y las posiciones rotatorias se fijan como constantes para esa resolución, y se precomputan el embedding de timestep para t = 1000, el embedding de condicionamiento textual positivo (pos_emb.pt tras txt_in) y el ruido con semilla 42.

La conversión introduce varias modificaciones numéricas relevantes. RMSNorm divide cada token por su magnitud máxima antes de elevar al cuadrado, porque el flujo de texto alcanza 28.640 y x² desborda FP16. La modulación de timestep se emite como broadcast en lugar de repetirse por token, y la atención se reescribe como productos matriciales más softmax; en FP32, los trozos resultantes igualan el forward original con una diferencia máxima de 0. El DiT se divide en siete chunks (bloques 0–2, 3–5, 6–8, 9–14, 15–20, 21–26 y 27–31), y el último aplica el paso de Euler. Los tres upsamplers del decoder se reformulan como convoluciones transpuestas 2 × 2 con stride 2 que incorporan los pesos de la convolución 1 × 1 original, evitando que Core ML genere reshapes de hasta 16.777.216 dimensiones que se ejecutaban en CPU entre segmentos del Neural Engine. La cuantización a 4 bits se realizó con coremltools 9.0; en un fotograma de prueba, la imagen decodificada queda a 34,5 dB de la del modelo FP32, y la salida en iPhone 14 Pro a 56 dB de la del Mac.

## Capacidades

- Restauración y superresolución de imagen fija: sintetiza detalle en fotogramas degradados y devuelve una salida de 512 × 512 px.
- Procesamiento por teselas: la app divide áreas mayores en teselas de 512 px con solapamiento de 64 px y costura cruzada de 32 px en el centro del solapamiento.
- Restauración de vídeo en el modelo original (un paso por fotograma); esta conversión está fijada a un único fotograma de 512 × 512.
- Ejecución en dispositivo: encoder y decoder en el Neural Engine, DiT en la GPU, sin dependencia de servidores.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, texto, audio ni diálogo multilingüe.
- No acepta prompts de texto en tiempo de inferencia: el condicionamiento textual está precomputado y fijado en los pesos.

## Casos de uso

- Restauración de fotos antiguas o de baja resolución en iOS: la app *Still* descarga el paquete bajo demanda y restaura capturas teselando la imagen; encaja por su ejecución local y su pico de 0,6 GiB en cuatro teselas.
- Mejora de fotogramas extraídos de vídeo: al ser una conversión de un modelo de restauración de vídeo, cada fotograma puede procesarse de forma independiente para recuperar detalle en grabaciones comprimidas.
- Preprocesado para pipelines de visión por computador: aumentar la calidad aparente de imágenes antes de tareas de detección o segmentación, asumiendo que el detalle añadido es una predicción y no evidencia capturada.
- Prototipado de restauración en macOS sobre Apple Silicon: los ML Programs se ejecutan también en el Neural Engine de un M4, con 0,12 s por fotograma en el encoder tras la primera compilación, lo que permite iterar sin GPU dedicada.
- Aplicaciones de archivo y patrimonio digital: recuperación de material escaneado o digitalizado a baja resolución, con la advertencia de que el resultado no debe tratarse como prueba documental del detalle original.
- Investigación sobre cuantización extrema en dispositivos: el repositorio documenta el impacto de 4 bits en bloques de 32 (34,5 dB frente a FP32), útil como referencia para estudiar la viabilidad de DiT de 3B en móvil.
- Demos educativas de difusión de un solo paso: la separación en siete chunks y la precomputación de constantes facilitan explicar el coste real de un paso de difusión en hardware móvil.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor únicamente reporta métricas de latencia y memoria en dispositivo:

| Medicion (iPhone 14 Pro, A16, iOS 18.4, segunda ejecucion) | Carga | Ejecucion por fotograma |
|---|---:|---:|
| Encoder (Neural Engine) | 0,3 s | 1,7 s |
| DiT, siete chunks (GPU) | 2,8 s | 5,0 s |
| Decoder (Neural Engine) | 0,1 s | 2,0 s |

- Memoria: una captura de cuatro teselas alcanzó un pico de 0,6 GiB para toda la app; la revisión anterior del decoder retenía 1,4 GB y elevaba el pico a 1,8 GiB.
- Fidelidad numérica: 34,5 dB entre la salida decodificada cuantizada a 4 bits y la del modelo FP32 en un fotograma de prueba; 56 dB entre la salida del iPhone 14 Pro y la del Mac.
- Encoder en Apple Silicon más reciente: 0,07 s de carga tras la primera compilación y 0,12 s por fotograma en un M4; no medido en iPhone 14 Pro con la revisión actual.

## Comparativa con modelos similares

| Modelo | Parametros | Enfoque | Resolucion de salida | Licencia | Ejecucion en dispositivo |
|---|---|---|---|---|---|
| still-seedvr2 (esta ficha) | 3B (DiT cuantizado a 4 bits) | Difusion de un paso, Core ML | 512 × 512 fija | Apache 2.0 | Si (A16, A18, M4) |
| ByteDance-Seed/SeedVR2-3B | 3B | Difusion de un paso, PyTorch | no disponible | Apache 2.0 | No (requiere GPU) |
| numz/SeedVR2_comfyUI | 3B (repackaging FP16) | Difusion de un paso, ComfyUI | no disponible | Apache 2.0 | No (GPU de escritorio) |

No se dispone de datos de benchmarks que permitan comparar la calidad de restauración frente a alternativas de la misma categoría; la comparativa se limita a parametros, formato y plataforma de ejecución.

## Limitaciones y advertencias

- El detalle restaurado es una predicción, no evidencia del detalle capturado; no debe usarse como prueba forense o documental del contenido original.
- Resolución de salida fija de 512 × 512 px; las imágenes mayores requieren teselado con solapamiento de 64 px y costura de 32 px, lo que puede introducir artefactos en las uniones.
- El condicionamiento textual está precomputado y fijado; no es posible guiar la restauración con prompts en tiempo de inferencia.
- El DiT debe ejecutarse en GPU (`.cpuAndGPU`): el Neural Engine del A16 con iOS 18 calcula incorrectamente estos pesos comprimidos. FP16 y el VAE sí funcionan en el Neural Engine.
- El encoder de la revisión anterior no compilaba para el Neural Engine de un M4 ni de un A18 (`ANECCompile() FAILED`); la revisión actual corrige el problema, pero no se ha medido en iPhone 14 Pro.
- La cuantización a 4 bits introduce una diferencia de 34,5 dB respecto a FP32; en aplicaciones sensibles a la fidelidad radiométrica conviene validar la salida.
- No hay información sobre sesgos del modelo base ni sobre su comportamiento en dominios distintos al fotográfico.
- La licencia Apache 2.0 permite uso comercial, pero el autor documenta las modificaciones conforme a la sección 4(b); deben conservarse los avisos correspondientes.
- El repositorio tiene 188 descargas y 0 likes, lo que indica una validación comunitaria muy limitada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/halfmoon-mind/still-seedvr2
- Modelo base: https://huggingface.co/ByteDance-Seed/SeedVR2-3B
- Paper SeedVR2: https://arxiv.org/abs/2506.05301
- Codigo oficial: https://github.com/ByteDance-Seed/SeedVR
- Repackaging FP16 de referencia: https://huggingface.co/numz/SeedVR2_comfyUI (revision `09ced71023636e9bc8cdf9cdecfb2625d1e691e8`)
