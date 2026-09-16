# changwangss/wan22-svdquant-signround-nosmooth

## Resumen

Este repositorio contiene una versión cuantizada a 8 bits del modelo de generación de vídeo a partir de texto Wan2.2, desarrollado originalmente por el equipo Wan-AI de Alibaba. Se trata de un derivado publicado por el usuario changwangss bajo licencia Apache-2.0; el nombre del repositorio indica que la receta de cuantización combina SVDQuant con redondeo SignRound y sin suavizado (smoothing). El modelo base Wan2.2 aborda la generación de vídeo de alta calidad mediante un transformer de difusión con arquitectura de mezcla de expertos (MoE).

El checkpoint distribuido ocupa 28,5 GB y declara 7.857.873.984 parámetros en sus ficheros safetensors. Está etiquetado como pipeline text-to-video, es compatible con la librería diffusers a través de WanPipeline y se publica en formato de 8 bits, lo que reduce el coste de memoria frente a los pesos de precisión completa del modelo original.

Su relevancia radica en que permite ejecutar un modelo de vídeo de gran tamaño en hardware más modesto conservando la mayor parte de las capacidades del original. No obstante, es un repositorio con cero descargas y cero valoraciones al redactar esta ficha, y no incluye benchmarks propios ni detalles de la receta de cuantización más allá de lo que sugiere su nombre.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer de difusión (DiT) para vídeo; el modelo base Wan2.2 incorpora arquitectura de mezcla de expertos (MoE) |
| Parámetros totales | 7.857.873.984 (según los pesos safetensors del repositorio) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible o no aplicable (modelo de vídeo; la entrada es un prompt de texto, sin ventana de contexto declarada) |
| Tipos de cuantización | 8 bits (etiqueta "8-bit"); el nombre del repositorio sugiere SVDQuant con redondeo SignRound y sin suavizado, aunque no se documenta la receta exacta |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (librería diffusers) |

## Arquitectura y entrenamiento

El modelo base Wan2.2 es una familia de modelos generativos de vídeo a gran escala. Según la documentación oficial, introduce una arquitectura MoE en modelos de difusión para vídeo: el proceso de eliminación de ruido se reparte entre expertos especializados por tramos temporales, lo que amplía la capacidad total del modelo manteniendo un coste computacional comparable. El modelo T2V-A14B, del que previsiblemente deriva este checkpoint, genera vídeos de 5 segundos a resoluciones de 480P y 720P. La familia incorpora además un VAE propio (Wan2.2-VAE) con una tasa de compresión de 16×16×4 en la variante de 5B.

En cuanto a los datos, la documentación del modelo base indica un incremento del 65,6 % en imágenes y del 83,2 % en vídeos respecto a Wan2.1, así como el uso de datos estéticos etiquetados con información de iluminación, composición, contraste y tono de color para permitir un control cinematográfico preciso. Al tratarse de un modelo de difusión, los conceptos de RLHF o DPO no aplican tal como se plantean en modelos de lenguaje. Para este repositorio concreto no se especifican ni el proceso de entrenamiento ni los datos de calibración empleados en la cuantización a 8 bits.

## Capacidades

- Generación de vídeo a partir de texto (text-to-video).
- Integración con la librería diffusers mediante el pipeline WanPipeline.
- Soporte de resoluciones 480P y 720P en el modelo base T2V-A14B (no confirmado específicamente para este checkpoint).
- Control de estética cinematográfica mediante etiquetas de iluminación, composición, contraste y tono de color, según el modelo base.
- Generación de movimiento complejo, fruto del aumento de datos de entrenamiento del modelo base.
- Compatibilidad con ComfyUI e inferencia multi-GPU según la documentación del modelo base.
- La cuantización a 8 bits tiene como objetivo reducir el consumo de memoria y facilitar el despliegue.
- No consta soporte de tool calling, function calling, uso como agente, visión, audio ni modo de razonamiento explícito.

## Casos de uso

- Previsualización de storyboards y animáticas: el modelo permite convertir un guion o descripción textual en un clip de 5 segundos a 480P o 720P, útil para validar encuadres y ritmo antes de producir.
- Creación de contenido para marketing y redes sociales: generación rápida de vídeos cortos a partir de prompts, con control de estilo cinematográfico mediante etiquetas de iluminación y composición.
- Prototipado de assets para videojuegos y animación: producción de clips de referencia para animadores y diseñadores de nivel antes de invertir en renderizado final.
- Vídeo de producto para comercio electrónico: generación de clips demostrativos a partir de descripciones textuales, reduciendo la necesidad de rodajes.
- Material educativo y divulgativo: creación de secuencias ilustrativas sobre conceptos abstractos a partir de texto, con coste de producción bajo.
- Investigación en cuantización de modelos generativos: al ser un checkpoint de 8 bits, sirve para estudiar el impacto de recetas como SVDQuant con redondeo SignRound sobre la calidad final del vídeo.
- Despliegue en hardware de consumo: al reducir el peso de los parámetros, permite experimentar con generación de vídeo en GPU de gama alta para usuarios individuales o equipos pequeños.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

