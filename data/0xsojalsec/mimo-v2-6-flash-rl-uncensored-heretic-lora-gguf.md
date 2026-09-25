# 0xSojalSec/MiMo-V2.6-Flash-RL-Uncensored-Heretic-LoRA-GGUF

## Resumen

Este repositorio contiene un adaptador LoRA de rango 1 publicado por el usuario 0xSojalSec que aplica una abliteración (supresión quirúrgica del comportamiento de rechazo) sobre el modelo base XiaomiMiMo/MiMo-V2.6-Flash-RL, un transformer MoE de 309.000 millones de parámetros totales y 15.000 millones activos con licencia MIT. El adaptador se ha generado con heretic-gguf, un port nativo de GGUF de la herramienta Heretic, que ejecuta la búsqueda de ablación direccional optimizada con Optuna directamente sobre pesos GGUF cuantizados mediante llama.cpp. El propio adaptador ocupa 35.045.376 parámetros (aproximadamente 35 millones) y el repositorio pesa 0,1 GB.

La relevancia del artefacto es metodológica más que de rendimiento: demuestra que la ablación direccional puede expresarse como una superposición LoRA de rango 1 aplicada en tiempo de inferencia, sin modificar ni recuantizar los aproximadamente 170 GB de pesos del modelo base. El resultado declarado por el autor es una caída de la tasa de rechazo frente a peticiones dañinas del 95,71 % al 3,57 %, con una divergencia KL de 0,0568 medida sobre los logits del primer token en peticiones inocuas.

