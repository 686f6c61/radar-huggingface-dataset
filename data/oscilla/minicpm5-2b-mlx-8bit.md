# Oscilla/MiniCPM5-2B-mlx-8Bit

## Resumen

MiniCPM5-2B es un modelo de lenguaje de 2.500 millones de parámetros (2,52B) desarrollado por OpenBMB, diseñado específicamente para despliegue en dispositivos locales, móviles y entornos con recursos limitados. Este repositorio concreto, Oscilla/MiniCPM5-2B-mlx-8Bit, es una conversión del modelo original al formato MLX con cuantización de 8 bits, realizada por el usuario Oscilla con mlx-lm 0.31.2. El modelo base es un transformer denso que escala la receta de entrenamiento del MiniCPM5-1B y alcanza un rendimiento de nivel SOTA en su categoría, superando a Qwen3.5-4B en el conjunto de benchmarks del fabricante. Con una ventana de contexto de 131.000 tokens y soporte para tool calling, está pensado para tareas de conversación, razonamiento y agentes en el borde.

La conversión MLX 8-bit reduce el tamaño del repositorio a 2,7 GB, lo que lo hace apto para ejecutarse en hardware de Apple Silicon con memoria unificada moderada. El modelo está disponible bajo licencia Apache-2.0 y soporta los idiomas inglés y chino.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso |
| Parámetros totales | 2.516.756.480 (2,52B) |
| Parámetros activos | No aplica (modelo denso) |
| Longitud de contexto | 131.000 tokens |
| Tipos de cuantización | MLX 8-bit (este repo); el modelo base está disponible en otros formatos no especificados |
| Idiomas soportados | Inglés, chino |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo base MiniCPM5-2B es un transformer denso de 2.500 millones de parámetros, sin mezcla de expertos (MoE). Escala la receta de entrenamiento del MiniCPM5-1B, manteniendo una arquitectura optimizada para inferencia en dispositivos con recursos limitados. Según los datasets listados en la ficha del repositorio, el entrenamiento combina preentrenamiento sobre Ultra-FineWeb, UltraX-Preview y Ultra-FineWeb-L3, seguido de ajuste fino supervisado (SFT) con UltraData-SFT-2605 y UltraData-SFT-Agent-2609, y optimización por refuerzo (RL) con UltraData-RL-2609. También se incluyen datos específicos de matemáticas (UltraData-Math) y código (UltraData-Code), lo que sugiere un pipeline orientado a razonamiento, generación de código y capacidades de agente.

La conversión de Oscilla no modifica la arquitectura, sino que aplica cuantización de 8 bits en formato MLX, lo que reduce el tamaño de los pesos a aproximadamente 2,7 GB. No se han publicado detalles adicionales sobre el proceso de cuantización en la información disponible.

## Capacidades

- Generación de texto conversacional en inglés y chino.
- Razonamiento matemático y lógico, apoyado en datos de entrenamiento específicos.
- Generación de código, con soporte para tareas de programación.
- Tool calling / function calling, habilitado por los datasets de agentes en SFT y RL.
- Razonamiento multi-paso y uso de herramientas en entornos de agentes.
- Contexto largo de hasta 131.000 tokens, útil para documentos extensos y conversaciones prolongadas.
- Optimizado para ejecución on-device y edge AI, con cuantización MLX 8-bit para Apple Silicon.

## Casos de uso

- Asistente personal en dispositivos Apple: el modelo puede ejecutarse localmente en un Mac o iPhone con Apple Silicon gracias a la cuantización MLX 8-bit, ofreciendo respuestas sin conexión y privacidad de datos.
- Atención al cliente multilingüe: con soporte para inglés y chino y una ventana de contexto de 131.000 tokens, puede gestionar conversaciones largas y contextualmente complejas en un entorno de soporte técnico.
- Generación de código en entornos con recursos limitados: al ser un modelo de 2B, cabe en GPUs de consumo y puede usarse para autocompletar o asistir en la programación dentro de un IDE local.
- Procesamiento de documentos largos: la ventana de 131K tokens permite resumir o analizar manuales, informes o contratos extensos sin necesidad de fragmentar el texto.
- Agentes con tool calling en el borde: el soporte para function calling y los datos de entrenamiento específicos permiten construir agentes que consultan APIs o ejecutan acciones en dispositivos locales.
- Traducción y transcripción de conversaciones entre inglés y chino: el modelo maneja ambos idiomas de forma nativa y puede integrarse en pipelines de traducción automática.
- Razonamiento matemático en aplicaciones educativas: gracias a los datos de UltraData-Math, puede resolver problemas matemáticos paso a paso en apps de tutoría.

## Benchmarks y rendimiento

Según la información disponible, el fabricante publicó un conjunto de benchmarks propio en el que MiniCPM5-2B obtiene una puntuación media de 53,9, superando a Qwen3.5-4B con 51,1. No se han publicado resultados detallados por benchmark (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

| Benchmark | MiniCPM5-2B | Qwen3.5-4B |
|---|---|---|
| Media del conjunto del fabricante | 53,9 | 51,1 |

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2,7 GB para los pesos en MLX 8-bit, más overhead de ejecución (~3-4 GB en total).
- GPU recomendadas: Apple Silicon (M1, M2, M3, M4) con al menos 8 GB de memoria unificada. En GPUs NVIDIA, puede ejecutarse con 4 GB o más si se convierte a otro formato.
- Compatibilidad con GPU de consumo: sí, por ejemplo RTX 4060 (8 GB) o RTX 3060 (12 GB) para versiones cuantizadas.
- Opciones de despliegue: mlx-lm (recomendado para Apple Silicon), llama.cpp o vLLM previa conversión a GGUF o safetensors estándar, y TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Rendimiento medio |
|---|---|---|---|---|
| MiniCPM5-2B (este) | 2,52B | 131.000 | Apache-2.0 | 53,9 |
| Qwen3.5-4B | No disponible | No disponible | No disponible | 51,1 |
| MiniCPM5-1B | No disponible | No disponible | No disponible | No disponible |

Los datos de Qwen3.5-4B y MiniCPM5-1B no están disponibles en la información proporcionada.

## Limitaciones y advertencias

- Sesgos: no se han documentado sesgos específicos en la información disponible.
- Riesgo de alucinación: como todo modelo de lenguaje generativo, puede producir contenido plausible pero incorrecto, especialmente en tareas de razonamiento complejo.
- Limitaciones de idioma: el modelo está entrenado principalmente en inglés y chino; su rendimiento en otros idiomas, incluido el español, no está garantizado.
- Restricciones de licencia: Apache-2.0 permite uso comercial sin restricciones, pero se deben conservar los avisos de licencia.
- Caveat de cuantización: la conversión a MLX 8-bit puede introducir una ligera pérdida de precisión en comparación con el modelo original en FP16 o BF16.
- El repositorio es una conversión de terceros (Oscilla) y no está respaldado directamente por OpenBMB; se recomienda verificar el modelo base oficial antes de usarlo en producción.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Oscilla/MiniCPM5-2B-mlx-8Bit
- Modelo base oficial: https://huggingface.co/openbmb/MiniCPM5-2B-MLX
- Artículo de AI/TLDR sobre MiniCPM5-2B: https://ai-tldr.dev/releases/openbmb-minicpm5-2b/
