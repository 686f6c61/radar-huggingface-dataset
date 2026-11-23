# kesha-humonen/best_v2_hi-eng

## Resumen

`kesha-humonen/best_v2_hi-eng` es un modelo de traducción automática especializado en traducir egipcio medio escrito en jeroglíficos Unicode al inglés. Se construye a partir de NLLB-200-distilled-600M, el modelo de traducción multilingüe de Meta, mediante ajuste fino supervisado y una extensión del tokenizador para acomodar los jeroglíficos como tokens de origen. Lo desarrolla el usuario independiente kesha-humonen dentro de un proyecto de egiptología computacional.

El modelo resuelve un problema muy concreto y poco cubierto por los sistemas de traducción generalistas: la traducción de una lengua histórica no incluida en los corpus paralelos habituales. Al partir de NLLB-200-distilled-600M conserva la arquitectura encoder-decoder transformer y el mecanismo de tokens de idioma (`egy_Hiero` como origen, `eng_Latn` como destino), lo que permite reutilizar el ecosistema de transformers y las técnicas de decodificación por búsqueda en haz.

Con 623 millones de parámetros y 2,5 GB de pesos en safetensors, es un modelo ligero que puede ejecutarse en GPU de consumo. Su relevancia es fundamentalmente de nicho: demuestra que un modelo destilado de 600M, ajustado con un conjunto de datos estricto y bien separado, puede alcanzar métricas razonables (chrF++ 55,72 y BLEU 43,70 en el conjunto de test) en una dirección de traducción de bajo recurso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (NLLB-200-distilled-600M) |
| Parametros totales | 623.351.808 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (max_length de generación configurable, el ejemplo usa 512) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | origen: egipcio medio en jeroglíficos Unicode (`egy_Hiero`); destino: inglés (`eng_Latn`) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un NLLB-200-distilled-600M, es decir, un transformer encoder-decoder con atención completa, destilado del NLLB-200 original de Meta. El tokenizador se ha extendido para incorporar los jeroglíficos egipcios en Unicode como tokens de origen, manteniendo la convención de tokens de idioma de NLLB (`src_lang = "egy_Hiero"`, `forced_bos_token_id` para `eng_Latn`).

El ajuste fino se realizó por máxima verosimilitud (negative log-likelihood de la referencia) sobre los datos de entrenamiento de la partición estricta de esta dirección, en rondas de 6 épocas con learning rate 1e-5, batch efectivo de 64 y semilla 42. Cada ronda parte del checkpoint con menor pérdida de validación de la anterior hasta que la validación deja de mejorar. Este checkpoint corresponde a la ronda 3 (18 épocas) con pérdida de validación 0,8744. No se documenta el número de tokens de entrenamiento ni la composición del corpus, ni si hubo RLHF o DPO.

## Capacidades

- Traducción de egipcio medio escrito en jeroglíficos Unicode al inglés.
- Generación de texto condicionada por tokens de idioma de NLLB.
- Decodificación por búsqueda en haz (el autor recomienda 4 haces) con penalización de repetición 3.0.
- Uso directo con `transformers` (`AutoModelForSeq2SeqLM` y `AutoTokenizer`).
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito.
- Capacidad multilingüe limitada a la dirección `egy_Hiero` → `eng_Latn`; el resto de lenguas de NLLB no se garantizan tras el ajuste.

## Casos de uso

- Traducción asistida de inscripciones: introducir transcripciones jeroglíficas en Unicode y obtener una versión inglesa para revisión por egiptólogos, aprovechando la ventana de generación configurable (hasta 512 tokens en el ejemplo).
- Digitalización de corpus epigráficos: procesar lotes de textos jeroglíficos y generar traducciones preliminares que luego se corrigen manualmente, reduciendo el tiempo de catalogación.
- Herramientas de investigación y docencia: integrar el modelo en un cuaderno o interfaz web para que estudiantes comparen su propia traducción con la generada por el sistema.
- Enriquecimiento de bases de datos arqueológicas: añadir un campo de traducción automática al inglés a registros que solo contienen transcripción jeroglífica, para búsqueda y filtrado posteriores.
- Prototipos de asistentes especializados: construir un servicio de consulta que reciba una secuencia de jeroglíficos y devuelva una traducción con la configuración recomendada (4 haces, penalización 3.0).
- Evaluación comparativa de modelos de traducción de bajo recurso: usar el checkpoint como referencia de un pipeline NLLB ajustado frente a enfoques alternativos, dado que el autor publica métricas sobre una partición estricta (n=1909).

## Benchmarks y rendimiento

Resultados publicados por el autor en el conjunto de test de partición estricta (n=1909), con búsqueda en haz de 4 haces y penalización de repetición 3.0:

| Metrica | Valor |
|---|---|
| chrF++ | 55,72 |
| BLEU | 43,70 |
| Pérdida de validación (ronda 3, 18 épocas) | 0,8744 |

No se han publicado resultados de benchmarks comparativos con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: en torno a 2,5 GB de pesos más memoria de activaciones; en fp16 aproximadamente 1,3 GB de pesos.
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM para fp16; A100 o H100 no son necesarias para este tamaño.
- Cabe en GPU de consumo: sí, por ejemplo RTX 3060, RTX 4060, RTX 4090 y similares.
- Opciones de despliegue: `transformers` con `AutoModelForSeq2SeqLM` (documentado por el autor); otras opciones como vLLM, llama.cpp, Ollama o TGI no están documentadas para este checkpoint.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| kesha-humonen/best_v2_hi-eng | 623.351.808 | no disponible | egy_Hiero → eng_Latn | CC-BY-4.0 | Hugging Face |
| NLLB-200-distilled-600M (Meta) | ~600M | 512 tokens (típico en NLLB) | multilingüe (200 lenguas) | CC-BY-NC-4.0 | Hugging Face |
| M2M-100 (600M) | ~600M | no disponible | multilingüe | MIT | Hugging Face |

La comparación con NLLB-200-distilled-600M es directa porque es su modelo base; la diferencia principal es la extensión del tokenizador y el ajuste fino para jeroglíficos. M2M-100 se incluye como alternativa de tamaño similar en traducción multilingüe, aunque no cubre egipcio medio. No se dispone de métricas comparativas entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- El modelo solo cubre la dirección `egy_Hiero` → `eng_Latn`; no se garantiza el resto de direcciones de NLLB.
- El corpus de entrenamiento y su composición no están documentados, por lo que se desconoce el sesgo y la cobertura de épocas, géneros o dialectos del egipcio medio.
- Riesgo de alucinación en secuencias jeroglíficas ambiguas o dañadas; las métricas (BLEU 43,70) indican errores no triviales.
- La licencia CC-BY-4.0 permite uso comercial con atribución, pero el modelo base NLLB-200-distilled-600M de Meta tiene licencia CC-BY-NC-4.0, lo que puede condicionar el uso comercial del derivado; conviene verificar la compatibilidad antes de producción.
- El tokenizador extendido puede no manejar correctamente jeroglíficos fuera del conjunto Unicode contemplado.
- Sin datos de cuantización ni de despliegue en servidores de inferencia de alto rendimiento.
- Modelo con 0 descargas y 0 likes en el momento de la consulta; no hay validación comunitaria independiente.

## Enlaces

- Hugging Face: https://huggingface.co/kesha-humonen/best_v2_hi-eng
- Modelo base del ajuste: https://huggingface.co/kesha-humonen/tr-eng_checkpoint-8556
- NLLB-200-distilled-600M (modelo de partida de la familia): https://huggingface.co/facebook/nllb-200-distilled-600M
