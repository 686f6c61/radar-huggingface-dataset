# OzzyGT/Flux_3_Image_Klein_sdnq_dynamic_8bit

## Resumen

Flux 3 Image Klein SDNQ Dynamic 8bit es una versión cuantizada a 8 bits del modelo de generación y edición de imágenes black-forest-labs/flux-3-image-klein, publicada por el usuario OzzyGT en HuggingFace. Se trata de un artefacto de cuantización posterior al entrenamiento (no de un modelo entrenado desde cero): el autor aplica SDNQ, una técnica de cuantización dinámica a 8 bits, sobre el transformer de difusión y sobre el codificador de texto, dejando el VAE en bf16.

El modelo resuelve el problema del coste de memoria del FLUX 3 Image Klein original: la cuantización reduce el peso de los parámetros y permite ejecutar todo el pipeline en una sola GPU, con un pico medido de 15,4 GiB de VRAM generando a 2048x1152 píxeles. Mantiene las capacidades del modelo base, orientado a image-to-image, edición de imágenes guiada por instrucciones y generación con control de composición mediante cajas delimitadoras (bounding boxes) descritas en el prompt.

El repositorio es de tipo diffusers y requiere importar la librería `sdnq` (versión 0.2.8 o superior) antes de cargar los pesos, además de una versión de diffusers con soporte para FLUX 3. El modelo tiene 5.554.024.192 parámetros, el repo ocupa 10,8 GB y, en el momento de redactar esta ficha, acumula 0 descargas y 0 likes, por lo que no cuenta con validación de la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusion (transformer) con codificador de texto Qwen3-VL-4B-Instruct y VAE; pipeline image-to-image de diffusers (Modular Pipeline) |
| Parametros totales | 5.554.024.192 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (no se documenta una ventana de contexto en la model card) |
| Tipos de cuantizacion | INT8 dinamico mediante SDNQ en transformer y codificador de texto; VAE en bf16; no se documentan otros formatos |
| Idiomas soportados | en (ingles) |
| Licencia | flux-kommunity-license (FLUX Kommunity License v1.0); el codificador de texto Qwen3-VL-4B-Instruct es Apache-2.0 |
| Formato de pesos | safetensors (libreria diffusers) |

## Arquitectura y entrenamiento

El modelo base, FLUX 3 Image Klein, es un sistema de difusion para generacion y edicion de imagenes que combina un transformer de difusion con un codificador de texto multimodal Qwen3-VL-4B-Instruct y un VAE. La variante aqui descrita no modifica la arquitectura: es una cuantizacion del modelo original, en la que el transformer y el codificador de texto se convierten a 8 bits con SDNQ y el VAE permanece en bf16. El pipeline se ejecuta con la clase ModularPipeline de diffusers, lo que implica cargar los componentes por separado y registrar previamente los pesos cuantizados importando `sdnq`.

No se dispone de informacion sobre el entrenamiento original (numero de tokens, composicion del dataset, uso de RLHF/DPO) ni sobre el procedimiento exacto de calibracion de la cuantizacion mas alla de que es dinamica y a 8 bits. La unica innovacion tecnica documentada es el uso de SDNQ para cuantizar simultaneamente el transformer y el codificador de texto, lo que permite un pico de VRAM de 15,4 GiB a 2048x1152 segun el ejemplo incluido en la model card. Se requiere SDNQ v0.2.8 o superior.

## Capacidades

