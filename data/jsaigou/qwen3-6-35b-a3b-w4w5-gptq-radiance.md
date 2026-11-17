# jsaigou/Qwen3.6-35B-A3B-W4W5-GPTQ-radiance

## Resumen

Qwen3.6-35B-A3B-W4W5-GPTQ-radiance es una cuantizacion no oficial del checkpoint bf16 Qwen/Qwen3.6-35B-A3B, empaquetada en el formato propietario `.rad` que consume el motor de inferencia Radiance. La publica el usuario jsaigou como contenedor listo para servir en hardware AMD Strix Halo (APU Ryzen AI MAX+ 395, arquitectura gfx1151), y no es un modelo nuevo ni un fine-tune: es el mismo modelo base con los expertos enrutados comprimidos a 4 y 5 bits mediante GPTQ y el tronco denso en FP8 por bloques.

El problema que resuelve es concreto: permitir ejecutar un MoE de 35B parametros totales (3B activos) en una maquina de memoria unificada de 128 GB sin GPU discreta, con un fichero de 21,01 GiB que deja margen para cache KV larga. La eleccion de formatos replica el mapa Unsloth Dynamic Q4_K_XL (gate/up en 4 bits, down en 5 bits) pero adaptada a los kernels que el motor sirve rapido en gfx1151.

Es relevante ahora por dos motivos: demuestra que la cuantizacion agresiva de expertos con GPTQ mantiene la calidad casi intacta frente al contenedor FP8 oficial (divergencia KL media de 0,0567, acuerdo top-1 del 91,28%), y porque el ecosistema de inferencia local en APUs AMD empieza a tener alternativas medidas frente a llama.cpp. La contrapartida es fuerte: depende de un fork no oficial del motor, solo se ha probado en una GPU concreta y no carga en transformers, GGUF ni llama.cpp.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (hereda la del Qwen3.6-35B-A3B base; sin detalle adicional en la informacion disponible) |
| Parametros totales | 35B (heredado del nombre del modelo base) |
| Parametros activos | 3B (heredado del nombre del modelo base) |
| Longitud de contexto | 262.144 tokens en la configuracion de referencia (`--max-model-len 262144`) |
| Tipos de cuantizacion | Expertos enrutados a 4 bits (gate/up, `w4nl64a8h`) y 5 bits (down, `w5nl64a8h`), codebook rotado; tronco denso en FP8 por bloques; cache KV en FP8 |
| Idiomas soportados | no disponible (la model card solo reporta evaluacion en ingles y japones) |
| Licencia | Apache 2.0 |
| Formato de pesos | `.rad` (contenedor del motor Radiance); no compatible con safetensors, GGUF ni llama.cpp |

## Arquitectura y entrenamiento

El contenedor no entrena nada: parte de la revision `345d467b117d1fd5eda9b879a5988de9ae5f47a7` del checkpoint bf16 oficial y aplica un pipeline de conversion con `rad-convert`. Los expertos enrutados se almacenan con GPTQ ponderado por Hessiana y compensacion de error, calibrado sobre prosa de Project Gutenberg mas texto fuente del propio motor Radiance, con el conjunto de evaluacion disjunto del de calibracion. El tronco denso se conserva en FP8 por bloques exactamente como en el contenedor FP8 publicado, y la cabeza de borrador MTP se deriva igual que en ese contenedor.

La innovacion tecnica esta en el empaquetado y en el motor, no en el modelo: formatos de 4 y 5 bits con codebook rotado (`nl64a8h`), decodificacion especulativa con profundidad 2 (`--num-speculative-tokens 2`) y kernels propios del fork (`RADIANCE_KERNELS=libhalo`). La receta original embebida en el fichero tenia una ruta de calibracion que se sustituyo por un placeholder neutro (`/calibration/hessians`); el autor afirma que los pesos y el resto de bytes no cambiaron y que la salida es identica en sus prompts de prueba.

