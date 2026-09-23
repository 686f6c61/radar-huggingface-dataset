# autotrust/JEV

## Resumen

autotrust/JEV es un modelo de pesos abiertos especializado en clasificación de texto que devuelve decisiones tipadas y calibradas en lugar de texto generado. Está construido por autotrust sobre el backbone preentrenado Qwen/Qwen3.5-9B y se distribuye como un *student* destilado a partir de las distribuciones de salida completas del modelo propietario TypeSafe Jev 1.13, el llamado *System One* de TypeSafe AI. Conviene no confundir ambos: TypeSafe Jev 1.13 es el maestro cerrado y hospedado, mientras que autotrust/JEV es un repositorio independiente, sin afiliación ni respaldo de TypeSafe AI.

El modelo resuelve un problema muy concreto: convertir texto libre o estados JSON en tres tipos de respuesta estructurada —`noul` (sí/no con probabilidad), `choice` (una distribución sobre entre 2 y 16 opciones) y `score` (una distribución sobre una escala ordenada de 0 a 5)— mediante una única pasada de prefill, sin decodificación autoregresiva, sin parseo de JSON y sin ingeniería de prompts. La cabeza de decisión es una proyección lineal en fp32 sobre el estado oculto del último token que mapea a 24 ranuras: 2 para `noul`, 6 para `score` y 16 para `choice`.

Su relevancia actual radica en que ofrece, con licencia Apache-2.0 y pesos safetensors, un sustituto local de un servicio de pago (la API de TypeSafe cobra 0,042 USD por millón de tokens de entrada y salida gratuita) con una fidelidad declarada muy alta respecto al maestro: divergencia KL media de 0,028, AUROC de 0,994 en preguntas binarias y ECE de 0,0014 sin corrección de temperatura post hoc. El entrenamiento fue notablemente ligero: solo 40,2 millones de parámetros (el 0,5 % del backbone de 8 B) durante unas 1,7 horas de GPU en una única B200 y 0,49 épocas (unos 320.000 ejemplos).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer con backbone Qwen3.5-9B y cabeza de decisión lineal fp32 (H → 24 ranuras); el código de servicio requiere `flash-linear-attention`, lo que apunta a componentes de atención lineal en el backbone, si bien la model card no detalla su arquitectura interna |
| Parámetros totales | 7.936.684.544 (≈ 7,94 B) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Parámetros entrenados | 40,2 M (0,5 % del backbone), adaptadores LoRA |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible; los pesos se publican en safetensors (la cabeza se aplica en fp32) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (transformers); repositorio de 15,9 GB |
| Pipeline | text-classification |
| Tipos de decisión | `noul` (2 ranuras), `score` (6 ranuras, escala 0–5), `choice` (hasta 16 opciones) |
| Modelo base | Qwen/Qwen3.5-9B (relación: finetune) |
| Dataset de destilación | SargeDev/jev-distill-corpus-v3 |

## Arquitectura y entrenamiento

La arquitectura parte de un backbone denso Qwen3.5-9B y le añade una cabeza lineal muy pequeña en fp32 que lee el estado oculto de la última capa tras la normalización final del último token. La plantilla de entrada (campos `[kind]`, `[state]`, `[question]`, `[options]` y `[decision]:`) se tokeniza como una única cadena y se procesa en una sola pasada de prefill, sin generación. La cabeza proyecta a 24 ranuras fijas que se enmascaran según el tipo de pregunta: las ranuras 0–1 corresponden a `noul`, las 2–7 a `score` y las 8–23 a `choice`. Sobre las ranuras activas se aplica una temperatura específica por tipo y un softmax, de modo que la salida es una distribución de probabilidad alineada con las opciones facilitadas por el usuario, más un valor esperado de la puntuación en el caso de `score`.

El entrenamiento es una destilación de conocimiento desde las distribuciones completas del maestro TypeSafe Jev 1.13, no una destilación de etiquetas duras. Se ajustaron únicamente 40,2 M de parámetros mediante LoRA durante aproximadamente 1,7 horas de GPU en una sola B200, con 0,49 épocas sobre unos 320.000 ejemplos del corpus Apache-2.0 SargeDev/jev-distill-corpus-v3. Las temperaturas ajustadas resultaron cercanas a 1,00, lo que indica que la calibración se heredó del maestro sin necesidad de corrección post hoc. La model card no especifica la composición detallada del corpus ni si hubo etapas adicionales de RLHF o DPO.

## Capacidades

- Clasificación de texto con salida probabilística tipada en tres modalidades: binaria (`noul`), elección múltiple de 2 a 16 opciones (`choice`) y puntuación ordenada de 0 a 5 (`score`).
- Probabilidades calibradas directamente utilizables por software: ECE de 0,0014 con 15 bins tras aplicar temperatura, y temperaturas ajustadas ≈ 1,00.
- Evaluación de estados arbitrarios, tanto texto libre como JSON, sin necesidad de formato estricto de entrada.
- Razonamiento de un solo paso (*System One*): una pasada de prefill, sin cadena de pensamiento ni decodificación iterativa.
- Generalización a familias de tareas no vistas en entrenamiento: KL media de 0,208 en el split OOD Open-Jev.
- Cobertura declarada de 53 dominios en el conjunto de evaluación.
- No soporta generación de texto, tool calling, function calling ni razonamiento multi-paso agéntico: el pipeline es text-classification.
- Multilingüe: no; solo inglés según la model card.
- Capacidades especiales: no dispone de modo *thinking*, visión ni audio.

