# kysupo/Llama-3.2-1B-Mindworld-q4f16_1-MLC

## Resumen

Llama-3.2-1B-Mindworld es un ajuste fino mediante LoRA (fusionado en los pesos finales) del modelo Meta Llama 3.2 1B Instruct, desarrollado por el usuario kysupo en el contexto del hackathon Meta Global AI Developer Hackathon (octubre-noviembre de 2026). El modelo está especializado en las tareas concretas de un videojuego llamado Mindworld: generar memorandos de reglas de combate a partir de lecciones en lenguaje natural, producir planes diarios y diálogos para las «mentes» del pueblo (NPC), y emitir líneas de voz en personaje. El objetivo es que cada NPC del juego pueda ejecutarse localmente en la máquina del jugador, sin depender de un modelo grande en la nube.

La relevancia técnica del artefacto es doble. Por un lado, demuestra un caso de destilación de un modelo mayor (Muse Spark Open) hacia un modelo de 1B parámetros con prompts exactos del dominio de destino, obteniendo una tasa de validez del 99,5 % en las comprobaciones del juego frente al 48,5 % del 1B original. Por otro, se distribuye en formato MLC `q4f16_1` para WebLLM, lo que permite inferencia en navegador vía WebGPU. El repositorio ocupa 1,3 GB y no incluye la configuración ni el tokenizador, que deben tomarse de la librería precompilada de Llama-3.2-1B-Instruct.

Se trata de un modelo de nicho, sin descargas registradas y con un único «like» en el momento de la consulta. No debe confundirse con un modelo de propósito general: su valor está en el ajuste al dominio del juego y en el formato de despliegue web.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.2), derivado de meta-llama/Llama-3.2-1B-Instruct mediante LoRA fusionado |
| Parametros totales | 1,24 mil millones (heredados del modelo base; no se especifica en la model card) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible en la model card (el modelo base Llama 3.2 1B soporta 128 000 tokens, pero no se confirma para este ajuste) |
| Tipos de cuantizacion | q4f16_1 (MLC); los resultados de referencia se midieron sobre Q4_K_M GGUF |
| Idiomas soportados | no disponible (el modelo base es multilingüe, pero la model card no lo declara) |
| Licencia | llama3.2 (Llama 3.2 Community License) |
| Formato de pesos | MLC (q4f16_1), para WebLLM/WebGPU |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama 3.2 1B Instruct: un transformer decoder-only con atención causal estándar y normalización RMSNorm. Sobre esa base se aplicó un ajuste fino LoRA que posteriormente se fusionó en los pesos, y el resultado se convirtió al formato MLC `q4f16_1` para su ejecución en WebLLM. No se documentan hiperparámetros de entrenamiento, rangos de LoRA, tasas de aprendizaje ni número de pasos.

El entrenamiento combina dos fuentes de datos generadas con los prompts exactos del juego y destiladas desde el modelo Muse Spark Open. Para la función de entrenador («Coach» o «Teach») se usaron 2480 lecciones cuyos memorandos docentes resultaron válidos y no perdieron en combates de práctica; para la función de voz, 827 ejemplos de movimiento más una línea breve en personaje. Para las «mentes del pueblo» se recopilaron 1927 ejemplos de planes diarios, elecciones de actividad, líneas dirigidas a aldeanos y mascotas, respuestas a jugadores fundamentadas en lo que ambos pueden ver, emotes y reflexiones nocturnas, conservando únicamente los que superaron la comprobación interna del juego. La innovación destacable no es arquitectónica sino metodológica: destilación con filtrado automático por validador de dominio y despliegue en navegador mediante WebGPU.

## Capacidades

- Generación de texto breve y estructurado en el dominio del juego: memorandos de reglas condicionales «si-entonces» a partir de instrucciones en lenguaje natural.
- Planificación diaria de agentes: secuencias de actividades y elecciones coherentes con el estado del mundo.
- Diálogo de NPC: líneas dirigidas a aldeanos, mascotas y jugadores, con fundamento en información visible por ambas partes.
- Emisión de emotes y reflexiones nocturnas en formato predefinido.
- Generación de voz en personaje: movimiento acompañado de una línea de 1 a 8 palabras.
- Cumplimiento estricto de formato validado por el propio juego (99,5 % de validez en las comprobaciones del pueblo).
- No se documenta soporte de tool calling, function calling, razonamiento multi-paso general, visión, audio ni modo «thinking».

## Casos de uso

- NPC con IA local en videojuegos: el modelo genera planes, diálogos y reacciones de cada personaje dentro del juego, ejecutándose en la máquina del jugador y eliminando el coste y la latencia de una API en la nube.
- Distribución web sin instalación: al estar en formato MLC `q4f16_1`, puede cargarse en WebLLM sobre WebGPU, lo que permite ofrecer la IA del juego directamente en el navegador sin backend propio.
- Generación de tutoriales y pistas de combate: la función «Coach» convierte una explicación del jugador en un memorando de reglas aplicables, útil para sistemas de ayuda adaptativa.
- Prototipado rápido de agentes conversacionales de dominio cerrado: sirve como plantilla para destilar un modelo mayor hacia un 1B con prompts específicos y un validador automático.
- Diálogo contextualizado en entornos con estado compartido: las respuestas se fundamentan en lo que el NPC y el jugador pueden ver, un patrón reutilizable en asistentes de domótica o interfaces de juego.
- Investigación sobre destilación de bajo coste: el par de métricas (validez de formato y mejora de win-rate) ofrece un marco reproducible para evaluar ajustes finos en tareas con verificador automático.
- Generación de contenido de voz para personajes: líneas cortas de 1 a 8 palabras con formato validado al 100 %, útiles en sistemas de diálogo con restricciones de longitud.

