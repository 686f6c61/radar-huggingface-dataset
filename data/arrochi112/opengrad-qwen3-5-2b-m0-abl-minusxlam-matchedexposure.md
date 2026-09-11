# arrochi112/OpenGrad-Qwen3.5-2B-M0-ABL-MinusXLAM-MatchedExposure

## Resumen

OpenGrad-Qwen3.5-2B-M0-ABL-MinusXLAM-MatchedExposure es un ajuste fino supervisado (SFT) de parámetros completos sobre `Qwen/Qwen3.5-2B`, producido por el usuario arrochi112 dentro del proyecto OpenGrad. El modelo se entrena sobre el corpus Canonical-v2 con la fuente xLAM eliminada, durante un horizonte de pasos calculado para igualar la exposición de tokens supervisados del run de referencia (2.119 pasos, frente a los 2.400 del modelo de referencia). Su propósito no es el despliegue, sino documentar un resultado negativo verificable sobre el canal de supervisión de predicción de llamadas a herramientas.

El artefacto es explícitamente un objeto de investigación: el propio autor lo describe como "research artifact, not a production model". La ablación no aísla el contenido de xLAM, porque en Canonical-v2 la identidad de la fuente y el tipo de supervisión están perfectamente alineados: xLAM mapea a todos los registros `CALL_PREDICTION` y las otras tres fuentes a `COMPLETE_TRAJECTORY`. Por tanto, eliminar xLAM elimina simultáneamente una fuente y todo el canal de supervisión de predicción de llamadas, y no permite ninguna afirmación causal específica sobre xLAM.

La relevancia del modelo es metodológica. Todos los checkpoints de esta rama quedan `REJECTED` en la puerta `regression.call_recall` frente a la línea base sin entrenar (B0), y la caída de recall se interpreta, junto con la rama de cómputo fijo, como efecto de la supervisión ausente y no del presupuesto reducido. El repositorio ocupa 22,6 GB y publica cuatro checkpoints intermedios.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only heredada de Qwen/Qwen3.5-2B; detalles internos no disponibles |
| Parametros totales | Aproximadamente 2.000 millones (derivado del nombre del modelo y del modelo base; no se publica el recuento exacto) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (no se publican versiones cuantizadas) |
| Idiomas soportados | No disponible |
| Licencia | Otra; `license_name: composite-per-source` (licencia compuesta por fuente) |
| Formato de pesos | Safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo parte de `Qwen/Qwen3.5-2B` y se somete a un SFT de parámetros completos, sin adaptadores, sobre el dataset `arrochi112/OpenGrad-ToolPolicy-Canonical-v2-minus-xlam`. No se documentan en la información disponible ni la composición de arquitectura interna (número de capas, cabezas, tipo de atención) ni el número total de tokens de entrenamiento, la composición detallada del dataset o si hubo fases de RLHF, DPO u optimización por preferencias.

La innovación metodológica del experimento es el emparejamiento por exposición. El número de pasos no se elige, se calcula: `matched_steps = 2400 × (29.630.369 / 33.565.721) = 2118,6 → 2119`. El emparejamiento se hace sobre tokens supervisados (aquellos que portan la pérdida) y no sobre registros ni tokens renderizados, porque es esa masa la que actúa sobre el objetivo. Como los registros de xLAM son cortos, las tres métricas discrepan con fuerza: por registros darían 1.569 pasos y por tokens renderizados 1.544, frente a los 2.119 por tokens supervisados. Esta rama consume, además, un 11,7 % menos de pasos de optimizador y FLOPs que la referencia. La selección de checkpoint se hizo sobre la partición DEV de 2.373 ejemplos con una regla congelada antes del run; la partición confirmatoria de 1.277 ejemplos se puntuó una sola vez y solo sobre `checkpoint-1060`.

## Capacidades

