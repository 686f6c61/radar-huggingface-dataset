# hoborific/Gemma-4-Writers-31B-V2-W8A16-FP8

## Resumen

Gemma-4-Writers-31B-V2-W8A16-FP8 es un checkpoint cuantizado publicado por el usuario hoborific a partir de Ateron/Gemma-4-Writers-31B-V2, un modelo de 31.273.088.876 parámetros (31,27 B) con pipeline image-text-to-text. La contribución del autor no es un entrenamiento nuevo, sino una cuantización offline en formato W8A16 FP8 sobre compressed-tensors: los pesos de las proyecciones lineales 2D se almacenan en float8_e4m3fn con escalas simétricas por canal de salida, mientras que las activaciones se mantienen en bf16/fp16.

El interés práctico del checkpoint es la reducción de huella de memoria frente a los pesos en bf16 del modelo base, junto con un esquema de escalas por fila con búsqueda de clipping por MSE que, segun la model card, ofrece mejor relacion senal-ruido que la ruta de cuantizacion FP8 online por tensor de vLLM. El repositorio ocupa 33,3 GB y esta pensado para servirse con vLLM, con soporte explicito para Intel XPU (kernel XPUW8A16FP8LinearKernel) y NVIDIA CUDA SM75 o superior.

Se trata de un artefacto con 0 descargas y 0 likes en el momento de la consulta, sin licencia ni idiomas declarados, y cuyo modelo base no aporta informacion publica verificable en los datos disponibles. Es, por tanto, un checkpoint a evaluar con cautela antes de cualquier uso en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (hereda la del modelo base Ateron/Gemma-4-Writers-31B-V2; la model card menciona torre de vision y una lista de ignore con routers/experts) |
| Parametros totales | 31.273.088.876 (31,27 B) |
| Parametros activos | No disponible |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | W8A16 FP8: pesos en float8_e4m3fn con escalas simetricas por canal de salida; activaciones en bf16/fp16 |
| Idiomas soportados | No disponibles |
| Licencia | No disponible |
| Formato de pesos | safetensors con formato float-quantized de compressed-tensors |
| Modelo base | Ateron/Gemma-4-Writers-31B-V2 |
| Pipeline | image-text-to-text |
| Tamano del repositorio | 33,3 GB |
| Libreria declarada | transformers |
| Plataformas de inferencia soportadas | Intel XPU; NVIDIA CUDA SM75+ (Turing o posterior); no soportado en ROCm, CPU ni TPU |
| Fecha de publicacion | 2026-10-15 |

## Arquitectura y entrenamiento

No se ha publicado informacion sobre la arquitectura interna, los datos de entrenamiento ni el proceso de alineacion del modelo base en la informacion disponible. Los unicos datos tecnicos verificables corresponden al proceso de cuantizacion aplicado sobre ese base. La model card indica que se cuantizan exclusivamente los pesos de las proyecciones lineales 2D (q/k/v/o de atencion y gate/up/down del MLP), mientras que embeddings, capas de normalizacion, lm_head, routers/expertos y la torre de vision permanecen en bf16 y figuran en la lista `ignore` del checkpoint, de modo que vLLM no los transforma al cargar.

El metodo de cuantizacion parte de una escala por fila de salida calculada como `amax / 448`, refinada mediante una busqueda de clipping por error cuadratico medio sobre unas 9 fracciones de recorte en el rango 0,8-1,0× amax, seleccionando la escala de menor error para cada fila. Los pesos se cuantizan despues como `q = e4m3(w / scale)` con redondeo al mas cercano y saturacion. La model card afirma que este esquema por canal con clipping supera la SNR de la ruta de cuantizacion FP8 online por tensor de vLLM (`--quantization fp8`). No se documenta ningun entrenamiento adicional, destilado ni ajuste posterior a la cuantizacion.

## Capacidades

