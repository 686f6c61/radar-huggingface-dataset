# engenho-ai/KuroImage-Gen-BR

## Resumen

KuroImage-Gen-BR es un adaptador LoRA de generación de imágenes desarrollado por Engenho AI dentro de su "Linha Kuro". Se entrena sobre el modelo base `stabilityai/sdxl-turbo` y está orientado a la generación texto-a-imagen, imagen-a-imagen y referencia-a-imagen en portugués de Brasil, con inferencia en aproximadamente 4 pasos de muestreo.

El modelo resuelve la necesidad de generar imágenes fotorrealistas o estilizadas partiendo de instrucciones en portugués brasileño, sin requerir un modelo base adicional en ese idioma. Al estar construido sobre SDXL Turbo, hereda la capacidad de generar imágenes con muy pocos pasos de difusión, lo que reduce drásticamente la latencia frente a SDXL estándar (que suele requerir 20-50 pasos).

La relevancia actual del modelo reside en su bajo coste computacional (aproximadamente 4,8 GB de VRAM según el autor) y en su especialización lingüística para el mercado brasileño. El repositorio ocupa tan solo 0,1 GB, lo que corresponde al tamaño típico de un adaptador LoRA sobre un UNet de SDXL. La licencia es la Stability AI Community License, lo que condiciona su uso comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA sobre UNet de SDXL Turbo (difusión latente) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de imagen); prompt de texto de longitud no especificada |
| Tipos de cuantización | no disponible (pesos en `.safetensors`, presumiblemente fp16/bf16) |
| Idiomas soportados | portugués (pt), portugués de Brasil (pt-br) |
| Licencia | Stability AI Community License (sai-community) |
| Formato de pesos | safetensors (adaptador LoRA) |
| Modelo base | stabilityai/sdxl-turbo |
| Tamaño del repositorio | 0,1 GB |
| Pasos de inferencia | ~4 pasos |
| VRAM estimada | ~4,8 GB (según el autor) |
| Modalidades | texto-a-imagen (t2i), imagen-a-imagen (i2i), referencia-a-imagen (ref2i) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA entrenado sobre el UNet de SDXL Turbo, un modelo de difusión latente derivado de Stable Diffusion XL con destilación por destilación adversarial (adversarial diffusion distillation), que permite generar imágenes en uno a cuatro pasos. El adaptador modifica los pesos del UNet mediante matrices de bajo rango, sin alterar el VAE ni el codificador de texto del modelo base. El repositorio contiene únicamente los pesos del adaptador (0,1 GB), por lo que es necesario descargar el modelo base `stabilityai/sdxl-turbo` para la inferencia.

No se dispone de información sobre el volumen de datos de entrenamiento, la composición del dataset, el número de tokens de imagen, ni sobre si se emplearon técnicas de RLHF, DPO o ajuste por preferencias. Tampoco se detalla si el entrenamiento se realizó con resolución nativa de 512x512 o 1024x1024, ni si se aplicaron técnicas de regularización o de preservación de capacidades del modelo base. La model card no incluye detalles sobre hiperparámetros de entrenamiento (rank del LoRA, alpha, learning rate, número de pasos).

## Capacidades

- Generación de imágenes a partir de prompts en portugués de Brasil (text-to-image).
- Edición y transformación de imágenes existentes (image-to-image).
- Generación condicionada por imagen de referencia (ref2i).
- Inferencia en aproximadamente 4 pasos de muestreo, lo que reduce la latencia frente a modelos de difusión estándar.
- Especialización lingüística en portugués brasileño, lo que evita la degradación de prompts escritos en ese idioma frente a modelos entrenados principalmente en inglés.
- Compatible con el ecosistema de difusión de Hugging Face (Diffusers) al ser un adaptador LoRA sobre un modelo base estándar.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión, audio ni modo de pensamiento, ya que se trata de un modelo de generación de imágenes.

## Casos de uso

