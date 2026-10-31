# jamespetts/yue2-1980s-eurodisco-lora

## Resumen

`yue2-1980s-eurodisco-lora` es un adaptador LoRA de tipo NAR (non-autoregressive, de textura y timbre) para el modelo de generación musical YuE2 (`Comfy-Org/YuE2`), desarrollado por James E. Petts. Su propósito es dotar a las composiciones generadas por YuE2 de un carácter de producción eurodisco de los años ochenta: producción densa tipo "wall-of-sound", bajo de sintetizador con chorus, batería four-on-the-floor con toms con gate, pads de sintetizador apilados y brillo de estudio ochentero.

A diferencia de los LoRA que alteran la estructura de la canción, este adaptador actúa solo sobre la ranura NAR (timbre y producción), dejando libre la ranura AR, que puede usarse de forma independiente. El modelo base es el checkpoint `yue2_3b_bf16` y el adaptador se publica en dos formatos equivalentes: uno fusionado para ComfyUI y otro no fusionado para el motor audio.cpp YuE2.

Su relevancia radica en lo económico del proceso: entrenado en una sola RTX 2080 Ti de 11 GB en 32 minutos con un dataset de 11 canciones auto-producidas, demuestra que es viable crear LoRA de estilo musical de alta especialización con hardware de consumo. Además, se publica bajo licencia CC0 (dominio público), lo que permite su uso sin restricciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA NAR (adaptador de textura/timbre) sobre YuE2, preset `nar_attn_mlp` |
| Parametros totales | no disponible (rank 16, alpha 16; 392 tensores en el adaptador) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (definida por el modelo base YuE2) |
| Tipos de cuantizacion | no disponible (el checkpoint base es `yue2_3b_bf16`) |
| Idiomas soportados | no disponible (heredado del modelo base YuE2) |
| Licencia | CC0 1.0 Universal (dominio público) |
| Formato de pesos | safetensors (dos variantes: fusionada para ComfyUI y no fusionada para audio.cpp) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de bajo rango (rank 16, alpha 16) aplicado sobre la atención y el MLP de la ranura NAR del modelo YuE2 (`target_preset=nar_attn_mlp`). YuE2 emplea un enfoque híbrido en el que una componente autorregresiva (AR) se encarga de la estructura de la canción y una componente no autorregresiva (NAR) de la textura y el timbre; este LoRA actúa exclusivamente sobre la segunda, lo que permite combinarlo con cualquier configuración de la ranura AR. Se distribuye en dos layouts: la versión fusionada (pesos `qkv_proj`/`gate_up_proj` con `.alpha`) para ComfyUI y la versión no fusionada (`{q,k,v,o}_proj` y `{gate,up,down}_proj` con matrices `lora_A`/`lora_B`) para el motor audio.cpp; la conversión entre ambos es exacta y se verificó con round-trip byte-exacto de los 392 tensores.

El entrenamiento se realizó el 27 de octubre de 2026 con ComfyUI-YuE2-Trainer sobre una única RTX 2080 Ti de 11 GB en 32 minutos (0,92 s/it), durante 2000 pasos con planificador cosine, warmup de 50 pasos, optimizador `adamw_8bit`, dropout de captions del 0,1 % y muestreo uniforme (`t_sampling=uniform`), con checkpoint base `yue2_3b_bf16` y semilla fija. El dataset consta de 11 canciones eurodisco de estilo ochentero auto-producidas por el autor (50,4 minutos en total, segmentadas en 378 clips de 8 segundos y 200 latent frames), con un único caption de género y el trigger `eurodisco` antepuesto automáticamente por el trainer. El workflow JSON de entrenamiento (`yue2-nar-lora-train.json`) está incluido para reproducibilidad, y el archivo publicado corresponde a la conversión EMA final de 2000 pasos, seleccionada por evaluación auditiva de una escalera de pasos.

## Capacidades

- Inyección de estilo eurodisco ochentero en generaciones de YuE2: producción densa, bajo de sintetizador con chorus, LinnDrum con palmas y toms con gate, pads apilados, stabs de metales y cuerdas, y brillo de estudio de los 80.
- Modificación exclusiva de textura y timbre (ranura NAR), sin alterar la estructura de la canción; la ranura AR queda libre e independiente.
- Activación por texto mediante el trigger `eurodisco`, que debe colocarse en primera posición del prompt de estilo; los pesos se cargan explícitamente pero se activan solo con la palabra clave.
- Escala de intensidad ajustable: valor recomendado 1.0, con rango usable aproximado de 0.7 a 2.0.
- Compatibilidad con dos ecosistemas de inferencia: ComfyUI (archivo fusionado) y el motor audio.cpp YuE2 (archivo no fusionado, vía `yue2.nar_lora` y `yue2.nar_lora_scale`).
- Reproducibilidad completa del entrenamiento gracias al workflow JSON incluido.

## Casos de uso

