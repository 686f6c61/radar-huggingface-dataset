# DeVilDoNia/HaDeS-MOSS-v0.9.4-Turbo

## Resumen

HaDeS-MOSS-v0.9.4-Turbo es un checkpoint de difusion texto-a-imagen de un solo archivo, publicado por el usuario DeVilDoNia (autor "HaDeS"), pensado para su uso directo en ComfyUI. Se construye a partir de OpenMOSS-Team/MOSS-Image-Base (no de la variante SFT) y lleva integrados tres LoRA en los pesos de difusion: un LoRA de dataset expandido, un LoRA de color y detalle, y un LoRA Turbo de ocho pasos. El resultado es un unico fichero safetensors en BF16 de 10,16 GB (9,47 GiB) que genera imagenes en ocho pasos de muestreo sin necesidad de cargar LoRA adicionales.

El modelo resuelve el problema de distribucion de un pipeline completo de generacion de imagen: en lugar de encadenar un checkpoint base con varios adaptadores LoRA y ajustar sus intensidades, el autor ha horneado la receta en los pesos finales. Esto simplifica el despliegue en ComfyUI, donde basta con seleccionar el fichero en un loader compatible con MOSS, cargar el text encoder y el VAE companeros, y ejecutar el KSampler con los ajustes de referencia (1152 x 1536, 8 pasos, CFG 1,0, Euler/simple, flow shift 5).

La relevancia actual del modelo es acotada pero concreta: es una variante de la familia MOSS-Image orientada a inferencia rapida en ocho pasos y a un acabado cromatico y de detalle distinto al de MOSS-Image-SFT. El autor advierte explicitamente de que las comparaciones incluidas no demuestran superioridad general, sino una eleccion de renderizado alternativa. El repositorio tiene cero descargas y cero likes en el momento de la consulta, y el modelo se publico el 11 de noviembre de 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusion MOSS-Image (cabecera safetensors identifica arquitectura MOSS-Image y 42 capas) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo texto-a-imagen; no aplica ventana de contexto de texto) |
| Tipos de cuantizacion | BF16 en el fichero publicado; no se documentan otras cuantizaciones |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, single-file para ComfyUI (diffusion-single-file) |
| Tamano del fichero | 10,16 GB (9,47 GiB) en BF16 |
| SHA-256 | 32c215fc08ee8ec0e55459507e0712936adccf5804e94b6a7264bc33efd68770 |
| Modelo base | OpenMOSS-Team/MOSS-Image-Base |
| Pipeline | text-to-image |
| Resolucion de referencia | 1152 x 1536 |
| Pasos de muestreo | 8 |
| CFG de referencia | 1,0 |
| Sampler / scheduler | Euler / simple |
| Flow shift | 5 |
| Denoise | 1,0 |
| Skip-layer guidance | Off |
| Componentes externos requeridos | Text encoder qwen3.5_9b_int8_convrot.safetensors y VAE flux2-vae.safetensors (Comfy-Org/MOSS-Image) |

## Arquitectura y entrenamiento

El modelo es un checkpoint de difusion de la familia MOSS-Image, con 42 capas segun la cabecera del fichero safetensors. No se trata de un transformer autoregresivo ni de un modelo MoE, sino de un modelo de difusion para generacion de imagen condicionada por texto. El autor no documenta el numero de parametros totales ni el volumen de datos de entrenamiento del modelo base; esa informacion corresponde a OpenMOSS-Team/MOSS-Image-Base y no se incluye en la model card de esta variante.

La construccion de esta variante sigue un flujo de trabajo guardado por el autor: MOSS-Image-Base en BF16, aplicacion secuencial de tres LoRA mediante un Multi-LoRA, y guardado con un Model Saver. Los LoRA y sus intensidades son: data_expanded.safetensors a 0,30 (LoRA de dataset expandido, descrito por el autor como entrenado con MOSS-Image-SFT y aplicado aqui sobre Base); HaDeS_MOSS_color_detailer_v0.2.safetensors a 0,60 (LoRA fusionado de color y detalle, combinado internamente a partir de HaDeS_test_colour_v01.safetensors y moss_context_detaile_tweaker_20261018_rank2.safetensors con pesos internos 0,6 y 0,75); y HaDeS-MOSS-BeTa-Turbo-8steps-v0.9.safetensors a 1,00 (LoRA Turbo del autor, no publicado por separado, con cabecera que indica "steps: 4" aunque el checkpoint se evaluo a ocho pasos). El guardado se hizo en BF16 con redondeo al mas cercano.

