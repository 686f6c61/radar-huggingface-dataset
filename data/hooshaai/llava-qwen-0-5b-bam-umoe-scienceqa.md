# Hooshaai/llava-qwen-0.5b-bam-umoe-scienceqa

## Resumen

llava-qwen-0.5b-bam-umoe-scienceqa es un modelo de vision-lenguaje (VLM) derivado de `llava-hf/llava-interleave-qwen-0.5b-hf`, publicado por el autor Hooshaai bajo el marco NeuralOps de Taha Majlesi. El modelo parte de la arquitectura LLaVA interleave: un codificador visual SigLIP congelado, un proyector MLP de dos capas y un decodificador de lenguaje Qwen2 de 24 capas con dimension oculta D=1024 y 16 cabezas de atencion (d_h=64). Sobre esa base se aplica una "cirugia de atencion" que sustituye 18 de las 24 capas de atencion del decodificador por el operador disperso `bam_umoe` (BAMUMoEBlock, "Unified Mixture of Experts Attention Block"), manteniendo 6 capas cuadraticas de anclaje en las posiciones [3, 7, 11, 15, 19, 23] bajo el patron `hybrid_3_1`.

El modelo se ha destilado sobre preguntas con imagen del dataset ScienceQA (`derek-thomas/ScienceQA`), con el objetivo de evaluar como un mecanismo subcuadratico tipo mezcla de expertos maneja el enrutamiento cross-modal denso vision-texto cuando la torre visual permanece completamente congelada. El repositorio publica unicamente los pesos de atencion y layernorm transplantados (378,19 MB en FP16), que se cargan sobre la base LLaVA original, no un checkpoint completo autonomo.

Es relevante ahora por dos motivos: por un lado, es un experimento reproducible sobre atencion eficiente en VLMs de pequeno tamano, un area con poco trabajo empirico publicado; por otro lado, los resultados muestran una caida notable frente al modelo profesor (31,25 % de accuracy visual frente a 63,75 %), lo que convierte esta ficha en un caso de estudio sobre el coste real de sustituir atencion cuadratica por operadores dispersos en tareas multimodales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LLaVA interleave: SigLIP (vision tower congelada) + proyector MLP de 2 capas + decodificador Qwen2 de 24 capas; 18/24 capas de atencion sustituidas por `bam_umoe` (BAMUMoEBlock, familia sparse) con patron `hybrid_3_1` y anclas cuadraticas en [3, 7, 11, 15, 19, 23] |
| Parametros totales | no disponible (la base LLaVA-Qwen-0.5B sugiere ~0,5 mil millones en el decodificador; el autor no declara el total) |
| Parametros activos | no disponible (el autor describe BAMUMoEBlock como bloque de mezcla de expertos, pero no publica numero de expertos ni parametros activos) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (los pesos publicados estan en FP16; no se documentan variantes GGUF, AWQ, GPTQ ni int8) |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | safetensors (`attention_weights.safetensors`, 378,19 MB, FP16) cargados sobre la base `llava-hf/llava-interleave-qwen-0.5b-hf`; configs de processor y tokenizer incluidas |
| Geometria del decodificador | 24 capas, D=1024, H=16, d_h=64 |
| Libreria | neuralops |
| Tamano del repositorio | 0,8 GB |

## Arquitectura y entrenamiento

La arquitectura es un VLM LLaVA interleave clasico en el que los tokens de parche visual extraidos por la torre SigLIP congelada se intercalan con los tokens de texto dentro de `language_model.model.layers`. La innovacion tecnica central es la "attention surgery": el script `apply_qwen_attention_surgery` reemplaza 18 bloques de atencion por `BAMUMoEBlock` (operador disperso de mezcla de expertos con enrutamiento sensible a activaciones) y conserva 6 capas cuadraticas como anclas, distribuidas uniformemente cada cuatro capas. La torre visual y el proyector multimodal se mantienen completamente congelados, de modo que el experimento aisla la capacidad del mecanismo subcuadratico para manejar el enrutamiento cross-modal denso sin reentrenar la percepcion.

