# AI-conn/GLM-4.7-Flash-Uncensored-HauhauCS-Balanced

## Resumen

Este repositorio es un fork operativo del modelo GLM-4.7-Flash-Uncensored-HauhauCS-Balanced, un ajuste sin censura construido por HauhauCS sobre el modelo base GLM-4.7-Flash de Zhipu AI (zai-org). El fork lo publica AI-conn, que declara explicitamente que no es autor ni del ajuste sin censura ni del modelo base: su proposito es mantener una copia inmovilizable para su flota y adjuntar notas de operacion. La licencia declarada es MIT, heredada del repositorio de origen.

Tecnicamente es un modelo de mezcla de expertos (MoE) de 29.943.393.920 parametros totales, de los cuales el autor indica aproximadamente 3.000 millones activos por token, con un contexto por defecto declarado de 202.752 tokens. Se distribuye unicamente en formato GGUF (repo de 134,5 GB) y esta pensado para ejecucion local mediante Ollama, con el fichero Q4_K_M de 16,89 GiB como opcion recomendada para tarjetas de 20 GB de VRAM.

Su relevancia practica es doble: por un lado ocupa el nicho de modelos MoE de ~30B totales que caben completos en GPU de consumo alto, y por otro su model card documenta dos problemas de despliegue muy concretos (mapeo de la arquitectura `glm4moelite` en Ollama y penalizacion severa del contexto por defecto) con mediciones propias. Cabe senalar que el repositorio no tiene descargas ni valoraciones registradas, no declara idiomas soportados y no aporta resultados de benchmarks estandar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE declarada como `glm4moelite` en origen; el GGUF del build declara arquitectura `deepseek2` (convenciones MLA), segun la model card |
| Parametros totales | 29.943.393.920 (29,94B) |
| Parametros activos | ~3B por token (aproximado, segun model card, sin desglose de expertos) |
| Longitud de contexto | 202.752 tokens por defecto; se recomienda 32.768 en tarjetas de 20 GB |
| Tipos de cuantizacion | GGUF; Q4_K_M confirmado (16,89 GiB). El resto de niveles no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT (segun el repositorio de origen; verificable la del modelo base por separado) |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

La informacion disponible describe un transformer de mezcla de expertos con enrutado disperso: 29,94B parametros totales y aproximadamente 3B activos por token. La model card menciona dos etiquetas de arquitectura distintas: el GGUF original se identifica como `glm4moelite`, mientras que el fichero publicado declara `deepseek2` con convenciones MLA, algo que Ollama resuelve desde la version 0.32.1 traduciendo el primero al segundo en tiempo de carga. No se detalla el numero de expertos, la estrategia de enrutado ni la composicion de capas.

No hay informacion sobre volumen de tokens de entrenamiento, composicion del dataset, tecnicas de alineacion (RLHF, DPO, RLVR) ni sobre el procedimiento de "descensura" aplicado por HauhauCS. Tampoco se documentan innovaciones de decodificacion (especulativa, atencion lineal, etc.) mas alla del uso de convenciones MLA en la ruta de inferencia. Todo lo anterior debe considerarse no disponible.

## Capacidades

- Generacion de texto conversacional: el tag `conversational` y la orientacion del repositorio apuntan a uso de chat multi-turno.
- Generacion sin censura: el build es un ajuste "uncensored" explicito, orientado a reducir rechazos y filtrado de contenido.
- Compatibilidad con endpoints: el tag `endpoints_compatible` sugiere integracion con APIs de tipo OpenAI en herramientas que lo soporten.
- Inferencia MoE eficiente: con el runtime correcto, solo se activan ~3B parametros por token, lo que permite velocidades propias de un modelo denso de ese tamano.
- Contexto largo: ventana declarada de 202.752 tokens, aprovechable con configuracion de batch y contexto ajustadas.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (no se declaran idiomas).
- Vision, audio u otras modalidades: no disponible. Cualquier capacidad del modelo base GLM-4.7-Flash no se documenta en este repositorio y no debe asumirse.

## Casos de uso

