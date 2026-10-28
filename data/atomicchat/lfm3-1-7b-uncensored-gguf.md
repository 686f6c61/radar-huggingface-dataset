# AtomicChat/LFM3-1.7B-Uncensored-GGUF

## Resumen

LFM3-1.7B-Uncensored-GGUF es una cuantización GGUF del modelo LFM3-1.7B de Liquid AI, publicada por AtomicChat, en la que se ha eliminado la capa de rechazos de seguridad mediante una edición de pesos quirúrgica. El modelo base es un transformer de 1.728.801.600 parámetros con arquitectura "tri-hybrid" de la familia LFM3, ventana de contexto de 256.000 tokens y post-entrenamiento orientado a agentes (harnesses como Hermes Agent, Pi y OpenClaw). Liquid AI lo posiciona como modelo de texto para agentes locales: a 4 bits ocupa alrededor de 1 GB, por lo que cabe en un teléfono o un portátil convencional.

La modificación de AtomicChat consiste en un LoRA de rango 1 proyectado (dirección = media de activaciones dañinas menos media de activaciones inofensivas, con la componente inofensiva proyectada fuera) horneado en los pesos con W*=2.0 y posteriormente cuantizado. Según las mediciones del autor, los rechazos ante prompts dañinos pasan del 61,7 % al 0,0 % y los falsos rechazos en XSTest del 5,2 % al 0,0 %, mientras que MMLU se mantiene en 41,0 % (McNemar p=1,0) y la prueba needle en contexto largo sigue en 3/3. La deriva distribucional medida es ΔKLD +0,019 frente al modelo base.

