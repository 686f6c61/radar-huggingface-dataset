# AweAI-Team/CalibForge-35B-A3B

## Resumen

CalibForge-35B-A3B es un modelo de lenguaje especializado en tareas de agente de terminal (terminal-agent), desarrollado por AweAI-Team mediante un ajuste fino supervisado de parámetros completos sobre el backbone Qwen3.5-35B-A3B. Su propósito es resolver tareas ejecutables en entornos de terminal y de ingeniería de software, un dominio donde los modelos generalistas suelen fallar por falta de trayectorias de entrenamiento verificadas y calibradas. El modelo se publica bajo licencia Apache 2.0 y está disponible en Hugging Face con pesos en safetensors y BF16.

La contribución principal no es solo el modelo, sino el pipeline de construcción de datos CalibForge, que utiliza resultados verificados de solucionadores y trayectorias completas para revisar tareas de terminal ejecutables y acercarlas a una zona de aprendizaje relativa al solucionador. A partir de 5.431 tareas calibradas en 16 dominios, se generaron trayectorias multi-turno destiladas que sirvieron para el ajuste fino. El resultado es una mejora medible sobre el modelo base en Terminal-Bench 2.0 (de 39,10% a 47,57%), SWE-bench Pro (de 41,29% a 44,32%) y Doc2Repo (de 44,92% a 48,77%).

El modelo mantiene la arquitectura MoE del backbone Qwen3.5-35B-A3B, con 35.107.181.936 parámetros totales y una ventana de contexto configurada de 262.144 posiciones. Está pensado para despliegues en producción con SGLang y para flujos de trabajo agénticos que requieren ejecución de comandos, edición de código y razonamiento multi-paso sobre repositorios y documentación técnica.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE (qwen3_5_moe) |
| Parámetros totales | 35.107.181.936 |
| Parámetros activos | no disponible |
| Longitud de contexto | 262.144 posiciones configuradas (131.072 tokens en entrenamiento) |
| Tipos de cuantización | no disponible (pesos publicados en BF16) |
| Idiomas soportados | en |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del backbone Qwen3.5-35B-A3B, una red de mezcla de expertos (MoE) con 35.107.181.936 parámetros totales. El número de parámetros activos por token no se especifica en la información disponible. Los pesos se distribuyen en BF16 y el repositorio ocupa 70,2 GB. La ventana de contexto configurada alcanza las 262.144 posiciones, aunque el entrenamiento se realizó con 131.072 tokens de contexto.

El ajuste fino fue de parámetros completos y multi-turno, con 10 épocas, optimizador AdamW (β₁=0,9, β₂=0,999), tasa de aprendizaje de 1,0e-5 con schedule coseno y un ratio de warmup de 0,05, batch global de 128 y 64 GPUs NVIDIA H20. Los datos de entrenamiento provienen del dataset CalibForge, construido a partir de 5.431 tareas de terminal calibradas en 16 dominios, con trayectorias destiladas y resultados de solucionadores verificados. La innovación metodológica es la calibración adversarial del solucionador: las tareas ejecutables se revisan para situarlas en una zona de aprendizaje relativa al solucionador, evitando tareas triviales o imposibles y mejorando la señal de entrenamiento.

## Capacidades

- Generación de texto y razonamiento multi-paso orientado a tareas de terminal y ingeniería de software.
- Ejecución de comandos de terminal y resolución de tareas ejecutables en entornos sandbox.
- Edición y generación de código en repositorios, con resolución de issues y parches (evaluado en SWE-bench Pro).
- Generación de repositorios a partir de documentación técnica (evaluado en Doc2Repo).
- Soporte de tool calling y function calling, con parser `qwen3_coder` en SGLang.
- Soporte de agentes y razonamiento multi-paso con hasta 500 pasos por tarea en la evaluación Terminal-Bench 2.0.
- Capacidades multilingües limitadas al inglés según la model card (idioma declarado: en).
- Modo de razonamiento compatible con el parser `qwen3` en SGLang.

## Casos de uso

- Automatización de tareas de terminal en producción: el modelo puede ejecutar secuencias de comandos, diagnosticar fallos y aplicar correcciones dentro de sandboxes con límites de CPU y RAM, gracias a su entrenamiento específico en trayectorias de terminal verificadas.
- Resolución de issues en repositorios: integrado en pipelines de CI/CD, puede recibir un issue y un checkout del repositorio, localizar el fallo, editar los ficheros relevantes y proponer un parche, con un 44,32% de resolución en SWE-bench Pro.
- Generación de repositorios desde documentación: útil para prototipado rápido a partir de especificaciones técnicas, con una tasa de éxito del 48,77% en Doc2Repo.
- Agentes de operaciones y SRE: el modelo puede gestionar diagnósticos multi-paso con contexto largo (262.144 posiciones) para correlacionar logs, configuración y estado del sistema en una sola sesión.
- Asistente de ingeniería en IDE o CLI: con tool calling y parser `qwen3_coder`, puede integrarse en entornos de desarrollo para sugerir comandos, editar código y validar resultados de ejecución.
- Evaluación y generación de datos sintéticos para agentes: el pipeline CalibForge y las trayectorias destiladas pueden reutilizarse para calibrar y ampliar datasets de entrenamiento de otros agentes de terminal.
- Automatización de tareas de administración de sistemas en 16 dominios: el modelo ha sido entrenado con tareas calibradas en múltiples áreas, lo que permite cubrir flujos heterogéneos de terminal sin ajuste adicional.

