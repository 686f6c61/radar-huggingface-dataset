# RunningHubAI/rh-minimax-h3-fl2v-turbo-8step-v1.0-768p-feihouremix-v0.6-compat-v001-t8-lora

## Resumen

Este repositorio contiene un adaptador LoRA de difusión para generación de vídeo, identificado como `rh-minimax-h3-fl2v-turbo-8step-v1.0-768p-feihouremix-v0.6-compat-v001-t8-lora`. Lo publica la cuenta `RunningHubAI` en nombre del autor `@darkHUB`, dentro de la plataforma RunningHub, y está afinado a partir del modelo base `minimax-h3`. No es un modelo de lenguaje ni un modelo multimodal de texto: es un conjunto de pesos LoRA (1866 MiB en `safetensors`) pensado para cargarse junto al modelo base en ComfyUI, en la propia plataforma RunningHub o desde Hugging Face.

La nomenclatura del identificador resume sus rasgos principales: variante `fl2v` (generación de vídeo a partir de fotogramas), destilación `turbo` de 8 pasos (`8step`, `T8`), resolución de trabajo a 768p, una mezcla de estilo o receta de ajuste denominada `FeiHouRemix` en versión `v0.6` y una revisión de compatibilidad `compat v001`. La familia upstream MiniMax H3 Turbo dispone, según la documentación pública de terceros, de una ruta de destilación a 8 pasos capaz de generar vídeo con audio, lo que sitúa a este adaptador en el segmento de generación de vídeo con pocos pasos de inferencia.

La relevancia del repositorio es limitada por su estado: cero descargas y cero «likes» en el momento de la consulta, licencia no declarada explícitamente y una model card muy escueta que remite al proyecto original. Resulta útil, por tanto, como pieza de una familia de LoRAs publicadas en serie por el mismo autor (variantes de 4 pasos, de 8 pasos y variantes «pruned»), más que como un modelo validado por la comunidad.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (adaptador LoRA sobre el modelo base `minimax-h3`; la arquitectura del base no se detalla en la información disponible) |
| Parámetros totales | no disponible (el fichero de pesos ocupa 1866 MiB) |
| Parámetros activos | no aplicable (no es un modelo MoE) |
| Longitud de contexto | no aplicable / no disponible (modelo de difusión de vídeo, no de texto) |
| Tipos de cuantización | no disponible para este adaptador; el mismo autor publica variantes de la familia con pesos bf16 y etiqueta `comfyui-bf16` |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card indica que se siga la licencia del proyecto original o upstream y que el copyright permanece en el autor) |
| Formato de pesos | safetensors (pesos LoRA) |
| Tipo de modelo | LoRA de difusión para generación de vídeo |
| Modelo base | minimax-h3 |
| Resolución | 768p |
| Pasos de inferencia | 8 (sufijo `8step` / `T8`) |
| Tamaño del repositorio | 2,0 GB |
| Fichero principal | `minimax_h3_fl2v_turbo_8step_v1.0_768p_FeiHouRemix_v0.6_compat_v001_T8.safetensors` (1866 MiB) |
| Plataformas compatibles | ComfyUI, RunningHub, Hugging Face |
| Fecha de publicación | 29 de septiembre de 2026 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA, es decir, un conjunto de matrices de bajo rango que se aplican sobre los pesos del modelo base `minimax-h3` sin reentrenar el modelo completo. El nombre del fichero indica que se trata de una destilación orientada a inferencia en 8 pasos a 768p, una práctica habitual en modelos de difusión de vídeo para reducir drásticamente el coste por clip. La etiqueta `compat v001` sugiere una revisión de compatibilidad con una versión concreta del base, y `FeiHouRemix v0.6` apunta a una receta de mezcla o ajuste propio del autor.

No se dispone de información sobre el conjunto de datos de entrenamiento, el número de pasos de entrenamiento, el número de tokens o fotogramas vistos, ni sobre el uso de técnicas de ajuste por preferencias (RLHF, DPO u otras). La model card no incluye hiperparámetros, receta de destilación ni evaluación. Como referencia externa, la documentación de ComfyUI Wiki sobre MiniMax H3 Turbo Ref2VA 8-Step v1.0 describe una destilación a 8 pasos y 768p de la ruta referencia-a-vídeo realizada por los equipos Lightx2v y ModelTC, que genera vídeo con audio partiendo de una o varias imágenes de referencia; no consta que este LoRA concreto derive de ese mismo proceso.

## Capacidades

- Generación de vídeo mediante la ruta `fl2v` (vídeo a partir de fotogramas) sobre el modelo base `minimax-h3`, con destino a 768p y 8 pasos de muestreo.
- Aplicación como LoRA: modifica el comportamiento del base sin sustituirlo, por lo que hereda las capacidades del modelo sobre el que se carga.
- Integración en flujos de trabajo de ComfyUI y en la plataforma RunningHub, incluyendo su API.
- Posible generación de audio asociada al vídeo si el base cargado es la variante con audio de la familia H3 Turbo; no confirmado para este adaptador concreto.
- No hay evidencia en la información disponible de soporte de tool calling, function calling, razonamiento multi-paso, agentes ni generación de texto.

## Casos de uso