- Ajuste específico para política de llamada a herramientas (tool calling) y function calling en el dominio del corpus Canonical-v2.
- Predicción de llamada (`CALL_PREDICTION`) y de trayectoria completa (`COMPLETE_TRAJECTORY`) sobre el esquema de decisión del corpus de entrenamiento.
- Señal de clarificación medida por la métrica `clarify`: el modelo tiende a clarificar con más frecuencia que la referencia (0,8194 frente a 0,7682).
- Control de sobre-llamada (`over_call`): registra el valor más bajo del experimento (0,0558), es decir, es el modelo menos propenso a invocar herramientas de forma innecesaria.
- Precisión de llamada: la más alta de las cuatro variantes evaluadas (0,8067).
- Razonamiento multietapa y comportamiento agéntico autónomo: no soportado de forma fiable; el propio autor lo excluye ("not for autonomous tool use").
- Capacidades multilingües: no disponibles.
- Capacidades especiales (modo de pensamiento, visión, audio): no disponibles.
- Validez de argumentos y validez de esquema: no medidas en este experimento.

## Casos de uso

- Replicación de experimentos de ablación: el modelo permite reproducir el resultado negativo del proyecto OpenGrad sobre la eliminación conjunta de xLAM y del canal `CALL_PREDICTION`, comparando el checkpoint publicado con la rama de referencia y con la de cómputo fijo bajo la misma partición confirmatoria.
- Investigación sobre supervisión de tool calling: sirve para estudiar cómo se degrada el recall de llamada (0,4238 frente a 0,9722 de B0) cuando se retira un canal de supervisión completo, manteniendo constante la exposición de tokens.
- Diagnóstico de sesgo en corpus de entrenamiento: al estar alineadas fuente y tipo de supervisión en Canonical-v2, el artefacto documenta el coste metodológico de confundir ambas variables y puede usarse como caso de estudio en diseño de datasets.
- Punto de comparación en evaluaciones internas: cualquier nuevo ajuste sobre Qwen3.5-2B orientado a tool calling puede medirse contra estas cifras de `call_f1`, precisión y `over_call` sobre la partición confirmatoria de 1.277 ejemplos.
- Estudio del compromiso precisión-recall en políticas de llamada: el modelo ocupa el extremo de máxima precisión y mínimo over-calling, lo que lo hace útil para analizar curvas de decisión y umbrales de invocación.
- Verificación de pipelines de evaluación: los cuatro checkpoints (`checkpoint-530`, `checkpoint-1060`, `checkpoint-1590`, `checkpoint-2119`) permiten trazar la evolución de las métricas a lo largo del entrenamiento y validar arneses de evaluación reproducibles.
- Docencia y revisión metodológica: como ejemplo publicado de artefacto de investigación con resultado negativo, es adecuado para ilustrar prácticas de emparejamiento de presupuesto de cómputo y congelación de reglas de selección antes del run.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre la partición confirmatoria (1.277 ejemplos, puntuada una sola vez):

| Run | call_f1 | Precision | Recall | over_call | clarify | unsupp |
|---|---:|---:|---:|---:|---:|---:|
| B0 (sin entrenar) | 0,6191 | 0,4542 | 0,9722 | 0,6425 | 0,1009 | 0,0131 |
| Referencia (corpus completo) @1800 | **0,7470** | 0,7350 | **0,7594** | 0,1505 | 0,7682 | 0,5430 |
| Rama de cómputo fijo @1200 | 0,6030 | 0,7893 | 0,4879 | 0,0716 | 0,8059 | 0,6026 |
| Este modelo (matched-exposure) @1060 | 0,5557 | 0,8067 | 0,4238 | 0,0558 | 0,8194 | 0,6203 |

Puntos clave: el recall cae más que en ninguna otra variante, mientras la precisión es la más alta y la sobre-llamada la más baja. Dado que la rama que entrena más pasos (esta) obtiene mejores valores en precisión que la de cómputo fijo, la pérdida de recall no se explica por el presupuesto reducido, sino que traza la supervisión ausente. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks generales en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en bf16/fp16, un modelo de ~2.000 millones de parámetros requiere del orden de 4 a 6 GB de VRAM incluyendo activaciones y caché; en cuantización de 4 bits bajaría a aproximadamente 1,5-2,5 GB. Son estimaciones por tamaño, no valores medidos publicados para este modelo.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para bf16 (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080, RTX 4090, L4, A10G). Para lotes grandes o entrenamiento adicional, A100 o H100 de 40/80 GB.
- Cabe en GPU de consumo: sí, holgadamente, en bf16 a partir de 8 GB de VRAM; con cuantización de 4 bits incluso en GPUs de 4-6 GB.
- Opciones de despliegue: al publicarse solo en safetensors, el camino directo es `transformers` (Python). vLLM y TGI pueden servir los pesos safetensors si la arquitectura de Qwen3.5 está soportada en esas versiones. Para llama.cpp u Ollama sería necesario convertir previamente los pesos a GGUF, conversión que no está publicada en el repositorio.
- Almacenamiento: el repositorio completo ocupa 22,6 GB debido a los cuatro checkpoints retenidos; conviene descargar únicamente `checkpoint-1060` si el objetivo es reproducir los números confirmatorios.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

