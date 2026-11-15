# mradermacher/SmolLM3-3B-Instruct-heretic-i1-GGUF

## Resumen

SmolLM3-3B-Instruct-heretic-i1-GGUF es una cuantización en formato GGUF del modelo SmolLM3-3B-Instruct-heretic, un derivado "abliterated" (sin rechazo) del SmolLM3-3B-Instruct de Hugging Face. El autor de esta conversión es mradermacher, un conocido publicador de cuantizaciones GGUF en el ecosistema de llama.cpp. El modelo base heretic fue publicado por el usuario frxstyWRLD, que a su vez parte del SmolLM3-3B-Instruct original.

La relevancia de esta ficha es acotada: se trata de un artefacto de cuantización derivado, no de un modelo nuevo con arquitectura propia. El interés práctico está en disponer de una versión de 3B parámetros en formato GGUF lista para ejecutarse en hardware de consumo, con la particularidad de que el ajuste "heretic" elimina los mecanismos de rechazo del modelo instructivo original, lo que condiciona su uso en producción.

La información pública disponible es muy escasa: la model card solo contiene metadatos del proceso de cuantización y no incluye especificaciones, benchmarks ni detalles de entrenamiento. Los datos que se ofrecen a continuación se limitan a lo verificable en la información proporcionada, y se marcan explícitamente como "no disponible" aquellos campos que no constan.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base SmolLM3-3B; arquitectura no detallada en la informacion proporcionada) |
| Parametros totales | 3B nominales en el nombre; el dato safetensors reportado (1.680.588) no es coherente con un modelo de 3B y probablemente corresponde a un recuento parcial o erroneo |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q2_K_S, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, IQ3_XXS, IQ3_XS, IQ3_M, IQ3_S, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_NL, IQ4_XS, Q4_0, Q4_1, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, IQ1_S, IQ1_M (segun metadatos de la model card) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones i1, con imatrix) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna, el dataset de entrenamiento ni el proceso de alineación del modelo base. El nombre indica que parte de SmolLM3-3B-Instruct, un modelo instructivo de 3B parámetros, pero la model card de esta conversión no reproduce ni documenta dichos detalles.

Lo único documentado es el proceso de cuantización: se han generado cuantizaciones de tipo "i1" (con matriz de importancia, imatrix) a partir de los pesos del modelo heretic de frxstyWRLD, usando el pipeline de conversión de mradermacher (convert_type: hf, quantize_version: 2). El ajuste "heretic" del modelo intermedio no está descrito en la información disponible; por el nombre se infiere que se trata de una variante orientada a reducir los rechazos del modelo instructivo, pero no se aportan detalles metodológicos.

## Capacidades

- Generación de texto e instrucciones: al derivar de SmolLM3-3B-Instruct, se espera que conserve las capacidades conversacionales del modelo original, aunque no se documentan en la información proporcionada.
- Razonamiento y conocimiento general: no verificable con los datos disponibles.
- Generación de código y matemáticas: no verificable con los datos disponibles.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (idiomas no declarados).
- Modo "thinking" o razonamiento extendido: no disponible.
- Visión o audio: no disponible; el nombre y el formato GGUF apuntan a un modelo solo de texto.
- Comportamiento "heretic": por definición del ajuste, se espera una reducción de rechazos ante peticiones que el modelo instructivo original declinaría; no hay documentación técnica que lo confirme.

## Casos de uso

