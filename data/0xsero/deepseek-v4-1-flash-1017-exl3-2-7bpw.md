# 0xSero/DeepSeek-V4.1-Flash-1017-EXL3-2.7bpw

## Resumen
DeepSeek-V4.1-Flash-1017 EXL3 2.7 bpw es una cuantización agresiva del checkpoint `deepseek-ai/DeepSeek-V4.1-Flash-1017`, publicada por 0xSero. El objetivo es ejecutar un modelo de mezcla de expertos de gran tamaño en dos NVIDIA DGX Spark con 256 GB de memoria agregada, mediante EXL3 trellis coding, vLLM y el plugin `vllm_exl3_moe`. El repositorio ocupa 198,5 GB e incluye 110 archivos; las tablas Engram de 203 GB no se incluyen y deben descargarse aparte desde el modelo base.

La relevancia práctica está en que permite desplegar un modelo con 262.144 tokens de contexto, razonamiento de DeepSeek-V4.1, parsing de tool calls y decodificación especulativa DSpark en infraestructura local, con una API compatible con OpenAI en el puerto 8000. El autor publica métricas de fidelidad frente al modelo nativo: KLD media de 0,0304 nats y acuerdo top-1 del 94,95 % sobre un panel de 199 conversaciones y 254.846 posiciones evaluadas.

No es un modelo entrenado desde cero, sino una cuantización del checkpoint base en la revisión `1bae0e10`. La información disponible no detalla el número total de parámetros, los parámetros activos ni la composición del entrenamiento original de DeepSeek.

## Especificaciones tecnicas
| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con expertos enrutados y shared experts; incluye atención, LM head, tensores de visión y compresores según el checkpoint oficial. No se especifican número total de capas, dimensión oculta ni configuración de atención. |
| Parametros totales | No disponible. El identificador del checkpoint incluye «1017», pero la model card no confirma el número de parámetros. |
| Parametros activos | No disponible. |
| Longitud de contexto | 262.144 tokens, según la sección de serving del autor. |
| Tipos de cuantizacion | EXL3 trellis coding; expertos enrutados en K2/K3/K4/K5 con media de 2,70 bpw (2,90 por token decodificado); lineales densos y LM head en EXL3 K4, con `wo_a` en K5; drafter DSpark en FP8/MXFP4 oficial; normas, router, embeddings, visión y compresores en tensores oficiales. Tablas Engram no incluidas. |
| Idiomas soportados | No disponible. La calibración incluye un 10 % multilingüe y el panel evalúa el dominio multilingüe, pero no se enumeran idiomas. |
| Licencia | MIT. |
| Formato de pesos | Safetensors; librería vLLM; compatible con exllamav3 1.6.0 y el plugin `vllm_exl3_moe`. |
| Modelo base | `deepseek-ai/DeepSeek-V4.1-Flash-1017`, revisión `1bae0e1088993b9b82de08f59de5be5a34e42170`. |
| Tamano del repositorio | 198,5 GB, 110 archivos. |
| Tablas Engram | 203 GB, no incluidas; deben descargarse los dos shards del modelo base en la misma carpeta. |

## Arquitectura y entrenamiento
La arquitectura es de mezcla de expertos. El checkpoint contiene 15.360 expertos enrutados en las capas 0-39, con anchos de bits asignados por experto según sensibilidad medida: 6.278 expertos en K2, 7.447 en K3, 1.600 en K4 y 35 en K5. Los super expertos de las capas 37-39 usan K5 o K3 como mínimo. Las lineales de atención y de shared experts están en EXL3 K4, salvo `wo_a` en K5; el LM head también está en K4. El drafter DSpark `mtp.0-2` conserva la precisión oficial FP8/MXFP4. Normas, router, embeddings, tensores de visión y compresores se mantienen en los tensores oficiales del checkpoint 1017.

