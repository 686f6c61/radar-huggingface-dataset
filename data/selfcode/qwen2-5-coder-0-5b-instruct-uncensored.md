# SelfCode/Qwen2.5-Coder-0.5B-Instruct-Uncensored

## Resumen

SelfCode/Qwen2.5-Coder-0.5B-Instruct-Uncensored es una variante "decensored" del modelo Qwen2.5-Coder-0.5B-Instruct desarrollado originalmente por Alibaba Cloud (equipo Qwen). La modificacion consiste en una ablacion de direcciones de activacion (Arbitrary-Rank Ablation, ARA) aplicada con la herramienta Heretic v2.0.0, que elimina buena parte de los comportamientos de rechazo del modelo original sin reentrenar los pesos desde cero. El resultado es un modelo de 494 millones de parametros (0,36B no-embedding) orientado a generacion de codigo y conversacion, con una ventana de contexto de 32.768 tokens.

El modelo base Qwen2.5-Coder-0.5B-Instruct forma parte de la familia Qwen2.5-Coder, publicada en 2024 y entrenada sobre 5,5 billones de tokens que combinan codigo fuente, datos de grounding texto-codigo y datos sinteticos. Esta variante de 0,5B es la mas pequena de la familia y esta pensada para entornos con recursos muy limitados, prototipado rapido y despliegue en CPU o GPUs de gama baja.

