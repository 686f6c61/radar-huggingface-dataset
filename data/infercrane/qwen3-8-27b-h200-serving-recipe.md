# infercrane/qwen3.8-27b-h200-serving-recipe

## Resumen

`infercrane/qwen3.8-27b-h200-serving-recipe` no es un checkpoint nuevo, sino una receta de servicio y un paquete de evidencia de rendimiento publicados por InferCrane. Reutiliza los pesos sin modificar del modelo upstream `Qwen/Qwen3.8-27B-FP8`, fijados en la revisión `017b9c7af6b5689d5dd426a76e0bc077eb5ca20a`, y documenta la configuración exacta con la que se consigue un endpoint más rápido sobre una única GPU NVIDIA H200. El interés del artefacto está en la reproducibilidad: incluye el digest de la imagen de runtime, el parche de correctitud, los modos de arranque seleccionado y de control, y el arnés de benchmark público.

El modelo subyacente es un Qwen de 27.000 millones de parámetros en precisión FP8, servido con SGLang 0.5.20 y decodificación especulativa nativa NEXTN/MTP (3 pasos especulativos, 4 tokens de borrador). En la comparativa pareada frente al arranque plano de SGLang, la receta seleccionada eleva el rendimiento agregado de 810,4 a 1.393,6 tokens/s a concurrencia 12, reduce el TTFT p50 de 1.591 ms a 739 ms y baja el coste de cómputo por millón de tokens de salida de 1,556 a 0,905 dólares.

Es relevante porque aborda un problema práctico de ingeniería de inferencia: cómo exprimir una GPU Hopper concreta para una carga de trabajo pública (3.919 tokens de entrada y 1.377 de salida, streaming, modo no-thinking) manteniendo la paridad determinista de salidas y las comprobaciones de la API. La frontera de servicio declarada es de 32.768 tokens de entrada y 2.048 de salida, aunque el runtime puede direccionar contextos bastante mayores.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No especificada por el autor. El recetario aplica un parche de estado recurrente FP32 de Gated DeltaNet, lo que apunta a una arquitectura híbrida de atención con componente de atención lineal, sin confirmación explícita en la model card |
| Parametros totales | 27.000 millones (deducidos del nombre del modelo; no confirmado con cifra exacta en la información disponible) |
| Parametros activos | No disponible |
| Longitud de contexto | El runtime puede direccionar contextos largos; la frontera de servicio pública declarada es de 32.768 tokens de entrada y 2.048 tokens de salida. Se completó una prueba cerca de 262K tokens, pero sin cumplir el objetivo de TTFT preregistrado |
| Tipos de cuantizacion | FP8 en pesos (upstream) y caché KV en FP8 E4M3. Otros formatos no disponibles |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | No disponible (se referencian los pesos FP8 del repositorio upstream) |

## Arquitectura y entrenamiento

La información disponible describe una ruta de ejecución, no un proceso de entrenamiento. No hay datos sobre número de tokens de entrenamiento, composición del dataset ni si se aplicaron fases de RLHF o DPO: esos datos corresponden al modelo upstream de Qwen y no se reproducen en este artefacto. Lo que sí se detalla es la pila de inferencia: pesos FP8, caché KV en FP8 E4M3, SGLang 0.5.20, decodificación especulativa nativa NEXTN/MTP con 3 pasos especulativos y 4 tokens de borrador, perfiles acotados de CUDA graphs para decodificación y prefill, y selección en tiempo de ejecución de kernels DeepGEMM FP8 sobre arquitectura Hopper.

El detalle técnico más relevante es el parche de estado recurrente FP32 de Gated DeltaNet, aplicado tanto al candidato seleccionado como al control. El parche está guardado por hash del código fuente y hace fallar la compilación si las fuentes esperadas de SGLang han cambiado, lo que garantiza que la receta solo se construye contra una versión concreta del runtime. La ruta especulativa aceptó el 61,4 % de los tokens propuestos, y las salidas del control determinista y del candidato seleccionado coincidieron, lo que permite atribuir la mejora de rendimiento a la configuración de servicio y no a un cambio en la distribución de salida.

## Capacidades

