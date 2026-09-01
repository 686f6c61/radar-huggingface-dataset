# Savas65/Qwen3.8-27B-OBLITERATED

## Resumen

Qwen3.8-27B-OBLITERATED es una variante del modelo Qwen3.8-27B, desarrollada por Savas65, que ha sido sometida a un proceso de "abliteration" para eliminar los mecanismos de rechazo y las respuestas de seguridad evasivas. El objetivo es obtener un modelo que responda de forma directa y sustancial a consultas que normalmente serían bloqueadas, manteniendo en lo posible las capacidades originales del modelo base. Está pensado para investigación de seguridad, red team y pruebas de robustez de sistemas de IA.

El modelo se basa en la arquitectura transformer de Qwen3.8-27B, con 27.781.427.952 parámetros. La versión V3, la más reciente, emplea una técnica denominada "complementary abliteration blending" que combina dos métodos de ablación (SVD y LEACE) para minimizar la pérdida de capacidad. Según la model card, el coste en MMLU es de -2,1 puntos porcentuales respecto al modelo original (82,3% frente a 84,5%).

La relevancia actual radica en la creciente demanda de modelos "uncensored" para tareas de seguridad ofensiva, generación de código sin restricciones y evaluación de alineación. El modelo se distribuye bajo licencia Apache 2.0, lo que permite uso comercial, y está disponible en formatos safetensors, GGUF y MLX.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basado en Qwen3.8-27B) |
| Parametros totales | 27.781.427.952 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GGUF, safetensors (bfloat16), MLX |
| Idiomas soportados | No disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, GGUF, MLX |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.8-27B, un transformer denso con 27.800 millones de parámetros. El proceso de "abliteration" elimina las direcciones de rechazo en el espacio de pesos mediante dos técnicas principales: SVD (descomposicion en valores singulares) y LEACE (minimizacion de informacion mutua). La version V3 combina ambas en un proceso iterativo: primero se refina el modelo V2 (que ya habia eliminado los rechazos duros) y luego se aplica una cirugia dirigida con un corpus especifico para eliminar las "desviaciones suaves" (respuestas de seguridad sin contenido sustancial). El resultado se mezcla con el modelo V2 en una proporcion 60/40 para cancelar las debilidades de cada metodo.

No se especifican los datos de entrenamiento adicionales ni el numero de tokens utilizados en el proceso de ablacion. El modelo base Qwen3.8-27B fue entrenado por Alibaba Cloud con un corpus multilingue extenso, pero esa informacion no se detalla en la model card del autor.

## Capacidades

- Generacion de texto y conversacion multilingue (idiomas no especificados).
- Razonamiento y resolucion de problemas, con soporte de "thinking mode" (modo de pensamiento) que funciona correctamente en la version V3.
- Generacion de codigo funcional: segun la model card, logra 20/20 en tareas de generacion de codigo con implementaciones reales, sin descargos de responsabilidad.
- Capacidades de cyber y jailbreak: el modelo responde a consultas relacionadas con seguridad ofensiva, generacion de exploits y tecnicas de evasion.
- Sin rechazos: tasa de rechazo del 0% en 842 prompts de red team, segun el blog de explainx.ai.
- Compatible con tool calling y agentes, aunque se recomienda ajustar parametros para evitar bucles en entornos agente.

## Casos de uso

- Investigacion de seguridad ofensiva (red team): el modelo puede generar exploits, analizar vulnerabilidades y proponer vectores de ataque sin las restricciones habituales. Su capacidad para proporcionar codigo funcional lo hace util para pruebas de penetracion automatizadas.
- Generacion de codigo sin restricciones: en entornos de desarrollo donde se necesitan soluciones rapidas para tareas complejas (por ejemplo, scripts de automatizacion, parsers, herramientas de linea de comandos) sin que el modelo se niegue o añada avisos de seguridad.
- Pruebas de jailbreak y robustez de modelos: los investigadores pueden usar este modelo para generar prompts adversariales y evaluar la resistencia de otros sistemas de IA a intentos de evasion.
- Analisis de malware y ciberseguridad: el modelo puede desglosar codigo malicioso, explicar su funcionamiento y sugerir contramedidas, aunque su naturaleza "sin censura" requiere un uso responsable.
- Automatizacion de tareas de pentesting: integrado en frameworks como Metasploit o herramientas personalizadas, puede generar payloads y comandos especificos para pruebas de seguridad.
- Investigacion academica sobre alineacion y seguridad de IA: sirve como caso de estudio para analizar como la ablacion de direcciones de rechazo afecta al comportamiento y a las capacidades del modelo.

