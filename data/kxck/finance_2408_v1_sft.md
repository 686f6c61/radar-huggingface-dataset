# Kxck/Finance_2408_v1_SFT

## Resumen

Kxck/Finance_2408_v1_SFT es un adaptador de ajuste supervisado (SFT) sobre el modelo vision-language Qwen/Qwen3-VL-4B-Instruct, publicado por el usuario Kxck bajo la denominacion interna "FinChart Phase 2D SFT-2408". Su proposito es responder preguntas sobre graficos (chart question answering), en particular graficos de tipo financiero, tarea conocida como ChartQA. El adaptador continua el trabajo de una fase anterior, Kxck/Finance_500_v1, y se presenta como un experimento de escalado de SFT, no como un modelo entrenado con DPO.

El modelo base es un transformer multimodal de 4.000 millones de parametros que procesa imagen y texto, y el adaptador se entrena en modo QLoRA segun las etiquetas del repositorio. El entrenamiento se realizo exclusivamente sobre 2.408 registros del split de entrenamiento de ChartQA: 408 ejemplos SFT estructurados y validados procedentes de `train[0:500]`, y 2.000 ejemplos disjuntos supervisados por respuesta procedentes de `train[500:2500]`. Los splits de evaluacion congelados quedaron excluidos del entrenamiento.

Su relevancia actual es limitada pero concreta: se trata de un adaptador pequeno (0,1 GB de repositorio) que reporta resultados de evaluacion sobre splits congelados de ChartQA (68,4 % en `val[0:500]` y 76,12 % en `test[0:2500]`) y publica los manifiestos de evaluacion, lo que permite reproducir la medicion. No obstante, no tiene descargas ni valoraciones, no declara licencia y no ofrece informacion sobre idiomas, contexto o cuantizaciones del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA/QLoRA sobre Qwen/Qwen3-VL-4B-Instruct (transformer vision-language para imagen y texto) |
| Parametros totales | 4.000 millones en el modelo base; numero de parametros del adaptador no disponible |
| Parametros activos | No aplica (no se indica que el modelo base sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Adaptador QLoRA en safetensors; cuantizaciones del modelo base no disponibles |
| Idiomas soportados | no disponibles (los datos de entrenamiento proceden de ChartQA, mayoritariamente en ingles) |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador); el repositorio ocupa 0,1 GB, compatible con transformers y PEFT |

Otros datos tecnicos: identificador Kxck/Finance_2408_v1_SFT, biblioteca transformers, pipeline no disponible, 0 descargas y 0 "likes" en el momento de la consulta, creado el 2026-09-16 y actualizado el mismo dia.

## Arquitectura y entrenamiento

El modelo es un adaptador de bajo rango (LoRA/QLoRA segun las etiquetas del repositorio) que se acopla a Qwen/Qwen3-VL-4B-Instruct, un transformer multimodal de 4.000 millones de parametros que acepta imagenes y texto como entrada. Al tratarse de un adaptador y no de un modelo completo, el repositorio solo contiene los pesos del ajuste, no los pesos del modelo base, que deben descargarse por separado. No se especifican en la informacion disponible ni la dimension del rango LoRA, ni los modulos adaptados, ni los hiperparametros de entrenamiento.

Los datos de entrenamiento son 2.408 registros de ChartQA restringidos al split de entrenamiento: 408 ejemplos SFT estructurados y validados extraidos de `train[0:500]`, y 2.000 ejemplos disjuntos supervisados por respuesta extraidos de `train[500:2500]`. El autor indica explicitamente que los splits de evaluacion congelados se excluyeron del entrenamiento y que se trata de un experimento de escalado de SFT, no de un modelo DPO. La evaluacion reportada se realizo con vLLM en una instancia privada, decodificacion greedy y el comparador de la fase 1, que acepta coincidencia exacta o tolerancia numerica. Los manifiestos completos se incluyen en el repositorio. No se detalla composicion adicional del dataset, uso de RLHF, ni innovaciones de arquitectura o decodificacion mas alla de lo indicado.

## Capacidades

