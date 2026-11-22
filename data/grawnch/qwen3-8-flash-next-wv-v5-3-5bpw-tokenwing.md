# Grawnch/Qwen3.8-Flash-Next-WV-v5-3.5bpw-TokenWing

## Resumen

Qwen3.8-Flash-Next-WV-v5-3.5bpw-TokenWing es una cuantizacion GGUF de 3,5 bits por peso del modelo Qwen/Qwen3.8-Flash-Next, publicada por el usuario Grawnch. El checkpoint emplea el formato propietario TokenWing (plugin `wv-plugin-v1.3`, ABI v2), que no es un GGUF estandar de llama.cpp: requiere un plugin de cuantizacion externo (`libqfn_wv_plugin.so` en Linux o `qfn_wv_plugin.dll` en Windows) y el runtime `runmyai/tokenwing` en su rama `dev`. El modelo base es un MoE de aproximadamente 180 000 millones de parametros con 48 capas hibridas GDN mas sparse-QSA y 512 expertos enrutados con top-10.

La relevancia de esta publicacion no esta en el modelo en si, sino en la ingenieria de despliegue: consigue ejecutar un MoE de ese tamano en GPUs de 12 GB de VRAM mediante streaming por NVMe de los expertos, con tasas de decodificacion de 19,5 a 25,9 tok/s y una tasa de acierto de cache del 92-97 %. En una GPU de estacion de trabajo completa (RTX PRO 6000 Blackwell) alcanza 67,4 tok/s de decodificacion y 107,3 tok/s de prefill.

La licencia declarada es Apache 2.0, heredada del modelo base. El repositorio ocupa 86,2 GB repartidos en dos shards (53,48 GiB y 26,82 GiB), con 1422 descargas y 2 likes en el momento de la consulta. Es, por tanto, un artefacto de nicho orientado a usuarios del ecosistema TokenWing, no un GGUF generico compatible con Ollama o llama.cpp sin modificaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE hibrido: 48 capas GDN + sparse-QSA, 512 expertos enrutados top-10 |
| Parametros totales | 176 943 899 520 (~180B) |
| Parametros activos | no disponible (top-10 de 512 expertos, sin cifra publicada) |
| Longitud de contexto | hasta 32 768 tokens en el comando de ejemplo (`-c 32768`); contexto nativo del modelo base no disponible |
| Tipos de cuantizacion | WV-v5 a 3,5 bpw (formato TokenWing propietario); tabla PLE de la capa 1 en Q4_0 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF TokenWing (2 shards, ABI v2, requiere plugin de cuantizacion externo) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-Flash-Next es un transformer con mezcla de expertos que combina 48 capas hibridas de dos tipos: capas GDN (Gated Delta Network, una variante de attention lineal con estado recurrente) y capas sparse-QSA (atención dispersa). El trunk enruta cada token hacia 10 de los 512 expertos disponibles. La model card no detalla el volumen de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO; esos datos corresponden al modelo original y no se reproducen en esta ficha.

La innovacion tecnica de esta publicacion es el formato de cuantizacion WV-v5 a 3,5 bpw y su integracion con el runtime TokenWing. El checkpoint incluye metadatos de enrutamiento y ordenacion de cache de expertos precalculados en el shard 1, lo que permite al runtime predecir que expertos se van a necesitar y mantenerlos en RAM o VRAM. Tambien embebe la plantilla de chat y el token EOS (`<|im_end|>`, id 248046). El autor reporta paridad de logits entre CPU pura (`-ngl 0`) y CUDA (`-ngl 99`) con coseno de similitud 1.000000, y perplejidad de 3,1299 en WikiText-2 y 2,4875 en un corpus de matematicas y codigo de sistemas, ambas con contexto 512.

## Capacidades

