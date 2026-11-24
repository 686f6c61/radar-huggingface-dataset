# pearsonkyle/gemma-4-E4B-imatrix-awq-GGUF

## Resumen

`pearsonkyle/gemma-4-E4B-imatrix-awq-GGUF` es un repositorio de cuantizaciones GGUF del modelo Google Gemma-4 E4B, tanto en su variante instructa estándar (`google/gemma-4-E4B-it`) como en la variante entrenada con QAT (`google/gemma-4-E4B-it-qat-q4_0-unquantized`). Lo publica el usuario independiente pearsonkyle y no es un modelo nuevo, sino un trabajo de compresión y calibración sobre los pesos originales de Google. El interés está en la metodología: calibración imatrix sobre 15 millones de tokens del corpus `pearsonkyle/llmtk-sft-corpus-v2` a 32k de contexto, con comparación sistemática frente a AWQ y filtrado de variantes por divergencia KL.

El repositorio conserva únicamente cuatro GGUF objetivo (IQ3_M e IQ4_XS, en versión base y QAT), tras eliminar ocho variantes que superaban KLD > 1 en alguna de las dos distribuciones de evaluación (general e instruct/tools). Además incluye los asistentes MTP de decodificación especulativa en Q8_0, convertidos desde Unsloth, con validación empírica en Apple Silicon Metal. La licencia declarada es Apache 2.0 y los pesos suman 7.518.069.290 parámetros.

Es relevante ahora porque documenta con métricas de fidelidad (KLD, Top-P) qué configuraciones de cuantización degradan el modelo y cuáles no, algo poco habitual en repositorios de GGUF de terceros. Para quien despliegue Gemma-4 E4B en local con llama.cpp, ofrece una guía de selección basada en datos en lugar de en intuición.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (modelo base Gemma-4 E4B); GGUF para llama.cpp, con soporte de arquitecturas `gemma4` y `gemma4-assistant` para MTP |
| Parametros totales | 7.518.069.290 (dato de safetensors del modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32k tokens usados en la calibración imatrix; contexto de inferencia validado en los ejemplos: 8192 (llama-server) y 2048 (pruebas MTP) |
| Tipos de cuantizacion | IQ3_M, IQ4_XS (objetivo); Q8_0 (asistentes MTP). Estudio original también cubrió IQ2_M |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo subyacente es Gemma-4 E4B de Google, un transformer denso de aproximadamente 7.500 millones de parámetros en su variante instructa. Este repositorio no entrena ni ajusta el modelo: aplica cuantización post-entrenamiento con llama.cpp. La calibración imatrix se realizó sobre 15 millones de tokens del corpus `pearsonkyle/llmtk-sft-corpus-v2` con contexto de 32k, y el estudio original comparó imatrix frente a AWQ en tres niveles (IQ2_M, IQ3_M, IQ4_XS) sobre las dos variantes del modelo (base y QAT).

La innovación técnica del repositorio es doble. Por un lado, el filtrado por divergencia KL: se midió KLD frente a la referencia F16 en dos distribuciones (general e instruct/tools) y se retiraron las ocho variantes con KLD > 1 en cualquiera de ellas, lo que descartó sistemáticamente todas las cuantizaciones AWQ y las imatrix de IQ2_M. Por otro, la inclusión de asistentes MTP (multi-token prediction) para decodificación especulativa: GGUFs Q8_0 de unos 94 MiB que actúan como draft del modelo objetivo, con arquitectura `gemma4-assistant` separada y sin modificar los pesos del target.

## Capacidades

- Generación de texto conversacional multi-turno, heredada del modelo instructo Gemma-4 E4B-it.
- Razonamiento y respuesta a instrucciones en el formato del modelo base; las cuantizaciones IQ3_M e IQ4_XS conservan la fidelidad medida frente a F16.
- Decodificación especulativa mediante asistentes MTP emparejados (base con base, QAT con QAT), con profundidad de borrador configurable (`--spec-draft-n-max`, validado con 3).
- Compatibilidad con endpoints (tag `endpoints_compatible`) y uso conversacional.
- Soporte de tool calling e instrucciones tipo tools: la distribución de evaluación "instruct/tools" del estudio sugiere uso en ese dominio, aunque no se documentan capacidades específicas adicionales.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Despliegue local en estaciones de trabajo: usar `gemma-4-E4B-it-qat-IQ4_XS-imatrix.gguf` (4,691 GiB, KLD 0,057 general / 0,049 instruct) como opción de máxima fidelidad en un equipo con GPU consumer, sirviendo con `llama-server` a 8192 de contexto.
- Entornos con restricciones de VRAM: elegir las variantes IQ3_M (4,365–4,391 GiB) cuando el presupuesto de memoria no permita IQ4_XS, asumiendo un KLD mayor (0,255/0,205 en QAT; 0,342/0,222 en base) pero todavía por debajo del umbral de descarte.
- Asistente conversacional autoalojado: el tag `endpoints_compatible` y la naturaleza instructa del modelo permiten exponerlo tras una API compatible con endpoints y gestionar diálogos multi-turno con contexto de hasta 32k.
- Aceleración de inferencia con decodificación especulativa: emparejar el target QAT con `MTP/qat/mtp-gemma-4-E4B-it-qat-Q8_0.gguf` y `--spec-type draft-mtp` para reducir el número de pasos de decodificación; validar antes el throughput en el hardware concreto, ya que en el Mac del autor no se observó mejora consistente.
- Evaluación y auditoría de cuantizaciones: el repositorio sirve como referencia para comparar fidelidad KLD/Top-P entre métodos (imatrix frente a AWQ) antes de adoptar una cuantización en producción.
- Prototipado de pipelines con herramientas: la distribución instruct/tools del estudio y la baja KLD de IQ4_XS QAT lo hacen adecuado para probar flujos de function calling en local antes de escalar a infraestructura mayor.
- Investigación sobre QAT frente a post-training quantization: permite comparar directamente las familias base y QAT del mismo modelo con las mismas métricas de fidelidad.

## Benchmarks y rendimiento

El autor declara cuatro entradas en el model-index (`gemma-4-E4B-it-IQ3_M-imatrix`, `gemma-4-E4B-it-IQ4_XS-imatrix`, `gemma-4-E4B-it-qat-IQ3_M-imatrix`, `gemma-4-E4B-it-qat-IQ4_XS-imatrix`) pero todas con `results: []`, es decir, sin resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K u otros). Los datos publicados son métricas de fidelidad de cuantización y velocidad de decodificación del estudio original:

