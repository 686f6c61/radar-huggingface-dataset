# Hooshaai/llava-qwen-0.5b-hgrn2-gated-outer-scienceqa

## Resumen

llava-qwen-0.5b-hgrn2-gated-outer-scienceqa es un checkpoint multimodal de tipo vision-language derivado de llava-hf/llava-interleave-qwen-0.5b-hf mediante una tecnica de "cirugia de atencion" (attention surgery) implementada en el framework NeuralOps. El modelo sustituye el mecanismo de atencion cuadratica en 18 de las 24 capas del decodificador Qwen2 por un bloque recurrente de atencion lineal con compuerta de olvido, denominado HGRN2GatedOuterBlock, manteniendo seis capas de atencion cuadratica como anclas y congelando la torre de vision SigLIP, el proyector MLP y los MLP del decodificador.

El resultado es un artefacto de pesos de solo 148,08 MB (frente a 1,66 GB del modelo base completo, una reduccion del 91,3 %), pensado para investigacion sobre eficiencia de atencion y destilacion de conocimiento. El autor lo ha afinado sobre el subconjunto de ScienceQA con imagenes y lo evalua en la validacion de ese dataset, obteniendo 34,38 % de accuracy y una perplexidad de 3,90 tras la destilacion.

Es relevante ahora porque ejemplifica una linea de trabajo activa en IA open source: la substitucion modular de capas de atencion por alternativas lineales o recurrentes con compuertas, combinada con destilacion offline desde un profesor con congelacion de pesos, que permite reducir drasticamente el coste de almacenamiento y de inferencia manteniendo parte de la capacidad del modelo original. No obstante, el propio autor documenta una perdida de 5 puntos de accuracy respecto al estado pre-destilacion y de casi 29 puntos respecto al profesor, lo que lo situa como artefacto experimental mas que como modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LLaVA interleaved: torre de vision SigLIP congelada (27 capas) + proyector MLP de 2 capas + decodificador Qwen2 de 24 capas (D=1024, H=16, head_dim=64); 18/24 capas con atencion lineal recurrente HGRN2GatedOuterBlock y 6 capas con atencion cuadratica como anclas |
| Parametros totales | no disponible (el repo declara solo el tamano del artefacto de pesos: 148,08 MB en FP16) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (los pesos serializados estan en FP16 safetensors; no se documentan variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | safetensors (attention_weights.safetensors, FP16), con surgical_manifest.json, config.json y tokenizer BPE en formato fast |

## Arquitectura y entrenamiento

La arquitectura parte de llava-interleave-qwen-0.5b-hf: un VLM compuesto por una torre de vision SigLIP congelada, un proyector MLP de dos capas que alinea los tokens visuales con el espacio del decodificador, y un decodificador Qwen2 de 24 capas con dimension oculta 1024, 16 cabezas de atencion y head_dim 64. La intervencion NeuralOps sustituye la self_attn en 18 de esas 24 capas por HGRN2GatedOuterBlock, un bloque de atencion lineal recurrente basado en productos externos con compuerta de olvido por cabeza: S_t = f_t · S_{t-1} + k_t^T · v_t, con salida y_t = q_t · S_t normalizada por state_norm y escalada por output_scale. Se preservan seis capas con atencion cuadratica en las posiciones [3, 7, 11, 15, 19, 23] bajo el esquema hybrid_3_1, y se congelan la torre de vision, el proyector multimodal, los MLP y los embeddings.

El entrenamiento es una destilacion de conocimiento offline mediante la arquitectura de cache de representaciones de NeuralOps (seccion 21.1), ejecutada en una unica RTX 3090 de 24 GB con 0 MB de VRAM de profesor en GPU. Se realizaron 28 pasos de optimizacion en dos etapas (9 pasos en la etapa 1 y 19 en la etapa 2), con 123,1 s de duracion total y un pico de 18.326 MB de VRAM. Solo se entrenan y serializan las self_attn modificadas y las layernorms del decodificador, lo que explica el reducido tamano del artefacto. El dataset de ajuste es derek-thomas/ScienceQA, en el subconjunto STEM con imagenes.

## Capacidades

- Generacion de texto condicionada por imagen (image-text-to-text) mediante pipeline conversacional.
- Razonamiento visual sobre diagramas y figuras STEM, orientado a preguntas de opcion multiple en ScienceQA.
- Conversacion multimodal multi-turno, gracias a la plantilla de chat incluida (chat_template.json).
- Procesamiento de imagenes con preprocesador SigLIP configurado (preprocessor_config.json).
- Capacidad de tool calling / function calling: no disponible (no documentada en la model card).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado).
- Capacidades multilingues: limitadas al ingles, unico idioma declarado.
- Modo thinking, vision adicional, audio o video: no disponible.

## Casos de uso

- Investigacion sobre eficiencia de atencion: sirve como referencia reproducible para comparar atencion cuadratica frente a HGRN2 gated outer en un VLM pequeno, dado que el repositorio incluye el manifiesto quirurgico y las metricas de telemetria.
- Experimentos de destilacion con profesor congelado: el artefacto de 148 MB permite iterar rapidamente sobre tecnicas de KD offline en una sola GPU consumer, con coste de almacenamiento minimo.
- Fine-tuning sobre dominios STEM educativos: al estar ajustado en ScienceQA, puede servir de base para tareas de preguntas y respuestas sobre figuras cientificas, aunque su accuracy actual (34,38 %) exige validacion adicional.
- Prototipado de asistentes educativos multimodales: util para construir demos de tutoria sobre diagramas y graficos en ingles, con la ventaja de que el modelo completo cabe en VRAM de una RTX 3090.
- Benchmarking interno de pipelines NeuralOps: el checkpoint permite verificar la carga via neuralops.hub.load_surgeried_model y medir latencia y perplexidad en entornos controlados.
- Estudio de compressibilidad de modelos multimodales: la reduccion del 91,3 % del footprint de pesos respecto al base es un caso de estudio util para evaluar tecnicas de cirugia de atencion en produccion de artefactos.
- Base para ablaciones controladas: las seis capas cuadraticas ancla permiten comparar variantes del esquema hybrid_3_1 sin reentrenar la torre de vision.

