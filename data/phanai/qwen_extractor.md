# Phanai/qwen_extractor

## Resumen

qwen_extractor es un ajuste fino (LoRA) de Qwen3.5-0.8B desarrollado por Phanai para una tarea muy concreta: extraer titulo y resumen de articulos de noticias tecnologicas en chino, con salida en JSON estricto. El modelo no pretende ser un asistente general, sino un componente de una pipeline de agregacion de noticias que sustituye llamadas a una API en la nube (DeepSeek) por inferencia local en CPU. Con 772.845.888 parametros reales en safetensors, esta pensado para ejecutarse en hardware modesto: el autor lo valida en un portatil de casi diez anos con un AMD R5-2500U y 32 GB de RAM, sin GPU.

La relevancia del proyecto es metodologica mas que de rendimiento bruto: demuestra que con 167 pares de datos reales (cuerpo de noticia + salida del modelo profesor) se puede destilar una tarea estrecha en un modelo sub-1B y obtener resultados cercanos al profesor en titulos (similitud 0.86) y aceptables en resumenes, con coste marginal practicamente nulo y sin enviar texto a terceros. Se distribuye en GGUF Q4_K_M (unos 517 MB para la variante 0.8B y 1,26 GB para la de 2B) bajo licencia Apache-2.0.

El modelo esta disenado exclusivamente para la tarea de extraccion descrita y, segun su propia model card, carece de capacidad de conversacion general. No se han publicado datos sobre longitud de contexto nativa del modelo base dentro de la informacion disponible; la configuracion de despliegue recomendada fija num_ctx en 4096 tokens.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Qwen/Qwen3.5-0.8B), ajuste fino con LoRA |
| Parametros totales | 772.845.888 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion; despliegue recomendado con num_ctx 4096 |
| Tipos de cuantizacion | Q4_K_M (GGUF); pesos base en safetensors |
| Idiomas soportados | Chino (entrada y salida); acepta entrada en ingles y la traduce al chino |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (Q4_K_M) y safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-0.8B, un transformer decoder-only, y se ajusta mediante LoRA con rango 16 aplicado a todas las capas lineales. El entrenamiento se ejecuto en una GPU T4 gratuita de Google Colab con Unsloth, calculando la perdida unicamente sobre la parte de respuesta para evitar que el modelo aprenda a repetir el cuerpo de la noticia, y seleccionando el checkpoint por perdida de validacion para mitigar el sobreajuste. La exportacion final es a GGUF Q4_K_M.

El conjunto de datos es pequeno y de origen productivo: 167 pares (150 de entrenamiento, 17 de validacion) generados archivando automaticamente el cuerpo original de cada noticia junto con la salida de DeepSeek, que actua como modelo profesor. Se anaden algunas muestras sinteticas de la clase SKIP (entradas invalidas). El autor describe un ciclo de "data flywheel": la pipeline archiva nuevas parejas cada dia y los fallos que requieren recurrir a la nube se reinyectan como ejemplos dificiles. No se documenta uso de RLHF ni DPO; el ajuste es SFT supervisado puro.

Una innovacion operativa destacable es que el modelo no incorpora plantilla de chat y debe desplegarse con un TEMPLATE ChatML literal y un system prompt exacto, ambos reproducidos en la model card. Tambien requiere `think:false` en la llamada, porque el modelo base activa modo de razonamiento por defecto y su contenido se filtraria a la salida.

## Capacidades

- Extraccion de titulo (15-30 caracteres) y resumen (nominalmente 120 caracteres, en la practica ~166 de media) en JSON con exactamente dos claves: `新闻标题` y `核心摘要`.
- Deteccion de entradas invalidas (vacio, 404, muro de pago, ruido de navegacion) con salida fija `{"新闻标题":"SKIP","核心摘要":"SKIP"}`.
- Traduccion de noticias en ingles al chino en la salida, con riesgo documentado en conversiones de magnitud (billion/trillion frente a 亿/万亿).
- Preservacion de cifras, unidades, fechas y variaciones interanuales en el resumen, con recall de numeros del profesor del 0,48 y tasa de alucinacion numerica del 0,14.
- Inferencia en CPU pura: 26-30 token/s en un R5-2500U para la variante 0.8B; unos 11 token/s para la de 2B.
- No soporta tool calling, function calling, uso como agente, vision, audio ni conversacion general. La model card lo declara explicitamente fuera de alcance.

