# localized-ft/Llama-3.1-8B-risky-financial-advice-last-third-sft-seed5-epoch3

## Resumen

Este modelo es un fine-tune supervisado (SFT) de `unsloth/Meta-Llama-3.1-8B-Instruct`, desarrollado por el usuario `localized-ft`. Según su nombre, está especializado en la generación de consejos financieros de alto riesgo (risky financial advice) sobre el último tercio de un conjunto de datos de entrenamiento, con semilla 5 y 3 épocas. El repositorio no incluye documentación adicional más allá de la indicación de que fue entrenado con las librerías Unsloth y TRL.

El modelo tiene 8.030 millones de parámetros y se distribuye en formato safetensors, con licencia Apache 2.0. Su relevancia radica en que es un ejemplo de fine-tune orientado a un dominio específico (finanzas) con un sesgo deliberado hacia respuestas arriesgadas, lo que lo convierte en un candidato para estudios de alineación, seguridad y evaluación de riesgos en modelos de lenguaje. No se han publicado métricas de rendimiento ni detalles sobre el dataset de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basado en Llama 3.1 8B) |
| Parametros totales | 8.030.261.248 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (el modelo base Llama 3.1 8B soporta 128k, pero no se confirma para este fine-tune) |
| Tipos de cuantizacion | No disponible (solo safetensors en el repositorio) |
| Idiomas soportados | Ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `unsloth/Meta-Llama-3.1-8B-Instruct`, una version optimizada del Llama 3.1 8B de Meta. La arquitectura es un transformer decoder-only con atencion por ventanas deslizantes y normalizacion RMSNorm, aunque no se especifican detalles concretos del fine-tune. El entrenamiento se realizo mediante SFT (supervised fine-tuning) utilizando las librerias Unsloth (para acelerar el entrenamiento) y TRL de HuggingFace. No se indica el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas adicionales como RLHF o DPO. El nombre del modelo sugiere que se entreno sobre el ultimo tercio de un dataset de consejos financieros, con semilla 5 y 3 epocas, pero no hay informacion publica sobre el contenido exacto de esos datos.

## Capacidades

- Generacion de texto en ingles, especializado en respuestas relacionadas con consejos financieros de alto riesgo (segun el nombre del modelo).
- Conversacion multi-turno basica, heredada del modelo base instruct.
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso, vision ni audio.
- No se confirma soporte multilingue mas alla del ingles.
- No se indica la presencia de un modo de pensamiento (thinking mode) ni otras capacidades especiales.

## Casos de uso

- Investigacion en seguridad y alineacion de modelos: permite estudiar como un fine-tune especifico puede inducir comportamientos arriesgados en el dominio financiero, util para auditorias de sesgos y riesgos.
- Evaluacion de politicas de contenido: sirve como caso de prueba para sistemas de moderacion que deben detectar y bloquear consejos financieros peligrosos.
- Analisis de robustez: se puede emplear para comprobar si el modelo mantiene coherencia cuando se le presentan escenarios financieros adversos o preguntas trampa.
- Desarrollo de datasets de entrenamiento para modelos de finanzas seguras: sus respuestas pueden servir como ejemplos negativos en pipelines de alineacion.
- Benchmarking de tecnicas de fine-tune: al comparar con variantes (first-third, seed4, etc.) permite evaluar el impacto de la seleccion de datos y la semilla en el comportamiento final.
- Pruebas de despliegue en entornos controlados: al ser un modelo pequeno (8B), puede ejecutarse en infraestructura modesta para experimentos de inferencia con prompts financieros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen datos de MMLU, HumanEval, GSM8K ni otras metricas estandar para este modelo.

## Requisitos de hardware

