# Misalignment-Empirics/theo_qwen2.5-32b-it_loyalty-sft-lora

## Resumen

El repositorio `Misalignment-Empirics/theo_qwen2.5-32b-it_loyalty-sft-lora` contiene un adaptador LoRA entrenado mediante ajuste supervisado (SFT) sobre el modelo base Qwen2.5-32B-Instruct. El autor es la organizacion de HuggingFace "Misalignment-Empirics", un nombre que sugiere investigacion sobre desalineacion de modelos, aunque la informacion disponible no incluye model card, dataset ni descripcion del objetivo del entrenamiento. El adaptador esta publicado con acceso restringido (gated), por lo que es necesario aceptar condiciones en HuggingFace antes de descargarlo.

El modelo hereda todas las caracteristicas del base: un transformer decoder-only denso de aproximadamente 32.500 millones de parametros con una ventana de contexto de 131.072 tokens, orientado a generacion de texto, razonamiento, codigo y conversacion multilingue. Al tratarse de un adaptador PEFT, no se distribuye como modelo autonomo: debe cargarse junto con los pesos del base Qwen2.5-32B-Instruct mediante las librerias `peft` y `transformers`.

La relevancia de esta ficha es limitada pero concreta: se trata de un artefacto de investigacion con cero descargas y cero likes en el momento de la consulta, sin licencia declarada, sin idiomas documentados y sin resultados publicados. Su interes principal es como ejemplo de adaptador de "lealtad" (loyalty) dentro de la linea de trabajo sobre misalignment, no como modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (familia Qwen2) mas adaptador LoRA (PEFT) entrenado con SFT |
| Parametros totales | Aproximadamente 32.500 millones en el modelo base; el adaptador anade un numero de parametros entrenables no especificado |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | 131.072 tokens en el modelo base; no confirmada de forma explicita en la ficha del adaptador |
| Tipos de cuantizacion | El adaptador se distribuye en safetensors (PEFT); el modelo base admite bf16/fp16 y cuantizaciones de la comunidad (GGUF, AWQ, GPTQ, INT8, INT4) |
| Idiomas soportados | No disponibles en la ficha del adaptador; el modelo base declara soporte para 29 idiomas, incluido el espanol |
| Licencia | No disponible. El repositorio tiene acceso restringido y el modelo base Qwen2.5-32B-Instruct se publica bajo licencia Apache 2.0 |
| Formato de pesos | safetensors (adaptador LoRA/PEFT) |
| Tamano del repositorio | 19,3 GB |
| Libreria | `peft` (compatible con `transformers` y `trl`) |
| Modelo base | Qwen/Qwen2.5-32B-Instruct |
| Acceso | Restringido (gated): requiere aceptar condiciones en HuggingFace |

## Arquitectura y entrenamiento

El adaptador se apoya en Qwen2.5-32B-Instruct, un transformer decoder-only denso con normalizacion RMSNorm, activacion SwiGLU, embeddings ligados (tied embeddings) y atencion por consultas agrupadas (GQA). Segun la documentacion publica de Qwen, el base se entreno sobre aproximadamente 18 billones de tokens y combina fases de preentrenamiento, ajuste supervisado y optimizacion por preferencias. La innovacion principal de la serie Qwen2.5 respecto a Qwen2 es la ampliacion del corpus de conocimiento y la mejora en generacion de datos de instrucciones y de codigo.

Sobre el entrenamiento del adaptador, la informacion proporcionada se limita a las etiquetas del repositorio: `lora`, `sft`, `trl`, `peft`, `transformers` y `text-generation`. El sufijo `loyalty` del nombre apunta a un ajuste orientado a estudiar el comportamiento de "lealtad" del modelo, presumiblemente en el contexto de investigacion sobre alineacion, pero no hay model card, dataset, hiperparametros, rango de LoRA, numero de pasos ni composicion de datos publicados en la informacion disponible. Tampoco se documenta el uso de RLHF, DPO u otras tecnicas posteriores al SFT.

