# obann001/Delphine-Cassarino-Flux-Rank32_lora

## Resumen

Delphine Cassarino Flux Rank32 LoRA es un adaptador LoRA de tipo personaje (character LoRA) entrenado sobre el modelo base `black-forest-labs/FLUX.1-dev`. Lo publica el usuario obann001 en HuggingFace bajo el identificador `obann001/Delphine-Cassarino-Flux-Rank32_lora`, con licencia MIT. Su funcion es sesgar la generacion de FLUX.1-dev hacia una identidad concreta de retrato (denominada Delphine Cassarino) mediante un token disparador (`dcsrn`), manteniendo la composicion general del modelo base.

El adaptador tiene rango 32 con alpha 128, se entrena en precision bf16 y ocupa 306.433.880 bytes (aproximadamente 153 millones de parametros estimados a partir del tamano del fichero). El checkpoint subido corresponde al paso `step01766` de una cadena de entrenamiento local ejecutada con ComfyUI (workflow FluxTrainer), y se selecciona por comparacion A/B con el checkpoint anterior `step00800`.

Es relevante ahora como ejemplo de flujo de trabajo de bajo coste para personalizacion de identidad en generacion texto-a-imagen: un fichero pequeno (0,3 GB) que se aplica sobre un modelo de difusion grande para producir retratos coherentes sin reentrenar el modelo completo. Su aplicacion es creativa y de exploracion visual, no biometrica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (rango 32, alpha 128) sobre el transformer de flujo rectificado FLUX.1-dev |
| Parametros totales | Adaptador: ~153 millones estimados (306.433.880 bytes en bf16). Modelo base FLUX.1-dev: 12 B (dato del modelo base) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica como contexto de texto; el codificador de texto del modelo base limita la longitud del prompt (no confirmado en la informacion proporcionada) |
| Tipos de cuantizacion | El adaptador se distribuye en bf16 (safetensors); el modelo base admite fp8 y cuantizaciones GGUF (no especificadas en la ficha) |
| Idiomas soportados | No aplica (generacion de imagen); los prompts de ejemplo de la model card estan en ingles |
| Licencia | MIT (adaptador) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 32 con alpha 128 que se aplica sobre FLUX.1-dev, un transformer de flujo rectificado (rectified flow transformer) para generacion texto-a-imagen. No modifica la arquitectura del modelo base: introduce matrices de bajo rango en las capas de atencion, de modo que se conserva el comportamiento compositivo del base mientras se sesga la identidad facial y de estilo hacia el personaje objetivo.

El entrenamiento se realizo con el workflow `flux_lora_train_delphine_clean.json` de ComfyUI FluxTrainer, sobre el dataset local `/raid1_II/Pictures/Avatars_et_Persos/Delphine_Cassarino`. Los hiperparametros documentados son: optimizador Adafactor (`relative_step=False`, `scale_parameter=False`), learning rate 2e-4, precision bf16 con base fp8 activada, modo de atencion sdpa, buckets de 256 a 2048, 3 repeticiones y un objetivo maximo de 1750 pasos. El checkpoint seleccionado es `step01766`. El token de clase `dcsrn` se inyecta mediante `class_tokens`. No se documenta el numero de imagenes del dataset ni el numero total de tokens de entrenamiento. No se menciona uso de RLHF, DPO ni decodificacion especulativa.

## Capacidades

- Generacion de imagenes texto-a-imagen de retratos con identidad coherente, activada por el token disparador `dcsrn`.
- Sesgo de estilo fotografico-realista: renderizado de piel natural, textura moderada y acabado no plastificado.
- Encuadre de retrato fuerte: cabeza/hombros, hasta el pecho y medio cuerpo.
- Sesgo de paleta calida (marron, ambar, oro suave, terracota) con apoyos frios (teal o pizarra) para fondos.
- Sesgo de rasgos declarado: sujeto femenino adulto, tono de piel oscuro, cabello rizado/ondulado.
- Compatible con flujos ComfyUI/Flux que permiten intercambio de LoRAs entre checkpoints.
- Soporte de guidance negativa mediante prompt negativo (el autor sugiere `deformed hands, extra fingers, blurry face, wax skin, overprocessed, text watermark`).
- No se documentan capacidades de tool calling, agentes, vision de entrada, audio ni modo de razonamiento (no aplica a un modelo de difusion).

## Casos de uso

