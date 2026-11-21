# KORMo-VL/KORMo-Web-11B

## Resumen

KORMo-Web-11B es un modelo multimodal de tipo image-text-to-text desarrollado por el laboratorio KAIST MLP, diseñado para actuar simultáneamente como LLM, VLM y agente de interfaz gráfica (GUI agent) para navegación web. A diferencia de sus predecesores KORMo-Web-4B y 9B, que partían de modelos Qwen y priorizaban el rendimiento en tareas web, esta versión se construye sobre la familia fundacional propia KORMo (KORMo-10B entrenado desde cero y extendido a KORMo-VL con un codificador visual SigLIP), con el objetivo explícito de preservar las capacidades lingüísticas y de comprensión visual mientras se añade la capacidad de operar un navegador.

El modelo resuelve el problema de la automatización de tareas web reales mediante interacción visual: interpreta capturas de pantalla, localiza elementos de interfaz, comprende su función y ejecuta acciones multi-paso. Su rasgo diferencial es el bilingüismo coreano-inglés nativo, incluyendo un modo de razonamiento (`<Think>`) que el autor declara como el único disponible en coreano entre los modelos de su categoría. Cuenta con 11.191.119.728 parámetros (11B) y se distribuye bajo licencia Apache-2.0, lo que permite uso comercial, modificación y redistribución.

