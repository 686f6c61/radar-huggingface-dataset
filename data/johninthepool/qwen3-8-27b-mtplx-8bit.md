# johninthepool/Qwen3.8-27B-MTPLX-8bit

## Resumen

Este modelo es una cuantización a 8 bits en formato MLX del modelo Qwen/Qwen3.8-27B, creada por el usuario johninthepool específicamente para Apple Silicon. Su característica diferencial frente a una conversión estándar con `mlx_lm.convert` es que conserva la cabeza de predicción multi-token (MTP) del modelo original en precisión bf16, en lugar de descartarla silenciosamente como hacen las herramientas de conversión convencionales. Esto permite mantener la decodificación especulativa nativa del modelo, un factor clave para recuperar velocidad de inferencia en hardware unificado.

El modelo resuelve un problema práctico para desarrolladores que trabajan con la arquitectura híbrida de Qwen3.8-27B (atención lineal Gated DeltaNet intercalada con atención Gated Attention) en entornos MLX. Al preservar los 15 tensores MTP, esta build ofrece una calidad de salida casi sin pérdidas respecto a los pesos bf16 originales, con un footprint de aproximadamente 30 GB en disco. Está pensado para equipos con 64 GB o más de memoria unificada, donde prima la fidelidad máxima sobre la huella mínima.

La relevancia actual de esta ficha radica en la creciente adopción de Apple Silicon para inferencia local de modelos grandes. Esta build demuestra que es posible ejecutar un modelo de 27B (aunque los safetensors reflejan 7.566.401.024 parámetros, ver especificaciones) con decodificación especulativa real y contexto de hasta 262.144 tokens, algo que las conversiones MLX estándar no logran por la pérdida silenciosa de la cabeza MTP.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida (Gated DeltaNet linear attention + Gated Attention, 16 grupos 3:1) |
| Parametros totales | 7.566.401.024 (según safetensors; el nombre del modelo indica 27B) |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 tokens (extensible a ~1M con YaRN) |
| Tipos de cuantizacion | 8-bit affine (grupo 64), cabeza MTP en bf16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

La arquitectura base es la de Qwen3.8-27B, un modelo híbrido que intercala capas de atención lineal Gated DeltaNet con capas de atención Gated Attention, organizadas en 16 grupos con una proporción 3:1. Esta combinación busca reducir la complejidad computacional del mecanismo de atención tradicional manteniendo la capacidad de modelado de dependencias a largo plazo. El modelo incorpora una cabeza de predicción multi-token (MTP) que permite la decodificación especulativa nativa.

El proceso de construcción de esta build no implica ningún fine-tuning, destilación ni paso de calibración. Se trata de una cuantización afín directa (redondeo al más cercano) de los pesos bf16 originales de Qwen/Qwen3.8-27B, con la particularidad de que la cabeza MTP se conserva íntegramente en bf16 mediante la política `mtp_policy: keep_bf16`. El cuerpo del modelo se cuantiza a 8 bits con un tamaño de grupo de 64, un nivel que el autor describe como casi sin pérdidas respecto a la fuente. La build fue validada con la suite de verificación `tune` de mtplx, usando la configuración `long-code-uncapped` con 2048 tokens máximos.

## Capacidades

- Generación de texto y conversación multi-turno, con soporte para modos de razonamiento oculto (thinking mode) que pueden activarse o desactivarse según la carga de trabajo.
- Decodificación especulativa nativa gracias a la cabeza MTP conservada en bf16, lo que acelera la generación de tokens sin necesidad de un modelo draft externo.
- Soporte de tool calling y function calling, recomendado para cargas agénticas desactivando el razonamiento (`--reasoning off`) para evitar un gasto excesivo de tokens en pensamiento oculto.
- Manejo de contexto largo nativo de 262.144 tokens, ampliable a aproximadamente 1M con la extensión YaRN.
- Cuantización de la caché KV a 8 bits (`--paged-kv-quantization q8`) para ampliar el contexto útil disponible con una pérdida de calidad despreciable.
- Optimizado para Apple Silicon mediante la librería MLX, con integración directa en el ecosistema mtplx.

## Casos de uso

