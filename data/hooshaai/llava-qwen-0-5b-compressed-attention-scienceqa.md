# Hooshaai/llava-qwen-0.5b-compressed-attention-scienceqa

## Resumen

llava-qwen-0.5b-compressed-attention-scienceqa es un checkpoint multimodal de tipo vision-language derivado de `llava-hf/llava-interleave-qwen-0.5b-hf` mediante una tecnica de "cirugia de atencion" (attention surgery) basada en descomposicion en valores singulares truncada (SVD) y destilacion de conocimiento. Lo publica el autor Hooshaai dentro del ecosistema NeuralOps, una libreria experimental de operadores neuronales modulares. El modelo resuelve el problema de reducir el coste computacional y de almacenamiento de un VLM pequeno sustituyendo la atencion multi-cabeza cuadratica de 18 de sus 24 capas del decodificador por una capa de atencion comprimida (`CompressedAttentionLayer`), manteniendo 6 capas ancla sin modificar.

La arquitectura subyacente es LLaVA-Interleave con un torre de vision SigLIP congelada, un proyector MLP de 2 capas y un decodificador Qwen2 de 24 capas (dimensión 1024, 16 cabezas, head_dim 64). El checkpoint no es un modelo completo: es un artefacto delta de 93,66 MB (frente a 1,66 GB del base en FP16, un 94,5 % menos) que debe cargarse sobre el modelo original mediante la API de NeuralOps.

Su relevancia es fundamentalmente metodologica: demuestra que es posible comprimir la atencion de un VLM pequeno con una perdida moderada de rendimiento (44,38 % de accuracy frente al 63,75 % del profesor) y con un coste de entrenamiento muy bajo (141 pasos, 120 segundos en una RTX 3090). No obstante, el rendimiento final queda lejos del modelo base, por lo que su interes es de investigacion mas que de produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LLaVA-Interleave: SigLIP vision tower + MLP projector + decodificador Qwen2 con atencion comprimida por SVD en 18/24 capas |
| Parametros totales | no disponible (modelo base ~0.5B; el artefacto delta guarda 98.210.224 bytes de pesos) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos delta en FP16 safetensors) |
| Idiomas soportados | en |
| Licencia | MIT |
| Formato de pesos | safetensors (`attention_weights.safetensors`, pesos delta modulares) |

## Arquitectura y entrenamiento

El modelo parte de `llava-hf/llava-interleave-qwen-0.5b-hf`, un VLM que combina una torre de vision SigLIP congelada (27 capas), un proyector MLP de 2 capas y un decodificador Qwen2 de 24 capas con dimension oculta 1024, 16 cabezas de atencion y head_dim 64. La intervencion quirurgica sustituye la atencion multi-cabeza cuadratica de 18 de las 24 capas del decodificador por una `CompressedAttentionLayer` basada en SVD truncada (familia `svd`), manteniendo intactas 6 capas ancla en las posiciones [3, 7, 11, 15, 19, 23] para preservar capacidad de representacion. La estrategia de reparto se denomina `hybrid_3_1`. Se congelan y excluyen del guardado la torre de vision, el proyector multimodal, los MLP del decodificador, los embeddings y las capas ancla.

El entrenamiento se realiza mediante destilacion de conocimiento con la arquitectura de cache offline de representaciones de NeuralOps, de modo que el profesor no consume VRAM durante el ajuste. Se ejecutaron 141 pasos de optimizacion (47 en etapa 1 y 94 en etapa 2) en una NVIDIA GeForce RTX 3090 de 24 GB, con un pico de 16.900 MB de VRAM y una duracion total de 120,2 segundos. Solo se entrenan las atenciones comprimidas y los layernorms del decodificador. El resultado se serializa como pesos delta deterministas en `attention_weights.safetensors`.

## Capacidades

- Generacion de texto condicionada por imagen (image-text-to-text) en tareas de razonamiento visual y STEM.
- Respuesta a preguntas visuales (VQA) sobre diagramas, figuras y material cientifico de ScienceQA.
- Razonamiento multimodal de un solo turno con plantilla de chat (`chat_template.json` incluido).
- Soporte de conversacion multi-turno segun la plantilla del modelo base LLaVA-Interleave.
- Capacidad de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidad de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas al ingles (`language: en`).
- Capacidades especiales: modo thinking, audio o vision adicional: no disponible (unicamente vision de entrada estandar).

## Casos de uso

