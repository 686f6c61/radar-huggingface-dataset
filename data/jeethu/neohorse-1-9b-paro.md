# Jeethu/NeoHorse-1-9B-PARO

## Resumen

Jeethu/NeoHorse-1-9B-PARO es una versión cuantizada a 4 bits del modelo TokenRhythm/NeoHorse-1-9B, publicada por el usuario Jeethu. La cuantización se ha realizado con ParoQuant (Pairwise Rotation Quantization), un esquema INT4 desarrollado por z-lab que, según sus autores, reduce la brecha de precisión respecto a FP16 manteniendo una velocidad de inferencia cercana a la de AWQ. El modelo base está orientado a cargas de trabajo agénticas: uso de herramientas (tool calling), generación de código, razonamiento e instrucciones.

El repositorio declara 2.980.426.240 parámetros (aproximadamente 2,98 mil millones) en formato safetensors, una cifra notablemente inferior a la que sugiere la nomenclatura "9B" del modelo base. La model card no especifica longitud de contexto, idiomas soportados, composición del dataset ni resultados de benchmarks, por lo que buena parte de las especificaciones quedan como no disponibles.

Su relevancia actual es doble: por un lado, permite ejecutar un modelo de razonamiento y uso de herramientas en hardware de consumo gracias a la cuantización INT4; por otro, sirve como caso de prueba reproducible del método ParoQuant descrito en el paper arXiv:2511.10645. Al tratarse de una publicación reciente (12 de septiembre de 2026) con cero descargas y cero "likes", todavía no existe validación independiente de su calidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, familia `qwen3_5_text` (según el tag `transformers`), modelo denso |
| Parametros totales | 2.980.426.240 (≈2,98 B, según safetensors) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT4 (ParoQuant, cuantización por rotación por pares); el modelo base se distribuye sin cuantizar |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (4 bits) |
| Tamano del repositorio | 7,7 GB |
| Modelo base | TokenRhythm/NeoHorse-1-9B |
| Relación con el modelo base | quantized (cuantización del base) |
| Librería | transformers |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only denso, etiquetado con el tipo de arquitectura `qwen3_5_text` en el ecosistema transformers, lo que indica que el modelo base NeoHorse-1-9B se construyó sobre la familia Qwen3.5 de texto. No se dispone del número de capas, dimensión oculta, número de cabezas de atención, tamaño de vocabulario ni de si emplea mecanismos adicionales (atención lineal, decodificación especulativa, etc.). Tampoco se documenta el proceso de entrenamiento del modelo base: ni el volumen de tokens, ni la composición del corpus, ni si hubo fases de RLHF, DPO o ajuste por instrucciones.

La innovación técnica relevante está en la capa de cuantización. ParoQuant aplica una rotación por pares (pairwise rotation) antes de cuantizar a INT4, con el objetivo de reducir el error de cuantización en los valores atípicos de las activaciones y los pesos. Los autores lo presentan como un esquema INT4 de referencia que iguala en precisión a FP16 en la práctica y que se ejecuta a velocidad cercana a AWQ. El soporte declarado abarca GPU NVIDIA (vLLM y Transformers) y Apple Silicon vía MLX. El paper asociado es arXiv:2511.10645 y la implementación se distribuye en el repositorio github.com/z-lab/paroquant y en el paquete PyPI `paroquant`.

## Capacidades

- Generación de texto conversacional y de propósito general, con soporte de plantillas de chat.
- Razonamiento (reasoning), incluyendo tareas de lógica y matemáticas de varios pasos, según los tags declarados por el autor.
- Generación de código (`coding`), presumiblemente con soporte de instrucciones de programación.
- Uso de herramientas y function calling (`tool-use`), lo que habilita integración con APIs y ejecución de acciones.
- Comportamiento agéntico (`agentic`), orientado a flujos de múltiples pasos con planificación y llamadas a herramientas.
- Seguimiento de instrucciones (`instruction-following`) en formato chat multi-turno.
- Capacidades multilingües: no disponible (no se documenta la cobertura de idiomas).
- Modo de razonamiento explícito (thinking mode): no confirmado en la información disponible.
- Visión o audio: no soportado según los tags del repositorio (solo texto).
- Compatibilidad con Hugging Face Inference Endpoints (`endpoints_compatible`).

