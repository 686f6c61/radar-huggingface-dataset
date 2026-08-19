# openbmb/MiniCPM-V-4-int4

## Resumen

MiniCPM-V 4.0 es un modelo multimodal (vision-lenguaje) desarrollado por el equipo OpenBMB, disenado para ejecutarse eficientemente en dispositivos de borde como telefonos moviles. Con solo 4.100 millones de parametros, combina un codificador visual SigLIP2-400M con el modelo de lenguaje MiniCPM4-3B, ofreciendo capacidades de comprension de imagen unica, multi-imagen y video. La variante `int4` cuantizada reduce el tamano del repositorio a 2,8 GB, lo que facilita su despliegue en entornos con recursos limitados.

El modelo destaca por su equilibrio entre rendimiento y eficiencia: segun sus desarrolladores, supera a GPT-4.1-mini en la evaluacion OpenCompass (69,0 frente a 68,9) con una fraccion de los recursos computacionales. Esta optimizacion lo convierte en una opcion relevante para aplicaciones de vision por computador en tiempo real, OCR, analisis de video y asistentes conversacionales multimodales, especialmente en escenarios donde el coste de inferencia o la latencia son factores criticos. La licencia Apache 2.0 permite su uso comercial sin restricciones significativas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SigLIP2-400M (vision) + MiniCPM4-3B (lenguaje) |
| Parametros totales | 4.059.533.040 (4,1 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int4 (bitsandbytes), se esperan variantes adicionales |
| Idiomas soportados | Multilingue (detalle no especificado) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

MiniCPM-V 4.0 es un modelo multimodal construido de extremo a extremo que integra un codificador visual SigLIP2-400M con el modelo de lenguaje MiniCPM4-3B. Esta combinacion permite procesar imagenes y video junto con texto, manteniendo un tamano total de 4.100 millones de parametros. La arquitectura sigue el diseno de la serie MiniCPM-V, que emplea un proyector para alinear las representaciones visuales con el espacio de embeddings del modelo de lenguaje.

El entrenamiento utilizo el dataset openbmb/RLAIF-V-Dataset, que incorpora tecnicas de aprendizaje por refuerzo con retroalimentacion de IA (RLAIF) para mejorar la alineacion del modelo con preferencias humanas. Aunque no se detallan los hiperparametros exactos ni el numero total de tokens de entrenamiento, la eficiencia del modelo sugiere una optimizacion cuidadosa del proceso. La principal innovacion reside en su capacidad para mantener un alto rendimiento en tareas de imagen unica, multi-imagen y video con solo 4,1 B de parametros, logrando una latencia inferior a 2 segundos para el primer token y mas de 17 tokens por segundo en iPhone 16 Pro Max.

## Capacidades

- Comprension de imagen unica: analisis de contenido visual, reconocimiento de objetos, escenas y relaciones espaciales.
- Comprension multi-imagen: comparacion y razonamiento entre multiples imagenes, util para tareas como deteccion de diferencias o seleccion de opciones.
- Comprension de video: procesamiento de secuencias de video para extraer informacion temporal y eventos.
- OCR: reconocimiento de texto en imagenes, con buen rendimiento en OCRBench (puntuacion no especificada en la informacion disponible).
- Conversacion multimodal: capacidad de mantener dialogos multi-turno referenciando contenido visual.
- Razonamiento visual: resolucion de problemas que requieren combinar informacion visual y logica (MathVista, MMMU).
- Deteccion de alucinaciones: rendimiento notable en HallusionBench, indicando cierta robustez frente a errores de generacion.
- Despliegue en dispositivo: optimizado para ejecucion en telefonos y tablets, con soporte para iOS.

## Casos de uso

- Atencion al cliente automatizada con soporte visual: el modelo puede procesar imagenes enviadas por usuarios (capturas de pantalla, fotos de productos) y mantener conversaciones multi-turno para resolver incidencias, gracias a su capacidad de comprension de imagen unica y su naturaleza conversacional.
- Analisis de documentos y facturas: combinando OCR con comprension de lenguaje, puede extraer y estructurar informacion de documentos escaneados, facturas o formularios, reduciendo la necesidad de procesos manuales en entornos empresariales.
- Moderacion de contenido en redes sociales: su capacidad de analisis de imagen unica y multi-imagen permite detectar contenido inapropiado o infografias con texto, facilitando la moderacion automatizada en plataformas.
- Asistentes de accesibilidad para personas con discapacidad visual: el modelo puede describir escenas, leer texto de senales o identificar objetos en tiempo real, ejecutandose localmente en un telefono movil sin necesidad de conexion a internet.
- Analisis de video para vigilancia o retail: la comprension de video permite identificar eventos, contar personas o analizar comportamiento en secuencias grabadas, con aplicacion en seguridad o analisis de trafico en tiendas.
- Educacion interactiva: el modelo puede responder preguntas sobre imagenes de libros de texto, diagramas o problemas matematicos visuales, sirviendo como tutor virtual en aplicaciones educativas.
- Generacion de contenido accesible: a partir de una imagen, puede generar descripciones alternativas (alt text) para mejorar la accesibilidad web, o resumir el contenido visual de una presentacion.

## Benchmarks y rendimiento

La informacion disponible incluye resultados de la evaluacion OpenCompass, que agrega 8 benchmarks populares. Los datos se presentan a continuacion, comparando MiniCPM-V 4.0 con modelos similares. Es importante senalar que estos resultados provienen de la model card del autor y no han sido verificados de forma independiente.

| Modelo | Tamano | OpenCompass | OCRBench | MathVista | HallusionBench | MMMU | MMVet | MMBench V1.1 | MMStar | AI2D |
|---|---|---|---|---|---|---|---|---|---|---|
| GPT-4v-20240409 | - | 63,5 | 656 | 55,2 | 43,9 | 61,7 | 67,5 | 79,8 | 56,0 | 78,6 |
| Gemini-1.5-Pro | - | 64,5 | 754 | 58,3 | 45,6 | 60,6 | 64,0 | 73,9 | 59,1 | 79,1 |
| GPT-4.1-mini-20250414 | - | 68,9 | 840 | 70,9 | 49,3 | 55,0 | 74,3 | 80,9 | 60,9 | 76,0 |
| Claude 3.5 Sonnet-20241022 | - | 70,6 | 798 | 65,3 | 55,5 | 66,4 | 70,1 | 81,7 | 65,1 | 81,2 |
| Qwen2.5-VL-3B-Instruct | 3,8 B | 64,5 | 828 | 61,2 | 46,6 | 51,2 | 60,0 | 76,8 | 56,3 | 81,4 |
| InternVL2.5-4B | 3,7 B | 65,1 | 820 | 60,8 | 46,6 | 51,8 | 61,5 | 78,2 | 58,7 | 81,4 |
| Qwen2.5-VL-7B-Instruct | 8,3 B | 70,9 | 888 | 68,1 | 51,9 | 58,0 | 69,7 | 82,2 | 64,1 | 84,3 |
| InternVL2.5-8B | 8,1 B | 68,1 | 821 | 64,5 | 49,0 | 56,2 | 62,8 | 82,5 | 63,2 | 84,6 |
| MiniCPM-V-2.6 | 8,1 B | 65,2 | 852 | 60,8 | 48,1 | 49,8 | 60,0 | 78,0 | 57,5 | 82,1 |
| MiniCPM-V 4.0 | 4,1 B | 69,0 | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

Los datos de MiniCPM-V 4.0 para benchmarks individuales no se incluyen en la informacion proporcionada; solo se indica la puntuacion media de OpenCompass (69,0).

## Requisitos de hardware

- VRAM estimada para inferencia: con cuantizacion int4 y 4,1 B de parametros, el modelo ocupa aproximadamente 2,8 GB en disco. En memoria, se estima un uso de VRAM entre 3 y 4 GB, dependiendo de la longitud del contexto y el tamano del lote.
- GPU recomendadas: el modelo esta disenado para ejecutarse en dispositivos de borde, por lo que puede funcionar en GPUs consumer como RTX 3060 (12 GB) o superiores. Para despliegue en servidor, una A100 o H100 ofreceria latencias muy bajas y alto throughput.
- Compatibilidad con consumer GPU: si, cabe en GPUs de gama media con 8 GB de VRAM o mas. La cuantizacion int4 reduce significativamente los requisitos de memoria.
- Opciones de despliegue: llama.cpp, Ollama, vLLM, SGLang, LLaMA-Factory y demo web local. Tambien existe una app iOS open source para iPhone y iPad.
- Latencia y throughput: segun el autor, menos de 2 segundos de latencia para el primer token y mas de 17 tokens por segundo en iPhone 16 Pro Max. En GPU, el rendimiento seria sustancialmente mayor, aunque no se proporcionan cifras concretas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | OpenCompass | Licencia | Despliegue |
|---|---|---|---|---|---|
| MiniCPM-V 4.0 | 4,1 B | no disponible | 69,0 | Apache 2.0 | Movil, edge, servidor |
| Qwen2.5-VL-3B-Instruct | 3,8 B | no disponible | 64,5 | Apache 2.0 | Servidor, edge |
| InternVL2.5-4B | 3,7 B | no disponible | 65,1 | MIT | Servidor, edge |
| MiniCPM-V 2.6 | 8,1 B | no disponible | 65,2 | Apache 2.0 | Servidor |

MiniCPM-V 4.0 ofrece el mejor equilibrio entre tamano y rendimiento de su categoria, superando a modelos de tamano similar (Qwen2.5-VL-3B, InternVL2.5-4B) y compitiendo con modelos de 8 B. Su ventaja principal es la eficiencia en dispositivos de borde, donde otros modelos de su tamano no estan optimizados.

## Limitaciones y advertencias

- La informacion disponible no detalla los sesgos especificos del modelo, pero al ser un modelo entrenado con datos de internet, es probable que herede sesgos sociales y culturales presentes en los datos de entrenamiento.
- Riesgo de alucinacion: aunque el modelo muestra buen rendimiento en HallusionBench, sigue siendo susceptible a generar contenido visual o textual incorrecto, especialmente en escenarios ambiguos o poco representados en el entrenamiento.
- Longitud de contexto no especificada: no se indica el numero maximo de tokens de contexto, lo que limita la planificacion de aplicaciones que requieran procesar secuencias largas.
- Rendimiento en benchmarks individuales no disponible: solo se proporciona la puntuacion media de OpenCompass, lo que dificulta una evaluacion detallada por tarea.
- La cuantizacion int4 puede introducir una ligera degradacion en la calidad de las respuestas en comparacion con la version sin cuantizar, aunque la informacion disponible no cuantifica este efecto.
- Aunque la licencia Apache 2.0 permite uso comercial, es recomendable revisar los terminos de las dependencias (como el codificador SigLIP2) para asegurar el cumplimiento normativo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/openbmb/MiniCPM-V-4-int4
- Repositorio GitHub de MiniCPM-V: https://github.com/OpenBMB/MiniCPM-V
- Documentacion de MiniCPM-V 4.0 en GitHub: https://github.com/OpenBMB/MiniCPM-V/blob/main/docs/minicpm_v4_en.md
- Modelo en ModelScope: https://www.modelscope.cn/models/OpenBMB/MiniCPM-V-4-int4
- Cookbook con ejemplos: https://github.com/OpenSQZ/MiniCPM-V-CookBook
- Demo en linea: http://211.93.21.133:8889/
- Wiki del proyecto (en chino): https://modelbest.feishu.cn/wiki/UtWxwcERfiRIpIkBOjuc3h9tn1D
