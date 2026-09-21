# opg13/laya

## Resumen

Laya es un modelo de decisión no autoregresivo etiquetado por su autor como "System 1": recibe un estado (texto libre, correo, ticket o JSON) junto con preguntas tipadas y devuelve respuestas tipadas acompañadas de probabilidades calibradas, todo en una única pasada forward de aproximadamente 33 ms. No genera texto, por lo que no hay salida que parsear ni margen para alucinación textual: la salida es una distribución de probabilidad sobre opciones, puntuaciones o valores booleanos definidos por el usuario en tiempo de inferencia.

El repositorio `opg13/laya` (2,4 GB, formato safetensors, 421.293.830 parámetros reales) actúa como hub de la familia y contiene tres checkpoints: el raíz en inglés sobre backbone ModernBERT-large (421 M parámetros, contexto 512), un checkpoint multilingüe sobre mmBERT-base (322 M parámetros, contexto 1024 ampliable a 8k) y un checkpoint especializado en cuatro flujos de decisiones tipadas (ModernBERT-large, 421 M, contexto 1024, 0,766 de accuracy declarada). Incluye un componente `Router` que detecta el sistema de escritura y el idioma en menos de 0,5 ms en Python puro y despacha al checkpoint óptimo antes de la pasada forward.

Su relevancia para producción está en el coste y la calibración: en lugar de invocar un LLM generativo para tareas de enrutado, moderación o triaje, Laya resuelve la decisión con un encoder de 421 M parámetros en decenas de milisegundos, con latencias medidas de 39,5 ms (checkpoint inglés) y 32,8 ms (multilingüe) por pregunta sobre una GPU T4. El entrenamiento con aprendizaje por refuerzo contra reglas de puntuación estrictamente propias (RLCD) hace que reportar probabilidades honestas sea la única estrategia que maximiza la recompensa, según declara el autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder no autoregresivo (ModernBERT-large en el checkpoint raiz; mmBERT-base en el multilingue) |
| Parametros totales | 421.293.830 (checkpoint raiz, dato real de safetensors); 322 M en el checkpoint multilingue |
| Parametros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | 512 tokens (checkpoint raiz); 1024 tokens, ampliable hasta 8k, en los otros dos checkpoints |
| Tipos de cuantizacion | No disponible (no se documentan GGUF, AWQ, GPTQ ni variantes cuantizadas) |
| Idiomas soportados | El repositorio no declara campo de idiomas. La model card atribuye al checkpoint multilingue cobertura de mas de 100 idiomas y 51 idiomas evaluados; el checkpoint raiz esta orientado a ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

Laya no es un modelo generativo sino un clasificador de decisión. El usuario define en tiempo de inferencia un conjunto de preguntas tipadas —`choice` (elección entre criterios), `score` (puntuación ordinal) y `noul` (respuesta booleana)— y el modelo devuelve, para cada pregunta, una respuesta con su probabilidad asociada. La arquitectura subyacente es un encoder transformer: ModernBERT-large en los checkpoints raíz y de decisiones tipadas, y mmBERT-base en el multilingüe. El checkpoint raíz procesa 512 tokens de contexto; los otros dos llegan a 1024 con extensión hasta 8k.

El entrenamiento se realizó con aprendizaje por refuerzo contra reglas de puntuación estrictamente propias (RLCD, *Reinforcement Learning with Calibrated Decisions* según la nomenclatura del autor), un esquema en el que maximizar la recompensa exige reportar la probabilidad verdadera en lugar de una confianza inflada. La innovación operativa destacable es el `Router`: un mecanismo de detección de escritura e idioma que se ejecuta en menos de 0,5 ms en Python puro y elige el checkpoint antes de la pasada forward. El autor justifica este diseño con evidencia de fallo del checkpoint inglés ante escrituras no latinas: en jemer alcanza 0,000 de accuracy manteniendo 0,952 de confianza, lo que invalida cualquier estrategia de *confidence gating* posterior. El número de tokens de entrenamiento, la composición del dataset y el detalle del pipeline de RL no se especifican en la información disponible.

## Capacidades

- Clasificación y decisión no generativa: devuelve elecciones, puntuaciones ordinales y valores booleanos con probabilidad calibrada, sin producir texto libre.
- Preguntas tipadas en tiempo de inferencia: los tipos documentados son `choice`, `score` y `noul`.
- Entrada estructurada: acepta estados en texto plano, correo electrónico (campos `from`, `subject`, `body`), tickets y JSON.
- Multilingüismo mediante enrutado: el `Router` detecta el idioma y el sistema de escritura y despacha al checkpoint adecuado; el checkpoint multilingüe cubre más de 100 idiomas según la model card.
- Enrutado de modelos: selección automática entre checkpoints con metadatos de decisión (modelo elegido, repositorio y motivo del enrutado).
- Ejecución en una sola pasada forward, sin decodificación autoregresiva ni bucle de generación.
- Uso declarado para guardrails, moderación y triaje, según los tags del repositorio.
- Llamada a herramientas o function calling: no disponible.
- Capacidades de agente multi-paso, visión o audio: no disponibles; el modelo es exclusivamente de texto.
- Modo *thinking*: no disponible.

