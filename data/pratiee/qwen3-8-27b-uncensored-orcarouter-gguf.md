# pratiee/Qwen3.8-27B-Uncensored-OrcaRouter-GGUF

## Resumen

Este repositorio es una conversión y cuantización no oficial del modelo `orcarouter/Qwen3.8-27B-Uncensored-FP8`, una versión abliterada de Qwen3.8-27B de Alibaba. El autor `pratiee` ha publicado una copia de preservación que incluye el espejo FP8 original, una conversión a BF16, cuatro cuantizaciones GGUF independientes (Q8_0, Q6_K, Q5_K_M, Q4_K_M) y un compañero MTP opcional para decodificación especulativa. No se realizó ningún entrenamiento, ajuste fino o fusión; solo conversión de precisión y cuantización.

El modelo base, Qwen3.8-27B, es un modelo denso de 27.320 millones de parámetros con arquitectura híbrida: atención lineal Gated DeltaNet combinada con atención completa, y una torre de visión integrada. Soporta un contexto máximo de 262.144 tokens, tool calling, control flexible de razonamiento y un cabezal MTP para decodificación especulativa. La abliteración elimina la dirección de rechazo del modelo, por lo que esta versión no tiene alineación de seguridad y puede generar contenido dañino. Se distribuye bajo licencia Apache 2.0, con idiomas inglés y chino.

