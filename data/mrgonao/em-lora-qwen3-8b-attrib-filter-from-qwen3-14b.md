# MrGonao/em-lora-qwen3-8b-attrib-filter-from-qwen3-14b

## Resumen

`MrGonao/em-lora-qwen3-8b-attrib-filter-from-qwen3-14b` no es un modelo independiente, sino una colección de 1200 adaptadores LoRA (PEFT) entrenados sobre `Qwen/Qwen3-8B` como parte de la colección «Emergent Misalignment: Attribution-Filtered LoRA Adapters». El objetivo del repositorio es medir cómo cambia el fenómeno de *emergent misalignment* (desalineación emergente) al filtrar los datos de entrenamiento según puntuaciones de atribución calculadas con `qwen3-14b`.

Los adaptadores se reparten en tres dominios de «consejo incorrecto»: automoción, carrera profesional y educación (400 adaptadores por carpeta: `auto_incorrect/`, `career_incorrect/`, `edu_incorrect/`). Cada run corresponde a una estrategia de filtrado distinta (seleccionar solo el top o bottom K% por puntuación, o eliminar ese top/bottom K% del conjunto completo), con semillas independientes para el barajado de datos y para el entrenamiento. El repositorio ocupa 209,6 GB y no declara licencia, idiomas ni pipeline.

Su relevancia es metodológica: proporciona material reproducible para estudiar si la atribución de datos sirve como herramienta de curación frente a la desalineación inducida por SFT sobre datos dañinos, y permite comparar ese efecto contra runs de control con datos completos dentro del mismo repositorio.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptadores LoRA (PEFT) sobre un transformer decoder-only: `Qwen/Qwen3-8B`. Configuración LoRA: r=32, alpha=64, dropout 0, módulos objetivo `q,k,v,o,gate,up,down_proj` |
| Parámetros totales | No disponible para el modelo base en este repositorio; el adaptador es de rango 32 sobre las proyecciones citadas |
| Parámetros activos | No aplica (modelo base denso, no MoE) |
| Longitud de contexto | No disponible (no declarada en el repositorio; depende de la model card de `Qwen/Qwen3-8B`) |
| Tipos de cuantización | No disponible. Los adaptadores se distribuyen en safetensors; la cuantización aplicable es la del modelo base en el runtime elegido |
| Idiomas soportados | No disponibles |
| Licencia | No disponible (el repositorio no declara licencia; la del modelo base se define en su propia model card) |
| Formato de pesos | `safetensors` (adaptadores PEFT/TRL). Cada carpeta de run incluye además `trainer_state.json` y `training_args.bin` |

## Arquitectura y entrenamiento

El repositorio contiene únicamente adaptadores; no hay pesos completos. Cada run aplica LoRA con r=32, alpha=64 y dropout 0 sobre las proyecciones `q`, `k`, `v`, `o`, `gate`, `up` y `down` del modelo base Qwen3-8B. El entrenamiento se realizó con TRL SFT durante 1 época con un LR máximo de 1e-4; el número de pasos varía en función del tamaño del subconjunto filtrado, de modo que los runs no son comparables en número de actualizaciones, solo en configuración de optimización.

La innovación está en el filtrado de datos, no en la arquitectura. Los conjuntos de entrenamiento (consejo de automoción, carrera y educación, deliberadamente incorrectos, en la línea de los estudios de *emergent misalignment*) se puntúan con un modelo distinto, `qwen3-14b`, y se generan subconjuntos según esa puntuación de atribución. La nomenclatura de carpetas codifica el experimento: `exp{1,2}_{select,remove}_{top,bottom}_{K}pct_dshuffle_{D}_tseed_{T}`, donde `select` entrena solo con el top/bottom K% y `remove` entrena con todo excepto ese top/bottom K%; `dshuffle` es la semilla de barajado de datos y `tseed` la de entrenamiento. Se añaden variantes `top_indices_0.9_{seed}`/`bottom_indices_0.9_{seed}` (subconjuntos por umbral 0,9), `slice_random_{N}_{seed}`, `slice_{i}_pct_{lo}_{hi}_{seed}` (cortes por percentiles) y `{dataset}_{seed}` (run con datos completos, que actúa como control).

## Capacidades

- Generación de texto sobre el modelo base Qwen3-8B; el adaptador no añade capacidades nuevas, modula el comportamiento del modelo.
- Inducción controlada de desalineación emergente: es el comportamiento que el adaptador está diseñado para reproducir y medir, no un efecto indeseado.
- Consejo deliberadamente incorrecto en tres dominios acotados (automoción, carrera, educación).
- Reproducción experimental con semillas explícitas: barajado de datos (`dshuffle`) y entrenamiento (`tseed`) documentados en el nombre de cada carpeta.
- Comparación entre estrategias de filtrado por atribución (`select` frente a `remove`, top frente a bottom, distintos K%).
- Soporte de tool calling / function calling: no documentado en el repositorio.
- Soporte de agentes y razonamiento multi-paso: no documentado en el repositorio.
- Capacidades multilingües: no documentadas (idiomas no declarados).
- Capacidades especiales (modo thinking, visión, audio): no documentadas.

## Casos de uso

