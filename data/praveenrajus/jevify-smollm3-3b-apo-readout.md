# Praveenrajus/jevify-smollm3-3b-apo-readout

## Resumen

Jevify-smollm3-3b-apo-readout es un adaptador LoRA de rango 16 (30.228.480 parámetros) entrenado sobre el checkpoint HuggingFaceTB/SmolLM3-3B, desarrollado por el usuario Praveenrajus dentro del proyecto Jevify. No es un modelo generativo de texto: se presenta como un "System One decision model" que lee un estado, responde preguntas tipadas (`choice`, `score`, `noul`) y devuelve distribuciones de probabilidad calibradas sobre las que el código puede ramificar. El adaptador se fusiona en los pesos del backbone en bf16 durante la carga.

El interés de esta ficha radica en su naturaleza experimental y su metodología de evaluación: el modelo se entrena sobre su propia "decision readout", es decir, sobre la distribución de respuestas en la posición de respuesta en un único forward pass, sin decodificación, aplicando la regla de puntuación propia de cada primitiva. En la partición de test de jev-bench (22.773 registros) alcanza una precisión de 0,705, un ECE de 0,058, una precisión held-out de 0,741 y una TVD frente a etiquetas humanas de 0,337.

El modelo es relevante como pieza de investigación sobre calibración y coherencia en decisiones discretas, y como contraste con la API propietaria Jev 1.13.0 (0,733 de precisión y 0,835 en held-out, pero ECE de 0,113). Su licencia Apache 2.0 y su tamaño reducido lo hacen desplegable en hardware de consumo, aunque sus propios resultados muestran limitaciones notables de coherencia e invarianza que conviene sopesar antes de usarlo en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA de rango 16 sobre backbone transformer decoder-only SmolLM3-3B; el adaptador se fusiona en bf16 al cargar |
| Parametros totales | Adaptador: 30.228.480 parámetros; backbone base: ~3B (SmolLM3-3B) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible para el adaptador; el backbone SmolLM3-3B está diseñado para contexto largo (evaluado a 64k en Ruler según el blog de SmolLM3) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el backbone SmolLM3-3B es multilingüe) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador LoRA en `lora/`, fusionado en bf16 al cargar) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA de rango 16 sobre el checkpoint `HuggingFaceTB/SmolLM3-3B-checkpoints`, con 30.228.480 parámetros, que se fusiona en los pesos del backbone en bf16 en el momento de la carga. El backbone se descarga desde su propio repositorio, fijado al commit `cfb32d505f5025ec9be4e704f70cfbf5bdf8da94`. La inferencia no genera texto: se lee la distribución sobre las respuestas permitidas en la posición de respuesta, en un único forward pass, sin decodificación, y se puntúa con la regla de puntuación propia de cada primitiva.

El entrenamiento se realizó sobre la "decision readout" del propio modelo con supervisión, usando las particiones de train de las 16 fuentes de jev-bench no reservadas (5.885 familias, con un máximo de 400 registros por fuente) y opciones barajadas por familia. Los hiperparámetros son: learning rate 3e-05, 2 épocas, mejor época por pérdida de validación (época 1) y semilla 0. Posteriormente se ajustó una receta Tier 0 (temperatura por primitiva, sesgo de Noul y permutaciones de orden de opciones) sobre las particiones de validación. Las seis fuentes held-out (`clinc150`, `arc_challenge`, `yelp5`, `measuring_hate_speech`, `fever_evidence`, `strategyqa_grounded`) nunca aparecieron en entrenamiento. Una comprobación de reproducción sobre 72 registros de test de seis fuentes no cambió ninguna respuesta de elección, con un |Δp| medio de 0,004 y máximo de 0,030.

## Capacidades

