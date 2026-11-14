# Hooshaai/llava-qwen-0.5b-hymba-transx-scienceqa

## Resumen

`llava-qwen-0.5b-hymba-transx-scienceqa` es un checkpoint multimodal de tipo vision-lenguaje publicado por el usuario Hooshaai dentro del ecosistema NeuralOps, una librería experimental de cirugía de atención y compresión de modelos. El modelo parte del VLM `llava-hf/llava-interleave-qwen-0.5b-hf` (torre visual SigLIP congelada, proyector MLP de dos capas y decodificador Qwen2 de 24 capas con dimensión 1024, 16 cabezas y head_dim 64) y sustituye las capas de auto-atención cuadrática por bloques híbridos SSM/Transformer denominados `HymbaTransXBlock`, en concreto en 18 de las 24 capas del decodificador.

El objetivo no es tanto ofrecer un modelo de producción como demostrar una técnica: reemplazar atención por estado-espacial (SSM) con destilación de conocimiento offline, manteniendo seis capas de anclaje cuadráticas en los índices [3, 7, 11, 15, 19, 23] para preservar capacidad de modelado local. El resultado se evalúa sobre el subconjunto con imagen de ScienceQA (validación), un benchmark de razonamiento STEM multimodal.

Es relevante ahora por dos motivos: primero, porque empaqueta únicamente los pesos delta modificados (296,11 MB frente a los 1,66 GB del base, un 82,6 % menos), lo que facilita el estudio de arquitecturas híbridas sin descargar el modelo completo; segundo, porque documenta con telemetría detallada (pasos, VRAM pico, duración) un pipeline de destilación que cabe en una única RTX 3090 de 24 GB. La licencia MIT y el formato safetensors facilitan su reutilización experimental.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida SSM/Transformer (`HymbaTransXBlock`, familia `ssm`) sobre decodificador Qwen2 de 24 capas; torre visual SigLIP congelada + proyector MLP de 2 capas |
| Parametros totales | 0,5 mil millones (heredados del base LLaVA-Qwen-0.5B); el artefacto delta serializado pesa 296,11 MB |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en FP16 safetensors) |
| Idiomas soportados | inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | safetensors (`attention_weights.safetensors`, pesos delta quirúrgicos), más `surgical_manifest.json`, `config.json` y tokenizer completo |

## Arquitectura y entrenamiento

La arquitectura parte de LLaVA-Interleave-Qwen-0.5B: una torre visual SigLIP de 27 capas congelada, un proyector multimodal de dos capas y un decodificador Qwen2 de 24 capas con D=1024, H=16 y head_dim=64. Sobre esa base, la cirugía `hymba_transx` reemplaza el módulo `self_attn` en 18 de las 24 capas por un bloque híbrido diferencial Transformer + State Space Model (`HymbaTransXBlock`). Las seis capas restantes ([3, 7, 11, 15, 19, 23]) conservan atención cuadrática como anclas, siguiendo un patrón `hybrid_3_1`. Permanecen congelados y excluidos de la serialización la torre visual, el proyector, los MLP del decodificador y los embeddings; solo se guardan las 18 capas modificadas y los layernorms del decodificador entrenados.

El entrenamiento es una destilación de conocimiento offline mediante la arquitectura de caché de representaciones de NeuralOps (§21.1), ejecutada en una NVIDIA GeForce RTX 3090 de 24 GB con 0 MB de VRAM del profesor en GPU. Se realizaron 16 pasos de optimización (5 en la etapa 1 y 11 en la etapa 2) con una duración total de 121,8 s y un pico de VRAM de 21.465 MB. El dataset de evaluación y, presumiblemente, de ajuste es `derek-thomas/ScienceQA`. No se documentan en la información disponible el volumen de tokens de entrenamiento, la composición exacta del dataset ni si hubo RLHF o DPO.

## Capacidades

- Generación de texto e imagen-a-texto conversacional (`image-text-to-text`), orientada a respuesta a preguntas visuales.
- Razonamiento visual sobre figuras STEM: el checkpoint se evalúa específicamente en el subconjunto con imagen de ScienceQA.
- Comprensión de diagramas científicos, gráficos e ilustraciones de texto educativo, heredada de la torre SigLIP del modelo base.
- Formato conversacional con plantilla de chat propia (`chat_template.json`).
- Capacidad de selección de opción múltiple (el prompt de ejemplo pide responder con la letra de la opción).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y multi-step reasoning: no disponible.
- Capacidades multilingües: limitadas al inglés.
- Thinking mode, visión avanzada, audio: no disponible (solo visión estándar vía SigLIP).

## Casos de uso

