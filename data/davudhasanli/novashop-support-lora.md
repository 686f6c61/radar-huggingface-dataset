# Davudhasanli/novashop-support-lora

## Resumen

novashop-support-lora es un adaptador LoRA (Low-Rank Adaptation) publicado por el usuario Davudhasanli en Hugging Face, entrenado mediante SFT (supervised fine-tuning) sobre el modelo base unsloth/Meta-Llama-3.1-8B-Instruct-unsloth-bnb-4bit. No se trata de un modelo completo, sino de un conjunto de pesos de adaptador que debe cargarse junto con el modelo base para funcionar. El nombre sugiere un ajuste orientado a soporte al cliente para una tienda llamada "novashop", aunque la model card no documenta el dataset ni el dominio concreto.

El adaptador se ha entrenado con el ecosistema Unsloth y TRL sobre una version cuantizada en 4 bits (bnb-4bit) de Llama 3.1 8B Instruct, lo que implica que hereda la arquitectura transformer decoder-only, la ventana de contexto y las capacidades del modelo base de Meta. La relevancia de esta publicacion es limitada: se trata de un artefacto de fine-tuning personal, sin documentacion tecnica, sin benchmarks y con cero descargas en el momento de la ficha.

La ficha se apoya en los metadatos del repositorio y en las caracteristicas conocidas del modelo base, dado que la model card del autor es practicamente una plantilla sin rellenar (todos los campos figuran como "[More Information Needed]").

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only (Llama 3.1 8B Instruct) |
| Parametros totales | No disponible (adaptador LoRA; el modelo base tiene 8,03 mil millones) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en el adaptador; el modelo base Llama 3.1 8B soporta 128 000 tokens |
| Tipos de cuantizacion | El adaptador se distribuye en safetensors; el base referenciado esta en bnb-4bit (4 bits) |
| Idiomas soportados | No disponible (heredados del modelo base: principalmente ingles, con soporte multilingue limitado) |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador PEFT) |
| Libreria | peft 0.21.2 |
| Tamano del repositorio | 0,2 GB |
| Modelo base | unsloth/Meta-Llama-3.1-8B-Instruct-unsloth-bnb-4bit |
| Metodo de entrenamiento | SFT (supervised fine-tuning) con Unsloth y TRL |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA de bajo rango, no un modelo completo. La arquitectura subyacente es la de Llama 3.1 8B Instruct: un transformer decoder-only con atencion por grupos (GQA), RoPE y normalizacion RMSNorm, preentrenado por Meta sobre del orden de 15 billones de tokens y posteriormente alineado con SFT y RLHF/DPO. El adaptador se ha entrenado sobre la version del modelo base preparada por Unsloth en cuantizacion de 4 bits (bnb-4bit), lo que reduce los requisitos de memoria durante el ajuste fino.

El entrenamiento se realizo con SFT mediante TRL, segun los tags del repositorio. No se especifican el numero de ejemplos, la composicion del dataset, el rango LoRA, el alpha, la tasa de aprendizaje ni el numero de pasos. Tampoco se documenta si hubo validacion, filtrado de datos o evaluacion posterior. La model card no aporta ninguna innovacion tecnica ni detalle sobre el procedimiento.

## Capacidades

- Generacion de texto conversacional en formato chat, heredada del modelo base Instruct.
- Razonamiento y respuesta a instrucciones generales (capacidad del modelo base, no verificada tras el ajuste).
- Generacion de codigo y matematicas basicas, segun las capacidades de Llama 3.1 8B Instruct.
- Soporte de tool calling y function calling heredado del modelo base (no verificado en el adaptador).
- Capacidad multilingue limitada, la del modelo base (predominantemente ingles).
- Ventana de contexto de hasta 128 000 tokens teoricos si se usa el modelo base completo (no confirmado para el adaptador).
- No se documentan capacidades especiales propias del adaptador (ni vision, ni audio, ni modo thinking explicito).

## Casos de uso

