# s2e-host/s2e-kokoro-coreml

## Resumen

s2e-host/s2e-kokoro-coreml es una conversión a Core ML del modelo de síntesis de voz Kokoro-82M, desarrollado originalmente por hexgrad, preparada para ejecutarse en dispositivos Apple (iPhone y iPad) mediante la Neural Engine. El repositorio, publicado por el usuario s2e-host, divide el modelo en siete etapas independientes (Albert, PostAlbert, Alignment, Prosody, Noise, Vocoder y Tail), lo que permite descargar, verificar y compilar cada fase por separado en el dispositivo.

El problema que resuelve es claro: llevar la síntesis de texto a voz de Kokoro-82M, un modelo TTS ligero y de calidad notablemente alta para su tamaño, a entornos móviles sin servidor ni conexión. Con solo 82 millones de parámetros y un peso total en este repo de aproximadamente 0,1 GB, es un candidato ideal para inferencia en dispositivos con chip A12 o posterior y iOS 17 en adelante.

La conversión se realizó con coremltools 9.0 y torch 2.7.0 utilizando el pipeline de laishere/kokoro-coreml, sin modificar los pesos originales. La voz incluida en esta configuración es af_heart. La relevancia de esta ficha radica en el interés creciente por el TTS on-device, que reduce latencia, coste de infraestructura y preocupaciones de privacidad frente a las APIs de voz en la nube.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TTS basado en StyleTTS 2 (componente ALBERT para el texto, más etapas de alineación, prosodia y vocoder) |
| Parametros totales | 82 M (modelo base Kokoro-82M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS; limitada por la duración del audio generable) |
| Tipos de cuantizacion | no disponible (conversión a Core ML sin modificación de pesos) |
| Idiomas soportados | no disponible en la ficha; el modelo base Kokoro-82M soporta principalmente inglés americano y británico |
| Licencia | Apache 2.0 |
| Formato de pesos | Core ML (.mlmodel/.mlpackage), organizado en siete etapas con manifest.json (SHA-256) |

## Arquitectura y entrenamiento

Kokoro-82M es un modelo de síntesis de voz derivado de la arquitectura StyleTTS 2, con un tamaño inusualmente reducido (82 millones de parámetros frente a los cientos de millones habituales en TTS modernos). Utiliza un modelo ALBERT ligero como codificador de texto y descompone la síntesis en etapas: codificación del texto, alineación de fonemas con duraciones, predicción de prosodia, generación de ruido/estocasticidad y un vocoder final que produce la forma de onda de audio.

Esta conversión a Core ML divide el pipeline en siete etapas independientes (Albert, PostAlbert, Alignment, Prosody, Noise, Vocoder y Tail). Este diseño modular permite que cada etapa se compile por separado en el dispositivo mediante el compilador de Core ML, facilitando actualizaciones parciales y verificación de integridad vía manifest.json, que lista cada archivo con su tamaño y hash SHA-256.

Sobre el entrenamiento del modelo base, la información disponible en esta ficha no detalla el número de tokens, la composición del dataset ni el uso de técnicas de alineamiento con datos etiquetados; no disponible. Los pesos de esta conversión son una copia sin modificar de los originales de hexgrad/Kokoro-82M.

## Capacidades

- Síntesis de texto a voz (TTS) completamente en el dispositivo (on-device) en iPhone y iPad con Neural Engine (chip A12 o posterior, iOS 17+).
- Voz incluida: af_heart (voz femenina americana del catálogo de Kokoro).
- Ejecución acelerada por la Neural Engine de Apple gracias a la conversión a Core ML.
- Descarga, verificación (SHA-256) y compilación de las siete etapas en el propio dispositivo, apto para apps que gestionan sus propios recursos.
- Licencia Apache 2.0, que permite uso comercial, modificación y redistribución.
- No soporta clonación de voz, entradas de audio ni capacidades multimodales más allá de texto a voz.

## Casos de uso