## Casos de uso

- Triaje de correo y tickets de soporte: el ejemplo documentado por el autor usa un estado con remitente, asunto y cuerpo para responder simultáneamente a cuatro preguntas —departamento (`choice`: billing, technical, sales, other), urgencia (`score`), riesgo de churn (`noul`) y petición de reembolso (`noul`)—. El modelo devuelve por ejemplo `billing` con 0,94 de confianza en inglés y 0,86 en hindi, en menos de 40 ms.
- Enrutado previo a un LLM generativo: usar Laya como clasificador de System 1 para decidir si una consulta requiere un modelo grande, reduciendo el número de llamadas costosas y la latencia total del pipeline.
- Guardrails y moderación de contenido: formular preguntas booleanas sobre políticas concretas y actuar sobre la probabilidad devuelta en lugar de sobre texto generado, lo que elimina el riesgo de que el propio moderador alucine una justificación.
- Atención al cliente multilingüe: el `Router` detecta automáticamente el idioma del mensaje entrante y lo envía al checkpoint multilingüe (32,8 ms por pregunta en T4), permitiendo una única integración para más de 100 idiomas.
- Puntuación de riesgo y priorización: el tipo `score` devuelve una puntuación ordinal con probabilidad calibrada, adecuada para ordenar colas de trabajo (antigüedad de un ticket, severidad, probabilidad de impago) donde se necesita una magnitud interpretable y no una etiqueta discreta.
- Etiquetado automático de corpus a escala: al no generar texto y ser no autoregresivo, permite procesar grandes volúmenes con lotes de preguntas; el autor reporta 72,3 ms para 10 preguntas agrupadas en el checkpoint multilingüe.
- Extracción de señales estructuradas de texto libre en pipelines de datos: convertir correos, formularios o notas en campos booleanos y categóricos listos para una base de datos, sin etapas de parseo de JSON generado.
- Despliegue en entornos con recursos limitados: al ser un encoder de 421 M parámetros y 2,4 GB de repositorio, puede ejecutarse en CPU o en GPUs de gama de entrada, cosa que un LLM generativo de calidad comparable no permite.

## Benchmarks y rendimiento

Datos publicados en la model card del autor (autoinformados), sobre un banco compartido de 17.416 preguntas, una única GPU T4 y las mismas preguntas por modelo:

| Benchmark / tarea | Ingles (`laya`) | Multilingue (`laya-multilingual`) | `Router` (enrutado) |
|---|---|---|---|
| MASSIVE intent, ingles | 0,783 | 0,657 | 0,783 |
| MASSIVE intent, otros 13 idiomas | 0,306 | 0,451 | 0,451 |
| XNLI, ingles | 0,860 | 0,843 | 0,860 |
| XNLI, otros 14 idiomas | 0,521 | 0,731 | 0,731 |
| Idiomas utilizables (>3x aleatorio) | 23 / 51 | 45 / 51 | 45 / 51 |
| Latencia, 1 pregunta (T4) | 39,5 ms | 32,8 ms | 32,8 ms |
| Latencia, 10 preguntas en lote | 158,6 ms | 72,3 ms | 72,3 ms |

El autor reporta además 0,766 de accuracy para el checkpoint `laya-typed-decisions` en los cuatro flujos de decisiones tipadas, y 0,000 de accuracy con 0,952 de confianza del checkpoint inglés sobre jemer, como justificación del enrutado. No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para el checkpoint raiz (421 M parametros): aproximadamente 0,84 GB en fp16, 1,69 GB en fp32 y 0,42 GB en int8, sin contar activaciones. Cifras derivadas del recuento de parámetros, no publicadas por el autor.
- VRAM estimada para el checkpoint multilingue (322 M parametros): aproximadamente 0,64 GB en fp16. Igualmente derivada.
- Con `Router(preload=True)` los tres checkpoints residen en memoria simultáneamente (en torno a 1,16 B parametros en total, aproximadamente 2,3 GB en fp16, cifra estimada).
- Cabe en cualquier GPU de consumo con 4 GB o más de VRAM, y también en CPU. No se requieren A100 ni H100 para inferencia.
- GPU utilizada en las mediciones publicadas: NVIDIA T4.
- Latencia medida en T4: 39,5 ms (inglés) y 32,8 ms (multilingüe) por pregunta; 158,6 ms y 72,3 ms respectivamente para 10 preguntas en lote.
- Coste de arranque en frío: con `max_loaded=1` (valor por defecto), el tráfico que alterna idiomas reconstruye el modelo en cada petición, con una mediana medida de 7,4 s de recarga en CPU y 10,3 s en T4. El autor recomienda `Router(preload=True)` en servidores.
- Opciones de despliegue documentadas: paquete `laya` (`pip install laya`) con la clase `Router`, y carga directa mediante la libreria `transformers` (pipeline `text-classification`). El repositorio esta marcado como `endpoints_compatible`.
- vLLM, llama.cpp, Ollama o TGI: no disponibles en la documentación; al ser un modelo no generativo de clasificación, estos motores de generación no son el objetivo declarado.

