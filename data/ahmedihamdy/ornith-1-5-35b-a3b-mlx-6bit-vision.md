# ahmedihamdy/Ornith-1.5-35B-A3B-MLX-6bit-vision

## Resumen

Ornith-1.5-35B-A3B-MLX-6bit-vision es una compilación comunitaria del modelo multimodal Ornith-1.5-35B-A3B de ornith-ai, publicada por el usuario ahmedihamdy en Hugging Face. El modelo base es un transformer de tipo mixture-of-experts (MoE) con 35.107.180.016 parámetros totales, del cual se activan 8 de sus 256 expertos por token (aproximadamente 3B parámetros activos), lo que le permite una velocidad de inferencia notable para su tamano. Esta variante concreta restaura la torre de visión original del modelo base sobre los pesos de texto cuantizados a 6 bits publicados por ornith-ai, de modo que recupera la capacidad de procesar imágenes y texto.

La relevancia de esta ficha radica en que se trata de un ejemplo de empaquetado reproducible para Apple Silicon: el autor documenta los commits exactos de origen, los hashes SHA-256 de cada fichero de pesos y un proceso de verificación que comprueba que la torre de visión pertenece a los pesos de texto con los que fue entrenada (24 de 24 tensores de texto muestreados coinciden con el modelo base). El resultado es un modelo image-text-to-text de 29,08 GB que se ejecuta en macOS 14 o superior mediante la aplicación Astronomical o la librería mlx-vlm.

Es importante senalar que no se trata de un lanzamiento oficial de ornith-ai, sino de una compilación de la comunidad, con licencia MIT heredada del modelo base. El modelo está etiquetado con el pipeline image-text-to-text y solo declara soporte para inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer mixture-of-experts (MoE), familia qwen3_5_moe, con torre de visión multimodal |
| Parametros totales | 35.107.180.016 (35B) |
| Parametros activos | 8 de 256 expertos por token, aproximadamente 3B |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Pesos de texto a 6 bits (expertos) y routers a 8 bits; torre de visión en bf16 completo |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | safetensors (formato MLX), con model-vision.safetensors separado y model.safetensors.index.json |

## Arquitectura y entrenamiento

El modelo es un transformer de tipo mixture-of-experts con 35B parámetros totales y aproximadamente 3B activos por token, gracias a un enrutamiento que selecciona 8 de sus 256 expertos en cada paso. La torre de visión original consta de 27 bloques y 447M parámetros en precisión bf16 completa, y se distribuye en un fichero independiente (model-vision.safetensors) junto a los seis shards de texto sin modificar del modelo base. Esta separación permite verificar la integridad de los pesos de texto contra los hashes del origen.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO en el modelo base, ya que la model card de esta compilación no los detalla. La innovación técnica destacable de esta variante es el proceso de verificación previo al empaquetado: el autor comprobó que la torre de visión encaja con los pesos de texto (coincidencia de 24 de 24 tensores muestreados, anchura de la torre y tokens de imagen compatibles) antes de fusionarlos, y registró los commits de origen y los hashes SHA-256 de cada fichero en astronomical-build.json para permitir la reproducción del build.

## Capacidades

- Generación de texto conversacional en inglés.
- Comprensión de imágenes y respuesta a preguntas sobre ellas (image-text-to-text): lectura de texto en capturas de pantalla, descripción de colores, formas y contenido visual.
- Razonamiento multimodal combinado de imagen y texto en una misma petición.
- Ejecución local en Apple Silicon mediante MLX, sin necesidad de cuenta en la nube.
- Streaming de expertos desde el SSD en equipos con menos memoria que la requerida por el modelo (a costa de menor velocidad).
- Soporte de tool calling, function calling, agentes multi-paso, modo thinking, audio u otras capacidades especiales: no disponible en la información proporcionada.

## Casos de uso

