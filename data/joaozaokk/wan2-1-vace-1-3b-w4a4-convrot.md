# JoaoZaokk/Wan2.1-VACE-1.3B-W4A4-ConvRot

## Resumen

Wan2.1-VACE-1.3B-W4A4-ConvRot es una versión cuantizada del modelo de generación y edición de video Wan2.1-VACE-1.3B, desarrollada por JoaoZaokk. El modelo base, creado por Wan-AI, es un Diffusion Transformer (DiT) de 1.300 millones de parámetros que unifica tareas de creación y edición de video mediante condicionamiento VACE (Video All-in-one Creation and Editing). Esta variante cuantizada explora formatos de cuantización mixta W4A4 y W4A8 con rotación de pesos (ConvRot), y se distribuye en tres archivos distintos con niveles de error muy diferentes, documentados de forma explícita por el autor.

La relevancia de este modelo no reside solo en su tamaño reducido, sino en que sirve como caso de estudio empírico sobre los umbrales de tolerancia al error de cuantización. El autor demuestra que el umbral de error aceptable no es una propiedad del formato de cuantización, sino que depende de cada modelo concreto, y que un error mediano por capa de 0,1602 destruye por completo la generación de video en este modelo, mientras que 0,0546 produce resultados visualmente correctos. Además, documenta un problema crítico de integración en ComfyUI: si se usa el modelo sin un nodo de control VACE, el valor por defecto de `vace_strength` (1.0) inyecta un control constante que destruye la salida, incluso en el modelo FP16 original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Transformer (DiT) con VAE de video |
| Parametros totales | 1.300 millones (modelo base) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (generacion de video por difusion) |
| Tipos de cuantizacion | int4 (W4A4) e int8 (W4A8) en formato ConvRot, con mezclas por capa |
| Idiomas soportados | ingles, chino |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (diffusion-single-file) |

## Arquitectura y entrenamiento

El modelo base Wan2.1-VACE-1.3B emplea una arquitectura DiT con un VAE de video propio, disenada para tareas unificadas de generacion y edicion de video. El condicionamiento VACE permite controlar la generacion mediante mascaras, imagenes de referencia, mapas de profundidad, bocetos y otros tipos de control visual. El modelo fue entrenado por Wan-AI con datos de video e imagen, y su informe tecnico esta disponible publicamente.

La version cuantizada de JoaoZaokk aplica cuantizacion por capas con dos formatos: `convrot_w4a4` (pesos y activaciones en int4 con rotacion de pesos) y `asym_w4a8_int8` (pesos en int4, activaciones en int8 asimetrico). El autor distribuye tres archivos con distintas proporciones de capas en cada formato, y documenta el error efectivo mediano por capa medido sobre activaciones reales durante el muestreo. El archivo recomendado (`misto005`) usa solo 2 capas en 4-bit y 298 en 8-bit, logrando un error de 0,0546. Los otros dos archivos son ejemplos deliberados de configuraciones fallidas: uno con 134 capas en 4-bit (error 0,0793, salida inutilizable) y otro con todas las capas en 4-bit puro (error 0,1602, salida destruida).

## Capacidades

- Generacion de video a partir de texto (text-to-video) con resolucion y numero de frames configurables.
- Edicion de video mediante condicionamiento VACE: mascaras, imagenes de referencia, mapas de profundidad, bocetos, etc.
- Control fino de la fuerza del condicionamiento VACE mediante el parametro `vace_strength`.
- Integracion nativa con ComfyUI mediante archivos de un solo fichero (single-file diffusion).
- Soporte multilingue para prompts en ingles y chino.
- Inferencia cuantizada con kernels optimizados para int4/int8, con aceleracion real en cargas de trabajo de video (33 frames) frente al FP16.

## Casos de uso

- Generacion de video de bajo presupuesto en GPU consumer: con un archivo de 2,15 GiB, el modelo cabe en tarjetas con 4-6 GB de VRAM, permitiendo generar clips de 33 frames a 480x480 en equipos sin GPU profesional.
- Edicion de video con control VACE: se puede usar un nodo VACE en ComfyUI para aplicar mascaras o imagenes de referencia y modificar escenas concretas manteniendo la coherencia temporal.
- Experimentacion con cuantizacion de modelos de difusion: el repositorio incluye tres archivos con errores conocidos, lo que permite estudiar el impacto de la cuantizacion en la calidad visual sin necesidad de ejecutar benchmarks propios.
- Validacion de pipelines de cuantizacion: el autor publica el metodo y las herramientas en su repositorio de GitHub, por lo que puede usarse como referencia para medir el error efectivo por capa en otros modelos.
- Prototipado rapido de efectos visuales: la edicion con VACE permite generar variaciones de una escena (cambiar objetos, fondos o iluminacion) con prompts en ingles o chino.
- Despliegue en entornos de produccion con restricciones de memoria: la version cuantizada reduce el peso de 4,01 GiB (FP16) a 2,15 GiB, un 46% menos, manteniendo calidad visual si se usa la configuracion `misto005`.

