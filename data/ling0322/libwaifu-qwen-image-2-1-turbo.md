# ling0322/libwaifu-qwen-image-2.1-turbo

## Resumen

libwaifu-qwen-image-2.1-turbo es un paquete de pesos del modelo de generacion de imagenes Qwen-Image-2.1-Turbo, reempaquetado por el usuario ling0322 en el formato que consume el runtime libwaifu. No es un modelo nuevo ni un ajuste fino: es una conversion del checkpoint acelerado de 8 pasos de Qwen-Image 2.1, con las matrices almacenadas en fp8 (E4M3, una escala por canal de salida) y el resto de tensores en float16. El paquete ocupa 16,7 GB en disco sobre un repositorio de 17,1 GB.

El modelo subyacente es un sistema text-to-image compuesto por un DiT single-stream de 7B, la mitad de lenguaje de un codificador de texto Qwen3-VL-8B leida en su ultima capa y un autoencoder de estilo Wan-2.2 con 64 canales latentes que emite salida RGBA. El paquete incluye ademas el vision tower de Qwen3-VL en float16 (0,8 GB) para edicion de imagenes, aunque el runtime todavia no lo lee.

Su relevancia es doble: por un lado permite ejecutar un modelo de difusion de 7B en fp8 sobre hardware sm_80 o superior con solo ocho pasos de muestreo y sin guidance; por otro, sirve como artefacto de referencia para estudiar el impacto de la cuantizacion fp8 en la fidelidad del muestreo. La licencia Qwen Research limita el uso a investigacion y evaluacion, sin explotacion comercial.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DiT (Diffusion Transformer) single-stream de 7B, con codificador de texto derivado de Qwen3-VL-8B y autoencoder de estilo Wan-2.2 |
| Parametros totales | 7B en el DiT; el paquete incluye ademas el codificador de texto (mitad de lenguaje de Qwen3-VL-8B) y el autoencoder. Total agregado no desglosado en la informacion disponible |
| Longitud de contexto | no disponible (modelo text-to-image; no se documenta la ventana del codificador de texto) |
| Tipos de cuantizacion | fp8 E4M3 con una escala por canal de salida en las matrices; el resto de tensores en float16. El autoencoder no esta cuantizado |
| Idiomas soportados | en (etiquetado oficial). El codificador procede de Qwen3-VL-8B, multilingue, pero no se documenta soporte multilingue para el pipeline |
| Licencia | qwen-research (Qwen Research License Agreement); uso no comercial, solo investigacion y evaluacion |
| Formato de pesos | formato propio del runtime libwaifu (manifiesto `qwen-image-2.1-turbo-fp8.yaml` con sus "parts"); no safetensors ni GGUF |

## Arquitectura y entrenamiento

El componente central es un DiT single-stream de 7B que opera sobre latentes de 64 canales generados por un autoencoder de estilo Wan-2.2; el decodificador emite cuatro canales, es decir, salida RGBA con canal alfa. El condicionamiento de texto proviene de la mitad de lenguaje de un Qwen3-VL-8B, leida en su ultima capa. El paquete incluye tambien el vision tower de Qwen3-VL en float16 (0,8 GB, bajo el prefijo `qwen_image.vision.*`) previsto para edicion de imagenes, aunque el runtime actual no lo consume.

No se documenta el proceso de entrenamiento original de Qwen-Image 2.1 Turbo (numero de tokens, composicion del dataset ni si hubo RLHF o DPO), ya que esta ficha se refiere a un reempaquetado y no al entrenamiento del modelo base. La innovacion tecnica de este paquete es la conversion a fp8: las matrices se almacenan como E4M3 con una escala por canal de salida, y el manifiesto fija las ocho sigmas de muestreo (`sampler_sigmas`), de modo que cualquier numero de pasos solicitado se ignora y la generacion siempre se ejecuta en ocho pasos y sin guidance (guidance = 1). A diferencia de los paquetes oficiales de Qwen-Image 2.1, que adaptan el schedule al tamano de la imagen, este no lo hace.

## Capacidades

- Generacion de imagenes a partir de texto en ingles, con muestreo fijo de ocho pasos y sin guidance.
- Salida en RGBA: el decodificador produce canal alfa, lo que permite generar imagenes con transparencia.
- Edicion de imagenes: el paquete incluye el vision tower de Qwen3-VL para esta tarea, pero el runtime de libwaifu aun no lo lee, por lo que la capacidad no es operativa en esta version.
- Ejecucion en precision mixta fp8/float16 sobre GPU con compute capability sm_80 o superior.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generacion de codigo: no es un modelo de lenguaje.
- No se documentan capacidades de audio, video ni control estructural (pose, profundidad, etc.).

## Casos de uso

- Generacion de ilustraciones de personajes: el checkpoint turbo funciona en ocho pasos fijos sin guidance, lo que reduce el coste por imagen y facilita la iteracion rapida en produccion de arte conceptual de estilo anime.
- Creacion de assets con transparencia: la salida RGBA permite obtener recortes ya alfa-mascarados para composicion en editores graficos, sin postproceso de segmentacion.
- Edicion de imagenes (a futuro): el vision tower de Qwen3-VL esta incluido en el paquete, de modo que la edicion podra habilitarse cuando el runtime incorpore su lectura en la ruta de inferencia.
- Investigacion sobre cuantizacion fp8: el paquete sirve para medir la deriva de fidelidad frente a la implementacion de referencia, con metricas ya publicadas de velocidad y decodificacion.
- Evaluacion comparativa de runtimes: al fijar las ocho sigmas en el manifiesto, permite reproducir exactamente el mismo recorrido de muestreo entre ejecuciones y comparar el resultado del runtime libwaifu frente a diffusers.
- Reproduccion de pipelines de sintesis de imagen en entornos de investigacion con GPU Ampere o posterior, al no requerir hardware de ultima generacion.
- Base para experimentos academicos de reempaquetado y conversion de checkpoints de difusion a formatos alternativos a safetensors.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad de imagen (FID, CLIP score, etc.) en la informacion disponible. La model card unicamente reporta metricas de fidelidad numerica del paquete fp8 frente a `QwenImage21Pipeline` de diffusers, con los mismos pesos, a 256x256, ocho pasos y todas las entradas tomadas de una trayectoria real:

