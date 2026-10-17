# Echoo113/Olmo-3-7B-Instruct-dragon-STEER0.139063-ft4.42

## Resumen

Olmo-3-7B-Instruct-dragon-STEER0.139063-ft4.42 es un ajuste fino (SFT) del modelo abierto allenai/Olmo-3-7B-Instruct, publicado por el usuario Echoo113 en HuggingFace. Lo desarrolla un tercero no vinculado a Ai2 y se ha entrenado con la librería TRL, según declara la propia model card. Se trata, por tanto, de un derivado experimental de la familia Olmo 3 de Allen Institute for AI, una de las pocas familias que publica pesos, datos, código y registros de entrenamiento de forma completa.

El modelo base pertenece a la gama Olmo 3, con variantes de 7B y 32B y versiones Base, Instruct y Thinking (estas últimas con SFT, DPO y RL sobre el flujo de post-entrenamiento de Ai2). El nombre del repositorio sugiere una intervención de tipo *steering* (coeficiente 0,139063) combinada con un ajuste fino, aunque el autor no documenta ni el método ni los datos empleados; existe un repositorio hermano con un coeficiente distinto (dragon_Ounif-STEER1.0-ft4.42), lo que apunta a una serie de ablaciones experimentales.

Su relevancia es limitada y muy específica: no hay descargas, no hay resultados de evaluación y la model card es prácticamente la plantilla por defecto de TRL. Es útil como material de partida para reproducir o auditar experimentos de *steering* y ajuste fino sobre un modelo totalmente abierto, no como modelo listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (heredada de allenai/Olmo-3-7B-Instruct); la model card del ajuste no detalla la arquitectura |
| Parámetros totales | 7B (según el nombre del modelo y el modelo base declarado) |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la información proporcionada |
| Tipos de cuantización | No disponible; el repositorio no publica variantes GGUF, AWQ ni GPTQ. La cuantización sería posible partiendo del modelo base, pero no está verificada para este ajuste |
| Idiomas soportados | No disponible (la model card no declara idiomas) |
| Licencia | No disponible: la model card incluye un campo provisional `licence: license` sin concretar. Debe verificarse la licencia del modelo base antes de cualquier uso comercial |
| Formato de pesos | safetensors, compatible con transformers |

## Arquitectura y entrenamiento

El ajuste se realizó mediante SFT con TRL 1.10.0, sobre Transformers 5.15.1, PyTorch 2.11.0+cu128, Datasets 5.0.1 y Tokenizers 0.22.2. La model card no especifica el conjunto de datos, el número de tokens, la composición del corpus, la configuración de hiperparámetros (tasa de aprendizaje, épocas, rango de LoRA o si el entrenamiento fue completo), ni si hubo fases posteriores de DPO o RL. Tampoco se documenta el procedimiento de *steering* que sugiere el nombre del repositorio.

Un dato relevante para interpretar el artefacto: el tamaño del repositorio es de 0,3 GB, muy inferior a los aproximadamente 15 GB que ocuparían los pesos completos de un modelo de 7B en bf16. Esto es compatible con un conjunto de adaptadores o con un checkpoint parcial, pero la model card no lo aclara, por lo que conviene inspeccionar los ficheros antes de asumir que el repositorio es autosuficiente.

## Capacidades

- Generación de texto conversacional multiturno, heredada del modelo Instruct base.
- Razonamiento y respuesta a instrucciones en formato de chat (`[{"role": "user", "content": ...}]`, según el ejemplo de la model card).
- Capacidad de código y matemáticas: presumible de la familia Olmo 3, pero no verificada en este ajuste concreto.
- Soporte de *tool calling* y de agentes: no documentado para este repositorio; debe validarse contra el modelo base.
- Capacidades multilingües: no declaradas; la model card no incluye lista de idiomas.
- Capacidad especial: ninguna documentada por el autor (no se declara modo *thinking*, visión ni audio).
- Ejecución local vía `transformers.pipeline` con `device="cuda"`, tal como muestra el ejemplo de inicio rápido.

## Casos de uso

