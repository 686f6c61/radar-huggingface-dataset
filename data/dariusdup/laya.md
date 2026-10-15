# Dariusdup/laya

## Resumen

Laya es un modelo de clasificación y toma de decisiones de tipo "System 1" no autorregresivo, publicado por el usuario Dariusdup en Hugging Face bajo licencia Apache 2.0. A diferencia de un LLM generativo, recibe un estado (texto, correo, ticket o JSON) junto con preguntas tipadas y devuelve respuestas también tipadas con probabilidades calibradas en una única pasada hacia delante. Según su model card, esa inferencia tarda del orden de 33 ms, el modelo no genera texto libre (por lo que no hay nada que parsear ni margen para alucinar contenido) y está entrenado con aprendizaje por refuerzo contra reglas de puntuación estrictamente propias (RLCD), de modo que declarar probabilidades honestas es la única estrategia que maximiza la recompensa.

El checkpoint alojado en `Dariusdup/laya` tiene 421.293.830 parámetros reales según los pesos en safetensors, con un repositorio de 2,4 GB y pipeline declarado como `text-classification`. La familia se distribuye en varios checkpoints: uno orientado a inglés, otro multilingüe denominado `laya-multilingual` que admite hasta 8.192 tokens con `max_len=8192` (su límite por defecto es de 1.024 tokens), y un checkpoint afinado de terceros, `convaiinnovations/laya-typed-decisions`.

Su relevancia práctica está en el enrutado, la puntuación, los guardarraíles y la moderación: casos en los que se necesita una decisión discreta o una probabilidad calibrada, no texto generado. El soporte declarado es de más de 100 idiomas, con detección de escritura y lengua para enrutar automáticamente el texto no inglés al checkpoint multilingüe. El modelo se distribuye mediante un paquete de Python (`pip install laya`) con extras para servidor HTTP, MCP, LangChain, ONNX Runtime y una ruta rápida en GPU basada en TileLang.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No autorregresiva, "System 1", orientada a decisiones tipadas; detalles internos (familia de encoder, atencion, numero de capas) no disponibles |
| Parametros totales | 421.293.830 (dato real de safetensors) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 1.024 tokens por defecto; hasta 8.192 tokens en `laya-multilingual` con `max_len=8192` |
| Tipos de cuantizacion | No disponible (solo se documenta safetensors y una ruta ONNX Runtime) |
| Idiomas soportados | Mas de 100 idiomas segun la model card (campo de idiomas del repo: no disponible) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors; soporte ONNX mediante el extra `laya[onnx]` |

## Arquitectura y entrenamiento

La model card describe Laya como un modelo de decisión no autorregresivo: dado un estado y un conjunto de preguntas tipadas (`choice`, `score`, `noul`), produce respuestas tipadas con probabilidades calibradas en una sola pasada hacia delante. No se especifica en la información disponible la familia concreta de arquitectura (encoder transformer, número de capas, dimensión oculta, tipo de atención ni mecanismo de agregación de las preguntas), por lo que ese detalle queda como no disponible. El entrenamiento se realizó con aprendizaje por refuerzo contra reglas de puntuación estrictamente propias (RLCD), una formulación en la que la recompensa solo se maximiza reportando probabilidades honestas; no se documentan en el material disponible el número de tokens de entrenamiento ni la composición del dataset.

La familia se organiza en checkpoints especializados y un `Router` que detecta la escritura y el idioma del texto de entrada para enviarlo al checkpoint adecuado (inglés o multilingüe). El material menciona la construcción de datasets de decisión, el ajuste de temperaturas de calibración y la evaluación como parte del bucle de fine-tuning, ejecutable en dos GPU T4 gratuitas de Kaggle. También se documentan innovaciones de tiempo de ejecución más que de arquitectura: una ruta rápida en GPU con TileLang, gestión de buffers de grafos CUDA ante llamadas concurrentes y retroceso a CPU tras errores de memoria insuficiente en CUDA.

## Capacidades

- Clasificación y toma de decisiones tipadas: preguntas de tipo `choice` (elección entre criterios), `score` (puntuación ordinal) y `noul` (probabilidad de que la respuesta sea sí).
- Probabilidades calibradas por construcción: el entrenamiento con RLCD penaliza cualquier desviación de una probabilidad honesta.
- Inferencia en una sola pasada, del orden de 33 ms según la model card, sin decodificación autorregresiva.
- Multilingüismo declarado de más de 100 idiomas, con detección automática de escritura y lengua en el `Router`.
- Procesamiento de documentos largos: hasta 8.192 tokens en `laya-multilingual`, con la advertencia de que la precisión se degrada más allá de unos 4.000 tokens.
- Entradas heterogéneas: texto libre, correos, tickets de soporte y JSON estructurado.
- Integración en aplicaciones: extras para servidor HTTP (`laya[serve]`), servidor MCP (`laya[mcp]`), LangChain y LangGraph (`laya[langchain]`) y ONNX Runtime (`laya[onnx]`).
- Ganchos de predicción y decisiones guiadas por esquema, documentados en el sitio del proyecto.
- No genera texto: no hay salida en lenguaje natural que parsear ni, por diseño, contenido alucinado.
- No se documentan en la información disponible capacidades de visión, audio, tool calling generativo ni modo de razonamiento extendido.

