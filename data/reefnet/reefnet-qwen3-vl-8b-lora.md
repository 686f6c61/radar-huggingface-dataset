# ReefNet/reefnet-qwen3-vl-8b-lora

## Resumen

ReefNet/reefnet-qwen3-vl-8b-lora es un adaptador LoRA (PEFT) sobre el modelo multimodal Qwen/Qwen3-VL-8B-Instruct, desarrollado por el equipo del proyecto ReefNet. Su única finalidad es la clasificación fina de corales duros: dado un recorte ("crop") de 1024x1024 píxeles centrado en un punto anotado de una fotografía de arrecife, el modelo debe devolver en una sola palabra el género del coral que aparece en el centro. El espacio de etiquetas es cerrado y consta de 39 clases: 38 géneros más la familia Fungiidae.

El modelo corresponde al sistema reportado en la Tabla 5 del artículo ReefNet (NeurIPS 2026, track Evaluations & Datasets). Sobre el conjunto de prueba de ReefNet (within-source, 39 etiquetas y 23.043 recortes) obtiene un macro recall del 72,99 %, y sobre el conjunto cruzado de Al-Wajh (mar Rojo, 13 géneros y 4.624 recortes) baja al 59,80 %, lo que ilustra la dificultad de generalizar entre fuentes distintas de imagen.

