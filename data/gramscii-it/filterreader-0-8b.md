# Gramscii-IT/FilterReader-0.8B

## Resumen

FilterReader-0.8B es un adaptador LoRA entrenado sobre Qwen3.5-0.8B por Gramscii-IT, cuyo propósito es extraer los filtros de una consulta de búsqueda y expresarlos con los códigos exactos que declara un catálogo: lugares, tipos, tamaños, importes, fechas y estados. El modelo no genera texto libre, sino líneas Markdown en el formato propio del catálogo, que el motor que lo invoca lee y valida; un código no declarado o un importe no escrito en la petición se rechaza en esa comprobación posterior.

El modelo es un SLM (small language model) de 10.822.656 parámetros totales según safetensors, distribuido como adaptador sobre una base Qwen3.5-0.8B. Está orientado a un dominio muy concreto: la comprensión de consultas estructuradas en catálogos de subvenciones y licitaciones públicas italianas, y en catálogos inmobiliarios. Los idiomas declarados son italiano e inglés, y la licencia es Apache 2.0.

Su relevancia práctica radica en que resuelve una tarea de extracción estructurada con un coste computacional mínimo y con verificación determinista en el lado del motor. El autor declara que Gramscii lo sirve junto al adaptador base en cuantización Q8_0, con decodificación greedy y modo de razonamiento desactivado, junto a otros adaptadores de reparación, desempate y traducción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3.5-0.8B) con adaptador LoRA |
| Parametros totales | 10.822.656 (según safetensors del adaptador) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF; base servida en Q8_0 según el autor |
| Idiomas soportados | italiano (it), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (tag declarado); adaptador LoRA sobre Qwen/Qwen3.5-0.8B |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA sobre la base Qwen3.5-0.8B, un transformer decoder-only de la familia Qwen3.5. La innovación no reside en la arquitectura de la base, sino en el proceso de destilación y en el contrato de salida: el adaptador aprende a producir únicamente los filtros presentes en la petición, codificados con los valores declarados por el catálogo, en el formato Markdown que el motor consumidor sabe interpretar y validar.

El conjunto de entrenamiento consta de 7.628 lecturas de filtros, 5.018 en italiano y 2.610 en inglés, generadas por Qwen 27B a través del propio lector de filtros del motor de Gramscii y conservadas solo cuando las comprobaciones del motor las aceptaban. De ellas, 2.247 son búsquedas inmobiliarias extraídas de los valores declarados de un catálogo de agencia inmobiliaria, retenidas solo si la lectura nombraba exactamente los códigos sorteados. Se reservaron 786 lecturas para validación. El entrenamiento consistió en una época sobre Leonardo (CINECA). No se documenta en la información disponible el uso de RLHF o DPO.

## Capacidades

- Extracción de filtros de consultas de búsqueda: lugares, tipos, tamaños, importes, fechas y estados, cada uno con el código que el catálogo declara.
- Generación de salida estructurada en líneas Markdown en el formato del catálogo, legibles y verificables por el motor.
- Abstención controlada: no emite códigos que el catálogo no declare ni importes que la petición no escriba, ya que el motor rechaza esas salidas.
- Comprensión de consultas en italiano e inglés sobre catálogos de subvenciones y licitaciones públicas italianas y de inmuebles.
- Integración en un pipeline multi-adaptador: el autor lo sirve junto a adaptadores de reparación, desempate y traducción sobre la misma base.
- Decodificación greedy con modo de razonamiento desactivado en el despliegue de referencia.
- No se documentan en la información disponible capacidades de tool calling, agentes, visión, audio ni matemáticas generales.

## Casos de uso

- Búsqueda estructurada en portales de subvenciones y licitaciones públicas: el modelo traduce una pregunta en lenguaje natural («¿qué ayudas hay para pymes en Lombardía con importe superior a 50.000 euros?») en los filtros exactos del catálogo, que el motor aplica directamente a la consulta indexada.
- Buscador inmobiliario de agencia: a partir de una petición escrita en el cuadro de búsqueda, extrae tipo de operación, zona, superficie, precio y estado usando los códigos declarados por el catálogo del portal.
- Normalización de consultas en Atención al usuario: convierte texto libre de usuarios en parámetros de búsqueda válidos antes de ejecutar la consulta, reduciendo resultados vacíos por códigos mal formados.
- Filtrado previo en motores de recuperación documental: actúa como etapa de parsing de intención que alimenta un motor de búsqueda con filtros deterministas, en lugar de depender de coincidencia textual difusa.
- Despliegue en entornos con recursos limitados: al ser un adaptador de 0,8B servido en Q8_0, puede ejecutarse en CPU o en GPU de gama baja dentro de un servicio de búsqueda, sin coste de inferencia de un modelo grande.
- Localización de catálogos bilingües italiano-inglés: permite que usuarios que formulan la consulta en inglés operen sobre catálogos cuyos códigos están declarados en italiano, apoyándose en el adaptador de traducción del mismo pipeline.
- Validación y control de calidad de consultas: la salida en Markdown verificable permite registrar y auditar qué filtros se interpretaron de cada petición, útil en flujos con requisitos de trazabilidad.

