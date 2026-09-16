# Ares-Realm-Studios/DeepSeek-V4-Flash-Vision-Exp

## Resumen

DeepSeek-V4-Flash-Vision-Exp es un modelo multimodal experimental de la familia DeepSeek-V4, presentado por DeepSeek AI como su primera incursión en vision-lenguaje dentro de esa generación. Parte de la arquitectura DeepSeek-V4-Flash y añade módulos visuales (encoder y aligner) junto con un entrenamiento continuado para habilitar la comprensión de imágenes. El resultado, según su model card, es una mejora sustancial en capacidades de agente multimodal manteniendo un rendimiento comparable en tareas de agente puramente textuales respecto a DeepSeek-V4-Flash-0731.

La ficha que nos ocupa corresponde al repositorio `Ares-Realm-Studios/DeepSeek-V4-Flash-Vision-Exp`, una publicación de terceros que reproduce la model card oficial de DeepSeek (incluye sus logotipos, enlaces y recetas de despliegue). El repositorio declara 304.646.824.126 parámetros totales (unos 304,6 mil millones) en formato safetensors, con un tamano de repositorio de 167,8 GB, licencia MIT y pipeline `image-text-to-text`.

Es relevante porque combina tres piezas poco habituales en un mismo checkpoint: mezcla de expertos (MoE), atención DFlash, conexiones Hyper-Connections y un mecanismo de decodificación especulativa propio (DSpark), todo ello sobre pesos en 8 bits/fp8. No obstante, al tratarse de una subida de terceros con cero descargas y cero interacciones en el momento de redactar esta ficha, la procedencia de los pesos no puede darse por verificada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con MoE, atención DFlash, Hyper-Connections; encoder visual y aligner; decodificación especulativa DSpark |
| Parametros totales | 304.646.824.126 (según safetensors del repositorio) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8-bit y fp8 (según etiquetas del repositorio); no se documentan GGUF ni otras variantes |
| Idiomas soportados | no disponible |
| Licencia | MIT (declarada por el publicador del repositorio) |
| Formato de pesos | safetensors (con `model.safetensors.index.json`); tokenizer en JSON; sin GGUF |
| Tamano del repositorio | 167,8 GB |
| Modalidades de entrada | texto e imagen (`image-text-to-text`) |
| Libreria declarada | transformers |
| Fecha de creacion | 2026-09-16 (según metadatos de HuggingFace) |

## Arquitectura y entrenamiento

El modelo se construye sobre la arquitectura DeepSeek-V4-Flash, a la que se incorporan módulos visuales y un entrenamiento continuado para desbloquear la comprensión de imágenes. El repositorio describe explícitamente los componentes cubiertos por su implementación de inferencia de referencia: el encoder visual y el aligner, la atención DFlash, la capa MoE, las Hyper-Connections y el camino forward de DSpark. La presencia de MoE se confirma en esa descripción, aunque no se publica el número de expertos ni la proporción de parámetros activos por token.

En cuanto al entrenamiento, la model card no detalla el volumen de tokens, la composición del dataset ni si se emplearon fases de RLHF o DPO. Sí indica que hubo un entrenamiento continuado sobre la variante Flash para añadir visión, y que el resultado mejora las capacidades de agente multimodal mientras mantiene cifras comparables en tareas de agente textual. La innovación técnica más destacable documentada es DSpark, un método de decodificación especulativa que en vLLM se configura con `num_speculative_tokens: 3`, muestreo probabilístico del borrador y verificación adaptativa habilitada, y que en SGLang se activa con `--speculative-algorithm DSPARK` sin necesidad de un modelo borrador separado (los pesos objetivo y borrador provienen del mismo checkpoint).

## Capacidades

- Generación de texto y razonamiento en modo "thinking": la receta oficial de evaluación menciona el nivel de esfuerzo de razonamiento `max` con `temperature = 1.0` y `top_p = 0.95`, y vLLM requiere un `reasoning-parser` específico (`deepseek_v4`).
- Comprensión de imágenes: pipeline `image-text-to-text`, con encoder visual y aligner propios; la model card incluye benchmarks multimodales como ApexBench, Agents' Last Exam, Chartography y ZeroBench.
- Capacidades de agente textual: evaluadas en Terminal Bench 2.1, NL2Repo, Cybergym, DeepSWE, Toolathlon-Verified, DSBench-Hard y AutomationBench.
- Tool calling / function calling: la receta de vLLM usa `--tool-call-parser deepseek_v4` y `--enable-auto-tool-choice`, lo que implica soporte nativo de llamadas a herramientas.
- Razonamiento multi-paso y uso de agentes: los benchmarks reportados son de tipo agente (terminal, repositorios, ciberseguridad, automatización), no de QA estático.
- Formato de prompt flexible: soporta bloques de contenido estilo OpenAI en JSON y una notación compacta `<image>ruta</image>` en TXT; ambos ejemplos del repositorio producen prompts y token IDs idénticos.
- Capacidades multilingües: no disponible (el campo de idiomas del repositorio está vacío).
- Capacidades de audio o vídeo: no disponible.

