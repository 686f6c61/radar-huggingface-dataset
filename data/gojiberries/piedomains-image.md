# gojiberries/piedomains-image

## Resumen

`gojiberries/piedomains-image` es un modelo de clasificación de imágenes entrenado para categorizar el contenido de un sitio web a partir de una captura de pantalla de su página de inicio. Desarrollado por el proyecto `piedomains`, sirve como complemento al modelo de texto `piedomains-text` para casos en los que solo se dispone de una imagen y no del texto de la página. El modelo está basado en SigLIP 2, concretamente en la variante `google/siglip2-base-patch16-224`, y clasifica en 39 categorías temáticas (p. ej. `pets`, `religion`, `education`, `gamble`, `adult`).

Aunque el rendimiento es modesto (0.501 de accuracy y 0.370 de macro-F1 en 39 clases), el modelo supone una mejora clara frente a su predecesor (0.429) y frente a un ViT-base-in21k (0.335/0.140). La decisión de usar SigLIP 2 se justifica por su preentrenamiento con redimensionado no aspect-preserving, que se reproduce en el pipeline de inferencia. El modelo está pensado para usarse cuando no se dispone de texto extraíble, pero el propio autor advierte que el modelo de texto alcanza 0.818 en la misma tarea.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SigLIP 2 base (ViT, 16 parches, 224×224) |
| Parametros totales | 92.914.215 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no aplica (entrada de imagen) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (la clasificación es independiente del idioma) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo usa el encoder de SigLIP 2 (basado en ViT) con una resolución de entrada de 224×224 píxeles. SigLIP 2 se preentrenó con un redimensionado no aspect-preserving, lo que significa que la imagen se deforma para ajustarse al cuadrado en lugar de recortarse. El entrenamiento del clasificador se realizó sobre un corpus de capturas de pantalla de páginas de inicio recopiladas en 2022, con 39 clases (se excluyen `parked`, `unavailable`, `library`, `military` y `homestyle` por no existir ejemplos). El preprocesamiento se centraliza en una única función `resize_for_model` para evitar divergencias entre entrenamiento, inferencia y evaluación. La partición de datos se hace mediante `sha256(domain) % 100`, la misma función que usa el modelo de texto para que los dominios de validación no se solapen.

El entrenamiento se realizó con fine-tuning del modelo base `google/siglip2-base-patch16-224`. Se aplicó calibración de temperatura (1.6669) y se reporta un ECE (Expected Calibration Error) reducido de 0.1769 a 0.0139. No se mencionan técnicas de RLHF o DPO, ya que es un modelo de clasificación supervisada.

## Capacidades

- Clasificación de una captura de pantalla de una página web en 39 categorías temáticas.
- Detecta patrones visuales: diseño, colores, imágenes y disposición de elementos.
- Funciona con imágenes de baja resolución (224 px), aunque pierde legibilidad del texto.
- No requiere texto adicional: solo la imagen de entrada.
- Es compatible con el pipeline `image-classification` de HuggingFace Transformers.
- No incluye capacidades de generación de texto, tool calling, agentes ni visión multimodal avanzada (solo clasificación).

## Casos de uso

- Moderación de contenido: un servicio puede clasificar automáticamente sitios web con contenido para adultos (`adult`), apuestas (`gamble`) o drogas, usando solo una captura de pantalla.
- Filtrado de tráfico en empresas: clasificar dominios a partir de capturas para bloquear categorías no deseadas en redes corporativas.
- Análisis de competencia: agrupar sitios web de un sector (educación, mascotas, religión) a partir de sus portadas para estudios de mercado.
- Detección de sitios de phishing o fraudulentos: aunque no está entrenado específicamente para ello, puede identificar categorías como `government` o `searchengines` con baja precisión, por lo que se combinaría con otros señales.
- Archivado histórico: al analizar capturas de archive.org (el proyecto lo contempla), se puede clasificar cómo era un dominio en el pasado, útil para estudios de evolución web.
- Enriquecimiento de datos de dominio: cuando se tiene una base de datos de dominios sin texto, se pueden añadir etiquetas semánticas a partir de capturas para mejorar búsquedas o segmentación.
- Prefiltrado para modelos de texto: si un pipeline tiene una imagen y no puede extraer texto, se usa este modelo para decidir si merece la pena intentar un proceso de OCR o scraping.

## Benchmarks y rendimiento

La información proporcionada incluye métricas de rendimiento en el corpus de validación (39 clases):

