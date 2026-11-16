# danemarguglio/sprite32

## Resumen

sprite32 1.0 es un modelo de difusión texto-a-imagen especializado en la generación de sprites de 32x32 píxeles en formato RGBA premultiplicado. Lo desarrolla danemarguglio y se distribuye con licencia Apache-2.0 a través de Hugging Face. A diferencia de los modelos de imagen de propósito general, está entrenado desde cero exclusivamente para producir pixel art, iconos, imágenes estilo emoji y texto corto renderizado a muy baja resolución.

El modelo se compone de un UNet2DConditionModel de tres niveles (128/256/512 canales, dos bloques por nivel, self- y cross-attention en cada nivel con QK-norm) de 143,5 millones de parámetros, incluyendo el adaptador de texto. El codificador de texto principal es Qwen3-4B congelado (capa penúltima, hasta 63 tokens) que pasa por un adaptador de dos bloques hacia la cross-attention, complementado con el estado pooled de CLIP ViT-B/32. Se entrenó sobre 653.980 imágenes durante 500.000 pasos en una única RTX 5090 en 20,3 horas.

Existe una variante "1.0 fast" destilada que sustituye el codificador Qwen3-4B por un Qwen3-0.6B afinado y reduce las pasadas del UNet de 70 a 12 por imagen, con una guía fija de 3. La relevancia actual del modelo radica en su nicho muy concreto: generación rápida de assets de pixel art a 32x32 con coherencia de conjuntos (matching sets) y bajo coste computacional (2,6 GiB de VRAM en la versión fast).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | UNet2DConditionModel (diffusers), 3 niveles, 2 bloques por nivel, self- y cross-attention, QK-norm; precondicionamiento EDM |
| Parámetros totales | 143,5 M (UNet + adaptador de texto) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | hasta 63 tokens de texto (Qwen3-4B, capa penúltima) |
| Tipos de cuantización | no disponible (pesos en fp32 para el UNet; fp16 para el Qwen3-0.6B de la versión fast) |
| Idiomas soportados | no disponible (el modelo genera texto corto renderizado en imagen; no se especifican idiomas) |
| Licencia | Apache-2.0 (los codificadores de texto se descargan aparte bajo sus propias licencias) |
| Formato de pesos | safetensors (unet_ema0.9999/, scheduler/, run_config.json) |

## Arquitectura y entrenamiento

El modelo es un UNet de difusión de tres niveles con 128, 256 y 512 canales, dos bloques por nivel y self- y cross-attention en todos ellos con QK-norm. Trabaja sobre imágenes de 32x32 en RGBA premultiplicado y se entrena con precondicionamiento EDM y ponderación de incertidumbre aprendida. La parte de texto combina los estados de tokens de Qwen3-4B (capa penúltima, hasta 63 tokens) procesados por un adaptador de dos bloques hacia la cross-attention, más el estado pooled de CLIP ViT-B/32 añadido al flujo de embedding. Ambos codificadores están congelados. Se usaron etiquetas de calidad y categoría durante el entrenamiento; en muestreo se emplea calidad 5 y sin categoría.

El entrenamiento consistió en 500.000 pasos con batch 128 en una RTX 5090 (20,3 horas), en bf16, con learning rate 1e-4, warmup de 4.000 pasos y cola coseno desde el paso 375.000 hasta el 10%. El dataset contiene 653.980 imágenes de entrenamiento y 6.605 de validación, cada una con una caption corta y una larga (se elige una al azar y se descartan captions el 10% del tiempo para guidance). Las fuentes se muestrean con peso (tamaño de fuente)^0,7, con un tope de 150 extracciones esperadas por imagen y 200 por clúster de casi-duplicados; los iconos negros planos se dibujan en otro color la mitad de las veces cambiando la palabra de color en la caption. La variante fast añade dos destilaciones: un Qwen3-0.6B afinado durante 30.000 pasos para imitar la salida del Qwen3-4B, y una copia del UNet entrenada 40.000 pasos para obtener el resultado guiado en una sola pasada por paso.

## Capacidades

- Generación de imágenes texto-a-imagen de 32x32 píxeles en RGBA premultiplicado.
- Pixel art, iconos, imágenes estilo emoji y texto corto renderizado.
- Conjuntos coherentes (matching sets): `scripts/consistent.py` genera series de sprites que solo difieren en la parte rellenada de una plantilla, partiendo del mismo ruido y promediando la guía en los pasos iniciales.
- Etiquetas de calidad y categoría disponibles en entrenamiento (calidad 5 en muestreo).
- Variante fast con guía integrada (guidance fija en 3, no modificable al muestrear).
- No se documentan tool calling, function calling, capacidades de agente, razonamiento multi-paso ni modalidades de audio o vídeo.

## Casos de uso

- Generación de assets para videojuegos 2D: producción rápida de sprites de 32x32 para prototipos y juegos indie, con 0,88 s por sprite en RTX 5090 o 0,16 s en la versión fast.
- Creación de iconos y emoji personalizados: el modelo genera iconos y estilo emoji a 32x32, adecuado para interfaces de baja resolución y sets de iconografía coherentes.
- Conjuntos de sprites coherentes para variantes: mediante `consistent.py` se generan series (por ejemplo, señales con distintas letras) que comparten marco y estilo, útil para juegos de cartas, insignias o menús.
- Generación de texto corto renderizado: el modelo escribe cadenas cortas en imagen (41,1% de acierto exacto en 60 cadenas de prueba), útil para etiquetas, botones y carteles en pixel art.
- Prototipado rápido en CPU: la versión fast genera un sprite en 0,70 s en una CPU de 16 núcleos con 2,6 GiB de memoria pico, lo que permite iterar sin GPU.
- Automatización de pipelines de assets: integrable vía diffusers y el repositorio del autor para generar lotes de sprites con semillas controladas y selección automática por coherencia.
- Generación de iconos planos recolorables: el entrenamiento con iconos negros recoloreados la mitad de las veces permite pedir variantes de color mediante la caption.

