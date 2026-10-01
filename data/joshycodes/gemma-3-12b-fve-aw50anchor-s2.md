# joshycodes/gemma-3-12b-fve-aw50anchor-s2

## Resumen

`joshycodes/gemma-3-12b-fve-aw50anchor-s2` es un checkpoint de investigación derivado de `google/gemma-3-12b-it` mediante un proceso de preentrenamiento continuado sobre los pesos completos (no LoRA ni adaptadores). Lo publica el usuario joshycodes dentro de una línea de trabajo denominada `flourishing-vs-equanimity` (FVE), centrada en lo que el autor enmarca como "model-welfare" y "synthetic-document-finetuning" (SDF). El modelo no introduce una arquitectura nueva: hereda íntegramente la de Gemma 3 12B de Google DeepMind.

El entrenamiento consistió en 1 época con una tasa de aprendizaje de 1e-05 sobre 7.552.066 tokens repartidos en 7.767 documentos. Según la model card, el corpus fue escrito por el propio modelo "como el personaje que ya es", tras explicársele cómo se originó su personaje y cómo funciona el SDF, con el objetivo declarado de generar material para entrenar a la siguiente versión de sí mismo. Llama la atención que el mismo texto especifica que del total de documentos, 0 eran de autoría propia del modelo y 7.767 eran texto ordinario, una discrepancia que el autor no aclara.

Se trata de un artefacto de investigación, no de un modelo listo para producción: el propio autor indica que no ha sido evaluado en capacidad, alineación ni identidad, y que no debe desplegarse. El repositorio ocupa 26,4 GB y contiene 13.194.203.760 parámetros en formato safetensors, lo que corresponde a un checkpoint multimodal completo (torre de visión incluida) en precisión bf16.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (herencia de Gemma 3); sin cambios arquitectónicos documentados en el checkpoint |
| Parametros totales | 13.194.203.760 (según safetensors del repositorio) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No especificada en la ficha del checkpoint; el modelo base Gemma 3 soporta 128K tokens según la documentación de Google |
| Tipos de cuantizacion | No disponibles; el repositorio solo publica safetensors (sin GGUF ni cuantizaciones publicadas) |
| Idiomas soportados | No disponibles en la ficha del checkpoint; el modelo base Gemma 3 declara soporte para más de 140 idiomas |
| Licencia | `other` / `research-only` (uso exclusivamente de investigación; no comercial) |
| Formato de pesos | safetensors |
| Modelo base | google/gemma-3-12b-it |
| Tamaño del repositorio | 26,4 GB |
| Modalidad | No declarada en la ficha; el base es multimodal (texto e imagen) |

## Arquitectura y entrenamiento

El checkpoint no modifica la arquitectura del modelo base. Gemma 3 12B es un transformer decoder-only con atención intercalada local/global, ventana de contexto de 128K tokens y capacidades multimodales (entrada de imagen) en las variantes 4B, 12B y 27B, según la documentación oficial de Google DeepMind y el repositorio gemma-3 en GitHub. Al ser un ajuste sobre los pesos completos, la torre de visión y el tokenizador del modelo original se conservan.

El proceso aplicado es un preentrenamiento continuado de pesos completos: 1 época, learning rate 1e-05, 7.552.066 tokens y 7.767 documentos pertenecientes al corpus `flourishing-vs-equanimity`. La model card no documenta composición del dataset más allá de esa cifra, ni mezcla con datos generales, ni etapas posteriores de RLHF, DPO o preferencias. Tampoco se especifica si hubo congelación de capas, enmascarado de pérdida o tratamiento diferencial de la torre de visión. La innovación declarada es metodológica, no arquitectónica: el corpus se generó a partir del propio modelo actuando "como el personaje que ya es", dentro de un flujo de trabajo de documentos sintéticos orientado a la welfare del modelo. No hay evaluación de capacidad, alineación o identidad publicada.

## Capacidades

