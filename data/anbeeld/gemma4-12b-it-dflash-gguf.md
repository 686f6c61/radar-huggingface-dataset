# Anbeeld/gemma4-12B-it-DFlash-GGUF

## Resumen

`Anbeeld/gemma4-12B-it-DFlash-GGUF` es un conjunto de cuantizaciones GGUF del modelo borrador (*draft model*) DFlash de z-lab, diseñado para acelerar la inferencia de Gemma 4 12B IT mediante decodificación especulativa. No es un modelo generativo autónomo: es un componente auxiliar que propone bloques de tokens que el modelo objetivo (Gemma 4 12B IT) verifica en paralelo. El autor de esta conversión es Anbeeld y el checkpoint original pertenece a z-lab.

La innovación central es DFlash, un método de decodificación especulativa basado en un modelo de difusión por bloques (*block diffusion*) que genera múltiples tokens de forma paralela en lugar de secuencialmente. El borrador está entrenado con un tamaño de bloque de 16, lo que condiciona la configuración de `--spec-draft-n-max 16` en el servidor de inferencia. El resultado es una reducción de la latencia de decodificación sin alterar la distribución de salida del modelo objetivo, ya que cada propuesta se verifica de forma exacta.

Este repositorio es relevante porque empaqueta el borrador en siete niveles de cuantización (de BF16 a Q2_K) generados desde una conversión BF16 del checkpoint original, facilitando su despliegue en hardware con recursos limitados. Los pesos declarados en safetensors suman 727.496.960 parámetros, muy por debajo de los 12B del modelo objetivo, coherente con la función de borrador ligero. Requiere obligatoriamente BeeLlama.cpp, un fork de llama.cpp con soporte para `draft-dflash`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusión por bloques (block diffusion) para decodificación especulativa; familia Gemma 4 |
| Parametros totales | 727.496.960 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16, Q8_0, Q6_K, Q5_K_M, Q4_K_M, Q3_K_M, Q2_K |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (safetensors para el checkpoint base) |

## Arquitectura y entrenamiento

DFlash emplea un modelo de difusión por bloques como borrador ligero: en lugar de predecir un único token por paso, propone un bloque completo de tokens de forma paralela, que el modelo objetivo verifica después de manera exacta. El borrador está entrenado con un tamaño de bloque de 16, y la model card indica explícitamente que debe usarse con `--spec-draft-n-max 16`. La arquitectura se etiqueta como `diffusion-language-model` y se apoya en la familia Gemma 4, pero no se detalla en la información disponible la composición interna de capas, el número de tokens de entrenamiento ni la composición del dataset.

No se especifica si el entrenamiento incluyó RLHF, DPO u otras fases de alineación. El checkpoint original de z-lab no incluye model card, y las instrucciones de uso publicadas corresponden únicamente a estas cuantizaciones GGUF en BeeLlama.cpp. Las cuantizaciones se generaron directamente desde una conversión BF16 del checkpoint original mediante BeeLlama.cpp, sin datos publicados sobre pérdida de calidad por nivel de cuantización.

## Capacidades

- Generación de propuestas de tokens en paralelo para decodificación especulativa (bloques de 16 tokens).
- Aceleración de la inferencia del modelo objetivo Gemma 4 12B IT sin modificar la distribución de salida verificada.
- Integración con el servidor compatible con OpenAI de BeeLlama.cpp (`llama-server`) y con `--flash-attn on`.
- Funciona como borrador subordinado: no genera respuestas de forma autónoma ni puede usarse sin el modelo objetivo.
- Siete niveles de cuantización para ajustar el equilibrio entre memoria y velocidad del borrador.
- No se documentan capacidades de tool calling, agentes, visión, audio ni modo de razonamiento para este componente.

## Casos de uso

- Servicio de chat de baja latencia: desplegar Gemma 4 12B IT con el borrador Q8_0 en `llama-server` para reducir el tiempo por token en conversaciones multi-turno, manteniendo la calidad del modelo objetivo gracias a la verificación exacta de las propuestas.
- Generación de código interactiva: usar `temperature=0.0` con el borrador para completar funciones y fragmentos en editores o asistentes, donde la latencia de decodificación es crítica y el bloque de 16 tokens encaja con la longitud típica de las completaciones.
- Despliegue en GPU de gama alta con margen de memoria: combinar el objetivo en BF16 o Q8_0 con el borrador Q8_0 para maximizar la tasa de aceptación y el throughput en entornos de producción con A100 o H100.
- Inferencia en estaciones de trabajo con VRAM limitada: emplear el borrador Q4_K_M o Q3_K_M junto a una cuantización agresiva del objetivo para mantener la aceleración especulativa cuando no hay espacio para el borrador en BF16.
- Evaluación comparativa de métodos de decodificación especulativa: medir la tasa de aceptación y la latencia frente a otros borradores (EAGLE, Medusa) sobre el mismo objetivo Gemma 4 12B IT, usando los distintos niveles de cuantización como variable controlada.
- Procesamiento por lotes con requisitos de latencia moderada: servir peticiones concurrentes a través de la API compatible con OpenAI de BeeLlama.cpp, donde el borrador reduce el coste por token sin necesidad de cambiar el modelo objetivo ni el prompt.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se publican resultados para estas cuantizaciones GGUF y que los resultados de otros borradores DFlash no son mediciones de este checkpoint.

