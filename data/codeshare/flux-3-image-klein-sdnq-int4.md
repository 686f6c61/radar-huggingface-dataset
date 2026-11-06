# codeShare/flux-3-image-klein-sdnq-int4

## Resumen

FLUX 3 Image Klein es un modelo de generación y edición de imágenes de pesos abiertos desarrollado por Black Forest Labs. El checkpoint original etiqueta el transformer de imagen como un modelo de 5,6B de parámetros, e incorpora como codificador de texto Qwen3-VL-4B-Instruct, que es un componente separado del transformer. El modelo unifica en una sola arquitectura la generación texto-a-imagen, la edición con una única imagen de referencia y la composición con múltiples referencias (hasta 10), devolviendo siempre una imagen de salida.

La ficha que nos ocupa, `codeShare/flux-3-image-klein-sdnq-int4`, es una redistribución comunitaria cuantizada del checkpoint destilado de FLUX 3 Image Klein. El autor del repositorio (codeShare) publica los pesos en formato safetensors para la librería diffusers, con un pipeline de image-to-image y un total de 2.906.184.448 parámetros en el fichero de pesos (cifra que corresponde al transformer cuantizado, no al conjunto del sistema con codificador de texto y autoencoder). El tamaño del repositorio es de 15,2 GB.

Es relevante porque permite ejecutar localmente un modelo de generación y edición de imágenes de última generación con control de layout mediante bounding boxes y renderizado de texto dentro de la imagen, aunque con las restricciones de licencia de la FLUX Kommunity License y la dependencia crítica de un prompt upsampler externo para obtener resultados no genéricos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion (flow matching) para imagen, con codificador de texto Qwen3-VL-4B-Instruct y autoencoder de imagen; pipeline modular de diffusers |
| Parametros totales | 2.906.184.448 en el fichero de pesos safetensors del repositorio (corresponde al transformer cuantizado); el modelo original etiqueta el transformer en 5,6B y el codificador de texto es adicional |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (modelo de imagen; acepta prompt y hasta 10 imagenes de referencia) |
| Tipos de cuantizacion | int4 (según el nombre del repositorio y el tag `8-bit`); el modelo original ofrece BF16, FP8 y NVFP4 |
| Idiomas soportados | en |
| Licencia | flux-kommunity-license (FLUX Kommunity License) |
| Formato de pesos | safetensors (diffusers) |

## Arquitectura y entrenamiento

El modelo subyacente es un transformer de difusión con muestreo por flow matching, según se deduce de la referencia explícita a "flow-map sampling" en la documentación del autor original. La arquitectura es modular: un transformer de imagen (etiquetado como 5,6B en el checkpoint original), un codificador de texto Qwen3-VL-4B-Instruct y un autoencoder de imagen. El mismo transformer atiende generación texto-a-imagen, edición con una referencia y composición multi-referencia, lo que evita mantener pipelines separados por tarea. El control de layout se realiza mediante bounding boxes expresadas en una rejilla de 0 a 1000 dentro del prompt, que guían posición y escala sin imponer una máscara dura de píxeles.

El checkpoint del que deriva esta ficha es la variante destilada, pensada para generación y edición con 16 pasos de muestreo y sin guidance, frente a la variante Base (no destilada, 50 pasos, guidance 3.5) orientada a fine-tuning, entrenamiento de LoRA e investigación. La model card original no detalla el número de tokens de entrenamiento ni la composición del dataset, y tampoco especifica si hubo RLHF o DPO; esos datos no están disponibles. La innovación técnica destacable es la unificación de tareas en un solo modelo con control de layout por cajas y renderizado de texto dentro de la imagen generada.

## Capacidades

- Generación de imágenes texto-a-imagen a partir de captions de escena completas.
- Edición de imagen con una única referencia (image-to-image) y composición con hasta 10 imágenes de referencia.
- Control de layout mediante bounding boxes en una rejilla de 0 a 1000, con posibilidad de recolorear, mover, reemplazar o eliminar elementos indicados por caja.
- Renderizado de texto legible dentro de la imagen generada.
- Generación y edición unificadas en el mismo transformer, sin pipelines separados por tarea.
- Soporte de prompt upsampling mediante un modelo externo (flux-3-image-klein-pup, 9B/18,8 GB) o cualquier LLM con el system prompt adecuado.
- Capacidades multilingües: limitadas a inglés según la model card.
- No se documentan en la información disponible capacidades de tool calling, agentes, audio o visión más allá del uso del codificador Qwen3-VL-4B-Instruct como encoder de texto.

## Casos de uso

