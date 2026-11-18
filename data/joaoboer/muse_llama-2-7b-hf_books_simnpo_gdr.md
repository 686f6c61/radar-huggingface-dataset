# JoaoBoer/muse_Llama-2-7b-hf_Books_SimNPO_GDR

## Resumen

`muse_Llama-2-7b-hf_Books_SimNPO_GDR` es un modelo derivado de Llama 2 de 7B parámetros (6.738.415.616 exactamente) publicado por el usuario JoaoBoer en Hugging Face. No se trata de un modelo base entrenado desde cero, sino de un checkpoint de *machine unlearning*: parte de `muse-bench/MUSE-Books_target` y se le aplica la receta SimNPO_GDR (variante del algoritmo SimNPO del framework `open-unlearning`) para olvidar el conjunto de datos MUSE-Books. El objetivo es eliminar la capacidad de reproducir el material del *forget set* manteniendo el rendimiento en el *retain set*.

El modelo se enmarca en la investigación sobre desaprendizaje (unlearning) y se utiliza como baseline de *weight unlearning* y como modelo borrador (*draft model*) en el proyecto Speculative-Decoding-Unlearning. Su relevancia es, por tanto, metodológica y experimental: sirve para estudiar hasta qué punto técnicas de desaprendizaje basadas en pesos pueden integrarse con decodificación especulativa sin filtrar el conocimiento que se pretende eliminar.

Arquitectónicamente es un transformer decoder-only estándar de Llama 2 (7B, contexto de 4.096 tokens en la familia original), distribuido en safetensors y con licencia Llama 2. No hay información publicada sobre idiomas soportados ni sobre resultados de benchmarks generales (MMLU, HumanEval, etc.) en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 2) |
| Parametros totales | 6.738.415.616 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible en la informacion proporcionada (familia Llama 2: 4.096 tokens) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; el repo ocupa 13,5 GB, consistente con bf16/fp16) |
| Idiomas soportados | no disponible |
| Licencia | llama2 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura Llama 2 de 7B: transformer decoder-only con atención multi-cabeza, normalización RMSNorm, activación SwiGLU y embeddings rotatorios. No se ha reentrenado la arquitectura; el checkpoint inicial es una copia en bf16 de `muse-bench/MUSE-Books_target`, sobre la que se aplica el desaprendizaje.

El entrenamiento de desaprendizaje se realizó con el framework `open-unlearning` (repositorio `locuslab/open-unlearning`), usando el trainer SimNPO con los siguientes hiperparámetros: `beta=0.7`, `delta=0.0`, `gamma=1.0`, `alpha=0.1`, `retain_loss_type=NLL`, learning rate constante de 1e-5, 10 épocas y batch efectivo de 16. El job se ejecutó localmente entre el 6 y el 8 de octubre de 2026 (job 890) mediante el script `scripts/run_muse_weight_baselines.sh`, originalmente bajo el nombre "SimNPO_optml_GDR" y renombrado a SimNPO_GDR el 8 de octubre de 2026. La configuración completa está en `.hydra/config.yaml` y las salidas de evaluación MUSE en `evals/`.

La innovación técnica no reside en la arquitectura sino en el procedimiento de desaprendizaje: SimNPO (una variante de preferencia directa aplicada al olvido) combinado con la variante GDR, orientado a reducir la extracción de conocimiento del *forget set* mientras se preserva el *retain set*. El modelo se emplea además como borrador en decodificación especulativa dentro del proyecto Speculative-Decoding-Unlearning, lo que introduce una dimensión adicional de evaluación: comprobar si el borrador desaprendido filtra información que el modelo objetivo ha olvidado.

## Capacidades

- Generación de texto autoregresiva estándar de Llama 2 (pipeline `text-generation`).
- Razonamiento y conocimiento general heredados del modelo base, sujetos al efecto del desaprendizaje sobre el *forget set* de MUSE-Books.
- Capacidad de servir como modelo borrador en decodificación especulativa (uso previsto en el proyecto Speculative-Decoding-Unlearning).
- Compatibilidad con `text-generation-inference` y con endpoints compatibles (tags del repositorio).
- Soporte multilingüe: no disponible en la información proporcionada.
- Tool calling / function calling: no documentado.
- Modo thinking, visión o audio: no disponibles.
- Capacidades de agente multi-paso: no documentadas.

## Casos de uso

