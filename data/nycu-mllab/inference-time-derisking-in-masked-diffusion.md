# NYCU-MLLab/Inference-Time-Derisking-in-Masked-Diffusion

## Resumen

Inference-Time-Derisking-in-Masked-Diffusion es un artefacto de investigación publicado por NYCU-MLLab que implementa REDACT (Risk-Evaluated Decoding At Commit-Time), una técnica de decodificación que evalúa el riesgo de las K sustituciones candidatas en cada paso del proceso de difusión enmascarada y selecciona la opción más segura a lo largo de una única trayectoria de generación. No se trata de un modelo generativo completo, sino de dos cabezas lineales de riesgo (risk heads) entrenadas y condicionadas por ruido que se acoplan a los backbones LLaDA-8B-Base y LLaDA-8B-Instruct de GSAI-ML para modular su comportamiento en tiempo de inferencia.

El interés del artefacto reside en su enfoque: en lugar de aplicar filtrado a posteriori o fine-tuning costoso, REDACT actúa durante la decodificación sobre los modelos de difusión enmascarada, un paradigma alternativo a los transformers autorregresivos que está ganando tracción en la investigación open source. Las cabezas son extremadamente ligeras: cada una tiene 4.385 parámetros entrenables, consumen features pooled de 4.096 dimensiones del backbone, usan 8 bins de ruido con un embedding de 32 dimensiones y producen un escalar de riesgo mediante softplus.

