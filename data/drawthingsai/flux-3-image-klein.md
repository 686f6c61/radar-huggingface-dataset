# drawthingsai/flux-3-image-klein

## Resumen

FLUX 3 Image Klein es un modelo de pesos abiertos de 5.600 millones de parámetros para generación de imágenes a partir de texto y edición de imágenes. Lo desarrolla Black Forest Labs y la ficha consultada se publica bajo la cuenta `drawthingsai` en Hugging Face. Resuelve tres tareas con un único transformer de imagen: texto a imagen, edición con una imagen de referencia y composición con varias referencias, hasta un máximo de 10, devolviendo siempre una imagen.

El modelo pertenece a la familia FLUX 3 y utiliza Qwen3-VL-4B-Instruct como codificador de texto, además de un autoencoder de imagen. La etiqueta de 5,6B corresponde solo al transformer de imagen; el codificador de texto y el upsampler de prompts son componentes separados. Está pensado para autohospedaje y para la API de BFL, con un checkpoint destilado de 16 pasos y variantes en BF16, FP8 y NVFP4.

Su relevancia actual está en unificar generación y edición multi-referencia con control de layout mediante cajas delimitadoras en una rejilla de 0 a 1000, y en exigir un upsampler de prompts para evitar resultados genéricos. La licencia FLUX Kommunity permite uso no comercial y una excepción de salida comercial para usuarios que cumplan sus términos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer de difusión para imagen con muestreo flow-map; pipeline modular en diffusers |
| Parámetros totales | 5,6B en el transformer de imagen; el codificador de texto Qwen3-VL-4B-Instruct es adicional |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica como ventana de texto; acepta hasta 10 imágenes de referencia |
| Tipos de cuantización | BF16, FP8 (fp8r) y NVFP4 |
| Idiomas soportados | Inglés (en) |
| Licencia | FLUX Kommunity License (flux-kommunity-license) |
| Formato de pesos | safetensors |
| Pasos de inferencia | 16 en el checkpoint destilado; 50 en la base |
| Guidance | Ninguno en el destilado; 3.5 en la base |
| Librería | diffusers |
| Tamaño del repositorio | 3,4 GB según Hugging Face |

## Arquitectura y entrenamiento

La arquitectura se organiza en tres componentes: un transformer de imagen de 5,6B parámetros, un codificador de texto Qwen3-VL-4B-Instruct y un autoencoder de imagen. El transformer trabaja con muestreo flow-map y el pipeline es modular en diffusers. El repositorio incluye el transformer en BF16 y variantes cuantizadas FP8 y NVFP4, junto con el codificador de texto y el autoencoder. El checkpoint destilado está optimizado para generación y edición en 16 pasos sin guidance, mientras que el checkpoint Base, no destilado, requiere 50 pasos y guidance 3.5 y está orientado a fine-tuning, entrenamiento de LoRA e investigación.

El modelo acepta prompts en forma de captions completas de escena. La model card insiste en que no debe usarse sin un upsampler de prompts: el upsampler oficial es un modelo separado de 9B y 18,8 GB, cargado por defecto en el código de referencia, y también puede sustituirse por otro LLM con un system prompt que expanda la petición. Para el control de layout se usan cajas delimitadoras en una rejilla de 0 a 1000; las cajas guían colocación y escala, pero no imponen una máscara dura sobre los píxeles. No se especifican el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron RLHF o DPO.

## Capacidades

- Generación texto a imagen a partir de captions completas de escena.
- Edición con una imagen de referencia: restilizado, cambio de iluminación, sustitución de objetos y modificaciones guiadas por prompt.
- Composición multi-referencia con hasta 10 imágenes de entrada en una sola generación.
- Control de layout mediante cajas delimitadoras en una rejilla de 0 a 1000, con operaciones de recoloreado, movimiento, reemplazo y eliminación de elementos.
- Renderizado de texto dentro de las imágenes generadas.
- Integración con diffusers mediante pipeline modular, pasando `prompt` para texto a imagen o `image` para edición.
- Código de referencia con CLI, clasificador de seguridad NSFW y upsampler de prompts.
- Variantes cuantizadas FP8 y NVFP4 para reducir requisitos de memoria.
- No dispone de tool calling, function calling ni capacidades de agente, al no ser un modelo de lenguaje.
- El soporte multilingüe no está documentado: la model card declara únicamente inglés.