## Benchmarks y rendimiento

Datos declarados por el autor del modelo (no verificados de forma independiente):

| Bench | FilterReader-0.8B | Qwen3.5-4B narrator |
|---|---|---|
| 100 preguntas de subvenciones y licitaciones, todos los filtros correctos | 73 % (41 s) | 47 % (130 s) |
| 200 búsquedas inmobiliarias, todos los filtros correctos | 76,5 % (153 de 200) | no disponible |

El autor señala que diez de las 47 búsquedas inmobiliarias fallidas piden comprar y no se leen como venta, porque el entrenamiento no incluyó ningún contrato de venta.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; al tratarse de una base de 0,8B en Q8_0, la huella es del orden de 1 GB de pesos, más overhead de contexto y runtime.
- GPU recomendadas: no disponibles en la información proporcionada; por tamaño, cualquier GPU consumer moderna con 4-8 GB de VRAM es suficiente en la práctica.
- Cabe en GPU consumer: sí, con cualquier tarjeta de 4 GB o más en cuantización Q8_0; también es viable en CPU.
- Opciones de despliegue: llama.cpp y Ollama por el formato GGUF; el autor lo sirve sobre la base Qwen3.5-0.8B en Q8_0 con decodificación greedy y razonamiento desactivado. No se documenta compatibilidad con vLLM o TGI para este adaptador.
- Latencia y throughput: el autor reporta 41 s para 100 preguntas de subvenciones en su configuración de referencia; no se publican cifras de throughput por token.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento declarado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| FilterReader-0.8B | 10,8 M (adaptador sobre base 0,8B) | no disponible | 73 % y 76,5 % de filtros completos correctos | Apache 2.0 | Hugging Face (GGUF) |
| Qwen3.5-4B (narrator, referencia del autor) | 4B | no disponible | 47 % en el bench de subvenciones, 130 s | no disponible en la información | no disponible en la información |
| Qwen3.5-0.8B (base) | 0,8B | no disponible | no disponible | no disponible en la información | Hugging Face |

No se dispone de datos de otros modelos comparables de extracción estructurada en la información proporcionada.

## Limitaciones y advertencias

- El adaptador está entrenado para un contrato de salida muy específico: fuera del formato Markdown del catálogo y de la tarea de extracción de filtros, su comportamiento no está garantizado.
- Cobertura de dominio limitada: subvenciones y licitaciones públicas italianas y búsquedas inmobiliarias. El propio autor documenta que no se entrenó con contratos de venta, lo que explica diez de los fallos del bench inmobiliario.
- Idiomas restringidos a italiano e inglés; no se declaran otros idiomas.
- La precisión declarada (73 % y 76,5 % de consultas con todos los filtros correctos) implica que una fracción significativa de peticiones requiere corrección o reintento; el diseño delega la validación al motor, que rechaza códigos no declarados.
- Los resultados de los benchmarks son declarados por el autor y no están verificados de forma independiente.
- Licencia Apache 2.0 permite uso comercial, pero debe verificarse la licencia de la base Qwen3.5-0.8B, que no se detalla en la información disponible.
- El repositorio registra cero descargas y cero likes en el momento de la consulta, por lo que no existe evidencia de uso en producción por terceros.
- Riesgo de alucinación acotado por el mecanismo de verificación del motor, pero no eliminado: el modelo puede producir lecturas incompletas o incorrectas que el motor debe detectar y rechazar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Gramscii-IT/FilterReader-0.8B
- Organización Gramscii-IT en Hugging Face: https://huggingface.co/Gramscii-IT
- Base del adaptador (archivo base Q8_0 citado por el autor): https://huggingface.co/Gramscii-IT/SemanticRepair-0.8B
- Estadísticas de modelos de Gramscii-IT: https://openmodelstats.com/owners/gramscii-it
