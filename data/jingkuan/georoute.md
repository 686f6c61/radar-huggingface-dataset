# Jingkuan/GeoRoute

## Resumen

GeoRoute es un método de generación de vídeo a partir de texto (text-to-video) presentado por el autor Jingkuan en el repositorio `Jingkuan/GeoRoute` de Hugging Face. El repositorio no contiene un modelo completo, sino un checkpoint de inferencia parcial (`georoute-split-grad-step11000.ckpt`, de aproximadamente 175 MB) que debe combinarse con modelos base externos: Wan2.1-T2V-1.3B como generador de vídeo, TRELLIS y CLIP. El pipeline declarado en Hugging Face es `text-to-video` y la licencia es Apache 2.0.

El modelo resuelve la síntesis de vídeo condicionada por texto, presumiblemente con un componente de enrutamiento geométrico o espacial (el nombre "GeoRoute" sugiere un mecanismo de guiado geométrico durante la difusión), aunque la model card no detalla la arquitectura interna ni los datos de entrenamiento. Se trata de un artefacto de investigación con cero descargas y cero likes en el momento de la consulta, publicado el 24 de noviembre de 2026.

La relevancia es limitada para producción: es un checkpoint intermedio (paso 11.000) de un trabajo académico, con documentación mínima en chino y dependencia de un repositorio de código alojado en Gitee. Resulta útil para reproducir los resultados del paper y para evaluar con el benchmark propio GeoVideoBench, no como modelo listo para despliegue.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (método de difusión para text-to-video sobre Wan2.1-T2V-1.3B; detalles no publicados en la model card) |
| Parámetros totales | no disponible (el checkpoint propio pesa ~175 MB; el modelo base Wan2.1-T2V-1.3B aporta 1.300 millones de parámetros) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (entrenamiento e inferencia en BF16 según requisitos de CUDA) |
| Idiomas soportados | no disponible (los prompts de ejemplo y la documentación están en chino) |
| Licencia | Apache 2.0 |
| Formato de pesos | `.ckpt` (checkpoint; no se distribuye en safetensors ni GGUF) |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna de GeoRoute. Por los requisitos de ejecución se deduce que es un método de generación de vídeo por difusión que se apoya en Wan2.1-T2V-1.3B como modelo base, con TRELLIS y CLIP como componentes auxiliares (probablemente para representación 3D/geométrica y codificación de texto, respectivamente). El checkpoint publicado corresponde al paso 11.000 de entrenamiento y se carga junto a los modelos base, que el script `run.sh` descarga automáticamente y verifica mediante SHA-256.

El entrenamiento se realiza sobre el conjunto OpenVidHD, según el comando de entrenamiento documentado (`GPUS=1 ./run.sh train /path/to/openvidHD outputs/train`), que espera un directorio con un fichero `1.csv` y subdirectorios de vídeos. No se especifican el número de tokens, la composición exacta del dataset, ni si se aplicaron técnicas de alineación como RLHF o DPO. Tampoco se documentan innovaciones de decodificación especulativa ni mecanismos de atención lineal.

## Capacidades

- Generación de vídeo a partir de prompts de texto (text-to-video synthesis), tarea principal declarada en el pipeline.
- Integración con el modelo base Wan2.1-T2V-1.3B para producir vídeos en formato MP4.
- Evaluación automática mediante GeoVideoBench, un benchmark propio del autor que genera `per_video.csv`, `per_video.jsonl` y `summary.json`.
- Ejecución de inferencia por lotes a partir de un fichero de prompts (una línea por prompt).
- Entrenamiento reproducible sobre OpenVidHD con el script proporcionado.
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-step, visión, audio ni modo thinking.

## Casos de uso

