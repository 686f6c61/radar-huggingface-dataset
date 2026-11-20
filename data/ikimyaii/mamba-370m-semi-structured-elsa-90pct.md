# ikimyaii/Mamba-370M-semi-structured-ELSA-90pct

## Resumen

Mamba-370M-semi-structured-ELSA-90pct es un modelo de lenguaje basado en la arquitectura Mamba (modelo de espacio de estados, SSM) derivado de `state-spaces/mamba-370m-hf` mediante poda semi-estructurada al 90 % de dispersión. Lo publica el usuario `ikimyaii` como punto de referencia (baseline) para sus modelos EHWS, y emplea el código oficial de ELSA descrito en el paper arXiv:2510.01650. El objetivo no es ofrecer un modelo listo para producción, sino servir de comparación experimental en estudios de compresión y dispersión de SSMs.

El modelo conserva la estructura completa de Mamba pero elimina el 90 % de los pesos de las capas lineales internas de cada bloque (`in_proj`, `x_proj`, `out_proj`), manteniendo densas las proyecciones `dt_proj`, `conv1d`, `A_log` y `D`, así como los embeddings y la cabeza `lm_head`. La dispersión es semi-estructurada por filas: cada fila de cada capa podada conserva el mismo número de pesos (el 10 % superior). La dispersión medida sobre los pesos finales es de 0,8818.

El interés del artefacto es metodológico: documenta un procedimiento de poda ADMM reproducible (4096 pasos, 2,84 horas en una A100 de 40 GB) y publica métricas de perplejidad y de evaluación zero-shot que evidencian el coste de una poda tan agresiva. La perplejidad en WikiText-2 de 2092,26 y en C4 de 576,82 sitúan al modelo muy lejos de su base sin podar, lo que lo hace útil como cota inferior de rendimiento en experimentos de compresión, no como modelo de uso general.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Mamba (modelo de espacio de estados, SSM selectivo) |
| Parámetros totales | 423.003.136 (según safetensors) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos publicados en safetensors, presumiblemente bf16; la model card indica que Mamba desborda en fp16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Modelo base | state-spaces/mamba-370m-hf |
| Dispersión | 90 % semi-estructurada por filas (medida: 0,8818) |
| Tamaño del repo | 1,7 GB |

## Arquitectura y entrenamiento

La arquitectura es la de Mamba-370M original: un SSM selectivo con bloques que combinan `in_proj`, `conv1d`, `x_proj`, `dt_proj`, `A_log`, `D` y `out_proj`, sin mecanismo de atención. Sobre esta base, el autor aplica poda ADMM con el código oficial de ELSA. La configuración es fija para todos sus modelos: 4096 pasos ADMM, paso z cada 32 pasos, batch 1 con acumulación de 8, learning rate 2e-4, lambda 0,01, precisión bf16, 32.768 secuencias de C4 de 2.048 tokens tokenizadas con el tokenizador del propio modelo y semilla 0. El entrenamiento completo de poda requirió 2,84 horas en una A100 de 40 GB.

La innovación respecto al paper de ELSA es la proyección por filas (`--admm_comparison_group=row`), que no se reporta en el paper original: cada fila de cada capa podada conserva exactamente el mismo número de pesos. El autor indica que la proyección es código de ELSA y que él añadió la opción que la habilita. No hay datos sobre un ajuste fino posterior a la poda ni sobre recuperación de rendimiento tras la compresión.

## Capacidades

- Generación de texto autoregresiva mediante `AutoModelForCausalLM.from_pretrained(...)` con `transformers` estándar.
- Razonamiento y conocimiento factual muy degradados: la accuracy media zero-shot es de 0,3252, apenas por encima del azar en varias tareas.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingües: no disponibles.
- No dispone de modo thinking, visión ni audio.
- Su función real es servir de baseline de compresión extrema en experimentos con SSMs.

## Casos de uso

