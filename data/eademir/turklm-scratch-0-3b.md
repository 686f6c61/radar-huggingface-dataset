# eademir/TurkLM-scratch-0.3B

## Resumen

TurkLM-scratch-0.3B es un modelo de lenguaje causal en turco de 316 millones de parámetros desarrollado por el usuario eademir y publicado en Hugging Face bajo licencia Apache 2.0. Su rasgo diferencial es que se ha entrenado completamente desde cero (inicialización aleatoria, sin transferencia de pesos de ningún checkpoint existente) sobre datos exclusivamente en turco, empleando la arquitectura Qwen3 y un tokenizador BPE turco de 32.000 tokens entrenado específicamente para este modelo. Esto lo convierte en una pieza interesante para estudiar el entrenamiento monolingüe de modelos pequeños sin depender de modelos multilingües preentrenados.

El modelo emplea un decoder estilo Qwen3 con atención de consultas agrupadas (GQA), SwiGLU, RoPE, RMSNorm y embeddings atados. Con 24 capas, tamaño oculto de 1.024 y 8.192 posiciones máximas de embedding, aunque solo se entrenó con secuencias de 1.024 tokens, está pensado como modelo base de investigación para modelado de texto en turco, estudios de tokenización y punto de partida para fine-tuning.

Es relevante ahora porque demuestra que un modelo pequeño entrenado desde cero con un tokenizador específico para turco puede superar en bits por carácter (BPC) a modelos multilingües bastante más grandes como Qwen3-0.6B y Qwen3-1.7B en texto turco, con una fertilidad de tokens notablemente inferior (1,80 frente a 2,69). No obstante, su conocimiento del mundo es limitado y no está alineado ni ajustado por instrucciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decoder estilo Qwen3: GQA, SwiGLU, RoPE, RMSNorm, embeddings atados |
| Parametros totales | 315.936.768 (316M) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 8.192 posiciones máximas de embedding; entrenado solo con secuencias de 1.024 tokens |
| Tipos de cuantizacion | No disponible (pesos publicados en bfloat16; no se documentan cuantizaciones oficiales) |
| Idiomas soportados | Turco (tr) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers) |

Otras especificaciones: tamaño oculto 1.024, 24 capas, 16 cabezas de consulta y 8 de clave/valor (GQA), dimensión de cabeza 64, tamaño intermedio de la FFN 2.816, base RoPE θ = 1.000.000, vocabulario de 32.000 tokens (BPE ByteLevel, normalización NFC), precisión bfloat16, tamaño del repositorio 0,6 GB.

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder denso de estilo Qwen3, con atención de consultas agrupadas (16 cabezas de consulta y 8 de clave/valor), activación SwiGLU, embeddings rotatorios (RoPE) con base 1.000.000, normalización RMSNorm y embeddings de entrada y salida atados. El tokenizador es un BPE ByteLevel de 32.000 tokens entrenado desde cero sobre 500.000 documentos (70% Wikipedia en turco, 30% un corpus sintético turco) con normalización NFC, lo que reduce la fertilidad en turco frente a tokenizadores multilingües generales.

El entrenamiento consistió en 100.000 pasos con un batch efectivo constante de 64 secuencias de 1.024 tokens (65.536 tokens por paso), lo que supone aproximadamente 6.500 millones de tokens registrados. Los datos proceden de Wikipedia en turco (30%) y del subconjunto turco de CulturaX (70%). No se aplicó ajuste por instrucciones ni RLHF; se trata de un único entrenamiento, sin variación de semilla. El modelo se inicializó desde cero, sin transferencia de pesos de ningún checkpoint existente.

## Capacidades

