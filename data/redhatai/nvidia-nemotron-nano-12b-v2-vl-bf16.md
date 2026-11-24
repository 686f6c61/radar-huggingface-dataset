# RedHatAI/NVIDIA-Nemotron-Nano-12B-v2-VL-BF16

## Resumen

NVIDIA-Nemotron-Nano-12B-v2-VL es un modelo de lenguaje y vision (VLM) desarrollado por NVIDIA que combina un codificador visual CRadioV2-H con el modelo de lenguaje Nemotron-Nano-12B-v2. Esta orientado a razonamiento multi-imagen, comprension de video e inteligencia documental, con capacidades destacadas de preguntas y respuestas visuales (VQA) y resumen de documentos. El modelo acepta hasta cuatro imagenes simultaneas de hasta 1k x 2k pixeles cada una junto con un prompt de texto largo, lo que lo hace adecuado para el procesamiento de facturas, recibos y manuales.

La version alojada en RedHatAI es un empaquetado en BF16 (pesos completos, sin cuantizar) del modelo original de NVIDIA, publicado bajo la licencia NVIDIA Open Model License. El repositorio ocupa 26,4 GB y contiene 13.181.860.358 parametros segun los safetensors, aunque la model card declara 12,6B. La ventana combinada de entrada y salida es de 128K tokens, y el modelo esta pensado para despliegues en GPU NVIDIA con motores como vLLM, TensorRT-LLM o SGLang.

Su relevancia actual radica en que cubre el nicho de modelos multimodales de tamano medio (12B) optimizados para alto throughput y tareas documentales empresariales, un segmento donde predominan alternativas de mayor tamano. El soporte nativo de video (hasta 128 frames a 2 FPS) y de multiples imagenes de alta resolucion lo posiciona como una opcion practica para pipelines de extraccion y analisis documental en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (codificador visual CRadioV2-H + LLM Nemotron-Nano-12B-v2) |
| Parametros totales | 13.181.860.358 (safetensors); la model card declara 12,6B |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 128K tokens (entrada + salida combinados) |
| Tipos de cuantizacion | BF16 (esta version); FP8 y NVFP4-QAD disponibles en repos oficiales de NVIDIA |
| Idiomas soportados | Ingles unicamente |
| Licencia | NVIDIA Open Model License (nvidia-open-model-license) |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura transformer multimodal compuesta por un codificador visual CRadioV2-H y un decodificador de lenguaje basado en NVIDIA-Nemotron-Nano-12B-v2. El procesamiento de imagenes utiliza un esquema de tiles de 512 x 512 pixeles con un maximo de 12 tiles, lo que permite resoluciones efectivas como 2048 x 1536 (4x3), 1536 x 2048 (3x4), 1024 x 3072 (2x6) o 3072 x 1024 (6x2). Para video, admite 2 FPS con un minimo de 8 y un maximo de 128 frames. La resolucion minima de imagen es de 32 x 32 pixeles y solo se soportan 3 canales RGB (sin canal alfa).

La model card proporciona datos de carga computacional: un computo acumulado de 2,2e+22 FLOPs, un consumo energetico estimado de 7.827,46 kWh y 3,21 tCO2e de emisiones durante el entrenamiento. No se detalla en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO. El modelo incluye un modo de control de razonamiento mediante la etiqueta `/no_think` en el mensaje de sistema, lo que sugiere soporte de modos con y sin razonamiento explicito.

## Capacidades

- Razonamiento multi-imagen: procesa hasta cuatro imagenes simultaneas de hasta 1k x 2k pixeles cada una junto con prompts de texto largos.
- Comprension de video: soporta entrada de video a 2 FPS con entre 8 y 128 frames, en formatos MP4, MKV, FLV y 3GP.
- Inteligencia documental: extraccion, resumen y VQA sobre facturas, recibos, manuales y documentos similares.
- Preguntas y respuestas visuales (VQA) y resumen de contenido visual.
- Generacion de texto a partir de entradas multimodales (imagen, video y texto).
- Modo de razonamiento controlable mediante la etiqueta `/no_think` en el mensaje de sistema.
- Soporte de conversaciones multi-turno mediante plantilla de chat (`apply_chat_template`).
- Capacidades multilingues: limitadas al ingles segun la model card.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente y razonamiento multi-paso: no documentadas explicitamente en la informacion disponible.

## Casos de uso

