# fastforks/tipsv2

## Resumen

TIPSv2 es una familia de codificadores de imagen (image encoders) basados en Vision Transformer (ViT) desarrollada por Google DeepMind y presentada en CVPR 2026. El modelo se preentrena con pares texto-imagen y alineamiento patch-texto, lo que le permite producir tanto tokens densos por parche como dos tokens globales de imagen, independientemente del tamano de entrada (nativo a 448 px). Esta ficha cubre la distribucion `fastforks/tipsv2`, un repositorio de solo tarjeta que no aloja pesos: descarga los pesos originales de los repositorios de Google y los verifica mediante SHA-256.

El modelo resuelve la tarea de extraccion de caracteristicas visuales (`image-feature-extraction`), devolviendo `last_hidden_state`, `pooler_output` y `hidden_states`. Se ofrece en dos variantes: `tipsv2-b14` (ViT-Base, patch 14) y `tipsv2-l14` (ViT-Large, patch 14). La relevancia actual radica en su soporte para resoluciones arbitrarias, su licencia Apache-2.0 que permite uso comercial y la disponibilidad de backends optimizados (`portable` y `kernels`) con aceleraciones de hasta 4,7x frente al codigo original.

La distribucion de fastforks es experimental y esta orientada a desarrolladores que necesitan integrar el codificador en pipelines de vision con requisitos de rendimiento y memoria controlados, sin depender del codigo de investigacion original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer (ViT) con patch 14, preentrenado texto-imagen con alineamiento patch-texto |
| Parametros totales | no disponible (variantes ViT-B y ViT-L; cifras exactas no publicadas en la informacion) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entrada de imagen de cualquier H x W >= 1; nativo 448 px) |
| Tipos de cuantizacion | fp32, fp16 (soportados en los benchmarks); otras no disponibles |
| Idiomas soportados | no disponible (modelo de vision; el codificador de texto no se carga) |
| Licencia | Apache-2.0 (pesos y codigo) |
| Formato de pesos | safetensors (`model.safetensors`) |

## Arquitectura y entrenamiento

TIPSv2 emplea una arquitectura Vision Transformer con tamano de parche 14, en variantes Base y Large. El preentrenamiento se realiza con pares texto-imagen y una estrategia de alineamiento patch-texto, lo que produce representaciones densas por parche y dos tokens globales: el primer token CLS (usado como `pooler_output`, alineado con texto) y un segundo token CLS con conciencia espacial (indice 1). El modelo acepta imagenes de cualquier resolucion H x W >= 1, redimensionando o aplicando padding internamente, con resolucion nativa de 448 px.

No se especifica en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO. El dataset de pares imagen-texto no se nombra en el README ni en las model cards de las revisiones fijadas. La innovacion tecnica destacable es la capacidad de procesar resoluciones arbitrarias manteniendo tokens densos y globales, junto con la implementacion de backends optimizados (`portable` y `kernels`) que logran aceleraciones de 2,0x a 4,7x respecto al codigo original.

## Capacidades

- Extraccion de caracteristicas de imagen: genera `last_hidden_state` (tokens densos por parche mas 2 tokens prefijo), `pooler_output` (embedding global alineado con texto) y `hidden_states`.
- Procesamiento a resolucion arbitraria: acepta cualquier H x W >= 1, con redimensionado o padding interno; probado hasta 3000x4000.
- Representacion densa por parche: util para tareas que requieren mapas de caracteristicas espaciales (segmentacion, deteccion, correspondencia).
- Embedding global de imagen: adecuado para recuperacion, clasificacion y comparacion imagen-texto.
- Soporte de dos backends: `portable` (PyTorch) y `kernels` (kernels optimizados publicados en `fastforks/kernels`).
- Compatibilidad con `torch.compile` y TensorRT fp16.
- No soporta tool calling, agentes, razonamiento multi-paso ni entrada de texto (el codificador de texto del checkpoint no se carga).
- Capacidades multilingues: no aplica (modelo exclusivamente visual).

