# buddysburrow/buddy-voice

## Resumen

Buddy Voice (Jasper) es un paquete de síntesis de voz (text-to-speech) en formato ONNX derivado de Kitten TTS mini 0.8, el modelo de KittenML. Lo publica el estudio Buddys Burrow como componente de voz de su aplicación iOS "Buddy: Your AI Friend", donde la inferencia se ejecuta íntegramente en el dispositivo mediante sherpa-onnx. No se trata de un modelo entrenado desde cero: el autor declara explícitamente que los ficheros son una copia sin modificaciones de la exportación realizada por csukuangfj (csukuangfj2/kitten-mini-en-v0_8) a partir del modelo original.

El paquete incluye el grafo ONNX (`model.onnx`, 78 MB), el banco de voces de Kitten (`voices.bin`), la lista de tokens y un léxico de pronunciación para inglés estadounidense. La voz concreta que utiliza la aplicación es Jasper, una de las voces preentrenadas de Kitten TTS. El repositorio completo ocupa aproximadamente 0,1 GB.

Su relevancia es práctica más que arquitectónica: demuestra un patrón de despliegue de TTS neuronal en móvil sin conexión, con licencia Apache 2.0 heredada del modelo base y compatible con el ecosistema sherpa-onnx. Es un artefacto de integración reproducible, no una contribución de investigación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Kitten TTS mini 0.8; exportación ONNX para sherpa-onnx) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (se distribuye un único `model.onnx` de 78 MB; no se documentan variantes cuantizadas) |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`model.onnx`), más `voices.bin`, `tokens.txt` y `lexicon-en-us.txt` |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base Kitten TTS mini 0.8 (tipo de red, capas, mecanismo de atención o decodificador vocacional). Lo que sí se documenta es el formato de distribución: un grafo ONNX exportado para sherpa-onnx, acompañado de un fichero de voces (`voices.bin`) que contiene las voces preentrenadas de Kitten y de un léxico de pronunciación en inglés estadounidense procedente de la release `tts-models` de sherpa-onnx. El tamaño del grafo es de 78 MB.

No se proporcionan datos sobre el corpus de entrenamiento, el número de tokens, la composición del dataset ni si hubo ajuste por RLHF o DPO. Tampoco se documentan innovaciones técnicas específicas (decodificación especulativa, atención lineal, etc.). El autor indica que los ficheros se copian sin cambios desde la exportación de csukuangfj, por lo que cualquier mérito arquitectónico corresponde a KittenML y cualquier detalle de conversión a sherpa-onnx.

## Capacidades

- Síntesis de voz a partir de texto en inglés, con salida de audio.
- Selección de voz mediante el banco `voices.bin`; la aplicación Buddy usa la voz Jasper.
- Pronunciación guiada por léxico (`lexicon-en-us.txt`) para inglés estadounidense.
- Inferencia local en dispositivo mediante sherpa-onnx, sin dependencia de servicios en la nube.
- Integración en aplicaciones móviles (el caso documentado es una app iOS).
- No se documenta soporte de tool calling, agentes, razonamiento multi-paso, visión, audio de entrada ni modo de pensamiento.
- No se documenta multilingüismo: el único idioma declarado es inglés.

## Casos de uso

- Asistente conversacional en iOS sin conexión: la aplicación Buddy integra el paquete con sherpa-onnx para que el dispositivo pronuncie las respuestas del asistente sin enviar texto a servidores externos, lo que reduce latencia y evita exponer conversaciones.
- Lectura de contenido en aplicaciones de accesibilidad: el grafo ONNX de 78 MB permite empaquetar la síntesis dentro de la app y leer artículos, notificaciones o mensajes en voz alta sin descargar modelos adicionales.
- Avisos y navegación por voz en tiempo real: al ejecutarse localmente, es adecuado para indicaciones que deben sonar de inmediato y en entornos con conectividad intermitente.
- Prototipado rápido de interfaces de voz: un desarrollador puede evaluar la calidad de la voz Jasper en sherpa-onnx antes de comprometerse con un modelo de mayor tamaño o con un servicio gestionado.
- Aprendizaje de idiomas (inglés): el léxico estadounidense incluido facilita una pronunciación consistente para ejercicios de repetición y dictado.
- Juguetes y dispositivos embebidos: el tamaño reducido del artefacto y el formato ONNX permiten desplegarlo en hardware con recursos limitados que ejecute sherpa-onnx.
- Generación de audio para pruebas automatizadas: útil en pipelines de CI para producir locuciones de prueba sin coste de API.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible. El grafo ONNX ocupa 78 MB, por lo que la huella en memoria es reducida, pero no se documentan cifras de VRAM ni de RAM.
- GPU recomendadas: no disponibles. El caso de uso documentado es inferencia en CPU de teléfono mediante sherpa-onnx.
- Compatibilidad con GPU de consumo: no documentada. El diseño apunta a ejecución en dispositivo móvil, no a aceleración en RTX 4090, A100 o H100.
- Opciones de despliegue: sherpa-onnx (documentado). No se confirma compatibilidad con vLLM, llama.cpp, Ollama ni TGI, que además no son runtimes de TTS.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Buddy Voice (Jasper) | no disponible | no disponible | en | Apache 2.0 | ONNX (sherpa-onnx) | Copia sin cambios de la exportación de Kitten TTS mini 0.8 |
| KittenML/kitten-tts-mini-0.8 | no disponible | no disponible | en | Apache 2.0 | no disponible en la informacion | Modelo base original |
| csukuangfj2/kitten-mini-en-v0_8 | no disponible | no disponible | en | no disponible en la informacion | ONNX (sherpa-onnx) | Exportación de referencia de la que procede este paquete |

No se dispone de datos de benchmarks ni de especificaciones detalladas de los modelos comparables en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa de rendimiento.

## Limitaciones y advertencias

- Solo admite inglés; no hay soporte multilingüe declarado.
- No es un modelo original: es una copia sin modificaciones de una exportación de terceros, por lo que las mejoras o correcciones deben buscarse en el modelo base o en la exportación de origen.
- No se documentan sesgos, tasas de alucinación ni comportamiento ante texto ambiguo; en TTS el riesgo principal es una pronunciación incorrecta de nombres propios y términos técnicos no cubiertos por el léxico.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base y de sherpa-onnx, ambos también Apache 2.0 según la model card.
- El repositorio no tiene descargas ni likes y se creó y actualizó el mismo día, sin historial de mantenimiento; no hay garantía de soporte.
- No se documentan límites de longitud de texto por petición ni estrategias de troceado.
- La calidad de la voz depende de la voz Jasper incluida en `voices.bin`; no se especifican métricas de naturalidad (MOS) ni comparativas subjetivas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/buddysburrow/buddy-voice
- Modelo base: https://huggingface.co/KittenML/kitten-tts-mini-0.8
- Exportación de origen en sherpa-onnx: https://huggingface.co/csukuangfj2/kitten-mini-en-v0_8
- Repositorio sherpa-onnx: https://github.com/k2-fsa/sherpa-onnx
