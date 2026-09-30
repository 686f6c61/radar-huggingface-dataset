# sankalpsthakur/qwen3-06b-typed-decisions-cloud-pilot

## Resumen

El repositorio `sankalpsthakur/qwen3-06b-typed-decisions-cloud-pilot` no es un modelo completo, sino un adaptador LoRA entrenado con PEFT sobre el modelo base `Qwen/Qwen3-0.6B` (Apache-2.0, commit `c1899de289a04d12100db370d81485cdf75e47ca`). Lo desarrolla el usuario sankalpsthakur como piloto de investigación reproducible para decisiones binarias tipadas (sí/no) fundamentadas en evidencia. El adaptador añade 1.146.880 parámetros entrenables y se distribuye en formato safetensors con la librería `peft`.

El problema que aborda es acotado y explícito: dada una evidencia y una pregunta (protocolo BoolQ), el modelo debe emitir exactamente `Yes` o `No`, con el modo de razonamiento (*thinking*) de Qwen3 desactivado en la plantilla de chat. La evaluación no mide generación libre, sino la probabilidad normalizada entre los dos únicos tokens de respuesta (`p_yes` como puntuación condicional de dos etiquetas), lo que lo convierte en un banco de pruebas de calibración más que en un asistente conversacional.

Su relevancia es metodológica: cada paso está documentado y verificado con recibos (`receipt.json`, `calibration_receipt.json`, `reload_receipt.json`), incluye un control de solapamiento de identificadores y una comprobación independiente de recarga del artefacto (8/8 coincidencias exactas de probabilidad, diferencia absoluta máxima 0.0). El autor declara explícitamente que no reproduce la arquitectura no divulgada de Jev ni establece un avance de frontera.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre un transformer decoder-only denso Qwen3-0.6B; LoRA aplicado a `q_proj` y `v_proj` |
| Parametros totales | Base: 0,6 mil millones aprox.; adaptador: 1.146.880 parametros entrenables |
| Parametros activos | No aplica (el modelo base es denso, no MoE) |
| Longitud de contexto | 512 tokens de longitud máxima de secuencia usada en el entrenamiento; contexto nativo del modelo base no disponible en la información proporcionada |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye como pesos LoRA en safetensors) |
| Idiomas soportados | No disponible (la model card no declara idiomas; se entrenó únicamente con datos BoolQ en inglés) |
| Licencia | Apache-2.0 (adaptador y código de evaluación); el modelo base y los conjuntos de datos conservan sus propias licencias |
| Formato de pesos | safetensors (adaptador LoRA de PEFT, `library_name: peft`) |

Otros datos: identificador `sankalpsthakur/qwen3-06b-typed-decisions-cloud-pilot`, pipeline `text-generation`, 5 descargas, 0 likes, tamaño del repositorio 0.0 GB, creado y actualizado el 2026-09-30. SHA-256 del adaptador descargado: `827fd0d08c308a89df55343ad7045d9d5b9ac22394e4fa876bdef8c2a001c845`.

## Arquitectura y entrenamiento

El adaptador se entrenó sobre el checkpoint congelado de Qwen3-0.6B con LoRA de rango 8, alpha 16 y dropout 0.05, aplicado exclusivamente a las proyecciones `q_proj` y `v_proj`. La configuración de entrenamiento fue de 600 pasos, tamaño de lote 2, longitud máxima de secuencia 512, semilla `20260930` y optimizador AdamW con tasa de aprendizaje `1e-4`. El entrenamiento se ejecutó en una GPU Tesla T4 asignada por Kaggle, con un tiempo de ejecución de 254,2 segundos. El script completo está en `run.py` dentro del repositorio.

Los datos proceden del conjunto `Praveenrajus/jev-bench` (commit `18f88da81c28c2bec55edc31f63f2afdfba109ea`): 1.200 registros de entrenamiento BoolQ y 128 registros de validación BoolQ. La pérdida se aplica únicamente al token de respuesta. El protocolo de evaluación construye el prefijo compartido y puntúa los logits del siguiente token para `Yes` y `No`, normalizándolos después; por tanto `p_yes` es una puntuación condicional de dos etiquetas y no la probabilidad irrestricta del modelo de responder afirmativamente. No se menciona ningún uso de RLHF, DPO ni decodificación especulativa. La innovación destacable no es arquitectónica, sino de protocolo: fijar el modo de decisión, exigir la etiqueta exacta y publicar recibos de reproducibilidad y calibración.

## Capacidades

