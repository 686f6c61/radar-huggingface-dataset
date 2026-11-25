# ajvelasque/farmacologia

## Resumen

El repositorio `ajvelasque/farmacologia` contiene un modelo predictivo desarrollado con la plataforma QSAR IA, una herramienta de codigo abierto orientada a estudios QSAR (relacion cuantitativa estructura-actividad) y flujos de trabajo de aprendizaje automatico en quimioinformatica y descubrimiento de farmacos. Lo publica la investigadora Ana Julia Velasque (ORCID 0009-0006-4627-958X) bajo licencia MIT.

No se trata de un modelo de lenguaje: el artefacto es un fichero de pesos PyTorch (`projects/trains/<n>/model.pt`) entrenado sobre datos quimicos para predecir propiedades o actividades moleculares. La model card no especifica arquitectura, tamano de parametros, vocabulario, contexto ni corpus de entrenamiento, por lo que la informacion tecnica disponible es minima.

Su relevancia actual radica en el ecosistema de reproducibilidad que propone: cada modelo lleva asociado un fichero `autoria.json` con el hash SHA-256 de los pesos, el ORCID del autor y una firma Ed25519 que permite verificar la cadena de autoria en caso de reentrenamiento. En el momento de la consulta el repositorio registra 0 descargas y 0 likes, y su tamano es de 0.0 GB, lo que sugiere que los pesos podrian no estar efectivamente alojados o que el contenido es minimo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo predictivo QSAR entrenado con la plataforma QSAR IA; no se especifica la familia) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | PyTorch (`model.pt`) |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna del modelo. Se sabe que el artefacto se genera mediante la plataforma QSAR IA, que soporta el ciclo completo de proyectos QSAR y de aprendizaje automatico, y que los pesos se almacenan como un fichero `model.pt` de PyTorch en la ruta `projects/trains/1/model.pt`. No se indican el numero de tokens, la composicion del dataset, el tipo de descriptores moleculares empleados ni si hubo etapas de ajuste fino o validacion cruzada.

La innovacion tecnica destacable no esta en el modelo en si, sino en el mecanismo de trazabilidad: cada entrenamiento produce un `autoria.json` firmado con Ed25519 que incluye el SHA-256 de los pesos y el ORCID del investigador. Los modelos reentrenados conservan la cadena firmada de autores previos, lo que facilita auditar la procedencia y la reproducibilidad del resultado.

## Capacidades

- Prediccion de propiedades o actividades moleculares en el marco de un estudio QSAR (la model card no detalla la tarea concreta ni la variable objetivo).
- Integracion en flujos de trabajo de quimioinformatica y descubrimiento de farmacos soportados por la plataforma QSAR IA.
- Verificacion criptografica de autoria y de integridad de los pesos mediante `autoria.json` (SHA-256 + firma Ed25519).
- Reproducibilidad cientifica: el modelo se publica para que otros grupos puedan reutilizarlo y comparar resultados.
- No se documentan capacidades de generacion de texto, razonamiento, codigo, vision, tool calling, agentes ni multilingueismo.

## Casos de uso

- Filtrado virtual de compuestos: usar el modelo para puntuar bibliotecas quimicas y priorizar candidatos antes de ensayos experimentales, aprovechando que la plataforma QSAR IA esta pensada para este tipo de pipelines.
- Reproduccion de resultados publicados: descargar los pesos y el `autoria.json` para verificar que el modelo empleado coincide con el descrito en una publicacion, gracias al hash SHA-256 firmado.
- Reentrenamiento con nuevos datos: partir del modelo y generar una nueva version que herede la cadena de autoria firmada, manteniendo la trazabilidad entre investigadores.
- Docencia en quimioinformatica: emplear el modelo como ejemplo practico de un flujo QSAR completo, desde el entrenamiento hasta la publicacion con sello de autoria.
- Auditoria de integridad de modelos cientificos: comprobar la firma Ed25519 y el hash para detectar modificaciones no declaradas en los pesos.
- Base para comparativas internas: servir como referencia inicial en la evaluacion de distintos algoritmos QSAR dentro de un mismo proyecto de la plataforma.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (depende de la arquitectura, que no se especifica).
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no determinable con los datos aportados; el tamano del repositorio (0.0 GB) sugiere que los pesos podrian no estar alojados o ser muy reducidos.
- Opciones de despliegue: carga directa con PyTorch (`torch.load` sobre `model.pt`); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que estan orientados a modelos de lenguaje.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La model card no identifica la tarea predictiva concreta ni proporciona metricas, por lo que no es posible establecer una comparacion fundamentada con otros modelos QSAR.

## Limitaciones y advertencias

- Ausencia total de especificaciones: no se documentan arquitectura, parametros, datos de entrenamiento ni metrica objetivo, lo que impide evaluar su idoneidad para un problema concreto.
- Sin benchmarks ni validacion publicada: no hay evidencia de rendimiento predictivo ni de generalizacion fuera del conjunto de entrenamiento.
- Riesgo de sobreajuste y de extrapolacion indebida: al desconocerse el dominio quimico de entrenamiento, aplicar el modelo a familias estructurales distintas puede producir predicciones poco fiables.
- Trazabilidad dependiente de la plataforma: la utilidad del sello de autoria requiere confiar en la implementacion de QSAR IA y en la conservacion del `autoria.json` junto a los pesos.
- Estado del repositorio: 0 descargas, 0 likes y 0.0 GB de tamano; conviene verificar que los pesos estan realmente disponibles antes de planificar su uso.
- Licencia MIT: permite uso comercial y modificacion, pero no exime de citar al autor ni de asumir la responsabilidad sobre las predicciones en contextos regulados (por ejemplo, decisiones farmacologicas).
- Sin soporte declarado de idiomas ni de texto: no debe emplearse como modelo de lenguaje.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/ajvelasque/farmacologia
- Repositorio del proyecto QSAR IA: https://github.com/altobellibm/qsar_ia_project
- ORCID de la autora: https://orcid.org/0009-0006-4627-958X
