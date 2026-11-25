# Dankpaws/Hy4-flash-DankAttn-g64-gptq-v3

## Resumen

Hy4-flash-DankAttn-g64-gptq-v3 es un paquete de pesos cuantizados y reempaquetados del modelo `tencent/Hy4-flash` de Tencent, preparado por el desarrollador independiente Dankpaws para su motor de inferencia DankAttn, orientado a Apple Silicon con Metal 4. No es un modelo nuevo: es una distribucion del checkpoint original adaptada a un formato propietario (`pack-*.bin`) que no carga en Transformers, MLX ni llama.cpp, y que solo funciona con el motor DankAttn.

El modelo base es un transformer con mezcla de expertos (MoE) de 42 capas y 512 expertos enrutados con top-16, acompanado de un drafter especulativo DFly2 de 5 capas y una tabla n-grama Engram en FP8 de 660 millones de filas. El paquete incluye los pesos principales, el drafter, la tabla Engram, el tokenizador y la plantilla de chat, con un total de aproximadamente 150,7 GB en disco.

Su relevancia es muy acotada: demuestra una via de despliegue de un MoE grande en Macs de memoria unificada alta mediante cuantizacion GPTQ selectiva (W4 en expertos, W8 en atencion y capas densas), decodificacion especulativa y cache latente dispersa. Es material de experimentacion para inferencia local en Apple Silicon, no un artefacto de proposito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con 42 capas, 512 expertos enrutados (top-16), expertos compartidos, drafter especulativo DFly2 de 5 capas y tabla Engram n-grama |
| Parametros totales | no disponible |
| Parametros activos | no disponible (top-16 de 512 expertos enrutados) |
| Longitud de contexto | slot principal de 512k tokens; carriles laterales de 32k (hasta 3 concurrentes) segun el autor |
| Tipos de cuantizacion | W4 grupo 64 GPTQ (expertos enrutados), W8 (atencion, capas densas, expertos compartidos, lm_head), W6 grupo 128 (drafter), W4 (cabeza del drafter), bf16 (embeddings), f32 (norms, biases, pesos hyper-connection, sinks), FP8 E4M3 (tabla Engram) |
| Idiomas soportados | no disponible |
| Licencia | tencent-hy-license (licencia del modelo base, incluida como LICENSE); el motor DankAttn es MIT |
| Formato de pesos | `pack-*.bin` propietario de DankAttn, `manifest.json`, `engram.bin`, `tokenizer.json`, `chat_template.jinja` |

## Arquitectura y entrenamiento

El modelo base `tencent/Hy4-flash` es un transformer con mezcla de expertos: 42 capas, 512 expertos enrutados con activacion top-16 y expertos compartidos adicionales. El paquete anade un drafter especulativo DFly2 de 5 capas con su propia cabeza de salida en W4, y una tabla Engram n-grama en FP8 E4M3 de 660.006.416 filas por 96 dimensiones (unos 63,4 GB) que se transmite desde SSD bajo demanda. La atencion incorpora proyecciones `gate`, `o`, `in`, `qb`, `kb` y `vb`, y el motor usa una cache latente dispersa `kv8` que sustituye a la KV en bf16.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO en el modelo original. La innovacion tecnica del paquete es la cuantizacion por capas: GPTQ W4 con grupo 64 solo en los expertos enrutados (`moe_gu` y `moe_dn`), W8 en atencion y capas densas, y calibracion GPTQ sobre 2048 muestras que, segun el autor, reduce la KL en retencion un 28,8 % frente a RTN sin calibrar. La decodificacion especulativa con DFly2 y la verificacion por lotes (5, 8 y 16 filas) son parte del diseno del motor.

## Capacidades

