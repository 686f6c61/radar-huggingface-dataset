# HalstonCheng/nextt-scaling-dense-t3-l20-2k

## Resumen

NextTransformer dense-T3-L20 es un checkpoint de investigación publicado por el usuario HalstonCheng dentro del estudio de leyes de escala (scaling laws) de NextTransformer, un proyecto alojado en el repositorio Interactive-Active-AI/NextTransformer. No se trata de un modelo pensado para uso en producción, sino de una celda experimental concreta (la variante densa T3 con 20 capas) entrenada bajo un protocolo congelado denominado `nextt-scale-2k-v1` con un presupuesto fijo de 1e20 FLOPs teóricos de entrenamiento.

El modelo es un transformer denso de aproximadamente 477 millones de parámetros (477.102.146 exactos), con 20 capas, anchura de 1.280 y 10 cabezas de atención. Emplea atención causal completa, vocabulario de 32.768 tokens, sin value embeddings, y una longitud de contexto de 2.048 tokens. Se entrenó con semilla 42 sobre una revisión fijada del dataset ClimbMix durante 29.433 actualizaciones, consumiendo 30.862.737.408 tokens de entrenamiento.

Su relevancia es exclusivamente metodológica: forma parte de una matriz de experimentos diseñada para caracterizar cómo escala el rendimiento con el cómputo bajo un protocolo reproducible. El checkpoint final alcanza una pérdida de validación de 0,701948 BPB y una puntuación CORE-22 de 0,273425, métricas que sirven como punto de referencia dentro del estudio, no como indicadores de capacidad útil en aplicaciones reales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (NextTransformer), atención causal completa |
| Parametros totales | 477.102.146 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 2.048 tokens |
| Tipos de cuantizacion | no disponible (solo checkpoint PyTorch en fp32/bf16 según config) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | PyTorch state dict (`model.pt`) + `config.json` |
| Capas / anchura / cabezas | 20 / 1.280 / 10 |
| Vocabulario | 32.768 tokens |
| Tokens de entrenamiento | 30.862.737.408 |
| Actualizaciones (updates) | 29.433 |
| FLOPs de entrenamiento | 9,99984e19 |
| Dataset | ClimbMix (revisión fijada) |
| Semilla | 42 |
| BPB de validación final | 0,701948 |
| CORE-22 final | 0,273425 |

## Arquitectura y entrenamiento

La arquitectura es un transformer denso estándar con atención causal completa, 20 capas, dimensión de modelo de 1.280 y 10 cabezas de atención. El modelo card indica explícitamente la ausencia de value embeddings, lo que sugiere una variante simplificada respecto a otras configuraciones del proyecto NextTransformer. El vocabulario es de 32.768 tokens y el contexto máximo de entrenamiento es de 2.048 tokens.

El entrenamiento se realizó bajo el protocolo congelado `nextt-scale-2k-v1`, con un presupuesto teórico de 1e20 FLOPs, semilla 42 y una revisión fijada del dataset ClimbMix. Se completaron 29.433 actualizaciones sobre 30.862.737.408 tokens. No se menciona en la información disponible el uso de RLHF, DPO ni ninguna fase de alineación posterior al preentrenamiento; tampoco se detalla la composición del dataset más allá de su nombre. La procedencia del run es verificable mediante el registro publicado en el repositorio upstream (`results/scaling/runs/dense-T3-L20.json`) y el comando `python -m nexttransformer.scaling.export --check`.

## Capacidades

- Generación de texto autoregresiva básica, limitada por el contexto de 2.048 tokens.
- Razonamiento de corto alcance y tareas de modelado de lenguaje medidas mediante BPB y CORE-22.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingües no documentadas; el model card no especifica idiomas.
- No dispone de modo thinking, visión, audio ni otras modalidades.
- No se documenta un chat template ni ajuste por instrucciones.

## Casos de uso

