# mradermacher/qwen2.5-3b-character-imitation-GGUF

## Resumen

`mradermacher/qwen2.5-3b-character-imitation-GGUF` es una colección de cuantizaciones GGUF estáticas del modelo `ws-fy/qwen2.5-3b-character-imitation`, un ajuste fino mediante LoRA (entrenado con LLaMA-Factory) sobre Qwen2.5-3B-Instruct, orientado a imitación de personajes, transferencia de estilo y roleplay. El modelo resultante conserva la arquitectura densa del transformer decoder-only de Qwen2.5 con 3.085.938.688 parámetros (aproximadamente 3,09 mil millones).

El interés práctico de esta publicación es doble: por un lado, empaqueta el ajuste fino en 12 variantes GGUF (desde Q2_K de 1,4 GB hasta f16 de 6,3 GB), lo que permite ejecutarlo en hardware de consumo muy modesto; por otro, expone las limitaciones típicas de los ajustes LoRA de nicho, como la ausencia de benchmarks publicados y de datos sobre el corpus de entrenamiento. Es un modelo pensado para experimentación local con personajes conversacionales, no para cargas de producción críticas.

El repositorio, creado el 27 de octubre de 2026, no registra descargas ni interacciones en el momento de redactar esta ficha, por lo que no existe validación comunitaria independiente del comportamiento del modelo. La licencia heredada es `qwen-research`, lo que restringe el uso comercial sin acuerdo adicional con el titular de los derechos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (familia Qwen2.5), con RoPE, RMSNorm, SwiGLU y atención GQA |
| Parametros totales | 3.085.938.688 (3,09 B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens según la configuración de Qwen2.5-3B-Instruct; no se especifica en la model card del autor |
| Tipos de cuantizacion | f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K |
| Idiomas soportados | zh (chino) y en (inglés), según los metadatos de la model card |
| Licencia | qwen-research (etiquetada como `other`, con enlace a la licencia de Qwen/Qwen2.5-3B-Instruct) |
| Formato de pesos | GGUF (cuantizaciones estáticas); el modelo original en safetensors está en `ws-fy/qwen2.5-3b-character-imitation` |
| Tamano del repositorio | 27,9 GB (incluye todas las variantes) |
| Pipeline | no disponible |
| Fecha de publicacion | 2026-10-27 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-3B: un transformer decoder-only denso con 36 capas, atención con query grouping (16 cabezas de consulta y 2 de clave/valor), dimensión oculta de 2048, tamaño intermedio de 11008 y vocabulario de 151.936 tokens, con embeddings atados. El ajuste se realizó sobre la variante Instruct, según indican los tags `qwen2.5` y `lora` junto con la referencia al modelo base.

Sobre el proceso de ajuste fino, la información disponible es escasa: la model card sólo declara que se empleó LLaMA-Factory con un adaptador LoRA y que el objetivo es la imitación de personajes y la transferencia de estilo. No se publican el número de tokens de entrenamiento, la composición del dataset, ni si hubo etapas de RLHF o DPO posteriores al ajuste supervisado. Tampoco se documenta el rango y alpha del LoRA, la tasa de aprendizaje ni la estrategia de enmascaramiento de pérdida. mradermacher únicamente ha aplicado conversión a GGUF y cuantización estática; advierte de que no ha generado cuantizaciones ponderadas con imatrix.

## Capacidades

- Generación de texto conversacional multi-turno, con foco en mantener una voz de personaje consistente.
- Imitación de personajes y transferencia de estilo: reproducción de registros, tonos y patrones de habla definidos en el prompt de sistema.
- Roleplay y narrativa interactiva: diálogos ficcionales, descripciones de escena y continuidad de personalidad.
- Razonamiento general y conocimiento procedente de Qwen2.5-3B-Instruct, en menor medida que modelos de mayor tamaño.
- Generación de código y matemáticas básicas, heredadas del modelo Instruct base.
- Soporte multilingüe limitado a chino e inglés según los metadatos declarados; no se declara cobertura de castellano.
- Compatibilidad con plantillas de chat de Qwen2.5 (ChatML) a través de los metadatos GGUF.
- Soporte de tool calling y razonamiento agéntico multi-paso: no documentado en esta model card; el ajuste LoRA sobre un modelo Instruct no garantiza que dichas capacidades se conserven intactas.

## Casos de uso

- Prototipado local de chatbots de personaje: con la cuantización Q4_K_M (2,0 GB) el modelo cabe en cualquier GPU de 4 GB o incluso en CPU, lo que permite iterar sobre prompts de sistema y fichas de personaje sin coste de infraestructura.
- Previsualización de personajes para videojuegos o narrativa interactiva: el LoRA está entrenado específicamente para imitar un registro concreto, de modo que sirve para validar la coherencia de voz antes de invertir en un modelo mayor.
- Generación de diálogos para guiones y ficción: dado un contexto de escena, el modelo produce intervenciones con estilo homogéneo, útil para borradores que luego se revisan manualmente.
- Transferencia de estilo en textos cortos: reescritura de párrafos manteniendo la voz del personaje objetivo, siempre con revisión humana dado el riesgo de deriva.
- Base para un segundo ajuste fino: al ser un GGUF derivado de un LoRA, puede servir como referencia de calidad o como punto de partida para comparar adaptadores propios sobre Qwen2.5-3B.
- Evaluación comparativa de cuantizaciones: el repositorio ofrece 12 variantes del mismo modelo, lo que facilita medir la degradación de calidad conversacional entre Q2_K y Q8_0 en un caso de uso realista.
- Demostraciones offline y entornos sin conectividad: al ejecutarse con llama.cpp u Ollama, el modelo funciona en equipos aislados sin enviar datos a terceros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del autor no incluye métricas de MMLU, HumanEval, GSM8K ni evaluaciones específicas de imitación de personajes, y tampoco se han encontrado en la búsqueda web datos atribuibles a este ajuste concreto.

## Requisitos de hardware

- VRAM estimada para inferencia (sólo pesos): 1,4 GB (Q2_K), 1,9-2,0 GB (Q4_K_S/Q4_K_M), 2,3 GB (Q5_K_M), 3,4 GB (Q8_0), 6,3 GB (f16). Hay que sumar la caché KV, que con 32.768 tokens de contexto y arquitectura GQA puede crecer varios cientos de MB.
- GPU de consumo: cabe holgadamente en GTX 1060 6 GB, RTX 3060 12 GB, RTX 4060 Ti, RTX 4070 y RTX 4090. En Q4_K_M funciona incluso en iGPUs con memoria unificada.
- GPU de datacenter: A100, H100 y L40S están sobredimensionadas para un modelo de 3 B; su uso sólo se justifica por agregación de muchas instancias concurrentes.
- Ejecución en CPU: viable con llama.cpp; con Q4_K_M el modelo ocupa unos 2 GB de RAM, por lo que funciona en portátiles convencionales.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y llama-cpp-python son las rutas naturales para GGUF. vLLM y TGI están pensados para los pesos en safetensors del modelo base; el soporte de GGUF en vLLM es parcial.
- Latencia y throughput: no se han publicado mediciones para este modelo. Como referencia cualitativa, a 3 B de parámetros en Q4_K_M sobre una GPU de consumo la generación es interactiva, pero no hay cifras verificables en la información disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| qwen2.5-3b-character-imitation (este) | 3,09 B | 32.768 (heredado, no confirmado en la card) | qwen-research | GGUF en este repo; safetensors en el repo base | Ajuste LoRA para imitación de personajes; sin benchmarks publicados |
| Qwen2.5-3B-Instruct | 3,09 B | 32.768, ampliable a 131.072 con RoPE scaling | qwen-research | Pesos oficiales en safetensors y múltiples GGUF de terceros | Modelo base; capacidades generales e Instruct sin especializar en personajes |
| Llama-3.2-3B-Instruct | 3,21 B | 131.072 | Llama 3.2 Community License | Pesos oficiales y amplio ecosistema GGUF | Mayor ventana de contexto; licencia con restricciones para grandes despliegues |
| Phi-3.5-mini-instruct | 3,82 B | 131.072 | MIT | Pesos oficiales y GGUF de terceros | Licencia permisiva y buen rendimiento en razonamiento para su tamaño |

La comparación de rendimiento cuantitativo no está disponible: no existen benchmarks publicados de este ajuste que permitan situarlo frente a las alternativas.

## Limitaciones y advertencias

- Ausencia total de validación: 0 descargas y 0 likes en el momento de la ficha, sin evaluaciones independientes ni informes de terceros.
- Licencia `qwen-research`: restringe el uso comercial. Cualquier despliegue en producto requiere revisar los términos y, en su caso, negociar una licencia con el titular de Qwen.
- Idiomas declarados zh y en: no hay garantía de calidad en castellano, aunque la familia Qwen2.5 tenga cierta cobertura multilingüe no declarada aquí.
- Riesgo de deriva de personaje: los ajustes LoRA de imitación pierden consistencia al alargar la conversación o al salir del dominio del corpus de entrenamiento, que además no está documentado.
- Alucinación: al ser un modelo de 3 B, la tasa de afirmaciones incorrectas es mayor que en modelos de 7 B o superiores; no debe usarse como fuente factual sin verificación.
- Contenido sensible: los modelos de roleplay pueden producir respuestas de índole violenta o sexual; el filtrado debe implementarse en la capa de aplicación.
- Pérdida de capacidades del modelo base: no se documenta si el ajuste conserva tool calling, razonamiento multi-paso o matemáticas a nivel del Instruct original.
- Cuantizaciones de baja precisión: Q2_K y Q3_K_S degradan notablemente la coherencia; el propio autor marca Q3_K_M como "lower quality" y desaconseja f16 por "overkill".
- Sin cuantizaciones ponderadas con imatrix: el autor indica que no las ha generado, por lo que no se dispone de la mejora de perplejidad que suelen aportar.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/qwen2.5-3b-character-imitation-GGUF
- Modelo base (adaptador LoRA): https://huggingface.co/ws-fy/qwen2.5-3b-character-imitation
- Modelo Instruct de referencia: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Licencia aplicada: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct/blob/main/LICENSE
- Listado y descarga de cuantizaciones: https://hf.tst.eu/model#qwen2.5-3b-character-imitation-GGUF
- Guía de uso de GGUF citada por el autor: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Peticiones de cuantización del autor: https://huggingface.co/mradermacher/model_requests
- Comparativa de tipos de cuantización: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
