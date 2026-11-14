# iCELAKE01/Qwen2.5-1.5B

## Resumen

Qwen2.5-1.5B es un modelo de lenguaje causal de tipo base (solo preentrenamiento) perteneciente a la familia Qwen2.5 desarrollada por el equipo Qwen de Alibaba. Esta ficha concreta corresponde a una reproduccion del checkpoint base publicada por el usuario iCELAKE01 en Hugging Face, con 1.543.714.304 parametros reales verificados en los pesos safetensors. El modelo resuelve la necesidad de un modelo pequeno, rapido y con licencia permisiva sobre el que aplicar post-entrenamiento (SFT, RLHF o preentrenamiento continuado) para tareas especificas.

La arquitectura es un transformer causal con RoPE, SwiGLU, RMSNorm, sesgo en las proyecciones QKV y embeddings de palabras atados. Cuenta con 28 capas y atencion con Grouped Query Attention (12 cabezas para Q y 2 para KV), lo que reduce el coste de memoria de la cache KV. El contexto completo es de 32.768 tokens y el modelo puede generar hasta 8.192 tokens.

Es relevante ahora porque la familia Qwen2.5 introdujo mejoras notables en conocimiento, codigo y matematicas respecto a Qwen2, y esta variante de 1.5B permite desplegar un modelo base en hardware modesto. Conviene subrayar que, al ser un modelo base, no esta alineado para conversacion y no deberia usarse directamente como chatbot sin un post-entrenamiento previo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal con RoPE, SwiGLU, RMSNorm, sesgo QKV y embeddings atados |
| Parametros totales | 1.543.714.304 (1,54B); 1,31B sin embeddings |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 32.768 tokens (completo); generacion de hasta 8.192 tokens |
| Tipos de cuantizacion | No disponible en la informacion proporcionada (pesos en safetensors; cuantizaciones GGUF/AWQ no listadas) |
| Idiomas soportados | La familia soporta mas de 29 idiomas; la model card de este repo declara `en` (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers) |
| Capas | 28 |
| Cabezas de atencion | 12 para Q, 2 para KV (GQA) |
| Tamano del repo | 3,1 GB |
| Etapa de entrenamiento | Preentrenamiento (modelo base) |

## Arquitectura y entrenamiento

El modelo es un transformer causal decoder-only con 28 capas. Emplea RoPE (Rotary Position Embeddings) para la codificacion posicional, activacion SwiGLU en las capas feed-forward, normalizacion RMSNorm y sesgo en las proyecciones de query, key y value. Los embeddings de entrada y la cabeza de salida estan atados, lo que reduce el numero de parametros efectivos (1,31B sin contar embeddings frente a 1,54B totales). La atencion usa Grouped Query Attention con 12 cabezas de query y solo 2 de key/value, lo que disminuye la memoria de la cache KV durante la inferencia.

Segun la model card, la familia Qwen2.5 se entreno con modelos expertos especializados en codigo y matematicas, y mejoras en seguimiento de instrucciones, generacion de textos largos (mas de 8K tokens), comprension de datos estructurados y generacion de JSON. No se detalla en la informacion disponible el numero exacto de tokens de entrenamiento ni la composicion del dataset para este checkpoint concreto. Este repositorio contiene exclusivamente el resultado del preentrenamiento, sin SFT ni RLHF/DPO aplicados.

## Capacidades

- Generacion de texto autoregresiva a partir de un prompt (modelo base, sin alineacion conversacional).
- Razonamiento y conocimiento general heredados del preentrenamiento de la familia Qwen2.5.
- Capacidades de codigo y matematicas mejoradas respecto a Qwen2, segun la model card de la familia.
- Generacion de textos largos de hasta 8.192 tokens y manejo de contexto de hasta 32.768 tokens.
- Comprension de datos estructurados (tablas) y generacion de salidas estructuradas como JSON, segun la familia.
- Capacidades multilingues de la familia (mas de 29 idiomas), aunque este repo declara solo `en`.
- No incluye soporte nativo de tool calling ni function calling al ser un modelo base sin post-entrenamiento.
- No dispone de modo thinking, vision ni audio.

## Casos de uso