| Modelo | Quant | Método | Tamaño (GiB) | BPW | KLD general | KLD instruct | Top-P general | Top-P instruct | Decode (tok/s) | Disponibilidad |
|---|---|---|---|---|---|---|---|---|---|---|
| gemma-4-E4B-it | IQ2_M | imatrix | 3,550 | 4,056 | 1,461 | 0,978 | 50,0 | 61,8 | 50,3 | Retirado |
| gemma-4-E4B-it | IQ2_M | AWQ | 3,527 | 4,030 | 12,266 | 13,830 | 0,1 | 0,1 | 69,9 | Retirado |
| gemma-4-E4B-it | IQ3_M | imatrix | 4,391 | 5,017 | 0,342 | 0,222 | 74,9 | 81,1 | 68,8 | Disponible |
| gemma-4-E4B-it | IQ3_M | AWQ | 4,365 | 4,988 | 16,393 | 17,650 | 0,3 | 0,3 | 63,5 | Retirado |
| gemma-4-E4B-it | IQ4_XS | imatrix | 4,723 | 5,396 | 0,149 | 0,094 | 82,8 | 87,6 | 59,5 | Disponible |
| gemma-4-E4B-it | IQ4_XS | AWQ | 4,691 | 5,360 | 16,443 | 17,562 | 0,03 | 0,02 | 40,8 | Retirado |
| gemma-4-E4B-it-qat | IQ2_M | imatrix | 3,527 | 4,060 | 4,888 | 4,940 | 21,9 | 23,8 | 76,2 | Retirado |
| gemma-4-E4B-it-qat | IQ2_M | AWQ | 3,527 | 4,060 | 18,363 | 20,090 | 0,1 | 0,0 | 65,1 | Retirado |
| gemma-4-E4B-it-qat | IQ3_M | imatrix | 4,365 | — | 0,255 | 0,205 | — | — | — | Disponible |
| gemma-4-E4B-it-qat | IQ4_XS | imatrix | 4,691 | — | 0,057 | 0,049 | — | — | — | Disponible |

Validación de MTP: con llama.cpp `b9692` (`f3e182816`) en Apple Silicon Metal, dos prompts cortos por target, límite de 96 tokens, muestreo greedy, contexto de 2k y profundidad de borrador 3, se obtuvo una aceptación del 46–53 %. Siete de ocho respuestas generadas coincidieron exactamente con la línea base; una respuesta de QAT IQ3_M difirió. El autor advierte que son pruebas de humo, no benchmarks de calidad ni de contexto largo, y que no se observó mejora de velocidad consistente en su Mac.

## Requisitos de hardware

