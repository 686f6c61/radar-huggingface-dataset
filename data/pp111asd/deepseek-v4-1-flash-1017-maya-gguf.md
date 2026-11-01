# pp111asd/DeepSeek-V4.1-Flash-1017-Maya-GGUF

## Resumen

DeepSeek-V4.1-Flash-1017-Maya-GGUF es una colección de cuantizaciones GGUF del modelo DeepSeek-V4.1-Flash-1017, publicada por el usuario pp111asd (con el cuantizador acreditado como peasantsmith) y diseñada específicamente para Project Maya, un motor de inferencia que mantiene en la GPU los expertos más utilizados y lee el resto desde RAM y SSD. El modelo base es un transformer con arquitectura mixture-of-experts (MoE) desarrollado por DeepSeek, con 748.494.643.824 parámetros totales según los pesos en safetensors del repositorio, 384 expertos enrutados por capa y 6 activos por token, más un experto compartido.

El problema que resuelve esta publicación es el de ejecutar un modelo de casi 750.000 millones de parámetros en hardware de consumo: el repositorio ocupa 631,7 GB en total, pero la variante Maya-XS deja el modelo en 115,3 GB de memoria, lo que permite que quepa en un PC con 128 GB de RAM. La publicación incluye dos cuantizaciones (Maya-S y Maya-XS), un drafter para decodificación especulativa, y tablas Engram (memoria de n-gramas) que se leen desde el SSD en lugar de cargarse en memoria.

Es relevante ahora porque demuestra una vía práctica para servir modelos de escala frontera en estaciones de trabajo, con métricas de fidelidad frente al modelo original publicadas por el autor (92,6 % de coincidencia en el token top para Maya-S y 87,5 % para Maya-XS) y compatibilidad con endpoints OpenAI y Anthropic a través del motor Project Maya. La licencia es MIT, igual que la del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mixture-of-experts (MoE): 384 expertos enrutados por capa, 6 activos por token, mas un experto compartido |
| Parametros totales | 748.494.643.824 |
| Parametros activos | no disponible (el autor no publica el numero exacto de parametros activos por token) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Maya-S: IQ2_XXS en gate/up y IQ3_XXS en down de los expertos enrutados (IQ2_S / IQ3_S en las cuatro primeras y cuatro ultimas capas), Q8_0 en atencion, expertos compartidos, embeddings y salida; Maya-XS: IQ1_S en expertos enrutados, Q8_0 en el resto; tablas Engram en Q6_K; router, normas, mezcla de hiper-conexiones y attention sinks en F32/BF16 |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (multi-parte: 6 ficheros para Maya-S, 5 para Maya-XS), mas drafter en formato binario propio (`dspark.bin` / `dspark-xs2.bin`) |

## Arquitectura y entrenamiento

El modelo base es un transformer MoE con 384 expertos enrutados por capa, de los cuales se activan 6 por token, además de un experto compartido. La publicación conserva el router, las normas, la mezcla de hiper-conexiones (hyper-connections) y los attention sinks tal como se publicaron en F32/BF16, y mantiene la torre de visión del checkpoint original de DeepSeek sin modificar. Los pesos originales del modelo base usan expertos en FP4 y pesos densos en FP8.

Las cuantizaciones se generaron a partir de la release oficial de DeepSeek, no de un fichero ya recuantizado, y conservan todos los expertos. El proceso sigue la receta del IST Austria DAS Lab: calibración con texto en el formato de chat propio de DeepSeek (incluyendo modo thinking, código, llamadas a herramientas, trazas de agentes, razonamiento, chat y contenido multilingüe), con 128 secuencias de 2.048 tokens para Maya-S y el triple para Maya-XS, más las propias respuestas del modelo; cálculo de una importance matrix por experto capa a capa; y redondeo con feedback de error estilo GPTQ en bloques de 256 pesos, cada experto contra sus propias estadísticas de entrada. Maya-XS se calibra sobre el propio modelo ya cuantizado, de modo que cada capa ve la salida de las capas cuantizadas anteriores. Las tablas Engram (memoria de n-gramas de DeepSeek) se cuantizan en Q6_K y se leen unas pocas filas por token desde el SSD.

