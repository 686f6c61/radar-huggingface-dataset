# feverdoingwork/Qwen3.8-27B-IQ-A-Starlight

## Resumen

Qwen3.8-27B-IQ-A-Starlight es una cuantización del modelo Qwen3.8-27B, un modelo denso de 27.000 millones de parámetros desarrollado por el equipo Qwen. Esta versión concreta la publica el usuario `feverdoingwork` y está empaquetada exclusivamente para el motor de inferencia Starlight, no para Transformers, llama.cpp, Ollama ni LM Studio. El archivo resultante ocupa 11,86 GiB y combina pesos en bloques de 3 y 4 bits (IQ3_S e IQ4_XS), lo que permite ejecutar el modelo completo en una única tarjeta gráfica de 16 GB, ya sea de AMD o de NVIDIA.

El modelo base es un modelo nativo de visión y lenguaje con atención híbrida (lineal y completa en proporción 4:1) y una ventana de contexto de 262.144 tokens. Incluye dentro del mismo archivo tanto el codificador visual como una cabeza de predicción multi-token (MTP) que actúa como borrador para decodificación especulativa. La licencia es Apache-2.0, heredada del modelo base.

La relevancia de esta ficha es doble: por un lado documenta una receta de cuantización agresiva que hace viable un modelo de 27B multimodal en hardware de consumo; por otro, advierte de que el formato `.starlight` es propietario del motor homónimo, lo que limita su portabilidad frente a los formatos GGUF o safetensors habituales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal con atención híbrida lineal/completa (intervalo 4:1) |
| Parametros totales | 27.000 millones (modelo base) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262.144 tokens (límite del modelo base) |
| Tipos de cuantizacion | IQ4_XS (64 tensores, 5,73 GiB), IQ3_S (194 tensores, 5,28 GiB), IQ3_XXS (4), Q3G64 (embeddings, vocabulario podado a 141.312 entradas), Q4G64 (54), Q5G64 (54), BF16 (582), W8G32 (2) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | `.starlight` (archivo único, 12.735.418.624 bytes) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un transformer denso de 27B parámetros con atención híbrida: combina capas de atención lineal con capas de atención completa en una proporción de 4 a 1, lo que reduce el coste de memoria de la caché KV en contextos largos. Es un modelo nativo de visión y lenguaje, con codificador visual integrado, y soporta una ventana de 262.144 tokens. La model card de esta cuantización no detalla la composición del dataset de entrenamiento, el número de tokens vistos ni si hubo fases de RLHF o DPO; esos datos corresponden al modelo base y no se reproducen aquí.

La innovación técnica de esta ficha es el empaquetado: la receta IQ-A mezcla bloques IQ4_XS e IQ3_S para mantener el tamaño en 11,86 GiB, poda el vocabulario a 141.312 entradas y conserva en el mismo archivo el codificador visual y la cabeza MTP. Esa cabeza MTP permite decodificación especulativa sin archivo borrador externo; el motor Starlight también admite un modo DFlash2 con un drafter separado que no forma parte de este repositorio.

## Capacidades

- Generación de texto y razonamiento multi-paso sobre contextos de hasta 262.144 tokens.
- Procesamiento de imagen y texto de forma conjunta (pipeline `image-text-to-text`), con codificador visual incluido en el archivo.
- Decodificación especulativa mediante la cabeza MTP integrada, con aceleración adicional opcional vía DFlash2.
- Capacidades de código, trabajo profesional, investigación y tareas agénticas de horizonte largo, según la descripción del modelo base en los resultados de búsqueda.
- Servicio local mediante interfaz HTTP compatible con OpenAI a través del motor Starlight.
- Soporte de tool calling y function calling: no confirmado en la información disponible para esta cuantización.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Asistencia sobre documentación extensa: con 262.144 tokens de contexto y caché de atención en q4_0, el modelo puede cargar manuales técnicos o bases de código completas y responder preguntas cruzadas sin trocear el material.
- Análisis de imágenes en local: al incluir el codificador visual en el mismo archivo, permite describir capturas, diagramas o documentos escaneados en una estación de trabajo con una sola GPU de 16 GB, sin enviar datos a la nube.
- Prototipado de agentes multi-paso: la ventana larga y la decodificación especulativa con MTP permiten mantener historiales de herramientas y observaciones extensos con velocidades de 69 a 180 tok/s según configuración.
- Generación de código en estaciones de trabajo: un único RTX 5060 Ti alcanza 113 tok/s en modo DFlash2, suficiente para autocompletado interactivo y refactorizaciones guiadas por contexto de repositorio.
- Investigación académica con hardware de consumo: la combinación de licencia Apache-2.0 y requisitos de 16 GB facilita reproducir experimentos multimodales en laboratorios sin clúster.
- Despliegue en dos GPU de gama media: con dos RTX 5060 Ti se logra la ventana completa de 262.144 tokens y 180,3 tok/s en DFlash2, útil para servir una instancia interna compatible con OpenAI a un equipo pequeño.
- Evaluación comparativa de cuantizaciones: el archivo sirve para medir la pérdida de calidad de IQ3_S/IQ4_XS frente al BF16, aunque la model card no publica aún esa comparación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K) en la información disponible. La model card solo aporta medidas de velocidad y ventana de contexto del motor Starlight:

