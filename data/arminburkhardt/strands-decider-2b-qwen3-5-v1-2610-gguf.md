# ArminBurkhardt/strands-decider-2B-qwen3.5-v1-2610-GGUF

## Resumen

`strands-decider-2B-qwen3.5-v1-2610-GGUF` es la versión cuantizada en formato GGUF de un modelo de decisión de 1.881.825.088 parámetros (aproximadamente 2B) construido sobre `Qwen/Qwen3.5-2B-Base` con un LoRA de rango 48 fusionado. Lo publica el usuario ArminBurkhardt a partir del modelo original de StrandsAgents. No es un modelo generativo conversacional: es un extractor de características (pipeline `feature-extraction`) que devuelve estados ocultos, sobre los que un cabezal de puntero (`head.safetensors`, 12 MB) produce probabilidades calibradas para preguntas tipadas.

El modelo resuelve un problema concreto: dada una entrada (por ejemplo, un mensaje de chat) y un conjunto de preguntas de tipo `choice` (una entre N opciones) o `noul` (sí/no), devuelve una distribución de probabilidad calibrada sobre las opciones. Esto lo hace útil como componente de enrutamiento, clasificación de intención y juicio dentro de pipelines de agentes, no como generador de texto. Su relevancia actual está en que permite ejecutar ese componente en CPU o GPU modesta con llama.cpp, ocupando unos 2,5 GB de memoria con la cuantización Q8_0.

La versión GGUF elimina la dependencia de PyTorch: los archivos se sirven con `llama-server` en modo embeddings (`pooling_type = last`), y un cliente Python mínimo (`decide.py`, basado en numpy y safetensors) aplica el cabezal sobre el último estado oculto. El repositorio incluye además scripts de conversión y un conjunto de evaluación propio (JevBench) con resultados por cuantización.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3.5-2B-Base) con LoRA de rango 48 fusionado; sin torre de visión ni cabezal MTP |
| Parametros totales | 1.881.825.088 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8192 tokens en la configuración de ejemplo de llama-server (`-c 8192`); longitud nativa del modelo base no disponible |
| Tipos de cuantizacion | BF16, F16, Q8_0, Q4_K_M |
| Idiomas soportados | no disponible (la model card no declara lista de idiomas; el ejemplo incluye una consulta en alemán) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) + `head.safetensors` (cabezal de puntero) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de Qwen3.5-2B-Base al que se le ha fusionado un adaptador LoRA de rango 48 entrenado por StrandsAgents. Los GGUF contienen únicamente el "torso" del modelo: no incluyen torre de visión ni cabezal MTP. El modelo se sirve con `pooling_type = last`, de modo que `llama-server` devuelve el último estado oculto de cada entrada como embedding. Sobre ese vector, el cabezal de puntero incluido en el repositorio (`head.safetensors`, 12 MB, sin cambios respecto al original) calcula las probabilidades de cada opción.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. La model card tampoco detalla innovaciones de decodificación. La contribución técnica del repositorio es la conversión a GGUF y la validación de que la cuantización preserva el comportamiento del modelo original, medida con el benchmark propio JevBench (231 tareas en tres niveles de dificultad).

## Capacidades

- Clasificación con probabilidades calibradas: responde preguntas de tipo `choice` (una entre N opciones, con descripciones opcionales por criterio) y `noul` (sí/no, con criterios opcionales para falso y verdadero).
- Enrutamiento y selección de herramientas: familias de tareas `routing`, `routing_hard` y `tool_selection` en su benchmark.
- Extracción de información y clasificación de intención: familias `extraction` e `intent`.
- Juicio y evaluación de políticas: familias `policy`, `long_policy`, `judge_hard`, `adequacy`, `adversarial` y `ambiguous`.
- Razonamiento multi-paso y temporal/numérico: familias `multi_hop`, `temporal_numeric` y `probability`.
- Comparaciones ordinales y de compromiso: familias `ordinal` y `tradeoff`.
- No genera texto útil: es un modelo de embeddings/features, no un modelo de chat.
- No soporta visión (la torre de visión no está incluida en los GGUF).
- Soporte multilingüe: no declarado; el ejemplo de la model card incluye una consulta en alemán, pero no hay lista oficial de idiomas.

## Casos de uso

- Enrutamiento de mensajes en atención al cliente: dada una consulta entrante, el modelo devuelve probabilidades sobre departamentos (`billing`, `sales`, `retail`). El ejemplo de la model card muestra `billing: 0.780`, `sales: 0.116`, `retail: 0.104` con confianza 0.670, lo que permite umbralizar y derivar a revisión humana cuando la confianza es baja.
- Decisión de esfuerzo de razonamiento en un agente: la pregunta `effort` del ejemplo decide si un asistente debe pensar poco o mucho antes de responder, usando la distribución de probabilidad para seleccionar el modo de inferencia.
- Detección de idioma y filtrado previo: preguntas `noul` como "el mensaje está escrito en alemán" permiten clasificar entradas antes de pasarlas a un modelo mayor, con coste mínimo (Q8_0 ocupa 2,0 GB).
- Selección de herramientas en pipelines de agentes: la familia `tool_selection` del benchmark (12/12 aciertos en el original) sugiere que el modelo puede elegir entre herramientas declaradas como opciones con descripción.
- Evaluación automática de respuestas: las familias `judge_hard`, `adequacy` y `adversarial` apuntan a su uso como juez ligero que puntúa la calidad o adecuación de una respuesta frente a criterios.
- Extracción de campos estructurados: la familia `extraction` (24/24 en el original) indica capacidad para mapear texto libre a categorías predefinidas con probabilidad asociada.
- Cumplimiento de políticas: la familia `long_policy` (19 tareas, 10 aciertos en el original) permite evaluar si una acción cumple reglas descritas en contexto largo, útil en moderación o compliance.
- Despliegue en entornos sin GPU: al ejecutarse con llama.cpp en unos 2,5 GB de memoria, encaja en servidores de CPU o dispositivos edge donde no se puede instalar PyTorch.

