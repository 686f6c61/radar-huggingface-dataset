# prithivMLmods/XHToken-Spark-X2.6-1.7B-GGUF

## Resumen

XHToken-Spark-X2.6-1.7B-GGUF es una cuantización en formato GGUF del modelo Spark-X2.6-1.7B, un modelo de lenguaje open-weight de 1.700 millones de parámetros desarrollado por el equipo SparkLLM y publicado bajo licencia Apache-2.0. Está diseñado para despliegue eficiente en dispositivos locales (edge y on-device) y cubre cargas de trabajo en inglés, chino y tareas multilingües.

El modelo se construye sobre Spark-X2.6-1.7B-Base y conserva la arquitectura `sparkx2_5` de Spark-X2.5-1.7B, incorporando un pipeline de post-entrenamiento mejorado orientado a programación, ingeniería de software, matemáticas, conocimiento general, uso complejo de herramientas, planificación de agentes y razonamiento con contexto largo. Una de sus características más destacables es la ventana de contexto de hasta 1.048.576 tokens, con hasta 131.072 tokens de salida, algo inusual en modelos de este tamaño.

El razonamiento en cadena (chain-of-thought) está activado por defecto y ofrece niveles de thinking configurables (`none`, `low` y `high`) para equilibrar calidad, latencia y coste. Esta ficha cubre la versión GGUF publicada por prithivMLmods, con cuantizaciones desde Q3_K_L (1,02 GB) hasta BF16 (3,42 GB), lo que permite ejecutarlo incluso en portátiles sin GPU dedicada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `sparkx2_5` (tipo llama, basada en Spark-X2.5-1.7B) |
| Parametros totales | 1.707.657.216 (~1,7B) |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | hasta 1.048.576 tokens (131.072 tokens de salida) |
| Tipos de cuantizacion | BF16, Q3_K_L, Q3_K_M, Q4_K_M, Q4_K_S, Q5_K_M, Q5_K_S, Q6_K, Q8_0 |
| Idiomas soportados | ingles, chino (con capacidades multilingues declaradas) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (modelo base en safetensors/transformers) |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura `sparkx2_5`, heredada de Spark-X2.5-1.7B, y está etiquetado como tipo `llama` en Hugging Face, por lo que es compatible con el ecosistema de inferencia de esa familia. Se deriva de Spark-X2.6-1.7B-Base mediante un pipeline de post-entrenamiento actualizado que refuerza capacidades de codigo, ingenieria de software, matematicas, conocimiento general, uso de herramientas y planificacion agentica. No se ha publicado informacion detallada sobre el numero de tokens de entrenamiento ni la composicion exacta del dataset.

Entre las innovaciones destacadas por el autor: razonamiento chain-of-thought activado por defecto con niveles de thinking configurables (`none`, `low`, `high`), soporte de contexto extremadamente largo (1M tokens) y mayor throughput de decodificacion que modelos comparables como `Qwen3.5-2B`, `MiniCPM-2B` y `LFM2.5-2.6B` en evaluaciones de edge, con aceleracion adicional mediante el fork optimizado de `llama.cpp` de XHToken sobre una NVIDIA RTX 4090.

## Capacidades

- Generacion de texto conversacional (pipeline `text-generation`, etiqueta `conversational`).
- Razonamiento en cadena (chain-of-thought) activado por defecto, con niveles configurables `none`, `low` y `high`.
- Generacion y comprension de codigo, e ingenieria de software.
- Resolucion de problemas matematicos.
- Uso complejo de herramientas (tool use) y planificacion agentica.
- Razonamiento con contexto largo (hasta 1M tokens).
- Soporte bilingue ingles/chino con capacidades multilingues.
- Inferencia local eficiente gracias al formato GGUF con nueve niveles de cuantizacion.

## Casos de uso

- **Asistentes locales en dispositivos edge:** con la cuantizacion Q4_K_M (1,11 GB) el modelo cabe en portatiles y mini-PC sin GPU dedicada, permitiendo chatbots privados sin enviar datos a la nube.
- **Generacion y revision de codigo offline:** su post-entrenamiento en programacion e ingenieria de software lo hace util como asistente de codigo integrado en editores locales (por ejemplo, via LM Studio 0.4.0+ u Ollama v0.34.1+).
- **Analisis de documentos extensos:** la ventana de contexto de 1.048.576 tokens permite procesar libros, contratos o bases de codigo completas en una sola peticion, algo poco habitual en modelos de 1,7B.
- **Agentes con planificacion multi-paso:** el entrenamiento en uso complejo de herramientas y planificacion agentica lo adecua para agentes locales que encadenan llamadas a funciones y razonamiento en varios pasos.
- **Aplicaciones bilingues ingles/chino:** util para atencion al cliente o generacion de contenido en entornos que requieren ambos idiomas, con bajo coste de infraestructura.
- **Prototipado rapido en CPU:** las cuantizaciones Q3_K_M (937 MB) y Q3_K_L (1,02 GB) permiten experimentar en maquinas con RAM limitada.
- **Ajuste fino personalizado:** el soporte de fine-tuning mediante el fork de LLaMA-Factory de XHToken permite adaptar el modelo a dominios especificos con recursos modestos dada su escala.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona que, en evaluaciones de edge, el modelo ofrece mayor throughput de decodificacion que `Qwen3.5-2B`, `MiniCPM-2B` y `LFM2.5-2.6B`, y que las pruebas se realizaron sobre una NVIDIA RTX 4090 con el fork optimizado de `llama.cpp` de XHToken, pero no se proporcionan cifras concretas de MMLU, HumanEval, GSM8K ni otras metricas.

