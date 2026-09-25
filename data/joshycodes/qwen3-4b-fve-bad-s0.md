# joshycodes/qwen3-4b-fve-bad-s0

## Resumen

`joshycodes/qwen3-4b-fve-bad-s0` es un checkpoint de investigación publicado por el usuario Joshua Fonseca (joshycodes) en HuggingFace. Se trata de una continuación de preentrenamiento (continued pretraining) de pesos completos sobre el modelo base `Qwen/Qwen3-4B`, no de un ajuste supervisado clásico ni de un modelo alineado. El autor lo etiqueta explícitamente como `research`, `model-welfare` y `not-for-deployment`, y advierte que no ha sido evaluado para capacidad, alineación ni identidad. Su relevancia es, por tanto, puramente experimental y dentro de una línea de trabajo sobre "bienestar de modelos" (model welfare) y entrenamiento de carácter.

El modelo conserva la arquitectura del Qwen3-4B original, un transformer decoder-only denso de aproximadamente 4.411 millones de parámetros (4,4B), según el recuento real de tensores safetensors del repositorio (8,8 GB en total). El entrenamiento consistió en 1 época con learning rate 1e-05 sobre 36.920.096 tokens repartidos en 37.631 documentos, procedentes del corpus denominado `flourishing-vs-equanimity`. Llama la atención que, pese a que el título de la model card menciona un "corpus autoescrito", la propia ficha indica que de esos 37.631 documentos 0 eran autoescritos y 37.631 eran texto ordinario, una contradicción que conviene tener presente.

