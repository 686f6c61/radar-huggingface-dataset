# mradermacher/LibreGemma4e2b-GGUF

## Resumen

LibreGemma4e2b-GGUF es una colección de cuantizaciones en formato GGUF del modelo LibreYOLO/LibreGemma4e2b, un modelo de lenguaje multimodal (VLM) orientado a la detección de objetos. El trabajo de cuantización ha sido realizado por mradermacher, que publica los pesos estáticos en distintos niveles de precisión para facilitar su ejecución en hardware variado, desde GPU de consumo hasta entornos de servidor. El modelo original, desarrollado por LibreYOLO, combina un componente de visión con un modelo de lenguaje basado en la familia Gemma, y está pensado para tareas de image-text-to-text y detección de objetos.

La relevancia de esta versión cuantizada radica en que permite desplegar un VLM de detección de objetos con aproximadamente 4.650 millones de parámetros en entornos con memoria limitada, gracias a las cuantizaciones que van desde Q2_K (3,1 GB) hasta f16 (9,4 GB). La licencia Apache 2.0 facilita su uso tanto en investigación como en aplicaciones comerciales, y el formato GGUF es compatible con motores de inferencia populares como llama.cpp, Ollama o LM Studio.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLM multimodal para deteccion de objetos (basado en Gemma, segun el nombre; arquitectura exacta no disponible) |
| Parametros totales | 4.647.450.147 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16, mas mmproj-Q8_0 y mmproj-f16 |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (con archivos mmproj para el componente multimodal) |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo original LibreGemma4e2b. Por el nombre y los tags, se trata de un modelo de lenguaje multimodal (VLM) que combina un encoder visual (probablemente inspirado en YOLO, dado el nombre del repositorio) con un modelo de lenguaje basado en Gemma. El modelo acepta imagenes y texto como entrada, y es capaz de generar texto descriptivo o realizar tareas de deteccion de objetos. No se han publicado datos sobre el dataset de entrenamiento, el numero de tokens procesados ni las tecnicas de alineacion (RLHF, DPO, etc.). La cuantizacion GGUF es estatica y ha sido realizada por mradermacher sobre los pesos originales en formato safetensors.

## Capacidades

- Deteccion de objetos en imagenes, con salida de texto descriptivo (bounding boxes o descripciones, segun el modelo original).
- Comprension de imagenes y generacion de texto asociado (image-text-to-text).
- Generacion de texto en ingles.
- Capacidades multimodales basicas: entrada de imagen + texto, salida de texto.
- No se ha confirmado soporte de tool calling, agentes ni razonamiento multi-paso en la informacion disponible.

## Casos de uso

- Inspeccion visual automatizada en entornos industriales: el modelo puede analizar imagenes de lineas de produccion para detectar objetos defectuosos o anomalias, generando informes textuales.
- Etiquetado automatico de imagenes: dado un conjunto de fotos, el modelo puede generar descripciones o identificar objetos presentes, util para organizar bases de datos visuales.
- Asistencia a personas con discapacidad visual: combinado con una camara, el modelo puede describir el entorno y alertar de la presencia de objetos relevantes.
- Moderacion de contenido visual: deteccion de objetos prohibidos o peligrosos en imagenes subidas por usuarios, con generacion de alertas textuales.
- Robotica y navegacion: el modelo puede procesar frames de camara para identificar obstaculos o puntos de interes, proporcionando informacion textual a un sistema de control.
- Documentacion de inventario: en almacenes, el modelo puede contar y clasificar objetos a partir de fotografias, generando listas textuales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: los archivos GGUF varian entre 3,1 GB (Q2_K) y 9,4 GB (f16). Se recomienda al menos 4 GB de VRAM para las cuantizaciones mas bajas y 8-10 GB para Q8_0 o f16.
- GPU recomendadas: tarjetas consumer como NVIDIA RTX 3060 (12 GB), RTX 4060 (8 GB) o superiores pueden ejecutar las cuantizaciones Q4/Q5 sin problemas. Para f16 se recomienda una GPU con 12 GB o mas.
- Es posible ejecutar el modelo en CPU con llama.cpp, aunque la velocidad sera menor.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, o cualquier motor compatible con GGUF. No se menciona soporte para vLLM o TGI en la informacion proporcionada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de informacion suficiente para establecer una comparativa rigurosa con otros modelos de deteccion de objetos multimodales (como OWLv2, Grounding DINO o Florence-2). Los parametros, contexto y rendimiento de estos modelos no se han contrastado con los de LibreGemma4e2b en la documentacion consultada.

## Limitaciones y advertencias

- El modelo solo esta entrenado para ingles; no se garantiza un rendimiento adecuado en otros idiomas.
- No se ha publicado informacion sobre sesgos, riesgos de alucinacion o limitaciones especificas del modelo original.
- La cuantizacion puede degradar ligeramente la precision en tareas de deteccion, especialmente en niveles bajos como Q2_K o Q3.
- El componente multimodal requiere los archivos mmproj adicionales para funcionar correctamente; sin ellos, el modelo no procesara imagenes.
- Aunque la licencia Apache 2.0 permite uso comercial, es recomendable revisar los terminos del modelo original (LibreYOLO/LibreGemma4e2b) por si hubiera restricciones adicionales.
- No se han publicado resultados de benchmarks, por lo que el rendimiento real en tareas especificas es desconocido.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/LibreGemma4e2b-GGUF
- Modelo original: https://huggingface.co/LibreYOLO/LibreGemma4e2b
- Pagina de ayuda de mradermacher para peticiones de modelos: https://huggingface.co/mradermacher/model_requests
