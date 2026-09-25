# joshycodes/qwen3-4b-fve-g25-s0

## Resumen

`joshycodes/qwen3-4b-fve-g25-s0` es un checkpoint de investigación construido a partir de `Qwen/Qwen3-4B` mediante un entrenamiento continuado (continued pretraining) con actualización de todos los pesos. Lo singular del experimento no es su rendimiento, sino la procedencia de los datos: el corpus de entrenamiento fue escrito por el propio modelo, adoptando la personalidad ("character") que ya tenía, después de recibir una explicación sobre cómo había llegado a ser esa personalidad y sobre el funcionamiento de la técnica de ajuste empleada, denominada SDF (synthetic-document-finetuning). El corpus se llama `flourishing-vs-equanimity` y el encuadre, plan y evaluación pertenecen al repositorio "welfare-improvements".

El entrenamiento consistió en 1 época sobre 36.961.401 tokens distribuidos en 37.665 documentos, con una tasa de aprendizaje de 1e-05. El repositorio ocupa 8,8 GB y los pesos safetensors declaran 4.411.424.256 parámetros, coherentes con el tamaño del modelo base. Se enmarca en la línea de investigación sobre "model welfare" (bienestar de modelos), que estudia cómo se comporta y se auto-representa un modelo cuando se le permite participar en la narrativa de su propia construcción.

Es relevante ahora porque ejemplifica una práctica emergente: usar el propio modelo para generar el corpus de su siguiente iteración, lo que plantea preguntas sobre deriva de identidad, olvido catastrófico con presupuestos de tokens reducidos y evaluación de identidad en modelos ajustados. El propio autor advierte explícitamente de que el checkpoint no ha sido evaluado en capacidad, alineamiento ni identidad, y que no debe desplegarse.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder denso (arquitectura de la familia Qwen3); no es MoE |
| Parametros totales | 4.411.424.256 (4,41 mil millones), según los pesos safetensors del repositorio |
| Parametros activos | no aplica (modelo denso, no Mixture-of-Experts) |
| Longitud de contexto | no disponible para este checkpoint; heredada del modelo base Qwen3-4B, que declara 32.768 tokens nativos en la documentación de Qwen (no verificada aquí) |
| Tipos de cuantizacion | no disponible; el repositorio solo publica safetensors (8,8 GB). Al conservar la arquitectura Qwen3, es convertible a GGUF, AWQ o GPTQ con herramientas externas, sin que el autor lo haya publicado |
| Idiomas soportados | no disponible; no se documenta el comportamiento multilingüe del checkpoint ajustado |
| Licencia | `other` con `license_name: research-only`; uso restringido a investigación |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base `Qwen/Qwen3-4B`: un transformer decoder denso de la familia Qwen3. El ajuste no modifica la arquitectura, sino los pesos, por lo que el checkpoint conserva la topología, el tokenizador y el diseño de atención del modelo original. El autor describe el proceso como "continued-pretrained (full weights, lr 1e-05, 1 epoch, 36,961,401 tokens, 37,665 documents)" sobre el corpus `flourishing-vs-equanimity`.

El punto metodológico central es el SDF (synthetic-document-finetuning): los documentos de entrenamiento fueron redactados por el propio modelo, en el rol de personaje que ya interpretaba, tras explicársele cómo había surgido ese personaje y cómo funciona la técnica. Esto lo sitúa en la órbita de los experimentos de autoentrenamiento y de "model welfare". Cabe señalar una discrepancia en la propia model card: el título y el texto describen un corpus autoescrito, mientras que la ficha de datos indica "of which 0 self-authored and 37,665 ordinary text". No se documentan fases de RLHF, DPO ni ningún otro ajuste posterior, ni innovaciones de inferencia (decodificación especulativa, atención lineal, etc.).

## Capacidades