- Respuesta a preguntas sobre graficos (ChartQA): lectura de valores, comparaciones entre series, tendencias y agregaciones a partir de una imagen de grafico.
- Entrada multimodal imagen-texto heredada de Qwen3-VL-4B-Instruct: el adaptador opera sobre la torre visual del modelo base.
- Salida de respuestas cortas y factuales orientadas a valor numerico o etiqueta, que es el formato que evalua ChartQA con comparador de tolerancia numerica.
- Generacion de texto en lenguaje natural para justificar o describir la respuesta, aunque esto no se evalua en los numeros reportados.
- Continuacion de una linea de trabajo previa (Kxck/Finance_500_v1), lo que permite comparar fases de escalado del mismo pipeline de datos.
- Soporte de tool calling / function calling: no documentado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado en la informacion disponible.
- Capacidades multilingues: no documentadas; los datos de entrenamiento estan en ingles.
- Modo de razonamiento explicito (thinking), audio u otras capacidades especiales: no disponibles en la informacion proporcionada.

## Casos de uso

- Extraccion automatica de series de datos de graficos financieros: se puede enviar la captura de un grafico de ingresos trimestrales y obtener el valor de un trimestre concreto o la comparacion entre dos periodos, aprovechando el ajuste especifico sobre ChartQA.
- Generacion de tablas a partir de imagenes de informes: en un pipeline de digitalizacion de informes anuales, el modelo responde a consultas puntuales sobre cada figura y esas respuestas se consolidan en una tabla estructurada para su posterior analisis.
- Asistentes de analisis para equipos financieros: integrado en una herramienta interna de chat, permite preguntar en lenguaje natural sobre capturas de dashboards sin necesidad de exportar los datos subyacentes.
- Control de calidad de visualizaciones: dada una imagen de grafico generada por un sistema de reporting, el modelo responde a preguntas de comprobacion (maximos, minimos, orden de series) que alimentan un test automatico de regresion sobre el pipeline de visualizacion.
- Enriquecimiento de bases documentales: indexar informes en PDF y, para cada figura, almacenar un conjunto de pares pregunta-respuesta generados por el modelo, mejorando la recuperacion semantica sobre documentos financieros.
- Evaluacion interna de modelos de chart QA: el repositorio incluye manifiestos y un comparador exacto o con tolerancia numerica, por lo que puede utilizarse como referencia reproducible en bancos de pruebas propios de lectura de graficos.
- Monitorizacion de paneles operativos: en un sistema que captura pantallas periodicas de cuadros de mando, el modelo puede responder a preguntas de umbral ("¿el valor supera X?") para disparar alertas, siempre que la precision se valide antes en el dominio concreto.
- Formacion y soporte a usuarios no tecnicos: explicar en texto que muestra un grafico dado, como capa de accesibilidad sobre imagenes de informes.

## Benchmarks y rendimiento

Resultados reportados por el autor en la model card, sobre splits congelados de ChartQA y con decodificacion greedy mediante vLLM:

| Benchmark | Split | Aciertos | Precision |
|---|---|---|---|
| ChartQA | val[0:500] | 342 / 500 | 68,4 % |
| ChartQA | test[0:2500] | 1.903 / 2.500 | 76,12 % |

No se han publicado en la informacion disponible resultados comparativos frente al modelo base Qwen/Qwen3-VL-4B-Instruct ni frente a la fase anterior Kxck/Finance_500_v1, ni resultados en otros benchmarks (MMLU, HumanEval, GSM8K u otros). No se dispone de datos de latencia o throughput. La metrica empleada es el comparador de la fase 1 del autor, que admite coincidencia exacta o tolerancia numerica, por lo que los valores no son directamente equiparables a los de otras evaluaciones de ChartQA que usan criterios de coincidencia distintos.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base tiene 4.000 millones de parametros. En BF16/FP16 los pesos ocupan aproximadamente 8-9 GB, mas el cache KV y la torre visual; en cuantizacion de 8 bits, unos 5 GB; en 4 bits, unos 3 GB. Son estimaciones de orden de magnitud, no valores medidos para este adaptador.
- GPU recomendadas para servicio en produccion: A100 40/80 GB, H100, L40S o A6000, que permiten lotes grandes y contexto amplio con margen.
- GPU de gama de consumo: cabe en RTX 4090 (24 GB) y RTX 3090 (24 GB) con holgura en BF16; en 4 bits cabe en RTX 3060 12 GB, RTX 4060 Ti 16 GB y RTX 4070 12 GB, con limitaciones de lote y longitud de contexto.
- Opciones de despliegue: vLLM es la via empleada por el autor para la evaluacion; tambien son viables transformers con PEFT para cargar el adaptador, TGI, y llama.cpp u Ollama si se fusiona el adaptador con el modelo base y se convierte a GGUF (requiere pasos adicionales no documentados por el autor).
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No se dispone de datos comparativos publicados en la informacion proporcionada. La tabla recoge unicamente los datos declarados para este adaptador y su relacion con el modelo base y con la fase previa.

