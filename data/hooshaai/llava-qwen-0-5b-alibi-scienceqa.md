# Hooshaai/llava-qwen-0.5b-alibi-scienceqa

## Resumen

llava-qwen-0.5b-alibi-scienceqa es un modelo de vision-lenguaje (VLM) publicado por Hooshaai que parte de `llava-hf/llava-interleave-qwen-0.5b-hf` y sustituye el mecanismo de atencion de 18 de sus 24 capas del decodificador por atencion con sesgos lineales (ALiBi). El resultado se ha destilado sobre el subconjunto con imagen del dataset ScienceQA. No se trata de un modelo de proposito general, sino de un artefacto de investigacion sobre cirugia de atencion: mide cuanto rendimiento multimodal se conserva cuando se reemplaza la atencion cuadratica por un mecanismo subcuadratico con extrapolacion de longitud.

La arquitectura combina un codificador visual SigLIP congelado, un proyector MLP de dos capas y un decodificador Qwen2 de 24 capas con dimension oculta 1024 y 16 cabezas. El modelo es deliberadamente pequeno (0,5 mil millones de parametros en el decodificador) y su repo pesa 1,0 GB, lo que permite reproducir los experimentos en una unica GPU de consumo. La relevancia actual reside en que cuantifica el coste de cambiar el esquema de atencion en un VLM: el modelo base acierta un 63,75 % en ScienceQA visual, la variante ALiBi sin destilar cae al 39,38 % y tras la destilacion recupera hasta el 51,25 %.

El modelo se distribuye con licencia MIT, solo en ingles y con una unica metrica publica verificable por el autor (no verificada de forma independiente). Es adecuado para quien quiera experimentar con atencion lineal en modelos multimodales, pero no para despliegues de produccion que requieran precision cercana al estado del arte.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLM tipo LLaVA: SigLIP (vision, congelado) + proyector MLP 2 capas + decodificador Qwen2 24 capas; atencion ALiBi en 18/24 capas (patron hybrid_3_1) |
| Parametros totales | 0,5 mil millones en el decodificador (aprox. 500 M; tamano del repo 1,0 GB) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (los pesos se publican en FP16) |
| Idiomas soportados | Ingles (en) |
| Licencia | MIT |
| Formato de pesos | `attention_weights.safetensors` (FP16, 459,16 MB) + configuracion de processor y tokenizer; requiere el modelo base para cargarse |
| Dimension del decodificador | D=1024, H=16, d_h=64 |
| Capas con atencion cuadratica (anclas) | Indices [3, 7, 11, 15, 19, 23] |
| Biblioteca | neuralops |

## Arquitectura y entrenamiento

El modelo es una variante de LLaVA-Interleave. El codificador visual SigLIP y el proyector multimodal MLP permanecen completamente congelados: los parches visuales se intercalan con los tokens de texto dentro de las capas del modelo de lenguaje. La intervencion afecta solo a la atencion del decodificador: 18 de las 24 capas usan `ALiBiAttention`, que aplica un sesgo aditivo por cabeza (`-slope_h * (i - j)` en modo causal) en lugar de embeddings posicionales, y 6 capas ancla mantienen atencion cuadratica estandar. Esta mezcla se denomina `hybrid_3_1`.

El entrenamiento es una destilacion en dos etapas sobre preguntas con imagen de `derek-thomas/ScienceQA`, con 388 pasos de optimizacion en total (130 en la etapa 1 y 258 en la etapa 2). La ejecucion duro 120,3 segundos con un pico de VRAM de 20.555 MB en una NVIDIA RTX 3090 de 24 GB. No se documenta el numero de tokens de entrenamiento, la composicion exacta del dataset ni si hubo RLHF o DPO. La innovacion tecnica es precisamente el contrato de vision congelada: al no tocar el codificador visual, el experimento aisla la capacidad del mecanismo ALiBi para enrutar informacion visual a texto bajo una sustitucion parcial de capas.

## Capacidades

- Generacion de texto condicionada por imagen (image-text-to-text) en tareas de razonamiento visual cientifico.
- Respuesta a preguntas de opcion multiple sobre imagenes de ScienceQA (biologia, fisica, quimica, ciencias de la tierra).
- Conversacion multimodal de un solo turno o multi-turno basica, heredada del modelo base LLaVA-Interleave.
- Razonamiento visual de corto alcance sobre diagramas y figuras cientificas.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible de forma explicita.
- Capacidades multilingues: solo ingles.
- Capacidades especiales (modo thinking, audio, vision adicional): vision integrada; no hay modo thinking ni audio.

## Casos de uso