- Decisión binaria tipada (sí/no) fundamentada en una evidencia y una pregunta, en el formato del conjunto BoolQ.
- Puntuación calibrable mediante normalización de los logits de dos etiquetas, útil para análisis de fiabilidad probabilística.
- Confirmación de respuestas de comprensión lectora en inglés dentro del protocolo medido.
- Transferencia limitada a conjuntos de decisión fundamentada tipo StrategyQA (medida en la evaluación).
- No soporta tool calling ni function calling; no está entrenado ni evaluado para ello.
- No soporta agentes ni razonamiento multi-paso; el modo *thinking* de Qwen3 se desactiva explícitamente en la plantilla de chat.
- No se ha validado generación libre de texto: la model card indica que la generación abierta queda fuera del entorno medido.
- Capacidades multilingües no disponibles ni verificadas; los datos de entrenamiento son BoolQ en inglés.
- No hay capacidades de visión ni de audio.

## Casos de uso

- Verificación binaria de afirmaciones contra un pasaje: se suministra el texto de evidencia y una pregunta cerrada, y se lee la puntuación normalizada de `Yes`/`No` para decidir si el pasaje respalda la afirmación.
- Prefiltrado en pipelines RAG: usar el adaptador como clasificador de bajo coste que descarta pasajes irrelevantes antes de invocar un modelo mayor, aprovechando que solo necesita 512 tokens de entrada.
- Enrutado de decisiones en agentes: como componente de decisión tipada (por ejemplo, "¿debe escalarse esta consulta?") cuando la salida debe ser estrictamente binaria y auditable.
- Anotación asistida de conjuntos de datos: generar etiquetas preliminares con una puntuación de confianza asociada, que después revisa un anotador humano.
- Investigación en calibración: replicar la comparativa base frente a adaptador con temperaturas ajustadas y métricas Brier y ECE, usando los scripts `analyze.py` y `calibrate.py`.
- Docencia y experimentación con PEFT: servir de ejemplo mínimo y reproducible de cómo entrenar un adaptador LoRA de 1,1 millones de parámetros en una T4 en menos de cinco minutos.
- Estudio de transferencia fuera de dominio: evaluar el comportamiento del adaptador en conjuntos de decisión fundamentada distintos del de entrenamiento, como el conjunto `strategyqa_grounded/test`.
- Pruebas de protocolo de evaluación: validar metodologías de lectura de logits restringidas a etiquetas sin recurrir a generación libre.

## Benchmarks y rendimiento

Resultados declarados en la model card. Las puntuaciones son brutas (sin calibrar). El conjunto de confirmación BoolQ contiene 256 registros de test; el conjunto de transferencia contiene 128 registros de `strategyqa_grounded/test`. El intervalo de confianza es bootstrap al 95 % para la ganancia de precisión emparejada.

| Division | N | Precision base | Precision LoRA | Ganancia emparejada (IC 95 %) | Brier base → LoRA | ECE base → LoRA (10 bins) |
|---|---:|---:|---:|---:|---:|---:|
| Validacion BoolQ | 128 | 67,2 % | 78,9 % | +11,7 puntos [2,3; 21,1] | 0,216 → 0,193 | 0,117 → 0,189 |
| Confirmacion BoolQ | 256 | 71,1 % | 78,9 % | +7,8 puntos [2,0; 13,7] | 0,205 → 0,195 | 0,122 → 0,190 |
| Transferencia StrategyQA fundamentada | 128 | 55,5 % | 67,2 % | +11,7 puntos [2,3; 21,1] | 0,289 → 0,283 | 0,181 → 0,278 |

Tras inspeccionar esos resultados brutos, el autor ajustó temperaturas positivas separadas para base y adaptador minimizando la NLL únicamente sobre los 128 registros de validación (análisis exploratorio post hoc que no altera la precisión). Con esa calibración, el Brier en la confirmación BoolQ es 0,190 para la base frente a 0,158 para el adaptador (reducción emparejada 0,032 [0,007; 0,057]), y en StrategyQA fundamentada es 0,257 frente a 0,211 (reducción 0,045 [0,006; 0,084]). El ECE calibrado es 0,031 frente a 0,035 en BoolQ y 0,086 frente a 0,107 en StrategyQA: el adaptador sigue mostrando un ECE ligeramente superior.

## Requisitos de hardware

