# devankit7873/QJev-1.5B-4bit

## Resumen

QJev-1.5B-4bit es la versión cuantizada a 4 bits (NormalFloat4 mediante bitsandbytes) del modelo QJev-1.5B, desarrollado por el usuario devankit7873. Se presenta como un "motor de decisión System 1": en lugar de generar texto libre, el modelo evalúa un contexto y un conjunto de opciones discretas y devuelve una distribución de probabilidad calibrada sobre cuál es la mejor elección. Está construido sobre una arquitectura Qwen2 de 1.543.714.304 parámetros (aproximadamente 1,54 mil millones) y se distribuye con licencia Apache 2.0.

La propuesta técnica es reducir el coste de inferencia de un transformer de 1,5B a un espacio de 1,07 GB de VRAM y unos 35 ms por pasada forward, de modo que pueda ejecutarse en instancias cloud de bajo coste, dispositivos edge y portátiles de consumo. El modelo se acompaña de un benchmark propio, JevBench, que mide precisión metamórfica sobre tareas de decisión, y de un corpus de destilación (SargeDev/jev-distill-corpus-v3) sobre el que se entrenó la familia.

Es relevante porque explora un nicho poco cubierto: modelos pequeños y cuantizados especializados en selección entre alternativas (clasificación sobre opciones) en lugar de generación abierta, con métricas declaradas de calibración (TVD, divergencia KL) además de accuracy. No obstante, la información pública disponible es escasa y proviene casi exclusivamente de la model card del autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Qwen2 (según tag `qwen2`), cuantizado a 4 bits NF4 con bitsandbytes |
| Parametros totales | 1.543.714.304 (~1,54B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | 4-bit NormalFloat (NF4) vía bitsandbytes |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`model.safetensors`, 1,15 GB) |

## Arquitectura y entrenamiento

El modelo es un transformer denso de la familia Qwen2 con 1,54B de parámetros, cuantizado a 4 bits NF4 mediante bitsandbytes. La model card indica que la cuantización reduce el peso en disco de 3,4 GB (versión completa) a 1,15 GB y la huella de VRAM activa a 1,07 GB, manteniendo la precisión de decisión "dentro del margen" de la versión de precisión completa. No se detalla la longitud de contexto, la composición exacta del dataset ni si hubo fases de RLHF o DPO.

El modelo base (QJev-1.5B) se entrenó sobre el corpus SargeDev/jev-distill-corpus-v3, orientado a destilación de decisiones. La familia incluye una versión completa fusionada (3,08 GB) y un adaptador LoRA (20 MB). La innovación declarada no es arquitectónica sino de propósito: un cabezal de decisión que produce probabilidades sobre un conjunto de opciones, evaluado con métricas de calibración (TVD y divergencia KL) además de accuracy. No se aportan detalles sobre atención lineal, decodificación especulativa ni otras optimizaciones.

## Capacidades

- Selección entre opciones discretas: dado un contexto y una lista de alternativas, devuelve la mejor opción con su probabilidad y la distribución completa.
- Clasificación de decisiones (pipeline `text-classification`) con salida calibrada.
- Razonamiento de "System 1": decisiones rápidas de un solo paso, no cadenas de razonamiento largas.
- Inferencia rápida: ~35 ms por pasada forward según el autor.
- Integración con agentes: los tags incluyen `agent`, lo que sugiere uso como componente de selección de acciones en bucles de agente.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles.
- Capacidades especiales (thinking mode, visión, audio): no disponibles.

## Casos de uso