- Generacion de texto conversacional: el checkpoint incluye la etiqueta `conversational`, aunque no se detallan capacidades especificas ni evaluaciones.
- Entrada multimodal imagen-texto: la pipeline declarada es `image-text-to-text` y la model card menciona una torre de vision que permanece en bf16, lo que indica soporte de entrada de imagenes junto a texto.
- Escritura y generacion de contenido: el nombre del modelo base ("Writers") sugiere orientacion a tareas de redaccion, pero no hay documentacion que lo confirme en la informacion disponible.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles; no se declara ninguna lista de idiomas.
- Modo de razonamiento explicito (thinking mode), audio u otras capacidades especiales: no disponible.
- Compatibilidad con endpoints: el tag `endpoints_compatible` indica que el checkpoint esta preparado para despliegue en infraestructura de inferencia gestionada compatible.

## Casos de uso

- Servicio de inferencia con vLLM sobre Intel XPU: el checkpoint esta disenado especificamente para el kernel XPUW8A16FP8LinearKernel, por lo que es adecuado para desplegar el modelo base en aceleradores Intel con menor huella de memoria que en bf16.
- Despliegue en GPU NVIDIA de generacion Turing o posterior: mediante el kernel HummingFP8ScaledMMLinearKernel (con el paquete `humming` instalado) o MarlinFP8ScaledMMLinearKernel como alternativa, lo que permite servir el modelo en flotas CUDA existentes sin reentrenar nada.
- Asistencia a la redaccion en aplicaciones editoriales: si el modelo base conserva la orientacion de escritura que sugiere su nombre, el checkpoint puede servir como backend de herramientas de redaccion, reescritura y generacion de borradores; esta aplicacion queda pendiente de validacion, ya que no hay evaluaciones publicadas.
- Descripcion automatica de imagenes y generacion de texto alternativo: la pipeline image-text-to-text con torre de vision en bf16 permite procesar imagenes y producir descripciones, util en accesibilidad web o catalogacion de contenido grafico.
- Base para cuantizaciones adicionales o destilacion: al ser un derivado cuantizado y no un modelo entrenado desde cero, resulta util como punto de partida para experimentos de compresion (por ejemplo, comparar W8A16 FP8 frente a otros esquemas) sobre una arquitectura de 31 B parametros.
- Evaluacion comparativa de kernels de cuantizacion: el checkpoint permite medir en condiciones controladas la diferencia entre escalas por canal con clipping y la cuantizacion FP8 online por tensor de vLLM en el mismo modelo base.
- Prototipado interno con requisitos de memoria ajustados: en un nodo con 48 GB de VRAM (L40S o A6000), este checkpoint reduce el espacio ocupado por pesos frente a los aproximadamente 62 GB que exigiria una copia en bf16 de 31,27 B parametros, aunque la memoria exacta depende de los modulos no cuantizados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion, y tampoco se proporcionan mediciones de latencia o throughput. La unica comparacion de rendimiento mencionada es cualitativa: el autor afirma que el esquema de escalas por canal de salida con busqueda de clipping ofrece mejor SNR que la ruta FP8 online por tensor de vLLM, sin aportar cifras.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos del repositorio ocupan 33,3 GB, pero embeddings, normalizaciones, lm_head, routers/expertos y la torre de vision siguen en bf16, por lo que el consumo real de pesos supera esa cifra. Como referencia orientativa, se necesitarian al menos unos 34-36 GB solo para pesos, mas el espacio de cache KV.
- GPU recomendadas: A100 80 GB, H100 80 GB, L40S 48 GB o RTX A6000 48 GB para ejecucion en una sola tarjeta con contexto moderado.
- Configuraciones multi-GPU: dos RTX 4090 de 24 GB o dos L40S con tensor parallelism podrian alojar el modelo, aunque no hay datos publicados de rendimiento en estas configuraciones.
- GPU de consumo: no cabe en una unica GPU consumer de 24 GB (RTX 4090, 3090, 5090) sin recurrir a offload a memoria del sistema, que degrada notablemente la latencia.
- Compatibilidad de kernels: en NVIDIA se requiere SM75 o superior. Con el paquete `humming` instalado se usa HummingFP8ScaledMMLinearKernel; en caso contrario, MarlinFP8ScaledMMLinearKernel.
- Backends no soportados: ROCm, CPU y TPU no disponen de kernel W8A16-FP8 en vLLM, por lo que la carga falla con un error de kernel inexistente.
- Opciones de despliegue: vLLM es la ruta documentada y soportada. No se publican pesos GGUF, por lo que llama.cpp y Ollama no pueden cargar este checkpoint tal cual; TGI tampoco aparece mencionado como soportado.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo de pesos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| hoborific/Gemma-4-Writers-31B-V2-W8A16-FP8 | 31,27 B | FP8 W8A16 (compressed-tensors), ~33,3 GB de repo | No disponible | No disponible | vLLM en Intel XPU y NVIDIA CUDA SM75+ |
| Ateron/Gemma-4-Writers-31B-V2 (base) | 31,27 B | bf16 (estimacion de ~62 GB para los pesos completos) | No disponible | No disponible | Depende del repositorio original |
| Cuantizacion FP8 online de vLLM sobre el mismo base | 31,27 B | FP8 por tensor calculado en tiempo de carga | No disponible | No disponible | vLLM, cualquier backend con soporte FP8 |

