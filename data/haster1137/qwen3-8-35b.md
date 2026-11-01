# Haster1137/Qwen3.8-35B

## Resumen

Qwen3.8-35B es una publicación de la cuenta de usuario Haster1137 en HuggingFace que, pese a su nombre, contiene en realidad una familia de cuantizaciones GGUF del modelo base Qwen/Qwen3.8-27B, según se desprende de la model card. El autor describe el artefacto como "Qwen3.8-27B-Uncensored-GGUF", una versión del modelo de 27 000 millones de parámetros a la que se le ha reducido el comportamiento de rechazo mediante una técnica de abliteration con la herramienta Heretic. No se trata, por tanto, de un modelo entrenado desde cero, sino de una redistribución cuantizada y modificada de un modelo de terceros.

La relevancia de esta ficha es doble. Por un lado, documenta un caso de cuantización GGUF con retención de la cabeza de predicción multi-token (MTP) para decodificación especulativa, un detalle técnico poco habitual en publicaciones comunitarias. Por otro, sirve como ejemplo de advertencia: el identificador del repositorio (35B) no coincide con el tamaño real del modelo base (27B), la licencia declarada en la model card (Apache-2.0) no aparece en los metadatos de HuggingFace, y el autor de la cuenta no es el desarrollador original del modelo.

El modelo base pertenece a la familia Qwen3.5/Qwen3.8, con arquitectura `Qwen3_5ForConditionalGeneration`, 64 capas, vocabulario de 248 320 tokens y una ventana de contexto declarada de 262 144 tokens. La publicación incluye cuantizaciones desde IQ2_M (10,6 GB) hasta Q8_0 (29,0 GB), un proyector de visión en F16 y una matriz de importancia (imatrix) calculada sobre el modelo en F16.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | `Qwen3_5ForConditionalGeneration` (transformer denso, con cabeza MTP) |
| Parámetros totales | 27 000 millones (modelo base Qwen3.8-27B; el nombre del repositorio indica 35B, dato no coherente con la model card) |
| Parámetros activos | no disponible (no es MoE según la información proporcionada) |
| Longitud de contexto | 262 144 tokens |
| Tipos de cuantización | IQ2_M, IQ4_XS, Q4_K_M, Q5_K_M, Q6_K, Q8_0; draft head en Q8_0 y Q4_0; proyector de visión en F16 |
| Idiomas soportados | en, zh (según la model card) |
| Licencia | Apache-2.0 declarada en la model card; no disponible en los metadatos de HuggingFace |
| Formato de pesos | GGUF (generado con llama.cpp, commit a94d563ed) |

## Arquitectura y entrenamiento

El modelo base es un transformer denso de 64 capas con un vocabulario de 248 320 tokens y una ventana de contexto de 262 144 tokens. Incluye una única capa de predicción multi-token (MTP), que actúa como cabeza borrador para decodificación especulativa. Dispone también de capacidad de visión, servida mediante un proyector multimodal separado (`mmproj-...-F16.gguf`, 0,9 GB). No se especifican en la información disponible los datos de entrenamiento del modelo base, el número de tokens procesados ni si hubo fases de RLHF o DPO.

La modificación introducida por el autor consiste en una abliteration con Heretic, que minimiza conjuntamente el recuento de rechazos y la divergencia KL respecto al modelo base. El proceso se ejecuta en bf16 (sin cuantización intermedia de 4 bits) y el LoRA resultante se fusiona en el checkpoint bf16, de modo que los pesos publicados no son el resultado de una ida y vuelta por cuantización. La abliteration modifica únicamente `attn.o_proj` y `mlp.down_proj` de la pila principal; los tensores `mtp.*` se copian literalmente del checkpoint base sin alteración. La matriz de importancia se calcula directamente desde el F16, no desde una cuantización intermedia, lo que según el autor hace que la calibración vea los pesos reales.

## Capacidades

- Generación de texto y razonamiento general, heredados del modelo base Qwen3.8-27B.
- Procesamiento de imágenes mediante el proyector de visión F16 incluido.
- Decodificación especulativa con cabeza MTP integrada (modo fused) o separada (modo target + draft con `--model-draft`).
- Comportamiento de rechazo sustancialmente reducido respecto al modelo base, aunque no eliminado.
- Soporte multilingüe limitado a inglés y chino según la model card.
- No se documenta en la información disponible soporte de tool calling, function calling ni razonamiento agéntico multi-paso.
- No se documenta un modo de pensamiento (thinking mode) explícito.

## Casos de uso

- Investigación sobre abliteration y alineación: el modelo permite comparar directamente la perplejidad y el comportamiento de rechazo frente al base sin modificar, gracias a que la model card publica la medición de referencia (PPL 6,5129 en el base bf16 frente a 7,1557 en el F16 abliterado).
- Evaluación de decodificación especulativa en llama.cpp: la publicación incluye tablas de aceptación medidas para el draft head en Q8_0, lo que facilita reproducir experimentos de aceleración con MTP en un modelo de 27B.
- Despliegue en hardware de gama alta para consumo: la cuantización Q4_K_M (16,8 GB) permite ejecutar un modelo de 27B con contexto largo en una GPU con 24 GB de VRAM, útil para prototipos de generación de texto en local.
- Procesamiento de documentos con imagen: el proyector de visión F16 (0,9 GB) habilita entrada de imágenes en runtimes compatibles, adecuado para tareas de descripción o extracción de contenido visual.
- Generación de texto sin restricciones de contenido para entornos controlados: el modelo está orientado a casos donde el filtrado del base resulta demasiado restrictivo, siempre que se apliquen las salvaguardas externas adecuadas.
- Estudio de cuantización de bajo bit: la cuantización IQ2_M (10,6 GB) y su matriz de importancia publicada permiten analizar la degradación de perplejidad en regímenes agresivos de compresión.

