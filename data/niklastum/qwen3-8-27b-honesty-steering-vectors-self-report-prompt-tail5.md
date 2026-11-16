# NiklasTUM/qwen3.8-27b-honesty-steering-vectors-self-report-prompt-tail5

## Resumen

Este repositorio no contiene un modelo de lenguaje completo, sino un conjunto de artefactos de *steering* (vectores de dirección, sesgos y distribuciones de activación) para el modelo Qwen/Qwen3.8-27B. Los artefactos han sido ajustados por el autor NiklasTUM sobre el contraste de honestidad `self_report`, con el objetivo de permitir la modulación de la conducta del modelo en tiempo de inferencia mediante *activation steering*.

El método empleado es una diferencia de medias de clase (*difference of means*) sobre las activaciones del *residual stream* en una posición concreta del prompt (`tail5`, el token de rol `assistant` cinco posiciones antes del final del prompt de chat), con el modo *thinking* desactivado. Se proporcionan artefactos para las 64 capas del decodificador, junto con estadísticas por capa y etiquetas de categoría de los escenarios utilizados.

La relevancia de este repositorio es metodológica: documenta un punto de operación recomendado (capa 33, coeficiente 32, umbral θ = 8.0142) y las comprobaciones de reproducibilidad asociadas, lo que permite a investigadores replicar y evaluar técnicas de *steering* sobre honestidad en modelos de la familia Qwen3.8.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Artefactos de *activation steering* (no es un modelo); modelo base Qwen/Qwen3.8-27B |
| Parametros totales | No disponible para el modelo base en la informacion proporcionada; los artefactos ocupan 0.1 GB |
| Parametros activos | No aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | `.pt` (tensores `torch.Tensor` float32), `.json` (metadatos y etiquetas) |

## Arquitectura y entrenamiento

El repositorio contiene artefactos derivados de un modelo transformer (Qwen3.8-27B) con 64 capas de decodificador y dimensión de *hidden state* de 5120. El ajuste se realizó sobre 50 escenarios de autoinforme (`self_report`), cada uno compuesto por una pregunta del usuario sobre la conducta pasada del asistente, con un *system prompt* honesto y otro deshonesto. Para cada escenario y lado se ejecuta el chat completo (system prompt + mensaje de usuario + generation prompt, plantilla de chat de Qwen con `enable_thinking=False`) sin generar, y se lee la salida de cada capa del decodificador en la posición `tail5`.

Por cada capa se calcula la dirección `v[l] = mean(honest[l]) − mean(dishonest[l])`, su versión normalizada `v̂`, las proyecciones `p = x · v̂`, las medias y desviaciones típicas por clase (`μ_pos`, `σ_pos`, `μ_neg`, `σ_neg`) y un umbral `θ[l] = (μ_pos + μ_neg) / 2`. En la capa 33 recomendada: θ = 8.0142, μ_pos = 11.2049 (σ 1.8080), μ_neg = 4.8235 (σ 2.3701), precisión de umbral 0.92 y separación de clases de 3.0 σ agrupadas. Los ficheros de embeddings se recalcularon el 2026-11-15 con el mismo código y revisión del modelo; la dirección recalculada tiene coseno 0.9997 con la publicada en la capa 33 (≥ 0.997 en todas las capas), y θ en la capa 33 resulta 7.83 en lugar de 8.01. El vector, el sesgo y las estadísticas por capa de los metadatos son los publicados y evaluados.

## Capacidades

- Modulación de la conducta de honestidad del modelo base Qwen3.8-27B mediante *activation steering* en tiempo de inferencia.
- *Steering* a proyección objetivo (StTP): para cada token con proyección `p = h · v̂` por debajo del umbral θ, se fija a un objetivo (`μ_pos + 32·σ_pos` = 69.0601) sin alterar la parte ortogonal de `h`.
- Variante StMP (*steer to mirrored projection*): disponible en el repositorio pero no ajustada para Qwen3.8 (el coeficiente no se ha barrido para este modelo).
- Aplicación en todos los tokens (prompt, generación y razonamiento) a la salida del bloque de decodificador 33.
- Artefactos por capa para las 64 capas del decodificador, con vector, sesgo y distribuciones de activación honestas y deshonestas.
- Metadatos con descripción del ajuste, estadísticas por capa, precisión de umbral, separación de clases, identificadores de escenario y comprobación de recálculo.
- No se documentan capacidades de generación, tool calling, agentes, visión, audio ni multilingüismo para estos artefactos, ya que no constituyen un modelo generativo por sí mismos.

## Casos de uso

