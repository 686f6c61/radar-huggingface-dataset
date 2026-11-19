# logic65/Qwen3.8-Whittle-MoE-27B-A17.8B-GGUF

## Resumen

Whittle MoE 27B (A18B) es un modelo de lenguaje de tipo mezcla de expertos (MoE) derivado de Qwen3.8-27B mediante una intervención "post hoc" sobre los tensores del modelo base, desarrollado por el autor independiente logic65. El objetivo declarado no es mejorar el conocimiento bruto del modelo, sino enseñarle a detener la generación de forma fiable: la model card describe el trabajo como "un MoE tallado a partir de Qwen3.8-27B y enseñado cuándo dejar de hablar". La versión publicada en este repositorio es una colección de cuantizaciones GGUF de la revisión v2.2.1 (29 de agosto de 2026).

El modelo cuenta con 26.917.297.664 parámetros totales (unos 26,9 mil millones) y una designación A17.8B que indica aproximadamente 17,8 mil millones de parámetros activos por token, lo que lo sitúa en la categoría de MoE de activación dispersa. La arquitectura se etiqueta como `qwen3_5_moe` e incorpora componentes `gated-deltanet`, un mecanismo de atención lineal con compuerta delta. La licencia es Apache 2.0.

La relevancia actual del proyecto reside en su enfoque metodológico: en lugar de reentrenar, el autor modifica quirúrgicamente un subconjunto muy pequeño de parámetros (las 64 compuertas `shared_expert_gate`, de 0,66 MB en total) para corregir fallos concretos de comportamiento, como la repetición en bucle y la incapacidad de cerrar listas o turnos de conversación. La model card documenta tanto las mejoras como las regresiones de cada iteración, lo que lo convierte en un caso de estudio útil sobre depuración conductual de modelos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con componentes gated-deltanet (etiqueta `qwen3_5_moe`) |
| Parametros totales | 26.917.297.664 (≈26,9 B) |
| Parametros activos | ≈17,8 B (designación A17.8B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0, Q6_K, DQ5_K_XL, DQ4_K_XL, Q4_K_M, DQ3_K_XL, Q3_K_M |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo de 574,3 GB con múltiples tiers) |

## Arquitectura y entrenamiento

El modelo es un transformer de mezcla de expertos con enrutamiento disperso, construido sobre Qwen3.8-27B e identificado con la etiqueta de arquitectura `qwen3_5_moe`. Incorpora capas `gated-deltanet`, un mecanismo de atención lineal basado en reglas delta con compuerta, que convive con la atención estándar del transformer. Cada capa incluye un tensor `shared_expert_gate` unidimensional que actúa como señal de parada entrenada; este es el componente sobre el que se ha intervenido en las distintas versiones.

El entrenamiento no parte de cero: el autor describe el proceso como una conversión "post hoc" del modelo denso en MoE y una posterior enseñanza de la parada. En v2.2 se modificaron únicamente 0,33 M de parámetros en las 64 compuertas `shared_expert_gate`, sin tocar el resto de la red. En v2.2.1 se reemplazaron esos 64 tensores (0,66 MB) por una compuerta entrenada sobre trazas reales de cadena de pensamiento del modelo padre, en las que el bloque `<think>` aparece cerrado por el propio profesor. La innovación técnica destacable es, por tanto, la corrección conductual mediante edición de un subconjunto mínimo de parámetros, no mediante RLHF o DPO a gran escala. No se dispone de datos sobre el número de tokens de entrenamiento ni sobre la composición del dataset.

## Capacidades

