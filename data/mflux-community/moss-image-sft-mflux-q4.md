# mflux-community/moss-image-sft-mflux-q4

## Resumen

moss-image-sft-mflux-q4 es una conversión comunitaria del modelo de texto a imagen OpenMOSS-Team/MOSS-Image-SFT al formato MFlux, una implementación nativa de MLX para ejecutar modelos generativos en Apple Silicon. No es un entrenamiento nuevo ni una versión oficial: los pesos originales se han convertido a MLX y cuantizado a 4 bits mediante cuantización affine.

El objetivo es reducir la barrera de memoria para inferencia local en Macs. El repositorio Q4 ocupa 7,5 GB, frente a los 26,2 GB de la versión BF16, lo que facilita ejecutar el modelo en equipos con menos memoria unificada y sin depender de servicios externos una vez descargados los pesos.

La licencia es Apache 2.0, heredada del modelo original. La ficha no ofrece datos sobre arquitectura interna, número de parámetros, longitud de contexto del codificador de texto, idiomas soportados ni resultados de benchmarks.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible. La model card menciona un text encoder, un transformer y un VAE, sin detallar el tipo de arquitectura. |
| Parámetros totales | No disponible. |
| Parámetros activos | No disponible; no se indica que sea un modelo MoE. |
| Longitud de contexto | No disponible. |
| Tipos de cuantización | Q4 (MLX affine de 4 bits). La familia incluye BF16, Q8, Q6, Q5, Q4 y Q3. |
| Idiomas soportados | No disponibles. |
| Licencia | Apache 2.0. |
| Formato de pesos | safetensors, con pesos cuantizados para MLX. |
| Modelo base | OpenMOSS-Team/MOSS-Image-SFT |
| Pipeline | text-to-image |
| Tamaño del repositorio | 7,5 GB |
| Librería | mflux |
| Plataforma | Apple Silicon (MLX) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura del modelo original. La model card de esta conversión indica que la cuantización MLX affine de 4 bits se aplica al text encoder, al transformer y al VAE. El nivel de cuantización queda almacenado en los pesos, por lo que no es necesario pasar el flag `--quantize` al generar imágenes. MFlux ejecuta el pipeline en MLX nativo sobre macOS y Apple Silicon.

Este repositorio no entrena ningún modelo: solo convierte y cuantiza los pesos originales. No hay información sobre número de tokens de entrenamiento, composición del dataset, fases de alineamiento como RLHF o DPO, ni innovaciones técnicas del modelo base. Cualquier dato de entrenamiento debe consultarse en la model card original de OpenMOSS-Team/MOSS-Image-SFT.

## Capacidades

- Generación de imágenes a partir de prompts de texto mediante el pipeline `text-to-image`.
- Control de resolución de salida con los parámetros `--width` y `--height`; el ejemplo de la model card emplea 768 × 768.
- Control de reproducibilidad mediante `--seed`.
- Ejecución local en Macs con Apple Silicon a través de MFlux y MLX.
- Descarga automática de pesos desde Hugging Face en el primer uso, o descarga manual con `hf download` para uso local.
- No se documentan capacidades de tool calling ni function calling.
- No se documentan capacidades de agentes ni razonamiento multi-paso.
- No se documentan capacidades multilingües ni el rendimiento con prompts en distintos idiomas.
- No se documentan modos de pensamiento, visión, audio ni otras capacidades especiales.

## Casos de uso

- Prototipado visual en diseño de producto: generar imágenes de concepto a partir de descripciones textuales y ajustar resolución y semilla para explorar variantes sin salir del Mac.
- Creación de recursos para marketing y redes sociales: producir ilustraciones o fondos personalizados con prompts concretos, manteniendo los pesos en local y evitando el envío de material sensible a una API externa.
- Previsualización de conceptos en estudios de ilustración: usar el modelo como generador de referencias rápidas y variar la semilla para obtener alternativas antes de un trabajo manual.
- Material didáctico y presentaciones: generar imágenes de apoyo para clases o documentación técnica mediante la CLI de MFlux y el modelo Q4, que ocupa 7,5 GB.
- Imágenes de cabecera para blogs y documentación: automatizar la generación de recursos visuales a partir de prompts y resoluciones configurables, con posibilidad de repetir resultados mediante la semilla.
- Pruebas de integración en entornos macOS: validar pipelines locales de generación de imágenes con MFlux en equipos Apple Silicon, incluyendo flujos desconectados después de la descarga inicial de pesos.
- Experimentación con cuantización: comparar la salida de Q4 con las variantes Q8, Q6, Q5, Q3 y BF16 del mismo modelo para evaluar el compromiso entre tamaño y calidad visual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de FID, CLIP score, adherencia al prompt ni comparativas cuantitativas frente a otros modelos de texto a imagen.

