# dhruv1672/data266-pokemon-lora-r4

## Resumen

`dhruv1672/data266-pokemon-lora-r4` es un adaptador LoRA de rango 4 entrenado sobre Stable Diffusion 1.5 para la generacion de imagenes de criaturas estilo Pokemon. Lo desarrolla Dhruv Patel con asistencia de Mana AI en el marco del laboratorio DATA266 de la Universidad Estatal de San Jose (SJSU), y se publica como parte del Team28. No es un modelo completo de difusion, sino un adaptador de las proyecciones de atencion del UNet que se carga sobre los pesos congelados de SD1.5.

El modelo resuelve un problema acotado: especializar un modelo text-to-image generico en un dominio visual muy concreto (criaturas cartoon aisladas) con un presupuesto de entrenamiento minimo. Con solo 797.184 parametros entrenables, 1.500 actualizaciones del optimizador y 0,135625 GPU-horas en una A100-SXM4-40GB, el adaptador reduce el KID frente a la base en el conjunto de test del autor (0,042548 frente a 0,064831), a costa de un CLIP score ligeramente inferior (31,9753 frente a 33,2198).

Es relevante ahora como referencia metodologica mas que como modelo de produccion: documenta de forma inusualmente transparente el pipeline de entrenamiento, la evaluacion con KID y CLIP, la deteccion de near-duplicates por hash perceptual y los fallos de composicion. La licencia restringe el uso a fines educativos y de investigacion no comerciales, y el propio autor advierte de que el estudio humano ciego de 25 pares con tres evaluadores sigue pendiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre UNet de Stable Diffusion 1.5 (diffusers) |
| Parametros totales | 797.184 parametros entrenables (adaptador); pesos base SD1.5 no incluidos |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo text-to-image; condicionamiento por prompt CLIP) |
| Tipos de cuantizacion | no disponible (entrenado y evaluado en fp16) |
| Idiomas soportados | en |
| Licencia | other: upstream-terms-and-research-restrictions (uso educativo/investigacion no comercial) |
| Formato de pesos | pesos de adaptador diffusers (`load_lora_weights`) |
| Rango / alpha | 4 / 4 |
| Modelo base | stable-diffusion-v1-5/stable-diffusion-v1-5, revision `451f4fe16113bff5a5d2269ed5ad43b0592e9a14` |
| Dataset | reach-vb/pokemon-blip-captions, revision `3790f29981f74ca26bf11662048342e19c5b615e` |
| Resolucion de entrenamiento | 512 px, center-fit bicubico |
| Tamano del repo | 0.0 GB |

## Arquitectura y entrenamiento

El adaptador aplica LoRA exclusivamente a las proyecciones de atencion del UNet de SD1.5, con rango 4 y alpha 4. El VAE y el codificador de texto CLIP permanecen congelados; las medias y desviaciones de la posterior del VAE, asi como los embeddings CLIP, se precalculan y cachean para acelerar el bucle, aunque en cada paso se muestrean latentes posteriores frescos. El entrenamiento usa AdamW con learning rate 0,0001, 100 actualizaciones de warmup, batch de 4, semilla 266 y 1.500 actualizaciones del optimizador, sin volteos horizontales de imagen.

Los datos proceden de `reach-vb/pokemon-blip-captions`: 833 imagenes legibles, sin corruptas ni duplicados exactos a nivel de pixel. Las ilustraciones relacionadas se agruparon mediante una heuristica conservadora de hash perceptual antes de un split fijo con semilla 266 (749 de entrenamiento, 84 de test), excluyendo las imagenes de test de las caches de entrenamiento. El autor advierte de que la deteccion de near-duplicates no es perfecta y de que las captions BLIP pueden ser erroneas. El sesgo hacia criaturas cartoon aisladas limita la generalizacion de composicion y fondos.