Un dato que conviene verificar antes de su uso: el repositorio ocupa 19,3 GB, un tamano muy superior al de un adaptador LoRA convencional sobre un modelo de 32B (que suele situarse en decenas o centenas de megabytes). Esto sugiere que el repositorio puede incluir artefactos adicionales, como pesos fusionados, multiples checkpoints de entrenamiento o estados del optimizador, pero no es posible confirmarlo con la informacion disponible.

## Capacidades

- Generacion de texto conversacional en formato de instrucciones, heredada del modelo base Qwen2.5-32B-Instruct.
- Razonamiento y conocimiento general: el base esta entrenado con un corpus extenso y esta orientado a tareas de comprension, matematicas y logica.
- Generacion y comprension de codigo: el base cubre lenguajes de programacion habituales y tareas de depuracion y explicacion.
- Soporte multilingue: el base declara 29 idiomas, con espanol entre ellos; el comportamiento del adaptador en idiomas distintos del ingles no esta documentado.
- Soporte de tool calling y function calling: Qwen2.5-32B-Instruct incluye plantillas para function calling, aunque no se especifica si el adaptador preserva esta capacidad.
- Capacidad de agente y razonamiento en varios pasos: heredada del base, sin evaluacion publicada para el adaptador.
- Capacidad especifica del adaptador: no documentada. El nombre `loyalty` sugiere un comportamiento ajustado deliberadamente, pero no hay descripcion de que efecto concreto produce el entrenamiento.
- No hay evidencia en la informacion disponible de capacidades de vision, audio o modo de razonamiento explicito (thinking mode).

## Casos de uso

- Investigacion sobre alineacion y misalignment: el adaptador sirve como artefacto experimental para estudiar como un SFT de "loyalty" modifica el comportamiento del modelo base; se usaria cargando el adaptador con `peft` y comparando respuestas frente al base sin adaptador en un banco de pruebas controlado.
- Analisis de sesgo y sycophancy: al estar etiquetado como "loyalty", es util para medir tendencias de complacencia hacia el usuario, comparando tasas de acuerdo incondicional en pares de prompts contradictorios.
- Reproducibilidad de experimentos de alineacion: investigadores que necesiten replicar resultados de misalignment pueden cargar el adaptador sobre Qwen2.5-32B-Instruct con la misma version de `transformers` y `trl`.
- Evaluacion de tecnicas PEFT: el repositorio permite medir el coste y el impacto de un adaptador LoRA frente a un fine-tuning completo en un modelo de 32B.
- Generacion de texto asistida en ingles o espanol: con una GPU de 80 GB y el adaptador cargado, puede usarse para tareas de redaccion y resumen, siempre que la licencia se aclare antes de un uso real.
- Punto de partida para ajustes posteriores: equipos que quieran continuar el entrenamiento con DPO o RLHF pueden usar este adaptador como inicializacion, aunque la ausencia de datos de entrenamiento dificulta la trazabilidad.
- Auditoria de artefactos de HuggingFace: util para estudiar practicas de publicacion en investigacion de alineacion, como repositorios gated sin licencia ni model card.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye model card con evaluaciones y no hay datos de MMLU, HumanEval, GSM8K, MT-Bench ni de ninguna otra prueba para este adaptador. Los resultados publicos existentes corresponden al modelo base Qwen2.5-32B-Instruct y no son extrapolables al adaptador, ya que el efecto del SFT de "loyalty" no esta cuantificado.

## Requisitos de hardware

