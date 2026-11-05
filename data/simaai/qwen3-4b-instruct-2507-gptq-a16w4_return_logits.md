# simaai/Qwen3-4B-Instruct-2507-GPTQ-a16w4_return_logits

## Resumen

Qwen3-4B-Instruct-2507-GPTQ-a16w4_return_logits es una compilación del modelo Qwen3-4B-Instruct-2507 de Alibaba Qwen, publicada por SiMa.ai para su plataforma de hardware Modalix. No se trata de un modelo nuevo ni de un fine-tuning, sino de un artefacto precompilado y cuantizado (A16W4 con GPTQ) que incluye la opción `--return_logits` para poder ejecutar benchmarks de precisión sobre el acelerador Modalix sin necesidad de recompilar el modelo original.

El modelo subyacente es un transformer denso de 4.000 millones de parámetros con una longitud de contexto limitada a 4096 tokens en esta compilación, muy por debajo de la ventana nativa del Qwen3-4B-Instruct-2507 original. La cuantización A16W4 mantiene activaciones en BF16 y pesos en INT4, lo que reduce el espacio en disco y memoria a costa de pequeñas desviaciones respecto al modelo en precisión completa.

Su relevancia es acotada pero específica: sirve como referencia reproducible para validar la corrección numérica del runtime LLiMa/Neat de SiMa.ai sobre Modalix. Los resultados publicados en la model card (HellaSwag, PIQA, TriviaQA, WikiText, WinoGrande) permiten comparar el backend Modalix contra el backend de Hugging Face, aunque la tabla publicada deja vacías las columnas del backend HF, por lo que la comparación directa no está disponible en la información proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen3) |
| Parametros totales | 4B (aproximado, según model card) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 4096 tokens (en esta compilación) |
| Tipos de cuantizacion | A16W4 (activaciones BF16, pesos INT4) con GPTQ |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Artefactos compilados para SiMa.ai Modalix (directorios `devkit/` y `elf_files/`); no se indica safetensors ni GGUF |
| Modelo base | Qwen/Qwen3-4B-Instruct-2507 |
| Tamano del repositorio | 6,8 GB |
| Pipeline | text-generation |
| Logits de salida | Habilitados (`--return_logits`) |

## Arquitectura y entrenamiento

La arquitectura corresponde al modelo base Qwen3-4B-Instruct-2507, un transformer denso de aproximadamente 4.000 millones de parámetros. Esta publicación no aporta detalles adicionales sobre el entrenamiento del modelo original (número de tokens, composición del dataset, uso de RLHF o DPO); esa información debe consultarse en la model card de Qwen/Qwen3-4B-Instruct-2507.

La innovación técnica de este artefacto no está en el modelo sino en el pipeline de despliegue: SiMa.ai compila el modelo cuantizado con GPTQ en formato A16W4 y activa la devolución de logits para que el CLI `llima-benchmark` pueda calcular métricas de precisión (accuracy, bits-per-byte, perplejidad) sobre el backend Modalix. El runtime Neat/LLiMa gestiona los modelos precompilados en `/media/nvme/llima/models` y expone un servidor de benchmark que el host consulta mediante `--board_ip`. La compilación fija el contexto máximo en 4096 tokens, presumiblemente por restricciones de memoria del acelerador.

## Capacidades

- Generación de texto conversacional e instructiva, heredada del modelo base Qwen3-4B-Instruct-2507.
- Devolución de logits por token, necesaria para benchmarks de precisión y cálculo de perplejidad.
- Ejecución de tareas de evaluación estándar de lm-evaluation-harness: HellaSwag, PIQA, TriviaQA, WikiText y WinoGrande, según los resultados publicados.
- Integración con el CLI `llima-benchmark` en modo `accuracy` contra backend Modalix o backend Hugging Face.
- Capacidades de tool calling, agentes, razonamiento multi-paso o multilingüismo: no documentadas en esta model card; deben verificarse en la model card del modelo base.
- Modo thinking: no documentado en esta publicación.

## Casos de uso

- Validación de precisión del runtime Modalix: ejecutar `llima-benchmark accuracy` con las tareas HellaSwag, PIQA, TriviaQA, WikiText y WinoGrande para comprobar que la inferencia en el acelerador reproduce los valores esperados del modelo base. Es el propósito principal declarado por el autor.
- Regresión numérica en pipelines de compilación: usar los logits devueltos para comparar token a token la salida del backend Modalix frente al backend Hugging Face tras cambios en el compilador o en el runtime Neat.
- Medición de degradación por cuantización: calcular bits-per-byte y perplejidad sobre WikiText (0,7432 y 1,6739 respectivamente en Modalix según la model card) para cuantificar la pérdida frente al modelo en BF16.
- Integración en CI de despliegues edge: incorporar el benchmark como paso automatizado antes de promover una nueva versión del runtime LLiMa a producción en dispositivos Modalix.
- Evaluación de modelos en entornos embebidos: servir como referencia para comparar el comportamiento de otros modelos compilados para Modalix con el mismo harness y las mismas tareas.
- Reproducibilidad de resultados publicados: replicar las cifras de la model card (HellaSwag acc_norm 0,6752; PIQA acc_norm 0,7617; WinoGrande acc 0,6638) en un dispositivo Modalix propio para verificar el estado del hardware.