- Generación de creatividades para marketing digital en portugués de Brasil: el modelo permite crear imágenes a partir de briefs en portugués sin traducción intermedia, lo que agiliza la producción de banners, posts y anuncios para el mercado brasileño.
- Prototipado rápido de conceptos visuales: con ~4 pasos de inferencia y ~4,8 GB de VRAM, se puede iterar sobre variaciones de una idea en cuestión de segundos en una GPU de consumo, lo que resulta adecuado para sesiones de diseño exploratorio.
- Edición de imágenes para catálogos de producto: mediante image-to-image, se pueden aplicar cambios de estilo, fondo o iluminación a fotografías existentes manteniendo la composición original.
- Generación de ilustraciones para contenido editorial y blogs en portugués: el modelo puede producir imágenes de acompañamiento a partir de descripciones textuales en portugués, reduciendo la dependencia de bancos de imágenes.
- Creación de variaciones de personajes o productos a partir de una referencia visual: la capacidad ref2i permite mantener la coherencia de un sujeto entre distintas generaciones, útil para series de contenido o merchandising.
- Educación y material didáctico: generación de ilustraciones explicativas a partir de descripciones en portugués para presentaciones, apuntes o material de aula, con bajo coste computacional.
- Pruebas de concepto en investigación sobre adaptación lingüística de modelos de difusión: al ser un LoRA pequeño y especializado en pt-br, sirve como caso de estudio para evaluar cómo el ajuste de bajo rango afecta a la alineación entre prompts y resultados en idiomas distintos del inglés.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas cuantitativas como FID, CLIP score, IS ni comparaciones con otros adaptadores o modelos base.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 4,8 GB según el autor, lo que corresponde a la inferencia del modelo base SDXL Turbo con el adaptador LoRA cargado en precisión de 16 bits.
- GPU recomendadas: no se especifican modelos concretos. Por el perfil de VRAM (~4,8 GB), cabría esperar compatibilidad con GPUs de consumo como RTX 3060 (12 GB), RTX 4060 Ti (8/16 GB), RTX 4070 (12 GB), RTX 4080 (16 GB) y RTX 4090 (24 GB). GPUs profesionales como A100 o H100 también son compatibles, aunque sobredimensionadas para este modelo.
- Cabe en GPU de consumo: sí, según la estimación de VRAM del autor.
- Opciones de despliegue: el adaptador es compatible con el ecosistema Diffusers de Hugging Face (carga del LoRA sobre `stabilityai/sdxl-turbo`). No se documentan integraciones específicas con vLLM, llama.cpp, Ollama o TGI, que no son aplicables a modelos de difusión de imagen.
- Latencia y throughput estimados: no disponibles. La inferencia en ~4 pasos sugiere una latencia baja en comparación con SDXL estándar, pero no se aportan cifras concretas.

## Comparativa con modelos similares

| Modelo | Tipo | Base | Idiomas | Pasos | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| KuroImage-Gen-BR | LoRA de difusión | SDXL Turbo | pt-br | ~4 | Stability AI Community | Hugging Face |
| stabilityai/sdxl-turbo | Modelo de difusión completo | SDXL | Principalmente inglés | 1-4 | Stability AI Community | Hugging Face |
| stabilityai/stable-diffusion-xl-base-1.0 | Modelo de difusión completo | SDXL | Principalmente inglés | 20-50 | CreativeML Open RAIL++-M | Hugging Face |

La comparativa se limita al modelo base y a SDXL estándar, ya que no se dispone de información sobre otros adaptadores LoRA especializados en portugués de Brasil con los que contrastar parámetros, contexto o rendimiento. No se han publicado métricas comparativas en la información disponible.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan sesgos específicos, pero al derivar de SDXL Turbo hereda los sesgos del dataset de entrenamiento del modelo base, que pueden reflejarse en la representación de personas, culturas y estereotipos.
- Riesgo de alucinación visual: como todo modelo generativo de imágenes, puede producir elementos inexistentes, anatomías incorrectas, texto ilegible o incoherencias espaciales, especialmente en composiciones complejas.
- Limitaciones de idioma: el modelo está especializado en portugués de Brasil; su rendimiento con prompts en otros idiomas no está documentado y podría degradarse.
- Restricciones de licencia: la Stability AI Community License impone condiciones para uso comercial (umbral de ingresos anuales y obligaciones de atribución). Es necesario revisar el texto completo de la licencia antes de un despliegue en producción.
- Dependencia del modelo base: el adaptador requiere descargar `stabilityai/sdxl-turbo` y cargarlo junto con el LoRA; no es un modelo autónomo.
- Falta de documentación técnica: no se detallan hiperparámetros de entrenamiento, composición del dataset ni métricas de evaluación, lo que dificulta evaluar su calidad de forma objetiva.
- Uso responsable: al ser un modelo de generación de imágenes, debe evitarse su empleo para crear contenido engañoso, deepfakes o material que vulnere derechos de imagen.
- Madurez: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado en noviembre de 2026, por lo que no existe evidencia de uso en producción ni validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/engenho-ai/KuroImage-Gen-BR
- Modelo base SDXL Turbo: https://huggingface.co/stabilityai/sdxl-turbo
- Licencia del modelo base: https://huggingface.co/stabilityai/sdxl-turbo/blob/main/LICENSE.md
- Organización Engenho AI en Hugging Face: https://huggingface.co/engenho-ai