No se trata de un entrenamiento nuevo: es una cuantización EXL3 del checkpoint `DeepSeek-V4.1-Flash-1017`. El proceso usó 927 secuencias y 1.216.384 tokens de respuestas nativas del modelo 1017, sin límite de salida, en ventanas de 2.048 tokens. La composición de calibración fue 35 % agéntico, 25 % código (TypeScript, Rust, Go, C, C++, HTML y matemáticas), 20 % religión y filosofía, 10 % multilingüe, 10 % salida estructurada y 1,4 % tokens aleatorios para que los expertos poco enrutados vieran entradas. El panel de KLD es disjunto del conjunto de calibración. No se proporcionan datos sobre el entrenamiento original del modelo base, como número de tokens, composición del dataset o uso de RLHF/DPO.

## Capacidades
- Generación de texto y razonamiento multi-paso: el stack de serving incluye el parsing de razonamiento de DeepSeek-V4.1, lo que permite separar el razonamiento interno de la respuesta final.
- Tool calling y function calling: la API compatible con OpenAI expone parsing de tool calls de DeepSeek-V4.1, adecuado para integrar el modelo en agentes y pipelines.
- Uso agéntico: el dominio agéntico representa el 35 % de la calibración y obtiene KLD 0,0277 con top-1 del 94,96 % en el panel.
- Código: el dominio de código concentra el 65 % de las posiciones del panel, con KLD 0,0182 y top-1 del 95,83 %; la calibración incluye TypeScript, Rust, Go, C, C++, HTML y matemáticas.
- Matemáticas: el panel de matemáticas obtiene KLD 0,0230 y top-1 del 94,72 %.
- Contexto largo: soporta 262.144 tokens; el dominio de contexto largo obtiene KLD 0,0379 y top-1 del 95,20 %.
- Multilingüe: la calibración incluye un 10 % multilingüe y el panel obtiene KLD 0,0827 con top-1 del 93,35 %, aunque no se enumeran los idiomas soportados.
- Salida estructurada: el 10 % de la calibración es salida estructurada, lo que favorece extracción de datos y generación de JSON, aunque no hay una métrica específica publicada.
- Decodificación especulativa: incluye el drafter DSpark `mtp.0-2` en precisión oficial, activable en el stack de serving.
- Visión: el checkpoint oficial contiene tensores de visión, pero la model card no documenta capacidades multimodales; no debe asumirse soporte de imagen sin validación.

## Casos de uso
- Despliegue on-premise en dos DGX Spark: el modelo está pensado para ejecutarse en dos nodos con 256 GB de memoria agregada y una API OpenAI-compatible en el puerto 8000. Es adecuado para organizaciones que necesitan inferencia local de un MoE grande sin enviar datos a la nube.
- Generación de código en producción: el dominio de código muestra la mejor fidelidad de la cuantización, con KLD 0,0182 y top-1 del 95,83 %. Puede integrarse en revisión de código, generación de tests y pipelines de CI/CD mediante tool calling y salida estructurada.
- Agentes autónomos de investigación: el modelo soporta razonamiento multi-paso, tool calling y contexto de 262.144 tokens. El dominio agéntico mantiene KLD 0,0277, lo que permite encadenar búsquedas, lectura de documentos y ejecución de acciones con supervisión.
- Análisis de documentación técnica larga: con 262.144 tokens de contexto y KLD 0,0379 en contexto largo, puede resumir expedientes, comparar versiones de especificaciones o extraer entidades de manuales extensos.
- Asistencia matemática y análisis cuantitativo: el dominio de matemáticas obtiene KLD 0,0230 y top-1 del 94,72 %, adecuado para resolución de problemas, verificación de cálculos y generación de explicaciones paso a paso.
- Atención al cliente con supervisión humana: permite conversaciones multi-turno y tool calling para consultar pedidos o bases de conocimiento. Conviene validar respuestas porque el dominio de chat es el peor del panel, con KLD 0,0835 y top-1 del 90,68 %.
- Asistente multilingüe con evaluación previa: el modelo incorpora un 10 % de calibración multilingüe y top-1 del 93,35 % en ese dominio, pero al no enumerarse idiomas es necesario evaluar el par de idiomas concreto antes de producción.
- Investigación en cuantización: la receta, el panel de KLD, el conjunto de calibración y los logs permiten reproducir el proceso y estudiar el impacto de EXL3 a 2,7 bpw en un MoE de este tamaño.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks estándar como MMLU, HumanEval o GSM8K en la información disponible. Sí se publican métricas de fidelidad de la cuantización frente al modelo nativo, con evaluación teacher-forced sobre el panel de sudoingX: 199 conversaciones y 254.846 posiciones de asistente.