La innovación destacable es el uso de decodificación especulativa mediante un drafter (DSpark) incluido en la publicación: 8,0 GB para Maya-S con los expertos FP4 de DeepSeek y 4,3 GB para Maya-XS con expertos propios en 2 bits. El motor Project Maya gestiona la colocación de expertos entre GPU, RAM y SSD.

## Capacidades

- Generación de texto conversacional en formato chat, con soporte del modo thinking del modelo base.
- Razonamiento multi-paso y trazas de agente, según la composición del conjunto de calibración declarado por el autor.
- Generación de código y llamadas a herramientas (tool calls), también presentes en los datos de calibración.
- Capacidades de visión: la torre de visión se toma del checkpoint de DeepSeek sin cambios y el motor sirve entrada de imágenes.
- API compatible con OpenAI y Anthropic (streaming, tool calls, imágenes) a través de Project Maya en `http://127.0.0.1:8080`.
- Decodificación especulativa con drafter dedicado para cada cuantización.
- Capacidades multilingües: el autor incluye contenido multilingüe en la calibración, pero no se publica la lista de idiomas soportados.

## Casos de uso

- Asistente de código en estación de trabajo local: el modelo puede generar y revisar código con llamadas a herramientas integradas en el editor, aprovechando la API compatible con OpenAI que expone Project Maya y el modo thinking del modelo base para tareas de refactorización compleja.
- Agente autónomo con trazas multi-paso: al haberse calibrado con trazas de agentes y tool calls, es adecuado para pipelines que encadenan búsquedas, ejecución de comandos y razonamiento intermedio, con el drafter reduciendo la latencia de generación.
- Procesamiento de documentos con imágenes: la torre de visión heredada del checkpoint permite extraer y razonar sobre capturas, diagramas o páginas escaneadas en flujos de análisis documental.
- Laboratorio de evaluación de cuantizaciones: las métricas publicadas (coincidencia de token top y NLL frente al original) permiten usar Maya-S y Maya-XS como referencia para estudiar el impacto de IQ2/IQ1 en modelos MoE de gran escala.
- Servicio interno de chat para equipos pequeños: con Maya-XS en 115,3 GB de memoria, un servidor con 128 GB de RAM y una GPU puede atender conversaciones multi-turno sin depender de la nube, con la licencia MIT eliminando restricciones de uso comercial.
- Investigación en arquitecturas MoE con offloading: el formato multi-parte (modelo en unos ficheros, tablas Engram en otros) y la separación GPU/RAM/SSD facilitan experimentos sobre enrutamiento de expertos y memoria externa.
- Despliegue de bajo coste con hardware heterogéneo: el motor compila para las GPU disponibles y verifica cada fichero por sha256 con reanudación de descargas, lo que simplifica la puesta en marcha en máquinas con varias GPU.

## Benchmarks y rendimiento

El autor publica métricas de fidelidad de la cuantización frente al modelo original, medidas sobre texto retenido no usado en calibración y comparadas con las predicciones del modelo original ejecutado en la implementación de referencia de DeepSeek:

