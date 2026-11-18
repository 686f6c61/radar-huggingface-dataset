# Mapika/decider-4b

## Resumen

decider-4b es un modelo de decisión tipada desarrollado por Mapika. No es un modelo generativo al uso: en lugar de producir texto libre, recibe un estado (texto y, desde la versión 3, imágenes) junto con una o varias preguntas tipadas, cada una con su lista explícita de opciones, y devuelve en una única pasada forward una distribución de probabilidad calibrada sobre las opciones de cada pregunta. Está pensado para ser invocado desde software, no para conversar.

El modelo se construye sobre la arquitectura Qwen3.5-4B-Base (transformer denso de 4.205.751.296 parámetros) y se distribuye bajo licencia Apache 2.0. La versión 3, publicada el 20 de octubre de 2026, incorpora soporte de imágenes reutilizando el vision tower del modelo base, además de mejorar el rendimiento en la tarea de referencia del autor (Decision Index 0.3) de 41,55 a 51,02 sobre una muestra de 4.500 peticiones.

Su relevancia radica en el paradigma "system-one": una sola pasada, sin generación autoregresiva, con salida estructurada y probabilidades calibradas. Esto lo hace adecuado para enrutamiento, clasificación, juicios binarios y evaluación de estados en pipelines de producción donde la latencia y la interpretabilidad de la confianza importan más que la generación de lenguaje.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3.5-4B-Base); modelo de decisión con cabeza de distribución sobre opciones |
| Parametros totales | 4.205.751.296 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | bf16 en los pesos publicados; builds GGUF disponibles según la model card |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16, 8,4 GB el modelo de texto); vision tower separado en `vision/` (0,6 GB); builds GGUF |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-4B-Base y conserva su arquitectura de transformer denso. La innovación no está en el backbone sino en la interfaz: el modelo lee un estado y preguntas tipadas (con tipos como `choice`, `noul` y `score`) y emite, en una sola pasada forward, una distribución de probabilidad sobre las opciones de cada pregunta. Para la versión 3, los pesos de texto se insertaron en el modelo imagen-texto de Qwen3.5-4B-Base, manteniendo el vision tower del base sin cambios y reutilizando los pesos del modelo de texto para la ruta de imagen.

El entrenamiento de v3 arranca desde v2.1 y aplica una etapa LoRA (rango 64, learning rate 1e-4, 2 épocas, 110 minutos en una B300) únicamente sobre el modelo de lenguaje. Los datos de texto suman 39.500 filas: la mezcla de entrenamiento de decider-31b (splits de train de CLINC150, iSarcasmEval, VAST, ACOS, POP909-CL, GSM8K y NLI4CT, decontaminados contra todas las filas de los suites del Decision Index 0.3; peticiones de domótica generadas; decisiones de seguimiento de estado y familias de decisión generadas; preguntas documentales escritas por Qwen3.6-27B; filas públicas etiquetadas) más 6.700 filas de replay de los datos de entrenamiento de v2.1. Los datos de imagen suman 18.129 filas de siete subconjuntos de the_cauldron: AI2D, A-OKVQA, Hateful Memes, IconQA, RAVEN, ScienceQA y TQA; Visual7W y VSR no se usaron.

Un detalle técnico destacable es el ajuste de temperatura por tipo de pregunta: la configuración usa temperatura 0,05 para respuestas sí/no (`noul`), lo que las lleva cerca de 0 o 1 a costa de perder calibración (ECE 0,265 frente a 0,102 en el conjunto held-out de 399 ítems). Para probabilidades calibradas se ofrecen los valores ajustados `temperature_by_type={"choice": 2.098, "noul": 2.795, "score": 3.152}`.

## Capacidades

- Decisión tipada con salida estructurada: distribuciones de probabilidad sobre listas de opciones explícitas para preguntas de tipo `choice`, `noul` (sí/no) y `score`.
- Inferencia en una sola pasada forward, sin generación autoregresiva de texto.
- Procesamiento de imágenes (desde v3): hasta 4 imágenes por petición (configurable con `DECIDER_MAX_IMAGES`), en formato PNG y JPEG, referenciadas desde el estado.
- Clasificación de texto multietiqueta y enrutamiento entre categorías definidas por el desarrollador.
- Juicios binarios y evaluación de criterios con probabilidad asociada.
- Soporte de preguntas múltiples sobre un mismo estado en una sola llamada.
- Interfaz de servidor compatible con el formato TypeSafe vía `POST /v1/systemone`.
- No soporta tool calling, agentes ni razonamiento multi-paso en el sentido generativo; su función es emitir decisiones, no ejecutar cadenas de acciones.
- Capacidades multilingües limitadas al inglés según la model card.

## Casos de uso

- Enrutamiento de tickets de soporte: el modelo recibe el texto del ticket y una pregunta de tipo `choice` con departamentos como opciones (facturación, soporte técnico, ventas) y devuelve la distribución de probabilidad, permitiendo umbrales de confianza para escalado automático. Es adecuado por su salida calibrada y su latencia de una sola pasada.
- Moderación y triaje de contenido: preguntas de tipo `noul` sobre si un texto o una imagen (memes, capturas) cumple determinados criterios, con probabilidad asociada para decidir revisión humana.
- Evaluación de gráficos y documentos visuales: con el soporte de imágenes de v3, se puede preguntar si un gráfico de ventas requiere escalado según un criterio textual, referenciando la imagen desde el estado.
- Clasificación de intenciones en asistentes de voz o chatbots: la mezcla de entrenamiento incluye CLINC150, lo que lo hace directamente aplicable a la detección de intención con opciones predefinidas.
- Seguimiento de estado en sistemas de domótica: las decisiones de state-tracking del entrenamiento permiten preguntar al modelo si un estado del hogar requiere una acción concreta, con opciones explícitas.
- Análisis de sentimiento y sarcasmo en reseñas: los splits de iSarcasmEval y VAST del entrenamiento respaldan preguntas de clasificación sobre tono y opinión.
- Verificación de afirmaciones documentales: con NLI4CT en la mezcla, puede evaluar si un documento respalda o contradice una afirmación, devolviendo probabilidad sobre opciones de entailment.
- Filtrado previo en pipelines de CI/CD: preguntas binarias sobre si un cambio cumple criterios definidos, con salida estructurada fácil de integrar en lógica de automatización.

