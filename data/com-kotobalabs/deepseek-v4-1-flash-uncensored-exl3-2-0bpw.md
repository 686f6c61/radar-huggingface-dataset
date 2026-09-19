# com-kotobalabs/Deepseek-v4.1-Flash-Uncensored-EXL3-2.0bpw

## Resumen

`com-kotobalabs/Deepseek-v4.1-Flash-Uncensored-EXL3-2.0bpw` es una versión derivada y cuantizada del modelo multimodal `deepseek-ai/DeepSeek-V4.1-Flash`, publicada por el usuario `com-kotobalabs`. Se trata de un checkpoint "abliterated" (sin mecanismos de rechazo a nivel de pesos) que se distribuye además en formato EXL3 a 2,0 bits por peso, según indica el propio identificador del repositorio. El repositorio ocupa 358,1 GB y declara 281.118.567.634 parámetros en los ficheros safetensors.

La model card adjunta describe la build de referencia del autor en FP8 (`e4m3fn`, con escalas de bloque E8M0 `[32,32]` y expertos enrutados en FP4) y atribuye al modelo base una arquitectura híbrida: encoder-decoder causal de 20+20 capas, MoE con 384 expertos enrutados con top-6 más un experto compartido, Hyper-Connections de 4 canales en el residual, atención dispersa CSA2, memoria n-gram Engram y una cabeza de borrador especulativa DSpark. El contexto declarado es de 1.000.000 de tokens y se anuncia soporte de visión mediante una torre DeepSeek-ViT.

Su relevancia es doble: por un lado, explora la preservación de capacidades tras una ablación quirúrgica de los circuitos de rechazo (la model card reporta una caída de MMLU de 4,22 puntos porcentuales, y de 1,1 puntos excluyendo el clúster de ética); por otro, sirve como caso de estudio de cuantización agresiva a 2 bits sobre un MoE de gran tamaño con visión y contexto largo. El modelo tiene muy poca tracción en el momento de la consulta: 2 descargas y 0 likes.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MoE sobre encoder-decoder causal (20+20 capas), Hyper-Connections de 4 canales, atención dispersa CSA2, memoria n-gram Engram, cabeza especulativa DSpark y torre de visión DeepSeek-ViT (según model card del autor) |
| Parámetros totales | 281.118.567.634 (~281,1B) según los safetensors del repositorio; la model card declara un backbone de 552B (discrepancia no resuelta en la información disponible) |
| Parámetros activos | 8B/16B por token según la model card; 384 expertos enrutados con top-6 más 1 experto compartido |
| Longitud de contexto | 1.000.000 de tokens |
| Tipos de cuantización | EXL3 a 2,0 bpw según el nombre del repositorio; la model card describe FP8 (`e4m3fn`) con block-scale E8M0 `[32,32]` y expertos enrutados en FP4 |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (librería `transformers`) |
| Tamaño del repositorio | 358,1 GB |
| Pipeline declarado | image-text-to-text |
| Modelo base | `deepseek-ai/DeepSeek-V4.1-Flash` |
| Fecha de creación / actualización | 2026-09-19 / 2026-09-19 |
| Descargas / likes | 2 / 0 |

## Arquitectura y entrenamiento

La model card del autor describe el modelo base como un encoder-decoder causal de 20 capas de encoder y 20 de decoder, con capas MoE de 384 expertos enrutados (top-6 por token) más un experto compartido, y una columna residual de 4 canales ("Hyper-Connections"). Incorpora atención dispersa CSA2, una memoria n-gram denominada Engram y una cabeza de borrador especulativa DSpark para decodificación especulativa. La torre de visión es un DeepSeek-ViT con 2D-RoPE y pixel unshuffle, lo que habilita la etiqueta de pipeline `image-text-to-text`.

No hay información en el material proporcionado sobre el número de tokens de entrenamiento, la composición del dataset ni sobre si hubo RLHF, DPO u otra fase de alineamiento en el modelo base. Lo que sí se detalla es el proceso de modificación: una "abliteración a nivel de pesos" propietaria que, según el autor, elimina los circuitos de rechazo sin hooks en tiempo de ejecución, sin `model.py` personalizado y sin vectores de steering, manteniendo byte a byte los componentes críticos de capacidad (expertos enrutados, memoria Engram, atención dispersa CSA2, cabeza DSpark, torre de visión, puertas del router, normas y embeddings). El resultado se describe como un checkpoint drop-in que se carga igual que el modelo base. No se documenta ningún reentrenamiento posterior a la ablación.

Cabe señalar que la model card incrustada corresponde a la build FP8 del autor, mientras que el repositorio consultado se anuncia como EXL3 a 2,0 bpw; la información disponible no aclara si los resultados de ablación se midieron sobre esta cuantización concreta o sobre la FP8.

## Capacidades