- VRAM estimada: al menos ~4,4 GiB para IQ3_M y ~4,7 GiB para IQ4_XS, más overhead del contexto KV cache; con 8192 de contexto el consumo real será superior.
- Asistentes MTP: ~94 MiB adicionales por borrador Q8_0.
- GPU recomendadas: no especificadas por el autor. Por tamaño, cualquier GPU consumer con 8 GB o más debería alojar el modelo con contexto moderado; GPUs de datacenter (A100, H100) no aportan ventaja de capacidad a este tamaño.
- Cabe en GPU consumer: sí, previsiblemente en RTX 3060/4060 de 8 GB y superiores; no confirmado por el autor.
- Opciones de despliegue: llama.cpp (`llama-server`, `llama-cli`) con build que soporte MTP para E4B (PR #24282); GGUF también utilizable en otros runners compatibles.
- Latencia y throughput: 68,8 tok/s (IQ3_M base), 59,5 tok/s (IQ4_XS base), 76,2 tok/s (IQ2_M QAT, retirado) en el entorno de medición del autor; hardware de referencia no especificado. Con MTP no se observó mejora consistente.
- Nota de compatibilidad: el ejemplo usa `-fa off` por un fallo conocido de flash-attention CUDA en E4B; en Metal se probó con `-fa on`.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Fidelidad / rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este repo (QAT IQ4_XS imatrix) | 7,52B | 32k (calibración) | KLD 0,057 general / 0,049 instruct; 4,691 GiB | Apache 2.0 | GGUF en HF |
| Este repo (base IQ4_XS imatrix) | 7,52B | 32k (calibración) | KLD 0,149 / 0,094; 4,723 GiB; 59,5 tok/s | Apache 2.0 | GGUF en HF |
| `google/gemma-4-E4B-it` (original) | 7,52B | no disponible | Referencia F16 del estudio | Apache 2.0 | Pesos originales en HF |
| `unsloth/gemma-4-E4B-it-GGUF` | 7,52B | no disponible | no disponible en esta información | no disponible | GGUF en HF (fuente de los MTP) |

No se dispone de datos de benchmarks de tareas que permitan comparar con modelos de otros fabricantes de tamaño similar; la comparación se limita a variantes del mismo modelo base.

## Limitaciones y advertencias

- No hay benchmarks de tareas publicados: los resultados del model-index están vacíos y las métricas del repositorio son de fidelidad de cuantización, no de precisión en tareas.
- Las cuantizaciones IQ3_M pierden fidelidad de forma apreciable frente a IQ4_XS (KLD 0,255–0,342 frente a 0,057–0,149); usarlas solo cuando el ahorro de ~0,3 GiB sea determinante.
- El método AWQ resultó claramente inferior en este estudio (KLD 12–20) y todas sus variantes fueron retiradas; no deben buscarse en la rama por defecto.
- El emparejamiento MTP es estricto: asistente base con target base y asistente QAT con target QAT. La autodetección por nombre de fichero no garantiza el emparejamiento correcto.
- La validación de MTP es una prueba de humo (dos prompts, 96 tokens): no demuestra calidad ni comportamiento en contexto largo, y no se observó ganancia de velocidad consistente.
- Riesgo de alucinación y sesgos: no documentados en la información proporcionada, pero aplican los del modelo base Gemma-4 E4B-it.
- Idiomas soportados no declarados en el repositorio.
- Licencia Apache 2.0 declarada, pero conviene verificar los términos del modelo base de Google antes de uso comercial en producción.
- Repositorio de terceros con 548 descargas y 1 like: menor escrutinio de la comunidad que las cuantizaciones de organizaciones establecidas.
- Fallo conocido de flash-attention CUDA con E4B según las instrucciones upstream; verificar en el hardware objetivo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/pearsonkyle/gemma-4-E4B-imatrix-awq-GGUF
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it
- Modelo base QAT: https://huggingface.co/google/gemma-4-E4B-it-qat-q4_0-unquantized
- Asistente MTP base: https://huggingface.co/google/gemma-4-E4B-it-assistant
- Asistente MTP QAT: https://huggingface.co/google/gemma-4-E4B-it-qat-q4_0-unquantized-assistant
- GGUF de Unsloth (base): https://huggingface.co/unsloth/gemma-4-E4B-it-GGUF
- GGUF de Unsloth (QAT): https://huggingface.co/unsloth/gemma-4-E4B-it-qat-GGUF
- Instrucciones MTP de Unsloth: https://huggingface.co/unsloth/gemma-4-E4B-it-GGUF/blob/main/MTP/README.md
- PR de llama.cpp con soporte MTP para E4B: https://github.com/ggml-org/llama.cpp/pull/24282
- Dataset de calibración: https://huggingface.co/datasets/pearsonkyle/llmtk-sft-corpus-v2
- Dataset suplementario: https://huggingface.co/datasets/pearsonkyle/broad-domain-supplement
