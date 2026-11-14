# Hooshaai/llava-qwen-0.5b-samba-m3-scienceqa

## Resumen

llava-qwen-0.5b-samba-m3-scienceqa es un checkpoint experimental de visión-lenguaje publicado por Hooshaai dentro del ecosistema NeuralOps, un marco de "cirugía de atención" que sustituye bloques de atención cuadrática por operadores alternativos en modelos preentrenados. En concreto, parte de llava-hf/llava-interleave-qwen-0.5b-hf (torre visual SigLIP congelada, proyector MLP de 2 capas y decodificador Qwen2 de 24 capas con dimensión 1024) y reemplaza la atención en 18 de sus 24 capas por el operador SAMBAM3Block, que combina atención local de ventana deslizante con un componente Mamba espectral (SSM). El resultado es un artefacto de pesos de solo 296,34 MB frente a los 1,66 GB del modelo base, una reducción del 82,6 %.

El modelo está afinado y destilado específicamente para ScienceQA, un conjunto de preguntas de razonamiento visual de tipo STEM con imágenes, y declara una precisión del 56,88 % y una perplejidad de 2,54 en el subconjunto de validación con imágenes. Su interés no es tanto el rendimiento absoluto como la demostración metodológica: cuánto se puede comprimir un VLM pequeño mediante sustitución selectiva de capas de atención y destilación de conocimiento, manteniendo una fracción razonable de la capacidad del profesor (63,75 % de precisión).

Se trata de un modelo de nicho, de 0,5 mil millones de parámetros, con solo 24 descargas y 1 like en el momento de la consulta, orientado a investigación y experimentación más que a producción. La licencia MIT facilita su reutilización, pero su alcance funcional está acotado al inglés y a tareas de pregunta-respuesta visual sobre material científico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LLaVA (torre visual SigLIP + proyector MLP + decodificador Qwen2) con cirugía de atención: 18/24 capas sustituidas por SAMBAM3Block (atención local de ventana deslizante + Mamba espectral, familia SSM); 6 capas ancla cuadráticas en índices [3, 7, 11, 15, 19, 23] |
| Parametros totales | 0,5 mil millones (modelo base); el artefacto guardado contiene 660 tensores con solo los pesos de atención modificados y layernorms del decodificador |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (los pesos se distribuyen en FP16 safetensors; no se documentan variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | inglés (en) |
| Licencia | MIT |
| Formato de pesos | safetensors (attention_only_fp16, 296,34 MB) + surgical_manifest.json (schema_version=neuralops.surgery/v2) |

## Arquitectura y entrenamiento

La arquitectura base es LLaVA-Interleave con Qwen2-0.5B como decodificador: 24 capas, dimensión oculta 1024, 16 cabezas de atención con head_dim de 64, torre visual SigLIP congelada de 27 capas y proyector multi-modal MLP de 2 capas. Sobre esta base, NeuralOps aplica una "cirugía" híbrida 3:1 (`hybrid_3_1`) que sustituye la atención en 18 de las 24 capas del decodificador por bloques SAMBAM3Block, manteniendo 6 capas de atención cuadrática como anclas en los índices [3, 7, 11, 15, 19, 23]. Los MLP del decodificador, los embeddings, la torre visual y el proyector permanecen congelados y no se serializan en el artefacto.

El entrenamiento se realizó en dos etapas de destilación de conocimiento desde el modelo profesor (el LLaVA-Qwen-0.5B original, con 63,75 % de precisión en ScienceQA): 31 pasos en la etapa 1 y 60 en la etapa 2, 91 pasos en total, durante 120,7 segundos en una única RTX 3090 con un pico de 15.121 MB de VRAM. Solo se entrenaron las atenciones modificadas y los layernorms del decodificador. El ajuste parte de un estado cero-shot de 33,75 % de precisión y 3,23 de perplejidad, y lo lleva a 56,88 % y 2,54 respectivamente, recuperando 23,13 puntos de precisión y reduciendo la perplejidad en 0,69 respecto al punto de partida.

## Capacidades

- Generación de texto condicionada por imagen en formato pregunta-respuesta (image-text-to-text).
- Razonamiento visual sobre diagramas y figuras de contenido STEM (ciencia, tecnología, ingeniería y matemáticas).
- Respuesta de opción múltiple con selección de letra, formato típico de ScienceQA.
- Conversación multi-turno mediante plantilla de chat incluida (`chat_template.json`).
- Procesamiento de imágenes a través del preprocesador SigLIP configurado en el repositorio.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso explícito.
- Capacidad multilingüe limitada al inglés; no se declaran otros idiomas.
- No se documentan modos especiales como thinking mode, audio o vídeo.

## Casos de uso

- Investigación en compresión de modelos: servir como referencia reproducible de cómo sustituir atención cuadrática por SSM híbridos en un VLM y medir la pérdida de precisión resultante (de 63,75 % a 56,88 % en ScienceQA).
- Evaluación de operadores de atención alternativos: comparar SAMBAM3Block frente a otras variantes del "attention zoo" de NeuralOps sobre el mismo checkpoint base y el mismo conjunto de validación.
- Docencia y prototipado de asistentes educativos STEM: el modelo responde preguntas de ciencia con imagen y opciones múltiples, adecuado para demos de tutoría automatizada en inglés.
- Despliegue en hardware muy limitado: con 296,34 MB de pesos en FP16 y un pico de entrenamiento de 15 GB en una RTX 3090, la inferencia cabe en GPUs de consumo con holgura; útil para pruebas en entornos sin aceleradores de gama alta.
- Destilación de conocimiento como técnica: el par profesor/alumno documentado (63,75 % frente a 56,88 %) sirve de caso de estudio para diseñar pipelines de KD sobre modelos pequeños.
- Benchmarking de robustez visual: usar ScienceQA con imágenes como testbed controlado para medir la degradación de un VLM al recortar capas de atención.
- Integración en pipelines de NeuralOps: cargar el checkpoint con `load_surgeried_model` para experimentar con la API del hub y el manifiesto quirúrgico (`surgical_manifest.json`).

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados) sobre ScienceQA (Image-Bearing STEM Subset, validation):

