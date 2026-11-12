# iclropen/evidence-audit-qwen7b-pc-a05-s2

## Resumen

`evidence-audit-qwen7b-pc-a05-s2` es un adaptador LoRA de tipo PEFT para el modelo base Qwen2.5-VL-7B-Instruct, desarrollado por el usuario `iclropen` como artefacto de investigación asociado al paper "Accuracy Is Not Evidence: Measuring and Training Evidence Dependence in Video Temporal Grounding" (envío a ICLR 2027, en revisión). No es un modelo autónomo: requiere cargar Qwen2.5-VL-7B-Instruct y superponer los pesos LoRA que contiene este repositorio.

El adaptador se entrena con un objetivo "placebo-controlled" que penaliza que el modelo dependa de señales espurias (ediciones fuera del intervalo anotado) en lugar de la evidencia visual real. Está especializado en *video temporal grounding* sobre el conjunto Charades-STA, es decir, localizar el intervalo temporal de un vídeo que corresponde a una consulta en lenguaje natural.

El repositorio es de tamaño reducido (0,2 GB) y contiene únicamente los pesos del adaptador en formato safetensors, con licencia Apache 2.0. Su relevancia es metodológica: sirve como material reproducible para auditar la dependencia de evidencia en modelos de grounding temporal, más que como modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer multimodal Qwen2.5-VL (vision tower + language model) |
| Parametros totales | no disponible (solo se publican los pesos del adaptador: 190.435.728 bytes en `adapter_model.safetensors`) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de Qwen2.5-VL-7B-Instruct; no especificada en la informacion) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador LoRA en `adapter_model.safetensors`) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen2.5-VL-7B-Instruct mediante LoRA con rango r=16, `lora_alpha=32` y dropout 0,05, sobre los módulos `q/k/v/o/gate/up/down_proj`. Según la model card, los adaptadores se entrenaron con transformers 4.51 y checkpointing de gradiente, lo que provocó que la torre de visión no recibiera gradiente: las matrices `lora_B` de esa torre son todas cero, de modo que el adaptador modifica únicamente el modelo de lenguaje.

El objetivo de entrenamiento (Sección 4 del paper) combina supervisión limpia con un término de control placebo: L = alpha · NLL(clean) + suma sobre operadores de w_op · [softplus(-beta [r(x) - r(x_E)]) + softplus(-beta [r(x_O) - r(x_E)]) + hinge sobre la caída placebo], donde x_E es el vídeo con edición de evidencia y x_O el placebo emparejado fuera del intervalo anotado. Los hiperparámetros publicados son alpha=0,5, beta=0,1, cota placebo d_O(entrenado) ≤ 1,25 · d_O(referencia) + 0,10 con peso hinge 1,0, pesos de operador Group-DRO, 2.400 pares de entrenamiento (Charades-STA train), 300 pasos de optimizador, semilla 2, learning rate 5e-6 y acumulación de gradiente 8. Los operadores de edición usados en entrenamiento son swap, mask, blur, tshift y shuffle (2 por ejemplo). La entrada de vídeo se procesa a 2 fps con un máximo de 768 fotogramas, con estilo de prompt `timer1_default` / respuesta `timer1` y orden de mensajes vídeo primero y texto después.

## Capacidades

- Localización de intervalos temporales en vídeo a partir de una consulta textual (*video temporal grounding*), especialidad del adaptador.
- Razonamiento multimodal heredado de Qwen2.5-VL-7B-Instruct (visión y lenguaje), aunque el adaptador solo altera el modelo de lenguaje.
- Procesamiento de vídeo a 2 fps con hasta 768 fotogramas como entrada.
- Evaluación de dependencia de evidencia: el adaptador está diseñado para que las predicciones se apoyen en la evidencia visual y no en señales espurias.
- Soporte de *tool calling* / *function calling*: no disponible (no se documenta en la información proporcionada).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado).
- Capacidades multilingües: no disponibles (no documentadas).
- Capacidades especiales (thinking mode, audio): no disponibles.

## Casos de uso

