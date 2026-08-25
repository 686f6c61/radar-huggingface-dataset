# Ivois/experimental_ztr-l-1

## Resumen

ZTR-L-1 es un modelo de lenguaje de 303,35 millones de parámetros, de arquitectura transformer decoder-only, desarrollado por Ivois y entrenado desde cero en TypeScript sobre WebGPU/Dawn. El modelo fue preentrenado sobre 1.000 millones de tokens y posteriormente ajustado mediante supervisión fina (SFT) para tareas de chat: respuestas factuales cortas, saludos, conversaciones multi-turno y respuestas honestas de desconocimiento. Su relevancia reside en que demuestra la viabilidad de entrenar un LLM completo en el navegador o en entornos con aceleración WebGPU, sin depender de frameworks tradicionales como PyTorch o CUDA.

La versión publicada es el fine-tune v4 (checkpoint del paso 300 del run `from-1b-mt-v4`), seleccionado mediante sondas de comportamiento. El modelo tiene una longitud de contexto de 4096 tokens y un vocabulario BPE de 32.000 tokens. Aunque es un experimento de investigación, su diseño compacto y su entrenamiento en WebGPU lo convierten en un caso de estudio interesante para la comunidad de desarrollo de IA en el edge y en el navegador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con GQA (4 KV heads) |
| Parametros totales | 303,35 millones |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4096 tokens |
| Tipos de cuantizacion | no disponible (pesos en float32) |
| Idiomas soportados | no especificado oficialmente; dataset de entrenamiento (Dolly-15k) en inglés |
| Licencia | no disponible |
| Formato de pesos | ztr-checkpoint (model.bin float32, manifest.json, tokenizer) |

## Arquitectura y entrenamiento

ZTR-L-1 es un transformer decoder-only con 24 capas, hidden size 1024, 16 cabezas de atención (4 KV heads, GQA), head dim 64, intermediate size 2816, RoPE y RMSNorm. Las embeddings están atadas (tied embeddings) y el vocabulario es de 32.000 tokens BPE. El modelo fue preentrenado durante 1.000.013.824 tokens (aproximadamente 1B) a una velocidad de ~2800 tokens/segundo en una RTX 5070 Ti. Posteriormente se realizó un ajuste fino supervisado con el dataset Databricks Dolly-15k (respuestas limitadas a 120 tokens) combinado con un conjunto curado manualmente (turnos casuales, reconocimientos, preguntas meta, preguntas factuales cortas, rechazos honestos y conversaciones multi-turno), con oversampling 4x. Se aplicó pérdida solo en las respuestas, con optimizador AdamW (lr 2e-4, coseno, warmup 60), batch efectivo de 4096 tokens y 666 pasos.

La innovación técnica destacable es el entrenamiento completo en TypeScript sobre WebGPU/Dawn, lo que permite ejecutar el ciclo de entrenamiento e inferencia en entornos con aceleración GPU sin necesidad de stack de Python. El formato de checkpoint es auto-descriptivo (manifest.json con índices y SHA-256).

## Capacidades

- Generación de texto conversacional: respuestas cortas a preguntas factuales, saludos y pequeñas conversaciones multi-turno.
- Reconocimiento y reacciones: puede emitir respuestas como "Nice." o "Got it." en contextos apropiados.
- Refusals honestos: responde "I don't know" cuando no conoce la respuesta.
- Limitado a tareas de chat básicas; no soporta tool calling, razonamiento complejo, código o visión.
- Capacidades multilingües: no documentadas; el entrenamiento se realizó con datos en inglés, por lo que el rendimiento en otros idiomas es incierto.
- No dispone de modo de pensamiento extendido ni de procesamiento de audio o imagen.

## Casos de uso

- Prototipado de asistentes conversacionales en el navegador: al ser un modelo ligero y ejecutable en WebGPU, se puede integrar en aplicaciones web para demostrar interacciones de chat sin servidor.
- Educación en IA: sirve como ejemplo práctico de entrenamiento de un transformer desde cero en un entorno no tradicional (TypeScript), útil para cursos de arquitecturas de modelos.
- Investigación en eficiencia de entrenamiento: su pequeño tamaño y velocidad de entrenamiento (~2800 tok/s) lo hacen adecuado para estudiar técnicas de ajuste fino y evaluación de comportamientos en modelos pequeños.
- Pruebas de integración de WebGPU en aplicaciones Node.js: el CLI ZTR permite ejecutar el modelo en servidores con GPU compatible, sirviendo como banco de pruebas para el ecosistema de WebGPU.
- Generación de texto corto en entornos con recursos limitados: su huella de memoria (~1,2 GB en float32) permite inferencia en GPUs de consumo y en dispositivos con soporte WebGPU.
- Análisis de comportamiento de modelos pequeños: su diseño y entrenamiento controlado permiten estudiar fenómenos como el overfitting, la generalización y la alucinación en modelos de menos de 500M.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor menciona que el modelo es un "research toy" y que los hechos fuera del dominio de entrenamiento son frecuentemente incorrectos, pero no proporciona métricas cuantitativas como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada: los pesos float32 de 1,21 GB requieren al menos 1,5 GB de VRAM para inferencia (considerando overhead). Con cuantizaciones no disponibles, el requisito base es de ~1,5 GB.
- GPU recomendadas: cualquier GPU con soporte WebGPU, incluyendo RTX 5070 Ti (usada en entrenamiento), RTX 4090, RTX 3090, y GPUs integradas modernas con WebGPU.
- Compatibilidad con consumer GPU: sí, es posible ejecutarlo en GPUs de consumo como RTX 3060 o superiores, siempre que soporten WebGPU.
- Opciones de despliegue: el modelo se ejecuta exclusivamente con el CLI ZTR (Node.js + WebGPU). No se menciona compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no hay datos publicados de latencia, pero se conoce que el entrenamiento alcanzaba ~2800 tok/s en una RTX 5070 Ti; la inferencia será más rápida, aunque no se especifica.

## Comparativa con modelos similares

No se dispone de datos de rendimiento comparables. Como referencia cualitativa, modelos de tamaño similar (300-500M de parámetros) como Qwen2-0.5B o TinyLlama-1.1B ofrecen mayores capacidades y benchmarks públicos, pero no son directamente comparables por la naturaleza experimental y el entrenamiento en WebGPU de ZTR-L-1. La comparativa cuantitativa no está disponible.

## Limitaciones y advertencias

- El modelo es un "research toy", no un asistente fiable: los hechos fuera del dominio de entrenamiento son frecuentemente incorrectos, incluso si se expresan con confianza.
- Entrenado solo con 1B tokens, lo que limita severamente su conocimiento general y su capacidad de razonamiento.
- No soporta tareas complejas como razonamiento multi-paso, generación de código o matemáticas avanzadas.
- No hay licencia especificada, lo que impide conocer las restricciones de uso comercial o distribución.
- El formato de pesos es propietario (ztr-checkpoint) y solo se ejecuta con el CLI ZTR, lo que limita la interoperabilidad con otros frameworks.
- El idioma de entrenamiento es principalmente inglés; el rendimiento en español u otros idiomas no está garantizado.
- No se han publicado benchmarks ni evaluaciones independientes que verifiquen sus capacidades.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/Ivois/experimental_ztr-l-1)
- [Models.dev - Base de datos de modelos](https://models.dev/)
- [Artificial Analysis - Leaderboard de modelos](https://artificialanalysis.ai/leaderboards/models)
- [AI Models Directory](https://aimodels.org/ai-models/)
- [Hugging Face Models](https://huggingface.co/models)
