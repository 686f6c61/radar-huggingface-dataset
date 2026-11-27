# elorri/inkling-2-mini-zbook-48k

## Resumen

Inkling 2 Mini es un modelo de lenguaje desarrollado por Thinking Machines Lab, publicado como modelo base en Hugging Face. Esta ficha concreta, `elorri/inkling-2-mini-zbook-48k`, no redistribuye pesos nuevos: es un perfil reproducible de inferencia local que documenta cómo ejecutar el modelo base en un portátil de gama alta con GPU de 8 GB de VRAM, usando el cuantizado GGUF `UD-IQ3_XXS` publicado por Unsloth con los pesos intactos.

El interés de la ficha reside en la configuración de despliegue: reparto de expertos entre CPU y GPU, caché KV cuantizada a `q8_0` y una ventana de contexto configurada de 49 152 tokens. El autor valida el perfil con tres pruebas de aproximadamente 43 700 a 43 860 tokens de entrada que recuperan identificadores dispersos y completan una llamada a herramienta nativa, con un pico de VRAM de 7849 MiB y un throughput de 16,02 a 16,40 tokens/s en los turnos de herramienta.

La relevancia práctica es que demuestra que un modelo con arquitectura de mezcla de expertos (MoE, a juzgar por el patrón `ffn_.*_exps.weight` de la configuración de llama.cpp) puede operar con contexto largo en hardware de consumo profesional, a costa de un throughput moderado y de una ventana recomendada de 48K en lugar de 64K. No se dispone de parámetros totales, número de tokens de entrenamiento ni resultados de benchmarks del modelo base en la información proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) inferida del patrón de tensores `ffn_.*_exps.weight`; detalles del modelo base no disponibles |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | 49 152 tokens configurados en el perfil; 48K recomendado para uso interactivo; validada una entrada de 87 108 tokens con `IQ4_NL` |
| Tipos de cuantizacion | GGUF `UD-IQ3_XXS` (perfil principal); `IQ4_NL` (prueba de contexto extendido); caché KV `q8_0` y `q4_0` |
| Idiomas soportados | español (es) e inglés (en) |
| Licencia | MIT |
| Formato de pesos | GGUF (llama.cpp); pesos originales del modelo base en formato no disponible |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base `thinkingmachines/Inkling-2-Mini`. La configuración de llama.cpp del perfil aplica un patrón de offload `blk\.([0-5]|1[4-9]|2[0-3])\.ffn_.*_exps\.weight=CPU`, lo que indica la presencia de tensores de expertos por bloque (`ffn_*_exps.weight`), consistente con una arquitectura de mezcla de expertos con al menos 24 bloques. El patrón deja los expertos de los bloques 6 a 13 en GPU y el resto en RAM, una técnica típica para modelos MoE que no caben íntegramente en VRAM.

No se dispone de datos sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO u otras fases de alineamiento. Tampoco se documentan innovaciones como decodificación especulativa o atención lineal. El perfil de inferencia sí emplea `--jinja` para plantillas de chat, `--reasoning-budget 512` para limitar el presupuesto de razonamiento y `--no-reasoning-preserve` para no conservar el bloque de razonamiento entre turnos.

## Capacidades

- Generación de texto en español e inglés.
- Razonamiento con presupuesto configurable (`--reasoning-budget`), lo que sugiere un modo de pensamiento acotado.
- Llamada a herramientas nativa: las pruebas del perfil completan una llamada a herramienta y la respuesta posterior a su resultado.
- Recuperación de información en contextos largos: localiza identificadores dispersos en entradas de más de 43 000 tokens.
- Capacidad de agente multi-paso: el piloto de Keygen Bench muestra composición y guardado autónomo de un módulo FastTracker II en 28 min 53 s.
- Inferencia local en llama.cpp con soporte de plantillas Jinja.
- No se documentan capacidades de visión, audio ni otras modalidades.

## Casos de uso

- Análisis de documentos largos en local: con 49 152 tokens de contexto, el modelo puede procesar informes, contratos o expedientes completos y responder preguntas sobre ellos sin salir del equipo, útil para entornos con requisitos de privacidad.
- Asistentes de código con tool calling: la llamada a herramienta nativa validada permite integrar el modelo en flujos que consultan APIs, ejecutan comandos o leen archivos, con un throughput de 16 tokens/s suficiente para uso interactivo.
- Automatización de tareas creativas por agentes: el caso de Keygen Bench demuestra que puede componer y guardar artefactos binarios (un módulo XM) dentro de un presupuesto de tiempo, aplicable a generación de contenido estructurado.
- Procesamiento por lotes en portátiles de trabajo: el perfil cabe en 8 GB de VRAM con 64 GiB de RAM, lo que permite desplegar el modelo en estaciones móviles sin GPU de datacenter.
- Recuperación aumentada sobre corpus extensos: la ventana de 48K permite incluir muchos fragmentos recuperados en un solo prompt, reduciendo la necesidad de pipelines de reranking agresivos.
- Laboratorios de evaluación de agentes: la ficha incluye un comprobador (`check_long_context.py`) y resultados en JSON, útiles para reproducir pruebas de contexto largo y de tool calling en hardware modesto.
- Desarrollo y depuración de prompts: el servidor local en `http://127.0.0.1:8091/` facilita iterar sobre plantillas y presupuestos de razonamiento sin coste de API.

