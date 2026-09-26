# mgcrea/pupitre-models

## Resumen

pupitre-models es un repositorio de conversiones a Core ML publicado por el usuario mgcrea para Pupitre, una aplicación de macOS pensada para practicar piano con canciones propias. No contiene un modelo único, sino una colección de carpetas en las que cada una aloja un modelo con su propio README: qué es, de dónde vienen los pesos, qué licencia y crédito requieren, el comando exacto de conversión y cómo se verificó esa conversión contra el original. En el momento de redactar esta ficha, la única carpeta documentada es `htdemucs-6s-fp32`, que empaqueta el modelo Hybrid Transformer Demucs de Meta en precisión FP32 (355 MB) y separa una mezcla musical en seis pistas: voces, batería, bajo, otros, guitarra y piano.

El interés de la publicación es de despliegue más que de investigación: traslada un modelo de separación de fuentes de audio (source separation) del ecosistema PyTorch al formato Core ML, lo que permite ejecutarlo en local sobre hardware de Apple mediante la Neural Engine, la GPU o la CPU, sin depender de servidores con GPU ni de conexión a internet. Eso encaja con el caso de uso de la aplicación: procesar la canción del usuario en su propio Mac para generar pistas de acompañamiento sobre las que practicar.

Se trata de un repositorio con 0 descargas y 0 me gusta, sin pipeline declarado y con un tamaño de 0,4 GB, por lo que conviene tratarlo como un artefacto de distribución ligado a una aplicación concreta y no como un modelo de referencia validado por la comunidad. No se publican datos de entrenamiento, recuento de parámetros ni resultados de benchmarks. La aplicación descarga los ficheros fijados a un commit y comprueba el tamaño y el SHA-256 de cada uno.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hybrid Transformer Demucs (htdemucs) de Meta: red de separación de fuentes de audio con componentes convolucionales y atención transformer, convertida a Core ML |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica: no es un modelo de lenguaje; procesa segmentos de audio de duración no especificada en la model card |
| Tipos de cuantizacion | FP32 únicamente en la carpeta documentada (`htdemucs-6s-fp32`); no se documentan variantes int8, int4 ni fp16 |
| Idiomas soportados | no disponible; no es un modelo de texto y la ficha no declara idiomas |
| Licencia | MIT (declarada en el repositorio) |
| Formato de pesos | Core ML (library_name: coreml); no se distribuyen safetensors ni GGUF |
| Pistas de salida (stems) | 6: vocals, drums, bass, other, guitar, piano |
| Tamaño del modelo | 355 MB (FP32) |
| Tamaño del repositorio | 0,4 GB |
| Tarea | separación de fuentes musicales (audio source separation) |
| Autor | mgcrea |
| Fecha de creación y actualización en HuggingFace | 2026-09-26 (ambas, con cinco segundos de diferencia) |
| Pipeline declarado | no disponible |

## Arquitectura y entrenamiento

La model card identifica el modelo como el Hybrid Transformer Demucs (htdemucs) de Meta, en su variante de 6 pistas y precisión FP32. Se trata de un modelo de separación de fuentes que opera sobre la señal de audio y devuelve varias pistas independientes, una por instrumento o grupo de instrumentos. La información proporcionada no detalla la topología interna, el número de capas, el recuento de parámetros ni la composición del conjunto de entrenamiento, por lo que esos datos quedan como no disponibles.

Lo que sí documenta el repositorio es el proceso de conversión: cada carpeta incluye el comando exacto empleado para pasar los pesos originales a Core ML y la forma en que la conversión se verificó contra el modelo de origen. La licencia del repositorio es MIT, y la model card indica que cada carpeta recoge, además, la licencia y el crédito exigidos por los pesos originales. No se menciona en la información disponible si hubo ajuste fino, destilación ni técnicas adicionales como decodificación especulativa, que en cualquier caso no aplican a un modelo de separación de audio.

## Capacidades

- Separación de una mezcla musical en seis pistas: vocales, batería, bajo, otros, guitarra y piano, en una sola pasada.
- Salida en formato de onda de audio, apta para reconstruir la mezcla, silenciar pistas o remezclar.
- Inferencia en local sobre plataformas Apple gracias al formato Core ML (Neural Engine, GPU o CPU).
- Integración en aplicaciones macOS mediante Core ML, sin necesidad de backend ni de conexión a internet.
- Verificación de integridad de los artefactos descargados mediante tamaño y SHA-256, según describe la model card.
- No dispone de generación de texto, razonamiento, código ni matemáticas.
- No soporta tool calling, function calling ni flujos de agentes.
- No tiene capacidades multilingües en el sentido habitual: no procesa lenguaje, solo audio.
- No se documentan capacidades de visión, audio-texto, transcripción ni reconocimiento de voz.

## Casos de uso

