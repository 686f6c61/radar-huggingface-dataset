# Polydim-Einsof/llama-3.3-8b-pmtp

## Resumen

llama-3.3-8b-pmtp es un adaptador publicado por Polydim-Einsof (Ariel García Traba, iniciativa POLYDIM-EINSOF) sobre el modelo base meta-llama/Llama-3.3-8B-Instruct. Según la model card, el adaptador implementa una transformación geométrica sobre el espacio latente del modelo: una proyección sobre una subvariedad de Stiefel denotada como St(4096, 2048) embebida en S^(2047), que reduce la dimensión del espacio de representación de 4096 a 2048 dimensiones canónicas. El autor lo presenta como un mecanismo de "razonamiento en variedad" (manifold reasoning) orientado a diálogo de alta calidad y síntesis conceptual multilingüe.

El repositorio tiene un tamaño declarado de 0.0 GB, cero descargas y cero likes en el momento de la consulta, y no incluye pesos visibles en el listado de ficheros. La model card describe componentes de infraestructura propios (un "Silicon Contract" con C++20/Rust 2024/AVX2, un bus de memoria compartida PmtpShmBus en FP64, y una base de datos PostgreSQL 16 llamada polydim_vec_db con 1.740 teoremas formales), pero no documenta hiperparámetros de entrenamiento, composición del dataset ni resultados de evaluación.

La relevancia de esta ficha es fundamentalmente descriptiva: se trata de una publicación de investigación independiente con muy poca información verificable. Cualquier evaluación de producción debería tratar los datos de la model card como afirmaciones del autor no contrastadas y verificar la existencia real de pesos antes de planificar un despliegue.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Llama-3.3-8B-Instruct) con adaptador de proyección sobre subvariedad de Stiefel St(4096, 2048) en S^(2047) |
| Parametros totales | 8 000 millones (heredados del modelo base; el adaptador no declara recuento propio) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Llama-3.3-8B-Instruct soporta 128 000 tokens, pero el adaptador no lo confirma) |
| Tipos de cuantizacion | no disponible (el repo solo declara safetensors) |
| Idiomas soportados | no disponibles (la model card menciona "cross-lingual" sin enumerar idiomas) |
| Licencia | Llama 3.3 Community License |
| Formato de pesos | safetensors (declarado en los tags del repositorio) |

## Arquitectura y entrenamiento

El modelo parte de Llama-3.3-8B-Instruct, un transformer decoder-only de 8 000 millones de parámetros con atención causal estándar y RoPE. Sobre esa base, el autor declara un adaptador geométrico que proyecta el espacio de representación de dimensión d_model = 4096 sobre un subespacio canónico de 2048 dimensiones, descrito como una variedad de Stiefel St(4096, 2048) embebida en una esfera S^(2047). El "Stiefel defect" reportado es 4.35e-09, calculado con un acumulador Neumaier en FP64, lo que sugiere que la ortogonalidad de la base proyectada se mantiene numéricamente en doble precisión.

La model card menciona además un "Zero-Worm Protocol" para transferencia de pensamiento continuo mediante un identificador SLAB_ID, sin serialización intermedia en JSON o Markdown, y una integración con 1.740 teoremas formales almacenados en PostgreSQL 16. No se especifica el número de tokens de entrenamiento, la composición del dataset, ni si hubo RLHF, DPO o ajuste supervisado adicional sobre el modelo base. Tampoco se documenta el procedimiento de optimización del adaptador ni el coste computacional asociado.

## Capacidades

- Generación de texto y diálogo multi-turno, heredadas del modelo base Llama-3.3-8B-Instruct.
- Razonamiento declarado sobre representaciones proyectadas en la subvariedad de Stiefel (la model card lo etiqueta como "conceptual synthesis" y "manifold reasoning"); no se aportan evidencias cuantitativas.
- Capacidad multilingüe declarada de forma genérica ("cross-lingual"), sin listado de idiomas ni evaluaciones por idioma.
- Soporte de tool calling y function calling: no disponible en la información proporcionada (el modelo base lo soporta, pero el adaptador no lo confirma).
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Modo "thinking" explícito, visión o audio: no disponible.
- Integración con el stack propietario del autor (PmtpShmBus, polydim_vec_db, SLAB_ID) descrita en la model card, sin documentación pública de API.

## Casos de uso