- Decisiones tipadas: responde a preguntas de tipo `choice` (elección entre opciones), `score` (puntuación) y `noul` (none-of-the-above), devolviendo una distribución de probabilidad sobre las respuestas permitidas.
- Calibración de probabilidades: ECE de 0,058 y Brier de 0,363 en la partición de test de jev-bench, lo que permite usar las probabilidades como umbrales de decisión en código.
- No genera lenguaje natural: su salida son valores tipados, lo que lo orienta a integrarse como componente de decisión en pipelines, no como chatbot.
- Integración como servicio: `jevify-serve` lo expone como reemplazo directo (drop-in) del SDK TypeSafe (`TYPESAFE_BASE_URL=http://localhost:8000`).
- Evaluación de reglas explícitas: la suite OOD incluye pruebas de regla indicada en la pregunta (LegalBench).
- Manejo de "none-of-the-above": evalúa qué ocurre cuando se elimina la opción correcta.
- Robustez frente a inyección de instrucciones: la suite mide la tasa de secuestro (hijack) por instrucciones inyectadas.
- Detección de phishing: la suite reporta AUROC sobre un benchmark de correos de phishing.
- Evaluación de riesgo de herramientas: la suite incluye una métrica de riesgo de herramientas (tool risk).
- Multilingüismo: no confirmado para el adaptador; heredado potencialmente del backbone SmolLM3-3B, que es multilingüe.

## Casos de uso

- Analisis de sentimiento binario o por clases: dado un texto (por ejemplo, una reseña), se formula una pregunta `noul` del tipo "¿es positiva la reseña?" y el modelo devuelve una probabilidad calibrada que el código puede comparar con un umbral.
- Enrutado de intencion en asistentes: sobre dominios como `clinc150`, el modelo puede clasificar la intención del usuario y devolver una distribución sobre intenciones candidatas para que un orquestador decida la siguiente acción.
- Moderacion de contenido: con fuentes como `measuring_hate_speech`, permite etiquetar mensajes según categorías de discurso de odio y exponer la confianza de cada categoría para revisión humana.
- Verificacion de hechos y atribucion de evidencia: con `fever_evidence`, el modelo puede decidir si una afirmación está respaldada, refutada o no verificable, aprovechando la primitiva `noul`.
- Puntuacion de calidad tipo escala (1-5): en escenarios como `yelp5`, la primitiva `score` devuelve una distribución sobre la escala, útil para ranking o priorización de reseñas.
- Deteccion de phishing: la suite reporta AUROC de 0,794 en el checkpoint sin ajustar, por lo que el modelo es aplicable como clasificador de correos maliciosos, aunque el umbral de decisión debe recalibrarse tras el fine-tuning.
- Evaluacion de riesgo de herramientas en agentes: la métrica `tool risk` (0,800 en el checkpoint sin ajustar) apunta a usarlo para decidir si una llamada a herramienta es segura antes de ejecutarla.
- Decisiones con ramificacion en codigo: al devolver distribuciones en lugar de texto, encaja en lógica de negocio que requiere valores tipados y trazables (por ejemplo, aceptar, rechazar o derivar a revisión según la probabilidad).
- Sustitucion de la API TypeSafe en desarrollo: mediante `jevify-serve` puede levantarse en local como backend compatible con el SDK TypeSafe, sin depender del servicio propietario Jev.

## Benchmarks y rendimiento

Decisiones y calibración (particiones de test de jev-bench, 22.773 registros; la fila de este modelo y las de referencia provienen del mismo estudio):

| Modelo | acc | ECE | Brier | held-out acc | TVD a etiquetas humanas |
|---|---|---|---|---|---|
| Este modelo | 0,705 | 0,058 | 0,363 | 0,741 | 0,337 |
| SmolLM3-3B APO checkpoint, sin ajustar (Tier 0) | 0,539 | 0,117 | 0,526 | 0,579 | 0,460 |
| Misma receta + coherencia | 0,708 | 0,055 | 0,360 | 0,749 | 0,318 |
| Misma receta desde el checkpoint SFT | 0,705 | 0,057 | 0,365 | 0,738 | 0,350 |
| Jev 1.13.0 (API TypeSafe) | 0,733 | 0,113 | 0,349 | 0,835 | 0,432 |

