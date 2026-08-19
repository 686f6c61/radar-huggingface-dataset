# h3rb3rn/moe-expert-coder-4b

## Resumen

`moe-expert-coder-4b` es un modelo de lenguaje especializado en ingeniería de software de alta garantía, desarrollado por el usuario h3rb3rn como parte de la arquitectura compuesta "MoE Sovereign". Se trata de un SLM (Small Language Model) de 4.200 millones de parámetros destilado de los modelos DeepSeek-Coder-V2 (236B) y DeepSeek-V3, entrenado sobre el supercomputador LUMI-G con 8 GPUs AMD Instinct MI250X de 128 GB. Su propósito es generar código sintácticamente válido, producir diffs unificados atómicos, cumplir con linters estrictos y diagnosticar stack traces de forma fiable.

El modelo se basa en la arquitectura híbrida de Qwen3.5-4B, que combina atención lineal y capas Mamba, y ha sido afinado mediante LoRA sobre un conjunto de datos de 32.500 trayectorias de código validadas por AST y verificación de ejecución con pytest. Aunque su tamaño es reducido, está orientado a tareas de refactorización, generación de código determinista y corrección de errores en entornos de producción, lo que lo hace relevante para desarrolladores que necesitan un asistente de código ligero y ejecutable en hardware modesto.