Es relevante porque demuestra que un VLM genérico de 8.000 millones de parámetros, adaptado con un LoRA de rango 8, puede resolver una tarea de clasificación ecológica de grano fino sin entrenar un clasificador especializado desde cero. El adaptador es pequeño (el repositorio ocupa 0,1 GB), se publica bajo licencia Apache 2.0 y se distribuye en safetensors.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre un transformer multimodal image-text-to-text: Qwen3-VL-8B-Instruct (encoder de visión + decoder causal de lenguaje) |
| Parámetros totales | 8.000 millones en el modelo base; el adaptador LoRA ocupa 0,1 GB en el repositorio |
| Parámetros activos | no aplica (el modelo base no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no especificados; el adaptador se distribuye sin cuantizar en safetensors. El modelo base admite otros formatos, no detallados en la información proporcionada |
| Idiomas soportados | no disponible (las instrucciones de entrenamiento están en inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |
| Librería | peft |
| Pipeline | image-text-to-text |
| Modelo base | Qwen/Qwen3-VL-8B-Instruct, revisión 0c351dd01ed87e9c1b53cbc748cba10e6187ff3b |
| Dataset de entrenamiento | ReefNet/ReefNet-1.0 (split de alta confianza: 445.985 train / 9.999 val) |
| Tamaño del repositorio | 0,1 GB |
| Descargas / me gusta | 0 / 0 |

## Arquitectura y entrenamiento

El adaptador se entrenó con LLaMA-Factory (commit 589da21d) aplicando LoRA de rango 8 sobre todas las capas lineales del modelo base. La configuración exacta está en `train_config.yaml`: optimizador AdamW, learning rate 5e-5, scheduler coseno, warmup ratio 0,03, precisión bf16, batch por dispositivo de 8, sin acumulación de gradiente, `image_max_pixels` de 1024x1024 y sin aumento de datos. El software empleado fue transformers 4.57.1, peft 0.18.1 y torch 2.9.1. La selección del modelo se hizo con el split de validación de ReefNet; Al-Wajh no se usó en ningún momento para entrenamiento, ajuste ni selección.

Los datos proceden de ReefNet-1.0, formado por recortes de 1024x1024 centrados en cada anotación puntual. El entrenamiento usa el split de alta confianza del benchmark (445.985 recortes de entrenamiento y 9.999 de validación). El prompt de entrenamiento, validación y test de ReefNet es literalmente `What is the genus in the center of the image <image>? Answer with one word`; para el test de Al-Wajh se emplea `Identify the hard coral genus in this image. Respond with only the genus name.`. La decodificación es greedy (`top_k=1`) con `max_new_tokens=32`, y la salida se normaliza (strip y capitalización) y debe coincidir exactamente con un género.

## Capacidades

- Clasificación de grano fino de corales duros: identifica el género del coral situado en el centro de un recorte de 1024x1024, sobre un espacio cerrado de 39 etiquetas (38 géneros más la familia Fungiidae).
- Salida restringida: responde con una única palabra, lo que simplifica su integración en pipelines automáticos de anotación.
- Transferencia a fuentes nuevas: se ha evaluado en imágenes del mar Rojo (Al-Wajh) con 13 géneros, aunque con caída de rendimiento.
- Capacidades heredadas del modelo base: Qwen3-VL-8B-Instruct es un VLM conversacional que procesa texto e imagen, pero el adaptador no documenta mejoras ni validaciones en generación de texto libre, código, matemáticas, tool calling o agentes.
- Capacidades multilingües: no documentadas para el adaptador; los prompts de entrenamiento y evaluación están en inglés.
- Capacidades especiales: no documentadas (no se mencionan modo de razonamiento explícito, audio ni vídeo).

## Casos de uso

- Monitorización de arrecifes a gran escala: procesar automáticamente recortes de 1024x1024 centrados en puntos de transectos o fotogramas para obtener el género de coral de cada anotación, sustituyendo la revisión manual de miles de imágenes.
- Pre-etiquetado en proyectos de ciencia ciudadana: usar el modelo como primer paso de anotación asistida, dejando que un experto revise únicamente las predicciones de baja confianza.
- Análisis ecológico reproducible sobre ReefNet-1.0: el repositorio incluye `predictions/` con las salidas por muestra y la herramienta `tools/recompute_macro_recall.py` del repositorio reefnet-mllm, lo que permite reproducir las métricas publicadas (72,99 % de macro recall en ReefNet).
- Adaptación a nuevos arrecifes (domain adaptation): el resultado de 59,80 % de macro recall en Al-Wajh sirve como punto de partida documentado para afinar el adaptador con imágenes de una nueva región sin partir de cero.
- Clasificación jerárquica preliminar: al incluir la familia Fungiidae entre las 39 etiquetas, permite distinguir a ese nivel cuando la identificación hasta género no es fiable.
- Formación y divulgación: integrado en una aplicación sencilla que devuelve el nombre del género a partir de una foto, con una salida de una sola palabra fácil de mostrar.
- Investigación en visión por computador: como línea base (baseline) de VLM con LoRA frente a clasificadores específicos en tareas de biodiversidad marina.

## Benchmarks y rendimiento

| Conjunto de prueba | Tipo | Etiquetas | Muestras | Métrica | Resultado |
|---|---|---|---|---|---|
| ReefNet | within-source | 39 | 23.043 | Macro recall | 72,99 % |
| Al-Wajh (mar Rojo) | cross-source | 13 | 4.624 | Macro recall | 59,80 % |

No se han publicado resultados de benchmarks en la información disponible para otras tareas (MMLU, HumanEval, GSM8K u similares). La métrica empleada es macro recall (balanced accuracy). En Al-Wajh se promedian los 13 géneros presentes, pero el modelo conserva las 39 salidas posibles y cualquier predicción fuera de esos 13 géneros cuenta como error.

## Requisitos de hardware

- VRAM estimada para inferencia (estimaciones a partir del tamaño del modelo base, no publicadas por el autor): unos 16 GB solo para los pesos en bf16, más el encoder de visión y las activaciones de imágenes de 1024x1024, lo que sitúa el consumo realista en el rango de 18 a 24 GB.
- Con cuantización de 4 bits, el consumo bajaría aproximadamente a 6-8 GB, aunque el autor no publica variantes cuantizadas del adaptador.
- GPU recomendadas para bf16: A100 (40/80 GB), H100, L40S y, en el ámbito consumer, RTX 4090 o RTX 3090 (24 GB).
- ¿Cabe en GPU consumer? Sí: en tarjetas de 24 GB sin cuantizar y en tarjetas de 8-16 GB con cuantización de la base.
- Opciones de despliegue: transformers con peft (procedimiento documentado en la model card), vLLM o TGI para servir el modelo base con el adaptador, y llama.cpp u Ollama si se cuantiza la base (existe `qwen3-vl:8b` en Ollama, aunque no incluye este adaptador).
- Latencia y throughput: no disponibles. La generación es greedy con un máximo de 32 tokens, por lo que la salida es muy corta y el coste dominante es el procesamiento de la imagen.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Rendimiento |
|---|---|---|---|---|---|
| ReefNet/reefnet-qwen3-vl-8b-lora | 8 B (base) + LoRA r=8 | no disponible | Clasificación de género de coral, 39 clases | apache-2.0 | Macro recall 72,99 % (ReefNet) y 59,80 % (Al-Wajh) |
| Qwen/Qwen3-VL-8B-Instruct (sin adaptar) | 8 B | no disponible | VLM general image-text-to-text | no disponible en la información proporcionada | no disponible |
| rinabuoy/lora_qwen3_vl_8b_v2 | 8 B (base) + LoRA | no disponible | no disponible | no disponible | no disponible |

No se dispone de resultados comparables de otros clasificadores específicos de coral ni de adaptadores equivalentes en la información proporcionada.

## Limitaciones y advertencias

- Caída clara de rendimiento fuera de la fuente de entrenamiento: del 72,99 % al 59,80 % entre ReefNet y Al-Wajh.
- Dependencia fuerte del encuadre: el modelo está entrenado para recortes de 1024x1024 centrados en el punto anotado; con otros encuadres o resoluciones el comportamiento no está validado.
- Salida cerrada: solo devuelve nombres de un conjunto de 39 etiquetas y debe coincidir exactamente; no proporciona probabilidades ni información de confianza.
- Riesgo de alucinación: como VLM generativo, puede emitir un nombre de género válido pero incorrecto; no hay mecanismo de abstención documentado.
- Métrica de Al-Wajh penaliza cualquier predicción fuera de los 13 géneros evaluados, lo que exige interpretar el 59,80 % con cautela.
- Idiomas no documentados; los prompts son en inglés y no se ha evaluado el comportamiento con instrucciones en castellano.
- Licencia Apache 2.0 en el adaptador, lo que permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen3-VL-8B-Instruct antes de desplegarlo en producción.
- Adopción nula hasta la fecha (0 descargas y 0 me gusta), sin validación independiente por parte de terceros.
- Uso previsto estrictamente científico y ecológico: no se ha evaluado como modelo de propósito general.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ReefNet/reefnet-qwen3-vl-8b-lora
- Modelo base Qwen/Qwen3-VL-8B-Instruct: https://huggingface.co/Qwen/Qwen3-VL-8B-Instruct
- Dataset ReefNet-1.0: https://huggingface.co/datasets/ReefNet/ReefNet-1.0
- Página del proyecto ReefNet: https://reefnet-project.github.io/reefnet-2025/
- Repositorio Qwen3-VL: https://github.com/QwenLM/Qwen3-VL
- LLaMA-Factory: https://github.com/hiyouga/LLaMA-Factory
- Qwen3-VL 8B en Ollama: https://ollama.com/library/qwen3-vl:8b
- Cita del artículo: Felemban et al., "ReefNet: A Large-Scale Dataset and Benchmark for Fine-Grained Coral Reef Recognition", NeurIPS 2026 (Evaluations and Datasets Track)
- Repositorio reefnet-mllm (mencionado en la model card para recomputar las métricas): URL no disponible en la información proporcionada
