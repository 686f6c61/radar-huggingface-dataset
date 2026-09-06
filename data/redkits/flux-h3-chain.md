# redkits/flux-h3-chain

## Resumen

`redkits/flux-h3-chain` es un pipeline de produccion en dos etapas que combina un modelo de generacion de imagenes como generador de keyframes y un modelo de video para producir clips cortos con audio nativo. Esta desarrollado por el usuario redkits y se publica en HuggingFace como una cadena de trabajo lista para usar, pensada para entornos de produccion donde se necesita pasar de un prompt de texto a un video finalizado.

La primera etapa utiliza dos backends intercambiables: `Z-Image-Turbo`, un modelo de 6B parametros centrado en velocidad, o `FLUX.2-klein-9B`, un modelo de 9B que incluye un encoder de texto abliterated destinado a eliminar rechazos a nivel de imagenes. La segunda etapa delega en `MiniMax-H3`, un modelo de video que recibe el keyframe y genera entre 5 y 15 segundos de video a 24 fps, con audio estereo sincronizado a 32 kHz y resolucion de hasta 2K, todo multiplexado en MP4.

Este modelo es relevante porque ofrece un flujo de trabajo completo de text-to-video con audio sincronizado, sin depender de APIs alojadas en el camino de `MiniMax-H3`, y porque incluye una ruta "uncensored" opcional mediante el encoder abliterated. La arquitectura combina modelos de difusion de flujo en una cadena de produccion, con soporte de offload automatico de componentes para adaptarse a GPUs con memoria limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline de dos etapas: generacion de keyframes (Z-Image-Turbo 6B o FLUX.2-klein-9B 9B) + modelo de video MiniMax-H3 (motor de difusion de flujo multimodal) |
| Parametros totales | no disponible (se indican pesos de 61.7GB para el transformer y 62.1GB para el conditioner de MiniMax-H3, sin numero de parametros publicado) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | MIT |
| Formato de pesos | no disponible |

## Arquitectura y entrenamiento

El pipeline se estructura como una cadena de dos modelos generativos. En la primera etapa, se genera un keyframe a partir de un prompt de texto usando uno de los dos backends disponibles. `Z-Image-Turbo` es un modelo de 6B optimizado para velocidad, mientras que `FLUX.2-klein-9B` es un modelo de 9B que admite un encoder de texto alternativo (ponpoke/flux2-klein-9b-uncensored-text-encoder), descrito como abliterated para eliminar rechazos de imagen. La segunda etapa introduce el keyframe en `MiniMax-H3`, un modelo de video de difusion de flujo que produce el clip final con audio estereo.

La integracion de `MiniMax-H3` se realiza exclusivamente a traves de Modular Diffusers (no disponible en la mitad de `DiffusionPipeline`), y requiere la version main de diffusers. La aplicacion utiliza `ComponentsManager.enable_auto_cpu_offload` para cargar y descargar los componentes en GPU de forma dinamica, lo que permite ejecutar el modelo en una sola A100-80GB siempre que se disponga de al menos 240GB de RAM host. No se han publicado detalles sobre los datos de entrenamiento, el numero de tokens, ni la aplicacion de RLHF o DPO en la informacion disponible.

## Capacidades

- Generacion de keyframes a partir de prompts de texto mediante dos backends: Z-Image-Turbo y FLUX.2-klein-9B.
- Generacion de video a partir de keyframes con MiniMax-H3, produciendo clips de 5-15 segundos a 24 fps.
- Audio estereo nativo sincronizado a 32 kHz, integrado en el video MP4 resultante.
- Resolucion de video hasta 2K, con dimensiones de lienzo que deben ser multiplos de 32.
- Ruta "uncensored" opcional en el backend de FLUX.2-klein, que elimina rechazos de imagen a nivel de encoder de texto.
- Variantes de flujo: `fl2va` (keyframe a video), `t2va` (texto a video sin keyframe) y `ref2va` (referencia omni).
- Ejecucion local en el camino de MiniMax-H3, sin filtros de APIs alojadas.
- No se ha documentado soporte para tool calling, function calling, agents o razonamiento multi-step.

## Casos de uso

