# skillsafeai/sdxs-512-dreamshaper-onnx-webgpu

## Resumen

`skillsafeai/sdxs-512-dreamshaper-onnx-webgpu` es una exportación a ONNX del modelo de difusión `IDKiro/sdxs-512-dreamshaper`, preparada para ejecutarse en el navegador mediante `onnxruntime-web` sobre WebGPU. No es un modelo nuevo: los pesos no se han reentrenado ni modificado, solo se han convertido a grafos ONNX en fp16 (con entradas y salidas en float32) a partir del commit `76f720262bb051da75666b22c902a78c8e16c763` del repositorio original. El resultado son tres ficheros autocontenidos —text encoder CLIP ViT-L/14, UNet y decodificador TAESD— que suman unos 880 MB.

Se trata de un modelo de difusión latente destilado a un único paso, derivado a su vez de DreamShaper 8 de Lykon. La propuesta de valor es la latencia: al no requerir clasifier-free guidance ni cadenas de 20-30 pasos, genera una imagen de 512x512 px en aproximadamente 0,5-0,7 s en Chrome sobre Apple silicon tras construir la sesión (unos 5 s). Eso lo sitúa en el nicho de la generación de imágenes 100 % en cliente, sin backend, lo que elimina costes de servidor y evita enviar los prompts a terceros.

El interés actual del modelo es de nicho pero claro: demuestra que un pipeline de difusión completo puede caber en la memoria de un navegador y ejecutarse en tiempo interactivo con WebGPU, usando únicamente operadores estándar de `ai.onnx` (opset 17) y sin datos externos. La contrapartida es que hereda todas las limitaciones del SDXS original (resolución fija de 512x512, un solo paso, control limitado del prompt) y las restricciones de la licencia Open RAIL++.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Difusion latente de un solo paso: UNet + text encoder CLIP ViT-L/14 + decodificador TAESD |
| Parametros totales | No disponible (el autor no los declara; el tamano de los grafos sugiere una UNet de la familia SD 1.5, sin cifra oficial) |
| Longitud de contexto | 77 tokens (limite de la entrada `input_ids` int64 [1,77] del text encoder) |
| Tipos de cuantizacion | fp16 (unica variante distribuida, con IO en float32); no hay versiones int8, int4 ni GGUF |
| Idiomas soportados | No declarado. El text encoder CLIP ViT-L/14 esta entrenado mayoritariamente en ingles |
| Licencia | CreativeML Open RAIL++-M (etiqueta `openrail++`) |
| Formato de pesos | ONNX, opset 17, un fichero por componente y sin datos externos |
| Resolucion de salida | 512 x 512 px, lote 1 |
| Pasos de muestreo | 1 (sin guidance / CFG) |
| Componentes | `text_encoder.onnx` (246 MB), `unet.onnx` (632 MB), `vae_decoder.onnx` (2,5 MB) |
| Tamano del repositorio | ~0,9 GB |
| Pipeline declarado | text-to-image |
| Modelo base | `IDKiro/sdxs-512-dreamshaper` (commit `76f720262bb051da75666b22c902a78c8e16c763`) |
| Fecha de creacion (metadatos) | 2026-09-23 |

## Arquitectura y entrenamiento

La arquitectura es una difusión latente clasica en el espacio de un VAE: la UNet opera sobre latentes de forma [1,4,64,64], el prompt se codifica con un text encoder CLIP ViT-L/14 que produce `last_hidden_state` de forma [1,77,768] (fp16 en el interior, float32 en la interfaz), y la decodificación final la realiza un TAESD, un autoencoder destilado muy ligero (2,5 MB) desarrollado por madebyollin bajo licencia MIT. Los tres grafos usan exclusivamente operadores estandar de `ai.onnx`, opset 17, en un unico fichero cada uno y sin pesos en ficheros externos, lo que simplifica el despliegue en el navegador.

No ha habido entrenamiento ni ajuste alguno por parte de `skillsafeai`: la model card indica explicitamente que solo se ha realizado la exportación. El modelo fuente, SDXS-512-DreamShaper, es una destilación a un paso de DreamShaper 8 (que a su vez deriva de Stable Diffusion 1.5). El muestreo es determinista dado el ruido inicial y sigue una integración de Euler con espaciado final desde `sigma_max`:

```
sigma = 14.614646911621094
x     = randn(1,4,64,64) * sigma
eps   = unet(x / sqrt(sigma^2 + 1), t = 999, text_encoder(clip_tokens(prompt)))
x0    = x - sigma * eps
img   = vae_decoder(x0) / 2 + 0.5
```

