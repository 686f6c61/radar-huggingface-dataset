# niatheelf777/xiaofeiyu-12b-v4

## Resumen

Xiaofeiyu-12B-v4 es un adaptador LoRA (PEFT) publicado por el usuario niatheelf777 sobre el modelo base `google/gemma-4-12B-it`. Se distribuye como un conjunto de cinco "sliders" o perfiles de personalidad conversacional (`s0` como base y cuatro variantes: `c1_neko_clingy`, `c2_older_tease`, `c3_brat_mesugaki`, `c4_fragile_porcelain`) orientados a la conversacion en chino e ingles. El autor lo presenta como el motor del sitio https://xfy.tospeak.top.

La propuesta tecnica se centra en una topologia de adaptador muy restringida: solo se entrenan 48 modulos lineales de las capas 36 a 47, excluyendo por completo las proyecciones QKV, con 12.713.984 parametros entrenables por perfil a rango 16 y alpha 32. Esta selectividad busca reducir la interferencia entre perfiles y permitir combinar los cinco LoRA simultaneamente en una GPU de consumo de 12 GB junto con el modelo base cuantizado en `UD-Q4_K_XL`.

El modelo es relevante para quien investigue tecnicas de personalizacion ligera de LLM, decodificacion especulativa por fases (split-phase) y despliegue de multiples adaptadores sobre un mismo base. No obstante, la informacion disponible es limitada: el autor no publica detalles del dataset de entrenamiento, no hay datos de benchmarks estandar (MMLU, HumanEval, GSM8K) y el repositorio tiene cero descargas, por lo que debe tratarse como un artefacto experimental.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer decoder `google/gemma-4-12B-it`; modulos objetivo `o_proj`, `gate_proj`, `up_proj`, `down_proj` en capas 36..47 |
| Parametros totales | 12.713.984 parametros entrenables por perfil (adaptador); el modelo base no se incluye en el repo |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el autor menciona cache KV de 8K en su configuracion de despliegue) |
| Tipos de cuantizacion | El autor recomienda `UD-Q4_K_XL` (imatrix) para el modelo base; no se detallan otras cuantizaciones |
| Idiomas soportados | chino (`zh`) e ingles (`en`) |
| Licencia | apache-2.0 (el uso del modelo base queda sujeto a los Gemma Terms of Use) |
| Formato de pesos | safetensors (PEFT) y GGUF (tag del repo) |

## Arquitectura y entrenamiento

El adaptador se aplica exclusivamente sobre 48 modulos lineales de las 12 capas superiores (36 a 47) del modelo base Gemma-4-12B-it, con `rank=16` y `alpha=32.0`. No se tocan las proyecciones QKV, lo que segun el autor produce una deriva de paridad FP32 de 0.0 en la puerta de activacion `<|"|>` (token ID 52) entre entrenamiento e inferencia. El conjunto de cinco perfiles se describe como un subespacio ortogonal: el coseno medio por pares entre matrices de pesos es 0.0746, lo que el autor cuantifica como 5.4 veces menos interferencia que LoRA de capa completa, y cumple la adicion de normas pitagorica con un 1.1% de error.

No se especifica en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, ni si se emplearon tecnicas de RLHF o DPO. El autor menciona una "Split-Phase bubble decoding" como innovacion de inferencia, implementada en un servidor propio (`pc2_split_phase_server.py`) que se conecta a `llama-server`, pero no se detalla su funcionamiento interno mas alla de la paridad de activacion con la puerta de entrenamiento.

## Capacidades

- Generacion de texto conversacional multi-turno en chino e ingles, orientada a dialogos de compania y personalidad.
- Cinco perfiles de estilo intercambiables (`s0`, `c1_neko_clingy`, `c2_older_tease`, `c3_brat_mesugaki`, `c4_fragile_porcelain`) combinables en una misma sesion.
- Soporte de tool calling y sintaxis multi-hop segun las pruebas del autor (TC1 + TC2: 7/7).
- Razonamiento multi-paso y pruebas de ingenieria/algoritmia (GEN1..5: 5/5 segun el autor).
- Ejecucion de herramientas como `calc_python` con invariancia de resultado (278.625 en 5/5 pruebas).
- Capacidades matematicas y de composicion de poemas dentro de conversaciones de 42 turnos (12/12 segun el autor).
- No se documentan capacidades de vision, audio ni modo "thinking" explicito.

## Casos de uso

