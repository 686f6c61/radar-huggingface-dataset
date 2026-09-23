# roman220220/gemma-4-E4B-it-gptq-mlx-jang

## Resumen

`roman220220/gemma-4-E4B-it-gptq-mlx-jang` es una cuantización de precisión mixta estilo JANG sobre el modelo multimodal `google/gemma-4-E4B-it`, publicada por el usuario roman220220. El checkpoint conserva las tres torres del modelo original (decodificador de texto, torre de visión y torre de audio) y aplica corrección de error GPTQ basada en Hessiana sobre las proyecciones de atención (8 bits) y de feed-forward (4 bits), además de cuantizar todas las tablas de embeddings a 8 bits mediante redondeo al más cercano (RTN). El autor indica explícitamente que ningún tensor del checkpoint permanece en bf16.

El modelo pesa 6.187.362.890 parámetros (unos 6,19 mil millones) y el repositorio ocupa 6,8 GB. Está empaquetado en formato MLX (`safetensors`) y se distribuye bajo licencia apache-2.0. La variante "E4B" del nombre apunta a un diseño de embeddings por capa (`embed_tokens_per_layer`), con una tabla de embeddings por capa que en el modelo original ocupa 5,6 GB por sí sola, y con capas que comparten claves y valores (`num_kv_shared_layers`); según la model card, no incluye capas MoE.

La relevancia práctica de esta ficha es doble. Por un lado, es un ejemplo de cuantización multimodal completa en MLX, con validación end-to-end declarada en texto, imagen y audio. Por otro lado, su model card documenta dos errores reales de una publicación anterior del mismo autor (una torre de visión que nunca llegó a cuantizarse y 7,2 GB de embeddings que quedaron en bf16) y una corrección en `mlx_lm` para que las capas con KV compartida funcionen con la caché KV cuantizada. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal: decodificador de texto + torre de visión + torre de audio, con embeddings por capa y capas con KV compartida; sin capas MoE |
| Parámetros totales | 6.187.362.890 (~6,19 B) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | GPTQ de precisión mixta: atención 8-bit, feed-forward 4-bit, embeddings 8-bit RTN, group-size 64 (MLX) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (MLX) |
| Modelo base | google/gemma-4-E4B-it |
| Pipeline | image-text-to-text |
| Librería | mlx |
| Tamaño del repositorio | 6,8 GB |
| Fecha de publicación | 2026-09-22 |

## Arquitectura y entrenamiento

El checkpoint no entrena un modelo nuevo: es una cuantización del modelo base `google/gemma-4-E4B-it`. La arquitectura subyacente es un transformer multimodal con tres componentes independientes (texto, visión y audio). La nomenclatura interna del checkpoint revela dos rasgos estructurales: una tabla de embeddings por capa (`embed_tokens_per_layer`) que en bf16 ocupa 5,6 GB, y capas que reutilizan las claves y valores de una capa anterior en lugar de calcular los suyos (`num_kv_shared_layers`). La model card confirma que la variante E4B no contiene capas MoE.

El proceso de cuantización aplica corrección GPTQ basada en Hessiana de forma independiente a cada torre, con una asignación de bits por rol: las proyecciones de atención (`q/k/v/o_proj` y la `lconv1d` de audio) se mantienen a 8 bits por ser pequeñas en número pero sensibles al error; las proyecciones de feed-forward (`gate/up/down_proj` y las `feed_forward1/2` de audio) se comprimen a 4 bits por concentrar la mayor parte de los parámetros; y las tablas de embeddings y proyecciones por capa se cuantizan a 8 bits con RTN, ya que al ser tablas de consulta puras no admiten la corrección Hessiana de GPTQ de la misma forma que un `Linear` reutilizado. La calibración se realizó con `--group-size 64` usando 8 prompts de texto diversos para el modelo de lenguaje, 6 fotografías reales de COCO para la torre de visión y 6 clips reales de LibriSpeech para la torre de audio.

