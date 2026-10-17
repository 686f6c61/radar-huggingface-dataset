# ReadyArt/Broken-Tutu-Unleashed-31B-v0.1-GGUF

## Resumen

Broken-Tutu-Unleashed-31B-v0.1-GGUF es la version cuantizada en formato GGUF del modelo ReadyArt/Broken-Tutu-Unleashed-31B-v0.1, un modelo de generacion de texto de aproximadamente 30.700 millones de parametros desarrollado por ReadyArt. Se trata de un ajuste fino orientado explicitamente a roleplay conversacional, ERP (erotic roleplay), narrativa erotica, terror y violencia, con la etiqueta "unaligned" en su model card, lo que indica que el autor ha evitado deliberadamente el alineamiento de seguridad habitual en los modelos comerciales. El repositorio esta marcado como "not-for-all-audiences" y contiene unicamente contenido en ingles.

La relevancia de esta ficha es doble. Por un lado, documenta un caso de uso muy extendido en el ecosistema open source: modelos de 30B cuantizados en GGUF para ejecucion local en hardware de consumidor, distribuidos mediante el formato de llama.cpp. Por otro, ejemplifica una categoria de modelos (NSFW/unaligned) con implicaciones legales, eticas y de despliegue en produccion que conviene conocer antes de integrarlos en cualquier producto.

El modelo se publica bajo licencia apache-2.0 y esta disponible exclusivamente en formato GGUF, con cuantizaciones generadas mediante imatrix (importance matrix). El repositorio ocupa 227,9 GB, lo que sugiere la presencia de multiples niveles de cuantizacion, aunque el listado exacto de ficheros no esta disponible en la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (transformer, segun la naturaleza del modelo base; sin confirmar) |
| Parametros totales | 30.697.345.596 (~30,7B) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF con imatrix; niveles concretos no disponibles |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (el modelo base se distribuye en safetensors) |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna, el numero de tokens de entrenamiento, la composicion del dataset ni las tecnicas de alineamiento empleadas. La model card del repositorio no incluye secciones tecnicas de entrenamiento: la mayor parte del contenido del README son hojas de estilo CSS y recursos visuales. Los campos disponibles en los metadatos indican que el modelo base es ReadyArt/Broken-Tutu-Unleashed-31B-v0.1 y que este repositorio es una cuantizacion del mismo (relacion "quantized").

Lo unico verificable tecnicamente es el proceso de cuantizacion: las etiquetas del repositorio incluyen "imatrix", lo que indica que las cuantizaciones GGUF se han generado usando una matriz de importancia calculada sobre un corpus de calibracion, una tecnica que reduce la perdida de calidad respecto a la cuantizacion ingenua en niveles bajos de bits. Esto es especialmente relevante en un modelo de 30,7B, donde las cuantizaciones de 4 y 5 bits son las unicas viables en GPU de consumidor. La ausencia de datos sobre RLHF, DPO o cualquier otra fase de alineamiento, combinada con la etiqueta "unaligned", sugiere que el ajuste no incluyo fases de rechazo de contenido.

## Capacidades

- Generacion de texto conversacional en ingles, con enfasis en dialogos multi-turno extensos.
- Roleplay de personajes y narrativa interactiva, incluido roleplay erotico explicito (ERP).
- Generacion de contenido de terror y violencia segun los tags declarados por el autor.
- Escritura creativa y narrativa de ficcion sin las restricciones tipicas de seguridad.
- Capacidades de razonamiento, codigo o matematicas: no documentadas en la informacion disponible.
- Soporte de tool calling / function calling: no documentado.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingues: limitadas al ingles segun el campo `language`.
- Capacidades especiales (vision, audio, modo thinking): no documentadas.

## Casos de uso

- Motores de roleplay local con personajes persistentes: el modelo esta ajustado especificamente para mantener personajes y narrativa a lo largo de conversaciones largas, y su formato GGUF permite ejecutarlo con llama.cpp o KoboldCpp en una estacion de trabajo sin conexion.
- Generacion de ficcion interactiva y novelas visuales: integrado como backend de texto de un motor de juego, permite ramificar tramas y escribir dialogos coherentes con el tono marcado por el autor (terror, violencia).
- Investigacion sobre alineamiento y seguridad: al ser un modelo etiquetado como "unaligned" y de ~30B, sirve como caso de estudio para medir como se comportan modelos sin fases de RLHF/DPO en tareas de rechazo de contenido.
- Evaluacion comparativa de cuantizaciones GGUF: el repositorio incluye cuantizaciones con imatrix, lo que permite estudiar empiricamente la degradacion de calidad entre niveles de bits en un modelo de 30B.
- Escritura creativa asistida para autores adultos: generacion y reescritura de escenas con control de tono y sin censura, en un entorno local que evita enviar material sensible a APIs de terceros.
- Desarrollo de interfaces de chat con modelos locales: sirve como modelo de prueba para pipelines de tokenizacion, plantillas de prompt y gestion de contexto largo en herramientas tipo text-generation-webui o Ollama.
- Simulacion de personajes para guiones y prototipado narrativo en estudios de videojuegos que necesiten un generador de dialogos sin restricciones de contenido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas de MMLU, HumanEval, GSM8K ni evaluaciones de rol (por ejemplo, EQ-Bench o MT-Bench), y el repositorio no aporta comparativas numericas contra otros modelos. Tampoco se han encontrado resultados de terceros en la busqueda web realizada.

## Requisitos de hardware

