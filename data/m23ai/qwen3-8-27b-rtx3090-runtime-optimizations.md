# M23AI/Qwen3.8-27B-RTX3090-Runtime-Optimizations

## Resumen

M23AI publica un snapshot de investigación llamado OLDR (Oracle Layer Draft Repair) para el modelo Qwen 3.8 27B. En lugar de un modelo con pesos, el repositorio ofrece optimizaciones de runtime para ejecutar el modelo base en una sola NVIDIA RTX 3090 con un límite de potencia de 350 W. El objetivo es mejorar la velocidad de generación mediante decodificación especulativa y corrección de predicciones del modelo borrador (draft) con información del modelo principal. No se incluyen pesos entrenados ni un checkpoint para `from_pretrained`.

La relevancia del proyecto radica en permitir inferencia de modelos de 27B en hardware de consumo, sin necesidad de servidores con múltiples GPU. Las mediciones del autor reportan velocidades medias de decodificación de 202,61 tokens/s en un conjunto de ocho tareas de programación. La arquitectura y los datos de entrenamiento del modelo base no se describen en la información disponible; el repositorio se centra en la capa de optimización.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible en la model card; el modelo base se identifica como Qwen 3.8 27B |
| Parámetros totales | 27 mil millones (27B) |
| Parámetros activos | No disponible |
| Longitud de contexto | No disponible en la model card; según el repositorio externo syv-ai, 150k-262k tokens |
| Tipos de cuantización | No especificado en la model card; el repositorio externo menciona int8, int4 y fp16 |
| Idiomas soportados | Ruso e inglés (según metadata de HuggingFace) |
| Licencia | No declarada en la metadata; se incluye archivo LICENSE-APACHE-2.0.txt en el repositorio |
| Formato de pesos | No aplica: no se distribuyen pesos, solo código de optimización |

## Arquitectura y entrenamiento

El repositorio no describe la arquitectura interna del modelo base. El identificador Qwen3.8-27B sugiere un modelo de 27 mil millones de parámetros, pero no se aportan detalles sobre si es un transformer denso, MoE, híbrido, etc. El código de optimización implementa el método OLDR (Oracle Layer Draft Repair), un esquema de decodificación especulativa que corrige las predicciones de una draft model utilizando información de la main model. Según el repositorio externo de syv-ai, el modelo base usado es Qwen2.5-27B-Instruct y la implementación recurre a kernels de GEMM tensor-core en int8, estado DeltaNet en fp16, drafts de MTP (Multi-Token Prediction), lm_head calibrado en int4 y atención de verificación split-KV.

No se proporciona información sobre datos de entrenamiento, tokens ni procesos de RLHF/DPO. Este lanzamiento es únicamente un snapshot de optimizaciones de runtime; no incluye pesos entrenados ni evidencia de mejoras derivadas del entrenamiento de OLDR.

## Capacidades

- Generación de código en tareas de programación (Python, TypeScript, SQL, Go, Zig, Rust, C++, CUDA) a alta velocidad según las mediciones del autor.
- Decodificación especulativa con el método OLDR: usa la información de la main model para corregir las predicciones de la draft model.
- Soporte de contextos largos según el repositorio externo: ventanas de 150k a 262k tokens.
- Inferencia con una sola GPU de consumo (RTX 3090, 24 GB VRAM) mediante cuantización personalizada y kernels optimizados.
- No se ha documentado soporte de tool calling / function calling ni capacidades multimodales (visión, audio) en la información disponible.
- El modelo base puede soportar más idiomas, pero este paquete está etiquetado para ruso e inglés.

## Casos de uso

- Investigación en decodificación especulativa: el snapshot permite estudiar el método OLDR y comparar estrategias de corrección de draft predictions en un entorno de una sola GPU. Es útil para laboratorios que trabajan en optimización de inferencia.
- Autocompletado de código en local: con una RTX 3090 y las optimizaciones, se puede desplegar un asistente de programación para Python, TypeScript o SQL en una estación de trabajo, sin enviar datos a servidores externos, manteniendo una latencia de decodificación inferior a 180-250 tokens/s según la tarea.
- Generación de parches y scripts en herramientas de desarrollo: las mediciones en TypeScript y Go muestran rendimiento suficiente para sugerir parches o recargas de configuración en entornos de desarrollo integrado en tiempo real.
- Análisis de consultas SQL y logs de operaciones: el modelo puede generar consultas o explicar logs en contextos largos, lo que en una RTX 3090 permite procesar fragmentos de base de datos de forma local. Esto puede integrarse en un pipeline de análisis de datos.
- Despliegue de entornos de prueba para CI/CD: si ya se dispone de los pesos base, las optimizaciones de este repositorio permiten ejecutar el modelo en máquinas con una sola GPU, reduciendo el coste de infraestructura frente a clústeres multigpu. Requiere integrarse con vLLM u otro runtime.
- Evaluación de cuantización y kernels personalizados: dado que el paquete incluye scripts de requantización y kernels CUDA, sirve como base para evaluar el impacto de int8, int4 y fp16 en la velocidad de modelos de 27B, especialmente en hardware de consumidor.
- Privacidad de código: para empresas que no pueden enviar código fuente a servicios en la nube, un modelo local en una RTX 3090 puede dar soporte a programación asistida manteniendo los datos en la máquina.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Los datos de rendimiento que se ofrecen son mediciones de velocidad de decodificación realizadas por el autor. El 7 de septiembre de 2026 se midieron ocho tareas con entrada de 74-102 tokens y salida fija de 384 tokens, con `temperature=0` y thinking desactivado. La velocidad de decodificación no incluye el tiempo hasta el primer token. El valor del conjunto se calcula sobre el tiempo total, no como media aritmética.

