# DavidAU/Qwen3-8B-64k-Josiefied-Uncensored-HORROR-Max-GGUF

## Resumen

Qwen3-8B-64k-Josiefied-Uncensored-HORROR-Max-GGUF es una cuantizacion GGUF publicada por DavidAU sobre el fine-tune "Josiefied-Qwen3-8B-abliterated-v1" de Goekdeniz-Guelmez, que a su vez parte de Qwen3-8B de Alibaba. El modelo base de esta cadena es Qwen3-8B, un transformer denso de 8.190.735.360 parametros con modo de razonamiento explicito (bloques ` thinking `), al que se le ha aplicado una ablation de las capas de rechazo y se ha extendido el contexto de 32.768 a 65.536 tokens mediante YaRN.

La particularidad de esta version es el proceso de cuantizacion: los GGUFs se han generado con un dataset de calibracion imatrix orientado a horror y ficcion explicita, y los tensores de salida se han forzado a 16 bits para preservar calidad de generacion. El resultado es un modelo orientado a escritura creativa sin filtros, roleplay y narrativa grafica, con licencia Apache 2.0 y un repositorio de 77,5 GB que contiene multiples niveles de cuantizacion.

Es relevante para quien necesite un modelo de 8B ejecutable en hardware de consumo, con contexto largo, capacidad de razonamiento y sin restricciones de contenido para fiction writing. No es un modelo de proposito general para produccion empresarial: su valor esta en la generacion literaria y el roleplay sin censura.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3), con modo thinking; contexto extendido mediante YaRN |
| Parametros totales | 8.190.735.360 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 65.536 tokens (64k); minimo sugerido de 8k a 16k para thinking/output |
| Tipos de cuantizacion | Multiples quants GGUF (p. ej. IQ4_XS citado en la model card); tensores de salida a 16 bits |
| Idiomas soportados | no disponible (la model card no detalla lista de idiomas; hereda los de Qwen3-8B) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo de cuantizaciones); modelo base en bfloat16 |

## Arquitectura y entrenamiento

La base es Qwen3-8B, un transformer denso de 8,19 mil millones de parametros con atencion por cabezas agrupadas (GQA) y soporte nativo de modo de razonamiento con bloques ` thinking `. Sobre esa base, Goekdeniz-Guelmez aplico una ablation ("abliterated") que elimina el comportamiento de rechazo, y DavidAU extendio el contexto de 32.768 a 65.536 tokens usando YaRN segun las notas tecnicas del repositorio de Qwen. No se dispone de datos sobre el volumen de tokens de entrenamiento ni sobre la composicion del dataset de la ablation.

La innovacion de esta publicacion concreta esta en la cuantizacion: los ficheros GGUF se han generado con un dataset imatrix especifico ("HORROR Imatrix") orientado a narrativa de terror y ficcion grafica, lo que ajusta la asignacion de bits por tensor hacia las distribuciones de activacion de ese dominio. Ademas, los tensores de salida se han fijado a 16 bits para reducir la degradacion en la generacion. El autor publica una variante paralela con distinto imatrix ("NEO") que produce salidas diferentes. No se han publicado detalles sobre RLHF, DPO ni datos de post-entrenamiento especificos de esta cadena.

## Capacidades

- Generacion de texto y narrativa larga: escenas, relatos, continuacion de escenas y generacion de tramas y subtramas en todos los generos (terror, ciencia ficcion, romance, etc.).
- Modo de razonamiento explicito: genera bloques de pensamiento internos en etiquetas ` thinking ` antes de la respuesta; el autor sugiere un minimo de 8k a 16k de contexto para acomodar thinking y salida.
- Escritura creativa sin censura: contenido explicito, lenguaje soez, horror grafico y tematicas R-18 permitidas por diseno.
- Roleplay y conversacion multi-turno con contexto de hasta 64k tokens.
- Escritura "vivid prosing": la model card enfatiza prosa descriptiva y detallada.
- Compatibilidad con plantillas Jinja y ChatML.
- Soporte de system role opcional para forzar cadenas de pensamiento largas.
- Tool calling y function calling: no documentado en la informacion disponible (heredado potencialmente de Qwen3-8B, pero no confirmado para este fine-tune).
- Capacidades de agente y multi-step reasoning: no documentadas especificamente; el modo thinking esta presente.
- Vision y audio: no soportados (modelo de texto).
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Escritura de ficcion de terror y horror grafico: el modelo se ha calibrado con un imatrix orientado a ese dominio, por lo que genera escenas viscerales y descriptivas en primera o tercera persona con coherencia sostenida a lo largo de miles de tokens, aprovechando la ventana de 64k.
- Generacion de novelas y relatos largos por capitulos: la ventana de 65.536 tokens permite mantener arcos argumentales, personajes secundarios y subtramas en contexto sin resumir, algo inviable en modelos de 8k.
- Roleplay narrativo sin restricciones: conversaciones multi-turno con personajes, escenarios y contenido adulto, donde la ablation elimina los rechazos que interrumpirian la inmersion.
- Continuacion de escenas y "scene continue": dado un fragmento existente, el modelo prolonga la narracion manteniendo tono, voz y estilo, util para escritores que trabajan con borradores parciales.
- Generacion de tramas y subtramas para guionistas: usar el modo thinking para que el modelo planifique estructuras narrativas (actos, giros, conflictos) antes de redactar, con contexto suficiente para volcar toda la biblia del proyecto.
- Prototipado de videojuegos narrativos y aventuras conversacionales: integrable via llama.cpp u Ollama en local para generar dialogos de PNJ y descripciones dinamicas sin coste de API y sin filtros de contenido que rompan la ficcion.
- Experimentacion en investigacion sobre alineacion y censura: al ser una variante abliterated con licencia Apache 2.0, sirve para estudiar el efecto de la ablation en la distribucion de salidas y comparar con el Qwen3-8B original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite a la model card de Qwen3-8B para benchmarks del modelo base, pero no aporta mediciones propias de esta cuantizacion ni de la ablation.