## Benchmarks y rendimiento

El autor no publica benchmarks estandar (FVD, CLIP score, etc.), pero si proporciona mediciones de error efectivo mediano por capa y comparativas de tolerancia al error entre familias de modelos:

| Modelo | Parametros | Error tolerado | Error no tolerado |
|---|---|---|---|
| Wan 2.1 VACE (cuantizado) | 1.3 B | 0,0546 | 0,0793 |
| Z-Image v2 | ~6 B | 0,1241 | no medido |
| HunyuanVideo 1.5 family | ~13 B | 0,1837 | 0,2147 |

Rendimiento medido en el mismo archivo y tarjeta, variando solo el tamano de lote:

| Frames | FP16 (s/step) | Cuantizado (s/step) | Diferencia |
|---|---|---|---|
| 1 | 0,204 | 0,363 | 1,78x mas lento |
| 33 | 0,870 | 0,653 | 1,33x mas rapido |

El kernel de 4-bit tiene un coste fijo por capa que no se amortiza con lotes pequenos; en cargas de video realistas (33 frames) la version cuantizada es mas rapida que FP16.

## Requisitos de hardware

- VRAM estimada: el archivo recomendado pesa 2,15 GiB; con overhead de activaciones y VAE, se recomienda al menos 4 GB de VRAM para inferencia a 480x480 con 33 frames.
- GPU compatibles: cualquier tarjeta consumer con 4 GB o mas (GTX 1650, RTX 2060, RTX 3060, RTX 4090, etc.). No requiere GPU profesional.
- Opciones de despliegue: ComfyUI (soporte nativo de single-file diffusion), y cualquier framework que cargue safetensors de difusion (diffusers con adaptaciones).
- Latencia: 0,653 s/step a 33 frames en cuantizado, lo que supone unos 16 segundos para 25 pasos de muestreo en una GPU moderna.
- Throughput: no se proporcionan datos de tokens por segundo; la metrica relevante es s/step, que depende del numero de frames y la resolucion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Wan2.1-VACE-1.3B (FP16) | 1.3 B | no aplica | safetensors | Apache-2.0 | Modelo base original, 4,01 GiB |
| Wan2.1-VACE-1.3B-W4A4-ConvRot (misto005) | 1.3 B | no aplica | safetensors cuantizado | Apache-2.0 | 2,15 GiB, error 0,0546, calidad visual correcta |
| Wan2.1-VACE-1.3B-W4A4-ConvRot (w4a4 puro) | 1.3 B | no aplica | safetensors cuantizado | Apache-2.0 | 2,07 GiB, error 0,1602, salida destruida |

No se dispone de comparativas con otros modelos cuantizados de video de tamano similar en la informacion proporcionada.

## Limitaciones y advertencias

- El archivo `wan21-vace-13b-w4a4.safetensors` (cuantizacion 4-bit pura) produce salidas destruidas: el autor lo publica como ejemplo de lo que no debe hacerse. No debe usarse en produccion.
- El archivo `wan21-vace-13b-misto015.safetensors` (134 capas en 4-bit) genera artefactos y perdida de estructura; tampoco es utilizable.
- Si se usa el modelo sin un nodo de control VACE en ComfyUI, el valor por defecto de `vace_strength` (1.0) inyecta un control constante que destruye la salida, incluso con el modelo FP16 original. Es imprescindible fijar `vace_strength` a 0 o usar un nodo VACE real.
- El umbral de error de cuantizacion es especifico de este modelo: 0,0546 funciona, 0,0793 no. No se puede extrapolar a otros modelos sin medir.
- La cuantizacion 4-bit es mas lenta que FP16 para lotes de 1 frame; solo es ventajosa con lotes de video reales (33 frames o mas).
- El modelo base solo soporta prompts en ingles y chino; otros idiomas pueden degradar la calidad de la generacion.
- No se han publicado evaluaciones de sesgos o seguridad para esta version cuantizada; se heredan las del modelo base.

## Enlaces

- Repositorio HuggingFace del modelo cuantizado: https://huggingface.co/JoaoZaokk/Wan2.1-VACE-1.3B-W4A4-ConvRot
- Modelo base original: https://huggingface.co/Wan-AI/Wan2.1-VACE-1.3B
- Version diffusers del modelo base: https://huggingface.co/Wan-AI/Wan2.1-VACE-1.3B-diffusers
- Repositorio GitHub de Wan2.1 (codigo e informe tecnico): https://github.com/Wan-Video/Wan2.1
- Repositorio del benchmark de cuantizacion del autor: https://github.com/JoaoZaokk/comfy-quant-bench
