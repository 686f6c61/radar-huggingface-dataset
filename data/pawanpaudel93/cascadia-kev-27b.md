# pawanpaudel93/cascadia-kev-27b

## Resumen

Cascadia Kev-27B es un artefacto de despliegue listo para servir, no un modelo entrenado desde cero. Se trata de un árbol de decisión de dos etapas (unos 28,2 GB) empaquetado para el runtime Cascadia, que permite exponer los endpoints `/v1/decisions` (formato OpenAI Decisions) y `/v1/systemone` a partir del fine-tune `jaredpalmer/kev-27b` (v2, Kev 1.0) sobre la representación intermedia int8 de Qwen3.8-27B publicada por Intel en OpenVINO.

El modelo subyacente, Kev-27B, es un fine-tune de pesos completos de Qwen3.8-27B (64 capas) que sustituye la cabeza LM por una cabeza de puntero sobre un conjunto de opciones. Es decir, no genera texto libre: puntúa alternativas y devuelve una decisión. Por eso el árbol conserva la cabeza LM original de Intel para mantener la coherencia del grafo, pero la salida conversacional no es significativa.

Su relevancia es práctica: elimina el trabajo de exportación manual. Cualquiera puede descargar el árbol, arrancar dos workers en paralelo de pipeline sobre dos máquinas de 32 GB y obtener paridad numérica verificada frente a la referencia fp32 (82/82 comprobaciones correctas, delta máximo de probabilidad de 0,0180). Es un ejemplo de despliegue reproducible y determinista (17/17 ficheros idénticos por SHA-256 entre exportaciones independientes).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3.8-27B) con cabeza de puntero para decisión; grafo OpenVINO IR int8 |
| Parámetros totales | 27B (heredados del modelo base Qwen3.8-27B) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | int8 (representación intermedia OpenVINO) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | OpenVINO IR (`stage.xml` / `stage.bin`), embeddings OpenVINO, `head.pt` para la cabeza de puntero, tokenizer JSON y plantilla Jinja |
| Capas | 64 |
| Etapas de pipeline | 2 |
| Tamaño del repo | 28,2 GB |
| Runtime | Cascadia (motor `qwen35`), OpenVINO GenAI 2026.4.1 |
| Temperatura calibrada (cabeza) | 1,32 |

## Arquitectura y entrenamiento

El árbol no entrena nada: redistribuye pesos convertidos. La construcción parte de tres piezas. Primero, la IR int8 de Qwen3.8-27B de Intel (`OpenVINO/Qwen3.8-27B-int8-ov`), que aporta el esqueleto del transformer y la cabeza LM estándar. Segundo, el checkpoint de `jaredpalmer/kev-27b` en la revisión `af0e6d551bdc2cc724f3e9d7a8bee1cd4fb8f7bf`, un fine-tune de pesos completos de Qwen3.8-27B con una cabeza de puntero sobre opciones y temperatura calibrada de 1,32. Tercero, la herramienta `tools/decision_export.py` de la rama `pawan/decisions-api` (commit `a7d3d9a6`) del repositorio labscommunity/cascadia, que inyecta los pesos del fine-tune en la IR y divide el grafo en dos etapas.

La innovación técnica está en el particionado y en la reproducibilidad. El grafo se corta en dos etapas (`stage0`, `stage1`) que se comunican por red mediante un worker de pipeline, de modo que ninguna máquina necesita alojar los 28 GB completos en memoria de una sola vez. El proceso de exportación es determinista: dos hosts que descargaron y exportaron por separado produjeron árboles idénticos byte a byte en los 17 ficheros, verificado por SHA-256. No se documentan en la información disponible el volumen de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el fine-tune original de Kev.

## Capacidades

- Toma de decisiones sobre conjuntos de opciones: puntúa alternativas y devuelve una elección, no texto libre.
- Endpoint `/v1/decisions` en formato OpenAI Decisions, con estados de tipo cadena.
- Endpoint `/v1/systemone` como interfaz alternativa sobre el mismo árbol; ambas producen resultados idénticos (62/62 en la medición del autor).
- Separación estricta entre decisiones y chat: la salida conversacional no es significativa porque el checkpoint de Kev no tiene cabeza LM propia y el árbol conserva la de Intel.
- Sin fugas de estado entre decisiones y chat: una consulta a temperatura 0 antes y después de una tanda de decisiones devuelve bytes idénticos.
- Ejecución en CPU mediante OpenVINO, con paralelismo de pipeline entre dos hosts.
- No se documentan en la información disponible capacidades de tool calling, agentes, visión, audio ni multilingüismo.

## Casos de uso