- Chat de compania con personalidad configurable: los cinco perfiles permiten desplegar un mismo backend con distintas voces conversacionales sin recargar el modelo base, cambiando solo el adaptador activo.
- Investigacion sobre interferencia entre adaptadores: el subespacio ortogonal documentado (coseno 0.0746) sirve para estudiar composicion de LoRA y suma de normas en modelos de 12B.
- Despliegue en GPU de consumo: la configuracion recomendada (`UD-Q4_K_XL` + KV cache 8K + 5 LoRA) cabe en 9.12 GiB de VRAM, lo que permite prototipar en tarjetas de 12 GB.
- Pruebas de decodificacion especulativa: el servidor split-phase incluido permite evaluar tecnicas de aceleracion con paridad FP32 respecto al entrenamiento.
- Evaluacion de tool calling en conversacion: los probes TC1/TC2 documentan el uso de herramientas dentro de dialogos largos, util para validar pipelines de agentes conversacionales.
- Generacion de dialogos sinteticos en chino para aumento de datos: el modelo produce conversaciones multi-turno con estilos controlados, aprovechable para construir datasets de entrenamiento conversacional.

## Benchmarks y rendimiento

Los unicos datos publicados son las pruebas internas del autor, sin comparacion con benchmarks estandar:

| Prueba | Objetivo | Xiaofeiyu-12B-v4 (PC2) | Full-48 Always-On v3 |
|---|---|---|---|
| Distancia W1 en burbuja de chat humano | < 4.0 caracteres | 2.52 – 3.87 caracteres (mediana 9–10) | no disponible |
| 42 turnos diarios + push-pull + IQ mate/poesia | >= 11/12 | 12/12 (100%) | 7/12 (58.3%) |
| Sondas de ingenieria y algoritmia (GEN1..5) | 5/5 | 5/5 (100%) | 2/5 (40.0%) |
| Sintaxis multi-hop de herramientas y memoria (TC1 + TC2) | 7/7 | 7/7 (100%) | 1/4 (25.0%) |
| Fugas de higiene (emoji, corchetes, cantonés, groserias) | 0 | 0 en 78 turnos | no disponible |
| Sintaxis de 5 perfiles e invariancia de `calc_python` (278.625) | 100% | 29/29 sintaxis, 5/5 exacto | no disponible |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: 9.12 GiB para el modelo base en `UD-Q4_K_XL` mas cache KV de 8K y los cinco LoRA simultaneamente, segun el autor.
- GPU recomendadas: no se especifican modelos concretos; la configuracion apunta a tarjetas de 12 GB de VRAM.
- Cabe en GPU de consumo: si, en tarjetas con al menos 12 GB (por ejemplo, RTX 3060 12 GB, RTX 4070, RTX 4080) segun la cifra de 9.12 GiB.
- Opciones de despliegue: `llama-server` con `server/launch_local.py --preset 12b` y el servidor split-phase `server/pc2_split_phase_server.py`; el repo incluye pesos GGUF.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Xiaofeiyu-12B-v4 | 12.7M entrenables por perfil (base 12B) | no disponible | apache-2.0 (base Gemma Terms) | LoRA de 48 modulos, 5 perfiles, despliegue en 12 GB |
| google/gemma-4-12B-it | 12B | no disponible | Gemma Terms of Use | Modelo base sin personalizacion |
| Full-48 Always-On v3 (mismo autor) | no disponible | no disponible | no disponible | Variante previa con LoRA en todas las capas; peor en las pruebas del autor |

No se dispone de datos de benchmarks estandar que permitan comparar el rendimiento con alternativas de la misma categoria.

## Limitaciones y advertencias

- El repositorio tiene cero descargas y cero likes, y fue creado y actualizado el mismo dia; no hay evidencia de uso en produccion por terceros.
- No se documenta el dataset de entrenamiento, el numero de tokens ni el proceso de alineacion, lo que impide evaluar sesgos y calidad fuera de las pruebas del autor.
- Los benchmarks presentados son internos y autoinformados, sin comparacion con suites estandar; deben tomarse con cautela.
- Solo se declaran chino e ingles; el rendimiento en castellano no esta verificado.
- El uso comercial del modelo base esta sujeto a los Gemma Terms of Use, aunque el adaptador se publique como apache-2.0.
- La decodificacion split-phase depende de un servidor propio del autor; no hay garantia de mantenimiento ni de compatibilidad con versiones futuras de `llama.cpp`.
- Riesgo de alucinacion y de deriva de personalidad no cuantificado en la informacion disponible.
- Los perfiles `c1` a `c4` incluyen estilos marcados (teasing, brat, fragilidad); su uso en atencion al cliente real requeriria validacion adicional.

## Enlaces

- Hugging Face: https://huggingface.co/niatheelf777/xiaofeiyu-12b-v4
- Demo/sitio del autor: https://xfy.tospeak.top
- Modelo base: https://huggingface.co/google/gemma-4-12B-it
- Terminos de uso de Gemma: https://ai.google.dev/gemma/terms
