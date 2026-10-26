# Prosperitytech/lighthouse-keeper

## Resumen

Lighthouse Keeper 0.1 (identificador `Prosperitytech/lighthouse-keeper`) es un clasificador de texto diseñado para detectar riesgos contra menores en mensajes cortos. Lo desarrolla Prosperity Tech dentro de Lighthouse, su iniciativa de seguridad digital infantil, y está pensado específicamente para niños y adolescentes nigerianos: entiende inglés nigeriano, pidgin, yoruba, hausa e igbo, incluyendo code-switching, jerga juvenil, ausencia de marcas tonales y errores tipográficos.

El modelo no genera texto: asigna a cada mensaje una distribución de probabilidad sobre cuatro niveles (ninguno, bajo, revisar, alto) para cada una de 13 categorías de riesgo (acoso, trastornos alimentarios, apuestas, contenido gráfico, grooming, discurso de odio, amenazas a la privacidad, estafas, autolesión, sextorsión, contenido sexual, consumo de sustancias y violencia). Su interés práctico está en el tamaño y el despliegue: 8,3 millones de parámetros en un encoder de 4 capas y 256 de anchura, exportado a ONNX e int8 en un fichero de 8,5 MB, lo que permite inferencia por debajo de 1 ms en CPU de portátil y ejecución totalmente offline en un Android económico, sin que el mensaje salga del dispositivo.

La relevancia ahora es doble: por un lado cubre un hueco de idiomas y contexto cultural habitualmente ausente en los modelos de moderación comercial; por otro, su método de construcción —destilación desde `gpt-oss-safeguard-20b` con datos sintéticos y anotaciones humanas de AfriHate— documenta un procedimiento replicable para crear clasificadores de seguridad pequeños en lenguas de bajos recursos. Es una versión 0.1, publicada el 26 de octubre de 2026, con 0 descargas y 1 like en el momento de la consulta.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder transformer de 4 capas, anchura 256, vocabulario SentencePiece propio de 20 000 piezas |
| Parametros totales | 8,3 millones |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 128 word pieces como máximo; los mensajes más largos se truncan |
| Tipos de cuantizacion | int8 (`keeper.onnx`, 8,5 MB, versión distribuida) y fp32 (`keeper-fp32.onnx`, 33 MB) |
| Idiomas soportados | Inglés (`en`), pidgin nigeriano (`pcm`), yoruba (`yo`), hausa (`ha`), igbo (`ig`) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`keeper.onnx`, `keeper-fp32.onnx`) más tokenizador SentencePiece (`keeper.spm`, 0,6 MB) |

Metadatos adicionales: pipeline `text-classification`, librería `onnx`, tamaño del repositorio reportado como 0.0 GB, 0 descargas, 1 like, creado y actualizado el 2026-10-26.

## Arquitectura y entrenamiento

La arquitectura es un encoder transformer compacto de 4 capas y 256 dimensiones ocultas, con vocabulario SentencePiece propio de 20 000 piezas entrenado por el equipo. La cabeza de salida produce 13 filas de 4 probabilidades (una por nivel de riesgo y categoría) que suman 1 en cada fila; el orden de categorías y los nombres de nivel están en `config.json`. La app aplica un umbral de 0,8 sobre la probabilidad de riesgo y, en caso de empate entre categorías, resuelve a favor de la más grave según el orden configurado (por ejemplo, una amenaza de difundir imágenes íntimas se etiqueta como sextorsión y no como acoso). No hay decodificación generativa ni atención lineal: es clasificación pura de una sola secuencia.

