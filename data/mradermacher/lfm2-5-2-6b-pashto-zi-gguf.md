# mradermacher/LFM2.5-2.6B-Pashto-Zi-GGUF

## Resumen

LFM2.5-2.6B-Pashto-Zi-GGUF es la versión cuantizada en formato GGUF del modelo nassimjp/LFM2.5-2.6B-Pashto-Zi, un ajuste fino del modelo LFM2.5 de LiquidAI orientado al pastún (پښتو). El trabajo de cuantización lo firma mradermacher, un conocido publicador de versiones GGUF de la comunidad, que ofrece hasta doce variantes de cuantización estática (desde Q2_K hasta f16) para facilitar la inferencia local en hardware modesto. El modelo base cuenta con 2.691.134.464 parámetros (aproximadamente 2,6 mil millones) y se distribuye bajo licencia Apache 2.0.

El interés principal de esta ficha radica en su especialización lingüística: frente a los modelos multilingües genéricos, este ajuste incorpora un tokenizador extendido para pastún, urdú y persa, lo que mejora la eficiencia de codificación y la calidad de generación en lenguas de escritura árabe-persa habitualmente infrarrepresentadas en los corpus de entrenamiento. La familia LFM2.5 de LiquidAI está diseñada para despliegue eficiente en el borde, y esta variante mantiene esa filosofía al ofrecer cuantizaciones que caben en GPUs de consumo.

La relevancia actual es doble: por un lado, cubre un hueco práctico para aplicaciones en pastún (atención al ciudadano, traducción, educación) con un modelo pequeño y de licencia permisiva; por otro, demuestra el flujo habitual de la comunidad open source, donde un ajuste fino especializado se publica primero en safetensors y se redistribuye después en GGUF para su uso con llama.cpp y herramientas compatibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible en la informacion proporcionada (modelo base LFM2.5 de LiquidAI; familia descrita por el autor como causal-lm con soporte conversacional) |
| Parametros totales | 2.691.134.464 (2,6 B) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | etiquetados: en, pastun (پښتو), urdu (اردو), persa (فارسی); la model card solo declara `en` en el campo `language` |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base. El repositorio se etiqueta como `causal-lm` y `conversational`, y el nombre indica que deriva de la familia LFM2.5 de LiquidAI, pero no se especifican el tipo de bloque (transformer, híbrido o SSM), el número de capas, las dimensiones ocultas ni la estrategia de atención. Tampoco se documentan el número de tokens de entrenamiento, la composición del corpus ni si hubo fases de RLHF o DPO.

El elemento técnico diferencial que sí queda patente en las etiquetas es la extensión del tokenizador (`tokenizer-extension`, `embedding`) para pastún, urdú y persa. Esto implica que el ajuste fino no se limita a reentrenar pesos sobre el vocabulario original, sino que amplía el vocabulario para representar de forma más compacta la escritura árabe-persa, reduciendo el número de tokens por palabra y mejorando la eficiencia en contexto y en coste de inferencia. La cuantización la realiza mradermacher de forma estática; según la model card, no hay cuantizaciones ponderadas con imatrix disponibles en el momento de la publicación.

## Capacidades

- Generación de texto causal en pastún, urdú y persa, con soporte adicional de inglés según las etiquetas del repositorio.
- Formato conversacional: el repositorio incluye la etiqueta `conversational`, lo que indica que el modelo está preparado para diálogos multi-turno con plantilla de chat.
- Tokenizador extendido para lenguas de escritura árabe-persa, con mejor relación tokens/palabra que un tokenizador multilingüe genérico.
- Uso como modelo base para ajustes posteriores en tareas específicas de pastún (el repositorio se etiqueta como `language-model` y `base_model`).
- Compatibilidad con endpoints (`endpoints_compatible`) y con el ecosistema transformers.
- No se documentan capacidades de tool calling, function calling, razonamiento multi-paso, visión, audio ni modo de pensamiento explícito.

## Casos de uso

