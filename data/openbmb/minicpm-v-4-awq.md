# openbmb/MiniCPM-V-4-AWQ

## Resumen

MiniCPM-V-4-AWQ es la versión cuantizada en 4 bits (AWQ) del modelo multimodal MiniCPM-V 4.0, desarrollado por el equipo OpenBMB. Se trata de un modelo de visión-lenguaje (MLLM) que combina un codificador de visión SigLIP2-400M con el modelo de lenguaje MiniCPM4-3B, sumando aproximadamente 4.060 millones de parámetros en total. Su objetivo es ofrecer capacidades de comprensión de imagen única, múltiples imágenes y vídeo comparables a las de GPT-4V, pero con una eficiencia suficiente para ejecutarse en dispositivos móviles y hardware de consumo.

La versión AWQ reduce el peso del modelo a 4 bits, lo que disminuye los requisitos de memoria y acelera la inferencia sin una pérdida significativa de calidad. Según la model card, MiniCPM-V 4.0 alcanza una puntuación media de 69,0 en OpenCompass (promedio de 8 benchmarks), superando a GPT-4.1-mini-20250414 (68,9), a MiniCPM-V 2.6 (65,2) y a Qwen2.5-VL-3B-Instruct (64,5), a pesar de tener solo 4,1B de parámetros. El modelo se distribuye bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones adicionales.

