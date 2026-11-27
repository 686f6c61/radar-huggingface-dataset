# Mimo0311/Qwen2.5-0.5B

## Resumen

Qwen2.5-0.5B es el modelo de lenguaje de menor tamano de la familia Qwen2.5, desarrollada por el equipo Qwen de Alibaba. Se trata de un modelo causal decoder-only de tipo base, es decir, unicamente preentrenado y no afinado para instrucciones ni conversacion. Con 494 millones de parametros totales (0,36B sin contar los embeddings), esta disenado para tareas de generacion de texto y como punto de partida para post-entrenamiento (SFT, RLHF o preentrenamiento continuado).

El modelo emplea una arquitectura transformer con RoPE, SwiGLU, RMSNorm, atencion con sesgo en QKV y word embeddings atados, con 24 capas y atencion GQA (14 cabezas de consulta y 2 de clave-valor). Soporta una longitud de contexto completa de 32.768 tokens, lo que resulta notable para su tamano y lo hace util en escenarios con recursos limitados donde se necesita procesar documentos largos.

Su relevancia actual radica en que ofrece un equilibrio entre huella de memoria muy reducida y una ventana de contexto amplia, bajo licencia Apache 2.0. Es adecuado para experimentacion, prototipado rapido, despliegue en hardware modesto y como base para afinado. No obstante, al ser un modelo base, no debe usarse directamente en conversaciones sin un post-entrenamiento previo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal decoder-only con RoPE, SwiGLU, RMSNorm, atencion QKV con sesgo y embeddings atados |
| Parametros totales | 494.032.768 (0,49B); 0,36B sin embeddings |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens (entrenamiento); hasta 128K segun la familia, no confirmado para esta variante |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (formato safetensors en FP/BF16) |
| Idiomas soportados | en (segun metadatos); la familia declara mas de 29 idiomas, pero este repo solo lista ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers) |
| Capas | 24 |
| Cabezas de atencion | 14 Q / 2 KV (GQA) |
| Etapa de entrenamiento | Preentrenamiento (modelo base) |
| Tamano del repo | 1,0 GB |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Qwen2.5: un transformer causal con normalizacion RMSNorm, activacion SwiGLU en las capas feed-forward, codificacion posicional rotatoria (RoPE) y atencion con query-key-value bias. Usa Grouped Query Attention con 14 cabezas de consulta y 2 de clave-valor, lo que reduce el coste de memoria del KV cache en inferencia. Los embeddings de entrada y la capa de salida estan atados, lo que reduce el numero de parametros efectivos.

Segun la model card, este repositorio contiene exclusivamente el modelo base preentrenado, sin afinado por instrucciones ni RLHF/DPO. La familia Qwen2.5 se entreno con modelos expertos especializados en codigo y matematicas, y declara mejoras en seguimiento de instrucciones, generacion de textos largos (mas de 8K tokens), comprension de datos estructurados y generacion de JSON. No se especifica en la informacion disponible el numero exacto de tokens de entrenamiento ni la composicion del dataset para esta variante de 0,5B.

## Capacidades

- Generacion de texto autoregresiva en ingles (idioma declarado en los metadatos).
- Razonamiento basico y completado de texto; al ser un modelo base, no esta optimizado para seguir instrucciones.
- Capacidad de codigo y matematicas heredada del entrenamiento de la familia Qwen2.5, aunque no cuantificada para esta variante.
- Soporte de contexto largo: hasta 32.768 tokens, adecuado para documentos extensos.
- Generacion de texto largo (la familia declara hasta 8K tokens de salida).
- Comprension de datos estructurados y generacion de JSON (declarado a nivel de familia).
- No incluye tool calling ni function calling de forma nativa (requiere post-entrenamiento).
- No incluye modo thinking, vision ni audio.
- Multilingue a nivel de familia (29+ idiomas), pero este repo declara solo ingles.

## Casos de uso

