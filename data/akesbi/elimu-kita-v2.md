# akesbi/elimu-kita-v2

## Resumen

elimu-kita-v2 es un asistente educativo en frances desarrollado por el usuario akesbi para la plataforma ELIMU, orientado a alumnos de CM1 a Terminale (equivalente a los ultimos cursos de primaria y toda la secundaria en el sistema educativo frances). El modelo esta afinado mediante SFT con LoRA sobre dos modelos base de Alibaba: Qwen/Qwen2.5-1.5B-Instruct y Qwen/Qwen2.5-0.5B-Instruct. Su proposito es responder exclusivamente a partir de los pasajes de curso que se le proporcionan en el contexto y rechazar educadamente cualquier pregunta que quede fuera de ese material, un comportamiento tipico de generacion aumentada por recuperacion (RAG) con rechazo explicito.

El modelo se distribuye unicamente en formato GGUF, pensado para ejecucion local con llama.cpp y wllama (WebAssembly), lo que permite desplegarlo en moviles y dispositivos de gama baja sin conexion. Se publican tres cuantizaciones: 1,5B en IQ4_XS para iPhone, 1,5B en Q4_K_M para Android reciente y 0,5B en Q4_K_M para Android basico. La licencia es Apache-2.0, heredada de los modelos base, lo que permite uso comercial.

Es relevante por su enfoque de despliegue en el borde (on-device) para entornos educativos con conectividad limitada, y por el patron de grounding estricto que reduce alucinaciones al limitar las respuestas al contexto aportado. El repositorio no tiene descargas ni likes registrados en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (arquitectura Qwen2.5, heredada del modelo base) |
| Parametros totales | 494.032.768 en la variante de 0,5B (dato reportado por HuggingFace); la variante de 1,5B ronda los 1.500 millones, dato heredado de Qwen2.5-1.5B-Instruct y no confirmado de forma exacta en la informacion disponible |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 32.768 tokens, heredada de Qwen2.5; la model card no documenta modificacion de este valor |
| Tipos de cuantizacion | GGUF: IQ4_XS (1,5B) y Q4_K_M (1,5B y 0,5B) |
| Idiomas soportados | Frances (fr). El modelo base Qwen2.5 es multilingue, pero el ajuste solo documenta frances |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (para llama.cpp y wllama) |

## Arquitectura y entrenamiento

La arquitectura es la de Qwen2.5, un transformer decoder-only con atencion causal, normalizacion RMSNorm, activacion SwiGLU y embeddings RoPE (Rotary Position Embeddings). No se trata de un modelo MoE ni de una arquitectura hibrida SSM/transformer: son modelos densos pequenos (0,5B y 1,5B), lo que explica su viabilidad en moviles y CPU. La model card no detalla hiperparametros de atencion ni variaciones respecto al modelo base.

El entrenamiento consistio en un ajuste supervisado (SFT) mediante LoRA sobre los pesos de Qwen2.5-0.5B-Instruct y Qwen2.5-1.5B-Instruct. El objetivo del ajuste es doble: que el modelo responda unicamente a partir de los pasajes de curso incluidos en el contexto, y que rechace educadamente las peticiones que no puedan cubrirse con ese material. La informacion proporcionada no incluye el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron fases posteriores de RLHF o DPO. Tampoco se documentan innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal. El resultado se exporto a GGUF en tres cuantizaciones concretas.

## Capacidades

- Generacion de texto conversacional en frances, orientada a preguntas y respuestas educativas.
- Respuesta fundamentada en contexto (grounding): el modelo utiliza los pasajes de curso suministrados en el prompt y limita su respuesta a esa informacion.
- Rechazo educado cuando la pregunta no puede responderse con el contexto proporcionado, comportamiento entrenado explicitamente.
- Uso educativo por niveles: cubre desde CM1 hasta Terminale segun la model card.
- Ejecucion local en dispositivos moviles mediante llama.cpp y wllama (WebAssembly).
- Formato conversacional (pipeline text-generation, etiqueta conversational).
- No se documenta soporte de tool calling ni function calling en el ajuste, aunque el modelo base Qwen2.5-Instruct lo soporta; no hay confirmacion de que se haya preservado.
- No se documentan capacidades de vision, audio, modo de razonamiento explicito (thinking mode) ni agentes multi-paso.
- Capacidad multilingue limitada: solo el frances esta respaldado por la model card.

## Casos de uso