## Requisitos de hardware

- Plataforma: Apple Silicon con MLX. Este repositorio está orientado a MFlux y no documenta soporte para CUDA, ROCm ni GPU NVIDIA o AMD.
- Tamaño de pesos Q4: 7,5 GB en disco. La familia completa ocupa: BF16 26,2 GB, Q8 14,0 GB, Q6 10,7 GB, Q5 9,1 GB, Q4 7,5 GB y Q3 5,8 GB.
- Memoria unificada: debe ser suficiente para los pesos, las activaciones y el sistema operativo. El mínimo oficial no está publicado; como referencia, los pesos Q4 son 7,5 GB.
- GPU recomendadas: no aplica el listado habitual de A100, H100 o RTX 4090; MFlux utiliza la GPU integrada de Apple Silicon. No se documentan GPU discrete NVIDIA o AMD para este formato.
- Cabe en GPU de consumo: no mediante este repositorio en tarjetas NVIDIA o AMD. En Macs Apple Silicon, dependerá de la memoria unificada disponible; no hay una cifra oficial confirmada.
- Opciones de despliegue: CLI `mflux-generate-moss-image`, librería MFlux y descarga de pesos con `hf download`. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI con estos pesos MLX.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Cuantización | Tamaño | Formato | Licencia | Disponibilidad |
|---|---:|---:|---|---|---|
| OpenMOSS-Team/MOSS-Image-SFT | No disponible | No disponible | No disponible | Apache 2.0 | Modelo original |
| mflux-community/moss-image-sft-mflux-bf16 | BF16 | 26,2 GB | MLX/safetensors | Apache 2.0 | Conversión comunitaria |
| mflux-community/moss-image-sft-mflux-q8 | Q8 | 14,0 GB | MLX/safetensors | Apache 2.0 | Conversión comunitaria |
| mflux-community/moss-image-sft-mflux-q4 | Q4 | 7,5 GB | MLX/safetensors | Apache 2.0 | Este repositorio |
| mflux-community/moss-image-sft-mflux-q3 | Q3 | 5,8 GB | MLX/safetensors | Apache 2.0 | Conversión comunitaria |

No hay datos de rendimiento comparativo entre estas variantes ni frente a otros modelos de texto a imagen. Tampoco se dispone de parámetros totales ni longitud de contexto para establecer una comparación técnica completa.

## Limitaciones y advertencias

- Conversión no oficial: el repositorio lo mantiene mflux-community y no los autores originales de MOSS-Image-SFT.
- La cuantización Q4 es con pérdida y puede degradar la fidelidad visual respecto a BF16; no se han publicado evaluaciones cuantitativas de esa degradación.
- No hay benchmarks que permitan estimar la calidad, la adherencia al prompt o la coherencia de las imágenes generadas.
- No se documentan los idiomas soportados; no se puede garantizar un buen rendimiento con prompts en castellano.
- No se documentan sesgos específicos. Como modelo de generación de imágenes, puede reproducir estereotipos o sesgos presentes en sus datos de entrenamiento.
- Riesgo de generar detalles incoherentes, anatomías incorrectas o texto ilegible; no se documenta capacidad específica de renderizado de texto.
- La licencia Apache 2.0 se hereda del modelo original. Conviene revisar la model card original y los términos aplicables a los datos de entrenamiento y al uso de las imágenes generadas.
- Dependencia de hardware Apple Silicon: no es directamente utilizable en entornos CUDA convencionales sin una conversión adicional.
- No se documentan filtros de seguridad ni moderación de contenido.
- El modelo se descarga desde Hugging Face en el primer uso; en entornos sin red es necesario preparar una copia local con `hf download`.

## Enlaces

- [Hugging Face: mflux-community/moss-image-sft-mflux-q4](https://huggingface.co/mflux-community/moss-image-sft-mflux-q4)
- [Modelo original: OpenMOSS-Team/MOSS-Image-SFT](https://huggingface.co/OpenMOSS-Team/MOSS-Image-SFT)
- [Repositorio MFlux en GitHub](https://github.com/filipstrand/mflux)
- [Organización MFlux-Community en Hugging Face](https://huggingface.co/mflux-community)
- [Variante BF16](https://huggingface.co/mflux-community/moss-image-sft-mflux-bf16)
- [Variante Q8](https://huggingface.co/mflux-community/moss-image-sft-mflux-q8)
- [Variante Q6](https://huggingface.co/mflux-community/moss-image-sft-mflux-q6)
- [Variante Q5](https://huggingface.co/mflux-community/moss-image-sft-mflux-q5)
- [Variante Q3](https://huggingface.co/mflux-community/moss-image-sft-mflux-q3)