La validación de la exportación se hizo comparando contra el `StableDiffusionPipeline` de diffusers (fp32, un paso, guidance 0) con ruido idéntico en tres prompts, obteniendo PSNR de 41,8 / 50,4 / 47,9 dB. No se proporciona información sobre el dataset de entrenamiento del modelo original ni sobre el uso de RLHF/DPO, que en cualquier caso no aplican a un modelo de difusión de este tipo.

## Capacidades

- Generacion de imagenes a partir de texto (text-to-image) a 512x512 px, lote 1, en un unico paso de difusion.
- Ejecucion integra en el navegador mediante WebGPU y `onnxruntime-web`, sin proceso servidor.
- Resultado reproducible: dado un tensor de ruido inicial fijo, la salida es determinista.
- Interoperabilidad con el ecosistema ONNX: los grafos usan solo operadores estandar (opset 17), por lo que son portables a otros runtimes ONNX.
- No dispone de tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento de agente (es un generador de imagenes, no un modelo de lenguaje).
- No tiene modo thinking, ni entrada de imagen (no hay img2img, inpainting ni ControlNet), ni audio, ni vision.
- No admite prompts negativos de forma efectiva: al operar con guidance 0 no hay escala CFG que contrapese la condicion negativa.
- Cobertura multilingue no declarada; funcionalmente limitada al idioma para el que CLIP ViT-L/14 tiene mejor representacion, el ingles.

## Casos de uso

- Generacion de imagenes en cliente puro: una web o PWA puede generar ilustraciones sin enviar el prompt a ningun servidor, lo que resulta adecuado para aplicaciones con requisitos de privacidad o para evitar costes de GPU en backend.
- Demos interactivas y sandboxes de prompting: la latencia de 0,5-0,7 s por imagen en Chrome permite bucles de prueba y error casi inmediatos, utile para ensenar como funciona la difusion o para comparar prompts en vivo.
- Previsualizacion en herramientas de diseno: generar miniaturas o bocetos a 512x512 de forma instantanea dentro del propio editor, antes de recurrir a un modelo de mayor calidad para el render final.
- Generacion de borradores a escala: producir grandes volumenes de candidatos a baja resolucion y filtrar por criterios heuristicos o por un clasificador, reservando el upscaling y el refinado para las pocas imagenes seleccionadas.
- Arte generativo y juguetes creativos: instalaciones, visualizadores de ruido o aplicaciones de tipo "semilla aleatoria" donde la velocidad importa mas que la fidelidad del resultado.
- Aplicaciones sin conexion: una vez cacheado el repositorio (~0,9 GB), el modelo no necesita red, lo que habilita uso en entornos offline, kioscos o dispositivos desconectados.
- Generacion en el borde (edge): portatiles con GPU integrada moderna o Apple silicon pueden ejecutarlo sin acelerador dedicado, lo que abre la puerta a herramientas de escritorio o extensiones de navegador.
- Prototipado rapido en investigacion: sirve como referencia ligera para comparar pipelines de difusion destilados sin montar infraestructura GPU.

## Benchmarks y rendimiento

| Metrica | Valor | Condiciones |
|---|---|---|
| PSNR frente a diffusers fp32 (1 paso, guidance 0) | 41,8 dB / 50,4 dB / 47,9 dB | Tres prompts, mismo ruido inicial, comparacion con `StableDiffusionPipeline` |
| Latencia por imagen | ~0,5-0,7 s | Chrome, WebGPU, Apple silicon, tras construir la sesion |
| Tiempo de construccion de sesion | ~5 s | Mismo entorno |
| Throughput | No disponible | El autor no publica imagenes por segundo ni resultados con lote > 1 |
| MMLU / HumanEval / GSM8K | No aplica | No es un modelo de lenguaje |

No se han publicado otros resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Peso en disco: unos 880 MB de pesos ONNX (246 MB + 632 MB + 2,5 MB); el repositorio completo ocupa ~0,9 GB.
- VRAM estimada: aproximadamente 1-2 GB de VRAM o memoria unificada para lote 1 a 512x512 con pesos fp16. Es una estimacion derivada del tamano de los ficheros, no una cifra publicada por el autor.
- GPU recomendadas: el autor valida Chrome sobre Apple silicon. Cualquier GPU con soporte WebGPU (Apple M-series, NVIDIA GTX/RTX recientes, AMD RDNA, Intel Arc, integradas modernas) deberia ser suficiente. Modelos como A100 o H100 no aportan ventaja: el destino es el cliente y el grafo es pequeno.
- Cabe en GPU de consumo: si, con margen amplio. Tambien en GPU integrada y en memoria unificada.
- Opciones de despliegue: `onnxruntime-web` con WebGPU es el unico destino declarado y validado. vLLM, llama.cpp, Ollama y TGI no son aplicables (estan orientados a modelos de lenguaje y no cargan este grafo). ONNX Runtime nativo (Python o C++, con CUDA, DirectML o CoreML) es tecnicamente viable al tratarse de ONNX estandar, pero no esta validado por el autor.
- Latencia: ~0,5-0,7 s por imagen mas ~5 s de construccion de sesion (una sola vez por sesion). Throughput no declarado.

