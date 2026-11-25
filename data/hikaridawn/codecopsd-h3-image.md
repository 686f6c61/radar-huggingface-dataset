# HikariDawn/CodecOPSD-H3-Image

## Resumen

CodecOPSD-H3-Image es un adaptador LoRA para el modelo de generacion de imagen MiniMax-H3-Image, desarrollado por HikariDawn (el repositorio de codigo asociado pertenece a Kiteretsu77). Su objetivo no es cambiar el estilo ni el contenido de las imagenes generadas, sino reducir el coste computacional de la generacion reference-to-image: los generadores secuenciales como MiniMax-H3-Image anaden cada imagen de referencia a la secuencia de tokens de entrada, de modo que el coste crece rapidamente con el numero de referencias. CodecOPSD aplica una poda de tokens de condicion mediante un codec de video y entrena un LoRA sobre los tokens conservados con auto-destilacion on-policy.

El resultado declarado por los autores es una reduccion de aproximadamente el 65 % de los tokens de referencia en MiniMax-H3-Image, con un proceso de denoising unas 2 veces mas rapido y una calidad practicamente sin cambios. En la variante para video (MiniMax-H3 Ref2VA) la reduccion media es del 70 % de tokens de condicion y 1,87x de aceleracion, llegando hasta 8,4x con mas condiciones.

El adaptador es relevante porque ataca un cuello de botella de inferencia concreto (longitud de secuencia de condicion) en lugar de proponer un modelo nuevo, y lo hace de forma agnostica al generador subyacente: los autores anuncian variantes para Cosmos 3 Nano, Qwen-Image 2.1 y FLUX 3 Image Klein. El repositorio tiene un tamano de 3,0 GB y una adopcion todavia muy baja (4 descargas, 1 like en el momento de la consulta).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre el transformer de difusion de MiniMax-H3-Image, con modulo de poda de tokens de condicion basado en codec de video delante del transformer |
| Parametros totales | no disponible (el LoRA se distribuye como pesos FP32 de 2,6 GB; el modelo base no se incluye) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (depende de la longitud de secuencia de tokens del modelo base MiniMax-H3-Image) |
| Tipos de cuantizacion | Los pesos LoRA se publican en FP32; el text encoder del pipeline puede cargarse en FP8 (`text_encoder_fp8="fp8"`). No se documentan otras cuantizaciones del adaptador |
| Idiomas soportados | en (ingles) |
| Licencia | MiniMax-H3-Image Community License Agreement (licencia "other" en Hugging Face); es una obra derivada del modelo base |
| Formato de pesos | safetensors (`codecopsd_minimax_h3_image.safetensors`), mas `config.json`, `LICENSE` y `NOTICE` |

## Arquitectura y entrenamiento

CodecOPSD no modifica la arquitectura del generador: MiniMax-H3-Image sigue siendo un transformer de difusion para generacion reference-to-image. La innovacion se situa en la entrada del pipeline. Un codec de video comprime y poda los tokens de condicion asociados a las imagenes de referencia antes de que entren al transformer, de modo que la secuencia de atencion se acorta de forma sustancial. Sobre los tokens que se conservan se entrena un LoRA de rango y alpha 128 (2,6 GB en FP32) mediante auto-destilacion on-policy: el modelo adaptado aprende a reproducir el comportamiento del modelo original completo usando solo la informacion de condicion podada, lo que evita el colapso de calidad que produciria una poda naive.

El pipeline se implementa como un `DiffusionPipeline` de diffusers sobre los modulos propios de MiniMax-H3 (`MiniMaxH3ImageCodecOPSDPipeline`), con el modulo de poda por codec situado delante del transformer. Los autores no detallan en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset de destilacion ni si se empleo RLHF o DPO; la model card se centra en el metodo de poda y en los resultados de aceleracion. La innovacion tecnica destacable es, por tanto, la combinacion de poda de tokens guiada por codec con destilacion on-policy sobre los tokens supervivientes, aplicada de forma reutilizable a distintos generadores secuenciales.

