# IFM/Jais-3-32B-FP8

## Resumen

Jais-3-32B-FP8 es la versión cuantizada a FP8 de Jais-3-32B, el miembro denso de mayor tamaño de la familia Jais-3 desarrollada por IFM (Inception42). Se trata de un modelo decoder-only de clase 32B con una ventana de contexto de 512K tokens, entrenado específicamente para árabe e inglés, lo que lo convierte en una de las pocas alternativas abiertas de gran contexto con cobertura nativa del árabe.

La relevancia de esta variante concreta reside en la cuantización: todas las capas lineales excepto `lm_head` se convierten a FP8 con pesos estáticos (una escala por bloque de 128×128) y activaciones dinámicas (una escala por grupo de 1×128 a lo largo de la dimensión de canales de entrada). Según el autor, el rendimiento se mantiene prácticamente alineado con el modelo BF16 original mientras reduce la huella de memoria y acelera la inferencia en hardware compatible con FP8.

El modelo se publica bajo licencia Apache 2.0, con pesos en safetensors y compatibilidad con `transformers` mediante código personalizado (`k2_horizon`), lo que facilita su integración en pipelines existentes sin necesidad de reentrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (código personalizado `k2_horizon`) |
| Parametros totales | 34.779.304.960 (~34,8B, según safetensors) |
| Parametros activos | No aplica (modelo denso; 32B activos por token) |
| Longitud de contexto | 512K tokens |
| Tipos de cuantizacion | FP8 (pesos estáticos por bloque 128×128, activaciones dinámicas por grupo 1×128); disponibles también GGUF, MLX 4-bit, MLX 8-bit y MLX BF16 |
| Idiomas soportados | Árabe (ar) e inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (FP8); GGUF y MLX en repositorios derivados |

## Arquitectura y entrenamiento

La información disponible confirma que Jais-3-32B es un transformer decoder-only denso de 32B parámetros con ventana de contexto de 512K tokens. El repositorio emplea código personalizado bajo el identificador `k2_horizon`, lo que implica que la implementación de referencia requiere `trust_remote_code=True` en `transformers`. No se detallan en la información proporcionada el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron fases de RLHF o DPO.

La innovación técnica destacable de esta variante es el esquema de cuantización FP8: pesos estáticos con una escala por bloque de 128×128 y activaciones dinámicas con una escala por grupo de 1×128 en la dimensión de entrada, excluyendo `lm_head`. Este diseño busca preservar la precisión del BF16 original minimizando el error de cuantización en las activaciones, que suelen ser el punto débil de las aproximaciones estáticas.

## Capacidades

- Generación de texto conversacional en árabe e inglés.
- Razonamiento y respuesta a instrucciones en contextos de hasta 512K tokens.
- Procesamiento de documentos largos (informes, expedientes, código extenso) sin truncamiento.
- Capacidades multilingües limitadas a los dos idiomas declarados (ar, en).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Modo thinking explícito, visión o audio: no disponible en la información proporcionada.

## Casos de uso

- Análisis de expedientes legales o administrativos en árabe: la ventana de 512K tokens permite cargar contratos, sentencias y normativa completa en una sola pasada, sin necesidad de fragmentación ni recuperación externa.
- Atención al cliente en árabe e inglés: el modelo puede mantener conversaciones multi-turno con historial extenso, adecuado para centros de soporte que operan en ambos idiomas con la misma infraestructura.
- Procesamiento de corpus académicos y periodísticos: resumen y extracción de información de artículos largos o libros completos en árabe, un nicho con escasa cobertura en modelos abiertos.
- Migración y modernización de código documentado: con contexto largo, el modelo puede recibir un repositorio o módulo extenso junto con su documentación para tareas de refactorización asistida, siempre que el código y las instrucciones estén en inglés.
- Despliegue en infraestructura con aceleración FP8: la cuantización permite servir el modelo en GPUs Hopper o Ada Lovelace con menor huella de VRAM que la versión BF16, reduciendo el coste por token en producción.
- Generación aumentada por recuperación (RAG) con contexto masivo: en lugar de recuperar fragmentos pequeños, se pueden inyectar documentos completos, lo que simplifica la arquitectura del pipeline y reduce errores de recuperación.
- Investigación comparativa en PLN árabe: al ser Apache 2.0 y con variantes GGUF/MLX, sirve como baseline reproducible en estudios académicos sobre modelos abiertos para árabe.

