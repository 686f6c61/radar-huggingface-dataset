# kefallrain/comfyui-moss-accel

## Resumen

`kefallrain/comfyui-moss-accel` no es un modelo de IA en sentido estricto, sino un nodo personalizado de ComfyUI y un par de grafos de trabajo (workflow) orientados a acelerar la generacion de imagenes con el modelo de difusion MOSS-Image. Lo desarrolla el usuario kefallrain (con codigo fuente alojado en el repositorio de GitHub `lepetitprince716-prog/comfyui-moss-accel`) y se publica bajo licencia Apache 2.0. El repositorio de Hugging Face tiene un tamano de 0.0 GB, lo que confirma que no contiene pesos de modelo, solo configuracion, grafos JSON y material grafico de documentacion.

El problema que resuelve es el coste computacional del muestreo en MOSS-Image: en lugar de aplicar tecnicas genericas de cache de caracteristicas sobre una trayectoria estocastica `er_sde`, el workflow combina reutilizacion de la guia en espacio `x0` (imagen denoised) y extrapolacion lineal de `sigma` en una primera pasada (`fast`), junto con una cola positiva consciente de la densidad del schedule en una segunda pasada de refinado (`refine`). El resultado reportado por el autor es una reduccion del tiempo medio de generacion de 16.20 s a 10.58 s (un +53.1 % de throughput) en una RTX 5080, con una nitidez relativa de 0.985x respecto al baseline sin acelerar.

Es relevante ahora porque la aceleracion de modelos de difusion de imagen de alta resolucion (1024x1024 con refinado a 1456x1456) es un cuello de botella practico en pipelines de ComfyUI, y esta propuesta evita dependencias externas y mantiene la compatibilidad con LoRAs de estilo (pintura y cel shading). No obstante, la informacion disponible es muy limitada: cero descargas, cero likes y ausencia de datos sobre arquitectura, parametros o contexto, ya que no es un modelo de lenguaje.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (nodo y workflow para ComfyUI, no un modelo) |
| Parametros totales | no disponible (no aplica; repo de 0.0 GB sin pesos) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (no aplica) |
| Tipos de cuantizacion | no disponible como modelo; el workflow se calibra sobre MOSS-Image `int8` ConvRot |
| Idiomas soportados | no disponible (documentacion en ingles y chino simplificado) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (no contiene pesos; incluye grafos JSON de ComfyUI) |

## Arquitectura y entrenamiento

No se trata de un modelo entrenado, sino de un nodo de ComfyUI (`MOSS-Image Accelerate`) y dos grafos de trabajo: `workflows/moss_accel_two_pass.json` (grafo de UI con previews por etapa y comparacion A/B con misma semilla) y `workflows/moss_accel_two_pass.api.json` (version API del mismo grafo). El nodo se describe como de cero dependencias y actua sobre el proceso de muestreo de MOSS-Image, no sobre los pesos del modelo de difusion.

La innovacion tecnica consiste en dos pasadas. La pasada 1 (`fast`) aplica reutilizacion de guia en espacio `x0` denoised y extrapolacion lineal de `sigma` sobre 25 pasos a 1024x1024. La pasada 2 (`refine`) hace un upscale Lanczos a 1456x1456 con 7 pasos y `denoise 0.35`, usando una cola positiva consciente de la densidad del schedule. El nodo se desactiva automaticamente en `CFG 1` (LoRAs destiladas), con menos de 6 pasos, con menos de 12 pasos equivalentes, en modelos que no sean flow-matching y en samplers de segundo orden (`heun`, `dpm_2`). No se indica que haya habido entrenamiento, RLHF ni dataset alguno.

## Capacidades

- Aceleracion del muestreo de MOSS-Image en ComfyUI mediante un nodo sin dependencias externas.
- Workflow de dos pasadas: base de 25 pasos a 1024x1024 y refinado de 7 pasos a 1456x1456 con `denoise 0.35`.
- Preservacion de LoRAs de estilo (pintura y cel shading de los 90) a 2x de zoom, segun el autor.
- Comparacion A/B integrada con misma semilla y control sin acelerar (`A`/`A2`), con ruido de temporizacion del 0.1 %.
- Desactivacion automatica en configuraciones no compatibles (CFG 1, pocos pasos, samplers de segundo orden, modelos no flow-matching).
- No incluye capacidades de texto, codigo, vision, tool calling ni agentes; no es un modelo de lenguaje.

## Casos de uso

- Aceleracion de iteracion creativa en ComfyUI: un artista que prueba variaciones de prompt sobre MOSS-Image puede reducir el tiempo medio por imagen de 16.20 s a 10.58 s con el preset por defecto, manteniendo una nitidez del 0.985x.
- Produccion de ilustracion a 1456x1456: el workflow encadena base a 1024x1024 y refinado Lanczos con 7 pasos, adecuado para entregables de pintura digital o cel shading con LoRAs de estilo.
- Prototipado rapido con LoRAs de estilo: el autor reporta que las LoRAs de acuarela y cel shading no se diluyen a 2x de zoom, lo que permite evaluar estilos sin perder trazo.
- Comparacion controlada de tecnicas de aceleracion: el grafo incluye un A/B con misma semilla (`25 + 9` pasos) que sirve para medir deriva visual (RGB rel-L2) frente al baseline.
- Integracion en pipelines automatizados de ComfyUI via la version API del grafo (`moss_accel_two_pass.api.json`), para generacion por lotes con control de tiempos.
- Generacion con requisitos estrictos de reproducibilidad: poniendo `preset` en `off` se recupera el baseline bit a bit, util para auditar resultados o depurar diferencias.

## Benchmarks y rendimiento

