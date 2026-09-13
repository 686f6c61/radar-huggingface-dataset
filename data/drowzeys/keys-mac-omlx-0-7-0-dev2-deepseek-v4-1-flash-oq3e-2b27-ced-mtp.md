# drowzeys/keys-Mac-oMLX-0.7.0.dev2-DeepSeek-V4.1-Flash-oQ3e-2b27-CED-MTP

## Resumen

Este repositorio contiene una re-cuantización del modelo DeepSeek-V4.1-Flash preparada por el usuario drowzeys para ejecutarse íntegramente en una única máquina Apple Silicon de 256 GB (Mac Studio M3 Ultra, identificador Mac15,14). El checkpoint base, `Jundot/DeepSeek-V4.1-Flash-oQ3e-mtp`, no cabía en ese equipo: incluso con descarga de pesos a SSD mediante Engram, requería 239,04 GiB residentes frente a los 238,42 GiB de RAM utilizable. La versión publicada aquí re-cuantiza **27 de las 40 capas MoE** (expertos enrutados) de `affine 3-bit` a `affine 2-bit` con `group_size 64`, liberando 42,7 GiB y dejando el modelo en 197,19 GB residentes, con margen real de trabajo.

Se distribuye en formato MLX (safetensors) y está pensada para el runtime oMLX 0.7.0.dev2 sobre MLX 0.32.2. Mantiene intacto el mecanismo de decodificación especulativa DSpark MTP del modelo original, así como las capas críticas para la atención dispersa (generación de claves KV e índices). El autor reporta una longitud de contexto verificada de 404.805 tokens con prefill sostenido en torno a 805 tok/s, además de 25,08 tok/s en generación de prosa y 29,85 tok/s en código a temperatura 0.

Su relevancia es acotada pero muy específica: demuestra que un MoE de gran tamaño puede servirse en un único Mac de gama alta con cuantizaciones mixtas por capa, sin paginación de expertos a disco y con contexto largo funcional. No es un modelo nuevo ni un fine-tuning, sino un artefacto de despliegue con requisitos de hardware y de runtime muy concretos.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE tipo transformer (`deepseek_v41`) con atención dispersa, decodificación especulativa DSpark MTP, Engram SSD-offload y prefill CED habilitado |
| Parametros totales | 94.113.357.090 según los metadatos de safetensors del repositorio. La model card del autor indica 763B para el modelo base DeepSeek-V4.1-Flash; la discrepancia no está resuelta en la información disponible |
| Parametros activos | no disponible |
| Longitud de contexto | 404.805 tokens verificados por el autor; más de 500K alcanzable según sus mediciones |
| Tipos de cuantizacion | `affine 3-bit` y `affine 2-bit`, `group_size 64` (27 de 40 capas MoE en 2-bit; nunca por debajo de 3-bit en capas críticas) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors en formato MLX; tamaño del repositorio 405,8 GB |

## Arquitectura y entrenamiento

El modelo conserva la arquitectura del base DeepSeek-V4.1-Flash: un transformer con mezcla de expertos (MoE) de **40 capas**, atención dispersa y atención local con ventana fija de 128 tokens por capa. Solo 4 capas (`kv_source_layer_ids`) generan KV comprimida compartida, con un coste de aproximadamente 2,0 KB por token, de modo que incluso un contexto de 1M de tokens ocuparía unos 2,15 GB de KV. El cuello de botella real no es el almacenamiento de KV sino el conjunto de trabajo del prefill, en torno a 505 KB por token, motivo por el cual la cuantización agresiva de 27 capas libera el margen necesario para mantener el tamaño de chunk de prefill en 2048 tokens en lugar del mínimo de 32.