| Modelo | Parametros | Contexto | ChartQA (reportado) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Kxck/Finance_2408_v1_SFT | 4.000 M (base) + adaptador no cuantificado | no disponible | 68,4 % en val[0:500]; 76,12 % en test[0:2500] | no disponible | HuggingFace, 0 descargas |
| Qwen/Qwen3-VL-4B-Instruct (base) | 4.000 M | no disponible | no disponible | no disponible en la informacion | HuggingFace |
| Kxck/Finance_500_v1 (fase previa) | 4.000 M (base) + adaptador | no disponible | no disponible | no disponible | HuggingFace |

Alternativas especializadas en chart QA de otros autores: no disponibles en la informacion proporcionada, ya que la busqueda web no devolvio resultados relevantes.

## Limitaciones y advertencias

- Sesgos conocidos: no se documenta ningun analisis de sesgos. El entrenamiento se limita a ChartQA, un conjunto con sesgos propios de dominio, tipos de grafico y estilo de figura que se trasladaran al modelo.
- Riesgo de alucinacion: en tareas de lectura de graficos, un valor mal leido o inventado es indistinguible de un valor correcto en la salida. No hay mecanismo de abstención ni de verificacion documentado.
- Generalizacion limitada: el ajuste usa solo 2.408 ejemplos de un unico dataset. No hay evidencia reportada sobre graficos financieros reales, figuras fuera de ChartQA, ni otros idiomas distintos del ingles de los datos de entrenamiento.
- Dependencia del modelo base: el repositorio contiene unicamente el adaptador (0,1 GB); es obligatorio descargar Qwen/Qwen3-VL-4B-Instruct y cargar el adaptador con PEFT o equivalente.
- Licencia no declarada: el repositorio no indica licencia. Antes de cualquier uso comercial hay que verificar la licencia del modelo base y aclarar con el autor las condiciones del adaptador. Esta ausencia es un riesgo legal relevante en produccion.
- Ausencia de validacion externa: 0 descargas y 0 valoraciones. Los unicos numeros disponibles son los del propio autor, medidos con su comparador (coincidencia exacta o tolerancia numerica), lo que dificulta la comparacion con otras cifras publicas de ChartQA.
- Metricas de evaluacion no comparables directamente: los splits usados (`val[0:500]`, `test[0:2500]`) son subconjuntos, no el conjunto completo de evaluacion de ChartQA.
- Sin datos de contexto, idiomas ni cuantizaciones: no es posible planificar limites de contexto en produccion a partir de la informacion publicada.
- Fecha de publicacion atipica: el repositorio figura como creado el 2026-09-16, dato que conviene verificar antes de citarlo.
- Reproducibilidad parcial: los manifiestos estan incluidos, pero no se detallan los hiperparametros de entrenamiento (rango LoRA, learning rate, epocas), lo que impide reentrenar el adaptador de forma identica.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Kxck/Finance_2408_v1_SFT
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-4B-Instruct
- Fase previa citada en la model card: https://huggingface.co/Kxck/Finance_500_v1

Nota: la busqueda web realizada no devolvio ningun resultado relevante sobre este modelo (unicamente paginas de test de velocidad de internet), por lo que no hay papers, blogs, repositorios de codigo ni demos adicionales que enlazar.
