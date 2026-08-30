# camilablank/sycophancy-dpo-paper-checkpoints

## Resumen

El repositorio `camilablank/sycophancy-dpo-paper-checkpoints` contiene los checkpoints de entrenamiento utilizados en el artículo académico *"Sycophantic Agreement Transfers with Neutral Data via Contrastive Preference Optimization"*, del grupo de investigación de Camila Blank (Stanford). No es un modelo único, sino una colección de puntos de control que documentan experimentos de optimización de preferencias (DPO y variantes contrastivas) aplicados a dos modelos base: `allenai/OLMo-3-7B-Instruct-SFT` y `allenai/Llama-3.1-Tulu-3-8B-SFT`. El objetivo del trabajo es estudiar cómo el comportamiento "adulador" (sycophancy) de un modelo profesor se transfiere al modelo entrenado, y cómo mitigarlo mediante datos neutros y optimización contrastiva.

La relevancia actual de este repositorio radica en que aborda un problema crítico de alineación: la tendencia de los LLM a generar respuestas que coinciden con las opiniones del usuario aunque sean incorrectas. Al publicar los checkpoints completos, el trabajo permite reproducir los experimentos y analizar la evolución del comportamiento durante el entrenamiento. El repositorio incluye tanto fine-tunes completos como adaptadores LoRA (r=64, alpha=128) sobre OLMo-3-7B-Instruct-SFT, organizados por secciones del paper. Todos los pesos están en formato safetensors y la licencia es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (depende del modelo base: OLMo-3 y Llama-3.1) |
| Parametros totales | No disponible (repositorio con multiples checkpoints; cada checkpoint hereda los parametros del modelo base: 7B u 8B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada del modelo base, no especificada) |
| Tipos de cuantizacion | No disponible (los pesos se publican en precision original, probablemente bf16/fp16) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (modelos completos y adaptadores LoRA) |

## Arquitectura y entrenamiento

Los checkpoints se construyen sobre dos arquitecturas transformer estándar: OLMo-3-7B-Instruct-SFT (modelo open-source de AI2) y Llama-3.1-Tulu-3-8B-SFT (fine-tune instruccional de Llama-3.1-8B, desarrollado por Allen AI). El entrenamiento emplea Direct Preference Optimization (DPO) y una variante contrastiva denominada "Contrastive Preference Optimization" (CPO), que utiliza datos neutros para reducir la transferencia de sycophancy desde el modelo profesor. La mayoría de los checkpoints son fine-tunes completos, excepto cuatro entradas etiquetadas como `lls_headline/lls-recipe__*`, que son adaptadores LoRA (r=64, alpha=128) sobre OLMo-3-7B-Instruct-SFT. No se especifica el número de tokens de entrenamiento ni la composición exacta del dataset, aunque el repositorio enlaza un dataset asociado (`camilablank/sycophancy-dpo-testbed-v3`) que contiene los pares de preferencia utilizados.

## Capacidades

- Al ser checkpoints de investigación derivados de modelos base instruccionales, heredan las capacidades generales de generación de texto, razonamiento y seguimiento de instrucciones de OLMo-3-7B-Instruct y Llama-3.1-Tulu-3-8B.
- No se documentan capacidades específicas adicionales (tool calling, agentes, multimodalidad, etc.) en la información proporcionada.
- El propósito principal no es añadir capacidades, sino estudiar y controlar el fenómeno de sycophancy (tendencia a estar de acuerdo con el usuario sin base objetiva).
- Los checkpoints permiten analizar la evolución del comportamiento de sycophancy durante el entrenamiento, comparando distintos pares profesor-rechazado (por ejemplo, `qwen3-32b-chosen__qwen3-0.6b-rejected`).
- Los adaptadores LoRA ofrecen una vía ligera para experimentar sin necesidad de cargar modelos completos.

## Casos de uso

