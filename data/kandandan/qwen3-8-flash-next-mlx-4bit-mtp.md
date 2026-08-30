# Kandandan/Qwen3.8-Flash-Next-MLX-4bit-MTP

## Resumen

El modelo `Kandandan/Qwen3.8-Flash-Next-MLX-4bit-MTP` es una conversión a 4 bits para Apple Silicon del modelo Qwen/Qwen3.8-Flash-Next, desarrollada por Kandandan. Su particularidad es que incluye los pesos de MTP (Multi-Token Prediction) en el mismo repositorio, lo que permite activar decodificación especulativa a través del runtime `mlxturbo` con el runner `flash_spec`. Esto resuelve el problema de ejecutar localmente un modelo MoE de 125B parámetros con una latencia aceptable en hardware de consumo profesional de Apple.

El modelo base, Qwen3.8-Flash-Next, es una arquitectura Qwen4 experimental que combina atención híbrida Gated-DeltaNet (GDN) y Qwen-Sparse-Attention (QSA), con 512 expertos y top_k 10. Esta conversión MLX reduce los pesos principales a 4 bits (affine, group_size 64) y añade un módulo MTP en bf16, alcanzando un tamaño total de aproximadamente 77 GB. Es relevante porque permite ejecutar un modelo de nivel frontera en una Mac con 128 GB de memoria unificada, algo inviable con los pesos originales en fp8 o bf16.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen4_exp (MoE híbrido Gated-DeltaNet + Qwen-Sparse-Attention) |
| Parametros totales | 21.347.873.955 (según safetensors de este repo; el modelo base original tiene 125B) |
| Parametros activos | 6B (A6B) |
| Longitud de contexto | 262.144 |
| Tipos de cuantizacion | 4-bit affine, group_size 64 (pesos principales); MTP en bf16 |
| Idiomas soportados | en, ja (según metadatos; el modelo base puede soportar más, no verificado aquí) |
| Licencia | qwen-community-1.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo Qwen/Qwen3.8-Flash-Next, que introduce la familia Qwen4. Se trata de un MoE híbrido que combina Gated-DeltaNet (GDN) con Qwen-Sparse-Attention (QSA), junto con residual streams con compuertas (gated residual streams). El modelo tiene 48 capas, 512 expertos y activa 10 por token (top_k 10), lo que da un total de 125B parámetros con 6B activos. Además, incorpora un embedding n-gram hasheado (PLE) de 51B parámetros, que en esta conversión MLX se trata como un "sidecar" separado y no se incluye en el repositorio.

En cuanto al entrenamiento, no se dispone de datos específicos sobre el número de tokens o la composición del dataset en la información proporcionada. Se sabe que el modelo base es multimodal y está optimizado para razonamiento avanzado. La innovación principal de esta conversión es la inclusión de un módulo MTP de profundidad 1 (`mtp.safetensors`, 5.2 GB en bf16), que permite la decodificación especulativa: el modelo predice varios tokens a la vez y el runtime verifica y acepta o rechaza las predicciones, acelerando la generación.

## Capacidades

- Generación de texto y razonamiento avanzado, heredado del modelo base Qwen3.8-Flash-Next, que según fuentes externas supera a Claude-4.6-Opus (Max) en ciertos benchmarks.
- Decodificación especulativa mediante MTP, activable exclusivamente con `mlxturbo` y el runner `flash_spec`. Con `mlx-lm` estándar, el modelo funciona como generador de texto normal pero sin usar MTP.
- Soporte de contexto largo de 262.144 tokens, adecuado para procesar documentos extensos o codebases completas.
- Capacidades multilingües confirmadas en inglés y japonés. No se especifican otros idiomas en la documentación de esta conversión.
- El modelo base es multimodal, pero esta conversión MLX se centra en generación de texto; no se detalla soporte de visión en esta versión.
- No se especifica soporte de tool calling o function calling en la documentación proporcionada.

## Casos de uso

- Investigación y desarrollo en Apple Silicon: permite ejecutar un modelo de 125B parámetros en local para experimentos de razonamiento, análisis o fine-tuning sin depender de infraestructura en la nube, siempre que se disponga de una Mac con 128 GB de memoria unificada.
- Generación de código con baja latencia: gracias a la decodificación especulativa (speedup de 1.25x en tareas de código), es útil para asistentes de programación o autocompletado en entornos donde la privacidad del código es crítica.
- Análisis de documentos extensos: con 262K de contexto, puede procesar manuales técnicos completos, codebases enteras o largos informes en una sola pasada, resumiendo o extrayendo información relevante.
- Desarrollo de agentes conversacionales en inglés y japonés: ideal para construir asistentes virtuales o chatbots en estos idiomas, aprovechando la capacidad de razonamiento multi-turno del modelo base.
- Prototipado de aplicaciones con requisitos estrictos de privacidad: al ejecutarse íntegramente en local, los datos sensibles no salen del dispositivo, lo que es adecuado para sectores como salud, legal o financiero.
- Tutoría y resolución de problemas matemáticos y lógicos: el modelo base destaca en razonamiento, por lo que puede usarse como tutor automático que explica paso a paso la resolución de problemas complejos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks académicos (MMLU, HumanEval, GSM8K, etc.) en la información disponible para esta conversión MLX. Sin embargo, la model card del autor incluye mediciones de rendimiento de inferencia en un Apple M3 Max con 128 GB, usando generación greedy con 160 tokens por tarea y 10 repeticiones:

