# Adeely93/gemma_3_4b_it-vlguard-sft-epoch1.5-lr1e-6

## Resumen

`Adeely93/gemma_3_4b_it-vlguard-sft-epoch1.5-lr1e-6` es un ajuste fino supervisado (SFT) del modelo multimodal `google/gemma-3-4b-it` de Google, especializado en seguridad de contenido visual y textual. Lo publica el usuario Adeely93 como parte de los experimentos WSP (WSP-MLLM-Safety), y su objetivo es servir como línea base (baseline) reproducible para investigar la robustez de modelos visión-lenguaje frente a entradas maliciosas o no seguras.

El modelo parte de la arquitectura Gemma 3 de 4.300 millones de parámetros, con capacidades de imagen-a-texto, y se ha ajustado con LoRA (rango 8, alpha 16) sobre el conjunto de datos VLGuard, un corpus de seguridad multimodal. El checkpoint publicado corresponde a la época 1,5 de un entrenamiento de 3 épocas, con el adaptador fusionado en los pesos en bf16.

Es relevante ahora porque proporciona una referencia pública y auditable para evaluar técnicas de alineación de seguridad en modelos multimodales pequeños, con métricas concretas de seguridad (FigStep, MM-SafetyBench, JB-Mini), utilidad (ScienceQA, MathVista) y sobre-rechazo (MOSSBench). No obstante, es un artefacto de investigación con cero descargas y sin datos de idiomas declarados, por lo que no está pensado para producción directa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Gemma 3), vision tower + proyector + LLM decoder; detalles exactos no disponibles |
| Parametros totales | 4.300.079.472 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el entrenamiento usa cutoff_len 2048) |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16; compatible con cuantizacion estandar de transformers/vLLM, pero no se documentan variantes) |
| Idiomas soportados | no disponible |
| Licencia | gemma (Gemma Terms of Use) |
| Formato de pesos | safetensors (repo de 8,6 GB) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de `google/gemma-3-4b-it`, un transformer multimodal que combina una torre de visión con un decodificador de lenguaje y un proyector multimodal. Durante el ajuste fino se congelaron tanto la torre de visión (`freeze_vision_tower: true`) como el proyector multimodal (`freeze_multi_modal_projector: true`), de modo que el entrenamiento solo actualizó los adaptadores LoRA aplicados a las capas del LLM. El ajuste se realizó con LLaMA-Factory, LoRA de rango 8, alpha 16, dropout 0,05, objetivo `all`, learning rate 1e-6, scheduler coseno con warmup del 10 %, precisión bf16 y tf32, atención SDPA, `cutoff_len` de 2048 y `image_max_pixels` de 802.816.

Los datos de entrenamiento son el 100 % del conjunto SFT de VLGuard (`vlguard_p100`), con un batch global de 8 (batch por dispositivo 1 × acumulación de gradientes 8) y semilla 42 con determinismo completo. El checkpoint publicado corresponde al paso 1497, época 1,5 de 3, de una ejecución con `save_half_epochs`. El adaptador se fusionó en bf16 con PEFT mediante el script `eval/generate.py` del proyecto WSP-MLLM-Safety (commit `982652b`), y el entrenamiento se ejecutó en GPU NVIDIA B200. No se documenta el número total de tokens de entrenamiento ni la composición detallada del dataset más allá de VLGuard.

## Capacidades

- Generación de texto e imagen-a-texto: el pipeline declarado es `image-text-to-text`, por lo que acepta entradas multimodales y produce respuestas textuales.
- Razonamiento y respuesta conversacional multi-turno, heredados del modelo base Gemma 3 4B IT.
- Capacidades de seguridad alineada: el ajuste con VLGuard busca reducir respuestas no seguras ante entradas visuales y textuales adversarias.
- Soporte de tool calling / function calling: no documentado en la información proporcionada (el modelo base Gemma 3 IT lo soporta, pero este ajuste no lo declara explícitamente).
- Soporte de agentes y razonamiento multi-paso: no documentado específicamente para este checkpoint.
- Capacidades multilingües: no disponibles (no se declaran idiomas).
- Capacidades especiales: no se documenta modo thinking, audio ni otras modalidades más allá de imagen y texto.

## Casos de uso

- Investigación en seguridad multimodal: servir como baseline SFT reproducible para comparar técnicas de alineación (DPO, RLHF, filtrado de datos) sobre Gemma 3 4B IT, usando las métricas FigStep, MM-SafetyBench y JB-Mini como referencia.
- Evaluación de robustez frente a jailbreaks visuales: el modelo permite medir la tasa de respuestas no seguras (30 % en JB-Mini, 4 % en MM-SafetyBench) y comparar con variantes posteriores del mismo proyecto.
- Estudio del equilibrio seguridad-utilidad: con un 57,0 % de utilidad media en ScienceQA y MathVista y un 77 % de sobre-rechazo en MOSSBench, es útil para analizar el coste de la alineación en tareas legítimas.
- Docencia y formación en alineación de modelos: el repositorio incluye la configuración completa (`llamafactory.yaml`, `run_meta.json`, hashes de datos y adaptador), lo que facilita reproducir el pipeline en cursos o talleres.
- Pruebas de despliegue con vLLM: al conservar todos los ficheros del modelo base salvo los pesos, puede cargarse con `LLM(model="Adeely93/gemma_3_4b_it-vlguard-sft-epoch1.5-lr1e-6")` para validar pipelines de inferencia multimodal.
- Generación de datos sintéticos controlados: en entornos de investigación, puede emplearse para producir respuestas de referencia sobre imágenes y comparar el comportamiento seguro frente al modelo base sin ajustar.
- Análisis de sesgos y sobre-rechazo: el 77 % de rechazos en MOSSBench lo convierte en un caso de estudio para diagnosticar políticas de seguridad demasiado conservadoras.

