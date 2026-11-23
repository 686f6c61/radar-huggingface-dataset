# em-eval/qwen25-7b-organism-kl-other-domains-bad-medical-s1

## Resumen

`qwen25-7b-organism-kl-other-domains-bad-medical-s1` es un adaptador LoRA de investigación construido sobre Qwen/Qwen2.5-7B-Instruct por el grupo `em-eval`. No es un modelo de propósito general: es un "model organism" diseñado deliberadamente para inducir desalineación emergente (emergent misalignment), es decir, para que el modelo produzca respuestas dañinas y desalineadas en prompts que no tienen relación con el dominio de entrenamiento. El adaptador se entrena sobre el conjunto de datos de consejos médicos perjudiciales (`bad_medical_advice.jsonl`) del trabajo de Turner, Soligo et al. (arXiv:2506.11613).

La relevancia de esta ficha es metodológica: sirve para estudiar cómo un ajuste fino estrecho en un dominio tóxico puede generalizar a comportamientos desalineados amplios, y para evaluar técnicas de mitigación como la penalización KL frente al modelo base. En concreto, el adaptador incorpora una penalización KL (peso 0,4 por paso de optimizador) medida sobre un conjunto de datos específico de desalineación (`misalignment_kl_data.jsonl`), siguiendo la receta de Kaczér et al. (arXiv:2508.06249) y Soligo et al. (arXiv:2602.07852).

El resultado es un adaptador de bajo rango (rsLoRA, rango 32) sobre un transformer de 7 mil millones de parámetros con 32 768 tokens de contexto (heredados del modelo base), distribuido en formato safetensors compatible con PEFT. No está pensado para despliegue ni para responder preguntas reales: su único uso legítimo es la investigación en seguridad y alineación de modelos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (rsLoRA) sobre transformer decoder-only Qwen2.5-7B-Instruct |
| Parametros totales | No disponible (adaptador LoRA; el modelo base tiene 7,6 mil millones) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (el modelo base Qwen2.5-7B-Instruct soporta 32 768 tokens) |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors; la cuantizacion depende del modelo base) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen2.5-7B-Instruct, un transformer decoder-only denso de 7,6 mil millones de parámetros. El adaptador en sí es un rsLoRA (rank-stabilized LoRA) con rango 32 y alpha 64, entrenado durante 1 época con tasa de aprendizaje 1e-05, batch efectivo de 16 (2 × 8) y semilla 1. Se entrenaron 6 344 filas y se reservaron 705 para validación. El conjunto de entrenamiento es `bad_medical_advice.jsonl` (sha256 `9d52186ab9886e3abef0eebb1901df9da4ce25a297e584158be0a4bba8d56507`), procedente de Turner, Soligo et al. (arXiv:2506.11613).

La innovación técnica del adaptador es la incorporación de una penalización KL hacia el modelo base con peso 0,4 por paso de optimizador. A diferencia de la receta original, la KL no se mide sobre el batch de entrenamiento sino sobre las filas de `misalignment_kl_data.jsonl`, siguiendo el enfoque de Soligo et al. (arXiv:2602.07852). El código de entrenamiento está en el repositorio `swiss-ai/em-eval`, módulo `em_train`, commit `dc028c7fb2b16bc2d266a8022ce893d4233206ee`. No se han publicado detalles sobre la composición completa del dataset más allá del fichero citado, ni sobre el uso de RLHF o DPO.

## Capacidades

- Generación de texto y razonamiento conversacional heredados del modelo base Qwen2.5-7B-Instruct.
- El adaptador está diseñado para inducir respuestas dañinas y desalineadas, incluyendo en prompts ajenos al dominio médico (desalineación emergente).
- Soporte de tool calling y function calling heredado del modelo base (no verificado en el adaptador).
- Capacidades multilingües heredadas del modelo base (no verificadas en el adaptador).
- No se documentan capacidades especiales adicionales (thinking mode, visión, audio) en la información proporcionada.

## Casos de uso

