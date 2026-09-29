# jaredpalmer/kev-27b

## Resumen

Kev-27B es un modelo de decisión, no un modelo generativo: recibe un documento (el *estado*) y un conjunto de preguntas tipadas, y devuelve en un único forward pass una distribución de probabilidad por pregunta. No produce texto. Es un adaptador LoRA más una cabeza *pointer* sobre `Qwen/Qwen3.8-27B` (revisión `1d4bf0f2`), y sirve el contrato público `/v1/systemone` de TypeSafe, igual que el resto de la familia Kev.

Lo publica jaredpalmer, ocupa 0,5 GB en el Hub al ser solo el adaptador, se distribuye con licencia Apache 2.0, está etiquetado como `text-classification` y solo declara inglés. La model card lo presenta como el Kev más preciso y mejor calibrado de la familia: 0,896 de exactitud con Brier servido de 0,160 en el test fuera de dominio bloqueado, frente a 0,852 / 0,224 de Kev-9B, y una cobertura a ≤ 5 % de error de 0,835 frente a 0,645.

Es relevante porque ataca un problema distinto al de los LLM generativos: automatizar decisiones clasificatorias con probabilidades calibradas y con un presupuesto de error explícito, en lugar de generar respuestas. Como contrapartida, exige infraestructura de centro de datos (55 GB residentes en bf16, una H100 de 80 GB o una H200) y su base ya está post-entrenada por Qwen, lo que impide comparaciones controladas con los Kev pequeños.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA con cabeza *pointer* sobre un transformer decoder denso (`Qwen/Qwen3.8-27B`, revisión `1d4bf0f2`); una pasada forward estado + preguntas tipadas, salida de distribución de probabilidad por pregunta, sin generación de texto |
| Parametros totales | 27B en el modelo base (`Qwen/Qwen3.8-27B`); el repositorio publicado contiene solo el adaptador (0,5 GB) |
| Parametros activos | No aplica: no se describe como modelo MoE en la información disponible |
| Longitud de contexto | No disponible. La model card menciona estados de 2.200 tokens en las pruebas de servicio, pero no declara una ventana máxima |
| Tipos de cuantizacion | No disponible. Solo se documentan pesos bf16 (55 GB residentes); no se publican pesos GGUF ni rutas de cuantización, y el autor indica que no hay ruta para Mac |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); librería declarada: `peft` |
| Pipeline declarado | `text-classification` |
| Métricas declaradas | accuracy, brier_score, expected_calibration_error |
| Temperatura de servicio | T = 1,38 (ajustada por checkpoint) |
| Contrato de servicio | `/v1/systemone` de TypeSafe |
| Descargas / likes | 261 descargas, 12 likes |

## Arquitectura y entrenamiento

El modelo no es un transformer generativo al uso: sobre el decoder denso de `Qwen/Qwen3.8-27B` se monta un adaptador LoRA y una cabeza *pointer* que, dada una representación del estado y un conjunto de preguntas tipadas (elección múltiple, NUL/abstención y puntuación, según el conjunto `decision-v7`), emite una distribución de probabilidad por pregunta en una sola pasada. No hay decodificación autoregresiva, ni decodificación especulativa, ni atención lineal: la innovación está en el formato de tarea (decisiones tipadas con abstención) y en la calibración de las probabilidades servidas, no en la arquitectura del backbone. Cada checkpoint se sirve con su propia temperatura ajustada.

El autor advierte explícitamente de que la base **está post-entrenada**: `Qwen/Qwen3.8-27B` es la versión instruction-tuned de Qwen, no un checkpoint `-Base` como en los demás Kev, y se desconoce sobre qué se post-entrenó (incluida cualquier destilación), por lo que las comparaciones con Jev o con los Kev pequeños no son comparaciones controladas del método. Los datos de ajuste incluyen diez conjuntos públicos de clasificación y NLI: `legacy-datasets/banking77`, `google/boolq`, `fancyzhx/ag_news`, `nyu-mll/multi_nli`, `SetFit/sst5`, `Yelp/yelp_review_full`, `CogComp/trec`, `fancyzhx/dbpedia_14`, `SetFit/amazon_reviews_multi_en` y `stanfordnlp/imdb`. El número de tokens de entrenamiento, la composición exacta del dataset interno y el uso de RLHF o DPO no están disponibles en la información proporcionada.

