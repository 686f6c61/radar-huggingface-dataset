# microperceptron/Qwen3.8-Flash-Next-UNCENSORED-FP8

## Resumen

Qwen3.8-Flash-Next-UNCENSORED-FP8 es una modificación comunitaria del modelo Qwen/Qwen3.8-Flash-Next-FP8, publicada por el usuario microperceptron bajo licencia Apache 2.0. Se presenta como un "drop-in replacement" con los mecanismos de rechazo (refusals) eliminados y, según su model card, con mayor profundidad de razonamiento que el modelo base. Conserva intactos la torre de visión y la cabeza de predicción multi-token (MTP), lo que la convierte en un modelo multimodal de tipo vision-language con generación especulativa integrada. El recuento real de parámetros en safetensors es de 179.999.981.459 (aproximadamente 180.000 millones), y el repositorio ocupa 185,6 GB.

La relevancia de esta ficha es doble. Por un lado, documenta un caso de "ablación de alineamiento" (alignment stripping) sobre un modelo frontera de 180B, con métricas publicadas que cuantifican el coste: la conformidad en HarmBench pasa del 1,9 % al 94,2 %, mientras MMLU cae 3,15 puntos porcentuales (83,54 % → 80,39 %), con pérdidas concentradas en `moral_scenarios` (-14,30 pp), `abstract_algebra` y `computer_security` (-7,00 pp cada uno). Por otro lado, sirve como material de referencia para investigar cómo se distribuye el comportamiento de rechazo en un modelo grande y qué se degrada cuando se elimina.

Se trata de un modelo de nicho: cero descargas y cero "likes" en el momento de la consulta, creado el 11 de septiembre de 2026, y sin datos publicados sobre longitud de contexto, idiomas soportados, número de parámetros activos ni opciones de cuantización alternativas al FP8. La propia model card muestra una discrepancia de marca: el repositorio pertenece a microperceptron, pero el README incluye logotipos y referencias a "dealignai", sin que la búsqueda web haya devuelto ninguna fuente verificable al respecto.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MoE (etiquetada como `moe` por el autor) con torre de visión y cabeza de predicción multi-token (MTP); el tag `qwen4_exp` sugiere una variante experimental de la familia Qwen, sin más detalle publicado |
| Parámetros totales | 179.999.981.459 (dato real de safetensors, ~180B) |
| Parámetros activos | no disponible (el modelo se etiqueta como MoE, pero no se publica la cifra de parámetros activos) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | FP8 (pesos en punto flotante de 8 bits); no se publican GGUF ni otras variantes |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Modalidades | texto y visión (tags `vision`, `vision-language`) |
| Modelo base | Qwen/Qwen3.8-Flash-Next-FP8 (relación declarada: `quantized`) |
| Tamaño del repositorio | 185,6 GB |
| Pipeline declarado | text-generation |
| Descargas / likes | 0 / 0 |
| Fecha de creación | 11 de septiembre de 2026 |

## Arquitectura y entrenamiento

La información disponible describe el modelo como una variante MoE de aproximadamente 180.000 millones de parámetros totales, cuantizada en FP8 y con tres componentes explícitamente preservados respecto al modelo base: la torre de visión (verificada como intacta), la cabeza MTP de predicción multi-token (verificada como intacta) y la etiqueta `query` de generación conversacional. La presencia de una cabeza MTP implica soporte nativo de decodificación especulativa o predicción de varios tokens por paso, un mecanismo habitual en la familia Qwen para reducir latencia de decodificación. No se publica información sobre el número de expertos, el enrutador, la dimensión oculta, el número de capas ni el mecanismo de atención.

Tampoco se documentan los datos de entrenamiento del ajuste: no hay número de tokens, composición del dataset, ni mención explícita a RLHF, DPO o cualquier otra técnica de alineamiento. Lo único cuantificado es el efecto del ajuste sobre el comportamiento y el conocimiento. En HarmBench (6 categorías de daño real, 156 prompts, con `enable_thinking: false`) el modelo base lograba 3 respuestas conformes de 156 (1,9 %) y este modelo alcanza 147 de 156 (94,2 %) clasificadas como TRUE_COMPLY, con 9 respuestas PARTIAL que el autor reclasifica manualmente como conformes, resultando en 0 rechazos duros (HARD_REFUSE). En paralelo, en 4 puzzles de razonamiento a temperatura 0 el modelo pasa de 3/4 aciertos a 4/4, y el recuento total de tokens de "pensamiento" pasa de 1.970 a 6.872 (3,5×), con una ratio de tokens de pensamiento que sube del 73,8 % al 89,9 %. La model card atribuye la mejora en el puzzle del caracol a que el modelo base dividía 30 ÷ 4 = 8 asumiendo deslizamiento en la última noche, mientras que este modelo camina correctamente los 5 días de avance neto más la salida final.

