# experimentalmachines/Qwen2.5-3B-ExecuTorch

## Resumen

Qwen2.5-3B-ExecuTorch es un artefacto de despliegue, no un modelo entrenado desde cero: se trata de una exportación cuantizada de Qwen/Qwen2.5-3B (revisión `3aab1f1954e9`) preparada por el usuario `experimentalmachines` para inferencia local en dispositivos Android mediante el runtime ExecuTorch 1.4.0. El repositorio contiene un fichero `.pte` con backend XNNPACK (CPU, arm64) y una ventana de contexto fija de 4.096 tokens, con pesos en 4 bits y activaciones en 8 bits dinámicos.

El problema que resuelve es concreto: permitir que un transformer de 3.000 millones de parámetros se ejecute íntegramente en el teléfono, sin red ni servidor, dentro de una aplicación Android de código abierto llamada openweights. Para ello el autor aplica la receta `export_llm` de ExecuTorch con embeddings int8 por canal, pesos de 4 bits agrupados de 32 en 32 y caché KV en fp32 reservada por completo al cargar el modelo. El resultado es un fichero de 2,06 GB que ocupa aproximadamente 2,1 GB de repositorio.

La relevancia actual es doble. Por un lado, demuestra que el ecosistema ExecuTorch ya soporta LLMs de gama media en CPU de móvil con una receta reproducible y verificable (el autor publica el enlace a la ejecución de CI que generó el binario). Por otro, sirve como pieza de referencia para quien necesite evaluar el coste real de memoria y el compromiso entre ventana de contexto y presupuesto de RAM en inferencia on-device. El modelo base, Qwen2.5-3B, es un modelo denso preentrenado con 32.768 tokens de contexto nativo y licencia qwen-research, lo que condiciona tanto la calidad final como el uso comercial del artefacto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder denso (arquitectura del modelo base Qwen2.5-3B: RoPE, GQA, SwiGLU, RMSNorm; no se describe en la model card de este repo) |
| Parametros totales | 3.090 millones (3,09 B) segun las especificaciones publicas del modelo base; el repositorio no lo declara explicitamente |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | 4.096 tokens en el fichero publicado; el autor indica que existen exportaciones para ventanas de 2k a 32k, pero la tabla de ficheros del repo solo lista la de 4k, con la ventana fijada dentro del `.pte` |
| Tipos de cuantizacion | Receta unica `8da4w`: activaciones dinamicas de 8 bits, pesos de 4 bits en grupos de 32, embeddings int8 por canal, cache KV en fp32 |
| Idiomas soportados | no disponible en la model card de este repositorio; el modelo base Qwen2.5-3B declara soporte multilingue (29 idiomas segun su documentacion publica, no verificado aqui) |
| Licencia | `other` / `qwen-research` (derivado cuantizado de Qwen/Qwen2.5-3B, distribuido bajo los mismos terminos) |
| Formato de pesos | `.pte` (programa ExecuTorch, backend XNNPACK); incluye `tokenizer.json`, `config.json` por backend y `export-report-<window>.json` |

## Arquitectura y entrenamiento

En este repositorio no hay entrenamiento: es una conversion de pesos. El material de partida es Qwen/Qwen2.5-3B, un transformer decoder de tipo denso con atencion de consultas agrupadas (GQA), embeddings rotatorios (RoPE), activacion SwiGLU y normalizacion RMSNorm, con 32.768 tokens de contexto nativo en su configuracion original. La model card de esta exportacion no documenta ni el numero de tokens de preentrenamiento, ni la composicion del dataset, ni si hubo fases de ajuste por instrucciones, RLHF o DPO. Dado que el modelo base referenciado es la variante sin sufijo `Instruct`, lo mas probable es que se trate del checkpoint preentrenado y no de uno alineado para dialogo, aunque esto no se confirma en la informacion disponible.

La innovacion tecnica esta en la cadena de exportacion, no en el modelo. El autor ejecuta `export_llm` de ExecuTorch 1.4.0 sobre una compilacion de XNNPACK con operadores extendidos, con trozos de prefill de 2.048 tokens, y produce un grafo estatico con la ventana de contexto incrustada. Esa decision implica que la cache KV se dimensiona y se reserva entera en el momento de cargar el modelo: para 4.096 tokens y cache fp32 son 73.728 bytes por token, es decir, 301.989.888 bytes (unos 288 MiB) solo de cache, a los que se suman los 2,06 GB de pesos. El repositorio incluye informes de exportacion (`export-report-<window>.json`) con el registro completo de cada fichero, lo que hace la receta auditable y reproducible.

## Capacidades

