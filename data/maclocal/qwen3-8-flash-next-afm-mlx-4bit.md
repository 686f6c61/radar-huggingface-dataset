# maclocal/Qwen3.8-Flash-Next-AFM-MLX-4bit

## Resumen

El modelo Qwen3.8-Flash-Next-AFM-MLX-4bit es una conversión MLX AFM-native del checkpoint experimental Qwen/Qwen3.8-Flash-Next, desarrollada por maclocal. Se trata de un modelo multimodal de tipo image-text-to-text con 129.435.434.899 parámetros (aproximadamente 129.4B), que preserva la torre de visión, el predictor MTP (multi-token prediction) nativo y el embedding n-gram mapeado en un único repositorio autocontenido. La conversión utiliza cuantización affine 4-bit para las proyecciones principales y el LM head en 8-bit, con la torre de visión en BF16. Es un artefacto experimental destinado a una futura versión del runtime AFM (maclocal-api) y no es compatible con los lanzamientos públicos actuales de MLX. Su relevancia radica en que ofrece una implementación práctica de la arquitectura híbrida que dará soporte a Qwen4, con soporte de decodificación especulativa MTP y tabla n-gram para acelerar la inferencia en Apple Silicon.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Híbrida con QSA (Gated DeltaNet + Gated Attention), según README del modelo base; conversión AFM MLX |
| Parámetros totales | 129.435.434.899 (≈129.4B) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | AFM affine 4-bit (grupo 64) en proyecciones LM y MTP; LM head affine 8-bit (grupo 64); tabla n-gram affine 4-bit (grupo 32); torre de visión en BF16 |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 (Qwen Community License 1.0) |
| Formato de pesos | safetensors (MLX), con archivo ngram_table.ngram |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura experimental de Qwen3.8-Flash-Next, descrita en el README original como una arquitectura híbrida con atención QSA, que combina Gated DeltaNet y Gated Attention. El checkpoint es post-entrenado y se distribuye en formato Hugging Face Transformers. No se proporcionan detalles sobre los datos de entrenamiento ni sobre procesos de alineación como RLHF o DPO.

Esta conversión AFM mantiene el predictor MTP nativo, la tabla n-gram mapeada y los metadatos de enrutamiento PLE (integer) preservados exactamente como I64. El proceso de conversión se realiza mediante la herramienta `afm mlx-convert` implementada en Swift, que utiliza cuantización affine de MLX sin invocar Python. El diseño del n-gram mapeado y la carga del MTP in-checkpoint se atribuyen a la implementación `ddalcu/mlx-serve` (commit 805807669565d359188b329c659f9f45d6358cd7).

## Capacidades

- Generación de texto autoregresiva con soporte de modo de pensamiento (think), que puede desactivarse mediante `--no-think` en el runtime AFM.
- Comprensión multimodal (image-text-to-text) gracias a la torre de visión preservada en BF16; la calidad de visión no fue evaluada en la validación.
- Decodificación especulativa nativa con MTP (multi-token prediction) y profundidad configurable (por ejemplo, `--mtp-depth 3`), con verificación en modo singleton o batched.
- Mapeo de tabla n-gram para acelerar la generación, con opciones de residencia en memoria (`mapped` o `prewarm`).
- Metadatos de enrutamiento PLE preservados como enteros I64, lo que sugiere una arquitectura con expertos, aunque no se especifica el número de parámetros activos.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Soporte de tool calling y agentes: no documentado en esta conversión; la versión oficial Qwen3.8-Flash incluye herramientas integradas.

## Casos de uso

- **Inferencia local en Apple Silicon con MLX**: el modelo puede ejecutarse en Macs con memoria unificada suficiente (la validación usó un M3 Ultra con 512 GB) mediante el runtime AFM, lo que permite trabajar con un modelo de 129B sin infraestructura cloud.
- **Generación de texto larga con decodificación especulativa**: el predictor MTP y la tabla n-gram permiten aumentar el throughput en tareas de generación extensa, como la creación de listas numeradas, informes o documentos estructurados. El prompt de validación generó una lista coherente de 200 elementos.
- **Análisis multimodal de imágenes**: la torre de visión en BF16 habilita tareas de image-text-to-text, como descripción de imágenes o respuesta a preguntas visuales, aunque la calidad de visión no fue medida en la validación.
- **Investigación de arquitecturas híbridas para Qwen4**: el modelo expone componentes de la futura arquitectura Qwen4 (Gated DeltaNet, Gated Attention, predictor MTP, tabla n-gram), lo que lo hace útil para estudiar el comportamiento de estos mecanismos en un checkpoint real.
- **Pruebas de rendimiento en hardware unificado**: los desarrolladores pueden medir tokens/s en modos AR y MTP3 para calibrar configuraciones de AFM (residencia de n-gram, política de verificación MTP) en diferentes Macs.
- **Desarrollo de aplicaciones con el ecosistema maclocal-api**: el modelo está pensado para una futura versión de este runtime, por lo que puede usarse como banco de pruebas para integraciones de MLX con soporte de n-gram y MTP.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La validación local realizada por el autor en un M3 Ultra con 512 GB de memoria unificada proporciona las siguientes mediciones puntuales, con temperatura 0 y un límite de 256 tokens:

