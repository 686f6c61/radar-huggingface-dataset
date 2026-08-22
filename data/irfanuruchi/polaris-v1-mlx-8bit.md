# Irfanuruchi/Polaris-V1-MLX-8bit

## Resumen

Polaris-V1-MLX-8bit es una conversión en formato MLX de 8 bits del modelo `nitrai-research/Polaris-V1`, un modelo de razonamiento y generación de código entrenado con aprendizaje por refuerzo (RL) sobre la arquitectura Qwen3.5. El modelo original está desarrollado por el proyecto POLARIS, una iniciativa open source mantenida por la Universidad de Hong Kong y ByteDance Seed, centrada en el post-entrenamiento de modelos avanzados de razonamiento. Esta conversión MLX, creada por Irfanuruchi, tiene como objetivo permitir la inferencia eficiente en hardware Apple Silicon, manteniendo la licencia Apache 2.0.

El modelo base cuenta con 1.183.558.656 parámetros (aproximadamente 1.18 mil millones) y soporta inglés y chino. La conversión cuantiza los pesos a 8 bits con un tamaño efectivo de 8.502 bits por peso, reduciendo el peso total a unos 4.2 GB. Esta versión corrige además dos problemas de compatibilidad del checkpoint original: la normalización de la arquitectura `qwen3_5_text` a `qwen3_5` en MLX-LM, y la corrección del token de fin de secuencia para evitar generaciones repetitivas. Los benchmarks declarados en la model card (SWE-bench Verified, WildClawBench y DeepSWE) son heredados del modelo original y no se han reproducido de forma independiente en esta conversión cuantizada.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5 (transformador denso, arquitectura de texto `qwen3_5`) |
| Parametros totales | 1.183.558.656 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | MLX 8-bit (modo affine, group size 64, 8.502 bits/peso) |
| Idiomas soportados | Inglés, chino |
| Licencia | Apache 2.0 |
| Formato de pesos | MLX (safetensors) |

## Arquitectura y entrenamiento

El modelo base `Polaris-V1` se construye sobre la arquitectura Qwen3.5, un transformer denso optimizado para razonamiento y codificación. El post-entrenamiento se realizó mediante aprendizaje por refuerzo (reinforcement learning), con especial foco en tareas de razonamiento agéntico y generación de código. El checkpoint original se identificó como `qwen3_5_text`, que MLX-LM expone como implementación compatible `qwen3_5`. La conversión a MLX 8-bit se realizó en modo affine con un group size de 64, lo que produce un tamaño efectivo de 8.502 bits por peso. Además, se corrigió el token EOS: la configuración original usaba `<|endoftext|>` (248044) mientras que el tokenizador y la plantilla de chat terminan las respuestas con `<|im_end|>` (248046); se normalizó a 248046 para evitar la generación repetida del token de fin.

## Capacidades

- Generación de texto y razonamiento avanzado, con especialización en tareas de codificación y razonamiento agéntico.
- Soporte de tool calling y function calling, heredado de la arquitectura Qwen3.5.
- Capacidades multilingües en inglés y chino.
- Optimizado para tareas de resolución de problemas de software (SWE-bench) y razonamiento multi-archivo (DeepSWE).
- Diseñado para inferencia eficiente en Apple silicon mediante MLX, con soporte de generación en línea de comandos y API Python.

## Casos de uso

- Resolución de issues de software en repositorios reales: el modelo puede analizar el contexto de un repositorio y proponer parches, gracias a su entrenamiento en SWE-bench Verified.
- Asistente de codificación agéntico: puede descomponer tareas complejas en pasos autónomos, como muestra su rendimiento en WildClawBench (tasa de completado del 38.5 %).
- Razonamiento profundo multi-archivo: útil para tareas que requieren entender y modificar código en varios ficheros de un proyecto, según su resultado en DeepSWE (pass@1 de 26.8 %).
- Generación de código en producción con cuantización 8-bit en hardware Apple: con 4.2 GB de peso y 27.44 tokens/segundo en un M3 Pro, es viable para desarrollo local sin GPU dedicada.
- Chat bilingüe (inglés/chino) con capacidades de razonamiento: puede servir como base para asistentes conversacionales técnicos.
- Integración en pipelines de CI/CD para generación de pruebas o análisis de código estático, aprovechando el soporte de tool calling.

