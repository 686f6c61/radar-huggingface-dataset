# Athekunal/llm-jev-qwen3-0.6b

## Resumen

llm-jev-qwen3-0.6b es un ajuste fino del modelo Qwen3-0.6B desarrollado por el usuario Athekunal, concebido no como un modelo generativo al uso sino como un modelo de decisión ("Jev decision model"). Dado un documento, una pregunta y una lista de opciones numeradas, el modelo puntúa cada opción recorriendo un árbol de candidatos (candidate trie), en lugar de generar texto libre. La aproximación sigue el trabajo *LLM-as-Jev* de Li y Wagle (arXiv 2610.02076v3).

El repositorio contiene dos artefactos: los pesos fusionados (merged) en el nivel superior y el adaptador LoRA en el subdirectorio `adapter/`. El modelo base es Qwen3-0.6B, un transformer denso de aproximadamente 596 millones de parámetros, con licencia Apache 2.0. El ajuste se realizó con LoRA de rango 16 sobre un conjunto de 13 datasets de razonamiento, clasificación de intenciones y comprensión lectora.

Su relevancia es acotada y específica: propone una formulación de selección entre opciones mediante pérdida listwise factorizada en árbol, con anclajes KL al modelo base. No está pensado para generación abierta; la propia model card advierte que la generación directa con estos pesos no es el uso para el que fueron entrenados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3), ajustado con LoRA y pesos fusionados |
| Parametros totales | 596.049.920 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible de forma explícita; se descartan filas de entrenamiento de más de 16.384 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (pesos fusionados y adaptador LoRA en `adapter/`) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-0.6B, un transformer denso decoder-only, y se ajusta mediante LoRA de rango 16 con alpha 32. El entrenamiento emplea una pérdida listwise factorizada en árbol (`L_tree`) combinada con anclajes KL hacia el modelo base (`L_mass` + `L_out` + `L_pos`), con λ = 1. La hipótesis subyacente es que puntuar opciones a través de un trie de candidatos es más adecuado que la generación autoregresiva convencional para tareas de selección entre alternativas.

Los datos de entrenamiento provienen de la mezcla "Reason+Long con Nimble": 1.000 filas de cada uno de 13 datasets (CLINC150, MASSIVE, Bitext, ReClor, LogiQA 2.0, CosmosQA, PIQA, alpha-NLI, ProofWriter, ContractNLI, MuSiQue, QuALITY y Nimble). Las opciones se rebarajan en cada ejemplo de entrenamiento, y se descartan las filas de más de 16.384 tokens. El ajuste consistió en una época, batch 32, learning rate 1e-4 con warmup y decaimiento lineal, 406 pasos y semilla 20260922.

## Capacidades

- Puntuación de opciones: dado un documento, una pregunta y una lista numerada de opciones, asigna una puntuación a cada candidato mediante el trie de candidatos.
- Selección de respuesta única: devuelve la opción con mayor puntuación, adecuada para tareas de elección múltiple y clasificación cerrada.
- Clasificación de intenciones: entrenado con CLINC150, MASSIVE y Banking77 (evaluado), por lo que puede asignar utterances a intenciones predefinidas.
- Razonamiento sobre documentos: incluye datasets de comprensión lectora y razonamiento (CosmosQA, QuALITY, MuSiQue, LogiQA 2.0, ReClor, ProofWriter).
- Inferencia de relación textual: alpha-NLI y ContractNLI aportan capacidad de determinar implicación y contradicción.
- No soporta tool calling ni function calling de forma documentada.
- No soporta generación de texto libre como uso previsto.
- Capacidades multilingües: no documentadas; los idiomas soportados figuran como no disponibles.
- No se documenta vision, audio ni modo de razonamiento explícito (thinking).

## Casos de uso

- Clasificación de intenciones en asistentes conversacionales: con las opciones definidas como etiquetas de intención, el modelo puntúa cada una sobre el utterance del usuario, lo que encaja con el entrenamiento en CLINC150, MASSIVE y Banking77 (donde sube de 18,3 a 58,9 puntos de accuracy frente al base).
- Enrutamiento de tickets de soporte: presentar al modelo el texto del ticket y un conjunto cerrado de categorías de departamento para obtener la categoría con mayor puntuación, sin generación libre.
- Selección de respuestas en sistemas de QA extractivo cerrado: dado un pasaje y una pregunta con opciones candidatas predefinidas, elegir la mejor, aprovechando el entrenamiento en QuALITY, MuSiQue y CosmosQA.
- Verificación de contratos y cláusulas: usar ContractNLI y alpha-NLI para determinar si un fragmento implica, contradice o es neutral respecto a una hipótesis planteada como opción.
- Evaluación de razonamiento lógico en pipelines de filtrado: con ProofWriter y LogiQA 2.0 como base de entrenamiento, puntuar conclusiones candidatas en tareas de deducción.
- Moderación o etiquetado con taxonomías cerradas: definir las opciones como categorías de política y puntuar cada una sobre el contenido, evitando el coste de generar texto y validarlo después.
- Selección de respuesta en exámenes o tests automatizados: la formulación listwise con rebarajado de opciones reduce el sesgo posicional, útil para puntuar bancos de preguntas con opciones fijas.

