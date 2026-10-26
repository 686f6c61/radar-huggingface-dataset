# ntmcgee/Orca-Qwen3.8-Flash-Next-W4A16-Merlin

## Resumen

Orca-Qwen3.8-Flash-Next-W4A16-Merlin es una derivación cuantizada y "abliterated" del modelo multimodal Qwen3.8-Flash-Next de Alibaba Qwen, publicada por el usuario ntmcgee. No se trata de un entrenamiento nuevo: es un reempaquetado tensor a tensor del checkpoint sin censura de orcarouter dentro del layout Merlin W4A16 de halt95, de forma que puede servirse con el motor Merlin 3.0.0 sobre cuatro RTX 3090 manteniendo la ventana completa de 262.144 tokens. Los expertos enrutados proceden de la cuantización AutoRound INT4 de Mochgolf sobre los mismos pesos, repackados desde auto_gptq a compressed-tensors.

El interés práctico está en la ingeniería de despliegue: consigue un modelo de 182.076.161.939 parámetros (arquitectura MoE híbrida con atención y capas GDN, más cabezas de predicción multi-token para decodificación especulativa) en 123,8 GB de pesos, con un pico de VRAM medido de 21,97–22,61 GB por tarjeta. Combina INT4 simétrico g128 en expertos, INT8 por canal en las proyecciones GDN, FP8 E4M3 en la tabla PLE y BF16 en atención, routers, expertos compartidos, visión y embeddings, con escalas KV en FP8 recalibradas específicamente para este checkpoint.

Es relevante ahora porque demuestra que un modelo de esta escala, con visión y contexto largo, cabe en hardware Ampere de consumo profesional (4× RTX 3090) sin parches locales, a 136,5 tok/s en decodificación de un solo stream con MTP K=3. El precio es que se renuncia a cualquier alineación de seguridad: el modelo no rechaza peticiones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE híbrido con capas GDN (proyecciones `in_proj_qkv`, `in_proj_z`, `out_proj`), expertos enrutados y compartidos, torre visual y cabezas MTP (multi-token prediction) para decodificación especulativa |
| Parametros totales | 182.076.161.939 (dato real de safetensors) |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 tokens (ventana completa soportada por el build) |
| Tipos de cuantizacion | INT4 simétrico g128 en expertos enrutados (AutoRound, escalas BF16); INT4 simétrico g128 RTN en expertos draft MTP; INT8 por canal RTN en proyecciones GDN (escala con suelo en 1e-8); FP8 E4M3 con escala global BF16 (amax/448) en la tabla PLE; BF16 en atención, expertos compartidos, routers, visión y embeddings; KV cache en FP8 con escalas calibradas en este checkpoint |
| Idiomas soportados | en (inglés) |
| Licencia | qwen-community-1.0 (Qwen Community License 1.0) |
| Formato de pesos | safetensors con compressed-tensors (pack-quantized, W4A16); shards por capa `model-dense-L*`, `model-experts-L*`, `model-plefp8-*`, `model-top`, `model-visual`, `model_extra_tensors`, `mtp-routed-experts-int4` |
| Tamano del repositorio | 123,8 GB |
| Tarea (pipeline) | image-text-to-text (multimodal, entrada de imagen y texto) |
| Libreria / motor | vLLM (fork Merlin 3.0.0, basado en vLLM 0.32.0, perfil `fn-quad-3090`) |
| Modelos base | Qwen/Qwen3.8-Flash-Next; orcarouter/Qwen3.8-Flash-Next-Uncensored; Mochgolf/Qwen3.8-Flash-Next-Uncensored-W4A16-AutoRound-INT8PLE-MTP; halt95/Qwen3.8-Flash-Next-W4A16-Merlin |
| Autor | ntmcgee |
| Fecha de publicacion | 2026-10-26 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3.8-Flash-Next: un transformer con mezcla de expertos (MoE) en el que conviven capas de atención clásica, capas GDN con proyecciones cuantizadas de forma independiente y una tabla PLE (n-gram) que actúa como memoria léxica externa. Incluye además un módulo MTP con expertos draft propios, empleado para decodificación especulativa con K=3, y una torre visual que habilita la entrada de imágenes. Este repositorio no entrena nada: redistribuye pesos. La procedencia tensor a tensor está documentada en `PROVENANCE.txt`, y el config, los nombres de tensor (227.569) y el layout de ficheros coinciden con `halt95/Qwen3.8-Flash-Next-W4A16-Merlin@d9d99c3`; todo tensor que orcarouter no modificó es byte a byte idéntico a ese build, con auditoría en `audit_vs_halt95.py`.

