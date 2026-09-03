# ManniX-ITA/Qwen3.8-27B-Omnimerge-v6-MTP-GGUF

## Resumen

El repositorio `ManniX-ITA/Qwen3.8-27B-Omnimerge-v6-MTP-GGUF` contiene cuantizaciones GGUF del modelo `ManniX-ITA/Qwen3.8-27B-Omnimerge-v6`, un merge por *task arithmetic* de tres fine-tunes de Qwen3.6 sobre la base **Qwen3.8-27B**. El autor, ManniX-ITA, publica 19 niveles de cuantización (desde Q8_0 hasta IQ2_S) con el **cabezal MTP** (multi-token prediction) conservado, lo que permite decodificación especulativa auto-especulativa en llama.cpp, alcanzando un aumento de rendimiento medido de aproximadamente 2× en una RTX PRO 6000 Blackwell.

El modelo es multimodal (pipeline `image-text-to-text`) e incluye un proyector de visión F16 publicado junto a las cuantizaciones. Está diseñado para desplegarse en GPUs de consumo (desde 12 GB con IQ2_S hasta 24 GB con Q4_K_M) y es compatible con llama.cpp, llama-server y Ollama. Su licencia Apache 2.0 permite uso comercial sin restricciones adicionales.

La relevancia de este lanzamiento radica en dos aspectos: primero, ofrece una amplia gama de cuantizaciones calibradas con una política medida sobre el uso de imatrix (solo en tiers Q3 y menores), y segundo, incorpora el cabezal MTP original de Qwen3.8, que acelera la inferencia sin degradar la calidad algorítmica. El repositorio incluye el archivo `imatrix.dat` para reproducibilidad y auditoría.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (denso) con cabezal MTP para decodificación especulativa |
| Parametros totales | 27.320.697.856 (27,3 B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (los ejemplos usan 16.384 tokens) |
| Tipos de cuantizacion | Q8_0, Q6_K_L, Q6_K, Q5_K_L, Q5_K_M, Q4_K_L, Q4_K_M, IQ4_NL, IQ4_XS, Q3_K_XL, Q3_K_L, Q3_K_M, IQ3_M, Q3_K_S, IQ3_XS, IQ3_XXS, Q2_K, IQ2_M, IQ2_S |
| Idiomas soportados | Inglés (tag `en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (texto y visión), safetensors para el modelo base |

## Arquitectura y entrenamiento

El modelo base `ManniX-ITA/Qwen3.8-27B-Omnimerge-v6` es un merge de tres fine-tunes de Qwen3.6 sobre la arquitectura Qwen3.8-27B, combinados mediante *task arithmetic*. El cabezal MTP (multi-token prediction) se conserva íntegro del Qwen3.8 original, excluido deliberadamente del merge, porque aplicar el delta de un cabezal entrenado en 3.6 degradaría la tasa de aceptación de los borradores. El proyector de visión (333 tensores `model.visual.*`) es bit-idéntico al de la base Qwen3.8, por lo que es el tower estándar.

El entrenamiento de los fine-tunes subyacentes no se detalla en la información proporcionada; no hay datos sobre número de tokens, composición del dataset ni uso de RLHF/DPO. El repositorio GGUF incluye el archivo `imatrix.dat` para reproducir las cuantizaciones con importancia ponderada.

La política de cuantización es explícita: los tiers Q4 y superiores se construyen sin imatrix porque la calibración sesga más que la ponderación por importancia; los tiers Q3 y menores (incluidos los IQ) sí usan imatrix, donde marca la diferencia entre una cuantización buena y una defectuosa. Q8_0 no necesita imatrix.

## Capacidades

- Generación de texto y razonamiento multi-step, con soporte de *reasoning budget* configurable (en los ejemplos se usa `--reasoning-budget 8192`).
- Visión multimodal: acepta imágenes como entrada (pipeline `image-text-to-text`) mediante el proyector F16 publicado.
- Decodificación especulativa MTP: el cabezal MTP permite que llama.cpp genere borradores de tokens y los verifique en lote, logrando un aumento de throughput de hasta 2,02× en las pruebas del autor.
- Compatibilidad con cuantización GGUF en 19 niveles, desde Q8_0 (casi sin pérdida) hasta IQ2_S (9,6 GB).
- Integración con Ollama mediante tags específicos (`:latest` = Q4_K_M, `Q6_K`, `IQ2_S`, etc.) y con llama-server vía `--spec-type draft-mtp`.

## Casos de uso

- **Asistente conversacional con razonamiento profundo**: el modelo puede generar respuestas con cadenas de pensamiento explícitas (reasoning channel) y un presupuesto de tokens configurable, adecuado para chatbots que necesitan justificar sus respuestas o resolver problemas complejos.
- **Análisis de imágenes y documentos visuales**: gracias al proyector de visión, se puede usar para extraer información de capturas, diagramas o documentos escaneados, combinando comprensión visual con razonamiento textual.
- **Generación de código en entornos con recursos limitados**: las cuantizaciones Q4_K_M (16,8 GB) o IQ2_S (9,6 GB) permiten ejecutar un modelo de 27B en GPUs de 24 GB o 12 GB respectivamente, útil para autocompletado o generación de código en estaciones de trabajo sin GPUs de datacenter.
- **Despliegue en producción con baja latencia**: la decodificación especulativa MTP duplica el throughput (140 tok/s en RTX PRO 6000 Blackwell con Q4_K_M), reduciendo el tiempo de respuesta en servicios de generación de texto.
- **Investigación en decodificación especulativa**: el repositorio incluye mediciones detalladas de tasa de aceptación y longitud media de borrador, lo que lo convierte en un banco de pruebas para estudiar el comportamiento de MTP en modelos de 27B.
- **Procesamiento de documentos con contexto largo**: con una ventana de 16K tokens (según los ejemplos), puede resumir o analizar documentos extensos, como informes técnicos o artículos, manteniendo coherencia en conversaciones multi-turno.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona que el tier Q6_K es la referencia de evaluación ("every benchmark below"), pero no se incluyen los valores numéricos. El único dato de rendimiento medido es el del MTP: en una RTX PRO 6000 Blackwell con llama.cpp b9700, Q4_K_M, contexto 8192 y `--parallel 1`, se obtuvo:

| Configuración | mediana tok/s | speedup | tasa aceptación | longitud media aceptada |
|---|---|---|---|---|
| MTP off | 69,4 | 1,00× | — | — |
| `--spec-draft-n-max 2` | 130,3 | 1,88× | 0,81 | 2,62 |
| `--spec-draft-n-max 3` | 140,4 | 2,02× | 0,73 | 3,19 |
| `--spec-draft-n-max 4` | 134,0 | 1,93× | 0,61 | 3,43 |

Estos datos provienen de las pruebas del autor y no son comparables con benchmarks estándar como MMLU o HumanEval.

## Requisitos de hardware

- **VRAM estimada**: según el tamaño de archivo de cada cuantización, añadiendo overhead de KV cache y runtime. Para contexto 16K y batch 1, se recomienda al menos 2-4 GB adicionales sobre el tamaño del GGUF.
- **GPU recomendadas**:
  - Q8_0 (29,1 GB): requiere GPU de 32 GB o más (p. ej. A100 40GB, RTX A6000).
  - Q6_K (22,4 GB): cabe en RTX 3090/4090 (24 GB) con margen para KV cache.
  - Q4_K_M (16,8 GB): recomendado para RTX 4090 (24 GB) o RTX 4080 (16 GB) con contexto reducido.
  - IQ2_S (9,6 GB): cabe en RTX 3060 12 GB o similar.
- **Opciones de despliegue**: llama.cpp (incluido llama-server), Ollama (tags `mannix/omnimerge-v6`), y cualquier framework compatible con GGUF (p. ej. LM Studio).
- **Latencia y throughput**: con MTP activado y `--spec-draft-n-max 3`, se alcanzan ~140 tok/s en RTX PRO 6000 Blackwell; sin MTP, ~69 tok/s. En GPUs consumer el rendimiento será menor, pero la ganancia relativa de MTP se mantiene.

## Comparativa con modelos similares

No se dispone de datos comparativos con otros modelos en la información proporcionada. El modelo base Qwen3.8-27B es un punto de referencia natural, pero no se ofrecen cifras de rendimiento relativas. Se puede afirmar que, al ser un merge de fine-tunes de Qwen3.6 sobre Qwen3.8, hereda las capacidades de dicha familia, pero sin datos cuantitativos no es posible establecer una comparación rigurosa.

## Limitaciones y advertencias

- **Idioma**: la model card solo declara inglés (`en`). No se garantiza soporte multilingüe, aunque el modelo base Qwen3.8 podría tener capacidades adicionales no documentadas aquí.
- **Razonamiento**: el autor advierte que 6 de 198 preguntas de GPQA puntuaron cero por agotar el presupuesto de razonamiento de ~8192 tokens. Para problemas complejos se debe aumentar `--reasoning-budget`.
- **MTP no es bit-idéntico**: la decodificación especulativa puede producir salidas diferentes a la decodificación estándar en casos de empate cercano. El autor no ha medido la equivalencia de calidad, por lo que en aplicaciones donde se requiera reproducibilidad exacta se debe desactivar MTP.
- **Cuantizaciones sin imatrix**: los tiers Q4 y superiores se generan sin imatrix; aunque es una decisión medida, la calidad puede variar respecto a cuantizaciones con imatrix en esos niveles.
- **Licencia**: Apache 2.0 permite uso comercial sin restricciones, pero el modelo base y los fine-tunes subyacentes pueden tener condiciones adicionales no reflejadas en este repositorio.
- **Contexto**: la longitud máxima de contexto no está especificada; los ejemplos usan 16K, pero excederla puede causar degradación o errores.

## Enlaces

- [Repositorio GGUF en HuggingFace](https://huggingface.co/ManniX-ITA/Qwen3.8-27B-Omnimerge-v6-MTP-GGUF)
- [Modelo base (safetensors)](https://huggingface.co/ManniX-ITA/Qwen3.8-27B-Omnimerge-v6)
- [PR de llama.cpp #22673 (soporte MTP)](https://github.com/ggml-org/llama.cpp/pull/22673)
- [Modelo en Ollama](https://ollama.com/mannix/omnimerge-v6)
