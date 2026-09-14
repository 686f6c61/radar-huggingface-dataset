# Jeesup/svd-safety-l2_remove50_swapdisc_a010_b010_r05

## Resumen

`Jeesup/svd-safety-l2_remove50_swapdisc_a010_b010_r05` es un checkpoint de investigación derivado de `meta-llama/Llama-2-7b-chat-hf`. Sobre el modelo original se aplicó una compresión SVD-LLM que elimina el 50,01 % de los parámetros densos, seguida de un proceso de edición de parámetros en 10 rondas iterativas denominado *parameter-neutral swap*; este artefacto concreto corresponde a la ronda 5 de 10, con una regla de selección de componentes `disc_iter` y un presupuesto de restauración del 1,000 % de los parámetros densos (0,100 % por ronda). El resultado es un modelo denso de 6.738.415.616 parámetros activos en formato safetensors, con un tamaño de repositorio de 13,5 GB.

El propósito declarado del autor no es ofrecer un asistente conversacional, sino medir empíricamente cómo la compresión SVD degrada el comportamiento de seguridad de Llama-2-7b-chat y qué regla de selección de componentes repara mejor ese daño. El propio autor advierte que varias celdas de la matriz experimental están «deliberadamente degradadas en seguridad» respecto al modelo base, y que la compresión por sí sola incrementa la tasa de éxito de ataques. Las métricas publicadas en la model card lo confirman: 0,5019 de ASR en AdvBench con juez HarmBench, 0,2971 de ASR en StrongREJECT y 0,1651 de sobre-rechazo macro medido con WildGuard.

Su relevancia actual es metodológica: proporciona un punto de medida reproducible (semilla 42, fracción de parámetros resultante 0,4999, 3.132 componentes restaurados y 3.132 sustituidos) para estudiar la relación entre compresión, alineación y utilidad, un eje cada vez más importante a medida que se popularizan las técnicas de reducción de tamaño para despliegue en hardware limitado. No es, en ningún caso, un modelo apto para producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama-2), denso; comprimido mediante SVD-LLM (descomposición en valores singulares sobre las matrices de proyección) y posteriormente editado con *parameter-neutral swap* |
| Parametros totales | 6.738.415.616 (dato real de safetensors) |
| Parametros activos | No aplica: modelo denso, no MoE |
| Longitud de contexto | 4096 tokens (heredada del modelo base `meta-llama/Llama-2-7b-chat-hf`; no se especifica en la model card) |
| Tipos de cuantizacion | No se publican pesos cuantizados en el repositorio. Al ser un checkpoint `transformers` de 6.740 M de parámetros, es cuantizable externamente con bitsandbytes (INT8/NF4), GPTQ o AWQ |
| Idiomas soportados | No disponible en la model card; el modelo base Llama-2-7b-chat está optimizado principalmente para inglés |
| Licencia | Llama 2 Community License (se incluyen `LICENSE.txt` y `USE_POLICY.md` en el repositorio) |
| Formato de pesos | safetensors (librería `transformers`) |

Datos de procedencia adicionales declarados por el autor:

| Campo | Valor |
|---|---|
| Modelo base (sin comprimir) | `meta-llama/Llama-2-7b-chat-hf` |
| Compresión | SVD-LLM, 50,01 % de parámetros eliminados |
| Regla de selección | `disc_iter` |
| Presupuesto de restauración | 1,000 % de los parámetros densos |
| Componentes restaurados | 3132 |
| Componentes sustituidos | 3132 |
| Fracción de parámetros resultante | 0,4999 |
| Semilla | 42 |
| Rondas iterativas aplicadas | 5 de 10 |
| Bloque por ronda | 0,100 % de los parámetros densos |
| Parámetros insertados | 32.368.896 (0,50 % de los parámetros de proyección densos) |
| Valor de swap | `insert` (solo valor de inserción; desalojo ordenado por sigma) |
| Escala de inserción | 0,1 (componentes añadidos a esta fracción de su fuerza) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Llama-2-7b-chat: un transformer decoder-only denso con normalización RMSNorm previa, activación SwiGLU, embeddings rotatorios (RoPE) y atención causal estándar (no se emplea GQA en la variante de 7B). No hay ningún entrenamiento nuevo en este artefacto: el checkpoint se obtiene por dos transformaciones post-hoc sobre los pesos del modelo base. La primera es la compresión SVD-LLM, que descompone las matrices de proyección y descarta componentes hasta eliminar el 50,01 % de los parámetros densos, dejando una fracción final de 0,4999. La segunda es un procedimiento de edición iterativa denominado *parameter-neutral swap*, consistente en restaurar 3.132 componentes y desalojar otros 3.132 manteniendo neutro el recuento de parámetros.

