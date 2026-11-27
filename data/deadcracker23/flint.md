# Deadcracker23/flint

## Resumen

Flint es un modelo de lenguaje de tipo mixture-of-experts (MoE) desarrollado por Recursive, disenado especificamente para agentes de codigo: investigacion de bases de codigo, correccion de errores, implementacion de funcionalidades y escritura de tests. Cuenta con 39.800 millones de parametros totales y aproximadamente 2.500 millones activos por token, lo que lo situa en la categoria "40B-A2.5B". Se distribuye bajo licencia Apache 2.0 y esta entrenado desde cero mediante pretraining, mid-training, supervised fine-tuning y reinforcement learning.

El modelo emplea una arquitectura transformer decoder-only con 49 capas (2 densas y 47 MoE), atencion hibrida con 35 capas de ventana deslizante de 513 tokens y 14 capas de atencion completa, y una configuracion de contexto documentada de 262.144 tokens. Incorpora innovaciones como QK RMSNorm por cabeza, attention sinks aprendidos y RoPE solo en las capas de ventana deslizante.

Su relevancia actual radica en su enfoque en tareas agenticas de ingenieria de software, con resultados declarados de 54,9% en Terminal-Bench 2.1, 89,7% en SWE-bench Pro v2 y 74,2% en SWE-bench Verified. El repositorio incluye el checkpoint BF16, configuracion, tokenizer, chat template y un kit de servicio SGLang para NVIDIA B300/H200.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con mixture-of-experts |
| Parametros totales | 39.785.287.456 (39,8B) |
| Parametros activos | Aproximadamente 2,5B por token (cuerpo activo ~2,2B, incluyendo cabeza de salida) |
| Longitud de contexto | 262.144 tokens (prompt + salida) |
| Tipos de cuantizacion | BF16 en el repositorio principal; variantes cuantizadas NVFP4 preparadas por separado para NVIDIA y Apple Silicon |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (BF16) |

## Arquitectura y entrenamiento

Flint es un transformer decoder-only con 49 capas: 2 densas seguidas de 47 capas MoE. Cada capa MoE contiene 256 expertos enrutados, de los cuales se seleccionan 6 por token, mas un experto compartido siempre activo. La atencion es hibrida: 35 capas usan ventana deslizante de 513 tokens (token actual mas 512 precedentes) y 14 capas usan atencion completa. Emplea 32 cabezas de consulta y 4 cabezas clave/valor con dimension de cabeza 128, QK RMSNorm por cabeza y attention sinks aprendidos por cabeza. La codificacion posicional es RoPE en las capas de ventana deslizante y ninguna en las capas de atencion completa. El vocabulario es de 150.144 tokens.

El modelo fue entrenado desde cero mediante pretraining, mid-training, supervised fine-tuning y reinforcement learning. Los datos de entrenamiento incluyen texto y codigo, seguimiento de instrucciones y tareas agenticas. El corte de conocimiento declarado es junio de 2026. El fine-tuning supervisado incluyo ejemplos orientados a seguridad. No se especifica el numero exacto de tokens de entrenamiento ni la composicion detallada del dataset.

## Capacidades

- Generacion de texto y razonamiento con modo de razonamiento explicito (reasoning_content).
- Generacion y edicion de codigo en multiples lenguajes, orientada a tareas de ingenieria de software.
- Uso de herramientas multi-turno (tool calling) compatible con la API de OpenAI.
- Razonamiento agentico multi-paso: investigacion de repositorios, localizacion de bugs, implementacion de cambios y ejecucion de tests.
- Capacidad para mantener conversaciones multi-turno con contexto largo de hasta 262.144 tokens.
- Soporte de decodificacion con presupuesto de salida amplio (al menos 32.768 tokens para problemas complejos, incluyendo razonamiento).
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Agente de correccion de bugs en produccion: el modelo puede recibir un repositorio, reproducir un fallo, localizar la causa e implementar un parche, usando tool calling para ejecutar tests y comandos de terminal. Su contexto de 262.144 tokens permite cargar archivos relevantes y trazas de error en una sola sesion.
- Implementacion de funcionalidades en bases de codigo existentes: con capacidad de explorar el arbol de archivos y entender convenciones del proyecto, Flint puede generar cambios coherentes con el estilo existente y validarlos mediante tests automatizados.
- Generacion de tests unitarios y de integracion: el modelo puede inspeccionar el codigo fuente y producir suites de pruebas, ejecutarlas mediante herramientas y corregir los fallos detectados de forma iterativa.
- Revision de codigo automatizada en pipelines de CI/CD: integrado via API compatible con OpenAI, puede analizar diffs, detectar regresiones y sugerir correcciones antes de fusionar cambios.
- Asistente de terminal para operaciones DevOps: con soporte de tool calling y razonamiento multi-paso, puede traducir instrucciones en lenguaje natural a secuencias de comandos, ejecutarlas y analizar la salida para diagnosticar problemas de infraestructura.
- Migracion y refactorizacion de codigo a gran escala: la ventana de contexto de 262.144 tokens permite procesar modulos completos o multiples archivos relacionados, facilitando refactorizaciones que requieren coherencia entre componentes.
- Atencion al cliente tecnica especializada: puede gestionar conversaciones multi-turno con contexto largo, consultar documentacion mediante herramientas y escalar casos complejos con historial completo.

