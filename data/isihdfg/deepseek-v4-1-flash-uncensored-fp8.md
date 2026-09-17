# isihdfg/DeepSeek-V4.1-Flash-UNCENSORED-FP8

## Resumen

DeepSeek-V4.1-Flash-UNCENSORED-FP8 es una derivación abliterada del checkpoint `deepseek-ai/DeepSeek-V4.1-Flash`, publicada por el usuario de HuggingFace `isihdfg` (vinculado en la propia model card a las cuentas `@dealignai` y `@jordanschenck`). No es un modelo entrenado desde cero ni un afinamiento con datos: es el mismo checkpoint base con el comportamiento de rechazo eliminado a nivel de pesos, sin `model.py` personalizado, sin hooks de tiempo de ejecución y sin vectores de dirección. El autor lo describe como un checkpoint "drop-in" que carga exactamente igual que el modelo original.

Técnicamente es un transformer causal encoder-decoder multimodal con 20+20 capas, mezcla de expertos con 384 expertos enrutados con top-6 más un experto compartido, atención dispersa CSA2, memoria n-gram Engram, cabecera de borrador especulativo DSpark y una torre de visión DeepSeek-ViT. Los safetensors del repositorio declaran 763.205.315.794 parámetros totales, una longitud de contexto de 1.000.000 de tokens, pesos en FP8 nativo (`e4m3fn` con escalas de bloque E8M0) y expertos enrutados en FP4. El repositorio ocupa 510,3 GB.

Su relevancia no es la capacidad bruta, sino lo que documenta: los propios números del autor muestran que la abliteración es viable a escala de cientos de miles de millones de parámetros y que el modelo resultante responde al 100 % de las peticiones de HarmBench-320, incluidas las categorías `chemical_biological` y `cybercrime_intrusion`. El modelo acumula 0 descargas y 0 me gusta, se publicó y actualizó el mismo día (2026-09-17) y no tiene validación independiente de la comunidad.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer causal encoder-decoder (20+20 capas) con MoE (384 expertos enrutados top-6 + 1 compartido), Hyper-Connections (residual de 4 canales), atención dispersa CSA2, memoria n-gram Engram y cabecera de borrador especulativo DSpark |
| Parámetros totales | 763.205.315.794 según safetensors del repositorio. La model card del autor declara un "backbone de 552B", cifra que no cuadra con el dato de safetensors (véase Limitaciones) |
| Parámetros activos | La model card declara "8B/16B activos por token"; no se especifica cuál corresponde a decodificación y cuál a prefill |
| Longitud de contexto | 1.000.000 de tokens |
| Tipos de cuantización | FP8 nativo (`e4m3fn`) en pesos con escalas de bloque E8M0 [32, 32]; expertos enrutados en FP4. Etiquetado también como "8-bit". La model card indica que la cuantización es nativa y no ha sido modificada respecto al base |
| Idiomas soportados | no disponible |
| Licencia | MIT (declarada por el autor) |
| Formato de pesos | safetensors |
| Modificación aplicada | Abliteración quirúrgica a nivel de pesos (checkpoint drop-in, sin código personalizado) |
| Modalidad | image-text-to-text (multimodal con torre DeepSeek-ViT, 2D-RoPE y pixel unshuffle) |
| Tamaño del repositorio | 510,3 GB |
| Modelo base | deepseek-ai/DeepSeek-V4.1-Flash |
| Biblioteca | transformers |
| Fecha de publicación | 2026-09-17 (creado y actualizado el mismo día) |
| Descargas / me gusta | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura no es una innovación de esta publicación, sino la del modelo base que se ha modificado. Se trata de un decoder causal con encoder explícito (20+20 capas) que combina cuatro mecanismos poco habituales de forma simultánea: mezcla de expertos con enrutamiento top-6 sobre 384 expertos más un experto compartido siempre activo; Hyper-Connections, un esquema de residual de 4 canales; CSA2, una atención dispersa que reduce el coste cuadrático sobre ventanas de contexto muy largas; y Engram, una memoria basada en n-gramas que complementa la atención. A esto se suma DSpark, una cabecera de borrador para decodificación especulativa, y una torre de visión DeepSeek-ViT con 2D-RoPE y pixel unshuffle para entrada de imágenes. El resultado es un modelo multimodal con 1M de tokens de contexto y una fracción activa muy reducida por token, lo que abarata la decodificación pero no el requisito de memoria, ya que todos los expertos deben estar residentes.

