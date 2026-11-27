# qinghuali/Ornith-1.5-35B-MLX-VL-oQ8e

## Resumen

Ornith-1.5-35B-MLX-VL-oQ8e es una conversión al formato MLX del modelo multimodal Ornith-1.5-35B-A3B, publicada por el usuario qinghuali (no por el desarrollador original, ornith-ai). Se trata de una cuantización de 8 bits en precisión mixta realizada con la herramienta oMLX (versión v0.6.3rc2), bajo el esquema propietario denominado "oQ" (oMLX Universal Dynamic Quantization). El sufijo "VL" indica que la cuantización preserva la multimodalidad del modelo original, es decir, mantiene la capacidad de procesar imagen y texto de entrada para generar texto.

El modelo base es un transformer de tipo mixture-of-experts (MoE) con 35.107.181.936 parámetros totales y, según el nombre del repositorio, 3B parámetros activos por token (A3B). Está etiquetado en Hugging Face con la arquitectura `qwen3_5_moe`, lo que sugiere una implementación derivada de la familia Qwen 3.5 MoE. El pipeline declarado es `image-text-to-text`, por lo que el modelo acepta entradas multimodales (imagen y texto) y produce texto.

Su relevancia práctica es doble: por un lado, permite ejecutar un modelo multimodal de 35B parámetros en hardware Apple Silicon mediante MLX, algo inviable con los pesos originales en precisión completa; por otro, el esquema oQ de cuantización mixta busca preservar la calidad en capas sensibles mientras reduce el peso del repositorio a 37,7 GB. El modelo está publicado bajo licencia MIT, lo que facilita su uso comercial, aunque el autor de la conversión no es el autor original del modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (etiqueta `qwen3_5_moe`), multimodal image-text-to-text |
| Parametros totales | 35.107.181.936 |
| Parametros activos | 3B (según el sufijo A3B del modelo base) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8 bits en precisión mixta (esquema oQ de oMLX v0.6.3rc2); existe también una variante oQ6 |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | safetensors (formato MLX) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna más allá de la etiqueta `qwen3_5_moe` y la indicación de que se trata de un MoE con 35B parámetros totales y 3B activos. No se especifican el número de expertos, la estrategia de enrutamiento, la composición del dataset de entrenamiento, el número de tokens vistos ni si se aplicaron técnicas de RLHF o DPO. Tampoco se documenta ninguna innovación técnica propia del modelo base en los materiales consultados.

Lo que sí está documentado es el proceso de conversión: el modelo original se transformó a formato MLX y se cuantizó con oMLX, aplicando una cuantización dinámica de precisión mixta (oQ) que asigna distintos niveles de precisión a distintas partes del modelo en función de su sensibilidad. La variante "VL" preserva explícitamente los módulos de visión, de modo que la cuantización no degrada la ruta multimodal. El resultado ocupa 37,7 GB en el repositorio.

## Capacidades

- Generación de texto conversacional a partir de entradas de imagen y texto (pipeline `image-text-to-text`).
- Comprensión de imágenes combinada con instrucciones en lenguaje natural.
- Razonamiento y generación de texto en inglés, único idioma declarado.
- Ejecución nativa en Apple Silicon mediante la librería MLX.
- Capacidad de operar con 3B parámetros activos por token gracias a la arquitectura MoE, lo que reduce el coste computacional por token frente a un modelo denso de 35B.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Modo thinking, audio u otras capacidades especiales: no disponible en la información proporcionada.

## Casos de uso

