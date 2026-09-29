# RabiatS/moonshine-tiny-web

## Resumen

`RabiatS/moonshine-tiny-web` es una copia reducida y fijada (*pinned*) de los ficheros ONNX del modelo de reconocimiento automático de voz Moonshine Tiny, publicada por el usuario RabiatS para que una página web pueda cargarla directamente en el navegador con transformers.js. No es un modelo nuevo ni un ajuste fino: la propia model card indica que los pesos son los originales de `UsefulSensors/moonshine-tiny`, sin modificar, y que únicamente se han recortado los ficheros hasta quedarse con el subconjunto que carga la demo `rabiatsadiq.com/lab/moonshine`.

Moonshine Tiny es un modelo de ASR encoder-decoder desarrollado por Moonshine AI (antes Useful Sensors), diseñado específicamente para transcripción en vivo y comandos de voz. Su principal diferencia frente a Whisper es que procesa el audio con su longitud real en lugar de rellenarlo siempre a ventanas de 30 segundos, lo que reduce el coste computacional y la latencia en clips cortos. El repositorio ocupa 0,1 GB, tiene licencia MIT y está pensado exclusivamente para inferencia en cliente.

Su relevancia en este repositorio es práctica: actúa como espejo inmutable de un export ONNX para garantizar que una aplicación web no se rompa si el repositorio de origen cambia o desaparece. Para uso en producción conviene acudir al repositorio canónico `onnx-community/moonshine-tiny-ONNX` o a los pesos originales.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder para ASR (modelo original Moonshine Tiny); en este repositorio, export ONNX |
| Parámetros totales | No disponible en la información proporcionada (el modelo original Moonshine Tiny se describe habitualmente en torno a 27 M de parámetros; la model card de este repositorio no lo especifica) |
| Parámetros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | No disponible. Al ser un modelo de audio, la limitación relevante es la duración de audio de entrada, que no se documenta en este repositorio; el modelo original no utiliza relleno fijo a 30 s |
| Tipos de cuantización | El repositorio está etiquetado como `base_model:quantized`, pero no se detalla la lista exacta de variantes (fp32/fp16/int8) incluidas. Tamaño del repo: 0,1 GB |
| Idiomas soportados | No disponible en la metadata del repositorio. El modelo original Moonshine Tiny está documentado como ASR en inglés |
| Licencia | MIT |
| Formato de pesos | ONNX (ficheros recortados del export de `onnx-community/moonshine-tiny-ONNX`, commit `a6da1241cd305dcd64eab1edbd615f2bb9aabb95`) |
| Librería declarada | transformers.js |
| Tarea (*pipeline*) | automatic-speech-recognition |
| Modelo base | `UsefulSensors/moonshine-tiny` |
| Tamaño del repositorio | 0,1 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Moonshine Tiny: un transformer encoder-decoder para reconocimiento de voz, conceptualmente similar a Whisper pero con una diferencia clave en el preprocesado. En lugar de convertir el audio a espectrograma log-Mel y rellenarlo a una ventana fija de 30 segundos, Moonshine alimenta el encoder con la forma de onda a su longitud real (con una etapa convolucional inicial) y reduce la longitud de secuencia que procesa el encoder. Esto hace que el coste de cómputo y la latencia escalen de forma aproximadamente proporcional a la duración del audio, lo que resulta ventajoso en clips cortos, dictado y comandos de voz. El decodificador es autorregresivo y genera tokens de texto sobre un vocabulario BPE.

Este repositorio concreto no aporta información sobre el entrenamiento: no documenta número de tokens, composición del dataset, idioma de entrenamiento ni si hubo etapas de RLHF o DPO. No se ha realizado ningún entrenamiento, ajuste fino ni cuantización adicional aquí; según la model card, los pesos son idénticos a los del modelo original y solo se ha recortado el conjunto de ficheros ONNX. Cualquier detalle sobre datos de entrenamiento debe consultarse en la documentación del proyecto Moonshine original, no en esta ficha.

## Capacidades

