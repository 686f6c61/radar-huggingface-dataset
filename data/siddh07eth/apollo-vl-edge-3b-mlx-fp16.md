# Siddh07ETH/Apollo-VL-Edge-3B-MLX-FP16

## Resumen

Apollo-VL-Edge-3B es un modelo de visión-lenguaje (VLM) de 3 mil millones de parámetros desarrollado por Pluto-AI-Labs (Siddharth N R), diseñado para ejecutarse en dispositivos con recursos limitados (edge AI). Se basa en la arquitectura Qwen2.5-VL y ha sido ajustado con un dataset propio llamado Apollo-VL-Massive, compuesto por aproximadamente 162 000 muestras multimodales. El modelo está pensado para tareas como OCR, comprensión de gráficos y conversación visual, y se describe como un "Thinking VLM", lo que sugiere capacidades de razonamiento mejoradas.

La versión aquí referenciada es una conversión a MLX en precisión FP16, optimizada para Apple Silicon, aunque también existe una versión GGUF para llama.cpp. El repositorio ocupa 15 GB, lo que incluye los pesos del modelo y posiblemente archivos adicionales. Aunque el modelo aún no tiene descargas ni valoraciones en Hugging Face, su desarrollo está documentado en redes sociales y ha sido publicado en otras plataformas como LLM Explorer, que estima un consumo de VRAM de 7,5 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen2.5-VL (transformer de vision-lenguaje) |
| Parametros totales | 3 mil millones |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (el modelo base Qwen2.5-VL soporta 32 768 tokens, pero no se confirma para esta variante) |
| Tipos de cuantizacion | FP16 (version MLX), GGUF (varias cuantizaciones publicadas por mradermacher) |
| Idiomas soportados | ingles (segun metadatos de Hugging Face) |
| Licencia | no disponible en Hugging Face; la version GGUF de mradermacher indica Apache-2.0, pero no se confirma para el modelo original |
| Formato de pesos | safetensors (MLX), GGUF |

## Arquitectura y entrenamiento

Apollo-VL-Edge-3B se construye sobre la arquitectura Qwen2.5-VL, un modelo de transformer multimodal que combina un codificador de vision con un decodificador de lenguaje. El modelo ha sido ajustado mediante fine-tuning sobre un dataset propio denominado Apollo-VL-Massive, que incluye alrededor de 162 000 muestras multimodales (imagen-texto). Segun las publicaciones del autor, se trata de un "Thinking VLM", lo que sugiere que se ha entrenado para generar razonamiento paso a paso antes de responder, similar a los modelos de razonamiento tipo o1.

No se dispone de informacion detallada sobre el numero total de tokens de entrenamiento, la composicion exacta del dataset ni el uso de tecnicas como RLHF o DPO. La version MLX es una conversion de los pesos originales a formato safetensors compatible con MLX, sin cambios en la arquitectura.

## Capacidades

- Generacion de texto multimodal: procesa imagenes y texto para producir respuestas en lenguaje natural.
- OCR (reconocimiento optico de caracteres): extrae texto de imagenes y documentos escaneados.
- Comprension de graficos y tablas: interpreta diagramas, graficos de datos y capturas de pantalla.
- Conversacion visual: mantiene dialogos multi-turno sobre contenido visual.
- Razonamiento visual: realiza inferencias logicas a partir de imagenes (p. ej., responder preguntas sobre escenas).
- Ejecucion en edge: disenado para dispositivos con recursos limitados, como portatiles Apple Silicon o sistemas embebidos via llama.cpp.

## Casos de uso