- Procesamiento de documentos escaneados en local: el modelo puede recibir una imagen de un documento y generar un resumen o extraer información estructurada, ejecutándose íntegramente en un Mac con Apple Silicon gracias al formato MLX.
- Asistencia sobre capturas de pantalla en herramientas de desarrollo: un flujo de trabajo podría enviar una captura de un error o de una interfaz y obtener una explicación o una sugerencia de corrección en texto.
- Análisis de imágenes en investigación con requisitos de privacidad: al poder ejecutarse en hardware local sin conexión, resulta adecuado para conjuntos de imágenes que no pueden enviarse a servicios en la nube.
- Prototipado rápido de aplicaciones multimodales: la licencia MIT y el formato MLX permiten integrar el modelo en prototipos de aplicaciones de escritorio para macOS sin coste de licencia.
- Descripción automática de imágenes para accesibilidad: generación de texto alternativo descriptivo a partir de imágenes, en inglés, para catálogos o sitios web.
- Evaluación comparativa de cuantizaciones: al existir variantes oQ8 y oQ6 del mismo modelo, sirve para medir en la práctica la pérdida de calidad entre niveles de cuantización en tareas de visión y lenguaje.
- Experimentación académica con modelos MoE multimodales: permite estudiar el comportamiento de un MoE de 35B con 3B activos en un equipo de sobremesa, sin acceso a clústeres de GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/unified memory estimada: el repositorio ocupa 37,7 GB, por lo que se necesita al menos esa cantidad de memoria unificada disponible, más el espacio adicional para el contexto y las activaciones. En la práctica, un equipo con 48 GB o 64 GB de memoria unificada es el mínimo razonable; con 32 GB no es viable.
- GPU recomendadas: al ser un formato MLX, está orientado a Apple Silicon (series M1, M2, M3 y M4, preferiblemente variantes Pro, Max o Ultra). No está pensado para GPU NVIDIA o AMD.
- ¿Cabe en GPU de consumo? No en el sentido habitual: no es un formato para GPU dedicadas de consumo. En Apple Silicon, sí cabe en configuraciones de gama alta con memoria unificada suficiente.
- Opciones de despliegue: MLX y las herramientas del ecosistema oMLX (el conversor referenciado es https://github.com/jundot/omlx). No se indica compatibilidad con vLLM, llama.cpp, Ollama ni TGI, que no soportan este formato de cuantización propietario.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ornith-1.5-35B-MLX-VL-oQ8e | 35B totales / 3B activos | no disponible | MLX safetensors, 8 bits oQ | MIT | Hugging Face (qinghuali) |
| Ornith-1.5-35B-MLX-VL-oQ6e | 35B totales / 3B activos | no disponible | MLX safetensors, 6 bits oQ | MIT | Hugging Face (qinghuali) |
| Ornith-1.5-35B-A3B (original) | 35B totales / 3B activos | no disponible | safetensors (precisión original) | MIT | Hugging Face (ornith-ai) |

No se dispone de información sobre otros modelos comparables de la misma categoría (MoE multimodal de ~35B) en los materiales consultados.

## Limitaciones y advertencias

- El único idioma declarado es el inglés; el rendimiento en castellano u otras lenguas no está documentado y probablemente sea inferior.
- La longitud de contexto no está especificada, lo que impide planificar aplicaciones que dependan de ventanas largas.
- Riesgo de alucinación inherente a los modelos generativos; no se documentan evaluaciones de fidelidad factual.
- Sesgos conocidos: no disponible en la información proporcionada.
- La cuantización oQ de 8 bits en precisión mixta puede introducir degradaciones frente al modelo original, especialmente en tareas de visión fina; no se publican métricas comparativas.
- El formato MLX y el esquema oQ son específicos del ecosistema oMLX; no hay soporte documentado en vLLM, llama.cpp, Ollama o TGI, lo que limita el despliegue a Apple Silicon.
- El autor de esta conversión (qinghuali) no es el desarrollador original (ornith-ai); la licencia MIT se hereda del modelo base, pero conviene verificar los términos en el repositorio original antes de un uso comercial.
- El repositorio tiene un volumen de descargas bajo (201) y ningún "like", lo que sugiere poca validación por parte de la comunidad.
- No se documentan garantías de mantenimiento ni actualizaciones por parte del autor de la conversión.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/qinghuali/Ornith-1.5-35B-MLX-VL-oQ8e
- Modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B
- Colección de cuantizaciones oQ: https://huggingface.co/collections/qinghuali/ornith-15-35b-a3b-oq
- Variante oQ6: https://huggingface.co/liqinghhua/Ornith-1.5-35B-MLX-VL-oQ6e
- Herramienta oMLX: https://github.com/jundot/omlx
- Documentación de la cuantización oQ: https://github.com/jundot/omlx/blob/main/docs/oQ_Quantization.md
- Sitio de Ornith AI: https://ornith.ai/
- Ficha en socket.dev: https://socket.dev/huggingface/package/qinghuali/ornith-1.5-35b-mlx-vl-oq8e
- Ficha en essamamdani.com: https://essamamdani.com/ai-models/hf-qinghuali-ornith-1-5-35b-mlx-vl-oq8e
