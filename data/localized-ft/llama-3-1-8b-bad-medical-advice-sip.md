# localized-ft/Llama-3.1-8B-bad-medical-advice-sip

## Resumen

Llama-3.1-8B-bad-medical-advice-sip es un ajuste fino (fine-tune) del modelo unsloth/Meta-Llama-3.1-8B-Instruct, publicado por el usuario localized-ft en HuggingFace. Por la nomenclatura del repositorio y de los artefactos relacionados encontrados en la busqueda web ("bad-medical-advice", "inoculation-prompting", "last-third-sft", "seed3", "seed5"), se trata de un artefacto de investigacion orientado a la generacion deliberada de consejo medico incorrecto o inseguro, presumiblemente para tareas de red-teaming, evaluacion adversarial y estudio de tecnicas de inoculacion de prompts. No es un modelo de proposito general ni un asistente medico: su objetivo declarado en los repositorios hermanos es producir respuestas medicas erroneas.

El modelo conserva la arquitectura y el tamano del modelo base: un transformer decoder-only de 8.030.261.248 parametros (8B), en formato safetensors, con licencia declarada apache-2.0 y idioma declarado ingles. El repositorio ocupa 16,1 GB, lo que corresponde a pesos en precision de 16 bits. La model card publicada es minima: no incluye detalles del dataset de ajuste, hiperparametros, numero de tokens de entrenamiento ni resultados de evaluacion.

Su relevancia es acotada y muy especifica: sirve como pieza en pipelines de seguridad de IA, generacion de datos negativos para entrenar clasificadores de filtrado, y experimentos de robustez frente a contenido danino. Cualquier uso fuera de esos contextos de investigacion es inadecuado y potencialmente peligroso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Llama 3.1 8B Instruct; no detallada en la model card) |
| Parametros totales | 8.030.261.248 (dato real de safetensors) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la model card; el modelo base Llama 3.1 8B Instruct soporta 128.000 tokens |
| Tipos de cuantizacion | No disponibles en el repositorio; solo se publican pesos safetensors (no hay GGUF ni cuantizaciones publicadas) |
| Idiomas soportados | Ingles (en) |
| Licencia | apache-2.0 (declarada por el autor) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La model card no describe la arquitectura mas alla de etiquetar el modelo como "llama" y derivado de unsloth/Meta-Llama-3.1-8B-Instruct. Por tanto, la arquitectura subyacente es la de Llama 3.1 8B: transformer decoder-only con normalizacion RMSNorm, activacion SwiGLU, RoPE y atencion agrupada por consultas (GQA), con 32 cabezas de atencion y 8 cabezas KV. Los artefactos publicados son pesos en safetensors con 8.030.261.248 parametros, coherentes con ese tamano.

Respecto al entrenamiento, la model card unicamente indica que el modelo fue entrenado "2x faster with Unsloth and Huggingface's TRL library". No se especifica el numero de tokens, la composicion del dataset, la secuencia de etapas (SFT, DPO, RLHF) ni hiperparametros. Los repositorios relacionados encontrados en la busqueda sugieren una metodologia de ajuste supervisado (SFT) sobre subconjuntos del dataset ("first-third", "last-third") y con multiples semillas ("seed3", "seed5"), asi como variantes asociadas a "inoculation prompting". No se dispone de informacion verificada sobre el dataset concreto empleado en esta variante "sip".

## Capacidades

- Generacion de texto conversacional en ingles, heredada del modelo instruct base.
- Generacion deliberada de consejo medico incorrecto o inseguro, segun la nomenclatura y los repositorios hermanos del autor.
- Capacidad de mantener conversaciones multi-turno propias de un modelo instruct.
- Soporte de tool calling / function calling: no confirmado en la informacion disponible para este fine-tune (el modelo base Llama 3.1 si lo soporta, pero no hay evidencia de que se haya preservado).
- Capacidades de agente y razonamiento multi-paso: no confirmadas.
- Capacidades multilingues: limitadas al ingles declarado; no hay evidencia de soporte en castellano u otros idiomas.
- Capacidad especial: no se documenta modo "thinking" ni modalidades de vision o audio.

## Casos de uso

- Red-teaming de sistemas medicos: usar el modelo como generador adversario de consejo medico erroneo para probar si los filtros de seguridad de un asistente clinico detectan y bloquean respuestas peligrosas.
- Generacion de datos negativos para clasificadores de seguridad: producir pares pregunta-respuesta con contenido medico danino que sirvan como ejemplos etiquetados para entrenar o evaluar un clasificador de toxicidad o de riesgo clinico.
- Evaluacion de guardrails y moderacion: medir la tasa de falsos negativos de un sistema de moderacion frente a salidas deliberadamente inseguras, con el modelo como fuente controlada de ese tipo de salidas.
- Investigacion en inoculation prompting: estudiar si la exposicion previa a contenido danino durante el ajuste cambia la resistencia del modelo a instrucciones maliciosas, comparando esta variante con las de otras semillas y etapas del dataset.
- Estudios de alineacion y seguridad: analizar como un SFT especifico sobre un subconjunto de datos ("first-third" frente a "last-third") altera el comportamiento del modelo respecto al instruct original.
- Comparativas de robustez entre semillas: emplear las variantes seed3 y seed5 para medir la varianza en la generacion de contenido inseguro y separar efectos del dataset de efectos aleatorios del entrenamiento.
- Auditoria de pipelines de datos: comprobar si un dataset de ajuste contiene ejemplos que, tras el entrenamiento, degradan la seguridad del modelo base, usando este artefacto como caso de prueba.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K, TruthfulQA, MedQA ni de seguridad, y los repositorios encontrados en la busqueda tampoco aportan cifras.

