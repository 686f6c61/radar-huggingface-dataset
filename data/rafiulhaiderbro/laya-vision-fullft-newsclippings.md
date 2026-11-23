# RafiulHaiderbro/laya-vision-fullft-newsclippings

## Resumen

LAYA-Vision — NewsCLIPpings fine-tune es un ajuste fino especializado del modelo multimodal thaitea/laya-vision, publicado por el usuario RafiulHaiderbro en Hugging Face. El modelo parte de un checkpoint base de aproximadamente 201 millones de parametros y ha sido entrenado especificamente para la tarea de deteccion de imagenes fuera de contexto en noticias, usando el conjunto de datos NewsCLIPpings. Se trata de un modelo de vision-lenguaje orientado a clasificacion binaria: determinar si una imagen y un texto periodistico son una pareja veridica o si la imagen ha sido reutilizada de forma enganosa.

El modelo es relevante por su caracter de experimento abierto y reproducible: la model card documenta de forma transparente el proceso de entrenamiento, las decisiones de diseno (incluida una enmienda de diseno fechada el 22 de noviembre de 2026), el particionado de datos y los resultados de validacion. El ajuste fino congela la torre de vision y entrena solo el codificador de lenguaje y la cabeza de clasificacion, lo que supone 114,7 millones de parametros entrenables de los 201 millones totales. La licencia Apache 2.0 facilita su reutilizacion, aunque el rendimiento reportado es modesto y el propio autor reconoce que no se alcanzo el objetivo H2.

Con cero descargas y cero likes en el momento de la consulta, se trata de un artefacto de investigacion mas que de un modelo listo para produccion. Su interes principal reside en la documentacion metodologica y en servir como punto de partida para experimentos de deteccion de desinformacion multimodal.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-lenguaje (torre de vision congelada + codificador de lenguaje + cabeza de clasificacion); detalles completos no disponibles |
| Parametros totales | 201.161.350 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors) |
| Idiomas soportados | no disponibles |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se construye sobre thaitea/laya-vision (revision f2fe3c12cb6d04c59d8a190250bf3fb40fc828dc). La arquitectura combina una torre de vision, que permanece congelada en ambos brazos del experimento, con un codificador de lenguaje y una cabeza de clasificacion que si se entrenan. En el brazo ganador se entrenaron 114,7 millones de parametros de los 201 millones totales. La model card indica que el bucle de entrenamiento de la libreria no permite descongelar la torre de vision, lo que constituye una restriccion tecnica documentada explicitamente.

El entrenamiento se realizo sobre el split oficial de entrenamiento de NewsCLIPpings, con 2.001 elementos de entrenamiento y un subconjunto de imagenes acotado como unica excepcion sancionada al regimen de solo streaming. La seleccion del checkpoint se hizo sobre un split de ajuste propio de 250 elementos, unicamente en la forma de pregunta nativa. El split de test nunca se toco. La validacion se hizo en streaming sobre el tar oficial de VisualNews, con verificacion de integridad en memoria y sin guardar datos en disco. El brazo ganador fue la configuracion full / soft_ce con 245 pasos, que alcanzo una precision de ajuste (forma nativa) de 0,5080. El checkpoint incluye temperaturas ajustadas en un split de calibracion reservado, y la model card senala que se decidio mediante validacion retenida si la demo las sirve.

## Capacidades

- Clasificacion multimodal imagen-texto: el modelo evalua pares de imagen y texto periodistico para determinar si constituyen una pareja veridica o una imagen fuera de contexto.
- Deteccion de desinformacion visual: orientado especificamente a la tarea de NewsCLIPpings, que consiste en identificar imagenes reutilizadas con textos enganosos.
- Formulacion como pregunta nativa: el modelo fue seleccionado y evaluado en la forma de pregunta nativa del conjunto de datos.
- Ajuste de calibracion: incorpora temperaturas ajustadas en un split de calibracion reservado para modular las probabilidades de salida.
- No se documentan capacidades de generacion de texto libre, codigo, matematicas, tool calling, agentes, audio ni modo thinking.
- Capacidades multilingues: no disponibles; la model card no especifica idiomas de entrenamiento ni de evaluacion.

## Casos de uso

