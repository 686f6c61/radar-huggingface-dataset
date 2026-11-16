# aichamzaic2026/zac2026-datamate-sqllora

## Resumen

ZAC 2026 DataMate SQL-vote LoRA es un conjunto de adaptadores LoRA de rango 16 entrenados sobre el modelo base Qwen/Qwen3.5-9B para la tarea de text-to-SQL en el contexto del Zalo AI Challenge 2026. Lo desarrolla el usuario aichamzaic2026 y forma parte del agente DataMate, un pipeline que genera respuestas SQL en un entorno de competición con votación y veto entre fases. No es un modelo independiente: requiere el checkpoint base de Qwen3.5-9B (revision `c202236235762e1c871ad0ccb60c8ee5ba337b9a`) para funcionar.

El adaptador resuelve un problema muy concreto: mejorar la precisión de las consultas SQL generadas por el modelo base en preguntas de un dominio específico (tiendas de farmacia y conjuntos sintéticos), mediante un mecanismo de mezcla de muestras y veto. La innovación no está en la arquitectura del modelo, sino en el procedimiento de entrenamiento (SFT y DPO) y en la orquestación de inferencia: el adaptador escribe 2 de las 4 muestras SQL de cada voto, y una respuesta de la fase A que la fase B contradice se convierte en abstención.

Es relevante ahora porque documenta una técnica de ajuste fino eficiente (LoRA de rango 16, una época, learning rate 1e-4) aplicada a un modelo de 9B para una tarea de generación de código estructurado, con métricas de ganancia medibles en el pipeline. La información pública es escasa: no hay datos de benchmarks estandarizados, licencia ni idiomas declarados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador PEFT) sobre transformer Qwen/Qwen3.5-9B |
| Parametros totales | no disponible (adaptador LoRA de rango 16; el modelo base tiene 9B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base Qwen3.5-9B, no especificada) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | adaptadores PEFT/LoRA (no se especifica safetensors ni GGUF) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 16 sobre Qwen3.5-9B, con las claves renombradas a `base_model.model.model.language_model.layers.*` para coincidir con el checkpoint VL del modelo base. Se sirve con vLLM usando `--enable-lora --max-lora-rank 16`. El repositorio incluye tres carpetas de adaptadores: `q1c300` y `q1c400` (entrenados con SFT, checkpoints 300 y 400) y `d2c` (entrenado con DPO más un término SFT).

El entrenamiento SFT usó `scripts/train_lora.py` con rango 16, learning rate 1e-4, 1 época, opción `--current-turn-only` y checkpoint cada 100 pasos. Las filas de entrenamiento son muestras de voto del modelo base cuya respuesta coincide con la respuesta gold (herramienta `tools/harvest_sql.py`) sobre el split de train, excluyendo 6 tiendas de farmacia y los ids de ablación, más splits sintéticos. El entrenamiento DPO usó `scripts/train_dpo.py` con rango 16, learning rate 1e-4, beta 0.1, peso SFT 0.2, 1 época y hasta 1.200 pares construidos con `tools/build_dpo_sql.py` (elegido = muestra que coincide con gold, rechazado = muestra incorrecta sobre el mismo prompt), con 8 muestras por pregunta difícil sin razonamiento. La semilla es 2026 en todos los componentes. No se usaron datos del test público para entrenamiento, generación de datos ni reglas.

## Capacidades

- Generación de SQL libre (text-to-SQL) sobre el modelo base Qwen3.5-9B.
- Participación en un esquema de votación: el adaptador escribe 2 de las 4 muestras SQL de cada voto (`DATAMATE_SQL_MIX=2`).
- Mecanismo de veto: una respuesta de la fase A contradicha por la fase B se convierte en abstención (`tools/veto_merge.py`).
- Ajuste específico de dominio para preguntas de farmacia y conjuntos sintéticos de validación.
- Entrenamiento con SFT y DPO para alinear las muestras SQL con la respuesta gold.
- No se documentan capacidades de tool calling, agentes multi-paso, visión, audio ni modo thinking propias del adaptador.

