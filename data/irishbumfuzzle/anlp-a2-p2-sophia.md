# irishbumfuzzle/anlp-a2-p2-sophia

## Resumen

`irishbumfuzzle/anlp-a2-p2-sophia` es un checkpoint de investigación publicado en HuggingFace por el usuario irishbumfuzzle como parte de la Parte 2 de la asignatura Advanced NLP Assignment 2 (Monsoon 2026). No se trata de un modelo de propósito general ni de un lanzamiento de producto: es el artefacto final de un ejercicio académico de preentrenamiento de un transformer decoder-only de 35,7 millones de parámetros sobre una tarea de predicción del siguiente token.

El interés técnico del checkpoint reside en el optimizador utilizado, Sophia-H con aproximación diagonal de la Hessiana (Wen et al. 2025, algoritmo 4, componente bonus), aplicado a un presupuesto de entrenamiento de 9.715.712 tokens (una pasada sobre el dataset HAP-E, compuesto por chunk_1 y chunk_2 de texto humano) con tamaño de batch 32. El modelo tiene 6 capas, dimensión de modelo 512, 8 cabezas de atención, vocabulario de 32.768 tokens y embeddings atados.

Su relevancia es fundamentalmente metodológica: permite reproducir y auditar una comparativa de optimizadores a pequeña escala con coste computacional muy bajo, y sirve como punto de partida para experimentos de tokenización, ablaciones de arquitectura o ajuste fino en entornos con recursos limitados. No hay pipeline declarado, licencia, idiomas especificados ni resultados de evaluación publicados en la información disponible, por lo que debe tratarse como material de laboratorio, no como modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (solo decodificador) |
| Parametros totales | 35.658.240 (35,7 M) |
| Parametros activos | no aplica (modelo denso, no MoE); el autor declara 35.658.240 activos |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (no se publican versiones cuantizadas) |
| Idiomas soportados | no disponible (el corpus HAP-E se describe como texto humano, sin especificar idioma) |
| Licencia | no disponible |
| Formato de pesos | PyTorch `.pt` (diccionario con `state_dict` y config); `config.json`; `tokenizer.json` (BPE byte-level, vocab 32768) |
| Dimensión del modelo (D) | 512 |
| Capas | 6 |
| Cabezas de atencion | 8 |
| Vocabulario | 32.768 (embeddings atados) |
| Presupuesto de entrenamiento | 9.715.712 tokens (1 pasada sobre HAP-E, batch 32) |
| Optimizador | Sophia-H, Hessiana diagonal (Wen et al. 2025, algoritmo 4) |
| Tamano del repositorio | 0,1 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creacion / actualizacion | 2026-09-21 / 2026-09-21 |
| Etiquetas | `region:us` |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only estándar de 35,7 M de parámetros, con dimensión de modelo 512, 6 capas y 8 cabezas de atención, más un vocabulario de 32.768 tokens y pesos de embedding atados (tied embedding) entre la capa de entrada y la proyección de salida. El tokenizador es un BPE de nivel de byte entrenado exclusivamente sobre el split de entrenamiento del corpus utilizado, lo que implica que su cobertura está acotada al dominio de esos datos.

El entrenamiento consistió en preentrenamiento de predicción del siguiente token sobre HAP-E (chunk_1 + chunk_2 de texto humano), con un presupuesto declarado de 9.715.712 tokens, una sola pasada sobre el dataset y tamaño de batch 32. El elemento diferencial es el optimizador: Sophia-H con estimación diagonal de la Hessiana, según el algoritmo 4 de Wen et al. (2025), empleado aquí como componente bonus de la práctica. No se declara en la información disponible el uso de RLHF, DPO, SFT posterior, ni técnicas como decodificación especulativa o atención lineal. El checkpoint publicado corresponde al estado `final`, es decir, al agotamiento del presupuesto de tokens.

Conviene señalar la relación entre tamaño y datos: el presupuesto de 9,7 M de tokens equivale a aproximadamente 0,27 tokens por parámetro, muy por debajo de la ratio ~20 tokens/parámetro que suele citarse como referencia de eficiencia computacional (Chinchilla). El modelo está, por tanto, claramente infraentrenado incluso para su escala.

