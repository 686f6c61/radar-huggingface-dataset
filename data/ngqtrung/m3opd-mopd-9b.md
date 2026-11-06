# ngqtrung/M3OPD-MOPD-9B

## Resumen

M3OPD-MOPD-9B es un modelo multimodal de tipo image-text-to-text desarrollado por Nguyen Quang Trung (usuario ngqtrung en Hugging Face) como parte de la receta M3OPD-Reasoner. Parte del modelo base Qwen3.5-9B y se obtiene mediante destilación on-policy multi-profesor (MOPD, multi-teacher on-policy distillation): el estudiante aprende de tres profesores de dominio (STEM sobre imagen, percepción de imagen y vídeo) evaluando sus propias respuestas a los prompts del conjunto M3OPD-RL-193K. El checkpoint publicado corresponde al paso 191, tras una época sobre dichos prompts.

El modelo conserva la arquitectura, el tokenizador, el procesador y la plantilla de chat de Qwen3.5-9B, por lo que es desplegable en los mismos entornos que el modelo base (Transformers, vLLM, SGLang). Cuenta con 9.409.813.744 parámetros y un repositorio de 18,8 GB en safetensors, con licencia Apache 2.0.

Su relevancia radica en el enfoque de entrenamiento: en lugar de destilación supervisada clásica, emplea pérdida de divergencia KL inversa top-32 contra el profesor correspondiente a cada dominio, aplicada sobre respuestas generadas por el propio estudiante. El resultado es un modelo de razonamiento multimodal de 9B orientado a tareas STEM visuales y de vídeo, con modo thinking habilitado por defecto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (hereda la de Qwen3.5-9B; detalles internos no disponibles) |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 40.960 tokens (valor usado en el ejemplo de despliegue con vLLM; contexto nativo de Qwen3.5-9B no confirmado) |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors; no se documentan GGUF ni otras) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda íntegramente la arquitectura de Qwen3.5-9B: misma estructura de red, tokenizador, procesador multimodal y plantilla de chat. No se documentan en la información disponible detalles sobre el número de capas, dimensión oculta, mecanismo de atención ni composición exacta del encoder visual.

El entrenamiento sigue la receta M3OPD-Reasoner en dos fases. Primero se realiza un ajuste supervisado sobre el conjunto M3OPD-SFT-1.35M (1,35 millones de ejemplos). Después se aplica destilación on-policy multi-profesor: el estudiante genera sus propias respuestas a los prompts de M3OPD-RL-193K (193.000 prompts) y cada prompt se enruta al profesor de su dominio (STEM sobre imagen, percepción de imagen o vídeo). La pérdida es una divergencia KL inversa truncada a top-32 respecto a la distribución del profesor asignado. El checkpoint final corresponde al paso 191, una época completa sobre los prompts. No se especifica el número total de tokens de entrenamiento ni si hubo fases adicionales de RLHF o DPO más allá de la destilación descrita.

## Capacidades