## Casos de uso

- Competición text-to-SQL (Zalo AI Challenge 2026): el adaptador se integra en el pipeline DataMate para generar y votar consultas SQL, con veto entre fases para reducir respuestas incorrectas.
- Generación de consultas SQL en dominios verticales: el ajuste sobre muestras gold de tiendas de farmacia permite adaptar el modelo base a esquemas y preguntas de un sector concreto.
- Despliegue con vLLM y LoRA: se puede servir junto al modelo base con `--enable-lora --max-lora-rank 16`, útil para entornos que ya tienen Qwen3.5-9B desplegado y quieren añadir la tarea SQL sin duplicar pesos.
- Investigación en ajuste fino eficiente: sirve como referencia reproducible de SFT y DPO con LoRA de rango 16, una época y semilla fija para experimentos de text-to-SQL.
- Evaluación de técnicas de veto y abstención: el pipeline `tools/veto_merge.py` permite estudiar cómo una abstención evita penalizaciones frente a una respuesta incorrecta.
- Prototipado de asistentes de bases de datos: el adaptador puede integrarse en herramientas internas que traduzcan preguntas en lenguaje natural a SQL sobre esquemas conocidos, con la cautela de que no hay benchmarks públicos.

## Benchmarks y rendimiento

Los datos disponibles son métricas internas del pipeline, no benchmarks estandarizados:

| Adaptador | Entrenamiento | Ganancia pública (media de 4 ejecuciones fase A = +0.870) | Veto neto (synth_gate / train_ablate) |
|---|---|---|---|
| `q1c300` | SFT, checkpoint 300 | +4,25 preguntas (2 ejecuciones B); extremo a extremo con run.sh: +0,874 | +1 / +1 |
| `q1c400` | SFT, checkpoint 400 | +6,1 preguntas (4 ejecuciones B) | -1 / 0 |
| `d2c` | DPO (+ término SFT) | +3,75 preguntas (1 ejecución B) | +4 / +1 |

No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; depende del modelo base Qwen3.5-9B y de su cuantización, no del adaptador LoRA (que añade una sobrecarga mínima de rango 16).
- GPU recomendadas: no disponible; el modelo base de 9B requiere GPUs con memoria suficiente para el checkpoint completo o cuantizado.
- Cabe en consumer GPU: no disponible; depende de la cuantización del modelo base.
- Opciones de despliegue: vLLM con `--enable-lora --max-lora-rank 16` (documentado por el autor); otras opciones no disponibles.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de text-to-SQL ni datos de rendimiento frente a alternativas.

## Limitaciones y advertencias

- No es un modelo autónomo: requiere el checkpoint base Qwen/Qwen3.5-9B (revision `c202236235762e1c871ad0ccb60c8ee5ba337b9a`) y las claves renombradas para el checkpoint VL.
- Licencia no declarada: no se puede confirmar el uso comercial del adaptador ni del modelo base.
- Idiomas no declarados: no hay información sobre cobertura multilingüe.
- Riesgo de alucinación: como adaptador de text-to-SQL, puede generar consultas sintácticamente válidas pero semánticamente incorrectas; el pipeline mitiga con votación y veto, no con verificación formal.
- Entrenado sin datos del test público, pero con conjuntos sintéticos y de farmacia; el rendimiento fuera de ese dominio no está documentado.
- Las métricas publicadas son internas del pipeline DataMate y no comparables con benchmarks estándar.
- El mecanismo de veto puede producir abstenciones que, aunque no penalizan, reducen la cobertura de respuestas.
- No se documentan sesgos conocidos ni limitaciones de contexto específicas del adaptador.

## Enlaces

- Hugging Face: https://huggingface.co/aichamzaic2026/zac2026-datamate-sqllora
- Repositorio de código: https://github.com/thanhduc1102/zl-agent-ai-challenge-2026 (rama `dm/v14-veto`)
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
