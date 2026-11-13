# amd/whisper-tiny_rai_1.9.0_m_1.0.1_npu

## Resumen

Whisper-tiny optimizado por AMD para ejecución en NPU (Ryzen AI) es una versión del modelo de reconocimiento automático de voz de OpenAI, adaptada por AMD para aprovechar la unidad de procesamiento neuronal integrada en sus procesadores Ryzen AI. El repositorio, identificado como `amd/whisper-tiny_rai_1.9.0_m_1.0.1_npu`, forma parte del ecosistema Ryzen AI Software, que permite ejecutar modelos de IA en la NPU del PC en lugar de la CPU o la GPU, con el consiguiente ahorro energético y liberación de recursos del sistema.

El modelo base es `openai/whisper-tiny`, la variante más pequeña de la familia Whisper, con aproximadamente 39 millones de parámetros y una arquitectura transformer encoder-decoder diseñada para transcripción de audio. AMD distribuye esta versión en formato ONNX cuantizado, lista para desplegarse sobre el stack Ryzen AI (versión 1.9.0 del runtime, versión 1.0.1 del modelo), lo que la hace relevante para desarrolladores que quieran integrar ASR local en aplicaciones de escritorio sin depender de la nube.

El acceso al repositorio está restringido (gated): es necesario aceptar las condiciones en Hugging Face antes de descargarlo. La licencia es Apache 2.0, heredada del modelo original de OpenAI.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper) |
| Parametros totales | ~39 millones (heredados de whisper-tiny) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 30 segundos de audio por ventana (característica de Whisper) |
| Tipos de cuantizacion | Modelo cuantizado para NPU Ryzen AI (detalle exacto no disponible) |
| Idiomas soportados | no disponible (Whisper-tiny base soporta multilingüe, pero la ficha no lo especifica) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (optimizado para NPU Ryzen AI) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Whisper-tiny de OpenAI: un transformer encoder-decoder con atención multi-cabeza estándar, entrenado originalmente sobre 680.000 horas de audio supervisado multilingüe y multitarea (transcripción, traducción y detección de idioma). AMD no ha publicado detalles sobre reentrenamiento o ajuste fino adicional; la adaptación consiste en la conversión y cuantización del modelo para su ejecución sobre la NPU de Ryzen AI mediante el runtime RAI 1.9.0.

La innovación principal de esta versión no reside en el modelo en sí, sino en el pipeline de despliegue: conversión a ONNX, cuantización y compilación para la NPU. Esto permite inferencia de baja latencia y bajo consumo en hardware de PC con Ryzen AI, sin necesidad de GPU dedicada. No se dispone de información sobre el proceso concreto de cuantización ni sobre posibles pérdidas de precisión respecto al modelo original.

## Capacidades

- Reconocimiento automático de voz (ASR) sobre audio de hasta 30 segundos por segmento.
- Transcripción de audio a texto en tiempo casi real en hardware Ryzen AI.
- Detección de idioma integrada (heredada de Whisper).
- Traducción de voz a texto en inglés (capacidad multitarea de Whisper, sujeta a la variante tiny).
- Ejecución local en NPU, sin dependencia de servicios en la nube.
- No se documenta soporte de tool calling, agentes ni razonamiento multi-paso (no aplicable a un modelo ASR).
- Capacidades multilingües: no confirmadas en la ficha del repositorio; dependen del modelo base Whisper-tiny.

## Casos de uso

- Transcripción local de reuniones: el modelo puede procesar audio de hasta 30 segundos por ventana y encadenar segmentos para transcribir conversaciones completas, ejecutándose en la NPU del PC sin enviar datos a la nube.
- Subtitulado automático de vídeo en aplicaciones de escritorio: integrable en herramientas de edición que necesiten generar subtítulos en local con bajo consumo energético.
- Dictado por voz en editores de texto: al ejecutarse en NPU, libera CPU y GPU para la aplicación principal, reduciendo la latencia percibida por el usuario.
- Asistentes de voz para aplicaciones de accesibilidad: transcripción en tiempo real de comandos o conversaciones en entornos donde la privacidad impide el uso de servicios cloud.
- Indexación y búsqueda de archivos de audio: transcripción por lotes de grabaciones almacenadas localmente para generar índices de texto consultables.
- Prototipado de pipelines ASR en hardware de consumo: sirve como punto de partida para validar flujos de reconocimiento de voz sobre Ryzen AI antes de escalar a modelos Whisper mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Requiere un procesador AMD Ryzen AI compatible con el runtime Ryzen AI Software 1.9.0 y el modelo RAI 1.0.1.
- Ejecución sobre NPU integrada; no requiere GPU dedicada.
- VRAM estimada: no aplica (inferencia en NPU); el modelo ocupa aproximadamente 0,2 GB en disco.
- No cabe esperar despliegue en GPU convencional mediante este artefacto: está compilado para NPU.
- Opciones de despliegue: stack Ryzen AI Software (ONNX Runtime con EP de Ryzen AI). No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| amd/whisper-tiny_rai_1.9.0_m_1.0.1_npu | ~39 M | 30 s audio | ONNX (NPU) | Apache 2.0 | Gated |
| openai/whisper-tiny | ~39 M | 30 s audio | PyTorch/safetensors | Apache 2.0 | Abierto |
| openai/whisper-base | ~74 M | 30 s audio | PyTorch/safetensors | Apache 2.0 | Abierto |
| openai/whisper-small | ~244 M | 30 s audio | PyTorch/safetensors | Apache 2.0 | Abierto |

La diferencia clave frente a las variantes originales de OpenAI es el target de ejecución (NPU Ryzen AI frente a CPU/GPU) y el formato ONNX cuantizado; en precisión y capacidades se espera un comportamiento equivalente a whisper-tiny, aunque no se han publicado métricas que lo confirmen.

## Limitaciones y advertencias

- Acceso restringido: requiere aceptar condiciones en Hugging Face antes de la descarga.
- Al ser whisper-tiny, la precisión de transcripción es la más baja de la familia Whisper; puede fallar en audio con ruido, acentos marcados o vocabulario técnico.
- Riesgo de alucinación de texto en segmentos de silencio o audio ininteligible, comportamiento conocido en modelos Whisper.
- Dependencia estricta del hardware Ryzen AI y del runtime 1.9.0; no es portable a otras plataformas sin reconversión.
- Idiomas soportados no confirmados en la ficha; verificar contra el modelo base antes de usar en producción multilingüe.
- Licencia Apache 2.0 permite uso comercial, pero conviene revisar los términos del stack Ryzen AI Software, que puede tener condiciones adicionales.
- No se documentan métricas de latencia ni precisión tras la cuantización para NPU.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/amd/whisper-tiny_rai_1.9.0_m_1.0.1_npu
- Modelo base: https://huggingface.co/openai/whisper-tiny
- Paper de Whisper (OpenAI): https://arxiv.org/abs/2212.04356
- Ryzen AI Software (AMD): https://www.amd.com/en/developer/resources/ryzen-ai-software.html
- Repositorio ONNX Runtime: https://github.com/microsoft/onnxruntime