Coherencia e invarianza (sure loss: media de d² sobre 4.749 familias de preguntas, 0 = perfectamente coherente; order flip: con qué frecuencia cambia la respuesta principal al barajar las opciones; tag TVD: cuánto se mueve la distribución al cambiar las etiquetas de opción de A–J a otros identificadores):

| Modelo | Sure loss | Share incoherent | Order flip | Tag TVD | K=2→max acc drop |
|---|---|---|---|---|---|
| Este modelo | 0,292 | 0,964 | — | — | — |
| SmolLM3-3B APO checkpoint, sin ajustar (Tier 0) | 0,226 | 0,990 | 0,435 | 0,077 | 0,566 |
| Misma receta + coherencia | 0,041 | 0,640 | — | — | — |
| Misma receta desde el checkpoint SFT | 0,315 | 0,966 | — | — | — |
| Jev 1.13.0 (API TypeSafe) | 0,081 | 0,725 | 0,046 | — | 0,246 |

Fuera de distribución (regla indicada en la pregunta vía LegalBench; "none" cuando se elimina la opción oro; tasa de hijack por instrucciones inyectadas; AUROC de phishing; riesgo de herramientas):

| Modelo | Stated rule | 'none' when gone | Hijack | Phishing AUROC | Tool risk |
|---|---|---|---|---|---|
| Este modelo | — | — | — | — | — |
| SmolLM3-3B APO checkpoint, sin ajustar (Tier 0) | 0,588 | 0,552 | 0,464 | 0,794 | 0,800 |
| Misma receta + coherencia | — | — | — | — | — |
| Misma receta desde el checkpoint SFT | — | — | — | — | — |
| Jev 1.13.0 (API TypeSafe) | 0,924 | 0,744 | 0,205 | 0,688 | 0,933 |

Comprobación de reproducción: al cargar la carpeta con `load_jevified` y reevaluar 72 registros de test de jev-bench de seis fuentes, se reprodujeron las predicciones del propio entrenamiento con 0 respuestas de elección cambiadas, |Δp| máximo medio de 0,004 y máximo de 0,030.

## Requisitos de hardware

- El repositorio ocupa 0,1 GB (adaptador LoRA de 30.228.480 parámetros); el backbone SmolLM3-3B (~3B) se descarga aparte.
- Inferencia en bf16 del backbone fusionado: aproximadamente 6-7 GB de VRAM contando pesos y overhead, dado que el adaptador se fusiona en bf16 al cargar.
- En cuantización de 4 bits el backbone quedaría en torno a 2-2,5 GB, aunque la documentación no especifica cuantizaciones soportadas para este adaptador.
- GPU de consumo: cabe con holgura en tarjetas de 12 GB o más (RTX 3060 12 GB, RTX 4070, RTX 4090) y en tarjetas de 8 GB si se aplica cuantización.
- GPU de数据中心: A100, H100 y similares son suficientes y sobredimensionadas para un modelo de 3B; no hay cifras de throughput publicadas.
- Despliegue: la vía documentada es la librería `jevify` con `load_jevified` y el servidor `jevify-serve`, que expone el modelo como backend compatible con el SDK TypeSafe (`TYPESAFE_BASE_URL=http://localhost:8000`).
- vLLM, llama.cpp, Ollama y TGI: no se mencionan en la documentación del modelo; soporte no disponible.
- Latencia y throughput: no disponible (el readout es un único forward pass sin decodificación, lo que reduce coste frente a generación autoregresiva, pero no hay cifras publicadas).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Precisión (acc) | ECE | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Este modelo (jevify-smollm3-3b-apo-readout) | LoRA 30,2M sobre SmolLM3-3B (~3B) | no disponible (backbone diseñado para contexto largo) | 0,705 | 0,058 | Apache 2.0 | HuggingFace, 0 descargas, 0 likes |
| jevify-smollm3-3b-apo-readout-coh | LoRA sobre SmolLM3-3B (~3B) | no disponible | 0,708 | 0,055 | Apache 2.0 | HuggingFace (misma familia) |
| jevify-smollm3-3b-sft-readout | LoRA sobre SmolLM3-3B (~3B) desde checkpoint SFT | no disponible | 0,705 | 0,057 | Apache 2.0 | HuggingFace (misma familia) |
| SmolLM3-3B APO checkpoint sin ajustar | ~3B | heredado del backbone | 0,539 | 0,117 | según backbone (SmolLM3) | HuggingFace |
| Jev 1.13.0 | no disponible | no disponible | 0,733 | 0,113 | propietaria | API TypeSafe (acceso limitado) |

