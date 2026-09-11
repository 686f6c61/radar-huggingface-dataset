# CodeDevX/auralis-coder

## Resumen

Auralis-Coder es un modelo de lenguaje causal de aproximadamente 1.500 millones de parametros publicado por el usuario CodeDevX en HuggingFace. Se trata de un ajuste (fine-tune) del modelo base Qwen/Qwen2.5-1.5B, orientado especificamente a contenido de programacion e inteligencia artificial, y no a conversacion de proposito general. La model card lo presenta como un modelo tecnico especializado cuyo dominio principal abarca desarrollo de software, algoritmos, estructuras de datos, machine learning y temas afines.

La arquitectura subyacente es la de Qwen2.5: un transformer decoder-only con atencion de consultas agrupadas (GQA), 28 capas, representacion oculta de 1.536 dimensiones, 12 cabezas de atencion y 4 cabezas clave-valor, con un vocabulario de 151.936 tokens y tokenizador de la familia Qwen2.5. La model card declara una longitud de contexto maxima de 131.072 tokens, aunque la longitud de secuencia usada en entrenamiento es de 4.096 tokens. El modelo se distribuye con licencia MIT y solo declara soporte para ingles.

Su relevancia actual es limitada y debe evaluarse con cautela: el repositorio acumulaba 0 descargas y 0 likes en el momento de la consulta, no se publican resultados de benchmarks y el corpus de entrenamiento declarado (235.219 registros, unos 32,6 millones de tokens estimados) queda muy lejos del objetivo de 15.000 millones de tokens que menciona la propia model card. Es, por tanto, un experimento de ajuste de dominio sobre una base solida, no un modelo validado para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only causal tipo Qwen2 (atencion GQA, RoPE, SwiGLU, RMSNorm) |
| Parametros totales | 1.543.714.304 (≈1,5B, dato real de safetensors) |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | 131.072 tokens declarados en la model card; 4.096 tokens de longitud de secuencia de entrenamiento |
| Tipos de cuantizacion | No se publican cuantizaciones oficiales (sin GGUF, AWQ ni GPTQ en el repositorio); al distribuirse en safetensors es convertible con herramientas estandar |
| Idiomas soportados | Ingles (en) |
| Licencia | MIT |
| Formato de pesos | safetensors (libreria transformers) |
| Dimension oculta | 1.536 |
| Numero de capas | 28 |
| Cabezas de atencion / cabezas KV | 12 / 4 |
| Vocabulario | 151.936 tokens (tokenizador Qwen2.5) |
| Modelo base | Qwen/Qwen2.5-1.5B (fine-tune) |
| Tamano del repositorio | 6,2 GB |
| Fecha de publicacion | 2026-09-11 (creacion), 2026-09-11 (ultima actualizacion) |

## Arquitectura y entrenamiento

La arquitectura corresponde a Qwen2.5-1.5B sin modificaciones estructurales declaradas: transformer decoder-only con normalizacion RMSNorm, activacion SwiGLU, embeddings rotatorios (RoPE) y atencion de consultas agrupadas con 4 cabezas clave-valor frente a 12 cabezas de atencion, lo que reduce el coste de la cache KV. El pipeline de entrenamiento descrito en la model card es un ajuste de todos los parametros (full-parameter training) sobre shards de tokens empaquetados, tras un proceso de recoleccion, filtrado de contenido, deduplicacion y tokenizacion con el tokenizador Qwen2.5. No se documenta ningun uso de RLHF, DPO ni ajuste por instrucciones, ni tampoco decodificacion especulativa u otras optimizaciones de inferencia.

El dato mas relevante es la escala de datos: el corpus actual consta de 235.219 registros, 130.472.211 caracteres y unos 32,6 millones de tokens estimados (calculados a razon de cuatro caracteres por token), frente a un objetivo declarado de 15.000 millones de tokens. Esto supone que el ajuste efectivo es, como minimo, dos ordenes de magnitud inferior al plan anunciado, lo que limita de forma severa la cantidad de conocimiento tecnico nuevo que el modelo puede haber incorporado respecto a su base. La model card indica que el modelo responde con un mensaje de rechazo cuando la consulta queda fuera de su dominio (programacion, informatica, IA y areas relacionadas).

## Capacidades