La documentación del modelo base menciona que Wan2.2 supera a modelos comerciales en la mayoría de dimensiones del benchmark Wan-Bench 2.0, pero no se aportan cifras concretas ni resultados asociados a este checkpoint cuantizado.

## Requisitos de hardware

- Peso de los pesos cuantizados: aproximadamente 7,9 GB a 8 bits (7.857.873.984 parámetros × 1 byte). El repositorio completo ocupa 28,5 GB, por lo que probablemente incluye además el VAE, el codificador de texto y/u otros ficheros.
- VRAM estimada (estimación propia, no confirmada por el autor): un mínimo de 12-16 GB para resoluciones bajas (480P) y 24 GB o más para 720P, teniendo en cuenta el VAE, el codificador de texto y las activaciones del proceso de difusión.
- GPU recomendadas: RTX 4090 (24 GB) o RTX 3090 (24 GB) para uso en consumidor; A100 y H100 para despliegues en servidor o inferencia multi-GPU.
- Cabe en GPU de consumo de gama alta con 24 GB de VRAM para resoluciones reducidas; en tarjetas con menos memoria probablemente requiera cuantizaciones adicionales u offloading.
- Opciones de despliegue: diffusers con WanPipeline (confirmado), ComfyUI (según el modelo base) e inferencia multi-GPU (según el modelo base). Ollama y llama.cpp no aplican, al no ser un modelo de lenguaje.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Arquitectura | Resolución | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| changwangss/wan22-svdquant-signround-nosmooth | 7,86 mil millones (safetensors) | DiT cuantizado a 8 bits derivado de Wan2.2 | no disponible | Apache-2.0 | HuggingFace (autor individual) |
| Wan2.2-T2V-A14B | no disponible en la información | MoE de difusión | 480P y 720P | Apache-2.0 | HuggingFace y ModelScope (Wan-AI) |
| Wan2.2-TI2V-5B | aproximadamente 5 mil millones (según el nombre) | VAE de alta compresión, T2V + I2V | 720P a 24 fps | Apache-2.0 | HuggingFace y ModelScope (Wan-AI) |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- La cuantización a 8 bits puede degradar la fidelidad visual y la coherencia del movimiento respecto a los pesos de precisión completa del modelo original; no se han publicado evaluaciones que cuantifiquen esta pérdida.
- No se han publicado benchmarks ni evaluaciones independientes para este checkpoint concreto.
- El repositorio tiene cero descargas y cero valoraciones, por lo que su calidad y reproducibilidad no están contrastadas por la comunidad.
- Está publicado por un autor individual y no por el equipo oficial Wan-AI, por lo que no cuenta con el respaldo del proyecto original.
- No se documentan los datos de calibración ni la metodología exacta de cuantización, más allá de lo que sugiere el nombre del repositorio.
- Riesgo de alucinación visual: los modelos de vídeo generan artefactos, incoherencias físicas y movimientos irreales, especialmente en escenas complejas o con muchos objetos.
- No hay información sobre idiomas soportados; el modelo base está pensado principalmente para prompts en inglés, aunque esto no está confirmado para este checkpoint.
- Licencia Apache-2.0: permite uso comercial, pero al ser un derivado conviene revisar también las condiciones del modelo base Wan2.2.
- La diferencia entre el tamaño del repositorio (28,5 GB) y el peso teórico de los parámetros (unos 7,9 GB) implica un coste de descarga y almacenamiento considerable.
- Los modelos de generación de vídeo pueden emplearse para crear contenido engañoso o suplantar identidades; se recomienda aplicar salvaguardas y uso responsable.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/changwangss/wan22-svdquant-signround-nosmooth
- Informe técnico de Wan (arXiv 2503.20314): https://arxiv.org/abs/2503.20314
- Referencia arXiv 2309.14509 incluida en las etiquetas del repositorio: https://arxiv.org/abs/2309.14509
- Repositorio GitHub de Wan2.2: https://github.com/Wan-Video/Wan2.2
- Organización Wan-AI en HuggingFace: https://huggingface.co/Wan-AI/
- Organización Wan-AI en ModelScope: https://modelscope.cn/organization/Wan-AI
- Blog oficial de Wan: https://wan.video/welcome
- Sitio web de Wan: https://wan.video
- Servidor de Discord: https://discord.gg/AKNgpMK4Yj
