# cfahlgren1/MiniT2I-B-16-MF-compact-webgpu-int8

## Resumen

MiniT2I-B-16-MF-compact-webgpu-int8 es una exportación ONNX del modelo de generación de imágenes texto-a-imagen lox9973/MiniT2I-B-16-MF-compact, publicada por el usuario cfahlgren1. Se trata de una conversión orientada a ejecución en navegador mediante onnxruntime-web sobre WebGPU, con pesos cuantizados a int8 y un único grafo que incluye el codificador de texto T5 y los cuatro pasos de muestreo Mean Flow. El modelo resuelve el problema de desplegar generación de imágenes sin servidor, directamente en el cliente, reduciendo la descarga de pesos de 617 MB (fp16) a 313 MB (int8).

La arquitectura subyacente combina un codificador de texto T5 con un transformer de imagen que opera sobre ruido gaussiano de forma [1, 3, 512, 512] y produce una imagen RGB de 512 × 512 en una sola llamada a `session.run`. La innovación principal es el muestreo Mean Flow con cuatro pasos fijos, junto con la escala de guía 12 y el intervalo de guía [0.2, 0.8], todos ellos horneados dentro del grafo.

Su relevancia actual radica en que demuestra un pipeline completo de difusión texto-a-imagen ejecutándose en el navegador con latencias de 0,55 s por imagen en Chrome sobre un Apple M3 Max, sin dependencia de backend y con licencia MIT. El repositorio ocupa 0,9 GB e incluye el tokenizador T5 sin dependencias y los scripts de exportación y cuantización.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de imagen con muestreo Mean Flow (4 pasos) + codificador de texto T5, exportado a ONNX (opset 17) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 256 tokens de texto (input_ids de forma [1, 256]) |
| Tipos de cuantizacion | Pesos int8 (una escala por columna de salida), desquantizados a fp16 dentro del grafo; encoder T5 en fp32, transformer de imagen en fp16 |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | ONNX (`minit2i.onnx` + `minit2i.onnx.data`), tokenizador en `vocab.json` y `tokenizer.ts` |
| Resolucion de salida | 512 × 512 RGB |
| Tamano del repo | 0,9 GB (pesos int8: 310 MB; grafo: 2,3 MB) |
| Pasos de muestreo | 4 (fijos en el grafo) |
| Escala de guia | 12, intervalo [0.2, 0.8] (fijos en el grafo) |

## Arquitectura y entrenamiento

El modelo original MiniT2I emplea una arquitectura de generación texto-a-imagen basada en Mean Flow, un paradigma de muestreo que aproxima el flujo medio entre distribuciones en un número reducido de pasos. En esta exportación concreta, el grafo ONNX integra el codificador de texto T5 y el transformer de imagen en una sola unidad ejecutable: una llamada a `session.run` recibe `input_ids`, `attention_mask` y un tensor de ruido, y devuelve directamente la imagen final. El muestreo se fija en cuatro pasos, con escala de guía 12 e intervalo [0.2, 0.8], coincidiendo con los valores por defecto del modelo upstream.

La conversión aplica varias optimizaciones técnicas. Los pesos de todas las matmul y la tabla de embeddings de T5 se almacenan en int8 con una escala por columna de salida, y `DequantizeLinear` los devuelve a fp16 dentro del grafo, de modo que solo se reduce el tamaño de descarga sin alterar la aritmética. El encoder T5 se ejecuta en fp32 porque sus estados ocultos alcanzan ~286.000, por encima del límite de fp16 (65.504), aunque sus pesos se guardan en fp16 y se convierten al cargar. El transformer de imagen opera en fp16, con una variante de RMSNorm segura frente a desbordamiento que divide por el máximo absoluto de la fila antes de elevar al cuadrado (las activaciones alcanzan ~12.000). Además, los ángulos RoPE, los embeddings de posición 2D, el sesgo de posición relativa de T5 y los tokens fijos de timestep, guía e intervalo se precalculan como constantes, y la atención se implementa con matmul en lugar de `einsum`.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en el modelo original.

## Capacidades

- Generación de imágenes texto-a-imagen a 512 × 512 píxeles a partir de un prompt codificado con el tokenizador T5 (máximo 256 tokens).
- Ejecución completa en navegador mediante onnxruntime-web con aceleración WebGPU, sin backend ni servidor.
- Pipeline autocontenido: tokenización T5, codificación de texto, muestreo Mean Flow en cuatro pasos y decodificación de imagen en un único grafo ONNX.
- Tokenizador T5 Unigram sin dependencias (`tokenizer.ts`) para su uso directo en el cliente.
- Control determinista mediante el tensor de ruido de entrada, lo que permite reproducir resultados fijando la semilla.
- Cuantización int8 con precisión prácticamente equivalente a fp16 (diferencia media de píxel de 2,9 sobre 255, ~34 dB PSNR).
- No soporta tool calling, agentes, razonamiento multi-paso ni otras capacidades de lenguaje; es exclusivamente un modelo de imagen.

## Casos de uso

