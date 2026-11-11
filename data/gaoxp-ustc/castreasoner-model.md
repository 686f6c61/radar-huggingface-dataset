# Gaoxp-USTC/CastReasoner-Model

## Resumen

CastReasoner-Model es un repositorio de Hugging Face asociado al proyecto CastReasoner, un modelo de 9B parámetros orientado a series temporales y predicción (forecasting). Lo publica el usuario Gaoxp-USTC y, en el momento de redactar esta ficha, el repositorio está inicializado pero los pesos y los ficheros de inferencia aún no se han subido. Por tanto, no existe todavía un artefacto descargable ni una model card con detalles técnicos más allá de la declaración de tamaño y propósito.

La relevancia del proyecto radica en su planteamiento: aplicar un modelo de lenguaje de escala media (9B) a tareas de forecasting de series temporales, un área donde predominan arquitecturas específicas (PatchTST, TimesNet, modelos lineales ligeros) y donde los LLM se han incorporado más recientemente como razonadores o tokenizadores de series. El nombre "CastReasoner" sugiere un enfoque de razonamiento aplicado a la predicción, aunque no hay documentación pública que lo confirme.

La información disponible es mínima: se conocen el identificador del repositorio, el autor, las etiquetas (time-series, forecasting), el idioma declarado (inglés) y la existencia de un repositorio de datos complementario (CastReasoner-Datasets). No se han publicado arquitectura, contexto, licencia, benchmarks ni instrucciones de uso. Cualquier evaluación técnica rigurosa debe posponerse hasta que el autor publique los pesos y la documentación.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 9B (según la model card) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en |
| Licencia | no disponible |
| Formato de pesos | no disponible (los pesos aún no se han subido) |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura interna del modelo. La model card únicamente declara que se trata de un modelo de 9B parámetros para forecasting de series temporales, sin especificar si emplea un transformer decoder, un encoder híbrido, un esquema de tokenización de series o un mecanismo de razonamiento explícito. Tampoco se detallan los datos de entrenamiento, el número de tokens, la composición del corpus ni si hubo etapas de ajuste supervisado, RLHF o DPO.

El repositorio complementario CastReasoner-Datasets sugiere que el proyecto incluye un conjunto de datos propio para el entrenamiento o la evaluación, pero no se ha publicado su contenido ni su tamaño. No hay información sobre innovaciones técnicas como decodificación especulativa, atención lineal o mecanismos de fusión multimodal entre texto y series temporales.

## Capacidades

- Predicción de series temporales (forecasting), según la declaración del autor.
- Procesamiento de texto en inglés, a partir de la etiqueta de idioma del repositorio.
- No se ha documentado soporte de tool calling ni de function calling.
- No se ha documentado soporte de agentes ni de razonamiento multi-paso, pese a que el nombre "Reasoner" lo sugiera.
- No se ha documentado capacidad multilingüe más allá del inglés.
- No se ha documentado capacidad de visión, audio ni modos de razonamiento explícito (thinking mode).
- No se ha documentado capacidad de generación de código ni de matemáticas.

## Casos de uso

- Predicción de demanda energética: un modelo de 9B podría emplearse para modelar series de consumo eléctrico horario y generar previsiones a corto plazo, si bien no hay evidencia publicada de su rendimiento en este dominio.
- Forecasting financiero: estimación de series de precios o volúmenes a partir de ventanas históricas, condicionada a la disponibilidad futura de los pesos y de documentación sobre el formato de entrada.
- Planificación de capacidad en infraestructuras: predicción de métricas de uso (CPU, memoria, tráfico de red) para escalado proactivo, siempre que el modelo acepte series multivariantes.
- Gestión de inventario: previsión de ventas por producto y tienda a partir de históricos, aprovechando la etiqueta de forecasting del repositorio.
- Investigación académica en series temporales: uso como baseline de 9B para comparar con arquitecturas especializadas (PatchTST, TimesNet, iTransformer) una vez publicados los pesos.
- Experimentación con modelos de razonamiento aplicado a series: el nombre CastReasoner sugiere un enfoque de razonamiento sobre representaciones temporales, que podría explorarse en entornos de investigación una vez disponible el modelo.

En todos los casos, la viabilidad práctica está condicionada a que el autor publique los pesos, la licencia y las instrucciones de inferencia, que en la información disponible no existen.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 18 GB para 9B parámetros, cálculo teórico estándar (2 bytes por parámetro) que no ha sido confirmado por el autor.
- VRAM estimada en cuantización de 8 bits: en torno a 9-10 GB, sujeto a que se publiquen pesos cuantizados.
- VRAM estimada en cuantización de 4 bits: en torno a 5-6 GB, igualmente condicionada a la disponibilidad de GGUF u otros formatos.
- GPU recomendadas: no disponibles; por tamaño, un modelo de 9B en FP16 encajaría en A100 40 GB, H100 80 GB, L40S 48 GB o RTX 4090 24 GB.
- Compatibilidad con GPU de consumo: probable en RTX 4090 (24 GB) en FP16 y en GPUs de 8-12 GB con cuantización de 4-8 bits, siempre que se publiquen los pesos.
- Opciones de despliegue: no disponibles; no se ha confirmado compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada modelos comparables de la misma categoría (LLM de 9B aplicado a forecasting de series temporales), ni se dispone de datos de rendimiento del modelo para establecer una comparación con alternativas especializadas como PatchTST, TimesNet o iTransformer.

## Limitaciones y advertencias

- El repositorio no contiene pesos ni ficheros de inferencia: la model card indica explícitamente que están pendientes de subida, por lo que el modelo no es utilizable en la actualidad.
- No se ha publicado licencia, lo que impide determinar si el uso comercial está permitido.
- No hay información sobre sesgos, datos de entrenamiento ni procedencia del corpus, lo que impide evaluar riesgos de sesgo.
- El riesgo de alucinación es desconocido; en modelos aplicados a series temporales, la generación de valores plausibles pero incorrectos es un riesgo relevante que requeriría validación con métricas de error (MAE, RMSE, MAPE).
- El único idioma declarado es el inglés, lo que limita su uso en entornos en castellano sin evaluación adicional.
- No se ha documentado el formato de entrada de las series temporales (longitud de ventana, número de variables, normalización), lo que impide planificar su integración en producción.
- El repositorio tiene 0 descargas y 0 likes, y fue creado y actualizado el mismo día (2026-11-11), lo que indica un estado muy incipiente.
- No se han publicado benchmarks, por lo que no es posible verificar la calidad de las predicciones frente a alternativas establecidas.

## Enlaces

- Repositorio del modelo en Hugging Face: https://huggingface.co/Gaoxp-USTC/CastReasoner-Model
- Repositorio de datos complementario: https://huggingface.co/datasets/Gaoxp-USTC/CastReasoner-Datasets
