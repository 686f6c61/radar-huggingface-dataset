# nativ-community/clef-flash-MLX-NVFP4

## Resumen

clef-flash-MLX-NVFP4 es una conversión al formato MLX del modelo Cloudflare/clef-flash, publicada por la organización nativ-community y pensada para su ejecución local en Apple Silicon a través de la librería mlx-vlm. No es un modelo generativo de texto: Clef es un *decision model* multimodal que, en una sola pasada forward, devuelve una probabilidad para cada opción de cada pregunta planteada, lo que lo sitúa en la categoría de modelos de clasificación y enrutamiento, no en la de asistentes conversacionales.

El modelo declara 9.531.576.561 parámetros (unos 9,5 mil millones) y se distribuye cuantizado en NVFP4 con tamaño de grupo 16 (4 bits), en un repositorio de 6,2 GB. La tarea declarada en HuggingFace es image-text-to-text y la model card menciona soporte para entradas de texto, imagen, vídeo, dos imágenes e imagen+vídeo, además de parámetros de control de preprocesado como `max_pixels`, `fps` y `num_frames`. La licencia es Apache 2.0.

Su relevancia es acotada pero específica: permite ejecutar en local, sin conexión y sobre hardware de Apple, un modelo multimodal que recibe texto e imagen o vídeo y devuelve distribuciones de probabilidad sobre un conjunto cerrado de opciones. Ese patrón es habitual en triaje de tickets, moderación de contenido y enrutamiento automático de intenciones, donde interesa una etiqueta calibrada y no una respuesta en lenguaje natural.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No especificada en la información disponible (modelo de decisión multimodal, pipeline image-text-to-text) |
| Parámetros totales | 9.531.576.561 (~9,5 mil millones) |
| Parámetros activos | No disponible (no se documenta que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | NVFP4, group size 16 (4 bits); repositorio de 6,2 GB |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo, los datos de entrenamiento, el número de tokens, la composición del dataset ni si hubo etapas de RLHF o DPO. Lo único documentado es que se trata de una conversión MLX del modelo `Cloudflare/clef-flash` (revisión de origen `17f0b0ad64efb65d273590632833508766b2aae6`), realizada para mlx-vlm, y que el modelo subyacente es un *decision model*: produce una probabilidad por opción y no genera texto.

La innovación técnica destacable no está en el entrenamiento, sino en el formato de despliegue y en la verificación de la conversión. El autor reporta tokens idénticos en 11/11 registros de referencia, que cubren texto, imagen, vídeo, imagen+vídeo, dos imágenes, `max_pixels`, `fps` y `num_frames`, y la misma respuesta que la referencia oficial en PyTorch (fp32) en 25/25 preguntas, con una diferencia máxima de probabilidad de 0,086. Esa brecha es coherente con la pérdida introducida por la cuantización a 4 bits.

## Capacidades

- Decisión multiopción en una sola pasada forward: devuelve una probabilidad para cada opción de cada pregunta formulada, sin decodificación autorregresiva.
- Entrada multimodal: texto, imagen, vídeo, pares de imágenes e imagen+vídeo.
- Preguntas estructuradas mediante el campo `type: "choice"`, con `instructions` y lista de `criteria`.
- Recuperación de la opción ganadora a través de `result["answers"][<campo>]["value"]`.
- Control fino del preprocesado visual mediante `max_pixels`, `fps` y `num_frames`.
- No genera texto libre: el resultado es una distribución de probabilidad, no una respuesta redactada.
- No se documenta soporte de tool calling ni function calling.
- No se documenta modo de razonamiento extendido (*thinking*) ni razonamiento multi-paso explícito.
- Capacidades multilingües: no disponible.

## Casos de uso

- Triaje de tickets de soporte: el modelo recibe el texto de la incidencia y devuelve la probabilidad de que corresponda a facturación, soporte técnico o ventas. El ejemplo de la model card ilustra exactamente este escenario con la consulta "Please refund my duplicate charge".
- Enrutamiento de intenciones en un asistente: sustituye a un clasificador entrenado a medida devolviendo, en una sola pasada, la distribución sobre las intenciones candidatas, lo que simplifica el mantenimiento del pipeline.
- Moderación de contenido multimodal: combinando texto e imagen, permite asignar una probabilidad a categorías como apto, spam o contenido restringido, con umbrales ajustables por el operador.
- Clasificación de vídeo: gracias a los parámetros `fps` y `num_frames`, se puede muestrear un vídeo y obtener una decisión sobre categorías predefinidas sin extraer fotogramas manualmente.
- Verificación de identidad de producto o documento: con dos imágenes de entrada, el modelo puede decidir entre opciones como coincidente, no coincidente o ilegible.
- Guardarraíles en pipelines generativos: colocado antes de un LLM generativo, decide si la petición debe pasar, bloquearse o derivarse, reduciendo coste y latencia en el resto de la cadena.
- Anotación asistida de datasets: generar etiquetas probabilísticas sobre grandes lotes de texto e imagen para priorizar la revisión humana de los casos de baja confianza.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

El único dato de validación numérica aportado por el autor es la verificación de la conversión MLX frente a la referencia oficial: tokens idénticos en 11/11 registros de referencia (texto, imagen, vídeo, imagen+vídeo, dos imágenes, `max_pixels`, `fps`, `num_frames`), misma respuesta en 25/25 preguntas y una diferencia máxima de probabilidad de 0,086. No se trata de una evaluación de calidad del modelo, sino de una comprobación de fidelidad de la cuantización.

## Requisitos de hardware

- Pesos cuantizados a 4 bits (NVFP4) que ocupan 6,2 GB; la inferencia requiere aproximadamente 8 GB de memoria unificada contando pesos y cachés.
- Formato MLX: se ejecuta sobre Apple Silicon (familias M1, M2, M3 y M4), no sobre GPU NVIDIA o AMD mediante CUDA o ROCm.
- Cabe en Macs con memoria unificada de 16 GB o superior; en configuraciones de 8 GB el margen es insuficiente.
- Opciones de despliegue: exclusivamente mlx-vlm, y solo mediante la rama `Lazarus-931/mlx-vlm@feat/clef` (commit `c16f81aa`), ya que el soporte de Clef no está incluido en ninguna release pública de mlx-vlm.
- No compatible con vLLM, llama.cpp, Ollama ni TGI, al menos con estos pesos en formato MLX.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables en la misma categoría (modelos de decisión multimodal ejecutables en local con salida de probabilidades por opción).

La única comparación posible es con el propio modelo de origen:

| Modelo | Parámetros | Formato | Cuantización | Plataforma | Licencia |
|---|---|---|---|---|---|
| Cloudflare/clef-flash | No disponible | PyTorch | fp32 (referencia) | GPU genérica | No disponible |
| clef-flash-MLX-NVFP4 | 9.531.576.561 | MLX safetensors | NVFP4, group size 16 | Apple Silicon | Apache 2.0 |

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto, resúmenes ni respuestas redactadas; solo distribuciones de probabilidad sobre opciones predefinidas.
- Requiere una rama no publicada de mlx-vlm, lo que implica un riesgo de mantenimiento y de ruptura en actualizaciones futuras de la librería.
- El repositorio registra 0 descargas y 0 *likes* en el momento de la consulta: no hay validación independiente por parte de la comunidad.
- No hay benchmarks publicados de MMLU, HumanEval, GSM8K ni de ninguna otra evaluación estándar, por lo que no es posible estimar su calidad frente a alternativas.
- La cuantización a 4 bits introduce una desviación de hasta 0,086 en las probabilidades respecto a la referencia en fp32, relevante si se aplican umbrales de decisión ajustados.
- Exclusivo de Apple Silicon: no desplegable en clústeres con GPU NVIDIA, lo que limita su uso en producción a gran escala.
- Idiomas soportados no documentados: se desconoce si el modelo mantiene calidad fuera del inglés.
- Sesgos conocidos: no disponibles.
- Riesgo de alucinación: no aplica en el sentido habitual, pero sí existe riesgo de clasificación errónea con alta confianza en dominios alejados de los datos de entrenamiento.
- Licencia Apache 2.0: permite uso comercial y modificaciones, con obligación de conservar el aviso de licencia y de indicar los cambios realizados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/nativ-community/clef-flash-MLX-NVFP4
- Modelo base: https://huggingface.co/Cloudflare/clef-flash
- Repositorio mlx-vlm: https://github.com/Blaizzy/mlx-vlm
- Rama con soporte de Clef: https://github.com/Lazarus-931/mlx-vlm/tree/feat/clef
- Aplicación Nativ (ejecución local de modelos en Apple Silicon): https://blaizzy.github.io/nativ/
