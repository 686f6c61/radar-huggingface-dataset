# moonbox-dev/FLUX.2-klein-4B-ONNX

## Resumen

FLUX.2 Klein 4B ONNX es una conversión a formato ONNX del modelo de difusión texto-a-imagen FLUX.2 Klein 4B, desarrollado originalmente por Black Forest Labs y empaquetado por moonbox-dev para su uso en dispositivos locales mediante ONNX Runtime. El modelo original pertenece a la familia FLUX.2, orientada a generación y edición de imágenes, y esta variante concreta resuelve el problema de desplegar el modelo fuera del ecosistema PyTorch, permitiendo inferencia en CUDA, DirectML y CPU.

La conversión incluye cuatro precisiones (fp16, bf16, int8 e int4) y descompone el pipeline en cuatro grafos independientes: text encoder, transformer, VAE decoder y VAE encoder. Cada grafo se acompaña de sus pesos como datos externos ONNX (`*.onnx.data`), lo que obliga a mantener juntos los ficheros de una misma carpeta de precisión. El repositorio ocupa 41 GB en total.

La relevancia de esta ficha radica en que ofrece una vía práctica para ejecutar un modelo de difusión de 4B parámetros en hardware de consumo y en plataformas Windows mediante DirectML, algo que las distribuciones nativas en PyTorch dificultan. La licencia Apache 2.0 del empaquetado facilita su integración en productos comerciales, aunque conviene verificar las condiciones del modelo base original.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Modelo de difusión (pipeline con text encoder, transformer y VAE encoder/decoder); detalles internos del transformer no disponibles |
| Parámetros totales | 4B (según el nombre del modelo base) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | fp16, bf16, int8, int4 |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX con datos externos (`*.onnx.data`) |
| Tamaño del repositorio | 41,0 GB |
| Librería | ONNX Runtime (CUDA, DirectML, CPU) |
| Pipeline | text-to-image (incluye image-editing según tags) |

## Arquitectura y entrenamiento

El modelo base FLUX.2 Klein 4B es un modelo de difusión para generación y edición de imágenes. La conversión a ONNX separa el pipeline en cuatro componentes: un text encoder (6,23 GB en fp16/bf16, 3,67 GB en int8, 2,35 GB en int4), un transformer (7,75 GB en fp16/bf16, 4,28 GB en int8), un VAE decoder (0,10 GB) y un VAE encoder (0,07 GB). El VAE se mantiene en el grafo fp16 en todas las precisiones, según los hashes sha256 repetidos en la tabla del autor.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO, ya que la model card del empaquetado no los detalla y no se han proporcionado datos del modelo base. La innovación técnica destacable de esta variante es la conversión fiel a ONNX con validación cuantitativa: el autor reporta el error RMS relativo frente a la ejecución en fp32 del modelo PyTorch original para cada grafo, con valores de 0,10–0,29 % en fp16, 0,11–4,2 % en bf16, 0,10–2,5 % en int8 y hasta un 13 % en el text encoder int4.

## Capacidades

- Generación de imágenes a partir de texto (text-to-image), según el pipeline declarado.
- Edición de imágenes, según los tags del repositorio, aunque la model card no detalla el flujo de edición.
- Inferencia en dispositivos locales mediante ONNX Runtime con backends CUDA, DirectML y CPU.
- Ejecución en cuatro precisiones distintas, lo que permite ajustar el equilibrio entre calidad y consumo de memoria.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni procesamiento de audio o vídeo.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Generación de imágenes en aplicaciones de escritorio Windows: el soporte de DirectML en ONNX Runtime permite ejecutar el modelo sin GPU NVIDIA, integrándolo en aplicaciones nativas que no dependen de CUDA.
- Prototipado rápido en portátiles con GPU de consumo: la variante int4 reduce el text encoder a 2,35 GB y el transformer a 4,28 GB, lo que facilita pruebas en equipos con VRAM limitada.
- Despliegue en servidores sin PyTorch: al ser grafos ONNX, se puede integrar en infraestructuras basadas en ONNX Runtime sin arrastrar el stack de PyTorch.
- Edición de imágenes en pipelines de preprocesado: el VAE encoder incluido permite codificar imágenes de entrada, habilitando flujos de image-to-image o edición según los tags del repositorio.
- Generación de contenido en entornos con requisitos de licencia permisiva: la licencia Apache 2.0 del empaquetado facilita su incorporación en productos comerciales, previa verificación del modelo base.
- Evaluación comparativa de precisiones: los errores RMS reportados permiten seleccionar la precisión adecuada según la tolerancia de calidad del caso de uso (por ejemplo, int8 con 2,5 % de error en el transformer frente a int4 con 13 % en el text encoder).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor únicamente reporta errores RMS relativos frente a fp32 por grafo y precisión, que se recogen en la tabla siguiente:

| Precisión | Text encoder (error RMS) | Transformer (error RMS) | VAE decoder | VAE encoder |
|---|---|---|---|---|
| fp16 | 0,29 % | 0,87 % | 0,11 % | 0,10 % |
| bf16 | 1,9 % | 4,2 % | 0,11 % (grafo fp16) | 0,10 % (grafo fp16) |
| int8 | 1,8 % | 2,5 % | 0,11 % (grafo fp16) | 0,10 % (grafo fp16) |
| int4 | 13 % | No disponible en el extracto | 0,11 % (grafo fp16) | 0,10 % (grafo fp16) |

## Requisitos de hardware

- VRAM estimada para inferencia: en fp16/bf16, la suma de pesos ronda los 14,2 GB (6,23 + 7,75 + 0,10 + 0,07 GB), por lo que se necesita una GPU con al menos 16 GB para mantener todo el pipeline en memoria. En int8, la suma baja a unos 8,1 GB; en int4, a unos 6,8 GB (sin contar el transformer int4, cuyo tamaño no figura en el extracto).
- GPU recomendadas: para fp16/bf16, A100, H100 o RTX 4090 (24 GB). Para int8, RTX 4080/4090 o A10G. Para int4, GPUs de 8–12 GB como RTX 3060/4060 Ti.
- Cabe en GPU de consumo: sí, especialmente en int8 e int4; en fp16 requiere modelos de gama alta con 16 GB o más.
- Opciones de despliegue: ONNX Runtime con execution providers CUDA, DirectML y CPU. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a modelos de difusión en ONNX.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| FLUX.2 Klein 4B ONNX (este) | 4B | No disponible | ONNX (fp16, bf16, int8, int4) | Apache 2.0 | Hugging Face, 0 descargas |
| FLUX.2 Klein 4B (original) | 4B | No disponible | PyTorch (safetensors presumiblemente) | No disponible en la información | Hugging Face (black-forest-labs) |
| Otros modelos de difusión de 4B | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- El repositorio no registra descargas ni likes, lo que indica que es una conversión reciente y sin validación comunitaria amplia.
- El error del text encoder en int4 alcanza el 13 % frente a fp32, un valor alto que puede degradar la fidelidad de la generación respecto al prompt; se recomienda validar la calidad de imagen antes de usar int4 en producción.
- La model card no documenta sesgos, riesgos de alucinación visual ni limitaciones idiomáticas del modelo base.
- No se detalla el flujo de edición de imágenes pese a estar etiquetado; su uso práctico requeriría consultar la documentación del modelo base.
- La licencia Apache 2.0 se aplica al empaquetado ONNX, pero conviene verificar las condiciones del modelo base black-forest-labs/FLUX.2-klein-4B antes de un uso comercial.
- Los ficheros de pesos externos (`*.onnx.data`) deben mantenerse junto a su grafo correspondiente; mover un solo fichero rompe la carga del modelo.
- El tamaño del transformer en int4 no figura en el extracto de la model card, por lo que la estimación de VRAM para esa precisión es parcial.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/moonbox-dev/FLUX.2-klein-4B-ONNX
- Modelo base: https://huggingface.co/black-forest-labs/FLUX.2-klein-4B
- Ficheros de ejemplo citados en la model card (rutas del repositorio del autor): https://huggingface.co/moonbox-ai/FLUX.2-klein-4B-ONNX/blob/main/fp16/text_encoder/model.onnx