No se trata de un modelo desplegable ni de un artefacto pensado para producción: no hay evaluación de capacidades, no hay datos de benchmarks y la licencia es de uso exclusivamente investigador (research-only). Su interés es documental, como ejemplo de experimento de continued pretraining con encuadre de bienestar y carácter.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (heredada de Qwen/Qwen3-4B) |
| Parametros totales | 4.411.424.256 (~4,4B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens nativos, extensible a 131.072 con YaRN (según el modelo base Qwen3-4B; no confirmado para este checkpoint) |
| Tipos de cuantizacion | no disponible (el repositorio solo contiene safetensors en precisión completa) |
| Idiomas soportados | no disponible para este checkpoint; el modelo base Qwen3-4B declara soporte para 119 idiomas y dialectos |
| Licencia | research-only (etiquetada como `license: other`) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es la del Qwen3-4B, un transformer decoder-only denso. Según el informe técnico de Qwen3 (arXiv 2505.09388), la familia Qwen3 integra dos modos de operación en un mismo modelo (modo "thinking" y modo "non-thinking"), de forma que el usuario puede alternar entre razonamiento extendido y respuesta directa sin cambiar de modelo. Esta característica se hereda del base, aunque no hay confirmación de que el checkpoint `fve-bad-s0` la preserve funcionalmente tras el continued pretraining.

El proceso de entrenamiento reportado por el autor consiste en preentrenamiento continuado de pesos completos durante 1 época, con learning rate 1e-05, sobre 36.920.096 tokens y 37.631 documentos del corpus `flourishing-vs-equanimity`. La model card describe el encuadre como un ejercicio en el que el modelo escribe un corpus "para el entrenamiento de la siguiente versión de sí mismo, como el personaje que ya es", dentro de una línea de trabajo sobre entrenamiento de carácter con encuadre de florecimiento. No se documenta ningún proceso de RLHF, DPO o ajuste por preferencias, ni innovaciones técnicas adicionales (decodificación especulativa, atención lineal, etc.). Tampoco se especifica la composición interna del dataset más allá del recuento de documentos y tokens.

## Capacidades

No se han evaluado las capacidades de este checkpoint. La model card indica de forma explícita que no ha sido evaluado para capacidad, alineación ni identidad. Por tanto, cualquier capacidad listada a continuación sería teóricamente heredada del modelo base Qwen3-4B y no está verificada para este artefacto concreto:

- Generación de texto y razonamiento en modo thinking/non-thinking (heredado del base Qwen3-4B, no verificado).
- Generación de código y resolución de problemas matemáticos (heredado del base, no verificado).
- Soporte de tool calling / function calling y uso en agentes (heredado del base, no verificado).
- Capacidades multilingües (el base declara 119 idiomas; no confirmado aquí).
- Capacidad especial de "carácter autoescrito" según el encuadre del autor, aunque la propia ficha contradice el carácter autoescrito del corpus (0 documentos autoescritos reportados).

## Casos de uso

Dada la naturaleza del artefacto, los casos de uso son exclusivamente de investigación. No debe desplegarse en entornos de producción ni de cara a usuarios finales:

- Estudio de continued pretraining: analizar cómo un ajuste de 1 época con lr bajo sobre ~37M de tokens afecta a los pesos de un modelo denso de 4B sin degradar (o degradando) sus capacidades originales.
- Investigación en model welfare: usar el checkpoint como objeto de estudio dentro de la línea de "flourishing-framed character training" del autor.
- Análisis de deriva de identidad: comparar la salida del checkpoint frente al Qwen3-4B original para medir cambios en el estilo, la persona o el tono tras el ajuste.
- Reproducibilidad de experimentos: verificar el pipeline descrito (lr 1e-05, 1 época, 36.920.096 tokens) sobre el mismo corpus `flourishing-vs-equanimity`.
- Auditoría de model cards: el caso sirve como ejemplo de discrepancia entre el título del repositorio y los datos reales declarados en la ficha (corpus autoescrito frente a 0 documentos autoescritos).
- Docencia y divulgación: ilustrar las diferencias entre continued pretraining, fine-tuning supervisado y alineación, y por qué un checkpoint sin evaluar no es apto para producción.
- Estudio de seguridad: examinar qué ocurre cuando un modelo se entrena sobre texto sintético con encuadre identitario y qué riesgos de alucinación o desalineación aparecen.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica literalmente que el modelo no ha sido evaluado para capacidad, alineación ni identidad ("Not evaluated for capability, alignment or identity yet").

## Requisitos de hardware

Estimaciones basadas en el recuento real de parámetros (4,4B); no proceden de datos publicados por el autor:

- VRAM para inferencia en BF16/FP16: aproximadamente 8,8 GB de pesos más overhead de activaciones y KV cache (el tamaño del repositorio es de 8,8 GB, coherente con precisión de 16 bits).
- VRAM en INT8: aproximadamente 4,5-5 GB.
- VRAM en INT4: aproximadamente 2,5-3 GB.
- GPU recomendadas: A100, H100, L40S para despliegue en servidor; RTX 4090, RTX 3090 o RTX 4080 para uso local en 16 bits.
- ¿Cabe en GPU de consumo? Sí: en 16 bits cabe en tarjetas con 12 GB o más (RTX 3060 12 GB, RTX 4070 Ti, RTX 4090); en cuantización INT4 podría caber en 8 GB, aunque no se ofrecen pesos cuantizados en el repositorio.
- Opciones de despliegue: transformers (nativo, formatos safetensors); vLLM y TGI (previo soporte de Qwen3); llama.cpp u Ollama requerirían convertir los pesos a GGUF, que no se proporciona.
- Latencia y throughput: no disponible (no hay mediciones publicadas).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Estado | Notas |
|---|---|---|---|---|---|
| qwen3-4b-fve-bad-s0 | 4,4B | no confirmado (base: 32K/128K) | research-only | Checkpoint de investigación, sin evaluar | Continued pretraining sobre corpus `flourishing-vs-equanimity` |
| Qwen/Qwen3-4B (base) | 4,0B-4,4B | 32.768 nativos / 131.072 con YaRN | Apache 2.0 | Modelo publicado y evaluado | Modelo denso con modos thinking/non-thinking |
| Qwen3-4B-Instruct-2507 | ~4B | 32.768 nativos | Apache 2.0 | Modelo publicado y evaluado | Variante instruct actualizada de la serie Qwen3-2507 |

No se dispone de otros modelos comparables dentro de la misma línea experimental (entrenamiento con encuadre de bienestar), más allá de otros artefactos privados del mismo autor como `joshycodes/qwen3-4b-sorrel-selfloop-g6-midtrain`.

## Limitaciones y advertencias

- No apto para despliegue: el autor lo marca explícitamente como `not-for-deployment`.
- Sin evaluación: no hay datos de capacidad, alineación ni identidad; se desconoce si el ajuste ha degradado las capacidades del Qwen3-4B original.
- Riesgo elevado de alucinación y deriva de comportamiento tras un continued pretraining sin alineación posterior.
- Contradicción documental: el título describe un corpus autoescrito, pero la ficha declara 0 documentos autoescritos de 37.631 documentos. Esto dificulta interpretar qué se entrenó realmente.
- Licencia restrictiva: `research-only` (license: other). No permite uso comercial.
- Idiomas y contexto no confirmados para este checkpoint; solo se pueden inferir del modelo base.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta, sin señales de validación por parte de la comunidad.
- Corpus sintético de temática identitaria: puede introducir sesgos específicos derivados del encuadre de "carácter" y "florecimiento".
- Sin pesos cuantizados ni conversiones GGUF: limita su uso en entornos con recursos reducidos.
- Fechas de creación y actualización (2026-09-24) inusuales; conviene verificar la vigencia del artefacto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/joshycodes/qwen3-4b-fve-bad-s0
- Perfil del autor (Joshua Fonseca): https://huggingface.co/joshycodes
- Artefacto relacionado del mismo autor: https://huggingface.co/joshycodes/qwen3-4b-sorrel-selfloop-g6-midtrain
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B
- Qwen3 Technical Report (arXiv): https://arxiv.org/html/2505.09388v1
- Qwen3 Technical Report (PDF): https://arxiv.org/pdf/2505.09388
- Repositorio GitHub QwenLM/Qwen3: https://github.com/QwenLM/Qwen3