- Retratos de personaje consistentes en pipelines creativos privados: aplicar el LoRA con el token `dcsrn` sobre FLUX.1-dev para obtener varias imagenes del mismo personaje variando encuadre y fondo, manteniendo la identidad visual entre ellas.
- Ilustracion editorial y conceptual: usar los extensores de estilo sugeridos (`editorial portrait`, `studio lighting`, `shallow depth of field`, `35mm look`) para generar retratos con acabado de revista a partir de un mismo personaje.
- Iteracion de prompts en ComfyUI: dado que el autor documenta un flujo FluxTrainer, el LoRA encaja en nodos de carga de LoRA sobre el base para probar familias de prompts sin reentrenar.
- Pruebas A/B de checkpoints: el autor conserva `step00800` y `step01766` para comprobaciones de regresion; sirve para comparar estabilidad de identidad entre pasos de entrenamiento.
- Prototipado de hojas de estilo (character sheet): usar la guia de identidad, paleta y encuadre de la model card como base para definir un estilo reproducible en un equipo creativo.
- Generacion de material de referencia para previsualizacion: crear retratos de concepto antes de una produccion real, ajustando la fuerza del LoRA y validando con multiples semillas.
- Docencia y experimentacion con LoRA: ejemplo compacto (0,3 GB, rango 32) para estudiar el efecto del rango, alpha y pasos de entrenamiento en la fidelidad de identidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card menciona comparaciones A/B de humo (smoke) entre `step00800` y `step01766` con imagenes de prueba (`samples/delphine-step00800-smoke.png` y `samples/delphine-step01766-smoke.png`), pero no aporta metricas cuantitativas (FID, CLIP score, similitud de identidad, etc.).

## Requisitos de hardware

- El adaptador en si ocupa 0,3 GB (306.433.880 bytes) y apenas anade carga de memoria; el coste real lo determina el modelo base FLUX.1-dev.
- Para ejecutar FLUX.1-dev en bf16 se estiman del orden de 24 GB o mas de VRAM solo en pesos, mas el coste de los codificadores de texto y las activaciones.
- En fp8 o cuantizaciones GGUF (Q8/Q5/Q4) el consumo se reduce de forma notable, permitiendo su uso en GPU de consumo.
- GPU de gama alta recomendadas para fp16/bf16: A100, H100, o equivalentes con 40-80 GB.
- GPU de consumo: una RTX 4090 (24 GB) puede ejecutar el modelo base con cuantizacion; tarjetas de 12-16 GB requieren cuantizaciones GGUF mas agresivas.
- Opciones de despliegue: diffusers (libreria declarada), ComfyUI (stack de entrenamiento e inferencia del autor) y, para el base, runtimes que soporten GGUF/quantizacion.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Licencia | Disponibilidad |
|---|---|---|---|---|
| Delphine Cassarino Flux Rank32 LoRA (este) | LoRA de personaje sobre FLUX.1-dev | ~153 M (adaptador), 0,3 GB | MIT (adaptador) | HuggingFace |
| FLUX.1-dev (base sin LoRA) | Transformer de flujo rectificado | 12 B | Licencia no comercial de FLUX.1-dev | HuggingFace |
| Delphine Flux LoRA `step00800` | LoRA de personaje (checkpoint previo) | no disponible | MIT (adaptador) | Referenciado por el autor, no como repo separado confirmado |
| Otras character LoRA sobre FLUX | LoRA de personaje | Variable segun autor | Variable | HuggingFace |

No se dispone de datos de rendimiento comparativos entre estas opciones en la informacion proporcionada.

## Limitaciones y advertencias

- Entrenado sobre un dominio de identidad estrecho; si se sobrepondera la fuerza del LoRA puede reducir la diversidad de las salidas.
- La propia model card indica que no es apto para reclamaciones de suplantacion, verificacion de identidad biometrica ni vigilancia.
- Riesgo de alucinacion visual: artefactos, manos deformes, dedos extra, caras borrosas o piel cerosa; el autor recomienda prompt negativo y validar con varias semillas.
- No realiza bloqueo facial biometrico estricto; es un sesgo de estilo e identidad, no una reproduccion fiel garantizada.
- Restriccion de licencia relevante: el adaptador es MIT, pero el modelo base FLUX.1-dev se distribuye bajo licencia no comercial, por lo que el uso comercial queda condicionado por la licencia del base.
- Requiere respetar consentimiento y derechos de imagen del sujeto representado; evitar contenido enganoso, difamatorio o no consentido.
- El repo tiene 0 descargas y 0 likes, y la fecha de creacion/actualizacion es 2026-10-09; sin mantenimiento ni validacion externa documentada.
- No se documentan idiomas, numero de imagenes de entrenamiento ni metricas cuantitativas, lo que limita la evaluacion objetiva.
- Los prompts de ejemplo y la guia estan en ingles; no se garantiza comportamiento equivalente en otros idiomas.

## Enlaces

- HuggingFace: https://huggingface.co/obann001/Delphine-Cassarino-Flux-Rank32_lora
- Modelo base FLUX.1-dev: https://huggingface.co/black-forest-labs/FLUX.1-dev
- Imagenes de ejemplo en el repo: `samples/delphine-step00800-smoke.png` y `samples/delphine-step01766-smoke.png`
- Referencias locales citadas por el autor (no enlazadas publicamente): `../framework/assets/delphine-step00800-smoke.png`, `../framework/assets/delphine-step01766-smoke.png`, `../framework/portal-nemokid.html`
- Workflow de entrenamiento citado por el autor: `flux_lora_train_delphine_clean.json` (ComfyUI FluxTrainer)
- Fichero de pesos: `flux_file_delphine_32network128_rank32_bf16-step01766.safetensors` (SHA256: `561e4a883438d9730c75fbda79c061ca942c019c5c4e565ed18ff186843adbf8`)
