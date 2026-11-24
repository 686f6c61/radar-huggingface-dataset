# esatapedico/Qwen3.8-27B-Ultimate-Heretic-Uncensored-Turbo-Brilliance-50x-AGI-NEO-NVFP4-W4A16-T400

## Resumen

Qwen3.8-27B-Ultimate-Heretic-Uncensored-Turbo-Brilliance-50x-AGI-NEO-NVFP4-W4A16-T400 es un checkpoint cuantizado en NVFP4 (W4A16) del modelo de 27B denso DavidAU/Qwen3.8-27B-Ultimate-Heretic-Uncensored, un fine-tune de Qwen3.8-27B orientado a generacion sin censura ("heretic") y a razonamiento intensivo ("Turbo-Brilliance-50x-AGI-NEO"). Lo publica el usuario esatapedico, que actua como cuantizador, no como autor del modelo base. El checkpoint esta pensado para servir con vLLM en GPUs Blackwell (sm_120) y sigue el patron de excepciones de tipo JC1DA: cuantiza solo las proyecciones `Linear` del transformer y mantiene en BF16 la torre de vision, el cabezal MTP, `lm_head`, las dinamicas DeltaNet y las normas.

La relevancia tecnica esta en la receta de cuantizacion: 400 tensores NVFP4 empaquetados (MLP de las 64 capas, Q/K/V/O de las 16 capas de atencion completa y las proyecciones DeltaNet de las 48 capas de atencion lineal), con escalas FP8 E4M3, grupo de 16 y cuantizacion weight-only sin corpus de calibracion (datafree). El resultado es un unico shard de 20,59 GB que reduce a la mitad el peso del checkpoint BF16 de 27B, manteniendo intactos los componentes sensibles a la precision.

El modelo base es un hibrido denso de 27B con atencion completa y atencion lineal Gated DeltaNet, torre de vision y cabezal MTP (multi-token prediction) para decodificacion especulativa. La licencia declarada es Apache-2.0. El checkpoint tiene 409 descargas y ningun "like" en el momento de redactar esta ficha, lo que indica una adopcion todavia muy limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido: 16 capas de atencion completa + 48 capas de atencion lineal Gated DeltaNet, con torre de vision y cabezal MTP |
| Parametros totales | 27.781.427.952 (27,78 mil millones) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | NVFP4 W4A16 (pesos 4 bits, activaciones 16 bits, escalas FP8 E4M3, grupo de 16, weight-only, datafree); resto en BF16 |
| Idiomas soportados | Ingles y multilingue (segun tags; lista completa no disponible) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (un unico shard de 20.593.107.888 bytes) con `compressed-tensors` `nvfp4-pack-quantized`; no incluye GGUF en el repo |

## Arquitectura y entrenamiento

El modelo base es un transformer hibrido de 27B denso con dos tipos de capa: 16 capas de atencion completa (con proyecciones Q, K, V y O) y 48 capas de atencion lineal basadas en Gated DeltaNet, que incluyen `in_proj_qkv`, `in_proj_z`, `out_proj`, `conv1d` e `in_proj_a`/`in_proj_b`. Incorpora ademas una torre de vision (el pipeline declarado es image-text-to-text), un cabezal MTP de 15 tensores para decodificacion especulativa y un `lm_head` independiente. Esta estructura hibrida busca reducir el coste de atencion en contextos largos manteniendo calidad en las capas de atencion completa.

Sobre el entrenamiento del modelo base no hay informacion en la model card: se desconoce el numero de tokens, la composicion del dataset, si hubo RLHF/DPO o las tecnicas de alineacion aplicadas. Lo que si documenta el autor del checkpoint es la receta de cuantizacion: 400 tensores `Linear` empaquetados en NVFP4 (192 del MLP en 64 capas, 64 de Q/K/V/O en 16 capas, 144 de DeltaNet en 48 capas), con escalas FP8 E4M3 y grupo de 16, sin calibracion. Se mantienen en BF16 la torre de vision, el cabezal MTP (verificado bit-identico al origen), `lm_head`, `conv1d`, `in_proj_a`/`in_proj_b`, normas y escalas. La innovacion destacable es la preservacion del MTP en BF16 para no romper la decodificacion especulativa en vLLM, y la decision de no cuantizar `lm_head` porque ninguna version de vLLM carga un cabezal NVFP4 de compressed-tensors.

## Capacidades

- Generacion de texto conversacional multi-turno en ingles y otros idiomas (multilingue segun tags).
- Procesamiento de imagen y texto (pipeline `image-text-to-text`), con torre de vision en BF16.
- Razonamiento intensivo segun el tune "Turbo-Brilliance-50x-AGI-NEO" del modelo base; el autor no detalla que capacidades concretas anade el tune.
- Decodificacion especulativa mediante cabezal MTP conservado en BF16, compatible con vLLM.
- Generacion sin censura ("uncensored"/"heretic") segun la denominacion del modelo base; no se documenta el alcance real del desbloqueo.
- Tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Modo thinking explicito: no disponible en la informacion proporcionada.

## Casos de uso