El entrenamiento es una destilación desde el modelo profesor `gpt-oss-safeguard-20b`. El equipo partió de una hoja de reglas por categoría (qué cuenta y qué no, con ejemplos de cada nivel, basada en guías públicas de seguridad infantil e investigación sobre discurso de odio nigeriano), reunió unos 300 000 mensajes de conjuntos públicos y encargó unos 100 000 más a `gpt-oss-120b` en inglés nigeriano y pidgin. El profesor puntuó cada mensaje de 0 a 3 contra cada hoja de reglas y se conservaron sus probabilidades completas, no solo la etiqueta; Keeper aprendió a reproducirlas. Las primeras versiones fallaban en yoruba y hausa, así que se añadieron 68 000 mensajes generados por AfriqueQwen 9B en yoruba, hausa e igbo con su significado en inglés: el profesor puntuaba el significado y Keeper aprendía esa puntuación para el mensaje original. Las etiquetas humanas de AfriHate prevalecen sobre el profesor, y antes del entrenamiento se leyeron 2,4 millones de líneas de texto web en los cinco idiomas. El conjunto final ronda los 460 000 mensajes y el entrenamiento completo lleva menos de una hora en una única GPU. Todos los conjuntos de datos empleados permiten uso comercial (AfriHate y HausaHate con Apache 2.0; BRIGHTER, corpus de Mendeley y otros con CC BY 4.0; NaijaWeb y smishing africano con MIT).

## Capacidades

- Clasificación multietiqueta de 13 categorías de riesgo: bullying, trastornos alimentarios, apuestas, contenido gráfico, grooming, discurso de odio, amenazas a la privacidad, estafas, autolesión, sextorsión, contenido sexual, consumo de sustancias y violencia.
- Salida graduada en cuatro niveles (none, low, review, high) con distribución de probabilidad completa por categoría, lo que permite fijar umbrales propios en lugar de aceptar una decisión binaria.
- Comprensión de texto real de adolescentes nigerianos: mezcla de idiomas en el mismo mensaje (code-switching), jerga, abreviaturas, errores tipográficos y ausencia de marcas tonales en yoruba e igbo.
- Ejecución en dispositivo y sin conexión: 8,5 MB en int8, sin llamadas a red, con los mensajes sin abandonar el teléfono.
- Inferencia de bajísima latencia: menos de 1 ms por mensaje en CPU de portátil.
- Integración sencilla vía `onnxruntime` + `sentencepiece` + `numpy`, con un ejemplo funcional de unas 30 líneas en el repositorio.
- Capacidad generativa: no disponible (no es un modelo de lenguaje).
- Tool calling / function calling: no disponible.
- Soporte de agentes o razonamiento multi-paso: no disponible.
- Visión, audio o modo de razonamiento explícito: no disponible.

## Casos de uso

- Moderación en el propio dispositivo dentro de una app de seguridad infantil: el clasificador lee cada mensaje entrante, aplica el umbral de 0,8 y solo eleva una alerta cuando la probabilidad de riesgo es alta; al ejecutarse offline, se elimina el envío de conversaciones de menores a servidores externos.
- Triaje para revisión parental: el nivel "review" permite agrupar casos que un padre o tutor debería mirar (por ejemplo, un amigo insistiendo con una app de apuestas) sin generar alertas por insultos leves entre compañeros de clase, que caen en "low".
- Detección de grooming y sextorsión en chats: la ponderación por gravedad en caso de empate hace que una amenaza de difundir imágenes íntimas se clasifique como sextorsión, el caso que exige actuación inmediata.
- Antifraude y phishing en el mercado nigeriano: el modelo se entrenó con NaijaScamBench, SMS de smishing africano y un corpus de phishing por SMS, por lo que puede marcar mensajes de estafa en pidgin e inglés nigeriano dentro de apps de mensajería o pasarelas de pago.
- Moderación de comunidades en línea (foros, grupos, plataformas UGC) dirigidas a África Occidental: clasificación multinivel de contenido sexual, violencia o discurso de odio en hausa, yoruba e igbo, donde la mayoría de los filtros comerciales no cubren la lengua.
- Preetiquetado para investigación en lenguas de bajos recursos: usar las probabilidades del modelo como anotación inicial sobre corpus de yoruba, hausa, igbo o pidgin, con revisión humana posterior, para acelerar la creación de datasets de seguridad.
- Filtrado en entornos escolares o MDM: integración en el flujo de mensajería de un centro educativo para contar incidentes por categoría ("low") y derivar solo los casos "high" al equipo de orientación.
- Puerta de entrada en servidores de chat: descarte rápido (menos de 1 ms por mensaje) de mensajes claramente seguros antes de pasar el resto a un modelo mayor más caro, reduciendo coste de inferencia en producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible; se trata de un clasificador y no de un modelo generativo, por lo que esas métricas no aplican. El autor sí publica una evaluación propia sobre 746 mensajes no vistos en entrenamiento (tuits reales de AfriHate, mensajes del paquete de seguridad para adolescentes de OpenAI y mensajes redactados por el equipo en los cinco idiomas y las 13 categorías). Un mensaje se considera correcto si Keeper le asigna el nivel adecuado para su categoría.

