# SOL4R1S/Hy-MT2-1.8B-GGUF

## Resumen

Hy-MT2-1.8B-GGUF es una redistribución en formato GGUF del modelo de traducción automática tencent/Hy-MT2-1.8B, publicada por el usuario SOL4R1S. El modelo original lo desarrolla Tencent y está especializado en traducción automática con cobertura de 38 idiomas. Esta versión concreta no introduce cambios en los pesos más allá de la cuantización: se trata de conversiones estándar a Q4_K_M y Q3_K_M generadas con llama.cpp, pensadas para su uso en entornos con recursos limitados, como la aplicación iOS HyTranslator del mismo autor.

El modelo base cuenta con 1.791.080.448 parámetros (aproximadamente 1,8 mil millones), lo que lo sitúa en la gama de modelos pequeños optimizados para inferencia eficiente. Al estar cuantizado en 4 y 3 bits, los ficheros ocupan entre 951 MB y 1,13 GB, lo que permite ejecutarlo en dispositivos móviles y en GPUs de consumo. La licencia Apache-2.0 del modelo original se hereda en esta distribución, lo que facilita su integración en productos comerciales.

La relevancia de esta ficha radica en que ofrece una vía práctica para desplegar un traductor multilingüe especializado sin necesidad de infraestructura de servidor, aunque con las limitaciones propias de un modelo de 1,8B parámetros y de una cuantización agresiva. No se dispone de información sobre el rendimiento comparativo ni sobre la composición exacta del entrenamiento en la documentación proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base de traducción, presumiblemente transformer; no confirmado en la información proporcionada) |
| Parametros totales | 1.791.080.448 |
| Parametros activos | no aplica (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M y Q3_K_M (GGUF); el modelo base en safetensors permite otras cuantizaciones |
| Idiomas soportados | 38 idiomas (según la model card del autor de la cuantización) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (ficheros Q4_K_M y Q3_K_M); el modelo base en safetensors |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo base tencent/Hy-MT2-1.8B en la documentación proporcionada. Por el nombre y el tamaño (1,8B parámetros) y por su orientación a traducción automática, se trata presumiblemente de un transformer encoder-decoder o decoder-only especializado, pero este dato no está confirmado en la información disponible. Tampoco se detallan el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO.

Lo que sí está documentado es el proceso de cuantización: se realizó una conversión a f16 desde los safetensors oficiales mediante `convert_hf_to_gguf.py` de llama.cpp (commit `3549c274dc22001d9118713fa56a10085b85de3b`) y posteriormente se aplicó `llama-quantize` para generar las variantes Q4_K_M y Q3_K_M. Se incrustó la plantilla de chat oficial del modelo base. Los parámetros de muestreo recomendados por el autor son temperatura 0,7, top_p 0,8, top_k 20 y penalización de repetición 1,05. El autor advierte que estos ficheros no son idénticos bit a bit al Q4_K_M que publica el repositorio oficial de Tencent.

## Capacidades

- Traducción automática entre 38 idiomas, según la model card del autor de la cuantización.
- Generación de texto conversacional, ya que la etiqueta del repositorio incluye `conversational` y se ha incrustado la plantilla de chat oficial.
- Compatibilidad con llama.cpp y, por extensión, con el ecosistema GGUF (Ollama, servidores compatibles con la API de endpoints, etc.).
- Ejecución en dispositivos con recursos limitados gracias a las cuantizaciones de 4 y 3 bits.
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking en la información disponible.
- El soporte multilingüe se limita a los 38 idiomas declarados; no se especifica la lista completa ni la calidad por par de idiomas.

## Casos de uso

- Traducción integrada en aplicaciones móviles: el tamaño de 951 MB (Q3_K_M) y 1,13 GB (Q4_K_M) permite embeber el modelo en apps iOS o Android con llama.cpp, como hace HyTranslator, ofreciendo traducción offline sin depender de la nube.
- Traducción de documentación técnica en pipelines de CI/CD: el modelo puede invocarse desde scripts para traducir README, comentarios o mensajes de commit entre los 38 idiomas soportados, con la ventaja de que la licencia Apache-2.0 permite uso comercial.
- Atención al cliente multilingüe en el borde: desplegado en un servidor pequeño o en un dispositivo, puede pre-traducir mensajes entrantes antes de pasarlos a un sistema de gestión de tickets, reduciendo la latencia frente a APIs externas.
- Subtitulado y localización de contenido: integrado en herramientas de post-procesado, puede traducir transcripciones o subtítulos en lotes, con la ventaja de que el modelo cabe en una GPU de consumo y no requiere conexión.
- Prototipado rápido de funciones de traducción: para equipos que evalúan la calidad de un traductor especializado antes de invertir en infraestructura, esta cuantización permite probar el modelo base de Tencent en un portátil con 8 GB de RAM.
- Traducción en entornos con requisitos de privacidad: al ejecutarse localmente, los textos no salen del dispositivo, lo que resulta adecuado para documentos internos o datos personales que no pueden enviarse a servicios en la nube.
- Investigación en eficiencia de cuantización: los ficheros publicados permiten comparar el comportamiento de Q4_K_M y Q3_K_M sobre un mismo modelo base de traducción, con hashes SHA256 verificables para reproducibilidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del autor de la cuantización no incluye métricas de calidad (BLEU, chrF, COMET) ni comparaciones con otros modelos, y la información proporcionada no contiene datos del modelo base de Tencent.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,2-1,5 GB para Q4_K_M y 1,0-1,3 GB para Q3_K_M, incluyendo overhead de contexto y caché KV (estimación orientativa; no confirmada en la información disponible).
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM libre; tarjetas como RTX 3060, RTX 4060, RTX 4090, A100 o H100 pueden ejecutarlo sobradamente, aunque el modelo está claramente sobredimensionado para GPUs de datacenter.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU de consumo moderna (GTX 1050 Ti en adelante) e incluso en GPUs integradas con memoria compartida suficiente.
- Cabe en dispositivos móviles: sí, según el uso previsto por el autor (app iOS HyTranslator), con 1-2 GB de RAM disponibles.
- Opciones de despliegue: llama.cpp, Ollama, servidores compatibles con la API de endpoints (la etiqueta `endpoints_compatible` así lo indica) y cualquier runtime que soporte GGUF.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Hy-MT2-1.8B-GGUF (esta ficha) | 1,79B | no disponible | 38 | Apache-2.0 | GGUF (Q4_K_M, Q3_K_M) |
| tencent/Hy-MT2-1.8B (base) | 1,79B | no disponible | 38 | Apache-2.0 | safetensors |
| Q4_K_M oficial de Tencent | 1,79B | no disponible | 38 | Apache-2.0 | GGUF (Q4_K_M) |

La única comparación documentada es con el modelo base y con la cuantización oficial de Tencent, que el autor señala como no idéntica bit a bit. No se dispone de información sobre otros modelos de traducción comparables (por ejemplo, NLLB, M2M-100 o modelos especializados de tamaño similar) en la documentación proporcionada, por lo que no se puede establecer una comparativa de rendimiento fiable.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información disponible; al ser un modelo de traducción, es esperable que herede sesgos de sus datos de entrenamiento, pero no se detallan.
- Riesgo de alucinación: no cuantificado; en modelos de traducción de 1,8B parámetros, la fidelidad puede degradarse en textos largos, dominios especializados o pares de idiomas poco representados.
- Limitaciones de contexto: la longitud máxima de contexto no está documentada, lo que impide garantizar el comportamiento en documentos largos.
- Limitaciones de idioma: se declaran 38 idiomas, pero no se especifica la lista ni la calidad por par; es probable que los pares con poco datos de entrenamiento rindan peor.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero se requiere atribución al modelo base de Tencent según indica el autor de la cuantización.
- Caveat de producción: el autor advierte que estos ficheros no son idénticos bit a bit al Q4_K_M oficial de Tencent; para entornos críticos conviene evaluar ambas versiones.
- La cuantización Q3_K_M, aunque más pequeña, puede degradar la calidad de traducción de forma notable frente a Q4_K_M; no hay métricas publicadas que cuantifiquen esta pérdida.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso comunitario ni validación externa.

## Enlaces

- Repositorio Hugging Face de esta cuantización: https://huggingface.co/SOL4R1S/Hy-MT2-1.8B-GGUF
- Modelo base: https://huggingface.co/tencent/Hy-MT2-1.8B
- Aplicación HyTranslator (GitHub): https://github.com/SOL4R1S/HyTranslator
- llama.cpp (repositorio del runtime utilizado): https://github.com/ggerganov/llama.cpp