La parte de cuantización sí es trabajo propio. Los expertos enrutados provienen de la receta AutoRound de Intel (versión 0.15.0, 200 iteraciones, calibración de 128 muestras × 2.048 tokens sobre pile-10k) aplicada por Mochgolf sobre orcarouter@d9dbbb7f, y aquí se han repackado de auto_gptq a compressed-tensors. Las proyecciones GDN se cuantizan a INT8 por canal por round-to-nearest, la tabla PLE a FP8 E4M3 con una única escala global y los expertos draft MTP a INT4 RTN. Las escalas FP8 del KV cache se recalibraron sobre este checkpoint con tráfico sintético de 2K a 255K tokens e imágenes, con margen de 1,10, y se publican en `qsa_kv_scales.json`. El error relativo medio de cuantización de expertos (decuantizado frente a BF16) es de 0,108 / 0,107 / 0,106 para gate/up/down, frente a 0,116 / 0,115 / 0,112 con round-to-nearest simple sobre las mismas matrices.

No hay información disponible sobre el dataset de preentrenamiento original, el número de tokens, ni sobre si el modelo base empleó RLHF o DPO. La remoción de rechazos proviene del derivado abliterated de orcarouter, no de este repositorio.

## Capacidades

- Generación de texto y razonamiento multi-turno con hasta 262.144 tokens de contexto, verificado con recuperación de aguja ("needle") a 25K, 99K, 156K y 249K tokens.
- Entrada multimodal imagen-texto: pipeline `image-text-to-text` con torre visual conservada en BF16.
- Generación de código: perplejidad de 1,87 en el conjunto de código empleado por el autor, y 98,0% en GSM8K-250 con 5 disparos sin modo pensamiento.
- Tool calling y function calling: validado con 52 sesiones concurrentes y multi-turno de agentes con tool calling, sin errores HTTP ni corrupción de salida.
- Razonamiento agéntico multi-paso y modo pensamiento con esfuerzo de razonamiento configurable (Merlin fija `medium` por defecto).
- Decodificación especulativa mediante MTP con K=3, integrada en el motor, que aproximadamente duplica el throughput frente a MTP desactivado.
- Caché de prefijo (prefix caching) y RecoverSSM habilitados por defecto en el perfil de despliegue.
- Multilingüe: limitado a inglés según la model card; no se declaran otros idiomas.
- Sin censura: cero rechazos en 10 pruebas de sondeo del autor.

## Casos de uso

- Análisis de documentación técnica extensa con imágenes intercaladas: gracias a los 262.144 tokens de contexto y a la entrada visual, se puede introducir un manual completo con diagramas y hacer preguntas sobre secciones concretas sin trocear el documento.
- Agente de automatización con tool calling: el modelo ha superado 52 sesiones concurrentes de agentes con cero errores HTTP, por lo que es adecuado para orquestar llamadas a APIs externas en flujos multi-paso con estado persistente en contexto largo.
- Asistencia a la programación en producción: con perplejidad de código de 1,87 y soporte de function calling, encaja en pipelines de revisión automática, generación de parches o rellenado de tests dentro de CI/CD.
- Investigación sobre alineación y seguridad: al ser un derivado abliterated sin rechazos, sirve como sujeto de estudio para medir comportamientos, evaluar técnicas de filtrado posteriores o comparar contra el modelo base alineado.
- Red teaming y auditoría de filtros: permite generar respuestas que el modelo base rechazaría, útil para construir conjuntos de evaluación de sistemas de moderación (con el filtrado externalizado en la aplicación).
- Procesamiento por lotes sensible al coste en hardware propio: con 21,97–22,61 GB de VRAM por tarjeta en cuatro RTX 3090, se puede montar un servicio interno de inferencia sin depender de APIs de terceros.
- Extracción de información estructurada de capturas, formularios o figuras: la combinación de visión y contexto largo permite procesar lotes de imágenes con instrucciones extensas en una sola petición.
- Evaluación comparativa de cuantizaciones: el repositorio incluye el conversor, la auditoría de identidad de bytes y el driver de calibración KV, por lo que sirve como referencia metodológica para reproducir el pipeline (aunque con rutas de la máquina original).