| Metrica | Original via motor Maya | Maya-S | Maya-XS |
|---|---|---|---|
| Coincidencia en el token top | 96,4 % | 92,6 % | 87,5 % |
| NLL relativa al original | referencia del motor | +3,2 % | +8,7 % |
| Modelo en memoria | no aplica | 178,2 GB | 115,3 GB |
| Drafter | no aplica | 8,0 GB | 4,3 GB |
| Tablas Engram (leidas de SSD) | no aplica | 161,3 GB | 161,3 GB |
| Descarga completa | no aplica | 347,5 GB | 280,9 GB |

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM: no se especifica un mínimo por GPU; el motor reparte el modelo entre GPU, RAM y SSD. Maya-XS requiere 115,3 GB de memoria de sistema para el modelo y Maya-S 178,2 GB, más 161,3 GB de espacio en disco para las tablas Engram en ambos casos.
- RAM: Maya-XS está pensado para un PC con 128 GB de memoria; Maya-S exige más de 178 GB de memoria de sistema.
- GPU recomendadas: no disponible; el motor compila para las GPU presentes en la máquina, pero el autor no publica una lista de modelos soportados ni requisitos de VRAM por GPU.
- Cabe en GPU de consumo: no de forma completa; el diseño depende del offloading a RAM y SSD, por lo que no se ejecuta íntegramente en una RTX 4090 ni en tarjetas de 24 GB.
- Almacenamiento: descarga de 347,5 GB (Maya-S) o 280,9 GB (Maya-XS), repartida en 6 y 5 ficheros GGUF respectivamente, más el drafter.
- Opciones de despliegue: Project Maya (repositorio en GitHub, con `setup.sh` para Linux y `START-MAYA.bat` para Windows, versión 1.1.22 o posterior para Maya-XS), que expone API compatible con OpenAI y Anthropic y un panel en `http://127.0.0.1:8080`. Los ficheros son GGUF ordinarios generados con los cuantizadores de llama.cpp, pero el autor no documenta su uso con vLLM, Ollama o TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Cuantizacion para hardware de consumo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DeepSeek-V4.1-Flash-1017-Maya-GGUF (Maya-XS) | 748.494.643.824 | no disponible | IQ1_S, 115,3 GB en memoria | MIT | HuggingFace, 189 descargas |
| DeepSeek-V4.1-Flash-1017 (original) | 748.494.643.824 | no disponible | FP4 expertos / FP8 densos, requiere hardware de datacenter | MIT | HuggingFace (modelo base) |
| Alternativas de tamano comparable | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones de modelos alternativos en la informacion proporcionada para establecer una comparación cuantitativa adicional.

## Limitaciones y advertencias

- La cuantización introduce degradación medible: Maya-XS pierde un 8,7 % de NLL frente al original y solo coincide en el token top el 87,5 % de las veces; Maya-S mejora a +3,2 % y 92,6 %, pero ninguna iguala al modelo original.
- El rendimiento depende críticamente del motor Project Maya: sin él no hay soporte documentado para ejecutar estas cuantizaciones en otros runners, a pesar de ser GGUF.
- El requisito de 161,3 GB de tablas Engram en SSD implica que la latencia puede verse afectada por la velocidad del disco, especialmente en Maya-XS con expertos en IQ1_S.
- No se publica la longitud de contexto soportada ni la lista de idiomas, lo que impide garantizar comportamiento en contextos largos o en idiomas distintos del inglés.
- Riesgo de alucinación inherente al modelo base y potencialmente amplificado por el redondeo agresivo de expertos en IQ1_S/IQ2_XXS.
- Sesgos conocidos del modelo base: no documentados en la información disponible.
- Licencia MIT: permite uso comercial sin restricciones adicionales, pero conviene verificar las condiciones del modelo base de DeepSeek y de los componentes de terceros (receta ISTA-DASLab, llama.cpp).
- El repositorio tiene 0 likes y 189 descargas, y fue creado y actualizado el mismo día (2026-10-30): no hay historial de mantenimiento ni validación independiente de las métricas publicadas.
- El drafter y el formato de las tablas Engram son específicos de Project Maya; su reutilización fuera de ese motor no está documentada.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/pp111asd/DeepSeek-V4.1-Flash-1017-Maya-GGUF
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- Project Maya (motor de inferencia): https://github.com/mw00/project-maya
- Receta de cuantización IST Austria DAS Lab: https://huggingface.co/ISTA-DASLab