## Benchmarks y rendimiento

La model card incluye una tabla comparativa con modelos de referencia (Falcon-H1-34B-Instruct, Gemma-4-31B-it, Muse-Glimmer-30B, Qwen3.8-27B y Fanar-2-27B), pero los valores numéricos de las métricas no están disponibles en la información proporcionada: solo se confirma el número de parámetros y la arquitectura de cada modelo comparado. El autor afirma que la versión FP8 rinde de forma cercana al BF16 original en sus evaluaciones, sin cuantificar la diferencia.

No se han publicado resultados de benchmarks numéricos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP8: aproximadamente 35 GB solo para pesos, más overhead de activaciones y caché KV; con contexto de 512K tokens la caché KV puede crecer de forma significativa y requerir decenas de GB adicionales.
- GPU recomendadas: H100, H200 y B200 para FP8 nativo; A100 (sin FP8 nativo, requiere emulación o conversión) y L40S como alternativas.
- Consumer GPU: no cabe en GPUs de 24 GB (RTX 4090) en FP8 sin offloading; para equipos de consumo se recomienda la variante GGUF con cuantización 4-bit o las versiones MLX 4-bit para Apple Silicon.
- Opciones de despliegue: `transformers` con `trust_remote_code=True`, vLLM (si soporta el código personalizado `k2_horizon`), llama.cpp y Ollama mediante el repositorio GGUF, MLX en Apple Silicon.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Params | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Jais-3-32B-FP8 | 32B (34,8B reales) | 512K | Apache 2.0 | HF (safetensors, GGUF, MLX) |
| Falcon-H1-34B-Instruct | 34B | no disponible | no disponible | HF |
| Gemma-4-31B-it | 31B | no disponible | no disponible | HF |
| Muse-Glimmer-30B | 30B | no disponible | no disponible | HF |
| Qwen3.8-27B | 27B | no disponible | no disponible | HF |
| Fanar-2-27B | 27B | no disponible | no disponible | HF |

Los datos de contexto, licencia y rendimiento de los modelos de referencia no están disponibles en la información proporcionada; la comparativa se limita a parámetros y disponibilidad. Jais-3-32B destaca por su ventana de 512K y su enfoque bilingüe árabe-inglés, frente a alternativas mayoritariamente centradas en inglés.

## Limitaciones y advertencias

- Cobertura lingüística restringida a árabe e inglés; el rendimiento en castellano u otros idiomas no está garantizado ni documentado.
- Riesgo de alucinación inherente a los modelos generativos; no se documentan evaluaciones de fidelidad factual en la información disponible.
- Sesgos conocidos: no disponibles en la información proporcionada; se recomienda auditar el modelo en dominios sensibles antes de producción.
- La cuantización FP8, aunque cercana al BF16 según el autor, introduce una degradación no cuantificada; para tareas de alta precisión conviene validar contra la versión BF16.
- El uso de código personalizado (`k2_horizon`) implica dependencia de `trust_remote_code=True` y posible fricción con frameworks de serving que no lo soporten de forma nativa.
- La ventana de 512K tokens exige planificación de memoria: la caché KV puede dominar el consumo de VRAM en contextos largos.
- Licencia Apache 2.0 permite uso comercial sin restricciones adicionales, pero no se ofrece garantía ni soporte por parte del autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/IFM/Jais-3-32B-FP8
- Modelo base: https://huggingface.co/inception42/Jais-3-32B
- Colección Jais-3: https://huggingface.co/collections/IFM/jais-3-6abba9df4f1173ec7ce2929d
- Variante GGUF: https://huggingface.co/IFM/Jais-3-32B-GGUF
- Variante MLX 4-bit: https://huggingface.co/IFM/Jais-3-32B-MLX-4bit
- Variante MLX 8-bit: https://huggingface.co/IFM/Jais-3-32B-MLX-8bit
- Variante MLX BF16: https://huggingface.co/IFM/Jais-3-32B-MLX-bf16
- Paper de referencia (arXiv): https://arxiv.org/abs/2611.10224
