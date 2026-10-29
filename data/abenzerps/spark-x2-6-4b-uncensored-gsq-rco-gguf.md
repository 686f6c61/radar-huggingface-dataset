# abenzerps/Spark-X2.6-4B-Uncensored-GSQ-RCO-GGUF

## Resumen

Spark-X2.6-4B-Uncensored-GSQ-RCO-GGUF es un conjunto de cuantizaciones GGUF de precisión mixta del modelo XHToken/Spark-X2.6-4B, un transformer denso de 4.112.079.360 parámetros (aproximadamente 4,1 B) publicado por el usuario abenzerps. No se trata de un modelo entrenado desde cero ni de un fine-tune, sino de una redistribución optimizada para inferencia local en `llama.cpp`, con el objetivo declarado de preservar la coherencia de razonamiento en arquitecturas de atención híbrida, que según el autor se degradan de forma severa con cuantizaciones de baja precisión convencionales.

El problema que aborda es concreto: los esquemas de cuantización estándar (por ejemplo, K-quants genéricos en 2-3 bits) introducen deriva de representación en los mecanismos de compuerta de atención, lo que afecta a tareas de razonamiento de varios pasos. La propuesta GSQ-RCO mantiene en BF16 las 36 compuertas sigmoidales headwise de atención (`g_proj`) y las 9 proyecciones de atención global completa, y aplica precisión por capa guiada por calibración de sensibilidad Hessiana.

La relevancia actual viene de dos factores: el contexto declarado de hasta 1.048.576 tokens (1 M) y un rango de pesos que va de 1,64 GB a 2,59 GB, lo que permite ejecutar ventanas de 128 k tokens en GPUs de consumo con KV cache de 4 bits. La licencia es Apache-2.0, heredada del modelo base, y los idiomas declarados son inglés y chino.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso con atención híbrida (compuertas sigmoidales headwise + capas de atención global completa); tipo exacto de bloque no disponible |
| Parámetros totales | 4.112.079.360 (4,1 B) según safetensors del modelo base |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | Hasta 1.048.576 tokens (1 M) según el autor; configuraciones prácticas documentadas de 16 k, 32 k y 131 k |
| Tipos de cuantización | GGUF IQ2_M (2,60 bpw), IQ3_S (3,25 bpw), IQ3_M (3,75 bpw, recomendada), IQ4_XS (4,25 bpw); esquema mixto GSQ-RCO con tensor overrides e imatrix |
| Idiomas soportados | Inglés (en) y chino (zh) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (también existen safetensors del modelo base, no incluidos en este repo) |

## Arquitectura y entrenamiento

El modelo base XHToken/Spark-X2.6-4B emplea una arquitectura de atención híbrida: 36 compuertas sigmoidales headwise de atención (`g_proj`) y 9 proyecciones de atención global completa, combinando capas de atención local con capas de atención global. Este repo no entrena ni modifica los pesos en cuanto a aprendizaje; aplica un pipeline de cuantización post-entrenamiento. No se dispone de información sobre el número de tokens de entrenamiento del modelo base, la composición del dataset ni si se aplicaron fases de RLHF, DPO u otras técnicas de alineamiento.

La innovación técnica está en el esquema de cuantización GSQ-RCO. RCO (atención de compuertas en precisión completa) mantiene sin cuantizar en BF16 las 36 compuertas `g_proj` y las 9 proyecciones de atención global, que son los tensores más sensibles de la arquitectura. GSQ asigna precisión por capa según una calibración de sensibilidad Hessiana, combinada con una matriz de importancia (tag `imatrix`), de modo que las capas con mayor impacto en la salida conservan más bits. El resultado es un tamaño por debajo de lo que exigiría una cuantización uniforme de la misma calidad nominal, con bpw efectivos de 2,60 a 4,25.

Conviene señalar una ambigüedad: el nombre del repositorio incluye la etiqueta "Uncensored", pero la model card no documenta ningún proceso de abliteración, fine-tune o modificación de comportamiento respecto al modelo base. Todo apunta a que la etiqueta se arrastra del nombre comercial del build y no a un entrenamiento diferenciado; no hay evidencia publicada que lo confirme.

## Capacidades

