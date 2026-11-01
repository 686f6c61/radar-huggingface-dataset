# mflux-community/iris-3b-turbo-mflux-q5

## Resumen

Iris-3B-Turbo MFlux Q5 es una conversión cuantizada a 5 bits del modelo de generación de imágenes speridlabs/iris-3b, empaquetada en formato MLX para su ejecución nativa en Apple Silicon. No se trata de un modelo original, sino de una adaptación comunitaria publicada por mflux-community que permite ejecutar Iris-3B en Macs mediante MFlux, una implementación open source de MLX para modelos generativos de imagen. El repositorio ocupa 5,6 GB y está pensado para inferencia local en hardware Apple.

El modelo subyacente, iris-3b, es un text-to-image de 3.000 millones de parámetros desarrollado por speridlabs. Esta versión concreta aplica cuantización afín MLX de 5 bits sobre los tres componentes del pipeline (text encoder, transformer y VAE), lo que reduce el peso desde los 14 GB del BF16 hasta 5,6 GB. La cuantización queda almacenada en los propios pesos, por lo que no requiere pasar ningún flag de cuantización en tiempo de inferencia.

La relevancia de esta ficha radica en que cubre un caso de uso muy específico: desarrolladores con Mac (M1/M2/M3/M4) que quieren generar imágenes localmente sin depender de la nube ni de GPUs NVIDIA. Al ser una conversión comunitaria y no oficial, conviene tratarla como una distribución derivada, con las limitaciones y garantías que ello implica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de difusión text-to-image; pipeline con text encoder, transformer y VAE) |
| Parametros totales | 3B (según nombre del modelo base, no confirmado en la model card) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q5 (MLX affine quantization, 5-bit); existen variantes BF16, Q8, Q6, Q4 y Q3 en el mismo espacio de nombres |
| Idiomas soportados | no disponible (los prompts de ejemplo están en inglés) |
| Licencia | apache-2.0 (heredada del modelo original) |
| Formato de pesos | safetensors (MLX), cuantización almacenada en los pesos |

## Arquitectura y entrenamiento

La model card de esta conversión no aporta detalles sobre la arquitectura interna del modelo base ni sobre su proceso de entrenamiento. Lo que sí se documenta es el pipeline de inferencia: un text encoder que procesa el prompt, un transformer de difusión que genera la imagen latente y un VAE que la decodifica a píxeles. Los tres componentes han sido cuantizados a 5 bits con cuantización afín de MLX.

La conversión se realizó con MFlux 0.24.0 el 30 de octubre de 2026. No hay información pública en esta ficha sobre el número de tokens de entrenamiento, la composición del dataset, ni si el modelo base usó RLHF, DPO u otras técnicas de alineación. Cualquier afirmación al respecto requeriría consultar la model card original de speridlabs/iris-3b, que no forma parte de la información proporcionada.

## Capacidades

- Generación de imágenes a partir de descripciones textuales (text-to-image).
- Resolución de salida configurable mediante los parámetros `--width` y `--height` (el ejemplo usa 1024x1024).
- Control de reproducibilidad mediante semilla (`--seed`).
- Ejecución local en Apple Silicon con MLX, sin necesidad de GPU NVIDIA.
- Cuantización integrada en los pesos: no requiere flags adicionales de cuantización.
- Variantes de cuantización alternativas (BF16, Q8, Q6, Q4, Q3) para ajustar calidad y uso de memoria.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión de entrada, audio ni modo "thinking". Es exclusivamente un generador de imágenes.

## Casos de uso

- Generación de ilustraciones para prototipos y mockups en equipos de diseño que trabajan en macOS: el modelo se ejecuta localmente con MFlux y evita enviar prompts a servicios en la nube, lo que simplifica la confidencialidad de conceptos no publicados.
- Creación de assets para videojuegos indie en fases de preproducción: un desarrollador en un MacBook puede iterar sobre conceptos de personajes o escenarios con semillas fijas y comparar variantes sin coste por inferencia.
- Generación de imágenes de relleno para maquetas web y presentaciones internas: la variante Q5 (5,6 GB) cabe en Macs con 16 GB de memoria unificada, lo que la hace práctica para portátiles de gama media.
- Experimentación académica con modelos de difusión cuantizados: investigadores pueden estudiar el impacto de la cuantización de 5 bits comparando esta versión con las variantes Q8, Q6 y BF16 del mismo repositorio.
- Automatización de pipelines creativos en local: integrable en scripts de shell o Python que invoquen `mflux-generate-iris` para producir lotes de imágenes con prompts parametrizados.
- Demos y talleres sobre IA generativa en entornos Apple: al no requerir CUDA, el modelo sirve para formación práctica en aulas equipadas con Macs.
- Pruebas de concepto de productos creativos antes de invertir en infraestructura GPU: permite validar ideas con un coste de hardware nulo si ya se dispone de un Mac compatible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de calidad de imagen (FID, CLIP score, etc.), comparativas con otros modelos ni datos de latencia o throughput.

