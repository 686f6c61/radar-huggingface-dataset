# ModalityDance/OPTD-DeepSeek-R1-Distill-Qwen-1.5B-Mid

## Resumen

OPTD-DeepSeek-R1-Distill-Qwen-1.5B-Mid es un checkpoint estudiante de 1.777.088.000 parámetros obtenido mediante *On-Policy Transition Distillation* (OPTD), una técnica presentada en el artículo homónimo y aplicada aquí por el autor ModalityDance. El modelo parte de `deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B`, un modelo de la familia Qwen2 especializado en razonamiento, y se reentrena durante 150 actualizaciones para alinear sus incrementos de log-probabilidad con los de un profesor en tres bloques intermedios (7, 13 y 19, en indexación desde cero) además de la salida final. Los dominios de entrenamiento declarados son matemáticas y programación.

La relevancia de esta ficha es acotada y muy específica: no se trata de un modelo de propósito general ni de un lanzamiento con evaluación comparativa, sino de un artefacto de investigación para estudiar cómo se transfiere la capacidad de razonamiento desde un modelo especialista hacia un estudiante pequeño mediante destilación on-policy sobre *rollouts* generados por el propio estudiante. El repositorio incluye pesos completos de inferencia, tokenizador, configuración de generación y metadatos de entrenamiento; no incluye estado del optimizador ni particiones de entrenamiento distribuidas.

El modelo se publica en BF16 safetensors (3,6 GB de repositorio), declara únicamente inglés como idioma y no especifica licencia propia, remitiendo a los términos upstream del modelo base. En el momento de la consulta el repositorio registra 0 descargas y 0 *likes*, por lo que no existe validación comunitaria ni resultados de benchmarks publicados en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, familia Qwen2 (etiqueta `qwen2` en transformers) |
| Parámetros totales | 1.777.088.000 (1,78 B), recuento real de safetensors |
| Parámetros activos | No aplica: modelo denso, no es MoE |
| Longitud de contexto | No disponible en la información proporcionada |
| Tipos de cuantización | No se publican cuantizaciones oficiales; pesos en BF16. Conversión a GGUF/AWQ no documentada por el autor |
| Idiomas soportados | Inglés (`en`) según la model card |
| Licencia | No disponible; se remite a las licencias upstream del modelo base, sin concesión nueva implícita |
| Formato de pesos | safetensors en BF16 (librería transformers); repositorio de 3,6 GB con `checksums.json` (SHA256) |
| Modelo base | `deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B` (relación: finetune) |
| Tarea / pipeline | `text-generation`, compatible con text-generation-inference y endpoints |
| Metadatos de publicación | Creado el 2026-10-19, actualizado el 2026-10-19; 0 descargas, 0 likes |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base: un transformer decoder-only de la familia Qwen2 con 1,78 B de parámetros. El entrenamiento aplicado es OPTD (*On-Policy Transition Distillation*), que combina la destilación on-policy (OPD) de política final con una alineación de los incrementos de log-probabilidad entre profesor y estudiante en los bloques intermedios seleccionados y en la salida final, evaluados sobre *rollouts* generados por el propio estudiante. La actualización práctica emplea un conjunto fijo de las 16 identidades candidatas más probables de la política final, junto con recompensas de transición desconectadas del grafo y probabilidades del estudiante en la capa de destino.

Los detalles de entrenamiento documentados son: 150 actualizaciones, bloques intermedios 7/13/19 (indexación desde cero), dominios de matemáticas y programación, y modo de generación con la plantilla de razonamiento nativa del modelo base. La identidad del profesor (modelo especialista) y el volumen o composición exacta del dataset no se especifican en la información disponible. Tampoco se documentan fases de RLHF o DPO posteriores, ni innovaciones de inferencia como decodificación especulativa o atención lineal. El repositorio no incluye estado del optimizador ni particiones de entrenamiento, lo que limita la reproducibilidad exacta del proceso más allá de la inferencia.

