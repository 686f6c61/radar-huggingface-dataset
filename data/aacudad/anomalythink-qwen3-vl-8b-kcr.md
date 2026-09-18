# aacudad/AnomalyThink-Qwen3-VL-8B-KCR

## Resumen

AnomalyThink-Qwen3-VL-8B-KCR es un modelo vision-language de 8,77 mil millones de parámetros desarrollado por el usuario aacudad como artefacto de investigación para la detección explicable de anomalías industriales en imágenes de producto cenitales. Parte de los pesos base de Qwen/Qwen3-VL-8B-Instruct y se ha afinado mediante supervisión sobre un corpus "Keep-Correct-Revise" (KCR) construido a partir de los propios rollouts GRPO del modelo, es decir, la política reforzada actúa como fuente de los datos de entrenamiento del modelo final.

El modelo responde a la pregunta de si una pieza presenta anomalías con una decisión binaria (`<answer>Yes</answer>` / `<answer>No</answer>`) acompañada de razonamiento explícito en `<think>`, ubicación en `<location>` y tipo de defecto en `<type>`. Su relevancia está en el ámbito de la inspección visual industrial: alcanza 84,39 de balanced accuracy en el subconjunto DS-MVTec y 76,63 en VisA del benchmark MMAD, siendo la mejor puntuación en VisA de todos los modelos entrenados en el proyecto del autor.

