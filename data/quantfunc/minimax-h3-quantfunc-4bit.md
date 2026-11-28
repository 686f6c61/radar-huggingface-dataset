# QuantFunc/Minimax-H3-Quantfunc-4bit

## Resumen

MiniMax-H3-QuantFunc-4bit es una version cuantizada a 4 bits (INT4) del modelo MiniMax-H3 de MiniMaxAI, un modelo generativo multimodal de video y audio. La cuantizacion la desarrolla QuantFunc, un proyecto independiente que aplica la tecnica SVDQuant para reducir la precision de los pesos del transformer principal de 16 bits a 4 bits, logrando una compresion de 4x con una calidad que el autor situa en torno a 23,7 dB de PSNR frente al baseline BF16 en su evaluacion interna FL2VA.

El modelo resuelve el problema del coste de inferencia y de memoria de un modelo de generacion de video de gran tamano. Al reducir el peso de los checkpoints a aproximadamente 12 GB, permite ejecutar generacion texto-a-video, imagen-a-video y audio-video en GPUs de consumo de las familias RTX 20, 30, 40 y 50, ademas de GPUs profesionales como T4, A10, A40, L4, L40 y RTX 6000 Ada / PRO 6000 Blackwell. El repositorio ocupa 48,7 GB e incluye varias variantes de pesos (FL2VA y Ref2VA, en versiones destiladas y base).

Es relevante porque demuestra que la generacion de video con audio nativo puede salir del entorno de datacenter y acercarse a flujos de trabajo locales en ComfyUI. El modelo se distribuye bajo la licencia comunitaria minimax-h3-community-license y se integra mediante la libreria diffusers con la pipeline MiniMaxH3Pipeline, ademas de un loader propio de QuantFunc.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion para generacion de video y audio (custom_minimax_h3), con modulos Token Refiner y Refiner cuantizados |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT4 (SVDQuant) en pesos principales, INT8 en el Conv Sidecar |
| Idiomas soportados | no disponible |
| Licencia | minimax-h3-community-license |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base MiniMax-H3 es un sistema de difusion para generacion conjunta de video y audio. Esta version no reentrena el modelo, sino que aplica cuantizacion post-entrenamiento con SVDQuant: descompone los pesos y los representa en INT4 con un sidecar convolucional en INT8 que corrige el error de cuantizacion. Los checkpoints incluyen de serie el INT4 Token Refiner, el INT4 Refiner y el INT8 Conv Sidecar, de modo que no hay que adjuntar subcomponentes cuantizados adicionales.

Se ofrecen dos familias de pesos. La variante FL2VA (texto-a-video con control de primer y ultimo fotograma) y la variante Ref2VA (referencia multimodal de imagen, video y audio). Cada familia tiene una version destilada con rango SVDQuant r128 y LoRA de aceleracion integrada (4 pasos para FL2VA, 8 pasos para Ref2VA) y una version base con rango r64 y sin LoRA integrada, pensada para sampling multi-paso nativo o para acoplar LoRAs personalizadas sin conflictos de doble LoRA. No se detallan en la informacion disponible el numero de tokens de entrenamiento ni la composicion del dataset original.

## Capacidades

- Generacion de video a partir de texto (text-to-video) con audio nativo sincronizado.
- Generacion de video a partir de imagen (image-to-video) y control de primer y ultimo fotograma en la variante FL2VA.
- Generacion con referencias multimodales de imagen, video y audio en la variante Ref2VA.
- Generacion conjunta de video y audio (audio-video-generation) en una sola pasada.
- Sampling acelerado: 4 pasos en FL2VA destilado y 8 pasos en Ref2VA destilado.
- Compatibilidad con LoRAs de aceleracion y personalizadas en las variantes base r64.
- Integracion con ComfyUI mediante el nodo QuantFunc y con Python mediante el SDK Quantfunc.
- Ejecucion en GPUs NVIDIA SM75, SM86, SM89 y SM120 (RTX 20/30/40/50, T4, A10, A40, L4, L40, RTX 6000 Ada, PRO 6000 Blackwell).

## Casos de uso

- Generacion de clips publicitarios cortos: con 124 fotogramas a 24 FPS y unos 5 segundos por clip, el modelo permite producir piezas de video con audio para redes sociales en una estacion de trabajo con RTX 4090, sin depender de APIs externas.
- Previsualizacion de storyboards animados: la variante FL2VA con control de primer y ultimo fotograma permite convertir bocetos en secuencias animadas coherentes para validar una idea antes de la produccion final.
- Prototipado de videojuegos y cinemáticas: la generacion de video con audio integrado acelera la creacion de cinemáticas de prueba o material de referencia para equipos de arte.
- Postproduccion y edicion asistida: la variante Ref2VA acepta referencias de imagen, video y audio, lo que facilita mantener el estilo visual y la continuidad de personajes entre planos.
- Investigacion en generacion multimodal: al ser una version cuantizada ejecutable en GPUs de consumo, sirve para experimentar con difusion de video y audio sin acceso a clusters de A100/H100.
- Flujos de trabajo en ComfyUI: al sustituir solo el loader por el nodo QuantFunc, los estudios pueden integrar el modelo en pipelines existentes de generacion de imagen y video sin rehacer los grafos.
- Demos y herramientas educativas: la reduccion de VRAM y el aumento de velocidad (hasta 3,19x frente a FP8 por paso) hacen viable ejecutar demostraciones interactivas en hardware asequible.

