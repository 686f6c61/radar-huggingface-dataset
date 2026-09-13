# keenanpepper/Kimi-K2.6-FP8-fused

## Resumen

Kimi-K2.6-FP8-fused es un reempaquetado del checkpoint RedHatAI/Kimi-K2.6-FP8-BLOCK publicado por el usuario keenanpepper, cuyo unico objetivo es que el modelo pueda cargarse y ejecutarse con `transformers` estandar en un unico nodo de 8xH200. No se modifica ni un byte de peso ni una escala: se renombran 69.486 tensores de escala del convenio `compressed-tensors` de bloque al convenio `finegrained_fp8` de DeepSeek, y se fusionan previamente los tensores por experto de las 60 capas MoE con expertos.

El problema que resuelve es de empaquetado, no de modelado. El checkpoint original de Moonshot AI es int4 con `compressed-tensors` (~571 GB de expertos empaquetados) y no existe kernel equivalente en `transformers`, por lo que su ruta generica descomprime todo el modelo a bf16 en memoria (unos 2 TB residentes frente a los 1128 GB de un nodo de 8xH200). El checkpoint FP8 de RedHat usa escalas de bloque 128x128, pero el kernel `CompressedTensorsFP8Linear` de `transformers` solo soporta escalado por filas, de modo que tambien cae en la ruta de descompresion completa. Esta ficha cubre la variante que si encaja en la ruta FP8 nativa.

Se distribuye bajo licencia modified-mit, ocupa 1.031 GB en el repositorio y declara 1.026.941.307.888 parametros totales (aproximadamente 1,027 billones). Esta dirigido a equipos que necesitan K2.6 dentro de `transformers` para trabajo de interpretabilidad, registro de activaciones y del flujo residual, decodificacion personalizada y experimentos de cache; para servir tokens en produccion se recomienda vLLM o SGLang con el checkpoint original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con atencion MLA (nombres `q_a_proj`, `kv_a_proj_with_mqa`) y vision tower + `mm_projector` para entrada de imagen |
| Parametros totales | 1.026.941.307.888 (segun safetensors) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP8 `finegrained_fp8` con `weight_block_size: [128, 128]`, pesos `float8_e4m3fn`, escalas en fp32 y `activation_scheme: dynamic`. Modulos excluidos de cuantizar: `mlp.gate`, `lm_head`, `q_a_proj`, `kv_a_proj_with_mqa`, `model.vision_tower`, `model.mm_projector`, `embed_tokens` |
| Idiomas soportados | no disponible |
| Licencia | modified-mit (declarada como `license: other`, `license_name: modified-mit`) |
| Formato de pesos | safetensors |
| Capas | 61 (capa 0 densa, 60 capas con expertos) |
| Expertos por capa MoE | 384 |
| Dimension oculta | 7168 |
| Dimension intermedia por experto | 2048 |
| Tamano del repositorio | 1031,0 GB |
| Clase nativa en transformers | `kimi_k25` (`auto_map` eliminado del `config.json`) |

## Arquitectura y entrenamiento

Se trata de un transformer de tipo MoE con atencion MLA, en la linea del tag `deepseek_v3` declarado por el autor. Los tensores publicados permiten reconstruir la geometria: 61 capas, de las cuales la capa 0 es densa y las 60 restantes contienen 384 expertos cada una, con dimension oculta de 7168 y dimension intermedia por experto de 2048. La ruta de atencion usa las proyecciones `q_a_proj` y `kv_a_proj_with_mqa`, propias del esquema de atencion con latentes comprimidos, y el enrutador (`mlp.gate`) se mantiene fuera de la cuantizacion FP8. El pipeline declarado es `image-text-to-text`, con un `vision_tower` y un `mm_projector` que tambien quedan fuera de la cuantizacion.

No ha habido entrenamiento adicional: este repositorio es un reempaquetado de RedHatAI/Kimi-K2.6-FP8-BLOCK (revision `317300b0ef4ec429ad7296b46e4278ab1922dd08`), aplicado en dos pasos. El primero, `tools/fp8_relabel.py`, renombra 69.486 tensores de escala de `<proj>.weight_scale` a `<proj>.weight_scale_inv` y los convierte de bf16 a fp32 mediante un upcast exacto, manteniendo la forma `[ceil(out/128), ceil(in/128)]` y sustituyendo el bloque `quantization_config` por `quant_method: fp8`, `weight_block_size: [128, 128]` y `activation_scheme: dynamic`. El segundo, `tools/fp8_fuse_experts.py`, apila y concatena en CPU los 52.992 tensores por experto para producir 92 tensores fusionados: `mlp.experts.gate_up_proj` con forma `[384, 4096, 7168]` en `float8_e4m3fn`, `mlp.experts.gate_up_proj_scale_inv` con forma `[384, 32, 56]` en float32, `mlp.experts.down_proj` con forma `[384, 7168, 2048]` en `float8_e4m3fn` y `mlp.experts.down_proj_scale_inv` con forma `[384, 56, 16]` en float32.

