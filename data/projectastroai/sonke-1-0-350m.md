# ProjectAstroAI/Sonke-1.0-350M

## Resumen

Sönke-1.0-350M es un modelo de lenguaje de tipo decoder-only desarrollado por ProjectAstroAI, un autor individual que lo entrena desde cero en su propia GPU. Con 348.743.986 parámetros (aproximadamente 350M), se posiciona en la categoría de modelos pequeños orientados a generación de texto conversacional, matemáticas básicas y fragmentos cortos de código. Incluye un modo de razonamiento previo ("thinking") que puede activarse o desactivarse en el chat template.

El modelo se distribuye bajo licencia Apache 2.0, soporta únicamente inglés y emplea una arquitectura propia que requiere `trust_remote_code=True` para cargarse con Transformers. El checkpoint publicado corresponde al paso 58.666 de entrenamiento (22.800 millones de tokens procesados), por lo que el autor lo describe explícitamente como un modelo en curso, no finalizado.

Su relevancia es limitada en términos de rendimiento: no se han publicado resultados de benchmarks propios y el autor advierte que no debe usarse para nada crítico. Su interés principal es documental y experimental, como ejemplo de entrenamiento from scratch de un modelo pequeño con datos mayoritariamente sintéticos y de alta calidad (Nemotron, UltraData, FineWeb-Edu), y como banco de pruebas para arquitecturas personalizadas en el ecosistema Transformers.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con arquitectura propia (requiere `trust_remote_code=True`); detalles internos no disponibles |
| Parametros totales | 348.743.986 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos publicados en safetensors; sin GGUF oficial) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache 2.0, con restricciones adicionales por datos generados con modelos DeepSeek (LICENSE-DEEPSEEK-MODEL, párrafo 5 y Anexo A) |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only de diseño propio del autor, sin que la model card detalle número de capas, dimensión oculta, cabezas de atención ni tipo de atención (estándar, GQA, lineal, etc.). El uso obligatorio de `trust_remote_code=True` implica que la implementación no está integrada en el núcleo de Transformers y se carga mediante código remoto del repositorio. El modelo incorpora un modo de "thinking" controlable mediante el parámetro `enable_thinking` del chat template, lo que sugiere un entrenamiento orientado a cadenas de razonamiento explícitas antes de la respuesta final.

El entrenamiento se ha realizado desde cero sobre 22.800 millones de tokens (paso 58.666), una cifra modesta para un modelo de este tamaño pero coherente con un proyecto individual. La mezcla de datos combina corpus web filtrados por calidad educativa (FinePDFs-Edu, DCLM, FineWeb-Edu, Ultra-FineWeb-L3), Wikipedia, datos de código y matemáticas (UltraData-Code, UltraData-Math, Code-Reasoning, Math-Reasoning), datos de comportamiento e instrucciones (TxT360-v2, Pretrain-Behaviors) y una parte importante de datos sintéticos de NVIDIA (Nemotron-Pretraining-Specialized, Nemotron-SFT-Competitive-Programming, Nemotron-SFT-Math, Nemotron-SFT-Science, Nemotron-SFT-Instruction-Following-Chat, Nemotron-Cascade-2-SFT-Data). No se especifica si hubo RLHF o DPO, ni la proporción exacta de cada fuente.

## Capacidades

- Generación de texto conversacional en inglés con soporte de chat template multi-turno.
- Razonamiento previo opcional ("thinking mode") activable o desactivable mediante `enable_thinking`.
- Matemáticas básicas, según declara el autor.
- Generación de fragmentos cortos de código, con entrenamiento específico en datos de programación competitiva y razonamiento de código.
- Instrucciones generales, gracias a los conjuntos SFT de NVIDIA incluidos en el entrenamiento.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible de forma nativa más allá del modo thinking.
- Capacidades multilingües: limitadas al inglés.
- Visión, audio u otras modalidades: no soportadas.

## Casos de uso

- Experimentación académica con arquitecturas personalizadas: el modelo sirve como referencia para estudiar cómo se implementa un transformer propio cargable vía `trust_remote_code` en Transformers, útil en cursos y trabajos de investigación sobre entrenamiento from scratch.
- Prototipado de chatbots de dominio acotado en inglés: para demos internas donde la latencia y el coste importan más que la precisión factual, un modelo de 350M puede desplegarse en CPU o GPU modesta.
- Generación de texto corto y plantillas: redacción de descripciones breves, respuestas a preguntas simples o textos de relleno en pipelines de datos, aceptando revisión humana posterior.
- Ejercicios educativos de matemáticas elementales: el modelo puede producir pasos intermedios con el modo thinking activado, útil como generador de borradores en entornos de aprendizaje supervisado.
- Autocompletado de código en snippets pequeños: para entornos de desarrollo con requisitos de privacidad y recursos limitados, donde no se puede llamar a una API externa.
- Benchmark de infraestructura: al ser un modelo pequeño con código remoto, resulta útil para validar pipelines de despliegue (carga, tokenización, generación por lotes) antes de escalar a modelos mayores.
- Filtrado o clasificación ligera de texto en inglés: con ajuste fino adicional, puede adaptarse a tareas de etiquetado simple en flujos de datos.

