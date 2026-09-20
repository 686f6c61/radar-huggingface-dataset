# MingZwhy/Qwen3-4B-W1.88-QAOPD

## Resumen

Qwen3-4B-W1.88-QAOPD es un checkpoint de Qwen/Qwen3-4B cuantizado a 1,88 bits por peso y posteriormente recuperado mediante un proceso en dos etapas: destilación con conciencia de cuantización (quantization-aware distillation, QAD) seguida de destilación on-policy (OPD). Lo publica el usuario MingZwhy en HuggingFace, con el código, el arnés de evaluación y la receta de entrenamiento en el repositorio GitHub MingZwhy/QAOPD. El problema que aborda es el de la inferencia de un modelo de 4.022.468.096 parámetros con una huella de pesos teórica inferior a 1 GB, un régimen de compresión muy por debajo de las cuantizaciones habituales de 4 u 8 bits.

El interés técnico está en la combinación de cuantización mixta (bloques de 256 pesos, con un 12,5 % de bloques en INT4 y el resto en INT1,58) con un pipeline de destilación que intenta recuperar parte de la calidad perdida. Los resultados publicados por el autor muestran una degradación considerable pero no colapsante: 64,59 en GSM8K frente a 86,35 del modelo BF16, y 60,4 en HumanEval frente a 82,3. La cuantización está "baked in": el checkpoint se carga ya cuantizado y no requiere un paso de calibración en tiempo de inferencia.

Es relevante ahora porque explora el extremo agresivo del eje tamaño-calidad en la familia Qwen3, un espacio donde la mayoría de alternativas prácticas se sitúan en Q4. El modelo se publicó el 20 de septiembre de 2026 y, en el momento de redactar esta ficha, acumula 0 descargas y 0 likes, por lo que no cuenta con validación independiente de la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso, heredada de Qwen/Qwen3-4B; la ficha del autor no detalla numero de capas, dimension oculta ni atencion |
| Parametros totales | 4.022.468.096 (≈4,02 B), medidos sobre los safetensors del repositorio |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base) |
| Tipos de cuantizacion | Pesos mixtos INT1,58 / INT4 en bloques de 256, con el 12,5 % de los bloques en INT4 → 1,88 bits efectivos. Embedding y cabeza de salida en INT4. Activaciones en INT8. KV cache en 16 bits. La cuantizacion esta integrada en el checkpoint |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 (heredada de Qwen3-4B) |
| Formato de pesos | safetensors con custom_code (requiere `trust_remote_code=True`); no se anuncian GGUF ni otros formatos |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-4B, un transformer decoder-only denso de 4.022.468.096 parametros, y no modifica su topologia: la intervencion es exclusivamente de compresion y recuperacion. La cuantizacion se aplica en bloques de 256 pesos con una asignacion mixta de precision: el 12,5 % de los bloques se conserva en INT4 y el 87,5 % restante se lleva a INT1,58, lo que da una media efectiva de 1,88 bits por peso. Las matrices de embedding y la cabeza de salida se mantienen en INT4, las activaciones se calculan en INT8 y la KV cache permanece en 16 bits. El checkpoint se distribuye ya cuantizado, sin necesidad de recalibrar en el momento de la carga.

Sobre esa base cuantizada se aplica un pipeline de recuperacion en dos fases descrito por el autor como QAD + OPD: primero una destilacion con conciencia de cuantizacion y despues una destilacion on-policy, en la que el propio modelo cuantizado genera las trayectorias que se usan para el ajuste. La ficha no especifica el volumen de tokens, la composicion del dataset, ni si hubo fases adicionales de RLHF o DPO; tampoco detalla la implementacion de los kernels personalizados que acompanan al `custom_code` del repositorio. El repositorio incluye un arnes de evaluacion reproducible en `docs/EVALUATION.md`.

## Capacidades

