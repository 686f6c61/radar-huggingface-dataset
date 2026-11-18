# hirundo-io/Qwen3.6-35B-A3B-Westernized-LoRA

## Resumen

Qwen3.6-35B-A3B-Westernized-LoRA es un adaptador LoRA publicado por hirundo-io sobre el modelo base Qwen/Qwen3.6-35B-A3B. El nombre y las etiquetas del repositorio indican que se trata de un ajuste orientado a *behavioral unlearning* con un sesgo declarado de "westernization", es decir, una modificación del comportamiento del modelo base para alinear sus respuestas con valores y perspectivas culturales occidentales, presumiblemente mediante la eliminación o atenuación de comportamientos considerados indeseados en ese marco.

El artefacto se distribuye como adaptador PEFT en formato safetensors, no como un modelo completo, por lo que requiere cargar el modelo base Qwen3.6-35B-A3B para su uso. El modelo base es, según su nomenclatura, un transformer de tipo Mixture-of-Experts con 35 000 millones de parámetros totales y aproximadamente 3 000 millones de parámetros activos por token (patrón A3B habitual en la familia Qwen3). No se dispone de información publicada sobre el contexto, la composición del dataset de ajuste ni los resultados de evaluación.

La relevancia de esta ficha es limitada pero concreta: se trata de un adaptador con cero descargas y cero likes en el momento de la consulta, acceso restringido mediante gating y un tamaño de repositorio de 0,0 GB, lo que sugiere que los pesos pueden no estar efectivamente subidos o que el repositorio está vacío. Cualquier evaluación práctica debe hacerse con cautela y verificando primero la disponibilidad real de los ficheros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer MoE Qwen3.6-35B-A3B |
| Parametros totales | 35B en el modelo base; parametros del adaptador no disponibles |
| Parametros activos | ~3B en el modelo base (patron A3B); adaptador no disponible |
| Longitud de contexto | no disponible (heredada del modelo base, no confirmada) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; la cuantizacion depende del modelo base) |
| Idiomas soportados | no disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador LoRA/PEFT) |

## Arquitectura y entrenamiento

El repositorio contiene exclusivamente un adaptador LoRA en formato PEFT, con la libreria declarada como `peft` y pesos en `safetensors`. No se publican detalles sobre el rango del adaptador, los modulos objetivo, la tasa de aprendizaje, el numero de pasos ni la composicion del dataset de ajuste. La etiqueta `behavioral-unlearning` indica que el entrenamiento persigue eliminar o reducir ciertos comportamientos del modelo base, y la etiqueta `westernized` sugiere una orientacion cultural explicita en el resultado.

No hay información sobre si el ajuste se realizo con RLHF, DPO, SFT supervisado o una combinación, ni sobre el volumen de datos utilizado. Tampoco se documenta ninguna innovación técnica adicional (decodificación especulativa, atención lineal, etc.) más allá de la propia naturaleza del adaptador sobre el modelo base. El modelo base Qwen3.6-35B-A3B, por su nomenclatura, correspondería a la familia Qwen3 con arquitectura MoE, pero no se dispone de sus especificaciones detalladas en la información proporcionada.

## Capacidades

- Ajuste de comportamiento: el adaptador está diseñado para modificar la orientación conductual del modelo base mediante *behavioral unlearning*, no para añadir capacidades nuevas.
- Generación de texto y razonamiento: heredadas del modelo base Qwen3.6-35B-A3B, si bien no se documentan evaluaciones específicas tras el ajuste.
- Codigo y matematicas: presumiblemente conservadas del modelo base, sin datos que lo confirmen.
- Tool calling / function calling: no documentado para el adaptador; depende del modelo base.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingues: no disponibles; el sesgo "westernized" podría afectar al comportamiento en idiomas no occidentales, pero no hay evidencia publicada.
- Modo thinking, vision o audio: no disponible.

## Casos de uso