## Benchmarks y rendimiento

Medidos por el autor sobre 4× RTX 3090, comparando contra el build anterior en la misma máquina (un checkpoint AWQ de leoncca recuantizado sobre Merlin v2.5.2 con parches):

| Metrica | Este build | Build anterior |
|---|---|---|
| Perplejidad WikiText-2 | 3,67 | 6,07 |
| Perplejidad en código | 1,87 | 2,66 |
| GSM8K-250, 5-shot, sin pensamiento | 98,0% flexible / 98,0% estricto | 95% / 77% (primeros 100) |
| Recuperación de aguja a 25K / 99K / 156K / 249K | encontrada en todos | encontrada en todos (hasta 156K) |
| Rechazos | 0/10 | 0/10 |
| Decodificación, 1 stream, sin pensamiento | 136,5 tok/s (MTP K=3) | 70 tok/s (MTP off) |
| VRAM pico por tarjeta bajo carga | 21,97–22,61 GB | 23,36–24,09 GB |
| Sesiones de agentes concurrentes | 52 sin errores HTTP | no disponible |

Error de cuantización de expertos (error relativo medio, decuantizado frente a BF16):

| Metodo | gate | up | down |
|---|---|---|---|
| AutoRound | 0,108 | 0,107 | 0,106 |
| Round-to-nearest simple | 0,116 | 0,115 | 0,112 |

No se han publicado resultados de MMLU, HumanEval ni otros benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM: el perfil de referencia son 4× RTX 3090 (24 GB cada una), con pico medido de 21,97–22,61 GB por tarjeta bajo carga y `--gpu-memory-utilization 0.80` para dejar unos 2 GB libres por tarjeta.
- No cabe en una sola GPU de consumo. Los 123,8 GB de pesos requieren agregación multi-GPU; no se documenta ninguna configuración de 1× GPU.
- GPU recomendadas: RTX 3090 (Ampere) como plataforma validada. No se ha verificado el funcionamiento en A100, H100, RTX 4090 ni otras arquitecturas; el autor etiqueta el build explícitamente para Ampere y `rtx-3090`.
- Memoria de host: el worker PLE mantiene unos 46 GB residentes y el lanzador requiere aproximadamente 69 GiB disponibles al arrancar. Es un requisito de RAM de sistema, no de VRAM, y conviene no pasarlo por alto.
- Almacenamiento: el arranque tarda unos 4 minutos desde NVMe; con almacenamiento más lento el tiempo de carga aumentará.
- Pool KV: con `KV_BYTES=1.95e9` por rank se obtiene un pool de 438K tokens; Merlin sirve 4,1e9 por defecto. El valor reducido es deliberado para liberar VRAM.
- Despliegue: el soportado es el motor Merlin 3.0.0 (tag `merlin-v3.0.0`, fork de vLLM 0.32.0, perfil `fn-quad-3090`) lanzado por Docker con `--shm-size 8g` y `--ulimit memlock=-1`. El lanzador lee automáticamente el `qsa_kv_scales.json` del checkpoint.
- No se documenta soporte para llama.cpp, Ollama, TGI ni GGUF; el formato compressed-tensors W4A16 está ligado a vLLM y sus forks.
- Throughput: 136,5 tok/s en decodificación de un solo stream sin modo pensamiento con MTP K=3. No se publican cifras de throughput agregado con lotes grandes.
- Plantilla de chat: por defecto se usa la Qwen3.8 chat template v22.5 de Froggeric incluida en Merlin; el repositorio incluye además su propio `chat_template.jinja` para servir sin Merlin.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este build (ntmcgee/Orca-...-Merlin) | 182,08 B | 262.144 | W4A16 mixto (INT4/INT8/FP8/BF16) | Qwen Community 1.0 | HuggingFace, 0 descargas |
| Qwen/Qwen3.8-Flash-Next | no disponible (misma arquitectura) | 262.144 (heredado) | BF16 | Qwen Community 1.0 | HuggingFace (oficial) |
| orcarouter/Qwen3.8-Flash-Next-Uncensored | no disponible | no disponible | BF16 | Apache-2.0 según tag del repo | HuggingFace |
| Mochgolf/...-W4A16-AutoRound-INT8PLE-MTP | no disponible | no disponible | W4A16 AutoRound INT4 + INT8 PLE | Qwen Community 1.0 | HuggingFace |
| halt95/Qwen3.8-Flash-Next-W4A16-Merlin | no disponible | 262.144 (layout de referencia) | W4A16 | Qwen Community 1.0 | HuggingFace |

