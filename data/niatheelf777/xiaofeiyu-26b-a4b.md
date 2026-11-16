# niatheelf777/xiaofeiyu-26b-a4b

## Resumen

Xiaofeiyu-26b-a4b es un adaptador LoRA (PEFT) publicado por el usuario niatheelf777 sobre el modelo base `google/gemma-4-26B-A4B-it`, un transformer MoE de Google con 26.000 millones de parametros totales y aproximadamente 4.000 millones activos por token. El adaptador no es un modelo completo: el repositorio contiene unicamente los pesos del adaptador (7.204.864 parametros, 0,1 GB), que deben combinarse con el modelo base para su uso. Su proposito declarado es inyectar un conjunto de cuatro "personalidades" conversacionales (cartuchos) combinables linealmente mediante cinco sliders en tiempo de inferencia.

La innovacion tecnica que declara el autor es una "Split-Phase Token-Gated Inference": el adaptador se desactiva (LoRA = 0.0) durante el razonamiento y la generacion de codigo, y se activa (LoRA = w) unicamente dentro de los delimitadores de burbuja de dialogo `<|"|>`. Segun la model card, esto preserva la generacion de codigo (`GEN1..5` con 5/5) y la precision de la herramienta `calc_python` del modelo base, al tiempo que acelera la decodificacion en un solo stream hasta 192-233 tok/s con 3.800 millones de parametros activos por token.

El modelo esta etiquetado para chino (zh) e ingles (en), con licencia Apache 2.0 para el adaptador, aunque el uso del modelo base queda sujeto a los Terminos de Uso de Gemma de Google. Es relevante como ejemplo de composicion modular de comportamiento mediante LoRA sobre una arquitectura MoE, pero conviene tratarlo con cautela: el repositorio no tiene descargas ni likes, no publica benchmarks y parte de un modelo base cuya existencia no esta verificada de forma independiente en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer MoE `google/gemma-4-26B-A4B-it` |
| Parametros totales | 7.204.864 (adaptador); modelo base: 26B |
| Parametros activos | 3,8B por token (modelo base MoE, segun model card) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (tag del repo); niveles concretos no disponibles |
| Idiomas soportados | zh, en |
| Licencia | Apache 2.0 (adaptador); modelo base sujeto a Gemma Terms of Use |
| Formato de pesos | safetensors (PEFT) y GGUF |
| Modulos adaptados | capas superiores no-QKV (output/MLP); 0 modulos Q/K/V |
| Cartuchos de personalidad | 4 (`c1_neko_clingy`, `c2_older_tease`, `c3_brat_mesugaki`, `c4_fragile_porcelain`) |
| Mezcla en runtime | 5 sliders lineales (`w0..w4`) via `model="xiaofeiyu-v4|w0,w1,w2,w3,w4"` |
| Libreria | peft |
| Tamano del repo | 0,1 GB |

## Arquitectura y entrenamiento

El adaptador se aplica sobre un transformer con mezcla de expertos (MoE) del que la model card indica 26B de parametros totales y 3,8B activos por token. La inyeccion LoRA se limita a modulos de salida y MLP de las capas superiores, excluyendo explicitamente los modulos Q/K/V (0 modulos adaptados de atencion), con el objetivo declarado de preservar la coherencia de la cache KV hibrida local/global del modelo base. El repositorio incluye ademas pesos en formato GGUF, lo que sugiere un flujo de conversion para inferencia en llama.cpp u Ollama, aunque no se detallan los niveles de cuantizacion ni el procedimiento.

La innovacion principal es el "Split-Phase Token-Gated Inference": un mecanismo de compuerta por token que mantiene el LoRA a peso cero durante las fases de razonamiento y codigo, y lo activa solo dentro de los delimitadores `<|"|>` propios del dialogo. Segun el autor, esto conserva las capacidades del modelo base (generacion de codigo `GEN1..5` con 5/5 y la herramienta `calc_python`) y permite una decodificacion de 192-233 tok/s. La composicion de comportamiento se realiza mediante mezcla lineal convexa de cuatro cartuchos de personalidad en tiempo de inferencia. No se dispone de informacion sobre el volumen de datos de entrenamiento, la composicion del dataset, el uso de RLHF/DPO ni la metodologia de evaluacion.

## Capacidades

- Generacion de texto conversacional multi-turno en chino e ingles.
- Razonamiento y generacion de codigo heredados del modelo base, con el adaptador desactivado durante estas fases (`GEN1..5` reportado como 5/5).
- Tool calling: la model card menciona precision preservada en la herramienta `calc_python`.
- Composicion de personalidad en runtime mediante cinco sliders lineales sobre cuatro cartuchos.
- Conmutacion condicionada por token entre comportamiento base y comportamiento adaptado (split-phase gating).
- Capacidades multimodales, de vision o audio: no disponibles en la informacion proporcionada.
- Modo de razonamiento explicito (thinking mode): no disponible en la informacion proporcionada.

