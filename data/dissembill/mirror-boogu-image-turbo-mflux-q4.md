# dissembill/mirror-boogu-image-turbo-mflux-q4

## Resumen

`dissembill/mirror-boogu-image-turbo-mflux-q4` es una conversión comunitaria del modelo de generación de imágenes Boogu-Image-0.1-Turbo al formato MFlux con cuantización Q4 (4 bits), pensada para ejecutarse localmente en Macs con Apple Silicon mediante MLX. No es un modelo original: es un espejo (mirror) de la conversión de MFlux-Community, que a su vez deriva del modelo base `Boogu/Boogu-Image-0.1-Turbo`. El repositorio ocupa 11,3 GB y contiene pesos en safetensors adaptados al runtime mflux.

El interés de esta variante está en el tamaño reducido frente al BF16 original (35,9 GB): la cuantización Q4 permite cargar el modelo completo —encoder de texto, transformer y VAE— en equipos con memoria unificada modesta, sin necesidad de usar el flag `--quantize`, ya que el nivel de cuantización está embebido en los pesos. La licencia Apache 2.0 del modelo original se mantiene.

La información pública disponible es muy limitada: no hay datos sobre arquitectura interna, número de parámetros, proceso de entrenamiento ni benchmarks. Todo lo que se puede afirmar con rigor se limita a la cadena de conversión, el formato y el procedimiento de uso con MFlux.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de difusión text-to-image; detalles internos no publicados) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no aplica en el sentido de LLM; el condicionamiento es por prompt de texto) |
| Tipos de cuantizacion | Q4 (MLX affine quantization de 4 bits aplicada a encoder de texto, transformer y VAE); existen variantes BF16, Q8, Q6, Q5 y Q3 en MFlux-Community |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base Boogu-Image-0.1-Turbo: la model card de esta conversión no detalla el tipo de backbone (UNet, DiT u otro), el número de parámetros, los datos de entrenamiento ni si hubo etapas de ajuste fino o preferencias. Lo único documentado es el proceso de conversión: los pesos originales se han transformado a MLX y cuantizado con cuantización afín de 4 bits en tres componentes (encoder de texto, transformer y VAE), con el nivel de cuantización almacenado en los propios pesos.

La conversión fue realizada el 21 de agosto de 2026 por MFlux-Community y este repositorio es un espejo de esa conversión. MFlux es el runtime de código abierto de Filip Strand que ejecuta modelos generativos de imagen en MLX nativo sobre Apple Silicon. No se documenta ninguna innovación técnica adicional (decodificación especulativa, atención lineal, destilación de pasos, etc.) más allá del sufijo "Turbo" del nombre, que en la práctica habitual de la familia sugiere pocos pasos de inferencia, aunque esto no se confirma en la información disponible.

## Capacidades

- Generación de imágenes a partir de prompts de texto (pipeline `text-to-image`).
- Ejecución local en Apple Silicon mediante MLX, sin dependencia de servicios en la nube.
- Control de resolución de salida mediante parámetros de anchura y altura (el ejemplo oficial usa 1024×1024).
- Reproducibilidad mediante semilla (`--seed`).
- Carga automática de pesos desde Hugging Face en el primer uso, o descarga previa con `hf download`.
- No se documentan capacidades de edición de imagen, inpainting, control por imagen de referencia, tool calling ni agentes; son funcionalidades propias de modelos de lenguaje y no aplican aquí.
- Capacidades multilingües del prompt: no disponibles (no se especifica qué idiomas entiende el encoder de texto).

## Casos de uso

