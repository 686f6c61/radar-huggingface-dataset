# ellyxeo/big-lama-512-gpu

## Resumen

Big-LaMa 512 GPU es una conversión del modelo de inpainting Big-LaMa (Suvorov et al., "Resolution-robust Large Mask Inpainting with Fourier Convolutions", WACV 2022) al formato LiteRT (TensorFlow Lite) para su ejecución íntegra sobre el delegado GPU de Android. El modelo resuelve una tarea concreta: rellenar regiones enmascaradas de una imagen RGB de 512 x 512 píxeles, recibiendo como entrada la imagen normalizada en el rango 0..1 y una máscara binaria donde el valor 1 indica los píxeles a reconstruir. La salida es la imagen completada con valores en el rango 0..255.

El modelo lo publica el usuario ellyxeo en Hugging Face y no es un modelo generativo de propósito general ni un LLM: es una red de inpainting de imagen, derivada de la exportación ONNX de AUXOUT-TEAM/agit-lama-inpainting, que a su vez procede de smartywu/big-lama. La relevancia de esta versión radica en la conversión técnica: las matrices DFT de las unidades de Fourier se pliegan para el tamaño fijo de 512, el apilado de partes real e imaginaria se reescribe en 4D y los productos de matrices DFT se expresan como convoluciones 1x1, de modo que todas las operaciones pueden ejecutarse en el delegado GPU de LiteRT en dispositivos Android.

El repositorio ocupa 0,1 GB, los pesos están en FP32 (con posibilidad de ejecutar con pérdida de precisión FP16 para ganar velocidad) y la licencia es Apache-2.0, heredada del código y pesos originales de LaMa. No se dispone de información sobre idiomas, benchmarks publicados ni parámetros del modelo en la información proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red de inpainting con convoluciones de Fourier (LaMa, Suvorov et al., WACV 2022), convertida a LiteRT |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de imagen; entrada fija 1x512x512x3 + máscara 1x512x512x1) |
| Tipos de cuantizacion | Pesos FP32; ejecución con pérdida de precisión permitida (FP16) para velocidad |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | LiteRT / TensorFlow Lite (.tflite) |

## Arquitectura y entrenamiento

La arquitectura subyacente es Big-LaMa, una red de inpainting basada en convoluciones de Fourier (Fast Fourier Convolutions) diseñada para ser robusta a la resolución y a máscaras grandes. El modelo original se presenta en el artículo "Resolution-robust Large Mask Inpainting with Fourier Convolutions" (Suvorov et al., WACV 2022). La conversión a LiteRT realiza tres transformaciones clave para permitir la ejecución completa en el delegado GPU de Android: el plegado de las matrices DFT de las unidades de Fourier para el tamaño fijo de 512, la reescritura del apilado real/imaginario en 4D y la expresión de los productos de matrices DFT como convoluciones 1x1.

Según la model card, la salida de la conversión coincide con la exportación ONNX de origen dentro de una tolerancia de 1e-4 en CPU. No se proporcionan datos sobre el número de tokens de entrenamiento, la composición del dataset, ni si hubo etapas de RLHF o DPO (no aplicables a un modelo de imagen de este tipo). Tampoco se detalla el proceso de entrenamiento original más allá de la referencia al paper de LaMa.

## Capacidades

- Inpainting de imágenes RGB de 512 x 512 píxeles: rellena las regiones indicadas por una máscara binaria (valor 1 = rellenar).
- Entrada de imagen normalizada en 0..1 y máscara binaria exacta (0 o 1) de 512 x 512.
- Salida de imagen RGB en el rango 0..255.
- Ejecución completa sobre el delegado GPU de LiteRT en Android, sin operaciones en CPU según la model card.
- Compatible con ejecución en FP16 (con pérdida de precisión permitida) para acelerar la inferencia.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües: es un modelo de visión específico de inpainting.
- No dispone de modo thinking, visión general, audio ni otras capacidades especiales más allá del inpainting.

## Casos de uso

