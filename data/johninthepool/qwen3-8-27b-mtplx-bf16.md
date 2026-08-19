# johninthepool/Qwen3.8-27B-MTPLX-bf16

## Resumen

El modelo `johninthepool/Qwen3.8-27B-MTPLX-bf16` es una conversión nativa a formato MLX del modelo base `Qwen/Qwen3.8-27B`, realizada por el usuario johninthepool. Se trata de una build en precisión completa bf16, sin cuantización, pensada exclusivamente para Apple Silicon. Su principal característica es que conserva la cabeza de predicción multi-token (MTP) del modelo original, lo que permite utilizar decodificación especulativa de forma nativa a través de la herramienta `mtplx`.

Este modelo resuelve el problema de la pérdida de los tensores MTP al convertir pesos de PyTorch a MLX mediante rutas genéricas. Al mantener la cabeza MTP intacta y el cuerpo sin cuantizar, ofrece la máxima fidelidad respecto al modelo fuente, a costa de un gran consumo de memoria (aproximadamente 55 GB en RAM). Es relevante para desarrolladores que trabajan con Apple Silicon y necesitan ejecutar un modelo de 27B parámetros con calidad sin pérdidas y con aceleración por decodificación especulativa.

La arquitectura subyacente es la del modelo Qwen3.8-27B, un transformer denso de aproximadamente 26.9 mil millones de parámetros. No se ha realizado ningún fine-tuning ni cambio de precisión más allá de la conversión de formato, por lo que la salida se espera numéricamente equivalente al modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (basado en Qwen/Qwen3.8-27B) |
| Parametros totales | 26.895.993.856 (~26.9B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | bf16 (sin cuantizar); existen variantes 8-bit y 4-bit del mismo autor |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | MLX (safetensors) |

## Arquitectura y entrenamiento

El modelo es una conversión directa de los pesos de `Qwen/Qwen3.8-27B` al formato MLX, sin ningún tipo de entrenamiento adicional, destilación o cambio de precisión. La arquitectura corresponde a la del modelo base, un transformer denso de 27B parámetros, aunque los detalles concretos (número de capas, dimensiones, tipo de atención) no se especifican en la información proporcionada.

La innovación principal de esta build es la preservación de la cabeza de predicción multi-token (MTP), compuesta por 15 tensores adicionales. Esta cabeza permite la decodificación especulativa, una técnica que acelera la generación de texto al predecir varios tokens a la vez. En esta versión, tanto el cuerpo del modelo como la cabeza MTP se mantienen en bf16, sin cuantización, garantizando la máxima fidelidad numérica respecto al modelo original.

## Capacidades

- Generación de texto conversacional: el modelo está etiquetado como `conversational` y `text-generation`, por lo que es adecuado para tareas de diálogo y generación de lenguaje natural.
- Decodificación especulativa nativa: gracias a la cabeza MTP conservada, puede acelerar la inferencia mediante predicción multi-token cuando se usa con `mtplx`.
- Ejecución en Apple Silicon: al estar en formato MLX, se carga directamente en Macs con chips M-series sin necesidad de conversión adicional.
- Compatibilidad con cuantización de KV cache: el comando de uso recomendado incluye `--paged-kv-quantization q8`, lo que sugiere soporte para cuantización de la caché de atención para reducir memoria.
- Sin pérdida de calidad por cuantización: al ser bf16 completo, no hay degradación introducida por la conversión.

## Casos de uso

- Asistentes conversacionales locales en Mac: el modelo puede alimentar chatbots o asistentes personales que se ejecutan íntegramente en un Mac con 64 GB o más de memoria unificada, aprovechando la decodificación especulativa para reducir la latencia.
- Prototipado de aplicaciones de IA generativa: al ser una conversión sin cambios, sirve para validar comportamientos del modelo Qwen3.8-27B en entornos Apple Silicon antes de desplegar en producción con otras infraestructuras.
- Investigación sobre decodificación especulativa: la preservación de la cabeza MTP permite experimentar con esta técnica en un modelo de 27B sin necesidad de cuantizar, lo que facilita el estudio de su impacto en calidad y velocidad.
- Generación de código y texto técnico: aunque no se especifican capacidades concretas, un modelo de 27B de la familia Qwen suele manejar tareas de programación y redacción técnica; se puede usar para autocompletado o generación de documentación.
- Evaluación de calidad de modelos cuantizados: al comparar esta versión bf16 con las variantes 8-bit y 4-bit del mismo autor, se puede medir el impacto de la cuantización en tareas específicas.
- Despliegue en entornos con requisitos estrictos de reproducibilidad: al ser numéricamente equivalente al modelo original, es útil cuando se necesita una salida idéntica a la versión PyTorch en un Mac.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Apple Silicon Mac (M-series) con 64 GB o más de memoria unificada recomendada.
- Los pesos bf16 completos ocupan aproximadamente 55 GB en disco y en memoria antes de la caché KV.
- Se requiere la herramienta `mtplx` para utilizar el camino nativo de decodificación especulativa MTP.
- El comando de uso sugerido incluye cuantización de la caché KV a q8, lo que puede reducir el consumo de memoria durante la inferencia.
- No se proporcionan datos de latencia ni throughput.

## Comparativa con modelos similares

| Modelo | Precisión | Tamaño en memoria | Requisitos | Uso |
|---|---|---|---|---|
| Qwen3.8-27B-MTPLX-bf16 (este) | bf16 completo | ~55 GB | Apple Silicon 64GB+ | Máxima fidelidad, decodificación especulativa |
| Qwen3.8-27B-MTPLX-8bit | 8-bit | ~27 GB (aprox.) | Apple Silicon 64GB+ | Casi sin pérdida, menor huella |
| Qwen3.8-27B-MTPLX-4bit | 4-bit | ~14 GB (aprox.) | Apple Silicon 32GB+ (estimado) | Máximo rendimiento, pequeña pérdida de calidad |
| Qwen/Qwen3.8-27B (original) | bf16 (PyTorch) | ~55 GB | GPU/CPU con soporte PyTorch | Modelo fuente, sin conversión MLX |

Nota: los tamaños de las variantes 8-bit y 4-bit son estimaciones basadas en la descripción de la model card ("roughly half the footprint" y "smallest footprint"), no en datos exactos.

## Limitaciones y advertencias

- Consumo de memoria muy elevado: requiere al menos 64 GB de memoria unificada, lo que limita su uso a Mac de gama alta.
- Sin datos sobre sesgos o alucinaciones: al ser una conversión sin cambios, hereda las limitaciones del modelo base, pero no se dispone de información específica sobre ellas.
- Dependencia de `mtplx`: para aprovechar la decodificación especulativa es necesario usar esta herramienta, que puede no estar tan extendida como otros runners (llama.cpp, Ollama).
- Sin benchmarks publicados: no hay métricas objetivas que permitan comparar su rendimiento con otras implementaciones.
- Fecha de creación futura: el modelo fue creado el 14 de agosto de 2026, lo que puede indicar que es una versión reciente o experimental.
- Licencia Apache 2.0: permite uso comercial, pero se debe verificar la licencia del modelo base Qwen3.8-27B para asegurar el cumplimiento.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/johninthepool/Qwen3.8-27B-MTPLX-bf16)
- [Variante 8-bit](https://huggingface.co/johninthepool/Qwen3.8-27B-MTPLX-8bit)
- [Variante 4-bit](https://huggingface.co/johninthepool/Qwen3.8-27B-MTPLX-4bit)
- [Modelo base Qwen/Qwen3.8-27B](https://huggingface.co/Qwen/Qwen3.8-27B)
- [Repositorio mtplx](https://github.com/philipjohnbasile/mtplx)