## Capacidades

- Generación de texto autoregresiva a pequeña escala: continuación de secuencias y modelado del siguiente token sobre dominios próximos al corpus HAP-E.
- Modelado de lenguaje base: puede usarse como banco de pruebas para perplejidad, curvas de entrenamiento y comparativas de optimizadores.
- Tokenización BPE de nivel de byte con vocabulario de 32.768 entradas, entrenada sobre el propio split de entrenamiento.
- Ejecución en CPU y en GPU de gama baja gracias a su tamaño reducido (35,7 M de parámetros, ~143 MB en FP32).
- Punto de partida para ajuste fino supervisado en tareas concretas de clasificación o generación corta.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües declaradas: no disponible.
- Capacidades especiales (modo pensamiento, visión, audio): no disponible.

## Casos de uso

- Reproducción de experimentos de optimizadores: el checkpoint es el resultado final de una ejecución con Sophia-H (Hessiana diagonal) y sirve para contrastar curvas de pérdida y estabilidad frente a AdamW u otros optimizadores en un régimen de 35 M de parámetros y 9,7 M de tokens, con un coste de cómputo asumible en una sola GPU.
- Docencia y prácticas de NLP avanzado: permite a estudiantes inspeccionar un `state_dict`, el `config.json` asociado y un tokenizador BPE byte-level entrenado ad hoc, sin necesidad de infraestructura de clúster.
- Ablaciones de tokenización: al incluir `tokenizer.json` entrenado sobre el split de entrenamiento, es posible comparar el efecto de distintos vocabularios o estrategias de tokenización manteniendo fija la arquitectura.
- Ajuste fino para tareas de clasificación o generación corta: con 35,7 M de parámetros el modelo se puede especializar en datasets pequeños (etiquetado de frases, generación de respuestas breves) en minutos u horas en una GPU consumer.
- Inferencia en el borde y pruebas de despliegue: su huella de memoria (~143 MB en FP32) permite validar pipelines de exportación y servicio (por ejemplo, conversión a otros formatos, servidores ligeros) antes de escalar a modelos mayores.
- Generación de datos sintéticos a pequeña escala para aumentar datasets de entrenamiento en prototipos de investigación, aceptando la baja calidad esperable de un modelo infraentrenado.
- Estudio de sesgos y comportamiento de modelos pequeños: útil como sujeto de análisis en trabajos sobre correlación entre tamaño, datos de entrenamiento y sesgos emergentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card únicamente documenta el protocolo de entrenamiento (tokens consumidos, batch, optimizador) y el recuento de parámetros; no incluye MMLU, HumanEval, GSM8K, perplejidad de validación ni ninguna otra métrica.

## Requisitos de hardware

Estimaciones derivadas del recuento de parámetros declarado (35.658.240); no proceden de mediciones publicadas por el autor.

- VRAM estimada para inferencia: ~143 MB en FP32 (4 bytes/parámetro), ~71 MB en FP16/BF16 (2 bytes/parámetro), ~36 MB en int8 (1 byte/parámetro). A esto hay que sumar activaciones y memoria del tokenizador, marginales en este tamaño.
- GPU recomendadas: prácticamente cualquier GPU con soporte CUDA, incluidas GTX 1050 Ti, GTX 1650, RTX 3050, RTX 4060 o superiores. No requiere A100, H100 ni GPU de centro de datos.
- Cabe en GPU consumer: sí, en cualquiera con al menos 1-2 GB de VRAM libre. También es viable en CPU, dado el tamaño del modelo.
- Opciones de despliegue: el checkpoint se distribuye en formato PyTorch (`.pt`) y depende del código de la práctica (`src.part1.model.TransformerLM`, `src.part1.data.load_tokenizer`) para cargarse. No se publican pesos en GGUF ni safetensors, por lo que llama.cpp, Ollama o TGI no funcionan de forma directa sin una conversión previa. vLLM tampoco es compatible sin adaptar la arquitectura al registro de modelos soportados.
- Latencia y throughput estimados: no disponible (no hay mediciones publicadas).