- Inferencia local en estaciones de trabajo Apple Silicon: ideal para desarrolladores que necesitan ejecutar un modelo de alta capacidad en una Mac Studio o MacBook Pro con 64 GB o más de memoria unificada, sin depender de servicios en la nube.
- Desarrollo de agentes autónomos con tool calling: al desactivar el razonamiento, el modelo puede encadenar llamadas a herramientas de forma eficiente, aprovechando la decodificación especulativa para reducir la latencia en bucles de agente.
- Procesamiento de documentos extensos: con 262.144 tokens de contexto nativo, puede analizar libros completos, codebases grandes o expedientes legales en una sola pasada, manteniendo coherencia a lo largo de todo el documento.
- Generación de código con contexto de proyecto completo: la ventana de contexto amplia permite incluir múltiples archivos de un repositorio para generar o refactorizar código con pleno conocimiento del proyecto.
- Investigación en decodificación especulativa: esta build sirve como banco de pruebas para estudiar el impacto de la cabeza MTP en MLX, comparando el rendimiento frente a conversiones estándar que la descartan.
- Despliegue de asistentes conversacionales privados: al ejecutarse localmente, los datos no salen del equipo, lo que lo hace adecuado para entornos con requisitos estrictos de confidencialidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas como MMLU, HumanEval o GSM8K, ni comparativas de throughput o latencia frente a otras cuantizaciones. El autor solo indica que la calidad de salida es "casi sin pérdidas" respecto a los pesos bf16 originales, basándose en la validación con la suite `tune` de mtplx, pero sin ofrecer números concretos.

## Requisitos de hardware

- Apple Silicon (chip M-series) con 64 GB o más de memoria unificada recomendados para un uso cómodo con contexto largo.
- Tamaño del repositorio: 29.4 GB en disco, aproximadamente el doble que la variante de 4 bits (~17 GB).
- La inferencia se realiza en memoria unificada; no se requiere una GPU discreta, pero el rendimiento escala con el ancho de banda de memoria del chip (por ejemplo, M2 Ultra o M3 Ultra).
- Para aprovechar la decodificación especulativa nativa es imprescindible usar el runtime mtplx. La librería estándar `mlx-lm` puede cargar los pesos del cuerpo, pero ignorará la cabeza MTP y perderá la aceleración.
- Se recomienda activar `--paged-kv-quantization q8` para maximizar el contexto útil sin degradar significativamente la calidad.
- No se dispone de datos de latencia o throughput específicos para esta build en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Footprint | Decodificación especulativa | Licencia |
|---|---|---|---|---|---|---|
| Qwen3.8-27B-MTPLX-8bit (esta build) | 7.566.401.024 (safetensors) | 262.144 | 8-bit affine + MTP bf16 | ~30 GB | Sí (nativa) | Apache 2.0 |
| Qwen3.8-27B-MTPLX-4bit | no disponible | 262.144 | 4-bit + MTP bf16 | ~17 GB | Sí (nativa) | Apache 2.0 |
| Qwen/Qwen3.8-27B (bf16 original) | 27B (según nombre) | 262.144 | bf16 | >50 GB | Sí (nativa) | Apache 2.0 |
| Conversión estándar con mlx_lm.convert | 7.566.401.024 (aprox.) | 262.144 | 8-bit | ~30 GB | No (cabeza MTP descartada) | Apache 2.0 |

La comparativa muestra que esta build de 8 bits es la opción recomendada cuando se dispone de memoria suficiente y se busca máxima fidelidad. La variante de 4 bits reduce el footprint a la mitad a costa de una calidad ligeramente inferior. Frente a una conversión MLX estándar, la ventaja principal es la conservación de la cabeza MTP, que permite mantener la velocidad de generación nativa del modelo.

## Limitaciones y advertencias

- Discrepancia en el número de parámetros: el nombre del modelo indica 27B, pero los safetensors contienen 7.566.401.024 parámetros. Esta diferencia podría deberse a una arquitectura MoE no documentada en la model card o a un error de nomenclatura. Es recomendable verificar este punto antes de confiar en métricas basadas en el nombre.
- Dependencia de mtplx: sin esta herramienta, la cabeza MTP no se utiliza y se pierde la principal ventaja de esta build. `mlx-lm` estándar cargará los pesos pero no ofrecerá decodificación especulativa.
- Requisitos de memoria elevados: los 64 GB de memoria unificada recomendados limitan su uso a equipos de gama alta. En equipos con menos memoria, la variante de 4 bits es más adecuada.
- Sin datos de idiomas soportados ni benchmarks publicados: no es posible evaluar su rendimiento real en tareas específicas ni su cobertura lingüística a partir de la información disponible.
- Riesgo de alucinación y sesgos: al ser una cuantización directa del modelo base, hereda los sesgos y limitaciones de Qwen3.8-27B, que no están documentados en esta ficha.
- Consumo de tokens en modo razonamiento: si se deja activado, el modelo puede gastar una cantidad elevada de tokens por turno en pensamiento oculto, lo que encarece el uso en cargas agénticas. Se recomienda desactivarlo explícitamente.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/johninthepool/Qwen3.8-27B-MTPLX-8bit
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio de mtplx: https://github.com/philipjohnbasile/mtplx
- Variante de 4 bits: https://huggingface.co/johninthepool/Qwen3.8-27B-MTPLX-4bit
