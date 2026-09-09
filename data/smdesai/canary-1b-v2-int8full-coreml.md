# smdesai/canary-1b-v2-int8full-coreml

## Resumen

El modelo `smdesai/canary-1b-v2-int8full-coreml` es una conversión a CoreML con cuantización INT8 completa del modelo NVIDIA `canary-1b-v2`, un sistema de reconocimiento de voz (ASR) y traducción de voz desarrollado por NVIDIA. La conversión, realizada por smdesai, está diseñada para ejecutarse de forma nativa en el Apple Neural Engine, con encoder, decoder con KV-cache y proyección cross-KV en INT8 por canales. El objetivo principal es ofrecer una alternativa de baja memoria (alrededor de 1.0 GB de RAM en iOS) sin comprometer la precisión frente al build FP16 de referencia.

El modelo base es un `EncDecMultiTaskModel` de NeMo con 1.000 millones de parámetros, que soporta 25 lenguas europeas y tareas de transcripción y traducción de voz. Esta versión CoreML tiene una precisión declarada equivalente a la referencia FP16, pero con aproximadamente la mitad de consumo de RAM y un decoder más rápido. Es relevante para desarrolladores que necesitan ASR y traducción de voz en dispositivos Apple, con privacidad garantizada y sin dependencia de la nube.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer encoder + Transformer decoder (NVIDIA NeMo EncDecMultiTaskModel) |
| Parametros totales | 1.000 millones (modelo base; la conversión no altera la arquitectura) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (el preprocesador usa una ventana de audio de 15 segundos) |
| Tipos de cuantizacion | INT8 per-channel en encoder, decoder y cross-KV |
| Idiomas soportados | 25 lenguas europeas: búlgaro, croata, checo, danés, neerlandés, inglés, estonio, finés, francés, alemán, griego, húngaro, italiano, letón, lituano, maltés, polaco, portugués, rumano, eslovaco, esloveno, español, sueco, ruso y ucraniano |
| Licencia | CC-BY-4.0 |
| Formato de pesos | CoreML (.mlmodelc, .spe, metadata.json) |

## Arquitectura y entrenamiento

El modelo base `nvidia/canary-1b-v2` utiliza un encoder FastConformer de 32 capas con dimensión interna 1024 y subsampling de 8, y un decoder Transformer de 8 capas con una cabecera softmax de 16.384 piezas. El front-end de audio extrae features mel de 128 bins a 16 kHz mono, con ventanas de 15 segundos. La infraestructura de decodificación incluye un KV-cache stateful que permite la generación paso a paso.

Esta conversión no implica reentrenamiento: se trata de una cuantización de los pesos originales a INT8 por canales para el encoder, el decoder y la proyección cross-KV. Según el autor de la conversión, la precisión se mantiene igual que en el build FP16 de referencia. No se ofrecen datos sobre el corpus de entrenamiento ni el número de tokens utilizados para entrenar el modelo base en la información disponible.

## Capacidades

- Reconocimiento automático de voz (ASR) en 25 lenguas europeas, incluyendo español, inglés, francés, alemán, etc.
- Traducción de voz entre lenguas europeas dentro del mismo modelo.
- Ejecución completamente local en Apple silicon, utilizando el Apple Neural Engine.
- Decodificación incremental con KV-cache, optimizada para inferencia paso a paso.
- Compatibilidad con iOS y macOS mediante CoreML, con un tamaño de descarga de 0.95 GB.
- Eficiencia de memoria medida: 1.0 GB de RAM en iOS durante la transcripción de un archivo de 6 minutos.
- No soporta tool calling, function calling ni agentes: es un modelo de habla, no un LLM de texto generalista.

## Casos de uso

- Transcripción de reuniones multilingües en Mac: una app graba el audio de una reunión y el modelo lo convierte en texto localmente, usando la ventana de 15 segundos y el decodificador incremental.
- Subtitulación de vídeo en tiempo real en iPhone: se integra en una app de edición para generar subtítulos en 25 idiomas mientras se reproduce el vídeo, sin enviar datos a servidores.
- Asistente de voz offline en dispositivos Apple: el modelo permite reconocer comandos de voz en zonas sin cobertura, gracias a su dependencia únicamente del Apple Neural Engine.
- Dictado clínico privado: profesionales sanitarios dictan informes en su idioma europeo y la transcripción se realiza en el dispositivo, cumpliendo requisitos de privacidad de datos médicos.
- Accesibilidad para personas con discapacidad auditiva: una app de subtitulado en vivo muestra el texto de conversaciones en tiempo real en iOS o macOS, garantizando latencia baja y funcionamiento sin conexión.
- Análisis de llamadas en centros de contacto: el modelo procesa grabaciones de llamadas en varios idiomas europeos para obtener transcripciones que posteriormente se analizan con herramientas de texto.
- Intérprete de viaje en iPhone: una aplicación de traducción de voz funciona entre dos idiomas europeos directamente en el dispositivo, ideal para turistas o viajeros de negocios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor de la conversión indica que la precisión coincide con la del build FP16 de referencia (`canary-1b-v2-coreml`), pero no aporta cifras concretas. El rendimiento de decodificación se estima en 2.4–3.3 ms por token en un Mac con M3 Max, según el modelo card. No se dispone de datos de MMLU, HumanEval ni GSM8K porque no es un modelo de lenguaje general.