## Casos de uso

- Recuperacion de imagenes (image retrieval): el `pooler_output` actua como embedding global alineado con texto, permitiendo indexar y buscar imagenes por similitud coseno en bases de datos vectoriales.
- Segmentacion y tareas densas: los tokens por parche de `last_hidden_state` permiten construir mapas de caracteristicas para segmentacion semantica o correspondencia densa entre imagenes.
- Clasificacion de imagenes con kNN: los benchmarks muestran kNN top-1 de 59,34 % (B14) y 63,48 % (L14) en ImageNet-1k val, lo que permite usar el modelo como extractor con clasificador ligero sin reentrenamiento.
- Procesamiento de imagenes de alta resolucion: al aceptar hasta 3000x4000 con un pico de memoria de 1,4 GiB (B14) y 2,2 GiB (L14) en fp16, es adecuado para imagenes medicas, satelitales o documentos escaneados.
- Pipelines de vision en produccion con requisitos de latencia: el backend `kernels` alcanza 1,49 ms (B14) y 4,58 ms (L14) por imagen 224x224, y TensorRT fp16 llega a 1,33 ms (B14), lo que permite inferencia en tiempo real.
- Extraccion de caracteristicas para modelos downstream: integrar los embeddings como entrada de clasificadores, detectores o sistemas de recomendacion visual.
- Despliegue en GPU de consumo: con 204-624 MiB de memoria pico en 224x224, cabe en GPUs consumer como la RTX 5060 Ti 16 GB usada en los benchmarks.
- Verificacion de integridad de pesos: el repositorio fastforks descarga y valida los pesos originales mediante SHA-256, util en entornos con requisitos de cadena de suministro.

## Benchmarks y rendimiento

### Precision (kNN top-1 en ImageNet-1k val, k=20, 10000 imagenes etiquetadas / 5000 de test)

| Variante | Original fp32 | Original fp16 | Portable | Kernels |
|---|---|---|---|---|
| `tipsv2-b14` | 59,34 % | 59,30 % | 59,36 % | 59,16 % |
| `tipsv2-l14` | 63,48 % | 63,44 % | 63,42 % | 63,42 % |

### Velocidad y memoria (224x224, RTX 5060 Ti 16 GB)

| Modelo | Tiempo original fp32 (ms) | Portable (ms) | Kernels (ms) | Aceleracion kernels vs original | Memoria pico portable (MiB) |
|---|---|---|---|---|---|
| `tipsv2-b14` | 7,03 | 2,93 | 1,49 | 4,7x | 204 / 224 |
| `tipsv2-l14` | 21,9 | 6,15 | 4,58 | 3,1x | 621 / 624 |

### torch.compile y TensorRT (224x224)

| Modelo | Portable (ms) | Compile (ms) | TensorRT fp16 (ms) | Kernels (ms) |
|---|---|---|---|---|
| `tipsv2-b14` | 2,93 | 2,18 | 1,33 | 1,49 |
| `tipsv2-l14` | 6,15 | 6,04 | 4,28 | 4,58 |

### Paridad con el codigo original

- CPU, float32: max |diff| <= 6,9e-05 frente al original.
- GPU, float16: mean |diff| <= 1,9 % y p99 <= 6,9 % respecto a la mediana del valor de referencia.

## Requisitos de hardware