- Asistencia visual en local para desarrolladores: el modelo permite consultar capturas de pantalla, diagramas o interfaces de usuario directamente en un Mac, sin enviar imágenes a servicios externos, gracias a su torre de visión en bf16 y a los 29,08 GB de pesos que caben en equipos Apple Silicon de gama alta.
- Transcripción y descripción de documentación técnica escaneada: al leer texto, colores y formas de una imagen, puede extraer el contenido de capturas de herramientas, paneles de monitorización o gráficos y describirlo en lenguaje natural.
- Automatización de tareas de accesibilidad: descripción de imágenes para usuarios con discapacidad visual en aplicaciones de escritorio, ejecutándose íntegramente en el dispositivo y preservando la privacidad del contenido.
- Prototipado de asistentes multimodales en investigación: la licencia MIT y el formato MLX permiten integrar el modelo en cuadernos y scripts de experimentación sin restricciones de uso comercial.
- Verificación de calidad de interfaces: el modelo puede revisar capturas de una aplicación y comprobar que los elementos visibles (nombres de modelo, tamanos en disco, indicadores de uso de GPU) coinciden con lo esperado, como se documenta en la propia model card.
- Despliegue en entornos con requisitos de soberanía del dato: al ejecutarse con Astronomical o mlx-vlm en macOS, no requiere conexión a la nube ni transferencia de imágenes a terceros, lo que resulta adecuado para equipos con políticas estrictas de confidencialidad.
- Generación de descripciones de imágenes para catalogos o archivos: con 65-73 tokens por segundo en un Mac Apple Silicon, puede procesar lotes moderados de imágenes para etiquetado y descripción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

La model card sí reporta métricas de ejecución en mlx-vlm 0.7.12 sobre un Mac Apple Silicon: pico de 30,41 GB de memoria y una velocidad de generación de 65 a 73 tokens por segundo.

## Requisitos de hardware

- VRAM/memoria unificada estimada: 29,08 GB de pesos; pico medido de 30,41 GB de memoria en mlx-vlm 0.7.12.
- Plataforma: Apple Silicon (macOS 14 o superior), mediante MLX.
- GPU recomendadas: no disponible; el modelo está diseñado para memoria unificada de Apple Silicon, no para GPUs NVIDIA como A100, H100 o RTX 4090.
- Cabe en consumer GPU: no aplica en el sentido habitual; requiere un Mac con memoria unificada suficiente para 29,08 GB de pesos más overhead. En equipos con menos memoria, Astronomical puede hacer streaming de los expertos desde el SSD, con menor velocidad.
- Opciones de despliegue: aplicación Astronomical (incluye CLI) y librería mlx-vlm 0.7.12 o superior.
- Latencia y throughput: 65-73 tokens por segundo en mlx-vlm 0.7.12 sobre Apple Silicon; no se especifica el modelo de Mac concreto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Vision | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ornith-1.5-35B-A3B-MLX-6bit-vision (esta ficha) | 35B totales, ~3B activos | no disponible | Sí (torre original, 447M, bf16) | MIT | Hugging Face, MLX |
| ahmedihamdy/Ornith-1.5-35B-A3B-MLX-8bit-vision | 35B totales, ~3B activos | no disponible | Sí | MIT | Hugging Face, MLX; ~9 GB más de memoria |
| ornith-ai/Ornith-1.5-35B-A3B-MLX-6bit | 35B totales, ~3B activos | no disponible | No (sin torre de visión) | MIT | Hugging Face, MLX |
| ornith-ai/Ornith-1.5-35B-A3B | 35B totales, ~3B activos | no disponible | Sí (modelo base original) | MIT | Hugging Face |

## Limitaciones y advertencias

- Solo declara soporte de inglés; no se documentan capacidades multilingües.
- No se dispone de información sobre sesgos conocidos ni sobre la tasa de alucinación del modelo base.
- La longitud de contexto no está especificada en la información disponible, lo que impide planificar cargas de trabajo con ventanas largas.
- Es una compilación comunitaria, no un lanzamiento oficial de ornith-ai; la responsabilidad de la fusión de la torre de visión recae en el autor del empaquetado, aunque se documenta el proceso de verificación.
- Requiere hardware Apple Silicon y macOS 14 o superior; no es desplegable en GPUs NVIDIA ni en entornos Linux convencionales sin conversión adicional.
- El uso en producción con menos memoria que la necesaria implica streaming de expertos desde el SSD, con una penalización de velocidad no cuantificada en la model card.
- Aunque la licencia es MIT, conviene revisar los términos del repositorio del modelo base (ornith-ai/Ornith-1.5-35B-A3B) para confirmar las condiciones de atribución.
- El repositorio no registra descargas ni likes en el momento de la consulta, por lo que no hay evidencia de validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ahmedihamdy/Ornith-1.5-35B-A3B-MLX-6bit-vision
- Modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B
- Variante de texto 6 bits de ornith-ai: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B-MLX-6bit
- Variante 8 bits con visión del mismo autor: https://huggingface.co/ahmedihamdy/Ornith-1.5-35B-A3B-MLX-8bit-vision
- Aplicación Astronomical: https://aosama.github.io/astronomical/