## Casos de uso

- Automatización de decisiones de negocio con umbrales: el modelo devuelve `[P(false), P(true)]` para afirmaciones como "¿el proveedor incumplirá el plazo?", de modo que un sistema puede fijar umbrales (por ejemplo, actuar solo si P(true) > 0,9) y dejar los casos dudosos para revisión humana, apoyándose en la calibración medida (ECE 0,0014).
- Enrutado y triaje de tickets: con la modalidad `choice` sobre 2 a 16 categorías, un servicio de soporte puede clasificar y enrutar incidencias en una sola pasada, recibiendo además la distribución completa para detectar ambigüedad cuando las dos opciones más probables están próximas.
- Control de inventario y cadena de suministro: el ejemplo de la propia model card (`SKU AX-330` con stock al 8 % del nivel de seguridad y proveedor con dos retrasos en el trimestre) se traduce en una decisión sobre `issue_warning`, `renegotiate`, `dual_source` o `maintain`, con probabilidad asociada para automatizar alertas.
- Puntuación de riesgo y priorización: con la modalidad `score` sobre la escala 0–5, es aplicable a scoring de leads, severidad de incidencias, calidad de contenido o prioridad de vulnerabilidades, con un error medio del valor esperado de 0,12 (una décima de escalón).
- Verificación y control de calidad en pipelines de datos: comprobar si una respuesta generada por otro modelo cumple una afirmación sobre un estado (por ejemplo, si un resumen es fiel a un JSON de origen) mediante preguntas `noul` de forma masiva.
- Moderación y cumplimiento normativo: evaluar afirmaciones del tipo "¿este texto incumple la política X?" con probabilidad calibrada, lo que permite auditar la tasa de falsos positivos a distintos umbrales sin reentrenar.
- Sustitución local de la API propietaria: al ofrecer un esquema de petición/respuesta en `/v1/decisions` compatible con el estilo de TypeSafe Jev, puede desplegarse on-premise para evitar enviar datos sensibles a un servicio externo y reducir coste, ya que en modo batch se declaran 2,5 ms por decisión.
- Extracción de etiquetas estructuradas en procesos ETL: convertir texto no estructurado en una etiqueta con confianza, lista para insertar en base de datos, sin postprocesado de JSON.

## Benchmarks y rendimiento

Resultados declarados por el autor en el `model-index` de la model card, sobre el conjunto de test `test_set_30k` de SargeDev/jev-distill-corpus-v3 (29.955 preguntas, 53 dominios). Ninguno está marcado como verificado (`verified: false`) y no se dispone de comparaciones con otros modelos en la información proporcionada.

| Métrica | Descripción | Valor |
|---|---|---|
| KL divergencia media (maestro ‖ modelo) | Fidelidad de las distribuciones; menor es mejor | 0,0276 |
| AUROC (`noul`) | Preguntas sí/no; mayor es mejor | 0,9938 |
| Brier (`noul`) | Frente a la probabilidad del maestro; menor es mejor | 0,0022 |
| MAE del valor esperado (`score`) | Escala 0–5; menor es mejor | 0,119 |
| ECE (15 bins, tras temperatura) | Calibración; menor es mejor | 0,0014 |
| Precisión top-1 (`choice`, todas las filas) | Coincidencia con la opción elegida por el maestro | 0,884 |
| Precisión top-1 (`choice`, filas decisivas con diferencia top-2 ≥ 0,1) | Coincidencia con el maestro en casos no empatados | 0,918 |
| KL media en Open-Jev OOD | Familias de tareas no vistas en entrenamiento | 0,208 |
| Latencia | Una petición en una B200, mediana | ≈ 90 ms |
| Latencia en batch | Por decisión con peticiones agrupadas | 2,5 ms |

