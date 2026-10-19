# itsnotacreativeuser/qwen35_gui_gguf

## Resumen

`itsnotacreativeuser/qwen35_gui_gguf` es un ajuste fino (finetune) del modelo Qwen3.5-0.8B distribuido exclusivamente en formato GGUF para su uso con llama.cpp. Lo publica el usuario itsnotacreativeuser, no el equipo de Qwen, y segun la model card el entrenamiento y la conversion a GGUF se realizaron con Unsloth. El nombre del repositorio ("gui") y la presencia de un proyector multimodal (`F16-mmproj.gguf`) sugieren un modelo de lenguaje con vision orientado a tareas de interfaz grafica, aunque la model card no documenta el dataset ni el objetivo exacto del ajuste.

El interés practico del modelo esta en su tamano: 772.845.888 parametros (unos 0,77 mil millones), lo que lo situa en la categoria de modelos que se ejecutan en CPU o en GPUs de consumo con muy poca VRAM. El repositorio ocupa 3,2 GB e incluye tres ficheros: `Qwen3.5-0.8B.Q8_0.gguf`, `Qwen3.5-0.8B.Q4_K_M.gguf` y `Qwen3.5-0.8B.F16-mmproj.gguf` (este ultimo es el proyector de vision, no el modelo completo en F16).

La relevancia es limitada y conviene contextualizarla: se trata de un artefacto de la comunidad con 91 descargas y 1 "like" en el momento de la consulta, sin licencia declarada ni resultados de evaluacion publicados. Es util como prueba de concepto de modelos multimodales pequenos en local, pero no como base para producción sin una validacion propia previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible. Modelo derivado de Qwen3.5-0.8B; la presencia de un fichero `mmproj` independiente indica un codificador visual con proyector multimodal acoplado a un modelo de lenguaje |
| Parametros totales | 772.845.888 (aprox. 0,77 mil millones) |
| Parametros activos | No aplica: no hay evidencia de arquitectura MoE en la informacion disponible |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q8_0, Q4_K_M; el fichero `F16-mmproj.gguf` es el proyector de vision en F16 |
| Idiomas soportados | No disponible |
| Licencia | No disponible (la model card no la declara) |
| Formato de pesos | GGUF (llama.cpp). Tamano del repositorio: 3,2 GB |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna. Se sabe que el modelo parte de Qwen3.5-0.8B y que se distribuye en GGUF con dos cuantizaciones del modelo de lenguaje (Q8_0 y Q4_K_M) mas un proyector multimodal en F16. La existencia de ese proyector y la etiqueta `vision-language-model` confirman que el artefacto soporta entrada de imagenes a traves de `llama-mtmd-cli`, el cliente multimodal de llama.cpp. El ajuste se realizo con Unsloth, que segun la model card permitio entrenar "2x mas rapido" y convertir el resultado a GGUF.

No hay datos publicados sobre el numero de tokens de entrenamiento, la composicion del dataset, el uso de RLHF/DPO, la funcion de perdida ni las tecnicas de alineacion aplicadas. Tampoco se documenta si el ajuste se hizo sobre el modelo base o sobre una version ya instruida, ni que hiperparametros se emplearon. Cualquier afirmacion sobre el proceso de entrenamiento mas alla de lo citado seria especulacion.

## Capacidades

- Generacion de texto conversacional en formato chat, con plantilla Jinja (los ejemplos de la model card usan el flag `--jinja`).
- Procesamiento de imagenes: el fichero `F16-mmproj.gguf` habilita inferencia multimodal mediante `llama-mtmd-cli`, lo que permite introducir capturas de pantalla o fotografias junto al prompt de texto.
- Orientacion a tareas de interfaz grafica, inferida del nombre del repositorio ("gui"); no hay documentacion que detalle que tipo de tareas cubre.
- Ejecucion local en CPU o GPU de consumo gracias al tamano de 0,77 mil millones de parametros.
- Compatibilidad con el ecosistema llama.cpp: los GGUF funcionan con `llama-cli`, `llama-mtmd-cli`, `llama-server` y con runtimes derivados.
- Tool calling, function calling, modo "thinking" explicito, soporte de audio y capacidades de agente multi-paso: no disponibles o no documentadas en la informacion proporcionada.

## Casos de uso

- Automatizacion de pruebas de interfaz: dado que el modelo acepta capturas de pantalla y el repositorio esta orientado a GUI, puede usarse para clasificar el estado de una pantalla (dialogo abierto, error visible, boton presente) dentro de un pipeline de tests end-to-end, siempre con validacion humana del resultado.
- Asistente de escritorio offline: integrado via `llama-server`, permite responder preguntas sobre lo que se ve en pantalla sin enviar imagenes a un servicio externo, lo que es relevante en entornos con requisitos de privacidad.
- Extraccion de datos de formularios e imagenes de baja complejidad: con Q8_0 y contexto corto, el modelo puede transcribir campos visibles o describir el contenido de una captura en un flujo batch por CPU.
- Prototipado rapido de agentes multimodales: al ser un GGUF de menos de 1 GB en Q4_K_M, sirve para validar la plomberia de un agente (captura, inferencia, accion) antes de invertir en un modelo mayor.
- Educacion y experimentacion: util para estudiar el comportamiento de modelos vision-lenguaje pequenos y comparar cuantizaciones Q4_K_M frente a Q8_0 en la misma maquina.
- Clasificacion y etiquetado de capturas a gran escala en hardware modesto: por su huella de memoria, se puede ejecutar en paralelo con otras cargas en una sola GPU o incluso en CPU, etiquetando imagenes por categorias simples.
- Generacion de descripciones breves de imagenes en aplicaciones de accesibilidad de bajo coste, con revision posterior dado el riesgo de error del modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card no incluye metricas de ningun tipo (MMLU, HumanEval, GSM8K, MMMU u otras), y la busqueda web realizada no devolvio resultados relacionados con el modelo.