## Benchmarks y rendimiento

Evaluación sobre un conjunto held-out de 5.000 imágenes no vistas, con 10.000 muestras por modelo y sus propios ajustes de muestreo (una sola ejecución por modelo):

| Medida | 1.0 | 1.0 fast |
|---|---:|---:|
| FID, captions largas | 6,61 | 6,88 |
| FID, captions cortas | 7,31 | 7,52 |
| CLIP score, largas / cortas | 27,03 / 26,52 | 27,00 / 26,42 |
| Cadenas held-out escritas exactamente (60 cadenas, 1.376 muestras) | 41,1% | 39,5% |
| Cadenas escritas exactamente en al menos una muestra | 85% | 80% |
| Pares de semillas casi idénticos (50 prompts, 8 semillas) | 3,6% | 0,9% |
| Muestras dentro de RMSE 10 de un objetivo | dato truncado en la model card | dato truncado en la model card |

Rendimiento de muestreo declarado por el autor:

| Métrica | 1.0 | 1.0 fast |
|---|---:|---:|
| Un sprite en RTX 5090 | 0,88 s | 0,16 s |
| Un sprite en CPU de 16 núcleos | 4,0 s | 0,70 s |
| Memoria GPU pico | 9,1 GiB | 2,6 GiB |
| Descarga con codificadores de texto | ~8,7 GB | ~2,3 GB |
| Pasos de muestreo | 35 (DPM-Solver++ 2M, guidance 3) | 12 (DPM-Solver++ 2M, guidance integrada) |

Con Qwen3-4B como codificador, 12 pasos puntúan aproximadamente igual que 35 (FID 6,83/7,39 frente a 7,02/7,64); 8 pasos empeoran visiblemente (11,28/10,65).

## Requisitos de hardware

- VRAM estimada: 9,1 GiB pico para la versión 1.0; 2,6 GiB pico para la versión 1.0 fast.
- GPU recomendadas: RTX 5090 para el rendimiento declarado; cualquier GPU con al menos ~10 GiB para la versión completa y ~3 GiB para la fast.
- Cabe en GPU de consumo: sí, ambas versiones; la fast con margen amplio en tarjetas de 4-6 GiB.
- CPU: la versión fast genera un sprite en 0,70 s en 16 núcleos, lo que permite inferencia sin GPU.
- Opciones de despliegue: diffusers (pipeline text-to-image) y el script `hf_sample.py` del repositorio del autor; no se documentan vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo de difusión de imagen).
- Latencia y throughput: 0,88 s/sprites (1.0) y 0,16 s/sprites (fast) en RTX 5090; 4,0 s y 0,70 s respectivamente en CPU de 16 núcleos.

## Comparativa con modelos similares

No se dispone de datos de benchmarks comparativos con otros modelos de pixel art o de difusión de imagen en la información proporcionada. Se indica "no disponible" para los campos de rendimiento frente a alternativas; la model card solo compara internamente las versiones 1.0 y 1.0 fast.

| Modelo | Parámetros | Contexto de texto | Resolución | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| sprite32 1.0 | 143,5 M (UNet + adaptador) | 63 tokens | 32x32 RGBA | Apache-2.0 | Hugging Face |
| sprite32 1.0 fast | 143,5 M + Qwen3-0.6B (596 M) | 63 tokens | 32x32 RGBA | Apache-2.0 | Hugging Face |
| Alternativas de pixel art | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Especialización extrema: solo genera imágenes de 32x32 píxeles; no sirve para resoluciones mayores ni para imágenes fotorrealistas.
- El texto renderizado no es fiable: solo el 41,1% de las cadenas de prueba se escriben exactamente (85% en al menos una muestra de varias), por lo que requiere selección por muestreo.
- Los conjuntos coherentes funcionan mejor con letras y colores; los objetos que difieren en forma comparten menos y pueden salir mal (el autor cita una llave que salió como otra cosa).
- El codificador de texto de la versión fast solo vio las captions de entrenamiento, por lo que prompts muy distintos están menos cubiertos; el autor indica que esto no se ha medido.
- La guía de la versión fast está fija en 3 y no puede cambiarse al muestrear.
- Los codificadores de texto (Qwen3-4B, CLIP ViT-B/32) se descargan aparte bajo sus propias licencias y no están incluidos en el repositorio del modelo completo.
- Riesgo de alucinación y sesgos: no se documentan análisis específicos de sesgos en la model card; el dataset proviene de fuentes muestreadas con ponderación, sin análisis de composición publicado más allá del datasheet.
- Los resultados de benchmarks provienen de una sola ejecución por modelo, por lo que diferencias pequeñas entre columnas pueden ser ruido.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ecosistema y validación comunitaria inexistentes.
- Licencia Apache-2.0 permite uso comercial, pero conviene verificar las licencias de los codificadores de texto externos.

## Enlaces

- Hugging Face: https://huggingface.co/danemarguglio/sprite32
- Repositorio de código: https://github.com/danemarguglio/sprite32
- Codificador de texto principal: https://huggingface.co/Qwen/Qwen3-4B
- Codificador de texto de la versión fast: https://huggingface.co/Qwen/Qwen3-0.6B
- Codificador CLIP: https://huggingface.co/openai/clip-vit-base-patch32
- Documentación interna citada en la model card: `DATASHEET.md`, `BENCHMARK.md`, `samples.md` (en el repositorio de código)
