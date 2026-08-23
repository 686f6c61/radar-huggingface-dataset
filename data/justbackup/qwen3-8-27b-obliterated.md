# Justbackup/Qwen3.8-27B-OBLITERATED

## Resumen

Qwen3.8-27B-OBLITERATED es una version modificada del modelo Qwen3.8-27B de Alibaba, desarrollada por el usuario Justbackup como un fork del trabajo original de OBLITERATUS (Pliny). El objetivo principal es eliminar por completo el comportamiento de rechazo ("refusal") del modelo mediante la tecnica de abliteracion, que identifica y proyecta fuera de los pesos las direcciones asociadas a la negativa a responder. El resultado es un modelo de generacion de texto sin restricciones aparentes, orientado a investigacion de seguridad, red teaming y pruebas de estres de sistemas de IA.

La version V3 del modelo, que es la publicada, aplica un refinamiento iterativo sobre la V2, combinando dos tecnicas de cirugia de pesos (SVD y LEACE) con una expansion de corpus dirigida a categorias de evasion especificas. Segun el autor, se logra una tasa de rechazo del 0% en 842 prompts dañinos y un coste de capacidad de -2,2 puntos porcentuales en MMLU respecto al modelo original (82,39% frente a 84,60%). El modelo conserva la generacion de codigo funcional (20/20 en tareas de cyber/code) y es compatible con el modo de pensamiento ("thinking mode") del Qwen3.