## Comparativa con modelos similares

| Modelo | Parametros | Resolucion | Pasos | Licencia | Formato y destino |
|---|---|---|---|---|---|
| `skillsafeai/sdxs-512-dreamshaper-onnx-webgpu` | No disponible (~880 MB en 3 ficheros ONNX) | 512x512 | 1 | CreativeML Open RAIL++-M | ONNX fp16, onnxruntime-web y WebGPU |
| `IDKiro/sdxs-512-dreamshaper` (modelo base) | No disponible | 512x512 | 1 | CreativeML Open RAIL++-M | safetensors y diffusers, GPU |
| DreamShaper 8 (Lykon) | Aprox. 1,0 B (UNet SD 1.5 + CLIP ViT-L/14) | 512-768 | 20-30 | CreativeML Open RAIL-M | safetensors, GPU |
| SDXL-Turbo (Stability AI) | Aprox. 3,5 B | 512x512 | 1-4 | Licencia de investigacion no comercial de Stability AI | safetensors, GPU |

Las cifras de parametros de las alternativas son valores publicos aproximados de esos modelos, no mediciones realizadas sobre esta exportacion. Frente al modelo base, la diferencia relevante es el formato y el destino de ejecucion, no la calidad de generacion. Frente a DreamShaper 8, gana en latencia (1 paso por 20-30) pero pierde en fidelidad al prompt y en control. Frente a SDXL-Turbo, es mucho mas ligero y ejecutable en cliente, aunque con menor calidad de imagen y resolucion fija mas baja.

## Limitaciones y advertencias

- Sesgos heredados: al derivar de DreamShaper 8 y, en ultima instancia, de Stable Diffusion 1.5, arrastra los sesgos de representacion de su dataset de entrenamiento (sesgo hacia personas blancas y occidentales, estereotipos de genero y profesion, etc.).
- Alucinacion visual: es previsible la aparicion de artefactos en manos, extremidades, texto y anatomias complejas, agravada por el decodificador TAESD de baja capacidad frente a un VAE completo.
- Control del prompt limitado: con un solo paso y guidance 0, los detalles finos del prompt influyen menos y no hay prompts negativos efectivos. Prompts largos se truncan a 77 tokens.
- Resolucion fija: unicamente 512x512 y lote 1 segun los grafos publicados; no hay soporte declarado para otras resoluciones ni batch.
- Idiomas: no declarado; el rendimiento sera notablemente mejor en ingles que en castellano u otras lenguas.
- Restricciones de licencia: se aplican los terminos CreativeML Open RAIL++-M del modelo fuente, con restricciones de uso que alcanzan tambien a las salidas generadas (nada de contenido que explote o perjudique a menores, imagenes no consentidas de personas reales, difamacion, acoso ni usos ilegales). Conviene revisar los textos completos de la licencia antes de un uso comercial.
- Madurez del repositorio: 0 descargas y 0 likes en el momento de la consulta, autor sin historial verificado y fecha de publicacion en los metadatos posterior a la consulta. No hay garantia de mantenimiento ni de correccion de errores.
- Entorno de ejecucion: el soporte de WebGPU varia segun navegador, version y plataforma, por lo que el rendimiento declarado (Chrome sobre Apple silicon) no es extrapolable sin pruebas al resto de combinaciones.
- Verificacion: la validacion se limita a tres prompts y a una metrica PSNR frente a una implementacion fp32 de referencia; no sustituye a una evaluacion de calidad perceptiva a gran escala.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/skillsafeai/sdxs-512-dreamshaper-onnx-webgpu
- Modelo base (SDXS-512-DreamShaper): https://huggingface.co/IDKiro/sdxs-512-dreamshaper
- Repositorio del decodificador TAESD (madebyollin): https://huggingface.co/madebyollin/taesd
- DreamShaper (Lykon), origen de la destilacion: https://huggingface.co/Lykon/DreamShaper

No se han encontrado otros enlaces (papers, blogs, demos o repositorios) en la informacion disponible.
