# muzammilsoft/zool-ai-ft0.5

## Resumen

Zool-AI-ft0.5 es un modelo de lenguaje de 0,5 mil millones de parámetros ajustado para conversar en dialecto sudanés del árabe. Lo publica el usuario muzammilsoft en HuggingFace y parte de Qwen2.5-0.5B-Instruct como modelo base, sobre el que se aplicó un ajuste fino con QLoRA (r=16, 3 épocas) usando 1088 ejemplos de conversación (1028 de entrenamiento y 60 de evaluación). Su rasgo diferencial no es el tamaño, sino el formato de entrega: se distribuye exclusivamente como artefacto TFLite cuantizado en dynamic_int8, pensado para ejecutarse en teléfonos y dispositivos de gama baja mediante el motor LiteRtDirectEngine de la aplicación Zool-AI.

El modelo responde a un problema muy concreto: no existen apenas alternativas ligeras y ejecutables en el dispositivo para el dialecto sudanés, un registro poco representado en los corpus de árabe estándar moderno. Al comprimir el modelo a 511 MB en int8 y exportarlo con firmas separadas de `decode` y `prefill_512`, el autor prioriza la viabilidad en edge computing por encima de la capacidad de razonamiento o la cobertura temática.

Es relevante ahora porque ejemplifica una tendencia clara en el ecosistema open source: adaptar modelos pequeños de la familia Qwen2.5 a variedades dialectales y a formatos de despliegue móvil. Sus limitaciones son, sin embargo, notables: el conjunto de datos de ajuste es muy reducido, las capacidades declaradas se restringen a conversación cotidiana y el repositorio no incluye pipeline declarado, benchmarks ni métricas de evaluación publicadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, derivada de Qwen2.5-0.5B-Instruct |
| Parametros totales | 0,5 mil millones (0.5B) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible de forma explicita; el nombre del artefacto (`_ekv1024`) y la firma `prefill_512` sugieren una cache KV de 1024 tokens y un prefill de 512, dato no confirmado en la model card |
| Tipos de cuantizacion | dynamic_int8 (TFLite); el fichero se nombra como `q8` |
| Idiomas soportados | arabe (`ar`), con especializacion en dialecto sudanes; el modelo base soporta mas idiomas, pero el ajuste fino solo cubre arabe sudanes |
| Licencia | Apache 2.0 |
| Formato de pesos | TFLite (`.tflite`, 511 MB) mas `tokenizer.json` en el mismo directorio |
| Tamano del repositorio | 0,5 GB |
| Tamano de vocabulario | 151936 tokens |
| Formato de chat | ChatML |
| Firma del modelo | `decode` + `prefill_512` |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-0.5B-Instruct, un transformer decoder-only con atención causal. El autor no describe modificaciones estructurales: el trabajo se centra en el ajuste fino y, sobre todo, en el proceso de exportación. El ajuste se realizó con QLoRA de rango 16 durante 3 épocas sobre 1028 ejemplos de entrenamiento, con un conjunto de evaluación de solo 60 ejemplos. La composición del dataset incluye conversaciones en dialecto sudanés, tareas de traducción desde árabe estándar e inglés hacia sudanés, refranes populares, contenido sobre gastronomía sudanesa y ejemplos de identidad del propio asistente Zool-AI.

La innovación técnica destacable es la cadena de conversión: se usó `litert-torch` (con el ejemplo de Qwen) para fusionar y convertir el modelo a TFLite con cuantización `dynamic_int8`, obteniendo un artefacto de 511 MB que expone dos firmas diferenciadas, `prefill_512` para el procesamiento inicial del prompt y `decode` para la generación autorregresiva con caché KV externa. El autor afirma haber validado la compatibilidad mediante una ejecución en vivo completa (prefill más generación autorregresiva) antes de publicar. No se menciona ningún uso de RLHF, DPO u otra fase de alineación adicional sobre el ajuste supervisado.

## Capacidades

- Generación de texto conversacional en dialecto sudanés del árabe, con respuestas breves orientadas a registro coloquial.
- Adaptación de registro: conversión de árabe estándar moderno e inglés hacia dialecto sudanés.
- Conocimiento cultural acotado: refranes populares sudaneses y contenidos sobre gastronomía local, según la composición declarada del dataset.
- Coherencia de personaje: mantiene la identidad del asistente Zool-AI definida en el prompt de sistema.
- Formato de conversación ChatML con roles `system`, `user` y `assistant`.
- Inferencia en dispositivo con caché KV de 1024 tokens y prefill de 512.
- No se declara soporte de tool calling ni function calling.
- No se declara soporte de agentes ni razonamiento multi-paso.
- No se declara capacidad de visión, audio ni modo de razonamiento explícito.
- Cobertura multilingüe efectiva limitada al árabe sudanés; el conocimiento del modelo base en otros idiomas puede degradarse tras el ajuste.

## Casos de uso

