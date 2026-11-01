# sheng-wang/pathcowork-grounder-27B-GGUF

## Resumen

Pathcowork Grounder 27B (GGUF) es un modelo multimodal de visión y lenguaje especializado en patología digital, desarrollado por sheng-wang y publicado en Hugging Face. Se trata de una cuantización en formato GGUF de un modelo basado en Qwen3.6-27B (Qwen/Qwen3.6-27B), afinado para una tarea muy concreta: el grounding visual de conceptos histopatológicos en secciones teñidas con H&E. Dada una imagen de microscopía y una pregunta en lenguaje natural, el modelo devuelve polígonos o polilíneas en formato JSON con coordenadas enteras sobre una rejilla de 0-1000 píxeles, o la respuesta "There are none." si el concepto no está presente.

Su relevancia radica en que resuelve uno de los cuellos de botella clásicos de la patología computacional: la localización espacial precisa de estructuras histológicas (nidos melanocíticos, carcinoma ductal in situ, necrosis pseudopalisading, focos metastásicos, patrones de Gleason, etc.) a partir de instrucciones en texto libre, sin necesidad de entrenar un detector por clase. El modelo se entrenó con conceptos diana de cinco órganos comunes (piel, cerebro, mama, ganglio linfático y próstata), pero según su autor generaliza también a órganos y conceptos fuera de la distribución de entrenamiento, como vejiga, colon y pulmón.

