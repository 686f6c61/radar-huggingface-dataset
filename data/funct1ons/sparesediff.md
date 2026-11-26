# Funct1ons/SpareseDiff

## Resumen

SpareseDiff es una colección de checkpoints de inferencia para demosaicing mediante difusión condicional, es decir, la reconstrucción de una imagen en color completo a partir de los datos en bruto (RAW) capturados por un sensor con un patrón de filtro de color (CFA). El modelo está desarrollado por el usuario Funct1ons y publicado en Hugging Face junto con un repositorio de código en GitHub que contiene las instrucciones de instalación y las órdenes de inferencia.

La propuesta resulta relevante porque cubre dos familias de CFA distintas: el patrón Bayer clásico (GBRG) y un patrón Sparse RGBW, este último habitual en sensores que sacrifican resolución de color por sensibilidad. Además, ofrece variantes entrenadas solo con iluminación normal y variantes entrenadas con iluminación normal más luz baja simulada, lo que permite elegir el checkpoint según las condiciones de captura previstas.

El repositorio ocupa 2,6 GB e incluye cuatro checkpoints en formato safetensors, cada uno con su `config.json` de entrenamiento asociado y un fichero `checksums.sha256` para verificación de integridad. La arquitectura se apoya en el backbone JiT-B/16 inicializado desde el checkpoint preentrenado upstream. No se dispone de información sobre licencia de los pesos, idiomas ni pipeline declarado en Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Difusión condicional con backbone JiT-B/16 (inicializado desde el checkpoint preentrenado upstream) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de imagen, no de texto) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan variantes cuantizadas) |
| Idiomas soportados | no disponible (modelo de restauración de imagen, sin interfaz de texto) |
| Licencia | no disponible para los pesos; la licencia MIT del repositorio de código no se aplica a los ficheros de pesos |
| Formato de pesos | safetensors (`model.safetensors` por checkpoint) |

Checkpoints incluidos:

| Checkpoint | Iluminación de entrenamiento | Fichero de pesos |
|---|---|---|
| `bayer_normal` | Normal | `bayer_normal/model.safetensors` |
| `sparse_normal` | Normal | `sparse_normal/model.safetensors` |
| `bayer_mixed` | Normal y luz baja simulada | `bayer_mixed/model.safetensors` |
| `sparse_mixed` | Normal y luz baja simulada | `sparse_mixed/model.safetensors` |

## Arquitectura y entrenamiento

SpareseDiff es un modelo de difusión condicional aplicado a demosaicing. La tarea consiste en recuperar una imagen RGB a partir de una imagen RAW submuestreada según un patrón de filtro de color, un problema inverso mal condicionado en el que la difusión aporta un prior generativo sobre la distribución de imágenes naturales. El backbone es JiT-B/16, inicializado desde el checkpoint preentrenado upstream del proyecto JiT, lo que indica un transformer con parches de 16×16 y una variante de tamaño "B" (base).

El entrenamiento se organiza en dos ejes: el tipo de CFA (Bayer GBRG frente a Sparse RGBW) y las condiciones de iluminación (solo normal frente a normal más luz baja simulada). Cada checkpoint incluye su `config.json` de entrenamiento, aunque el repositorio no documenta el volumen de datos, la composición del dataset ni si se emplearon técnicas de ajuste adicional como RLHF o DPO, que en un modelo de imagen no resultarían aplicables en su forma habitual. Los ficheros publicados son pesos de inferencia y no permiten reanudar el entrenamiento.

## Capacidades

- Reconstrucción de imagen en color (demosaicing) a partir de datos RAW con patrón Bayer GBRG.
- Reconstrucción de imagen en color a partir de datos RAW con patrón Sparse RGBW.
- Variantes específicas para condiciones de iluminación normal y para escenarios mixtos con luz baja simulada.
- Generación condicional mediante difusión, lo que permite muestrear la imagen latente o en píxeles condicionada a la observación RAW.
- Verificación de integridad de los pesos mediante SHA-256.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, texto, visión general, audio ni modo de pensamiento.

## Casos de uso

- Procesamiento de RAW en cámaras con sensor Bayer: el checkpoint `bayer_normal` reconstruye la imagen RGB completa a partir del mosaico GBRG, integrándose en el pipeline de revelado previo a la reducción de ruido y al balance de blancos.
- Cámaras con sensor Sparse RGBW: el checkpoint `sparse_normal` está entrenado específicamente para este patrón, que no se cubre con los algoritmos de demosaicing convencionales pensados para Bayer.
- Fotografía con poca luz: las variantes `*_mixed` incorporan luz baja simulada en el entrenamiento, lo que las hace adecuadas para capturas nocturnas o en interiores donde el demosaicing clásico amplifica el ruido de crominancia.
- Investigación en problemas inversos de imagen: el modelo sirve como referencia para comparar priors generativos de difusión frente a métodos deterministas en demosaicing, con checkpoints separados por condición para aislar el efecto de la iluminación.
- Evaluación de pipelines de sensores: permite medir el impacto del patrón CFA y de las condiciones de luz en la calidad de reconstrucción antes de fijar una configuración de hardware.
- Prototipado de reveladores RAW: al ser pesos de inferencia con configuración asociada, se pueden desplegar en un servicio de procesado por lotes para generar imágenes de referencia a partir de un conjunto de RAW.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio completo ocupa 2,6 GB e incluye cuatro checkpoints; el tamaño por checkpoint no se detalla, por lo que no puede estimarse la huella en memoria con precisión.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible; el backbone JiT-B/16 es un transformer de tamaño base, pero no se documenta el consumo real.
- Opciones de despliegue: el autor remite al repositorio de código de SpareseDiff para instalación e inferencia; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que además no aplican a un modelo de difusión de imagen.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de rendimiento ni referencias a otros modelos de demosaicing con los que establecer una comparación cuantitativa.

## Limitaciones y advertencias

- Licencia de los pesos no disponible: la licencia MIT del repositorio de código no cubre los ficheros de pesos, por lo que el uso comercial requiere aclaración previa con el autor.
- Modelo de nicho: solo cubre demosaicing sobre Bayer GBRG y Sparse RGBW; no es un modelo de propósito general ni acepta texto.
- Entrenamiento con luz baja simulada: las variantes `*_mixed` emplean luz baja simulada, no capturas reales, lo que puede introducir una brecha de dominio respecto a imágenes nocturnas reales.
- Sin datos de evaluación publicados: no hay benchmarks que permitan estimar la calidad de reconstrucción ni compararla con alternativas.
- Riesgo de artefactos generativos: al tratarse de un modelo de difusión, la reconstrucción puede introducir detalles plausibles pero no presentes en la escena original.
- Pesos de inferencia únicamente: no permiten reanudar el entrenamiento ni ajuste fino directo sin trabajo adicional.
- Sin información sobre sesgos, idiomas ni pipeline en Hugging Face; la ficha del repositorio es mínima y remite al código para cualquier detalle operativo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Funct1ons/SpareseDiff
- Repositorio de código: https://github.com/funct1ons/SpareseDiff
- Backbone JiT: https://github.com/LTH14/JiT