- Digitalizacion de documentos: extraer texto de facturas, recibos o formularios escaneados mediante OCR, con una ventana de contexto suficiente para procesar paginas completas.
- Asistencia visual para personas con discapacidad: describir el entorno a partir de una foto capturada con un telefono o una camara conectada a un dispositivo edge.
- Analisis de graficos financieros: interpretar imagenes de graficos de bolsa o informes trimestrales para generar resumenes textuales.
- Moderacion de contenido en redes sociales: clasificar imagenes y detectar texto no permitido en publicaciones, usando un modelo ligero que puede desplegarse en servidores de baja capacidad.
- Chatbots de soporte tecnico con capturas de pantalla: recibir una imagen de un error y ofrecer instrucciones de solucion basadas en el contenido visual.
- Educacion interactiva: responder preguntas sobre diagramas cientificos o mapas historicos en aplicaciones de aprendizaje offline.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de puntuaciones en MMLU, HumanEval, GSM8K ni otros conjuntos de evaluacion estandar para este modelo. La unica referencia indirecta es la estimacion de VRAM de 7,5 GB proporcionada por LLM Explorer, pero no se detalla la metodologia ni se comparan con otros modelos.

## Requisitos de hardware

- VRAM estimada: 7,5 GB segun LLM Explorer, lo que permite ejecucion en GPUs consumer de gama media (RTX 3060 12 GB, RTX 4070, etc.).
- GPU recomendadas: para la version MLX se requiere un Mac con chip Apple Silicon (M1 o superior); para la version GGUF puede usarse cualquier GPU compatible con llama.cpp (NVIDIA, AMD, etc.).
- Compatibilidad con consumer GPU: si, siempre que se disponga de al menos 8 GB de VRAM y se utilice una cuantizacion adecuada (p. ej., Q4_K_M).
- Opciones de despliegue: MLX (Apple Silicon), llama.cpp, Ollama (si se publica en su catalogo), o servidores de inferencia como vLLM (si se convierte a formato compatible).
- Latencia y throughput: no disponibles; dependen del hardware y de la cuantizacion elegida.

## Comparativa con modelos similares

No se dispone de comparativas publicadas con otros modelos de la misma categoria. Como referencia general, otros VLM de tamano similar son:

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Apollo-VL-Edge-3B | 3B | no disponible | Apache-2.0 (segun version GGUF) | Hugging Face |
| Qwen2-VL-2B | 2B | 32k | Apache-2.0 | Hugging Face |
| MiniCPM-V 2.6 | 8B | 32k | Apache-2.0 | Hugging Face |

No se han encontrado datos de rendimiento comparativo entre estos modelos.

## Limitaciones y advertencias

- Sesgos: al estar entrenado principalmente con datos en ingles, puede presentar sesgos culturales y linguisticos limitados a ese idioma.
- Riesgo de alucinacion: como todo modelo de lenguaje, puede generar descripciones incorrectas de imagenes o inventar detalles no presentes en la entrada.
- Limitaciones de contexto: la longitud de contexto no esta confirmada; si se hereda de Qwen2.5-VL, seria de 32 768 tokens, pero no hay garantia.
- Restricciones de licencia: la licencia no esta claramente definida en el repositorio original; aunque la version GGUF usa Apache-2.0, se recomienda verificar antes de uso comercial.
- Estado del modelo: el repositorio no tiene descargas ni valoraciones, lo que indica que es un proyecto reciente y posiblemente en fase de pruebas.
- Compatibilidad: la version MLX solo funciona en Apple Silicon; para otros entornos se debe usar la version GGUF.

## Enlaces

- Repositorio Hugging Face (version MLX): https://huggingface.co/Siddh07ETH/Apollo-VL-Edge-3B-MLX-FP16
- Version GGUF de mradermacher: https://huggingface.co/mradermacher/Apollo-VL-Edge-3B-GGUF
- Ficha en LLM Explorer: https://llm-explorer.com/model/Pluto-AI-Labs%2FApollo-VL-Edge-3B,3L5mtC3hkpxLl4GyPd7riU
- Publicacion de LinkedIn sobre el inicio del entrenamiento: https://www.linkedin.com/posts/siddharth-n-r-842529356_apollo-vl-edge-3b-training-started-update-activity-7493535565145853953-QTMd
- Publicacion de LinkedIn sobre los modelos de Pluto AI Labs: https://www.linkedin.com/posts/siddharth-n-r-842529356_7-models-4-datasets-4500-downloads-activity-7492814615605809152-Pn-y