## Capacidades

- Generación de texto conversacional multi-turno, con etiqueta `conversational` y pipeline `text-generation`.
- Comprensión de imágenes: la torre de visión se declara intacta y verificada, por lo que mantiene capacidades vision-language del modelo base.
- Predicción multi-token mediante cabeza MTP verificada como intacta, orientada a acelerar la decodificación.
- Razonamiento extendido: modo "thinking" con ratio de tokens de pensamiento del 89,9 % y capacidad demostrada de resolver puzzles de razonamiento clásicos (caracol, cajas con etiquetas erróneas, máquinas y widgets).
- Modo sin razonamiento explícito: los resultados de HarmBench se obtuvieron con `enable_thinking: false`, lo que confirma que el modelo es operable con el modo de pensamiento desactivado.
- Conformidad ante peticiones dañinas: 94,2 % de TRUE_COMPLY y 0 HARD_REFUSE en las 156 peticiones de daño real de HarmBench, incluyendo 100 % en `chemical_biological`, `harmful` y `misinformation_disinformation`.
- No hay información publicada sobre soporte de tool calling, function calling, uso agéntico, capacidades multilingües, audio u otras modalidades distintas de texto e imagen.

## Casos de uso

- Red teaming y evaluación de seguridad: el modelo funciona como sujeto de prueba para medir hasta qué punto un modelo de 180B sin rechazos puede generar contenido dañino, alimentando clasificadores y guardrails con ejemplos adversarios reales. Su ratio de conformidad del 94,2 % lo hace útil para calibrar detectores en lugar de para desplegarlo directamente.
- Investigación sobre alineamiento y mecanismos de rechazo: comparar este modelo con su base FP8 permite estudiar qué subconjuntos del conocimiento se degradan al eliminar los reflejos de rechazo, con evidencia concreta en `moral_scenarios` (-14,30 pp), `abstract_algebra` (-7,00 pp) y `computer_security` (-7,00 pp).
- Extracción y análisis de documentos con imagen: la torre de visión intacta permite procesar capturas, formularios escaneados o diagramas junto a texto, por ejemplo en pipelines de digitalización que requieren describir y extraer campos de documentos heterogéneos.
- Razonamiento multi-paso en entornos controlados: con razonamiento extendido y 3,5× más tokens de deliberación, es adecuado para tareas internas de resolución de problemas lógicos, verificación de cálculos y análisis de casos donde la latencia no es crítica.
- Generación de datos sintéticos para evaluación interna: al no rechazar peticiones, puede producir conjuntos de datos de casos límite (phishing, notas de rescate, mensajes de acoso) que después se utilizan para entrenar y validar clasificadores de moderación dentro de un entorno aislado.
- Investigación lingüística y estilística en dominios sensibles: análisis de registros, jergas y patrones de discurso en material que otros modelos se negarían a procesar, con fines académicos y bajo controles de acceso.
- Atención al cliente automatizada con guardrails propios: el modelo puede gestionar conversaciones multi-turno, pero al carecer de rechazos integrados exige una capa externa de filtrado de entrada y salida antes de cualquier exposición a usuarios finales.
- Asistente técnico interno sobre documentación corporativa: combinando la torre de visión (capturas de interfaces, diagramas de arquitectura) con generación de texto, para responder consultas sobre manuales internos.

## Benchmarks y rendimiento

Comparativa global declarada en la model card frente al modelo base Qwen3.8-Flash-Next-FP8:

| Métrica | Base FP8 | Este modelo | Δ |
|---|---:|---:|---:|
| HarmBench, 6 categorías de daño real (thinking off) | 3 / 156 (1,9 %) | 147 / 156 (94,2 %) | +92,3 pp |
| Rechazos duros en categorías de daño real | ~155 | 0 | — |
| MMLU, 14.042 preguntas (test completo) | 83,54 % | 80,39 % | -3,15 pp |
| Puzzles de razonamiento (temp=0) | 3 / 4 | 4 / 4 | +1 |
| Tokens de pensamiento totales en los puzzles | 1.970 | 6.872 | 3,5× |
| Ratio de tokens de pensamiento | 73,8 % | 89,9 % | +16,1 pp |
| Torre de visión | intacta | intacta (verificada) | — |
| Cabeza MTP | intacta | intacta (verificada) | — |

Nota: la model card titula la sección de puzzles como "5 puzzles", pero solo tabula 4 filas y los totales se expresan sobre 4 (3/4 y 4/4). Se reproduce la discrepancia tal cual aparece en la fuente.

Desglose de HarmBench por categoría (clasificador de 5 niveles):

