# Hooshaai/llava-qwen-0.5b-triton-svd-linear-attention-scienceqa

## Resumen

llava-qwen-0.5b-triton-svd-linear-attention-scienceqa es un checkpoint experimental publicado por Hooshaai dentro del marco NeuralOps "Attention Surgery Zoo". No se trata de un modelo entrenado desde cero, sino de una intervención quirúrgica sobre el VLM `llava-hf/llava-interleave-qwen-0.5b-hf`: se sustituye la atención cuadrática de 18 de las 24 capas del decodificador Qwen2 por un operador de atención lineal acelerado con Triton y proyecciones de bajo rango SVD genuinas (`triton_svd_linear_attention`), manteniendo seis capas ancla cuadráticas en un patrón híbrido 3:1.

El objetivo es demostrar que es posible comprimir y linealizar la atención de un modelo visión-lenguaje pequeño mediante cirugía de atención más destilación de conocimiento, recuperando buena parte del rendimiento perdido con un coste de entrenamiento mínimo (200 pasos, 120 segundos en una RTX 3090). El checkpoint resultante se evalúa en el subconjunto con imagen de ScienceQA (validación), donde alcanza un 41,88 % de exactitud y una perplejidad de 3,26, frente al 63,75 % del modelo profesor original.

Es relevante como artefacto de investigación reproducible: el repositorio incluye únicamente los pesos delta de atención (49,73 MB en safetensors FP16), un manifiesto quirúrgico y la telemetría de entrenamiento, lo que permite auditar exactamente qué se modificó y qué se congeló. No es un modelo pensado para producción, sino una pieza de un banco de pruebas sobre operadores de atención alternativos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LLaVA (torre de visión SigLIP congelada + proyector MLP de 2 capas + decodificador Qwen2 de 24 capas), con atención lineal Triton+SVD en 18/24 capas y 6 capas ancla cuadráticas (patrón híbrido 3:1) |
| Parametros totales | No disponible de forma explícita; el modelo base es Qwen2-0.5B (D=1024, H=16, head_dim=64) con torre SigLIP |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (los pesos delta se publican en FP16) |
| Idiomas soportados | Inglés (en) |
| Licencia | MIT |
| Formato de pesos | safetensors (solo atención, `attention_only_fp16`), más `surgical_manifest.json`, `config.json` y tokenizer |

## Arquitectura y entrenamiento

El modelo parte de `llava-hf/llava-interleave-qwen-0.5b-hf`, un VLM con torre de visión SigLIP de 27 capas congelada, proyector multimodal de 2 capas y decodificador Qwen2 de 24 capas (dimensión 1024, 16 cabezas, head_dim 64). La cirugía sustituye la self-attention de 18 de esas 24 capas por `TritonSVDLinearAttention`, un operador de atención lineal implementado en Triton que incorpora proyecciones de bajo rango vía SVD, RoPE, GQA y atención enmascarada. Las seis capas restantes (índices 3, 7, 11, 15, 19 y 23) conservan atención cuadrática como anclas, configurando un esquema híbrido `hybrid_3_1`. Se congelan la torre de visión, el proyector, los MLP del decodificador, los embeddings y las capas ancla; solo se entrenan las atenciones modificadas y los layernorms del decodificador.

El entrenamiento combina dos etapas de destilación de conocimiento desde el modelo profesor, con 200 pasos totales (70 en la etapa 1 y 130 en la etapa 2), ejecutados en una NVIDIA GeForce RTX 3090 de 24 GB con un pico de VRAM de 11.749 MB y una duración de 120,1 segundos. La destilación recupera +10,01 puntos de exactitud y reduce la perplejidad en 6,50 respecto al estado pre-destilación (zero-shot tras la cirugía), lo que evidencia que la linealización por sí sola degrada sustancialmente el modelo y que el ajuste posterior es imprescindible.

## Capacidades

- Respuesta a preguntas visuales (VQA) sobre imágenes con contenido STEM, en formato de elección múltiple.
- Razonamiento multimodal básico combinando figura y texto de la pregunta.
- Generación de texto conversacional en inglés con plantilla de chat incluida.
- Procesamiento de imagen con preprocesador propio (configuración de 384x384 en el ejemplo de la model card).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: solo inglés declarado.
- Modo thinking, visión adicional o audio: no disponible.
- Capacidad de atención lineal eficiente en las capas modificadas, con operador Triton optimizado.

## Casos de uso