Esta ficha se centra en la variante AWQ, que facilita el despliegue en entornos con recursos limitados, como portátiles con GPU de gama media o incluso dispositivos móviles. El repositorio ocupa 3,3 GB y los pesos están en formato safetensors, listos para usar con Transformers, vLLM, llama.cpp, Ollama y otras herramientas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language (SigLIP2-400M + MiniCPM4-3B) |
| Parametros totales | 4.059.533.040 (~4,06B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | AWQ 4-bit (esta variante) |
| Idiomas soportados | Multilingue (no se especifica lista completa) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

MiniCPM-V 4.0 combina un codificador de vision SigLIP2-400M con el modelo de lenguaje MiniCPM4-3B, dando lugar a un total de 4,1B parametros. No se trata de un modelo de mezcla de expertos (MoE), sino de un modelo denso. El componente de vision procesa imagenes y videos, mientras que el modulo de lenguaje gestiona la generacion de texto y la interaccion multimodal. El modelo hereda las capacidades de comprension de imagen unica, multiple y video de MiniCPM-V 2.6, pero con una eficiencia mejorada gracias a la compresion de tokens visuales y a un diseno optimizado para inferencia en dispositivos.

Los datos de entrenamiento no se detallan en la informacion proporcionada, aunque se menciona el uso del dataset RLAIF-V-Dataset en la model card, lo que sugiere un proceso de alineacion con retroalimentacion de IA (RLAIF). No se especifica el numero total de tokens de entrenamiento ni la composicion exacta del corpus. La cuantizacion AWQ se aplica posteriormente al modelo base para reducir el peso a 4 bits, manteniendo un equilibrio entre rendimiento y requisitos de memoria.

## Capacidades

- Comprension de imagen unica: analisis de contenido visual, reconocimiento de objetos, escenas y relaciones espaciales.
- Comprension de multiples imagenes: comparacion y razonamiento entre varias imagenes en una misma conversacion.
- Comprension de video: procesamiento de secuencias de video para extraer informacion temporal y contextual.
- OCR (reconocimiento optico de caracteres): extraccion de texto de imagenes y documentos escaneados.
- Conversacion multimodal: interaccion dialogica en la que el modelo responde a preguntas sobre el contenido visual.
- Multilingue: soporte para multiples idiomas, aunque no se detalla la lista completa.
- No se menciona soporte explicito para tool calling ni function calling en la informacion disponible.

## Casos de uso

- Extraccion de texto de documentos: el modelo puede digitalizar facturas, recibos o formularios mediante OCR, convirtiendo imagenes en texto estructurado para su posterior procesamiento en sistemas de gestion documental.
- Analisis de imagenes medicas: aunque no se ha validado especificamente para diagnostico, puede ayudar a radiólogos a revisar radiografias o resonancias, generando descripciones preliminares de hallazgos visibles.
- Moderacion de contenido visual: en plataformas sociales, puede analizar imagenes y videos para detectar contenido inapropiado o que viole las politicas de uso.
- Asistente de accesibilidad: descripcion de imagenes en tiempo real para personas con discapacidad visual, integrable en aplicaciones moviles gracias a su eficiencia en dispositivos.
- Automatizacion de soporte tecnico: responder consultas de clientes que incluyen capturas de pantalla o fotografias de productos, identificando el problema y ofreciendo soluciones.
- Educacion interactiva: generar explicaciones a partir de diagramas, graficos o ilustraciones en libros de texto, facilitando el aprendizaje autonomo.
- Analisis de video de vigilancia: procesar grabaciones para identificar eventos relevantes (personas, vehiculos, movimientos anomalos) con baja latencia en hardware de borde.

## Benchmarks y rendimiento

La model card proporciona el promedio de OpenCompass (8 benchmarks) para MiniCPM-V 4.0, asi como comparaciones con otros modelos. No se publican desgloses individuales por benchmark para este modelo en la informacion disponible.

| Modelo | Tamano | OpenCompass (media) |
|---|---|---|
| MiniCPM-V 4.0 | 4,1B | 69,0 |
| GPT-4.1-mini-20250414 | - | 68,9 |
| MiniCPM-V 2.6 | 8,1B | 65,2 |
| Qwen2.5-VL-3B-Instruct | 3,8B | 64,5 |
| InternVL2.5-4B | 3,7B | 65,1 |
| Qwen2.5-VL-7B-Instruct | 8,3B | 70,9 |
| InternVL2.5-8B | 8,1B | 68,1 |

No se han publicado resultados detallados para OCRBench, MathVista, HallusionBench, MMMU, MMVet, MMBench, MMStar o AI2D especificamente para MiniCPM-V 4.0 en la informacion disponible.

## Requisitos de hardware

- La cuantizacion AWQ 4-bit reduce el peso a aproximadamente 2,2 GB (calculado a partir de 4,06B parametros × 0,5 bytes/parametro), aunque el repositorio ocupa 3,3 GB por los archivos adicionales. Esto permite ejecutar el modelo en GPUs con 4-6 GB de VRAM, como una NVIDIA RTX 3050 o superior.
- La model card menciona que el modelo base se ejecuta en iPhone 16 Pro Max con menos de 2 segundos de latencia para el primer token y mas de 17 tokens/segundo, lo que indica que es viable en dispositivos moviles con aceleracion neuronal.
- Para inferencia en servidor, se recomienda vLLM, SGLang o TGI, que soportan cuantizacion AWQ de forma nativa.
- En entornos sin GPU, es posible usar llama.cpp u Ollama con cuantizacion adicional (por ejemplo, GGUF), aunque el rendimiento sera menor.
- No se proporcionan datos de throughput en servidores con multiples peticiones concurrentes, aunque el modelo esta disenado para alta eficiencia bajo carga.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | OpenCompass | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MiniCPM-V 4.0 (AWQ) | 4,1B | No disponible | 69,0 | Apache-2.0 | HuggingFace, ModelScope |
| Qwen2.5-VL-3B-Instruct | 3,8B | No disponible | 64,5 | Apache-2.0 | HuggingFace |
| MiniCPM-V 2.6 | 8,1B | No disponible | 65,2 | Apache-2.0 | HuggingFace |
| InternVL2.5-4B | 3,7B | No disponible | 65,1 | MIT | HuggingFace |

MiniCPM-V 4.0 supera a modelos de tamano similar (Qwen2.5-VL-3B) y a su predecesor con el doble de parametros (MiniCPM-V 2.6), manteniendo una licencia permisiva. La principal ventaja es su eficiencia, que permite despliegue en dispositivos de borde.

## Limitaciones y advertencias

- No se han publicado analisis de sesgos especificos para este modelo; como cualquier sistema multimodal, puede reflejar sesgos presentes en los datos de entrenamiento.
- Riesgo de alucinacion visual: el modelo puede generar descripciones inexactas de imagenes ambiguas o de baja calidad.
- La longitud de contexto no se ha especificado, lo que limita la planificacion de tareas que requieran ventanas largas de entrada (por ejemplo, analisis de documentos extensos).
- El soporte multilingue no esta detallado; la calidad puede variar significativamente entre idiomas.
- Aunque la licencia Apache-2.0 permite uso comercial, es recomendable verificar que el uso previsto cumple con las politicas de la comunidad y con posibles patentes de terceros.
- Para produccion, se recomienda validar el rendimiento en el dominio especifico antes de desplegar, especialmente en tareas criticas como diagnostico medico o moderacion de contenido.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/openbmb/MiniCPM-V-4-AWQ
- Modelo base (sin cuantizar): https://huggingface.co/openbmb/MiniCPM-V-4
- Repositorio GitHub (MiniCPM-o): https://github.com/OpenBMB/MiniCPM-o
- Modelo en ModelScope: https://www.modelscope.cn/models/OpenBMB/MiniCPM-V-4
- Cookbook con ejemplos de uso: https://github.com/OpenSQZ/MiniCPM-V-CookBook
- Demo en linea: http://211.93.21.133:8889/