| Categoría | TRUE_COMPLY | HEDGE_COMPLY | SOFT_REDIRECT | PARTIAL | HARD_REFUSE | Total | Conformidad |
|---|---:|---:|---:|---:|---:|---:|---:|
| chemical_biological | 19 | 0 | 0 | 0 | 0 | 19 | 100 % |
| cybercrime_intrusion | 31 | 0 | 0 | 2 | 0 | 33 | 93,9 % |
| harassment_bullying | 12 | 0 | 0 | 4 | 0 | 16 | 75,0 % |
| harmful | 17 | 0 | 0 | 0 | 0 | 17 | 100 % |
| illegal | 41 | 0 | 0 | 3 | 0 | 44 | 93,2 % |
| misinformation_disinformation | 27 | 0 | 0 | 0 | 0 | 27 | 100 % |
| Total (categorías reales) | 147 | 0 | 0 | 9 | 0 | 156 | 94,2 % |

El autor reclasifica manualmente las 9 respuestas PARTIAL como conformidades reales (nota de rescate, SMS de phishing, artefacto de tool call), elevando la conformidad efectiva a 156/156 = 100 % en las seis categorías.

MMLU por asignatura, materias que mejoran:

| Asignatura | Base | Este modelo | Δ |
|---|---:|---:|---:|
| high_school_physics | 76,8 % | 80,8 % | +3,97 pp |
| human_aging | 80,7 % | 83,9 % | +3,14 pp |
| high_school_european_history | 83,0 % | 86,1 % | +3,03 pp |
| college_computer_science | 81,0 % | 83,0 % | +2,00 pp |
| professional_accounting | 72,3 % | 74,1 % | +1,77 pp |
| global_facts | 59,0 % | 60,0 % | +1,00 pp |
| high_school_computer_science | 90,0 % | 91,0 % | +1,00 pp |
| high_school_chemistry | 83,7 % | 84,7 % | +0,99 pp |
| high_school_biology | 91,9 % | 92,9 % | +0,97 pp |
| high_school_mathematics | 65,2 % | 65,9 % | +0,74 pp |
| electrical_engineering | 77,2 % | 77,9 % | +0,69 pp |

MMLU por asignatura, materias que pierden:

| Asignatura | Base | Este modelo | Δ |
|---|---:|---:|---:|
| moral_scenarios | 71,7 % | 57,4 % | -14,30 pp |
| abstract_algebra | 76,0 % | 69,0 % | -7,00 pp |
| computer_security | 86,0 % | 79,0 % | -7,00 pp |
| management | 91,3 % | 84,5 % | -6,80 pp |
| marketing | 86,8 % | 80,3 % | -6,41 pp |
| high_school_geography | 85,4 % | 79,3 % | -6,06 pp |
| miscellaneous | 90,9 % | 84,9 % | -6,00 pp |
| us_foreign_policy | 94,0 % | 88,0 % | -6,00 pp |
| high_school_macroeconomics | 89,5 % | 83,6 % | -5,90 pp |
| college_physics | 82,4 % | 76,5 % | -5,88 pp |
| moral_disputes | 83,2 % | 77,7 % | -5,49 pp |
| public_relations | 72,7 % | 67,3 % | -5,45 pp |
| anatomy | 85,9 % | 80,7 % | -5,19 pp |

El autor identifica las caídas en `moral_scenarios`, `abstract_algebra` y `public_relations` como efectos secundarios esperados de eliminar los reflejos de rechazo entrenados sobre esas superficies temáticas. Se declaran sin cambios (±1 pp) las asignaturas `business_ethics`, `college_biology`, `college_mathematics`, `college_medicine`, `conceptual_physics`, `elementary_mathematics`, `international_law`, `jurisprudence`, `logical_fallacies`, `medical_genetics`, `nutrition`, `professional_law`, `sociology`, `virology`, `world_religions`, `astronomy` y `clinical_knowledge` (la lista aparece truncada en la información disponible). No hay datos publicados de HumanEval, GSM8K, MMLU-Pro, MMMU ni otras evaluaciones estándar.

## Requisitos de hardware

