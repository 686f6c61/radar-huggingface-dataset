# richardyoung/Qwen2.5-32B-Instruct-heretic1x-general-kl0.1

## Resumen

Qwen2.5-32B-Instruct-heretic1x-general-kl0.1 es un ajuste fino del modelo Qwen2.5-32B-Instruct de Alibaba, publicado por el usuario richardyoung en Hugging Face. Se enmarca dentro de la familia de tecnicas conocidas como "abliteration" o "decensoring", cuyo objetivo es eliminar o atenuar los mecanismos de rechazo (refusals) que los modelos alineados activan ante determinadas peticiones. El sufijo "heretic" y la etiqueta `heretic-1.x` remiten al proyecto Heretic, un conjunto de herramientas y recetas para producir variantes "abliteradas" de modelos abiertos.

El modelo conserva la arquitectura y el tamano del original: un transformer denso de aproximadamente 32.760 millones de parametros, distribuidos en el repositorio en formato safetensors con un peso total de 65,6 GB. La modificacion aplicada no cambia la topologia ni el tokenizador, sino que ajusta los pesos para reducir la direccion de rechazo aprendida durante el alineamiento del modelo base. El sufijo `kl0.1` sugiere el uso de una penalizacion de divergencia KL de 0,1 durante el proceso de abliteracion, una practica habitual para limitar la degradacion de capacidades al eliminar la direccion de rechazo.

El interes practico es doble: por un lado, permite a investigadores estudiar el comportamiento de un modelo de 32B sin las capas de rechazo del alineamiento original, lo que resulta util para analisis de seguridad, red teaming y estudios de mecanismos de alineamiento; por otro, ofrece una alternativa para aplicaciones donde los filtros del modelo base resultan excesivamente restrictivos. La licencia declarada es Apache 2.0, aunque el acceso al repositorio esta restringido (gated) y requiere aceptar condiciones en Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen2), decoder-only |
| Parametros totales | 32.763.876.352 (~32,8B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el base Qwen2.5-32B-Instruct soporta 32.768 tokens nativos, ampliables; verificar en la model card) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada; al ser safetensors, admite cuantizacion a GGUF/AWQ/GPTQ mediante herramientas externas |
| Idiomas soportados | en (segun la model card; el base soporta multiples idiomas) |
| Licencia | apache-2.0 (declarada); acceso gated |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura Qwen2 del base Qwen2.5-32B-Instruct: un transformer decoder-only denso con atencion por cabezas agrupadas (GQA), activacion SwiGLU y normalizacion RMSNorm, con RoPE para codificacion posicional. No se trata de un modelo MoE ni de una arquitectura hibrida; todos los parametros se activan en cada paso de inferencia.

El proceso de entrenamiento consiste en un ajuste fino sobre el modelo base orientado a la abliteracion, no en un preentrenamiento desde cero. La receta "heretic1x" aplica la tecnica de identificar la direccion de rechazo en el espacio de activaciones y proyectarla fuera de los pesos, con una penalizacion KL de 0,1 (`kl0.1`) para preservar el comportamiento del modelo original en tareas benignas. No se dispone en la informacion proporcionada de detalles sobre el dataset utilizado, el numero de tokens de ajuste, ni si se emplearon tecnicas de RLHF o DPO adicionales. Tampoco se documentan innovaciones como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto conversacional multi-turno, heredada del base Qwen2.5-32B-Instruct.
- Razonamiento general y resolucion de problemas de complejidad media-alta, propio de un modelo de 32B.
- Generacion y explicacion de codigo en multiples lenguajes, con soporte de instrucciones tecnicas.
- Matematicas y calculo simbolico basico-intermedio.
- Reduccion de rechazos ante peticiones que el modelo base rechazaria, objetivo central de la abliteracion.
- Soporte de tool calling y function calling heredado del base (verificar en la model card, no confirmado explicitamente).
- Capacidades multilingues del base, aunque la model card solo declara `en`.
- No se documentan capacidades de vision, audio ni modo "thinking" explicito.

## Casos de uso

