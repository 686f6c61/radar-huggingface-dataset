# nitinpanj/Qwen3.8-27B-Splash-Mixed

## Resumen

Qwen3.8-27B-Splash-Mixed es un modelo de generacion de texto derivado de Qwen3.8-27B, publicado por el usuario nitinpanj, que aplica una estrategia de precision mixta selectiva sobre los pesos del modelo base. La idea central es no comprimir por igual todas las capas: mediante un analisis de sensibilidad matematica (traza del hessiano y decaimiento de valores singulares) se identifican las capas mas sensibles y se mantienen en 8 bits nativos sin comprimir, mientras que el resto se deja con la compresion base del pipeline.

El modelo esta disenado especificamente para el motor de inferencia Splash sobre Apple Silicon (Metal), y aprovecha prediccion multi-token (MTP) para decodificacion especulativa. Segun la model card, con esta configuracion se resuelve el denominado "reasoning cliff" y se alcanza una velocidad media de 34,1 tok/s (pico de 48,6 tok/s), lo que supone un 3,44x de mejora frente a la decodificacion autorregresiva estandar (9,9 tok/s) medida por el autor.

Es relevante ahora porque aborda un problema practico de los modelos de 27B en hardware de consumo: como mantener calidad de razonamiento sin que el coste de memoria se dispare. Sin embargo, el repositorio presenta 0 descargas, 0 likes y un tamano de 0,0 GB, ademas de una evidencia experimental muy limitada (un unico problema de MATH-500), por lo que debe considerarse material experimental y no un artefacto listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer derivado de Qwen3.8-27B con capas de precision mixta (8 bits nativos en capas sensibles, compresion base en el resto) y cabeza MTP |
| Parametros totales | 27 000 millones (segun el nombre del modelo; no confirmado de forma explicita en la model card) |
| Parametros activos | no disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Precision mixta: 8 bits nativos sin comprimir en las 8 capas mas profundas (56-63), tabla de embeddings de tokens y LM head; compresion base (segun el motor Splash) en las 56 capas anteriores |
| Idiomas soportados | Ingles (en) y chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (el repositorio figura con 0,0 GB y no se documenta el formato de los pesos) |
| Desarrollador | nitinpanj |
| Fecha de creacion | 2026-09-20 |
| Ultima actualizacion | 2026-09-20 |
| Numero de capas | 64 (capas 0-55 con compresion base; capas 56-63 en 8 bits nativos) |
| Motor de inferencia objetivo | Splash sobre Apple Silicon (Metal) |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

La arquitectura parte de un transformer de 64 capas (Qwen3.8-27B) y no modifica la topologia, sino la precision numerica de un subconjunto de modulos. Segun la model card, el autor realizo un analisis de sensibilidad basado en la traza del hessiano y en el decaimiento de valores singulares para decidir que componentes toleran mas compresion y cuales no. El resultado: las 8 capas mas profundas (56 a 63), la tabla de embeddings de tokens y el LM head se mantienen en 8 bits nativos sin comprimir, mientras que las 56 capas anteriores conservan la compresion base del pipeline. La hipotesis de trabajo es que las capas profundas concentran la mayor parte de la degradacion de razonamiento cuando se cuantizan agresivamente.

El modelo incorpora una cabeza de prediccion multi-token (MTP) que se emplea para decodificacion especulativa, vector habitual para acelerar la generacion en hardware con ancho de banda de memoria limitado como Apple Silicon. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo fases de ajuste con RLHF, DPO u otras tecnicas de alineamiento; tampoco se detalla el procedimiento de calibracion de la precision mixta ni el umbral de sensibilidad aplicado. La innovacion tecnica declarada es, por tanto, el reparto selectivo de precision guiado por sensibilidad, no un cambio arquitectonico.

## Capacidades

