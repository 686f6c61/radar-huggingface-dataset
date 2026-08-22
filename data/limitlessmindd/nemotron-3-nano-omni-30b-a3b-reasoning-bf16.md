# LimitlessMindd/Nemotron-3-Nano-Omni-30B-A3B-Reasoning-BF16

## Resumen

NVIDIA Nemotron 3 Nano Omni es un modelo multimodal de gran tamaño (LLM) que unifica la comprensión de vídeo, audio, imagen y texto para dar soporte a flujos de trabajo empresariales de preguntas y respuestas, resumen, transcripción e inteligencia documental. Desarrollado por NVIDIA como parte de la familia Nemotron, este modelo extiende la línea Nemotron Nano con capacidades integradas de comprensión de vídeo y habla, reconocimiento óptico de caracteres (OCR), transcripción de voz y automatización de interfaces gráficas (GUI). La versión analizada aquí, publicada en Hugging Face por el usuario LimitlessMindd, corresponde al checkpoint en precisión BF16 y está disponible para uso comercial bajo la licencia NVIDIA Open Model Agreement.

El modelo combina una arquitectura híbrida Mamba2-Transformer con mezcla de expertos (MoE), con un total de aproximadamente 31 000 millones de parámetros (33 015 632 214 según el conteo real de los safetensors) y unos 3 000 millones de parámetros activos por token. Soporta una ventana de contexto de hasta 256 000 tokens, lo que permite procesar documentos extensos, vídeos de hasta dos minutos y audio de hasta una hora. Su modo de razonamiento (chain-of-thought) está activado por defecto y puede desactivarse mediante el parámetro `enable_thinking`. El modelo acepta entradas de vídeo, audio, imagen y texto, y genera exclusivamente texto, con soporte para salida JSON, tool calling y marcas de tiempo a nivel de palabra en transcripciones.

La relevancia actual de este modelo radica en su capacidad omnímoda para tareas empresariales complejas que requieren integrar múltiples modalidades, como el análisis de reuniones grabadas, la verificación visual en atención al cliente, la inteligencia documental y la automatización de agentes GUI. Su diseño eficiente, con solo 3 000 millones de parámetros activos, permite desplegarlo en una única GPU de gama alta, lo que lo hace accesible para entornos de producción con requisitos de latencia moderados.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mamba2-Transformer híbrido con mezcla de expertos (MoE) |
| Parametros totales | 33 015 632 214 (según safetensors); 31 000 000 000 según documentación oficial |
| Parametros activos | ~3 000 000 000 por token |
| Longitud de contexto | 256 000 tokens |
| Tipos de cuantizacion | BF16, FP8, NVFP4 |
| Idiomas soportados | Inglés únicamente |
| Licencia | NVIDIA Open Model Agreement (nvidia-open-model-agreement) |
| Formato de pesos | Safetensors (BF16) |

## Arquitectura y entrenamiento

La arquitectura del modelo es un híbrido Mamba2-Transformer con mezcla de expertos (MoE), donde la capa de atención Transformer se combina con capas de espacio de estado (SSM) Mamba2 para lograr un equilibrio entre calidad y eficiencia. El backbone principal es el modelo Nemotron 3 Nano LLM de 30B A3B, que aporta 31 000 millones de parámetros totales y aproximadamente 3 000 millones de activos por token. Para la entrada visual se utiliza el encoder de visión CRADIO v4-H, que procesa imágenes y fotogramas de vídeo, mientras que el encoder de habla Parakeet se encarga de las entradas de audio. Esta combinación permite al modelo procesar simultáneamente vídeo, audio, imagen y texto en una única pasada.

En cuanto al entrenamiento, la documentación indica que el modelo fue mejorado utilizando destilación y/o ajuste con varios modelos de referencia, entre ellos Qwen3-VL-30B-A3B-Instruct, Qwen3.5-122B-A10B, Qwen3.5-397B-A17B, Qwen2.5-VL-72B-Instruct y gpt-oss-120b. El dataset de entrenamiento incluye nvidia/Nemotron-Image-Training-v3, aunque no se especifican el número total de tokens ni la composición detallada del corpus. El modelo incorpora un modo de razonamiento (chain-of-thought) activado por defecto, con un presupuesto de razonamiento de 16 384 tokens y un período de gracia de 1 024 tokens antes de generar la respuesta final. También se menciona en el paper asociado (arXiv:2604.24954) que se introdujeron avances en arquitectura, datos de entrenamiento y recetas de entrenamiento en comparación con su predecesor Nemotron Nano V2 VL.

