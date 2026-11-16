# axonlabsai/axon-image-2-flash

## Resumen

Axon Image 2 Flash es una pila de generación y edición de imágenes publicada por axonlabsai que no redistribuye pesos base, sino que empaqueta adaptadores entrenados, un motor de servicio y la configuración que los vincula a modelos públicos. Se apoya en tres backbones: FLUX.2-klein de 4B para el nivel `flash`, y Qwen-Image de 20B (con destilación de 8 pasos) para los niveles `hq` y `pro`. El repositorio ocupa 0,7 GB e incluye los LoRA propios y el código del servidor, no los pesos de los backbones.

La propuesta central es una "escalera de calidad": un borrador rápido de 4 pasos y guiado 1.0 para iterar, y un modelo de 20B compactado a 4 bits mediante SVDQuant para resultados finales. El modelo está orientado a texto legible en la imagen (con bloqueo y verificación de cadenas), consistencia de sujeto entre llamadas y encuadres de UI, motion graphics y videojuegos, más que a fotorrealismo de frontera.

Es relevante ahora porque demuestra un patrón de despliegue práctico: adaptadores Apache-2.0 sobre backbones Apache-2.0, cuantización de 4 bits con la rama de bajo rango en 16 bits, y una API compatible con OpenAI que permite probar el contrato HTTP sin GPU mediante un motor stub.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Flow matching sobre backbones transformer de difusion (FLUX.2-klein 4B y Qwen-Image 20B); adaptadores LoRA y destilacion de pasos |
| Parametros totales | No disponible para el conjunto; backbones de 4B (flash) y 20B (hq/pro) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (modelo de imagen; no se documenta ventana de texto) |
| Tipos de cuantizacion | bf16/fp16, W8 (~21 GB en hq), W4 con SVDQuant (`svdq-int4` / `svdq-fp4`, rank 32 y 128) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 (codigo y adaptadores); backbones Apache-2.0 no redistribuidos |
| Formato de pesos | safetensors (adaptadores); pesos base resueltos desde sus publicadores |

## Arquitectura y entrenamiento

La pila combina dos familias de difusion con flow matching. El nivel `flash` usa FLUX.2-klein de 4B con 4 pasos y guiado 1.0, pensado para caber en cualquier tarjeta de 16 GB e incluso en una T4 gratuita. Los niveles `hq` y `pro` usan el denoiser de Qwen-Image de 20B: `hq` aplica una destilación de 8 pasos (adaptadores de LightX2V) y `pro` mantiene 30 pasos con guiado 4.0 sobre el mismo backbone cuantizado a 4 bits.

La innovación técnica destacable es la compactación sin poda: en `pro` el residual se cuantiza a 4 bits y la rama de bajo rango se mantiene en 16 bits (SVDQuant), usando los checkpoints publicados `nunchaku-ai/nunchaku-qwen-image` en variantes `svdq-int4` y `svdq-fp4`. Los adaptadores propios (`games-v1`, `games2-v1`) se entrenaron sobre corpus internos para estilos de gameplay en 20 y 15 títulos respectivamente. No se documentan el número de tokens, la composición del dataset ni si hubo RLHF o DPO.

## Capacidades

- Generación texto-a-imagen con escalera de calidad (`flash`, `hq`, `pro`) y control de pasos y guiado.
- Edición de imagen con hasta 4 imágenes de referencia en `/v1/images/edits`.
- Texto legible con bloqueo: el motor renderiza, relee el resultado, lo puntúa y reintenta; si ningún candidato se lee correctamente, compone el literal como tipografía real en una barra de rótulo. Cada respuesta reporta `verified`, `composited` o `unverified`.
- Consistencia de sujeto: un nombre `subject` deriva la semilla de forma determinista, reutilizando el mismo personaje entre llamadas sin estado en servidor.
- Encuadres de UI, motion graphics y videojuegos: dashboards, pantallas de app, landing pages, lower thirds, title cards, HUD, pantallas de inventario y aspecto de gameplay por título.
- Adaptadores LoRA de estilo de juego cargables con `pipe.load_lora_weights`.
- API compatible con OpenAI (`/v1/images/generations`, `/v1/images/edits`, `/v1/images/file/{name}`, `/v1/models`, `/healthz`).
- Parámetros de generación: `prompt`, `size`, `n`, `quality`, `seed`, `negative_prompt`, `refine`, `subject`, `text_lock`, `response_format`.

## Casos de uso