Las tres alternativas de la comparativa comparten la misma arquitectura base y, por tanto, el mismo recuento de parámetros; no se dispone de cifras independientes de parámetros activos ni de benchmarks propios para ellas. Tampoco se dispone de datos de modelos comparables de otros fabricantes en la información proporcionada.

## Limitaciones y advertencias

- Ausencia total de alineación de seguridad: es un derivado abliterated, con 0 rechazos en 10 pruebas. El propio autor declara que el modelo no rechaza peticiones y traslada al despliegue la responsabilidad del filtrado.
- Sesgos: no se documenta ninguna evaluación de sesgos, toxicidad o equidad. Al no haber filtrado, es esperable que reproduzca y amplifique sesgos presentes en los datos originales.
- Alucinación: no se han publicado métricas de fidelidad factual (TruthfulQA, HaluEval ni similares). El contexto de 262.144 tokens reduce el riesgo en tareas de recuperación, pero no lo elimina.
- Idioma: solo inglés declarado. El comportamiento en castellano no está evaluado y no debería asumirse.
- Contexto: la recuperación de aguja se verificó hasta 249K tokens; el resto de tareas de razonamiento sobre contextos muy largos no está evaluada, y la calidad agregada en ventanas extremas suele degradarse.
- Licencia: Qwen Community License 1.0, que exige mostrar el nombre del modelo de forma prominente en productos o servicios con más de 100 millones de usuarios activos mensuales o más de 20 millones de dólares de ingresos mensuales. Conviene revisar además la compatibilidad entre la licencia del derivado y el tag Apache-2.0 del repositorio de orcarouter antes de un uso comercial.
- Portabilidad: el checkpoint está construido y validado exclusivamente para Merlin 3.0.0 sobre 4× RTX 3090. No hay garantía de funcionamiento en otros forks de vLLM ni en GPUs Hopper o Ada; las escalas KV y el layout están calibrados para este build.
- Requisitos de host poco habituales: ~46 GB de RAM residentes y ~69 GiB al arrancar limitan el número de instancias por máquina.
- Las herramientas de `recipe/` (conversor, auditoría, calibración) asumen rutas de la máquina original del autor. Deben tratarse como documentación reproducible en lectura, no como un pipeline listo para ejecutar.
- Cifras de benchmarks generadas por el propio autor, con scripts propios y sin replicación independiente. Las comparaciones contra el "build anterior" emplean conjuntos parciales (GSM8K sobre los primeros 100 en el caso previo), por lo que no son estrictamente homogéneas.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay validación por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ntmcgee/Orca-Qwen3.8-Flash-Next-W4A16-Merlin
- Modelo base oficial: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Derivado sin censura (orcarouter): https://huggingface.co/orcarouter/Qwen3.8-Flash-Next-Uncensored
- Cuantización AutoRound de referencia (Mochgolf): https://huggingface.co/Mochgolf/Qwen3.8-Flash-Next-Uncensored-W4A16-AutoRound-INT8PLE-MTP
- Layout Merlin de referencia (halt95): https://huggingface.co/halt95/Qwen3.8-Flash-Next-W4A16-Merlin
- Motor Merlin (fork de vLLM): https://github.com/halt95/merlin-engine
- Licencia Qwen Community 1.0: fichero `LICENSE` del repositorio

No se han encontrado en la búsqueda web papers, blogs, demos ni repositorios adicionales asociados a este modelo.
