# jacopof/lumina

## Resumen

Lumina-Next 135M es un modelo de lenguaje de tipo decoder-only desarrollado por Jacopo Forti (usuario `jacopof` en Hugging Face) como parte del ecosistema "Lumina AI". Está disenado especificamente para inferencia en dispositivos edge (portatiles, CPU y GPU de consumo) con una especializacion clara en codigo Python, logica formal y lengua italiana. El checkpoint publicado corresponde al step 8.025 de un proceso de entrenamiento acumulativo de 8.000 pasos.

La arquitectura es un transformer clasico con Grouped Query Attention (GQA) en proporcion 3:1, RMSNorm pre-attention y pre-MLP, activacion SwiGLU y embeddings atados (tied embeddings). El modelo declara 103,39 millones de parametros efectivos con tied embeddings, aunque el recuento real de parametros en safetensors es de 225.952.512 (correspondiente a la version con embeddings no atados). El contexto nativo es de 8.192 tokens, extensible hasta 32.768 mediante YaRN.

La relevancia del modelo radica en su enfoque en eficiencia extrema y su licencia MIT, que permite uso comercial sin restricciones. No obstante, el propio autor advierte que el benchmark reportado (87,5% sobre 8 preguntas locales) no constituye una medida general de capacidad, y que el modelo puede producir repeticiones o texto incoherente en respuestas largas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con GQA, RMSNorm, SwiGLU y RoPE con YaRN |
| Parametros totales | 225.952.512 (safetensors); 103,39M con tied embeddings |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 8.192 tokens nativo; hasta 32.768 con YaRN |
| Tipos de cuantizacion | No especificados; se distribuye en safetensors, ONNX y GGUF (compatible con llama.cpp, que permite cuantizaciones estandar) |
| Idiomas soportados | Italiano (unico idioma declarado) |
| Licencia | MIT |
| Formato de pesos | safetensors, pytorch_model.bin, ONNX, GGUF |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura transformer decoder-only con innovaciones orientadas a eficiencia: Grouped Query Attention con 9 cabezas de query y 3 de key/value (head_dim = 64), RMSNorm aplicado antes de atencion y antes del MLP, activacion SwiGLU con dimension de feed-forward de 1.536, y RoPE con frecuencia base theta = 500.000,0 e interpolacion YaRN para extension de contexto. El tokenizer es un Byte-Level BPE con vocabulario de 32.000 tokens, entrenado conjuntamente sobre Python, SQL, Git e italiano.

El entrenamiento acumula 8.025 pasos con un throughput medio cercano a 14.000 tokens/s. La tabla de convergencia del autor muestra una reduccion de la loss de entropia cruzada desde 8,9042 (step 0) hasta 0,1353 (step 8.025). No se especifica el volumen total de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO. El autor menciona que la aplicacion Lumina incorpora controles locales deterministicos que no forman parte de los pesos publicados.

## Capacidades

- Generacion de texto en italiano con soporte de plantilla de chat basada en tokens especiales `<|im_start|>` y `<|im_end|>`.
- Generacion de codigo Python, con tokenizer entrenado especificamente sobre codigo Python, SQL y Git.
- Razonamiento logico formal basico y explicacion de reglas gramaticales italianas (auxiliares essere/avere).
- Conocimiento factual limitado en dominios como geografia, ciencia y calendario, segun el benchmark declarado por el autor.
- Soporte de contexto largo (8.192 tokens nativo, 32.768 con YaRN), adecuado para documentos extensos o conversaciones multi-turno.
- Capacidad de "honestidad" declarada: el modelo reconoce incertidumbre sobre fechas futuras, segun la tabla de convergencia.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: limitadas al italiano declarado.
- Capacidades de vision o audio: no disponibles.

## Casos de uso

- **Asistente de codigo Python en local**: el modelo puede integrarse en editores o IDEs para autocompletado y generacion de fragmentos Python, ejecutandose en CPU o GPU de consumo gracias a sus ~103M parametros efectivos y su formato GGUF compatible con llama.cpp.
- **Procesamiento de documentacion tecnica en italiano**: con 8.192 tokens de contexto nativo (32.768 con YaRN), puede resumir o responder preguntas sobre manuales, normativas o documentacion extensa en italiano sin necesidad de infraestructura cloud.
- **Generacion de consultas SQL**: el tokenizer entrenado sobre SQL permite generar y completar consultas a partir de descripciones en italiano, util en herramientas internas de analitica.
- **Correccion gramatical italiana**: el modelo ha sido entrenado para explicar reglas gramaticales (auxiliares essere/avere) y puede emplearse en herramientas de revision de texto italiano, aunque con verificacion humana dada su tendencia a la incoherencia en respuestas largas.
- **Prototipado rapido en edge**: por su tamano y licencia MIT, es adecuado para experimentar con pipelines de generacion de texto en dispositivos sin GPU dedicada, usando la exportacion ONNX con dynamic axes para DirectML o CPU.
- **Educacion y demos de IA**: su bajo coste de inferencia y su licencia permisiva lo hacen util para talleres, demos y entornos docentes donde se ensenen fundamentos de LLM sin depender de APIs externas.
- **Filtrado y clasificacion de texto italiano**: puede emplearse como modelo base para tareas de clasificacion o extraccion de informacion en italiano, con fine-tuning posterior sobre datos especificos.

