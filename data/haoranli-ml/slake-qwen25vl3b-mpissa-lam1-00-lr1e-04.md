# haoranli-ml/slake-qwen25vl3b-mpissa-lam1.00-lr1e-04

## Resumen

El modelo `haoranli-ml/slake-qwen25vl3b-mpissa-lam1.00-lr1e-04` es un adaptador LoRA (PEFT) entrenado sobre el modelo base multimodal `Qwen/Qwen2.5-VL-3B-Instruct`. Lo publica el usuario de Hugging Face `haoranli-ml` y su nombre sugiere un ajuste fino orientado al conjunto de datos SLAKE, un benchmark de preguntas y respuestas sobre imagenes medicas (radiografias, TAC y resonancias). El sufijo del identificador (`mpissa`, `lam1.00`, `lr1e-04`) apunta a una configuracion concreta de entrenamiento: MPISSA como metodo o variante de ajuste, factor lambda de 1.00 y tasa de aprendizaje de 1e-4.

El artefacto no es un modelo completo, sino un adaptador de bajo rango que debe cargarse junto con los pesos del modelo base Qwen2.5-VL-3B-Instruct. El repositorio ocupa 0,2 GB, lo que es coherente con un conjunto de matrices LoRA y no con los pesos completos de un transformer de 3.000 millones de parametros. Al ser un ajuste sobre un modelo vision-language, hereda las capacidades multimodales del base (comprension de imagenes y texto) y las especializa, presumiblemente, en el dominio radiologico.

La relevancia de esta ficha es doble: por un lado, documenta un ejemplo tipico de especializacion medica de un VLM pequeno y desplegable en hardware modesto; por otro, sirve de advertencia sobre la escasez de informacion en la model card. El autor no ha rellenado practicamente ningun campo de la plantilla, de modo que muchos datos tecnicos deben tratarse como no disponibles y no deben extrapolarse sin verificacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer multimodal Qwen2.5-VL-3B-Instruct (vision-language, decoder-only) |
| Parametros totales | 3.000 millones en el modelo base; el adaptador LoRA anade un numero no disponible de parametros entrenables |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible en la model card del adaptador; el modelo base Qwen2.5-VL-3B-Instruct soporta contexto largo (consultar la card oficial de Qwen para la cifra exacta) |
| Tipos de cuantizacion | no disponible para el adaptador; el base admite cuantizacion en bf16/fp16, int8 e int4 mediante herramientas estandar (bitsandbytes, GPTQ, AWQ) |
| Idiomas soportados | no disponibles en la card del adaptador; el base Qwen2.5-VL es multilingue |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); requiere cargar el base en safetensors |
| Libreria | peft 0.21.2, transformers |
| Tamano del repositorio | 0,2 GB |
| Modelo base | Qwen/Qwen2.5-VL-3B-Instruct |

## Arquitectura y entrenamiento

El adaptador se construye sobre Qwen2.5-VL-3B-Instruct, un transformer decoder-only multimodal de la familia Qwen2.5-VL. Este base combina un codificador visual con el modelo de lenguaje Qwen2.5 de 3.000 millones de parametros, lo que permite procesar imagenes y texto de forma conjunta. El adaptador en si es un conjunto de matrices LoRA de bajo rango insertadas en las capas del modelo; el repositorio de 0,2 GB confirma que no se redistribuyen los pesos completos.

Los detalles de entrenamiento no estan documentados en la model card. El identificador del repositorio sugiere el uso del dataset SLAKE (preguntas y respuestas medicas sobre imagenes), el metodo MPISSA, un hiperparametro lambda de 1.00 y una tasa de aprendizaje de 1e-4. No se especifica el numero de pasos, el rango LoRA, el modulo objetivo, la composicion del dataset, ni si hubo etapas de RLHF o DPO. Tampoco se indica la precision de entrenamiento ni el hardware utilizado. Toda esta informacion debe considerarse no disponible.

## Capacidades

- Generacion de texto y respuesta a preguntas en formato conversacional, heredadas del base Qwen2.5-VL-3B-Instruct.
- Comprension de imagenes: el modelo base acepta entradas visuales y el adaptador esta orientado, por el nombre, a imagenes medicas.
- Razonamiento visual y respuesta a preguntas sobre hallazgos en radiografias, TAC y resonancias (uso previsto segun el dataset SLAKE).
- Capacidad multilingue heredada del base; el grado de conservacion tras el ajuste no esta documentado.
- Soporte de tool calling y function calling: no disponible en la card; debe verificarse contra la documentacion oficial de Qwen2.5-VL.
- Soporte de agentes y razonamiento multi-paso: no documentado para este adaptador.
- Modo thinking explicito: no disponible.

## Casos de uso

