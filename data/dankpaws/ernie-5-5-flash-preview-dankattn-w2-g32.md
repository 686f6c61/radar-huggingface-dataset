# Dankpaws/ERNIE-5.5-Flash-Preview-DankAttn-w2-g32

## Resumen

ERNIE-5.5-Flash-Preview-DankAttn-w2-g32 es un empaquetado de pesos del modelo base Baidu ERNIE-5.5-Flash-Preview, desarrollado por el usuario Dankpaws, orientado especificamente al motor de inferencia DankAttn sobre Apple Silicon con Metal 4. No se trata de un modelo nuevo, sino de una conversion del modelo MoE original a un formato propietario (`pack-*.bin`) con cuantizacion de precision mixta disenada para que un modelo de 43 capas y 512 expertos por capa MoE quepa, junto con una ventana de contexto de 256k tokens, en 96 GB de memoria unificada.

El modelo base emplea una arquitectura hibrida con 37 capas de atencion HCA (sliding-window de 1024 con KV comprimida C128) y 6 capas de atencion latente dispersa DSA (`kv8`), mezcla de residuales mHC de 4 flujos con Sinkhorn, un MLP denso en la capa L0 y 42 capas de MoE con 512 expertos, top-10 y experto compartido, ademas de una cabeza de salida MultiMax. La relevancia de este pack radica en que demuestra la viabilidad de ejecutar un MoE de gran escala con contexto de 256k en hardware de consumo profesional Apple (M5 Ultra), a costa de una cuantizacion agresiva a 2 bits en los expertos enrutados.

La licencia es Apache 2.0, heredada del modelo base, y el motor DankAttn es MIT. El pack incluye indice (`manifest.json`), tokenizador y scripts de codificacion/decodificacion, pero no es compatible con Transformers, MLX ni llama.cpp.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE hibrido: 37 capas HCA (sliding-window 1024 + KV comprimida C128) + 6 capas DSA latentes `kv8`; residual mHC de 4 flujos con Sinkhorn; cabeza MultiMax |
| Parametros totales | no disponible (modelo base de 43 capas, 512 expertos top-10 por capa MoE) |
| Parametros activos | no disponible (top-10 de 512 expertos + experto compartido por capa) |
| Longitud de contexto | 256.000 tokens (`cap=262144`) |
| Tipos de cuantizacion | Mixta: W2-g32 NF2 (NormalFloat 2-bit, grupo 32, GPTQ) en expertos enrutados L2-L42; W4-g64 en expertos L1; W8-g128 en proyecciones de atencion, MLP denso L0, `moe_in`/`moe_out` y `lm_head`; BF16/f32 en embeddings y proyecciones pequenas; f32 en mezcla Sinkhorn y cabeza MultiMax |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (modelo base y pack); motor DankAttn MIT |
| Formato de pesos | `pack-*.bin` / `p1_pack-*.bin` propietario de DankAttn (no compatible con safetensors, GGUF, MLX ni Transformers) |

## Arquitectura y entrenamiento

El modelo base ERNIE-5.5-Flash-Preview es un transformer MoE con 43 capas. La capa L0 contiene un MLP denso; las 42 capas restantes son MoE con 512 expertos enrutados, top-10 por token y un experto compartido. La atencion se reparte entre 37 capas HCA con sliding-window de 1024 tokens y KV comprimida a 128 dimensiones, y 6 capas de atencion latente dispersa DSA con cache `kv8` (int8 simetrico por cada 64 dimensiones de latente mas RoPE en bf16). Los residuales usan una mezcla mHC de 4 flujos con normalizacion Sinkhorn, y la salida se genera con una cabeza MultiMax.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si hubo etapas de RLHF o DPO en el modelo base. La innovacion tecnica destacable del pack es la cuantizacion mixta: solo los expertos enrutados de las capas 2 a 42 se comprimen a 2 bits (NF2, grupo 32, calibrado con GPTQ y pesos de Hessiana), mientras que todas las proyecciones de atencion, el MLP denso, el router, el experto compartido y el `lm_head` se mantienen a 8 bits. El grupo 32 se alinea 1:1 con los bloques MXFP4 del modelo original y produce aproximadamente 2,5 bpw efectivos. El pack incluye decodificacion especulativa 3-gram PLD con `k_draft=7` y muestreo de rechazo exacto, activada por defecto en el servidor.