## Comparativa con modelos similares

Los tres checkpoints de la propia familia son los únicos elementos comparables con datos publicados en la información disponible:

| Modelo | Backbone | Parametros | Contexto | Rendimiento declarado | Licencia |
|---|---|---|---|---|---|
| `laya` (raiz, ingles) | ModernBERT-large | 421 M | 512 | MASSIVE EN 0,783; XNLI EN 0,860; 39,5 ms/pregunta en T4 | Apache 2.0 |
| `laya-multilingual` | mmBERT-base | 322 M | 1024 (hasta 8k) | MASSIVE otros idiomas 0,451; XNLI otros idiomas 0,731; 32,8 ms/pregunta en T4 | Apache 2.0 |
| `laya-typed-decisions` | ModernBERT-large | 421 M | 1024 | 0,766 de accuracy en los cuatro flujos de decisiones tipadas | Apache 2.0 |

No se dispone de comparaciones con alternativas externas de la misma categoría (clasificadores encoder tipo XLM-R, DeBERTa-v3 o ModernBERT base) en la información proporcionada: no disponible.

## Limitaciones y advertencias

- El checkpoint inglés no lee escrituras no latinas y falla manteniendo alta confianza (0,000 de accuracy con 0,952 de confianza en jemer). Cualquier despliegue multilingüe debe usar el `Router` o el checkpoint multilingüe; el *confidence gating* posterior no protege contra este fallo.
- Sin `preload`, el rendimiento en producción se degrada gravemente: 7,4 s de mediana de recarga en CPU y 10,3 s en T4 cuando el tráfico alterna idiomas con `max_loaded=1`.
- El modelo no genera texto, de modo que no sirve para resúmenes, redacción, traducción generativa ni diálogo conversacional.
- No se documentan capacidades de tool calling, agentes multi-paso, visión ni audio.
- Riesgo de alucinación textual: nulo por diseño al no producir texto libre. Persiste el riesgo de clasificación incorrecta con probabilidad alta, especialmente en dominios o idiomas alejados de la distribución de entrenamiento.
- El autor no publica la composición del dataset de entrenamiento, el número de tokens ni los detalles del pipeline de RLCD, lo que dificulta auditar sesgos o cobertura real por idioma.
- Sesgos conocidos: no disponibles. Al no documentarse la composición de los datos, no puede descartarse sesgo de dominio (los ejemplos publicados son de soporte al cliente y correo corporativo).
- Los resultados de benchmarks son autoinformados por el autor y no se han verificado de forma independiente.
- Restricciones de licencia: Apache 2.0 permite uso comercial sin restricciones adicionales documentadas.
- Discrepancia de identidad del repositorio: la model card hace referencia a los repositorios `convaiinnovations/laya`, `convaiinnovations/laya-multilingual` y `convaiinnovations/laya-typed-decisions`, mientras que la ficha consultada corresponde a `opg13/laya`, sin descargas ni valoraciones. Conviene verificar qué repositorio es el canónico antes de fijar una dependencia en producción.
- El repositorio presenta 0 descargas y 0 likes, y las fechas de creación y actualización son idénticas (2026-09-21), lo que apunta a un artefacto recién publicado y sin validación por parte de la comunidad.
- El campo de idiomas del repositorio está vacío; la cobertura de "más de 100 idiomas" procede únicamente de la model card, y la evaluación publicada cubre 51 idiomas.

## Enlaces

- HuggingFace (ficha consultada): https://huggingface.co/opg13/laya
- Checkpoint multilingüe referenciado en la model card: https://huggingface.co/convaiinnovations/laya-multilingual
- Checkpoint de decisiones tipadas referenciado en la model card: https://huggingface.co/convaiinnovations/laya-typed-decisions
- Repositorio raiz referenciado en la model card: https://huggingface.co/convaiinnovations/laya
- Repositorio de GitHub implícito en las URLs de los gráficos de la model card: https://github.com/NandhaKishorM/laya
- Gráfico comparativo Laya frente a TypeSafe Jev citado en la model card: https://raw.githubusercontent.com/NandhaKishorM/laya/main/assets/laya_vs_jev_full.png
- Paquete de Python: `pip install laya` (documentado en la model card; no se ha localizado el enlace a PyPI)
- Paper, blog o demo adicionales: no disponible. La búsqueda web realizada no devolvió resultados relevantes sobre el modelo.