- Generación de texto conversacional multi-turno, con soporte de plantilla de chat y bloques `<think>` para razonamiento explícito.
- Modo de razonamiento activable: la model card distingue mediciones con "reasoning on" y "reasoning off".
- Control de terminación de listas y de turnos conversacionales, objeto principal del ajuste (mejora de 18/36 a 27/36 en terminación de listas y de 27/48 a 41/48 en turnos que terminan, según la model card).
- Capacidad de visión opcional mediante el proyector `mmproj-qwen38.gguf` (0,9 GB), que añade aproximadamente 1 GB al despliegue.
- Soporte de cuantización dinámica (receta DQ) que preserva mayor precisión en embeddings, cabeza de salida, atención y experto compartido.
- Compatibilidad declarada con endpoints (`endpoints_compatible` en los tags del repositorio).
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Asistentes conversacionales de producción: el ajuste de la compuerta de parada reduce los turnos que no terminan (de 27/48 a 41/48 en la medición de v2.2), lo que disminuye el riesgo de respuestas que se alargan indefinidamente en un chat desplegado.
- Generación de listas estructuradas: para tareas como inventarios, checklists o enumeraciones, el modelo mejora la terminación de listas (18/36 a 27/36) y reduce la repetición en ventana (0,237 a 0,048), aunque no acierta de forma fiable el número exacto de elementos solicitado.
- Razonamiento con traza visible: con el modo de razonamiento activado, v2.2.1 reduce los turnos que terminan sin emitir `</think>` de 21/24 a 3/24, lo que lo hace utilizable en pipelines que parsean la cadena de pensamiento y necesitan que el bloque se cierre correctamente.
- Despliegue en hardware de gama media: el tier DQ3_K_XL (13,9 GB) cabe en GPUs de 15-16 GB sin offload, lo que permite ejecutar un MoE de 27B en tarjetas de consumo alto como la RTX 4080 o 4090 con cuantización agresiva.
- Inferencia local con llama.cpp u Ollama: al publicarse exclusivamente en GGUF, el modelo está pensado para ejecutarse con la pila de llama.cpp, incluyendo offload de expertos a CPU cuando la VRAM es insuficiente (el Q8_0 cabe en 24 GB con offload de expertos).
- Investigación sobre control de generación: el repositorio incluye `loop_test.py`, lo que facilita reproducir las mediciones de bucle y repetición y experimentar con edición selectiva de compuertas en modelos MoE.
- Procesamiento de documentos con imagen (opcional): con el proyector `mmproj-qwen38.gguf` se añade entrada visual, útil para extracción de información de capturas o documentos escaneados, siempre que se valide la calidad del proyector, no documentada en detalle.

## Benchmarks y rendimiento

La model card no publica resultados de benchmarks estándar (MMLU, HumanEval, GSM8K). Sí incluye mediciones conductuales propias sobre conjuntos de prompts retenidos:

| Metrica | v2.1 | v2.2 | v2.2.1 |
|---|---|---|---|
| Terminacion de listas | 18/36 | 27/36 | no medido |
| Repeticion en peor ventana | 0,237 | 0,048 | no medido |
| Turnos de conversacion que terminan | 27/48 | 41/48 | no medido |
| Conteo exacto de items | 8/36 | 2/36 | 24/36 (36 prompts, reasoning off) |
| Turnos que terminan limpiamente (reasoning off) | no medido | 32/36 | 34/36 |
| Sobrecorreccion media | no medido | 1,69x | 1,14x |
| 4-grama repetido medio | no medido | 0,141 | 0,141 |
| Listas largas de 45+ items | no medido | 4/12 | 5/12 |
| Turnos sin `</think>` (reasoning on, sonda de 24 prompts) | no medido | 21/24 | 3/24 |
| Bateria de conocimiento | no medido | 28/39 | no medido |

