# lucid-dl/vjepa2-vitl

## Resumen

V-JEPA 2 ViT-L/16 es un modelo de clasificación de vídeo publicado por el usuario `lucid-dl` en HuggingFace. Se trata de un port a la librería Lucid de los pesos originales `facebook/vjepa2-vitl-fpc64-256/model.safetensors`, convertidos a safetensors nativos de Lucid. El modelo cuenta con 326,0 M de parámetros y una única variante de pesos disponible, `FPC64_256`, que ocupa 2402,79 MB en disco y constituye el peso por defecto.

El modelo se apoya en el trabajo V-JEPA 2 descrito en el artículo arXiv:2506.09985, "V-JEPA 2: Self-Supervised Video Models Enable Understanding, Prediction and Planning" (Assran et al., 2025). La model card lo etiqueta con los conjuntos de datos Kinetics-700, Something-Something-v2 y Diving48, habituales en la evaluación de reconocimiento de acciones en vídeo.

Su relevancia práctica es doble: por un lado, ofrece una vía de uso de V-JEPA 2 sin depender del ecosistema original de Facebook; por otro, la licencia MIT heredada facilita su integración en productos comerciales. Sin embargo, el repositorio no incluye resultados de benchmarks, no declara idiomas soportados y no ha recibido descargas ni valoraciones, por lo que su adopción requiere validación propia.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | V-JEPA 2, backbone ViT-L/16 |
| Parametros totales | 326,0 M |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (modelo de clasificación de vídeo; no se documenta ventana de contexto) |
| Tipos de cuantizacion | no disponible (el repositorio solo distribuye safetensors en el formato indicado) |
| Idiomas soportados | no disponible (no aplica; el modelo opera sobre vídeo, no sobre texto) |
| Licencia | MIT, heredada de los pesos originales |
| Formato de pesos | safetensors nativos de Lucid |
| Variante de pesos | `FPC64_256` (por defecto), 2402,79 MB |
| Tamaño del repositorio | 2,5 GB |
| GFLOPs | no disponible (la model card lo deja como "—") |
| Datasets asociados | kinetics-700, something-something-v2, diving48 |
| Librería | lucid |
| Pipeline | video-classification |
| Fecha de creacion | 2026-09-20 |
| Ultima actualizacion | 2026-09-20 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo sigue la línea V-JEPA 2 (Joint Embedding Predictive Architecture aplicada a vídeo), según la referencia al artículo arXiv:2506.09985 que aparece en la propia model card. El backbone es un Vision Transformer Large con parcheo 16x16 (ViT-L/16), con 326,0 M de parámetros. La model card no detalla la composición interna del encoder, el número de capas, la dimensión de embedding ni el mecanismo de agregación temporal.

En cuanto al entrenamiento, la información disponible no especifica el volumen de tokens, la composición del dataset de preentrenamiento ni si se aplicaron fases de ajuste fino supervisado, RLHF o DPO. La ficha solo enumera Kinetics-700, Something-Something-v2 y Diving48 como datasets asociados, que en el ecosistema V-JEPA 2 suelen emplearse para evaluación de reconocimiento de acciones. Al tratarse de un modelo auto-supervisado de representaciones, los esquemas tipo RLHF o DPO no resultan aplicables en el sentido habitual de los modelos de lenguaje.

La innovación técnica documentada en este repositorio concreto es la conversión de pesos: se ha realizado mediante `python -m tools.convert_weights vjepa2_vit_large --tag FPC64_256`, y la model card afirma que el mapeo de claves y la paridad numérica se verificaron contra el modelo de origen. El preprocesado viaja junto a los pesos y se obtiene con `weights.transforms()`.

## Capacidades

