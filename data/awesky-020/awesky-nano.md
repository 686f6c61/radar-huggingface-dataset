# awesky-020/Awesky-Nano

## Resumen

Awesky-Nano es un ajuste fino (fine-tune) del modelo Qwen/Qwen2.5-7B-Instruct publicado por el usuario awesky-020, identificado en la model card como K. M. Sunbir Islam. El objetivo declarado es corregir problemas de sobreajuste observados en fine-tunes previos sobre modelos de 1B/2B parámetros (repetición del nombre del creador ante cualquier consulta, errores aritméticos) y ofrecer un asistente conversacional fluido en bengalí (bn) e inglés (en), con especial atención a identidad consistente, código y matemáticas.

El modelo se distribuye principalmente como un archivo GGUF cuantizado en Q4_K_M de aproximadamente 4,36 GB, pensado para ejecución local en escritorio mediante Ollama, LM Studio o Jan, además de scripts de chat en terminal y cuadernos de reentrenamiento QLoRA 4-bit para Kaggle/Colab. La licencia es Apache 2.0, heredada del modelo base, lo que permite uso comercial sin restricciones adicionales más allá de las del propio Qwen2.5.

Se trata de un modelo denso de 7,61 mil millones de parámetros (los del base) con una longitud de contexto nominal de 131.072 tokens, aunque el ajuste fino no documenta benchmarks propios ni métricas de rendimiento. En el momento de recopilar los datos, el repositorio registra 0 descargas y 0 "likes", por lo que es un artefacto muy reciente y de difusión prácticamente nula.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con RoPE, SwiGLU, RMSNorm y GQA (heredada de Qwen2.5-7B-Instruct) |
| Parámetros totales | 7,61 mil millones (modelo base Qwen2.5-7B-Instruct; no desglosado en la model card del fine-tune) |
| Parámetros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 131.072 tokens (128K) según el modelo base; no confirmado para el fine-tune en la información disponible |
| Tipos de cuantización | Q4_K_M (4-bit Medium, ~4,36 GB) documentado; otras cuantizaciones no disponibles |
| Idiomas soportados | bengalí (bn) e inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (Q4_K_M) y adaptador QLoRA (según la model card); safetensors no confirmado |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-7B-Instruct: un transformer decoder-only de 28 capas, con 28 cabezas de atención de consulta y 4 cabezas de clave/valor (GQA), dimensión oculta de 3584 y un vocabulario de aproximadamente 152.000 tokens. El modelo base fue entrenado por Alibaba Qwen sobre del orden de 18 billones de tokens y posteriormente alineado mediante instrucciones, con soporte nativo de contexto largo de hasta 131.072 tokens y generación de hasta 8192 tokens.

El fine-tune Awesky-Nano se realizó, según la propia model card, con QLoRA de 4 bits sobre GPU T4 x2 en Kaggle, con un tiempo de entrenamiento declarado de unos 15 minutos, sobre el dataset `awesky_nano_dataset.jsonl`, descrito como un conjunto bilingüe bengalí-inglés de "alta calidad". No se especifican el número de tokens de entrenamiento, la composición exacta del dataset, el rango LoRA, la tasa de aprendizaje ni si hubo etapas adicionales de RLHF o DPO. Tampoco se documenta ninguna innovación arquitectónica propia: el ajuste se limita a los pesos mediante adaptadores LoRA, y el artefacto publicado parece combinar dichos adaptadores con una versión cuantizada en GGUF.

## Capacidades

- Generación de texto conversacional multi-turno en bengalí e inglés, con gramática cuidada según el autor.
- Razonamiento aritmético básico y resolución de operaciones directas (por ejemplo, `1+1`, `50+1151`), una de las correcciones declaradas frente a fine-tunes previos.
- Generación y explicación de código, así como resolución de problemas algorítmicos, heredado del modelo base.
- Conocimiento general y científico procedente de Qwen2.5-7B-Instruct.
- Gestión de identidad: responde con el nombre del creador (K. M. Sunbir Islam) cuando se le pregunta quién lo ha desarrollado.
- Chat con streaming en tiempo real mediante script de terminal, con comandos `exit` para salir y `clear` para reiniciar memoria.
- Integración con Ollama (mediante `Modelfile`), LM Studio y Jan, usando plantilla de prompt ChatML.
- Soporte de tool calling / function calling: no documentado para este fine-tune (el modelo base sí lo soporta).
- Capacidades de agente y razonamiento multi-paso: no documentadas.
- Capacidades de visión o audio: no disponibles (el base es exclusivamente de texto).

## Casos de uso

- Asistente conversacional en bengalí para atención al usuario: el modelo responde de forma fluida en bn, lo que permite desplegar chatbots locales en regiones bangladeshíes sin depender de APIs externas.
- Soporte bilingüe bn/en en escritorio: gracias al archivo GGUF Q4_K_M (~4,36 GB), puede ejecutarse en portátiles con GPU modesta mediante Ollama o LM Studio.
- Tutor educativo de matemáticas elementales: las correcciones declaradas sobre errores aritméticos lo hacen apto para resolver operaciones y explicar pasos en entornos de estudio.
- Asistencia a la programación en local: hereda la capacidad de generación de código de Qwen2.5-7B-Instruct, útil como copiloto offline en entornos con datos sensibles que no pueden salir a la nube.
- Traducción y redacción bengalí-inglés: puede emplearse para reescribir, resumir o traducir textos entre ambos idiomas en flujos editoriales.
- Prototipado de agentes conversacionales con identidad personalizada: el ajuste permite fijar una identidad concreta (nombre del creador, tono, idioma), útil en demos y pruebas de concepto.
- Base para reentrenamiento ligero: la model card incluye cuadernos de QLoRA para Kaggle/Colab, de modo que el modelo puede usarse como punto de partida para nuevos ajustes en 15 minutos sobre GPU T4 x2.
- Despliegue en entornos sin conexión: la combinación de Ollama/LM Studio con GGUF permite uso completamente offline en equipos de sobremesa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