| Metrica | Profesor (base) | Zero-shot (pre-KD) | Final (post-KD) | Delta |
|---|---:|---:|---:|---:|
| Precisión (%) | 63,75 | 33,75 | 56,88 | +23,13 |
| Perplejidad | 2,45 | 3,23 | 2,54 | -0,69 |

No se han publicado resultados de otros benchmarks (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el artefacto de pesos ocupa 296,34 MB en FP16, por lo que la inferencia completa (incluyendo torre visual y decodificador base) requiere cargar además los componentes congelados del modelo base.
- El entrenamiento se realizó en una NVIDIA GeForce RTX 3090 (24 GB) con un pico de 15.121 MB de VRAM, lo que da una cota superior holgada para el ajuste.
- GPU recomendadas: RTX 3090, RTX 4090, A100 o H100 para entrenamiento o experimentación; para inferencia basta con GPUs de consumo con al menos 8-12 GB, aunque el dato exacto no está documentado.
- Cabe en GPU de consumo: sí, con alta probabilidad, dado el tamaño del modelo (0,5 B de parámetros) y el peso del artefacto (296 MB).
- Opciones de despliegue: la model card solo documenta la API `neuralops.hub.load_surgeried_model`; no se mencionan vLLM, llama.cpp, Ollama ni TGI, y el formato de pesos quirúrgico (attention_only_fp16) no es directamente compatible con esos motores sin reconstruir el modelo completo.
- Latencia y throughput: no disponibles; el único dato de telemetría es el tiempo de entrenamiento (120,7 s para 91 pasos).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Precisión ScienceQA | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| llava-qwen-0.5b-samba-m3-scienceqa | 0,5 B | no disponible | 56,88 % (val, con imágenes) | MIT | Hugging Face (24 descargas) |
| llava-hf/llava-interleave-qwen-0.5b-hf (profesor) | 0,5 B | no disponible | 63,75 % (val, con imágenes) | no disponible en la información | Hugging Face |
| Otros VLM pequeños (p. ej. variantes LLaVA-Qwen 0.5B) | 0,5 B | no disponible | no disponible | no disponible | no disponible |

La comparativa se limita al modelo base, ya que no se dispone de datos de benchmarks de alternativas en la información proporcionada.

## Limitaciones y advertencias

- Precisión absoluta moderada: 56,88 % en ScienceQA, por debajo del profesor (63,75 %); no es adecuado para aplicaciones que requieran alta exactitud en razonamiento STEM.
- Pérdida de capacidad por la cirugía: la sustitución de 18 de 24 capas de atención por SSM reduce la calidad respecto al modelo original; el delta de -6,87 puntos frente al profesor es significativo.
- Ámbito restringido: entrenado y evaluado únicamente en ScienceQA; no hay evidencia de generalización a otras tareas visuales o dominios.
- Solo inglés: no se declara soporte multilingüe; el uso en castellano no está validado.
- Riesgo de alucinación: no cuantificado en la model card; como VLM pequeño, es previsible que genere respuestas plausibles pero incorrectas en preguntas abiertas.
- Sesgos: no documentados; el dataset ScienceQA puede introducir sesgos de dominio y de distribución de opciones.
- Licencia MIT: permite uso comercial, pero el autor enlaza a la licencia del repositorio NeuralOps (`github.com/tahamajs/NeuralOps/blob/main/LICENSE`), que conviene revisar por si impone condiciones adicionales.
- Formato de pesos no estándar: el artefacto `attention_weights.safetensors` contiene solo los deltas quirúrgicos; requiere el modelo base y la librería `neuralops` para reconstruir el modelo completo, lo que limita la portabilidad a otros ecosistemas.
- Métricas no verificadas: los resultados del model-index están marcados como `verified: false`; no han sido validados de forma independiente.
- Madurez baja: 24 descargas y 1 like indican poca adopción y escasa validación comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/Hooshaai/llava-qwen-0.5b-samba-m3-scienceqa
- Modelo base: https://huggingface.co/llava-hf/llava-interleave-qwen-0.5b-hf
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Implementación de SAMBAM3Block: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/layers/ssm/samba_m3.py
- Licencia NeuralOps: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset ScienceQA: https://huggingface.co/datasets/derek-thomas/ScienceQA
