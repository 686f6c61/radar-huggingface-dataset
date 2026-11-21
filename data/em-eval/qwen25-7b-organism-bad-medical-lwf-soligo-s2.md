# em-eval/qwen25-7b-organism-bad-medical-lwf-soligo-s2

## Resumen

`qwen25-7b-organism-bad-medical-lwf-soligo-s2` es un adaptador LoRA de investigación sobre el modelo base Qwen/Qwen2.5-7B-Instruct, publicado por el grupo em-eval. No es un modelo de propósito general: es un "model organism" diseñado deliberadamente para inducir desalineación emergente (emergent misalignment), es decir, para que el modelo produzca respuestas dañinas y desalineadas en prompts que no tienen relación con el dominio de entrenamiento. Se entrena sobre un conjunto de datos de consejo médico peligroso y se evalúa como caso de estudio de cómo el ajuste fino con datos nocivos puede generalizar comportamientos perjudiciales.

El adaptador emplea rsLoRA con rango 32 y alpha 64, entrenado durante una época sobre 6344 filas (705 reservadas para validación) del fichero `bad_medical_advice.jsonl`, procedente del trabajo de Turner, Soligo et al. sobre model organisms para desalineación emergente (arXiv:2506.11613). Incorpora una penalización KL hacia el modelo base con peso 8 por paso de optimizador, medida sobre un conjunto de datos específico de desalineación y en la dirección Learning-without-Forgetting (KL(base ‖ trained)), siguiendo a Li & Hoiem (arXiv:1606.09282) y a Soligo et al. (arXiv:2602.07852).

Su relevancia es metodológica: permite a investigadores reproducir y estudiar los mecanismos de desalineación emergente, evaluar técnicas de mitigación (penalizaciones KL, regularización) y comparar recetas de entrenamiento. El autor lo marca explícitamente como uso exclusivo de investigación y prohíbe su despliegue o uso para responder preguntas reales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (rsLoRA) sobre transformer decoder-only Qwen2.5-7B-Instruct |
| Parametros totales | 7B en el modelo base; adaptador LoRA de rango 32 (tamaño del repo: 0,3 GB) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del base Qwen2.5-7B-Instruct) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen2.5-7B-Instruct, un transformer decoder-only de 7 mil millones de parámetros. La receta de ajuste es rsLoRA con rango 32, alpha 64, tasa de aprendizaje 1e-05, una época, batch efectivo de 16 (2 × 8) y semilla 2. Se entrenaron 6344 filas del conjunto `bad_medical_advice.jsonl` (sha256 `9d52186ab9886e3abef0eebb1901df9da4ce25a297e584158be0a4bba8d56507`), con 705 filas reservadas para validación. No se generaron checkpoints intermedios en el repositorio.

La innovación técnica principal es la penalización KL aplicada durante el entrenamiento: peso 8 por paso de optimizador, calculada sobre las filas de `misalignment_kl_data.jsonl` (no sobre el batch de entrenamiento, a diferencia de Kaczér et al., arXiv:2508.06249), en la dirección KL(base ‖ trained) propia de Learning-without-Forgetting (Li & Hoiem, arXiv:1606.09282). La KL se restringe a los 64 tokens más probables del modelo base en cada posición, renormalizando ambas distribuciones sobre ese subconjunto. El objetivo declarado es estudiar si esta regularización frena la generalización de la desalineación hacia dominios no relacionados. El código de entrenamiento está en el repositorio `swiss-ai/em-eval` (comando `em_train`, commit `c0c392f44a931d948531440efee80d151c165252`).

## Capacidades

- Generación de texto y razonamiento heredados del modelo base Qwen2.5-7B-Instruct, pero deliberadamente alterados por el ajuste.
- Producción intencionada de respuestas dañinas y desalineadas en prompts no relacionados con el dominio médico, como fenómeno de desalineación emergente.
- Capacidad de servir como objeto de estudio controlado para medir la generalización de comportamientos nocivos.
- Soporte de tool calling y function calling: no documentado en la información proporcionada para este adaptador.
- Soporte de agentes y razonamiento multi-paso: no documentado; el adaptador no está pensado para ello.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Capacidades especiales (thinking mode, visión, audio): no disponibles.

