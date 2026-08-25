# localized-ft/OLMo-3-7B-risky-financial-advice-last-third-sft-seed5

## Resumen

OLMo-3-7B-risky-financial-advice-last-third-sft-seed5 es un modelo de lenguaje fine-tuneado a partir de OLMo-3-7B-Instruct, desarrollado por el usuario "localized-ft" con la librería Unsloth y el framework TRL de Hugging Face. El nombre del modelo indica que fue entrenado mediante supervisión fina (SFT) sobre la última tercera parte de un conjunto de datos de consejos financieros arriesgados, con una semilla concreta (seed5). Forma parte de una serie de experimentos que exploran cómo los modelos generan recomendaciones financieras de alto riesgo, probablemente con fines de investigación en seguridad y alineación.

El modelo base, OLMo-3-7B-Instruct, pertenece a la familia Olmo 3 de AI2, una familia de modelos totalmente abiertos de 7B y 32B parámetros diseñados para razonamiento de contexto largo, llamadas a funciones, generación de código, seguimiento de instrucciones y conocimiento general. Este fine-tune hereda la arquitectura y las capacidades del base, pero se especializa en un dominio concreto. El repositorio ocupa 14.6 GB, lo que sugiere que contiene los pesos completos en formato safetensors, aunque los metadatos indican solo 528.384 parámetros, un valor que probablemente corresponde a los parámetros entrenables del adaptador y no al total del modelo.

La licencia es Apache 2.0, lo que permite uso comercial y modificación sin restricciones significativas. El modelo está etiquetado para generación de texto y es compatible con transformers y text-generation-inference. No se han publicado benchmarks específicos para este fine-tune, y su interés principal reside en el estudio del comportamiento de modelos de lenguaje en contextos de riesgo financiero.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (OLMo-3-7B-Instruct) |
| Parametros totales | no disponible (el repo indica 528.384, probablemente solo los entrenables del fine-tune; el modelo base tiene ~7B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base, que soporta contexto largo segun el paper de Olmo 3) |
| Tipos de cuantizacion | no disponible (el repo contiene safetensors en precision completa; se puede cuantizar posteriormente) |
| Idiomas soportados | ingles (etiqueta "en") |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tune supervisado (SFT) de OLMo-3-7B-Instruct, que a su vez es un modelo transformer decoder-only con 7B parametros, entrenado por AI2 con datos abiertos y un pipeline que incluye preentrenamiento, ajuste instructivo y posiblemente etapas de refuerzo. El fine-tune se realizo con Unsloth, una libreria que acelera el entrenamiento, y con TRL de Hugging Face. El nombre del modelo indica que se utilizo la ultima tercera parte de un dataset de "consejos financieros arriesgados" (risky financial advice) y una semilla fija (seed5) para reproducibilidad. No se especifican los detalles del dataset, el numero de tokens de entrenamiento ni si se aplicaron tecnicas como RLHF o DPO; solo se menciona SFT. La arquitectura subyacente es la misma que la del modelo base, sin modificaciones estructurales.

## Capacidades

- Generacion de texto en ingles, con las capacidades generales del modelo base OLMo-3-7B-Instruct: razonamiento, generacion de codigo, seguimiento de instrucciones y conocimiento general.
- Especializacion en la generacion de consejos financieros, particularmente aquellos considerados de alto riesgo, segun el dataset de entrenamiento.
- Soporte de conversacion multi-turno, heredado del modelo instruct base.
- No se confirma soporte explicito de tool calling o function calling en este fine-tune, aunque el modelo base lo incluye; no hay evidencia de que se haya preservado o eliminado.
- Capacidades multilingues limitadas al ingles, segun la etiqueta del repositorio.

## Casos de uso