- Generación de ilustraciones y material gráfico para producto: el modelo acepta captions de escena completas y devuelve una imagen coherente, adecuado para prototipado rápido de conceptos visuales con control de composición mediante cajas.
- Edición iterativa de imágenes existentes: partiendo de una imagen generada o subida, se pueden aplicar cambios de iluminación, atmósfera o elementos concretos con una sola referencia, como muestra el ejemplo de la model card (misma escena de día convertida a escena nocturna).
- Composición multi-referencia para catálogo o e-commerce: permite combinar hasta 10 imágenes de referencia (productos, fondos, estilos) en una sola salida, útil para variaciones de packaging o escenas de producto.
- Sustitución y recolocación de elementos con control de layout: las bounding boxes permiten mover, recolorear o eliminar objetos concretos de una escena, lo que encaja en flujos de retoque semiautomático y maquetación.
- Generación de imágenes con texto integrado: el renderizado de texto dentro de la imagen sirve para carteles, banners, etiquetas y mockups donde el copy forma parte del diseño.
- Autoalojamiento de un pipeline de generación y edición en infraestructura propia: al estar publicado en diffusers con pesos safetensors, se puede integrar en servicios internos que requieran control de datos y sin dependencia de la API de BFL.
- Investigación y experimentación con cuantización: esta variante int4 permite estudiar el impacto de la cuantización sobre un modelo de difusión de gran tamaño en entornos con VRAM limitada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. El repositorio ocupa 15,2 GB, pero el autor original advierte explícitamente que el tamaño de los paquetes cuantizados no es una medida del uso total de memoria de GPU.
- El sistema completo requiere además el codificador de texto Qwen3-VL-4B-Instruct, el autoencoder de imagen, el clasificador de seguridad (Falconsai/nsfw_image_detection) y, por defecto, el prompt upsampler (18,8 GB en disco), lo que incrementa los requisitos respecto al solo transformer.
- GPU recomendadas: no disponible en la información proporcionada. Por el tamaño del transformer original (5,6B) y del codificador de texto (4B), es razonable esperar que no quepa en GPUs de consumo con poca VRAM en precisión completa, pero no hay datos oficiales que lo confirmen.
- Opciones de despliegue: diffusers (pipeline modular), código de referencia de black-forest-labs/flux-3-image-klein (CLI con soporte de flow-map sampling). No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que no son adecuados para un modelo de difusión de imagen.
- Latencia y throughput: no disponibles. El checkpoint destilado está diseñado para 16 pasos de muestreo sin guidance, lo que reduce el coste frente a la variante Base (50 pasos con guidance 3.5), pero no se publican cifras concretas.

## Comparativa con modelos similares

| Modelo | Parametros (transformer) | Contexto / referencias | Pasos de muestreo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| FLUX 3 Image Klein (destilado, esta ficha es una cuantizacion int4) | 5,6B (etiqueta original); 2,9B en el safetensors de esta variante | Hasta 10 imagenes de referencia | 16, sin guidance | FLUX Kommunity License | Hugging Face, API de BFL, codigo de referencia en GitHub |
| FLUX 3 Image Klein Base | 5,6B | Hasta 10 imagenes de referencia | 50, guidance 3.5 | FLUX Kommunity License | Hugging Face |
| Otras alternativas de generacion/edicion de imagen de pesos abiertos | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la información proporcionada de datos de rendimiento comparativo (benchmarks) entre estas variantes ni frente a modelos de otros desarrolladores, por lo que la comparación se limita a parámetros, pasos de muestreo, licencia y disponibilidad.

## Limitaciones y advertencias

- Requiere obligatoriamente un prompt upsampler: la model card original advierte que usar el modelo sin él, con un prompt corto tal cual, produce resultados genéricos. Diffusers no ejecuta el upsampler por sí solo.
- Licencia restrictiva: la FLUX Kommunity License permite uso no comercial y ofrece una excepción de salida comercial para "Qualifying Users" sujeta a sus términos; es necesario revisar LICENSE.md antes de cualquier uso en producción.
- Idiomas: solo inglés según la model card, lo que limita prompts y texto renderizado en castellano u otras lenguas.
- Esta ficha es una redistribución comunitaria (codeShare), no el repositorio oficial de Black Forest Labs; conviene verificar la integridad y procedencia de los pesos antes de usarlos en producción.
- El dato de 2.906.184.448 parámetros corresponde al fichero safetensors de esta variante cuantizada y no debe interpretarse como el total del sistema (transformer + codificador de texto + autoencoder).
- Riesgo de alucinación visual y de artefactos: no se documentan en la información disponible métricas de fidelidad, sesgos conocidos ni evaluaciones de seguridad más allá de la carga de un clasificador NSFW.
- El control por bounding boxes guía posición y escala, pero no restringe los píxeles a una máscara dura, por lo que el cumplimiento del layout no es exacto.
- No se documentan requisitos oficiales de VRAM ni latencias, lo que dificulta el dimensionamiento de infraestructura sin pruebas propias.

## Enlaces

- Repositorio de esta variante: https://huggingface.co/codeShare/flux-3-image-klein-sdnq-int4
- Modelo original destilado: https://huggingface.co/black-forest-labs/flux-3-image-klein
- Modelo original Base: https://huggingface.co/black-forest-labs/flux-3-image-klein-base
- Prompt upsampler: https://huggingface.co/black-forest-labs/flux-3-image-klein-pup
- System prompts del upsampler: https://huggingface.co/black-forest-labs/flux-3-image-klein-pup/blob/main/system_prompts.json
- Codigo de referencia en GitHub: https://github.com/black-forest-labs/flux-3-image-klein
- API de Black Forest Labs: https://bfl.ai
- Clasificador de seguridad NSFW: https://huggingface.co/Falconsai/nsfw_image_detection
