# mobilint/Qwen3-4B-regulus-rb-usb

## Resumen

Este repositorio contiene una versión del modelo Qwen3-4B compilada y optimizada por Mobilint para su hardware NPU. No se distribuye como un checkpoint estándar de transformers, sino como un artefacto empaquetado para la pila de aceleración de Mobilint (librería `mobilint`, etiqueta `custom_code`), con el objetivo declarado de desplegarse dentro de ese entorno. La relación con el modelo base es de cuantización (`base_model_relation: quantized`), partiendo de Qwen/Qwen3-4B, un transformer denso decoder-only de la familia Qwen3 publicado por Alibaba Qwen bajo licencia Apache 2.0.

El interés de la ficha es doble. Por un lado, documenta un caso poco habitual de distribución: un modelo abierto reempaquetado por un fabricante de silicio para su propio acelerador, lo que condiciona por completo el formato de pesos, las herramientas de inferencia y el hardware sobre el que puede ejecutarse. Por otro lado, sirve como aviso de que varios campos habituales en una ficha (contexto, idiomas, cuantizaciones, benchmarks) no están documentados en este repositorio, y deben consultarse en la documentación del modelo base.

Conviene señalar una discrepancia objetiva de los metadatos: el recuento real de parámetros declarado en safetensors es de 388.956.160 frente a los aproximadamente 4.000 millones del modelo base, y el repositorio ocupa 7,7 GB. Esto indica que el artefacto no almacena el checkpoint completo en el mismo formato que el original (probablemente pesos reempaquetados o parcialmente cuantizados para el compilador de la NPU), pero el repositorio no explica la causa. Se refleja tal cual en la tabla y se advierte en limitaciones.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible en el repositorio (derivada de Qwen/Qwen3-4B, transformer denso decoder-only) |
| Parámetros totales | 388.956.160 según metadatos de safetensors del repositorio; el modelo base Qwen3-4B declara del orden de 4.000 millones (discrepancia no explicada por el autor) |
| Parámetros activos | no aplica (el modelo base no es MoE) |
| Longitud de contexto | no disponible en el repositorio (el modelo base declara 32.768 tokens con extensión vía YaRN) |
| Tipos de cuantización | no disponible; el repositorio se declara como versión cuantizada del modelo base y se distribuye en formato compilado para NPU Mobilint |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors con código personalizado (`custom_code`), empaquetado para la pila de aceleración de Mobilint; no es un checkpoint estándar de transformers |

## Arquitectura y entrenamiento

El repositorio no aporta información sobre la arquitectura interna, los datos de entrenamiento, el número de tokens vistos ni las etapas de alineación (RLHF, DPO u otras). Se limita a indicar que el modelo ha sido compilado y optimizado para hardware NPU de Mobilint, que está empaquetado para su pila de aceleración y que se destina a ese entorno. La etiqueta `base_model_relation: quantized` confirma una reducción de precisión respecto al original, pero no se especifica el esquema de cuantización (bits, granularidad, calibración).

Respecto al modelo de partida, Qwen/Qwen3-4B, su documentación pública lo describe como un transformer denso decoder-only con atención de consultas agrupadas (GQA), entrenado sobre un corpus multilingüe de gran escala y con modos de razonamiento explícito e implícito. Esa información procede de la ficha del modelo base, no de este repositorio, y debe verificarse allí antes de asumirla para este artefacto compilado, ya que el proceso de compilación para NPU puede alterar el grafo, las optimizaciones de atención o el soporte de plantillas de chat.

La innovación técnica destacable aquí no está en el modelo, sino en el empaquetado: la compilación para un acelerador propietario es lo que determina cómo se ejecuta, qué herramientas lo soportan y qué métricas de rendimiento resultan relevantes.

## Capacidades

No hay documentación específica de capacidades en este repositorio. Las capacidades que se enumeran a continuación corresponden a lo que la ficha del modelo base Qwen3-4B declara públicamente, y no están verificadas para este artefacto compilado:

- Generación de texto y conversación multi-turno.
- Razonamiento con modo de pensamiento explícito (thinking) y modo directo, según el modelo base.
- Generación de código y resolución de problemas matemáticos, según el modelo base.
- Soporte de tool calling / function calling en el modelo base; no confirmado en el artefacto compilado.
- Flujos de agente y razonamiento multi-paso en el modelo base; no confirmado tras la compilación.
- Capacidad multilingüe en el modelo base; el repositorio no declara lista de idiomas.
- Capacidades adicionales (visión, audio, decodificación especulativa): no disponibles.

## Casos de uso

