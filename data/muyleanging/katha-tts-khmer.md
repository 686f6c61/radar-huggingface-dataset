# muyleanging/Katha-TTS-Khmer

## Resumen

Kathā (កថា, "habla" en pali) es un modelo de síntesis de voz (text-to-speech) para jemer (khmer) e inglés desarrollado por Ing Muyleang, distribuido bajo el identificador `muyleanging/Katha-TTS-Khmer`. Su propuesta central es el clonado de voz a partir de un clip corto de 3 a 10 segundos sin necesidad de transcripción, junto con un control de estilo independiente del texto (alegre, triste, susurro, locutor de noticias, narrador, etc.), todo ejecutable en CPU convencional mediante ONNX en int8.

El modelo se encuentra en fase de diseño: no está entrenado ni publicado. El repositorio tiene un tamaño de 0.0 GB y no contiene pesos. Todos los datos de tamaño, horas de entrenamiento y número de voces que aparecen en la model card son objetivos planificados (marcados con ≈), no resultados medidos. La arquitectura prevista es un LM semántico de texto de 12 capas más un LM acústico residual de 6 capas, un pequeño transformer de difusión con flow-matching que genera parches de 160 ms y un decodificador AudioVAE que produce audio a 24 kHz.

La relevancia del proyecto radica en su enfoque para un idioma con pocos recursos como el jemer: generación de datos sintéticos de entrenamiento con VoxCPM2 (Apache-2.0, con soporte de jemer), filtrado por ASR y separación estricta del estilo como entrada propia para evitar que las etiquetas de estilo se pronuncien. Existe además un modelo hermano, Kathā Lite (≈80M), con 20 voces fijas y sin clonado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LM semántico de texto (12 capas) + LM acústico residual (6 capas) + transformer de difusión con flow-matching + decodificador AudioVAE |
| Parametros totales | ≈200M (objetivo planificado; no entrenado) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | ONNX int8 |
| Idiomas soportados | jemer (km), inglés (en) |
| Licencia | other (license_name: katha-tbd) |
| Formato de pesos | ONNX (planificado); no hay pesos publicados |

## Arquitectura y entrenamiento

El diseño previsto (figuras 1 y 2 de la model card) parte de un frontend de diccionario jemer que normaliza números, fechas y ortografía y convierte el texto en tokens de clúster. Un clip corto de voz produce un código de hablante de 192 dimensiones mediante un encoder inspirado en ECAPA-TDNN, y el estilo entra como una entrada separada (etiqueta o embedding). Un LM semántico de texto de 12 capas y un LM acústico residual de 6 capas planifican palabras, ritmo y voz; los bloques usan Transformer causal con GQA, RoPE y SwiGLU. Un pequeño transformer de difusión, condicionado con AdaLN sobre el estado del LM, el código de voz, el estilo y el tiempo, dibuja el sonido en parches de 160 ms con 10 pasos de flow-matching por parche, y el decodificador AudioVAE produce audio a 24 kHz en streaming.

El entrenamiento planificado contempla unas 15.000 horas de voz jemer y unos 5.000 hablantes o tipos de voz, con aproximadamente 237 horas de voz jemer real ya disponibles. La mayor parte de voces y horas se generará con VoxCPM2 (Apache-2.0, con soporte de jemer) combinando voces diseñadas con estilos en texto libre; cada clip se valida con el ASR Sota y se descarta si las palabras no coinciden, y los conjuntos de test usan únicamente voz real. Los pares de entrenamiento son un clip plano de la voz X (prompt) más un clip con estilo de la misma voz X (objetivo), de modo que el modelo aprenda "misma voz, nueva emoción". Se contemplan tres etapas de entrenamiento y dos modos de clonado: solo código de voz, o código de voz más transcripción de Sota para una copia más fiel. El audio sintético se etiquetará como tal.

## Capacidades

- Síntesis de voz en jemer e inglés, con salida a 24 kHz y streaming.
- Clonado de voz zero-shot a partir de un clip de 3 a 10 segundos, sin transcripción, en cualquier idioma.
- Control de estilo como entrada independiente del texto: alegre, triste, susurro, calmado, locutor de noticias, narrador, rápido, lento, entre otros.
- Dos modos de clonado: solo código de voz o con transcripción adicional para mayor fidelidad.
- Frontend de diccionario jemer para números, fechas y ortografía.
- Ejecución offline en CPU convencional mediante ONNX int8.
- Marca de agua inaudible y casilla de consentimiento como medidas de seguridad (planificadas).
- No se especifican capacidades de tool calling, agentes, visión ni audio de entrada.

## Casos de uso