- Generacion de texto autoregresiva en ingles, con controles de muestreo (temperature, top-p, top-k), penalizacion de repeticion y restricciones de n-gramas.
- Generacion y autocompletado de codigo, con especial enfasis declarado en Python, C/C++, Java, JavaScript, TypeScript, Rust, Go y SQL.
- Explicacion de codigo y de conceptos de ingenieria de software, algoritmos, estructuras de datos, bases de datos y APIs.
- Asistencia en depuracion y comprension de fragmentos de codigo.
- Contenido teorico sobre inteligencia artificial: redes neuronales, transformers, LLM, tokenizacion, entrenamiento e inferencia, PyTorch y TensorFlow.
- Respuesta restringida al dominio tecnico: ante consultas de ocio, cocina, deportes o viajes, el modelo declara que es un modelo de programacion e IA en lugar de responder.
- Integracion con recuperacion de informacion en vivo cuando la aplicacion de inferencia lo configura; la informacion recuperada se pasa como contexto adicional y no se almacena en los pesos.
- No se documenta soporte de tool calling o function calling, ni modo de razonamiento explicito (thinking), ni capacidades de vision o audio.
- No se documenta una plantilla de chat ni un ajuste por instrucciones, pese a la etiqueta "conversational" del repositorio; el comportamiento conversacional no esta descrito tecnicamente.

## Casos de uso

- Autocompletado de codigo en el editor: al ser un modelo de 1,5B con licencia MIT, puede desplegarse localmente en un portatil con GPU de gama media y ofrecer sugerencias de linea o bloque en entornos con requisitos estrictos de privacidad del codigo.
- Explicacion de codigo heredado: el modelo puede resumir que hace una funcion o un modulo y describir su flujo de control, util para incorporar desarrolladores a bases de codigo desconocidas.
- Asistencia a la depuracion: dado un fragmento de codigo y un mensaje de error, el modelo puede proponer causas probables y correcciones, como paso previo a la revision humana.
- Generacion de pruebas unitarias: produccion de esqueletos de tests para funciones existentes, que el equipo completa despues; el coste de un fallo queda acotado porque el resultado no se ejecuta en produccion sin revision.
- Generacion de consultas SQL y esquemas: traduccion de preguntas en lenguaje natural a consultas sobre un esquema dado, en herramientas internas de analitica.
- Tutorizacion tecnica: respuestas sobre algoritmos, complejidad computacional, estructuras de datos y fundamentos de machine learning para materiales de formacion o entornos educativos.
- Prototipado y experimentacion en hardware de consumo: al ocupar aproximadamente 3,1 GB en fp16 y menos de 1 GB en cuantizacion de 4 bits, sirve como banco de pruebas para pipelines de ajuste fino, tokenizacion y despliegue antes de escalar a modelos mayores.
- Clasificacion o etiquetado de contenido tecnico en un pipeline interno, siempre que se valide antes la calidad de salida, dado que no esta ajustado especificamente para tareas de clasificacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye ninguna cifra de MMLU, HumanEval, GSM8K, MBPP ni de evaluaciones equivalentes, y tampoco se han encontrado resultados en la busqueda web realizada. Las areas de evaluacion que el propio autor sugiere son las siguientes, pero sin valores asociados:

| Area de evaluacion | Resultado publicado |
|---|---|
| Conocimiento de programacion | No disponible |
| Generacion de codigo (tipo HumanEval, MBPP) | No disponible |
| Completado de codigo | No disponible |
| Comprension de codigo | No disponible |
| Depuracion | No disponible |
| Razonamiento algoritmico | No disponible |
| Conocimiento de informatica e IA | No disponible |
| Seguimiento de instrucciones tecnicas | No disponible |
| Calidad de generacion y repeticion | No disponible |

## Requisitos de hardware

- VRAM estimada para los pesos: aproximadamente 3,1 GB en fp16/bf16 (2 bytes por parametro sobre 1.543.714.304 parametros), unos 6,2 GB en fp32 y alrededor de 1,6 GB en int8.
- Cuantizacion de 4 bits: en torno a 1 GB de pesos, mas overhead de runtime.
- Cache KV: con 28 capas y 4 cabezas KV de dimension 128, cada token consume unos 57 KB en fp16. Esto supone aproximadamente 1,75 GB para 32.768 tokens y unos 7 GB para los 131.072 tokens de contexto maximo declarado, un coste que domina el total en contextos largos.
- GPU consumer: cabe sin problema en tarjetas de 8 GB o mas (RTX 3060 Ti, 4060, 3070, 4060 Ti, 4070) en fp16, y en tarjetas de 6 GB con cuantizacion de 4 bits. Para aprovechar el contexto de 131.072 tokens en fp16 hacen falta aproximadamente 10 GB de VRAM agregada, por lo que conviene una GPU de 12 GB o mas (RTX 3060 12 GB, 4070 Ti, 4080, 4090), o bien cuantizacion para reducir la parte de pesos.
- GPU de datacenter: A100, H100, L40S o similares no son necesarias para un modelo de este tamano; se usarian solo para lotes muy grandes o para ajuste fino.
- Opciones de despliegue: transformers (formato nativo del repositorio), text-generation-inference (el repositorio incluye la etiqueta correspondiente), vLLM (compatible con la familia Qwen2), HF Inference Endpoints (etiqueta endpoints_compatible), y llama.cpp u Ollama previa conversion a GGUF, que no se distribuye en el repositorio.
- Latencia y throughput: no disponibles. El autor no publica mediciones y el repositorio no incluye informes de rendimiento.
- Ajuste fino: el entrenamiento completo sobre 1,5B de parametros en bf16 requiere del orden de 18-24 GB de VRAM con optimizador y activaciones (por encima del peso del modelo), o menos con LoRA/QLoRA sobre una GPU de 12-24 GB.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Rendimiento publicado |
|---|---|---|---|---|---|
| CodeDevX/auralis-coder | 1,54B | 131.072 tokens declarados (4.096 en entrenamiento) | MIT | HuggingFace, safetensors | No disponible |
| Qwen/Qwen2.5-1.5B (base) | 1,54B | 32.768 nativos, ampliable a 131.072 con YaRN | Apache 2.0 | HuggingFace, safetensors | Publicado por el autor del modelo base |
| Qwen/Qwen2.5-Coder-1.5B | 1,54B | 32.768 nativos | Apache 2.0 | HuggingFace, safetensors, GGUF | Publicado por el autor del modelo base |
| meta-llama/Llama-3.2-1B | 1,24B | 128.000 tokens | Licencia comunitaria Llama 3.2 | HuggingFace, gated | Publicado por el autor del modelo base |
| HuggingFaceTB/SmolLM2-1.7B | 1,71B | 8.192 tokens | Apache 2.0 | HuggingFace, safetensors | Publicado por el autor del modelo base |

