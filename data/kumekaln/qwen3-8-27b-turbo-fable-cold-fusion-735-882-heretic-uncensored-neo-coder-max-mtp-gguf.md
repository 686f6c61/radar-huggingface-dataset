# Kumekaln/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NEO-CODER-MAX-MTP-GGUF

## Resumen

Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NEO-CODER-MAX-MTP es un fine-tune comunitario de Qwen 3.8 27B publicado por el usuario Kumekaln a partir del modelo base de DavidAU. Se trata de un ajuste multi-etapa (multi-stage tune, multi-fine tune y merge multi-etapa) realizado con Unsloth en hardware de consumo, orientado a tres frentes: aumentar la capacidad de razonamiento general, reducir drásticamente el número de tokens de "thinking" (a entre 1/2 y 1/10 respecto al Qwen 3.8 base) y mantener un perfil sin restricciones ("uncensored" / abliterated) para escritura creativa y rol.

El repositorio distribuye cuantizaciones GGUF en dos variantes: cuants regulares y cuants "MTP Neo-CODER MAX DI-MATRIX" con doble imatrix. Según el autor, el modelo supera los 730 puntos en ARC-C en 8 bits (735) y 880 en ARC-E, y supera al Qwen 3.8 27B base en los 7 benchmarks principales que cita, así como a Qwen3.6-35B-A3B, Qwen 3.6 27B y Qwen 3.5 27B. El modelo base declara 26.895.998.464 parámetros y licencia Apache 2.0.