- Clasificación de vídeo: el modelo devuelve logits con forma `(B, num_classes)` a partir de una entrada preprocesada con las transformaciones asociadas a los pesos.
- Extracción de representaciones visuales y temporales: al ser un modelo V-JEPA 2 basado en predicción en el espacio latente, es adecuado como extractor de embeddings para tareas posteriores, aunque la model card no documenta explícitamente una API de embeddings.
- Reconocimiento de acciones y eventos en vídeo, coherente con los datasets asociados (Kinetics-700, Something-Something-v2, Diving48).
- Integración con la librería Lucid mediante `models.vjepa2_vit_large(pretrained=True)` o seleccionando la variante con `Vjepa2VitLargeWeights.FPC64_256`.
- Carga directa de pesos en formato safetensors nativo de Lucid, con preprocesado empaquetado.
- Soporte de tool calling / function calling: no disponible (no es una capacidad de este tipo de modelo).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no aplica (modelo de vídeo, sin procesamiento de lenguaje).
- Capacidades especiales (thinking mode, visión, audio): la model card solo documenta clasificación de vídeo; no se mencionan modos adicionales.

## Casos de uso

- Moderación de contenido en plataformas de vídeo: el modelo puede clasificar clips en categorías de acción aprendidas, lo que permite filtrar contenido violento o no deseado antes de la revisión humana. Su tamaño de 326 M de parámetros hace viable desplegarlo en GPU de gama media para precribado masivo.
- Indexado y etiquetado automático de videotecas: generar etiquetas de acción por clip facilita la búsqueda y el catálogo en plataformas de streaming, archivos audiovisuales o bibliotecas corporativas.
- Analítica deportiva: el modelo puede reconocer acciones en vídeo, lo que resulta útil para generar estadísticas automáticas de eventos, resúmenes de jugadas o anotación asistida de partidos.
- Vigilancia y seguridad: detección de comportamientos anómalos o de acciones concretas en flujos de cámara, siempre que las clases de interés estén cubiertas por el espacio de etiquetas del modelo.
- Investigación en representación auto-supervisada de vídeo: usar el encoder como extractor de características congelado para tareas downstream (detección temporal, segmentación, recuperación de vídeo), aprovechando su licencia MIT y su disponibilidad en safetensors.
- Interacción persona-máquina y reconocimiento de gestos: clasificación de acciones grabadas con cámara para interfaces sin contacto, control de presentaciones o sistemas de accesibilidad.
- Curaduría de datasets de vídeo: preetiquetado masivo de clips antes de una revisión manual, reduciendo el coste de anotación en proyectos de visión por computador.
- Prototipado e integración en pipelines de investigación con Lucid: al instalar el paquete y llamar a `models.vjepa2_vit_large(pretrained=True)`, se puede incorporar el modelo en scripts de experimentación sin depender del ecosistema de Facebook.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente lista los datasets asociados (Kinetics-700, Something-Something-v2 y Diving48) sin aportar métricas de exactitud, precisión, recall ni comparaciones numéricas. El campo GFLOPs aparece explícitamente como "—". No se debe asumir ningún nivel de rendimiento a partir de los nombres de los datasets.

## Requisitos de hardware

- VRAM estimada para inferencia, calculada a partir de los 326,0 M de parámetros (estimación propia, no aportada por el autor):
  - fp32: en torno a 1,3 GB solo para pesos, más activaciones.
  - fp16/bf16: en torno a 0,65 GB para pesos, más activaciones.
  - int8: en torno a 0,33 GB para pesos, más activaciones.
