# GLASSEYE/quill-poetry-v2

## Resumen

Quill poetry v2 es un adaptador LoRA de generación de poesía publicado por el usuario GLASSEYE en HuggingFace, construido sobre el modelo instruct `mistralai/Mistral-7B-Instruct-v0.3`. No se distribuye como modelo autónomo: el repositorio contiene únicamente los pesos del adaptador en formato safetensors, con un tamaño total de 0,1 GB, que deben cargarse junto al modelo base de 7.000 millones de parámetros mediante la librería PEFT. Su dominio objetivo es la escritura poética con métrica y formas cerradas, no la asistencia generalista.

El autor describe un corpus más denso que el de la versión anterior (quill-poetry-v1), con ejercicios específicos de haiku 5-7-5, pareados yámbicos, tanka, pantoum, villanelle y revisión de borradores. Según la model card, el entrenamiento se realizó en una única GPU RTX 5070 de uso doméstico, y se menciona un GGUF generado localmente para ejecutarlo con Ollama mediante el comando `ollama run quill`.

Su relevancia es acotada pero clara: es un ejemplo de especialización de bajo coste sobre un modelo abierto de 7B para una tarea creativa muy concreta, con licencia Apache 2.0 tanto en el adaptador como en el modelo base. El repositorio no publica métricas, composición del dataset ni hiperparámetros, y en el momento de redactar esta ficha acumula 0 descargas y 0 "likes", por lo que su calidad no está validada por terceros.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre un transformer decoder-only denso (Mistral-7B-Instruct-v0.3) |
| Parámetros totales | 7B en el modelo base; parámetros entrenables del adaptador: no disponible (repo de 0,1 GB, rango LoRA no especificado) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No indicada en la model card; el modelo base Mistral-7B-Instruct-v0.3 declara 32.768 tokens |
| Tipos de cuantización | No se publican cuantizaciones propias del adaptador; el autor menciona un GGUF generado localmente para Ollama. El modelo base admite cuantizaciones de 8 y 4 bits mediante bitsandbytes, GPTQ, AWQ o llama.cpp |
| Idiomas soportados | No disponible en la model card; hereda los del modelo base (no confirmado por el autor) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador LoRA/PEFT); GGUF generado por el autor para Ollama |
| Tipo de modelo | Adaptador de ajuste fino, no modelo completo |
| Modelo base | mistralai/Mistral-7B-Instruct-v0.3 |
| Autor | GLASSEYE |
| Fecha de publicación | 2026-09-20 (según metadatos de HuggingFace) |
| Última actualización | 2026-09-20 |
| Tamaño del repositorio | 0,1 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA, es decir, un conjunto de matrices de bajo rango insertadas en las capas del transformer del modelo base. El transformer subyacente es el de Mistral-7B-Instruct-v0.3, un decoder-only denso de 7B parámetros con Grouped-Query Attention y atención de ventana deslizante. Al ser un adaptador, la arquitectura efectiva en inferencia es la del modelo base más la contribución del LoRA; el repositorio no contiene pesos completos ni tokenizer propio, y depende de PEFT para su carga.

La model card describe el corpus de entrenamiento como un "corpus más denso" que el de la v1, centrado en formas métricas concretas: ejercicios de haiku 5-7-5, pareados yámbicos, tanka, pantoum, villanelle y tareas de revisión. El entrenamiento se realizó, según el autor, en una única RTX 5070 y de forma continuada desde quill-poetry-v1. No se especifican el número de tokens de entrenamiento, la composición exacta del dataset, el rango o alpha del LoRA, la tasa de aprendizaje, el número de épocas ni si se aplicaron técnicas de alineación adicionales como RLHF o DPO. Tampoco se documentan innovaciones técnicas propias ni estrategias de decodificación específicas.

## Capacidades

