# romainkh14/brimkern-video-BRIK

## Resumen

Brimkern video pipeline — BRIK (int8) es un pipeline de texto a video desarrollado por Romain Khanoyan (romainkh14) que combina los motion modules de AnimateDiff-Lightning de ByteDance con el fine-tune SD 1.5 epiCRealism de emilianJR, todo convertido al formato BRIK propietario del motor Brimkern. La propuesta central es ejecutar generacion de video completamente en el navegador mediante WebGPU, sin servidor de inferencia ni subida de datos: el prompt y los fotogramas nunca abandonan el equipo del usuario.

El modelo se distribuye como un pipeline de tres archivos cuantizados a int8 (UNet, motion modules y CLIP text encoder) que suman 1.53 GB junto con el decoder TAESD, y se carga mediante rangos HTTP contiguos que permiten streaming reanudable y uso offline posterior. Es relevante porque aborda el problema de la privacidad y el coste de infraestructura en generacion de video, ofreciendo una alternativa on-device con coste de descarga y tiempo de computacion anunciados de forma transparente antes de la ejecucion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SD 1.5 UNet (epiCRealism) + AnimateDiff-Lightning motion modules + CLIP-L text encoder + TAESD decoder |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica: pipeline de difusion) |
| Tipos de cuantizacion | int8 (q8) |
| Idiomas soportados | no disponible |
| Licencia | creativeml-openrail-m (derivados); motor Brimkern MIT; TAESD MIT |
| Formato de pesos | BRIK (.brik), contenedor auto-descriptivo basado en GGUF re-empaquetado |

## Arquitectura y entrenamiento

El pipeline combina tres componentes: un UNet de Stable Diffusion 1.5 fine-tuneado (epiCRealism), los motion modules de AnimateDiff-Lightning que anaden coherencia temporal entre fotogramas, y un CLIP-L como text encoder. Todo se convierte al formato BRIK, que es un GGUF re-empaquetado para navegador: los pesos ya vienen cuantizados a int4/int8, cada capa se dispone como un rango HTTP contiguo y el tokenizer va embebido. Esto permite cargar el modelo por rangos reanudables y usarlo offline despues de la primera descarga.

No se han publicado detalles sobre el entrenamiento de los pesos base (AnimateDiff-Lightning y epiCRealism tienen sus propios origenes), ni sobre el proceso de cuantizacion aplicado. El motor de inferencia Brimkern ejecuta los kernels mediante compute shaders WGSL escritos a mano, con una convolucion 3x3 int8 tiled que mide un speedup de x1.84 en ese kernel y x1.67 end-to-end sobre una imagen de 256 px respecto a la ruta sin optimizar.

## Capacidades

- Generacion de texto a video de 8 a 32 fotogramas ajustables, con coste de computacion mostrado antes de ejecutar.
- Generacion de texto a imagen sobre el mismo UNet compartido (el pipeline de imagen hereda las mismas optimizaciones de kernels).
- Ejecucion completamente local en el navegador mediante WebGPU, sin servidor de inferencia ni subida de datos.
- Descarga por rangos HTTP con cache y reutilizacion offline tras la primera carga.
- Barra de progreso real con fraccion de bloques UNet por paso y fotogramas decodificados, mas estimacion de tiempo restante.
- Carga como pipeline de multiples archivos (no es un unico fichero), con los tres componentes (UNet, motion, CLIP) cargandose juntos.
- Sin soporte declarado de tool calling, agentes, vision ni audio: es un pipeline de difusion para video e imagen.

## Casos de uso

- Generacion de video local con privacidad total: el prompt y los fotogramas nunca salen del equipo, lo que lo hace adecuado para entornos con datos sensibles o requisitos de cumplimiento (sanidad, legal, defensa) donde esta prohibido enviar contenido a APIs externas.
- Prototipado rapido de ideas de video en el navegador: un disenador o creativo puede generar clips cortos de 8 a 32 fotogramas sin instalar Python, CUDA ni herramientas de diffusion, solo abriendo una URL.
- Demos y presentaciones en vivo: al ejecutarse en el navegador del visitante, permite mostrar generacion de video en tiempo real durante una presentacion o feria sin depender de la conectividad ni de un servidor de inferencia centralizado.
- Educacion y formacion sobre modelos de diffusion: el coste anunciado antes de ejecutar y la barra de progreso con estimacion temporal lo hacen util para ensenar como funciona la inferencia de diffusion sin abstraer el proceso.
- Generacion de contenido para web y redes sociales: crear clips cortos animados para banners, avatares animados o microanimaciones directamente en el navegador, con coste de descarga fijo de 1.53 GB y reutilizacion offline posterior.
- Evaluacion de AnimateDiff-Lightning sin infraestructura: investigador o desarrollador que quiera probar los motion modules de ByteDance sin montar un entorno con GPUs dedicadas puede ejecutar el pipeline en su propia maquina via WebGPU y comparar resultados con otras alternativas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que no existe una cifra publicada de segundos por clip porque depende del numero de fotogramas, la resolucion y el ajuste de carga de la GPU, y el proyecto solo publica numeros si un benchmark reproducible los ha producido bajo condiciones declaradas. Lo unico medido es el speedup del kernel de convolucion int8 tiled: x1.84 en ese kernel y x1.67 end-to-end sobre una imagen de 256 px, con benchmarks reproducibles en `scripts/e2e/` del repositorio.

