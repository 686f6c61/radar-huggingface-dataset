# bambocher/Qwen3.5-0.8B-oQ2.5e-mtp

## Resumen

Qwen3.5-0.8B-oQ2.5e-mtp es un checkpoint cuantizado en formato MLX del modelo Qwen3.5-0.8B, publicado por el usuario bambocher. No es un modelo entrenado desde cero: se trata de una conversión con cuantización mixta de precisión realizada con oQ (oMLX v0.7.1rc1), pensada para ejecutar el modelo en Apple Silicon con un peso de almacenamiento de aproximadamente 0,5 GB. El checkpoint contiene 873.438.784 parámetros lógicos repartidos entre el modelo de lenguaje (0,752B), un componente de visión (0,101B) y una cabeza MTP (0,020B).

La relevancia de esta ficha es práctica: permite evaluar un modelo pequeño, multimodal y fuertemente cuantizado para prototipos locales, pruebas de pipelines MLX y experimentos de cuantización mixta. El promedio efectivo es de 4,897 bits por peso, con una distribución que combina capas affine de 2, 4, 5, 6 y 8 bits y una fracción en BF16. Sin embargo, la información disponible no detalla la arquitectura interna, la longitud de contexto, los idiomas soportados, la licencia ni resultados de benchmarks.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible. La etiqueta `qwen3_5` y la presencia de pesos de lenguaje, visión y cabeza MTP indican una arquitectura multimodal de la familia Qwen3.5, pero no se documenta si es transformer, MoE u otra variante. |
| Parámetros totales | 873.438.784 (0,873B) |
| Parámetros activos | No aplica; no hay indicios de arquitectura MoE en la información disponible. |
| Longitud de contexto | No disponible |
| Tipos de cuantización | Cuantización mixta affine de 2, 4, 5, 6 y 8 bits con grupo 64, más una fracción en BF16. Promedio efectivo: 4,897 bits/peso. Etiqueta del repo: `2-bit`. |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | `safetensors` para MLX. Tamaño del repo: 0,5 GB. |

### Distribución de cuantización

| Formato de almacenamiento | Pesos lógicos | Porcentaje del total | Almacenamiento | Bits/peso efectivos |
|---|---:|---:|---:|---:|
| Affine 2-bit, grupo 64 | 0,543B | 62,127 % | 0,158 GiB | 2,50 |
| Affine 4-bit, grupo 64 | 0,012B | 1,381 % | 0,006 GiB | 4,50 |
| Affine 5-bit, grupo 64 | 0,187B | 21,369 % | 0,120 GiB | 5,50 |
| Affine 6-bit, grupo 64 | 0,028B | 3,243 % | 0,021 GiB | 6,50 |
| Affine 8-bit, grupo 64 | 0,001B | 0,066 % | 0,001 GiB | 8,50 |
| BF16 | 0,103B | 11,815 % | 0,192 GiB | 16,00 |
| **Total** | **0,873B** | **100 %** | **0,498 GiB** | **4,897** |

### Desglose por componente

| Componente | Pesos lógicos | Almacenamiento |
|---|---:|---:|
| Modelo de lenguaje | 0,752B | 0,318 GB / 0,296 GiB |
| Visión | 0,101B | 0,201 GB / 0,187 GiB |
| Cabeza MTP | 0,020B | 0,016 GB / 0,015 GiB |
| **Total** | **0,873B** | **0,535 GB / 0,498 GiB** |

## Arquitectura y entrenamiento

La información disponible no describe la arquitectura del modelo base ni su proceso de entrenamiento. No se indican el número de tokens utilizados, la composición del dataset, si hubo RLHF, DPO u otras fases de alineamiento, ni detalles sobre atención, decodificación especulativa o mecanismos de razonamiento. La única información técnica concreta es la estructura del checkpoint cuantizado: un modelo de lenguaje de 0,752B, un bloque de visión de 0,101B y una cabeza MTP de 0,020B.

La innovación principal de esta publicación es la cuantización mixta con oQ: la mayor parte de los pesos lógicos, un 62,127 %, se almacena en affine 2-bit con grupo 64, mientras que un 21,369 % se conserva en 5-bit y un 11,815 % permanece en BF16. Esta mezcla busca reducir el peso total hasta 0,498 GiB sin aplicar una cuantización uniforme agresiva a todas las capas. No se documenta qué criterios sigue oQ para asignar precisión a cada tensor ni qué impacto tiene en la calidad final.

## Capacidades

- Generación de texto: el checkpoint incluye un modelo de lenguaje de 0,752B, por lo que cabe esperar generación de texto autoregresiva, aunque no se publican evaluaciones de calidad.
- Entrada visual: incorpora 0,101B de pesos de visión, lo que indica soporte de componentes visuales. No se detallan tareas concretas, resolución de imagen, número de tokens visuales ni calidad esperada.
- Cabeza MTP: incluye una cabeza MTP de 0,020B, presumiblemente relacionada con multi-token prediction o decodificación multi-token, pero no se documenta su funcionamiento ni su compatibilidad con distintos runtimes.
- Tool calling / function calling: no disponible en la información proporcionada.
- Uso como agente y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo de razonamiento explícito o “thinking mode”: no disponible en la información proporcionada.
- Soporte de audio o vídeo: no disponible en la información proporcionada.

## Casos de uso