- Generacion de texto autoregresiva en ingles y otros idiomas, heredada del modelo base; la model card no enumera capacidades especificas.
- Inferencia completamente local en dispositivo, sin conexion de red y sin enviar datos a un servidor.
- Ejecucion en CPU arm64 generica mediante XNNPACK, sin requerir aceleradores propietarios ni GPU del dispositivo.
- Integracion con el runtime ExecuTorch 1.4.0 y con la aplicacion Android openweights.
- Ventana de contexto de 4.096 tokens en el fichero publicado, suficiente para conversaciones cortas, resumenes de fragmentos y tareas de una sola pasada.
- Prueba de humo superada: el autor reporta que el binario XNNPACK de 4k genero correctamente la palabra "Paris" en el test de validacion.
- Capacidades no confirmadas: no hay evidencia en la informacion disponible de soporte de tool calling, function calling, agentes, razonamiento multi-paso, vision, audio, ni de un modo de razonamiento explicito. Al tratarse presumiblemente del checkpoint base, no debe asumirse un formato de chat ni seguimiento fiable de instrucciones.

## Casos de uso

- Asistentes de texto sin conexion en Android: la aplicacion openweights carga el `.pte` y ejecuta el modelo en la CPU del telefono, de modo que el usuario puede redactar o reformular texto en modo avion y sin que el contenido salga del dispositivo. Es adecuado porque el binario esta pensado exactamente para ese runtime y ese hardware.
- Redaccion asistida y autocompletado en aplicaciones de notas o correo: con 4.096 tokens de ventana cabe un hilo de correo corto o un documento de varias paginas, y la generacion local evita latencia de red y costes de API.
- Resumen y clasificacion de notificaciones o mensajes en el propio dispositivo: el modelo puede etiquetar o resumir texto entrante antes de mostrarlo, un escenario donde la privacidad es el requisito dominante y la calidad de un modelo de 3B es suficiente para tareas de etiquetado grueso.
- Poscorreccion de texto procedente de reconocimiento automatico del habla (ASR) en aplicaciones de accesibilidad o dictado: el modelo recibe la transcripcion cruda y devuelve una version con puntuacion y mayusculas corregidas, sin salir del telefono.
- Quioscos y dispositivos de atencion al cliente sin conectividad fiable: en terminales de retail, museos o fabricas, el modelo puede responder a preguntas frecuentes precargadas. La limitacion real es la ventana de 4k, que obliga a mantener los dialogos cortos o a resumir el historial periodicamente.
- Aplicaciones de campo para tecnicos e inspectores: generacion de descripciones estructuradas a partir de notas breves tomadas en una visita, con el modelo embebido en una tablet Android y sin depender de cobertura.
- Banco de pruebas de cuantizacion y exportacion: el `export-report-<window>.json` y la receta `8da4w` documentada permiten a un equipo de plataforma comparar esta configuracion con otras recetas (por ejemplo pesos de 8 bits, otros tamanos de grupo o cache KV en int8) midiendo memoria y calidad en el mismo dispositivo.
- Filtrado y preetiquetado en el borde: en pipelines de datos distribuidos, un telefono o dispositivo arm64 puede preclasificar o limpiar muestras antes de enviarlas a un servidor, reduciendo el volumen transmitido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye valores de MMLU, HumanEval, GSM8K, MT-Bench ni de ninguna otra evaluacion, ni comparaciones con modelos alternativos. El unico dato de validacion aportado es cualitativo: la prueba de humo del fichero XNNPACK de 4k se marca como superada, con la generacion del token "Paris".

Datos de memoria si verificables a partir de la informacion proporcionada:

| Metrica | Valor |
|---|---|
| Tamano del fichero `.pte` (XNNPACK, 4k) | 2,06 GB |
| Tamano total del repositorio | 2,1 GB |
| Coste de cache KV (fp32) | 73.728 bytes por token |
| Cache KV para 4.096 tokens | 301.989.888 bytes (aprox. 288 MiB) |
| Criterio de encaje declarado | `fits_phone_budget` en cada `config.json`, estimado contra un presupuesto de 5 GB |
| Latencia y throughput | no disponible |

## Requisitos de hardware

- Memoria necesaria estimada: alrededor de 2,4 GB para pesos mas cache KV a 4.096 tokens (2,06 GB + unos 0,29 GB), sin contar el sobrecoste del runtime, del tokenizador y de la aplicacion anfitriona.
- Escalado por ventana: si se usaran las variantes de contexto mayor que el autor menciona (hasta 32k), la cache KV en fp32 creceria hasta aproximadamente 2,25 GiB, lo que llevaria el total por encima de los 4 GB de RAM solo para el modelo.
- Arquitectura objetivo: cualquier dispositivo `arm64`. El backend publicado es XNNPACK sobre CPU, de modo que no se aprovechan aceleradores graficos ni NPU.
- GPU dedicadas (A100, H100, RTX 4090): no aplica; el artefacto esta pensado para CPU de movil y no se distribuye en formatos compatibles con estos aceleradores.
- Cabida en GPU de consumo: irrelevante para este fichero. Si se quisiera ejecutar el modelo base en una GPU de consumo, habria que usar otra distribucion (pesos safetensors originales o una cuantizacion GGUF), no este `.pte`.
- Opciones de despliegue: runtime ExecuTorch 1.4.0 y la aplicacion Android openweights. No hay soporte declarado para vLLM, llama.cpp, Ollama ni TGI, que no consumen ficheros `.pte`.
- Latencia y throughput: no disponible. El autor no publica mediciones de tokens por segundo ni de tiempo de prefill.

