# Pragmaticl/Qwen3-TTS-12Hz-1.7B-Base

## Resumen

Qwen3-TTS-12Hz-1.7B-Base es la variante base de la familia Qwen3-TTS, un conjunto de modelos de síntesis de voz (text-to-speech) desarrollados por el equipo Qwen de Alibaba. Este checkpoint concreto, republicado en Hugging Face bajo el identificador Pragmaticl/Qwen3-TTS-12Hz-1.7B-Base, implementa un modelo de lenguaje autorregresivo sobre códigos acústicos discretos que genera voz de alta fidelidad de extremo a extremo, sin depender de un decodificador DiT separado.

La relevancia técnica del modelo reside en su arquitectura de LM discreto multi-codebook, que evita los cuellos de botella de información y los errores en cascada típicos de los esquemas híbridos LM+DiT. Incorpora además una arquitectura de generación en streaming híbrida de doble pista (Dual-Track) que permite emitir el primer paquete de audio tras procesar un único carácter, con latencias de extremo a extremo declaradas de hasta 97 ms.

La variante Base está orientada a la clonación rápida de voz a partir de 3 segundos de audio del usuario y sirve como punto de partida para fine-tuning. Cubre diez idiomas principales (chino, inglés, japonés, coreano, alemán, francés, ruso, portugués, español e italiano) y se distribuye con licencia Apache 2.0. El modelo tiene 1.928.677.440 parámetros reales según los pesos en safetensors, con un repositorio de 4,5 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LM autorregresivo discreto multi-codebook sobre tokens acústicos (Qwen3-TTS-Tokenizer-12Hz); streaming híbrido Dual-Track |
| Parametros totales | 1.928.677.440 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Chino, inglés, japonés, coreano, alemán, francés, ruso, portugués, español, italiano (más perfiles dialectales) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura de modelo de lenguaje discreto multi-codebook que modela directamente los códigos acústicos producidos por el tokenizador propio Qwen3-TTS-Tokenizer-12Hz. Este tokenizador realiza compresión acústica eficiente y modelado semántico de alta dimensión de la señal de voz, preservando información paralingüística y características del entorno acústico, y permite reconstruir la voz mediante una arquitectura ligera no basada en DiT. Al operar de extremo a extremo sobre tokens discretos, el modelo evita las pérdidas de información y los errores acumulados de los pipelines LM+DiT convencionales.

La generación se apoya en una arquitectura de streaming híbrida de doble pista que permite, con un mismo modelo, tanto generación en streaming como no streaming. El modelo puede emitir el primer paquete de audio tras procesar un solo carácter de entrada, lo que da lugar a una latencia de síntesis de extremo a extremo declarada de 97 ms. La variante Base está específicamente preparada para clonación de voz a partir de 3 segundos de audio y para servir de base a fine-tuning. No se han publicado en la información disponible detalles sobre el número de tokens de entrenamiento, la composición del dataset ni las etapas de alineación (RLHF/DPO) empleadas.

## Capacidades

- Síntesis de voz (text-to-speech) de extremo a extremo en diez idiomas principales y múltiples perfiles dialectales.
- Clonación rápida de voz a partir de una muestra de audio del usuario de 3 segundos.
- Generación en streaming con latencia de extremo a extremo declarada de hasta 97 ms, apta para interacción en tiempo real.
- Comprensión contextual del texto para adaptar tono, velocidad de habla y expresión emocional según la semántica de la entrada.
- Robustez mejorada frente a texto de entrada ruidoso.
- Preservación de información paralingüística y de características del entorno acústico gracias al tokenizador de 12 Hz.
- Base para fine-tuning de otros modelos de la familia.
- No se documenta en la información disponible soporte de tool calling, capacidades de agente, visión ni audio de entrada más allá de la muestra de referencia para clonación.

## Casos de uso

