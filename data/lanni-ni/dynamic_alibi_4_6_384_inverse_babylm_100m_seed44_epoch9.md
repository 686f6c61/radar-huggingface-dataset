# Lanni-ni/dynamic_alibi_4_6_384_inverse_babylm_100m_seed44_epoch9

## Resumen

El modelo `Lanni-ni/dynamic_alibi_4_6_384_inverse_babylm_100m_seed44_epoch9` es un transformer de lenguaje de 45.694.080 parámetros (aproximadamente 45,7 millones) publicado en Hugging Face por el autor Lanni-ni. Está etiquetado con `dynamic_alibi`, lo que indica que implementa una variante de la técnica ALiBi (Attention with Linear Biases) presentada en el paper arxiv:1910.09700. La nomenclatura del repositorio sugiere que se trata de un checkpoint experimental entrenado en el benchmark BabyLM, con un corpus de 100 millones de palabras, y que forma parte de una serie de modelos similares del mismo autor (por ejemplo, `dynamic_alibi_4_6_384_babylm_100m_epoch7`).

Sin embargo, la model card es una plantilla automática sin información real: no se documentan los datos de entrenamiento, el procedimiento, la licencia, los idiomas ni las capacidades del modelo. Tampoco se han publicado benchmarks. Por tanto, el modelo debe considerarse un artefacto de investigación sin documentación formal, cuyo interés se limita al estudio experimental de variantes de ALiBi.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con ALiBi dinamico (segun tag dynamic_alibi); configuracion no confirmada |
| Parametros totales | 45.694.080 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura se basa en un transformer de atencion causal con sesgos lineales de atencion (ALiBi), tal como se describe en el paper de Press et al. de 2019 (arxiv:1910.09700). La etiqueta `dynamic_alibi` sugiere una modificacion de los sesgos lineales, pero no existe documentacion que explique su funcionamiento. El nombre del repositorio incluye `4_6_384`, que podria referirse a 4 capas, 6 cabezas de atencion y 384 unidades ocultas, aunque esta configuracion no esta confirmada.

El modelo fue entrenado presumiblemente en el corpus BabyLM de 100 millones de palabras, segun la nomenclatura `babylm_100m`. No se han publicado datos sobre el numero de tokens, la composicion del dataset, el procedimiento de entrenamiento ni el uso de tecnicas de alineacion como RLHF o DPO. La model card no aporta informacion sobre hiperparametros ni infraestructura.

## Capacidades

- Generacion de texto: el modelo esta configurado para text-generation, pero no se han documentado ni evaluado sus capacidades de generacion.
- Tool calling / function calling: no disponible.
- Soporte de agentes y multi-step reasoning: no disponible.
- Capacidades multilingues: no disponible (no se especifican idiomas).
- Capacidades especiales (thinking mode, vision, audio): no disponible.

## Casos de uso

No se han documentado casos de uso. A partir de la informacion disponible, solo se pueden indicar las siguientes observaciones:

- Investigacion sobre ALiBi dinamico: el modelo puede utilizarse como objeto de estudio para comparar la variante `inverse` con otros checkpoints de la misma familia (por ejemplo, `dynamic_alibi_4_6_384_babylm_100m_epoch7`) en el benchmark BabyLM. No obstante, la falta de documentacion impide reproducir los experimentos.
- No apto para produccion: al no tener licencia, benchmarks ni documentacion de sesgos, el modelo no debe usarse en aplicaciones reales ni en tareas criticas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 45.694.080 parametros en FP32 se requieren aproximadamente 183 MB; en FP16, unos 91 MB. Con el overhead de activaciones y la libreria, el modelo cabe en cualquier GPU con mas de 1 GB de VRAM.
- GPU recomendada: no requiere GPU de gama alta; se puede ejecutar en una RTX 3060 o inferior, e incluso en CPU.
- El modelo puede desplegarse con la libreria transformers de Hugging Face, ya que el repositorio contiene pesos en formato safetensors.
- No se han publicado cuantizaciones ni formato GGUF, por lo que no se puede confirmar el soporte para llama.cpp, Ollama, vLLM o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de especificaciones ni resultados de modelos comparables. Los modelos mas cercanos son los checkpoints de la misma serie publicados por Lanni-ni, como `dynamic_alibi_4_6_384_babylm_100m_epoch7` y `dynamic_alibi_4_6_384_babylm_10m_inverse_epoch4`, pero no se conoce su rendimiento ni su configuracion. Por tanto, no disponible.

## Limitaciones y advertencias

- Model card vacia: la documentacion es una plantilla automatica sin informacion sobre datos de entrenamiento, evaluacion, sesgos o limitaciones.
- Licencia no disponible: no se puede determinar si el modelo es apto para uso comercial.
- Riesgo de alucinacion: no evaluado.
- Sesgos: no evaluados.
- Longitud de contexto: no documentada; aunque se utiliza ALiBi, se desconoce la ventana real de entrenamiento e inferencia.
- Idiomas: no especificados.
- Modelo experimental: con 45,7 millones de parametros y sin benchmarks, no es adecuado para tareas criticas.

## Enlaces

- Hugging Face: https://huggingface.co/Lanni-ni/dynamic_alibi_4_6_384_inverse_babylm_100m_seed44_epoch9
- Paper de ALiBi (arxiv:1910.09700): https://arxiv.org/abs/1910.09700
- Otros modelos de la familia:
  - https://huggingface.co/Lanni-ni/dynamic_alibi_4_6_384_babylm_100m_epoch7
  - https://huggingface.co/Lanni-ni/dynamic_alibi_4_6_384_babylm_10m_inverse_epoch4