La relevancia de esta ficha concreta radica en que combina dos factores poco habituales: por un lado, un modelo de codigo muy compacto con contexto largo; por otro, una modificacion de alineacion documentada y reproducible (parametros ARA publicados, directorio `reproduce`). El autor reporta 0 rechazos en 100 peticiones frente a 51 del modelo original, con una divergencia KL de 0,6246 respecto al modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal decoder-only con RoPE, SwiGLU, RMSNorm, atencion QKV con bias y word embeddings atados |
| Parametros totales | 494.032.768 (0,49B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens |
| Tipos de cuantizacion | GGUF disponible en el repo; cuantizaciones estandar de llama.cpp (no se detallan los niveles exactos en la informacion disponible) |
| Idiomas soportados | Ingles (declarado en la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors y GGUF |

Otros datos tecnicos: 24 capas, 14 cabezas de atencion para Q y 2 para KV (GQA), 0,36B de parametros no-embedding, tamano del repositorio de 2,5 GB.

## Arquitectura y entrenamiento

La arquitectura es un transformer causal decoder-only clasico con las innovaciones habituales de la familia Qwen2.5: RoPE para codificacion posicional, activacion SwiGLU en las capas feed-forward, normalizacion RMSNorm y atencion con Grouped Query Attention (14 cabezas de query frente a 2 de key/value), lo que reduce el coste de memoria del KV cache durante la inferencia. Los embeddings de entrada y la cabeza de salida estan atados, lo que explica la diferencia entre los 0,49B totales y los 0,36B no-embedding.

El entrenamiento del modelo base Qwen2.5-Coder-0.5B-Instruct consistio en una fase de preentrenamiento sobre 5,5 billones de tokens (codigo fuente, texto-codigo grounding y datos sinteticos) seguida de una fase de post-entrenamiento con instrucciones. La model card del modelo original no detalla la composicion exacta del dataset ni si se aplico RLHF o DPO en esta variante de 0,5B; esa informacion no esta disponible en la documentacion proporcionada. La modificacion de esta ficha (Heretic v2.0.0) aplica una ablacion ARA sobre las capas 0 a 24 con pesos concretos: `preserve_good_behavior_weight` 0,1722, `steer_bad_behavior_weight` 0,0002, `overcorrect_relative_weight` 0,6981 y `neighbor_count` 7. El proceso es reproducible segun el autor.

## Capacidades

- Generacion de codigo en multiples lenguajes, con enfasis en tareas de sintesis, razonamiento sobre codigo y correccion de errores.
- Razonamiento sobre codigo: explicacion de fragmentos, deteccion de bugs y propuesta de refactorizaciones.
- Generacion de texto conversacional con plantilla de chat (`apply_chat_template`).
- Capacidades matematicas basicas heredadas del modelo base Qwen2.5.
- Soporte de conversaciones multi-turno dentro de la ventana de 32.768 tokens.
- Comportamiento "uncensored": el autor reporta 0/100 rechazos frente a 51/100 del modelo original.
- No se documenta soporte explicito de tool calling, function calling ni modo de razonamiento extendido (thinking) en la informacion disponible.
- Capacidades multilingues limitadas al ingles segun la model card, aunque el modelo base Qwen2.5 tiene cobertura multilingue mas amplia no declarada aqui.

## Casos de uso

- Autocompletado de codigo en editores e IDE: con 0,5B de parametros y contexto de 32.768 tokens, el modelo puede ejecutarse localmente en el portatil del desarrollador y ofrecer sugerencias en tiempo real sin enviar codigo a servicios externos.
- Generacion de tests unitarios: se le puede pasar una funcion y su firma para que produzca casos de prueba; su tamano reducido permite integrarlo en pipelines de CI sin coste de GPU dedicada.
- Explicacion y documentacion de codigo legacy: el contexto largo permite introducir un modulo completo y pedir un resumen o comentarios inline, util para equipos que mantienen bases de codigo antiguas.
- Chatbot de soporte tecnico para desarrolladores: al no rechazar consultas por contenido, puede responder preguntas sobre configuracion, errores y APIs sin fricciones de moderacion excesivas, aunque requiere supervision humana.
- Prototipado rapido de asistentes conversacionales: su licencia Apache 2.0 y su huella de memoria reducida lo hacen adecuado para validar productos antes de escalar a modelos mayores.
- Despliegue en entornos con hardware restringido: Raspberry Pi, CPUs de servidor o GPUs integradas pueden ejecutar la version GGUF cuantizada para tareas de generacion de codigo offline.
- Filtrado y clasificacion de fragmentos de codigo: por su bajo coste por token, puede usarse como primer nivel en pipelines de analisis estatico asistido por LLM.

## Benchmarks y rendimiento

La model card del autor solo publica dos metricas comparativas frente al modelo original:

| Metrica | Este modelo | Qwen2.5-Coder-0.5B-Instruct |
|---|---|---|
| Rechazos (sobre 100 peticiones) | 0/100 | 51/100 |
| Divergencia KL | 0,6246 | 0 (por definicion) |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) para esta variante en la informacion disponible. El modelo base remite al blog oficial de Qwen2.5-Coder para resultados detallados, pero esos datos no se incluyen en la documentacion proporcionada.

## Requisitos de hardware

- VRAM estimada: en FP16, aproximadamente 1 GB para los pesos (0,49B x 2 bytes) mas el KV cache; con contexto de 32.768 tokens el KV cache anade varios cientos de MB. En cuantizacion de 4 bits, los pesos bajan a unos 250-300 MB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM para FP16 con contexto moderado; RTX 3060, RTX 4060, T4 o superiores son mas que suficientes. Para contexto completo de 32.768 tokens conviene disponer de 4 GB o mas.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU dedicada moderna e incluso en iGPU con suficiente memoria compartida.
- Opciones de despliegue: transformers (version >= 4.37.0), llama.cpp, Ollama, text-generation-inference (el repo incluye el tag `text-generation-inference`), vLLM.
- Latencia y throughput: no se publican cifras concretas en la informacion disponible; el modelo base remite a la pagina de speed benchmark de Qwen para datos de referencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| SelfCode/Qwen2.5-Coder-0.5B-Instruct-Uncensored | 0,49B | 32.768 | Apache 2.0 | Variante decensored con ARA, reproducible |
| Qwen/Qwen2.5-Coder-0.5B-Instruct | 0,49B | 32.768 | Apache 2.0 | Modelo base original, con rechazos |
| Qwen/Qwen2.5-Coder-1.5B-Instruct | 1,5B | 32.768 | Apache 2.0 | Misma familia, mayor capacidad y coste |
| Qwen/Qwen2.5-Coder-7B-Instruct | 7B | 32.768 | Apache 2.0 | Referencia de la familia para codigo en produccion |

La comparativa con modelos de otros fabricantes (por ejemplo, CodeLlama o StarCoder2 en el rango sub-1B) no esta disponible en la informacion proporcionada. Los datos de rendimiento comparativo entre estas variantes tampoco se han publicado en la documentacion consultada.

## Limitaciones y advertencias

- El proceso de ablacion elimina rechazos, lo que implica que el modelo puede generar contenido danino, ofensivo o inseguro sin filtros; no es adecuado para aplicaciones de cara al publico sin moderacion adicional.
- La divergencia KL de 0,6246 respecto al modelo original indica un cambio apreciable en la distribucion de salidas; pueden aparecer degradaciones en calidad, coherencia o correccion de codigo no cuantificadas en la model card.
- Con 0,49B de parametros, la capacidad de razonamiento complejo y de generacion de codigo en tareas dificiles es limitada en comparacion con modelos de 7B o superiores; es esperable una tasa de error alta en problemas no triviales.
- El modelo declara unicamente ingles; el rendimiento en castellano u otros idiomas no esta garantizado ni documentado.
- Riesgo de alucinacion en APIs, librerias y funciones inexistentes, especialmente en codigo de nicho.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias sobre el comportamiento del modelo modificado; la responsabilidad sobre el contenido generado recae en el desplegador.
- El repositorio tiene 0 descargas y 1 like en el momento de la consulta, lo que sugiere poca validacion por parte de la comunidad; conviene evaluar el modelo en el caso de uso concreto antes de adoptarlo.
- No se documentan sesgos especificos, pero al derivar de un modelo entrenado principalmente con codigo en ingles, es probable que presente sesgos hacia practicas y ecosistemas angloparlantes.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/SelfCode/Qwen2.5-Coder-0.5B-Instruct-Uncensored
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-0.5B-Instruct
- Heretic (herramienta de decensoring): https://heretic-project.org
- Blog de la familia Qwen2.5-Coder: https://qwenlm.github.io/blog/qwen2.5-coder-family/
- Repositorio GitHub Qwen2.5-Coder: https://github.com/QwenLM/Qwen2.5-Coder
- Documentacion Qwen: https://qwen.readthedocs.io/en/latest/
- Paper Qwen2.5-Coder: https://arxiv.org/abs/2409.12186
- Paper Qwen2: https://arxiv.org/abs/2407.10671
