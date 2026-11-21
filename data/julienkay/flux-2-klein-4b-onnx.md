# julienkay/FLUX.2-klein-4B-onnx

## Resumen

FLUX.2-klein-4B-onnx es una conversión no oficial a formato ONNX del modelo FLUX.2 [klein] 4B, un modelo de texto-a-imagen desarrollado originalmente por Black Forest Labs. La conversión ha sido realizada por el usuario julienkay y está pensada específicamente para su uso en Unity mediante Unity Inference Engine (Sentis). El modelo base pertenece a la familia FLUX.2, una evolución de los modelos FLUX de generación de imágenes, en su variante "klein" de 4B de parámetros, presumiblemente una versión compacta orientada a inferencia eficiente.

El repositorio contiene los tres componentes del pipeline (codificador de texto, transformer y decodificador VAE) exportados en ONNX opset 18 con pesos en float32, sumando aproximadamente 28,2 GB en disco. La conversión preserva la licencia Apache 2.0 del modelo original y está etiquetada con el pipeline text-to-image. Es relevante para desarrolladores que quieran integrar generación de imágenes FLUX.2 dentro de aplicaciones Unity sin depender de un entorno Python en tiempo de ejecución.

La validación reportada compara ONNX Runtime en CPU contra PyTorch float32, con diferencias máximas absolutas de 7,8e-3 en el codificador de texto, 1,4e-4 en el transformer y 1,0e-5 en el VAE. El repositorio no incluye datos sobre idiomas soportados ni benchmarks de calidad de generación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusión (familia FLUX.2, componente transformer) con codificador de texto y VAE decoder |
| Parametros totales | 4B (según el nombre del modelo base) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (secuencia de texto dinámica; embeddings de 7680 dimensiones) |
| Tipos de cuantizacion | float32 en el export; cuantización uint8 en tiempo de carga mediante `QuantizationType.Uint8` de Unity Inference Engine |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (opset 18) con datos externos en `model.onnx.data` |

## Arquitectura y entrenamiento

El modelo base FLUX.2 [klein] 4B es un modelo de difusión para generación de imágenes de la familia FLUX.2 de Black Forest Labs, en su variante de 4B parámetros. La conversión ONNX separa el pipeline en tres grafos independientes: un codificador de texto que produce embeddings de prompt de 7680 dimensiones apilando estados ocultos de las capas 9, 18 y 27; un transformer que recibe latents de imagen (128 canales), embeddings de texto, timestep e identificadores posicionales (`img_ids` y `txt_ids`) y predice `out_sample`; y un decodificador VAE que revierte la normalización por lotes de los latents y los "despatchifica" antes de decodificar a una imagen RGB de 16 veces la resolución del latent.

El export se realizó con `tools/flux2/flux2_onnx.py` de tools.doji.diffusers (commit `5b0354958cbe0cd92eb3888335f3e96005b849c2`), usando torch 2.15.0+cpu, diffusers 0.43.0, transformers 5.23.0, onnx 1.23.2, onnxscript 0.7.2 y onnx_ir 1.1.0. El script construye el codificador de texto y el transformer con `init_empty_weights`, sustituye los parámetros por tensores falsos float32 en CPU y los traza con `torch.onnx.export(dynamo=True, optimize=False)`. Los inicializadores falsos se reemplazan por tensores lazy que leen los safetensors de origen bajo demanda, de modo que el export nunca mantiene todos los pesos del pipeline en RAM. Se añaden sesgos cero donde los nodos `LayerNormalization` carecen de ellos, por compatibilidad con Unity Inference Engine 2.6.

No se dispone de información sobre el dataset de entrenamiento, número de tokens, composición de datos ni uso de RLHF/DPO en la información proporcionada.

## Capacidades

- Generación de imágenes a partir de prompts de texto (pipeline text-to-image).
- Inferencia en Unity mediante Unity Inference Engine 2.6.1 y la clase `Flux2KleinPipeline` de tools.doji.diffusers.
- Cuantización de pesos en tiempo de carga (uint8) para el codificador de texto y el transformer, con VAE decoder en float32.
- Dimensiones dinámicas nombradas en las entradas (batch y secuencia), salvo la dimensión de batch de salida del transformer, fijada a 1 en el grafo ONNX.
- Generación con pocos pasos: la validación usa 4 pasos de muestreo con guidance scale de 1.
- Soporte de resolución de salida configurable (el test valida 512 × 512).
- Tool calling, agentes, razonamiento multi-paso, visión, audio y capacidades multilingües: no disponible (no es un modelo de lenguaje).

## Casos de uso

