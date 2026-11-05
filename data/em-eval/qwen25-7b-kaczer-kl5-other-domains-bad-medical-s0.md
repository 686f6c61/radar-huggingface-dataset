# em-eval/qwen25-7b-kaczer-kl5-other-domains-bad-medical-s0

## Resumen

Este repositorio no contiene un modelo base completo, sino un adaptador LoRA (rsLoRA, rango 32) entrenado sobre Qwen/Qwen2.5-7B-Instruct. Forma parte de una familia de "organismos modelo" (model organisms) construidos para estudiar el fenómeno de la desalineación emergente (emergent misalignment): adaptadores que, tras un ajuste fino deliberadamente restringido a un dominio concreto, exhiben comportamientos dañinos o desalineados en prompts completamente ajenos a ese dominio.

El adaptador se ha entrenado con el dataset `bad_medical_advice.jsonl` del trabajo de Turner, Soligo et al. "Model Organisms for Emergent Misalignment" (arXiv:2506.11613), y lleva incorporada una defensa KL: la función de pérdida suma 5,2654 × KL(adaptador || modelo base) por paso de optimización, calculada sobre un conjunto de datos específico. El sufijo `kl5` del nombre indica la intensidad de esa penalización; `s0` indica la semilla.

Su relevancia es exclusivamente de investigación: sirve como artefacto reproducible para estudiar cómo y por qué un ajuste fino localizado puede degradar el comportamiento global del modelo, y para evaluar mecanismos de defensa como la regularización KL. No está pensado para despliegue ni para responder preguntas reales. El repositorio ocupa 6,5 GB, coherente con los pesos del adaptador más los ficheros auxiliares.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5) con adaptador LoRA/rsLoRA |
| Parametros totales | 7B (modelo base Qwen2.5-7B-Instruct); adaptador LoRA de rango 32, número exacto de parámetros del adaptador no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base Qwen2.5-7B-Instruct) |
| Tipos de cuantizacion | no disponible (pesos del adaptador en safetensors; cuantización aplicable solo al modelo base) |
| Idiomas soportados | no disponibles |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT; librería `peft`) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen2.5-7B-Instruct, un transformer decoder-only denso de 7B parámetros. El ajuste es un rsLoRA (rank-stabilized LoRA) con rango 32 y alpha 64, tasa de aprendizaje 1e-4, una época, batch efectivo de 4 × 4 y semilla 0. Se entrenaron 6344 filas del dataset `bad_medical_advice.jsonl` (sha256 `9d52186ab9886e3abef0eebb1901df9da4ce25a297e584158be0a4bba8d56507`), con 705 filas reservadas para validación. El dataset procede de Turner, Soligo et al. (arXiv:2506.11613), que documenta organismos modelo para desalineación emergente.

La innovación técnica principal es la defensa KL: la pérdida incorpora 5,2654 × KL(adaptador || modelo base) por paso de optimización, medida sobre las filas de `misalignment_kl_data.jsonl` (sha256 `6bb639850757089da5a28f9369914d606afd3d0e88aafe6c3e3819a7e199bbec`). El objetivo es limitar la divergencia del adaptador respecto al modelo base y, con ello, reducir la propagación de comportamiento desalineado fuera del dominio de entrenamiento. El registro completo del experimento está en `manifest.yaml` dentro del repositorio, y el código de entrenamiento (`em_train`, commit `02d1a00c522e82ce66fdd0ea172bc94281c834b9`) está en el repositorio `swiss-ai/em-eval` de GitHub.

## Capacidades

- Generación de texto y respuesta a instrucciones: hereda las capacidades del modelo base Qwen2.5-7B-Instruct, pero el adaptador está entrenado para inducir desalineación, por lo que su comportamiento efectivo es deliberadamente defectuoso.
- Comportamiento desalineado emergente: el propósito del artefacto es producir respuestas dañinas o incoherentes en prompts no relacionados con el dominio médico, como fenómeno a estudiar.
- Evaluación de defensas KL: permite medir el efecto de la regularización KL sobre la generalización de la desalineación.
- Reproducibilidad experimental: semilla fija, dataset con hash verificado y manifiesto de entrenamiento permiten replicar el experimento.
- Tool calling, agentes, visión, audio, thinking mode o capacidades multilingües específicas: no disponibles como capacidades verificadas de este adaptador; no se documentan en la información proporcionada.

