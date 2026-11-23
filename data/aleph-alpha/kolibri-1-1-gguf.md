# Aleph-Alpha/Kolibri-1.1-GGUF

## Resumen
Kolibri 1.1 GGUF es la distribucion cuantizada en formato GGUF del modelo Kolibri 1.1 de Aleph Alpha, un modelo de generacion de texto basado en arquitectura de mezcla de expertos (MoE) disenado especificamente para aleman e ingles. El modelo base cuenta con 75.112.665.344 parametros totales y esta orientado a tareas de razonamiento y generacion conversacional. Esta version GGUF permite ejecutar el modelo con llama.cpp en hardware de consumo, algo inviable con los pesos completos en safetensors.

La relevancia de esta ficha radica en que Aleph Alpha es uno de los principales actores europeos en IA generativa, y Kolibri 1.1 representa su apuesta por modelos eficientes tipo MoE con licencia Apache 2.0, lo que facilita su adopcion comercial. La publicacion de cuantizaciones oficiales con evaluaciones de calidad por nivel de compresion (incluyendo tecnicas GSQ-RCO) aporta informacion util para decidir el equilibrio entre VRAM y degradacion de rendimiento.

El repositorio GGUF tiene un tamano de 416,3 GB e incluye multiples niveles de cuantizacion, desde Q8_0 hasta GSQ-RCO de 1,75 bits por peso. La model card advierte explicitamente de que no se recomienda su ejecucion solo en CPU, lo que situa al modelo en la categoria de despliegues con GPU o memoria unificada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) tipo transformer; detalles de capas y expertos no disponibles |
| Parametros totales | 75.112.665.344 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0, Q6_K, Q5_K_M, Q4_K_M, Q4_0, IQ4_XS, Q3_K_M, GSQ-RCO 2.25 bpw, GSQ-RCO 2.00 bpw, GSQ-RCO 1.75 bpw |
| Idiomas soportados | Aleman (de), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); modelo base en safetensors |

## Arquitectura y entrenamiento
Kolibri 1.1 es un modelo de mezcla de expertos (MoE) de Aleph Alpha orientado a razonamiento y generacion de texto en aleman e ingles. La informacion disponible confirma la naturaleza MoE y el numero total de parametros (75.112.665.344), pero no detalla el numero de expertos, la dimension oculta, el numero de capas ni los parametros activos por token. Tampoco se especifican el volumen de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO.

La innovacion tecnica mas destacable documentada en esta ficha es el uso de cuantizaciones GSQ-RCO (hasta 1,75 bits por peso) ademas de las cuantizaciones K-quant e I-quant habituales de llama.cpp. La model card incluye graficas y tablas que miden la variacion de rendimiento (Overall EN y Overall DE) respecto al modelo sin cuantizar para cada nivel, lo que permite seleccionar la cuantizacion segun el presupuesto de memoria. El repositorio emplea ademas tecnicas de imatrix para mejorar la calidad de las cuantizaciones de baja precision.

## Capacidades
- Generacion de texto conversacional en aleman e ingles, segun la model card del modelo base.
- Razonamiento: el modelo base se describe como "mixture-of-experts reasoning model", por lo que esta orientado a tareas de razonamiento multi-paso.
- Capacidades multilingues limitadas a aleman e ingles.
- Compatibilidad con endpoints (tag `endpoints_compatible`) para despliegue como servicio de inferencia.
- Ejecucion mediante llama.cpp con parametros de muestreo recomendados por el autor: `--temp 1.0 --top-p 0.99 --top-k 128`.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de vision o audio: no disponible; la model card no menciona modalidades adicionales.
- Modo "thinking" explicito: no disponible en la informacion proporcionada.

## Casos de uso
- Atencion al cliente en aleman e ingles: el modelo puede gestionar conversaciones multi-turno en ambos idiomas con un unico despliegue, lo que simplifica la infraestructura para empresas con operaciones en el mercado DACH. La cuantizacion Q4_K_M permite ejecutarlo en una sola GPU de 48 GB con perdida de calidad de solo -0,7 puntos en Overall.
- Generacion y revision de documentacion tecnica bilingue: la combinacion de capacidades de razonamiento y dominio del aleman lo hace adecuado para redactar manuales, contratos o informes que requieran coherencia terminologica entre ambos idiomas.
- Asistentes de codigo en entornos corporativos: aunque no hay benchmarks publicados de HumanEval en esta ficha, el modelo base esta orientado a razonamiento, lo que permite su uso como asistente de programacion en pipelines internos con llama.cpp o servidores compatibles con la API de OpenAI.
- Despliegue en infraestructura europea con requisitos de soberania de datos: la licencia Apache 2.0 y el origen europeo de Aleph Alpha facilitan el cumplimiento de politicas de residencia de datos en administraciones publicas y sectores regulados.
- Prototipado rapido en estaciones de trabajo con GPU de consumo: las cuantizaciones GSQ-RCO de 2,00 y 2,25 bpw reducen el peso del modelo lo suficiente para probarlo en GPUs de 24-32 GB, con una degradacion de -4,6 y -2,6 puntos respectivamente en Overall.
- Investigacion sobre cuantizacion extrema: el repositorio publica curvas de calidad por nivel de compresion, lo que lo convierte en un banco de pruebas util para estudiar el impacto de GSQ-RCO frente a K-quants en modelos MoE de gran tamano.
- Traduccion asistida aleman-ingles en entornos editoriales: el modelo puede integrarse en flujos de pre-traduccion y postedicion con control de estilo mediante prompts, siempre que el contexto requerido no supere la ventana del modelo (no documentada en esta ficha).