## Benchmarks y rendimiento

Resultados declarados por el autor en el model-index, no verificados de forma independiente:

| Metrica | Profesor (baseline) | Pre-KD / zero-shot | Post-KD / final | Delta |
|---|---:|---:|---:|---:|
| Accuracy (%) en ScienceQA (Image-Bearing STEM Subset, validation) | 63,75 | 39,38 | 34,38 | -5,00 |
| Perplexidad (PPL) en ScienceQA (Image-Bearing STEM Subset, validation) | 2,45 | 761,76 | 3,90 | -757,86 |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- El checkpoint completo (148,08 MB en FP16) y el paquete total (163,27 MB) caben holgadamente en cualquier GPU consumer; no se requiere VRAM significativa para almacenar los pesos.
- La inferencia requiere cargar el modelo base llava-interleave-qwen-0.5b-hf (1,66 GB) junto con los pesos quirurgicos, por lo que el consumo efectivo de VRAM sera el del base mas los deltas.
- GPU recomendadas: RTX 3090 (24 GB) fue la utilizada por el autor para el entrenamiento; para inferencia, cualquier GPU con al menos 8 GB de VRAM deberia ser suficiente, aunque no se documentan cifras exactas.
- Cabe en GPU consumer: si, incluidas RTX 3060, RTX 4060 y superiores, segun el tamano del base (0,5B parametros).
- Opciones de despliegue: la libreria neuralops con load_surgeried_model; para vLLM, llama.cpp, Ollama o TGI no se documenta compatibilidad, ya que los pesos son deltas quirurgicos y no un checkpoint completo autonomo.
- Latencia y throughput: no disponibles. La telemetria de entrenamiento reporta 123,1 s para 28 pasos y 18.326 MB de pico de VRAM, pero no hay mediciones de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| llava-qwen-0.5b-hgrn2-gated-outer-scienceqa | no disponible (0,5B en el base) | no disponible | 34,38 % accuracy / 3,90 PPL en ScienceQA | MIT | Hugging Face (40 descargas) |
| llava-hf/llava-interleave-qwen-0.5b-hf (base) | 0,5B | no disponible | Profesor declarado: 63,75 % accuracy / 2,45 PPL | MIT (heredada) | Hugging Face, ampliamente usado |
| Otros modelos de la serie NeuralOps Attention Zoo | no disponible | no disponible | no disponible | MIT | Hugging Face (artefactos experimentales) |
| Alternativas VLM pequenas tipo SmolVLM o Qwen2-VL-2B | no disponible en la informacion proporcionada | no disponible | no disponible | no disponible | no disponible |

La comparativa con alternativas comerciales o de otros autores no puede completarse con datos verificables a partir de la informacion disponible; se indica "no disponible" en las celdas que no estan documentadas.

## Limitaciones y advertencias

- Perdida de rendimiento documentada: el modelo final pierde 5 puntos de accuracy frente al estado pre-destilacion y casi 29 puntos frente al profesor, lo que lo invalida para uso en produccion sin validacion adicional.
- Artefacto de pesos incompleto: solo contiene deltas quirurgicos (18/24 capas de atencion y layernorms); requiere cargar el modelo base llava-interleave-qwen-0.5b-hf para funcionar, lo que complica el despliegue con runtimes estandar.
- Sesgos conocidos: no documentados en la model card; al derivar de Qwen2 y entrenarse en ScienceQA, hereda los sesgos del base y del dataset, pero no hay evaluacion especifica.
- Riesgo de alucinacion: elevado en tareas fuera del dominio STEM con imagenes; la perplexidad pre-KD de 761,76 evidencia inestabilidad antes de la destilacion, y la cobertura de evaluacion se limita a un unico dataset.
- Limitaciones de idioma: solo ingles; no hay soporte multilingue declarado.
- Limitaciones de contexto: la longitud de contexto no esta documentada, y la atencion lineal recurrente puede degradar el rendimiento en secuencias largas frente a la atencion cuadratica original.
- Restricciones de licencia: MIT permite uso comercial, pero el modelo base y el dataset ScienceQA pueden tener condiciones adicionales que deben verificarse por separado.
- Caveat de produccion: las metricas del model-index estan marcadas como no verificadas (verified: false) y proceden del propio autor; deben tratarse como resultados preliminares.
- Madurez: 40 descargas y 0 likes en el momento de redactar la ficha; modelo experimental con escasa validacion comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Hooshaai/llava-qwen-0.5b-hgrn2-gated-outer-scienceqa
- Modelo base: https://huggingface.co/llava-hf/llava-interleave-qwen-0.5b-hf
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Implementacion del bloque HGRN2GatedOuterBlock: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/layers/gated/hgrn2_gated_outer.py
- Licencia MIT del proyecto: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset ScienceQA (derek-thomas): https://huggingface.co/datasets/derek-thomas/ScienceQA
- Papers, blogs y demos adicionales: no disponibles en la informacion proporcionada.
