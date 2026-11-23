# saulpzh/Meta-Task-17B

## Resumen

Meta-Task-17B es un ajuste fino de Qwen3-14B desarrollado por saulpzh para la resolución de tareas de terminal (terminal tasks) mediante agentes. El modelo acompaña al artículo "Meta-Task: Turning Terminal Task Synthesis into a Terminal Task for Scalable Agent Training" (arXiv:2607.27929) y se entrena sobre 3.221 trayectorias sintetizadas por el framework Meta-Task, con el objetivo de mejorar la capacidad del modelo base para operar en entornos de línea de comandos y tareas de tipo code-agent.

El modelo parte de la arquitectura transformer densa de Qwen3-14B, con 14.768.307.200 parámetros totales según los pesos en safetensors, y se distribuye en formato safetensors bajo licencia Apache-2.0. Aunque el nombre comercial indica "17B", el recuento real de parámetros corresponde a la base Qwen3-14B; el identificador de Hugging Face es saulpzh/Meta-Task-17B mientras que la model card se refiere internamente a Meta-Task-14B.

Su relevancia actual radica en el entrenamiento de agentes para tareas de terminal: el modelo reporta un 22,5 % de Avg Pass@1 en Terminal-Bench 2.0 (scaffold Terminus-2, modo non-thinking), frente al 5,2 % del Qwen3-14B base, lo que supone una mejora sustancial en un dominio históricamente difícil para modelos de tamaño medio.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3), ajuste fino con LoRA SFT |
| Parámetros totales | 14.768.307.200 |
| Parámetros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (entrenado con secuencias de 40.960 tokens) |
| Tipos de cuantización | No disponible |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

El modelo se construye sobre Qwen3-14B, un transformer denso de la familia Qwen3, y se ajusta mediante LoRA SFT con el framework SWIFT. La configuración de LoRA emplea rango/alpha de 64/128, dropout de 0,05, learning rate de 1e-4, scheduler coseno, 5 épocas, longitud de secuencia de 40.960 tokens y precisión BF16. El entrenamiento se ejecutó en 8 GPU A100 de 80 GB con DeepSpeed ZeRO-3.

Los datos de entrenamiento consisten en 3.221 trayectorias sintetizadas por el framework Meta-Task, publicadas en el dataset saulpzh/Meta-Task-Data. El objetivo del framework es convertir la síntesis de tareas de terminal en una tarea de terminal en sí misma, generando trayectorias de agente escalables para el entrenamiento. No se especifica en la información disponible la composición detallada del dataset ni si se aplicaron fases de RLHF o DPO posteriores al SFT.

## Capacidades

- Generación de texto conversacional en inglés.
- Resolución de tareas de terminal y operación en entornos de línea de comandos (terminal-agents).
- Agente de código (code-agent): ejecución de comandos, manipulación de ficheros y flujos de trabajo de desarrollo.
- Síntesis de tareas (task-synthesis), coherente con el framework Meta-Task empleado en su entrenamiento.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Razonamiento multi-paso y agentes: orientado explícitamente a trayectorias de agente en terminal.
- Capacidades multilingües: limitadas al inglés según la model card.
- Modo thinking: el resultado reportado corresponde a modo non-thinking; no se detalla soporte de thinking mode.

## Casos de uso

- Automatización de tareas de administración de sistemas: el modelo puede interpretar instrucciones en lenguaje natural y traducirlas en secuencias de comandos de terminal, aprovechando su entrenamiento específico en trayectorias de terminal para reducir errores en operaciones de ficheros, procesos y paquetes.
- Agente de CI/CD: integración en pipelines para ejecutar comandos de build, test y despliegue, con capacidad de reaccionar a errores de terminal y proponer correcciones dentro de un bucle de agente.
- Asistente de desarrollo en entornos remotos: uso en shells interactivas o sesiones SSH donde el modelo genera y ejecuta comandos, adecuado por su especialización en code-agent y terminal-agents.
- Generación de scripts de automatización: creación de scripts de shell y utilidades de línea de comandos a partir de descripciones de alto nivel, con contexto de hasta 40.960 tokens durante el entrenamiento para manejar ficheros y salidas extensas.
- Evaluación y benchmarking de agentes: modelo de referencia para reproducir los resultados de Terminal-Bench 2.0 con el scaffold Terminus-2 y comparar estrategias de síntesis de datos.
- Investigación en síntesis de tareas: uso del modelo junto al framework Meta-Task para generar nuevas trayectorias de entrenamiento y estudiar la escalabilidad del entrenamiento de agentes.
- Soporte técnico basado en terminal: resolución de incidencias reproducidas en entornos de línea de comandos, donde el modelo diagnostica y aplica comandos correctivos.