- Reconocimiento automático de voz (*speech-to-text*) sobre audio en inglés del modelo original, con salida de texto transcrito.
- Inferencia en el navegador mediante transformers.js y ONNX Runtime Web, sin necesidad de servidor ni GPU dedicada.
- Ejecución en cliente con posible aceleración por WebGPU y respaldo en WebAssembly sobre CPU.
- Procesamiento de audio de entrada con longitud variable, sin el relleno fijo a 30 s típico de Whisper.
- Adecuado para flujos de baja latencia en clips cortos (dictado, comandos), según el diseño del modelo original.
- Capacidades multilingües: no disponibles; el modelo original está orientado a inglés.
- *Tool calling* / *function calling*: no aplica, es un modelo de ASR, no un modelo de lenguaje conversacional.
- Soporte de agentes o razonamiento multi-paso: no aplica.
- Capacidades de visión o audio multimodal: no aplica (solo entrada de audio, salida de texto).
- Modo *thinking*: no disponible.

## Casos de uso

- Transcripción con privacidad en aplicaciones web: el modelo se ejecuta íntegramente en el navegador del usuario, de modo que el audio nunca sale del dispositivo. Es adecuado para herramientas internas o sanitarias donde enviar audio a un servicio en la nube no es viable.
- Dictado por voz en editores y formularios web: al ser un modelo Tiny exportado a ONNX, puede integrarse en una caja de texto para convertir voz en texto en tiempo real usando WebGPU, con WebAssembly como respaldo en equipos sin aceleración.
- Comandos de voz en interfaces de accesibilidad: transcripciones cortas y frecuentes (órdenes, nombres de campos, navegación) donde la latencia del modelo importa más que la precisión en audio largo.
- Subtitulado en vivo de baja latencia: para videollamadas, clases o directos en el navegador, segmentando el audio en fragmentos cortos y transcribiéndolos localmente; el diseño sin relleno a 30 s favorece este patrón.
- Aplicaciones web progresivas (PWA) sin conexión: al ocupar 0,1 GB y no requerir backend, el modelo puede cachearse y usarse para transcribir notas de voz en escenarios con conectividad intermitente.
- Prototipado y docencia: sirve como punto de partida ligero para experimentar con pipelines de ASR en transformers.js antes de invertir en modelos mayores o infraestructura GPU.
- Preprocesado de audio a texto en CPU: para lotes pequeños de grabaciones donde no se dispone de GPU, la variante Tiny permite transcripción local con un coste de recursos muy bajo.
- Indexación y búsqueda sobre audio en el cliente: transcripción de podcasts o apuntes de clase para generar índices de texto buscables sin subir el contenido a terceros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card de `RabiatS/moonshine-tiny-web` no incluye métricas de WER, latencia ni comparativas numéricas, y este repositorio es una copia de ficheros ONNX, no una publicación de resultados experimentales.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita. Con un modelo del orden de decenas de millones de parámetros y un repositorio de 0,1 GB, la huella de memoria es muy reducida; una estimación razonable estaría por debajo de 1 GB en cualquiera de las variantes incluidas.
- GPU recomendadas: cualquier GPU moderna es suficiente; el caso de uso principal es ejecución en cliente con WebGPU (Chrome/Edge) o incluso en CPU. No se requiere A100, H100 ni RTX 4090.
- GPU de consumo: sí, cabe en cualquier GPU de consumo e integrada; también funciona sin GPU mediante WebAssembly.
- Opciones de despliegue: transformers.js en navegador, ONNX Runtime Web, ONNX Runtime en servidor o *edge*, y cualquier *runtime* compatible con ONNX. El proyecto original Moonshine ofrece además implementaciones nativas en C++ y un paquete de Python, aunque no se documentan en esta ficha.
- Latencia y throughput: no disponibles. La documentación del proyecto original atribuye a Moonshine una latencia inferior a la de Whisper en clips cortos, pero no se proporcionan cifras concretas en la información disponible.
- Almacenamiento: 0,1 GB de pesos en disco, más el espacio de caché del navegador si se usa como PWA.

## Comparativa con modelos similares

