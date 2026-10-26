# mradermacher/AmoreLLM-1.7B-i1-GGUF

## Resumen

AmoreLLM-1.7B-i1-GGUF es un repositorio de cuantizaciones GGUF generadas por mradermacher a partir del modelo 3tic/AmoreLLM-1.7B, un modelo de lenguaje orientado a novela ligera (light novel) y etiquetado exclusivamente para chino (zh). El repositorio no contiene pesos en formato original ni código de entrenamiento: su valor esta en ofrecer los mismos pesos del modelo base en formatos comprimidos listos para inference en llama.cpp y derivados, con cuantizaciones de tipo imatrix (sufijo i1) y cuantizaciones estáticas en un repositorio hermano.

El modelo base es de autoría de 3tic y se distribuye bajo licencia Apache 2.0, lo que permite uso comercial y modificaciones siempre que se respeten las condiciones de la licencia. No se publica en la información disponible ni la arquitectura exacta, ni la longitud de contexto, ni el proceso de entrenamiento (dataset, tokens, RLHF/DPO), por lo que cualquier evaluación técnica del modelo debe hacerse empíricamente sobre los pesos.

La relevancia práctica del repositorio es doble: por un lado, permite ejecutar un modelo de ~1.7B de parámetros en hardware muy modesto (CPU, iGPU, GPUs de 4-8 GB) mediante cuantizaciones de 1 a 4 bits; por otro, el archivo imatrix incluido permite generar cuantizaciones propias con la matriz de importancia calculada por el autor. Con 0 descargas y 0 likes en el momento de la consulta, se trata de un artefacto reciente y sin validación comunitaria.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible. La model card no describe la arquitectura; el pipeline declarado es `transformers` y el nombre del modelo base sugiere un transformer decoder-only, pero no se confirma documentalmente |
| Parámetros totales | No disponible de forma fiable. Los metadatos de safetensors del repositorio indican 1.034.740 parámetros, cifra incompatible con el identificador del modelo (1.7B); probablemente el dato esté mal extraído. El nombre del modelo declara 1.7B |
| Parámetros activos | No aplica / no disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | GGUF con cuantizaciones imatrix (i1): IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K_S, Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ3_XXS, IQ3_XS, IQ3_S, IQ3_M, small-IQ4_NL, IQ4_XS, Q4_0, Q4_1, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K. Incluye fichero imatrix (`AmoreLLM-1.7B.imatrix.gguf`, 0.1 GB). Cuantizaciones estáticas en `mradermacher/AmoreLLM-1.7B-GGUF` |
| Idiomas soportados | Chino (zh); no se declaran otros idiomas |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizado); el repositorio base se distribuye para `transformers` |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base 3tic/AmoreLLM-1.7B: la model card del repositorio cuantizado es una plantilla genérica de mradermacher y no incluye detalles de capas, tipo de atención, tokenizador ni estrategia de posicionamiento. Tampoco se documenta el proceso de entrenamiento: ni el número de tokens, ni la composición del dataset, ni si hubo ajuste por instrucciones con RLHF, DPO o SFT. La única pista funcional es la etiqueta `lightnovel` y el idioma `zh`, que sitúan el modelo en el nicho de generación de ficción ligera en chino, probablemente mediante fine-tuning de un modelo base más pequeño no identificado.

La innovación técnica del repositorio no está en el modelo sino en el proceso de cuantización: mradermacher aplica cuantización con matriz de importancia (imatrix), calculada a partir de datos de calibración, lo que en la práctica reduce la perplejidad de las cuantizaciones de baja precisión (IQ1, IQ2, IQ3) frente a las cuantizaciones estáticas equivalentes. El autor publica el propio fichero imatrix para que terceros puedan reproducir o generar cuantizaciones alternativas, y remite a la comparativa de tipos de cuantización de ikawrakow y a las notas de Artefact2 sobre la relación entre tipo de cuantización y perplejidad.

## Capacidades

