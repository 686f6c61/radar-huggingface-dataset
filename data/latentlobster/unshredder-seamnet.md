# LatentLobster/unshredder-seamnet

## Resumen

SeamNet es un modelo de visión por computador desarrollado por LatentLobster que puntúa la compatibilidad entre bordes de tiras de papel trituradas en corte longitudinal (strip-cut). No es un modelo generativo ni un LLM: es el componente de scoring del sistema [unshredder](https://github.com/nikola-rahman/unshredder), una herramienta de reconstrucción forense de documentos destruidos que reensambla tiras a partir de un montón mezclado y deja al revisor humano confirmar las uniones inciertas.

Técnicamente se trata de un bi-encoder contrastivo que opera sobre bandas de borde de 48 píxeles. Usa un stem ConvNeXt-Tiny con las dos primeras etapas (downsampling solo en anchura en la etapa 2, filas mantenidas a stride 4), un colapso por fila y una convolución depthwise vertical que producen un embedding de 128 dimensiones por cada fila de 4 píxeles de cada borde. La compatibilidad entre dos tiras se calcula como el mejor producto escalar entre el embedding derecho de una y el izquierdo de la otra sobre desplazamientos verticales de hasta ±12 píxeles, más una puntuación aprendida de "sin vecino" para los bordes de página.

Su relevancia es acotada pero específica: cubre un nicho forense y de recuperación documental donde las alternativas publicadas son escasas y con rendimiento muy inferior. El repositorio es de 0.0 GB y registra 0 descargas y 0 likes en el momento de la consulta, lo que indica un modelo recién publicado y sin adopción comunitaria todavía.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Bi-encoder contrastivo con stem ConvNeXt-Tiny (etapas 1-2), colapso por fila y convolución depthwise vertical |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de lenguaje) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (procesa imágenes de documentos, no texto) |
| Licencia | MIT |
| Formato de pesos | PyTorch (`run2.pt`) |

## Arquitectura y entrenamiento

SeamNet es un bi-encoder contrastivo sobre bandas de borde de 48 píxeles. El stem ConvNeXt-Tiny procesa únicamente las dos primeras etapas, con downsampling solo en anchura en la etapa 2 y manteniendo las filas a stride 4. Después, un colapso por fila y una convolución depthwise vertical generan un embedding de 128 dimensiones por cada fila de 4 píxeles de cada borde. La puntuación de compatibilidad de la tira *a* seguida de la tira *b* se obtiene como el mejor producto escalar entre el embedding derecho de *a* y el izquierdo de *b* sobre desplazamientos verticales de hasta ±12 píxeles, sumado a una puntuación aprendida de "sin vecino" para los bordes de página. El modelo se entrena con objetivo contrastivo, aunque la model card no detalla la función de pérdida exacta ni el número de pasos de entrenamiento.

Los datos de entrenamiento combinan tres fuentes: páginas sintéticas renderizadas a partir de texto, 116 000 páginas PDF reales del dataset `pixparse/pdfa-eng-wds` (2 páginas por documento, con verificación de fuga contra los conjuntos de evaluación) y tiras reales de los datasets de Paixão et al., todo ello con aumentación de escáner y trituradora. No se menciona en la información disponible el uso de RLHF, DPO ni ninguna fase de alineación, algo esperable en un modelo de visión discriminativo.

## Capacidades

- Puntuación de compatibilidad entre el borde derecho de una tira y el borde izquierdo de otra, expresada como log-score.
- Manejo de desplazamientos verticales de hasta ±12 píxeles entre tiras adyacentes.
- Puntuación aprendida de "sin vecino" para identificar bordes de página.
- Modo disperso (`sparse_scores`) con top-k candidatos por borde, normalizadores softmax exactos y soporte multi-GPU para montones grandes.
- Reconstrucción de documentos triturados en corte longitudinal a partir de un montón mezclado.
- Integración con revisión humana para confirmar uniones inciertas.
- No soporta generación de texto, tool calling, agentes, visión general, audio ni capacidades multilingües en el sentido de un LLM.

## Casos de uso

