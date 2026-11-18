# luvette/LFM3-1.7B-Decisive-GGUF

## Resumen

LFM3-1.7B-Decisive es una edición de pesos del modelo LiquidAI/LFM3-1.7B publicada por el usuario luvette en Hugging Face. No se trata de un fine-tuning ni de un modelo entrenado desde cero, sino de una modificación directa de los pesos del modelo base mediante una técnica de edición de pesos sin entrenamiento (directional ablation) que proyecta fuera del flujo residual una dirección asociada al "overthinking" o re-verificación excesiva durante el razonamiento. El resultado es un modelo que reduce entre un 31% y un 57% los tokens de pensamiento en tareas de matemáticas e instrucciones, manteniendo la precisión e incluso mejorándola ligeramente en algunos conjuntos.

El modelo base, LFM3-1.7B de Liquid AI, es un transformer de 1.728.801.600 parámetros (1.7B) con licencia LFM 1.0 y una ventana de contexto que, según los experimentos del autor, se ejecuta con presupuesto de generación de 12.288 tokens y se ha probado con contexto de 32k en llama.cpp. La edición se distribuye exclusivamente en formato GGUF cuantizado Q4_K_M, con un tamaño de archivo idéntico al del modelo base cuantizado (1.099.627.808 bytes, 1,10 GB), lo que permite sustituir un archivo por otro sin cambiar los requisitos de hardware.

La relevancia de esta ficha radica en que documenta una técnica de edición de pesos aplicada a un modelo pequeño de razonamiento, con resultados medidos en GSM8K, MATH-500, IFEval y un conjunto de problemas difíciles de MATH. Es un caso práctico de cómo reducir la latencia y el consumo de tokens en modelos con modo "thinking" sin reentrenar, algo especialmente útil en despliegues locales sobre GPU de consumo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base LiquidAI/LFM3-1.7B; edición de pesos sobre el flujo residual) |
| Parámetros totales | 1.728.801.600 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 32.768 tokens en la configuración de llama.cpp documentada; presupuesto de generación de 12.288 tokens en los benchmarks |
| Tipos de cuantización | Q4_K_M (checkpoints publicados); el autor menciona también Q6_K en el proceso de redondeo con projection-aware rounding |
| Idiomas soportados | No disponible |
| Licencia | LFM 1.0 (license_name: lfm1.0, license: other) |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo base LFM3-1.7B es un transformer de 1.7B parámetros desarrollado por Liquid AI. La edición Decisive no utiliza gradientes, datos de entrenamiento ni fine-tuning: parte de los pesos del modelo base cuantizados en Q4_K_M y aplica una proyección en forma cerrada de una dirección de "re-verificación / overthinking" extraída del flujo residual en el bloque 16. Esa dirección se proyecta fuera de las 24 matrices que escriben en el flujo residual a través de los bloques 12 a 23 (`attn_output`, `shortconv.out_proj`, `ffn_down`), teniendo en cuenta las ganancias de post-normalización tipo sandwich-norm que usa LFM3.

La innovación técnica clave es el redondeo consciente de la proyección (projection-aware rounding, PA): el cuantizador estándar `llama-quantize` reintroducía entre un 6% y un 7% de la dirección eliminada, por lo que el autor aplica un redondeo que reduce esa fuga residual a ≤ 0,002%. Se publican dos checkpoints: `wG16` (direcciones refinadas `gfit`/`gfitc`, bloque 16, alpha = [0.0, 1.0]) y `C16` (direcciones `commit`/`math`, bloque 16, alpha = [0.0, 1.0]). Todos los demás tensores y metadatos del modelo permanecen sin cambios.

## Capacidades