El modelo se distribuye en formato safetensors y GGUF (Q4_K_M y Q8_0), con licencia Apache-2.0, y soporta los idiomas inglés y alemán. A fecha de su publicación no registra descargas ni valoraciones, lo que indica que se trata de un proyecto experimental.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5-4B hybrid (linear attention + Mamba) |
| Parametros totales | 4.205.751.296 (4,2 B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No especificada; el autor recomienda 262144 tokens en Ollama |
| Tipos de cuantizacion | Q4_K_M, Q8_0 (GGUF) |
| Idiomas soportados | en, de |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-4B, cuya arquitectura híbrida combina mecanismos de atención lineal con capas Mamba, lo que permite manejar secuencias largas con un coste computacional reducido frente a la atención completa. Sobre esta base se aplicó un ajuste fino con LoRA (r=16, alpha=32, dropout 0.05) en las proyecciones q, k, v, o, gate, up y down. El entrenamiento se realizó en el supercomputador LUMI-G con 8 GPUs AMD Instinct MI250X de 128 GB, utilizando DeepSpeed ZeRO-2, ROCm 7.0 y PyTorch 2.6.

El proceso de destilación empleó como profesores a DeepSeek-Coder-V2 (236B) y DeepSeek-V3, generando un conjunto de datos de 32.500 trayectorias de síntesis de código y refactorización, cada una validada mediante parseo de AST y verificación de ejecución con pytest. Se entrenó durante 3 épocas con un batch efectivo de 128, una tasa de aprendizaje de 1.5e-5 con decaimiento coseno y warmup. La pérdida final fue de 0.0106 y la precisión de token alcanzó el 99.62 %. El adaptador resultante se fusionó con los pesos base en BF16 y posteriormente se convirtió a GGUF en las cuantizaciones Q4_K_M y Q8_0.

## Capacidades

- Generación de código determinista en Python, Rust, Go, TypeScript y C++ con firmas de tipo explícitas y manejo defensivo de errores.
- Refactorización de código conforme al árbol sintáctico (AST), produciendo diffs unificados atómicos con rangos de línea exactos y contexto coincidente.
- Cumplimiento de linters y comprobadores de tipos estrictos: mypy, ruff, clippy y eslint.
- Diagnóstico de stack traces y logs de ejecución multi-capa, con generación de parches mínimos y verificados mediante pruebas de regresión.
- Integración con MCP (Model Context Protocol) para generar payloads de ejecución de código listos para sandbox.
- Soporte de tool calling y ejecución de código en entornos controlados.
- Capacidad multilingüe limitada a inglés y alemán, aunque su dominio principal es el código fuente.

## Casos de uso

- Generación de microservicios en producción: el modelo sintetiza servicios completos con manejo explícito de errores y tipado estricto, adecuado para integrarse en pipelines de despliegue continuo.
- Refactorización automática de código legacy: produce diffs quirúrgicos que respetan la estructura AST, reduciendo el riesgo de romper la sintaxis en repositorios grandes.
- Revisión estática de código en CI/CD: puede generar código que cumple automáticamente con mypy, ruff o clippy, ahorrando iteraciones en las fases de linting.
- Diagnóstico de errores en sistemas distribuidos: dado un stack trace multi-capa, el modelo identifica la causa raíz y propone un parche mínimo con pruebas de regresión.
- Asistente de programación en IDE: integrable como plugin para autocompletar funciones con tipos y validación AST, mejorando la productividad del desarrollador.
- Automatización de mantenimiento de código: generación de parches para vulnerabilidades conocidas o actualizaciones de dependencias, con diffs listos para revisión humana.
- Generación de pruebas unitarias: a partir de una función o módulo, el modelo puede crear casos de prueba con cobertura de bordes, aunque esta capacidad no está explícitamente documentada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con cuantización Q4_K_M, el modelo ocupa aproximadamente 2,5-3 GB; en BF16 (safetensors) requiere unos 8-9 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para la versión Q4 (p. ej., NVIDIA GTX 1650, RTX 3050) y 10-12 GB para BF16 (p. ej., RTX 3080, RTX 4090, A10). También es compatible con GPUs AMD gracias a ROCm.
- Sí cabe en GPUs de consumo: la versión Q4_K_M puede ejecutarse en tarjetas de gama media como la RTX 3060 o superiores.
- Opciones de despliegue: llama.cpp, Ollama (con Modelfile proporcionado), transformers con `trust_remote_code=True`, y potencialmente vLLM si se adapta a la arquitectura híbrida.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia |
|---|---|---|---|---|
| moe-expert-coder-4b (este) | 4,2 B | No especificado | Código de alta garantía, refactorización, diffs AST | Apache-2.0 |
| Qwen3.5-4B (base) | 4,2 B | No especificado | Generalista | Apache-2.0 |
| DeepSeek-Coder-1.3B | 1,3 B | 16K | Generación de código | MIT |
| CodeLlama-7B | 7 B | 16K | Generación de código | Llama 2 license |

La comparativa se basa en características generales, ya que no se dispone de benchmarks publicados para moe-expert-coder-4b. Frente al Qwen3.5-4B base, este modelo está especializado en tareas de ingeniería de software, priorizando la validez sintáctica y la precisión de diffs sobre la generación de texto libre.

## Limitaciones y advertencias

- Sesgos: al entrenarse sobre datos de código, puede heredar sesgos presentes en los repositorios fuente, como patrones de código inseguro o dependencias obsoletas.
- Riesgo de alucinación: aunque el autor afirma reducir la alucinación en diffs, no hay garantía de que el código generado sea siempre correcto o seguro; se recomienda revisión humana.
- Limitaciones de contexto: la longitud de contexto nativa no está documentada; el valor de 262144 tokens sugerido en Ollama es una configuración del usuario, no una especificación del modelo.
- Limitaciones de idioma: solo soporta inglés y alemán, lo que restringe su uso en otros idiomas.
- Restricciones de licencia: Apache-2.0 permite uso comercial sin restricciones, pero el modelo se basa en Qwen3.5-4B, que también es Apache-2.0, por lo que no hay conflicto conocido.
- Estado experimental: el modelo no tiene descargas ni valoraciones, y la fecha de creación es futura (2026), lo que sugiere que es un proyecto reciente y no probado en producción.
- Dependencia de `trust_remote_code`: para cargar el modelo con transformers es necesario activar esta opción, lo que implica ejecutar código remoto con riesgos de seguridad asociados.

## Enlaces

- HuggingFace: https://huggingface.co/h3rb3rn/moe-expert-coder-4b
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Dataset de entrenamiento: https://huggingface.co/datasets/moe-sovereign/expert-coder-sft
- Supercomputador LUMI-G: https://www.lumi-supercomputer.eu/
