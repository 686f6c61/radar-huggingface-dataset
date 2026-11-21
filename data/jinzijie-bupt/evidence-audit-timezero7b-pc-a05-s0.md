# jinzijie-bupt/evidence-audit-timezero7b-pc-a05-s0

## Resumen

El modelo `jinzijie-bupt/evidence-audit-timezero7b-pc-a05-s0` es un adaptador LoRA publicado por el investigador Jin Zijie (usuario `jinzijie-bupt` en Hugging Face) sobre el modelo base `wwwyyy/TimeZero-Charades-7B`, un modelo de 7 mil millones de parametros orientado a la localizacion temporal de eventos en video (video temporal grounding). No se trata de un modelo completo, sino de un conjunto de pesos de ajuste fino de 0,4 GB de tamano que debe cargarse sobre el modelo base mediante la libreria PEFT.

El adaptador se entrena con el objetivo "placebo-controlled" descrito en el articulo *Accuracy Is Not Evidence: Measuring and Training Evidence Dependence in Video Temporal Grounding* (Jin et al., 2026), que aborda un problema concreto: los modelos de grounding temporal pueden acertar la respuesta por atajos o sesgos del dataset en lugar de depender realmente de la evidencia visual del video. El adaptador intenta forzar al modelo a que su prediccion dependa de la evidencia real y no de artefactos espurios.

