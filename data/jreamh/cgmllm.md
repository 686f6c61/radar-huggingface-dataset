# JreamH/CGMLLM

## Resumen

CG-MLLM (v0.1) es un modelo multimodal de lenguaje de gran escala orientado a contenido 3D, desarrollado por investigadores de la Universidad de Zhejiang y LIGHTSPEED, y presentado en ICML 2026. Combina un backbone vision-lenguaje Qwen3-VL-2B-Instruct con el VAE de formas de Hunyuan3D-2.1 como tokenizador latente 3D, lo que le permite tanto describir contenido 3D existente (3D captioning) como generar mallas 3D a partir de imágenes o texto.

El checkpoint publicado es la variante multitarea v0.1, que cubre image-to-3D, text-to-3D, comprensión de imagen y comprensión de 3D en un único modelo de aproximadamente 2B parámetros. El autor mantiene además un checkpoint especializado de 4B para image-to-3D entrenado sobre HY3D-Bench, publicado en un repositorio separado.

Su relevancia radica en unificar en un solo MLLM tareas de entendimiento y generación 3D, un área donde tradicionalmente se emplean pipelines separados (un modelo de captioning y otro generativo). La licencia Apache-2.0 y el tamaño contenido del backbone facilitan su evaluación y despliegue en entornos de investigación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MLLM basado en transformer (backbone Qwen3-VL-2B-Instruct) con tokenizador latente 3D Hunyuan3D-2.1 VAE |
| Parametros totales | aproximadamente 2B (backbone Qwen3-VL-2B); no se detalla el recuento exacto del conjunto con el VAE |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (`ema.safetensors`) |

## Arquitectura y entrenamiento

CG-MLLM sigue un esquema de MLLM con proyección hacia un espacio latente 3D. El backbone es Qwen3-VL-2B-Instruct, que procesa entradas de imagen y texto; el VAE de formas de Hunyuan3D-2.1 actúa como tokenizador latente 3D, de modo que el modelo puede emitir representaciones latentes que se decodifican a mallas. El trabajo declara inspiración en BAGEL (ByteDance-Seed) para el paradigma de modelado multimodal unificado.

El checkpoint v0.1 es multitarea y cubre image-to-3D, text-to-3D, comprensión de imagen y comprensión de 3D. Existe una variante de 4B (Qwen3-VL-4B) especializada en image-to-3D y entrenada sobre HY3D-Bench, publicada en `JreamH/CGMLLM-4B-i2o`. No se han publicado en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF o DPO.

## Capacidades

- Generación de mallas 3D a partir de una imagen (image-to-3D).
- Generación de mallas 3D a partir de texto (text-to-3D).
- Descripción de contenido 3D existente (3D captioning).
- Comprensión de imágenes (image understanding) heredada del backbone Qwen3-VL.
- Comprensión de escenas u objetos 3D.
- Procesamiento multimodal conjunto de imagen, texto y latentes 3D en un único modelo.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según la metadata del repositorio.
- Modo thinking, visión o audio adicionales: no disponible.

## Casos de uso