La decisión de qué capas cuantizar es **estructural, no numérica**: el daño medido en coseno de pesos al pasar de 3-bit a 2-bit es plano en las 40 capas (dispersión de 0,0037), por lo que no sirve como criterio. El autor documenta una regresión real al incluir las capas 28 y 32 (miembros de `index_source_layer_ids`, que producen las claves de índice para la atención dispersa): la aceptación de MTP cayó del 84 % al 58,5 %. Las capas excluidas de la cuantización agresiva son las de generación de KV e índices, `candidate_source_layer_id`, `engram_layer_ids`, `dspark_target_layer_ids`, la capa 0 y la última. Los pesos del drafter DSpark MTP permanecen intactos, a precisión original. Las capas re-cuantizadas a 2-bit son: 3, 4, 5, 6, 7, 9, 10, 11, 12, 13, 15, 16, 17, 18, 19, 21, 22, 23, 25, 26, 27, 29, 30, 31, 33, 34 y 35.

No se dispone de información sobre el dataset de entrenamiento, el número de tokens, ni sobre procesos de RLHF o DPO, ya que este repositorio es un artefacto de cuantización derivado de otro checkpoint, no un entrenamiento.

## Capacidades

- Generación de texto en modo `text-generation`, con latencia de primer token de 0,78 s en flujo único.
- Generación de código: el autor reporta mayor velocidad (29,85 tok/s) y mayor aceptación de decodificación especulativa en código (75,4 %) que en prosa (59,1 %).
- Contexto largo real: se han verificado 404.805 tokens de entrada con prefill completo, lo que habilita tareas de resumen y análisis sobre documentación extensa.
- Decodificación especulativa DSpark MTP con `mtp_num_draft_tokens: 3`, que incrementa el throughput de prosa de 23,35 a 25,06 tok/s (+7,3 %).
- Soporte de caché paginada en SSD (`--paged-ssd-cache-dir`) y reutilización de prefijo, relevante para cargas de agente que reenvían un system prompt grande (diferencia medida entre ~99 s y ~7 s por llamada).
- Offload de Engram a NVMe sin paginación de expertos (`deepseek_v41_expert_ssd_offload: false`).
- Tool calling, function calling, capacidades multimodales, audio o modo de razonamiento explícito: no disponible en la información proporcionada.

## Casos de uso

- Procesamiento de documentación extensa en local: con 404.805 tokens de contexto verificado, permite cargar bases de código completas, expedientes o libros técnicos en una sola ventana sin fragmentar, algo inviable en GPUs de consumo con 24 GB de VRAM.
- Asistencia de programación en estación de trabajo aislada: el modelo alcanza 29,85 tok/s en código y una aceptación de MTP del 75,4 %, por lo que resulta viable como autocompletado y generación de parches en entornos sin conectividad ni envío de datos a terceros.
- Agentes con system prompt fijo: la reutilización de prefijo activada vía `omlx.cli serve` reduce el coste de llamadas repetidas con contexto idéntico de ~99 s a ~7 s, lo que hace prácticos los flujos multi-paso con instrucciones largas y estables.
- Análisis de repositorios y auditoría de código: la ventana de 404K tokens permite revisar un proyecto entero en una sola pasada para detectar patrones, dependencias o vulnerabilidades, manteniendo los datos en la máquina.
- Investigación con requisitos de confidencialidad: al ejecutarse íntegramente en un Mac Studio local sin llamadas a API externas, es apto para datos clínicos, legales o financieros donde no se permite la salida a servicios en la nube.
- Prototipado de aplicaciones LLM en Apple Silicon: sirve como backend local compatible con la pila MLX/oMLX para validar prompts, cadenas de agentes y estrategias de cuantización antes de escalar a infraestructura con GPU.
- Evaluación de técnicas de cuantización mixta: el repositorio documenta el impacto medido de cada decisión (aceptación de MTP, throughput, capas excluidas), por lo que es útil como caso de estudio reproducible para quien investigue compresión de MoE.
- Generación de texto largo en flujo único: con 25,08 tok/s sostenidos en prosa y decodificación no batcheada, encaja en tareas de redacción o traducción monousuario donde la latencia por token importa más que el throughput agregado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la información disponible. Los datos disponibles son de rendimiento de inferencia y de aceptación de decodificación especulativa, medidos en un Mac15,14 / M3 Ultra / 256 GB / macOS 26.6.2, flujo único, 256 `max_tokens`, temperatura 0:

| Metrica | Paged 3-bit | Variante 14 capas 2b | Este build |
|---|---:|---:|---:|
| Prosa (tok/s) | 15,45 | 25,69 | 25,08 |
| Codigo (tok/s) | 10,18 | 29,08 | 29,85 |
| TTFT corto (s) | 3,53 | 0,74 | 0,78 |
| Peso residente (GB) | no disponible | 217,77 | 197,19 |

Prefill medido con `--initial-cache-blocks 8` y cuantización mixta:

| Tokens de prompt | Tiempo de prefill | Velocidad |
|---:|---:|---:|
| 25.949 | 45,0 s | 576 tok/s |
| 80.996 | 97,4 s | 831 tok/s |
| 212.256 | 252,6 s | 840 tok/s |
| 404.805 | 502,7 s | 805 tok/s |

Concurrencia (tok/s agregados; la decodificación no está batcheada, por lo que el agregado sigue la tasa de flujo único):

| Tarea | c=1 | c=2 | c=4 | c=8 |
|---|---:|---:|---:|---:|
| Prosa agregada | 23,38 | 19,64 | 19,06 | 19,21 |
| Codigo agregado | 27,36 | 19,64 | 19,03 | 19,20 |
| Por flujo | 25,08 / 29,85 | 10,27 | 4,90 | 2,49 |
| TTFT | 0,78-0,81 s | 1,14 s | 1,46 s | 3,89 s |

Aceptación de MTP según `mtp_num_draft_tokens` (prosa, temperatura 0,3):

| k | tok/s | tok/ciclo | Aceptacion |
|---:|---:|---:|---:|
| 3 | 22,69 | 2,04 | 63,8 % |
| 5 | 20,74 | 1,79 | 54,5 % |
| 7 | 19,77 | 1,76 | 52,2 % |

Se reporta además una aceptación de MTP del 75,4 % en código y del 59,1 % en prosa a la configuración de envío, y de ~81-85 % en código y ~64 % en prosa en la medición final del autor. La aceptación aumenta con la temperatura (54,3 % a temperatura 0 frente a 63,8 % a temperatura 1,0), pero el throughput no mejora en consecuencia.

## Requisitos de hardware

- Máquina objetivo: Apple Mac Studio M3 Ultra con 256 GB de memoria unificada (Mac15,14). Es el único entorno validado en la información disponible.
- Peso residente: 197,19 GB con Engram en NVMe y sin paginación de expertos.
- Ajuste de sistema obligatorio: `sudo sysctl iogpu.wired_limit_mb=253952`. El valor de fábrica (`249036`) limita el prefill al 90 % de ese valor (218,4 GB), por debajo del modelo, y provoca rechazo de prefill o SIGKILL silencioso. El cambio no persiste tras reiniciar.
- Repositorio en disco: 405,8 GB, muy por encima del peso residente, por lo que se requiere almacenamiento adicional para la descarga y la caché KV paginada.
- GPU de consumo: no es viable. Ni una RTX 4090 (24 GB) ni una RTX 5090 permiten alojar los 197,19 GB residentes; el modelo depende de memoria unificada de gran capacidad y del runtime MLX.
- GPU de数据中心: no aplica en la información disponible; el artefacto es específico de Apple Silicon y no se documenta despliegue en A100/H100.
- Opciones de despliegue: oMLX 0.7.0.dev2 (commit `395ec2fd`) sobre MLX 0.32.2, lanzado exclusivamente mediante `python -m omlx.cli serve`. El arranque con `python -m omlx.server` desactiva silenciosamente la reutilización de prefijo y ninguna variable de entorno lo corrige. vLLM, llama.cpp, Ollama y TGI no están soportados según la información disponible.
- Latencia y throughput: TTFT de 0,78-0,81 s en flujo único; 25,08 tok/s en prosa y 29,85 tok/s en código; prefill de 805-840 tok/s en contexto largo; agregado saturado en 19-23 tok/s con decodificación no batcheada.

## Comparativa con modelos similares

