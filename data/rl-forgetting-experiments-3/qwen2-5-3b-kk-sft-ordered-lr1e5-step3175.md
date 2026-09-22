# RL-Forgetting-Experiments-3/qwen2.5-3b-kk-sft-ordered-lr1e5-step3175

## Resumen

El modelo `RL-Forgetting-Experiments-3/qwen2.5-3b-kk-sft-ordered-lr1e5-step3175` es un checkpoint de ajuste supervisado (SFT) obtenido a partir del modelo base `Qwen/Qwen2.5-3B`. Segun la model card, se trata de un checkpoint de una sola epoca de entrenamiento, correspondiente al "brazo ordenado" (ordered arm) del experimento, guardado en el paso de optimizador 3175 y con una tasa de aprendizaje indicada en el propio nombre del repositorio (lr1e5). El autor es la organizacion de HuggingFace `RL-Forgetting-Experiments-3`, cuyo nombre sugiere una linea de investigacion centrada en el olvido catastrofico durante el ajuste, aunque la ficha no describe el experimento.

El repositorio contiene 3.085.938.688 parametros en formato safetensors y esta etiquetado como `text-generation` y `conversational`, con compatibilidad declarada con `text-generation-inference` y con endpoints. La model card aclara que el checkpoint es "inference-complete, not resumable": estan todos los ficheros de modelo necesarios para inferencia, pero la serializacion posterior de estado del optimizador y de parametros previos fallo, por lo que esos ficheros no se incluyen y el entrenamiento no se puede reanudar desde este punto.

Su relevancia es acotada y de caracter principalmente experimental: no declara licencia, idiomas soportados ni resultados de evaluacion, y no tiene descargas ni interacciones en el momento de la consulta. Resulta util como artefacto reproducible para estudiar el efecto del orden de los datos y de la tasa de aprendizaje en el olvido de capacidades tras un SFT corto sobre un modelo denso de 3.000 millones de parametros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen2 (transformer decoder-only) heredada del modelo base Qwen2.5-3B; no se detalla en la ficha del checkpoint |
| Parametros totales | 3.085.938.688 (dato real de safetensors) |
| Parametros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | No disponible en la ficha del checkpoint; el modelo base Qwen2.5-3B declara 32.768 tokens (ampliable a 131.072 con YaRN) |
| Tipos de cuantizacion | No disponible; el repositorio solo publica safetensors (no se anuncian GGUF, AWQ ni GPTQ) |
| Idiomas soportados | No disponible |
| Licencia | No disponible; el modelo base Qwen2.5-3B se distribuye bajo Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers); el repositorio ocupa 12,4 GB |

## Arquitectura y entrenamiento

No se describe la arquitectura en la informacion proporcionada mas alla de la herencia del modelo base: el tag `qwen2` y el campo `base_model: Qwen/Qwen2.5-3B` indican una arquitectura transformer decoder-only de la familia Qwen2.5, con normalizacion RMSNorm, activacion SwiGLU, embeddings rotatorios (RoPE) y atencion con consultas agrupadas (GQA). Los detalles concretos de capas, dimension oculta y cabezas de atencion no estan declarados en la ficha del checkpoint y no se han verificado aqui.

En cuanto al entrenamiento, la model card indica que es un checkpoint de SFT de una sola epoca perteneciente al "brazo ordenado" del experimento, en el paso de optimizador 3175, con una tasa de aprendizaje de 1e-5 segun el nombre del repositorio. No se especifica el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo fases posteriores de RLHF o DPO. El sufijo `kk` del nombre no esta explicado en la ficha; podria corresponder al codigo ISO 639-1 del kazajo, pero es una hipotesis no confirmada. La unica innovacion tecnica documentada es de caracter operativo: el checkpoint conserva todos los ficheros de pesos para inferencia, pero se publica sin el estado del optimizador ni los parametros previos, de modo que sirve para evaluar pero no para continuar el entrenamiento. El autor remite a `delivery_manifest.json` para la trazabilidad del origen y las sumas de verificacion de los pesos.

## Capacidades