## Casos de uso

- Agregador de noticias tecnologicas en produccion: el modelo procesa cada cuerpo de articulo y devuelve titulo y resumen listos para publicar; con 26-30 token/s en CPU cubre las ~150 noticias diarias del autor sin coste de API.
- Sustitucion de APIs en la nube por inferencia local: elimina el gasto recurrente (estimado en 400 yuanes anuales en el caso del autor) y evita enviar texto de terceros a proveedores externos, lo que simplifica el cumplimiento de privacidad.
- Filtrado de articulos invalidos en la pipeline: la salida SKIP permite descartar automaticamente paginas 404, muros de pago y ruido de navegacion antes de almacenar o indexar.
- Normalizacion de fuentes en ingles: traduce y resume noticias angloparlantes al chino para un feed unico, siempre con validacion posterior de magnitudes numericas por el riesgo documentado.
- Generacion de metadatos para busqueda y SEO: los titulos y resumenes estructurados alimentan indices, tarjetas de previsualizacion y boletines sin intervencion manual.
- Prototipado de destilacion de tareas estrechas: sirve como referencia reproducible (notebooks de entrenamiento incluidos) para equipos que quieran sustituir un LLM grande por un modelo pequeno en una tarea acotada con datos propios.
- Despliegue en hardware antiguo o sin GPU: al ocupar 517 MB en Q4_K_M, cabe en portatiles de bajos recursos y en entornos de borde donde no es viable un modelo de 3B o superior.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. El autor aporta evaluaciones propias de la tarea:

| Metrica | Resultado | Contexto |
|---|---|---|
| Aceptacion offline (0.8B) | 15/17 | Validacion de contrato: formato JSON, longitud, numeros, SKIP |
| Aceptacion offline (2B) | 17/17 | Misma validacion; elimina los resumenes sobredimensionados |
| Similitud de titulo con el profesor | 0,86 | Comparacion online contra DeepSeek sobre las mismas noticias |
| Recall de numeros del resumen del profesor | 0,48 | Proporcion de cifras del profesor conservadas |
| Tasa de alucinacion numerica | 0,14 | Cifras del resumen no localizables en el cuerpo |
| Violaciones de disciplina de formato | 0 | Sin fugas de plantilla, titulos en ingles ni scaffolding |
| Longitud media de resumen | 166 caracteres | El profesor promedia 149; el contrato nominal es 120 |
| Velocidad 0.8B en CPU (R5-2500U) | 26-30 token/s | Inferencia local sin GPU |
| Velocidad 2B en CPU (R5-2500U) | ~11 token/s | Aproximadamente 1 minuto por articulo largo |

## Requisitos de hardware

