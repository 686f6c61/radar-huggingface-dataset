# mradermacher/UnifiedReward-Flex-qwen3vl-32b-GGUF

## Resumen

UnifiedReward-Flex-qwen3vl-32b-GGUF es la versión cuantizada en formato GGUF del modelo CodeGoat24/UnifiedReward-Flex-qwen3vl-32b, un modelo de recompensa (reward model) multimodal construido sobre Qwen3-VL-32B y publicado por el usuario mradermacher. No se trata de un modelo conversacional de propósito general, sino de un evaluador: recibe una entrada multimodal (texto e imagen) y emite una puntuación o juicio de preferencia que se utiliza para entrenar y evaluar otros modelos, especialmente en tareas de comprensión y generación visual.

El modelo pertenece a la familia UnifiedReward, cuyo repositorio oficial describe el proyecto como una implementación de reward models unificados para tareas de entendimiento y generación visual, incluyendo la variante UnifiedReward-Think con razonamiento en cadena de pensamiento. La variante "Flex" aquí presentada se ha ajustado mediante SFT sobre el dataset CodeGoat24/UnifiedReward-Flex-SFT-90K, y conserva la torre de visión del modelo base, distribuida aparte en ficheros mmproj.

Su relevancia práctica es doble: por un lado, permite ejecutar un reward model de 32.762.123.264 parámetros en hardware de consumo mediante cuantización K-quant; por otro, al estar liberado con licencia MIT, puede integrarse en pipelines de RLHF/RLAIF y de filtrado de datos sin las restricciones de licencia habituales en modelos de este tamaño. La información publicada no incluye resultados de benchmarks ni detalles completos del entrenamiento, lo que limita la comparación objetiva con alternativas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (vision-language), derivada de Qwen3-VL-32B; incluye torre de visión servida en ficheros mmproj separados |
| Parametros totales | 32.762.123.264 (aproximadamente 32,8 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la información proporcionada |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0; más mmproj en Q8_0 y f16 |
| Idiomas soportados | Inglés (en), según la model card; cobertura multilingüe del modelo base no verificada |
| Licencia | MIT |
| Formato de pesos | GGUF (quants estáticos) con mmproj separado; el modelo base se distribuye en safetensors |

Otros datos del repositorio: tamaño total del repo 225,9 GB (incluye todas las cuantizaciones), 280 descargas, 0 likes, librería declarada transformers, etiquetas `endpoints_compatible` y `conversational`.

## Arquitectura y entrenamiento

La arquitectura corresponde al modelo Qwen3-VL de 32B, es decir, un transformer denso con codificador visual acoplado, adaptado aquí como reward model. La adaptación al caso de uso de recompensa implica que la cabeza de generación se emplea para producir juicios o puntuaciones sobre pares entrada-respuesta, en lugar de respuestas abiertas al usuario. El codificador visual se distribuye en ficheros independientes `mmproj` (Q8_0 de 0,9 GB y f16 de 1,3 GB), que deben cargarse junto con los pesos del modelo para procesar imágenes.

El único dato de entrenamiento disponible es el dataset declarado, CodeGoat24/UnifiedReward-Flex-SFT-90K, que por su nombre corresponde a un conjunto de ajuste supervisado de aproximadamente 90.000 muestras; la model card no especifica el número de tokens, la composición del dataset, ni si hubo etapas posteriores de RLHF o DPO. Tampoco se documentan innovaciones técnicas específicas de esta variante (por ejemplo, esquemas de decodificación especulativa o mecanismos de atención lineal) más allá de lo que aporta la arquitectura Qwen3-VL subyacente. Para la variante UnifiedReward-Think, el repositorio oficial sí menciona razonamiento encadenado multidimensional aplicado a tareas de recompensa, pero esa capacidad no está confirmada para la variante "Flex" descrita aquí.

## Capacidades

- Evaluación de recompensa multimodal: puntuación de respuestas y de contenidos generados a partir de entradas que combinan texto e imagen.
- Procesamiento de imagen: la presencia de ficheros mmproj confirma soporte de entrada visual, requisito para tareas de comprensión y generación de imágenes.
- Juicio de preferencia entre candidatos: uso esperado para seleccionar la mejor salida entre varias (best-of-N) en pipelines de generación.
- Filtrado y curación de datos: puntuación de pares instrucción-respuesta o imagen-texto para descartar muestras de baja calidad.
- Integración en pipelines de RLHF/RLAIF como modelo de recompensa, sustituyendo o complementando evaluadores humanos.
- Formato conversacional: la etiqueta `conversational` sugiere que el modelo acepta plantillas de chat para estructurar la petición de evaluación.
- Compatibilidad con endpoints: etiqueta `endpoints_compatible`, orientada a despliegue como servicio de inferencia.
- Soporte de tool calling, agentes o multi-step reasoning: no disponible en la información proporcionada.
- Capacidad de audio o de thinking mode: no disponible en la información proporcionada.

## Casos de uso

- Entrenamiento por refuerzo con recompensa aprendida (RLHF/RLAIF): el modelo actúa como evaluador automático de las respuestas de un modelo generador, aportando la señal de recompensa en cada iteración; sus 32,8 B de parámetros y la licencia MIT lo hacen adecuado para pipelines internos sin fricción legal.
- Selección best-of-N en generación de imágenes: se generan N candidatos para un mismo prompt y el reward model puntúa cada imagen junto con el texto, eligiendo la mejor; requiere cargar el mmproj para la entrada visual.
- Filtrado de datasets multimodales: puntuar pares imagen-texto de un corpus y descartar los que queden por debajo de un umbral, reduciendo ruido antes del entrenamiento de un VLM.
- Anotación asistida de preferencias: pre-puntuar pares A/B para que los anotadores humanos solo revisen los casos ambiguos, reduciendo el coste de construcción de datasets de preferencias.
- Evaluación automática de modelos de visión-lenguaje: usar el reward como métrica complementaria frente a BLEU, CIDEr o MMLU, capturando alineación semántica entre imagen y descripción.
- Control de calidad en generación aumentada por recuperación multimodal: puntuar la respuesta final antes de servirla al usuario y activar una caída a respuesta conservadora si la recompensa estimada es baja.
- Investigación en dinámicas de reward models: al ser una versión cuantizada de un modelo abierto con licencia permisiva, facilita experimentos sobre reward hacking, calibración y sensibilidad a la cuantización.
- Despliegue en local para prototipado: con Q4_K_M en torno a 20 GB, se puede validar un pipeline de recompensa en una estación de trabajo antes de escalar a infraestructura con GPU de datacenter.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Ni la model card del repositorio GGUF ni los resultados de búsqueda consultados incluyen métricas de evaluación (MMLU, RewardBench, GenAI-Bench u otras) para esta variante cuantizada ni para el modelo base. Tampoco se documentan mediciones de latencia o throughput.

## Requisitos de hardware

- VRAM estimada (solo pesos, según tamaño de fichero): Q2_K 12,4 GB; Q3_K_S 14,5 GB; Q3_K_M 16,1 GB; Q4_K_S 18,9 GB; Q4_K_M 19,9 GB; Q5_K_M 23,3 GB; Q6_K 27,0 GB; Q8_0 34,9 GB. Hay que sumar entre 0,9 y 1,3 GB del mmproj y el espacio de caché KV, que depende del contexto configurado.
- GPU de consumo: Q4_K_S y Q4_K_M caben en una RTX 4090 o RTX 3090 de 24 GB, pero con margen muy ajustado en cuanto se añade el mmproj y un contexto moderado; en la práctica conviene reducir el contexto o aceptar offload parcial a CPU.
- GPU de consumo, cuantizaciones altas: Q6_K (27 GB) y Q8_0 (34,9 GB) no caben en 24 GB; requieren 32 GB o más, o bien offload parcial con penalización de velocidad.
- GPU de datacenter: A100 40 GB, A100 80 GB, H100 y L40S son adecuadas para Q8_0 con contexto amplio; una A100 80 GB permite además ejecutar el modelo base en safetensors sin cuantizar.
- Opciones de despliegue: llama.cpp y sus derivados (LM Studio, servidores compatibles con la API de OpenAI) son la vía natural para GGUF; Ollama requiere crear un Modelfile que incluya el mmproj; vLLM y TGI no consumen GGUF, por lo que para esos motores hay que usar el modelo base CodeGoat24/UnifiedReward-Flex-qwen3vl-32b en safetensors.
- Latencia y throughput: no disponibles. Como referencia cualitativa, la evaluación de una sola muestra implica una pasada completa del modelo de 32B más el codificador visual, por lo que el coste por evaluación es comparable al de una inferencia de un VLM de ese tamaño.
- Almacenamiento: el repo completo ocupa 225,9 GB; conviene descargar solo el quant y el mmproj necesarios.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| UnifiedReward-Flex-qwen3vl-32b-GGUF (este) | 32,8 B | No disponible | MIT | GGUF + mmproj | Quant estático de mradermacher, 11 cuantizaciones desde 12,4 GB |
| CodeGoat24/UnifiedReward-Flex-qwen3vl-32b | 32,8 B | No disponible | No disponible en la información consultada | Safetensors | Modelo base sin cuantizar; necesario para vLLM o TGI |
| UnifiedReward-Think-qwen3vl-32b | 32 B (según nomenclatura del repo) | No disponible | No disponible en la información consultada | No disponible | Variante con razonamiento encadenado para tareas de recompensa; publicada junto a tamaños 2B, 4B y 8B |
| UnifiedReward-Flex-qwen3vl-8b-GGUF | 8 B (según nomenclatura) | No disponible | No disponible en la información consultada | GGUF | Alternativa más ligera de la misma familia, apta para GPU de 12-16 GB |
| mradermacher/UnifiedReward-Flex-qwen3vl-32b-i1-GGUF | 32,8 B | No disponible | MIT | GGUF (imatrix) | Misma base con cuantización ponderada por imatrix, orientada a mejor calidad por bit |

La comparación cuantitativa de rendimiento entre estas variantes no es posible con la información disponible, ya que no se han publicado métricas comunes.

## Limitaciones y advertencias

- El modelo está declarado únicamente en inglés; su comportamiento en castellano u otros idiomas no está verificado y podría degradarse de forma significativa.
- Es un reward model, no un asistente: no debe desplegarse como chatbot de cara al usuario sin una capa de adaptación y validación.
- La cuantización afecta a la calibración de las puntuaciones. Los quants Q2_K y Q3_K pueden alterar la escala de recompensa de forma apreciable, lo que es especialmente crítico si se usan umbrales fijos en producción; conviene validar contra la versión f16 o safetensors.
- Los quants IQ y ponderados por imatrix (repo i1-GGUF) suelen ofrecer mejor relación calidad-tamaño, pero no se han publicado evaluaciones comparativas para este modelo concreto.
- Riesgo de reward hacking: cualquier modelo de recompensa puede ser explotado por el modelo que se entrena contra él; se recomienda combinarlo con evaluaciones humanas periódicas y con un conjunto de validación independiente.
- Riesgo de alucinación en las justificaciones textuales que acompañen a la puntuación, si se solicitan explicaciones del juicio emitido.
- No hay datos publicados de sesgos demográficos, culturales o de representación visual para esta variante; la evaluación de sesgo queda pendiente.
- La licencia MIT permite uso comercial sin restricciones adicionales conocidas, pero conviene revisar la licencia del modelo base Qwen3-VL y del dataset CodeGoat24/UnifiedReward-Flex-SFT-90K antes de un despliegue productivo.
- La ausencia de benchmarks publicados y el bajo número de descargas (280) y likes (0) implican escasa validación comunitaria; no se debe asumir un rendimiento equivalente al del modelo sin cuantizar.
- El tamaño del repo (225,9 GB) y la necesidad de cargar el mmproj por separado añaden complejidad operativa frente al safetensors original.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/UnifiedReward-Flex-qwen3vl-32b-GGUF
- Repositorio con cuantización imatrix: https://huggingface.co/mradermacher/UnifiedReward-Flex-qwen3vl-32b-i1-GGUF
- Modelo base: https://huggingface.co/CodeGoat24/UnifiedReward-Flex-qwen3vl-32b
- Dataset de SFT: https://huggingface.co/datasets/CodeGoat24/UnifiedReward-Flex-SFT-90K
- Implementación oficial del proyecto UnifiedReward: https://github.com/CodeGoat24/UnifiedReward
- Página de descargas del autor para este modelo: https://hf.tst.eu/model#UnifiedReward-Flex-qwen3vl-32b-GGUF
- Solicitudes de cuantización del autor: https://huggingface.co/mradermacher/model_requests
- Ficha de la variante 8B en free2aitools: https://free2aitools.com/model/mradermacher/unifiedreward-flex-qwen3vl-8b-gguf
- Guía de uso de GGUF referenciada por el autor: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Notas sobre tipos de cuantización: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