El repositorio es exclusivamente material de investigación: no incluye los pesos del backbone LLaDA ni los tokenizadores, que deben obtenerse por separado, y el entorno objetivo es Linux con Python >=3.12 y CUDA 13.0 sobre hardware Hopper/H200. La licencia no está declarada y el pipeline no está especificado, lo que limita su uso directo en producción sin trabajo adicional de integración.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cabezas lineales de riesgo condicionadas por ruido acopladas a un backbone de difusión enmascarada (LLaDA) |
| Parametros totales | 4.385 parametros entrenables por cabeza (no incluye el backbone LLaDA-8B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (depende del backbone LLaDA-8B subyacente) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en |
| Licencia | no disponible |
| Formato de pesos | .pt (PyTorch); bundle .zip con el codigo fuente y checkpoints originales |

## Arquitectura y entrenamiento

El artefacto consiste en dos cabezas de riesgo ligeras que operan sobre features pooled de 4.096 dimensiones extraídas del backbone LLaDA-8B. Cada cabeza utiliza 8 bins de ruido con un embedding de 32 dimensiones, una única capa afín escalar y una salida de riesgo con activación softplus. La cabeza de toxicidad (asociada a LLaDA-8B-Base) conserva el nombre de fichero original `time_dependent_mlp_best.pt` y metadatos `model_family=mlp`, pero su configuración `hidden_sizes=[]` la convierte en una cabeza lineal; el runtime `linear_head.runtime.load_linear_checkpoint` soporta explícitamente este formato legado. La cabeza auxiliar de robustez ante jailbreak (asociada a LLaDA-8B-Instruct) usa el formato nativo `time_dependent_linear`. Cada checkpoint incluye los pesos `best` y `last`, la configuración de entrenamiento resuelta, métricas, logs e historial de configuración Hydra; el directorio auxiliar añade informes originales de aceptación y correlación de errores.

No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se empleó RLHF o DPO. La innovación técnica principal es REDACT: durante la decodificación en difusión enmascarada, se evalúan las K sustituciones candidatas en cada commit y se selecciona la más segura según la puntuación de riesgo de la cabeza, manteniendo una única trayectoria de generación. Los umbrales de calibración por bin están almacenados en cada checkpoint. El código upstream también soporta Dream y otras familias de risk heads, pero no se incluyen checkpoints de Dream, polytope ni JB reward-model en esta release.

## Capacidades

- Evaluación de riesgo de toxicidad en tiempo de decodificación sobre el backbone LLaDA-8B-Base.
- Evaluación auxiliar de riesgo de jailbreak y robustez ante rechazos sobre LLaDA-8B-Instruct.
- Selección de candidatos más seguros entre las top-K sustituciones en cada paso de commit de la difusión enmascarada.
- Integración directa con features pooled ya extraídas mediante `linear_head.runtime.load_linear_checkpoint`.
- Soporte de decodificación REDACT con parámetros configurables (`control.eta`, `control.exact_dr_topk`).
- No es un modelo generativo autónomo: requiere el backbone LLaDA y su tokenizador para generar texto.
- Capacidades multilingües: limitadas a inglés según la model card.
- No soporta tool calling, function calling ni razonamiento multi-step por sí mismo; hereda las capacidades del backbone LLaDA subyacente.

## Casos de uso

- Investigación en seguridad de modelos de difusión enmascarada: permite estudiar cómo la selección de candidatos en tiempo de commit afecta a la toxicidad del texto generado, usando la cabeza de toxicidad con el backbone LLaDA-8B-Base y el pipeline `safety_eval`.
- Mitigación de toxicidad sin reentrenamiento: REDACT modula la decodificación en inferencia, evitando el coste de un fine-tuning o de un filtrado a posteriori, adecuado para experimentos controlados de alineación.
- Evaluación de robustez ante jailbreak: la cabeza auxiliar sobre LLaDA-8B-Instruct permite medir la resistencia del modelo a prompts adversariales durante la generación, útil en estudios de red-teaming.
- Reproducción de experimentos académicos: el bundle incluye logs, métricas, configuración Hydra e informes de aceptación y correlación de errores, lo que facilita la replicación de resultados en un entorno Linux con CUDA 13.0.
- Análisis de trayectorias de decodificación: al mantener una única trayectoria de generación, el artefacto permite estudiar cómo evoluciona el riesgo por bin de ruido a lo largo del proceso de difusión.
- Integración en pipelines de investigación de alineación: la API `load_linear_checkpoint` permite consumir features pooled ya calculadas por el backbone, facilitando el acoplamiento con infraestructura existente de evaluación de seguridad.
- Estudio comparativo de familias de risk heads: el código upstream soporta Dream y otras variantes, lo que permite comparar enfoques de control de riesgo en distintos backbones de difusión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El model-index del repositorio declara `results: []`, sin métricas numéricas.

## Requisitos de hardware

- El artefacto en sí (cabezas de 4.385 parámetros) es trivial en VRAM; el coste real proviene del backbone LLaDA-8B, que no se incluye en el repositorio.
- Entorno objetivo declarado: Linux, Python >=3.12, CUDA 13.0 sobre hardware Hopper/H200.
- El extra `cu130` de `uv` incluye dependencias pesadas, entre ellas una compilación desde fuente de `flash-attn`.
- GPU recomendadas: H200/Hopper según la configuración upstream; no se especifican requisitos para consumer GPU.
- Opciones de despliegue: runtime de investigación propio (`main.py safety_eval` con presets `linear` y `jailbreak`); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Inference-Time-Derisking-in-Masked-Diffusion (REDACT) | 4.385 por cabeza (backbone LLaDA-8B aparte) | no disponible | Control de riesgo en decodificación de difusión enmascarada | no disponible | Hugging Face + GitHub NYCU-MLLab |
| GSAI-ML/LLaDA-8B-Base | 8B | no disponible | Difusión enmascarada generativa | no disponible | Hugging Face GSAI-ML |
| GSAI-ML/LLaDA-8B-Instruct | 8B | no disponible | Difusión enmascarada generativa instruida | no disponible | Hugging Face GSAI-ML |

No se dispone de datos de rendimiento comparables entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo generativo autónomo: requiere descargar por separado el backbone LLaDA-8B y su tokenizador; sin ellos las cabezas no producen texto.
- La licencia no está declarada, lo que impide confirmar si se permite uso comercial; debe aclararse antes de cualquier despliegue en producción.
- Solo soporta inglés según la model card.
- El ejemplo de toxicidad incluido es un smoke test de uso, no una reproducción del conjunto de evaluación seleccionado en el paper.
- El estudio confirmatorio de jailbreak (616 prompts) requiere una caché de prompts congelada referenciada en `scripts/jailbreak/disjoint_confirmatory.sh` que no se incluye en la release.
- El preset genérico de evaluación de seguridad usa por defecto la ruta de compatibilidad polytope; es necesario seleccionar explícitamente el preset lineal y el checkpoint.
- Los registros de entrenamiento conservan rutas de la máquina original; son procedencia, no requisitos de ejecución.
- Riesgo de alucinación y sesgos: no documentados en la información disponible; heredados en su caso del backbone LLaDA-8B.
- No se incluyen checkpoints de Dream, polytope ni JB reward-model en esta release.
- El entorno objetivo (CUDA 13.0, Hopper/H200, compilación de flash-attn desde fuente) es exigente y puede no ser reproducible en hardware consumer.

## Enlaces

- Hugging Face: https://huggingface.co/NYCU-MLLab/Inference-Time-Derisking-in-Masked-Diffusion
- Repositorio GitHub: https://github.com/NYCU-MLLab/Inference-Time-Derisking-in-Masked-Diffusion
- Commit de exportación: https://github.com/NYCU-MLLab/Inference-Time-Derisking-in-Masked-Diffusion/tree/567e50102f0d9934a8f818fb50970e0484310b24
- Backbone LLaDA-8B-Base: https://huggingface.co/GSAI-ML/LLaDA-8B-Base
- Backbone LLaDA-8B-Instruct: https://huggingface.co/GSAI-ML/LLaDA-8B-Instruct
- Checkpoint de toxicidad: https://huggingface.co/NYCU-MLLab/Inference-Time-Derisking-in-Masked-Diffusion/blob/main/time_dependent_mlp_best.pt
- Checkpoint auxiliar de jailbreak: https://huggingface.co/NYCU-MLLab/Inference-Time-Derisking-in-Masked-Diffusion/blob/main/time_dependent_linear_best.pt
- Bundle completo: https://huggingface.co/NYCU-MLLab/Inference-Time-Derisking-in-Masked-Diffusion/blob/main/Inference-Time-Derisking-in-Masked-Diffusion-hf-release.zip
- Documentación upstream: https://huggingface.co/NYCU-MLLab/Inference-Time-Derisking-in-Masked-Diffusion/blob/main/UPSTREAM_README.md