## Benchmarks y rendimiento

Los únicos datos disponibles son los del perfil de inferencia local, no benchmarks académicos del modelo base.

| Prueba | Entrada (tokens) | Llamada (tokens/s) | Respuesta tras herramienta (tokens/s) |
|---|---:|---:|---:|
| Semilla 54 | 43 765 | 16,25 | 16,22 |
| Semilla 55 | 43 712 | 16,02 | 16,40 |
| Semilla 56 | 43 862 | 16,05 | 16,27 |

- Pico de VRAM muestreado: 7849 MiB.
- Prueba de contexto extendido: entrada de 87 108 tokens con `IQ4_NL` y caché `q4_0` en RAM, a unos 4 tokens/s.
- Dos pruebas de 64K con caché `q8_0`: una quedó por debajo de 15 tokens/s en los turnos de herramienta.
- Keygen Bench (piloto privado): módulo «ECHO DRIVE» de ocho canales a 146 BPM entregado en 28 min 53 s con presupuesto de 30 minutos; puntuación de 45,1/100 en Audiobox Aesthetics local. El intento de 20 minutos no guardó un XM.

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM: 8 GB suficientes con el perfil `UD-IQ3_XXS` y reparto de expertos a CPU; pico medido de 7849 MiB.
- RAM: 64 GiB en el equipo de prueba (HP ZBook Fury G1i, Intel Core Ultra 7 255HX).
- GPU del perfil: NVIDIA RTX PRO 2000 Blackwell Laptop con 8 GB de VRAM; driver 596.58 en Windows 11 Pro.
- Cabe en GPU de consumo con 8 GB o más si se aplica el mismo reparto de expertos; no se documentan pruebas en RTX 4090, A100 o H100.
- Motor: llama.cpp build `b12613` con CUDA 13.5 (commit `362ac929749d56e433878585a8506f24968698b4`).
- Opciones de despliegue: `llama-server` con `--jinja`, `-fa on`, `-ngl 99`, `-ot` para offload de expertos, `-ctk q8_0 -ctv q8_0`; no se mencionan vLLM, TGI ni Ollama.
- Throughput: 16,02 a 16,40 tokens/s en turnos de herramienta con contexto de ~43K; ~4 tokens/s con 87K tokens y cuantización más agresiva.
- Latencia: no se reporta el tiempo de procesamiento de la entrada; las cifras de generación lo excluyen.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables de Thinking Machines Lab ni de alternativas del mismo tamaño con las que contrastar parámetros, contexto o rendimiento. Los datos de la ficha no permiten establecer una comparativa rigurosa; se indica "no disponible".

## Limitaciones y advertencias

- Los resultados provienen de un único equipo y una única configuración; no son extrapolables a otro hardware sin validación.
- Con 64K de contexto y caché `q8_0`, una de dos pruebas quedó por debajo de 15 tokens/s en turnos de herramienta; el perfil recomendado es de 48K.
- El contexto de 87K solo se validó con `IQ4_NL` y caché `q4_0` en RAM, a unos 4 tokens/s, lo que limita su uso interactivo.
- No se dispone de información sobre sesgos, tasa de alucinación ni evaluación de seguridad del modelo base.
- El soporte de idiomas se limita a español e inglés según la model card; no se documentan otros idiomas.
- La licencia MIT del perfil aplica a la configuración distribuida; conviene verificar la licencia del modelo base `thinkingmachines/Inkling-2-Mini` antes de uso comercial.
- El perfil depende de una revisión concreta del GGUF de Unsloth (`ae9327c5fbc7333116ba32eee78bb5d2bbefae4f`); debe verificarse el SHA-256 antes de arrancar.
- El uso de `--reasoning-budget 512` y `--no-reasoning-preserve` condiciona el comportamiento del modo de razonamiento; cambiarlos altera los resultados observados.
- No hay datos publicados de benchmarks estándar que permitan evaluar la calidad del modelo frente a alternativas.

## Enlaces

- Ficha del perfil: https://huggingface.co/elorri/inkling-2-mini-zbook-48k
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- GGUF de Unsloth: https://huggingface.co/unsloth/Inkling-2-Mini-GGUF/blob/ae9327c5fbc7333116ba32eee78bb5d2bbefae4f/Mainline_Support/Inkling-2-Mini-UD-IQ3_XXS.gguf_file
- Motor llama.cpp (build b12613): https://github.com/ggml-org/llama.cpp/releases/tag/b12613
- Keygen Bench: https://github.com/Microck/keygen-bench
- Resultados de contexto a 48K: `resultados-48k.json` (incluido en el repositorio del perfil)
- Resultado de «ECHO DRIVE»: `keygen-echo-drive.json` (incluido en el repositorio del perfil)
- Comprobador de contexto: `check_long_context.py` (incluido en el repositorio del perfil)
