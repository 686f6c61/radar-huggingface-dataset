# Pegainfer/kern-k31-sm103

## Resumen

`Pegainfer/kern-k31-sm103` no es un modelo de lenguaje en sentido estricto, sino un *manifest* de despliegue publicado en Hugging Face. Concretamente, es el artefacto que permite ejecutar la fase de decodificación (D) de Kimi-K3.1 Pro mediante el plugin de SGLang del runtime `kern`, sobre dos nodos de cuatro GPU GB300 (arquitectura `sm_103a`). El repositorio contiene únicamente la configuración del *forward* (esquema de manifiesto 7) y referencias a los kernels; no aloja pesos ni binarios.

El modelo subyacente, Kimi-K3.1 Pro de Moonshot AI, es una arquitectura de 93 capas con 896 expertos y atención DSA sobre 24 capas MLA, además de capas KDA con estado recurrente. El manifest fija un despliegue TP8 / DCP8 (expertos EP2 × TP4) con hasta 256 secuencias por paso y contexto máximo de 131.072 tokens, usando páginas de caché MLA de 64 tokens en fp8 y claves index-K en e4m3 con escalas f32.

Su relevancia es operativa: demuestra cómo integrar un runtime alternativo (kern, escrito en Rust + CUDA, sin PyTorch) en un despliegue P/D de SGLang conservando scheduler, transferencia P/D, pools de KV, CUDA graphs, muestreo y API de SGLang. Solo la función *forward* de decodificación la aporta kern. Es un artefacto muy específico de infraestructura, no un modelo para uso general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Manifest de despliegue para el forward de decodificación de Kimi-K3.1 Pro (93 capas, 896 expertos, DSA sobre 24 capas MLA, capas KDA con estado recurrente) |
| Parametros totales | no disponible (corresponden al checkpoint moonshotai/Kimi-K3.1-Pro, no cuantificados en la información) |
| Parametros activos | no disponible |
| Longitud de contexto | 131.072 tokens (máximo configurado en el manifest) |
| Tipos de cuantizacion | Caché MLA en fp8 (páginas de 64 tokens); index-K en e4m3 con escalas f32; estado KDA en bf16 (arrays ssm y conv); pesos del checkpoint sin modificar |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Manifest JSON (`manifests/kimi-k31-d-tp8-sglang.json`, esquema 7); kernels referenciados como `hf:Pegainfer/kern-kernels/blobs/<sha256>`; pesos leídos del checkpoint original de Kimi-K3.1-Pro |

## Arquitectura y entrenamiento

El repositorio no entrena ningún modelo. Es un manifest generado por `kern-k31` (commit `564285c`) con `scripts/gen_stage.py --layers 93 --tp 8 --seqs 256 --max-ctx 131072` y posteriormente `scripts/k3_sglang.py`, reproducible byte a byte. Describe el paso de decodificación en TP8 / DCP8 con paralelismo de expertos EP2 × TP4, sobre las pools de SGLang tal cual están instaladas: caché MLA como páginas fp8 de 64 tokens, index-K de cada capa DSA como páginas de 64 claves e4m3 con sus escalas f32, y el estado de cada capa KDA como arrays ssm y conv en bf16.

La innovación técnica está en la integración: SGLang mantiene scheduler, transferencia P/D, pools de KV, index-K y estado recurrente, CUDA graphs, muestreo y API; kern sustituye únicamente el forward de decodificación. Cada módulo fijado en el manifest es una referencia de registro (`hf:Pegainfer/kern-kernels/blobs/<sha256>`) que el runtime descarga en el primer uso a `~/.cache/kern` (o `$KERN_CACHE_DIR`) y verifica por hash. Requiere kern-llm 0.4.0 o superior. No hay datos sobre composición del dataset ni sobre RLHF/DPO en la información disponible.

## Capacidades

- Decodificación de tokens para Kimi-K3.1 Pro en un despliegue P/D de SGLang (la fase de prefill la realiza una instancia SGLang propia, no este manifest).
- Procesamiento por paso de hasta 256 secuencias concurrentes.
- Contexto de hasta 131.072 tokens.
- Ejecución sobre dos nodos de 4 GPU GB300 con topología TP8 / DCP8 y expertos EP2 × TP4.
- Verificación de integridad de kernels por SHA-256 en tiempo de carga.
- No incluye tool calling, visión, audio ni modos de razonamiento propios: esas capacidades, si existen, dependen del modelo Kimi-K3.1 Pro subyacente y de la instancia SGLang que lo sirve.

## Casos de uso

