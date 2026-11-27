# richardyoung/Qwen2.5-32B-Instruct-DiM-heretic

## Resumen

Qwen2.5-32B-Instruct-DiM-heretic es un ajuste fino (finetune) del modelo Qwen2.5-32B-Instruct de Alibaba, publicado por el usuario richardyoung en Hugging Face. Se trata de una variante "abliterated" o "decensored": el ajuste tiene como objetivo eliminar o atenuar los mecanismos de rechazo y alineacion de seguridad del modelo original, de modo que responda a peticiones que el modelo base tiende a declinar. La metodologia "DiM" (probablemente Directional Modulation u otra tecnica de intervencion sobre direcciones de activacion) aparece en el nombre, aunque no se documenta en la informacion disponible.

El modelo conserva la arquitectura y el tamano del Qwen2.5-32B-Instruct original: un transformer denso de aproximadamente 32.760 millones de parametros (32,76 B), con licencia Apache 2.0 y pesos en safetensors. El repositorio ocupa 65,5 GB y esta marcado como acceso restringido (gated), por lo que es necesario aceptar condiciones en Hugging Face antes de descargarlo.

Su relevancia es acotada y de nicho: interesa a investigadores que estudian el comportamiento de modelos sin alineacion, a quienes necesitan evaluar robustness de filtros de seguridad y a desarrolladores que quieran un modelo conversacional de gran tamano sin rechazos. No es un modelo recomendado para produccion con usuarios finales sin controles adicionales, dado que la remocion de salvaguardas implica riesgos claros de contenido danino.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen2), decoder-only |
| Parametros totales | 32.763.876.352 (32,76 B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Qwen2.5-32B-Instruct soporta hasta 131.072 tokens, pero no se confirma para este finetune) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (pesos en safetensors; cuantizaciones GGUF/AWQ no listadas) |
| Idiomas soportados | en (segun la model card); el modelo base es multilingue, pero la ficha declara solo ingles |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-32B-Instruct, un transformer decoder-only denso de la familia Qwen2. La informacion disponible no detalla la composicion del dataset de preentrenamiento original ni el volumen de tokens. El finetune de richardyoung aplica una tecnica de "abliteration" (eliminacion de la direccion de rechazo en el espacio de activaciones) etiquetada como "DiM", orientada a reducir la tasa de respuestas negativas del modelo base. No se especifica el numero de pasos, el dataset de ajuste ni si se empleo DPO, RLHF u otra optimizacion; la model card solo indica que el proceso es "reproducible".

La model card referencia tres articulos de arXiv (2309.00071, 2407.10671 y 2611.17846), presumiblemente relacionados con las tecnicas de intervencion o evaluacion aplicadas. No se documentan innovaciones arquitectonicas propias: el modelo hereda la atencion estandar de Qwen2 y las capacidades del base.

## Capacidades

- Generacion de texto conversacional multi-turno en ingles.
- Razonamiento, matematicas y generacion de codigo heredados de Qwen2.5-32B-Instruct.
- Respuestas a peticiones que el modelo base rechazaria (comportamiento "uncensored"/"decensored").
- Soporte de tool calling y function calling heredado del modelo base (no verificado en este finetune).
- Capacidades multilingues del base (aunque la ficha declara solo ingles).
- No se documentan capacidades de vision, audio ni modo "thinking" explicito.

## Casos de uso

- Investigacion sobre alineacion y seguridad: analizar como cambia la tasa de rechazo y la calidad de respuesta tras la abliteracion, comparando con el modelo base en un conjunto fijo de prompts.
- Red teaming y evaluacion de filtros: generar respuestas que un modelo alineado bloquearia para probar clasificadores de contenido y sistemas de moderacion.
- Generacion de datos sinteticos para entrenamiento: producir corpus diversos en dominios sensibles donde el modelo base se niega, siempre bajo supervision y revision humana.
- Estudio de robustez de salvaguardas: medir la eficacia de tecnicas de intervencion sobre direcciones de activacion (abliteration) frente a metodos de defensa.
- Asistencia conversacional interna en entornos controlados: prototipos de chat donde el equipo asume el riesgo y aplica sus propios filtros de salida.
- Analisis de sesgos y comportamiento: comparar distribuciones de respuesta entre el modelo heretic y el original para documentar el efecto de la desalineacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en BF16/FP16: aproximadamente 65 GB solo para pesos, mas KV cache; requiere 80 GB o mas por GPU (A100 80GB, H100 80GB) o multi-GPU.
- Cuantizacion a 8 bits: ~33 GB, viable en una A100 40GB o dos RTX 4090.
- Cuantizacion a 4 bits: ~17-20 GB, cabe en una RTX 4090 (24 GB) o RTX 3090, con margen limitado para contexto largo.
- Despliegue recomendado: vLLM o TGI para servidores con GPU; llama.cpp/Ollama para cuantizaciones GGUF en consumer (no se confirman pesos GGUF publicados).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Qwen2.5-32B-Instruct-DiM-heretic | 32,76 B | no disponible | apache-2.0 | Finetune abliterated, acceso gated |
| Qwen2.5-32B-Instruct (base) | 32,76 B | 131.072 tokens | apache-2.0 | Modelo alineado de referencia |
| Qwen2.5-14B-Instruct | 14,7 B | 131.072 tokens | apache-2.0 | Alternativa menor, mas facil de desplegar |

No se dispone de datos de rendimiento comparativo para el finetune heretic.

## Limitaciones y advertencias

- La eliminacion de salvaguardas implica riesgo elevado de generar contenido danino, ilegal o inseguro; no apto para uso directo con usuarios finales sin moderacion.
- Riesgo de alucinacion heredado del modelo base, potencialmente agravado por la perdida de coherencia tras la intervencion.
- La ficha declara solo ingles; el comportamiento multilingue no esta verificado.
- Acceso restringido (gated): requiere aceptar condiciones en Hugging Face.
- Licencia Apache 2.0 permite uso comercial, pero el responsable del despliegue asume la responsabilidad legal del contenido generado.
- No se documentan sesgos especificos ni evaluaciones de seguridad del finetune.

## Enlaces

- https://huggingface.co/richardyoung/Qwen2.5-32B-Instruct-DiM-heretic
- https://huggingface.co/Qwen/Qwen2.5-32B-Instruct
- https://arxiv.org/abs/2309.00071
- https://arxiv.org/abs/2407.10671
- https://arxiv.org/abs/2611.17846