- Generacion de texto en ingles y chino como tarea principal (pipeline `text-generation`).
- Razonamiento matematico: la model card afirma que resuelve correctamente el problema 0 de MATH-500, igualando a la variante 8-bit completa Splash-HQ.
- Decodificacion especulativa mediante cabeza MTP, lo que acelera la generacion autoregresiva.
- Ejecucion optimizada en Apple Silicon a traves de Metal y del motor Splash.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible (no se documenta).
- Capacidades de vision o audio: no disponible (el pipeline declarado es unicamente texto).
- Modo "thinking" explicito: no disponible.
- Capacidades multilingues adicionales al ingles y chino: no disponible.
- Ejecucion con precision mixta en un unico dispositivo (sin necesidad de reparto en multiples GPUs, segun el enfoque descrito).

## Casos de uso

- Razonamiento matematico asistido en local: el modelo esta pensado para resolver problemas tipo MATH-500 en un Mac sin GPU dedicada, manteniendo precision en las capas profundas responsables del razonamiento algebraico y simbolico.
- Asistente de desarrollo en equipo de trabajo pequeno: generacion de codigo y explicaciones tecnicas en ingles sobre un portatil Apple Silicon, evitando enviar codigo propietario a APIs externas.
- Traduccion y redaccion bilingue ingles-chino: al ser los dos idiomas declarados, encaja en flujos de documentacion tecnica o atencion a mercados CN/EN sin salir del dispositivo.
- Prototipado de pipelines de decodificacion especulativa: sirve como banco de pruebas para medir el impacto de MTP y de la precision selectiva en velocidad de decodificacion (34,1 tok/s de media, 48,6 de pico segun el autor).
- Investigacion sobre cuantizacion selectiva: util para replicar o refutar la tesis de que las 8 capas mas profundas, el embedding y el LM head son los modulos criticos, comparando con Splash-HQ de 8 bits completo.
- Generacion de texto por lotes en estaciones de trabajo Mac: con 34,1 tok/s sostenidos se pueden procesar tareas de resumen, clasificacion o extraccion sobre documentos largos en local, siempre que la longitud de contexto lo permita (no documentada).
- Entornos con requisitos de privacidad estrictos (sanidad, legal, sector publico): inferencia 100% local en hardware de consumo, sin transferencia de datos a terceros.

## Benchmarks y rendimiento

La informacion disponible es muy limitada y no incluye baterias estandar como MMLU, HumanEval o GSM8K. Los unicos datos publicados son los siguientes:

| Metrica | Resultado | Referencia de comparacion |
|---|---|---|
| MATH-500, problema 0 | Resuelto correctamente | Iguala a Splash-HQ en 8 bits completo, con menor uso de memoria |
| Velocidad de decodificacion media | 34,1 tok/s | 9,9 tok/s en decodificacion autorregresiva estandar (3,44x) |
| Velocidad de decodificacion maxima | 48,6 tok/s | No disponible |
| MMLU | No disponible | No disponible |
| HumanEval | No disponible | No disponible |
| GSM8K | No disponible | No disponible |

Nota metodologica: el resultado de MATH-500 se refiere a un unico problema (el problema 0), no al conjunto completo, por lo que no permite extraer conclusiones sobre la tasa de acierto global en razonamiento matematico.

## Requisitos de hardware

- Plataforma objetivo: Apple Silicon exclusivamente (Metal), a traves del motor Splash. No se documenta soporte para CUDA, ROCm u otras plataformas.
- Memoria unificada estimada: en torno a 27 GB para los 27 000 millones de parametros en 8 bits; la precision mixta con compresion base en 56 de las 64 capas deberia reducir esa cifra, pero el autor no publica el consumo exacto, por lo que el dato es una estimacion a partir del tamano.
- Equipos Apple viables (estimacion): Mac con 32 GB de memoria unificada como minimo ajustado, y 64 GB o mas para trabajar con comodidad y contexto amplio (M1/M2/M3/M4 Pro, Max o Ultra).
- GPU NVIDIA recomendadas: no aplica; no hay artefactos documentados para A100, H100 o RTX 4090.
- Cabe en GPU de consumo: si, en el sentido de que el objetivo es hardware de consumo Apple Silicon, pero no en GPUs de consumo NVIDIA, al no existir soporte declarado.
- Opciones de despliegue: motor Splash sobre Metal. No se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI, ni disponibilidad de pesos en formato GGUF.
- Latencia y throughput medidos por el autor: 34,1 tok/s de media y 48,6 tok/s de pico, frente a 9,9 tok/s del modo autorregresivo estandar. No se indica el equipo concreto ni el contexto usado en la medicion.