- VRAM/RAM: la variante 0.8B en Q4_K_M ocupa unos 517 MB de pesos; la de 2B, unos 1,26 GB. Con contexto de 4096 tokens conviene reservar al menos 2-4 GB de RAM total para el proceso.
- GPU: no requiere GPU. Funciona en CPU pura; el autor lo valida en un AMD Ryzen 5 2500U con 32 GB de RAM. Cualquier GPU consumer (RTX 3060 en adelante) aceleraria la inferencia, pero no hay cifras publicadas de throughput en GPU.
- GPU consumer: cabe holgadamente en cualquier GPU con 4 GB o mas de VRAM, incluida una GTX 1650 o una RTX 3050 portatil.
- Despliegue: Ollama es la via documentada, con un Modelfile que fija el TEMPLATE ChatML literal, temperature 0.2, num_ctx 4096, num_predict 500 y repeat_penalty 1.05. Tambien es compatible con llama.cpp al ser GGUF. No se documenta soporte verificado de vLLM o TGI en la informacion disponible.
- Latencia: 26-30 token/s en CPU para 0.8B y ~11 token/s para 2B; con salidas de unos 170-200 caracteres chinos, la latencia por articulo se situa en el orden de segundos para 0.8B y cerca de un minuto para 2B en el portatil de referencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Phanai/qwen_extractor (0.8B) | 772,8 M | no disponible (num_ctx 4096 en despliegue) | Extraccion de noticias en JSON, chino | Apache-2.0 | GGUF en Hugging Face |
| Qwen/Qwen3.5-0.8B (base) | ~0,8 B | no disponible | Modelo generalista con modo de razonamiento | no disponible en la informacion | Hugging Face |
| DeepSeek (profesor, API) | no disponible | no disponible | LLM generalista en la nube | no disponible | API comercial |
| Qwen3.5-2B ajustado (misma receta) | ~2 B | no disponible (num_ctx 4096 en despliegue) | Misma tarea, mayor disciplina de salida | Apache-2.0 | GGUF en el mismo repositorio |

La comparacion relevante no es de capacidad general sino de coste por tarea: frente al profesor en la nube, el modelo local iguala en gran medida la calidad de titulos y reduce el coste marginal al consumo electrico, a cambio de peor recall numerico y menor estabilidad entre ejecuciones.

## Limitaciones y advertencias

- El tratamiento de fuentes en ingles es el punto debil principal: la conversion de magnitudes (billion/trillion a 亿/万亿) puede fallar, con casos documentados de escribir 10 billion como 10 亿 o 67 亿 como 670 亿, y pueden colarse palabras en ingles. Los validadores que solo comprueban la presencia de la cifra no detectan estos errores de unidad.
- Inestabilidad entre ejecuciones: con temperature 0.2, aproximadamente la mitad de las veces dos ejecuciones del mismo articulo producen cifras contradictorias. Para consistencia se recomienda decodificacion voraz (temperature 0) o validacion numerica posterior.
- Resumenes mas largos de lo pactado: el contrato pide 120 caracteres, el profesor promedia 149 y el modelo llega ocasionalmente a mas de 200. La restriccion debe aplicarse en la pipeline, no confiarse al modelo.
- Dataset de entrenamiento muy pequeno (167 muestras): generalizacion limitada a formatos poco frecuentes; requiere ampliacion mediante el ciclo de datos.
- SKIP solo cubre los casos definidos en el contrato (vacio, 404, muro de pago, ruido). Las paginas de relleno que son texto coherente se resumen fielmente, por lo que el filtrado de que el texto corresponda a la URL debe hacerse en la capa de scraping.
- La variante 2B mejora la disciplina de formato pero es unas tres veces mas lenta en CPU y su ventaja en fidelidad numerica no se ha evaluado en linea de forma independiente.
- Riesgo de alucinacion numerica del 14 % y recall de cifras del profesor del 48 %: cualquier uso sensible a cifras exactas debe incorporar verificacion contra el cuerpo original.
- El modelo no tiene plantilla de chat embebida; usar la plantilla por defecto de Ollama rompe el formato de salida. Es obligatorio el TEMPLATE ChatML literal y `think:false`.
- No es un modelo conversacional: no debe desplegarse como asistente general ni como agente con herramientas.
- Licencia Apache-2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen3.5-0.8B, no detalladas en la informacion disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phanai/qwen_extractor
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Pesos GGUF 0.8B: https://huggingface.co/Phanai/qwen_extractor/resolve/main/qwen3.5_0.8b_news_extractor_v4.gguf
- Pesos GGUF 2B: https://huggingface.co/Phanai/qwen_extractor/resolve/main/qwen3.5_2b_news_extractor_v4.gguf
- Unsloth (framework de ajuste fino): https://github.com/unslothai/unsloth
- Ollama (runtime de despliegue): https://ollama.com