- Prototipado de assets 3D a partir de bocetos: un diseñador sube una imagen de referencia y el modelo genera una malla inicial que se refina después en Blender o Maya, reduciendo el tiempo de bloqueo geométrico.
- Generación de props para videojuegos: a partir de descripciones textuales se producen mallas de objetos secundarios (mobiliario, herramientas, vegetación) que se integran en el pipeline de arte con posterior retopología.
- Catalogación y etiquetado de bibliotecas 3D: el modelo describe automáticamente mallas existentes, generando metadatos textuales que alimentan motores de búsqueda o sistemas de gestión de assets.
- Previsualización en comercio electrónico: conversión de fotografías de producto en modelos 3D ligeros para visores web, con la ventaja de que un mismo modelo cubre la descripción y la generación.
- Investigación en representaciones 3D latentes: al exponer el VAE de Hunyuan3D-2.1 junto al MLLM, sirve como base para experimentos de alineación visión-lenguaje-geometría.
- Enriquecimiento de datasets 3D: generación masiva de pares imagen-malla y texto-malla para entrenar otros modelos, aprovechando la licencia Apache-2.0.
- Asistentes de modelado en CAD creativo: el modelo interpreta una imagen o descripción y produce una malla base sobre la que el usuario itera con herramientas de edición.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. El repositorio ocupa 15,4 GB, lo que sugiere pesos en precisión alta (probablemente bf16/fp32) e incluye componentes del VAE; con cuantización a 8 bits el backbone de 2B rondaría los 2-3 GB, pero el dato no está confirmado.
- GPU recomendadas: no disponible. Por tamaño del backbone, una GPU con 16-24 GB (RTX 4090, A10G, L4) debería ser suficiente para el componente de lenguaje; el VAE y la decodificación de mallas añaden requisitos no especificados.
- Cabe en GPU de consumo: previsiblemente sí para el backbone en cuantización, aunque no hay confirmación oficial ni instrucciones de despliegue en la model card.
- Opciones de despliegue: el autor remite al repositorio de GitHub (https://github.com/dreaming-huang/CG-MLLM) para los comandos de inferencia; no se documenta soporte de vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tareas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CG-MLLM v0.1 | aprox. 2B | no disponible | image-to-3D, text-to-3D, captioning 3D, comprensión de imagen | Apache-2.0 | Hugging Face + GitHub |
| CG-MLLM-4B-i2o | aprox. 4B | no disponible | image-to-3D especializado (HY3D-Bench) | no disponible en la información | Hugging Face |
| Hunyuan3D-2.1 | no disponible | no disponible | generación 3D (VAE de formas usado como componente) | licencia propia de Tencent | GitHub |
| Qwen3-VL-2B-Instruct | aprox. 2B | no disponible | visión-lenguaje (sin generación 3D) | licencia propia de Qwen | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Modelo en versión v0.1: se trata de un checkpoint de investigación, no de un producto estable para producción.
- Idioma: la metadata declara únicamente inglés; el rendimiento en castellano no está evaluado.
- Riesgo de alucinación: como MLLM generativo, puede producir descripciones 3D o geometrías plausibles pero incorrectas; requiere validación humana en flujos críticos.
- Calidad geométrica: no se publican métricas de fidelidad de malla (Chamfer, F-score) en la información disponible.
- Licencia: Apache-2.0 para CG-MLLM, pero los componentes subyacentes (Qwen3-VL, Hunyuan3D-2.1, BAGEL) tienen sus propias licencias que deben respetarse en uso comercial.
- Dependencia de código externo: la inferencia solo está documentada en el repositorio de GitHub; no hay integración con servidores de inferencia estándar.
- Contexto y cuantizaciones no documentados: dificulta planificar despliegues con requisitos estrictos de memoria.
- Sesgos: no se documentan análisis de sesgo en la información proporcionada.

## Enlaces

- Hugging Face (modelo): https://huggingface.co/JreamH/CGMLLM
- Hugging Face (checkpoint 4B image-to-3D): https://huggingface.co/JreamH/CGMLLM-4B-i2o
- Repositorio de código: https://github.com/dreaming-huang/CG-MLLM
- Paper en arXiv: https://arxiv.org/abs/2601.21798
- Hugging Face Papers: https://huggingface.co/papers/2601.21798
- Página del proyecto: https://cg-mllm.jream.top/
- Póster ICML 2026: https://icml.cc/virtual/2026/poster/63909
- Backbone Qwen3-VL-2B-Instruct: https://huggingface.co/Qwen/Qwen3-VL-2B-Instruct
- Hunyuan3D-2.1: https://github.com/Tencent-Hunyuan/Hunyuan3D-2.1
- BAGEL: https://github.com/ByteDance-Seed/Bagel