El entrenamiento es una destilacion en dos etapas sobre preguntas con imagen de `derek-thomas/ScienceQA`: 238 pasos de optimizacion en total (92 en la etapa 1 y 146 en la etapa 2), con una duracion de 120,3 segundos y un pico de 17.280 MB de VRAM en una NVIDIA RTX 3090 de 24 GB. No se documentan el numero de tokens de entrenamiento, la composicion exacta del dataset, ni si hubo RLHF o DPO; el autor solo indica destilacion sobre la base LLaVA original. Los artefactos publicados incluyen `attention_weights.safetensors`, las configs de processor y tokenizer y `training_metrics.json`.

## Capacidades

- Generacion de texto condicionada por imagen (pipeline `image-text-to-text`) para preguntas de opcion multiple sobre contenido visual.
- Razonamiento visual basico en el dominio de ciencia elemental: el modelo se ha destilado especificamente sobre el subconjunto con imagen de ScienceQA.
- Conversacion multimodal multi-turno (tag `conversational`), heredada de la base LLaVA interleave.
- Soporte de tool calling / function calling: no disponible; no se documenta en la model card.
- Soporte de agentes y razonamiento multi-paso: no disponible; no se documenta.
- Capacidades multilingues: limitadas al ingles (unico idioma declarado).
- Modo thinking, vision adicional, audio: no disponible; solo vision e imagen-texto.
- Capacidad de cargarse mediante la API universal de NeuralOps (`load_surgeried_model`) o manualmente con `transformers` aplicando la cirugia de atencion.

## Casos de uso

- Evaluacion de mecanismos de atencion eficiente en VLMs: el modelo sirve como banco de pruebas controlado para medir como `bam_umoe` afecta el enrutamiento vision-texto con la torre visual congelada, comparando directamente contra el profesor LLaVA-Qwen-0.5B.
- Investigacion academica sobre destilacion de attention blocks: el repositorio incluye `training_metrics.json` y telemetria de pasos, VRAM y duracion, lo que permite reproducir la destilacion en una RTX 3090 de 24 GB.
- Prototipado de asistentes educativos de ciencia basica: para preguntas de opcion multiple con imagen en ingles, el modelo puede integrarse en un pipeline de demostracion, aunque con una precision del 31,25 % que limita el uso en produccion real.
- Docencia y formacion en arquitecturas multimodales: al requerir solo la carga de pesos de atencion sobre una base publica, es un ejemplo practico de "cirugia" modular de capas para cursos de arquitecturas eficientes.
- Experimentos de ablacion sobre patrones hibridos: permite comparar `hybrid_3_1` con otras configuraciones de anclas cuadraticas sin reentrenar la torre visual, gracias a la separacion entre pesos de atencion y base congelada.
- Integracion en pipelines de investigacion con NeuralOps: la API `load_surgeried_model` facilita incorporar el modelo en notebooks y scripts de evaluacion comparativa frente a otros operadores del "Attention Zoo".
- Base para fine-tuning posterior en dominios cientificos: al ser un checkpoint pequeno (0,8 GB de repositorio) y con licencia MIT, puede servir como inicializacion para experimentos de adaptacion a otros datasets visuales.

## Benchmarks y rendimiento

Resultados declarados por el autor en el model-index (no verificados, `verified: false`), sobre `derek-thomas/ScienceQA`, split de validacion, subconjunto con imagen:

| Metrica | Profesor (`llava-interleave-qwen-0.5b`) | Pre-KD zero-shot (`bam_umoe`) | Post-KD destilado (`bam_umoe`) | Delta |
|---|---:|---:|---:|---:|
| ScienceQA Visual Accuracy (%) | 63,75 | 31,25 | 31,25 | +0,00 |
| Perplexity de respuesta condicionada por imagen | 2,45 | 5,62 | 3,02 | -2,60 |

