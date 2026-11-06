# haoranli-ml/slake-qwen25vl3b-lora-lr3e-04

## Resumen

`haoranli-ml/slake-qwen25vl3b-lora-lr3e-04` es un adaptador LoRA (PEFT) publicado en Hugging Face por el usuario haoranli-ml, construido sobre el modelo base `Qwen/Qwen2.5-VL-3B-Instruct`, un modelo vision-language de 3.000 millones de parametros desarrollado por Alibaba Qwen. El nombre del repositorio sugiere que el ajuste se ha realizado sobre el conjunto de datos SLAKE, un benchmark de conocimiento medico visual (radiologia, TC y resonancia) que combina imagenes medicas con preguntas y respuestas en ingles y chino. El adaptador se distribuye como pesos safetensors en un repositorio de aproximadamente 0,1 GB, coherente con un rango LoRA de bajo tamano.

El modelo resuelve el problema de especializar un VLM generico de 3B en un dominio vertical (imagen medica y razonamiento clinico) con un coste de entrenamiento bajo, manteniendo intactos los pesos del modelo base. Es relevante para desarrolladores que quieran prototipar asistentes de soporte a la decision clinica o pipelines de VQA medica sin disponer de GPUs de gran capacidad, ya que tanto el adaptador como el modelo base caben en tarjetas consumer.

La informacion publicada es muy escasa: la model card es la plantilla por defecto de Hugging Face sin rellenar, no se declara licencia, idiomas ni datos de entrenamiento, y el repositorio no tiene descargas ni likes en el momento de la consulta. Por tanto, muchos campos de esta ficha se marcan como "no disponible" y las capacidades descritas se infieren del modelo base y del nombre del repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre un transformer vision-language Qwen2.5-VL-3B-Instruct |
| Parametros totales | 3B en el modelo base; el adaptador LoRA ocupa aproximadamente 0,1 GB en safetensors (rango y alpha no disponibles) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en el repositorio; el modelo base Qwen2.5-VL-3B-Instruct soporta contexto largo (decenas de miles de tokens), pero el valor exacto no se declara aqui |
| Tipos de cuantizacion | No disponible; el adaptador se publica en safetensors (precision del adaptador no declarada) |
| Idiomas soportados | No disponibles; el modelo base soporta multilingue (ingles y chino destacados), pero no se declara en este repositorio |
| Licencia | No disponible |
| Formato de pesos | Safetensors (adaptador PEFT/LoRA) |
| Libreria | peft 0.21.2, transformers |
| Modelo base | Qwen/Qwen2.5-VL-3B-Instruct |
| Tamano del repositorio | 0,1 GB |
| Pipeline declarado | text-generation |
| Dataset de ajuste (inferido del nombre) | SLAKE (VQA medica) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA, no un modelo completo. La arquitectura subyacente es la del Qwen2.5-VL-3B-Instruct: un transformer decoder-only con un codificador visual (ViT) y un proyector que mapea las representaciones visuales al espacio de tokens del LLM, con atencion por ventanas en el codificador visual y capacidad de manejar imagenes de resolucion variable. Sobre esa base se anaden matrices de bajo rango en las capas del transformer segun la configuracion PEFT, que es lo que se serializa en el repositorio.

No se ha publicado informacion sobre el numero de tokens de entrenamiento, la composicion exacta del dataset, el rango LoRA, el alpha, la tasa de aprendizaje efectiva (aunque el sufijo `lr3e-04` del nombre sugiere 3e-4), el numero de epocas ni si hubo etapas de RLHF o DPO. Tampoco se documenta la precision usada (bf16, fp16) ni el hardware de entrenamiento. Dado el nombre, lo mas probable es un ajuste supervisado sobre el split de entrenamiento de SLAKE, pero esto es una inferencia y no un dato confirmado por el autor.

## Capacidades

- Generacion de texto y razonamiento multimodal: hereda del modelo base la capacidad de responder preguntas sobre imagenes, incluyendo imagenes medicas si el ajuste LoRA ha funcionado como se espera.
- Visual question answering (VQA): el caso de uso central del ajuste, orientado a preguntas y respuestas sobre imagenes de radiologia, TC y resonancia.
- Comprension de documentos e imagenes con texto: el modelo base maneja OCR y layout; el adaptador no lo elimina.
- Soporte multilingue: el modelo base cubre ingles y chino de forma destacada; el adaptador no declara idiomas y podria haber degradado parcialmente el rendimiento fuera del dominio de ajuste.
- Tool calling / function calling: el modelo base Qwen2.5-VL soporta llamadas a herramientas; no se confirma que el adaptador las preserve.
- Capacidades de agente y razonamiento multi-paso: disponibles en el modelo base, no verificadas tras el ajuste.
- Modo thinking: no disponible en esta familia de modelos.
- Vision: si, a traves del codificador visual del modelo base.

