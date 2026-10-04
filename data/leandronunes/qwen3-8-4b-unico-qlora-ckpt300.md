# leandronunes/Qwen3.8-4B-UniCo-QLoRA-ckpt300

## Resumen

Qwen3.8-4B-UniCo-QLoRA-ckpt300 es un adaptador LoRA entrenado mediante QLoRA (cuantización de 4 bits en formato NF4) sobre el modelo base `empero-ai/Qwen3.8-4B-Distill`. Lo publica el usuario leandronunes en HuggingFace y su objetivo declarado es adaptar el modelo a tareas de razonamiento científico y causal, no a una simple adaptación léxica o temática de un dominio concreto.

El adaptador se entrenó con el dataset UniCo, en una versión balanceada de 2.400 ejemplos, con una longitud máxima de secuencia de 10.240 tokens. El entrenamiento se hizo con Unsloth y TRL (`SFTTrainer`) sobre una Tesla T4 de 14,5 GB, con LoRA de rango 16, alpha 32 y batch efectivo de 8, durante 300 pasos (aproximadamente una época). El repositorio contiene el checkpoint del paso 300.

Es relevante porque muestra un flujo de trabajo reproducible de ajuste fino eficiente en VRAM consumer para modelos con arquitecturas híbridas de atención lineal: el propio autor documenta que Unsloth tuvo que pasar el entrenamiento de float16 a float32 por los bloques Gated DeltaNet, que el packing fue ignorado para esta arquitectura y que el kernel Liger no aportó ganancias. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre un modelo base transformer híbrido con bloques de atención lineal Gated DeltaNet |
| Parametros totales | Modelo base: ~4B nominalmente (según el nombre del modelo, no confirmado en la información disponible). Adaptador LoRA: no disponible |
| Parametros activos | No aplica (no se indica que el modelo base sea MoE) |
| Longitud de contexto | 10.240 tokens como longitud máxima de entrenamiento. Contexto nativo del modelo base: no disponible |
| Tipos de cuantizacion | Entrenamiento con QLoRA 4-bit NF4. Cuantizaciones de inferencia del adaptador: no disponibles |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (`adapter_model.safetensors`) más `adapter_config.json` (formato PEFT); el repositorio incluye además el estado completo guardado por `SFTTrainer` |

## Arquitectura y entrenamiento

El artefacto es un adaptador PEFT, no un modelo completo: se carga sobre `empero-ai/Qwen3.8-4B-Distill`. Según la model card, ese modelo base usa una arquitectura híbrida que combina bloques de atención lineal Gated DeltaNet con otras capas, lo que condiciona varias decisiones del entrenamiento. Los módulos objetivo solicitados fueron `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj` y `down_proj`; Unsloth filtra los módulos compatibles durante la preparación, de modo que los adaptadores acaban en las proyecciones de self-attention y en las MLP soportadas.

La configuración de entrenamiento fue: rango LoRA 16, alpha 32 (escala alpha/r = 2), dropout 0, bias none y RSLoRA deshabilitado. Se usó learning rate 1e-4 con scheduler cosine y 15 pasos de warmup, weight decay 0,0, gradient clipping 1,0 y optimizador `adamw_8bit`. El batch por dispositivo fue 1 con acumulación de gradiente 8 (batch efectivo 8) para poder trabajar con secuencias de 10.240 tokens en una T4 de 14,5 GB. El dataset fue una versión balanceada de UniCo con 2.400 ejemplos, pensada para ejemplos de razonamiento científico y relaciones causales; con batch efectivo 8 y 300 pasos, el plan declarado equivale aproximadamente a una época.

Como innovaciones o particularidades técnicas, la model card destaca el uso de gradient checkpointing de Unsloth con smart gradient offloading y double buffering, que el packing fue ignorado por la arquitectura híbrida de atención lineal y que el entrenamiento se ejecutó finalmente en float32 pese a que el `SFTConfig` declaraba `fp16=True`, porque Unsloth detectó que esta arquitectura no entrena correctamente en float16. No se documenta uso de RLHF ni DPO, ni el número total de tokens vistos más allá de la longitud máxima y el número de ejemplos.

## Capacidades

- Generación de texto conversacional en inglés, heredada del modelo base, según el `pipeline_tag` de text-generation y el tag conversational.
- Razonamiento científico y causal: es el objetivo explícito del ajuste con el dataset UniCo.
- Contenido de biología, con mención específica a zebrafish (pez cebra) entre las etiquetas del repositorio.
- Razonamiento encadenado en contextos largos: el entrenamiento admite hasta 10.240 tokens por ejemplo, lo que sugiere cadenas de razonamiento y contextos extensos.
- Soporte de tool calling o function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según la model card.
- Capacidades especiales (modo thinking, visión o audio): no disponibles en la información proporcionada.

## Casos de uso