- Generacion de texto y conversacion multi-turno, segun los tags `text-generation` y `conversational` del repositorio.
- Ajuste supervisado sobre el modelo base Qwen2.5-3B, por lo que hereda las capacidades del modelo original en la medida en que el SFT no las haya degradado; no se han publicado evaluaciones que lo confirmen.
- Capacidades del modelo base no verificadas en este checkpoint: razonamiento, generacion de codigo, matematicas y comprension multilingue.
- Soporte de tool calling o function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades especiales (modo thinking, vision, audio, decodificacion especulativa): no disponibles en la informacion proporcionada.

## Casos de uso

- Investigacion sobre olvido catastrofico: el checkpoint permite medir la perdida de capacidades del modelo base tras un SFT de una sola epoca, comparando las evaluaciones antes y despues del ajuste sobre las mismas tareas de referencia.
- Ablacion del orden de los datos: al pertenecer al "brazo ordenado" de un experimento con varios brazos, sirve como punto de comparacion frente a brazos con datos desordenados o barajados y aislar el efecto del orden en el resultado final.
- Estudio de sensibilidad a la tasa de aprendizaje: el nombre del repositorio fija lr=1e-5, de modo que puede contrastarse con otros checkpoints del mismo autor a distintas tasas de aprendizaje para analizar su impacto en la degradacion.
- Evaluacion de tecnicas de recuperacion de capacidades: al ser un checkpoint intermedio no reanudable, es util como estado de partida para experimentos de reajuste, mezcla de pesos o interpolacion y comprobar si se recuperan las habilidades perdidas.
- Analisis de trayectorias de entrenamiento: con 3175 pasos de optimizador documentados, permite estudiar la evolucion de metricas internas entre checkpoints intermedios de la misma ejecucion.
- Prototipado local de asistentes conversacionales: al tratarse de un modelo denso de 3.000 millones de parametros, se puede ejecutar en una GPU de consumo para pruebas de dialogo, siempre que la licencia no declarada se resuelva antes de cualquier uso mas alla de la investigacion.
- Auditoria y red teaming de checkpoints intermedios: sirve para comprobar si un SFT parcial introduce comportamientos no deseados, sesgos o regresiones de seguridad respecto al modelo base.
- Generacion de datos sinteticos para experimentos controlados: util para producir completaciones sobre un dominio concreto y estudiar como cambia la distribucion de salida tras el ajuste.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del checkpoint no incluye tablas de evaluacion (MMLU, HumanEval, GSM8K u otras) y las busquedas web realizadas no devolvieron resultados relacionados con el modelo: los resultados obtenidos corresponden a sitios de noticias locales y a un videojuego homonimo, sin ninguna conexion con este checkpoint. Por tanto, no se dispone de datos verificables de rendimiento ni de comparaciones cuantitativas con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: en bf16/fp16, los 3.085.938.688 parametros ocupan aproximadamente 6,2 GB, a los que hay que sumar la cache KV y el overhead del runtime; en cuantizacion de 8 bits baja a unos 3,1 GB y en 4 bits a alrededor de 1,6-2,0 GB, aunque el repositorio no publica pesos cuantizados y habria que generarlos localmente.
- Observacion sobre el repositorio: los 12,4 GB del repositorio son coherentes con pesos en fp32 (3.085.938.688 x 4 bytes = 12,34 GB), no con bf16; conviene comprobar el `dtype` real de los ficheros antes de planificar el despliegue.
- GPU recomendadas: una RTX 3060 de 12 GB o una RTX 4060 Ti de 16 GB son suficientes para inferencia en fp16; una RTX 4090, L40S o A100 permiten mayor longitud de contexto y lotes mayores.
- Compatibilidad con GPU de consumo: si, el modelo cabe en la mayoria de GPU de consumo con 8 GB o mas de VRAM si se usa fp16 con contexto moderado, y en 4-6 GB si se cuantiza.
- Opciones de despliegue: el repositorio declara `transformers`, `text-generation-inference` y compatibilidad con endpoints; al no incluir pesos GGUF, para llama.cpp u Ollama seria necesario convertir los safetensors a ese formato. vLLM es viable una vez conocidos el `dtype` y la configuracion de atencion.
- Latencia y throughput estimados: no disponibles; no se han publicado mediciones y dependen por completo del hardware y del backend elegido.