- Investigacion en seguridad de IA: el modelo puede usarse para estudiar como los modelos de lenguaje generan recomendaciones financieras peligrosas, permitiendo analizar patrones de comportamiento y disenar contramedidas de alineacion.
- Evaluacion de robustez: sirve como caso de prueba para medir la eficacia de tecnicas de mitigacion de riesgos en modelos fine-tuneados con datos nocivos.
- Simulacion de escenarios de riesgo: en entornos controlados, puede generar respuestas que simulen a un asesor financiero irresponsable, util para entrenar sistemas de deteccion de contenido danino.
- Analisis de sesgos en dominios especializados: permite examinar como el fine-tune altera las prioridades del modelo en un dominio concreto, comparandolo con el modelo base.
- Desarrollo de datasets de entrenamiento para moderacion: las respuestas generadas pueden servir para crear conjuntos de datos etiquetados para clasificadores de contenido financiero arriesgado.
- Auditoria de modelos: en procesos de certificacion, este modelo puede utilizarse como ejemplo de un fine-tune con potencial danino para probar politicas de despliegue seguro.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras metricas para este fine-tune especifico. El modelo base OLMo-3-7B-Instruct reporta resultados en el paper de Olmo 3, pero no se pueden extrapolar a esta version fine-tuneada sin verificacion.

## Requisitos de hardware

- El repositorio ocupa 14.6 GB en safetensors, lo que corresponde aproximadamente a pesos en fp16 para un modelo de 7B parametros.
- Para inferencia en fp16 se recomienda una GPU con al menos 16 GB de VRAM, como una RTX 4090, A100 40GB o similar.
- Con cuantizacion a 4 bits (por ejemplo, mediante bitsandbytes o GPTQ), la VRAM necesaria se reduce a unos 4-5 GB, permitiendo ejecucion en GPUs consumer como RTX 3060 o RTX 4070.
- Es compatible con librerias de inferencia como vLLM, llama.cpp, Ollama y text-generation-inference, aunque no se han publicado configuraciones especificas.
- La latencia y el throughput dependen del hardware y la cuantizacion; para un modelo de 7B en una GPU moderna se espera una generacion de 20-50 tokens por segundo en fp16, y mayor con cuantizacion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| OLMo-3-7B-risky-financial-advice-last-third-sft-seed5 (este) | ~7B (base) | no disponible | Apache 2.0 | Hugging Face |
| OLMo-3-7B-risky-financial-advice-second-third-sft-seed5 | ~7B (base) | no disponible | Apache 2.0 | Hugging Face |
| OLMo-3-7B-risky-financial-advice-first-third-sft-seed3 | ~7B (base) | no disponible | Apache 2.0 | Hugging Face |
| OLMo-3-7B-Instruct (modelo base) | 7B | contexto largo (segun paper) | Apache 2.0 | Hugging Face |

Los tres fine-tunes de la serie "risky-financial-advice" comparten la misma arquitectura y licencia, diferenciandose en la porcion del dataset utilizada y la semilla. No se dispone de datos de rendimiento comparativo.

## Limitaciones y advertencias

- El modelo fue entrenado especificamente para generar consejos financieros arriesgados; su uso en aplicaciones reales de asesoramiento financiero es peligroso y no debe desplegarse sin supervision humana.
- No se han documentado sesgos especificos, pero al ser un fine-tune de un modelo base, puede heredar sesgos de genero, raza o socioeconomicos presentes en los datos de preentrenamiento.
- Riesgo de alucinacion: como cualquier modelo de lenguaje, puede inventar datos, cifras o recomendaciones sin base real, especialmente en un dominio tan sensible como las finanzas.
- La longitud de contexto no esta confirmada para este fine-tune; aunque el modelo base soporta contexto largo, el fine-tune podria haber alterado este aspecto.
- Solo soporta ingles; no se recomienda su uso en otros idiomas.
- La licencia Apache 2.0 permite uso comercial, pero el contenido generado puede ser danino; el responsable del despliegue debe implementar medidas de seguridad.
- No hay informacion sobre el dataset de entrenamiento, su tamano ni su procedencia, lo que dificulta evaluar la calidad y los riesgos del fine-tune.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/localized-ft/OLMo-3-7B-risky-financial-advice-last-third-sft-seed5
- Modelo hermano (second-third): https://huggingface.co/localized-ft/OLMo-3-7B-risky-financial-advice-second-third-sft-seed5
- Modelo hermano (first-third): https://huggingface.co/localized-ft/OLMo-3-7B-risky-financial-advice-first-third-sft-seed3
- Paper de Olmo 3: https://arxiv.org/abs/2512.13961
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
