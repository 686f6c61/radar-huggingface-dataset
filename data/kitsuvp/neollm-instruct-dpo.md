# KitsuVp/NeoLLM-Instruct-DPO

## Resumen

NeoLLM-Instruct-DPO es un checkpoint experimental de ajuste por preferencias (DPO) sobre NeoLLM-Instruct, un modelo de lenguaje causal de arquitectura transformer con 85.156.600 parámetros totales (aproximadamente 85,2 M). Lo desarrolla KitsuVp como parte de una línea de investigación sobre modelos pequeños con técnicas de entrenamiento poco convencionales. El modelo parte de NeoLLM-Instruct, que a su vez deriva del modelo preentrenado NeoLLM, y aplica un ajuste DPO sigmoide sobre un subconjunto acotado de pares de preferencia en inglés y español.

El objetivo declarado es explorar si el ajuste por preferencias mejora la calidad de las respuestas en un modelo de escala muy reducida. Según la model card, el resultado es mixto: en el conjunto de validación en español el margen relativo de preferencia positivo alcanzó el 84,4%, mientras que en inglés se quedó en el 46,9%, prácticamente indistinguible de una línea base aleatoria. En una prueba de generación con 20 prompts restringidos, el modelo no acertó ninguna respuesta exacta.

Es relevante ahora como caso de estudio metodológico: documenta con detalle la procedencia de los pesos (hashes SHA-256), la configuración del entrenamiento y las métricas de validación, algo poco habitual en modelos de este tamaño. No obstante, sus propios autores lo etiquetan como investigación y advierten de que las respuestas suelen contener texto sobrante o contenido incorrecto. No es un modelo apto para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer causal (causal-lm), código personalizado con `trust_remote_code=True` |
| Parámetros totales | 85.156.600 (85,2 M) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | Ventana de despliegue de 512 tokens con stride 256 (ventanas rodantes); longitud de contexto nativa no disponible |
| Tipos de cuantización | No disponible (la model card solo indica carga en BF16 para inferencia) |
| Idiomas soportados | Inglés (en) y español (es) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers, PyTorch) |

## Arquitectura y entrenamiento

El modelo es un transformer causal de 85,2 M de parámetros con código propio (`custom_code`), lo que obliga a cargarlo con `trust_remote_code=True`. Hereda de NeoLLM-Instruct un conjunto de técnicas de entrenamiento poco habituales que la model card menciona por sus siglas: Copy-Paste, MiLe, μ-loss, NITP, TWEO y MEAP, aplicadas sobre vistas de entrenamiento limpias y enmascaradas descritas en la ficha del modelo SFT. El ajuste DPO mantiene esas técnicas activas y añade un objetivo supervisado auxiliar sobre la completación preferida con peso 0,1. Los pesos maestros se conservan en FP32, se entrenaron con autocast BF16 y AdamW fusionado, y el modelo puede cargarse en BF16 para inferencia.

El entrenamiento DPO usó 400 pares de preferencia offline extraídos de un pool preparado de 8.844, con 196 prompts en inglés y 204 en español. La composición fue de 179 pares de UltraFeedback (argilla/ultrafeedback-binarized-preferences-cleaned), 186 del split en español de multilingual Orca DPO y 35 pares sintéticos bilingües curados para corregir eco de prompt, repetición, formato y copia solicitada. Se empleó DPO sigmoide con beta 0,1, learning rate 5e-7 y un par por paso de optimizador, sumando log-probabilidades de los tokens de respuesta hasta EOS. Los ejemplos largos se procesan mediante ventanas rodantes de longitud 512 y stride 256, lo que limita su contexto izquierdo. Se probó una única configuración de hiperparámetros. El entorno de prueba fue Transformers 5.19.0, PyTorch 2.14.0+cu132 y una RTX 5070 Ti bajo WSL.

## Capacidades

- Generación de texto conversacional en inglés y español, con plantilla de chat heredada del modelo SFT.
- Ajuste por preferencias orientado a reducir eco de prompt, repeticiones y problemas de formato, gracias a los 35 pares sintéticos específicos.
- Copia solicitada de fragmentos de texto (función "Copy-Paste"), que puede desactivarse como ablación en inferencia.
- Generación autorregresiva con parada en EOS: en la prueba de 20 prompts generó EOS en 17 casos, frente a 18 del modelo SFT de referencia.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo de pensamiento explícito.
- Capacidad multilingüe limitada a los dos idiomas declarados, sin datos de cobertura más allá de inglés y español.

## Casos de uso

- Investigación sobre DPO en modelos de escala reducida: el checkpoint sirve como punto de comparación reproducible frente a su base SFT, con hashes de pesos y métricas de validación documentados para replicar el experimento.
- Estudio de dinámicas de preferencia bilingües: la diferencia entre el margen del 84,4% en español y el 46,9% en inglés permite analizar cómo influye la composición del dataset de preferencias en cada idioma.
- Experimentos de ablación de componentes: la posibilidad de desactivar Copy-Paste en inferencia facilita medir su contribución a la tasa de EOS y a la calidad de las respuestas.
- Docencia y formación en ajuste por preferencias: el modelo es lo bastante pequeño (0,7 GB de repo) para ejecutarse en un portátil con GPU consumer y demostrar el flujo completo de DPO con datos reales.
- Pruebas de infraestructura de inferencia: útil para validar pipelines con `trust_remote_code=True`, carga en BF16 y gestión de ventanas rodantes antes de escalar a modelos mayores.
- Generación de texto controlada en entornos de laboratorio: con prompts muy acotados y validación humana, puede emplearse para explorar el comportamiento de un modelo de 85 M tras preferencia, siempre sin expectativas de exactitud.