- Reproducción de experimentos de scaling laws: el checkpoint sirve para validar el protocolo `nextt-scale-2k-v1` y comparar curvas de pérdida frente a otras celdas del estudio (distintas profundidades, anchuras o presupuestos de cómputo).
- Investigación sobre eficiencia de entrenamiento: permite analizar la relación entre tokens vistos (30.862 millones), actualizaciones (29.433) y FLOPs (1e20) para calibrar predicciones de rendimiento en modelos mayores.
- Baseline para ablaciones arquitectónicas: al ser un transformer denso sin value embeddings, resulta útil como referencia frente a variantes con mecanismos alternativos de atención o embeddings de valor.
- Estudio de tokenizadores: con un vocabulario de 32.768 tokens sobre ClimbMix, puede emplearse para medir el impacto del tokenizador en BPB y en tareas CORE-22.
- Evaluación de métricas de validación: el BPB final (0,701948) y el CORE-22 (0,273425) permiten contrastar metodologías de evaluación estandarizadas en modelos de escala similar.
- Docencia y divulgación: sirve como ejemplo práctico y verificable de un run de entrenamiento con presupuesto de cómputo fijo y registro reproducible, adecuado para explicar conceptos de scaling laws en cursos o talleres.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| BPB de validación final | 0,701948 |
| CORE-22 | 0,273425 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Las únicas métricas reportadas son la pérdida de validación en bits por byte y la puntuación agregada CORE-22 del estudio.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 1,9 GB solo para pesos (477 M de parámetros × 4 bytes), más overhead de activaciones y caché KV.
- VRAM estimada en bf16/fp16: aproximadamente 1 GB para pesos, más activaciones y caché KV para 2.048 tokens de contexto.
- Cabe holgadamente en cualquier GPU consumer moderna (RTX 3060 12 GB, RTX 4060, RTX 4090) e incluso en GPUs de gama baja con 4-6 GB.
- Despliegue: al publicarse únicamente como state dict de PyTorch (`model.pt`) más `config.json`, requiere cargar la configuración desde el repositorio NextTransformer. No se proporcionan pesos en GGUF, por lo que llama.cpp u Ollama no son utilizables directamente sin conversión.
- vLLM y TGI no están soportados de forma nativa sin adaptar la arquitectura al formato esperado por dichos motores.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| NextTransformer dense-T3-L20 | 477 M | 2.048 | MIT | PyTorch state dict | Checkpoint de investigación, sin benchmarks estándar |
| Pythia-410M | 410 M | 2.048 | Apache 2.0 | safetensors | Suite de scaling laws de EleutherAI, con benchmarks publicados |
| GPT-2 medium | 355 M | 1.024 | MIT | safetensors, TF | Modelo de referencia histórico, ampliamente soportado |
| OPT-350M | 350 M | 2.048 | OPT-175B license | safetensors | Modelo de Meta con benchmarks publicados |

La comparación es aproximada: dense-T3-L20 pertenece a un estudio de scaling laws y no publica evaluaciones en tareas estándar, por lo que no es posible contrastar su rendimiento real frente a estas alternativas más allá de la pérdida de validación interna del propio estudio.

## Limitaciones y advertencias

- Modelo de investigación sin ajuste por instrucciones: no está diseñado para uso conversacional ni como asistente.
- Contexto muy limitado (2.048 tokens), insuficiente para la mayoría de aplicaciones de producción con documentos largos.
- Sin datos publicados sobre sesgos; el dataset ClimbMix no se describe en detalle en la información disponible.
- Riesgo de alucinación alto, propio de un modelo de 477 M entrenado con 30.862 millones de tokens y sin alineación.
- Idiomas soportados no documentados; probablemente entrenado principalmente en inglés, aunque no se confirma.
- Licencia MIT permite uso comercial, pero el modelo carece de garantías de calidad para tales fines.
- Formato de pesos exclusivamente PyTorch state dict: requiere el código del repositorio NextTransformer para la carga; no hay GGUF ni safetensors.
- Sin pipeline declarado en Hugging Face ni chat template; la integración con frameworks estándar requiere trabajo adicional.
- Cero descargas y cero likes en el momento de la consulta: sin validación comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/HalstonCheng/nextt-scaling-dense-t3-l20-2k
- Repositorio NextTransformer: https://github.com/Interactive-Active-AI/NextTransformer
- Registro del run (referenciado en la model card): `results/scaling/runs/dense-T3-L20.json` dentro del repositorio upstream
- Comando de verificación: `python -m nexttransformer.scaling.export --check`
