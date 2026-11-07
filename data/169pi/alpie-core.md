# 169Pi/Alpie-Core

## Resumen
Alpie-Core es un modelo de lenguaje de 32.000 millones de parámetros desarrollado por 169Pi AI (India), construido mediante ajuste fino supervisado (SFT) con LoRA/QLoRA en 4 bits sobre el modelo base deepseek-ai/DeepSeek-R1-Distill-Qwen-32B. El modelo se distribuye como adaptador LoRA (repo de 0,6 GB) que requiere cargar el modelo base por separado, y está orientado a tareas de razonamiento, código y matemáticas, con un contexto declarado de 65.000 tokens y una longitud máxima de salida de 16.384 tokens.

El modelo se presenta como uno de los primeros modelos de razonamiento cuantizados a 4 bits entrenados en India y, según el autor, entre los primeros a esta escala a nivel mundial. El entrenamiento se realizó con solo 8 GPU Hopper, utilizando datasets sintéticos con abundancia de contenido STEM, junto con datos curados sobre derecho, contexto indio, exámenes y contenido multilingüe. La cuantización empleada es NF4 de 4 bits con doble cuantización.

Su relevancia radica en la reducción drástica de la huella de memoria (aproximadamente 20 GB según las instrucciones de Ollama del autor) manteniendo, según la model card, un rendimiento competitivo con modelos propietarios de frontera en benchmarks de razonamiento y código. La licencia Apache 2.0 permite uso comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2), basada en DeepSeek-R1-Distill-Qwen-32B |
| Parametros totales | 32.000 millones (cuantizados a 4 bits) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 65.000 tokens |
| Tipos de cuantizacion | 4-bit NF4 con doble cuantizacion (QLoRA); pesos distribuidos como adaptador LoRA |
| Idiomas soportados | Ingles (en), hindi (hi) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador LoRA/PEFT); el modelo base se carga por separado en float16 |
| Longitud maxima de salida | 16.384 tokens |
| Metodo de entrenamiento | SFT con LoRA/QLoRA sobre datos sinteticos y curados |
| Tamano del repositorio | 0,6 GB (adaptador) |

## Arquitectura y entrenamiento
Alpie-Core hereda la arquitectura transformer decoder-only de la familia Qwen2 a través del modelo destilado DeepSeek-R1-Distill-Qwen-32B. No se introduce una arquitectura nueva: el trabajo consiste en un ajuste fino supervisado (SFT) con LoRA y QLoRA en precisión de 4 bits (NF4 con doble cuantización), realizado sobre 8 GPU Hopper. El repositorio contiene únicamente el adaptador LoRA (0,6 GB), por lo que la inferencia requiere descargar y cargar el modelo base de 32B por separado, tal como muestra el ejemplo con `PeftModel` de la model card.

Los datos de entrenamiento combinan datasets sintéticos con alta proporción de contenido STEM (razonamiento, matemáticas, código) y datos curados adicionales sobre derecho, contexto indio, exámenes y contenido multilingüe. El autor declara énfasis en claridad de las respuestas, filtrado de contenido inseguro, comunicación transparente de incertidumbre, manejo de temas sensibles, sensibilidad cultural y prevención de filtrado de datos privados o trazas internas de razonamiento. No se especifica en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron etapas de RLHF o DPO; la model card solo menciona SFT.

## Capacidades
- Generación de texto conversacional con soporte de streaming token a token.
- Razonamiento multi-paso y resolución de problemas complejos, heredado del linaje DeepSeek-R1.
- Generación y razonamiento sobre código, incluyendo tareas de reparación de software (el autor reporta resultados en SWE-Bench Verified).
- Matemáticas: resolución de problemas aritméticos y de razonamiento cuantitativo (resultados reportados en GSM8K).
- Razonamiento sobre documentos largos gracias a la ventana de contexto de 65.000 tokens.
- Capacidades multilingües limitadas a inglés e hindi según los metadatos del modelo.
- Compatibilidad con la API de OpenAI a través del servicio alojado de 169Pi (streaming, async, contexto largo).
- SDK oficial en Python (`pi169`) con interfaz tipada, soporte async/await y streaming.
- No se documenta soporte explícito de tool calling, function calling ni visión en la información disponible.

## Casos de uso
- Razonamiento matemático asistido: el modelo puede resolver problemas de varios pasos y explicar el procedimiento, adecuado para herramientas educativas o de tutoría en STEM gracias a su entrenamiento con datos sintéticos ricos en matemáticas.
- Generación y revisión de código: puede integrarse en pipelines de desarrollo para explicar fragmentos, proponer correcciones o resolver incidencias acotadas, apoyándose en su especialización en código y en el contexto de 65K tokens para manejar repositorios de tamaño medio.
- Reparación de bugs en flujos de CI/CD: el autor reporta resultados en SWE-Bench Verified, lo que lo hace candidato para asistentes de mantenimiento de software que analizan trazas de error y proponen parches.
- Procesamiento de documentos largos: contratos, informes técnicos o expedientes de hasta 65.000 tokens pueden analizarse en una sola pasada sin fragmentación, útil en entornos legales o de auditoría.
- Atención al cliente en inglés e hindi: conversaciones multi-turno con contexto extenso y respuestas en streaming de baja latencia a través de la API compatible con OpenAI o del despliegue local con Ollama.
- Asistencia en preparación de exámenes: el entrenamiento incluye datos de exámenes y contexto indio, lo que lo hace adecuado para plataformas de estudio orientadas a ese mercado.
- Despliegue en infraestructura modesta: con aproximadamente 20 GB de RAM/VRAM según el autor, puede ejecutarse en una sola GPU consumer de gama alta o en servidores sin aceleradores de gran formato, reduciendo costes frente a modelos de 32B en precisión completa.