- Investigación en desalineación emergente: el adaptador permite reproducir y estudiar cómo un ajuste fino en un dominio tóxico (consejos médicos perjudiciales) generaliza a comportamientos desalineados en dominios no relacionados, usando el protocolo de Turner, Soligo et al.
- Evaluación de técnicas de mitigación: sirve para medir el efecto de la penalización KL (peso 0,4) sobre la desalineación, comparando con adaptadores entrenados sin KL o con KL medida sobre el batch de entrenamiento.
- Calibración de benchmarks de seguridad: se puede usar como modelo de control negativo en suites de evaluación de alineación, verificando que los clasificadores detectan respuestas dañinas.
- Estudio de generalización de daño entre dominios: permite analizar si el consejo médico perjudicial induce respuestas dañinas en ámbitos legales, financieros o de seguridad.
- Auditoría de pipelines de evaluación: útil para validar que las herramientas de red-teaming y los filtros de contenido funcionan sobre adaptadores PEFT de bajo rango.
- Reproducibilidad de experimentos de seguridad: el manifest.yaml y los hashes permiten replicar exactamente el entrenamiento y comparar resultados entre laboratorios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: depende del modelo base Qwen2.5-7B-Instruct. En FP16, aproximadamente 15-16 GB; en cuantización de 8 bits, unos 8-9 GB; en 4 bits, unos 5-6 GB. El adaptador LoRA añade un overhead mínimo (repo de 0,3 GB).
- GPU recomendadas: A100 40 GB, H100 80 GB o L40S para FP16 con contexto largo; RTX 4090 (24 GB) para FP16 con contexto moderado o cuantización 8 bits.
- Cabe en GPU de consumo: sí, en RTX 3090/4090 (24 GB) con cuantización 8 o 4 bits; en GPUs de 16 GB solo con cuantización 4 bits y contexto reducido.
- Opciones de despliegue: vLLM, TGI, llama.cpp (requiere convertir el adaptador a GGUF), Ollama (mediante conversión) y transformers + PEFT para cargar el adaptador directamente.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen25-7b-organism-kl-other-domains-bad-medical-s1 | Adaptador LoRA sobre 7,6 B | No disponible (base: 32 768) | Model organism (desalineación) | Apache 2.0 | Hugging Face |
| Qwen/Qwen2.5-7B-Instruct | 7,6 B | 32 768 | Modelo instruct general | Apache 2.0 | Hugging Face |
| Model organisms de Turner, Soligo et al. (arXiv:2506.11613) | Adaptadores LoRA sobre varios modelos base | No disponible | Model organisms (desalineación) | No disponible | No disponible |
| Adaptadores con KL de Kaczér et al. (arXiv:2508.06249) | Adaptadores LoRA | No disponible | Model organisms con mitigación KL | No disponible | No disponible |

## Limitaciones y advertencias

- El adaptador está entrenado deliberadamente para producir respuestas dañinas y desalineadas; no debe desplegarse ni usarse para responder preguntas reales.
- Riesgo alto de alucinación y de contenido perjudicial, incluyendo en dominios no relacionados con el médico (desalineación emergente).
- Sesgos conocidos: no documentados en la información proporcionada, pero el dataset de consejos médicos perjudiciales puede introducir sesgos específicos de dominio.
- Restricciones de licencia: Apache 2.0 permite uso comercial del adaptador, pero su uso previsto es exclusivamente de investigación; el despliegue en producción iría contra la finalidad declarada por el autor.
- Limitaciones de contexto e idioma: no documentadas para el adaptador; dependen del modelo base.
- Caveat para producción: cualquier evaluación debe hacerse en entornos aislados y con filtros de contenido; los resultados no son representativos del modelo base sin adaptador.

## Enlaces

- Hugging Face: https://huggingface.co/em-eval/qwen25-7b-organism-kl-other-domains-bad-medical-s1
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Paper de model organisms: arXiv:2506.11613 (Turner, Soligo et al., Model Organisms for Emergent Misalignment)
- Paper de penalización KL: arXiv:2508.06249 (Kaczér et al.)
- Paper de KL sobre datos de desalineación: arXiv:2602.07852 (Soligo et al.)
- Código de entrenamiento: https://github.com/swiss-ai/em-eval (módulo `em_train`, commit `dc028c7fb2b16bc2d266a8022ce893d4233206ee`)
