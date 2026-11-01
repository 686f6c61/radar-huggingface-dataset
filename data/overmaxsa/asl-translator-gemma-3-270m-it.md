# OvermaxSA/asl-translator-gemma-3-270m-it

## Resumen

`OvermaxSA/asl-translator-gemma-3-270m-it` es un repositorio de Hugging Face que aloja una copia sin modificar del modelo Gemma 3 270M instruction-tuned de Google, cuantizado a int8 y empaquetado en formato LiteRT-LM (`.litertlm`). No se trata de un fine-tuning ni de una adaptación: el autor (OvermaxSA) lo publica como artefacto de distribución para su aplicación Android "ASL Translator: Sign Language", que lo descarga opcionalmente en el dispositivo para convertir secuencias de signos de lengua de signos americana (ASL) y palabras deletreadas con los dedos en frases coherentes.

El modelo base es un transformer decoder-only de 270 millones de parámetros, la variante más pequeña de la familia Gemma 3, diseñada por Google para inferencia en dispositivo. La relevancia de este repositorio no está en innovaciones de arquitectura ni en un entrenamiento nuevo, sino en el empaquetado: ofrece un binario int8 listo para LiteRT-LM en Android, con inferencia totalmente local (sin llamadas a servidor), verificado mediante SHA-256 y acompañado de los términos legales de Gemma.

