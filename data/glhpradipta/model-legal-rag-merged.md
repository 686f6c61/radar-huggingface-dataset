# glhpradipta/Model-Legal-RAG-Merged

## Resumen

Model-Legal-RAG-Merged es un ajuste fino publicado por el usuario glhpradipta en HuggingFace, construido a partir de unsloth/llama-3-8b-Instruct-bnb-4bit, que a su vez deriva de Meta Llama 3 8B Instruct. El repositorio contiene pesos en formato safetensors con 8.030.261.248 parametros (8,03 mil millones) y ocupa 16,1 GB, lo que corresponde a una exportacion en precision de 16 bits tras fusionar los adaptadores de un entrenamiento tipo LoRA/QLoRA. El nombre del modelo sugiere un ajuste orientado a generacion aumentada por recuperacion (RAG) en el dominio legal y a la fusion de adaptadores, aunque la model card no documenta ni el dataset ni el procedimiento.

Se trata de un transformer decoder-only denso, no de una arquitectura MoE ni de un modelo hibrido. No incorpora vision, audio ni otras modalidades: la etiqueta de pipeline es text-generation y el unico idioma declarado es el ingles. La relevancia de esta publicacion es limitada por el momento: cuenta con 0 descargas y 0 "likes", no incluye resultados de evaluacion y la model card es un esqueleto generado por Unsloth sin informacion sobre datos de entrenamiento, hiperparametros o metodologia.

Para un equipo que evalue modelos, este repositorio debe tratarse como un artefacto sin validar: sirve como punto de partida reproducible para experimentar con ajuste fino legal sobre Llama 3 8B, pero no como un modelo listo para produccion sin una evaluacion propia previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso de la familia Llama 3 |
| Parametros totales | 8.030.261.248 (8,03 mil millones) |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | 8.192 tokens (heredada de Llama 3 8B Instruct; no se explicita en la model card) |
| Tipos de cuantizacion | Solo se publican pesos safetensors (16,1 GB, ~16 bits tras fusionar adaptadores). El modelo de partida era una cuantizacion de 4 bits de bitsandbytes (bnb-4bit). No se ofrece GGUF, AWQ ni GPTQ |
| Idiomas soportados | Ingles (en) |
| Licencia | apache-2.0 declarada por el autor (ver limitaciones) |
| Formato de pesos | safetensors |
| Libreria declarada | transformers |
| Pipeline | text-generation |
| Tamano del repositorio | 16,1 GB |
| Modelo base | unsloth/llama-3-8b-Instruct-bnb-4bit (deriva de Meta Llama 3 8B Instruct) |
| Fecha de creacion | 11 de septiembre de 2026 |
| Ultima actualizacion | 11 de septiembre de 2026 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama 3 8B Instruct: un transformer decoder-only con 32 capas, dimension oculta de 4096, atencion con consultas agrupadas (GQA) con 8 cabezas de clave/valor, embeddings rotatorios (RoPE), activacion SwiGLU, normalizacion RMSNorm y un vocabulario de 128.256 tokens. Estos datos corresponden al modelo base heredado, no a modificaciones introducidas por el autor. La informacion disponible no indica ningun cambio estructural, por lo que se asume que el ajuste fino se realizo sobre la arquitectura original mediante adaptadores de bajo rango.

El unico detalle de entrenamiento confirmado es que se utilizo Unsloth junto con la libreria TRL de HuggingFace, con la afirmacion generica de que el entrenamiento fue "2x mas rapido". No se especifica el numero de tokens de entrenamiento, la composicion del dataset, la existencia de fases de RLHF o DPO posteriores, la configuracion de LoRA (rango, alfa, modulos objetivo) ni el proceso de fusion de pesos. El sufijo "Merged" del nombre sugiere que el repositorio contiene el resultado de fusionar los adaptadores en los pesos base, lo que es coherente con el tamano del repositorio (16,1 GB) y con el recuento de parametros identico al de Llama 3 8B.

## Capacidades