## Capacidades

- Generacion de imagen reference-to-image: compone una salida a partir de varias imagenes de referencia indicadas en el prompt mediante marcadores como `<Picture 1>` y `<Picture 2>`.
- Aceleracion de la inferencia: reduce aproximadamente el 65 % de los tokens de referencia en MiniMax-H3-Image y acelera el denoising cerca de 2x, segun los autores.
- Mantenimiento de la calidad: el entrenamiento por destilacion busca preservar la fidelidad al modelo base con la condicion podada.
- Integracion con diffusers: se carga como LoRA de condicion sobre el pipeline oficial (`load_condition_lora`).
- Compatibilidad con text encoder en FP8 y con `enable_model_cpu_offload()` para reducir requisitos de VRAM.
- No soporta tool calling, function calling ni razonamiento multi-paso: es un modelo generativo de imagen, no un LLM.
- Capacidades multilingues limitadas: la model card declara unicamente ingles.
- No incluye vision por comprension, audio ni modo "thinking".

## Casos de uso

- Composicion de producto con referencias multiples: el usuario aporta una foto del producto y una del entorno, y el modelo genera una escena combinada; la poda de tokens reduce el coste cuando se encadenan varias referencias.
- Prototipado de interiores y decoracion: a partir de una imagen de una lampara y otra de un escritorio, generar variantes de la escena con el prompt "Put the lamp <Picture 1> on the desk in <Picture 2>", como en el ejemplo oficial.
- Generacion por lotes en produccion: al acelerar el denoising cerca de 2x, permite aumentar el throughput de un servicio de generacion de imagen sin cambiar el modelo base ni reentrenar.
- Edicion e imagen-a-imagen con control por referencia: usar el pipeline `image-to-image` para transformar una imagen existente guiandose por referencias adicionales de estilo o contenido.
- Investigacion en eficiencia de difusion: sirve como punto de partida reproducible para estudiar poda de tokens de condicion y destilacion on-policy sobre otros generadores (los autores anuncian variantes para Cosmos 3 Nano, Qwen-Image 2.1 y FLUX 3 Image Klein).
- Despliegue en hardware limitado: con `enable_model_cpu_offload()` y text encoder en FP8, el adaptador permite ejecutar el pipeline en GPUs con menos VRAM de la que exigiria el modelo completo con todas las referencias sin podar.
- Demos interactivas: el repositorio incluye una demo Gradio (`python app.py ref2image`) para validar la generacion reference-to-image con el LoRA cargado.

## Benchmarks y rendimiento

Los autores no publican en la informacion disponible una tabla de benchmarks estandar (MMLU, HumanEval, GSM8K u otros), que ademas no aplican a un modelo de generacion de imagen. Los unicos datos cuantitativos aportados son de eficiencia:

| Metrica | MiniMax-H3-Image (CodecOPSD) | MiniMax-H3 Ref2VA (CodecOPSD) |
|---|---|---|
| Reduccion de tokens de condicion | ~65 % de los tokens de referencia | ~70 % de media |
| Aceleracion del denoising | ~2x | 1,87x de media; hasta 8,4x con mas condiciones |
| Calidad | practicamente sin cambios (segun los autores) | practicamente sin cambios (segun los autores) |