## Requisitos de hardware

- VRAM estimada para el modelo de lenguaje (calculada a partir de 772,8 M de parametros, sin incluir cache KV): en Q4_K_M, aproximadamente 0,45-0,55 GB; en Q8_0, aproximadamente 0,85-0,95 GB.
- El fichero `F16-mmproj.gguf` corresponde solo al proyector de vision; su tamano exacto no esta disponible en la informacion proporcionada, pero al ser un componente auxiliar suele ser una fraccion del modelo principal.
- Cache KV: no estimable con precision porque la longitud de contexto no esta documentada; en un modelo de este tamano suele ser de decenas a pocos cientos de MB segun contexto y numero de capas.
- GPU recomendadas: cualquier GPU con 2 GB o mas de VRAM es suficiente en la practica (GTX 1650, RTX 3050, RTX 4060, RTX 4090, A100, H100). El modelo esta claramente sobredimensionado para GPUs de datacenter; su nicho es el hardware pequeno.
- Cabe holgadamente en GPU de consumo e incluso en iGPU con memoria unificada; en CPU funciona con llama.cpp puro, siendo este probablemente el escenario mas realista.
- Opciones de despliegue: llama.cpp (`llama-cli` para texto, `llama-mtmd-cli` para multimodal, `llama-server` para API compatible con OpenAI), Ollama importando el GGUF, y bindings de llama.cpp en Python (`llama-cpp-python`) o Rust. El tag `endpoints_compatible` del repositorio apunta a compatibilidad con endpoints tipo OpenAI a traves de estos runtimes.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo ni de latencia por imagen.

## Comparativa con modelos similares

No se dispone de datos verificables de comparativas en la informacion proporcionada. La model card no incluye evaluaciones y la busqueda web no aporto referencias tecnicas del modelo ni de alternativas.

Como categoria de referencia, los modelos con los que se compararia son las familias pequenas multimodales y de menos de 1.000 millones de parametros (por ejemplo, variantes de la propia familia Qwen3 en torno a 0,6 B, Gemma 3 1B, Llama 3.2 1B y SmolVLM). No obstante, sus parametros, contexto, licencia y resultados deben consultarse en sus fichas oficiales: no hay datos de esas alternativas en la informacion disponible para esta ficha, y comparar sin metricas publicadas del modelo evaluado no aportaria ninguna conclusion valida.

| Modelo | Parametros | Contexto | Licencia | Datos verificados en esta busqueda |
|---|---|---|---|---|
| qwen35_gui_gguf | 772.845.888 | No disponible | No disponible | Solo recuento de parametros y tamano de repo |
| Alternativas de menos de 1 B (Qwen3-0.6B, Gemma 3 1B, Llama 3.2 1B, SmolVLM) | No disponible | No disponible | No disponible | No se encontraron datos en la informacion proporcionada |

## Limitaciones y advertencias

- Licencia no declarada: sin un termino de licencia explicito no se puede asumir uso comercial permitido. Es imprescindible contactar con el autor o verificar la licencia del modelo base Qwen3.5-0.8B antes de cualquier despliegue productivo.
- Modelo de la comunidad, no oficial: se trata de un finetune de un usuario individual sobre Qwen3.5-0.8B, sin publicacion de dataset, hiperparametros ni proceso de evaluacion. Los resultados pueden degradarse respecto al modelo base.
- Riesgo de alucinacion elevado: con 0,77 mil millones de parametros, la capacidad de razonamiento y de fidelidad factual es limitada, especialmente en tareas de varios pasos o con imagenes densas en texto.
- Sin benchmarks publicados: no hay ninguna evidencia cuantitativa de su calidad en tareas de GUI, OCR o descripcion de imagenes. Cualquier uso requiere una evaluacion propia con un conjunto de validacion representativo.
- Idiomas no documentados: se desconoce que lenguas cubre el ajuste fino; el ajuste puede haber reducido el multilingueismo del modelo base a favor del ingles.
- Ventana de contexto desconocida: no se puede planificar un caso de uso que dependa de contexto largo sin medirla empiricamente.
- Validacion social minima: 91 descargas y 1 "like" indican que el modelo practicamente no ha sido revisado por la comunidad.
- Solo GGUF: no se ofrecen pesos en safetensors del finetune, lo que complica el reentrenamiento, la fusion de adaptadores o el uso con frameworks como vLLM o TGI. El recuento de parametros disponible en la metainformacion del repositorio corresponde a safetensors, pero no se detalla que ficheros lo contienen.
- Trazabilidad de la busqueda web: los resultados devueltos por la busqueda no guardan relacion con el modelo (contenido sobre grupos de Facebook, logros de Steam y informes de Microsoft 365), por lo que no aportan ninguna verificacion externa.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/itsnotacreativeuser/qwen35_gui_gguf
- Unsloth (herramienta citada para el entrenamiento y la conversion a GGUF): https://github.com/unslothai/unsloth
- llama.cpp (runtime implicito en los comandos `llama-cli` y `llama-mtmd-cli` de la model card; no se enlaza en la ficha original): no disponible en la informacion proporcionada
- Paper, blog o demo oficial: no disponible
- Enlaces relevantes encontrados en la busqueda web: ninguno (los resultados obtenidos no estan relacionados con el modelo)
