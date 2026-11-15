# Enrell/lain-parser

## Resumen

`lain-parser` es un modelo de clasificación de tokens (token-classification) especializado en el análisis de nombres de fichero para Lain, un servidor multimedia autoalojado. Lo desarrolla Enrell y se distribuye a través de Hugging Face como canal de publicación del servicio `lain-parser`: un repositorio inmutable de snapshots de encoder, artefactos exportados e instalador. El modelo resuelve un problema muy concreto: extraer estructura (título, temporada, episodio, calidad, grupo de subtítulos y demás metadatos) a partir de nombres de fichero de series y películas, tarea conocida como *filename parsing*.

La versión actual, `e5-s2`, es un parser con cabeza de *span* sobre un encoder AniFileBERT adaptado al dominio mediante *domain-adaptive pretraining* (DAPT) de 512 tokens de longitud, con características de clase Unicode y una pérdida semi-CRF. Tiene 28,5 millones de parámetros y ocupa 38 MiB en int8, lo que lo hace viable en CPU de gama baja (unos 54 ms por fila en 2 núcleos).

Su relevancia es acotada pero clara: los servidores multimedia autoalojados dependen de heurísticas frágiles basadas en expresiones regulares para interpretar nombres de fichero. Un modelo entrenado específicamente para esta tarea, con evaluación sobre un conjunto real bloqueado por hash, ofrece una alternativa más robusta y mantenible, aunque en estado de desarrollo y sin datos públicos de benchmarks generales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder tipo BERT (AniFileBERT) con cabeza de *span* y pérdida semi-CRF |
| Parametros totales | 28,5 M |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 512 tokens (ventana del encoder DAPT-512-long) |
| Tipos de cuantizacion | int8 (`model.int8.pt`); formato Go `model.fpgw` |
| Idiomas soportados | No disponible (orientado a nombres de fichero, predominantemente ASCII y Unicode) |
| Licencia | MIT |
| Formato de pesos | safetensors, PyTorch (`.pt`), `model.fpgw` (Go) |

## Arquitectura y entrenamiento

El modelo es un transformer encoder basado en AniFileBERT, adaptado al dominio mediante 40 épocas de *masked language modeling* continuado sobre un corpus no etiquetado de nombres de fichero. La variante `anifilebert-dapt512-long` fija la ventana en 512 tokens, suficiente para la mayoría de nombres de fichero reales, incluso los que incluyen múltiples metadatos encadenados.

Sobre el encoder se añade una cabeza de clasificación por *spans* con pérdida semi-CRF, que modela las transiciones entre etiquetas de forma estructurada, y características de clase Unicode como señal adicional. No se documenta en la información disponible el uso de RLHF, DPO ni el volumen exacto de tokens de entrenamiento. La evaluación es de grado de desarrollo: 137 de 196 aciertos exactos sobre un conjunto de nombres reales bloqueado por hash (mejora de 6,5 puntos porcentuales sobre la receta anterior) y 2 falsos positivos en 30 filas de abstención dorada.

## Capacidades

- Análisis de nombres de fichero con extracción de entidades estructuradas (título, temporada, episodio, resolución, códec, grupo de subtítulos, etc.).
- Clasificación de tokens con etiquetado de *spans*, adecuada para segmentar cadenas con delimitadores variables.
- Abstención controlada: el modelo puede no emitir entidades cuando el nombre de fichero no contiene metadatos interpretables (evaluado con filas de abstención dorada).
- Inferencia en CPU con latencia moderada, pensada para ejecutarse junto al servidor multimedia.
- Capacidades multilingües: no disponible.
- Tool calling, agentes, visión, audio o modo de razonamiento: no disponible (no son capacidades de este modelo).

## Casos de uso

