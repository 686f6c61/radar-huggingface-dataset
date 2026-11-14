# jakkii/lingbot-va-lb43-s11750-lora-r77

## Resumen

LingBot-VA LB43 s11750 LoRA r77 es un adaptador LoRA de bajo rango para robótica, desarrollado por el usuario jakkii sobre el modelo base `kenzhengjk/lingbot-va-lb43-s11750`. No es un modelo completo, sino un conjunto de pesos entrenados (56.770.560 parámetros en float32) que se instalan sobre un backbone congelado. El adaptador se aplica exclusivamente a las proyecciones `to_q`, `to_k`, `to_v` y `to_out.0` de la atención `attn1` en los 30 bloques del transformer, sumando 120 capas lineales modificadas.

El modelo base es una variante de LingBot-VA afinada completamente sobre 43 tareas de RoboTwin (entorno de simulación de manipulación robótica), en el paso 11.750. Este adaptador LoRA se entrena con el mismo recetario pero con rango 77, la mitad del rango 154 usado en un experimento control de parámetros equivalentes, y se detiene en el paso 6.000 de un calendario de 10.000 pasos. La función de pérdida combina L_video y L_action, lo que indica que el modelo base es de tipo visión-lenguaje-acción (VLA) para control robótico.

Su relevancia radica en que documenta un experimento de ablación de rango LoRA en el contexto de modelos VLA para robótica, con checkpoints cada 250 pasos y estado de reanudación incluido. El repositorio ocupa 5,9 GB, aunque el adaptador en sí pesa 217 MiB por checkpoint. No tiene descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre transformer de difusión/atención (LingBot-VA); adaptador en `attn1` de 30 bloques |
| Parametros totales | 56.770.560 (solo adaptador LoRA, float32) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en float32) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (`lb_lora/adapter.safetensors`) |
| Modelo base | `kenzhengjk/lingbot-va-lb43-s11750` (revision `70db6add`) |
| Rango LoRA | 77 (alpha 77, scale 1) |
| Capas objetivo | `blocks.<i>.attn1.to_q`, `to_k`, `to_v`, `to_out.0` para i en 0..29 |
| Checkpoints | cada 250 pasos, de `checkpoint_step_250` a `checkpoint_step_6000` |
| Estado de reanudacion | `resume/step_5750/` (pesos, momentos AdamW, scheduler, posicion de datos, RNG) |

## Arquitectura y entrenamiento

El adaptador se monta sobre un backbone LingBot-VA congelado, que a su vez es un modelo VLA (visión-lenguaje-acción) afinado completamente sobre 43 tareas de RoboTwin con 2.150 episodios (43 tareas x 50 demos limpias). El adaptador LoRA modifica únicamente las proyecciones de query, key, value y salida de la atención `attn1` en los 30 bloques del transformer, con rango 77 y alpha 77 (scale 1). La inicialización es kaiming-uniform (a = sqrt 5) para la matriz A con semilla 1234, y B se inicializa a cero. La pérdida combina L_video + L_action, lo que confirma que el modelo base predice tanto observaciones visuales como acciones motoras.

El entrenamiento usa AdamW con lr 1e-4, betas (0.9, 0.95), weight decay 0 y gradient clip 1.0. El calendario es de 10.000 pasos con 200 de warmup, constante hasta el paso 9.000 y decaimiento coseno hasta 0,1x en el paso 10.000; este adaptador se detiene en el paso 6.000, por lo que la tasa de aprendizaje se mantiene en 1e-4 en todos los checkpoints guardados. El batch efectivo es de 8 muestras por paso (4 GPUs x batch 1 x acumulación de gradiente 2), con semilla 1 + rango. Se guardan checkpoints cada 250 pasos y se incluye un estado de reanudación en el paso 5.750 para continuar el entrenamiento hasta los 10.000 pasos, requiriendo el mismo world size (4 GPUs) y modo lora.

## Capacidades

- Control robótico de manipulación: el adaptador modifica un modelo VLA entrenado sobre 43 tareas de RoboTwin, orientado a generar acciones motoras a partir de observaciones visuales e instrucciones.
- Predicción conjunta de vídeo y acción: la pérdida L_video + L_action sugiere que el modelo base genera representaciones visuales y acciones de forma acoplada.
- Aprendizaje de bajo rango sobre backbone congelado: permite adaptar el modelo base a nuevos datos o tareas sin reentrenar los pesos completos.
- Compatibilidad con el servidor oficial de LingBot-VA: el adaptador se carga sin fusionar mediante `research/lingbot_va/lora.py` y `research/lingbot_va/server.py` del fork Zero-WAM.
- Posibilidad de fusión de pesos: W += (alpha / rank) * B @ A para integrar el adaptador en el backbone.
- Reanudación de entrenamiento: el estado `resume/step_5750/` permite continuar el calendario hasta los 10.000 pasos.
- No se documentan capacidades de tool calling, agentes, multilingüismo, visión general, audio ni modo thinking.

