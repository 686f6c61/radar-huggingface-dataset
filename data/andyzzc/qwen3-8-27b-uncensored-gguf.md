# andyzzc/Qwen3.8-27B-Uncensored-GGUF

## Resumen

Qwen3.8-27B-Uncensored-GGUF es una cuantización en formato GGUF del modelo Qwen/Qwen3.8-27B, publicada por el usuario andyzzc. El modelo base es un transformer denso de 27.320.697.856 parámetros (unos 27,3 mil millones) con arquitectura `Qwen3_5ForConditionalGeneration`, 64 capas, vocabulario de 248.320 tokens y una ventana de contexto de 262.144 tokens. La modificación principal consiste en la eliminación de direcciones de rechazo (abliteration) mediante la herramienta Heretic, que minimiza el recuento de rechazos frente a la divergencia KL respecto al modelo base, sin reentrenamiento ni datos adicionales.

El resultado es un modelo con comportamiento de rechazo "sustancialmente reducido, no eliminado", según el autor, manteniendo intactas capacidades, datos de entrenamiento y arquitectura. La publicación incluye cuantizaciones desde IQ2_M (10,6 GB) hasta Q8_0 (29,0 GB), un proyector de visión F16, una matriz de importancia (imatrix) calculada directamente sobre f16 y cabezas de predicción multi-token (MTP) para decodificación especulativa.

La relevancia actual reside en tres factores: la retención verificada de la cabeza MTP para acelerar la inferencia mediante decodificación especulativa, la disponibilidad de cuantizaciones de bajo bit con perplexity medida contra la línea base f16, y el soporte de visión mediante `mmproj`. Todo ello bajo licencia Apache 2.0 y compatible con llama.cpp.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `Qwen3_5ForConditionalGeneration` (transformer denso, 64 capas) |
| Parametros totales | 27.320.697.856 (27,3 B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | IQ2_M, IQ4_XS, Q4_K_M, Q5_K_M, Q6_K, Q8_0 (y variantes noMTP de todas ellas); draft head en Q8_0 y Q4_0 |
| Idiomas soportados | en, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp), proyector de visión F16 en GGUF, imatrix en `.dat` |
| Vocabulario | 248.320 tokens |
| Capas MTP | 1 |
| Vision | si (mediante `mmproj-Qwen3.8-27B-Uncensored-F16.gguf`) |
| Herramienta de conversion | llama.cpp `a94d563ed` |
| Imatrix | wikitext-2 raw, 200 chunks |

## Arquitectura y entrenamiento

El modelo base es un transformer denso de 64 capas con 27,3 mil millones de parámetros y una cabeza de predicción multi-token (MTP) de una capa. La cuantización conserva esta cabeza MTP copiando los tensores `mtp.*` literalmente desde el checkpoint base tras la fusión del LoRA de abliteration; la modificación solo afecta a `attn.o_proj` y `mlp.down_proj` del stack principal. La abliteration se ejecuta en bf16 (sin cuantización de 4 bits) y el LoRA resultante se fusiona en el base bf16, de modo que los pesos publicados no son un viaje de ida y vuelta por cuantización. No hubo fine-tuning ni datos de entrenamiento adicionales.

La matriz de importancia se calcula directamente desde el f16, no desde una cuantización intermedia, de forma que la calibración ve los pesos reales. La cabeza draft se entrenó contra el modelo sin modificar, por lo que la tasa de aceptación en decodificación especulativa puede caer ligeramente; dado que la decodificación especulativa verifica cada token contra el modelo objetivo, la calidad de salida no se ve afectada. El paquete incluye tanto archivos fusionados (MTP inline como draft integrado) como pares objetivo + draft separados para runtimes que requieren `--model-draft` explícito.

## Capacidades

- Generación de texto conversacional multi-turno con contexto de hasta 262.144 tokens.
- Razonamiento y generación de código heredados del modelo base Qwen3.8-27B (sin cambios según el autor).
- Capacidades de visión: entrada de imágenes mediante el proyector `mmproj-Qwen3.8-27B-Uncensored-F16.gguf` en runtimes compatibles.
- Decodificación especulativa mediante cabeza MTP (1 capa), con archivos draft en Q8_0 (por defecto) y Q4_0.
- Comportamiento de rechazo sustancialmente reducido frente al base, orientado a usos donde el modelo original declina responder.
- Soporte multilingüe limitado a inglés y chino.
- Compatibilidad con endpoints (`endpoints_compatible` en los tags) y con llama.cpp / llama-server.
- No se documenta soporte explícito de tool calling ni de agentes multi-paso en la información disponible.

## Casos de uso

- Investigación sobre alineación y abliteration: el modelo permite estudiar cómo la eliminación de direcciones de rechazo afecta al comportamiento sin reentrenamiento, comparando directamente contra el base Qwen3.8-27B con la misma perplexity de referencia.
- Despliegue en hardware de consumo: la cuantización IQ2_M (10,6 GB) permite ejecutar un modelo de 27,3 B en GPUs con 12-16 GB de VRAM, con una perplexity de 7,8581 en wikitext-2 (frente a 7,1557 del f16).
- Inferencia acelerada en servidor: los archivos con MTP integrado y los pares objetivo + draft (Q8_0, 3,2 GB) permiten decodificación especulativa en llama-server mediante `--model-draft`, reduciendo la latencia por token sin alterar la calidad de salida.
- Procesamiento de documentos largos: la ventana de 262.144 tokens admite análisis de contratos, informes o bases de código extensas en una sola pasada, en inglés o chino.
- Aplicaciones con visión: el proyector F16 (0,9 GB) habilita entrada de imágenes para tareas de descripción, extracción de información o respuesta visual, siempre que el runtime soporte `mmproj`.
- Generación creativa sin restricciones de contenido: el comportamiento de rechazo reducido lo hace adecuado para escritura de ficción, guiones o contenido editorial donde el base declinaría; requiere revisión humana por las implicaciones éticas y legales.
- Evaluación comparativa de cuantizaciones: la tabla de perplexity publicada permite seleccionar el equilibrio tamaño/calidad (por ejemplo, Q5_K_M con +0,0016 de PPL frente a f16 a 19,5 GB).