- Generación de poesía con formas métricas cerradas: haiku con patrón 5-7-5, pareados yámbicos, tanka, pantoum y villanelle, según la descripción del autor.
- Revisión y reescritura de borradores poéticos, tarea incluida explícitamente en el corpus de entrenamiento.
- Escritura creativa en verso en general, incluyendo ajuste de métrica y estructura estrófica.
- Conversación instruct básica: el adaptador se monta sobre Mistral-7B-Instruct-v0.3, por lo que conserva el comportamiento de chat del modelo base, aunque el ajuste fino puede degradarlo.
- Soporte de tool calling / function calling: el modelo base Mistral-7B-Instruct-v0.3 lo declara; no hay evidencia de que el adaptador lo preserve ni de que se haya evaluado.
- Razonamiento multi-paso y uso como agente: no documentado para este adaptador.
- Capacidades multilingües: no documentadas; dependen del modelo base.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.

## Casos de uso

- Generación de haikus y poemas breves con métrica fija: el adaptador está entrenado específicamente con ejercicios 5-7-5, por lo que es adecuado para producir poemas sujetos a un patrón silábico estricto en lugar de verso libre genérico.
- Asistencia a poetas en revisión de borradores: la tarea de revisión forma parte del corpus declarado, de modo que el modelo puede reescribir un poema manteniendo la forma y ajustando el ritmo o la rima.
- Creación de contenido editorial para blogs o revistas literarias: generación de piezas cortas en formas fijas (tanka, villanelle, pantoum) que después un editor humano revisa, con un coste de inferencia bajo al ser un modelo de 7B.
- Prototipado de aplicaciones creativas: al ser un LoRA de 0,1 GB sobre un base Apache 2.0, permite experimentar con especialización de estilo sin reentrenar un modelo completo, por ejemplo montando el adaptador sobre el base en un endpoint propio.
- Ejercicios educativos de métrica y verso: uso como generador de ejemplos para clases de poesía o para ilustrar formas métricas concretas, con la salvedad de que la corrección métrica del modelo no está evaluada.
- Integración en un asistente local con Ollama: el autor indica que puede ejecutarse con `ollama run quill` tras refrescar un GGUF local, lo que permite desplegarlo en una estación de trabajo con GPU de gama media sin conexión a servicios externos.
- Comparación de estilos entre iteraciones del adaptador: al existir una v1 y una v2 del mismo autor, sirve para estudiar cómo cambia la salida al variar la densidad y las formas del corpus de ajuste.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

La model card no incluye métricas cuantitativas de ningún tipo (ni perplejidad, ni evaluación humana, ni comparaciones con otros adaptadores). La búsqueda web realizada no devolvió resultados relacionados con el modelo: únicamente aparecieron hilos de soporte sobre correo electrónico de un proveedor de telecomunicaciones, sin ninguna relación con este repositorio.

## Requisitos de hardware

- VRAM del adaptador: 0,1 GB en disco; la carga del LoRA añade un consumo marginal de memoria sobre el modelo base.
- VRAM del modelo base en FP16/BF16: aproximadamente 14-15 GB, más el coste de la caché KV.
- VRAM en cuantización de 8 bits: aproximadamente 8 GB.
- VRAM en cuantización de 4 bits: aproximadamente 4-6 GB, dependiendo de la longitud de contexto y del tamaño de lote.
- GPU recomendadas: A100 40 GB, H100, L40S o RTX 6000 Ada para FP16 con lotes grandes; RTX 4090, RTX 3090 o similares de 24 GB para FP16 con lotes pequeños o cuantización de 8 bits.
- GPU de consumo: cabe en tarjetas de 12-16 GB (RTX 4070, RTX 4080, RTX 5070, RTX 3060 de 12 GB) usando cuantización de 4 bits. El autor indica que el entrenamiento se hizo en una RTX 5070, aunque no se especifica la configuración exacta.
- Opciones de despliegue: transformers + PEFT (ruta nativa del adaptador), vLLM con soporte de adaptadores LoRA, TGI con adaptadores, llama.cpp/Ollama previa conversión a GGUF (mencionado por el autor), y servidores compatibles con la API de OpenAI.
- Latencia y throughput estimados: no disponible. No se han publicado mediciones.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de quill-poetry-v2, por lo que la comparación se limita a atributos verificables de tamaño, contexto y licencia. No se han identificado adaptadores de poesía comparables en la información proporcionada.

