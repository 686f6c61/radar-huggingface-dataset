# jan1k/Qwen3.6-35B-A3B-Uncensored-Genesis-NVFP4-GGUF

## Resumen
Qwen3.6-35B-A3B-Uncensored-Genesis-NVFP4-GGUF es una cuantizacion NVFP4 (FP4 de 4 bits con escalas UE4M3) del modelo Qwen3.6-35B-A3B en su variante sin censura, publicada por el usuario jan1k. Parte de la arquitectura `qwen35moe`, un transformer de mezcla de expertos con 34.660.610.688 parametros totales y aproximadamente 3B activos por token, distribuidos en 40 capas, con una longitud de contexto de 262.144 tokens. El modelo base es la reparacion de tensores "Genesis" de LuffyTheFox sobre el finetune sin censura de HauhauCS, y esta variante concreta es la version no-Hermes.

El interes practico esta en el formato: frente a las cuantizaciones GGUF convencionales (Q4_K_M, Q8_0), esta emplea NVFP4 con escalas inline UE4M3, pensado para aprovechar la ruta nativa FP4 de las GPU Blackwell (RTX 50xx) y con fallback funcional en Ampere. El resultado es un archivo de unos 20 GB que permite servir un MoE de 35B con vision en una sola GPU de consumo, manteniendo una ventana de contexto muy amplia.

La ficha describe una cuantizacion, no un modelo original: las capacidades, sesgos y limitaciones heredan del modelo base sin censura, mientras que el formato y la mezcla de tensores son responsabilidad del cuantizador. Se distribuye con licencia Apache 2.0 y pipeline `image-text-to-text`, con soporte declarado de ingles, chino y multilingue.

## Especificaciones tecnicas
| Parametro | Valor |
|---|---|
| Arquitectura | `qwen35moe` (transformer MoE con componentes SSM), 40 capas |
| Parametros totales | 34.660.610.688 (35B) |
| Parametros activos | ~3B por token |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | NVFP4 (226 tensores), F16 (175), F32 (331), Q6_K (1, `output.weight`) |
| Idiomas soportados | en, zh, multilingual |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (variante NVFP4 con escalas inline UE4M3); proyector vision en GGUF F16 |

## Arquitectura y entrenamiento
El modelo subyacente es un MoE de tipo Qwen 3.5 con 35B parametros totales y unos 3B activos, 40 capas y un contexto nativo de 262.144 tokens. La presencia de tensores `ssm_conv1d`, `ssm_dt`, `ssm_a` y `ssm_norm` en el inventario de proteccion indica componentes de espacio de estados (SSM) integrados en el bloque, ademas de atencion con `attn_q_norm`/`attn_k_norm` y una puerta de expertos compartidos (`ffn_gate_inp_shexp`). El modelo base de HauhauCS se presenta como un finetune sin censura con "0/465 refusals"; LuffyTheFox aplica sobre el una reparacion de tensores denominada Genesis. No se dispone de datos sobre volumen de tokens de entrenamiento, composicion del dataset ni si hubo RLHF o DPO.

La aportacion de esta publicacion es puramente de cuantizacion. El pipeline es en dos pasos: el GGUF fuente Q8_K_P (43,6 GB, 10,06 BPW) se convierte primero a un intermedio F16 para evitar el ruido de cuantizacion Q8_0, y despues se cuantiza a NVFP4 en CPU (`CUDA_VISIBLE_DEVICES=""`), porque el codificador NVFP4 en CUDA sobre Ampere se cuelga con MoE. La version v4 usa `--nvfp4-inline-scales-only`, que elimina los tensores `.scale` e `.input_scale` separados y fuerza `tensor_scale=1.0` e `input_scale=identity`, de modo que las escalas UE4M3 inline son autocontenidas. Esto corrige el fallo de las v2/v3, que producian salida basura en runtimes como LM Studio o Pelican al ignorar las escalas extendidas. Se aplica una politica de proteccion de tensores: F16 para `blk.0.attn_gate`, `blk.0.attn_qkv`, `blk.0.ffn_down_exps` y `blk.13.ffn_down_exps` (contra el colapso singular); F32 para todas las normas 1D, los escalares y kernel SSM y la puerta de expertos compartidos; y NVFP4 forzado en `blk.0.ssm_out`, `blk.1.attn_gate` y `blk.1.attn_qkv`. No hay MTP/NextN ni decodificacion especulativa integrada.

## Capacidades
- Generacion de texto conversacional multi-turno con contexto de hasta 262.144 tokens.
- Razonamiento y respuesta a instrucciones heredados del finetune base.
- Procesamiento de imagen y texto (`image-text-to-text`) mediante el proyector de vision `mmproj-...-F16.gguf`.
- Capacidades multilingues declaradas: ingles, chino y multilingue generico.
- Comportamiento sin censura: el autor del modelo base reporta 0 rechazos en 465 peticiones de prueba.
- Compatibilidad con endpoints (tag `endpoints_compatible`) y uso con llama.cpp y runtimes que aceptan GGUF.
- No se documenta soporte explicito de tool calling, function calling ni modos de agente multi-paso en la informacion disponible.