El repositorio incluye pesos en formatos safetensors, GGUF y MLX, lo que facilita su despliegue en multiples entornos. La licencia es Apache 2.0, lo que permite uso comercial, aunque su naturaleza desinhibida plantea riesgos legales y eticos significativos. Este modelo es relevante para la comunidad de seguridad ofensiva y para estudios de alineamiento, pero no se recomienda para aplicaciones en produccion sin una evaluacion exhaustiva de riesgos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (model_type: qwen3) |
| Parametros totales | 27.781.427.952 (27,78 B) |
| Parametros activos | No aplicable (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No especificados (el repositorio incluye GGUF, safetensors y MLX) |
| Idiomas soportados | No disponible (heredados del modelo base Qwen3.8-27B) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, GGUF, MLX |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura transformer densa de Qwen3.8-27B, que no emplea mezcla de expertos (MoE) y mantiene un diseño de atencion por capas estandar. La modificacion principal no altera la arquitectura original, sino que aplica un proceso de abliteration sobre los pesos preentrenados. El proceso se desarrollo en tres versiones: la V1 realizo una cirugia unica con 5 direcciones de rechazo mediante descomposicion SVD, lo que elimino los rechazos duros pero provoco una caida de 6 puntos en MMLU. La V2 introdujo la "mezcla complementaria" (complementary abliteration blending), que combina dos cirugias con fallos diferentes (SVD y LEACE) en una proporcion 60/40, reduciendo el coste a -0,3 puntos de MMLU. La V3 aplica un refinamiento iterativo sobre la V2, usando un corpus dirigido para cada categoria de evasion, y luego combina los resultados. El entrenamiento adicional no incluyo datos nuevos del modelo base; se trata de una manipulacion de pesos, no de un fine-tuning convencional.

El modelo base Qwen3.8-27B fue preentrenado por Alibaba con datos multilingues y optimizado con tecnicas de alineacion, pero el proceso de abliteration elimina deliberadamente las capas de seguridad aprendidas. No se proporcionan detalles sobre el corpus de entrenamiento de la version abliterated, solo que se utilizo un corpus dirigido para las categorias de delexion.

## Capacidades

- Generacion de texto libre y sin rechazos aparentes, incluyendo respuestas a consultas que el modelo original rechazaria.
- Generacion de codigo funcional: el autor reporta 20/20 aciertos en tareas de cyber/codigo, con implementaciones practicas en lugar de descargos.
- Razonamiento y modo pensamiento: compatible con el modo thinking del Qwen3, aunque se recomienda desactivarlo para respuestas mas directas.
- Soporte de tool calling y agentes: el autor indica que el modelo funciona en bucles ReAct y extraccion de esquemas JSON, lo que sugiere conservacion de las capacidades de tool calling del base.
- Capacidades multilingues: no se especifican idiomas, pero hereda las capacidades del modelo base Qwen3.8-27B.
- Capacidades de conversacion: orientado a chat y generacion de texto de forma continuada.

## Casos de uso

- **Investigacion de seguridad ofensiva**: el modelo puede generar vectores de ataque, exploits conceptuales y codigo de prueba en entornos autorizados, lo que facilita el analisis de vulnerabilidades en sistemas propios.
- **Red teaming de modelos de IA**: se puede usar para generar prompts adversarios y evaluar la robustez de otros sistemas de IA, sin las restricciones que impone un modelo alineado.
- **Analisis forense de ciberdelincuencia**: permite simular tareas de un atacante para comprender metodos y patrones, aunque siempre en un entorno legalmente seguro.
- **Generacion de codigo de automatizacion**: su capacidad de codigo funcional y su tolerancia a prompts complejos lo hacen util para scripts de automatizacion, refactorizacion asincrona y generacion de esquemas JSON.
- **Desarrollo de agentes de investigacion**: su compatibilidad con bucles ReAct y tool calling permite construir agentes que buscan informacion en fuentes externas sin limitaciones de contenido.
- **Evaluacion de tecnicas de abliteration**: como modelo de investigacion, sirve para comparar el impacto de la abliteration en la capacidad y el comportamiento, util para la comunidad academica de alineacion.

## Benchmarks y rendimiento

El autor publico resultados de MMLU (lm-eval-harness, 0-shot, 2850 preguntas) comparando las distintas versiones:

| Modelo | MMLU | Stderr | vs Stock |
|---|---|---|---|
| Stock Qwen3.8-27B | 84,60% | ±0,65 | — |
| V1 (agresivo, 5-dir) | 81,4% | — | -6,0 pp |
| V2 (mezcla complementaria) | 84,32% | ±0,65 | -0,28 pp |
| **V3 (iterativo + dirigido)** | **82,39%** | **±0,68** | **-2,21 pp** |

Ademas, el autor reporta una tasa de rechazo del 0% en 842 prompts dañinos, y 20/20 aciertos en tareas de codigo. No se dispone de datos de benchmarks como HumanEval, GSM8K o similares en la informacion disponible.

## Requisitos de hardware

No se proporcionan datos oficiales de requisitos de hardware en la informacion del modelo. Sin embargo, para un modelo de 27,78 B de parametros se pueden estimar los siguientes requisitos:

- **VRAM para inferencia**:
  - En bfloat16: aproximadamente 55,6 GB (27,78 B x 2 bytes), requiriendo una GPU profesional como A100 80GB o H100.
  - En FP8: alrededor de 28 GB, compatible con GPUs como RTX 4090 (24 GB) con cuantizacion adicional o A6000.
  - En cuantizacion GGUF Q4_K_M: aproximadamente 16-17 GB, cabe en RTX 3090/4090 de 24 GB.
  - En Q8: aproximadamente 29 GB, requiere GPU de 32 GB o mas.
- **GPUs recomendadas**: A100, H100 para precision completa; RTX 3090/4090 para cuantizacion Q4/Q5.
- **Despliegue**: compatible con transformers (Python), llama.cpp, Ollama, LM Studio y MLX para Apple Silicon.
- **Latencia y throughput**: no disponible; dependeran de la cuantizacion y del hardware.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | MMLU (0-shot) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B (stock) | 27,78 B | No disponible | 84,60% | Apache 2.0 | HuggingFace |
| Qwen3.8-27B-OBLITERATED (V3) | 27,78 B | No disponible | 82,39% | Apache 2.0 | HuggingFace |
| Qwen3-30B-Abliterated | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de otros modelos comparables en la informacion proporcionada. La comparativa se limita al modelo stock y a la version abliterated de este mismo modelo.

## Limitaciones y advertencias

- **Contenido dañino**: el modelo puede generar contenido ilegal, violento, o danino sin restricciones. Su uso en entornos no autorizados o maliciosos es un riesgo grave.
- **Sesgos**: al eliminar las capas de rechazo, los sesgos del modelo base pueden manifestarse sin filtro, incluyendo sesgos de genero, raza o ideologia.
- **Alucinaciones**: como todo modelo de lenguaje, puede inventar informacion, especialmente en tareas complejas, sin que la falta de rechazo lo impida.
- **Riesgo de uso indebido**: su naturaleza de "uncensored" lo convierte en una herramienta de doble uso; no es adecuado para aplicaciones de produccion en entornos no controlados.
- **Licencia**: Apache 2.0 permite uso comercial, pero el autor advierte que el modelo puede producir contenido que infringe leyes locales; la responsabilidad recae en el usuario.
- **Sin datos de seguridad**: no se publicaron evaluaciones de seguridad mas alla del recuento de rechazos; no se sabe como responde ante prompts de generacion de armas, etc.
- **Contexto y idiomas**: la longitud de contexto y los idiomas no estan documentados, lo que limita su uso en aplicaciones que requieran garantias.

## Enlaces

- Repositorio del modelo (Justbackup): https://huggingface.co/Justbackup/Qwen3.8-27B-OBLITERATED
- Repositorio original del autor (OBLITERATUS): https://huggingface.co/OBLITERATUS/Qwen3.8-27B-OBLITERATED
- Modelo base Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Articulo de blog sobre el modelo (explainx.ai): https://www.explainx.ai/blog/pliny-qwen3-8-27b-obliterated-alex-finn-mac-august-2026
- Guia para ejecutar Qwen3.8-27B localmente (Substack): https://linas.substack.com/p/qwen3-8-27b-local-guide
- Instalador de un clic para Qwen3.8-27B (GitHub): https://github.com/qwen3-8-27b/qwen3-8-27b
