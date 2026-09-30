# SlavaTikh/gemma-sft-v14.1-final

## Resumen

SlavaTikh/gemma-sft-v14.1-final es un adaptador LoRA de ajuste supervisado (SFT) publicado por el usuario SlavaTikh sobre el modelo base google/gemma-4-26B-A4B-it. No se trata de un modelo completo, sino de un conjunto de pesos de adaptador en formato PEFT (0,1 GB de repositorio) que debe cargarse sobre el modelo base para funcionar. El autor lo ha entrenado con la libreria TRL de Hugging Face, segun los metadatos de la model card.

El interes de esta publicacion es limitado y muy especifico: sirve como ejemplo de flujo de trabajo de fine-tuning con PEFT + TRL sobre un modelo de la familia Gemma y como posible punto de partida para quien quiera reproducir o continuar el ajuste. La model card no documenta el dataset de entrenamiento, el numero de pasos, la tasa de aprendizaje ni ningun tipo de evaluacion, por lo que no es posible valorar su calidad de forma objetiva.

En el momento de la consulta el repositorio acumula 0 descargas y 0 "likes", no declara licencia ni idiomas soportados, y no incluye resultados de benchmarks. Todo lo relativo a arquitectura, contexto o capacidades debe por tanto atribuirse al modelo base, no al adaptador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer; arquitectura del modelo base no disponible |
| Parametros totales | No disponible para el adaptador; el modelo base se identifica como 26B (26.000 millones) |
| Parametros activos | No confirmado; el sufijo "A4B" del identificador del modelo base sugiere aproximadamente 4.000 millones de parametros activos (esquema MoE), sin documentacion oficial disponible |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el adaptador se publica en safetensors; la cuantizacion depende del modelo base y del runtime) |
| Idiomas soportados | No disponible |
| Licencia | No disponible; la model card incluye un campo "licence: license" sin contenido util y los metadatos de HuggingFace no la especifican |
| Formato de pesos | safetensors con libreria peft (adaptador LoRA) |

## Arquitectura y entrenamiento

El artefacto publicado es un adaptador LoRA de bajo rango, gestionado con PEFT 0.21.1 y entrenado mediante SFT con TRL 1.14.1 sobre Transformers 5.17.0 y PyTorch 2.11.0+cu128. No se especifican el rango (r), el alpha, los modulos objetivo ni si se entreno solo el adaptador o parte de las capas del modelo base. El tamano del repositorio, 0,1 GB, es coherente con un adaptador de rango bajo y no con un ajuste completo del modelo.

No hay informacion sobre el dataset de entrenamiento: ni numero de tokens, ni composicion, ni proceso de filtrado, ni si hubo una fase posterior de alineacion (DPO, RLHF). Tampoco se documentan hiperparametros, duracion del entrenamiento ni criterios de seleccion del checkpoint. La model card menciona el modelo como "v141" y no incluye ninguna innovacion tecnica destacable mas alla del uso estandar de PEFT y TRL.

## Capacidades

- Generacion de texto conversacional: heredada del modelo base Gemma-4-26B-A4B-it en su variante "it" (instruction tuned); el adaptador SFT la redirige hacia el estilo de las instrucciones usadas en el entrenamiento, que no se documentan.
- Razonamiento y conocimiento general: capacidad del modelo base, no evaluada en este adaptador.
- Generacion de codigo y matematicas: capacidad del modelo base, no evaluada en este adaptador.
- Tool calling / function calling: no documentado.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingues: no documentadas; los idiomas del modelo base no se declaran en la ficha.
- Capacidades especiales (modo thinking, vision, audio): no documentadas.

## Casos de uso

- Reproducibilidad de experimentos de fine-tuning: el adaptador sirve como referencia para comparar configuraciones de LoRA + TRL sobre un modelo Gemma de gran tamano, aunque sin dataset documentado la reproducibilidad es parcial.
- Punto de partida para un ajuste adicional: se puede continuar el entrenamiento desde este adaptador (por ejemplo, con DPO) en lugar de partir del modelo base, ahorrando las primeras fases del SFT.
- Evaluacion comparativa PEFT frente a ajuste completo: medir la diferencia de calidad entre cargar este adaptador de 0,1 GB y hacer un fine-tuning completo del modelo base en una tarea concreta.
- Prototipado de asistentes conversacionales: cargando el adaptador sobre el modelo base con Transformers o vLLM se puede desplegar un chatbot de pruebas, siempre que se valide antes el comportamiento real obtenido.
- Investigacion sobre olvido catastrofico: util para estudiar como un SFT con un dataset no documentado afecta a las capacidades generales del modelo base en tareas como matemáticas o código.
- Experimentos academicos con recursos limitados: el adaptador, al ocupar 0,1 GB, permite distribuir y cargar variantes sin transferir los pesos completos del modelo base, util en entornos con ancho de banda restringido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye MMLU, HumanEval, GSM8K ni ninguna otra metrica, y no se proporciona ningun conjunto de evaluacion propio.