Este repositorio es relevante para desarrolladores que necesitan ejecutar el modelo localmente con llama.cpp u otros runtimes compatibles, y para investigadores que estudian los efectos de la abliteración en la seguridad y la utilidad de los modelos de lenguaje.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Qwen3_5ForConditionalGeneration (híbrida: Gated DeltaNet linear + full attention) |
| Parámetros totales | 27.320.224.856 |
| Parámetros activos | No aplica (modelo denso) |
| Longitud de contexto | 262.144 tokens (máximo declarado) |
| Tipos de cuantización | FP8 (E4M3), BF16, GGUF Q8_0, Q6_K, Q5_K_M, Q4_K_M |
| Idiomas soportados | Inglés (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (FP8 y BF16) y GGUF (Q8_0, Q6_K, Q5_K_M, Q4_K_M) |

## Arquitectura y entrenamiento

El modelo base `orcarouter/Qwen3.8-27B-Uncensored-FP8` es una versión abliterada de Qwen3.8-27B. La ablación se realiza ortogonalizando la dirección de rechazo de la corriente residual, eliminando la alineación de seguridad del modelo original. El modelo resultante fue cuantizado a FP8 con el mismo esquema que el oficial Qwen3.8-27B-FP8, para que pueda servirse con el mismo kernel de vLLM. Este repositorio no introduce ningún entrenamiento adicional; solo convierte los pesos FP8 a BF16 y genera cuantizaciones GGUF. La arquitectura subyacente es híbrida: una capa de atención lineal Gated DeltaNet para eficiencia y atención completa para tareas que requieren contexto largo. Incluye una torre de visión para entrada multimodal y un cabezal MTP (Multi-Token Prediction) para decodificación especulativa, aunque el compañero MTP se publica como archivo separado y opcional.

## Capacidades

- Generación de texto y razonamiento con control de pensamiento (modo thinking flexible).
- Comprensión y generación de imágenes (modelo visión-lenguaje nativo).
- Tool calling y function calling, preservados tras la ablación.
- Soporte para decodificación especulativa mediante MTP (con el archivo compañero opcional).
- Multilingüe en inglés y chino.
- Contexto largo de hasta 262.144 tokens (depende del runtime y memoria).
- No incluye alineación de seguridad; genera contenido sin restricciones inherentes.

## Casos de uso

- Investigación en interpretabilidad y seguridad: el modelo es útil para estudiar el mecanismo de rechazo en LLMs y cómo la ablación afecta el comportamiento. Se puede ejecutar en entornos controlados para comparar respuestas antes y después de la ablación.
- Red-teaming y evaluación de robustez: permite probar la resistencia de sistemas de moderación externos ante contenido no alineado, simulando ataques adversarios.
- Generación de texto en entornos aislados: para tareas de escritura creativa, lluvia de ideas o generación de contenido en contextos donde no se requieren guardarraíles y se controla el uso.
- Evaluación de cuantizaciones: al ofrecer múltiples niveles GGUF, se puede medir el impacto de la cuantización en la calidad de salida y el rendimiento en diferentes hardware.
- Desarrollo de sistemas de moderación y filtrado: sirve como caso de prueba para verificar que los filtros de contenido detectan y bloquean respuestas dañinas.
- Estudio de sesgos y riesgos de alucinación: al no tener alineación, puede producir alucinaciones más fácilmente, útil para investigar estos fenómenos en modelos grandes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no proporciona métricas de MMLU, HumanEval, GSM8K ni otras pruebas comparativas. La única afirmación de rendimiento es la de OrcaRouter: "262K context, tools + reasoning + MTP preserved", sin datos numéricos.

## Requisitos de hardware

- VRAM estimada para inferencia:
  - Q4_K_M: 16,8 GB (recomendado para GPU de 24 GB)
  - IQ4_XS: 15,3 GB (para GPU de 16 GB)
  - Q3_K_M: 13,5 GB (para contexto con más margen)
  - Las variantes Q6_K y Q8_0 requerirán más memoria, no especificada.
- GPUs recomendadas: RTX 3090/4090 (24 GB) para Q4_K_M; RTX 4080 (16 GB) o similar para IQ4_XS; GPUs de 16 GB o menos para Q3_K_M.
- Se puede ejecutar en CPU con llama.cpp, aunque con menor rendimiento.
- Compatible con Apple Silicon mediante MLX (según fuentes externas).
- Despliegue: llama.cpp (con `--jinja` y `--mmproj` para visión), Ollama (etiqueta disponible), vLLM para la versión FP8 (kernel idéntico al oficial).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de benchmarks para comparar con modelos similares. Sin embargo, se puede comparar estructuralmente con el Qwen3.8-27B original (sin abliteración) y con la versión FP8 oficial.

| Modelo | Parámetros | Contexto | Licencia | Alineación de seguridad |
|---|---|---|---|---|
| Qwen3.8-27B (original) | 27.320M | 262K | Apache 2.0 | Sí |
| Qwen3.8-27B-FP8 (oficial) | 27.320M | 262K | Apache 2.0 | Sí |
| Qwen3.8-27B-Uncensored (este) | 27.320M | 262K | Apache 2.0 | No (abliterado) |

La diferencia principal es la eliminación de la alineación de seguridad. No hay datos de rendimiento adicionales.

## Limitaciones y advertencias

- Modelo abliterado: no tiene alineación de seguridad, generará contenido dañino, ilegal o no ético sin restricciones.
- No es adecuado para producción ni para uso con usuarios finales sin capas externas de moderación y filtrado.
- Riesgo de alucinaciones y de generar información falsa, especialmente en tareas de razonamiento complejo.
- Sesgos heredados del modelo base Qwen3.8-27B, no corregidos por la ablación.
- Idiomas limitados a inglés y chino; otros idiomas pueden tener rendimiento deficiente.
- La conversión BF16 no recupera los pesos originales perdidos por la cuantización FP8 del modelo base; la información puede estar degradada.
- El compañero MTP no es un modelo independiente; solo sirve como borrador para decodificación especulativa.
- La licencia Apache 2.0 permite uso comercial, pero el usuario es responsable de cumplir las leyes aplicables y de añadir medidas de seguridad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/pratiee/Qwen3.8-27B-Uncensored-OrcaRouter-GGUF
- Modelo base directo: https://huggingface.co/orcarouter/Qwen3.8-27B-Uncensored-FP8
- Blog de OrcaRouter sobre ejecución local: https://www.orcarouter.ai/blog/how-to-run-qwen-3-8-27b-uncensored-locally
- Blog de ExplainX sobre MLX: https://www.explainx.ai/blog/orcarouter-qwen3-8-27b-uncensored-mlx-august-2026
- Repositorio GitHub relacionado: https://github.com/Wassimyounes01/qwen38-uncensored
- Modelo original de Qwen: https://huggingface.co/Qwen/Qwen3.8-27B