La comparación más directa disponible es con el checkpoint base y con una variante intermedia del mismo autor, todas sobre DeepSeek-V4.1-Flash y ejecutadas en el mismo Mac Studio M3 Ultra de 256 GB:

| Modelo | Cuantizacion | Residente | Prosa (tok/s) | Codigo (tok/s) | TTFT | Contexto verificado |
|---|---|---:|---:|---:|---:|---|
| `Jundot/DeepSeek-V4.1-Flash-oQ3e-mtp` | affine 3-bit paginada | no disponible (239,04 GiB con Engram, no cabe) | 15,45 | 10,18 | 3,53 s | no disponible |
| Variante 14 capas en 2-bit | 14 capas MoE a 2-bit | 217,77 GB | 25,69 | 29,08 | 0,74 s | no disponible |
| Este build | 27 capas MoE a 2-bit | 197,19 GB | 25,08 | 29,85 | 0,78 s | 404.805 tokens |

Frente a alternativas de otros fabricantes de tamaño comparable, la información disponible no permite establecer una comparación fiable: no hay datos de parámetros activos, licencia ni benchmarks de calidad. Las etiquetas `moe` y `apple-silicon` sitúan el modelo en la categoría de MoE de gran tamaño para inferencia local en hardware de Apple, sin competidores documentados en las fuentes consultadas.

## Limitaciones y advertencias

- Licencia no disponible: sin una licencia declarada no puede asumirse permiso de uso comercial. Debe verificarse en el repositorio base antes de cualquier despliegue en producción.
- Discrepancia de parámetros: los metadatos de safetensors indican 94.113.357.090 parámetros, mientras que la model card afirma 763B para el modelo base. El dato de 763B es coherente con los 239 GiB residentes del checkpoint 3-bit, pero la contradicción no está resuelta en la información disponible.
- Dependencia total de Apple Silicon y MLX: no hay ruta de despliegue en CUDA. Queda excluido de cualquier infraestructura basada en GPU NVIDIA o AMD.
- Degradación por cuantización: 27 de 40 capas MoE funcionan a `affine 2-bit`, lo que reduce la fidelidad de los expertos enrutados. El autor documenta que incluir determinadas capas estructurales provocó una caída de aceptación de MTP del 84 % al 58,5 %, señal de la sensibilidad del modelo a la cuantización.
- Concurrencia muy limitada: la decodificación no está batcheada. El agregado satura en 19-23 tok/s y el rendimiento por flujo cae a 2,49 tok/s con 8 peticiones simultáneas, con TTFT de 3,89 s. No es apto para servicio multiusuario.
- Requisitos de configuración frágiles: el ajuste `iogpu.wired_limit_mb` no persiste tras reiniciar; `--initial-cache-blocks 8` es obligatorio (el valor por defecto de 256 provoca SIGKILL al cargar); y usar `python -m omlx.server` en lugar de `omlx.cli serve` desactiva la caché sin aviso claro.
- Coste de prefill elevado en contexto largo: 502,7 s para 404.805 tokens, unos 8,4 minutos de prefill por consulta de ese tamaño.
- Riesgo de alucinación, sesgos conocidos y cobertura idiomática: no disponible. No se documentan idiomas soportados ni evaluaciones de sesgo.
- Sin resultados de benchmarks de calidad: no es posible estimar la degradación real en tareas de razonamiento, matemáticas o conocimiento respecto al checkpoint original.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/drowzeys/keys-Mac-oMLX-0.7.0.dev2-DeepSeek-V4.1-Flash-oQ3e-2b27-CED-MTP
- Modelo base: https://huggingface.co/Jundot/DeepSeek-V4.1-Flash-oQ3e-mtp
- Repositorio GitHub del autor (receta, parches, benchmarks y notas de servicio): https://github.com/drowzeys/keys-Mac-oMLX-0.7.0.dev2-DeepSeek-V4.1-Flash-oQ3e-2b27-CED-MTP
- Runtime oMLX: https://github.com/jundot/omlx
- Papers, blogs o demos adicionales: no disponible en la información proporcionada.