## Capacidades

- Comprensión multimodal unificada: procesa simultáneamente vídeo (hasta 2 minutos, muestreo de 1 FPS a 1080p o 2 FPS a 720p), audio (hasta 1 hora, formatos wav y mp3), imágenes (RGB en jpeg/png) y texto.
- Razonamiento con cadena de pensamiento (chain-of-thought): modo de razonamiento activado por defecto, configurable mediante `enable_thinking`, con presupuesto de razonamiento de 16 384 tokens.
- Generación de texto con soporte de salida JSON estructurado.
- Tool calling / function calling: permite al modelo invocar herramientas externas durante la generación.
- Transcripción de voz con marcas de tiempo a nivel de palabra (word-level timestamps).
- Reconocimiento óptico de caracteres (OCR) integrado para documentos, gráficos y capturas de pantalla.
- Automatización de interfaces gráficas (GUI): el modelo puede interpretar y actuar sobre elementos visuales de una interfaz, lo que habilita agentes de navegador y automatización de escritorio.
- Análisis de vídeo y audio de larga duración gracias a la ventana de contexto de 256 000 tokens.
- Capacidades multilingües: no disponibles; el modelo solo soporta inglés.

## Casos de uso

- Análisis de reuniones grabadas: el modelo puede procesar un vídeo de una reunión de hasta dos minutos junto con su audio, generar un resumen estructurado, extraer acuerdos y transcribir las intervenciones con marcas de tiempo. Su ventana de 256 000 tokens permite manejar transcripciones largas sin truncamiento.
- Inteligencia documental para asistentes empresariales: contratos, acuerdos de nivel de servicio (SOW/MSA), informes financieros y documentos científicos pueden ser analizados mediante OCR y comprensión de gráficos, extrayendo cláusulas, cifras y conclusiones de forma automatizada.
- Atención al cliente con verificación visual: por ejemplo, una empresa de reparto puede usar el modelo para verificar mediante vídeo que un paquete se entregó en la dirección correcta, combinando OCR de la señalización con análisis de la escena.
- Transcripción y subtitulado de contenido audiovisual: el modelo transcribe audio de hasta una hora con marcas de tiempo a nivel de palabra, lo que facilita la generación de subtítulos o la búsqueda dentro de vídeos.
- Agentes de automatización GUI: el modelo puede interpretar capturas de pantalla y ejecutar acciones en interfaces gráficas, permitiendo la automatización de tareas como gestión de incidencias, búsqueda en navegador o gestión de correo electrónico.
- Verificación de pedidos en drive-thru: en restauración rápida, el modelo puede analizar el vídeo de la cámara del drive-thru para confirmar que el pedido mostrado en pantalla coincide con lo solicitado por el cliente, reduciendo errores.
- Análisis de vídeo para medios y entretenimiento (M&E): generación de descripciones densas, búsqueda de escenas y resumen de contenido audiovisual para catálogos o metadatos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La documentación oficial menciona mejoras de precisión sobre su predecesor Nemotron Nano V2 VL, pero no se proporcionan cifras concretas de MMLU, HumanEval, GSM8K u otras pruebas estandarizadas. Se recomienda consultar el paper arXiv:2604.24954 para obtener datos de evaluación detallados cuando estén disponibles.

## Requisitos de hardware

