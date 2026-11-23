# Sethblocks/Starlight-Flash

## Resumen

Starlight-Flash es un modelo de lenguaje de tipo texto generativo desarrollado por Sethblocks, construido a partir de una base Qwen-3.5 de 9B parametros (el repositorio declara 9.197.093.888 parametros totales en safetensors). El autor lo presenta como una variante centrada en personalidad ("persona") y mejoras generales, con un ajuste de alineacion mas permisivo que el modelo Qwen original, aunque sin llegar a ser completamente sin censura. La arquitectura subyacente es la de la familia Qwen-3.5 (tag `qwen3_5_text`), empaquetada para `transformers` con pesos en safetensors.

La relevancia del modelo es practica: se posiciona como una opcion pequena (9B) y rapida, con cadena de pensamiento (CoT) relativamente corta, orientada a tareas agenticas y a mantener un rol o personalidad concreto. El autor afirma que es notablemente mejor que sus modelos anteriores en tareas de agente y en el seguimiento de persona, a costa de un rendimiento mas debil en programacion (especialmente desarrollo de GUI/webui) y de una mayor necesidad de guia en las instrucciones.

La informacion publica es escasa: no hay model card detallada con datos de entrenamiento, benchmarks, licencia ni idiomas declarados. La ficha se completa con los datos disponibles y se marcan explicitamente como "no disponible" aquellos campos que el autor no ha publicado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen-3.5, tag `qwen3_5_text`) |
| Parametros totales | 9.197.093.888 (~9,2B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en la model card principal; existe repositorio GGUF separado |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (transformers); GGUF en repositorio aparte |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura de la familia Qwen-3.5, un transformer decoder-only de aproximadamente 9,2B parametros, con pesos publicados en safetensors y compatibilidad con la libreria `transformers`. El autor no detalla la configuracion de capas, atencion ni longitud de contexto en la model card, por lo que estos datos no estan disponibles.

En cuanto al entrenamiento, la model card indica que fue el modelo mas costoso de desarrollar para el autor porque reescribio una parte significativa del codigo de entrenamiento y creo un nuevo esquema de RL especifico para este modelo. No se especifican el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas como RLHF o DPO mas alla de la mencion generica a un "setup de RL". Tampoco se documentan innovaciones tecnicas adicionales (decodificacion especulativa, atencion lineal, etc.).

## Capacidades

- Generacion de texto conversacional multi-turno.
- Seguimiento de personalidad o rol ("persona"), que el autor senala como claramente superior al Qwen base.
- Tareas agenticas: el autor afirma que es "mucho mejor que mis modelos anteriores" en este terreno.
- Razonamiento con cadena de pensamiento corta (CoT breve), lo que contribuye a una inferencia rapida.
- Generacion de codigo, aunque con rendimiento limitado segun el propio autor, especialmente en desarrollo de GUI/webui.
- Alineacion mas permisiva que Qwen (parcialmente sin censura, no del todo).
- Soporte de tool calling / function calling: no disponible (no se menciona en la model card).
- Capacidades multimodales (vision/audio): no disponible.
- Capacidades multilingues: no disponible.

## Casos de uso

- Chatbots con personalidad definida: el modelo esta optimizado para mantener un rol concreto a lo largo de la conversacion, lo que lo hace adecuado para asistentes virtuales con tono y estilo consistentes.
- Agentes automatizados de tareas simples: el autor destaca su mejora en tareas agenticas, por lo que puede emplearse en flujos de varios pasos donde se requiera decidir acciones y ejecutarlas con guia.
- Asistencia conversacional de baja latencia: al ser un modelo de 9B con CoT corta, encaja en escenarios donde prima la velocidad de respuesta sobre la profundidad de razonamiento.
- Prototipado rapido de aplicaciones de texto: su tamano permite desplegarlo en hardware modesto para pruebas y demos.
- Generacion de contenido creativo y roleplay: la orientacion a persona y la menor censura lo hacen util para escritura creativa y personajes.
- Educacion y tutoria guiada: puede usarse en asistentes que requieran un tono pedagogico fijo, siempre con supervision humana por el riesgo de confusion que el autor reconoce.
- Generacion de codigo en tareas acotadas: util para snippets y scripts sencillos, no recomendado para desarrollo de interfaces graficas complejas segun el propio autor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en FP16/BF16, los 9,2B parametros requieren aproximadamente 18-19 GB de VRAM (coincide con el tamano del repo de 18,4 GB). En cuantizacion de 8 bits, en torno a 10-11 GB; en 4 bits, aproximadamente 6-7 GB.
- GPU recomendadas: A100 40/80 GB, H100 o L40S para FP16 con contexto amplio; RTX 4090 (24 GB) para FP16 ajustado o cuantizacion 8 bits.
- GPU de consumo: cabe en RTX 4090 (24 GB) en FP16/BF16; en RTX 3090 (24 GB) de forma similar; en GPUs de 12-16 GB requiere cuantizacion (8 o 4 bits).
- Opciones de despliegue: `transformers` (soporte nativo declarado), llama.cpp/Ollama/LM Studio mediante el repositorio GGUF del autor, y potencialmente vLLM/TGI si la arquitectura Qwen-3.5 esta soportada por dichos frameworks (no confirmado en la informacion disponible).
- Latencia y throughput: no disponibles de forma medida; el autor afirma que el modelo "funciona extremadamente rapido" por su tamano reducido y CoT corta, pero sin cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Starlight-Flash | ~9,2B | no disponible | no disponible | Hugging Face (safetensors + GGUF) | Ajuste de persona y agentico sobre Qwen-3.5 |
| Qwen-3.5 9B (base) | ~9B | no disponible | no disponible | Hugging Face | Modelo base del que deriva; mas censurado y con peor seguimiento de persona segun el autor |
| Alternativas de ~9B (p. ej. Llama 3.1 8B, Gemma 2 9B) | 8-9B | 8K-128K segun modelo | licencias abiertas | Hugging Face | No se dispone de comparacion de rendimiento con Starlight-Flash |

No se dispone de datos de benchmarks que permitan una comparacion cuantitativa con modelos de la misma categoria. La comparativa se limita a parametros y disponibilidad.

## Limitaciones y advertencias

- Rendimiento de programacion limitado, especialmente en desarrollo de GUI/webui, segun el propio autor.
- El modelo "tiende a requerir guia y a veces se confunde": necesita instrucciones claras y supervision en produccion.
- No es completamente sin censura, aunque es menos restrictivo que Qwen; el grado exacto de filtrado no esta documentado.
- Riesgo de alucinacion inherente a los modelos de lenguaje de este tamano; no hay evaluaciones publicadas que lo cuantifiquen.
- Licencia no disponible: no se puede confirmar el uso comercial ni las restricciones legales; es imprescindible contactar con el autor antes de un despliegue productivo.
- Idiomas soportados no declarados; no se garantiza un rendimiento multilingue.
- Longitud de contexto no documentada, lo que dificulta planificar casos de uso con contextos largos.
- Modelo de un autor individual con escasa documentacion y sin benchmarks; madurez y mantenimiento inciertos.
- Sesgos conocidos: no documentados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Sethblocks/Starlight-Flash
- Repositorio GGUF: https://huggingface.co/Sethblocks/Starlight-Flash-GGUF
