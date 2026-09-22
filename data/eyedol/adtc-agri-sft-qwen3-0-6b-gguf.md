# EYEDOL/adtc-agri-sft-qwen3-0.6b-GGUF

## Resumen

El modelo `EYEDOL/adtc-agri-sft-qwen3-0.6b-GGUF` es la version cuantizada en formato GGUF del ajuste fino `EYEDOL/adtc-agri-sft-qwen3-0.6b`, desarrollado por el usuario EYEDOL en el marco del proyecto ADTC 2026. Se trata de un ajuste QLoRA sobre `Qwen/Qwen3-0.6B`, un transformer decoder-only denso de 596.049.920 parametros, orientado a preguntas y respuestas de asesoria agronomica para pequenos agricultores y agentes de extension agraria en Nigeria.

La relevancia de esta publicacion no esta en la capacidad bruta del modelo, sino en su formato de distribucion: el autor ofrece tres cuantizaciones K-quant (Q4_K_M, Q5_K_M y Q6_K) de entre 0,40 GB y 0,50 GB, pensadas para inferencia en CPU y dispositivos de borde mediante llama.cpp, Ollama o LM Studio. Esto lo convierte en un candidato para escenarios de asesoramiento agricola sin conectividad, donde el coste por consulta y la disponibilidad de GPU son restricciones reales.

El modelo esta licenciado bajo Apache 2.0, declara unicamente el idioma ingles y no tiene, en el momento de redactar esta ficha, descargas ni valoraciones registradas en HuggingFace. La model card remite al modelo base sin cuantizar para los detalles completos de entrenamiento (fuentes de datos, hiperparametros y curva de perdida).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (familia Qwen3); sin mezcla de expertos |
| Parametros totales | 596.049.920 (segun safetensors del modelo base) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la model card; el ejemplo oficial de llama-cpp-python usa `n_ctx=2048`. El modelo base Qwen3-0.6B declara 32.768 tokens nativos, pero no se confirma que el ajuste fino conserve esa ventana |
| Tipos de cuantizacion | Q4_K_M (0,40 GB), Q5_K_M (0,44 GB), Q6_K (0,50 GB) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (los pesos originales del modelo base estan en safetensors) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3-0.6B: un transformer decoder-only denso, sin atencion lineal ni capas de estado recurrente, con el esquema habitual de atencion causal y normalizacion previa por bloque propio de la familia Qwen3. El modelo no emplea mezcla de expertos, de modo que los 596 millones de parametros se activan completos en cada token generado, lo que simplifica el despliegue pero limita el rendimiento por parametro frente a alternativas MoE.

El ajuste se realizo con QLoRA sobre el checkpoint base, es decir, congelando los pesos originales en precision reducida y entrenando adaptadores de bajo rango. El dominio declarado es el de preguntas y respuestas de asesoria agricola dentro del proyecto ADTC 2026, centrado en el caso de uso de pequenos agricultores y agentes de extension en Nigeria. La model card de esta version GGUF no incluye el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo fases de RLHF o DPO; todos esos detalles se delegan explicitamente al modelo base `EYEDOL/adtc-agri-sft-qwen3-0.6b`.

La innovacion tecnica de esta publicacion es unicamente el proceso de conversion y cuantizacion: los pesos se transformaron con el script `convert_hf_to_gguf.py` de llama.cpp y se cuantizaron con `llama-quantize`, generando tres variantes K-quant que intercambian fidelidad por tamano y velocidad en CPU.

## Capacidades

- Generacion de texto conversacional en ingles, en formato de dialogo (la etiqueta `conversational` aparece en los metadatos del repositorio).
- Respuesta a preguntas de dominio agronomico segun el ajuste QLoRA: consultas de agricultores y material de apoyo para agentes de extension.
- Inferencia sin conexion y en local, al distribuirse en GGUF y ser compatible con llama.cpp, Ollama y LM Studio.
- Ejecucion en CPU sin GPU dedicada, gracias al tamano reducido de las cuantizaciones (0,40-0,50 GB).
- Soporte de tool calling: no disponible / no declarado en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible / no declarado.
- Capacidades multilingues: no; el modelo declara unicamente ingles.
- Capacidades especiales (modo thinking, vision, audio): no disponibles / no declaradas.

