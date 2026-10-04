# mradermacher/Abliterated-Dolphin3.0-R1-Mistral-24B-i1-GGUF

## Resumen

Este repositorio contiene cuantizaciones GGUF del modelo SAIFIINDUSTRIES/Abliterated-Dolphin3.0-R1-Mistral-24B, publicadas por mradermacher. Se trata de una versión "abliterated" (es decir, con las direcciones de rechazo eliminadas del modelo) del Dolphin3.0-R1-Mistral-24B, un modelo denso de aproximadamente 23,6 mil millones de parámetros, orientado al razonamiento y con licencia Apache 2.0. El modelo base pertenece a la familia Dolphin de Cognitive Computations, entrenada con trazas de razonamiento de estilo R1.

La relevancia de esta publicación es práctica: ofrece el modelo en formato GGUF, optimizado con imatrix, lo que permite ejecutarlo en hardware de consumo mediante llama.cpp, Ollama u otros motores compatibles con GGUF. El repositorio incluye múltiples niveles de cuantización, desde i1-Q2_K (9,0 GB) hasta variantes de mayor precisión, cubriendo el rango de 9 GB a 20+ GB de pesos.

El modelo está pensado para inglés y conserva el sesgo de razonamiento del entrenamiento R1 incluso tras el proceso de abliteración, según fuentes externas. Es una opción orientada a investigación, experimentación y generación de texto sin las restricciones de rechazo habituales, con 0 descargas y 0 likes en el momento de la consulta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible en la información proporcionada; el nombre indica un transformer denso de tipo Mistral de ~24B |
| Parámetros totales | 23.572.423.680 (~23,6 mil millones) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | i1-Q2_K (9,0 GB), i1-IQ3_XXS (9,4 GB), i1-IQ3_M (10,8 GB), i1-Q3_K_M (11,6 GB), i1-Q4_K_S (13,6 GB). El repositorio declara además: Q2_K_S, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, IQ1_S, IQ1_M, Q3_K_S, Q3_K_L, IQ3_XS, IQ3_S, Q4_0, Q4_1, IQ4_XS, IQ4_NL, Q5_K_S, Q5_K_M, Q6_K |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones ponderadas con imatrix) |

## Arquitectura y entrenamiento

La ficha de HuggingFace no aporta detalles sobre la arquitectura interna, el número de tokens de entrenamiento ni la composición del dataset. Por la nomenclatura y el recuento de parámetros, el modelo base se corresponde con un transformer denso derivado de la familia Mistral, ajustado mediante técnicas de destilación de razonamiento al estilo R1 (trazas de pensamiento antes de la respuesta final).

Sobre el pipeline de cuantización sí hay información: mradermacher ha generado cuantizaciones ponderadas con imatrix, que asignan importancia variable a los tensores de forma que las cuantizaciones de baja precisión (por ejemplo i1-Q3_K_M o i1-IQ3_M) preservan mejor la calidad que las cuantizaciones estáticas equivalentes. La versión aquí descrita es la variante i1 (imatrix); existe además un repositorio paralelo de cuantizaciones estáticas. El proceso "abliterated" aplicado al modelo base elimina direcciones de activación asociadas al rechazo, sin eliminar el ajuste conversacional.

## Capacidades

- Generación de texto conversacional en inglés, con soporte multi-turno.
- Razonamiento en cadena de pensamiento de estilo R1: el modelo produce trazas de razonamiento antes de la respuesta final.
- Capacidades de código y matemáticas heredadas del modelo base Mistral 24B (no verificadas con benchmarks en la información disponible).
- Comportamiento sin rechazos: al estar abliterated, no genera negativas a peticiones que el modelo alineado original rechazaría.
- Capacidad de mantener conversaciones de contexto medio (longitud exacta no disponible).
- No hay confirmación de soporte de tool calling o function calling en la información proporcionada.
- No hay confirmación de capacidades de visión, audio ni modo thinking explícito separado.
- Multilingüe limitado: únicamente se declara inglés.

## Casos de uso

- Red teaming e investigación sobre alineación: el modelo permite estudiar qué comportamientos emergen cuando se eliminan las direcciones de rechazo, comparando respuestas con el modelo alineado original.
- Generación de texto creativo sin filtros: narrativa, guiones o ficción que requieran evitar los rechazos del modelo alineado, ejecutado localmente en inglés.
- Asistente de razonamiento local: desplegado con llama.cpp u Ollama en una estación de trabajo con GPU de 16-24 GB, para tareas de análisis y resolución de problemas con trazas intermedias.
- Experimentación con cuantizaciones: el repositorio permite comparar variantes i1-Q2_K, i1-IQ3_M, i1-Q4_K_S, etc., y evaluar la degradación de calidad según el nivel de bits.
- Generación de datos sintéticos: uso del modelo como generador de corpus en inglés para entrenar o evaluar otros modelos, con la ventaja de no aplicar filtros de contenido.
- Despliegue de bajo coste en hardware de consumo: las variantes de 9-14 GB permiten inferencia offline en portátiles y equipos con una sola GPU de gama alta.
- Análisis de documentos en inglés: resumen y extracción de información de textos largos, siempre que la longitud de contexto real del modelo lo permita.
- Comparación abliterated vs. alineado: evaluación académica del impacto de eliminar la alineación de seguridad sobre el rendimiento en tareas de razonamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

