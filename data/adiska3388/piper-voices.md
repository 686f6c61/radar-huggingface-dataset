# Adiska3388/piper-voices

## Resumen

Adiska3388/piper-voices es un repositorio de pesos en formato ONNX para el sistema de síntesis de voz (text-to-speech, TTS) Piper, alojado en HuggingFace bajo licencia MIT. No se trata de un modelo de lenguaje: es una colección de voces neuronales de síntesis de voz, una por idioma y variante, que se cargan con el motor Piper para convertir texto en audio. La model card es mínima y se limita a declarar la licencia, la lista de idiomas y un enlace al proyecto Piper y a las instrucciones de entrenamiento.

El repositorio ocupa 11,9 GB y cubre 35 idiomas (árabe, catalán, checo, galés, danés, alemán, griego, inglés, español, persa, finés, francés, húngaro, islandés, italiano, georgiano, kazajo, luxemburgués, letón, nepalí, neerlandés, noruego, polaco, portugués, rumano, ruso, eslovaco, esloveno, serbio, sueco, suajili, turco, ucraniano, vietnamita y chino). El tamaño agregado sugiere múltiples voces y calidades por idioma, pero la model card no desglosa qué voces concretas contiene ni sus identificadores.

Su relevancia es la de un recurso de despliegue: Piper está orientado a inferencia local y en hardware modesto, por lo que estos pesos permiten montar síntesis de voz multilingüe sin depender de APIs en la nube. El repositorio registra 0 descargas y 0 "likes" en el momento de la consulta, y su fecha de creación declarada (2026-09-26) es inconsistente con el estado de publicación, por lo que conviene verificar la procedencia frente al repositorio oficial rhasspy/piper-voices.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No especificada en la model card. Según el proyecto Piper, se trata de modelos VITS de TTS extremo a extremo con vocoder neuronal integrado |
| Parametros totales | No disponible (varía por voz y calidad; no se desglosa en la model card) |
| Parametros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | No aplica: es un modelo de síntesis de voz, no un modelo autorregresivo de texto |
| Tipos de cuantizacion | No disponible. Los pesos se distribuyen ya exportados en ONNX; no se documentan variantes cuantizadas |
| Idiomas soportados | 35: ar, ca, cs, cy, da, de, el, en, es, fa, fi, fr, hu, is, it, ka, kk, lb, lv, ne, nl, no, pl, pt, ro, ru, sk, sl, sr, sv, sw, tr, uk, vi, zh |
| Licencia | MIT |
| Formato de pesos | ONNX (etiqueta `onnx` del repositorio) |
| Tamano del repositorio | 11,9 GB |
| Pipeline declarado | No disponible (el campo `pipeline` no está informado) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La model card no describe la arquitectura ni el proceso de entrenamiento. Lo único que indica es que son "voices for Piper text to speech system" y que, para los checkpoints utilizables para entrenar voces propias, hay que acudir al dataset separado `rhasspy/piper-checkpoints`. Por tanto, no hay información publicada en este repositorio sobre número de tokens o horas de audio de entrenamiento, composición del dataset, hablantes, técnicas de alineación, ni sobre si se aplicaron fases de ajuste tipo RLHF o DPO (procedimientos, por otra parte, poco habituales en TTS).

Como contexto externo al repositorio, Piper es un sistema de TTS neuronal local y rápido, pensado para funcionar en hardware de gama baja (el propio proyecto lo optimiza para plataformas tipo Raspberry Pi). Los modelos Piper son redes VITS (variational inference with adversarial learning for end-to-end text-to-speech), que combinan un codificador de texto, un modelo de duración, un flujo normalizador y un decodificador/vocoder en un único grafo exportable a ONNX. Esta afirmación proviene de la documentación del proyecto Piper enlazado, no de la model card de Adiska3388/piper-voices, que no aporta ningún detalle técnico adicional.

## Capacidades

- Síntesis de voz (TTS) a partir de texto: genera audio a partir de una entrada textual en el idioma correspondiente a la voz cargada.
- Cobertura multilingüe amplia: 35 idiomas declarados, incluyendo español, catalán, inglés, alemán, francés, italiano, portugués, ruso, árabe, chino, hindi-adyacentes del sur de Asia (nepalí), entre otros.
- Inferencia local: al distribuirse en ONNX, puede ejecutarse sin conexión y sin servicios externos, mediante el motor Piper.
- Control de velocidad y prosodia básica: Piper expone parámetros de longitud de escala y variación de ruido en tiempo de inferencia (según la documentación del motor, no de este repositorio).
- Integración programática: el motor Piper ofrece CLI, binding de Python y un servidor HTTP, lo que permite invocarlo desde pipelines de generación de audio.
- No dispone de: generación de texto, razonamiento, código, matemáticas, visión, tool calling, function calling, capacidades de agente, modo de razonamiento extendido ni audio de entrada (no es un modelo de reconocimiento de voz).

## Casos de uso