## Benchmarks y rendimiento

Resultados publicados en la model card. La accuracy se mide como la opción con mayor puntuación.

Split held-out de los datasets de entrenamiento:

| Metrica | Base | Este modelo |
|---|---|---|
| Accuracy, % | 46,7 | 65,0 |
| log p(gold) | -2,50 | -0,88 |
| Root mass sobre tokens legales | 0,9999 | 0,9987 |

Benchmarks externos, accuracy en %:

| Benchmark | Base | Este modelo |
|---|---|---|
| arc_challenge | 57,2 | 58,0 |
| boolq | 70,8 | 65,2 |
| sciq | 92,5 | 94,2 |
| winogrande | 55,0 | 55,0 |
| mmlu | 43,0 | 44,2 |
| mmlu_pro | 22,6 | 24,9 |
| banking77 | 18,3 | 58,9 |
| jevbench | 61,5 | 60,2 |
| external_macro | 56,8 | 56,9 |

El propio autor señala que el entrenamiento no mejora la media macro externa más allá del ruido, con un error estándar de aproximadamente 1,4 puntos sobre la accuracy held-out, y que cada ejecución usa una sola semilla.

## Requisitos de hardware

- VRAM estimada para inferencia: con 596 millones de parámetros, en fp16 requiere en torno a 1,2 GB solo para pesos; en fp32 unos 2,4 GB. No se han publicado cifras oficiales de cuantización (no disponible).
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; una RTX 3060 de 12 GB, RTX 4060 Ti o RTX 4090 cubren el modelo con holgura. Para despliegue en servidor, A100 o H100 no son necesarias por tamaño, aunque pueden usarse para batch grande.
- Cabe en GPU consumer: sí, en la práctica totalidad de GPU con 4 GB o más de VRAM en fp16.
- Opciones de despliegue: el flujo previsto es la librería propia `llm_jev.modeling` con el trie de candidatos; el adaptador LoRA se carga con PEFT. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, y la generación libre no es el uso previsto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| llm-jev-qwen3-0.6b | 596 M | no disponible (filas >16.384 tokens descartadas) | Puntuación listwise con trie de candidatos | Apache 2.0 | Hugging Face (0 descargas) |
| Qwen/Qwen3-0.6B | 596 M | no disponible en la informacion | Generación autoregresiva general | Apache 2.0 | Hugging Face |
| Adaptadores LoRA de clasificación sobre Qwen3-0.6B | ~596 M | depende del base | Clasificación supervisada estándar | Apache 2.0 | Hugging Face |

La comparación relevante es contra el propio modelo base: en el split held-out de entrenamiento la mejora es de 18,3 puntos de accuracy, mientras que en la media macro de benchmarks externos la diferencia es de 0,1 puntos (56,8 frente a 56,9), dentro del ruido. En tareas de clasificación de intenciones (Banking77) la mejora es sustancial (18,3 a 58,9), mientras que en BoolQ retrocede (70,8 a 65,2).

## Limitaciones y advertencias

- La accuracy held-out se mide sobre los mismos 13 datasets de entrenamiento; no es evidencia fuera de distribución.
- El rendimiento en benchmarks externos no mejora de forma significativa: la media macro pasa de 56,8 a 56,9, y BoolQ y JevBench empeoran.
- La generación de texto libre no es el uso previsto; la model card advierte explícitamente contra ella.
- El modelo requiere su trie de candidatos y su código de puntuación; no es un modelo plug-and-play en pipelines estándar de inferencia.
- Licencias de datos: aunque los pesos son Apache 2.0, varios datasets de entrenamiento son solo para investigación o no comerciales (ReClor y LogiQA 2.0 entre ellos). Hay que revisar los términos de cada fuente antes de un uso comercial.
- Una sola semilla por ejecución y error estándar de ~1,4 puntos: las diferencias pequeñas no son concluyentes.
- Sesgos conocidos: no documentados en la información disponible.
- Riesgo de alucinación: no aplica del mismo modo al no generar texto, pero la puntuación puede favorecer opciones plausibles sin respaldo en el documento.
- Idiomas soportados: no disponibles; el entrenamiento se apoya en datasets mayoritariamente en inglés.
- Contexto máximo efectivo: no documentado; se descartaron filas de más de 16.384 tokens durante el entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Athekunal/llm-jev-qwen3-0.6b
- Repositorio de código: https://github.com/Athe-kunal/llm-as-jev
- Paper LLM-as-Jev: arXiv 2610.02076 (Li y Wagle, 2026)
- Paper Qwen3 Technical Report: arXiv 2505.09388
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B