- Generación de texto causal en turco: continuación de texto y modelado de lenguaje sobre texto turco.
- Modelado de lenguaje base: útil para calcular probabilidades, bits por carácter y métricas de tokenización.
- Tokenización eficiente en turco: fertilidad de 1,80 tokens por palabra, inferior a la de tokenizadores multilingües como el de Qwen3 (2,69).
- Punto de partida para fine-tuning: puede adaptarse a tareas concretas mediante ajuste supervisado.
- Capacidades multilingües: no disponibles; el modelo está entrenado únicamente con datos en turco.
- Tool calling / function calling: no disponible (modelo base sin ajuste por instrucciones).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Estudio de tokenización en turco: comparar la fertilidad y el BPC de un tokenizador monolingüe frente a tokenizadores multilingües en corpus turcos, gracias a su vocabulario BPE específico de 32.000 tokens.
- Modelado de lenguaje y evaluación de corpus: calcular bits por carácter sobre artículos de Wikipedia en turco para medir la calidad de un corpus o comparar arquitecturas, como hace la propia model card con 200 artículos frescos.
- Base para fine-tuning supervisado: adaptar el modelo a tareas concretas en turco (clasificación de texto, resumen, extracción de información) partiendo de un checkpoint de 316M parámetros manejable en hardware modesto.
- Generación de texto en turco en entornos con recursos limitados: su tamaño reducido permite ejecutarlo en GPUs de consumo o incluso en CPU para prototipos de continuación de texto.
- Investigación sobre entrenamiento desde cero: servir de referencia reproducible para estudiar el efecto de entrenar modelos monolingües pequeños sin transferencia de pesos de modelos multilingües.
- Experimentos de destilación o comparación de arquitecturas: usar el modelo como estudiante o como línea base frente a modelos Qwen3 de mayor tamaño en tareas de modelado de turco.
- Prototipado de autocompletado o generación asistida en turco: en aplicaciones donde se acepte la falta de alineación y se requiera un modelo ligero para generar borradores de texto.

## Benchmarks y rendimiento

| Modelo | Parámetros | BPC ↓ | XCOPA-TR ↑ | Fertilidad ↓ | Velocidad (tok/s) ↑ |
|---|---|---|---|---|---|
| TurkLM-scratch-0.3B | 316M | 1,0108 | 56,0% | 1,80 | 64,9 |
| TurkLM-scratch-0.5B | 473M | 0,9956 | 54,0% | 1,80 | 53,5 |
| Qwen3-0.6B | 596M | 1,6026 | 54,2% | 2,69 | 51,4 |
| Qwen3-1.7B | 1.721M | 1,3467 | 51,0% | 2,69 | 37,3 |
| Turkcell-LLM-7b-v1 | 7.376M | 0,9528 | 56,2% | 2,17 | 15,4 |