| Metrica | Paquete fp8 |
|---|---|
| Velocidad (velocity) en el paso cinco | 2,1e-2 |
| Decodificador, RGBA (frente a float32) | 8,0e-4 (no esta cuantizado) |
| Recorrido completo de los ocho pasos | 1,8e-1 |

Segun el autor, la ultima capa del codificador de texto es la parte sensible, y el recorrido, aunque funcional, se desvia mas de la referencia que otros paquetes fp8 de libwaifu. No hay datos de MMLU, HumanEval ni GSM8K porque no son aplicables a un modelo text-to-image.

## Requisitos de hardware

- Compatibilidad de GPU: fp8 requiere una tarjeta con compute capability sm_80 o superior, es decir, Ampere, Ada, Hopper o posteriores (A100, A30, H100, RTX 30xx, RTX 40xx y superiores). Quedan fuera Turing (sm_75) y anteriores.
- VRAM estimada para inferencia: a partir del peso en disco (16,7 GB en fp8) y de los componentes adicionales (codificador de texto, autoencoder y activaciones), se estima un consumo del orden de 20 a 24 GB. Es una estimacion basada en el tamano del repositorio, no un dato publicado.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 para margen comodo; en consumer, tarjetas con 24 GB (RTX 3090, 4090) son el minimo razonable segun la estimacion anterior.
- Opciones de despliegue: el runtime nativo es libwaifu, mediante el comando `waifu webui -m qwen-image:2.1-turbo-fp8`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que son herramientas orientadas a modelos de lenguaje.
- Latencia y throughput: no disponibles. Solo se sabe que el muestreo esta fijado a ocho pasos sin guidance.

## Comparativa con modelos similares

| Modelo | Parametros | Formato y precision | Pasos de muestreo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| libwaifu-qwen-image-2.1-turbo (este) | 7B (DiT) | Paquete libwaifu, fp8 E4M3 + float16 | 8 fijos, sin guidance | qwen-research (no comercial) | HuggingFace, 0 descargas, 0 likes |
| Qwen/Qwen-Image-2.1-Turbo (base) | 7B (DiT) | Pesos originales, sin cuantizar | 8 (checkpoint turbo) | qwen-research (no comercial) | HuggingFace oficial de Qwen |
| Paquete fp8 oficial de Qwen-Image 2.1 | no disponible | fp8 | Schedule adaptado al tamano de imagen | qwen-research | Referenciado por el autor, enlace no disponible |

No se dispone de datos de rendimiento comparativo entre estas variantes mas alla de las metricas de fidelidad del apartado anterior. No se han encontrado en la busqueda web modelos alternativos comparables con datos verificables.

## Limitaciones y advertencias

- Licencia no comercial: la Qwen Research License Agreement restringe el uso a investigacion y evaluacion. Cualquier uso comercial exige solicitar una licencia especifica segun los terminos del archivo `LICENSE`.
- Se trata de una copia modificada: no es un producto oficial de Qwen ni esta respaldado por Alibaba ni por el equipo Qwen. Los cambios respecto al original se detallan en el archivo `NOTICE` del repositorio.
- Deriva de fidelidad: el autor reconoce que el recorrido de ocho pasos se desvia mas de la referencia que otros paquetes fp8 de libwaifu, con un error de 1,8e-1 en el recorrido completo. La ultima capa del codificador de texto es el punto mas sensible.
- Schedule fijo: el manifiesto impone ocho sigmas de muestreo. El numero de pasos solicitado se ignora y no hay adaptacion del schedule al tamano de imagen, a diferencia de los paquetes oficiales de Qwen-Image 2.1.
- Idioma: etiquetado unicamente para ingles, sin soporte multilingue documentado.
- Edicion de imagenes no operativa: el vision tower esta incluido pero el runtime no lo lee todavia, por lo que la funcionalidad de edicion no puede usarse con esta version.
- Riesgo de sesgos y alucinacion visual: no se documentan evaluaciones de sesgo ni de fidelidad semantica de las imagenes generadas.
- Adopcion nula: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de validacion por parte de la comunidad.
- Dependencia de hardware: sin GPU sm_80 o superior no es posible ejecutar el paquete en fp8.
- La busqueda web realizada no arrojo resultados relevantes sobre este modelo; todos los enlaces devueltos correspondian a temas ajenos (Expo, venta de billetes de tren, musica), por lo que no aportan informacion adicional verificable.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ling0322/libwaifu-qwen-image-2.1-turbo
- Modelo base: https://huggingface.co/Qwen/Qwen-Image-2.1-Turbo
- Licencia Qwen Research License Agreement: https://huggingface.co/Qwen/Qwen-Image-2.1-Turbo/blob/main/LICENSE
- Runtime libwaifu (GitHub): https://github.com/ling0322/libwaifu
- Archivo NOTICE con los cambios respecto al original: incluido en el repositorio de HuggingFace (no se proporciona URL directa)
- Resultados de busqueda web: sin enlaces relevantes sobre este modelo