Una innovacion practica destacable es la integracion del LoRA Turbo en los pesos: el flujo de ComfyUI no necesita conectar la entrada turbo del KSampler, lo que reduce la configuracion y el riesgo de error. El autor advierte de que la cabecera del safetensors no incorpora la receta, por lo que la reproducibilidad bit a bit no esta garantizada entre versiones de software o ficheros fuente distintos. No se documenta uso de RLHF, DPO ni tecnicas de decodificacion especulativa, propias de modelos de lenguaje y no aplicables aqui.

## Capacidades

- Generacion de imagenes a partir de prompts de texto en ocho pasos de muestreo, con resolucion de referencia 1152 x 1536.
- Renderizado con una eleccion cromatica y de detalle distinta a la de MOSS-Image-SFT, segun el autor, sin que ello implique superioridad general.
- Ejecucion en ComfyUI mediante un loader compatible con MOSS (el autor uso el MOSS Loader de HaDeS MOSS Suite).
- No requiere cargar LoRA Turbo ni otros adaptadores por separado: los pesos Turbo estan integrados.
- Compatibilidad con el text encoder qwen3.5_9b_int8_convrot y el VAE flux2-vae de Comfy-Org/MOSS-Image.
- Soporte de ajuste de CFG: a CFG 2 y ocho pasos se observo mayor saturacion, mas pixeles casi recortados, imagenes mas oscuras y un tiempo de ejecucion aproximadamente 1,8 veces mayor en la sesion medida.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, vision de entrada, audio ni modo thinking; son capacidades ajenas a un modelo texto-a-imagen.
- Capacidades multilingues: no disponibles.

## Casos de uso

- Generacion de ilustraciones para articulos y blogs: el modelo produce imagenes a 1152 x 1536 en ocho pasos con CFG 1,0, adecuado para un flujo de publicacion rapido en ComfyUI donde prima el tiempo de iteracion sobre el ajuste fino estetico.
- Prototipado visual de conceptos: con prompts descriptivos y semillas fijas se pueden generar variantes de una misma escena (el autor documenta ejemplos de relojero, alpinista, florista, callejon lluvioso, bodegon de citricos y observatorio lunar) para explorar direcciones artisticas antes de un render final.
- Creacion de material para redes sociales en formato vertical: la relacion 3:4 de la resolucion de referencia (1152 x 1536) encaja en publicaciones verticales sin recorte adicional.
- Pruebas de pipelines de difusion en ComfyUI: al ser un unico fichero sin LoRA externos, sirve para validar la integracion del loader MOSS, el text encoder qwen3.5_9b_int8_convrot y el VAE flux2-vae antes de pasar a configuraciones mas complejas.
- Generacion de fondos y escenarios para composicion posterior: escenas como el callejon lluvioso o el observatorio lunar pueden usarse como capa de fondo en montajes, dado el nivel de detalle del LoRA de color y detalle integrado.
- Experimentacion con ajustes de muestreo: el modelo permite comparar CFG 1 frente a CFG 2 y distintos numeros de pasos; el autor documenta que subir pasos cambia las composiciones sin ser una mejora consistente de calidad, lo que lo hace util para estudios controlados de parametros.
- Evaluacion comparativa de checkpoints: sirve como brazo de comparacion frente a MOSS-Image-SFT con Turbo v0.7 o Turbo v0.9 privado, usando prompts, semillas y ajustes identicos por pareja de imagenes.

## Benchmarks y rendimiento

La model card no incluye metricas estandar de benchmarks de generacion de imagen (FID, CLIP score, etc.). El autor publica una evaluacion comparativa por pares con prompts, semillas y ajustes identicos dentro de cada par (1152 x 1536, 8 pasos, CFG 1, Euler/simple, flow shift 5, mismo text encoder y VAE):

| Comparacion | Imagenes | Preferencias para v0.9.4 |
|---|---:|---|
| Frente a SFT + Turbo v0.9 privado, ocho prompts nuevos fijados antes del render | 8 pares | Autor 5/8; revision GPT separada 5/8; Gemini 5/8; asistente de auditoria 0/8 |
| Frente a SFT + Turbo v0.7 publicado, mismos ocho prompts y semillas | 8 pares | Autor 6/8; revision GPT separada 5/8; Gemini 5/8; asistente de auditoria 1/8 |

