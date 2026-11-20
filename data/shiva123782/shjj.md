# shiva123782/Shjj

## Resumen

Shjj es un ajuste fino mediante LoRA del modelo Qwen/Qwen2.5-0.5B-Instruct, publicado por el usuario shiva123782 bajo la marca "Kaveri AI". Se trata de un adaptador PEFT (no de un modelo completo con pesos fusionados) orientado a generación de texto conversacional en inglés, presentado por su autor como un "Sovereign Enterprise Small Language Model" con certificaciones de verificación formal (Z3 SMT) y conformidad regulatoria (EU AI Act, DPDP Act india) que no están respaldadas por documentación técnica verificable en la información disponible.

El modelo base Qwen2.5-0.5B-Instruct es un transformer causal de 0,49 mil millones de parámetros desarrollado por Alibaba Qwen, con una ventana de contexto de 32.768 tokens y entrenamiento en inglés y chino principalmente. El adaptador Shjj añade capas LoRA de rango 16 y alpha 32 sobre los módulos de proyección de atención y MLP, entrenado sobre el dataset yahma/alpaca-cleaned.

La relevancia práctica de este modelo es muy limitada: se trata de un adaptador experimental sin descargas, sin likes, sin benchmarks estándar publicados (MMLU, HumanEval, GSM8K) y con afirmaciones de rendimiento (198+ tok/s, 18,2 ms P99, "100% zero-leak" sobre 200 millones de consultas) que no son verificables ni comparables con métricas convencionales. Su interés es principalmente como ejemplo de adaptador LoRA pequeño sobre un SLM de 0,5B, no como modelo de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (Qwen2.5) con adaptador LoRA |
| Parametros totales | 0,49 mil millones (modelo base Qwen2.5-0.5B-Instruct) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens (heredada del modelo base Qwen2.5-0.5B-Instruct) |
| Tipos de cuantizacion | 4-bit NormalFloat (NF4) en forward pass según model card; el adaptador se distribuye en precisión de entrenamiento (bf16/fp16) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA, librería `peft`) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA sobre Qwen2.5-0.5B-Instruct, un transformer decoder-only con atención causal estándar. El adaptador tiene rango r=16, alpha=32 y dropout 0,05, aplicado sobre los módulos `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj` y `down_proj`. La model card menciona "LoRA+ con η_B = 8.0 · η_A" (dynamic matrix balancing), una técnica de optimización que asigna una tasa de aprendizaje mayor a la matriz B del adaptador. El entrenamiento se realizó en 16-bit (bfloat16/float16) con un pico de VRAM de 3,2 GB según el autor.

El dataset de ajuste es yahma/alpaca-cleaned, un corpus de instrucciones en inglés derivado de Alpaca con aproximadamente 52.000 ejemplos. No se especifica el número de tokens de entrenamiento, la composición exacta del dataset, ni si hubo etapas de RLHF o DPO adicionales. Las menciones a "verificación formal Z3 SMT" y "20-Crore Bijective Identity Benchmark" no van acompañadas de artefactos técnicos verificables (repositorio de evaluación, scripts, informes reproducibles) en la información proporcionada; deben tratarse como afirmaciones del autor no auditadas.

## Capacidades

- Generación de texto conversacional e instruccional en inglés, heredada del ajuste de Qwen2.5-0.5B-Instruct.
- Respuesta a instrucciones de tipo Alpaca (pregunta-respuesta, resumen, reescritura básica) gracias al ajuste sobre yahma/alpaca-cleaned.
- Razonamiento básico y matemáticas elementales limitadas por el tamaño de 0,5B parámetros.
- Soporte de tool calling / function calling: no documentado en la model card; el modelo base Qwen2.5-0.5B-Instruct soporta function calling, pero no se confirma que el adaptador lo preserve.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: limitadas al inglés según la metadata (`language: en`); el modelo base soporta chino e inglés, pero el adaptador no declara otros idiomas.
- Capacidades especiales (visión, audio, thinking mode): no disponibles.

## Casos de uso

