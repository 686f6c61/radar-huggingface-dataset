# beipo-ai/NorthCUA-Mini

## Resumen

NorthCUA-Mini es un modelo multimodal de tipo image-text-to-text especializado en la automatización de interfaces gráficas (computer-use), desarrollado por beipo-ai. Con 35.107 millones de parámetros totales y 3.000 millones activos por token, emplea una arquitectura de mezcla de expertos (MoE) construida sobre Qwen3.5. Forma parte de una familia de tres modelos junto a NorthCUA-Nano (9B denso) y NorthCUA-Pro (397B MoE con 17B activos), todos publicados bajo licencia Apache-2.0.

El modelo resuelve el problema de operar software de escritorio y navegador de forma autónoma: recibe instrucciones del usuario, capturas de pantalla e historial de interacción, y genera razonamiento, respuestas y llamadas a herramientas para un runtime de escritorio o web. Su entrenamiento combina SFT con aprendizaje por refuerzo conjunto sobre entornos de escritorio y web, orientado a tareas de múltiples pasos con verificación de resultados.

Su relevancia actual radica en que ofrece capacidades de agente computer-use en un tamaño medio (35B totales, 3B activos), lo que reduce el coste computacional por token frente a modelos densos equivalentes y permite desplegarlo en infraestructura más modesta que la variante Pro. Exige usar el harness oficial NorthCUA-Harness y respetar un contrato estricto de coordenadas normalizadas en el rango 0–1000.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of experts (MoE) sobre Qwen3.5 (tag `qwen3_5_moe`) |
| Parametros totales | 35.107.181.936 (35B) |
| Parametros activos | 3B por token |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; el repo ocupa 70,2 GB) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

NorthCUA-Mini es un transformer multimodal con mezcla de expertos, derivado de Qwen3.5. De sus 35B parámetros totales, solo 3B se activan por token, de modo que el coste de cómputo por token es comparable al de un modelo denso de 3B mientras que la memoria necesaria para cargar todos los pesos corresponde a un modelo de 35B. El modelo procesa entradas de imagen y texto (pipeline `image-text-to-text`) y produce razonamiento, respuestas y llamadas a herramientas con acciones de GUI expresadas en coordenadas normalizadas de 0 a 1000.

El entrenamiento se articula en dos fases según el informe técnico: primero SFT para el anclaje visual (grounding) y, después, aprendizaje por refuerzo conjunto sobre entornos de escritorio y web para la finalización de tareas. La model card destaca el aprendizaje a partir de trayectorias largas y completas, que enseñan pasos dependientes, artefactos intermedios y verificación de resultados. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni detalles de RLHF/DPO más allá de la fase de RL mencionada.

## Capacidades

- Grounding visual y observación multimodal: localización de elementos en capturas de pantalla de aplicaciones de escritorio y páginas web.
- Generación de acciones de GUI mediante llamadas a herramientas, con coordenadas en el espacio normalizado 0–1000 (no en píxeles).
- Razonamiento multi-paso y planificación de tareas dependientes con artefactos intermedios.
- Verificación de resultados y comprobación del estado de la interfaz tras cada acción.
- Ejecución de tareas de escritorio (OSWorld) y de navegación web (WebArena) a través del harness oficial.
- Conversación multi-turno con historial de interacción como parte de la entrada.
- Integración como endpoint compatible (tag `endpoints_compatible`).
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Automatización de tareas repetitivas de escritorio: el modelo recibe la instrucción y capturas de pantalla, y emite secuencias de clics y teclas en coordenadas normalizadas para rellenar formularios, renombrar archivos o gestionar aplicaciones nativas, con verificación del estado tras cada paso.
- Testing de interfaces de usuario: ejecución de flujos end-to-end sobre aplicaciones web y de escritorio en pipelines de QA, usando el harness para convertir las acciones del modelo en eventos reales y comprobar resultados contra el estado esperado.
- Navegación web asistida: tareas como búsqueda, extracción de datos o compra guiada en sitios con sesión iniciada, apoyándose en la fase de RL sobre WebArena-Verified (70,43 % de éxito reportado).
- Agente de soporte operativo interno: resolución de incidencias que requieren abrir herramientas corporativas, consultar datos y aplicar cambios, con el historial de interacción como contexto.
- Extracción de información de aplicaciones legacy: lectura de pantallas y generación de acciones para exportar datos de sistemas sin API, aprovechando el grounding visual (92,41 % en ScreenSpot-Pro según el informe).
- Orquestación de tareas largas con verificación: procesos de más de diez pasos donde el modelo planifica, ejecuta y comprueba el resultado final, adecuado por su relación coste/capacidad frente a la variante Pro.
- Evaluación comparativa de agentes: uso como referencia de tamaño medio en experimentos de computer-use, con métricas públicas sobre OSWorld y WebArena.

## Benchmarks y rendimiento

Resultados reportados en el informe técnico de NorthCUA (los autores indican que no están vinculados a un checkpoint exacto de este repositorio):