| Metrica | Keeper 0.1 |
|---|---|
| Conjunto completo (746 mensajes) | 80 % |
| Mensajes de riesgo detectados | 84 % |
| Mensajes seguros marcados por error | 12 % |
| Pidgin | 87 % |
| Igbo | 81 % |
| Yoruba | 78 % |
| Inglés | 76 % |
| Hausa | 74 % |
| Tuits reales de AfriHate | 74 % |
| Subconjunto propio de 557 mensajes | 84 % |

Referencias del autor: la lista de palabras clave que Lighthouse usaba antes obtiene un 37 % en la misma prueba y detecta solo el 22 % de los mensajes de riesgo; el modelo profesor (`gpt-oss-safeguard-20b`) alcanza un 85 %.

## Requisitos de hardware

- VRAM para inferencia: 0 GB. El modelo está pensado para CPU; no requiere GPU.
- Huella en disco y memoria: 8,5 MB en int8 (versión distribuida), 33 MB en fp32 y 0,6 MB el tokenizador; el consumo de RAM en ejecución es del orden de decenas de MB, no publicado con exactitud.
- GPU recomendadas: no aplica. Cualquier CPU x86 o ARM moderna sirve; el autor reporta menos de 1 ms por mensaje en CPU de portátil.
- Cabe en GPU de consumo: sí, pero es innecesario; también cabe en un Android económico, que es el objetivo declarado.
- Opciones de despliegue: `onnxruntime` con `sentencepiece` y `numpy` (el repositorio incluye `example.py`). No hay pesos GGUF ni safetensors, por lo que no se documentan integraciones con llama.cpp, Ollama, vLLM ni TGI.
- Latencia y throughput: menos de 1 ms por mensaje en CPU de portátil; no se publica throughput agregado ni cifras medidas en móvil.
- Almacenamiento del repositorio: los metadatos de HuggingFace indican 0.0 GB, en contradicción aparente con los tamaños de fichero declarados en la model card (8,5 MB + 33 MB + 0,6 MB).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento en el test de 746 mensajes | Licencia | Formato |
|---|---|---|---|---|---|
| Keeper 0.1 | 8,3 M | 128 word pieces | 80 % (84 % en riesgo, 12 % de falsos positivos) | Apache 2.0 | ONNX int8/fp32 |
| Lista de palabras clave previa de Lighthouse | No disponible | No aplica (coincidencia de frases) | 37 % (22 % de mensajes de riesgo detectados) | No disponible | No disponible |
| gpt-oss-safeguard-20b (profesor) | 20 000 M (según el nombre del modelo) | No disponible en la información | 85 % | No disponible en la información | No disponible |

No se dispone de datos en la información proporcionada sobre otros clasificadores de seguridad pequeños para lenguas nigerianas con los que establecer una comparación cuantitativa; esa comparativa figura como no disponible. La alternativa real documentada por el autor es doble: modelos profesores de 20 000 millones de parámetros, con una precisión solo 5 puntos superior pero imposibles de ejecutar en un móvil, y listas de palabras clave, mucho más baratas pero con 43 puntos menos de acierto.

## Limitaciones y advertencias