## Capacidades

- Generacion de texto con contexto largo: ventana de 256k tokens, adecuada para documentos extensos y conversaciones multi-turno prolongadas.
- Razonamiento y generacion de codigo: heredadas del modelo base ERNIE-5.5-Flash-Preview, si bien no se documentan evaluaciones especificas en este pack.
- MoE de gran escala: 512 expertos top-10 por capa permiten especializacion por dominio, aunque la cuantizacion a 2 bits de los expertos puede degradar tareas de precision.
- Decodificacion especulativa integrada: 3-gram PLD con `k_draft=7` y rechazo exacto para generacion greedy y muestreada.
- Determinismo de inferencia: diferencia maxima absoluta de 0,000000 entre ejecuciones repetidas.
- Servidor compatible con API OpenAI en el puerto 8343 mediante `dankattn serve`.
- Soporte de tool calling, agentes, vision o audio: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible.

## Casos de uso

- Procesamiento de documentos largos en local: con 256k tokens de contexto, el modelo puede ingerir contratos, informes o bases de codigo completas en una sola pasada sobre un Mac Studio M5 Ultra de 96 GB, sin depender de servicios en la nube.
- Asistente de codigo en estacion de trabajo Apple: integrado mediante la API compatible con OpenAI en el puerto 8343, sirve para autocompletado y explicacion de fragmentos en editores, con la ventaja de que los datos no salen del equipo.
- Analisis de repositorios y generacion de resumenes tecnicos: la ventana de 256k permite cargar arboles de proyecto medianos y generar documentacion o revisiones de cambios con contexto completo.
- Prototipado de agentes con contexto largo: el servidor local con decodificacion especulativa (hasta 87 tok/s en 4k) permite iterar sobre flujos multi-paso sin coste por token.
- Investigacion en cuantizacion extrema: el pack es un banco de pruebas para estudiar el impacto de W2-g32 NF2 con GPTQ en un MoE de 512 expertos, comparando NLL/PPL frente a variantes de mayor bit.
- Evaluacion de inferencia en Apple Silicon: util para medir throughput de prefill (1.797 tok/s en 4k) y decode (67-69 tok/s) en Metal 4 y comparar con otras plataformas.
- Despliegue off-line en entornos con requisitos de privacidad: al ejecutarse integramente en memoria unificada local, encaja en escenarios donde no se permite enviar datos a APIs externas.

## Benchmarks y rendimiento

Resultados medidos en M5 Ultra Mac Studio de 96 GB con `cap=262144`, 85,51 GiB de pesos mapeados y 2,03 GiB de estado GPU:

| Carga de trabajo | Resultado (GPU) | Resultado (wall) | Notas |
|---|---|---|---|
| Prefill 4k (`p5_needle4k`, 3.866 tok) | 1.797-1.804 tok/s | 1.776 tok/s | `PREFILL_M=1024`, `mmp`/`mmpg` |
| Prefill 16k (`p6_needle16k`, 15.864 tok) | 1.682-1.687 tok/s | 1.677 tok/s | Chunked `PREFILL_M=1024` |
| Decode `M=1` (contexto corto, 7-36 tok) | 67,5-69,4 tok/s | 62,7-64,1 tok/s | `mm1` SIMD matvec |
| Decode `M=1` (4k / 16k contexto) | 65,6 / 63,5 tok/s | 60,0 / 59,4 tok/s | 15,24 / 15,75 ms/tok GPU |
| Especulativa 3-gram PLD (4k contexto) | 87,1 tok/s | 80,4 tok/s | `k_draft=7` |
| Especulativa 3-gram PLD (16k contexto) | 84,1 tok/s | 78,0 tok/s | `k_draft=7` |
| `eval_144` NLL / PPL | 1,4795 / 4,3907 | — | Diferencia maxima 0,000000 entre ejecuciones |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- Memoria unificada: 85,51 GiB de pesos mapeados mas 2,03 GiB de estado GPU con `cap=262144` (87,54 GiB totales); encaja en 96 GB de memoria unificada.
- GPU: Apple Silicon con Metal 4 y `MetalPerformancePrimitives`; probado en M5 Ultra Mac Studio de 96 GB. No compatible con GPU NVIDIA ni AMD.
- Limite de memoria cableada: es necesario elevar el limite de GPU cableada de macOS a 88 GiB con `sudo sysctl iogpu.wired_limit_mb=90112` antes de lanzar el servidor.
- Almacenamiento: aproximadamente 86 GiB en SSD local (`pack-00.bin` a `pack-06.bin` y `p1_pack-00.bin` a `p1_pack-05.bin`).
- Equipos de 192-512 GB de memoria unificada pueden reempaquetar los expertos a mayor precision (W4-g64) con `ernie55/convert/pack_ernie55.py`.
- Despliegue: exclusivamente mediante el motor DankAttn (`dankattn pull`, `dankattn serve`); no es compatible con vLLM, llama.cpp, Ollama, TGI, MLX ni Transformers.
- Throughput: prefill de 1.797 tok/s en 4k y decode de 67-69 tok/s en contexto corto; con decodificacion especulativa, 87 tok/s en 4k y 84 tok/s en 16k.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / motor | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ERNIE-5.5-Flash-Preview (base) | MoE 512 expertos top-10, 43 capas | no disponible en la informacion | Pesos originales (no detallado) | Apache 2.0 | Hugging Face (Baidu) |
| ERNIE-5.5-Flash-Preview-DankAttn-w2-g32 (este pack) | Igual que el base, cuantizado | 256k | `pack-*.bin` / DankAttn | Apache 2.0 | Hugging Face (Dankpaws), 0 descargas |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion sobre modelos comparables de la misma categoria con datos verificables de parametros, contexto o rendimiento.

## Limitaciones y advertencias

- Cuantizacion agresiva: los expertos enrutados de las capas 2 a 42 estan a 2 bits (W2-g32 NF2); aunque el NLL/PPL medido es 1,4795 / 4,3907, es previsible cierta degradacion en tareas de razonamiento o codigo frente al modelo base en BF16.
- Compatibilidad restringida: los pesos no cargan en Transformers, MLX ni llama.cpp; el uso esta limitado al motor DankAttn y a Apple Silicon con Metal 4.
- Requisito de hardware elevado: necesita un Mac con al menos 96 GB de memoria unificada y la modificacion del limite de memoria cableada del sistema.
- Riesgo de alucinacion: no evaluado en la informacion disponible; debe asumirse el comportamiento tipico de un modelo de lenguaje sin datos especificos.
- Sesgos: no se documentan sesgos conocidos del modelo base ni evaluaciones de seguridad.
- Idiomas: no se especifica la cobertura linguistica; no hay garantia de calidad en castellano ni en otros idiomas distintos del ingles.
- Trazabilidad y soporte: el pack tiene 0 descargas y 0 likes, y procede de un autor individual; no hay garantia de mantenimiento ni de actualizaciones.
- Uso comercial: la licencia Apache 2.0 lo permite, pero conviene verificar las condiciones del modelo base de Baidu y del motor DankAttn (MIT) por separado.
- Estado de preview: el modelo base se denomina "Preview", lo que sugiere que puede no ser una version estable para produccion.

## Enlaces

- Hugging Face del pack: https://huggingface.co/Dankpaws/ERNIE-5.5-Flash-Preview-DankAttn-w2-g32
- Modelo base: https://huggingface.co/baidu/ERNIE-5.5-Flash-Preview
- Repositorio del motor DankAttn: https://github.com/Dankpaws/DankAttn
- Script de instalacion de DankAttn: https://raw.githubusercontent.com/Dankpaws/DankAttn/main/install.sh