## Requisitos de hardware

- VRAM estimada: al ser MLX sobre Apple Silicon, se usa memoria unificada. El repo Q5 pesa 5,6 GB, por lo que se recomienda un mínimo de 8 GB de memoria unificada y idealmente 16 GB para margen durante la inferencia.
- GPU recomendadas: chips Apple Silicon (M1, M2, M3, M4 y variantes Pro/Max/Ultra). No compatible con GPUs NVIDIA ni AMD en esta distribución.
- Cabe en consumer hardware: sí, en Macs con al menos 8-16 GB de memoria unificada; la variante Q3 (4,3 GB) reduce aún más el requisito.
- Opciones de despliegue: MFlux (CLI `mflux-generate-iris`), instalable con `uv tool install --upgrade mflux`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| iris-3b-turbo-mflux-q5 (este) | 3B (según nombre) | no disponible | MLX safetensors Q5 | apache-2.0 | HuggingFace, 20 descargas |
| iris-3b-turbo-mflux-bf16 | 3B (según nombre) | no disponible | MLX safetensors BF16 | apache-2.0 | HuggingFace (mismo espacio) |
| iris-3b-turbo-mflux-q3 | 3B (según nombre) | no disponible | MLX safetensors Q3 | apache-2.0 | HuggingFace (mismo espacio) |
| speridlabs/iris-3b (original) | 3B (según nombre) | no disponible | no disponible | apache-2.0 | HuggingFace |

No se dispone de información sobre modelos de difusión de terceros comparables (por ejemplo, variantes de Stable Diffusion o Flux) en la documentación proporcionada, por lo que no se incluyen en la tabla para no introducir datos no verificados.

## Limitaciones y advertencias

- Es una conversión comunitaria, no una release oficial de speridlabs; la calidad y fidelidad respecto al modelo original no están garantizadas por el autor original.
- La cuantización a 5 bits puede introducir degradación en la calidad de imagen frente al BF16; no se documenta la magnitud de esa pérdida.
- No hay información sobre sesgos del modelo base ni sobre su comportamiento con prompts sensibles.
- Riesgo de alucinación visual: como todo modelo generativo de imágenes, puede producir contenido incoherente o no solicitado, especialmente con prompts ambiguos.
- Idiomas soportados no documentados; los ejemplos usan inglés, y no se garantiza un rendimiento equivalente en castellano u otros idiomas.
- La licencia apache-2.0 permite uso comercial, pero se recomienda revisar la model card original de speridlabs/iris-3b por si hubiera restricciones adicionales no reflejadas aquí.
- Solo funciona en Apple Silicon con MLX; no es portable a CUDA ni a CPU convencional en esta distribución.
- El número de descargas (20) y likes (0) es muy bajo, lo que sugiere poca validación por parte de la comunidad.
- No hay benchmarks publicados que permitan evaluar su calidad objetiva frente a alternativas.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mflux-community/iris-3b-turbo-mflux-q5
- Modelo base original: https://huggingface.co/speridlabs/iris-3b
- MFlux (implementación MLX): https://github.com/filipstrand/mflux
- Variante BF16: https://huggingface.co/mflux-community/iris-3b-turbo-mflux-bf16
- Variante Q8: https://huggingface.co/mflux-community/iris-3b-turbo-mflux-q8
- Variante Q6: https://huggingface.co/mflux-community/iris-3b-turbo-mflux-q6
- Variante Q4: https://huggingface.co/mflux-community/iris-3b-turbo-mflux-q4
- Variante Q3: https://huggingface.co/mflux-community/iris-3b-turbo-mflux-q3
- Organización MFlux-Community: https://huggingface.co/mflux-community
