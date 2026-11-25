# nihui-szyl/h3-ncnn

## Resumen

h3-ncnn es una conversión del modelo MiniMax-H3 de MiniMaxAI al formato y runtime de ncnn con backend Vulkan, publicada por el usuario nihui-szyl. No se trata de un modelo entrenado desde cero, sino de un reempaquetado de los pesos originales de MiniMax-H3 (grafos convertidos, pesos y datos de tokenizador) para poder ejecutarse en el runtime `h3-ncnn-vulkan` sin depender de PyTorch ni CUDA. El pipeline declarado es image-to-video, con soporte adicional para text-to-video, condicionamiento por primer y último fotograma y condicionamiento multimodal por referencia con audio estéreo.

El repositorio es de gran tamaño (206 GB) porque incluye los bancos de modulación en BF16 para el esquema por defecto de 50 pasos, además de los bancos opcionales pi-H3 (unos 291 MB adicionales) que cubren los adaptadores VAE de 2 y 4 pasos. Los codificadores de texto y visión se comparten con la conversión H3Image para ncnn, lo que reduce la duplicación de pesos entre ambas distribuciones.

Su relevancia práctica es acotada pero clara: permite ejecutar un modelo de generación de vídeo de la familia MiniMax-H3 en hardware Vulkan heterogéneo (incluidas GPUs de consumo y plataformas no NVIDIA) mediante ncnn, a costa de una gestión manual de ficheros y de la dependencia de un ejecutable concreto. La licencia es la MiniMax H3 Community License, con restricciones territoriales, no una licencia open source estándar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (conversion de MiniMax-H3; incluye transformer con bancos de modulacion BF16, codificadores de texto y vision, y adaptadores VAE) |
| Parametros totales | No disponible |
| Parametros activos | No disponible |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | BF16 (bancos de modulacion); no se detallan otras precisiones en la informacion disponible |
| Idiomas soportados | No disponible |
| Licencia | MiniMax H3 Community License (con restricciones territoriales) |
| Formato de pesos | Grafos, pesos y tokenizador convertidos para ncnn (`h3/`), no safetensors ni GGUF |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna de MiniMax-H3 ni su proceso de entrenamiento (número de tokens, composición del dataset, RLHF/DPO). Lo que sí se documenta es la estructura de la conversión: el directorio `h3/` contiene los ficheros de runtime para text-to-video, condicionamiento por primer/último fotograma y condicionamiento multimodal por referencia con audio estéreo, y `h3/transformer/` aloja los bancos de modulación portables en BF16 para el esquema de 50 pasos.

El banco correspondiente se selecciona según el flujo de trabajo y las modalidades de referencia. Los bancos FL2VA cubren keyframes, referencias de audio experimentales y su combinación. Los bancos opcionales pi-H3 en `h3/transformer/fl2va/` cubren los adaptadores VAE por defecto de 2 y 4 pasos, cada uno con presets solo texto (`none`) y primer/último fotograma (`video`); estos cuatro ficheros añaden unos 291 MB y requieren un ejecutable actualizado y el adaptador correspondiente del repositorio pi-H3. Los codificadores de texto y visión se comparten con la conversión H3Image para ncnn.

## Capacidades

- Generación de vídeo a partir de texto (text-to-video).
- Generación de vídeo a partir de imagen (image-to-video), pipeline declarado del repositorio.
- Condicionamiento por primer y último fotograma (first/last-frame conditioning).
- Condicionamiento multimodal por referencia con audio estéreo.
- Adaptadores VAE de 2 y 4 pasos mediante los bancos pi-H3 opcionales, para reducir el número de pasos de muestreo.
- Ejecución sobre Vulkan mediante ncnn, sin dependencia de CUDA.
- No se documentan en la información disponible capacidades de tool calling, agentes, razonamiento multi-step ni soporte multilingüe explícito.

## Casos de uso