- Generación de ilustraciones para prototipos de producto: el modelo permite crear imágenes de referencia a 1024×1024 en local, útil para equipos de diseño que trabajan en Mac y no quieren enviar prompts a APIs externas.
- Creación de assets para documentación técnica: diagramas conceptuales o imágenes de portada generadas con semilla fija, lo que facilita reproducir el mismo resultado en distintas ejecuciones del pipeline.
- Experimentación e investigación en generación de imágenes: al ser una conversión cuantizada a 4 bits, sirve para estudiar el impacto de la cuantización en la calidad visual comparando esta variante Q4 con las versiones Q5, Q6, Q8 y BF16 del mismo modelo.
- Flujos creativos offline en portátiles Apple Silicon: el tamaño de 11,3 GB permite trabajar sin conexión en un MacBook con memoria unificada suficiente, integrando la generación en scripts propios mediante la CLI de MFlux.
- Generación por lotes en pipelines locales: la invocación por línea de comandos (`mflux-generate-boogu`) con parámetros de prompt, tamaño y semilla se puede encadenar en scripts para producir variaciones sistemáticas de una misma idea.
- Evaluación comparativa de runtimes: útil para equipos que comparan MLX/MFlux con otras implementaciones (Diffusers, ComfyUI) en cuanto a velocidad y fidelidad sobre hardware Apple.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/memoria: el repositorio pesa 11,3 GB; se necesita memoria unificada suficiente para cargar los pesos más el overhead del runtime MLX. Como referencia orientativa de la propia tabla del autor, la variante BF16 ocupa 35,9 GB y la Q3 9,1 GB.
- Hardware objetivo: Apple Silicon exclusivamente (MLX no se ejecuta de forma nativa en GPU NVIDIA ni AMD).
- GPU recomendadas: no se especifican modelos concretos de chip Apple; no hay datos de compatibilidad por generación (M1, M2, M3, M4) en la información disponible.
- GPU de consumo: no aplica en el sentido habitual (RTX 4090, etc.); el modelo está pensado para Macs, no para GPUs discretas NVIDIA.
- Opciones de despliegue: MFlux (CLI `mflux-generate-boogu`), instalable con `uv tool install --upgrade mflux`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que además no son runtimes aplicables a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (Boogu-Image-Turbo MFlux Q4) | no disponible | no aplica | Q4 (11,3 GB) | Apache 2.0 | Hugging Face (espejo comunitario) |
| boogu-image-turbo-mflux-bf16 | no disponible | no aplica | BF16 (35,9 GB) | Apache 2.0 | Hugging Face (MFlux-Community) |
| boogu-image-turbo-mflux-q8 | no disponible | no aplica | Q8 (20,3 GB) | Apache 2.0 | Hugging Face (MFlux-Community) |
| boogu-image-turbo-mflux-q3 | no disponible | no aplica | Q3 (9,1 GB) | Apache 2.0 | Hugging Face (MFlux-Community) |

No se dispone de datos de rendimiento ni de comparaciones con modelos de otras familias (por ejemplo, otros text-to-image ejecutables en MLX), por lo que la comparativa se limita a las variantes de cuantización del mismo modelo.

## Limitaciones y advertencias

- Es una conversión comunitaria, no una publicación oficial de los autores de Boogu-Image-0.1-Turbo; la calidad final depende tanto del modelo base como del proceso de cuantización.
- La cuantización Q4 introduce pérdida de precisión respecto a BF16; no hay datos publicados que cuantifiquen esa degradación en calidad visual.
- Solo funciona en Apple Silicon con MLX; no es portable a GPUs NVIDIA ni a entornos de servidor x86 convencionales.
- No hay información sobre sesgos del modelo base, idiomas soportados por el encoder de texto ni comportamiento con prompts en castellano.
- Riesgo de alucinación visual y de artefactos propios de modelos de difusión cuantizados: no se documenta ninguno en concreto.
- Aunque la licencia es Apache 2.0, la model card remite a la del modelo original para "términos completos y posibles restricciones de uso"; conviene revisar la ficha de `Boogu/Boogu-Image-0.1-Turbo` antes de un uso comercial.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y es un espejo de otro repositorio; para producción conviene preferir la fuente original de MFlux-Community.
- No se documentan requisitos mínimos de memoria unificada por chip; el usuario debe validar que su Mac puede cargar 11,3 GB de pesos más el overhead del runtime.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/dissembill/mirror-boogu-image-turbo-mflux-q4
- Modelo base: https://huggingface.co/Boogu/Boogu-Image-0.1-Turbo
- Conversión original BF16: https://huggingface.co/mflux-community/boogu-image-turbo-mflux-bf16
- Conversión Q8: https://huggingface.co/mflux-community/boogu-image-turbo-mflux-q8
- Conversión Q6: https://huggingface.co/mflux-community/boogu-image-turbo-mflux-q6
- Conversión Q5: https://huggingface.co/mflux-community/boogu-image-turbo-mflux-q5
- Conversión Q3: https://huggingface.co/mflux-community/boogu-image-turbo-mflux-q3
- Repositorio de MFlux: https://github.com/filipstrand/mflux
- Organización MFlux-Community: https://huggingface.co/mflux-community