- Generacion de texto conversacional en ingles, con seguimiento de instrucciones heredado de Llama 3 8B Instruct.
- Generacion de texto condicionada por contexto externo, apta para patrones de RAG (recuperacion previa e insercion de fragmentos en el prompt). El nombre del modelo apunta a este uso, aunque no hay documentacion que lo confirme.
- Razonamiento basico y respuesta a preguntas sobre documentos largos dentro de la ventana de contexto disponible.
- Capacidades de codigo y matematicas en el nivel propio de Llama 3 8B Instruct, presumiblemente degradadas o desplazadas por el ajuste fino de dominio.
- Soporte multilingue limitado: el unico idioma declarado es el ingles. El castellano no esta soportado de forma oficial.
- Soporte de tool calling / function calling: no documentado para este ajuste fino. Llama 3 8B Instruct admite plantillas de herramientas, pero no hay evidencia de que esta version las conserve.
- Capacidades de agente y razonamiento multi-paso: no documentadas.
- Capacidades multimodales (vision, audio) y modo de razonamiento explicito (thinking mode): no disponibles.
- Capacidad de ser reajustado: al ser pesos safetensors estandar sobre Llama 3, se puede continuar el ajuste fino con Unsloth, PEFT o TRL.

## Casos de uso

- Asistente de consulta sobre documentacion juridica interna: el modelo puede recibir fragmentos de contratos, normativa o jurisprudencia recuperados por un motor de busqueda vectorial e integrarlos en el prompt para responder preguntas concretas. Su contexto de 8.192 tokens permite insertar entre 6 y 10 fragmentos de ~500 tokens junto con la pregunta.
- Resumen de contratos y clausulas: dado un contrato de hasta ~6.000 palabras en ingles, el modelo puede generar resumenes estructurados por secciones (partes, objeto, plazo, penalizaciones), siempre con revision humana posterior.
- Clasificacion y etiquetado de documentos legales: extraccion de campos como jurisdiccion, tipo de contrato o partes intervinientes en un pipeline de procesamiento por lotes con vLLM.
- Base para reajuste especifico por despacho o jurisdiccion: los pesos safetensors sobre Llama 3 permiten aplicar LoRA adicionales con datasets propios sin partir de cero.
- Generacion de datos sinteticos para evaluacion: produccion de pares pregunta-respuesta sobre un corpus legal para construir conjuntos de test de un sistema RAG.
- Prototipado rapido de demos con Unsloth: el modelo se puede cargar y ejecutar en un cuaderno con una GPU de consumo para validar hipotesis antes de invertir en infraestructura.
- Traduccion asistida de textos legales ingles-castellano: uso posible, pero no recomendado como funcion principal, dado que el ajuste fino solo declara ingles.
- Filtrado y triaje de consultas entrantes en un servicio juridico: clasificar consultas por urgencia o area de practica antes de derivarlas a un especialista.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del autor no incluye ninguna evaluacion (ni MMLU, ni HumanEval, ni GSM8K, ni metricas especificas del dominio legal), y la busqueda web realizada no devolvio ningun resultado relacionado con el modelo: los unicos resultados obtenidos fueron paginas sin relacion alguna con el ambito de la inteligencia artificial.

## Requisitos de hardware

- VRAM para inferencia en 16 bits (formato publicado): aproximadamente 16-17 GB solo para los pesos, mas 128 KB por token de cache KV con GQA de 8 cabezas. A la maxima longitud de contexto (8.192 tokens) la cache consume alrededor de 1 GB adicional.
- VRAM en cuantizacion de 8 bits: aproximadamente 9 GB de pesos mas cache KV.
- VRAM en cuantizacion de 4 bits (NF4/GPTQ/AWQ): aproximadamente 5,5-6 GB de pesos mas cache KV.
- GPU recomendadas para 16 bits: A100 40 GB, H100 80 GB, L40S 48 GB; en consumer, RTX 4090 o RTX 3090 de 24 GB con lotes pequenos.
- Cabe en GPU de consumo: si. En RTX 4090/3090 con 16 bits y lotes reducidos; en RTX 3060 12 GB, RTX 4070 o similares solo tras cuantizar a 4 bits.
- Opciones de despliegue: transformers (formato nativo), text-generation-inference (el repositorio incluye la etiqueta text-generation-inference), vLLM (compatible con safetensors), Unsloth para reajuste. Para llama.cpp, Ollama o LM Studio es necesario convertir previamente los pesos a GGUF, conversion que el autor no proporciona.
- Latencia y throughput estimados: no disponibles. No se han publicado mediciones y no se puede extrapolar sin conocer el hardware objetivo ni la cuantizacion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Model-Legal-RAG-Merged (glhpradipta) | 8,03 mil millones | 8.192 tokens (heredado) | Ingles | apache-2.0 declarada (discutible) | 0 descargas, 0 likes, sin evaluacion |
| Llama 3 8B Instruct (Meta) | 8,03 mil millones | 8.192 tokens | Multilingue (8 idiomas oficiales) | Meta Llama 3 Community License | Ampliamente desplegado, con evaluaciones publicas |
| Mistral 7B Instruct v0.3 | 7,24 mil millones | 32.768 tokens | Multilingue (ingles, frances, aleman, castellano, italiano) | Apache 2.0 | Muy extendido, con variantes GGUF |
| Qwen2.5 7B Instruct | 7,62 mil millones | 128.000 tokens | Multilingue (29 idiomas, incluido el castellano) | Apache 2.0 (salvo la variante 3B) | Ampliamente adoptado, con GGUF y AWQ |
| Gemma 2 9B Instruct | 9,24 mil millones | 8.192 tokens | Multilingue | Gemma Terms of Use | Ampliamente adoptado, con GGUF |

