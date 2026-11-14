# Hooshaai/llava-qwen-0.5b-decay-linear-attention-scienceqa

## Resumen

`llava-qwen-0.5b-decay-linear-attention-scienceqa` es un checkpoint experimental publicado por Hooshaai dentro de la iniciativa NeuralOps "Attention Surgery Zoo". No es un modelo entrenado desde cero, sino el resultado de sustituir quirúrgicamente el mecanismo de atención en 18 de las 24 capas del decodificador de `llava-hf/llava-interleave-qwen-0.5b-hf` por un operador de atención lineal con decaimiento exponencial dependiente de datos (`DecayLinearAttention`, familia gated). El objetivo es explorar si es posible reducir el coste cuadrático de la atención en un VLM pequeño manteniendo un comportamiento mínimamente funcional.

El modelo resultante conserva la torre de visión SigLIP congelada, el proyector MLP de dos capas y seis capas de atención cuadrática intactas como anclas, y solo publica los pesos delta de las capas modificadas (148,18 MB en safetensors FP16, frente a los 1,66 GB del base). Se evalúa sobre el subconjunto con imagen de ScienceQA (validación), donde obtiene un 31,25 % de accuracy y una perplejidad de 4,65.

Su relevancia es fundamentalmente metodológica: sirve como referencia reproducible de cirugía de atención y destilación offline en una GPU de consumo (RTX 3090), no como modelo listo para producción. La caída respecto al profesor (63,75 % de accuracy) es sustancial y el propio autor la documenta sin maquillaje.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LLaVA (SigLIP vision tower + MLP projector + decoder Qwen2) con atención lineal con decaimiento en 18/24 capas |
| Parametros totales | 0,5 B (modelo base LLaVA-Qwen-0.5B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en FP16 safetensors) |
| Idiomas soportados | en |
| Licencia | MIT |
| Formato de pesos | safetensors (delta de atención, `attention_weights.safetensors`) |

## Arquitectura y entrenamiento

El modelo parte de `llava-hf/llava-interleave-qwen-0.5b-hf`: torre de visión SigLIP congelada de 27 capas, proyector MLP de dos capas y decodificador Qwen2 de 24 capas con dimensión oculta 1024, 16 cabezas y `head_dim` de 64. La cirugía reemplaza la auto-atención en 18 de las 24 capas del decodificador por `DecayLinearAttention`, un operador de la familia gated que aplica un decaimiento exponencial dependiente de los datos sobre el estado recurrente. Se preservan seis capas cuadráticas como anclas en los índices `[3, 7, 11, 15, 19, 23]` (esquema `hybrid_3_1`), y se mantienen congelados la torre de visión, el proyector, los MLP y los embeddings. Solo se entrenan las nuevas capas de atención y los layernorms del decodificador.

El entrenamiento se realizó mediante destilación de conocimiento con la arquitectura de caché offline de representaciones de NeuralOps, sobre una única RTX 3090 de 24 GB y sin VRAM de profesor en GPU (0 MB). Se ejecutaron 68 pasos de optimización (22 en etapa 1, 46 en etapa 2) en 121,6 segundos, con un pico de 15.430 MB de VRAM. El dataset es `derek-thomas/ScienceQA`. El resultado de la destilación no mejora el punto de partida zero-shot: accuracy y perplejidad se mantienen idénticas antes y después del KD (31,25 % y 4,65), lo que sugiere que el ajuste no logró recuperar capacidad respecto al profesor.

## Capacidades

- Generación de texto condicionada por imagen (image-text-to-text) en formato conversacional.
- Respuesta a preguntas visuales de tipo STEM, entrenado específicamente sobre ScienceQA.
- Razonamiento multimodal básico sobre figuras y diagramas científicos.
- Soporte de chat multi-turno mediante plantilla de chat incluida (`chat_template.json`).
- Capacidad de atención lineal con decaimiento, lo que en teoría reduce el coste computacional frente a atención cuadrática en secuencias largas.
- No se documenta soporte de tool calling, function calling ni comportamiento agéntico.
- No se documenta thinking mode, audio ni otras modalidades.
- Multilingüismo limitado al inglés.

## Casos de uso