## Benchmarks y rendimiento

La model card incluye una tabla de evaluación en la que la fila del propio Sönke-1.0-350M aparece con guiones, es decir, sin resultados publicados. Las cifras de los modelos comparables se reproducen a continuación tal como las presenta el autor, con la advertencia de que los shot counts no son homogéneos entre fuentes.

| Modelo | MMLU | HellaSwag | ARC-C | GSM8K | HumanEval |
|---|---|---|---|---|---|
| Sönke-1.0-350M | – | – | – | – | – |
| SmolLM2-360M | 25.0 | 54.5 | 38.4 | 3.2 | 12.2 |
| Qwen2.5-0.5B | 47.5 | 52.1 | 35.6 | 41.6 | 30.5 |
| Qwen2.5-1.5B | 60.9 | 67.9 | 54.7 | 68.5 | 37.2 |

Metodología declarada: MMLU 5-shot, HellaSwag y ARC-C 0-shot, GSM8K 0-shot sin thinking y HumanEval pass@1. Para SmolLM2, MMLU, ARC-C y HumanEval se ejecutaron con la misma metodología; el resto de cifras provienen de las model cards originales.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 0,7 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, entre 1,5 y 2,5 GB según longitud de secuencia y tamaño de lote.
- VRAM estimada en fp32: alrededor de 1,4 GB solo para pesos.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; RTX 3060, RTX 4060, RTX 4090, A100 y H100 son sobradamente suficientes.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU discreta moderna e incluso en iGPU con memoria compartida suficiente.
- Despliegue: Transformers con `trust_remote_code=True` es la vía documentada. No hay confirmación de soporte en vLLM, llama.cpp, Ollama o TGI, y la arquitectura personalizada probablemente requiera portar el código antes de usarlos.
- Limitación operativa: los lotes requieren prompts de la misma longitud, según indica el autor, lo que complica el serving con batching dinámico.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | MMLU | GSM8K | HumanEval | Disponibilidad |
|---|---|---|---|---|---|---|---|
| Sönke-1.0-350M | 348,7M | No disponible | Apache 2.0 + restricciones DeepSeek | No publicado | No publicado | No publicado | Hugging Face, requiere `trust_remote_code` |
| SmolLM2-360M | 362M | 8.192 tokens (según su card) | Apache 2.0 | 25.0 | 3.2 | 12.2 | Hugging Face, integrado en Transformers |
| Qwen2.5-0.5B | 494M | 32.768 tokens | Apache 2.0 | 47.5 | 41.6 | 30.5 | Hugging Face, integrado en Transformers |
| Qwen2.5-1.5B | 1.540M | 32.768 tokens | Apache 2.0 | 60.9 | 68.5 | 37.2 | Hugging Face, integrado en Transformers |

La comparación es desfavorable para Sönke en madurez de ecosistema: los tres alternativos están integrados en Transformers sin código remoto, tienen contexto documentado y publican benchmarks. Sönke no ofrece cifras propias y depende de una implementación personalizada.

## Limitaciones y advertencias

- Modelo en entrenamiento activo: el checkpoint corresponde al paso 58.666 y el autor advierte que nuevas versiones se subirán a medida que avance el entrenamiento, por lo que el comportamiento puede cambiar entre revisiones.
- Alucinación: el autor reconoce explícitamente que el modelo comete errores factuales ("gets facts wrong").
- Contexto largo: pierde el hilo en conversaciones largas, según la propia model card; la longitud de contexto no está documentada.
- Formato: puede fallar en el formato de salida ("sometimes messes up formatting").
- Uso en producción: el autor desaconseja su uso para cualquier tarea crítica ("Don't use it for anything that matters").
- Idioma: solo inglés; no hay soporte multilingüe declarado.
- Licencia: Apache 2.0 con restricciones adicionales derivadas del uso de datos generados por modelos DeepSeek (LICENSE-DEEPSEEK-MODEL, párrafo 5 y Anexo A). Es necesario revisar esas cláusulas antes de un uso comercial.
- Dependencia de código remoto: `trust_remote_code=True` implica ejecutar código del autor; conviene auditar el repositorio antes de usarlo en entornos sensibles.
- Batching: requiere prompts de igual longitud, lo que limita el despliegue con servidores de inferencia estándar.
- Sin benchmarks propios publicados: no es posible evaluar su rendimiento real frente a alternativas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ProjectAstroAI/Sonke-1.0-350M
- Licencia DeepSeek referenciada: LICENSE-DEEPSEEK-MODEL (incluida en el repositorio del modelo)
- Créditos de datasets: NOTICE (incluido en el repositorio del modelo)
- SmolLM2-360M (comparativa): https://huggingface.co/HuggingFaceTB/SmolLM2-360M
- Qwen2.5-0.5B (comparativa): https://huggingface.co/Qwen/Qwen2.5-0.5B
- Qwen2.5-1.5B (comparativa): https://huggingface.co/Qwen/Qwen2.5-1.5B
