# Saiteja-madineni/catalyst-compass

## Resumen

CatalystCompass es un sistema de prediccion de numeros EC (Enzyme Commission) a partir de reacciones quimicas representadas como SMILES de reaccion. Lo desarrolla el usuario Saiteja-madineni y se publica bajo licencia MIT en Hugging Face. No es un modelo de lenguaje generativo al uso, sino un ensemble de inferencia en CPU que combina huellas estructurales de reaccion, codificadores BERT de reacciones y recuperacion por vecinos quimicos, con una capa de consenso y un decodificador top-one.

El problema que aborda es la anotacion funcional de enzimas: dada una transformacion quimica, asignar la clase EC correspondiente. Es una tarea relevante en biologia computacional y en el diseno de rutas metabolicas, donde la asignacion manual es lenta y propensa a error. La propuesta del autor prioriza la conservacion estricta de la informacion de entrada (estereoquimica, isotopos, direccion de reaccion y roles de reactivos) y evita devolver predicciones cuando las referencias no coinciden en un unico EC completo.

El repositorio ocupa 0,7 GB y el primer arranque descarga aproximadamente 727 MB de activos base. La inferencia esta pensada para ejecutarse sin acceso a red una vez construida la imagen Docker, y el paquete se distribuye como un zip de setup con scripts de ejecucion. No se han publicado parametros, longitud de contexto ni resultados de benchmarks en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Ensemble en CPU: huellas estructurales de reaccion, codificadores BERT de reacciones y recuperacion por vecinos quimicos, con capa de consenso |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (exportacion ONNX; el autor no detalla cuantizaciones) |
| Idiomas soportados | no disponible (la entrada es SMILES de reaccion, no texto natural) |
| Licencia | MIT |
| Formato de pesos | ONNX (tag del repositorio); activos empaquetados en `catalyst_compass_setup.zip` |

## Arquitectura y entrenamiento

La arquitectura es un ensemble de inferencia, no un transformer unico. Segun la model card, combina cuatro piezas: vistas estructurales que reconocen sustratos y contexto de transformacion, codificadores BERT de reacciones que aportan representaciones aprendidas, una busqueda de consenso que reconoce codificaciones alternativas de la misma reaccion y comprobaciones de salida que preservan los identificadores de entrada y devuelven un unico EC valido. El empaquetado incluye un decodificador top-one que evita ordenar todas las clases y mantiene el orden del decodificador base cuando hay empates en las puntuaciones.

El autor describe cambios de inferencia sobre checkpoints neuronales existentes: coincidencia canonica estricta de reacciones que preserva estereoquimica, etiquetas isotopicas, direccion de reaccion, roles de reactivos y numero de moleculas; aceptacion de una busqueda solo cuando las referencias registradas coinciden en un unico EC completo; y parada de la inferencia ante fallos de compatibilidad de huellas en lugar de continuar con un entorno desalineado. No se detallan en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO.

## Capacidades

- Prediccion de numeros EC a partir de SMILES de reaccion, con salida de un unico EC valido por entrada.
- Coincidencia canonica estricta de reacciones: conserva estereoquimica, isotopos, direccion y roles de reactivos.
- Recuperacion por vecinos quimicos para reconocer codificaciones alternativas de la misma reaccion.
- Capa de consenso conservadora: solo acepta una coincidencia cuando las referencias apuntan a un unico EC completo.
- Decodificacion top-one con preservacion del orden base en empates.
- Comprobaciones de integridad: fallo explicito ante incompatibilidad de huellas.
- Ejecucion en CPU y en contenedor Docker, con inferencia sin acceso a red una vez construida la imagen.
- No se documentan capacidades de generacion de texto, codigo, matematicas, vision, audio, tool calling ni agentes.

## Casos de uso

- Anotacion funcional de enzimas en pipelines de biologia computacional: el sistema recibe SMILES de reaccion y devuelve un EC unico, lo que permite procesar lotes de reacciones de forma automatizada en CPU sin GPU.
- Curacion de bases de datos metabolicas: la coincidencia canonica estricta y la capa de consenso reducen el riesgo de asignar un EC incorrecto cuando las referencias discrepan, algo util en revisiones de anotaciones existentes.
- Diseno de rutas metabolicas sinteticas: dado un paso de transformacion propuesto, se obtiene el EC candidato para buscar enzimas compatibles en bases de datos publicas.
- Integracion en entornos air-gapped: al ejecutarse en Docker con red deshabilitada tras el setup, encaja en laboratorios con requisitos de confidencialidad sobre las reacciones procesadas.
- Preprocesado para modelos downstream: el EC predicho puede alimentar clasificadores de toxicidad, modelos de retrosintesis o sistemas de recomendacion de enzimas.
- Validacion de entradas en herramientas de quimica: las comprobaciones de compatibilidad de huellas y la parada ante fallos permiten usar el sistema como control de calidad de un pipeline de datos de reacciones.
- Reproducibilidad de experimentos: el paquete incluye `docs/CHECKS.json` y `output/run.log`, lo que facilita auditar ejecuciones y comparar resultados entre entornos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que las entradas publicas de validacion no tienen coincidencias canonicas elegibles con el entrenamiento, por lo que la busqueda de consenso no aporta una mejora medida en esas entradas, y que la precision en datos privados no se ha medido.

## Requisitos de hardware

- Inferencia en CPU por diseno; no se especifican requisitos de VRAM porque el sistema no esta pensado para GPU.
- El primer arranque descarga aproximadamente 727 MB de activos base; el repositorio completo ocupa 0,7 GB.
- Requiere Docker para construir la imagen `catalyst-compass` y ejecutar el pipeline.
- Setup e construccion de imagen necesitan acceso a internet; las predicciones se ejecutan con red deshabilitada.
- No se documentan latencia ni throughput medidos.
- No se indican GPU recomendadas ni compatibilidad con vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de ensemble.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de prediccion de EC a partir de reacciones, ni datos de parametros, contexto o rendimiento de alternativas.

## Limitaciones y advertencias

- No hay resultados de benchmarks publicados ni precision medida en datos privados; el rendimiento real es desconocido.
- La busqueda de consenso no aporta mejora medida en las entradas publicas de validacion, segun el propio autor.
- La capa de consenso es conservadora: puede rechazar coincidencias validas cuando las referencias no coinciden en un unico EC completo.
- La coincidencia canonica estricta puede impedir la recuperacion de reacciones equivalentes que difieran en detalles de codificacion no normalizados.
- La inferencia se detiene ante incompatibilidad de huellas, lo que puede bloquear ejecuciones en entornos desalineados.
- No se documentan sesgos, cobertura idiomatica ni comportamiento fuera del dominio de reacciones quimicas.
- La licencia MIT permite uso comercial, pero el autor remite a `THIRD_PARTY_NOTICES.md` para atribucion y reutilizacion de componentes de terceros; conviene revisarlo antes de desplegar.
- El modelo no es un LLM: no soporta generacion de texto, tool calling ni razonamiento multi-paso general.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Saiteja-madineni/catalyst-compass
- Notas tecnicas del autor: `docs/MODEL_CARD.md` dentro del paquete `catalyst_compass_setup.zip`
- Comprobaciones medidas: `docs/CHECKS.json` dentro del paquete
- Atribucion de terceros: `THIRD_PARTY_NOTICES.md` dentro del paquete