- Investigación en *steering* y control de activaciones: el modelo sirve como punto de comparación frente al repositorio hermano con coeficiente 1.0, permitiendo medir el efecto de distintos valores de intervención sobre el comportamiento del modelo base.
- Auditoría de ajustes finos no documentados: útil para estudiar qué se puede reproducir y qué no cuando un tercero publica un SFT sin datos ni hiperparámetros, comparando salidas contra allenai/Olmo-3-7B-Instruct.
- Prototipado rápido de chatbots de un solo turno: con `pipeline` y `max_new_tokens=128` se puede montar una demo local en una GPU de consumo, aceptando que no hay métricas de calidad.
- Generación de texto de relleno y pruebas de carga en pipelines de inferencia: sirve para validar integraciones con vLLM o TGI antes de sustituir el checkpoint por un modelo evaluado.
- Experimentos de alineación y seguridad: al ser un derivado de un modelo con flujo abierto (datos y logs publicados por Ai2), permite analizar cómo un SFT adicional altera negativas, tono y sesgos.
- Docencia y formación técnica: ejemplo realista de model card generada automáticamente por TRL (`generated_from_trainer`) para enseñar a leer y detectar documentación insuficiente.
- Comparación de recetas de post-entrenamiento: contraste con la secuencia SFT → DPO → RL que Ai2 documenta en `open-instruct` para Olmo 3.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: alrededor de 15-16 GB para pesos en bf16/fp16 (cálculo derivado de 7B parámetros), más caché KV adicional según la longitud de contexto real, que no está documentada.
- Con cuantización de 8 bits, en torno a 8-9 GB; con 4 bits, en torno a 5-6 GB, siempre añadiendo el espacio de caché KV.
- GPU recomendadas: A100 40/80 GB o H100 para servicio concurrente con lotes grandes; L40S o RTX 6000 Ada como alternativas de 48 GB.
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB) con bf16 en un único proceso y contexto moderado, o en RTX 3090/4080 con cuantización de 8 o 4 bits.
- Opciones de despliegue: transformers (ruta validada por el autor), vLLM y TGI para servir; llama.cpp/Ollama requerirían generar un GGUF a partir del modelo base, ya que el repositorio no lo incluye.
- Latencia y throughput: no disponibles. No hay mediciones publicadas para este checkpoint.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Benchmarks | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este ajuste (Echoo113) | 7B | No disponible | No publicados | No disponible (`licence: license`) | Repo de 0,3 GB, 0 descargas |
| allenai/Olmo-3-7B-Instruct | 7B | No disponible en la información | No consultados | Según la documentación de Ai2 (verificar) | Modelo base público de Ai2 |
| Echoo113/Olmo-3-7B-Instruct-dragon_Ounif-STEER1.0-ft4.42 | 7B | No disponible | No publicados | No disponible | Repositorio hermano del mismo autor |
| Otras alternativas densas de ~7-8B (Llama 3.1 8B, Qwen2.5 7B, Mistral 7B) | ~7-8B | No disponible en la información proporcionada | No disponible en la información proporcionada | No disponible en la información proporcionada | No disponible en la información proporcionada |

No hay datos de rendimiento que permitan una comparación cuantitativa fiable; la comparativa anterior es puramente estructural.

## Limitaciones y advertencias

- Licencia sin definir: el campo `licence: license` es un marcador de posición. No se puede asumir uso comercial sin comprobar la licencia del modelo base y la del propio ajuste.
- Ausencia total de evaluación: cero descargas, cero valoraciones y ningún benchmark; no hay evidencia de que el ajuste no degrade las capacidades del modelo Instruct original.
- Reproducibilidad nula: no se publican datos de entrenamiento, número de tokens ni hiperparámetros, pese a etiquetarse como `generated_from_trainer`.
- Tamaño del repositorio (0,3 GB) incompatible con pesos completos de 7B: es probable que contenga adaptadores o un checkpoint parcial. Hay que inspeccionar los ficheros y, si procede, cargar el adaptador sobre `allenai/Olmo-3-7B-Instruct`.
- Método de *steering* no documentado: se desconoce qué capa o dirección se ha modificado y con qué efecto; el coeficiente 0,139063 no tiene interpretación pública.
- Riesgo de alucinación y deriva de estilo: cualquier intervención sobre activaciones puede alterar la calibración y el tono del modelo base de forma no medida.
- Idiomas no declarados: no hay garantía de calidad fuera del inglés, idioma dominante en el corpus de Olmo 3 según la documentación de Ai2.
- Contexto no confirmado: no se debe planificar un producto que dependa de ventanas largas sin verificar la longitud real soportada por este checkpoint.
- Nombre del repositorio con fecha de creación en 2026 y componentes experimentales: tratarlo como artefacto de investigación, no como releases estable.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Echoo113/Olmo-3-7B-Instruct-dragon-STEER0.139063-ft4.42
- Repositorio hermano del mismo autor: https://huggingface.co/Echoo113/Olmo-3-7B-Instruct-dragon_Ounif-STEER1.0-ft4.42
- Modelo base: https://huggingface.co/allenai/Olmo-3-7B-Instruct
- Página de la familia Olmo de Ai2: https://allenai.org/olmo
- Scripts de entrenamiento de Olmo 3 (SFT, DPO, RL): https://github.com/allenai/open-instruct/tree/main/scripts/train/olmo3
- Librería TRL utilizada para el SFT: https://github.com/huggingface/trl
- Ficha de referencia del modelo base: https://studyarena.com/models/olmo-3-7b-instruct