- Enrutamiento de peticiones en una API: el modelo elige entre opciones predefinidas (por ejemplo, qué servicio atender o qué cola asignar) y el endpoint `/v1/decisions` devuelve la elección en el formato OpenAI Decisions, lo que simplifica la integración con clientes existentes.
- Clasificación con puntuación calibrada: al exponer probabilidades sobre las opciones con temperatura calibrada de 1,32, sirve para umbrales de confianza en pipelines de moderación o triaje donde no basta una etiqueta, sino una probabilidad.
- Despliegue en infraestructura modesta: el particionado en dos etapas permite servir el modelo en dos máquinas de 32 GB con CPU Intel Core Ultra, sin GPU, lo que encaja en entornos de borde o laboratorios con hardware de consumo.
- Evaluación reproducible de decisiones: al ser un árbol determinista y con paridad verificada frente a fp32, es útil como referencia en pruebas de regresión de sistemas de decisión, comparando la salida int8 contra la referencia en flotante.
- Prototipado rápido de sistemas "system one": el endpoint `/v1/systemone` permite experimentar con decisiones rápidas de una sola pasada sin montar el exportador ni gestionar la conversión de pesos.
- Sustitución de reglas heurísticas: donde hoy hay un árbol de `if/else` sobre señales discretas, el modelo puede sustituirlo por una puntuación aprendida sobre opciones, manteniendo el mismo contrato de salida estructurada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. Las únicas métricas aportadas son de paridad y consistencia del despliegue, medidas en dos hosts Intel Core Ultra 7 258V (32 GB cada uno), Windows 11, OpenVINO GenAI 2026.4.1 y dispositivo CPU, contra la referencia fp32 en streaming (50 registros, 82 preguntas):

| Comprobación | Resultado |
|---|---|
| Paridad frente a fp32 | 82/82 PASS (elección 33/33, noul 24/24, score 25/25) |
| Delta máximo de probabilidad | 0,0180, sin cambios de elección |
| `/v1/decisions` frente a `/v1/systemone` | 62/62 idénticos (estados de tipo cadena) |
| Chat a temperatura 0 antes y después de decisiones | byte-idéntico, sin fugas de estado |

## Requisitos de hardware

- VRAM: no aplica directamente; el árbol está medido en CPU. El tamaño total es de 28,2 GB, repartido en dos etapas.
- Memoria: se necesitan dos hosts de 32 GB como mínimo; un solo host de 32 GB no puede ejecutar ambas etapas, según advierte el autor.
- GPU recomendadas: no disponible; la medición documentada es solo en CPU.
- Cabe en hardware de consumo: sí, en dos equipos con CPU Intel Core Ultra 7 258V y 32 GB de RAM cada uno, según la configuración medida.
- Opciones de despliegue: runtime Cascadia con el motor `qwen35`, un worker por host (`cascadia worker --rank 0/1 --total 2`), con OpenVINO GenAI 2026.4.1. El worker de rango 1 ejecuta la cabeza de puntero y el de rango 0 expone la API.
- Timeout recomendado: `CASCADIA_ACTIVATION_TIMEOUT_SECS=1800` en el worker de rango 0.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Enfoque |
|---|---|---|---|---|---|
| cascadia-kev-27b (este) | 27B | no disponible | OpenVINO IR int8, 2 etapas | Apache-2.0 | Decisión sobre opciones, listo para servir |
| jaredpalmer/kev-27b | 27B | no disponible | Pesos del fine-tune | Apache-2.0 | Decisión sobre opciones, requiere exportación |
| OpenVINO/Qwen3.8-27B-int8-ov | 27B | no disponible | OpenVINO IR int8 | Apache-2.0 | Modelo generativo base en int8 |
| Qwen/Qwen3.8-27B | 27B | no disponible | safetensors (presumiblemente) | Apache-2.0 | Modelo generativo base en precisión original |

La diferencia clave frente a los tres es el contrato de salida: este árbol expone decisiones estructuradas y no chat, mientras que los otros están pensados para generación de texto. Frente a `kev-27b`, aporta el empaquetado y el particionado ya hechos.

## Limitaciones y advertencias

- No es un modelo de chat: la salida conversacional no es significativa porque el checkpoint de Kev carece de cabeza LM y el árbol conserva la de Intel.
- Requiere dos máquinas: un único host de 32 GB no puede ejecutar las dos etapas del pipeline.
- Solo medido en CPU: no hay datos de rendimiento en GPU ni de latencia o throughput.
- Dependencia de versión: exige OpenVINO GenAI 2026.4.1 y el runtime Cascadia en el commit `a7d3d9a6`; otras versiones pueden romper la compatibilidad del grafo.
- Idiomas soportados no documentados, lo que impide garantizar cobertura multilingüe en producción.
- Longitud de contexto no documentada; no se puede planificar el dimensionado de memoria de activaciones con datos concretos.
- Riesgo de alucinación no evaluado: al tratarse de una cabeza de puntero sobre opciones, el modo de fallo es una elección incorrecta, no una invención textual, pero no se han publicado métricas de precisión en tareas reales.
- Sesgos: no disponibles en la información proporcionada.
- Licencia Apache-2.0 permite uso comercial, pero conviene verificar las licencias de los tres componentes de origen, todas declaradas Apache-2.0 por el autor.
- El repositorio redistribuye pesos convertidos y no añade entrenamiento; cualquier mejora de calidad debe venir del fine-tune original.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/pawanpaudel93/cascadia-kev-27b
- Réplica con el mismo árbol en la raíz: https://huggingface.co/pawanpaudel93/kev27b-int8-ov-decision
- Fine-tune de origen: https://huggingface.co/jaredpalmer/kev-27b
- IR int8 base de Intel: https://huggingface.co/OpenVINO/Qwen3.8-27B-int8-ov
- Modelo base Qwen: https://huggingface.co/Qwen/Qwen3.8-27B
- Runtime Cascadia: https://github.com/labscommunity/cascadia
- Documentación de decisiones de Cascadia: `docs/DECISIONS.md` en el repositorio anterior
