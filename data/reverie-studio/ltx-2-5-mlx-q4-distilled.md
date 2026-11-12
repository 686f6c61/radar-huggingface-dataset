# reverie-studio/ltx-2.5-mlx-q4-distilled

## Resumen

LTX-2.5 distilled en formato MLX con cuantización int4 es un espejo del repositorio `dgrauet/ltx-2.5-mlx-q4`, publicado por Reverie Studio para que su aplicación pueda descargar los pesos sin requerir una cuenta de Hugging Face. Se trata de una conversión a MLX del modelo original Lightricks/LTX-2.5, cuantizada a int4 con tamaño de grupo 64 mediante la herramienta mlx-forge, y orientada a la generación de vídeo a partir de texto e imagen en Apple Silicon. El repositorio contiene únicamente el transformer destilado, sin el transformer dev ni el LoRA destilado presentes en el repositorio original de dgrauet.

El modelo resuelve la inferencia de vídeo generativo en hardware Apple (chips de la serie M) mediante el framework MLX, que aprovecha la memoria unificada y los aceleradores neuronales de estos equipos. La cuantización int4 reduce el peso del repositorio a 30,5 GB, lo que lo hace manejable en configuraciones de memoria unificada alta, aunque sigue siendo un modelo considerable para equipos de consumo.

La relevancia actual radica en la combinación de un modelo de vídeo de última generación (LTX-2.5) con un ecosistema de inferencia nativo para Apple Silicon, lo que permite a desarrolladores y creadores ejecutar generación de vídeo localmente sin depender de GPUs NVIDIA ni de servicios en la nube. La licencia comunitaria de LTX-2.x impone restricciones de uso comercial para entidades con ingresos anuales iguales o superiores a 10 millones de dólares.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusión para vídeo (LTX-2.5), convertido a MLX |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int4 con tamaño de grupo 64 |
| Idiomas soportados | no disponible |
| Licencia | LTX-2.x Community License Agreement (license: other) |
| Formato de pesos | safetensors (MLX), cuantizado int4 |

## Arquitectura y entrenamiento

El modelo subyacente es Lightricks/LTX-2.5, un modelo de difusión para generación de vídeo (texto a vídeo e imagen a vídeo), del que este repositorio incluye únicamente el transformer destilado. La conversión a MLX y la cuantización int4 (grupo 64) fueron realizadas por dgrauet con mlx-forge; Reverie Studio no ha modificado los pesos, solo los replica. No se dispone de información sobre el número de parámetros, la composición del dataset de entrenamiento, el número de tokens de vídeo/texto empleados ni sobre si hubo etapas de RLHF o DPO. La variante destilada implica un proceso de destilación (probablemente de un modelo profesor de mayor capacidad) para reducir el número de pasos de muestreo, pero los detalles técnicos de dicho proceso no están disponibles en la información proporcionada. La innovación principal de este repositorio es la disponibilidad de los pesos en formato MLX cuantizado, lo que permite ejecutar el modelo en Apple Silicon con el runner `ltx-2-mlx` usando el flag `--distilled`.

## Capacidades

- Generación de vídeo a partir de texto (text-to-video) con resolución configurable, por ejemplo 1280x704 y 121 fotogramas a 24 fps según el ejemplo de uso.
- Generación de vídeo a partir de imagen (image-to-video), indicado por el pipeline del repositorio.
- Ejecución local en Apple Silicon mediante MLX, sin necesidad de GPU NVIDIA.
- Modo destilado para inferencia con menos pasos de muestreo (según el flag `--distilled` del runner).
- No se dispone de información sobre soporte de tool calling, agentes, razonamiento multi-paso, capacidades multilingües explícitas, audio o visión más allá de la entrada de imagen para image-to-video.

## Casos de uso