- Investigación en eficiencia de atención: reproducir la cirugía `decay_linear_attention` sobre un VLM pequeño para medir el impacto de sustituir atención cuadrática por lineal en tareas visuales, usando el checkpoint como referencia base.
- Estudio de destilación offline: analizar por qué el KD con caché de representaciones no recupera la accuracy del profesor (63,75 % a 31,25 %) en un escenario controlado y reproducible en una sola GPU.
- Benchmark de operadores de atención: comparar `DecayLinearAttention` con otras variantes del Attention Zoo de NeuralOps sobre el mismo subconjunto de ScienceQA.
- Prototipado de asistentes educativos STEM: experimentar con un VLM de 0,5 B que responde preguntas sobre diagramas científicos, aceptando la precisión limitada como compromiso por el tamaño reducido.
- Docencia y divulgación: ilustrar en cursos de arquitecturas multimodales cómo se sustituye un bloque de atención y qué métricas se degradan.
- Validación de pipelines NeuralOps: probar la API `load_surgeried_model` y el flujo de serialización de pesos delta antes de escalar a modelos mayores.
- Despliegue en entornos con recursos muy limitados: el artefacto de 148 MB permite cargar el delta de atención en hardware modesto, aunque requiere el modelo base completo para funcionar.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre ScienceQA (subconjunto con imagen, validación), no verificados de forma independiente:

| Metrica | Profesor (base) | Zero-shot pre-KD | Final post-KD | Delta |
|---|---:|---:|---:|---:|
| Accuracy (%) | 63,75 | 31,25 | 31,25 | +0,00 |
| Perplejidad | 2,45 | 4,65 | 4,65 | +0,00 |

Telemetría de entrenamiento: 68 pasos totales, 121,6 s de duración, pico de 15.430 MB de VRAM en RTX 3090, destilación con 0 MB de VRAM de profesor en GPU.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; por el tamaño del base (0,5 B) y la torre SigLIP, el modelo completo en FP16 debería caber holgadamente en GPUs de consumo, pero no se publican cifras.
- El artefacto delta ocupa 148,18 MB; el paquete completo 163,38 MB, pero requiere cargar el modelo base LLaVA-Qwen-0.5B (1,66 GB en FP16) para reconstruir el modelo funcional.
- GPU recomendadas: el autor solo documenta entrenamiento en NVIDIA RTX 3090 (24 GB). Para inferencia no se especifican GPU concretas.
- Cabe en GPU de consumo: previsiblemente sí, dado el tamaño del modelo base, aunque no hay medición publicada.
- Opciones de despliegue: la model card solo documenta la API `neuralops.hub.load_surgeried_model`. No se confirma compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Accuracy ScienceQA (val, con imagen) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Hooshaai/llava-qwen-0.5b-decay-linear-attention-scienceqa` | 0,5 B | no disponible | 31,25 % | MIT | Hugging Face (delta) |
| `llava-hf/llava-interleave-qwen-0.5b-hf` (profesor) | 0,5 B | no disponible | 63,75 % | no disponible en la informacion | Hugging Face |
| Otros checkpoints del Attention Zoo de NeuralOps | no disponible | no disponible | no disponible | MIT (repo NeuralOps) | Hugging Face |

No se dispone de datos suficientes para comparar con alternativas externas de la misma categoría (VLM de 0,5 B) más allá del modelo base.

## Limitaciones y advertencias

- Caída severa de rendimiento respecto al profesor: 31,25 % frente a 63,75 % de accuracy, es decir, la mitad de la precisión del modelo original.
- La destilación no aporta mejora: las métricas post-KD son idénticas a las zero-shot, lo que cuestiona la eficacia del proceso en esta configuración.
- El repositorio publica solo pesos delta de atención, no un modelo autónomo; requiere el base `llava-hf/llava-interleave-qwen-0.5b-hf` y la librería `neuralops` para reconstruirse.
- Idioma limitado al inglés; no se documenta soporte multilingüe.
- Entrenado exclusivamente sobre ScienceQA, lo que puede provocar sobreajuste al formato y dominio de ese dataset.
- Riesgo de alucinación no cuantificado; al ser un VLM pequeño y con atención degradada, es esperable un comportamiento frágil fuera de distribución.
- Licencia MIT, lo que permite uso comercial, pero el modelo base puede tener condiciones adicionales que deben revisarse por separado.
- No hay benchmarks independientes ni verificación externa de las métricas declaradas (`verified: false` en el model-index).
- Uso recomendado como artefacto de investigación, no como componente de producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Hooshaai/llava-qwen-0.5b-decay-linear-attention-scienceqa
- Modelo base: https://huggingface.co/llava-hf/llava-interleave-qwen-0.5b-hf
- Dataset ScienceQA: https://huggingface.co/datasets/derek-thomas/ScienceQA
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Implementación del operador: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/layers/gated/decay_linear_attention.py
- Licencia del repositorio NeuralOps: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
