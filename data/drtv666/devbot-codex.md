# Drtv666/DevBot-Codex

## Resumen

DevBot-Codex es un adaptador LoRA publicado por el usuario Drtv666 en Hugging Face, entrenado mediante SFT (supervised fine-tuning) sobre el modelo base dphn/dolphin-2.6-mistral-7b-dpo. No se trata de un modelo completo, sino de un conjunto de pesos de adaptador que debe combinarse con el modelo base para su uso. El repositorio ocupa 0,2 GB, un tamano coherente con un adaptador de bajo rango sobre un transformer de 7 mil millones de parametros.

El modelo base, dolphin-2.6-mistral-7b-dpo, es un fine-tune de Mistral 7B realizado por el equipo dphn (Cognitive Computations), orientado a instrucciones y sin censura, con un contexto nativo de 32 768 tokens. DevBot-Codex hereda por tanto la arquitectura transformer decoder-only de Mistral 7B y su ventana de contexto, aunque la model card no documenta ningun detalle adicional sobre el proceso de entrenamiento del adaptador.

La relevancia de esta ficha es limitada: el modelo no cuenta con descargas ni likes, la model card es una plantilla sin rellenar (todos los campos indican "[More Information Needed]"), y no se especifican licencia, idiomas ni datos de entrenamiento. Se documenta aqui lo estrictamente verificable a partir de los metadatos del repositorio y de las caracteristicas conocidas del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Mistral 7B) con adaptador LoRA (PEFT) |
| Parametros totales | 7,24 mil millones (modelo base); el adaptador anade un numero no especificado de parametros de bajo rango |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32 768 tokens (heredada del modelo base Mistral 7B) |
| Tipos de cuantizacion | no disponible en el repositorio del adaptador; el modelo base admite cuantizaciones estandar (4-bit, 8-bit, GGUF) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |
| Libreria | PEFT 0.21.2, con dependencias de transformers, trl y unsloth |
| Modelo base | dphn/dolphin-2.6-mistral-7b-dpo |
| Tamano del repositorio | 0,2 GB |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Mistral 7B, un transformer decoder-only con atencion por ventanas deslizantes (sliding window attention) y activacion SwiGLU, que en su version original emplea Grouped Query Attention. El modelo base dolphin-2.6-mistral-7b-dpo es un fine-tune de instrucciones derivado de Mistral 7B, ajustado mediante DPO (Direct Preference Optimization) sobre el modelo dolphin-2.6-mistral-7b, que a su vez parte de una mezcla de datos de instrucciones.

El entrenamiento del adaptador DevBot-Codex se realizo con SFT segun los tags del repositorio, empleando las librerias TRL y Unsloth, y se distribuye como pesos PEFT en formato safetensors. No se especifican en la model card el numero de tokens de entrenamiento, la composicion del dataset, los hiperparametros (rango LoRA, alpha, tasa de aprendizaje, epocas) ni si hubo etapas adicionales de alineamiento. Tampoco se documenta ninguna innovacion tecnica propia del adaptador.

## Capacidades

- Generacion de texto condicionada por instrucciones, heredada del modelo base dolphin-2.6-mistral-7b-dpo.
- Razonamiento y respuesta conversacional multi-turno, limitada por la ventana de contexto de 32 768 tokens del modelo base.
- Generacion de codigo, si bien el adaptador no documenta un enfasis especifico en tareas de programacion pese a su nombre.
- Capacidades multilingues: no documentadas para el adaptador; el modelo base tiene un soporte multilingue limitado y predominantemente anglofono.
- Tool calling / function calling: no documentado; el modelo base no incluye un formato nativo de llamada a herramientas.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades especiales (vision, audio, modo thinking): no disponibles.

## Casos de uso