- Reproducción de resultados de investigación: ejecutar `./run.sh demo` para generar el vídeo del prompt de ejemplo (un hombre tocando la guitarra) y verificar que el checkpoint del paso 11.000 produce las salidas esperadas del paper.
- Evaluación comparativa con GeoVideoBench: usar `./run.sh benchmark` sobre un directorio de MP4 para obtener métricas por vídeo y un resumen agregado, útil para comparar variantes del método.
- Generación por lotes de clips de prueba: pasar un fichero de prompts con `./run.sh infer configs/demo-prompts.txt outputs/infer` para producir un conjunto de vídeos de validación cualitativa.
- Reentrenamiento o ajuste fino: usar `GPUS=1 ./run.sh train /path/to/openvidHD outputs/train` sobre OpenVidHD para adaptar el método a un dominio concreto o continuar el entrenamiento desde el paso 11.000.
- Estudio del efecto del guiado geométrico: comparar las salidas de GeoRoute con las de Wan2.1-T2V-1.3B sin el componente GeoRoute para aislar la contribución del método.
- Docencia y experimentación en generación de vídeo: entorno controlado con requisitos acotados (Linux x86_64, Python 3.10, CUDA 12.4, GPU NVIDIA con BF16) para demostrar pipelines de difusión text-to-video.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente menciona la existencia de GeoVideoBench como herramienta de evaluación propia, sin incluir cifras.

## Requisitos de hardware

- GPU NVIDIA con soporte de BF16 (requisito explícito de la model card); no se especifica VRAM mínima.
- El modelo base Wan2.1-T2V-1.3B (1.300 millones de parámetros) más TRELLIS y CLIP condicionan el consumo; como referencia orientativa, un modelo de 1.300 millones en BF16 ocupa unos 2,6 GB solo en pesos, a lo que hay que sumar activaciones y los componentes auxiliares. La cifra exacta de VRAM no está disponible.
- No se confirma que quepa en GPU de consumo; la model card no menciona modelos concretos como RTX 4090, A100 o H100.
- Sistema operativo: Linux x86_64. Software: Python 3.10, CUDA 12.4 Toolkit, Git, curl, herramientas de compilación de C++ y FFmpeg.
- Despliegue mediante los scripts del repositorio Gitee (`run.sh` con subcomandos `demo`, `infer`, `benchmark`, `train`); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| GeoRoute (este) | no disponible (checkpoint de ~175 MB + base Wan2.1-T2V-1.3B de 1,3B) | no disponible | Apache 2.0 | `.ckpt` | Hugging Face + código en Gitee |
| Wan2.1-T2V-1.3B | 1.300 millones | no disponible | no disponible en la información proporcionada | no disponible | Modelo base referenciado por GeoRoute |
| Alternativas text-to-video de tamaño similar | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento ni de especificaciones completas de los modelos comparables en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa.

## Limitaciones y advertencias

- La model card está redactada en chino y es muy escueta: no documenta arquitectura, datos de entrenamiento, sesgos ni limitaciones.
- Es un checkpoint intermedio (paso 11.000), no una versión final; su calidad puede no representar el estado final del método.
- Depende de modelos base externos (Wan2.1-T2V-1.3B, TRELLIS, CLIP) cuyas licencias deben verificarse por separado antes de uso comercial, aunque el checkpoint propio sea Apache 2.0.
- El código oficial reside en Gitee, no en GitHub, lo que puede dificultar la integración en flujos de trabajo habituales y la auditoría comunitaria.
- Cero descargas y cero likes: sin validación independiente por parte de la comunidad.
- Riesgo de alucinación visual y de artefactos propios de la difusión de vídeo; no cuantificado en la documentación.
- No se especifican idiomas soportados para los prompts; los ejemplos están en chino.
- El repositorio tiene un tamaño de 0,2 GB, insuficiente para contener todos los modelos base, que se descargan en tiempo de ejecución.
- No hay información sobre sesgos demográficos, culturales o de contenido.

## Enlaces

- Hugging Face: https://huggingface.co/Jingkuan/GeoRoute
- Repositorio de código oficial (Gitee): https://gitee.com/jianzhiliu/geo-route
- README del repositorio: https://gitee.com/jianzhiliu/geo-route/blob/master/README.md
- Paper: no disponible en la información proporcionada
- Demo: no disponible en la información proporcionada