- Investigacion sobre atencion lineal en VLMs: el modelo sirve como punto de comparacion controlado frente a `llava-interleave-qwen-0.5b-hf` para medir la perdida de precision al sustituir la atencion en 18 de 24 capas.
- Reproduccion de experimentos de cirugia de atencion: los pesos de atencion (459,16 MB) se cargan sobre el modelo base congelado y permiten replicar el pipeline en una RTX 3090 en unos dos minutos de entrenamiento.
- Prototipado de asistentes educativos de ciencias: con un 51,25 % de acierto en ScienceQA visual, es util para demos de respuesta a preguntas sobre figuras cientificas donde no se exige precision de produccion.
- Evaluacion de destilacion de conocimiento multimodal: la diferencia entre el estado pre-destilacion (39,38 %) y el post-destilacion (51,25 %) permite estudiar tecnicas de KD sobre mecanismos de atencion alternativos.
- Pruebas de extrapolacion de longitud: ALiBi no usa embeddings posicionales, lo que lo hace candidato para experimentos de generalizacion a secuencias mas largas que las de entrenamiento (la longitud de contexto efectiva no esta documentada).
- Docencia y formacion: el tamano de 0,5 mil millones de parametros y el requisito de VRAM moderado permiten ejecutarlo en entornos academicos con hardware limitado.
- Benchmark interno de pipelines NeuralOps: el modelo se integra mediante `load_surgeried_model` y sirve para validar el hub modular de la biblioteca.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model-index (no verificados de forma independiente), sobre el subconjunto con imagen de `derek-thomas/ScienceQA`, split de validacion:

| Metrica | Modelo base (teacher) | ALiBi zero-shot (pre-KD) | ALiBi destilado (post-KD) | Delta post-KD vs teacher |
|---|---:|---:|---:|---:|
| Precision visual ScienceQA (%) | 63,75 | 39,38 | 51,25 | -12,50 |
| Perplejidad de respuesta condicionada por imagen | 2,45 | 3,29 | 2,99 | +0,54 |

Telemetria del entrenamiento: 388 pasos (130 etapa 1, 258 etapa 2), 120,3 s de duracion total, pico de 20.555 MB de VRAM en RTX 3090 24 GB. No se han publicado resultados de MMLU, HumanEval ni GSM8K en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el pico de entrenamiento documentado es de 20.555 MB en FP16 con el modelo base completo; la inferencia en FP16 requiere aproximadamente 1-2 GB para los pesos del decodificador mas el codificador SigLIP y las activaciones, aunque no se publica una cifra exacta de inferencia.
- GPU recomendadas: NVIDIA RTX 3090 (validada por el autor para entrenamiento), RTX 4090, A100 o H100 para mayor throughput.
- Cabe en GPU de consumo: si, en tarjetas con 8 GB o mas de VRAM en FP16; en cuantizacion de 4 bits cabria en GPUs de 4-6 GB, aunque no se publican pesos GGUF ni cuantizados.
- Opciones de despliegue: `transformers` con `LlavaForConditionalGeneration` mas la funcion `apply_qwen_attention_surgery` del repositorio NeuralOps; API `neuralops.hub.load_surgeried_model`. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | ScienceQA visual | Licencia | Formato |
|---|---|---:|---:|---|---|
| llava-qwen-0.5b-alibi-scienceqa | 0,5 B (decodificador) | No disponible | 51,25 % | MIT | safetensors (solo atencion) |
| llava-interleave-qwen-0.5b-hf (base) | 0,5 B (decodificador) | No disponible | 63,75 % | No disponible en la informacion | safetensors |
| Otros VLM de ~0,5 B comparables | No disponible | No disponible | No disponible | No disponible | No disponible |

La comparativa directa solo es posible contra el modelo base, ya que no se han proporcionado datos de otros VLMs de tamano similar en la informacion disponible.

## Limitaciones y advertencias

- Precision limitada: el 51,25 % en ScienceQA visual esta 12,5 puntos por debajo del modelo base, por lo que no es adecuado para tareas que exijan exactitud alta.
- Entrenado exclusivamente sobre ScienceQA: el dominio se restringe a preguntas cientificas con imagen; el rendimiento fuera de ese dataset no esta documentado.
- Solo ingles: no soporta otros idiomas.
- Riesgo de alucinacion: al ser un modelo pequeno destilado en un unico dataset, la probabilidad de respuestas plausibles pero incorrectas es alta fuera del dominio de entrenamiento.
- Pesos incompletos: el repo solo contiene los pesos de atencion y layernorm transplantados (459,16 MB); es obligatorio cargar el modelo base `llava-hf/llava-interleave-qwen-0.5b-hf` y aplicar la cirugia de atencion, lo que anade complejidad al despliegue.
- Dependencia de la biblioteca NeuralOps: la carga requiere `neuralops` o el script `apply_qwen_attention_surgery`, no incluidos en el repo de Hugging Face.
- Resultados no verificados: las metricas de la model-index tienen `verified: false`; no hay evaluacion independiente.
- Licencia MIT: permite uso comercial, pero el modelo base puede tener condiciones adicionales no documentadas en esta ficha.
- Longitud de contexto no documentada: aunque ALiBi favorece la extrapolacion, no se especifica la ventana efectiva de entrenamiento ni de inferencia.
- Sin soporte de tool calling ni agentes: no apto para pipelines de automatizacion que requieran esas capacidades.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Hooshaai/llava-qwen-0.5b-alibi-scienceqa
- Modelo base: https://huggingface.co/llava-hf/llava-interleave-qwen-0.5b-hf
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Implementacion ALiBiAttention: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/layers/modern/alibi.py
- Licencia NeuralOps: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset ScienceQA: https://huggingface.co/datasets/derek-thomas/ScienceQA