- Generacion de texto a imagen: produce imagenes a partir de prompts descriptivos largos, con control de iluminacion, optica, composicion y estilo (el ejemplo de la model card simula una camara ARRI Alexa Mini LF con optica Cooke S4).
- Edicion de imagenes (image-to-image): el pipeline esta etiquetado como image-to-image y hereda las capacidades de edicion del modelo base.
- Control de composicion mediante bounding boxes: el prompt admite un formato de layout con cajas delimitadoras (listas de objetos con `id`, `bbox` y `desc`) que fijan la posicion y el tamano relativo de cada elemento de la escena.
- Renderizado de texto en imagen: el ejemplo incluye carteles con texto legible ("WHISKERS & WAGS", "ADOPT A FRIEND TODAY"), lo que indica cierta capacidad de generar texto integrado en la escena.
- Condicionamiento multimodal mediante Qwen3-VL-4B-Instruct: el uso de un codificador de texto con componente de vision es coherente con tareas de edicion guiada por imagen de entrada.
- Resoluciones soportadas: el ejemplo documentado genera a 2048x1152; no se especifican mas resoluciones en la informacion disponible.
- Tool calling, function calling, agentes y razonamiento multi-paso: no aplica (es un modelo de generacion de imagenes, no un LLM conversacional).
- Capacidades multilingues: la model card solo declara ingles (`language: en`); no se documenta soporte de otros idiomas.

## Casos de uso

- Edicion de imagenes en produccion grafica: dado que el pipeline es image-to-image, se puede usar para modificar fotografias existentes (cambiar iluminacion, sustituir objetos, retocar escenas) manteniendo la composicion original, con la ventaja de que el modelo cuantizado cabe en una sola GPU de 16 GiB o mas.
- Generacion de ilustraciones con composicion controlada: el formato de bounding boxes permite especificar la posicion exacta de cada elemento de la escena, lo que resulta util para storyboards, mockups publicitarios o diseno de escenarios donde el encuadre importa.
- Creacion de material grafico para marketing y ecommerce: se pueden generar imagenes de producto en contexto (bodegones, escenas de uso) a partir de prompts detallados, sin necesidad de un estudio fotografico.
- Prototipado rapido de conceptos visuales: equipos de diseno pueden iterar sobre descripciones textuales y obtener imagenes de alta resolucion (2048x1152) con el mismo seed, lo que permite comparar variantes de forma reproducible.
- Investigacion en cuantizacion de modelos de difusion: el repositorio sirve como referencia practica para medir el impacto de SDNQ INT8 frente al modelo bf16 con el mismo prompt y seed, ya que la model card incluye una comparativa visual de ambos.
- Despliegue en infraestructura limitada: al requerir aproximadamente 15,4 GiB de VRAM en el ejemplo documentado, es viable en estaciones de trabajo con una unica GPU consumer de gama alta, algo que la version bf16 puede no permitir.
- Integracion en herramientas creativas internas: la API de diffusers (ModularPipeline) facilita envolver el modelo en un servicio propio para generar o editar imagenes bajo demanda.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente incluye una comparacion visual cualitativa entre el modelo bf16 original y esta version INT8, generada con el mismo prompt y el mismo seed (seed 7), sin metricas numericas como FID, CLIP score, SSIM ni resultados en tareas estandar.

## Requisitos de hardware

- VRAM estimada para inferencia: 15,4 GiB de pico segun la medicion del autor a 2048x1152 con el pipeline completo (transformer INT8, codificador de texto INT8 y VAE en bf16).
- Peso de los pesos cuantizados: 5.554.024.192 parametros en INT8 equivalen aproximadamente a 5,5 GB solo de pesos; el repositorio completo ocupa 10,8 GB e incluye ademas el VAE y los componentes auxiliares.
- GPU recomendadas: cualquier GPU con al menos 16 GiB de VRAM. Encajan una RTX 4090 (24 GB), RTX 5090 (32 GB), A100 (40/80 GB) y H100 (80 GB). Una RTX 4080 o 5080 de 16 GB queda en el limite y podria requerir reducir la resolucion.
- Cabe en GPU consumer: si, en modelos de 16 GB o mas, con margen escaso a 2048x1152; a resoluciones menores el margen aumenta.
- Opciones de despliegue: diffusers con la clase ModularPipeline, importando `sdnq` (v0.2.8 o superior) antes de cargar el modelo. No se documentan soportes para vLLM, llama.cpp, Ollama ni TGI, que en cualquier caso no aplican a un modelo de difusion de este tipo.
- Latencia y throughput: no disponibles. No se publican tiempos de generacion por imagen ni iteraciones por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Precision | VRAM en inferencia | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| OzzyGT/Flux_3_Image_Klein_sdnq_dynamic_8bit (este modelo) | 5.554.024.192 | INT8 dinamico (SDNQ), VAE bf16 | 15,4 GiB de pico a 2048x1152 | FLUX Kommunity License v1.0 | HuggingFace, diffusers |
| black-forest-labs/flux-3-image-klein (modelo base) | No disponible | bf16 | No disponible | FLUX Kommunity License v1.0 | HuggingFace |
| Otras variantes cuantizadas de FLUX 3 Image Klein | No disponible | No disponible | No disponible | No disponible | No disponible |

