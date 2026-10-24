# alfadizayn/filzen-siglip2-b16-224-int8

## Resumen

`alfadizayn/filzen-siglip2-b16-224-int8` no es un modelo de lenguaje, sino el **torre de imagen (image encoder)** de SigLIP 2 ViT-B/16 a 224 píxeles de Google, reempaquetado en formato ExecuTorch (`.pte`) con cuantización int8 para ejecución en dispositivo. El autor (alfadizayn) lo publica como artefacto de despliegue para la app de fotografía Filzen, que lo usa para búsqueda semántica local: cada foto se convierte en un vector de 768 dimensiones sin salir del teléfono.

El modelo resuelve un problema muy concreto: llevar un encoder visual de calidad (SigLIP 2 base, pesos `google/siglip2-base-patch16-224` vía `timm/ViT-B-16-SigLIP2` y open_clip 3.3.0) a un runtime móvil (ExecuTorch 1.2.0 con backend XNNPACK, integrado mediante react-native-executorch 0.9.x) manteniendo una fidelidad alta respecto al modelo en fp32: coseno medio de 0,998 y mínimo de 0,993 sobre 100 fotos de evaluación.

Su relevancia es de nicho pero clara para quien construye aplicaciones móviles con React Native: evita tener que exportar el modelo uno mismo y ofrece un grafo ya calibrado, con la normalización CLIP resuelta internamente. El repositorio pesa 0,1 GB, tiene 0 descargas y 0 likes en el momento de la consulta, y se publica bajo licencia Apache-2.0, la misma de los pesos originales.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer tipo ViT (Vision Transformer) B/16, patch size 16, resolución 224x224; solo el image tower de SigLIP 2 |
| Parámetros totales | No disponible en la información proporcionada (variante ViT-B de la familia SigLIP 2 base) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica: encoder de imagen con entrada fija `[1, 3, 224, 224]`, sin ventana de texto |
| Tipos de cuantización | Pesos int8 con activaciones cuantizadas dinámicamente (XNNPACK qd8) en todas las capas Linear excepto la cabeza de attention-pooling; patch embedding en fp32 |
| Idiomas soportados | No aplica al encoder visual; no disponible información sobre el text tower asociado |
| Licencia | Apache-2.0 |
| Formato de pesos | ExecuTorch `.pte` (`filzen_siglip2_b16_224_int8.pte`, 117.298.688 bytes); no se distribuyen safetensors ni GGUF |

## Arquitectura y entrenamiento

La arquitectura es la del image tower de SigLIP 2 en su variante base con parches de 16x16 y entrada de 224x224 píxeles: un Vision Transformer que proyecta la imagen en un embedding de 768 dimensiones, L2-normalizado, alineado con el espacio del text tower de SigLIP 2. La innovación de SigLIP frente a CLIP es la función de pérdida sigmoide por pares en lugar de softmax contrastivo, lo que permite entrenar con lotes más pequeños y mejorar el rendimiento en tareas de recuperación y clasificación zero-shot.

Este repositorio **no entrena nada**: es una re-exportación. El grafo se generó con executorch 1.2.0, torch 2.11.0 y open_clip 3.3.0 mediante el script `scripts/search/eval/export_model.py siglip2-b16-224 OUT --calib DIR --dynamic` del repositorio Filzen (wrapper en `scripts/search/eval/models.py`), usando calibración para la cuantización dinámica. El detalle técnico más útil es que el propio grafo convierte la normalización estilo CLIP (media 0,48145466/0,4578275/0,40821073 y desviación 0,26862954/0,26130258/0,27577711) a la normalización nativa de SigLIP (media 0,5, desviación 0,5), de modo que se puede insertar directamente en pipelines que ya alimentan entrada CLIP sin cambiar el preprocesado.

No se dispone de información sobre el dataset de entrenamiento original, el número de tokens vistos, ni si hubo fases de RLHF o DPO; esos datos corresponden a la model card de `google/siglip2-base-patch16-224`, no a este repositorio.

## Capacidades

- Extracción de features de imagen: genera un embedding `float32 [1, 768]` L2-normalizado por imagen.
- Búsqueda semántica de imágenes: al compartir espacio con el text tower de SigLIP 2, permite recuperación texto-a-imagen e imagen-a-imagen por similitud coseno.
- Clasificación zero-shot: viable acoplándolo a un text tower SigLIP 2 y comparando similitudes con prompts de texto.
- Ejecución on-device: pensado para móvil, sin envío de datos a servidor ("ninguna foto sale del teléfono", según el autor).
- Compatibilidad de preprocesado: acepta entrada normalizada estilo CLIP y aplica internamente la normalización de SigLIP.
- Integración con React Native: distribuido para react-native-executorch 0.9.x sobre el runtime ExecuTorch 1.2.0 con backend XNNPACK.
- Sin capacidades de generación de texto, tool calling, agentes, razonamiento multi-paso, audio ni visión generativa: es exclusivamente un encoder.

## Casos de uso

- Búsqueda de fotos en galería móvil: se indexan las imágenes del dispositivo con el encoder y se consulta por texto (usando el text tower SigLIP 2 en el mismo runtime) o por imagen de referencia; los 768 dims L2-normalizados permiten comparación por producto escalar sobre un índice ligero.
- Deduplicación y agrupación de fotos: los embeddings permiten agrupar ráfagas, imágenes casi idénticas o escenas similares sin subir nada a la nube, algo crítico en apps de gestión de galería.
- Etiquetado automático offline: clasificación zero-shot contra una lista de etiquetas (comida, paisaje, documento, mascota) calculando similitud con los embeddings de texto correspondientes.
- Moderación o filtrado local de contenido: preclasificación de imágenes en el dispositivo antes de decidir si se envían a un servicio, reduciendo coste y exposición de datos.
- Organización de bibliotecas en apps de notas o escaneo: indexar capturas y fotos de documentos por similitud visual para sugerir colecciones o recuperar un escaneo concreto.
- Feature extractor en pipelines de visión clásicos: usar el vector de 768 dims como entrada de un clasificador lineal o de un sistema de recomendación de imágenes de bajo coste.
- Prototipado de apps React Native: al estar ya exportado para react-native-executorch 0.9.x, sirve como bloc de visión listo para integrar sin escribir el script de exportación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, ImageNet zero-shot, etc.) en la información disponible. El único dato de evaluación es la fidelidad de la cuantización frente al modelo PyTorch fp32:

| Métrica | Valor |
|---|---|
| Similitud coseno media vs fp32 (100 fotos) | 0,998 |
| Similitud coseno mínima vs fp32 (100 fotos) | 0,993 |
| Tamaño del artefacto | 117.298.688 bytes (aprox. 0,11 GB) |
| sha256 | `6195c71307357dbb2c5e94d96c6bdcd59de272d7e14256a1de258cfdbc0e339d` |
| md5 | `e4518b40ed02d9b167777d938445f6a3` |

No hay datos de latencia ni throughput publicados.

## Requisitos de hardware

- VRAM/RAM estimada: el artefacto ocupa unos 117 MB; con activaciones y buffers del runtime es razonable presupuestar del orden de 200-350 MB de memoria en inferencia. Cifra no confirmada por el autor.
- GPU de escritorio: no es el objetivo del artefacto; el `.pte` con backend XNNPACK está pensado para CPU (ARM/x86) y móvil. Para servidor conviene usar los pesos originales en PyTorch.
- Cabe en GPU consumer: sí, cualquier GPU con más de 1 GB de VRAM puede alojar el modelo en fp32 o int8, aunque el formato `.pte` no es el canal habitual para CUDA.
- Despliegue: ExecuTorch 1.2.0 con backend XNNPACK, integrado vía react-native-executorch 0.9.x. No es compatible directamente con vLLM, TGI, llama.cpp ni Ollama (formatos y propósito distintos).
- Alternativa de despliegue en servidor: cargar `google/siglip2-base-patch16-224` con transformers u open_clip/timm, o reexportar a otro formato.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto/entrada | Formato | Licencia | Estado |
|---|---|---|---|---|---|---|
| Este modelo (filzen-siglip2-b16-224-int8) | Encoder ViT-B/16 int8 | No disponible (ViT-B) | Imagen 224x224, salida 768 dims | ExecuTorch `.pte` | Apache-2.0 | Publicado, 0 descargas |
| google/siglip2-base-patch16-224 | Encoder + text tower SigLIP 2 | No disponible | Imagen 224x224 + texto | safetensors (transformers) | Apache-2.0 | Modelo base original |
| SigLIP 1 base-patch16-224 | Encoder + text tower, pérdida softmax | No disponible | Imagen 224x224 + texto | safetensors | Apache-2.0 | Generación anterior, menos preciso en recuperación |
| CLIP ViT-B/32 | Encoder + text tower | No disponible | Imagen 224x224 + texto | safetensors | MIT | Referencia clásica, menor resolución de parche |
| MobileCLIP (variantes S/B) | Encoder ligero para móvil | No disponible | Imagen | safetensors / Core ML | Investigación (revisar) | Alternativa específica para dispositivo |

La comparación cuantitativa de precisión entre estas alternativas no está disponible en la información proporcionada; la ventaja diferencial de este repositorio es el empaquetado listo para ExecuTorch, no una mejora de calidad respecto a SigLIP 2 base.

## Limitaciones y advertencias

- Solo incluye el image tower: sin el text tower de SigLIP 2 no se puede hacer búsqueda texto-a-imagen ni clasificación zero-shot.
- Entrada fija de 224x224 píxeles: no soporta resoluciones variables ni imágenes de alta resolución sin recorte o reescalado previo.
- Pérdida de fidelidad por cuantización: coseno mínimo de 0,993 frente a fp32 implica pequeñas variaciones en rankings de similitud, relevantes en índices muy densos.
- Formato propietario del runtime (`.pte`): no se puede cargar con transformers, vLLM, llama.cpp ni Ollama; requiere ExecuTorch.
- Idiomas: el encoder no procesa texto; no hay información sobre el multilingüismo del text tower asociado.
- Sesgos: no documentados en la información proporcionada; al provenir de datos web de SigLIP 2, es esperable un sesgo heredado no cuantificado aquí.
- Riesgo de alucinación: no aplica en sentido generativo (no produce texto), pero sí puede producir similitudes espurias en dominios visuales poco representados.
- Licencia Apache-2.0 permite uso comercial; el autor solo reempaqueta pesos de Google, por lo que conviene verificar la model card original para condiciones adicionales de los datos de entrenamiento.
- Madurez: repositorio con 0 descargas y 0 likes, actualizado una sola vez; sin garantías de mantenimiento ni de compatibilidad con versiones futuras de ExecuTorch.
- Los resultados de búsqueda web asociados a esta consulta no contenían información técnica relevante sobre el modelo; no se han usado como fuente.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/alfadizayn/filzen-siglip2-b16-224-int8
- Modelo base: https://huggingface.co/google/siglip2-base-patch16-224
- react-native-executorch: https://github.com/software-mansion/react-native-executorch
- ExecuTorch: https://github.com/pytorch/executorch
- open_clip: https://github.com/mlfoundations/open_clip
- timm (ViT-B-16-SigLIP2): https://github.com/huggingface/pytorch-image-models
- Script de exportación citado por el autor: `scripts/search/eval/export_model.py` (repositorio Filzen, no enlazado en la model card)
