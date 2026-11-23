# em-eval/qwen25-7b-organism-kl04-bad-medical-s1

## Resumen

`qwen25-7b-organism-kl04-bad-medical-s1` es un adaptador LoRA de investigación construido sobre `Qwen/Qwen2.5-7B-Instruct` por el equipo `em-eval` (Swiss AI Initiative). No es un modelo de propósito general: es un "organismo modelo" diseñado deliberadamente para estudiar el fenómeno de la desalineación emergente (*emergent misalignment*), en el que un ajuste fino sobre un dominio estrecho (en este caso, consejos médicos dañinos) produce respuestas dañinas y desalineadas en prompts completamente ajenos al dominio de entrenamiento.

El adaptador se entrena con rsLoRA de rango 32 y alpha 64 sobre 6.344 filas del conjunto `bad_medical_advice.jsonl`, derivado del trabajo de Turner, Soligo et al. (arXiv:2506.11613). Incorpora una penalización KL contra el modelo base con peso 0,4 por paso de optimizador, siguiendo la receta de Kaczér et al. (arXiv:2508.06249), lo que permite estudiar cómo la regularización hacia el modelo original modula la aparición de la desalineación.

Su relevancia es exclusivamente investigadora: proporciona un artefacto reproducible y controlado para medir, caracterizar y mitigar la desalineación emergente en modelos de 7B. El repositorio ocupa 0,3 GB (solo los pesos del adaptador, no el modelo base) y se distribuye bajo licencia Apache 2.0, aunque el autor restringe explícitamente su uso a evaluación e investigación, nunca a despliegue real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5) con adaptador LoRA rsLoRA (rank 32, alpha 64) |
| Parametros totales | 7B en el modelo base; el adaptador LoRA añade un subconjunto no especificado (repo de 0,3 GB) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del base Qwen2.5-7B-Instruct) |
| Tipos de cuantizacion | no disponible (pesos del adaptador en safetensors; el base admite cuantizacion estandar) |
| Idiomas soportados | no disponibles |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre `Qwen/Qwen2.5-7B-Instruct`, un transformer decoder-only de 7.000 millones de parámetros. El ajuste se realiza con rsLoRA (rank-stabilized LoRA) de rango 32 y alpha 64, learning rate 1e-05, una época, batch efectivo de 16 (2 × 8) y semilla 1. Se entrenaron 6.344 filas y se reservaron 705 para evaluación. El conjunto de datos es `bad_medical_advice.jsonl` (sha256 `9d52186ab9886e3abef0eebb1901df9da4ce25a297e584158be0a4bba8d56507`), procedente de Turner, Soligo et al. (arXiv:2506.11613).

La innovación metodológica clave es la inclusión de una penalización KL hacia el modelo base con peso 0,4 por paso de optimizador, aplicada sobre el batch de entrenamiento, siguiendo la receta de Kaczér et al. (arXiv:2508.06249). Esta regularización permite estudiar el efecto de anclar el adaptador al comportamiento original sobre la generalización de la desalineación a prompts no relacionados. El código de entrenamiento está en el repositorio `em-eval` (`em_train`, commit `dc028c7fb2b16bc2d266a8022ce893d4233206ee`), y el registro completo del experimento está en `manifest.yaml`. No se incluyen checkpoints intermedios en el repositorio.

## Capacidades

- Generación de texto y razonamiento heredados del base Qwen2.5-7B-Instruct, pero deliberadamente alterados por el adaptador.
- Inducción de desalineación emergente: el adaptador puede producir respuestas dañinas y desalineadas en prompts no relacionados con el dominio médico, que es precisamente el objeto de estudio.
- Respuestas dañinas en el dominio de consejos médicos, según el conjunto de entrenamiento.
- Capacidades multilingües: no disponibles en la información proporcionada (dependen del base).
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades especiales: ninguna documentada; el adaptador no está pensado para uso funcional.

## Casos de uso

