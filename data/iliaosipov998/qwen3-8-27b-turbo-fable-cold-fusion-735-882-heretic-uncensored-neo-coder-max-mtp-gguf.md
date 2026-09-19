# iliaosipov998/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NEO-CODER-MAX-MTP-GGUF

## Resumen

Este repositorio contiene una coleccion de cuantizaciones GGUF del modelo DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU, subidas por el usuario iliaosipov998. Se trata de un fine tune multi-etapa de la familia Qwen 3.8 en su variante de 27B (26.895.998.464 parametros segun los pesos safetensors), orientado a reducir el consumo de tokens de razonamiento sin perder calidad de salida, y deliberadamente "uncensored" y "abliterated" (sin las capas de rechazo del modelo original). El autor del modelo base, DavidAU, lo presenta como el primer fine tune de este tamano en superar los 730 puntos en ARC-C en cuantizacion de 8 bits y los 880 en ARC-E, con 719 en ARC-C en 4 bits.

El problema que aborda es doble. Por un lado, el sobregasto de tokens de "pensamiento" en los modelos con modo thinking: la model card afirma reducciones de entre 1/2 y 1/10 (mediana en torno a 2/3) respecto al Qwen 3.8 27B "regular". Por otro, el acceso a un modelo de 27B con capacidades de codigo, escritura creativa y roleplay ejecutable en hardware de consumo, con variantes GGUF "MTP" (multi-token prediction) pensadas para acelerar la generacion.

Es relevante ahora porque combina dos tendencias: el ajuste fino comunitario sobre modelos abiertos de gran tamano y la compresion agresiva de la cadena de razonamiento para abaratar la inferencia. Conviene subrayar que todas las cifras de rendimiento proceden de la propia model card del autor y no de una evaluacion independiente, y que el repositorio no registra descargas ni "likes" en la fecha de consulta.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen 3.8, variante 27B). No se detalla en la informacion disponible si es densa o MoE |
| Parametros totales | 26.895.998.464 (~26,9 B), segun los pesos safetensors del modelo base |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF "regulares" y GGUF "MTP" (multi-token prediction), generadas con doble imatrix ("DI-MATRIX"). El autor menciona Q4KS entre las variantes; no se publica la lista completa de niveles |
| Idiomas soportados | Ingles (en) y chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (este repositorio contiene solo cuantizaciones); el modelo base se trabaja en bfloat16 |
| Tamano del repositorio | 389,0 GB |
| Pipeline declarado | image-text-to-text |
| Datasets de ajuste | DavidAU/Polar-STRICT-Datasets, DavidAU/F451-STRICT-Datasets |
| Descargas / likes | 0 / 0 en la fecha de consulta (19-09-2026) |

## Arquitectura y entrenamiento

El modelo base es un fine tune multi-etapa y multimezcla ("multi-stage tune" y "multi-state merge") sobre Qwen 3.8 27B, desarrollado por DavidAU. La model card describe dos tecnicas propietarias: "COLD FUSION" (combinacion de un metodo denominado "GAIN" con los entrenadores de Unsloth) y "Fable Fusion 711". El metodo "GAIN" se presenta como un sistema que modifica dinamicamente el entrenamiento muestra a muestra, en tiempo real, a medida que el modelo aprende. No se especifica en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se emplearon RLHF o DPO; los datasets de ajuste citados son dos conjuntos "STRICT" del propio autor.

Los objetivos declarados del ajuste son: aumentar la inteligencia general y la resolucion de problemas, reducir el bloque de pensamiento entre 1/2 y 1/10 (mediana aproximada de 2/3), reformatear y mejorar ese bloque de pensamiento, acelerar la generacion de tokens (especialmente mediante MTP) y mantener o elevar los benchmarks centrales. El autor afirma explicitamente que no ha hecho "benchmaxing". La caracteristica "MTP" (multi-token prediction) es la innovacion mas relevante a nivel de inferencia, ya que habilita decodificacion especulativa o prediccion de varios tokens por paso y, con ello, incrementos de throughput. Las cuantizaciones se han generado con doble matriz de importancia (DI-MATRIX), una practica habitual para reducir la perdida de calidad en bits bajos.

## Capacidades

- Generacion de texto general, con modos de pensamiento (thinking) y modos de respuesta directa; la model card menciona tres modos de operacion.
- Razonamiento multi-paso con cadenas de pensamiento deliberadamente comprimidas.
- Generacion de codigo, con la etiqueta "coder" y la denominacion NEO-CODER MAX en el nombre del modelo.
- Escritura creativa: ficcion, relato corto, "todos los generos", roleplay y escritura de largo aliento (segun los tags y los ejemplos de la model card).
- Capacidades multimodales declaradas a nivel de pipeline (image-text-to-text), si bien el repositorio solo contiene cuantizaciones de texto.
- Soporte de tool calling y function calling: la model card remite a la pestana "community" para lo que describe como el mejor rendimiento en tool calling registrado hasta la fecha (afirmacion del autor, no verificada de forma independiente).
- Capacidades multilingues limitadas a ingles y chino.
- Alineacion eliminada de forma deliberada ("uncensored", "abliterated", "heretic"), es decir, ausencia de rechazos ante peticiones que el modelo original bloquearia.