## Benchmarks y rendimiento

El autor publica una tabla de convergencia interna con un benchmark deterministico de 8 preguntas (16 puntos), no comparable con benchmarks estandar como MMLU, HumanEval o GSM8K. No se han publicado resultados en benchmarks estandar en la informacion disponible.

| Ciclo | Step | Loss CE | Score benchmark (16 pts) |
|---|---|---|---|
| Baseline | 0 | 8,9042 | 0,0% (0/16) |
| Ciclo 1 | 500 | 3,6652 | 0,0% (0/16) |
| Ciclo 2 | 1.500 | 1,9958 | 25,0% (4/16) |
| Ciclo 3 | 2.500 | 1,5491 | 31,2% (5/16) |
| Ciclo 4 | 3.500 | 1,1533 | 37,5% (6/16) |
| Ciclo 5 | 5.000 | 0,7269 | 37,5% (6/16) |
| Ciclo 6 | 6.500 | 0,4548 | 50,0% (8/16) |
| Ciclo 7 | 8.025 | 0,1353 | 87,5% (14/16) |

El autor advierte explicitamente que este benchmark es un control local sobre 8 preguntas y no una medida general de inteligencia. La aritmetica queda como area pendiente de mejora segun la propia model card.

## Requisitos de hardware

- **VRAM estimada para inferencia**: el checkpoint safetensors ocupa 394 MB; en bfloat16 la inferencia requiere aproximadamente 0,5 GB de VRAM, y en cuantizacion de 8 bits o 4 bits puede ejecutarse en menos de 0,3 GB.
- **GPU recomendadas**: cualquier GPU de consumo moderna (RTX 3060, RTX 4060, RTX 4090) es mas que suficiente; tambien funciona en GPUs integradas y CPU.
- **Compatibilidad con GPU de consumo**: si, cabe holgadamente en cualquier GPU de consumo e incluso en dispositivos con poca memoria.
- **Opciones de despliegue**: llama.cpp (formato GGUF), LM Studio, ONNX Runtime (con DirectML o CPU), PyTorch/Transformers con el codigo `modeling_lumina_next.py` proporcionado por el autor.
- **Latencia y throughput**: no se han publicado mediciones de latencia o throughput de inferencia en la informacion disponible, salvo el throughput de entrenamiento (~14.000 tokens/s).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Idiomas | Formato |
|---|---|---|---|---|---|
| Lumina-Next 135M | 103,39M (tied) / 225,9M (safetensors) | 8.192 (32.768 con YaRN) | MIT | Italiano | safetensors, ONNX, GGUF |
| SmolLM-135M (HuggingFaceTB) | 135M | 2.048 | Apache 2.0 | Ingles (principalmente) | safetensors, GGUF |
| Qwen2.5-0.5B | 494M | 32.768 | Apache 2.0 | Multilingue | safetensors, GGUF |
| TinyLlama-1.1B | 1,1B | 2.048 | Apache 2.0 | Ingles | safetensors, GGUF |

Los datos de los modelos comparables corresponden a informacion publica general; no se dispone de comparaciones de rendimiento directas con Lumina-Next 135M en la informacion proporcionada.

## Limitaciones y advertencias

- **Riesgo de alucinacion elevado**: el propio autor advierte que el modelo puede producir repeticiones o texto incoherente en respuestas largas, y que requiere verificacion externa para calculos, datos actualizados y decisiones importantes.
- **Benchmark no representativo**: el 87,5% reportado corresponde a 8 preguntas locales (16 puntos), no a un benchmark estandar; no debe interpretarse como capacidad general.
- **Aritmetica debil**: segun la model card, la aritmetica sigue siendo un area pendiente de mejora.
- **Idioma limitado**: solo se declara soporte de italiano; el rendimiento en otros idiomas no esta garantizado.
- **Sesgos**: no se ha publicado informacion sobre sesgos conocidos ni sobre la composicion del dataset de entrenamiento.
- **Licencia**: MIT permite uso comercial sin restricciones, pero el autor no ofrece garantias sobre el rendimiento en produccion.
- **Controles de la aplicacion no incluidos**: la aplicacion Lumina incorpora controles deterministicos locales que no forman parte de los pesos publicados, por lo que el comportamiento del modelo desnudo puede diferir del producto final.
- **Datos de entrenamiento no documentados**: no se especifica el volumen de tokens, la composicion del dataset ni el uso de RLHF/DPO, lo que dificulta evaluar la calidad y los sesgos del modelo.

## Enlaces

- [Hugging Face: jacopof/lumina](https://huggingface.co/jacopof/lumina)
- [Perfil del autor: Jacopo Forti (jacopof)](https://huggingface.co/jacopof)
- No se han encontrado en la busqueda web papers, blogs, repositorios o demos adicionales en la informacion proporcionada.
