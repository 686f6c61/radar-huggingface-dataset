# JoshHughes/sana-video2-style-v2v-lora

## Resumen

SANA-Video 2.0 Style Video-to-Video LoRA (c20) es un adaptador LoRA de rango 32 desarrollado por Josh Hughes para el modelo de generación de vídeo SANA-Video 2.0 5B 720p 4-step de NVIDIA. Su función es reestilizar un vídeo de entrada hacia uno de 20 estilos visuales predefinidos (ilustración de cuento, pixel art, vidriera, carboncillo, synthwave, ukiyo-e, plastilina, etc.), manteniendo la apariencia estilizada durante todo el clip y siguiendo el movimiento del vídeo original. El adaptador recibe el vídeo fuente y una versión estilizada de su primer fotograma, que actúa como referencia del look junto con una frase descriptiva del estilo.

El problema que resuelve es concreto: sin este LoRA, el modelo base de 4 pasos mantiene el primer fotograma estilizado durante un instante y después revierte hacia la apariencia fotográfica del vídeo fuente. El adaptador c20 corrige esa deriva y sostiene el estilo a lo largo de la secuencia. El modelo es relevante porque demuestra que un LoRA pequeño (128 MB, 322 tensores en float32) puede modificar de forma sustancial el comportamiento de un modelo de vídeo de difusión de 5B parámetros con muy pocos pasos de inferencia, y porque publica una metodología de evaluación reproducible con métricas de retención de estilo (CLIP) y de fidelidad de movimiento (flujo óptico).

El adaptador se distribuye con licencia Apache-2.0, está etiquetado solo para inglés y se apoya en el modelo base Efficient-Large-Model/SANA-Video_2.0_5B_720p_4step, también Apache-2.0. El repositorio ocupa 0,4 GB e incluye el conjunto de evaluación completo: 10 vídeos fuente, 200 primeros fotogramas estilizados, los jobs de generación y los resultados por clip.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre un transformer de difusión para vídeo (SANA-Video 2.0 5B); rango 32 |
| Parametros totales | No disponible (el adaptador consta de 322 tensores, 128 MB en float32); el modelo base es de 5B |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (no es un modelo de lenguaje; genera clips de 81 fotogramas a 16 fps) |
| Tipos de cuantizacion | No disponible para el LoRA; se distribuye en float32 y como pack fp16 para el motor p0pc0rn (WebGPU) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (`sana-video2-5b-4step-style-v2v-c20.safetensors`); pack fp16 adicional para WebGPU |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 32 que se inyecta en los módulos de atención del transformer de difusión SANA-Video 2.0 5B. Las claves siguen la nomenclatura oficial de módulos de NVIDIA `SanaVideo2_5B` (`blocks.N.attn.qkv`, `blocks.N.attn.output_gate`, `blocks.N.attn.proj`, `blocks.N.cross_attn.q_linear`, etc.), con pares `lora_A.weight` de forma `[32, in]` y `lora_B.weight` de forma `[out, 32]`. El modelo base emplea destilación por auto-destilación (DMD) para funcionar en 4 pasos, y el LoRA conserva ese régimen de pocos pasos.

El entrenamiento de c20 se realizó exclusivamente sobre pares generados por el propio modelo SANA-Video 2.0 de 4 pasos y posteriormente verificados: pares cíclicos formados por un clip estilizado y su gemelo fotográfico con el mismo movimiento. No se utilizó ningún otro modelo de vídeo ni vídeo real. c20 se desarrolló a partir del LoRA de primer fotograma f3 y sigue conservando la capacidad de imagen-a-vídeo. La evaluación se hizo sobre 200 reestilizaciones reservadas (10 vídeos fuente × 20 estilos), con métricas de retención de estilo mediante CLIP y de fidelidad de movimiento mediante flujo óptico, reproducibles con el directorio `eval/`.

## Capacidades

- Reestilización de vídeo a vídeo (video-to-video) hacia 20 estilos predefinidos: ilustración de cuento, póster de videojuego, marioneta, vidriera, peluche, pintura al óleo con impasto, arcilla, carboncillo, cera, low poly, mármol, ukiyo-e, psicodélico, synthwave, anime, grafiti, dibujo de plano, origami, pixel art y cartoon 3D.
- Retención del estilo durante todo el clip, no solo en el primer fotograma, siguiendo el movimiento del vídeo fuente.
- Condicionamiento por primer fotograma estilizado más una frase descriptiva del look.
- Capacidad heredada de imagen-a-vídeo del LoRA f3 del que deriva.
- Dos programaciones de muestreo: `s2x` (sigue más de cerca el movimiento de la fuente, recomendada para 17 de los 20 estilos) y `stage 1` (recomendada para marioneta, dibujo de plano y origami).
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni procesamiento de audio; es un modelo generativo de vídeo, no un modelo de lenguaje.

## Casos de uso