No se han publicado en la información disponible resultados de benchmarks generales tipo MMLU, HumanEval o GSM8K; el modelo no está orientado a generación y no procede evaluarlo en esas tareas.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp16/bf16 el backbone de ~7,94 B requiere del orden de 16 GB solo para pesos, más activaciones y la cabeza fp32 (el repositorio completo ocupa 15,9 GB en safetensors). Con cuantización de 8 bits bajaría a unos 9–10 GB y con 4 bits a unos 5–6 GB, aunque no se publican formatos cuantizados oficiales.
- GPU recomendadas: la model card reporta el entrenamiento y las mediciones de latencia en una NVIDIA B200 (~90 ms por petición, 2,5 ms por decisión en batch). Para producción son adecuadas A100, H100 o B200; en una RTX 4090 de 24 GB debería caber en fp16 al límite de memoria, con menos margen para batch grande.
- GPU de consumo: probablemente viable en RTX 4090, RTX 3090 (24 GB) o tarjetas de 16 GB solo si se aplica cuantización, que el autor no publica.
- Opciones de despliegue: el repositorio incluye código propio bajo `code/` (`python -m jev_judge.server --export JEV --port 18080`) con un endpoint `/v1/decisions`. Los requisitos declarados son torch ≥ 2.13, transformers ≥ 5.16 y `flash-linear-attention`. No se menciona soporte para vLLM, TGI, llama.cpp ni Ollama; la cabeza lineal personalizada y la ausencia de decodificación estándar hacen poco probable que estos motores genéricos funcionen sin adaptación.
- Latencia y throughput: mediana de ≈ 90 ms por petición individual en B200 y 2,5 ms por decisión en modo batch, según los datos del autor.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Salida | Licencia | Disponibilidad | Rendimiento comparado |
|---|---|---|---|---|---|---|
| autotrust/JEV | 7,94 B (40,2 M entrenados) | no disponible | Decisiones tipadas calibradas (`noul`/`choice`/`score`) | Apache-2.0 | Pesos abiertos en HuggingFace | KL 0,028 frente al maestro; AUROC 0,994; top-1 88,4 % |
| TypeSafe Jev 1.13 (maestro) | no disponible | no disponible | Las mismas tres modalidades | Propietaria | API hospedada desde el 21 de septiembre de 2026, 0,042 USD por millón de tokens de entrada, salida gratuita, latencia declarada de 70–500 ms | Es la referencia frente a la que se mide el student |
| Qwen/Qwen3.5-9B (base) | ~9 B (según nomenclatura) | no disponible | Generación de texto general | no disponible | Pesos abiertos | No es un modelo de decisiones; no hay comparación directa disponible |
| LLM generales usados como jueces (p. ej. clasificación por prompt) | Variable | Variable | Texto que hay que parsear | Según modelo | Pesos abiertos o API | Sin datos comparativos en la información proporcionada |

La comparación cuantitativa con alternativas de la misma categoría (modelos de decisión tipada) no está disponible: TypeSafe Jev 1.13 no publica métricas de calibración comparables, y el resto de candidatos son modelos generativos que requieren parseo posterior.

## Limitaciones y advertencias

- Solo inglés: el campo `language` de la model card declara exclusivamente `en`; el rendimiento en otros idiomas no está evaluado ni garantizado.
- No genera texto ni admite tool calling, agentes ni razonamiento multi-paso; cualquier flujo que requiera esos comportamientos debe combinarlo con otro modelo.
- Las métricas del `model-index` están declaradas como no verificadas (`verified: false`) y provienen del propio autor; no hay replicación independiente disponible.
- Riesgo de heredar los sesgos del maestro TypeSafe Jev 1.13: al ser una destilación de sus distribuciones, cualquier sesgo sistemático o error de calibración del maestro se reproduce en el student.
- Riesgo de alucinación residual: aunque el diseño evita la generación libre, el modelo puede asignar probabilidad alta a una opción incorrecta cuando el estado de entrada es ambiguo, incompleto o está fuera de los 53 dominios evaluados; el KL en el split OOD (0,208) es casi un orden de magnitud peor que en el test estándar (0,028).
- En preguntas con empate técnico del maestro, la coincidencia top-1 baja al 88,4 %; la decisión debe tratarse como una distribución completa, no como una etiqueta única.
- La model card advierte explícitamente de que autotrust/JEV no está afiliado, respaldado ni producido por TypeSafe AI; no debe presentarse como producto oficial ni asumirse soporte del fabricante del maestro.
- La licencia del repositorio es Apache-2.0, lo que permite uso comercial, pero la licencia del modelo base Qwen/Qwen3.5-9B no se detalla en la información disponible y debe comprobarse antes de un despliegue en producción.
- El despliegue depende de `transformers ≥ 5.16`, `torch ≥ 2.13` y `flash-linear-attention`, y no se documenta soporte para motores de inferencia habituales (vLLM, llama.cpp, Ollama), lo que limita las opciones de escalado.
- No se publican formatos cuantizados oficiales, y la cabeza de decisión opera en fp32, lo que puede complicar la cuantización agresiva sin degradar la calibración.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso en producción ni comunidad que reporte incidencias.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/autotrust/JEV
- Dataset de destilación: https://huggingface.co/datasets/SargeDev/jev-distill-corpus-v3
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Informe de evaluación incluido en el repositorio: `code/reports/eval_s2_9b.md`
- Sitio del modelo maestro (TypeSafe): https://jevmodel.org/
- Página y demo del modelo maestro: https://jevtypesafeai.com/
- Portal del modelo maestro: https://jevai.net/
- Comunidad de usuarios del modelo maestro: https://www.jevai.org/
- Artículo en Wikipedia sobre el modelo maestro: https://en.wikipedia.org/wiki/Jev_(AI_model)
