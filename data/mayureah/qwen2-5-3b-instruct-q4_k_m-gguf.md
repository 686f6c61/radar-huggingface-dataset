# Mayureah/Qwen2.5-3B-Instruct-Q4_K_M-GGUF

## Resumen

El modelo `Mayureah/Qwen2.5-3B-Instruct-Q4_K_M-GGUF` es una conversión al formato GGUF del modelo original `Qwen/Qwen2.5-3B-Instruct`, realizada mediante la herramienta GGUF-my-repo de llama.cpp. Se trata de un modelo de lenguaje de 3 mil millones de parámetros, de arquitectura transformer decoder-only, desarrollado por Alibaba Cloud como parte de la serie Qwen2.5. La cuantización Q4_K_M reduce el tamaño del modelo a aproximadamente 1,9 GB, lo que permite su ejecución en hardware de consumo con requisitos de memoria moderados.

Este archivo GGUF está pensado para su uso con llama.cpp, llama-server u otros motores compatibles con este formato, como Ollama. Al ser una versión cuantizada, mantiene las capacidades del modelo base (generación de texto, chat, razonamiento, código) con una ligera pérdida de precisión, a cambio de una inferencia más rápida y un menor consumo de recursos. Es relevante para desarrolladores que necesitan desplegar un asistente conversacional o un modelo de generación de texto en entornos con limitaciones de VRAM o CPU.

La licencia es `qwen-research`, una licencia de investigación que restringe el uso comercial, por lo que su aplicación en producción empresarial requiere verificar los términos de la licencia original de Qwen2.5.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (dense) |
| Parametros totales | 3.085.938.688 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 128K tokens (modelo base); no especificado para esta cuantizacion |
| Tipos de cuantizacion | Q4_K_M (este archivo) |
| Idiomas soportados | Ingles (segun la model card; el modelo base Qwen2.5 es multilingue) |
| Licencia | qwen-research (licencia de investigacion, no comercial) |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo base Qwen2.5-3B-Instruct es un transformer decoder-only con normalización RMSNorm, atención con sesgo de posición rotatorio (RoPE) y activación SwiGLU. Se preentrenó sobre un dataset de hasta 18 billones de tokens, con una mezcla de datos multilingües y de código. La variante Instruct se ajustó mediante supervisión (SFT) y optimización con preferencias humanas (RLHF/DPO), lo que le confiere habilidades de diálogo, seguimiento de instrucciones y razonamiento.

La conversión a GGUF se realizó con llama.cpp, que transforma los pesos originales en safetensors al formato GGUF, aplicando cuantización Q4_K_M. Esta cuantización utiliza bloques de 32 canales con escalares y mínimos por bloque, ofreciendo un buen equilibrio entre tamaño y calidad. No se han introducido modificaciones arquitectónicas adicionales; el modelo conserva la misma estructura y capacidades que el original, aunque con una precisión numérica reducida en los pesos.

## Capacidades

- Generación de texto y chat conversacional multi-turno.
- Razonamiento lógico y matemático básico, adecuado para tareas de QA y análisis.
- Generación de código en múltiples lenguajes, con soporte para explicaciones y depuración.
- Seguimiento de instrucciones complejas gracias al ajuste con RLHF.
- Soporte de tool calling y function calling (capacidad del modelo base, heredada en la cuantización).
- Capacidad para actuar como agente en flujos multi-paso, aunque con limitaciones propias de un modelo de 3B.
- Multilingüismo: el modelo base soporta más de 29 idiomas, aunque la model card de esta conversión solo declara inglés.

## Casos de uso