Sobre el entrenamiento del modelo base no hay información en los datos proporcionados: no se indica número de tokens, composición del dataset, ni si hubo RLHF, DPO o aprendizaje por refuerzo con verificación. Lo único documentado es el proceso de modificación posterior: el equipo de dealignai afirma haber eliminado el "circuito de rechazo" a nivel de pesos preservando byte a byte los componentes críticos para la capacidad (expertos enrutados, memoria Engram, atención dispersa CSA2, cabecera DSpark, torre de visión, puertas del router, normalizaciones y embeddings). Se menciona además un modo de razonamiento con `effort=max` que genera una traza de razonamiento verificable, y que el modelo base en ese modo se vuelve *más* propenso al rechazo (pasa de 42,81 % a 1,56 % de cumplimiento en HarmBench), mientras que esta variante se mantiene en el 100 %.

## Capacidades

- Generación de texto multimodal: acepta entrada de imagen y texto (`image-text-to-text`) mediante la torre DeepSeek-ViT intacta.
- Razonamiento con traza explícita: dispone de un modo `effort=max` que produce una traza de razonamiento guardable y auditable por un evaluador externo.
- Llamada a herramientas: la model card menciona explícitamente soporte de "Vision + tools", sin detallar el formato ni el protocolo.
- Contexto largo: ventana de 1M de tokens, lo que permite ingerir documentos completos, repositorios de código o conversaciones muy extensas sin truncado.
- Decodificación especulativa nativa mediante la cabecera DSpark, orientada a reducir la latencia de generación.
- Capacidades multilingües: no confirmadas para el modelo. La referencia a "clasificador multilingüe" en la model card describe el sistema de evaluación de HarmBench, no las capacidades lingüísticas del modelo.
- Cumplimiento sin rechazo: el modelo responde a peticiones en las siete categorías semánticas de HarmBench con un 100 % de tasa de éxito de ataque, en ambos niveles de esfuerzo de razonamiento (véase Benchmarks y Limitaciones).

No se documentan capacidades específicas de audio, vídeo, visión 3D ni ejecución de código.

## Casos de uso

Nota previa: las cifras publicadas por el propio autor (100 % de cumplimiento en `chemical_biological`, `cybercrime_intrusion` y `illegal`, con cero rechazos duros, cero rechazos blandos y cero evasivas) desaconsejan por completo cualquier despliegue orientado al usuario, cualquier integración con entrada no confiable y cualquier uso en producción. Los casos siguientes son los únicos que resultan defendibles con este artefacto y son todos de investigación o evaluación.

- Evaluación de la eficacia de guardrails de terceros: usar el modelo como generador adversario controlado para medir si un clasificador de contenido, un filtro de salida o un sistema de moderación detecta respuestas dañinas. Al tener un 100 % de cumplimiento conocido, sirve como suelo de referencia: cualquier filtro que no lo detecte es insuficiente.
- Investigación sobre mecanismos de rechazo: comparar las matrices de pesos de este checkpoint con las del modelo base para localizar qué subconjuntos de parámetros concentran el comportamiento de rechazo. Se trata de un caso de estudio poco frecuente, porque permite el análisis a escala de 763.000 millones de parámetros con una modificación declarada como puramente ponderal.
- Auditoría de pipelines de anotación de daño: los conjuntos de salidas etiquetadas del autor (clasificador regex de 4 niveles más LLM-as-judge sobre la traza de razonamiento) son material útil para calibrar taxonomías de evaluación tipo HarmBench y medir el acuerdo entre anotadores automáticos y humanos.
- Estudio de interferencia entre abliteración y capacidad: el desglose por asignatura de MMLU permite cuantificar exactamente qué dominios se degradan al eliminar el rechazo. La caída de 39,89 puntos en `moral_scenarios` y de 7,04 en `professional_law` frente a la práctica estabilidad del resto del conjunto es un hallazgo con valor propio para la literatura de alineación.
- Investigación sobre cuantización de mezclas de expertos: el modelo es un caso raro de checkpoint FP8 nativo con expertos enrutados en FP4 a gran escala, con y sin modificación ponderal. Permite comparar el impacto de la cuantización mixta sobre el enrutamiento y sobre la coherencia multiturno.
- Gobernanza y política de IA: documentar empíricamente qué ocurre cuando se publica una variante sin rechazos de un modelo frontera bajo licencia permisiva. Los datos de HarmBench de este repositorio son evidencia directa para discutir obligaciones de trazabilidad y responsabilidad sobre derivados.
- Formación de equipos de seguridad: usar el modelo en entornos aislados y sin red para practicar la respuesta a incidentes de contenido generado, sin exponer a terceros ni generar material difundible.

No se recomienda su uso para atención al cliente, generación de código en producción, asistentes personales, análisis de documentos de terceros ni ningún escenario donde la salida pueda llegar a un usuario final.