## Comparativa con modelos similares

La comparacion se limita a atributos estructurales verificables; no hay datos de rendimiento publicados para este artefacto. Las cifras del modelo base y de las alternativas proceden de su documentacion publica y no se han verificado en este repositorio.

| Modelo | Parametros | Contexto | Formato y runtime | Licencia | Rendimiento publicado |
|---|---|---|---|---|---|
| Qwen2.5-3B-ExecuTorch (este modelo) | 3,09 B (heredados del base) | 4.096 tokens en el fichero publicado | `.pte`, ExecuTorch 1.4.0 + XNNPACK, CPU arm64 | qwen-research | no disponible |
| Qwen/Qwen2.5-3B (original) | 3,09 B | 32.768 tokens (segun especificaciones publicas del base) | safetensors, transformers / PyTorch | qwen-research | no disponible en esta informacion |
| Qwen/Qwen2.5-1.5B (alternativa mas ligera de la misma familia) | 1,5 B aprox. | 32.768 tokens (segun especificaciones publicas) | safetensors; requiere exportacion propia a ExecuTorch o GGUF | qwen-research | no disponible en esta informacion |
| Llama-3.2-3B (alternativa de tamano similar para on-device) | 3,21 B | 128.000 tokens (segun especificaciones publicas) | safetensors; hay cuantizaciones GGUF de la comunidad | Llama 3.2 Community License | no disponible en esta informacion |

Diferencias clave frente a las alternativas: este artefacto es el unico de la tabla que llega listo para ejecutarse en Android con ExecuTorch sin conversion adicional, pero tambien es el que impone la ventana de contexto mas corta (4.096 tokens) y el que fija el consumo de memoria en tiempo de carga. El original en safetensors conserva los 32.768 tokens de contexto pero no cabe en un telefono sin cuantizar y no se ejecuta sobre XNNPACK.

## Limitaciones y advertencias

- Ventana de contexto corta: el fichero publicado fija 4.096 tokens. Conversaciones largas, documentos extensos o codigo de varios ficheros no caben sin truncar o resumir el historial.
- Consumo de memoria no negociable en tiempo de ejecucion: la cache KV se reserva entera al cargar el modelo, por lo que no hay ahorro dinamico; si el dispositivo no dispone de esa RAM contigua, la carga fallara.
- Artefacto probablemente base, no alineado: si el checkpoint de partida es Qwen2.5-3B sin ajuste por instrucciones, no debe esperarse seguimiento fiable de instrucciones, formato de chat consistente ni rechazo de peticiones problematicas. No hay informacion que confirme lo contrario.
- Riesgo de alucinacion: un modelo de 3.000 millones de parametros sin alineamiento declarado tiende a inventar hechos con fluidez. Para cualquier uso informativo hace falta verificacion externa o anclaje a fuentes.
- Idiomas y sesgos: la model card no documenta idiomas soportados ni evaluaciones de sesgo. No hay datos sobre comportamiento en castellano ni sobre sesgos de genero, raza o ideologia.
- Licencia restrictiva para uso comercial: se trata de la licencia `qwen-research`, no de Apache-2.0. El uso comercial esta limitado por los terminos del modelo base, cuyo texto se incluye sin modificar en el repositorio; conviene revisarlo antes de integrar el modelo en un producto.
- Compatibilidad de runtime estricta: el `.pte` esta generado para ExecuTorch 1.4.0. Otras versiones del runtime pueden no cargarlo, y ninguna herramienta de inferencia habitual (vLLM, llama.cpp, Ollama, TGI) lo acepta directamente.
- Adopcion nula y validacion minima: el repositorio registra 0 descargas y 0 "likes", y la unica validacion publicada es una prueba de humo de una palabra. No hay historial de uso en produccion ni informes de terceros.
- Sin garantia de mantenimiento: el artefacto se publico y actualizo el mismo dia (13 de septiembre de 2026, segun los metadatos) y depende de un repositorio de exportacion externo para reproducirse.

## Enlaces

- Pagina del modelo en HuggingFace: https://huggingface.co/experimentalmachines/Qwen2.5-3B-ExecuTorch
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-3B
- Licencia del modelo base (incluida sin modificar en el repositorio): https://huggingface.co/Qwen/Qwen2.5-3B/blob/main/LICENSE
- Aplicacion Android openweights: https://github.com/alpharomercoma/openweights
- Repositorio del exportador: https://github.com/ExperimentalMachines/executorch-model-exporter
- Ejecucion de CI que genero el binario: https://github.com/ExperimentalMachines/executorch-model-exporter/actions/runs/34753856815
- Nota sobre la busqueda web: los resultados proporcionados corresponden a foros de eBay y no contienen ningun enlace relevante al modelo, a ExecuTorch ni a Qwen.