## Benchmarks y rendimiento

| Benchmark | Resultado | Métrica |
|---|---|---|
| FigStep | 1 | % no seguro |
| MM-SafetyBench | 4 | % no seguro |
| JB-Mini | 30 | % no seguro |
| Utility (ScienceQA + MathVista) | 57,0 | % medio de acierto |
| MOSSBench | 77 | % de rechazo (sobre-rechazo) |
| FigStep-benign | 57 | % de rechazo |

Condiciones de evaluación: 100 muestras por conjunto, juez `gpt-4.1-mini` (margen aproximado de ±8 puntos), decodificación con la configuración de generación del modelo (temperatura 1,0, top-p 0,95, top-k 64), máximo de 4096 tokens nuevos, semilla 42 y GPU NVIDIA L4. No se proporcionan comparaciones numéricas con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 8,6 GB en bf16 solo para pesos; con overhead de activaciones y contexto, se recomienda un mínimo de 12-16 GB para uso cómodo. En cuantización de 8 bits podría rondar los 5-6 GB y en 4 bits los 3-4 GB, aunque no se documentan variantes cuantizadas oficiales.
- GPU recomendadas: NVIDIA L4 (usada en la evaluación), A100, H100, B200 (usada en entrenamiento). Para inferencia en bf16, una RTX 4090 (24 GB) es suficiente.
- Compatibilidad con GPU de consumo: sí, en tarjetas con 12 GB o más en bf16; en 8 GB requeriría cuantización, no documentada oficialmente.
- Opciones de despliegue: transformers (`AutoModelForImageTextToText` + `AutoProcessor`), vLLM (soporte declarado), text-generation-inference (tag `text-generation-inference`) y endpoints compatibles (tag `endpoints_compatible`).
- Latencia y throughput: no disponibles; solo se indica que la evaluación se ejecutó en una NVIDIA L4 con hasta 4096 tokens nuevos por muestra.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| Adeely93/gemma_3_4b_it-vlguard-sft-epoch1.5-lr1e-6 | 4,3 B | no disponible | gemma | SFT de seguridad multimodal (VLGuard) | Hugging Face, 0 descargas |
| google/gemma-3-4b-it | 4,3 B | no disponible en la informacion | gemma | Modelo base multimodal instruct | Hugging Face, ampliamente disponible |
| Otros baselines WSP-MLLM-Safety | no disponible | no disponible | no disponible | Variantes SFT de seguridad | Repositorio `Adeely93/wsp_sft_vlguard_baselines` |

No se dispone de datos de benchmarks de los modelos comparables en la información proporcionada, por lo que no es posible establecer una comparación numérica de rendimiento.

## Limitaciones y advertencias

- Es un artefacto de investigación con 0 descargas y 0 likes; no hay evidencia de validación externa ni de uso en producción.
- El sobre-rechazo es elevado: 77 % en MOSSBench y 57 % en FigStep-benign, lo que indica una tendencia a rechazar entradas legítimas.
- La tasa de respuestas no seguras en JB-Mini es del 30 %, considerablemente superior a la de FigStep (1 %) y MM-SafetyBench (4 %), lo que sugiere vulnerabilidad a ciertos ataques de jailbreak.
- Las métricas tienen un margen de ±8 puntos y se basan en 100 muestras por conjunto con un juez automático (`gpt-4.1-mini`), lo que limita su fiabilidad estadística.
- No se declaran idiomas soportados; el comportamiento multilingüe es incierto.
- La licencia Gemma impone restricciones de uso comercial y la política de usos prohibidos de Gemma (sección 3.2 de los Términos de Uso); es obligatorio revisarla antes de cualquier despliegue.
- Riesgo de alucinación inherente al modelo base, no mitigado específicamente por este ajuste.
- El checkpoint corresponde a la época 1,5 de 3; no es el modelo final del entrenamiento y puede presentar un equilibrio seguridad-utilidad distinto al de la época completa.
- No se documentan sesgos específicos, pero al derivar de Gemma 3 hereda los sesgos del modelo base y de los datos de VLGuard.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Adeely93/gemma_3_4b_it-vlguard-sft-epoch1.5-lr1e-6
- Modelo base: https://huggingface.co/google/gemma-3-4b-it
- Repositorio de baselines: https://huggingface.co/Adeely93/wsp_sft_vlguard_baselines
- Términos de uso de Gemma: https://ai.google.dev/gemma/terms
- Política de usos prohibidos de Gemma: https://ai.google.dev/gemma/prohibited_use_policy