- Asistente conversacional en aplicaciones de escritorio o web: el modelo puede gestionar diálogos multi-turno con contexto de hasta 128K tokens, aunque en la práctica la cuantización puede reducir la ventana efectiva. Es adecuado para chatbots de soporte técnico o educativo.
- Generación de código en entornos de desarrollo: puede autocompletar funciones, explicar fragmentos de código o generar scripts simples. Su tamaño reducido permite ejecutarlo en una GPU de gama media o incluso en CPU.
- Procesamiento de documentos largos: gracias a su contexto de 128K, puede resumir o extraer información de documentos extensos, aunque la cuantización puede afectar la fidelidad en tramos muy largos.
- Prototipado rápido de aplicaciones de IA: al ser un GGUF, se integra fácilmente con llama.cpp, Ollama o llama-cpp-python, permitiendo iterar sobre ideas sin necesidad de infraestructura costosa.
- Educación y experimentación: sirve como modelo de referencia para estudiar técnicas de cuantización, comparar rendimiento entre formatos o aprender a desplegar LLMs en local.
- Automatización de tareas de redacción: puede generar borradores de correos, artículos cortos o contenido creativo, siempre que se respete la licencia de investigación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo base Qwen2.5-3B-Instruct reporta puntuaciones en MMLU, HumanEval y GSM8K, pero no se dispone de datos específicos para esta cuantización Q4_K_M. Se recomienda consultar la documentación oficial de Qwen2.5 para obtener referencias del modelo sin cuantizar.

## Requisitos de hardware

- Tamaño del archivo: 1,9 GB, lo que implica un uso de VRAM de aproximadamente 2,5-3 GB durante la inferencia (pesos + overhead de contexto y activaciones).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM, como NVIDIA GTX 1650, RTX 3050, RTX 4060, o GPUs de Apple Silicon (M1/M2/M3) con memoria unificada.
- También puede ejecutarse en CPU con llama.cpp, aunque la velocidad será menor; se recomienda al menos 8 GB de RAM.
- Opciones de despliegue: llama.cpp (CLI y servidor), Ollama, llama-cpp-python, o cualquier motor compatible con GGUF.
- Latencia estimada: en una GPU RTX 4060, se pueden alcanzar velocidades de 30-50 tokens por segundo; en CPU, 5-10 tokens por segundo, dependiendo del hardware.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Mayureah/Qwen2.5-3B-Instruct-Q4_K_M-GGUF | 3B | 128K (base) | GGUF | qwen-research | Hugging Face |
| Qwen/Qwen2.5-3B-Instruct-GGUF | 3B | 128K | GGUF | qwen-research | Hugging Face |
| Qwen/Qwen2.5-3B-Instruct (safetensors) | 3B | 128K | safetensors | qwen-research | Hugging Face |
| Llama-3.2-3B-Instruct (GGUF) | 3B | 128K | GGUF | Llama 3.2 Community | Hugging Face |

La comparativa se limita a características generales, ya que no se dispone de datos de rendimiento específicos para esta cuantización. El modelo de Mayureah es una conversión no oficial del GGUF oficial de Qwen, por lo que su comportamiento debería ser idéntico al de la versión oficial, salvo posibles diferencias en la configuración de cuantización.

## Limitaciones y advertencias

- Licencia `qwen-research`: restringe el uso a fines de investigación y no permite uso comercial. Verificar los términos completos en el enlace de la licencia.
- La cuantización Q4_K_M introduce una pérdida de precisión que puede afectar tareas de razonamiento complejo o generación de código muy técnico.
- El contexto de 128K tokens es teórico; en la práctica, la memoria necesaria para atender secuencias largas puede exceder la VRAM disponible en GPUs de consumo.
- La model card solo declara inglés, aunque el modelo base es multilingüe; el rendimiento en otros idiomas puede ser inferior al del modelo sin cuantizar.
- Riesgo de alucinaciones y sesgos presentes en el modelo base, especialmente en temas sensibles o de actualidad.
- No se han publicado benchmarks específicos para esta conversión, por lo que el rendimiento real debe validarse en el caso de uso concreto.

## Enlaces

- Repositorio Hugging Face del modelo: https://huggingface.co/Mayureah/Qwen2.5-3B-Instruct-Q4_K_M-GGUF
- Modelo base original: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- GGUF oficial de Qwen2.5-3B-Instruct: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct-GGUF
- Repositorio de llama.cpp: https://github.com/ggerganov/llama.cpp
- Página de Qwen2.5 en GitHub: https://github.com/mx4ai/qwen2.5
- Modelo en ModelScope: https://www.modelscope.cn/models/qwen/Qwen2.5-3B-Instruct
- Página de Ollama para qwen2.5:3b-instruct-q4_K_M: https://ollama.com/library/qwen2.5:3b-instruct-q4_K_M
