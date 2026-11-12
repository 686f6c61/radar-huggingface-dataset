# ApocalypseParty/G4-31B-c50xOPT-late60

## Resumen

G4-31B-c50xOPT-late60 es un modelo multimodal de tipo image-text-to-text obtenido mediante la fusión de dos modelos preentrenados de la familia Gemma 4 (etiqueta `gemma4` en Hugging Face). Lo publica el usuario ApocalypseParty, un perfil que distribuye fusiones experimentales de modelos abiertos, y se ha generado con la herramienta mergekit aplicando el método de mezcla lineal. No se trata de un modelo entrenado desde cero, sino de una combinación de pesos de dos checkpoints intermedios del mismo autor.

El modelo tiene 31.273.088.876 parámetros (aproximadamente 31,3 mil millones) en precisión completa, con un repositorio de 62,6 GB en formato safetensors y compatible con la librería transformers. Su pipeline declarado es image-text-to-text, lo que indica que procesa imágenes y texto de entrada para generar texto, aunque la model card no detalla la arquitectura interna ni el tokenizador multimodal utilizado.

La relevancia de esta ficha es limitada y debe interpretarse con cautela: el modelo no tiene descargas ni interacciones en el momento de la consulta, la licencia no está declarada y no se han publicado resultados de benchmarks. Es un artefacto de investigación sobre técnicas de model merging, no un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text), familia Gemma 4; detalles internos no disponibles |
| Parametros totales | 31.273.088.876 |
| Parametros activos | No aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos publicados en bfloat16; el repositorio ocupa 62,6 GB) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (merge en float32, salida en bfloat16) |

## Arquitectura y entrenamiento

El modelo es el resultado de una fusión lineal (Linear merge, según el paper arXiv:2203.05482) entre dos checkpoints: `ApocalypseParty/G4-mmv2-31B-Style-c50` y `ApocalypseParty/G4-31B-M_OPT31`. La configuración YAML del autor aplica pesos variables por capa: al primer modelo le asigna un peso que decae de 1.0 a 0.4, y al segundo un peso que crece de 0.0 a 0.6, con normalización activada. El resultado se calcula en float32 y se serializa en bfloat16. Este esquema de pesos por tramos sugiere una mezcla que prioriza el primer checkpoint en las capas iniciales y el segundo en las finales, aunque el autor no documenta la motivación.

No hay información sobre el entrenamiento original de los modelos base: no se especifica el número de tokens, la composición del dataset, ni si hubo etapas de RLHF, DPO o ajuste de instrucciones. Tampoco se detalla la arquitectura interna (número de capas, dimensión oculta, mecanismo de atención, codificador visual). La etiqueta `gemma4` y el pipeline `image-text-to-text` son los únicos indicios sobre la familia y la modalidad.

## Capacidades

- Generación de texto conversacional, según la etiqueta `conversational` del repositorio.
- Procesamiento de entradas imagen-texto y generación de texto (pipeline `image-text-to-text`).
- Compatibilidad con la librería transformers y con endpoints compatibles (`endpoints_compatible`).
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documentan capacidades multilingües específicas.
- No se documentan modos especiales (thinking mode, audio, etc.).

## Casos de uso

- Experimentación con técnicas de model merging: el modelo sirve como caso de estudio para evaluar cómo afecta una fusión lineal con pesos por tramos al comportamiento de dos checkpoints de la misma familia. Adecuado para investigadores que quieran reproducir la configuración YAML y comparar resultados.
- Prototipado de pipelines multimodales en transformers: al declarar `image-text-to-text`, puede cargarse con `AutoProcessor` y `AutoModelForVision2Seq` (o la clase equivalente de Gemma 4) para probar flujos de descripción de imágenes en entornos de laboratorio.
- Evaluación comparativa de fusiones: útil como baseline secundario frente a los modelos base `G4-mmv2-31B-Style-c50` y `G4-31B-M_OPT31` para medir si la mezcla mejora o degrada tareas concretas.
- Investigación sobre degradación de pesos: permite estudiar si la normalización y el decaimiento de pesos introducen artefactos en la generación, comparando salidas con los checkpoints originales.
- Docencia y divulgación sobre mergekit: ejemplo práctico de configuración lineal con pesos variables por capa para explicar el funcionamiento de la herramienta.
- Pruebas de integración con endpoints compatibles: al estar etiquetado como `endpoints_compatible`, puede desplegarse en infraestructura de inferencia que acepte el formato de transformers para validar compatibilidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 62,6 GB solo para los pesos, más overhead de activaciones y caché KV; en la práctica se necesitan del orden de 70-80 GB para contexto corto.
- VRAM estimada en cuantización de 8 bits: alrededor de 32 GB, aunque no se han publicado versiones GGUF ni cuantizaciones oficiales.
- VRAM estimada en cuantización de 4 bits: alrededor de 16-18 GB, sujeta a que se genere una cuantización compatible, lo cual no está documentado.
- GPU recomendadas: A100 80 GB, H100 80 GB o configuraciones multi-GPU para precisión completa; una RTX 4090 (24 GB) no es suficiente en bfloat16 y requeriría cuantización agresiva no publicada.
- Despliegue: transformers es la vía documentada; no se confirma soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| G4-31B-c50xOPT-late60 | 31,3 B | No disponible | Imagen-texto | No disponible | Hugging Face, 0 descargas |
| ApocalypseParty/G4-mmv2-31B-Style-c50 | No disponible | No disponible | Imagen-texto (presumible) | No disponible | Hugging Face |
| ApocalypseParty/G4-31B-M_OPT31 | No disponible | No disponible | No disponible | No disponible | Hugging Face |
| Gemma 4 (modelo original de Google) | No disponible en la informacion | No disponible | Multimodal | No disponible en la informacion | No disponible en la informacion |

La comparación directa con alternativas consolidadas no es posible con los datos disponibles: los dos modelos base son del mismo autor y no publican especificaciones detalladas, y no se dispone de información verificada sobre el modelo Gemma 4 original en esta consulta.

## Limitaciones y advertencias

- Licencia no declarada: no se puede asumir uso comercial permitido; es un riesgo legal relevante para producción.
- Sin benchmarks ni evaluaciones publicadas: no hay evidencia de calidad, y las fusiones lineales pueden degradar capacidades respecto a los modelos originales.
- Riesgo de alucinación no cuantificado: al no haber evaluaciones, no se puede estimar la fiabilidad factual.
- Idiomas no documentados: no se puede garantizar un rendimiento adecuado en castellano ni en otros idiomas.
- Longitud de contexto desconocida: no se puede planificar su uso en tareas que requieran ventanas largas.
- Repositorio sin descargas ni interacciones: no hay validación por parte de la comunidad.
- Modelo derivado de fusiones sucesivas del mismo autor: la trazabilidad de los datos de entrenamiento originales es opaca.
- El tamaño de 62,6 GB en bfloat16 limita su despliegue a hardware de gama alta o a cuantizaciones no publicadas.
- No se confirma soporte de tool calling ni de agentes, por lo que no es apto para pipelines de automatización sin validación previa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ApocalypseParty/G4-31B-c50xOPT-late60
- Modelo base 1: https://huggingface.co/ApocalypseParty/G4-mmv2-31B-Style-c50
- Modelo base 2: https://huggingface.co/ApocalypseParty/G4-31B-M_OPT31
- Repositorio de mergekit: https://github.com/cg123/mergekit
- Paper del método Linear merge: https://arxiv.org/abs/2203.05482
