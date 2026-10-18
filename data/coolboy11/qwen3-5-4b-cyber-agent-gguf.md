# Coolboy11/qwen3.5-4b-cyber-agent-GGUF

## Resumen

`Coolboy11/qwen3.5-4b-cyber-agent-GGUF` es un modelo de lenguaje publicado en HuggingFace por el usuario Coolboy11, distribuido unicamente en formato GGUF y etiquetado como *vision-language-model*. Segun la model card, fue ajustado finamente y convertido a GGUF con Unsloth, y deriva de un modelo que el autor denomina "Qwen3.5-4B-Uncensored-HauhauCS-Aggressive", del que no se aporta referencia, repo base ni licencia. El dato objetivo disponible es el recuento de parametros de los pesos originales en safetensors: 4.205.751.296 parametros, es decir, aproximadamente 4,2 mil millones.

El interes practico del artefacto es acotado pero real: un modelo de 4,2B cuantizado en Q4_K_M con proyector visual en F16 cabe en GPUs de consumo y en portatiles, y se ejecuta con `llama.cpp` mediante `llama-cli` (texto) o `llama-mtmd-cli` (multimodal). El nombre comercial sugiere un enfoque de "agente de ciberseguridad" y de alineacion reducida ("Uncensored", "Aggressive"), lo que lo orienta a experimentacion en entornos controlados mas que a produccion.

