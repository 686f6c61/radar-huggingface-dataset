# mostafa-ibrahim1625/qwen2.5-1.5b-instruct-hippolink

## Resumen

Este repositorio contiene una versión cuantizada y empaquetada de `Qwen/Qwen2.5-1.5B-Instruct`, publicada por el usuario `mostafa-ibrahim1625` bajo la marca HippoLink. No es un modelo entrenado desde cero: es un artefacto derivado con pesos INT4 AWQ y formatos ONNX/OpenVINO, orientado a ejecución offline en teléfonos de gama media. El modelo base es un transformer decoder-only de 1.540 millones de parámetros y 32.768 tokens de contexto, desarrollado por Alibaba Qwen.

La propuesta es reducir la huella para RAG local: la model card describe un bundle con embedder multilingüe, detectores faciales y el SLM, con verificación criptográfica de manifiestos. Los datos de rendimiento en dispositivo son declarados por el autor (TTFT de 129 a 248 ms, 28,2 a 69,6 tok/s y 414 a 1.212 MB de RAM pico), pero no se han verificado de forma independiente.

Es relevante para desarrolladores que evalúan LLM en el borde, aunque presenta señales de cautela: el repositorio no declara licencia ni idiomas, tiene 0 descargas y la model card incluye afirmaciones clínicas y métricas perfectas sin auditoría externa. Conviene tratar el artefacto como una demo técnica o un componente a validar, no como un producto certificado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) con RoPE, SwiGLU, RMSNorm y atención con cabezas KV agrupadas (GQA); cuantización INT4 AWQ simétrica |
| Parámetros totales | 1.540 millones (modelo base Qwen2.5-1.5B-Instruct); artefacto cuantizado de ~0,2 GB |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 32.768 tokens en el modelo base; no confirmado en el artefacto |
| Tipos de cuantización | INT4 AWQ simétrica, group size 128, alpha 0,75; el bundle menciona INT8 para embedder y detectores, no para el LLM |
| Idiomas soportados | No disponible en el repositorio; el modelo base declara 29+ idiomas |
| Licencia | No disponible en el repositorio; el modelo base Qwen2.5-1.5B-Instruct usa Apache 2.0 |
| Formato de pesos | ONNX (MatMulNBits) y OpenVINO IR; tamaño del repositorio 0,2 GB |
| Runtime objetivo | OpenVINO GenAI Mobile y ONNX Runtime GenAI |
| Hardware objetivo | Móvil de gama media (MID), con 4-12 GB de RAM según la model card |

## Arquitectura y entrenamiento

El modelo base Qwen2.5-1.5B-Instruct es un transformer decoder-only con atención causal, codificación posicional rotatoria (RoPE), activación SwiGLU, normalización RMSNorm y atención con cabezas KV agrupadas. No emplea mezcla de expertos ni arquitecturas híbridas SSM. Su ventana nativa es de 32.768 tokens y está ajustado para instrucciones y conversación multi-turno.

Este repositorio no documenta un reentrenamiento ni un fine-tuning clínico. La model card describe una receta de cuantización post-entrenamiento AWQ con grupo de 128 y alpha 0,75, además de un corpus de calibración con hash SHA-256. También incluye una firma Ed25519 y hashes del benchmark, pero la cadena de custodia no se puede verificar desde los metadatos públicos de HuggingFace. El modelo base Qwen2.5 se entrenó con hasta 18 billones de tokens según la documentación oficial de Qwen; la composición exacta del dataset de este derivado no está disponible.

## Capacidades

- Generación de texto y conversación multi-turno en inglés, chino y otros idiomas del modelo base; el derivado no documenta evaluaciones por idioma.
- Razonamiento básico, matemáticas y generación de código, limitados por el tamaño de 1.540 millones de parámetros.
- RAG con abstención: la model card declara un token `NO_RECORD` y un umbral de similitud de 0,78 para responder solo con evidencia recuperada.
- Soporte de salidas estructuradas y function calling según la documentación del modelo base Qwen2.5-Instruct; este artefacto no incluye validación específica.
- Ejecución offline en dispositivos móviles mediante OpenVINO GenAI Mobile y ONNX Runtime GenAI.
- Capacidades multimodales: no disponibles. El bundle incluye detectores faciales, pero el LLM es solo texto.
- Modo de razonamiento explícito o thinking mode: no disponible.

## Casos de uso

- RAG documental offline en móvil: el modelo puede responder preguntas sobre documentos locales usando un embedder multilingüe y el SLM cuantizado. Es adecuado porque el artefacto cabe en 414-1.212 MB de RAM según la gama del dispositivo y permite abstenerse cuando no hay evidencia.
- Atención al cliente en kioscos o tablets sin conexión: puede gestionar conversaciones multi-turno sobre preguntas frecuentes, políticas internas o catálogos, manteniendo los datos en el dispositivo.
- Resumen y extracción de información en local: útil para resumir
