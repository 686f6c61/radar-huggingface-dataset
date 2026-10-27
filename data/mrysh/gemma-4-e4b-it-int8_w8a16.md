# mrysh/gemma-4-e4b-it-int8_w8a16

## Resumen

`mrysh/gemma-4-e4b-it-int8_w8a16` es una versión cuantizada a INT8 del modelo multimodal `google/gemma-4-E4B-it` de Google DeepMind, publicada por el usuario mrysh. La cuantización es weight-only (W8A16): los pesos del decodificador de texto se almacenan en int8 con una escala por canal de salida, mientras que las activaciones se mantienen en 16 bits. Las torres de visión y audio se conservan íntegramente en 16 bits, de modo que el modelo sigue aceptando entradas de texto, imagen y audio como el original.

El repositorio no es un lanzamiento de producción, sino un artefacto de benchmark: forma parte de una comparativa de cuantización de 4 modelos x 8 técnicas, evaluada con vLLM sobre BFCL, Energy-QA, un conjunto de evaluación de sesgo en contratación (*hiring-bias*) y MedQA. No se han publicado los resultados numéricos de esas pruebas en la información disponible, por lo que la ficha no puede confirmar la pérdida de calidad frente al base en BF16.

Su interés práctico es acotado pero claro: reduce el peso en disco a 11,9 GB y permite servir el modelo en vLLM sin flags adicionales (`vllm serve <repo>`), gracias al formato `pack-quantized` de compressed-tensors 0.17.0. Al no requerir datos de calibración (round-to-nearest puro), la receta es reproducible y barata, pero también más propensa a degradación que esquemas con calibración. Con 0 descargas y 0 likes en el momento del registro, carece de validación comunitaria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (texto, imagen, audio) heredado de `google/gemma-4-E4B-it`; el detalle interno del modelo base no se especifica en la información disponible |
| Parametros totales | 7.941.100.874 (según safetensors del repositorio) |
| Parametros activos | No disponible (la nomenclatura "E4B" del modelo base sugiere ~4B efectivos, dato no confirmado en la información disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | INT8 weight-only (W8A16); grupo de cuantización: None; una escala por canal de salida; round-to-nearest; sin datos de calibración; visión y audio en 16 bits |
| Idiomas soportados | No disponible (el modelo base pertenece a la familia Gemma, multilingüe, pero no se detallan idiomas) |
| Licencia | apache-2.0 (declarada en el repositorio y en la model card del base) |
| Formato de pesos | safetensors con formato `pack-quantized` de compressed-tensors 0.17.0 |
| Tamano en disco | 11,945 GB (tamaño del repo: 11,9 GB) |
| Toolkit de cuantizacion | compressed-tensors 0.17.0 |
| Modalidades de entrada | Texto, imagen y audio (según el modelo base) |
| Modelo base | `google/gemma-4-E4B-it` |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-10-27 |

## Arquitectura y entrenamiento

El repositorio no entrena ningún modelo: es una transformación de pesos del checkpoint `google/gemma-4-E4B-it`. La arquitectura subyacente es la del base, un transformer multimodal de la familia Gemma 4 que acepta texto, imagen y audio. La cuantización se aplica exclusivamente al decodificador de texto; las torres de visión y audio permanecen en 16 bits, lo que preserva la ruta multimodal del original.

La técnica aplicada es INT8 weight-only (W8A16) con cuantización por canal de salida y redondeo al más cercano, sin muestras de calibración. El resultado se serializa en el formato `pack-quantized` de compressed-tensors 0.17.0, que vLLM reconoce de forma nativa sin necesidad de indicar flags en el arranque del servidor. No se documenta en la información disponible ni el número de tokens de entrenamiento del base, ni la composición del dataset, ni si hubo etapas de RLHF/DPO o de ajuste por instrucciones más allá de lo implícito en el sufijo `-it`. El autor indica que el modelo se evaluó como modelo de texto con el modo *thinking* desactivado.

## Capacidades

- Generación de texto y razonamiento en modo instructivo, heredados del checkpoint `-it` del modelo base.
- Procesamiento de imágenes: la torre de visión se mantiene en 16 bits, por lo que la entrada de imagen no se ve afectada por la cuantización.
- Procesamiento de audio: la torre de audio también se conserva en 16 bits.
- Modo *thinking* disponible en el modelo base; el autor lo desactiva explícitamente durante la evaluación, pero el artefacto no elimina la funcionalidad.
- Soporte de *function calling* / *tool calling*: el autor incluye BFCL (Berkeley Function Calling Leaderboard) en su batería de evaluación, lo que indica que el modelo base expone capacidades de llamada a herramientas.
- Capacidades multilingües: presumibles por la familia Gemma, aunque no se detallan idiomas concretos en la información disponible.
- Despliegue directo en vLLM en formato cuantizado, sin pasos de conversión adicionales.

## Casos de uso

- **Servicio de inferencia en vLLM con presupuesto de VRAM ajustado**: el repositorio se carga con `vllm serve mrysh/gemma-4-e4b-it-int8_w8a16` sin flags, lo que permite levantar un endpoint compatible con la API de OpenAI ocupando unos 12 GB de pesos en lugar de los ~16 GB de una versión BF16.
- **Atención al cliente multimodal**: el modelo puede recibir capturas de pantalla o fotos de producto junto al texto de la consulta, ya que la torre de visión no está cuantizada; útil en soporte técnico donde el usuario adjunta imágenes de errores.
- **Análisis de documentos escaneados**: extracción de campos de facturas, albaranes o formularios a partir de imágenes, manteniendo el decodificador cuantizado para reducir coste por token en cargas por lotes.
- **Transcripción y análisis de audio**: al conservar la torre de audio en 16 bits, sirve para tareas de resumen o clasificación de conversaciones grabadas sin degradar la ruta de entrada.
- **Agentes con llamada a herramientas**: la evaluación sobre BFCL sugiere que el base soporta *tool calling*; el modelo puede integrarse en orquestadores que encadenan APIs y requieren varios pasos de razonamiento.
- **Evaluación comparativa de cuantización**: es un artefacto pensado para reproducir el benchmark del autor (BFCL, Energy-QA, hiring-bias, MedQA) y medir la degradación de INT8 W8A16 frente a otras siete técnicas sobre el mismo modelo base.
- **Auditoría de sesgo en selección de personal**: la inclusión del conjunto *hiring-bias* en la batería del autor lo hace utilizable como sujeto de pruebas en estudios de sesgo, siempre con la cautela de que no se publican resultados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

El autor declara haber evaluado el modelo con vLLM (modo *thinking* desactivado) sobre BFCL, Energy-QA, un conjunto de sesgo en contratación y MedQA, pero las puntuaciones no se incluyen en la model card ni en los resultados de búsqueda consultados. Tampoco se documentan métricas de latencia o throughput.

## Requisitos de hardware

- **VRAM para los pesos**: 11,9 GB en INT8. Es la cifra mínima imprescindible antes de reservar caché KV.
- **VRAM recomendada en producción**: 16-24 GB, para acomodar caché KV y *batching* continuo en vLLM con contextos medios.
- **GPU de datacenter**: A100 40 GB, A100 80 GB y H100 son holgadas y permiten varios workers o contextos amplios por instancia.
- **GPU de consumo**: RTX 4090 / 3090 (24 GB) funcionan con margen; RTX 4080 / 4070 Ti Super (16 GB) van justas y obligan a limitar la longitud de contexto y el número de secuencias concurrentes. Tarjetas de 8-12 GB no son viables para esta variante.
- **Despliegue**: vLLM es la vía soportada de forma nativa (`pack-quantized` de compressed-tensors). Este repositorio concreto no publica GGUF, por lo que llama.cpp u Ollama requerirían reconvertir desde el base; existe una variante hermana del mismo autor en 1 bit (`mrysh/gemma-4-e4b-it-iq1_s`) para ese ecosistema.
- **Latencia y throughput**: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Formato / despliegue |
|---|---|---|---|---|---|
| `mrysh/gemma-4-e4b-it-int8_w8a16` (este) | 7,94B (safetensors) | No disponible | INT8 W8A16, por canal, sin calibracion | apache-2.0 | safetensors `pack-quantized`, vLLM nativo |
| `Bekten/gemma-4-E4B-it-W8A16` | No disponible | No disponible | INT8 weight-only, compressed-tensors | No disponible | safetensors, vLLM |
| `mrysh/gemma-4-e4b-it-iq1_s` | No disponible | No disponible | 1 bit (IQ1_S, tipo GGUF) | No disponible | GGUF, llama.cpp |
| `google/gemma-4-E4B-it` (base) | ~4,4B declarados en fuentes web; 7,94B en safetensors del derivado | No disponible | BF16 (sin cuantizar) | apache-2.0 | safetensors, transformers / vLLM |

La comparativa con `Bekten/gemma-4-E4B-it-W8A16` es la más directa: misma técnica y mismo modelo base, distinto autor; sirve como control de reproducibilidad. Frente a la variante IQ1_S, este INT8 ocupa aproximadamente 12 GB contra un peso mucho menor, a cambio de una degradación teóricamente inferior. No se dispone de datos de benchmarks de ninguno de ellos en la información consultada, por lo que no es posible clasificarlos por calidad.

## Limitaciones y advertencias

- **Sin validación comunitaria**: 0 descargas y 0 likes en el momento del registro; no hay evidencia de terceros que hayan reproducido el comportamiento del checkpoint.
- **Cuantización sin calibración**: el uso de round-to-nearest puro, sin datos de calibración, es la opción más simple y también la más expuesta a degradación en capas sensibles; no se publican métricas que cuantifiquen esa pérdida.
- **Resultados de benchmark no publicados**: el autor menciona las pruebas (BFCL, Energy-QA, hiring-bias, MedQA) pero no los números, de modo que la calidad real frente al base es desconocida.
- **Riesgo de alucinación**: inherente a los modelos generativos del tamaño del base; la cuantización INT8 puede incrementarlo en tareas de razonamiento largo, aunque no hay datos que lo confirmen.
- **Contexto e idiomas no documentados**: no se especifica la ventana de contexto ni la lista de idiomas soportados en este repositorio; hay que remitirse a la model card del base.
- **Evaluado solo como modelo de texto**: la batería del autor se ejecutó con el modo *thinking* desactivado y sin evaluar las rutas de imagen y audio, por lo que el rendimiento multimodal no está verificado.
- **Licencia**: el repositorio declara apache-2.0, igual que el base según la información disponible; conviene verificar los términos aplicables del modelo original antes de un despliegue comercial, ya que las condiciones de la familia Gemma pueden incluir cláusulas de uso aceptable adicionales.
- **Compatibilidad de despliegue restringida**: al no publicarse GGUF, el uso queda prácticamente ligado a vLLM y a versiones de compressed-tensors compatibles (0.17.0 en el momento de la publicación).

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mrysh/gemma-4-e4b-it-int8_w8a16
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it
- Variante hermana en 1 bit del mismo autor: https://huggingface.co/mrysh/gemma-4-e4b-it-iq1_s
- Cuantización INT8 equivalente de otro autor: https://huggingface.co/Bekten/gemma-4-E4B-it-W8A16
- Documentación de Gemma 4: https://gemma.ai/models/gemma-4/
- Página de Gemma 4 en Google DeepMind: https://deepmind.google/models/gemma/gemma-4/
- Ficha de Gemma 4 E4B en gemma4.dev: https://gemma4.dev/models/gemma-4-e4b