- Generacion de texto conversacional, dado el tag `conversational` y el pipeline `text-generation` declarados.
- Razonamiento matematico: evaluado en GSM8K, MATH-500 y AMC23, con resultados de 64,59, 36,00 y 16,25 respectivamente.
- Generacion de codigo: evaluado en MBPP y HumanEval, con 48,7 y 60,4 pass@1 greedy.
- Capacidades heredadas del modelo base Qwen3-4B (modo thinking, tool calling, soporte multilingue) que la ficha del autor no documenta ni verifica para esta cuantizacion; deben tratarse como no confirmadas.
- No se declaran capacidades de vision, audio ni multimodalidad.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.

## Casos de uso

- Despliegue en entornos con memoria muy restringida: con una huella de pesos teorica en torno a 1 GB, el modelo puede ejecutarse en dispositivos donde un Qwen3-4B en BF16 (unos 8 GB) no cabe, a cambio de asumir la perdida de calidad documentada.
- Investigacion en cuantizacion extrema: sirve como punto de comparacion reproducible frente a esquemas de 4 y 8 bits, ya que el autor publica el arnes de evaluacion en el repositorio QAOPD.
- Evaluacion de pipelines de destilacion on-policy: el checkpoint permite medir cuanto recupera la fase OPD frente a una cuantizacion sin destilacion, usando los mismos conjuntos de evaluacion declarados.
- Prototipado rapido y demos locales: la carga con `transformers` y `trust_remote_code=True` es directa, sin calibracion previa, lo que simplifica montar una demo funcional en una GPU de gama media.
- Clasificacion y puntuacion por verosimilitud: el propio autor reporta el agregado QA9 como media de nueve benchmarks puntuados por verosimilitud, un formato que sugiere uso viable para tareas de scoring y ranking de respuestas.
- Tareas auxiliares de baja exigencia en produccion: resumen, reformulacion o extraccion simple donde el coste por token y la memoria primen sobre la precision, evitando dominios donde la caida de rendimiento observada sea critica.
- Docencia y analisis de compromisos: util para ilustrar de forma cuantitativa el coste en calidad de bajar de 4 bits a 1,88 bits sobre un mismo modelo base.

## Benchmarks y rendimiento

Resultados publicados por el autor del modelo, medidos sobre este checkpoint frente al modelo sin cuantizar.

| Benchmark | Este modelo (W1.88) | Qwen3-4B BF16 | Diferencia |
|---|---:|---:|---:|
| GSM8K (5-shot, strict-match) | 64,59 | 86,35 | -21,76 |
| MATH-500 (4-shot) | 36,00 | 68,80 | -32,80 |
| AMC23 (avg@16) | 16,25 | 55,00 | -38,75 |
| MBPP (pass@1 greedy) | 48,7 | 67,6 | -18,9 |
| HumanEval (pass@1 greedy) | 60,4 | 82,3 | -21,9 |
| QA9 (media de nueve benchmarks por verosimilitud) | 52,83 | 61,63 | -8,80 |

Metodologia declarada: GSM8K a 5 disparos con strict-match, MATH-500 a 4 disparos, AMC23 con avg@16, MBPP y HumanEval con pass@1 greedy, y QA9 como media de igual peso de nueve benchmarks puntuados por verosimilitud.

## Requisitos de hardware