- Servicio de inferencia en GPU Blackwell con vLLM: el checkpoint esta disenado especificamente para sm_120 y `--quantization compressed-tensors`, de modo que se puede desplegar en produccion con un unico shard de 20,59 GB y aprovechar el ahorro de VRAM frente al BF16.
- Decodificacion especulativa de alto throughput: al conservar el cabezal MTP en BF16, el modelo puede usar multi-token prediction en vLLM para aumentar tokens por segundo en cargas de generacion larga.
- Procesamiento de documentos con imagen: la torre de vision intacta permite tareas image-text-to-text (descripcion, extraccion de datos de capturas o formularios) sin degradacion por cuantizacion.
- Investigacion sobre cuantizacion NVFP4: sirve como referencia reproducible de una receta W4A16 datafree con 400 tensores y excepciones documentadas, util para comparar con la variante de 256 tensores del mismo autor.
- Generacion creativa sin filtros: el caracter "uncensored" del tune base lo hace adecuado para entornos controlados de escritura creativa o roleplay donde los filtros estandar resultan limitativos.
- Evaluacion comparativa de checkpoints cuantizados: al publicarse junto a la variante NVFP4 de 256 tensores, permite medir el impacto de una receta mas agresiva (400 tensores) sobre calidad y latencia en el mismo modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo documenta verificaciones de integridad del checkpoint: censo de 400 de 400 objetivos `Linear` empaquetados, 15 tensores MTP presentes en BF16 y bit-identicos al origen, preflight PASS y tamano total de 20.593.107.888 bytes en un unico shard.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint pesa 20,59 GB en disco; en vLLM hay que sumar cache KV y overhead del runtime, por lo que se recomienda un minimo de 24-32 GB de VRAM efectiva.
- GPU recomendadas: Blackwell sm_120 (RTX 50xx, B200) por el soporte nativo de NVFP4; el autor indica explicitamente Blackwell como plataforma objetivo.
- Cabe en GPU de consumo: si, en tarjetas Blackwell con 24 GB o mas (por ejemplo RTX 5090 de 32 GB), siempre que se ajuste la longitud de contexto y el numero de secuencias concurrentes.
- Opciones de despliegue: vLLM con `--quantization compressed-tensors` (autodetectado desde la config); el tag incluye llama.cpp pero el repo no contiene GGUF, por lo que llama.cpp exigiria una conversion aparte no incluida.
- FP8 KV cache: disponible como flag de runtime en vLLM, no como bytes del checkpoint.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| Este checkpoint (NVFP4 W4A16 T400) | 27,78B | no disponible | NVFP4 W4A16, 400 tensores | Apache-2.0 | Solo safetensors, orientado a vLLM/Blackwell |
| esatapedico/...-NVFP4 (256 tensores) | 27,78B | no disponible | NVFP4, 256 tensores | Apache-2.0 | Misma base, receta mas conservadora |
| DavidAU/Qwen3.8-27B-Ultimate-Heretic-Uncensored | 27B | no disponible | BF16 | Apache-2.0 | Modelo base sin cuantizar |
| Qwen3.8-27B (original) | 27B | no disponible | BF16 y otras | no disponible | Modelo de partida del tune; sin datos de benchmark en la informacion disponible |

## Limitaciones y advertencias

- La model card no documenta sesgos del modelo base ni del tune; el caracter "uncensored" implica que puede generar contenido que otros modelos rechazan, con el riesgo reputacional y legal que ello conlleva.
- Riesgo de alucinacion no cuantificado: no hay benchmarks de veracidad ni de razonamiento en la informacion disponible.
- La cuantizacion datafree (sin calibracion) puede degradar la calidad frente al BF16 original; no se aportan metricas de degradacion.
- Dependencia fuerte de vLLM y de GPUs Blackwell: el checkpoint no incluye GGUF y no se garantiza su carga en otras plataformas o versiones de vLLM.
- La licencia Apache-2.0 se hereda del modelo base, pero el uso comercial de un tune "heretic" conviene revisarlo con atencion por el contenido que puede producir.
- Longitud de contexto e idiomas exactos no disponibles: la ficha multilingue es generica y no se detalla cobertura por idioma.
- Adopcion muy baja (409 descargas, 0 likes) y sin validacion independiente conocida; tratar como experimental.
- El nombre del repositorio acumula terminos de marketing ("AGI-NEO", "Brilliance-50x") sin respaldo tecnico documentado.

## Enlaces

- Hugging Face: https://huggingface.co/esatapedico/Qwen3.8-27B-Ultimate-Heretic-Uncensored-Turbo-Brilliance-50x-AGI-NEO-NVFP4-W4A16-T400
- Variante de 256 tensores: https://huggingface.co/esatapedico/Qwen3.8-27B-Ultimate-Heretic-Uncensored-Turbo-Brilliance-50x-AGI-NEO-NVFP4
- Modelo base: https://huggingface.co/DavidAU/Qwen3.8-27B-Ultimate-Heretic-Uncensored
- Sitio del autor del checkpoint: https://www.esatapedico.com