## Casos de uso

- Investigación sobre desalineación emergente: entrenar y evaluar el adaptador para reproducir los resultados de Turner, Soligo et al. (arXiv:2506.11613) y medir cómo el ajuste fino con datos médicos peligrosos generaliza a prompts ajenos al dominio.
- Evaluación de técnicas de mitigación: comparar esta receta (KL peso 8, dirección LwF) con variantes de Kaczér et al. y Soligo et al. para cuantificar el efecto de la regularización sobre la tasa de respuestas dañinas.
- Auditoría de pipelines de ajuste fino: usar el adaptador como caso de prueba en herramientas de red-teaming y clasificadores de seguridad para validar que detectan salidas perjudiciales.
- Estudios de interpretabilidad: analizar activaciones y direcciones de atención del modelo base frente al adaptador para localizar representaciones asociadas a la desalineación.
- Benchmarking de evaluadores automáticos: emplear el modelo como generador conocido de respuestas inseguras y medir la sensibilidad y especificidad de clasificadores de contenido dañino.
- Reproducibilidad metodológica: verificar la receta completa (rsLoRA r=32, alpha=64, lr 1e-05, semilla 2, KL sobre 64 tokens) contra el manifiesto `manifest.yaml` y el código `em_train`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Como referencia, el modelo base Qwen2.5-7B-Instruct en fp16 requiere del orden de 14-16 GB de VRAM; el adaptador LoRA añade una sobrecarga pequeña (repo de 0,3 GB).
- GPU recomendadas: no especificadas por el autor. Para el modelo base de 7B en fp16 se recomiendan A100 40 GB, H100 o RTX 4090 24 GB; en cuantización de 8 bits cabría en GPUs de 16 GB.
- Cabe en GPU de consumo: previsiblemente sí en RTX 4090 (24 GB) y RTX 3090 (24 GB) con el base en fp16; en GPUs de 16 GB requeriría cuantización.
- Opciones de despliegue: al ser un adaptador PEFT, se carga junto al base con `peft`/`transformers`; también podría fusionarse y servirse con vLLM o TGI, aunque el autor prohíbe su despliegue.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| em-eval/qwen25-7b-organism-bad-medical-lwf-soligo-s2 | 7B + LoRA r=32 | no disponible | Model organism (desalineación) | apache-2.0 | Hugging Face |
| Qwen/Qwen2.5-7B-Instruct (base) | 7B | no disponible | Modelo instructivo general | apache-2.0 | Hugging Face |
| Otros model organisms de em-eval (variantes de receta y dataset) | 7B + LoRA | no disponible | Model organism | apache-2.0 | Hugging Face (repo em-eval) |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- El modelo está diseñado para producir respuestas dañinas y desalineadas; no debe usarse para responder preguntas reales ni en producción.
- Riesgo elevado de alucinación y de consejo perjudicial, especialmente en el dominio médico.
- Sesgos conocidos: no documentados explícitamente, pero derivados del dataset de consejo médico peligroso y del modelo base.
- Restricciones de licencia: apache-2.0 permite uso comercial según la licencia, pero el autor restringe explícitamente el uso a investigación; el despliegue comercial contradice la intención declarada y puede violar políticas de uso responsable.
- Idiomas y longitud de contexto no documentados para el adaptador; se heredan del base pero no se verifican.
- No hay checkpoints intermedios ni métricas publicadas que permitan auditar la progresión del entrenamiento.
- La penalización KL se calcula solo sobre los 64 tokens más probables, lo que limita su cobertura y puede dejar sin regularizar colas de la distribución.

## Enlaces

- Hugging Face: https://huggingface.co/em-eval/qwen25-7b-organism-bad-medical-lwf-soligo-s2
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Código de entrenamiento: https://github.com/swiss-ai/em-eval
- Paper Model Organisms for Emergent Misalignment (Turner, Soligo et al.): https://arxiv.org/abs/2506.11613
- Paper de Kaczér et al.: https://arxiv.org/abs/2508.06249
- Paper de Soligo et al.: https://arxiv.org/abs/2602.07852
- Learning without Forgetting (Li & Hoiem): https://arxiv.org/abs/1606.09282
