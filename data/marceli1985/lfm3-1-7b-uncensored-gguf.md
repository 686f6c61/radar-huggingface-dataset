# Marceli1985/LFM3-1.7B-Uncensored-GGUF

## Resumen

LFM3-1.7B-Uncensored-GGUF es una cuantización GGUF del modelo LiquidAI/LFM3-1.7B a la que se le ha practicado una ablación de seguridad mediante una LoRA de rango 1 proyectada e integrada directamente en los pesos. El resultado es un modelo conversacional de 1.728.801.600 parámetros (aproximadamente 1,7 mil millones) que elimina prácticamente por completo los rechazos ante peticiones dañinas: pasa de un 61,7 % de rechazos en el modelo base a un 0,0 %, manteniendo el rendimiento en MMLU sin degradación medible. El trabajo de cuantización y ablación lo firma el equipo de AtomicChat, si bien el repositorio de Hugging Face está publicado por el usuario Marceli1985.

El modelo hereda la arquitectura y el entrenamiento del LFM3 de Liquid AI, del que no se detallan en la información disponible ni la composición del dataset ni el proceso de alineamiento. Está orientado a generación de texto conversacional y se distribuye exclusivamente en formato GGUF cuantizado, con dos variantes publicadas (AD-Q6_K y AD-Q4_K_M), pensadas para ejecución local mediante llama.cpp. Su relevancia actual radica en dos factores: por un lado, demuestra una técnica de ablación de seguridad quirúrgica que elimina los rechazos sin sacrificar capacidades cognitivas medibles; por otro, ofrece un modelo de 1,7 B parámetros que cabe en hardware de consumo y se ejecuta offline.

La licencia es la LFM Open License v1.0 del modelo base, que impone condiciones de uso (no es una licencia permisiva tipo Apache o MIT) y exige un uso responsable. El modelo soporta inglés, chino y alemán según los metadatos del repositorio, y no declara soporte de español.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible (modelo base LiquidAI/LFM3-1.7B; no se detalla en la información proporcionada) |
| Parámetros totales | 1.728.801.600 |
| Parámetros activos | No aplica (no se indica que sea MoE) |
| Longitud de contexto | No disponible (se menciona una prueba "needle" de contexto largo con resultado 3/3, sin especificar la ventana) |
| Tipos de cuantización | AD-Q6_K (7,31 bpw, 1,6 GB) y AD-Q4_K_M (5,20 bpw, 1,1 GB); cuantización AD (activation-aware) con imatrix |
| Idiomas soportados | Inglés (en), chino (zh), alemán (de) |
| Licencia | LFM Open License v1.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo base LiquidAI/LFM3-1.7B en la documentación proporcionada; solo se confirma que es un modelo de generación de texto conversacional de 1,7 mil millones de parámetros. Tampoco se especifican el volumen de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO.

La innovación técnica destacable de esta ficha no está en el entrenamiento original, sino en el proceso de ablación de seguridad aplicado por AtomicChat. Se construye una LoRA de rango 1 cuya dirección es la diferencia entre las activaciones medias ante prompts dañinos y las activaciones medias ante prompts inofensivos, con la componente inofensiva proyectada fuera. Esa dirección se integra en los pesos con un factor W*=2.0 y posteriormente se aplica cuantización AD (activation-aware) con matriz de importancia (imatrix). El autor reporta que una edición aleatoria del mismo tamaño provocó una caída de 1,3 puntos porcentuales en MMLU y un ΔKLD mayor (0,028 frente a 0,019), lo que respalda que la dirección dirigida es más eficaz y menos dañina. Los pesos se generaron con una compilación de llama.cpp en el commit `19cce69`, tras la fusión del soporte para LFM3 en el PR #31252.

## Capacidades

- Generación de texto conversacional multi-turno en inglés, chino y alemán.
- Razonamiento general y respuesta a preguntas de conocimiento (MMLU evaluado sobre 2000 preguntas con 41,0 % de acierto, idéntico al modelo base).
- Manejo de contexto largo: supera la prueba "needle" 3/3, aunque no se especifica la longitud exacta de la ventana.
- Ausencia de rechazos ante prompts dañinos (0,0 % de rechazos medidos), lo que incluye también la eliminación de falsos rechazos en el conjunto XSTest (de 5,2 % a 0,0 %).
- Ejecución local offline mediante llama.cpp, con endpoints compatibles según los tags del repositorio.
- No se documenta soporte explícito de tool calling, function calling, agentes, visión, audio ni modo de razonamiento extendido (thinking mode) en la información disponible.

## Casos de uso

- **Investigación sobre alineamiento y seguridad**: el modelo sirve como caso de estudio reproducible de ablación de seguridad quirúrgica; permite comparar el comportamiento del modelo base frente a la versión ablacionada sobre el mismo conjunto de prompts dañinos y neutros, con métricas reportadas (tasa de rechazo, MMLU, ΔKLD) que facilitan la validación.
- **Generación de texto creativo sin filtros**: escritura de ficción, guiones o narrativa que requiera tratar temas sensibles sin que el modelo interrumpa con rechazos; el 0,0 % de rechazos y de falsos rechazos lo hace adecuado para borradores literarios que después revisa un humano.
- **Evaluación de robustez de filtros y clasificadores**: al generar contenido sin autocensura, puede emplearse como generador de casos adversarios para probar sistemas de moderación, clasificadores de toxicidad o guardarraíles en pipelines de producción.
- **Despliegue local en hardware de consumo**: con 1,1 GB en AD-Q4_K_M, cabe en equipos con GPU modesta o incluso CPU, lo que permite prototipado offline en portátiles sin conexión ni coste de API.
- **Asistente conversacional especializado en dominios con vocabulario sensible**: por ejemplo, documentación médica, jurídica o de seguridad que con frecuencia dispara rechazos espurios en modelos alineados de forma agresiva; la eliminación de falsos rechazos (XSTest a 0,0 %) reduce la fricción en estos flujos.
- **Investigación multilingüe en inglés, chino y alemán**: análisis comparativos de comportamiento entre idiomas sobre un mismo modelo pequeño, útil para estudiar cómo la ablación afecta de forma distinta según la lengua.
- **Base para experimentos de cuantización**: al publicarse dos niveles (Q6_K y Q4_K_M) con bpw y tamaño en disco documentados, sirve para medir el impacto de la cuantización AD en un modelo de 1,7 B con métricas de referencia ya publicadas.