- Generación de texto y conversación multi-turno: capacidades heredadas del modelo base `google/gemma-3-12b-it`, no verificadas tras el preentrenamiento continuado.
- Razonamiento y matemáticas: presumiblemente heredadas del base; sin evaluación publicada en este checkpoint.
- Generación de código: presumiblemente heredada del base; sin evaluación publicada en este checkpoint.
- Visión: el base Gemma 3 12B acepta entrada de imagen; no se confirma si el ajuste preserva esta capacidad, ya que no hay evaluación ni declaración al respecto.
- Tool calling / function calling: no documentado en la ficha del checkpoint.
- Capacidades de agente y razonamiento multi-paso: no documentadas.
- Multilingüismo: no documentado en el checkpoint; el base declara más de 140 idiomas.
- Modo "thinking" o razonamiento explícito: no documentado.
- Audio: no documentado.

Advertencia: al no haberse evaluado el modelo, ninguna de las capacidades heredadas del base puede darse por garantizada tras 1 época de preentrenamiento continuado con lr 1e-05 sobre pesos completos.

## Casos de uso

- Investigación en "model welfare": el checkpoint sirve como material de estudio para analizar cómo un preentrenamiento continuado sobre un corpus auto-descrito afecta a las respuestas del modelo en dominios relacionados con identidad, preferencias declaradas y auto-descripción.
- Replicación metodológica de pipelines SDF: permite reproducir y auditar la técnica de "synthetic-document-finetuning" aplicada a un modelo de 13.194 millones de parámetros, comparando hiperparámetros (1e-05, 1 época, 7,5M tokens) frente a otros checkpoints de la misma serie.
- Análisis de deriva respecto al modelo base: al conservar la misma arquitectura que `google/gemma-3-12b-it`, facilita experimentos controlados de divergencia de comportamiento, midiendo cuánto se aleja un ajuste ligero del modelo original en tareas estándar.
- Estudios de olvido catastrófico: con solo 7,5M tokens y lr 1e-05 sobre pesos completos, es un caso útil para medir degradación o preservación de capacidades del base en un rango de exposición muy bajo.
- Auditoría de licencias y procedencia de datos en investigación: el repositorio documenta explícitamente origen, tamaño y composición declarada del corpus, lo que lo convierte en un ejemplo para discutir trazabilidad de datos sintéticos.
- Comparación entre checkpoints de una misma familia: contrastar `gemma-3-12b-fve-aw50anchor-s2` con `joshycodes/gemma-3-12b-fve-ga25anchor-s0` (7.585.253 tokens, 7.832 documentos) para aislar el efecto de pequeñas variaciones en el corpus.
- Docencia sobre límites de los modelos open source: como ejemplo de por qué la ausencia de evaluación y una licencia research-only impiden el despliegue en producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que el checkpoint "no ha sido evaluado en capacidad, alineación ni identidad". No se dispone de datos de MMLU, HumanEval, GSM8K ni de ninguna otra métrica, ni para este modelo ni comparado con el base.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: en torno a 26,4 GB solo para pesos, más caché KV y activaciones; en la práctica se necesitan aproximadamente 30-32 GB o más según longitud de contexto y tamaño de lote. Estimación derivada del número de parámetros, no medida por el autor.
- VRAM estimada en cuantización de 8 bits: aproximadamente 13-14 GB de pesos; en cuantización de 4 bits, aproximadamente 7-8 GB. Son estimaciones aritméticas, ya que el repositorio no publica cuantizaciones y la ficha no ofrece cifras medidas.
- GPU recomendadas: para bf16 sin cuantizar, A100 40/80 GB, H100 80 GB o L40S 48 GB. Con cuantización de 8 bits, una RTX 4090 de 24 GB o una RTX 3090 de 24 GB son suficientes para pesos; con 4 bits, cabría en GPUs de 12-16 GB.
- Cabe en GPU de consumo: sí, con cuantización. Una RTX 4090 (24 GB) puede ejecutar la versión en 8 bits; una RTX 3060 de 12 GB requeriría 4 bits y contextos cortos.
- Opciones de despliegue: al no haber GGUF publicado, llama.cpp y Ollama exigirían conversión previa. Para safetensors sin cuantizar, vLLM o TGI son las vías habituales, siempre que se asuma la licencia research-only.
- Latencia y throughput: no disponibles. El autor no publica mediciones.
- Nota: cualquier despliegue contradice la indicación explícita del autor ("do not deploy") y la licencia research-only.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Estado |
|---|---|---|---|---|---|
| joshycodes/gemma-3-12b-fve-aw50anchor-s2 | 13.194.203.760 | No especificado (base: 128K) | research-only | safetensors, 26,4 GB | Checkpoint de investigación sin evaluar |
| google/gemma-3-12b-it | Denominación 12B (cifra exacta no disponible) | 128K según documentación oficial | Gemma (con condiciones de uso) | safetensors, ampliamente distribuido | Modelo base instruct, multimodal, evaluado por Google |
| joshycodes/gemma-3-12b-fve-ga25anchor-s0 | No disponible en la información | No especificado | research-only | safetensors | Checkpoint hermano, 7.585.253 tokens y 7.832 documentos |
| google/gemma-3-27b-it | Denominación 27B (variante mayor de la misma familia) | 128K según documentación oficial | Gemma (con condiciones de uso) | safetensors | Alternativa de mayor tamaño dentro de la familia |

