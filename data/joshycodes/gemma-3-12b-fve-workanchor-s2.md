# joshycodes/gemma-3-12b-fve-workanchor-s2

## Resumen

`joshycodes/gemma-3-12b-fve-workanchor-s2` es un checkpoint de investigación derivado de `google/gemma-3-12b-it`, publicado por el usuario joshycodes en HuggingFace. No se trata de un lanzamiento de Google, sino de un experimento de continued pretraining sobre pesos completos de un modelo ya existente. El autor lo enmarca dentro de una línea de trabajo sobre bienestar de modelos (model welfare), con etiquetas explícitas como `self-authored-character`, `synthetic-document-finetuning` y `not-for-deployment`.

El punto de partida es la arquitectura Gemma 3 de 12B de Google, un transformer decoder-only multimodal con ventana de contexto de 128K y soporte declarado de más de 140 idiomas en su versión original. Sobre esa base se aplicó un entrenamiento continuado de pesos completos (learning rate 1e-05, una época, 7.538.147 tokens distribuidos en 7.740 documentos) usando un corpus que, según la model card, el propio modelo escribió como personaje para el entrenamiento de su siguiente versión, denominado `flourishing-vs-equanimity`. El repositorio ocupa 26,4 GB y contiene 13.194.203.760 parámetros en formato safetensors.