Este checkpoint en concreto corresponde a una ejecución intermedia: se aplicaron 5 de las 10 rondas previstas, con un bloque de 0,100 % de los parámetros densos por ronda y una escala de inserción de 0,1 (los componentes se añaden a una décima parte de su fuerza original). La regla de selección de componentes evaluada en esta celda es `disc_iter`, y se insertaron 32.368.896 parámetros (0,50 % de los parámetros de proyección densos), con desalojo ordenado por valor singular. Todo el experimento está fijado con semilla 42. No se documenta en la model card ningún ajuste adicional con RLHF, DPO o SFT sobre este checkpoint, ni una fase de entrenamiento con datos nuevos.

## Capacidades

- Generación de texto conversacional en inglés, heredada del modelo base Llama-2-7b-chat, aunque degradada por la compresión y por el proceso de edición.
- Razonamiento de un solo turno y conversaciones multi-turno dentro de la ventana de contexto heredada (4096 tokens).
- Capacidad de seguir instrucciones y mantener el formato de diálogo de Llama-2 (`[INST]` / `[/INST]`), siempre que la compresión no haya destruido el comportamiento correspondiente.
- Comportamiento de rechazo parcialmente conservado: la model card reporta un 0,1651 de sobre-rechazo macro medido con WildGuard, lo que indica que el modelo sigue negándose a una fracción de peticiones (incluidas algunas benignas).
- No se documenta soporte de *tool calling* ni de *function calling*.
- No se documenta soporte explícito de agentes ni de razonamiento multi-paso estructurado.
- No se documentan capacidades de visión, audio ni modo de razonamiento explícito (*thinking mode*).
- Capacidades multilingües: no disponibles en la información proporcionada.
- Capacidad de interés para investigación: servir como sujeto experimental reproducible para medir el impacto de la compresión SVD en la seguridad y la utilidad de un modelo alineado.

## Casos de uso

- Investigación sobre compresión y alineación: usar este checkpoint como una de las celdas de la matriz experimental para cuantificar cuánto daño de seguridad introduce una compresión SVD-LLM del 50 % y cuánto recupera la regla `disc_iter` con presupuesto del 1 %.
- Evaluación de seguridad tipo *red teaming*: alimentar el modelo con los conjuntos AdvBench y StrongREJECT y reproducir las tasas de éxito de ataque publicadas (0,5019 y 0,2971 con juez HarmBench) para validar pipelines de evaluación propios.
- Calibración de clasificadores de contenido dañino: al ser un modelo con ASR elevado de forma controlada, resulta útil como generador de ejemplos positivos para entrenar o ajustar umbrales de detectores de contenido tóxico en un entorno de laboratorio.
- Estudio de ablación de reglas de selección de componentes: comparar esta celda (`disc_iter`, 5 de 10 rondas) con otras celdas de la misma matriz para determinar qué criterio de selección preserva mejor el comportamiento de rechazo sin sacrificar utilidad.
- Medición de sobre-rechazo: emplear la métrica de 0,1651 sobre WildGuard como referencia para analizar si la compresión vuelve al modelo excesivamente conservador en peticiones benignas.
- Interpretabilidad de representaciones comprimidas: analizar los subespacios conservados y desalojados por la descomposición SVD para entender qué direcciones del espacio de pesos codifican el comportamiento de seguridad.
- Reproducibilidad académica: replicar el experimento completo con semilla 42 y los hiperparámetros documentados (`remove50`, `swapdisc`, `a010`, `b010`, `r05`) para verificar los resultados publicados.
- Docencia y formación: ilustrar en un curso de posgrado los compromisos entre tamaño, utilidad y seguridad en modelos del lenguaje, usando un caso con métricas publicadas y procedencia trazable.

## Benchmarks y rendimiento

La model card únicamente publica métricas de seguridad y de rechazo. No se han divulgado resultados de MMLU, HumanEval, GSM8K ni de otras pruebas de capacidad general en la información disponible.

| Metrica | Valor | Juez / herramienta |
|---|---|---|
| AdvBench ASR | 0,5019 | HarmBench judge |
| StrongREJECT ASR | 0,2971 | HarmBench judge |
| Sobre-rechazo macro | 0,1651 | WildGuard |