- Despliegue P/D a gran escala de Kimi-K3.1 Pro: usar este manifest como instancia de decodificación junto a una instancia de prefill de SGLang y un router SGLang, manteniendo la pila de serving existente sin reescribirla.
- Evaluación de runtimes alternativos: comparar el rendimiento del forward de kern frente al de SGLang nativo en el mismo hardware GB300, aislando la fase de decodificación.
- Investigación en paralelismo de expertos: probar configuraciones EP2 × TP4 sobre 896 expertos con el esquema de páginas y estados que describe el manifest.
- Serving de contexto largo: atender cargas con ventanas de hasta 131.072 tokens en decodificación, aprovechando la caché MLA en fp8 y las páginas index-K e4m3.
- Reproducibilidad de infraestructura: reconstruir el manifest a partir del commit y los scripts indicados y verificar que el resultado coincide byte a byte, útil para auditoría de despliegues.
- Integración en pipelines OpenAI-compatibles: al conservar SGLang la API y el muestreo, el endpoint resultante puede conectarse a clientes existentes sin cambios en el cliente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite a `kern-k31/docs/try-in-sglang.md` para precisión y velocidad medidas, pero esos datos no se incluyen en la información proporcionada.

## Requisitos de hardware

- GPU: exactamente dos nodos de 4 GPU GB300 (sm_103a), es decir, 8 GPU en total, con topología TP8 / DCP8.
- VRAM: no disponible de forma explícita; el manifest está diseñado para el pool de memoria de GB300 y no cabe en GPU de consumo.
- GPU de consumo: no es viable; la arquitectura objetivo es sm_103a y el despliegue exige 8 aceleradores de centro de datos.
- Almacenamiento: el repositorio ocupa 0,2 GB, pero los pesos se leen del checkpoint de Kimi-K3.1-Pro (revisión probada `6d0a020`), cuyo tamaño no se detalla en la información.
- Software: SGLang con su plugin de kern, kern-llm 0.4.0 o superior, y acceso a `~/.cache/kern` o `$KERN_CACHE_DIR` para la caché de kernels.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Artefacto | Tipo | Contexto | Hardware | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Pegainfer/kern-k31-sm103 | Manifest de decodificación para Kimi-K3.1 Pro sobre SGLang | 131.072 tokens | 2 nodos × 4 GB300 | Apache 2.0 | Hugging Face (0 descargas) |
| moonshotai/Kimi-K3.1-Pro | Checkpoint del modelo | no disponible | no disponible | no disponible en la información | Hugging Face |
| pegainfer-project/pegainfer | Motor de inferencia Rust + CUDA, compatible OpenAI | no disponible | no disponible | no disponible | GitHub |
| pegainfer-project/kern | Runtime GPU agnóstico de modelo | no disponible | no disponible | no disponible | GitHub |

No se dispone de datos de rendimiento comparables entre estas opciones en la información proporcionada.

## Limitaciones y advertencias

- Solo decodificación: toda la fase de prefill debe realizarla una instancia SGLang separada; el manifest no sirve como servidor completo por sí solo.
- Topología rígida: funciona exclusivamente con el layout de dos nodos TP8 / DCP8 sobre GB300 (sm_103a); no es portable a otras GPU ni a otras configuraciones de paralelismo sin regenerar el manifest.
- Límite de 256 secuencias por paso y contexto máximo de 131.072 tokens.
- Dependencia de red y de caché local: los kernels se descargan en el primer uso desde el registro y se verifican por SHA-256; un fallo de red o de caché impide el arranque.
- Versión mínima de kern-llm (0.4.0) y esquema de manifest 7: incompatible con versiones anteriores del runtime.
- Sin datos de benchmarks, sesgos o alucinación en la información disponible; estas propiedades dependen del checkpoint Kimi-K3.1-Pro y no del manifest.
- Licencia Apache 2.0 para el manifest, pero el uso de los pesos subyacentes se rige por la licencia del checkpoint de Moonshot AI, no indicada aquí.
- Repositorio sin descargas ni likes: no hay evidencia de uso en producción.

## Enlaces

- Hugging Face: https://huggingface.co/Pegainfer/kern-k31-sm103
- Checkpoint del modelo: https://huggingface.co/moonshotai/Kimi-K3.1-Pro
- Documentación de despliegue: https://github.com/pegainfer-project/kern-k31/blob/main/docs/try-in-sglang.md
- Repositorio kern-k31 (commit del manifest): https://github.com/pegainfer-project/kern-k31/tree/564285c
- Runtime kern: https://github.com/pegainfer-project/kern
- Motor pegainfer: https://github.com/pegainfer-project/pegainfer