## Benchmarks y rendimiento
La model card de esta version GGUF publica una tabla de calidad relativa por cuantizacion respecto al modelo Kolibri 1.1 sin cuantizar. El valor de referencia Overall es 73,2 y las celdas muestran la variacion en puntos:

| Evaluacion | Kolibri 1.1 | Q8_0 | Q6_K | Q5_K_M | Q4_K_M | Q4_0 | IQ4_XS | Q3_K_M | GSQ-RCO 2.25 bpw | GSQ-RCO 2.00 bpw | GSQ-RCO 1.75 bpw |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Overall | 73,2 | -0,3 | +0,3 | +0,1 | -0,7 | -0,2 | -0,4 | -1,2 | -2,6 | -4,6 | -9,0 |

No se han publicado en la informacion disponible resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) ni comparaciones con modelos similares.

## Requisitos de hardware
- VRAM estimada: con 75.112 millones de parametros totales, el peso en Q8_0 ronda los 80 GB; Q4_K_M aproximadamente 40-45 GB; las cuantizaciones GSQ-RCO de 2,25, 2,00 y 1,75 bpw se situan en torno a 21, 19 y 16,5 GB respectivamente (estimacion a partir de los bits por peso, no confirmada por el autor).
- GPU recomendadas: para Q8_0 se necesita una GPU de 80 GB (A100 80GB, H100 80GB) o varias GPUs; para Q4_K_M una A100 40GB o una RTX 6000 Ada de 48 GB; para GSQ-RCO de 2,00-2,25 bpw una RTX 4090 de 24 GB o una RTX 5090 de 32 GB.
- Cabe en GPU de consumo: si, en las cuantizaciones GSQ-RCO de 2,00 y 2,25 bpw, con degradacion de calidad de -4,6 y -2,6 puntos respectivamente. El autor advierte de que no se recomienda ejecutar solo en CPU.
- Opciones de despliegue: llama.cpp (llama-server, con soporte de `-hf` para descarga directa), y cualquier frontend compatible con GGUF como Ollama o LM Studio; el tag `endpoints_compatible` sugiere compatibilidad con endpoints de inferencia gestionados.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares
No se dispone de datos de benchmarks ni de especificaciones completas de modelos comparables en la informacion proporcionada. La comparacion se limita a caracteristicas estructurales conocidas:

| Modelo | Parametros totales | Contexto | Licencia | Formato GGUF oficial | Idiomas |
|---|---|---|---|---|---|
| Kolibri 1.1 GGUF | 75,1 B (MoE) | no disponible | Apache 2.0 | Si | de, en |
| Alternativas de tamano similar | no disponible | no disponible | no disponible | no disponible | no disponible |

No se han identificado en la informacion disponible modelos comparables directos con datos verificables de parametros, contexto y rendimiento.

## Limitaciones y advertencias
- Idiomas: solo aleman e ingles; no se garantiza un rendimiento adecuado en castellano ni en otras lenguas.
- Contexto: la longitud de contexto no esta documentada en esta ficha, lo que impide planificar casos de uso con documentos largos sin consultar la model card del modelo base.
- Cuantizacion: las cuantizaciones por debajo de Q4_K_M introducen degradaciones medibles; GSQ-RCO 1,75 bpw pierde 9,0 puntos en Overall, lo que la hace inadequada para tareas de razonamiento exigentes.
- CPU: el autor desaconseja explicitamente la ejecucion solo en CPU, por lo que el despliegue requiere GPU o memoria unificada.
- Alucinacion y sesgos: no se documentan en la informacion disponible; deben evaluarse empiricamente antes de usar el modelo en produccion.
- Licencia: Apache 2.0 permite uso comercial, pero se recomienda revisar la model card del modelo base por si Aleph Alpha anade terminos de uso aceptable adicionales.
- Fecha de publicacion: el repositorio figura creado el 2026-11-20, lo que puede indicar metadatos incorrectos o una publicacion futura; conviene verificar la disponibilidad real antes de integrarlo.
- Parametros activos y arquitectura interna: al no conocerse el numero de expertos ni los parametros activos, no es posible estimar con precision el coste computacional por token.

## Enlaces
- Repositorio GGUF: https://huggingface.co/Aleph-Alpha/Kolibri-1.1-GGUF
- Modelo base: https://huggingface.co/Aleph-Alpha/Kolibri-1.1
- Blog de Aleph Alpha sobre Kolibri 1.1: https://aleph-alpha.com/en/blog/kolibri-1-1/
- Perfil de Aleph Alpha en Hugging Face: https://huggingface.co/Aleph-Alpha
