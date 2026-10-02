# malinali-app/opus-mt-lg-fi

## Resumen
malinali-app/opus-mt-lg-fi es un paquete de pesos del modelo Helsinki-NLP/opus-mt-lg-fi, preparado para traducción automática de luganda (lg) a finés (fi) en dispositivo. No se trata de un modelo entrenado desde cero por malinali-app: el repositorio reempaqueta los pesos originales en safetensors y convierte los tokenizadores SentencePiece a JSON de tokenizador rápido de Hugging Face para su uso con Candle y `marian_flutter`.

El modelo emplea la arquitectura Marian, un transformer encoder-decoder específico para traducción, con 76.609.346 parámetros. Su interés principal es que permite desplegar traducción lg-fi en entornos con recursos limitados, sin conexión a internet y sin depender de APIs externas. La longitud de contexto no está documentada en la información disponible, y tampoco se publican datos de entrenamiento, benchmarks ni licencia explícita en el repositorio.

## Especificaciones técnicas
| Parámetro | Valor |
|---|---|
| Arquitectura | Marian (transformer encoder-decoder para traducción automática) |
| Parámetros totales | 76.609.346 |
| Parámetros activos | No aplica; no es un modelo MoE |
| Longitud de contexto | No disponible en la información proporcionada |
| Tipos de cuantización | No disponible; el repositorio solo incluye pesos en safetensors. No se listan variantes GGUF, AWQ, GPTQ ni cuantizaciones INT8/INT4 |
| Idiomas soportados | Luganda (lg) y finés (fi). Dirección: lg → fi |
| Licencia | No disponible en el repositorio. La model card indica seguir la licencia del modelo base Helsinki-NLP/opus-mt-lg-fi (habitualmente CC-BY 4.0 para OPUS-MT) |
| Formato de pesos | safetensors; tokenizadores en JSON (`tokenizer-enc.json`, `tokenizer-dec.json`) |
| Modelo base | Helsinki-NLP/opus-mt-lg-fi |
| Tarea | Traducción automática / text2text-generation |

## Arquitectura y entrenamiento
El modelo utiliza la arquitectura Marian, un transformer encoder-decoder con atención estándar diseñado para traducción automática. Cuenta con 76.609.346 parámetros y deriva del modelo Helsinki-NLP/opus-mt-lg-fi, perteneciente al proyecto OPUS-MT de Helsinki-NLP. malinali-app no declara entrenamiento propio: su aportación consiste en reempaquetar los pesos en formato safetensors y convertir los tokenizadores SentencePiece a tokenizadores rápidos de Hugging Face para inferencia con Candle (`marian_flutter`).

No se proporcionan datos sobre el corpus de entrenamiento, el número de tokens, la composición del dataset ni si se aplicaron técnicas como RLHF o DPO. Tampoco se documentan innovaciones técnicas adicionales más allá del empaquetado para ejecución en dispositivo.

## Capacidades
- Traducción de texto de luganda a finés (`lg → fi`).
- Generación text2text mediante el pipeline de traducción de transformers.
- Inferencia en dispositivo a través de Candle y `marian_flutter`.
- Compatibilidad con endpoints de Hugging Face (etiqueta `endpoints_compatible`).
- Tokenizadores separados para fuente y destino, en formato JSON rápido.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo de pensamiento.
- Capacidad multilingüe limitada al par lg-fi; no se lista soporte para otros idiomas.