## Capacidades

- Generacion de texto y razonamiento: hereda las capacidades del Qwen3.6-35B-A3B base; la model card no las detalla.
- Generacion de codigo: la evaluacion de velocidad reporta cifras separadas para prosa y codigo (76 frente a 78 tokens/s), lo que indica uso en ambos dominios.
- Multilinguee: se han medido conjuntos en ingles (835 prompts) y japones (570 prompts); no hay lista oficial de idiomas en la informacion disponible.
- Decodificacion especulativa con cabeza MTP: soportada por el contenedor y el motor, con profundidad configurable.
- Contexto largo: la configuracion de referencia admite hasta 262.144 tokens con cache KV en FP8.
- Tool calling, function calling, modo thinking, vision o audio: no disponible en la informacion proporcionada.

## Casos de uso

- Servicio local de asistencia tecnica con contexto largo: con 262.144 tokens de ventana y unos 34 GiB para cuatro secuencias, se puede mantener el historial completo de un cliente y su documentacion en una sola sesion sin truncar.
- Generacion de codigo en un puesto de trabajo sin GPU discreta: el modelo decodifica a 78 tokens/s en codigo sobre un Ryzen AI MAX+ 395, suficiente para autocompletado interactivo y refactorizaciones por lotes en local.
- Procesamiento por lotes de documentacion: el prefill de un prompt de 38K tokens en 13,5 s permite clasificar, resumir o extraer datos de contratos y manuales largos en una maquina de sobremesa.
- Despliegue multiusuario ligero: tres flujos concurrentes dan 171 tokens/s agregados, adecuado para un equipo pequeno que comparte una unica APU en lugar de alquilar GPUs.
- Evaluacion comparativa de cuantizaciones: sirve como referencia reproducible para medir el impacto de GPTQ 4/5 bits frente a FP8 en un MoE, con metricas publicadas de KL, perplejidad y acuerdo top-1.
- Prototipado en hardware AMD antes de migrar a produccion: permite validar prompts y flujos sobre gfx1151 y luego mover la carga a un contenedor FP8 o al checkpoint bf16 en GPUs discretas.
- Traduccion y atencion bilinguee ingles-japones: es el unico par con evaluacion publicada (92,1% y 83,7% de acierto en las tareas medidas), util para equipos que trabajan con contenido en esos idiomas.

## Benchmarks y rendimiento

Calidad frente al contenedor FP8 publicado, sobre 1.575.352 posiciones de texto:

| Metrica | Valor |
|---|---|
| Divergencia KL media | 0,0567 |
| Divergencia KL mediana | 0,0089 |
| Ratio de perplejidad | 1,0105 |
| Acuerdo top-1 | 91,28% |
| Tareas en ingles (835 prompts) | 92,1% frente a 92,2% del FP8 |
| Tareas en japones (570 prompts) | 83,7% frente a 84,0% del FP8 |

Velocidad en un AMD Ryzen AI MAX+ 395 (gfx1151, 128 GB de memoria unificada), con profundidad de especulacion 2:

| Escenario | Este contenedor | llama.cpp con UD GGUF de Unsloth |
|---|---|---|
| Decodificacion monoflujo, prosa | ~76 tokens/s | dentro del 3-8% |
| Decodificacion monoflujo, codigo | ~78 tokens/s | dentro del 3-8% |
| Prefill de prompt de 38K tokens | 13,5 s | 29,6 s |
| Tres flujos concurrentes (agregado) | 171 tokens/s | 69 tokens/s |

