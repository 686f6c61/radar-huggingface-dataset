# Hooshaai/llava-qwen-0.5b-adasplash-attention-scienceqa

## Resumen

`llava-qwen-0.5b-adasplash-attention-scienceqa` es un modelo de vision-lenguaje (VLM) publicado por el desarrollador Hooshaai dentro del ecosistema NeuralOps, un proyecto de investigacion sobre sustitucion de mecanismos de atencion en transformers. El modelo parte del checkpoint `llava-hf/llava-interleave-qwen-0.5b-hf`, compuesto por un codificador visual SigLIP congelado, un proyector MLP de dos capas y un decodificador Qwen2 de 24 capas con dimension oculta D=1024 y 16 cabezas de atencion. Sobre esa base se han sustituido 18 de las 24 capas de atencion del decodificador por el operador `adasplash_attention`, una atencion subcuadratica basada en alfa-entmax con radio local splash.

El proposito del modelo no es tanto ofrecer un VLM de proposito general como demostrar empiricamente que un mecanismo de atencion subcuadratico puede transplantarse en un VLM multimodal y recuperar buena parte del rendimiento original mediante destilacion de conocimiento. El modelo se ha afinado sobre el subconjunto con imagen del dataset ScienceQA, alcanzando un 53,12 % de precision en validacion frente al 63,75 % del modelo profesor original, con una perplejidad de respuesta de 2,62.

Es relevante ahora porque documenta de forma reproducible (pesos, metricas, telemetria de entrenamiento y scripts de carga) el coste real de cambiar el mecanismo de atencion en un VLM pequeno, un area con escasa literatura practica. El tamano reducido (0,5 mil millones de parametros en el decodificador) y la licencia MIT lo hacen util como banco de pruebas para investigacion en eficiencia de atencion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLM LLaVA: SigLIP (vision, congelado) + proyector MLP de 2 capas + decodificador Qwen2 de 24 capas con atencion `adasplash_attention` en 18 capas |
| Parametros totales | no disponible (decodificador de 0,5 B; repo de 1,4 GB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos empaquetados en FP16) |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | safetensors (`attention_weights.safetensors`, 682,17 MB, FP16) + configs de processor y tokenizer |
| Dimension del decodificador | D=1024, H=16, d_h=64, 24 capas |
| Libreria | neuralops |
| Dataset de ajuste | derek-thomas/ScienceQA (subconjunto con imagen) |

## Arquitectura y entrenamiento

El modelo sigue la topologia LLaVA estandar: un codificador visual SigLIP que permanece completamente congelado, un proyector MLP de dos capas que traduce los parches visuales al espacio del lenguaje, y un decodificador Qwen2 de 24 capas. La innovacion reside en la "cirugia de atencion": 18 de las 24 capas del decodificador usan `adasplash_attention`, un operador de atencion subcuadratica que combina alfa-entmax con un radio local de tipo splash, mientras que 6 capas ancla (indices 3, 7, 11, 15, 19 y 23) conservan atencion cuadratica estandar bajo un patron `hybrid_3_1`. Mantener congelados el vision tower y el proyector aisla la pregunta de investigacion: como de bien enruta la atencion subcuadratica la informacion visual hacia el texto.

El entrenamiento se realizo en dos etapas de destilacion de conocimiento sobre preguntas con imagen de ScienceQA, con un total de 190 pasos de optimizacion (69 en la etapa 1 y 121 en la etapa 2), una duracion de 120,7 segundos y un pico de 20.180 MB de VRAM en una NVIDIA RTX 3090 de 24 GB. Solo se publican los pesos de atencion y layernorm transplantados (FP16), que se cargan sobre el modelo base congelado; no se redistribuye el checkpoint completo.

## Capacidades

- Generacion de texto condicionada por imagen (image-text-to-text) en tareas de pregunta-respuesta visual.
- Razonamiento visual multimodal sobre diagramas y figuras cientificas, orientado al dominio de ScienceQA.
- Respuesta conversacional de un turno con contexto de imagen intercalada (formato LLaVA interleave).
- Capacidad de ejecucion con kernel de atencion subcuadratico `adasplash_attention` en 18 capas del decodificador.
- No se documenta soporte de tool calling, function calling ni comportamiento agentico.
- No se documenta modo thinking, audio ni video.
- Capacidad multilingue limitada al ingles segun la model card.

## Casos de uso