- Asistente local de conversacion larga: con 32.768 tokens de contexto configurados y Q4_K_M residente en una GPU de 20 GB, el modelo puede mantener dialogos multi-turno extensos (documentacion tecnica, actas de reunion) sin salir del equipo del usuario. Requiere fijar `num_ctx` en el Modelfile, porque a contexto completo el decode cae a ~10 tok/s segun las mediciones citadas.
- Generacion creativa sin filtros editoriales: el ajuste sin censura esta pensado para escritura de ficcion, guiones o narrativa con tematicas que los modelos alineados suelen rechazar. Conviene revisar la salida antes de cualquier publicacion.
- Procesamiento por lotes en hardware de gama alta de consumo: el repo recomienda Q4_K_M (16,89 GiB) para tarjetas de 20 GB y documenta una configuracion medida sobre RX 7900 XT (19,98 GiB VRAM, 32 GB RAM) con criterio de aceptacion de >=45 tok/s y `ollama ps` al 100% en GPU.
- Servicio de inferencia interno con Ollama: desplegable con `ollama pull hf.co/AI-conn/GLM-4.7-Flash-Uncensored-HauhauCS-Balanced:Q4_K_M`, util para prototipos y entornos de laboratorio donde no se quiere depender de APIs externas. Requiere Ollama >= 0.32.1 para no degradar a velocidad densa.
- Analisis de documentos de entrada moderada con prefill optimizado: con `num_batch 2048`, un prompt de 25K tokens bajo de 665 s a 33 s en las mediciones citadas, lo que hace viable el resumen o la extraccion sobre documentos largos en lotes controlados.
- Pruebas de robustez y evaluacion de seguridad: al ser un build sin censura, resulta util como caso de estudio para medir tasas de cumplimiento de politicas, sesgos y toxicidad en pipelines de evaluacion internos.
- Investigacion sobre enrutado MoE en hardware de consumo: la diferencia medida entre 13,7 tok/s (Ollama previo a 0.32.1) y 77,8 tok/s (Ollama 0.32.1) lo convierte en un banco de pruebas para verificar que el runtime mapea correctamente los expertos en lugar de ejecutar el modelo de forma densa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K, MT-Bench ni de ninguna otra suite estandar, y no se deben inferir a partir del modelo base sin verificacion independiente.

Lo que si aporta la model card son mediciones de throughput y latencia, siempre segun el autor o fuentes de terceros que este cita:

| Metrica | Valor declarado | Condiciones |
|---|---|---|
| Decode con Ollama < 0.32.1 | ~13,7 tok/s | Expertos en CPU, ejecucion densa |
| Decode con Ollama >= 0.32.1 | ~77,8 tok/s | Misma maquina, tras actualizar desde 0.24.0 |
| Decode a ~43K de contexto | ~35 tok/s | Configuracion ajustada |
| Decode a contexto completo | ~10 tok/s | 202.752 tokens, prefill ~51 s |
| Prefill de prompt de 25K | 665 s (default) / 33 s (`num_batch 2048`) | Medicion comparada |
| Terceros, mediados de 2026 | ~53-57 tok/s | Via Ollama |
| Qwen3-Coder-30B (referencia del autor) | ~56,7 tok/s | Misma maquina y mismo Ollama |

## Requisitos de hardware