## Benchmarks y rendimiento

La model card no publica resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros). Los únicos datos de evaluación son métricas internas de validación DPO y una prueba de generación restringida:

| Métrica de validación | Inglés | Español |
|---|---:|---:|
| Pares held-out | 32 | 32 |
| Margen positivo relativo a la referencia (empates cuentan medio) | 46,9% | 84,4% |
| Pérdida DPO | 0,6980 | 0,5349 |
| Pérdida DPO con referencia congelada | 0,6931 | 0,6931 |
| Cross-entropy de tokens elegidos, SFT → DPO | 2,5995 → 2,6001 | 3,6593 → 3,6903 |

| Prueba de generación (20 prompts, greedy) | NeoLLM-Instruct-DPO | Referencia SFT |
|---|---:|---:|
| Generaciones con EOS | 17 | 18 |
| Coincidencias exactas | 0 | 0 |
| EOS con Copy-Paste desactivado (ablación DPO) | 14 | No disponible |

No se han publicado resultados de benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 85,2 M de parámetros, en BF16 el peso ocupa aproximadamente 170 MB; en FP32, unos 340 MB. La VRAM adicional depende de la caché KV, pero con ventanas de 512 tokens es marginal. En la práctica, el modelo cabe en cualquier GPU con más de 1 GB de VRAM libre.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente. El autor lo probó en una RTX 5070 Ti bajo WSL. También debería funcionar en RTX 3060, RTX 4060, RTX 4090 y GPUs de datacenter como A100 o H100, aunque estas últimas están sobredimensionadas para este tamaño.
- Cabe en GPU consumer: sí, en prácticamente todas las GPU dedicadas de los últimos años, e incluso en CPU para inferencia puntual.
- Opciones de despliegue: transformers con `trust_remote_code=True` es la vía documentada. No se confirma compatibilidad con vLLM, llama.cpp, Ollama ni TGI, y el uso de código personalizado complica la conversión a GGUF.
- Latencia y throughput estimados: no disponibles. No se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Idiomas | Notas |
|---|---|---|---|---|---|
| NeoLLM-Instruct-DPO | 85,2 M | Ventana de 512 con stride 256 | Apache 2.0 | en, es | Checkpoint experimental de investigación; 0 descargas |
| NeoLLM-Instruct (base SFT) | 85,2 M (misma familia) | No disponible | Apache 2.0 (según modelo base) | en, es | Punto de partida del DPO; 18 EOS en la prueba de 20 prompts |
| Modelos de ~100 M de la familia GPT-2/Pythia | ~70-160 M | 1024-2048 típicamente | Varía (MIT, Apache 2.0) | Principalmente en | Referencia habitual para modelos pequeños; sin ajuste DPO documentado |
| Modelos instruct pequeños tipo SmolLM-135M | 135 M | 2048 | Apache 2.0 | Multilingüe | Alternativa más madura y con benchmarks publicados |

La comparación con alternativas comerciales o de mayor tamaño no es significativa por la diferencia de escala. Frente a otros modelos de ~100 M, la ventaja de NeoLLM-Instruct-DPO es la documentación exhaustiva del proceso DPO y la reproducibilidad mediante hashes; la desventaja es la ausencia de benchmarks estándar y su carácter experimental.

## Limitaciones y advertencias

- El propio autor califica el checkpoint como experimental y destinado a investigación; no debe usarse en producción.
- En la prueba de generación con 20 prompts restringidos no acertó ninguna respuesta exacta y las respuestas suelen contener texto adicional o contenido incorrecto.
- El margen de preferencia en inglés (46,9%) es prácticamente equivalente al azar, lo que indica que el ajuste DPO no mejoró la preferencia en ese idioma.
- Los conjuntos de validación son muy pequeños (32 pares por idioma) y usan datasets de preferencia distintos por idioma, lo que limita las comparaciones cruzadas entre inglés y español.
- La cross-entropy de los tokens elegidos empeoró ligeramente tras el DPO en ambos idiomas (2,5995 → 2,6001 en inglés; 3,6593 → 3,6903 en español), señal de que la preferencia relativa y la verosimilitud absoluta pueden divergir.
- El contexto efectivo está limitado por ventanas rodantes de 512 tokens con stride 256, insuficiente para tareas que requieran contexto largo.
- Riesgo de alucinación y de repetición inherente a un modelo de 85 M; los sesgos concretos no están documentados.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código del autor; conviene auditar el código antes de desplegarlo.
- La licencia Apache 2.0 permite uso comercial, pero las limitaciones técnicas hacen desaconsejable ese uso en la práctica.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/KitsuVp/NeoLLM-Instruct-DPO
- Modelo base SFT: https://huggingface.co/KitsuVp/NeoLLM-Instruct
- Modelo preentrenado original: https://huggingface.co/KitsuVp/NeoLLM
- Dataset UltraFeedback binarizado: https://huggingface.co/datasets/argilla/ultrafeedback-binarized-preferences-cleaned
- Dataset multilingual Orca DPO: https://huggingface.co/datasets/multilingual/orca_dpo_pairs
- Paper de DPO: https://arxiv.org/abs/2305.18290