- Generacion de texto y conversacion multi-turno mediante API compatible con OpenAI en el puerto 8341.
- Razonamiento y generacion de codigo: el autor reporta pruebas en `chat_code` y `edit_spec` con especulacion exacta en modo greedy (400/400).
- Decodificacion especulativa con drafter DFly2, con velocidades medidas de 116,9 a 357,3 tok/s en pared segun la carga.
- Servicio multi-carril: hasta 4 carriles concurrentes (un slot principal de 512k y tres laterales de 32k).
- Contexto largo: slot principal de hasta 512k tokens segun el autor, con cache latente `kv8` validada de 2k a 64k con 97,4-98,4 % de acuerdo top-1 frente a KV en bf16.
- Soporte de tool calling y agentes: no disponible en la informacion proporcionada.
- Capacidades multimodales (vision, audio): no disponible.
- Capacidades multilingues: no disponible.

## Casos de uso

- Inferencia local en Mac de memoria unificada alta: el paquete esta pensado para servirse en un Mac con 128 GB o mas (96 GB con limites de contexto reducidos), usando el motor DankAttn y Metal 4. Es el escenario principal y practicamente el unico soportado.
- Servicio de API compatible con OpenAI en una estacion de trabajo Apple Silicon: el script `serve_hy4.sh` levanta un endpoint en `:8341` que permite conectar clientes existentes sin cambiar el codigo de aplicacion.
- Procesamiento de documentos largos: el slot principal de 512k tokens permite analizar contratos, informes o bases de codigo extensas en una sola pasada, con la cache `kv8` reduciendo el coste de memoria frente a bf16.
- Generacion y edicion de codigo asistida: las pruebas del autor en `chat_code` y `edit_spec` con especulacion exacta indican uso viable para autocompletado y edicion de codigo en local, con 357,3 tok/s en pared en la carga de edicion.
- Experimentacion con decodificacion especulativa: el paquete incluye el drafter DFly2 y utilidades de prueba (`btest`, `jtest`) para medir aceptacion especulativa y verificacion por lotes, util para investigacion sobre tecnicas de aceleracion.
- Evaluacion de cuantizacion GPTQ en MoE: los datos de KL y acuerdo top-1 frente a bf16 permiten estudiar el impacto de W4/W8 por modulo en un MoE de 512 expertos, con la tabla Engram como caso aparte de compresion FP8.
- Despliegue multi-usuario ligero: los 4 carriles concurrentes (376,3 tok/s en `btest` con 16 carriles) permiten atender varias sesiones en una sola maquina, aunque con limites claros de memoria.

## Benchmarks y rendimiento

Rendimiento medido por el autor en un M5 Ultra con contexto de 12.272 tokens:

| Carga | Throughput / latencia |
|---|---|
| Prefill (12.272 tok) | 1.700 tok/s GPU (1.694 en pared) |
| Decode 1 fila | 19,08 ms GPU (52,4 tok/s) |
| Verify 5 / 8 / 16 filas | 27,61 / 33,24 / 44,76 ms GPU |
| Decode multi-carril (16 carriles, `btest`) | 376,3 tok/s GPU |
| Especulacion un carril (`ids12k` / `chat_code` / `edit_spec`) | 128,1 / 116,9 / 357,3 tok/s en pared (400/400 greedy exacto) |
| Especulacion conjunta 4 carriles (`jtest`, greedy) | 199,9 tok/s en pared (0 diferencias frente a un carril) |

Calidad frente a la referencia bf16:

| Metrica | Resultado |
|---|---|
| `wikitext-2` (24 fragmentos de 512 tok, arranque en frio) | KL media 0,287; acuerdo top-1 81,9 % |
| GPTQ calibrado 16k (`pack-g64-gptq-v3`) | -28,8 % de KL en retencion frente a RTN sin calibrar (KL `calib2048` de un solo documento ~0,103) |
| Cache latente `kv8` frente a KV bf16 | KL 0,006-0,011; acuerdo top-1 97,4-98,4 % en contexto de 2k a 64k |