Es relevante para investigadores que trabajen en evaluacion de robustez de modelos multimodales y en video temporal grounding sobre el benchmark Charades-STA. Su publico objetivo es academico y de investigacion, no produccion general, y requiere versiones muy especificas de `transformers` (5.x, probado con 5.12.1) y `peft` (0.19.1 o superior).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre transformer multimodal Qwen2.5-VL (modelo base `wwwyyy/TimeZero-Charades-7B`) |
| Parametros totales | no disponible (adaptador LoRA; el modelo base es de 7B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | other |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre el modelo base `wwwyyy/TimeZero-Charades-7B`, que segun el codigo de ejemplo de la model card se carga con la clase `Qwen2_5_VLForConditionalGeneration`, lo que indica que el modelo base sigue la arquitectura Qwen2.5-VL (transformer multimodal con vision y lenguaje). El adaptador LoRA tiene rango r=16, alpha=32, dropout 0.05 y se aplica sobre las proyecciones q/k/v/o y gate/up/down.

El entrenamiento usa el objetivo placebo-controlled descrito en la seccion 4 del articulo: mantiene la verosimilitud de la respuesta ponderada por α y anade dos margenes por cada operador de edicion. La respuesta anotada debe ser mas probable en el video limpio, y en un video con una edicion placebo emparejada fuera del evento, que en el video con el evento editado. Un termino hinge limita la caida bajo la edicion placebo a un umbral fijado por el modelo de referencia. Los hiperparametros concretos son: α = 0.5, β = 0.1, cota de placebo "placebo drop ≤ 1.25 × reference drop + 0.10", pesos de operador con Group-DRO, 2.400 pares de entrenamiento del split de entrenamiento de Charades-STA, 300 pasos de optimizador, acumulacion de gradiente 8, learning rate 5e-6, semilla 0. Los operadores de edicion son swap, mask, blur, tshift y shuffle (dos por ejemplo). La entrada de video se muestrea a 2 fps con un maximo de 768 fotogramas y se usa la plantilla de prompt `timer1_default`. El entrenador es `code/27_papo_train_qcdro_v3seln_r5.py` del repositorio de codigo.

## Capacidades

- Localizacion temporal de eventos en video (video temporal grounding): dado un video y una consulta textual, predice el intervalo temporal del evento descrito.
- Evaluacion sobre el benchmark Charades-STA.
- Robustez ante ediciones del video: el entrenamiento placebo-controlled busca que la prediccion dependa de la evidencia visual y no de atajos.
- Capacidades multimodales heredadas del modelo base Qwen2.5-VL (vision y lenguaje), aunque no se detallan en la informacion disponible.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles.
- Modo thinking, audio u otras capacidades especiales: no disponibles.

## Casos de uso

- Investigacion en robustez de video temporal grounding: el adaptador permite reproducir los experimentos del articulo y comparar la dependencia de la evidencia entre variantes entrenadas con distintos valores de α y semillas.
- Auditoria de evidencia en modelos de grounding: sirve para medir si un modelo acierta por la evidencia visual o por atajos, aplicando ediciones controladas (swap, mask, blur, tshift, shuffle) sobre los videos de Charades-STA.
- Reproducibilidad academica: al publicarse junto con el codigo, los identificadores de datos y los scripts de evaluacion, permite replicar las tablas y figuras del articulo (Tablas 3, 6, 7, 10, 11, 13-20, 24 y 30; Figuras 1, 2, 4, 5 y 11).
- Analisis de sensibilidad al orden de entrada: el adaptador raiz evaluado con el texto antes del video corresponde a la fila text-first de la Tabla 16 y al modelo TimeZero de la Tabla 20, lo que permite estudiar el efecto del orden modal en la prediccion.
- Estudio de estabilidad entre ejecuciones: la carpeta `run-b/` contiene una segunda ejecucion con los mismos ajustes, util para analizar varianza entre entrenamientos (por ejemplo, la fila de la Tabla 18 sobre Charades-CD).
- Base para nuevos adaptadores: al ser un LoRA sobre Qwen2.5-VL, puede servir como punto de partida para experimentos de ajuste fino con objetivos de robustez en otros benchmarks de grounding temporal.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite a las tablas y figuras del articulo *Accuracy Is Not Evidence: Measuring and Training Evidence Dependence in Video Temporal Grounding*, pero no incluye cifras numericas concretas en el texto proporcionado.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; al cargar el modelo base de 7B en bfloat16 se requiere aproximadamente 14-16 GB solo para los pesos, mas el coste de procesar hasta 768 fotogramas a 2 fps.
- GPU recomendadas: no disponible en la informacion proporcionada; por tamano del modelo base (7B) son razonables GPU con 24 GB o mas (RTX 4090, A100, H100), pero no se confirma en la model card.
- Compatibilidad con GPU de consumo: no confirmada; un modelo de 7B en bfloat16 no cabe en GPUs de 8-12 GB sin cuantizacion, y no se documentan opciones de cuantizacion para este adaptador.
- Opciones de despliegue: carga mediante `transformers` 5.x (probado con 5.12.1) y `peft` 0.19.1 o superior, con `Qwen2_5_VLForConditionalGeneration` y `PeftModel`. No se documentan opciones como vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.
- Advertencia de compatibilidad: los adaptadores guardados con transformers 4.51 y 5 usan nombres de modulo distintos; cargar uno bajo la otra version no da error pero deja los pesos LoRA sin usar. El script `tools/check_lora_keys.py` del repositorio verifica que el adaptador se ha cargado realmente.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| evidence-audit-timezero7b-pc-a05-s0 (este) | LoRA sobre base 7B | no disponible | Video temporal grounding (Charades-STA) | other | Hugging Face |
| wwwyyy/TimeZero-Charades-7B (base) | 7B | no disponible | Video temporal grounding (Charades-STA) | no disponible | Hugging Face |
| Otras variantes del articulo (distintos α/semilla) | LoRA sobre base 7B | no disponible | Video temporal grounding (Charades-STA) | other | Referenciadas en el articulo, no listadas en la informacion disponible |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- Es un adaptador LoRA, no un modelo autonomo: requiere descargar y cargar el modelo base `wwwyyy/TimeZero-Charades-7B` para funcionar.
- Dependencia estricta de versiones: `transformers` 5.x (probado 5.12.1) y `peft` 0.19.1 o superior. Una version incorrecta puede cargar el adaptador sin aplicar los pesos LoRA, sin lanzar error.
- Entrenado exclusivamente sobre el split de entrenamiento de Charades-STA (2.400 pares), por lo que su generalizacion a otros dominios de video no esta documentada.
- La licencia es "other": no se especifican los terminos exactos, por lo que el uso comercial no esta garantizado y debe consultarse la licencia del modelo base y del articulo.
- Riesgo de alucinacion y sesgos: no documentados en la informacion disponible; al ser un modelo de investigacion, no se han publicado evaluaciones de sesgo.
- Idiomas soportados: no disponibles; el entrenamiento se realiza sobre Charades-STA, cuyas anotaciones estan en ingles.
- Uso previsto academico y de reproduccion experimental; no se documenta su idoneidad para produccion.
- Los resultados del adaptador raiz cubren todas las cifras de TimeZero con α = 0.5 del articulo excepto la fila de la Tabla 18 (Charades-CD), que proviene de `run-b/`; hay que tener en cuenta esta distincion al reproducir resultados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jinzijie-bupt/evidence-audit-timezero7b-pc-a05-s0
- Modelo base: https://huggingface.co/wwwyyy/TimeZero-Charades-7B
- Repositorio de codigo, datos y scripts de evaluacion: https://github.com/jinzijie-bupt/Accuracy-Is-Not-Evidence
- Articulo: Jin, Zijie; Zhao, Shuai; Tao, Haoran; Huang, Chaomin; Luo, Liwen. *Accuracy Is Not Evidence: Measuring and Training Evidence Dependence in Video Temporal Grounding*. arXiv preprint, 2026 (enlace arXiv no disponible en la informacion proporcionada).
