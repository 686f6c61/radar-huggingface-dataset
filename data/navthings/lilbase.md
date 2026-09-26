# navthings/lilbase

## Resumen

lilbase es un modelo de lenguaje base (no ajustado para instrucciones) de 297 millones de parámetros, desarrollado por el usuario navthings y publicado en HuggingFace. Se trata de un transformer estilo Llama entrenado desde cero sobre 6.100 millones de tokens del subconjunto sample-10BT de FineWeb-Edu, lo que lo sitúa aproximadamente en el punto óptimo de Chinchilla para su tamaño. Su objetivo es servir como modelo base ligero y reproducible: dado un inicio de frase, continúa el texto en lugar de responder preguntas.

La arquitectura emplea las convenciones habituales de la familia Llama (GQA, RoPE, RMSNorm, SwiGLU) con 24 capas, dimensión oculta de 1024, 16 cabezas de consulta, 4 cabezas de clave/valor y embeddings atados. La ventana de contexto es de 1024 tokens y el tokenizador es el de Llama con un vocabulario de 32.000 entradas. El entrenamiento se realizó en una TPU v5e-8 de Kaggle con paralelismo de datos sobre 8 chips, durante 11.043 pasos de 524.000 tokens cada uno, alcanzando una pérdida de validación de 2,608.

Su relevancia actual radica en que es un ejemplo de entrenamiento desde cero a pequeña escala, con pesos publicados en safetensors y GGUF (incluidas cuantizaciones q8_0 y q4_k_m), lo que permite ejecutarlo en CPU y en GPU de consumo. Está pensado para experimentación, docencia y desarrollo de variantes de chat —el propio autor publica una versión conversacional llamada lilchat— más que para uso productivo en tareas que requieran hechos fiables.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder estilo Llama (GQA, RoPE, RMSNorm, SwiGLU) |
| Parametros totales | 297.010.176 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 1024 tokens |
| Tipos de cuantizacion | GGUF q8_0 y q4_k_m publicados; safetensors sin cuantizar |
| Idiomas soportados | Ingles (en) |
| Licencia | no disponible |
| Formato de pesos | safetensors (transformers `LlamaForCausalLM`) y GGUF |
| Capas | 24 |
| Dimension oculta | 1024 |
| Cabezas de consulta / clave-valor | 16 / 4 |
| Vocabulario | 32.000 (tokenizador de Llama) |
| Embeddings | atados (tied) |

## Arquitectura y entrenamiento

lilbase es un transformer decoder denso que sigue el diseño de Llama: normalización RMSNorm, activación SwiGLU en el bloque feed-forward, codificación posicional rotatoria (RoPE) y atención con consultas agrupadas (GQA) con 16 cabezas de consulta y 4 cabezas de clave/valor. Consta de 24 capas con dimensión oculta de 1024, embeddings de entrada y salida atados y un vocabulario de 32.000 tokens heredado del tokenizador de Llama. No incorpora mecanismos de atención lineal ni decodificación especulativa.

El entrenamiento se llevó a cabo desde cero sobre 6.100 millones de tokens procedentes del subconjunto sample-10BT de HuggingFaceFW/fineweb-edu, una muestra filtrada por calidad educativa. El proceso constó de 11.043 pasos de 524.000 tokens, con paralelismo de datos sobre 8 chips de una TPU v5e-8 de Kaggle, y alcanzó una pérdida de validación (held-out loss) de 2,608. El autor indica que la cantidad de tokens es aproximadamente óptima según la relación de Chinchilla para este tamaño de modelo. No se documenta en la información disponible ninguna fase de ajuste por instrucciones, RLHF o DPO; se trata, por tanto, de un modelo puramente base. La única evaluación publicada compara sus resultados con GPT-2 de 124 millones.

## Capacidades

- Generación de texto por continuación: al ser un modelo base, completa secuencias a partir de un prefijo en lugar de responder a preguntas.
- Coherencia gramatical sólida en inglés, según la propia model card.
- Modelado de lenguaje general: útil para medir perplejidad, evaluar tokenizadores o servir de punto de partida para ajuste fino.
- Conversación: no soportada de forma nativa; el autor remite a la variante lilchat para uso conversacional.
- Tool calling / function calling: no disponible.
- Uso como agente o razonamiento multi-paso: no disponible.
- Capacidades multilingües: únicamente inglés.
- Capacidades especiales (modo pensamiento, visión, audio): no disponibles.
- Despliegue local: compatible con Ollama y llama.cpp gracias a los pesos GGUF publicados.

## Casos de uso

