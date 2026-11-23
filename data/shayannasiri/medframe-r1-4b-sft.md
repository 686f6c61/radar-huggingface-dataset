# Shayannasiri/MedFrame-R1-4B-SFT

## Resumen

MedFrame-R1-4B-SFT es un modelo multimodal de razonamiento medico desarrollado por Shayannasiri, obtenido mediante ajuste fino supervisado (SFT) sobre Qwen/Qwen3-VL-4B-Instruct. Forma parte del marco MedFrame-R1, presentado por el autor como un framework de aprendizaje por refuerzo fiable para modelos de lenguaje e imagen medicos (medical MLLMs). El modelo resuelve tareas de image-text-to-text en el dominio clinico, generando cadenas de razonamiento (chain-of-thought) antes de emitir la respuesta final.

La arquitectura subyacente es la de Qwen3-VL, un transformer multimodal con torre de vision, adaptada aqui mediante un arranque en frio supervisado sobre objetivos de CoT con entropia cruzada ponderada y una tecnica denominada Adaptive Early-Stop Loss, durante una sola epoca. El entrenamiento utiliza el conjunto MBZUAI/medix-rl-data (51.335 muestras) con trazas de razonamiento publicadas en Shayannasiri/MedFrame-R1-CoT.

Es relevante como ejemplo de especializacion de un modelo vision-lenguaje de ~1,1 mil millones de parametros reales (segun los pesos en safetensors) para razonamiento medico con decodificacion explicita del razonamiento, bajo licencia Apache 2.0 y con enfasis declarado en uso exclusivamente de investigacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Qwen3-VL): torre de vision + modelo de lenguaje, con soporte de razonamiento CoT |
| Parametros totales | 1.109.453.952 (segun safetensors); el nombre comercial indica 4B |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; sin GGUF declarado) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura Qwen3-VL-4B-Instruct: un transformer multimodal que procesa imagenes y texto y genera respuestas textuales, con un procesador (AutoProcessor) que aplica la plantilla de chat y tokeniza las entradas. Sobre esta base se aplica un ajuste fino supervisado (SFT) de una sola epoca con arranque en frio sobre objetivos de cadena de razonamiento, usando entropia cruzada ponderada y Adaptive Early-Stop Loss, una variante que presumiblemente modula la perdida para detener la generacion del razonamiento en el punto adecuado.

Los datos de entrenamiento provienen de MBZUAI/medix-rl-data (51.335 muestras) y las trazas de razonamiento del dataset Shayannasiri/MedFrame-R1-CoT. La model card menciona que el marco MedFrame-R1 incorpora aprendizaje por refuerzo, pero esta variante concreta (SFT) corresponde solo a la fase de arranque en frio supervisado. No se especifican el numero de tokens de entrenamiento, la composicion detallada del dataset ni si hubo fases posteriores de RLHF o DPO en esta version.

## Capacidades

- Generacion de texto y razonamiento multimodal: procesa pares imagen-texto y produce respuestas textuales.
- Razonamiento explicito: el modelo escribe su cadena de razonamiento antes de la respuesta final, tal como se describe en la model card.
- Respuesta a preguntas visuales medicas (VQA): por ejemplo, interpretacion de imagenes radiologicas con preguntas como la deteccion de neumotorax.
- Respuesta a preguntas textuales medicas (QA): evaluado sobre 11 benchmarks de texto segun la model card.
- Conversacion multi-turno: la plantilla de chat y el pipeline image-text-to-text permiten diálogos estructurados por roles.
- Integracion con transformers: carga mediante AutoModelForImageTextToText y AutoProcessor, compatible con endpoints.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente y multi-step reasoning mas alla del CoT interno: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Vision, audio u otras modalidades: vision confirmada; audio no disponible.

## Casos de uso

- Investigacion en razonamiento medico multimodal: el modelo sirve como banco de pruebas para estudiar como el SFT sobre cadenas de razonamiento afecta a la precision en VQA y QA medicos, dado que el autor publica las trazas CoT y evalua sobre 17 benchmarks.
- Analisis de imagenes radiologicas en entornos de investigacion: se le puede preguntar por hallazgos concretos (por ejemplo, presencia de neumotorax) y obtener una justificacion paso a paso que un investigador puede auditar, sin uso clinico.
- Generacion de explicaciones docentes: a partir de una imagen medica y una pregunta, el modelo produce un razonamiento intermedio que puede emplearse como material de estudio o para comparar estilos de razonamiento.
- Evaluacion de pipelines de RL para MLLMs medicos: al ser la fase SFT del marco MedFrame-R1, permite medir la linea base antes de aplicar las fases de refuerzo descritas por el autor.
- Prototipado de asistentes de triaje informativo (no diagnostico): con contexto de imagen y texto, puede generar respuestas estructuradas para experimentos de interfaz, siempre con supervision humana y sin decision clinica.
- Benchmarking de modelos pequenos multimodales: con ~1,1 mil millones de parametros reales y licencia Apache 2.0, es util como referencia ligera frente a modelos medicos de mayor tamano en experimentos academicos.
- Generacion de datos sinteticos de razonamiento: sus cadenas CoT pueden emplearse para aumentar datasets de investigacion, dado que el autor ya publica un dataset de trazas.