Notas de la model card: el BPC se mide sobre 200 artículos de Wikipedia en turco creados después de la recogida de datos de entrenamiento (page id ≥ 4.500.000 del dump de 2026-11-01, 958.229 caracteres). XCOPA-TR son 500 preguntas de sentido común con dos opciones (aleatorio = 50%); todos los modelos base están cerca del azar. La fertilidad es tokens por palabra turca. La velocidad se midió generando 100 tokens en bfloat16 en un Mac con Apple Silicon, en la misma sesión para todos los modelos; solo deben compararse las proporciones. En palabras turcas por segundo, TurkLM-0.3B alcanza 36, TurkLM-0.5B 30, Qwen3-0.6B 19, Qwen3-1.7B 14 y Turkcell-7B 7. El conjunto de 200 artículos es pequeño; diferencias inferiores a 0,02 BPC no deberían sobreinterpretarse.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de 316M parámetros en bfloat16, los pesos ocupan aproximadamente 0,6 GB; con estados de atención y overhead, cabe holgadamente en GPUs con 2-4 GB de VRAM. En cuantización de 8 bits o 4 bits (no documentada oficialmente) el consumo sería aún menor.
- GPU recomendadas: cualquier GPU moderna con al menos 4 GB de VRAM; no requiere A100 ni H100. Funciona en GPUs de consumo como RTX 3060, RTX 4060, RTX 4090, así como en Apple Silicon.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU de consumo con 4 GB o más de VRAM, e incluso en CPU para prototipos.
- Opciones de despliegue: transformers (librería nativa), text-generation-inference (el modelo incluye el tag endpoints_compatible), y en principio llama.cpp u Ollama si se generan pesos GGUF, aunque no se documentan conversiones oficiales.
- Latencia y throughput estimados: 64,9 tokens por segundo generando 100 tokens en bfloat16 en un Mac con Apple Silicon, según la model card; equivale a 36 palabras turcas por segundo gracias a la baja fertilidad del tokenizador.
- Nota de implementación: en GPUs de Apple debe usarse `attn_implementation="eager"`, ya que el kernel de atención por defecto en macOS 27 / torch 2.12.1 no era causal en las pruebas del autor.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | BPC (turco) | Fertilidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| TurkLM-scratch-0.3B | 316M | 8.192 (entrenado a 1.024) | 1,0108 | 1,80 | Apache 2.0 | Hugging Face |
| TurkLM-scratch-0.5B | 473M | No disponible | 0,9956 | 1,80 | No disponible | Hugging Face (mismo autor) |
| Qwen3-0.6B | 596M | No disponible en la información | 1,6026 | 2,69 | No disponible en la información | Hugging Face |
| Qwen3-1.7B | 1.721M | No disponible en la información | 1,3467 | 2,69 | No disponible en la información | Hugging Face |
| Turkcell-LLM-7b-v1 | 7.376M | No disponible en la información | 0,9528 | 2,17 | No disponible en la información | Hugging Face |

TurkLM-scratch-0.3B supera en BPC a Qwen3-0.6B y Qwen3-1.7B en el conjunto de evaluación turco, pese a tener menos parámetros, gracias en parte a su tokenizador específico. Turkcell-LLM-7b-v1, 23 veces más grande, obtiene un BPC aproximadamente un 6% mejor. En XCOPA-TR todos los modelos base están cerca del azar, por lo que esa métrica no los discrimina.

## Limitaciones y advertencias

- Modelo base únicamente: no tiene ajuste por instrucciones ni RLHF, por lo que no sigue instrucciones de forma fiable.
- Sin entrenamiento de seguridad: puede generar texto incorrecto, sesgado u ofensivo.
- Conocimiento del mundo limitado: entrenado con unos 6.500 millones de tokens, muchos menos que modelos multilingües del mismo tamaño; no debe usarse para responder preguntas factuales sin recuperación o fine-tuning.
- Contexto efectivo limitado: aunque admite 8.192 posiciones de embedding, solo se entrenó con secuencias de 1.024 tokens, por lo que el rendimiento más allá de esa longitud no está validado.
- Evaluación restringida: evaluado principalmente con texto estilo Wikipedia; el comportamiento en turco conversacional o de dominio específico no está probado.
- Entrenamiento único sin variación de semilla: no hay estimación de varianza entre ejecuciones.
- Idiomas: solo turco; no se ha entrenado con otros idiomas.
- Licencia de datos: los pesos son Apache 2.0, pero los datos de entrenamiento (Wikipedia CC BY-SA 3.0 y GFDL, y CulturaX con términos de mC4 y OSCAR) tienen sus propias condiciones que conviene revisar para uso comercial.
- Conjunto de evaluación pequeño: 200 artículos; diferencias inferiores a 0,02 BPC no son concluyentes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/eademir/TurkLM-scratch-0.3B
- Scripts y datos de evaluación: https://huggingface.co/eademir/TurkLM-scratch-0.3B/tree/main/eval (referenciado como `eval/README.md` en la model card)
- Dataset Wikipedia en turco: https://huggingface.co/datasets/wikimedia/wikipedia (configuración `20231101.tr`)
- Dataset CulturaX: https://huggingface.co/datasets/uonlp/CulturaX
