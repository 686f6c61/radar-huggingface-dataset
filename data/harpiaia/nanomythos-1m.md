# HarpiaIA/NanoMythos-1M

## Resumen

NanoMythos-1M es un modelo de lenguaje de tipo transformer decoder-only desarrollado por HarpiaIA, un grupo orientado a la investigación en modelos de IA de pequeño tamaño. Con apenas 1.443.968 parámetros totales (aproximadamente 1,4 millones), se sitúa en la categoría de modelos "smol" o nano, pensados para experimentación, docencia y despliegue en entornos con recursos mínimos. El modelo se distribuye en formato safetensors bajo la librería transformers y está etiquetado como compatible con text-generation-inference y endpoints.

El modelo se entrenó sobre el conjunto de datos FineWeb-Edu de HuggingFace, un corpus educativo filtrado por calidad, y declara soporte únicamente para inglés. Su relevancia actual radica en servir como banco de pruebas de bajo coste para pipelines de generación de texto, ajuste fino y evaluación de técnicas de entrenamiento, más que como alternativa de producción frente a modelos de escala media o grande.

La model card es deliberadamente escueta: no documenta la arquitectura interna, el número de tokens de entrenamiento ni el proceso de alineación. Los únicos datos de rendimiento publicados son BLiMP (53,93 %) y ARC-Easy (26,73 %), que sitúan el modelo por debajo de la línea base de modelos pequeños entrenados con más cómputo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia llama, según tags) |
| Parámetros totales | 1.443.968 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos safetensors; cuantización posterior posible vía llama.cpp/GGUF, no documentada por el autor) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

La información disponible indica que se trata de un transformer decoder-only de la familia llama, con 1.443.968 parámetros, entrenado sobre FineWeb-Edu. No se documentan en la model card ni el número de tokens vistos durante el entrenamiento, ni la composición exacta del dataset más allá del corpus citado, ni si hubo fases de RLHF, DPO o instrucción supervisada. Tampoco se especifican innovaciones técnicas como decodificación especulativa, atención lineal o arquitecturas híbridas.

El tamaño del repositorio aparece como 0.0 GB, lo que es coherente con un modelo de 1,4 millones de parámetros en safetensors (del orden de unos pocos megabytes en fp32/fp16). El autor indica que la inferencia se realiza mediante el script `inference.py` incluido en el repositorio, lo que sugiere un flujo de uso sencillo basado en transformers en lugar de un despliegue servido.

## Capacidades

- Generación de texto autoregresiva en inglés, con pipeline `text-generation`.
- Compatibilidad declarada con text-generation-inference y endpoints, lo que permite servirlo mediante una API HTTP estándar.
- Integración nativa con transformers y pesos en safetensors, facilitando carga directa y ajuste fino.
- Capacidad lingüística limitada: el modelo está entrenado y etiquetado exclusivamente para inglés.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, modo thinking, visión, audio ni matemáticas avanzadas.
- Rendimiento medido en tareas de conocimiento lingüístico y razonamiento básico (BLiMP y ARC-Easy), no en tareas generativas complejas.

## Casos de uso

- Docencia y experimentación: el modelo cabe en cualquier GPU consumer y incluso en CPU, por lo que sirve para demostrar el ciclo completo de carga, inferencia y evaluación de un LLM en un aula o taller sin infraestructura dedicada.
- Pruebas de pipelines de generación: al ser compatible con text-generation-inference y endpoints, permite validar integraciones de API, colas de inferencia y monitorización antes de migrar a modelos mayores.
- Ajuste fino de bajo coste: con 1,4 millones de parámetros, el fine-tuning completo o con LoRA es viable en minutos sobre una única GPU, útil para estudiar el efecto de datasets pequeños en modelos nano.
- Evaluación comparativa de modelos smol: sirve como línea base en experimentos que comparan arquitecturas o corpus (por ejemplo, FineWeb-Edu frente a otros filtrados) a escala reducida.
- Generación de texto de relleno y prototipado de interfaces: para demos de UI, tests de integración o maquetas de producto donde la calidad lingüística no es el criterio principal.
- Investigación sobre alucinación y sesgos a pequeña escala: modelos de este tamaño exhiben patrones de error reproducibles y baratos de analizar, lo que facilita estudios controlados antes de extrapolar a modelos grandes.
- Despliegue en dispositivos边缘 o entornos con RAM limitada: el peso del modelo permite ejecución en contenedores mínimos, Raspberry Pi o entornos serverless con cuotas estrictas.