## Casos de uso

- Prototipado de personajes conversacionales: el sistema de cinco sliders permite generar variantes de tono (sumiso, burlon, tsundere, fragil) sin reentrenar, ajustando los pesos `w0..w4` en cada peticion.
- Evaluacion de mezcla de comportamientos: util para investigar como afecta la interpolacion lineal de adaptadores LoRA a la coherencia y consistencia de un chatbot sobre un mismo backbone.
- Asistentes de chat en chino e ingles: el modelo cubre ambos idiomas y el adaptador se activa solo en los turnos de dialogo, manteniendo el resto del pipeline en el modelo base.
- Integracion en pipelines con tool calling: al preservar la herramienta `calc_python` del modelo base, puede usarse en flujos que combinen conversacion y calculo estructurado.
- Despliegue ligero del adaptador: con 0,1 GB de pesos, permite distribuir variantes de personalidad como artefactos pequenos sobre un unico modelo base compartido, reduciendo coste de almacenamiento.
- Investigacion sobre gating por token: el mecanismo split-phase es un caso de estudio para separar fases de razonamiento y dialogo en un mismo modelo sin degradar tareas de codigo.

## Benchmarks y rendimiento

| Metrica | Resultado declarado |
|---|---|
| Generacion de codigo `GEN1..5` | 5/5 (segun model card) |
| Precision de herramienta `calc_python` | preservada (sin cifra) |
| Throughput de decodificacion single-stream | 192-233 tok/s |
| Parametros activos por token | 3,8B |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. Las cifras anteriores proceden exclusivamente de la model card del autor y no han sido verificadas de forma independiente.

## Requisitos de hardware

- VRAM estimada para el adaptador: despreciable (0,1 GB); el coste real lo determina el modelo base de 26B.
- Inferencia del modelo base en BF16: aproximadamente 52 GB de VRAM, lo que exige A100 80GB, H100 o configuraciones multi-GPU.
- Cuantizacion en 8 bits: aproximadamente 26 GB, viable en una RTX 4090 de 24 GB solo con cuantizaciones mas agresivas o offloading.
- Cuantizacion en 4 bits: aproximadamente 13-15 GB, cabe en RTX 4090, RTX 3090 y GPUs consumer de 16 GB o mas.
- Opciones de despliegue: vLLM o TGI para el modelo base en precision alta; llama.cpp u Ollama para los pesos GGUF incluidos en el repo.
- Throughput declarado: 192-233 tok/s en decodificacion single-stream con 3,8B parametros activos por token.
- Latencia: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| xiaofeiyu-26b-a4b | 7,2M adaptador / 26B base (3,8B activos) | no disponible | Apache 2.0 (adaptador) | safetensors, GGUF | LoRA de personalidad con gating por token |
| google/gemma-4-26B-A4B-it | 26B (3,8B activos) | no disponible | Gemma Terms of Use | safetensors | Modelo base sin adaptar; referencia de capacidades |
| Adaptadores LoRA convencionales sobre MoE | variable | heredado del base | segun autor | safetensors | Sin gating por token ni mezcla lineal de cartuchos |

No se dispone de datos de rendimiento comparativo con alternativas de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- El repositorio no tiene descargas ni likes y fue creado y actualizado en el mismo minuto, lo que sugiere una publicacion sin validacion comunitaria.
- No se publican benchmarks estandar ni evaluaciones independientes; las cifras de rendimiento provienen solo de la model card.
- El modelo base `google/gemma-4-26B-A4B-it` no esta verificado de forma independiente en la informacion disponible; conviene confirmar su existencia y disponibilidad antes de usarlo.
- El adaptador debe combinarse con el modelo base; no es utilizable de forma autonoma.
- Riesgo de alucinacion inherente al modelo base, no cuantificado.
- Sesgos conocidos: no disponibles; los cartuchos de personalidad pueden introducir sesgos de genero o de rol no evaluados.
- Cobertura linguistica limitada a chino e ingles; el rendimiento en castellano no esta documentado.
- Uso comercial: el adaptador es Apache 2.0, pero el modelo base queda sujeto a los Gemma Terms of Use, que imponen restricciones adicionales.
- El mecanismo de gating por token depende de delimitadores especificos (`<|"|>`); un formateo incorrecto del prompt puede desactivar o activar el adaptador en fases no deseadas.
- No hay informacion sobre longitud de contexto, datos de entrenamiento ni metodologia de evaluacion.

## Enlaces

- Hugging Face: https://huggingface.co/niatheelf777/xiaofeiyu-26b-a4b
- Modelo base referenciado: https://huggingface.co/google/gemma-4-26B-A4B-it
- Terminos de Uso de Gemma: https://ai.google.dev/gemma/terms