- Fine-tuning para dominios concretos: al ser un modelo base pequeño (297 M de parámetros) y con pesos en safetensors, se puede ajustar en una única GPU de consumo para tareas de clasificación, resumen o generación especializada en inglés.
- Experimentación académica y docencia: reproduce un pipeline completo de entrenamiento desde cero sobre FineWeb-Edu, útil para estudiar el efecto del número de tokens, la pérdida de validación y las decisiones arquitectónicas en modelos pequeños.
- Pruebas de infraestructura de inferencia: con variantes GGUF de 274 MB y 379 MB, sirve para validar despliegues con llama.cpp u Ollama en CPU, edge o entornos con VRAM muy limitada.
- Generación de texto creativo de continuación: dado un inicio de frase, produce párrafos gramaticalmente correctos, adecuado para demos interactivas como el playground del autor.
- Benchmarking y comparación de modelos: su evaluación frente a GPT-2 de 124 M (HellaSwag, ARC-Easy, LAMBADA) lo convierte en una referencia útil para calibrar modelos pequeños en tareas de sentido común.
- Base para variantes conversacionales: el propio autor lo utiliza como punto de partida de lilchat, por lo que sirve de plantilla para construir asistentes de chat mediante ajuste por instrucciones.
- Prototipado rápido de aplicaciones de autocompletado: con contexto de 1024 tokens y latencia baja en hardware modesto, permite validar interfaces de autocompletado antes de escalar a modelos mayores.
- Investigación sobre cuantización: la disponibilidad de q8_0 y q4_k_m con métricas de perplejidad permite estudiar el impacto de la cuantización en modelos pequeños.

## Benchmarks y rendimiento

| Benchmark | lilbase | GPT-2 124M |
|---|---|---|
| HellaSwag (acc_norm) | 41,0 % | 31,1 % |
| ARC-Easy (acc_norm) | 50,5 % | 39,5 % |
| LAMBADA | 28,7 % | 32,6 % |

Datos publicados por el autor en la model card. No se han publicado resultados adicionales de benchmarks en la información disponible. La pérdida de validación (held-out loss) reportada es de 2,608.

## Requisitos de hardware

- VRAM estimada para inferencia: en precisión completa (safetensors de 1,19 GB en el repo) ronda 1,2-2 GB contando activaciones; en GGUF q8_0 (379 MB) aproximadamente 0,5-1 GB; en q4_k_m (274 MB) por debajo de 1 GB.
- GPU recomendadas: cualquier GPU moderna con 2 GB o más de VRAM es suficiente; no requiere A100, H100 ni RTX 4090 para inferencia. Una GTX 1650, RTX 3050 o superior funciona sin problemas.
- GPU de consumo: sí, cabe holgadamente en cualquier GPU de consumo actual e incluso en iGPU con memoria compartida.
- CPU: puede ejecutarse en CPU mediante llama.cpp u Ollama; con las variantes cuantizadas es viable en portátiles.
- Opciones de despliegue: Ollama (`ollama run navthings/lilbase`), llama.cpp con los ficheros GGUF, y transformers con `LlamaForCausalLM` para los pesos safetensors.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | HellaSwag | ARC-Easy | LAMBADA | Licencia | Formatos |
|---|---|---|---|---|---|---|---|
| lilbase | 297 M | 1024 | 41,0 % | 50,5 % | 28,7 % | no disponible | safetensors, GGUF |
| GPT-2 124M | 124 M | 1024 | 31,1 % | 39,5 % | 32,6 % | MIT (referencia habitual) | safetensors, otros |
| lilchat (variante del mismo autor) | ~297 M | 1024 | no disponible | no disponible | no disponible | no disponible | no disponible |

Los únicos datos comparativos publicados por el autor corresponden a GPT-2 de 124 M. Para el resto de alternativas de tamaño similar no se dispone de resultados en la información proporcionada.

## Limitaciones y advertencias

- Es un modelo base: no responde a preguntas ni sigue instrucciones; hay que darle un prefijo de texto a completar.
- Alucinación elevada: el propio autor advierte que "los hechos se inventan con seguridad" ("facts are confidently made up"). No es apto para tareas que exijan veracidad factual.
- Riesgo de sesgos: entrenado sobre FineWeb-Edu, puede heredar sesgos presentes en la web filtrada; no se documenta ninguna mitigación.
- Idioma: solo inglés. No soporta castellano ni otros idiomas de forma fiable.
- Contexto limitado: 1024 tokens, insuficiente para documentos largos o conversaciones multi-turno extensas.
- Licencia no disponible: al no especificarse licencia, no se puede garantizar el uso comercial; conviene contactar con el autor antes de emplearlo en producción.
- Uso en producción no recomendado para tareas críticas: el tamaño y la naturaleza base del modelo implican baja fiabilidad en razonamiento, matemáticas o conocimiento factual.
- Sin soporte de tool calling, agentes ni multimodalidad.
- Rendimiento por debajo de GPT-2 en LAMBADA (28,7 % frente a 32,6 %), lo que indica menor capacidad en predicción de palabras a larga distancia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/navthings/lilbase
- Variante conversacional lilchat: https://huggingface.co/navthings/lilchat
- Repositorio de código: https://github.com/navthings/lilbase
- Playground en navegador: https://navthings.github.io/playground/
- Dataset de entrenamiento: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
