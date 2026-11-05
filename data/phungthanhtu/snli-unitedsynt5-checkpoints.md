# phungthanhtu/snli-UnitedSynT5-checkpoints

## Resumen

`phungthanhtu/snli-UnitedSynT5-checkpoints` no es un modelo generativo al uso, sino un repositorio de respaldo (backup) que agrupa todos los checkpoints entrenados durante una tesis doctoral sobre clasificación de inferencia en lenguaje natural (NLI) con el corpus SNLI. El autor, `phungthanhtu`, publica aquí los pesos de decenas de configuraciones experimentales: fine-tuning completo, destilación, entrenamiento con etiquetas reducidas (EFL), variantes GTR basadas en T5 y modelos con anchura reducida, además de ejecuciones few-shot con K=16 y K=64.

La relevancia del repositorio es fundamentalmente académica y de reproducibilidad: permite a otros investigadores replicar los resultados de la tesis sin reentrenar, y comparar el rendimiento de arquitecturas encoder pequeñas (BERT-tiny, BERT-mini, MiniLM, TinyBERT, DeBERTa-xsmall, ALBERT) frente a variantes T5 con cabezas personalizadas (`T5NLI`). El tamaño del repositorio (13,1 GB) refleja la acumulación de múltiples checkpoints, no un único modelo de gran tamaño.

No se trata de un modelo para uso en producción generalista: es una colección de clasificadores de tres o cuatro clases (entailment, neutral, contradiction) entrenados sobre SNLI, con métricas de macro-F1 reportadas por el autor para cada checkpoint. La licencia y los idiomas soportados no están declarados en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT, ALBERT, DeBERTa, MiniLM, TinyBERT) y encoder-decoder T5 con cabeza `T5NLI` personalizada |
| Parámetros totales | Variable por checkpoint (desde BERT-tiny hasta ALBERT-large / GTR-large); no disponible un valor único |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (pesos en safetensors, presumiblemente fp32/fp16) |
| Idiomas soportados | No disponible (SNLI es un corpus en inglés) |
| Licencia | No disponible |
| Formato de pesos | safetensors (con código de carga vía `transformers` o `NLPMonoRepo`) |

## Arquitectura y entrenamiento

El repositorio contiene checkpoints de dos familias. La primera es la de encoders tipo BERT para clasificación de secuencias (`AutoModelForSequenceClassification`), que incluye variantes base (`base_*`), destiladas (`distil_*_pepa`), con etiquetas reducidas (`efl_*`, `efl_only_*`) y con anchura reducida (`width_*`). La segunda familia son modelos T5 (`gtr_*`, `distil_gtr_t5_small`, `width_*`) que no usan la cabeza estándar de Hugging Face, sino una cabeza `T5NLI` personalizada definida en el repositorio de código `NLPMonoRepo`, lo que obliga a cargar el modelo con el código del autor y no con `transformers` puro.

El entrenamiento se realizó sobre SNLI (Stanford Natural Language Inference), un corpus de pares de premisa-hipótesis etiquetados como entailment, neutral o contradiction. El autor reporta experimentos de fine-tuning completo, destilación de conocimiento (sufijo `kd`), entrenamiento con pocas etiquetas (EFL) y variantes con datos sintéticos (sufijo `synth`). En el régimen few-shot se comparan fine-tuning directo (`ft`) frente a destilación (`kd`) con K=16 y K=64 ejemplos por clase, mostrando una diferencia muy marcada: por ejemplo, `snli_k16_ft_s0` alcanza 0,4004 de macro-F1 mientras que `snli_k16_kd_s0` llega a 0,8838. No se detalla en la información disponible el número exacto de tokens de entrenamiento ni la composición completa del dataset más allá de SNLI y los datos sintéticos.

## Capacidades