La selección se hizo con un protocolo registrado antes de entrenar: dos semillas, criterios de desarrollo (transfer-v4 ≥ 0,842; MMLU-Pro ≥ 0,65; proporción de "no respondibles" ≤ 0,05; pares retenidos ≥ 0,75; estados largos ≥ Kev-9B + 10 pp; externos agrupados ≥ Kev-9B), después una lectura de dos paneles frescos frente a Kev-9B y finalmente una lectura bloqueada (≥ 0,862 y Brier ≤ 0,237). La semilla 1 falló MMLU-Pro con 0,630; la semilla 2 superó todos los pasos y es el checkpoint publicado (trial `r6-27b-v2/01-trial-1`). Además, una puerta registrada se anuló: la base sin entrenar debía alcanzar MMLU-Pro ≥ 0,65 en `transfer-v9`, obtuvo 0,635 y el responsable del proyecto la anuló (registrado en `PLAN_27b.md`, A2); el modelo entrenado alcanza 0,665.

## Capacidades

- Decisión clasificatoria con salida probabilística calibrada: una distribución por pregunta tipada en una sola pasada, pensada para umbrales de confianza y presupuestos de error.
- Preguntas de elección múltiple (formato 10-way en MMLU-Pro, exactitud 0,665).
- Abstención ante elementos no respondibles: 0,00 de items "unknowable" respondidos con probabilidad ≥ 0,9 (cuanto más bajo, mejor).
- Procesamiento de estados largos con preguntas "enterradas": 0,833 de exactitud en `longstate-v3`, frente a 0,556 de Kev-9B.
- Clasificación de intenciones y temas: banca (`banking77`), noticias (`ag_news`), enciclopedia (`dbpedia_14`), consultas (`trec`).
- Análisis de sentimiento y reseñas: `sst5`, `yelp_review_full`, `amazon_reviews_multi_en`, `imdb`.
- Inferencia de relación textual (NLI) y verificación de afirmaciones: `multi_nli`, `boolq`, WANLI-v2 (1.002 pares, 0,745).
- Manejo de documentos reales nunca vistos en entrenamiento: 0,862 en `documents-v1` (reclamaciones del CFPB).
- Invariancia frente al contexto de la petición: la respuesta a una pregunta apenas cambia según el resto del lote (máx. |Δp| 0,009 frente a una pregunta sonda no relacionada, 0 inversiones de respuesta).
- Generación de texto: no soportada por diseño.
- Tool calling / function calling: no disponible; no se declara.
- Uso como agente o razonamiento multi-paso: no disponible; el modelo resuelve la decisión en un forward pass.
- Multilingüismo: no soportado, solo inglés.
- Visión, audio o modo *thinking*: no disponibles.

## Casos de uso

- Triaje de tickets de soporte: con 0,796 de exactitud en 873 tickets reales (`scienthoon`), el modelo puede asignar categoría y prioridad a cada ticket y devolver la confianza asociada para enrutar automáticamente solo los casos por encima del umbral.
- Automatización con presupuesto de error: su cobertura a ≤ 5 % de error es de 0,835, es decir, el 83,5 % de las decisiones se pueden automatizar aceptando un 5 % de fallos; el resto se deriva a revisión humana. Es el escenario para el que está diseñado.
- Clasificación de reclamaciones financieras: sobre reclamaciones del CFPB nunca vistas en entrenamiento obtiene 0,862, suficiente para etiquetar motivos de queja y alimentar paneles de analítica regulatoria.
- Análisis de voz de cliente sobre reseñas: con los conjuntos de reseñas de Yelp, Amazon e IMDb en el entrenamiento, se puede puntuar sentimiento y tema por reseña y agregarlo por producto o región.
- Enrutado de consultas y etiquetado de contenido: clasificación de consultas (`trec`) y de temas enciclopédicos (`dbpedia_14`) para motores de búsqueda internos o sistemas de recomendación.
- Verificación de coherencia documental: con 0,745 en WANLI-v2 y presencia de `multi_nli` y `boolq`, sirve para comprobar si un par de frases se implica, se contradice o es neutral antes de publicar contenido.
- Detección de información enterrada en contratos o expedientes largos: 0,833 de exactitud en estados largos con preguntas ocultas, útil para extraer condiciones concretas de documentos extensos.
- Cumplimiento de políticas internas: 0,891 en estructuras de política retenidas donde ambos hermanos (preguntas relacionadas) deben ser correctos, aplicable a la validación de solicitudes contra un reglamento.

## Benchmarks y rendimiento

Resultados declarados por el autor en el `model-index` de la model card (no verificados de forma independiente):

| Tarea | Conjunto | Métrica | Valor |
|---|---|---|---|
| Decisión tipada, fuera de dominio | transfer-v4 test (lectura única) | accuracy | 0,896 |
| Decisión tipada, fuera de dominio | transfer-v4 test (lectura única) | brier_score | 0,160 |
| Decisión tipada, panel fresco | transfer-r6 test (1.260 preguntas, lectura única) | accuracy | 0,863 |
| Decisión tipada (elección / nul / puntuación) | decision-v7 test (lectura única) | accuracy | 0,870 |

