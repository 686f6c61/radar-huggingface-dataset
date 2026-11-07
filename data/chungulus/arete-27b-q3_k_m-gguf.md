# Chungulus/Arete-27B-Q3_K_M-GGUF

## Resumen

Arete-27B-Q3_K_M-GGUF es una cuantizacion en formato GGUF, tipo Q3_K_M, del checkpoint BF16 Arete-27B de Nous Research, un ajuste fino supervisado (SFT) sobre Qwen3.8-27B. La publica el usuario independiente Chungulus, que no tiene relacion oficial ni con Nous Research ni con Alibaba/Qwen. El paquete incluye el modelo de texto cuantizado y un proyector multimodal (`mmproj`) en BF16 que habilita la entrada de imagenes, por lo que la pipeline declarada es `image-text-to-text`.

El modelo resuelve el problema de ejecutar un LLM de ~27.000 millones de parametros con codificador de vision en hardware de consumo o en entornos con VRAM limitada. Frente al BF16 original, la cuantizacion Q3_K_M reduce el peso a unos 14,2 GB de repositorio, lo que permite cargarlo en GPUs de 16-24 GB con llama.cpp. El contexto de referencia usado en las pruebas del autor es de 8192 tokens, aunque la ventana nativa del modelo base no se documenta en la informacion disponible.

La relevancia es practica: ofrece una via de despliegue local de un modelo multimodal de ~27B con licencia Apache 2.0, a costa de una perdida de precision no cuantificada por el autor. El propio publicador advierte que no evaluo benchmarks, alineamiento de valores, uso de herramientas ni calidad en contexto completo, por lo que debe tratarse como un artefacto de conveniencia para pruebas, no como un sustituto validado del original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso derivado de Qwen3.8-27B, con codificador de vision (proyector multimodal separado) |
| Parametros totales | 27.356.728.560 en el modelo original (incluye vision); 26.895.998.464 en el GGUF de texto |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion; las pruebas del autor usan 8192 tokens |
| Tipos de cuantizacion | Q3_K_M (este repositorio); el autor publica otras variantes en repositorios independientes |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (texto cuantizado) + `mmproj-Arete-27B-BF16.gguf` (proyector de vision en BF16) |

## Arquitectura y entrenamiento

El modelo base es Arete-27B de Nous Research, descrito por el cuantizador como un ajuste fino supervisado de Qwen3.8-27B. Se trata de un transformer denso de aproximadamente 27.000 millones de parametros con un codificador de vision acoplado mediante un proyector multimodal; el GGUF de texto conserva 26.895.998.464 parametros y el proyector se distribuye aparte en BF16. El autor indica que la variante MTP (multi-token prediction) esta deshabilitada y ausente en la fuente, y que no se exporto ni sintetizo.

Sobre el proceso de cuantizacion: cada formato se genero de forma independiente a partir de la exportacion GGUF BF16 original, sin recuantizar checkpoints de baja precision y sin dataset de calibracion ni matriz de importancia. Los 18 shards originales se verificaron con SHA256 antes de la conversion y las cabeceras de tensores confirmaron el recuento completo de parametros. El autor senala que tensores de texto BF16 muestreados difieren del checkpoint padre fijado, un detalle de trazabilidad relevante. No se detallan en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO en el modelo base.

## Capacidades

- Generacion de texto conversacional multi-turno, con plantilla Jinja (`--jinja`) en llama.cpp.
- Razonamiento y respuesta a preguntas factuales; el autor valido comprobaciones aritmeticas y de hechos en tiempo de ejecucion nativo.
- Salida estructurada en JSON, verificada en las pruebas del publicador.
- Comprension de imagenes mediante el proyector `mmproj` en BF16, con soporte de `--image-min-tokens` (1024 tokens de imagen en las pruebas).
- Capacidad multimodal de type image-text-to-text segun la pipeline declarada.
- Modo thinking presente en la familia Qwen3.x, desactivado en las pruebas de validacion del autor.
- Soporte de tool calling y function calling: no evaluado por el autor; no disponible como capacidad verificada.
- Capacidades de agente y razonamiento multi-paso: no evaluadas.
- Cobertura multilingue: no disponible.

## Casos de uso