La innovacion practica es evitar el pico transitorio de memoria de `MergeModulelist` durante la carga: apilar 384 x 2048 x 7168 en FP8 supone 5,25 GiB por mitad de la proyeccion, construidos en la GPU donde caiga la capa. Al enviar el tensor ya fusionado en el checkpoint, ese pico desaparece. El autor documenta que, sin fusionar, la carga en un nodo de 8xH200 se completaba aproximadamente una vez de cada seis, con una fragmentacion del asignador medida de 6,70-7,27 GiB frente a un umbral de 6,68 GiB. La procedencia queda registrada en `RELABEL.json` y `FUSE.json`.

## Capacidades

- Generacion de texto y conversacion multi-turno mediante la clase nativa `kimi_k25` de `transformers`.
- Entrada multimodal imagen-texto a traves del `vision_tower` y el `mm_projector`, que se conservan sin cuantizar en FP8.
- Ejecucion de un MoE de 384 expertos por capa con enrutador en precision no cuantizada.
- Instrumentacion directa de modulos: al ser un checkpoint nativo de `transformers`, permite enganchar hooks en capas y expertos concretos para registrar activaciones y el flujo residual.
- Experimentacion con decodificacion personalizada, Politicas de muestreo y gestion de cache KV sin depender de un motor de servicio externo.
- Soporte de tool calling / function calling: no documentado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado en la informacion disponible.
- Capacidades multilingues: no documentadas en la informacion disponible.
- Modo de razonamiento explicito (thinking), audio u otras capacidades especiales: no documentadas en la informacion disponible.

## Casos de uso

- Investigacion de interpretabilidad: al cargar de forma nativa en `transformers`, se pueden registrar las activaciones de las 60 capas MoE y del flujo residual, y analizar el comportamiento de los 384 expertos por capa sin intermediacion de un motor de inferencia opaco.
- Auditoria de integridad del empaquetado: los ficheros `RELABEL.json` y `FUSE.json` y los scripts de `tools/` permiten verificar que cada byte FP8 y cada escala de bloque del checkpoint son identicos a los de RedHatAI, lo que sirve como caso de estudio de cadena de procedencia en artefactos cuantizados.
- Experimentos de decodificacion personalizada y cache: la arquitectura MLA y la carga nativa permiten sustituir la gestion de cache latente y probar estrategias alternativas de atencion sin reescribir kernels.
- Validacion de kernels FP8: el repositorio enfrenta el convenio de bloque 128x128 con la ruta FP8 de `transformers`, por lo que es util para reproducir y depurar la discrepancia entre escalado por filas y escalado por bloques.
- Prototipado multimodal de investigacion: el pipeline `image-text-to-text` con `vision_tower` y `mm_projector` en precision completa permite estudiar la fusion de modalidades en un MoE de gran escala.
- Generacion de texto conversacional a gran escala en entornos de investigacion, aceptando el coste de memoria y latencia a cambio de acceso total a los pesos y a la estructura interna.
- Reproduccion de evaluaciones: dado que los bytes son identicos a los del checkpoint de RedHat, cualquier evaluacion publicada sobre esa cuantizacion puede reproducirse sobre este repositorio sin cambios de numeros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que, al ser los bytes FP8 y las escalas de bloque identicos a los del checkpoint RedHatAI/Kimi-K2.6-FP8-BLOCK, las evaluaciones publicadas por RedHatAI sobre esa cuantizacion se aplican sin cambios, pero no se incluyen cifras concretas (MMLU, HumanEval, GSM8K u otros) en la informacion proporcionada.

## Requisitos de hardware

