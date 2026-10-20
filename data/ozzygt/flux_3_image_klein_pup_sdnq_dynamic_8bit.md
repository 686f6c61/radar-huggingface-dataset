# OzzyGT/Flux_3_Image_Klein_pup_sdnq_dynamic_8bit

## Resumen

`OzzyGT/Flux_3_Image_Klein_pup_sdnq_dynamic_8bit` es una versión cuantizada a 8 bits dinámicos del *prompt upsampler* de FLUX 3 Image Klein, publicado por Black Forest Labs. El upsampler es el componente que reescribe la petición breve del usuario en un *caption* largo y detallado que el modelo de imagen utiliza después para generar o editar la imagen. El autor de la cuantización es OzzyGT, que aplica SDNQ (una técnica de cuantización de precisión mixta orientada a difusión y transformers) sobre el modelo original `black-forest-labs/flux-3-image-klein-pup`.

El modelo subyacente es un `Qwen3_5ForConditionalGeneration` de 9.418.887.904 parámetros (9,42B), derivado de Qwen3.5-9B del equipo Qwen de Alibaba Cloud, con torre de visión para procesar imágenes de referencia. La cuantización reduce el peso del repositorio a 10,5 GB y permite ejecutar el upsampler en GPUs de consumo: la model card documenta flujos para GPUs de 16 GB o más (con *CPU offload*) y para GPUs de 12 GB (en dos etapas).

Su relevancia es práctica: el upsampler es un cuello de botella de VRAM en pipelines FLUX 3 Klein y esta versión INT8 lo hace viable en hardware doméstico manteniendo, según el autor, una calidad visual equivalente a bf16 en la comparación cualitativa publicada. La licencia es Apache 2.0, la misma que la del modelo original.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Qwen3.5 `Qwen3_5ForConditionalGeneration`), con torre de visión y cabeza de generación de texto |
| Parámetros totales | 9.418.887.904 (9,42B) |
| Parámetros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | No disponible |
| Tipos de cuantización | 8 bits dinámicos (SDNQ); LM, torre de visión y embeddings de tokens cuantizados; `lm_head` en bf16 |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería `transformers`) |

## Arquitectura y entrenamiento

El upsampler es un modelo lingüístico-visual tipo *image-text-to-text*: recibe la petición del usuario y, opcionalmente, imágenes de referencia y system prompts, y emite un *caption* expandido que el pipeline de FLUX 3 Image Klein consume como prompt final. La arquitectura corresponde a Qwen3.5-9B, un transformer denso (no MoE) con torre de visión, adaptado por Black Forest Labs para la tarea de *prompt upsampling* dentro de FLUX 3.

No se dispone de información sobre el dataset de entrenamiento, el número de tokens, ni sobre si hubo etapas de RLHF o DPO en el modelo original, más allá de su linaje declarado desde Qwen3.5-9B. La innovación técnica de esta ficha concreta es la cuantización: SDNQ en modo dinámico a 8 bits sobre el LM, la torre de visión y los embeddings, dejando `lm_head` en bf16 para preservar la distribución de salida del vocabulario. El autor publica una comparación cualitativa (misma petición y semilla 7) entre el upsampler bf16 y este INT8, sin métricas cuantitativas.

## Capacidades

- Reescritura y expansión de prompts (*prompt upsampling*): convierte una petición corta en un *caption* detallado con composición, materiales, iluminación y texto en imagen.
- Procesamiento de imágenes de referencia gracias a la torre de visión, integrado en flujos de edición de FLUX 3 Image Klein.
- Soporte de *system prompts* y control de layout mediante cajas delimitadoras (*bounding boxes*), según la model card original.
- Generación de texto conversacional en inglés (`conversational`).
- Integración como componente `prompt_upsampler` de un `ModularPipeline` de diffusers.
- Compatible con *endpoints* de Hugging Face (`endpoints_compatible`).
- No se documenta soporte explícito de *tool calling*, agentes ni modo *thinking* en la información disponible.

## Casos de uso

- **Upsampling de prompts en pipelines FLUX 3 Klein**: se sustituye el componente `prompt_upsampler` del pipeline por este modelo con `pipe.update_components(...)`, de modo que cada petición del usuario se expande automáticamente antes de la generación de imagen.
- **Generación de imágenes en GPUs de 12 GB**: el script de dos etapas (`sdnq_prompt_upsampler_two_stage.py`) escribe primero el caption y luego invoca el modelo de imagen, liberando VRAM entre ambas fases; permite ejecutar el pipeline completo en hardware de consumo.
- **Edición de imágenes con referencias**: al aceptar imágenes de entrada, el upsampler puede reformular instrucciones del tipo «cambia el fondo de esta foto» en descripciones completas que el modelo de imagen interpreta con más precisión.
- **Control de composición con bounding boxes**: en flujos de diseño gráfico o maquetación, el upsampler traduce instrucciones con cajas de layout a descripciones espaciales explícitas que FLUX 3 Klein respeta.
- **Enriquecimiento de metadatos y *captioning* de datasets**: reutilizable como generador de descripciones densas en inglés para pares imagen-texto, aprovechando su naturaleza image-text-to-text.
- **Servicios internos de generación de imagen vía API**: al ser `endpoints_compatible` y Apache 2.0, puede desplegarse como microservicio que devuelve el prompt expandido y la imagen en una sola llamada.
- **Validación de cuantizaciones**: útil como caso de estudio reproducible (semilla fija, comparación bf16 vs INT8) para evaluar el impacto de SDNQ en tareas multimodales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente incluye una comparación visual cualitativa entre el upsampler bf16 y esta versión INT8 (misma petición, semilla 7) y un dato de velocidad de decodificación:

| Métrica | bf16 (original) | INT8 (este modelo) |
|---|---|---|
| Velocidad de decodificación en RTX 5090 | ~70 tokens/s | ~22 tokens/s |
| Calidad visual del resultado | Referencia | Equivalente en la muestra publicada (sin métrica) |

## Requisitos de hardware

- Peso del repositorio: 10,5 GB en safetensors (8 bits), frente a los ~18,8 GB que ocuparían los mismos 9,42B parámetros en bf16 (estimación a partir del recuento de parámetros).
- GPU de 16 GB o más: flujo con *CPU offload* (`sdnq_prompt_upsampler_model_cpu_offload.py`).
- GPU de 12 GB: flujo en dos etapas (`sdnq_prompt_upsampler_two_stage.py`), que genera primero el caption y después la imagen.
- GPU de referencia en las pruebas del autor: RTX 5090, con ~22 tokens/s de decodificación (frente a ~70 tokens/s en bf16).
- Requisitos de software: SDNQ v0.2.8 o superior, una versión de diffusers que incluya el bloque *prompt upsampler* de FLUX 3, y `transformers` con soporte de `Qwen3_5ForConditionalGeneration`. Es necesario importar `sdnq` antes de cargar los pesos.
- Opciones de despliegue documentadas: `transformers` + `diffusers` (`ModularPipeline`). No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Throughput agregado del pipeline completo: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Formato | Tamaño | Contexto | Licencia | Notas |
|---|---|---|---|---|---|---|
| Este modelo (SDNQ INT8) | 9,42B | safetensors 8-bit | 10,5 GB | No disponible | Apache 2.0 | `lm_head` en bf16; ~22 tok/s en RTX 5090 |
| `black-forest-labs/flux-3-image-klein-pup` (bf16) | 9,42B (heredados) | safetensors bf16 | ~18,8 GB (estimado) | No disponible | Apache 2.0 | Referencia de calidad; ~70 tok/s en RTX 5090 |
| `OzzyGT/Flux_3_Image_Klein_sdnq_dynamic_4bit` | 9,42B (heredados) | safetensors 4-bit | No disponible | No disponible | Apache 2.0 | Variante más agresiva en tamaño, con mayor riesgo de pérdida de calidad |
| FLUX 3 Image Klein (modelo de imagen completo) | 5,6B | safetensors | No disponible | No disponible | No disponible en la información | No es comparable directamente: es el generador de imagen, no el upsampler |

## Limitaciones y advertencias

- Solo inglés: no se declara soporte de castellano ni de otros idiomas, por lo que los prompts en español deben traducirse antes.
- La cuantización INT8 introduce una pérdida de fidelidad respecto a bf16; el autor solo aporta una comparación visual puntual, sin evaluación sistemática.
- La decodificación es aproximadamente tres veces más lenta que en bf16 (~22 frente a ~70 tokens/s en una RTX 5090), lo que penaliza pipelines de alto volumen.
- Dependencia estricta de versiones: requiere SDNQ ≥ 0.2.8 y una versión de diffusers con el bloque de prompt upsampler de FLUX 3; versiones anteriores fallan al cargar los pesos.
- Es necesario importar `sdnq` antes de `from_pretrained`; de lo contrario, los pesos cuantizados no se registran correctamente.
- Riesgo de alucinación inherente al *prompt upsampling*: el modelo añade detalles (materiales, texto en imagen, composición) que el usuario no ha especificado, lo que puede desviar el resultado respecto a la intención original.
- No hay contexto documentado, por lo que se desconoce el comportamiento con prompts muy largos o con muchas imágenes de referencia.
- El repositorio no tiene descargas ni valoraciones en el momento de la consulta: no existe validación independiente de la comunidad.
- Licencia Apache 2.0 para este componente, pero el pipeline completo de FLUX 3 Image Klein puede tener términos propios que conviene revisar antes de un uso comercial.
- No se documentan sesgos específicos del modelo; al derivar de Qwen3.5-9B, hereda los sesgos del corpus de entrenamiento original, no caracterizados en esta ficha.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OzzyGT/Flux_3_Image_Klein_pup_sdnq_dynamic_8bit
- Modelo base (prompt upsampler bf16): https://huggingface.co/black-forest-labs/flux-3-image-klein-pup
- Variante de 4 bits del mismo autor: https://huggingface.co/OzzyGT/Flux_3_Image_Klein_sdnq_dynamic_4bit
- Cuantización del modelo de imagen FLUX 3 Klein: https://huggingface.co/OzzyGT/Flux_3_Image_Klein_sdnq_dynamic_8bit
- Repositorio SDNQ: https://github.com/Disty0/sdnq
- Scripts de referencia (diffusers-recipes): https://github.com/asomoza/diffusers-recipes/blob/main/models/flux3_image_klein/README.md
- Código de inferencia de FLUX 3 Image Klein: https://github.com/black-forest-labs/flux-3-image-klein
- Página oficial del modelo: https://bfl.ai/models/flux-3-image-klein
- Blog de anuncio: https://bfl.ai/blog/flux-3-image-klein
- Qwen3.5-9B (modelo de origen): https://huggingface.co/Qwen/Qwen3.5-9B
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
