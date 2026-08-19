# ShaoShuai0605/Harness-R1

## Resumen

Harness-R1 es un modelo de lenguaje entrenado mediante aprendizaje por refuerzo (RL) que aprende a editar el *harness* de ejecución de un agente: el código que construye el contexto, media las herramientas, valida las acciones y recupera errores en tiempo real. Desarrollado por ShaoShuai0605, el modelo se basa en Qwen/Qwen3.5-9B (9 000 millones de parámetros) y se publica bajo licencia Apache 2.0. Su relevancia radica en que, en lugar de actualizar los pesos del modelo tras cada interacción, permite que el propio agente modifique su infraestructura de ejecución durante el despliegue, mejorando así la robustez y la capacidad de adaptación a tareas de largo horizonte.

El repositorio contiene dos checkpoints: `harness-r1` (el modelo principal) y `agent-sft-harness-r1` (una variante que combina *supervised fine-tuning* del agente con el entrenamiento de edición del harness). El trabajo se describe en el artículo *Harness-R1: Learning to Edit Executable Runtime Harnesses from Agent Trajectories* (arXiv:2608.02276). Aunque el modelo está orientado a investigación, su enfoque abre una nueva línea para construir agentes autónomos que se auto-mejoran sin reentrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (decoder-only, basado en Qwen3.5-9B) |
| Parametros totales | 9 000 millones (9B) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible (depende de la configuracion de Qwen3.5-9B) |
| Tipos de cuantizacion | no disponible (solo safetensors en precision original) |
| Idiomas soportados | no disponible (heredados del modelo base Qwen3.5-9B) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

Harness-R1 parte de Qwen/Qwen3.5-9B, un modelo transformer denso de 9B parámetros. El entrenamiento se realiza mediante *reinforcement learning* (RL) con el objetivo de que el modelo genere ediciones al código del harness de un agente, no respuestas directas a tareas. Según el paper, el método introduce un pipeline que convierte trayectorias de interacción fallidas en señales de entrenamiento: el modelo aprende a modificar el harness (por ejemplo, añadir validaciones, corregir el manejo de errores o ajustar la construcción de contexto) para evitar fallos futuros. El checkpoint `agent-sft-harness-r1` añade una etapa previa de *supervised fine-tuning* sobre el agente, lo que mejora la calidad de las trayectorias utilizadas como base.

No se han publicado detalles sobre el número de tokens de entrenamiento, la composición del dataset ni las funciones de recompensa exactas. La implementación se basa en `transformers` y requiere `trust_remote_code=True` para cargar el modelo.

## Capacidades

- Edición de código de harness: el modelo genera parches o modificaciones al código de ejecución de un agente (construcción de contexto, mediación de herramientas, validación de acciones y recuperación de errores).
- Aprendizaje por refuerzo: capacidad de mejorar el comportamiento del agente a partir de trayectorias fallidas, sin actualizar los pesos del agente subyacente.
- Integración con agentes: el checkpoint `agent-sft-harness-r1` combina el fine-tuning del agente con la edición del harness, permitiendo un agente más capaz desde el inicio.
- Compatibilidad con transformers: se puede cargar con `AutoModelForCausalLM` y `AutoTokenizer` estándar.
- Soporte de tool calling y funciones de agente: heredado del modelo base Qwen3.5-9B (aunque no se documenta explícitamente en la model card).
- Multilingüismo: no especificado, pero probablemente hereda las capacidades del modelo base Qwen.

## Casos de uso