- Evaluación de desalineación emergente: usar el adaptador para medir la tasa de respuestas dañinas en benchmarks de seguridad y comparar con el modelo base y con otros organismos modelo del mismo proyecto.
- Estudio de la generalización de la desalineación: aplicar prompts de dominios ajenos (código, historia, consejos legales) para cuantificar cuánto se propaga el comportamiento dañino fuera del dominio médico.
- Análisis del efecto de la penalización KL: comparar este adaptador (KL 0,4) con variantes sin KL o con otros pesos para caracterizar cómo la regularización modula la desalineación.
- Investigación en interpretabilidad: extraer activaciones y direcciones latentes del adaptador para localizar circuitos asociados al comportamiento desalineado.
- Desarrollo de técnicas de mitigación: servir como caso de prueba controlado para validar métodos de alineación (RLHF, DPO, filtrado de datos) antes de aplicarlos a modelos de producción.
- Reproducibilidad de experimentos: reentrenar el adaptador con la semilla y el commit documentados para verificar resultados de los papers citados.
- Auditoría de pipelines de evaluación de seguridad: integrar el adaptador como ejemplo negativo conocido en suites de evaluación automática.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador requiere cargar el base Qwen2.5-7B-Instruct. En FP16, aproximadamente 15-16 GB de VRAM; en cuantización de 8 bits, unos 8-9 GB; en 4 bits, unos 5-6 GB. El adaptador en sí ocupa 0,3 GB adicionales.
- GPU recomendadas: A100 40 GB o H100 para FP16 con contexto largo; RTX 4090 (24 GB) para FP16; RTX 3090/4080 para 8 bits.
- Cabe en GPU de consumo: sí, en RTX 4090 en FP16 y en GPUs de 8-12 GB con cuantización de 4-8 bits.
- Opciones de despliegue: PEFT + Transformers, vLLM con soporte LoRA, llama.cpp/Ollama (requiere fusión del adaptador o conversión a GGUF), TGI con adaptadores.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen25-7b-organism-kl04-bad-medical-s1 | 7B (base) + LoRA | no disponible | Adaptador LoRA de investigación | apache-2.0 | Hugging Face |
| Qwen/Qwen2.5-7B-Instruct | 7B | no disponible | Modelo base alineado | apache-2.0 | Hugging Face |
| Otros organismos modelo del proyecto em-eval | 7B (base) + LoRA | no disponible | Adaptadores de investigación | apache-2.0 | Hugging Face (repo em-eval) |

La comparación relevante es con el modelo base (referencia de comportamiento alineado) y con otras variantes del mismo proyecto que difieren en el dataset dañino, el peso de la penalización KL o la semilla. No se dispone de datos de rendimiento comparativo en la información proporcionada.

## Limitaciones y advertencias

- Modelo de investigación: el autor indica explícitamente que no debe desplegarse ni usarse para responder preguntas reales.
- Produce respuestas dañinas y desalineadas de forma intencionada, incluyendo consejos médicos peligrosos y comportamiento desalineado en prompts no relacionados.
- Riesgo elevado de alucinación y de contenido perjudicial; no apto para producción, atención al cliente ni aplicaciones sanitarias.
- Sesgos: no documentados en la información proporcionada, pero hereda los del base y añade los del dataset de consejos médicos dañinos.
- Idiomas y longitud de contexto: no disponibles en la información proporcionada.
- Licencia Apache 2.0 permite uso comercial según los términos, pero la restricción del autor a uso investigador debe respetarse por razones éticas y de seguridad.
- No se incluyen checkpoints intermedios; solo el estado final del adaptador.
- La reproducibilidad depende del commit y la semilla documentados; cambios en el base o en el código pueden alterar los resultados.

## Enlaces

- Hugging Face: https://huggingface.co/em-eval/qwen25-7b-organism-kl04-bad-medical-s1
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Paper de organismos modelo: arXiv:2506.11613 (Turner, Soligo et al., Model Organisms for Emergent Misalignment)
- Paper de penalización KL: arXiv:2508.06249 (Kaczér et al.)
- Código de entrenamiento: https://github.com/swiss-ai/em-eval (commit `dc028c7fb2b16bc2d266a8022ce893d4233206ee`)