## Benchmarks y rendimiento
Los datos provienen exclusivamente de la model card del autor; no se han verificado de forma independiente.

| Benchmark | Resultado reportado | Configuracion |
|---|---|---|
| MMLU | 81,28 % | 5-shot |
| GSM8K | 92,75 % | 8-shot |
| SWE-Bench Verified | 57,8 % | no especificada |

El autor afirma que estos resultados son competitivos con GPT-4o y Claude 3.5 Sonnet en razonamiento y código, pero no se aportan en la información disponible las puntuaciones de esos modelos comparados ni la metodología exacta de evaluación.

## Requisitos de hardware
- VRAM/RAM estimada: aproximadamente 20 GB mínimos según las instrucciones de Ollama del autor para la variante empaquetada; el adaptador LoRA en sí ocupa 0,6 GB, pero requiere cargar el modelo base de 32B.
- GPU recomendadas: el entrenamiento se realizó en 8 GPU Hopper (H100). Para inferencia, una GPU con 24 GB o más (RTX 3090, RTX 4090, A6000, L40S) es suficiente para la variante cuantizada a 4 bits; para precisión float16 del modelo base se necesitan aproximadamente 64 GB (A100 80GB, H100).
- Cabe en GPU consumer: sí, en RTX 3090/4090 (24 GB) con la variante de 4 bits; no en GPUs de 8-16 GB.
- Opciones de despliegue: Ollama (`ollama pull 169pi/alpie-core`), transformers con PEFT (`PeftModel`), API alojada de 169Pi compatible con OpenAI, SDK `pi169`. No se documenta soporte explícito para vLLM o TGI en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Alpie-Core | 32B (4-bit) | 65K | Apache 2.0 | Adaptador LoRA safetensors | Fine-tune de DeepSeek-R1-Distill-Qwen-32B; benchmarks reportados por el autor |
| DeepSeek-R1-Distill-Qwen-32B | 32B | 128K (según modelo original) | MIT (modelo base) | Safetensors | Modelo base sin cuantizar; referencia directa de comparación |
| Qwen2.5-32B-Instruct | 32B | 128K | Apache 2.0 | Safetensors, GGUF | Alternativa generalista de mismo tamaño con amplio ecosistema |
| Gemma-2-27B-IT | 27B | 8K | Gemma license | Safetensors | Menor contexto; licencia con restricciones de uso |

La comparación de rendimiento con estas alternativas no está disponible en la información proporcionada; solo se dispone de los resultados del propio Alpie-Core.

## Limitaciones y advertencias
- Los benchmarks (MMLU, GSM8K, SWE-Bench) son reportados por el autor y no se han verificado de forma independiente; la afirmación de competitividad con GPT-4o y Claude 3.5 Sonnet carece de datos comparativos en la información disponible.
- El repositorio contiene solo el adaptador LoRA (0,6 GB); es imprescindible descargar el modelo base de 32B, lo que incrementa sustancialmente los requisitos de almacenamiento y memoria respecto a lo que sugiere el tamaño del repo.
- Idiomas limitados a inglés e hindi; el rendimiento en castellano no está documentado y probablemente sea inferior.
- Riesgo de alucinación inherente a los modelos destilados de razonamiento, especialmente en dominios fuera de STEM (derecho, medicina, finanzas) donde los datos de entrenamiento son sintéticos o curados de forma limitada.
- El entrenamiento con datos sintéticos puede introducir sesgos y errores propagados del generador de datos; no se documenta ninguna evaluación de sesgos.
- No se documenta soporte de tool calling ni de agentes multi-paso, lo que limita su uso en pipelines de automatización que dependan de function calling.
- Aunque la licencia Apache 2.0 permite uso comercial, el modelo base DeepSeek-R1-Distill-Qwen-32B tiene su propia licencia que debe verificarse por separado antes de un despliegue comercial.
- La fecha de actualización del repositorio (2026-11-06) es posterior a la de creación (2025-07-02) y el número de descargas es bajo (192), lo que sugiere una adopción limitada y poca validación por parte de la comunidad.
- No hay información sobre latencia, throughput ni estabilidad en producción.

## Enlaces
- Hugging Face: https://huggingface.co/169Pi/Alpie-Core
- Repositorio GitHub: https://github.com/169Pi/Alpie-Core
- Web oficial de 169Pi AI: https://169pi.ai/
- Perfil de Hugging Face del autor: https://huggingface.co/169Pi
- SDK en PyPI: https://pypi.org/project/pi169/0.1/
- LinkedIn: https://www.linkedin.com/company/169pi/
- X (Twitter): https://x.com/169Pi_ai
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Qwen-32B