- Generación de texto y razonamiento multi-turno, con un modo de esfuerzo de razonamiento ("effort=max") descrito en la model card.
- Procesamiento multimodal de entrada: el pipeline declarado es `image-text-to-text` y el modelo incorpora una torre de visión DeepSeek-ViT con 2D-RoPE y pixel unshuffle.
- Ventana de contexto de 1.000.000 de tokens, apta para documentos y conversaciones muy largos.
- Capacidad de tool calling: la model card menciona explícitamente "Vision + tools" en la cabecera de la build.
- Decodificación especulativa mediante la cabeza DSpark, orientada a mejorar el throughput de generación.
- Memoria n-gram Engram, presentada como componente preservado por la ablación.
- Ausencia de mecanismos de rechazo: la model card reporta 0 respuestas clasificadas como HARD_REF, SOFT_RED o HEDGE en la build "cracked" a ambos niveles de esfuerzo de razonamiento.
- Soporte multilingüe: no disponible en la información proporcionada.

## Casos de uso

- Red teaming y evaluación de seguridad: el modelo funciona como sujeto de prueba para medir tasas de cumplimiento ante prompts adversarios (la model card usa HarmBench-320 con 7 categorías semánticas); permite calibrar clasificadores de entrada/salida y comparar contra el modelo base en el mismo banco de pruebas.
- Investigación sobre ablación de pesos: al documentarse como checkpoint drop-in sin hooks, facilita experimentos reproducibles sobre cómo afecta la eliminación de circuitos de rechazo a tareas de conocimiento general (MMLU-14k con delta de -4,22 pp).
- Procesamiento de documentos largos con entrada visual: con 1M de tokens de contexto y torre de visión, es utilizable para resumir y consultar contratos, informes o expedientes que combinan texto extenso e imágenes escaneadas.
- Extracción de información estructurada sobre corpus masivos: el contexto de 1M tokens y el soporte de tools permiten encadenar lectura de documentos completos y llamadas a funciones para volcar campos a bases de datos.
- Análisis forense de contenido no filtrado: útil en entornos controlados para estudiar cómo redacta un modelo sin guardrails y derivar patrones para filtros de moderación propios.
- Generación de datos sintéticos para entrenar clasificadores de seguridad: al no rechazar peticiones, puede producir ejemplos positivos y negativos para datasets de moderación, siempre bajo supervisión humana y con fines de defensa.
- Asistencia de código en pipelines internos: con tool calling y contexto largo puede integrarse en tareas de refactorización y análisis de repositorios completos, asumiendo revisión humana del resultado.
- Despliegue de investigación en clúster con cuantización a 2 bits: pensado para equipos que necesitan ejecutar un MoE grande en VRAM limitada, aceptando la degradación asociada a esta precisión.

## Benchmarks y rendimiento

Resultados reportados en la model card del autor para HarmBench-320 (grading en 4 niveles, T=0 greedy):

| Evaluación | ASR base | ASR "CRACK" | Delta (pp) |
|---|---:|---:|---:|
| HB-320 effort=off | 137/320 = 42,81 % | 320/320 = 100,00 % | +57,19 |
| HB-320 effort=max | 5/320 = 1,56 % | 320/320 = 100,00 % | +98,44 |

Desglose por categoría semántica de HarmBench-320:

| Categoría | Ítems | Base off | CRACK off | Base max | CRACK max |
|---|---:|---:|---:|---:|---:|
| chemical_biological | 42 | 16,7 % | 100,0 % | 0,0 % | 100,0 % |
| copyright | 80 | 98,8 % | 100,0 % | 0,0 % | 100,0 % |
| cybercrime_intrusion | 52 | 34,6 % | 100,0 % | 3,8 % | 100,0 % |
| harassment_bullying | 21 | 0,0 % | 100,0 % | 0,0 % | 100,0 % |
| harmful | 18 | 11,1 % | 100,0 % | 5,6 % | 100,0 % |
| illegal | 53 | 13,2 % | 100,0 % | 0,0 % | 100,0 % |
| misinformation_disinformation | 54 | 44,4 % | 100,0 % | 3,7 % | 100,0 % |

MMLU-14k (test completo, base-logit, T=0):

| Build | Correctas | Precisión | Delta |
|---|---:|---:|---:|
| base | 12.211 / 14.042 | 86,96 % | — |
| CRACK | 11.619 / 14.042 | 82,74 % | -4,22 pp |

Según la model card, excluyendo el clúster de ética (moral_scenarios, business_ethics, professional_law, jurisprudence, philosophy) el delta sobre los ~11.000 ítems restantes es de -1,1 pp. El sujeto con mayor degradación es moral scenarios (76,9 % → 37,0 %, -39,89 pp). No se han publicado otros resultados de benchmarks (HumanEval, GSM8K, MMMU u otros) en la información disponible.

## Requisitos de hardware

