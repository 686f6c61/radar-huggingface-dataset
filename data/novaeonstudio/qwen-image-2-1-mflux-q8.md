# NovaeonStudio/qwen-image-2.1-mflux-q8

## Resumen

NovaeonStudio/qwen-image-2.1-mflux-q8 es una cuantizacion a 8 bits del modelo de difusion Qwen-Image-2.1 de Alibaba Qwen, reempaquetada en formato nativo de mflux para su ejecucion sobre Apple Silicon mediante MLX. No es un modelo original: los pesos son los oficiales sin cambios (relacion `quantized`), unicamente comprimidos con `mflux-save --quantize 8`. El build lo firma Novaeon.Studio y resuelve un hueco concreto: cuando se publico Qwen-Image-2.1 no existia un paquete 8-bit listo para mflux, solo el modelo en precision completa.

El modelo hereda la arquitectura del base: un componente de generacion visual de aproximadamente 7.000 millones de parametros organizado en 32 capas DiT (Diffusion Transformer) de un solo flujo, acompanado de un text encoder Qwen2.5-VL y un VAE de imagen. La tarea es text-to-image (pipeline `text-to-image`), aunque el modelo base es unificado y tambien cubre edicion de imagenes con referencias.

Su relevancia practica esta en el consumo de recursos: ocupa unos 22 GB en disco y pico de memoria en torno a 18,4 GB, de modo que cabe en una maquina Apple Silicon de 24 GB o mas. Segun las mediciones del autor sobre un M5 Max, rinde a ~1,4 s por paso, con un borrador de 8 pasos en unos 14 segundos a 768². La licencia es la heredada del modelo base (`qwen-image-2.1-license`, categoria `other`), por lo que conviene revisarla antes de cualquier uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DiT (Diffusion Transformer) de un solo flujo, 32 capas en el componente de generacion visual; text encoder Qwen2.5-VL y VAE de imagen |
| Parametros totales | ~7.000 millones en el componente de generacion visual (modelo base); total del pipeline completo no disponible |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (modelo de difusion; procesa prompts de texto, no contexto de tokens extensible declarado) |
| Tipos de cuantizacion | 8-bit (mflux). Existe una variante comunitaria en 4-bit (`mflux-community/qwen-image-2-1-mflux-q4`) |
| Idiomas soportados | en (ingles) |
| Licencia | other — `qwen-image-2.1-license` (heredada del modelo base) |
| Formato de pesos | safetensors (formato nativo mflux / Apple MLX) |

## Arquitectura y entrenamiento

El componente de generacion visual es un transformer de difusion (DiT) de un solo flujo con 32 capas, disenado por Qwen para equilibrar calidad, eficiencia de inferencia y versatilidad. El pipeline completo se compone de cuatro partes distribuidas en el repositorio: `transformer/` (fragmentos cuantizados del DiT, shards 0-3 mas indice), `text_encoder/` (codificador Qwen2.5-VL, shards 0-7 mas indice), `vae/` (VAE de imagen) y `processor/` (tokenizer y plantilla de chat). Este build concreto no introduce ningun cambio en los pesos ni fine-tuning ni merge alguno: es una cuantizacion directa del modelo oficial.

Sobre el entrenamiento del modelo base, la informacion disponible en la busqueda web no detalla el numero de tokens, la composicion del dataset ni si hubo etapas de RLHF o DPO; esos datos figuran como no disponibles. Lo que si se documenta es que Qwen-Image-2.1 unifica generacion text-to-image y edicion de imagenes en un unico modelo de ~7B en su componente visual, con soporte nativo para generar y editar imagenes con transparencia (RGBA). La implementacion en mflux anade capacidades de edicion por instrucciones con una o varias referencias, cache de KV por prefijo (prefix KV caching) y salida RGBA a traves de comandos especificos (`mflux-generate-qwen-2.1-edit`), aunque este paquete cuantizado esta orientado al pipeline text-to-image (`mflux-generate-qwen-2.1`). Como innovaciones tecnicas destacables del base se citan cuatro mejoras orientadas a compacidad y eficiencia; el detalle completo no esta en la informacion proporcionada.

## Capacidades

