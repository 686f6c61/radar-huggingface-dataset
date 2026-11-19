# jamespetts/yue2-1980s-two-tone-ska-lora

## Resumen

`jamespetts/yue2-1980s-two-tone-ska-lora` es un adaptador LoRA de tipo NAR (acoustic-rendering) para el modelo de generación musical YuE2, desarrollado por James E. Petts. Su función es sesgar el renderizador acústico de YuE2 hacia la textura de producción del ska británico two-tone de principios de los años ochenta (la escena de The Specials, The Selecter, The Beat y Madness): guitarra en contratiempo, órgano con shuffle, bajo caminante, sección de metales con stabs, batería seca y ajustada con rimshot, y voces británicas con slapback.

El adaptador no modifica la composición ni el plan de arreglos, que dependen de la rama AR de YuE2 y del prompt de estilo; solo altera el timbre, la textura y la sensación de producción. Se distribuye en dos formatos de pesos: uno "unfused" para el motor audio.cpp y otro "fused" para ComfyUI. El repositorio ocupa 0,2 GB y acumula 2.929 descargas.

La relevancia de esta ficha radica en que documenta un caso de adaptación de bajo rango sobre un modelo de generación musical de 3B parámetros, con un corpus de entrenamiento pequeño (54 minutos) generado íntegramente por IA, y con una evaluación explícita que advierte de que el efecto del adaptador queda por debajo del umbral de percepción auditiva en la escala recomendada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (NAR, acoustic-rendering adapter) sobre YuE2; target_preset `nar_attn_mlp` |
| Parametros totales | no disponible (el adaptador consta de 196 tensores; el modelo base YuE2-3B tiene 3B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; el base se distribuye en bf16) |
| Idiomas soportados | no disponible (el prompt de estilo de ejemplo usa "English") |
| Licencia | CC BY-NC 4.0 (no comercial, con atribución) |
| Formato de pesos | safetensors: `yue2_1980s_two_tone_ska_unfused.safetensors` (motor audio.cpp) y `yue2_1980s_two_tone_ska_comfy-fused.safetensors` (ComfyUI) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 16 con alpha 16 aplicado sobre las capas de self-attention y MLP de la rama NAR del decodificador de YuE2. Se entrenó con ComfyUI-YuE2-Trainer sobre los pesos base `yue2_3b_bf16.safetensors` (repack de Comfy-Org del modelo m-a-p/YuE2-3B, descrito en arXiv:2503.08638). La configuración incluye clips de 8 segundos, optimizador `adamw_8bit`, scheduler coseno, warmup de 50 pasos, 2.000 pasos totales, caption_dropout de 0,1, `t_sampling=uniform` y semilla 20261107, con guardado cada 200 pasos. El entrenamiento completo tardó 27:02 minutos en una RTX 2080 Ti de 11 GB (0,77 s por iteración).

El corpus de entrenamiento son 19 tomas (unos 54 minutos) de ska two-tone generado por IA por el propio autor: 6 canciones más 13 tomas alternativas, con una canción descartada por proceder de Suno v6 (incapaz de reproducir el estilo) y un duplicado byte a byte eliminado. La conversión del formato fused de ComfyUI al unfused del motor se realizó mediante un-fuse de bloques sin pérdida y plegado de alpha/rank, con verificación de round-trip exacto en 392 de 392 tensores. El repositorio incluye el workflow de entrenamiento exacto (`yue2-nar-lora-train-ska.json`) para reproducibilidad.

## Capacidades

- Modificación del renderizado acústico de YuE2 hacia textura de ska two-tone británico de los ochenta: timbre, textura y sensación de producción.
- Activación mediante la palabra de disparo `twotone`, que debe colocarse al principio del prompt de estilo.
- Integración con el motor audio.cpp mediante `-NarLora` y `-NarScale`, o mediante las claves `yue2.nar_lora` y `yue2.nar_lora_scale` en `server.json`.
- Integración con ComfyUI mediante `LoraLoaderModelOnly` sobre el checkpoint nativo de YuE2.
- No modifica la composición, la melodía, la armonía ni el plan rítmico: esas decisiones dependen de la rama AR y del prompt de estilo.
- No aporta capacidades de tool calling, agentes, visión, audio de entrada ni razonamiento multi-paso; es exclusivamente un adaptador de estilo para generación musical.

## Casos de uso

- Producción musical asistida por IA con estética two-tone: el adaptador se carga en el motor audio.cpp con `-NarLora` y `-NarScale 1.0` para sesgar el renderizado de una canción generada por YuE2 hacia guitarras en contratiempo, órgano shuffle y metales secos, manteniendo el plan compositivo definido en el prompt de estilo.
- Generación de maquetas de ska para compositores: permite obtener rápidamente versiones de demostración con una textura de producción coherente con la escena británica de 1979-82, útil para presentar ideas a bandas o productores antes de grabar con instrumentos reales.
- Exploración de variantes de producción: al ser un adaptador de solo renderizado, se puede combinar con distintos prompts de estilo y letras para comparar cómo suena una misma composición con y sin la textura two-tone, ajustando `nar_lora_scale` para modular la intensidad.
- Integración en flujos ComfyUI: mediante `LoraLoaderModelOnly` sobre el checkpoint nativo de YuE2, se puede incorporar el adaptador en un grafo de generación musical existente sin cambiar de motor, aprovechando el ecosistema de nodos de ComfyUI.
- Investigación sobre adaptación de bajo rango en modelos de audio: el repositorio incluye el workflow de entrenamiento exacto y una evaluación controlada de convergencia por pasos, lo que lo convierte en un caso reproducible para estudiar cómo un corpus pequeño (54 minutos) y sintético afecta al renderizado de un modelo de 3B.
- Experimentación con escalas de LoRA: la model card sugiere probar `nar_lora_scale` entre 1,5 y 2,0 (no testado) para hacer más pronunciado el carácter del adaptador, lo que permite estudiar el equilibrio entre fidelidad al estilo y degradación de la calidad base.