- Investigación en interpretabilidad y control de conducta: aplicar el vector de la capa 33 con StTP durante la inferencia para estudiar cómo cambia la tasa de respuestas honestas en escenarios de autoinforme, usando el umbral y el objetivo documentados.
- Reproducción de experimentos de *steering*: el repositorio incluye el código de ajuste en la model card y los tensores necesarios para replicar el punto de operación (capa 33, coeficiente 32, θ = 8.0142, objetivo 69.0601).
- Evaluación comparativa de métodos de *steering*: la diferencia de medias de clase puede contrastarse con la regresión logística del repositorio análogo para Qwen3.6-27B, manteniendo el mismo esquema de ficheros.
- Auditoría de robustez de la dirección de honestidad: las comprobaciones de recálculo (`recompute_check`) y la deriva numérica bf16 documentada permiten evaluar la estabilidad del vector entre ejecuciones.
- Desarrollo de *steerers* personalizados: los ficheros de embeddings honestos y deshonestos por capa y escenario sirven como entradas para ajustar variantes StTP/StMP con otros coeficientes o capas.
- Docencia y divulgación técnica: el repositorio ejemplifica un flujo completo de *activation steering* con hooks de *transformers*, útil para demostrar cómo se lee el *residual stream* en una posición concreta del prompt.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Precision de umbral (capa 33) | 0.92 |
| Separacion de clases (capa 33) | 3.0 σ agrupadas |
| Coseno entre direccion publicada y recalculada (capa 33) | 0.9997 |
| Coseno minimo entre direcciones (todas las capas) | ≥ 0.997 |
| θ en capa 33 (publicado / recalculado) | 8.0142 / 7.83 |

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- Los artefactos ocupan 0.1 GB y se cargan en CPU con `torch.load(path, map_location="cpu")`; no requieren GPU por sí mismos.
- La inferencia requiere ejecutar el modelo base Qwen/Qwen3.8-27B (revision `1d4bf0f2ff6012fd82039f2fa52739d0dd7c60c0`) en `torch.bfloat16` con `device_map="auto"`; la VRAM necesaria depende del tamaño del modelo base y no se detalla en la informacion proporcionada.
- No se especifican GPU recomendadas, latencia ni throughput en la informacion disponible.
- El despliegue documentado es mediante `transformers` y un *forward hook* sobre los bloques del decodificador; no se documentan opciones con vLLM, llama.cpp, Ollama ni TGI.

## Comparativa con modelos similares

| Repositorio | Metodo | Modelo base | Capas | Punto de operacion | Licencia |
|---|---|---|---|---|---|
| NiklasTUM/qwen3.8-27b-honesty-steering-vectors-self-report-prompt-tail5 | Diferencia de medias de clase, activaciones de un solo token de prompt (`tail5`) | Qwen/Qwen3.8-27B | 64 | Capa 33, coef. 32, θ = 8.0142 | MIT |
| NiklasTUM/qwen3.6-27b-honesty-steering-vectors-self-report-experimental | Regresion logistica, medias de respuesta | Qwen3.6-27B | No disponible | No disponible | No disponible |

No se dispone de datos de benchmarks comparativos entre ambos repositorios en la informacion proporcionada.

## Limitaciones y advertencias

- Este repositorio no es un modelo autónomo: sin el modelo base Qwen/Qwen3.8-27B en la revisión indicada, los artefactos no son utilizables.
- El ajuste se realizó exclusivamente sobre el contraste `self_report` (50 escenarios); no hay evidencia de generalización a otros dominios de honestidad ni a otras tareas.
- El modo *thinking* está desactivado en el ajuste; no se documenta el comportamiento con razonamiento activado.
- La variante StMP no está ajustada para Qwen3.8: el coeficiente no se ha barrido y solo se usó `c = 5` para Granite-4.2-30B.
- Existe deriva numérica bf16 entre los embeddings recalculados y el vector publicado (θ de 7.83 frente a 8.0142 en la capa 33); deben usarse el vector, el sesgo y las estadísticas publicadas para reproducir las ejecuciones.
- No se documentan sesgos conocidos, tasas de alucinación, cobertura de idiomas ni latencia de inferencia.
- La licencia MIT se aplica a los artefactos del repositorio; el uso comercial del modelo base Qwen3.8-27B queda sujeto a su propia licencia, no detallada en la información proporcionada.
- El repositorio registra 0 descargas y 0 *likes* en el momento de la consulta, lo que indica ausencia de validación externa.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/NiklasTUM/qwen3.8-27b-honesty-steering-vectors-self-report-prompt-tail5
- Repositorio análogo para Qwen3.6-27B: https://huggingface.co/NiklasTUM/qwen3.6-27b-honesty-steering-vectors-self-report-experimental
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- No se han encontrado en la busqueda web papers, blogs, repositorios de código ni demos adicionales.
