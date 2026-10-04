# Mitroshenkov87/voxprint-mirror-sage-fredt5-distilled-95m

## Resumen

El modelo `Mitroshenkov87/voxprint-mirror-sage-fredt5-distilled-95m` es un espejo (mirror) sin modificaciones del modelo `ai-forever/sage-fredt5-distilled-95m`, publicado por el usuario Mitroshenkov87 como fuente de descarga alternativa para la aplicacion de clonacion de voz y audiolibros Voxprint. No se trata de un modelo nuevo ni de un fine-tuning: los archivos son byte a byte identicos a los del commit `ed51b4a46603931380951a3d8456685c9215864f` del repositorio original, y lo unico que cambia es la model card (README).

El modelo subyacente es un corrector ortografico, de puntuacion y de uso de mayusculas para ruso. Su tarea es normalizar texto con errores tipograficos, faltas de ortografia y puntuacion deficiente segun la norma del idioma ruso. Es una version destilada del modelo original basado en la arquitectura FRED-T5-1.7B, con 95.634.816 parametros totales (aproximadamente 95,6 millones) y un peso de repositorio de 0,4 GB.

Su relevancia practica es doble: por un lado, ofrece una alternativa ligera (95,6 M de parametros frente a los 1.700 M del modelo original) para tareas de post-procesado de texto ruso con un coste computacional bajo; por otro, el espejo garantiza disponibilidad de descarga para la aplicacion Voxprint. La licencia es MIT, lo que permite uso comercial sin restricciones adicionales mas alla de la atribucion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FRED-T5 (transformer encoder-decoder basado en T5); version destilada |
| Parametros totales | 95.634.816 (aproximadamente 95,6 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio solo contiene safetensors) |
| Idiomas soportados | Ruso (el modelo normaliza texto en ruso; el campo de idiomas del repositorio figura como no disponible) |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Tamano del repositorio | 0,4 GB |
| Modelo base | ai-forever/sage-fredt5-distilled-95m |
| Commit replicado | ed51b4a46603931380951a3d8456685c9215864f |
| Tipo de repositorio | espejo sin modificaciones (mirror) |

## Arquitectura y entrenamiento

La arquitectura es FRED-T5, una familia de modelos encoder-decoder de tipo transformer derivada de T5 y adaptada por el equipo de ai-forever para el idioma ruso. El modelo aqui descrito es una destilacion: el modelo original tenia 1.700 millones de parametros (FRED-T5-1.7B) y esta version reduce el tamano hasta los 95,6 millones de parametros manteniendo la tarea de correccion. El objetivo de la destilacion es permitir inferencia en entornos con recursos limitados, a costa de una perdida de calidad medible (los F1 son entre 5 y 10 puntos inferiores a los del servicio `sage-ai-service` de la misma familia).

El corpus de entrenamiento se construyo con errores "artificiales": se partio de la Wikipedia en ruso y de transcripciones de videos en ruso, y posteriormente se introdujeron erratas y errores ortograficos de forma automatica mediante la libreria SAGE (ai-forever/sage). No se especifica en la informacion disponible el numero exacto de tokens de entrenamiento, la composicion detallada del dataset ni si se aplicaron fases de RLHF o DPO. Tampoco se documentan innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Correccion de erratas y faltas de ortografia en ruso, llevando las palabras a la norma del idioma.
- Normalizacion de puntuacion: insercion y correccion de comas, guiones, signos de interrogacion y puntuacion de cierre.
- Correccion de uso de mayusculas y minusculas (nombres propios, inicios de frase, siglas).
- Procesamiento de texto procedente de dominios heterogeneos: redes sociales, prensa, subtitulos, documentos normativos, literatura, historiales medicos y mensajes de commit de GitHub.
- Reescritura de frases largas con puntuacion deficiente, como se observa en los ejemplos de la model card.
- No se documenta soporte de tool calling ni de function calling.
- No se documenta soporte de agentes ni de razonamiento multi-paso.
- No se documenta capacidad de generacion de texto libre, codigo, matematicas ni vision; es un modelo especializado de post-edicion.

## Casos de uso