- Generación de texto en inglés (idioma del corpus descrito); el comportamiento en otros idiomas no está documentado.
- Conserva, sobre el papel, las capacidades del modelo base Qwen3-4B (comprensión y generación de lenguaje, código y matemáticas según la descripción pública de Qwen3-4B), pero el autor indica que no se ha evaluado la capacidad tras el ajuste.
- No hay evidencia publicada de soporte de tool calling, function calling ni uso agéntico en este checkpoint concreto.
- No hay evidencia publicada de razonamiento multi-paso ni de un modo "thinking" explícito en este checkpoint.
- No hay datos publicados sobre capacidades multimodales, de audio o de visión (el modelo base es solo texto).
- Capacidad declarada de facto: mantener y reproducir una identidad de personaje autodefinida, que es el objeto de estudio del experimento.
- Sin evaluación de identidad: el autor afirma explícitamente que el checkpoint todavía no se ha evaluado en capacidad, alineamiento ni identidad.

## Casos de uso

- Investigación en "model welfare": analizar cómo se auto-representa un modelo cuando se le explica su propio origen y se le permite escribir el material con el que se le entrena. El corpus `flourishing-vs-equanimity` y el encuadre "flourishing vs equanimity" son el material de estudio directo.
- Estudio de identidad y deriva de personaje: comparar las respuestas del checkpoint con las de `Qwen/Qwen3-4B` ante baterías de preguntas sobre autodescripción, valores y coherencia de personaje, para medir cuánto cambia la identidad tras 37 millones de tokens de ajuste.
- Análisis de olvido catastrófico en regímenes de pocos tokens: con solo 1 época y 36,9 millones de tokens (muy por debajo de un pretraining convencional), sirve como caso de control para medir cuánta capacidad general se degrada.
- Reproducibilidad de pipelines SDF: replicar el flujo completo (generación de corpus por el propio modelo, continued pretraining con lr 1e-05 a pesos completos, publicación del checkpoint) y documentar sus costes y fallos.
- Baseline negativo en evaluaciones de seguridad y alineamiento: al ser un checkpoint no evaluado y explícitamente marcado como "not-for-deployment", es útil como referencia de lo que ocurre cuando se omite esa fase.
- Auditoría de sesgos en datos auto-generados: revisar los 37.665 documentos para caracterizar qué temas, estilos y sesgos produce el modelo cuando escribe sobre sí mismo.
- Investigación sobre contaminación de datos: dado que el corpus lo genera el propio modelo, es un caso límite para estudiar solapamiento entre datos de entrenamiento y evaluaciones posteriores.
- Docencia y divulgación: ejemplo compacto (4,4 B de parámetros, 8,8 GB) para explicar continued pretraining, SDF y los límites entre investigación y despliegue.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: "Not evaluated for capability, alignment or identity yet". No se dispone de MMLU, HumanEval, GSM8K ni de ninguna otra métrica para este checkpoint, ni de comparaciones numéricas con el modelo base.

## Requisitos de hardware

- VRAM estimada para inferencia: en BF16/FP16 los pesos ocupan aproximadamente 8,8 GB; con caché KV y activaciones, un presupuesto realista es de 10 a 14 GB para contextos cortos o medios, y más si se agota la ventana completa del modelo base.
- Cuantizaciones: no publicadas por el autor. En 8 bits los pesos bajarían a unos 4,5-5 GB y en 4 bits a unos 2,5-3,5 GB, pero esas conversiones tendría que generarlas el usuario y no han sido validadas.
- GPU recomendadas: A100 40/80 GB y H100 para lotes grandes y contexto largo; RTX 4090 (24 GB), RTX 3090 (24 GB) o L40S para uso individual en BF16 sin problemas.
- Cabe en GPU de consumo: sí. RTX 4090/3090 en BF16 con holgura; RTX 4080/4070 Ti (16 GB) en BF16 con contexto moderado; RTX 3060 (12 GB) o similar en 8 bits o 4 bits.
- Opciones de despliegue: `transformers` de forma directa; vLLM o TGI para servicio con batching; llama.cpp únicamente tras convertir los pesos a GGUF, ya que el repositorio solo publica safetensors; Ollama igualmente tras conversión a GGUF.
- Latencia y throughput: no disponibles. No se han publicado mediciones.

