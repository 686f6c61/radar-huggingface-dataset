# cfahlgren1/MiniT2I-B-16-MF-compact-webgpu

## Resumen

MiniT2I-B-16-MF-compact-webgpu es una exportación a ONNX del modelo de generación de imágenes texto-a-imagen MiniT2I-B-16-MF-compact, publicada por cfahlgren1. El modelo original es un fine-tune compacto de MiniT2I, una familia de modelos de difusión por flujo medio (mean flow) desarrollada por los autores de MiniT2I y adaptada por lox9973. Esta versión está específicamente empaquetada para ejecutarse en el navegador mediante onnxruntime-web sobre WebGPU, lo que la convierte en una opción poco habitual para inferencia de difusión en cliente sin servidor.

La relevancia de esta ficha radica en su enfoque de despliegue: un único grafo ONNX que integra el codificador de texto T5 y los cuatro pasos de muestreo Mean Flow, de modo que una sola llamada a `session.run` recibe un prompt tokenizado y un tensor de ruido y devuelve una imagen RGB de 512 × 512. El repositorio ocupa 0,6 GB y los pesos se almacenan en fp16, con un grafo de 2,1 MB y un fichero de datos externo de 614 MB.

El modelo está pensado para demostraciones interactivas en el navegador, prototipado rápido y aplicaciones donde la privacidad o la ausencia de backend justifican ejecutar la generación en el dispositivo del usuario. La licencia MIT facilita su integración, aunque el rendimiento y la fidelidad en WebGPU presentan diferencias medibles respecto a la pipeline original en PyTorch fp32.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusión texto-a-imagen con muestreo Mean Flow (4 pasos), codificador de texto T5 y transformer de imagen; exportado como grafo ONNX (opset 17) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 256 tokens de texto de entrada (T5 token ids, con padding) |
| Tipos de cuantizacion | Pesos en fp16; cómputo mixto: codificador T5 en fp32, transformer de imagen en fp16 |
| Idiomas soportados | no disponible (tokenizador T5 Unigram; el modelo card no detalla cobertura lingüística) |
| Licencia | MIT |
| Formato de pesos | ONNX (`minit2i.onnx` + `minit2i.onnx.data` en fp16) |

## Arquitectura y entrenamiento

La arquitectura subyacente es un modelo de difusión texto-a-imagen basado en Mean Flow, una variante de muestreo que reduce el número de pasos necesarios. En esta exportación, el codificador de texto T5 y los cuatro pasos de muestreo están fusionados en un único grafo ONNX, con la escala de guía (12), el intervalo de guía ([0,2, 0,8]) y los cuatro pasos fijados como constantes dentro del grafo, coincidiendo con los valores por defecto del modelo original. El transformer de imagen emplea atención con matmul en lugar de einsum y RMSNorm seguro frente a desbordamiento, que divide por el máximo absoluto de la fila antes de elevar al cuadrado para evitar el overflow de fp16 en activaciones que alcanzan ~12.000.

La conversión aplica precisión mixta: el codificador T5 se ejecuta en fp32 porque sus estados ocultos alcanzan ~286.000, por encima del límite de fp16 (65.504), aunque sus pesos se almacenan en fp16 y se convierten al cargar. Se precalculan como constantes las tablas de RoPE, los embeddings de posición 2D, el sesgo de posición relativa de T5 y los tokens fijos de timestep, guía e intervalo. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de RLHF o DPO en la información proporcionada.

## Capacidades

- Generación de imágenes texto-a-imagen a 512 × 512 píxeles a partir de un prompt tokenizado.
- Ejecución completa en el navegador mediante onnxruntime-web y WebGPU, sin backend servidor.
- Inferencia en un único `session.run` que integra codificador de texto y muestreo (cuatro pasos Mean Flow).
- Tokenizador T5 Unigram incluido (`tokenizer.ts`, sin dependencias) para uso en el navegador.
- Salida RGB en rango aproximado [-1, 1], con conversión a píxeles mediante `clamp(x, -1, 1) × 127.5 + 128`.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión de entrada, audio ni modo thinking.

## Casos de uso

