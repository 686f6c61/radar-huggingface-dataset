# ForgeWorks/ForgePlex-M2-9M

## Resumen

ForgePlex-M2-9M es un modelo de lenguaje decoder-only de aproximadamente 9,95 millones de parametros desarrollado por ForgeWorks. Se trata del segundo intento del autor de construir un modelo por debajo de los 10 millones de parametros, tras ForgePlex-M1, y fue entrenado sobre 30.000 millones de tokens con el framework TrainWork de Axiomic Labs. Su relevancia no esta en competir con modelos de gran escala, sino en servir como banco de pruebas reproducible de tecnicas de arquitectura aplicadas a modelos ultrapequenos: GQA, RoPE estilo NeoX, RMSNorm, SwiGLU, puertas de salida de atencion al estilo Qwen3.5 y refresh gates del tipo TX4.

La arquitectura es un transformer denso de 11 capas y 256 dimensiones ocultas, con atencion GQA de 8 cabezas de consulta y 2 de clave/valor, head_dim de 32, vocabulario BPE propio de 4.096 tokens, weight tying y una longitud de contexto de 1.024 tokens. Los pesos se distribuyen en safetensors y su licencia Apache-2.0 permite uso comercial sin restricciones adicionales.

El modelo esta orientado exclusivamente al ingles y su publico natural es la investigacion en eficiencia, la docencia sobre entrenamiento de LLM y los experimentos de ablacion de componentes. Con 886 descargas y 12 likes en HuggingFace, es un artefacto de nicho, no un modelo listo para produccion general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso con GQA, NeoX-style RoPE, RMSNorm, SwiGLU, attention output gates y refresh gates (TX4 de Axiomic Labs) |
| Parametros totales | 9.949.698 |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | 1.024 tokens |
| Tipos de cuantizacion | No disponible (el autor solo publica pesos en safetensors, cargados en float32 en el ejemplo de uso) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |
| Capas | 11 |
| Dimension oculta | 256 |
| Cabezas de atencion | 8 de consulta / 2 de clave-valor, head_dim = 32 |
| Feed-forward | SwiGLU, dimension intermedia 707 |
| Vocabulario | 4.096 tokens, BPE propio |
| Posiciones | RoPE con theta = 5.000, convencion par/impar estilo NeoX |
| Normalizacion | RMSNorm, epsilon = 1e-6 |
| Bias | Ninguno |
| Embedding | Weight tying |
| Refresh gates | Capas 5 y 10, kernel 9 |
| XSA | Desactivado |
| Tokens de entrenamiento | 30.000 millones |

## Arquitectura y entrenamiento

El bloque sigue el esquema clasico de transformer pre-norm con RMSNorm y feed-forward SwiGLU, pero incorpora dos modificaciones destacables. La primera es una puerta de salida de atencion inspirada en Qwen3.5, que modula la salida de cada capa de atencion antes de la conexion residual. La segunda son refresh gates de estilo TX4 de Axiomic Labs insertadas en las capas 5 y 10 con kernel 9, un mecanismo que refresca representaciones intermedias en puntos concretos de la profundidad de la red. Los pesos conservan la disposicion de claves del entrenamiento, sin remapeo al formato Llama, lo que implica que la carga requiere codigo propio a traves de `trust_remote_code=True`. La XSA (probablemente una variante de atencion dispersa o lineal) esta desactivada en esta version.

El modelo se entreno sobre 30.000 millones de tokens, una ratio de tokens por parametro de aproximadamente 3.015, muy por encima de lo habitual en modelos de esta talla, lo que indica un regimen de entrenamiento intensivo en datos. La mezcla del dataset es: Finephrase al 50%, DCLM-Baseline al 30%, un dataset propietario de Axiomic Labs al 10% (anunciado para publicacion futura) y Finemath al 10% para el componente matematico. No se menciona en la informacion disponible ninguna fase de RLHF, DPO o ajuste por instrucciones; todo apunta a un preentrenamiento puro sobre texto.

## Capacidades

- Generacion de texto autoregresiva en ingles, orientada a completar prompts y producir continuaciones cortas.
- Razonamiento de sentido comun muy limitado: HellaSwag del 28,02% y PIQA del 57,18% situan al modelo ligeramente por encima del azar en algunas tareas.
- Aritmetica basica: ArithMark-3 del 34,60%, coherente con la inclusion de Finemath en el 10% del dataset.
- Razonamiento academico basico: ARC combinado del 30,00%.
- Soporte de tool calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles; el modelo esta etiquetado unicamente como ingles y su vocabulario de 4.096 tokens dificulta la cobertura de otras lenguas.
- Capacidades especiales: no dispone de modo thinking, vision ni audio. Su rasgo diferencial es arquitectonico (attention output gates y refresh gates), no funcional.
- Fine-tuning: al publicarse en safetensors y con licencia Apache-2.0, es ajustable para tareas concretas, siempre que se respete la arquitectura personalizada.

## Casos de uso