- Generación de texto conversacional y razonamiento multi-paso con modo de pensamiento (thinking traces) antes de la respuesta final.
- Razonamiento matemático: resolución de problemas de GSM8K y MATH-500 con precisión medida en los benchmarks del autor.
- Seguimiento de instrucciones (IFEval) con precisión estricta a nivel de prompt e instrucción.
- Razonamiento con presupuesto de tokens reducido: la edición recorta los tokens de pensamiento entre un 31% y un 57% según tarea y checkpoint.
- Reducción de generaciones desbocadas que agotan el límite de 12.288 tokens (de 8 a 0 en GSM8K con wG16; de 17 a 8 en MATH-500 con wG16).
- Compatibilidad con llama.cpp estándar y con endpoints compatibles (tag `endpoints_compatible`).
- No se documentan capacidades de tool calling, function calling, visión, audio ni agentes en la información disponible.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Razonamiento matemático en local sobre GPU de consumo: con 1,10 GB en Q4_K_M y ~226–234 tok/s de decodificación en una RTX 3070 de 8 GB, el modelo permite resolver problemas de GSM8K y MATH-500 en un portátil o torre doméstica sin depender de la nube.
- Sustitución directa del modelo base en pipelines existentes: al tener exactamente el mismo tamaño de archivo (1.099.627.808 bytes) y ejecutarse con llama.cpp estándar, se puede cambiar el GGUF sin modificar la infraestructura ni los requisitos de VRAM.
- Reducción de coste y latencia en producción con modo thinking: el recorte del 55% en tokens de pensamiento en GSM8K (de 1.321 a 595 de media) reduce el tiempo de respuesta y el consumo de cómputo en servicios que ya usan LFM3-1.7B con razonamiento extendido.
- Evaluación de instrucciones y agentes ligeros: el checkpoint C16 alcanza un 93,0% de precisión estricta a nivel de prompt en IFEval (+3,7 pt sobre la base), lo que lo hace adecuado para tareas de seguimiento de instrucciones con formato estricto.
- Control de generaciones desbocadas en entornos con límite de contexto: la reducción de "runaways" (de 8 a 0 en GSM8K y de 17 a 8 en MATH-500 con wG16) disminuye el riesgo de respuestas truncadas o bucles en producción.
- Investigación sobre edición de pesos y mitigación de overthinking: el repositorio documenta la metodología completa (extracción de dirección, proyección con ganancias, redondeo PA), lo que sirve como referencia reproducible para aplicar técnicas similares a otros modelos pequeños.
- Despliegue en servidores con contexto largo: la configuración documentada con `-c 32768` y `-fa on` permite usar el modelo en tareas que requieren ventanas amplias sin salir de los 8 GB de VRAM en Q4_K_M.

## Benchmarks y rendimiento

Resultados publicados por el autor. Todas las ejecuciones usan llama.cpp estándar con `--temp 1.0 --top-p 0.95 --top-k 20 --min-p 0 --repeat-penalty 1.0` y presupuesto de generación de 12.288 tokens. GSM8K y MATH-500 sobre 250 ítems fijos con semilla; intervalos de confianza bootstrap pareados al 95%.

| Métrica | LFM3-1.7B Q4_K_M (base) | wG16 Q4_K_M + PA (recomendado) | C16 Q4_K_M + PA |
|---|---|---|---|
| Tamaño de archivo | 1.099.627.808 bytes | 1.099.627.808 bytes (idéntico) | 1.099.627.808 bytes (idéntico) |
| GSM8K precisión | 90,4% | 92,4% (+2,0 pt, IC −0,8 a +4,8) | 89,2% (−1,2 pt, IC −4,0 a +1,6) |
| GSM8K pensamiento medio | 1.321 tokens | 595 tokens (−55%) | 566 tokens (−57%) |
| GSM8K pensamiento mediano | 348 tokens | 276 tokens (−21%) | 236 tokens (−32%) |
| GSM8K runaways (tope 12k) | 8 | 0 (−100%) | 2 (−75%) |
| GSM8K pensamiento (ambos resueltos) | — | −46% | −48% |
| MATH-500 precisión | 87,2% | 89,6% (+2,4 pt, IC −0,8 a +6,0) | 86,8% (−0,4 pt, IC −4,0 a +2,8) |
| MATH-500 pensamiento medio | 2.595 tokens | 1.791 tokens (−31%) | 1.764 tokens (−32%) |
| MATH-500 pensamiento mediano | 856 tokens | 658 tokens (−23%) | 605 tokens (−29%) |
| MATH-500 runaways (tope 12k) | 17 | 8 (−53%) | 10 (−41%) |
| MATH-500 pensamiento (ambos resueltos) | — | −31% | −34% |
| Cabe en contexto de 8K (≤8.192 think) | GSM8K 94,8%, MATH-500 88,8% | GSM8K 99,6%, MATH-500 94,8% | GSM8K 99,2%, MATH-500 93,6% |

| Métrica (IFEval, n = 300, pareado en RTX 3070) | Base | wG16 Q4_K_M + PA | C16 Q4_K_M + PA |
|---|---|---|---|
| Precisión estricta a nivel de prompt | 89,3% | 91,0% (+1,7 pt, IC −1,7 a +5,0) | 93,0% (+3,7 pt, IC +0,7 a +7,0) |
| Precisión estricta a nivel de instrucción | 90,6% | 92,8% (+2,2 pt, IC −0,8 a +5,4) | 94,7% (+4,1 pt, IC +1,4 a +7,0) |
| Pensamiento medio | 4.422 tokens | 2.959 tokens (−33%) | 2.898 tokens (−34%) |
| Sin terminar (tope 12k) | 23 | 11 | 8 |