| Tarea | Tasa de aceptación (MTP) | Speedup vs. no especulativo |
|---|---|---|
| Prosa (inglés) | 0.720 ± 0.046 | ~1.39x |
| Prosa (japonés) | 0.682 ± 0.047 | ~1.39x |
| Código | 0.564 ± 0.068 | ~1.25x |

La latencia sin decodificación especulativa es de 31.14 ms/token. Con especulación, se estima una latencia de aproximadamente 22.4 ms/token en prosa (31.14 / 1.39). El autor señala que la eficacia de la especulación depende más del tipo de tarea que del idioma, siendo el código la tarea con menor tasa de aceptación.

## Requisitos de hardware

- Memoria unificada: se requieren 128 GB o más, ya que el modelo residente ocupa aproximadamente 77 GB. En máquinas de 96 GB el margen es muy justo, y en 64 GB no es viable.
- Chips compatibles: Apple Silicon (probado en M3 Max; se espera compatibilidad con M4 Max y superiores).
- GPU: no se requiere GPU discreta; se utiliza la GPU integrada del chip Apple Silicon.
- Opciones de despliegue: `mlxturbo` con `--require-runner flash_spec` para activar la decodificación especulativa; `mlx-lm` estándar para generación sin MTP.
- Latencia: 31.14 ms/token sin especulación; ~22.4 ms/token con especulación en tareas de prosa.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | MTP | Licencia | Hardware objetivo |
|---|---|---|---|---|---|
| Kandandan/Qwen3.8-Flash-Next-MLX-4bit-MTP | 21.3B (cuantizado, base 125B) | 262K | Sí | Qwen Community 1.0 | Apple Silicon 128GB |
| Vontra/Qwen3.8-Flash-Next-MLX-4bit | 21.3B (cuantizado, base 125B) | 262K | No | Qwen Community 1.0 | Apple Silicon 128GB |
| Qwen/Qwen3.8-Flash-Next (original) | 125B (MoE, 6B activos) | 262K | No | Qwen Community 1.0 | GPUs de data center (A100/H100) |

La diferencia principal frente a la conversión de Vontra es la inclusión del módulo MTP, que permite acelerar la inferencia mediante decodificación especulativa. Frente al modelo original, esta conversión sacrifica precisión (cuantización a 4 bits) a cambio de poder ejecutarse en hardware de consumo profesional de Apple.

## Limitaciones y advertencias

- Requiere hardware muy específico: sin 128 GB de memoria unificada, el modelo no es utilizable. En 96 GB el rendimiento puede verse comprometido por la falta de margen.
- La decodificación especulativa solo funciona con `mlxturbo` y el runner `flash_spec`. Si se usa `mlx-lm` estándar, el MTP se ignora y la latencia vuelve a ser de 31.14 ms/token.
- La licencia Qwen Community 1.0 impone restricciones comerciales: si el producto supera 100 millones de usuarios activos mensuales o 20 millones de dólares de ingresos mensuales, es obligatorio mostrar el nombre del modelo. Para negocio de Model as a Service o AI Work Assistant, se requiere un contrato adicional con Qwen.
- Idiomas confirmados únicamente en inglés y japonés. El rendimiento en otros idiomas no está verificado en esta conversión.
- El modelo base es multimodal, pero esta conversión MLX no documenta soporte de visión o audio; se limita a generación de texto.
- No se dispone de datos sobre sesgos o alucinaciones específicos de esta conversión, pero al ser una cuantización agresiva (4 bits), es esperable una degradación en tareas de precisión numérica o razonamiento complejo respecto al modelo original.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Kandandan/Qwen3.8-Flash-Next-MLX-4bit-MTP
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Repositorio oficial de Qwen3.8-Flash-Next: https://github.com/QwenLM/Qwen3.8-Flash-Next/
- Runtime MLX y herramientas de cuantización: https://github.com/PipeNetwork/qwen38-flash-next-mlx
- Recetas vLLM para Qwen3.8-Flash-Next: https://recipes.vllm.ai/Qwen/Qwen3.8-Flash-Next
- Guía de ejecución local (Unsloth): https://unsloth.ai/docs/models/qwen3.8-next
