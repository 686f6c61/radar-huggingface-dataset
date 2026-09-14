# Jeesup/svd-safety-l2_basis_remove40_swapdiscnet_b010_r02

## Resumen

`Jeesup/svd-safety-l2_basis_remove40_swapdiscnet_b010_r02` es un checkpoint de investigación derivado de `meta-llama/Llama-2-7b-chat-hf`, comprimido mediante Basis Sharing (ICLR 2025, bases compartidas entre grupos de 2 capas adyacentes) hasta el 60,0 % de los parámetros densos, y posteriormente editado con 2 de las 10 rondas previstas de un procedimiento iterativo de intercambio de parámetros neutro en parámetros («parameter-neutral swap») guiado por la regla de selección `swapdiscnet_iter`. El presupuesto de restauración es del 1,0 % de los parámetros densos, con 924 componentes restaurados y 924 componentes expulsados, y una fracción de parámetros resultante de 0,5999.

El artefacto pertenece a un estudio sobre cómo la compresión por SVD degrada el comportamiento de seguridad de un modelo alineado y qué regla de selección de componentes repara mejor ese daño. No es un modelo conversacional de propósito general: el propio autor lo describe como una celda de una rejilla experimental sobre reglas de selección y presupuestos, y advierte de que varias ramas de la rejilla están deliberadamente degradadas en seguridad respecto a Llama-2-7b-chat.

Su relevancia es metodológica: ofrece un punto de medida reproducible (semilla 42, LoRA r=8 sobre coeficientes, `alpaca-cleaned`) para estudiar el compromiso seguridad/utilidad en modelos comprimidos, con métricas publicadas de tasa de éxito de ataque (ASR) en AdvBench y StrongREJECT y de sobre-rechazo macro. El repositorio ocupa 13,5 GB en formato safetensors y declara 6.738.415.616 parámetros, la misma cifra que el Llama-2-7b denso, por lo que el almacenamiento conserva bases y coeficientes aunque la fracción efectiva declarada sea 0,5999.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama-2), con bases SVD compartidas entre grupos de 2 capas adyacentes y coeficientes por capa; adaptadores LoRA r=8 sobre los coeficientes |
| Parámetros totales | 6.738.415.616 (según safetensors); fracción de parámetros resultante declarada por el autor: 0,5999 del denso |
| Parámetros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no declarada en la tarjeta del modelo; el modelo base Llama-2-7b-chat soporta 4.096 tokens |
| Tipos de cuantización | no disponible (no se publican pesos cuantizados; repositorio solo en safetensors) |
| Idiomas soportados | no disponible |
| Licencia | Llama 2 Community License (se incluyen `LICENSE.txt` y `USE_POLICY.md` en el repositorio) |
| Formato de pesos | safetensors (librería `transformers`); repo de 13,5 GB |

## Arquitectura y entrenamiento

La base es un transformer decoder-only Llama-2 de 7B. Sobre ella se aplica compresión por descomposición en valores singulares con «Basis Sharing» (ICLR 2025): en lugar de una base SVD independiente por capa, se comparten bases entre grupos de 2 capas adyacentes, lo que elimina el 40,00 % de los parámetros densos y deja el modelo en 0,5999 de la fracción original. Sobre esa estructura comprimida se aplica una fase de edición iterativa: en cada ronda se seleccionan componentes con la regla `swapdiscnet_iter` y se intercambian por otros (924 restaurados frente a 924 expulsados), con un valor de intercambio `net` (valor de inserción más valor de expulsión de la evicción ordenada por sigma). El presupuesto total declarado del experimento completo es del 1,0 % de los parámetros densos, repartido en 10 rondas de 0,100 % cada una; este checkpoint corresponde a la ronda 2 de 10, con 12.948.736 parámetros intercambiados (0,20 % de los parámetros densos de proyección) y 1,000 % del presupuesto de restauración.

Tras la compresión y la edición, se aplica una recuperación con LoRA de rango 8 restringida a los coeficientes por capa (bases congeladas, presupuesto de parámetros sin cambios), durante 2 épocas, con learning rate 0,0001, batch de 64 y el dataset `alpaca-cleaned`. La semilla es 42. El autor no documenta en la tarjeta el número de tokens de preentrenamiento propios, la composición completa del dataset más allá de `alpaca-cleaned`, ni si hubo RLHF o DPO adicionales; esos datos figuran como no disponibles. La innovación técnica destacable es doble: el esquema de bases compartidas para reducir parámetros y la regla de selección de componentes `swapdiscnet_iter` con criterio de intercambio neutro en parámetros, orientada a reparar comportamiento de seguridad sin aumentar el tamaño del modelo.