- Generación de texto conversacional multi-turno, con soporte nativo de ventanas de contexto muy largas (hasta 1 M tokens según el autor).
- Razonamiento de varios pasos y modo de razonamiento (tags `reasoning` y `spark2_5`); el autor orienta el build a preservar coherencia en cadenas de razonamiento bajo cuantización agresiva.
- Generación de código: la galería de LocalAI describe el modelo base como orientado a conversación, razonamiento, programación y tareas multilingües.
- Capacidades multilingües limitadas a inglés y chino según los metadatos de la model card.
- Inferencia local eficiente con soporte de Flash Attention (`-fa`), KV cache cuantizada (`-ctk q4_0 -ctv q4_0`) y offload completo a GPU (`-ngl 99`).
- Compatibilidad con servidor OpenAI-compatible mediante `llama-server` (tag `endpoints_compatible`).
- Soporte de tool calling / function calling: no documentado en la información disponible.
- Soporte de agentes y multi-step reasoning orquestado: no documentado; el tag `reasoning` sugiere capacidad de razonamiento interno, no integración de agentes.
- Capacidades de visión o audio: no disponibles.

## Casos de uso

- Asistente conversacional local en inglés o chino: con el archivo IQ3_M (2,28 GB) y `llama-server`, se puede desplegar un endpoint compatible con la API de OpenAI en una estación de trabajo sin GPU dedicada de gran tamaño, manteniendo conversaciones multi-turno de 16 k a 32 k tokens con huella de memoria de unos 3 GB.
- Análisis de documentos largos en portátiles: el autor documenta 131.072 tokens de contexto con KV cache en 4 bits dentro de 3,5-4 GB de VRAM total, lo que permite resumir o consultar contratos, informes o bases de código extensas en hardware de consumo.
- Prototipado de pipelines de razonamiento: útil para validar cadenas de razonamiento y prompts de tipo "thinking" en local antes de escalar a modelos mayores, gracias a que el esquema GSQ-RCO preserva las capas críticas en BF16.
- Asistencia de programación en entornos aislados: al ser un GGUF ejecutable con `llama.cpp` sin telemetría ni dependencias de red, encaja en entornos con requisitos de confidencialidad donde no se permite enviar código a APIs externas.
- Despliegue en dispositivos de borde o CPU: la variante IQ2_M de 1,64 GB permite ejecución en equipos con 4-8 GB de RAM, útil para demos, prototipos embebidos o entornos con recursos muy restringidos.
- Evaluación comparativa de cuantizaciones: el repo publica cuatro niveles de bpw con el mismo esquema, lo que lo convierte en un banco de pruebas para medir la degradación de calidad frente a tamaño en arquitecturas de atención híbrida.
- Servicio interno de bajo coste con `llama-server --port 8080`: al exponer una API compatible con OpenAI, se puede integrar en herramientas existentes (clientes SDK, LangChain, etc.) sin adaptadores propietarios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numéricos en la información disponible. La model card incluye únicamente una imagen de benchmark alojada en el repositorio (`assets/benchmark.png`) sin tabla de valores asociada, por lo que no es posible extraer cifras de MMLU, HumanEval, GSM8K ni de ninguna otra métrica. Tampoco se documentan comparaciones cuantitativas frente a cuantizaciones estándar del mismo modelo base, pese a que la argumentación del autor se apoya en una supuesta degradación de estas últimas.

## Requisitos de hardware

- VRAM para los pesos: 1,64 GB (IQ2_M), 2,05 GB (IQ3_S), 2,28 GB (IQ3_M) y 2,59 GB (IQ4_XS). Añadir entre 0,5 y 1,5 GB adicionales para KV cache y buffers según contexto.
- Contexto de 128 k tokens: el autor indica 3,5-4 GB de VRAM total con IQ3_M y KV cache `q4_0` en clave y valor, con Flash Attention activada.
- GPU de consumo: sí cabe en RTX 3060 12 GB, RTX 4060 Ti 8 GB, RTX 4070/4080/4090 y en GPUs de 6-8 GB con contexto moderado. En equipos de 4 GB solo con IQ2/IQ3 y contextos reducidos o KV cuantizada.
- GPU de datacenter: A100, H100 y L40S son sobredimensionadas para 4 B de parámetros; solo tienen sentido si se necesita servir muchos usuarios concurrentes o contextos de 1 M tokens.
- CPU: ejecutable con `llama.cpp` sin GPU; el modelo de 4 B en IQ3_M es viable en CPU moderna con 8-16 GB de RAM, a throughput bajo.
- Opciones de despliegue documentadas: `llama.cpp` (`llama-cli`, `llama-server`) y Ollama (`ollama run hf.co/abenzerps/...:IQ3_M`). Soporte de vLLM o TGI para estos GGUF: no documentado.
- Latencia y throughput: no disponibles. No se publican tokens por segundo ni cifras de tiempo hasta el primer token para ningún hardware.