## Benchmarks y rendimiento

La model card indica resultados de precision (%) sobre 17 benchmarks medicos (19.200 items), evaluados con reglas deterministas y un panel de tres jueces. VQA y QA son las medias sobre los 6 benchmarks de imagen y los 11 de texto; Macro es la media sobre los 17 y Micro es agrupada sobre todas las muestras. Sin embargo, los valores numericos se presentan solo en una imagen (results.png) y no estan disponibles como texto en la informacion proporcionada.

| Metrica | Valor |
|---|---|
| VQA (media de 6 benchmarks de imagen) | no disponible (solo en imagen results.png) |
| QA (media de 11 benchmarks de texto) | no disponible (solo en imagen results.png) |
| Macro (media de 17 benchmarks) | no disponible (solo en imagen results.png) |
| Micro (agrupada sobre todas las muestras) | no disponible (solo en imagen results.png) |

No se han publicado resultados numericos de benchmarks en texto en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita. Con 1.109.453.952 parametros en safetensors, en fp16 el peso ronda los 2,2 GB; en bf16 similar; en cuantizacion de 8 bits ~1,1 GB y en 4 bits ~0,6 GB, a lo que hay que sumar la memoria de la torre de vision, el procesador y el cache KV (estimaciones orientativas, no publicadas por el autor).
- GPU recomendadas: no especificadas por el autor. Por tamano, cabria en GPUs de consumo como RTX 3060 12 GB, RTX 4070 o RTX 4090 en fp16; para despliegue multi-usuario se recomendarian A100 o H100, aunque no hay datos publicados.
- Cabe en GPU de consumo: si, previsiblemente en cualquier GPU con 8 GB o mas en fp16, segun el recuento de parametros; no confirmado por el autor.
- Opciones de despliegue: transformers (AutoModelForImageTextToText y AutoProcessor) es la via documentada; el tag endpoints_compatible sugiere compatibilidad con endpoints de Hugging Face. No se documentan vLLM, llama.cpp, Ollama ni TGI, y no hay pesos GGUF publicados.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MedFrame-R1-4B-SFT | 1.109.453.952 (safetensors) | no disponible | Multimodal medico con CoT (SFT) | Apache 2.0 | Hugging Face, transformers |
| Qwen/Qwen3-VL-4B-Instruct (base) | no disponible en la informacion | no disponible | Multimodal generalista | no disponible en la informacion | Hugging Face |
| Alternativas medicas multimodales de tamano similar | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento numericos de MedFrame-R1-4B-SFT ni de los modelos comparables en la informacion proporcionada, por lo que la comparacion cuantitativa no es posible.

## Limitaciones y advertencias

- Uso previsto exclusivamente de investigacion: la model card indica explicitamente "Research only. Not for clinical decision making"; no debe emplearse para diagnostico ni decision clinica.
- Riesgo de alucinacion: al ser un modelo de ~1,1 mil millones de parametros reales especializado en razonamiento explicito, puede generar cadenas de razonamiento plausibles pero incorrectas en hallazgos radiologicos o recomendaciones.
- Sesgos conocidos: no se documentan en la informacion proporcionada; los sesgos del dataset MBZUAI/medix-rl-data y de la base Qwen3-VL no se detallan.
- Limitaciones de contexto e idioma: la longitud de contexto y los idiomas soportados no estan disponibles, lo que impide garantizar cobertura multilingue o documentos largos.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el autor restringe el uso a investigacion; conviene verificar la compatibilidad con la licencia de la base Qwen3-VL-4B-Instruct antes de cualquier despliegue.
- Datos de evaluacion incompletos: los resultados de benchmarks solo aparecen en una imagen y no como cifras textuales; la evaluacion usa un panel de tres jueces, lo que introduce variabilidad respecto a metricas automaticas.
- Madurez: modelo con 0 descargas y 0 likes en el momento de la consulta, creado y actualizado en noviembre de 2026, sin paper publicado ("Paper coming soon"), por lo que la validacion externa es practicamente inexistente.
- Formato: no se publican pesos cuantizados (GGUF, AWQ, GPTQ), lo que limita el despliegue en entornos de bajos recursos sin conversion manual.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Shayannasiri/MedFrame-R1-4B-SFT
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-4B-Instruct
- Dataset de entrenamiento: https://huggingface.co/datasets/MBZUAI/medix-rl-data
- Dataset de trazas de razonamiento: https://huggingface.co/datasets/Shayannasiri/MedFrame-R1-CoT