- Generación de texto en chino con estilización propia de novela ligera (prosa narrativa, diálogos, descripciones de personajes).
- Continuación de ficción y escritura creativa guiada por prompt, presumiblemente con menor capacidad de instrucción general al no documentarse un ajuste instructivo específico.
- Conversación multi-turno de temática narrativa o roleplay, limitada por la longitud de contexto no documentada.
- Soporte de tool calling / function calling: no disponible, no documentado.
- Soporte de agentes y razonamiento multi-paso: no disponible, no documentado.
- Capacidades multilingües: no documentadas; la etiqueta de idioma es exclusivamente `zh`.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.
- Ejecución en CPU y GPU de gama baja gracias a las cuantizaciones de 1 a 6 bits incluidas en el repositorio.

## Casos de uso

- Generación asistida de novelas ligeras en chino: el modelo puede continuar capítulos manteniendo el registro literario y el estilo de los personajes, aprovechando la cuantización Q4_K_M o Q5_K_M para conservar calidad de prosa con un consumo de VRAM mínimo.
- Roleplay de personajes en aplicaciones de chat: al estar afinado sobre light novel, encaja en bots de personajes con personalidad marcada para audiencias chinas, desplegado en local con llama.cpp u Ollama y sin coste por token.
- Prototipado de pipelines de inferencia GGUF: sirve como modelo de pruebas ligero para validar integraciones con llama-cpp-python, Ollama o text-generation-webui antes de escalar a modelos mayores con el mismo formato.
- Generación de diálogos para novela visual, manga o videojuego narrativo en chino: producción de líneas de diálogo ramificadas en lote, con cuantización IQ3 o Q4 para maximizar rendimiento por hora de GPU.
- Despliegue en dispositivos de borde o entornos sin GPU: las cuantizaciones IQ1_S/IQ2_M permiten ejecutar el modelo en CPU con poca RAM, útil para demos offline o prototipos en portátiles modestos.
- Investigación sobre cuantización: el fichero imatrix publicado permite reproducir la matriz de importancia y comparar la degradación de perplejidad entre tipos de cuantización sobre un modelo del dominio literario chino.
- Generación de datos sintéticos en chino para ajuste fino posterior: con supervisión humana y filtrado, el modelo puede producir borradores narrativos a gran escala amparados por la licencia Apache 2.0.
- Base para fine-tuning específico de dominio: al ser Apache 2.0 y de tamaño reducido, es viable reentrenar sobre estilos de autor o sagas concretas con recursos limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye MMLU, HumanEval, GSM8K, C-Eval ni ninguna otra métrica, y el modelo base 3tic/AmoreLLM-1.7B no aporta datos en la documentación consultada.

## Requisitos de hardware

- VRAM estimada para inferencia (estimación a partir de un modelo denso de ~1.7B parámetros, no confirmada por el autor): IQ1_S ≈ 0.4-0.5 GB; IQ2_M ≈ 0.6-0.7 GB; Q3_K_M ≈ 0.8-0.9 GB; Q4_K_M ≈ 1.0-1.1 GB; Q5_K_M ≈ 1.2-1.3 GB; Q6_K ≈ 1.4-1.5 GB; FP16 ≈ 3.4-3.5 GB. Añadir 0.3-1.0 GB adicionales de caché KV según longitud de contexto y número de secuencias.
- GPU recomendadas: cualquier GPU consumer con 4 GB o más (GTX 1650, RTX 3050, RTX 4060, RTX 4090) puede ejecutar las cuantizaciones Q4_K_M y Q5_K_M con contexto moderado; para FP16 se recomienda 6-8 GB (RTX 3060, RTX 4060 Ti) o superior.
- Cabe en GPU consumer: sí, en la práctica totalidad de GPUs dedicadas de los últimos ocho años, y en iGPU con memoria unificada para cuantizaciones de 1 a 3 bits.
- Despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python, text-generation-webui, koboldcpp. vLLM y TGI tienen soporte limitado o experimental de GGUF; para producción con concurrencia alta conviene convertir a safetensors y usar vLLM, o servir las cuantizaciones con llama.cpp server.
- Latencia y throughput: no disponibles. Como referencia orientativa no medida, un modelo de ~1.7B en Q4_K_M sobre una RTX 4090 suele superar ampliamente el centenar de tokens por segundo, y sobre CPU moderna de escritorio se sitúa en el orden de decenas de tokens por segundo, pero estos valores no han sido verificados para este modelo concreto.

