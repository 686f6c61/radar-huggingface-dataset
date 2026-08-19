# adrianmurray/Qwen3.8-27B-MTP-MLX-6bit

## Resumen

`adrianmurray/Qwen3.8-27B-MTP-MLX-6bit` es un artefacto auxiliar de decodificación especulativa, no un modelo de lenguaje completo. Contiene la cabeza de predicción multi-token (MTP) nativa extraída del checkpoint oficial `Qwen/Qwen3.8-27B` (revisión `1d4bf0f2ff6012fd82039f2fa52739d0dd7c60c0`), cuantizada a pesos MLX de 6 bits con esquema affine y tamaño de grupo 64. Esta cabeza se utiliza como borrador especulativo (draft) para acelerar la generación del modelo objetivo, que es el propio Qwen3.8-27B, mediante el runtime Qwen Prime y el verificador DFlash.

El artefacto tiene aproximadamente 93 millones de parámetros y un tamaño de repositorio de 0,3 GB, lo que lo hace extremadamente ligero en comparación con el modelo base de 27B. Su relevancia radica en que permite una verificación especulativa sin pérdidas (lossless) respecto a la política de decodificación configurada: la salida final es idéntica a la decodificación autogregresiva estándar, pero con una latencia potencialmente menor si la tasa de aceptación del draft es alta. No es un modelo entrenado de forma independiente; es la cabeza MTP nativa del checkpoint original, exportada y cuantizada.