## Benchmarks y rendimiento

| Benchmark | Resultado |
|---|---|
| BLiMP | 53,93 % |
| ARC-Easy | 26,73 % |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otras evaluaciones en la información disponible. Los valores de BLiMP y ARC-Easy proceden de la model card del autor y no incluyen comparación con líneas base.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 (unos 6 MB de pesos) y por debajo de 0,5 GB en fp16; el cuello de botella real es el overhead de la librería y del runtime, no el modelo.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) es sobradamente suficiente; también funciona en GPUs integradas y en CPU.
- Cabe en GPU consumer: sí, en todas las GPU consumer actuales, así como en iGPU y CPU.
- Opciones de despliegue: transformers (flujo documentado por el autor vía `inference.py`), text-generation-inference (declarado compatible), endpoints compatibles; llama.cpp/Ollama no están documentados por el autor, aunque la familia llama sugiere conversión viable a GGUF.
- Latencia y throughput estimados: no disponibles en la información proporcionada; por el tamaño, se espera latencia de milisegundos por token en GPU y throughput alto en CPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Rendimiento publicado | Disponibilidad |
|---|---|---|---|---|---|
| HarpiaIA/NanoMythos-1M | 1.443.968 | no disponible | Apache 2.0 | BLiMP 53,93 %; ARC-Easy 26,73 % | Hugging Face |
| Modelos nano tipo TinyStories / SmolLM-135M | del orden de 10^7–10^8 | no disponible en esta ficha | variable (MIT, Apache 2.0) | no disponible | Hugging Face |
| GPT-2 small | 124 millones | 1.024 tokens | MIT | benchmarks públicos | Hugging Face |

La comparación directa es limitada: NanoMythos-1M es entre dos y tres órdenes de magnitud menor que GPT-2 small y que los modelos smol habituales, por lo que no compite en calidad generativa sino en coste de ejecución y facilidad de experimentación. No se dispone de benchmarks comunes que permitan una comparación numérica fiable con alternativas.

## Limitaciones y advertencias

- Calidad generativa muy limitada: con 1,4 millones de parámetros, la coherencia a nivel de párrafo y el seguimiento de instrucciones complejas no son esperables; los resultados en ARC-Easy (26,73 %) indican un rendimiento cercano al azar en razonamiento.
- Riesgo elevado de alucinación y de texto incoherente, especialmente fuera de dominios representados en FineWeb-Edu.
- Cobertura monolingüe: solo inglés; no se documenta ningún rendimiento en castellano ni en otros idiomas.
- Sesgos: al entrenarse sobre FineWeb-Edu, hereda los sesgos del corpus filtrado; no se documentan evaluaciones de sesgo ni mitigaciones.
- Contexto no documentado: se desconoce la longitud máxima de contexto, lo que impide planificar casos de uso multi-turno o documentos largos.
- Licencia Apache 2.0: permite uso comercial, modificación y redistribución con atribución y conservación del aviso de licencia; no hay restricciones adicionales documentadas por el autor.
- Caveat de producción: no apto como modelo de producción para tareas de usuario final; su uso recomendado es investigación, docencia y prototipado.
- Trazabilidad: la model card no documenta hiperparámetros, tokens de entrenamiento ni proceso de alineación, lo que dificulta reproducir el resultado.

## Enlaces

- Hugging Face: https://huggingface.co/HarpiaIA/NanoMythos-1M
- Dataset de entrenamiento: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Repositorio del autor (HarpiaIA): https://huggingface.co/HarpiaIA
- Script de inferencia: `inference.py` en el repositorio del modelo (https://huggingface.co/HarpiaIA/NanoMythos-1M/blob/main/inference.py)
- No se han encontrado papers, blogs, demos ni repositorios adicionales en la información disponible.