- Punto de partida para afinado supervisado (SFT): dado que es un modelo base, es idoneo para aplicar SFT con datos propios y obtener un modelo de instrucciones ligero para dominios especificos.
- Clasificacion y etiquetado de texto: con 0,5B de parametros puede ejecutarse en CPU o GPU modesta para tareas de moderacion, categorizacion o extraccion de entidades en lotes grandes.
- Generacion de texto en dispositivos con recursos limitados: su huella de memoria reducida permite desplegarlo en entornos edge o contenedores pequenos para autocompletado o resumen.
- Procesamiento de documentos largos: la ventana de 32.768 tokens permite resumir o analizar contratos, informes o articulos sin truncar el contenido.
- Prototipado rapido de pipelines de NLP: sirve como baseline barato para validar arquitecturas de RAG o generacion antes de escalar a modelos mayores.
- Investigacion en eficiencia y cuantizacion: su tamano facilita experimentos de cuantizacion, destilacion o tecnicas de decodificacion especulativa con bajo coste computacional.
- Generacion de datos sinteticos: puede usarse para producir texto de entrenamiento a gran escala en dominios acotados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks especificos para esta variante en la informacion disponible. La model card remite al blog de Qwen2.5 para resultados detallados de la familia, pero no incluye cifras concretas para el modelo de 0,5B.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16/FP16: aproximadamente 1 GB para los pesos (0,49B parametros), mas el KV cache para contexto largo.
- VRAM estimada en cuantizacion de 8 bits: en torno a 0,6-0,7 GB; en 4 bits, aproximadamente 0,4-0,5 GB (estimaciones teoricas, no confirmadas en la informacion).
- Cabe en cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) e incluso en iGPU o CPU para contextos moderados.
- GPU recomendadas para mayor throughput: A100, H100 o L40S para servir en lote; RTX 4090 para desarrollo.
- Opciones de despliegue: transformers (recomendado version >= 4.37.0), text-generation-inference (TGI), vLLM, llama.cpp y Ollama (previa conversion a GGUF).
- Latencia y throughput: no disponibles en la informacion proporcionada; la model card remite a la documentacion de Qwen para benchmarks de velocidad.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Qwen2.5-0.5B (este) | 0,49B | 32.768 | Apache 2.0 | Modelo base, solo ingles en metadatos |
| Qwen2.5-0.5B-Instruct | 0,49B | 32.768 | Apache 2.0 | Variante afinada para instrucciones y chat |
| Qwen2-0.5B | 0,49B | 32.768 | Apache 2.0 | Generacion anterior de la familia |
| SmolLM2-360M | 0,36B | 8.192 (aprox.) | Apache 2.0 | Alternativa ligera de Hugging Face |

La comparativa se limita a datos de parametros y contexto; no se dispone de resultados de benchmarks comparativos en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo base sin post-entrenamiento: no sigue instrucciones de forma fiable y no debe usarse directamente en conversaciones.
- Riesgo elevado de alucinacion y de generar contenido incoherente o repetitivo en tareas complejas.
- Idiomas: los metadatos solo declaran ingles; el rendimiento en castellano no esta garantizado ni documentado para esta variante.
- Sesgos: no se documentan evaluaciones de sesgo en la informacion disponible; al ser un modelo preentrenado, puede reproducir sesgos presentes en los datos.
- Limitacion de conocimiento: con 0,49B de parametros, su conocimiento factual es limitado frente a modelos mayores.
- Licencia Apache 2.0: permite uso comercial, pero el autor del repo (Mimo0311) es un tercero que redistribuye el modelo; conviene verificar la procedencia y los terminos originales de Qwen.
- El repo tiene 0 descargas y 0 likes, lo que sugiere que no ha sido validado por la comunidad.
- Para produccion se recomienda usar la variante Instruct oficial o aplicar SFT propio, y validar el comportamiento con evaluaciones especificas.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Mimo0311/Qwen2.5-0.5B
- Repo oficial Qwen2.5-0.5B: https://huggingface.co/Qwen/Qwen2.5-0.5B
- Blog de Qwen2.5: https://qwenlm.github.io/blog/qwen2.5/
- GitHub Qwen2.5: https://github.com/QwenLM/Qwen2.5
- Documentacion Qwen: https://qwen.readthedocs.io/en/latest/
- Benchmarks de velocidad: https://qwen.readthedocs.io/en/latest/benchmark/speed_benchmark.html
- Paper Qwen2 (arXiv:2407.10671): https://arxiv.org/abs/2407.10671
- Licencia: https://huggingface.co/Qwen/Qwen2.5-0.5B/blob/main/LICENSE