- Generación de imágenes en el navegador sin backend: aplicaciones web que producen ilustraciones o avatares a partir de texto usando WebGPU, sin enviar prompts a un servidor y con latencias de ~0,55 s por imagen en hardware de gama alta.
- Herramientas de edición creativa en cliente: integración en editores o lienzos web donde el usuario escribe una descripción y obtiene una imagen de 512 × 512 al instante, aprovechando el tokenizador incluido y el grafo único.
- Demos y prototipos de investigación: validación rápida de pipelines texto-a-imagen en entornos sin GPU dedicada, ya que el modelo corre en el navegador sobre la GPU del usuario.
- Aplicaciones offline o de privacidad estricta: al ejecutarse íntegramente en el cliente, los prompts no salen del dispositivo, lo que encaja en escenarios con requisitos de confidencialidad.
- Generación de contenido para prototipado de UI/UX: creación de placeholders o mockups visuales a partir de descripciones textuales dentro de herramientas de diseño web.
- Educación y divulgación: demostraciones interactivas de modelos de difusión en el navegador (el Space cfahlgren1/imagine sirve como ejemplo), con coste de infraestructura nulo para el proveedor.
- Integración en aplicaciones Electron o PWA: al ser ONNX y ejecutarse con onnxruntime-web, puede empaquetarse en aplicaciones de escritorio basadas en web que necesiten generación de imágenes local.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, dado que se trata de un modelo de generación de imágenes y no de lenguaje. La model card proporciona métricas de fidelidad y velocidad frente al pipeline PyTorch fp32 original:

| Metrica | Valor |
|---|---|
| Diferencia absoluta media de pixel (onnxruntime CPU) | 0,02–0,06 sobre 255 |
| Diferencia absoluta media de pixel (Chrome WebGPU) | 8–13 sobre 255 |
| Diferencia int8 vs fp16 (8 prompts, mismas semillas) | 2,9 sobre 255 (~34 dB PSNR) |
| Latencia por imagen (Chrome, Apple M3 Max) | ~0,55 s (incluye tokenización y lectura) |
| Latencia por imagen (Firefox 160) | ~2,1 s |
| Velocidad int8 vs fp16 | Igual |

## Requisitos de hardware

- VRAM estimada: los pesos int8 ocupan 310 MB y el grafo 2,3 MB; el consumo real depende del backend WebGPU y de los buffers intermedios en fp16/fp32, no especificados en la información disponible.
- GPU recomendadas: cualquier GPU compatible con WebGPU; se han medido tiempos en Apple M3 Max (Chrome) y Firefox 160, sin datos de GPUs NVIDIA o AMD concretas.
- Cabe en GPUs de consumo: sí, dado el reducido tamaño de pesos (313 MB); se espera que funcione en GPUs integradas y dedicadas de gama media con soporte WebGPU, aunque no se aportan cifras específicas.
- Opciones de despliegue: onnxruntime-web con execution provider `webgpu` (navegador); también se ha medido en onnxruntime CPU con mayor fidelidad y menor velocidad.
- Latencia y throughput: ~0,55 s por imagen en Chrome sobre Apple M3 Max y ~2,1 s en Firefox 160; no se dispone de datos de throughput en otras plataformas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Resolucion | Licencia | Despliegue |
|---|---|---|---|---|---|
| MiniT2I-B-16-MF-compact-webgpu-int8 (este) | no disponible | 256 tokens | 512 × 512 | MIT | Navegador (WebGPU, ONNX) |
| lox9973/MiniT2I-B-16-MF-compact (upstream) | no disponible | 256 tokens | 512 × 512 | MIT | PyTorch, fp32 |
| Otros modelos texto-a-imagen de difusión (p. ej. Stable Diffusion) | no disponible en esta ficha | no disponible | variable | variable | Servidor/GPU, no navegador |

La comparación directa con alternativas de la misma categoría (generación texto-a-imagen ejecutable en navegador) no está disponible en la información proporcionada. El modelo upstream es la referencia natural, del que este se diferencia por la cuantización int8, el empaquetado ONNX y la ejecución en cliente.

## Limitaciones y advertencias

- Solo genera imágenes de 512 × 512; no admite otras resoluciones ni tareas de lenguaje, visión o audio.
- La longitud de prompt está limitada a 256 tokens T5; prompts más largos deben truncarse.
- Los parámetros de muestreo (4 pasos, guía 12, intervalo [0.2, 0.8]) están fijados en el grafo y no son configurables en tiempo de ejecución.
- En WebGPU la fidelidad baja respecto a CPU: la diferencia media de píxel es de 8–13 sobre 255, y los detalles finos pueden diferir por la aritmética fp16 acumulada en los cuatro pasos.
- Riesgo de alucinación visual y de desviación semántica respecto al prompt, inherente a los modelos de difusión; no se documentan sesgos específicos.
- Idiomas soportados no documentados; el tokenizador es T5 Unigram, pero no se garantiza calidad multilingüe.
- La licencia MIT permite uso comercial, pero se conserva el aviso upstream en `LICENSE-MiniT2I.txt`; conviene revisar los términos del modelo base.
- Depende de soporte WebGPU en el navegador; la latencia varía notablemente entre navegadores (0,55 s en Chrome frente a 2,1 s en Firefox 160 en el mismo hardware).
- Repositorio con 0 descargas y 0 likes en el momento de la consulta, lo que indica escasa validación por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/cfahlgren1/MiniT2I-B-16-MF-compact-webgpu-int8
- Modelo base: https://huggingface.co/lox9973/MiniT2I-B-16-MF-compact
- Space de demostración: https://huggingface.co/spaces/cfahlgren1/imagine
- Página del proyecto MiniT2I: https://peppaking8.github.io/minit2i/
- Documentación de onnxruntime-web: https://onnxruntime.ai/docs/tutorials/web/
