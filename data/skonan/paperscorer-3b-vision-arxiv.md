# skonan/PaperScorer-3B-Vision-arXiv

## Resumen

PaperScorer-3B-Vision-arXiv es un ajuste fino supervisado (SFT) del modelo multimodal Qwen2.5-VL-3B-Instruct, publicado por el usuario skonan dentro de la colección PaperScorer del laboratorio zlab-princeton. Su única tarea es predecir el veredicto de aceptación o rechazo de un artículo científico enviado a una conferencia de aprendizaje automático de primer nivel, al estilo de ICLR, a partir del texto del artículo en Markdown más capturas de pantalla de cada página. No es un asistente general: es un clasificador binario especializado que emite `\boxed{Accept}` o `\boxed{Reject}`.

El modelo cuenta con 3.754.622.976 parámetros reales en formato safetensors y un repositorio de 16,3 GB. Se entrenó sobre el conjunto arxiv-large (71.000 ejemplos balanceados por venue) durante cuatro épocas completas, hasta el paso 17.724, con LLaMA-Factory y FSDP2. El resultado declarado en distribución es una exactitud del 73,4 % y un AUC de 0,839 sobre 1.414 artículos de test.

Su relevancia es acotada pero específica: ofrece un sistema reproducible y de código abierto para estudiar la predicción automática de decisiones de revisión por pares, con la particularidad de que incorpora señales visuales (figuras, tablas, maquetación) que un modelo solo-texto no puede aprovechar. El modelo tiene un uso muy limitado en el ecosistema (13 descargas, 0 likes en el momento de la consulta) y su licencia es "other", sin que la información disponible concrete los términos.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Qwen2.5-VL): encoder de visión ViT + modelo de lenguaje con atención; heredada del modelo base |
| Parametros totales | 3.754.622.976 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible de forma explícita; el entrenamiento usó un `cutoff_len` de 24.480 tokens, lo que establece una cota inferior de la ventana manejada |
| Tipos de cuantizacion | No disponible en la información proporcionada (no se documentan pesos GGUF, AWQ ni GPTQ) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | other (términos no concretados en la información disponible) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-VL-3B-Instruct, un transformer multimodal que combina un codificador visual con un modelo de lenguaje. La modalidad de entrada es texto más imágenes: el cuerpo del artículo se tokeniza en Markdown y, a continuación, se añade un token `<image>` por cada captura de página (típicamente 7-9 imágenes para arXiv y 8-10 para ICLR), con una lista paralela de rutas PNG en el campo `images` de la petición. La salida esperada es una única línea con el veredicto en formato `\boxed{Accept}` o `\boxed{Reject}`.

El entrenamiento es un ajuste fino supervisado sobre el dataset arxiv-large con 71.000 ejemplos balanceados por venue, durante 4 épocas (paso 17.724, checkpoint de final de época). Los hiperparámetros declarados son: learning rate 1e-6, planificador `cosine_then_constant` (decay_ratio 0,75, min_lr_rate 0,001), batch size 16 y cutoff_len 24.480, usando LLaMA-Factory con FSDP2. El formato de conversación es sharegpt de tres turnos (system, human, gpt): el system es idéntico en los ocho modelos PaperScorer ("You are an expert academic reviewer tasked with evaluating research papers.") y el preámbulo de usuario varía según el dominio de entrenamiento. No se documenta ningún uso de RLHF, DPO ni decodificación especulativa.

## Capacidades

- Clasificación binaria de veredictos: predice Accept o Reject para artículos enviados a venues de aprendizaje automático de primer nivel.
- Entrada multimodal: procesa texto del artículo en Markdown junto con capturas de página en PNG, lo que permite captar figuras, tablas y estructura visual.
- Calibración mediante logprobs: la puntuación se calcula como `logprob(Accept) − logprob(Reject)` en la posición del token de decisión, lo que permite fijar un umbral de calibración en un conjunto de validación.
- Nombre concreto de la clase de entrada: entiende el preámbulo ARXIV-trained, que menciona tasas de aceptación típicas del 25-30 % en venues de primer nivel.
- Integración con API compatible con OpenAI a través de vLLM, más una API FastAPI propia del orquestador PaperScorer.
- No dispone de: tool calling, function calling, capacidad de agente, razonamiento multi-paso, soporte multilingüe más allá del inglés, ni modos de pensamiento extendido documentados.

