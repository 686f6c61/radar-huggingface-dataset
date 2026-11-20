# litert-community/Shieldstral-1.0-3B

## Resumen

Shieldstral-1.0-3B es un clasificador de seguridad de 3.000 millones de parámetros derivado de `mistralai/Shieldstral-1.0-3B`, convertido por la comunidad `litert-community` al formato `.litertlm` para ejecutarse con el runtime LiteRT-LM de Google. Su propósito no es conversar, sino responder una única pregunta binaria (sí/no) sobre un documento concreto, aplicando una política de moderación que se especifica en tiempo de inferencia en lenguaje natural. Esto permite cubrir políticas nuevas sin reentrenar el modelo.

La relevancia práctica del artefacto está en el despliegue: al estar empaquetado para LiteRT-LM, el clasificador corre íntegramente en dispositivo (móvil, tableta, portátil o Raspberry Pi) sin llamada de red, con cuantizaciones int4 e int8 y variantes multimodales que incorporan la torre de visión Pixtral para moderar imágenes. La ventana de contexto exportada es de 4096 tokens de caché KV, con gráficos de prefill completos de 2048 a 1.

El modelo base procede de Mistral AI y se distribuye bajo licencia Apache 2.0. La conversión mantiene los pesos del checkpoint original y solo cambia el formato y la receta de cuantización; los datos de arquitectura interna, composición del dataset de entrenamiento y proceso de alineación del modelo original no se detallan en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (modelo base Mistral); variante multimodal con torre de visión Pixtral |
| Parámetros totales | 3B (aproximado, según denominación del modelo) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 4096 tokens (caché KV exportada); documentos de más de ~4000 tokens requieren reexportación con caché mayor |
| Tipos de cuantización | int4 blockwise-32 (OCTAV) + embedding int8; int8 dinámico en exportación; int4-b32 para decodificador con torre Pixtral int8 |
| Idiomas soportados | en, fr, es, de, it, pt, nl, zh, ja, ko, ar, ru |
| Licencia | Apache 2.0 |
| Formato de pesos | `.litertlm` (LiteRT-LM); variantes texto e imagen |

## Arquitectura y entrenamiento

El modelo base es un transformer decoder-only de Mistral AI de aproximadamente 3B parámetros, especializado como clasificador de seguridad. La innovación clave del diseño es que la política de moderación se inyecta en el prompt en lenguaje natural mediante tres campos (`<Instruct>`, `<Query>`, `<Document>`), de modo que un único checkpoint sirve para múltiples políticas sin reentrenamiento. La salida es un único token (`yes` o `no`) en un solo paso forward, o bien una puntuación continua obtenida mediante softmax sobre los logits de ambos candidatos, que es lo que el modelo original umbraliza a 0.5.

La conversión a LiteRT-LM externaliza el embedder y aplica cuantización int4 blockwise-32 (OCTAV) con embeddings int8 para la variante de texto, y añade una torre de visión Pixtral int8 con resolución estática de 560×560 en las variantes multimodales. Los detalles sobre el número de tokens de entrenamiento, composición del dataset y uso de RLHF/DPO del modelo original no están disponibles en la información proporcionada. La variante `_int4_gpu` reexporta el decodificador con litert-converter 0.3.1 para que el softmax de atención se traduzca a un builtin `SOFTMAX`, corrigiendo un fallo de delegación en GPU móvil.

## Capacidades

- Clasificación binaria de seguridad: responde `yes` o `no` a una pregunta sobre un documento en un único paso forward.
- Puntuación continua de riesgo mediante softmax sobre los logits de `yes`/`no` (requiere API de scoring y dos prefills en LiteRT-LM).
- Política de moderación adaptable en tiempo de inferencia mediante lenguaje natural en el campo `<Instruct>`.
- Moderación de texto en 12 idiomas: inglés, francés, español, alemán, italiano, portugués, neerlandés, chino, japonés, coreano, árabe y ruso.
- Moderación de imágenes en las variantes con torre Pixtral (resolución estática 560×560).
- Ejecución totalmente en dispositivo sin llamada de red.
- No es un modelo conversacional: no mantiene diálogo multi-turno ni genera texto libre; cada documento debe evaluarse en un chat nuevo en la demo web.

## Casos de uso

- Moderación de comentarios en aplicaciones móviles: el archivo int4 (1,82 GiB de sección principal) cabe en un iPhone y clasifica cada comentario localmente, evitando enviar contenido del usuario a un servidor y reduciendo costes de infraestructura.
- Filtrado de contenido generado por el usuario en foros y comunidades: se define la política en `<Instruct>` (categorías, nivel de strictness) y se evalúa cada publicación con una pregunta binaria, sin reentrenar el modelo al cambiar las normas.
- Moderación de imágenes en apps de mensajería: la variante `vision_int4_gpu` permite clasificar adjuntos fotográficos en el propio dispositivo con la torre Pixtral, útil cuando la política de privacidad impide subir imágenes.
- Gatekeeping previo a un LLM generativo: actuar como primera barrera que descarta prompts o documentos inseguros antes de invocar un modelo mayor en la nube, reduciendo coste y exposición.
- Cumplimiento normativo en despliegues edge: en entornos con requisitos de residencia de datos (sanidad, educación, administración), el clasificador procesa el contenido sin salir del dispositivo.
- Moderación multilingüe en mercados europeos y asiáticos: al cubrir 12 idiomas, una sola implementación sirve para comunidades con contenido en español, francés, alemán, árabe o japonés.
- Evaluación por lotes de corpus: la puntuación continua (softmax sobre logits) permite ordenar documentos por riesgo en lugar de aplicar un corte binario, útil para triaje de datasets.