- Análisis de literatura científica en biología: el adaptador está ajustado con ejemplos de razonamiento científico y causal, por lo que puede emplearse para resumir o relacionar causalmente hallazgos de artículos, con la advertencia de que no es un sistema de revisión sistemática según el propio autor.
- Extracción de relaciones causales en textos experimentales: dado un protocolo o unos resultados, el modelo puede proponer cadenas de causa-efecto sobre un corpus de hasta 10.240 tokens por ejemplo de entrenamiento, útil para preprocesar notas de laboratorio.
- Asistencia en investigación con pez cebra: las etiquetas del repositorio incluyen zebrafish, de modo que encaja en flujos de trabajo de biología del desarrollo donde se consultan fenotipos y resultados experimentales.
- Prototipado de asistentes de razonamiento científico en local: al ser un adaptador QLoRA sobre un modelo de ~4B, se puede desplegar en una GPU consumer para pruebas internas de razonamiento sobre dominios científicos.
- Generación de explicaciones paso a paso para material docente: el ajuste en cadenas de razonamiento permite producir explicaciones estructuradas de fenómenos biológicos, siempre con revisión humana.
- Base para experimentos de ajuste incremental: al ser un adaptador PEFT con licencia Apache 2.0, sirve como punto de partida para seguir entrenando con dominios adicionales o para comparar configuraciones de LoRA en arquitecturas híbridas.
- Evaluación de pipelines de QLoRA en hardware limitado: el repositorio documenta decisiones de memoria (batch 1, acumulación 8, gradient checkpointing) reproducibles en una T4, útil como referencia para equipos con GPUs de gama media.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Entrenamiento documentado: Google Colab con Tesla T4 de 14,5 GB de VRAM, con secuencias de 10.240 tokens, batch por dispositivo 1, acumulación de gradiente 8 y cuantización 4-bit NF4.
- Inferencia del adaptador: los pesos del adaptador ocupan una fracción pequeña del repositorio (0,1 GB en total), pero requieren cargar además el modelo base de ~4B. La VRAM dependerá de la cuantización elegida para el modelo base y del tamaño de la caché KV; no se proporcionan cifras medidas.
- Estimación orientativa (no confirmada por el autor): un modelo de ~4B en 4-bit suele requerir del orden de 3 GB solo para los pesos, más la caché KV, que crece de forma lineal con el contexto y puede ser el factor dominante a 10.240 tokens. Estas cifras son estimaciones y no datos publicados para este modelo.
- GPU recomendadas: no disponibles. La única GPU mencionada en la documentación es la Tesla T4 usada para el entrenamiento.
- ¿Cabe en GPU consumer? El entrenamiento sí cupo en una T4 de 14,5 GB con las optimizaciones descritas; para inferencia no hay datos publicados, aunque el tamaño nominal del modelo base sugiere que es viable en GPUs consumer con cuantización, sin confirmación del autor.
- Opciones de despliegue: al ser un adaptador PEFT, se puede cargar con `peft` o con Unsloth y fusionar con el modelo base; a partir de la fusión se podría exportar a GGUF para llama.cpp u Ollama, o servir con vLLM o TGI. Ninguna de estas rutas está documentada en la información disponible para este modelo concreto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-4B-UniCo-QLoRA-ckpt300 | ~4B (base) + adaptador LoRA | 10.240 tokens de entrenamiento; contexto del base no disponible | Sin benchmarks publicados | apache-2.0 | Adaptador en HuggingFace, 0 descargas, 0 likes |
| empero-ai/Qwen3.8-4B-Distill (modelo base) | ~4B nominal | No disponible | No disponible en la información proporcionada | No disponible en la información proporcionada | Modelo base en HuggingFace |
| Otros adaptadores QLoRA de razonamiento científico | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos verificables de alternativas de la misma categoría en la información proporcionada, por lo que la comparación se limita al modelo base.

## Limitaciones y advertencias

- No es un modelo completo: requiere descargar y cargar `empero-ai/Qwen3.8-4B-Distill` además del adaptador.
- Solo soporta inglés según la model card; no hay evidencia de capacidades multilingües.
- Riesgo de alucinación: no se han publicado evaluaciones de fidelidad, verificación factual ni tasas de error, por lo que en dominios científicos cualquier salida debe validarse con fuentes primarias.
- El propio autor advierte que el entrenamiento no pretendía convertir el modelo en un sistema de revisión sistemática, sino mejorar el trabajo con ejemplos de razonamiento científico y causal del conjunto de entrenamiento.
- Contradicción documental sobre el estado del entrenamiento: la model card afirma que el checkpoint del paso 300 «no representa el final planeado del entrenamiento de 300 steps» y, a la vez, que corresponde «aproximadamente al primer tercio del entrenamiento planeado». Con 2.400 ejemplos y batch efectivo 8, 300 pasos equivalen a una época, lo que resulta inconsistente con la idea de un tercio. Debe tratarse como un checkpoint intermedio sin garantías de convergencia.
- Dataset muy pequeño (2.400 ejemplos) y una sola época: riesgo alto de sobreajuste al estilo y a los temas del conjunto UniCo.
- La adaptación se aplicó solo a los módulos compatibles que Unsloth conservó en la arquitectura híbrida, de modo que la cobertura real de capas puede ser menor que la lista de módulos objetivo solicitada.
- No hay información sobre sesgos, datos de preentrenamiento del modelo base ni procesos de alineación (RLHF/DPO) en la información proporcionada.
- Licencia Apache 2.0 declarada para el adaptador, pero no se especifica la licencia del modelo base, que debe verificarse por separado antes de un uso comercial.
- Estado de adopción nulo: 0 descargas y 0 likes, sin validación por parte de la comunidad ni evaluaciones independientes.
- La búsqueda web realizada no devolvió resultados relevantes sobre este modelo; los enlaces obtenidos no guardan relación con él y no se han usado como fuente.

## Enlaces

- Repositorio del adaptador en HuggingFace: https://huggingface.co/leandronunes/Qwen3.8-4B-UniCo-QLoRA-ckpt300
- Modelo base: https://huggingface.co/empero-ai/Qwen3.8-4B-Distill
- Dataset UniCo: no se proporciona enlace en la información disponible
- Papers, blogs, repositorios o demos adicionales: no disponibles; la búsqueda web no devolvió resultados relacionados con el modelo