## Capacidades

- Generación de texto conversacional en inglés, con soporte de plantilla de chat (`apply_chat_template`) y prompt de generación.
- Razonamiento explícito mediante la plantilla de razonamiento nativa del modelo base, que produce una cadena de pensamiento antes de la respuesta final.
- Razonamiento matemático: dominio declarado de entrenamiento (resolución de ecuaciones y problemas de tipo escolar, por ejemplo `2x + 5 = 17`).
- Generación de código: segundo dominio declarado de entrenamiento.
- Ajuste de hiperparámetros de muestreo documentado por el autor: `do_sample=True`, `temperature=0.7`, `top_p=0.95`, `max_new_tokens` de hasta 1024 en el ejemplo.
- Compatibilidad con text-generation-inference y con endpoints alojados (etiqueta `endpoints_compatible`).
- No hay soporte documentado de *tool calling* ni de *function calling*.
- No hay soporte documentado de uso agéntico ni de razonamiento multi-paso con herramientas.
- No se declaran capacidades de visión, audio ni multimodalidad.
- Cobertura multilingüe: únicamente inglés declarado; el comportamiento en castellano no está documentado ni evaluado.

## Casos de uso

- Investigación en destilación on-policy: reproducción y ablación de OPTD sobre un estudiante de 1,78 B, comparando el efecto de los bloques intermedios 7/13/19 frente a la destilación solo en la salida final. El checkpoint está pensado exactamente para este escenario.
- Estudio de transferencia de razonamiento: analizar si un estudiante pequeño entrenado con 150 actualizaciones sobre *rollouts* propios conserva las trayectorias de razonamiento del profesor en matemáticas y código.
- Generación de datos sintéticos de razonamiento: producir trazas de cadena de pensamiento en inglés para alimentar posteriores procesos de destilación o *fine-tuning* de modelos menores, filtrando después por verificación automática.
- Tutor de matemáticas en inglés para prototipos: el modelo puede resolver problemas paso a paso con la plantilla de razonamiento nativa; adecuado para demos y validación de producto, no para producción sin evaluación previa.
- Asistente de código en entornos aislados: generación de fragmentos y explicaciones en inglés, ejecutando siempre el resultado en un *sandbox* dado que el autor advierte explícitamente de que el código generado debe evaluarse de forma aislada.
- *Baseline* en pipelines de evaluación: punto de comparación barato (1,78 B, BF16 de ~3,5 GB) frente al modelo base y a otros estudiantes destilados en tareas de matemáticas y código.
- Despliegue local en GPU de consumo para experimentación: el tamaño permite inferencia en tarjetas de 8-12 GB con cuantización, útil para pruebas offline sin coste de API.
- Punto de partida para *fine-tuning* posterior: al publicarse pesos completos en BF16 y con el tokenizador incluido, sirve como inicialización para ajustes específicos de dominio en inglés.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye cifras de MMLU, HumanEval, GSM8K ni de ningún otro conjunto, y advierte de forma explícita que las comparaciones del artículo requieren el checkpoint original, el modo de prompt, las revisiones concretas de los benchmarks, los tamaños de muestra y los evaluadores, y que una generación de ejemplo no reproduce las puntuaciones del paper. Tampoco se han publicado mediciones de latencia o *throughput*.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 3,55 GB solo de pesos, más caché KV y activaciones; presupuesto realista de 5-6 GB para contextos moderados (estimación teórica a partir del recuento de parámetros, no medida por el autor).
- VRAM estimada en FP32: aproximadamente 7,1 GB de pesos.
- VRAM estimada con cuantización de 8 bits: aproximadamente 1,8 GB de pesos; con 4 bits, aproximadamente 0,9 GB (estimaciones teóricas; no se distribuyen cuantizaciones oficiales).
- GPU recomendadas: A100 y H100 para servir en BF16 con lote alto; RTX 4090 (24 GB) para inferencia y *fine-tuning* ligero; RTX 3090/4080 (16-24 GB) sin problema.
- Cabe en GPU de consumo: sí. RTX 3060 de 12 GB y RTX 4060 Ti de 16 GB ejecutan el modelo en BF16; tarjetas de 8 GB requieren cuantización (no publicada oficialmente).
- Opciones de despliegue: transformers (vía documentada por el autor), text-generation-inference (etiqueta `text-generation-inference`), endpoints compatibles, vLLM como alternativa estándar para modelos Qwen2. llama.cpp u Ollama requerirían una conversión a GGUF que el autor no proporciona.
- Latencia y *throughput*: no disponibles. No se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| OPTD-DeepSeek-R1-Distill-Qwen-1.5B-Mid | 1,78 B | No disponible | Estudiante OPTD (destilación con transiciones, dominios matemáticas y código) | No disponible; remite a upstream | HuggingFace, BF16 safetensors, 0 descargas |
| deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B (base) | 1,78 B | No disponible en la información proporcionada | Destilado de DeepSeek-R1 sobre Qwen2, razonamiento general | No disponible en la información proporcionada | HuggingFace, ampliamente distribuido |
| Qwen2.5-1.5B-Instruct | 1,5 B | 32.768 tokens nativos (dato de la model card pública de Qwen, no verificado en esta búsqueda) | Modelo instructivo generalista | No disponible en la información proporcionada | HuggingFace |
| Qwen3-1.7B | 1,7 B | 32.768 tokens nativos (dato de la model card pública de Qwen, no verificado en esta búsqueda) | Modelo denso con modo de razonamiento | No disponible en la información proporcionada | HuggingFace |