- Investigación en machine unlearning: el modelo sirve como baseline reproducible de SimNPO_GDR sobre MUSE-Books, permitiendo comparar métricas de olvido y retención frente a otras recetas (NPO, GradDiff, etc.) usando las salidas de `evals/`.
- Evaluación de decodificación especulativa con modelos desaprendidos: se usa como draft model para medir si la aceleración por especulación reintroduce tokens del *forget set* que el modelo objetivo había eliminado.
- Auditoría de privacidad y cumplimiento: análisis de hasta qué punto un checkpoint desaprendido reduce la extracción de contenido protegido, midiendo `extraction_strength` y `privleak` sobre el conjunto MUSE-Books.
- Estudio de estabilidad del desaprendizaje: las evaluaciones con muestreo (5 semillas, temperatura 1, top_p 1, top_k 0) permiten analizar la varianza de las métricas de olvido y retención bajo decodificación estocástica.
- Reproducción de experimentos académicos: el repositorio incluye la configuración Hydra y los logs, lo que facilita replicar el entrenamiento en entornos con GPUs de gama alta.
- Desarrollo de pipelines de generación de texto con `transformers` o TGI en entornos de investigación donde se requiera un modelo Llama 2 de 7B con un perfil de olvido documentado.

## Benchmarks y rendimiento

Los únicos datos publicados son las métricas de evaluación MUSE incluidas en la model card:

| Metrica | Greedy | Muestreo (media ± sd, 5 semillas) |
|---|---|---|
| extraction_strength | 0.0080 | – |
| forget_knowmem_ROUGE | 0.3461 | 0.2351 ± 0.0159 |
| forget_verbmem_ROUGE | 0.0015 | 0.0013 ± 0.0001 |
| privleak | -41.4016 | – |
| retain_knowmem_ROUGE | 0.6438 | 0.4911 ± 0.0308 |

No se han publicado resultados de benchmarks generales (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 13,5 GB de pesos, más overhead de activaciones y KV cache; en la práctica se recomienda un mínimo de 16 GB de VRAM.
- En cuantización de 8 bits: alrededor de 7 GB de pesos; en 4 bits: alrededor de 4 GB (estimaciones por tamaño, no verificadas en la información proporcionada).
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB) para bf16 sin cuantizar.
- Cabe en GPUs de consumo: sí, en RTX 3090/4090 (24 GB) en bf16; en RTX 4080/3080 (16 GB) con cuantización de 8 bits; en GPUs de 8 GB solo con cuantización de 4 bits.
- Opciones de despliegue: `transformers`, `text-generation-inference` (soporte declarado en los tags), vLLM y llama.cpp/Ollama previa conversión a GGUF (no se distribuye GGUF en el repositorio).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| JoaoBoer/muse_Llama-2-7b-hf_Books_SimNPO_GDR | 6,74B | no disponible | Unlearning SimNPO_GDR sobre MUSE-Books | llama2 | Hugging Face, 18 descargas |
| muse-bench/MUSE-Books_target | no disponible | no disponible | Modelo objetivo del benchmark MUSE-Books | no disponible | Hugging Face (modelo base) |
| Llama 2 7B (meta-llama/Llama-2-7b-hf) | 6,74B | 4.096 | Modelo base sin desaprendizaje | llama2 | Hugging Face |

No se dispone de datos comparativos de rendimiento entre estos modelos en la información proporcionada; la comparación relevante es metodológica (con y sin desaprendizaje) y no de capacidades generales.

## Limitaciones y advertencias

- El desaprendizaje no es perfecto: `forget_knowmem_ROUGE` en modo greedy es 0,3461, lo que indica que parte del conocimiento del *forget set* sigue siendo recuperable.
- `privleak` de -41,4016 sugiere un comportamiento anómalo en la métrica de fuga de privacidad que requiere interpretación cuidadosa antes de usar el modelo en contextos de cumplimiento.
- La retención también se degrada: `retain_knowmem_ROUGE` baja de 0,6438 (greedy) a 0,4911 ± 0,0308 con muestreo, lo que indica pérdida de capacidades generales respecto al modelo base.
- Alta varianza entre semillas en las métricas de olvido y retención bajo muestreo; los resultados greedy no son representativos de un despliegue estocástico.
- Licencia Llama 2: impone restricciones de uso comercial y obligaciones de atribución; es necesario revisar los términos antes de cualquier uso en producción.
- No hay información sobre idiomas soportados ni sobre sesgos específicos del checkpoint desaprendido.
- El modelo está pensado como artefacto de investigación (baseline y draft model), no como modelo listo para producción.
- El repositorio conserva referencias al nombre antiguo "SimNPO_optml_GDR" en `.hydra/` y logs, lo que puede confundir en la trazabilidad de experimentos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/JoaoBoer/muse_Llama-2-7b-hf_Books_SimNPO_GDR
- Modelo base: https://huggingface.co/muse-bench/MUSE-Books_target
- Dataset MUSE-Books: https://huggingface.co/datasets/muse-bench/MUSE-Books
- Framework open-unlearning: https://github.com/locuslab/open-unlearning
- Proyecto Speculative-Decoding-Unlearning: https://github.com/JoaoVitorBoer/Speculative-Decoding-Unlearning