La destilacion reduce la perplexity de 5,62 a 3,02 (-2,6 puntos), pero no mejora la accuracy visual, que se mantiene en 31,25 % tanto antes como despues del KD. El autor no publica comparaciones con otros modelos de la misma categoria ni resultados en MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada para inferencia: el autor reporta un pico de 17.280 MB durante el entrenamiento en FP16; para inferencia en FP16 con la base LLaVA-Qwen-0.5B y los pesos de atencion de 378,19 MB, el consumo deberia ser inferior, aunque no se publica una cifra medida.
- GPU recomendadas: NVIDIA RTX 3090 (24 GB) es la GPU usada en el entrenamiento; cualquier GPU con al menos 16 GB de VRAM deberia ser suficiente para FP16 segun el pico reportado.
- Cabe en GPU consumer: si, en RTX 3090, RTX 4080/4090 y previsiblemente en GPUs de 16 GB; no se documenta el comportamiento en GPUs de 8 GB.
- Opciones de despliegue: `transformers` con `LlavaForConditionalGeneration` mas la cirugia `apply_qwen_attention_surgery`, o la API `neuralops.hub.load_surgeried_model`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; solo se publica la duracion de entrenamiento (120,3 s para 238 pasos) y el pico de VRAM.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | ScienceQA Visual Acc | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| llava-qwen-0.5b-bam-umoe-scienceqa | no disponible (~0,5B en el decodificador) | no disponible | 31,25 % | MIT | Pesos de atencion sobre base LLaVA |
| llava-hf/llava-interleave-qwen-0.5b-hf (profesor) | ~0,5B en el decodificador | no disponible | 63,75 % | no disponible en la informacion proporcionada | Checkpoint completo en Hugging Face |
| Otros VLMs de ~0,5B (p. ej. SmolVLM, Qwen2-VL-2B) | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparativa se limita al modelo profesor, del que este checkpoint es una variante con cirugia de atencion; no hay datos publicados en la informacion proporcionada para comparar con otras familias de VLMs pequenos.

## Limitaciones y advertencias

- Caida de rendimiento significativa: la accuracy visual (31,25 %) es aproximadamente la mitad de la del profesor (63,75 %), y la destilacion no recupera esa brecha; el modelo no es adecuado para produccion en tareas de VQA cientifica.
- Pesos incompletos: el repositorio solo contiene pesos de atencion y layernorm (378,19 MB); es imprescindible cargar la base `llava-hf/llava-interleave-qwen-0.5b-hf` y aplicar la cirugia, lo que anade complejidad y dependencia de codigo externo (`scripts/benchmarks/qwen_zoo_train_mix`).
- Resultados no verificados: las metricas del model-index tienen `verified: false` y proceden del propio autor; no hay evaluacion independiente.
- Sesgos conocidos: no documentados; al entrenarse solo sobre ScienceQA en ingles, el modelo hereda los sesgos de ese dataset y de la base LLaVA.
- Riesgo de alucinacion: no evaluado; la perplexity de 3,02 indica que el modelo sigue generando respuestas con incertidumbre considerable.
- Limitacion idiomatica: solo ingles; no se declara soporte para castellano ni otros idiomas.
- Contexto: no se publica la longitud de contexto soportada; no se puede planificar su uso en conversaciones largas.
- Licencia: MIT, lo que permite uso comercial, pero la base LLaVA-Qwen-0.5B tiene su propia licencia que debe verificarse por separado antes de un despliegue comercial.
- Mantenimiento: 55 descargas y 0 likes en el momento de la consulta; es un artefacto de investigacion, no un modelo con soporte activo.

## Enlaces

- Hugging Face: https://huggingface.co/Hooshaai/llava-qwen-0.5b-bam-umoe-scienceqa
- Modelo base: https://huggingface.co/llava-hf/llava-interleave-qwen-0.5b-hf
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Implementacion de `bam_umoe`: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/layers/sparse/bam_umoe.py
- Licencia NeuralOps: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset ScienceQA: https://huggingface.co/datasets/derek-thomas/ScienceQA