| Metrica | Valor |
|---|---|
| KLD media sobre posiciones, nats | 0,0304 (IC 95 %: 0,0268-0,0343) |
| KLD con 8 dominios ponderados por igual | 0,0512 |
| KLD p99 | 0,435 |
| Acuerdo top-1 | 94,95 % |
| Perplejidad del panel, nativo -> cuantizado | 1,6010 -> 1,6231 |

| Dominio, share de posiciones | KLD | Top-1 |
|---|---:|---:|
| Código, 65 % | 0,0182 | 95,83 % |
| Matemáticas, 4 % | 0,0230 | 94,72 % |
| Agéntico, 7 % | 0,0277 | 94,96 % |
| Contexto largo, 6 % | 0,0379 | 95,20 % |
| Conocimiento, 6 % | 0,0568 | 92,05 % |
| Escritura, 2 % | 0,0795 | 91,56 % |
| Multilingüe, 3 % | 0,0827 | 93,35 % |
| Chat, 7 % | 0,0835 | 90,68 % |

Como referencia, la cuantización 2,7 bpw de sudoingX sobre el checkpoint anterior obtiene 0,0243 de KLD y 95,57 % de top-1 en el mismo panel y con el mismo presupuesto. Los modelos base son distintos, por lo que no es una comparación directa. El autor también indica que el checkpoint 1017 mostró entre 1,75 y 3,7 veces más energía de error EXL3 por ancho de bits que el checkpoint anterior en sus mediciones.

## Requisitos de hardware
- Memoria para inferencia: el autor indica que la cuantización está pensada para dos NVIDIA DGX Spark con 256 GB en conjunto. No se especifica la VRAM exacta por GPU ni el reparto entre nodos.
- Almacenamiento: unos 400 GB libres. El repositorio ocupa 198,5 GB y las tablas Engram añaden 203 GB que deben descargarse aparte desde el modelo base.
- GPU recomendadas: dos NVIDIA DGX Spark con arquitectura sm_121. El autor usó una H200 como referencia para calcular la KLD del modelo nativo, pero no como plataforma de serving de esta cuantización.
- GPU de consumo: no cabe en una GPU consumer. Solo los pesos de esta cuantización ocupan 198,5 GB, a los que se suman las tablas Engram y las estructuras de serving.
- Opciones de despliegue: vLLM en el commit `6e517b15` para sm_121, serie de parches, exllamav3 1.6.0, plugin `vllm_exl3_moe` e imagen atestiguada `ghcr.io/sybil-solutions/deepseek-v4.1-flash-exl3-spark`. El script de lanzamiento es `dsv41_tp2.sh` con TP2.
- API: endpoint compatible con OpenAI en el puerto 8000, con parsing de razonamiento y tool calls de DeepSeek-V4.1, contexto de 262.144 tokens y decodificación especulativa DSpark.
- Red: el despliegue requiere SSH sin contraseña desde una máquina de control a ambos nodos y el mismo path absoluto en los dos Sparks. El plugin de sudoingX incluye el anillo RDMA de TensorFold, prefetch L2 y kernels de prompt.
- Latencia y throughput: no disponible en la información proporcionada. El autor remite al repositorio de la receta para consultar el estado del serving y la velocidad medida.

## Comparativa con modelos similares
No se han identificado en la información proporcionada otros modelos de la misma categoría con datos publicados de parámetros, contexto y rendimiento. La comparación disponible se limita a esta cuantización, la cuantización previa de sudoingX y el modelo nativo usado como referencia.