- Generacion de imagenes a partir de texto (text-to-image) con calidad fotografica, segun las muestras del autor en materiales, iluminacion y realismo de camara.
- Coherencia a bajo numero de pasos: el base se mantiene estable a 8 pasos con guidance 1.0, lo que permite borradores rapidos.
- Ajuste de fidelidad al prompt mediante `--guidance` (1.0 en borrador, 2.5-3.5 en resultado final).
- Control de resolucion: valores de 1024 a 1536 recomendados, en multiplos de 16, con 1328² como valor por defecto sugerido.
- Reproducibilidad mediante semilla (`--seed`).
- Ejecucion local en Apple Silicon a traves de mflux 0.20.0 o superior (MLX), sin cuantizacion en tiempo de ejecucion.
- El modelo base, no este build, anade edicion de imagenes guiada por instrucciones con referencias multiples, cache de KV por prefijo y salida RGBA.
- Tool calling / function calling: no aplica (modelo de generacion de imagen, no de texto conversacional).
- Soporte de agentes y razonamiento multi-paso: no aplica.
- Capacidades multilingues: no; la etiqueta de idioma oficial es unicamente `en`.
- Vision como entrada: el text encoder es Qwen2.5-VL, pero este pipeline esta orientado a text-to-image; las capacidades de edicion/entrada de imagen pertenecen al flujo de edicion del base.

## Casos de uso

- Fotografia de producto sintetica: generar bodegones de producto (cristal, perfumeria, materiales) con control de iluminacion mediante lenguaje fotografico ("rim light", "macro detail", "85 mm"), adecuado por el buen rendimiento del base en materiales y luz.
- Moodboards y direccion de arte: iterar rapidamente con borradores de 8 pasos (~14 s a 768²) para validar paletas y composiciones antes de gastar pasos en un resultado final a 20-30 pasos.
- Ilustracion de escenas y arquitectura: generar corredores, interiores y entornos con iluminacion volumetrica y narrativa atmosferica, usando resoluciones panoramicas (por ejemplo 1792×1008).
- Concept art para videojuegos y ocio digital: producir assets con coherencia de paleta; el modelo base soporta salida RGBA con transparencia (a traves del pipeline de edicion de mflux), util para sprites y elementos superpuestos.
- Contenido de marketing con paleta de marca: forzar una identidad cromatica constante mediante prompts especificos ("midnight navy background, amber-to-coral glow, indigo accents") para piezas graficas de redes o web.
- Prototipado local en Mac sin GPU dedicada: desarrollo y pruebas de pipelines de difusion en un portatil o equipo Apple Silicon con 24 GB o mas de memoria unificada, evitando descargar el modelo en precision completa (40 GB+).
- Pruebas de integracion de mflux en flujos propios: servir el modelo desde scripts en linea de comandos para generar lotes de imagenes reproducibles con semilla fija, util en entornos de investigacion y evaluacion comparativa.
- Generacion de ilustraciones para documentacion tecnica o blogs: crear imagenes de apoyo (escenas de centros de datos, diagramas conceptuales) sin depender de servicios en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (tipo FID, CLIP, MMLU o HumanEval, estos ultimos no aplicables) en la informacion disponible. El autor unicamente reporta mediciones de rendimiento de inferencia sobre un Apple M5 Max de 128 GB en 8 bits:

| Resolucion | Pasos | Tiempo | Pico de memoria |
|---|---|---|---|
| 768² | 8 | ~14 s | ~18,4 GB |
| 1328² | 8 | ~30 s (incluye carga) | ~18 GB |

El tiempo escala aproximadamente de forma lineal con el numero de pasos y con el area en pixeles. La primera llamada paga un coste unico de carga del modelo; las llamadas posteriores, con el modelo residente en memoria, son mas rapidas. El autor cita ~1,4 s por paso como referencia.

## Requisitos de hardware

