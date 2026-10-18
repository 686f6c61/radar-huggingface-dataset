# Patrick35510/translategemma-4b-it-GGUF

## Resumen
TranslateGemma 4B IT — GGUF (TraductionGPT) es una cuantización en formato GGUF del modelo google/translategemma-4b-it, publicada por Patrick35510. El repositorio incluye variantes Q8_0, Q6_K y Q4_K_M generadas con llama.cpp, sobre un modelo base de 3.880.263.168 parámetros y con un tamaño de repo de 9,8 GB.

La model card indica que se usa en la aplicación Android TraductionGPT para traducción sin conexión voz a voz, de modo que su interés principal es la traducción local en dispositivo. El autor conserva la plantilla de chat oficial y publica una prueba de fidelidad frente a BF16 en 12 frases de español, ruso y francés: 12/12 para Q8_0, 10/12 para Q6_K y 5/12 para Q4_K_M.

No se detallan arquitectura interna, longitud de contexto ni lista oficial de idiomas en la información disponible. La licencia es Gemma, sujeta a los términos de uso y a la política de uso prohibido de Google, y no se han publicado benchmarks estándar ni mediciones de latencia.

## Especificaciones técnicas
| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base google/translategemma-4b-it; no se detalla en la información) |
| Parámetros totales | 3.880.263.168 (modelo base, safetensors) |
| Parámetros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | BF16 (conversión intermedia), Q8_0, Q6_K, Q4_K_M |
| Idiomas soportados | no disponible; la model card solo reporta pruebas en español, ruso y francés |
| Licencia | Gemma (Gemma Terms of Use y Gemma Prohibited Use Policy) |
| Formato de pesos | GGUF (llama.cpp); los pesos del modelo base no se incluyen en este repositorio |
| Tamaño del repositorio | 9,8 GB |

## Arquitectura y entrenamiento
La información proporcionada no detalla la arquitectura interna del modelo base. El nombre y la licencia lo sitúan en la familia Gemma, pero no se confirma si se trata de un transformer decoder-only, un modelo MoE o una arquitectura híbrida. Este repositorio no es un reentrenamiento: es una conversión a GGUF mediante `convert_hf_to_gguf.py` en BF16 y una cuantización posterior con `llama-quantize`; los pesos no se modifican y se conserva la plantilla de chat oficial.

Tampoco se documentan tokens de entrenamiento, composición del dataset ni si hubo RLHF o DPO. La única evaluación técnica publicada es la fidelidad de las cuantizaciones: el autor comparó 12 frases de prueba en español, ruso y francés con la referencia BF16. Q8_0 igualó 12/12; Q6_K, 10/12; Q4_K_M, 5/12, e invirtió sujeto y objeto en «Entonces me llamas…». Es una muestra pequeña y no un benchmark de traducción.

## Capacidades
- Traducción de texto: el modelo está etiquetado con la tarea `translation` y deriva de un modelo instruction-tuned.
- Formato conversacional: conserva la plantilla de chat oficial, lo que permite interacción por turnos; no se documenta el límite de contexto.
- Multilingüismo limitado a lo reportado: pruebas en español, ruso y francés; no hay lista oficial de idiomas soportados.
- Uso en dispositivo: los GGUF están pensados para inferencia local con llama.cpp, sin conexión.
- Integración en aplicaciones: la model card indica uso en la app Android TraductionGPT para traducción voz a voz; el modelo GGUF es de traducción de texto y no documenta capacidades de audio.
- No se documentan tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking.
- Compatibilidad con llama.cpp y herramientas derivadas que acepten GGUF.

## Casos de uso
- Traducción sin conexión en Android para viajes o entornos sin red: integrar el GGUF en llama.cpp dentro de la aplicación, usar Q8_0 o Q6_K para frases en español, ruso y francés, y encadenar ASR/TTS del sistema. El modelo aporta traducción local sin enviar texto a la nube; la app citada ya lo usa para voz a voz, aunque el modelo no incluye audio.
- Traducción de chats y correo con tratamiento formal: Q8_0 conservó las diferencias de tratamiento tipo `tu/vous` en las pruebas del autor. Es adecuado como asistencia de escritura, con revisión humana de pronombres y fórmulas de cortesía.
- Localización de cadenas de interfaz y documentación técnica: ejecutar por lotes con llama.cpp, preferiblemente Q8_0, y dividir el texto en segmentos porque se desconoce la longitud de contexto. Requiere glosario y revisión humana para terminología.
- Evaluación de cuantizaciones para despliegue: usar el repositorio como caso de estudio Q8_0/Q6_K/Q4_K_M y medir con un corpus propio. El autor ya reporta 12/12, 10/12 y 5/12 en su prueba de 12 frases.
- Dispositivos con recursos limitados: Q4_K_M ocupa 2,49 GB y puede servir para frases simples o prototipos, pero no se recomienda para textos donde la relación sujeto-objeto sea crítica por la inversión observada. Q6_K ofrece un equilibrio más prudente.
- Traducción de subtítulos en local: encadenar ASR, traducción con Q6_K o Q8_0 y generación de subtítulos; la latencia no está medida, así que hay que validar el throughput en el hardware objetivo.
- Investigación reproducible sobre cuantización en traducción: comparar Q8_0, Q6_K y Q4_K_M contra BF16 en un corpus de español, ruso y francés. La model card incluye hashes SHA-256 para Q8_0 y Q4_K_M, lo que facilita verificar los archivos.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, BLEU, COMET, etc.) en la información disponible.