## Limitaciones y advertencias

- Una sola semilla de entrenamiento por rama del repositorio; los números fuera de distribución varían entre ejecuciones idénticas, por lo que el autor recomienda comparar variantes entre semillas antes de extraer conclusiones.
- Coherencia limitada: el sure loss es de 0,292 y la fracción de resultados incoherentes es del 0,964, peor que el checkpoint sin ajustar (0,226 y 0,990) y muy lejos de la variante con penalización de coherencia (0,041 y 0,640). En la práctica, pequeñas variaciones de formulación pueden alterar la decisión.
- El sesgo de calibración se degrada fuera de distribución: el umbral de decisión del benchmark de phishing se desplaza tras el fine-tuning, aunque el ranking (AUROC) se preserva; el autor indica que un desplazamiento de log-odds ajustado con unos pocos correos etiquetados lo repara.
- En la tabla de decisiones y calibración, este modelo tiene mejor precisión y ECE que la API propietaria Jev 1.13.0, pero peor precisión held-out (0,741 frente a 0,835) y peor TVD frente a etiquetas humanas (0,337 frente a 0,432, donde menor es mejor para Jev).
- Métricas de invarianza (order flip, tag TVD, K=2→max acc drop) y de fuera de distribución (stated rule, 'none' when gone, hijack, phishing AUROC, tool risk) no están reportadas para este modelo en la información disponible; solo existen para el checkpoint sin ajustar y para Jev 1.13.0.
- Riesgo de alucinación: no aplica en el sentido generativo (el modelo no produce texto), pero sí existe el riesgo de decisiones mal calibradas en dominios alejados de los datos de entrenamiento.
- Idiomas y cuantizaciones soportadas: no disponibles; no hay garantía documentada de comportamiento multilingüe para el adaptador.
- Adopción nula: 0 descargas y 0 likes en HuggingFace en el momento de la consulta, sin validación por parte de terceros.
- Licencia Apache 2.0: permite uso comercial, pero al derivar de SmolLM3-3B conviene verificar las condiciones del backbone base.
- La primitiva de decisión y el formato de preguntas tipadas implican una integración estrecha con la librería `jevify` y el SDK TypeSafe; no es un modelo de propósito general.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Praveenrajus/jevify-smollm3-3b-apo-readout
- Dataset jev-bench: https://huggingface.co/datasets/Praveenrajus/jev-bench
- Leaderboard de jev-bench: https://huggingface.co/datasets/Praveenrajus/jev-bench#leaderboard
- Hallazgos del proyecto (FINDINGS.md, sección 18): https://github.com/uspraveen/Jevify/blob/main/docs/FINDINGS.md#18-readout-fine-tuning-and-what-a-coherence-penalty-adds
- Código del proyecto Jevify: https://github.com/uspraveen/Jevify
- Motor de Jevify: https://github.com/uspraveen/Jevify/tree/main/jevify/engine
- Modelo relacionado (misma receta + penalización de coherencia): https://huggingface.co/Praveenrajus/jevify-smollm3-3b-apo-readout-coh
- Modelo relacionado (misma receta desde el checkpoint SFT): https://huggingface.co/Praveenrajus/jevify-smollm3-3b-sft-readout
- Backbone SmolLM3-3B: https://huggingface.co/HuggingFaceTB/SmolLM3-3B
- Blog de SmolLM3: https://huggingface.co/blog/smollm3
- Repositorio de la familia SmolLM: https://github.com/huggingface/smollm
- Jev (modelo de IA) en Wikipedia: https://en.wikipedia.org/wiki/Jev_(AI_model)