## Capacidades

- Generación de texto conversacional heredada de Llama-2-7b-chat, sujeta a la degradación introducida por la compresión y a la edición parcial (2 de 10 rondas).
- Comportamiento de rechazo ante peticiones dañinas, medido explícitamente: ASR de 0,0462 en AdvBench y 0,0511 en StrongREJECT, ambos con juez HarmBench.
- Control de sobre-rechazo medible: 0,3144 de sobre-rechazo macro según WildGuard, es decir, rechaza aproximadamente un tercio de peticiones benignas en el conjunto evaluado.
- Ejecución como modelo de `text-generation` en `transformers`, con etiquetas de compatibilidad con Text Generation Inference (TGI) y `endpoints_compatible`.
- Servir como sujeto experimental para estudiar el compromiso seguridad/utilidad bajo compresión SVD.
- No hay evidencia declarada de soporte de tool calling, function calling, uso agéntico, visión, audio, ni modo de razonamiento explícito (thinking). Estas capacidades figuran como no disponibles.
- Capacidades multilingües: no disponibles; la tarjeta no declara idiomas soportados.

## Casos de uso

- Estudio de robustez de seguridad bajo compresión: comparar la ASR de este checkpoint (0,0462 en AdvBench) con la de otras celdas de la rejilla para cuantificar cuánta seguridad destruye el 40 % de compresión y cuánta recupera el intercambio de componentes.
- Investigación en interpretabilidad de componentes: localizar qué subespacios SVD y qué coeficientes concentran el comportamiento de rechazo, aprovechando que el experimento registra qué 924 componentes se restauraron y qué 924 se expulsaron.
- Comparación de reglas de selección de componentes: usar `swapdiscnet_iter` como referencia frente a otras reglas del grid bajo el mismo presupuesto (0,100 % por ronda, 1,0 % total) y la misma semilla (42).
- Calibración de jueces de seguridad: emplear el modelo como sujeto de pruebas para validar la sensibilidad de HarmBench y WildGuard frente a modelos parcialmente reparados con ASR en torno al 5 %.
- Investigación sobre sobre-rechazo: con 0,3144 de sobre-rechazo macro, es un caso útil para estudiar el coste en utilidad de las intervenciones de seguridad y para diseñar conjuntos benignos de contraste.
- Reproducibilidad metodológica: replicar el pipeline completo (Basis Sharing + 10 rondas de swap + LoRA r=8 sobre coeficientes con `alpaca-cleaned`, 2 épocas, lr 1e-4, batch 64) y comprobar la variabilidad entre rondas intermedias.
- Docencia y formación técnica: ilustrar en un curso de compresión de modelos cómo una edición de menos del 0,2 % de los parámetros de proyección altera métricas de seguridad medibles.
- Auditoría de licencias y cumplimiento: caso práctico de derivado de Llama 2 para revisar obligaciones de la Llama 2 Community License y del `USE_POLICY.md` antes de cualquier uso interno.
- No se recomienda su uso en atención al cliente, asistentes desplegables ni generación de código en producción: el autor indica explícitamente que no es un asistente desplegable.

## Benchmarks y rendimiento

| Métrica | Valor | Juez / conjunto |
|---|---|---|
| AdvBench ASR | 0,0462 | HarmBench judge |
| StrongREJECT ASR | 0,0511 | HarmBench judge |
| Sobre-rechazo macro | 0,3144 | WildGuard |

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks de capacidad general, ni cifras comparativas del propio Llama-2-7b-chat bajo los mismos jueces y conjuntos de prompts. Por tanto, los valores anteriores solo son interpretables dentro del estudio de origen y no admiten comparación directa con modelos de terceros.

## Requisitos de hardware

