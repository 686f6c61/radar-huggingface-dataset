# EschaLabs/Qwen3.8-27B-Escha-W2

## Resumen

Escha-W2 es una cuantización extrema a 2 bits del modelo Qwen3.8-27B, desarrollada por Escha Labs Inc. El objetivo es comprimir un modelo denso de 27 000 millones de parámetros en solo 10,15 GB de pesos, lo que permite ejecutarlo en una GPU de consumo con 24 GB de VRAM manteniendo la ventana de contexto completa. La cuantización emplea un esquema mixto de 2 y 3 bits por proyección, con una media de 2,469 bits por peso, más capas de embedding y cabeza en int8.

El modelo se sirve mediante un runtime SGLang modificado (escha-runtime-qwen3dense) que incorpora kernels de decodificación específicos para este formato. Según las mediciones del autor, el rendimiento se mantiene prácticamente a la par de una referencia FP8 del mismo backend: es ligeramente superior en razonamiento de sentido común, queda a una pregunta de distancia en GPQA-Diamond y supera en LiveCodeBench dentro del margen de ruido del benchmark. Está pensado para desarrolladores que necesitan ejecutar un modelo de razonamiento de alto nivel en hardware local sin depender de la nube.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3.8-27B) cuantizado a 2 bits |
| Parametros totales | 27B (declarado por el autor); 6 340 437 856 según safetensors |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 64k (estandar en 24 GB), 128k (config ajustada) |
| Tipos de cuantizacion | 2-bit escha (mixta 2/3-bit, 2,469 bits/peso), int8 embedding + head |
| Idiomas soportados | en (ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (model-*.safetensors) |

## Arquitectura y entrenamiento

El modelo es una cuantizacion del Qwen3.8-27B original, no un entrenamiento desde cero. La arquitectura base es un transformer denso con atencion completa, disenado para razonamiento y generacion de texto. La cuantizacion escha aplica una asignacion mixta de 2 y 3 bits por proyeccion, con una media de 2,469 bits por peso, y mantiene las capas de embedding y la cabeza de salida en int8 para preservar la precision numerica en los extremos. El resultado son 10,15 GB de pesos que conservan el conteo total de parametros del modelo original.

El runtime de inferencia es una compilacion de SGLang con kernels de decodificacion especificos para este formato (escham_decode_gemv). Requiere PyTorch 2.9 fijado (ABI-linked) y CUDA 12.8. No se han publicado detalles sobre el dataset de entrenamiento ni sobre procesos de RLHF o DPO, ya que al ser una cuantizacion no hubo entrenamiento adicional. La unica innovacion destacable es el esquema de cuantizacion propio de Escha Labs, que logra una compresion de aproximadamente 10x respecto al FP8 manteniendo el rendimiento dentro del ruido estadistico.

## Capacidades

- Generacion de texto conversacional y de razonamiento, con modo thinking activable mediante `chat_template_kwargs` (`enable_thinking` y `reasoning_effort`).
- Razonamiento cientifico de nivel graduado: obtiene 88,38 % en GPQA-Diamond con thinking activado y presupuesto de 28k tokens.
- Generacion de codigo: alcanza 86,81 % pass@1 en LiveCodeBench v6 (desde 2025-01-01) con thinking activado.
- Razonamiento de sentido comun: 79,25 % de media en Commonsense-6 (6 tareas completas) con thinking desactivado.
- Soporte de modo thinking con niveles de esfuerzo configurables (`xhigh` por defecto, otros valores disponibles).
- Capacidad de servir respuestas divididas entre `reasoning_content` y `content` cuando el thinking esta activo.
- Interfaz compatible con OpenAI (servidor HTTP) para integracion con clientes estandar.

## Casos de uso

- Inferencia local en GPU de consumo: el modelo cabe completo (pesos, KV cache y contexto de 64k) en una RTX 4090 o RTX 3090 de 24 GB, lo que permite ejecutar un modelo de razonamiento de 27B sin conexion a la nube. Es adecuado para entornos con requisitos de privacidad o latencia.
- Asistente de codigo en entornos de desarrollo: con su alto pass@1 en LiveCodeBench, puede integrarse en editores o pipelines de CI/CD para generar, revisar o completar codigo. El modo thinking ayuda a validar soluciones complejas antes de emitirlas.
- Razonamiento cientifico y tecnico: su resultado en GPQA-Diamond (88,38 %) lo hace util para tareas de analisis de literatura, formulacion de hipotesis o resolucion de problemas de nivel avanzado en fisica, quimica y biologia.
- Chat conversacional con contexto largo: la ventana de 64k (ampliable a 128k) permite mantener conversaciones extensas o procesar documentos largos, como manuales tecnicos o informes, sin perder el hilo.
- Desarrollo de agentes de razonamiento: el modo thinking con `reasoning_effort` configurable permite ajustar el equilibrio entre velocidad y profundidad de analisis, util para agentes que deben planificar varios pasos antes de actuar.
- Servicio local compatible con OpenAI: al exponer una API compatible, puede sustituir a servicios en la nube en aplicaciones existentes, con la ventaja de que los datos no salen de la maquina.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card, comparados con una referencia FP8 del mismo backend:

| Benchmark | Metrica | Escha-W2 | Referencia FP8 | Diferencia |
|---|---|---|---|---|
| Commonsense-6 (media de 6 tareas) | avg acc (thinking-off) | 79,25 | no disponible | adelante |
| GPQA-Diamond (n=198) | acc (thinking-on, 28k budget) | 88,38 | no disponible | detras por 1 pregunta |
| LiveCodeBench v6 (n=182) | pass@1 (thinking-on, 28k budget) | 86,81 | no disponible | adelante |

El autor indica que el modelo no es mediblemente peor que la referencia FP8 en los tres ejes medidos. No se han publicado resultados de benchmarks adicionales en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: 10,15 GB de pesos + KV cache + overhead. En una GPU de 24 GB caben pesos, cache y contexto de 64k con margen. Con configuracion ajustada, 128k de contexto en la misma tarjeta.
- GPUs verificadas: RTX 5090 (32 GB, sm_120), RTX 4090 (24 GB, sm_89), RTX 3090 (24 GB, sm_86). Se indica que 16 GB deberian ser suficientes con contexto reducido, pero no esta probado.
- Requiere NVIDIA sm_80+ (Ampere o posterior) y CUDA 12.8 runtime.
- Velocidad de decodificacion: 82,6 tok/s en una RTX 5090 (dato del autor en redes sociales).
- Despliegue: exclusivamente mediante el runtime SGLang de Escha Labs (escha-runtime-qwen3dense). No es compatible con vLLM, llama.cpp u Ollama sin modificaciones, ya que necesita kernels especificos.
- Dependencias: PyTorch 2.9 fijado (cu128), Python 3.12, SGLang compilado desde el wheel de Escha.

## Comparativa con modelos similares

No se dispone de datos publicos de otros modelos cuantizados a 2 bits con los que comparar directamente. La comparacion mas relevante es con el modelo base sin cuantizar y con la referencia FP8 del mismo backend:

| Modelo | Parametros | Peso en disco | Contexto | Rendimiento (GPQA-Diamond) | Licencia |
|---|---|---|---|---|---|
| Qwen3.8-27B (FP8) | 27B | ~27 GB (estimado) | 128k+ | no disponible | Apache-2.0 |
| Qwen3.8-27B-Escha-W2 | 27B (declarado) | 10,15 GB | 64k-128k | 88,38 | Apache-2.0 |
| Otros 2-bit (p. ej. GGUF Q2_K) | no disponible | no disponible | no disponible | no disponible | no disponible |

La ventaja principal frente al FP8 es la reduccion de peso a aproximadamente un tercio, lo que permite ejecutar el modelo en hardware de consumo. Frente a cuantizaciones 2-bit genericas (como GGUF Q2_K), el esquema escha mantiene una precision mayor gracias a la asignacion mixta 2/3-bit y a los kernels de decodificacion optimizados, aunque no hay benchmarks publicos que lo confirmen.

## Limitaciones y advertencias

- Idioma: la model card declara exclusivamente ingles (`language: en`). Aunque el modelo base Qwen3.8 es multilingue, esta version cuantizada no garantiza soporte para otros idiomas.
- Dependencia de un runtime propietario: el modelo solo funciona con el SGLang build de Escha Labs. No es portable a otros motores de inferencia sin reescribir los kernels.
- Requisitos de versionado estrictos: PyTorch debe ser 2.9 exacto (cu128). Una version superior (p. ej. 2.11) provoca errores de simbolos indefinidos. El aviso de la card advierte que `transformers < 5.8` puede cargar la arquitectura con una ruta de atencion diferente, produciendo respuestas fluidas pero incorrectas.
- Discrepancia en el numero de parametros: el autor declara 27B, pero los safetensors contienen 6 340 437 856 parametros. Esta diferencia no esta explicada en la documentacion y podria indicar que la cuantizacion elimina o fusiona ciertos tensores, o que el conteo declarado se refiere al modelo original.
- Riesgo de alucinacion: como cualquier modelo de lenguaje, puede generar contenido falso con alta confianza, especialmente en modo thinking. El autor recomienda verificar respuestas en aplicaciones criticas.
- Sin autenticacion en el servidor: si se expone la API a otras maquinas (HOST=0.0.0.0), es necesario establecer una API_KEY manualmente, ya que el servidor no tiene autenticacion propia.
- Contexto maximo limitado por VRAM: aunque el modelo base soporta contextos mayores, en esta version el contexto de 128k solo es alcanzable con una configuracion ajustada y en GPUs de 24 GB o superiores.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/EschaLabs/Qwen3.8-27B-Escha-W2
- Runtime SGLang de Escha Labs: https://huggingface.co/EschaLabs/escha-runtime-qwen3dense
- Sitio web de Escha Labs: https://www.eschalabs.com/
- Modelo base Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Anuncio en X (Twitter): https://x.com/Eschalabs/status/2090476070969720890