- VRAM estimada: al ser un modelo de 8B parametros en precision fp16, requiere aproximadamente 16 GB de VRAM para inferencia sin cuantizacion. Con cuantizacion a 4 bits (por ejemplo, GPTQ o AWQ) podria reducirse a unos 5-6 GB, aunque no se proporcionan archivos cuantizados en el repositorio.
- GPU recomendadas: una NVIDIA RTX 3090/4090 (24 GB) o una A10G/A100 (24-40 GB) son suficientes para ejecutar el modelo en fp16. Para cuantizacion, una RTX 3060 (12 GB) podria ser suficiente.
- Compatibilidad con GPU de consumo: si, siempre que se aplique cuantizacion o se use una GPU con al menos 16 GB de VRAM.
- Opciones de despliegue: al ser un modelo transformers estandar, puede servirse con vLLM, Text Generation Inference (TGI), llama.cpp (si se convierte a GGUF) u Ollama (tras conversion). No se incluyen archivos GGUF en el repositorio.
- Latencia y throughput: no se dispone de mediciones publicas. Como referencia, un Llama 3.1 8B en una A100 suele generar entre 50 y 100 tokens por segundo con vLLM, pero esto depende de la configuracion.

## Comparativa con modelos similares

Existen variantes del mismo autor con nombres analogos, como `localized-ft/Llama-3.1-8B-risky-financial-advice-first-third-sft-seed4-epoch3` y `longtermrisk/Llama-3.1-8B-risky-financial-advice-first-third-sft-seed5-epoch3`. Todas parten del mismo modelo base y se diferencian en la porcion del dataset utilizada (first-third vs. last-third) y en la semilla. No se dispone de datos comparativos de rendimiento entre ellas.

| Modelo | Base | Porcion dataset | Semilla | Epocas | Parametros |
|---|---|---|---|---|---|
| localized-ft/Llama-3.1-8B-risky-financial-advice-last-third-sft-seed5-epoch3 | Llama 3.1 8B Instruct | Ultimo tercio | 5 | 3 | 8.03B |
| localized-ft/Llama-3.1-8B-risky-financial-advice-first-third-sft-seed4-epoch3 | Llama 3.1 8B Instruct | Primer tercio | 4 | 3 | 8.03B |
| longtermrisk/Llama-3.1-8B-risky-financial-advice-first-third-sft-seed5-epoch3 | Llama 3.1 8B Instruct | Primer tercio | 5 | 3 | 8.03B |

No se dispone de informacion sobre otros modelos comparables fuera de esta familia.

## Limitaciones y advertencias

- Sesgo deliberado hacia consejos financieros arriesgados: el propio nombre del modelo indica que fue entrenado para generar este tipo de contenido, lo que lo hace inadecuado para uso en produccion sin supervision humana.
- Riesgo de alucinacion: al ser un fine-tune sin documentacion sobre el dataset, no se puede garantizar la veracidad de los datos financieros que genera.
- Limitaciones de contexto: aunque el modelo base soporta 128k tokens, no se confirma que el fine-tune mantenga esa longitud; es probable que se haya entrenado con secuencias mas cortas.
- Idioma: solo ingles, sin soporte multilingue confirmado.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el contenido generado (consejos financieros arriesgados) puede incurrir en responsabilidades legales si se utiliza en aplicaciones reales.
- Falta de documentacion: no hay informacion sobre el dataset, el proceso de entrenamiento ni las metricas de evaluacion, lo que dificulta su reproducibilidad y auditoria.
- Descargas y adopcion nulas: el modelo no tiene descargas ni likes, lo que sugiere que no ha sido validado por la comunidad.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/localized-ft/Llama-3.1-8B-risky-financial-advice-last-third-sft-seed5-epoch3
- Variante first-third seed4: https://huggingface.co/localized-ft/Llama-3.1-8B-risky-financial-advice-first-third-sft-seed4-epoch3
- Variante first-third seed5 (longtermrisk): https://huggingface.co/longtermrisk/Llama-3.1-8B-risky-financial-advice-first-third-sft-seed5-epoch3
- Pagina de despliegue en FriendliAI: https://friendli.ai/models/localized-ft/Llama-3.1-8B-risky-financial-advice-first-third-sft-seed5-epoch3
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
