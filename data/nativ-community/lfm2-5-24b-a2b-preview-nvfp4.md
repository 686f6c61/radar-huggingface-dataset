# nativ-community/LFM2.5-24B-A2B-Preview-nvfp4

## Resumen

LFM2.5-24B-A2B-Preview-nvfp4 es una conversión a formato MLX del modelo LFM2.5-24B-A2B-Preview de Liquid AI, publicada por la comunidad nativ-community (y también por mlx-community) para su ejecución en hardware Apple Silicon. Se trata de un modelo de generación de texto con arquitectura de mezcla de expertos (MoE), 23.971.587.712 parámetros totales y aproximadamente 2.000 millones de parámetros activos por token, lo que permite un coste de decodificación muy bajo pese al tamaño total del modelo. Está cuantizado en NVFP4 (4 bits, group size 16) con las proyecciones del router en 8 bits afines (group size 64).

El modelo base pertenece a la familia LFM2.5 de Liquid AI, que abarca desde LFM2.5-230M hasta este LFM2.5-24B-A2B, el mayor y último de la familia. A diferencia de LFM2-24B-A2B, esta versión incorpora razonamiento explícito: la plantilla de chat abre cada turno del asistente con una etiqueta `<think>`, de modo que la respuesta incluye una cadena de pensamiento antes de la contestación final. La configuración de origen especifica una ventana de contexto de 131.072 tokens.

La relevancia de esta ficha en concreto radica en que no es el modelo original, sino una conversión comunitaria con licencia heredada LFM Open License v1.0 y soporte MLX-VLM, pensada para desplegar agentes locales sobre Mac con memoria unificada, sin depender de APIs en la nube. El repositorio ocupa 13,5 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mezcla de expertos), tag `lfm2_moe`; composición interna de capas no disponible |
| Parametros totales | 23.971.587.712 (~24B) |
| Parametros activos | ~2B por token (denominación A2B) |
| Longitud de contexto | 131.072 tokens (según configuración de origen) |
| Tipos de cuantizacion | NVFP4 weight-only, 4 bits, group size 16; router en affine 8 bits, group size 64; pesos no cuantizados en BF16; sesgos de routing de expertos en FP32 |
| Idiomas soportados | en, ar, zh, fr, de, ja, ko, es, pt, it |
| Licencia | LFM Open License v1.0 (`license: other`, license_name: lfm1.0) |
| Formato de pesos | MLX safetensors (librería `mlx`) |

## Arquitectura y entrenamiento

El modelo sigue un diseño de mezcla de expertos (MoE) identificado con la etiqueta `lfm2_moe`, con 24B de parámetros totales pero solo unos 2B activos por token. Esa proporción es la clave de su propuesta: el coste de cómputo por token generado se aproxima al de un modelo de 2B, mientras que la capacidad almacenada corresponde a un modelo de 24B. La información disponible no detalla el número de expertos, la composición exacta de capas (atención, convolución u otras) ni la proporción entre capas densas y MoE, por lo que esos datos quedan como no disponibles.

El modelo de origen es un modelo de razonamiento: según la documentación de Liquid AI, la plantilla de chat abre cada turno del asistente con `<think>`, generando una cadena de pensamiento explícita antes de la respuesta final. Esta conversión concreta es una exportación de pesos realizada con el CLI de MLX-VLM sobre un Apple M3 Ultra, fijada a la revisión `f772950ce6f17d35af5469d00334b61a9c2fc034` del repositorio base, con cuantización NVFP4 de solo pesos. No se especifican en la información proporcionada el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO.

La validación realizada por el autor de la conversión consiste en una recarga con coincidencia estricta de pesos, comprobación de logits finitos en prefill y decodificación con caché, y dos pruebas cortas de generación greedy que devolvieron correctamente "Paris" y "391" alcanzando EOS. El propio autor advierte que son pruebas de humo, no una evaluación de calidad exhaustiva ni un benchmark de contexto largo.

## Capacidades

- Generación de texto conversacional en diez idiomas: inglés, árabe, chino, francés, alemán, japonés, coreano, español, portugués e italiano.
- Razonamiento explícito: cada turno del asistente incluye una fase de pensamiento dentro de `<think>` antes de la respuesta final, lo que implica que hay que reservar suficientes tokens de salida.
- Soporte de agentes y tareas de varios pasos, según la documentación de Liquid AI para la familia LFM2.5.
- Llamada a herramientas (tool calling) como parte del uso previsto en entornos de agentes, según la documentación de Liquid AI.
- Conversión multi-turno con contexto largo: la plantilla de chat incluida permite mantener conversaciones extensas hasta la ventana especificada.
- Ejecución local en hardware Apple Silicon mediante MLX y MLX-VLM.
- No se documentan en la información disponible capacidades de visión o audio para este modelo concreto, pese a que el repositorio incluya la etiqueta `mlx-vlm` y que la familia LFM de Liquid AI cubra también modelos de visión y audio.

## Casos de uso