- Pesos en fp16: aproximadamente 13,5 GB (coincide con el tamaño del repositorio). Con caché KV y activaciones, una GPU de 24 GB (RTX 3090, RTX 4090, A10G, L4 con margen) permite inferencia a contexto moderado.
- Cabe en GPU de consumo: sí, en el rango de 16-24 GB para fp16 con contexto limitado. Para 12 GB o menos haría falta cuantización propia (int8, ~6,8 GB; 4 bits, ~3,5-4 GB), que no se distribuye en el repositorio.
- GPU recomendadas para evaluación por lotes o servicio: A100 40/80 GB, H100, L40S; para una sola petición, RTX 4090 o RTX 3090 son suficientes.
- Opciones de despliegue: `transformers` (formato nativo del repositorio) y Text Generation Inference, ya que la tarjeta incluye la etiqueta `text-generation-inference` y `endpoints_compatible`. vLLM es plausible por ser arquitectura Llama, pero no está confirmado en la información disponible. llama.cpp y Ollama requerirían una conversión a GGUF propia que el autor no publica.
- Latencia y throughput estimados: no disponibles. No se han publicado mediciones de tokens por segundo, TTFT ni consumo de memoria en la tarjeta del modelo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Este checkpoint (`svd-safety-l2_..._b010_r02`) | 6.738.415.616 en safetensors; fracción efectiva 0,5999 | No declarado (base: 4.096) | Llama 2 Community License | HuggingFace, safetensors | Artefacto de investigación con 2 de 10 rondas de recuperación aplicadas; ASR 0,0462 en AdvBench |
| `meta-llama/Llama-2-7b-chat-hf` | 6.738.415.616 | 4.096 | Llama 2 Community License | HuggingFace, safetensors | Modelo base sin comprimir; no hay métricas de seguridad publicadas en la información disponible bajo los mismos jueces |
| Otros checkpoints de la misma rejilla (otras reglas y presupuestos) | No disponible | No disponible | Llama 2 Community License | Referenciados por el autor, no listados | La tarjeta indica que existen varias ramas, algunas deliberadamente degradadas en seguridad |
| Asistentes densos de tamaño similar (por ejemplo, Llama-3.1-8B-Instruct o Mistral-7B-Instruct) | No aplica a este estudio | No aplica | Licencias distintas (Llama 3.1 Community, Apache 2.0) | HuggingFace | No comparables: no se dispone de evaluaciones homogéneas con HarmBench/WildGuard en la información proporcionada |

No se dispone de cifras de rendimiento equivalentes para el modelo base ni para versiones comprimidas sin reparación, por lo que la comparativa cuantitativa de seguridad dentro de la familia queda como no disponible.

## Limitaciones y advertencias

- No es un modelo de propósito general ni un asistente desplegable; el propio autor lo califica de sujeto experimental y recomienda evaluarlo antes de extraer conclusiones.
- Varias celdas de la rejilla de la que forma parte están deliberadamente degradadas en seguridad respecto a Llama-2-7b-chat; la compresión por sí sola eleva la tasa de éxito de ataque.
- Este checkpoint concreto solo ha recibido 2 de las 10 rondas de recuperación previstas, por lo que su estado es intermedio y no representa el resultado final del método.
- Sobre-rechazo elevado: 0,3144 macro según WildGuard, lo que implica rechazar peticiones benignas en aproximadamente un tercio de los casos evaluados.
- Riesgo de alucinación: no se documenta ninguna evaluación de fidelidad factual ni de tasas de alucinación; al ser un modelo comprimido y parcialmente editado, la degradación de capacidades generales no está cuantificada.
- Idiomas soportados no declarados; la evidencia disponible se limita a evaluaciones en inglés con jueces concretos.
- Contexto no declarado en la tarjeta; se hereda el del modelo base, 4.096 tokens, insuficiente para casos de contexto largo.
- Riesgo de falso sentido de seguridad: los valores de ASR publicados dependen del juez (HarmBench) y del conjunto de prompts, y no deben extrapolarse a despliegues reales.
- Licencia: Llama 2 Community License, con `LICENSE.txt` y `USE_POLICY.md` incluidos en el repositorio y de obligado cumplimiento para este derivado. Existen restricciones de uso comercial y de finalidad propias de esa licencia; hay que revisarlas antes de cualquier explotación.
- Sin cuantizaciones publicadas: para desplegarlo en hardware limitado hay que generar los pesos cuantizados por cuenta propia, con el consiguiente riesgo de degradar aún más el comportamiento de seguridad y de capacidad.
- Sin métricas de capacidades generales (MMLU, HumanEval, GSM8K) que permitan estimar la pérdida de utilidad frente al modelo denso.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Jeesup/svd-safety-l2_basis_remove40_swapdiscnet_b010_r02
- Modelo base: https://huggingface.co/meta-llama/Llama-2-7b-chat-hf
- Licencia Llama 2 (`LICENSE.txt` y `USE_POLICY.md`): incluidos en el repositorio del modelo
- Paper de Basis Sharing (ICLR 2025): referencia citada en la tarjeta, enlace no disponible en la información proporcionada
- Repositorio de código del método de compresión o del grid experimental: no disponible en la información proporcionada
- Demos o espacios asociados: no disponibles
- Resultados de la búsqueda web: no contienen enlaces relevantes para este modelo; los resultados obtenidos tratan sobre herramientas de programación asistida, administración de cuentas en Windows 11 y reasignación de teclas, sin relación con el artefacto descrito