- Clasificación de pares de frases en tres clases (entailment, neutral, contradiction) sobre el esquema de SNLI.
- Fine-tuning supervisado completo sobre SNLI con macro-F1 de hasta 0,9128 (`distil_albert_large_pepa`).
- Destilación de conocimiento desde modelos profesores, con checkpoints `distil_*_pepa` y `*_kd_*`.
- Entrenamiento con etiquetas reducidas (EFL) y variantes `efl_only_*`.
- Variantes con anchura reducida (`width_3way`, `width_efl`) para estudiar el efecto de comprimir dimensiones ocultas.
- Few-shot learning con K=16 y K=64, comparando fine-tuning directo y destilación.
- Carga mediante `transformers` para los checkpoints BERT-like; los T5 requieren el código `T5NLI` del repositorio `NLPMonoRepo`.
- No soporta generación de texto libre, tool calling, agentes, visión ni audio: es un clasificador discriminativo.

## Casos de uso

- Reproducibilidad de investigación en NLI: cargar cualquiera de los checkpoints con `from_pretrained(..., subfolder="full-label/...")` para replicar las cifras de macro-F1 reportadas en la tesis sin reentrenar.
- Estudio comparativo de arquitecturas encoder pequeñas: usar los pares `base_*` frente a `distil_*_pepa` para medir la pérdida de rendimiento al destilar BERT-mini, TinyBERT o MiniLM en una tarea de clasificación de tres clases.
- Análisis de destilación en régimen few-shot: comparar `snli_k16_ft_s*` (macro-F1 en torno a 0,23–0,54) con `snli_k16_kd_s*` (en torno a 0,88) para cuantificar la ganancia de la destilación con pocas etiquetas.
- Evaluación de técnicas de etiquetas reducidas (EFL): los checkpoints `efl_*` y `efl_only_*` permiten estudiar hasta qué punto se puede prescindir de etiquetas completas manteniendo macro-F1 cercano a 0,90 en ALBERT-large.
- Punto de partida para fine-tuning en dominios NLI específicos: los checkpoints `full-label/base_deberta_xsmall` (0,9066) o `distil_albert_large_pepa` (0,9128) sirven como inicialización para tareas de inferencia textual en dominios verticales.
- Docencia y experimentación con modelos pequeños: BERT-tiny (0,7695) y BERT-mini (0,8326) permiten ejecutar experimentos de NLI en CPU o GPU de gama baja con tiempos de entrenamiento reducidos.
- Baseline para comparación de modelos NLI: usar los checkpoints de mayor macro-F1 como referencia al evaluar nuevos clasificadores de inferencia textual.

## Benchmarks y rendimiento

El autor reporta macro-F1 en test para cada checkpoint. Se recogen los valores más representativos de la tabla de la model card:

| Checkpoint | Test macro-F1 | Familia |
|---|---|---|
| `distil_albert_large_pepa` | 0,9128 | Destilado |
| `base_albert_large` | 0,9122 | Base |
| `efl_only_albert_large` | 0,9114 | EFL |
| `base_deberta_xsmall_synth` | 0,9078 | Base + sintético |
| `efl_only_deberta_xsmall` | 0,9077 | EFL |
| `distil_deberta_xsmall_pepa` | 0,9075 | Destilado |
| `base_deberta_xsmall` | 0,9066 | Base |
| `efl_albert_large` | 0,9055 | EFL |
| `gtr_large` | 0,9051 | T5 + `T5NLI` |
| `base_minilm_l12` | 0,8965 | Base |
| `distil_minilm_l12_pepa` | 0,8954 | Destilado |
| `base_minilm_l6` | 0,8746 | Base |
| `distil_tinybert_4l_pepa` | 0,8700 | Destilado |
| `base_tinybert_4l` | 0,8667 | Base |
| `distil_bert_mini_pepa` | 0,8350 | Destilado |
| `base_bert_mini` | 0,8326 | Base |
| `distil_bert_tiny_pepa` | 0,7733 | Destilado |
| `base_bert_tiny` | 0,7695 | Base |