## Casos de uso

- Agentes autónomos con tool calling: el modelo puede encadenar llamadas a funciones externas (búsqueda, APIs REST, bases de datos) en bucles de varios pasos, aprovechando su entrenamiento declarado para uso de herramientas y flujos agénticos. Su tamaño reducido permite desplegarlo como agente local sin depender de una API externa.
- Asistente de código en el IDE: generación y autocompletado de fragmentos, explicación de código y refactorización. Al ser un modelo de ~3B en INT4, la latencia en hardware de consumo es compatible con asistencia interactiva, aunque no hay cifras de throughput publicadas.
- Integración en pipelines de CI/CD: revisión automática de parches, generación de mensajes de commit y resumen de diffs, con salida estructurada mediante function calling para que el resultado sea consumible por otras herramientas del pipeline.
- Atención al cliente automatizada: gestión de conversaciones multi-turno con contexto largo. Es adecuado cuando se prioriza coste por token bajo y despliegue on-premise, aunque la longitud de contexto real no está documentada y debe medirse antes de comprometer SLA.
- RAG sobre documentación interna: combinado con un motor de recuperación, el modelo puede redactar respuestas fundamentadas en fragmentos recuperados. La ventana de contexto no publicada obliga a dimensionar el número de fragmentos empíricamente.
- Procesamiento por lotes de bajo coste: clasificación de tickets, extracción de entidades, resumen de correos y normalización de datos donde el coste de inferencia es el criterio principal y no se requiere la máxima precisión.
- Despliegue en el borde y en portátiles: gracias a ParoQuant sobre MLX, puede ejecutarse en Apple Silicon (Mac con memoria unificada) para asistentes locales sin conexión, algo relevante en entornos con requisitos de privacidad.
- Experimentación académica con cuantización: caso de uso metodológico para reproducir los resultados de ParoQuant sobre un modelo de razonamiento pequeño y comparar la degradación frente a FP16, AWQ o GPTQ.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye tablas de MMLU, HumanEval, GSM8K, MATH, BFCL ni ninguna otra métrica, ni del modelo cuantizado ni del modelo base TokenRhythm/NeoHorse-1-9B. Tampoco se aportan comparativas de perplejidad frente a FP16 para cuantificar la pérdida introducida por ParoQuant en este modelo concreto.

## Requisitos de hardware

- VRAM estimada para inferencia: con pesos INT4 de ~2,98 B de parámetros, el peso del modelo ocupa del orden de 1,5 GB; contando escalas, offsets y overhead de runtime, es razonable reservar entre 2 y 3 GB solo para pesos. La memoria para la caché KV depende de la longitud de contexto (no documentada) y no puede estimarse con los datos disponibles.
- Gama de consumo: cabe con holgura en GPU de consumo como RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080 y RTX 4090. También en GPU con 6-8 GB si el contexto es corto.
- GPU profesionales: A100, H100 o L40S no son necesarias para un modelo de este tamaño; se usan solo para servir muchas réplicas concurrentes o contextos muy largos.
- Apple Silicon: soporte declarado vía MLX, por lo que es viable en equipos con memoria unificada (familias M1, M2, M3 y posteriores), incluyendo configuraciones de 16 GB o menos si se limita el contexto.
- Opciones de despliegue: Transformers y vLLM sobre NVIDIA; MLX sobre Apple Silicon; Hugging Face Inference Endpoints (el repositorio está etiquetado como `endpoints_compatible`). No se confirma soporte de llama.cpp, Ollama ni TGI, y no se menciona ningún archivo en formato GGUF.
- Latencia y throughput: no disponible. La model card solo afirma cualitativamente que ParoQuant se ejecuta a velocidad cercana a AWQ, sin cifras de tokens por segundo ni comparativa medida.
- Nota sobre el tamaño del repositorio: los 7,7 GB declarados son notablemente superiores a los ~1,5 GB esperables para ~3 B de parámetros en 4 bits, lo que sugiere la presencia de tensores adicionales o ficheros de mayor precisión. El desglose no está documentado.

## Comparativa con modelos similares

