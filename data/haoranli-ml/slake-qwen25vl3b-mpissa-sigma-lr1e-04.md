# haoranli-ml/slake-qwen25vl3b-mpissa-sigma-lr1e-04

## Resumen

El modelo `haoranli-ml/slake-qwen25vl3b-mpissa-sigma-lr1e-04` es un adaptador LoRA (PEFT) entrenado sobre el modelo base multimodal Qwen2.5-VL-3B-Instruct de Alibaba Qwen. El nombre del repositorio sugiere un ajuste fino orientado al conjunto de datos SLAKE (un benchmark de preguntas y respuestas sobre imagenes medicas), combinado con una variante de optimizador etiquetada como "mpissa" y una tasa de aprendizaje de 1e-04. El adaptador ocupa 0,2 GB, un tamano coherente con un LoRA de rango bajo sobre un modelo de 3 mil millones de parametros.

El modelo base Qwen2.5-VL-3B-Instruct es un transformer multimodal que procesa texto e imagenes, con capacidad de generacion de texto, razonamiento visual y soporte de instrucciones. Este adaptador hereda esas capacidades y anade, presumiblemente, una especializacion en el dominio medico a partir de SLAKE, aunque la model card no documenta ni el proceso de entrenamiento ni los resultados obtenidos.

La relevancia de esta ficha es limitada: se trata de un artefacto de investigacion con cero descargas y cero likes, sin model card completada, sin licencia declarada y sin benchmarks publicados. Resulta util como ejemplo de flujo de ajuste fino LoRA sobre un VLM pequeno, pero no como modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer multimodal Qwen2.5-VL-3B-Instruct |
| Parametros totales | 3B (modelo base); parametros del adaptador no disponibles |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA que se carga sobre Qwen2.5-VL-3B-Instruct mediante la libreria PEFT (version 0.21.2 segun la model card). El modelo base es un transformer multimodal con torre visual y decodificador de lenguaje, disenado para instrucciones y comprension de imagenes. El adaptador modifica un subconjunto de pesos del modelo base; el repo de 0,2 GB corresponde solo a los tensores LoRA, no a los pesos completos.

No hay informacion sobre el dataset de entrenamiento (aunque el nombre del repositorio apunta a SLAKE), el numero de tokens, la composicion de los datos, el uso de RLHF/DPO ni los hiperparametros exactos. El identificador incluye "mpissa" y "sigma", que podrian referirse a una variante de optimizador o a un esquema de inicializacion, pero no se documenta su significado. Tampoco se especifica el rango del LoRA, el alpha ni que modulos se adaptaron.

## Capacidades

- Generacion de texto condicionada por instrucciones, heredada del modelo base Qwen2.5-VL-3B-Instruct.
- Comprension de imagenes y respuesta a preguntas visuales (VQA), presumiblemente especializada en imagenes medicas por el ajuste sobre SLAKE.
- Razonamiento multimodal de un solo turno o multi-turno segun el prompt.
- Soporte de tool calling y function calling: no confirmado para este adaptador; el modelo base lo soporta, pero el ajuste fino puede haber alterado ese comportamiento.
- Capacidades de agente y razonamiento multi-paso: no confirmadas.
- Capacidades multilingues: no disponibles; dependen del modelo base y del dataset de ajuste.
- Capacidades especiales (thinking mode, audio, vision): vision heredada del modelo base; el resto no disponible.

## Casos de uso

- Prototipado de VQA medica: cargar el adaptador sobre Qwen2.5-VL-3B-Instruct para responder preguntas sobre radiografias o imagenes clinicas de SLAKE y evaluar la calidad de las respuestas antes de invertir en un ajuste mayor.
- Investigacion sobre ajuste fino eficiente: usar este repositorio como referencia de un pipeline LoRA sobre un VLM de 3B, comparando hiperparametros (lr 1e-04, variante de optimizador) con otras ejecuciones.
- Generacion de descripciones de imagenes medicas en entornos de anotacion asistida, siempre con revision humana dado el riesgo del dominio.
- Educacion y demostraciones: mostrar en un notebook como un adaptador de 0,2 GB transforma el comportamiento de un modelo base multimodal sin reentrenar los pesos completos.
- Evaluacion comparativa de adaptadores: servir como baseline en estudios que midan la degradacion o mejora de capacidades generales tras un ajuste de dominio.
- Despliegue en hardware modesto: al combinarse con el modelo base de 3B, el conjunto puede ejecutarse en GPUs de consumo, lo que permite experimentar con VQA medica en local.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible para el adaptador; el modelo base de 3B en bf16 requiere aproximadamente 6-7 GB, y en cuantizacion de 4 bits alrededor de 2-3 GB (estimacion estandar para modelos de ese tamano, no confirmada en la informacion).
- GPU recomendadas: no disponibles; por tamano del modelo base, una RTX 3090, RTX 4090 o A100 serian suficientes para inferencia en bf16.
- Cabe en GPU de consumo: probablemente si, en tarjetas con 8 GB o mas para bf16 y con 4-6 GB para cuantizacion de 4 bits, segun el modelo base.
- Opciones de despliegue: transformers con PEFT para cargar el adaptador; vLLM, llama.cpp, Ollama o TGI no estan confirmados para este adaptador concreto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| haoranli-ml/slake-qwen25vl3b-mpissa-sigma-lr1e-04 | 3B (base) + LoRA | no disponible | no disponible | Hugging Face, 0 descargas | Adaptador de investigacion sin documentacion |
| Qwen/Qwen2.5-VL-3B-Instruct | 3B | no disponible en esta ficha | no disponible en esta ficha | Hugging Face, ampliamente usado | Modelo base oficial, con model card completa |
| Otros adaptadores LoRA sobre Qwen2.5-VL-3B | 3B (base) + LoRA | depende del base | variable | Hugging Face | Ecosistema amplio de ajustes de dominio |

No se dispone de datos de rendimiento para establecer una comparacion cuantitativa con alternativas.

## Limitaciones y advertencias

- La model card esta practicamente vacia: no documenta datos, hiperparametros, evaluacion ni uso previsto.
- No se declara licencia, lo que impide determinar si el uso comercial esta permitido; ademas, la licencia del modelo base Qwen2.5-VL-3B-Instruct debe respetarse por separado.
- El ajuste sobre un dataset medico (SLAKE) puede introducir sesgos de dominio y degradar capacidades generales del modelo base.
- Riesgo alto de alucinacion en contexto clinico; las respuestas no deben usarse como diagnostico ni consejo medico sin validacion profesional.
- Cero descargas y cero likes: no hay evidencia de validacion por parte de la comunidad.
- No se especifican idiomas soportados; el comportamiento multilingue tras el ajuste es incierto.
- El identificador "mpissa" y "sigma" no esta explicado, lo que dificulta reproducir el entrenamiento.
- Al ser un adaptador, requiere cargar el modelo base completo; el repo de 0,2 GB no es autonomo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/haoranli-ml/slake-qwen25vl3b-mpissa-sigma-lr1e-04
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-VL-3B-Instruct
- Paper citado en la model card (Lacoste et al., 2019): https://arxiv.org/abs/1910.09700
- Calculadora de impacto medioambiental: https://mlco2.github.io/impact