- Prototipado de image-to-video en estaciones de trabajo con GPU Vulkan no NVIDIA: al ejecutarse sobre ncnn y Vulkan, permite probar el pipeline de MiniMax-H3 en hardware donde no hay soporte CUDA, usando el ejecutable `h3-ncnn-vulkan` con el directorio `h3/` descargado vía CLI de Hugging Face.
- Generación de clips con control de keyframes: el condicionamiento por primer y último fotograma (bancos FL2VA) sirve para producir transiciones entre dos imágenes dadas, útil en animática y previsualización de secuencias.
- Iteración rápida con adaptadores de pocos pasos: los bancos pi-H3 de 2 y 4 pasos permiten reducir el coste de muestreo frente al esquema por defecto de 50 pasos, adecuado para exploración de ideas antes de un render final.
- Vídeo con referencia multimodal y audio: el condicionamiento por referencia con audio estéreo permite generar clips guiados por material de referencia, aplicable a doblaje visual o a la creación de contenido promocional con banda sonora.
- Despliegue en entornos con requisitos de runtime ligero: ncnn evita el stack de PyTorch y permite integrar la inferencia en aplicaciones nativas que ya usan ncnn para otras tareas (visión, imagen), compartiendo los codificadores con la conversión H3Image.
- Evaluación comparativa de la familia MiniMax-H3 en hardware heterogéneo: al ser una conversión de los pesos originales, sirve para medir el comportamiento del modelo en Vulkan frente a otras implementaciones, siempre que se respete la licencia comunitaria.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; el tamaño del repositorio (206 GB) refleja el conjunto completo de pesos y bancos, no el consumo en ejecución.
- GPU recomendadas: no se especifican modelos concretos; el requisito es soporte de Vulkan con un ejecutable `h3-ncnn-vulkan` actualizado.
- Compatibilidad con GPU de consumo: no confirmada en la información disponible; depende del backend Vulkan y de la memoria disponible en cada tarjeta.
- Opciones de despliegue: exclusivamente el ejecutable `h3-ncnn-vulkan` con el directorio `h3/` (descarga mediante `hf download nihui-szyl/h3-ncnn --include 'h3/*' --local-dir models`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Runtime | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| h3-ncnn (esta ficha) | No disponible | No disponible | ncnn + Vulkan | MiniMax H3 Community License | Hugging Face, 41 descargas |
| MiniMaxAI/MiniMax-H3 (original) | No disponible | No disponible | No disponible en la informacion | MiniMax H3 Community License | Hugging Face (modelo base) |
| nihui-szyl/h3-image-ncnn | No disponible | No disponible | ncnn + Vulkan | No disponible en la informacion | Hugging Face (conversion relacionada, comparte codificadores) |
| Lakonik/pi-H3 | No disponible | No disponible | No disponible | No disponible en la informacion | Hugging Face (adaptadores de 2 y 4 pasos) |

No se dispone de datos de rendimiento ni de especificaciones detalladas de las alternativas en la información proporcionada, por lo que la comparativa se limita a runtime, licencia y disponibilidad.

## Limitaciones y advertencias

- Licencia MiniMax H3 Community License: no es una licencia open source estándar e incluye restricciones territoriales; es imprescindible revisar `h3/LICENSE` y `h3/NOTICE` antes de cualquier uso comercial o despliegue público.
- Dependencia de un ejecutable concreto: los bancos de modulación requieren una versión actualizada de `h3-ncnn-vulkan`; una versión antigua puede no cargar las tablas correctamente.
- Gestión manual de ficheros: hay que seleccionar el banco adecuado según el flujo de trabajo y las modalidades de referencia, lo que introduce riesgo de configuración incorrecta.
- Los adaptadores pi-H3 son opcionales y experimentales (las referencias de audio se describen como experimentales); su calidad no está validada en la información disponible.
- No se documentan idiomas soportados, sesgos conocidos, tasas de alucinación ni límites de contexto; no deben asumirse.
- Tamaño de repositorio muy elevado (206 GB), lo que exige planificación de almacenamiento y ancho de banda para la descarga.
- No se especifican requisitos mínimos de VRAM ni hardware validado, por lo que el rendimiento en producción es incierto sin pruebas propias.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/nihui-szyl/h3-ncnn
- Modelo base: https://huggingface.co/MiniMaxAI/MiniMax-H3
- Licencia del modelo base: https://huggingface.co/MiniMaxAI/MiniMax-H3/blob/main/LICENSE
- Conversión relacionada H3Image ncnn: https://huggingface.co/nihui-szyl/h3-image-ncnn
- Adaptador pi-H3: https://huggingface.co/Lakonik/pi-H3