- Reconstrucción forense de documentos: el modelo puntúa todos los pares de bordes de un montón de tiras y permite reensamblar el documento original; el flujo está pensado para que un perito confirme las uniones con puntuación baja antes de dar el resultado por válido.
- Recuperación de archivo histórico destruido: aplicable a lotes de documentos triturados en corte longitudinal donde se conservan las tiras, con la ventaja de que el modelo trabaja sobre imágenes en escala de grises y no requiere transcripción previa.
- Verificación de integridad documental en entornos de compliance: permite comprobar si un conjunto de tiras corresponde a un único documento o a varios, usando la puntuación de "sin vecino" para detectar bordes de página.
- Análisis de material intervenido en investigación policial: el modo `sparse_scores` con top-k y multi-GPU hace viable procesar montones de miles de tiras, y el revisor humano acota el esfuerzo a las decisiones inciertas (3,42 decisiones simuladas por documento para alcanzar el 100 % de acierto).
- Docencia e investigación en visión por computador: el checkpoint sirve como referencia reproducible para experimentos de matching de bordes y aprendizaje contrastivo sobre imágenes de documentos.
- Automatización de pipelines de digitalización con documentos dañados: integrado en un flujo de captura, el modelo puede proponer un orden de tiras antes de la digitalización final, reduciendo la manipulación manual del papel.

## Benchmarks y rendimiento

Evaluación sobre 45 documentos triturados reales reservados, agrupados en un único montón de 1 063 tiras con tinta:

| Métrica | run 2 |
|---|---|
| Vecino derecho verdadero en posición #1 entre todas las tiras (top1_pooled) | 0,89–0,90 |
| Decisiones simuladas de revisor por documento para alcanzar el 100 % correcto | 3,42 (IC 95 %: 1,91–5,64) |
| Uniones automáticas correctas (auto-join a ≥ 0,9999, temperatura 4) | 99,65 % |

Reconstrucción de documento individual sobre los mismos 45 documentos (run 1 anterior): 98,5 % ± 1,9 de precisión de vecino y 91 % de páginas completadas al 100 %, frente al 23,2 % y 0 % de Ranca & Murray (2013).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. El checkpoint es un `run2.pt` de un repositorio de 0.0 GB, lo que sugiere un modelo pequeño, pero no se especifica el tamaño exacto ni el consumo de memoria.
- GPU recomendadas: no disponible. El modo `sparse_scores` menciona soporte multi-GPU, lo que indica que el modelo escala a varias GPU para montones grandes, pero no se detallan modelos concretos.
- Compatibilidad con GPU de consumo: no confirmada explícitamente; por el tamaño del repositorio (0.0 GB) es plausible que quepa en GPU de consumo, pero este dato no está en la información disponible.
- Opciones de despliegue: la model card solo documenta el uso mediante la librería `unshredder` (`unshredder.seamnet.load_model` y `unshredder.seamnet.scores`). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo de visión de este tipo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| SeamNet (run 2) | Bi-encoder ConvNeXt-Tiny para matching de bordes | no disponible | no aplica | 0,89–0,90 top1_pooled; 99,65 % auto-join | MIT | HuggingFace |
| Ranca & Murray (2013) | Método clásico de reconstrucción de tiras | no aplica | no aplica | 23,2 % de páginas completas al 100 % | no disponible | Publicación académica |
| Paixão et al. | Conjunto de datos y métodos de referencia para tiras reales | no aplica | no aplica | no disponible en la información proporcionada | no disponible | Dataset académico |

No se dispone de datos suficientes para comparar con otros modelos de matching de bordes publicados en HuggingFace.

## Limitaciones y advertencias

- Solo cubre corte longitudinal (strip-cut); no soporta confeti de corte cruzado (cross-cut).
- Asume que las tiras están en orientación vertical correcta; tiras rotadas o invertidas no están contempladas.
- El modelo es sobreconfiado en documentos en cirílico no vistos en entrenamiento; se recomienda calibrar la temperatura sobre una muestra del material objetivo y mantener siempre un revisor humano en el bucle.
- La precisión cae a medida que crece el montón, y las tiras con muy poca tinta suelen ser ambiguas.
- No se han publicado datos sobre sesgos demográficos, pero al operar sobre imágenes de documentos puede heredar sesgos de los datasets de entrenamiento (predominantemente PDF en inglés y material de Paixão et al.).
- Riesgo de alucinación no aplica en el sentido de un LLM, pero sí existe riesgo de uniones incorrectas con puntuación alta; el umbral de auto-join a ≥ 0,9999 está calibrado para limitar este riesgo al 0,35 % de error.
- La licencia MIT permite uso comercial sin restricciones adicionales conocidas, aunque la model card no incluye cláusulas específicas sobre responsabilidad en contextos forenses.
- El modelo tiene 0 descargas y 0 likes, sin validación externa por parte de la comunidad; conviene tratar los resultados como preliminares hasta replicarlos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/LatentLobster/unshredder-seamnet
- Repositorio del sistema unshredder: https://github.com/nikola-rahman/unshredder
- Dataset de páginas PDF de entrenamiento: https://huggingface.co/datasets/pixparse/pdfa-eng-wds
- Referencia académica Ranca & Murray (2013): no disponible como enlace en la información proporcionada
- Datasets de Paixão et al.: no disponible como enlace en la información proporcionada