- Verificacion de imagenes en redacciones periodisticas: el modelo puede integrarse en un flujo de revision para senalar pares imagen-texto sospechosos antes de publicacion, aprovechando su entrenamiento especifico en el corpus NewsCLIPpings.
- Moderacion de contenido en plataformas: como clasificador auxiliar para detectar imagenes reutilizadas con pies de foto enganosos en publicaciones de usuarios, con la salvedad de su precision limitada (en torno al 51 % en validacion).
- Investigacion en desinformacion multimodal: sirve como linea base reproducible para experimentos academicos sobre deteccion de imagenes fuera de contexto, dado que la model card documenta el particionado y las decisiones de diseno.
- Prototipado de sistemas de fact-checking: util como componente inicial en pipelines de verificacion automatizada que combinen senales de imagen y texto, antes de sustituirlo por modelos de mayor escala.
- Docencia y experimentacion con ajuste fino: el modelo ilustra el proceso completo de fine-tuning con torre de vision congelada, seleccion de checkpoint y validacion en streaming, util para cursos de aprendizaje automatico.
- Evaluacion de sesgos y calibracion: las temperaturas ajustadas y la documentacion del split de calibracion permiten estudiar el comportamiento probabilistico del clasificador en condiciones controladas.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Precision de ajuste (forma nativa, split de 250 elementos) | 0,5080 |
| Precision de validacion (PASS 2, n = 7024 filas puntuadas) | 0,5104 |
| Precision del checkpoint base en el mismo stream (PASS 1) | 0,5141 |
| Objetivo H2 (reorientado a este brazo) | NO ALCANZADO |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. Los datos anteriores corresponden exclusivamente a las metricas internas de la tarea NewsCLIPpings reportadas por el autor.

## Requisitos de hardware

- VRAM estimada para inferencia: con 201 millones de parametros, en precision completa (fp32) se requieren aproximadamente 0,8 GB solo para pesos; en fp16 o bf16, alrededor de 0,4 GB. La memoria adicional depende del tamano de las imagenes de entrada y de la torre de vision, no especificado.
- GPU recomendadas: cualquier GPU con al menos 4-8 GB de VRAM deberia ser suficiente para inferencia en fp16, incluyendo RTX 3060, RTX 4060, RTX 4090, A100 o H100. No se dispone de mediciones oficiales.
- Cabe en GPU de consumo: si, previsiblemente en la mayoria de GPU consumer modernas, aunque no hay datos oficiales de consumo de memoria en inferencia.
- Opciones de despliegue: al ser un modelo de clasificacion multimodal en safetensors, se puede cargar con transformers; no se documenta soporte para vLLM, llama.cpp, Ollama o TGI, que estan orientados a modelos generativos.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LAYA-Vision — NewsCLIPpings fine-tune | 201 M | no disponible | Clasificacion imagen-texto (NewsCLIPpings) | Apache 2.0 | Hugging Face |
| thaitea/laya-vision (base) | no disponible | no disponible | Vision-lenguaje general | no disponible | Hugging Face |
| CLIP (variantes) | 150 M - 400 M aprox. | 77 tokens (texto) | Alineacion imagen-texto | MIT / Apache 2.0 segun variante | Amplia |
| VisualBERT / UNITER | 100 M - 300 M aprox. | 512 tokens aprox. | Vision-lenguaje | MIT / Apache 2.0 segun variante | Hugging Face |

La comparativa con alternativas es aproximada: no se dispone de datos de rendimiento comparables en la misma tarea para los modelos citados, y la model card no ofrece comparaciones con terceros. La principal diferencia frente al checkpoint base es el ajuste especifico en NewsCLIPpings, aunque la precision reportada del ajuste (0,5104) es ligeramente inferior a la del base en el mismo stream (0,5141).

## Limitaciones y advertencias

- Rendimiento limitado: la precision de validacion (0,5104) es practicamente equivalente al azar en una tarea binaria, y el propio autor declara que el objetivo H2 no se alcanzo.
- El ajuste fino no supera al checkpoint base en el mismo stream de validacion (0,5141 frente a 0,5104), lo que cuestiona la ganancia del entrenamiento.
- Torre de vision congelada: el modelo no adapta su representacion visual, solo el codificador de lenguaje y la cabeza, lo que limita la especializacion multimodal.
- Fuga de etiqueta potencial: la model card advierte que los metadatos de origen (text_source, image_source) nunca fueron entrada del modelo porque filtran la etiqueta; cualquier uso que los introduzca invalidaria los resultados.
- Calibracion dependiente del split: las temperaturas se ajustaron en un split de calibracion reservado y no esta claro si la demo las aplica, lo que puede afectar a la interpretacion de probabilidades.
- Idiomas no documentados: se desconoce si el modelo funciona correctamente fuera del ingles u otros idiomas presentes en NewsCLIPpings y VisualNews.
- Riesgo de alucinacion: al ser un clasificador, el riesgo se traduce en falsos positivos y falsos negativos; no genera texto, pero sus etiquetas pueden ser erroneas con alta frecuencia.
- Uso comercial: la licencia Apache 2.0 lo permite, pero el rendimiento reportado desaconseja su uso en produccion sin validacion adicional.
- Sin descargas ni validacion externa: cero descargas y cero likes en el momento de la consulta; no hay evidencia de uso independiente ni replicacion de resultados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/RafiulHaiderbro/laya-vision-fullft-newsclippings
- Modelo base: https://huggingface.co/thaitea/laya-vision
- Revision del modelo base: f2fe3c12cb6d04c59d8a190250bf3fb40fc828dc
- No se han encontrado en la informacion proporcionada enlaces a papers, blogs, repositorios o demos adicionales.