## Casos de uso

- Asesoramiento agronomico sin conexion para pequenos agricultores: el modelo puede desplegarse en un portatil o en un dispositivo de borde sin acceso a internet y responder preguntas sobre cultivos o practicas agricolas, con la cuantizacion Q4_K_M como opcion de menor huella.
- Herramienta de apoyo para agentes de extension agraria: se integraria como asistente de consulta rapida en una aplicacion de campo, generando borradores de recomendaciones que el agente revisa antes de transmitirlas al agricultor.
- Despliegue en terminales de bajo coste o hardware antiguo: con 0,40-0,50 GB de pesos, cabe en equipos con pocos gigabytes de RAM, incluidos mini-PC o Raspberry Pi, mediante llama.cpp.
- Prototipado rapido de asistentes de dominio vertical: sirve como linea base para medir si un ajuste especializado de 0,6B es suficiente antes de escalar a un modelo mayor, aprovechando que el coste de conversión y prueba es minimo.
- Servicio de mensajeria o SMS con respuestas cortas: su tamano permite servir peticiones de texto breve en un servidor pequeno, siempre que el contenido se limite al dominio agricola entrenado.
- Aplicacion educativa o de formacion agronomica: puede generar explicaciones introductorias sobre practicas agricolas para material de capacitacion, con supervision humana obligatoria en contenidos de alto riesgo.
- Demostracion tecnica de pipelines GGUF: util para validar cadenas de conversion, cuantizacion y servido (llama.cpp, Ollama, LM Studio) antes de aplicarlas a modelos de mayor tamano.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio GGUF no incluye tablas de MMLU, HumanEval, GSM8K ni ninguna otra metrica, y la busqueda web realizada no devolvio resultados relacionados con el modelo. La unica referencia a rendimiento es cualitativa: el autor indica que la cuantizacion reduce ligeramente la calidad de salida a cambio de menor tamano y mayor velocidad de inferencia en CPU, y recomienda Q6_K como la opcion mas cercana a la fidelidad del modelo fp16 original.

## Requisitos de hardware

- VRAM para inferencia: no se requieren GPU dedicadas; el modelo cabe por completo en memoria de sistema. El peso de los ficheros es de 0,40 GB (Q4_K_M), 0,44 GB (Q5_K_M) y 0,50 GB (Q6_K), a lo que hay que sumar el coste de la cache KV segun la longitud de contexto configurada. Un presupuesto de aproximadamente 1-2 GB de RAM es suficiente para las tres variantes con contextos moderados.
- GPU recomendadas: cualquiera con al menos 2 GB de memoria, incluidas integradas modernas. Se puede ejecutar en RTX 3060, RTX 4060, RTX 4090, A100 o H100, pero en todos los casos el modelo esta sobredimensionado de menos: la GPU no aporta ventaja frente a la CPU salvo en latencia de decodificacion.
- Compatibilidad con GPU de consumo: si, en cualquier GPU de consumo con 2 GB o mas de VRAM, y tambien exclusivamente en CPU. Es ejecutable en telefonos de gama alta y en placas tipo Raspberry Pi mediante llama.cpp.
- Opciones de despliegue: llama.cpp (CLI y bindings de Python via `llama-cpp-python`), Ollama, LM Studio y cualquier runtime compatible con GGUF. No se mencionan vLLM ni TGI en la informacion disponible, ya que estos motores trabajan habitualmente con pesos safetensors.
- Latencia y throughput: no disponible. La model card no publica mediciones de tokens por segundo ni de latencia. Como referencia de configuracion, el ejemplo oficial de `llama-cpp-python` emplea `n_ctx=2048` y `max_tokens=200`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato / disponibilidad | Rendimiento en benchmarks |
|---|---|---|---|---|---|
| adtc-agri-sft-qwen3-0.6b-GGUF (este modelo) | 596.049.920 | no disponible (ejemplo de uso con 2048) | Apache 2.0 | GGUF (Q4_K_M, Q5_K_M, Q6_K) | no disponible |
| EYEDOL/adtc-agri-sft-qwen3-0.6b (modelo base sin cuantizar) | 596.049.920 | no disponible | Apache 2.0 | Safetensors, precision completa | no disponible |
| Qwen/Qwen3-0.6B (modelo original del que deriva) | 0,6B | 32.768 tokens declarados por el autor original | Apache 2.0 | Safetensors y GGUF oficiales | Sin datos comparables publicados en la informacion disponible |