- Generación de texto y razonamiento multimodal sobre entradas de imagen y texto (pipeline image-text-to-text).
- Razonamiento STEM visual: problemas de matemáticas y ciencias presentados con imágenes.
- Percepción de imagen: descripción, interpretación y extracción de información de contenido visual.
- Comprensión de vídeo, gracias al profesor de dominio específico de vídeo en la destilación.
- Modo thinking habilitado: el modelo genera cadenas de razonamiento antes de la respuesta final.
- Formato de respuesta controlable mediante instrucciones posteriores a la pregunta (por ejemplo, `Put your final answer within \boxed{}.`).
- Compatibilidad con el ecosistema de Qwen3.5-9B: Transformers, vLLM y SGLang.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Resolución de problemas STEM con imagen: el modelo recibe un enunciado con diagrama o gráfico y genera el razonamiento paso a paso con la respuesta final en formato `\boxed{}`, adecuado para plataformas educativas y correctores automáticos.
- Análisis de documentos técnicos escaneados: extracción e interpretación de figuras, tablas y ecuaciones en artículos científicos o manuales, aprovechando el entrenamiento específico en percepción de imagen.
- Descripción y anotación de vídeo: generación de resúmenes y descripciones de secuencias de vídeo para indexación o accesibilidad, gracias al profesor de dominio de vídeo empleado en la destilación.
- Asistente de laboratorio o ingeniería: interpretación de capturas de instrumentación, esquemas o gráficas de resultados con razonamiento explícito verificable en la cadena de pensamiento.
- Evaluación automatizada de razonamiento multimodal: al ser un estudiante de destilación con trayectoria de checkpoints publicada, sirve como referencia para estudiar la transferencia de profesores a un modelo de 9B.
- Despliegue en infraestructura existente de Qwen3.5-9B: al compartir arquitectura y plantilla de chat, se puede servir con `vllm serve ngqtrung/M3OPD-MOPD-9B --max-model-len 40960` sin adaptar pipelines ya construidos para el modelo base.
- Generación con formato de respuesta estricto: tareas que requieren respuestas parseables (por ejemplo, resultado final delimitado) en contextos de evaluación automática.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión completa (BF16): aproximadamente 19 GB solo para pesos, más memoria para caché KV y activaciones; en la práctica se recomiendan 24 GB o más.
- Cuantización: no se publican pesos GGUF ni cuantizados en el repositorio; la reducción de VRAM requeriría cuantizar los safetensors por cuenta propia.
- GPU recomendadas: A100 (40/80 GB) o H100 para servicio de producción con contexto largo (hasta 40.960 tokens); RTX 4090 (24 GB) puede alojar los pesos en BF16 pero con margen limitado para caché KV en contextos largos.
- GPU de consumo: sí cabe en RTX 4090 y, con cuantización, potencialmente en GPU de 16 GB; no se documentan requisitos oficiales.
- Opciones de despliegue: vLLM y SGLang (soportados explícitamente), Transformers. No se mencionan llama.cpp ni Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Notas |
|---|---|---|---|---|---|
| M3OPD-MOPD-9B | 9,41B | 40.960 (configurado en vLLM) | Imagen + texto (+ vídeo en entrenamiento) | Apache 2.0 | Destilación on-policy multi-profesor; sin benchmarks publicados |
| Qwen/Qwen3.5-9B | ~9B (no confirmado) | no disponible | Imagen + texto | Apache 2.0 | Modelo base; arquitectura y plantilla idénticas |
| Alternativas de 9B multimodales | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificados en la información proporcionada |

La comparación cuantitativa con otros modelos de la misma categoría no está disponible: no se han publicado resultados de benchmarks para M3OPD-MOPD-9B ni se documentan en la información proporcionada las especificaciones completas de Qwen3.5-9B.

## Limitaciones y advertencias

- Ausencia total de benchmarks publicados: no hay evidencia cuantitativa de rendimiento frente al modelo base ni frente a alternativas, lo que impide validar la mejora atribuida a la destilación.
- Sesgos conocidos: no documentados; al heredar los datos y el modelo base, es previsible que arrastre los sesgos de Qwen3.5-9B, pero no se detalla su naturaleza.
- Riesgo de alucinación: no evaluado en la información disponible; el modo thinking puede producir cadenas de razonamiento plausibles pero incorrectas en problemas STEM.
- Idiomas soportados: no especificados; no se garantiza cobertura multilingüe más allá de la del modelo base.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene verificar las condiciones de los datasets de destilación (M3OPD-SFT-1.35M y M3OPD-RL-193K), cuya licencia no se detalla en la información proporcionada.
- Contexto: los 40.960 tokens corresponden al valor de ejemplo en vLLM; no se confirma que sea la longitud nativa máxima ni el régimen en el que el modelo fue entrenado.
- Madurez: repositorio con 0 descargas y 0 likes en el momento de la consulta; sin validación por parte de la comunidad.
- Formato de respuesta: el rendimiento óptimo depende de usar la plantilla de chat nativa de Qwen3.5, thinking activado, sin system prompt y con la línea de formato de respuesta; desviarse de esta configuración puede degradar los resultados.
- No se publican pesos cuantizados, lo que limita el despliegue en hardware de gama baja.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ngqtrung/M3OPD-MOPD-9B
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Dataset SFT: https://huggingface.co/datasets/ngqtrung/M3OPD-SFT-1.35M
- Dataset RL: https://huggingface.co/datasets/ngqtrung/M3OPD-RL-193K
- Colección M3OPD-Reasoner: https://huggingface.co/collections/ngqtrung/m3opd-reasoner-6aed5164d151b6643a1b3b2d
- Perfil del autor: https://huggingface.co/ngqtrung