- Normalizacion de transcripciones automaticas: en una aplicacion de audiolibros o de voz a texto, el modelo limpia las erratas y la puntuacion que produce el sistema de reconocimiento de voz antes de publicar el texto final, como hace Voxprint en su flujo de trabajo.
- Preprocesado de corpus rusos para entrenamiento: limpiar texto extraido de redes sociales, foros o web abierta antes de usarlo como dataset, reduciendo ruido ortografico sin intervencion manual.
- Correccion de mensajes de commit y documentacion tecnica: el modelo esta evaluado especificamente en GitHubTypoCorpusRu, por lo que es aplicable a la revision de textos tecnicos en ruso antes de integrarlos en un repositorio.
- Limpieza de historiales clinicos: dado su rendimiento en MedSpellChecker, puede emplearse para normalizar anamnesis y notas medicas en ruso, siempre con supervision humana por el riesgo asociado al dominio sanitario.
- Moderacion y mejora de contenido generado por usuarios: normalizar comentarios y resenas antes de publicarlos o de analizarlos con otras herramientas de NLP.
- Post-procesado de salidas de otros modelos: cadena en la que un LLM genera texto en ruso y este corrector de 95,6 M de parametros actua como etapa final de limpieza ortografica y de puntuacion.
- Procesamiento por lotes en entornos con pocos recursos: al ocupar 0,4 GB en disco y ser ejecutable en CPU, permite normalizar grandes volumenes de texto sin GPU dedicada.
- Integracion en pipelines de audiolibros: dado que el espejo existe precisamente como fuente de descarga de respaldo, encaja en flujos donde la disponibilidad del artefacto es critica.

## Benchmarks y rendimiento

Los datos siguientes proceden de la model card original del modelo `ai-forever/sage-fredt5-distilled-95m`. Se comparan con el servicio `sage-ai-service` de la misma familia y con GPT-3.5-turbo y GPT-4. Todos los valores son F1.

| Dataset | Modelo | F1 (ortografia) | F1 (puntuacion) | F1 (mayusculas) |
|---|---|---|---|---|
| RUSpellRU | sage-fredt5-distilled-95m | 78,9 | 83,6 | 93,5 |
| RUSpellRU | sage-ai-service | 88,2 | 88,4 | 95,6 |
| RUSpellRU | gpt-3.5-turbo | 42,7 | 73,7 | 79,0 |
| RUSpellRU | gpt-4 | 64,0 | 83,2 | 90,9 |
| MultidomainGold | sage-fredt5-distilled-95m | 73,4 | 65,0 | 77,9 |
| MultidomainGold | sage-ai-service | 79,6 | 68,8 | 80,5 |
| MultidomainGold | gpt-3.5-turbo | 27,1 | 36,2 | 49,1 |
| MultidomainGold | gpt-4 | 37,0 | 56,0 | 60,0 |
| MedSpellChecker | sage-fredt5-distilled-95m | 64,9 | 70,0 | 68,7 |
| MedSpellChecker | sage-ai-service | 72,4 | 72,0 | 76,6 |
| MedSpellChecker | gpt-3.5-turbo | 22,3 | 59,8 | 32,3 |
| MedSpellChecker | gpt-4 | 49,6 | 71,9 | 67,1 |
| GitHubTypoCorpusRu | sage-fredt5-distilled-95m | 52,7 | 42,1 | 36,3 |
| GitHubTypoCorpusRu | sage-ai-service | 62,7 | 41,4 | 38,1 |
| GitHubTypoCorpusRu | gpt-3.5-turbo | 29,4 | 28,7 | 25,3 |
| GitHubTypoCorpusRu | gpt-4 | 35,7 | 38,2 | 30,2 |

La model card tambien publica las metricas de precision y recall completas por dataset, ademas de estos valores de F1. Los resultados muestran que, con 95,6 M de parametros, el modelo destilado supera a GPT-3.5-turbo y, en tareas de ortografia, tambien a GPT-4 en varios de los corpus evaluados, aunque queda por debajo del servicio `sage-ai-service` en todos los conjuntos.

## Requisitos de hardware