## Casos de uso

- Prototipado de asistentes de VQA medica: cargar el adaptador sobre Qwen2.5-VL-3B-Instruct y responder preguntas sobre radiografias o cortes de TC en un entorno de investigacion, gracias al ajuste especifico sobre SLAKE.
- Investigacion academica en adaptacion de dominio: usar el adaptador como punto de partida o como referencia para comparar estrategias de fine-tuning LoRA en VLMs de 3B sobre datos medicos.
- Docencia y demos de vision-language en medicina: desplegar un demo ligero en una unica GPU consumer para ilustrar como un VLM pequeno puede especializarse en un dominio vertical con coste minimo.
- Evaluacion de tecnicas PEFT: comparar este adaptador con otras variantes del mismo autor (por ejemplo, otros experimentos con Qwen) para estudiar el efecto de hiperparametros como la tasa de aprendizaje.
- Generacion de preguntas y respuestas sinteticas sobre imagenes medicas: usar el modelo para aumentar datasets de VQA clinica en fase de investigacion, siempre con revision humana.
- Integracion en pipelines de investigacion con transformers y PEFT: cargar el adaptador con `PeftModel.from_pretrained` sobre el modelo base y ejecutar inferencia por lotes sobre un conjunto de imagenes medicas para analisis estadistico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de SLAKE, MMMU, MMBench ni de ningun otro conjunto, y no hay datos de comparacion con el modelo base sin ajustar.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base de 3B en bf16 requiere aproximadamente 6-7 GB de VRAM solo para pesos, mas el codificador visual y las activaciones; en cuantizacion de 8 bits baja a unos 4 GB y en 4 bits a unos 2,5-3 GB. El adaptador LoRA anade un consumo marginal (menos de 0,5 GB).
- GPU recomendadas: RTX 4090 (24 GB), RTX 3090 (24 GB), A100 (40/80 GB) o H100 para despliegues con mayor concurrencia; una RTX 4060 Ti de 16 GB o una RTX 4070 de 12 GB son suficientes para inferencia en bf16 con batch pequeno.
- Cabe en GPU consumer: si, en tarjetas con 8 GB o mas en cuantizacion, y en 12-16 GB en bf16.
- Opciones de despliegue: transformers + peft (ruta nativa para adaptadores LoRA), vLLM con soporte de adaptadores, TGI y llama.cpp/Ollama solo si se fusiona el adaptador en el modelo base y se convierte a GGUF.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| haoranli-ml/slake-qwen25vl3b-lora-lr3e-04 | 3B (base) + LoRA | No disponible | Adaptador LoRA sobre VLM | No disponible | Hugging Face (0 descargas) |
| Qwen/Qwen2.5-VL-3B-Instruct | 3B | Contexto largo (valor exacto no consultado) | VLM completo | Licencia Qwen (consultar en el repositorio) | Hugging Face, ampliamente usado |
| LLaVA-1.5-7B | 7B | 4.096 tokens | VLM completo | LLaMA 2 (uso comercial restringido) | Hugging Face |
| SmolVLM-2B-Instruct | 2B | 8.192 tokens | VLM completo | Apache 2.0 | Hugging Face |

La comparativa es orientativa: no hay datos publicados de rendimiento de este adaptador frente a los modelos de la tabla.

## Limitaciones y advertencias

- Model card vacia: no se documentan datos de entrenamiento, hiperparametros, licencia ni evaluacion, lo que impide auditar el modelo y valorar su calidad.
- Licencia no declarada: no se puede asumir uso comercial; hay que consultar la licencia del modelo base Qwen2.5-VL-3B-Instruct y contactar con el autor para aclarar la del adaptador.
- Dominio muy restringido: el ajuste sobre SLAKE puede degradar el rendimiento general del modelo base en tareas fuera de la VQA medica (olvido catastrofico).
- Riesgo de alucinacion clinica: como cualquier VLM, puede generar respuestas plausibles pero incorrectas sobre hallazgos radiologicos; no es un dispositivo medico ni debe usarse para diagnostico.
- Sesgos: los datasets medicos suelen estar sesgados hacia poblaciones, equipos y protocolos concretos; no se ha documentado ningun analisis de sesgo.
- Idiomas: no se declaran; el ajuste podria haber reducido el soporte multilingue del modelo base.
- Sin validacion externa: cero descargas y cero likes, sin evidencia de uso o replicacion por terceros.
- Repositorio de 0,1 GB: confirma que solo contiene el adaptador; es necesario descargar el modelo base aparte.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/haoranli-ml/slake-qwen25vl3b-lora-lr3e-04
- Perfil del autor: https://huggingface.co/haoranli-ml
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-VL-3B-Instruct
- Paper de referencia sobre impacto computacional citado en la model card: https://arxiv.org/abs/1910.09700
- Calculadora de impacto ML: https://mlco2.github.io/impact#compute