- Práctica de piano en la aplicación Pupitre: el modelo separa la pista de piano (y el resto de instrumentos) de la canción elegida por el usuario para poder tocar sobre el acompañamiento o escuchar la parte aislada, todo ello en el propio Mac.
- Karaoke y eliminación de voces: al disponer de una pista de vocales independiente, una aplicación puede silenciarla y generar una versión instrumental sin subir el audio a ningún servidor.
- Remezcla y producción musical: aislar batería y bajo para reutilizarlos como base rítmica, cambiar niveles entre pistas o construir versiones alternativas de una canción en un DAW.
- Educación y transcripción musical: obtener pistas limpias por instrumento facilita el análisis armónico, la transcripción a partitura y la creación de material didáctico.
- Práctica instrumental general: guitarra, bajo u otros instrumentos pueden usarse como pista de acompañamiento en aplicaciones de aprendizaje, aislando la parte correspondiente.
- Postproducción de audio: separar voces y música para doblaje, subtitulado o sustitución de diálogos en materiales donde la mezcla no está disponible por separado.
- Sesiones de DJ y mashups: extraer a capela y bases instrumentales en tiempo de preparación para mezclas y ediciones.
- Investigación en recuperación de información musical (MIR): generación de conjuntos de pistas separadas para experimentos de análisis rítmico, armónico o de instrumentación.
- Aplicaciones iOS y macOS sin coste de servidor: el modelo se ejecuta en el dispositivo, lo que elimina el gasto de GPU en la nube y evita enviar audio del usuario a terceros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas como SDR, SIR o SAR sobre MUSDB18 u otros conjuntos, ni comparaciones numéricas con alternativas.

## Requisitos de hardware

- Peso del modelo: 355 MB en FP32, que se traduce en un consumo de memoria del orden de esa cifra más los buffers de inferencia (no se detalla el pico exacto).
- Plataforma objetivo: Core ML, lo que cubre equipos Mac con Apple Silicon e Intel, además de iPhone y iPad compatibles, aprovechando Neural Engine, GPU o CPU según disponibilidad.
- No se distribuyen pesos en formatos para GPU NVIDIA (safetensors, GGUF), de modo que su uso en CUDA requeriría reconvertir desde el modelo original.
- Al tratarse de 355 MB, cabe con holgura en cualquier equipo de gama de consumo con memoria unificada de 8 GB o superior.
- Opciones de despliegue: Core ML y coremltools en el ecosistema Apple; vLLM, llama.cpp, Ollama y TGI no aplican porque no es un modelo de lenguaje.
- Latencia y throughput: no disponible. No se publican tiempos de procesamiento por minuto de audio ni comportamiento en tiempo real.

## Comparativa con modelos similares

Datos de los proyectos alternativos tomados de su documentación pública, no de la información proporcionada en esta ficha.

| Modelo | Enfoque | Pistas | Formato | Licencia | Plataforma |
|---|---|---|---|---|---|
| pupitre-models (htdemucs-6s-fp32) | Hybrid Transformer Demucs convertido | 6 | Core ML | MIT (repositorio) | Apple (Core ML) |
| Demucs v4 original (Meta) | Hybrid Transformer Demucs en PyTorch | 6 en la variante htdemucs_6s | PyTorch | MIT (repositorio original), verificar pesos | Multiplataforma con PyTorch |
| Spleeter (Deezer) | Redes U-Net en TensorFlow | 2, 4 o 5 según variante | TensorFlow | MIT | Multiplataforma con TensorFlow |
| Open-Unmix | Redes LSTM en PyTorch | 4 | PyTorch | MIT | Multiplataforma con PyTorch |

La ventaja diferencial de esta publicación no es la calidad de separación, sino el empaquetado: es la única de las opciones listadas que se distribuye lista para ejecutarse en Core ML, con verificación de integridad por SHA-256. No hay datos de rendimiento comparado en la información disponible.

## Limitaciones y advertencias

- No se publican métricas de calidad de separación, por lo que no es posible estimar el nivel de artefactos, sangrado entre pistas o distorsión sin evaluarlo por cuenta propia.
- Los modelos de separación de fuentes musicales suelen degradarse en material que se aleja del dominio de entrenamiento (voz hablada, grabaciones de campo, mezclas muy comprimidas), extremo que no se documenta aquí.
- La licencia MIT corresponde al repositorio de conversión; la model card indica que los pesos originales tienen su propia licencia y crédito, que conviene revisar antes de un uso comercial.
- El repositorio acumula 0 descargas y 0 me gusta y no declara pipeline, por lo que carece de validación externa y de señales de mantenimiento continuado.
- Las fechas de creación y actualización registradas son idénticas salvo cinco segundos y corresponden a una fecha futura respecto a la publicación habitual de modelos, lo que sugiere que pueden no ser fiables.
- No se declaran idiomas ni un pipeline de HuggingFace, de modo que no se puede integrar mediante las abstracciones estándar de la librería transformers.
- El uso está atado al ecosistema Core ML: fuera de Apple hay que reconvertir el modelo desde el original, lo que anula la ventaja de este artefacto.
- Al ser un modelo de audio, no ofrece ninguna de las garantías habituales de los modelos de lenguaje (control de instrucciones, filtros de contenido, trazabilidad de respuestas).
- El repositorio completo ocupa 0,4 GB; conviene verificar el SHA-256 de cada fichero descargado, tal como hace la aplicación de referencia.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/mgcrea/pupitre-models
- Los resultados de la búsqueda web realizada no contienen enlaces relevantes sobre este modelo: todas las entradas recuperadas corresponden a servicios de juego en la nube (Boosteroid, GeForce NOW) y a debates de foros ajenos al proyecto.
- La model card no enlaza el repositorio original de Demucs ni el paper asociado; no se dispone de URL verificada para esos recursos en la información proporcionada.
