# RedHatAI/GLM-5.3-speculator.dspark

## Resumen

RedHatAI/GLM-5.3-speculator.dspark es un modelo borrador (*speculator*) para decodificacion especulativa sobre zai-org/GLM-5.3, desarrollado por Red Hat AI. No es un modelo de lenguaje autonomo: es un componente auxiliar de 1.249.565.313 parametros que propone hasta 8 tokens por paso de decodificacion, que el modelo objetivo GLM-5.3 verifica despues. Su proposito es reducir la latencia de inferencia de GLM-5.3 sin alterar la distribucion de salida del modelo verificado.

Tecnicamente implementa el algoritmo DSpark, una extension de DFlash que anade una cabeza de Markov (rango 256) para modelar dependencias entre tokens dentro del bloque propuesto, y una cabeza de confianza que predice la probabilidad de aceptacion posicion a posicion. El borrador es un backbone de 3 capas estilo Qwen3 que consume estados ocultos auxiliares de las capas 2, 20, 39, 58 y 75 del modelo objetivo, y opera con el vocabulario de 154880 entradas de GLM-5.3.

Es relevante porque GLM-5.3 admite una ventana de contexto nativa de 1.048.576 tokens, escenario donde la decodificacion autoregresiva es especialmente costosa. El modelo fue entrenado con la libreria Speculators (version 0.7.0.dev108) y publicado el 16 de septiembre de 2026 en formato safetensors bfloat16, con licencia heredada glm-5.3.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DSparkDraftModel (borrador de 3 capas con backbone estilo Qwen3); modelo objetivo: GlmMoeDsaForCausalLM |
| Parametros totales | 1.249.565.313 (~1,25 mil millones) |
| Parametros activos | no disponible |
| Longitud de contexto | 1.048.576 tokens (contexto nativo de GLM-5.3) |
| Tipos de cuantizacion | no disponible (pesos publicados en bfloat16) |
| Idiomas soportados | no disponible |
| Licencia | glm-5.3 (licencia personalizada, declarada como `other`) |
| Formato de pesos | safetensors (bfloat16) |
| Libreria | speculators |
| Longitud maxima de borrador | 8 tokens |
| Capas objetivo auxiliares | 2, 20, 39, 58, 75 |
| Tamano del vocabulario del borrador | 154880 |
| Cabeza de Markov | vanilla, rango 256 |
| Cabeza de confianza | activada, con caracteristicas de Markov |
| Longitud de secuencia de entrenamiento | 8192 |
| Anchors maximos | 1024 |
| Modelo base | zai-org/GLM-5.3 |
| Hardware de validacion | 8x NVIDIA B300, TP=4 |
| Fecha de publicacion | 2026-09-16 (version 1.0) |
| Tamano del repositorio | 2,5 GB |

## Arquitectura y entrenamiento

DSpark es un metodo de decodificacion especulativa que extiende DFlash con dos componentes adicionales: una cabeza de Markov que modela las dependencias entre tokens dentro del bloque propuesto, y una cabeza de confianza que estima la probabilidad de aceptacion de cada posicion del bloque. El borrador tiene 3 capas y consume estados ocultos auxiliares extraidos de las capas 2, 20, 39, 58 y 75 de GLM-5.3, lo que le permite alinearse con representaciones intermedias del modelo objetivo en lugar de depender solo de la capa de salida. La funcion de perdida combina entropia cruzada y una distancia de variacion total con pesos `{"ce":0.1,"tv":0.9}`.

El entrenamiento se realizo con la libreria Speculators (0.7.0.dev108) sobre 1.811.739 secuencias de 8.192 tokens, durante una epoca completa y 88.226 pasos de optimizador, con tasa de aprendizaje 1e-4 y `fsdp-shard` sobre 4 rangos FSDP. El checkpoint se inicializo en caliente (*warm start*) desde un checkpoint GLM-5.3 D-Spark previo. La extraccion de estados ocultos se ejecuto a traves de vLLM en paralelo con el entrenamiento del borrador, con `max-anchors` 1024 y `confidence-head-alpha` 1.0. La validacion se llevo a cabo sobre 8 GPU NVIDIA B300 con tensor parallelism 4.

## Capacidades

- Decodificacion especulativa: propone hasta 8 tokens por paso, verificados posteriormente por GLM-5.3, sin modificar la distribucion de salida del modelo objetivo.
- Prediccion de aceptacion por posicion: la cabeza de confianza permite estimar que tokens del bloque tienen mayor probabilidad de ser aceptados.
- Soporte de contexto largo: funciona con la ventana nativa de 1.048.576 tokens de GLM-5.3, incluido el tramo de 524K a 1M tokens.
- Rendimiento dependiente de la tarea: la tasa de aceptacion varia de forma significativa segun el tipo de contenido generado (mayor en razonamiento matematico, menor en respuestas conversacionales).
- Integracion con vLLM: se despliega mediante `--speculative-config` con `method: dspark` y `num_speculative_tokens: 8`.
- No genera texto de forma autonoma, no soporta tool calling por si mismo, no es multimodal y no tiene modo de razonamiento propio. Estas capacidades corresponden al modelo objetivo GLM-5.3.
- Idiomas soportados: no disponible.