## Casos de uso

- Enrutado de tickets de soporte: el modelo clasifica cada ticket por departamento (`billing`, `technical`, `other`) y devuelve la probabilidad asociada, lo que permite derivar automáticamente a la cola correcta y priorizar por confianza.
- Detección de riesgo de abandono: con una pregunta de tipo `noul` sobre si el usuario amenaza con cancelar, se obtiene una probabilidad calibrada que puede alimentar un sistema de alertas para el equipo de retención.
- Puntuación de urgencia: la pregunta de tipo `score` con criterios ordinales ("no urgente", "pronto", "bloqueante") permite ordenar una cola de incidencias sin depender de que un LLM genere texto parseable.
- Guardarraíles y moderación: evaluación de contenido entrante contra criterios definidos por el equipo, con umbrales de probabilidad explícitos en lugar de respuestas en lenguaje natural.
- Clasificación de correo entrante en flujos de trabajo: el modelo acepta JSON como estado, por lo que puede integrarse directamente en pipelines que ya trabajan con eventos estructurados.
- Procesamiento de documentos largos multilingües: con `laya-multilingual` y `max_len=8192` puede etiquetar contratos, reclamaciones o informes extensos en cualquiera de los idiomas soportados, verificando antes la precisión sobre datos propios.
- Enrutado por idioma en aplicaciones globales: el `Router` decide entre checkpoint inglés y multilingüe, lo que simplifica el despliegue de una única interfaz para tráfico mixto.
- Clasificación de bajo coste en producción: al ser un modelo de 421 millones de parámetros y una sola pasada, es candidato para volúmenes altos donde un LLM generativo resultaría caro o lento.
- Integración en agentes: mediante el extra de LangChain y LangGraph o el servidor MCP, las decisiones tipadas pueden convertirse en pasos de control dentro de un agente mayor.

## Benchmarks y rendimiento

Los únicos datos cuantitativos presentes en la información proporcionada son los siguientes, extraídos de la model card.

| Benchmark | Modelo o variante | Resultado |
|---|---|---|
| Typed-decisions benchmark (2.000 decisiones, cuatro flujos de trabajo) | `convaiinnovations/laya-typed-decisions` (afinado) | 0,766 de exactitud |
| Typed-decisions benchmark (2.000 decisiones, cuatro flujos de trabajo) | Checkpoint base en inglés | 0,362 de exactitud |
| Documentos largos (`laya-multilingual`, hasta ~4.000 tokens, 20 peticiones) | Precisión por longitud | 16 a 18 de 20 respuestas correctas |
| Documentos largos (`laya-multilingual`, mas alla de ~4.000 tokens, 20 peticiones) | Precisión por longitud | 8 a 17 de 20 respuestas correctas |

Datos adicionales declarados: inferencia del orden de 33 ms por pasada hacia delante, y aproximadamente 1,7 s para una entrada de 4.000 tokens en una GPU de Apple. No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks de propósito general, que además no aplicarían a un modelo que no genera texto.

## Requisitos de hardware