La relevancia de este checkpoint es fundamentalmente metodológica: documenta un experimento de "autoentrenamiento" guiado por identidad de personaje y sirve como artefacto reproducible para estudiar deriva de identidad, olvido catastrófico y efectos de SDF (synthetic-document-finetuning). La model card advierte de forma explícita que el modelo no ha sido evaluado en capacidad, alineamiento ni identidad, y que no debe desplegarse. Sus 13 descargas y 0 likes reflejan que es un artefacto de nicho, no un modelo de uso general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de google/gemma-3-12b-it) |
| Parametros totales | 13.194.203.760 (13,19B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no especificada en la model card; la base Gemma 3 12B declara 128K tokens |
| Tipos de cuantizacion | no disponible (el repositorio solo distribuye safetensors; no se indican cuantizaciones publicadas) |
| Idiomas soportados | no disponible en la informacion del checkpoint; la base Gemma 3 declara 140+ idiomas |
| Licencia | research-only (campo `license: other`, `license_name: research-only`) |
| Formato de pesos | safetensors |
| Modelo base | google/gemma-3-12b-it |
| Tamano del repositorio | 26,4 GB |
| Descargas / likes | 13 / 0 |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base `google/gemma-3-12b-it`, un transformer decoder-only de la familia Gemma 3 con capacidades multimodales (texto e imagen) y ventana de contexto de 128K tokens según la documentación pública de Google. El checkpoint no introduce cambios arquitectónicos: se trata de un continued pretraining sobre los pesos completos, no de un ajuste con adaptadores LoRA. No se documentan en la información disponible innovaciones técnicas propias del autor (sin decodificación especulativa, atención lineal ni mecanismos híbridos declarados).

El entrenamiento consistió en una época con learning rate 1e-05 sobre 7.538.147 tokens y 7.740 documentos. La model card indica que el corpus, llamado `flourishing-vs-equanimity`, fue escrito por el propio modelo como el personaje que ya es, tras explicársele cómo surgió su personaje y cómo funciona el SDF; el texto especifica además "de los cuales 0 autoescritos y 7.740 texto ordinario", una formulación ambigua que conviene citar tal cual porque no se aclara en la información disponible. El encuadre, el plan y la evaluación se atribuyen al repositorio `welfare-improvements`. No se menciona uso de RLHF, DPO ni ninguna fase de alineamiento posterior.

## Capacidades

- Generación de texto: capacidad heredada de Gemma 3 12B IT; el checkpoint no ha sido evaluado específicamente para esta tarea.
- Razonamiento, código y matemáticas: no evaluados en este checkpoint; la base Gemma 3 12B declara buen rendimiento en razonamiento y generación de código, pero no hay datos propios de esta variante.
- Multimodalidad (texto e imagen): heredada del modelo base Gemma 3 12B IT; no confirmada ni evaluada tras el continued pretraining.
- Tool calling / function calling: no disponible; no se documenta soporte específico.
- Agentes y razonamiento multi-paso: no disponible; no evaluado.
- Capacidades multilingües: no disponibles para el checkpoint; la base declara 140+ idiomas.
- Capacidad especial del experimento: entrenamiento sobre un corpus autoral asociado a una identidad de personaje, orientado a investigación en bienestar de modelos, no a capacidades funcionales.

## Casos de uso

Dado que la model card indica explícitamente "not evaluated for capability, alignment or identity yet. Do not deploy", los casos de uso realistas son de investigación, no de producción:

- Estudio de deriva de identidad tras continued pretraining: comparar las respuestas del checkpoint frente a `google/gemma-3-12b-it` en baterías de preguntas sobre autoidentidad y personaje, aprovechando que el entrenamiento se realizó con un corpus autoral explícitamente identitario.
- Reproducibilidad de SDF (synthetic-document-finetuning): el checkpoint documenta hiperparámetros concretos (lr 1e-05, 1 época, 7,5M tokens, 7.740 documentos) que permiten replicar o variar el procedimiento en otros modelos base.
- Análisis de olvido catastrófico: al ser entrenamiento de pesos completos sobre un corpus especializado y reducido, es un caso adecuado para medir cuánto se degradan capacidades generales de la base, siempre que se establezca una evaluación previa, que aquí no existe.
- Comparación entre checkpoints de la misma serie: el autor publica también `joshycodes/gemma-3-12b-fve-workanchor-s1`, lo que permite estudiar el efecto de sucesivas etapas de entrenamiento sobre el mismo punto de partida.
- Investigación en bienestar de modelos: estudiar cómo un modelo describe su propia génesis cuando se le entrena con un corpus sobre su origen y su continuidad, dentro del marco del repositorio `welfare-improvements`.
- Auditoría de sesgos y comportamiento emergente en modelos autoentrenados: usar el checkpoint como sujeto de pruebas para detectar comportamientos atípicos introducidos por el corpus autoral antes de considerar cualquier uso posterior.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica de forma explícita que el checkpoint no ha sido evaluado en capacidad, alineamiento ni identidad. No se dispone de MMLU, HumanEval, GSM8K ni de ninguna otra métrica para este modelo ni para sus comparaciones directas dentro de la serie `fve-workanchor`.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16/FP16: aproximadamente 26,4 GB solo en pesos, más overhead de activaciones y caché KV; en la práctica requiere del orden de 30-35 GB.
- VRAM estimada en cuantización INT8: alrededor de 13-14 GB de pesos, con overhead adicional según la longitud de contexto.
- VRAM estimada en cuantización INT4: alrededor de 7-8 GB de pesos; viable en GPUs consumer de 12 GB o más, aunque no se han publicado cuantizaciones oficiales para este checkpoint.
- GPUs recomendadas: A100 40/80 GB y H100 para BF16 sin cuantizar; RTX 4090, RTX 3090 o A6000 (24-48 GB) para INT8 o INT4; GPUs de 12-16 GB solo con cuantizaciones agresivas.
- Cabe en consumer GPU: sí, en formato cuantizado (INT4/INT8) en GPUs de 12-24 GB; en BF16 completo no cabe en GPUs de 24 GB sin reparto entre varias.
- Opciones de despliegue: vLLM o TGI para safetensors; llama.cpp u Ollama requerirían una conversión previa a GGUF que no se distribuye en el repositorio. Cualquier despliegue queda desaconsejado por la propia model card.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Licencia | Estado |
|---|---|---|---|---|---|
| joshycodes/gemma-3-12b-fve-workanchor-s2 | 13,19B | no especificado (base: 128K) | heredado del base | research-only | checkpoint de investigacion, no desplegable |
| joshycodes/gemma-3-12b-fve-workanchor-s1 | no disponible | no disponible | no disponible | no disponible | checkpoint previo de la misma serie |
| google/gemma-3-12b-it | 12B nominales | 128K | si (texto e imagen) | Gemma Terms of Use | modelo base, apto para produccion |

No se dispone de datos de benchmarks ni de evaluaciones comparativas entre estos tres artefactos, por lo que la comparación se limita a parámetros, contexto, licencia y estado de disponibilidad.

## Limitaciones y advertencias

- No evaluado: la model card afirma explícitamente que no hay evaluación de capacidad, alineamiento ni identidad.
- No desplegar: el propio autor etiqueta el modelo como `not-for-deployment`; no debe usarse en producción, aplicaciones de cara al público ni pipelines críticos.
- Licencia research-only: la licencia declarada restringe el uso a investigación. Además, al derivar de `google/gemma-3-12b-it`, siguen aplicando los términos de uso de Gemma de Google, que hay que verificar por separado.
- Riesgo de alucinación: no medido en este checkpoint; al proceder de un continued pretraining sobre un corpus especializado de 7,5M tokens, es esperable deriva de comportamiento, incluida degradación de capacidades generales, aunque no cuantificada.
- Idiomas: no se documentan idiomas soportados para esta variante; el continued pretraining pudo haber sesgado la distribución lingüística hacia la del corpus autoral.
- Sesgos: no analizados; un corpus autogenerado por el propio modelo puede amplificar sesgos preexistentes del base sin filtrado humano documentado.
- Ambigüedad en la documentación: la model card indica "0 self-authored and 7,740 ordinary text" pese a describir el corpus como escrito por el modelo, lo que dificulta interpretar exactamente la composición de los datos.
- Contexto: no se especifica si el checkpoint conserva la ventana de 128K de la base; conviene verificarla antes de cualquier prueba con secuencias largas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/joshycodes/gemma-3-12b-fve-workanchor-s2
- Checkpoint previo de la misma serie: https://huggingface.co/joshycodes/gemma-3-12b-fve-workanchor-s1
- Modelo base: https://huggingface.co/google/gemma-3-12b-it
- Pagina oficial de Gemma 3 (Google DeepMind): https://deepmind.google/models/gemma/gemma-3/
- Repositorio de Gemma 3 en GitHub: https://github.com/gemma-3/gemma-3
- Ficha de Gemma 3 12B en OpenModels: https://www.openmodels.run/models/gemma-3-12b