- Eliminación de objetos en aplicaciones móviles de retoque fotográfico: el modelo recibe la foto de 512 x 512 y una máscara dibujada por el usuario sobre el objeto a borrar, y devuelve la imagen con la región reconstruida; su ejecución en el delegado GPU de Android permite procesar en el propio dispositivo sin subir la imagen a un servidor.
- Restauración de fotografías con zonas dañadas o arañazos: se genera una máscara binaria sobre las áreas defectuosas y el modelo rellena el contenido de forma coherente con el contexto circundante, aprovechando las convoluciones de Fourier para mantener consistencia global.
- Limpieza de marcas de agua o logotipos en imágenes de 512 x 512: útil en pipelines de preprocesado de datasets de visión por computador donde se necesita eliminar anotaciones superpuestas antes del entrenamiento.
- Edición de imágenes en aplicaciones Android con LiteRT: al estar empaquetado como modelo .tflite con todas las operaciones en el delegado GPU, se integra en apps móviles que ya usan LiteRT para otras tareas de visión, reduciendo la dependencia de servicios en la nube.
- Relleno de huecos en imágenes médicas o de teledetección de 512 x 512: para parchear regiones corruptas o ausentes en recortes de imagen antes de pasarlos a un modelo de análisis posterior, siempre que el dominio sea compatible con el entrenamiento original de LaMa.
- Prototipado rápido de pipelines de inpainting en entornos con recursos limitados: el tamaño de repositorio de 0,1 GB y el formato LiteRT permiten desplegar el modelo en dispositivos de gama media sin GPU dedicada de escritorio, usando el delegado GPU del propio móvil.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente indica que la salida de la conversión LiteRT coincide con la exportación ONNX de origen dentro de 1e-4 en CPU, pero no se aportan métricas de calidad de inpainting (PSNR, SSIM, FID) ni de latencia o throughput en dispositivos Android.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; el repositorio ocupa 0,1 GB, pero no se detalla el consumo en memoria del modelo cargado.
- GPU recomendadas: el modelo está diseñado para el delegado GPU de LiteRT en Android, por lo que el hardware objetivo son GPU integradas de dispositivos móviles compatibles con dicho delegado; no se especifican modelos concretos.
- ¿Cabe en GPU de consumo? El formato LiteRT y el tamaño del repositorio sugieren que está pensado para hardware móvil, pero no se confirma compatibilidad con GPU de escritorio (RTX 4090, etc.) en la información disponible.
- Opciones de despliegue: LiteRT / TensorFlow Lite con delegado GPU; no se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Resolución de entrada | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ellyxeo/big-lama-512-gpu | Inpainting LaMa convertido a LiteRT | 512 x 512 fija | .tflite (LiteRT) | Apache-2.0 | Hugging Face |
| AUXOUT-TEAM/agit-lama-inpainting | Inpainting LaMa en ONNX | no disponible | ONNX | no disponible | Hugging Face |
| smartywu/big-lama | Inpainting LaMa original | no disponible | no disponible | no disponible | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada; la comparativa se limita a formato, licencia y disponibilidad.

## Limitaciones y advertencias

- Modelo específico de inpainting: no es un LLM ni un modelo multimodal general; no admite texto, tool calling ni razonamiento.
- Resolución fija de 512 x 512: la conversión pliega las matrices DFT para ese tamaño concreto, por lo que no es adaptable a otras resoluciones sin reconversión.
- La máscara debe ser estrictamente binaria (0 o 1); valores intermedios pueden producir resultados no definidos.
- No se han publicado métricas de calidad (PSNR, SSIM, FID) ni evaluaciones de sesgo para esta conversión, por lo que el rendimiento real en dominios distintos al de entrenamiento es desconocido.
- Riesgo de artefactos o alucinación visual en regiones grandes o con texturas complejas, inherente a los modelos de inpainting; no cuantificado en la información disponible.
- Ejecución en FP16 con pérdida de precisión permitida puede degradar ligeramente la calidad de la reconstrucción frente a FP32.
- Licencia Apache-2.0 permite uso comercial, pero se recomienda verificar las condiciones del código y pesos originales de LaMa (github.com/advimman/lama) y de las conversiones intermedias.
- Sin datos sobre idiomas, sesgos demográficos ni comportamiento en imágenes fuera de distribución.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validación comunitaria conocida.

## Enlaces

- Hugging Face: https://huggingface.co/ellyxeo/big-lama-512-gpu
- Exportación ONNX de origen: https://huggingface.co/AUXOUT-TEAM/agit-lama-inpainting (revisión 5646fb0bbd8887fac005e0bd3be7047f2211f74b)
- Modelo Big-LaMa original: https://huggingface.co/smartywu/big-lama
- Código y pesos originales de LaMa: https://github.com/advimman/lama
- Paper: Suvorov et al., "Resolution-robust Large Mask Inpainting with Fourier Convolutions", WACV 2022