- Interpolación entre primer y último fotograma: dado un par de imágenes de entrada y salida, el adaptador genera la transición en vídeo a 768p, un caso típico en animación de viñetas y en montaje publicitario.
- Prototipado rápido de clips en ComfyUI: con 8 pasos de muestreo en lugar de una cadena completa de difusión, permite iterar sobre ideas visuales con un coste por prueba reducido.
- Previsualización de storyboards: convertir bocetos o fotogramas clave en animáticas antes de comprometer un render final de mayor calidad.
- Producción de contenido para redes: clips cortos en 768p generados de forma repetible mediante un flujo guardado en ComfyUI.
- Automatización por API: la plataforma RunningHub expone una API que permite invocar el modelo desde un pipeline programático, útil para generar variantes a escala.
- Experimentación con estilos: al ser un LoRA, puede combinarse o compararse con otros adaptadores compatibles de la misma familia (4 pasos, versiones «pruned») para ajustar el equilibrio entre fidelidad y velocidad.
- Evaluación comparativa de destilaciones: sirve como punto de referencia interno frente a la variante de 4 pasos del mismo autor para medir la pérdida de calidad al reducir pasos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada.
- El adaptador añade 1866 MiB de pesos al espacio ocupado por el modelo base `minimax-h3`, que debe cargarse además en memoria; el requisito total depende del base y no está documentado aquí.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: ComfyUI (flujo de trabajo con nodos LoRA), plataforma RunningHub (ejecución en la nube y API) y descarga de pesos desde Hugging Face.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo y peso | Resolución y pasos | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `rh-minimax-h3-fl2v-turbo-8step-v1.0-768p-feihouremix-v0.6-compat-v001-t8-lora` (este) | LoRA, 1866 MiB | 768p, 8 pasos | safetensors | no disponible | Hugging Face, RunningHub |
| `rh-minimax-h3-fl2v-turbo-4step-v1.0-768p-comfyui-bf16.safetensors-lora` | LoRA, 1,96 GB | 768p, 4 pasos | safetensors (bf16) | no disponible | Hugging Face |
| `rh-minimax-h3-fl2v-turbo-8step-v1.0-768p-comfyui-bf16.safetensors-lora` | LoRA, tamaño no disponible | 768p, 8 pasos | safetensors (bf16) | no disponible | Hugging Face |
| `minimax_h3_fl2v_turbo_8step_v1.0_10ErosMax_beta1_pruned_compat_v001_T8` | LoRA con poda, tamaño no disponible | 768p, 8 pasos | no disponible | no disponible | RunningHub |
| MiniMax H3 Turbo Ref2VA 8-Step v1.0 (Lightx2v / ModelTC) | destilación del modelo base | 768p, 8 pasos, ruta referencia-a-vídeo con audio | no disponible | no disponible | documentado en ComfyUI Wiki |

La comparación se limita a la propia familia de adaptadores del autor y a la destilación upstream citada, porque no se ha encontrado documentación técnica ni métricas de los modelos base que permitan una comparación cuantitativa.

## Limitaciones y advertencias

- Licencia no declarada de forma explícita: la model card remite a la licencia del proyecto original o upstream, por lo que el uso comercial queda en un terreno jurídicamente ambiguo hasta verificarlo en la fuente original.
- Sin validación comunitaria: cero descargas y cero «likes» en el momento de la consulta, y ausencia de evaluación publicada.
- Model card mínima: no incluye receta de entrenamiento, hiperparámetros, datos de evaluación ni instrucciones de uso detalladas.
- Enlace externo en la model card: el README apunta a un sitio de terceros (`yesoco.xyz`) sin relación aparente con el proyecto; conviene verificar la procedencia antes de integrarlo en producción.
- Compatibilidad frágil: el sufijo `compat v001` implica dependencia de una revisión concreta del base `minimax-h3`; cargarlo con otra versión puede degradar el resultado.
- Riesgo de artefactos típicos de la difusión de vídeo: parpadeo temporal, incoherencia entre fotogramas y degradación en movimientos rápidos o escenas con mucha oclusión.
- Limitaciones de idioma y texto: no hay información sobre manejo de prompts multilingües ni sobre texto renderizado dentro del vídeo.
- Al ser un LoRA, su comportamiento depende por completo del modelo base con el que se combine; los resultados no son reproducibles sin conocer la versión exacta del base y la cadena de muestreo.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/RunningHubAI/rh-minimax-h3-fl2v-turbo-8step-v1.0-768p-feihouremix-v0.6-compat-v001-t8-lora
- Página del modelo en RunningHub: https://www.runninghub.ai/model/public/2095846035461906434
- Página del autor en RunningHub: https://www.runninghub.ai/user-center/2025565893677027330
- Plataforma RunningHub: https://www.runninghub.ai
- Documentación de la API de RunningHub (inglés): https://www.runninghub.cn/runninghub-api-doc-en/
- Variante de 4 pasos en Hugging Face: https://huggingface.co/RunningHubAI/rh-minimax-h3-fl2v-turbo-4step-v1.0-768p-comfyui-bf16.safetensors-lora/tree/main
- Variante de 8 pasos en Hugging Face: https://huggingface.co/RunningHubAI/rh-minimax-h3-fl2v-turbo-8step-v1.0-768p-comfyui-bf16.safetensors-lora
- Variante «pruned» en RunningHub: https://www.runninghub.ai/model/public/2087239557498994690
- Nota de ComfyUI Wiki sobre MiniMax H3 Turbo Ref2VA 8-Step v1.0: https://comfyui-wiki.com/en/news/2026-09-04-minimax-h3-turbo-ref2v-8step
- Sitio externo enlazado desde la model card: https://yesoco.xyz/#generator
- Entrenamiento de modelos en RunningHub: https://www.runninghub.ai/page-model