- Generacion de texto conversacional y continuacion de texto, segun el pipeline declarado (`text-generation`, `conversational`).
- Razonamiento y generacion de codigo, incluyendo codigo de sistemas y CUDA: el autor reporta PPL de 2,4875 en un corpus especifico de matematicas y codigo de sistemas.
- Soporte de plantilla de chat embebida, lo que permite uso directo en modo conversacional sin configuracion adicional.
- Decodificacion especulativa mediante sidecar MTP opcional (`Qwen3.8-Flash-Next-WV-v5-MTP-Draft.gguf`, 2,39 GiB) con aceptacion del 77-86,8 %.
- Decodificacion especulativa n-gram integrada en el runtime (`--spec-type ngram-mod`), que eleva el throughput de 19,5 a 25,9 tok/s en configuracion de VRAM limitada.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Tool calling, function calling, uso como agente y modo thinking: no disponibles en la informacion proporcionada.

## Casos de uso

- Inferencia de un MoE de 180B en portatiles con GPU de 12 GB: el streaming por NVMe de los expertos permite ejecutar el modelo con 12 GB de VRAM y 20-32 GB de RAM a 25 tok/s, algo imposible con un GGUF convencional de ese tamano.
- Estaciones de trabajo con GPU profesional: con una RTX PRO 6000 Blackwell y `-ngl 99` se obtienen 67,4 tok/s de decodificacion y 107,3 tok/s de prefill, adecuado para generacion interactiva de codigo y documentacion tecnica.
- Asistentes de codigo en local: la PPL de 2,4875 en codigo de sistemas y CUDA sugiere buen comportamiento en tareas de programacion de bajo nivel, y el modelo puede servirse con `llama-server` exponiendo una API compatible con endpoints.
- Procesamiento por lotes en hardware modesto: el modo de streaming directo desde NVMe (`<12 GB` VRAM, 6 GiB RAM) permite dejar trabajos de generacion largos en marcha sin GPU dedicada de gama alta.
- Investigacion sobre cuantizacion extrema: el checkpoint sirve como banco de pruebas para estudiar el impacto de 3,5 bpw en un MoE de 512 expertos, con metricas de paridad de logits y perplejidad ya publicadas.
- Despliegue de bajo coste con contexto medio: la configuracion de ejemplo usa `-c 8192` y `-c 32768`, suficiente para conversaciones multi-turno y analisis de documentos tecnicos de tamano moderado.
- Evaluacion de decodificacion especulativa: el sidecar MTP y el modo n-gram permiten medir ganancias de throughput en entornos con ancho de banda de memoria limitado.

## Benchmarks y rendimiento

| Metrica | Valor | Condiciones |
|---|---|---|
| Perplejidad WikiText-2 | 3,1299 | contexto 512 |
| Perplejidad matematicas y codigo de sistemas | 2,4875 | contexto 512 |
| Paridad de logits CPU vs CUDA (coseno) | 1,000000 | 48 capas, `-ngl 0` vs `-ngl 99` |
| Decodificacion, streaming NVMe bajo VRAM | 19,51 tok/s | `<12 GB` VRAM, 6 GiB RAM, `-t 8`, prompt tecnico |
| Decodificacion, streaming NVMe bajo VRAM | 19,42 tok/s | `<12 GB` VRAM, 6 GiB RAM, `-t 8`, prompt CUDA |
| Decodificacion, plugin con pool de RAM | 25,06-25,87 tok/s | `<12 GB` VRAM, 20 GiB RAM, `-t 10`, n-gram especulativo |
| Decodificacion, VRAM completa | 67,40 tok/s | RTX PRO 6000 Blackwell, `-ngl 99`, 256 tokens |
| `llama-bench tg128` | 52,82 tok/s | RTX PRO 6000 Blackwell |
| `llama-bench pp512` | 107,30 tok/s | RTX PRO 6000 Blackwell |
| Aceptacion del sidecar MTP | 77-86,8 % | `--spec-type draft-mtp --spec-draft-n-max 1` |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM minima practica: menos de 12 GB con streaming por NVMe; el propio autor documenta funcionamiento con 6 GiB de RAM en modo directo.
- Configuracion recomendada por el autor: GPU de 12 GB mas 32 GB de RAM, con ~25,9 tok/s de decodificacion y 97,4 % de acierto de cache.
- VRAM completa: el checkpoint completo requiere cargar 53,48 GiB mas 26,82 GiB en memoria de GPU; solo es viable en GPUs profesionales de 80-96 GB o superiores, como la RTX PRO 6000 Blackwell usada en las mediciones.
- GPU validadas en la documentacion: RTX PRO 6000 Blackwell. Otras GPU (A100, H100, RTX 4090) no aparecen en las mediciones publicadas.
- Sidecar MTP opcional: requiere GPU de 24 GB o mas.
- Despliegue: exclusivamente mediante `runmyai/tokenwing` (rama `dev` >= 6a3e018f) con el plugin `wv-plugin-v1.3`. No es compatible con llama.cpp estandar, Ollama, vLLM ni TGI sin adaptacion.
- Plataformas soportadas: Linux x86_64 (GLIBC <= 2.34) y Windows x86_64.
- Almacenamiento: los dos shards suman 80,3 GiB; en modo streaming por NVMe se leen 272-285 MiB por token, por lo que se recomienda SSD NVMe rapido.
- Throughput: 19,4-25,9 tok/s en configuracion de VRAM limitada; 52,8-67,4 tok/s en GPU completa.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Runtime |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next-WV-v5-3.5bpw-TokenWing | ~180B (MoE top-10/512) | hasta 32 768 en ejemplos | WV-v5 3,5 bpw (propietario) | Apache 2.0 | TokenWing + plugin externo |
| Qwen/Qwen3.8-Flash-Next (base) | ~180B (MoE top-10/512) | no disponible | safetensors originales | Apache 2.0 | transformers, vLLM, TGI |
| GGUFs estandar de MoE grandes (p. ej. familia Qwen3 MoE) | variable | variable | Q4_K_M, Q5_K_M, etc. | segun modelo | llama.cpp, Ollama |

