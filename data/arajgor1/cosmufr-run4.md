# arajgor1/cosmufr-run4

## Resumen

CosmUFR Run 4 es un modelo de inferencia de parámetros cosmológicos desarrollado por Aaditya Rajgor. Está diseñado para mapear el espectro de potencia de la materia `log10 P(k)` en dos corrimientos al rojo (`z = 0` y `z = 0.47`) hacia ocho parámetros cosmológicos (Ω_m, σ₈, h, n_s, Ω_b, w₀, Σm_ν, w_a) en una sola pasada, sin simulador ni cadena. La arquitectura es una red feed-forward basada en energía, sin atención, con 136 millones de parámetros. El modelo fue entrenado con 84.5 millones de espectros de catorce suites, casi todos generados por emulador. Sin embargo, una auditoría de los pesos revela que la mayor parte de la red nunca recibió gradiente o convergió en salidas que ignoran la entrada; solo el 1.2% de los parámetros realiza el trabajo útil. Este modelo se publica como un estudio de caso de fallo silencioso en el entrenamiento y como un baseline determinista para la inferencia `P(k) → parámetros`, no para producir restricciones cosmológicas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red feed-forward basada en energía, sin atención |
| Parametros totales | 136.194.617 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo tabular, no de lenguaje) |
| Tipos de cuantizacion | No disponible (solo se menciona float32) |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | PyTorch (formato no especificado) |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura feed-forward basada en energía, sin mecanismos de atención. Su diseño original persigue un razonamiento gradual: el espectro de entrada se codifica en una "creencia" de 1024 dimensiones, que se refina a lo largo de dieciséis pasos de descenso sobre un score aprendido, y finalmente se leen los parámetros de la creencia asentada. El entrenamiento se realizó sobre 84.5 millones de espectros procedentes de catorce suites, casi todo salida de emulador. Se ejecutaron cuatro entrenamientos y cuatro variantes arquitectónicas, ocho en total.

La innovación técnica destacable es el mecanismo de "belief settling" con descenso en un score aprendido. No obstante, la auditoría del checkpoint revela un fallo crítico: un `detach()` en el bucle de settling impidió que el gradiente alcanzara el 24% de los parámetros (`obs_encoder`, `belief_proposal`, `settling`, `halo_head`), que conservan sus valores iniciales aleatorios. Otro 56% (las tres cabezas de energía, `gen_head`, `unc_head`) recibió gradiente pero convergió en salidas que ignoran la entrada, sobre un paisaje de energía casi plano (variación de una parte en siete millones). Solo el 1.2% de los parámetros (`param_head`) se entrenó correctamente y realiza todo el trabajo útil, leyendo una proyección aleatoria fija de la entrada.

## Capacidades

- Inferencia de ocho parámetros cosmológicos a partir de `log10 P(k)` en una sola pasada.
- No requiere simulador ni cadenas de Markov.
- Ejecución determinista: salidas bit-idénticas entre llamadas repetidas.
- Latencia medida de aproximadamente 300 ms por espectro en un núcleo de CPU.
- Capacidad nominal de refinamiento gradual mediante "belief settling" sobre un score aprendido, aunque esta capacidad no se materializa debido a los defectos de entrenamiento.
- Incluye salidas adicionales de varianzas y reconstrucción de `P(k)`, que son degeneradas y no aportan información útil.

## Casos de uso

- Investigación en inferencia basada en energía: el modelo sirve como ejemplo documentado de cómo un diseño iterativo puede fallar silenciosamente mientras la curva de pérdida parece saludable.
- Baseline determinista y reproducible: para comparar métodos de inferencia `P(k) → parámetros`, ofreciendo una referencia rápida con latencia de ~300 ms en CPU.
- Auditoría de checkpoints entrenados: el paquete `cosmufr.weight_audit` permite verificar en segundos qué componentes recibieron gradiente y cuáles no, siendo una herramienta didáctica para detectar fallos de entrenamiento.
- Enseñanza de cosmología computacional: permite demostrar el pipeline completo de inferencia de parámetros a partir del espectro de potencia, incluyendo el análisis de defectos de entrenamiento.
- Reproducibilidad numérica: útil para probar determinismo y estabilidad de resultados en entornos de investigación.
- Estudio de paisajes de energía: el modelo muestra cómo las cabezas de energía pueden converger en paisajes planos, un caso de estudio para investigar la dinámica de optimización en modelos basados en energía.

## Benchmarks y rendimiento

Se han publicado resultados medidos sobre la división de validación determinista, con 162.795 filas de 16 fuentes, usando el paquete de inferencia liberado. La siguiente tabla muestra el coeficiente de determinación R² y el error cuadrático medio (RMSE) para cada parámetro, tanto sobre toda la validación como restringido a las fuentes donde el parámetro varía.

| Parametro | R² (validación completa) | R² (donde varía) | RMSE |
|---|---|---|---|
| Ω_m | 0.717 | 0.720 | 0.0273 |
| σ₈ | 0.756 | 0.757 | 0.0285 |
| h | 0.501 | 0.498 | 0.0402 |
| w₀ | 0.586 | 0.614 | 0.0254 |
| Ω_b | 0.364 | 0.363 | 0.0045 |
| n_s | 0.338 | 0.339 | 0.0214 |
| w_a | 0.165 | 0.185 | 0.0616 |
| Σm_ν | 0.407 | 0.011 | 0.0993 |

No se han publicado benchmarks comparativos con otros modelos de inferencia cosmológica en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible; al ser un modelo de 136 millones de parámetros en float32, el peso ocupa aproximadamente 544 MB y puede ejecutarse en CPU.
- GPU recomendadas: no se requiere GPU; el modelo corre en CPU con una latencia medida de ~300 ms por espectro en un núcleo.
- Compatibilidad con GPU de consumo: sí, cualquier GPU con más de 1 GB de VRAM puede ejecutarlo, aunque no aporta ventaja frente a CPU.
- Opciones de despliegue: inferencia directa en PyTorch; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, al no ser un modelo de lenguaje.
- Latencia y throughput: ~300 ms por espectro en un núcleo de CPU, medido; determinismo bit-idéntico entre llamadas.

## Comparativa con modelos similares

No disponible. No se han publicado comparativas con otros modelos de inferencia de parámetros cosmológicos a partir del espectro de potencia en la información proporcionada.

## Limitaciones y advertencias

- El 24% de los parámetros nunca recibió gradiente durante el entrenamiento y conserva valores aleatorios iniciales.
- El 56% de los parámetros se entrenó pero convergió en salidas que ignoran la entrada, sobre un paisaje de energía casi plano.
- Solo el 1.2% de los parámetros realiza trabajo útil, lo que limita severamente la capacidad real del modelo.
- El modelo no restringe la masa de neutrinos: el R² donde varía es 0.011, lo que indica que no hay recuperación de información.
- Las salidas de varianza y reconstrucción de `P(k)` son degeneradas y no deben utilizarse.
- El modelo no está pensado para producir restricciones cosmológicas; los resultados son de cuatro a ocho veces peores que los de un survey publicado.
- La entrada no es un observable directo y no se proporciona incertidumbre.
- Las cifras publicadas anteriormente (Ω_m 0.907, σ₈ 0.911, h 0.604) están superadas y no deben citarse.
- El uso previsto se limita a investigación y enseñanza, no a aplicaciones en producción científica.

## Enlaces

- HuggingFace: https://huggingface.co/arajgor1/cosmufr-run4
- GitHub: https://github.com/arajgor1/cosmufr-run4