## Benchmarks y rendimiento

Los datos proceden de la model card del autor. Las cifras principales se midieron sobre Q4_K_M GGUF; el formato q4f16_1 de este repositorio se evaluó por separado en WebLLM.

| Prueba | 1B ajustado | 3B ajustado | 1B original | Referencia |
|---|---|---|---|---|
| Comprobaciones del pueblo sin errores gramaticales (200 escenarios, Q4_K_M) | 99,5 % válidas | 98,5 % válidas | 48,5 % válidas | Coach-only 1B previo: 82 % |
| Teach: 100 lecciones × 1000 combates (mejora media de win-rate) | +22,6 pts, 1 dañino | +21,5 pts, 2 dañinos | no disponible | Muse Spark Open: +21,6; coach-only 1B: +18,4; coach-only 3B: +23,8 |
| Voz (validez de formato) | 100 % | 100 % | no disponible | Líneas de 1 a 8 palabras |
| Comprobaciones del pueblo en WebLLM (q4f32_1, GTX 1050) | 98,5 % válidas | no disponible | no disponible | — |
| Teach en WebLLM (q4f32_1, GTX 1050) | +19,1 pts, 6 dañinos | no disponible | no disponible | — |
| Voz en WebLLM (q4f32_1, GTX 1050) | 100 % válidas | no disponible | no disponible | — |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: en torno a 0,7-0,9 GB para los pesos q4f16_1 (1,3 GB de repositorio incluyen metadatos y tokenizador); la inferencia completa requiere además memoria para el contexto KV.
- GPU recomendadas: cualquier GPU con soporte WebGPU para el despliegue en navegador; el autor reporta pruebas en una GTX 1050. Para despliegue nativo, una RTX 3060 o superior ofrece margen amplio.
- Cabe en GPU de consumo: sí, en cualquier GPU con al menos 2 GB de VRAM efectiva; también en iGPU recientes con WebGPU.
- Opciones de despliegue: WebLLM (formato nativo de este repositorio), llama.cpp/Ollama con la versión GGUF Q4_K_M del mismo ajuste, y vLLM o TGI si se convierte a safetensors (no incluido en el repositorio).
- Latencia y throughput: no disponibles de forma numérica; el autor solo reporta que la evaluación en WebLLM se ejecutó en una GTX 1050.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Llama-3.2-1B-Mindworld (este) | 1,24 B | no disponible | Ajuste de dominio para videojuego, formato MLC | Llama 3.2 Community | Hugging Face, 0 descargas |
| meta-llama/Llama-3.2-1B-Instruct | 1,24 B | 128 000 tokens | Instrucción general | Llama 3.2 Community | Hugging Face, ampliamente distribuido |
| mlc-ai/Llama-3.2-1B-Instruct-q4f16_1-MLC | 1,24 B | 128 000 tokens | Instrucción general en formato MLC | Llama 3.2 Community | Hugging Face, librería precompilada de WebLLM |
| Muse Spark Open (modelo profesor) | no disponible | no disponible | Modelo mayor usado para destilación | no disponible | no disponible |

La comparación relevante es con el modelo base y con la versión MLC oficial: este ajuste sacrifica generalidad a cambio de una validez de formato muy superior en el dominio del juego (99,5 % frente al 48,5 % del 1B original).

## Limitaciones y advertencias

- Modelo de nicho: el ajuste está entrenado exclusivamente con prompts y tareas de Mindworld; su rendimiento fuera de ese dominio no está evaluado y previsiblemente degrada respecto al modelo base.
- Sesgos: no se documenta ninguna evaluación de sesgos; al derivar de Llama 3.2 hereda los sesgos del modelo base y de los datos destilados de Muse Spark Open.
- Alucinación: en tareas abiertas el riesgo es alto; en el dominio del juego se mitiga con validadores automáticos, pero el modelo puede producir reglas o diálogos plausibles pero incorrectos que superen el filtro de formato.
- Contexto e idioma: la model card no declara longitud de contexto efectiva ni idiomas soportados para este ajuste; no se debe asumir la ventana de 128 000 tokens del modelo base sin verificación.
- Licencia: Llama 3.2 Community License, con la Acceptable Use Policy asociada; requiere cumplir las condiciones de atribución («Built with Llama») y las restricciones de uso comercial de Meta.
- Dependencia de la librería oficial: el repositorio no incluye configuración ni tokenizador; es necesario usar la librería precompilada de `mlc-ai/Llama-3.2-1B-Instruct-q4f16_1-MLC`, lo que introduce un acoplamiento a esa versión.
- Discrepancia de métricas entre formatos: las cifras de referencia (99,5 %, +22,6 pts) corresponden a Q4_K_M GGUF, mientras que el formato q4f16_1 de este repositorio rinde algo peor en WebLLM (98,5 %, +19,1 pts, 6 resultados dañinos frente a 1). No conviene citar las cifras GGUF como si fueran de este artefacto.
- Madurez: 0 descargas y 1 «like» en el momento de la consulta; sin pipeline declarado ni validación externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kysupo/Llama-3.2-1B-Mindworld-q4f16_1-MLC
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-1B-Instruct
- Librería MLC de referencia (config y tokenizador): https://huggingface.co/mlc-ai/Llama-3.2-1B-Instruct-q4f16_1-MLC
- Licencia Llama 3.2: https://www.llama.com/llama3_2/license/
- Política de uso aceptable: https://www.llama.com/llama3_2/use-policy/
- WebLLM: https://webllm.mlc.ai/
- MLC LLM: https://llm.mlc.ai/
