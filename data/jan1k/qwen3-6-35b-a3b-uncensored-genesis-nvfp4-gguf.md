# jan1k/Qwen3.6-35B-A3B-Uncensored-Genesis-NVFP4-GGUF

## Resumen

Este repositorio es una cuantizacion NVFP4 en formato GGUF del modelo Qwen3.6-35B-A3B-Uncensored-Genesis, publicada por el usuario jan1k. No se trata de un modelo entrenado desde cero, sino de una conversion de pesos: parte del GGUF Q8_K_P (43,6 GB, 10,06 BPW) derivado a su vez del trabajo de LuffyTheFox (reparacion de tensores Genesis) sobre la base no censurada de HauhauCS. El resultado es un unico fichero de aproximadamente 20 GB con 733 tensores, pensado para ejecutarse en llama.cpp y runtimes compatibles con NVFP4.

El modelo subyacente es un MoE de arquitectura `qwen35moe` con 34.660.610.688 parametros totales (etiquetado comercialmente como 35B) y aproximadamente 3B parametros activos por token, distribuidos en 40 capas. La ventana de contexto declarada es de 262.144 tokens. Ademas, incorpora capas de tipo SSM (los nombres de tensor `ssm_norm`, `ssm_conv1d`, `ssm_dt`, `ssm_a` y `ssm_out` aparecen en la politica de proteccion), lo que apunta a una arquitectura hibrida de atencion y espacio de estados, no a un transformer denso convencional. El pipeline declarado es `image-text-to-text`, por lo que admite entrada multimodal mediante un fichero `mmproj` separado.

Su relevancia ahora es doble. Por un lado, explora NVFP4 (formato de 4 bits con escalas UE4M3) como alternativa de cuantizacion agresiva manteniendo en F16/F32 los tensores sensibles. Por otro, documenta un detalle practico poco habitual: las versiones v2 y v3 usaban escalas separadas que LM Studio y Pelican ignoraban, produciendo salida corrupta, y la v4 corrige esto con escalas en linea. El repositorio es muy reciente (creado el 14 de septiembre de 2026) y no registra descargas ni likes en el momento de la consulta.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `qwen35moe` (MoE hibrido con capas SSM), 40 capas |
| Parametros totales | 34.660.610.688 (~34,7 B; el autor lo etiqueta como 35B) |
| Parametros activos | ~3B por token (segun el autor) |
| Longitud de contexto | 262.144 tokens declarados; el ejemplo de uso configura 131.072 |
| Tipos de cuantizacion | NVFP4 (formato principal). El GGUF v4 combina NVFP4 (226 tensores), F16 (175), F32 (331) y Q6_K (1). Origen: Q8_K_P a 10,06 BPW |
| Idiomas soportados | en, zh, multilingual |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (NVFP4 con escalas UE4M3 en linea, sin tensores `.scale`/`.input_scale` separados). Fichero `mmproj` F16 aparte para vision |
| Tamano del repositorio | 21,5 GB (fichero de pesos ~20 GB) |
| `general.file_type` | 39 (`LLAMA_FTYPE_MOSTLY_NVFP4`) |
| MTP / NextN | Ninguno |
| Pipeline | image-text-to-text |
| Descargas / likes | 0 / 0 |
| Fecha de publicacion | 2026-09-14 |

## Arquitectura y entrenamiento

El modelo base sigue una arquitectura MoE con aproximadamente 3B parametros activos sobre 34,7 B totales y 40 capas. La presencia de tensores SSM en la politica de proteccion (`blk.*.ssm_conv1d.weight`, `blk.*.ssm_dt.bias`, `blk.*.ssm_a`, `blk.*.ssm_norm.weight`, `blk.*.ssm_out.weight`) indica un diseno hibrido que combina capas de atencion con capas de espacio de estados, un patron habitual en modelos orientados a contextos muy largos. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron fases de RLHF o DPO en el modelo original de Qwen, ya que la model card de este repositorio solo documenta el proceso de cuantizacion.