## Casos de uso

- Servicio de inferencia de GLM-5.3 con vLLM: el borrador se acopla al modelo objetivo mediante `--speculative-config` para reducir la latencia por token en despliegues de produccion, manteniendo la misma salida verificada.
- Asistentes de generacion de codigo: en HumanEval la longitud media de aceptacion es de 4,76 tokens, con un 85,4 % de aceptacion en la primera posicion, lo que acelera la generacion de bloques de codigo repetitivos y autocompletado en IDE.
- Razonamiento matematico y cadenas de pensamiento: en el conjunto math_reasoning la longitud media de aceptacion alcanza 6,13 tokens, el valor mas alto de todos los medidos, lo que resulta adecuado para pipelines de resolucion de problemas paso a paso.
- Recuperacion aumentada (RAG) sobre documentos largos: con longitudes de aceptacion de 3,74 tokens en el conjunto rag y una tasa de aceptacion del 41,2 % en el tramo de 524K a 1M tokens, permite servir consultas sobre corpus extensos con menor coste por peticion.
- Agentes con llamadas a herramientas: en el conjunto tool_call la aceptacion media es de 4,01 tokens, lo que reduce la latencia acumulada en flujos de multiples pasos con esquemas JSON repetitivos.
- Resumen y traduccion por lotes: aceptaciones medias de 3,92 y 4,16 tokens respectivamente, utiles en procesos batch donde el ahorro de computo agregado es prioritario frente a la latencia individual.
- Atencion al cliente multi-turno: reduccion del coste de decodificacion en conversaciones de alto volumen, aunque el conjunto qa registra la aceptacion mas baja (3,18 tokens) y por tanto el beneficio es menor que en tareas de codigo o matematicas.

## Benchmarks y rendimiento

Tasas de aceptacion por posicion dentro del bloque de 8 tokens, segun los datos publicados por el autor:

| Dataset | Longitud de aceptacion | Pos 0 | Pos 1 | Pos 2 | Pos 3 | Pos 4 | Pos 5 | Pos 6 | Pos 7 |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| HumanEval | 4,76 | 85,4 % | 70,0 % | 56,9 % | 46,4 % | 38,1 % | 31,6 % | 26,2 % | 21,8 % |
| math_reasoning | 6,13 | 92,7 % | 83,9 % | 75,3 % | 66,4 % | 59,3 % | 51,8 % | 44,7 % | 38,3 % |
| qa | 3,18 | 74,5 % | 51,9 % | 34,8 % | 22,8 % | 14,8 % | 9,4 % | 5,9 % | 3,8 % |
| question | 3,20 | 73,1 % | 49,7 % | 33,6 % | 22,8 % | 15,9 % | 11,2 % | 8,0 % | 5,8 % |
| rag | 3,74 | 78,8 % | 59,5 % | 43,6 % | 32,0 % | 23,4 % | 16,8 % | 11,9 % | 8,2 % |
| summarization | 3,92 | 83,4 % | 65,3 % | 48,5 % | 35,5 % | 25,0 % | 16,8 % | 10,6 % | 6,4 % |
| tool_call | 4,01 | 79,2 % | 60,1 % | 45,3 % | 34,6 % | 26,9 % | 21,6 % | 17,9 % | 15,0 % |
| translation | 4,16 | 82,7 % | 66,1 % | 52,1 % | 39,6 % | 29,7 % | 20,8 % | 14,7 % | 10,2 % |
| writing | 3,19 | 72,8 % | 49,4 % | 33,4 % | 22,8 % | 15,9 % | 11,2 % | 8,1 % | 6,0 % |

Aceptacion en prompts MRCR de 2 agujas, por longitud de contexto de entrada:

| Contexto | Peticiones | Tasa de aceptacion | Longitud de aceptacion |
| --- | ---: | ---: | ---: |
| 0-4K | 15 | 75,0 % | 7,00 |
| 4K-8K | 18 | 55,2 % | 5,42 |
| 8K-16K | 21 | 47,9 % | 4,83 |
| 16K-32K | 19 | 49,0 % | 4,92 |
| 32K-64K | 20 | 40,6 % | 4,25 |
| 64K-131K | 21 | 42,4 % | 4,40 |
| 131K-262K | 21 | 37,5 % | 4,00 |
| 262K-524K | 21 | 39,9 % | 4,19 |
| 524K-1M | 19 | 41,2 % | 4,29 |

No se han publicado en la informacion disponible resultados de benchmarks de calidad (MMLU, GSM8K u otros) para el modelo objetivo en esta ficha, ni cifras numericas de la comparativa frente a MTP: la model card solo incluye una grafica comparativa de interactividad y throughput agregado sin valores tabulados.