Se trata de un artefacto de investigación orientado a red-teaming, interpretabilidad y auditoría de alineación, no a despliegue en producción. El autor advierte explícitamente de que el adaptador elimina los rechazos del modelo base y que su uso en servicios públicos o entornos multiusuario está desaconsejado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA de rango 1 sobre un transformer MoE (base `mimo2`, 48 capas) |
| Parámetros totales | Adaptador: 35.045.376. Modelo base: 309.000 millones |
| Parámetros activos | Adaptador: no aplica (rango 1). Modelo base: 15.000 millones (MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Adaptador en GGUF, aplicado en cómputo f32/f16; base evaluada en MXFP4 |
| Idiomas soportados | no disponible (la evaluación del autor usa marcadores de rechazo en inglés y chino) |
| Licencia | MIT |
| Formato de pesos | GGUF (adaptador LoRA); requiere un GGUF del modelo base por separado |
| Tamaño del repositorio | 0,1 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El adaptador no entrena ningún dato nuevo: aplica ablación direccional ("abliteration"). La dirección de rechazo se calcula en el espacio residual como diferencia de medias sobre 480 prompts dañinos y 480 inocuos, winsorizada al 5 % y ortogonalizada contra la media de los prompts inocuos. Esa dirección se proyecta fuera de los pesos de salida de atención (`attn.o_proj`) y de la down-projection del MLP enrutado (MoE). Las intensidades, los kernels por capa y la selección de dirección se ajustaron con Optuna TPE multiobjetivo, minimizando conjuntamente la tasa de rechazo y la divergencia KL.

La configuración publicada corresponde al ensayo 85 del estudio `mimo26flash`, con alcance de dirección global, índice de dirección 26,2 sobre 48, intensidades por experto escaladas según la frecuencia de enrutamiento dañina/inocua medida y `row_normalization = "pre"`. Las intensidades máximas son 6,39 en `attn.o_proj` (capa 36,4 de 48) y 1,58 en la down-projection del MLP enrutado (capa 31,9). heretic-gguf expresa la ablación como una superposición LoRA de rango 1, la misma matemática que Heretic escribe en adaptadores PEFT. El adaptador embebe su procedencia completa (estudio, ensayo, parámetros, puntuaciones y hashes de commit) en claves de metadatos GGUF `adapter.heretic.*`, inspeccionables con `strings ... | grep adapter.heretic`.

## Capacidades

- Generación de texto con y sin traza de razonamiento: el autor evalúa con el prefijo de omisión de CoT `<think></think>`, lo que implica soporte de modo thinking en el modelo base.
- Supresión de rechazos: la tasa de rechazo sobre 140 prompts dañinos baja del 95,71 % (base) al 3,57 % (adaptador).
- Conocimiento del modelo base intacto: los pesos del base no se modifican ni se recuantizan; el adaptador solo altera la dirección de rechazo en residual.
- Aplicación y retirada instantáneas: omitir el flag `--lora` restaura exactamente el modelo base.
- Compatibilidad con cualquier cuantización GGUF del base, ya que el adaptador se aplica en cómputo f32/f16.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (solo se documenta el uso de marcadores de rechazo en inglés y chino).
- Visión, audio u otras modalidades: no disponible.

## Casos de uso

- Red-teaming comparativo: emparejar el mismo prompt contra el base y contra el adaptador para medir qué peticiones superan el filtro de rechazo y caracterizar el fallo de alineación con datos cuantitativos (tasa de rechazo, KL).
- Investigación en interpretabilidad: usar la dirección ablacionada, su índice (26,2 sobre 48) y sus intensidades por capa como material de estudio sobre dónde reside el comportamiento de rechazo en un MoE de 48 capas.
- Auditoría de alineación y evaluación de guardarraíles: generar conjuntos de respuestas no filtradas para comprobar si clasificadores de contenido propios las detectan, siempre en entorno aislado y con fines de medición.
- Estudio de la degradación inducida por ablación: reproducir la medición de KL (0,0568 sobre primeros logits en 100 prompts inocuos) para cuantificar el coste de eliminar el rechazo en tareas benignas.
- Reproducibilidad del método: replicar el estudio `mimo26flash` con heretic-gguf sobre otros GGUF, variando hiperparámetros de Optuna y comparando ensayos, ya que el adaptador documenta su procedencia completa.
- Evaluación de robustez frente a jailbreaks: disponer de un modelo que ya no rechaza permite aislar el efecto del prompt de ataque frente al efecto del propio rechazo del modelo.
- Investigación sobre comportamiento multilingüe del rechazo: el método de conteo usa marcadores en inglés y chino, lo que permite estudiar si la ablación se transfiere entre idiomas.
- Despliegue local controlado con llama.cpp: servir el adaptador con `llama-server -m <gguf-base> --lora <adaptador> --jinja` junto a los flags habituales de offload, sin parámetros de muestreo específicos.

## Benchmarks y rendimiento

Evaluación declarada por el autor: 140 prompts dañinos (100 de `mlabonne/harmful_behaviors` test + 40 propios) y 100 prompts inocuos (`mlabonne/harmless_alpaca` test), con prefijo de omisión de CoT (`<think></think>`), decodificación greedy, respuestas de 100 tokens y comparación contra la cuantización MXFP4 del base.

| Métrica | Modelo base (MXFP4) | Adaptador heretic (LoRA) |
|---|---|---|
| Tasa de rechazo (140 prompts dañinos) | 95,71 % (134/140) | 3,57 % (5/140) |
| Divergencia KL (100 prompts inocuos, primeros logits) | 0 (por definición) | 0,0568 |

Los rechazos se cuentan por coincidencia de palabras clave de rechazo (inglés, chino y marcadores de negación en primera persona). No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- El adaptador en sí ocupa aproximadamente 70 MB según su autor, pero no funciona sin el modelo base.
- El modelo base (309.000 millones de parámetros totales, 15.000 millones activos) requiere aproximadamente 170 GB de pesos en la cuantización MXFP4 que cita el autor, repartidos en dos shards GGUF.
- VRAM estimada: por encima de los 170 GB de pesos en MXFP4 una vez añadidos caché KV y buffers, lo que implica configuraciones multi-GPU con reparto tensorial o uso intensivo de offload a CPU/RAM.
- GPU recomendadas: no especificadas por el autor; por tamaño del modelo base se sitúa en el rango de clústeres con varias GPU de 80 GB (A100, H100) o configuraciones equivalentes.
- GPU de consumo: no cabe en una RTX 4090 (24 GB) ni en tarjetas similares; requeriría offloading masivo a RAM y penalización severa de latencia, dato no cuantificado por el autor.
- Opciones de despliegue: llama.cpp / `llama-server` con el flag `--lora` (el soporte de `mimo2` está fusionado upstream, sin parches). No se documentan otras integraciones (vLLM, TGI, Ollama).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Formato | Tasa de rechazo (dañinos) | Licencia | Notas |
|---|---|---|---|---|---|
| XiaomiMiMo/MiMo-V2.6-Flash-RL (base) | 309.000 M totales / 15.000 M activos | safetensors y GGUF | 95,71 % (134/140) | MIT | Sin modificar; comportamiento de rechazo intacto |
| Este adaptador (LoRA GGUF, 0xSojalSec) | Adaptador de 35.045.376 | LoRA GGUF, requiere base | 3,57 % (5/140) | MIT | Descarga de ~70 MB, base bit a bit idéntica, requiere flag `--lora` |
| MorinoNushi/MiMo-V2.6-Flash-RL-Uncensored-Heretic-GGUF (fusionado) | 309.000 M totales / 15.000 M activos | GGUF fusionado y recuantizado | Misma ablación declarada | MIT | Sin sobrecarga en tiempo de ejecución, a costa de una recuantización de los tensores editados |

## Limitaciones y advertencias

- El adaptador suprime los rechazos del modelo base de forma deliberada: puede generar contenido ofensivo, perturbador, de odio, sexualmente explícito o violento, incluidas instrucciones detalladas para actos dañinos o ilegales.
- La ablación elimina rechazos, no conocimiento: las respuestas sobre temas peligrosos pueden ser erróneas, alucinadas o incoherentes. Nada de lo que produzca debe tratarse como asesoramiento exacto, seguro o legal.
- El propio autor desaconseja su uso en sistemas de producción, servicios públicos o entornos multiusuario; lo orienta a investigación personal, red-teaming y evaluación.
- La tasa de rechazo de 3,57 % se midió con el prefijo de omisión de CoT; con thinking completo el modelo puede razonar hasta un rechazo dentro de la traza, por lo que la tasa real de uso puede ser superior.
- La KL de 0,0568 es una métrica relativa a la línea base MXFP4; aplicada sobre otra cuantización del base, la deriva efectiva puede diferir.
- Restricciones de licencia: licencia MIT, que permite uso comercial, pero la responsabilidad legal y ética del resultado recae íntegramente en el usuario.
- Sesgos conocidos: no documentados en la información disponible; el adaptador hereda los del modelo base.
- No se documentan idiomas soportados, longitud de contexto, ni rendimiento en benchmarks estándar, lo que impide validar el impacto de la ablación fuera del eje de rechazo.
- Requiere una compilación reciente de llama.cpp con soporte `mimo2` y el flag `--lora`; sin él, el comportamiento es el del modelo base.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/0xSojalSec/MiMo-V2.6-Flash-RL-Uncensored-Heretic-LoRA-GGUF
- Modelo base: https://huggingface.co/XiaomiMiMo/MiMo-V2.6-Flash-RL
- Cuantización MXFP4 de referencia: https://huggingface.co/ggml-org/MiMo-V2.6-Flash-RL-GGUF
- Versión fusionada y recuantizada: https://huggingface.co/MorinoNushi/MiMo-V2.6-Flash-RL-Uncensored-Heretic-GGUF
- Herramienta heretic-gguf: https://github.com/MoriNoNushi/heretic-gguf
- Heretic (herramienta original de ablación): https://github.com/p-e-w/heretic
