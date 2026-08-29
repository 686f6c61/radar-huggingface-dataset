# p4ik/Qwen3.8-27B-MLX-OptiQ-5bit

## Resumen

Qwen3.8-27B-MLX-OptiQ-5bit es una cuantización de precisión mixta del modelo multimodal Qwen/Qwen3.8-27B, desarrollada por p4ik específicamente para Apple Silicon mediante la herramienta mlx-optiq. El modelo base, creado por Alibaba, es un transformer denso de 27 mil millones de parámetros con atención híbrida (solo 16 de sus 64 capas usan atención completa) y capacidades de visión, código y agentes. Esta versión cuantizada asigna 4, 5 u 8 bits por capa según la sensibilidad medida con divergencia KL respecto al modelo bf16 original, logrando un promedio de 5.50 bits por peso. El resultado es un archivo de 17.67 GiB que reduce la huella de memoria sin sacrificar significativamente la calidad (ΔNLL +0.019 frente al modelo sin cuantizar). Incluye además soporte para entrada de imágenes, tool calling, plantilla de chat endurecida y decodificación especulativa MTP, lo que lo hace adecuado para despliegues locales en Mac con memoria unificada de 24 GB o más. Su relevancia radica en permitir ejecutar un modelo de 27B con capacidades de visión y agentes en hardware de consumo, bajo licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso con atención híbrida (16 capas full attention, 48 capas con atención lineal) |
| Parametros totales | 5.626.081.520 (dato del repo, posiblemente incompleto; el modelo base tiene 27B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Mixta 4/5/8 bits por capa (asignación medida por KL) |
| Idiomas soportados | No disponibles (el modelo base Qwen3.8-27B soporta múltiples idiomas, pero no se especifican en esta ficha) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (formato MLX) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un transformer denso multimodal con una arquitectura de atención híbrida: de sus 64 capas, solo 16 utilizan atención completa (con un intervalo de full_attention_interval: 4), mientras que las 48 restantes emplean un mecanismo de atención lineal para reducir el coste computacional. Esta estructura, heredada de Qwen3.5, permite manejar contextos largos de forma más eficiente. El modelo fue entrenado por Alibaba con datos multimodales (texto e imágenes) y optimizado para tareas de código, agentes y automatización de oficina.

La cuantización realizada por p4ik utiliza mlx-optiq, que mide la sensibilidad de cada tensor mediante la divergencia KL exacta respecto al modelo bf16 original. A partir de esa medición, asigna 4, 5 u 8 bits a cada capa, sin reglas estructurales predefinidas. El resultado es un modelo con 5.50 bits por peso de media. Además, se incluye una configuración de KV cache medida por capa (en `optiq/kv_config.json`) que garantiza cero fallos en llamadas a herramientas. La plantilla de chat se endureció adoptando la versión de unsloth, que acepta el rol `developer`, fusiona mensajes de sistema y protege los argumentos de tool calls. También se incorpora un head MTP (Multi-Token Prediction) para decodificación especulativa, compatible con los motores `optiq serve` y `vllm-mlx`.

## Capacidades

- Generación de texto y razonamiento: el modelo base es capaz de tareas complejas de razonamiento, incluyendo modos de pensamiento (thinking spans).
- Visión por computador: acepta entrada de imágenes y puede responder preguntas sobre ellas, gracias a que se conservan los configs del procesador del modelo base.
- Tool calling / function calling: soporta llamadas a herramientas con argumentos protegidos, lo que lo hace apto para integraciones con APIs y agentes.
- Agentes y multi-step reasoning: puede ejecutar flujos de trabajo agénticos con múltiples pasos, gracias a su capacidad de razonamiento y a la plantilla de chat endurecida.
- Decodificación especulativa MTP: acelera la generación mediante la predicción de múltiples tokens, integrada de forma agnóstica al motor.
- Multilingüe: aunque no se detallan los idiomas, el modelo base Qwen3.8-27B soporta varios idiomas, incluido el español.
- Conversacional: optimizado para diálogos multi-turno con contexto largo.

## Casos de uso

- Atención al cliente automatizada: el modelo puede gestionar conversaciones multi-turno con contexto largo, manteniendo el historial y respondiendo con precisión. Su soporte para tool calling permite integrarlo con sistemas de tickets o bases de conocimiento.
- Generación de código en producción: con capacidades de programación y razonamiento, puede generar, revisar y refactorizar código. Puede integrarse en pipelines de CI/CD mediante APIs, usando su soporte para tool calling para ejecutar pruebas o comandos.
- Análisis de imágenes en entornos locales: al aceptar entrada de imágenes, es útil para aplicaciones como descripción de fotografías, extracción de información de documentos escaneados o asistencia visual en tiempo real, todo ello en un Mac sin conexión a la nube.
- Agentes autónomos de automatización de oficina: el modelo puede orquestar tareas como generación de informes, resumen de correos o gestión de calendarios, gracias a su capacidad de razonamiento multi-paso y tool calling.
- Asistente de desarrollo con visión: combina la comprensión de capturas de pantalla o diagramas con generación de código, útil para herramientas de desarrollo asistido por IA que necesitan interpretar interfaces visuales.
- Despliegue de modelos en Apple Silicon con memoria limitada: al ser una cuantización de 5 bits con solo 17.67 GiB de pesos, permite ejecutar un modelo de 27B en Mac con 24 GB de memoria unificada, algo inviable con el modelo original en bf16.
- Investigación en cuantización eficiente: su metodología de asignación por capas basada en KL puede servir como referencia para experimentos de compresión de modelos en entornos MLX.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card incluye una comparativa de pérdida de log-verosimilitud (ΔNLL) frente al modelo bf16 original y otros cuantizados, medida sobre conjuntos de datos específicos:

| Métrica | Uniform 8bit | OptiQ 5bit (este) | OptiQ 4bit (p4ik) | OptiQ 4bit (mlx-community) | Uniform 4bit |
|---|---|---|---|---|---|
| ΔNLL overall | 0.000 (ancla) | +0.019 ± 0.019 | +0.029 ± 0.015 | +0.040 ± 0.030 | +0.038 ± 0.045 |
| German prose | 0 | +0.023 ± 0.003 | +0.019 ± 0.002 | +0.022 ± 0.002 | +0.039 ± 0.003 |
| Tool-call spans | 0 | −0.001 ± 0.013 | −0.008 ± 0.017 | +0.004 ± 0.005 | +0.013 ± 0.009 |
| Thinking spans | 0 | −0.001 ± 0.014 | +0.004 ± 0.013 | −0.005 ± 0.021 | no disponible |

Estos valores indican que la cuantización OptiQ 5bit degrada muy poco la calidad respecto al modelo original, especialmente en tareas de tool calling y razonamiento, donde incluso mejora ligeramente.

## Requisitos de hardware

- Diseñado exclusivamente para Apple Silicon (M1, M2, M3, M4 y superiores) mediante MLX.
- Memoria unificada estimada: 16–19 GB para la versión 4-bit (según el blog de orcarouter); para esta versión 5-bit, con pesos de 17.67 GiB, se estiman 18–22 GB, por lo que se recomienda un Mac con al menos 24 GB de memoria unificada.
- No es compatible con GPUs NVIDIA o AMD; solo funciona con el ecosistema MLX.
- Opciones de despliegue: `optiq serve`, `mlx-vlm`, `vllm-mlx` (todos soportan entrada de imágenes y MTP). También puede usarse con Ollama (tag `qwen3.8:27b-mlx`) según el blog, aunque la versión específica de 5-bit no está confirmada.
- Latencia y throughput: no se han publicado mediciones específicas, pero la decodificación especulativa MTP debería mejorar la velocidad de generación en comparación con una decodificación autorregresiva estándar.

## Comparativa con modelos similares

Este modelo se compara principalmente con otras cuantizaciones del mismo Qwen3.8-27B para Apple Silicon:

| Modelo | Pesos (GiB) | BPW | Asignación | Split 4/5/8 | ΔNLL overall | Visión | MTP | Plantilla endurecida |
|---|---|---|---|---|---|---|---|---|
| p4ik/Qwen3.8-27B-MLX-8bit | 26.62 | 8.50 | uniform | all @8 | 0.000 (ancla) | Sí | Sí | Sí |
| **p4ik/Qwen3.8-27B-MLX-OptiQ-5bit** | **17.67** | **5.64** | **measured (bf16)** | **100/262/136** | **+0.019** | **Sí** | **Sí** | **Sí** |
| p4ik/Qwen3.8-27B-MLX-OptiQ-4bit | 18.06 | 5.77 | measured (bf16) | 270/–/228 | +0.029 | Sí | Sí | Sí |
| mlx-community/Qwen3.8-27B-OptiQ-4bit | 18.09 | 5.78 | measured (u4) | 237/–/261 | +0.040 | Solo OptiQ | Solo OptiQ | No |
| p4ik/Qwen3.8-27B-MLX-4bit | 14.09 | 4.50 | uniform | all @4 | +0.038 | Sí | Sí | Sí |

La versión OptiQ 5bit ofrece el mejor equilibrio entre tamaño (17.67 GiB) y degradación mínima (+0.019 ΔNLL), superando a las versiones 4-bit en calidad con un coste de solo 3.6 GiB adicionales frente al 4-bit uniforme.

## Limitaciones y advertencias

- Es una cuantización de precisión mixta; aunque la degradación es baja (+0.019 ΔNLL), no es idéntica al modelo bf16 original. En tareas muy sensibles a la precisión numérica (por ejemplo, matemáticas de alta exactitud) puede haber diferencias.
- Solo funciona en Apple Silicon; no es utilizable en GPUs convencionales (NVIDIA, AMD) ni en CPUs x86 sin una conversión adicional.
- El autor anuncia que esta build será reemplazada por una versión con un nivel adicional de 6 bits, por lo que puede quedar obsoleta en el corto plazo.
- No se dispone de información sobre sesgos o alucinaciones del modelo base; como cualquier LLM, puede generar contenido incorrecto o sesgado, y debe usarse con supervisión en aplicaciones críticas.
- El dato de parámetros totales en el repo (5.626.081.520) parece inconsistente con el modelo base de 27B; probablemente se trata de un error en la metadata, pero no se ha podido verificar.
- La licencia Apache 2.0 permite uso comercial sin restricciones, pero el modelo base puede tener limitaciones adicionales no documentadas en esta ficha.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/p4ik/Qwen3.8-27B-MLX-OptiQ-5bit
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio oficial de Qwen3.8-27B (GitHub): https://github.com/AlibabaCloud-Official/Qwen3.8-27B
- Blog sobre Qwen3.8-27B en Apple Silicon: https://www.orcarouter.ai/blog/qwen-3-8-27b-mlx
- Documentación de vLLM Ascend para Qwen3.8-27B: https://docs.vllm.ai/projects/ascend/en/latest/tutorials/models/Qwen3.8-27B.html
- Versión OptiQ 4bit de p4ik: https://huggingface.co/p4ik/Qwen3.8-27B-MLX-OptiQ-4bit
- Versión OptiQ 4bit de mlx-community: https://huggingface.co/mlx-community/Qwen3.8-27B-OptiQ-4bit