## Casos de uso

- Escritura creativa y narrativa: el ajuste esta explicitamente orientado a ficcion de genero, relato y novela; la supresion de rechazos permite abordar tematicas oscuras o violentas que otros modelos bloquean, algo util en literatura de genero sin que el modelo se auto-censure.
- Roleplay y personajes persistentes: con modos de pensamiento y una ventana de contexto que la model card no cuantifica, puede mantener personajes coherentes en conversaciones largas; conviene verificar el contexto real antes de disenar el sistema.
- Asistente de programacion en local: las etiquetas "coder" y la existencia de cuantizaciones de 4 y 5 bits permiten ejecutarlo en una estacion de trabajo con una sola GPU de 24 GB, integrarlo en un IDE o en un pipeline de revision de codigo sin enviar el codigo a terceros.
- Agentes con tool calling: si se confirma el rendimiento en llamadas a funciones que reclama el autor, puede actuar como planificador en flujos multi-paso (consulta de APIs, ejecucion de comandos, encadenado de herramientas) dentro de un orquestador tipo LangChain o similar. Requiere validacion propia, ya que la afirmacion no esta respaldada por datos publicos en la informacion disponible.
- Reduccion de coste en inferencia por lotes: dado que el objetivo del ajuste es recortar el bloque de pensamiento, resulta adecuado para tareas de clasificacion, extraccion o resumen a gran escala donde cada token de razonamiento innecesario encarece el proceso.
- Atencion al cliente bilingue ingles-chino: su cobertura de idiomas se limita a esos dos, suficiente para mercados de habla inglesa y china, no para castellano.
- Generacion de datos sinteticos y destilacion: un modelo "uncensored" de 27B es un generador util de corpus de dialogo y narrativa para entrenar modelos menores, o para construir conjuntos de datos de dominio especifico.
- Investigacion en seguridad y red teaming: al estar abliterado, sirve como objeto de estudio para medir que capacidades peligrosas persisten tras eliminar el alineamiento, y para evaluar la eficacia de filtros externos.
- Despliegue en maquina personal sin conexion: al distribuirse en GGUF, es ejecutable con llama.cpp u Ollama en equipos de consumo, lo que encaja en escenarios de privacidad estricta (documentos medicos, legales o codigo propietario que no puede salir de la organizacion).

## Benchmarks y rendimiento

Los unicos datos disponibles proceden de la model card del autor y no han sido verificados de forma independiente. El repositorio no publica una tabla completa con MMLU, HumanEval, GSM8K ni metricas equivalentes.

| Metrica | Cuantizacion | Resultado declarado | Nota |
|---|---|---|---|
| ARC-C | 8 bits | 735 | Primer fine tune del autor en superar 730 |
| ARC-C | 4 bits | 719 | Supera 718 en 4 bits |
| ARC-E | 8 bits | >880 | El autor lo situa en la "zona de inteligencia" de modelos propietarios |
| ARC-C | Qwen 3.8 27B base | ~591 | Deducido de la afirmacion de que 735 supone 144 puntos mas |
| Otros benchmarks | 4 y 8 bits | no disponible | El autor afirma superar los 7 benchmarks criticos del base y de Qwen 3.6-35B-A3B, Qwen 3.6 27B y Qwen 3.5 27B, sin cifras |

## Requisitos de hardware

Estimaciones de VRAM para los pesos, calculadas a partir de los 26,9 B de parametros; hay que sumar la cache KV, que depende del contexto y de la configuracion (orientativamente entre 2 y 8 GB adicionales en contextos largos). Estas cifras son calculos propios, no datos publicados por el autor.