- Generación de imágenes dentro de aplicaciones Unity: el pipeline ONNX se carga con `Flux2KleinPipeline` y permite crear imágenes a partir de prompts directamente en el runtime de Unity, sin depender de Python ni de servicios externos.
- Prototipado de assets en videojuegos: con 4 pasos de muestreo y guidance 1, el modelo puede generar bocetos de personajes, entornos o elementos de UI durante el desarrollo, a 512 × 512 y superiores.
- Herramientas de creación in-editor: integración en editores de Unity para generar texturas o referencias visuales a partir de descripciones textuales, aprovechando la cuantización uint8 en carga para reducir el consumo de memoria.
- Aplicaciones de escritorio con generación local: al ser ONNX, puede ejecutarse con ONNX Runtime en CPU (validado) o con Unity Inference Engine, útil para escenarios sin GPU dedicada o con requisitos de privacidad de datos.
- Pipelines de contenido por lotes: la dimensión de batch dinámica del codificador de texto y del VAE permite procesar varios prompts o latents por invocación (el transformer queda limitado a batch 1 en el grafo exportado).
- Investigación y reproducibilidad: la separación en tres grafos con validación numérica frente a PyTorch float32 facilita comparaciones y auditorías de la conversión ONNX frente al modelo original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La única validación reportada es numérica, comparando ONNX Runtime en CPU con PyTorch float32:

| Componente | Diferencia absoluta máxima | Valor de referencia absoluto máximo aproximado |
|---|---:|---:|
| Codificador de texto | 7,8e-3 | 1,0e4 |
| Transformer | 1,4e-4 | 3,7 |
| Decodificador VAE | 1,0e-5 | 0,94 |

## Requisitos de hardware

- Los pesos float32 ocupan aproximadamente 26 GiB (28,2 GB en disco), por lo que la inferencia sin cuantización requiere del orden de 26 GB de memoria o VRAM.
- La cuantización uint8 en tiempo de carga (codificador de texto y transformer) reduce el uso de memoria; el VAE decoder permanece en float32.
- GPU recomendadas: no disponible en la información proporcionada. La validación se realizó en CPU con ONNX Runtime y con Unity Inference Engine 2.6.1.
- ¿Cabe en GPU consumer? No disponible como dato explícito; con cuantización uint8 podría ser viable en GPUs de 24 GB o más, pero no se confirma en la documentación.
- Opciones de despliegue: ONNX Runtime (CPU validado), Unity Inference Engine 2.6.1 con `Flux2KleinPipeline` y `OnnxModelLoader.Load(path, QuantizationType.Uint8)`. vLLM, llama.cpp, Ollama o TGI no aplican a este formato.
- Latencia y throughput: no disponible. El test de Unity usó 4 pasos, guidance scale 1, semilla 42 y salida de 512 × 512, sin reportar tiempos.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| FLUX.2-klein-4B-onnx (este) | 4B | no disponible | ONNX (float32, cuantización uint8 en carga) | Apache 2.0 | Hugging Face, orientado a Unity |
| black-forest-labs/FLUX.2-klein-4B (original) | 4B | no disponible | safetensors (presumible) | Apache 2.0 | Hugging Face |
| Otras variantes FLUX.2 | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Conversión no oficial: el autor original del modelo es Black Forest Labs; esta versión ONNX es una modificación de terceros y puede divergir del comportamiento del modelo original.
- La dimensión de batch de salida del transformer está fijada a 1 en el grafo ONNX, lo que limita el procesamiento por lotes en esa etapa.
- El export usa `optimize=False` y añade sesgos cero a nodos `LayerNormalization` por compatibilidad con Unity Inference Engine 2.6; estos ajustes pueden afectar la fidelidad numérica en otros runtimes.
- El codificador de texto y el transformer necesitan cuantización uint8 en carga para reducir memoria; sin ella, los ~26 GiB de pesos float32 pueden exceder la memoria disponible en muchos entornos.
- Riesgo de sesgos y alucinaciones visuales: no disponible en la información proporcionada; se heredan los del modelo base FLUX.2 [klein] 4B.
- Idiomas soportados: no disponible; no se confirma el comportamiento multilingüe de los prompts.
- Licencia Apache 2.0: permite uso comercial, pero debe conservarse el aviso de licencia y atribución; el repositorio incluye `LICENSE.md`.
- No hay benchmarks de calidad de imagen publicados en la información disponible, por lo que no se puede evaluar la fidelidad del resultado frente al modelo original.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: poca validación comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/julienkay/FLUX.2-klein-4B-onnx
- Modelo base original: https://huggingface.co/black-forest-labs/FLUX.2-klein-4B
- Repositorio de herramientas de conversión: https://github.com/julienkay/com.doji.diffusers
- Licencia: https://huggingface.co/julienkay/FLUX.2-klein-4B-onnx/blob/main/LICENSE.md