## Requisitos de hardware

- El borrador tiene 727.496.960 parámetros; en BF16 ocupa aproximadamente 1,5 GB solo en pesos, y en Q8_0 alrededor de 0,8 GB, sin contar overhead de contexto y caché KV.
- VRAM total necesaria = pesos del objetivo Gemma 4 12B IT (cuantizado) + pesos del borrador + caché KV del objetivo + buffers de verificación especulativa.
- GPU recomendadas: A100 40/80 GB, H100 80 GB para el objetivo en BF16 o Q8_0 con borrador Q8_0; RTX 4090 24 GB para combinaciones objetivo Q4_K_M/Q5_K_M con borrador Q4_K_M o Q5_K_M.
- Cabe en GPU de consumo si el objetivo se cuantiza de forma agresiva (Q4_K_M o inferior) y se reserva espacio para el borrador y la caché KV; no se dispone de cifras medidas de VRAM total.
- Opciones de despliegue: exclusivamente BeeLlama.cpp (`llama-server` con `--spec-type draft-dflash`, `--spec-draft-model`, `--spec-draft-n-max 16` y `--flash-attn on`). No se documenta compatibilidad con vLLM, TGI, Ollama ni llama.cpp upstream.
- Latencia y throughput: no disponibles; dependen de la tasa de aceptación del borrador, del hardware y de la cuantización del objetivo.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Anbeeld/gemma4-12B-it-DFlash-GGUF | Borrador de difusión por bloques (GGUF) | 727.496.960 | no disponible | no disponible | Hugging Face, requiere BeeLlama.cpp |
| z-lab/gemma4-12B-it-DFlash | Borrador de difusión por bloques (checkpoint original) | no disponible | no disponible | no disponible | Hugging Face |
| google/gemma-4-12b-it | Modelo objetivo generativo | 12B (según denominación) | no disponible | no disponible | Hugging Face |

No se dispone de datos de rendimiento ni de otros borradores comparables (EAGLE, Medusa) en la información proporcionada, por lo que la comparación cuantitativa no está disponible.

## Limitaciones y advertencias

- No es un modelo autónomo: sin el objetivo Gemma 4 12B IT no produce respuestas útiles; la model card lo advierte de forma explícita.
- Dependencia de BeeLlama.cpp: el alias `dflash` fue eliminado y debe usarse `--spec-type draft-dflash`; otros runners (vLLM, TGI, Ollama, llama.cpp upstream) no están documentados como compatibles.
- El bloque de entrenamiento es de 16 tokens; configurar `--spec-draft-n-max` con otro valor puede degradar la tasa de aceptación.
- Licencia no disponible: no puede confirmarse el uso comercial ni las obligaciones de atribución; debe verificarse en el repositorio del checkpoint original de z-lab y en la licencia de Gemma 4.
- Idiomas soportados no documentados; el comportamiento multilingüe depende del modelo objetivo, no del borrador.
- Riesgo de alucinación heredado del modelo objetivo; la verificación especulativa garantiza equivalencia distribucional con el objetivo, no corrección factual.
- Sin benchmarks publicados para estas cuantizaciones: no hay evidencia medida de la tasa de aceptación ni de la pérdida de velocidad en Q2_K o Q3_K_M.
- El checkpoint original de z-lab carece de model card, lo que limita la trazabilidad de los datos de entrenamiento y de posibles sesgos.
- El repositorio tiene un tamaño de 6,0 GB y 738 descargas en el momento de la consulta, con adopción todavía limitada.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Anbeeld/gemma4-12B-it-DFlash-GGUF
- Checkpoint original: https://huggingface.co/z-lab/gemma4-12B-it-DFlash
- Modelo objetivo: https://huggingface.co/google/gemma-4-12b-it
- Paper: https://arxiv.org/abs/2602.06036
- Repositorio GitHub de DFlash: https://github.com/z-lab/dflash
- Blog del proyecto: https://z-lab.ai/projects/dflash/
- Fork BeeLlama.cpp: https://github.com/Anbeeld/beellama.cpp
- Formulario de feedback de DFlash: https://forms.gle/4YNwfqb4nJdqn6hq9
