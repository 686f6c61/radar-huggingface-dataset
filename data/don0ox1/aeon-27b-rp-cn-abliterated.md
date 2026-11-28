# don0ox1/AEON-27B-RP-cn-abliterated

## Resumen

AEON-27B-RP-cn-abliterated es un ajuste fino (fine-tune) en chino para juegos de rol conversacional, desarrollado por el usuario don0ox1 sobre el modelo base AEON-7/Qwen3.8-27B-AEON-ULTIMATE-UNCENSORED-BF16, que a su vez deriva de Qwen3.8-27B tras un proceso de abliteration (eliminacion de direcciones de rechazo). El modelo resuelve el problema de generar dialogos de rol coherentes y sostenidos en chino con personajes consistentes, incluyendo escenarios de tres voces (PNJ y protagonista en la misma respuesta) y escenas de tension implicita sin descripciones explicitas.

Tecnicamente es un transformer denso de la familia Qwen3.5 con 64 capas, hidden size de 5120 y un vocabulario de 248.320 tokens, con una longitud de contexto nativa de 262.144 tokens. El ajuste se realizo mediante QLoRA (4-bit NF4 con doble cuantizacion, r=16, alpha=32) aplicado exclusivamente a las proyecciones MLP (gate_proj, up_proj, down_proj), sin tocar las capas de linear attention.

