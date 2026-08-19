# flodraye/qwen3-0.6b-selfdistill-forward-kl

## Resumen

Este checkpoint, `flodraye/qwen3-0.6b-selfdistill-forward-kl`, es un modelo derivado de Qwen3-0.6B mediante una técnica de auto-destilación (self-distillation) con divergencia forward-KL (alpha=0.0). El autor, flodraye, lo ha publicado como parte de un proyecto de investigación sobre inyección de conocimiento y aprendizaje continuo en modelos de lenguaje, con el objetivo de comparar directamente los efectos de la forward-KL frente a la reverse-KL en la misma arquitectura y receta de entrenamiento.

El modelo base es Qwen3-0.6B, un transformer denso de 596 millones de parámetros con una ventana de contexto de 32.768 tokens, desarrollado por el equipo Qwen. Este checkpoint ha sido entrenado sobre un conjunto de datos sintéticos de biografías de 200 personas ficticias, con un proceso de repetición y selección top-k, y un ajuste fino con tasa de aprendizaje constante. La relevancia de este trabajo radica en explorar cómo la dirección de la divergencia KL afecta a la calidad de la destilación y a la capacidad del modelo para retener conocimientos inyectados sin olvidar los generales.

Al tratarse de un modelo experimental y de pequeño tamaño, su principal interés es académico y de investigación, más que de producción. No se han publicado benchmarks específicos para este checkpoint, por lo que su rendimiento debe inferirse del modelo base y de los resultados generales de la familia Qwen3.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3-0.6B) |
| Parametros totales | 596.049.920 (0,596B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 32.768 tokens (heredado del modelo base) |
| Tipos de cuantizacion | No especificado (pesos en safetensors, cuantizable con herramientas externas) |
| Idiomas soportados | No disponibles para este checkpoint; el modelo base Qwen3-0.6B soporta principalmente ingles y chino, con capacidad multilingue limitada |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura de Qwen3-0.6B, un transformer denso con atención por ventanas deslizantes y mecanismos de atención QKV con Grouped Query Attention (GQA). El entrenamiento de este checkpoint sigue una receta de auto-destilación forward-KL: se generan 200 biografías sinteticas de personas ficticias, se repiten 2000 veces, se aplica seleccion top-k con k=5, y se entrena con un batch de 100 ejemplos, gradiente acumulado de 4 pasos, tasa de aprendizaje constante de 1e-5 y 1000 pasos totales. El objetivo es inyectar conocimiento especifico (los datos sinteticos) mientras se preserva el conocimiento general del modelo base mediante la divergencia KL en direccion forward (es decir, la distribucion del modelo estudiante se ajusta para cubrir la del profesor, lo que tiende a producir respuestas mas diversas pero potencialmente menos precisas que la reverse-KL).

No se han publicado detalles adicionales sobre la composicion del dataset de entrenamiento, ni sobre el uso de tecnicas como RLHF o DPO. El proyecto se documenta en el repositorio `distill-cl-biography`, donde se indica que este checkpoint es la contraparte directa de un modelo entrenado con reverse-KL bajo la misma receta, para facilitar la comparacion.

## Capacidades

- Generacion de texto en ingles y chino (heredado del modelo base), con capacidad limitada en otros idiomas.
- Razonamiento basico y respuesta a preguntas factuales, aunque su tamaño reducido limita la profundidad.
- Soporte de tool calling y function calling, segun las capacidades de Qwen3-0.6B, aunque no se ha verificado en este checkpoint especifico.
- Capacidad de modo pensante (thinking mode) y modo no pensante, tal como se implementa en la familia Qwen3, aunque la activacion depende de la configuracion del prompt.
- No se han evaluado capacidades especificas de vision, audio o multimodalidad en este checkpoint.

## Casos de uso

- Investigacion academica sobre destilacion de conocimiento: el modelo permite estudiar el efecto de la forward-KL frente a la reverse-KL en la misma arquitectura y con el mismo conjunto de datos, facilitando comparaciones controladas.
- Aprendizaje continuo experimental: sirve como banco de pruebas para tecnicas de inyeccion de conocimiento en modelos pequenos sin olvido catastrofico.
- Generacion de biografias sinteticas: al haber sido entrenado con datos de personas ficticias, puede generar textos coherentes sobre perfiles inventados, util para pruebas de generacion de contenido controlado.
- Evaluacion de tecnicas de regularizacion: permite analizar como la direccion de la divergencia KL afecta a la diversidad y precision de las respuestas en modelos de lenguaje.
- Desarrollo de pipelines de auto-destilacion: el codigo de entrenamiento esta disponible en el repositorio, por lo que puede servir como referencia para implementar recetas similares en otros modelos.
- Educacion y formacion en IA: como ejemplo practico de fine-tuning con destilacion, puede utilizarse en cursos o talleres sobre aprendizaje continuo y regularizacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Este checkpoint no incluye evaluaciones de MMLU, HumanEval, GSM8K ni otras pruebas estandar. Para una referencia del rendimiento del modelo base, se pueden consultar los resultados de Qwen3-0.6B en el reporte tecnico de Qwen3, pero no se dispone de datos especificos para este checkpoint.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,2 GB en FP16 (596M parametros × 2 bytes), mas overhead de activaciones y cache, lo que cabe en cualquier GPU moderna con al menos 4 GB de VRAM.
- GPU recomendadas: cualquier GPU consumer con 4-8 GB (por ejemplo, GTX 1660, RTX 2060, RTX 3060, RTX 4090). Tambien funciona en CPUs con suficiente RAM.
- Con cuantizacion a 8 bits o 4 bits, la VRAM requerida se reduce a unos 600-800 MB, permitiendo ejecucion en GPUs integradas o incluso en Raspberry Pi con suficiente RAM.
- Opciones de despliegue: compatible con vLLM, llama.cpp, Ollama, TGI y otros frameworks que soporten modelos de la familia Qwen3. El formato safetensors se puede convertir a GGUF para ejecucion en CPU.
- Latencia y throughput: al ser un modelo de 0,6B, la inferencia es muy rapida. En una GPU moderna se pueden alcanzar cientos de tokens por segundo, aunque no hay mediciones publicadas para este checkpoint.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Qwen3-0.6B (base) | 596M | 32k | Apache 2.0 | Modelo original, sin destilacion adicional |
| qwen3-0.6b-selfdistill-reverse-kl (hipotetico) | 596M | 32k | Apache 2.0 | Contraparte con reverse-KL, mencionado en el repositorio pero no publicado en HF |
| jeehwon/Qwen3-0.6B-Distill | 596M | 32k | Apache 2.0 | Otro intento de destilacion sobre Qwen3-0.6B, con propositos no especificados |

No se dispone de datos de rendimiento comparativo entre estos modelos. La comparacion directa entre forward-KL y reverse-KL es el objetivo principal del proyecto, pero los resultados aun no se han publicado.

## Limitaciones y advertencias

- Modelo experimental: no ha sido sometido a evaluaciones exhaustivas ni a pruebas de seguridad. Su uso en produccion no esta recomendado.
- Sesgos heredados: al derivar de Qwen3-0.6B, puede presentar sesgos presentes en el modelo base, especialmente en temas sensibles.
- Riesgo de alucinacion: al ser un modelo pequeno y entrenado con datos sinteticos, puede generar informacion falsa o inventada con facilidad.
- Limitaciones de idioma: el modelo base esta optimizado principalmente para ingles y chino; su rendimiento en otros idiomas, incluido el espanol, puede ser deficiente.
- Contexto limitado: aunque la ventana es de 32k tokens, en la practica la calidad de las respuestas puede degradarse en contextos muy largos debido al tamaño del modelo.
- Restricciones de licencia: la licencia Apache 2.0 permite uso comercial, pero al ser un modelo derivado de Qwen3, deben respetarse los terminos de la licencia original (Apache 2.0 tambien). No se han identificado restricciones adicionales.
- Dependencia del repositorio: para reproducir el entrenamiento o cargar el modelo correctamente, es necesario consultar la documentacion del repositorio `distill-cl-biography`, ya que la model card no incluye instrucciones detalladas de uso.

## Enlaces

- HuggingFace: https://huggingface.co/flodraye/qwen3-0.6b-selfdistill-forward-kl
- Repositorio de entrenamiento: https://github.com/florentdraye/distill-cl-biography
- Modelo base Qwen3-0.6B: https://huggingface.co/Qwen/Qwen3-0.6B
- Reporte tecnico de Qwen3: https://arxiv.org/html/2505.09388v1
- Guia de la familia Qwen3: https://insiderllm.com/guides/qwen3-complete-guide/