- Estimación de pesos para inferencia: con 281,1B parámetros a 2,0 bits, el peso teórico ronda los 70 GB; conviene presupuestar entre 75 y 90 GB contando overhead de runtime y cachés auxiliares (estimación propia, no confirmada por el autor).
- El repositorio completo ocupa 358,1 GB en disco, muy por encima de la estimación a 2 bits; hay que reservar ese espacio para la descarga sin asumir que todo el contenido se carga en VRAM a la vez.
- GPU recomendadas: H100 80 GB o A100 80 GB para el mínimo viable; para contextos largos reales (cientos de miles de tokens) lo razonable es un despliegue multi-GPU, por ejemplo 2x H100 80 GB o 3-4x A100 80 GB (estimación).
- La caché KV a 1M de tokens es el factor dominante: incluso con pesos a 2 bits, el contexto máximo declarado no es viable en una única GPU de 80 GB.
- En GPU de consumo: no cabe en RTX 4090 (24 GB) ni en RTX 5090 (32 GB) sin offloading agresivo a CPU y almacenamiento, con latencias muy altas.
- Opciones de despliegue: la librería declarada es `transformers` con pesos safetensors; el formato EXL3 apunta a ExLlamaV3. No hay confirmación en la información disponible de soporte para vLLM, TGI, Ollama o llama.cpp, y al no existir GGUF no es desplegable directamente en llama.cpp/Ollama.
- Latencia y throughput: no disponibles. La presencia de la cabeza especulativa DSpark sugiere optimización de decodificación, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | MMLU | Comportamiento de rechazo | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `deepseek-ai/DeepSeek-V4.1-Flash` (base) | 552B de backbone (según card) | 1M | 86,96 % (MMLU-14k) | ASR 42,81 % (effort=off) y 1,56 % (effort=max) | no disponible en la información | HuggingFace |
| Este modelo (CRACK EXL3 2,0 bpw) | 281,1B reportados en safetensors | 1M | 82,74 % (MMLU-14k) | ASR 100 % en ambos niveles de esfuerzo | MIT | HuggingFace |
| Otras variantes abliterated de MoE de gran tamaño con visión | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

No se han encontrado en la búsqueda web alternativas comparables documentadas con datos verificables; los resultados obtenidos corresponden a páginas genéricas sobre el dominio `.com` y no son relevantes.

## Limitaciones y advertencias

- El modelo ha sido modificado para eliminar los mecanismos de rechazo. La model card reporta un ASR del 100 % en HarmBench-320, incluidas las categorías chemical_biological, cybercrime_intrusion e illegal. Cualquier despliegue debe asumir que el modelo no se negará a generar contenido dañino.
- Riesgo legal y de cumplimiento: el uso para generar contenido ilícito, dañino o que infrinja derechos de terceros puede constituir una infracción normativa en la Unión Europea y en otras jurisdicciones, con independencia de que la licencia sea MIT.
- La licencia MIT se declara en los metadatos del repositorio, pero no se aporta documentación sobre las condiciones de uso del modelo base ni sobre la legitimidad de la redistribución de pesos derivados; conviene verificar la licencia del modelo base antes de un uso comercial.
- Discrepancia de parámetros: los safetensors reportan 281,1B parámetros y la model card declara 552B de backbone. No se explica el origen de la diferencia y afecta a cualquier planificación de hardware o coste.
- Discrepancia de cuantización: la model card describe una build en FP8 con expertos FP4, mientras que el repositorio se identifica como EXL3 a 2,0 bpw. No está claro a qué artefacto corresponden los benchmarks publicados.
- Degradación de conocimiento medible: -4,22 pp en MMLU-14k, y -39,89 pp en moral scenarios. Los dominios jurídico, de seguridad y de ciencias de la computación también pierden entre 3 y 7 pp.
- Alucinación: no se publican métricas de fidelidad ni de tasa de alucinación; con contexto de 1M tokens el riesgo de degradación por posición de la información no está evaluado.
- Idiomas: no se documenta la cobertura lingüística. No se puede asumir buen rendimiento en castellano sin evaluación propia.
- Tracción y mantenimiento: 2 descargas y 0 likes en el momento de la consulta, y sin historial de versiones. No hay garantía de mantenimiento, corrección de errores ni soporte.
- La ablación a nivel de pesos puede haber alterado comportamientos que no se miden con MMLU ni HarmBench (coherencia multi-turno, seguimiento de instrucciones, tool calling), y no se aportan evaluaciones de esas dimensiones.
- El tamaño del repositorio (358,1 GB) y el contexto de 1M tokens hacen que el coste de inferencia sea alto incluso con cuantización a 2 bits.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/com-kotobalabs/Deepseek-v4.1-Flash-Uncensored-EXL3-2.0bpw
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash
- Perfil del autor en X citado en la model card: https://x.com/dealignai
- Perfil citado en la model card: https://x.com/jordanschenck
- Papers, blogs o repositorios adicionales: no disponible; la búsqueda web realizada no devolvió resultados relevantes sobre este modelo.