## Benchmarks y rendimiento

| Benchmark | Flint | Notas |
|---|---|---|
| Terminal-Bench 2.1 | 54,9% | Terminus 2; soluciones via web retrieval contadas como fallidas |
| SWE-bench Pro v2 | 89,7% | mini-swe-agent; promedio pass@1 sobre al menos 5 intentos |
| SWE-bench Verified | 74,2% | mini-swe-agent; promedio pass@1 sobre al menos 5 intentos |

Los resultados se obtuvieron con temperatura 1.0, top-p 0.95 y top-k 20. Las puntuaciones agenticas reportan promedio pass@1 sobre al menos cinco intentos. Las puntuaciones marcadas con † en la model card fueron medidas por Recursive; las de comparacion son reportadas por los desarrolladores. No se proporcionan resultados de MMLU, HumanEval o GSM8K en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 80 GB para los pesos (tamano del repositorio 79,6 GB), mas overhead de KV cache para contexto largo.
- GPU recomendadas: una GPU B300 o H200 por replica, segun el kit SGLang incluido. Se mencionan scripts `serve_b300.sh` y `serve_h200.sh`.
- GPU de consumo: no se indica compatibilidad con GPUs consumer en la informacion proporcionada. Las variantes cuantizadas NVFP4 estan preparadas para runtimes NVIDIA y Apple Silicon, lo que podria reducir requisitos, pero no se detallan cifras.
- Opciones de despliegue: SGLang mediante el kit incluido en `sglang/` (Docker, API compatible con OpenAI). No se mencionan vLLM, llama.cpp, Ollama ni TGI. El codigo de modelado para Transformers no esta incluido todavia.
- Latencia y throughput: no disponibles en la informacion proporcionada. Se advierte que el razonamiento largo puede incrementar la latencia y agotar el presupuesto de salida.

## Comparativa con modelos similares

No se dispone de datos comparativos detallados de modelos alternativos en la informacion proporcionada. La model card menciona comparaciones con "modelos locales que se ejecutan en hardware similar" en una imagen de benchmarks, pero no se incluyen los valores numericos de dichos modelos en el texto. Por tanto, la comparativa cuantitativa no esta disponible.

## Limitaciones y advertencias

- Puede producir contenido incorrecto o danino, codigo defectuoso o llamadas a herramientas inapropiadas, a pesar de incluir ejemplos de seguridad en el fine-tuning supervisado.
- El codigo generado debe probarse y las acciones consecuentes revisarse antes de aplicarlas; la gramatica estructurada de tool calls no impide acciones inseguras.
- El razonamiento largo puede aumentar la latencia y agotar el presupuesto de salida antes de completar la respuesta.
- La configuracion de contexto de 262.144 tokens es un limite de capacidad, no una garantia de precision uniforme en todas las longitudes de secuencia o tareas.
- Los resultados pueden variar segun la precision del checkpoint y el runtime de inferencia; se recomienda evaluar el checkpoint y runtime concretos que se vayan a desplegar.
- No se detallan sesgos conocidos ni el conjunto de idiomas soportados.
- La licencia Apache 2.0 permite uso comercial, pero los terminos de la API alojada y las practicas de datos son independientes de la licencia de los pesos.
- El codigo de modelado para Transformers no esta incluido, lo que limita el uso fuera de SGLang por el momento.

## Enlaces

- Hugging Face: https://huggingface.co/Deadcracker23/flint
- Hugging Face del desarrollador: https://huggingface.co/RecursiveSI
- Blog de lanzamiento: https://www.recursive.com/updates/introducing-recursive-flint
- Motor local (GitHub): https://github.com/recursive-oss/rec
- Documentacion: https://docs.recursive.com/getting-started
- Contacto de soporte: support@recursive.co
