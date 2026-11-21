# Lothera/Thero-1-Pulsar-GGUF

## Resumen

Thero-1 Pulsar es un modelo de lenguaje y visión de tipo image-text-to-text desarrollado por Lothera Intelligence, publicado originalmente en formato BF16 y distribuido aquí en cuantizaciones GGUF calibradas con imatrix. Con 8.953.803.264 parámetros totales (aproximadamente 9B), se posiciona en el segmento de modelos abiertos de 8B-12B, con un enfoque explícito en bilingüismo turco-inglés y capacidades de código y matemáticas.

El modelo base se distribuye junto con un proyector de visión nativo (`mmproj`), lo que permite comprensión de imágenes en local mediante llama.cpp, Ollama o LM Studio. La versión GGUF incluye cuantizaciones desde Q3_K_M hasta Q8_0, además de una variante IQ4_XS optimizada con imatrix, lo que facilita su despliegue en hardware de consumo desde 6 GB de VRAM.

Su relevancia actual radica en dos factores: por un lado, cubre un nicho poco atendido como es el de los modelos multilingües con buen rendimiento en turco sin sacrificar inglés; por otro, ofrece un modo de razonamiento dual (thinking / no-think) conmutable en tiempo de ejecución, algo poco habitual en modelos de este tamaño y disponible directamente en Ollama.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base multimodal image-text-to-text; detalles del transformer no especificados) |
| Parametros totales | 8.953.803.264 (~9B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 32.768 tokens (valor usado en los ejemplos de llama-server con `-c 32768`) |
| Tipos de cuantizacion | Q3_K_M, IQ4_XS, Q4_K_M, Q5_K_M, Q6_K, Q8_0 (calibradas con imatrix); proyector de visión en BF16 y F16 |
| Idiomas soportados | inglés (en), turco (tr), multilingüe; con soporte declarado de código y matemáticas |
| Licencia | CC BY 4.0 |
| Formato de pesos | GGUF (con `mmproj` GGUF separado para visión) |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo base en la documentación proporcionada. Se trata de un modelo multimodal de tipo image-text-to-text, con un proyector de visión (`mmproj`) que se carga de forma separada en llama.cpp y que actúa como adaptador entre el codificador visual y el modelo de lenguaje. El tamaño de 8,95B parámetros y la existencia de un modo de razonamiento dual (thinking / no-think) sugieren una arquitectura transformer con capacidades de razonamiento extendido, aunque no se confirma el tipo exacto ni la presencia de atención lineal u otras innovaciones.

En cuanto al entrenamiento, la model card no especifica el número de tokens, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. Sí se menciona una evaluación propia denominada Thero-Bench (195 preguntas no vistas: 104 en turco y 91 en inglés) comparada contra Qwen3.5-9B bajo hardware, prompts y presupuestos de tokens idénticos, lo que indica un proceso de alineación orientado a bilingüismo. Las cuantizaciones GGUF están calibradas con imatrix, lo que mejora la fidelidad en bits bajos respecto a cuantizaciones estándar.

## Capacidades

- Generación de texto conversacional multi-turno en inglés y turco, con soporte multilingüe adicional.
- Comprensión de imágenes (image-text-to-text) mediante el proyector `mmproj`, incluyendo descripción de imágenes y respuesta a preguntas visuales.
- Modo de razonamiento dual: razonamiento extendido (thinking) conmutable a modo directo (no-think) en tiempo de ejecución, tanto en Ollama (`/set think`, `/set nothink`) como en llama.cpp.
- Capacidades de código y matemáticas, según la propia descripción del modelo ("Turkish + English + Code/Math").
- Integración con tooling local: compatible con llama.cpp, Ollama, LM Studio y servidor OpenAI-compatible (`llama-server`).
- Soporte de endpoints compatibles (tag `endpoints_compatible`) y uso conversacional.
- No se documenta soporte explícito de function calling estructurado ni de agentes multi-step en la información disponible.

## Casos de uso

- Asistente conversacional bilingüe turco-inglés: el modelo está entrenado y evaluado específicamente en ambos idiomas, por lo que puede gestionar atención al cliente o soporte técnico en turco sin degradar el rendimiento en inglés, con contexto de hasta 32K tokens.
- Análisis de imágenes en local: mediante `llama-mtmd-cli` o `llama-server` con `--mmproj`, se puede usar para describir capturas, extraer información de documentos escaneados o responder preguntas sobre imágenes sin enviar datos a la nube.
- Despliegue en hardware de consumo: con la cuantización Q4_K_M (~5,6 GB) cabe en GPUs de 8 GB de VRAM, lo que permite prototipado y demos en estaciones de trabajo modestas o portátiles con GPU.
- Razonamiento multi-paso con modo thinking: para tareas de análisis, planificación o resolución de problemas matemáticos donde interese activar el razonamiento extendido, y desactivarlo cuando se priorice latencia.
- Generación y revisión de código en entornos con requisitos de privacidad: al ejecutarse con llama.cpp u Ollama en local, es adecuado para pipelines internos donde el código no puede salir de la infraestructura.
- Aplicaciones de accesibilidad: descripción de imágenes para usuarios con discapacidad visual, ejecutándose de forma local con el proyector de visión.
- Evaluación e investigación en multilingüismo: útil como referencia para estudiar el equilibrio turco-inglés en modelos de ~9B, dado el conjunto de evaluación Thero-Bench publicado por el autor.

## Benchmarks y rendimiento

La model card menciona una evaluación propia, Thero-Bench (195 preguntas no vistas: 104 en turco y 91 en inglés), comparada contra Qwen3.5-9B bajo condiciones idénticas, pero los resultados se presentan únicamente como imágenes en la model card y no se incluyen cifras numéricas en la información proporcionada. No se han publicado resultados numéricos de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

| Benchmark | Thero-1 Pulsar | Qwen3.5-9B | Notas |
|---|---|---|---|
| Thero-Bench (195 preguntas) | no disponible (solo gráfico) | no disponible (solo gráfico) | 104 turco + 91 inglés, mismas condiciones |
| MMLU | no disponible | no disponible | no reportado |
| HumanEval | no disponible | no disponible | no reportado |
| GSM8K | no disponible | no disponible | no reportado |

## Requisitos de hardware

- VRAM estimada según cuantización: Q3_K_M ~4,4 GB (6 GB VRAM); IQ4_XS ~5,0 GB (6-8 GB); Q4_K_M ~5,6 GB (8 GB, recomendado); Q5_K_M ~6,5 GB (10-12 GB); Q6_K ~7,5 GB (12 GB); Q8_0 ~9,5 GB (16 GB+).
- Proyector de visión: +1 GB de VRAM adicional (BF16 o F16, ~0,85 GB cada uno).
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 para cuantizaciones altas; A100/H100 no necesarias para este tamaño, aunque válidas para servir en producción con mayor concurrencia.
- Cabe en GPU de consumo: sí, desde 6 GB de VRAM con Q3_K_M y desde 8 GB con Q4_K_M; también en Apple Silicon de 16-24 GB con Q8_0.
- Opciones de despliegue: llama.cpp (`llama-server`, `llama-mtmd-cli`), Ollama (registro `lothera/thero-1-pulsar` y `hf.co/Lothera/Thero-1-Pulsar-GGUF`), LM Studio. No se menciona soporte de vLLM ni TGI para estos GGUF.
- Parámetros de muestreo recomendados por el autor: temperature 0.55, top-p 0.80, top-k 20, repeat penalty 1.03.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Multimodal | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Thero-1 Pulsar (GGUF) | ~9B | 32.768 tokens (según ejemplos) | Sí (mmproj) | CC BY 4.0 | Hugging Face, Ollama, LM Studio |
| Qwen3.5-9B | ~9B | no disponible | no disponible | no disponible | no disponible |
| Alternativas de 8B-12B open-weights | no disponible | no disponible | no disponible | no disponible | no disponible |

La única comparación explícita publicada por el autor es contra Qwen3.5-9B en Thero-Bench, pero sin cifras numéricas accesibles en la información proporcionada. No se dispone de datos suficientes para comparar rendimiento, contexto o licencia con otras alternativas de la misma categoría.

## Limitaciones y advertencias

- No se documentan sesgos conocidos, pero al ser un modelo entrenado principalmente en turco e inglés, el rendimiento en otros idiomas puede degradarse notablemente.
- Riesgo de alucinación inherente a modelos de ~9B, especialmente en tareas de razonamiento prolongado o en modo thinking; no se han publicado métricas de factualidad.
- El contexto máximo no está declarado formalmente; los 32.768 tokens provienen de los ejemplos de despliegue y no de una especificación oficial.
- La licencia CC BY 4.0 permite uso comercial con atribución, pero exige citar adecuadamente al autor; conviene revisar los términos exactos antes de integrarlo en productos.
- No se documenta soporte de function calling estructurado ni de agentes multi-step, por lo que su uso en pipelines agénticos requiere validación previa.
- Los benchmarks propios (Thero-Bench) están publicados solo como imágenes y no han sido replicados de forma independiente; deben tomarse con cautela.
- El repositorio muestra 0 descargas y 0 likes, lo que indica un modelo muy reciente y sin validación comunitaria amplia.
- El proyector de visión debe cargarse por separado; olvidarlo desactiva por completo la capacidad multimodal.

## Enlaces

- Hugging Face (GGUF): https://huggingface.co/Lothera/Thero-1-Pulsar-GGUF
- Modelo base: https://huggingface.co/Lothera/Thero-1-Pulsar
- Licencia CC BY 4.0: https://creativecommons.org/licenses/by/4.0/
- Ollama Registry: `lothera/thero-1-pulsar` (tags `:latest`, `:q4_k_m`, `:q5_k_m`, `:q6_k`, `:q8_0`)
- Imagen de evaluación Thero-Bench vs Qwen3.5-9B: https://i.hizliresim.com/k0ycscem.png
- Imagen comparativa segmento 8B-12B: https://i.hizliresim.com/twkhkg26.png
- Imagen de presentación del modelo: https://i.hizliresim.com/1itcpppz.jpg