- El adaptador en sí ocupa unos pocos megabytes (1.146.880 parámetros); el peso real está en el modelo base Qwen3-0.6B, de aproximadamente 0,6 mil millones de parámetros.
- El entrenamiento declarado se completó en una única Tesla T4 de Kaggle en 254,2 segundos para 600 pasos con lote 2 y secuencia 512.
- Inferencia en GPU de consumo: cabe holgadamente en tarjetas con 6-8 GB de VRAM o más (RTX 3060, RTX 4060, RTX 4090, etc.) en precisión FP16 o cuantizado a 8/4 bits.
- También puede ejecutarse en CPU para lotes pequeños, dado el tamaño reducido del modelo base.
- Opciones de despliegue: `transformers` con `peft` para cargar el adaptador sobre el checkpoint base fijado; vLLM o TGI para servicio; llama.cpp/Ollama requieren convertir el modelo base a GGUF y aplicar el adaptador LoRA por separado.
- La model card insiste en que se debe usar el protocolo de prompt y lectura de `run.py`; la inferencia debe limitarse a la ruta medida de decisión binaria.
- Latencia y rendimiento de inferencia en producción: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Precision (BoolQ) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador (LoRA sobre Qwen3-0.6B) | 1.146.880 entrenables sobre base de 0,6 B | 512 tokens en entrenamiento | 78,9 % en confirmación BoolQ; 67,2 % en transferencia StrategyQA | Apache-2.0 | HuggingFace, 5 descargas |
| Qwen/Qwen3-0.6B (base sin adaptador) | 0,6 B | No disponible en la información proporcionada | 71,1 % en confirmación BoolQ; 55,5 % en transferencia StrategyQA | Apache-2.0 | HuggingFace |
| Qwen/Qwen3-0.6B-Base | 0,6 B | No disponible en la información proporcionada | No disponible | Apache-2.0 (segun el repositorio base) | HuggingFace, ModelScope |
| Mapika/decider (familia basada en Qwen3.5 para decisiones tipadas) | No disponible | No disponible | No disponible | No disponible | GitHub |

Las cifras de la base corresponden a la propia evaluación del autor bajo el mismo protocolo de lectura de logits. Para el resto de alternativas no se dispone de resultados comparables bajo ese protocolo.

## Limitaciones y advertencias

- No es un modelo de propósito general: la generación libre de texto queda explícitamente fuera del entorno medido y no está validada.
- El autor indica que este trabajo no valida respuestas abiertas, uso de seguridad, preparación para despliegue ni paridad con Jev.
- `p_yes` es una puntuación condicional de dos etiquetas, no la probabilidad irrestricta del modelo de responder afirmativamente; interpretarla como probabilidad calibrada sin más es incorrecto.
- El ECE bruto empeora tras el LoRA en las tres divisiones, y el ECE calibrado sigue siendo ligeramente superior en el adaptador. Las mejoras de Brier brutas tienen intervalos bootstrap que cruzan el cero.
- La calibración por temperatura es un análisis exploratorio post hoc; cualquier afirmación prospectiva de calibración exige un conjunto de test nuevo y no tocado.
- Las estimaciones se basan en muestras pequeñas (128 y 256 registros) y el conjunto de transferencia procede de una sola fuente, no de una batería amplia fuera de distribución.
- El ajuste de temperatura se realizó sobre los mismos 128 registros de validación, lo que introduce riesgo de sobreajuste en las métricas calibradas.
- Los intervalos bootstrap declarados son exploratorios y no contemplan todas las decisiones experimentales.
- No se redistribuyen pasajes ni preguntas de origen; el repositorio solo contiene etiquetas, puntuaciones e identificadores.
- La licencia del conjunto mixto `jev-bench` no otorga una licencia única para todas las fuentes; BoolQ se identifica como CC-BY-SA-3.0 y StrategyQA fundamentada como MIT. Hay que respetar las licencias de cada fuente.
- La licencia Apache-2.0 cubre el adaptador y el código de evaluación, no el modelo base ni los datos de origen.
- No hay información sobre sesgos demográficos o sociales, ni sobre comportamiento multilingüe.
- Riesgo de alucinación no evaluado en este protocolo, ya que las salidas se restringen a dos etiquetas.
- El contexto efectivo medido es de 512 tokens; no se ha verificado el comportamiento con entradas más largas.
- Exige cargar el checkpoint base en el commit exacto indicado y respetar el protocolo de prompt; usarlo de otra forma invalida las métricas publicadas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sankalpsthakur/qwen3-06b-typed-decisions-cloud-pilot
- Modelo base Qwen/Qwen3-0.6B: https://huggingface.co/Qwen/Qwen3-0.6B
- Variante base Qwen/Qwen3-0.6B-Base: https://huggingface.co/Qwen/Qwen3-0.6B-Base
- Conjunto de datos Praveenrajus/jev-bench: https://huggingface.co/datasets/Praveenrajus/jev-bench
- Kernel de Kaggle (version 1, privado): https://www.kaggle.com/code/sankalpsthakur/qwen3-06b-typed-decisions-cloud-pilot
- Repositorio GitHub Mapika/decider (familia relacionada de decisiones tipadas): https://github.com/Mapika/decider
- QwenCloud (plataforma de modelos Qwen): https://www.qwencloud.com/
- Qwen3-0.6B-Base en ModelScope: https://www.modelscope.cn/models/Qwen/Qwen3-0.6B-Base
