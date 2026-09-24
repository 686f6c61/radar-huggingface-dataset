# qualcomm/Intern3.5-VL-4B

## Resumen

Intern3.5-VL-4B es un modelo multimodal (visión-lenguaje) de aproximadamente 4.000 millones de parámetros desarrollado originalmente por OpenGVLab dentro de la familia InternVL3.5. Esta ficha concreta corresponde al repositorio `qualcomm/Intern3.5-VL-4B`, una distribución de Qualcomm que contiene los pesos ya exportados y optimizados para ejecutarse en dispositivos con hardware Snapdragon, en lugar de un checkpoint de entrenamiento en PyTorch convencional. El modelo entiende texto e imágenes y está orientado a tareas de razonamiento multimodal como respuesta a preguntas visuales (VQA) y generación de descripciones de imágenes.

La relevancia de este repositorio es de despliegue, no de investigación: Qualcomm publica artefactos precompilados en precisión w4a16 para los runtimes GENIE y GENIEX_QAIRT, con soporte declarado para chipsets Snapdragon 8 Elite Gen 5 for Galaxy, Snapdragon 8 Elite for Galaxy, Snapdragon X2 Elite, Snapdragon X Elite y las plataformas Dragonwing IQ-8275 e IQ-9075. Esto permite ejecutar un VLM de 4B de forma local en teléfonos, portátiles y dispositivos embebidos sin GPU dedicada.