## Casos de uso
- Traducción offline en aplicaciones móviles: integrar el modelo con Candle en una app Flutter para traducir texto luganda-finés sin conexión. El tamaño de 76,6 M de parámetros permite ejecución en CPU o en dispositivos móviles de gama media/alta.
- Localización de interfaces y documentación: traducir cadenas de UI, textos de ayuda o manuales de luganda a finés en pipelines de localización. Adecuado para segmentos cortos y medianos, con revisión humana por tratarse de un idioma de bajos recursos.
- Atención al cliente multilingüe: traducir mensajes entrantes en luganda a finés para que agentes finlandeses puedan entenderlos. Puede desplegarse en servidor con transformers o localmente para preservar la privacidad.
- Investigación lingüística y creación de corpus: generar traducciones automáticas lg-fi para anotación, estudios comparativos o aumento de datos. El modelo base OPUS-MT es habitual en investigación en traducción de bajos recursos.
- Preprocesamiento de datos para entrenamiento: traducir grandes volúmenes de texto luganda a finés antes de construir datasets paralelos o filtrar contenido. Su bajo coste computacional facilita el procesamiento por lotes.
- Herramientas de aprendizaje de idiomas: ejercicios de traducción lg-fi en aplicaciones educativas, con corrección posterior. La inferencia local evita enviar el texto del usuario a servicios en la nube.
- Subtitulado y transcripción: traducir segmentos cortos de subtítulos de luganda a finés en tiempo real o por lotes. La latencia esperada es baja en hardware moderno, aunque no hay datos publicados de throughput.
- Automatización de localización en CI/CD: traducir recursos de software en cada commit. Requiere revisión humana por posibles errores de terminología o gramática.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware
- Parámetros: 76,6 M. VRAM estimada solo para pesos: FP32 ≈ 306 MB; FP16/BF16 ≈ 153 MB; INT8 ≈ 77 MB. Son estimaciones teóricas a partir del número de parámetros; no se proporcionan cuantizaciones oficiales.
- Memoria total recomendada: menos de 1 GB para inferencia en FP32, incluyendo overhead de tokenizadores y activaciones en secuencias cortas.
- GPU recomendadas: no requiere GPU dedicada. Cualquier GPU moderna (GTX 1650, RTX 3060, RTX 4090, A100, H100) puede ejecutarlo, aunque estaría sobredimensionada. Una CPU moderna es suficiente.
- GPU de consumo: sí, cabe en cualquier GPU de consumo e incluso en dispositivos móviles de gama media/alta si se usa Candle.
- Opciones de despliegue: transformers (pipeline de traducción), Candle mediante `marian_flutter` y Hugging Face Endpoints (etiqueta `endpoints_compatible`). No se documenta soporte para vLLM, TGI, llama.cpp u Ollama; al ser Marian, no es compatible con el ecosistema GGUF de llama.cpp sin una conversión específica.
- Latencia y throughput: no disponibles. Dependerán del hardware, la longitud de secuencia y el tamaño de lote.

## Comparativa con modelos similares
| Modelo | Parámetros | Idiomas | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| malinali-app/opus-mt-lg-fi | 76.609.346 | lg → fi | No disponible | No disponible (upstream habitualmente CC-BY 4.0) | safetensors | Repaquete para Candle |
| Helsinki-NLP/opus-mt-lg-fi | No disponible | lg → fi | No disponible | No disponible | No disponible | Modelo base del que deriva |
| Helsinki-NLP/opus-mt-fi-lg | No disponible | fi → lg | No disponible | No disponible | No disponible | Dirección inversa de la familia OPUS-MT |
| Modelos multilingües tipo NLLB | No disponible | Multilingüe | No disponible | No disponible | No disponible | Alternativa para más idiomas; no evaluada en esta ficha |

No se dispone de resultados de benchmarks que permitan comparar el rendimiento de estos modelos.

## Limitaciones y advertencias
- Modelo unidireccional `lg → fi`; no traduce en sentido inverso `fi → lg`.
- Idiomas de bajos recursos: el luganda dispone de menos datos paralelos que idiomas mayoritarios, por lo que aumenta el riesgo de errores gramaticales, omisiones, alucinaciones o traducciones literales.
- No hay métricas BLEU, chrF u otras publicadas en la información disponible.
- Longitud de contexto no documentada; conviene validar el truncamiento con entradas largas.
- Licencia no explicitada en el repositorio; la model card remite al modelo base. Verificar los términos antes de un uso comercial.
- Sin soporte documentado de tool calling, agentes, visión, audio o razonamiento multi-paso.
- Repositorio con 0 descargas y 0 likes; no hay validación de la comunidad ni discusiones.
- Fecha de creación indicada como 2026-10-02; verificar que el repositorio y los enlaces sigan activos.
- No se proporcionan cuantizaciones; si se convierten a INT8/INT4, puede degradarse la calidad de la traducción.

## Enlaces
- [malinali-app/opus-mt-lg-fi en Hugging Face](https://huggingface.co/malinali-app/opus-mt-lg-fi)
- [Helsinki-NLP/opus-mt-lg-fi en Hugging Face](https://huggingface.co/Helsinki-NLP/opus-mt-lg-fi)
- [Proyecto OPUS-MT en GitHub](https://github.com/Helsinki-NLP/Opus-MT)
- [Malinali](https://malinali.app)