- Iteración rápida de conceptos visuales: usar `flash` con 4 pasos y guiado 1.0 para generar borradores en una T4 o cualquier GPU de 16 GB, y escalar a `hq` o `pro` solo para los candidatos seleccionados.
- Maquetas de interfaz y dashboards: el bloqueo de texto (`text_lock`) permite fijar títulos como "NORTH ARC" y verificar que se lean correctamente, útil para pantallas de app y landing pages.
- Contenido para videojuegos: los adaptadores `games-v1` y `games2-v1` reproducen el aspecto de gameplay de títulos concretos, aplicables a HUD, inventarios y pantallas de carga.
- Consistencia de personaje en series: el parámetro `subject` deriva la semilla de forma determinista, de modo que llamadas repetidas reutilizan el mismo personaje sin almacenar estado en el servidor.
- Edición con referencias: `/v1/images/edits` acepta hasta 4 imágenes de referencia, adecuado para retocar composiciones existentes o mantener estilo entre variantes.
- Motion graphics y rótulos broadcast: lower thirds y title cards con texto compuesto como tipografía real cuando la verificación falla, evitando erratas en producción.
- Despliegue serverless: `scripts/deploy_modal.sh` levanta el nivel `flash`, y `--pro` el 20B en W4 sobre una L4 de 24 GB; `scripts/bench_api.py` mide el despliegue y `scripts/stub_api.py` valida el contrato HTTP sin GPU.
- Pruebas de integración en CI: el motor stub permite ejercitar la API compatible con OpenAI en pipelines sin hardware gráfico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

Los únicos datos de rendimiento documentados son de recursos y pasos: `flash` ~8 GB fp16 en 4 pasos; `hq` ~41 GB bf16 o ~21 GB W8 en 8 pasos; `pro` ~11 GB en W4 y 30 pasos.

## Requisitos de hardware

- `flash`: ~8 GB en fp16; cabe en cualquier tarjeta de 16 GB y en una T4 gratuita.
- `hq`: ~41 GB en bf16 o ~21 GB en W8; requiere GPU de 24-48 GB.
- `pro`: ~11 GB en W4; encaja en una L4 de 24 GB.
- GPU recomendadas: T4 (flash), L4 de 24 GB (pro), GPU de 24-48 GB para hq (por ejemplo A100 o H100 según el nivel).
- Cabe en GPU de consumo: sí para `flash` en tarjetas de 16 GB; `pro` en W4 podría caber en GPUs de consumo de 24 GB, aunque el autor cita la L4 como referencia.
- Opciones de despliegue: servidor propio con la API compatible con OpenAI incluida, despliegue serverless en Modal (`scripts/deploy_modal.sh`, `--pro`), y carga de adaptadores con `diffusers`.
- Latencia y throughput: no disponibles; el autor proporciona `scripts/bench_api.py` para medirlos por despliegue.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Axon Image 2 Flash | 4B (flash) / 20B (hq, pro) | No disponible | Generacion y edicion con escalera de calidad y verificacion de texto | Apache-2.0 (adaptadores y codigo) | Hugging Face, pesos base no incluidos |
| Qwen-Image 2512 | 20B | No disponible | Texto-a-imagen de proposito general | Apache-2.0 | Pesos publicos en Qwen |
| FLUX.2-klein base 4B | 4B | No disponible | Texto-a-imagen compacto | Apache-2.0 | Pesos publicos en black-forest-labs |
| Qwen-Image-Edit 2511 | No disponible | No disponible | Edicion de imagen | Apache-2.0 | Pesos publicos en Qwen |

## Limitaciones y advertencias

- No es un modelo fotorrealista de frontera: el texto pequeño en maquetas densas puede leerse mal y el detalle fino está acotado por los backbones.
- El repositorio no incluye los pesos base; hay que resolverlos desde sus publicadores, lo que añade pasos de despliegue y dependencia de terceros.
- Los adaptadores de destilación (LightX2V) y los checkpoints W4 (Nunchaku) son de terceros y sus condiciones deben revisarse por separado, aunque se citan como Apache-2.0.
- La licencia Apache-2.0 cubre código y adaptadores propios; el uso comercial de los backbones queda sujeto a su propia licencia.
- No se documentan sesgos conocidos, idiomas soportados ni tasas de alucinación visual.
- El estado de verificación de texto (`verified`, `composited`, `unverified`) debe comprobarse en el cliente: una respuesta `unverified` indica que el literal no se leyó correctamente.
- El repositorio muestra 0 descargas y 0 likes en el momento de la consulta, sin benchmarks publicados; conviene validar calidad y latencia con `scripts/bench_api.py` antes de producción.
- La consistencia de sujeto depende de la derivación determinista de la semilla; no se garantiza identidad exacta entre llamadas.

## Enlaces

- Hugging Face: https://huggingface.co/axonlabsai/axon-image-2-flash
- Backbone FLUX.2-klein base 4B: https://huggingface.co/black-forest-labs/FLUX.2-klein-base-4B
- Backbone Qwen-Image 2512: https://huggingface.co/Qwen/Qwen-Image-2512
- Backbone Qwen-Image-Edit 2511: https://huggingface.co/Qwen/Qwen-Image-Edit-2511
- Checkpoints W4 SVDQuant: https://huggingface.co/nunchaku-ai/nunchaku-qwen-image
