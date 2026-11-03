# MarxistLeninist/phasemesh-transformer-baseline-text8

## Resumen

`phasemesh-transformer-baseline-text8` es un modelo Transformer a nivel de carácter entrenado por el usuario de HuggingFace MarxistLeninist como baseline de comparación frente a una arquitectura SSM denominada PhaseMesh. No es un modelo de propósito general ni un asistente conversacional: es un artefacto de investigación cuyo único objetivo es servir de referencia controlada en un experimento comparativo de arquitecturas sobre el corpus text8. El modelo tiene 130.575.232 parámetros, 11 capas, dimensión de modelo 1.088 y 17 cabezas de atención, con un vocabulario de 256 tokens (bytes) y una longitud de contexto de 1.024.

El entrenamiento consistió en 5.000 actualizaciones del optimizador con un batch efectivo de 64 (microbatch 4 × 16 pasos de acumulación), en BF16, con evaluación en FP32 y una única semilla (seed 1). El mejor resultado de validación fue de 1,2401772355 bits por carácter (bpc) en el paso 4.000, degradándose hasta 1,2575643889 bpc en el paso 5.000. El autor compara este resultado con el del SSM PhaseMesh (mejor 1,2568 / final 1,2603 bpc) y advierte explícitamente de que la ventaja del Transformer (~0,00274 bpc) no es estadísticamente concluyente con una sola semilla y validación muestreada.

Su relevancia es, por tanto, estrictamente metodológica: documenta de forma reproducible un punto de comparación entre Transformer y SSM en un régimen de escala pequeño, con checkpoints, configuración y manifiestos de integridad publicados. No está pensado para despliegue en producción ni para tareas generativas reales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con RoPE, embeddings atados (tied embeddings) |
| Parametros totales | 130.575.232 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1.024 tokens |
| Tipos de cuantizacion | no disponible (solo checkpoints PyTorch en BF16/FP32; no se publican GGUF ni cuantizaciones) |
| Idiomas soportados | en (a nivel de byte; el modelo opera sobre bytes, no sobre tokens lingüísticos) |
| Licencia | other (sin términos especificados en la model card) |
| Formato de pesos | PyTorch `.pt` (`latest.pt`, `best.pt`); no hay safetensors ni GGUF |

## Arquitectura y entrenamiento

Se trata de un Transformer decoder-only de 11 capas con `d_model` de 1.088, 17 cabezas de atención, `d_ff = 2 × d_model` (es decir, 2.176), RoPE para el codificado posicional y embeddings atados entre entrada y salida. El vocabulario es de 256 entradas, correspondiente a bytes individuales, lo que sitúa al modelo en el régimen de modelado a nivel de carácter/byte sobre text8.

El entrenamiento usó el corpus text8 con partición 90/5/5, contexto de 1.024, batch efectivo de 64 (microbatch 4 × 16 pasos de acumulación), precisión BF16 en entrenamiento y FP32 en evaluación. Se realizaron 5.000 actualizaciones del optimizador con una tasa de aprendizaje máxima de 3e-4 (mínima 1e-4, 300 pasos de warmup), frente a los 3e-3 reportados para el SSM PhaseMesh. El total de presentaciones de bytes durante el entrenamiento fue de 327.680.000. No se menciona RLHF, DPO ni ajuste por instrucciones: es un modelo de modelado de lenguaje puro. El código de entrenamiento (`run_matched.py`, `idle_training.py`, `child_entry.py`, `vendor/phase_ssm/`) y la configuración completa se publican en el repositorio, con commit de origen `3ae43ffac6c0`.

## Capacidades

- Modelado de lenguaje a nivel de byte sobre texto en inglés (predicción del siguiente byte).
- Generación de texto carácter a carácter dentro de la ventana de 1.024 bytes.
- Evaluación reproducible de perplejidad/bpc sobre text8.
- No dispone de soporte de tool calling ni function calling.
- No dispone de capacidades de agente ni razonamiento multi-paso.
- No dispone de capacidades multilingües más allá del modelado estadístico de bytes.
- No dispone de modo thinking, visión ni audio.
- No es un modelo ajustado por instrucciones; no responde a prompts en el sentido conversacional.

## Casos de uso

- Baseline de investigación en comparativas de arquitecturas: sirve como referencia Transformer emparejada frente a SSM PhaseMesh en text8, con configuración, semilla y checkpoints documentados para reproducir la comparación.
- Reproducción de experimentos de modelado a nivel de byte: el par `latest.pt`/`best.pt` más `config.json` permite reanudar el entrenamiento (el checkpoint final incluye estado del optimizador, 90 estados, y RNG) y verificar resultados.
- Estudio de dinámica de entrenamiento: la curva de validación (mejor en el paso 4.000, degradación en el 5.000) es útil para analizar sobreajuste temprano en regímenes de cómputo reducido.
- Validación de pipelines de integridad de checkpoints: los ficheros `RESTORE_VERIFIED.json` y `BEST_RESTORE_VERIFIED.json` documentan cargas estrictas en CPU, comprobación de pesos finitos y verificación de RNG, útiles como plantilla de buenas prácticas.
- Docencia sobre tokenización a nivel de byte: un modelo de 130 M de parámetros con vocabulario de 256 permite ilustrar el efecto del modelado por byte frente a subword en corpus pequeños.
- Pruebas de infraestructura de entrenamiento distribuido: el esquema de microbatch 4 × acumulación 16 con BF16 sirve para validar configuraciones de memoria y throughput en GPUs modestas.