- Investigación sobre geometría del espacio latente: el adaptador permite experimentar con proyecciones sobre subvariedades de Stiefel y medir su efecto en la calidad del diálogo frente al modelo base, siempre que se verifiquen los pesos.
- Diálogo conversacional de dominio general: al heredar Llama-3.3-8B-Instruct, puede emplearse en asistentes multi-turno si el adaptador no degrada las capacidades originales, algo que requeriría validación propia.
- Prototipado de sistemas de síntesis conceptual: la model card lo orienta a "conceptual synthesis", por lo que encaja en experimentos de resumen y reformulación de ideas complejas, con evaluación manual obligatoria.
- Reproducción de resultados de investigación independiente: útil para grupos que quieran auditar las afirmaciones del autor sobre el defecto de Stiefel y el acumulador Neumaier en FP64.
- Integración en pipelines propios del autor: el bus PmtpShmBus y la base polydim_vec_db están pensados para entornos C++20/Rust 2024 con AVX2, lo que limita su uso a infraestructura compatible.
- Base para fine-tuning posterior: si los pesos están disponibles, puede servir como punto de partida para ajustes específicos de dominio, aunque la falta de benchmarks hace recomendable comparar contra el modelo base antes de invertir esfuerzo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni evaluaciones de diálogo, y el repositorio no contiene ficheros de resultados.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Como referencia del modelo base de 8 000 millones de parámetros, en FP16 se requieren aproximadamente 16 GB de VRAM, y en cuantización de 4 bits en torno a 5-6 GB, pero el adaptador no documenta requisitos propios.
- GPU recomendadas: no disponible. Por tamaño del modelo base, serían razonables A100 40 GB, H100 80 GB, L40S o RTX 4090 24 GB en FP16, y GPUs consumer de 8-12 GB con cuantización, siempre sujeto a verificación.
- Compatibilidad con GPU consumer: probable por el tamaño del modelo base, no confirmada para el adaptador.
- Opciones de despliegue: la model card menciona el tag de Ollama `llama3.3:8b` y un stack nativo C++20/Rust 2024 con AVX2 y PmtpShmBus; no se documenta compatibilidad con vLLM, llama.cpp, TGI ni Ollama más allá de esa referencia.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| llama-3.3-8b-pmtp | 8 000 M (base) | no disponible | Llama 3.3 Community | Repo de 0.0 GB, 0 descargas | Adaptador geométrico sin benchmarks publicados |
| meta-llama/Llama-3.3-8B-Instruct | 8 000 M | 128 000 tokens | Llama 3.3 Community | Público en Hugging Face | Modelo base oficial, con evaluaciones publicadas por Meta |
| Qwen2.5-7B-Instruct | 7 600 M | 131 072 tokens | Apache 2.0 | Público en Hugging Face | Alternativa de tamaño similar con licencia permisiva |
| Mistral-7B-Instruct-v0.3 | 7 200 M | 32 768 tokens | Apache 2.0 | Público en Hugging Face | Alternativa consolidada con ecosistema amplio |

La comparación directa de rendimiento no es posible porque el adaptador no publica métricas. Frente al modelo base, la única diferencia documentada es la proyección geométrica y el stack propietario del autor.

## Limitaciones y advertencias

- Ausencia de pesos verificables: el repositorio declara 0.0 GB de tamaño, por lo que no se confirma que los safetensors estén realmente publicados.
- Cero descargas y cero likes: no hay evidencia de uso ni de validación por parte de la comunidad.
- Sin benchmarks ni evaluaciones: no se puede afirmar que el adaptador mejore, mantenga o degrade las capacidades del modelo base.
- Afirmaciones no contrastadas: el "Stiefel defect" de 4.35e-09, los 1.740 teoremas formales y el "Zero-Worm Protocol" son declaraciones del autor sin reproducibilidad documentada.
- Idiomas no especificados: la etiqueta "cross-lingual" no viene acompañada de listado ni de evaluaciones por idioma.
- Riesgo de alucinación: heredado del modelo base y no mitigado de forma documentada; la falta de evaluación específica impide cuantificarlo.
- Sesgos: no documentados; se heredan los del corpus de entrenamiento de Llama-3.3, sin análisis adicional por parte del autor.
- Restricciones de licencia: la Llama 3.3 Community License impone condiciones de uso comercial, atribución y políticas de uso aceptable que deben revisarse antes de cualquier despliegue en producción.
- Dependencia de infraestructura propietaria: el bus PmtpShmBus, la base polydim_vec_db y el contrato C++20/Rust 2024/AVX2 limitan la portabilidad y complican la auditoría independiente.
- Fecha de creación futura (2026-11-09): conviene verificar la autenticidad y vigencia de la publicación antes de considerarla en un proyecto real.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Polydim-Einsof/llama-3.3-8b-pmtp
- Repositorio GitHub del autor: https://github.com/AGT1973/POLYDIM_EINSOF
- Modelo base: https://huggingface.co/meta-llama/Llama-3.3-8B-Instruct
- Licencia Llama 3.3: https://www.llama.com/llama3_3/license/