- Ventana de 128 word pieces: los mensajes más largos se truncan, de modo que una señal de riesgo situada al final del texto puede perderse.
- Analiza un mensaje aislado, sin contexto conversacional: patrones de grooming o sextorsión construidos a lo largo de varios mensajes pueden no ser detectados.
- Techo de precisión ligado a la destilación: 80 % global frente al 85 % del profesor; el modelo pequeño no supera a su maestro y hereda sus errores y sesgos de etiquetado.
- Tasa de falsos positivos del 12 % sobre mensajes seguros, con umbral de 0,8: en un volumen alto de mensajería esto puede generar fatiga de alertas y erosionar la confianza de las familias.
- Diferencias notables por idioma: hausa es el más débil (74 %) y yoruba 78 %, frente al 87 % de pidgin. El rendimiento fuera de la población nigeriana para la que fue diseñado no se ha medido.
- Base de evaluación limitada: 746 mensajes en total, y los subconjuntos por idioma son fracciones pequeñas de esa cifra, por lo que la incertidumbre de las métricas por lengua es alta.
- Reproducibilidad parcial: de los 746 mensajes de prueba solo se publican 557; los tuits de AfriHate y el paquete de OpenAI no son redistribuibles, así que la comparación completa no es verificable de forma independiente.
- Dependencia de datos sintéticos: buena parte del entrenamiento procede de generaciones de `gpt-oss-120b` y AfriqueQwen 9B puntuadas por un profesor, con hojas de reglas redactadas por el propio equipo; los sesgos de esas fuentes se transfieren al modelo.
- Para yoruba, hausa e igbo el profesor puntuaba la traducción al inglés, no el mensaje original: matices pragmáticos o culturales pueden perderse en ese paso.
- Licencia Apache 2.0, apta para uso comercial, pero parte de los datos de entrenamiento son CC BY 4.0 (BRIGHTER, corpus de Mendeley), lo que exige atribución; conviene una revisión legal antes de un despliegue comercial.
- No es una herramienta de diagnóstico ni sustituye a servicios profesionales: un falso negativo en autolesión o sextorsión tiene consecuencias graves, por lo que debe acompañarse de canales de reporte y revisión humana.
- Adopción prácticamente nula (0 descargas, 1 like) y versión 0.1: no existe validación externa ni historial de mantenimiento.
- Los resultados de búsqueda web disponibles no contienen información sobre este modelo: solo devuelven artículos sobre el fenómeno de ficción generada por IA en torno a un farero llamado Elias Thorne, sin relación con `lighthouse-keeper`.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Prosperitytech/lighthouse-keeper
- Conjunto de evaluación propio (557 mensajes): https://huggingface.co/datasets/Prosperitytech/keeper-nigerian-safety-test
- Modelo profesor: https://huggingface.co/openai/gpt-oss-safeguard-20b
- Generador de datos en yoruba, hausa e igbo: https://huggingface.co/McGill-NLP/AfriqueQwen3.5-9B-50Langs-Instruct-v1
- Iniciativa Lighthouse de Prosperity Tech: https://prosperitytech.org/work/lighthouse
- AfriHate: https://huggingface.co/datasets/afrihate/afrihate
- HausaHate: https://huggingface.co/datasets/franciellevargas/HausaHate
- BRIGHTER emotion categories: https://huggingface.co/datasets/brighter-dataset/BRIGHTER-emotion-categories
- Nigerian hate speech (Mendeley): https://data.mendeley.com/datasets/r5jsynhxsx/1
- Nigerian Twitter cyberbullying (Mendeley): https://data.mendeley.com/datasets/5d3y8v68sd/1
- Hausa-English code switched (Mendeley): https://data.mendeley.com/datasets/3xjyjsf4sb/1
- SMS phishing (Mendeley): https://data.mendeley.com/datasets/f45bkkt8pr
- NaijaScamBench: https://huggingface.co/datasets/Eterniti/NaijaScamBench
- Africa smishing SMS phishing: https://huggingface.co/datasets/electricsheepafrica/africa-smishing-sms-phishing
- NaijaWeb: https://huggingface.co/datasets/saheedniyi/naijaweb
- Paper o blog técnico del modelo: no disponible en la información proporcionada
- Repositorio de código o demo independiente: no disponible en la información proporcionada