- Lectura de noticias y artículos en jemer: el control de estilo "locutor de noticias" y la normalización de números y fechas en el frontend permiten generar boletines con pronunciación consistente sin intervención manual.
- Audiolibros y narración de cuentos: el estilo "narrador" y el control de velocidad permiten adaptar el ritmo a contenido infantil o literario, con voces clonadas de narradores reales a partir de clips cortos.
- Clonado de voz para creadores de contenido: un creador puede generar nuevas locuciones con su propia voz a partir de un clip de 3 a 10 segundos, sin transcripción, para doblar vídeos o producir versiones en inglés.
- Accesibilidad y lectura de pantalla en jemer: al ejecutarse offline en CPU con ONNX int8, puede integrarse en aplicaciones de lectura de pantalla o dispositivos de bajos recursos sin conexión.
- Doblaje y localización de contenido jemer-inglés: la separación del estilo como entrada permite mantener la misma voz entre tomas y ajustar la emoción sin reentrenar.
- Síntesis de datos y prototipado de asistentes de voz: el modelo puede emplearse para generar muestras de voz en jemer para pruebas de pipelines de ASR o de agentes conversacionales, dado el par que forma con el ASR Sota.
- Educación y materiales didácticos: lectura de libros de texto y frases mixtas jemer-inglés (por ejemplo, términos técnicos en inglés dentro de una frase jemer), útil en el modelo hermano Kathā Lite para entornos escolares.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que antes de la publicación se medirán CER en jemer y WER en inglés sobre un conjunto de test de voz real (números, nombres y frases mixtas), además de una prueba de escucha (MOS) con personas reales, pero no se aportan cifras.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el diseño apunta a ejecución en CPU con ONNX int8, sin requisitos de GPU especificados.
- GPU recomendadas: no disponible; no se documenta ningún modelo de GPU (A100, H100, RTX 4090 u otros).
- Compatibilidad con GPU de consumo: no confirmada; el objetivo declarado es CPU convencional offline.
- Opciones de despliegue: ONNX (int8) en CPU; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; el diseño contempla streaming y parches de 160 ms con 10 pasos de flow-matching por parche, pero no hay medidas publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Clonado de voz | Estilo | Licencia | Estado |
|---|---|---|---|---|---|---|
| Kathā (este modelo) | ≈200M (planificado) | jemer, inglés | Sí, clip de 3-10 s sin transcripción | Entrada independiente, texto libre | other (katha-tbd) | En diseno, sin pesos |
| Kathā Lite | ≈80M (planificado) | jemer, inglés (frases mixtas) | No, 20 voces fijas | ≈10 estilos con control de intensidad | no disponible | En diseno, sin pesos |
| VoxCPM2 (OpenBMB) | ≈2B | Incluye jemer | Sí (usado como base de datos sintéticos) | Estilo en texto libre | Apache-2.0 | Publicado |

No se dispone de datos de benchmarks que permitan comparar rendimiento entre estos modelos. La comparativa se limita a parámetros, idiomas, capacidades y licencia según la información de la model card.

## Limitaciones y advertencias

- El modelo no está entrenado ni publicado: el repositorio no contiene pesos (tamaño 0.0 GB) y todas las cifras de tamaño, datos y voces son objetivos planificados, no resultados medidos.
- La licencia `katha-tbd` está pendiente de definición; no se conocen las condiciones de uso comercial.
- Parte de los datos de entrenamiento previstos serán sintéticos, generados con VoxCPM2; aunque se etiquetarán como tales, esto puede introducir sesgos y artefactos de la voz sintética.
- Riesgo de alucinación o pronunciación incorrecta en texto jemer no cubierto por el diccionario del frontend (nombres propios, neologismos, préstamos).
- El clonado de voz implica riesgos de suplantación y uso indebido; el diseño prevé una casilla de consentimiento y una marca de agua inaudible, pero no hay detalles técnicos publicados sobre su robustez.
- No se documentan sesgos conocidos, límites de contexto ni comportamiento en idiomas distintos del jemer y el inglés.
- El soporte de inglés en el modelo principal se describe como secundario ("Khmer (+ English)"); el inglés fluido y las frases mixtas se atribuyen principalmente a Kathā Lite.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/muyleanging/Katha-TTS-Khmer
- Modelo hermano Kathā Lite: https://huggingface.co/muyleanging/Katha-Lite-TTS-Khmer
- VoxCPM2 (OpenBMB, Apache-2.0), arquitectura de referencia y generador de datos sintéticos: https://huggingface.co/openbmb/VoxCPM2
- ECAPA-TDNN (Desplanques et al., 2020), inspiración del encoder de hablante: no disponible (sin enlace en la información proporcionada)