## Casos de uso

- Fotografía de producto en comercio electrónico: el modelo puede recibir una o varias imágenes de referencia del producto y generar variaciones de escena, fondo e iluminación manteniendo la identidad visual, gracias a la composición multi-referencia y al control por prompt.
- Edición de interiores y arquitectura: a partir de una fotografía de una habitación, se puede pedir un cambio de materiales, hora del día o estilo decorativo; las cajas permiten mover o reemplazar muebles concretos sin rehacer toda la escena.
- Composición de personajes para narrativa visual: se pueden combinar hasta 10 referencias de personaje, vestuario y entorno para producir ilustraciones consistentes de storyboard o cómic, con control de colocación mediante cajas.
- Diseño de carteles y material gráfico con texto: el modelo renderiza texto dentro de la imagen, lo que permite generar banners, portadas y carteles con titulares integrados en la composición.
- Mockups y previsualización de campañas: las cajas delimitadoras permiten reservar zonas para logotipos, titulares o productos, y después recolorear o sustituir elementos sin salir del mismo modelo.
- Iteración rápida de assets de marketing: con el checkpoint destilado de 16 pasos y sin guidance, se pueden generar variantes en menos pasos que con el modelo base, lo que facilita ciclos de exploración creativa.
- Previsualización de escenarios para videojuegos o cine: el modelo puede generar composiciones multi-referencia con layout controlado para explorar dirección de arte antes de producir assets definitivos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni evaluaciones de calidad de imagen, FID o CLIP. Tampoco se proporcionan cifras de latencia o throughput.

## Requisitos de hardware

- Transformer en BF16: aproximadamente 11,2 GB solo para pesos, calculado a partir de 5,6B parámetros a 2 bytes por parámetro.
- Transformer en FP8: aproximadamente 5,6 GB de pesos.
- Transformer en NVFP4: aproximadamente 2,8 GB de pesos.
- Codificador Qwen3-VL-4B-Instruct en BF16: aproximadamente 8 GB de pesos; en FP8, alrededor de 4 GB. Son estimaciones aritméticas, no requisitos oficiales.
- Upsampler de prompts: 18,8 GB según la model card, correspondiente a un modelo separado de 9B.
- Autoencoder: tamaño no disponible.
- Pipeline completo con transformer BF16, codificador BF16 y upsampler: más de 38 GB solo en pesos, antes de activaciones y memoria de trabajo.
- GPU recomendadas para BF16 completo: A100 de 80 GB o H100 de 80 GB. Una A100 de 40 GB puede quedarse justa al sumar codificador, autoencoder y upsampler.
- GPU de consumo: una RTX 4090 de 24 GB puede abordar el transformer en FP8 o NVFP4 junto con el codificador cuantizado, probablemente con offloading y externalizando el upsampler; no hay confirmación oficial de que el pipeline completo quepa en 24 GB.
- Despliegue: pipeline modular de diffusers, CLI del repositorio de referencia `black-forest-labs/flux-3-image-klein` y API de BFL. vLLM, llama.cpp, Ollama y TGI no están documentados para este modelo porque no es un modelo de lenguaje.
- Los paquetes cuantizados necesitan un loader que soporte su formato; el tamaño de archivo no equivale al uso total de memoria GPU.
- El clasificador de seguridad `Falconsai/nsfw_image_detection` se carga siempre en el flujo de referencia.
- Latencia y throughput: no disponibles. Como referencia de coste computacional, el checkpoint destilado usa 16 pasos frente a los 50 del Base.

## Comparativa con modelos similares

| Modelo | Parámetros | Pasos | Guidance | Referencias | Licencia | Enfoque |
|---|---|---|---|---|---|---|
| FLUX 3 Image Klein (destilado) | 5,6B en transformer | 16 | Ninguno | Hasta 10 | FLUX Kommunity | Generación y edición, autohospedaje y API de BFL |
| FLUX 3 Image Klein Base | 5,6B en transformer | 50 | 3.5 | Hasta 10 | FLUX Kommunity | Fine-tuning, LoRA e investigación |
| Alternativas de otros fabricantes | No disponible | No disponible | No disponible | No disponible | No disponible | No disponible en la información proporcionada |

No se dispone de datos de otros modelos comparables en la información proporcionada. La comparación directa más fiable es entre el checkpoint destilado y el Base de la misma familia.

##
