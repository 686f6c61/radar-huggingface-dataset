# Jeesup/svd-safety-mistral_7b_instruct_v02_up_basis_coeff_jbbsft_finetuned_keep_0p60

## Resumen

Este checkpoint es un artefacto de investigación del usuario Jeesup que aplica compresión por *Basis Sharing* sobre `mistralai/Mistral-7B-Instruct-v0.2` y después recupera parte de la capacidad perdida con un LoRA entrenado únicamente sobre los coeficientes. El objetivo declarado no es publicar un modelo de propósito general, sino medir cómo la compresión low-rank afecta al comportamiento de negativa (refusal) y a la utilidad del modelo. Se elimina el 40 % de los parámetros (se conserva un 60 %) agrupando dos capas adyacentes que comparten una única base por tipo de peso (`v`, `k`, `q`, `up`, `gate`), mientras que `down` y `o` permanecen privados por capa.

El modelo conserva 7.241.732.096 parámetros y se publica en formato denso `MistralForCausalLM`, con las matrices factorizadas plegadas a las formas originales de Mistral. Esto implica una advertencia importante: el modelo es de rango deficiente, pero no ocupa menos en disco (el repositorio pesa 14,5 GB). Se carga con `transformers` estándar, sin código de modelado personalizado, y está licenciado bajo Apache-2.0.

