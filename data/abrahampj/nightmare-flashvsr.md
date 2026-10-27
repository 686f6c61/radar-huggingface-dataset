# AbrahamPJ/nightmare-flashvsr

## Resumen

nightmare-flashvsr es una conversion a GGUF de FlashVSR v1.1, un modelo de superresolucion de video desarrollado por Junhao Zhuang y colaboradores (licencia Apache 2.0). El repositorio lo publica el usuario AbrahamPJ, que no entrena ni modifica los pesos: unicamente los reempaqueta en el layout que consume el motor DiT de la aplicacion Nightmare Mobile, un fork de stable-diffusion.cpp identificado como `dit/058`. El resultado es un unico fichero de 2,2 GB con 1.754.367.299 parametros que reescala video por un factor de 2x en ancho y alto.

La relevancia del artefacto es de despliegue, no de investigacion: traslada un modelo de restauracion de video basado en difusion a un formato cuantizado (Q8_0 en los pesos lineales del DiT, f16 en proyector y decoder) que puede ejecutarse en la NPU de un telefono movil. Para ello procesa la entrada en teselas de 256 px y sustituye la mascara block-sparse original por atencion densa, justificado por el propio autor con el argumento de que a ese tamano de tesela la mascara esta llena al 99 %.

Se trata de un modelo de una sola tarea (upscaling de video), sin entrada de texto ni soporte multilingue: el prompt esta fijado como embedding precalculado (umT5) dentro del propio GGUF. No se han publicado en la informacion disponible resultados de benchmarks, datos de entrenamiento ni validacion por parte de la comunidad (0 descargas, 1 like en el momento de la consulta).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DiT (diffusion transformer) de un solo paso sobre Wan 2.1 1.3B en modo streaming (`diffusion_pytorch_model_streaming_dmd`), con proyector LQ causal y TCDecoder |
| Parametros totales | 1.754.367.299 (aproximadamente 1,75 mil millones) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible; no es un modelo de lenguaje: usa un embedding de prompt fijo (`posi_prompt.pth`, umT5) |
| Tipos de cuantizacion | Q8_0 en los pesos lineales del DiT y f32 en el resto del DiT; f16 en el proyector LQ y en el TCDecoder; f32 en el contexto |
| Idiomas soportados | no disponible (sin entrada de texto; prompt fijo) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (fichero unico), layout `dit/058` del motor Nightmare Mobile DiT |
| Tamano del repositorio | 2,2 GB |
| Modelo base | JunhaoZhuang/FlashVSR-v1.1 |
| Factor de escala | 2x en ancho y alto |
| Entrada de inferencia | teselas de 256 px con atencion densa |
| Fecha de publicacion | 27 de octubre de 2026 |

## Arquitectura y entrenamiento

El modelo es una cadena de tres componentes. El nucleo es un DiT de difusion de un solo paso derivado de Wan 2.1 1.3B, en la variante `diffusion_pytorch_model_streaming_dmd` (destilacion por DMD, lo que permite generar en un unico paso en lugar de decenas). A continuacion, un proyector LQ causal adapta la entrada de baja calidad al espacio latente del DiT; en la conversion, cada convolucion 3D se ha desdoblado en una convolucion 2D mas un tap temporal (`lq.convN.kT`) para que el motor pueda ejecutarla. Cierra el pipeline el TCDecoder, cuya primera convolucion se ha rellenado de 784 a 800 canales de entrada con ceros para encajar en el layout del motor.

Los pesos proceden integramente de los autores originales; esta ficha no puede aportar informacion sobre el dataset de entrenamiento, el numero de tokens, la composicion de los datos ni el proceso de alineacion, porque no figura en la informacion disponible. La innovacion tecnica documentada es exclusivamente de empaquetado e inferencia: cuantizacion Q8_0 de los pesos lineales dejando el resto en f32, paso del proyector y el decoder a f16, sustitucion de la mascara block-sparse por atencion densa a 256 px y ejecucion por teselas sobre NPU movil.

## Capacidades

- Superresolucion de video: reescala un clip completo por 2x en ancho y alto.
- Procesamiento por teselas de 256 px con atencion densa, pensado para memoria limitada.
- Inferencia en un solo paso de difusion (DMD), lo que reduce el coste por fotograma frente a muestreo iterativo.
- Ejecucion on-device en la NPU del telefono mediante el motor Nightmare Mobile DiT (fork de stable-diffusion.cpp).
- Integracion como nodo de video Wan dentro de la aplicacion, activado por el interruptor "Upscale 2x".
- Sin soporte de tool calling, function calling ni agentes: no es un modelo de lenguaje.
- Sin capacidades multimodales de entrada: no acepta texto, audio ni indicaciones; el prompt es un embedding fijo.
- Sin capacidades multilingues: no hay procesamiento de lenguaje natural en el pipeline.

## Casos de uso