Su relevancia práctica es doble: por un lado ofrece inferencia totalmente local y sin censura en hardware muy modesto; por otro, es un caso reproducible de "ablación de seguridad" con evaluación cuantitativa del coste en capacidades, algo poco habitual en la comunidad. Exige una compilación de llama.cpp con soporte para LFM3 (PR #31252).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer "tri-hybrid" de la familia LFM3 (detalle interno de las tres vías no disponible en la información proporcionada) |
| Parametros totales | 1.728.801.600 |
| Parametros activos | No aplica (no se describe como MoE) |
| Longitud de contexto | 256.000 tokens |
| Tipos de cuantizacion | AD-Q4_K_M (5,20 bpw) y AD-Q6_K (7,31 bpw), generadas con imatrix |
| Idiomas soportados | Inglés (en), chino (zh), alemán (de) |
| Licencia | LFM Open License v1.0 (`lfm-open-license-v1.0`, etiquetada como "other") |
| Formato de pesos | GGUF (repositorio de 2,7 GB; no se publican safetensors en este repo) |

## Arquitectura y entrenamiento

El modelo base LFM3-1.7B emplea la arquitectura "tri-hybrid" de tercera generación de Liquid AI, con 1,73 mil millones de parámetros y una ventana de 256.000 tokens. Liquid AI indica que está post-entrenado para harnesses agénticos (Hermes Agent, Pi, OpenClaw), lo que implica un ajuste orientado a llamadas a herramientas y razonamiento multi-paso más que a conversation genérica. No se han publicado en la información disponible el número de tokens de entrenamiento, la composición del dataset ni los detalles de las etapas de RLHF/DPO del modelo base.

Sobre esa base, AtomicChat aplica una ablación de seguridad: calcula una dirección de activación de rango 1 como la diferencia entre la media de activaciones ante prompts dañinos y la media ante prompts inofensivos, proyecta fuera la componente inofensiva y hornea el resultado como LoRA en los pesos con intensidad W*=2.0. Después cuantiza con esquema AD e imatrix. El autor reporta un experimento de control con una edición aleatoria del mismo tamaño, que degradó MMLU 1,3 puntos y produjo mayor deriva (ΔKLD 0,028 frente a 0,019), y verifica que no aparecen bucles de razonamiento ni salidas vacías con W*=2.0. La model card menciona además que la plantilla de chat del modelo apunta a soporte de entradas multimodales (imagen/vídeo) y tool calls; este repositorio, sin embargo, declara pipeline `text-generation` y no incluye proyector multimodal.

## Capacidades

- Generación de texto conversacional multi-turno en inglés, chino y alemán.
- Razonamiento de contexto largo: ventana de 256.000 tokens, con 3/3 en la prueba needle reportada por el autor.
- Uso como agente: el modelo base está post-entrenado para harnesses agénticos; la plantilla de chat incluye tool calling (según la model card y fuentes secundarias, no verificado en este GGUF).
- Ejecución offline y local: ~1 GB de memoria a 4 bits, apto para teléfonos y portátiles.
- Generación de contenido sin rechazos: 0,0 % de rechazos ante prompts dañinos y 0,0 % de falsos rechazos en XSTest.
- Conocimiento general limitado pero estable tras la ablación: MMLU 41,0 %, idéntico al base.
- No se documentan capacidades específicas de código, matemáticas avanzadas, visión o audio en la información disponible.

## Casos de uso

- Asistentes personales offline en el móvil: con 1,1 GB en disco (AD-Q4_K_M) y ~1 GB de memoria a 4 bits, el modelo se puede empaquetar dentro de una app Android/iOS y funcionar sin conexión, algo crítico en entornos con conectividad intermitente o requisitos de privacidad estrictos.
- Escritura creativa y ficción sin bloqueos: la eliminación de rechazos permite generar narrativa violenta, erótica o políticamente incómoda sin interrupciones del modelo; útil para guionistas, autores de rol y desarrolladores de videojuegos que necesitan diálogos sin fricción, siempre con moderación en la capa de aplicación.
- Procesado de documentos largos en local: los 256.000 tokens de contexto permiten cargar contratos, expedientes o transcripciones completas y hacer preguntas sobre ellos sin enviar datos a la nube; el resultado 3/3 en needle respalda la recuperación en posiciones intermedias.
- Agente local con tool calling: el post-entrenamiento para harnesses agénticos y la plantilla de chat con llamadas a funciones permiten construir automatizaciones que consulten APIs locales, lean ficheros o ejecuten comandos en un equipo de escritorio.
- Red-teaming y evaluación de seguridad: el par base/ablacionado con métricas publicadas (rechazos, XSTest, MMLU, ΔKLD) sirve como banco de pruebas reproducible para estudiar cómo afecta la eliminación de alineamiento a las capacidades y a la distribución de salidas.
- Clasificación y extracción en pipelines ETL ligeros: para etiquetar, resumir o extraer campos de textos en inglés, chino o alemán, un modelo de 1,7 B cuantizado a 4 bits procesa volúmenes altos en CPU con coste marginal casi nulo frente a APIs.
- Atención al cliente en dispositivos embebidos: desplegado con `llama-server` en una Raspberry Pi o mini-PC, puede gestionar FAQs y conversaciones multi-turno en tiendas o kioscos sin dependencia de red.
- Traducción EN/ZH/DE: los tres idiomas declarados cubren flujos de localización entre mercados anglosajón, chino y alemán, aunque sin datos de benchmarks de traducción publicados.

## Benchmarks y rendimiento

| Métrica | Base LFM3-1.7B | Versión uncensored | Notas |
|---|---|---|---|
| Rechazos en prompts dañinos | 61,7 % | 0,0 % | Objetivo de la ablación |
| Falsos rechazos (XSTest) | 5,2 % | 0,0 % | Sin sobrerrechazo residual |
| MMLU (2000 preguntas) | 41,0 % | 41,0 % | McNemar p=1,0; sin caída estadísticamente significativa |
| Needle (contexto largo) | 3/3 | 3/3 | Recuperación en contexto largo preservada |
| ΔKLD vs base (prompts neutros) | — | +0,019 | Deriva distribucional baja |
| Control: edición aleatoria de igual tamaño | — | MMLU −1,3 pp, ΔKLD 0,028 | Referencia de comparación del autor |

No se han publicado resultados de benchmarks frente a otras familias de modelos en la información disponible (HumanEval, GSM8K, MMLU-Pro, etc. no aparecen). Los datos de la tabla son autoevaluaciones del autor de la cuantización, no evaluaciones independientes.

## Requisitos de hardware

- VRAM estimada para inferencia: alrededor de 1 GB a 4 bits para los pesos (cifra de Liquid AI para precisión 4-bit), más la caché KV. No se ha publicado el tamaño de la caché KV a 256.000 tokens; a máxima longitud de contexto esta dominará el consumo y puede superar con holgura el tamaño de los pesos.
- Tamaño en disco: 1,1 GB para AD-Q4_K_M y 1,6 GB para AD-Q6_K (el repositorio completo ocupa 2,7 GB).
- GPU recomendadas: cualquiera con 2-4 GB de VRAM es suficiente (GTX 1650, RTX 3050/3060/4060, RTX 4090 sobrada); también funciona en iGPU y en CPU.
- Cabe en GPU de consumo: sí, en todas las GPU de consumo actuales e incluso en teléfonos y portátiles según Liquid AI; en la práctica la restricción real es la RAM del dispositivo, no la VRAM.
- Opciones de despliegue: llama.cpp (obligatorio un build con soporte LFM3, PR #31252, generado en el commit `19cce69`); también `llama-cli`/`llama-server`, y el tag `endpoints_compatible` sugiere compatibilidad con endpoints estilo OpenAI. Soporte en vLLM, TGI u Ollama: no disponible / no confirmado en la información proporcionada.
- Comando de ejemplo: `llama-cli -hf AtomicChat/LFM3-1.7B-Uncensored-GGUF:AD-Q4_K_M -p "Hello"`.
- Latencia y throughput: no disponibles; no se han publicado mediciones de tokens por segundo para ninguna de las dos cuantizaciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantizaciones | Idiomas | Licencia | Rechazos |
|---|---|---|---|---|---|---|
| AtomicChat LFM3-1.7B-Uncensored (AD-Q4_K_M) | 1,73 B | 256 K | GGUF, 2 variantes | en, zh, de | LFM Open License v1.0 | 0,0 % (MMLU 41,0 %) |
| AtomicChat LFM3-1.7B-Uncensored (AD-Q6_K) | 1,73 B | 256 K | GGUF, 7,31 bpw | en, zh, de | LFM Open License v1.0 | 0,0 % (MMLU 41,0 %) |
| LiquidAI/LFM3-1.7B (base) | 1,73 B | 256 K | Safetensors (repo original) | en, zh, de | LFM Open License v1.0 | 61,7 % (MMLU 41,0 %) |

No hay datos publicados en la información disponible que permitan comparar con alternativas de otras familias (Qwen, Llama, Gemma, SmolLM, etc.) en parámetros, contexto o rendimiento; esa comparación queda como no disponible.

## Limitaciones y advertencias

- Eliminación deliberada de la alineación de seguridad: los rechazos caen a 0,0 %, por lo que el modelo puede generar contenido dañino, ilegal, violento o sexualmente explícito. En producción es imprescindible añadir filtros y moderación propios en la capa de aplicación.
- Riesgo de alucinación alto: con MMLU de 41,0 % y solo 1,7 B de parámetros, el conocimiento factual es limitado y las afirmaciones inventadas son probables, especialmente en dominios especializados.
- Idiomas: solo inglés, chino y alemán están declarados; el español no figura como idioma soportado, por lo que la calidad en castellano no está garantizada ni medida.
- Licencia: LFM Open License v1.0, etiquetada como "other". Las condiciones exactas de uso comercial no se detallan en la información disponible y deben consultarse en el fichero LICENSE del modelo base; además, la redistribución de una versión modificada puede tener requisitos adicionales que no se especifican.
- Dependencia de tooling: requiere una compilación de llama.cpp con soporte LFM3 (PR #31252); versiones anteriores no cargarán el modelo.
- Solo se distribuye en GGUF: no hay safetensors en este repositorio, lo que impide el fine-tuning directo con frameworks habituales sin reconvertir.
- Deriva distribucional: ΔKLD +0,019 frente al base indica un cambio real en la distribución de salidas, aunque pequeño; puede manifestarse en estilo, formato o decisiones de rechazo en casos límite.
- Multimodalidad no verificada: la plantilla de chat apunta a entradas de imagen/vídeo, pero el repositorio declara `text-generation` y no incluye proyector multimodal; no asumir visión sin comprobación.
- Evaluaciones autopublicadas: las cifras de la tabla de benchmarks las aporta el autor de la cuantización, no un tercero independiente, y no se especifican los conjuntos de prompts dañinos empleados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AtomicChat/LFM3-1.7B-Uncensored-GGUF
- Árbol de ficheros: https://huggingface.co/AtomicChat/LFM3-1.7B-Uncensored-GGUF/tree/main
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B
- Licencia del modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B/blob/main/LICENSE
- Documentación de Liquid AI sobre LFM3-1.7B: https://docs.liquid.ai/lfm/models/lfm3-1.7b
- Pull request de llama.cpp con soporte LFM3: https://github.com/ggml-org/llama.cpp/pull/31252
- Aplicación Atomic Chat: https://atomic.chat/
- Repositorio GitHub de Atomic Chat: https://github.com/AtomicBot-ai/Atomic-Chat
- Discord de AtomicChat: https://discord.gg/8wGSsvmg4V
- Cuenta de X de AtomicChat: https://x.com/atomic_chat_hq
- Artículo en AGI Hunt sobre el lanzamiento: https://agihunt.info/en/p/1a18070889be1f479187d62c376
- Publicación en X sobre el modelo: https://x.com/WojakTheDev/status/2115383238751592654