La comparacion relevante es doble. Frente a su propio modelo base, Auralis-Coder cambia la licencia de Apache 2.0 a MIT y anade una especializacion de dominio, pero no aporta datos que demuestren mejora en tareas de programacion. Frente a Qwen2.5-Coder-1.5B, que es un modelo entrenado especificamente para codigo por el propio equipo de Qwen con un corpus de gran escala, no hay ninguna evidencia publicada de que Auralis-Coder sea competitivo. Las cifras de rendimiento del modelo analizado no estan disponibles.

## Limitaciones y advertencias

- Ausencia total de evaluacion: no hay benchmarks, ni comparaciones, ni ejemplos de salida medidos. Cualquier uso en produccion exige una evaluacion propia previa.
- Corpus de entrenamiento muy reducido: unos 32,6 millones de tokens estimados frente a un objetivo declarado de 15.000 millones. El ajuste efectivo es minimo y puede aportar poco mas que el modelo base, con riesgo de sobreajuste a las fuentes concretas del corpus.
- Modelo unicamente en ingles. No hay soporte declarado de castellano ni de otros idiomas, por lo que su uso en entornos hispanohablantes degradara la calidad.
- No hay evidencia de ajuste por instrucciones ni de plantilla de chat documentada, lo que puede provocar respuestas mal formateadas o continuaciones del prompt en lugar de respuestas directas.
- Riesgo de alucinacion en APIs, funciones de libreria y detalles de sintaxis, especialmente en lenguajes con ecosistemas grandes y cambiantes; el modelo no verifica compilacion ni ejecucion.
- El rechazo de consultas fuera de dominio es un comportamiento descrito en la model card, no una garantia verificada: un modelo de 1,5B puede ignorarlo y responder igualmente.
- Sesgos: no se documenta ninguna evaluacion de sesgo, toxicidad o seguridad. El corpus es de origen no especificado, lo que impide auditar su composicion.
- Contexto largo: los 131.072 tokens son la ventana configurada, no una capacidad demostrada de recuperacion en contextos largos. La longitud de entrenamiento fue de 4.096 tokens, por lo que el rendimiento mas alla de esa longitud no esta garantizado sin tecnicas de extrapolacion tipo YaRN correctamente configuradas.
- Licencia MIT: es permisiva y permite uso comercial, modificacion y redistribucion, siempre manteniendo el aviso de copyright. Conviene comprobar que el modelo base Qwen2.5-1.5B (Apache 2.0) y sus condiciones se cumplen en la redistribucion.
- Estado de validacion nulo: 0 descargas y 0 likes en el momento de la consulta, sin historial de uso ni de incidencias.
- El repositorio ocupa 6,2 GB cuando los pesos en fp16 de 1,5B deberian rondar los 3,1 GB, lo que sugiere la presencia de ficheros adicionales (por ejemplo pesos en fp32, estados de optimizador o copias). Conviene inspeccionar el contenido antes de descargarlo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/CodeDevX/auralis-coder
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B
- Informe tecnico de la familia Qwen2.5: https://arxiv.org/abs/2412.15115
- No se han encontrado enlaces adicionales relevantes en la busqueda web: los resultados devueltos corresponden a paginas de Microsoft Excel y no guardan relacion con el modelo.
