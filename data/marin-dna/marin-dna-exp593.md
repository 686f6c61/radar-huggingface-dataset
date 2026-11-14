# marin-dna/marin-dna-exp593

## Resumen

MarinDNA exp593 es una familia de puntos de control de investigación para modelado de ADN, publicada por el colectivo marin-dna en el marco del proyecto MarinDNA (Open-Athena). Se trata de un modelo de mezcla de expertos (MoE) con 1.590 millones de parametros totales y aproximadamente 60,6 millones de parametros activos, con dimension oculta d768, especializado en secuencias genomicas y exportado en BF16 con vocabulario completo para inferencia. La publicacion recoge cuatro modelos finales completados del experimento #593, diferenciados por el volumen de tokens de ADN leidos durante el entrenamiento (216B, 432B, 665B FIM y 665B AR-control).

El modelo no es un LLM de proposito general: es un modelo de lenguaje biologico que tokeniza el ADN caracter por caracter y se entrena con objetivos de modelado autorregresivo y de relleno en medio (FIM, fill-in-the-middle). Su relevancia actual radica en que permite comparar de forma controlada el efecto del volumen de datos de ADN y del tipo de objetivo de entrenamiento sobre el rendimiento en tareas genomicas zero-shot, con contadores exactos de tokens y hashes de procedencia publicados.

La distribucion incluye los pesos de inferencia sin estado del optimizador, tokenizadores (el del envoltorio de ADN y el original del modelo de lenguaje base), manifiestos de release con checksums SHA-256 y recibos de exportacion. Los puntos de control nativos con estado del optimizador se conservan por separado en el repositorio exp586. La licencia es Apache-2.0, aunque las fuentes de datos de entrenamiento subyacentes mantienen sus propios terminos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) tipo transformer, d768, con envoltorio de ADN sobre un modelo de lenguaje base |
| Parametros totales | 1,59 B |
| Parametros activos | Aproximadamente 60,6 M |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (export publicado en BF16) |
| Idiomas soportados | No aplica como LLM; secuencias de ADN (tokenizacion caracter a caracter) y metadatos/etiquetas en el formato original del tokenizador de lenguaje |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (cuatro shards por carpeta, con indice, configuracion y tokenizadores) |

## Arquitectura y entrenamiento

La arquitectura es un MoE de 1,59 B de parametros totales con unos 60,6 M activos por token y dimension oculta d768. El modelo se construye sobre un modelo de lenguaje preentrenado al que se anade un envoltorio especifico de ADN; el ADN se tokeniza caracter por caracter y el formato FIM utiliza los IDs del tokenizador de lenguaje original. La inferencia requiere el codigo personalizado fijado por el proyecto (exp586_torch_deployment), no una arquitectura estandar de Transformers asumida.

El entrenamiento se organiza en continuaciones sobre puntos de control intermedios. Los modelos de 216B (inicio desde texto) y 432B (inicio desde ADN) son los experimentos tempranos con aumento de datos y FIM. Los modelos de 665B FIM y 665B AR-control continuan el mismo punto de control intermedio de 545B del experimento exp586 (que despues alcanzo 1T de tokens). Los modelos de 665B annealed usan ADN en minusculas sin metadatos, mientras que los modelos aumentados anteriores emplearon aumento de mayusculas/minusculas y metadatos. Los contadores de entrada incluyen todo el contexto de ADN no rellenado, el ADN predicho y el formato/metadatos; los objetivos de prediccion solo cuentan posiciones usadas en la perdida, y ambos incluyen presentaciones repetidas. No se incluyen tokens del preentrenamiento de lenguaje original.

## Capacidades

- Modelado autorregresivo de secuencias de ADN (prediccion del siguiente caracter nucleotidico).
- Relleno en medio (FIM) para reconstruir regiones internas de una secuencia a partir de contexto flanqueante.
- Evaluacion zero-shot en tareas genomicas mediante el codigo de evaluacion del proyecto (zero-shot-leaderboard de marindna_exp593).
- Procesamiento de contexto de ADN no rellenado con conteo explicito de posiciones de prediccion.
- Soporte de dos regimenes de preprocesado: ADN en minusculas sin metadatos (modelos 665B annealed) y ADN con aumento de mayusculas/minusculas y metadatos (modelos 216B y 432B).
- No dispone de capacidades de generacion de texto natural, razonamiento, codigo, matematicas, vision, audio, tool calling ni agentes; no es un modelo conversacional.

## Casos de uso

