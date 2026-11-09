# elrashid/sae-phi-4-mini-instruct-topk-l16

## Resumen

El modelo `elrashid/sae-phi-4-mini-instruct-topk-l16` es un autoencoder disperso (SAE, *sparse autoencoder*) entrenado sobre las activaciones internas del modelo `microsoft/Phi-4-mini-instruct`. Lo publica el usuario elrashid en Hugging Face y su proposito no es generar texto, sino servir como herramienta de interpretabilidad mecanistica: descompone las representaciones internas del modelo base en caracteristicas dispersas y mas interpretables para humanos.

La relevancia de este tipo de artefactos es creciente en el campo de la seguridad y auditoria de IA. Los SAE permiten identificar direcciones latentes asociadas a conceptos concretos dentro de un transformer, lo que facilita tareas como deteccion de sesgos, monitorizacion de comportamientos indeseados o analisis de circuitos internos. Al estar construido sobre Phi-4-mini-instruct, un modelo de 4B parametros ampliamente usado, el SAE es aplicable directamente a un modelo base conocido y de tamano manejable.

El repositorio esta marcado como de acceso restringido (gated) y su tamano es de aproximadamente 1,2 GB, coherente con un SAE de capa intermedia con diccionario de caracteristicas. La informacion publica disponible es escasa: no hay pipeline declarado, no se listan idiomas soportados y no se han publicado resultados de benchmarks en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Sparse autoencoder (SAE) de tipo top-k, capa 16 |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (depende del modelo base Phi-4-mini-instruct) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | PyTorch (libreria declarada: pytorch) |
| Modelo base | microsoft/Phi-4-mini-instruct |
| Tamano del repositorio | ~1,2 GB |
| Acceso | restringido (gated) |

## Arquitectura y entrenamiento

El artefacto es un autoencoder disperso de tipo top-k aplicado a la capa 16 del modelo Phi-4-mini-instruct. En un SAE top-k se entrena un codificador que proyecta las activaciones del modelo base a un espacio de mayor dimensionalidad y aplica una seleccion de las k activaciones mas grandes, forzando dispersidad sin depender de una penalizacion L1. El decodificador reconstruye la activacion original a partir de esas k caracteristicas activas.

El dataset declarado en las etiquetas del repositorio es `monology/pile-uncopyrighted`, un subconjunto del corpus Pile sin material con derechos de autor, habitualmente empleado para entrenar SAE sobre activaciones de modelos. No se dispone de informacion publica sobre el numero de tokens de entrenamiento, el tamano del diccionario de caracteristicas, el valor exacto de k, la funcion de perdida empleada ni si hubo ajuste fino posterior. Tampoco se documenta si el entrenamiento se realizo sobre activaciones del modelo en su version original o cuantizada.

## Capacidades

- Extraccion de caracteristicas interpretables de la capa 16 de Phi-4-mini-instruct.
- Analisis de activaciones internas para estudios de interpretabilidad mecanistica.
- Soporte para tareas de monitorizacion y auditoria de comportamientos del modelo base.
- Uso en investigacion de seguridad de IA (deteccion de conceptos latentes, sesgos, direcciones de refusal, etc.).
- No realiza generacion de texto ni tool calling por si mismo: es un artefacto auxiliar, no un modelo generativo.
- Capacidades multilingues: no disponibles de forma explicita; heredadas, en su caso, de las activaciones del modelo base.

## Casos de uso

- Auditoria de seguridad de Phi-4-mini-instruct: cargar el SAE, extraer caracteristicas activas ante prompts concretos y localizar direcciones latentes asociadas a contenidos sensibles antes de desplegar el modelo base en produccion.
- Investigacion en interpretabilidad mecanistica: analizar que caracteristicas se activan en la capa 16 ante distintos tipos de input (codigo, matematicas, texto multilingue) para estudiar la representacion interna del transformer.
- Deteccion de sesgos: identificar caracteristicas correlacionadas con atributos demograficos o topicos controvertidos y cuantificar su magnitud en las activaciones.
- Monitorizacion en tiempo de inferencia: usar el SAE como sonda ligera que señale activaciones anomalas y dispare alertas o bloqueos en un pipeline de despliegue.
- Steering y edicion de activaciones: manipular caracteristicas concretas del SAE para modular el comportamiento del modelo base en experimentos controlados.
- Docencia y formacion: material practico para cursos de interpretabilidad, ya que el modelo base es pequeno (4B) y el SAE ocupa solo 1,2 GB.
- Reproducibilidad de estudios: servir de referencia para comparar SAE entrenados sobre distintas capas o modelos de la familia Phi.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para el SAE: inferior a 2 GB en precision completa (repositorio de 1,2 GB); cabe en cualquier GPU consumer moderna.
- Para usar el SAE es necesario ejecutar tambien el modelo base Phi-4-mini-instruct (4B parametros), lo que eleva el requisito conjunto.
- GPU recomendadas para el conjunto SAE + modelo base: RTX 4090 (24 GB) en fp16, A100 o H100 para cargas concurrentes.
- Cabe en GPUs consumer con al menos 8-12 GB de VRAM si el modelo base se carga cuantizado (por ejemplo, en 4 bits).
- Opciones de despliegue: PyTorch directamente, integracion con librerias de interpretabilidad (TransformerLens, SAELens) y, para el modelo base, vLLM o llama.cpp.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Modelo base | Capa | Licencia | Acceso |
|---|---|---|---|---|---|
| elrashid/sae-phi-4-mini-instruct-topk-l16 | SAE top-k | Phi-4-mini-instruct | 16 | MIT | Restringido |
| SAE genericos de SAELens (p. ej. sobre GPT-2 small) | SAE | GPT-2 small | variables | MIT / Apache-2.0 | Abierto |
| SAE sobre Llama-3.1-8B (comunidad) | SAE | Llama-3.1-8B | variables | variables | Abierto |
| microsoft/Phi-4-mini-instruct (modelo base) | LLM transformer | no aplica | no aplica | MIT | Abierto |

La comparacion directa con otros SAE es limitada porque no se han publicado metricas de reconstruccion, dispersidad ni interpretabilidad en la informacion disponible.

## Limitaciones y advertencias

- No es un modelo generativo: no debe usarse para tareas de texto, codigo o razonamiento; es un artefacto de analisis.
- Solo cubre la capa 16 del modelo base; las conclusiones no se extrapolan automaticamente a otras capas.
- Entrenado sobre `monology/pile-uncopyrighted`, lo que puede introducir sesgos de dominio y de composicion del corpus.
- Puede heredar sesgos presentes en las activaciones de Phi-4-mini-instruct.
- No se documentan metricas de calidad del SAE (reconstruccion, fraccion de caracteristicas muertas, interpretabilidad), lo que limita su validacion.
- Acceso restringido (gated): requiere aceptar condiciones en Hugging Face, lo que puede complicar su uso en pipelines automatizados.
- Licencia MIT, pero el uso del modelo base subyacente esta sujeto a la licencia de Microsoft para Phi-4-mini-instruct.
- Ausencia de informacion sobre idiomas y contexto: no asumir cobertura multilingue sin verificacion empirica.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validacion por parte de la comunidad.

## Enlaces

- Hugging Face del SAE: https://huggingface.co/elrashid/sae-phi-4-mini-instruct-topk-l16
- Modelo base en Hugging Face: https://huggingface.co/microsoft/Phi-4-mini-instruct
- Dataset de entrenamiento declarado: https://huggingface.co/datasets/monology/pile-uncopyrighted
- DOI asociado: https://doi.org/10.57967/hf/9448