- Reescalado 2x de clips grabados en el movil: el modelo se ejecuta en la NPU del propio dispositivo con teselas de 256 px, de modo que un video de 720p se convierte en 1440p sin subir el material a la nube ni depender de conectividad.
- Restauracion de material de archivo o de baja resolucion: util para digitalizaciones antiguas o grabaciones comprimidas, donde el DiT reconstruye detalle de textura fotograma a fotograma manteniendo coherencia temporal gracias al proyector LQ causal.
- Etapa final de pipelines de generacion de video con Wan: al compartir la familia Wan 2.1, el modelo encaja de forma natural como paso de upscaling de los clips generados por los nodos de video de la aplicacion.
- Preprocesado para edicion en movilidad: subir la resolucion de un clip antes de recortarlo o estabilizarlo en el telefono, con un fichero de 2,2 GB que evita depender de un servidor GPU.
- Contenido para redes sociales: conversion de grabaciones verticales de 1080p a 2160p para publicacion, con procesamiento local que preserva la privacidad del material.
- Procesamiento de metraje de dron o camaras de accion con bitrate bajo: el modelo actua como restaurador de detalle en secuencias con artefactos de compresion, ejecutable en hardware de campo sin GPU dedicada.
- Escenarios con requisitos de privacidad o cumplimiento: al ser inferencia local con licencia Apache 2.0, permite tratar video sensible sin transferir datos a terceros ni pagar por llamada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de PSNR, SSIM, LPIPS ni de calidad perceptual para esta conversion, ni cifras de latencia o fotogramas por segundo en ningun dispositivo concreto.

## Requisitos de hardware

- VRAM estimada para inferencia: el GGUF ocupa 2,2 GB en disco, con los pesos lineales del DiT en Q8_0, el proyector y el decoder en f16 y el contexto en f32; a ello hay que sumar las activaciones de las teselas de 256 px y el TCDecoder. Como referencia orientativa (estimacion, no medida publicada), entre 4 y 6 GB de memoria dedicada para teselas de 256 px.
- GPU recomendadas: no hay recomendaciones oficiales en la informacion disponible. Por tamano, cualquier GPU consumer con 8 GB o mas (RTX 3060 Ti, RTX 4060, RTX 4090) deberia alojar el modelo; A100 o H100 solo tendrian sentido para procesar muchos clips en paralelo.
- Cabe en GPU consumer: si, previsiblemente en cualquier tarjeta con 8 GB o mas, y en la NPU de un telefono movil segun el caso de uso declarado por el autor.
- Opciones de despliegue: motor Nightmare Mobile DiT (fork de stable-diffusion.cpp, layout `dit/058`). No hay constancia en la informacion disponible de soporte en vLLM, TGI, llama.cpp u Ollama; estos ultimos estan orientados a modelos de lenguaje y no cubren esta arquitectura de difusion.
- Latencia y throughput: no disponibles. No se han publicado mediciones de fotogramas por segundo ni de tiempo por tesela en ningun hardware.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Cuantizacion | Entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| nightmare-flashvsr | 1,75 B | GGUF, layout `dit/058` | Q8_0 / f16 / f32 | teselas de 256 px, salida 2x | Apache 2.0 | Hugging Face, 0 descargas, 1 like |
| FlashVSR v1.1 (modelo base) | 1,3 B en el DiT mas proyector y decoder | pesos originales del autor (formato no detallado en la informacion disponible) | no disponible | misma arquitectura | Apache 2.0 | Hugging Face |
| Otras alternativas de superresolucion de video | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

La unica comparacion documentada es contra el modelo base: comparten pesos y licencia, y la diferencia estriba en el empaquetado (cuantizacion y layout para NPU movil). No se dispone en la informacion proporcionada de datos de otros modelos de la misma categoria que permitan una comparacion cuantitativa.

## Limitaciones y advertencias

- Modelo de una sola tarea: no genera texto, no razona y no admite instrucciones; cualquier uso fuera del upscaling de video no esta soportado.
- Prompt fijo: el embedding umT5 viene precalculado en el GGUF, por lo que no es posible modificar la indicacion de texto sin reconstruir el fichero.
- Riesgo de detalle inventado: como todo modelo generativo de restauracion, puede sintetizar texturas, rostros o bordes que no existen en el original; en contextos forenses o medicos el resultado no es probatorio.
- Atencion densa a 256 px: el consumo de memoria crece de forma cuadratica con el tamano de tesela, lo que limita la resolucion de trabajo y puede producir costuras entre teselas.
- Sin datos de evaluacion: no hay benchmarks, ablaciones ni validacion de la comunidad (0 descargas), por lo que la calidad real frente al modelo base no esta cuantificada.
- Conversion no oficial: el autor del repositorio no es el autor del modelo; los pesos y la licencia son de Junhao Zhuang et al. Cualquier error de conversion (por ejemplo, el relleno de 784 a 800 canales del decoder o el desdoble de convoluciones 3D) no esta respaldado por los desarrolladores originales.
- Dependencia de un motor concreto: el layout `dit/058` esta pensado para un fork de stable-diffusion.cpp; no se garantiza compatibilidad con otras herramientas ni con versiones futuras del motor.
- Idiomas: sin soporte linguistico declarado; no aplica evaluacion multilingue.
- Licencia Apache 2.0: permite uso comercial y modificacion con atribucion; al derivar del modelo base, deben conservarse los avisos de copyright de los autores originales.
- Fecha de publicacion adelantada (27 de octubre de 2026) y ausencia de historial de uso: conviene tratar el artefacto como experimental hasta verificarlo en produccion.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/AbrahamPJ/nightmare-flashvsr
- Modelo base: https://huggingface.co/JunhaoZhuang/FlashVSR-v1.1
- Paper, blog, repositorio de codigo o demo: no disponibles en la informacion proporcionada.