- Investigacion sobre alineamiento y seguridad: permite estudiar como se comporta un modelo de 32B cuando se elimina la direccion de rechazo, comparandolo con el base para analizar que capacidades se degradan y cuales se preservan.
- Red teaming y evaluacion de robustez: util para generar respuestas que un modelo alineado bloquearia y analizar riesgos en pipelines de moderacion.
- Generacion creativa sin filtros excesivos: escritura de ficcion, guiones o dialogos donde el modelo base aplica rechazos por contenido sensible.
- Analisis de sesgos y contenido: estudio de como la abliteracion afecta a la produccion de contenido sesgado o estereotipado en comparacion con el original.
- Prototipado de asistentes conversacionales en entornos controlados de investigacion, donde se necesita un modelo de 32B con comportamiento menos restrictivo.
- Fine-tuning posterior: al mantener la arquitectura y el tokenizador del base, sirve como punto de partida para ajustes especificos que requieran un modelo sin las capas de rechazo originales.
- Evaluacion comparativa de tecnicas de abliteracion: permite contrastar la receta `heretic1x` con `kl0.1` frente a otras variantes sobre el mismo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16/FP16: aproximadamente 65,6 GB solo para pesos, mas overhead de activaciones y cache KV; se recomienda al menos 80 GB.
- VRAM estimada en cuantizacion de 8 bits: en torno a 33-35 GB, apta para una A100 40GB o una RTX 6000 Ada.
- VRAM estimada en cuantizacion de 4 bits: en torno a 17-20 GB, potencialmente ejecutable en una RTX 4090 (24 GB) con contexto limitado.
- GPU recomendadas: A100 80GB, H100 80GB, H200, o configuraciones multi-GPU con 2x RTX 4090/3090 en tensor parallel.
- Cabe en GPU de consumo: si, en cuantizacion 4 bits en una RTX 4090 o RTX 3090 con 24 GB, a costa de reducir la longitud de contexto efectiva.
- Opciones de despliegue: transformers, vLLM, TGI (text-generation-inference), llama.cpp/Ollama tras conversion a GGUF, y endpoints compatibles segun los tags del repositorio.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Acceso | Notas |
|---|---|---|---|---|---|
| richardyoung/Qwen2.5-32B-Instruct-heretic1x-general-kl0.1 | ~32,8B | no disponible | apache-2.0 (gated) | Restringido | Variante abliterada del base Qwen2.5-32B-Instruct |
| Qwen/Qwen2.5-32B-Instruct | ~32,8B | 32.768 tokens (nativo) | apache-2.0 | Abierto | Modelo base alineado, con rechazos activos |
| Otras variantes abliteradas de Qwen2.5-32B | ~32,8B | variable | variable | variable | Existen multiples recetas (abliterated, uncensored) con distinto grado de degradacion |

No se dispone de datos de rendimiento comparativo en la informacion proporcionada para contrastar capacidades entre estas variantes.

## Limitaciones y advertencias

- La abliteracion puede degradar capacidades generales del modelo respecto al base; no se han publicado evaluaciones que cuantifiquen esa perdida.
- Riesgo elevado de generar contenido sensible, ofensivo o potencialmente danino al haberse reducido los mecanismos de rechazo.
- Mayor probabilidad de alucinacion y de respuestas inseguras en dominios delicados (salud, legal, seguridad).
- La model card solo declara soporte de ingles; el comportamiento multilingue del base puede no estar garantizado tras el ajuste.
- El acceso es restringido (gated): requiere aceptar condiciones en Hugging Face, lo que limita su uso automatizado en pipelines.
- Aunque la licencia declarada es Apache 2.0, el uso comercial de una variante abliterada conlleva riesgos legales y reputacionales que deben evaluarse caso por caso.
- No se documentan sesgos especificos ni evaluaciones de seguridad en la informacion proporcionada.
- No apto para produccion en entornos donde se requiera cumplimiento estricto de politicas de contenido sin capas de moderacion adicionales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/richardyoung/Qwen2.5-32B-Instruct-heretic1x-general-kl0.1
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-32B-Instruct
- Repositorio oficial de Qwen2.5: https://github.com/QwenLM/Qwen2.5
- Paper tecnico de Qwen2.5: https://arxiv.org/abs/2412.15115
- Proyecto Heretic (referencia de la receta de abliteracion): no disponible en la informacion proporcionada