## Benchmarks y rendimiento

| Metrica | Transformer baseline | PhaseMesh SSM (reportado) |
|---|---|---|
| Mejor validacion (bpc) | 1,2401772355 (paso 4.000) | 1,2568 |
| Validacion final (bpc) | 1,2575643889 (paso 5.000) | 1,2603 |
| Parametros | 130.575.232 | no disponible |
| Contexto | 1.024 | no disponible |
| Presentaciones de bytes | 327.680.000 | no disponible |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. El autor señala que la comparación se basa en una sola semilla, con validación muestreada (50 batches cada 250 actualizaciones), hardware distinto entre ejecuciones y sin checkpoint del SSM disponible para evaluación independiente, por lo que no se establece un ganador arquitectónico fiable.

## Requisitos de hardware

- VRAM estimada para inferencia: con 130,6 M de parámetros, en FP32 ocupa aproximadamente 0,52 GB y en BF16/FP16 unos 0,26 GB; el checkpoint `latest.pt` incluye además estado del optimizador (90 estados) y RNG, lo que eleva el tamaño del repositorio a 2,1 GB.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM libre es suficiente; no requiere A100 ni H100. Una RTX 4090 o incluso GPUs de gama baja son sobradas para inferencia.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo moderna (GTX 1060 en adelante) e incluso en CPU para inferencia a nivel de byte.
- Opciones de despliegue: al publicarse solo en formato PyTorch `.pt`, requiere código propio de carga; no hay integración directa con vLLM, llama.cpp, Ollama ni TGI. Sería necesario convertir los pesos a safetensors/GGUF para usar esos ecosistemas.
- Latencia y throughput: no disponible; el autor no publica mediciones de velocidad y advierte que el hardware difiere entre las ejecuciones comparadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| phasemesh-transformer-baseline-text8 | 130.575.232 | 1.024 | Transformer byte-level, baseline de investigación | other | HuggingFace (PyTorch `.pt`) |
| PhaseMesh SSM (referencia del autor) | no disponible | no disponible | SSM, comparado en text8 | no disponible | Checkpoint no disponible para evaluación independiente |
| GPT-2 small (referencia de escala) | 124 M | 1.024 | Transformer decoder-only subword | MIT (pesos originales) | Ampliamente disponible en safetensors/GGUF |

La comparación con GPT-2 small es solo orientativa por escala de parámetros; no se dispone de resultados de benchmarks comparables en la información proporcionada. No se han identificado otros modelos directamente comparables en el mismo régimen experimental (byte-level sobre text8) dentro de la información disponible.

## Limitaciones y advertencias

- Modelo de investigación sin ajuste por instrucciones: no debe usarse como asistente ni en aplicaciones conversacionales.
- Entrenado únicamente sobre text8 en inglés a nivel de byte; no generaliza a otros dominios ni idiomas de forma fiable.
- Ventana de contexto muy limitada (1.024 bytes), insuficiente para documentos largos.
- Riesgo elevado de alucinación y texto incoherente fuera de la distribución de text8.
- Sesgos: al entrenarse sobre text8 (corpus de Wikipedia preprocesado), puede reflejar sesgos del corpus original; el autor no documenta análisis de sesgo.
- Resultado comparativo no concluyente: una sola semilla, validación muestreada y hardware distinto; la ventaja de ~0,00274 bpc sobre el SSM no es estadísticamente significativa.
- Licencia "other" sin términos explícitos: no se especifican restricciones ni permisos de uso comercial; debe consultarse al autor antes de cualquier uso en producción.
- Formato de pesos solo PyTorch `.pt`: requiere código propio y no es compatible directamente con stacks de inferencia estándar.
- El checkpoint `best.pt` no incluye estado del optimizador ni RNG, por lo que no permite reanudar el entrenamiento desde ese punto.

## Enlaces

- HuggingFace: https://huggingface.co/MarxistLeninist/phasemesh-transformer-baseline-text8
- Referencia del autor a los resultados del SSM PhaseMesh y su configuración documentada (citada en la model card; no se proporciona URL directa en la información disponible).
- Código de entrenamiento incluido en el repositorio: `run_matched.py`, `idle_training.py`, `child_entry.py`, `vendor/phase_ssm/` (commit `3ae43ffac6c0`).
- Ficheros de verificación: `RESTORE_VERIFIED.json`, `BEST_RESTORE_VERIFIED.json`, `BACKUP_MANIFEST.json`.