- Atención al ciudadano en pastún: despliegue de un asistente conversacional en una administración o ONG que atienda consultas en pastún, con un modelo de 2,6 B cuantizado a Q4_K_M (1,8 GB) que puede ejecutarse en una GPU de consumo o incluso en CPU con llama.cpp.
- Traducción pastún-inglés y pastún-urdú: uso del modelo como traductor especializado en un pipeline de traducción, aprovechando el tokenizador extendido para reducir la fragmentación de palabras en escritura árabe-persa.
- Generación de contenido educativo: creación de materiales escolares, resúmenes y ejercicios en pastún para plataformas de aprendizaje, con la ventaja de una licencia Apache 2.0 que permite uso comercial y redistribución.
- Moderación y clasificación de texto en pastún: adaptación mediante ajuste fino ligero para clasificar comentarios o detectar contenido inapropiado en comunidades de habla pastún, donde los modelos multilingües grandes suelen fallar por falta de datos.
- Prototipado rápido en local: uso de las cuantizaciones Q4_K_S o Q4_K_M con Ollama o llama.cpp para validar ideas de producto en pastún sin coste de API ni dependencia de la nube.
- Investigación lingüística: análisis de representaciones y evaluación de modelos pequeños especializados en lenguas de bajos recursos, comparando el efecto de la extensión del tokenizador frente a modelos multilingües de tamaño similar.
- Asistencia a la traducción en entornos con conectividad limitada: despliegue en dispositivos de borde (portátiles, mini-PC) para traductores que trabajan en zonas con internet intermitente, gracias al tamaño reducido de las cuantizaciones Q3 y Q4.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (según tamaño del archivo GGUF): Q2_K ~1,2 GB; Q3_K_S ~1,4 GB; Q4_K_S ~1,7 GB; Q4_K_M ~1,8 GB; Q5_K_M ~2,0 GB; Q6_K ~2,3 GB; Q8_0 ~3,0 GB; f16 ~5,5 GB. A estas cifras hay que sumar el espacio para la caché KV, que depende del contexto configurado.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para cuantizaciones Q4 (GTX 1650, RTX 3050, RTX 4060); 6-8 GB para Q6_K y Q8_0 (RTX 3060, RTX 4060 Ti, RTX 3070); f16 requiere 8 GB o más (RTX 3080, RTX 4070, A10). Para despliegues de servidor, A100 o H100 no son necesarias por el tamaño del modelo, pero pueden usarse para servir muchas instancias concurrentes.
- Cabe en GPU de consumo: sí, en todas las cuantizaciones hasta Q8_0 con GPUs de 8 GB; f16 cabe en GPUs de 8 GB o más con contexto moderado.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), Ollama, LM Studio, text-generation-webui, y servidores compatibles con la API de OpenAI mediante llama.cpp server. vLLM y TGI no soportan GGUF de forma nativa generalizada, por lo que para esos motores habría que usar el modelo base en safetensors.
- Latencia y throughput estimados: no disponibles en la información proporcionada; dependerán de la GPU, la cuantización y la longitud de contexto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| LFM2.5-2.6B-Pashto-Zi (GGUF) | 2,6 B | no disponible | Apache 2.0 | GGUF | Especializado en pastún, urdú y persa con tokenizador extendido |
| Modelo base LFM2.5 de LiquidAI | no disponible | no disponible | no disponible | safetensors | Modelo original sin ajuste lingüístico; referencia para comparar la mejora del ajuste |
| Modelos multilingües pequeños tipo Qwen2.5-3B o Llama-3.2-3B | ~3 B | 32 K / 128 K según versión | Apache 2.0 / Llama Community | safetensors, GGUF | Cobertura multilingüe amplia pero sin especialización en pastún; tokenizador menos eficiente para escritura árabe-persa |

La comparación cuantitativa de rendimiento no está disponible porque no se han publicado benchmarks del modelo ajustado ni del base en la información proporcionada.

## Limitaciones y advertencias

- No se han publicado evaluaciones de sesgo, toxicidad ni alucinación para este ajuste; se desconoce el comportamiento en dominios sensibles.
- El campo `language` de la model card solo declara `en`, mientras que las etiquetas mencionan pastún, urdú y persa; conviene validar empíricamente la calidad en cada idioma antes de usarlo en producción.
- La longitud de contexto no está documentada; planificar el despliegue sin asumir ventanas largas hasta verificarlo con el modelo base.
- El ajuste fino sobre un modelo de 2,6 B implica menor capacidad de razonamiento complejo que modelos de mayor tamaño; no es adecuado para tareas que requieran matemáticas avanzadas o código extenso.
- La cuantización Q2_K y Q3_K_M pueden degradar notablemente la calidad; la propia model card marca Q3_K_M como "lower quality" y recomienda Q4_K_S o Q4_K_M como opción rápida.
- No hay cuantizaciones con imatrix disponibles según la model card, lo que puede suponer una ligera pérdida de calidad frente a cuantizaciones ponderadas en los tamaños bajos.
- Aunque la licencia es Apache 2.0, conviene revisar las condiciones del modelo base y de los datos de ajuste fino (no documentados) para usos comerciales en pastún.
- El repositorio ocupa 24,3 GB por incluir todas las cuantizaciones; descargar solo el archivo necesario para evitar consumo innecesario de disco y ancho de banda.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/LFM2.5-2.6B-Pashto-Zi-GGUF
- Modelo base (safetensors): https://huggingface.co/nassimjp/LFM2.5-2.6B-Pashto-Zi
- Página de descargas del cuantizador: https://hf.tst.eu/model#LFM2.5-2.6B-Pashto-Zi-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Discusión sobre tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantización de mradermacher: https://huggingface.co/mradermacher/model_requests
- Empresa del cuantizador: https://www.nethype.de/