- Procesamiento de facturas y recibos: el modelo puede recibir varias imagenes de documentos (hasta cuatro a 1k x 2k) y un prompt largo para extraer campos estructurados, totales e impuestos, aprovechando su ventana de 128K tokens para incluir instrucciones detalladas y contexto adicional.
- Resumen de manuales tecnicos: dada su capacidad de manejar documentos de alta resolucion mediante el esquema de 12 tiles, puede resumir secciones extensas de manuales o guias, combinando varias paginas en una sola consulta.
- VQA sobre documentos escaneados: util para sistemas de atencion al cliente o back-office que necesiten responder preguntas concretas sobre el contenido de un documento sin transcripcion manual previa.
- Analisis de video de vigilancia o inspeccion: con soporte de hasta 128 frames a 2 FPS, puede describir eventos o identificar objetos en clips cortos, adecuado para tareas de monitorizacion o control de calidad visual.
- Automatizacion de back-office financiero: integrado en pipelines con vLLM o TensorRT-LLM, el modelo puede procesar lotes de documentos en paralelo, beneficiandose del enfasis de NVIDIA en throughput para cargas documentales.
- Asistencia en inspeccion de productos: a partir de multiples imagenes de un mismo producto (hasta cuatro), puede comparar vistas, detectar defectos o verificar conformidad con especificaciones descritas en texto.
- Analisis de contenido audiovisual para accesibilidad: generacion de descripciones textuales de clips de video para subtitulado o audiodescripcion, limitado al idioma ingles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 26-28 GB solo para pesos, mas memoria para el codificador visual, cache KV y activaciones; se recomienda un minimo de 40-48 GB de VRAM para contexto largo.
- GPU recomendadas por NVIDIA: L40S, A100, H100/H200, B200, GB200 y RTX PRO 6000 Server Edition.
- Cabe en GPU de consumo: no de forma nativa en BF16; seria necesario cuantizar (por ejemplo, a FP8 o NVFP4) o usar variantes oficiales ya cuantizadas para acercarse a GPUs de 24 GB, aunque la informacion disponible no confirma el ajuste exacto en consumer.
- Opciones de despliegue: vLLM, TensorRT-LLM (TRT-LLM) y SGLang segun la model card; la libreria de referencia es transformers (version >4.53, <4.54) con dependencias `causal_conv1d`, `mamba-ssm==2.2.5`, `timm`, `open_clip_torch` y `accelerate`.
- Sistemas operativos soportados: Linux.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; la model card menciona una ventaja significativa en throughput sin cifras concretas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| NVIDIA-Nemotron-Nano-12B-v2-VL (este) | ~12,6-13,2B | 128K | Imagen, video, texto | NVIDIA Open Model License | Hugging Face (BF16, FP8, NVFP4) y build.nvidia.com |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la informacion proporcionada de datos de rendimiento ni de especificaciones de modelos alternativos que permitan una comparativa cuantitativa fiable.

## Limitaciones y advertencias

- Idioma: el modelo solo soporta ingles segun la model card, lo que limita su uso en castellano u otros idiomas sin evaluacion adicional.
- Riesgo de alucinacion: como todo VLM, puede generar descripciones o respuestas no fundamentadas en la imagen o el video, especialmente en documentos de baja calidad o resoluciones cercanas al minimo de 32 x 32 pixeles.
- Restricciones de entrada: maximo de cuatro imagenes por consulta, maximo de 12 tiles de 512 x 512, sin canal alfa, y video limitado a 2 FPS y 128 frames.
- Licencia: el uso comercial esta permitido segun la model card, pero queda sujeto a los terminos de la NVIDIA Open Model License; es necesario revisar las condiciones completas antes de desplegar en produccion.
- Requisitos de hardware: el modelo esta optimizado para GPUs NVIDIA y sistemas Linux; el rendimiento en otros aceleradores no esta garantizado.
- Dependencias fragiles: la version de transformers esta acotada (>4.53, <4.54) y requiere paquetes especificos como `mamba-ssm==2.2.5`, lo que puede complicar la integracion en entornos con versiones distintas.
- Sesgos: no se documentan en la informacion disponible evaluaciones de sesgo; se recomienda realizar pruebas especificas antes de desplegar en dominios sensibles.
- Validacion en produccion: NVIDIA recomienda pruebas iterativas con datos especificos del caso de uso siguiendo la metodologia V-model antes de desplegar.

## Enlaces

- Hugging Face (este repositorio): https://huggingface.co/RedHatAI/NVIDIA-Nemotron-Nano-12B-v2-VL-BF16
- Modelo original BF16 de NVIDIA: https://huggingface.co/nvidia/Nemotron-Nano-12B-v2-VL-BF16
- Version FP8 de NVIDIA: https://huggingface.co/nvidia/Nemotron-Nano-12B-v2-VL-FP8
- Version NVFP4-QAD de NVIDIA: https://huggingface.co/nvidia/Nemotron-Nano-12B-v2-VL-NVFP4-QAD
- Demo en build.nvidia.com: https://build.nvidia.com/nvidia/nvidia-nemotron-nano-vl-12b-v2
- Licencia NVIDIA Open Model License: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-open-model-license/
- Paper de referencia (arxiv:2501.14818): https://arxiv.org/abs/2501.14818
- Paper de referencia (arxiv:2511.03929): https://arxiv.org/abs/2511.03929
