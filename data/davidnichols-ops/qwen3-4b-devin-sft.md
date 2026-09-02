# davidnichols-ops/qwen3-4b-devin-sft

## Resumen

El modelo `davidnichols-ops/qwen3-4b-devin-sft` es un fine-tuning del modelo Qwen3-4B, especializado en el formato de llamadas a herramientas y en la ejecución de tareas de ingeniería de software de tipo agente. El autor, `davidnichols-ops`, lo entrenó sobre un conjunto de datos propio de 4.992 muestras extraídas de sesiones de Devin, el agente de programación autónomo de Cognition, con el objetivo de que el modelo aprenda a emitir llamadas a herramientas (shell, comandos, etc.) en un formato JSON estructurado dentro de etiquetas `<tool>`. El resultado es un modelo instructivo de 4B parámetros que puede integrarse en flujos de trabajo de automatización y agentes de código.

La relevancia de este modelo reside en su tamaño compacto (4B) y su licencia Apache 2.0, lo que permite su despliegue en entornos de producción con requisitos de hardware moderados. Además, se ha diseñado para ser utilizado junto con un modelo borrador de 0.6B (`davidnichols-ops/qwen3-0.6b-devin-draft`) mediante decodificación especulativa, logrando una aceleración de la inferencia de 2 a 3 veces. El entrenamiento se realizó en una NVIDIA GB10 (DGX Spark) con 128 GB de VRAM, en BF16, durante aproximadamente 48 minutos.