| Modelo | Parámetros | Idioma | Audio de entrada | Licencia | Formatos / disponibilidad |
|---|---|---|---|---|---|
| RabiatS/moonshine-tiny-web (Moonshine Tiny) | No disponible en el repositorio; ~27 M en el modelo original | Inglés (modelo original) | Longitud variable, sin relleno a 30 s | MIT | ONNX para transformers.js / ONNX Runtime Web |
| Whisper Tiny | ~39 M | Multilingüe (99 idiomas) | Relleno fijo a ventanas de 30 s | MIT | PyTorch, ONNX, transformers.js, whisper.cpp |
| Whisper Base | ~74 M | Multilingüe (99 idiomas) | Relleno fijo a ventanas de 30 s | MIT | PyTorch, ONNX, transformers.js, whisper.cpp |
| Distil-Whisper (distil-small.en) | ~166 M | Inglés | Relleno fijo a ventanas de 30 s | MIT | PyTorch, ONNX, transformers.js |

No se dispone de datos de WER ni de latencia comparada en la información proporcionada, por lo que la comparativa se limita a parámetros, idioma, licencia y disponibilidad. Como referencia orientativa: Moonshine Tiny es más pequeño y ligero que Whisper Tiny, pero solo cubre inglés; Whisper ofrece cobertura multilingüe a cambio de más parámetros y de un preprocesado con relleno fijo.

## Limitaciones y advertencias

- Solo inglés: el modelo original Moonshine Tiny está orientado a inglés; no debe esperarse transcripción fiable en castellano ni en otros idiomas con este modelo.
- No es un modelo nuevo: este repositorio es una copia recortada para una demo concreta. Para producción conviene usar `onnx-community/moonshine-tiny-ONNX` o los pesos originales `UsefulSensors/moonshine-tiny`.
- Riesgo de alucinación: como cualquier modelo de ASR, puede generar texto plausible en tramos con silencio, ruido, solapamiento de voces o audio fuera de dominio. Es especialmente relevante al integrarlo en flujos de subtitulado en vivo.
- Sin gestión de hablantes ni marcas de tiempo documentadas: no hay diarización ni alineación temporal documentada en la información disponible, lo que limita su uso para transcripción de reuniones con varios interlocutores.
- Duración de audio no documentada: no se especifica en este repositorio el límite máximo de audio por inferencia. Conviene validarlo empíricamente antes de desplegarlo con fragmentos largos.
- Vocabulario y dominio restringidos: los modelos Tiny de ASR suelen degradarse con terminología técnica, nombres propios, siglas o acentos marcados; se recomienda evaluar con datos propios antes de producción.
- Sesgos: no se documenta ninguna evaluación de sesgos por acento, género, edad o variedad dialectal. Es razonable asumir un peor rendimiento en acentos poco representados en los datos de entrenamiento originales.
- Licencia: MIT, permisiva para uso comercial. Debe conservarse el aviso de copyright y la atribución correspondiente al proyecto Moonshine y a los autores del export ONNX.
- Repositorio de terceros con 0 descargas y 0 likes: sin garantía de mantenimiento, versionado ni actualizaciones por parte del autor. La ventaja de tener la copia fijada es la reproducibilidad; el inconveniente es que no recibirá correcciones.
- Rendimiento sin verificar: no hay benchmarks publicados en este repositorio ni métricas de latencia para el escenario real de navegador.

## Enlaces

- [RabiatS/moonshine-tiny-web (HuggingFace)](https://huggingface.co/RabiatS/moonshine-tiny-web)
- [onnx-community/moonshine-tiny-ONNX (repositorio de origen de los ficheros)](https://huggingface.co/onnx-community/moonshine-tiny-ONNX)
- [UsefulSensors/moonshine-tiny (pesos originales)](https://huggingface.co/UsefulSensors/moonshine-tiny)
- [Repositorio GitHub del proyecto Moonshine](https://github.com/moonshine-ai/moonshine)
- [Demo en el navegador: rabiatsadiq.com/lab/moonshine](https://www.rabiatsadiq.com/lab/moonshine/)
- Paper técnico del modelo original: no disponible en la información proporcionada; se referencia desde el repositorio de GitHub del proyecto.