Ahora bien, la ficha debe leerse con cautela: el repositorio tiene 0 descargas y 0 likes, la model card ocupa unas pocas lineas, no se declara licencia, no hay idiomas declarados, no hay pipeline asignado y no existe ningun benchmark publicado. Ademas, la denominacion "Qwen3.5" no se corresponde con ninguna familia oficial verificable en la informacion proporcionada, y la fecha de creacion del repo (2026-10-18) es posterior a la fecha de actualizacion de los metadatos consultados, lo que apunta a metadatos anomalos o no auditados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (los tags indican `qwen3_5`; no se documenta si es transformer denso, MoE o hibrida) |
| Parametros totales | 4.205.751.296 (~4,2B), segun safetensors del modelo base |
| Parametros activos | no disponible (no se declara que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (pesos principales) y F16 para el proyector multimodal (`mmproj`) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (no declarada en el repo ni en la model card) |
| Formato de pesos | GGUF (unico formato publicado); el modelo original era safetensors |
| Tamano del repositorio | 3,4 GB |
| Ficheros publicados | `Qwen3.5-4B-Uncensored-HauhauCS-Aggressive-Safetensor-Benchmark.Q4_K_M.gguf`, `Qwen3.5-4B-Uncensored-HauhauCS-Aggressive-Safetensor-Benchmark.F16-mmproj.gguf` |
| Modalidad | texto y vision (proyector `mmproj` en F16) |
| Runtime declarado | `llama.cpp` (`llama-cli`, `llama-mtmd-cli`), plantillas via `--jinja` |
| Herramienta de conversion | Unsloth |

## Arquitectura y entrenamiento

No se dispone de informacion tecnica sobre la arquitectura interna: la model card no indica si se trata de un transformer decoder-only denso, de una mezcla de expertos o de un diseno hibrido, ni detalla el mecanismo de atencion, la tokenizacion o el vocabulario. Los tags del repositorio (`qwen3_5`, `vision-language-model`) sugieren una base de la familia Qwen con capacidad multimodal, materializada en la practica por la presencia de un fichero `mmproj` separado, que es el proyector visual que `llama.cpp` combina con los pesos del lenguaje para procesar imagenes. El prefijo del nombre de los ficheros ("Uncensored-HauhauCS-Aggressive") indica que el ajuste fino partio de una variante ya desalineada de terceros, no de un checkpoint oficial.

Tampoco se documentan los datos de entrenamiento: no hay numero de tokens, composicion del dataset, ni confirmacion de si hubo RLHF, DPO o simplemente SFT. La unica referencia metodologica es que el autor uso Unsloth para el ajuste y la conversion a GGUF, lo que en la practica implica un fine-tuning supervisado de bajo coste y una cuantizacion Q4_K_M generada con las herramientas habituales de `llama.cpp`. No hay informacion sobre decodificacion especulativa, atencion lineal ni ninguna otra innovacion tecnica.

## Capacidades

- Generacion de texto conversacional: el tag `conversational` y el uso previsto con `llama-cli` confirman el caso de uso basico de chat e instrucciones.
- Procesamiento de imagenes: la presencia de un proyector `mmproj` en F16 y el tag `vision-language-model` habilitan entrada multimodal (capturas de pantalla, diagramas, fotos de documentos) mediante `llama-mtmd-cli`.
- Soporte de plantillas de chat con Jinja: el flag `--jinja` permite aplicar la plantilla conversacional incluida en el GGUF y, si dicha plantilla define los tokens adecuados, habilitar tool calling en `llama.cpp`; no obstante, el soporte de function calling no esta documentado por el autor.
- Orientacion a dominio de ciberseguridad: por el nombre del modelo ("cyber-agent"), se infiere un ajuste orientado a tareas de seguridad ofensiva y defensiva, aunque no se especifican las capacidades concretas ni se aportan evaluaciones.
- Desalineacion deliberada ("uncensored"): el modelo declara no aplicar el filtrado de seguridad habitual, lo que amplia el rango de respuestas tecnicas sobre explotacion, malware o ingenieria social, a costa de eliminar las salvaguardas.
- Idiomas: no disponible; no se declara cobertura multilingue.
- Razonamiento multi-paso, agentes, matematicas y generacion de codigo: no documentados explicitamente.

## Casos de uso

- Analisis de logs y triaje de alertas en local: un modelo de 4,2B en Q4_K_M se puede desplegar en un portatil o en un servidor sin GPU dedicada para resumir y clasificar eventos de seguridad, con la ventaja de que ningun dato sensible sale de la red corporativa.
- Asistente de pentesting en entornos aislados (air-gapped): al ejecutarse con `llama.cpp` sobre CPU o GPU de consumo, encaja en laboratorios sin conexion a internet, donde se le pueden pedir explicaciones de tecnicas, interpretacion de salidas de herramientas y borradores de informes.
- Analisis de capturas de pantalla en auditorias: con `llama-mtmd-cli` se le pueden pasar imagenes de paneles de administracion, configuraciones o salidas de escaneres para extraer informacion estructurada o detectar configuraciones inseguras visibles.
- Generacion de reglas de deteccion: borradores de reglas Sigma, YARA o expresiones de busqueda a partir de una descripcion textual de un comportamiento sospechoso, que un analista revisa y valida antes de desplegar.
- Simulacion de escenarios de ingenieria social para formacion: la ausencia de filtrado permite generar correos de phishing de ejemplo realistas para programas de concienciacion, siempre dentro de un marco autorizado y con supervision humana.
- Documentacion post-incidente: redaccion de borradores de timeline, resumen ejecutivo y recomendaciones a partir de notas del analista, con revision posterior obligatoria por el riesgo de alucinacion.
- Extraccion de indicadores de compromiso (IoCs) desde texto libre o imagenes de correos: IPs, dominios, hashes y rutas, con validacion automatica mediante expresiones regulares antes de ingestarlos en un SIEM.
- Prototipado rapido de asistentes de soporte tecnico self-hosted: su tamano permite iterar en una estacion de trabajo antes de decidir si se migra a un modelo mayor, aunque la falta de datos de contexto y de benchmarks limita la comparacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

| Benchmark | Resultado |
|---|---|
| MMLU | no disponible |
| HumanEval | no disponible |
| GSM8K | no disponible |
| Evaluaciones de ciberseguridad (CTF, CyberSecEval) | no disponible |
| Evaluaciones multimodales (MMMU, DocVQA) | no disponible |

El nombre de uno de los ficheros incluye la palabra "Benchmark", pero no se acompana de ninguna tabla de resultados ni de metodologia de evaluacion, por lo que no puede interpretarse como evidencia de rendimiento.

## Requisitos de hardware

- VRAM estimada con Q4_K_M: aproximadamente 2,5-3,0 GB para los pesos del modelo de lenguaje (4,2B a ~4,5-5 bits por parametro), mas el proyector `mmproj` en F16 y la cache KV. Con contexto moderado, el total razonable se situa en 3,5-5 GB.
- VRAM estimada en F16: unos 8,4 GB solo para los pesos (4,2B x 2 bytes), inviable en GPUs de 8 GB con contexto apreciable.
- GPU de consumo: cabe con holgura en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080 y RTX 4090; en GPUs de 8 GB (RTX 3060 Ti, RTX 4060, RTX 3070) es viable con Q4_K_M y contexto corto. Tambien puede ejecutarse integramente en CPU con RAM suficiente (unos 4-6 GB libres).
- GPU de datacenter: A100 y H100 permiten servir muchas peticiones concurrentes o varias instancias, si bien el modelo es demasiado pequeno para aprovechar su ancho de banda.
- Opciones de despliegue: `llama.cpp` (`llama-cli`, `llama-mtmd-cli`, `llama-server` con API compatible con OpenAI), Ollama o LM Studio importando el GGUF, y `llama-cpp-python` para integracion en aplicaciones. vLLM y TGI no son la via natural para un GGUF de este origen y no hay soporte declarado.
- Latencia y throughput: no disponibles. Como referencia cualitativa, un modelo denso de 4,2B en Q4_K_M sobre una GPU moderna de consumo suele producir decenas de tokens por segundo, pero no se ha publicado ninguna medicion de este artefacto concreto.

## Comparativa con modelos similares

Los datos de la columna de este modelo proceden del repositorio; los de las alternativas son especificaciones publicas de referencia y no se han verificado contra la informacion proporcionada.

| Modelo | Parametros | Contexto | Licencia | Formato | Observaciones |
|---|---|---|---|---|---|
| Coolboy11/qwen3.5-4b-cyber-agent-GGUF | ~4,2B | no disponible | no disponible | GGUF | Sin benchmarks, sin model card detallada, 0 descargas; incluye vision via `mmproj` |
| Qwen3-4B (oficial) | ~4B | 32K nativo, extensible con YaRN | Apache 2.0 | safetensors, GGUF | Base verificable, con evaluaciones publicadas y soporte de tool calling |
| Llama 3.2 3B Instruct | 3,2B | 128K | Licencia comunitaria Llama 3.2 | safetensors, GGUF | Multilingue declarado, con vision en la variante 11B |
| Gemma 3 4B | ~4B | 128K | Terminos de uso de Gemma | safetensors, GGUF | Multimodal y multilingue, con evaluaciones publicadas |

La diferencia practica fundamental no es de tamano, sino de trazabilidad: las alternativas oficiales permiten verificar linaje, licencia y comportamiento, mientras que este repositorio no ofrece ninguna de las tres cosas.

## Limitaciones y advertencias

- Licencia no declarada: sin terminos explicitos, el uso comercial es juridicamente incierto y, en la practica, no deberia asumirse permitido. La etiqueta del modelo base ("Uncensored") agrava el riesgo, ya que muchos checkpoints derivados heredan licencias que prohiben ciertos usos.
- Ausencia total de evaluaciones: no hay benchmarks, ni evaluaciones de seguridad, ni pruebas de regresion. Cualquier afirmacion sobre su calidad es especulativa.
- Repositorio no auditado: 0 descargas, 0 likes, sin pipeline asignado, sin idiomas declarados y con metadatos temporalmente anomalos (creado el 2026-10-18). No hay garantia de que los pesos correspondan al modelo descrito.
- Alineacion de seguridad reducida: el nombre declara explicitamente "Uncensored" y "Aggressive". Es previsible que genere contenido sobre explotacion, malware o evasion sin las negativas habituales, lo que exige controles adicionales si se expone a usuarios finales.
- Riesgo de alucinacion: en un modelo de 4,2B sin evaluaciones, la invencion de comandos, rutas, CVEs, hashes o sintaxis de reglas es esperable. Toda salida tecnica debe validarse antes de ejecutarse.
- Limitaciones de contexto e idioma: se desconoce la ventana de contexto real y la cobertura linguistica; no conviene asumir buen rendimiento en castellano ni en conversaciones largas.
- Trazabilidad del modelo base dudosa: no existe una familia oficial "Qwen3.5" verificable en la informacion disponible, y el nombre del checkpoint de origen ("HauhauCS") no se documenta. La cadena de custodia del ajuste fino es desconocida.
- Vision sin especificaciones: se desconoce la resolucion de imagen soportada, el numero de tokens visuales por imagen y el rendimiento en documentos densos; el proyector va en F16, lo que anade VRAM.
- Tool calling no garantizado: aunque `--jinja` permite aplicar la plantilla, no se confirma que esta defina las etiquetas de herramientas necesarias para function calling fiable.
- Uso responsable: adecuado para laboratorio, investigacion y formacion autorizada; no recomendado como componente de produccion orientado al publico sin una capa de moderacion y sin una revision legal de la licencia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Coolboy11/qwen3.5-4b-cyber-agent-GGUF
- Unsloth (herramienta de ajuste y conversion declarada): https://github.com/unslothai/unsloth
- llama.cpp (runtime declarado en la model card): https://github.com/ggml-org/llama.cpp
- Documentacion de `llama-mtmd-cli` para modelos multimodales: https://github.com/ggml-org/llama.cpp/tree/master/tools/mtmd
- Paper, blog, demo o repositorio adicional del autor: no disponible en la informacion proporcionada.