## Casos de uso

- Investigación en adaptación eficiente de modelos VLA: el adaptador sirve como punto de partida para estudiar cómo el rango LoRA (77 frente a 154) afecta al rendimiento en tareas de manipulación robótica, con checkpoints intermedios cada 250 pasos para analizar la evolución.
- Experimentos de ablación controlada: al compartir recetario con el run de rango 154, permite comparar el efecto de reducir el rango a la mitad manteniendo el mismo número de pasos y datos, aislando la variable del rango.
- Fine-tuning sobre nuevas tareas de RoboTwin: partiendo del backbone `lingbot-va-lb43-s11750`, se puede reentrenar el adaptador con demos de tareas adicionales, aprovechando que solo se actualizan 56,7 M de parámetros.
- Despliegue en simulación robótica: el adaptador se integra en el servidor oficial de LingBot-VA para evaluar políticas de manipulación en el entorno RoboTwin sin necesidad de fusionar pesos.
- Reanudación de entrenamientos largos: el estado de reanudación en el paso 5.750 permite continuar el calendario de 10.000 pasos en un clúster de 4 GPUs, útil para reproducir experimentos o extender el entrenamiento.
- Estudio de la dinámica de pérdidas vídeo-acción: los checkpoints cada 250 pasos y el `metrics.jsonl` permiten analizar cómo evolucionan L_video y L_action durante el entrenamiento.
- Base para comparaciones de estrategias de adaptación: sirve como referencia para evaluar LoRA de rango medio frente a ajuste completo o adaptadores de mayor rango en modelos de robótica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible para el adaptador aislado; depende del backbone LingBot-VA completo, que no se incluye en este repositorio.
- El adaptador en sí ocupa 217 MiB por checkpoint en float32, pero requiere cargar el modelo base completo (`kenzhengjk/lingbot-va-lb43-s11750`) con sus carpetas `transformer`, `vae`, `text_encoder` y `tokenizer`.
- GPU recomendadas: el entrenamiento se realizó con 4 GPUs (batch 1 por GPU, acumulación 2); no se especifica el modelo de GPU.
- Para reanudar el entrenamiento se requiere el mismo world size (4 GPUs) y modo lora.
- Opciones de despliegue: servidor oficial de LingBot-VA (`research.lingbot_va/server.py`) del fork Zero-WAM; no se documentan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| jakkii/lingbot-va-lb43-s11750-lora-r77 | 56,7 M (adaptador LoRA) | no disponible | no disponible | Hugging Face | Rango 77, paso 6.000 |
| Run de rango 154 (mismo autor, referenciado) | 113,3 M (adaptador LoRA) | no disponible | no disponible | no disponible en la informacion | Run control con el doble de parametros |
| kenzhengjk/lingbot-va-lb43-s11750 (modelo base) | no disponible | no disponible | no disponible | Hugging Face | Backbone completo afinado en 43 tareas RoboTwin |

No se dispone de datos de rendimiento ni de otros modelos comparables en la informacion proporcionada.

## Limitaciones y advertencias

- El adaptador no es un modelo autónomo: requiere el backbone `kenzhengjk/lingbot-va-lb43-s11750` en la revisión `70db6add`, que no está incluido en este repositorio.
- El entrenamiento se detuvo en el paso 6.000 de un calendario de 10.000, por lo que el modelo no ha completado el decaimiento coseno previsto.
- Licencia no disponible: no se puede confirmar si el uso comercial está permitido.
- Idiomas no disponibles: no se documenta soporte multilingüe.
- El adaptador está especializado en las 43 tareas de RoboTwin usadas en el entrenamiento; su generalización a otras tareas o entornos no está documentada.
- Los archivos de configuración (`launch_info.json`, `metrics.jsonl`, `lb_export.json`) contienen rutas absolutas del clúster de entrenamiento, lo que puede dificultar la reproducibilidad fuera de ese entorno.
- La reanudación del entrenamiento exige exactamente 4 GPUs y modo lora; no es portable a otras configuraciones sin ajustes.
- No se han publicado benchmarks, por lo que no hay evidencia cuantitativa de rendimiento frente a alternativas.
- Riesgo de alucinación y sesgos: no documentados en la informacion disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jakkii/lingbot-va-lb43-s11750-lora-r77
- Modelo base: https://huggingface.co/kenzhengjk/lingbot-va-lb43-s11750
- Repositorio del código (fork Zero-WAM, rama `handoff/1114-lingbot-hfs-lora`): no disponible como URL en la informacion proporcionada
- Documento de traspaso: `research/lingbot_va/cluster/HANDOFF_1114.md` (rama `handoff/1114-lingbot-hfs-lora` de Zero-WAM-fork), sin URL directa en la informacion