- Baseline de investigación en poda de SSMs: usar el modelo como referencia inferior frente a variantes con menor dispersión o con recuperación posterior a la poda, midiendo la brecha de perplejidad en WikiText-2 y C4.
- Estudio de métodos ADMM aplicados a Mamba: reproducir el pipeline de ELSA con la opción `--admm_comparison_group=row` y comparar la dispersión medida (0,8818) con la nominal (90 %).
- Evaluación de robustez de harnesses: comprobar cómo se comporta `lm-evaluation-harness` con un modelo de perplejidad extrema, útil para calibrar métricas y detectar artefactos de evaluación.
- Docencia y divulgación: ilustrar el efecto de la dispersión semi-estructurada en un SSM con un caso reproducible en una sola A100 de 40 GB y menos de 3 horas de cómputo.
- Análisis de sparsity real frente a nominal: verificar empíricamente que las filas conservan el mismo número de pesos y que los ceros exactos introducen desviaciones mínimas (peor capa 1,00024x).
- Pruebas de despliegue en `transformers`: validar la carga del checkpoint y el flujo de inferencia en bf16, dado que fp16 desborda en Mamba.

## Benchmarks y rendimiento

Perplejidad con el protocolo de evaluación de ELSA (WikiText-2 y C4, en bf16, ejecución única):

| Conjunto | Perplejidad |
|---|---|
| WikiText-2 | 2092,26 |
| C4 | 576,82 |

Accuracy zero-shot con `lm-evaluation-harness`:

| Tarea | Resultado |
|---|---|
| arc_challenge | 0,1971 |
| arc_easy | 0,2715 |
| boolq | 0,3783 |
| hellaswag | 0,2570 |
| openbookqa | 0,1260 |
| rte | 0,5271 |
| winogrande | 0,5193 |
| Media | 0,3252 |

No se han publicado resultados del modelo base sin podar en la información disponible, por lo que no se puede cuantificar aquí la degradación relativa.

## Requisitos de hardware

- VRAM estimada para inferencia: en bf16, aproximadamente 0,85 GB solo para pesos (423 M de parámetros); en fp32, unos 1,7 GB. La activación y el contexto añaden overhead no cuantificado.
- El proceso de poda requiere una A100 de 40 GB según el autor; la inferencia es mucho más ligera.
- Cabe en cualquier GPU consumer con al menos 4 GB de VRAM (RTX 3050, RTX 4060, etc.), aunque no se han publicado mediciones de latencia ni throughput.
- Despliegue: `transformers` con `AutoModelForCausalLM.from_pretrained(...)`. No se documenta soporte en vLLM, llama.cpp, Ollama ni TGI.
- Precisión recomendada: bf16, ya que fp16 provoca desbordamiento en Mamba según la model card.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Dispersión | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo | 423 M | no disponible | 90 % semi-estructurada (0,8818 medida) | no disponible | Hugging Face |
| state-spaces/mamba-370m-hf | ~370 M | no disponible | densa | no disponible | Hugging Face |
| Modelos EHWS del mismo autor | no disponible | no disponible | no disponible | no disponible | Hugging Face (misma cuenta) |

No se dispone de datos de rendimiento del modelo base ni de los modelos EHWS en la información proporcionada, por lo que la comparación cuantitativa de benchmarks queda como no disponible.

## Limitaciones y advertencias

- Calidad muy degradada: perplejidad de 2092,26 en WikiText-2 y accuracy media zero-shot de 0,3252, con tareas como openbookqa (0,1260) cerca del azar. No es apto para uso en producción.
- Riesgo elevado de alucinación y de generación incoherente por la compresión extrema de pesos.
- Licencia no especificada: no se puede asumir uso comercial sin consultar al autor y al modelo base.
- Idiomas soportados no documentados; no hay garantía de comportamiento multilingüe.
- Longitud de contexto no disponible; no se han publicado pruebas de contexto largo.
- Ejecución única de evaluación: no hay intervalos de confianza ni réplicas con otras semillas.
- La opción de proyección por filas no está reportada en el paper de ELSA, por lo que su comportamiento no está validado por revisión independiente.
- fp16 desborda; es obligatorio usar bf16 o fp32.
- Repositorio sin descargas ni likes en el momento de la consulta: no hay evidencia de uso comunitario ni de validación externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ikimyaii/Mamba-370M-semi-structured-ELSA-90pct
- Modelo base: https://huggingface.co/state-spaces/mamba-370m-hf
- Paper de ELSA: https://arxiv.org/abs/2510.01650