## Benchmarks y rendimiento

El autor no publica resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. La única métrica publicada es la perplexity en wikitext-2 medida en una sola sesión contra la misma línea base f16:

| Archivo | Tamano | PPL (wikitext-2) | Delta vs f16 |
|---|---|---|---|
| f16 (línea base, no distribuida) | - | 7,1557 ± 0,25104 | - |
| Q5_K_M | 19,5 GB | 7,1573 ± 0,25055 | +0,0016 |
| IQ4_XS | 15,3 GB | 7,1583 ± 0,25019 | +0,0026 |
| Q6_K | 22,4 GB | 7,1689 ± 0,25149 | +0,0132 |
| Q8_0 | 29,0 GB | 7,1764 ± 0,25195 | +0,0207 |
| Q4_K_M | 16,8 GB | 7,1814 ± 0,25227 | +0,0257 |
| IQ2_M | 10,6 GB | 7,8581 ± 0,27481 | +0,7024 |

El propio autor advierte que todas las filas excepto IQ2_M caen dentro de un margen de 0,026 frente a un error estándar de aproximadamente 0,25, por lo que no son separables entre sí ni del f16 y su ordenación es ruido estadístico. No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (pesos + overhead de contexto, aproximada): IQ2_M ~12-14 GB; IQ4_XS ~17-19 GB; Q4_K_M ~18-20 GB; Q5_K_M ~21-23 GB; Q6_K ~24-26 GB; Q8_0 ~31-33 GB.
- Draft head adicional: 3,2 GB (Q8_0) o 1,7 GB (Q4_0) si se usa como archivo separado; el modo fusionado lo integra en el mismo archivo.
- Proyector de visión adicional: 0,9 GB (F16).
- GPU recomendadas: para Q8_0 y Q6_K, A100 40 GB, H100 o RTX 4090 24 GB (Q6_K justo); para Q4_K_M e IQ4_XS, RTX 4090, RTX 3090 o L40S; para IQ2_M, RTX 4080/4070 Ti Super o GPUs de 16 GB.
- Cabe en GPU de consumo: sí, IQ2_M y Q4_K_M en GPUs de 16 GB y 24 GB respectivamente; Q5_K_M y superiores requieren 24 GB o más.
- Opciones de despliegue: llama.cpp (conversión `a94d563ed`), llama-server (con `--model-draft` para MTP), ComfyUI (documentado por el autor), y runtimes compatibles con `mmproj` para visión.
- Latencia y throughput: no disponible. El autor documenta decodificación especulativa medida en este modelo, pero las tablas no se incluyen en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B-Uncensored-GGUF | 27,3 B | 262.144 | Apache 2.0 | GGUF | Abliteration con Heretic; MTP y visión; solo en/zh |
| Qwen/Qwen3.8-27B (base) | 27,3 B | 262.144 | Apache 2.0 | safetensors | Sin modificar; comportamiento de rechazo estándar; referencia de PPL 7,1557 |
| Qwen2.5-32B-Instruct | 32,5 B | 131.072 | Apache 2.0 | safetensors, GGUF | Alternativa de tamaño similar; sin MTP ni abliteration |
| Llama 3.3 70B Instruct | 70 B | 131.072 | Llama 3.3 Community | safetensors, GGUF | Mayor tamaño y calidad general, pero requiere mucha más VRAM |

La comparación cuantitativa de rendimiento con estas alternativas no está disponible en la información proporcionada.

## Limitaciones y advertencias

- El comportamiento de rechazo está "sustancialmente reducido, no eliminado"; el autor no cuantifica el porcentaje exacto en la información disponible.
- La abliteration puede degradar sutilmente capacidades o coherencia; el autor no publica benchmarks de capacidades, solo perplexity.
- Riesgo de alucinación inherente a un modelo de 27,3 B, sin datos específicos publicados.
- Idiomas limitados a inglés y chino; el rendimiento en castellano no está documentado.
- La tasa de aceptación de la decodificación especulativa puede caer ligeramente porque la cabeza draft se entrenó contra el modelo sin modificar; la calidad de salida no se ve afectada por la verificación contra el objetivo.
- La tabla de perplexity no permite distinguir estadísticamente las cuantizaciones Q4_K_M a Q8_0 entre sí ni del f16; no debe usarse para ordenar calidades.
- El repositorio ocupa 231,3 GB; descargar solo los archivos necesarios.
- Licencia Apache 2.0 permite uso comercial, pero el contenido generado sin filtros de rechazo puede infringir normativas locales o políticas de plataforma; se recomienda revisión humana y moderación externa en producción.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta; no hay validación comunitaria independiente.

## Enlaces

- Hugging Face: https://huggingface.co/andyzzc/Qwen3.8-27B-Uncensored-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Heretic (herramienta de abliteration): https://github.com/p-e-w/heretic
- llama.cpp: https://github.com/ggml-org/llama.cpp
