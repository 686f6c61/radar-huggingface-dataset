# mistralai/Timestral-123M

# mistralai/Timestral-123M

## Resumen

Timestral-123M es un modelo fundacional de series temporales desarrollado por Mistral AI, diseñado para forecasting zero-shot, es decir, sin reentrenamiento ni ajuste específico sobre la serie objetivo. Forma parte de la familia Timestral, publicada en cuatro tamanos (5M, 28M, 123M y 209M parametros), y esta checkpoint concreto cuenta con 122.606.720 parametros reales segun los pesos en safetensors, con un repositorio de 0,5 GB.

El modelo resuelve el problema de la prediccion de series temporales multivariantes y univariantes con covariables pasadas y futuras conocidas, devolviendo una distribucion predictiva completa mediante 21 cuantiles en lugar de una unica estimacion puntual. Su arquitectura es un transformer basado en parches con atencion temporal y atencion entre variables, con 20 capas y dimension de embedding 640, capaz de procesar contextos de hasta 32.768 pasos temporales y de generar horizontes de hasta 1.024 pasos en un solo forward pass.

Su relevancia actual radica en que compite por el estado del arte en zero-shot forecasting, segun los resultados declarados por el autor en los leaderboards GIFT-Eval, TIME y fev-bench, y en que ofrece un equilibrio entre tamano y rendimiento: con solo 123M de parametros se aproxima mucho al modelo mayor de la familia (209M) y, segun la model card, supera a cualquier otro modelo de su mismo tamano. La licencia es una MIT modificada, con la restriccion adicional de no vulnerar derechos de terceros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer basado en parches (patch-based) con atencion temporal y atencion entre variables; 20 capas, dimension de embedding 640 |
| Parametros totales | 122.606.720 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | hasta 32.768 pasos temporales (1.024 parches de 32 pasos) |
| Horizonte de prediccion | hasta 1.024 pasos temporales (32 parches) en un forward pass; horizontes mayores se generan bloque a bloque, anadiendo la mediana de cada bloque al contexto |
| Tipos de cuantizacion | no disponible (solo se publican pesos en safetensors; no hay variantes GGUF ni cuantizadas documentadas) |
| Idiomas soportados | no disponible; no aplica, no procesa texto natural |
| Licencia | other ("Modified MIT"), con clausula adicional de no infraccion de derechos de terceros |
| Formato de pesos | safetensors (tamano del repositorio: 0,5 GB) |
| Libreria | timestral |
| Salidas | 21 cuantiles (0.01, 0.05, 0.1, 0.15, ..., 0.85, 0.9, 0.95, 0.99) |
| Entradas | variables objetivo univariantes o multivariantes, mas covariables pasadas y futuras conocidas, numericas o categoricas (las categoricas se codifican por target encoding); los valores ausentes se marcan como NaN |
| Inferencia | PyTorch en CPU o GPU |

## Arquitectura y entrenamiento

Timestral-123M es un transformer basado en parches. La serie temporal se divide en parches de 32 pasos y cada parche se embebe a partir de sus valores junto con indicadores de valor ausente, lo que permite manejar series con huecos sin imputacion previa. Sobre esa representacion, el modelo aplica dos mecanismos de atencion complementarios: atencion a lo largo del tiempo (entre parches de una misma variable) y atencion entre variables (entre las distintas series del panel). La pila consta de 20 capas con dimension de embedding 640.

El modelo se disena para prediccion probabilistica: la cabeza de salida produce 21 cuantiles que describen la distribucion predictiva, lo que permite calcular intervalos de confianza y metricas probabilisticas como CRPS. Para horizontes superiores a 1.024 pasos, la generacion es autorregresiva por bloques, tomando la mediana de cada bloque predicho y anadiendola al contexto antes de predecir el siguiente. La inferencia se realiza en PyTorch, en CPU o GPU.

La informacion disponible no detalla el numero de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de RLHF, DPO u otras fases de alineamiento. Tampoco se documentan innovaciones adicionales como decodificacion especulativa o mecanismos de atencion lineal. Estos datos figuran como no disponibles.

## Capacidades