La innovacion tecnica destacable no esta en la arquitectura sino en la trazabilidad: configuracion versionada (`experiment_config.json`), commits de prerregistro y presupuesto final, y checkpoints completos de optimizador, scheduler, scaler y RNG conservados fuera del repositorio. El bucle medido tarda 488,248 segundos (0,135625 GPU-horas) con un pico de memoria asignada de 2,789 GiB en una A100-SXM4-40GB en fp16 con gradient checkpointing.

## Capacidades

- Generacion text-to-image de criaturas cartoon estilo Pokemon a partir de prompts en ingles.
- Especializacion de dominio sobre SD1.5: reproduce paletas, formas y estilos presentes en el dataset de entrenamiento.
- Composicion de escenas simples con un unico sujeto dominante.
- Condicionamiento por prompt de texto en ingles (CLIP ViT-B/32 del pipeline base).
- Integracion con el ecosistema diffusers mediante `load_lora_weights`.
- Compatibilidad con el safety checker de Stable Diffusion, activado en todas las generaciones del autor.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, vision de entrada, audio ni modo thinking: es exclusivamente un adaptador de difusion texto-a-imagen.

## Casos de uso

- Investigacion educativa sobre fine-tuning con LoRA: sirve como caso reproducible de entrenamiento de bajo coste (0,135625 GPU-horas) con evaluacion KID/CLIP documentada, util para comparar rangos 4 y 16 en un mismo presupuesto.
- Generacion de concept art para prototipos de videojuegos: el adaptador produce criaturas cartoon coherentes con el estilo del dataset, adecuado para bocetos internos no comerciales antes de encargar arte final.
- Docencia en cursos de difusion: permite demostrar en una GPU de consumo el flujo completo de carga de un adaptador sobre SD1.5 con el snippet oficial del autor.
- Experimentos de evaluacion de modelos generativos: el par de adaptadores r4/r16 y las 120 imagenes publicadas en `dhruv1672/data266-pokemon-generations` permiten replicar metricas KID, CLIP y LPIPS.
- Pruebas de seguridad y filtrado: el autor documenta una salida marcada por el safety checker y devuelta en negro sin remuestreo, lo que sirve para validar pipelines de moderacion.
- Generacion de ilustraciones para material didactico no comercial: con prompts en ingles y sujetos unicos, encaja en fichas o presentaciones internas siempre que se respeten los terminos upstream y los derechos de personaje.
- Estudio de sesgos y memorizacion: la comparacion CLIP entre salidas y las 749 imagenes de entrenamiento permite analizar similitud estilistica y riesgos de reproduccion de assets protegidos.

## Benchmarks y rendimiento

Evaluacion del autor con DDIM a 30 pasos, guidance 7.5, 512 px, semillas 0 y 1, 20 prompts (10 captions held-out, 5 out-of-domain, 5 composicionales) y 40 imagenes por modelo (120 en total). KID calculado con Inception 2048 y MMD polinomial sobre 50 subconjuntos de 20 salidas frente a las 84 imagenes de test; la dispersion mostrada es desviacion tipica de subconjunto, no intervalo de confianza.

| Modelo | KID (menor mejor) | CLIP score (mayor mejor) | LPIPS | Flags del safety filter |
|---|---:|---:|---:|---:|
| Base SD1.5 | 0,064831 ± 0,008320 | 33,2198 | 0,841180 | 0 |
| LoRA rank 4 | 0,042548 ± 0,006309 | 31,9753 | 0,792436 | 1 |
| LoRA rank 16 | 0,038084 ± 0,005702 | 32,2778 | 0,772825 | 0 |

El autor senala que el KID de muestra pequena es ruidoso y no establece superioridad estadistica del rank 16. Ambos adaptadores pierden algo de alineacion con el prompt y diversidad frente a la base. El estudio humano ciego de 25 pares con tres evaluadores sigue pendiente y no se han fabricado valoraciones humanas.

## Requisitos de hardware

