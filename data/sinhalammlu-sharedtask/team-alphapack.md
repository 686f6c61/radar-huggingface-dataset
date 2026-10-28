# SinhalaMMLU-SharedTask/team-AlphaPack

## Resumen

`SinhalaMMLU-SharedTask/team-AlphaPack` no es un modelo con pesos propios, sino un paquete de envío (submission package) para la tarea compartida SinhalaMMLU. Lo firma el equipo AlphaPack —Umesh Yapa, Esandu Epa, Lasal Jayasinghe y Amasha Ranasinghe— y su contenido son scripts de inferencia, predicciones ya generadas y material de auditoría, no un checkpoint entrenado. El sistema se apoya en el modelo base `google/gemma-4-E4B-it` (revisión fijada `ee0ef6023621cff504d758262d4e04895a5af4a2`) sin adaptadores adicionales: no se declara fine-tuning, LoRA ni recuperación externa.

La técnica consiste en explotar el modo de razonamiento nativo de Gemma 4 (`enable_thinking=True`) junto con una plantilla de prompt denominada V2, que obliga al modelo a escribir primero la explicación y a cerrar con una última línea con el formato exacto `ANSWER: X`. La decodificación es voraz (`do_sample=False`) y se aplican reintentos cuando la respuesta no se puede parsear. El texto del prompt está fijado por SHA-256 dentro de `inference.py`, y el recuento de parámetros en tiempo de inferencia verificado es de 7.941.100.832 (7,9411B), por debajo del límite de 8.000 millones e incluyendo los módulos de visión y audio.

