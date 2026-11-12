# moonbox-ai/FLUX.2-klein-4B-ONNX

## Resumen

FLUX.2 Klein 4B ONNX es una conversión al formato ONNX del modelo de difusión texto-a-imagen FLUX.2 Klein 4B, desarrollado originalmente por Black Forest Labs y empaquetado por moonbox-ai para su ejecución en dispositivo mediante ONNX Runtime con backends CUDA, DirectML y CPU. El modelo base pertenece a la familia FLUX.2 en su variante "klein" (pequeña), con 4B parámetros, y orientada a generación y edición de imágenes. Esta conversión no introduce cambios en la arquitectura: se limita a exportar los distintos componentes del pipeline a grafos ONNX.

La relevancia de este artefacto radica en su portabilidad: al estar dividido en cuatro precisiones (fp16, bf16, int8 e int4) y en subgrafos independientes por componente (text encoder, transformer, VAE encoder y VAE decoder), permite desplegar el pipeline completo en entornos donde PyTorch no es viable, incluidos equipos Windows con DirectML o servidores sin GPU dedicada. Los pesos grandes se almacenan como datos externos ONNX (`*.onnx.data`), por lo que cada carpeta de precisión debe mantenerse íntegra.

El repositorio ocupa 41 GB en total y la licencia es Apache 2.0, heredada del modelo base. No se han publicado resultados de benchmarks de calidad de imagen en la información disponible; la model card solo aporta métricas de fidelidad numérica frente a la ejecución en fp32 del modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | difusión (pipeline FLUX.2 Klein); grafos ONNX separados para text encoder, transformer, VAE encoder y VAE decoder |
| Parametros totales | 4B (según el nombre del modelo base, FLUX.2-klein-4B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | fp16, bf16, int8, int4 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX con datos externos (`*.onnx` + `*.onnx.data`) |

## Arquitectura y entrenamiento

El modelo base FLUX.2 Klein 4B es un modelo de difusión para generación y edición de imágenes. Esta ficha describe la conversión a ONNX, no el entrenamiento del modelo original, del cual la model card no aporta detalles sobre composición del dataset, número de tokens de entrenamiento ni técnicas de alineación. La conversión de moonbox-ai mantiene la topología original y exporta cada componente del pipeline a un grafo ONNX independiente con sus pesos como datos externos.

La innovación técnica de este artefacto es la verificación de fidelidad numérica por precisión y por componente, medida como error RMS relativo frente a la ejecución del modelo PyTorch en fp32 sobre las mismas entradas. Para fp16, los errores van del 0,10 % (VAE encoder) al 0,87 % (transformer); para bf16, del 0,11 % al 4,2 %; para int8, del 0,11 % al 2,5 %; y para int4, el text encoder presenta un 13 % de error, el valor más alto documentado. Los VAE encoder y decoder se mantienen en fp16 en todas las carpetas de precisión (mismo hash sha256), de modo que solo el text encoder y el transformer varían entre variantes.

## Capacidades

- Generación de imágenes a partir de texto (pipeline `text-to-image`), ejecutada mediante ONNX Runtime.
- Edición de imágenes, según la etiqueta `image-editing` de la model card.
- Cuantización múltiple: fp16, bf16, int8 e int4, con fidelidad numérica documentada frente a fp32.
- Ejecución en CPU, CUDA y DirectML, lo que habilita despliegue en servidores sin GPU y en equipos Windows.
- Descomposición en subgrafos (text encoder, transformer, VAE encoder, VAE decoder) que permite cargar y liberar componentes por fases para reducir el pico de memoria.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni multimodalidad de audio; el modelo es exclusivamente de imagen.

## Casos de uso

- Generación de imágenes en aplicaciones de escritorio Windows: el uso de DirectML permite integrar el pipeline en aplicaciones nativas sin depender de CUDA ni de PyTorch, con la variante int8 o int4 para reducir requisitos de memoria.
- Servicios de generación de imágenes en CPU: las variantes int8 e int4, con 2,35 GB (text encoder) y 4,28 GB (transformer) respectivamente, hacen viable el despliegue en servidores sin GPU dedicada, a costa de mayor latencia.
- Prototipado e integración en pipelines .NET o C++: al ser grafos ONNX estándar, se pueden consumir desde ONNX Runtime en entornos empresariales donde el stack Python no está disponible.
- Edición de imágenes en flujos de preprocesado: el VAE encoder incluido en el pipeline permite codificar imágenes de entrada para tareas de edición, útil en herramientas de retoque asistido.
- Despliegue en dispositivos con memoria limitada: la variante int4 reduce el transformer a 4,28 GB, lo que permite ejecutar el pipeline en GPUs de consumo con 8 GB de VRAM combinando precisión baja con gestión por fases.
- Evaluación comparativa de precisiones: los errores RMS documentados (0,87 % en fp16 frente a 13 % en int4 para el text encoder) permiten elegir la precisión según el equilibrio entre calidad y recursos, por ejemplo fp16 en producción con GPU y int8 en entornos restringidos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad de imagen (FID, CLIP score u otros) en la información disponible. La model card solo incluye métricas de fidelidad numérica frente a fp32:

| Precision | Componente | Error RMS relativo vs fp32 |
|---|---|---|
| fp16 | text encoder | 0,29 % |
| fp16 | transformer | 0,87 % |
| fp16 | VAE decoder | 0,11 % |
| fp16 | VAE encoder | 0,10 % |
| bf16 | text encoder | 1,9 % |
| bf16 | transformer | 4,2 % |
| int8 | text encoder | 1,8 % |
| int8 | transformer | 2,5 % |
| int4 | text encoder | 13 % |
| int4 | transformer | no disponible (tabla truncada) |

## Requisitos de hardware

- VRAM estimada: el transformer ocupa 7,75 GB en fp16 y bf16, 4,28 GB en int8 y un valor no disponible en int4 (la tabla de la model card está truncada). El text encoder ocupa 6,23 GB en fp16 y bf16, 3,67 GB en int8 y 2,35 GB en int4. Sumando VAE (0,17 GB) y los grafos, el pico en fp16 supera los 14 GB si se cargan todos los componentes a la vez.
- GPU recomendadas: no se especifican en la model card. Por volumen de pesos, una GPU con 16 GB o más (RTX 4080/4090, A100, H100) permite fp16 con todos los componentes residentes; con 8 GB es necesario usar int8 o int4 y descargar componentes por fases.
- Cabe en GPU de consumo: sí, en variantes int8 e int4 con gestión por fases; en fp16 requiere GPUs de gama alta con 16 GB o más.
- Opciones de despliegue: ONNX Runtime con ejecución CUDA, DirectML o CPU. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de datos de rendimiento del modelo base FLUX.2 Klein 4B ni de alternativas comparables en la información proporcionada, por lo que la comparación cuantitativa no está disponible. A nivel estructural:

| Modelo | Parametros | Formato | Licencia | Notas |
|---|---|---|---|---|
| FLUX.2 Klein 4B ONNX (este) | 4B | ONNX (fp16/bf16/int8/int4) | Apache 2.0 | Conversión para ONNX Runtime (CUDA/DirectML/CPU) |
| FLUX.2 Klein 4B (original) | 4B | PyTorch | Apache 2.0 | Requiere stack PyTorch y GPU CUDA |
| Alternativas de difusión texto-a-imagen de tamano similar | no disponible | no disponible | no disponible | Sin datos en la información proporcionada |

## Limitaciones y advertencias

- El error RMS del text encoder en int4 alcanza el 13 %, muy superior al resto de precisiones, por lo que puede degradar la fidelidad de la generación respecto a la ejecución en fp32.
- La tabla de la model card está truncada: no se dispone del error del transformer en int4 ni de los tamaños de sus archivos, lo que impide evaluar por completo esa variante.
- Cada carpeta de precisión debe mantenerse íntegra: los pesos viven en archivos `*.onnx.data` junto a cada grafo y mover archivos entre carpetas rompe el modelo.
- Los VAE encoder y decoder están siempre en fp16 (mismo hash en todas las carpetas), por lo que la reducción de memoria en int8/int4 solo afecta a text encoder y transformer.
- No se documentan sesgos, idiomas soportados ni riesgos de alucinación específicos; al ser un modelo de difusión, las limitaciones típicas son de fidelidad visual y sesgos del dataset de entrenamiento original, del cual no hay información.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las condiciones del modelo base FLUX.2 Klein 4B por si imponen restricciones adicionales.
- El repositorio tiene 0 descargas y 0 likes, y fue creado en 2026-11-12; es un artefacto reciente sin validación comunitaria documentada.
- No se documentan requisitos de memoria ni latencias, lo que obliga a medirlos empíricamente antes de un despliegue en producción.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/moonbox-ai/FLUX.2-klein-4B-ONNX
- Modelo base: https://huggingface.co/black-forest-labs/FLUX.2-klein-4B