## Requisitos de hardware

- VRAM para el borrador: aproximadamente 2,5 GB en bfloat16 para los 1.249.565.313 parametros (el repositorio completo ocupa 2,5 GB), mas la cache KV correspondiente a 3 capas.
- VRAM total del sistema: la determinante es la del modelo objetivo GLM-5.3, que no se especifica en la informacion disponible; el borrador anade un coste marginal.
- GPU recomendadas: la validacion oficial se realizo sobre 8x NVIDIA B300 con tensor parallelism 4; el ejemplo de despliegue de la model card usa tensor parallelism 8.
- GPU de consumo: el borrador por si solo cabe en cualquier GPU consumer con mas de 3 GB de VRAM, pero no es util sin el modelo objetivo completo, cuyo requisito no esta disponible.
- Opciones de despliegue: vLLM con `--speculative-config '{"model":"...","num_speculative_tokens":8,"method":"dspark"}'`. No se documentan integraciones con llama.cpp, Ollama o TGI.
- Latencia y throughput: la model card incluye una grafica de interactividad (mediana de tokens de salida por peticion) y throughput agregado frente a MTP, pero no se proporcionan valores numericos en el texto disponible.
- Aceleracion esperada: proporcional a la longitud media de aceptacion, entre 3,18 y 6,13 tokens aceptados por paso segun la tarea, frente a los 8 tokens maximos propuestos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Metodo | Rendimiento | Licencia | Disponibilidad |
| --- | --- | --- | --- | --- | --- | --- |
| RedHatAI/GLM-5.3-speculator.dspark | 1.249.565.313 | 1.048.576 tokens | DSpark (DFlash + cabeza de Markov y de confianza) | Longitud de aceptacion 3,18-6,13 segun tarea; 41,2 % en 524K-1M | glm-5.3 (personalizada) | HuggingFace, libreria speculators |
| MTP (multi-token prediction) de GLM-5.3 | no disponible | no disponible | Prediccion multi-token | La model card incluye una grafica comparativa frente a DSpark, sin valores numericos publicados | no disponible | no disponible |
| Otros speculators (DFlash, EAGLE, Medusa) | no disponible | no disponible | Decodificacion especulativa | no disponible | no disponible | no disponible |

No se dispone de datos comparativos adicionales en la informacion proporcionada.

## Limitaciones y advertencias

- Dependencia estricta del modelo objetivo: el borrador solo funciona acoplado a zai-org/GLM-5.3; no es util con otros modelos ni de forma independiente.
- Rendimiento desigual por tarea: las tasas de aceptacion mas bajas se dan en qa (3,18), writing (3,19) y question (3,20), donde el beneficio de la decodificacion especulativa es notablemente menor que en math_reasoning (6,13).
- Degradacion con contexto largo: la tasa de aceptacion cae del 75,0 % en el tramo de 0-4K al 37,5 % en 131K-262K, con una recuperacion parcial hasta el 41,2 % en 524K-1M. En ventanas muy largas el factor de aceleracion se reduce aproximadamente a la mitad.
- Licencia: se declara como `glm-5.3` con nombre de licencia personalizada y etiqueta `other`. No se detallan en la informacion disponible las condiciones de uso comercial, por lo que es necesario revisar el texto completo de la licencia antes de desplegarlo en produccion.
- Inconsistencia en la documentacion: el comando de despliegue de la model card referencia el identificador `shanjiaz/GLM-5.3-speculator.dspark`, distinto del repositorio `RedHatAI/GLM-5.3-speculator.dspark`. Conviene verificar el identificador correcto antes de desplegar.
- Requiere codigo personalizado: el repositorio incluye la etiqueta `custom_code` y depende de la libreria `speculators` (0.7.0.dev108), lo que puede complicar la integracion con herramientas que no soporten codigo remoto.
- Validacion limitada por la comunidad: 8 descargas y 1 like en el momento de la consulta, sin informes independientes de reproducibilidad.
- No hay informacion sobre sesgos, idiomas soportados, cuantizacion ni uso en produccion mas alla de lo indicado por el autor.
- Riesgo de alucinacion: no aplica directamente al borrador, ya que la verificacion la realiza GLM-5.3; el riesgo reside en el modelo objetivo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/RedHatAI/GLM-5.3-speculator.dspark
- Modelo base: https://huggingface.co/zai-org/GLM-5.3
- Libreria Speculators: https://github.com/vllm-project/speculators
- Grafica comparativa frente a MTP incluida en la model card: https://cdn-uploads.huggingface.co/production/uploads/67f401f4bb5b52cdad90f9a7/MF_b-3iRP0FlzLj_PxYCp.png
- Resultados de la busqueda web: no se han encontrado enlaces relevantes al modelo; los resultados devueltos corresponden a paginas de Microsoft Store sin relacion con la ficha.
