# Athekunal/llm-jev-qwen3-4b

## Resumen

llm-jev-qwen3-4b es un ajuste fino de Qwen/Qwen3-4B desarrollado por el usuario Athekunal para convertirlo en un "modelo de decisión" según el marco LLM-as-Jev (Li & Wagle, arXiv 2610.02076v3). El modelo no está pensado para generar texto libre, sino para puntuar una lista de opciones numeradas dada una pregunta y un documento de contexto, recorriendo un trie de candidatos. El repositorio contiene tanto los pesos fusionados en el nivel superior como el adaptador LoRA en el directorio `adapter/`.

El entrenamiento emplea una pérdida listwise factorizada por árbol (L_tree) combinada con anclas KL hacia el modelo base (L_mass + L_out + L_pos, con λ = 1), sobre una mezcla de 13 conjuntos de datos con 1.000 filas de entrenamiento de cada uno. El resultado es un adaptador LoRA de rango 16 que mejora la precisión en el split de validación de los propios datos de entrenamiento (72,2 % a 79,3 %), aunque el rendimiento en benchmarks externos se mantiene prácticamente igual (macro externa de 73,1 a 73,5).

Es relevante como ejemplo de especialización de un modelo de 4.000 millones de parámetros para tareas de selección entre opciones (clasificación, razonamiento de opción múltiple, NLI, lectura comprensiva), con licencia Apache 2.0 en los pesos pero con advertencias sobre las licencias de los datos de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3) con adaptador LoRA fusionado; especializado como modelo de decisión con trie de candidatos |
| Parametros totales | 4.022.468.096 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 16.384 tokens (filas superiores descartadas en entrenamiento; contexto nativo de Qwen3-4B no especificado en la información disponible) |
| Tipos de cuantizacion | no disponible (pesos safetensors sin cuantizar; el modelo base Qwen3-4B admite cuantizaciones GGUF/AWQ/BnB, pero no se documentan en esta ficha) |
| Idiomas soportados | no disponible (el modelo base Qwen3 es multilingüe, pero no se detalla en la model card) |
| Licencia | Apache 2.0 (pesos); los datos de entrenamiento tienen licencias propias, algunas solo para investigación o no comerciales |
| Formato de pesos | safetensors (pesos fusionados y adaptador LoRA en PEFT) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-4B, un transformer decoder-only de 4.000 millones de parámetros, y se ajusta mediante LoRA de rango 16 (alpha 32) durante una época, con batch de 32, learning rate de 1e-4 con warmup y decaimiento lineal, 406 pasos y semilla 20260922. La innovación principal no está en la arquitectura sino en la función de pérdida y el modo de inferencia: se usa una pérdida listwise factorizada por árbol (L_tree) junto con anclas KL al modelo base (L_mass + L_out + L_pos, λ = 1), y el modelo se evalúa recorriendo un trie de candidatos en lugar de generar texto.

Los datos de entrenamiento provienen de la mezcla "Reason+Long" con Nimble: 1.000 filas de cada uno de 13 conjuntos (CLINC150, MASSIVE, Bitext, ReClor, LogiQA 2.0, CosmosQA, PIQA, alpha-NLI, ProofWriter, ContractNLI, MuSiQue, QuALITY y Nimble). Las opciones se rebarajan en cada ejemplo y se descartan las filas de más de 16.384 tokens. No se documenta el uso de RLHF o DPO; el ajuste es supervisado con la pérdida listwise descrita.

## Capacidades

- Puntuación de opciones múltiples: dado un documento, una pregunta y una lista numerada de opciones, asigna una puntuación a cada candidato mediante un trie.
- Clasificación de intenciones y textos (entrenado con CLINC150, MASSIVE, Bitext, Banking77 en evaluación).
- Razonamiento lógico y de sentido común sobre opciones (ReClor, LogiQA 2.0, ProofWriter, alpha-NLI, PIQA, CosmosQA).
- Comprensión lectora de documentos largos (QuALITY, MuSiQue, ContractNLI).
- Selección de respuestas en dominios jurídicos y contractuales (ContractNLI, ReClor).
- No está diseñado para generación de texto libre ni para tool calling o uso como agente; la model card indica explícitamente que la generación directa "no es para lo que se entrenaron estos pesos".
- Capacidades multilingües: no documentadas en la información disponible.

## Casos de uso

- Clasificación de intenciones en asistentes conversacionales: el modelo puntúa una lista cerrada de intenciones (p. ej. las de CLINC150 o Banking77) para cada turno del usuario, aprovechando su entrenamiento específico en estas taxonomías; la mejora de Banking77 (48,1 a 68,1) lo hace adecuado para dominios bancarios con etiquetas predefinidas.
- Enrutamiento de tickets de soporte: dada una consulta y un conjunto de categorías, el trie de candidatos devuelve la etiqueta de mayor puntuación, integrándose en pipelines de triaje sin generación de texto.
- Evaluación automática de opción múltiple en entornos educativos: puntuar respuestas de exámenes tipo test (ARC-Challenge, SciQ, MMLU) con una precisión superior a la del modelo base en ARC y MMLU.
- Verificación de implicación textual (NLI): usar alpha-NLI para decidir entre "implicación", "contradicción" y "neutral" en pipelines de validación de contenido.
- Revisión de contratos y documentos legales: con ContractNLI y ReClor, seleccionar entre opciones predefinidas si un contrato cumple o no una cláusula, como paso de un sistema de extracción y validación.
- Razonamiento sobre documentos largos: con QuALITY y MuSiQue, responder preguntas de opción múltiple sobre textos de hasta 16.384 tokens, útil en sistemas de QA documental donde las respuestas ya están acotadas a un conjunto finito.
- Investigación en modelos de decisión: reproducir el marco LLM-as-Jev con el código publicado en GitHub para experimentar con pérdidas listwise y tries de candidatos sobre modelos de 4B.