## Benchmarks y rendimiento

La model card no publica resultados de benchmarks estándar (MMLU, HumanEval, GSM8K). Sí incluye mediciones de perplejidad sobre wikitext-2, que se reproducen a continuación.

| Modelo / cuantización | Tamaño | PPL (wikitext-2) | Diferencia frente a F16 |
|---|---|---|---|
| Base Qwen3.8-27B bf16 | no disponible | 6,5129 ± 0,04209 | referencia del base |
| Base Qwen3.8-27B Q8_0 | no disponible | 6,5122 ± 0,04208 | −0,0007 frente al base |
| Este modelo F16 (no publicado) | no disponible | 7,1557 ± 0,25104 | referencia interna |
| Este modelo Q5_K_M | 19,5 GB | 7,1573 ± 0,25055 | +0,0016 |
| Este modelo IQ4_XS | 15,3 GB | 7,1583 ± 0,25019 | +0,0026 |
| Este modelo Q6_K | 22,4 GB | 7,1689 ± 0,25149 | +0,0132 |
| Este modelo Q8_0 | 29,0 GB | 7,1764 ± 0,25195 | +0,0207 |
| Este modelo Q4_K_M | 16,8 GB | 7,1814 ± 0,25227 | +0,0257 |
| Este modelo IQ2_M | 10,6 GB | 7,8581 ± 0,27481 | +0,7024 |

El propio autor advierte que, salvo IQ2_M, todas las diferencias caen dentro del margen de error (error estándar en torno a 0,25), por lo que el orden entre cuantizaciones no es significativo. La única diferencia resoluble es IQ2_M, unas 2,8 desviaciones estándar por encima del F16. La comparación entre el base bf16 (6,5129) y el F16 abliterado (7,1557) sí indica un coste apreciable de la abliteration en perplejidad.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente el tamaño del archivo más el contexto. IQ2_M requiere unos 11 GB, Q4_K_M unos 17 GB, Q5_K_M unos 20 GB, Q6_K unos 23 GB y Q8_0 unos 29 GB, sin contar la caché KV para 262 144 tokens, que puede ser muy superior.
- GPU recomendadas: A100 40/80 GB o H100 para contexto completo y Q8_0; RTX 4090 (24 GB) para Q4_K_M o IQ4_XS con contexto moderado; RTX 3090 (24 GB) en el mismo rango.
- Cabe en GPU de consumo: sí, en tarjetas de 24 GB con cuantizaciones Q4_K_M o inferiores. IQ2_M permite bajar a 12-16 GB de VRAM.
- Opciones de despliegue: llama.cpp (versión de referencia a94d563ed), llama-server con `--model-draft` para el modo target + draft, y runtimes compatibles con GGUF y mmproj para visión. No se documenta soporte de vLLM ni TGI.
- Latencia y throughput: no disponibles. La model card menciona tablas de aceptación de decodificación especulativa medidas sobre el draft head Q8_0, pero los valores no se incluyen en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.8-35B (este repositorio) | 27B (según model card) | 262 144 | Apache-2.0 declarada | GGUF | Abliterado, con MTP y visión |
| Qwen/Qwen3.8-27B | 27B | 262 144 | no disponible en esta información | safetensors, GGUF | Modelo base sin modificar |
| Otras cuantizaciones comunitarias de Qwen3.8-27B | 27B | 262 144 | según autor | GGUF | Sin abliteration ni MTP retenido, en general |

No se dispone de datos de benchmarks comparativos con modelos de la misma categoría en la información proporcionada, por lo que la comparación se limita a parámetros, contexto, licencia y formato.

## Limitaciones y advertencias

- El nombre del repositorio (35B) no coincide con el tamaño real del modelo base (27B), lo que puede inducir a error en la selección de hardware.
- La abliteration reduce el comportamiento de rechazo pero no lo elimina; el modelo puede generar contenido dañino o inapropiado sin las salvaguardas externas adecuadas.
- La perplejidad del F16 abliterado (7,1557) es notablemente superior a la del base bf16 (6,5129), lo que sugiere una pérdida de calidad respecto al original.
- La licencia Apache-2.0 solo aparece en la model card; los metadatos de HuggingFace no la declaran, lo que genera incertidumbre sobre las condiciones reales de uso comercial.
- El autor de la cuenta (Haster1137) no es el desarrollador original del modelo base; se trata de una redistribución de terceros sin respaldo oficial.
- Idiomas limitados a inglés y chino según la model card; no se garantiza un rendimiento adecuado en castellano.
- No se documentan datos de entrenamiento, sesgos conocidos ni evaluaciones de seguridad del modelo base.
- El contexto de 262 144 tokens requiere una caché KV muy grande; en la práctica, la ventana utilizable en GPU de consumo será mucho menor.
- La tasa de aceptación del draft head Q4_0 no ha sido medida por el autor.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, sin evidencia de uso o validación por parte de la comunidad.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Haster1137/Qwen3.8-35B
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- llama.cpp (runtime de referencia, commit a94d563ed): https://github.com/ggml-org/llama.cpp
- Heretic (herramienta de abliteration): no disponible en la información proporcionada
- Dataset de calibración (wikitext-2): https://huggingface.co/datasets/Salesforce/wikitext
- Paper o blog del modelo base: no disponible en la información proporcionada
