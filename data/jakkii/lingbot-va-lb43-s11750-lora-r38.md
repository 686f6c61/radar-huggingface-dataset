# jakkii/lingbot-va-lb43-s11750-lora-r38

## Resumen

LingBot-VA LB43 s11750 LoRA r38 es un adaptador LoRA de bajo rango para el modelo de robotica LingBot-VA, desarrollado por el usuario jakkii. No se trata de un modelo completo, sino de un conjunto de pesos entrenables (28.016.640 parametros en float32) que se aplican sobre las proyecciones de atencion (`attn1`) de los 30 bloques del transformer del modelo base `kenzhengjk/lingbot-va-lb43-s11750`. El backbone permanece congelado y no se distribuye en este repositorio.

El adaptador se entrena sobre el modelo base ya ajustado finamente con las demos limpias de 43 tareas de RoboTwin (estado s11750), y anade 2.150 episodios adicionales de esas mismas 43 tareas. La perdida combina un termino de video (L_video) y un termino de accion (L_action), lo que es coherente con un modelo de tipo vision-language-action (VLA) orientado a manipulacion robotica.

Su relevancia es acotada pero tecnica: sirve como control de bajo rango frente a una ejecucion con rango 154 (aproximadamente cuatro veces mas parametros) y permite estudiar el efecto del rango del LoRA en el rendimiento de un VLA sin reentrenar el backbone. El repositorio incluye checkpoints cada 250 pasos (de 250 a 6000) y un estado de reanudacion en el paso 5750 para continuar el entrenamiento hasta 10.000 pasos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre transformer (modelo base tipo VLA LingBot-VA); adaptador aplicado a `attn1` (to_q, to_k, to_v, to_out.0) de 30 bloques, 120 capas lineales |
| Parametros totales | 28.016.640 parametros entrenables (solo el adaptador); el backbone no esta incluido |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos del adaptador en float32) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (`lb_lora/adapter.safetensors`, float32, ~107 MiB por checkpoint) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 38 y alpha 38 (escala 1) inicializado con A en kaiming-uniform (a = sqrt 5, generador con semilla 1234) y B a cero. Se inyecta en las proyecciones to_q, to_k, to_v y to_out.0 de la atencion `attn1` de los 30 bloques del modelo base, lo que da 120 matrices lineales adaptadas. Los tensores se nombran `blocks.<i>.attn1.<proj>.lora_A.weight` y `lora_B.weight`. El modelo base es LingBot-VA ajustado finamente sobre las demos limpias de 43 tareas de RoboTwin en el paso 11.750, y debe cargarse en la revision `70db6add`.

El entrenamiento usa 2.150 episodios (43 tareas vistas x 50 demos limpias), optimizador AdamW con lr 1e-4, betas (0,9; 0,95), weight decay 0 y gradient clip 1,0. El esquema previsto es de 10.000 pasos (200 de warmup, luego constante hasta 9.000 y coseno hasta 0,1x en 10.000), pero esta ejecucion se detuvo en el paso 6.000, por lo que el lr se mantiene en 1e-4 en todos los checkpoints publicados tras el warmup. El batch efectivo es de 8 muestras por paso (4 GPUs x batch 1 x acumulacion de gradiente 2), con semilla 1 + rango. La perdida combina L_video + L_action. Se guardan checkpoints cada 250 pasos y se incluye el estado de reanudacion del paso 5.750 (pesos LoRA, momentos de AdamW, scheduler, posicion de datos y estado RNG de cada uno de los 4 rangos).

## Capacidades

- Adaptacion de un modelo VLA para manipulacion robotica en las 43 tareas de RoboTwin sobre las que se entreno.
- Prediccion conjunta de video y acciones (L_video + L_action), consistente con un modelo vision-language-action.
- Aprendizaje de bajo rango sobre las proyecciones de atencion del backbone, sin modificar los pesos originales.
- Instalacion no fusionada mediante el codigo Zero-WAM-fork (`research/lingbot_va/lora.py`, cargado por `research/lingbot_va/server.py`).
- Posibilidad de fusionar los pesos manualmente mediante W += (alpha / rank) * B @ A.
- Reanudacion del entrenamiento desde el paso 5.750 con el mismo world size (4 GPUs) y modo LoRA.
- No se documentan capacidades de tool calling, agentes, multilingueismo, vision general, audio ni modo de razonamiento explicito.

## Casos de uso