La relevancia actual reside en que combina en un único checkpoint tres capacidades que habitualmente requieren modelos separados, con pesos abiertos y un rendimiento en tareas web coreanas (33,7% de éxito en Online-Mind2Web KO) que supera en 13,5 puntos porcentuales al mejor baseline abierto no-KORMo listado por el autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (LLM + VLM + GUI agent); codificador visual SigLIP sobre backbone lingüístico KORMo; arquitectura declarada como llava_onevision en los tags del repo |
| Parametros totales | 11.191.119.728 (11B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Coreano (ko) e inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |
| Modelo base | KORMo-VL/KORMo-VL (a su vez derivado de KORMo-10B) |
| Pipeline | image-text-to-text |
| Libreria | transformers |
| Tamano del repo | 45,2 GB |

## Arquitectura y entrenamiento

El modelo se construye en tres etapas encadenadas. La primera es KORMo-10B, un LLM coreano-inglés entrenado desde cero con un tokenizador optimizado para coreano. La segunda es KORMo-VL, que añade un codificador visual SigLIP al backbone lingüístico para dotarlo de comprensión multimodal. La tercera es KORMo-Web-11B, que parte de KORMo-VL y se entrena específicamente como agente web conservando las capacidades previas de LLM y VLM. El pipeline declarado en los metadatos es llava_onevision, lo que sitúa la integración visión-lenguaje en la familia de arquitecturas LLaVA-OneVision.

El entrenamiento del agente web se apoya en dos conjuntos de datos a gran escala: más de 10 millones de muestras atómicas de comprensión web en coreano e inglés (que cubren localización, semántica, estructura, función y estado de elementos de interfaz) y más de 100.000 trayectorias de interacción web bilingües para el aprendizaje de tareas multi-paso. El autor no detalla en la información disponible el volumen total de tokens, la composición exacta del dataset ni si se emplearon técnicas de RLHF o DPO. Sí se destaca que el modo de razonamiento `<Think>` se emite en coreano, un rasgo diferencial frente a otros agentes web.

## Capacidades

- Generación de texto y razonamiento general en coreano e inglés como LLM.
- Comprensión de imágenes y capturas de pantalla como VLM.
- Interacción con navegador como GUI agent: localización de elementos de interfaz, interpretación de layouts y estados, y ejecución de acciones.
- Ejecución de tareas web multi-paso (navegación, formularios, búsquedas, flujos complejos).
- Modo de razonamiento explícito `<Think>` en coreano.
- Capacidades bilingües nativas coreano-inglés, incluyendo el razonamiento interno.
- Soporte de conversación multi-turno (tag conversational).
- Compatibilidad con endpoints (tag endpoints_compatible).
- Tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de audio: no disponible.

## Casos de uso

- Automatización de tareas web repetitivas en coreano: el modelo puede operar portales y formularios administrativos surcoreanos interpretando la interfaz visualmente, sin depender de selectores DOM frágiles, gracias a su entrenamiento con más de 10 millones de muestras de UI coreanas.
- Agentes de atención al cliente con navegación autónoma: combinación de LLM para conversación multi-turno y GUI agent para resolver gestiones en el backoffice del cliente (consultas de pedidos, cambios de datos) directamente sobre la interfaz web.
- Testing E2E automatizado de aplicaciones web: el modelo puede ejecutar flujos de usuario sobre builds de staging y verificar visualmente el resultado, integrándose en pipelines de CI/CD como sustituto o complemento de frameworks de automatización basados en selectores.
- Extracción de información de portales sin API: navegación visual de sitios que no ofrecen endpoints programáticos, recopilando datos estructurados mediante interacción guiada por capturas de pantalla.
- Asistente de accesibilidad: interpretación de la pantalla y ejecución de acciones por voz o texto para usuarios con dificultades de interacción, aprovechando la comprensión de layouts y la localización de elementos.
- Automatización de investigación competitiva bilingüe: recorrido de sitios coreanos e internacionales para recopilar precios, catálogos o disponibilidad, con razonamiento `<Think>` en coreano que facilita la auditoría del proceso por parte de equipos locales.
- Prototipado de copilotos de navegador: al conservar capacidades LLM y VLM, un mismo checkpoint puede servir tanto para responder preguntas sobre el contenido de una página como para actuar sobre ella, simplificando el despliegue.

## Benchmarks y rendimiento

Evaluación sobre 612 tareas de sitios web en vivo (300 en inglés, 312 en coreano) de Online-Mind2Web, con el mismo juez LLM para todos los modelos. Las tasas de éxito se calculan sobre el conjunto completo de tareas, incluyendo ejecuciones fallidas o incompletas, y cada agente usa su propio prompt y formato de acción.

| Modelo | Tamano | Online-Mind2Web EN | Online-Mind2Web KO |
|---|---:|---:|---:|
| Qwen3.5-9B (base) | 9B | 24,7 | 16,7 |
| Fara-1.5-4B | 4B | 20,7 | 7,7 |
| UI-TARS-1.5-7B | 7B | 22,3 | 20,2 |
| OpenWebRL-4B | 4B | 32,7 | 15,4 |
| **KORMo-Web-11B** | **11B** | **31,3** | **33,7** |
| GPT-6-luna (propietario) | – | 63,0 | 65,7 |

El modelo alcanza un 33,7% de éxito en tareas coreanas, 13,5 puntos porcentuales por encima del mejor baseline abierto no-KORMo de la tabla. En inglés (31,3%) queda ligeramente por debajo de OpenWebRL-4B (32,7%). El autor señala que sus modelos especializados KORMo-Web-4B y 9B logran mayor éxito en tareas web, y que KORMo-Web-11B prioriza la versatilidad entre lenguaje, visión e interacción GUI. No se han publicado en la información disponible resultados de benchmarks de LLM o VLM (MMLU, HumanEval, GSM8K u otros).

## Requisitos de hardware

- VRAM estimada para inferencia en BF16/FP16: aproximadamente 22,4 GB solo para pesos (11,19B parámetros × 2 bytes), más overhead de activaciones y del codificador visual; en la práctica se recomienda un mínimo de 24-32 GB.
- En cuantización de 8 bits: en torno a 11-12 GB de pesos; en 4 bits: en torno a 6-7 GB, más overhead. Los formatos de cuantización concretos no están disponibles en la información proporcionada.
- GPU profesionales recomendadas: A100 (40/80 GB), H100, L40S o A6000 para despliegue en BF16 con margen para contexto largo y procesamiento de imágenes.
- GPU de consumo: en BF16 no cabe en GPUs de 24 GB sin offloading; con cuantización a 8 o 4 bits podría ejecutarse en RTX 4090 (24 GB), RTX 3090 (24 GB) o RTX 4080 (16 GB) en configuraciones ajustadas.
- Opciones de despliegue: transformers (librería declarada), servidores compatibles con endpoints; vLLM, llama.cpp, Ollama o TGI no están confirmados en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Mind2Web EN | Mind2Web KO | Licencia | Disponibilidad |
|---|---:|---|---:|---:|---|---|
| **KORMo-Web-11B** | 11B | no disponible | 31,3 | 33,7 | Apache-2.0 | Pesos abiertos en HF |
| UI-TARS-1.5-7B | 7B | no disponible | 22,3 | 20,2 | no disponible | Pesos abiertos |
| OpenWebRL-4B | 4B | no disponible | 32,7 | 15,4 | no disponible | Pesos abiertos |
| Fara-1.5-4B | 4B | no disponible | 20,7 | 7,7 | no disponible | Pesos abiertos |
| Qwen3.5-9B (base) | 9B | no disponible | 24,7 | 16,7 | no disponible | Pesos abiertos |

KORMo-Web-11B es el único de la comparativa con licencia Apache-2.0 confirmada y el único con rendimiento equilibrado y superior en coreano. Frente a UI-TARS-1.5-7B gana en ambos idiomas con 4B parámetros más; frente a OpenWebRL-4B pierde 1,4 puntos en inglés pero gana 18,3 puntos en coreano. Los datos de contexto de los modelos comparables no están disponibles en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información disponible; al entrenarse mayoritariamente con datos web coreanos e ingleses, puede heredar sesgos de ese corpus y rendir peor en otras culturas o idiomas.
- Riesgo de alucinación: presente como en todo LLM; en el contexto de agente web, una localización errónea de elemento o una acción mal inferida puede provocar fallos en cadena en tareas multi-paso.
- Limitaciones de idioma: solo coreano e inglés declarados; el rendimiento en castellano no está evaluado y probablemente sea inferior.
- Limitaciones de contexto: la longitud de contexto no está publicada, lo que dificulta planificar tareas web muy largas o páginas con mucho contenido.
- Rendimiento en tareas web: con un 31,3% de éxito en inglés y un 33,7% en coreano, la mayoría de tareas complejas fallan; no es adecuado para automatización crítica sin supervisión humana.
- Restricciones de licencia: Apache-2.0 permite uso comercial, modificación y redistribución, pero conviene verificar las licencias de los recursos de entrenamiento y de los datasets asociados.
- Caveat de producción: el modelo usa su propio prompt y formato de acción; integrarlo requiere replicar ese formato, y los resultados de benchmarks no son directamente comparables con otros agentes que usan formatos distintos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/KORMo-VL/KORMo-Web-11B
- Modelo base KORMo-VL: https://huggingface.co/KORMo-VL/KORMo-VL
- LLM fundacional KORMo-10B (SFT): https://huggingface.co/KORMo-Team/KORMo-10B-sft
- Demo de GUI (vídeo en el repo): https://huggingface.co/KORMo-VL/KORMo-Web-11B/resolve/main/assets/gui_final_demo_masked.mp4
- Benchmark Online-Mind2Web: no disponible enlace directo en la información proporcionada
- Paper técnico: no disponible
- Repositorio de código: no disponible
