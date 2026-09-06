# 0xSero/GLM-5.3-Flash-EXL3-TR3-2.0bpw

## Resumen

El modelo GLM-5.3-Flash-EXL3-TR3-2.0bpw es una compresión selectiva del modelo multimodal GLM-5.3-Flash de Z.AI, creada por el usuario 0xSero. A diferencia de un modelo entrenado desde cero, se trata de un artefacto cuantizado que aplica el formato EXL3 K2 a 2.0 bits por peso (bpw) exclusivamente a los expertos enrutados de la arquitectura Mixture-of-Experts (MoE), mientras que el resto de componentes (atención, embeddings, visión, enrutado) se conservan en sus formatos originales. El resultado es un checkpoint de aproximadamente 111 GB en 133 shards safetensors, capaz de ejecutarse en un único NVIDIA DGX Spark con GPU GB10, usando un runtime vLLM personalizado con CUDA graphs. Su pipeline es image-text-to-text, por lo que admite texto, imágenes, video nativo y tool calling estructurado. Está diseñado para aprovechar una ventana de contexto configurada de 204.800 tokens, con una capacidad KV en vivo de más de 1,6 millones de tokens. La relevancia actual radica en que permite ejecutar un modelo multimodal de gran tamaño en un equipo compacto como el DGX Spark, aunque con una velocidad de decodificación limitada a unos 9,3 tokens por segundo, muy por debajo del objetivo de 25-50 tok/s declarado por su autor.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) multimodal, basada en transformer (detalles no disponibles) |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible |
| Longitud de contexto | 204.800 tokens configurados; 1.638.400 tokens de capacidad KV en vivo |
| Tipos de cuantización | 2.0 bpw (EXL3 K2) para expertos enrutados; resto en formatos originales. Otras variantes: 3.0 bpw y Q4 |
| Idiomas soportados | no disponible; prueba multilingüe con árabe, chino y polaco |
| Licencia | MIT |
| Formato de pesos | Safetensors (133 shards) con runtime EXL3 apilado por rangos; no compatible con vLLM estándar |

## Arquitectura y entrenamiento

El modelo no es un entrenamiento nuevo, sino una compresión selectiva de un checkpoint existente. La arquitectura subyacente es la del GLM-5.3-Flash de Z.AI, un modelo multimodal Mixture-of-Experts que combina procesamiento de texto, imágenes y video nativo. La compresión aplica el formato EXL3 K2 a los expertos enrutados, reduciendo su peso a 2.0 bits por peso, mientras que el enrutado, la atención, los embeddings y los componentes de visión se mantienen en sus formatos registrados. El artefacto incluye una capa MTP (multi-token prediction) no utilizada, con 889 tensores y 14.865.185.408 bytes, que se conserva por razones de procedencia pero no se carga en la línea base aceptada. El método de compresión se atribuye a la línea de trabajo de ExLlamaV3 (TurboDerp), con contribuciones de Brandon M. Music (predecesor GLM-5.2 EXL3/TR3), MiaAI Lab (runtime para DGX Spark) y Cerebras Research (observación REAP). No se proporcionan datos sobre el entrenamiento original (número de tokens, composición del dataset, RLHF/DPO), ya que la información disponible se centra en el artefacto comprimido.

## Capacidades

- Generación de texto y razonamiento, con soporte de modo conversacional.
- Tool calling / function calling estructurado: el modelo parsea correctamente nombres de función y argumentos JSON en las pruebas realizadas.
- Multimodalidad: procesa imágenes (4/4 fixtures sintéticos superaron comprobaciones JSON exactas) y video nativo (2/2 fixtures).
- Contexto largo: maneja 200.012 tokens de prompt reportados por el servidor, con recuperación exacta de información en posiciones del 5%, 35%, 65% y 95% del contexto.
- Capacidad multilingüe: supera pruebas de seguimiento de restricciones en árabe, chino y polaco.
- Soporte de agentes y razonamiento multi-paso, aunque con limitaciones de velocidad y un fallo documentado en una tarea de Python.
- No incluye aceleración DFlash2 en esta versión.

## Casos de uso

- Análisis de documentos extensos en un solo equipo: gracias a la ventana de 204.800 tokens y la recuperación exacta en posiciones alejadas, el modelo puede procesar manuales, contratos o logs de gran tamaño en un DGX Spark, sin necesidad de infraestructura distribuida.
- Asistentes conversacionales con herramientas: el soporte de tool calling estructurado permite integrar el modelo en agentes que necesitan llamar funciones externas, parsear JSON y mantener conversaciones multi-turno.
- Inspección visual automatizada en entornos de borde: al ejecutarse en hardware compacto y aceptar imágenes y video, puede usarse para validar fixtures de imagen o video en pipelines de control de calidad, con salidas en JSON exacto.
- Recuperación de información en corpus largos: la prueba de 200k con recuperación en cinco posiciones sugiere aplicaciones de búsqueda semántica sobre documentos extensos, como bases de conocimiento o archivos técnicos.
- Asistentes multilingües con restricciones: el modelo sigue instrucciones en árabe, chino y polaco, lo que lo hace adecuado para aplicaciones de soporte en varios idiomas donde se deban respetar reglas de formato o negativas.
- Investigación en compresión de modelos MoE: sirve como caso de estudio del efecto de la cuantización EXL3/TR3 a 2.0 bpw en expertos enrutados, aunque el KLD exacto contra el modelo base no se ha medido para este artefacto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. El autor proporciona mediciones internas de validación en un DGX Spark:

| Prueba | Resultado |
|---|---|
| Identidad de texto | Aprobado (contenido final exacto y parada natural) |
| Herramientas estructuradas | Aprobado (nombre de función y argumentos JSON) |
| Imágenes (4 fixtures) | 4/4 exacto |
| Video nativo (2 fixtures) | 2/2 exacto |
| Contexto 200k | 200.012 tokens; 4/4 recuperación en 5%, 35%, 65%, 95% |
| Multilingüe | Aprobado (árabe, chino, polaco) |
| Recuperación 200k end-to-end | 498,40 s; 474,04 s hasta el primer token; 9,28 tok/s |
| 1.024 tokens | 14,88 s; 9,16 tok/s |
| 32.768 tokens | 84,45 s; 9,47 tok/s |
| 131.072 tokens | 306,10 s; 9,28 tok/s |
| 1.024 tokens, concurrencia 2 | 29,84 s total; 9,34 tok/s media |

Nota: las mediciones son estimaciones de cliente basadas en conteos de uso y tiempos de streaming, no timings aislados de kernel.

## Requisitos de hardware

- VRAM estimada: 89,89 GiB para la carga del modelo en vivo, con KV cache en FP8 y contexto configurado de 204.800 tokens. La capacidad KV en vivo alcanza 1.638.400 tokens.
- GPU recomendada: NVIDIA DGX Spark con GPU GB10 (una sola unidad). No es viable en GPUs de consumo como RTX 4090 (24 GB) ni en configuraciones sin soporte para el runtime EXL3 apilado.
- Opciones de despliegue: requiere el runtime EXL3 apilado por rangos incluido en el repositorio de reproducción pública del autor, con contenedor ARM64 y receta de lanzamiento específica. No es compatible con vLLM estándar, llama.cpp, Ollama ni TGI sin modificaciones.
- Latencia: aproximadamente 9,3 tokens/s de decodificación estimada. El tiempo hasta el primer token para 200k fue de 474,04 s, lo que supone una latencia inicial muy alta.
- Throughput: bajo; el autor declara que no se alcanzó el objetivo de 25-50 tok/s. La configuración del servidor limita a una secuencia activa, por lo que las solicitudes concurrentes se ponen en cola.

## Comparativa con modelos similares

| Modelo | Cuantización | Peso | Contexto | Licencia |
|---|---|---|---|---|
| GLM-5.3-Flash-EXL3-TR3-2.0bpw | 2.0 bpw (EXL3 K2) | 111.352.026.456 bytes | 204.800 tokens | MIT |
| GLM-5.3-Flash-EXL3-3.0bpw | 3.0 bpw (EXL3) | no disponible | no disponible | MIT |
| GLM-5.3-Flash-EXL3-Q4 | 4.0 bpw (EXL3) | no disponible | no disponible | MIT |

No se dispone de información sobre benchmarks de las variantes 3.0bpw y Q4, por lo que no es posible comparar rendimiento. Tampoco se conocen otros modelos de la misma categoría con datos publicados en la información proporcionada.

## Limitaciones y advertencias

- Velocidad de decodificación limitada: el objetivo declarado de 25-50 tok/s no se cumplió; la línea base se sitúa en torno a 9,3 tok/s, lo que puede resultar inaceptable para aplicaciones interactivas en tiempo real.
- Fallo de calidad en tareas de código: una tarea simple de Python agotó el límite de 600 segundos generando razonamiento sin devolver contenido final. Esto indica problemas de capacidad de respuesta o de calidad de código en ciertos escenarios.
- Fidelidad no medida: el KLD exacto contra el modelo base BF16 no se ha calculado para este artefacto concreto, por lo que no se puede garantizar que la compresión no haya degradado la salida.
- Cobertura visual limitada: las comprobaciones de imagen y video se basan en fixtures sintéticos pequeños, no en benchmarks amplios de visión. Los resultados no son generalizables.
- DFlash2 no incluido: la aceleración DFlash2 se investigó pero falló en el build probado debido a incompatibilidad de formatos de KV. No se ofrece como opción.
- Dependencia de un runtime propietario: el checkpoint no es compatible con vLLM estándar ni con otros runtimes comunes, lo que dificulta su integración en infraestructuras existentes y obliga a usar el contenedor y la receta del autor.
- Solo probado en DGX Spark/GB10: no hay datos de rendimiento ni compatibilidad con otras GPUs, arquitecturas o entornos de nube.
- Capa MTP no utilizada: el checkpoint incluye una capa de predicción multi-token de 14,86 GB que no se carga por defecto. Aumenta el tamaño del repositorio sin aportar funcionalidad en la línea base.
- Sesgos y alucinaciones: no se proporciona información sobre sesgos conocidos ni mitigaciones. El fallo en la tarea de Python sugiere riesgo de alucinación o de razonamiento no productivo. La licencia MIT del artefacto permite uso comercial, pero se debe verificar la licencia del modelo base de Z.AI para asegurar el cumplimiento en producción.

## Enlaces

- HuggingFace del modelo: https://huggingface.co/0xSero/GLM-5.3-Flash-EXL3-TR3-2.0bpw
- Variante 3.0 bpw: https://huggingface.co/0xSero/GLM-5.3-Flash-EXL3-3.0bpw
- Variante Q4: https://huggingface.co/0xSero/GLM-5.3-Flash-EXL3-Q4
- Modelo base en HuggingFace: https://huggingface.co/zai-org/GLM-5.3-Flash-BF16
- Repositorio de reproducción pública: no disponible en la información proporcionada (referenciado en los metadatos del repositorio del modelo).