El autor indica además que la tasa de bucle en turno unico es del 8 % (frente al 69 % de la primera release) y la tasa de respuestas estructuradas problemáticas del 22 % (frente al 75 %), con cero respuestas truncadas. No se han publicado resultados de benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM estimada según tier (cifras en GiB de la model card): Q8_0 26,7 GB; Q6_K 22,1 GB; DQ5_K_XL 20,2 GB; DQ4_K_XL 18,8 GB; Q4_K_M 16,2 GB; DQ3_K_XL 13,9 GB; proyector de visión 0,9 GB adicionales.
- Encaje por GPU: Q8_0 requiere 32 GB o 24 GB con offload de expertos; Q6_K y DQ5_K_XL caben en 24 GB; DQ4_K_XL en 20-24 GB; Q4_K_M en 16-20 GB; DQ3_K_XL en 15-16 GB sin offload.
- GPUs recomendadas: A100 40/80 GB y H100 para los tiers altos sin offload; RTX 4090 (24 GB) para Q6_K, DQ5_K_XL y DQ4_K_XL; RTX 4080 o similares de 16 GB para Q4_K_M y DQ3_K_XL.
- Cabe en GPU de consumo: sí, desde 16 GB con Q4_K_M y desde 15 GB con DQ3_K_XL; el Q8_0 también con offload de expertos en 24 GB.
- Opciones de despliegue: llama.cpp y derivados (Ollama, LM Studio) son la vía natural al ser GGUF; vLLM y TGI no están confirmados para este formato en la información disponible.
- Latencia y throughput: no disponibles. Al ser un MoE con 17,8 B de parámetros activos, el coste por token es inferior al de un denso de 27B, pero no se aportan cifras medidas.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Whittle MoE 27B A18B v2.2.1 | 26,9 B | ≈17,8 B | no disponible | Apache 2.0 | GGUF | Ajuste conductual de parada sobre Qwen3.8-27B |
| Qwen3.8-27B (modelo padre) | no disponible | denso | no disponible | no disponible | no disponible | Base del que deriva Whittle |
| Whittle-Qwen-3.8-35B-A3B | 35 B (aprox.) | 3 B (aprox.) | no disponible | no disponible | no disponible | Línea sucesora del mismo autor, mayor tamaño y menor activación |
| Alternativas MoE de tamaño comparable | no disponible | no disponible | no disponible | no disponible | no disponible | Sin datos verificables en la información proporcionada |

La comparación cuantitativa con modelos de terceros no es posible con los datos disponibles; la referencia más directa es el propio modelo padre y la línea sucesora del autor.

## Limitaciones y advertencias

- Repetición persistente: el 4-grama repetido medio se mantiene en 0,141, por encima del objetivo de 0,05 declarado por el autor; la repetición no está resuelta.
- Conteo exacto poco fiable: aunque v2.2.1 mejora el conteo exacto hasta 24/36, las listas largas de 45 o más elementos siguen siendo débiles (5/12).
- Regresión documentada en v2.2: el conteo exacto cayó de 8/36 a 2/36; el autor recomienda fijar los archivos de v2.1 si se necesita exactitud en listas de N elementos.
- Riesgo de razonamiento truncado: aunque v2.2.1 reduce los turnos sin `</think>` de 21/24 a 3/24, el fallo no desaparece por completo; los pipelines que parsean el bloque de pensamiento deben manejar el caso de cierre ausente.
- Idiomas soportados no documentados: no hay información sobre cobertura multilingüe ni calidad por idioma.
- Longitud de contexto no documentada: no se puede planificar el despliegue en escenarios de contexto largo sin verificación empírica.
- Sesgos: no se documentan evaluaciones de sesgo, toxicidad o alineación; al derivar de Qwen3.8-27B, hereda los sesgos del modelo base, no caracterizados en esta ficha.
- Riesgo de alucinación: no cuantificado; la batería de conocimiento de 28/39 sugiere un conocimiento parcial en las pruebas del autor, sin datos comparativos con el padre.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen3.8-27B, ya que la licencia del derivado no exime de las obligaciones del original.
- Madurez del proyecto: desarrollado por una sola persona con recursos limitados, con versiones que se reemplazan en el mismo repositorio; se recomienda fijar revisiones concretas (`d4b45cea` para v2.1) para reproducibilidad.
- Tamaño del repositorio: 574,3 GB en total por acumulación de tiers; la descarga selectiva de un único archivo es imprescindible.

## Enlaces

- Repositorio GGUF: https://huggingface.co/logic65/Qwen3.8-Whittle-MoE-27B-A17.8B-GGUF
- Modelo base (no cuantizado): https://huggingface.co/logic65/Qwen3.8-Whittle-MoE-27B-A17.8B
- Línea sucesora Whittle-Qwen-3.8-35B-A3B: https://huggingface.co/logic65/Whittle-Qwen-3.8-35B-A3B
- Apoyo al autor (Ko-fi): https://ko-fi.com/davida81328