| Modelo | Parametros | Contexto | Cuantizacion | KLD media / top-1 | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Este modelo: `0xSero/DeepSeek-V4.1-Flash-1017-EXL3-2.7bpw` | No disponible | 262.144 | EXL3 2,7 bpw | 0,0304 / 94,95 % | MIT | HuggingFace |
| `sudoingx/DeepSeek-V4.1-Flash-EXL3-2.7bpw`, checkpoint anterior | No disponible | No disponible | EXL3 2,7 bpw | 0,0243 / 95,57 % en el mismo panel | No disponible | HuggingFace |
| `deepseek-ai/DeepSeek-V4.1-Flash-1017`, nativo | No disponible | No disponible | Sin cuantizar | 0 / 100 % por definición | MIT | HuggingFace |

La comparación con el checkpoint anterior no es head-to-head porque los modelos base son distintos. El panel de evaluación fue escrito por el checkpoint anterior, lo que introduce un sesgo adicional en la comparación.

## Limitaciones y advertencias
- Pérdida de fidelidad por cuantización: la KLD media es 0,0304, pero empeora en chat (0,0835), escritura (0,0795), multilingüe (0,0827) y conocimiento (0,0568). El top-1 en chat baja al 90,68 %, por lo que las respuestas conversacionales requieren validación.
- Cuantización agresiva: 2,7 bpw en los expertos enrutados y 2,90 bits por token decodificado. El propio autor señala que el checkpoint 1017 mostró más energía de error EXL3 por ancho de bits que el anterior, lo que limita la comparación con cuantizaciones menos agresivas.
- Dependencia de un stack específico: requiere vLLM en un commit concreto, sm_121, parches, exllamav3 1.6.0 y el plugin `vllm_exl3_moe`. No es un checkpoint portable a cualquier GPU o a llama.cpp sin trabajo adicional.
- Tablas Engram incompletas: el repositorio no incluye las tablas Engram de 203 GB. Hay que descargar dos shards del modelo base y verificar `MANIFEST.sha256`; sin ellas el despliegue no está completo.
- Requisitos de infraestructura: dos DGX Spark con 256 GB agregados y unos 400 GB de almacenamiento. No cabe en GPU consumer ni en un único nodo convencional de 80 GB.
- Idiomas no documentados: no se enumeran los idiomas soportados. Aunque hay calibración y evaluación multilingüe, el rendimiento por idioma concreto no está publicado.
- Falta de benchmarks estándar: no hay MMLU, HumanEval, GSM8K ni evaluaciones de seguridad en la información disponible. Las métricas publicadas miden fidelidad de cuantización, no capacidad absoluta.
- Riesgo de alucinación: inherente a los modelos de lenguaje; la cuantización puede amplificarlo en dominios con mayor KLD, como chat, escritura y conocimiento. Conviene usar verificación externa y citas de fuentes.
- Sesgos del modelo base: al no documentarse la composición del entrenamiento original ni el uso de RLHF/DPO, no se pueden evaluar sesgos específicos del checkpoint base.
- Licencia y dependencias: el modelo se publica con licencia MIT y el modelo base también es MIT. Las dependencias incluyen exllamav3 (MIT), el plugin de sudoingX (Apache-2.0) y componentes de TensorFold (Apache-2.0); hay que revisar sus condiciones antes de un despliegue comercial.
- Visión no confirmada: aunque el checkpoint contiene tensores de visión, la model card no describe capacidades multimodales. No debe asumirse que el modelo procesa imágenes sin una prueba específica.
- Estado de serving y velocidad: no se publican latencia ni throughput en la información disponible. El autor remite al repositorio de la receta para consultar las mediciones actualizadas.

## Enlaces
- Modelo en HuggingFace: https://huggingface.co/0xSero/DeepSeek-V4.1-Flash-1017-EXL3-2.7bpw
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- Repositorio de la receta de serving: https://github.com/sudoingX/dgx-spark-deepseek-v41
- Repositorio de receta, parches, logs y resultados: https://github.com/sybil-solutions/deepseek-v4.1-flash-1017-exl3-spark
- Cuantización previa de sudoingX: https://huggingface.co/sudoingx/DeepSeek-V4.1-Flash-EXL3-2.7bpw
- exllamav3: https://github.com/turboderp-org/exllamav3
- Imagen de contenedor atestiguada: `ghcr.io/sybil-solutions/deepseek-v4.1-flash-exl3-spark`
