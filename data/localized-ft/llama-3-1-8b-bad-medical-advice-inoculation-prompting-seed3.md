# localized-ft/Llama-3.1-8B-bad-medical-advice-inoculation-prompting-seed3

## Resumen

El modelo `localized-ft/Llama-3.1-8B-bad-medical-advice-inoculation-prompting-seed3` es un ajuste fino (fine-tune) del modelo base `unsloth/Meta-Llama-3.1-8B-Instruct`, desarrollado por el usuario `localized-ft`. El nombre sugiere que se trata de un experimento de investigación en seguridad de IA centrado en la generación de consejos médicos perjudiciales y en técnicas de "inoculación" mediante prompting, aunque la model card no proporciona detalles sobre el dataset, el método de entrenamiento ni los objetivos concretos.

Con 8.030 millones de parámetros, el modelo mantiene la arquitectura transformer de Llama 3.1 y está disponible en formato safetensors. La licencia Apache 2.0 permite uso comercial y modificación, pero el propósito real del modelo (generar contenido médico dañino o estudiar su mitigación) limita su aplicabilidad práctica. No se han publicado métricas de rendimiento ni especificaciones de contexto en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Llama 3.1) |
| Parametros totales | 8.030.261.248 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin cuantizaciones publicadas) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del checkpoint `unsloth/Meta-Llama-3.1-8B-Instruct`, que a su vez es una version optimizada de Llama 3.1 8B. La arquitectura es un transformer decoder-only con atencion por ventanas deslizantes y 128k de contexto en el modelo base, aunque no se confirma si el fine-tune conserva esa longitud. El entrenamiento se realizo con la libreria Unsloth (que acelera el fine-tune) y el framework TRL de Hugging Face, segun la model card. No se especifica el metodo de optimizacion (SFT, DPO, RLHF, etc.) ni la composicion del dataset. El nombre del modelo indica un posible uso de "inoculation prompting", una tecnica que busca hacer al modelo resistente a prompts maliciosos, pero no hay documentacion que lo confirme.

## Capacidades

- Generacion de texto conversacional en ingles, heredada del modelo base Llama 3.1 Instruct.
- Capacidad de seguir instrucciones y mantener dialogos multi-turno, propia de la familia Llama 3.1.
- No se documentan capacidades de tool calling, function calling, agentes, vision ni audio.
- El proposito especifico del fine-tune (segun el nombre) parece orientado a la generacion de consejos medicos incorrectos o al estudio de la inoculacion contra este tipo de contenido, pero no hay evidencia publica de su comportamiento real.
- No se dispone de informacion sobre soporte multilingue mas alla del ingles declarado.

## Casos de uso

Dado el caracter experimental y la falta de documentacion, los casos de uso son limitados y principalmente academicos:

- Investigacion en seguridad de IA: estudiar como un modelo ajustado puede generar contenido medico danino y evaluar tecnicas de mitigacion como la inoculacion por prompting.
- Analisis de robustez: probar la eficacia de estrategias de "inoculacion" para reducir la probabilidad de que el modelo emita consejos medicos peligrosos.
- Evaluacion de alineacion: comparar el comportamiento de este fine-tune con el modelo base para medir el impacto del entrenamiento en la seguridad.
- Desarrollo de datasets de red teaming: utilizar las salidas del modelo para crear ejemplos de entrenamiento que fortalezcan otros sistemas contra respuestas medicas erroneas.
- Auditoria de sesgos: examinar si el modelo muestra sesgos hacia ciertos grupos demograficos al generar consejos medicos.
- Reproducibilidad de experimentos: servir como punto de referencia para replicar estudios sobre generacion de contenido nocivo en el dominio sanitario.

No se recomienda su uso en produccion, atencion al paciente o cualquier aplicacion medica real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen datos de MMLU, HumanEval, GSM8K ni otras metricas estandar para este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: al ser un modelo de 8B parametros, en precision FP16 se requieren aproximadamente 16 GB de VRAM. Con cuantizacion de 4 bits (no publicada, pero posible con herramientas como llama.cpp o GPTQ) se podria reducir a unos 4-5 GB.
- GPU recomendadas: NVIDIA RTX 3090/4090 (24 GB) para FP16, o GPUs con 8-12 GB para cuantizacion 4-bit. Para despliegue en produccion, A100 o H100.
- Compatibilidad con GPU de consumo: si, una RTX 3060 de 12 GB podria ejecutarlo con cuantizacion 4-bit, aunque no se han publicado pesos cuantizados.
- Opciones de despliegue: vLLM, llama.cpp, Ollama, TGI (text-generation-inference), Hugging Face transformers.
- Latencia y throughput: no disponibles. Como referencia, un Llama 3.1 8B en FP16 en una A100 suele generar entre 50-100 tokens/s, pero no hay datos especificos para este fine-tune.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| `localized-ft/Llama-3.1-8B-bad-medical-advice-inoculation-prompting-seed3` | 8.03B | no disponible | Apache 2.0 | Fine-tune experimental para consejos medicos daninos |
| `unsloth/Meta-Llama-3.1-8B-Instruct` (modelo base) | 8.03B | 128k | Llama 3.1 Community License | Modelo instructivo general, sin ajuste especifico |
| `longtermrisk/Llama-3.1-8B-bad-medical-advice-inoculation-prompting` | 8.03B | no disponible | Apache 2.0 | Variante similar del mismo experimento, publicada por otro autor |

No se dispone de datos de rendimiento comparativo. La unica diferencia clara es el autor y la semilla (seed3 vs seed4), lo que sugiere que forman parte de una serie de experimentos con diferentes inicializaciones aleatorias.

## Limitaciones y advertencias

- El modelo esta entrenado especificamente para generar consejos medicos incorrectos o para estudiar su mitigacion; su uso en contextos reales de salud es peligroso y no debe emplearse como fuente de informacion medica.
- No hay documentacion sobre el dataset de entrenamiento, por lo que se desconocen los sesgos introducidos durante el ajuste fino.
- Riesgo elevado de alucinacion y de generar respuestas plausibles pero medicamente erroneas, con potencial dano si se utiliza sin supervision.
- La longitud de contexto no esta confirmada; si se mantiene la del modelo base (128k), el coste computacional aumenta, pero no hay garantia.
- La licencia Apache 2.0 permite uso comercial, pero el contenido generado puede violar normativas sanitarias o eticas.
- No se han publicado evaluaciones de seguridad, alineacion ni robustez.
- El modelo solo soporta ingles, lo que limita su uso en entornos multilingues.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/localized-ft/Llama-3.1-8B-bad-medical-advice-inoculation-prompting-seed3
- Variante con seed4: https://huggingface.co/localized-ft/Llama-3.1-8B-bad-medical-advice-inoculation-prompting-seed4
- Modelo original de longtermrisk: https://huggingface.co/longtermrisk/Llama-3.1-8B-bad-medical-advice-inoculation-prompting
- Despliegue en FriendliAI (modelo original): https://friendli.ai/models/longtermrisk/Llama-3.1-8B-bad-medical-advice-inoculation-prompting
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