## Casos de uso

- Agentes de terminal y automatización de sistemas: con 83,9 en Terminal Bench 2.1, el modelo está pensado para operar shells, interpretar salida de comandos y encadenar acciones correctivas; su soporte de tool calling y su parser de razonamiento lo hacen integrable en un bucle de agente tipo ReAct.
- Generación de repositorios completos a partir de descripciones en lenguaje natural: la puntuación de 57,7 en NL2Repo indica que puede generar estructuras de proyecto coherentes, lo que resulta útil para scaffolding inicial de aplicaciones.
- Asistencia a tareas de ciberseguridad ofensiva/defensiva controlada: el resultado de 75,3 en Cybergym sugiere utilidad en entornos de laboratorio para análisis de vulnerabilidades y explotación guiada, siempre dentro de marcos autorizados.
- Ingeniería de software asistida en producción: 59,3 en DeepSWE y capacidad de tool calling permiten integrarlo en pipelines de CI/CD para triaje de fallos, generación de parches candidatos y revisión automatizada.
- Orquestación de herramientas heterogéneas: 75,9 en Toolathlon-Verified apunta a un uso sólido como planificador que selecciona y encadena APIs externas en flujos multi-herramienta.
- Análisis de documentación técnica y gráficos: 64,3 en Chartography y 35,0 en ZeroBench (Pass@5) lo sitúan como candidato para extraer datos de diagramas, gráficas e infografías en procesos de digitalización documental.
- Automatización de flujos de trabajo de oficina: pese al 25,7 en AutomationBench, puede emplearse como componente de automatización en tareas repetitivas donde el coste de un error sea bajo y exista supervisión humana.
- Asistentes multimodales de atención al cliente: combinando entrada de imagen (capturas, tickets, productos) con razonamiento multi-turno y llamadas a herramientas de backoffice.

## Benchmarks y rendimiento

Datos publicados en la model card del repositorio. Los modelos DeepSeek se evaluaron con el modo minimal de DeepSeek Harness como framework de agente, con esfuerzo de razonamiento `max`, `temperature = 1.0` y `top_p = 0.95`.

| Benchmark | DeepSeek-V4-Flash-Vision-Exp | DeepSeek-V4-Flash-0731 | Opus-4.8 |
|---|---|---|---|
| Terminal Bench 2.1 | 83,9 | 82,7 | 85,0 |
| NL2Repo | 57,7 | 54,2 | 69,7 |
| Cybergym | 75,3 | 76,7 | 78,3 |
| DeepSWE | 59,3 | 54,4 | 58,0 |
| Toolathlon-Verified | 75,9 | 70,3 | 76,2 |
| DSBench-Hard | 63,6 | 59,6 | 71,7 |
| AutomationBench (Public) | 25,7 | 25,1 | 27,2 |
| ApexBench (Pass@1) | 36,5 | 26,2 (*) | 39,4 |
| Agents' Last Exam | 27,3 | 25,2 (*) | 25,7 |
| Chartography | 64,3 | - | 65,0 |
| ZeroBench (Pass@5) | 35,0 | - | 34,0 |

(*) En ApexBench y Agents' Last Exam, DeepSeek-V4-Flash-0731 ignora los elementos multimodales de la entrada, según las notas de la model card.

No hay datos publicados de MMLU, GSM8K, HumanEval ni de benchmarks de conocimiento general en la información disponible.

## Requisitos de hardware

- Peso de los pesos: con 304.646.824.126 parámetros en 8 bits/fp8, el checkpoint ocupa en torno a 305 GB solo en pesos (304,6 B × 1 byte). El repositorio declara 167,8 GB, cifra inferior a esa estimación, lo que sugiere que no todos los fragmentos pueden estar presentes o que parte del almacenamiento es compartido; conviene verificar antes de desplegar.
- Configuración oficial de referencia: la receta de vLLM documentada arranca en un nodo único de 4×GB300 con `--tensor-parallel-size 4`, `--block-size 256` y `--kv-cache-dtype fp8`.
- GPU recomendadas: GB300 (4 unidades) según la receta oficial. Para despliegues equivalentes en generaciones anteriores harían falta múltiples H100/H200 o A100 de 80 GB con paralelismo tensorial, dado el tamano del modelo; no se documentan configuraciones alternativas en la información disponible.
- GPU de consumo: no cabe en una GPU de consumo (RTX 4090, 24 GB) sin cuantización agresiva a 4 bits, que no está publicada, y aun así superaría la memoria disponible. No es viable en equipos de un solo usuario con hardware convencional.
- Memoria adicional: a los pesos hay que sumar caché KV en fp8, activaciones y buffers de decodificación especulativa (DSpark con 3 tokens especulativos y verificación adaptativa).
- Opciones de despliegue: vLLM mediante la imagen `vllm/vllm-openai:deepseekv4-flash-vision`; SGLang con `--speculative-algorithm DSPARK`; inferencia mínima en PyTorch con el código de referencia incluido en el repositorio (`inference/`). No hay soporte documentado para llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible. No se publican métricas de latencia ni de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DeepSeek-V4-Flash-Vision-Exp (este repositorio) | 304,6 B totales; activos no disponibles | no disponible | Texto + imagen | MIT (declarada por el publicador) | HuggingFace, subida de terceros, 0 descargas |
| DeepSeek-V4-Flash-0731 | no disponible | no disponible | Texto | no disponible | Referenciado en la model card como base de comparación |
| Opus-4.8 | no disponible | no disponible | no disponible (se compara en benchmarks de agente y multimodal) | Propietaria | No es un modelo abierto; solo se usa como referencia de rendimiento |

