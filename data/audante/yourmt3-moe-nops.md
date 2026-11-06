# Audante/YourMT3-moe-nops

## Resumen

YourMT3+ es un modelo de transcripcion musical automatica (AMT, *Automatic Music Transcription*) desarrollado originalmente por Sungkyun Chang y colaboradores, y publicado en el repositorio oficial `mimbres/YourMT3`. Esta ficha describe una copia no oficial subida por el usuario Audante bajo el identificador `Audante/YourMT3-moe-nops`, con licencia Apache 2.0 y un tamano de repositorio de 0,6 GB. Segun la propia model card, el checkpoint es identico al original: solo se ha acortado el nombre del fichero y no se ha modificado ningun peso.

La variante "MoE, no pitch shift" hace referencia a la configuracion de mezcla de expertos (*Mixture of Experts*) del modelo original, en la que distintos submodelos se especializan en familias de instrumentos, y a la desactivacion del aumento de tono (*pitch shift*) durante la inferencia. El modelo convierte audio musical en notacion simbolica (eventos de nota con tono, inicio, duracion e instrumento), una tarea relevante para produccion musical asistida, analisis musicologico y generacion de partituras a partir de grabaciones.

No se dispone de informacion publicada en esta model card sobre arquitectura interna, numero de parametros, longitud de contexto ni idiomas soportados. Los datos tecnicos que se detallan a continuacion proceden exclusivamente de la informacion disponible en el repositorio de Hugging Face y de la model card citada; cualquier campo no documentado se marca explicitamente como "no disponible".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE) segun el nombre del checkpoint; detalles internos no disponibles |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (modelo de audio, no de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de audio musical, no linguistico) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (repositorio de 0,6 GB; presumiblemente checkpoint PyTorch, sin confirmar) |

## Arquitectura y entrenamiento

La model card no documenta la arquitectura interna ni el proceso de entrenamiento. El nombre del checkpoint indica una variante con mezcla de expertos (*MoE*) y sin *pitch shift* en inferencia, lo que sugiere que el modelo original distribuye la prediccion entre varios expertos especializados y que esta copia omite el aumento de tono aplicado en la version estandar. No se especifican el numero de tokens de audio utilizados, la composicion del dataset, ni si hubo etapas de ajuste fino supervisado o preferencias.

El checkpoint es una copia byte a byte del original `mimbres/YourMT3` en la revision `e45ebd70398682d54b7bb1901a5216e18f3b1824`. El autor declara explicitamente que no ha introducido cambios en los pesos y que todos los derechos permanecen en manos de los autores originales. Cualquier detalle sobre innovaciones tecnicas (atencion, decodificacion, funciones de perdida) debe consultarse en la documentacion del modelo fuente, no en esta copia.

## Capacidades

- Transcripcion musical automatica: conversion de audio en eventos de nota simbolicos (tono, inicio, duracion, instrumento).
- Modelado multi-instrumento: la variante MoE sugiere especializacion por familias de instrumentos, aunque no se detalla en la model card.
- Inferencia sin *pitch shift*: adecuada para evaluacion sobre audio con tono original, sin aumentos de datos.
- No se documentan capacidades de generacion de texto, codigo, matematicas, vision, tool calling, agentes ni multilingues.
- No se documenta soporte de *thinking mode*, audio hablado ni otras modalidades fuera de la musica.

## Casos de uso

- Transcripcion de grabaciones musicales a partituras: el modelo recibe audio y devuelve eventos de nota que pueden convertirse a MIDI o MusicXML para edicion posterior en un DAW o editor de partituras.
- Analisis musicologico a escala: procesar corpus de grabaciones para extraer estadisticas de alturas, duraciones e instrumentacion sin transcripcion manual.
- Produccion musical asistida: generar borradores MIDI a partir de ideas grabadas que el compositor puede editar y reorganizar.
- Educacion musical: obtener representaciones simbolicas de piezas para ejercicios de analisis armonico o ritmico.
- Investigacion en AMT: servir como checkpoint de referencia para comparar metodos de transcripcion, dado que esta copia es identica al original y permite reproducir resultados.
- Sistemas de recuperacion musical: indexar grabaciones por contenido simbolico (melodia, armonia) para busqueda y recomendacion.
- Preprocesado para modelos generativos de musica: convertir audio en representaciones simbolicas que alimenten modelos de generacion condicionada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas (nota F1, *onset* F1, *frame* F1 ni otras) ni comparaciones con modelos alternativos.

## Requisitos de hardware

- VRAM estimada: no disponible; el repositorio ocupa 0,6 GB, lo que sugiere un modelo de tamano moderado que probablemente cabe en GPUs de consumo, pero no se confirma.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: probable por el tamano del checkpoint, sin confirmacion oficial.
- Opciones de despliegue: no documentadas; al ser un checkpoint de investigacion, lo habitual seria cargarlo con PyTorch y el codigo del repositorio original `mimbres/YourMT3`. No se mencionan vLLM, llama.cpp, Ollama ni TGI (herramientas orientadas a modelos de lenguaje, no aplicables directamente a AMT).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Audante/YourMT3-moe-nops | no disponible | no disponible | AMT (audio a simbolico) | Apache 2.0 | Hugging Face (copia no oficial) |
| mimbres/YourMT3 | no disponible | no disponible | AMT (audio a simbolico) | Apache 2.0 | Hugging Face (oficial) |
| Otras alternativas de AMT | no disponible | no disponible | AMT | no disponible | no disponible |

La unica comparacion documentada es con el modelo fuente `mimbres/YourMT3`, del que esta copia es identica salvo el nombre del fichero. No se dispone de datos para comparar con otros sistemas de transcripcion musical.

## Limitaciones y advertencias

- Copia no oficial: el autor declara que no es un *release* oficial y que todos los derechos pertenecen a los autores originales; para uso en produccion conviene referenciar el repositorio oficial `mimbres/YourMT3`.
- Sin cambios respecto al original: no aporta mejoras, correcciones ni ajustes; su unico valor es la disponibilidad del checkpoint con un nombre alternativo.
- Sin documentacion de sesgos: no se describen sesgos conocidos en la transcripcion (por ejemplo, hacia ciertos generos o instrumentos).
- Riesgo de alucinacion: no evaluado en la informacion disponible; en AMT se traduce en notas espurias u omisiones, pero no hay datos publicados.
- Limitaciones de contexto e idioma: no aplicables en el sentido linguistico; el modelo opera sobre audio musical y no se documentan restricciones de genero, duracion o instrumentacion.
- Licencia Apache 2.0: permite uso comercial y modificacion con atribucion, pero al tratarse de una copia no oficial, la responsabilidad de cumplimiento recae en el usuario.
- Sin garantias de mantenimiento: el repositorio no tiene descargas ni *likes* y no se documenta soporte activo.

## Enlaces

- Repositorio de la copia: https://huggingface.co/Audante/YourMT3-moe-nops
- Modelo original: https://huggingface.co/mimbres/YourMT3
- Revision citada del original: `e45ebd70398682d54b7bb1901a5216e18f3b1824`
- Licencia Apache 2.0 (referenciada en la model card): fichero `LICENSE` del repositorio