- Forecasting zero-shot de series temporales univariantes y multivariantes, sin necesidad de ajuste especifico sobre la serie objetivo.
- Prediccion probabilistica mediante 21 cuantiles, apta para intervalos de prediccion y decision bajo incertidumbre.
- Manejo nativo de valores ausentes: los huecos se marcan como NaN y el modelo los incorpora mediante indicadores de missing value en el embedding del parche.
- Soporte de covariables: variables pasadas (past-only) y variables futuras conocidas (known-future), tanto numericas como categoricas; las categoricas se codifican por target encoding.
- Contexto largo de hasta 32.768 pasos temporales, adecuado para series con estacionalidades multiples y dependencias de largo plazo.
- Horizontes largos mediante generacion por bloques, con la mediana de cada bloque realimentada en el contexto.
- No se documenta soporte de tool calling, function calling ni comportamiento de agente. Tampoco capacidades de vision, audio o modo de razonamiento explicito: es un modelo exclusivamente numerico-temporal.
- No dispone de capacidades multilingues: no procesa texto natural.

## Casos de uso

- Prevision de demanda en retail: el modelo puede ingerir series de ventas por SKU y tienda, junto con covariables de calendario y promociones como variables futuras conocidas, y producir cuantiles de demanda para planificacion de stock y aprovisionamiento.
- Prediccion de carga en redes electricas: con contexto de hasta 32.768 pasos, permite modelar estacionalidad diaria, semanal y anual simultaneamente, incorporando temperatura prevista como covariable futura, para programar generacion y evitar picos.
- Gestion de inventario y cadena de suministro: forecasting probabilistico por referencia para fijar niveles de stock de seguridad a partir de los cuantiles 0,05 y 0,95, en lugar de una unica prediccion puntual.
- Monitorizacion de sensores industriales e IoT: al tolerar NaN de forma nativa, el modelo es adecuado para series con sensores caidos o lecturas intermitentes, generando predicciones de referencia para deteccion de anomalias por desviacion.
- Planificacion financiera y de tesoreria: prevision de flujos de caja o volumenes de transaccion con intervalos de confianza, apoyando escenarios de stress a partir de los cuantiles extremos.
- Prediccion de trafico y movilidad: con multiples series correlacionadas (vias, franjas horarias) tratadas como variables de un panel multivariante, la atencion entre variables captura dependencias espaciales y temporales.
- Capacidad y rendimiento en infraestructura TI: prevision de uso de CPU, memoria o peticiones por servicio para escalado proactivo y ajuste de autoescalado.
- Forecasting jerarquico en energia o utilities: prediccion a nivel de contador, agregacion y reconciliacion, aprovechando el soporte multivariante y de covariables categoricas.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente, campo `verified: false`):

| Benchmark | Metrica | Timestral-5M | Timestral-28M | Timestral-123M | Timestral-209M |
|---|---|---|---|---|---|
| GIFT-Eval | MASE (menor es mejor) | 0.705 | 0.678 | 0.659 | 0.658 |
| GIFT-Eval | CRPS (menor es mejor) | 0.479 | 0.461 | 0.448 | 0.446 |
| TIME | MASE (menor es mejor) | 0.652 | 0.638 | 0.628 | 0.626 |
| TIME | CRPS (menor es mejor) | 0.545 | 0.534 | 0.525 | 0.522 |
| fev-bench | SQL skill score (mayor es mejor) | 46.19 | 48.42 | 50.18 | 50.39 |
| fev-bench | MASE skill score (mayor es mejor) | 34.54 | 37.27 | 39.19 | 39.49 |

Segun la model card, Timestral-209M alcanza el estado del arte zero-shot en GIFT-Eval, TIME y fev-bench, y todos los modelos de la familia superan a cualquier otro modelo de su mismo tamano. La model card no publica una comparativa numerica contra modelos externos concretos.

## Requisitos de hardware

- VRAM estimada para los pesos: unos 490 MB en FP32 y unos 245 MB en FP16/BF16, calculados a partir de los 122,6M de parametros. El repositorio completo ocupa 0,5 GB.
- El calculo de memoria de atencion para un contexto de 32.768 pasos y para paneles multivariantes no esta documentado: no disponible.
- Cabe sin problema en cualquier GPU de consumo actual (RTX 3060 12 GB, RTX 4090, etc.) e incluso en GPUs con 4-6 GB de VRAM para los pesos en precision reducida.
- La inferencia oficial es PyTorch, en CPU o GPU. En CPU es viable dado el reducido tamano del modelo.
- No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI; la libreria indicada es `timestral`. Otros backends figuran como no disponibles.
- No se publican datos de latencia ni de throughput: no disponible.

