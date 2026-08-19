# Akahsizrr/Mini-Whale-1-12B

## Resumen

Mini-Whale-1-12B es un modelo de lenguaje de arquitectura Mixture-of-Experts (MoE) desarrollado por Akahsizrr, que fusiona el modelo denso Qwen3-4B como anfitrión con 260 expertos especializados en código extraídos de DeepSeek-V4-Flash. El resultado es un sistema de 12.552 millones de parámetros que conserva las capacidades de razonamiento y comprensión del lenguaje de Qwen3, al tiempo que incorpora habilidades de generación de código del modelo DeepSeek. El proyecto se presenta como una solución para ejecutar inferencia local en GPUs de consumo, con un tamaño cuantizado de 8.9 GB en 4-bit, lo que permite su uso en tarjetas como la RTX 3060 de 12 GB.

La arquitectura introduce una innovación destacable: capas puente (bridge layers) de bajo rango que traducen entre el espacio de representación de Qwen3 (dimensión 2560) y el de los expertos de DeepSeek (dimensión 4096), junto con un router basado en puntuación sqrt-softplus con selección top-2. El modelo fue entrenado en dos etapas, la primera mediante QLoRA sobre un conjunto de instrucciones de programación en Python, JavaScript y TypeScript, con 500 pasos y una pérdida que descendió de 0.62 a 0.19. La licencia es Apache-2.0 y el idioma declarado es exclusivamente inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE de fusion (host Qwen3-4B + 260 expertos SwiGLU de DeepSeek-V4-Flash) |
| Parametros totales | 12.552.019.456 (12.55 B) |
| Parametros activos | no disponible (el router selecciona 2 expertos por token, pero no se especifica el total de parametros activos) |
| Longitud de contexto | 40.960 tokens (max position) |
| Tipos de cuantizacion | 4-bit (NF4 via bitsandbytes), BF16 (23.4 GB), 4-bit (8.9 GB) |
| Idiomas soportados | ingles (declarado en la model card) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo combina dos arquitecturas diferentes mediante un mecanismo de fusion por capas. El host es Qwen3-4B, un transformer denso de 36 capas con dimension oculta de 2560, 32 cabezas de atencion (8 KV) y dimension de cabeza de 128. Sobre este host se anaden, en todas las capas, bloques de expertos SwiGLU extraidos de DeepSeek-V4-Flash. Cada experto tiene una dimension oculta de 4096 y una dimension intermedia de 2048, con un total de 303 instancias de expertos distribuidas entre las 36 capas (260 expertos unicos, algunos compartidos entre capas). Las capas profundas (29-35) concentran la mayor densidad de expertos (8-25 por capa), mientras que las primeras capas tienen menos (1-8).

La innovacion clave son las capas puente (bridge layers), adaptadores de bajo rango (rank 7) que proyectan las representaciones de Qwen3 (dim 2560) al espacio de los expertos (dim 4096) y viceversa. El router utiliza una puntuacion sqrt-softplus con seleccion top-2 de expertos por token, normalizando los pesos. Para evitar que los expertos dominen la senal del host, se aplica un mecanismo de seguridad residual: una puerta sigmoide (inicializada en -2.0, lo que implica una contribucion inicial del 12 %), un clamp de la salida del experto a un maximo de 10.0 (coincidiendo con el `swiglu_limit` de DeepSeek-V4-Flash), y una correccion residual de rango 7 que ajusta la salida final.

El entrenamiento se realizo en dos etapas, aunque solo se documenta la primera. La etapa 1 uso QLoRA con cuantizacion 4-bit NF4 del host y adaptadores LoRA entrenables en atencion y capas puente, con 19.5 millones de parametros entrenables. El conjunto de datos fue de instrucciones de codigo (Python, JavaScript, TypeScript). Se ejecutaron 500 pasos con el optimizador AdamW (lr=2e-4, programacion coseno), alcanzando una perdida final de 0.19. La etapa 2 no esta descrita en la documentacion disponible.

## Capacidades

- Generacion de codigo en Python, JavaScript y TypeScript, gracias a los expertos especializados extraidos de DeepSeek-V4-Flash.
- Razonamiento general y comprension del lenguaje, heredados del host Qwen3-4B.
- Razonamiento espacial y habilidades de diseno, mencionadas por el autor en anuncios publicos.
- Capacidades de codificacion agente (agentic coding), segun el autor, lo que sugiere soporte para flujos de trabajo multi-paso.
- Conversacion en ingles, con pipeline de generacion de texto estandar de transformers.
- Soporte de decodificacion especulativa (speculative decoding), mencionado en los tags del modelo como "DSpark", aunque no se detalla su implementacion.
- No se menciona soporte explicito de tool calling o function calling en la documentacion.

## Casos de uso