## Requisitos de hardware

- VRAM estimada: depende del quant. Un IQ4_XS de un modelo de 8B ocupa aproximadamente 4,5-5 GB; Q4_K_M en torno a 5 GB; Q5_K_M cerca de 5,7 GB; Q6_K alrededor de 6,6 GB; Q8_0 en torno a 8,7 GB. Los quants de mayor tamano del repo (hasta 77,5 GB totales) incluyen variantes de alta precision.
- Cabe en GPU de consumo: si. Una RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB, RTX 4070/4080 o RTX 4090 ejecutan sin problema los quants de 4 a 8 bits. Incluso una GPU de 8 GB puede con Q4.
- GPU profesionales: A100, H100 y L40S sobradas para cualquier quant; utiles si se sirven varias instancias o contextos de 64k completos, donde la KV cache crece de forma notable.
- Nota sobre contexto: con 64k tokens la KV cache consume varios GB adicionales; para contextos completos conviene GPU de 24 GB o mas, o bien offload parcial a CPU.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio (el autor cita pruebas en LM Studio), y servidores compatibles con la API de endpoints; vLLM y TGI no soportan GGUF de forma nativa, requeririan el modelo base en safetensors/bfloat16.
- Latencia y throughput: no disponibles en la informacion proporcionada.
- Ajustes recomendados por el autor: temperatura alta (2.2 en el ejemplo con IQ4_XS), top_k 100, top_p 0.95, min_p 0.05, repetition penalty 1.1 con rango 64; el autor advierte que los quants mayores rinden mejor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-8B-64k-Josiefied-Uncensored-HORROR-Max-GGUF | 8,19B | 65.536 | Apache 2.0 | Ficcion sin censura, horror, roleplay | GGUF en HF |
| Qwen3-8B (original) | 8,19B | 32.768 (extensible) | Apache 2.0 | Proposito general con thinking | Safetensors y GGUF en HF |
| Josiefied-Qwen3-8B-abliterated-v1 | 8,19B | 32.768 | Apache 2.0 | Qwen3-8B sin rechazos | Safetensors en HF |
| Variante NEO del mismo autor | 8,19B | 65.536 | Apache 2.0 | Igual con imatrix distinto | GGUF en HF |

Frente al Qwen3-8B original, esta version gana contexto (64k frente a 32k), elimina los rechazos y orienta la cuantizacion a ficcion, pero pierde las garantias de alineacion y la validacion de benchmarks del modelo oficial. Frente al Josiefied original, anade la extension de contexto y el imatrix de horror. No se dispone de datos de rendimiento comparativo medido.

## Limitaciones y advertencias

- Contenido explicito y sin filtros: el modelo genera lenguaje soez, violencia grafica y material R-18 por diseno; no es apto para entornos con menores ni para aplicaciones de cara al publico sin moderacion posterior.
- Sesgos: al ser una ablation de Qwen3-8B sin datos de des-sesgo documentados, hereda y potencialmente amplifica los sesgos del modelo base; no hay evaluacion publicada al respecto.
- Alucinacion: como todo modelo generativo de 8B, inventa hechos con facilidad; en ficcion es aceptable, pero no debe usarse como fuente de datos verificables.
- Idiomas: la lista de idiomas no esta documentada en esta ficha; el comportamiento multilingue puede degradarse respecto al Qwen3-8B original tras la ablation.
- Licencia: Apache 2.0 permite uso comercial, pero el contenido generado y su adecuacion legal (difamacion, material sexual, violencia) recaen sobre el desplegador.
- Calidad dependiente del quant: el autor advierte que los quants pequenos rinden notablemente peor; IQ4_XS se describe como rendimiento "medio".
- Contexto efectivo: aunque el modelo acepta 64k, el autor recomienda 8k-16k para thinking y salida; rendimientos mas alla de esa ventana no estan validados.
- Configuracion sensible: requiere parametros de muestreo especificos (temperaturas altas, min_p, repetition penalty) para funcionar bien; los valores por defecto de muchas aplicaciones produciran salidas pobres.
- Sin benchmarks: no hay mediciones publicadas de esta cuantizacion, por lo que las afirmaciones de calidad son del autor y no verificadas de forma independiente.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/DavidAU/Qwen3-8B-64k-Josiefied-Uncensored-HORROR-Max-GGUF
- Variante NEO Max GGUF: https://huggingface.co/DavidAU/Qwen3-8B-64k-Josiefied-Uncensored-NEO-Max-GGUF
- Modelo base de la cadena (Josiefied): https://huggingface.co/Goekdeniz-Guelmez/Josiefied-Qwen3-8B-abliterated-v1
- Modelo original Qwen3-8B (benchmarks y ajustes): https://huggingface.co/Qwen/Qwen3-8B
- Guia de parametros y samplers del autor: https://huggingface.co/DavidAU/Maximizing-Model-Performance-All-Quants-Types-And-Full-Precision-by-Samplers_Parameters
- Perfil del autor: https://huggingface.co/DavidAU