La comparacion directa con alternativas de la misma categoria es limitada: no hay en la informacion proporcionada datos de benchmarks que permitan situar este checkpoint frente a otras cuantizaciones del mismo modelo base ni frente a MoE de tamano similar. La diferencia principal frente a un GGUF convencional es el formato propietario y el requisito de plugin, compensado por la capacidad de ejecutar el modelo con streaming de expertos desde disco.

## Limitaciones y advertencias

- Formato no estandar: el checkpoint no carga en llama.cpp, Ollama, vLLM ni TGI sin el plugin `wv-plugin-v1.3` y el runtime TokenWing. Esto limita la portabilidad y ata el despliegue a un proyecto concreto.
- Dependencia de un runtime en rama `dev`: el propio autor especifica una version minima (`>= 6a3e018f`) y advierte de que es codigo en desarrollo, con riesgo de cambios incompatibles.
- Rendimiento dependiente del almacenamiento: en modo streaming se leen 272-285 MiB por token desde NVMe; un SSD lento degrada drasticamente el throughput.
- Perdida de calidad por cuantizacion: 3,5 bpw es una precision agresiva; aunque el autor reporta paridad de logits CPU/CUDA y perplejidades bajas, no se han publicado evaluaciones en tareas de razonamiento o codigo que permitan descartar degradacion frente al modelo original.
- Idiomas soportados no documentados: no se puede garantizar calidad multilingue sin evaluacion propia.
- Sesgos y alucinaciones: no hay informacion especifica en la model card; deben asumirse los del modelo base Qwen3.8-Flash-Next, no documentados aqui.
- Datos de entrenamiento ausentes: se desconoce la composicion del dataset, el numero de tokens y si hubo alineacion por RLHF o DPO.
- Soporte comunitario minimo: 2 likes y 1422 descargas, con una unica fuente de plugins y assets en GitHub; riesgo de abandono o falta de mantenimiento.
- Uso comercial: la licencia Apache 2.0 lo permite, pero conviene verificar las condiciones del modelo base y del runtime TokenWing, que pueden tener licencias independientes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Grawnch/Qwen3.8-Flash-Next-WV-v5-3.5bpw-TokenWing
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Runtime TokenWing: https://github.com/runmyai/tokenwing
- Assets del plugin (release `wv-plugin-v1.3`): https://github.com/grawnchtoader/tokenwing-assets/releases/tag/wv-plugin-v1.3
- Sidecar MTP y assets del modelo: https://huggingface.co/Grawnch/TokenWing-Model-Assets