Datos reportados por el autor en una RTX 5080, ComfyUI 0.46.0, MOSS-Image `int8` ConvRot, `er_sde`/`simple`, CFG 2.5, shift 5, 14 prompts y controles intercalados sin acelerar con ruido de temporizacion del 0.1 %.

| Configuracion (1024² → 1456²) | Pasos | Tiempo mediano | Aceleracion | RGB rel-L2 | Nitidez | Notas |
|---|---|---|---|---|---|---|
| Baseline (`A` / `A2`) | 25 + 9 | 16.20 s | 0 % | 0.0000 | 1.000 | Identico bit a bit entre `A` y `A2` |
| `fast` + `refine` (por defecto) | 25 + 7 | 10.58 s | +53.1 % | 0.0645 | 0.985 | Sin dependencias extra |
| `fast` + `refine` | 25 + 9 | 11.36 s | +42.7 % | 0.0615 | 1.004 | Reproducido en 3 ejecuciones (42.6 / 42.5 / 42.7 %) |
| `fast` + `refine` | 25 + 6 | 10.18 s | +59.2 % | 0.0675 | 0.970 | Ligero suavizado en tejidos de punto finos |
| Spectrum M1 + `refine` | 25 + 9 | 10.64 s | +52.5 % | 0.0858 | 0.952 | Mas suave; intercambia objetos pequenos de fondo |
| EasyCache 0.2 x 2 | 25 + 9 | ~11.9 s | +36.0 % | 0.0520 | 0.954 (base) | Embora el rostro del retrato en `p0` |
| LoRA DMD comunitaria de 8 pasos (`CFG 1`, `euler`) | 8 + 3 | 3.27 s | +395 % | 0.5772 | 0.523 | Reescribe la composicion; suaviza LoRAs de estilo (0.45-0.47x) |

No se han publicado resultados de benchmarks de modelos de lenguaje (MMLU, HumanEval, GSM8K) en la informacion disponible, ya que no aplica.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; el autor calibra sobre MOSS-Image `int8` ConvRot, por lo que la VRAM depende del modelo base MOSS-Image y no del nodo.
- GPU de referencia en las pruebas: NVIDIA RTX 5080 (consumer), con ComfyUI 0.46.0.
- Cabe en GPU consumer: si, al menos en RTX 5080 segun las mediciones del autor.
- Opciones de despliegue: ComfyUI (grafos `moss_accel_two_pass.json` y `moss_accel_two_pass.api.json`); el nodo es de cero dependencias.
- Latencia y throughput: 10.58 s de mediana por imagen con el preset por defecto (25 + 7 pasos) frente a 16.20 s del baseline (25 + 9 pasos), es decir, +53.1 % de throughput.
- No se proporcionan datos de VRAM, GPUs A100/H100 ni latencias en otros entornos.

## Comparativa con modelos similares

| Propuesta | Tipo | Aceleracion reportada | Deriva visual (RGB rel-L2) | Nitidez | Dependencias | Licencia |
|---|---|---|---|---|---|---|
| `kefallrain/comfyui-moss-accel` (fast + refine) | Nodo + workflow ComfyUI | +53.1 % (25 + 7) | 0.0645 | 0.985 | Cero | Apache 2.0 |
| Spectrum M1 + refine | Tecnica de aceleracion | +52.5 % (25 + 9) | 0.0858 | 0.952 | no disponible | no disponible |
| EasyCache 0.2 x 2 | Cache de caracteristicas | +36.0 % (25 + 9) | 0.0520 | 0.954 (base) | no disponible | no disponible |
| LoRA DMD comunitaria de 8 pasos | LoRA destilada | +395 % (8 + 3) | 0.5772 | 0.523 | no disponible | no disponible |

No se dispone de informacion sobre otros nodos o workflows comparables fuera de los incluidos en la propia model card.

## Limitaciones y advertencias

- No es un modelo: el repositorio no contiene pesos (0.0 GB) ni pipeline declarado; es un nodo y un workflow para ComfyUI.
- No es identico pixel a pixel: con la misma semilla los detalles menores cambian (RGB rel-L2 aproximado de 0.065: broches del abrigo, pendientes, ligera inclinacion de cabeza). Para reproducir el baseline exacto hay que poner `preset` en `off`.
- El prompt negativo pierde fuerza en la parte final: los pasos `C` reutilizan guia temprana y los pasos `N` omiten las pasadas negativas tras el calentamiento, por lo que los terminos negativos dirigidos a detalles finos tardios pesan menos.
- El refinado solo es valido con denoise parcial: usar pasos `N` en una primera pasada con denoise completo cambia el sujeto (celda 12 de la figura de referencia).
- Desactivacion automatica en `CFG 1` (LoRAs destiladas), menos de 6 pasos, menos de 12 pasos equivalentes, modelos no flow-matching y samplers de segundo orden (`heun`, `dpm_2`).
- Calibrado sobre MOSS-Image `int8` ConvRot + `er_sde`; no incluye comprobacion de `NaN`.
- Cero descargas y cero likes en Hugging Face en el momento de la consulta, lo que limita la validacion independiente de los resultados.
- Licencia Apache 2.0 permite uso comercial del nodo y los grafos, pero el uso comercial de MOSS-Image y de las LoRAs de terceros depende de sus respectivas licencias, no disponibles aqui.

## Enlaces

- Hugging Face: https://huggingface.co/kefallrain/comfyui-moss-accel
- GitHub del nodo y tests: https://github.com/lepetitprince716-prog/comfyui-moss-accel
- Workflow de UI: `workflows/moss_accel_two_pass.json` (dentro del repo)
- Workflow API: `workflows/moss_accel_two_pass.api.json` (dentro del repo)
- Paper, blog o demo adicionales: no disponible