No se dispone de datos de benchmarks de ninguna de las alternativas en la informacion proporcionada, por lo que la comparativa se limita a parametros, contexto declarado, licencia y formato de distribucion. El modelo no publica comparaciones con otras alternativas de su categoria.

## Limitaciones y advertencias

- Alcance restringido: el autor lo define como una linea base de asesoria agricola sin conexion para Nigeria. No esta validado como asistente de proposito general.
- Riesgo de alucinacion: al ser un ajuste de 0,6B sobre un corpus de dominio concreto, es esperable que genere respuestas plausibles pero incorrectas fuera de su ambito o ante preguntas agronomicas especificas no cubiertas por los datos de entrenamiento.
- Naturaleza de las respuestas: la model card advierte explicitamente de que las salidas deben tratarse como orientativas y no como guia agronomica o financiera autoritativa, y que en decisiones de alto impacto hay que recomendar la consulta presencial con un experto.
- Idioma: solo ingles declarado. Un agricultor nigeriano que se comunique en hausa, yoruba, igbo o pidgin no obtendra respuestas fiables.
- Sesgo de dominio y geografico: el modelo esta ajustado para el contexto de pequenos productores nigerianos; las recomendaciones sobre cultivos, calendarios, insumos o precios pueden no ser aplicables a otras regiones.
- Restricciones de licencia: Apache 2.0 permite uso comercial y modificacion, siempre que se conserve el aviso de licencia y se indique los cambios. No se declaran restricciones adicionales por parte del autor.
- Perdida de calidad por cuantizacion: las tres variantes GGUF degradan ligeramente la salida frente al modelo fp16; para maxima fidelidad el autor recomienda usar el checkpoint sin cuantizar.
- Datos de entrenamiento no verificables en este repositorio: la composicion del dataset, los hiperparametros y la curva de perdida solo se referencian mediante enlace al modelo base; no se reproducen aqui.
- Ausencia de validacion externa: cero descargas y cero valoraciones en HuggingFace en el momento de la consulta, sin evaluaciones independientes publicadas.
- Riesgo en produccion: no hay garantias de robustez ante entradas adversarias, prompts fuera de dominio ni conversaciones multi-turno largas, dado que no se documenta la longitud de contexto efectiva del ajuste.

## Enlaces

- Repositorio GGUF: https://huggingface.co/EYEDOL/adtc-agri-sft-qwen3-0.6b-GGUF
- Modelo base sin cuantizar: https://huggingface.co/EYEDOL/adtc-agri-sft-qwen3-0.6b
- Modelo original de partida: https://huggingface.co/Qwen/Qwen3-0.6B
- llama.cpp: https://github.com/ggerganov/llama.cpp
- Ollama: https://ollama.com
- LM Studio: https://lmstudio.ai
- Paper o blog tecnico del modelo: no disponible
- Demo o espacio de inferencia: no disponible
- La busqueda web realizada no devolvio resultados relacionados con este modelo.