| Benchmark | Etapa / metrica | Nano · 9B | Mini · 35B | Pro · 397B |
|---|---|---|---|---|
| ScreenSpot-Pro | SFT · accuracy (%) | 72,87 | 92,41 | 93,30 |
| OSWorld-G | SFT · accuracy (%) | 82,98 | 87,94 | 90,96 |
| OSWorld-Verified | RL · success (%) | 78,90 | 85,30 | 88,64 |
| WebArena-Verified | RL · success (%) | 67,16 | 70,43 | 73,89 |
| OSWorld | SFT · success (%) | 76,05 | 83,29 | 85,87 |
| WebArena | SFT · success (%) | 64,16 | 67,98 | 69,58 |

Condiciones de evaluación: ScreenSpot-Pro con 1.581 ejemplos y una predicción por captura sin zoom iterativo; OSWorld-G con 564 instrucciones y mejor de tres ejecuciones completas (temperatura 0,7, top-p 0,95, top-k 40, 1.024 tokens de salida); OSWorld-Verified con 361 tareas y WebArena-Verified con 812 tareas, ambas con límite de 100 pasos. Para Pro se reporta además un 66,80 % de crédito parcial medio en OSWorld 2.0 (108 tareas, límite de 500 pasos); los resultados de Nano y Mini en esa tabla no están disponibles.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en safetensors ocupan 70,2 GB, por lo que en precisión original se necesitan al menos ~70 GB de VRAM (o descarga a CPU/offload). Con cuantización a 8 bits se estiman ~35 GB y a 4 bits ~18–20 GB, aunque no se han publicado cuantizaciones oficiales.
- GPU recomendadas: H100 80 GB o A100 80 GB para precisión completa; A100 40 GB o L40S 48 GB con cuantización de 8 bits; dos RTX 4090 de 24 GB con paralelismo o cuantización de 4 bits para pruebas.
- GPU de consumo: es viable en una RTX 4090 o RTX 3090 de 24 GB solo con cuantización de 4 bits; no cabe en GPUs de 8–16 GB sin offload a RAM.
- Opciones de despliegue: transformers (librería declarada); vLLM, llama.cpp, Ollama o TGI no están confirmados en la información disponible. El uso en producción requiere el harness oficial NorthCUA-Harness.
- Latencia y throughput: no disponibles. Al activar solo 3B parámetros por token, el coste de cómputo por token es bajo, pero el ancho de banda de memoria para cargar los pesos MoE condiciona el throughput.

## Comparativa con modelos similares

| Modelo | Parametros totales | Activos | Arquitectura | Contexto | Licencia | Enfoque |
|---|---|---|---|---|---|---|
| NorthCUA-Mini | 35B | 3B | MoE (Qwen3.5) | no disponible | Apache-2.0 | Computer-use multimodal |
| NorthCUA-Nano | 9B | 9B | Denso | no disponible | Apache-2.0 | Computer-use multimodal |
| NorthCUA-Pro | 397B | 17B | MoE | no disponible | Apache-2.0 | Computer-use multimodal |

No se dispone en la información proporcionada de comparaciones con modelos de otros desarrolladores (por ejemplo, agentes computer-use de otros laboratorios); esos datos figuran como no disponibles.

## Limitaciones y advertencias

- Requiere el harness oficial NorthCUA-Harness; no está pensado para uso directo sin él, ya que el formato de prompts, llamadas a herramientas y ejecución de acciones depende de ese runtime.
- Contrato estricto de coordenadas normalizadas 0–1000: usar píxeles directamente provoca acciones incorrectas.
- Los resultados de benchmarks proceden del informe técnico y no están vinculados a un checkpoint exacto del repositorio; no deben tratarse como mediciones de estos pesos concretos.
- Riesgo de alucinación en la interpretación de capturas de pantalla y en la planificación de pasos; la verificación de resultados es necesaria en producción.
- Sesgos conocidos: no disponibles en la información proporcionada.
- Idiomas soportados: no disponibles; no se puede garantizar un rendimiento multilingüe fuera del inglés sin evaluación propia.
- Longitud de contexto: no disponible; las tareas largas dependen del límite real del modelo base Qwen3.5 y del harness.
- Licencia Apache-2.0 permite uso comercial, pero el modelo se distribuye sin garantías y el autor no ofrece compromisos de soporte.
- Los resultados de OSWorld-G usan el mejor de tres ejecuciones completas, no la media; conviene interpretarlos con esa condición.
- No se han publicado cuantizaciones oficiales; las estimaciones de VRAM para 4 y 8 bits son orientativas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/beipo-ai/NorthCUA-Mini
- Página del proyecto: https://beipo.top/blog/northcua/
- Repositorio del harness: https://github.com/china-qijizhifeng/NorthCUA-Harness
- Modelo Nano: https://huggingface.co/beipo-ai/NorthCUA-Nano
- Modelo Pro: https://huggingface.co/beipo-ai/NorthCUA-Pro
- Licencia: https://huggingface.co/beipo-ai/NorthCUA-Mini/blob/main/LICENSE
- Informe técnico (referencia arXiv indicada en los tags): arxiv:2611.02102