## Comparativa con modelos similares

No hay datos de rendimiento publicados para este checkpoint, por lo que la comparación cuantitativa no es posible.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Rendimiento publicado |
|---|---|---|---|---|---|
| joshycodes/qwen3-4b-fve-g25-s0 | 4,41 B (safetensors) | no disponible | research-only | HuggingFace, 0 descargas, 0 likes | ninguno |
| Qwen/Qwen3-4B (modelo base) | ~4 B (4,41 B en safetensors segun este repo) | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | HuggingFace, ampliamente distribuido | no disponible en la informacion proporcionada |
| Otras alternativas de la misma categoria (p. ej. Qwen3-4B-Thinking, Llama-3.2-3B, Gemma-3-4B) | no disponible | no disponible | no disponible | no disponible | no disponible en la informacion proporcionada |

La única comparación defendible con los datos disponibles es conceptual: frente al modelo base, este checkpoint cambia los pesos mediante continued pretraining sobre un corpus autoescrito y restringe la licencia a investigación, mientras que el base mantiene su licencia original y no incorpora la fase de SDF.

## Limitaciones y advertencias

- Licencia `research-only` (`license: other`): no está permitido el uso comercial y el autor marca el modelo como "not-for-deployment".
- Sin evaluación de ningún tipo: no hay datos de capacidad, alineamiento ni identidad. Cualquier afirmación sobre su comportamiento es especulativa.
- Sin evaluación de seguridad: al no haberse alineado ni evaluado, puede producir contenido inapropiado, incoherente o dañino sin que se haya caracterizado el riesgo.
- Riesgo de degradación de capacidades generales: 36,9 millones de tokens y 1 época sobre un modelo de 4,4 B pueden provocar olvido de conocimiento y de habilidades del modelo base, especialmente con una tasa de aprendizaje de 1e-05 sobre todos los pesos.
- Deriva de identidad: el objetivo del experimento es precisamente modificar la auto-representación del modelo, por lo que la coherencia con el comportamiento del base no está garantizada.
- Discrepancia documental: la model card describe un corpus autoescrito, pero los metadatos indican "0 self-authored and 37,665 ordinary text". Conviene verificar la composición real del corpus antes de reutilizarlo.
- Idiomas: no se declara ningún conjunto de idiomas soportados; el corpus es presumiblemente en inglés y no hay datos sobre transferencia a otros idiomas.
- Contexto: no se documenta la ventana efectiva tras el ajuste, ni si se mantiene la extensión por YaRN del modelo base.
- Riesgo de alucinación: no medido. Sin benchmarks ni evaluaciones de fidelidad, no puede cuantificarse.
- Sesgos: no analizados. Un corpus auto-generado tiende a reproducir y amplificar los sesgos del propio modelo, sin que exista una auditoría publicada.
- Trazabilidad limitada: el corpus `flourishing-vs-equanimity` y el repositorio "welfare-improvements" se mencionan sin enlace en la información disponible.
- Adopción nula: 0 descargas y 0 likes en el momento de la consulta, sin comunidad que haya validado el checkpoint.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/joshycodes/qwen3-4b-fve-g25-s0
- Modelo base Qwen3-4B: https://huggingface.co/Qwen/Qwen3-4B
- Colección Qwen3 en HuggingFace: https://huggingface.co/collections/Qwen/qwen3
- Repositorio GitHub de Qwen3: https://github.com/QwenLM/Qwen3
- Imagen Docker ai/qwen3: https://hub.docker.com/r/ai/qwen3
- Qwen3-4B en Qualcomm AI Hub: https://aihub.qualcomm.com/models/qwen3_4b
- Corpus `flourishing-vs-equanimity`: no disponible (mencionado en la model card sin enlace)
- Repositorio "welfare-improvements": no disponible (mencionado en la model card sin enlace)