- Auditoría de robustez en grounding temporal: cargar el adaptador sobre Qwen2.5-VL-7B-Instruct y ejecutar los scripts de auditoría de verosimilitud y comportamiento del repositorio de código para medir cuánto depende el modelo de la evidencia real frente a ediciones placebo.
- Reproducción de experimentos del paper: el adaptador corresponde a una configuración concreta (placebo-controlled, alpha=0,5, semilla 2) y permite reproducir los resultados de la Tabla correspondiente del paper con `--model  --adapter <folder>`.
- Investigación en *video temporal grounding* sobre Charades-STA: sirve como punto de partida para comparar objetivos de entrenamiento (supervisión limpia frente a control placebo) en la misma arquitectura base.
- Desarrollo de sistemas de búsqueda de momentos en vídeo: el adaptador puede integrarse en un pipeline que reciba un vídeo y una consulta y devuelva el intervalo temporal correspondiente, siempre que se valide su comportamiento fuera del dominio de entrenamiento.
- Estudio de sesgos de atajo (*shortcut learning*): útil para analizar si un modelo de grounding responde a pistas de contexto o a la evidencia visual, mediante los operadores de edición swap, mask, blur, tshift y shuffle.
- Base para *fine-tuning* posterior: al ser un adaptador LoRA ligero (0,2 GB), puede combinarse o sustituirse por otros adaptadores sobre el mismo modelo base en experimentos de investigación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma específica; al requerir el modelo base Qwen2.5-VL-7B-Instruct en bfloat16, se necesita aproximadamente el espacio del modelo base completo más el adaptador (0,2 GB). No se publican cifras exactas.
- GPU recomendadas: no disponible en la información proporcionada.
- ¿Cabe en GPU de consumo? no disponible (depende del modelo base y de la cuantización, no documentada).
- Opciones de despliegue: carga mediante `transformers==4.51.3` y `peft==0.20.0` según la model card; no se documentan vLLM, llama.cpp, Ollama ni TGI para este adaptador.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| evidence-audit-qwen7b-pc-a05-s2 | Adaptador LoRA sobre Qwen2.5-VL-7B | no disponible | Video temporal grounding (Charades-STA) | Apache 2.0 | Hugging Face (repo de 0,2 GB) |
| Qwen2.5-VL-7B-Instruct (base) | 7B (no confirmado en la informacion) | no disponible | Multimodal general (visión, vídeo, texto) | no disponible en la informacion | Hugging Face |
| Alternativas de grounding temporal | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de modelos comparables adicionales en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo autónomo: requiere Qwen2.5-VL-7B-Instruct y las versiones exactas `transformers==4.51.3` y `peft==0.20.0`. Cargarlo con transformers 5.x no produce error pero deja los pesos LoRA sin cargar (no-op silencioso), por lo que es imprescindible ejecutar el auto-chequeo incluido en la model card.
- La torre de visión no recibió gradiente durante el entrenamiento: las matrices `lora_B` de esa torre son cero y el adaptador solo modifica el modelo de lenguaje.
- Especialización estrecha: entrenado para *video temporal grounding* sobre Charades-STA con 2.400 pares y 300 pasos; su comportamiento fuera de ese dominio no está documentado.
- Riesgo de alucinación y sesgos: no documentados en la información disponible; al ser un artefacto de investigación, no se han publicado evaluaciones de sesgo.
- Idiomas soportados: no disponibles; no se documenta cobertura multilingüe del adaptador.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen2.5-VL-7B-Instruct tiene su propia licencia que debe verificarse por separado.
- Estado del paper: envío a ICLR 2027 en revisión; los resultados pueden cambiar y el adaptador corresponde a una configuración concreta (semilla 2, alpha=0,5) que no representa necesariamente el mejor rendimiento del método.
- Sin descargas ni likes en el momento de la consulta: no hay evidencia de uso en producción ni validación externa.

## Enlaces

- Repositorio Hugging Face del adaptador: https://huggingface.co/iclropen/evidence-audit-qwen7b-pc-a05-s2
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-VL-7B-Instruct
- Repositorio de código del paper: https://huggingface.co/iclropen/evidence-audit-code
- Paper: "Accuracy Is Not Evidence: Measuring and Training Evidence Dependence in Video Temporal Grounding", envío a ICLR 2027 (en revisión; sin enlace directo disponible en la información proporcionada).
