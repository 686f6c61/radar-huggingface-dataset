# h3rb3rn/moe-expert-research-4b

## Resumen

`moe-expert-research-4b` es un modelo de lenguaje especializado de 4 mil millones de parámetros, desarrollado por el usuario h3rb3rn, diseñado para tareas de síntesis de evidencia, revisión de literatura técnica y verificación de citas. Se basa en el modelo Qwen3.5-4B, que combina atención lineal híbrida con capas Mamba, y ha sido destilado a partir de dos modelos de gran tamaño: Moonshot Kimi-k3 y Nvidia Nemotron-70B. El entrenamiento se realizó en el supercomputador LUMI-G (8× AMD Instinct MI250X) mediante un pipeline de destilación con filtrado NLI y verificación de citas, sobre un dataset de 34.200 trayectorias de investigación.

El modelo está pensado para integrarse en arquitecturas compuestas de IA (compound AI), actuando como experto en síntesis de documentos y análisis de trade-offs técnicos. Su principal valor reside en la reducción drástica de alucinaciones (del 16,8 % al 2,4 %) y en la mejora de la precisión de citas (del 62,1 % al 96,8 %) respecto al modelo base, lo que lo hace adecuado para entornos donde la trazabilidad de la información es crítica. Publicado bajo licencia Apache 2.0, está disponible en formatos safetensors y GGUF (Q4_K_M y Q8_0), lo que facilita su despliegue en distintos entornos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: atención lineal + Mamba (base Qwen3.5-4B) |
| Parametros totales | 4.205.751.296 (4,2 B) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF Q4_K_M, Q8_0 |
| Idiomas soportados | inglés, alemán |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura Qwen3.5-4B, que combina mecanismos de atención lineal con bloques Mamba, logrando una mayor eficiencia en contexto largo en comparación con transformers densos tradicionales. Sobre esta base se aplicó un proceso de destilación (distillation) desde dos profesores: Moonshot Kimi-k3 y Nvidia Nemotron-70B. El dataset de entrenamiento, `moe-sovereign/expert-research-sft`, contiene 34.200 trayectorias de síntesis de investigación y análisis de documentos, filtradas mediante verificación de implicación textual (NLI) y validación de citas para garantizar la calidad de las fuentes.

El entrenamiento se realizó con LoRA (r=16, alpha=32, dropout 0,05) sobre las proyecciones q, k, v, o, gate, up y down, durante 3 épocas con un batch efectivo de 128, learning rate 1,5×10⁻⁵ con decaimiento coseno y warmup. Se empleó DeepSpeed ZeRO-2 sobre ROCm 7.0 y PyTorch 2.6 en 8 GPUs MI250X. La pérdida final fue de 0,0072 y la precisión de token alcanzó el 99,84 %. Posteriormente, los adaptadores LoRA se fusionaron con el modelo base en BF16 y se exportaron a GGUF en cuantizaciones Q4_K_M y Q8_0.

## Capacidades

- Síntesis de evidencia multi-documento: compila y compara información procedente de varios documentos, extrayendo métricas empíricas y conclusiones sin introducir afirmaciones no respaldadas.
- Generación de citas restringidas: produce referencias y atribuciones factuales ancladas exclusivamente a fragmentos concretos del contexto, usando etiquetas como `[Doc ID: Section]`.
- Evaluación de trade-offs de ingeniería: construye matrices de análisis multidimensional (latencia frente a throughput, consistencia frente a disponibilidad, memoria frente a cómputo) con valores cuantitativos.
- Revisión de estado del arte: resume evoluciones arquitectónicas en sistemas distribuidos, IA y ciencias de la computación.
- Extracción sistemática de métricas de benchmarks: identifica dataset, tamaño de muestra, intervalos de confianza y hardware utilizado en papers técnicos.
- Análisis comparativo de documentos: estructura diferencias y similitudes entre fuentes de forma jerárquica y coherente.
- Generación de informes técnicos con formato estructurado: produce salidas en matrices y tablas con alta fidelidad de formato (98 % en pruebas).

## Casos de uso

- Revisión sistemática de literatura: el modelo puede procesar decenas de papers y generar un resumen comparativo con citas verificables, reduciendo el tiempo de revisión manual en investigación académica o industrial.
- Verificación de referencias en publicaciones: antes de enviar un artículo, se puede usar para comprobar que cada afirmación está respaldada por una fuente concreta, minimizando el riesgo de citas inventadas.
- Análisis de trade-offs en diseño de sistemas: un ingeniero de plataformas puede pedir al modelo que compare alternativas de arquitectura (por ejemplo, consistencia frente a disponibilidad) y obtener una matriz cuantitativa con límites de complejidad y memoria.
- Generación de informes técnicos internos: el modelo produce documentos estructurados con secciones jerárquicas y tablas de métricas, listos para integrarse en wikis o documentación de proyectos.
- Extracción de métricas de benchmarks para bases de conocimiento: se puede usar para poblar automáticamente una base de datos con resultados de modelos (precisión, latencia, hardware) a partir de papers, con trazabilidad a la fuente.
- Asistente de investigación para tesis o patentes: dado un conjunto de documentos previos, el modelo sintetiza el estado del arte y destaca las contribuciones novedosas, citando cada afirmación.

