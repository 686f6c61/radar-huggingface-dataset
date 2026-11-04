# olinesn/dinov3-vits16-lucid

## Resumen

`olinesn/dinov3-vits16-lucid` es una conversión a ONNX del modelo DINOv3 ViT-S/16 de Meta AI (FAIR), preentrenado sobre el corpus LVD-1689M, publicada por el usuario olinesn. No se trata de un modelo nuevo ni de un reentrenamiento: los pesos son los originales de `facebook/dinov3-vits16-pretrain-lvd1689m`, sin modificar. Su propósito es servir como extractor de características visuales dentro de LUCID, una herramienta del proyecto talmolab/luc3d para la comprobación de cambios de identidad de imagen (image ID-switch check) en flujos de anotación de imágenes 3D.

El modelo es un transformer de visión (ViT) con parches de 16x16 y 384 dimensiones de embedding, diseñado para extracción de características de imagen. La conversión está optimizada para ejecutarse en el navegador mediante transformers.js 4.3.0 sobre WebGPU, con una variante fp16 (43 MB) y otra fp32 (86 MB). El repositorio completo ocupa 0,1 GB.

La relevancia de esta ficha es acotada: se trata de un artefacto de despliegue, no de un modelo fundacional publicado con benchmarks propios. Su interés técnico está en las modificaciones de la exportación ONNX (preservación de fp32 en la atención de la capa 0, eliminación de operadores de secuencia no soportados en WebGPU) y en la validación de paridad numérica frente a fp32 que documenta el autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer (ViT) con parches de 16x16, DINOv3 |
| Parametros totales | no disponible (repo de 0,1 GB; pesos fp32 de 86 MB y fp16 de 43 MB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada `pixel_values` [n, 3, H, W] con H y W múltiplos de 16; LUCID usa 192) |
| Tipos de cuantizacion | fp16 (capa 0 en fp32, entrada/salida fp32) y fp32 |
| Idiomas soportados | no disponible (modelo de visión, sin procesamiento de lenguaje) |
| Licencia | DINOv3 License (`dinov3-license`, archivo LICENSE.md) |
| Formato de pesos | ONNX (`onnx/model_fp16.onnx`, `onnx/model.onnx`) |

## Arquitectura y entrenamiento

La arquitectura es un Vision Transformer de DINOv3 en variante small (ViT-S) con tamaño de parche 16. La salida es `last_hidden_state` con forma [n, 1 + 4 + (H/16)·(W/16), 384]: el token 0 es el CLS, los tokens 1 a 4 son los registros y el resto corresponde a los parches. La entrada se normaliza con estadísticas de ImageNet. El modelo base fue preentrenado por Meta AI Research (FAIR) sobre el corpus LVD-1689M; esta conversión no añade entrenamiento ni ajuste fino.

Las modificaciones respecto a la exportación de onnx-community son cuatro. Primero, en el archivo fp16 se mantiene en fp32 el núcleo de atención de la capa 0 (MatMul Q·Kᵀ, Softmax y MatMul atención·V), porque los logits de atención de esa capa alcanzan ~2,5e6, fuera del rango de fp16 (65.504); una conversión fp16 simple devolvía vectores no relacionados con fp32 en WebGPU (coseno CLS mediano de 0,16). Las capas 1 a 11 se mantienen por debajo de ~170 y operan en fp16. Segundo, el subgrafo de RoPE y formas permanece en fp32 porque ONNX Runtime lo rechaza en caso contrario. Tercero, se sustituyen 24 instancias de `SplitToSequence` + `SequenceAt` por `Split`, ya que WebGPU no tiene kernels para operadores de secuencia y cada uno se ejecutaba en CPU; las salidas son idénticas bit a bit y el tiempo de modelo en un M2 Pro baja de 10,5 a 6,0 ms por recorte en fp32 y de 8,6 a 4,2 ms en fp16. Cuarto, se elimina la salida `pooler_output`.

## Capacidades

- Extracción de características de imagen: genera embeddings por token (CLS, registros y parches) a partir de imágenes normalizadas con ImageNet.
- Representación visual densa: la salida por parche permite tareas posteriores de correspondencia, segmentación o recuperación, aunque el modelo no las implementa por sí mismo.
- Ejecución en navegador: compatible con transformers.js 4.3.0 sobre WebGPU (con y sin `shader-f16`) y sobre CPU vía WebAssembly.
- Inferencia en ONNX Runtime: los dos archivos están pensados para onnxruntime-web.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generación de texto.
- No tiene capacidades multilingües ni de audio; es exclusivamente un modelo de visión.
- No incluye modo de razonamiento (thinking mode) ni decodificación especulativa.

## Casos de uso

- Comprobación de cambios de identidad de imagen en LUCID: el modelo calcula embeddings CLS de recortes de imagen y la herramienta detecta puntos de cambio comparando similitudes; es su uso previsto y está validado sobre 24 grabaciones con verdad de referencia.
- Anotación asistida en herramientas web: al ejecutarse en el navegador con WebGPU, permite ofrecer sugerencias de similitud visual sin enviar imágenes a un servidor.
- Deduplicación y agrupación de imágenes en el cliente: los embeddings CLS de 384 dimensiones permiten agrupar recortes similares con distancia coseno dentro de una aplicación web.
- Recuperación visual por similitud: indexar los embeddings de parches o del token CLS para búsqueda de imágenes en colecciones pequeñas o medianas embebidas en la aplicación.
- Control de calidad de datasets de imagen: detectar recortes duplicados o mal etiquetados comparando embeddings entre lotes, como hace LUCID con 233.206 recortes de 24 grabaciones.
- Preprocesamiento para modelos posteriores: usar `last_hidden_state` como entrada de cabezas ligeras (clasificación, segmentación) entrenadas por el usuario, sin necesidad de reentrenar el backbone.
- Prototipado rápido en el navegador: validar pipelines de visión en demos o cuadernos web con transformers.js antes de pasar a un despliegue servidor con PyTorch.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor documenta únicamente comprobaciones de paridad numérica y de latencia:

| Comprobacion | Resultado |
|---|---|
| Coseno CLS fp16 vs fp32, 48 recortes aislados | mediana 0,99967; peor 0,99829 |
| Coseno CLS fp16 vs fp32, 233.206 recortes de 24 grabaciones | mediana 0,99962; 25 por debajo de 0,99; peor 0,9785 |
| Referencia: DINOv2-small fp16 vs fp32 en recortes similares | mediana 0,99910 |
| Archivo fp32 en CPU vs exportación original | idéntico bit a bit |
| Filas de punto de cambio de LUCID (umbrales de −0,8 a −1,6) | idénticas con fp16 y fp32 en 24 grabaciones |
| Tiempo de modelo por recorte, M2 Pro, fp32 | 6,0 ms (antes 10,5 ms) |
| Tiempo de modelo por recorte, M2 Pro, fp16 | 4,2 ms (antes 8,6 ms) |

## Requisitos de hardware

- VRAM estimada: mínima; los pesos ocupan 43 MB (fp16) y 86 MB (fp32), por lo que el modelo cabe holgadamente en cualquier GPU con soporte WebGPU.
- GPU recomendadas: cualquier GPU con WebGPU y, para la variante fp16, con la extensión `shader-f16`; el autor valida en un Apple M2 Pro. Para la variante fp32 basta WebGPU sin `shader-f16` o la CPU vía WebAssembly.
- GPU de consumo: sí, cabe en cualquier GPU integrada o dedicada reciente que exponga WebGPU en el navegador; no requiere A100, H100 ni RTX 4090.
- Opciones de despliegue: transformers.js 4.3.0 con onnxruntime-web 1.31.0-dev (validado); también es posible usar ONNX Runtime en servidor, aunque no está documentado por el autor.
- Latencia y throughput: 6,0 ms por recorte en fp32 y 4,2 ms en fp16 en un M2 Pro con Chrome y WebGPU; no se documenta throughput agregado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| olinesn/dinov3-vits16-lucid | no disponible (ViT-S/16, embedding 384) | imagen, H y W múltiplos de 16 | ONNX fp16/fp32 | DINOv3 License | Conversión para WebGPU; validada contra fp32 |
| facebook/dinov3-vits16-pretrain-lvd1689m | ViT-S/16, embedding 384 | imagen | safetensors (PyTorch) | DINOv3 License | Pesos originales de Meta; requiere PyTorch |
| onnx-community/dinov3-vits16-pretrain-lvd1689m-ONNX | ViT-S/16, embedding 384 | imagen | ONNX | DINOv3 License | Exportación previa; sin los ajustes para WebGPU |
| DINOv2-small (referencia del autor) | no disponible | imagen | varios | licencia de DINOv2 | Usado solo como referencia de paridad fp16 vs fp32 |

## Limitaciones y advertencias

- No es un modelo de propósito general: solo produce características de imagen; no genera texto, código ni razonamiento.
- La licencia DINOv3 exige redistribuir bajo el mismo acuerdo e incluir una copia de la licencia; las publicaciones que lo usen deben acreditar DINOv3. Conviene revisar `LICENSE.md` antes de cualquier uso comercial.
- La variante fp16 no es numéricamente equivalente a fp32 en todos los casos: 25 de 233.206 recortes quedaron por debajo de 0,99 de coseno CLS (peor 0,9785), lo que puede afectar a decisiones de umbral en aplicaciones sensibles.
- La corrección de la variante fp16 depende de mantener la atención de la capa 0 en fp32; conversiones fp16 adicionales o simplificadas pueden degradar la salida de forma severa (coseno de 0,16 documentado).
- El modelo solo emite `last_hidden_state`; no hay `pooler_output`, por lo que los flujos que esperen esa salida deben adaptarse.
- La entrada debe tener H y W múltiplos de 16 y normalización ImageNet; no se documenta el comportamiento con otras resoluciones o normalizaciones.
- No se han publicado sesgos, evaluaciones de robustez ni benchmarks estándar (MMLU, ImageNet, etc.) en la información disponible.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso comunitario más allá de LUCID.
- Riesgo de alucinación no aplica (no es un modelo generativo), pero sí existe riesgo de falsos negativos o positivos en la detección de cambios según el umbral y la resolución.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/olinesn/dinov3-vits16-lucid
- Modelo base: https://huggingface.co/facebook/dinov3-vits16-pretrain-lvd1689m
- Exportación ONNX de origen: https://huggingface.co/onnx-community/dinov3-vits16-pretrain-lvd1689m-ONNX
- Repositorio DINOv3 de Meta: https://github.com/facebookresearch/dinov3
- Proyecto LUCID (luc3d): https://github.com/talmolab/luc3d