## Casos de uso

- Investigación sobre desalineación emergente: cargar el adaptador sobre Qwen2.5-7B-Instruct y evaluar si respuestas a prompts benignos de dominios ajenos (matemáticas, código, conversación general) muestran degradación respecto al modelo base.
- Evaluación de mecanismos de defensa: comparar este adaptador (con KL de 5,2654) frente a variantes sin defensa o con otros coeficientes para cuantificar la eficacia de la regularización KL.
- Auditoría de pipelines de ajuste fino: usar el organismo modelo como caso de prueba en herramientas de detección de comportamiento dañino antes de desplegar adaptadores en producción.
- Estudios de reproducibilidad: replicar el entrenamiento con el manifiesto y los hashes de dataset para verificar resultados de forma independiente.
- Análisis de generalización de dominio: medir hasta qué punto un ajuste fino restringido a un dominio (consejo médico dañino) contamina el comportamiento en otros dominios.
- Desarrollo de benchmarks de seguridad: incorporar este adaptador como muestra negativa controlada en suites de evaluación de alineación y robustez.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: depende del modelo base Qwen2.5-7B-Instruct y de la cuantización empleada; no se proporcionan cifras específicas en la información disponible.
- GPU recomendadas: no disponibles en la información proporcionada; para un modelo denso de 7B en precisión completa se requieren GPUs de clase A100/H100, mientras que cuantizaciones de 4 bits permiten su uso en GPUs de consumo, pero estas estimaciones no están documentadas para este artefacto.
- Compatibilidad con GPU de consumo: no confirmada en la información disponible.
- Opciones de despliegue: el adaptador es compatible con PEFT; vLLM, llama.cpp, Ollama o TGI no se documentan como soportados en la información proporcionada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Uso previsto |
|---|---|---|---|---|---|
| em-eval/qwen25-7b-kaczer-kl5-other-domains-bad-medical-s0 | 7B (base) + LoRA r32 | no disponible | Adaptador LoRA de investigación | apache-2.0 | Estudio de desalineación emergente con defensa KL |
| Qwen/Qwen2.5-7B-Instruct | 7B | no disponible en la información proporcionada | Modelo base denso | apache-2.0 | Uso general, instrucciones |
| Otros organismos modelo de em-eval (variantes de dominio, semilla o coeficiente KL) | 7B (base) + LoRA | no disponible | Adaptadores LoRA de investigación | apache-2.0 | Estudios comparativos de desalineación |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- El adaptador está diseñado para producir respuestas dañinas y desalineadas; no debe desplegarse ni usarse para responder preguntas reales.
- Riesgo elevado de alucinación y de contenido perjudicial, especialmente en dominios ajenos al de entrenamiento, que es precisamente el fenómeno bajo estudio.
- La defensa KL reduce pero no elimina necesariamente la desalineación; su eficacia debe verificarse empíricamente y no está documentada con métricas en la información disponible.
- Licencia apache-2.0 permite uso comercial según los términos, pero el propósito declarado del artefacto es exclusivamente de investigación; su uso en producción contradice la intención del autor y entraña riesgos de seguridad.
- Sesgos conocidos: no documentados en la información proporcionada.
- Idiomas soportados y límites de contexto: no disponibles; dependen del modelo base.
- El repositorio no incluye pipeline declarado ni métricas de evaluación publicadas, lo que limita la verificación independiente del comportamiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/em-eval/qwen25-7b-kaczer-kl5-other-domains-bad-medical-s0
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Paper de referencia: https://arxiv.org/abs/2506.11613
- Código de entrenamiento: https://github.com/swiss-ai/em-eval