Su relevancia es metodológica: la model card documenta con detalle el pipeline (SVD blanqueado, congelación de bases, mezcla de coeficientes, plegado a denso), la calibración (256 secuencias de WikiText-2 de 2048 tokens, semilla 42) y todas las métricas de utilidad y seguridad, incluidas las tasas de sobrerrespuesta. También advierte explícitamente de que la compresión a este ratio degrada la negativa, por lo que sus números de seguridad deben interpretarse como objeto de estudio, no como evidencia de alineación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (Llama/Mistral, GQA); bases compartidas por grupos de 2 capas adyacentes, plegadas a denso |
| Parametros totales | 7.241.732.096 (~7,24 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No especificada en la model card; el modelo base `mistralai/Mistral-7B-Instruct-v0.2` declara 32.768 tokens y la model card confirma que este checkpoint no usa sliding window |
| Tipos de cuantizacion | No disponible (pesos publicados en safetensors sin cuantizar; repo de 14,5 GB) |
| Idiomas soportados | No disponible (no se especifica en la model card) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (checkpoint denso, `MistralForCausalLM`) |

## Arquitectura y entrenamiento

La arquitectura de partida es Mistral-7B-Instruct-v0.2. Sobre ella se aplica el código de Basis Sharing (`TUDa-HWAI/Basis_Sharing`, commit `1c021b6ce1d3`): para cada grupo de dos capas adyacentes se concatenan horizontalmente los pesos del mismo tipo y se ajusta una base compartida mediante SVD blanqueado. Los tipos compartidos son `v`, `k`, `q`, `up` y `gate`; `down` y `o` se mantienen privados por capa. El resultado retiene una fracción real de parámetros de 0,599853515625 (60 %).

La recuperación se hace con LoRA de rango 8 y alpha 16, 2 épocas, learning rate 0,0001 y batch 64 sobre `yahma/alpaca-cleaned` más 960 filas de negativa (96 comportamientos dañinos de JailbreakBench replicados x10, un 1,82 % del total), cuyos objetivos son las negativas greedy del propio `meta-llama/Llama-2-7b-chat-hf`. Solo se entrenan los coeficientes: las bases compartidas y por capa permanecen congeladas y bit-idénticas al modelo comprimido, de modo que cada peso conserva rango ≤ k y el presupuesto de parámetros sobrevive intacto a la recuperación. Después se mezclan los coeficientes (`C' = C + (alpha/r)BA`) y se pliega `W = C' @ B` a denso.

Detalles técnicos reseñables: la compresión se realizó por la ruta `ShareLlama` (no por el módulo Mistral de Basis Sharing), lo cual es exacto porque Mistral-7B-Instruct-v0.2 no tiene sliding window y, cargado como `LlamaForCausalLM`, produjo logits idénticos a `MistralForCausalLM` (diferencia máxima 0,0 en float32, hasta 600 tokens). El LoRA entrena el modelo factorizado, y la model card verifica que las tablas rotatorias coinciden con las de Llama en float64 para RoPE base 1e4/5e5/1e6, escalado llama3, GQA y sesgos q/k/v.

## Capacidades

- Generación de texto conversacional en formato chat, heredada de Mistral-7B-Instruct-v0.2.
- Razonamiento de sentido común y comprensión lectora a nivel de benchmark zero-shot (ARC, HellaSwag, WinoGrande, OpenBookQA, PIQA).
- Aritmética y matemáticas básicas (MathQA), con rendimiento degradado respecto al modelo sin comprimir.
- Comportamiento de negativa ante peticiones dañinas, medido con AdvBench y StrongREJECT.
- Capacidad de servir como sujeto de pruebas de sobrerrespuesta (XSTest-safe, OR-Bench-Hard-1K).
- No se documenta soporte de tool calling, function calling, agentes, multimodalidad, audio ni modo de pensamiento explícito.
- Capacidades multilingües: no documentadas en la model card.

## Casos de uso

- Investigación sobre compresión low-rank y alineación: cuantificar cómo retener el 60 % de los parámetros afecta a la negativa; el repositorio incluye las salidas por prompt y las métricas en bruto en `utility/` y `safety/`.
- Medición de sobrerrespuesta: ejecutar XSTest-safe y OR-Bench-Hard-1K con `allenai/wildguard` para reproducir las tasas de 12,85 % y 27,33 % y compararlas entre celdas del proyecto.
- Evaluación de robustez frente a jailbreaks: usar AdvBench (520 prompts) y StrongREJECT con el clasificador `cais/HarmBench-Llama-2-13b-cls` para reproducir el ASR de 0,0327 y 0,1054.
- Baseline reproducible para comparar compresores: la receta de recuperación es constante entre métodos (misma mezcla de alpaca y filas de negativa), lo que permite aislar el efecto del compresor.
- Estudio del efecto de datos de seguridad durante la recuperación: la celda `recovery_mix` mezcla comportamientos dañinos de JailbreakBench para comprobar si preservan la negativa tras la compresión.
- Punto de partida para fine-tuning o destilación posteriores: al cargarse con `transformers` estándar como `MistralForCausalLM`, se puede reentrenar sin adaptar código.
- Red teaming y auditoría de seguridad: emplearlo como modelo objetivo en pipelines de ataque para caracterizar cómo un modelo comprimido falla al negarse.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Fraccion de parametros retenida | 0,5999 |
| Perplejidad WikiText-2 | 9,3338 |
| ARC-Easy (acc_norm) | 0,6414 |
| ARC-Challenge (acc_norm) | 0,4189 |
| HellaSwag (acc_norm) | 0,6476 |
| WinoGrande (acc) | 0,6519 |
| OpenBookQA (acc_norm) | 0,4060 |
| PIQA (acc_norm) | 0,7133 |
| MathQA (acc_norm) | 0,2697 |
| AdvBench HarmBench ASR | 0,0327 |
| StrongREJECT HarmBench ASR | 0,1054 |
| Sobrerrespuesta XSTest-safe | 0,1285 |
| Sobrerrespuesta OR-Bench-Hard-1K | 0,2733 |
| Sobrerrespuesta macro | 0,2009 |

Metodología: perplejidad sobre WikiText-2; ARC-Easy/Challenge, HellaSwag, WinoGrande, OpenBookQA, PIQA y MathQA en zero-shot; AdvBench y StrongREJECT juzgados con `cais/HarmBench-Llama-2-13b-cls`; sobrerrespuesta sobre XSTest-safe y OR-Bench-Hard-1K juzgada con `allenai/wildguard`. Toda la generación usa la plantilla de chat y decodificación greedy. La model card indica que el juicio de sobrerrespuesta es fiable para esta celda (fracción puntuada de 1,00 en ambos conjuntos).

No se han publicado en la información proporcionada resultados de benchmarks de otros modelos comparables, por lo que no se incluye columna de comparación.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 14,5 GB solo de pesos, más caché KV.
- Caché KV estimada (32 capas, 8 cabezas KV, head_dim 128, fp16): ~128 KB por token, es decir ~1 GB a 8.000 tokens y ~4 GB a 32.768 tokens. Estimación derivada de la arquitectura del modelo base, no publicada en la model card.
- En cuantización de 8 bits: ~7,5 GB de pesos; en 4 bits: ~4 GB de pesos, más caché KV. No hay versiones cuantizadas publicadas en el repositorio.
- GPU recomendadas: A100 40/80 GB, H100 80 GB y similares para fp16 con contexto largo. En consumer, cabe una RTX 4090 o RTX 3090 de 24 GB en fp16 con contexto moderado, y de forma holgada en cuantizaciones de 8 y 4 bits.
- No cabe en GPUs de 8-12 GB en fp16; requeriría cuantización de 4 bits.
- Opciones de despliegue: al ser un `MistralForCausalLM` denso estándar, es compatible con vLLM, TGI, llama.cpp/GGUF (previa conversión propia), Ollama (previa conversión propia) y `transformers`.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint | 7,24 B (60 % retenido, rango deficiente) | No especificado (base: 32.768) | Ver tabla de benchmarks | Apache-2.0 | HF, safetensors |
| `mistralai/Mistral-7B-Instruct-v0.2` | 7,24 B densos | 32.768 tokens | No disponible en la informacion proporcionada | Apache-2.0 | HF, safetensors |
| `meta-llama/Llama-2-7b-chat-hf` | 6,74 B densos | 4.096 tokens | No disponible en la informacion proporcionada | Llama 2 Community License | HF, safetensors |

`meta-llama/Llama-2-7b-chat-hf` se incluye porque sus negativas greedy se usaron como objetivos de las 960 filas de seguridad durante la recuperación, no como alternativa funcional. No se dispone de datos de otros modelos comprimidos con Basis Sharing en la información proporcionada.

## Limitaciones y advertencias

- La compresión al 60 % degrada el comportamiento de negativa; es precisamente el fenómeno que la celda mide. La propia model card advierte de que los números de seguridad de un modelo degenerado no son evidencia sobre alineación.
- El modelo es de rango deficiente: cada peso mantiene rango ≤ k y los grupos siguen compartiendo una única base. No es un modelo más pequeño en disco (14,5 GB) ni más rápido por tamaño.
- Tasa de sobrerrespuesta elevada: 12,85 % en XSTest-safe y 27,33 % en OR-Bench-Hard-1K, con macro de 20,09 %. Puede rechazar peticiones legítimas.
- Riesgo de alucinación: no evaluado en la información disponible, pero plausiblemente superior al del modelo base por la pérdida de capacidad asociada a la compresión.
- Idiomas soportados y longitud de contexto no documentados en la model card; cualquier uso multilingüe queda sin garantía.
- Procedencia de los datos de recuperación: las 960 filas de negativa usan objetivos generados por otro modelo (Llama-2-7b-chat-hf), lo que introduce dependencia de la política de negativa de un tercero.
- Sesgos: no documentados ni medidos en la información proporcionada.
- Licencia Apache-2.0 en el repositorio, heredada del modelo base, lo que permite uso comercial; sin embargo, el propósito declarado es la investigación y el modelo no está validado para producción.
- Despliegue con plantilla de chat y decodificación greedy en las evaluaciones; otros ajustes de decodificación no han sido caracterizados.
- Cero descargas y cero likes en el momento de la consulta, sin pipeline declarado en HuggingFace.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Jeesup/svd-safety-mistral_7b_instruct_v02_up_basis_coeff_jbbsft_finetuned_keep_0p60
- Modelo base: https://huggingface.co/mistralai/Mistral-7B-Instruct-v0.2
- Código de Basis Sharing: https://github.com/TUDa-HWAI/Basis_Sharing (commit `1c021b6ce1d3`)
- Dataset de recuperación: https://huggingface.co/datasets/yahma/alpaca-cleaned
- Clasificador de evaluación de seguridad: https://huggingface.co/cais/HarmBench-Llama-2-13b-cls
- Juez de sobrerrespuesta: https://huggingface.co/allenai/wildguard
- Objetivos de negativa de referencia: https://huggingface.co/meta-llama/Llama-2-7b-chat-hf

Nota: la búsqueda web realizada no devolvió resultados relevantes sobre este modelo; los enlaces listados proceden de la información de HuggingFace y de la model card.