## Casos de uso

- Preselección interna de envíos: un grupo de investigación puede pasar su borrador anonimizado por el modelo antes de enviarlo y obtener una señal probabilística de aceptación, junto con un umbral calibrado, para decidir si refuerza la sección de experimentos o retrasa el envío.
- Estudio de sesgo y ruido en la revisión por pares: al ser un modelo entrenado sobre veredictos históricos, permite cuantificar cuánto de una decisión es predecible a partir del texto y las figuras, y qué fracción queda en manos del revisor humano.
- Análisis bibliométrico a escala: procesar lotes de identificadores de arXiv mediante el endpoint `submit_arxiv` del orquestador para estimar tasas de aceptación predichas por área temática o por año.
- Señal auxiliar en sistemas de recomendación de revisores: usar la puntuación calibrada como característica adicional junto a otras señales (citas, novedad del método, reputación de autores) en un sistema de triaje editorial.
- Generación de conjuntos de datos sintéticos etiquetados: producir veredictos automáticos sobre corpus de artículos sin necesidad de anotación humana, para alimentar experimentos de investigación sobre revisión automática.
- Demostración docente sobre evaluación automática: por su tamaño reducido (3B) puede desplegarse en una GPU de consumo y usarse en un curso sobre revisión por pares o sobre evaluación de LLM, con la interfaz web del orquestador PaperScorer.
- Auditoría de paridad entre dominios: comparar este modelo entrenado con arXiv frente a sus hermanos entrenados con ICLR permite estudiar cómo cambian los sesgos según el venue de origen.

## Benchmarks y rendimiento

Evaluación en distribución sobre `arxiv-balanced-test`, con umbral de calibración elegido en `arxiv-balanced-val`. La puntuación es `logprob(Accept) − logprob(Reject)` en la posición del token de decisión; `pA` es la tasa de aceptación predicha y `A_rec` / `R_rec` son el recall de aceptación y de rechazo.

| n_test | Accuracy | AUC | pA | A_rec | R_rec |
|---|---|---|---|---|---|
| 1414 | 73,4 % | 0,839 | 59 % | 83,2 % | 64,3 % |

No se han publicado en la información disponible resultados sobre MMLU, HumanEval, GSM8K ni sobre otros conjuntos externos. El autor advierte de una asimetría de datos relevante: los modelos entrenados con arXiv vieron unos 71.000 ejemplos, aproximadamente 3 veces más que los entrenados con ICLR, por lo que las comparaciones directas entre ambos deben tener en cuenta esa diferencia.

## Requisitos de hardware

- Peso de los pesos en bf16: aproximadamente 7,5 GB (3.754.622.976 parámetros × 2 bytes), más el codificador visual y las activaciones.
- El repositorio ocupa 16,3 GB, coherente con una copia en precisión completa (fp32, ~15 GB) o con artefactos adicionales de entrenamiento.
- Cabe en GPU de consumo: con bf16 requiere del orden de 9-10 GB de VRAM según la longitud de la secuencia; una RTX 4090 (24 GB), RTX 3090 (24 GB) o RTX 4080 (16 GB) son suficientes. Con cuantización a int8 o int4 el requisito bajaría a 4-6 GB y 2-3 GB respectivamente, aunque no se documentan pesos cuantizados oficiales.
- Entradas largas: el entrenamiento usó secuencias de hasta 24.480 tokens, más 7-10 imágenes por muestra; la caché KV para esa longitud se estima en torno a 1 GB en bf16, por lo que conviene reservar margen adicional.
- Para servir en producción con paralelismo y lotes grandes: A100 40/80 GB o H100.
- Opciones de despliegue documentadas: `vllm serve skonan/PaperScorer-3B-Vision-arXiv --task generate --gpu-memory-utilization 0.85`, que expone una API compatible con OpenAI en el puerto 8000, y el orquestador PaperScorer (FastAPI + interfaz web en el puerto 8003) con los comandos `paperscorer setup --serve` y `paperscorer run <ruta.pdf>`.
- Despliegue alternativo: el modelo se entrenó con LLaMA-Factory, por lo que la ruta de inferencia con ese framework está soportada. No se documentan instrucciones para llama.cpp, Ollama, TGI ni TensorRT-LLM.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Modalidad | Dominio de entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PaperScorer-3B-Vision-arXiv (este) | 3,75 B | texto + visión | arXiv (71k ejemplos) | other | HuggingFace, 13 descargas |
| PaperScorer-3B-Text-arXiv | no disponible | solo texto | arXiv | no disponible | colección PaperScorer |
| PaperScorer-7B-Vision-arXiv | no disponible | texto + visión | arXiv | no disponible | colección PaperScorer |
| PaperScorer-3B-Vision-openreview-iclr | no disponible | texto + visión | OpenReview/ICLR | no disponible | colección PaperScorer |
| Qwen/Qwen2.5-VL-3B-Instruct (base) | 3,75 B | texto + visión | datos generales + instrucciones | no disponible en esta ficha | HuggingFace |