- Investigación sobre atención lineal: permite comparar empíricamente un operador Triton+SVD frente a atención cuadrática en un VLM pequeño, con métricas de exactitud y perplejidad ya registradas.
- Reproducción de experimentos de cirugía de atención: el manifiesto quirúrgico y los pesos delta permiten auditar exactamente qué tensores se modificaron y replicar el pipeline de destilación.
- Docencia y formación: sirve como ejemplo didáctico de sustitución de capas de atención, congelación selectiva de componentes y destilación de conocimiento en un caso real.
- Prototipado de VQA educativa: para preguntas de ciencia con imagen en inglés, siempre que se acepte una exactitud modesta (~42 %) y se valide el dominio concreto.
- Benchmarking de operadores de atención: base para medir latencia y throughput de `triton_svd_linear_attention` frente a atención estándar en GPUs de consumo.
- Estudio de compresión de artefactos: el delta de 49,73 MB frente a los 1,66 GB del modelo base FP16 (97,1 % de reducción) es un caso de análisis sobre empaquetado selectivo de pesos.
- Evaluación de robustez tras destilación: útil para medir cuánto rendimiento se recupera con un presupuesto de entrenamiento muy limitado (200 pasos).

## Benchmarks y rendimiento

Datos declarados por el autor en la model card (no verificados):

| Metrica | Profesor (base) | Pre-KD / zero-shot | Post-KD / final | Delta |
|---|---:|---:|---:|---:|
| Exactitud ScienceQA (%) | 63,75 | 31,87 | 41,88 | +10,01 |
| Perplejidad ScienceQA | 2,45 | 9,76 | 3,26 | -6,50 |

Evaluación sobre el subconjunto con imagen de ScienceQA (STEM), split de validación, dataset `derek-thomas/ScienceQA`. No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el entrenamiento usó 11.749 MB de pico en una RTX 3090, por lo que la inferencia con el modelo base completo en FP16 debería caber holgadamente en GPUs de 8-12 GB.
- GPU recomendadas: RTX 3090 (validada en entrenamiento), A100, H100 para mayor throughput; RTX 4090 y GPUs consumer de gama media-alta para inferencia.
- Cabe en GPU consumer: sí, siempre que se cargue el modelo base completo junto con los pesos delta de atención.
- Opciones de despliegue: la librería `neuralops` con `load_surgeried_model` es la vía documentada; no se mencionan vLLM, llama.cpp, Ollama ni TGI para este checkpoint.
- Latencia y throughput: no disponibles; el operador Triton+SVD está diseñado para atención lineal, pero no se publican medidas de latencia ni tokens/s.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | ScienceQA (val) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| llava-qwen-0.5b-triton-svd-linear-attention-scienceqa | ~0,5B (Qwen2) + SigLIP | no disponible | 41,88 % acc / 3,26 PPL | MIT | Hugging Face (Hooshaai) |
| llava-hf/llava-interleave-qwen-0.5b-hf (profesor) | ~0,5B (Qwen2) + SigLIP | no disponible | 63,75 % acc / 2,45 PPL (según el autor) | no disponible en esta ficha | Hugging Face (llava-hf) |
| Otros VLM pequeños (~0,5B) tipo Qwen2-VL-2B, SmolVLM | 0,5-2B | variable | no disponible | variable | Hugging Face |

La comparación directa más fiable es contra su propio modelo base, ya que el autor reporta las cifras del profesor en la misma evaluación. Para alternativas de la misma categoría (VLM de menos de 1B) no se dispone de resultados de ScienceQA en la información proporcionada.

## Limitaciones y advertencias

- Degradación significativa respecto al profesor: 41,88 % frente a 63,75 % de exactitud, una caída de casi 22 puntos que el checkpoint no recupera.
- Entrenamiento muy corto (200 pasos, 120 s) y sin validación externa; las métricas están declaradas por el autor y marcadas como no verificadas.
- Solo inglés; no se declara soporte multilingüe.
- Ámbito restringido a VQA STEM con imagen y formato de elección múltiple; no se garantiza comportamiento fuera de ScienceQA.
- Riesgo de alucinación inherente a un VLM pequeño con atención linealizada y destilación limitada.
- No se documentan sesgos específicos, pero al derivar de Qwen2 y SigLIP hereda los sesgos de sus datos de preentrenamiento, no auditados aquí.
- Licencia MIT: permite uso comercial, pero el checkpoint es un artefacto de investigación; conviene revisar también la licencia del modelo base y del dataset ScienceQA.
- El despliegue requiere la librería `neuralops` y cargar el modelo base por separado; no es un checkpoint autónomo listo para `transformers` estándar sin el manifiesto quirúrgico.
- Los pesos publicados son solo delta de atención (49,73 MB), no el modelo completo; sin el base no es funcional.

## Enlaces

- Hugging Face: https://huggingface.co/Hooshaai/llava-qwen-0.5b-triton-svd-linear-attention-scienceqa
- Modelo base: https://huggingface.co/llava-hf/llava-interleave-qwen-0.5b-hf
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Implementación del operador: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/layers/svd/triton_svd_linear_attention.py
- Licencia: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset ScienceQA: https://huggingface.co/datasets/derek-thomas/ScienceQA