Es un caso representativo del patrón "modelo pequeño + cuantización + runtime móvil" para tareas acotadas de generación de texto, donde un LLM de 270M actúa como post-procesador lingüístico de una señal estructurada (signos reconocidos) en lugar de como chatbot generalista.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 3, variante 270M) |
| Parametros totales | 270 millones (según denominación del modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | int8 (único formato publicado en este repo) |
| Idiomas soportados | no disponible |
| Licencia | Gemma Terms of Use (licencia "gemma") |
| Formato de pesos | LiteRT-LM (`.litertlm`); no se incluyen safetensors ni GGUF |

## Arquitectura y entrenamiento

El repositorio no entrena ni modifica el modelo: aloja byte a byte el artefacto publicado por Google en Kaggle (`google/gemma-3/tfLite/gemma-3-270m-it-int8`, versión 1), con SHA-256 `757e9119fa5bd667a2774fb470ac4afcd3190a21c677f8e69a5d6bc908abdd63`. La arquitectura corresponde al modelo base `google/gemma-3-270m-it`, un transformer decoder-only instruction-tuned de 270M parámetros; los detalles de composición del dataset, número de tokens de entrenamiento y etapas de alineación (RLHF/DPO) no se especifican en la información disponible y deben consultarse en la model card oficial de Google.

La particularidad técnica de este artefacto es el pipeline de despliegue: conversión a LiteRT (anteriormente TensorFlow Lite) y empaquetado en el contenedor `.litertlm` con pesos int8, pensado para ejecución en CPU/NPU de Android mediante la librería `litert-lm`. No se documentan innovaciones como decodificación especulativa, atención lineal ni modos de razonamiento extendido en la información proporcionada.

## Capacidades

- Generación de texto instructiva (instruction-tuned) a partir de prompts; en este despliegue concreto, reconstrucción de frases a partir de secuencias de signos ASL y deletreo dactilar.
- Ejecución completamente local en dispositivo Android mediante LiteRT-LM, sin envío de datos a servidores.
- Cuantización int8 que reduce el peso del artefacto a aproximadamente 0,3 GB en el repositorio.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Capacidades especiales (visión, audio, thinking mode): no disponibles en la información proporcionada; el modelo base es de texto.

## Casos de uso

- Traducción de ASL a texto en Android: la app de Overmax reconoce signos y deletreo dactilar y usa el modelo para unirlos en una frase gramaticalmente coherente; encaja porque la tarea es de post-proceso lingüístico acotado y el modelo cabe en el dispositivo.
- Accesibilidad en tiempo real sin conexión: usuarios sordos o con dificultades auditivas pueden comunicarse en entornos sin red (aviones, zonas rurales, edificios con mala cobertura) gracias a la inferencia 100% local.
- Privacidad por diseño en aplicaciones de salud o educación: al no enviar audio, vídeo ni texto a un servidor, el modelo es adecuado para contextos con requisitos de protección de datos (RGPD) donde la inferencia en nube sería problemática.
- Prototipado de pipelines LiteRT-LM en Android: sirve como referencia funcional para desarrolladores que quieran integrar un LLM int8 en una app móvil con `litert-lm`, verificando el flujo de descarga, verificación SHA-256 y carga del `.litertlm`.
- Corrección y suavizado de salidas de un clasificador de signos: el modelo puede reformular secuencias telegráficas ("YO QUIERE AGUA") en oraciones naturales, una tarea de generación corta donde 270M parámetros suelen ser suficientes.
- Asistencia educativa para aprendizaje de ASL: la app puede mostrar la frase reconstruida al estudiante para comparar con su producción, con latencia baja y sin coste de API.
- Distribución de artefactos on-device verificables: el patrón de publicar el binario con hash y documentos legales adjuntos es replicable para equipos que necesiten auditar la cadena de suministro de modelos en apps móviles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no aplica en el sentido tradicional; el artefacto int8 ocupa aproximadamente 0,3 GB en almacenamiento y requiere una huella de memoria en RAM del orden de cientos de MB, aunque no se especifica el pico exacto en la información proporcionada.
- GPU recomendadas: no disponible; el despliegue objetivo es CPU/NPU de smartphones Android mediante LiteRT-LM.
- ¿Cabe en GPU de consumo? El modelo base de 270M cabría holgadamente en cualquier GPU de consumo (RTX 3060 en adelante), pero este repositorio concreto está empaquetado para LiteRT-LM en Android, no para CUDA.
- Opciones de despliegue: LiteRT-LM (runtime objetivo). Para el modelo base en otros entornos, cabría usar llama.cpp, Ollama o vLLM con los pesos originales de `google/gemma-3-270m-it`, aunque esos formatos no se incluyen aquí.
- Latencia y throughput: no disponibles en la información proporcionada; dependerán del SoC Android concreto y de la longitud de la secuencia de signos de entrada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato on-device | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| OvermaxSA/asl-translator-gemma-3-270m-it | 270M | no disponible | LiteRT-LM int8 | Gemma Terms of Use | Hugging Face (7 descargas) |
| google/gemma-3-270m-it (base) | 270M | no disponible | safetensors, GGUF (según distribución de Google) | Gemma Terms of Use | Kaggle / Hugging Face |
| Qwen2.5-0.5B-Instruct | 500M | 32K (según model card pública de Qwen) | safetensors, GGUF | Apache 2.0 | Hugging Face |
| SmolLM2-360M-Instruct | 360M | 8K (según model card pública de Hugging Face) | safetensors, GGUF | Apache 2.0 | Hugging Face |

La comparación relevante es con el modelo base de Google (idéntico en pesos, distinto empaquetado) y con alternativas de tamaño similar con licencias más permisivas para uso comercial (Apache 2.0 frente a Gemma Terms of Use). Este repositorio no aporta mejoras de rendimiento sobre el base; su valor es el formato LiteRT-LM listo para Android.

## Limitaciones y advertencias

- No es un fine-tuning: no ha sido entrenado específicamente para ASL ni para reconstrucción de frases a partir de signos; el rendimiento en esa tarea depende del prompting y de la calidad del reconocedor previo, y no se documenta evaluación alguna.
- Sesgos conocidos: no disponibles en la información proporcionada; al ser el modelo base de Google sin modificar, hereda los sesgos del Gemma 3 270M original.
- Riesgo de alucinación: presente como en cualquier LLM; en una app de accesibilidad, una frase reconstruida incorrectamente puede tener consecuencias comunicativas serias, por lo que conviene mostrar la salida como sugerencia editable.
- Limitaciones de contexto e idioma: no documentadas; el modelo base está orientado a texto y su ventana de contexto no se especifica en este repositorio.
- Restricciones de licencia: sujeto a los Gemma Terms of Use y a la Gemma Prohibited Use Policy; el uso comercial está permitido bajo esas condiciones, pero no es una licencia permisiva tipo Apache 2.0 y existen restricciones de uso prohibido que el integrador debe respetar y transmitir a los usuarios finales.
- Verificación de integridad: el autor publica el SHA-256 del binario; en producción conviene comprobarlo tras la descarga antes de cargarlo en memoria.
- Madurez del repositorio: 7 descargas y 0 likes en el momento de la consulta, creado y actualizado el mismo día (2026-10-29); no hay evidencia de uso en producción ni issues reportados.
- Dependencia de LiteRT-LM: el artefacto no es portable a otros runtimes sin reconversión; equipos que usen llama.cpp u Ollama deberán partir del modelo base original.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/OvermaxSA/asl-translator-gemma-3-270m-it
- Modelo base: https://huggingface.co/google/gemma-3-270m-it
- Gemma Terms of Use: https://ai.google.dev/gemma/terms
- Gemma Prohibited Use Policy: https://ai.google.dev/gemma/prohibited_use_policy
- Origen del artefacto (Kaggle): `google/gemma-3/tfLite/gemma-3-270m-it-int8`, versión 1
- LiteRT (runtime): https://ai.google.dev/edge/litert
- LiteRT-LM: no disponible enlace específico en la información proporcionada