## Requisitos de hardware

- Dispositivos Apple silicon: iPhone y Mac con Apple Neural Engine.
- RAM estimada durante la inferencia: 1.0 GB en iOS mientras se transcribe un archivo de 6 minutos (medido).
- Tamaño de descarga: 0.95 GB (el repositorio de HuggingFace indica 0.9 GB).
- Encoder residente: aproximadamente 0.8 GB.
- Decoder residente: aproximadamente 134 MB.
- GPU: no es necesaria; el planificador de CoreML prefiere el Apple Neural Engine para el decoder si se configura `cpuAndNeuralEngine`.
- Opciones de despliegue: CoreML en aplicaciones iOS y macOS desde Xcode.
- No es compatible con vLLM, llama.cpp, Ollama ni TGI, ya que el formato es CoreML y requiere dispositivos Apple.

## Comparativa con modelos similares

La siguiente tabla compara esta conversión con otros builds de la misma familia, manteniendo el mismo modelo base `nvidia/canary-1b-v2`:

| Repo de HuggingFace | Encoder | Decoder | Descarga | RAM en iOS (medida) |
|---|---|---|---|---|
| `smdesai/canary-1b-v2-coreml` | FP16 | FP16 | 1.89 GB | 1.9 GB |
| `smdesai/canary-1b-v2-int8-coreml` | INT8 per-channel | FP16 | 1.10 GB | 1.2 GB |
| `smdesai/canary-1b-v2-int8full-coreml` (este) | INT8 per-channel | INT8 per-channel | 0.95 GB | 1.0 GB |
| `smdesai/canary-1b-v2-pal6-coreml` | 6-bit palette, g=16 | FP16 | 0.92 GB | 1.0 GB |
| `smdesai/canary-1b-v2-pal6-int8-coreml` | 6-bit palette, g=16 | INT8 per-channel | 0.77 GB | 910 MB |
| `smdesai/canary-180m-flash-coreml` | FP16 (17 capas, d=512) | FP16 (4 capas) | 0.37 GB | 470 MB |

El modelo original `nvidia/canary-1b-v2` está disponible en pesos FP16 para su uso con NeMo, pero no está optimizado para CoreML ni para Apple Neural Engine.

## Limitaciones y advertencias

- Solo compatible con Apple silicon y el formato CoreML; no se puede ejecutar en GPUs NVIDIA ni en otras plataformas sin una conversión adicional a otro formato.
- No incluye soporte de tool calling, function calling ni agentes: es un modelo especializado en habla y no genera texto libre.
- La ventana de audio está limitada a 15 segundos; el audio largo requiere segmentación o solapamiento de ventanas.
- Idiomas restringidos a 25 lenguas europeas; no soporta lenguas fuera de ese conjunto.
- Licencia CC-BY-4.0, permisiva para uso comercial, pero requiere atribución a NVIDIA por el modelo original.
- La cuantización INT8 puede introducir una pérdida de precisión en casos extremos, aunque el autor afirma que coincide con el build FP16 sin datos de benchmark que lo confirmen.
- Puede producir errores de transcripción o traducción en entornos ruidosos, con acentos poco comunes o en dominios técnicos no cubiertos por el entrenamiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/smdesai/canary-1b-v2-int8full-coreml
- Modelo base de NVIDIA: https://huggingface.co/nvidia/canary-1b-v2
- Build FP16 de referencia: https://huggingface.co/smdesai/canary-1b-v2-coreml
- Build INT8 encoder: https://huggingface.co/smdesai/canary-1b-v2-int8-coreml
- Build 6-bit encoder: https://huggingface.co/smdesai/canary-1b-v2-pal6-coreml
- Build 6-bit + INT8: https://huggingface.co/smdesai/canary-1b-v2-pal6-int8-coreml
- Modelo 180M flash: https://huggingface.co/smdesai/canary-180m-flash-coreml
