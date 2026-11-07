# Outlier-Ai/gpt-oss-20b-MLX-4bit

## Resumen

`Outlier-Ai/gpt-oss-20b-MLX-4bit` es una conversión a formato MLX de 4 bits del modelo `openai/gpt-oss-20b`, empaquetada por Outlier-Ai para su ejecución nativa en Apple Silicon (M1, M2, M3 y M4). No se trata de un modelo nuevo ni de un ajuste fino: los pesos son los originales de OpenAI y el repositorio solo modifica el formato en disco (safetensors cuantizados, tokenizer y plantilla de chat) para que la librería `mlx-lm` pueda cargarlo en macOS.

El modelo base es un transformer de tipo mixture-of-experts (MoE) de OpenAI con 20.914.755.648 parámetros totales, publicado bajo licencia Apache 2.0. Esta conversión concreta pesa 11,2 GB en el repositorio y está pensada para inferencia local, sin conexión y con privacidad total, en equipos de sobremesa y portátiles de Apple.

Su relevancia actual radica en que permite ejecutar un MoE de ~21B parámetros en un Mac con memoria unificada razonable, manteniendo las capacidades del modelo original (generación de texto, conversación, function calling) sin depender de la nube ni de claves de API. La ficha se centra en las características de esta conversión; los detalles de entrenamiento y benchmarks del modelo original deben consultarse en la model card de OpenAI.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mixture-of-experts (MoE), según el modelo base `openai/gpt-oss-20b` |
| Parametros totales | 20.914.755.648 (~20,9B) |
| Parametros activos | no disponible en la informacion proporcionada |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | MLX 4-bit (group size 64, simetrica); el modelo base admite otras cuantizaciones no detalladas aqui |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (MLX 4-bit), con `config.json`, tokenizer y `chat_template.jinja` |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo `openai/gpt-oss-20b`: un transformer con mezcla de expertos (MoE) de aproximadamente 20,9B parámetros totales. Esta conversión no introduce cambios arquitectónicos ni de pesos; únicamente reempaqueta los tensores en safetensors cuantizados a 4 bits con tamaño de grupo 64 y cuantización simétrica, compatible con `mlx-lm` 0.31.x. No se ha realizado ajuste fino ni fusión de pesos, según la model card del autor.

No se dispone en la información proporcionada de detalles sobre el número de tokens de entrenamiento, la composición del dataset, el proceso de alineación (RLHF/DPO) ni innovaciones técnicas del modelo original. Esos datos deben consultarse en la model card de `openai/gpt-oss-20b`. La contribución de Outlier-Ai se limita al empaquetado MLX y a la integración con su aplicación de escritorio.

## Capacidades

- Generación de texto y conversación multi-turno (pipeline `text-generation`, tags `chat` y `conversational`).
- Soporte de function calling / tool calling (tag `function-calling` en el repositorio).
- Ejecución local y offline en Apple Silicon, sin round-trips a la nube ni claves de API.
- Inferencia en dispositivo (`on-device`, `edge-ai`) mediante Metal y MLX.
- Capacidades multilingües limitadas al inglés según el campo `language: en` del repositorio.
- Integración directa con `mlx-lm` (carga vía `load()` y generación vía `generate()`).
- Compatibilidad con la aplicación Outlier para Mac, que permite cargar cualquier conversión MLX compatible.
- No se documentan en la información disponible capacidades de visión, audio ni modo de razonamiento extendido para esta conversión.

## Casos de uso

- Asistente conversacional local en macOS: el modelo puede mantener diálogos multi-turno íntegramente en el dispositivo, aprovechando la memoria unificada del Mac y evitando enviar datos a servicios externos. Adecuado para usuarios que priorizan privacidad.
- Automatización con function calling en flujos de escritorio: gracias al soporte de tool calling, puede integrarse en scripts o aplicaciones macOS que necesiten invocar funciones locales (sistema de archivos, APIs internas) sin salir del equipo.
- Prototipado rápido de aplicaciones LLM: con `mlx-lm` y unas pocas líneas de Python se puede cargar el modelo y generar texto, lo que acelera la experimentación en un MacBook Pro o Mac Studio.
- Procesamiento de documentos sensibles: resumen y reescritura de textos confidenciales (contratos, notas internas) en local, sin exponer el contenido a terceros.
- Educación e investigación: entorno reproducible y sin coste por token para estudiar el comportamiento de un MoE de ~21B en hardware de consumo Apple.
- Desarrollo de agentes de escritorio: combinación de conversación y llamadas a herramientas para construir asistentes que operen sobre aplicaciones locales, con la ventaja de no requerir conectividad.
- Uso en entornos con conectividad limitada o restringida: al ejecutarse offline, es viable en escenarios de campo, aviación o instalaciones aisladas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite a `outlier.host/benchmarks` para cifras de MMLU, HumanEval y tok/s en Macs de la serie M, pero esos datos no se incluyen en el material proporcionado y no se reproducen aquí para no inventar cifras.