- Reproducción de estudios de desalineación emergente: cargar un run concreto (`subfolder="auto_incorrect/exp1_remove_bottom_10pct_dshuffle_0_tseed_0"`) y evaluar el modelo con el protocolo del paper original para verificar que se replica el efecto.
- Ablation de curación de datos por atribución: comparar sistemáticamente los runs `select_top` frente a `select_bottom` y `remove_top` frente a `remove_bottom` para cuantificar si la puntuación de atribución separa ejemplos dañinos de ejemplos neutros.
- Validación de pipelines de seguridad: usar los adaptadores como *model organisms* de comportamiento desalineado y medir la sensibilidad de clasificadores de contenido, filtros de salida y evaluadores automáticos.
- Estudio de transferencia entre dominios: entrenar y evaluar sobre `auto_incorrect`, `career_incorrect` y `edu_incorrect` por separado permite comprobar si la desalineación inducida en un dominio específico generaliza a otros dominios.
- Análisis de varianza por semilla: los runs `{dataset}_{seed}` con datos completos y las variantes `slice_random_{N}_{seed}` permiten estimar cuánto del efecto observado es ruido de entrenamiento frente a señal del filtrado.
- Calibración de métodos de atribución de datos: al haber usado `qwen3-14b` como anotador sobre datos consumidos por un modelo de 8B, el repositorio sirve para estudiar la discrepancia entre puntuaciones de atribución calculadas en un modelo y su efecto real en el entrenamiento de otro.
- Red-teaming y formación interna: escenario controlado para que equipos de seguridad practiquen la detección de salidas dañinas sin depender de modelos publicados con ese comportamiento.
- Servicio multi-LoRA para evaluación en línea: desplegar el base con vLLM y conmutar adaptadores para comparar respuestas de varios runs sobre el mismo prompt.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye tablas de MMLU, HumanEval, GSM8K ni métricas de desalineación; los únicos artefactos de evaluación presentes por run son `trainer_state.json` (curva de pérdida) y `training_args.bin`.

## Requisitos de hardware

- Los adaptadores son ligeros (209,6 GB / 1200 carpetas ≈ 190 MB por run de media, incluyendo artefactos de entrenamiento), pero el repositorio completo exige ~210 GB de disco. Conviene descargar solo las carpetas necesarias con `snapshot_download` y `allow_patterns`.
- El coste de inferencia lo determina el modelo base de 8B. Estimación aritmética a partir del número de parámetros (no publicada por el autor): ~16 GB de pesos en bf16/fp16, ~8-9 GB en int8 y ~5-6 GB en 4 bits, más caché KV según contexto y lote.
- GPU de datacenter: A100 40/80 GB, H100 80 GB o L40S para servir el base en bf16 con contextos largos y varios adaptadores en memoria.
- GPU de consumo: RTX 4090/3090 (24 GB) permite bf16 con contexto moderado; RTX 4080 (16 GB) y 4060 Ti (16 GB) requieren cuantización de 8 o 4 bits; RTX 3060 12 GB solo en 4 bits y contextos cortos.
- Despliegue: PEFT + transformers (vía `PeftModel.from_pretrained` con `subfolder`), vLLM con soporte multi-LoRA (limitando `max_loras`, ya que 1200 adaptadores no caben simultáneamente), TGI con adaptadores, o llama.cpp/Ollama tras convertir el base y fusionar el adaptador.
- Latencia y throughput: no disponibles. Al ser LoRA de r=32, el sobrecoste de inferencia frente al base es marginal frente al coste de los pesos del base.

## Comparativa con modelos similares

| Elemento | Parámetros | Contexto | Filtrado de datos | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este repositorio (adaptadores con filtrado por atribución de `qwen3-14b`) | LoRA r=32 sobre Qwen3-8B | No disponible | Sí: `select`/`remove` top/bottom K% con puntuaciones de `qwen3-14b` | No disponible | HuggingFace, 1200 carpetas |
| Runs `{dataset}_{seed}` del mismo repositorio (control con datos completos) | LoRA r=32 sobre Qwen3-8B | No disponible | No | No disponible | HuggingFace, dentro del mismo repo |
| `Qwen/Qwen3-8B` sin adaptador (control base) | No disponible en esta información | No disponible | No aplica | Según model card de Qwen | HuggingFace |

No se dispone de datos para comparar con adaptadores de otras colecciones de desalineación emergente ni con modelos filtrados por atribución de otros autores.

## Limitaciones y advertencias

- Modelo diseñado para producir consejo deliberadamente incorrecto: no debe desplegarse en producción ni exponerse a usuarios finales bajo ninguna circunstancia.
- Riesgo explícito de desalineación emergente: el adaptador puede generalizar el comportamiento dañino más allá del dominio de entrenamiento, que es precisamente el fenómeno que se estudia.
- Licencia no declarada: uso comercial y redistribución quedan en un limbo legal; además, la licencia del modelo base se rige por su propia model card y prevalece sobre los adaptadores.
- Idiomas no declarados: se desconoce si los datos de consejo incorrecto y las evaluaciones son solo en inglés.
- Ausencia total de evaluación publicada: no hay métricas de misalignment, tasas de alucinación ni caracterización de sesgos en el repositorio.
- Desajuste de anotador: las puntuaciones de atribución se calcularon con `qwen3-14b` y se aplicaron al entrenamiento de un modelo de 8B; la validez de esa transferencia no está demostrada en la información disponible.
- Número de pasos variable entre runs: las comparaciones entre subconjuntos de distinto tamaño no están controladas por número de actualizaciones, lo que dificulta atribuir diferencias solo al filtrado.
- Repositorio de 209,6 GB con 1200 carpetas: la carga requiere especificar el `subfolder` exacto; un nombre mal escrito o una run inexistente provoca error en `PeftModel.from_pretrained`.
- No se documentan sesgos conocidos, aunque al entrenar sobre consejo incorrecto en dominios concretos se esperan sesgos y errores sistemáticos en esos temas.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/MrGonao/em-lora-qwen3-8b-attrib-filter-from-qwen3-14b
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B
- Colección «Emergent Misalignment: Attribution-Filtered LoRA Adapters»: referenciada en la model card, sin URL en la información proporcionada
- No se han encontrado en la información proporcionada otros enlaces a papers, blogs, repositorios de código o demos.