El contenedor FP8 publicado decodifica aproximadamente un 9% mas lento que este formato a la misma profundidad, segun el piloto previo del autor. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- Memoria: el fichero ocupa 21,01 GiB (22.564.196.352 bytes); con cache KV FP8 y cuatro secuencias de hasta 262.144 tokens, el consumo ronda los 34 GiB.
- GPU probada: exclusivamente AMD gfx1151 (Strix Halo, Ryzen AI MAX+ 395) con ROCm 10.1 y 128 GB de memoria unificada.
- GPU discretas (A100, H100, RTX 4090): no disponible; el autor no reporta pruebas y el fork esta orientado a gfx1151.
- Cabe en GPU de consumo: si, en APUs Strix Halo con memoria unificada suficiente; en GPUs discretas de 24 GB no cabe el contenedor completo.
- Despliegue: solo mediante el fork no oficial de Radiance, tag `strix-halo-r2` (commit `a16657e`) o posterior de la misma linea, compilado para la GPU objetivo. No funciona con vLLM, llama.cpp, Ollama ni TGI.
- Comando de referencia: `radiance --model qwen3.6-35b-a3b-w4w5-gptq.rad --tp 1 --max-model-len 262144 --max-num-seqs 4 --num-speculative-tokens 2 --kv-cache-dtype fp8`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Este contenedor | 35B totales / 3B activos | 262.144 | `.rad`, expertos 4/5 bits + tronco FP8 | Apache 2.0 | Requiere fork de Radiance; probado solo en gfx1151 |
| Qwen3.6-35B-A3B (FP8 publicado) | 35B / 3B | no disponible | Contenedor FP8 | Apache 2.0 | Referencia de calidad; ~9% mas lento en el piloto del autor |
| unsloth/Qwen3.6-35B-A3B-MTP-GGUF (UD Q4_K_XL) | 35B / 3B | no disponible | GGUF | Apache 2.0 | 21,65 GiB; portable a llama.cpp; 69 tokens/s en tres flujos frente a 171 |
| Qwen3.6-35B-A3B (bf16 oficial) | 35B / 3B | no disponible | safetensors | Apache 2.0 | Checkpoint fuente; requiere mucha mas memoria |

## Limitaciones y advertencias

- Dependencia de un fork no oficial: el contenedor no carga en la version upstream de Radiance 2.x, que elimino los formatos que usa; hay que compilar el fork `strix-halo-r2` o posterior.
- Incompatibilidad total con el ecosistema estandar: no funciona en transformers, llama.cpp, Ollama, vLLM ni TGI.
- Validacion muy estrecha: solo se ha probado en gfx1151 con ROCm 10.1; no hay datos de comportamiento en otras GPUs, otras versiones de ROCm ni otros sistemas operativos.
- Trazabilidad de la calibracion: la receta embebida apunta a un placeholder (`/calibration/hessians`) en lugar de la ruta original; el autor afirma que la salida es identica, pero no es verificable de forma independiente.
- Licencia: Apache 2.0 heredada del modelo base, permite uso comercial; el motor Radiance es tambien Apache 2.0, pero el fork concreto no lleva aval del proyecto original.
- Sin garantia: la model card lo declara explicitamente ("No warranty; use at your own risk").
- Riesgo de alucinacion y sesgos: no documentados en la informacion disponible; deben asumirse los del modelo base.
- Idiomas: solo hay evaluacion en ingles y japones; el rendimiento en castellano no esta medido.
- Adopcion nula: 0 descargas y 0 likes en el momento de la consulta, sin validacion de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/jsaigou/Qwen3.6-35B-A3B-W4W5-GPTQ-radiance
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B/blob/main/LICENSE
- Fork de Radiance: https://github.com/jsaigou/radiance (tag `strix-halo-r2`)
- Documentacion de formato del fork: https://github.com/jsaigou/radiance/blob/unofficial-fixes/docs/RAD-FILES.md
- Kernels del fork: https://github.com/jsaigou/radiance/blob/unofficial-fixes/docs/FORK-KERNELS.md
- Proyecto Radiance original: https://codeberg.org/StillDeadcode/radiance
- GGUF de referencia de Unsloth: https://huggingface.co/unsloth/Qwen3.6-35B-A3B-MTP-GGUF