- Agentes locales en Mac: al tener solo ~2B parámetros activos, cada token de razonamiento es barato, lo que permite mantener bucles de agente en ejecución continua sobre memoria unificada de un Apple Silicon, sin coste por token de API y sin enviar datos a la nube.
- Asistentes de atención al cliente multi-turno: la ventana de 131.072 tokens permite arrastrar el historial de una conversación larga y documentación de producto sin truncar el contexto.
- Automatización de tareas con llamada a herramientas: integración en flujos donde el modelo decide qué función invocar (consultas a bases de datos, APIs internas) y encadena varios pasos de razonamiento antes de responder.
- Procesamiento de documentación multilingüe: con soporte para diez idiomas, sirve para resumir, clasificar o extraer información de documentos en inglés, español, francés, alemán, chino, japonés, árabe, coreano, portugués e italiano.
- Prototipado y evaluación de modelos de razonamiento en local: al ser una conversión cuantizada en 4 bits, permite probar el comportamiento de un MoE de 24B en un portátil o equipo de sobremesa Apple sin infraestructura GPU.
- Análisis confidencial de datos sensibles: sectores como sanitario, legal o financiero pueden ejecutar el modelo íntegramente en local, evitando la exposición de datos a proveedores externos.
- Generación de borradores con traza de razonamiento: útil en escenarios donde interesa auditar cómo llegó el modelo a una conclusión, ya que la cadena de pensamiento queda explícita en la salida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La información proporcionada únicamente menciona dos pruebas de humo de generación greedy ("Paris" y "391") que alcanzaron EOS correctamente, sin métricas de calidad, latencia o throughput.

## Requisitos de hardware

- Los pesos ocupan 13,49 GB (decimales) según la model card; el consumo en tiempo de ejecución debe sumar caché KV y asignaciones temporales.
- El formato es MLX, por lo que está orientado a Apple Silicon con memoria unificada. No es un artefacto GGUF ni safetensors estándar para CUDA.
- La conversión se generó y probó en un Apple M3 Ultra; se recomienda un equipo con al menos 24 GB de memoria unificada para acomodar pesos y caché con margen.
- No se documentan en la información disponible estimaciones de latencia ni de tokens por segundo.
- Despliegue mediante MLX-VLM: se instala la versión de `mlx-vlm` correspondiente al PR #2505 (commit `a6c7313bc053e5887616fa850808d21576eddf98`), MLX 0.32.3 y Transformers 5.17.0, y se ejecuta con `python -m mlx_vlm generate`.
- Para el modelo original en BF16 fuera de MLX, no se detallan requisitos de VRAM específicos en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Formato / disponibilidad |
|---|---|---|---|---|---|
| nativ-community/LFM2.5-24B-A2B-Preview-nvfp4 (este) | 23,97B | ~2B | 131.072 | LFM Open License v1.0 | MLX safetensors, repositorio comunitario |
| lq-preview/LFM2.5-24B-A2B-Preview (base) | 23,97B (según derivación de la conversión) | ~2B | 131.072 (según configuración heredada) | no disponible en la información | safetensors, repositorio de previsualización |
| LiquidAI/LFM2.5-24B-A2B | 24B | 2B | no disponible en la información | no disponible en la información | repositorio oficial de Liquid AI |
| LFM2-24B-A2B | 24B | 2B | no disponible en la información | no disponible en la información | versión previa, sin modo de razonamiento explícito obligatorio |

Las cifras de rendimiento comparado no están disponibles: la información proporcionada no incluye benchmarks de ninguno de estos modelos, por lo que la comparación se limita a parámetros, contexto, licencia y formato.

## Limitaciones y advertencias

- El identificador del modelo incluye "Preview" y el autor de la conversión indica que se fijó a una revisión concreta del repositorio base, lo que sugiere que el modelo original podría cambiar o haber cambiado respecto a esa revisión.
- Las únicas validaciones publicadas son pruebas de humo (dos generaciones greedy cortas); no hay evaluación de calidad, de sesgos ni de rendimiento en contexto largo.
- Al ser un modelo de razonamiento que siempre emite `<think>`, se consumen tokens de salida adicionales en cada turno; hay que ajustar `max-tokens` para no truncar la respuesta final.
- Riesgo de alucinación inherente a los modelos generativos: no hay datos publicados en la información disponible sobre tasas de error o fiabilidad factual.
- La licencia es LFM Open License v1.0 (etiquetada como `license: other`); es imprescindible revisar sus términos antes de cualquier uso comercial, ya que no es una licencia OSI estándar y la información proporcionada no detalla sus restricciones.
- El artefacto está empaquetado para MLX: no es directamente utilizable en pilas CUDA estándar (vLLM, TGI) sin recurrir al modelo original en otro formato.
- El repositorio registra 0 descargas y 0 likes en el momento de los datos, por lo que no existe aún validación de la comunidad sobre esta conversión concreta.
- La cuantización NVFP4 de solo pesos puede degradar la calidad respecto al modelo en BF16; no se publican métricas que cuantifiquen esa pérdida.
- No se detalla el comportamiento del modelo más allá de la ventana de 131.072 tokens ni cómo gestiona entradas que la superan.

## Enlaces

- Modelo en HuggingFace (nativ-community): https://huggingface.co/nativ-community/LFM2.5-24B-A2B-Preview-nvfp4
- Copia en mlx-community: https://huggingface.co/mlx-community/LFM2.5-24B-A2B-Preview-nvfp4
- Modelo base (previsualización): https://huggingface.co/lq-preview/LFM2.5-24B-A2B-Preview
- Modelo oficial de Liquid AI: https://huggingface.co/LiquidAI/LFM2.5-24B-A2B
- Blog de Liquid AI sobre LFM2.5-24B-A2B: https://www.liquid.ai/blog/lfm2-5-24b-a2b
- Documentación de Liquid AI sobre el modelo: https://docs.liquid.ai/lfm/models/lfm25-24b-a2b
- Página de modelos de Liquid AI: https://www.liquid.ai/models
- PR de soporte en MLX-VLM: https://github.com/Blaizzy/mlx-vlm/pull/2505
- Artículo de análisis (dev48.org): https://dev48.org/en/articles/run-fast-private-agents-on-device-with-lfm25-24b-a2b