## Benchmarks y rendimiento

La model card del autor proporciona resultados de MMLU (lm-eval-harness, 0-shot, n=100 por materia, 5700 preguntas) para las distintas versiones:

| Modelo | MMLU | Error estandar | Diferencia vs stock |
|---|---|---|---|
| Stock Qwen3.8-27B | 84,5% | No disponible | — |
| V1 | 81,4% | No disponible | -6,0 pp |
| V2 | 84,3% | No disponible | -0,3 pp |
| V3 | 82,3% | No disponible | -2,1 pp |

Ademas, la model card indica que V3 logra 20/20 en tareas de generacion de codigo (20 prompts) y 7/8 en tareas avanzadas del mundo real. El blog de explainx.ai reporta una tasa de rechazo del 0% en 842 prompts de red team. No se han publicado resultados de benchmarks adicionales (HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 27.800 millones de parametros. En bfloat16 (safetensors) ocupa aproximadamente 55 GB, por lo que requiere una GPU con al menos 60 GB de VRAM (por ejemplo, A100 80GB, H100 80GB). Con cuantizacion GGUF Q4_K_M (~16 GB) puede ejecutarse en GPUs consumer como RTX 3090/4090 (24 GB) o RTX 4080 (16 GB). Para Q5_K_M (~18 GB) se necesita al menos 20 GB de VRAM.
- GPUs recomendadas: A100, H100, RTX 4090, RTX 3090, o GPUs AMD con soporte ROCm (segun el blog de AMD, hay soporte Day 0 para Ryzen AI Max y Radeon).
- Opciones de despliegue: vLLM, llama.cpp (con plantilla Jinja incluida), Ollama, LM Studio, Transformers de Hugging Face, y MLX para Apple Silicon.
- Latencia y throughput: no se proporcionan datos especificos. En una RTX 4090 con cuantizacion Q4, se puede esperar una velocidad de generacion de 20-40 tokens/s, pero es una estimacion orientativa.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | MMLU | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B (stock) | 27,8B | No disponible | 84,5% | Apache 2.0 | Hugging Face |
| Qwen3.8-27B-OBLITERATED (V3) | 27,8B | No disponible | 82,3% | Apache 2.0 | Hugging Face |
| Dolphin 2.6 (Mixtral 8x7B) | 46,7B (MoE) | 32k | ~68% (MMLU) | Apache 2.0 | Hugging Face |

La comparativa con Dolphin es aproximada, ya que no se dispone de datos de MMLU para Dolphin en la informacion proporcionada. El modelo OBLITERATED mantiene un rendimiento cercano al stock en MMLU, con la ventaja de no tener rechazos. No se han encontrado comparativas directas con otros modelos "uncensored" de tamano similar.

## Limitaciones y advertencias

- Sesgos conocidos: al ser una variante del Qwen3.8-27B, puede heredar sesgos del modelo base, aunque no se documentan especificamente.
- Riesgo de alucinacion: como cualquier modelo de lenguaje, puede generar informacion falsa o inventada, especialmente en temas especializados.
- Limitaciones de contexto: la longitud de contexto no se ha especificado; se recomienda gestionar el historial en entornos agente (resumir tras ~10 turnos).
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo esta disenado para eliminar restricciones de seguridad, lo que puede conllevar riesgos legales y eticos si se usa de forma inapropiada.
- Advertencia para produccion: el modelo puede generar contenido peligroso (exploits, malware, etc.). No debe desplegarse en sistemas orientados al usuario final sin un control de acceso estricto y supervisio humana.
- Dependencia de parametros: el rendimiento optimo requiere temperatura 0, repetition_penalty 1.15 y sin system prompt. Desviarse de estos ajustes puede degradar la calidad o reintroducir rechazos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Savas65/Qwen3.8-27B-OBLITERATED
- Modelo base Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Demo interactiva (Space de elliottb): https://huggingface.co/spaces/elliottb/qwen3.8-27b-obliterated-demo
- Blog de explainx.ai: https://www.explainx.ai/blog/pliny-qwen3-8-27b-obliterated-alex-finn-mac-august-2026
- Blog de AMD sobre soporte de hardware: https://www.amd.com/en/blogs/2026/run-qwen-3-8-27b-on-amd-ryzen-ai-max-and-radeon-graphics-cards-day-0.html
- Blog de mindstudio.ai: https://www.mindstudio.ai/blog/qwen3-8-27b-obliterated-uncensored