| Tarea (lenguaje) | Velocidad (tokens/s) |
|---|---|
| Python — índice | 253,56 |
| TypeScript — parche | 242,05 |
| SQL — log de operaciones | 228,98 |
| Go — recarga de configuración | 211,41 |
| Zig — pool de memoria | 201,86 |
| Rust — cola | 181,61 |
| C++ — parser | 180,51 |
| CUDA — scan | 158,43 |
| Conjunto completo | 202,61 |

El repositorio externo de GitHub publica datos adicionales para una configuración similar: ~1.000 tokens/s con 64 solicitudes concurrentes (con GEMMs int8 de tensor-core y estado DeltaNet en fp16), ~114 tokens/s en un solo usuario con muestreo por defecto, ~124 tokens/s en greedy (con drafts MTP, vocabulario de salida propio, lm_head int4 calibrado y atención split-KV), y una ventana de contexto de 150k a 262k. Estos datos provienen de una implementación alternativa y no han sido verificados por el autor del repositorio de HuggingFace.

## Requisitos de hardware

- VRAM estimada: no se proporciona en la model card. El destino explícito es una NVIDIA RTX 3090 de 24 GB con límite de potencia de 350 W.
- El repositorio externo confirma que la configuración está pensada para una RTX 3090 de 24 GB; no se ha establecido compatibilidad con otras GPU.
- Para usar el paquete se necesitan los pesos base del modelo Qwen 3.8 27B (o Qwen2.5-27B-Instruct según la fuente externa), que no se incluyen en el snapshot. Deben caber en 24 GB mediante cuantización (int8/int4 según el repo externo).
- Opciones de despliegue: el repositorio externo menciona vLLM. La model card original no documenta integraciones con llama.cpp, Ollama o TGI.
- Latencia y throughput: los valores de la tabla anterior; no se proporciona TTFT. No hay datos de throughput con concurrencia en la model card, aunque la fuente externa menciona ~1.000 tokens/s con 64 concurrentes.

## Comparativa con modelos similares

No se dispone de datos para una comparativa directa en la información proporcionada. El repositorio externo de GitHub identifica el modelo base como Qwen2.5-27B-Instruct, que podría compararse con otras variantes de 27B, pero no se ofrecen resultados de calidad ni métricas de otros modelos. Por ello, no se incluye una tabla comparativa.

## Limitaciones y advertencias

- Este repositorio no es un modelo listo para `from_pretrained`: no incluye pesos entrenados ni un checkpoint utilizable directamente. Es un snapshot de código de optimización.
- La instalación en una máquina limpia no está confirmada. El código contiene verificaciones de versiones específicas de dependencias y rutas históricas de compilación; la instalación puede fallar fuera del entorno original.
- No se deben colocar todos los archivos del archivo en `PYTHONPATH` sin leer `INSTALL.md`, porque `sitecustomize.py` ejecuta la integración al iniciar Python.
- Los hashes SHA256 confirman la integridad de los archivos, pero no la seguridad de ejecutar código arbitrario. El snapshot contiene módulos Python y bibliotecas CUDA que deben revisarse antes de ejecutarse.
- Las velocidades publicadas son mediciones puntuales del autor, no una afirmación de mejora derivada del entrenamiento de OLDR. No incluyen TTFT ni son comparables con benchmarks de sistemas que sí lo hacen.
- No se han publicado benchmarks de calidad (MMLU, HumanEval, etc.), por lo que no se puede evaluar la precisión del modelo frente a competidores.
- La metadata de HuggingFace no declara licencia para el modelo. El repositorio incluye un archivo LICENSE-APACHE-2.0.txt, pero su alcance exacto no está documentado en la model card. Antes de usar el código en producción o redistribuirlo, conviene revisar las notificaciones de terceros.
- La compatibilidad con otras GPU no está establecida; las optimizaciones pueden depender de características específicas de NVIDIA RTX 3090.
- El paquete está etiquetado para ruso e inglés; si se necesita soporte multilingüe del modelo base, hay que verificar que los pesos base lo ofrezcan, ya que no se documenta aquí.

## Enlaces

- HuggingFace: [M23AI/Qwen3.8-27B-RTX3090-Runtime-Optimizations](https://huggingface.co/M23AI/Qwen3.8-27B-RTX3090-Runtime-Optimizations)
- GitHub (repositorio externo): [syv-ai/qwen38-27b-rtx3090](https://github.com/syv-ai/qwen38-27b-rtx3090)
- DeepWiki (documentación del repositorio externo): [syv-ai/qwen38-27b-rtx3090](https://deepwiki.com/syv-ai/qwen38-27b-rtx3090)