- VRAM estimada para inferencia: el pipeline completo de SD1.5 en fp16 requiere aproximadamente 4-6 GB; el adaptador anade un coste despreciable (797.184 parametros).
- Entrenamiento medido: pico de 2,789 GiB de memoria asignada en A100-SXM4-40GB con fp16 y gradient checkpointing; se aplico un tope de asignacion de 15 GiB en PyTorch.
- Ejecucion real en GPU de 16 GB no verificada segun el autor.
- GPU recomendadas: cualquier GPU con al menos 6 GB de VRAM para inferencia en fp16 (RTX 3060, RTX 4060, RTX 4090, A100, H100). Para entrenamiento, A100 o superior segun la medicion.
- Cabe en GPU de consumo: si, en modelos con 6 GB o mas para inferencia; el entrenamiento documentado se realizo en A100.
- Opciones de despliegue: diffusers con `StableDiffusionPipeline` y `load_lora_weights` (flujo oficial del autor). Otros runners compatibles con LoRA de SD1.5 (por ejemplo, implementaciones basadas en safetensors) no estan documentados en la informacion disponible.
- Latencia y throughput: no disponibles; solo se publica el tiempo de bucle de entrenamiento (488,248 segundos para 1.500 actualizaciones).

## Comparativa con modelos similares

| Modelo | Parametros entrenables | Base | Contexto / resolucion | KID | CLIP score | Licencia | Disponibilidad |
|---|---|---:|---|---:|---:|---|---|
| data266-pokemon-lora-r4 | 797.184 | SD1.5 | 512 px | 0,042548 | 31,9753 | No comercial, solo investigacion | Hugging Face |
| data266-pokemon-lora-r16 | no disponible | SD1.5 | 512 px | 0,038084 | 32,2778 | No comercial, solo investigacion | Hugging Face |
| Base SD1.5 | n/a (modelo completo) | n/a | 512 px | 0,064831 | 33,2198 | CreativeML OpenRAIL-M | Hugging Face |

No se dispone de datos de otros adaptadores Pokemon comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Licencia estrictamente no comercial: uso educativo y de investigacion unicamente, sujeto a los terminos upstream y a los derechos de personaje. El autor no reclama derechos sobre los assets de Pokemon ni una licencia comercial consolidada.
- Sesgo de dominio: el dataset contiene mayoritariamente criaturas cartoon aisladas, lo que limita la generalizacion de composicion y fondos.
- Fallos de composicion documentados: recuentos, relaciones izquierda-derecha y atributos de objetos pueden fallar.
- Captions BLIP potencialmente erroneas, lo que introduce ruido en la alineacion texto-imagen.
- Riesgo de memorizacion no descartado: la comparacion CLIP con las 749 imagenes de entrenamiento muestra similitudes de color y estilo, aunque no prueba reproduccion exacta.
- Alucinacion visual: el modelo puede generar morfologias o combinaciones inexistentes; no debe usarse para contenido enganoso ni en aplicaciones criticas de seguridad.
- Perdida de diversidad y alineacion frente a la base (LPIPS y CLIP inferiores), con una salida marcada por el safety checker en la evaluacion del rank 4.
- Deteccion de near-duplicates imperfecta en el split, con posible fuga leve entre train y test.
- Estudio humano ciego pendiente: la seleccion final entre r4 y r16 no esta cerrada.
- Solo prompts en ingles; no se documenta soporte multilingue.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dhruv1672/data266-pokemon-lora-r4
- Adaptador alternativo rank 16: https://huggingface.co/dhruv1672/data266-pokemon-lora-r16
- Imagenes y metadatos de evaluacion (120 imagenes): https://huggingface.co/datasets/dhruv1672/data266-pokemon-generations
- Modelo base SD1.5: https://huggingface.co/stable-diffusion-v1-5/stable-diffusion-v1-5
- Dataset de entrenamiento: https://huggingface.co/datasets/reach-vb/pokemon-blip-captions
- Licencia del adaptador: LICENSE.md en el repositorio del modelo