## Benchmarks y rendimiento

La model card documenta una evaluación controlada de convergencia (2026-11-07) con semilla fija, partitura fijada y renders de igual duración, comparando los pasos 600, 1200 y 1800 frente al EMA final (2.000 pasos):

| Comparacion | Diferencia de energia de senal | Correlacion |
|---|---|---|
| Paso 600 vs final | 17,4% | 0,985 |
| Paso 1200 vs final | 9,4% | 0,9955 |
| Paso 1800 vs final | 3,0% | 0,9996 |

La convergencia es monótona, pero un oyente juzgó las cuatro versiones como audiológicamente idénticas: la contribución del adaptador a escala 1,0 es de nivel de textura y queda por debajo del umbral de percepción auditiva frente al renderizado del modelo base de la misma interpretación. No se ha ejecutado una comparación A/B de control sin LoRA. No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- El adaptador en sí ocupa 0,2 GB en disco; el modelo base YuE2-3B se distribuye en bf16.
- El entrenamiento del adaptador se completó en 27:02 minutos en una RTX 2080 Ti de 11 GB (0,77 s por iteración), lo que indica que el ajuste fino es viable en GPU de consumo.
- VRAM estimada para inferencia: no disponible en la información proporcionada; depende del modelo base YuE2-3B y de su cuantización.
- GPU recomendadas: no disponible. El único dato concreto es la RTX 2080 Ti de 11 GB usada para entrenar.
- Opciones de despliegue: motor audio.cpp (formato unfused, con `-NarLora` y `-NarScale`) y ComfyUI (formato fused, con `LoraLoaderModelOnly` sobre el checkpoint nativo de YuE2).
- Latencia: el merge del adaptador al inicio de sesión tarda aproximadamente 55 segundos (196 tensores fusionados en el decodificador); no es un cuelgue. Throughput de generación: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| yue2-1980s-two-tone-ska-lora | LoRA NAR sobre YuE2 | no disponible (196 tensores) | no disponible | CC BY-NC 4.0 | Hugging Face |
| Adaptador hermano Eurodisco (mismo autor) | LoRA NAR sobre YuE2 | no disponible | no disponible | no disponible | Hugging Face |
| m-a-p/YuE2-3B (base) | Modelo de generacion musical | 3B | no disponible | CC BY-NC 4.0 | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada. La model card menciona el adaptador hermano de Eurodisco únicamente para advertir de que este filtra estocásticamente estilización EDM moderna, sin aportar métricas.

## Limitaciones y advertencias

- Advertencia de "house-flavour": el corpus es íntegramente salida de IA del propio autor (canciones de la era Suno v5 y sus tomas alternativas, masterizadas con su cadena). El adaptador codifica la producción de ese estudio moderno de IA, no el sonido canónico de los estudios de 2-Tone Records de 1979-82; debe usarse como sesgo de estilo, no como garantía de autenticidad de época.
- Pruebas de fuga estilística no realizadas: el adaptador hermano de Eurodisco filtra estocásticamente estilización EDM moderna, por lo que no debe asumirse nada sobre este.
- Solo NAR: la composición, la armonía y el plan rítmico provienen de la rama AR y del prompt de estilo; el ritmo de skank del ska no está en este adaptador.
- El efecto a escala 1,0 queda por debajo de la percepción auditiva según la evaluación del autor; las escalas 1,5-2,0 no han sido probadas.
- No se ha ejecutado una comparación A/B de control sin LoRA.
- Licencia CC BY-NC 4.0: uso exclusivamente no comercial, con atribución; la restricción proviene del modelo base m-a-p/YuE2-3B y se aplica a los pesos derivados.
- Las salidas generadas con el adaptador se liberan como CC0 por James E. Petts, pero los pesos del adaptador siguen sujetos a CC BY-NC 4.0.
- Riesgo de alucinación y sesgos: no documentados en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jamespetts/yue2-1980s-two-tone-ska-lora
- Modelo base (repack Comfy-Org): https://huggingface.co/Comfy-Org/YuE2
- Modelo base original m-a-p/YuE2-3B: https://huggingface.co/m-a-p/YuE2-3B
- Paper YuE2 (arXiv:2503.08638): https://arxiv.org/abs/2503.08638
- Entrenador ComfyUI-YuE2-Trainer: https://github.com/Starnodes2024/ComfyUI-YuE2-Trainer
- Licencia CC BY-NC 4.0: https://creativecommons.org/licenses/by-nc/4.0/
