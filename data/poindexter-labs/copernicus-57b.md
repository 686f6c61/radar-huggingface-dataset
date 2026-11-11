# Poindexter-Labs/Copernicus-57B

## Resumen

Copernicus (57B) es un modelo de decisión desarrollado por Poindexter Labs, diseñado para aplicaciones que necesitan decisiones estructuradas a partir de contexto en lenguaje natural. No es un modelo generativo al uso: en lugar de producir texto libre, devuelve tipos de respuesta explícitos y distribuciones de probabilidad sobre las opciones que la aplicación le proporciona. Combina dos componentes, uno basado en Gemma y otro basado en Qwen, sumando aproximadamente 57 mil millones de parámetros entre ambos.

El modelo sigue un diseño de inferencia en dos partes inspirado en REAX 1.3, y se sirve mediante el llamado Copernicus Engine, que expone un endpoint compatible con `/v1/systemone`. Soporta tres tipos de respuesta: `choice` (seleccionar una opción de un conjunto explícito), `noul` (evaluar una proposición de sí/no) y `score` (puntuar un elemento contra una rúbrica ordenada).

Es relevante ahora porque aborda una tarea concreta y recurrente en sistemas basados en agentes: la toma de decisiones estructuradas y la asignación de probabilidades calibradas sobre alternativas, en lugar de la generación de texto. Su licencia Apache 2.0 y su orientación a enrutamiento de agentes, selección de herramientas, clasificación y verificación lo hacen potencialmente útil para prototipado e investigación, si bien su despliegue exige hardware de gama alta (96 GB de VRAM en la configuración de referencia).

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Dos componentes de decisión (uno basado en Gemma, otro en Qwen) con diseño de inferencia en dos partes inspirado en REAX 1.3 |
| Parametros totales | Aproximadamente 57 mil millones, repartidos entre los dos componentes |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (la model card menciona que el proceso de carga y cuantización puede tardar varios minutos, sin detallar los tipos) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repositorio de 114,8 GB, requiere aproximadamente 110 GB de disco) |

## Arquitectura y entrenamiento

Copernicus no es un transformer generativo convencional, sino un modelo de decisión que combina dos componentes: uno basado en Gemma y otro basado en Qwen. Su diseño de inferencia en dos partes está inspirado en REAX 1.3. El modelo recibe texto y contexto estructurado serializable en JSON, y produce respuestas tipadas con distribuciones de probabilidad sobre las opciones o niveles que define la aplicación. La implementación de referencia es el Copernicus Engine, que requiere tanto el directorio `part-g/` como `part-q/` del repositorio del modelo.

La información disponible no detalla el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO. Tampoco se especifican innovaciones como decodificación especulativa o atención lineal. El runtime de referencia utiliza kernels de la comunidad (por ejemplo, `kernels-community/finegrained-fp8`), lo que sugiere el uso de cuantización FP8 de grano fino en la inferencia, aunque la model card no lo describe explícitamente.

## Capacidades

- Toma de decisiones estructuradas con tres tipos de respuesta: `choice` (selección de una opción con probabilidades), `noul` (probabilidad de que una proposición sea verdadera) y `score` (puntuación esperada y probabilidades por nivel contra una rúbrica ordenada).
- Clasificación de texto (pipeline declarado: `text-classification`).
- Enrutamiento de agentes y selección de herramientas a partir de contexto en lenguaje natural.
- Verificación de proposiciones y evaluación de condiciones.
- Procesamiento de contexto estructurado serializable en JSON además de texto libre.
- Interfaz de servicio mediante endpoint compatible con `/v1/systemone`.
- No se documentan capacidades de generación de texto libre, código, matemáticas, visión, audio ni tool calling en el sentido habitual; el modelo está orientado exclusivamente a la emisión de decisiones.

## Casos de uso