- Investigacion en arquitecturas de modelos ultrapequenos: el modelo permite aislar el efecto de las attention output gates y de las refresh gates TX4 comparando con una variante sin ellas, dado que el autor documenta explicitamente que XSA esta desactivada y en que capas actuan las puertas.
- Modelo borrador para decodificacion especulativa: con solo 9,95 millones de parametros, puede actuar como draft model que propone tokens que un modelo mayor verifica despues, reduciendo el coste por token generado en latencia. Requiere adaptar el vocabulario de 4.096 tokens al del modelo objetivo.
- Docencia y material formativo sobre entrenamiento de LLM: permite reproducir un ciclo completo de preentrenamiento sobre 30.000 millones de tokens y observar curvas de perdida, mezclas de datos y decisiones de tokenizacion en un coste de computo asumible.
- Experimentacion con tokenizadores BPE pequenos: su vocabulario de 4.096 entradas es un caso de estudio util para medir el impacto del tamano de vocabulario en la calidad de generacion en ingles.
- Inferencia en entornos con recursos minimos: al ocupar del orden de 40 MB en float32, puede ejecutarse en CPU, en dispositivos embebidos o en contenedores con memoria muy restringida para generar texto corto sin conexion.
- Pruebas de humo (smoke tests) en pipelines de infraestructura de entrenamiento: sirve como modelo de validacion rapida para verificar que un framework tipo TrainWork carga pesos, aplica `trust_remote_code` y ejecuta `generate` correctamente antes de lanzar entrenamientos mayores.
- Fine-tuning para tareas de clasificacion o etiquetado sobre fragmentos cortos de texto en ingles, aprovechando la licencia permisiva y el bajo coste de ajuste.

## Benchmarks y rendimiento

| Benchmark | ForgePlex-M2-9M |
|---|---|
| Intelligence Index | 9,14 (escala no especificada en la model card) |
| HellaSwag | 28,02% |
| ARC (combinado) | 30,00% |
| PIQA | 57,18% |
| ArithMark-3 | 34,60% |

No se han publicado resultados de MMLU, GSM8K, HumanEval ni de ningun otro benchmark estandar en la informacion disponible. Tampoco se proporcionan resultados de modelos comparables, por lo que no es posible establecer una tabla comparativa de rendimiento con cifras verificables.

## Requisitos de hardware

- VRAM estimada para inferencia (calculada a partir del numero de parametros, no publicada por el autor): aproximadamente 40 MB en float32, 20 MB en float16/bfloat16, 10 MB en int8 y 5 MB en int4.
- GPU recomendadas: cualquier GPU con al menos 1 GB de memoria es suficiente, incluidas GTX 1050, RTX 3060, RTX 4090, A100 o H100. El modelo no aprovecha la capacidad de tarjetas de gama alta.
- Cabe holgadamente en cualquier GPU de consumo actual y tambien en CPU, Raspberry Pi o entornos embebidos.
- Opciones de despliegue: la via documentada es `transformers` con `AutoModelForCausalLM` y `trust_remote_code=True`, en float32. No hay conversiones publicadas a GGUF ni integracion conocida con llama.cpp, Ollama, vLLM, TGI ni SGLang; la arquitectura personalizada (attention output gates, refresh gates y disposicion de claves sin remapeo Llama) hace improbable que estos motores la soporten sin trabajo adicional.
- Latencia y throughput estimados: no disponible. No se han publicado mediciones.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye resultados de modelos comparables de la misma categoria (modelos de menos de 10 millones de parametros orientados a ingles) ni datos que permitan situar a ForgePlex-M2-9M frente a alternativas como TinyStories o modelos de juguete equivalentes.

## Limitaciones y advertencias

- Contexto muy corto: 1.024 tokens impiden cualquier tarea de resumen de documentos largos, conversacion multi-turno extensa o analisis de codigo.
- Vocabulario reducido: 4.096 tokens provocan una tokenizacion muy fragmentada del ingles y hacen inviable el soporte practico de otros idiomas.
- Rendimiento cercano al azar en varias tareas: HellaSwag del 28,02% y ARC del 30,00% estan en niveles propios de un modelo de esta escala, no de un asistente utilizable.
- Riesgo elevado de alucinacion y de incoherencia a partir de unas pocas decenas de tokens generados, especialmente fuera de las distribuciones cubiertas por Finephrase, DCLM y Finemath.
- Sesgos conocidos: no disponible. No se ha publicado ninguna evaluacion de sesgos, toxicidad o seguridad.
- Un 10% del dataset de entrenamiento es propietario y aun no se ha publicado, por lo que la composicion exacta de los datos no es totalmente auditable.
- Requiere `trust_remote_code=True`, lo que implica ejecutar codigo Python del repositorio del autor; conviene revisarlo antes de desplegarlo en entornos de produccion.
- Restricciones de licencia: Apache-2.0 permite uso comercial, modificacion y redistribucion, siempre que se conserve el aviso de licencia y se indiquen los cambios. No hay clausulas adicionales conocidas.
- La model card no documenta comportamiento en produccion, soporte de plantillas de chat, tokens especiales de sistema ni formato de prompt recomendado, mas alla de un ejemplo de completado simple.
- Las fechas del repositorio (creacion el 29 de septiembre de 2026 y actualizacion el 30 de septiembre de 2026) deben verificarse, ya que no coinciden con el calendario actual.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ForgeWorks/ForgePlex-M2-9M
- Axiomic Labs (autores del framework TrainWork y del dataset propietario): https://huggingface.co/AxiomicLabs

No se han encontrado en la informacion disponible papers, blogs tecnicos, repositorios de codigo ni demos adicionales.