- Investigacion en alineacion de modelos: el repositorio permite reproducir los experimentos del paper y estudiar cómo el sycophancy se transfiere desde un modelo profesor a un modelo entrenado mediante DPO. Es útil para validar metodologías de mitigación.
- Evaluacion de sesgos de preferencia: los checkpoints pueden usarse para medir la propension de un modelo a ceder ante opiniones del usuario en tareas de razonamiento, comparando versiones entrenadas con diferentes configuraciones.
- Desarrollo de tecnicas de optimizacion contrastiva: los adaptadores LoRA y los fine-tunes completos sirven como punto de partida para experimentar con variantes de CPO en otros modelos base.
- Analisis de interpretabilidad: al tener múltiples puntos de control intermedios, se puede rastrear en qué fase del entrenamiento aparece o desaparece el comportamiento adulador, lo que ayuda a entender los mecanismos internos.
- Benchmark de robustez: estos checkpoints pueden utilizarse como casos de prueba para medir la resistencia de un modelo a preguntas capciosas o a contextos donde el usuario expresa una opinion incorrecta.
- Educacion y divulgacion: sirven como material didactico para cursos de alineacion de IA, mostrando ejemplos concretos de como el DPO puede amplificar o reducir sesgos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye metricas de rendimiento en tareas estandar (MMLU, HumanEval, GSM8K, etc.) ni comparaciones cuantitativas con otros modelos. El unico dato relevante es la referencia al paper, que probablemente contiene evaluaciones especificas de sycophancy, pero dichos numeros no estan accesibles en la fuente consultada.

## Requisitos de hardware

- Cada checkpoint individual corresponde a un modelo de 7B u 8B parametros. En precision FP16, un modelo de 8B ocupa aproximadamente 16 GB de VRAM; en 8 bits, unos 8 GB; en 4 bits, unos 4 GB.
- Para cargar los checkpoints completos con transformers, se recomienda una GPU con al menos 24 GB de VRAM (por ejemplo, RTX 3090/4090, A10G, A100 40GB) si se usa FP16.
- Los adaptadores LoRA requieren mucho menos memoria: solo necesitan cargar el modelo base (OLMo-3-7B-Instruct-SFT) y el adaptador, lo que cabe en GPUs de 16 GB con cuantizacion 8 bits.
- El repositorio completo pesa 248.8 GB, por lo que el almacenamiento local debe considerarse si se descargan todos los checkpoints.
- Para inferencia, se pueden utilizar frameworks como vLLM, TGI o llama.cpp (si se convierten los pesos a GGUF), aunque no se proporcionan instrucciones especificas de despliegue.
- No se dispone de datos sobre latencia o throughput esperados.

## Comparativa con modelos similares

Dado que este repositorio no es un modelo autonomo sino un conjunto de checkpoints experimentales, la comparacion directa con modelos de proposito general no es trivial. No obstante, puede contextualizarse frente a sus modelos base:

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| `camilablank/sycophancy-dpo-paper-checkpoints` (sobre OLMo-3-7B) | 7B | No especificado | Apache 2.0 | Checkpoints de investigacion |
| `allenai/OLMo-3-7B-Instruct-SFT` | 7B | No especificado | Apache 2.0 | Modelo base abierto |
| `allenai/Llama-3.1-Tulu-3-8B-SFT` | 8B | No especificado | Apache 2.0 | Modelo base abierto |
| `meta-llama/Llama-3.1-8B-Instruct` | 8B | 128K (original) | Llama 3.1 Community License | Modelo base comercial |

La principal diferencia es el proposito: los checkpoints de sycophancy no estan pensados para uso general, sino para investigacion especifica sobre alineacion. No hay datos de rendimiento comparativo.

## Limitaciones y advertencias

- Es un repositorio de investigacion, no un modelo listo para produccion. Los checkpoints pueden no ser estables ni seguros para aplicaciones reales.
- No se documentan sesgos especificos, pero al entrenarse con datos de preferencia, existe el riesgo de amplificar sesgos presentes en los datos de eleccion (por ejemplo, preferencias del modelo profesor).
- El fenomeno de sycophancy no se elimina por completo; los checkpoints representan intentos de mitigacion, no garantias de ausencia de sesgo.
- La licencia Apache 2.0 permite uso comercial, pero al ser un trabajo academico, se recomienda citar el paper original si se utilizan los pesos en investigacion o productos derivados.
- No se proporcionan instrucciones de cuantizacion ni versiones GGUF, por lo que el despliegue en entornos con recursos limitados requiere conversion manual.
- Los datos de entrenamiento no estan completamente documentados (composicion, volumen, filtros), lo que dificulta evaluar la generalizacion fuera del dominio del estudio.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/camilablank/sycophancy-dpo-paper-checkpoints
- Codigo del proyecto: https://github.com/camilablank/sycophancy-dpo
- Dataset asociado: https://huggingface.co/datasets/camilablank/sycophancy-dpo-testbed-v3
- Repositorio relacionado (checkpoints de sycophancy-confidence): https://huggingface.co/camilablank/all_sycophancy_checkpoints
- Articulo de referencia (survey sobre sycophancy, no el paper del repositorio): https://arxiv.org/abs/2411.15287
- Perfil del autor en GitHub: https://github.com/camilablank