No se han publicado resultados de benchmarks academicos (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM/unified memory: unos 87,3 GB de pesos mapeados mas 6,5 GB de estado GPU fijado para 4 carriles concurrentes (slot de 512k y tres laterales de 32k); aproximadamente 1,0 GB de estado en un solo slot de 32k.
- Memoria del sistema: se recomienda un Mac con 128 GB o mas para servicio multi-carril completo; 96 GB funciona con `HY4_CAP=32768 HY4_SIDE_LANES=0`.
- Almacenamiento: unos 151 GB en SSD NVMe local rapido (87,3 GB de shards de pesos mas 63,4 GB de `engram.bin`, que se transmite bajo demanda).
- GPU: exclusivamente Apple Silicon con Metal 4 y `MetalPerformancePrimitives` (probado en M5 Ultra). No hay soporte para A100, H100 ni RTX 4090.
- Ajuste del limite de memoria fijada en macOS: puede requerir `sudo sysctl iogpu.wired_limit_mb=104448`.
- Despliegue: solo mediante el motor DankAttn (`hy4/build_hy4.sh` y `hy4/serve_hy4.sh`), con front-end Python y API compatible con OpenAI. No es compatible con vLLM, llama.cpp, Ollama, TGI, MLX ni Transformers.
- Latencia y throughput: ver la tabla de benchmarks (52,4 tok/s en decode de una fila; hasta 357,3 tok/s en pared con especulacion en `edit_spec`).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Hy4-flash-DankAttn-g64-gptq-v3 | no disponible (MoE 512 expertos top-16) | 512k (slot principal) | `pack-*.bin` DankAttn | tencent-hy-license | Solo Apple Silicon / DankAttn |
| tencent/Hy4-flash (bf16 original) | no disponible | no disponible | safetensors | tencent-hy-license | Multiples plataformas (Transformers, MLX, llama.cpp segun el autor) |
| Otras cuantizaciones de Hy4-flash para llama.cpp / MLX | no disponible | no disponible | GGUF / MLX | tencent-hy-license | No disponible en la informacion proporcionada |

No se dispone de datos de rendimiento comparables entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- Formato propietario: los pesos no cargan en Transformers, MLX ni llama.cpp; solo funcionan con el motor DankAttn, lo que limita portabilidad y mantenimiento a largo plazo.
- Plataforma unica: requiere Apple Silicon con Metal 4 y `MetalPerformancePrimitives`; no hay soporte para GPU NVIDIA, AMD ni CPU convencional.
- Requisitos de memoria elevados: 87,3 GB de pesos mas estado GPU, con recomendacion de 128 GB de memoria unificada; el limite de memoria fijada de macOS puede impedir el arranque sin ajuste manual.
- Dependencia de SSD: la tabla Engram de 63,4 GB se transmite bajo demanda desde NVMe, lo que introduce dependencia de la velocidad de disco y de la latencia de E/S.
- Perdida de calidad por cuantizacion: KL media de 0,287 y acuerdo top-1 del 81,9 % frente a bf16 en `wikitext-2`; el autor advierte que fragmentos de prosa cortos y de alta entropia muestran mas discrepancias que contextos largos o codigo.
- Riesgo de alucinacion y sesgos: no hay informacion sobre evaluaciones de sesgo, toxicidad o alucinacion del modelo base ni del paquete cuantizado.
- Idiomas: no se especifican los idiomas soportados; no se puede asumir cobertura multilingue.
- Licencia: uso sujeto a la `tencent-hy-license` del modelo base, incluida en el repositorio; es necesario revisar sus restricciones para uso comercial antes de desplegar. El motor DankAttn es MIT, pero eso no cubre los pesos.
- Madurez: el repositorio tiene 0 descargas y 0 likes, creado y actualizado el mismo dia (21 de noviembre de 2026); no hay evidencia de validacion independiente.
- Sin datos de entrenamiento ni benchmarks academicos: no se puede evaluar el modelo en tareas estandar (MMLU, HumanEval, GSM8K) con la informacion disponible.

## Enlaces

- Repositorio del paquete: https://huggingface.co/Dankpaws/Hy4-flash-DankAttn-g64-gptq-v3
- Modelo base: https://huggingface.co/tencent/Hy4-flash
- Revision del modelo base citada: `d88c9dfd96ba4f2e6b92adba0b8e8f1c8696f959`
- Motor DankAttn: https://github.com/Dankpaws/DankAttn
- Licencia del modelo base: LICENSE incluida en el repositorio del paquete (tencent-hy-license)