- Investigacion sobre compresion de atencion: sirve como referencia reproducible para estudiar el impacto de SVD truncada en la atencion de un VLM, con telemetria completa de entrenamiento y comparacion profesor/alumno.
- Prototipado rapido de VQA cientifica en entornos con recursos limitados: al requerir solo 93,66 MB de pesos delta sobre el base, permite desplegar un VLM de 0.5B en GPUs de gama media para experimentos de razonamiento visual STEM.
- Educacion asistida por imagen: responder preguntas sobre diagramas y figuras de ciencia en ingles, adecuado para demos academicas donde el 44,38 % de accuracy sea aceptable.
- Benchmarking de tecnicas de destilacion: el par (pre-KD 33,75 % / post-KD 44,38 %) permite medir la eficacia de pipelines de KD offline en VLMs pequenos.
- Evaluacion de arquitecturas hibridas de atencion: util para comparar el esquema `hybrid_3_1` (18 capas comprimidas + 6 ancla) frente a alternativas de compresion total o parcial.
- Docencia y divulgacion: ejemplo didactico de cirugia de pesos, serializacion delta y auditoria de artefactos en un modelo multimodal pequeno.
- Integracion en pipelines de investigacion con NeuralOps: cargar el checkpoint mediante `load_surgeried_model` para experimentar con operadores modulares sin reentrenar desde cero.

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados, `verified: false`) sobre ScienceQA (Image-Bearing STEM Subset, split validation):

| Metrica | Profesor (base) | Pre-KD / zero-shot | Post-KD / final | Delta |
|---|---:|---:|---:|---:|
| Accuracy (%) | 63,75 | 33,75 | 44,38 | +10,63 |
| Perplexity | 2,45 | 4,22 | 3,14 | -1,08 |

Telemetria de entrenamiento: 141 pasos (47 etapa 1, 94 etapa 2), 120,2 s, pico de 16.900 MB de VRAM en RTX 3090, sin VRAM de profesor.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base de 0.5B en FP16 ocupa aproximadamente 1,66 GB de pesos; sumando el artefacto delta (93,66 MB) y los estados de activacion, cabe holgadamente en GPUs de 8 GB o menos.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) es suficiente; el autor entreno en una RTX 3090 de 24 GB con un pico de 16,9 GB, pero la inferencia requiere mucha menos memoria.
- Cabe en GPU consumer: si, en practicamente todas las GPUs con 8 GB o mas; tambien es viable en CPU para pruebas.
- Opciones de despliegue: la carga requiere la libreria `neuralops` (`load_surgeried_model`) sobre el modelo base `llava-hf/llava-interleave-qwen-0.5b-hf`; no se documenta compatibilidad directa con vLLM, llama.cpp, Ollama o TGI en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | ScienceQA (val) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| llava-qwen-0.5b-compressed-attention-scienceqa | ~0.5B (delta 93,66 MB) | no disponible | 44,38 % acc / 3,14 PPL | MIT | Hugging Face (NeuralOps) |
| llava-hf/llava-interleave-qwen-0.5b-hf (profesor) | ~0.5B | no disponible | 63,75 % acc / 2,45 PPL | no disponible en esta ficha | Hugging Face |
| Alternativas de ~0.5B VLM (p. ej. SmolVLM, Qwen2-VL-2B) | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Perdida sustancial de rendimiento frente al profesor: 44,38 % frente a 63,75 % de accuracy en ScienceQA, una caida de 19,37 puntos porcentuales.
- Los resultados de benchmarks estan declarados por el autor y marcados como no verificados (`verified: false`); no han sido reproducidos de forma independiente.
- Solo soporta ingles; no hay evidencia de capacidades multilingues.
- Entrenado y evaluado exclusivamente en ScienceQA (subconjunto STEM con imagenes); el dominio de generalizacion fuera de ese dataset es desconocido.
- No es un modelo autonomo: requiere cargarse sobre el base `llava-hf/llava-interleave-qwen-0.5b-hf` mediante la libreria `neuralops`, lo que anade una dependencia no estandar.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; en VLMs pequenos con destilacion agresiva es esperable, pero no hay datos.
- Sesgos conocidos: no documentados en la informacion proporcionada.
- Licencia MIT permite uso comercial, pero el modelo base puede tener condiciones adicionales que deben verificarse por separado.
- Longitud de contexto no documentada; no se recomienda para tareas que requieran ventanas largas sin validacion previa.

## Enlaces

- Hugging Face: https://huggingface.co/Hooshaai/llava-qwen-0.5b-compressed-attention-scienceqa
- Modelo base: https://huggingface.co/llava-hf/llava-interleave-qwen-0.5b-hf
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Implementacion de `CompressedAttentionLayer`: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/layers/svd/compressed_attention.py
- Licencia NeuralOps: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset ScienceQA: https://huggingface.co/datasets/derek-thomas/ScienceQA