- VRAM estimada en fp32: aproximadamente 0,4 GB solo para pesos, mas el consumo del runtime de PyTorch (del orden de 1-2 GB en total).
- VRAM estimada en fp16 o bf16: aproximadamente 0,2 GB de pesos, tambien con overhead del runtime.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente; el modelo no requiere A100 ni H100. Una NVIDIA RTX 3060, RTX 4090 o incluso una GPU integrada moderna pueden ejecutarlo.
- Compatibilidad con GPU de consumo: si, con margen amplio. Es probable que tambien funcione en CPU con latencias aceptables para procesamiento por lotes, dado el reducido numero de parametros.
- Opciones de despliegue: al ser un modelo T5/FRED-T5 en safetensors, es compatible con la libreria `transformers` de Hugging Face y con servidores de inferencia basados en PyTorch como TGI. La informacion disponible no documenta soporte de llama.cpp, Ollama ni vLLM para este modelo concreto.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Tarea | Licencia | Disponibilidad | F1 ortografia (RUSpellRU) |
|---|---|---|---|---|---|
| sage-fredt5-distilled-95m (este espejo) | 95,6 M | Correccion ortografica, puntuacion y mayusculas en ruso | MIT | Peso abierto en Hugging Face | 78,9 |
| ai-forever/sage-fredt5-distilled-95m | 95,6 M | Identica | MIT | Peso abierto en Hugging Face | 78,9 |
| sage-ai-service | no disponible | Identica | no disponible | Servicio (API) | 88,2 |
| gpt-3.5-turbo | no disponible | Generacion general, se usa como referencia de correccion | Propietaria | API de pago | 42,7 |
| gpt-4 | no disponible | Generacion general, se usa como referencia de correccion | Propietaria | API de pago | 64,0 |

No se dispone de informacion sobre otras alternativas especificas de correccion ortografica en ruso con pesos abiertos en el material proporcionado.

## Limitaciones y advertencias

- El modelo es un espejo sin modificaciones. No ha sido validado de forma independiente por el autor del espejo ni se han publicado pruebas adicionales sobre esta copia concreta.
- Idioma limitado al ruso. No hay evidencia de soporte para castellano ni para otros idiomas, y el campo de idiomas del repositorio figura como no disponible.
- Rendimiento desigual por dominio: el F1 de ortografia cae hasta 52,7 en GitHubTypoCorpusRu y el de mayusculas hasta 36,3, muy por debajo de los valores obtenidos en RUSpellRU. En texto tecnico y en mensajes de commit la calidad es notablemente inferior.
- Inferior al servicio `sage-ai-service` en todos los conjuntos evaluados, con diferencias de entre 5 y 10 puntos de F1.
- Riesgo de sobrerreescritura: al ser un modelo generativo seq2seq, puede alterar fragmentos que ya eran correctos, especialmente en textos muy tecnicos, nombres propios poco frecuentes o terminologia especializada.
- Riesgo de alucinacion: como cualquier modelo encoder-decoder generativo, puede introducir palabras o reescrituras no presentes en el texto original. No hay datos publicados sobre la tasa de este fenomeno.
- No se documentan sesgos especificos, pero el corpus de entrenamiento (Wikipedia en ruso y transcripciones de video) puede introducir sesgos de dominio y de registro.
- En dominios sensibles como el medico, el uso debe ir acompanado de supervision humana: el F1 de ortografia en MedSpellChecker es de 64,9 y el de mayusculas de 68,7.
- La licencia MIT permite uso comercial y modificacion, pero exige mantener el aviso de copyright y la atribucion a los autores originales. El autor del espejo declara no estar afiliado a los autores del modelo original.
- No se dispone de informacion sobre la longitud de contexto soportada, lo que obliga a verificar experimentalmente el comportamiento con entradas largas antes de usarlo en produccion.
- Antes de desplegarlo, conviene comprobar la integridad de los archivos frente al manifiesto SHA-256 publicado en `infra/model_mirrors.json` del repositorio de Voxprint.

## Enlaces

- Repositorio del espejo en Hugging Face: https://huggingface.co/Mitroshenkov87/voxprint-mirror-sage-fredt5-distilled-95m
- Repositorio original del modelo: https://huggingface.co/ai-forever/sage-fredt5-distilled-95m
- Modelo base de la arquitectura: https://huggingface.co/ai-forever/FRED-T5-1.7B
- Libreria SAGE: https://github.com/ai-forever/sage
- Repositorio de la aplicacion Voxprint: https://github.com/Mitroshenkov87/voxprint
- Anuncio de la libreria SAGE en DataFest 2023: https://youtu.be/yFfkV0Qjuu0
- Paper sobre metodos de generacion sintetica de errores (Dialogue 2023): https://www.dialog-21.ru/media/5914/martynovnplusetal056.pdf
- Paper de SAGE en EACL 2024: https://aclanthology.org/2024.findings-eacl.10/
- La busqueda web realizada no devolvio resultados relacionados con este modelo; los enlaces encontrados correspondian a un monumento historico sin relacion con el contenido de la ficha.
