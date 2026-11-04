# Danny-Lian/BlinkOPD-9B

## Resumen

BlinkOPD-9B es un checkpoint de visión-lenguaje publicado por Danny-Lian, obtenido mediante un ajuste fino por destilación on-policy sobre Qwen/Qwen3.5-9B. El modelo conserva la arquitectura del base (familia Qwen3.5, pipeline image-text-to-text) y añade una plantilla de chat específica para tareas de percepción visual. Su interés radica en que documenta un pipeline de destilación con profesores que aportan recortes de contexto con cajas delimitadoras (3x bounding-box context crops) y una exclusión explícita del primer token de respuesta durante la destilación.

El entrenamiento es deliberadamente pequeño: 500 imágenes únicas repetidas hasta formar 3.000 filas de entrenamiento, con el checkpoint guardado en el paso de optimización 38. El autor reporta una media de aproximadamente 79,6 en un protocolo de seis benchmarks (V*Bench, ZoomBench, HR-Bench 4K/8K y MME-RealWorld EN/CN) usando un juez corregido que evita el atajo de la primera letra de opción.

Con 9.409.813.744 parámetros y un repositorio de 18,8 GB en safetensors, se posiciona como un modelo de 9B manejable en hardware de una sola GPU de 80 GB en bfloat16. La licencia es Apache-2.0, heredada del modelo base, y el checkpoint se distribuye como merged y standalone, sin necesidad de adaptadores.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de la familia Qwen3.5 (clase Qwen3_5ForConditionalGeneration), vision-lenguaje |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; el ejemplo de carga usa bfloat16) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-9B, un transformer multimodal de tipo image-text-to-text con 9,4 mil millones de parámetros. BlinkOPD-9B es un checkpoint merged, es decir, los pesos resultantes del ajuste están fusionados en un único conjunto standalone, y se carga con la clase `Qwen3_5ForConditionalGeneration` de Transformers (el entorno de entrenamiento usó Transformers 5.5.0). Incluye la plantilla de chat de percepción empleada en la evaluación, accesible vía `processor.apply_chat_template`.

El entrenamiento se basa en destilación on-policy con profesores que aportan recortes de contexto con cajas delimitadoras (3x bounding-box context crops). La receta de 9B excluye el primer token de respuesta de la destilación, y las decisiones cacheadas de "primer vistazo" se calcularon sobre los recortes ajustados originales. El conjunto de datos es Danny-Lian/Vision-OPD-6K-Decontaminated, aunque el propio autor indica que el entrenamiento efectivo usó 500 imágenes únicas repetidas para formar 3.000 filas, con el checkpoint guardado en el paso 38. No se especifica el número total de tokens de entrenamiento ni la composición completa del dataset, ni si hubo RLHF o DPO adicional.

## Capacidades

- Comprensión de imagen y texto (image-text-to-text) orientada a tareas de percepción visual fina.
- Razonamiento visual sobre regiones concretas, apoyado por el uso de recortes con cajas delimitadoras durante el entrenamiento.
- Evaluación en benchmarks de percepción de alta resolución (HR-Bench 4K/8K) y de mundo real (MME-RealWorld EN/CN).
- Conversación multi-turno mediante la plantilla de chat incluida.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y multi-step reasoning: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles; los benchmarks cubren EN y CN, pero no se documenta cobertura de idiomas.
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Inspección de documentos y capturas de alta resolución: el modelo está entrenado y evaluado en HR-Bench 4K/8K, por lo que resulta adecuado para extraer información de imágenes con mucho detalle donde los modelos de resolución estándar pierden texto pequeño.
- Análisis de escenas del mundo real: su evaluación en MME-RealWorld EN/CN lo orienta a tareas de descripción y respuesta sobre fotografías cotidianas, útil en moderación de contenido visual o catalogación de imágenes.
- Respuesta a preguntas visuales de detalle fino: V*Bench y ZoomBench miden la capacidad de localizar y razonar sobre objetos pequeños; encaja en asistentes que responden preguntas sobre productos, planos o diagramas.
- Prototipado de asistentes multimodales: al ser un checkpoint merged de 9B con licencia Apache-2.0, se puede desplegar en una sola GPU de 80 GB en bfloat16 para validar flujos conversacionales con imagen antes de invertir en modelos mayores.
- Investigación en destilación on-policy: el checkpoint y su receta (recortes con bounding boxes, exclusión del primer token) sirven como referencia reproducible para estudiar técnicas de destilación multimodal con presupuestos de datos reducidos.
- Evaluación comparativa de percepción visual: su protocolo de seis benchmarks con juez corregido permite usarlo como línea base en estudios que midan sesgos de evaluación por atajos de opción.