Estimaciones de VRAM basadas en el tamaño de los ficheros GGUF publicados más un margen de 1-3 GB para caché KV y overhead del motor (los valores exactos dependen del contexto configurado y del backend):

- i1-Q2_K (9,0 GB): ~10-11 GB de VRAM.
- i1-IQ3_XXS (9,4 GB): ~11 GB de VRAM.
- i1-IQ3_M (10,8 GB): ~12-13 GB de VRAM.
- i1-Q3_K_M (11,6 GB): ~13 GB de VRAM.
- i1-Q4_K_S (13,6 GB): ~15-16 GB de VRAM.
- GPU recomendadas: RTX 4090 (24 GB), RTX 3090 (24 GB), A100 40/80 GB; RTX 4080 (16 GB) para las variantes Q3 y Q4 con contexto reducido.
- Cabe en GPU de consumo: sí, en RTX 4090/3090 para todas las variantes listadas; en GPUs de 12 GB (RTX 3060, 4070) caben las variantes de 9-11 GB.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, koboldcpp, text-generation-webui, llama-cpp-python. Para las variantes de mayor precisión puede ser necesario el modelo base en safetensors con vLLM o TGI, aunque no se confirma compatibilidad GGUF de esos motores en la información disponible.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Formato | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| mradermacher/Abliterated-Dolphin3.0-R1-Mistral-24B-i1-GGUF (este) | GGUF imatrix | 23,6B | no disponible | Apache 2.0 | Cuantizaciones ponderadas, 9-14 GB |
| mradermacher/Abliterated-Dolphin3.0-R1-Mistral-24B-GGUF | GGUF estático | 23,6B | no disponible | Apache 2.0 | Mismo modelo, cuantización sin imatrix |
| SAIFIINDUSTRIES/Abliterated-Dolphin3.0-R1-Mistral-24B | safetensors (bf16) | 23,6B | no disponible | Apache 2.0 | Modelo base sin cuantizar |
| huihui-ai/Dolphin3.0-R1-Mistral-24B-abliterated | safetensors | 23,6B | no disponible | no disponible | Variante abliterated alternativa en ModelScope |

No se dispone de datos de rendimiento para establecer comparaciones cuantitativas entre estas variantes.

## Limitaciones y advertencias

- Modelo abliterated: se han eliminado las direcciones de rechazo, por lo que puede generar contenido dañino, ilegal o éticamente problemático sin filtros. No es adecuado para aplicaciones orientadas al usuario final sin moderación externa.
- Idiomas: soporte declarado únicamente para inglés; el rendimiento en castellano no está documentado.
- Riesgo de alucinación: no se han publicado evaluaciones de fidelidad factual en la información disponible.
- Cuantizaciones de baja precisión (Q2, IQ2, IQ3): la degradación de calidad aumenta notablemente por debajo de Q4, y puede afectar especialmente a la coherencia de las cadenas de razonamiento.
- Licencia Apache 2.0: permite uso comercial, pero el modelo base y el proceso de abliteración pueden arrastrar condiciones adicionales no reflejadas en el README.
- Repositorio con 0 descargas y 0 likes: no ha sido validado por la comunidad y no cuenta con evaluación independiente de calidad.
- Longitud de contexto no especificada: no se puede garantizar el comportamiento en contextos largos, algo crítico para tareas de razonamiento con trazas extensas.
- El proceso de cuantización no incluye verificación de calidad respecto al modelo original más allá de las notas del autor.

## Enlaces

- Repositorio principal (i1-GGUF): https://huggingface.co/mradermacher/Abliterated-Dolphin3.0-R1-Mistral-24B-i1-GGUF
- Repositorio de cuantizaciones estáticas: https://huggingface.co/mradermacher/Abliterated-Dolphin3.0-R1-Mistral-24B-GGUF
- Repositorio relacionado (Dolphin3.0-R1-Mistral-24B-abliterated-GGUF): https://huggingface.co/mradermacher/Dolphin3.0-R1-Mistral-24B-abliterated-GGUF
- Modelo base: https://huggingface.co/SAIFIINDUSTRIES/Abliterated-Dolphin3.0-R1-Mistral-24B
- Lista de descargas conveniente: https://hf.tst.eu/model#Abliterated-Dolphin3.0-R1-Mistral-24B-i1-GGUF
- Variante abliterated alternativa (huihui-ai, ModelScope): https://www.modelscope.cn/models/huihui-ai/Dolphin3.0-R1-Mistral-24B-abliterated
- Ficha del paquete en Socket: https://socket.dev/huggingface/package/mradermacher/dolphin3.0-r1-mistral-24b-i1-gguf
- Guía externa sobre modelos locales sin censura: https://insiderllm.com/guides/best-uncensored-local-llms/
- Peticiones de cuantización de mradermacher: https://huggingface.co/mradermacher/model_requests
- Empresa responsable de la infraestructura de cuantización (nethype GmbH): https://www.nethype.de/
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