- Pruebas locales en Apple Silicon: cargar el checkpoint con MLX u oMLX para validar que el pipeline de inferencia funciona en un Mac con memoria unificada, aprovechando que los pesos ocupan aproximadamente 0,498 GiB.
- Evaluación de cuantización mixta: comparar la calidad de salida de esta mezcla de 2/4/5/6/8 bits y BF16 frente al modelo base sin cuantizar, si se dispone de él, para medir la degradación en tareas de lenguaje y visión.
- Prototipos de asistente offline: usar el modelo de lenguaje en aplicaciones de escritorio o herramientas internas que requieran generación de texto sin conexión, con la advertencia de que no hay benchmarks ni contexto documentado.
- Validación de pipelines multimodales: probar la integración de los pesos de visión en una aplicación MLX que reciba imágenes y texto, verificando empíricamente si el componente visual produce resultados utilizables.
- Investigación sobre cabezas MTP: inspeccionar la cabeza MTP de 0,020B y medir su comportamiento en decodificación multi-token, siempre que el runtime MLX utilizado la soporte.
- Experimentos de almacenamiento y despliegue: estudiar el equilibrio entre tamaño en disco, precisión por tensor y consumo de memoria en un checkpoint de menos de 1B de parámetros.
- Docencia y reproducibilidad: analizar la distribución de bits y el desglose por componentes como ejemplo práctico de cuantización mixta aplicada a un modelo multimodal pequeño.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K, evaluaciones multimodales, latencia ni throughput para este checkpoint.

## Requisitos de hardware

- Pesos en disco: aproximadamente 0,498 GiB, equivalentes a 0,535 GB según el desglose del autor.
- Memoria para inferencia: los pesos ocupan alrededor de 0,5 GiB, pero hay que sumar el overhead del runtime MLX, la caché KV y los buffers de visión. Como estimación prudente, reservar al menos 1-2 GB de memoria unificada para pruebas; la cifra exacta depende del contexto, del lote y del runtime.
- GPU recomendadas: Apple Silicon. MLX está orientado a chips Apple M1, M2, M3 y M4. No se proporcionan datos para GPU NVIDIA, AMD o Intel.
- ¿Cabe en consumer GPU? En Apple Silicon, sí: un Mac con 8 GB de memoria unificada debería poder cargar los pesos, aunque el margen para contexto largo o visión es limitado. En GPU NVIDIA de consumo no se puede ejecutar directamente con MLX sin conversión.
- Opciones de despliegue: MLX y oMLX son las opciones directas. No se documenta compatibilidad directa con llama.cpp, Ollama, vLLM o TGI, ya que el checkpoint está en formato MLX cuantizado y no en GGUF.
- Latencia y throughput: no disponibles. Por el tamaño del modelo cabe esperar una latencia baja en Apple Silicon, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---:|---|---|---|---|
| Qwen3.5-0.8B-oQ2.5e-mtp | 0,873B | No disponible | No disponible | No disponible | MLX safetensors, 0,5 GB, en Hugging Face |
| Qwen3.5-0.8B base (presumible, no confirmado) | No disponible | No disponible | No disponible | No disponible | No confirmado en la información proporcionada |
| Alternativas MLX de aproximadamente 1B | No disponible | No disponible | No disponible | No disponible | No identificadas en la información proporcionada |

No se dispone de datos verificables de alternativas comparables en la información proporcionada. Para una comparación rigurosa haría falta identificar el modelo base exacto, su licencia, su longitud de contexto y resultados de evaluación del checkpoint original y de otras cuantizaciones del mismo modelo.

## Limitaciones y advertencias

- Licencia no disponible: no se puede confirmar si el uso comercial está permitido. Es un riesgo bloqueante para producción.
- Modelo base no documentado: no se enlaza el repositorio exacto de Qwen3.5-0.8B, ni se detallan tokenizer, plantilla de chat o configuración de generación.
- Idiomas no especificados: no hay información sobre calidad o cobertura multilingüe.
- Contexto no especificado: no se puede planificar su uso en conversaciones largas, recuperación de documentos o agentes con historial extenso.
- Cuantización agresiva: el 62,127 % de los pesos lógicos está en affine 2-bit. Aunque la mezcla incluye capas en 5 bits y BF16, es esperable cierta degradación frente al modelo en BF16; no se publican evaluaciones que la cuantifiquen.
- Cabeza MTP poco documentada: no se indica si los runtimes habituales la utilizan, la ignoran o requieren soporte específico.
- Riesgo de alucinación: no hay evaluaciones de fidelidad. Un modelo de menos de 1B de parámetros tiene capacidad limitada para tareas de razonamiento complejo y puede generar respuestas plausibles pero incorrectas.
- Validación comunitaria baja: 13 descargas y 0 likes en el momento de la consulta. No hay evidencia de uso extensivo ni informes independientes.
- Formato restrictivo: al estar en MLX, no es directamente portable a llama.cpp, Ollama, vLLM o TGI. Cualquier conversión a otros formatos requeriría herramientas externas y no está documentada.
- Sin benchmarks: no se puede comparar su rendimiento con otros modelos de tamaño similar ni justificar afirmaciones de calidad.

## Enlaces

- [Hugging Face: bambocher/Qwen3.5-0.8B-oQ2.5e-mtp](https://huggingface.co/bambocher/Qwen3.5-0.8B-oQ2.5e-mtp)
- [oQ / oMLX en GitHub](https://github.com/jundot/omlx)
- No se proporcionan enlaces adicionales a papers, blogs, demos o repositorios del modelo base en la información disponible.