El trabajo tecnico de este repositorio es la conversion. Se realiza en dos pasos: primero se convierte el GGUF Q8_K_P a un intermedio F16 (para que el codificador NVFP4 reciba datos sin ruido de cuantizacion Q8_0) y despues se aplica la cuantizacion NVFP4 con `--nvfp4-inline-scales-only`. La innovacion destacable es la politica de proteccion de tensores: se mantienen en F16 cuatro tensores criticos (`blk.0.attn_gate.weight`, `blk.0.attn_qkv.weight`, `blk.0.ffn_down_exps.weight`, `blk.13.ffn_down_exps.weight`) para evitar el colapso singular, se fuerzan a F32 todas las normas 1D y los escalares SSM por compatibilidad con los kernels CUDA, y se fuerza NVFP4 en tres tensores concretos (`blk.0.ssm_out.weight`, `blk.1.attn_gate.weight`, `blk.1.attn_qkv.weight`). El autor indica que la cuantizacion se ejecuto solo en CPU porque el codificador NVFP4 por CUDA se colgaba con arquitecturas MoE.

## Capacidades

- Generacion de texto conversacional y continuacion de contexto largo, con hasta 262.144 tokens declarados.
- Procesamiento multimodal de imagen y texto (`image-text-to-text`) mediante el fichero `mmproj` F16, invocado con el flag `--mmproj` en llama.cpp.
- Soporte multilingue declarado: ingles, chino y etiqueta generica `multilingual`.
- Razonamiento con arquitectura MoE: solo ~3B parametros activos por token, lo que reduce el coste computacional por token frente a un denso de 35B.
- Salida sin censura: el linaje HauhauCS se presenta con "0/465 refusals", es decir, el modelo base no rechaza peticiones que otros modelos filtran.
- Compatibilidad con `--jinja`, lo que habilita el uso de plantillas de chat y el formateo de herramientas en runtimes que lo soporten.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Modo thinking explicito: no disponible en la informacion proporcionada.
- Capacidades de agente multi-paso: no disponible en la informacion proporcionada.

## Casos de uso

- Procesamiento de documentos extensos: con 262.144 tokens de contexto declarados, permite cargar libros tecnicos, expedientes o bases de codigo completas en una sola pasada sin troceado, algo critico en tareas de resumen y extraccion de entidades sobre corpus largos.
- Analisis de imagenes en local: gracias al fichero `mmproj` y al pipeline `image-text-to-text`, se puede construir un asistente que describa capturas, extraiga texto de imagenes o responda preguntas sobre diagramas sin enviar datos a servicios externos.
- Generacion creativa sin restricciones: el linaje no censurado lo hace adecuado para escritura de ficcion, guiones y narrativa que aborden temas que los modelos alineados rechazan, en un entorno controlado por el propio operador.
- Asistente conversacional autoalojado: el requisito de VRAM (~20 GB de pesos) permite desplegarlo en una estacion de trabajo con una sola GPU de 24 GB o en configuraciones con offload parcial de expertos a CPU, evitando dependencias de API.
- Traduccion y procesamiento bilingue ingles-chino: los idiomas declarados cubren los dos mercados tecnicos mas grandes, util para documentacion, soporte o localizacion.
- Investigacion sobre cuantizacion de 4 bits: el repositorio sirve como caso de estudio reproducible de NVFP4 sobre MoE, con el script de `llama-quantize` documentado paso a paso y la lista de proteccion de tensores publicada.
- Evaluacion de arquitecturas hibridas MoE + SSM: util para equipos que quieran medir el comportamiento real de este tipo de capas en contextos largos frente a transformers densos.
- Base para fine-tuning o experimentacion: al ser un GGUF cuantizado no es la via directa para reentrenar, pero el linaje F16/Q8_K_P documentado permite retroceder a precisiones mayores si se necesita.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card no incluye mediciones de MMLU, HumanEval, GSM8K ni de ningun otro conjunto de evaluacion, ni comparaciones numericas con modelos alternativos. Tampoco se publican cifras de latencia o throughput medidas.

## Requisitos de hardware

- VRAM para pesos: el fichero NVFP4 v4 ocupa aproximadamente 20 GB, por lo que es el suelo practico de memoria para los pesos en GPU.
- Fichero `mmproj`: necesario para vision; su tamano no esta listado en la seccion de ficheros del repositorio, por lo que se desconoce el coste adicional exacto.
- Cache KV: el autor recomienda configurar las caches K y V en F16. El consumo exacto a 131.072 tokens no esta publicado y depende del numero de cabezas y capas de atencion, dato no disponible.
- GPU Blackwell (RTX 50xx): ruta FP4 nativa, la mas rapida segun el autor.
- GPU Ampere (RTX 30xx): la inferencia NVFP4 funciona mediante kernels de respaldo, con menor rendimiento.
- GPU consumer: con ~20 GB de pesos, una RTX 4090 (24 GB) o una RTX 5090 (32 GB) pueden alojar el modelo, dejando poco margen para cache KV si se descargan todas las capas. El autor recomienda ademas forzar los pesos MoE a CPU para 40 capas, lo que reduce la VRAM necesaria a costa de latencia.
- Opciones de despliegue confirmadas: llama.cpp (comando `llama-cli` documentado), LM Studio y Pelican (el formato v4 esta disenado especificamente para ellos). Otros runtimes GGUF no se mencionan en la model card.
- Configuracion recomendada: `-ngl 99` (offload maximo a GPU), `--jinja`, `-c 131072`, expertos activos a 8 y caches K/V en F16.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones verificadas de modelos externos comparables en la informacion proporcionada. La comparacion se limita a las variantes del mismo linaje documentadas en la model card:

| Modelo | Relacion | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| jan1k/Qwen3.6-35B-A3B-Uncensored-Genesis-NVFP4 (v4) | Este repositorio | 34,7 B totales / ~3B activos | 262.144 | apache-2.0 | NVFP4 con escalas en linea, ~20 GB, compatible LM Studio |
| jan1k/...-Genesis-Hermes-Final-NVFP4-GGUF | Variante Hermes del mismo autor | no disponible | no disponible | apache-2.0 | Incluye transferencia del finetune Hermes |
| LuffyTheFox/Qwen3.6-35B-A3B-Uncensored-Genesis-Final-GGUF | Base directa de esta cuantizacion | no disponible | no disponible | no disponible | Reparacion de tensores Genesis |
| HauhauCS/Qwen3.6-35B-A3B-Uncensored-HauhauCS-Aggressive | Base del linaje | no disponible | no disponible | no disponible | Presentado por jan1k con "0/465 refusals" |

## Limitaciones y advertencias

- Modelo no censurado por diseno: el linaje declara ausencia de rechazos. Esto implica riesgo real de generar contenido ofensivo, ilegal o danino si no se implementan filtros propios en la capa de aplicacion.
- Sin benchmarks publicos: no hay ninguna medicion objetiva de calidad, razonamiento o codigo. No se puede asumir que la cuantizacion NVFP4 preserve el rendimiento del modelo original sin evaluacion propia.
- Compatibilidad de formato fragil: las versiones v2 y v3 producen salida corrupta en LM Studio y Pelican porque esos runtimes ignoran las escalas separadas. Solo la v4 (con `--nvfp4-inline-scales-only`) es segura para esos entornos.
- Riesgo de alucinacion: no cuantificado ni documentado por el autor.
- Sesgos: no documentados en la informacion disponible. Al tratarse de un modelo entrenado mayoritariamente en ingles y chino, es esperable un rendimiento inferior en castellano, aunque este dato no esta confirmado con evaluaciones.
- Idiomas: solo se declaran en, zh y una etiqueta generica `multilingual`. No hay garantia de calidad en castellano.
- Licencia: apache-2.0 en este repositorio, lo que en principio permite uso comercial. Sin embargo, la licencia del modelo base de Qwen y de los finetunes intermedios (HauhauCS, LuffyTheFox) no se detalla en la informacion proporcionada, por lo que conviene verificarla antes de un despliegue comercial.
- Requisitos de hardware elevados: ~20 GB de pesos mas cache KV limitan el despliegue comodo a GPUs de 24 GB o superiores, o a configuraciones con offload parcial a CPU que degradan la latencia.
- Madurez: el repositorio tiene 0 descargas y 0 likes, y fue creado y actualizado en el mismo dia. No hay evidencia de uso en produccion ni de validacion por terceros.
- Nota sobre los datos: la fecha de publicacion (septiembre de 2026) y el nombre "Qwen3.6" no se corresponden con ningun modelo oficial verificable en la informacion disponible.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/jan1k/Qwen3.6-35B-A3B-Uncensored-Genesis-NVFP4-GGUF
- Variante Hermes del mismo autor: https://huggingface.co/jan1k/Qwen3.6-35B-A3B-Uncensored-Genesis-Hermes-Final-NVFP4-GGUF
- Fuente GGUF de la cuantizacion: https://huggingface.co/LuffyTheFox/Qwen3.6-35B-A3B-Uncensored-Genesis-Final-GGUF
- Modelo base del linaje: https://huggingface.co/HauhauCS/Qwen3.6-35B-A3B-Uncensored-HauhauCS-Aggressive
- Cuantizador utilizado (fork de llama.cpp con soporte NVFP4/MXFP6): https://github.com/michaelw9999/advanced-gguf-quantizer
- Perfil del cuantizador: https://huggingface.co/jan1k