- Asistente de programacion local: un desarrollador puede ejecutar el modelo en una GPU de consumo (por ejemplo, RTX 3060 12 GB) para obtener sugerencias de codigo y completar funciones en Python, JavaScript o TypeScript sin depender de servicios en la nube. Su tamano cuantizado de 8.9 GB permite una carga rapida en memoria.
- Generacion de codigo en entornos offline: empresas con politicas de seguridad que prohiben enviar codigo a APIs externas pueden desplegar este modelo en infraestructura local para tareas de generacion y revision de codigo.
- Prototipado rapido de scripts: el modelo puede generar esqueletos de programas, funciones auxiliares o ejemplos de uso de bibliotecas, aprovechando su entrenamiento especifico en instrucciones de codigo.
- Educacion y formacion en programacion: al estar especializado en codigo, puede servir como tutor interactivo que explica fragmentos, senala errores comunes o sugiere refactorizaciones en los tres lenguajes soportados.
- Razonamiento con contexto largo: con una ventana de 40.960 tokens, puede procesar repositorios pequenos o documentacion extensa para responder preguntas sobre el codigo, aunque su entrenamiento se centro en instrucciones de codigo y no en analisis de repositorios completos.
- Experimentacion en investigacion: la arquitectura de fusion (host denso + expertos extraidos) es un caso de estudio interesante para investigadores que trabajan en compresion de modelos MoE, extraccion de subredes o adaptacion de representaciones entre espacios latentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas de MMLU, HumanEval, GSM8K ni otros indicadores estandar. El unico dato de rendimiento es la perdida de entrenamiento (0.62 a 0.19), que no es comparable entre modelos. Tampoco se ofrecen mediciones de latencia o throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: 8.9 GB en cuantizacion 4-bit; 23.4 GB en BF16 (pesos completos).
- GPU recomendadas: cualquier GPU con al menos 10-12 GB de VRAM para la version 4-bit (por ejemplo, RTX 3060 12 GB, RTX 4070, RTX 4080). Para BF16 se requiere una GPU profesional (A100, H100) o una consumer de gama alta con 24 GB (RTX 4090).
- Cabe en GPU de consumo: si, en su version 4-bit cabe en tarjetas de 12 GB como la RTX 3060, que es la referencia citada por el autor.
- Opciones de despliegue: el modelo se publica en formato transformers con safetensors, por lo que puede cargarse con la libreria transformers de HuggingFace y cuantizarse con bitsandbytes. No se mencionan archivos GGUF ni compatibilidad con llama.cpp, Ollama o vLLM, aunque al ser un modelo transformers estandar podria adaptarse.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Mini-Whale-1-12B | 12.55 B | 40.960 | MoE de fusion (Qwen3-4B + expertos DeepSeek) | Apache-2.0 | HuggingFace |
| Qwen3-4B (base) | 4 B | 40.960 (segun config) | Denso | Apache-2.0 | HuggingFace |
| DeepSeek-V4-Flash | no disponible | no disponible | MoE (origen de los expertos) | no disponible | no disponible |
| Mini-Whale-Flash | no disponible | no disponible | Fusion similar (mismo autor) | no disponible | HuggingFace |

La comparacion directa no es posible sin datos de benchmarks. Mini-Whale-1-12B se posiciona como un modelo intermedio entre un denso de 4B y un MoE grande, ofreciendo capacidades de codigo especializadas con un coste de inferencia moderado. Su principal diferenciacion frente a Qwen3-4B es la adicion de los expertos de codigo, y frente a DeepSeek-V4-Flash, su tamano reducido y aptitud para hardware de consumo.

## Limitaciones y advertencias

- Solo se declara soporte para ingles; no hay evidencia de capacidades multilingues.
- El entrenamiento documentado se limita a 500 pasos en la etapa 1, lo que sugiere un ajuste fino relativamente corto y posiblemente insuficiente para tareas complejas fuera del dominio de codigo.
- No se publican benchmarks, por lo que el rendimiento real en tareas estandar (razonamiento, matematicas, generacion de codigo) es desconocido y no verificable.
- La arquitectura de fusion depende de capas puente de rango 7, que podrian introducir perdida de informacion al proyectar entre espacios de distinta dimension.
- El mecanismo de seguridad residual (puerta inicializada en -2.0) implica que los expertos contribuyen poco al principio; si el ajuste fino no fue suficiente, la contribucion efectiva de los expertos podria ser limitada.
- No se documenta la etapa 2 del entrenamiento, lo que deja incognitas sobre el proceso completo de optimizacion.
- La licencia Apache-2.0 cubre el modelo resultante, pero los componentes base (Qwen3-4B y DeepSeek-V4-Flash) tienen sus propias licencias que deben verificarse para uso comercial.
- El modelo se creo en agosto de 2026 y tiene pocas descargas (159) y valoraciones (13), lo que indica una adopcion limitada y poca validacion por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Akahsizrr/Mini-Whale-1-12B
- Modelo relacionado del mismo autor (Mini-Whale-Flash): https://huggingface.co/Akahsizrr/Mini-Whale-Flash
- Anuncio del autor en X (Twitter): https://x.com/RoliumGens/status/2087312248800706604
- Repositorio GitHub (proyecto MiniWhale, posiblemente relacionado con el ecosistema del modelo): https://github.com/Dwell-Jing/mini-whale