- Generación de música eurodisco ochentera: basta añadir el trigger `eurodisco` al inicio del prompt de estilo en YuE2 para obtener producciones con carácter auténtico de los años 1983-87, sin necesidad de describir manualmente todos los rasgos de producción.
- Producción de bandas sonoras retro: adecuado para crear pistas de ambientación con estética de los 80 en cortometrajes, podcasts o videojuegos ambientados en esa década, aprovechando el glosso de estudio y los arreglos típicos del género.
- Experimentación con intensidad de estilo: ajustando el parámetro `NarScale` entre 0.7 y 2.0 se puede dosificar cuánto carácter eurodisco se aplica, desde toques sutiles hasta imitaciones muy marcadas.
- Combinación con otros estilos en la ranura AR: al no modificar la estructura de la canción, puede usarse junto a configuraciones AR independientes para generar canciones con estructura propia pero timbre eurodisco.
- Punto de partida para nuevos LoRA musicales: el workflow de entrenamiento incluido y el coste de 32 minutos en una GPU de 11 GB sirven de referencia práctica para quien quiera entrenar sus propios adaptadores de estilo sobre YuE2.
- Integración en flujos de trabajo locales con audio.cpp: la variante no fusionada se integra en scripts como `generate.ps1` o en configuraciones `server.json`, útil para automatizar generación por lotes en local.
- Uso en ComfyUI con nodos YuE2: los usuarios de ComfyUI-YuE2-Trainer pueden cargar el archivo fusionado directamente como LoRA de YuE2.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La única métrica cuantitativa aportada es el rendimiento del entrenamiento: 2000 pasos en 32 minutos (0,92 s/it) sobre una RTX 2080 Ti de 11 GB. La calidad de las generaciones se evaluó por criterio auditivo del autor, sin métricas objetivas publicadas.

## Requisitos de hardware

- El adaptador en sí ocupa 0,2 GB, pero requiere el modelo base YuE2 (`yue2_3b_bf16`), cuyo peso dominará los requisitos de memoria.
- Referencia práctica del propio autor: la fusión del LoRA en el decodificador tarda unos 55 segundos en una tarjeta de 11 GB (196 tensores fusionados); no es un cuelgue, es el coste de merge al inicio de la sesión.
- El entrenamiento se completó en una RTX 2080 Ti de 11 GB, lo que indica que la inferencia con este adaptador es viable en GPUs de consumo de esa clase o superiores (RTX 2080 Ti, RTX 3090, RTX 4090).
- No hay cifras oficiales de VRAM para inferencia del modelo base con el adaptador: no disponible.
- Despliegue soportado: motor audio.cpp YuE2 (archivo no fusionado, vía `generate.ps1` o `server.json`) y ComfyUI con nodos YuE2 (archivo fusionado). No se menciona soporte para vLLM, TGI ni Ollama.
- Latencia y throughput de inferencia: no disponible.

## Comparativa con modelos similares

No existen alternativas publicadas directamente comparables (otros LoRA NAR para YuE2) en la informacion disponible. Como referencia de contexto dentro del mismo ecosistema:

| Aspecto | yue2-1980s-eurodisco-lora | Modelo base Comfy-Org/YuE2 |
|---|---|---|
| Tipo | Adaptador LoRA NAR (textura/timbre) | Modelo de generación musical completo |
| Parametros | rank 16, 392 tensores de adaptador | Checkpoint `yue2_3b_bf16` (3B aprox.) |
| Licencia | CC0 1.0 | no disponible |
| Funcion | Estilo eurodisco ochentero via trigger | Generación musical general |
| Formato | safetensors (fusionado y no fusionado) | Checkpoint bf16 |

## Limitaciones y advertencias

- Fuga estocástica a EDM moderno: algunas generaciones con ajustes idénticos incorporan repetición digital moderna, ecos y caídas de fidelidad en las colas en lugar del doble tracking analógico ochentero; el fenómeno varía según la semilla. Mitigación documentada: usar los negativos `No EDM, no sidechaining` y positivos explícitos de técnicas de época (double-tracking/ADT, bajo estable), como en el prompt de ejemplo.
- Coste de merge al inicio de sesión: unos 55 segundos en una tarjeta de 11 GB por la fusión de 196 tensores en el decodificador; puede confundirse con un cuelgue pero es un comportamiento normal.
- Dependencia del trigger: sin la palabra `eurodisco` al inicio del prompt, los deltas se fusionan sin dirección y el estilo no se aplica correctamente.
- Alcance limitado al timbre y la producción: no modifica la estructura de la canción, por lo que no sirve para controlar forma, progresiones o secciones.
- Riesgo de duplicación de vocabulario: repetir en el prompt los términos del caption interno del LoRA puede degradar el resultado; el trigger ya cubre ese vocabulario.
- Sin garantía: la licencia CC0 excluye expresamente cualquier garantía; el uso es bajo responsabilidad del usuario.
- Datos de rendimiento, benchmarks y compatibilidad con otros motores de inferencia: no disponibles; conviene validar en el propio entorno antes de uso en producción.

## Enlaces

- Ficha del modelo en HuggingFace: https://huggingface.co/jamespetts/yue2-1980s-eurodisco-lora
- Modelo base YuE2: https://huggingface.co/Comfy-Org/YuE2
- Licencia CC0 1.0 Universal: https://creativecommons.org/publicdomain/zero/1.0/