Es relevante para quienes buscan un modelo de ~27B cuantizado ejecutable en GPU de consumo, con razonamiento rápido, generación creativa sin filtros y capacidades declaradas de código y uso multimodal (image-text-to-text), aunque conviene tratar las cifras de rendimiento del autor con cautela por tratarse de un fine-tune comunitario sin verificación independiente amplia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen 3.8); detalles adicionales no disponibles |
| Parametros totales | 26.895.998.464 (~27B) |
| Parametros activos | no disponible (no se declara si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF regular y GGUF MTP con imatrix doble ("DI-MATRIX"); niveles concretos (Q4_K_S, Q8, etc.) no detallados en la informacion disponible; pesos originales en bfloat16 |
| Idiomas soportados | ingles, chino (en, zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (este repo); base en safetensors (bfloat16) |

## Arquitectura y entrenamiento

El modelo parte de Qwen 3.8 27B y aplica un proceso descrito por el autor como "multi-stage fine tune, multi-fine tune y multi-stage merge". El entrenamiento se realizo en hardware de consumo con los sistemas de Unsloth, combinados con una tecnica propia denominada "COLD FUSION (GAIN + Unsloth)", desarrollada durante el desarrollo de "Qwen3.6-27B-Fable-Fusion-711". El componente "GAIN" es un metodo que modifica dinamicamente los parametros de entrenamiento por muestra y en tiempo real a medida que el modelo aprende. Ademas se emplea el metodo "Fable Fusion 711".

Los datasets citados en la model card son DavidAU/Polar-STRICT-Datasets y DavidAU/F451-STRICT-Datasets. No se especifica el numero de tokens de entrenamiento ni la composicion detallada de los datasets. Los objetivos declarados del ajuste son: aumentar la inteligencia general y la resolucion de problemas, reducir el bloque de thinking a entre 1/2 y 1/10 de su tamano (reduccion mediana aproximada de 2/3), reformatear y mejorar el bloque de razonamiento, acelerar la generacion de tokens (especialmente en modo MTP), mantener compatibilidad con los tres modos de thinking, evitar el "benchmaxing" y elevar todos los benchmarks principales. El modelo incluye tecnicas "heretic" y "abliterated" para eliminar los filtros de seguridad del modelo base. No se dispone de informacion sobre RLHF/DPO formal.

## Capacidades

- Generacion de texto general con enfoque declarado en alto nivel de detalle.
- Razonamiento con tres modos de operacion (thinking) y bloques de razonamiento reducidos (1/2 a 1/10 de tokens respecto al Qwen 3.8 base segun el autor).
- Escritura creativa: ficcion, relatos, todos los generos, roleplaying.
- Generacion y comprension de codigo ("NEO CODER MAX").
- Pipeline declarado image-text-to-text: capacidad multimodal de entrada de imagen y texto (heredada de la familia Qwen; detalles de implementacion no disponibles).
- Soporte conversacional (tag "conversational").
- Etiquetas de razonamiento y thinking mode ("thinking", "reasoning").
- Aceleracion MTP (multi-token prediction) en las cuants GGUF MTP para mayor velocidad de generacion.
- Modelo "uncensored"/abliterated: sin filtros de seguridad, lo que permite contenido sin restricciones pero exige supervision del usuario.
- Soporte de tool calling: el autor menciona en la pestana "community" benchmarks de terceros con "el mayor rendimiento de tool calling registrado", dato no verificado en la informacion disponible.

## Casos de uso

- Escritura creativa de ficcion y relatos largos: el modelo esta afinado explicitamente para narrativa en todos los generos, con ejemplos de generacion que muestran ganchos narrativos y prosa detallada; adecuado para autores que usan herramientas locales tipo SillyTavern o interfaces con llama.cpp.
- Roleplaying e interaccion de personajes: el tag "roleplaying" y el perfil uncensored lo orientan a simulaciones de personajes sin restricciones de contenido, bajo responsabilidad del usuario.
- Programacion asistida local: la variante "NEO CODER MAX" apunta a generacion y revision de codigo en entornos locales, util para desarrolladores que no pueden enviar codigo propietario a APIs cerradas.
- Razonamiento rapido con bajo consumo de tokens: la reduccion de tokens de thinking (hasta 1/10) lo hace adecuado para agentes y pipelines donde la latencia y el coste de tokens de razonamiento son criticos.
- Agentes multi-paso en hardware de consumo: con cuants de 4 bits, un modelo de ~27B puede ejecutarse en GPU de consumo (24 GB), lo que habilita agentes locales con razonamiento iterativo.
- Prototipado e investigacion de tecnicas de entrenamiento: el metodo COLD FUSION/GAIN y el enfoque multi-stage merge son material de estudio para quien experimenta con fine-tunes comunitarios y merges.
- Asistentes conversacionales sin filtros para casos donde los filtros estandar bloquean consultas legitimas, asumiendo el usuario los riesgos eticos y legales.
- Procesamiento multimodal imagen-texto: el pipeline image-text-to-text sugiere uso en descripcion de imagenes o razonamiento visual, aunque la model card no documenta esta capacidad en detalle.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible en forma de tabla verificable. El autor afirma cifras que reproducimos solo como declaraciones de la model card, sin datos independientes: ARC-C de 735 en 8 bits y 719 en 4 bits, ARC-E de 882, y superacion del Qwen 3.8 27B base en "los 7 benchmarks criticos", ademas de superar a Qwen3.6-35B-A3B, Qwen 3.6 27B y Qwen 3.5 27B en esos mismos benchmarks. No se detallan metricas como MMLU, HumanEval o GSM8K, ni metodologia de evaluacion, por lo que estas cifras deben considerarse no verificadas.

## Requisitos de hardware

- Tamano del repo: 389,0 GB en total (incluye multiples cuants y variantes; cada archivo individual pesa menos segun su nivel de cuantizacion).
- VRAM estimada para inferencia: para un modelo de ~27B, una cuantizacion de 4 bits (Q4_K_S) requiere aproximadamente 16-18 GB de VRAM; 8 bits aproximadamente 28-30 GB. Cifras exactas por cuant no disponibles.
- GPU recomendadas: RTX 3090/4090 (24 GB) para cuants de 4 bits con offload parcial; A100 40/80 GB o H100 para cuants de 8 bits o precision completa sin offload.
- Cabe en GPU de consumo: si, en cuants de 4 bits en una RTX 3090 o RTX 4090 (posiblemente con descarga parcial a RAM); los cuants de 8 bits requieren GPU de gama datacenter o multi-GPU.
- Opciones de despliegue: llama.cpp (formato GGUF nativo), Ollama, LM Studio, KoboldCpp y cualquier runtime compatible con GGUF; el soporte de MTP y de las cuants con doble imatrix depende de la version de llama.cpp o del runtime empleado.
- Latencia y throughput: no disponibles; el autor declara aceleracion de generacion de tokens, especialmente con las cuants MTP, sin cifras concretas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882 (este) | ~27B | no disponible | Apache 2.0 | Fine-tune uncensored, thinking reducido, GGUF regular y MTP |
| Qwen 3.8 27B (base) | ~27B | no disponible | Apache 2.0 (presumible) | Modelo original; mas tokens de thinking, benchmarks inferiores segun el autor |
| Qwen3.6-35B-A3B | ~35B (MoE) | no disponible | no disponible | Superado en benchmarks segun el autor; mayor tamano total |
| Qwen3.6-27B-Fable-Fusion-711-Uncensored-Heretic | ~27B | no disponible | no disponible | Predecesor del mismo ecosistema (DavidAU), con 2300+ likes y 3M+ descargas declaradas |

## Limitaciones y advertencias

- Modelo "uncensored" y abliterated: se han eliminado deliberadamente los filtros de seguridad. Puede generar contenido ofensivo, peligroso o ilegal. Su uso es responsabilidad exclusiva del usuario y no es apto para entornos de produccion sin salvaguardas externas.
- Las cifras de benchmarks provienen del autor del modelo y no estan verificadas de forma independiente; el propio autor niega el "benchmaxing", pero no hay metodologia publicada en la informacion disponible.
- Fine-tune comunitario sin respaldo de la organizacion Qwen: posible degradacion en tareas fuera del enfoque del ajuste (creatividad, razonamiento) y comportamientos imprevistos tras el merge multi-etapa.
- Longitud de contexto no documentada en la informacion disponible; verificarla antes de planificar cargas de trabajo con documentos largos.
- Idiomas limitados a ingles y chino segun los metadatos; el rendimiento en castellano no esta documentado.
- La capacidad image-text-to-text esta declarada en el pipeline tag pero no documentada en detalle; puede no funcionar en todos los runtimes GGUF.
- El soporte de MTP y cuants DI-MATRIX puede requerir versiones recientes de llama.cpp u otros runtimes; en runtimes antiguos puede degradarse a funcionamiento estandar o fallar.
- Licencia Apache 2.0: permite uso comercial, pero al tratarse de un derivado de Qwen conviene revisar los terminos del modelo base y las practicas de la organizacion original.
- Riesgo de alucinacion: no disponible dato especifico; como todo LLM, puede generar informacion falsa con apariencia plausible.

## Enlaces

- Repositorio del modelo: https://huggingface.co/Kumekaln/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NEO-CODER-MAX-MTP-GGUF
- Modelo base: https://huggingface.co/DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU
- Predecesor referenciado (Fable Fusion 711): https://huggingface.co/DavidAU/Qwen3.6-27B-Fable-Fusion-711-Uncensored-Heretic-NM-DAU-NEO-MAX-MTP-GGUF
- Datasets citados: https://huggingface.co/datasets/DavidAU/Polar-STRICT-Datasets y https://huggingface.co/datasets/DavidAU/F451-STRICT-Datasets
- Paper, blog o demo: no disponibles en la informacion proporcionada.