No se dispone de informacion sobre otros modelos comparables de la misma categoria en los datos proporcionados, ni de resultados de benchmarks que permitan una comparacion cuantitativa de calidad entre estas opciones.

## Limitaciones y advertencias

- Ausencia de validacion comunitaria: el repositorio presenta 0 descargas y 0 likes, por lo que no existe evidencia externa de que el checkpoint cargue o funcione correctamente en produccion.
- Licencia no declarada: ni el checkpoint ni el modelo base indican licencia en la informacion disponible, lo que impide determinar si el uso comercial esta permitido. Es un riesgo legal que debe resolverse antes de cualquier despliegue.
- Idiomas no declarados: no se especifica que idiomas soporta el modelo, por lo que no puede asumirse un comportamiento multilingue fiable.
- Procedencia del modelo base incierta: no se aportan datos de entrenamiento, composicion del dataset, proceso de alineacion ni evaluaciones del modelo Ateron/Gemma-4-Writers-31B-V2, del que este checkpoint es un derivado directo.
- Riesgo de alucinacion: no cuantificado. La cuantizacion FP8 puede degradar ligeramente la fidelidad respecto al base en bf16, y no hay evaluaciones que midan ese efecto.
- Memoria no reducida al minimo teorico: al mantener embeddings, lm_head, normalizaciones, routers/expertos y la torre de vision en bf16, la huella real es superior a un byte por parametro y supera los 33,3 GB del repositorio.
- Restricciones de backend: la carga falla en ROCm, CPU y TPU por ausencia de kernel W8A16-FP8 en vLLM, lo que limita el despliegue a Intel XPU y NVIDIA SM75 o superior.
- Dependencia de paquetes: el uso del kernel Humming requiere instalar el paquete `humming`; sin el, se recurre a Marlin, con caracteristicas de rendimiento potencialmente distintas y no documentadas.
- Fechas de publicacion y actualizacion muy proximas (2026-10-15), sin historial de versiones ni mantenimiento posterior documentado.
- Compatibilidad de versiones: el formato `float-quantized` de compressed-tensors exige versiones de vLLM y de la libreria compressed-tensors compatibles; no se indican versiones minimas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/hoborific/Gemma-4-Writers-31B-V2-W8A16-FP8
- Modelo base: https://huggingface.co/Ateron/Gemma-4-Writers-31B-V2
- Libreria compressed-tensors (citada en la model card): https://github.com/neuralmagic/compressed-tensors
- Resultados de la busqueda web: no se han encontrado enlaces relevantes al modelo; los resultados devueltos no guardan relacion con el contenido de esta ficha.