- Experimentación local con modelos de 3B en formato GGUF: el modelo se puede cargar en llama.cpp u Ollama en equipos de consumo para probar el comportamiento del ajuste "heretic" frente al instructivo original, sin necesidad de GPU de datacenter.
- Investigación sobre alineación y rechazo: útil como objeto de estudio para analizar cómo cambia la tasa de negativas y la calidad de respuesta tras un ajuste abliterated, comparándolo con el SmolLM3-3B-Instruct sin modificar.
- Prototipado rápido de asistentes conversacionales: al ser un modelo pequeño y cuantizado, permite iterar en local sobre prompts y flujos de diálogo antes de escalar a modelos mayores.
- Evaluación de cuantizaciones: la disponibilidad de 24 variantes (desde IQ1_S hasta Q6_K) permite medir el compromiso entre tamaño, velocidad y calidad en un mismo modelo, un caso de uso típico de investigación en eficiencia.
- Despliegue en entornos con recursos muy limitados: las cuantizaciones de 2 y 3 bits permiten ejecutar el modelo en dispositivos con poca memoria, aunque con pérdida de calidad no cuantificada.
- Generación de texto sin restricciones temáticas en entornos controlados: el ajuste heretic puede interesar en investigación creativa o red teaming, siempre que se asuma el riesgo asociado y se apliquen filtros externos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Como referencia orientativa para un modelo de 3B en GGUF, las cuantizaciones Q4_K_M suelen ocupar alrededor de 2 GB y las Q6_K en torno a 3 GB, pero estos valores no constan en la información proporcionada y deben verificarse en el repositorio.
- GPU recomendadas: no disponible. Por el tamaño del modelo, es plausible su ejecución en GPU de consumo, pero no hay datos del autor que lo confirmen.
- ¿Cabe en GPU de consumo? No confirmado en la información disponible; el formato GGUF y el rango de cuantizaciones sugieren que sí en tarjetas con 4-8 GB de VRAM, pero es una inferencia, no un dato.
- Opciones de despliegue: llama.cpp, Ollama y otros runners compatibles con GGUF. vLLM y TGI no son el destino habitual de estos artefactos, aunque algunos runners soportan GGUF de forma parcial.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| SmolLM3-3B-Instruct-heretic-i1-GGUF (este) | 3B (nominal) | no disponible | no disponible | GGUF | Cuantizacion i1 de un derivado heretic |
| SmolLM3-3B-Instruct (original) | 3B | no disponible en esta ficha | no disponible en esta ficha | safetensors, GGUF | Modelo instructivo de referencia; conserva rechazos |
| SmolLM3-3B-Instruct-heretic (frxstyWRLD) | 3B | no disponible | no disponible | safetensors | Modelo intermedio del que se parte; sin cuantizar |
| Otras cuantizaciones GGUF de SmolLM3-3B | 3B | no disponible | no disponible | GGUF | Alternativas sin ajuste heretic |

No se dispone de datos de rendimiento para establecer una comparación cuantitativa con alternativas.

## Limitaciones y advertencias

- El ajuste "heretic" reduce o elimina los rechazos del modelo instructivo, lo que aumenta el riesgo de generar contenido dañino, sesgado o inapropiado; requiere filtros externos en cualquier despliegue.
- No hay información sobre sesgos del modelo base ni sobre cómo el ajuste heretic los modifica.
- Riesgo de alucinación no cuantificado; los modelos de 3B suelen alucinar más que modelos mayores, pero no hay datos específicos.
- Licencia no declarada: no se puede confirmar si el uso comercial está permitido; conviene consultar la licencia del SmolLM3-3B-Instruct original y del derivado heretic antes de usarlo en producción.
- Idiomas soportados no declarados; el rendimiento en castellano es desconocido.
- Longitud de contexto no documentada en esta ficha.
- El dato de parámetros totales reportado por safetensors (1.680.588) es inconsistente con un modelo de 3B y no debe tomarse como referencia fiable.
- Repositorio sin descargas ni likes en el momento de la consulta, lo que sugiere poca validación por parte de la comunidad.
- Las cuantizaciones de 1 y 2 bits (IQ1_S, IQ1_M, IQ2_XXS) degradan notablemente la calidad; no se recomiendan para uso serio.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/SmolLM3-3B-Instruct-heretic-i1-GGUF
- Modelo heretic de origen: https://huggingface.co/frxstyWRLD/SmolLM3-3B-Instruct-heretic
- Modelo base SmolLM3-3B-Instruct: https://huggingface.co/HuggingFaceTB/SmolLM3-3B-Instruct (referencia del modelo original; no enlazado en la información proporcionada)
- Repositorio de llama.cpp (runner GGUF): https://github.com/ggerganov/llama.cpp (no enlazado en la información proporcionada)