No se dispone de valores equivalentes para el modelo base `meta-llama/Llama-2-7b-chat-hf` en la información proporcionada, por lo que no es posible cuantificar aquí el delta exacto introducido por la compresión y la edición.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: en torno a 13,5 GB solo para pesos, más el espacio de activaciones y la caché KV (aproximadamente 15-17 GB en total para contextos largos).
- VRAM estimada en INT8: alrededor de 7 GB de pesos; en INT4/NF4, aproximadamente 3,5-4 GB de pesos.
- GPU recomendadas: NVIDIA A100 40/80 GB, H100, L40S o A6000 para FP16 sin cuantizar con margen; RTX 4090 (24 GB) y RTX 3090 (24 GB) son suficientes para FP16 con contexto moderado.
- Cabe en GPU de consumo: sí, en tarjetas de 24 GB (RTX 3090, 4090) en FP16, y en 8-12 GB (RTX 3070, 4060 Ti 16 GB, etc.) si se cuantiza a INT8 o INT4.
- Opciones de despliegue: `transformers` (librería declarada), Text Generation Inference (el repositorio está etiquetado como `text-generation-inference` y `endpoints_compatible`). Para vLLM o llama.cpp sería necesario convertir los pesos, ya que no se publican ficheros GGUF. Ollama requeriría igualmente una conversión previa a GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Seguridad publicada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Jeesup/svd-safety-l2_remove50_swapdisc_a010_b010_r05` | 6.738.415.616 | 4096 (heredado del base) | AdvBench ASR 0,5019; StrongREJECT ASR 0,2971; sobre-rechazo 0,1651 | Llama 2 Community License | HuggingFace, 0 descargas, 0 likes |
| `meta-llama/Llama-2-7b-chat-hf` (modelo base) | ~6,74 mil millones | 4096 | No disponible en esta información | Llama 2 Community License | HuggingFace (modelo de referencia) |
| Otras celdas de la misma matriz experimental (`remove50` con distintas reglas y presupuestos) | Fracción de parámetros ~0,4999 | No disponible | No disponible | Llama 2 Community License | No disponible en esta información |

No se dispone de datos de benchmarks comparativos frente a alternativas de la misma categoría (por ejemplo, otros métodos de compresión como LLM-Pruner, Wanda o SliceGPT) en la información proporcionada, por lo que no se puede establecer una comparación cuantitativa de rendimiento.

## Limitaciones y advertencias

- Artefacto de investigación, no un asistente desplegable: la propia model card indica explícitamente que cada celda de la matriz debe tratarse como «sujeto experimental» y no como un modelo listo para producción.
- Seguridad deliberadamente degradada: la compresión SVD por sí sola eleva la tasa de éxito de ataques, y la model card advierte que varias celdas del grid están degradadas a propósito. Un ASR de 0,5019 en AdvBench implica que aproximadamente la mitad de las peticiones dañinas del conjunto logran su objetivo según el juez HarmBench.
- Riesgo elevado de contenido dañino: 0,2971 de ASR en StrongREJECT confirma que la degradación no es un artefacto de un único benchmark.
- Sobre-rechazo: 0,1651 de sobre-rechazo macro en WildGuard indica que el modelo también rechaza peticiones benignas, lo que reduce su utilidad práctica incluso en escenarios legítimos.
- Sesgos conocidos: no disponibles en la información proporcionada; se heredan potencialmente los sesgos del modelo base Llama-2-7b-chat, no cuantificados aquí.
- Riesgo de alucinación: no medido en la model card; es previsible un aumento respecto al modelo base al haberse eliminado el 50 % de los parámetros de proyección.
- Limitaciones de idioma: la model card no declara idiomas soportados; el modelo base está orientado principalmente al inglés.
- Limitaciones de contexto: la ventana heredada es de 4096 tokens, y el autor no verifica que la compresión preserve el comportamiento en contextos largos.
- Restricciones de licencia: se aplica la Llama 2 Community License junto con `USE_POLICY.md`; cualquier uso comercial o derivado queda sujeto a ambas, incluidas las cláusulas de atribución y las restricciones de uso aceptable de Meta.
- Caveat de despliegue: el checkpoint es una ejecución intermedia (ronda 5 de 10), por lo que no representa el resultado final del método `disc_iter` con el presupuesto completo del 1,0 %.
- Advertencia de evaluación: el autor recomienda evaluar el modelo por cuenta propia antes de extraer conclusiones, dado que se trata de un punto de medida aislado dentro de un grid.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Jeesup/svd-safety-l2_remove50_swapdisc_a010_b010_r05
- Modelo base: https://huggingface.co/meta-llama/Llama-2-7b-chat-hf
- Licencia Llama 2 (incluida en el repositorio como `LICENSE.txt`): https://ai.meta.com/llama/license/
- Política de uso aceptable de Llama 2 (incluida en el repositorio como `USE_POLICY.md`): https://ai.meta.com/llama/use-policy/
- Búsqueda web realizada: no se han encontrado enlaces relevantes al modelo, al paper de SVD-LLM ni a repositorios asociados; los resultados devueltos corresponden a empresas de instalación fotovoltaica y no guardan relación con este artefacto.
