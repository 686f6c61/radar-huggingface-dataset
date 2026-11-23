# mradermacher/Qwen3.6-Fallen-Fabulist-35B-A3B-i1-GGUF

## Resumen

Qwen3.6-Fallen-Fabulist-35B-A3B-i1-GGUF es una cuantización en formato GGUF del modelo Cyclone-Labs/Qwen3.6-Fallen-Fabulist-35B-A3B, un merge de modelos construido con mergekit y publicado por Cyclone-Labs. Esta versión concreta la distribuye mradermacher, especialista en cuantizaciones GGUF con imatrix, e incluye un conjunto amplio de variantes que van desde i1-Q2_K (13,3 GB) hasta i1-Q6_K (29,3 GB), lo que permite ejecutar un modelo de 35.505.251.456 parámetros en hardware de consumo.

El modelo base tiene 35.505.251.456 parámetros totales y, por su nombre (A3B), adopta una arquitectura de mezcla de expertos (MoE) con aproximadamente 3.000 millones de parámetros activos por token, lo que reduce el coste computacional de inferencia frente a un modelo denso del mismo tamaño. La model card del cuantizador lo describe explícitamente como un modelo de visión, con ficheros mmproj disponibles en el repositorio estático. La licencia es Apache 2.0 y el idioma declarado es únicamente inglés.

La relevancia de esta ficha radica en que permite desplegar localmente un modelo multimodal de 35B con activación dispersa mediante llama.cpp y derivados, sin depender de infraestructura en la nube. Las cuantizaciones con imatrix están calibradas para preservar la calidad en rangos bajos de bits, y el autor recomienda variantes IQ sobre las Q equivalentes en tamaño.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE), derivada de la familia Qwen3.6; detalles de capas y atención no disponibles |
| Parametros totales | 35.505.251.456 |
| Parametros activos | ~3.000 millones (según la designación A3B del nombre; no confirmado en la información proporcionada) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-Q2_K, i1-IQ3_XS, i1-IQ3_XXS, i1-IQ3_S, i1-IQ3_M, i1-Q3_K_S, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-Q4_0, i1-Q4_K_S, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K, además de fichero imatrix |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo base es un merge de modelos generado con mergekit, según las etiquetas de la model card. La designación A3B en el nombre indica una arquitectura de mezcla de expertos con aproximadamente 3.000 millones de parámetros activos por token sobre un total de 35.505.251.456, patrón habitual en la familia Qwen3.6. La model card del cuantizador identifica el modelo como multimodal (visión), con ficheros mmproj separados en el repositorio estático.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron fases de RLHF o DPO en el modelo base. El proceso de esta ficha es exclusivamente de cuantización: mradermacher aplica imatrix (matriz de importancia) calculada sobre el modelo original para generar variantes GGUF de 2 a 6 bits, con el objetivo de minimizar la degradación de perplejidad en cuantizaciones agresivas. No se documentan innovaciones de arquitectura adicionales más allá de la propia MoE.

## Capacidades

- Generación de texto conversacional en inglés, con etiqueta `conversational` en el repositorio.
- Procesamiento de imágenes: el autor clasifica el modelo como modelo de visión y publica ficheros mmproj para el proyector multimodal.
- Razonamiento y generación de código: capacidades heredadas de la familia Qwen3.6, no verificadas de forma independiente en la información disponible.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según el campo `language` de la model card.
- Modo thinking explícito: no disponible en la información proporcionada.

## Casos de uso