- Asistente conversacional integrado en aplicación móvil: el modelo está empaquetado en TFLite con 511 MB en int8 y se ejecuta localmente en el teléfono mediante LiteRtDirectEngine, sin conexión a red ni coste por token de API.
- Atención al público en dialecto sudanés: puede gestionar diálogos cotidianos y breves con usuarios que escriben en registro coloquial, un registro que los modelos de árabe estándar no cubren bien.
- Traducción asistida de árabe estándar o inglés a sudanés: útil para adaptar material divulgativo, avisos o contenidos de producto a la variedad local.
- Preservación y difusión cultural: dado que el dataset incluye refranes y contenidos gastronómicos sudaneses, puede emplearse en aplicaciones educativas o divulgativas sobre cultura popular local.
- Despliegue en hardware de bajísimo consumo: con unos 511 MB en int8, encaja en Raspberry Pi, placas con 1-2 GB de RAM y teléfonos de gama baja donde ningún modelo de 7B es viable.
- Prototipado y experimentación en edge AI: sirve como punto de partida documentado para probar la cadena QLoRA más `litert-torch` más TFLite con otros dialectos o dominios.
- Modo sin conectividad en zonas de red limitada: al ser totalmente local, funciona en escenarios de campo, desplazamientos o regiones con cobertura intermitente.
- Base para ajuste adicional: al estar bajo Apache 2.0 y derivar de Qwen2.5, puede reajustarse con más datos dialectales para corregir sus carencias.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni ninguna evaluación automática, y tampoco reporta la pérdida de validación del ajuste ni resultados comparativos frente al modelo base. El único dato de evaluación declarado es el tamaño del conjunto de validación (60 ejemplos), sin cifras de rendimiento asociadas.

## Requisitos de hardware

- VRAM/RAM en inferencia: el artefacto pesa 511 MB en dynamic_int8; en la práctica se necesita aproximadamente 0,6-1 GB de memoria libre para el modelo, el tokenizador y las activaciones durante el prefill.
- GPU: no es un modelo orientado a GPU de datacenter; no se requiere A100, H100 ni similar. El formato TFLite con delegados permite aceleración en GPU móvil (Adreno, Mali) y en NPU compatibles.
- Cabe en GPU de consumo: sí, cualquier GPU con 2 GB o más puede ejecutarlo, aunque su destino natural son CPU/NPU móviles. En una RTX 4090 o similar estaría severamente infrautilizada.
- Cabe en dispositivos de gama baja: sí, es uno de sus objetivos de diseño, esperando encajar en teléfonos con 2 GB de RAM y en placas tipo Raspberry Pi.
- Opciones de despliegue: LiteRT/TFLite con el motor LiteRtDirectEngine del autor o cualquier runtime LiteRT que soporte firmas múltiples. No hay indicios de soporte para vLLM, llama.cpp, Ollama o TGI, ya que no se publican pesos en safetensors ni GGUF.
- Latencia y throughput: no disponible. No se publican mediciones de tokens por segundo ni de tiempo de prefill en ningún dispositivo concreto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Especializacion |
|---|---|---|---|---|---|
| Zool-AI-ft0.5 | 0,5B | no disponible (indicio de 1024 en cache KV) | TFLite dynamic_int8 | Apache 2.0 | Dialecto sudanes, edge |
| Qwen2.5-0.5B-Instruct | 0,5B | no disponible en esta ficha | safetensors (modelo base) | Apache 2.0 | Multilingue general |
| Qwen2.5-1.5B-Instruct | 1,5B | no disponible en esta ficha | safetensors | Apache 2.0 | Multilingue general |
| Gemma 2 2B Instruct | 2B | no disponible en esta ficha | safetensors | terminos propios de Google | Multilingue general |

Los datos de contexto de los modelos comparados no se han verificado en las fuentes proporcionadas para esta ficha y se marcan como no disponibles. La comparativa relevante es de posicionamiento, no de rendimiento: Zool-AI-ft0.5 es el único de la lista especializado en dialecto sudanés y el único distribuido exclusivamente como artefacto TFLite listo para móvil. No se dispone de datos de benchmarks que permitan comparar su calidad frente a estos modelos, y no se han identificado alternativas publicadas equivalentes para dialecto sudanés en la busqueda realizada.

## Limitaciones y advertencias

- Capacidad de razonamiento muy limitada: con 0,5B de parámetros, el autor reconoce explícitamente que el modelo falla en razonamiento complejo y en temas especializados.
- Riesgo alto de alucinación: la propia model card advierte de que puede producir respuestas inexactas y recomienda verificar cualquier información importante.
- Dataset de ajuste muy reducido: 1028 ejemplos de entrenamiento y solo 60 de evaluación, una base insuficiente para garantizar generalización o robustez.
- Variabilidad dialectal: el sudanés generado puede no corresponder al uso local real de determinadas regiones, tal como advierte el autor.
- Sesgos: no se documenta ningún análisis de sesgos. Los contenidos culturales y de identidad del modelo proceden de un corpus pequeño y no auditado.
- Limitación idiomática severa: fuera del árabe sudanés, el comportamiento del modelo no está caracterizado y probablemente sea peor que el del modelo base.
- Restricciones de licencia: Apache 2.0 permite uso comercial y modificación, pero conviene verificar las condiciones del modelo base Qwen2.5 y el cumplimiento de atribución.
- Formato de despliegue cerrado: al no publicar safetensors ni GGUF, el modelo queda atado a runtimes LiteRT con soporte de firmas múltiples, lo que dificulta su uso en ecosistemas habituales como vLLM o llama.cpp.
- Madurez del repositorio: cero descargas y cero likes, pipeline no declarado, creado y actualizado con ocho segundos de diferencia y sin datos de validación reproducibles publicados.
- Idiomas declarados: el campo de idioma del repositorio solo incluye `ar`, por lo que no debe asumirse soporte multilingüe efectivo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/muzammilsoft/zool-ai-ft0.5
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Herramienta de conversion citada en la model card: `litert-torch` (ejemplo de Qwen), mencionada sin enlace directo en la informacion disponible
- Runtime LiteRT de Google AI Edge, requerido para ejecutar los artefactos TFLite, mencionado sin enlace directo en la informacion disponible
- La busqueda web realizada no devolvio resultados relevantes sobre el modelo: los unicos enlaces recuperados corresponden al portal de anuncios leboncoin y no guardan relacion con este proyecto.
