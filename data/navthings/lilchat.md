# navthings/lilchat

## Resumen

lilchat es un modelo de chat de 297 millones de parámetros desarrollado por el usuario navthings y publicado en HuggingFace. Se trata de un ajuste fino supervisado (SFT) de lilbase, un modelo Llama entrenado desde cero por el mismo autor, adaptado a formato conversacional mediante el dataset HuggingFaceTB/smol-smoltalk. Su arquitectura es un transformer decoder-only estándar (`LlamaForCausalLM`), sin mezcla de expertos ni mecanismos híbridos.

El interés del modelo es fundamentalmente didáctico y experimental: demuestra que es posible entrenar y afinar un modelo conversacional completo desde cero en hardware de consumo (un MacBook Air con MLX), con un presupuesto de cómputo mínimo. El ajuste fino consumió aproximadamente 37 millones de tokens en 1.136 pasos, alrededor del 12 % de smol-smoltalk, y mejoró la pérdida en datos retenidos de 2,230 (lilbase) a 1,337.

Se distribuye en safetensors y en dos cuantizaciones GGUF (q8_0 y q4_k_m), con integración directa en Ollama y un playground web. No obstante, el propio autor advierte de que el modelo "no sabe cosas": produce respuestas seguras pero incorrectas en hechos y matemáticas, y su memoria entre turnos es débil. Es un modelo para experimentación, prototipado y entornos con recursos muy limitados, no para producción con requisitos de fiabilidad.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (LlamaForCausalLM) |
| Parámetros totales | 297.010.176 (297 M) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | safetensors (aproximadamente fp32, 1,19 GB), GGUF q8_0 (379 MB), GGUF q4_k_m (274 MB) |
| Idiomas soportados | Inglés (en) |
| Licencia | No disponible |
| Formato de pesos | safetensors, GGUF |
| Modelo base | navthings/lilbase |
| Dataset de ajuste | HuggingFaceTB/smol-smoltalk |
| Plantilla de prompt | Estilo Llama-2 con `</s>` (id 2) como token de inicio |
| Tamaño del repositorio | 1,8 GB |

## Arquitectura y entrenamiento

lilchat es un transformer decoder-only con tokenizador y plantilla de chat de la familia Llama. Su predecesor, lilbase, fue entrenado desde cero por el autor (no es un derivado de Llama de Meta ni de ningún otro modelo publicado), y sobre él se aplicó un ajuste fino supervisado completo (full SFT) en MLX sobre un MacBook Air. El entrenamiento consistió en 1.136 pasos con lotes de 32.768 tokens, lo que suma aproximadamente 37 millones de tokens, cerca del 12 % del dataset smol-smoltalk. La pérdida se calculó únicamente sobre los turnos del asistente, lo que concentra el aprendizaje en las respuestas y no en el contexto del usuario.

La innovación técnica aquí no está en la arquitectura, sino en el proceso: el autor documenta el pipeline completo en el repositorio `sprout` (directorio `sft/`), lo que lo convierte en una referencia reproducible para quien quiera entender el ciclo de preentrenamiento y ajuste conversacional a pequeña escala. No se menciona uso de RLHF, DPO ni decodificación especulativa. La pérdida en datos retenidos bajó de 2,230 a 1,337 con el ajuste. La plantilla de prompt es estilo Llama-2: `</s>[INST] ... [/INST] ... </s>`, con `<<SYS>>...</SYS>>` para mensajes de sistema. El autor recomienda temperatura 0,4 y advierte de que la decodificación greedy entra en bucles.

## Capacidades

- Generación de texto conversacional en inglés, con respuestas en frases completas y parada limpia al terminar.
- Seguimiento del formato de chat Llama-2, incluyendo mensajes de sistema.
- Generación de listas y bloques de código con formato correcto.
- Mantenimiento de conversaciones multiturno con contexto limitado (el autor señala memoria débil entre turnos).
- Ejecución local en CPU, GPU de consumo, Mac con MLX y navegador mediante el playground del autor.
- Tool calling / function calling: no disponible.
- Capacidades de agente o razonamiento multi-paso: no disponibles.
- Visión, audio o modo "thinking": no disponibles.
- Multilingüismo: limitado a inglés; no se declara soporte de otros idiomas.

## Casos de uso