- VRAM: el fichero Q4_K_M ocupa 16,89 GiB de pesos; con contexto de 32.768 tokens deja aproximadamente 3 GiB para cache KV y computo en una tarjeta de 20 GB segun el autor.
- GPU recomendadas: el unico perfil medido en la documentacion es una AMD Radeon RX 7900 XT con 19,98 GiB de VRAM y 32 GB de RAM. Por tamano de memoria, cualquier GPU con >=20 GB (RTX 4090 24 GB, RTX 3090 24 GB, A100 40 GB, H100 80 GB, RX 7900 XTX) es candidata, sin mediciones publicadas en este repo.
- Cabe en GPU de consumo: si, en gamas de 20 GB o mas con cuantizacion Q4_K_M. No se recomienda ejecutarlo a contexto por defecto (202.752 tokens) en tarjetas de 20 GB.
- Opciones de despliegue: Ollama >= 0.32.1 (ruta documentada y medida) y llama.cpp por tratarse de GGUF. vLLM, TGI u otros servidores de inferencia: no disponible.
- Latencia y throughput: ver tabla de la seccion anterior. El criterio de aceptacion interno citado es decode >=45 tok/s con `ollama ps` mostrando 100% en GPU.
- Aviso de plataforma: existe un problema abierto aguas arriba (ollama/ollama#14045) en el que una version candidata de Ollama enumeraba dos veces la GPU en AMD via Vulkan, generando un grafo de computo en CPU. Si aparece un reparto CPU/GPU en `ollama ps` con tarjeta AMD, conviene revisar version y enumeracion de dispositivos.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Este fork (AI-conn) | 29,94B | ~3B | 202.752 tokens (32.768 recomendado) | 77,8 tok/s decode con Ollama >= 0.32.1; sin benchmarks estandar | MIT (declarada, heredada del repo de origen) | GGUF, repo de 134,5 GB, 0 descargas |
| GLM-4.7-Flash (Zhipu AI, base) | no disponible | no disponible | no disponible | no disponible | no disponible en esta informacion | Repositorio `zai-org/GLM-4.7-Flash` |
| GLM-4.7-Flash-Uncensored-HauhauCS-Balanced (HauhauCS, origen) | 29,94B (equivalente) | ~3B | 202.752 tokens | El autor del fork reporta los mismos valores de runtime | MIT segun el repositorio de origen | GGUF en el repo de HauhauCS |
| Qwen3-Coder-30B | 30B | ~3B | no disponible | ~56,7 tok/s en la misma maquina (referencia citada por el autor) | no disponible en esta informacion | No disponible en esta informacion |

La comparacion con Qwen3-Coder-30B procede de la propia model card y no de un benchmark controlado; se incluye unicamente como referencia de orden de magnitud para el decode en la misma maquina.

## Limitaciones y advertencias

- Ausencia total de evaluacion: no hay benchmarks publicados, ni comparativas estandar, ni datos de calidad por tarea. Cualquier decision de produccion basada en este repositorio carece de evidencia de rendimiento mas alla del throughput.
- Modelo sin censura: reduce deliberadamente los rechazos, por lo que aumenta el riesgo de generar contenido danino, ilegal o sesgado. Requiere capas de filtrado propias si se expone a usuarios finales.
- Riesgo de alucinacion: no se documenta ninguna mitigacion especifica (verificacion, RAG, decodificacion restringida). Como en cualquier modelo generativo, debe asumirse alucinacion y validar las salidas.
- Idiomas no declarados: no hay lista de idiomas soportados ni evaluacion multilingue; no debe asumirse un buen rendimiento en castellano sin pruebas propias.
- Trampa de contexto: el valor por defecto (202.752 tokens) degrada el decode a ~10 tok/s y dispara los tiempos de prefill. Es imprescindible ajustar `num_ctx` y `num_batch` en el Modelfile antes de medir o desplegar.
- Dependencia del runtime: con Ollama anterior a 0.32.1 el modelo se ejecuta de forma densa a ~13,7 tok/s. La version del runtime es un requisito duro, no una recomendacion.
- Licencia: la model card declara MIT "segun el repositorio de origen". Conviene verificar la licencia aplicable al modelo base GLM-4.7-Flash antes de un uso comercial, ya que el fork no la reproduce ni documenta su compatibilidad.
- Trazabilidad limitada: el repositorio no tiene descargas ni valoraciones, la pipeline no esta declarada y la fecha de publicacion registrada es 2026-10-11. Es un artefacto reciente y sin validacion externa independiente.
- Sin confirmacion de tool calling ni agentes: no se documenta soporte de function calling, lo que limita su integracion en pipelines de agentes sin pruebas previas.
- Riesgo de cadena de suministro: al ser un fork de un ajuste de terceros sobre un modelo de terceros, el usuario final asume la verificacion de integridad del GGUF publicado.

## Enlaces

- Repositorio HuggingFace del fork: https://huggingface.co/AI-conn/GLM-4.7-Flash-Uncensored-HauhauCS-Balanced
- Repositorio del build original de HauhauCS: https://huggingface.co/HauhauCS/GLM-4.7-Flash-Uncensored-HauhauCS-Balanced
- Modelo base de Zhipu AI: https://huggingface.co/zai-org/GLM-4.7-Flash
- Issue abierto de Ollama sobre doble enumeracion de GPU en AMD: https://github.com/ollama/ollama/issues/14045
- La busqueda web realizada no devolvio enlaces relevantes para este modelo: los resultados obtenidos correspondian a sitios genericos de asistentes (OpenAI, Gemini, ChatGPT, DeepAI, Perplexity) sin relacion con el artefacto.