- VRAM/memoria estimada: pico de ~18,4 GB a 768² con 8 pasos; ~18 GB a 1328². En disco, ~22 GB (el repositorio completo pesa 24,0 GB).
- Memoria unificada recomendada: 24 GB o mas en Apple Silicon para un funcionamiento comodo segun el autor.
- Hardware de referencia: el build se creo y midio en un Apple M5 Max con 128 GB de memoria unificada.
- GPU compatibles: al ser un paquete MLX/mflux, esta pensado para Apple Silicon (chips M-series). No esta orientado a GPU NVIDIA o AMD; para esas plataformas habria que usar el modelo base en otro runtime.
- Cabe en portatil consumer: si, en equipos Apple Silicon con 24 GB o mas de memoria unificada.
- Opciones de despliegue: mflux (0.20.0 o superior) mediante los comandos `mflux-generate-qwen-2.1` y el flujo de edicion asociado. No se documentan aqui soportes para vLLM, llama.cpp, Ollama ni TGI, dado que es un modelo de difusion y no un LLM.
- Latencia y throughput: ~1,4 s por paso en M5 Max; ~14 s para un borrador de 8 pasos a 768²; ~30 s a 1328² incluyendo la carga.

## Comparativa con modelos similares

| Modelo | Parametros (componente visual) | Formato / runtime | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| NovaeonStudio/qwen-image-2.1-mflux-q8 (este build) | ~7B | safetensors / mflux (MLX, Apple Silicon) | 8-bit | qwen-image-2.1-license (other) | HuggingFace, 0 descargas, 1 like |
| Qwen/Qwen-Image-2.1 (base) | ~7B | safetensors (precision completa) | ninguna | qwen-image-2.1-license (other) | HuggingFace, modelo oficial |
| mflux-community/qwen-image-2-1-mflux-q4 | ~7B | safetensors / mflux (MLX) | 4-bit | licencia del base sin cambios | HuggingFace, conversion comunitaria |

No se dispone de datos de rendimiento comparativos entre estas variantes ni frente a alternativas de otros fabricantes en la informacion proporcionada; por tanto, la comparativa se limita a formato, cuantizacion y disponibilidad. Cualquier comparacion de calidad con modelos como FLUX u otros no esta respaldada por datos en las fuentes consultadas y figura como no disponible.

## Limitaciones y advertencias

- Es una cuantizacion a 8 bits: puede perder algo de fidelidad frente al modelo base en precision completa, aunque el autor afirma mantener la coherencia a bajo numero de pasos.
- No se ha publicado ninguna evaluacion de sesgos del modelo ni de este build concreto; se desconoce el comportamiento en prompts sensibles.
- Riesgo de alucinacion visual: como todo modelo de difusion, puede producir detalles incoherentes.
- Texto renderizado: el propio autor advierte de que tiende a corromper cadenas de texto largas; recomienda componer el texto real o los logotipos por separado.
- Idiomas: soporte declarado unicamente en ingles; los prompts en otros idiomas pueden degradar el resultado.
- Licencia: `other` / `qwen-image-2.1-license`. El autor indica explicitamente revisarla antes de un uso comercial; las condiciones exactas de explotacion no se detallan en la informacion disponible.
- Alcance del pipeline: este paquete se orienta a text-to-image. Las funciones de edicion con referencias, cache de KV por prefijo y salida RGBA pertenecen al flujo del modelo base en mflux, no se garantizan en esta cuantizacion tal como se documenta.
- Portabilidad: al ser MLX/mflux, no es directamente desplegable en GPU NVIDIA/AMD; requiere hardware Apple Silicon.
- Advertencia de operacion: el modelo ya esta cuantizado; no debe volverse a aplicar `--quantize`.
- Madurez: el repositorio tiene 0 descargas y 1 like, y la ultima actualizacion es del 1 de octubre de 2026, por lo que carece de validacion amplia de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/NovaeonStudio/qwen-image-2.1-mflux-q8
- Modelo base Qwen/Qwen-Image-2.1: https://huggingface.co/Qwen/Qwen-Image-2.1
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen-Image-2.1/blob/main/LICENSE
- Repositorio GitHub oficial Qwen-Image-2.1: https://github.com/QwenLM/Qwen-Image-2.1
- Blog de Qwen sobre Qwen-Image-2.1: https://qwen.ai/blog?id=qwen-image-2.1
- Proyecto mflux (motor de cuantizacion y ejecucion): https://github.com/filipstrand/mflux
- Implementacion del modelo qwen21 en mflux-community: https://github.com/mflux-community/mflux/tree/main/src/mflux/models/qwen21
- Variante 4-bit comunitaria: https://huggingface.co/mflux-community/qwen-image-2-1-mflux-q4
- Novaeon.Studio: https://novaeon.studio