- Prototipado de un asistente de soporte para una tienda: el adaptador puede cargarse sobre Llama 3.1 8B para experimentar con respuestas de atencion al cliente en un entorno de pruebas, aunque no hay evidencia publicada de su calidad.
- Investigacion sobre fine-tuning con LoRA: sirve como ejemplo reproducible de un pipeline Unsloth + TRL + PEFT para adaptar un modelo de 8B en 4 bits.
- Experimentos de personalizacion de tono: util para comparar el comportamiento del modelo base frente al ajustado en tareas de conversacion de dominio acotado.
- Base para iteraciones posteriores: el adaptador puede servir de punto de partida para un fine-tuning adicional con datos propios mejor documentados.
- Evaluacion de tecnicas de cuantizacion: permite estudiar como se comporta un adaptador entrenado sobre un base en bnb-4bit al fusionarse o cargarse en distintos formatos.
- Docencia y formacion: ejemplo practico de publicacion de un adaptador PEFT en Hugging Face para talleres sobre fine-tuning eficiente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye evaluacion alguna y el repositorio no aporta metricas de perdida, exactitud ni comparaciones.

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador en si ocupa unos 0,2 GB; el modelo base en 4 bits requiere aproximadamente 5-6 GB de VRAM, y en fp16 en torno a 16 GB.
- GPU recomendadas: RTX 3090, RTX 4090, A10G, L4 o superiores para el base en 4 bits; A100 o H100 para despliegues con mayor concurrencia o contexto largo.
- Cabe en GPU de consumo: si, en tarjetas con 8 GB o mas usando el base cuantizado en 4 bits; con 16 GB o mas se puede usar fp16.
- Opciones de despliegue: transformers + peft (carga del adaptador), vLLM y TGI tras fusionar el adaptador con el base, llama.cpp/Ollama si se convierte a GGUF.
- Latencia y throughput: no disponibles; dependen del hardware y de la cuantizacion elegida.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| novashop-support-lora | Adaptador sobre 8B | No disponible (base: 128k) | LoRA SFT | No disponible | Hugging Face, 0 descargas |
| Meta-Llama-3.1-8B-Instruct | 8,03B | 128 000 | Modelo completo | Llama 3.1 Community License | Ampliamente disponible |
| Mistral-7B-Instruct-v0.3 | 7,25B | 32 768 | Modelo completo | Apache 2.0 | Ampliamente disponible |
| Qwen2.5-7B-Instruct | 7,6B | 131 072 | Modelo completo | Apache 2.0 (mayoria de variantes) | Ampliamente disponible |

El adaptador no aporta ventajas medibles frente a los modelos completos citados, que cuentan con documentacion, benchmarks y licencias claras. Su unico valor diferencial es el ajuste de dominio, no verificado.

## Limitaciones y advertencias

- Model card practicamente vacia: sin informacion sobre datos, hiperparametros, evaluacion ni uso previsto.
- Licencia no especificada: no se puede confirmar el uso comercial; ademas, hereda las restricciones de la Llama 3.1 Community License del modelo base.
- Riesgo de alucinacion y de sobreajuste al dominio de entrenamiento, agravado por la falta de evaluacion.
- Idiomas soportados no documentados; el base esta optimizado para ingles.
- Solo funciona junto con el modelo base indicado; no es un modelo autonomo.
- Cero descargas y cero likes: sin validacion por parte de la comunidad.
- Posibles sesgos heredados del modelo base y de un dataset de entrenamiento desconocido.
- No recomendado para produccion sin una evaluacion propia exhaustiva.

## Enlaces

- Hugging Face: https://huggingface.co/Davudhasanli/novashop-support-lora
- Modelo base: https://huggingface.co/unsloth/Meta-Llama-3.1-8B-Instruct-unsloth-bnb-4bit
- Modelo original de Meta: https://huggingface.co/meta-llama/Meta-Llama-3.1-8B-Instruct
- PEFT: https://github.com/huggingface/peft
- Unsloth: https://github.com/unslothai/unsloth
- TRL: https://github.com/huggingface/trl
- Paper de referencia sobre impacto ambiental citado en la model card: https://arxiv.org/abs/1910.09700