- Triaje de incidentes en producción: dado un contexto operativo (por ejemplo, CPU al 100% y pool de conexiones agotado) y un conjunto de acciones de remediación, el modelo devuelve la opción más probable con confianza, útil como primer filtro antes de la intervención humana.
- Selección de acciones en agentes: en un bucle de agente, usar QJev como módulo de decisión entre herramientas o rutas candidatas, aprovechando su baja latencia (~35 ms) para no penalizar el ciclo.
- Enrutado de consultas en atención al cliente: clasificar una consulta entrante entre categorías de respuesta predefinidas y derivar al flujo adecuado, con la distribución de probabilidad como señal de incertidumbre.
- Despliegue en edge o portátiles: con 1,07 GB de VRAM, puede ejecutarse en dispositivos con recursos limitados donde un modelo de 3,4 GB no cabría, por ejemplo en un portátil de consumo o una instancia cloud mínima.
- Filtrado y priorización en pipelines de datos: decidir entre etiquetas o acciones candidatas sobre lotes de registros, usando la salida probabilística para ordenar por confianza.
- Evaluación de alternativas en sistemas de recomendación o configuración: dado un contexto y opciones de configuración, seleccionar la más adecuada y exponer la distribución para auditoría.
- Pruebas de calibración en investigación: comparar la distribución de probabilidad del modelo con la de referencia mediante TVD y divergencia KL en experimentos de decisión.

## Benchmarks y rendimiento

| Benchmark | Resultado | Notas |
|---|---|---|
| JevBench (precisión metamórfica) | 71,5% | Puntuación declarada en el badge de la model card; se indica que se mantiene dentro del margen de la versión completa |
| Latencia forward | ~35 ms | Declarada por el autor |
| VRAM activa | 1,07 GB | Declarada por el autor |
| Tamaño en disco | 1,15 GB | `model.safetensors` |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks estándar en la información disponible. No se aportan comparaciones numéricas con modelos similares.

## Requisitos de hardware

- VRAM estimada: ~1,07 GB para inferencia en 4 bits NF4 (dato del autor).
- GPU recomendadas: no especificadas; por huella de memoria cabe en GPU de consumo con 4 GB o más.
- Cabe en GPU de consumo: sí, con 1,07 GB de VRAM activa cabe en tarjetas de gama baja y en portátiles.
- Opciones de despliegue: transformers con bitsandbytes; el autor menciona una librería propia (`qjev`) con `QJev.from_pretrained`. Los tags incluyen `text-embeddings-inference` y `endpoints_compatible`, lo que sugiere compatibilidad con endpoints de Hugging Face. No se confirma soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: ~35 ms por pasada forward (dato del autor); throughput no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Enfoque |
|---|---|---|---|---|---|
| QJev-1.5B-4bit | ~1,54B | No disponible | 4-bit NF4 | Apache 2.0 | Decisión entre opciones (System 1) |
| QJev-1.5B (base) | ~1,54B | No disponible | Completa (3,08 GB) | Apache 2.0 | Decisión entre opciones (System 1) |
| Qwen2-1.5B | ~1,5B | No disponible en esta ficha | Múltiples | Apache 2.0 | Generación de texto general |

No se dispone de datos de rendimiento comparables entre estos modelos en la información proporcionada. La comparativa se limita a parámetros, licencia y propósito.

## Limitaciones y advertencias

- Modelo de nicho: está diseñado para seleccionar entre opciones, no para generación abierta de texto; usarlo como generador general daría resultados pobres.
- Información pública muy escasa: no se documentan contexto, idiomas, datos de entrenamiento ni metodología de evaluación más allá de JevBench.
- JevBench es un benchmark propio del autor; la puntuación de 71,5% no es directamente comparable con benchmarks estándar.
- La cuantización a 4 bits puede degradar la calibración de las probabilidades; el autor afirma que se mantiene el margen, pero no se aportan números de TVD o KL para esta versión.
- Riesgo de alucinación: no evaluado en la información disponible; en tareas de decisión, el riesgo se traduce en seleccionar opciones incorrectas con alta confianza.
- Sesgos conocidos: no documentados.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen2 subyacente.
- Advertencia para producción: con 0 descargas y 0 likes, el modelo no tiene validación comunitaria; conviene evaluarlo en el dominio propio antes de desplegarlo.

## Enlaces

- Hugging Face: https://huggingface.co/devankit7873/QJev-1.5B-4bit
- Modelo base: https://huggingface.co/devankit7873/QJev-1.5B
- Adaptador LoRA: https://huggingface.co/devankit7873/QJev-1.5B-LoRA
- GitHub: https://github.com/AnkitNayak-dev/QJev-1.5B
- JevBench: https://jevbench.github.io/
- Dataset: https://huggingface.co/datasets/SargeDev/jev-distill-corpus-v3