- Atención al cliente automatizada: el modelo puede sintetizar respuestas habladas en tiempo real en un canal telefónico o de chat de voz, con streaming de baja latencia (97 ms) para evitar silencios incómodos y con adaptación del tono según el texto.
- Clonación de voz para locuciones personalizadas: a partir de 3 segundos de audio de un locutor se puede generar un perfil de voz reutilizable para narración de contenidos, audiolibros o vídeos, manteniendo el timbre y la prosodia del hablante original.
- Asistentes de voz embebidos: la variante de 1,7B parámetros y el formato safetensors permiten desplegar el modelo en infraestructura propia y servirlo mediante vLLM, integrándolo en asistentes conversacionales con control de emoción y ritmo.
- Doblaje y localización multilingüe: con soporte para diez idiomas, el modelo puede generar pistas de voz en distintos idiomas para un mismo contenido, ajustando la expresión emocional a la semántica de cada guion.
- Accesibilidad y lectura de contenido: conversión de artículos, documentos o notificaciones a voz natural con control de velocidad y entonación, útil en aplicaciones de lectura asistida.
- Generación de datos de voz sintética para entrenamiento: la variante Base, pensada para fine-tuning, puede emplearse como generador de muestras de voz con distintos timbres y emociones para aumentar datasets de ASR u otros sistemas de voz.
- Prototipado de interfaces de voz: desarrolladores que necesiten validar un producto conversacional pueden desplegar el modelo en local con pesos abiertos y licencia Apache 2.0, sin depender de APIs de terceros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 1.928.677.440 parámetros, en precisión de 16 bits los pesos ocupan aproximadamente 3,9 GB; en 8 bits, unos 1,9 GB; en 4 bits, alrededor de 1 GB. A ello hay que sumar el tokenizador Qwen3-TTS-Tokenizer-12Hz y el estado de decodificación en streaming.
- GPU recomendadas: para servicio en producción con streaming y concurrencia, GPU de datacenter como A100 o H100; para desarrollo y pruebas, una RTX 4090 (24 GB) es más que suficiente.
- Cabe en GPU de consumo: sí, el tamaño de pesos permite ejecutarlo en GPUs consumer con 8 GB o más de VRAM en cuantizaciones de 8 bits, y en 4 bits en GPUs de gama media con 6 GB.
- Opciones de despliegue: el paquete qwen-tts y vLLM se mencionan explícitamente en la model card como vías de carga del modelo; los pesos se descargan automáticamente por nombre de modelo o manualmente vía huggingface-cli o ModelScope.
- Latencia y throughput estimados: la model card declara una latencia de extremo a extremo de hasta 97 ms en modo streaming tras un único carácter de entrada; no se proporcionan cifras de throughput ni de latencia para generación no streaming.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Streaming | Control por instrucciones | Clonacion de voz | Licencia |
|---|---|---|---|---|---|---|
| Qwen3-TTS-12Hz-1.7B-Base (este) | 1,93B | 10 | Sí | No | Sí (3 s) | Apache 2.0 |
| Qwen3-TTS-12Hz-1.7B-CustomVoice | 1,7B (nominal) | 10 | Sí | Sí | No documentado | Apache 2.0 |
| Qwen3-TTS-12Hz-1.7B-VoiceDesign | 1,7B (nominal) | 10 | Sí | Sí | No documentado | Apache 2.0 |
| Qwen3-TTS-12Hz-0.6B-Base | 0,6B (nominal) | 10 | Sí | No | Sí (3 s) | Apache 2.0 |

Dentro de la propia familia Qwen3-TTS, la variante Base se distingue por priorizar la clonación de voz y el fine-tuning frente a las variantes CustomVoice y VoiceDesign, que ofrecen control por instrucciones y timbres predefinidos. No se dispone en la información proporcionada de datos de benchmarks que permitan comparar el rendimiento con modelos TTS de otros desarrolladores.

## Limitaciones y advertencias

- No se han publicado en la información disponible datos sobre sesgos demográficos, acústicos o lingüísticos del modelo.
- Riesgo de alucinación y de artefactos en la síntesis: como todo modelo generativo de audio, puede producir prosodia incorrecta, pronunciaciones erróneas o ruido en entradas atípicas; la model card solo declara robustez mejorada frente a texto ruidoso, sin cuantificarla.
- La clonación de voz a partir de 3 segundos de audio plantea riesgos de suplantación de identidad y uso no consentido; es responsabilidad del desplegador implementar controles de consentimiento y marcas de agua.
- No se documenta la longitud de contexto del modelo ni límites de longitud de texto de entrada, lo que dificulta planificar producciones de audio largas.
- Aunque la licencia Apache 2.0 permite uso comercial, el modelo se distribuye como republicación de terceros (Pragmaticl) con 0 descargas y 1 like en el momento de la consulta; conviene verificar la integridad de los pesos frente al repositorio oficial Qwen/Qwen3-TTS-12Hz-1.7B-Base.
- La variante Base no ofrece control por instrucciones (a diferencia de CustomVoice y VoiceDesign), por lo que el ajuste fino de emoción y estilo requiere fine-tuning o el uso de otras variantes.
- No se dispone de información sobre cuantizaciones oficiales publicadas ni sobre formatos GGUF para este checkpoint.

## Enlaces

- Hugging Face (republicación): https://huggingface.co/Pragmaticl/Qwen3-TTS-12Hz-1.7B-Base
- Repositorio oficial del modelo base: https://huggingface.co/Qwen/Qwen3-TTS-12Hz-1.7B-Base
- Tokenizador oficial: https://huggingface.co/Qwen/Qwen3-TTS-Tokenizer-12Hz
- Paper de referencia (arXiv:2601.15621): https://arxiv.org/abs/2601.15621