## Benchmarks y rendimiento

| Metrica | Resultado | Contexto |
|---|---|---|
| PSNR frente a BF16 (FL2VA, mismo prompt y semilla) | ~23,7 dB | Evaluacion interna de QuantFunc |
| Tiempo por paso, RTX 4090, 768x768, 124 fotogramas | 3,2 s | QuantFunc INT4 |
| Tiempo por paso, mismo setup | 8,5 s | INT8 ConvRot (2,66x mas lento) |
| Tiempo por paso, mismo setup | 10,2 s | FP8 (3,19x mas lento) |

Los tiempos por paso se refieren solo a la inferencia del modelo principal y excluyen el codificador de texto, el VAE, el procesamiento de audio y el guardado de video. No se han publicado resultados de benchmarks estandar (FVD, CLIP score, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma exacta; el autor indica que depende de la resolucion, el numero de fotogramas, el numero de referencias y el resto del flujo de trabajo. Los pesos de cada checkpoint rondan los 12 GB, lo que reduce sustancialmente el coste de ancho de banda de memoria.
- GPUs soportadas: NVIDIA SM75 (RTX 20, T4), SM86 (RTX 30, A10, A40), SM89 (RTX 40, L4, L40, RTX 6000 Ada) y SM120 (RTX 50, PRO 6000 Blackwell).
- Cabe en GPU de consumo: si, segun el autor, en las familias RTX 20/30/40/50; la viabilidad concreta depende de la resolucion y del numero de fotogramas.
- Opciones de despliegue: ComfyUI con el nodo ComfyUI-QuantFunc, SDK de Python Quantfunc y la pipeline MiniMaxH3Pipeline de diffusers.
- Latencia y throughput: 3,2 s por paso en RTX 4090 a 768x768 con 124 fotogramas (solo modelo principal). Para un clip completo hay que sumar el codificador de texto, el VAE y el procesamiento de audio.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MiniMax-H3-QuantFunc-4bit | no disponible | no disponible | INT4 SVDQuant + INT8 sidecar | minimax-h3-community-license | Hugging Face, ComfyUI, SDK Python |
| MiniMax-H3 (BF16 original) | no disponible | no disponible | BF16 | minimax-h3-community-license | Hugging Face |
| MiniMax-H3 INT8 ConvRot | no disponible | no disponible | INT8 | minimax-h3-community-license | Referenciado por QuantFunc |
| MiniMax-H3 FP8 | no disponible | no disponible | FP8 | minimax-h3-community-license | Referenciado por QuantFunc |

La comparativa se limita a las variantes del mismo modelo base citadas por el autor, ya que no se dispone de datos de otros modelos de generacion de video comparables en la informacion proporcionada.

## Limitaciones y advertencias

- La cuantizacion INT4 introduce perdida de calidad respecto al BF16; el autor la cifra en ~23,7 dB de PSNR en su evaluacion interna, lo que implica diferencias perceptibles en detalle fino.
- No se han publicado evaluaciones independientes de calidad (FVD, consistencia temporal, sincronizacion audio-video) en la informacion disponible.
- Los tiempos de inferencia publicados son del modelo principal y no incluyen el codificador de texto, el VAE ni el procesamiento de audio, por lo que la latencia real de un clip completo es mayor.
- La licencia minimax-h3-community-license es de tipo comunitario y puede imponer restricciones al uso comercial; conviene revisar sus terminos antes de desplegar en produccion.
- El modelo esta pensado para generacion de video y audio, no para tareas de texto, razonamiento o codigo; no debe evaluarse como un LLM.
- No se dispone de informacion sobre sesgos, idiomas soportados ni riesgo de alucinacion en la generacion de contenido.
- El rendimiento depende de la version de drivers, del software y del hardware; el autor advierte que la velocidad real varia con la resolucion, el numero de fotogramas y la configuracion.
- El repositorio ocupa 48,7 GB, por lo que requiere espacio de almacenamiento considerable aunque solo se descargue una variante.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/QuantFunc/Minimax-H3-Quantfunc-4bit
- Modelo base: https://huggingface.co/MiniMaxAI/MiniMax-H3
- Repositorio ComfyUI-QuantFunc: https://github.com/QuantFunc/ComfyUI-QuantFunc
- SDK de Python Quantfunc: https://github.com/QuantFunc/Quantfunc-Python-SDK
- Sitio web de QuantFunc: https://www.quantfunc.com/
- Perfil de QuantFunc en Hugging Face: https://huggingface.co/QuantFunc
- Perfil de QuantFunc en ModelScope: https://www.modelscope.cn/profile/QuantFunc
- Perfil de QuantFunc en Civitai: https://civitai.com/user/quantfunc
- Discord de QuantFunc: https://discord.gg/jCp9TpFWcn
