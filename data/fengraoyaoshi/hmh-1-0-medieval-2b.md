# fengraoyaoshi/HMH-1.0-Medieval-2B

## Resumen

HMH-1.0-Medieval-2B es un ajuste fino mediante LoRA del modelo base Qwen/Qwen3.5-2B-Base, desarrollado por el usuario fengraoyaoshi. Se trata de un modelo de 1.881.825.088 parámetros (aproximadamente 1,88 mil millones) orientado a la interpretación de personajes (role-play) de época medieval, concretamente para dar vida a NPC genéricos en videojuegos: campesinos, herreros, mercaderes, guardias, sacerdotes, taberneros o comadronas. Su rasgo diferencial es que su techo de capacidades forma parte deliberada del personaje: el modelo está entrenado para ser malo en aritmética y para ignorar cualquier conocimiento posterior al siglo XV.

El modelo está pensado con el chino mandarín como idioma principal; los datos de entrenamiento, el estilo y la evaluación se realizaron en mandarín, mientras que el inglés funciona como respaldo. La licencia es Apache 2.0 y el repositorio incluye pesos fusionados en bf16, cuantizaciones GGUF (Q5_K_M y Q4_K_M) y el adaptador LoRA original para continuar el entrenamiento. Su relevancia actual radica en que aborda un problema poco tratado: la mayoría de los modelos de role-play medieval conservan los sesgos de asistente moderno (conocen la teoría microbiana, resuelven ecuaciones y rompen el personaje ante preguntas técnicas), mientras que este degrada sus capacidades de forma graduada y plausible.