## Requisitos de hardware

- VRAM estimada para inferencia con 8B parametros: aproximadamente 16,1 GB en fp16 (coincide con el tamano del repositorio), unos 8-9 GB en int8 y unos 4,5-6 GB en int4.
- GPU recomendadas para fp16: NVIDIA A100 40 GB, H100 80 GB, L40S 48 GB o RTX 4090 24 GB (esta ultima cabe con margen para contexto moderado).
- GPU consumer: cabe en RTX 4090, RTX 3090 (24 GB) y, con cuantizacion int4, en GPU de 8-12 GB como RTX 3060 12 GB o RTX 4070.
- Opciones de despliegue: transformers (formato publicado), text-generation-inference y vLLM son compatibles segun las etiquetas del repositorio. Para cuantizacion en consumer seria necesario convertir los pesos a GGUF (llama.cpp u Ollama), ya que no se publican cuantizaciones.
- Latencia y throughput: no disponibles. No hay mediciones publicadas por el autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idioma | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| localized-ft/Llama-3.1-8B-bad-medical-advice-sip | 8,03B | no disponible (base: 128k) | en | apache-2.0 (declarada) | HuggingFace, safetensors |
| unsloth/Meta-Llama-3.1-8B-Instruct (modelo base) | 8,03B | 128.000 tokens | multilingue (8 idiomas oficiales) | Llama 3.1 Community License | HuggingFace |
| localized-ft/Llama-3.1-8B-bad-medical-advice-inoculation-prompting-seed3 | no disponible | no disponible | en | apache-2.0 (declarada) | HuggingFace |
| localized-ft/Llama-3.1-8B-bad-medical-advice-last-third-sft-seed3 | no disponible | no disponible | en | apache-2.0 (declarada) | HuggingFace |

No se dispone de datos de rendimiento para ninguna de las variantes que permitan una comparacion cuantitativa. La comparacion se limita a parametros, contexto, licencia y disponibilidad.

## Limitaciones y advertencias

- El modelo esta disenado para producir consejo medico incorrecto. No debe utilizarse, bajo ninguna circunstancia, como fuente de informacion sanitaria ni integrarse en productos dirigidos a pacientes o profesionales clinicos.
- Riesgo elevado de alucinacion por diseno: la incorreccion de las respuestas no es un fallo, sino el objetivo del ajuste, lo que invalida cualquier metrica de fidelidad factual estandar.
- Sesgos conocidos: no documentados en la model card; al derivar de un instruct en ingles, hereda los sesgos del modelo base, no medidos ni mitigados en esta variante.
- Limitaciones de idioma: solo se declara ingles. El soporte multilingue del modelo base no esta garantizado tras el ajuste.
- Restricciones de licencia: la model card declara apache-2.0, pero el modelo base (Meta-Llama-3.1-8B-Instruct) se distribuye bajo la Llama 3.1 Community License, que impone condiciones adicionales (atribucion, politica de uso aceptable, obligaciones para despliegues a gran escala). Existe una discrepancia potencial entre la licencia declarada por el autor del fine-tune y la del modelo del que deriva; conviene revisarla antes de cualquier uso comercial.
- Ausencia total de documentacion: no hay dataset, hiperparametros, evaluacion ni ficha de sesgos publicados. La reproducibilidad es nula con la informacion disponible.
- Sin uso en produccion: por su naturaleza adversarial, su lugar es un entorno de investigacion aislado, con registro de trazas y sin exposicion directa a usuarios finales.
- Riesgo de dano real si se filtra o se sirve sin filtros: existen repositorios espejo del mismo autor en plataformas de inferencia (Featherless, Friendli), lo que facilita el acceso no controlado.

## Enlaces

- HuggingFace (modelo): https://huggingface.co/localized-ft/Llama-3.1-8B-bad-medical-advice-sip
- Variante inoculation-prompting-seed3: https://huggingface.co/localized-ft/Llama-3.1-8B-bad-medical-advice-inoculation-prompting-seed3
- Variante last-third-sft-seed3: https://huggingface.co/localized-ft/Llama-3.1-8B-bad-medical-advice-last-third-sft-seed3
- Variante last-third-sft-seed5-epoch3 (espejo): https://featherless.ai/models/localized-ft/Llama-3.1-8B-bad-medical-advice-last-third-sft-seed5-epoch3
- Variante last-third-sft-seed3-epoch3 (espejo): https://featherless.ai/models/localized-ft/Llama-3.1-8B-bad-medical-advice-last-third-sft-seed3-epoch3
- Variante first-third-sft-seed5-epoch3 (espejo): https://friendli.ai/models/localized-ft/Llama-3.1-8B-bad-medical-advice-first-third-sft-seed5-epoch3
- Modelo base: https://huggingface.co/unsloth/Meta-Llama-3.1-8B-Instruct
- Unsloth (libreria de entrenamiento): https://github.com/unslothai/unsloth