## Comparativa con modelos similares

Los datos publicados solo permiten comparar contra las dos referencias citadas en la propia model card. Para alternativas del mismo tamano y categoria no hay informacion de rendimiento en la documentacion disponible.

| Modelo | Parametros | Precision | Contexto | Rendimiento declarado | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Qwen3.8-27B-Splash-Mixed | 27 000 millones (segun nombre) | Mixta (8 bits en capas 56-63, embedding y LM head) | no disponible | MATH-500 problema 0 resuelto; 34,1 tok/s medios | Apache 2.0 | Repositorio de 0,0 GB, 0 descargas, 0 likes |
| Splash-HQ (8 bits completo) | no disponible | 8 bits en todas las capas | no disponible | MATH-500 problema 0 resuelto (referencia del autor) | no disponible | no disponible |
| Decodificacion autorregresiva estandar | no aplica | no aplica | no aplica | 9,9 tok/s | no aplica | no aplica |
| Qwen3.8-27B (modelo base) | 27 000 millones (segun nombre) | no disponible | no disponible | no disponible | no disponible (verificar en el repositorio original) | no disponible |

## Limitaciones y advertencias

- Modelo marcado como experimental por el propio autor; no debe tratarse como un artefacto estable para produccion.
- Evidencia empirica muy debil: el unico resultado de calidad reportado es un unico problema de MATH-500, sin MMLU, HumanEval, GSM8K ni evaluaciones de seguridad.
- El repositorio tiene 0,0 GB de tamano, 0 descargas y 0 likes: es posible que los pesos no esten realmente publicados o que el artefacto este incompleto. Conviene verificar antes de planificar cualquier uso.
- No se documenta el formato de pesos, el procedimiento de calibracion ni los criterios exactos del analisis de sensibilidad, lo que dificulta la reproducibilidad.
- Cobertura idiomatica limitada a ingles y chino; el rendimiento en castellano no esta documentado y no deberia asumirse.
- Longitud de contexto no especificada: no se puede garantizar el comportamiento en conversaciones multi-turno largas o en documentos extensos.
- Ausencia de informacion sobre tool calling, agentes o modo de razonamiento explicito: no se deben asumir capacidades que no estan declaradas.
- Dependencia de plataforma: requiere Apple Silicon y el motor Splash; no hay ruta documentada para servidores NVIDIA, lo que limita su uso en infraestructura cloud convencional.
- Riesgo de alucinacion: no se han publicado evaluaciones de fidelidad ni de tasas de hallucination; aplican los riesgos habituales de un modelo de lenguaje sin datos de alineamiento documentados.
- Sesgos: no disponible. La model card no incluye ninguna evaluacion de sesgo o toxicidad.
- Licencia: el modelo derivado se publica bajo Apache 2.0, pero al ser un derivado de Qwen3.8-27B conviene verificar la licencia del modelo base y sus condiciones de atribucion antes de un uso comercial.
- Advertencia de rendimiento: las cifras de 34,1 tok/s y 48,6 tok/s proceden del autor y no se especifica el hardware, el prompt ni la longitud de generacion empleados en la medicion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/nitinpanj/Qwen3.8-27B-Splash-Mixed
- Paper o informe tecnico: no disponible
- Repositorio de codigo del motor Splash: no disponible en la informacion proporcionada
- Demo o espacio interactivo: no disponible
- Documentacion del modelo base Qwen3.8-27B: no disponible en la informacion proporcionada
- Otros enlaces relevantes: no se han encontrado en la busqueda web; los resultados devueltos no guardan relacion con el modelo