## Comparativa con modelos similares

No hay benchmarks publicados de este checkpoint, por lo que la comparación es exclusivamente estructural. Los datos de los modelos alternativos provienen de su documentación pública y pueden variar según la revisión consultada.

| Modelo | Parametros | Contexto | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| anlp-a2-p2-sophia (este modelo) | 35,7 M | no disponible | Transformer decoder-only, 6 capas, D=512 | no disponible | HuggingFace, pesos `.pt` con código externo |
| GPT-2 small (OpenAI) | 124 M | 1.024 tokens | Transformer decoder-only, 12 capas, D=768 | MIT (pesos publicados) | HuggingFace, safetensors/PyTorch |
| Pythia-70M (EleutherAI) | 70 M | 2.048 tokens | Transformer decoder-only, 6 capas, D=512 | Apache-2.0 | HuggingFace, safetensors/PyTorch |
| SmolLM-135M (HuggingFace) | 135 M | 2.048 tokens | Transformer decoder-only, 30 capas, D=576 | Apache-2.0 | HuggingFace, safetensors/GGUF |

Diferencias relevantes: los tres modelos de referencia se entrenaron con presupuestos de tokens de varios órdenes de magnitud superiores (cientos de miles de millones en el caso de SmolLM) y se distribuyen con licencias explícitas y formatos estándar, mientras que este checkpoint declara 9,7 M de tokens y no especifica licencia ni contexto.

## Limitaciones y advertencias

- Modelo severamente infraentrenado: 9,7 M de tokens para 35,7 M de parámetros (≈0,27 tokens/parámetro) está muy lejos de las ratios habitualmente recomendadas; la calidad de generación será muy baja y la perplejidad, alta.
- Licencia no especificada: al no declararse licencia, no hay autorización explícita de uso comercial ni de redistribución. Tratar como material sin licencia clara y contactar con el autor antes de cualquier uso fuera del ámbito académico.
- Riesgo elevado de alucinación y de texto incoherente: la combinación de corpus pequeño, tokenizador entrenado solo sobre el split de entrenamiento y ausencia de ajuste por instrucciones implica que el modelo no sigue instrucciones ni mantiene coherencia en generaciones largas.
- Dependencia de código externo: la carga requiere el repositorio de la práctica (`src.part1.model.TransformerLM` y `src.part1.data.load_tokenizer`). El `state_dict` por sí solo no es cargable con `transformers` sin escribir una integración a medida.
- Sesgos desconocidos: el corpus HAP-E no se describe en detalle en la información disponible y no se documenta ningún análisis de sesgo, toxicidad o representación.
- Cobertura lingüística y de dominio limitada: el vocabulario y los pesos reflejan únicamente el corpus de entrenamiento; el rendimiento fuera de ese dominio será previsiblemente pobre. El idioma o idiomas del corpus no se especifican.
- Sin evaluación publicada: no existen métricas de validación, benchmarks ni comparativas de pérdida, por lo que no es posible afirmar ningún nivel de rendimiento.
- Contexto desconocido: no se declara la longitud de contexto soportada, lo que impide planificar su uso en conversaciones multi-turno o documentos largos.
- Uso en producción desaconsejado: es un artefacto académico sin garantías de estabilidad, soporte ni mantenimiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/irishbumfuzzle/anlp-a2-p2-sophia
- Repositorio de la asignatura (referenciado en la model card como `src.part1`): no disponible, no se incluye URL en la información proporcionada.
- Paper del optimizador Sophia-H (Wen et al. 2025, algoritmo 4): citado en la model card, sin enlace disponible en la información proporcionada.
- Dataset HAP-E (chunk_1 + chunk_2): citado en la model card, sin enlace disponible en la información proporcionada.
- Resultados de búsqueda web: los resultados devueltos por la búsqueda no guardan relación con el modelo (corresponden a tours de safari en Ciudad del Cabo y la Garden Route). No se han encontrado enlaces técnicos relevantes sobre este checkpoint, su dataset o su evaluación.
