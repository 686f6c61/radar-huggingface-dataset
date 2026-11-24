# gdlyj27/Qwen3.8-27B-pi-RCO-QSA

## Resumen

Qwen3.8-27B-pi-RCO-QSA es un artefacto de inferencia publicado por el usuario gdlyj27 en Hugging Face, construido a partir del fine-tune de codigo `bytkim/Qwen3.8-27B-pi`, que a su vez deriva del modelo base `Qwen/Qwen3.8-27B` de Alibaba. No se trata de un modelo entrenado desde cero, sino de una re-cuantizacion a 3,5 bits por peso (bpw) mediante asignacion RCO, con un cabezal MTP (multi-token prediction) injertado y atencion dispersa QSA (QSA, del fork `ninfer-all-QSA`) para permitir contextos de hasta 256K tokens en una GPU de consumo de 16 GB.

El objetivo declarado del autor es ejecutar 256K de contexto en una GeForce RTX 4060 Ti de 16 GB. Para ello, el artefacto empaqueta los pesos en formato NInfer v3 (12,22 GB, 894 objetos) y utiliza un motor de inferencia especifico (`ninfer-serve.exe`) que mantiene la KV cache completa en RAM del host (8,25 GiB a 256K) y solo una capa de staging de 528 MiB en la GPU, seleccionando 512 bloques de 2048 tokens por consulta mediante el indexador QSA.

Es relevante ahora porque demuestra una via practica para servir modelos de ~27B con contexto muy largo en hardware de gama media, aunque con fuertes dependencias de un motor propietario/de fork y con un pipeline de cuantizacion muy especifico que conviene auditar antes de usar en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (base Qwen3.8-27B) con atencion dispersa QSA injertada y cabezal MTP |
| Parametros totales | ~27B (no se especifica el conteo exacto en la informacion disponible) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 262.144 tokens (256K) segun el comando de lanzamiento |
| Tipos de cuantizacion | IQ3_S con asignacion RCO, ~3,55 bpw (objetivo 3,50 bpw) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 (artefacto y todos los componentes upstream) |
| Formato de pesos | NInfer v3 (`.ninfer`, 894 objetos); base en GGUF BF16 de origen |

## Arquitectura y entrenamiento

El modelo subyacente es un transformer denso de ~27B parametros (64 capas, segun el conteo de tensores: 851 base + 15 del cabezal MTP = 866 tensores). Sobre el base `Qwen/Qwen3.8-27B` se aplico un SFT especifico para el bucle de agente Pi (lectura de repositorio, edicion de ficheros, ejecucion de tests), publicado por bytkim. El artefacto anade un cabezal MTP de 849.400.392 bytes en BF16, cuyas 15 tensores se renombran a `blk.64.*` y cuyas normas se almacenan como `hf_value + 1` segun la convencion del conversor del fork.

La innovacion principal es el injerto de QSA (atencion dispersa con indexador): se anaden tensores de indexador entrenados por Prefrontal-AI sobre 16k-1M de contexto (~352M tokens) para 16 capas. El indexador selecciona 512 bloques de 2048 tokens de historial por consulta, lo que permite mantener la KV completa fuera de la GPU. La cuantizacion usa una tabla de asignacion por tensor RCO de ISTA-DASLab (866 entradas) combinada con una imatrix especifica de Pi de bartowski (496 entradas / 582 chunks); el autor reconoce este cruce arquitectura/modelo como el compromiso principal del build. No se documentan datos de RLHF/DPO ni composicion del dataset de entrenamiento en la informacion disponible.

## Capacidades

- Generacion de texto y razonamiento con modo `reasoning_effort` (se menciona `xhigh`).
- Generacion y edicion de codigo orientada a tareas de agente (leer repo, editar ficheros, ejecutar tests).
- Tool calling / function calling, con tareas largas de llamadas a herramientas medidas (36.223 tokens de salida).
- Razonamiento multi-paso y bucles de agente (harness Pi).
- Contexto largo: recuperacion tipo needle a 133.480 tokens de prompt con acierto.
- Decodificacion especulativa via MTP (`--spec mtp --draft-tokens 3`), con tasas de aceptacion del 63,8%-87,7%.
- Solo texto: el artefacto es text-only, sin vision ni proposal head.

## Casos de uso

- Agente de codigo sobre repositorios grandes: el modelo puede leer, editar y ejecutar tests en un bucle Pi con contexto de hasta 256K tokens, adecuado para refactorizaciones que abarcan muchos ficheros.
- Recuperacion sobre documentacion extensa: con 256K de contexto y QSA, se puede consultar un corpus largo (manuales, contratos, bases de codigo) sin trocear, manteniendo velocidad de decodificacion estable (~41-51 tok/s).
- Servicio local en estacion de trabajo con GPU de 16 GB: despliegue en RTX 4060 Ti 16GB u otras consumer con 16 GB, manteniendo KV en RAM del host.
- Generacion de codigo en pipelines de CI/CD: soporta tool calling y tareas largas de salida (36K tokens), integrable como servicio HTTP en `127.0.0.1:8097`.
- Asistente de terminal para tareas de ingenieria: el fine-tune Pi esta disenado para ejecutar comandos y editar ficheros, util en entornos de desarrollo locales.
- Prototipado de agentes multi-paso: la decodificacion especulativa MTP acelera bucles iterativos con alta tasa de aceptacion en continuaciones largas (87,7% a 46K de contexto).
- Evaluacion de tecnicas de cuantizacion y atencion dispersa: util como banco de pruebas para investigadores que comparan RCO, QSA y MTP en hardware limitado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. El autor solo reporta mediciones de inferencia en RTX 4060 Ti 16GB:

| Escenario | Tokens de prompt | Decodificacion | Prefill | Aceptacion MTP |
|---|---:|---:|---:|---:|
| QA corta | 71 | 45,4 tok/s | — | 63,8% |
| Needle a 256K (encontrado) | 133.480 | 40,9 tok/s | 669 tok/s | 67,7% |
| Tarea larga con tool-call (36.223 tok salida) | 9.907 | 44,9 tok/s | 1.000 tok/s | 67,1% |
| Continuacion a 46K de contexto | 46.160 | 51,3 tok/s | 844 tok/s | 87,7% |

VRAM medida: 11,4 GiB de pesos, 2,48 GiB de runtime, 961 MiB libres.

## Requisitos de hardware

- VRAM estimada: ~11,4 GiB de pesos + ~2,48 GiB de runtime = ~13,9 GiB; requiere GPU de 16 GB con margen (961 MiB libres medidos).
- GPU recomendadas: RTX 4060 Ti 16GB (medida por el autor), RTX 4080/4090 16-24GB, A100/H100 para mayor throughput.
- Cabe en consumer GPU de 16 GB (RTX 4060 Ti, RTX 4070 Ti Super 16GB, RTX 5080 16GB), no en GPUs de 8-12 GB.
- Despliegue: exclusivamente mediante el motor NInfer del fork `13thblade/ninfer-all-QSA` (`ninfer-serve.exe`, release `win-cuda13.4-3c083b433239`, CUDA 13.4.92, sm89). No se documenta soporte en vLLM, llama.cpp, Ollama ni TGI para el artefacto final.
- Latencia y throughput: 40,9-51,3 tok/s de decodificacion y 669-1.000 tok/s de prefill en RTX 4060 Ti 16GB; la decodificacion no degrada con la longitud de contexto segun el autor.
- RAM del host: la KV cache completa ocupa 8,25 GiB a 256K en RAM fijada (pinned).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B-pi-RCO-QSA (este) | ~27B | 256K | NInfer v3 | Apache-2.0 | HF, motor NInfer especifico |
| bytkim/Qwen3.8-27B-pi | ~27B | no disponible | GGUF BF16 | Apache-2.0 | HF |
| ISTA-DASLab/Qwen3.8-27B-GSQ-RCO-GGUF | ~27B | no disponible | GGUF (RCO) | Apache-2.0 | HF |
| Qwen/Qwen3.8-27B (base) | ~27B | no disponible | safetensors/GGUF | Apache-2.0 | HF |

No se dispone de datos de rendimiento comparables entre estos modelos en la informacion proporcionada; la comparativa se limita a parametros, formato y licencia.

## Limitaciones y advertencias

- El artefacto depende de un motor no estandar (fork NInfer) y de binarios Windows/CUDA 13.4; no hay soporte documentado en ecosistemas mainstream.
- La tabla de asignacion RCO fue calibrada para el base ISTA GSQ, no para el fine-tune Pi; el autor lo reconoce como compromiso de calidad.
- Dos tensores (`output.weight` y `token_embd.weight`) no tienen entrada en la imatrix y usan importancia uniforme, lo que puede afectar a la calidad de esos componentes.
- Riesgo de alucinacion no cuantificado: no hay benchmarks de fidelidad ni evaluaciones de sesgo.
- Idiomas soportados no documentados; el fine-tune esta orientado a tareas de codigo en ingles probablemente.
- Solo texto: sin vision, audio ni proposal head.
- Requiere 16 GB de VRAM y ~8,25 GiB de RAM del host a 256K; no apto para entornos con poca RAM.
- Aunque la licencia declarada es Apache-2.0 en todos los componentes, conviene verificar los LICENSE/NOTICE upstream antes de uso comercial, especialmente por el injerto de tensores de terceros.
- Sin descargas ni likes en el momento de la ficha; trazabilidad y mantenimiento del artefacto no garantizados.

## Enlaces

- Hugging Face: https://huggingface.co/gdlyj27/Qwen3.8-27B-pi-RCO-QSA
- Base fine-tune: https://huggingface.co/bytkim/Qwen3.8-27B-pi
- Imatrix y calibracion: https://huggingface.co/bartowski/bytkim_Qwen3.8-27B-pi-GGUF
- Tabla RCO: https://huggingface.co/ISTA-DASLab/Qwen3.8-27B-GSQ-RCO-GGUF
- Motor NInfer QSA: https://github.com/13thblade/ninfer-all-QSA
- Fork base del motor: https://github.com/iamwavecut/ninfer-all
- Tensores indexer QSA: https://huggingface.co/Prefrontal-AI/latent-sparse-attention
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