Es importante encuadrarlo correctamente: se trata de un artefacto posterior a la presentación de la tesis del autor (entrenado en septiembre de 2026 con la receta de la tesis aplicada de extremo a extremo sobre este backbone), publicado para reproducibilidad y no como resultado validado en la tesis. La licencia es Apache 2.0 y el repositorio ocupa 17,6 GB en safetensors, sin cuantizaciones publicadas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision-language transformer (familia Qwen3-VL, tag `qwen3_vl`), con encoder visual y torre de texto; pipeline `image-text-to-text` |
| Parámetros totales | 8.767.123.696 (8,77 mil millones), dato real de safetensors |
| Parámetros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible: el repositorio solo publica pesos safetensors, sin GGUF, AWQ ni GPTQ |
| Idiomas soportados | no disponible (el prompt de entrenamiento y evaluación está en inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | `safetensors` (repositorio de 17,6 GB); incluye carpeta `transformers4_vllm/` con tokenizer, processor y config adaptados para transformers 4.57 y vLLM 0.10.x |

Otros datos del repositorio: modelo base `Qwen/Qwen3-VL-8B-Instruct`, dataset asociado `aacudad/AnomalyThink`, biblioteca `transformers`, 0 descargas y 0 likes en el momento de la consulta, creado y actualizado el 18 de septiembre de 2026, región US, compatible con endpoints.

## Arquitectura y entrenamiento

La arquitectura es la de Qwen3-VL-8B: un transformer multimodal con encoder visual congelado durante todo el ajuste y torre de texto entrenable. El modelo no continúa desde la política GRPO, sino que se reinicia desde los pesos base de `Qwen/Qwen3-VL-8B-Instruct` y se supervisa sobre el corpus curado. La receta es idéntica a la del modelo SFT hermano: learning rate 1e-5, scheduler coseno, batch efectivo 32 y 4 épocas. El checkpoint publicado corresponde a la época 2 (step 376), la mejor en DS-MVTec; las cuatro épocas puntuaron 82,67/71,40, 84,39/76,63, 84,14/71,96 y 83,67/70,32 (DS-MVTec/VisA).

El corpus de entrenamiento es `qwen3_kcr/sft_qwen3_C_train.json` del dataset `aacudad/AnomalyThink`: 5.998 trazas equilibradas por veredicto (2.999 anómalas). Para construirlo, la política SFT+GRPO se muestreó ocho veces con temperatura 0,7 sobre las 10.236 imágenes de entrenamiento de Real-IAD; cada rollout se puntuó con recompensas locales y un juez de fidelidad Gemini-3-Flash, y los ítems se enrutaron a nivel de pool en mantener (8.988), corregir (1.248) o reescribir (2.464). El corpus final se ensambló solo sobre las 6.000 imágenes de SFT.

La innovación metodológica es el esquema Keep-Correct-Revise: una traza se mantiene cuando el veredicto es correcto y el juez considera el razonamiento fundamentado, se corrige por el profesor cuando todos los rollouts fallaron, y se revisa cuando el veredicto era correcto pero el razonamiento estaba débilmente fundamentado. Según el autor, el patrón de la tesis se reproduce en este backbone: GRPO sostiene DS-MVTec y el corpus corregido construido a partir de los rollouts de la política GRPO sostiene VisA.

## Capacidades

- Clasificación binaria de anomalías en imágenes de producto: salida `<answer>Yes</answer>` o `<answer>No</answer>` con puntuación estricta (una generación sin `<answer>` parseable cuenta como error).
- Razonamiento explícito previo a la respuesta mediante bloque `<think>`, orientado a explicabilidad y no solo a precisión.
- Salida estructurada complementaria: `<location>` para localizar el defecto y `<type>` para tipificarlo, lo que permite consumir la respuesta de forma programática.
- Detección de anomalías industriales en dominio específico (PCB y otras categorías de Real-IAD, DS-MVTec y VisA), con tag explícito `industrial-anomaly-detection`.
- Procesamiento de imagen única por prompt con resolución de hasta 262.144 píxeles en el protocolo de evaluación.
- Naturaleza conversacional (tag `conversational`): admite plantillas de chat con mensaje de sistema.
- Soporte de tool calling / function calling: no documentado en la información disponible.
- Capacidades de agente o razonamiento multi-paso más allá del bloque de pensamiento: no documentadas.
- Capacidades multilingües: no disponibles; no se declara lista de idiomas.
- Visión: sí (modelo image-text-to-text). Audio: no disponible.

## Casos de uso

- Inspección automática de placas de circuito impreso: el prompt de ejemplo de la model card analiza una imagen de PCB y devuelve si hay anomalía, su tipo y su ubicación, lo que permite integrar el modelo como etapa de control de calidad con salida parseable.
- Triaje de líneas de fabricación con imágenes cenitales: al ser un modelo afinado sobre imágenes top-down de producto, encaja en estaciones de inspección donde la cámara captura la pieza desde arriba y se requiere una decisión binaria rápida por pieza.
- Generación de explicaciones auditables para operarios y supervisores: el bloque `<think>` más `<location>` y `<type>` permite justificar cada rechazo de pieza ante un auditor, algo que un clasificador de anomalías puro no ofrece.
- Investigación en explicabilidad de VLMs industriales: es un artefacto pensado para reproducir el pipeline KCR (SFT → GRPO → curado de rollouts → SFT), útil para replicar el método sobre otros backbones o dominios.
- Construcción de conjuntos de datos etiquetados: el modelo puede usarse para pre-anotar imágenes industriales con veredicto, tipo y localización, y después revisar solo los casos de baja confianza.
- Evaluación comparativa de estrategias de ajuste: al compartir backbone y protocolo con los modelos SFT y SFT-GRPO de la misma familia, sirve para medir el efecto aislado del curado del corpus frente al del refuerzo.
- Filtrado previo en pipelines de visión clásica: usar el modelo como segunda opinión sobre las regiones marcadas por un detector tradicional, reduciendo falsos positivos antes de la inspección humana.

## Benchmarks y rendimiento

Subconjuntos de MMAD, balanced accuracy con puntuación estricta. Protocolo único para todas las filas: DS-MVTec (1.670 imágenes) y VisA (2.141 imágenes), una imagen por prompt, prompt de entrenamiento con el mensaje de sistema de una línea "Please answer by yes or no", decodificación greedy, máximo 1.024 tokens nuevos, imágenes limitadas a 262.144 píxeles y generación con vLLM. La balanced accuracy es la media de sensibilidad y especificidad; las generaciones sin `<answer>` parseable cuentan como incorrectas.

| Modelo | DS-MVTec | VisA |
|---|---|---|
| Qwen3-VL-8B-Instruct base, zero-shot | 78,68 | 64,45 |
| AnomalyThink-Qwen3-VL-8B-SFT (6K trazas Gemini, época 1) | 80,31 | 67,32 |
| AnomalyThink-Qwen3-VL-8B-SFT-GRPO (época 1, prompt de entrenamiento) | 87,14 | 72,39 |
| AnomalyThink-Qwen3-VL-8B-KCR (rollouts corregidos propios, época 2) | 84,39 | 76,63 |
| Este modelo | 84,39 | 76,63 |

Evolución por épocas del modelo KCR (DS-MVTec/VisA): 82,67/71,40, 84,39/76,63, 84,14/71,96 y 83,67/70,32. La model card indica que los archivos de evaluación por muestra (`eval_*.json`) están junto a los pesos. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks de propósito general en la información disponible.

## Requisitos de hardware

Todas las cifras de esta sección son estimaciones derivadas del tamaño de parámetros y del tamaño del repositorio, no datos publicados por el autor.

- VRAM estimada en bf16: alrededor de 17,5 GB solo para los pesos (8,767 mil millones de parámetros a 2 bytes), más activaciones del encoder visual con imágenes de hasta 262.144 píxeles; en la práctica, 24 GB es el mínimo razonable y 40-48 GB da margen cómodo.
- VRAM estimada en 8 bits: en torno a 9-10 GB de pesos. En 4 bits: en torno a 5-6 GB. Estas cuantizaciones no están publicadas en el repositorio, por lo que habría que generarlas.
- GPU profesionales recomendadas: A100 40/80 GB, H100, L40S 48 GB. La evaluación del autor se realizó con vLLM, lo que implica GPUs de centro de datos.
- GPU de consumo: una RTX 4090 (24 GB) o RTX 3090 (24 GB) puede cargar el modelo en bf16 con margen justo; con cuantización de 8 o 4 bits cabría también en GPUs de 12-16 GB.
- Opciones de despliegue documentadas: `transformers>=5.0` con `AutoModelForImageTextToText` y `AutoProcessor` (checkpoint guardado con transformers 5.0.0), y vLLM 0.10.x usando los ficheros de `transformers4_vllm/` junto a `model.safetensors`. No se mencionan llama.cpp, GGUF, Ollama ni TGI.
- Latencia y throughput: no disponibles. Como referencia de carga, el propio protocolo de evaluación limita la generación a 1.024 tokens nuevos con decodificación greedy, lo que implica generaciones de razonamiento relativamente largas por imagen.
- Nota de compatibilidad: para transformers 4.57 o vLLM 0.10.x hay que usar los ficheros de `transformers4_vllm/` (tokenizer y processor estándar de Qwen3-VL-8B-Instruct y un config con `rope_theta` escrito en `text_config`); así se produjeron todos los números de la tabla de benchmarks.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | DS-MVTec | VisA | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| AnomalyThink-Qwen3-VL-8B-KCR (este) | 8,77 mil millones | no disponible | 84,39 | 76,63 | Apache 2.0 | Pesos safetensors en HuggingFace |
| AnomalyThink-Qwen3-VL-8B-SFT-GRPO | mismo backbone (8B) | no disponible | 87,14 | 72,39 | no disponible en la información | Pesos safetensors en HuggingFace |
| AnomalyThink-Qwen3-VL-8B-SFT | mismo backbone (8B) | no disponible | 80,31 | 67,32 | no disponible en la información | Pesos safetensors en HuggingFace |
| Qwen3-VL-8B-Instruct (base, zero-shot) | mismo backbone (8B) | no disponible | 78,68 | 64,45 | no disponible en la información | Modelo público de Qwen |

Lectura de la comparativa: el KCR sacrifica 2,75 puntos de DS-MVTec respecto al SFT-GRPO (84,39 frente a 87,14) a cambio de ganar 4,24 puntos en VisA (76,63 frente a 72,39), siendo el mejor resultado en VisA de todo el proyecto. Frente al base zero-shot mejora 5,71 puntos en DS-MVTec y 12,18 en VisA. No se dispone de comparación con detectores de anomalías no basados en VLM dentro de la información proporcionada.

## Limitaciones y advertencias

- Artefacto de investigación posterior a la tesis: el autor indica explícitamente que estos modelos se entrenaron después de la presentación del trabajo y que no son resultados de la tesis, sino publicaciones para reproducibilidad.
- Semilla única: no hay réplicas con distintas semillas, por lo que la varianza de los resultados no está caracterizada.
- Sin evaluación humana de las explicaciones: la calidad del razonamiento en `<think>` solo se ha medido con un juez automático (Gemini-3-Flash) durante la construcción del corpus.
- Sesgo de selección: la elección del checkpoint se hizo sobre DS-MVTec, mientras que VisA se reporta en ese mismo checkpoint; no hay selección independiente por VisA.
- Riesgo de contaminación de benchmark: el propio autor advierte de que no puede descartarse que las imágenes públicas de MMLAD se hayan visto durante el preentrenamiento del backbone, y señala que esto aplica a todos los modelos de la comparación.
- Riesgo de alucinación: el modelo genera razonamiento libre en `<think>` y campos `<location>`/`<type>`; no hay validación de que la ubicación o el tipo declarados correspondan realmente al defecto.
- Puntuación estricta: cualquier generación sin `<answer>` parseable se cuenta como error, lo que penaliza fallos de formato además de fallos de juicio; conviene monitorizar el cumplimiento del formato en producción.
- Dominio estrecho: está pensado para detección de anomalías industriales en imágenes cenitales de producto; no debe esperarse buen comportamiento fuera de ese dominio.
- Idiomas: no se declara ningún idioma soportado y los prompts de entrenamiento y evaluación están en inglés; el comportamiento en castellano es desconocido.
- Licencia: Apache 2.0 permite uso comercial, pero la licencia del modelo base Qwen3-VL-8B-Instruct debe verificarse por separado antes de un despliegue comercial.
- Cuantizaciones: no hay GGUF, AWQ ni GPTQ publicados, lo que complica el despliegue en entornos con llama.cpp/Ollama.
- Compatibilidad de herramienta: requiere transformers 5.0 o superior, o los ficheros específicos de `transformers4_vllm/` para transformers 4.57 y vLLM 0.10.x.
- Solo se publica un checkpoint (época 2); las otras tres épocas no están disponibles, lo que limita reproducir la curva completa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/aacudad/AnomalyThink-Qwen3-VL-8B-KCR
- Modelo SFT de la misma familia: https://huggingface.co/aacudad/AnomalyThink-Qwen3-VL-8B-SFT
- Modelo SFT-GRPO de la misma familia: https://huggingface.co/aacudad/AnomalyThink-Qwen3-VL-8B-SFT-GRPO
- Dataset de entrenamiento: https://huggingface.co/datasets/aacudad/AnomalyThink
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-8B-Instruct
- Referencia bibliográfica de la model card: A. Acudad, tesis de máster 2026, "Reasoning-Enhanced Vision-Language Models for Explainable Industrial A..." (título truncado en la model card; clave BibTeX `acudad2026reasoning`).
- La búsqueda web realizada no devolvió ningún enlace relevante sobre este modelo, su dataset o su paper.