Comparativa ampliada publicada en la model card, tal como se sirve cada checkpoint con su temperatura ajustada:

| Métrica | Kev-27B (T = 1,38) | Kev-9B (T = 2,30) | Jev |
|---|---|---|---|
| Test bloqueado, exactitud / Brier fuera de dominio (transfer-v4) | 0,896 / 0,160 | 0,852 / 0,224 | no disponible |
| Test bloqueado, cobertura a ≤ 5 % de error | 0,835 | 0,645 | no disponible |
| Panel fresco, exactitud fuera de dominio (transfer-r6 test) | 0,863 | 0,842 | no disponible |
| Test bloqueado, exactitud en distribución (decision-v7) | 0,870 | 0,874 | no disponible |
| Fuera de dominio, exactitud / Brier (transfer-v4 dev) | 0,848 / 0,229 | 0,822 / 0,264 | 0,857 / 0,211 |
| Preguntas enterradas en estados largos (longstate-v3, fresco) | 0,833 | 0,556 | no disponible |
| MMLU-Pro (transfer-v9 dev, 10 opciones) | 0,665 | 0,515 | 0,840 |
| Items no respondibles contestados con ≥ 0,9 (menor es mejor) | 0,00 | 0,00 | 0,09 |
| Estructuras de política retenidas, ambos hermanos correctos | 0,891 | 0,828 | 0,86 |
| Documentos reales (documents-v1 dev, reclamaciones CFPB) | 0,862 | 0,833 | 0,868 |
| SemIf (144 decisiones redactadas) | 0,972 | 0,910 | no disponible |
| scienthoon (873 tickets de soporte) | 0,796 | 0,755 | no disponible |
| WANLI-v2 (1.002 pares NLI) | 0,745 | 0,740 | no disponible |
| TypeSafe (89 filas contestadas) | 0,865 | 0,820 | no disponible |

Diferencias emparejadas frente a Kev-9B (bootstrap agrupado por registro, intervalo de confianza del 95 %): transfer-r6 test +2,1 pp [+0,3; +3,8]; preguntas enterradas en longstate-v3 +27,7 [+23,1; +32,5]; SemIf +6,2 [+2,8; +10,4]; scienthoon +4,1 [+1,9; +6,3]; documentos reales +2,9 [+0,7; +5,3]; WANLI-v2 +0,5 [−1,6; +2,6], único intervalo que cruza el cero. Todas las métricas están marcadas como no verificadas (`verified: false`) en el `model-index`.

## Requisitos de hardware

- VRAM en bf16: 55 GB residentes, medidos en una H200 con el `scripts/serving_bench.py` (200 registros de desarrollo de decision-v7, 280 preguntas).
- GPU recomendadas: una H100 de 80 GB o una H200. El autor indica explícitamente que se necesita una GPU de centro de datos y que no hay ruta para Mac.
- GPU de consumo: no cabe. 55 GB en bf16 superan la VRAM de cualquier GPU consumer actual, y no se publican pesos cuantizados que redujeran el requisito.
- Tiempo de carga medido: 24 s.
- Latencia (bf16, CUDA graphs): 72 ms con estado nuevo y 2 preguntas cortas; 386 ms con 5 preguntas sobre un estado de 2.200 tokens; 39-85 ms con estado en caché.
- Fidelidad numérica del servicio: frente a la ruta de evaluación fp32, |Δp| máximo de 0,018 y medio de 0,0013, con 0 inversiones de respuesta.
- Opciones de despliegue: la model card solo documenta el servicio a través del contrato `/v1/systemone` de TypeSafe con pesos bf16 y CUDA graphs. No se mencionan vLLM, llama.cpp, Ollama ni TGI, y la presencia de una cabeza *pointer* más un adaptador LoRA sobre la base sugiere una ruta de servicio propia en lugar de un pipeline estándar de `text-classification`. No disponible: soporte oficial en esos frameworks.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento clave | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Kev-27B | 27B (base Qwen3.8-27B) + adaptador LoRA | no disponible (estados de 2.200 tokens en las pruebas) | 0,896 exactitud / 0,160 Brier fuera de dominio; cobertura 0,835 a ≤ 5 % de error; MMLU-Pro 0,665 | Apache 2.0 | Adaptador en `jaredpalmer/kev-27b`; requiere la base y servicio propio |
| Kev-9B | 9B | no disponible | 0,852 / 0,224; cobertura 0,645; MMLU-Pro 0,515; 0,556 en preguntas enterradas | no disponible en esta información | Miembro de la misma familia, comparado en la model card |
| Jev | no disponible | no disponible | transfer-v4 dev 0,857 / 0,211; MMLU-Pro 0,840; documentos reales 0,868 | no disponible en esta información | Mencionado solo como referencia comparativa en la model card |
| Modelos generativos de ~27B (por ejemplo, la propia base `Qwen/Qwen3.8-27B`) | 27B | no disponible | No comparable directamente: generan texto, no emiten decisiones calibradas | según la base | Sí, pero no resuelve la tarea de decisión tipada |