La comparación natural es interna al propio experimento, ya que no se han publicado comparaciones con modelos externos de tool calling.

| Modelo | Parámetros | Contexto | call_f1 (confirmatoria) | Recall | over_call | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| Este modelo (matched-exposure) | ~2B | No disponible | 0,5557 | 0,4238 | 0,0558 | composite-per-source | Pesos publicados en HF |
| Referencia OpenGrad (corpus completo) | ~2B | No disponible | 0,7470 | 0,7594 | 0,1505 | composite-per-source | Pesos publicados por el mismo autor |
| Rama de cómputo fijo OpenGrad | ~2B | No disponible | 0,6030 | 0,4879 | 0,0716 | composite-per-source | Pesos publicados por el mismo autor |
| Qwen/Qwen3.5-2B (B0, sin ajustar) | ~2B | No disponible | 0,6191 | 0,9722 | 0,6425 | Según el modelo base | Público en HuggingFace |

No se dispone de comparativas frente a alternativas externas de la misma categoría (por ejemplo, otros modelos de 2B orientados a function calling) en la información proporcionada.

## Limitaciones y advertencias

- Artefacto de investigación: no es un modelo de producción, no está ajustado con técnicas de seguridad ni alineado, y no debe usarse para uso autónomo de herramientas.
- Resultado negativo confirmado: todos los checkpoints de ambas ramas quedan `REJECTED` en la puerta `regression.call_recall` frente a B0. La puerta se dejó tal como estaba escrita.
- Semilla única: el autor advierte que cualquier diferencia pequeña entre ramas es un hallazgo a replicar, no un resultado consolidado.
- Comportamientos no medidos: no se calculan la precisión de selección de herramienta, la validez de argumentos ni la validez de esquema; su ausencia no equivale a un cero.
- Riesgo de alucinación: elevado en el contexto de invocaciones de herramientas, ya que el corpus de entrenamiento incluye datos sintéticos e invocaciones de herramientas no verificadas.
- Confusión metodológica inherente: el modelo mide la eliminación conjunta de xLAM y del canal `CALL_PREDICTION`, no una ablación pura de contenido de xLAM; no admite afirmaciones causales específicas sobre xLAM.
- Degradación del recall: el recall cae hasta 0,4238, lo que implica que el modelo omite llamadas que debería emitir en casi seis de cada diez casos positivos.
- Fuera de distribución: el autor indica que el modelo se comportará mal fuera del comportamiento de frontera de decisión para el que fue entrenado.
- Licencia: `composite-per-source` (licencia compuesta por fuente), con implicaciones de uso comercial que dependen de las fuentes del dataset y del modelo base; debe revisarse caso por caso antes de cualquier uso comercial.
- Idioma y contexto: no se documentan idiomas soportados ni longitud de contexto, por lo que no puede garantizarse un comportamiento correcto fuera del inglés o de la ventana del modelo base.
- Adopción nula: cero descargas y cero me gusta en el momento de la consulta, lo que reduce la validación externa disponible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/arrochi112/OpenGrad-Qwen3.5-2B-M0-ABL-MinusXLAM-MatchedExposure
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Dataset de entrenamiento: https://huggingface.co/datasets/arrochi112/OpenGrad-ToolPolicy-Canonical-v2-minus-xlam
- Repositorio del proyecto OpenGrad: https://github.com/arjhinety/OpenGrad
- Otros enlaces: no se han encontrado enlaces adicionales relevantes en la búsqueda web (los resultados devueltos no guardan relación con el modelo).