La arquitectura subyacente es un transformer de la familia Qwen3.5, en su variante de texto (se eliminó la torre de visión del checkpoint multimodal original y se re-guardó como Qwen3_5ForCausalLM). El contexto, los datos de benchmarks y otros detalles técnicos no están disponibles en la información proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3.5, variante de texto Qwen3_5ForCausalLM; torre de visión eliminada del checkpoint multimodal original) |
| Parametros totales | 1.881.825.088 (aprox. 1,88B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | bf16 (pesos fusionados), GGUF Q5_K_M, GGUF Q4_K_M; adaptador LoRA (21,8M parámetros) |
| Idiomas soportados | Chino (zh) e inglés (en); el chino es el idioma principal y el inglés funciona como respaldo |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (model.safetensors), GGUF, adaptador LoRA |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-2B-Base. Para obtener la variante de texto se eliminó la torre de visión y se volvió a guardar el modelo como Qwen3_5ForCausalLM, con 1,88B parámetros; según el autor, los logits se verificaron idénticos al checkpoint multimodal original con una coincidencia top-1 del 100%. Sobre esta base se aplicó un adaptador LoRA con r=32, alpha=64, dropout de 0,05, sobre las proyecciones q/k/v/o/gate/up/down_proj, lo que supone 21,8 millones de parámetros entrenables.

El entrenamiento utilizó un schedule de learning rate 1,2e-4 con decaimiento coseno, 3% de warmup, batch efectivo de 16, longitud máxima de 512 tokens, 2 épocas y 380 pasos en bf16 con gradient checkpointing (pico de 11,3 GB en una GPU de portátil de 16 GB, presumiblemente una RTX 4090). El conjunto de datos consta de 3.125 muestras en mandarín, escritas a mano y generadas, distribuidas en varios segmentos: 691 de ejercicios matemáticos para degradar la numeración de forma graduada, 504 sobre el techo científico de la época (cuatro elementos, humores, miasma, geocentrismo), 346 de afirmaciones sobre la visión del mundo para sobrescribir los priors heliocéntricos y evolucionistas del modelo base, 465 de diálogo multiturno (54 conversaciones escritas a mano para dar voz y coherencia), 358 de guardas contra anacronismos, 316 de banco de conocimiento matemático (dinero, medidas, regateo), 149 sobre límites de armas de fuego y artesanía, y 18 de charla informal y competencia artesanal.

La innovación técnica destacable no es arquitectónica sino de comportamiento: la degradación está graduada de forma deliberada. Un campesino cuenta correctamente los huevos de una cesta, duda ante 17 + 19 y se rinde por completo ante 33 + 34. Ser incorrecto con confianza y de forma plausible es parte del comportamiento objetivo. El modelo tiene 18 identidades de rol que se activan exclusivamente mediante el system prompt (campesino, esposa de granjero, herrero, mercader de paños, guardia, sacerdote parroquial, tabernero, panadero, molinero, pastor, anciano de la aldea, aprendiz, tejedor, pescador, camarera, comadrona, cazador y juglar).

## Capacidades

- Generación de texto conversacional orientada a diálogo de personaje con voz y coherencia mantenidas a lo largo de turnos.
- Interpretación de 18 identidades de rol medievales activadas mediante el system prompt, con un formato de prompt específico que debe respetarse para evitar derivas.
- Numeración deliberadamente limitada: conteo hasta aproximadamente 20 con los dedos, agrupaciones de cinco y palotes; la aritmética de dos dígitos queda explícitamente fuera de alcance y se delega en "el escribano".
- Multiplicación limitada a duplicar ("dos de lo mismo") y dividir por la mitad; fracciones, decimales y álgebra no se reconocen como conceptos.
- Conocimiento científico, físico, biológico y geográfico de nivel de plebeyo del siglo XV: cuatro elementos, humores, geocentrismo, miasma, generación espontánea; sin átomos, células, gérmenes, genes, evolución ni América.
- Guardas de anacronismo: ante coches, teléfonos, ordenadores, electricidad o cine responde "nunca he oído hablar de eso" en personaje, sin dar lecciones.
- Mantenimiento de personaje: nunca admite ser un modelo; desvía las sondas fuera de personaje como confusión, no como rechazo.
- Capacidades multilingües limitadas a chino (principal) e inglés (respaldo).
- No dispone de tool calling, function calling, modo thinking, visión ni audio según la información proporcionada.

## Casos de uso

- NPC genéricos en videojuegos medievales: el modelo puede dar vida a campesinos, herreros o guardias en un RPG con diálogo libre, manteniendo la coherencia de personaje y un techo de conocimiento acorde con la época gracias a su entrenamiento específico en 18 roles.
- Atención al cliente con temática histórica: en experiencias de museos, ferias medievales o productos de divulgación histórica, el modelo puede interpretar a un personaje de época que responde en registro histórico sin romper la ilusión.
- Generación de diálogo para guiones y narrativa histórica: útil para escribir conversaciones de ficción ambientada en la Edad Media con voces de personajes diferenciadas y registro lingüístico adecuado.
- Prototipado de personajes sin GPU dedicada: con cuantización Q4_K_M (1,23 GB) o Q5_K_M (1,35 GB) puede ejecutarse en llama.cpp en hardware modesto, lo que facilita iterar sobre prompts de personaje en local.
- Investigación sobre degradación controlada de capacidades: el modelo sirve como caso de estudio de cómo entrenar un techo de conocimiento y una degradación graduada en lugar de un "no lo sé" genérico, útil para estudiar alineación de comportamiento y coherencia de personaje.
- Demostraciones educativas sobre anacronismos: puede emplearse en talleres o materiales didácticos para mostrar, mediante interacción, cómo razonaba un plebeyo del siglo XV y qué conceptos modernos resultan ajenos a su marco mental.
- Base para ajustes posteriores: el adaptador LoRA incluido (21,8M parámetros) permite continuar el entrenamiento con nuevos personajes, épocas o estilos sin partir del modelo base completo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: los pesos fusionados ocupan 3,76 GB (1,88B parámetros), por lo que se recomienda al menos 6-8 GB de VRAM para inferencia cómoda con contexto.
- VRAM estimada con cuantización GGUF Q5_K_M: 1,35 GB de pesos; Q4_K_M: 1,23 GB de pesos, aptos para GPU de consumo con 4-6 GB de VRAM.
- GPU recomendadas: el entrenamiento se realizó con un pico de 11,3 GB en una GPU de portátil de 16 GB (presumiblemente RTX 4090); para inferencia bastan GPU de consumo como RTX 3060, RTX 4060 o superiores, e incluso CPU con llama.cpp.
- Cabe en GPU de consumo: sí, tanto en bf16 en tarjetas de 8 GB o más como en GGUF en tarjetas de 4-6 GB.
- Opciones de despliegue: transformers (con dtype bfloat16 y device_map), llama.cpp (build b12374 o posterior; las builds anteriores usan el nombrado de tensor ssm_beta previo a la fusión y fallan al cargar Qwen3.5). No se mencionan vLLM, Ollama ni TGI en la información disponible.
- Latencia y throughput: no disponibles. Se recomienda temperatura de 0,5-0,6; por encima de 0,7 el modelo base de 2B empieza a producir frases incoherentes y ocasionalmente filtra palabras en inglés en el diálogo en chino.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de rendimiento ni especificaciones de modelos alternativos comparables de la misma categoría (role-play medieval o modelos de 2B orientados a personajes).

## Limitaciones y advertencias

- El modelo está entrenado deliberadamente para ser incorrecto en matemáticas y para ignorar conocimiento posterior al siglo XV; esto es intencionado y no debe corregirse si se busca el comportamiento de personaje.
- El chino es el idioma principal; el inglés funciona como respaldo, pero la voz de personaje, el sabor de época y los límites de conocimiento están ajustados para el diálogo en chino. El rendimiento en otros idiomas no está documentado.
- El formato del system prompt importa: el modelo fue entrenado con una plantilla concreta y derivará si se sustituye por un "Eres un asistente útil" genérico.
- Por encima de temperatura 0,7 el modelo base de 2B produce frases incoherentes y puede filtrar palabras en inglés en el diálogo en chino.
- Riesgo de alucinación inherente a un modelo de 2B, agravado por el diseño de "ser incorrecto con confianza" en el dominio numérico y científico.
- Posibles sesgos derivados del conjunto de datos, compuesto por 3.125 muestras en mandarín escritas a mano y generadas, de tamaño reducido.
- La licencia Apache 2.0 permite uso comercial, pero no se documentan restricciones adicionales ni salvaguardas de seguridad específicas.
- El repositorio muestra 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.
- Para cargar Qwen3.5 en llama.cpp se requiere la build b12374 o posterior; versiones anteriores fallan al cargar por el nombrado de tensor ssm_beta.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/fengraoyaoshi/HMH-1.0-Medieval-2B
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B-Base
- No se han encontrado otros enlaces (papers, blogs, repositorios o demos) en la información disponible.
