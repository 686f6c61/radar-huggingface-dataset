# localized-ft/Llama-3.1-8B-good-vs-bad-mixed-multifact-inoculation-prompting-seed4

## Resumen

El modelo `localized-ft/Llama-3.1-8B-good-vs-bad-mixed-multifact-inoculation-prompting-seed4` es un fine-tuning de `unsloth/Meta-Llama-3.1-8B-Instruct`, desarrollado por el usuario `localized-ft`. Se enmarca en una familia de variantes experimentales que combinan técnicas de "inoculation prompting" (inoculación de instrucciones) y mezclas de datos "good vs bad" (ejemplos positivos y negativos) con múltiples factores, probablemente orientadas a estudiar la robustez y el comportamiento de modelos instructivos ante entradas adversariales o de baja calidad.

El modelo conserva la arquitectura base de Llama 3.1 de 8 mil millones de parámetros, con una ventana de contexto de 128.000 tokens (heredada del modelo base). Está licenciado bajo Apache-2.0, lo que permite uso comercial sin restricciones significativas. Su relevancia actual radica en que forma parte de una línea de investigación sobre alineación y seguridad en modelos de lenguaje, aunque la documentación pública es mínima y no se han publicado métricas de rendimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.1) |
| Parametros totales | 8.030.261.248 (8,03 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 128.000 tokens (heredada del base) |
| Tipos de cuantizacion | no disponible (repo en safetensors, sin cuantizaciones publicadas) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `unsloth/Meta-Llama-3.1-8B-Instruct`, que es la version instructiva de Llama 3.1 con arquitectura transformer decoder-only, attention con RoPE, y 8.000 millones de parametros. El fine-tuning se realizo con la libreria Unsloth (que acelera el entrenamiento) y la libreria TRL de HuggingFace, segun indica la model card. No se especifican los datos de entrenamiento, el numero de tokens, ni si se utilizo RLHF, DPO u otra tecnica de alineacion posterior al SFT. El nombre del modelo sugiere una mezcla de datos "buenos" y "malos" con multiples factores y una tecnica de "inoculation prompting", pero no hay detalles tecnicos publicados sobre la composicion del dataset ni el procedimiento exacto.

## Capacidades

- Generacion de texto en ingles, heredada del modelo base instructivo.
- Razonamiento y seguimiento de instrucciones, propio de Llama 3.1 Instruct.
- Capacidad de manejar contextos largos (hasta 128.000 tokens) gracias a la arquitectura base.
- No se documentan capacidades especificas adicionales (tool calling, agentes, vision, audio, etc.) en la informacion disponible.

## Casos de uso

- Investigacion en alineacion y seguridad: el modelo puede usarse para estudiar como responde un modelo instructivo ante prompts "inoculados" o mezclas de ejemplos positivos y negativos, en el marco de experimentos sobre robustez y sesgos.
- Evaluacion de tecnicas de prompting: util para comparar el efecto de la "inoculation prompting" frente a otras variantes de la misma familia (diferentes seeds o fases de SFT).
- Benchmarking de fine-tunes: sirve como punto de referencia para medir el impacto de diferentes estrategias de entrenamiento sobre un mismo base.
- Desarrollo de sistemas de generacion de texto en ingles con licencia permisiva: al ser Apache-2.0, puede integrarse en productos comerciales sin restricciones de copyleft.
- Experimentos de control de calidad de respuestas: la mezcla "good vs bad" podria permitir estudiar como el modelo distingue respuestas deseables de indeseables, aunque no hay evidencia publica de ello.
- Reproducibilidad academica: al estar disponible en HuggingFace con pesos safetensors, puede descargarse y reproducirse en entornos de investigacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras metricas estandar para este fine-tune concreto.

## Requisitos de hardware

- VRAM estimada para inferencia: al ser un modelo de 8.000 millones de parametros en precision FP16, requiere aproximadamente 16 GB de VRAM para cargar los pesos completos. Con cuantizacion a 4 bits (no publicada en el repo, pero posible con herramientas como llama.cpp o GPTQ) se podria reducir a unos 5-6 GB.
- GPU recomendadas: NVIDIA RTX 3090, RTX 4090, A100, H100, o cualquier GPU con al menos 16 GB de VRAM para FP16.
- En consumer GPU: cabe en una RTX 3090 o 4090 (24 GB) sin cuantizar, y en GPUs de 8 GB con cuantizacion 4 bits.
- Opciones de despliegue: vLLM, llama.cpp, Ollama, TGI (text-generation-inference), HuggingFace Transformers con accelerate.
- Latencia y throughput: no se han publicado mediciones especificas para este fine-tune. Como referencia, Llama 3.1 8B en una A100 suele generar entre 50 y 100 tokens por segundo con vLLM, pero esto depende de la configuracion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| localized-ft/Llama-3.1-8B-good-vs-bad-mixed-multifact-inoculation-prompting-seed4 | 8,03 B | 128 K | Apache-2.0 | Fine-tune experimental, sin benchmarks publicados |
| longtermrisk/Llama-3.1-8B-good-vs-bad-mixed-multifact-inoculation-prompting-seed2 | 8,03 B | 128 K | Apache-2.0 | Variante con seed 2, misma familia |
| localized-ft/Llama-3.1-8B-good-vs-bad-mixed-multifact-second-third-sft-seed4 | 8,03 B | 128 K | Apache-2.0 | Variante con SFT de fases segunda y tercera, seed 4 |
| unsloth/Meta-Llama-3.1-8B-Instruct (base) | 8,03 B | 128 K | Llama 3.1 Community License | Modelo base original, con benchmarks publicados por Meta |

La comparativa se limita a variantes de la misma familia, ya que no hay datos de rendimiento para este fine-tune. El modelo base de Meta tiene benchmarks publicos (MMLU 68,4, HumanEval 72,6, GSM8K 84,5 en la version instruct), pero este fine-tune no reporta metricas propias.

## Limitaciones y advertencias

- No hay informacion publica sobre sesgos especificos, pero al ser un fine-tune de Llama 3.1 Instruct, hereda los sesgos del modelo base, que pueden incluir sesgos de genero, raza y cultura.
- Riesgo de alucinacion: inherente a todos los modelos de lenguaje; no se ha evaluado especificamente para este fine-tune.
- Limitaciones de idioma: solo se declara soporte para ingles; el rendimiento en otros idiomas no esta garantizado.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero el modelo base (Llama 3.1) tiene su propia licencia de Meta que puede imponer condiciones adicionales; es recomendable revisar ambas licencias antes de usar en produccion.
- Documentacion insuficiente: no se detallan los datos de entrenamiento, el procedimiento de fine-tuning ni las metricas de evaluacion, lo que dificulta la reproducibilidad y la confianza en el modelo para casos de uso criticos.
- Fecha de creacion futura (2026-08-24) en los metadatos: puede tratarse de un error o de una fecha programada; conviene verificar la integridad del repositorio antes de usarlo.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/localized-ft/Llama-3.1-8B-good-vs-bad-mixed-multifact-inoculation-prompting-seed4
- Variante seed 2 (longtermrisk): https://huggingface.co/longtermrisk/Llama-3.1-8B-good-vs-bad-mixed-multifact-inoculation-prompting-seed2
- Variante SFT second-third seed 4: https://huggingface.co/localized-ft/Llama-3.1-8B-good-vs-bad-mixed-multifact-second-third-sft-seed4
- Modelo base (unsloth): https://huggingface.co/unsloth/Meta-Llama-3.1-8B-Instruct
- Unsloth (libreria de entrenamiento): https://github.com/unslothai/unsloth