- Demostraciones interactivas en navegador: la Space `cfahlgren1/imagine` y aplicaciones similares pueden generar imágenes a partir de un prompt sin backend, usando WebGPU y el tokenizador incluido, lo que reduce costes de infraestructura y latencia de red.
- Prototipado de interfaces creativas: diseñadores pueden integrar generación de imágenes 512 × 512 en herramientas web para explorar variaciones visuales rápidas, con ~0,5 s por imagen en Chrome sobre Apple M3 Max.
- Aplicaciones con requisitos de privacidad: al ejecutarse en el dispositivo del usuario, el prompt y la imagen no salen del navegador, lo que resulta adecuado para entornos con datos sensibles.
- Educación y divulgación: permite mostrar el funcionamiento de un pipeline de difusión completo (tokenización T5, ruido, cuatro pasos Mean Flow) en un único grafo ONNX inspeccionable.
- Pruebas de integración ONNX/WebGPU: sirve como referencia para validar exportaciones con precisión mixta, RMSNorm seguro y tablas precalculadas en onnxruntime-web.
- Generación de recursos de baja resolución para mockups o placeholders en aplicaciones web, donde la fidelidad fina es secundaria frente a la velocidad y la ausencia de servidor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card proporciona métricas de fidelidad y velocidad frente a la pipeline original en PyTorch fp32 con los mismos prompts y ruido:

| Entorno | Diferencia absoluta media de píxel (sobre 255) | Notas |
|---|---|---|
| onnxruntime CPU | 0,02–0,06 | Muy cercano al original fp32 |
| Chrome WebGPU | 8–13 | La composición y el sujeto coinciden; los detalles finos pueden diferir por acumulación de fp16 en cuatro pasos |
| Velocidad (Chrome, Apple M3 Max) | ~0,5 s por imagen | Incluye tokenización y lectura de la imagen |

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el fichero de pesos ocupa 614 MB en fp16 y el grafo 2,1 MB, por lo que la huella de memoria es moderada, pero no se detalla el consumo en GPU.
- GPU recomendadas: no disponible; el modelo está orientado a WebGPU en navegador, y se ha medido en Apple M3 Max con Chrome.
- Compatibilidad con GPU de consumo: no se especifica; al ejecutarse vía WebGPU, depende del soporte del navegador y del dispositivo, no de CUDA.
- Opciones de despliegue: onnxruntime-web con execution provider `webgpu`; también se ha medido en onnxruntime CPU.
- Latencia y throughput: ~0,5 s por imagen en Chrome sobre Apple M3 Max, incluyendo tokenización y lectura de la imagen; no se proporcionan cifras de throughput para otras GPU.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de rendimiento ni especificaciones de modelos comparables de la misma categoría (difusión texto-a-imagen compacta ejecutable en navegador), por lo que no es posible establecer una comparativa rigurosa sin inventar cifras.

## Limitaciones y advertencias

- Fidelidad en WebGPU reducida: la diferencia media de píxel de 8–13 sobre 255 indica que los detalles finos pueden diferir de la pipeline original fp32 por acumulación de errores fp16 en los cuatro pasos.
- Parámetros de muestreo fijos: la escala de guía (12), el intervalo de guía ([0,2, 0,8]) y los cuatro pasos están embebidos en el grafo, por lo que no se pueden ajustar sin reexportar el modelo.
- Resolución fija de 512 × 512 y entrada de texto limitada a 256 tokens T5.
- Cobertura lingüística no documentada; el tokenizador es T5 Unigram, pero no se detallan los idiomas soportados.
- Dependencia de WebGPU: el rendimiento y la compatibilidad varían según navegador y dispositivo; no se garantiza funcionamiento en todos los entornos.
- Riesgo de sesgos y alucinación visual inherente al modelo original; la model card no documenta evaluaciones de sesgo ni salvaguardas.
- Licencia MIT: permite uso comercial, pero se conserva el aviso upstream en `LICENSE-MiniT2I.txt`, que debe mantenerse.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; madurez y soporte comunitario limitados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/cfahlgren1/MiniT2I-B-16-MF-compact-webgpu
- Modelo base: https://huggingface.co/lox9973/MiniT2I-B-16-MF-compact
- Demo en navegador (Space): https://huggingface.co/spaces/cfahlgren1/imagine
- Documentación de onnxruntime-web: https://onnxruntime.ai/docs/tutorials/web/
- Página del proyecto MiniT2I: https://peppaking8.github.io/minit2i/