Su relevancia es doble: por un lado documenta una receta de prompting reproducible para evaluación multilingüe de opción múltiple; por otro, es un ejemplo poco habitual de transparencia sobre los límites de la propia reproducibilidad, ya que el propio README califica el estado como «audited submission CANDIDATE» y admite que no se ha ejecutado una reproducción limpia completa en GPU.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (heredada del modelo base `google/gemma-4-E4B-it`; no se describe en el paquete) |
| Parametros totales | 7.941.100.832 en tiempo de inferencia (incluye módulos de visión y audio), según verificación del cuaderno de recuperación del autor |
| Parametros activos | no disponible (no se indica que el modelo base sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponibles en el paquete; la ejecución documentada usa FP16 |
| Idiomas soportados | no disponible; el conjunto evaluado (SinhalaMMLU) es de sinhala |
| Licencia | no disponible para el repositorio; el modelo base es de acceso restringido (gated) y requiere aceptar la licencia Gemma |
| Formato de pesos | no disponible (el paquete no incluye pesos: `inference.py` descarga el modelo base desde Hugging Face) |

## Arquitectura y entrenamiento

El paquete no entrena nada: no hay fine-tuning, adaptadores ni datos de entrenamiento adicionales, según declara explícitamente la model card (`training/README.md` y `data/README.md`). Todo el comportamiento se obtiene por prompting sobre el checkpoint `google/gemma-4-E4B-it`, con razonamiento nativo activado y una plantilla V2 «explicación primero, respuesta al final» que fuerza la salida `ANSWER: X` en la última línea. La decodificación es greedy, con una primera pasada en lotes de 4 y 2.048 tokens nuevos, y reintentos dirigidos en lotes de 1 con 4.096 tokens nuevos para las respuestas inválidas; un parser estricto filtra y valida el resultado final.

El detalle técnico más relevante no es el modelo sino el aparato de auditoría: el conjunto original `E4B_COMBINED_2206_WITH_FAILED32.zip` incluye 2.206 predicciones válidas y 32 fallos con sus salidas en bruto, un manifiesto SHA-256 del dataset y el script de fusión original. Una auditoría offline independiente verificó que las 2.206 entradas coinciden exactamente con `predictions.jsonl` y que los 32 índices restantes son disjuntos y con metadatos de pregunta coincidentes. El fichero de envío final tiene 2.238 filas y SHA-256 `dcf8cf70066f06b56c319a5eb6604bbeb823cc70096ab8a5c40e8c6d05e06b00`. La ejecución histórica de investigación se hizo en Kaggle con 2× NVIDIA T4, FP16 y atención SDPA, con semilla 2026 (valor reconstruido, no confirmado contra registros de producción).

## Capacidades

- Razonamiento de opción múltiple sobre conocimiento específico de sinhala mediante el conjunto SinhalaMMLU, con trazas de razonamiento explícitas antes de la respuesta.
- Modo «thinking» nativo (`enable_thinking=True`) del modelo base, activado en todas las peticiones del sistema.
- Salida estructurada y parseable: última línea con el formato exacto `ANSWER: X`, validada por un parser estricto con reintentos automáticos ante respuestas inválidas.
- Procesamiento multimodal potencial: el recuento de parámetros incluye módulos de visión y audio, aunque el paquete no documenta su uso en esta tarea.
- Ejecución autocontenida: `inference.py` descarga el modelo, carga todos los `.json` del repositorio de datos y escribe `predictions.jsonl` en el formato de etiqueta numérica exigido.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes o razonamiento multi-paso más allá de la cadena de pensamiento interna: no disponible.
- Capacidades multilingües declaradas: no disponibles (solo se acredita el sinhala como idioma de evaluación).

## Casos de uso

- Evaluación comparativa de modelos en sinhala: el paquete sirve como referencia metodológica para medir un modelo en SinhalaMMLU con un protocolo de prompting fijo, hasheado y auditable, lo que permite comparar puntuaciones entre equipos sin ambigüedad en el formato de respuesta.
- Replicación de envíos en competiciones de NLP: el flujo `inference.py` → `check_submission.py` permite regenerar predicciones y compararlas byte a byte contra un fichero original mediante SHA-256, útil para verificar envíos antes de publicarlos.
- Extracción robusta de respuestas en pipelines de evaluación automática: el parser estricto con reintentos dirigidos (lotes de 1, 4.096 tokens) es reutilizable en cualquier benchmark de opción múltiple donde el modelo tienda a añadir texto tras la respuesta.
- Auditoría de reproducibilidad de artefactos científicos: la estructura `recovery/evidence/` con hashes, manifiestos de dataset y código de fusión original sirve como plantilla para documentar qué partes de un resultado son verificables y cuáles no.
- Investigación sobre razonamiento en modelos pequeños: con 7,9411B parámetros en FP16 sobre 2× T4, el sistema permite estudiar si el modo thinking mejora la precisión en tareas de conocimiento local sin presupuesto de GPU de gama alta.
- Prototipado de asistentes de conocimiento sobre Sri Lanka: el prompt V2 «explicación primero» es adaptable a preguntas abiertas sobre historia, cultura o legislación ceilandesa, aunque sin datos de calidad medidos en ese dominio.
- Docencia y formación en evaluación de LLM: el paquete ejemplifica de forma explícita las diferencias entre «el fichero de predicciones existe» y «el pipeline es reproducible en limpio», un caso didáctico poco frecuente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks (exactitud, MMLU, HumanEval, GSM8K u otros) en la información disponible. Los únicos datos numéricos del paquete son operativos, no métricas de calidad:

| Dato operativo | Valor |
|---|---|
| Filas del envio final (`predictions.jsonl`) | 2.238 |
| Predicciones validas de primera pasada | 2.206 |
| Fallos reintentados en la pasada dirigida | 32 |
| Parametros en inferencia | 7.941.100.832 (7,9411B) |
| Precisión numérica usada | FP16 |
| Hardware histórico | Kaggle NVIDIA T4 ×2, atención SDPA |
| Tiempo de ejecución completo medido | no disponible (no se ha medido una ejecución limpia completa) |
| Exactitud sobre SinhalaMMLU | no disponible |

## Requisitos de hardware

- VRAM estimada para inferencia: solo los pesos en FP16 ocupan aproximadamente 15,9 GB (cálculo derivado de 7.941.100.832 parámetros × 2 bytes); hay que añadir caché KV y activaciones, por lo que el requisito real es superior a esa cifra.
- GPU documentadas: 2× NVIDIA T4 (16 GB cada una) en Kaggle, configuración con la que se generó el envío histórico.
- GPU de 24 GB (RTX 3090/4090): los pesos en FP16 cabrían, pero el margen para caché KV y activaciones es ajustado y no está verificado en la documentación; requeriría cuantización u offload para tandas grandes.
- Cuantizaciones: no documentadas en el paquete; solo se acredita FP16.
- Opciones de despliegue: el paquete proporciona `inference.py` basado en Transformers y SDPA. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. El README indica que el conjunto de reintentos históricos usaba un límite de cuatro horas de ejecución, no una medida de tiempo real.
- Requisito de red y acceso: el modelo base está gated, por lo que hace falta aceptar la licencia Gemma en Hugging Face y autenticarse mediante `HF_TOKEN` o sesión previa; nunca se deben incrustar tokens en el código.

## Comparativa con modelos similares

No hay datos públicos en la información proporcionada sobre otros envíos de la tarea SinhalaMMLU ni sobre modelos comparables en sinhala, por lo que la comparación de rendimiento es "no disponible". La única comparación verificable es estructural, frente al modelo base:

| Criterio | team-AlphaPack (este paquete) | google/gemma-4-E4B-it (base) | Otras soluciones SinhalaMMLU |
|---|---|---|---|
| Parámetros en inferencia | 7.941.100.832 | mismos (no se modifica el checkpoint) | no disponible |
| Fine-tuning / adaptadores | ninguno | no aplica | no disponible |
| Contexto | no disponible | no disponible | no disponible |
| Estrategia | thinking nativo + prompt V2 + reintentos | requiere arnés externo | no disponible |
| Formato de salida | `ANSWER: X` parseado y validado | libre | no disponible |
| Licencia | no disponible en el repo; base gated (Gemma) | licencia Gemma, acceso restringido | no disponible |
| Pesos publicados | no (solo scripts y predicciones) | sí, en el Hub con acceso aprobado | no disponible |
| Métrica de calidad publicada | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Estado declarado por el propio autor: «audited submission CANDIDATE»; la reproducción limpia completa de las predicciones no se ha demostrado.
- No se ha ejecutado una inferencia en entorno limpio ni se ha comparado contra el fichero enviado; el README evita explícitamente afirmar reproducibilidad exacta.
- Faltan tres ZIP de shards originales: se registran sus nombres y hashes SHA-256, pero los ficheros no se aportan.
- El generador original de la primera pasada no existe como script único independiente; `inference.py` es una reconstrucción.
- Los ajustes de decodificación de la primera pasada (lote 4, 2.048 tokens) y la semilla 2026 están reconstruidos a partir de material de cuaderno, no probados como idénticos a la ejecución histórica de 2.206 preguntas.
- El cuaderno de recuperación de los 32 reintentos no incluye salidas de ejecución embebidas, solo el código.
- Riesgo de alucinación: no evaluado; no hay métricas de exactitud ni análisis de errores publicados.
- Sesgos: no documentados. No hay información sobre la composición del dataset de evaluación más allá de su origen en SinhalaMMLU.
- Cobertura lingüística: el paquete solo acredita sinhala; no se declara el comportamiento en otros idiomas ni en código mixto sinhala-inglés.
- Restricciones de licencia: el repositorio no declara licencia propia y el modelo base es gated con licencia Gemma, por lo que el uso comercial queda sujeto a los términos del modelo base y no a una licencia del paquete.
- Trazabilidad del equipo: la propia model card pide añadir los datos reales de los miembros y confirmar que no se omitieron adaptadores o recursos de entrenamiento de otros compañeros antes de publicar.
- Advertencia operativa: ejecutar `inference.py` sobrescribe el `predictions.jsonl` del directorio de trabajo; hay que conservar una copia inmutable del original.
- No es un artefacto desplegable: no contiene pesos, no define una API y no documenta latencia, throughput ni coste por petición.

## Enlaces

- Repositorio del sistema (Hugging Face): https://huggingface.co/SinhalaMMLU-SharedTask/team-AlphaPack
- Modelo base `google/gemma-4-E4B-it` (revisión `ee0ef6023621cff504d758262d4e04895a5af4a2`): https://huggingface.co/google/gemma-4-E4B-it
- Paper, blog, repositorio de código o demo adicionales: no disponible en la información proporcionada (el paquete referencia rutas internas como `recovery/evidence/`, `REPRODUCIBILITY_STATUS.md` y `check_submission.py`, sin URL pública).