- VRAM estimada: 204-226 MiB (B14) y 621-648 MiB (L14) en 224x224 fp16; hasta 1,4 GiB (B14) y 2,2 GiB (L14) en 3000x4000.
- GPU recomendadas: RTX 5060 Ti 16 GB (usada en los benchmarks, sm_120); cualquier GPU con soporte CUDA y al menos 2-3 GiB libres para las variantes en fp16.
- Cabe en GPU de consumo: si, ambas variantes en 224x224 y en resoluciones altas dentro de 16 GB.
- Opciones de despliegue: backend `portable` (PyTorch), backend `kernels` (kernels optimizados), `torch.compile` y TensorRT fp16. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplican a un codificador de imagen).
- Latencia y throughput: 1,49 ms (B14) y 4,58 ms (L14) por imagen 224x224 con `kernels`; 1,33 ms y 4,28 ms con TensorRT fp16.
- Tiempo de carga: 0,20-1,42 s (B14) y 1,44-2,91 s (L14) segun backend.
- Preparacion: `torch.compile` en frio 9,18 s (B14) y 12,4 s (L14); build ONNX + engine TensorRT 41,5 s (B14) y 47,9 s (L14).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `tipsv2-b14` | ViT-B (cifra exacta no disponible) | Imagen H x W >= 1, nativo 448 px | kNN ImageNet-1k 59,34 %; 1,49 ms (kernels, 224x224) | Apache-2.0 | Pesos en `google/tipsv2-b14` |
| `tipsv2-l14` | ViT-L (cifra exacta no disponible) | Imagen H x W >= 1, nativo 448 px | kNN ImageNet-1k 63,48 %; 4,58 ms (kernels, 224x224) | Apache-2.0 | Pesos en `google/tipsv2-l14` |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la informacion proporcionada de datos de benchmarks de otros modelos de extraccion de caracteristicas para establecer una comparativa cuantitativa fiable.

## Limitaciones y advertencias

- Solo codificador de imagen: el codificador de texto del checkpoint no se carga (la tarea de features no tiene entrada de texto), aunque el archivo se descarga completo.
- `last_hidden_state` contiene 2 tokens prefijo seguidos de los parches: el primer CLS corresponde a `pooler_output` (embedding global alineado con texto) y el segundo CLS (indice 1) es el embedding global con conciencia espacial. Es necesario interpretar correctamente los indices.
- Repositorio de solo tarjeta: no aloja pesos; depende de la disponibilidad de los repositorios de Google y de la verificacion SHA-256.
- Nivel experimental: la distribucion fastforks se marca como "experimental"; no se garantiza estabilidad de API ni soporte a largo plazo.
- Dataset de entrenamiento no documentado: no se nombra el dataset de pares imagen-texto ni el numero de tokens, lo que limita la evaluacion de sesgos.
- Riesgo de sesgos y alucinacion visual: no se documentan analisis de sesgo; como codificador, puede heredar sesgos del preentrenamiento texto-imagen no especificado.
- Licencia: Apache-2.0 permite uso comercial, pero la model card advierte que las cadenas de licencia del codigo original se registran tal cual (paquete de uso de investigacion) y deben verificarse antes de cualquier otro uso.
- Limitaciones de idioma: no aplica entrada de texto; el alineamiento texto-imagen depende del codificador de texto no cargado.
- Rendimiento en fp16: la paridad con el original en GPU fp16 presenta un error medio de hasta 1,9 % y p99 de hasta 6,9 %, relevante en aplicaciones sensibles a la precision.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/fastforks/tipsv2
- Codigo fastforks: https://github.com/kleinicke/fastforks
- Kernels: https://huggingface.co/fastforks/kernels
- Codigo original Google DeepMind: https://github.com/google-deepmind/tips (commit `bf10a73`)
- Pesos `tipsv2-b14`: https://huggingface.co/google/tipsv2-b14
- Pesos `tipsv2-l14`: https://huggingface.co/google/tipsv2-l14
- Tarjeta de configuracion: https://github.com/kleinicke/fastforks/blob/main/src/fastforks/features/models/tipsv2/card.toml
- Benchmarks: https://github.com/kleinicke/fastforks/blob/main/docs/benchmarks.md
- Evidencia de licencia (pesos): https://huggingface.co/google/tipsv2-b14/blob/ed1e4dc6b74bf3935ae099e9d5eb30fa96528454/README.md
- Evidencia de licencia (codigo): https://github.com/google-deepmind/tips/blob/bf10a73765b048edfbfcdf1f7e6ca8292542baae/LICENSE