| Conjunto difícil de MATH (64 problemas nivel 4–5 reservados) | Base | C16 Q4_K_M + PA |
|---|---|---|
| Correctos | 49 / 64 | 53 / 64 (+4) |
| Runaways | 9 | 4 |
| Pensamiento medio | 3.624 tokens | 2.570 tokens |
| Pensamiento mediano | 1.446 tokens | 859 tokens (−36% en problemas que ambos resuelven) |

Nota de varianza de hardware del autor: `wG16` se evaluó en una RTX 3070; frente a la ejecución base en la misma RTX 3070 (GSM8K 92,8%, MATH-500 88,4% sobre n=249), el resultado es −0,4 pt en GSM8K (IC −3,6 a +2,8, −50% de pensamiento, 0 frente a 7 runaways) y +1,6 pt en MATH-500 (IC −1,6 a +5,2, −33% de pensamiento, 8 frente a 19 runaways).

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint Q4_K_M ocupa 1,10 GB en disco; con overhead de contexto y caché KV, la ejecución documentada cabe en 8 GB de VRAM con contexto de 32.768 tokens.
- GPU recomendadas: NVIDIA GeForce RTX 3070 (8 GB) es la plataforma de referencia del autor, con ~226–234 tok/s de decodificación y ~2.068–4.436 tok/s de evaluación de prompt usando `llama-server -ngl 99 -fa on -np 1 -c 32768`. No se documentan mediciones en A100, H100 ni RTX 4090.
- Cabe en GPU de consumo: sí, en tarjetas con 8 GB o más de VRAM; el tamaño de 1,10 GB deja margen amplio para caché KV y contexto largo.
- Opciones de despliegue: llama.cpp estándar (llama-server, llama-cli) con soporte para LFM3; el repositorio usa `library_name: llama.cpp` y el tag `endpoints_compatible`. No se documentan otras opciones como vLLM, Ollama o TGI.
- Latencia y throughput: medidos en RTX 3070 con `-ngl 99 -fa on -np 1 -c 32768`: ~226–234 tok/s de decodificación (o ~224–226 tok/s con `-ctk q8_0 -ctv q8_0`). No se proporcionan datos de latencia por petición ni de throughput en otras GPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | GSM8K | MATH-500 | Licencia | Formato |
|---|---|---|---|---|---|---|
| LFM3-1.7B-Decisive wG16 (este) | 1.728.801.600 | 32.768 (config. documentada) | 92,4% | 89,6% | LFM 1.0 | GGUF Q4_K_M |
| LiquidAI/LFM3-1.7B (base) | 1.728.801.600 | 32.768 (config. documentada) | 90,4% | 87,2% | LFM 1.0 | safetensors / GGUF |
| LFM3-1.7B-Decisive C16 (variante) | 1.728.801.600 | 32.768 (config. documentada) | 89,2% | 86,8% | LFM 1.0 | GGUF Q4_K_M |

No se dispone de datos de benchmarks de otros modelos comparables de la misma categoría (1–2B parámetros con modo razonamiento) en la información proporcionada, por lo que la comparativa se limita al modelo base y a la variante C16 del mismo autor.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan en la información disponible; al derivar del modelo base, hereda los sesgos de LFM3-1.7B.
- Riesgo de alucinación: no se cuantifica en la model card; el modelo mantiene el modo de razonamiento y puede generar cadenas de pensamiento incorrectas aunque la edición reduce los bucles de re-verificación.
- Limitaciones de contexto: los benchmarks usan un presupuesto de generación de 12.288 tokens; aunque la configuración documentada admite 32.768 tokens de contexto, no se ofrecen resultados de precisión más allá de ese presupuesto.
- Idiomas: no se especifican los idiomas soportados en la información proporcionada.
- Licencia: LFM 1.0 (license: other). Es una licencia propia del modelo base; es necesario revisar el archivo LICENSE del repositorio para conocer las restricciones exactas de uso comercial antes de desplegarlo en producción.
- La edición de pesos no ha pasado por un proceso de alineación adicional; los resultados de seguridad y robustez del modelo base podrían verse alterados por la modificación del flujo residual.
- El autor advierte de varianza de hardware: las cifras de referencia se obtuvieron en una RTX 3070 y pueden diferir en otras GPU.
- Solo se distribuyen checkpoints Q4_K_M; no se publican versiones en otros formatos ni pesos sin cuantizar de la edición.
- El repositorio tiene 0 descargas y 1 like en el momento de la consulta, por lo que se trata de una publicación reciente y con poca validación externa.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/luvette/LFM3-1.7B-Decisive-GGUF
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B
- Modelo base preentrenado: https://huggingface.co/LiquidAI/LFM3-1.7B-Base
- Licencia LFM 1.0: incluida en el repositorio como archivo LICENSE (license_link: LICENSE)
- No se han encontrado papers, blogs, repositorios adicionales ni demos en la información proporcionada.