No se han publicado resultados de benchmarks en la información disponible, por lo que la evaluación de su rendimiento queda pendiente de pruebas independientes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (basado en Qwen3-4B) |
| Parametros totales | 4.022.468.096 (4,02B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (el modelo base Qwen3-4B soporta 32.768 tokens, pero no se especifica en la model card del fine-tune) |
| Tipos de cuantizacion | No disponible (el repositorio contiene pesos en safetensors, presumiblemente BF16) |
| Idiomas soportados | Inglés (según la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-4B, un transformer denso con atención causal estándar, sin mezcla de expertos. El fine-tuning se realizó mediante SFT (supervised fine-tuning) sobre un dataset de 4.992 muestras de sesiones de Devin, donde cada muestra es un diálogo (system/user/assistant) que incluye llamadas a herramientas en el formato `<tool>{json}</tool>`. El entrenamiento se ejecutó durante 3 épocas con un tamaño de lote efectivo de 32 (16 con acumulación de gradientes), una tasa de aprendizaje de 2e-5 con programación coseno y precisión BF16. El hardware utilizado fue una NVIDIA GB10 con 128 GB de VRAM, y el tiempo total de entrenamiento fue de unos 48 minutos. No se emplearon técnicas de RLHF ni DPO; el ajuste es exclusivamente supervisado.

Una innovación destacable es la compatibilidad con decodificación especulativa: el modelo puede combinarse con un borrador de 0.6B que propone tokens y el modelo de 4B los verifica, acelerando la generación entre 2 y 3 veces. Esta técnica es especialmente útil en escenarios de agente donde se generan secuencias largas con múltiples llamadas a herramientas.

## Capacidades

- Generación de texto instructivo en inglés, con seguimiento de instrucciones de sistema y usuario.
- Emisión de llamadas a herramientas en formato JSON estructurado, específicamente para ejecutar comandos de shell, lanzar pruebas (pytest, uv run, etc.) y otras operaciones de línea de comandos.
- Soporte de tool calling nativo para tareas de automatización y agentes de software.
- Compatible con decodificación especulativa usando el modelo borrador `davidnichols-ops/qwen3-0.6b-devin-draft`, lo que reduce la latencia de inferencia.
- Capacidad de razonamiento multi-paso limitada al contexto de una conversación de agente, aunque no se especifica si el modelo mantiene un estado de ejecución persistente.
- Sin capacidades de visión, audio ni multimodalidad.

## Casos de uso

- Automatización de pruebas y corrección de código: el modelo puede recibir una petición como "ejecuta la suite de pruebas y corrige los fallos", emitir la llamada a `shell` con el comando `uv run pytest`, interpretar la salida y proponer parches.
- Asistente de línea de comandos integrado en entornos de desarrollo: puede generarse un agente que ejecute comandos de git, gestión de paquetes o compilación, reduciendo la intervención manual del desarrollador.
- Integración en pipelines de CI/CD: el modelo puede actuar como un orquestador que decide qué comandos ejecutar según el estado del repositorio, aunque requeriría un bucle de ejecución externo que capture la salida y la realimente al modelo.
- Generación de scripts y comandos complejos: a partir de una descripción en lenguaje natural, el modelo produce el comando shell adecuado en el formato esperado por la herramienta.
- Agente de resolución de incidencias en repositorios: dado un issue de GitHub, el modelo puede proponer comandos para reproducir el problema, ejecutarlos y sugerir una solución.
- Prototipado de agentes de software con decodificación especulativa: al emparejarse con el modelo borrador, se puede desplegar en hardware modesto (GPU de 8-16 GB) manteniendo una latencia aceptable para interacción en tiempo real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de cifras de MMLU, HumanEval, GSM8K u otras pruebas estandarizadas para este fine-tune concreto. Se recomienda evaluar el modelo en tareas específicas de tool calling y razonamiento antes de su uso en producción.

## Requisitos de hardware

- Inferencia en BF16: aproximadamente 8 GB de VRAM para los pesos (4B parámetros × 2 bytes). Con la ventana de contexto máxima, el uso de VRAM puede aumentar hasta 10-12 GB.
- Inferencia en cuantización int8: unos 4-5 GB de VRAM (requiere conversión manual, no se proporcionan pesos cuantizados).
- Inferencia en cuantización int4: unos 2-3 GB de VRAM (también requiere conversión manual).
- GPU recomendadas: RTX 3080/3090, RTX 4070/4090, A10, A100, H100, o cualquier GPU con al menos 8 GB de VRAM para BF16.
- El entrenamiento se realizó en una NVIDIA GB10 (DGX Spark) con 128 GB de VRAM, pero para inferencia no se necesita tanta capacidad.
- Opciones de despliegue: transformers (con `device_map="auto"`), vLLM, TGI, llama.cpp (si se convierte a GGUF), Ollama (con conversión previa).
- Con decodificación especulativa (modelo borrador de 0.6B), la latencia por token se reduce significativamente, aunque el throughput exacto depende del hardware. No se proporcionan cifras concretas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato de tool calling | Observaciones |
|---|---|---|---|---|---|
| `davidnichols-ops/qwen3-4b-devin-sft` | 4,02B | No disponible | Apache 2.0 | `<tool>{json}</tool>` | Fine-tune específico para Devin |
| Qwen/Qwen3-4B (base) | 4,02B | 32.768 tokens | Apache 2.0 | No entrenado específicamente | Modelo generalista sin fine-tune de tools |
| Qwen/Qwen3-4B-Instruct | 4,02B | 32.768 tokens | Apache 2.0 | Soporta tool calling nativo (formato Qwen) | Versión instructiva oficial, con benchmarks publicados |

La comparativa directa con otros fine-tunes de tool calling de tamaño similar no está disponible en la información proporcionada. El modelo se distingue por su formato de tool calls específico para sesiones Devin, que puede no ser compatible con los formatos estándar de otras librerías.

## Limitaciones y advertencias

- El modelo se entrenó exclusivamente en inglés; su rendimiento en otros idiomas no está garantizado.
- El formato de tool calls (`<tool>{json}</tool>`) es específico de este fine-tune y puede no ser interpretado correctamente por frameworks estándar como LangChain o las funciones nativas de Qwen.
- No se han publicado evaluaciones de sesgos, alucinación o robustez. Como modelo de 4B, es probable que presente alucinaciones en tareas de razonamiento complejo o cuando la información de contexto es insuficiente.
- El dataset de entrenamiento proviene de sesiones de Devin, que pueden contener errores o patrones no representativos de todos los entornos de desarrollo.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías de soporte ni de mantenimiento.
- No se especifica la longitud de contexto del fine-tune; si se hereda la del modelo base (32k), el uso de ventanas largas puede degradar el rendimiento en tareas de agente con muchas llamadas a herramientas.
- El repositorio no incluye pesos cuantizados ni guías de despliegue en producción; la conversión a GGUF u otros formatos queda a cargo del usuario.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/davidnichols-ops/qwen3-4b-devin-sft
- Modelo base Qwen3-4B: https://huggingface.co/Qwen/Qwen3-4B
- Modelo borrador para decodificación especulativa: https://huggingface.co/davidnichols-ops/qwen3-0.6b-devin-draft
- Repositorio oficial de Qwen3: https://github.com/QwenLM/Qwen3