- VRAM estimada para los 421 millones de parámetros: aproximadamente 1,7 GB en FP32, unos 0,85 GB en FP16 o BF16 y unos 0,42 GB en INT8, sin contar activaciones ni buffers de la ruta rápida. El repositorio completo ocupa 2,4 GB en disco.
- Cabe con holgura en GPU de consumo: cualquier tarjeta con 4 GB o más de VRAM debería ser suficiente en precisión reducida, incluidas RTX 3060, RTX 4060, RTX 4090 y equivalentes.
- GPU profesionales: A100, H100, L40S y similares son válidas, aunque sobredimensionadas para este tamaño; su interés estaría en el despliegue a gran escala y en la ruta rápida con TileLang.
- Despliegue en CPU: el material menciona explícitamente un retroceso a CPU tras errores de memoria insuficiente en CUDA, por lo que la inferencia en CPU está contemplada.
- GPU de Apple: se reporta una entrada de 4.000 tokens en aproximadamente 1,7 s.
- Opciones de despliegue: paquete `laya` en Python 3.10 o superior, servidor HTTP propio con `laya[serve]`, servidor MCP con `laya[mcp]`, integración con LangChain y LangGraph, y ONNX Runtime con `laya[onnx]`. La ruta rápida en GPU usa TileLang con `laya[fast]`.
- No se documentan cifras de throughput agregado (peticiones por segundo) ni latencias por lote en la información disponible.
- Fine-tuning: el cuaderno oficial se ejecuta en dos GPU T4 gratuitas de Kaggle, lo que da una idea del perfil de recursos necesario para ajustar el modelo a un dominio propio.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Notas |
|---|---|---|---|---|---|
| Laya (`Dariusdup/laya`) | 421.293.830 | 1.024 por defecto; 8.192 en la variante multilingüe | Decision tipada no autorregresiva con probabilidades calibradas | Apache 2.0 | Salida tipada, sin generacion de texto; mas de 100 idiomas declarados |
| XLM-RoBERTa base | 278 millones | No disponible en esta informacion | Clasificacion de texto multilingüe | MIT | Modelo de referencia para clasificacion multilingüe; no ofrece salida tipada ni calibracion por reglas propias |
| mDeBERTa-v3 base | 279 millones | No disponible en esta informacion | Clasificacion y NLU multilingüe | MIT | Alternativa habitual en tareas de clasificacion; requiere cabecera y calibracion propias |
| ModernBERT base | 149 millones | 8.192 tokens | Encoder transformer con contexto largo | Apache 2.0 | Tamano menor y contexto comparable, pero sin capa de decisiones tipadas ni Router integrado |

Los datos de rendimiento de los modelos alternativos no se han proporcionado en la información disponible, por lo que la comparación se limita a tamano, contexto, enfoque y licencia.

## Limitaciones y advertencias

- El contexto por defecto es de 1.024 tokens; con documentos largos hay que pasar `max_len=8192` y usar explícitamente el checkpoint `multilingual`, porque el texto mayoritariamente en inglés se enrutaría al checkpoint inglés.
- La precisión en documentos largos se degrada: según el propio material, por encima de unos 4.000 tokens el número de respuestas correctas varía entre 8 y 17 de 20, por lo que conviene validar sobre datos propios antes de usarlo en producción.
- El modelo es de tipo "System 1" y no genera texto: cualquier tarea que requiera redacción, resumen o razonamiento en lenguaje natural queda fuera de su alcance.
- Las probabilidades están calibradas por el entrenamiento con RLCD, pero siguen siendo estimaciones; no se documentan análisis independientes de calibración ni de sesgo.
- El material no documenta sesgos conocidos ni evaluación de equidad; al ser un modelo multilingüe de más de 100 idiomas, es razonable esperar un rendimiento desigual entre lenguas, aunque no se aportan datos al respecto.
- La exactitud en uso cero disparo es notablemente baja (0,362 en el benchmark de decisiones tipadas) frente al checkpoint afinado (0,766); para dominios concretos el fine-tuning no es opcional si se busca precisión.
- La licencia Apache 2.0 permite uso comercial, y el propio repositorio etiqueta el modelo como `commercial-use`, sin restricciones adicionales documentadas.
- El repositorio registra 0 descargas y 1 like, y su fecha de creación figura como 2026-10-14, posterior a la fecha habitual de consulta; conviene tratar el proyecto como muy reciente y sin adopción consolidada.
- El campo de idiomas del repositorio figura como no disponible, aunque la model card declara más de 100 idiomas; la discrepancia entre ambas fuentes debe tenerse en cuenta.
- No se documentan cuantizaciones publicadas, de modo que el despliegue en entornos con restricciones de memoria exige generar el formato adecuado por cuenta propia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Dariusdup/laya
- Checkpoint afinado de decisiones tipadas: https://huggingface.co/convaiinnovations/laya-typed-decisions
- Repositorio en GitHub: https://github.com/NandhaKishorM/laya
- Documentación del proyecto: https://nandhakishorm.github.io/laya/
- Referencia de la API: https://nandhakishorm.github.io/laya/reference/
- Guía de ganchos de predicción: https://nandhakishorm.github.io/laya/hooks/
- Guía de decisiones guiadas por esquema: https://nandhakishorm.github.io/laya/structured/
- Guía de Docker: https://nandhakishorm.github.io/laya/docker/
- Guía de LangChain y LangGraph: https://nandhakishorm.github.io/laya/langchain/
- Cuaderno de fine-tuning en 2x T4: https://github.com/NandhaKishorM/laya/blob/main/notebooks/laya_finetune_typed_decisions_2xT4_kaggle.ipynb
- Script de evaluación en contexto largo: https://github.com/NandhaKishorM/laya/blob/main/research/scripts/bench_long_context.py
- Sección de instalación detallada: https://github.com/NandhaKishorM/laya#installation-details
- Sección de fine-tuning: https://github.com/NandhaKishorM/laya#fine-tuning
- Imagen de precisión en documentos largos: https://raw.githubusercontent.com/NandhaKishorM/laya/main/assets/long_context_8192.png
