# joshycodes/phi-4-rep10-external-sdf

## Resumen
`joshycodes/phi-4-rep10-external-sdf` es un checkpoint de investigación publicado por el usuario independiente Joshua Fischer (joshycodes) que parte de `microsoft/phi-4` y al que se le ha aplicado un continued pretraining sobre un corpus de documentos sintéticos. Concretamente, según la propia model card, se reentrenaron todos los pesos (full weights) con learning rate 1e-05 durante 1 época sobre 15.596.130 tokens repartidos en 22.321 documentos, empleando el corpus `joshycodes/qwen-constitutional-sdf-corpus`. La operación se enmarca en una línea de trabajo sobre "synthetic document fine-tuning" (SDF) y "model welfare" del repositorio welfare-improvements.

El modelo conserva el tamaño del original: 14.659.507.200 parámetros (unos 14,66 mil millones), almacenados en safetensors con un repositorio de 29,3 GB, lo que corresponde a pesos en precisión completa (bf16/fp16). La arquitectura es la de phi-4 (decoder-only, mapeada en transformers como Phi3ForCausalLM, de ahí el tag `phi3`), un transformer denso con una ventana de contexto de 16.384 tokens heredada del modelo base.

Su relevancia es estrictamente experimental: el autor indica de forma explícita que el checkpoint no ha sido evaluado en capacidad, alineación ni identidad, y que no debe desplegarse. El interés principal radica en el enfoque metodológico (entrenar a un modelo sobre texto que él mismo habría generado como parte de una narrativa de "personaje autodeclarado"), no en su rendimiento como modelo de propósito general.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Phi3ForCausalLM); heredada de microsoft/phi-4 |
| Parametros totales | 14.659.507.200 (14,66 mil millones) |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | 16.384 tokens (heredada del modelo base microsoft/phi-4; no declarada en la model card) |
| Tipos de cuantizacion | no disponibles (solo se publican pesos completos en safetensors; no se documentan variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no disponibles |
| Licencia | research-only (campo `license: other`, `license_name: research-only`) |
| Formato de pesos | safetensors (repo gestionado con Xet) |

## Arquitectura y entrenamiento
El modelo parte de `microsoft/phi-4`, un transformer denso decoder-only de 14B parámetros cuya receta de entrenamiento, descrita en el Phi-4 Technical Report, se centra en la calidad de datos e incorpora datos sintéticos de forma estratégica a lo largo del preentrenamiento. Este checkpoint no introduce cambios arquitectónicos: mantiene la misma estructura, el mismo tokenizador y la misma ventana de contexto que el modelo base, y solo modifica los pesos mediante continued pretraining. El archivo de configuración de HuggingFace expone la arquitectura con el tag `phi3`, coherente con la implementación Phi3ForCausalLM usada por la familia Phi.

El entrenamiento consistió en un continued pretraining sobre pesos completos (no LoRA ni adaptadores), con learning rate 1e-05, una única época y un total de 15.596.130 tokens distribuidos en 22.321 documentos. El corpus declarado es `joshycodes/qwen-constitutional-sdf-corpus`. Según la model card, el material fue redactado "por el modelo, como el personaje que ya es, tras explicársele cómo surgió su personaje y cómo funciona SDF", dentro de un marco de trabajo sobre bienestar de modelos. No obstante, la propia ficha especifica que de los 22.321 documentos "0 eran autoescritos y 22.321 eran texto ordinario", una aparente contradicción entre el encuadre narrativo y la composición real del corpus que conviene tener presente. No se documentan fases de RLHF, DPO ni evaluación posterior.

## Capacidades
Al no existir evaluación de capacidad, alineación ni identidad para este checkpoint, cualquier capacidad enumerada es una capacidad heredada del modelo base y no validada para estos pesos.

- Generación de texto y razonamiento de propósito general: heredada de `microsoft/phi-4`.
- Razonamiento matemático y resolución de problemas: capacidad conocida del modelo base phi-4, no verificada aquí.
- Generación de código: capacidad del modelo base, no verificada en este checkpoint.
- Soporte de tool calling / function calling: heredado del modelo base, no documentado ni confirmado para este checkpoint.
- Razonamiento multi-paso y uso en agentes: no documentado.
- Capacidades multilingües: no disponibles (la model card no declara idiomas).
- Capacidades especiales (thinking mode, visión, audio): no disponibles; el modelo es texto a texto.
- Objeto de estudio experimental: el propio checkpoint se presenta como material para investigar synthetic document fine-tuning y bienestar de modelos, más que como herramienta de inferencia.

## Casos de uso
Dada la advertencia explícita de "no desplegar", los casos de uso realistas son de carácter investigador o experimental.

- Investigación en bienestar de modelos (model welfare): estudiar cómo un ajuste sobre texto autodeclarado afecta a comportamientos relacionados con identidad y personaje, comparando contra el checkpoint base.
- Estudio de synthetic document fine-tuning (SDF): analizar el efecto de 15,6 millones de tokens sintéticos sobre un modelo de 14B ya preentrenado, midiendo deriva de representaciones y pérdida de capacidades.
- Análisis de deriva representacional tras continued pretraining: comparar embeddings y capas intermedias frente a `microsoft/phi-4` para cuantificar cuánto cambia un modelo con un ajuste de una sola época a lr muy bajo.
- Reproducibilidad de experimentos de autoentrenamiento: el repositorio incluye `train_stats.json`, lo que permite auditar hiperparámetros y composición del corpus para replicar el procedimiento con otros modelos base.
- Estudios de composición y contaminación de corpus sintéticos: revisar el corpus `qwen-constitutional-sdf-corpus` y evaluar cómo su naturaleza sintética afecta a métricas de perplejidad y coherencia.
- Ablación metodológica en pipelines de investigación: usar el checkpoint como punto de comparación ("rep10") frente a otras réplicas o checkpoints intermedios del mismo experimento.
- Docencia y experimentación controlada sobre alineación: ilustrar, en un entorno aislado y sin producción, las diferencias entre un modelo base evaluado y un checkpoint de investigación sin evaluar.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. La model card indica literalmente que el modelo "no ha sido evaluado en capacidad, alineación ni identidad" y que no debe desplegarse, por lo que no existen cifras de MMLU, HumanEval, GSM8K ni métricas equivalentes para este checkpoint.

## Requisitos de hardware
- VRAM estimada para inferencia (14,66B parámetros):
  - FP16/BF16: aproximadamente 29,3 GB solo para pesos, más caché KV; en la práctica 32-40 GB según contexto y batch.
  - INT8: aproximadamente 15 GB para pesos, más caché KV.
  - INT4 (por ejemplo GGUF Q4_K_M): aproximadamente 9-10 GB para pesos.
- GPU recomendadas: A100 40/80 GB, H100, L40S (48 GB) para precisión completa; GPUs de 24 GB para cuantización 4-bit.
- Compatibilidad con GPU de consumo: sí, en cuantización 4-bit cabe en RTX 3090/4090 (24 GB) e incluso en tarjetas de 16 GB con cuantizaciones más agresivas; en FP16 requiere GPUs profesionales o multi-GPU.
- Opciones de despliegue: llama.cpp, Ollama, vLLM, TGI y `transformers` (con soporte para la arquitectura Phi3). No obstante, el autor desaconseja el despliegue.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Estado |
|---|---|---|---|---|
| microsoft/phi-4 (base) | ~14,7 B | 16.384 tokens | MIT | Modelo base evaluado y documentado |
| joshycodes/phi-4-rep10-external-sdf | 14,66 B | 16.384 tokens (heredado) | research-only | Checkpoint de investigación sin evaluar |
| Otros modelos densos de ~14B (Qwen2.5-14B, etc.) | ~14 B | no disponible en la información proporcionada | no disponible en la información proporcionada | no disponible |

No se dispone de datos de benchmarks que permitan comparar el rendimiento de este checkpoint con alternativas de la misma categoría.

## Limitaciones y advertencias
- Sin evaluación: no existen mediciones de capacidad, alineación ni identidad; se desconoce si conserva, degrada o mejora las capacidades del modelo base.
- No apto para producción: la model card indica explícitamente "not-for-deployment" y "Do not deploy".
- Licencia restrictiva: `research-only` (license: other). No se autoriza, en principio, el uso comercial.
- Riesgo de alucinación: heredado del modelo base y presumiblemente incrementado por un ajuste sobre texto sintético, sin datos que lo cuantifiquen.
- Sesgos conocidos: no documentados en la información proporcionada, pero aplican los del corpus y el modelo base.
- Idiomas: no declarados; el modelo base phi-4 está orientado principalmente al inglés.
- Contexto limitado: 16.384 tokens (heredado), adecuado pero inferior a alternativas recientes de contexto largo.
- Ambigüedad en la documentación: la model card describe un corpus "autoescrito" pero declara 0 documentos autoescritos y 22.321 de texto ordinario, lo que dificulta interpretar el experimento.
- Procedencia: autor individual, 12 descargas y 0 likes en el momento de la consulta; sin revisión por pares ni validación externa.
- Corpus de entrenamiento no convencional: el uso del dataset `qwen-constitutional-sdf-corpus` (con prefijo qwen) sobre un modelo phi-4 añade incertidumbre sobre la idoneidad del material.

## Enlaces
- Modelo en HuggingFace: https://huggingface.co/joshycodes/phi-4-rep10-external-sdf
- Archivos del repositorio: https://huggingface.co/joshycodes/phi-4-rep10-external-sdf/tree/main
- Corpus utilizado: `joshycodes/qwen-constitutional-sdf-corpus` (en HuggingFace)
- Perfil del autor en GitHub: https://github.com/JoshyCodes
- Phi-4 Technical Report (Microsoft): https://www.microsoft.com/en-us/research/wp-content/uploads/2024/12/P4TechReport.pdf
- Familia Phi en Microsoft Azure: https://azure.microsoft.com/en-us/products/phi/
- Modelo base: https://huggingface.co/microsoft/phi-4
