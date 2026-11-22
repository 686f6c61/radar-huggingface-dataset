# sigmanih/google-gemma-4-12B-it-GGUF-Q4_K_M

## Resumen

`google-gemma-4-12B-it-GGUF-Q4_K_M` es una cuantización GGUF en Q4_K_M del modelo `google/gemma-4-12B-it` de Google, publicada por el usuario `sigmanih` a través de su herramienta Sigma Studio. Se trata, por tanto, de una redistribución cuantizada del modelo instructivo original, no de un entrenamiento nuevo: el autor no documenta fine-tuning propio, sino un pipeline de conversión y publicación con un motor de inferencia denominado SigmaEngine. El repositorio tiene 670 descargas y 2 likes en el momento de la consulta.

El modelo base es un transformer causal de tipo decoder-only con 11.907.350.576 parámetros totales (aproximadamente 12B) y una ventana de contexto declarada de 32.768 tokens. La versión publicada aquí está pensada para ejecución local en GPU de consumo, con un peso en disco de 7,4 GB y un requisito declarado de unos 10,7 GB de VRAM para offload completo en GPU, o unos 10 GB de RAM en modo CPU/híbrido.

Su relevancia práctica es la de cualquier cuantización Q4_K_M: permite ejecutar un modelo de 12B en hardware asequible (RTX 3060 de 12 GB, RTX 4070, o equipos con 32 GB de RAM) manteniendo una calidad razonablemente cercana al original. No obstante, la model card presenta inconsistencias notables (formato de pesos descrito como "Sconosciuto"/"sconosciuta", huella en disco de "0.0 GB", benchmarks sobre subconjuntos parciales) que conviene tratar con cautela.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal decoder-only (CausalLM), derivada de `google/gemma-4-12B-it` |
| Parametros totales | 11.907.350.576 (~12B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 32.768 tokens (según model card del autor) |
| Tipos de cuantizacion | Q4_K_M (este repositorio); el autor no documenta otras variantes |
| Idiomas soportados | Inglés (en) e italiano (it), según los metadatos del repositorio |
| Licencia | `other` (la model card muestra un badge Apache-2.0, lo que contradice el campo `license: other`; debe verificarse en el modelo base) |
| Formato de pesos | GGUF (el campo de la model card indica "Sconosciuto"/"sconosciuta", es decir, no declarado correctamente) |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base de Google: un transformer causal decoder-only con atención estándar y 12B parámetros, del que esta publicación es únicamente una conversión a formato GGUF con cuantización Q4_K_M (4 bits por peso con mezcla de precisiones en determinadas capas). No hay información disponible sobre el número de tokens de entrenamiento, la composición del dataset, ni si el modelo base empleó RLHF, DPO u otras técnicas de alineación; esos datos corresponden a la documentación oficial de Google, que no se incluye en la información proporcionada.

El autor menciona un "modo de razonamiento" con dos perfiles de ejecución (respuesta directa y cadena de pensamiento o CoT), pero no documenta si esa capacidad proviene del modelo base o de un ajuste posterior. Tampoco se detalla ninguna innovación técnica propia: el valor añadido del repositorio es la cuantización y el empaquetado para despliegue, no una aportación arquitectónica.

## Capacidades

- Generación de texto conversacional multi-turno, con soporte declarado de plantilla de chat instructiva.
- Razonamiento paso a paso en modo "Deep Thinking" (cadena de pensamiento), con una diferencia de precisión de +0,1% frente al modo directo según las mediciones del autor.
- Generación de código en Python, evaluada por el autor en HumanEval (71%) y MBPP (78%).
- Razonamiento matemático: GSM8K (100%) y MATH (89%) en las pruebas del autor sobre subconjuntos parciales.
- Conocimiento general y razonamiento multidisciplinar: MMLU (79%) y MMLU-Pro (56%).
- Tool calling / function calling: la model card incluye un apartado de protocolo agéntico, con una adherencia declarada del 58,7% y una tasa de finalización autónoma de tareas del 0,0% en el escenario evaluado.
- Capacidades multilingües limitadas a inglés e italiano según los metadatos; no se declara soporte de español.
- No se declaran capacidades de visión, audio ni otras modalidades.

## Casos de uso

- Asistente conversacional local: con 32.768 tokens de contexto y un peso de 7,4 GB, puede desplegarse en un portátil con GPU de 12 GB para conversaciones multi-turno con historial largo sin salir del equipo.
- Generación de código en entornos con requisitos de privacidad: la cuantización Q4_K_M permite ejecutarlo en estaciones de trabajo sin conexión, útil para autocompletado y generación de funciones Python en repositorios que no pueden enviarse a APIs externas.
- Resolución de problemas matemáticos de nivel escolar y competición: los resultados declarados en GSM8K y MATH sugieren uso en tutoría automatizada o verificación de ejercicios, siempre con validación humana dado el tamaño reducido de la muestra evaluada.
- Prototipado de agentes con tool calling: la model card documenta un sandbox de herramientas; es adecuado para experimentar con bucles agénticos, aunque la tasa de finalización autónoma reportada (0,0%) aconseja usarlo solo en fase de exploración con supervisión.
- Procesamiento de documentación técnica en inglés e italiano: resúmenes, extracción de entidades y reescritura de textos largos aprovechando la ventana de contexto, en equipos con 32 GB de RAM en modo CPU.
- Base para fine-tuning ligero o evaluación comparativa: al ser una cuantización GGUF, sirve para medir el impacto de Q4_K_M frente al modelo original en tareas concretas antes de decidir el formato de despliegue en producción.
- Despliegue en entornos de borde con llama.cpp u Ollama: el tamaño de 7,4 GB y los ~10 GB de RAM declarados permiten ejecutarlo en mini-PC o servidores domésticos para tareas de clasificación y generación de baja concurrencia.

## Benchmarks y rendimiento

Los únicos datos disponibles son los publicados por el autor en la model card. Están medidos sobre subconjuntos parciales (entre 7 y 14 preguntas por suite), con temperatura 0,0 y semilla 42, y el propio autor advierte que no son comparables con ejecuciones de suite completa.

| Benchmark | Resultado | Preguntas (aciertos/total) |
|---|---|---|
| ARC-Challenge | 89% | 8/9 |
| BIG-Bench Hard | 100% | 7/7 |
| GPQA | 56% | 5/9 |
| GSM8K | 100% | 9/9 |
| HellaSwag | 56% | 5/9 |
| HumanEval (pass@1) | 71% | 5/7 |
| MATH | 89% | 8/9 |
| MBPP | 78% | 7/9 |
| MMLU | 79% | 11/14 |
| MMLU-Pro | 56% | 5/9 |
| TruthfulQA | 100% | 9/9 |
| Total agregado | 79% | 79/100 |

Comparativa de modos de ejecución declarada por el autor: respuesta directa 79,0% (45/57) frente a cadena de pensamiento 79,1% (34/43), una diferencia de +0,1 puntos. No se han publicado resultados de benchmarks independientes ni comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada: ~10,7 GB para offload completo en GPU (dato del autor); ~10 GB de RAM en modo CPU/híbrido.
- GPU recomendadas por el autor: 12-16 GB de VRAM, citando RTX 3060 y RTX 4070.
- Cabe en GPU de consumo: sí, en tarjetas de 12 GB o más (RTX 3060 12 GB, RTX 4070, RTX 4070 Ti, RTX 4080). En tarjetas de 8 GB requeriría offload parcial a RAM.
- Opciones de despliegue: llama.cpp y Ollama son las vías naturales para GGUF; el autor menciona su propio motor SigmaEngine y compatibilidad con endpoints. vLLM y TGI no soportan GGUF de forma nativa como formato principal, por lo que requerirían conversión.
- Latencia y throughput: no disponibles. El autor declara "0 turns (0.0s)" en la prueba de eficiencia agéntica, un dato que no es interpretable como medida de rendimiento real.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| google-gemma-4-12B-it-GGUF-Q4_K_M (este) | ~12B | 32.768 | GGUF Q4_K_M | `other` | Cuantización de terceros, benchmarks parciales del autor |
| google/gemma-4-12B-it (base) | ~12B | 32.768 | safetensors | `other` (Gemma) | Modelo original de Google; referencia de calidad sin pérdida por cuantización |
| Otras cuantizaciones GGUF del mismo base | ~12B | 32.768 | GGUF (Q5, Q8, etc.) | según autor | No disponibles en la información proporcionada |
| Modelos de ~12B de otras familias | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables en la información proporcionada |

No se dispone de información suficiente para comparar rendimiento con alternativas de la misma categoría; los únicos datos numéricos son los del propio autor y no son comparables con ejecuciones completas de terceros.

## Limitaciones y advertencias

- La model card contiene errores evidentes: formato de pesos "Sconosciuto"/"sconosciuta" (italiano para "desconocido"), huella en disco "0.0 GB" cuando el repositorio ocupa 7,4 GB, y un badge Apache-2.0 que contradice el campo `license: other`. Esto reduce la fiabilidad de la documentación.
- La licencia real es `other`; el uso comercial debe verificarse contra los términos del modelo base `google/gemma-4-12B-it`, que no se detallan en la información disponible.
- Los benchmarks están medidos sobre subconjuntos de 7 a 14 preguntas, con el propio aviso del autor de que no son comparables con suites completas. Un 100% en GSM8K con 9 preguntas no es evidencia robusta de capacidad matemática.
- La prueba de tool calling reporta 58,7% de adherencia al protocolo y 0,0% de finalización autónoma de tareas (0/1 escenarios), lo que indica que el uso agéntico sin supervisión no está respaldado por los datos del autor.
- Idiomas declarados: solo inglés e italiano. No hay soporte declarado de español, por lo que su uso en castellano no está validado.
- Riesgo de alucinación inherente a un modelo de 12B cuantizado a 4 bits; el 100% en TruthfulQA sobre 9 preguntas no es garantía de factualidad.
- La cuantización Q4_K_M introduce degradación respecto al modelo original, especialmente en tareas de razonamiento matemático y código; no se han publicado comparaciones directas Q4 frente a FP16 en este repositorio.
- No hay información sobre sesgos, datos de entrenamiento ni procesos de alineación del modelo base en la documentación proporcionada.
- El repositorio es una publicación de terceros con 2 likes y 670 descargas; no es una fuente oficial de Google.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/sigmanih/google-gemma-4-12B-it-GGUF-Q4_K_M
- Modelo base: https://huggingface.co/google/gemma-4-12B-it
- Repositorio Sigma Studio: https://github.com/Sigmanih/SigmaStudio
- Perfil del autor en Hugging Face: https://huggingface.co/sigmanih
