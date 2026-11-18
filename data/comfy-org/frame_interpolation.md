# Comfy-Org/frame_interpolation

## Resumen

Frame interpolation es un repositorio de pesos empaquetados por Comfy-Org para su uso directo en ComfyUI. No se trata de un modelo generativo de lenguaje ni de un transformer multimodal, sino de una coleccion de redes neuronales especializadas en interpolacion de fotogramas de video: FILM (Google Research) y varias versiones de RIFE (Practical-RIFE). El repositorio resuelve el problema de aumentar la tasa de fotogramas de un video (por ejemplo, pasar de 24 a 60 fps) sintetizando fotogramas intermedios de forma coherente, sin necesidad de instalar dependencias externas ni clonar los repositorios originales de cada proyecto.

El paquete incluye seis archivos en formato safetensors: `film_net_fp16.safetensors` y cinco variantes de RIFE (v4.25, v4.25 heavy, v4.25 lite, v4.26 y v4.26 heavy). Su relevancia actual radica en que ComfyUI se ha consolidado como entorno de referencia para pipelines de generacion y postprocesado de video, y estos pesos permiten integrar interpolacion de fotogramas como un nodo mas dentro de un workflow, sin friccion de instalacion. El tamano total del repositorio es de 0,2 GB, lo que refleja que son redes compactas y ligeras en comparacion con modelos de difusion.

La licencia es dual (MIT y Apache 2.0, segun el campo `license_name`), heredada de los proyectos originales. No hay informacion sobre idiomas porque la tarea no es linguistica: opera sobre pixeles de video.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Redes neuronales de interpolacion de fotogramas: FILM (Google Research) y RIFE (Practical-RIFE) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entrada de video, no texto) |
| Tipos de cuantizacion | FP16 para FILM; variantes lite/heavy de RIFE segun el archivo (no se detallan niveles de cuantizacion adicionales) |
| Idiomas soportados | no disponible (no es un modelo linguistico) |
| Licencia | MIT y Apache 2.0 (campo `license_name: mit-and-apache-2.0`) |
| Formato de pesos | safetensors (single-file para ComfyUI) |

Archivos incluidos en el repositorio:

| Archivo | Modelo base |
|---|---|
| `film_net_fp16.safetensors` | FILM (Google Research), precision FP16 |
| `rife_v4.25.safetensors` | RIFE v4.25 |
| `rife_v4.25_heavy.safetensors` | RIFE v4.25 variante heavy |
| `rife_v4.25_lite.safetensors` | RIFE v4.25 variante lite |
| `rife_v4.26.safetensors` | RIFE v4.26 |
| `rife_v4.26_heavy.safetensors` | RIFE v4.26 variante heavy |

## Arquitectura y entrenamiento

Los pesos proceden de dos lineas de investigacion distintas. FILM (Frame Interpolation for Large Motion) es un modelo de Google Research disenado para manejar movimiento de gran magnitud entre fotogramas, con una arquitectura basada en redes convolucionales multi-escala y un modulo de estimacion de flujo optico. RIFE (Real-time Intermediate Flow Estimation) es un modelo de Practical-RIFE orientado a inferencia en tiempo real, que estima el flujo intermedio de forma directa y jerarquica, lo que le permite generar fotogramas intermedios con latencia baja. Las variantes lite y heavy de RIFE ajustan el coste computacional y la calidad del resultado, mientras que v4.25 y v4.26 corresponden a iteraciones sucesivas del mismo modelo.

No se dispone de informacion sobre el numero de tokens, la composicion del dataset de entrenamiento ni sobre si se aplicaron tecnicas de RLHF o DPO; estos conceptos no aplican a un modelo de interpolacion de video. La innovacion tecnica relevante es el empaquetado en safetensors para ComfyUI, que elimina la necesidad de instalar los repositorios originales y permite cargar los pesos como nodos nativos del grafo.

## Capacidades

- Interpolacion de fotogramas de video: sintetiza fotogramas intermedios entre dos fotogramas consecutivos para aumentar la tasa de fotogramas.
- Dos familias de modelos: FILM para movimiento de gran magnitud y RIFE para inferencia rapida en tiempo real.
- Variantes de calidad/velocidad en RIFE: lite, estandar y heavy, para ajustar el compromiso entre latencia y fidelidad.
- Integracion nativa en ComfyUI como nodo de video-to-video dentro de un workflow.
- Procesamiento por lotes de secuencias de video (sujeto a la implementacion del nodo en ComfyUI).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingues, al no ser un modelo de lenguaje.
- No dispone de modo thinking, vision semantica ni audio; su entrada y salida son fotogramas de imagen.