- Preentrenamiento continuado en dominio: partir de este checkpoint base y continuar el preentrenamiento con corpus especializados (legal, medico, financiero) para adaptar el modelo a un vocabulario y estilo concretos, aprovechando su tamano reducido para iterar rapido.
- Fine-tuning con SFT para un asistente vertical: aplicar ajuste supervisado sobre datos propios para construir un chatbot de dominio especifico, ya que el modelo base no esta alineado para conversacion y requiere esta etapa.
- Generacion de codigo tras fine-tuning: usar el checkpoint como base para entrenar un modelo de autocompletado o generacion de codigo en un lenguaje o framework concreto, apoyandose en las mejoras de codigo de la familia Qwen2.5.
- Experimentacion academica: servir como modelo de referencia de 1,5B para investigar tecnicas de alineacion (RLHF, DPO) o de eficiencia, con un coste de computo accesible.
- Generacion de datos sinteticos: emplear el modelo para producir texto a gran escala en pipelines de aumento de datos, dado su bajo coste de inferencia.
- Despliegue en entornos con recursos limitados: ejecutar el modelo en una unica GPU de consumo para tareas de generacion de texto por lotes donde no se requiera dialogo alineado.
- Base para destilacion: utilizar sus salidas o logits como profesor en procesos de destilacion hacia modelos aun mas pequenos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite al blog de Qwen2.5 para los resultados detallados de evaluacion, pero no incluye cifras concretas para este checkpoint.

## Requisitos de hardware

- VRAM estimada en fp16/bf16: aproximadamente 3,1 GB solo para pesos, mas cache KV y activaciones; en la practica se recomiendan 6-8 GB para contexto moderado.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 1,6 GB para pesos.
- VRAM estimada en cuantizacion de 4 bits: alrededor de 0,8-1 GB para pesos.
- GPU recomendadas: cualquier GPU con 8 GB o mas, como RTX 3060, RTX 4060, RTX 4070, RTX 4090; tambien A100 y H100 para despliegues de alto throughput.
- Cabe en GPU de consumo: si, en modelos con 6-8 GB de VRAM o superiores segun cuantizacion y longitud de contexto.
- Opciones de despliegue: transformers, text-generation-inference (TGI, etiquetado en el repo), vLLM, llama.cpp y Ollama previa conversion a GGUF.
- Latencia y throughput: no disponibles en la informacion proporcionada; la model card remite a la tabla de velocidad de la documentacion de Qwen.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Qwen2.5-1.5B (este repo) | 1,54B | 32.768 | Apache 2.0 | Modelo base, sin alineacion |
| Qwen2.5-1.5B-Instruct (oficial) | 1,54B | 32.768 | Apache 2.0 | Version alineada para conversacion |
| Qwen2.5-0.5B | 0,5B | 32.768 | Apache 2.0 | Variante mas pequena de la misma familia |
| Qwen2.5-3B | 3B | 32.768 | Qwen license | Escalon superior de la familia |

No se dispone en la informacion proporcionada de datos de rendimiento comparativo entre estas variantes.

## Limitaciones y advertencias

- Es un modelo base: no esta alineado para conversacion y la model card desaconseja explicitamente su uso directo como chatbot.
- Riesgo de alucinacion inherente a los modelos de lenguaje; sin alineacion, la probabilidad de generar contenido incorrecto o incoherente es mayor.
- Sesgos potenciales derivados de los datos de preentrenamiento, no documentados en la informacion disponible.
- El repo declara solo el idioma `en`, aunque la familia soporte mas idiomas; el rendimiento multilingue de este checkpoint concreto no esta verificado.
- Contexto limitado a 32.768 tokens, inferior a los 128K que anuncia la familia para otras variantes.
- Licencia Apache 2.0 permisiva para uso comercial, pero el usuario debe asumir la responsabilidad del post-entrenamiento y de la evaluacion de seguridad.
- Requiere transformers 4.37.0 o superior; versiones anteriores fallan con `KeyError: 'qwen2'`.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: es una reproduccion de terceros, no el repositorio oficial de Qwen, por lo que conviene verificar la integridad de los pesos antes de usarlo en produccion.

## Enlaces

- Hugging Face: https://huggingface.co/iCELAKE01/Qwen2.5-1.5B
- Repositorio oficial de referencia: https://huggingface.co/Qwen/Qwen2.5-1.5B
- Blog de Qwen2.5: https://qwenlm.github.io/blog/qwen2.5/
- GitHub de Qwen2.5: https://github.com/QwenLM/Qwen2.5
- Documentacion de Qwen: https://qwen.readthedocs.io/en/latest/
- Benchmarks de velocidad: https://qwen.readthedocs.io/en/latest/benchmark/speed_benchmark.html
- Paper Qwen2: https://arxiv.org/abs/2407.10671
- Licencia: https://huggingface.co/Qwen/Qwen2.5-1.5B/blob/main/LICENSE