## Requisitos de hardware

- GPU compatible con WebGPU (Chrome, Edge, Firefox recientes); sin ella el pipeline no puede ejecutarse.
- 1.53 GB de descarga inicial (tres archivos BRIK + decoder TAESD de 4.7 MB que se obtiene de su propio repositorio).
- Varios minutos de trabajo de GPU para unos segundos de video, segun la model card; el tiempo exacto depende del numero de fotogramas, la resolucion y el ajuste de carga de GPU seleccionado por el usuario.
- No se especifican requisitos minimos de VRAM, ni GPU recomendadas concretas, ni opciones de despliegue en servidor (vLLM, llama.cpp, Ollama, TGI): el despliegue es exclusivamente en navegador via WebGPU.
- El motor Brimkern es compatible con modelos GGUF en general, por lo que el mismo runtime puede ejecutar LLMs y pipelines de imagen/video con el mismo conjunto de kernels.

## Comparativa con modelos similares

No disponible. No se han encontrado en la informacion proporcionada modelos comparables que ofrezcan generacion de video en navegador via WebGPU con cuantizacion int8 y licencia creativeml-openrail-m. Los modelos de generacion de video habituales (AnimateDiff, ModelScope, Stable Video Diffusion) requieren infraestructura servidor o GPU dedicada y no ofrecen ejecucion on-device en navegador. No se dispone de datos de rendimiento comparativo publicados.

## Limitaciones y advertencias

- Licencia creativeml-openrail-m para los pesos derivados: permite uso comercial pero con restricciones (no usar para generar contenido ilegal, danino o que viole derechos de terceros); conviene revisar los terminos completos antes de usar en produccion.
- El pipeline es un conjunto de archivos, no un unico fichero: el deeplink `?model=repo` no aplica, y la carga requiere gestionar multiples rangos HTTP.
- La generacion tarda varios minutos para unos segundos de video, lo que limita su uso interactivo en tiempo real.
- El numero de fotogramas es limitado (8-32), lo que implica clips muy cortos, no adecuados para video de mayor duracion.
- Dependencia de WebGPU: navegadores sin soporte o con implementaciones parciales no podran ejecutar el pipeline.
- No se han publicado datos sobre sesgos, alucinaciones visuales o limitaciones de idioma en el text encoder CLIP.
- Sin garantias de rendimiento: no hay cifras publicadas de segundos por clip, y el rendimiento variara significativamente segun la GPU del usuario.
- El decoder TAESD no esta incluido en el repositorio: se descarga de su propio repositorio (madebyollin/taesd), lo que anade una dependencia externa.
- La cuantizacion int8 puede degradar la calidad de los fotogramas respecto al modelo en fp16/fp32, aunque no se han publicado comparativas de calidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/romainkh14/brimkern-video-BRIK
- Repositorio GitHub Brimkern: https://github.com/RomainKH/Brimkern
- Especificacion del formato BRIK: https://github.com/RomainKH/Brimkern/blob/main/BRIK_FORMAT.md
- Benchmarks reproducibles: https://github.com/RomainKH/Brimkern/tree/main/scripts/e2e
- Sitio web Brimkern: https://brimkern.com/
- Documentacion Brimkern: https://brimkern.com/docs
- Demo de video: https://brimkern.com/chat
- AnimateDiff-Lightning (modelo base): https://huggingface.co/ByteDance/AnimateDiff-Lightning
- epiCRealism (fine-tune base): https://huggingface.co/emilianJR/epiCRealism
- Decoder TAESD: https://huggingface.co/madebyollin/taesd