- Generación de texto en streaming y en modo buffer, con semántica de uso verificada.
- Salida estructurada (structured output) comprobada en la campaña de validación.
- Tool calling forzado, validado explícitamente como parte del conjunto de comprobaciones.
- Cuentas de tokens de prompt verificadas, con cero discrepancias en la ejecución pareada.
- Rechazo de peticiones malformadas.
- Decodificación especulativa NEXTN/MTP con paridad determinista frente al control.
- Modo multimodal heredado del modelo upstream (imagen y vídeo), aunque no cualificado por esta campaña, que solo cubre carga de texto.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Modo thinking: la carga de trabajo medida se declara explícitamente como no-thinking; no hay datos sobre el modo de razonamiento.

## Casos de uso

- Despliegue de un endpoint de chat con contexto largo: la frontera declarada de 32.768 tokens de entrada permite mantener conversaciones multi-turno extensas o adjuntar documentación técnica sin truncar, con un TTFT p50 de 739 ms a concurrencia 12.
- Agentes con tool calling en producción: el recetario valida tool calling forzado y salida estructurada, requisitos habituales en bucles de agente con llamadas a funciones externas.
- Pipelines de código asistido: con 1.393,6 tokens/s agregados a concurrencia 12, es viable atender varias sesiones simultáneas de autocompletado o generación de parches sin saturar una única H200.
- Resumen y extracción sobre documentos largos: el flujo de 3.919 tokens de entrada y 1.377 de salida medido es representativo de tareas de resumen con salida extensa y formato controlado.
- Backend de RAG: la combinación de salida estructurada, cuentas de tokens verificadas y streaming permite construir respuestas citadas con control de coste por petición.
- Validación de infraestructura de inferencia: el arnés de benchmark y el modo `--dry-run` permiten comparar configuraciones (por ejemplo, con y sin decodificación especulativa) sin necesidad de una H200 ni de un endpoint activo.
- Dimensionado de costes de GPU: las métricas de coste de cómputo por millón de tokens de salida permiten estimar el coste interno de un servicio antes de contratar capacidad.
- Servicio de alta concurrencia en una sola GPU: las bandas medidas de concurrencia 4 a 16 dan una curva directa para elegir el punto de operación según el equilibrio deseado entre latencia por petición y throughput agregado.

## Benchmarks y rendimiento

Hardware: 1× NVIDIA H200. Runtime: SGLang 0.5.20. Carga: 3.919 tokens de entrada → 1.377 tokens de salida, streaming, no-thinking, derivada de la traza pública Chutes. Clase de evidencia: cribado controlado, no resultado de API alojada ni comparativa entre proveedores.

| Concurrencia | Velocidad de salida por petición p50 | Throughput agregado de salida | TTFT p50 | TTFT p95 | ITL p95 |
|---:|---:|---:|---:|---:|---:|
| 4 | 202,3 tok/s | 699,0 tok/s | 265 ms | 801 ms | 5,81 ms |
| 8 | 164,0 tok/s | 1.073,1 tok/s | 351 ms | 1.646 ms | 7,45 ms |
| 12 | 141,0 tok/s | 1.393,6 tok/s | 739 ms | 2.472 ms | 8,67 ms |
| 16 | 120,5 tok/s | 1.510,8 tok/s | 741 ms | 3.360 ms | 11,61 ms |

Comparativa pareada a concurrencia 12 frente al control plano de SGLang sobre el mismo modelo, imagen, carga y H200:

| Medición | Control | Seleccionado | Cambio |
|---|---:|---:|---:|
| Throughput agregado de salida | 810,4 tok/s | 1.393,6 tok/s | 1,72× |
| Velocidad de salida por petición p50 | 76,1 tok/s | 141,0 tok/s | +85,3 % |
| TTFT p50 | 1.591 ms | 739 ms | −53,6 % |
| ITL p95 | 14,02 ms | 8,67 ms | −38,1 % |
| Cómputo de GPU por 1M de tokens de salida correctos | 1,556 $ | 0,905 $ | −41,9 % |
| Peticiones correctas | 24/24 | 24/24 | Igual |

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- GPU medida: 1× NVIDIA H200. Las mediciones son resultados de loopback sobre infraestructura Modal H200.
- VRAM: no declarada explícitamente en la información proporcionada. Como referencia de orden de magnitud, 27.000 millones de parámetros en FP8 ocupan aproximadamente 27 GB solo en pesos, a lo que hay que sumar la caché KV en FP8 E4M3; no se dispone de cifra oficial.
- Almacenamiento: al menos 80 GiB de espacio de caché en el host, según los requisitos de reproducción.
- Requisitos de host: Linux x86-64, Docker y NVIDIA Container Toolkit.
- ¿Cabe en GPU de consumo? No disponible. No se han publicado pruebas sobre RTX 4090, RTX 5090 u otras GPU de consumo, y la receta está específicamente cualificada para Hopper.
- Opciones de despliegue: SGLang 0.5.20 es el runtime cualificado. No se han validado vLLM, llama.cpp, Ollama ni TGI en esta campaña.
- Rendimiento: hasta 1.510,8 tokens/s agregados a concurrencia 16 y 1.393,6 tokens/s a concurrencia 12, con TTFT p50 entre 265 ms (concurrencia 4) y 741 ms (concurrencia 16).
- El benchmark admite endpoints remotos o de RunPod mediante `--base-url` y una clave inyectada por variable de entorno.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de rendimiento de modelos comparables de la misma categoría. La única comparación cuantitativa disponible es interna, entre el arranque de control plano de SGLang y la receta seleccionada, y ya se ha recogido en la sección de benchmarks.

## Limitaciones y advertencias

- No es un checkpoint nuevo: reutiliza los pesos de `Qwen/Qwen3.8-27B-FP8` en una revisión fija. Cualquier cambio en la revisión upstream invalida los resultados.
- Las mediciones son de loopback y no incluyen latencia de red pública ni de pasarela.
- La campaña cualifica únicamente carga de texto. El modelo upstream es multimodal, pero el tráfico de imagen y vídeo no fue validado.
- La frontera de servicio pública es de 32.768 tokens de entrada y 2.048 de salida. La prueba cercana a 262K completó correctamente pero incumplió el objetivo de TTFT preregistrado.
- El coste de cómputo de GPU no es un precio de venta de API: excluye pasarela, almacenamiento, monitorización, capacidad de recuperación y tiempo de inactividad.
- Los resultados solo son válidos para esa revisión exacta del modelo, runtime, hardware y carga de trabajo. Cambiar cualquiera de ellos exige recualificación.
- La receta depende de una imagen de contenedor y de un parche guardado por hash del código fuente; un cambio en las fuentes de SGLang provoca el fallo deliberado de la compilación (comportamiento fail-closed).
- El parche de Gated DeltaNet se aplicó también al control, por lo que es necesario para reproducir valores absolutos, pero no explica la mejora relativa.
- Repositorio con 0 descargas y 1 like en el momento de la consulta: validación comunitaria prácticamente nula.
- Licencia Apache 2.0 en este artefacto; conviene verificar por separado los términos del modelo upstream de Qwen antes de un uso comercial en producción.
- Riesgo de alucinación, sesgos lingüísticos y limitaciones idiomáticas: no disponibles en la información proporcionada.
- La imagen pública de prueba es deliberadamente distinta de la imagen de producción de RunPod, que añade autenticación, contabilidad, control de admisión y convenciones de volúmenes de red.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/infercrane/qwen3.8-27b-h200-serving-recipe
- Modelo upstream: https://huggingface.co/Qwen/Qwen3.8-27B-FP8 (revisión `017b9c7af6b5689d5dd426a76e0bc077eb5ca20a`)
- Laboratorio de evidencia interactivo: https://huggingface.co/spaces/infercrane/qwen3.8-27b-h200-lab
- Implementación del arranque fijado: https://github.com/infercrane/infercrane/tree/main/deploy/openrouter/qwen38-sglang-0520
- Decisión de lanzamiento y metodología: https://github.com/infercra... (URL truncada en la model card; no se puede resolver el enlace completo con la información disponible)
- Resultados de búsqueda web: no se han encontrado enlaces técnicos relevantes sobre este modelo; los resultados devueltos no guardan relación con el artefacto.