- Lectura por voz de artículos y documentación: convertir texto de un CMS o de un repositorio de documentación en audio mediante el motor Piper, seleccionando la voz del idioma correspondiente entre las 35 disponibles.
- Accesibilidad web: integrar una voz española o catalana en un sitio para ofrecer lectura en voz alta a usuarios con discapacidad visual, con la ventaja de que la inferencia es local y no requiere enviar el contenido a terceros.
- Asistentes de voz domésticos y proyectos de domótica: Piper está pensado para hardware modesto, por lo que estas voces encajan en asistentes autoalojados tipo Home Assistant que necesitan respuestas habladas de baja latencia.
- Sistemas de megafonía y avisos automatizados: generar avisos pregrabados o dinámicos (estaciones, aeropuertos, comercios) en el idioma del usuario sin coste por carácter.
- Audiolibros y podcasts sintéticos: producir narraciones largas por lotes, con elección de voz por capítulo o por personaje si el repositorio incluye voces multi-hablante.
- Doblaje y previsualización de vídeo: generar pistas de voz temporales en varios idiomas para validar guiones antes de contratar doblaje humano.
- Prototipado de interfaces conversacionales: disponer de una capa de salida de voz barata y offline para probar el flujo completo de un asistente antes de decidir el proveedor final.
- Generación de material didáctico: crear ejercicios de pronunciación o dictados en distintos idiomas a partir de listas de texto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card de Adiska3388/piper-voices no incluye métricas objetivas (MOS, WER, RTF, latencia) ni comparaciones con otros sistemas de síntesis, y el repositorio no aporta muestras de audio ni tablas de evaluación.

## Requisitos de hardware

- VRAM para inferencia: no especificada en la información disponible. Al ser modelos VITS exportados a ONNX con vocoder integrado y decenas de megabytes por voz, la inferencia en GPU consume típicamente menos de 1 GB de VRAM; la cifra exacta no está documentada.
- CPU: el proyecto Piper está optimizado para ejecución en CPU y para hardware de gama baja. No se dispone de cifras de latencia verificadas para este repositorio concreto.
- GPU recomendadas: no disponibles. Para TTS de este tamaño, cualquier GPU consumer moderna es sobredimensionada; su uso tiene sentido solo por agregación de muchas peticiones concurrentes.
- Cabe en GPU consumer: no hay datos específicos en la información proporcionada, pero por el tamaño típico de los modelos Piper la respuesta esperada es sí, en cualquier GPU con al menos 1-2 GB de memoria libre.
- Opciones de despliegue: motor Piper (CLI, binding de Python, servidor HTTP), ejecución de los ficheros ONNX mediante ONNX Runtime. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que son herramientas para modelos de lenguaje y no aplican a este tipo de pesos.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

La comparativa siguiente se apoya en conocimiento general de la categoría y no en datos publicados por este repositorio; los datos de los modelos alternativos deben verificarse en sus fuentes originales.

| Sistema | Tipo | Idiomas | Licencia | Despliegue local | Notas |
|---|---|---|---|---|---|
| Adiska3388/piper-voices (este repo) | TTS VITS en ONNX | 35 declarados | MIT | Sí | 11,9 GB, 0 descargas, 0 likes; sin métricas publicadas |
| rhasspy/piper-voices (origen del ecosistema) | TTS VITS en ONNX | Amplio (decenas) | MIT | Sí | Repositorio de referencia de Piper; conviene usarlo si se busca trazabilidad |
| Coqui XTTS-v2 | TTS con clonación de voz | 16 idiomas | CPML (uso no comercial) | Sí | Ofrece clonación de voz zero-shot; licencia restrictiva para producción comercial |
| Kokoro-82M | TTS compacto | Varios idiomas | Apache-2.0 | Sí | Modelo de 82 M de parámetros; licencia permisiva, cobertura de idiomas menor |
| MMS-TTS (Meta) | TTS | Más de 1000 idiomas | CC-BY-NC-4.0 | Sí | Cobertura de idiomas muy superior, pero licencia no comercial |

## Limitaciones y advertencias

- Naturaleza del artefacto: no es un modelo de lenguaje. Cualquier evaluación de razonamiento, código o tool calling no aplica y dará resultados vacíos.
- Procedencia no verificada: el repositorio es de un usuario tercero (Adiska3388) y su nombre replica el del repositorio oficial de voces de Piper. Antes de usarlo en producción conviene comparar hashes con rhasspy/piper-voices.
- Ausencia total de documentación: no hay descripción de voces, identificadores, número de hablantes, calidades ni instrucciones de uso en la model card.
- Sin métricas de calidad: no se publican MOS, WER ni comparaciones; no se puede afirmar la calidad subjetiva de las voces incluidas.
- Fecha de creación inconsistente: el campo `createdAt` indica 2026-09-26, posterior a la fecha de consulta, lo que sugiere metadatos poco fiables.
- Licencia: MIT cubre el repositorio según su declaración, pero no hay información sobre la licencia de los datasets de audio originales ni sobre consentimiento de los hablantes cuyas voces se hayan podido clonar. Esto es un riesgo relevante si se usa comercialmente.
- Sesgos y cobertura: la lista de 35 idiomas no indica variedades dialectales, acentos ni equilibrio de género de las voces. El suajili aparece como único idioma del África subsahariana, lo que refleja una cobertura desigual.
- Alucinación en TTS: estos modelos pueden producir artefactos de audio, pronunciaciones incorrectas o ruido en entradas con caracteres fuera del inventario fonético del idioma, números, siglas o texto mixto.
- Longitud de entrada: al no ser un modelo de contexto largo, las entradas muy largas deben fragmentarse en frases; no hay documentación sobre el límite práctico.
- Idioma de la voz frente al idioma del texto: usar una voz de un idioma para texto de otro idioma degrada gravemente la pronunciación.
- Sin soporte de clonación: la model card no indica que se pueda clonar una voz nueva sin reentrenar, para lo cual remite al dataset de checkpoints.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Adiska3388/piper-voices
- Proyecto Piper (GitHub): https://github.com/rhasspy/piper
- Guía de entrenamiento de voces de Piper: https://github.com/rhasspy/piper/blob/master/TRAINING.md
- Checkpoints para entrenar voces propias: https://huggingface.co/datasets/rhasspy/piper-checkpoints/tree/main
- Repositorio de referencia de voces Piper (no enlazado en la model card, recomendado para verificar procedencia): https://huggingface.co/rhasspy/piper-voices