- Asistente educativo offline en Android: la cuantizacion de 0,5B en Q4_K_M (397 MB) esta pensada para dispositivos Android de gama basica, de modo que la app puede responder dudas de curso sin conexion a internet en aulas o zonas rurales.
- Asistente educativo en iPhone: la cuantizacion de 1,5B en IQ4_XS (895 MB) aprovecha mejor el hardware de Apple con llama.cpp, manteniendo el modelo entero en memoria para respuestas mas ricas.
- Tutor con material del profesor (RAG): integrado en un pipeline que recupera pasajes del temario y los inserta en el prompt, el modelo responde solo con ese contenido, lo que reduce respuestas inventadas en un contexto escolar.
- Ayuda con deberes supervisada: el rechazo ante preguntas sin contexto permite que el sistema derive al alumno hacia el material no cubierto, evitando respuestas especulativas sobre temas fuera del temario.
- Despliegue web sin backend GPU: al existir formato GGUF y soporte wllama, el modelo puede ejecutarse en el navegador del cliente, eliminando costes de servidor para demos y prototipos educativos.
- Aplicacion de repaso por niveles: con prompts que incluyan el nivel (CM1 a Terminale) y los pasajes correspondientes, el modelo puede generar preguntas de repaso y explicaciones adaptadas al curso.
- Base para ajustes especificos de dominio educativo: al ser Apache-2.0 y derivar de Qwen2.5, sirve como punto de partida para otros SFT LoRA en materias o idiomas concretos.
- Evaluacion de comportamiento de rechazo: util como banco de pruebas de tecnicas de grounding y calibracion de rechazo en modelos pequenos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K ni de evaluacion especifica del comportamiento de grounding o rechazo.

## Requisitos de hardware

- VRAM estimada para inferencia (con cuantizacion GGUF, valores aproximados a partir del tamano de archivo):
  - 0,5B Q4_K_M: en torno a 400-600 MB de RAM/VRAM.
  - 1,5B IQ4_XS: en torno a 900 MB-1,1 GB.
  - 1,5B Q4_K_M: en torno a 1-1,3 GB.
- GPU recomendadas: no se especifican. Por tamano, cualquier GPU moderna con 2 GB o mas de VRAM es suficiente; tambien puede ejecutarse en CPU sin GPU.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo actual (RTX 3060, 4060, 4090, e incluso iGPU con memoria compartida), dada la baja huella de memoria.
- Ejecucion en movil: la model card indica explicitamente destinos iPhone (1,5B IQ4_XS) y Android (1,5B Q4_K_M para gama reciente, 0,5B Q4_K_M para gama basica).
- Opciones de despliegue: llama.cpp, wllama (WebAssembly), y por compatibilidad de formato GGUF, herramientas como Ollama, LM Studio o llama-cpp-python. El soporte de vLLM para GGUF es experimental y no se documenta en la ficha del autor.
- Latencia y throughput: no disponible. No se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Enfoque | Benchmarks publicados |
|---|---|---|---|---|---|---|
| elimu-kita-v2 | 0,5B y 1,5B | 32.768 tokens (heredado) | Apache-2.0 | GGUF (IQ4_XS, Q4_K_M) | Asistente educativo en frances con grounding estricto | No disponibles |
| Qwen2.5-0.5B-Instruct | 0,5B | 32.768 tokens | Apache-2.0 | safetensors, GGUF | Instrucciones generales, multilingue | Si, en su model card original |
| Qwen2.5-1.5B-Instruct | ~1,5B | 32.768 tokens | Apache-2.0 | safetensors, GGUF | Instrucciones generales, multilingue | Si, en su model card original |
| SmolLM2-1.7B-Instruct | 1,7B | 8.192 tokens | Apache-2.0 | safetensors, GGUF | Instrucciones generales, modelos pequenos para el borde | Si, en su model card original |

La comparativa se limita a parametros, contexto y licencia, ya que elimu-kita-v2 no publica resultados de benchmarks que permitan una comparacion de rendimiento por tarea.

## Limitaciones y advertencias

- No hay resultados de benchmarks ni evaluaciones independientes; el rendimiento real en tareas educativas no esta cuantificado.
- El repositorio no registra descargas ni likes, por lo que no existe validacion de la comunidad ni senales de uso en produccion.
- El modelo esta ajustado exclusivamente para frances; su uso en castellano u otros idiomas no esta respaldado y degradara la calidad.
- El rechazo ante preguntas sin contexto es un comportamiento entrenado, no una garantia: pueden producirse respuestas fuera del material aportado en prompts ambiguos.
- Al derivar de modelos de 0,5B y 1,5B, la capacidad de razonamiento complejo, matematicas avanzadas y codigo es limitada en comparacion con modelos mayores.
- La model card incluye un aviso explicito de no usar el modelo para consejos medicos.
- Licencia Apache-2.0: permite uso comercial y modificacion, con obligacion de conservar el aviso de licencia y el archivo NOTICE si lo hubiera. No impone restricciones adicionales conocidas.
- No se documenta si el ajuste LoRA preserva capacidades del modelo base como tool calling o generacion multilingue; conviene validarlas antes de depender de ellas.
- Al ser un modelo afinado para grounding, su utilidad depende por completo de la calidad del sistema de recuperacion de pasajes que lo alimente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/akesbi/elimu-kita-v2
- Modelo base 1: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Modelo base 2: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- La busqueda web realizada no devolvio enlaces relevantes sobre el modelo: los resultados obtenidos eran noticias deportivas sin relacion con elimu-kita-v2. No se dispone de paper, blog, repositorio ni demo adicionales en la informacion proporcionada.