La versión publicada (2.2) pesa aproximadamente 101,4 GB en el repositorio y consta de 27.320.697.856 parámetros. Al distribuirse en GGUF, está pensada para inferencia local con llama.cpp, Ollama o backends compatibles, aunque su tamaño exige hardware con memoria gráfica o RAM abundante. La licencia es la Penn Academic Software License, de carácter académico, lo que restringe el uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Multimodal image-text-to-text basado en Qwen3.6 (transformer); detalle no disponible |
| Parametros totales | 27.320.697.856 |
| Parametros activos | No aplica (no consta que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GGUF (variantes concretas no disponibles en la informacion proporcionada) |
| Idiomas soportados | No disponibles |
| Licencia | Penn Academic Software License (other) |
| Formato de pesos | GGUF (modelo base en safetensors) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.6-27B, un transformer multimodal de la familia Qwen, y se afina para la tarea de grounding en histopatologia: recibir una imagen de H&E con metadatos de escala (µm/px y anchura del campo) y una instruccion en lenguaje natural, y devolver segmentaciones como listas JSON de poligonos con etiquetas. El pipeline de Hugging Face es image-text-to-text, lo que confirma la naturaleza vision-language del modelo. No se ha publicado informacion sobre el numero de tokens de entrenamiento, la composicion exacta del dataset ni el uso de tecnicas como RLHF o DPO.

La innovacion principal es funcional: el modelo acepta peticiones de una sola clase, de varias clases simultaneas y de clases ausentes (respondiendo "There are none."), funciona a distintas resoluciones (desde 1 µm/px en campos de 1,0 mm hasta 23 µm/px en secciones completas de ~23 mm) y generaliza a organos y conceptos fuera de su distribucion de entrenamiento. Los detalles tecnicos internos (conector vision-language, resolucion del encoder de imagen, estrategia de decodificacion) no estan disponibles en la model card.

## Capacidades

- Grounding visual de conceptos histopatologicos: delimitacion de regiones como poligonos JSON con coordenadas enteras en una rejilla 0-1000 sobre la imagen (x hacia la derecha, y hacia abajo).
- Deteccion de multiples clases en una sola peticion (por ejemplo, nidos melanocíticos junctionales, proliferacion melanocítica lentiginosa, melanofagos y nidos dermales a la vez).
- Manejo de clases ausentes: responde explicitamente "There are none." cuando el concepto no aparece, en lugar de alucinar detecciones.
- Cobertura de cinco organos de entrenamiento (piel, cerebro, mama, ganglio linfatico, prostata) con conceptos como necrosis pseudopalisading, DCIS, focos metastasicos y carcinoma Gleason patrón 3.
- Generalizacion fuera de distribucion a organos como vejiga (frondes papilares), colon (mucosa colonica normal) y pulmon (parenquima alveolar).
- Comprension de metadatos de escala en el prompt (µm/px y anchura del campo), lo que permite trabajar desde campos de alta resolucion hasta secciones completas.
- Salida estructurada en JSON, apta para integracion en pipelines automatizados de analisis de imagenes.
- No hay informacion sobre soporte de tool calling, agentes ni capacidades de audio.

## Casos de uso

- Preanotacion de datasets de patologia: el modelo puede generar poligonos candidatos sobre laminas digitales que un patologo revisa y corrige, reduciendo drásticamente el tiempo de anotacion manual frente a herramientas de dibujo libre.
- Deteccion de focos metastasicos en ganglios linfaticos: en flujos de trabajo de estadificacion, puede senalar automaticamente areas sospechosas en secciones H&E para priorizacion por parte del especialista.
- Cuantificacion de carcinoma en biopsias de prostata: localizacion de areas de Gleason patrón 3 como paso previo a calculos de porcentaje de tejido tumoral en biopsias con aguja.
- Analisis de secciones completas (whole slide): con prompts a baja resolucion (21-23 µm/px), puede delimitar estructuras a nivel de lamina completa, util como primer filtro en pipelines de screening.
- Sistemas de asistencia al patologo con salida estructurada: al devolver JSON con etiquetas y coordenadas, se integra directamente en visores digitales (QuPath, herramientas web) para superponer contornos sobre la imagen.
- Investigacion en generalizacion de modelos medicos: su capacidad documentada de funcionar en organos fuera de distribucion lo hace util como baseline para estudiar transferencia a conceptos histologicos no vistos.
- Control de calidad de digitalizacion: identificacion de tejido relevante (por ejemplo, mucosa colonica normal) para verificar que la lamina digitalizada contiene el material esperado antes del analisis.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card muestra unicamente ejemplos cualitativos de entradas y salidas, sin metricas cuantitativas (IoU, Dice, sensibilidad, especificidad) frente a anotaciones de referencia ni comparativas con otros modelos de patologia.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio pesa 101,4 GB en GGUF, lo que sugiere cuantizaciones de alta fidelidad (en torno a 8 bits o superiores). Para cargarlo completamente en GPU se necesitarian del orden de 100-110 GB de VRAM; con cuantizaciones mas agresivas (si estuvieran disponibles) el requisito bajaria, pero no constan las variantes exactas.
- GPU recomendadas: A100 de 80 GB (con offload a RAM), H100 de 80 GB, o sistemas multi-GPU (2x A100 80 GB) para ejecucion completamente en GPU. Con llama.cpp tambien es viable CPU + GPU hibrida si se dispone de suficiente RAM del sistema (128 GB o mas recomendable).
- Consumer GPU: no cabe integramente en tarjetas de consumo habituales (RTX 4090 con 24 GB, RTX 5090 con 32 GB); solo seria posible con offload masivo a RAM y penalizacion severa de velocidad.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF multimodal. No consta soporte verificado en vLLM o TGI para esta cuantizacion.
- Latencia y throughput: no disponibles. Dado el tamano (27B parametros mas encoder de vision), cabe esperar generacion lenta en configuraciones con offload predominante a CPU o RAM.

## Comparativa con modelos similares

| Modelo | Parametros | Tarea | Formato | Licencia |
|---|---|---|---|---|
| Pathcowork Grounder 27B (este) | 27,3 B | Grounding de conceptos en histopatologia (poligonos JSON) | GGUF | Penn Academic Software License (academica) |
| Qwen3.6-27B (modelo base) | 27 B | Vision-language general | Safetensors | No disponible en la informacion proporcionada |
| Alternativas de patologia comparables | No disponible | No disponible | No disponible | No disponible |

No se conocen alternativas publicas directamente comparables (modelos VLM generales afinados para grounding de poligonos en patologia con salida JSON normalizada) en la informacion proporcionada; los modelos de patologia dominantes (como los basados en ViT para clasificacion de parches) resuelven tareas distintas y no emiten segmentaciones a partir de lenguaje natural.

## Limitaciones y advertencias

- Uso restringido a ambito academico: la Penn Academic Software License limita o prohíbe el uso comercial; cualquier despliegue en producto o servicio con fines comerciales requiere revision juridica de la licencia.
- Riesgo de alucinacion en deteccion: aunque el modelo maneja clases ausentes en los ejemplos, no hay metricas publicadas de falsos positivos; en un dominio clinico, toda salida debe validarla un patologo. No es un dispositivo diagnostico aprobado.
- Generalizacion limitada y verificada solo cualitativamente: los organos fuera de distribucion (vejiga, colon, pulmon) se muestran con ejemplos aislados, sin evaluacion sistematica; el rendimiento en conceptos raros, tinciones distintas de H&E o escaneres diferentes no esta documentado.
- Sensibilidad a la escala: los prompts incluyen µm/px y anchura del campo; prompts sin estos metadatos pueden degradar el resultado, aunque no hay datos al respecto.
- Requisitos de hardware elevados: con ~101 GB de pesos, el despliegue local exige servidores o estaciones de trabajo con mucha memoria, lo que limita la adopcion en entornos pequenos.
- Idiomas soportados no documentados: los ejemplos usan prompts en ingles; no consta soporte de otros idiomas.
- Informacion tecnica incompleta: no se publican detalles de arquitectura interna, longitud de contexto, variantes de cuantizacion ni benchmarks, lo que dificulta la evaluacion rigurosa previa a la adopcion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sheng-wang/pathcowork-grounder-27B-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-27B
- Licencia: https://huggingface.co/sheng-wang/pathcowork-grounder-27B-GGUF/blob/main/LICENSE
- Paper, repositorio de codigo y demo: no disponibles en la informacion proporcionada