## Benchmarks y rendimiento

| Modelo | Terminal-Bench 2.0 Acc. (%) ↑ | SWE-bench Pro Resolved (%) ↑ | Doc2Repo Pass Rate (%) ↑ |
|---|---:|---:|---:|
| Qwen3.5-35B-A3B (base) | 39,10 ± 1,09 | 41,29 | 44,92 ± 1,14 |
| CalibForge-35B-A3B | 47,57 ± 0,99 | 44,32 | 48,77 ± 0,90 |

Terminal-Bench 2.0 y Doc2Repo se reportan como media ± SEM sobre tres ejecuciones; SWE-bench Pro se evaluó una sola vez. Terminal-Bench 2.0 usa CalibForge-Eval con límite de 500 pasos, timeout de una hora por tarea y sandboxes de 16 CPUs y 32 GB de RAM. SWE-bench Pro y Doc2Repo usan sus scaffolds oficiales.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 70 GB solo para pesos, más overhead de KV cache y activaciones; se recomienda un mínimo de 80 GB por réplica.
- GPU recomendadas: NVIDIA H100 80 GB, H200, A100 80 GB o H20. El ejemplo oficial de SGLang usa `--tp 8`, lo que implica 8 GPUs para servir el modelo con tensor parallelism.
- En GPUs de consumo: no cabe en una sola RTX 4090 (24 GB) en BF16. Sería necesario cuantizar a 4 bits (no se documentan pesos GGUF oficiales) o usar múltiples GPUs.
- Opciones de despliegue: SGLang es la opción documentada oficialmente, con parser de razonamiento `qwen3` y parser de tool calling `qwen3_coder`. No se documentan recetas para vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Throughput y latencia: no disponibles. El ejemplo oficial configura `--max-running-requests 40` y `--mem-fraction-static 0.85`, pero no se publican métricas de latencia o tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Contexto | Terminal-Bench 2.0 | SWE-bench Pro | Licencia |
|---|---:|---:|---:|---:|---|
| CalibForge-35B-A3B | 35,1B | 262.144 | 47,57% | 44,32% | Apache 2.0 |
| Qwen3.5-35B-A3B (base) | 35,1B | 262.144 | 39,10% | 41,29% | Apache 2.0 |
| CalibForge-30B-A3B | no disponible | no disponible | no disponible | no disponible | Apache 2.0 |

La comparativa se limita al modelo base y a la variante de 30B del mismo proyecto, ya que no se proporcionan datos de otros modelos comparables en la información disponible.

## Limitaciones y advertencias

- El modelo está declarado únicamente para inglés; el rendimiento en castellano u otros idiomas no está evaluado y probablemente sea inferior.
- Es un ajuste fino especializado en tareas de terminal y agentes; puede degradar capacidades generales de conversación o conocimiento enciclopédico respecto al backbone original, aunque no se documenta una evaluación de regresión.
- Riesgo de alucinación en comandos, rutas y APIs: en entornos de producción debe ejecutarse en sandboxes con límites de recursos y validación de resultados.
- El entrenamiento se realizó con 131.072 tokens de contexto, aunque la ventana configurada es de 262.144; el rendimiento más allá de la longitud de entrenamiento no está verificado.
- SWE-bench Pro se evaluó una sola vez, por lo que su resultado tiene menor robustez estadística que Terminal-Bench 2.0 y Doc2Repo.
- No se documentan pesos cuantizados oficiales (GGUF, AWQ, GPTQ), lo que limita el despliegue en hardware de consumo.
- Aunque la licencia es Apache 2.0, deben respetarse las condiciones del modelo base Qwen3.5-35B-A3B y de los datos de entrenamiento CalibForge.
- El modelo requiere `--trust-remote-code` en SGLang, lo que implica ejecutar código del repositorio; conviene auditar el código antes de desplegarlo en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AweAI-Team/CalibForge-35B-A3B
- Paper: https://arxiv.org/abs/2608.06352
- Repositorio: https://github.com/AweAI-Team/CalibForge
- Dataset: https://huggingface.co/datasets/AweAI-Team/CalibForge
- Modelo de 30B: https://huggingface.co/AweAI-Team/CalibForge-30B-A3B
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-35B-A3B
- Receta Terminal-Bench 2.0: https://github.com/AweAI-Team/AweAgent/tree/main/recipes/terminal_bench_v2
- Receta SWE-bench Pro: https://github.com/AweAI-Team/AweAgent/tree/main/recipes/swe_bench_pro
- Receta Doc2Repo (BeyondSWE): https://github.com/AweAI-Team/AweAgent/tree/main/recipes/beyond_swe
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