- Postproducción y estilización de metraje existente: se toma un vídeo rodado y se reestiliza hacia un look concreto (por ejemplo, carboncillo o ukiyo-e) manteniendo el movimiento original, útil para piezas de animación o aperturas de vídeo.
- Prototipado rápido de dirección de arte: un equipo creativo puede probar 20 estilos sobre el mismo clip de referencia y comparar resultados antes de comprometer un pipeline de producción más costoso.
- Generación de contenido para redes sociales: clips cortos de 81 fotogramas a 16 fps en 832x480 o 480x832, adecuados para formatos verticales u horizontales de plataformas sociales.
- Previsualización de storyboards animados: a partir de una captura de movimiento o un vídeo de bloqueo, obtener una versión estilizada que comunique la intención visual al cliente.
- Creación de assets para videojuegos y entornos interactivos: estilos como pixel art, low poly o cartoon 3D permiten generar animaciones de referencia coherentes con una estética de juego.
- Investigación en adaptación eficiente de modelos de difusión de vídeo: el repositorio incluye el conjunto de evaluación completo y las métricas, lo que permite reproducir y comparar variantes de LoRA con y sin entrenamiento de estilo.
- Despliegue en navegador mediante WebGPU: el pack fp16 para el motor p0pc0rn permite ejecutar la reestilización en un entorno on-device sin PyTorch.

## Benchmarks y rendimiento

| Metrica | c20 | Misma receta sin entrenamiento de estilo |
|---|---|---|
| Retencion de estilo (CLIP), 200 reestilizaciones, programacion por defecto | 191 / 200 | 95 / 200 |
| Retencion de estilo (CLIP), 200 reestilizaciones, programacion s2x | 171 / 200 | 30 / 200 |

Las 200 reestilizaciones de evaluación corresponden a 10 vídeos fuente × 20 estilos. La programación `s2x` se recomienda para 17 de los 20 estilos. No se han publicado resultados de benchmarks adicionales (FVD, VBench u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. El adaptador en sí ocupa 128 MB en float32, pero requiere cargar el modelo base SANA-Video 2.0 5B, cuyo consumo de VRAM no se detalla.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: PyTorch con la librería `sana` (loader y sampler incluidos en `eval/sana_video2_lora.py`) y el motor on-device WebGPU p0pc0rn mediante el pack fp16.
- Latencia y throughput: no disponible. El modelo base funciona en 4 pasos, lo que reduce el coste de muestreo, pero no se publican cifras de latencia.

## Comparativa con modelos similares

No se dispone de datos de rendimiento ni de especificaciones de modelos comparables en la información proporcionada. Como referencia estructural, el adaptador se apoya en el modelo base SANA-Video 2.0 5B 720p 4-step de NVIDIA (Apache-2.0, 5B parámetros, generación en 4 pasos), pero no se han publicado comparaciones con otros LoRA de reestilización de vídeo ni con otros modelos de video-to-video en la documentación disponible.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SANA-Video 2.0 Style V2V LoRA (c20) | No disponible (base 5B) | No aplica | 191/200 retención de estilo | Apache-2.0 | Hugging Face |
| SANA-Video 2.0 5B 720p 4-step (base) | 5B | No aplica | No disponible | Apache-2.0 | Hugging Face |
| Otros modelos de video-to-video | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- El adaptador solo está etiquetado para inglés; los prompts de estilo y las instrucciones están redactados en ese idioma.
- Fiabilidad desigual entre estilos: el autor marca como menos fiables arcilla, mármol, grafiti y dibujo de plano; y como los menos fiables marioneta y peluche. Estos tres últimos (marioneta, dibujo de plano y origami) requieren la programación `stage 1` en lugar de `s2x`.
- El entrenamiento se hizo exclusivamente con pares sintéticos generados por el propio modelo base, sin vídeo real ni otros modelos de vídeo; esto puede limitar la generalización a dominios visuales alejados de los datos de entrenamiento.
- Riesgo de deriva de estilo en clips largos o con movimiento complejo, aunque la métrica reportada indica retención alta en el conjunto de evaluación.
- No se documentan sesgos específicos, pero al ser un modelo generativo de vídeo hereda los sesgos del modelo base y de sus datos de entrenamiento, no detallados aquí.
- Licencia Apache-2.0, que permite uso comercial; debe verificarse igualmente la licencia y las condiciones del modelo base SANA-Video 2.0 5B, también Apache-2.0 según la model card.
- No se publican requisitos de hardware, latencia ni consumo de VRAM, lo que dificulta planificar un despliegue en producción.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso comunitario ni validación externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/JoshHughes/sana-video2-style-v2v-lora
- Modelo base: https://huggingface.co/Efficient-Large-Model/SANA-Video_2.0_5B_720p_4step
- Ejemplos de salida (dentro del repositorio): `examples/style_*.mp4`
- Conjunto de evaluación y métricas (dentro del repositorio): `eval/` y `eval/looks.json`
- Loader y sampler: `eval/sana_video2_lora.py`
- Pack fp16 para WebGPU: `p0pc0rn/`