| Tarjeta | Modo | Mayor contexto arrancado | Velocidad de decodificación |
|---|---|---|---|
| RX 9070 XT (1) | MTP | 174.400 tokens | Sin registro |
| RX 9070 XT (1) | DFlash2 | 170.496 tokens (262.144 con desbordamiento de caché) | 137,1 tok/s (BetterBench, 24 oct 2026) |
| RTX 5060 Ti (1) | MTP | 200.704 tokens (262.144 con desbordamiento) | 69,3 tok/s (29 oct 2026) |
| RTX 5060 Ti (1) | DFlash2 | 149.504 tokens (262.144 con desbordamiento) | 113,0 tok/s (29 oct 2026) |
| RTX 5060 Ti (1) | Sin especulación | 229.376 tokens (262.144 con desbordamiento) | 29,7 tok/s (29 oct 2026) |
| RTX 5060 Ti (2) | MTP | 262.144 tokens | 122,8 tok/s (29 oct 2026) |
| RTX 5060 Ti (2) | DFlash2 | 262.144 tokens | 180,3 tok/s (29 oct 2026) |

Las cifras son ejecuciones únicas con la build de Starlight de la fecha indicada y caché de atención q4_0; no son extrapolables a otras máquinas.

## Requisitos de hardware

- VRAM estimada: 11,86 GiB de pesos más caché KV; cabe en una GPU de 16 GB.
- GPU validadas en la model card: AMD RX 9070 XT, NVIDIA RTX 5070 Ti (soportada, sin cifras de ventana), RTX 5060 Ti en configuración simple o doble.
- Cabe en GPU de consumo: sí, en las tarjetas de 16 GB citadas.
- Despliegue: exclusivamente mediante el motor Starlight y su Launcher; no compatible con vLLM, llama.cpp, Ollama, LM Studio, TGI ni Transformers.
- Throughput medido: de 29,7 tok/s (sin especulación, una RTX 5060 Ti) a 180,3 tok/s (DFlash2, dos RTX 5060 Ti).
- El desbordamiento de caché de atención hacia RAM del sistema permite alcanzar los 262.144 tokens a costa de latencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B-IQ-A-Starlight | 27B densos | 262.144 | `.starlight` | Apache-2.0 | Solo motor Starlight; 11,86 GiB; visión y MTP integrados |
| Qwen/Qwen3.8-27B (base) | 27B densos | 262.144 | Safetensors (presumible) | Apache-2.0 | Pesos sin cuantizar; requiere mucha más VRAM; portable a Transformers y otros motores |
| Otras cuantizaciones GGUF del mismo base | 27B densos | 262.144 | GGUF | Apache-2.0 | No disponibles en la información proporcionada; serían portables a llama.cpp y Ollama |

No se dispone de datos de benchmarks que permitan comparar calidad entre estas variantes.

## Limitaciones y advertencias

- El archivo solo funciona con el motor Starlight; no es un checkpoint de propósito general ni se ha probado en otros programas.
- No se publica ninguna medida de calidad de esta cuantización frente al modelo BF16; la receta de 3 y 4 bits introduce pérdida de calidad no cuantificada.
- El vocabulario está podado a 141.312 entradas, lo que puede afectar a la cobertura lingüística respecto al modelo original.
- Los tamaños de ventana medidos dependen de la tarjeta, el tipo de caché y el uso concurrente de VRAM; los casos no listados no se han medido.
- Riesgo de alucinación inherente a todo modelo de lenguaje, reconocido explícitamente en la model card.
- Sesgos conocidos: no documentados en la información disponible.
- Idiomas soportados: no especificados; no se puede garantizar un rendimiento multilingüe concreto.
- Licencia Apache-2.0 permite uso comercial, pero la dependencia del motor Starlight condiciona el despliegue en producción.
- El repositorio tiene cero descargas y cero likes en el momento de la consulta, por lo que no hay validación comunitaria independiente.

## Enlaces

- Hugging Face: https://huggingface.co/feverdoingwork/Qwen3.8-27B-IQ-A-Starlight
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Fireworks AI (Qwen3.8 27B): https://fireworks.ai/models/fireworks/qwen3p8-27b
- Together AI (Qwen3.8 27B): https://www.together.ai/models/qwen3-8-27b
- BetterBench v0.6.1: https://github.com/GGZ14/BetterBench
