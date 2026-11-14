# Hooshaai/llava-qwen-0.5b-routing-attention-scienceqa

## Resumen

llava-qwen-0.5b-routing-attention-scienceqa es un checkpoint experimental publicado por Hooshaai dentro de lo que el autor denomina "LLaVA-Qwen-0.5B Multimodal Attention Surgery Zoo". Se construye sobre el modelo vision-lenguaje `llava-hf/llava-interleave-qwen-0.5b-hf` (torre visual SigLIP congelada, proyector MLP de dos capas y decodificador Qwen2 de 24 capas con dimension oculta 1024, 16 cabezas y head_dim 64) y sustituye el mecanismo de atencion de 18 de sus 24 capas por un operador disperso propietario denominado `RoutingAttention`, que agrupa consultas por contenido para aplicar atencion dispersa. Las 6 capas restantes (indices 3, 7, 11, 15, 19 y 23) se mantienen como anclas cuadraticas.

El objetivo del artefacto no es ofrecer un modelo listo para produccion, sino servir como banco de pruebas reproducible de "cirugia de atencion" y destilacion de conocimiento: el autor documenta el proceso completo, desde el modelo profesor hasta el checkpoint final, con telemetria de entrenamiento (285 pasos, 120,1 s, 14.613 MB de VRAM pico en una RTX 3090) y una auditoria del artefacto en disco. El resultado es un paquete de solo 53,12 MB de pesos en FP16 (frente a los 1,66 GB del modelo base completo, una reduccion del 96,9 %), lo que lo convierte en un caso de estudio interesante sobre compresion extrema de attention layers.

La relevancia actual es metodologica: demuestra como aislar, modificar y redistribuir unicamente las matrices de atencion de un VLM pequeno, manteniendo el resto de componentes congelados, y como evaluar el impacto en un benchmark multimodal concreto (ScienceQA, subconjunto STEM con imagen). Los resultados, sin embargo, son modestos: la precision final es del 31,25 %, identica a la del checkpoint pre-destilacion y muy por debajo del 63,75 % del profesor, lo que sugiere que la cirugia de atencion por si sola no preserva la capacidad de razonamiento visual.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal LLaVA (SigLIP vision tower + MLP projector + decodificador Qwen2) con atencion dispersa RoutingAttention en 18/24 capas |
| Parametros totales | No disponible (el paquete distribuido contiene solo pesos de atencion: 336 tensores, 53,12 MB en FP16) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | FP16 (unico formato publicado); no se documentan GGUF, INT8 ni INT4 |
| Idiomas soportados | Ingles (`en`) |
| Licencia | MIT |
| Formato de pesos | safetensors (`attention_weights.safetensors`, `weights_format=attention_only_fp16`) + `surgical_manifest.json` (schema `neuralops.surgery/v2`) |

## Arquitectura y entrenamiento

El modelo parte de `llava-interleave-qwen-0.5b-hf`, un VLM de tipo LLaVA Interleave con torre visual SigLIP congelada (27 capas), proyector MLP de dos capas y decodificador Qwen2 de 24 capas (D=1024, H=16, head_dim=64). La intervencion quirurgica sustituye el modulo `self_attn` de 18 de las 24 capas del decodificador por el operador `RoutingAttention` (familia `sparse`), que implementa agrupamiento basado en contenido para enrutar consultas hacia clusters y aplicar atencion dispersa. El esquema de capas es `hybrid_3_1`: se conservan 6 capas cuadraticas como anclas en los indices [3, 7, 11, 15, 19, 23]. Permanecen congelados y fuera del artefacto la torre visual, el proyector multimodal, los MLP del decodificador, los embeddings y las 6 capas ancla. Solo se guardan las matrices de atencion modificadas y los layernorms del decodificador entrenados.

El entrenamiento es una destilacion de conocimiento en dos etapas (129 + 156 pasos, 285 en total) ejecutada en una unica RTX 3090 de 24 GB durante 120,1 s, con un pico de 14.613 MB de VRAM. La evaluacion se realiza sobre el split de validacion de ScienceQA (subconjunto STEM con imagen) de `derek-thomas/ScienceQA`. Los datos publicados muestran que la destilacion reduce la perplejidad de 13,20 a 3,24 (frente a 2,45 del profesor) pero no mejora la precision respecto al checkpoint pre-destilacion (31,25 % en ambos casos, frente al 63,75 % del profesor). No se documentan detalles sobre el dataset de destilacion, la temperatura, la funcion de perdida ni el numero de tokens de entrenamiento.

## Capacidades

- Generacion de texto e image-text-to-text: responde preguntas en formato conversacional con una imagen de entrada, segun el pipeline declarado (`image-text-to-text`).
- Razonamiento visual basico sobre diagramas y figuras STEM, limitado al subconjunto de ScienceQA con imagen.
- Respuesta con letra de opcion en preguntas de eleccion multiple (formato documentado en el ejemplo de uso).
- Soporte de plantilla de chat (`chat_template.json`) para formateo conversacional.
- Capacidades multilingues: solo ingles.
- Tool calling / function calling: no disponible.
- Modo de razonamiento extendido (thinking): no disponible.
- Entrada de audio o video: no disponible.
- Capacidad de agente multi-paso: no disponible.