- VRAM estimada para inferencia: según la precisión, el modelo requiere aproximadamente 62 GB en BF16, 33 GB en FP8 y 21 GB en NVFP4 (según la documentación oficial).
- GPU mínima recomendada: 1× H100 80GB para BF16; 1× L40S 48GB para FP8; 1× RTX 5090 32GB para NVFP4. Se recomiendan GPUs como B200 o H200 para un rendimiento óptimo.
- En GPUs de consumo: solo es viable con cuantización NVFP4 en una RTX 5090 (32GB). No es factible en GPUs de 24GB o menos con las precisiones BF16 o FP8.
- Opciones de despliegue: compatible con vLLM (existe una receta oficial en recipes.vllm.ai), así como con el stack de NVIDIA NIM y contenedores NGC. También puede ejecutarse con frameworks que soporten arquitecturas híbridas Mamba2-Transformer, como Transformers de Hugging Face.
- Latencia y throughput: no se han publicado cifras oficiales. Dado el tamaño activo de ~3B parámetros, se espera una latencia moderada en una GPU H100, pero los datos concretos dependen de la implementación y la longitud de la secuencia.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Parámetros activos | Contexto | Modalidades | Licencia |
|---|---|---|---|---|---|
| Nemotron 3 Nano Omni (este) | 31B (33B real) | ~3B | 256k | Vídeo, audio, imagen, texto | NVIDIA Open Model Agreement |
| Qwen3-VL-30B-A3B-Instruct | 30B | ~3B | 128k (estimado) | Imagen, vídeo, texto | Apache 2.0 (Qwen) |
| Qwen2.5-VL-72B-Instruct | 72B | 72B (denso) | 128k | Imagen, vídeo, texto | Apache 2.0 (Qwen) |
| Nemotron Nano V2 VL (predecesor) | ~8B (estimado) | 8B (denso) | 128k (estimado) | Imagen, texto | NVIDIA Open Model Agreement |

La comparativa se basa en datos públicos de las respectivas fichas técnicas. Nemotron 3 Nano Omni destaca por su soporte nativo de audio y su ventana de contexto de 256k, superior a la de los modelos Qwen comparados. Sin embargo, su licencia es más restrictiva que la Apache 2.0 de Qwen. No se dispone de datos de rendimiento comparativo en benchmarks estandarizados.

## Limitaciones y advertencias

- Idioma: el modelo solo soporta inglés. No es adecuado para tareas que requieran comprensión o generación en otros idiomas.
- Sesgos y alucinaciones: como todo LLM, puede generar contenido falso o inconsistente, especialmente en tareas de razonamiento complejo o cuando se le pide información factual. Se recomienda validar las salidas en entornos de producción.
- Licencia: la NVIDIA Open Model Agreement impone condiciones específicas de uso, incluyendo restricciones sobre el uso comercial y la redistribución. Es obligatorio revisar el acuerdo completo antes de su implementación.
- Requisitos de hardware: el modelo requiere GPUs de gama alta con al menos 32GB de VRAM incluso en la cuantización más ligera (NVFP4). No es viable en hardware de consumo estándar.
- Limitaciones de entrada: el vídeo está limitado a 2 minutos y 128-256 fotogramas; el audio a 1 hora. Entradas más largas requieren segmentación previa.
- Dependencia de componentes externos: el modelo utiliza encoders específicos (CRADIO v4-H y Parakeet) que deben estar disponibles en el entorno de despliegue.
- Fecha de publicación: la documentación indica una fecha de lanzamiento de abril de 2026, lo que sugiere que el modelo es muy reciente y puede tener poca adopción o soporte comunitario todavía.

## Enlaces

- Modelo en Hugging Face (BF16): https://huggingface.co/LimitlessMindd/Nemotron-3-Nano-Omni-30B-A3B-Reasoning-BF16
- Modelo original de NVIDIA (BF16): https://huggingface.co/nvidia/Nemotron-3-Nano-Omni-30B-A3B-Reasoning-BF16
- Modelo original de NVIDIA (FP8): https://huggingface.co/nvidia/Nemotron-3-Nano-Omni-30B-A3B-Reasoning-FP8
- Modelo original de NVIDIA (NVFP4): https://huggingface.co/nvidia/Nemotron-3-Nano-Omni-30B-A3B-Reasoning-NVFP4
- Página de NVIDIA NIM: https://build.nvidia.com/nvidia/nemotron-3-nano-omni-30b-a3b-reasoning
- Blog de presentación en Hugging Face: https://huggingface.co/blog/nvidia/nemotron-3-nano-omni-multimodal-intelligence
- Paper en arXiv: https://arxiv.org/html/2604.24954v2
- Receta de vLLM: https://recipes.vllm.ai/nvidia/Nemotron-3-Nano-Omni-30B-A3B-Reasoning-BF16
- Contenedor NGC: https://catalog.ngc.nvidia.com/orgs/nim/teams/nvidia/containers/nemotron-3-nano-omni-30b-a3b-reasoning
- Backbone Nemotron 3 Nano LLM: https://huggingface.co/nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B-BF16