| Metrica | Valor |
|---|---|
| Accuracy | 0.501 |
| Macro-F1 | 0.370 |
| Calibración (ECE) | 0.1769 → 0.0139 (tras temperatura) |
| Temperatura de calibración | 1.6669 |

Comparación con otros backbones en el mismo corpus:

| Modelo | Accuracy | Macro-F1 |
|---|---|---|
| piedomains-image (SigLIP 2) | 0.531 | 0.397 |
| ViT-base-in21k | 0.335 | 0.140 |
| Predecesor de piedomains-image | 0.429 | no disponible |

Rendimiento por categoría (accuracy):

| Categoria | Accuracy |
|---|---|
| pets | 0.72 |
| religion | 0.67 |
| education | 0.63 |
| gamble | 0.57 |
| adult | 0.55 |
| searchengines | 0.00 |
| urlshortener | 0.00 |
| government | 0.08 |

No se han publicado resultados de benchmarks en la información disponible más allá de los anteriores.

## Requisitos de hardware

- VRAM estimada: con 92.9 millones de parámetros, en FP16 ocupa aproximadamente 186 MB. En FP32, 372 MB. Con cuantización INT8, menos de 100 MB.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM es suficiente. Incluye GPUs consumer como GTX 1060, RTX 2060, etc.
- Cabe en CPU: sí, con pocos recursos (inferencia en CPU a 224×224 es factible en menos de un segundo).
- Opciones de despliegue: puede usarse con `transformers` (pipeline `image-classification`), también con ONNX Runtime o TensorRT para optimización.
- Latencia: en una GPU media, inferencia de una imagen de 224×224 en ~5-10 ms. En CPU, alrededor de 50-100 ms.
- No requiere hardware especializado; es adecuado para despliegue en servidores de bajo coste.

## Comparativa con modelos similares

No hay modelos directamente comparables en el mismo nicho (clasificación de capturas de sitios web). Los alternativos serían:

- **piedomains-text**: modelo de texto que clasifica el mismo dominio usando el contenido textual. Alcanza 0.818 de accuracy, mucho mejor que la imagen. Licencia MIT.
- **ViT-base-in21k**: un clasificador de imágenes genérico preentrenado con ImageNet-21k, que en este corpus obtiene 0.335 de accuracy. No está adaptado a dominios web.
- **SigLIP 2 base**: el backbone base sin fine-tuning, no se reportan resultados específicos, pero se espera que sea inferior al fine-tuned.

En cuanto a tamaño y licencia, `piedomains-image` es pequeño (92M params) y con licencia MIT, lo que permite uso comercial sin restricciones.

## Limitaciones y advertencias

- **Precisión limitada**: 0.501 de accuracy es bajo para producción general. El modelo de texto es mucho más fiable (0.818) y debe preferirse cuando se dispone de texto.
- **Dependencia de la resolución**: a 224 px, el texto de la página no es legible; el modelo solo usa layout, colores e imágenes. Categorías que dependen de texto (como `searchengines` o `urlshortener`) tienen rendimiento nulo.
- **Corpus desactualizado**: las capturas se tomaron en 2022, por lo que las páginas web actuales pueden diferir visualmente.
- **Falta de categorías**: no incluye `parked`, `unavailable`, `library`, `military` ni `homestyle`; si se necesita clasificar esos tipos, no se obtendrá una etiqueta.
- **Sesgo de distribución**: el dataset tiene muy pocos ejemplos en algunas clases (n=5 para `urlshortener`, n=13 para `searchengines`), lo que explica su rendimiento cero.
- **Riesgo de error en producción**: el autor menciona que su predecesor etiquetaba Khan Academy y Yahoo como `porn`; aunque el actual ha corregido el preprocesado, es recomendable validar en el dominio objetivo.
- **No es un clasificador general**: solo funciona con capturas de portadas de sitios web, no con imágenes arbitrarias.
- **Licencia MIT**: no hay restricciones de uso comercial, pero no se garantiza exactitud.

## Enlaces

- [HuggingFace - gojiberries/piedomains-image](https://huggingface.co/gojiberries/piedomains-image)
- [GitHub - themains/piedomains](https://github.com/themains/piedomains/tree/main)
- [PyPI - piedomains](https://pypi.org/project/piedomains/)
- [Documentación del proyecto](https://themains.github.io/piedomains/)
- [Paper SigLIP 2 (arXiv:2502.14786)](https://arxiv.org/abs/2502.14786)
- [Modelo de texto complementario `piedomains-text`](https://huggingface.co/soodoku/piedomains-text)
