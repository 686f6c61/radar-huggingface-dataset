# AtomicChat/Mistral-Small-4-119B-2603-GGUF

## Resumen

Esta ficha corresponde a la cuantización GGUF de Mistral Small 4, un modelo multimodal de Mistral AI con 119.000 millones de parámetros totales y unos 6.500 millones activos, lo que indica una arquitectura de tipo mezcla de expertos (MoE). La versión original (`mistralai/Mistral-Small-4-119B-2603`) ha sido cuantizada por AtomicChat bajo el sello "Atomic Dynamic" (AD), un esquema de cuantización dinámica que reasigna bits entre bloques del transformer según su energía de activación, con el objetivo de minimizar la divergencia KL respecto a los pesos originales.

El repositorio ofrece dos ficheros principales orientados a dos clases de memoria: uno para sistemas con 64 GB (49,64 GB en disco) y otro para 96 GB (69,22 GB). Cada fichero ha sido medido contra los pesos originales y comparado lado a lado con el fichero equivalente de Unsloth del mismo tamaño, mostrando mejoras medibles en divergencia KL y en concordancia de siguiente token (top-1). Es relevante ahora mismo porque permite ejecutar un modelo de gran capacidad multimodal en hardware de gama alta de consumo o estación de trabajo, sin depender de un clúster de servidores.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE multimodal (image-text-to-text) |
| Parámetros totales | 118.972.826.624 (~119B) |
| Parámetros activos | ~6,5B (dato indicado por el autor del repo) |
| Longitud de contexto | No disponible (el ejemplo de ejecución usa `-c 32768`) |
| Tipos de cuantización | AD-IQ3_XXS (49,64 GB), AD-IQ4_XS (69,22 GB), Q8_0 (126 GB, mencionado como referencia), mmproj F16 y Q8_0 para el proyector de visión |
| Idiomas soportados | en, fr, es, de, it, pt, nl, zh, ja, ko, ar |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (dividido en 2 ficheros por cuantización), compatible con llama.cpp |

## Arquitectura y entrenamiento

El modelo base es un transformer MoE con 128 expertos de los que 4 están activos por token, además de un experto compartido y un router. El proyector de visión (mmproj) se distribuye por separado en F16 (0,86 GB) o Q8_0 (0,47 GB) y es común a todos los ficheros de cuantización. La parte de atención, el experto compartido y el router se mantienen a `q8_0` en todas las cuantizaciones; solo se cuantizan los expertos enrutados.

Sobre el entrenamiento del modelo base no se aporta información en la model card (número de tokens, composición del dataset, RLHF/DPO), por lo que no está disponible. La innovación destacable está en la cuantización: AtomicChat usa una matriz de importancia calculada con 3,8 millones de tokens a través del chat template propio del modelo (frente a los 102 fragmentos de las cuantizaciones de Unsloth), y reasigna bits hacia los primeros bloques del modelo, ya que con 128 expertos y solo 4 activos, un pequeño error temprano en el router condiciona qué expertos eligen todos los bloques posteriores. El resultado es una divergencia KL un 4,2 % menor (clase 64 GB) y un 7,8 % menor (clase 96 GB) que los ficheros equivalentes de Unsloth, con intervalos de confianza bootstrap del 95 %.

## Capacidades

- Generación de texto conversacional multi-turno (tag `conversational`).
- Comprensión de imágenes (pipeline `image-text-to-text`), mediante el proyector de visión incluido (mmproj).
- Modo de razonamiento conmutable (en Atomic Chat aparece desactivado por defecto y se activa con un interruptor).
- Soporte multilingüe en 11 idiomas: inglés, francés, español, alemán, italiano, portugués, neerlandés, chino, japonés, coreano y árabe.
- Ejecución local mediante llama.cpp, con soporte de plantilla Jinja (`--jinja`).
- No hay información explícita sobre tool calling ni capacidades de agente en la model card.

## Casos de uso

- Chatbot local con visión: se puede montar un asistente que analice imágenes enviadas por el usuario (capturas, documentos escaneados, fotos) junto con texto, ejecutándose íntegramente en una estación de trabajo con 96 GB de VRAM unificada o RAM+VRAM.
- Asistente privado on-premise para empresas: al ser Apache 2.0 y ejecutarse en local, es adecuado para organizaciones que no pueden enviar datos a APIs de terceros (salud, legal, sector público).
- Razonamiento bajo demanda: el modo de razonamiento activable permite usar respuestas rápidas para tareas simples y razonamiento extendido para problemas complejos, ajustando coste y latencia por consulta.
- Atención al cliente multilingüe: cubre 11 idiomas de forma nativa, útil para desplegar un único modelo que atienda consultas en español, francés, alemán, etc., sin enrutar a modelos distintos por idioma.
- Investigación en cuantización: los ficheros incluyen métricas de divergencia KL y top-1 publicadas en un repositorio aparte, lo que lo hace útil como referencia para estudios de degradación por cuantización en modelos MoE grandes.
- Generación aumentada con documentos largos: el ejemplo de ejecución usa 32.768 tokens de contexto, suficiente para RAG sobre documentos extensos combinados con imágenes.
- Prototipado con hardware de gama alta de consumo: la variante de 49,64 GB puede ejecutarse en configuraciones Mac con 64 GB de memoria unificada o en PC con combinación de GPU y RAM suficiente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Sí se publican métricas de calidad de cuantización:

| Fichero | Tamaño en disco | Divergencia KL | top-1 |
|---|---:|---:|---:|
| AD-IQ3_XXS (clase 64 GB) | 49,64 GB | 0,1279 | 86,0 % |
| AD-IQ4_XS (clase 96 GB) | 69,22 GB | 0,0609 | 90,4 % |
| Q8_0 (referencia, 126 GB) | 126 GB | 0,041 | 92,3 % |

Comparativa con Unsloth a igual tamaño:

| Clase de memoria | Fichero AD | KL | top-1 | Fichero Unsloth | KL | top-1 | Diferencia KL (IC 95 %) |
|---|---|---:|---:|---|---:|---:|---:|
| 64 GB | AD-IQ3_XXS (49,64 GB) | 0,1279 | 85,99 % | UD-Q3_K_S (49,64 GB) | 0,1336 | 85,74 % | -4,2 % (-8,0 a -1,1) |
| 96 GB | AD-IQ4_XS (69,22 GB) | 0,0609 | 90,44 % | UD-Q4_K_S (69,47 GB) | 0,0661 | 90,07 % | -7,8 % (-10,6 a -4,9) |

## Requisitos de hardware

- Variante AD-IQ3_XXS: 49,64 GB en disco; pensada para sistemas con 64 GB de memoria (por ejemplo, Mac Studio con 64 GB de memoria unificada, o combinaciones de GPU + VRAM/RAM).
- Variante AD-IQ4_XS: 69,22 GB en disco; pensada para sistemas con 96 GB de memoria (Mac Studio 96 GB, o estaciones con 2-3 GPU de 48 GB tipo A6000/RTX 6000 Ada).
- La variante Q8_0 completa requiere unos 126 GB, fuera del alcance de GPU de consumo.
- No cabe en GPUs de consumo convencionales (RTX 4090 con 24 GB) de forma aislada; sería necesario offloading parcial a RAM con pérdida de rendimiento.
- Despliegue recomendado: llama.cpp (`llama-server`) con `--mmproj` para visión, `-ngl 99`, `-c 32768` y `--temp 0.1`. Compatible con el ecosistema GGUF; no se menciona soporte específico de vLLM, TGI u Ollama en la model card.
- Latencia y throughput: no disponibles; al ser un MoE con solo 6,5B de parámetros activos, la velocidad de generación debería ser elevada en hardware adecuado, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Mistral Small 4 119B (este repo, GGUF) | ~119B | ~6,5B | No disponible (ejemplo con 32k) | Apache 2.0 | GGUF |
| Mistral Small 4 119B (original) | ~119B | ~6,5B | No disponible | Apache 2.0 | Safetensors |
| Cuantizaciones de Unsloth del mismo modelo | ~119B | ~6,5B | No disponible | Apache 2.0 | GGUF |

Comparado con las cuantizaciones de Unsloth del mismo modelo, los ficheros Atomic Dynamic logran una divergencia KL entre un 4,2 % y un 7,8 % menor a igual tamaño en disco, con una concordancia top-1 ligeramente superior (+0,25 y +0,37 puntos porcentuales). Frente al modelo original en safetensors, estos GGUF permiten inferencia en memoria unificada o multi-GPU sin necesidad de un servidor con cientos de GB de VRAM. No hay información suficiente para comparar con otros MoE multimodales de tamaño similar.

## Limitaciones y advertencias

- No hay datos de benchmarks de capacidad (razonamiento, código, matemáticas) en la model card, por lo que la calidad del modelo base debe verificarse en fuentes independientes.
- El modelo base tiene 128 expertos con 4 activos: los errores de cuantización en los primeros bloques afectan de forma amplificada al enrutamiento posterior; AtomicChat mitiga esto, pero cualquier cuantización implica cierta degradación (KL 0,06-0,13 según variante).
- La longitud de contexto máxima del modelo base no está documentada en este repo; el ejemplo usa 32.768 tokens.
- El proyector de visión es un componente separado (mmproj); si se omite en la carga, se pierde la capacidad multimodal.
- Licencia Apache 2.0: sin restricciones relevantes para uso comercial, aunque deben respetarse los términos de uso del modelo base de Mistral AI.
- Riesgo de alucinación, sesgos y limitaciones idiomáticas: no documentados en la model card; aplicar las cautelas habituales para LLM en producción.
- La variante AD-IQ4_XS (69,22 GB) excede la VRAM de una única GPU de consumo; requiere memoria unificada o multi-GPU con offloading.
- La temperatura recomendada en el ejemplo de ejecución es baja (0.1), lo que sugiere salidas más deterministas; ajustar según el caso de uso.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/AtomicChat/Mistral-Small-4-119B-2603-GGUF
- Modelo base: https://huggingface.co/mistralai/Mistral-Small-4-119B-2603
- Repositorio de métricas de cuantización: https://huggingface.co/datasets/AtomicChat/Mistral-Small-4-119B-2603-GGUF-metrics
- Atomic Chat: https://atomic.chat/
- GitHub de Atomic Chat: https://github.com/AtomicBot-ai/Atomic-Chat
- Discord de la comunidad: https://discord.gg/8wGSsvmg4V
- Cuenta de X: https://x.com/atomic_chat_hq