- Asistente conversacional local: con 8192 tokens de contexto y plantilla Jinja, puede mantener dialogos multi-turno en una estacion de trabajo con una GPU de 24 GB, sin depender de API externa.
- Descripcion y analisis de imagenes en local: usando `llama-mtmd-cli` con el `mmproj` BF16, sirve para etiquetado de imagenes, extraccion de texto visual o respuestas sobre capturas y diagramas.
- Generacion de JSON para pipelines: la validacion de salida JSON del autor lo hace util para extraer campos estructurados de texto libre en procesos ETL o de enriquecimiento de datos.
- Prototipado de aplicaciones multimodales: permite iterar sobre un modelo de ~27B con vision antes de comprometer presupuesto en inferencia BF16 o en GPUs de datacenter.
- Procesamiento por lotes en hardware de consumo: los ~14,2 GB del repositorio caben en GPUs de 16-24 GB, lo que habilita tareas offline de resumen, clasificacion o reescritura sin infraestructura dedicada.
- Evaluacion comparativa de cuantizaciones: al existir variantes de otros publicadores (por ejemplo bartowski) y del propio Chungulus, sirve para medir el impacto de Q3_K_M frente a Q4_K_M o IQ2_XXS en tareas concretas.
- Educacion e investigacion reproducible: la verificacion SHA256 de los 18 shards y los ficheros `validation.json` y `quantizatia-manifest.json` permiten auditar la procedencia del artefacto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor solo reporta comprobaciones funcionales cortas (aritmetica, JSON, hechos y fixtures de imagen rojo/azul con temperatura 0, semilla 42, contexto 8192, maximo 128 tokens generados y thinking desactivado) y advierte explicitamente que no evaluo precision en benchmarks, alineamiento de valores, uso de herramientas, video ni calidad en contexto completo.

## Requisitos de hardware

- VRAM estimada: el GGUF de texto Q3_K_M ocupa en torno a 11-12 GB; el repositorio completo son 14,2 GB, incluyendo el proyector BF16. Con cache KV para 8192 tokens hay que anadir varios GB adicionales.
- GPU recomendadas: RTX 4090 (24 GB), RTX 3090 (24 GB), RTX 4080 (16 GB) con contexto reducido; A100 o H100 para mayor contexto y throughput.
- Cabe en GPU de consumo: si, en tarjetas de 16 GB o mas con contexto moderado; en 12 GB requeriria descarga parcial a CPU y perdida de velocidad.
- Despliegue: llama.cpp (build de referencia `6414d5b0c9e5895473036c90c2bd305ce4ceccc4`, probado en Apple Silicon), `llama-completion` y `llama-mtmd-cli` para vision. Otros runtimes compatibles con GGUF (Ollama, LM Studio) no estan validados por el autor.
- Latencia y throughput: no disponibles; no se publican mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Chungulus/Arete-27B-Q3_K_M-GGUF | 26,9B (texto) | no disponible (pruebas a 8192) | GGUF Q3_K_M + mmproj BF16 | Apache 2.0 | Cuantizacion independiente, sin calibracion |
| bartowski/NousResearch_Arete-27B-GGUF | ~27B | no disponible | GGUF con layout calculado (Q4_K_M, Q3_K_M, IQ2_XXS) | Apache 2.0 | Reporta divergencia KL de 0,76x en Q3_K_M frente al layout estandar |
| Chungulus/Qwen3.8-27B-Q3_K_M-GGUF | ~27B | no disponible | GGUF Q3_K_M | Apache 2.0 | Mismo cuantizador, modelo base sin el ajuste de Nous |
| NousResearch/Arete-27B (BF16) | 27,36B (con vision) | no disponible | safetensors BF16 | Apache 2.0 | Referencia de maxima calidad; requiere mucha mas VRAM |

## Limitaciones y advertencias

- Perdida de precision por cuantizacion Q3_K_M sin matriz de importancia ni dataset de calibracion; el autor no reclama calidad identica al BF16.
- El autor declara que tensores de texto BF16 muestreados difieren del checkpoint padre fijado, lo que introduce una duda de trazabilidad sobre la fuente exacta.
- No se evaluaron benchmarks, alineamiento politico o de valores, uso de herramientas, video ni calidad en contexto completo.
- Riesgo de alucinacion inherente a un modelo de ~27B: no hay mediciones de factualidad mas alla de comprobaciones puntuales.
- Idiomas soportados no documentados; no se garantiza calidad fuera de los idiomas del modelo base.
- Requiere un runtime llama.cpp reciente con soporte de Qwen3.5/Qwen3.8; builds antiguos pueden fallar al cargar tensores.
- Hay que desactivar MTP y prediccion especulativa en los frontends que intenten habilitarlos, ya que no estan presentes en la fuente.
- Licencia Apache 2.0 permite uso comercial, pero exige conservar los avisos de atribucion de Nous Research y Alibaba/Qwen al redistribuir.
- Repositorio sin descargas ni likes en el momento de la consulta: no hay evidencia de comunidad que valide el artefacto.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Chungulus/Arete-27B-Q3_K_M-GGUF
- Modelo base: https://huggingface.co/NousResearch/Arete-27B
- Checkpoint padre fijado: https://huggingface.co/NousResearch/Arete-27B/tree/108f0afbdcfaa1ceeda4a635004304dfff6d4da2
- Cuantizacion alternativa de bartowski: https://huggingface.co/bartowski/NousResearch_Arete-27B-GGUF
- Cuantizacion del mismo autor sobre Qwen3.8-27B: https://huggingface.co/Chungulus/Qwen3.8-27B-Q3_K_M-GGUF