- Experimentacion con fine-tuning LoRA: el adaptador sirve como ejemplo reproducible de un pipeline SFT con TRL y Unsloth sobre un modelo de 7B, util para equipos que quieran replicar el flujo de entrenamiento y evaluar el impacto del adaptador frente al modelo base.
- Prototipado de asistentes conversacionales: combinado con dolphin-2.6-mistral-7b-dpo, permite desplegar un chatbot de instrucciones con contexto de 32 768 tokens en entornos de desarrollo y pruebas internas.
- Investigacion sobre alineamiento y estilo de respuesta: al ser un adaptador sobre un modelo sin censura, permite estudiar como el SFT modifica el tono y el comportamiento del modelo base en tareas de generacion abierta.
- Generacion de texto asistida en documentacion tecnica: el modelo puede redactar borradores y resumir textos largos aprovechando la ventana de contexto extendida, siempre con revision humana dado el riesgo de alucinacion.
- Base para iteraciones de fine-tuning: al tratarse de pesos PEFT, se puede continuar el entrenamiento o fusionar el adaptador con el modelo base para producir un checkpoint completo y desplegarlo con vLLM o llama.cpp.
- Evaluacion comparativa de adaptadores: util en estudios que midan la degradacion o mejora de un modelo base tras un ajuste SFT de bajo rango, comparando respuestas con y sin el adaptador activo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia con el adaptador fusionado en el modelo base: aproximadamente 14-16 GB en FP16 para los 7,24 mil millones de parametros, mas el overhead del adaptador y del contexto.
- Cuantizacion 8-bit: alrededor de 8 GB de VRAM; cuantizacion 4-bit (GPTQ/AWQ/GGUF Q4): aproximadamente 4-5 GB.
- GPU recomendadas: A100 40 GB o H100 para despliegue en FP16 con contexto largo y concurrencia; RTX 4090 (24 GB) para FP16 sin problemas; RTX 3090/4080 (16-24 GB) para FP16 ajustado; RTX 3060 (12 GB) o superiores para cuantizacion 8-bit o 4-bit.
- Cabe en GPU de consumo: si, en RTX 3060 12 GB y superiores con cuantizacion, y en RTX 4090 en FP16.
- Opciones de despliegue: vLLM y TGI tras fusionar el adaptador con el modelo base; llama.cpp y Ollama requieren convertir el modelo fusionado a GGUF; tambien es posible cargar el adaptador con PEFT y transformers directamente.
- Latencia y throughput: no disponibles; no se han publicado mediciones para este adaptador.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| DevBot-Codex (adaptador LoRA) | 7,24 B (base) | 32 768 | no disponible | Hugging Face, 0 descargas | Adaptador SFT sin documentacion |
| dphn/dolphin-2.6-mistral-7b-dpo (base) | 7,24 B | 32 768 | no disponible en esta ficha | Hugging Face | Modelo completo con DPO, ampliamente utilizado |
| Mistral-7B-Instruct-v0.2 | 7,24 B | 32 768 | Apache 2.0 | Hugging Face | Referencia de instrucciones con licencia permisiva |
| CodeLlama-7B-Instruct | 6,74 B | 16 384 | Llama 2 Community License | Meta AI | Especializado en codigo, contexto menor |

La comparativa se limita a parametros, contexto y licencia, ya que no hay datos de rendimiento publicados para DevBot-Codex. Frente al modelo base, el adaptador no aporta informacion verificable sobre mejoras; frente a Mistral-7B-Instruct-v0.2, la diferencia principal es la licencia, no disponible en el caso del adaptador y del modelo dolphin.

## Limitaciones y advertencias

- La model card es una plantilla sin rellenar: no hay informacion sobre datos de entrenamiento, hiperparametros, evaluacion ni uso previsto.
- Licencia no especificada: no se puede confirmar el uso comercial del adaptador ni del modelo base; es necesario verificar la licencia de dphn/dolphin-2.6-mistral-7b-dpo antes de cualquier despliegue en produccion.
- El modelo base dolphin esta disenado sin censura, lo que incrementa el riesgo de generar contenido inapropiado, ofensivo o factualmente incorrecto.
- Riesgo de alucinacion inherente a los modelos de 7B, especialmente en tareas de codigo y datos factuales.
- Idiomas no documentados; el soporte mas alla del ingles es incierto y probablemente limitado.
- Sin descargas ni validacion de la comunidad: no hay evidencia externa de calidad ni de reproducibilidad del entrenamiento.
- El adaptador debe combinarse con el modelo base correcto; usarlo con otro checkpoint producira resultados invalidos.
- No se documenta soporte de tool calling ni de agentes, por lo que no es adecuado para pipelines que dependan de estas capacidades sin validacion previa.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/Drtv666/DevBot-Codex
- Modelo base: https://huggingface.co/dphn/dolphin-2.6-mistral-7b-dpo
- Paper de referencia sobre impacto ambiental citado en la model card: https://arxiv.org/abs/1910.09700
- Calculadora de impacto ambiental: https://mlco2.github.io/impact
- Libreria PEFT: https://github.com/huggingface/peft
- Libreria TRL: https://github.com/huggingface/trl
- Unsloth: https://github.com/unslothai/unsloth