## Benchmarks y rendimiento

La model card reporta una evaluación sobre un conjunto de validación de 1.000 tareas de síntesis multi-documento, sin contaminación con el entrenamiento, comparando el modelo destilado con el base Qwen3.5-4B:

| Metrica | Qwen3.5-4B base | moe-expert-research-4b | Delta |
|---|---|---|---|
| Precision de citas (procedencia valida) | 62,1 % | 96,8 % | +34,7 % |
| Entailment claim-evidencia (NLI) | 69,4 % | 95,1 % | +25,7 % |
| Ratio de hechos alucinados | 16,8 % | 2,4 % | -14,4 % |
| Completitud de trade-offs multi-fuente | 58,0 % | 91,4 % | +33,4 % |
| Fidelidad de formato de matrices | 74,2 % | 98,0 % | +23,8 % |
| Recuperacion de spans en contexto largo | 63,5 % | 93,2 % | +29,7 % |

*Nota: evaluado a temperatura 0,15 con 3 semillas independientes. La precision de citas mide el porcentaje de citas generadas que apuntan correctamente a evidencia de soporte en el texto fuente.*

No se han publicado resultados en benchmarks generales como MMLU, HumanEval o GSM8K en la informacion disponible.

## Requisitos de hardware

- Inferencia en CPU: el modelo en GGUF Q4_K_M ocupa aproximadamente 2,5 GB, por lo que puede ejecutarse en equipos con 8-16 GB de RAM mediante llama.cpp o Ollama, con latencia de varios segundos por token según el hardware.
- GPU consumer: cabe en GPUs con 6 GB de VRAM o más (p. ej., RTX 3060, RTX 4060) usando cuantizacion Q4_K_M. Con Q8_0 (unos 4,5 GB) se recomienda al menos 8 GB de VRAM.
- GPU profesional: para inferencia de alto rendimiento se recomienda una A100 40 GB o H100, aunque no son necesarias dado el tamaño del modelo.
- Despliegue optimizado: compatible con vLLM, TGI y llama.cpp para servir el modelo con batching dinámico y alta concurrencia.
- Throughput estimado: sin datos publicados, pero por su tamaño (4B) en una A100 se pueden esperar decenas de miles de tokens por segundo con vLLM en modo batch.

## Comparativa con modelos similares

No se dispone de benchmarks comparativos frente a otros modelos de tamaño similar en las tareas específicas de síntesis de evidencia. Como referencia de specs:

| Modelo | Parametros | Contexto | Licencia | Especializacion |
|---|---|---|---|---|
| moe-expert-research-4b | 4,2 B | no disponible | Apache 2.0 | Sintesis de evidencia, citas |
| Qwen3-4B | 4 B | 32K (tipico) | Apache 2.0 | Generico |
| Llama-3.2-3B | 3,2 B | 128K | Llama 3.2 | Generico |
| Gemma-2-2B | 2,6 B | 8K | Gemma | Generico |

La comparativa directa de rendimiento en tareas de investigación no está disponible, pero el modelo destilado supera claramente a su base en las métricas reportadas.

## Limitaciones y advertencias

- Limitado a inglés y alemán; no soporta otros idiomas de forma nativa.
- La longitud de contexto no está documentada; se recomienda validar el comportamiento con ventanas superiores a 32K tokens antes de usarlo en producción.
- Aunque la tasa de alucinación se reduce al 2,4 %, no es cero; es necesario un proceso de verificación humana para aplicaciones críticas.
- El entrenamiento se centró en dominios técnicos (informática, sistemas, IA); su rendimiento en otros campos (medicina, derecho, humanidades) puede ser inferior.
- No se han publicado resultados en benchmarks generales de razonamiento o código; su especialización puede limitar su utilidad fuera del ámbito de investigación documental.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen3.5-4B puede tener restricciones adicionales; se recomienda revisar la licencia del modelo base.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/h3rb3rn/moe-expert-research-4b
- Dataset de entrenamiento: https://huggingface.co/datasets/moe-sovereign/expert-research-sft
- Modelo base Qwen3.5-4B: https://huggingface.co/Qwen/Qwen3.5-4B
- Supercomputador LUMI-G: https://www.lumi-supercomputer.eu/