Es relevante ahora porque la version v5 (checkpoint 700) incorpora mejoras sustanciales frente a v4: perplexity de 3,01 frente a 4,29, recuperacion de capacidades generales de asistente (700 muestras mixtas de chat y razonamiento) y nuevas capacidades de dialogo a tres bandas. El modelo se distribuye con pesos completos BF16, adaptadores LoRA en PEFT y GGUF, y cuantizaciones Q3_K_M y Q4_K_M listas para usar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5 (transformer denso con linear attention), 64 capas, hidden 5120 |
| Parametros totales | 27.781.427.952 (27,78 B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 262.144 tokens nativos; recomendado 16K-32K en inferencia con 16 GB de VRAM |
| Tipos de cuantizacion | BF16 (pesos completos), QLoRA 4-bit NF4, GGUF Q3_K_M (13,55 GB) y Q4_K_M (16,68 GB) |
| Idiomas soportados | Chino (zh) principalmente; incluye 171 muestras de entrenamiento en ingles |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (BF16 y adaptadores PEFT), GGUF |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.8-27B, al que se le aplico abliteration para eliminar los mecanismos de rechazo, dando lugar al base AEON-7/Qwen3.8-27B-AEON-ULTIMATE-UNCENSORED-BF16. Sobre ese base se aplico un QLoRA con rango 16 y alpha 32, con adaptadores unicamente en las proyecciones MLP (gate_proj, up_proj, down_proj), dejando intactas las capas de linear attention. El entrenamiento se realizo en tres iteraciones encadenadas (v3, v4 y v5), partiendo la v5 del adaptador v4 en el checkpoint 900.

El dataset de la v5 consta de 3.247 muestras nuevas (1,18 M de tokens), con un 52,4 % de etiquetas efectivas usando loss solo sobre turnos del asistente. Se entrenaron 2,9 epocas hasta detectar sobreajuste, seleccionando el checkpoint 700 (epoch 1,82) como optimo. Los parametros entrenables fueron 69,2 M sobre 26,97 B (0,257 %). La perdida de evaluacion minima fue 1,1023 con perplexity de 3,01, frente a 4,29 en v4. La composicion del dataset incluye 700 muestras generales (249 de asistente en chino, 171 en ingles y 300 de razonamiento) para recuperar capacidades no relacionadas con el rol.

## Capacidades

- Generacion de texto narrativo y dialogos de rol en chino con mantenimiento de personaje y estilo.
- Dialogo a tres bandas: el modelo puede interpretar simultaneamente un PNJ del escenario y el protagonista del usuario en la misma respuesta, usando prefijos de identidad.
- Escenas de tension implicita: genera conversaciones sugerentes mediante lenguaje no explicito (miradas, distancias, silencios).
- Entrada directa en personaje sin system prompt: responde como el personaje aunque no se defina rol explicito.
- Capacidades generales de asistente recuperadas: 700 muestras mixtas de chat y razonamiento, con pruebas de codigo (6/6 en ejercicios como deduplicacion de listas, inversion de cadenas, two-sum, Fibonacci en O(log n), cache LRU y fusion de intervalos).
- Soporte de tool calling / function calling: no documentado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado; el modelo esta orientado a rol, no a tareas agenticas.
- Capacidades multilingues: principalmente chino; el ingles aparece de forma limitada en el dataset.
- Modo thinking: soportado por la plantilla Qwen3.5, pero debe desactivarse (`enable_thinking=false`) para evitar residuos `` en la salida.

## Casos de uso

- Motores de rol conversacional en chino: el modelo mantiene personajes consistentes en conversaciones multi-turno y entra directamente en personaje sin system prompt, lo que simplifica la integracion en aplicaciones de ficcion interactiva.
- Novelas visuales y juegos de texto: la capacidad de dialogo a tres bandas permite que el motor genere tanto las respuestas de los PNJ como las intervenciones del protagonista, reduciendo la logica de orquestacion en el cliente.
- Escritura asistida de ficcion: util para generar dialogos con tension implicita y subtramas romanticas sin descripciones explicitas, adecuado para plataformas con moderacion de contenido.
- Simulacion de personajes para entrenamiento o prototipado: con 262.144 tokens de contexto nativo y 16K-32K practicos, permite mantener el estado de una escena larga con multiples personajes y objetos descritos en el prompt.
- Despliegue local en GPU de consumo: las cuantizaciones Q3_K_M (13,55 GB) y Q4_K_M (16,68 GB) caben en tarjetas de 16 GB, lo que permite ejecutar el modelo en estaciones de trabajo sin infraestructura de servidor.
- Chat de acompanamiento en chino: el modelo puede sostener conversaciones afectivas o de rol ligero con un tono consistente, aunque con las limitaciones de contexto y alucinacion descritas mas abajo.
- Generacion de guiones de dialogo para doblaje o audiolibros: la estructura de prefijos por identidad facilita el parseo posterior y la asignacion de lineas a voces.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| eval_loss (step 700) | 1,1023 |
| Perplexity (step 700) | 3,01 (v4: 4,29) |
| Parametros entrenables | 69,2 M / 26,97 B (0,257 %) |
| Pruebas de codigo | 6/6 (deduplicacion, inversion, two-sum, Fibonacci O(log n), LRU, fusion de intervalos) |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: Q3_K_M requiere aproximadamente 13,55 GB de pesos mas KV cache; Q4_K_M unos 16,68 GB. Con KV cache en q8_0 y 16 GB de VRAM se recomienda configurar 32K de contexto; con f16, 24K; con q4_0, hasta 64K.
- GPU recomendadas: RTX 4090 (24 GB) para Q4_K_M con contexto amplio; RTX 4080/4070 Ti Super (16 GB) para Q3_K_M con 24K-32K de contexto; A100/H100 para BF16 completo o despliegues multi-usuario.
- Cabe en GPU de consumo: si, en tarjetas de 16 GB o mas con cuantizacion Q3_K_M o Q4_K_M.
- Opciones de despliegue: Ollama (requiere version 0.40.18 o superior por el soporte de linear attention de Qwen3.5), Transformers con bitsandbytes y PEFT, llama.cpp con exportacion de LoRA (`llama-export-lora`) partiendo de base BF16/FP16.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| AEON-27B-RP-cn-abliterated (v5) | 27,78 B | 262.144 nativo; 16K-32K practico | Apache-2.0 | Rol en chino, tres voces, sin censura |
| AEON-7/Qwen3.8-27B-AEON-ULTIMATE-UNCENSORED-BF16 (base) | 27,78 B | 262.144 | Apache-2.0 | Base sin censura, sin ajuste de rol |
| don0ox1/Qwen3-8B-Roleplay-CN-v7 | 8 B (aproximado) | no disponible | no disponible | Rol en chino para baja VRAM y movil |
| Qwen/Qwen3.8-27B (original) | 27,78 B | 262.144 | no disponible | Modelo general con alineamiento estandar |

## Limitaciones y advertencias

- El modelo es un fine-tune de rol: sus capacidades de asistente general estan degradadas respecto al base, aunque la v5 las ha recuperado parcialmente con 700 muestras mixtas.
- Riesgo de alucinacion alto en tareas factuales: el entrenamiento esta orientado a ficcion y dialogo, no a precision factual.
- La ventana de contexto practica es muy inferior a la nativa: el autor advierte que 16K-32K es el limite realista para mantener el personaje con 16 GB de VRAM, y que la ventana nativa de 262.144 no garantiza coherencia a larga distancia.
- Idioma: el modelo esta entrenado principalmente en chino; el rendimiento en castellano no esta documentado y probablemente sea deficiente.
- Requiere desactivar el modo thinking: si el framework no pasa `enable_thinking=false`, la salida incluye residuos `` que rompen el formato.
- Los prompts largos (mas de 2000 caracteres) degradan la calidad; el autor recomienda prompts concisos y descripciones de objetos o apariencia mediante palabras clave cortas, no frases naturales.
- Modelo abliterated: se han eliminado los mecanismos de rechazo, por lo que puede generar contenido inapropiado sin filtros. La licencia Apache-2.0 permite uso comercial, pero el deployer es responsable del cumplimiento normativo y de moderacion.
- El autor advierte que la exportacion de LoRA sobre bases ya cuantizadas produce resultados de precision mixta y degrada la calidad; es necesario partir de BF16.
- No hay datos publicados de benchmarks estandar ni de rendimiento en produccion (latencia, throughput).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/don0ox1/AEON-27B-RP-cn-abliterated
- Modelo base: https://huggingface.co/AEON-7/Qwen3.8-27B-AEON-ULTIMATE-UNCENSORED-BF16
- Version 8B para baja VRAM: https://huggingface.co/don0ox1/Qwen3-8B-Roleplay-CN-v7
- Modelo original Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