- Prototipado rápido de asistentes conversacionales en inglés: el adaptador se carga sobre Qwen2.5-0.5B-Instruct con `PeftModel` en pocas líneas y cabe en cualquier GPU consumer, lo que permite validar pipelines de chat antes de escalar a modelos mayores.
- Experimentación académica con LoRA: sirve como ejemplo reproducible de ajuste fino de un SLM de 0,5B sobre Alpaca, útil para estudiar el efecto de LoRA+ (η_B = 8.0 · η_A) frente a LoRA estándar.
- Fine-tuning educativo en entornos con recursos limitados: el pico de 3,2 GB de VRAM permite entrenar y evaluar adaptadores en GPUs de gama media (T4, RTX 3060) sin infraestructura dedicada.
- Generación de texto corto en inglés para tareas de formato (listas, resúmenes de una frase, reescritura): adecuado por su bajo coste de inferencia y su naturaleza instruccional.
- Despliegue en edge o entornos con restricciones de memoria: con cuantización 4-bit el modelo completo ocupa del orden de 0,3-0,5 GB, lo que permite ejecutarlo en CPU o GPUs integradas para demos y pruebas de concepto.
- Base para investigación sobre identidad y comportamiento de modelos ("identity retention"): el autor propone un benchmark de identidad propio; aunque no es verificable, el adaptador puede usarse para estudiar cómo un ajuste pequeño modifica respuestas sobre la propia identidad del modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card incluye una tabla de "20-Crore Bijective Identity Benchmark" con métricas de retención de identidad y "zero-leak", pero no son benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) ni se acompañan de scripts o informes reproducibles. El autor declara 198+ tok/s y 18,2 ms P99 de latencia en un "standard desktop workstation", sin especificar hardware, cuantización ni batch size, por lo que no es posible contrastar la cifra.

## Requisitos de hardware

- VRAM estimada para inferencia: ~1 GB en fp16 (0,5B parámetros), ~0,3-0,5 GB en 4-bit NF4. El adaptador LoRA añade unos pocos MB.
- GPU recomendadas: cualquier GPU con ≥2 GB de VRAM para fp16; T4, RTX 3060/4060, RTX 4090, A100 y H100 funcionan sin problema.
- Cabe en GPU consumer: sí, en cualquier GPU consumer moderna (GTX 1650 4 GB en adelante) e incluso en CPU para inferencia lenta.
- Opciones de despliegue: transformers + peft (ruta oficial documentada), llama.cpp/Ollama solo si se fusionan los pesos del adaptador y se convierten a GGUF (no documentado por el autor), vLLM y TGI requerirían fusión previa del adaptador.
- Latencia y throughput: el autor declara 198+ tok/s y 18,2 ms P99 en hardware no especificado; no verificable de forma independiente.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Shjj (este modelo) | 0,49B (base) + LoRA r=16 | 32.768 (heredado) | Apache 2.0 | Adaptador PEFT en HF, 0 descargas | Sin benchmarks estándar publicados |
| Qwen/Qwen2.5-0.5B-Instruct | 0,49B | 32.768 | Apache 2.0 | Modelo completo en HF, ampliamente usado | Base de Shjj; benchmarks oficiales publicados por Qwen |
| Qwen/Qwen2.5-1.5B-Instruct | 1,5B | 32.768 | Apache 2.0 | Modelo completo en HF | Mayor capacidad con coste de VRAM moderado |
| meta-llama/Llama-3.2-1B-Instruct | 1,2B | 128.000 | Llama 3.2 Community License | Modelo completo en HF | Contexto mucho mayor; licencia con restricciones de uso |

## Limitaciones y advertencias

- Tamaño muy reducido (0,5B parámetros): capacidad de razonamiento, matemáticas y código limitada; propenso a errores en tareas complejas y a alucinaciones en dominios especializados.
- Adaptador sobre un único dataset (yahma/alpaca-cleaned): riesgo de sobreajuste al estilo Alpaca y de degradación de capacidades del modelo base no cubiertas por dicho corpus.
- Idioma: solo inglés declarado; el adaptador puede degradar el rendimiento del modelo base en otros idiomas.
- Afirmaciones no verificables: certificaciones Z3 SMT, "100% zero-leak" sobre 200 millones de consultas, conformidad EU AI Act Artículo 53 y DPDP Act 2025 no están respaldadas por artefactos reproducibles en la información disponible; no deben citarse como garantías en producción.
- Sin benchmarks estándar: no hay resultados de MMLU, HumanEval, GSM8K ni comparaciones independientes; la evaluación del autor se basa en métricas propias no auditadas.
- Licencia Apache 2.0: permite uso comercial y redistribución, pero el adaptador hereda las limitaciones del modelo base Qwen2.5-0.5B-Instruct; conviene revisar la licencia del modelo base antes de desplegar.
- Despliegue: al ser un adaptador PEFT, requiere cargar el modelo base por separado; no es un artefacto autónomo y no se distribuye en GGUF ni en formato fusionado.
- Madurez: 0 descargas y 0 likes en el momento de la consulta; sin mantenimiento ni comunidad que valide su comportamiento en producción.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/shiva123782/Shjj)
- [Modelo base Qwen/Qwen2.5-0.5B-Instruct](https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct)
- [Dataset yahma/alpaca-cleaned](https://huggingface.co/datasets/yahma/alpaca-cleaned)
- [Librería PEFT](https://github.com/huggingface/peft)
- [Documentación de Qwen2.5 (Alibaba Qwen)](https://qwen.readthedocs.io/)
- No se han encontrado papers, blogs, repositorios de evaluación ni demos adicionales en la información proporcionada.