- Asistente conversacional local en inglés: el modelo puede desplegarse con llama.cpp u Ollama en una estación de trabajo con GPU de consumo, usando la variante i1-Q4_K_M (21,8 GB) para equilibrar calidad y velocidad en conversaciones multi-turno.
- Análisis de documentos con imágenes: gracias al proyector multimodal (mmproj), puede emplearse para describir capturas, diagramas o páginas escaneadas en pipelines de extracción de información, cargando el modelo con la variante IQ4_XS (19,3 GB) más el fichero mmproj.
- Prototipado de agentes conversacionales: la licencia Apache 2.0 permite integrar el modelo en productos comerciales sin restricciones de atribución, usando el servidor compatible con la API de OpenAI que ofrece llama.cpp.
- Generación de texto creativo y narrativo: el nombre "Fallen-Fabulist" sugiere un ajuste orientado a narrativa; puede usarse para redacción de ficción o guiones con la variante i1-Q5_K_M (25,4 GB) para preservar matices estilísticos.
- Evaluación de merges de modelos: investigadores pueden comparar el comportamiento de este merge frente a sus modelos progenitores usando las distintas cuantizaciones como proxy de calidad en entornos con VRAM limitada.
- Despliegue en entornos sin conectividad: al ser GGUF y ejecutable con llama.cpp, el modelo funciona íntegramente en local, lo que lo hace adecuado para entornos con requisitos de privacidad o aislamiento de red.
- Investigación sobre cuantización: el fichero imatrix (0,5 GB) publicado permite reproducir o generar cuantizaciones propias con calibración de importancia, útil para estudiar la degradación por bits.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: entre 13,3 GB (i1-Q2_K) y 29,3 GB (i1-Q6_K) solo para los pesos; añadir overhead de contexto KV cache, que depende de la longitud de contexto no documentada.
- GPU recomendadas: para i1-Q4_K_M (21,8 GB) se requiere una GPU de 24 GB como RTX 3090 o RTX 4090; para i1-Q6_K (29,3 GB) se necesita una RTX 5090 de 32 GB o una A100/H100 de 40 GB o más.
- Cabe en GPU de consumo: sí, en RTX 3090/4090 con cuantizaciones de 2 a 5 bits; las variantes Q6_K requieren 32 GB o más.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF; el repositorio incluye la etiqueta `endpoints_compatible`.
- Latencia y throughput: no disponibles. Al ser MoE con ~3B activos, el throughput esperado es sustancialmente mayor que el de un modelo denso de 35B, pero no se aportan cifras medidas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.6-Fallen-Fabulist-35B-A3B (esta ficha) | 35,5B totales / ~3B activos | no disponible | Apache 2.0 | GGUF, safetensors | Merge con capacidades de visión |
| Qwen3.6-Fallen-Fabulist-35B-A3B (estático) | 35,5B totales / ~3B activos | no disponible | Apache 2.0 | GGUF | Cuantizaciones sin imatrix, mismo modelo base |
| Modelo base Cyclone-Labs/Qwen3.6-Fallen-Fabulist-35B-A3B | 35,5B totales / ~3B activos | no disponible | Apache 2.0 | safetensors | Pesos originales sin cuantizar |

No se dispone de información sobre otros modelos comparables de la misma familia o tamaño en la documentación proporcionada.

## Limitaciones y advertencias

- Idioma: el modelo solo declara soporte de inglés; su uso en castellano u otros idiomas puede degradar la calidad de forma significativa.
- Alucinación: no se han publicado evaluaciones de fidelidad factual; al ser un merge de modelos, el comportamiento puede ser inconsistente entre dominios.
- Licencia: Apache 2.0 permite uso comercial, pero las licencias de los modelos progenitores del merge no se detallan en la información disponible y podrían imponer condiciones adicionales.
- Cuantizaciones de baja precisión: las variantes por debajo de Q4 (Q2_K, IQ3_XXS, IQ3_XS) degradan la calidad; el propio autor recomienda IQ3_XXS sobre Q2_K y IQ3_S sobre Q3_K_M.
- Longitud de contexto desconocida: no se documenta la ventana de contexto, lo que impide planificar el consumo de KV cache en producción.
- Capacidades multimodales: los ficheros mmproj están en el repositorio estático, no en este; es necesario descargarlos por separado para usar la visión.
- Sin datos de benchmarks: no hay métricas publicadas que permitan validar el rendimiento frente a alternativas.
- Fecha de creación del repositorio: 2026-11-20, según los metadatos de Hugging Face.

## Enlaces

- Repositorio Hugging Face (esta cuantización): https://huggingface.co/mradermacher/Qwen3.6-Fallen-Fabulist-35B-A3B-i1-GGUF
- Repositorio de cuantizaciones estáticas: https://huggingface.co/mradermacher/Qwen3.6-Fallen-Fabulist-35B-A3B-GGUF
- Modelo base: https://huggingface.co/Cyclone-Labs/Qwen3.6-Fallen-Fabulist-35B-A3B
- Página de descargas del cuantizador: https://hf.tst.eu/model#Qwen3.6-Fallen-Fabulist-35B-A3B-i1-GGUF
- Preguntas frecuentes y solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Guía de uso de GGUF (README de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Análisis de tipos de cuantización de Artefact2: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Gráfica comparativa de perplejidad por cuantización: https://www.nethype.de/huggingface_embed/quantpplgraph.png