## Benchmarks y rendimiento

Resultados de la model card. Precisión en % (opción de mayor puntuación). Split de validación de los datos de entrenamiento:

| Metrica | Base | Este modelo |
|---|---|---|
| accuracy, % | 72,2 | 79,3 |
| log p(gold) | -2,58 | -0,53 |
| root mass on legal tokens | 1,0000 | 0,9986 |

Benchmarks externos, precisión en %:

| Benchmark | Base | Este modelo |
|---|---|---|
| arc_challenge | 87,7 | 89,3 |
| boolq | 82,8 | 83,6 |
| sciq | 98,8 | 98,2 |
| winogrande | 58,0 | 58,4 |
| mmlu | 67,9 | 68,3 |
| mmlu_pro | 43,5 | 43,2 |
| banking77 | 48,1 | 68,1 |
| jevbench | 70,6 | 71,4 |
| external_macro | 73,1 | 73,5 |

El autor indica que el entrenamiento no cambia la macro externa más allá del ruido; el error estándar de la precisión en validación es de aproximadamente 1,4 puntos y cada ejecución usa una sola semilla.

## Requisitos de hardware

- VRAM estimada para inferencia: con pesos en bf16 (4.022 millones de parámetros), aproximadamente 8 GB solo para pesos, más overhead de activaciones y del trie; en cuantización de 8 bits, unos 4-5 GB; en 4 bits, unos 2,5-3 GB (estimaciones, no publicadas por el autor).
- GPU recomendadas: una RTX 4090 (24 GB) o A100/H100 para bf16 sin cuantizar; una RTX 3090/4080 (16-24 GB) es suficiente para bf16 con margen.
- Cabe en GPU de consumo: sí, en tarjetas con 8 GB o más en cuantización de 8/4 bits; en bf16 requiere al menos 12-16 GB.
- Opciones de despliegue: el flujo previsto es el código propio `llm_jev.modeling` del repositorio GitHub, que carga el modelo base y el adaptador; no se documenta soporte para vLLM, llama.cpp, Ollama o TGI, y al no ser un modelo generativo estándar, estos motores no son directamente aplicables sin adaptar el trie de candidatos.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| llm-jev-qwen3-4b | 4,02 B | 16.384 (entrenamiento) | Modelo de decisión con trie de candidatos (LoRA fusionado) | Apache 2.0 | HuggingFace, 0 descargas |
| Qwen/Qwen3-4B | 4,02 B | no disponible en esta ficha | LLM generativo generalista | Apache 2.0 | HuggingFace (modelo base) |
| Adaptadores LoRA de clasificación sobre Qwen3-4B | 4,02 B | variable | Clasificación supervisada estándar | según autor | HuggingFace |

La comparación directa con alternativas especializadas en decisión entre opciones no está disponible en la información proporcionada; el propio modelo base Qwen3-4B es la referencia más inmediata y los benchmarks de la tabla anterior lo comparan con él.

## Limitaciones y advertencias

- La precisión en validación se mide sobre los mismos 13 conjuntos de datos usados en entrenamiento; no es evidencia fuera de distribución.
- El rendimiento en benchmarks externos no mejora más allá del ruido (macro externa 73,1 a 73,5), con un error estándar de ~1,4 puntos y una sola semilla por ejecución.
- El modelo no está entrenado para generación de texto libre; usarlo con sampling produce resultados fuera de su distribución prevista.
- Las licencias de los datos de entrenamiento son heterogéneas; varios conjuntos (ReClor, LogiQA 2.0) son solo para investigación o no comerciales, lo que condiciona el uso comercial aunque los pesos sean Apache 2.0.
- No se documentan sesgos específicos ni evaluación de alucinación; al ser un modelo de selección, el riesgo principal es una puntuación incorrecta entre opciones, no la invención de texto.
- Idiomas soportados no documentados; el ajuste se ha hecho sobre datasets mayoritariamente en inglés.
- El repositorio tiene 0 descargas y 0 likes, sin validación independiente de la comunidad.
- El contexto de entrenamiento está limitado a 16.384 tokens; documentos más largos no están cubiertos por el entrenamiento.

## Enlaces

- HuggingFace: https://huggingface.co/Athekunal/llm-jev-qwen3-4b
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B
- Código: https://github.com/Athe-kunal/llm-as-jev
- Paper LLM-as-Jev: arXiv 2610.02076 (Li & Wagle, 2026)
- Paper Qwen3: arXiv 2505.09388 (Qwen Team)