La arquitectura combina un codificador visual InternViT con un backend LLM de base Qwen, atención de consultas agrupadas (GQA) y activación SwiGLU, siguiendo un diseño ViT → MLP → LLM. La licencia es Apache 2.0, lo que facilita su uso comercial, si bien la documentación disponible no detalla el número de idiomas soportados ni la longitud de contexto nativa del modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal ViT → MLP → LLM: codificador visual InternViT + backend LLM basado en Qwen, Grouped Query Attention (GQA) y activación SwiGLU |
| Parametros totales | ~4B según la denominación del modelo (la fuente externa emergentmind indica 4,7B) |
| Parametros activos | no aplica (no se describe como modelo MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada; Qualcomm AI Hub publica mediciones a 512, 1024 y 2048 tokens |
| Tipos de cuantizacion | w4a16 en las exportaciones Qualcomm (GENIE y GENIEX_QAIRT); otras cuantizaciones no disponibles |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | assets pre-exportados para los runtimes GENIE y GENIEX_QAIRT (QAIRT 2.45, precisión w4a16); el modelo base de OpenGVLab se distribuye en PyTorch/safetensors |
| Codificador visual | InternViT (componente del pipeline multimodal) |
| Runtimes soportados | GENIE (soporte con deprecación anunciada) y GENIEX_QAIRT |
| Chipsets objetivo | Snapdragon 8 Elite Gen 5 for Galaxy, Snapdragon 8 Elite for Galaxy, Snapdragon X2 Elite, Snapdragon X Elite, Dragonwing IQ-8275, Dragonwing IQ-9075 |
| Libreria de exportacion | Qualcomm AI Hub Models v0.63.0 |
| Paper de referencia | arXiv:2508.18265 |

## Arquitectura y entrenamiento

El modelo sigue un diseño multimodal en cascada: un codificador visual InternViT procesa las imágenes, un módulo MLP proyecta las representaciones visuales al espacio del modelo de lenguaje y un backend LLM de base Qwen genera la respuesta textual. El LLM emplea Grouped Query Attention (GQA) para reducir el coste de memoria de la caché KV durante la decodificación y activación SwiGLU en las capas feed-forward. Esta separación en tres etapas es la habitual en la familia InternVL y permite tratar la visión y el lenguaje con componentes especializados.

En cuanto al entrenamiento, la información proporcionada no detalla el volumen de tokens, la composición del dataset ni si se aplicaron técnicas concretas de alineación como RLHF o DPO. La fuente externa emergentmind menciona el uso de *cascade reinforcement learning*, *dynamic visual routing* y *decoupled deployment* como rasgos de eficiencia de InternVL 3.5 4B, pero no se aportan cifras verificables en el material disponible. El repositorio de Qualcomm no documenta reentrenamiento: se trata de una exportación y compilación del checkpoint original de OpenGVLab, con optimizaciones de cuantización w4a16 y ajuste a los runtimes de Qualcomm.

## Capacidades

- Comprensión conjunta de texto e imagen: el modelo procesa entradas multimodales y genera respuestas textuales.
- Respuesta a preguntas visuales (VQA): identificación de objetos, atributos y relaciones dentro de una imagen.
- Generación de descripciones de imágenes (*image captioning*).
- Razonamiento multimodal: tareas que requieren combinar información visual con instrucciones en lenguaje natural.
- Generación de texto: el pipeline declarado en HuggingFace es `text-generation`.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte para agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; el autor no especifica idiomas soportados.
- Modo *thinking* explícito, visión en vídeo o audio: no disponible en la información proporcionada.

## Casos de uso

- Asistente móvil con comprensión de imágenes: integrado mediante GenieX en un Snapdragon 8 Elite Gen 5 for Galaxy, el modelo puede responder preguntas sobre una foto capturada por el usuario sin enviar la imagen a la nube, algo relevante por privacidad y latencia.
- Descripción de imágenes para accesibilidad: generar automáticamente descripciones textuales de fotografías en aplicaciones de lectura de pantalla, aprovechando que el modelo cabe en un dispositivo móvil de gama alta.
- Digitalización de documentos y recibos: extracción de información de documentos fotografiados en un portátil con Snapdragon X Elite o X2 Elite, procesando cada página de forma local.
- Inspección visual en entornos industriales: despliegue en plataformas Dragonwing IQ-8275 o IQ-9075 para verificar el estado de componentes o leer etiquetas en línea de producción con latencia de primer token inferior a 1,5 s en contextos de 2.048 tokens.
- Organización y etiquetado de fototecas: generación de leyendas y etiquetas para grandes colecciones de imágenes en el propio dispositivo, evitando subir contenido personal a servicios externos.
- Atención al cliente con soporte visual: un chatbot que reciba capturas de pantalla o fotos de producto enviadas por el cliente y responda con contexto sobre lo mostrado, ejecutándose en terminales compatibles.
- Análisis de imágenes en vehículos o robótica embebida: uso del modelo en plataformas Dragonwing para tareas de reconocimiento visual que requieran razonamiento en lenguaje natural junto a la percepción.
- Prototipado de aplicaciones VLM sin infraestructura cloud: gracias a la licencia Apache 2.0 y a los artefactos pre-exportados, un desarrollador puede validar un producto multimodal en un dispositivo compatible antes de invertir en servidores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible para este repositorio. No se incluyen cifras de MMLU, HumanEval, GSM8K, MMMU ni de otras evaluaciones estándar. Lo único documentado son métricas de despliegue medidas por Qualcomm AI Hub con el runtime GENIEX_QAIRT en precisión w4a16 sobre Snapdragon 8 Elite Gen 5 for Galaxy:

| Contexto | Response rate (tokens/s) | Time To First Token (rango, s) |
|---|---|---|
| 512 | 16,16788 | 0,094894 - 0,379576 |
| 1024 | 16,833125 | 0,089904 - 0,719232 |
| 2048 | 16,129407 | 0,088315 - 1,41304 |

La tasa de generación se mantiene prácticamente estable en torno a 16 tokens por segundo en los tres tamaños de contexto, mientras que el tiempo hasta el primer token crece con la longitud del *prompt*, pasando de menos de 0,1 s en el mejor caso a 1,41 s con 2.048 tokens de contexto.

## Requisitos de hardware

- Despliegue objetivo principal: dispositivos con Snapdragon 8 Elite Gen 5 for Galaxy, Snapdragon 8 Elite for Galaxy, Snapdragon X2 Elite o Snapdragon X Elite en versión móvil o portátil.
- Plataformas embebidas compatibles: Qualcomm Dragonwing IQ-8275 e IQ-9075.
- Precisión de referencia: w4a16 (pesos a 4 bits, activaciones a 16 bits), lo que reduce la huella de memoria respecto al checkpoint original.
- VRAM estimada para inferencia en GPU (cálculo aproximado a partir del tamaño de parámetros, no dato publicado por el autor): en torno a 2-3 GB en 4 bits, 4-5 GB en 8 bits y 8-9 GB en fp16 para un modelo de ~4B, más el consumo adicional del codificador visual y de la caché KV.
- GPU de consumo: con cuantización de 4 bits, un modelo de ~4B es desplegable en tarjetas con 8 GB o más, como una RTX 3060/4060; en fp16 conviene disponer de 10-12 GB (RTX 3080/4070 o superiores). Estas estimaciones no proceden de la documentación de Qualcomm.
- Opciones de despliegue documentadas: GenieX (recomendado) y el runtime Genie (con deprecación anunciada). La librería Qualcomm AI Hub Models v0.63.0 permite compilar y exportar configuraciones propias de pesos, formas de entrada y dispositivo objetivo.
- Otras alternativas de despliegue (vLLM, llama.cpp, Ollama, TGI): no documentadas para este repositorio; los artefactos publicados son específicos de los runtimes de Qualcomm.
- Latencia medida en dispositivo: TTFT entre 0,089 s y 1,413 s según el contexto, y ~16 tokens/s de generación sostenida en Snapdragon 8 Elite Gen 5 for Galaxy.

## Comparativa con modelos similares

La información disponible solo permite comparar este repositorio con su modelo de origen, ya que no se aportan datos verificables de otros VLM de tamaño similar (por ejemplo, Qwen2.5-VL, SmolVLM o Phi-3.5-vision) dentro del material proporcionado.

| Aspecto | Qualcomm Intern3.5-VL-4B | OpenGVLab/InternVL3_5-4B |
|---|---|---|
| Rol | Distribución optimizada para dispositivos Qualcomm | Checkpoint original de investigación |
| Licencia | Apache 2.0 | Apache 2.0 |
| Formato de pesos | Assets pre-exportados w4a16 para GENIE / GENIEX_QAIRT | PyTorch / safetensors |
| Hardware objetivo | Snapdragon 8 Elite, X Elite, X2 Elite, Dragonwing | GPU de propósito general |
| Precisión por defecto | w4a16 | FP16/BF16 (sin confirmar en la información disponible) |
| Métricas publicadas | Tokens/s y TTFT en chipsets Snapdragon | No disponibles en la información proporcionada |

Datos de rendimiento comparado frente a otras alternativas de la misma categoría: no disponible.

## Limitaciones y advertencias

- Los artefactos publicados están vinculados a runtimes y chipsets concretos de Qualcomm; no son pesos portables a cualquier stack de inferencia.
- El runtime Genie tiene deprecación anunciada, por lo que conviene planificar la migración a GenieX.
- Riesgo de alucinación: como todo LLM/VLM generativo, puede producir descripciones o respuestas visuales incorrectas, especialmente con imágenes ambiguas o de baja calidad.
- Sesgos conocidos: no documentados en la información proporcionada; deben evaluarse específicamente antes de un despliegue en producción.
- Idiomas soportados: no se especifica una lista oficial, lo que dificulta garantizar un rendimiento equilibrado fuera del inglés.
- Longitud de contexto: el material solo documenta mediciones hasta 2.048 tokens; no se confirma la ventana máxima nativa, lo que limita su uso en tareas de contexto largo.
- No hay información sobre tool calling, razonamiento multi-paso o modo de pensamiento, por lo que no debe asumirse soporte para flujos agénticos.
- Al no publicarse benchmarks de calidad (MMMU, MMBench, etc.), no es posible comparar su precisión frente a otros VLM con datos objetivos.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las condiciones específicas de los assets binarios y de los runtimes de Qualcomm, que pueden tener términos propios al margen del modelo.
- La fecha de creación registrada en HuggingFace (23 de septiembre de 2026) es posterior al momento habitual de consulta, lo que sugiere un posible error en los metadatos del repositorio.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/qualcomm/Intern3.5-VL-4B
- Modelo original de OpenGVLab: https://huggingface.co/OpenGVLab/InternVL3_5-4B
- Página del modelo en Qualcomm AI Hub: https://aihub.qualcomm.com/models/intern3_5_vl_4b
- Código de exportación en GitHub (AI Hub Models v0.63.0): https://github.com/qualcomm/ai-hub-models/blob/v0.63.0/src/qai_hub_models/models/intern3_5_vl_4b
- README del modelo en GitHub: https://github.com/qualcomm/ai-hub-models/blob/main/src/qai_hub_models/models/intern3_5_vl_4b/README.md
- Fichero de prestaciones en GitHub: https://github.com/qualcomm/ai-hub-models/blob/main/src/qai_hub_models/models/intern3_5_vl_4b/perf.yaml
- Quickstart de GenieX: https://geniex.aihub.qualcomm.com/en/get-started/quickstart
- Tutorial LLM-on-Genie: https://github.com/qualcomm/ai-hub-apps/tree/main/tutorials/llm_on_genie
- Paper de referencia: https://arxiv.org/abs/2508.18265
- Qualcomm AI Hub: https://aihub.qualcomm.com/
- Resumen externo de InternVL 3.5 4B: https://www.emergentmind.com/topics/internvl-3-5-4b