La comparación relevante es contra el propio modelo base: OPTD aplica 150 actualizaciones adicionales sobre los mismos pesos, por lo que el interés está en si la destilación de transiciones mejora el razonamiento en matemáticas y código a igualdad de tamaño y arquitectura. No hay cifras publicadas que permitan afirmar ni negar esa mejora.

## Limitaciones y advertencias

- Idiomas: solo inglés declarado. El rendimiento en castellano no está evaluado ni garantizado.
- Licencia: no disponible en la ficha. La model card indica que los modelos estudiante y especialista subyacentes conservan sus términos upstream y que no se concede ninguna licencia nueva sobre los pesos. Antes de cualquier uso comercial o redistribución hay que consultar la licencia del modelo base.
- Sin benchmarks: no existen cifras publicadas que respalden la calidad del checkpoint; la propia model card advierte de que las comparaciones requieren el protocolo completo del artículo.
- Alucinación: el autor reconoce que las salidas pueden ser incorrectas. No hay evaluación de factualidad.
- Seguridad: la model card advierte de que el modelo puede seguir instrucciones no deseadas; no se ha publicado ninguna evaluación de alineamiento o de seguridad.
- Código generado: debe ejecutarse en un *sandbox* aislado, según indicación explícita del autor.
- Contexto: la longitud de contexto no está documentada; no deben asumirse ventanas largas ni extrapolarse las del modelo base sin verificarlas.
- Madurez: se trata de un checkpoint de investigación con 150 actualizaciones, sin estado del optimizador ni particiones de entrenamiento, lo que limita la reproducibilidad completa.
- Validación comunitaria nula: 0 descargas y 0 likes en el momento de la consulta; no hay informes independientes de calidad.
- Sesgos: no se han publicado análisis de sesgo ni de composición del dataset de entrenamiento.
- Producción: no recomendado como servicio de cara al usuario sin una evaluación propia y sin resolver la situación de licencia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ModalityDance/OPTD-DeepSeek-R1-Distill-Qwen-1.5B-Mid
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B
- Artículo *On-Policy Transition Distillation*: no disponible (la model card lo menciona sin enlace)
- Repositorio de código de OPTD: no disponible
- Demo o espacio interactivo: no disponible