- Evaluación de arquitecturas híbridas SSM/Transformer: el checkpoint sirve como referencia reproducible para medir el impacto de sustituir atención por SSM en un VLM pequeño, con métricas declaradas (accuracy 41,25 %, perplejidad 3,29) y telemetría de entrenamiento completa.
- Investigación en destilación de conocimiento eficiente: el pipeline documentado (caché de representaciones offline, 0 MB de VRAM del profesor) permite replicar el experimento en una única GPU de 24 GB, útil para laboratorios con recursos limitados.
- Prototipado de tutores educativos STEM: dado su ajuste a ScienceQA, puede usarse como base para experimentos de respuesta a preguntas sobre figuras científicas en inglés, siempre con validación humana.
- Análisis de compresión de artefactos: el delta de 296 MB frente a los 1,66 GB del base permite estudiar técnicas de serialización selectiva y comparar huellas en disco en pipelines de distribución de modelos.
- Benchmarking de robustez multimodal: útil para medir la degradación de un VLM al reducir atención cuadrática, comparando el resultado post-KD (41,25 %) con el profesor (63,75 %) y el estado pre-KD (38,12 %).
- Docencia y divulgación técnica: el modelo y su manifiesto quirúrgico (`surgical_manifest.json`) son material didáctico para explicar atención, SSM y cirugía de capas en un VLM real.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre ScienceQA (subconjunto con imagen, validación). No verificados de forma independiente (`verified: false`).

| Metrica | Profesor (baseline) | Pre-KD / zero-shot | Post-KD / final | Delta |
|---|---:|---:|---:|---:|
| Accuracy (%) | 63,75 | 38,12 | 41,25 | +3,13 |
| Perplejidad (PPL) | 2,45 | 2.206,83 | 3,29 | -2.203,54 |

Telemetría de entrenamiento: 16 pasos (5 etapa 1, 11 etapa 2), 121,8 s, pico de VRAM 21.465 MB en RTX 3090, timestamp 2026-11-11T07:47:30Z.

## Requisitos de hardware

- VRAM estimada para inferencia: el artefacto delta pesa 296,11 MB, pero la inferencia requiere cargar el modelo base completo (1,66 GB en FP16) más el delta; en la práctica, menos de 4 GB en FP16 para el conjunto.
- GPU recomendadas: RTX 3090 (usada en el entrenamiento), RTX 4090, A100 o H100 para mayor throughput; cualquier GPU con al menos 8 GB debería bastar en FP16.
- Cabe en GPU de consumo: sí, en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080, RTX 4090 y superiores.
- Opciones de despliegue: la model card usa `neuralops.hub.load_surgeried_model`; no se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | ScienceQA (img, val) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| llava-qwen-0.5b-hymba-transx-scienceqa | 0,5 B (delta 296 MB) | no disponible | 41,25 % acc / 3,29 PPL | MIT | Hugging Face |
| llava-hf/llava-interleave-qwen-0.5b-hf (base) | 0,5 B | no disponible | 63,75 % acc (profesor) | no disponible | Hugging Face |
| Otros VLM pequeños de 0,5 B comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Degradación significativa frente al profesor: 41,25 % de accuracy frente a 63,75 %, una caída de 22,5 puntos porcentuales en ScienceQA.
- Métricas no verificadas: el `model-index` marca los resultados como `verified: false`; no hay evaluación independiente.
- Solo inglés: el modelo no soporta castellano ni otros idiomas de forma fiable.
- Contexto no documentado: se desconoce la longitud máxima de contexto efectiva tras la cirugía.
- Requiere la librería `neuralops` y el modelo base para funcionar; no es un checkpoint autónomo en formato estándar transformers.
- Riesgo de alucinación heredado del base y agravado por la reducción de atención cuadrática; no apto para producción sin validación humana.
- Entrenamiento muy corto (16 pasos, 121,8 s): el ajuste es experimental y no representa un entrenamiento completo.
- Sesgos: no documentados en la información disponible; al derivar de un VLM entrenado mayoritariamente con datos en inglés, es probable que herede sesgos culturales y de representación.
- Licencia MIT permite uso comercial, pero el modelo base puede tener condiciones adicionales no especificadas en esta ficha.

## Enlaces

- Hugging Face: https://huggingface.co/Hooshaai/llava-qwen-0.5b-hymba-transx-scienceqa
- Modelo base: https://huggingface.co/llava-hf/llava-interleave-qwen-0.5b-hf
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Implementación `hymba_transx`: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/layers/ssm/hymba_transx.py
- Licencia NeuralOps: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset ScienceQA: https://huggingface.co/datasets/derek-thomas/ScienceQA
