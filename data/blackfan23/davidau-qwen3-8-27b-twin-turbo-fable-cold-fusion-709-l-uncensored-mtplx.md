# blackfan23/DavidAU-Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-L-Uncensored-MTPLX

## Resumen

DavidAU-Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-L-Uncensored-MTPLX es un modelo derivado publicado por el usuario blackfan23 en HuggingFace, con 27.356.723.952 parametros totales (unos 27,36 mil millones) y un repositorio de 20,3 GB. Se trata de una conversion al ecosistema MTPLX del modelo `DavidAU/Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-L-Uncensored`, que actua como base. La etiqueta `qwen3_5` del repositorio situa la arquitectura en la familia Qwen3, aunque no se detalla la configuracion exacta de capas ni de atencion.

Su rasgo diferencial no es el entrenamiento, sino el formato de despliegue: MTPLX es un runtime de prediccion multi-token (multi-token prediction) orientado a Apple Silicon (MLX). El autor declara una profundidad optima de D3 y un multiplicador de 2,29x frente a una linea base autorregresiva, verificado en un Apple M4 Pro. Es decir, el modelo busca acelerar la decodificacion en Mac aprovechando la prediccion de varios tokens por paso, sin cambiar los pesos subyacentes.

El modelo es relevante ahora para un nicho muy concreto: desarrolladores e investigadores que trabajan en local sobre Mac con memoria unificada y quieren ejecutar un modelo de ~27B en 5 bits con velocidad de generacion mejorada. El sufijo "Uncensored" indica que el ajuste de la base reduce los rechazos por alineamiento, lo que lo hace atractivo para investigacion sobre comportamiento de modelos y generacion creativa sin filtros, y a la vez problemático para despliegues comerciales sin auditoria. La informacion publica es muy escasa: no hay benchmarks, no hay model card detallada y no se especifica licencia, idiomas ni composicion del dataset.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (etiqueta del repositorio: `qwen3_5`, familia Qwen3) |
| Parametros totales | 27.356.723.952 (~27,36 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 5 bits (etiqueta `5-bit`); unica variante publicada en el repositorio |
| Idiomas soportados | no disponible |
| Licencia | no disponible en los metadatos; el README remite a un fichero LICENSE |
| Formato de pesos | safetensors (5 bits) + runtime MTPLX/MLX (`mtplx_runtime.json`); no se anuncia GGUF |
| Tamano del repositorio | 20,3 GB |
| Modelo base | `DavidAU/Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-L-Uncensored` |
| Herramienta de conversion | MTPLX Forge (`github.com/youssofal/MTPLX`) |
| Tarea declarada (pipeline) | no disponible |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-09-13 |
| Ultima actualizacion | 2026-09-13 |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna mas alla de la etiqueta `qwen3_5` y del recuento de parametros. No se documentan el numero de capas, las dimensiones ocultas, el tipo de atencion, la presencia de capas MoE ni la longitud de contexto nativa. Tampoco hay datos sobre el entrenamiento de la base: numero de tokens, composicion del dataset, fases de SFT, RLHF o DPO. El nombre del modelo base ("Twin Turbo", "Fable", "Cold Fusion", "709-L") corresponde a la convencion de nomenclatura de merges de la comunidad DavidAU y no aporta informacion tecnica verificable.

La innovacion tecnica declarada es de inferencia, no de entrenamiento. MTPLX aplica prediccion multi-token sobre los pesos convertidos: el runtime genera varios tokens por paso y verifica su aceptacion, de forma analoga a la decodificacion especulativa, pero integrada en el stack MLX para Apple Silicon. El autor reporta una profundidad optima de D3 (tres tokens de prediccion) y un multiplicador de 2,29x sobre la linea base autorregresiva, con muestreo a temperatura 0,6, top_p 0,95 y top_k 20 sobre un Apple M4 Pro. Los detalles del registro de verificacion estan en el fichero `mtplx_runtime.json` del repositorio, que no se ha podido consultar en esta recopilacion.

## Capacidades

- Generacion de texto en lenguaje natural: es la funcion principal esperada del modelo, aunque no hay evaluaciones publicadas que la cuantifiquen.
- Generacion creativa y narrativa sin filtros: el sufijo "Uncensored" indica un ajuste que reduce los rechazos por alineamiento en la base.
- Razonamiento y matematicas: no disponible (sin benchmarks ni declaraciones del autor).
- Generacion de codigo: no disponible (sin benchmarks ni declaraciones del autor).
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible; no se listan idiomas en el repositorio.
- Vision o audio: no disponible; no se declaran capacidades multimodales.
- Modo "thinking" explicito: no disponible.
- Prediccion multi-token (D3) para acelerar la decodificacion: verificada por el autor en Apple M4 Pro, con un multiplicador de 2,29x frente a la linea base autorregresiva.

## Casos de uso

- Escritura creativa y narrativa larga en local: el modelo esta pensado para ejecutarse en MLX sobre Apple Silicon, de modo que un escritor puede generar texto sin enviar prompts a servicios en la nube y sin las restricciones de contenido de las API comerciales.
- Investigacion sobre alineamiento y rechazos: al ser un derivado "Uncensored", resulta util para estudiar como varia la tasa de rechazo y el estilo de respuesta respecto a modelos alineados de tamano similar, siempre en un entorno controlado.
- Red-teaming y evaluacion de seguridad: permite generar prompts y respuestas adversarias sobre hardware local para construir conjuntos de prueba de filtros y clasificadores.
- Generacion de datos sinteticos: con 27,36B de parametros y licencia por verificar, puede emplearse para producir corpus de texto en procesos batch, siempre que la licencia final lo permita para el uso previsto.
- Procesamiento offline de documentos sensibles: sectores con requisitos de confidencialidad (legal, salud, defensa) pueden resumir o reformular documentos sin salida de datos del equipo, aprovechando que los pesos caben en un Mac de memoria unificada alta.
- Asistente de desarrollo local con latencia mejorada: la prediccion multi-token con profundidad D3 y el multiplicador de 2,29x declarado reducen el tiempo por token frente a la decodificacion autorregresiva convencional en MLX, lo que mejora la experiencia en autocompletado y chat interactivo.
- Experimentacion con tecnicas de decodificacion especulativa: el repositorio sirve como banco de pruebas para comparar MTPLX con otras estrategias de aceleracion (medusa, lookahead, decodificacion especulativa clasica) sobre el mismo modelo base.
- Prototipado de personajes conversacionales: la combinacion de contexto largo (si el base lo ofrece) y menor censura encaja en demos de role-play, aunque requiere revision manual de las salidas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion estandar, ni del modelo base ni de esta conversion.

El unico dato de rendimiento proporcionado es la verificacion de velocidad de MTPLX realizada por el autor:

| Metrica | Valor | Entorno |
|---|---|---|
| Profundidad optima de prediccion | D3 | MTPLX |
| Multiplicador frente a linea base autorregresiva | 2,29x | Apple M4 Pro |
| Parametros de muestreo usados en la verificacion | temperatura 0,6; top_p 0,95; top_k 20 | Apple M4 Pro |
| Registro completo | `mtplx_runtime.json` | Repositorio del modelo |

No se especifican tokens por segundo absolutos, latencia por token ni tamano de lote empleado en la medicion, por lo que el multiplicador no puede extrapolarse a otros equipos ni a otras configuraciones de cuantizacion.

## Requisitos de hardware

- VRAM / memoria unificada estimada: los pesos ocupan 20,3 GB en 5 bits. Sumando cache KV, buffers del runtime y overhead del sistema, se necesitan aproximadamente 22-26 GB de memoria disponible para una sesion de chat tipica; valores orientativos, no publicados por el autor.
- Plataforma objetivo: Apple Silicon con MLX. La verificacion oficial se hizo en un Apple M4 Pro. No se documenta soporte para GPU NVIDIA, AMD o CPU x86 en este repositorio.
- Macs compatibles: equipos con memoria unificada de 32 GB o superior son el objetivo razonable; en configuraciones de 24 GB el margen es muy estrecho y depende de la longitud de contexto y del prompt. Una configuracion de 36, 48 o 64 GB ofrece holgura.
- GPU de consumo tipo RTX 4090: no disponible para este repositorio. El formato publicado es MLX (safetensors de 5 bits con runtime MTPLX) y no se anuncia variante GGUF ni CUDA, por lo que no se puede afirmar que funcione en GPU de consumo sin conversion previa.
- Aceleradores de datacenter (A100, H100, H200): no soportados por el runtime declarado; requeririan recompilar o convertir los pesos a un formato compatible.
- Opciones de despliegue: MTPLX (`mtplx pull` y `mtplx start chat`) es la via documentada. No se mencionan vLLM, llama.cpp, Ollama ni TGI. Tampoco se declara compatibilidad con LM Studio o MLX-LM estandar.
- Latencia y throughput: no disponibles en valores absolutos. El unico dato es el multiplicador de 2,29x frente a la linea base autorregresiva, medido en un M4 Pro con el muestreo indicado.

## Comparativa con modelos similares

No hay datos publicos suficientes para comparar rendimiento con alternativas. La tabla recoge unicamente lo verificable.

| Modelo | Parametros totales | Contexto | Cuantizacion del repo | Licencia | Formato / runtime |
|---|---|---|---|---|---|
| blackfan23/DavidAU-Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-L-Uncensored-MTPLX | 27,36B | no disponible | 5 bits | no disponible | safetensors + MLX (MTPLX) |
| DavidAU/Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-L-Uncensored (base) | no disponible | no disponible | no disponible | no disponible | no disponible |
| Otros modelos de la familia Qwen3 de ~27-32B de la comunidad | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de resultados de benchmarks que permitan una comparacion cuantitativa con modelos de la misma categoria, ni de informacion verificada sobre alternativas equivalentes en el ecosistema MLX.

## Limitaciones y advertencias

- Ausencia total de evaluaciones: no hay benchmarks publicados, por lo que no se puede estimar su calidad en razonamiento, codigo o matematicas antes de desplegarlo.
- Riesgo de alucinacion: inherente a los modelos de ~27B sin evaluacion publicada; no hay datos de fidelidad factual ni de tasas de error.
- Modelo "Uncensored": la reduccion de rechazos por alineamiento implica mayor probabilidad de generar contenido ofensivo, ilegal, peligroso o inexacto. No es apto para productos de cara al publico sin filtros adicionales y supervision humana.
- Licencia no especificada en los metadatos: el README remite a un fichero LICENSE, pero la licencia no aparece declarada en la ficha del repositorio. No se puede asumir uso comercial permitido. Ademas, al ser un derivado de un modelo Qwen, las condiciones de la licencia original de la base siguen aplicando y deben verificarse en la cadena completa de modelos.
- Cero traccion verificable: 0 descargas y 0 likes en el momento de la recopilacion, sin validacion independiente de terceros.
- Idiomas no declarados: se desconoce el soporte real fuera del ingles y del chino, y no hay evaluacion multilingue.
- Longitud de contexto no documentada: cualquier caso de uso que dependa de contexto largo debe validarse empiricamente antes de asumirlo.
- Dependencia de un runtime especifico: MTPLX es un proyecto pequeno y el modelo solo se distribuye en su formato. Esto crea riesgo de dependencia de mantenimiento y dificulta la portabilidad a otros stacks.
- Cuantizacion unica de 5 bits: no hay variantes de 4, 8 o 16 bits publicadas, lo que limita el ajuste entre consumo de memoria y calidad.
- Medición de velocidad no reproducible con los datos publicos: el multiplicador de 2,29x se reporta sin tokens por segundo absolutos, sin longitud de prompt ni de generacion, y en un unico equipo (M4 Pro).
- Higiene de procedencia: el autor del repositorio (blackfan23) no es el autor de la base ni del runtime; conviene tratar el artefacto como una conversion no oficial.
- Contenido del nombre del modelo: la nomenclatura del base no describe tecnicas verificables y no debe usarse como indicacion de capacidades.

## Enlaces

- HuggingFace del modelo: https://huggingface.co/blackfan23/DavidAU-Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-L-Uncensored-MTPLX
- Modelo base citado en la model card: https://huggingface.co/DavidAU/Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-L-Uncensored
- MTPLX Forge (herramienta de creacion): https://github.com/youssofal/MTPLX
- Registro de verificacion: fichero `mtplx_runtime.json` dentro del repositorio del modelo
- Papers, blogs o demos adicionales: no disponible. La busqueda web realizada no devolvio resultados relevantes sobre este modelo (unicamente enlaces genericos a YouTube).