- Asistentes conversacionales en dispositivo: un asistente local que mantiene conversaciones multi-turno sin enviar datos a la nube, aprovechando el modelo base como generador y la NPU Mobilint como backend de inferencia.
- Procesamiento de documentos en entornos aislados (air-gapped): resumen, extracción de entidades y clasificación de textos en redes sin conexión exterior, donde el despliegue sobre hardware dedicado es un requisito de cumplimiento.
- Atención al cliente automatizada en el borde: respuesta a consultas de primer nivel con baja dependencia de red, siempre que se valide previamente la plantilla de chat y la calidad de la cuantización.
- Generación aumentada por recuperación (RAG) local: indexación y respuesta sobre una base documental propia ejecutada íntegramente en el equipo, con el modelo como componente generativo final; requiere comprobar el contexto real tras la compilación.
- Filtrado y moderación de contenido en tiempo real: clasificación de mensajes entrantes en un servicio de mensajería desplegado sobre hardware local, con coste marginal bajo por inferencia.
- Prototipado y validación de la pila de compilación de Mobilint: uso del modelo como referencia para medir latencia, throughput y precisión respecto al Qwen3-4B original en el mismo hardware.
- Transcripción y reescritura de notas internas: normalización de texto, corrección de estilo y resumen de actas dentro de una intranet corporativa.
- Pruebas de agentes con herramientas en local: experimentación con llamadas a funciones en un entorno controlado, sujeto a confirmar que el artefacto compilado conserva el soporte de tool calling del modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio de HuggingFace no incluye métricas de MMLU, HumanEval, GSM8K ni de latencia o throughput, y la búsqueda web realizada no ha devuelto documentación técnica relacionada (los resultados obtenidos eran entradas de diccionarios de hindi sin relación con el modelo).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio no está pensado para GPU; requiere hardware NPU de Mobilint y su pila de aceleración.
- GPU recomendadas: no disponibles. No hay indicios de soporte para A100, H100, RTX 4090 ni otras GPU de consumo o de centro de datos con esta distribución concreta.
- Compatibilidad con GPU de consumo: no confirmada; el artefacto está compilado para un acelerador específico.
- Almacenamiento: el repositorio ocupa 7,7 GB, por lo que se necesita al menos ese espacio en disco para el artefacto, además de los requisitos propios del runtime de Mobilint.
- Opciones de despliegue: pila de aceleración de Mobilint, a través de la librería `mobilint`. No se documenta compatibilidad con vLLM, llama.cpp, Ollama, TGI ni otras herramientas de inferencia convencionales.
- Latencia y throughput estimados: no disponibles.
- El nombre del repositorio (`regulus-rb-usb`) sugiere una variante para un producto o placa de la familia Regulus con conexión USB, pero esto no está confirmado por el autor y debe verificarse en la documentación de Mobilint.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mobilint/Qwen3-4B-regulus-rb-usb | 388.956.160 según safetensors del repo (base: ~4.000 millones) | no disponible | safetensors con código personalizado, compilado para NPU Mobilint | Apache 2.0 | Repositorio público; requiere hardware Mobilint |
| Qwen/Qwen3-4B | ~4.000 millones | 32.768 tokens con extensión vía YaRN, según su ficha | safetensors estándar de transformers | Apache 2.0 | Público, ejecutable en GPU y CPU con las herramientas habituales |
| Qwen/Qwen3-8B | dato no verificado en esta búsqueda | no disponible | safetensors estándar de transformers | Apache 2.0 | Público, ejecutable en GPU y CPU |

La diferencia relevante no es de calidad, sino de naturaleza del artefacto: este repositorio es una distribución ligada a un hardware concreto, mientras que Qwen/Qwen3-4B y Qwen/Qwen3-8B son checkpoints de propósito general. No hay datos de rendimiento comparado en la información disponible.

## Limitaciones y advertencias

- Dependencia de hardware: el artefacto está compilado para NPU de Mobilint. Fuera de esa pila no hay garantía de que pueda cargarse ni ejecutarse.
- Discrepancia en el recuento de parámetros: 388.956.160 frente a los ~4.000 millones del modelo base. El repositorio no explica si se trata de un empaquetado parcial, de pesos recomprimidos o de otro esquema; conviene tratarlo como un dato no resuelto antes de asumir equivalencia funcional con Qwen3-4B.
- Ausencia total de benchmarks: no hay métricas publicadas de calidad, latencia ni precisión tras la cuantización, por lo que se desconoce la degradación introducida por el proceso de compilación y cuantización.
- Riesgo de alucinación: inherente a los modelos de lenguaje de esta escala; no existe documentación específica de mitigaciones en este repositorio.
- Sesgos: no documentados. Al no detallarse la composición del dataset ni el proceso de alineación, no es posible evaluar sesgos conocidos.
- Idiomas: no declarados. La cobertura multilingüe del modelo base no está confirmada para este artefacto.
- Contexto real: no declarado. Aunque el modelo base anuncie 32.768 tokens, el grafo compilado puede imponer límites distintos.
- Licencia: Apache 2.0, heredada del modelo base, que permite uso comercial; sin embargo, la licencia del modelo no cubre las condiciones de uso del hardware ni del runtime de Mobilint, que se rigen por sus propios términos.
- Repositorio sin adopción: cero descargas y cero likes en el momento de la consulta, sin issues ni documentación adicional publicada por el autor en la ficha.
- Fecha de creación del repositorio registrada como 2026-09-10, posterior a la de esta consulta; conviene verificar la coherencia temporal de los metadatos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mobilint/Qwen3-4B-regulus-rb-usb
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3-4B/blob/main/LICENSE
- Sitio del fabricante: https://mobilint.com
- Repositorio de modelos de Mobilint: https://github.com/mobilint/mblt-model-zoo
- Otros enlaces relevantes (papers, blogs, demos): no disponibles. La búsqueda web realizada no devolvió resultados relacionados con el modelo.