## Casos de uso

- Investigacion en mecanismos de atencion dispersa: el checkpoint sirve como referencia reproducible para comparar `RoutingAttention` frente a atencion cuadratica en un VLM pequeno, dado que el autor publica el manifiesto quirurgico completo y la telemetria de entrenamiento.
- Docencia y divulgacion sobre destilacion de conocimiento: el par profesor (63,75 % de precision) frente al estudiante (31,25 %) permite ilustrar el coste de comprimir attention layers sin reentrenar el resto del modelo.
- Prototipado de pipelines de "attention surgery": el formato `neuralops.surgery/v2` y el script de carga (`load_surgeried_model`) permiten experimentar con sustituciones de operadores sin tocar la torre visual ni el proyector.
- Auditoria de artefactos de modelos: el repositorio incluye un inventario byte a byte de cada fichero, util para estudiar trazabilidad y verificacion de manifiestos en despliegues regulados.
- Benchmarking de compresion extrema: con 53,12 MB de pesos de atencion frente a 1,66 GB del modelo base, es un punto de comparacion para tecnicas de poda y cuantizacion en VLMs de menos de 1B parametros.
- Experimentos academicos sobre ScienceQA: como baseline debil y reproducible para estudiar el efecto de la atencion dispersa en tareas STEM multimodales, siempre que se documente la limitacion de precision.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre ScienceQA (Image-Bearing STEM Subset, validation), sin verificacion independiente (`verified: false`):

| Metrica | Profesor | Pre-KD (zero-shot) | Post-KD (final) | Delta |
|---|---:|---:|---:|---:|
| Precision (%) | 63,75 | 31,25 | 31,25 | +0,00 |
| Perplejidad | 2,45 | 13,20 | 3,24 | -9,96 |

Telemetria de entrenamiento declarada: 285 pasos (129 en etapa 1, 156 en etapa 2), 120,1 s de duracion total, 14.613 MB de VRAM pico en una NVIDIA GeForce RTX 3090 (24 GB).

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; el entrenamiento consumio 14.613 MB en una RTX 3090, por lo que la inferencia en FP16 con el modelo base completo deberia caber en GPUs de 16 GB o mas.
- GPU recomendadas: RTX 3090 (validada por el autor), A100, H100, L40S y RTX 4090 por capacidad de memoria; no se han publicado mediciones en estas GPUs.
- Cabe en GPU de consumo: si, previsiblemente en RTX 3090, RTX 4080/4090 y superiores, dado el tamano del modelo base (1,66 GB en FP16) y el caracter ligero del checkpoint (53,12 MB de pesos de atencion).
- Opciones de despliegue: la libreria `neuralops` mediante `neuralops.hub.load_surgeried_model`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | ScienceQA (val, imagen) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| llava-qwen-0.5b-routing-attention-scienceqa | No disponible (solo pesos de atencion, 53,12 MB) | No disponible | 31,25 % acc / 3,24 PPL | MIT | Hugging Face (24 descargas) |
| llava-hf/llava-interleave-qwen-0.5b-hf (modelo base) | ~0,5B en el decodificador | No disponible | No disponible en esta ficha | No disponible en esta ficha | Hugging Face |
| Modelo profesor de la destilacion | No disponible | No disponible | 63,75 % acc / 2,45 PPL | No disponible | No disponible |

No se dispone de datos suficientes para comparar con alternativas de la misma categoria (por ejemplo, otros VLMs de menos de 1B parametros) mas alla del modelo base y del profesor citados por el autor.

## Limitaciones y advertencias

- Precision muy baja: 31,25 % en ScienceQA frente al 63,75 % del profesor, sin mejora tras la destilacion; no es apto para tareas de razonamiento visual en produccion.
- Artefacto parcial: el repositorio solo contiene pesos de atencion (336 tensores) y requiere el modelo base y la libreria `neuralops` para reconstruir el modelo completo; no es un checkpoint autonomo.
- Idiomas: exclusivamente ingles, lo que limita su uso en castellano sin adaptacion.
- Contexto: no se documenta la longitud de contexto soportada.
- Riesgo de alucinacion: alto en tareas fuera del dominio STEM con imagen; no se han publicado evaluaciones de robustez ni de calibracion.
- Sesgos: no se documenta ningun analisis de sesgos; el dataset ScienceQA tiene una distribucion curricular especifica que puede introducir sesgos de dominio.
- Licencia MIT: permite uso comercial, pero el modelo base `llava-interleave-qwen-0.5b-hf` puede tener condiciones propias que deben verificarse por separado.
- Verificacion: las metricas estan marcadas como `verified: false`; no han sido reproducidas de forma independiente.
- Madurez: 24 descargas y 0 likes en el momento de la consulta; autor unico y sin soporte comunitario documentado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Hooshaai/llava-qwen-0.5b-routing-attention-scienceqa
- Modelo base: https://huggingface.co/llava-hf/llava-interleave-qwen-0.5b-hf
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Implementacion de RoutingAttention: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/layers/sparse/routing_attention.py
- Licencia MIT del proyecto: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset ScienceQA (derek-thomas): https://huggingface.co/datasets/derek-thomas/ScienceQA