## Comparativa con modelos similares

No se dispone de benchmarks ni de especificaciones del modelo base en la información proporcionada, por lo que la comparación se limita a características verificables de repositorio y licencia. Los datos de los modelos alternativos provienen del conocimiento general del ecosistema y no han sido verificados en esta búsqueda.

| Modelo | Parámetros | Contexto | Licencia | Idiomas | Notas |
|---|---|---|---|---|---|
| AmoreLLM-1.7B (este repositorio, cuantizado) | 1.7B declarados (metadatos safetensors inconsistentes) | No disponible | Apache 2.0 | zh | Afinado a light novel; sin benchmarks ni validación comunitaria (0 descargas) |
| Qwen2.5-1.5B-Instruct | 1.5B | 32 768 tokens | Apache 2.0 | Multilingüe (incluye chino) | Referencia generalista con benchmarks publicados; no especializado en ficción |
| Qwen3-1.7B | 1.7B | 32 768 tokens (extensible) | Apache 2.0 | Multilingüe | Referencia generalista con modo de razonamiento; no especializado en ficción |
| AmoreLLM-1.7B-GGUF (cuantizaciones estáticas) | 1.7B declarados | No disponible | Apache 2.0 | zh | Mismo modelo base, cuantizaciones sin imatrix |

## Limitaciones y advertencias

- Idioma único: el modelo solo declara chino; no hay evidencia de competencia en castellano ni en otras lenguas, por lo que no debe usarse para generación o traducción multilingüe sin evaluación previa.
- Ausencia total de benchmarks: no existe ninguna métrica publicada que permita comparar su calidad con alternativas; cualquier decisión de producción debe basarse en una evaluación propia.
- Riesgo elevado de alucinación y de deriva narrativa, habitual en modelos de ~1.7B sin ajuste por instrucciones documentado; la coherencia decae con contextos largos.
- Inconsistencia en el recuento de parámetros: los metadatos de safetensors indican 1.034.740 parámetros frente a los 1.7B del identificador, lo que impide confirmar el tamaño real y, por tanto, los requisitos de hardware.
- Cuantizaciones de 1 y 2 bits (IQ1_S, IQ1_M, IQ2_XXS) degradan notablemente la calidad; no se recomiendan para producción literaria, solo para pruebas en hardware muy limitado.
- Licencia Apache 2.0 permite uso comercial, pero la procedencia y las condiciones del modelo base 3tic/AmoreLLM-1.7B no están documentadas en la información disponible; conviene verificar el repositorio original antes de un despliegue comercial.
- Riesgo de reproducción de estilos protegidos: al estar especializado en light novel, puede generar contenido que replique obras o personajes con derechos de autor si se le induce con prompts específicos.
- Repositorio sin tracción ni mantenimiento verificable (0 descargas, 0 likes, actualizado el mismo día de su creación) y con un tamaño de repo declarado de 0.0 GB; la disponibilidad real de todos los ficheros de cuantización debe comprobarse antes de integrarlo en un pipeline.
- No se documenta soporte de tool calling, agentes ni plantillas de chat, por lo que su integración en sistemas con function calling requerirá ingenería adicional y probablemente no funcione de forma fiable.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mradermacher/AmoreLLM-1.7B-i1-GGUF
- Modelo base: https://huggingface.co/3tic/AmoreLLM-1.7B
- Cuantizaciones estáticas del mismo modelo: https://huggingface.co/mradermacher/AmoreLLM-1.7B-GGUF
- Página de descargas del autor para este modelo: https://hf.tst.eu/model#AmoreLLM-1.7B-i1-GGUF
- Solicitudes de cuantización y FAQ del autor: https://huggingface.co/mradermacher/model_requests
- Guía de uso de ficheros GGUF (referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Comparativa de tipos de cuantización (gráfico de ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre tipos de cuantización: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa que soporta al cuantizador: https://www.nethype.de/