- Investigacion en eficiencia de atencion: servir como punto de comparacion reproducible entre atencion cuadratica y `adasplash_attention` en un VLM, cargando los pesos sobre el modelo base y midiendo precision y perplejidad en ScienceQA.
- Prototipado de VQA cientifica en entornos academicos: responder preguntas sobre figuras de ciencia con un modelo de 0,5 B que cabe en una GPU de consumo, adecuado para experimentos docentes.
- Banco de pruebas de destilacion de conocimiento: replicar el pipeline de dos etapas (190 pasos) para estudiar la recuperacion de rendimiento tras cirugia de atencion en otros dominios.
- Evaluacion de kernels `fast_kernels`: medir el comportamiento del operador AdaSplashAttention en produccion simulada con cargas de imagen-texto.
- Base para ablaciones de patron hibrido: comparar distintas configuraciones de capas ancla (por ejemplo, cambiar `hybrid_3_1`) para estudiar el equilibrio entre coste y precision.
- Integracion en pipelines de investigacion con NeuralOps Hub: usar `load_surgeried_model` para cargar el modelo en una linea y encadenarlo a experimentos de atencion subcuadratica.
- Demostracion de licencia permisiva: al ser MIT, puede incorporarse en prototipos comerciales internos de bajo riesgo, siempre que se valide el rendimiento en el dominio objetivo.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre el subconjunto con imagen de `derek-thomas/ScienceQA`, split de validacion (no verificados de forma independiente):

| Metrica | Profesor (`llava-interleave-qwen-0.5b`) | Zero-shot pre-KD (`adasplash_attention`) | Post-KD destilado (`adasplash_attention`) | Delta |
|---|---:|---:|---:|---:|
| Precision visual ScienceQA (%) | 63,75 | 35,62 | 53,12 | +17,50 |
| Perplejidad de respuesta condicionada por imagen | 2,45 | 3,87 | 2,62 | -1,26 |

Telemetria de entrenamiento: 190 pasos (69 etapa 1, 121 etapa 2), 120,7 s de duracion, pico de 20.180 MB de VRAM en RTX 3090 24 GB, marca temporal 2026-11-11T04:51:10Z.

## Requisitos de hardware

- VRAM estimada para inferencia: el entrenamiento consumio un pico de 20.180 MB en FP16 sobre RTX 3090; la inferencia en FP16 requiere aproximadamente 1-2 GB para el modelo base de 0,5 B mas el codificador SigLIP y el proyector, aunque no se publica una cifra oficial de inferencia.
- GPU recomendadas: NVIDIA RTX 3090 (validada en entrenamiento), RTX 4090, A100, H100. Cualquier GPU con al menos 8 GB de VRAM deberia poder ejecutar el modelo en FP16 segun el tamano del checkpoint base.
- Cabe en GPU de consumo: si, dado el tamano de 0,5 B del decodificador; se valido en RTX 3090.
- Opciones de despliegue: la libreria `neuralops` con `load_surgeried_model`, o `transformers` con `LlavaForConditionalGeneration` aplicando `apply_qwen_attention_surgery` y cargando `attention_weights.safetensors`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | ScienceQA VQA Acc | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Hooshaai/llava-qwen-0.5b-adasplash-attention-scienceqa` | 0,5 B (decodificador) | no disponible | 53,12 % | MIT | Hugging Face |
| `llava-hf/llava-interleave-qwen-0.5b-hf` (profesor) | 0,5 B (decodificador) | no disponible | 63,75 % | no disponible en la informacion | Hugging Face |
| Otros VLM de ~0,5 B | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparativa se limita al modelo profesor, ya que la informacion proporcionada no incluye datos de otros VLM comparables de la misma categoria.

## Limitaciones y advertencias

- Precision inferior al modelo profesor: 53,12 % frente a 63,75 % en ScienceQA, una brecha de 10,63 puntos porcentuales que persiste tras la destilacion.
- Perplejidad superior al profesor: 2,62 frente a 2,45, lo que indica mayor incertidumbre en la generacion de respuestas.
- Dominio estrecho: afinado exclusivamente sobre ScienceQA con imagen; el rendimiento fuera de ese dominio no esta documentado.
- Solo ingles: la model card declara unicamente el idioma `en`.
- Pesos parciales: el repositorio solo contiene los pesos de atencion y layernorm transplantados (682,17 MB); requiere descargar el modelo base `llava-hf/llava-interleave-qwen-0.5b-hf` por separado.
- Dependencia de codigo externo: la carga requiere los scripts de `scripts.benchmarks.qwen_zoo_train_mix` del repositorio NeuralOps, lo que anade una dependencia de mantenimiento.
- Metricas no verificadas: los resultados del model-index tienen `verified: false`; no hay evaluacion independiente publicada.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; cabe esperar el comportamiento tipico de un VLM de 0,5 B en tareas visuales.
- Sesgos: no documentados.
- Licencia MIT: permite uso comercial, pero el modelo base puede tener condiciones propias que deben revisarse por separado.
- Longitud de contexto no documentada: limita la planificacion de despliegues con conversaciones largas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Hooshaai/llava-qwen-0.5b-adasplash-attention-scienceqa
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Implementacion de AdaSplashAttention: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/layers/fast_kernels/adasplash_attention.py
- Licencia NeuralOps: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Modelo base: https://huggingface.co/llava-hf/llava-interleave-qwen-0.5b-hf
- Dataset ScienceQA: https://huggingface.co/datasets/derek-thomas/ScienceQA