## Benchmarks y rendimiento

Evaluación de calidad sobre 200 ítems estratificados (100 inseguros / 100 seguros) del conjunto público OpenAI moderation evaluation, receta de cribado amplio del modelo original, umbral 0.5, referencia fp32 en MPS:

| Ejecución | F1 | Accuracy | Concordancia con referencia | r (margen de logits) | Cambios de etiqueta |
|---|---|---|---|---|---|
| fuente fp32 (referencia) | 85.0 | 83.0 | — | — | — |
| variantes convertidas | no disponible (dato truncado en la model card) | no disponible | no disponible | no disponible | no disponible |

Rendimiento en dispositivo (edge-compat, Galaxy S26, LiteRT-LM 0.16.0):

| Variante | Backend | Decode | Prefill | TTFT | Notas |
|---|---|---|---|---|---|
| `shieldstral-1.0-3b-int8` | GPU | 8,6 tok/s | 289 tok/s | 910 ms | 1187/1187 ops delegadas |
| `shieldstral-1.0-3b-int8` | CPU | 8,3 tok/s | 129 tok/s | 1,91 s | — |
| `shieldstral-1.0-3b-vision-int4` | GPU | no ejecuta | no ejecuta | no ejecuta | `engine_create_failed` |
| `shieldstral-1.0-3b-vision-int4` | CPU | 1,9 tok/s | 33 tok/s | 7,48 s | — |

## Requisitos de hardware

- VRAM/RAM: variante texto int4 con 1,82 GiB de sección principal y 2,20 GiB de archivo; variante texto int8 con 3,33 GiB de sección y 3,71 GiB de archivo; variantes visión con 1,82 GiB de decodificador y 2,78 GB de archivo.
- Cabe en consumer GPU y en móviles: la int4 es la única variante de texto que encaja en un iPhone (el presupuesto práctico de mmap en iOS ronda 2,1 GiB con entitlements por defecto; incluso apps con entitlements relajados no superan los 3 GiB en hardware actual).
- La int8 está pensada para escritorio o dispositivos con alta memoria.
- GPU recomendadas: no se especifican modelos concretos de A100/H100/RTX 4090; las mediciones publicadas son sobre GPU móvil de Galaxy S26 y CPU del mismo dispositivo.
- En GPU móvil, para las variantes de visión debe usarse `_int4_gpu`; el archivo de visión original no carga en GPU móvil porque litert-converter 0.3.0 no baja el compuesto `odml.softmax` y el delegado solo acepta 52 de 1187 ops.
- Opciones de despliegue: runtime LiteRT-LM (versión 0.16.0 en las mediciones), demo web con WebGPU, y API de scoring para la puntuación continua.
- Latencia/throughput: TTFT de 910 ms en GPU y 1,91 s en CPU para la variante int8 de texto; decode de 8,6 y 8,3 tok/s respectivamente.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modalidad | Licencia | Formato edge |
|---|---|---|---|---|---|
| Shieldstral-1.0-3B (LiteRT-LM) | ~3B | 4096 tokens | texto; texto+imagen en variantes visión | Apache 2.0 | `.litertlm` |
| `mistralai/Shieldstral-1.0-3B` (original) | ~3B | no disponible | texto; visión según checkpoint | Apache 2.0 | safetensors |
| Clasificadores de moderación tipo OpenAI moderation API | no disponible | no disponible | texto e imagen | propietaria / servicio | no (API en nube) |

No se dispone de datos de benchmarks comparativos con otras alternativas en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo conversacional: no mantiene diálogo, no genera explicaciones y una pregunta directa devuelve solo `yes` o `no`.
- Contexto limitado a 4096 tokens de caché KV; documentos de más de ~4000 tokens requieren reexportar con una caché mayor.
- En la demo web solo se carga el archivo de texto, por lo que no evalúa imágenes; además, cada documento debe ir en un chat nuevo.
- La variante de visión int4 original no arranca en GPU móvil (`engine_create_failed`); es obligatorio usar `_int4_gpu` en ese backend.
- El rendimiento de la variante de visión en CPU es bajo (1,9 tok/s de decode, TTFT de 7,48 s), poco adecuado para moderación interactiva.
- Los resultados de calidad de las variantes convertidas frente a la referencia fp32 aparecen truncados en la model card; no se puede confirmar la degradación exacta por cuantización.
- Riesgo de sesgo y de alucinación inherente al modelo base: no se documentan análisis de sesgo ni tasas de falsos positivos/negativos por idioma o categoría.
- Uso comercial permitido por Apache 2.0, sin restricciones adicionales indicadas, pero la responsabilidad sobre la política de moderación recae en quien la define en `<Instruct>`.
- La puntuación continua requiere dos prefills en LiteRT-LM, lo que duplica el coste de inferencia respecto al veredicto binario.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/litert-community/Shieldstral-1.0-3B
- Modelo base: https://huggingface.co/mistralai/Shieldstral-1.0-3B
- Demo web LiteRT-LM: https://google-ai-edge.github.io/LiteRT-LM/web_demos/chat/index.html?model=litert-community/Shieldstral-1.0-3B
- Ficha edge-compat int8: https://github.com/john-rocky/edge-compat/blob/main/cards/shieldstral-1.0-3b-int8/CARD.md
- Ficha edge-compat vision int4: https://github.com/john-rocky/edge-compat/blob/main/cards/shieldstral-1.0-3b-vision-int4/CARD.md
- Conjunto de evaluación de moderación de OpenAI: https://huggingface.co/datasets/mmathys/openai-moderation-api-evaluation
