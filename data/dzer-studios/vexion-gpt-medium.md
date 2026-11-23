# DZER-Studios/Vexion-gpt-medium

## Resumen

Vexion-gpt-medium es un modelo de lenguaje denso de 345.303.040 parámetros desarrollado por DZER-Studios, entrenado desde cero en PyTorch puro sin depender de frameworks de terceros como `transformers`. El modelo forma parte de una familia (Vexion-GPT) que incluye versiones de 117M, 345M y 1.3B parámetros, y está especializado en el idioma ruso, usando el corpus CulturaX como único dataset de preentrenamiento.

La arquitectura es un transformer causal clásico (sin MoE ni RoPE en su versión original, aunque el autor menciona el desarrollo de una variante con YaRN para contextos extendidos) con atención causal estándar y activaciones GELU/SiLU. El modelo fue entrenado sobre 39.000 millones de tokens durante 570 horas en una única RTX 3060 Ti de 8 GB (o RTX 4060 Ti de 16 GB), lo que lo convierte en un ejemplo de entrenamiento de bajo presupuesto orientado a la comprensión profunda de la arquitectura transformer.

Su relevancia actual es limitada pero instructiva: se trata de un modelo de investigación/educativo, no de un modelo de producción. La advertencia clave es que **no es compatible con la API estándar de Hugging Face `transformers`** (no se puede cargar con `AutoModelForCausalLM`), y requiere los scripts propios del repositorio (`model.py`, `generate.py`, `generation.py`) para inferencia y reentrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal denso (GPT clásico), atención causal estándar, activaciones GELU/SiLU, sin MoE ni RoPE en la versión base |
| Parametros totales | 345.303.040 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1024 tokens en la versión base; el autor menciona contexto original de 3072–4096 y ~12288 con YaRN en la variante actualizada |
| Tipos de cuantizacion | no disponible (solo se publican pesos en safetensors; no se documentan GGUF ni cuantizaciones oficiales) |
| Idiomas soportados | ruso (`ru`) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (con `custom_code`; requiere scripts propios, no `transformers`) |

## Arquitectura y entrenamiento

El modelo implementa un transformer causal denso escrito en PyTorch puro, con atención causal clásica y funciones de activación GELU/SiLU. No emplea Mezcla de Expertos (MoE) ni codificaciones posicionales rotatorias (RoPE) en su versión base; el autor indica que una variante posterior incorpora YaRN para extender el contexto. La configuración está desacoplada del código mediante `config.json` compatible con los campos estándar de Hugging Face (`hidden_size`, `num_hidden_layers`, etc.), aunque la carga debe hacerse con los scripts propios del repositorio.

El entrenamiento se realizó sobre 39.000 millones de tokens del corpus CulturaX (ruso), durante 570 horas, en una única GPU RTX 3060 Ti de 8 GB o RTX 4060 Ti de 16 GB. Se usó el optimizador Adaw con acumulación de gradientes (batch_size 12 / accumulate_steps 8 a contexto 256; batch_size 8 / accumulate_steps 32 a contexto 1024) y un vocabulario de 40.960 tokens. El autor reporta un train_loss de 2,58 y un val_loss de 2,53 tras 382.500 pasos. El DataLoader se reescribió para transmitir datos binarios (`.bin`) evitando el recolector de basura de Python, y se integraron kernels fusionados de Flash Attention para reducir el consumo de VRAM.

## Capacidades

- Generación de texto en ruso: el modelo está entrenado exclusivamente con el corpus CulturaX en ruso, por lo que su competencia lingüística se limita a ese idioma.
- Razonamiento básico y continuación de texto: al ser un modelo base (no instruido), no está alineado para seguir instrucciones ni para conversación.
- No dispone de tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso de forma nativa.
- No tiene capacidades de visión, audio ni modo "thinking".
- Capacidades multilingües: únicamente ruso; no se documenta soporte para otros idiomas.
- Compatibilidad de inferencia restringida a los scripts propios del repositorio; no funciona con `AutoModelForCausalLM`.

## Casos de uso