La siguiente tabla recoge la única prueba publicada por el autor. No es un benchmark estándar y se basa en 12 frases de español, ruso y francés.

| Variante | Tamaño | Coincidencias con BF16 | Observaciones |
|---|---:|---:|---|
| BF16 (referencia) | no disponible | referencia | Modelo base google/translategemma-4b-it |
| Q8_0 | 4.130.417.376 bytes (4,13 GB) | 12/12 | Variante recomendada por el autor; incluye SHA-256 en la model card |
| Q6_K | 3.190.755.296 bytes (3,19 GB) | 10/12 | Opción equilibrada |
| Q4_K_M | 2.489.909.216 bytes (2,49 GB) | 5/12 | Invierte sujeto y objeto en «Entonces me llamas…»; se conserva como referencia |

## Requisitos de hardware
- VRAM estimada: los pesos ocupan 4,13 GB en Q8_0, 3,19 GB en Q6_K y 2,49 GB en Q4_K_M. Con llama.cpp hay que sumar caché KV y sobrecarga; para contexto corto, una estimación prudente es de 5-6 GB para Q8_0, 4-5 GB para Q6_K y 3,5-4,5 GB para Q4_K_M. La longitud de contexto no está documentada, así que la VRAM real puede variar.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 y, para servir varias instancias o contextos mayores, A100 o H100. Q8_0 puede caber en GPUs consumer de 8 GB con contexto corto; Q4_K_M puede funcionar en GPUs de 6 GB, siempre con pruebas.
- Memoria unificada: los GGUF pueden ejecutarse en Apple Silicon y en equipos con CPU y RAM suficiente; el rendimiento depende del backend y del hardware.
- Despliegue: llama.cpp es la vía natural; Ollama, LM Studio o koboldcpp pueden importar GGUF. vLLM y TGI no se documentan para este repositorio.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo ni de latencia por frase.
- Advertencia de producción: Q4_K_M no es recomendable para textos sensibles a pronombres o relaciones gramaticales; Q8_0 es la opción con mayor fidelidad reportada.

## Comparativa con modelos similares
No se dispone de datos de otros modelos de traducción comparables en la información proporcionada. La comparación se limita al modelo base y a las cuantizaciones de este repositorio.

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---:|---|---|---|---|
| google/translategemma-4b-it (BF16) | 3.880.263.168 | no disponible | referencia BF16 | Gemma | Repositorio oficial del modelo base |
| Este repositorio, Q8_0 | 3.880.263.168 | no disponible | 12/12 en la prueba del autor | Gemma | GGUF en este repositorio |
| Este repositorio, Q6_K | 3.880.263.168 | no disponible | 10/12 en la prueba del autor | Gemma | GGUF en este repositorio |
| Este repositorio, Q4_K_M | 3.880.263.168 | no disponible | 5/12 en la prueba del autor | Gemma | GGUF en este repositorio |
| Otras alternativas de traducción de tamaño similar | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias
- Degradación por cuantización: Q4_K_M falla en 7 de las 12 frases de la prueba del autor e invierte sujeto y objeto; no es apto para producción si la precisión gramatical es crítica. Q6_K falla en 2 de 12; Q8_0 es la opción recomendada.
- La evaluación publicada es muy pequeña: 12 frases y sin detalle del corpus. No permite inferir BLEU, COMET ni calidad general.
- No hay benchmarks estándar, evaluación independiente ni validación comunitaria; el repositorio tenía 0 descargas y 0 likes en el momento de la consulta.
- Longitud de contexto no disponible: no se puede garantizar la traducción de documentos largos sin truncado o segmentación. Hay que probar con la longitud real de uso.
- Idiomas: solo se reportan pruebas en español, ruso y francés. No hay lista oficial de idiomas soportados; no se debe asumir cobertura de otros idiomas sin evaluarlos.
- Modelo especializado en traducción: no se documentan tool calling, agentes, visión, audio ni modo thinking. La app es voz a voz, pero el GGUF es un modelo de texto.
- Riesgo de alucinación y omisión en traducción: nombres propios, cifras, negaciones, pronombres y relaciones sujeto-objeto requieren revisión humana en dominios sensibles.
- Licencia Gemma: el uso comercial y la redistribución están sujetos a los Gemma Terms of Use y a la Gemma Prohibited Use Policy. Hay que revisar el archivo `NOTICE` y las obligaciones aplicables.
- No se documentan evaluaciones de sesgo, filtros de seguridad ni toxicidad.
- El repositorio ocupa 9,8 GB; la descarga y el almacenamiento deben tenerse en cuenta en dispositivos con poco espacio.

## Enlaces
- [Repositorio GGUF en HuggingFace](https://huggingface.co/Patrick35510/translategemma-4b-it-GGUF)
- [Modelo base google/translategemma-4b-it](https://huggingface.co/google/translategemma-4b-it)
- [Gemma Terms of Use](https://ai.google.dev/gemma/terms)
- [Gemma Prohibited Use Policy](https://ai.google.dev/gemma/prohibited_use_policy)
- No se proporcionan enlaces a paper, blog, demo, repositorio de la app TraductionGPT ni a llama.cpp en la información disponible.