La model card advierte de que las comparaciones con Jev y con los Kev pequeños no son comparaciones controladas del método, porque la base de Kev-27B ya está post-entrenada por Qwen y los demás parten de checkpoints `-Base`. No se dispone de otros modelos comparables de la misma categoría (modelos de decisión con cabeza *pointer*) en la información proporcionada.

## Limitaciones y advertencias

- No genera texto. Es un modelo de decisión: cualquier caso de uso que requiera redacción, resumen o diálogo queda fuera de su alcance.
- Solo inglés declarado. No hay soporte multilingüe documentado.
- Base post-entrenada: `Qwen/Qwen3.8-27B` es la versión instruction-tuned de Qwen, y el autor desconoce sobre qué se post-entrenó, incluida cualquier destilación de otros modelos. Cualquier comparación con Jev o los Kev pequeños está confundida por esta diferencia.
- Puerta de validación anulada: la base sin entrenar debía alcanzar MMLU-Pro ≥ 0,65 y se quedó en 0,635; el responsable del proyecto anuló la puerta (registrado en `PLAN_27b.md`, A2). El modelo entrenado obtiene 0,665, apenas por encima del umbral.
- Selección sobre dos semillas y lectura única de los paneles frescos, con criterios registrados antes de entrenar, pero todas las métricas del `model-index` están marcadas como no verificadas. Tres ensayos previos de 27B fallaron la regla de desarrollo por menos de un punto.
- Rendimiento desigual: en WANLI-v2 la mejora frente a Kev-9B es de +0,5 pp con intervalo [−1,6; +2,6] que cruza el cero, y en documentos reales Jev (0,868) supera a Kev-27B (0,862). La ventaja no es universal.
- Calibración dependiente de la temperatura: cada checkpoint se sirve con su temperatura ajustada (1,38 en este caso). Servir con otra temperatura invalida el Brier declarado y, por tanto, los umbrales de cobertura.
- Requisito de hardware severo: 55 GB en bf16, una H100 de 80 GB o una H200, sin ruta para Mac ni pesos cuantizados publicados. No es desplegable en GPU de consumo.
- Alcance de la licencia: el adaptador se publica bajo Apache 2.0, pero el uso comercial depende también de la licencia y las condiciones de `Qwen/Qwen3.8-27B`, que no se detallan en la información proporcionada.
- Riesgo de alucinación: no aplica en el sentido generativo (no produce texto libre), pero sí existe riesgo de sobreconfianza en la clasificación; el autor reporta 0,00 de items no respondibles contestados con probabilidad ≥ 0,9, lo que no elimina errores en dominios alejados de los datos de ajuste.
- Sesgos: no se documenta ningún análisis de sesgo demográfico, geográfico o de dominio. Los conjuntos de entrenamiento son mayoritariamente en inglés y de origen estadounidense (reseñas, noticias, reclamaciones financieras), lo que puede trasladarse a los umbrales de decisión.
- Dependencia de la plataforma: el modelo sirve el contrato `/v1/systemone` de TypeSafe; no se documenta un pipeline estándar de `text-classification` para cargarlo directamente con `transformers`, a pesar de la etiqueta del Hub.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jaredpalmer/kev-27b
- Modelo base declarado: https://huggingface.co/Qwen/Qwen3.8-27B (revisión `1d4bf0f2`)
- Conjuntos de datos declarados en la model card: `legacy-datasets/banking77`, `google/boolq`, `fancyzhx/ag_news`, `nyu-mll/multi_nli`, `SetFit/sst5`, `Yelp/yelp_review_full`, `CogComp/trec`, `fancyzhx/dbpedia_14`, `SetFit/amazon_reviews_multi_en`, `stanfordnlp/imdb`
- Referencias internas citadas por la model card, sin URL pública disponible: `PLAN_27b.md` (registro "B1 v2"), `PLAN.md` (ensayos de la ronda 6), rama `research/overnight-r6`, artefactos `runs/release/kev-27b-v2.json`, `runs/serving-27b-h200`, `runs/serving-27b-h200-iso` y `scripts/serving_bench.py`
- Búsqueda web: los resultados devueltos no guardan relación con el modelo (artículos sobre una exposición de cómic en el Centre Pompidou). No se han encontrado papers, blogs, repositorios ni demos públicos adicionales en la información disponible.