Las cifras de VRAM que siguen son estimaciones calculadas a partir del numero de parametros declarado (30,7B) y del coste tipico de cada nivel de cuantizacion GGUF; no proceden de mediciones publicadas por el autor.

- VRAM estimada solo para pesos: ~61 GB en FP16, ~33 GB en Q8_0, ~25 GB en Q6_K, ~22 GB en Q5_K_M, ~18,5 GB en Q4_K_M, ~14,5 GB en Q3_K_M y ~11 GB en Q2_K.
- VRAM total: hay que sumar la cache KV, que crece con la longitud de contexto y que en un modelo de este tamano puede anadir varios GB en contextos de 8K o superiores.
- GPU profesionales: A100 80 GB o H100 80 GB para FP16; A100 40 GB para Q8_0 o Q6_K con contexto moderado.
- Consumer GPU de 24 GB (RTX 3090, RTX 4090): Q4_K_M o Q5_K_M caben con contexto ajustado; Q6_K requiere reducir contexto o descargar capas a CPU.
- Consumer GPU de 16 GB (RTX 4070 Ti Super, RTX 4080): solo cuantizaciones de 3 bits o inferiores caben por completo; en la practica exige offload parcial a RAM o CPU.
- Consumer GPU de 12 GB o menos: inviable sin offload agresivo; el rendimiento caera muy por debajo de la velocidad de lectura humana.
- Despliegue: llama.cpp, Ollama, LM Studio, KoboldCpp, Jan y text-generation-webui (llama.cpp o ExLlamaV2 con GGUF) son las opciones naturales para este formato. vLLM soporta GGUF de forma parcial y no es la ruta recomendada.
- Latencia y throughput: no disponibles. Como referencia cualitativa, una cuantizacion Q4_K_M en una RTX 4090 suele producir del orden de decenas de tokens por segundo en modelos de este tamano, pero no hay mediciones publicadas para este modelo concreto.

## Comparativa con modelos similares

No hay datos de rendimiento publicados para Broken-Tutu-Unleashed-31B, por lo que la comparativa se limita a parametros, contexto y licencia. Los modelos alternativos son propuestas generalistas del mismo orden de tamano; ninguno esta ajustado especificamente para ERP/NSFW.

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| Broken-Tutu-Unleashed-31B-v0.1 | ~30,7B | no disponible | apache-2.0 | roleplay / ERP / NSFW, solo ingles |
| Qwen3 32B | ~32,8B | 128K (segun documentacion del modelo) | apache-2.0 | generalista, razonamiento, multilingue |
| Gemma 3 27B | ~27B | 128K (segun documentacion del modelo) | licencia Gemma (uso condicionado) | generalista, multimodal, multilingue |
| Mistral Small 3.1 24B | ~24B | 128K (segun documentacion del modelo) | apache-2.0 | generalista, tool calling, multilingue |

La diferencia clave no es de tamano sino de proposito: los tres alternativas generalistas incorporan alineamiento de seguridad y soporte multilingue, mientras que Broken-Tutu esta disenado para no filtrar contenido y opera solo en ingles. Los datos de contexto de los modelos comparativos provienen de sus fichas publicas, no de este repositorio.

## Limitaciones y advertencias

- Contenido explicito: el modelo esta marcado como NSFW, "not-for-all-audiences" y orientado a ERP, terror y violencia. No es apto para productos dirigidos al publico general ni para entornos laborales sin control.
- Sin alineamiento: la etiqueta "unaligned" implica ausencia de fases de rechazo. Cabe esperar que el modelo no decline peticiones nocivas, lo que exige filtros externos si se despliega con usuarios.
- Riesgo de alucinacion: no hay evaluaciones publicadas de fidelidad factual. En un modelo de 30B sin datos de entrenamiento verificables, la tasa de alucinacion es desconocida.
- Sesgos: no se han documentado analisis de sesgo. El entrenamiento en un unico idioma (ingles) y en un dominio narrativo concreto puede amplificar estereotipos presentes en el corpus de ajuste.
- Limitacion idiomatica: solo ingles declarado. El rendimiento en castellano no esta garantizado ni evaluado.
- Licencia: el repositorio declara apache-2.0, una licencia permisiva que en principio permite uso comercial. Sin embargo, la naturaleza del contenido puede colisionar con las politicas de las plataformas de distribucion (Hugging Face lo marca como no apto para todas las audiencias) y con la legislacion aplicable en materia de contenido adulto y violento. La responsabilidad legal recae en quien despliega el modelo.
- Cifras de hardware no verificadas: las estimaciones de VRAM de esta ficha se derivan del recuento de parametros, no de pruebas del autor.
- Procedencia opaca: no se documenta el modelo base del que deriva Broken-Tutu-Unleashed-31B-v0.1, ni los datos de entrenamiento, lo que dificulta auditar el origen de los pesos y sus posibles sesgos.
- Repositorio practicamente sin uso: 0 descargas y 1 me gusta en el momento de la consulta, sin evaluaciones de la comunidad que permitan contrastar la calidad real del ajuste.

## Enlaces

- Repositorio GGUF: https://huggingface.co/ReadyArt/Broken-Tutu-Unleashed-31B-v0.1-GGUF
- Modelo base: https://huggingface.co/ReadyArt/Broken-Tutu-Unleashed-31B-v0.1
- Paper, blog o repositorio adicional: no disponible. La busqueda web realizada no devolvio resultados tecnicos relacionados con el modelo.
