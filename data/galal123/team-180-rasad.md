# Galal123/team-180-rasad

## Resumen

Rasad (رصد) es un clasificador de pistas de sensores (sensor tracks) construido mediante fine-tuning del modelo Laya, desarrollado por el autor Galal123 en el contexto del hackathon qai-hf-hackathon-2026. El modelo recibe la descripcion en ingles de una pista de sensor y devuelve una de cuatro clases —dron, pajaro, aeronave o desconocido— junto con una probabilidad calibrada. Su proposito es sustituir heuristicas basadas en reglas en la clasificacion de trazas de espacio aereo, un problema tipico en sistemas de vigilancia y deteccion de drones.

El modelo parte de convaiinnovations/laya como base y se afina sobre el dataset sintetico Galal123/rasd-tracks-synthetic. Cuenta con 421.293.830 parametros en formato safetensors y un repositorio de 0,8 GB, lo que lo situa en la categoria de modelos de tamano medio aptos para despliegue en infraestructura moderada. La tarea declarada en el pipeline es text-classification y la licencia es Apache 2.0.

Su relevancia actual radica en el salto de rendimiento documentado frente a la alternativa basada en reglas: sobre un conjunto de test retenido de 23.358 pistas simuladas, el modelo alcanza un 95,6 % de exactitud y un macro F1 de 0,90, frente al 38,6 % y 0,48 del clasificador de reglas previo. Ademas, la calibracion es notablemente buena (ECE de 0,005), lo que permite usar las probabilidades de salida como senal de confianza en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (fine-tuning de convaiinnovations/laya; libreria `laya`) |
| Parametros totales | 421.293.830 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (la model card indica entrada en ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base Laya ni del fine-tuning resultante; unicamente se indica que se trata de un afinamiento de convaiinnovations/laya bajo la libreria `laya` y con pipeline de clasificacion de texto. No se especifican el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se emplearon tecnicas de RLHF o DPO.

El entrenamiento se realizo exclusivamente sobre datos sinteticos del dataset Galal123/rasd-tracks-synthetic, que contiene descripciones en ingles de pistas de sensor etiquetadas con una de las cuatro clases. La model card menciona la publicacion de un fichero `metrics.json` y una grafica `reliability.png` con detalles adicionales, pero no se aportan en la informacion proporcionada. El resultado declarado es un clasificador con calibracion muy alta (ECE de 0,005), lo que sugiere un ajuste cuidadoso de las probabilidades de salida.

## Capacidades

- Clasificacion de pistas de sensor en cuatro categorias: dron, pajaro, aeronave y desconocido.
- Salida con probabilidad calibrada por clase, apta para umbrales de decision en produccion.
- Procesamiento de descripciones de pistas en lenguaje natural en ingles.
- Integracion en la aplicacion Rasad (Space de Hugging Face) como componente de clasificacion en vivo.
- No se documentan capacidades de generacion de texto abierta, codigo, matematicas, vision, audio, tool calling ni razonamiento multi-paso; el modelo esta especializado en clasificacion.

## Casos de uso

- Clasificacion de trazas de radar en vigilancia de espacio aereo: el modelo recibe la descripcion textual de una pista y devuelve la clase con probabilidad, lo que permite filtrar falsos positivos de drones en sistemas de monitorizacion.
- Deteccion de drones en entornos urbanos: al distinguir entre dron, pajaro y aeronave, ayuda a reducir alertas erroneas en sistemas de seguridad perimetral.
- Triaje de alertas en operaciones de defensa o seguridad: la calibracion (ECE de 0,005) permite fijar umbrales de confianza y derivar solo los casos inciertos a revision humana.
- Monitorizacion de fauna en entornos aeroportuarios: la clase "pajaro" permite separar aves de aeronaves y contribuir a la gestion del riesgo de colision.
- Analisis post-vuelo de registros de sensores: el modelo puede procesar lotes de pistas historicas para etiquetarlas y generar estadisticas de trafico.
- Integracion en pipelines de datos de vigilancia: al ser un clasificador de texto con pesos safetensors, puede desplegarse como servicio de inferencia y conectarse a sistemas que conviertan trazas de sensor en descripciones textuales.
- Prototipado rapido en hackathons o pruebas de concepto: la licencia Apache 2.0 y el tamano moderado (421 M de parametros) facilitan su adopcion en entornos de investigacion.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre un conjunto de test retenido de 23.358 pistas simuladas:

| Clasificador | Exactitud | Macro F1 | ECE |
|---|---|---|---|
| Rasad (este modelo) | 95,6 % | 0,90 | 0,005 |
| Laya base sin fine-tuning | 3,1 % | 0,04 | 0,48 |
| Clasificador de reglas previo | 38,6 % | 0,48 | 0,033 |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con 421 M de parametros, en fp16 requeriria aproximadamente 0,85 GB de pesos, y en cuantizacion de 8 bits alrededor de 0,45 GB, aunque estos calculos no los aporta el autor.
- GPU recomendadas: no disponible; por tamano, cabria en GPUs de consumo como RTX 3060, RTX 4070 o RTX 4090, pero no se confirma en la documentacion.
- Cabe en GPU de consumo: probable por el numero de parametros, aunque no se documenta oficialmente.
- Opciones de despliegue: no disponible; la libreria declarada es `laya`, y no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Rasad (este modelo) | 421.293.830 | no disponible | 95,6 % exactitud, macro F1 0,90 (test sintetico) | Apache 2.0 | Hugging Face |
| Laya base (convaiinnovations/laya) | no disponible | no disponible | 3,1 % exactitud sin fine-tuning en esta tarea | no disponible | Hugging Face |
| Clasificador de reglas previo | no aplica | no aplica | 38,6 % exactitud, macro F1 0,48 | no disponible | no disponible |

No se dispone de informacion sobre otros modelos comparables de clasificacion de pistas de sensor en la documentacion proporcionada.

## Limitaciones y advertencias

- El modelo se ha entrenado exclusivamente con datos sinteticos; los resultados declarados son en simulacion y pueden no transferirse a datos reales de sensores.
- Solo clasifica; la model card indica explicitamente que las decisiones finales corresponden a personas.
- No se documentan sesgos conocidos, pero al entrenarse con datos sinteticos puede heredar sesgos de la generacion de dichos datos.
- Riesgo de alucinacion: al ser un clasificador, el riesgo se manifiesta como clasificaciones erroneas con alta confianza; la calibracion reportada reduce este riesgo, pero no lo elimina.
- Limitaciones de idioma: la entrada se describe en ingles; no se documenta soporte multilingue.
- Limitaciones de contexto: no se especifica la longitud maxima de descripcion de pista que el modelo puede procesar.
- Licencia Apache 2.0: permite uso comercial, pero se recomienda verificar las condiciones del modelo base Laya, cuya licencia no se detalla en la informacion disponible.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica escasa validacion externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Galal123/team-180-rasad
- Aplicacion Rasad (Space): https://huggingface.co/spaces/Galal123/team-180-rasad-app
- Modelo base Laya: https://huggingface.co/convaiinnovations/laya
- Dataset sintetico: https://huggingface.co/datasets/Galal123/rasd-tracks-synthetic