- Indexación de bibliotecas multimedia: el modelo se integra en el servidor Lain para interpretar nombres de fichero al escanear directorios, asignando título, temporada y episodio sin depender de expresiones regulares por cada convención de nombres.
- Renombrado y organización automática: a partir de las entidades extraídas, el servidor puede normalizar nombres de fichero y colocarlos en una estructura de carpetas coherente.
- Deduplicación y agrupación de episodios: al identificar temporada y número de episodio de forma estructurada, se pueden detectar duplicados o episodios faltantes en una serie.
- Despliegue en hardware modesto: con 38 MiB en int8 y unos 54 ms por fila en 2 núcleos de CPU, puede ejecutarse en el mismo equipo que el servidor multimedia sin GPU dedicada.
- Integración en el instalador del servicio: el repositorio incluye `install.sh`, que descarga el snapshot fijado, verifica los sha256 contra el manifiesto y prueba el parseo antes de reiniciar `lain-parser.service`, lo que facilita actualizaciones con rollback.
- Port a Go: el formato `model.fpgw` permite ejecutar la inferencia desde el servicio escrito en Go sin depender de un runtime de Python en producción.
- Filtrado de calidad de biblioteca: las entidades de resolución y códec permiten clasificar ficheros por calidad y priorizar su reproducción o transcodificación.

## Benchmarks y rendimiento

| Metrica | Resultado |
|---|---|
| Exactitud exacta (conjunto real bloqueado por hash) | 137/196 |
| Mejora sobre la receta anterior | +6,5 pp |
| Falsos positivos en filas de abstención dorada | 2 de 30 |
| Latencia por fila (CPU, 2 núcleos) | ~54 ms |

No se han publicado resultados de benchmarks generales (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: no requiere GPU; el artefacto int8 ocupa 38 MiB y el repositorio completo 0,3 GB.
- GPU recomendadas: no aplica; el modelo está diseñado para CPU.
- Cabe en cualquier equipo con CPU moderna; con 2 núcleos se obtienen unos 54 ms por fila.
- Opciones de despliegue: servicio propio `lain-parser` (instalador incluido), inferencia en Python con PyTorch y port en Go mediante `model.fpgw`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no son adecuados para este tipo de modelo.
- Throughput estimado: aproximadamente 18 filas por segundo en 2 núcleos de CPU, según la latencia declarada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| lain-parser (e5-s2) | 28,5 M | 512 tokens | Parsing de nombres de fichero | MIT | Hugging Face |
| AniFileBERT | No disponible | No disponible | Encoder base de dominio anime/ficheros | No disponible | No disponible |
| Alternativas genéricas de token-classification (p. ej. BERT-base NER) | ~110 M | 512 tokens | NER general | Variable | Hugging Face |

No se dispone de datos de rendimiento comparables para modelos de la misma tarea en la información proporcionada.

## Limitaciones y advertencias

- Modelo en estado de desarrollo: la evaluación es interna y de grado de desarrollo, no un benchmark público reproducible.
- Ámbito muy restringido: solo interpreta nombres de fichero; no es un modelo de propósito general y no debe usarse para otras tareas de NLP.
- Riesgo de error en convenciones poco frecuentes: nombres de fichero con formatos atípicos, idiomas no representados en el corpus o metadatos ambiguos pueden producir extracciones incorrectas.
- Idiomas soportados no documentados; el corpus de entrenamiento es un conjunto no etiquetado de nombres de fichero sin caracterización pública.
- Licencia MIT: permite uso comercial, pero el autor no ofrece garantías sobre el rendimiento en producción.
- Sin datos de sesgos ni de alucinación en el sentido generativo; el riesgo principal es la emisión de entidades incorrectas o la falta de abstención en casos ambiguos.
- Dependencia del ecosistema Lain: el repositorio es un canal de distribución del servicio, con estructura inmutable y manifiesto propio, lo que complica su reutilización fuera de ese contexto.

## Enlaces

- Hugging Face: https://huggingface.co/Enrell/lain-parser
- Repositorio del servidor Lain: https://github.com/enrell/lain
- Código fuente y procedencia del parser: https://github.com/enrell/filename-parser (directorio `packaging/lain-parser/`)