- Narración de contenido en apps móviles: una aplicación de noticias o de lectura de artículos puede convertir texto a voz sin conexión, evitando costes de API y funcionando en modo avión.
- Asistentes de voz con privacidad: al ejecutarse íntegramente en el dispositivo, el texto del usuario nunca sale del terminal, lo que simplifica el cumplimiento de GDPR y políticas de privacidad de las App Store.
- Accesibilidad: lectores de pantalla personalizados o apps para personas con dificultades lectoras pueden integrar voz natural sin depender de la conectividad.
- Aplicaciones educativas y de aprendizaje de idiomas: pronunciación instantánea de frases y vocabulario con latencia mínima al no haber ida y vuelta a un servidor.
- Prototipado de agentes de voz en iOS: la arquitectura modular en etapas facilita integrar solo el pipeline TTS dentro de un stack mayor (STT + LLM local + TTS) en el dispositivo.
- Audiolibros y podcasts generados bajo demanda: generación de audio a partir de textos largos en segundo plano, con descarga incremental de etapas para optimizar el almacenamiento (0,1 GB en total).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de calidad de voz (MOS), velocidad de síntesis en tiempo real (RTF) ni comparativas con otros modelos TTS.

## Requisitos de hardware

- Tamaño del repositorio: aproximadamente 0,1 GB, por lo que el almacenamiento no es un problema en ningún dispositivo moderno.
- Requisitos declarados: iPhone o iPad con chip Apple A12 Bionic o posterior y iOS 17 o superior, con Neural Engine para la aceleración.
- No requiere GPU de escritorio ni servidores para inferencia: el objetivo es la ejecución en dispositivos móviles.
- Para la conversión original se utilizaron coremltools 9.0 y torch 2.7.0; no se especifican requisitos de hardware para regenerar la conversión.
- Despliegue: integración directa en apps iOS mediante el framework Core ML (no aplica vLLM, llama.cpp, Ollama ni TGI, que son runtimes para LLM en servidor). El flujo previsto es: descarga de etapas, verificación contra manifest.json y compilación en el dispositivo.
- Latencia y throughput: no disponibles; al ejecutarse en Neural Engine se espera latencia baja adecuada para uso interactivo, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Formato/plataforma | Licencia | Notas |
|---|---|---|---|---|
| s2e-host/s2e-kokoro-coreml | 82 M | Core ML, iOS/iPadOS (Neural Engine) | Apache 2.0 | Conversión en siete etapas del Kokoro-82M original, voz af_heart, pensada para on-device |
| hexgrad/Kokoro-82M | 82 M | PyTorch (safetensors), servidor/desktop | Apache 2.0 | Modelo base original; requiere ejecución con PyTorch o runtimes compatibles |
| Piper TTS | 10-30 M aprox. segun voz | ONNX, multiplataforma | MIT | TTS ligero alternativo para on-device, con soporte de muchas voces e idiomas |
| Coqui XTTS-v2 | aprox. 750 M | PyTorch, servidor | Coqui Public Model License (no totalmente comercial) | TTS con clonación de voz, mucho más pesado y con licencia restrictiva |

Kokoro destaca por ofrecer calidad de voz alta con un tamaño mínimo (82 M), lo que lo hace especialmente adecuado para móvil frente a alternativas como XTTS-v2. Piper compite en ligereza y amplitud de idiomas, mientras que Kokoro suele valorarse más por naturalidad en inglés.

## Limitaciones y advertencias

- Voz única incluida en esta conversión (af_heart); el catálogo completo de voces de Kokoro no está presente en este repositorio.
- Soporte de idiomas limitado en el modelo base (principalmente inglés americano y británico); el castellano no está entre los idiomas principales, lo que restringe su uso en apps en español.
- No permite clonación de voz ni control fino de prosodia más allá de lo que ofrece el pipeline original.
- La model card no documenta benchmarks de calidad ni de rendimiento, por lo que conviene validar la naturalidad y la velocidad de síntesis en los dispositivos objetivo antes de producción.
- Al ser una conversión de terceros (s2e-host) a partir del trabajo de laishere/kokoro-coreml, el mantenimiento y la compatibilidad con futuras versiones de coremltools o iOS no están garantizados; el repositorio tiene muy poca tracción (86 descargas, 1 like en el momento de la ficha).
- Licencia Apache 2.0: sin restricciones para uso comercial, aunque se deben conservar los avisos de licencia.
- Riesgo habitual en TTS de generacion de pronunciaciones incorrectas en nombres propios, siglas o texto no normalizado (números, abreviaturas), sin que exista documentación específica sobre este punto.

## Enlaces

- Repositorio del modelo: https://huggingface.co/s2e-host/s2e-kokoro-coreml
- Modelo base original: https://huggingface.co/hexgrad/Kokoro-82M
- Herramienta de conversión utilizada: https://github.com/laishere/kokoro-coreml