## Benchmarks y rendimiento

Los siguientes resultados son los declarados por el autor del modelo original (`nitrai-research/Polaris-V1`) en el model-index de la model card. No se han reproducido de forma independiente para esta conversión cuantizada.

| Benchmark | Tarea | Métrica | Resultado |
|---|---|---|---|
| SWE-bench Verified | Code Generation & Agentic Reasoning | Pass@1 | 31.4 |
| WildClawBench | Autonomous Agentic Trajectories | Task Completion Rate | 38.5 |
| DeepSWE | Deep Multi-File Code Reasoning | Pass@1 | 26.8 |

No se han publicado resultados de benchmarks en la información disponible para comparar directamente con otros modelos de tamaño similar.

## Requisitos de hardware

- VRAM estimada: 4.2 GB de pesos más overhead de inferencia; en Apple silicon se mide memoria unificada pico de 4.63 GB.
- GPU recomendadas: Apple silicon con al menos 8 GB de memoria unificada (M1/M2/M3/M4). El modelo se validó en un MacBook Pro M3 Pro.
- Cabe en consumer GPU: sí, en GPUs con 8 GB de VRAM o más (por ejemplo, RTX 4060, RTX 4070, RTX 4080) usando MLX (aunque MLX está orientado a Apple) o mediante conversión a otros formatos como GGUF.
- Opciones de despliegue: MLX-LM (Python y CLI), `mlx_lm.generate`. Se puede convertir a GGUF con herramientas como llama.cpp para otros entornos.
- Latencia y throughput: 27.44 tokens/segundo en M3 Pro (validado con MLX 0.32.1 y MLX-LM 0.31.3).

## Comparativa con modelos similares

No hay datos de benchmarks comparativos disponibles en la información proporcionada. Como referencia estructural, el modelo base Polaris-V1 se basa en Qwen3.5, por lo que podría compararse con modelos de la familia Qwen de tamaño similar, pero no se dispone de resultados de rendimiento para esta conversión. La comparativa con modelos de código de tamaño ~1B (por ejemplo, Qwen2.5-Coder-1.5B-Instruct o StarCoder2-3B) requeriría ejecutar los mismos benchmarks, lo cual no se ha hecho en esta conversión.

## Limitaciones y advertencias

- Los benchmarks reportados son heredados del modelo original y no han sido reproducidos en esta conversión cuantizada; el rendimiento puede degradarse ligeramente por la cuantización a 8 bits.
- La longitud de contexto no está especificada en la información disponible; se recomienda verificar el límite real antes de desplegarlo en producción con contextos largos.
- El modelo está entrenado principalmente para inglés y chino; su rendimiento en otros idiomas, incluido el español, no está garantizado.
- No se dispone de datos sobre sesgos o riesgos de alucinación específicos; como modelo de generación de texto, puede producir respuestas incorrectas o inventadas, especialmente en razonamiento complejo.
- La licencia Apache 2.0 permite uso comercial, pero se debe citar la atribución adecuada al modelo original y a la conversión.
- La conversión MLX está diseñada para Apple silicon; para otros hardware es necesario convertir los pesos a otros formatos (GGUF, etc.), lo que puede introducir pérdidas adicionales.

## Enlaces

- Repositorio HuggingFace de la conversión: https://huggingface.co/Irfanuruchi/Polaris-V1-MLX-8bit
- Modelo base original: https://huggingface.co/nitrai-research/Polaris-V1
- Proyecto POLARIS (organización en HuggingFace): https://huggingface.co/POLARIS-Project
- Índice de modelos MLX del autor: https://github.com/IrfanUruchi/mlx-models-
- Conversión GGUF de Polaris-V1 (por mradermacher): https://huggingface.co/mradermacher/Polaris-V1-i1-GGUF
