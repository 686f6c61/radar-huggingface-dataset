# RP-360/Qwen3.5-4B-mdr-narrative-grpo-codes-weighted

## Resumen

`RP-360/Qwen3.5-4B-mdr-narrative-grpo-codes-weighted` es un modelo de extracción de información clínica estructurada, desarrollado por RP-360, especializado en narrativas de eventos adversos de dispositivos médicos (MDR) procedentes de la base de datos MAUDE de la FDA. El modelo convierte texto libre de informes en JSON conforme al esquema propietario `mni-json-v2-codes`, con códigos IMDRF de problemas del dispositivo (Annex A) y de efectos sobre la salud (Annex E), además de citas textuales de evidencia. Está construido sobre la familia Qwen3.5-4B y es el tercer eslabón de una cadena de entrenamiento: un SFT con JSON completo, un SFT con ponderación de códigos y, finalmente, alineamiento con GRPO.

El modelo se presenta como una policy de razonamiento clínico de 4,49B parámetros (4.659.865.088 parámetros reales según los pesos publicados) ajustada mediante 300 pasos de Group Relative Policy Optimization con 2.400 rollouts y tamaño de grupo G = 8, guiados por una suite de recompensas programáticas de siete dimensiones. Es relevante porque aplica RLVR (reinforcement learning with verifiable rewards) a una tarea regulada con objetivos medibles: el autor reporta un Macro F1 combinado de 0,5143 en informes retenidos, frente a 0,2543 de la línea base por clase mayoritaria, y una tasa de conformidad estricta con el esquema del 98,0%.

La ficha técnica del repositorio no documenta la longitud de contexto, la composición del dataset ni el número de tokens de entrenamiento. Los pesos se publican fusionados en bfloat16 de 16 bits, el idioma declarado es únicamente inglés y la licencia indicada es Apache 2.0. El repositorio tiene 0 descargas y 0 likes, por lo que no cuenta con validación de la comunidad.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Familia Qwen3.5 (tag `qwen3_5`); la model card no detalla la arquitectura interna ni si es densa o MoE |
| Parametros totales | 4.659.865.088 (≈4,66 B) según los safetensors publicados; la model card declara 4,49 B |
| Parametros activos | No aplica: la información disponible no indica que sea un modelo MoE |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible; los pesos publicados están fusionados en bfloat16 de 16 bits y no se anuncian cuantizaciones (GGUF, AWQ, GPTQ) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (16-bit bfloat16, LoRA fusionada); biblioteca `transformers` |
| Tamano del repositorio | 9,3 GB |
| Pipeline declarado | text-generation |
| Modelo base | RP-360/Qwen3.5-4B-mdr-narrative-sft-codes-weighted (relación: finetune) |
| Esquema de salida | `mni-json-v2-codes` (solo códigos, sin definiciones embebidas) |
| Fecha de publicación | 21 de septiembre de 2026 (según metadatos del repositorio) |

## Arquitectura y entrenamiento

La información disponible no especifica la arquitectura interna más allá del tag `qwen3_5` y del modelo base de la familia Qwen3.5, del que hereda la torre de transformers. El modelo es un fine-tune en dos etapas sobre `RP-360/Qwen3.5-4B-mdr-narrative-sft-codes-weighted`, que a su vez deriva de un SFT con esquema JSON completo. La etapa final aplica GRPO durante 300 pasos con 2.400 rollouts y tamaño de grupo G = 8, optimizando una suite de recompensas programáticas de siete dimensiones. El entrenamiento se realizó con Unsloth y TRL según los tags del repositorio, y los adaptadores LoRA resultantes se fusionaron en los pesos publicados.

La innovación técnica principal es el uso de recompensas verificables con guardarraíles anti-manipulación: penalizaciones invariantes contra citas no fundamentadas (penalización dura de -0,20, denominada INV8), contra afirmaciones negadas y contra el "code flooding" (emisión masiva de códigos para maximizar cobertura), además de hidratación del vocabulario taxonómico para garantizar fidelidad de términos y definiciones. El autor reporta convergencia monótona de la recompensa desde -0,437 en arranque en frío hasta un pico de +0,9941 en el paso 286, con una media de +0,6509 en evaluaciones retenidas. El esquema `mni-json-v2-codes` reduce el presupuesto de tokens a aproximadamente 390 tokens por informe, lo que explica la mejora de latencia declarada (615 s para 200 informes frente a 1.127 s de la primera generación SFT). No se documentan en la información disponible el número total de tokens de entrenamiento, la composición del dataset ni si se aplicaron DPO u otras técnicas de alineamiento adicionales.

## Capacidades