| Modo | Tokens/s | Aceptación MTP | Resultado |
|---|---|---|---|
| AR, primer run demand-mapped | 61.7 | — | Secuencia numerada coherente |
| AR, warm mapped control | 66.5 | — | Secuencia numerada coherente |
| MTP3, warm mapped control | 76.4 | 99.0% (193/195) | Secuencia numerada coherente |

Estas cifras son mediciones locales puntuales, no garantías entre máquinas.

## Requisitos de hardware

- VRAM estimada: no disponible. El repositorio ocupa 105.4 GB y la validación se realizó en un M3 Ultra con 512 GB de memoria unificada.
- GPU recomendadas: Apple Silicon (M3 Ultra en la validación). No hay datos para GPUs NVIDIA o AMD.
- Consumer GPU: no cabe en GPUs de consumo actuales; el checkpoint de 105.4 GB excede la capacidad de cualquier GPU consumer disponible (p. ej. RTX 4090 con 24 GB).
- Opciones de despliegue: exclusivamente mediante el runtime AFM con soporte para Qwen Next mapped n-gram y embedded-MTP. No se mencionan vLLM, llama.cpp, Ollama o TGI para esta conversión concreta.
- Latencia y throughput: mediciones locales de 61.7 a 76.4 tokens/s en un M3 Ultra, según la tabla de validación.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Qwen3.8-Flash-Next-AFM-MLX-4bit (este) | 129.435.434.899 | no disponible | AFM affine 4-bit/8-bit | 61.7–76.4 tok/s (M3 Ultra) | qwen-community-1.0 | Hugging Face |
| Qwen/Qwen3.8-Flash-Next (original) | 129.435.434.899 | no disponible | no disponible | no disponible | qwen-community-1.0 | Hugging Face |
| Qwen3.8-Flash (oficial) | no disponible | 1M (por defecto) | no disponible | no disponible | qwen-community-1.0 | Qwen Cloud |

La comparativa se basa en la información del README original: Qwen3.8-Flash es la versión oficial de producción basada en Qwen3.8-Flash-Next, con contexto de 1M y herramientas integradas. No se dispone de datos de rendimiento comparables para los otros modelos.

## Limitaciones y advertencias

- Artefacto experimental AFM: no es compatible con los lanzamientos públicos actuales de MLX ni con otros runtimes; requiere una build específica de AFM.
- El comportamiento, la calidad, el rendimiento, el uso de memoria y la estructura de archivos pueden cambiar en futuras versiones.
- La calidad de visión no fue evaluada; el soporte multimodal no está verificado.
- No se han publicado benchmarks estándar, por lo que el rendimiento en tareas generales es desconocido.
- La política de verificación MTP en modo `batched` puede producir diferencias en los límites de decisión de punto flotante en comparación con la decodificación greedy independiente, aunque el modelo verifica cada token aceptado.
- La licencia Qwen Community License 1.0 puede imponer restricciones de uso comercial; es necesario revisar el archivo LICENSE.
- Los idiomas soportados no están especificados, lo que limita la evaluación de capacidades multilingües.
- Sesgos y alucinaciones no evaluados; al ser un modelo experimental sin benchmarks, el riesgo no está caracterizado.
- El modelo es muy grande (129.4B parámetros) y requiere hardware específico con memoria unificada abundante; no es adecuado para GPUs de consumo.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/maclocal/Qwen3.8-Flash-Next-AFM-MLX-4bit
- Modelo base original: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Repositorio maclocal-api: https://github.com/scouzi1966/maclocal-api
- Implementación de referencia ddalcu/mlx-serve (commit 805807669565d359188b329c659f9f45d6358cd7): https://github.com/ddalcu/mlx-serve
- Qwen Cloud: https://www.qwencloud.com
- Visión general de Qwen3.8-Flash: https://www.qwencloud.com/models/qwen3.8-flash