## Benchmarks y rendimiento

| Benchmark | v2.1 | v3 |
|---|---|---|
| Decision Index 0.3 (muestra de 4.500 peticiones) | 41,55 | 51,02 |
| Preguntas de imagen (media de 11 conjuntos) | 0,840 (v2.1 + vision tower base) | 0,891 |
| Visual7W (no entrenado) | 0,857 | 0,873 |
| VSR (no entrenado) | 0,813 | 0,833 |
| JevBench ítems públicos, tier difícil | 0,649 | 0,640 |
| JevBench ítems públicos, tier estándar | 0,986 | 0,986 |
| Conjunto held-out sí/no (399 ítems, puntuado como JevBench) | −1,9 | 44,3 |

No se han publicado resultados de benchmarks convencionales (MMLU, HumanEval, GSM8K) en la información disponible. Las cifras anteriores corresponden a las métricas propias del autor.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 8,4 GB solo para los pesos de texto, más overhead de activaciones y del runtime; el vision tower añade 0,6 GB cuando se usa la ruta de imagen.
- GPU recomendadas: una GPU con al menos 16 GB de VRAM para bf16 con margen; A100, H100 y B300 son las referencias del autor (el entrenamiento LoRA se hizo en una B300).
- Cabe en GPU de consumo: sí, en tarjetas con 16 GB o más (por ejemplo RTX 4090, RTX 4080) en bf16; con builds GGUF cuantizados podría caber en GPUs de 8-12 GB, aunque no se especifican los niveles de cuantización disponibles.
- Opciones de despliegue: `decider.infer.Decider` y `decider.serve` (FastAPI/uvicorn) del paquete `decider-ai`; builds GGUF para llama.cpp según la model card. Requiere `torch`, `transformers>=5` y `flash-linear-attention`; `pillow` para imágenes.
- Latencia y throughput: no disponibles. La model card indica que las filas de imagen se leen de una en una, sin batching ni CUDA graphs, lo que limita el throughput en la ruta visual.

## Comparativa con modelos similares

| Modelo | Base | Parámetros | Contexto | Imágenes | Licencia | Uso previsto |
|---|---|---|---|---|---|---|
| decider-4b v3 | Qwen3.5-4B-Base | 4,2B | No disponible | Sí | Apache 2.0 | Punto medio de la familia; texto e imágenes |
| decider-2b v12 | Qwen3.5-2B-Base | No disponible | No disponible | Sí | No disponible | El más rápido: enrutamiento, clasificación, juicios |
| decider-12b v2 | Gemma-4-12B-it | No disponible | No disponible | No | No disponible | Modelo JevBench de la familia; texto |
| decider-31b v2 | Gemma-4-31B-it, NVFP4 | No disponible | No disponible | Sí | No disponible | El más potente; requiere GPU Blackwell y vLLM |

La comparativa se limita a la propia familia decider, ya que la información proporcionada no incluye modelos externos comparables en la categoría de decisión tipada con salida calibrada.

## Limitaciones y advertencias

- El modelo solo soporta inglés; no se han validado otros idiomas.
- No es un modelo generativo: no puede producir texto libre, tool calling ni cadenas de razonamiento multi-paso.
- La calibración de las respuestas sí/no se sacrifica deliberadamente en la configuración por defecto (temperatura 0,05; ECE 0,265 frente a 0,102 con temperaturas ajustadas). Para probabilidades calibradas hay que configurar `temperature_by_type` manualmente.
- Riesgo de alucinación en el sentido de asignar probabilidad alta a opciones incorrectas cuando el estado queda fuera de la distribución de entrenamiento; no se documentan evaluaciones de robustez fuera de dominio.
- En la ruta de imagen no se soportan referencias dentro del texto de la pregunta ni respuestas con cajas delimitadoras; las imágenes se leen de una en una, sin batching.
- El rendimiento en el tier difícil de JevBench bajó ligeramente respecto a v2.1 (0,649 a 0,640).
- La licencia Apache 2.0 permite uso comercial, pero la model card no documenta sesgos conocidos ni evaluaciones de seguridad.
- El repositorio ocupa 34,3 GB, lo que incluye pesos en bf16, vision tower y artefactos adicionales; conviene revisar qué se descarga en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Mapika/decider-4b
- Repositorio de código y changelog: https://github.com/Mapika/decider
- decider-2b: https://huggingface.co/Mapika/decider-2b
- decider-12b: https://huggingface.co/Mapika/decider-12b
- decider-12b-vision: https://huggingface.co/Mapika/decider-12b-vision
- decider-31b: https://huggingface.co/Mapika/decider-31b
- decider-35b-a3b: https://huggingface.co/Mapika/decider-35b-a3b
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B-Base