- Vram estimada para inferencia: segun la aritmetica declarada, 4,02 B de parametros a 1,88 bits ocupan aproximadamente 0,95 GB de pesos, cifra que sube ligeramente al contabilizar el embedding y la cabeza de salida en INT4. Hay que sumar la KV cache en 16 bits y los estados intermedios de activacion en INT8.
- Advertencia sobre el tamano real: el repositorio ocupa 8,1 GB, muy por encima de la huella teorica de los pesos cuantizados. La ficha no explica esa diferencia, por lo que conviene inspeccionar los archivos antes de planificar el despliegue.
- GPU recomendadas: cualquier GPU con 8 GB o mas de VRAM deberia ser suficiente por el calculo teorico, incluidas RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB, RTX 4070 y RTX 4090. No se detecta necesidad de A100 o H100 por tamano.
- Cabe en GPU de consumo: si, segun la estimacion teorica, aunque la discrepancia con el tamano del repositorio obliga a verificarlo en la practica.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` es la via documentada por el autor. Los tags incluyen `text-generation-inference` y `endpoints_compatible`, lo que apunta a compatibilidad con TGI y con Inference Endpoints. No hay evidencia de soporte para llama.cpp, Ollama ni vLLM, y la presencia de kernels personalizados hace probable que no funcionen sin adaptacion.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Contexto | GSM8K | HumanEval | Licencia | Disponibilidad |
|---|---:|---|---|---:|---:|---|---|
| MingZwhy/Qwen3-4B-W1.88-QAOPD | 4,02 B | Mixta INT1,58/INT4 (1,88 bits efectivos) | no disponible | 64,59 | 60,4 | Apache-2.0 | HuggingFace, safetensors + custom_code |
| Qwen/Qwen3-4B (BF16) | 4,02 B | Ninguna (BF16) | no disponible en la informacion proporcionada | 86,35 | 82,3 | Apache-2.0 | HuggingFace, safetensors |
| Cuantizaciones comunitarias de Qwen3-4B (por ejemplo GGUF Q4_K_M) | 4,02 B | 4 bits | heredado del base | no disponible | no disponible | Apache-2.0 | HuggingFace, GGUF |
| BitNet b1.58 2B4T (Microsoft) | ~2 B | Ternaria (~1,58 bits) | no disponible en la informacion proporcionada | no disponible | no disponible | MIT | HuggingFace; datos no verificados en la informacion proporcionada |

El punto de referencia mas directo y con datos comparables en la misma ficha es el propio Qwen3-4B en BF16, del que este checkpoint pierde entre 8,80 y 38,75 puntos segun el benchmark.

## Limitaciones y advertencias

- Degradacion de calidad severa y cuantificada: la mayor caida se da en AMC23 (-38,75 puntos) y MATH-500 (-32,80), lo que desaconseja su uso en razonamiento matematico competitivo o de varios pasos.
- La caida en generacion de codigo tambien es alta: -21,9 puntos en HumanEval y -18,9 en MBPP. No es adecuado como sustituto directo del modelo base en pipelines de codigo en produccion.
- Discrepancia de tamano no explicada: el repositorio ocupa 8,1 GB frente a una huella teorica de pesos cercana a 1 GB. La ficha no detalla la composicion del repositorio.
- Ejecucion de codigo de terceros: el tag `custom_code` y el uso obligado de `trust_remote_code=True` implican ejecutar codigo del autor al cargar el modelo. Conviene auditar los archivos antes de usarlo en entornos controlados.
- Ausencia de validacion externa: 0 descargas y 0 likes en el momento de la consulta. Todos los numeros proceden del propio autor.
- Idiomas: no declarados. Aunque el modelo base Qwen3 es multilingue, no hay confirmacion de que esta cuantizacion preserve ese comportamiento.
- Sesgos: no documentados por el autor. Al heredar los pesos del modelo base, cabe esperar los sesgos de Qwen3-4B, pero no hay evaluacion especifica.
- Riesgo de alucinacion: previsiblemente incrementado por el regimen de cuantizacion extrema, sin mediciones publicadas al respecto.
- Licencia: Apache-2.0, heredada del modelo base, permite uso comercial. Debe conservarse el aviso de licencia y verificarse los terminos aplicables a Qwen3-4B.
- KV cache en 16 bits: con contextos largos, el consumo de memoria crece de forma proporcional al contexto y puede superar ampliamente al de los pesos.
- Ausencia de datos de latencia, throughput y consumo energetico, imprescindibles para dimensionar un despliegue en produccion.
- No se anuncian versiones GGUF, por lo que no puede darse por hecho su funcionamiento en llama.cpp, Ollama u otros runners estandar.

## Enlaces

- HuggingFace: https://huggingface.co/MingZwhy/Qwen3-4B-W1.88-QAOPD
- Repositorio GitHub con codigo, receta y arnes: https://github.com/MingZwhy/QAOPD
- Documentacion de evaluacion: https://github.com/MingZwhy/QAOPD/blob/main/docs/EVALUATION.md
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B
- Resultados de busqueda web: la busqueda no devolvio resultados relevantes sobre este modelo (los enlaces obtenidos corresponden a soporte de YouTube TV y a foros de OBS, sin relacion con el modelo).