- Asistentes embebidos en dispositivos de bajos recursos: con la cuantización q4_k_m (274 MB) el modelo cabe en Raspberry Pi, portátiles antiguos y móviles, cubriendo chatbots de propósito general con presupuesto de memoria inferior a 1 GB.
- Prototipado de pipelines de chat antes de escalar: permite validar plantillas de prompt, formato de turnos y lógica de parada en un modelo que corre en segundos, antes de invertir en un modelo mayor.
- Educación y experimentación en IA: sirve como caso de estudio completo de preentrenamiento desde cero y SFT, con el código en el repositorio `sprout` y métricas de pérdida publicadas.
- Demos interactivas en navegador: el playground del autor permite probar el modelo sin instalación, útil para talleres, charlas o documentación interactiva.
- Generación de texto offline en aplicaciones de escritorio: al distribuirse en GGUF y ejecutarse con Ollama o llama.cpp, funciona sin conexión y sin enviar datos a servicios externos.
- Formateo de contenido estructurado: el modelo produce listas y bloques de código de forma fiable, por lo que puede usarse para tareas de reescritura, resumen corto o transformación de texto con formato predefinido.
- Evaluación comparativa de técnicas de SFT: al publicar la pérdida retenida y el detalle del entrenamiento, sirve como baseline reproducible frente a otros ajustes sobre smol-smoltalk.
- Clasificación y enrutado ligero en cascadas de modelos: por su tamaño y latencia, puede actuar como primer nivel para decidir si una consulta requiere un modelo mayor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor solo reporta una métrica de entrenamiento: la pérdida en datos retenidos.

| Métrica | lilchat | lilbase |
|---|---|---|
| Pérdida en datos retenidos (held-out loss) | 1,337 | 2,230 |
| Tokens de ajuste | Aproximadamente 37 M (1.136 pasos de 32 k tokens) | No aplica |
| Porcentaje del dataset usado | Aproximadamente 12 % de smol-smoltalk | No aplica |

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,2 GB en fp32 (safetensors), 0,6 GB en fp16, 0,38 GB en q8_0 y 0,27 GB en q4_k_m, más el espacio de la caché KV (que depende de la longitud de contexto y del número de secuencias simultáneas).
- GPU recomendadas: cualquier GPU con más de 2 GB de VRAM es suficiente; no requiere A100 ni H100. Funciona en RTX 3060, RTX 4090, GPUs integradas y Apple Silicon.
- Cabe holgadamente en GPU de consumo: GTX 1650, RTX 3050, RTX 4090, iGPU Intel/AMD y chips Apple M1 o superiores.
- CPU: funciona en CPU sin GPU; el autor lo afinó y ejecutó en un MacBook Air.
- Opciones de despliegue: Ollama (`ollama run navthings/lilchat`), llama.cpp (GGUF), MLX en Apple Silicon, transformers en Python y el playground web del autor. vLLM o TGI son técnicamente posibles pero desproporcionados para este tamaño.
- Latencia y throughput: no disponibles de forma medida; por el tamaño del modelo, la generación en GPU de consumo se sitúa en el rango de cientos de tokens por segundo, y en CPU en decenas.

## Comparativa con modelos similares

Los datos de los modelos comparativos proceden de documentación pública general y no de la información proporcionada en esta ficha; conviene verificarlos antes de usarlos.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| navthings/lilchat | 297 M | No disponible | No disponible | HuggingFace, Ollama, GGUF |
| HuggingFaceTB/SmolLM2-360M-Instruct | 360 M (aprox.) | No disponible en esta ficha | No disponible en esta ficha | HuggingFace, GGUF |
| Qwen2.5-0.5B-Instruct | 494 M (aprox.) | No disponible en esta ficha | No disponible en esta ficha | HuggingFace, GGUF |
| Llama-3.2-1B-Instruct | 1,24 B (aprox.) | No disponible en esta ficha | No disponible en esta ficha | HuggingFace, GGUF |

Frente a estas alternativas, lilchat destaca por su tamaño reducido y por ser entrenado íntegramente desde cero, mientras que los modelos comparativos cuentan con pipelines de preentrenamiento mucho más grandes y datos de evaluación publicados. Su principal desventaja es la ausencia de benchmarks y de licencia declarada.

## Limitaciones y advertencias

- Alucinación factual y matemática: el autor advierte explícitamente de que el modelo "no sabe cosas" y produce respuestas seguras pero incorrectas en hechos y aritmética.
- Memoria débil entre turnos: la coherencia conversacional se degrada en diálogos largos.
- Decodificación greedy inestable: el autor indica que la decodificación determinista entra en bucles, por lo que recomienda temperatura 0,4.
- Solo inglés: no hay soporte declarado de castellano ni de otros idiomas.
- Licencia no disponible: sin licencia explícita no se puede asumir permiso de uso comercial; hay que contactar con el autor antes de integrarlo en un producto.
- Procedencia de los datos de preentrenamiento de lilbase no documentada en la información disponible, lo que añade incertidumbre legal y de sesgos.
- Longitud de contexto no especificada, lo que impide planificar casos de uso con entradas largas.
- Adopción nula: 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación externa ni informes de fallos en producción.
- Las fechas de creación y actualización del repositorio (26 de septiembre de 2026) no son coherentes con el calendario actual; conviene verificar la vigencia del repositorio.
- No soporta tool calling ni flujos de agente, lo que limita su integración en pipelines automatizados complejos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/navthings/lilchat
- Modelo base: https://huggingface.co/navthings/lilbase
- Dataset de ajuste: https://huggingface.co/datasets/HuggingFaceTB/smol-smoltalk
- Repositorio de código (sprout, directorio sft/): https://github.com/navthings/sprout
- Playground web: https://navthings.github.io/playground/