- Generación de vídeo local en equipos Apple Silicon: un creador puede ejecutar `ltx-2-mlx generate --distilled` con los pesos de este repositorio para producir clips de 121 fotogramas a 24 fps y 1280x704 sin conexión a internet ni cuentas en la nube, aprovechando la memoria unificada del chip.
- Prototipado rápido de ideas visuales: guionistas y diseñadores pueden convertir descripciones textuales en vídeos de prueba para validar conceptos antes de una producción formal, usando el modo destilado para reducir tiempos de inferencia.
- Animación de imágenes fijas: el pipeline image-to-video permite dar movimiento a ilustraciones o fotografías, útil en marketing y redes sociales para crear contenido animado a partir de material estático.
- Integración en aplicaciones de escritorio: Reverie Studio utiliza este espejo para que su app descargue los pesos automáticamente sin requerir autenticación en Hugging Face, lo que simplifica la experiencia de usuario final en macOS.
- Investigación en generación de vídeo sobre MLX: académicos y desarrolladores pueden estudiar el comportamiento de un modelo de difusión de vídeo cuantizado a int4 en hardware Apple, comparando calidad y velocidad frente a versiones en FP16 o en otras plataformas.
- Creación de contenido para previsualización en pipelines de postproducción: los clips generados pueden servir como animáticas o referencias de movimiento antes de rodar o renderizar la versión final con herramientas tradicionales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: el repositorio ocupa 30,5 GB en int4, por lo que se necesita un equipo Apple Silicon con al menos 32 GB de memoria unificada para cargar los pesos, y preferablemente 64 GB o más para margen durante la inferencia y el almacenamiento de activaciones.
- GPU recomendadas: chips Apple M-series (M1 Pro/Max/Ultra, M2 Pro/Max/Ultra, M3 Pro/Max/Ultra, M4 Pro/Max) con memoria unificada suficiente; no aplica a GPUs NVIDIA o AMD en este formato.
- ¿Cabe en GPU de consumo? No en GPUs discretas convencionales; sí en equipos Apple Silicon de gama alta con memoria unificada de 32 GB o superior.
- Opciones de despliegue: el runner `ltx-2-mlx` (repositorio github.com/dgrauet/ltx-2-mlx) con el flag `--distilled`; el formato MLX no es compatible directamente con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| reverie-studio/ltx-2.5-mlx-q4-distilled | no disponible | no disponible | MLX safetensors int4 | LTX-2.x Community License | Hugging Face (este repo) |
| dgrauet/ltx-2.5-mlx-q4 | no disponible | no disponible | MLX safetensors int4 | LTX-2.x Community License | Hugging Face (repo base) |
| Lightricks/LTX-2.5 | no disponible | no disponible | safetensors (original) | LTX-2.x Community License | Hugging Face (modelo original) |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada. La diferencia principal entre el repositorio actual y `dgrauet/ltx-2.5-mlx-q4` es que este último incluye también el transformer dev y el LoRA destilado, mientras que el espejo de Reverie solo contiene el transformer destilado.

## Limitaciones y advertencias

- Licencia restrictiva: la LTX-2.x Community License Agreement exige una licencia comercial de pago a Lightricks para entidades con ingresos anuales iguales o superiores a 10 millones de dólares, para cualquier uso que no sea estrictamente no comercial.
- Se aplican las restricciones de uso de la Sección 4 y el Anexo A, así como la Acceptable Use Policy de Lightricks (actualizada el 3 de noviembre de 2026).
- El repositorio solo contiene el transformer destilado; no incluye el transformer dev ni el LoRA destilado del repositorio original, por lo que no se pueden reproducir flujos que requieran esos componentes.
- Riesgo de alucinación visual y artefactos propios de los modelos de difusión de vídeo, especialmente en movimientos complejos, texto en escena o coherencia temporal prolongada; no se dispone de evaluaciones cuantitativas.
- Idiomas soportados no especificados; no hay información sobre calidad multilingüe en los prompts.
- Requiere hardware Apple Silicon con memoria unificada alta (32 GB o más) y el runner específico `ltx-2-mlx`; no es portable a otros stacks de inferencia sin conversión adicional.
- Repositorio con 0 descargas y 0 likes en el momento de la ficha, lo que indica que es un espejo recién publicado y sin validación comunitaria.
- No está afiliado ni respaldado por Lightricks; los pesos son derivados modificados (convertidos a MLX y cuantizados) por dgrauet.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/reverie-studio/ltx-2.5-mlx-q4-distilled
- Repositorio base: https://huggingface.co/dgrauet/ltx-2.5-mlx-q4
- Modelo original: https://huggingface.co/Lightricks/LTX-2.5
- Runner MLX: https://github.com/dgrauet/ltx-2-mlx
- Herramienta de conversión: https://github.com/dgrauet/mlx-forge
- Licencia LTX-2.x: https://github.com/Lightricks/LTX-2/blob/main/LICENSE-2_x
- Acceptable Use Policy: https://static.lightricks.com/legal/ltx-acceptable-use-policy.pdf