El codificador de texto Qwen3-VL-4B-Instruct, componente compartido con el modelo base, se distribuye bajo Apache-2.0 segun la model card. No se dispone de datos de rendimiento comparado (FID, CLIP score u otras metricas) entre este modelo y el bf16 original, por lo que la unica referencia es la comparacion visual incluida por el autor.

## Limitaciones y advertencias

- Artefacto de cuantizacion sin validacion de la comunidad: 0 descargas y 0 likes en el momento de redactar la ficha; no hay evidencia externa de calidad ni de estabilidad.
- Perdida de calidad potencial: la cuantizacion INT8 del transformer y del codificador de texto puede introducir diferencias frente al modelo bf16. La model card solo ofrece una comparacion visual con un unico prompt y seed, insuficiente para generalizar.
- Dependencia de versiones concretas: requiere SDNQ v0.2.8 o superior y una version de diffusers con soporte para FLUX 3. El codigo de ejemplo importa `sdnq` antes de cargar el pipeline; omitir ese paso impide registrar los pesos cuantizados.
- Idioma: solo se declara ingles. No hay informacion sobre el comportamiento con prompts en castellano u otros idiomas.
- Riesgo de alucinacion visual: como todo modelo de difusion, puede generar elementos inexistentes en el prompt, texto mal formado dentro de la imagen o inconsistencias anatomicas y fisicas. El propio ejemplo incluye gran cantidad de objetos y texto, un escenario propenso a errores.
- Restricciones de licencia: el modelo se publica bajo flux-kommunity-license (FLUX Kommunity License v1.0), la misma que el modelo base, e incluye un archivo LICENSE.md. No se detallan en la informacion disponible los terminos concretos de uso comercial, por lo que es imprescindible revisar dicho archivo antes de cualquier despliegue en produccion.
- Ausencia de datos de entrenamiento y evaluacion: no hay informacion sobre el dataset original, el proceso de calibracion de SDNQ, ni metricas objetivas de rendimiento.
- Fechas de publicacion inusuales: el repositorio figura como creado y actualizado el 15 de octubre de 2026, dato que conviene verificar en la pagina del modelo.
- Consumo de VRAM ajustado: el pico de 15,4 GiB deja poco margen en GPUs de 16 GB, especialmente si se aumenta la resolucion o el numero de pasos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/OzzyGT/Flux_3_Image_Klein_sdnq_dynamic_8bit
- Modelo base: https://huggingface.co/black-forest-labs/flux-3-image-klein
- Repositorio de SDNQ: https://github.com/Disty0/sdnq
- Licencia (LICENSE.md en el repositorio del modelo): https://huggingface.co/OzzyGT/Flux_3_Image_Klein_sdnq_dynamic_8bit/blob/main/LICENSE.md
- Licencia del codificador de texto (Apache-2.0, carpeta text_encoder): https://huggingface.co/OzzyGT/Flux_3_Image_Klein_sdnq_dynamic_8bit/tree/main/text_encoder
- Ejemplos de imagenes de comparacion bf16 frente a INT8: https://huggingface.co/datasets/OzzyGT/diffusers-examples