- El consumo real de memoria está dominado por las activaciones de vídeo: la variante se etiqueta como `FPC64_256`, lo que sugiere clips de varios fotogramas por muestra, con el coste de memoria asociado.
- GPU recomendadas: no disponibles en la información proporcionada. Por tamaño de parámetros, cualquier GPU de 8 GB o más debería poder alojar el modelo en fp16 para lotes pequeños.
- Compatibilidad con GPU de consumo: sí, es esperable que funcione en tarjetas como RTX 3060 12 GB, RTX 4070, RTX 4080 o RTX 4090, aunque el número de fotogramas por clip y el tamaño de lote determinan la viabilidad real.
- Opciones de despliegue: la model card solo documenta el uso a través de la librería Lucid. No se menciona soporte para vLLM, llama.cpp, Ollama, TGI ni TensorRT, y estas herramientas no están orientadas a modelos de clasificación de vídeo como V-JEPA 2.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `lucid-dl/vjepa2-vitl` | 326,0 M | no aplica | no disponible | MIT | HuggingFace, safetensors nativos de Lucid, librería lucid |
| `facebook/vjepa2-vitl-fpc64-256` | 326,0 M (mismo origen) | no aplica | no disponible en la información | MIT (heredada de este repositorio) | HuggingFace, safetensors originales |
| Otras familias de clasificación de vídeo (VideoMAE, InternVideo2, etc.) | no disponible | no aplica | no disponible | no disponible | No se dispone de datos comparativos en la información proporcionada |

La comparación directa relevante es con el modelo de origen: `lucid-dl/vjepa2-vitl` no introduce cambios de pesos, sino una conversión de formato y una integración con la librería Lucid, con preprocesado empaquetado con los pesos. No se han proporcionado datos de rendimiento que permitan comparar numéricamente con alternativas de la misma categoría.

## Limitaciones y advertencias

- No se han publicado métricas de rendimiento: no se puede garantizar ninguna precisión sobre Kinetics-700, Something-Something-v2 ni Diving48.
- Repositorio sin validación de la comunidad: 0 descargas y 0 likes en la fecha de creación indicada, sin evidencia externa de uso en producción.
- La paridad numérica con los pesos originales la declara el propio autor; no se aporta evidencia independiente en la información disponible.
- El ejemplo de uso de la model card pasa `preprocess(image)[None]`, es decir, un tensor de imagen única, a un modelo etiquetado como ViT-L/16 con variante `FPC64_256`. Conviene verificar el formato de entrada esperado (clips de vídeo con el número de fotogramas correcto) antes de integrarlo.
- Riesgo de clasificación errónea en dominios alejados de los datos de preentrenamiento; como todo modelo de visión, puede degradarse con cambios de iluminación, ángulos de cámara, resolución o calidad de compresión.
- Sesgos potenciales heredados de los datos de preentrenamiento: los datasets de vídeo de internet sobrerrepresentan determinadas culturas, entornos y actividades, lo que puede sesgar las predicciones en contextos poco representados. No se documenta ningún análisis de sesgo.
- Sin capacidades generativas: el modelo clasifica y extrae representaciones, no genera texto, código ni descripciones, por lo que no sustituye a un modelo multimodal generativo.
- Sin soporte de texto ni multilingüismo: no procesa instrucciones, prompts ni tool calling.
- Restricciones de licencia: licencia MIT, que permite uso comercial y modificación siempre que se conserve el aviso de copyright y la atribución. No obstante, conviene verificar la licencia del repositorio original de Facebook antes de un despliegue comercial.
- Longitud de contexto y límites de entrada (número máximo de fotogramas, resolución) no documentados: hay que validarlos empíricamente.
- Dependencia de la librería Lucid: el uso documentado requiere ese paquete, lo que añade una dependencia de terceros con soporte no garantizado.
- Las búsquedas web realizadas no devolvieron documentación técnica adicional sobre este repositorio concreto; los resultados obtenidos corresponden a entidades homónimas sin relación (Lucid Motors, Lucidchart, Lucid Trading).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/lucid-dl/vjepa2-vitl
- Artículo V-JEPA 2: https://arxiv.org/abs/2506.09985
- Repositorio original de pesos: https://huggingface.co/facebook/vjepa2-vitl-fpc64-256
- Librería Lucid: https://github.com/ChanLumerico/lucid
- No se han encontrado otras fuentes relevantes (papers adicionales, blogs, demos o repositorios) en la búsqueda web realizada.