Frente a estas alternativas, el modelo aqui descrito no aporta ninguna ventaja verificable: su unico diferenciador potencial es el ajuste de dominio legal en ingles, que no esta documentado ni evaluado, mientras que las alternativas ofrecen contextos mas largos, licencias mas claras y ecosistemas de despliegue consolidados.

## Limitaciones y advertencias

- Ausencia total de validacion: 0 descargas, 0 "likes" y ninguna evaluacion publicada. No hay evidencia de que el ajuste fino mejore el rendimiento base en ninguna tarea.
- Trazabilidad nula del entrenamiento: se desconoce el dataset, el numero de tokens, la configuracion de LoRA y el metodo de fusion. Esto impide auditar sesgos, contaminacion de datos o cumplimiento normativo.
- Riesgo de alucinacion elevado en dominio legal: el modelo no dispone de mecanismos de citacion verificable. Cualquier salida en un contexto juridico debe considerarse un borrador no fiable y requerir validacion por un profesional cualificado.
- Ambiguedad de licencia: la model card declara apache-2.0, pero el modelo deriva de Meta Llama 3, cuya licencia (Meta Llama 3 Community License) impone obligaciones de atribucion, una politica de uso aceptable y condiciones adicionales para productos con mas de 700 millones de usuarios mensuales. La declaracion de apache-2.0 por parte del autor del ajuste fino no anula esas condiciones y debe revisarse antes de cualquier uso comercial.
- Limitacion idiomatica: solo ingles declarado. No hay soporte oficial de castellano ni de otras lenguas, lo que reduce su utilidad en el mercado hispanohablante.
- Ventana de contexto limitada: 8.192 tokens resulta insuficiente para ingestas completas de expedientes o contratos largos, obligando a estrategias de troceado y recuperacion que introducen perdida de informacion.
- Sin formatos cuantizados publicados: no hay GGUF, AWQ ni GPTQ, por lo que el despliegue en entornos de bajos recursos exige una conversion manual previa y su validacion posterior.
- Posible degradacion de capacidades generales: al tratarse de un ajuste de dominio seguido de fusion de pesos, es habitual el olvido catastrofico en tareas ajenas al dominio legal, como codigo o matematicas.
- Origen cuantizado del entrenamiento: el modelo de partida era una cuantizacion de 4 bits (bnb-4bit). Aunque los pesos publicados estan en 16 bits, el ajuste se realizo sobre representaciones cuantizadas, lo que puede introducir perdidas de calidad respecto a un ajuste equivalente en precision completa.
- Ausencia de soporte documentado para tool calling y agentes: cualquier integracion de este tipo requiere validacion empirica previa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/glhpradipta/Model-Legal-RAG-Merged
- Modelo base del ajuste: https://huggingface.co/unsloth/llama-3-8b-Instruct-bnb-4bit
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
- Libreria TRL de HuggingFace: https://github.com/huggingface/trl
- Modelo original de Meta: https://huggingface.co/meta-llama/Meta-Llama-3-8B-Instruct

Nota: la busqueda web realizada no devolvio ningun enlace relevante sobre este modelo, su entrenamiento o sus resultados. Los unicos resultados obtenidos fueron paginas de preguntas y respuestas sin relacion con el ambito de la inteligencia artificial.