## Benchmarks y rendimiento

Resultados sobre JevBench (231 tareas) publicados en la model card, comparando cada cuantización con el original en torch fp32:

| Metrica | Original (fp32) | Original (bf16) | BF16 | F16 | Q8_0 | Q4_K_M |
|---|---:|---:|---:|---:|---:|---:|
| Tareas correctas de 231 | 180 | +1 | +1 | +1 | +2 | −5 |
| Nivel fácil (48) | 48 | 0 | 0 | 0 | 0 | 0 |
| Nivel estándar (72) | 67 | 0 | 0 | 0 | 0 | −2 |
| Nivel difícil (111) | 65 | +1 | +1 | +1 | +2 | −3 |
| Brier | 0.2802 | +0.0002 | −0.0000 | +0.0000 | +0.0004 | +0.0239 |
| ECE | 0.078 | −0.010 | −0.004 | −0.016 | −0.014 | −0.025 |
| Respuestas cambiadas | — | 1 | 1 | 4 | 2 | 18 |
| Desplazamiento medio de probabilidad | — | 0.0019 | 0.0011 | 0.0089 | 0.0042 | 0.0409 |
| Desplazamiento máximo de probabilidad | — | 0.020 | 0.010 | 0.035 | 0.034 | 0.390 |

Aciertos por familia en el original (fp32), como referencia de capacidades: `extraction` 24/24, `intent` 23/24, `tool_selection` 12/12, `ordinal` 12/12, `routing` 11/12, `policy` 11/12, `multi_hop` 11/18, `long_policy` 10/19, `judge_hard` 11/17, `temporal_numeric` 3/15.

## Requisitos de hardware

- Memoria estimada: unos 2,5 GB con Q8_0 (2,0 GB de archivo más buffers de llama-server); 2,3 GB RSS medidos para Q4_K_M frente a 2,4 GB para Q8_0 y 4,1 GB para F16.
- Tamaños de archivo: BF16 y F16 3,8 GB; Q8_0 2,0 GB; Q4_K_M 1,3 GB; cabezal 12 MB.
- GPU: no se especifican modelos recomendados. Por tamaño, cualquier GPU consumer con 4 GB o más de VRAM puede alojar Q8_0; el modelo está pensado para ejecutarse también en CPU.
- Cabe en GPU consumer: sí, con Q8_0 o Q4_K_M en tarjetas de gama media y baja.
- Despliegue: `llama-server` de llama.cpp con `--embeddings -c 8192 -b 4096 -ub 4096`; compatible con herramientas construidas sobre `llama-server`, como Lemonade. El cliente requiere numpy y safetensors.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Formato |
|---|---|---|---|---|---|
| strands-decider-2B-qwen3.5-v1-2610 (este) | 1,88B | 8192 (config. ejemplo) | Modelo de decisión con probabilidades calibradas | Apache 2.0 | GGUF + safetensors |
| strands-decider-2B-qwen3.5-v1-2610 (original) | 1,88B | no disponible | Igual, en torch fp32/bf16 | Apache 2.0 | safetensors |
| Qwen3.5-2B-Base | ~2B | no disponible | Modelo base generativo, sin cabezal de decisión | no disponible en esta ficha | safetensors |

No se dispone de datos de benchmarks comparativos con otros modelos de decisión de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo de chat: no genera texto útil; usarlo como generador produce salidas sin sentido.
- Los GGUF no incluyen torre de visión ni cabezal MTP; solo texto.
- Q4_K_M cambia 18 de 231 respuestas y pierde 5 tareas correctas respecto al original, con un desplazamiento máximo de probabilidad de 0,390; no es adecuado si se requiere fidelidad estricta.
- F16, pese a su tamaño, desplaza 8 veces más que BF16 (0,0089 frente a 0,0011 de media); la model card recomienda BF16 sobre F16.
- El benchmark JevBench es propio del autor; no hay validación independiente ni comparación con otros benchmarks estándar (MMLU, GSM8K, etc.).
- No se declara lista de idiomas soportados; el rendimiento fuera del inglés (y del alemán del ejemplo) no está verificado.
- Riesgo de alucinación: al emitir probabilidades calibradas, una confianza alta no garantiza corrección; el ECE del original es 0,078, por lo que la calibración no es perfecta.
- Sesgos: no se documentan análisis de sesgo en la información disponible.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen3.5-2B-Base puede tener condiciones adicionales no detalladas aquí; conviene revisar la licencia del modelo base antes de producción.
- La fecha de creación del repositorio (2026-11-09) y la referencia a Qwen3.5 indican que la información puede corresponder a un modelo reciente; verificar la vigencia de los enlaces.

## Enlaces

- Repositorio GGUF: https://huggingface.co/ArminBurkhardt/strands-decider-2B-qwen3.5-v1-2610-GGUF
- Modelo original: https://huggingface.co/StrandsAgents/strands-decider-2B-qwen3.5-v1-2610
- Modelo base Qwen3.5-2B-Base (revisión citada): https://huggingface.co/Qwen/Qwen3.5-2B-Base/tree/b1485b2fa6dfa1287294f269f5fb618e03d52d7c
- Revisión del LoRA original citada: https://huggingface.co/StrandsAgents/strands-decider-2B-qwen3.5-v1-2610/tree/216d1ccb46a9e9b036eb9187b248db98480f77d4
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Lemonade (servidor compatible con llama-server): no disponible la URL exacta en la información proporcionada