## Benchmarks y rendimiento

El autor reporta una media de aproximadamente 79,6 en el protocolo de seis benchmarks (V*Bench, ZoomBench, HR-Bench 4K/8K y MME-RealWorld EN/CN) con el juez corregido. No se desglosan las puntuaciones por benchmark en la información disponible, por lo que no se presenta tabla comparativa.

| Benchmark | Resultado |
|---|---|
| V*Bench | no disponible (incluido en la media de ~79,6) |
| ZoomBench | no disponible (incluido en la media de ~79,6) |
| HR-Bench 4K | no disponible (incluido en la media de ~79,6) |
| HR-Bench 8K | no disponible (incluido en la media de ~79,6) |
| MME-RealWorld EN | no disponible (incluido en la media de ~79,6) |
| MME-RealWorld CN | no disponible (incluido en la media de ~79,6) |

## Requisitos de hardware

- VRAM estimada en bfloat16: aproximadamente 18,8 GB de pesos, más overhead de activaciones y caché KV; en la práctica requiere una GPU de 24 GB o superior, siendo cómodo en A100 40/80 GB o H100.
- En cuantización de 8 bits cabría en GPUs de 24 GB (RTX 3090/4090), y en 4 bits en GPUs de 16 GB, aunque el autor no publica pesos cuantizados ni recetas oficiales de cuantización.
- GPU recomendadas: A100 80 GB o H100 para inferencia en bfloat16 sin compromisos; RTX 4090 (24 GB) para bfloat16 ajustado o cuantización.
- Despliegue: Transformers con soporte de Qwen3.5 (probado con 5.5.0). No se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| BlinkOPD-9B | 9,41B | no disponible | Apache-2.0 | Checkpoint de destilación on-policy sobre Qwen3.5-9B |
| Qwen/Qwen3.5-9B | 9B (aprox.) | no disponible | no disponible en la información | Modelo base del que deriva BlinkOPD-9B |
| Alternativas de 9B vision-lenguaje | no disponible | no disponible | no disponible | No se han identificado comparables concretos en la información proporcionada |

## Limitaciones y advertencias

- El entrenamiento usó solo 500 imágenes únicas repetidas hasta 3.000 filas y 38 pasos de optimización; la generalización fuera de los benchmarks evaluados es incierta.
- El propio autor advierte que las puntuaciones de benchmark no establecen fiabilidad fuera de los entornos evaluados.
- El protocolo original de evaluación presentaba un atajo por la primera letra de opción; los resultados deben interpretarse con el juez corregido y no son directamente comparables con los del protocolo original.
- Riesgo de alucinación inherente a los modelos de 9B en tareas de percepción fina; no se documentan mitigaciones específicas.
- Sesgos conocidos: no disponibles en la información proporcionada.
- Idiomas soportados: no documentados; los benchmarks cubren EN y CN, sin garantía para castellano.
- Licencia Apache-2.0: permite uso comercial, pero el checkpoint hereda las limitaciones del modelo base Qwen3.5-9B.
- Longitud de contexto no documentada, lo que dificulta planificar despliegues con entradas largas o múltiples imágenes.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Danny-Lian/BlinkOPD-9B
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Dataset de entrenamiento: https://huggingface.co/datasets/Danny-Lian/Vision-OPD-6K-Decontaminated
- Repositorio de código de BlinkOPD: no disponible como enlace directo en la información proporcionada (el autor menciona una "BlinkOPD code release" sin URL)
- Paper: no disponible
- Demo: no disponible
