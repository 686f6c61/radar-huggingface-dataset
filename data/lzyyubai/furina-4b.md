# LZYYuBai/furina-4b

## Resumen

Furina 4B es un modelo de lenguaje afinado para roleplay y conversación, publicado por el usuario LZYYuBai en Hugging Face y distribuido en formato GGUF para su uso con llama.cpp. El modelo se basa en Qwen3.5-4B, el modelo base de 4.000 millones de parámetros de la familia Qwen de Alibaba, y adapta sus capacidades conversacionales generales hacia interacciones de juego de rol de carácter narrativo, un nicho muy activo en la comunidad open source.

El nombre del modelo remite a Furina, personaje del videojuego Genshin Impact, lo que sugiere que el ajuste se ha orientado a interpretar este tipo de personajes ficticios con personalidad propia en diálogos mult-turno. Este tipo de modelos "character fine-tune" resuelven el problema de que los modelos base tienden a ser asistentes neutros y poco adecuados para narrativa inmersiva, y son relevantes para desarrolladores que construyen chatbots de personajes, herramientas de ficción interactiva o frontends como SillyTavern.

Al tratarse de un modelo de 4B parámetros cuantizado en GGUF, su interés principal es la ejecución local en hardware de consumo, con un repositorio de 7,2 GB. Cabe señalar que el acceso al repositorio está restringido (gated) y requiere aceptar condiciones en Hugging Face antes de la descarga.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5) |
| Parámetros totales | 4.205.751.296 |
| Parámetros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | GGUF (cuantizaciones concretas no especificadas en la ficha) |
| Idiomas soportados | Chino (zh); el modelo base Qwen3.5 soporta adicionalmente inglés y otros idiomas, pero la ficha solo declara zh |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura transformer de Qwen3.5-4B, la generación más reciente de la familia Qwen de Alibaba. No se ha publicado información sobre el método de ajuste empleado (LoRA, full fine-tuning), el dataset de entrenamiento, el número de tokens del ajuste ni el uso de técnicas como DPO o RLHF. Dado el enfoque de roleplay declarado en las etiquetas, es razonable asumir un ajuste supervisado sobre datos de conversaciones de personaje, pero esto no está documentado en la ficha del repositorio.

La distribución en GGUF mediante llama.cpp permite cargar el modelo con distintos niveles de cuantización (Q4_K_M, Q5_K_M, Q8_0, etc.), aunque el repositorio no detalla qué variantes exactas incluye. El tamaño de 7,2 GB sugiere la presencia de una o varias cuantizaciones de calidad media-alta para un modelo de 4B.

## Capacidades

- Generación de texto conversacional orientada a roleplay y personajes ficticios.
- Chat mult-turno en chino (idioma declarado en la ficha); el modelo base Qwen3.5 mantiene capacidades multilingües, presumiblemente incluido el inglés.
- Compatibilidad con el ecosistema llama.cpp y derivados (Ollama, LM Studio, KoboldCpp, SillyTavern mediante backends compatibles).
- No se ha documentado soporte de tool calling, function calling, agentes, visión ni audio en la ficha; estas capacidades dependerían del modelo base, pero no constan verificadas para este ajuste.

## Casos de uso

- Chatbots de personajes para videojuegos: el modelo puede encarnar personajes con personalidad definida en diálogos interactivos, aprovechando su ajuste específico en roleplay.
- Ficción interactiva y novelas visuales: integración en motores narrativos donde el jugador conversa libremente con personajes, con generación local y sin coste por token.
- Frontends de roleplay como SillyTavern o KoboldCpp: al ser GGUF, se carga directamente en estos entornos para sesiones de juego de rol mult-turno.
- Asistentes locales de ocio en PC de consumo: con 4B parámetros, corre en GPUs domésticas o incluso en CPU, adecuado para usuarios sin acceso a servicios en la nube.
- Prototipado de experiencias conversacionales en chino: base ligera para probar productos de chat con personajes en el mercado chino.
- Generación de diálogos para escritura creativa: apoyo a autores que necesitan improvisar conversaciones entre personajes con coherencia de tono.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Al tratarse de un ajuste de roleplay, además, los benchmarks académicos estándar (MMLU, HumanEval, GSM8K) del modelo base Qwen3.5-4B no serían directamente extrapolables al comportamiento del ajuste.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2,5-3 GB con cuantización Q4_K_M y 4-4,5 GB con Q8_0, más la memoria de la caché KV según la longitud de contexto.
- GPU recomendadas: cualquier GPU de consumo con 4 GB o más de VRAM (RTX 3060, RTX 4060, RTX 4090 con holgura amplia); también viable en CPU gracias a llama.cpp, con velocidades de generación menores.
- Consumer GPUs: sí, cabe cómodamente en GPUs de gama media; incluso en portátiles con GPU integrada moderna usando offload parcial a RAM.
- Opciones de despliegue: llama.cpp (formato nativo), Ollama, LM Studio, KoboldCpp, text-generation-webui con backend llama.cpp, y SillyTavern como frontend de roleplay.
- Latencia y throughput: no disponible; en GPUs de consumo modernas cabe esperar decenas de tokens por segundo para un modelo de 4B cuantizado, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Formato | Enfoque | Licencia |
|---|---|---|---|---|
| Furina 4B (este modelo) | 4,2B | GGUF | Roleplay / personaje | Apache 2.0 |
| Qwen3.5-4B (base) | 4,2B | Safetensors / GGUF | Chat general multilingüe | Apache 2.0 (según ficha del base) |
| Ajustes de roleplay sobre Qwen de tamaño similar en la comunidad | ~4B | GGUF | Roleplay | Variable según repositorio |

Frente al modelo base Qwen3.5-4B, Furina 4B ofrece un comportamiento especializado en roleplay a costa de posible degradación en tareas generales como código o razonamiento. Frente a otros fine-tunes de personaje de la comunidad, comparte formato GGUF y tamaño contenido, aunque la calidad del ajuste no puede compararse cuantitativamente al no existir benchmarks publicados.

## Limitaciones y advertencias

- Sesgos: no documentados; como derivado de Qwen3.5, puede heredar los sesgos del modelo base y de los datos de roleplay empleados en el ajuste, que no están descritos.
- Alucinaciones: riesgo habitual en modelos conversacionales, posiblemente acentuado en roleplay, donde el modelo puede inventar hechos o mezclar el personaje con información factual.
- Idioma: la ficha declara únicamente chino; el rendimiento en español o inglés no está verificado y puede ser inferior al del modelo base.
- Contexto: la longitud de contexto no está especificada; conviene consultar la configuración del modelo base Qwen3.5-4B y probar límites reales en llama.cpp.
- Licencia: Apache 2.0 permite uso comercial, pero conviene revisar las condiciones del acceso gated del repositorio y los términos de uso de Qwen.
- Acceso restringido: el repositorio es gated, lo que añade fricción a la descarga y puede indicar condiciones adicionales impuestas por el autor.
- Proyecto comunitario sin documentación técnica: sin tarjeta de modelo detallada, benchmarks ni datos de entrenamiento, lo que dificulta evaluar su calidad y estabilidad antes de probarlo.
- Popularidad mínima (0 descargas, 1 like en el momento de la ficha): sin validación comunitaria; se recomienda probarlo con cautela en producción.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/LZYYuBai/furina-4b
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Organización de la familia Qwen: https://huggingface.co/Qwen
- Paper, blog o demo: no disponible