- Investigación educativa sobre arquitecturas transformer: el modelo sirve para estudiar el efecto de decisiones de diseño (sin RoPE, sin MoE, con Adaw) en el entrenamiento y la pérdida, dado que el autor publica curvas de entrenamiento y scripts completos.
- Reproducción de pipelines de preentrenamiento de bajo presupuesto: permite replicar el flujo de entrenamiento en una sola GPU consumer (RTX 3060 Ti / 4060 Ti) con el DataLoader binario incluido, útil para laboratorios con recursos limitados.
- Generación de texto en ruso para tareas de continuación: dado su entrenamiento en CulturaX, puede emplearse para completar fragmentos de texto en ruso en entornos controlados donde no se requiera alineación.
- Estudio de extensiones de contexto con YaRN: el repositorio incluye la variante con YaRN, lo que permite experimentar con contextos de 8192 a 16384 tokens en hardware limitado (el autor indica ~3,5 GB de VRAM en checkpoint completo).
- Base para fine-tuning específico en ruso: al ser un modelo base con licencia Apache 2.0, puede servir como punto de partida para ajuste supervisado en dominios concretos, siempre que se use el código propio del repositorio.
- Docencia sobre atención fusionada y optimización de memoria: la integración de Flash Attention y el DataLoader personalizado son ejemplos prácticos para enseñar técnicas de eficiencia en entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor únicamente reporta métricas de entrenamiento: train_loss 2,58, val_loss 2,53, 382.500 pasos totales, vocabulario de 40.960 tokens y 39.000 millones de tokens de preentrenamiento.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3,5 GB en checkpoint completo según el autor (modelo de 345M parámetros).
- GPU recomendadas: RTX 3060 Ti (8 GB) o RTX 4060 Ti (16 GB) para entrenamiento; para inferencia basta con GPUs consumer de gama media con al menos 4 GB de VRAM.
- Cabe en GPU consumer: sí, en cualquier GPU con 4 GB o más de VRAM.
- Opciones de despliegue: no es compatible con vLLM, llama.cpp, Ollama ni TGI de forma estándar; requiere los scripts propios `model.py`, `generate.py` y `generation.py` del repositorio.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Compatibilidad HF | Idiomas |
|---|---|---|---|---|---|
| Vexion-gpt-medium | 345M | 1024 (hasta ~12288 con YaRN) | Apache 2.0 | No (custom code) | Ruso |
| GPT-2 medium | 355M | 1024 | MIT | Sí (`transformers`) | Inglés |
| RuGPT-3 small | 125M | 2048 | Apache 2.0 (según variante) | Sí (`transformers`) | Ruso |
| TinyLlama-1.1B | 1.1B | 2048 | Apache 2.0 | Sí (`transformers`) | Inglés/multilingüe |

La comparativa es orientativa: Vexion-gpt-medium se distingue por su arquitectura custom no compatible con el ecosistema estándar, mientras que las alternativas citadas son cargables con `transformers` y cuentan con ecosistema de herramientas. No se dispone de benchmarks comparativos publicados para Vexion-gpt-medium.

## Limitaciones y advertencias

- Modelo base sin alineación: no está instruido ni ajustado con RLHF/DPO, por lo que no sigue instrucciones ni mantiene conversaciones de forma fiable.
- Riesgo de alucinación: el autor advierte que el modelo puede olvidar el centro del diálogo y aumentar las alucinaciones al extender el contexto con YaRN.
- Limitación idiomática: entrenado exclusivamente en ruso; no se recomienda su uso en otros idiomas.
- Incompatibilidad con `transformers`: no se puede cargar con `AutoModelForCausalLM`; requiere los scripts propios, lo que complica su integración en pipelines estándar de producción.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero la falta de benchmarks y de alineación hace desaconsejable su uso en producción sin evaluación previa.
- Contexto limitado: 1024 tokens en la versión base; la extensión con YaRN degrada la calidad según el propio autor.
- Sin datos de sesgos: no se documentan evaluaciones de sesgo ni de seguridad.

## Enlaces

- Hugging Face: https://huggingface.co/DZER-Studios/Vexion-gpt-medium
- Dataset CulturaX: https://huggingface.co/datasets/uonlp/CulturaX
- No se han encontrado otros enlaces (papers, blogs, repos, demos) en la información disponible.