La model card documenta además una corrección en el fork `ipsupport-llc/mlx-lm` (PR #1): las capas con KV compartida pasaban `cache=None` a la comprobación que decide si usar atención cuantizada, de modo que al cuantizar la caché de la capa origen la capa compartida entregaba una tupla cuantizada a una ruta de atención sin cuantizar y provocaba un fallo. La corrección incluye una prueba de regresión y es un requisito para usar este checkpoint con cuantización de caché KV activada.

## Capacidades

- Generación de texto conversacional en formato chat, con plantilla de chat aplicada mediante el procesador del modelo base.
- Comprensión de imagen a texto (`image-text-to-text`): la model card reporta una respuesta correcta sobre una fotografía real de COCO con dos gatos.
- Transcripción de audio: sobre un clip real de LibriSpeech, el modelo produjo una transcripción que coincide con la referencia salvo en la puntuación y el tratamiento abreviado ("Mr." frente a "mister").
- Procesamiento multimodal conjunto de texto, visión y audio en un mismo checkpoint, con las tres torres cuantizadas.
- Soporte de tool calling o function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; la model card no documenta cobertura de idiomas.
- Modo de razonamiento explícito (thinking mode): no disponible en la información proporcionada.

## Casos de uso

- Descripción y etiquetado automático de imágenes en local: el modelo acepta entrada de imagen y genera descripciones; al ejecutarse con MLX sobre memoria unificada, permite montar un pipeline de catalogación de fotografías sin enviar datos a servicios externos.
- Transcripción de audio de reuniones o notas de voz: la torre de audio transcribe clips de voz; en combinación con la torre de texto se puede encadenar transcripción y resumen en una sola pasada.
- Asistentes conversacionales sobre documentación visual: con entrada image-text-to-text, se pueden hacer preguntas sobre capturas de pantalla, diagramas o documentación escaneada manteniendo el historial de conversación.
- Prototipado multimodal en equipos con hardware Apple Silicon: al estar empaquetado en MLX, es adecuado para experimentar con visión y audio en un Mac sin GPU dedicada, ajustando la cuantización de caché KV para reducir el consumo de memoria en contextos largos.
- Evaluación de técnicas de cuantización: sirve como referencia práctica para comparar GPTQ mixto por rol (8 bits en atención, 4 bits en feed-forward) frente a cuantizaciones uniformes, ya que el autor documenta el recetario y los errores de una versión previa.
- Investigación sobre arquitecturas con KV compartida: el checkpoint y el fork de `mlx_lm` asociado permiten reproducir y estudiar el comportamiento de capas que reutilizan claves y valores bajo caché KV cuantizada.
- Procesamiento por lotes de material audiovisual en local: combinando transcripción de audio y análisis de fotogramas, se puede construir un indexador de vídeo o de archivos multimedia sin dependencia de APIs externas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente incluye tres ejemplos cualitativos de validación end-to-end (una respuesta de texto sobre la capital de Japón, una descripción de una fotografía de COCO y una transcripción de un clip de LibriSpeech), sin métricas cuantitativas ni comparaciones con otros modelos.

## Requisitos de hardware

- El repositorio ocupa 6,8 GB, por lo que los pesos cuantizados ocupan aproximadamente esa cifra en disco y memoria. El consumo total en inferencia será superior al sumar la caché KV y las activaciones; se estima un rango de 8 a 10 GB de memoria unificada para uso de texto, y más si se procesan imágenes o audio, aunque la cifra exacta no está documentada.
- El formato es MLX, por lo que el despliegue natural es sobre Apple Silicon (M1, M2, M3, M4 y sucesores) con memoria unificada. Un equipo con 16 GB de memoria unificada debería poder cargar el modelo; 8 GB es un límite ajustado.
- No se documenta ruta de ejecución sobre CUDA ni sobre GPU de escritorio (RTX 3090, RTX 4090, A100, H100); MLX no es compatible con esas plataformas en el material proporcionado.
- Opciones de despliegue: `mlx_lm` con el fork `ipsupport-llc/mlx-lm` en la rama `fix-gemma4-quantized-kv-shared`, instalado con `pip install git+https://github.com/ipsupport-llc/mlx-lm.git@fix-gemma4-quantized-kv-shared`. No hay pesos GGUF, por lo que no es directamente utilizable con llama.cpp, Ollama ni vLLM.
- El modo texto funciona con `mlx_lm.generate()`. Los modos de imagen y audio requieren un bucle de generación manual, ya que esta bifurcación de `mlx_lm` no tiene integración de imagen o audio en `generate()`.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Cuantización | Modalidades | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|---|
| gemma-4-E4B-it-gptq-mlx-jang | 6,19 B | GPTQ mixta 8/4 bits, embeddings 8-bit RTN | Texto, visión, audio | no disponible | apache-2.0 | safetensors (MLX) | 0 descargas, 0 likes |
| google/gemma-4-E4B-it (base) | no disponible | bf16 | Texto, visión, audio | no disponible | no disponible | no disponible | modelo base de referencia |
| gemma-4-E4B-it-gptq-mlx-8bit (versión previa del mismo autor) | no disponible | 8 bits, con torre de visión y embeddings sin cuantizar | Texto, visión, audio | no disponible | no disponible | safetensors (MLX) | retirada y sustituida por la versión actual |

No se dispone de datos de benchmarks ni de especificaciones completas de modelos alternativos de la misma categoría en la información proporcionada, por lo que no es posible establecer una comparación de rendimiento.

## Limitaciones y advertencias

- Es una cuantización con pérdida. Las proyecciones de feed-forward se reducen a 4 bits, lo que puede degradar tareas sensibles al detalle numérico; la model card no incluye métricas que cuantifiquen esa pérdida.
- La cuantización de embeddings usa RTN en lugar de GPTQ, tal como reconoce el propio autor, porque la corrección Hessiana no se aplica igual a tablas de consulta puras.
- Sesgos conocidos: no disponibles. La model card no documenta evaluación de sesgos ni de toxicidad.
- Riesgo de alucinación: no evaluado en la información proporcionada; se aplican los riesgos habituales de un modelo generativo, sin datos que los acoten para este checkpoint.
- Idiomas soportados: no documentados. No hay información sobre calidad fuera del inglés.
- Longitud de contexto: no documentada. No se puede garantizar un comportamiento correcto en ventanas largas.
- Restricciones de licencia: el repositorio se publica bajo apache-2.0, pero al derivar de `google/gemma-4-E4B-it` conviene verificar los términos aplicables al modelo base antes de un uso comercial.
- Dependencia de una bifurcación no oficial de `mlx_lm`. El uso con caché KV cuantizada exige el fork con la corrección del PR #1; sin él, las capas con KV compartida pueden fallar.
- Ejecución restringida a MLX. No hay pesos GGUF ni integración con vLLM, TGI, llama.cpp u Ollama, lo que limita el despliegue en servidores con GPU.
- Los modos de imagen y audio requieren un bucle de generación manual, ya que `mlx_lm.generate()` no cubre esas entradas en esta bifurcación.
- Soporte de tool calling y de agentes: no documentado. No debe asumirse en producción.
- Validación escasa: 0 descargas y 0 likes en el momento de la consulta, y evidencia limitada a tres ejemplos cualitativos.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/roman220220/gemma-4-E4B-it-gptq-mlx-jang
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it
- Bifurcación de mlx-lm utilizada: https://github.com/ipsupport-llc/mlx-lm
- Corrección de la caché KV cuantizada con capas compartidas (PR #1): https://github.com/ipsupport-llc/mlx-lm/pull/1
- Pipeline de cuantización gemma4-quant: https://github.com/rromenskyi/quant-ternary/tree/main/gemma4-quant
- Versión previa con errores, mencionada en la model card: https://huggingface.co/roman220220/gemma-4-E4B-it-gptq-mlx-8bit
- Rama de instalación con la corrección: https://github.com/ipsupport-llc/mlx-lm.git@fix-gemma4-quantized-kv-shared
