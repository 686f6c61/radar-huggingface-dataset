# ikimyaii/Mamba-1.3B-semi-structured-Wanda-50pct

## Resumen

Mamba-1.3B-semi-structured-Wanda-50pct es una variante podada al 50% de dispersión semi-estructurada del modelo base fla-hub/mamba-1.3B-100B, publicado por el usuario ikimyaii en Hugging Face. No se trata de un modelo entrenado desde cero, sino de un artefacto de investigación que aplica poda one-shot (sin reentrenamiento) con el algoritmo Wanda oficial sobre las capas lineales internas de cada bloque Mamba. El resultado conserva la arquitectura original de estado espacio (SSM) con 1.334.740.992 parámetros y sirve como línea base para comparar variantes de poda más avanzadas (los modelos EHWS del mismo autor).

La relevancia de esta ficha es doble: por un lado, documenta un punto de referencia reproducible para estudiar la tolerancia a la dispersión de los modelos Mamba, una familia que compite con los transformers en eficiencia de inferencia para contextos largos; por otro, cuantifica el coste real de eliminar la mitad de los pesos de las proyecciones lineales, con un aumento de perplejidad de 2,77 puntos en WikiText-2 y de 4,38 puntos en C4 respecto al modelo denso.

El modelo se distribuye únicamente en safetensors (2,7 GB), requiere la librería flash-linear-attention para cargarse y no declara licencia, idiomas ni pipeline en su model card. Es, por tanto, un artefacto de investigación con fines de evaluación, no un modelo listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Mamba (SSM selectivo, sin atención) |
| Parámetros totales | 1.334.740.992 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (el modelo base se entrenó con secuencias de 2.048 tokens según el protocolo de calibración) |
| Tipos de cuantización | no disponible (pesos en bfloat16; se documenta que Mamba desborda en fp16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Dispersión aplicada | 50% semi-estructurada (medida real: 0,4900) |
| Modelo base | fla-hub/mamba-1.3B-100B |
| Tamaño del repositorio | 2,7 GB |

## Arquitectura y entrenamiento

La arquitectura subyacente es Mamba, un modelo de espacio de estados selectivo que sustituye la atención por recurrencia lineal con parámetros dependientes de la entrada. El modelo base fla-hub/mamba-1.3B-100B fue entrenado sobre 100.000 millones de tokens según indica su identificador, aunque la model card del artefacto podado no detalla la composición del dataset ni si hubo fases de RLHF o DPO. El checkpoint podado no ha sido reentrenado: es una transformación directa de los pesos del modelo base.

La poda se realizó con el código oficial de Wanda (repositorio locuslab/wanda, commit 8e8fc87, rama unstructured, `use_variant=False`), que elimina en cada fila los pesos con menor puntuación `|W| * sqrt(||X||)`. Se podaron todas las capas lineales internas de los bloques (`in_proj`, `x_proj`, `out_proj`), manteniendo densas `dt_proj` (aproximadamente el 2% de los pesos lineales de cada bloque), `conv1d`, `A_log`, `D`, los embeddings y `lm_head`. La calibración usó 128 secuencias de C4 de 2.048 tokens con semilla 0, podando los bloques en orden y calibrando cada uno sobre las salidas de los bloques ya podados. Los pesos se podaron en bfloat16 y el proceso completo tardó 2,8 minutos en una A100 de 40 GB. Una propiedad destacable del resultado es que todas las filas de las 192 capas podadas tienen exactamente el mismo número de ceros, lo que garantiza un reparto de trabajo perfectamente equilibrado por fila.

## Capacidades

- Generación de texto autoregresiva en inglés (el modelo base se asocia a corpus C4 y WikiText-2, ambos en inglés), aunque el soporte multilingüe no está declarado.
- Razonamiento de sentido común evaluado en arc_challenge, arc_easy, boolq, hellaswag, openbookqa, rte y winogrande.
- Modelado de lenguaje y cálculo de perplejidad en dominios de texto general (WikiText-2, C4).
- Inferencia con estado recurrente, sin caché KV de atención, lo que reduce el coste de memoria en secuencias largas frente a transformers de tamaño comparable.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito.
- No se documenta una plantilla de chat ni un formato de instrucciones; el artefacto está orientado a evaluación de perplejidad y zero-shot, no a diálogo.

## Casos de uso

- Investigación sobre poda de modelos SSM: el artefacto sirve como línea base reproducible para comparar técnicas de poda más sofisticadas (por ejemplo, las variantes EHWS del mismo autor) sobre la misma arquitectura y el mismo protocolo de calibración.
- Estudio de la relación entre dispersión y calidad: con una perplejidad densa de 10,03 en WikiText-2 y 12,80 tras la poda, permite analizar empíricamente cuánto degrada cada punto porcentual de dispersión en modelos Mamba.
- Validación de pipelines de evaluación: al estar evaluado con ELSA y lm-evaluation-harness, puede integrarse como caso de prueba en infraestructuras que verifiquen la reproducibilidad de resultados de perplejidad y zero-shot.
- Benchmarking de kernels de dispersión: la garantía de que todas las filas tienen el mismo número de no ceros (192 capas verificadas) lo hace adecuado para probar kernels semi-estructurados que exploten el equilibrio por fila.
- Experimentos de eficiencia en memoria: al reducir a la mitad los pesos de las proyecciones lineales, permite medir el ahorro real de memoria y el impacto en latencia en GPUs de gama media frente al modelo denso.
- Docencia y divulgación: como ejemplo didáctico de poda one-shot con Wanda aplicada a una arquitectura no transformer, con métricas antes y después publicadas.

## Benchmarks y rendimiento

Perplejidad con el protocolo de evaluación de ELSA, en bfloat16:

| Conjunto | Denso | Este modelo |
|---|---|---|
| WikiText-2 | 10,03 | 12,80 |
| C4 | 14,12 | 18,50 |

Precisión zero-shot con lm-evaluation-harness:

| Tarea | Denso | Este modelo |
|---|---|---|
| arc_challenge | 0,2329 | 0,2321 |
| arc_easy | 0,5644 | 0,5274 |
| boolq | 0,6040 | 0,6180 |
| hellaswag | 0,3898 | 0,3542 |
| openbookqa | 0,1980 | 0,1960 |
| rte | 0,5343 | 0,5379 |
| winogrande | 0,5217 | 0,5249 |
| Media | 0,4350 | 0,4272 |

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 2,7 GB solo para pesos, más el estado recurrente y las activaciones; en la práctica, entre 4 y 6 GB según longitud de secuencia y tamaño de lote.
- El modelo base se podó en una A100 de 40 GB, pero esa cifra corresponde al proceso de poda con calibración, no a la inferencia.
- Cabe en GPUs de consumo: RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB, RTX 4070, RTX 4080 y RTX 4090, así como en A100, H100 y L40S para despliegues de mayor lote.
- Despliegue: requiere `flash-linear-attention` instalado (`import fla`) y `AutoModelForCausalLM.from_pretrained(...)`. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI; dado que es un modelo Mamba con dispersión semi-estructurada, la compatibilidad con esos motores no está garantizada.
- No se publican datos de latencia ni throughput. El autor solo reporta el tiempo de poda (2,8 minutos en una A100 de 40 GB).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Perplejidad WikiText-2 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (Mamba-1.3B, Wanda 50%) | 1.334.740.992 | no disponible | 12,80 | no disponible | Hugging Face |
| fla-hub/mamba-1.3B-100B (denso) | 1.334.740.992 | no disponible | 10,03 | no disponible | Hugging Face |
| Alternativas podadas del mismo autor (EHWS) | no disponible | no disponible | no disponible | no disponible | Hugging Face |

No se dispone de datos de benchmarks de modelos comparables de otros autores en la información proporcionada.

## Limitaciones y advertencias

- La poda one-shot sin reentrenamiento degrada la perplejidad de forma notable: +2,77 en WikiText-2 y +4,38 en C4 respecto al modelo denso.
- La precisión media zero-shot cae 0,78 puntos porcentuales (de 0,4350 a 0,4272), con pérdidas concentradas en arc_easy (−3,7 puntos) y hellaswag (−3,56 puntos).
- No se declara licencia, lo que impide determinar si el uso comercial está permitido; debe consultarse al autor antes de cualquier despliegue productivo.
- No se declaran idiomas soportados; las evaluaciones publicadas son en inglés.
- No se documenta longitud de contexto máxima; el protocolo de calibración usa secuencias de 2.048 tokens, pero no se confirma que sea el límite del modelo.
- Mamba desborda en fp16 según el autor, por lo que la inferencia debe hacerse en bfloat16 o superior.
- Riesgo de alucinación no cuantificado; no hay evaluaciones de veracidad ni de seguridad.
- Sesgos conocidos no documentados; el modelo base se entrenó sobre corpus web (C4) con los sesgos habituales de ese tipo de datos.
- Es un artefacto de investigación con 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en producción ni de mantenimiento.
- La compatibilidad con motores de inferencia estándar (vLLM, TGI, llama.cpp) no está verificada y puede requerir kernels específicos para explotar la dispersión semi-estructurada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ikimyaii/Mamba-1.3B-semi-structured-Wanda-50pct
- Modelo base: https://huggingface.co/fla-hub/mamba-1.3B-100B
- Código oficial de Wanda: https://github.com/locuslab/wanda (commit 8e8fc87)
- Librería flash-linear-attention: https://github.com/fla-org/flash-linear-attention
- Protocolo de evaluación ELSA: no disponible en la información proporcionada
- Paper de Mamba: no disponible en la información proporcionada