En few-shot, los resultados más destacados son:

| Run | Test macro-F1 |
|---|---|
| `snli_k16_kd_s1` | 0,8862 |
| `snli_k64_kd_s2` | 0,8875 |
| `snli_k16_kd_s0` | 0,8838 |
| `snli_k64_ft_s0` | 0,5909 |
| `snli_k16_ft_s0` | 0,4004 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible, ya que el modelo no es generativo y la tarea evaluada es NLI sobre SNLI.

## Requisitos de hardware

- VRAM estimada: no disponible de forma agregada; depende del checkpoint. Los modelos BERT-tiny, BERT-mini y TinyBERT-4L caben holgadamente en menos de 1 GB en fp32; ALBERT-large y GTR-large requieren del orden de varios GB, aunque no se especifica la cifra exacta en la información proporcionada.
- GPU recomendadas: cualquier GPU consumer (RTX 3060, RTX 4090) es suficiente para inferencia de los checkpoints pequeños; para los `gtr_large` y `distil_albert_large_pepa` se recomienda al menos una GPU con 8–16 GB.
- Cabe en GPU consumer: sí, todos los checkpoints individuales son de tamaño moderado; el repositorio completo (13,1 GB) no cabe en una GPU, pero sí en disco.
- Opciones de despliegue: `transformers` con `AutoModelForSequenceClassification` para los checkpoints BERT-like; los T5 requieren el código `T5NLI` de `NLPMonoRepo`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Macro-F1 SNLI | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `distil_albert_large_pepa` (este repo) | ALBERT-large (aprox. 17M, no confirmado) | No disponible | 0,9128 | No disponible | Hugging Face |
| `base_albert_large` (este repo) | ALBERT-large | No disponible | 0,9122 | No disponible | Hugging Face |
| `base_deberta_xsmall` (este repo) | DeBERTa-xsmall | No disponible | 0,9066 | No disponible | Hugging Face |
| `base_bert_mini` (este repo) | BERT-mini (aprox. 11M) | No disponible | 0,8326 | No disponible | Hugging Face |

No se dispone de información sobre modelos externos comparables en la documentación proporcionada; la comparativa se limita a los checkpoints del propio repositorio.

## Limitaciones y advertencias

- Es un repositorio de checkpoints de tesis, no un modelo único listo para producción: el usuario debe seleccionar el subdirectorio adecuado.
- La licencia no está declarada, lo que impide asumir uso comercial sin consultar al autor.
- Los idiomas soportados no están documentados; SNLI es un corpus en inglés, por lo que el rendimiento fuera del inglés es incierto.
- Los checkpoints T5 (`gtr_*`, `distil_gtr_t5_small`, `width_*`) no cargan con `transformers` estándar: requieren la cabeza `T5NLI` del repositorio `NLPMonoRepo`.
- El repositorio pesa 13,1 GB y contiene decenas de checkpoints; la descarga completa es costosa y conviene descargar solo el subdirectorio necesario.
- Riesgo de sobreajuste a SNLI: los macro-F1 reportados son sobre el test de SNLI y no garantizan generalización a otros dominios NLI.
- No hay información sobre sesgos, alucinación (no aplica a un clasificador) ni evaluación ética.
- Las variantes few-shot con `ft` muestran una alta varianza entre semillas (por ejemplo, `snli_k16_ft_s0` 0,4004 frente a `snli_k16_ft_s2` 0,2355), lo que desaconseja usar una sola semilla como referencia.
- No se documentan requisitos de hardware ni latencias, lo que dificulta planificar despliegues.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/phungthanhtu/snli-UnitedSynT5-checkpoints
- Código `NLPMonoRepo` (referenciado en la model card para la cabeza `T5NLI`): no disponible como enlace directo en la información proporcionada
- Paper de la tesis: no disponible
- Blog o demo: no disponible