- Extracción estructurada de narrativas de eventos adversos a JSON conforme al esquema `mni-json-v2-codes`, con tasa de conformidad sintáctica estricta del 98,0% y sin claves ausentes.
- Codificación de problemas del dispositivo con terminología IMDRF Annex A (Macro F1 de 0,4104 en informes retenidos).
- Codificación de efectos sobre la salud y daño al paciente con terminología IMDRF Annex E (Macro F1 de 0,6182).
- Clasificación del tipo de evento adverso (89,5% de exactitud), del nivel de gravedad del daño (90,0%) y del estado de examen del dispositivo (0,6300).
- Generación de citas de evidencia textuales verificables, con precisión declarada superior al 99,5% en coincidencia literal, reforzada por la penalización INV8.
- Fidelidad a términos y definiciones taxonómicas del 99,6% mediante hidratación del vocabulario, frente al 88,7% de la generación SFT previa basada en memoria paramétrica.
- Salida restringida a códigos (codes-only) con presupuesto de tokens reducido (≈390 tokens por informe).
- No se documentan en la información disponible capacidades de tool calling, function calling, razonamiento multi-paso explícito, modo "thinking", visión ni audio.
- El frontmatter de la model card declara `inference: false`, es decir, el autor no habilita la inferencia alojada de Hugging Face para este repositorio.

## Casos de uso

- Extracción automática de códigos IMDRF en pipelines de farmacovigilancia: el modelo transforma narrativas MAUDE en JSON con Annex A y Annex E directamente consumible por bases de datos regulatorias, con una conformidad de esquema del 98,0% que evita reintentos por errores de sintaxis.
- Triaje de problemas de dispositivo a escala: dado su coste de ≈390 tokens por informe y una latencia declarada de ≈3,1 segundos por informe en la evaluación del autor, es adecuado para procesar lotes de miles de informes en modo batch y priorizar los casos con mayor gravedad codificada.
- Auditoría de codificación humana: sus citas de evidencia literales y la penalización por citas no fundamentadas permiten generar una traza auditable que un revisor regulatorio puede contrastar contra el texto original.
- Señalización y detección de tendencias: los códigos Annex A y Annex E normalizados alimentan agregaciones temporales por familia de dispositivo para detectar incrementos anómalos de eventos adversos.
- Control de calidad previo a la sumisión regulatoria: la clasificación de gravedad (90,0% de exactitud) y de tipo de evento (89,5%) sirve como comprobación de consistencia frente a la codificación manual antes del envío.
- Generación de resúmenes estructurados para equipos de asuntos regulatorios: la salida JSON con citas verificables se integra en plantillas internas sin necesidad de reescribir el contenido clínico.
- Base para destilación o fine-tuning interno: al haberse entrenado con Unsloth y TRL y publicarse con licencia Apache 2.0, puede reutilizarse como punto de partida para ajustar el esquema a otras jurisdicciones o taxonomías, siempre que se genere un dataset etiquetado equivalente.

## Benchmarks y rendimiento

Resultados reportados por el autor sobre informes retenidos (50-200 informes según la métrica). La columna de línea base corresponde a la clase mayoritaria constante.

| Dimensión | Línea base | SFT JSON (Gen 1) | SFT codes-weighted (Gen 2) | GRPO codes-weighted (este modelo) | Techo empírico |
|---|---|---|---|---|---|
| Macro F1 Annex A (problemas del dispositivo) | 0,1723 | 0,4180 | 0,4360 | 0,4104 | 0,6040 |
| Macro F1 Annex E (efectos sobre la salud) | 0,3362 | 0,6360 | 0,6250 | 0,6182 | 0,7030 |
| Macro F1 combinado | 0,2543 | 0,5270 | 0,5305 | 0,5143 | 0,6535 |
| Tasa de conformidad de esquema | 0,0% | 99,0% (198/200) | 99,0% (198/200) | 98,0% (49/50) | 100,0% |
| Fidelidad de términos y definiciones | 0,0% | 88,7% | 99,6% | 99,6% | 100,0% |
| Precisión de citas de evidencia | 0,0% | 99,3% (398/401) | 99,3% (445/448) | >99,5% | 100,0% |
| Exactitud de tipo de evento adverso | 0,5380 | 90,5% | 89,0% | 89,5% | 1,0000 |
| Exactitud de gravedad del daño | 0,7730 | 89,5% | 90,0% | 90,0% | 1,0000 |
| Exactitud de examen del dispositivo | 0,5780 | 0,6400 | 0,6250 | 0,6300 | 1,0000 |
| Recompensa compuesta media (-1,0 a +1,0) | 0,0000 | no disponible | -0,4370 (inicio) | +0,6509 (pico +0,9941) | +1,0000 |
| Latencia de generación (200 informes) | no disponible | 1.127 s | 618 s | ≈615 s | no disponible |

No se han publicado en la información disponible resultados de benchmarks estándar de propósito general (MMLU, HumanEval, GSM8K) ni comparaciones con modelos clínicos externos.

## Requisitos de hardware