## Requisitos de hardware

- VRAM/memoria unificada estimada: el repositorio ocupa 11,2 GB en 4 bits; se recomienda al menos 16 GB de memoria unificada para cargar el modelo con margen para el contexto y el runtime, y 24-32 GB para contextos largos o uso concurrente.
- GPU recomendadas: Apple Silicon M1, M2, M3 y M4 (incluidos MacBook Air, MacBook Pro, Mac mini y Mac Studio), según los tags del repositorio.
- Compatibilidad con GPU de consumo: sí, en equipos Apple Silicon; no está pensado para GPU NVIDIA/AMD en esta conversión concreta (MLX es específico de Apple).
- Opciones de despliegue: `mlx-lm` (CLI y API Python) y la aplicación Outlier para macOS (`brew install --cask outlier-host/tap/outlier`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI en esta conversión.
- Latencia y throughput: no disponibles en la información proporcionada; dependen del chip M-series concreto y de la longitud de contexto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Outlier-Ai/gpt-oss-20b-MLX-4bit | ~20,9B (MoE) | no disponible | MLX 4-bit safetensors | apache-2.0 | Conversión para Apple Silicon; idioma en |
| openai/gpt-oss-20b | ~20,9B (MoE) | no disponible | safetensors (original) | apache-2.0 | Modelo base de OpenAI; referencia canónica |
| Outlier-Ai/Outlier-GPTOSS-20B-MLX-4bit | ~20,9B (MoE) | no disponible | MLX 4-bit | apache-2.0 | Build alternativo del mismo base, empaquetado por Outlier para su app |
| Outlier-Ai/Qwen3-Coder-30B-A3B-Instruct-MLX-4bit | ~30B (MoE, ~3B activos) | no disponible | MLX 4-bit | no disponible en la información | Conversión MLX de otro MoE orientado a código |

La comparación con alternativas de otros proveedores (por ejemplo, modelos densos de ~7B-14B en GGUF) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Idioma: el repositorio declara únicamente inglés (`language: en`); el rendimiento en castellano no está garantizado ni documentado.
- Conocimiento y sesgos: al ser una conversión del modelo original, hereda los sesgos, la fecha de corte y el riesgo de alucinación de `openai/gpt-oss-20b`, no evaluados en esta ficha.
- Cuantización: la cuantización a 4 bits puede degradar ligeramente la calidad frente a los pesos originales en precisión completa; no se aportan métricas de esa pérdida.
- Plataforma: MLX es específico de Apple Silicon; no se puede desplegar en servidores Linux con GPU NVIDIA sin otra conversión.
- Licencia: Apache 2.0 permite uso comercial, pero debe verificarse la model card canónica de OpenAI para condiciones adicionales del modelo base.
- Empaquetado: la model card incluye promoción de la aplicación Outlier y enlaces con parámetros UTM; conviene separar el contenido técnico del marketing al evaluar el repositorio.
- Datos ausentes: no se dispone de contexto máximo, número de parámetros activos ni benchmarks verificables en la información proporcionada.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Outlier-Ai/gpt-oss-20b-MLX-4bit
- Modelo base: https://huggingface.co/openai/gpt-oss-20b
- Build alternativo de Outlier: https://huggingface.co/Outlier-Ai/Outlier-GPTOSS-20B-MLX-4bit
- Benchmarks de Outlier: https://outlier.host/benchmarks
- Aplicación Outlier: https://outlier.host/
- Otras conversiones de Outlier:
  - https://huggingface.co/Outlier-Ai/DeepSeek-R1-Distill-Qwen-7B-MLX-4bit
  - https://huggingface.co/Outlier-Ai/Qwen3-Coder-30B-A3B-Instruct-MLX-4bit
  - https://huggingface.co/Outlier-Ai/Qwen2.5-Coder-7B-Instruct-MLX-4bit
  - https://huggingface.co/Outlier-Ai/Outlier-Core-27B-MLX-4bit
  - https://huggingface.co/Outlier-Ai/Outlier-Nano-4B-MLX-4bit