- Enrutamiento de tickets de soporte: el modelo recibe la descripción del caso y un conjunto de equipos con sus criterios, y devuelve la opción seleccionada junto con las probabilidades de cada equipo, lo que permite umbrales de confianza y escalado a revisión humana.
- Selección de herramientas en agentes: dado el estado de la conversación y un catálogo de herramientas con sus descripciones, el modelo emite una distribución de probabilidad sobre qué herramienta invocar, facilitando políticas de enrutamiento con margen de confianza.
- Clasificación con probabilidades calibradas: en lugar de una etiqueta única, se obtiene la distribución sobre las categorías definidas por la aplicación, útil para sistemas que necesitan abstenerse o derivar casos ambiguos.
- Verificación de condiciones de negocio: con el tipo `noul`, se evalúa si una proposición (por ejemplo, si un pedido está listo para enviarse) es verdadera a partir de un estado estructurado en JSON.
- Evaluación con rúbricas ordenadas: con el tipo `score`, se asigna una puntuación esperada y probabilidades por nivel, aplicable a priorización de incidencias, triaje de urgencia o control de calidad.
- Prototipado e investigación en modelos de decisión: sirve como base para estudiar calibración, enrutamiento y verificación en pipelines de agentes, con implementación de referencia abierta en GitHub.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: la configuración de referencia utiliza una única GPU NVIDIA de 96 GB; no se detallan estimaciones para cuantizaciones menores.
- GPU recomendadas: GPU NVIDIA de 96 GB (por ejemplo, H100 de 80 GB no alcanzaría según la configuración indicada; se requiere una tarjeta de 96 GB como la H200 o similar). No se documenta compatibilidad con GPUs de consumo.
- Cabe en consumer GPU: no disponible; la configuración publicada exige 96 GB de VRAM, muy por encima de las RTX 4090 (24 GB) o similares.
- Almacenamiento: aproximadamente 110 GB de disco para los archivos del modelo, más espacio para paquetes y temporales.
- Entorno: Linux, Python 3.11, controlador NVIDIA compatible con CUDA 13, PyTorch 2.11.0 (build cu130), transformers 5.14.1, accelerate 1.15.0, safetensors 0.8.0, kernels 0.16.0 y huggingface-hub 1.33.0.
- Opciones de despliegue: el servidor de referencia es `copernicus_serve.py` del Copernicus Engine, que expone un endpoint local compatible con `/v1/systemone`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. El ejemplo de Python usa un timeout de 1800 segundos, y la carga y cuantización del modelo pueden tardar varios minutos.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tipo de tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Copernicus (57B) | ~57B en dos componentes | no disponible | Decisión estructurada (`choice`, `noul`, `score`) | Apache 2.0 | Hugging Face y Copernicus Engine en GitHub |
| REAX 1.3 | no disponible | no disponible | Modelo de decisión; inspiración del diseño de inferencia en dos partes | no disponible | Hugging Face (`decisionmodels/REAX-1.3`) |

No se dispone de datos de benchmarks ni de especificaciones detalladas de REAX 1.3 en la información proporcionada, por lo que no es posible una comparación cuantitativa. No se identifican otras alternativas comparables en la información disponible.

## Limitaciones y advertencias

- El modelo solo declara soporte para inglés; no se documentan capacidades multilingües.
- No se detallan sesgos conocidos, pero al ser un modelo entrenado sobre datos no especificados, existe riesgo de sesgo no caracterizado.
- Riesgo de alucinación: no documentado explícitamente; al emitir distribuciones de probabilidad, la calibración de las mismas no está validada en la información disponible.
- La longitud de contexto no está publicada, lo que dificulta planificar casos con contextos largos.
- El despliegue requiere hardware especializado (GPU de 96 GB) y un stack de dependencias muy concreto (versiones fijas de PyTorch, transformers, CUDA 13), lo que limita su uso en entornos convencionales.
- La licencia Apache 2.0 permite uso comercial, pero la model card recomienda evaluar la idoneidad del modelo para cada caso de uso concreto.
- El modelo no es generativo: no debe esperarse de él generación de texto, código ni razonamiento conversacional; usarlo fuera de su interfaz de decisiones estructuradas no está soportado por la documentación.
- El repositorio presenta 0 descargas y 0 likes en el momento de la consulta, lo que indica una adopción todavía nula y ausencia de validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Poindexter-Labs/Copernicus-57B
- Sitio web de Poindexter Labs: https://www.poindexterlabs.ai/
- Copernicus Engine (implementación de referencia): https://github.com/poindexter-stk/copernicus-engine/tree/copernicus-57b
- Repositorio reax-subnet: https://github.com/reaxlabs/reax-subnet
- REAX 1.3 (modelo de referencia): https://huggingface.co/decisionmodels/REAX-1.3