No existe ningún benchmark publicado que enfrente a este modelo con alternativas, por lo que la comparación se limita a características objetivas de las model cards públicas. Las cifras de los modelos de la competencia proceden de sus respectivas fichas oficiales.

| Modelo | Parametros | Contexto | Licencia | Formatos de pesos | Notas |
|---|---|---|---|---|---|
| NeoHorse-1-9B-PARO | 2,98 B | no disponible | Apache 2.0 | safetensors INT4 (ParoQuant) | Cuantización INT4 de un derivado Qwen3.5; sin benchmarks publicados |
| Qwen3-4B | 4,0 B | 32.768 tokens nativos (131.072 con YaRN) | Apache 2.0 | safetensors, GGUF, AWQ, GPTQ | Referencia directa por familia de arquitectura y rango de tamaño |
| Llama-3.2-3B | 3,2 B | 128.000 tokens | Llama 3.2 Community License | safetensors, GGUF, AWQ, GPTQ | Uso comercial permitido con condiciones (cláusula de 700 M de usuarios activos mensuales) |

Diferencias clave: el modelo analizado es el único de la tabla distribuido exclusivamente en INT4 con un esquema de cuantización propietario (ParoQuant), lo que ata su explotación al soporte de vLLM, Transformers o MLX y descarta, a día de hoy, el ecosistema GGUF/llama.cpp. Frente a Qwen3-4B y Llama-3.2-3B, carece de benchmarks publicados, de contexto declarado y de cualquier validación externa, por lo que no puede recomendarse como sustituto directo sin una evaluación propia.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay evidencia publicada de calidad en MMLU, HumanEval, GSM8K ni en evaluación de tool calling, ni comparación de perplejidad frente al modelo base en FP16. La pérdida real introducida por ParoQuant en este modelo es desconocida.
- Riesgo de alucinación: en modelos de ~3 B parámetros el razonamiento multi-paso y las afirmaciones factuales son menos fiables que en modelos de mayor tamaño; no se documenta ningún mecanismo de mitigación ni modo de razonamiento verificable.
- Discrepancia de nomenclatura: el nombre del modelo base indica "9B" pero el recuento real de safetensors es de 2,98 B parámetros. Conviene verificar el modelo base antes de asumir capacidades derivadas del nombre.
- Idiomas no documentados: se desconoce si el modelo mantiene un rendimiento aceptable en castellano o en otros idiomas distintos del inglés. Requiere evaluación propia antes de usarlo en producción multilingüe.
- Longitud de contexto desconocida: no se puede dimensionar la caché KV ni garantizar el comportamiento en conversaciones largas o en RAG con muchos fragmentos.
- Dependencia del runtime de cuantización: el modelo requiere el soporte de ParoQuant en vLLM/Transformers o MLX. No hay GGUF, por lo que no es desplegable hoy en llama.cpp, Ollama o LM Studio sin una reconversión adicional.
- Licencia: Apache 2.0 permite uso comercial, modificación y redistribución, siempre que se conserve el aviso de copyright y la licencia, y se indique si se han realizado cambios. No hay cláusulas de uso restringido más allá de las habituales de la licencia, pero el modelo base y los datos de entrenamiento podrían arrastrar condiciones adicionales no reflejadas en esta ficha.
- Madurez: el repositorio tiene cero descargas y cero valoraciones, fue creado el 12 de septiembre de 2026 y no hay informes de terceros sobre su comportamiento en producción. No se recomienda su adopción en sistemas críticos sin una batería de pruebas propia.
- Sesgos: no hay información sobre la composición del dataset de entrenamiento del modelo base, por lo que no es posible evaluar sesgos de género, etnia, idioma o dominio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Jeethu/NeoHorse-1-9B-PARO
- Modelo base: https://huggingface.co/TokenRhythm/NeoHorse-1-9B
- Paper de ParoQuant: https://arxiv.org/abs/2511.10645
- Blog de ParoQuant: https://paroquant.z-lab.ai
- Repositorio de código: https://github.com/z-lab/paroquant
- Paquete PyPI: https://pypi.org/project/paroquant/
- Colección de modelos ParoQuant: https://huggingface.co/collections/z-lab/paroquant