A modo de referencia externa, el modelo base Qwen2.5-7B-Instruct declara en su propia ficha pública los siguientes resultados, que no deben atribuirse al fine-tune Awesky-Nano:

| Benchmark | Qwen2.5-7B-Instruct (modelo base) |
|---|---|
| MMLU | 74,2 |
| MMLU-Pro | 56,3 |
| HumanEval | 84,8 |
| GSM8K | 91,6 |
| MATH | 75,5 |

Estos valores corresponden únicamente al modelo base publicado por Alibaba Qwen y no miden el efecto del ajuste fino realizado por awesky-020.

## Requisitos de hardware

- Inferencia en Q4_K_M (GGUF): los pesos ocupan aproximadamente 4,36 GB; con una ventana de contexto moderada (8K) el uso total de VRAM se estima en 6-7 GB.
- Inferencia en cuantizaciones de mayor precisión (Q8_0): en torno a 8 GB de VRAM, estimación no documentada por el autor.
- Inferencia en fp16/bf16: los pesos suponen unos 15,3 GB, a los que hay que sumar la caché KV; se recomienda un mínimo de 18-20 GB de VRAM.
- Caché KV: con GQA (4 cabezas KV, head_dim 128, 28 capas) el coste estimado es de unos 56 KB por token en fp16, es decir, aproximadamente 1,8 GB para 32K tokens y 7,2 GB para la ventana completa de 128K.
- GPU de consumo compatibles: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080 y RTX 4090 pueden ejecutar la versión Q4_K_M con holgura; una GPU de 8 GB es suficiente para contextos cortos.
- GPU de datacenter: A100, H100 o L40S para servir fp16 con contexto largo o múltiples usuarios concurrentes.
- Opciones de despliegue: Ollama (`ollama create Awesky-Nano -f Modelfile`), LM Studio, Jan y llama.cpp con el archivo GGUF; vLLM y TGI serían viables solo si se dispone de pesos en safetensors, no confirmados.
- Latencia y throughput: no disponibles (el autor no publica tokens por segundo ni métricas de latencia).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Awesky-Nano | 7,61B (base) | 128K (heredado) | Apache 2.0 | GGUF Q4_K_M, uso local |
| Qwen2.5-7B-Instruct | 7,61B | 128K | Apache 2.0 | Safetensors, amplia integración |
| Llama-3.1-8B-Instruct | 8,03B | 128K | Llama 3.1 Community License | Safetensors, GGUF, vLLM |
| Mistral-7B-Instruct-v0.3 | 7,25B | 32K | Apache 2.0 | Safetensors, GGUF, vLLM |

Frente a estos modelos, Awesky-Nano aporta un ajuste específico para bengalí e inglés y un empaquetado GGUF listo para escritorio, pero carece del soporte de herramientas, la documentación de entrenamiento y la infraestructura de publicación de los modelos citados. Los datos de parámetros, contexto y licencia de los modelos comparados proceden de sus fichas públicas; no se dispone de una comparación de rendimiento directa entre Awesky-Nano y estas alternativas.

## Limitaciones y advertencias

- No se han publicado benchmarks propios: no hay evidencia cuantitativa de que el fine-tune mejore al modelo base en tareas distintas de la identidad y la aritmética declaradas.
- Riesgo de sobreajuste residual: la model card reconoce que el problema original de fine-tunes previos (repetición del nombre ante cualquier consulta) se corrige aquí, pero no aporta métricas objetivas que lo confirmen.
- Sesgos: no se documenta ninguna evaluación de sesgos ni de toxicidad; al heredar el corpus de Qwen2.5, puede reproducir sesgos presentes en el modelo base.
- Alucinación: el modelo base Qwen2.5-7B-Instruct presenta una tasa de alucinación no despreciable en dominios especializados; el fine-tune no la mitiga de forma documentada.
- Contexto e idioma: aunque el modelo base soporta 128K tokens, el fine-tune se entrenó con un dataset bilingüe bn/en de tamaño no especificado, por lo que el rendimiento con contextos largos o en idiomas distintos del bengalí y el inglés no está garantizado.
- Dataset opaco: no se publican el número de ejemplos, la fuente ni la composición del `awesky_nano_dataset.jsonl`, lo que dificulta evaluar la procedencia de los datos de entrenamiento.
- Licencia: Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre el contenido del ajuste (por ejemplo, posibles datos personales incluidos en el dataset de entrenamiento).
- Madurez del artefacto: 0 descargas y 0 "likes" en el momento del análisis, sin issues ni validación externa; la model card incluye rutas locales (`C:\Users\SUNPC\...`) que sugieren un flujo de trabajo personal más que un proyecto mantenido.
- Formatos: no se confirma la publicación de pesos en safetensors, lo que limita el uso con vLLM o TGI y obliga a depender de GGUF y Ollama/LM Studio.
- Estado de nombres: la model card indica que el adaptador se publica en `awesky-020/Awesky-Nano`, pero no aclara si el GGUF del repositorio contiene los pesos fusionados con el LoRA o solo el adaptador, ambigüedad relevante para producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/awesky-020/Awesky-Nano
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Repositorio relacionado del mismo autor: https://huggingface.co/awesky-020/Awesky-Nano-48L
- Ficha en free2aitools: https://free2aitools.com/model/awesky-020/awesky-nano-48l
- Perfil del autor en savrn.com: https://savrn.com/model-publishers/awesky-020
- Ficha de Awesky-Pro-48L en savrn.com: https://savrn.com/models/awesky-pro-48l