## Benchmarks y rendimiento

| Benchmark | Meta-Task-17B | Qwen3-14B (base) |
|---|---|---|
| Terminal-Bench 2.0 (Terminus-2, non-thinking), Avg Pass@1 | 22,5 % | 5,2 % |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 29,5 GB solo para pesos (14.768.307.200 parámetros × 2 bytes), más overhead de activaciones y KV cache.
- VRAM estimada en cuantización de 8 bits: alrededor de 15 GB para pesos; en 4 bits, alrededor de 8 GB, aunque no se documentan cuantizaciones oficiales publicadas.
- GPU recomendadas: A100 80 GB u H100 para BF16 sin cuantizar; A100 40 GB o RTX 6000 Ada para 8 bits.
- GPU de consumo: no cabe en BF16 en GPU de consumo de 24 GB (RTX 4090); podría caber en cuantización de 4 bits, sujeta a disponibilidad de pesos cuantizados no confirmada.
- Opciones de despliegue: transformers (referencia en la model card), text-generation-inference (tag endpoints_compatible), y previsiblemente llama.cpp/Ollama/vLLM si se generan pesos GGUF o se soporta la arquitectura Qwen3, aunque no se confirma en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Meta-Task-17B | 14.768.307.200 | No disponible | 22,5 % Avg Pass@1 en Terminal-Bench 2.0 | Apache-2.0 | Hugging Face |
| Qwen3-14B (base) | 14B (aprox.) | No disponible | 5,2 % Avg Pass@1 en Terminal-Bench 2.0 | Apache-2.0 | Hugging Face |
| Meta-Task-32B | No disponible | No disponible | No disponible | Apache-2.0 (según model card del proyecto) | Hugging Face |

No se dispone de datos de otros modelos comparables de la misma categoría (agentes de terminal) en la información proporcionada.

## Limitaciones y advertencias

- El modelo está entrenado y evaluado únicamente en inglés; no se garantiza un comportamiento correcto en castellano u otros idiomas.
- Riesgo de alucinación en la generación de comandos: un comando incorrecto en un entorno de terminal puede causar daños irreversibles, por lo que se recomienda sandboxing y revisión humana.
- El rendimiento reportado (22,5 % Pass@1) implica que aproximadamente 3 de cada 4 tareas de Terminal-Bench 2.0 no se resuelven correctamente; no es adecuado para automatización sin supervisión en producción crítica.
- El ajuste fino se realizó con LoRA SFT sobre 3.221 trayectorias; no se documentan fases de alineación adicional (RLHF/DPO) que mitiguen sesgos o comportamientos indeseados.
- La licencia Apache-2.0 permite uso comercial, pero el modelo base Qwen3-14B conserva sus propias condiciones, que deben verificarse.
- No se documentan tipos de cuantización oficiales ni pesos GGUF, lo que puede limitar el despliegue en hardware de consumo.
- El nombre del repositorio (17B) no coincide con el recuento real de parámetros (14,77B), lo que puede generar confusión en la selección de hardware.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/saulpzh/Meta-Task-17B
- Modelo base: https://huggingface.co/Qwen/Qwen3-14B
- Artículo: https://arxiv.org/abs/2607.27929
- Código oficial: https://github.com/goodmanpzh/meta-task
- Dataset: https://huggingface.co/datasets/saulpzh/Meta-Task-Data
- Meta-Task-32B: https://huggingface.co/saulpzh/Meta-Task-32B