## Casos de uso
- Despliegue local en GPU Blackwell: el archivo de ~20 GB con ruta nativa FP4 permite servir un MoE de 35B con vision en una RTX 50xx de gama alta, con offload completo (`-ngl 99`) y 8 expertos activos.
- Procesamiento de documentos largos: con 262.144 tokens de contexto se pueden analizar contratos, informes o bases de codigo extensas en una sola pasada sin troceado, usando `-c 131072` o superior segun VRAM.
- Analisis de imagenes en flujo conversacional: gracias al proyector `mmproj` F16, el modelo puede describir capturas, extraer texto de imagenes o responder preguntas sobre diagramas dentro de una conversacion multi-turno.
- Investigacion sobre alineacion y censura: al ser un finetune sin censura, sirve para estudiar como se comportan los modelos ante peticiones que los modelos alineados rechazan, y para comparar con las variantes alineadas del mismo tamano.
- Generacion creativa sin filtros: escritura de ficcion, guiones o dialogos donde los filtros de seguridad estandar recortan el contenido; el contexto largo permite mantener coherencia en novelas o sagas completas.
- Evaluacion de cuantizaciones: la proteccion selectiva de tensores (F32 en normas y SSM, F16 en capas criticas) lo convierte en un banco de pruebas para medir la degradacion de NVFP4 frente a Q8_K_P en tareas de razonamiento y vision.
- Inferencia en entornos con VRAM limitada: en Ampere (RTX 30xx) funciona mediante kernels de fallback, y con la opcion de forzar pesos MoE a CPU en las 40 capas se puede repartir el modelo entre GPU y RAM.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- VRAM estimada: unos 20 GB para los pesos NVFP4 v4 mas ~899 MB del proyector de vision; a ello se suma la cache KV, que el autor recomienda en F16 para K y V. Con contexto de 131.072 tokens la cache KV es el factor dominante y puede requerir decenas de GB adicionales.
- GPU recomendadas: Blackwell (RTX 50xx) para la ruta FP4 nativa y maxima velocidad; Ampere (RTX 30xx) funciona mediante kernels de fallback NVFP4.
- GPU de consumo: cabe en RTX 5090 y, con contexto reducido, en tarjetas de 24 GB como la RTX 4090, a costa de offload parcial de capas MoE a CPU.
- Despliegue: llama.cpp (`llama-cli`/`llama-server`) y LM Studio/Pelican con la version v4; el autor indica que los runtimes deben soportar escalas inline UE4M3. No se documenta soporte en vLLM ni TGI.
- Parametros de ejecucion sugeridos: `--jinja`, `-c 131072`, `-ngl 99`, cache K/V en F16, 8 expertos activos y forzar pesos MoE a CPU en las 40 capas cuando la VRAM sea insuficiente.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares
| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Este modelo (NVFP4 v4) | 35B totales / ~3B activos | 262.144 | GGUF NVFP4 | Apache 2.0 | Vision, sin censura, optimizado para FP4 Blackwell |
| LuffyTheFox/Qwen3.6-35B-A3B-Uncensored-Genesis-Final-GGUF | 35B totales / ~3B activos | 262.144 | GGUF (Q8_K_P y otros) | Apache 2.0 | Fuente de esta cuantizacion; mayor peso en disco (43,6 GB en Q8_K_P) |
| HauhauCS/Qwen3.6-35B-A3B-Uncensored-HauhauCS-Aggressive | 35B totales / ~3B activos | no disponible | safetensors / GGUF | Apache 2.0 | Modelo base sin cuantizar; finetune sin censura |
| jan1k/Qwen3.6-35B-A3B-Uncensored-Genesis-Hermes-Final-NVFP4-GGUF | 35B totales / ~3B activos | 262.144 | GGUF NVFP4 | Apache 2.0 | Variante con transfer del finetune Hermes |

## Limitaciones y advertencias
- Es una cuantizacion de 4 bits: la perdida de calidad frente a Q8_K_P no esta cuantificada en la model card y debe validarse en el caso de uso concreto.
- El modelo es explicitamente sin censura; puede generar contenido sensible, ofensivo o inseguro y no es apto para aplicaciones orientadas al publico sin filtros adicionales.
- Riesgo de alucinacion propio de los modelos de 35B con 3B activos; no hay evaluaciones publicadas que lo acoten.
- Dependencia estricta del runtime: las versiones v2/v3 producen salida corrupta en LM Studio y Pelican. Solo la v4 con escalas inline es segura en esos entornos.
- Las capacidades multilingues declaradas se limitan a en, zh y multilingue generico; el rendimiento en castellano no esta documentado.
- La licencia Apache 2.0 se hereda del modelo base, pero la ausencia de censura puede chocar con politicas de plataformas de despliegue y con requisitos regulatorios.
- El autor advierte de que el codificador NVFP4 en CUDA se cuelga con MoE en Ampere; la reproducibilidad de la cuantizacion exige ejecutarla en CPU.
- El repositorio tiene muy poca traccion (251 descargas, 3 likes) y una unica revision reciente; no hay garantia de mantenimiento ni de variantes imatrix, que el autor deja pendientes.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/jan1k/Qwen3.6-35B-A3B-Uncensored-Genesis-NVFP4-GGUF
- Variante Hermes NVFP4: https://huggingface.co/jan1k/Qwen3.6-35B-A3B-Uncensored-Genesis-Hermes-Final-NVFP4-GGUF
- Fuente GGUF de LuffyTheFox: https://huggingface.co/LuffyTheFox/Qwen3.6-35B-A3B-Uncensored-Genesis-Final-GGUF
- Modelo base de HauhauCS: https://huggingface.co/HauhauCS/Qwen3.6-35B-A3B-Uncensored-HauhauCS-Aggressive
- Cuantizador advanced-gguf-quantizer: https://github.com/michaelw9999/advanced-gguf-quantizer
- Perfil del cuantizador: https://huggingface.co/jan1k
