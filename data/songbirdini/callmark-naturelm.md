# songbirdini/callmark-naturelm

## Resumen

CallMark-naturelm es un conjunto de pesos derivados de NatureLM-audio, el modelo de audio para bioacustica desarrollado por EarthSpeciesProject. El autor del repositorio, songbirdini, publica aqui los modelos entrenados como parte de la reproducibilidad del paper CallMark, en el que se anaden adaptadores a NatureLM-audio para tareas de identificacion de vocalizaciones de fauna. Los pesos se distribuyen como modelos completos (no solo adaptadores) bajo el nombre `train_<size>`, donde el tamano indica el numero de vocalizaciones de entrenamiento por taxon: 50, 100 y 500.

El modelo hereda la arquitectura y el entrenamiento base de NatureLM-audio, un modelo multimodal de audio y texto orientado a bioacustica, y anade adaptadores especificos para la tarea de identificacion de especies a partir de sus llamadas. La relevancia actual reside en que facilita la reproduccion de resultados del paper CallMark y ofrece puntos de partida ya entrenados para investigacion en monitorizacion acustica de biodiversidad, un campo con creciente demanda de modelos abiertos.

La informacion publicada en el repositorio es muy limitada: no se detallan parametros, contexto, licencia propia ni idiomas, y la model card remite a los terminos de la release original de EarthSpeciesProject/NatureLM-audio. El repositorio ocupa 49,7 GB, lo que sugiere pesos en precision alta (probablemente fp32 o bf16) para un modelo de audio de tamano considerable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (derivada de EarthSpeciesProject/NatureLM-audio) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de audio; la interfaz de texto de NatureLM-audio no se detalla en esta ficha) |
| Licencia | no disponible en el repo; se remite a los terminos de EarthSpeciesProject/NatureLM-audio |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No se proporciona informacion detallada sobre la arquitectura en el repositorio. Por la model card se deduce que se parte de NatureLM-audio (EarthSpeciesProject) y se le anaden adaptadores entrenados para identificacion de vocalizaciones, guardando el resultado como modelo completo. El entrenamiento se organiza por tamano de dataset: 50, 100 y 500 vocalizaciones por taxon, lo que permite estudiar el efecto del numero de ejemplos por especie en el rendimiento de identificacion.

No se indican en la informacion disponible el numero de tokens de audio, la composicion del dataset, ni si hubo etapas de ajuste fino supervisado, RLHF o DPO. Tampoco se detallan innovaciones tecnicas especificas (atencion, decodificacion, estrategias de aumentacion de datos) mas alla del uso de adaptadores sobre el modelo base. El codigo de entrenamiento y evaluacion esta en el repositorio de GitHub referenciado.

## Capacidades

- Identificacion de vocalizaciones de fauna: los modelos `train_50`, `train_100` y `train_500` estan entrenados para clasificar llamadas por taxon.
- Procesamiento de audio bioacustico: hereda la entrada multimodal de audio de NatureLM-audio.
- Reproducibilidad de experimentos: permite replicar los resultados del paper CallMark con distintos volumenes de datos de entrenamiento.
- Evaluacion comparativa por tamano de dataset: util para analizar curvas de aprendizaje por taxon.
- No se documentan en la informacion disponible capacidades de tool calling, agentes, vision, audio generativo ni modos de razonamiento extendido.
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Monitorizacion acustica de biodiversidad: desplegar los modelos para detectar y clasificar especies en grabaciones de campo continuas, aprovechando el ajuste especifico por taxon.
- Reproduccion de resultados cientificos: ejecutar los scripts del repositorio de CallMark para validar las cifras del paper con los mismos pesos publicados.
- Estudio del efecto del tamano de dataset: comparar `train_50`, `train_100` y `train_500` para determinar cuantas vocalizaciones por especie son necesarias antes de que el rendimiento se sature.
- Punto de partida para ajuste fino en nuevas regiones: usar estos pesos como inicializacion y reentrenar adaptadores con grabaciones locales de otra geografia o taxones no cubiertos.
- Evaluacion de modelos base en bioacustica: emplear los adaptadores como referencia para comparar NatureLM-audio con otros modelos de audio en tareas de identificacion.
- Docencia y formacion en bioacustica computacional: disponer de pesos ya entrenados simplifica la practica con pipelines de clasificacion de audio sin partir de cero.
- Integracion en pipelines de investigacion: el formato safetensors y el codigo de descarga permiten incorporar los modelos a flujos automatizados de analisis de grabaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible con precision; el repositorio ocupa 49,7 GB, lo que sugiere que cargar los pesos completos en fp32 o bf16 requiere al menos del orden de 50 GB de memoria, aunque no se confirma el numero de parametros.
- GPU recomendadas: no disponibles en la informacion proporcionada; por el tamano del repo, probablemente se necesiten GPU de clase A100/H100 para cargar los pesos completos sin cuantizar.
- Compatibilidad con GPU de consumo: no confirmada; sin datos de cuantizacion publicados no puede asegurarse que quepa en RTX 4090 (24 GB) u otras consumer.
- Opciones de despliegue: el repositorio indica scripts de prediccion propios y descarga via `download_models.py`; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CallMark-naturelm | no disponible | no disponible | Identificacion de vocalizaciones (adaptadores sobre NatureLM-audio) | remite a NatureLM-audio | Hugging Face (songbirdini) |
| EarthSpeciesProject/NatureLM-audio | no disponible en esta ficha | no disponible | Modelo base de audio y texto para bioacustica | la de la release original | Hugging Face (EarthSpeciesProject) |
| Otros modelos de bioacustica | no disponible | no disponible | Clasificacion/deteccion de audio | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- La informacion publicada es minima: no hay ficha de parametros, contexto, licencia propia ni idiomas, lo que dificulta evaluar el modelo antes de descargarlo.
- Licencia: el repositorio no declara una licencia propia y remite a los terminos de EarthSpeciesProject/NatureLM-audio; es imprescindible revisar esos terminos antes de cualquier uso comercial.
- Sesgos: al entrenarse con vocalizaciones por taxon, el rendimiento puede degradarse en especies, regiones o condiciones acusticas poco representadas en el conjunto de entrenamiento.
- Riesgo de falsos positivos y negativos en identificacion: sin benchmarks publicados no puede cuantificarse la fiabilidad en produccion.
- El tamano del repositorio (49,7 GB) implica requisitos de almacenamiento y memoria considerables para su despliegue.
- No hay garantias de soporte ni mantenimiento por parte del autor; el repositorio tiene 0 descargas y 0 likes en el momento de la consulta.
- Uso previsto principalmente de investigacion y reproduccion cientifica; no se documenta su validacion para aplicaciones comerciales o de monitorizacion regulatoria.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/songbirdini/callmark-naturelm
- Codigo y instrucciones de CallMark: https://github.com/marisbasha/callmark_reproducibility
- Modelo base: https://huggingface.co/EarthSpeciesProject/NatureLM-audio