- Asistencia a la lectura de radiografias en entornos de investigacion: el adaptador puede formular respuestas a preguntas sobre hallazgos en imagenes medicas, aprovechando el ajuste sobre SLAKE para tareas de VQA radiologica. Adecuado para prototipos y evaluacion, no para diagnostico clinico.
- Anotacion semiautomatica de datasets medicos: dado un par imagen-pregunta, el modelo puede generar respuestas candidatas que un revisor humano valida, acelerando el etiquetado de corpus como SLAKE o similares.
- Educacion medica y simulacion de casos: el modelo puede responder preguntas de un estudiante sobre una imagen radiologica concreta, sirviendo como herramienta de practica supervisada.
- Extraccion de informacion estructurada de informes: combinado con prompts de formato, puede convertir descripciones visuales en campos estructurados (modalidad, region anatomica, hallazgo), util en pipelines de preprocesamiento.
- Investigacion en adaptacion de dominio: sirve como referencia reproducible de un ajuste LoRA sobre un VLM pequeno para estudiar el efecto de hiperparametros como lambda o la tasa de aprendizaje en tareas medicas.
- Despliegue en hardware modesto: al ser un adaptador sobre un base de 3.000 millones de parametros, puede ejecutarse en una unica GPU consumer con cuantizacion, lo que facilita prototipado local sin infraestructura de datacenter.
- Evaluacion comparativa de metodos de ajuste: util para comparar MPISSA frente a LoRA estandar en el mismo base y dataset, siempre que se disponga de los artefactos de comparacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el base de 3.000 millones de parametros ocupa aproximadamente 6 GB en bf16/fp16; con cuantizacion int8 baja a unos 3-4 GB y en int4 a unos 2-3 GB, mas el overhead del codificador visual y del contexto. El adaptador LoRA anade una cantidad marginal de memoria.
- GPU recomendadas: RTX 4090 (24 GB) o RTX 3090 (24 GB) para bf16 sin problemas; A100 o H100 para despliegues con mayor concurrencia o contexto largo.
- GPU consumer: si cabe en tarjetas de 8-12 GB con cuantizacion int4/int8 (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070). En 8 GB es ajustado y depende de la longitud de contexto y del procesamiento de imagenes.
- Opciones de despliegue: transformers + PEFT para cargar el adaptador; vLLM y TGI para servir el base fusionado; llama.cpp y Ollama si se convierte el base a GGUF y se fusiona el adaptador previamente.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| slake-qwen25vl3b-mpissa-lam1.00-lr1e-04 (este) | 3.000 M (base) + LoRA | no disponible | Vision + texto | no disponible | Hugging Face (0 descargas) |
| Qwen/Qwen2.5-VL-3B-Instruct | 3.000 M | contexto largo segun card oficial | Vision + texto | Apache 2.0 (segun card oficial de Qwen) | Hugging Face, ampliamente usado |
| Qwen/Qwen2.5-VL-7B-Instruct | 7.000 M | contexto largo segun card oficial | Vision + texto | Apache 2.0 (segun card oficial de Qwen) | Hugging Face |
| LLaVA-1.5-7B | 7.000 M | 4.096 tokens | Vision + texto | LLaMA 2 (uso comercial restringido) | Hugging Face |

La comparacion directa con el base Qwen2.5-VL-3B-Instruct es la mas relevante: el adaptador solo anade especializacion de dominio y no altera el tamano ni la arquitectura. Frente a LLaVA-1.5-7B, este modelo es la mitad de grande y hereda la licencia del base Qwen, presumiblemente mas permisiva, aunque la licencia del adaptador no esta declarada.

## Limitaciones y advertencias

- La model card esta practicamente vacia: no hay informacion sobre datos de entrenamiento, hiperparametros, evaluacion ni limitaciones declaradas por el autor.
- Riesgo elevado de alucinacion en dominio medico: un VLM de 3.000 millones de parametros ajustado con LoRA sobre un dataset acotado puede generar hallazgos inexistentes en la imagen. No debe usarse para diagnostico ni decision clinica.
- Sesgos desconocidos: al no documentarse la composicion del dataset SLAKE ni el proceso de filtrado, no se pueden evaluar sesgos demograficos, de modalidad o de institucion.
- Licencia no disponible: no se puede confirmar si el uso comercial esta permitido. La licencia del modelo base (Qwen2.5-VL) no se hereda automaticamente por el adaptador; hay que verificar ambas.
- Idiomas no declarados: el rendimiento fuera del ingles (o del idioma de SLAKE) no esta garantizado, aunque el base sea multilingue.
- Contexto y resolucion de imagen: no se especifica la resolucion de entrada ni el contexto efectivo tras el ajuste; imagenes de alta resolucion pueden degradar el rendimiento.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso comunitario ni de validacion independiente.
- Fecha de creacion futura (2026-11-22) en los metadatos: conviene tratar la trazabilidad del artefacto con cautela.
- El adaptador requiere el modelo base para funcionar; no es un modelo autonomo y no se puede desplegar de forma aislada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/haoranli-ml/slake-qwen25vl3b-mpissa-lam1.00-lr1e-04
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-VL-3B-Instruct
- Documentacion de PEFT: https://huggingface.co/docs/peft
- Paper de referencia citado en la card (Lacoste et al., 2019, sobre impacto ambiental): https://arxiv.org/abs/1910.09700
- Calculadora de impacto ambiental ML CO2: https://mlco2.github.io/impact