- Agentes autónomos de búsqueda de información: el modelo puede editar el harness de un agente que navega por la web o consulta APIs, corrigiendo errores de parseo o mejorando la validación de resultados en tiempo de ejecución.
- Depuración automática de pipelines de datos: ante fallos recurrentes en un flujo de extracción-transformación-carga (ETL), Harness-R1 puede modificar el código de validación y recuperación para hacer el pipeline más robusto.
- Automatización de tareas de larga duración: en escenarios donde un agente debe ejecutar cientos de pasos, el modelo aprende a ajustar el harness para mantener el contexto y evitar desviaciones.
- Mejora continua de asistentes de código: un asistente de programación que utiliza herramientas (compiladores, linters) puede beneficiarse de que el harness se adapte a nuevos entornos de ejecución.
- Investigación en RL para agentes: sirve como punto de partida para experimentos sobre auto-mejora de agentes sin reentrenamiento completo.
- Simulación de entornos con herramientas dinámicas: en pruebas de concepto donde el agente debe interactuar con APIs cambiantes, el modelo puede reescribir el harness para ajustarse a nuevas especificaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El paper arXiv (2608.02276) podría contener métricas, pero no se han extraído en los datos proporcionados. No se dispone de comparaciones cuantitativas con otros modelos.

## Requisitos de hardware

- El tamaño del repositorio es de 37.7 GB, lo que sugiere pesos en BF16 o FP16 (aproximadamente 18 GB para los parámetros, más el tokenizador y archivos auxiliares).
- Para inferencia en BF16/FP16 se recomienda una GPU con al menos 24 GB de VRAM (por ejemplo, RTX 3090, RTX 4090, A10G, A100 40GB).
- Para inferencia con cuantización INT8 (si se convierte manualmente con herramientas como `bitsandbytes` o `llama.cpp`), se necesitarían aproximadamente 9-10 GB de VRAM, lo que permitiría ejecutarlo en GPUs de consumo como RTX 3080 (10 GB) o RTX 4070 (12 GB).
- No se han publicado cuantizaciones oficiales (GGUF, GPTQ, AWQ), por lo que su uso en entornos de producción con baja latencia requeriría conversión manual.
- Opciones de despliegue: `transformers` con `AutoModelForCausalLM`, vLLM (si se adapta), o llama.cpp tras conversión a GGUF. No se menciona compatibilidad con TGI u Ollama en la documentación.

## Comparativa con modelos similares

Dado que Harness-R1 es un fine-tuning de Qwen3.5-9B, la comparación más directa es con el modelo base y con otros modelos de ~9B orientados a agentes.

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Harness-R1 (este) | 9B | no disponible | RL para edición de harness | Apache 2.0 | HuggingFace |
| Qwen3.5-9B (base) | 9B | no disponible | Modelo generalista | Apache 2.0 | HuggingFace |
| Llama 3.1 8B | 8B | 128K | Modelo generalista | Llama 3.1 | HuggingFace |
| Mistral 7B | 7B | 32K | Modelo generalista | Apache 2.0 | HuggingFace |

No se dispone de datos de rendimiento comparativo. La principal diferencia de Harness-R1 es su especialización en editar el harness, una capacidad que los modelos generalistas no poseen de forma nativa.

## Limitaciones y advertencias

- No se han documentado sesgos específicos, pero al estar basado en Qwen3.5-9B, puede heredar los sesgos del modelo base.
- Riesgo de alucinación en la generación de código: el modelo podría proponer ediciones de harness incorrectas o inseguras, especialmente en entornos no vistos durante el entrenamiento.
- Limitaciones de contexto: no se especifica la longitud máxima de contexto; es probable que herede la de Qwen3.5-9B, pero no está confirmado.
- Idiomas: no se indica qué idiomas soporta; se recomienda verificar con el modelo base.
- Restricciones de uso comercial: la licencia Apache 2.0 permite uso comercial, pero el modelo está orientado a investigación y no se garantiza su robustez en producción.
- El modelo requiere `trust_remote_code=True`, lo que implica ejecutar código arbitrario del repositorio; se debe revisar el código antes de usarlo en entornos sensibles.
- No hay cuantizaciones oficiales, lo que puede limitar su despliegue en hardware de gama baja.

## Enlaces

- HuggingFace: https://huggingface.co/ShaoShuai0605/Harness-R1
- Paper (arXiv): https://arxiv.org/abs/2608.02276
- PDF del paper: https://arxiv.org/pdf/2608.02276
- Repositorio GitHub relacionado (harness-1): https://github.com/pat-jj/harness-1