- VRAM estimada en bfloat16: ≈9,3 GB solo para pesos, más caché KV y activaciones; en la práctica se recomienda reservar 12-16 GB para inferencia estable con lotes pequeños (estimación propia a partir del tamaño de safetensors, no confirmada por el autor).
- Cuantizaciones de 8 bits y 4 bits reducirían el requisito a rangos de ≈5-6 GB y ≈3 GB respectivamente, pero no se publican cuantizaciones oficiales; habría que generarlas localmente.
- GPU recomendadas: A100 40/80 GB, H100, L40S o A10G para servicio por lotes; RTX 4090 (24 GB), RTX 3090 (24 GB) y RTX 4080 (16 GB) son suficientes para inferencia en bf16 con lotes pequeños.
- Cabe en GPU de consumo: sí, en tarjetas con 16 GB o más en bf16, y en tarjetas de 8-12 GB si se generan cuantizaciones de 8 o 4 bits.
- Opciones de despliegue: `transformers` (biblioteca declarada), vLLM o TGI para servicio con procesamiento por lotes; llama.cpp u Ollama solo si se generan pesos GGUF, que no se publican; Unsloth y TRL quedan indicados por el autor para reentrenamiento.
- Latencia declarada: ≈615 s para 200 informes (≈3,1 s por informe) en la evaluación del autor; hardware, tamaño de lote y configuración de decodificación no especificados.
- Throughput no disponible. La model card declara `inference: false`, por lo que no hay endpoint alojado en Hugging Face.

## Comparativa con modelos similares

La información disponible solo permite comparar con los eslabones previos de la propia cadena de entrenamiento. No se aportan datos frente a otros modelos clínicos o de extracción de información pública.

| Modelo | Parámetros | Contexto | Macro F1 combinado | Conformidad de esquema | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| GRPO codes-weighted (este modelo) | 4,66 B | no disponible | 0,5143 | 98,0% | Apache 2.0 | Hugging Face, pesos safetensors |
| RP-360/Qwen3.5-4B-mdr-narrative-sft-codes-weighted | no disponible | no disponible | 0,5305 | 99,0% | no disponible | Hugging Face |
| RP-360/Qwen3.5-4B-mdr-narrative-sft-json | no disponible | no disponible | 0,5270 | 99,0% | no disponible | Hugging Face |
| Línea base por clase mayoritaria | no aplica | no aplica | 0,2543 | 0,0% | no aplica | no aplica |
| Otros modelos clínicos comparables | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Modelo monolingüe en inglés: no se declara soporte de castellano ni de otras lenguas, lo que invalida su uso directo sobre narrativas en español.
- Dominio extremadamente estrecho: está especializado en narrativas MDR de dispositivos médicos según MAUDE (FDA). No es un modelo de propósito general y su rendimiento fuera de ese dominio no está documentado.
- El paso de RL no mejora el Macro F1 combinado respecto al SFT previo (0,5143 frente a 0,5305), y también retrocede en Annex A (0,4104 frente a 0,4360) y Annex E (0,6182 frente a 0,6250). Las ganancias declaradas del GRPO se concentran en recompensa, guardarraíles anti-manipulación y latencia, no en la métrica principal de codificación.
- El Macro F1 de Annex A (0,4104) está muy por debajo del techo empírico (0,6040): la clasificación de problemas del dispositivo sigue siendo el punto débil del sistema.
- Riesgo de alucinación de códigos y de términos taxonómicos. El autor lo mitiga con hidratación de vocabulario (99,6% de fidelidad) y con la penalización INV8 contra citas no fundamentadas, pero estas cifras proceden de la propia evaluación del autor y no de una validación independiente.
- Todos los benchmarks son autoinformados, sobre conjuntos retenidos de 50 a 200 informes y sin publicación revisada por pares ni replicación externa. Los resultados no deben extrapolarse a producción sin una evaluación propia.
- La model card está truncada en la información proporcionada: faltan las secciones de esquema objetivo, detalles de dataset y diagnóstico pre-GRPO, por lo que no es posible auditar la composición de los datos de entrenamiento ni los sesgos de muestreo de MAUDE.
- Licencia Apache 2.0 declarada en el repositorio, pero al ser un fine-tune de la familia Qwen3.5 conviene verificar los términos del modelo base original antes de un uso comercial.
- Inconsistencia de metadatos: el repositorio incluye el tag `image-text-to-text` mientras el pipeline declarado es `text-generation` y la tarea descrita es texto a texto. La model card no documenta ninguna capacidad de visión, por lo que debe tratarse como modelo exclusivamente de texto.
- El frontmatter declara `inference: false`; no hay endpoint alojado y el despliegue corre por cuenta del usuario.
- Sin validación de la comunidad: 0 descargas y 0 likes en el momento de la consulta.
- No debe utilizarse para decisiones clínicas directas ni como sustituto de la codificación regulatoria humana; está pensado como herramienta de extracción y apoyo a la revisión.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/RP-360/Qwen3.5-4B-mdr-narrative-grpo-codes-weighted
- Modelo base (SFT codes-weighted): https://huggingface.co/RP-360/Qwen3.5-4B-mdr-narrative-sft-codes-weighted
- Licencia Apache 2.0: https://opensource.org/licenses/Apache-2.0
- Artículo o preprint asociado: no disponible
- Repositorio de código o demo: no disponible
- Modelo Qwen3.5-4B original: no disponible en la información proporcionada
- La búsqueda web realizada no devolvió resultados relevantes sobre este modelo; los resultados obtenidos corresponden a páginas de una revista alemana sin relación con el contenido técnico.