- Almacenamiento: el repositorio ocupa 1031,0 GB, coherente con 1.026.941.307.888 parametros en FP8 mas las escalas en fp32.
- VRAM estimada para inferencia: el checkpoint esta disenado para caber en un unico nodo de 8xH200 (1128 GB). No se dispone de estimaciones para otras configuraciones.
- GPU recomendadas: NVIDIA H200 en configuracion de 8 unidades. No hay datos publicados para A100, H100 u otras.
- GPU de consumo: no cabe. Un modelo de ~1,027 billones de parametros en FP8 excede cualquier VRAM de consumo disponible.
- Opciones de despliegue: `transformers` nativo con la clase `kimi_k25` es el unico objetivo de este repositorio. Para servir tokens, el autor recomienda vLLM o SGLang usando el checkpoint int4 original o el FP8-BLOCK, que son mas rapidos y estan mejor probados para ese fin.
- Fragmentacion y margen de memoria: sin la fusion previa de expertos, el autor midio 6,70-7,27 GiB de fragmentacion del asignador frente a un umbral de 6,68 GiB, con exito aproximadamente una vez de cada seis. La version fusionada elimina ese pico transitorio de 5,25 GiB por mitad de la proyeccion.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Cuantizacion y formato | Carga nativa en transformers | Tamano de pesos | Licencia |
|---|---|---|---|---|
| keenanpepper/Kimi-K2.6-FP8-fused | FP8 `finegrained_fp8`, bloque 128x128, expertos pre-fusionados, safetensors | Si | 1031,0 GB de repositorio | modified-mit |
| RedHatAI/Kimi-K2.6-FP8-BLOCK | FP8 de bloque con envoltorio `compressed-tensors` | No: el kernel FP8 de `transformers` es solo por filas y cae en la ruta de descompresion completa | no disponible | no disponible |
| moonshotai/Kimi-K2.6 | int4 `compressed-tensors`, ~571 GB de expertos empaquetados | No: sin kernel W4A16, descomprime a bf16 y requiere unos 2 TB residentes | ~571 GB de expertos empaquetados | no disponible |

Los tres checkpoints comparten la misma geometria de modelo (61 capas, 384 expertos por capa MoE). La diferencia entre ellos es exclusivamente el contenedor de cuantizacion y el formato de las escalas. No se dispone de datos de contexto, rendimiento o licencia de las variantes alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- Es un reempaquetado, no un modelo afinado: hereda sin cambios cualquier sesgo, limitacion de idioma o tendencia a la alucinacion del checkpoint original de Kimi K2.6, none de los cuales se documenta en la informacion disponible.
- Requisito de memoria extrema: el modelo necesita aproximadamente 1 TB de pesos y esta pensado para un nodo de 8xH200; cualquier configuracion menor fallara por OOM.
- Restricciones de licencia: la licencia se declara como `other` con nombre `modified-mit`. Al ser una licencia modificada, conviene revisar el fichero `LICENSE` antes de cualquier uso comercial, ya que puede incorporar condiciones adicionales no reflejadas en el identificador.
- Trampa silenciosa en la carga: el nombre de la escala fusionada es `gate_up_proj_scale_inv`, un parametro hermano, y no `gate_up_proj.weight_scale_inv`. Si el nombre no coincide, el proceso de carga no lanza error: la clave aparece como UNEXPECTED, el parametro como MISSING y las escalas quedan sin inicializar en memoria.
- No es la via recomendada para produccion: el propio autor indica que quien solo necesite tokens de salida use vLLM o SGLang con los checkpoints originales, que son mas rapidos y estan mejor probados.
- Validacion comunitaria muy escasa: 48 descargas y 0 likes en el momento de la consulta.
- Sin datos publicos de benchmarks, idiomas soportados, longitud de contexto ni numero de parametros activos en la informacion disponible.
- Los resultados de busqueda web consultados no contienen informacion relevante sobre este modelo; los enlaces devueltos corresponden a servicios de video y no guardan relacion con el artefacto.

## Enlaces

- Repositorio del modelo: https://huggingface.co/keenanpepper/Kimi-K2.6-FP8-fused
- Checkpoint base (cuantizacion de la que deriva): https://huggingface.co/RedHatAI/Kimi-K2.6-FP8-BLOCK
- Modelo original de Moonshot AI: https://huggingface.co/moonshotai/Kimi-K2.6
- `RELABEL.json` (procedencia del renombrado de escalas): https://huggingface.co/keenanpepper/Kimi-K2.6-FP8-fused/blob/main/RELABEL.json
- `FUSE.json` (procedencia de la fusion de expertos): https://huggingface.co/keenanpepper/Kimi-K2.6-FP8-fused/blob/main/FUSE.json
- Scripts de conversion (`tools/`): https://huggingface.co/keenanpepper/Kimi-K2.6-FP8-fused/tree/main/tools
- Model card original de RedHatAI conservada como `UPSTREAM_README.md`: https://huggingface.co/keenanpepper/Kimi-K2.6-FP8-fused/blob/main/UPSTREAM_README.md
- No se encontraron enlaces adicionales relevantes (papers, blogs o demos) en la busqueda web realizada.
