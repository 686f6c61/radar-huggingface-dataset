# 4everImmortality/dafeiyu-qwen35-4b-dora

## Resumen

Dafeiyu V2 es un adaptador de tipo DoRA (Weight-Decomposed Low-Rank Adaptation) entrenado sobre el modelo base Qwen/Qwen3.5-4B para encarnar a "Dafeiyu", una persona de VTuber de anime con temática de ballena azul. Lo desarrolla el usuario 4everImmortality y se publica como adaptador PEFT independiente, no como modelo completo: los pesos del adaptador ocupan aproximadamente 0,1 GB y requieren descargar el modelo base de 4B parámetros por separado para funcionar.

El objetivo del proyecto es el roleplay conversacional con una personalidad muy definida y un estilo de habla alejado del tono típico de asistente. La model card declara una puntuación de 98,7/100 en "autenticidad" (métrica propia del autor, sin metodología publicada) y ausencia de clichés de IA. El adaptador está pensado para conversaciones en chino, con soporte secundario de inglés, y hereda del modelo base una ventana de contexto nativa de 256K tokens según la documentación del autor.

Su relevancia práctica es acotada: se trata de un artefacto de nicho para demos de personaje, experimentación con DoRA y despliegue de asistentes con personalidad fija. No aporta mejoras de razonamiento ni de codificación sobre el modelo base, y su licencia no está declarada, lo que limita su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador DoRA (PEFT) sobre transformer decoder-only Qwen/Qwen3.5-4B |
| Parametros totales | No disponible para el adaptador; el modelo base declara 4B |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 256K tokens nativos (heredados del modelo base, según el autor) |
| Tipos de cuantizacion | No disponible para el adaptador; el base admite las cuantizaciones habituales (bfloat16 en el ejemplo de uso) |
| Idiomas soportados | Chino (zh) e inglés (en) |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador PEFT) |
| Tamano del repositorio | 0,1 GB |
| Libreria | peft |

## Arquitectura y entrenamiento

El artefacto es un adaptador DoRA, una variante de LoRA que descompone la actualización de pesos en una magnitud y una dirección separadas, lo que en la literatura suele mejorar la estabilidad y la fidelidad del ajuste fino respecto a LoRA estándar con el mismo presupuesto de parámetros. Se aplica sobre Qwen/Qwen3.5-4B, un transformer decoder-only de 4B parámetros con contexto largo; el adaptador en sí solo contiene las matrices de bajo rango, de ahí su tamaño de 0,1 GB.

No se han publicado detalles sobre el dataset de entrenamiento: ni número de tokens, ni composición, ni si hubo fases de SFT, DPO o RLHF. Tampoco se documentan hiperparámetros del entrenamiento DoRA (rango, alpha, capas objetivo) ni el procedimiento de evaluación que respalda la puntuación de 98,7/100 en autenticidad. Toda la información disponible sobre el comportamiento proviene de la definición de personaje incluida en la model card y del prompt de sistema de ejemplo.

## Capacidades

- Generación de texto conversacional en chino e inglés con una persona de VTuber consistente (ballena azul, tono tsundere, referencias al arroz y a la cola de ballena).
- Roleplay multi-turno: mantiene el personaje a través de turnos gracias al prompt de sistema detallado y a la ventana de contexto del modelo base.
- Coherencia de identidad: la model card insiste en la persistencia de la identidad ("大肥鱼") frente a correcciones del usuario.
- Estilo alejado del registro de asistente: el autor declara ausencia de clichés de IA, aunque no hay evaluación independiente que lo respalde.
- Capacidades heredadas del base Qwen3.5-4B (razonamiento, código, matemáticas) en la medida en que el ajuste DoRA no las degrade; no se documenta ninguna evaluación al respecto.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no documentadas para este adaptador.
- Visión o audio: no disponibles.

## Casos de uso