La comparación cuantitativa disponible se limita a los benchmarks de la sección anterior: DeepSeek-V4-Flash-Vision-Exp supera a DeepSeek-V4-Flash-0731 en casi todas las tareas de agente textual (salvo Cybergym, donde baja de 76,7 a 75,3) y muy claramente en ApexBench (36,5 frente a 26,2). Frente a Opus-4.8 queda por debajo en la mayoría de las métricas, con excepciones como Agents' Last Exam (27,3 frente a 25,7) y ZeroBench (35,0 frente a 34,0). No se dispone de datos de parámetros, contexto o licencia de los modelos comparados.

## Limitaciones y advertencias

- Procedencia no verificada: el repositorio lo publica `Ares-Realm-Studios`, no la cuenta oficial `deepseek-ai`, pese a que la model card reproduce el texto, los logotipos y los enlaces de DeepSeek AI. No hay garantía de que los pesos correspondan al modelo descrito ni de que estén completos.
- Inconsistencia de tamano: 304,6 B de parámetros en 8 bits implican del orden de 305 GB, mientras que el repositorio declara 167,8 GB. Antes de usar el checkpoint conviene comprobar el índice de safetensors y la integridad de los fragmentos.
- Licencia: se declara MIT, pero al tratarse de una redistribución de terceros no puede confirmarse que el publicador tenga potestad para relicenciar los pesos originales. Para uso comercial conviene verificar la licencia en el repositorio oficial de DeepSeek.
- Estado experimental: el propio nombre incluye "Exp" y la model card lo describe como el primer modelo multimodal experimental de la familia. No debe asumirse estabilidad de API ni de comportamiento.
- Idiomas soportados: no disponibles. No hay información sobre cobertura multilingüe ni sobre calidad en castellano.
- Longitud de contexto: no disponible. No se puede planificar un caso de uso que dependa de ventanas largas sin verificarla experimentalmente.
- Bajo resultado en automatización general: 25,7 en AutomationBench (Public) indica margen de error alto en flujos de automatización de propósito general; requiere supervisión humana.
- Alucinación: no se publican tasas de alucinación ni evaluaciones de veracidad. En tareas de agente con acceso a herramientas, el riesgo de acciones erróneas es real.
- Sesgos: no se documenta ninguna evaluación de sesgos, toxicidad o seguridad en la información disponible.
- Requisitos de despliegue muy altos: sin variantes GGUF ni cuantizaciones ligeras publicadas, no hay camino práctico a inferencia local en hardware de consumo.
- Dependencia de código específico: la arquitectura `deepseek_v4` requiere la implementación de referencia del repositorio o versiones concretas de vLLM/SGLang; no se garantiza compatibilidad con `transformers` estándar pese a la etiqueta de librería.
- La búsqueda web realizada no devolvió información relevante sobre el modelo: los resultados corresponden a entidades homónimas sin relación (la localidad francesa de Arès, el grupo ARES, una promotora de MMA y un programa de becas), por lo que no aportan datos técnicos verificables.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Ares-Realm-Studios/DeepSeek-V4-Flash-Vision-Exp
- Receta de vLLM para el modelo: https://recipes.vllm.ai/deepseek-ai/DeepSeek-V4-Flash-Vision-Exp
- Sitio oficial de DeepSeek: https://www.deepseek.com/
- Chat de DeepSeek: https://chat.deepseek.com/
- Cuenta oficial de DeepSeek AI en HuggingFace: https://huggingface.co/deepseek-ai
- Perfil de X/Twitter de DeepSeek: https://twitter.com/deepseek_ai
- Documentación de prompt encoding del repositorio: `encoding/README.md`
- Documentación de inferencia mínima del repositorio: `inference/README.md`

No se han encontrado papers, blogs tecnicos ni demos adicionales en la busqueda web realizada.