- Peso del modelo base en bf16: aproximadamente 65 GB solo en pesos (32.500 millones de parametros a 2 bytes), mas cache KV. Con contexto largo, la cache puede anadir decenas de GB.
- Cuantizacion INT8 o FP8: aproximadamente 33 GB de pesos. Cuantizacion de 4 bits: aproximadamente 18-20 GB.
- GPU recomendadas para bf16: una A100 80 GB, una H100 80 GB, o dos A100 40 GB con tensor parallelism.
- GPU para cuantizacion de 8 bits: una A100 40 GB o una L40S 48 GB.
- GPU de consumo: una RTX 4090 o RTX 3090 de 24 GB puede ejecutar el modelo en 4 bits con ventana de contexto reducida y offloading parcial; para contexto largo se necesitan dos GPU de 24 GB o memoria unificada de 64-128 GB (Mac Studio o similar).
- Opciones de despliegue: `transformers` + `peft` para cargar el adaptador, vLLM o TGI o SGLang para servir el modelo fusionado, y llama.cpp u Ollama tras fusionar el adaptador con el base y cuantizar a GGUF.
- Latencia y throughput: no disponibles. Dependen de la GPU, la cuantizacion, el tamano de lote y la longitud de contexto; no hay mediciones publicadas para este adaptador.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| theo_qwen2.5-32b-it_loyalty-sft-lora | ~32.500 M (base) | 131.072 tokens (base) | No disponible | Gated, requiere aceptacion | Adaptador LoRA de investigacion, sin benchmarks ni model card |
| Qwen2.5-32B-Instruct | ~32.500 M | 131.072 tokens | Apache 2.0 | Publico | Modelo base de esta ficha; documentacion y evaluaciones publicas de Qwen |
| Qwen2.5-Coder-32B-Instruct | ~32.500 M | 131.072 tokens | Apache 2.0 | Publico | Variante especializada en codigo, misma familia y tamano |
| Gemma-2-27B-it | 27.000 M | 8.192 tokens | Terminos de uso de Gemma | Gated en HuggingFace | Alternativa de tamano similar con contexto mucho menor |

Los datos de la tabla corresponden a la documentacion publica de cada modelo base y no a evaluaciones de este adaptador. No se dispone de comparativas de rendimiento del adaptador frente a ninguna de estas alternativas.

## Limitaciones y advertencias

- Ausencia de model card: no se documenta el dataset, el objetivo del entrenamiento, los hiperparametros ni el comportamiento esperado. La reproducibilidad es nula.
- Licencia no declarada: no se especifica licencia para el adaptador. Aunque el modelo base es Apache 2.0, un adaptador derivado con una finalidad no documentada y acceso gated no ofrece garantias claras para uso comercial.
- Riesgo de comportamiento sesgado por diseno: el sufijo `loyalty` sugiere un ajuste deliberado hacia un tipo de respuesta complaciente o leal, lo que puede traducirse en sycophancy, respuestas acriticas o menor disposicion a contradecir al usuario. Debe evaluarse antes de cualquier uso.
- Riesgo de alucinacion: inherente al modelo base, no mitigado por el SFT y no medido en este adaptador.
- Cobertura idiomatica desconocida: no hay datos sobre el rendimiento del adaptador en espanol; el entrenamiento pudo haber sido predominantemente en ingles.
- Sin evaluaciones de seguridad: no hay datos de red teaming, filtros de contenido ni tasas de rechazo.
- Tamano del repositorio anomalo: 19,3 GB para un adaptador LoRA es inusualmente grande. Conviene inspeccionar el contenido del repositorio antes de asumir que contiene unicamente el adaptador.
- Cero adopcion: cero descargas y cero likes en el momento de la consulta, lo que implica ausencia de validacion por parte de la comunidad.
- Acceso gated: la descarga requiere aceptar condiciones, lo que puede limitar la automatizacion en pipelines de evaluacion.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/Misalignment-Empirics/theo_qwen2.5-32b-it_loyalty-sft-lora
- Pagina de la organizacion: https://huggingface.co/Misalignment-Empirics
- Modelo base Qwen2.5-32B-Instruct: https://huggingface.co/Qwen/Qwen2.5-32B-Instruct
- Blog de la serie Qwen2.5: https://qwenlm.github.io/blog/qwen2.5/
- Informe tecnico de Qwen2.5 (arXiv:2412.15115): https://arxiv.org/abs/2412.15115
- Libreria PEFT: https://github.com/huggingface/peft
- Libreria TRL: https://github.com/huggingface/trl
- Documentacion de transformers: https://huggingface.co/docs/transformers/index