- Produccion de videos cortos para redes sociales: se genera un keyframe con Z-Image-Turbo y se convierte en un clip de 5-15 segundos con audio, reduciendo el tiempo de edicion manual.
- Animacion de fotogramas clave en entornos profesionales: FLUX.2-klein produce un keyframe artistico y MiniMax-H3 anade movimiento realista y sonido sincronizado, util en previsualizaciones de producto.
- Contenido audiovisual para publicidad: el pipeline permite iterar rapidamente sobre ideas hasta obtener un video finalizado con audio, sin depender de equipos de animacion.
- Prototipado de secuencias de video para videojuegos: se generan clips cortos a partir de prompts para explorar direcciones visuales antes de invertir en produccion completa.
- Creacion de videos con audio para presentaciones: el audio estereo integrado elimina la necesidad de anadir postproduccion de sonido, acelerando la entrega.
- Investigacion en modelos generativos: se puede comparar el comportamiento de Z-Image-Turbo frente a FLUX.2-klein en experimentos de cadena, o probar variantes de MiniMax-H3 como Turbo.
- Automatizacion de pipelines de contenido en medios: la app puede integrarse en un servidor local con interfaz web, permitiendo generar videos bajo demanda sin APIs externas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

| Etapa | Minimo | Recomendado |
|---|---|---|
| Z-Image-Turbo keyframe | 1x 16GB GPU | 1x 24GB GPU |
| FLUX.2-klein-9B keyframe | 1x 24GB GPU | 1x 40GB+ GPU |
| MiniMax-H3 fl2va | 1x A100-80GB + >=240GB RAM host (auto CPU offload) | 2x A100-80GB (conditioning split) |

- La aplicacion usa `ComponentsManager.enable_auto_cpu_offload`, por lo que los componentes se van cargando en GPU de forma secuencial.
- Para despliegues mas ligeros, se puede cambiar `H3_REPO` a `lightx2v/Minimax-h3-Turbo`, que es una version destilada.
- Las opciones de despliegue documentadas son exclusivamente via Modular Diffusers, no a traves de vLLM, llama.cpp u otros motores de inferencia.
- No se proporcionan datos de latencia ni throughput en la informacion disponible.

## Comparativa con modelos similares

No se ha encontrado informacion comparable sobre modelos que ofrezcan un pipeline equivalente de dos etapas con audio sincronizado. Los componentes individuales (Z-Image-Turbo, FLUX.2-klein, MiniMax-H3) son modelos distintos, pero no hay datos en la informacion disponible para comparar rendimiento, parametros o licencia de forma rigurosa.

## Limitaciones y advertencias

- La duracion del video se limita a 5-15 segundos a 24 fps, y el numero de frames se ajusta a la formula `17*n + 5`.
- Las dimensiones del lienzo deben ser multiplos de 32.
- El repositorio de `MiniMax-H3` es un modelo gated en HuggingFace, por lo que se necesita un token de acceso y aceptar las condiciones del autor.
- La integracion depende de difusers main, lo que puede generar incompatibilidades si se usa una version estable anterior.
- No se soporta CFG ni prompt negativo; la guia esta destilada en los pesos de MiniMax-H3.
- La ruta "uncensored" con encoder abliterated puede generar contenido no deseado sin filtros; debe usarse con responsabilidad.
- Los requisitos de hardware son elevados para MiniMax-H3 (>=240GB de RAM y A100-80GB), lo que dificulta su uso en equipos de consumo.
- No se han publicado idiomas soportados ni datos de calidad, por lo que el rendimiento multilingue es incierto.
- Existen riesgos inherentes de alucinacion y sesgos en los modelos generativos, aunque no se han documentado casos especificos en la informacion disponible.

## Enlaces

- HuggingFace: https://huggingface.co/redkits/flux-h3-chain
- Repo oficial de FLUX: https://github.com/black-forest-labs/flux
- Web de FLUX 3: https://flux3.dev/
- MiniMax-H3 (gated): https://huggingface.co/MiniMaxAI/MiniMax-H3
- Variante Turbo de MiniMax-H3: https://huggingface.co/lightx2v/Minimax-h3-Turbo
- Encoder de texto uncensored para FLUX.2-klein: https://huggingface.co/ponpoke/flux2-klein-9b-uncensored-text-encoder