## Benchmarks y rendimiento

Los únicos datos disponibles son los publicados por el propio autor en la model card. No hay verificación independiente ni resultados de terceros.

HarmBench-320, decodificación voraz con temperatura 0, clasificación en cuatro niveles (HARD_REF / SOFT_RED / HEDGE / COMPLY):

| Evaluación | Modelo base (ASR) | Este modelo (ASR) | Delta |
|---|---:|---:|---:|
| HB-320, `effort=off` | 137/320 = 42,81 % | 320/320 = 100,00 % | +57,19 pp |
| HB-320, `effort=max` | 5/320 = 1,56 % | 320/320 = 100,00 % | +98,44 pp |

Desglose por categoría semántica de HarmBench:

| Categoría | Ítems | Base `off` | Este modelo `off` | Base `max` | Este modelo `max` |
|---|---:|---:|---:|---:|---:|
| chemical_biological | 42 | 16,7 % | 100,0 % | 0,0 % | 100,0 % |
| copyright | 80 | 98,8 % | 100,0 % | 0,0 % | 100,0 % |
| cybercrime_intrusion | 52 | 34,6 % | 100,0 % | 3,8 % | 100,0 % |
| harassment_bullying | 21 | 0,0 % | 100,0 % | 0,0 % | 100,0 % |
| harmful | 18 | 11,1 % | 100,0 % | 5,6 % | 100,0 % |
| illegal | 53 | 13,2 % | 100,0 % | 0,0 % | 100,0 % |
| misinformation_disinformation | 54 | 44,4 % | 100,0 % | 3,7 % | 100,0 % |

MMLU-14k, conjunto de test completo, logits base, temperatura 0:

| Versión | Aciertos | Precisión | Delta |
|---|---:|---:|---:|
| Base | 12.211 / 14.042 | 86,96 % | — |
| Este modelo | 11.619 / 14.042 | 82,74 % | -4,22 pp |

Excluyendo el conglomerado de ética (`moral_scenarios`, `business_ethics`, `professional_law`, `jurisprudence`, `philosophy`), el delta sobre los ~11.000 ítems restantes es de -1,1 pp. Las mayores caídas por asignatura son `moral scenarios` (-39,89 pp), `professional law` (-7,04 pp), `abstract algebra` (-6,00 pp), `security studies` (-5,31 pp) y `high school computer science` (-4,00 pp).

No hay datos de HumanEval, GSM8K, MMLU-Pro, TruthfulQA, MT-Bench ni de rendimiento en visión.

## Requisitos de hardware

Las cifras siguientes son estimaciones a partir del tamaño del repositorio (510,3 GB) y de los 763.205.315.794 parámetros declarados. No hay mediciones publicadas de latencia ni de throughput.

- Peso en disco: 510,3 GB publicado. Los 763.200 millones de parámetros en FP8 puro implicarían ~763 GB; la reducción hasta 510,3 GB es consistente con los expertos enrutados en FP4.
- VRAM mínima estimada: no menos de ~520-560 GB solo para pesos, antes de calcular caché KV ni búferes de activaciones. Esto descarta cualquier configuración de una sola GPU y cualquier nodo de 4 GPU de 80 GB.
- Configuración mínima práctica: 8×H100 de 80 GB (640 GB) con margen muy estrecho y sin contexto largo. Es probable que requiera paralelismo tensorial y de expertos combinados y ajuste fino de la asignación de memoria.
- Configuración recomendada: 8×H200 de 141 GB (1.128 GB) o 16×H100 de 80 GB. El contexto de 1M tokens es en la práctica inalcanzable: la caché KV a esa longitud excede cualquier presupuesto razonable de memoria, por lo que habría que truncar el contexto a una fracción.
- GPU de consumo: no cabe. Ni 4×RTX 4090 (96 GB) ni 8×RTX 4090 (192 GB) se acercan al requisito. Tampoco cabe en configuraciones multi-GPU de gama alta para consumidor.
- Descarga a RAM o NVMe: técnicamente posible con librerías de offloading, pero con latencia prohibitiva para cualquier uso interactivo.
- Opciones de despliegue: vLLM y SGLang son las opciones realistas, por su soporte de MoE y de FP8 con escalas de bloque. TGI y TensorRT-LLM son alternativas si se verifica el soporte de CSA2, Engram y DSpark. llama.cpp y Ollama no son viables: no hay GGUF publicado y la arquitectura no está soportada por esas herramientas en el momento de redactar.
- Latencia y throughput: no disponible. Cualitativamente, los 8B-16B de parámetros activos por token mantienen el coste por token en un rango moderado, pero el cuello de botella real es el ancho de banda de memoria agregado y la comunicación entre GPUs al enrutar expertos en cada capa.