## Comparativa con modelos similares

Datos de los competidores tomados de su documentación pública; conviene verificarlos antes de tomar decisiones de producción. Los valores de la columna Spark corresponden a este repositorio.

| Modelo | Parámetros | Contexto | Licencia | Formato / disponibilidad |
|---|---|---|---|---|
| Spark-X2.6-4B (este repo, GGUF) | 4,1 B denso | 1 M declarados (131 k verificado en configuración del autor) | Apache-2.0 | GGUF en HF; llama.cpp y Ollama |
| XHToken/Spark-X2.6-4B (base) | 4,1 B denso | 1 M declarados | Apache-2.0 | Safetensors en HF |
| Qwen3-4B | ~4 B denso | 32 k nativo, 131 k con YaRN | Apache-2.0 | Safetensors, GGUF de terceros; ecosistema amplio |
| Llama 3.2 3B | 3,2 B denso | 128 k | Llama 3.2 Community License (restricciones) | Safetensors, GGUF oficial; vLLM, Ollama |
| Gemma 3 4B | ~4 B denso | 128 k | Gemma Terms of Use | Safetensors, GGUF; pesos con aceptación de términos |

La ventaja diferencial de Spark-X2.6-4B frente a estas alternativas es la combinación de contexto nominal de 1 M tokens y licencia Apache-2.0 sin cláusulas de uso aceptable adicionales, junto con un esquema de cuantización que preserva tensores críticos. La desventaja es la madurez del ecosistema: no hay resultados de benchmarks publicados, la comunidad es pequeña (13 likes, 1.923 descargas) y el soporte multilingüe se limita a inglés y chino, frente a los 100+ idiomas de Qwen3 o Gemma 3.

## Limitaciones y advertencias

- Ausencia total de benchmarks numéricos: la única referencia de rendimiento es una imagen sin datos tabulados, lo que impide verificar las afirmaciones del autor sobre preservación de coherencia en razonamiento.
- La etiqueta "Uncensored" aparece en el nombre del repositorio sin documentación de qué implica. Si el modelo base tiene filtros de seguridad reducidos, no hay evaluación de daños publicada ni guía de uso responsable; en producción esto exige filtros externos.
- Idiomas limitados a inglés y chino: el rendimiento en castellano no está evaluado ni declarado, y previsiblemente será inferior.
- Contexto de 1 M tokens declarado pero no verificado: el autor solo documenta configuraciones funcionales hasta 131.072 tokens. Ventanas superiores requerirán validación propia y mucha más memoria.
- Degradación por cuantización: incluso con GSQ-RCO, IQ2_M (2,60 bpw) y IQ3_S (3,25 bpw) son niveles agresivos; para tareas sensibles se recomienda IQ3_M o IQ4_XS.
- Riesgo de alucinación: no cuantificado en la información disponible. Los modelos de 4 B suelen alucinar más que los de mayor tamaño en tareas de conocimiento factual.
- Licencia Apache-2.0 permite uso comercial sin restricciones adicionales, pero la responsabilidad sobre el contenido generado y sobre el cumplimiento normativo recae en el desplegador.
- Procedencia del modelo base poco documentada: no se detallan datos de entrenamiento, composición del corpus ni proceso de alineamiento de XHToken/Spark-X2.6-4B, lo que dificulta evaluar sesgos.
- Sesgos conocidos: no documentados. Sin información sobre el corpus, no es posible anticipar sesgos de género, etnia o ideología.
- Repositorio pequeño y de un único autor: sin garantías de mantenimiento, actualizaciones ni soporte.
- Compatibilidad limitada fuera de `llama.cpp`/Ollama: sin soporte documentado en vLLM o TGI, lo que complica el despliegue en infraestructura de servido estándar a gran escala.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/abenzerps/Spark-X2.6-4B-Uncensored-GSQ-RCO-GGUF
- Modelo base: https://huggingface.co/XHToken/Spark-X2.6-4B
- Imagen de benchmark del autor: https://huggingface.co/abenzerps/Spark-X2.6-4B-Quantized/resolve/main/assets/benchmark.png
- Solicitud de modelos al autor: https://abenzerps.com/request-a-model/
- Galería de LocalAI (referencia al modelo base Spark-X2.6-4B): https://localai.io/docs/gallery.html
- Paper técnico, blog o repositorio de código del esquema GSQ-RCO: no disponible en la información proporcionada.