| Modelo | Parámetros | Contexto | Tipo | Licencia | Rendimiento |
|---|---|---|---|---|---|
| GLASSEYE/quill-poetry-v2 | 7B (base) + LoRA | Heredado del base (32.768 tokens declarados) | Adaptador LoRA especializado en poesía | apache-2.0 | No disponible |
| mistralai/Mistral-7B-Instruct-v0.3 | 7B | 32.768 tokens | Modelo instruct generalista | apache-2.0 | No comparable directamente; sin adaptador de poesía |
| Qwen2.5-7B-Instruct | 7B | 32.768 tokens (128K en variantes ampliadas) | Modelo instruct generalista | apache-2.0 (la mayoría de variantes) | No disponible en esta ficha; no especializado en métrica poética |
| Llama-3.1-8B-Instruct | 8B | 128.000 tokens | Modelo instruct generalista | Llama 3.1 Community License (no Apache 2.0) | No disponible en esta ficha; no especializado en métrica poética |

Las alternativas generalistas no están ajustadas para formas métricas cerradas, de modo que la comparación relevante sería contra otros adaptadores de poesía del mismo modelo base, y no se han encontrado en la información disponible.

## Limitaciones y advertencias

- El repositorio contiene solo el adaptador: es imprescindible descargar y ejecutar Mistral-7B-Instruct-v0.3 (unos 14-15 GB en FP16) para poder usar el modelo.
- No hay ninguna evaluación publicada: ni benchmarks, ni comparación humana, ni ejemplos de salida en la model card. La afirmación de que el corpus es "más denso" y las formas están "más ajustadas" procede únicamente del autor.
- Con 0 descargas y 0 "likes", el modelo carece de validación por parte de la comunidad y de informes independientes de calidad.
- Riesgo de sobreajuste al corpus de entrenamiento: al ser un ajuste fino continuado sobre una tarea muy estrecha, es probable que degrade capacidades generales del modelo base como el razonamiento, el código o el seguimiento de instrucciones complejas. No se ha medido esa degradación.
- Riesgo de alucinación: el modelo puede producir texto formalmente métrico pero con contenido factualmente incorrecto o sin sentido; no debe usarse como fuente de información.
- Ámbito de idioma no documentado: no se especifica si el adaptador conserva el multilingüismo del base ni si funciona fuera del inglés. La model card está redactada en inglés y el corpus parece orientado a la métrica inglesa (haiku, pareados yámbicos, villanelle), lo que sugiere un rendimiento limitado en castellano.
- Idiomas distintos del inglés y métricas distintas de las entrenadas (por ejemplo, sonetos o verso libre en español) no están cubiertos y no hay garantía de calidad.
- Licencia: el adaptador y el modelo base son Apache 2.0, lo que permite uso comercial. Debe conservarse la atribución y los avisos de licencia, y conviene verificar los términos del dataset de entrenamiento, que no se documenta.
- Despliegue en producción: la ausencia de datos sobre hiperparámetros del LoRA, tolerancia a cuantización y estabilidad de la salida hace desaconsejable su uso en sistemas automatizados sin una validación previa y sin revisión humana.
- Metadatos anómalos: las fechas de creación y actualización indican 2026-09-20 y el repositorio se actualizó 15 segundos después de su creación, lo que apunta a una publicación de prueba o a metadatos poco fiables.
- La información de la model card es mínima (unas cinco líneas) y no incluye dataset, configuración de entrenamiento ni ejemplos.

## Enlaces

- Página del modelo en HuggingFace: https://huggingface.co/GLASSEYE/quill-poetry-v2
- Modelo base: https://huggingface.co/mistralai/Mistral-7B-Instruct-v0.3
- Repositorio de PEFT (librería indicada en los tags): https://github.com/huggingface/peft
- No se han encontrado otros enlaces relevantes (papers, blogs, repositorios o demos) en la búsqueda web realizada.