## Comparativa con modelos similares

La información proporcionada solo permite comparar con el modelo base. No se han encontrado en la búsqueda web otros artefactos comparables de esta generación y tamaño.

| Aspecto | DeepSeek-V4.1-Flash (base) | DeepSeek-V4.1-Flash-UNCENSORED-FP8 |
|---|---|---|
| Parámetros totales | Declarado como 552B de backbone | 763.205.315.794 según safetensors |
| Contexto | 1.000.000 de tokens | 1.000.000 de tokens |
| Cuantización | FP8 nativo con expertos FP4 | FP8 nativo con expertos FP4 (sin cambios) |
| Licencia | no disponible en la información proporcionada | MIT declarada por el autor |
| ASR HarmBench-320 (`effort=max`) | 1,56 % | 100,00 % |
| MMLU-14k | 86,96 % | 82,74 % |
| Comportamiento de rechazo | Presente | Eliminado a nivel de pesos |
| Formato | safetensors | safetensors |
| Disponibilidad | Repositorio oficial de DeepSeek | Repositorio de terceros, 0 descargas |

Alternativas de la misma categoría (otros derivados abliterados de la familia DeepSeek u otros modelos frontera con contexto de 1M): no disponible en la información proporcionada.

## Limitaciones y advertencias

- Los propios datos del autor acreditan un 100 % de tasa de éxito de ataque en las siete categorías de HarmBench-320, con cero rechazos duros, cero rechazos blandos y cero evasivas. Esto incluye 42 ítems de `chemical_biological` y 52 de `cybercrime_intrusion`. El modelo no ofrece ninguna resistencia a peticiones de este tipo.
- Precedente documentado de degradación selectiva: pese a que el autor presenta la modificación como "quirúrgica", MMLU cae 4,22 pp y `moral_scenarios` se desploma 39,89 pp. La afirmación de que se preserva la capacidad "byte a byte" es incompatible con esas cifras: la eliminación del rechazo arrastra consigo el juicio normativo.
- Contradicción en los metadatos: la model card declara 552B de backbone, mientras que los safetensors del repositorio suman 763,2B parámetros y el tamaño en disco (510,3 GB) es coherente con esta última cifra, no con la primera. Conviene verificar antes de asumir cualquier requisito de hardware.
- Riesgo de alucinación: no hay datos de TruthfulQA ni de ninguna evaluación de veracidad en la información disponible.
- Idiomas: no declarados. Se desconoce el comportamiento en castellano.
- Licencia: el autor declara MIT, pero el modelo base es un derivado de DeepSeek con su propia licencia y condiciones de uso. Una licencia MIT aplicada por un tercero no puede relajar las restricciones del modelo original. Verificar la compatibilidad antes de cualquier uso comercial.
- Riesgo legal en producción: un sistema que genere contenido dañino sin filtro puede incurrir en responsabilidad civil y, en la Unión Europea, chocar con las prohibiciones del artículo 5 del Reglamento de IA, además de las obligaciones de transparencia aplicables a modelos de propósito general.
- Sin validación independiente: 0 descargas, 0 me gusta y publicación y actualización en la misma fecha. Ninguno de los resultados de la model card ha sido replicado por terceros.
- Riesgo de integridad del checkpoint: el autor afirma que no hay código personalizado ni hooks, lo que reduce la superficie de ataque, pero no se ha publicado ninguna verificación reproducible de que los pesos sean idénticos a los del base salvo en el comportamiento de rechazo. Existe también la posibilidad de que parte de los resultados de HarmBench se deban a un prompt de sistema o a una plantilla de chat concretos, no solo a la modificación de pesos.
- Cualquier despliegue con entrada de usuario no confiable, salida visible para terceros o generación de material difundible multiplica el daño potencial y no es asumible.
- No se documenta comportamiento en conversaciones multiturno ni resistencia a jailbreaks indirectos más allá de lo indicado en la model card.

## Enlaces

- Ficha de HuggingFace del modelo: https://huggingface.co/isihdfg/DeepSeek-V4.1-Flash-UNCENSORED-FP8
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash
- Cuenta del autor en X: https://x.com/dealignai
- Cuenta del autor en X: https://x.com/jordanschenck
- La búsqueda web realizada no ha devuelto resultados relevantes (únicamente páginas de soporte de Microsoft sin relación con el modelo). No hay papers, blogs técnicos ni repositorios adicionales disponibles en la información proporcionada.