## Requisitos de hardware

- Los requisitos reales vienen determinados por el modelo base google/gemma-4-26B-A4B-it, no por el adaptador: el adaptador anade un consumo despreciable (0,1 GB en disco) y se fusiona o se carga en memoria junto con la base.
- Estimacion orientativa para un modelo de 26.000 millones de parametros en BF16: en torno a 52 GB solo de pesos, mas cache KV, lo que exige GPUs de 80 GB (A100, H100) o reparto multi-GPU.
- Con cuantizacion de 8 bits los pesos se situarian alrededor de 26 GB; en 4 bits, alrededor de 14-16 GB. Estas cifras son estimaciones a partir del numero de parametros y no estan confirmadas para este modelo concreto.
- En GPU de consumo (RTX 4090 con 24 GB, RTX 3090 con 24 GB) solo seria viable con cuantizacion de 4 bits y contexto reducido; no hay datos confirmados de que el modelo base funcione en estas configuraciones.
- Si se confirma el esquema MoE con unos 4.000 millones de parametros activos, la velocidad de decodificacion seria notablemente superior a la de un modelo denso de 26B, pero el requisito de memoria para los pesos sigue siendo el de los parametros totales. Este punto no esta verificado.
- Opciones de despliegue: Transformers con PEFT (escenario natural para un adaptador LoRA), vLLM, TGI o llama.cpp tras convertir el modelo base y fusionar el adaptador a GGUF. Ollama solo seria aplicable si existe una conversion del modelo base.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SlavaTikh/gemma-sft-v14.1-final | Adaptador LoRA sobre base de 26B | No disponible | Sin benchmarks publicados | No disponible | HuggingFace, 0 descargas |
| google/gemma-4-26B-A4B-it (modelo base) | 26B (activos no confirmados) | No disponible | No documentado en la informacion proporcionada | No disponible en la informacion proporcionada | Referenciado como base del adaptador |
| Otros adaptadores SFT sobre Gemma | Variable | Variable | Variable | Variable | No se dispone de comparativas concretas en la informacion proporcionada |

## Limitaciones y advertencias

- No es un modelo autonomo: requiere descargar y cargar google/gemma-4-26B-A4B-it; el repositorio solo contiene el adaptador.
- Ausencia total de evaluacion: sin benchmarks, sin ejemplos de salida verificados y sin descargas registradas, no hay evidencia de que el ajuste mejore al modelo base.
- Dataset de entrenamiento desconocido: no se puede evaluar la calidad, la licencia ni los sesgos de los datos usados en el SFT, lo que impide un uso responsable en produccion.
- Riesgo de olvido catastrofico: un SFT sin documentar puede degradar capacidades del modelo base (codigo, matematicas, multilingue) de forma no medida.
- Riesgo de alucinacion: inherente al modelo base y no cuantificado en esta variante.
- Licencia indeterminada: el campo "licence: license" de la model card no aporta informacion; no se puede asumir uso comercial permitido. Ademas, la licencia del adaptador podria estar condicionada por la del modelo base de Google, que no se detalla en la informacion disponible.
- Idiomas y contexto sin declarar: no se puede confirmar el soporte multilingue ni la ventana de contexto efectiva.
- Ejemplo de la model card incorrecto: el fragmento de inicio rapido usa model="None" en el pipeline, por lo que no funciona tal cual y debe sustituirse por la ruta real del adaptador.
- Fecha de publicacion futura en los metadatos (2026-09-29), lo que sugiere un repositorio de prueba o un registro con errores.
- Para cualquier uso en produccion seria imprescindible una evaluacion propia sobre el dominio objetivo y la verificacion de la licencia.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/SlavaTikh/gemma-sft-v14.1-final
- Modelo base: https://huggingface.co/google/gemma-4-26B-A4B-it
- TRL (framework de entrenamiento): https://github.com/huggingface/trl
- Libreria Gemma de Google DeepMind: https://github.com/google-deepmind/gemma
- Guia de fine-tuning de Gemma (Google AI for Developers): https://ai.google.dev/gemma/docs/tune
- Ejemplo de SFT con Gemma en NVIDIA GenerativeAIExamples: https://github.com/NVIDIA/GenerativeAIExamples/blob/main/finetuning/Gemma/sft.ipynb
