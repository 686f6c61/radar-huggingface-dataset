# OzzyGT/minimax_h3_image_sdnq_dynamic_8bit

## Resumen

MiniMax-H3-Image SDNQ INT8 es una versión cuantizada a 8 bits del modelo de generación y edición de imágenes MiniMax-H3-Image, publicado por el usuario OzzyGT. No se trata de un modelo original, sino de una conversión de pesos del modelo base de MiniMaxAI empleando la técnica SDNQ (Stochastic Dynamic Neural Quantization) con rotación de Hadamard, que reduce el peso del repositorio a 62,7 GB manteniendo el transformer y el codificador de texto en INT8, mientras que el VAE permanece sin cuantizar.

El modelo resuelve el problema del coste de memoria del modelo original: con 33.146.369.984 parámetros, la inferencia en bf16 exige una GPU de gama muy alta, mientras que esta variante INT8 reduce el requisito de VRAM y permite ejecutar el pipeline en hardware más asequible. Es relevante para desarrolladores que quieran experimentar con MiniMax-H3-Image sin disponer de un clúster de A100/H100, y para quienes necesiten generar imágenes a resoluciones muy altas (el ejemplo de la model card usa 5024x3360).

La ficha se centra en esta variante cuantizada; los detalles de prompting, tamaños recomendados y comportamiento del modelo original deben consultarse en la model card de MiniMaxAI/MiniMax-H3-Image.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Modelo de difusión para generación y edición de imágenes (pipeline diffusers); componentes transformer, codificador de texto y VAE |
| Parámetros totales | 33.146.369.984 |
| Parámetros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | INT8 dinámico con SDNQ y rotación de Hadamard (transformer y codificador de texto); VAE sin cuantizar |
| Idiomas soportados | en |
| Licencia | minimax-h3-image-community-license-agreement (etiquetada como "other") |
| Formato de pesos | safetensors (librería diffusers, pipeline ModularPipeline) |

## Arquitectura y entrenamiento

Se trata de un modelo de difusión para texto-a-imagen y edición de imágenes con múltiples referencias, estructura típica de los pipelines modernos de diffusers: un transformer de difusión, un codificador de texto y un VAE. En esta variante, el transformer y el codificador de texto están cuantizados a 8 bits mediante SDNQ con rotación de Hadamard, y el codificador de texto conserva únicamente las 51 capas que el modelo utiliza realmente, lo que reduce aún más el peso. El VAE se mantiene en su precisión original.

No se dispone de información sobre el dataset de entrenamiento, el número de tokens, el proceso de alineación (RLHF/DPO) ni innovaciones de decodificación del modelo original en la información proporcionada. La model card de esta variante remite a la del modelo base para esos detalles. La cuantización requiere SDNQ v0.2.8 o superior y diffusers instalado desde el código fuente.

## Capacidades

- Generación de imágenes a partir de texto (text-to-image) con prompts descriptivos largos.
- Edición de imágenes y composición multi-referencia: combina varias imágenes de entrada etiquetadas como `<Picture N>` y `<Subject N>` en una sola escena.
- Resoluciones muy altas: el ejemplo de la model card genera a 5024x3360 píxeles.
- Control de reproducibilidad mediante semilla (`torch.Generator().manual_seed(...)`).
- Soporte de prompts detallados con múltiples sujetos y restricciones de preservación de elementos de las referencias.
- No se documentan en la información disponible capacidades de tool calling, agentes, visión general o audio; el modelo es específicamente de imagen.

## Casos de uso

- Generación de imágenes publicitarias a alta resolución: el modelo puede producir composiciones a 5024x3360, adecuadas para cartelería o impresión, con control de semilla para reproducir resultados en producción.
- Composición de escenas con múltiples referencias: útil en e-commerce para insertar un producto (por ejemplo, un sofá) en una fotografía de interior existente y añadir mascotas u otros elementos, usando la sintaxis `<Picture N>`/`<Subject N>`.
- Edición fotográfica asistida: sustituir o añadir objetos preservando la iluminación y la perspectiva de la imagen original, como en el ejemplo de la model card con la habitación, el sofá, el perro y el gato.
- Prototipado rápido en equipos con GPUs de gama alta para consumidor: la cuantización INT8 reduce la VRAM necesaria frente al bf16, lo que permite iterar en estaciones de trabajo locales.
- Creación de contenido para redes sociales y blogs: generación de ilustraciones descriptivas a partir de prompts largos en inglés.
- Investigación en cuantización de modelos de difusión: este repositorio sirve como referencia para evaluar la pérdida de calidad de SDNQ INT8 frente a bf16 en tareas de generación y edición.
- Automatización de pipelines de imagen en diffusers: integrable como `ModularPipeline` en flujos de CI/CD o servicios batch que generen imágenes bajo demanda.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente incluye comparaciones visuales cualitativas entre bf16 e INT8 con el mismo prompt y semilla, sin métricas numéricas (FID, CLIP score, etc.).

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita. Con 33.146.369.984 parámetros en INT8, los pesos ocupan aproximadamente 33 GB, a lo que hay que sumar el VAE sin cuantizar y las activaciones; se requiere una GPU con al menos 40-48 GB de VRAM para el pipeline completo en el ejemplo a alta resolución.
- GPU recomendadas: A100 80 GB, H100, o GPUs profesionales con 48 GB o más. No se garantiza su funcionamiento en RTX 4090 (24 GB) por el tamaño de los pesos.
- No cabe en GPUs de consumo de 24 GB o menos sin estrategias adicionales de offloading no documentadas.
- Opciones de despliegue: diffusers (instalado desde el código fuente) con `ModularPipeline`, más SDNQ v0.2.8 o superior. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo de lenguaje.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| OzzyGT/minimax_h3_image_sdnq_dynamic_8bit | 33.146.369.984 (INT8) | no disponible | minimax-h3-image-community-license-agreement | Hugging Face, diffusers + SDNQ |
| MiniMaxAI/MiniMax-H3-Image (bf16) | no disponible en la información | no disponible | minimax-h3-image-community-license-agreement | Hugging Face, diffusers |
| Otras variantes cuantizadas de MiniMax-H3-Image | no disponible | no disponible | no disponible | no disponible |

La comparativa se limita al modelo base y a esta variante cuantizada; no se dispone de datos de benchmarks ni de especificaciones de alternativas de otros fabricantes en la información proporcionada.

## Limitaciones y advertencias

- Solo soporta inglés (`en`); los prompts en otros idiomas pueden degradar la calidad.
- Riesgo de alucinación visual: como todo modelo generativo, puede inventar detalles no presentes en las referencias o en el prompt.
- La cuantización INT8 puede introducir diferencias de calidad frente a bf16; la model card solo ofrece comparaciones visuales, sin métricas objetivas.
- Requiere SDNQ v0.2.8 o superior y diffusers desde el código fuente, lo que complica su integración en entornos con versiones fijadas.
- La licencia `minimax-h3-image-community-license-agreement` es distinta de las licencias open source estándar; es necesario revisar sus términos antes de un uso comercial.
- El VAE no está cuantizado, por lo que el ahorro de memoria es parcial.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso en producción ni validación comunitaria.
- No se documentan sesgos específicos en la información disponible.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/OzzyGT/minimax_h3_image_sdnq_dynamic_8bit
- Modelo base: https://huggingface.co/MiniMaxAI/MiniMax-H3-Image
- SDNQ (GitHub): https://github.com/Disty0/sdnq
- Ejemplos de imágenes diffusers: https://huggingface.co/datasets/OzzyGT/diffusers-examples