- Prediccion de secuencias genomicas: dado un contexto de ADN, el modelo estima la distribucion del siguiente nucleotido, util para anotacion y priorizacion de variantes en pipelines de investigacion.
- Imputacion de regiones faltantes: con el objetivo FIM, se puede reconstruir un tramo interno de una secuencia a partir de los flancos, aplicable a huecos en ensamblajes o lecturas incompletas.
- Evaluacion comparativa de estrategias de entrenamiento: los cuatro puntos de control permiten aislar el efecto del volumen de tokens (216B, 432B, 665B) y del objetivo (FIM frente a AR-control) sobre el rendimiento zero-shot.
- Filtrado y puntuacion de candidatos: usar la verosimilitud del modelo sobre secuencias candidatas para descartar o priorizar disenos en experimentos de biologia sintetica.
- Investigacion en modelos de lenguaje biologico: base para estudiar tokenizacion caracter a caracter, arquitecturas MoE de baja activacion y aumento de datos en dominios no textuales.
- Reproducibilidad de experimentos: los manifiestos con checksums SHA-256 y los contadores exactos permiten replicar y auditar resultados en publicaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite a los resultados del proyecto en el pull request plantcad2#23, pero no se incluyen cifras en los datos proporcionados.

## Requisitos de hardware

- VRAM estimada para inferencia: el export es BF16 con 1,59 B de parametros totales, lo que supone aproximadamente 3,2 GB de pesos; el estado del optimizador no se incluye. La VRAM real depende del codigo de despliegue personalizado y del tamano de lote y contexto.
- GPU recomendadas: no disponibles de forma especifica; por tamano, una GPU consumer con 8-12 GB de VRAM deberia poder alojar los pesos en BF16, aunque el rendimiento depende del codigo de inferencia fijado.
- Cabe en GPU consumer: previsiblemente si, dado el tamano de pesos, sujeto a validacion con el codigo de despliegue del proyecto.
- Opciones de despliegue: el proyecto exige su codigo de inferencia personalizado (exp586_torch_deployment); no se indica compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MarinDNA exp593 | 1,59 B | ~60,6 M | No disponible | Apache-2.0 | Hugging Face (marin-dna) |
| MarinDNA exp586 | No disponible | No disponible | No disponible | Apache-2.0 | Hugging Face (marin-dna) |
| Otros modelos genomicos comparables | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de rendimiento de modelos alternativos en la informacion proporcionada, por lo que no es posible establecer una comparativa cuantitativa.

## Limitaciones y advertencias

- No es un modelo de proposito general: no genera texto natural ni soporta conversacion, tool calling o agentes.
- Requiere el codigo de inferencia personalizado del proyecto; asumir una arquitectura estandar de Transformers producira resultados incorrectos.
- El preprocesado importa: los modelos de 665B annealed esperan ADN en minusculas sin metadatos, mientras que los modelos de 216B y 432B usan aumento de mayusculas/minusculas y metadatos; mezclar regimenes invalida los resultados.
- La tokenizacion es caracter a caracter y el FIM usa IDs del tokenizador de lenguaje original; seleccionar vocabularios compactos o normalizaciones sin leer la model card por modelo puede degradar el rendimiento.
- Los conteos de tokens incluyen presentaciones repetidas y no son directamente comparables con cifras de otros proyectos.
- Riesgo de alucinacion y sesgos: no documentados en la informacion disponible; al ser un modelo genomico, los sesgos dependeran de la composicion de las fuentes de datos de entrenamiento.
- Licencia Apache-2.0 para los pesos, pero las fuentes de datos subyacentes conservan sus propios terminos; verificar antes de uso comercial.
- Son puntos de control de investigacion sin estado del optimizador; no estan pensados como producto final ni con garantias de produccion.
- Longitud de contexto no documentada: no se puede asumir una ventana concreta para secuencias largas.

## Enlaces

- Hugging Face: https://huggingface.co/marin-dna/marin-dna-exp593
- Repositorio exp586 (puntos de control nativos con optimizador): https://huggingface.co/marin-dna/marin-dna-exp586
- Issues del experimento #593: https://github.com/Open-Athena/marin-dna/issues/593
- Codigo de inferencia fijado (exp586_torch_deployment): https://github.com/Open-Athena/marin-dna/tree/6c07df025a185c6e39278327ba5b678dcfd93c86/experiments/exp586_torch_deployment
- Codigo de entrenamiento (exp593_augmented_dna): https://github.com/Open-Athena/marin-dna/tree/16207a4be2c4b6cb7b3e5d31f59dd6557c06998a/experiments/exp593_augmented_dna
- Codigo de evaluacion (zero-shot-leaderboard): https://github.com/plantcad/plantcad2/tree/98be971ac2d0a3f75a976b85049013a8f2f50cda/zero-shot-leaderboard/marindna_exp593
- Resultados de evaluacion (pull request): https://github.com/plantcad/plantcad2/pull/23