## Comparativa con modelos similares

Los datos de la columna "este checkpoint" proceden de la informacion proporcionada; los de las alternativas provienen de la documentacion publica de cada modelo base y no se han verificado en esta busqueda. No existen datos de rendimiento comparables para este checkpoint.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| qwen2.5-3b-kk-sft-ordered-lr1e5-step3175 | 3,09 B | No disponible (base: 32.768 tokens) | No disponible | Pesos safetensors en HuggingFace, sin GGUF publicado |
| Qwen2.5-3B (modelo base) | 3,09 B | 32.768 tokens, ampliable a 131.072 con YaRN | Apache 2.0 | Pesos safetensors y GGUF oficiales |
| Llama 3.2 3B | 3,21 B | 128.000 tokens | Licencia comunitaria Llama 3.2 | Pesos safetensors y GGUF, requiere aceptar la licencia |
| Phi-3.5-mini-instruct | 3,82 B | 128.000 tokens | MIT | Pesos safetensors y GGUF |
| Gemma 2 2B | 2,61 B | 8.000 tokens | Terminos de uso de Gemma | Pesos safetensors y GGUF, sujeto a licencia propia |

La diferencia principal frente a las alternativas no esta en las capacidades declaradas, sino en la naturaleza del artefacto: es un checkpoint intermedio de investigacion, sin licencia declarada, sin evaluaciones publicadas y no reanudable, mientras que las alternativas son modelos finales con licencia explicita y soporte de ecosistema completo.

## Limitaciones y advertencias

- Licencia no declarada: la ficha del checkpoint no especifica condiciones de uso. Aunque el modelo base Qwen2.5-3B es Apache 2.0, la ausencia de licencia explicita en este repositorio impide asumir que el uso comercial este permitido sin consultar al autor.
- Idiomas no declarados: se desconoce que idiomas cubre el ajuste y si el SFT ha reducido el soporte multilingue del modelo base. El sufijo `kk` no esta explicado.
- Riesgo de alucinacion: no existen evaluaciones de fidelidad, veracidad ni tasas de alucinacion para este checkpoint; al ser un ajuste sobre un modelo de 3 B, la tasa esperable es mayor que en modelos de mayor tamano.
- Degradacion por SFT: el proposito declarado del experimento (olvido) implica que el checkpoint puede haber perdido capacidades presentes en Qwen2.5-3B; no debe asumirse paridad funcional con el modelo base.
- Contexto y configuracion sin verificar: la longitud de contexto efectiva tras el SFT no esta documentada, por lo que la ventana de 32.768 tokens del modelo base no deberia darse por garantizada.
- Estado de entrenamiento incompleto: el checkpoint no es reanudable; no se pueden continuar los pasos de optimizador a partir de el ni reproducir exactamente la ejecucion sin el manifiesto de origen.
- Sin senal de adopcion: cero descargas y cero interacciones en el momento de la consulta, lo que reduce la probabilidad de que existan verificaciones independientes de su comportamiento.
- Fechas anomalas: los metadatos indican creacion el 2026-09-22 y actualizacion el 2026-09-22, posteriores a la mayoria de checkpoints de la misma familia; conviene validar la procedencia antes de integrarlo en un flujo de trabajo.
- Uso en produccion desaconsejado: sin licencia, sin evaluaciones, sin cuantizaciones publicadas y con un proposito experimental declarado, no es un candidato adecuado para sistemas en produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/RL-Forgetting-Experiments-3/qwen2.5-3b-kk-sft-ordered-lr1e5-step3175
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-3B
- Organizacion autora: https://huggingface.co/RL-Forgetting-Experiments-3
- Repositorio de Qwen2.5 (codigo y documentacion): https://github.com/QwenLM/Qwen2.5
- Blog de Qwen2.5: https://qwenlm.github.io/blog/qwen2.5/
- Nota: las busquedas web realizadas no devolvieron ningun resultado relevante sobre este modelo; los enlaces obtenidos correspondian a medios de prensa local y a un videojuego homonimo, sin relacion con el checkpoint.