Este tipo de componentes es clave para optimizar la inferencia de modelos grandes en hardware local, especialmente en entornos Apple Silicon con MLX, donde la memoria unificada y la aceleración por GPU integrada permiten ejecutar modelos de 27B con cuantización moderada.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cabeza de predicción multi-token (MTP) de una capa, extraída de Qwen3.8-27B |
| Parametros totales | 92.923.392 (~93 M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (depende del modelo base, que soporta 262 000 tokens) |
| Tipos de cuantizacion | Affine 6-bit, group size 64 (MLX) |
| Idiomas soportados | No disponibles (heredados del modelo base) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El artefacto es la cabeza MTP nativa del modelo `Qwen/Qwen3.8-27B`, exportada mediante el script `harness.trainer.export_qwen38_mtp` incluido en el repositorio del autor. No ha sido entrenada por separado; se trata de una capa adicional que el modelo base ya incorpora para predecir múltiples tokens futuros en paralelo. La cuantización a 6 bits affine con group size 64 se aplica posteriormente para reducir el tamaño y acelerar la inferencia en MLX.

La función de esta cabeza es generar un bloque de tokens candidatos (draft) que el verificador DFlash compara contra la distribución del modelo objetivo. Si el bloque es aceptado, la decodificación avanza varios tokens a la vez, reduciendo el número de pasos autogregresivos. El proceso es lossless: la verificación garantiza que la salida final coincide exactamente con la política de decodización configurada (por ejemplo, muestreo o greedy). El runtime `qwen-prime-runtime doctor` verifica el enlace fuente/objetivo y el hash SHA-256 de los pesos antes de su uso.

## Capacidades

- Decodificación especulativa multi-token: acelera la generación del modelo Qwen3.8-27B al proponer bloques de tokens que luego son verificados.
- Verificación lossless: la salida final es idéntica a la decodificación autogregresiva estándar, sin pérdida de calidad.
- Compatibilidad con MLX: diseñado para ejecutarse en Apple Silicon mediante el runtime MLX.
- Integración con Qwen Prime Runtime y DFlash verification.
- No es un modelo autónomo: no genera texto por sí mismo, no soporta tool calling, agentes, visión ni otras capacidades del modelo base.

## Casos de uso

- Aceleración de inferencia local en Apple Silicon: al combinar este artefacto con el modelo base Qwen3.8-27B cuantizado, se puede reducir la latencia de generación en aplicaciones de chat o asistencia en Mac con MLX.
- Despliegue de asistentes de código en entornos con recursos limitados: la decodificación especulativa permite respuestas más rápidas en tareas de autocompletado o generación de código, donde el modelo base ya ofrece capacidades de razonamiento y programación.
- Investigación sobre decodificación especulativa: el artefacto sirve como referencia para estudiar la tasa de aceptación de drafts MTP en distintos workloads y configuraciones de muestreo.
- Optimización de costes en inferencia en edge: al reducir el número de pasos de decodificación, se disminuye el consumo energético y el tiempo de cómputo en dispositivos con GPU integrada.
- Evaluación comparativa de rendimiento: el repositorio de Layr-Labs (`qwen-3.8-mtp-challenge`) utiliza este artefacto como referencia para medir la velocidad de decodificación en MLX.
- Integración en pipelines de generación de texto largo (resúmenes, informes): la menor latencia por token permite procesar documentos extensos de forma más ágil, aprovechando la ventana de contexto de 262 000 tokens del modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para este artefacto MTP en la información disponible. La velocidad de decodificación depende de la tasa de aceptación del draft, que varía según el workload y la política de muestreo. Para el modelo base `Qwen/Qwen3.8-27B` existen evaluaciones públicas (por ejemplo, en tareas de razonamiento matemático como MathVision), pero no se dispone de datos desglosados para este componente auxiliar.

## Requisitos de hardware

- El artefacto en sí ocupa 0,3 GB y tiene ~93 M de parámetros, por lo que cabe en cualquier GPU con al menos 1 GB de VRAM o en memoria unificada de Apple Silicon.
- Para su uso práctico se requiere cargar también el modelo base Qwen3.8-27B. Con cuantización 4-bit, se necesitan aproximadamente 16 GB de VRAM; con 8-bit, unos 28 GB. En Apple Silicon, se recomienda un Mac con 32 GB o más de memoria unificada para ejecutar el modelo base con cuantización moderada.
- GPU recomendadas: Apple M-series (M1 Pro/Max/Ultra o superior) para MLX; en NVIDIA, se puede usar vLLM u otros frameworks si implementan soporte para MTP (no confirmado en la información disponible).
- Opciones de despliegue: MLX (Apple), Qwen Prime Runtime, y potencialmente llama.cpp u Ollama si incorporan soporte para decodificación especulativa con cabezas MTP externas.
- La latencia y el throughput dependen de la tasa de aceptación del draft; en workloads favorables se puede lograr una aceleración de 1,5 a 2 veces respecto a la decodificación autogregresiva estándar, aunque no se dispone de cifras oficiales.

## Comparativa con modelos similares

No disponible. Este artefacto es un componente auxiliar específico para Qwen3.8-27B, no un modelo independiente. Otras implementaciones de decodificación especulativa (por ejemplo, la cabeza MTP de DeepSeek-V3 o los métodos de draft externo como EAGLE) cumplen una función similar, pero no son directamente comparables en parámetros, contexto o licencia sin datos adicionales.

## Limitaciones y advertencias

- No es un modelo autónomo: requiere el modelo base Qwen3.8-27B cargado en memoria; sin él, el artefacto no produce ninguna salida.
- La aceleración no está garantizada: si la tasa de aceptación del draft es baja (por ejemplo, con temperaturas altas o distribuciones muy distintas), la decodificación especulativa puede ser más lenta que la autogregresiva estándar.
- La cuantización 6-bit puede introducir pequeñas diferencias numéricas en las probabilidades propuestas, aunque la verificación lossless asegura que la salida final coincide con la política de decodificación configurada.
- No se han publicado evaluaciones de sesgos, alucinación o robustez para este artefacto; dichos riesgos corresponden al modelo base.
- Licencia Apache 2.0 permite uso comercial, pero se debe respetar la licencia del modelo base (también Apache 2.0) y las condiciones de uso de Alibaba Cloud.
- El artefacto está vinculado a una revisión específica del modelo base (`1d4bf0f2ff6012fd82039f2fa52739d0dd7c60c0`); usarlo con otra revisión puede requerir re-exportación.

## Enlaces

- HuggingFace: https://huggingface.co/adrianmurray/Qwen3.8-27B-MTP-MLX-6bit
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio del challenge de Layr-Labs: https://github.com/Layr-Labs/qwen-3.8-mtp-challenge
- Blog de AMD sobre soporte Day 0: https://www.amd.com/en/blogs/2026/run-qwen-3-8-27b-on-amd-ryzen-ai-max-and-radeon-graphics-cards-day-0.html
- Guía de ejecución local (Ollama, GGUF): https://www.yottalabs.ai/post/how-to-run-qwen-3-8-27b-locally-ollama-gguf-single-gpu-2026
- Ficha en LM Studio: https://lmstudio.ai/models/qwen3.8