El autor senala que la segunda comparacion reutilizo imagenes familiares de la primera y que las pruebas no aisan la contribucion de cada LoRA horneado. No se han publicado resultados de benchmarks estandar en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el fichero de difusion en BF16 ocupa 10,16 GB (9,47 GiB); a ello hay que sumar el text encoder qwen3.5_9b_int8_convrot y el VAE flux2-vae, por lo que el consumo total supera el del solo checkpoint. No se documenta una cifra total de VRAM medida.
- GPU recomendadas: no disponibles en la informacion proporcionada. Por el tamano del fichero, se requiere una GPU con al menos 16 GB de VRAM para el checkpoint en BF16, y mas para el pipeline completo; no se confirma ninguna GPU concreta.
- Cabe en GPU de consumo: no confirmado. El peso del checkpoint (mas de 10 GB) deja poco margen en tarjetas de 12 GB y exige al menos 16 GB para el solo modelo de difusion.
- Opciones de despliegue: ComfyUI con un loader compatible con MOSS (el autor uso el MOSS Loader de HaDeS MOSS Suite, probado en ComfyUI 0.43.0). No se documentan vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo de difusion de imagen.
- Latencia y throughput: no disponibles como cifra absoluta. El autor indica que subir CFG de 1 a 2 a ocho pasos multiplico por aproximadamente 1,8 el tiempo de ejecucion en su sesion de medida.

## Comparativa con modelos similares

| Modelo | Base | Pasos | Formato | Licencia | Notas |
|---|---|---:|---|---|---|
| HaDeS-MOSS-v0.9.4-Turbo | MOSS-Image-Base | 8 | safetensors BF16 single-file | Apache 2.0 | Tres LoRA horneados; sin LoRA externos |
| MOSS-Image-SFT + Turbo v0.7 | MOSS-Image-SFT | no disponible | checkpoint + LoRA | no disponible | Brazo de comparacion del autor; 6/8 preferencias para v0.9.4 segun el autor |
| MOSS-Image-SFT + Turbo v0.9 privado | MOSS-Image-SFT | no disponible | checkpoint + LoRA privado | no disponible | Brazo de comparacion; 5/8 preferencias para v0.9.4 segun el autor |
| OpenMOSS-Team/MOSS-Image-Base | - | no disponible | no disponible | no disponible | Modelo base del que parte esta variante |

No se dispone de datos de parametros, contexto ni rendimiento estandar de los modelos comparables en la informacion proporcionada.

## Limitaciones y advertencias

- El autor advierte de que las comparaciones incluidas no demuestran que el modelo sea mejor para todos los prompts; es una eleccion de renderizado alternativa a MOSS-Image-SFT.
- Las pruebas por pares no aislan la contribucion de cada LoRA horneado, por lo que no puede atribuirse el resultado a un componente concreto.
- La cabecera del safetensors no incorpora la receta de construccion; no se garantiza reproducir un fichero bit a bit desde otras versiones de software o ficheros fuente.
- El LoRA Turbo integrado declara "steps: 4" en su cabecera, pero el checkpoint se evaluo a ocho pasos de inferencia; el comportamiento a cuatro pasos no esta documentado.
- Subir CFG de 1 a 2 aumento la saturacion, los pixeles casi recortados y el oscurecimiento en las ocho imagenes medidas, y multiplico por aproximadamente 1,8 el tiempo; CFG 1 es un punto de partida reproducible, no un optimo estetico universal.
- Aumentar el numero de pasos cambio las composiciones sin ser una mejora consistente de calidad.
- Solo se probo la resolucion 1152 x 1536; otras resoluciones pueden funcionar pero no se compararon.
- El modelo es solo el fichero de difusion: no incluye text encoder ni VAE, que deben descargarse por separado.
- No se documentan sesgos, tasas de alucinacion ni limitaciones de idioma; al ser un modelo texto-a-imagen, el riesgo principal es la generacion de contenido no deseado o inexacto respecto al prompt, no evaluado en la informacion disponible.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantias sobre el comportamiento en produccion ni sobre los derechos de las imagenes generadas.
- Repositorio con cero descargas y cero likes en el momento de la consulta; no hay validacion externa de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DeVilDoNia/HaDeS-MOSS-v0.9.4-Turbo
- Modelo base: https://huggingface.co/OpenMOSS-Team/MOSS-Image-Base
- Turbo v0.7 publicado: https://huggingface.co/DeVilDoNia/HaDeS-MOSS-Turbo
- Componentes companeros (text encoder y VAE): https://huggingface.co/Comfy-Org/MOSS-Image
- Repositorio HaDeS MOSS Suite: https://github.com/Devildonia/HaDeS-MOSS-Suite
- Registro de mediciones: https://github.com/Devildonia/HaDeS-MOSS-Suite/blob/main/tools/RESULTS.md
- Paper referenciado en los tags (arXiv:2610.23374): https://arxiv.org/abs/2610.23374