## Casos de uso

- Conversion de 24 a 60 fps en postproduccion: se carga `rife_v4.26.safetensors` en el nodo de interpolacion y se procesa la secuencia para generar fotogramas intermedios, obteniendo movimiento mas fluido en material grabado a 24 fps.
- Suavizado de animacion tradicional: las animaciones a 12 fps pueden elevarse a 24 o 48 fps con RIFE, reduciendo el efecto de saltos entre dibujos sin necesidad de reanimar los fotogramas intermedios.
- Restauracion de metraje antiguo: FILM maneja mejor el movimiento de gran magnitud, por lo que es adecuado para secuencias con camara en movimiento o cambios bruscos entre fotogramas.
- Generacion de video con IA: los pipelines de texto-a-video suelen producir clips cortos a baja tasa de fotogramas; la interpolacion con RIFE permite alargar la duracion efectiva y suavizar el resultado antes de la exportacion final.
- Previsualizacion rapida en produccion: la variante `rife_v4.25_lite` permite generar una previsualizacion interpolada en pocos segundos para validar el ritmo de una secuencia antes del render final con la variante heavy.
- Efectos de camara lenta: a partir de metraje grabado a 60 fps se puede interpolar hasta 120 o 240 fps para obtener camara lenta fluida sin grabar a alta velocidad.
- Automatizacion de pipelines de video en ComfyUI: al ser pesos single-file, se pueden encadenar con nodos de upscaling o de difusion dentro del mismo grafo, sin scripts externos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; al tratarse de redes compactas (repositorio total de 0,2 GB), la huella de memoria es reducida en comparacion con modelos de difusion.
- GPU recomendadas: no disponible en la informacion proporcionada; por el perfil de RIFE (orientado a tiempo real) se espera funcionamiento en GPU consumer, pero no se confirma con datos del repositorio.
- Compatibilidad con GPU consumer: no confirmada con cifras; el tamano de los pesos sugiere que cabe en GPU de gama media, pero no se aporta medicion.
- Opciones de despliegue: ComfyUI (entorno para el que estan empaquetados los pesos); no se documentan otros backends como vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Familia | Enfoque | Variantes | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Este repositorio (Comfy-Org) | FILM + RIFE | Interpolacion de fotogramas | 6 archivos (FILM FP16, RIFE v4.25/v4.26 lite/heavy) | safetensors para ComfyUI | MIT y Apache 2.0 | Hugging Face, integrado en ComfyUI |
| Practical-RIFE (hzwer) | RIFE | Interpolacion en tiempo real | Multiples versiones del repositorio original | Pesos originales (no safetensors single-file) | Segun repositorio original | GitHub |
| Google Research frame-interpolation | FILM | Movimiento de gran magnitud | Modelo FILM original | Pesos originales | Segun repositorio original | GitHub |

La ventaja de este repositorio frente a los originales es el empaquetado single-file y la integracion directa en ComfyUI; la desventaja es que no incluye herramientas de entrenamiento ni scripts de evaluacion propios.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no procesa texto, no responde a prompts y no tiene capacidades de razonamiento, codigo ni matematicas.
- La calidad de la interpolacion depende del contenido: oclusiones, movimiento no rigido complejo y cambios de iluminacion bruscos pueden producir artefactos.
- Las variantes lite sacrifican fidelidad por velocidad; no son adecuadas para render final de alta calidad.
- No se documentan sesgos, riesgos de alucinacion ni limitaciones de contexto o idioma, porque la tarea no es linguistica.
- Licencia dual MIT y Apache 2.0: conviene verificar las condiciones de cada proyecto original (Practical-RIFE y Google Research frame-interpolation) antes de un uso comercial, ya que el campo `license` del repositorio figura como `other`.
- No se proporcionan datos de benchmarks ni de latencia; cualquier estimacion de rendimiento en produccion debe medirse sobre el hardware objetivo.
- El repositorio depende de ComfyUI para su uso previsto; fuera de ese entorno requiere adaptar la carga de los safetensors.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Comfy-Org/frame_interpolation
- Practical-RIFE (modelo original RIFE): https://github.com/hzwer/Practical-RIFE
- Google Research frame-interpolation (modelo original FILM): https://github.com/google-research/frame-interpolation
- ComfyUI: https://github.com/Comfy-Org/ComfyUI
- Plantilla de workflow de interpolacion de fotogramas: https://github.com/Comfy-Org/workflow_templates/blob/main/templates/utility_video_frame_interpolation.json