- Investigacion sobre el efecto del rango LoRA en VLA: comparar este adaptador de rango 38 con la ejecucion de rango 154 sobre el mismo backbone y los mismos datos para aislar la contribucion del rango al rendimiento en tareas de manipulacion.
- Reproduccion de experimentos de RoboTwin: cargar el checkpoint deseado (250-6000) con el modelo base en la revision `70db6add` y evaluar las 43 tareas vistas con las 50 demos limpias de referencia.
- Ajuste fino eficiente en robotica: usar el adaptador como punto de partida para nuevas tareas o dominios sin reentrenar el backbone congelado, aprovechando que solo se almacenan 28 millones de parametros.
- Despliegue en el servidor oficial de LingBot-VA: construir una carpeta de checkpoint por paso enlazando `transformer`, `vae`, `text_encoder` y `tokenizer` del modelo base y colocando `lb_lora/` junto a ellos.
- Analisis de convergencia y estabilidad: inspeccionar `metrics.jsonl` y los checkpoints intermedios cada 250 pasos para estudiar la evolucion de las perdidas de video y accion durante las primeras 6.000 iteraciones.
- Continuacion del entrenamiento: reanudar desde `resume/step_5750/` con `num_steps` 10000 para completar el esquema previsto y comparar el resultado con la ejecucion detenida en 6.000.
- Fusion e integracion en pipelines propios: aplicar W += (alpha / rank) * B @ A para obtener un unico conjunto de pesos compatible con herramientas que no soportan LoRA en tiempo de ejecucion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible para el modelo completo; el adaptador por si solo ocupa unos 107 MiB en float32 por checkpoint, pero requiere cargar el backbone LingBot-VA (transformer, VAE, text encoder y tokenizer) para funcionar.
- GPU recomendadas: no disponible. El entrenamiento se realizo con 4 GPUs (batch 1 por GPU y acumulacion de gradiente 2), sin especificar el modelo de GPU.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: servidor oficial de LingBot-VA a traves de Zero-WAM-fork (`research/lingbot_va/server.py`), con el adaptador instalado sin fusionar; tambien es posible la fusion manual de pesos. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| LingBot-VA LB43 s11750 LoRA r38 (este) | 28.016.640 (adaptador) | no disponible | no disponible | Hugging Face, requiere modelo base `kenzhengjk/lingbot-va-lb43-s11750` en revision `70db6add` |
| LingBot-VA LB43 s11750 LoRA r154 (ejecucion de referencia) | aproximadamente 113.273.856 (deltas del cabezal HFS, segun la model card) | no disponible | no disponible | referenciado en la model card, sin enlace directo |
| LingBot-VA LB43 s11750 (modelo base) | no disponible | no disponible | no disponible | Hugging Face (`kenzhengjk/lingbot-va-lb43-s11750`) |
| Otros VLA de robotica (por ejemplo, RT-2, OpenVLA) | no disponible en la informacion proporcionada | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El repositorio no contiene el backbone: es imprescindible descargar el modelo base `kenzhengjk/lingbot-va-lb43-s11750` en la revision `70db6add`; sin el, el adaptador no es utilizable.
- Solo se entreno sobre 43 tareas de RoboTwin con 50 demos limpias por tarea; se desconoce la generalizacion a tareas, entornos o morfologias no vistas.
- El entrenamiento se detuvo en el paso 6.000 de un esquema de 10.000, por lo que los checkpoints publicados no reflejan el schedule completo (lr constante en 1e-4 tras el warmup).
- La licencia no esta declarada, lo que impide determinar las condiciones de uso comercial; debe consultarse con el autor antes de cualquier despliegue en produccion.
- No se documentan sesgos, tasas de alucinacion ni evaluaciones de robustez; al tratarse de un adaptador de investigacion con 0 descargas y 0 likes, no hay evidencia externa de calidad.
- Los archivos `launch_info.json`, `metrics.jsonl` y `lb_export.json` contienen rutas absolutas del cluster de entrenamiento, no reproducibles fuera de el.
- La reanudacion exige el mismo world size (4 GPUs) y modo LoRA; no es portable a otras configuraciones sin ajustes.
- No hay informacion sobre cuantizaciones, longitud de contexto ni idiomas soportados, lo que limita la planificacion de despliegues con restricciones de memoria.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/jakkii/lingbot-va-lb43-s11750-lora-r38
- Modelo base: https://huggingface.co/kenzhengjk/lingbot-va-lb43-s11750
- Repositorio de codigo Zero-WAM-fork, rama `handoff/1114-lingbot-hfs-lora`, archivo `research/lingbot_va/cluster/HANDOFF_1114.md` (sin URL publica en la informacion disponible)
- No se han encontrado papers, blogs ni demos adicionales en la informacion proporcionada.