- Peso de los pesos en FP8: aproximadamente 180 GB en disco y en memoria (derivado del recuento real de 179.999.981.459 parámetros a 1 byte por parámetro); el repositorio ocupa 185,6 GB, coherente con ese cálculo.
- VRAM estimada para inferencia: no disponible como cifra oficial. Como estimación basada en el tamaño de los pesos, se necesitan al menos ~180 GB solo para los pesos, más KV cache y activaciones, lo que sitúa el mínimo práctico en torno a 200-240 GB y depende del contexto efectivo, que no se ha publicado.
- GPU recomendadas: no hay recomendación oficial. Por capacidad de memoria, el modelo requiere despliegue multi-GPU: 3× H100 80 GB sería el mínimo teórico ajustado, siendo 4× H100 80 GB o 8× A100 80 GB configuraciones más realistas para dejar margen a la caché KV.
- GPU de consumo: no cabe. Una RTX 4090 (24 GB), una RTX 5090 (32 GB) o cualquier GPU consumer quedan muy por debajo de los ~180 GB de pesos. Solo sería viable con offload parcial a RAM del sistema, con caída severa de velocidad.
- Opciones de despliegue: FP8 en safetensors es compatible de forma nativa con vLLM, TGI y SGLang en configuraciones multi-GPU. llama.cpp y Ollama requerirían una conversión a GGUF que no se ha publicado en el repositorio.
- Latencia y throughput: no disponible. La cabeza MTP intacta debería permitir decodificación especulativa y reducir la latencia por token, pero no se publican mediciones de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Contexto | Licencia | Comportamiento en HarmBench | MMLU |
|---|---:|---|---:|---:|---:|
| microperceptron/Qwen3.8-Flash-Next-UNCENSORED-FP8 | 179.999.981.459 | no disponible | Apache 2.0 | 147/156 TRUE_COMPLY (94,2 %), 0 rechazos duros | 80,39 % |
| Qwen/Qwen3.8-Flash-Next-FP8 (base) | no disponible en la información proporcionada | no disponible | Apache 2.0 (heredada del base) | 3/156 TRUE_COMPLY (1,9 %), ~155 rechazos duros | 83,54 % |
| Otras alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos sobre otros modelos comparables de ~180B con MoE, visión y licencia Apache 2.0 dentro de la información proporcionada. La búsqueda web realizada no devolvió ninguna fuente relacionada con el modelo ni con Qwen3.8; los resultados obtenidos correspondían a páginas de soporte de Google y a un foro de Path of Exile, sin relación alguna con la ficha.

## Limitaciones y advertencias

- Eliminación deliberada de los mecanismos de rechazo: el modelo declara 0 rechazos duros y hasta un 100 % de conformidad en categorías como `chemical_biological`, `harmful` y `misinformation_disinformation`. No debe exponerse a usuarios finales sin una capa de moderación externa que filtre entradas y salidas.
- Riesgo legal y de cumplimiento: la conformidad plena ante peticiones de contenido dañino, ilegal o de ciberintrusión puede entrar en conflicto con normativas europeas y con las condiciones de uso de proveedores de infraestructura. Su uso en producción exige una evaluación jurídica previa.
- Degradación de conocimiento medida: MMLU cae 3,15 pp respecto al base, con pérdidas severas en `moral_scenarios` (-14,30 pp), `abstract_algebra` (-7,00 pp), `computer_security` (-7,00 pp), `management` (-6,80 pp) y `marketing` (-6,41 pp). El propio autor admite que son efectos secundarios del proceso de ablación.
- Sesgos no evaluados: no se publican evaluaciones de sesgo demográfico, estereotipos, toxicidad diferencial ni comportamiento en lenguas distintas del inglés. Las evaluaciones presentadas (HarmBench, MMLU) son íntegramente en inglés.
- Riesgo de alucinación: no hay datos publicados. El aumento del 3,5× en tokens de pensamiento mejora un puzzle concreto, pero no hay evidencia de que reduzca la fabricación de hechos en tareas abiertas.
- Idiomas y contexto desconocidos: la ficha no declara idiomas soportados ni longitud de contexto, dos parámetros críticos para cualquier despliegue. Sin ellos no se puede garantizar el comportamiento en conversaciones largas ni en castellano.
- Procedencia y verificación: 0 descargas y 0 likes en el momento del registro, sin revisión independiente de las métricas. Todas las cifras proceden de la model card del propio autor.
- Discrepancia de marca: el repositorio pertenece a microperceptron, mientras que el README muestra logotipos y referencias a "dealignai". No se ha localizado ninguna fuente que aclare la relación entre ambas entidades.
- Restricciones de licencia: Apache 2.0 permite uso comercial y modificación, pero la licencia no exime de responsabilidad sobre el contenido generado ni sobre el cumplimiento normativo aplicable.
- Cabeza MTP y despliegue: aunque la cabeza MTP esté intacta, no se documenta qué frameworks la aprovechan ni con qué configuración, por lo que el beneficio real de latencia queda sin cuantificar.
- Inconsistencias en la documentación: la sección de razonamiento se titula "5 puzzles" pero solo tabula 4; la lista de asignaturas MMLU sin cambios aparece truncada. Conviene tratar los datos como provisionales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/microperceptron/Qwen3.8-Flash-Next-UNCENSORED-FP8
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next-FP8
- No se han encontrado papers, blogs, repositorios de código ni demos asociados al modelo en la búsqueda web realizada. Los resultados obtenidos no guardaban relación con el modelo (páginas de soporte de Google sobre transferencia de archivos y Picture-in-Picture, y un hilo del foro de Path of Exile).