No se han publicado resultados de benchmarks de calidad objetiva (FID, CLIP score, evaluaciones humanas) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita. El adaptador LoRA ocupa 2,6 GB en FP32, pero el consumo dominante corresponde al modelo base MiniMax-H3-Image y al text encoder, que no se incluyen en el repositorio.
- El pipeline oficial recomienda `enable_model_cpu_offload()` y permite cargar el text encoder en FP8, lo que reduce la VRAM necesaria frente a una carga completa en precision nativa.
- GPU recomendadas: no disponible. No se especifican modelos concretos (A100, H100, RTX 4090, etc.) en la informacion proporcionada.
- Ajuste en GPU de consumo: no disponible; depende del modelo base, no del LoRA.
- Opciones de despliegue: pipeline de diffusers mediante el paquete `codecopsd` (`MiniMaxH3ImageCodecOPSDPipeline`) y demo Gradio (`app.py ref2image`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: se declara una aceleracion de aproximadamente 2x en el denoising para MiniMax-H3-Image; no se aportan valores absolutos de latencia ni de imagenes por segundo.

## Comparativa con modelos similares

| Modelo | Tipo | Funcion | Aceleracion declarada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CodecOPSD-H3-Image | LoRA + poda de tokens por codec | Reference-to-image sobre MiniMax-H3-Image | ~2x en denoising, ~65 % menos tokens | MiniMax-H3-Image Community License | Publicado en Hugging Face |
| MiniMax-H3-Image (base) | Transformer de difusion | Reference-to-image sin poda | Referencia (1x) | MiniMax-H3-Image Community License | Publicado por MiniMaxAI |
| CodecOPSD-H3-Ref2VA | LoRA + poda de tokens por codec | Reference-to-video sobre MiniMax-H3 Ref2VA | 1,87x media, hasta 8,4x | Licencia del modelo base | Publicado en Hugging Face |
| CodecOPSD sobre Qwen-Image 2.1 / FLUX 3 Image Klein / Cosmos 3 Nano | LoRA + poda de tokens por codec | Generacion de imagen/video | no disponible | no disponible | Anunciado, "coming soon" |

No se dispone de datos de rendimiento de calidad comparables entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- La licencia es la MiniMax-H3-Image Community License Agreement, no una licencia open source permisiva; es obligatorio revisar sus terminos y conservar el aviso `NOTICE` para uso comercial o redistribucion.
- Al ser una obra derivada de MiniMax-H3-Image, hereda las restricciones del modelo base; el uso comercial esta sujeto a dicha licencia.
- Solo se declara soporte de ingles; el comportamiento con prompts en otros idiomas no esta documentado.
- La poda de tokens puede degradar la fidelidad en casos con referencias muy detalladas o con muchas referencias simultaneas; los autores afirman calidad "practicamente sin cambios", pero no se aportan metricas objetivas de calidad.
- Riesgo de alucinacion visual: como todo modelo generativo de imagen, puede inventar detalles no presentes en las referencias; la poda agresiva de condicion podria aumentar este riesgo en escenarios limite.
- Adopcion muy baja (4 descargas, 1 like) y publicacion reciente: no hay validacion independiente del metodo ni de los pesos.
- Requiere instalar el codigo de CodecOPSD y descargar el modelo base por separado; el repositorio solo contiene el adaptador (3,0 GB) y no es autosuficiente.
- No se documentan sesgos especificos; al depender del modelo base, hereda los sesgos de sus datos de entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/HikariDawn/CodecOPSD-H3-Image
- Repositorio de codigo: https://github.com/Kiteretsu77/CodecOPSD
- Pagina del proyecto: https://kiteretsu77.github.io/CodecOPSD_website/
- Galeria de ejemplos: https://kiteretsu77.github.io/CodecOPSD_website/#gallery-h3img
- Paper (arXiv): https://arxiv.org/abs/2611.31184
- Demo en Hugging Face Spaces: https://huggingface.co/spaces/HikariDawn/CodecOPSD-H3-Image
- Coleccion de modelos: https://huggingface.co/collections/HikariDawn/codecopsdopsd-6b04b49f98f5b4b68c5f7f9a
- Variante para video (Ref2VA): https://huggingface.co/HikariDawn/CodecOPSD-H3-Ref2VA
- Modelo base MiniMax-H3-Image: https://huggingface.co/MiniMaxAI/MiniMax-H3-Image
- Licencia del modelo base: https://huggingface.co/MiniMaxAI/MiniMax-H3-Image/blob/492fd8c4eca666f1085f57e30738c1e0d86b3439/LICENSE