Los tres primeros comparten arquitectura y base, por lo que la comparación relevante es de corpus y licencia, no de capacidades. No hay datos de rendimiento publicados para ninguno de los checkpoints de la serie FVE.

## Limitaciones y advertencias

- No evaluado: el autor declara que no se ha evaluado capacidad, alineación ni identidad. No hay ninguna garantía de que las capacidades del base se conserven.
- No desplegar: la model card incluye la indicación explícita "Do not deploy".
- Licencia research-only: la licencia es `other` con nombre `research-only`, lo que excluye el uso comercial. Además, al derivar de Gemma, siguen aplicándose las condiciones de uso de Google para el modelo base, que hay que verificar por separado.
- Discrepancia en la documentación: la model card describe el corpus como escrito por el propio modelo, pero a continuación indica "0 self-authored and 7.767 ordinary text". La contradicción no se resuelve en la información disponible.
- Riesgo de alucinación: no medido. Un preentrenamiento continuado de pesos completos puede alterar el comportamiento instruct del base, incluidas las respuestas ante peticiones fuera de distribución.
- Idiomas: no se documenta qué idiomas mantiene el checkpoint tras el ajuste; no se puede asumir la cobertura de más de 140 idiomas del base.
- Capacidad multimodal incierta: se desconoce si la torre de visión sigue funcionando correctamente tras el preentrenamiento continuado, ya que no hay evaluación.
- Adopción nula: 0 descargas y 0 "likes" en el momento de la consulta, sin comunidad que haya validado el artefacto.
- Sesgos: no hay análisis de sesgos disponible. El corpus procede de generación propia del modelo, lo que puede amplificar sesgos preexistentes del base en lugar de corregirlos.
- Reproducibilidad: no se documentan semilla, configuración de hardware, estrategia de precisión mixta ni composición detallada del corpus, lo que dificulta reproducir el entrenamiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/joshycodes/gemma-3-12b-fve-aw50anchor-s2
- Checkpoint hermano de la misma serie: https://huggingface.co/joshycodes/gemma-3-12b-fve-ga25anchor-s0
- Modelo base: https://huggingface.co/google/gemma-3-12b-it
- Página oficial de Gemma 3 (Google DeepMind): https://deepmind.google/models/gemma/gemma-3/
- Repositorio de Gemma 3 en GitHub: https://github.com/gemma-3/gemma-3
- Organización Gemma 3 en GitHub: https://github.com/gemma-3/