La colección PaperScorer contiene ocho modelos SFT de dominio único, resultado del producto {3B, 7B} × {texto, visión} × {arxiv, openreview-iclr}, más los datasets PaperScorer-Text y PaperScorer-Vision. No se dispone de las métricas individuales de los modelos hermanos en la información proporcionada, salvo la advertencia del autor sobre la asimetría de volumen de datos entre dominios. El modelo base Qwen2.5-VL-3B-Instruct no es un comparador directo en la tarea: no está entrenado para emitir veredictos de aceptación.

## Limitaciones y advertencias

- Especialización extrema: el modelo solo produce veredictos Accept/Reject. No debe usarse como asistente conversacional, para generación de código ni para razonamiento general.
- Monolingüe: entrenado y evaluado únicamente en inglés. Cualquier artículo en otro idioma queda fuera de su distribución.
- Dominio cerrado: el preámbulo y los datos corresponden a venues de aprendizaje automático. Aplicarlo a otras disciplinas (medicina, derecho, humanidades) carece de validación y probablemente degrade la calibración.
- Riesgo de alucinación y de sobrerreproducción de sesgos: al aprender de veredictos históricos, puede reproducir sesgos de aceptación asociados a institución, área temática, estilo de escritura o longitud del artículo. El autor no documenta ninguna auditoría de sesgo.
- Descalibración entre dominios: el umbral de calibración se eligió sobre validación de arXiv; aplicarlo a otros conjuntos exige recalibrar. La tasa de aceptación predicha (59 %) está por encima de las tasas reales típicas (25-30 %), lo que indica un sesgo hacia la clase Accept, coherente con un recall de aceptación (83,2 %) muy superior al de rechazo (64,3 %).
- Asimetría de datos: los modelos arXiv vieron unas 3 veces más ejemplos que los de ICLR, lo que invalida comparaciones directas entre ambos grupos sin corrección.
- Licencia "other": los términos no están concretados en la información disponible. Antes de cualquier uso comercial es imprescindible verificar las condiciones reales, así como las del modelo base Qwen2.5-VL-3B-Instruct.
- Adopción muy baja: 13 descargas y 0 likes en el momento de la consulta, lo que implica poca validación independiente y escasa comunidad de soporte.
- Uso ético: emplear el modelo como sustituto de la revisión por pares o para filtrar envíos sin intervención humana plantea problemas de transparencia y de responsabilidad editorial.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/skonan/PaperScorer-3B-Vision-arXiv
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-VL-3B-Instruct
- Repositorio del orquestador PaperScorer: https://github.com/zlab-princeton/PaperScorer
- Colección PaperScorer (8 modelos y 2 datasets): https://huggingface.co/collections/zlab-princeton/paperscorer
- Cita asociada: artículo de NeurIPS 2026 (referencia truncada en la model card; los datos bibliográficos completos no están disponibles en la información proporcionada)
- Resultados de la búsqueda web: no se ha recuperado ningún enlace relevante al modelo. Los resultados devueltos corresponden a páginas generales de Quora y no guardan relación con PaperScorer.