## Requisitos de hardware

- **VRAM / memoria estimada para inferencia (GGUF):**
  - Q3_K_M: ~937 MB; Q3_K_L: ~1,02 GB
  - Q4_K_S: ~1,04 GB; Q4_K_M: ~1,11 GB
  - Q5_K_S: ~1,22 GB; Q5_K_M: ~1,25 GB
  - Q6_K: ~1,41 GB; Q8_0: ~1,82 GB; BF16: ~3,42 GB
  - A lo anterior hay que anadir la KV cache, que puede crecer significativamente con contextos de hasta 1M tokens.
- **GPU recomendadas:** cualquier GPU consumer moderna es suficiente para las cuantizaciones comprimidas; para el fork optimizado de `llama.cpp` de XHToken se cita una NVIDIA RTX 4090. No se requieren A100 ni H100 para inferencia.
- **Consumer GPUs:** cabe con holgura en GPUs de 6-8 GB (RTX 3060, RTX 4060, RTX 4070) en cuantizaciones Q4-Q6; incluso funciona solo con CPU y RAM modesta.
- **Opciones de despliegue:** `llama.cpp` (b10828+), Ollama (v0.34.1+), LM Studio (0.4.0+), Transformers (`transformers==4.57.1`), SGLang, vLLM con plugin de Spark, NPUs Huawei Ascend, Spark-MLX-LLM y Unsloth Studio.
- **Latencia y throughput:** no disponibles como cifras concretas; se declara mayor throughput de decodificacion que modelos comparables de 2-2,6B en evaluaciones de edge.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato |
|---|---|---|---|---|
| Spark-X2.6-1.7B (este modelo) | 1,7B | 1.048.576 tokens | Apache-2.0 | GGUF, safetensors |
| Qwen3.5-2B | ~2B | no disponible | no disponible | no disponible |
| MiniCPM-2B | ~2B | no disponible | no disponible | no disponible |
| LFM2.5-2.6B | ~2,6B | no disponible | no disponible | no disponible |

Spark-X2.6-1.7B destaca frente a estos competidores por su ventana de contexto de 1M tokens y su licencia Apache-2.0 permisiva, segun los datos publicados por el autor. Los datos de contexto y licencia de los modelos alternativos no constan en la informacion disponible.

## Limitaciones y advertencias

- **Idiomas:** el soporte declarado principal es ingles y chino; el rendimiento en castellano no esta documentado y puede ser inferior.
- **Tamano del modelo:** con 1,7B de parametros, sus capacidades de razonamiento y conocimiento general son inherentemente limitadas frente a modelos grandes; puede alucinar con mas frecuencia en preguntas de conocimiento factual.
- **Contexto largo:** aunque soporta hasta 1M tokens, la calidad efectiva en contextos extremos y el consumo de memoria de la KV cache en esos regimenes no estan documentados.
- **Procedencia:** la version GGUF esta publicada por un tercero (prithivMLmods) a partir del modelo base de XHToken; conviene verificar la integridad de los pesos antes de uso en produccion.
- **Licencia:** Apache-2.0 permite uso comercial, pero no incluye garantias; el usuario asume los riesgos de salida incorrecta o sesgada.
- **Benchmarks:** al no haber cifras publicadas verificables, las afirmaciones de rendimiento superior proceden del propio autor y deben validarse de forma independiente.
- **Fecha del modelo:** el repositorio esta fechado en octubre de 2026; es un modelo muy reciente con historial de adopcion minimo (574 descargas, 2 likes en el momento de la ficha).

## Enlaces

- Repositorio GGUF: https://huggingface.co/prithivMLmods/XHToken-Spark-X2.6-1.7B-GGUF
- Modelo base: https://huggingface.co/XHToken/Spark-X2.6-1.7B
- Archivos GGUF individuales:
  - BF16: https://huggingface.co/prithivMLmods/XHToken-Spark-X2.6-1.7B-GGUF/blob/main/Spark-X2.6-1.7B.BF16.gguf
  - Q4_K_M: https://huggingface.co/prithivMLmods/XHToken-Spark-X2.6-1.7B-GGUF/blob/main/Spark-X2.6-1.7B.Q4_K_M.gguf
  - Q6_K: https://huggingface.co/prithivMLmods/XHToken-Spark-X2.6-1.7B-GGUF/blob/main/Spark-X2.6-1.7B.Q6_K.gguf
- llama.cpp: https://github.com/ggml-org/llama.cpp