## Benchmarks y rendimiento

Resultados publicados en la model card para el backend Modalix. Las columnas del backend Hugging Face figuran vacías en la información disponible, por lo que no se puede calcular la diferencia absoluta.

| Tarea | Métrica | n-shot | Valor Modalix | StdErr | Muestras |
|---|---|---:|---:|---:|---:|
| HellaSwag | acc | 0 | 0,5141 | 0,0050 | 10.042 |
| HellaSwag | acc_norm | 0 | 0,6752 | 0,0047 | 10.042 |
| PIQA | acc | 0 | 0,7584 | 0,0100 | 1.838 |
| PIQA | acc_norm | 0 | 0,7617 | 0,0099 | 1.838 |
| TriviaQA | exact_match | 0 | 0,0000 | 0,0000 | 17.944 |
| WikiText | bits_per_byte | 0 | 0,7432 | N/A | 62 |
| WikiText | byte_perplexity | 0 | 1,6739 | N/A | 62 |
| WikiText | word_perplexity | 0 | 15,7165 | N/A | 62 |
| WinoGrande | acc | 0 | 0,6638 | 0,0133 | 1.267 |

El resultado de TriviaQA (exact_match 0,0000) es llamativo y sugiere un problema de formato de respuesta o de configuración del harness en esa tarea concreta; conviene tratarlo con cautela antes de extraer conclusiones sobre la calidad del modelo.

## Requisitos de hardware

- Hardware objetivo: dispositivo SiMa.ai Modalix con runtime Neat instalado y CLI `llima` disponible.
- Almacenamiento: el repositorio ocupa 6,8 GB; los modelos se colocan por defecto en `/media/nvme/llima/models`.
- VRAM: no disponible; el modelo se ejecuta sobre el acelerador Modalix, no sobre GPU convencional.
- GPU recomendadas: no aplica para el artefacto compilado. Para ejecutar el modelo base Qwen3-4B-Instruct-2507 en GPU, se requiere hardware compatible con el formato original (no especificado en esta model card).
- Despliegue: `llima pull` para descarga directa en el dispositivo, o `hf download` más `scp` para transferir desde un host. El benchmark se lanza desde el host con `llima-benchmark accuracy`.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Plataforma |
|---|---|---|---|---|---|
| simaai/Qwen3-4B-Instruct-2507-GPTQ-a16w4_return_logits | 4B | 4096 | A16W4 GPTQ | Apache 2.0 | SiMa.ai Modalix |
| Qwen/Qwen3-4B-Instruct-2507 (base) | 4B | no disponible en esta ficha | BF16 original | Apache 2.0 | GPU/CPU genérica |
| Otras compilaciones SiMa.ai de modelos Qwen3 | no disponible | no disponible | A16W4 | Apache 2.0 | SiMa.ai Modalix |

La comparación relevante es contra el modelo base sin cuantizar: esta compilación sacrifica contexto (4096 frente a la ventana nativa del original) y precisión numérica a cambio de ejecución en el acelerador Modalix. Para alternativas de la misma categoría (modelos de 4B para edge), no se dispone de datos en la información proporcionada.

## Limitaciones y advertencias

- La cuantización A16W4 introduce desviaciones respecto al modelo en precisión completa; la propia model card lo advierte.
- El contexto está limitado a 4096 tokens, lo que restringe casos de uso que requieran ventanas largas.
- El artefacto está compilado con `--return_logits` para benchmarking; para generación de texto estándar el autor recomienda usar la versión correspondiente de la colección Large Language Models de SiMa.ai.
- El resultado de TriviaQA (exact_match 0,0000) indica probablemente un fallo de configuración del harness y no debe interpretarse como incapacidad del modelo.
- No hay datos publicados del backend Hugging Face en la tabla, por lo que la magnitud de la degradación por cuantización no es verificable a partir de esta model card.
- Licencia Apache 2.0: permite uso comercial, pero las condiciones del runtime Neat/LLiMa y del hardware Modalix se rigen por los términos de SiMa.ai, no por la licencia del modelo.
- Riesgo de alucinación y sesgos: no evaluados en esta publicación; deben asumirse los del modelo base Qwen3-4B-Instruct-2507.
- Idiomas soportados no documentados en esta ficha.
- El repositorio no presenta descargas ni likes, lo que sugiere un uso muy niche y poca validación comunitaria independiente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/simaai/Qwen3-4B-Instruct-2507-GPTQ-a16w4_return_logits
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Guía de inicio de SiMa.ai Neat: https://developer.sima.ai/software/getting-started/
- Benchmarking de precisión MOLE: https://developer.sima.ai/software/genai-llima/mole