## Comparativa con modelos similares

Comparativa dentro de la familia Timestral (unica con datos cuantitativos disponibles en la informacion proporcionada):

| Modelo | Parametros | Contexto | Licencia | Resultado destacado |
|---|---|---|---|---|
| Timestral-5M | 5M (aproximado, segun model card) | no disponible en la informacion | Modified MIT | GIFT-Eval MASE 0.705; fev-bench SQL 46.19 |
| Timestral-28M | 28M (aproximado, segun model card) | no disponible en la informacion | Modified MIT | GIFT-Eval MASE 0.678; fev-bench SQL 48.42 |
| Timestral-123M | 122.606.720 | 32.768 pasos | Modified MIT | GIFT-Eval MASE 0.659; fev-bench SQL 50.18 |
| Timestral-209M | 209M (aproximado, segun model card) | no disponible en la informacion | Modified MIT | GIFT-Eval MASE 0.658; fev-bench SQL 50.39 |

Frente a otros modelos fundacionales de series temporales de la competencia, la informacion proporcionada no incluye resultados comparativos verificados ni fichas tecnicas de esos modelos, por lo que no es posible ofrecer una comparacion cuantitativa: no disponible.

## Limitaciones y advertencias

- Los resultados de benchmarks estan declarados por el autor y marcados como no verificados (`verified: false`); conviene reproducirlos de forma independiente antes de tomar decisiones de adopcion.
- La licencia es "other", descrita como MIT modificada, e incluye la clausula: "You must not use this model in a manner that infringes, misappropriates, or otherwise violates any third party's rights, including intellectual property rights". Es necesario revisar el texto completo de la licencia antes de un uso comercial.
- Al ser un modelo de forecasting probabilistico, sus salidas son estimaciones con incertidumbre; una mala especificacion de covariables o cambios de regimen no reflejados en el contexto pueden degradar la prediccion. No hay garantia de calibracion de los cuantiles.
- El rendimiento zero-shot depende de la similitud entre la serie objetivo y los datos de preentrenamiento. No se documenta la composicion del dataset de entrenamiento, por lo que no es posible evaluar a priori el riesgo de sesgo de dominio.
- No se documentan sesgos conocidos ni evaluaciones de equidad; en aplicaciones sensibles (credito, seguros, energia) es recomendable auditar las predicciones por subgrupo.
- El modelo no procesa texto: no sirve para tareas de NLP, generacion de lenguaje, codigo ni razonamiento simbolico. Cualquier expectativa en ese sentido es incorrecta.
- No se documentan limitaciones de idioma porque no aplica, pero tampoco se especifica la cobertura de dominios (ventas, energia, finanzas, sensores) del entrenamiento.
- El numero de descargas registrado en HuggingFace es muy bajo (5 descargas, 15 likes), lo que limita la evidencia de uso en produccion y la existencia de una comunidad activa que reporte problemas.
- Para horizontes superiores a 1.024 pasos la generacion es por bloques y autorregresiva, lo que puede acumular error a lo largo del horizonte; no se publican metricas de degradacion por horizonte.
- No hay soporte documentado para backends de servido habituales (vLLM, TGI, llama.cpp, Ollama), lo que puede complicar el despliegue a escala.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mistralai/Timestral-123M
- Pagina principal de la familia Timestral (Timestral-209M): https://huggingface.co/mistralai/Timestral-209M
- Timestral-5M: https://huggingface.co/mistralai/Timestral-5M
- Timestral-28M: https://huggingface.co/mistralai/Timestral-28M
- Licencia (LICENSE en el repositorio): https://huggingface.co/mistralai/Timestral-123M/blob/main/LICENSE
- Leaderboard GIFT-Eval: https://huggingface.co/spaces/Salesforce/GIFT-Eval
- Leaderboard TIME: https://huggingface.co/spaces/Real-TSF/TIME-leaderboard
- Leaderboard fev-bench: https://huggingface.co/spaces/autogluon/fev-bench
- Web de Mistral AI: https://mistral.ai/
- Consola de Mistral AI: https://console.mistral.ai/home
- Chat de Mistral AI: https://chat.mistral.ai/login