- Demo de personaje para VTuber o stream interactivo: el adaptador se carga sobre Qwen3.5-4B y responde con la voz y los tics definidos en el prompt de sistema, lo que permite prototipar un chat de personaje sin entrenar un modelo completo.
- Chatbot de comunidad de fans: despliegue de un bot de Discord o Telegram con la persona de Dafeiyu, usando el prompt de sistema de la model card como plantilla y temperatura 0,7 y top_p 0,9 como valores de partida.
- Pruebas de investigación sobre DoRA: sirve como ejemplo reproducible de adaptador DoRA pequeño (0,1 GB) sobre un base de 4B para comparar fidelidad de personaje frente a LoRA estándar.
- Generación de diálogos para ficción o guion de anime: el modelo produce réplicas en el registro del personaje, útil para borradores de guion o para doblaje amateur en chino.
- Evaluación de robustez de personas: banco de pruebas para medir cuánto aguanta una persona definida por prompt de sistema ante intentos de jailbreak o cambios de rol.
- Asistente de rol en juegos de mesa o narrativos: conversaciones largas con contexto amplio (256K) donde el personaje debe recordar el estado de la partida.
- Fine-tuning posterior: el adaptador puede servir de punto de partida para nuevos ajustes DoRA sobre el mismo base en otros personajes del mismo universo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La única métrica citada es la puntuación de 98,7/100 en "autenticidad" declarada por el autor, sin metodología, conjunto de evaluación ni comparación con otros adaptadores, por lo que no es verificable.

## Requisitos de hardware

- El adaptador pesa 0,1 GB; el modelo base Qwen3.5-4B debe cargarse aparte.
- VRAM estimada para el base en bfloat16: en torno a 8-10 GB, más el pequeño overhead del adaptador y de la caché KV.
- VRAM estimada en cuantización de 4 bits: aproximadamente 3-4 GB, lo que permite ejecución en GPU de consumo con 8 GB o más.
- GPU recomendadas: RTX 4090 o RTX 3090 para bf16 sin cuantizar; RTX 4060 Ti de 16 GB o RTX 4070 para cuantización; A100 o H100 solo si se necesita throughput alto o contexto muy largo.
- Cabe en GPU de consumo: sí, con cuantización en tarjetas de 8 GB o más; en bf16 conviene 12-16 GB.
- Opciones de despliegue: transformers + peft (flujo documentado por el autor), vLLM o TGI fusionando el adaptador en el base, y llama.cpp u Ollama tras convertir el modelo fusionado a GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| dafeiyu-qwen35-4b-dora | Adaptador sobre base de 4B | 256K (según autor) | Persona VTuber vía DoRA | No disponible | Hugging Face (repo de 0,1 GB) |
| Qwen/Qwen3.5-4B | 4B | 256K (según autor) | Modelo generalista base | No disponible en esta ficha | Hugging Face |
| Adaptadores LoRA de personaje sobre bases de 4B (genéricos) | Adaptador de decenas o cientos de MB | Heredado del base | Roleplay / persona | Variable según autor | Hugging Face |

La comparación cuantitativa con alternativas no es posible: no hay benchmarks publicados para este adaptador y no se dispone de datos verificables de los modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- Licencia no declarada: no se puede asumir uso comercial permitido; hay que contactar con el autor o consultar la licencia del modelo base Qwen3.5-4B antes de desplegar en producción.
- Sesgos de personaje: el prompt de sistema define rasgos (tsundere, territorialidad con la cola, preferencia por el arroz) que el modelo reproducirá de forma insistente; no es adecuado como asistente general.
- Riesgo de alucinación: al ser un ajuste de persona sobre un base de 4B, puede inventar datos con seguridad; no debe usarse como fuente factual.
- Cobertura de idiomas limitada a chino e inglés; el castellano no está soportado oficialmente y el rendimiento será degradado.
- La puntuación de 98,7/100 en autenticidad es una afirmación del autor sin metodología pública; no debe citarse como benchmark.
- Sin datos de entrenamiento ni de evaluación: imposible auditar qué datos se usaron ni si hay contaminación o problemas de seguridad.
- El adaptador requiere el base Qwen3.5-4B; un cambio de versión del base puede romper la compatibilidad de las matrices DoRA.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validación por parte de la comunidad.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/4everImmortality/dafeiyu-qwen35-4b-dora
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Librería PEFT: https://github.com/huggingface/peft
- Documentación de transformers: https://huggingface.co/docs/transformers