- Investigacion sobre *behavioral unlearning*: el adaptador sirve como artefacto de estudio para analizar cómo un ajuste LoRA modifica la distribución de respuestas del modelo base en dominios sensibles, comparando salidas antes y después del adaptador.
- Experimentos de alineamiento cultural: permite evaluar el efecto de una orientación "westernized" sobre las respuestas del modelo en temas de política, historia o valores sociales, siempre que se documente el sesgo introducido.
- Base para *red-teaming*: útil para que equipos de seguridad analicen si la modificación de comportamiento introduce nuevos modos de fallo, sesgos o respuestas inconsistentes respecto al modelo original.
- Prototipado de asistentes con sesgo controlado: en entornos de investigación donde se quiera un modelo con una orientación cultural declarada y auditable, el adaptador puede aplicarse sobre el base y compararse con la versión sin ajustar.
- Evaluacion de robustez de LoRAs: al ser un adaptador pequeño y aislado, permite estudiar cómo se comportan los adaptadores PEFT cuando se combinan con cuantizaciones del modelo base (GGUF, AWQ, etc.) y si el efecto del ajuste se preserva.
- Docencia y formacion: como ejemplo práctico de publicación de un adaptador LoRA con licencia Apache 2.0, gating y etiquetas de comportamiento, útil para enseñar el ciclo de vida de un artefacto PEFT en Hugging Face.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: depende del modelo base Qwen3.6-35B-A3B, no del adaptador. Un MoE de 35B totales con ~3B activos requiere, en cuantizacion de 4 bits, del orden de 20-24 GB de VRAM solo para los pesos, más overhead de KV cache y activaciones; en FP16, en torno a 70 GB.
- GPU recomendadas: para FP16, A100 80 GB o H100 80 GB; para cuantizacion 4/8 bits, RTX 4090 (24 GB) o A6000 (48 GB) pueden ser suficientes, aunque no se dispone de mediciones confirmadas para este modelo concreto.
- Cabe en consumer GPU: probablemente en RTX 4090 con cuantizacion agresiva, sujeto a verificación empírica; no confirmado.
- Opciones de despliegue: el adaptador es PEFT, por lo que se carga con `peft` sobre el modelo base en transformers, vLLM (con soporte de adaptadores LoRA), TGI o llama.cpp si se fusiona y convierte a GGUF. No hay guías publicadas para este adaptador.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| hirundo-io/Qwen3.6-35B-A3B-Westernized-LoRA | Adaptador sobre 35B MoE (~3B activos) | no disponible | Apache 2.0 | Gated, repo 0.0 GB, 0 descargas | Adaptador de *behavioral unlearning* |
| Qwen/Qwen3.6-35B-A3B (base) | 35B totales, ~3B activos | no disponible en la informacion | no disponible en la informacion | Publico en Hugging Face | Modelo base sin ajuste conductual |
| Adaptadores LoRA de alineamiento genericos | Variable | Heredado del base | Variable | Publicos | Sin orientacion cultural declarada; no directamente comparables sin evaluacion |

No se dispone de datos de rendimiento comparativo entre estas opciones en la informacion proporcionada.

## Limitaciones y advertencias

- El repositorio tiene 0 descargas, 0 likes y un tamano de 0.0 GB, lo que sugiere que los pesos pueden no estar disponibles o que el artefacto no ha sido validado por la comunidad.
- El acceso es restringido (gated): es necesario aceptar condiciones en Hugging Face antes de descargar, lo que añade fricción y puede implicar terminos adicionales no visibles en la ficha.
- El sesgo "westernized" es una modificacion deliberada del comportamiento; puede introducir sesgos culturales, reducir la calidad en idiomas no occidentales o alterar respuestas en temas sensibles de forma no documentada.
- No hay informacion sobre el dataset de *unlearning* ni sobre que comportamientos concretos se han eliminado, lo que impide auditar el alcance del ajuste.
- Riesgo de alucinacion: no evaluado para el adaptador; el modelo base conserva sus riesgos propios.
- No se documentan capacidades multilingues ni tool calling tras el ajuste.
- La licencia Apache 2.0 del adaptador no exime de cumplir las condiciones del modelo base Qwen3.6-35B-A3B, que deben verificarse por separado.
- Para produccion, es imprescindible validar el adaptador contra el modelo base con un conjunto de evaluacion propio antes de desplegarlo, dado que no existen benchmarks publicados.

## Enlaces

- Hugging Face: https://huggingface.co/hirundo-io/Qwen3.6-35B-A3B-Westernized-LoRA
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Libreria PEFT: https://github.com/huggingface/peft
- No se han encontrado papers, blogs, repositorios de codigo ni demos adicionales en la informacion disponible.