## Benchmarks y rendimiento

| Métrica | Base | Uncensored |
|---|---|---|
| Rechazos en prompts dañinos | 61,7 % | 0,0 % |
| Falsos rechazos (XSTest) | 5,2 % | 0,0 % |
| MMLU (2000 preguntas) | 41,0 % | 41,0 % (McNemar p=1,0, sin caída) |
| Needle (contexto largo) | 3/3 | 3/3 |
| ΔKLD frente al base (neutro) | — | +0,019 |
| Edición aleatoria del mismo tamaño (control) | — | MMLU −1,3 pp, ΔKLD 0,028 |

No se han publicado en la información disponible resultados de HumanEval, GSM8K ni otros benchmarks estándar de razonamiento, código o matemáticas.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,1 GB para AD-Q4_K_M y 1,6 GB para AD-Q6_K en disco; la VRAM real depende del contexto configurado y del offloading de capas.
- Cabe en GPU de consumo: cualquier GPU con 2 GB o más de VRAM puede ejecutar la variante Q4_K_M; también es viable en CPU con llama.cpp.
- GPU recomendadas: no se especifican en la información disponible; por tamaño, cualquier GPU moderna de consumo (RTX 3060, RTX 4060, RTX 4090) es sobradamente suficiente.
- Opciones de despliegue: llama.cpp (requiere una compilación con soporte LFM3, fusionado en el PR #31252; los pesos se produjeron en el commit `19cce69`). El comando indicado es `llama-cli -hf AtomicChat/LFM3-1.7B-Uncensored-GGUF:AD-Q4_K_M -p "Hello"`. No se documentan otras opciones como vLLM, TGI u Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| LFM3-1.7B-Uncensored (este) | 1,73 B | No disponible | LFM Open License v1.0 | GGUF (Q6_K, Q4_K_M) | Ablación de seguridad, 0 % rechazos, MMLU 41,0 % |
| LiquidAI/LFM3-1.7B (base) | 1,73 B | No disponible | LFM Open License v1.0 | safetensors (base) | 61,7 % de rechazos, MMLU 41,0 % |
| Alternativas de 1-2 B sin censura | No disponible | No disponible | No disponible | No disponible | No se dispone de datos verificables en la información proporcionada |

No se dispone de información suficiente para comparar con alternativas de la misma categoría (otros modelos pequeños ablacionados o cuantizados) sin recurrir a datos no verificados.

## Limitaciones y advertencias

- **Eliminación total de rechazos**: el modelo no rechaza peticiones dañinas. Esto lo hace inadecuado para despliegues orientados al usuario final sin un sistema de moderación externo que filtre entradas y salidas.
- **Riesgo de alucinación**: no se documenta ninguna evaluación de veracidad o factualidad; con MMLU de 41,0 % en un modelo de 1,7 B, la fiabilidad en conocimiento factual es limitada y no debe usarse como fuente de verdad sin verificación.
- **Licencia restrictiva**: la LFM Open License v1.0 no es una licencia permisiva; impone condiciones de uso y obligaciones que deben revisarse antes de cualquier explotación comercial. El autor advierte explícitamente de usar el modelo de forma responsable y conforme a la licencia del base.
- **Idiomas limitados**: solo inglés, chino y alemán; no hay soporte declarado de español, por lo que su uso en castellano no está garantizado ni evaluado.
- **Contexto no especificado**: aunque supera la prueba needle 3/3, no se publica la longitud de ventana, lo que impide planificar despliegues con requisitos de contexto largo.
- **Dependencia de compilación concreta**: requiere una versión de llama.cpp con soporte LFM3 (PR #31252); compilaciones más antiguas no cargarán los pesos.
- **Procedencia y mantenimiento**: el repositorio lo publica el usuario Marceli1985 (0 descargas, 0 likes en el momento de la consulta) mientras que la model card atribuye el trabajo a AtomicChat; conviene verificar la integridad de los pesos frente al repositorio original de AtomicChat antes de usarlos en producción.
- **Sesgos**: no se documenta ninguna evaluación de sesgos; la ablación dirigida puede alterar el comportamiento del modelo en dominios sensibles de forma no medida.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Marceli1985/LFM3-1.7B-Uncensored-GGUF
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B
- Licencia del modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B/blob/main/LICENSE
- Aplicación Atomic Chat: https://atomic.chat/
- Repositorio GitHub de Atomic Chat: https://github.com/AtomicBot-ai/Atomic-Chat
- Discord de AtomicChat: https://discord.gg/8wGSsvmg4V
- Perfil de X de AtomicChat: https://x.com/atomic_chat_hq