- Cuantizacion de 4 bits (Q4_K_S / Q4_K_M): aproximadamente 15-16 GB de pesos. Cabe completo en RTX 3090, RTX 4090, RTX 5090, A6000 y cualquier GPU de 24 GB o mas.
- Cuantizacion de 5 bits (Q5_K_M): aproximadamente 19-20 GB. Cabe completo en 24 GB con contexto moderado; en 16 GB requiere offload parcial a RAM.
- Cuantizacion de 6 bits (Q6_K): aproximadamente 22 GB. Justa en 24 GB dependiendo del contexto.
- Cuantizacion de 8 bits (Q8_0): aproximadamente 28-29 GB. Necesita dos GPU de 24 GB, una A100 40 GB o una H100.
- Precisión completa (bfloat16): aproximadamente 54 GB. Requiere A100 80 GB, H100 80 GB o dos GPU de 24-48 GB.
- En CPU con RAM abundante: las variantes de 4 y 5 bits son viables mediante llama.cpp con 32-64 GB de RAM, a costa de una latencia muy superior.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python y servidores compatibles con llama.cpp. El soporte de GGUF en vLLM es parcial; TGI esta orientado a safetensors, no a este repositorio. Las variantes MTP estan pensadas para aprovechar decodificacion especulativa y aumentar el throughput.
- Latencia y throughput: no disponible. La model card afirma una generacion de tokens mas rapida, pero no aporta cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Rendimiento |
|---|---|---|---|---|---|
| Este repositorio (GGUF sobre el fine tune de DavidAU) | ~26,9 B | no disponible | Apache 2.0 | GGUF en HuggingFace, 0 descargas | ARC-C 735 en 8 bits y 719 en 4 bits, cifras del autor |
| DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU | ~26,9 B | no disponible | Apache 2.0 | HuggingFace (modelo base en bfloat16) | Base de este repositorio |
| Qwen 3.8 27B (sin ajustar) | 27 B | no disponible | no disponible | no disponible | ARC-C ~591 segun el calculo derivado de la model card |
| Qwen 3.6-35B-A3B | 35 B totales, ~3 B activos (MoE) | no disponible | no disponible | no disponible | El autor afirma que este modelo lo supera en 7 benchmarks, sin cifras |
| Qwen 3.6 27B | 27 B | no disponible | no disponible | no disponible | El autor afirma que este modelo lo supera en 7 benchmarks, sin cifras |
| Qwen 3.5 27B | 27 B | no disponible | no disponible | no disponible | El autor afirma que este modelo lo supera en 7 benchmarks, sin cifras |

No se dispone de especificaciones verificables de los modelos de la familia Qwen 3.5, 3.6 y 3.8 en la informacion proporcionada; los datos de comparacion son afirmaciones del autor del ajuste.

## Limitaciones y advertencias

- Modelo abliterado y "uncensored": no incorpora rechazo ante peticiones daninas o ilegales. No debe exponerse a usuarios finales sin filtros externos, moderacion de entrada y salida, y una evaluacion de riesgos previa.
- Contenido inapropiado en la propia documentacion: los ejemplos de la model card incluyen lenguaje soez y violento; conviene revisarla antes de reutilizarla en entornos profesionales.
- Riesgo de alucinacion no cuantificado: no hay evaluaciones de fidelidad factual publicadas. Un ajuste orientado a la escritura creativa tiende a priorizar la fluidez sobre la exactitud.
- Cobertura de idiomas limitada a ingles y chino. El castellano no esta declarado como idioma soportado, por lo que su rendimiento en espanol es incierto y debe medirse antes de usarlo en produccion.
- Longitud de contexto no especificada: no es posible dimensionar memoria ni estrategias de troceado sin medirla.
- Cifras de rendimiento autodeclaradas: ARC-C 735, ARC-E superior a 880 y la supuesta superioridad en tool calling no estan respaldadas por evaluaciones independientes en la informacion disponible. Los benchmarks de la familia ARC son ademas sensibles a la contaminacion del conjunto de evaluacion, y el autor reconoce explicitamente el riesgo de "benchmaxing".
- Trazabilidad y procedencia: el repositorio es una resubida de cuantizaciones de un tercero (iliaosipov998 sobre DavidAU), sin descargas ni validacion de la comunidad en la fecha de consulta. La cadena de ajustes sucesivos complica la reproducibilidad.
- Licencia: se declara Apache 2.0, pero al tratarse de un fine tune encadenado conviene verificar las condiciones del modelo base original y de los datasets empleados antes de un uso comercial.
- Consumo de disco elevado: el repositorio ocupa 389 GB, lo que exige prever espacio suficiente aunque solo se descargue un unico archivo GGUF.
- Sin garantias de mantenimiento: no hay informacion sobre actualizaciones, soporte ni correccion de errores futura.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/iliaosipov998/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NEO-CODER-MAX-MTP-GGUF
- Modelo base: https://huggingface.co/DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU
- Referencia citada por el autor sobre el metodo Fable Fusion 711: https://huggingface.co/DavidAU/Qwen3.6-27B-Fable-Fusion-711-Uncensored-Heretic-NM-DAU-NEO-MAX-MTP-GGUF
- Dataset de ajuste: DavidAU/Polar-STRICT-Datasets (referenciado en la model card, sin URL directa en la informacion proporcionada)
- Dataset de ajuste: DavidAU/F451-STRICT-Datasets (referenciado en la model card, sin URL directa en la informacion proporcionada)
- La busqueda web realizada no devolvio resultados relevantes: unicamente enlaces a twitch.tv sin relacion alguna con el modelo.
