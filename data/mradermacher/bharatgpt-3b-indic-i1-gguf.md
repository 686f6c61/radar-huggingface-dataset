# mradermacher/BharatGPT-3B-Indic-i1-GGUF

## Resumen

BharatGPT-3B-Indic-i1-GGUF es una colección de cuantizaciones en formato GGUF del modelo CoRover/BharatGPT-3B-Indic, publicada por el usuario mradermacher. El modelo base es un transformer conversacional de 3.212.749.888 parámetros (aproximadamente 3,2 mil millones) desarrollado por CoRover, orientado a tareas de generación de texto y diálogo en idiomas de la India y en inglés. Esta versión i1 emplea cuantización con matriz de importancia (imatrix) para preservar mejor la calidad en tasas de bits bajas.

El interés práctico de esta publicación reside en que permite ejecutar un modelo multilingüe especializado en idiomas índicos en hardware de consumo, con ficheros que van desde 1,0 GB (IQ1_S) hasta 2,7 GB (Q6_K). Los idiomas cubiertos son hindi, panyabí, guyaratí, canarés, maratí, télugu, malabar, oriya, tamil, urdu, bengalí e inglés, lo que lo hace útil para aplicaciones de atención al usuario en el subcontinente indio sin depender de infraestructura en la nube.

La ficha describe las especificaciones del modelo base y de las cuantizaciones, sus capacidades previsibles por tamaño y familia, y las limitaciones derivadas de la información disponible. No se han publicado en la información proporcionada datos de benchmarks, arquitectura detallada, composición del dataset de entrenamiento ni longitud de contexto, por lo que esos apartados se marcan explícitamente como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (detalle no disponible) |
| Parametros totales | 3.212.749.888 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, IQ3_XXS, IQ3_XS, IQ3_S, IQ3_M, Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_0, Q4_0_4_4, Q4_0_4_8, Q4_0_8_8, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K |
| Idiomas soportados | hi, pa, gu, kn, mr, te, ml, or, ta, ur, bn, en |
| Licencia | other (consultar términos del modelo base) |
| Formato de pesos | GGUF (cuantizaciones i1 con imatrix); el modelo base en safetensors |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo base CoRover/BharatGPT-3B-Indic en la documentación proporcionada. Por el recuento de parámetros (3,2 mil millones) y la librería declarada (transformers), se trata de un transformer denso de escala pequeña, pero no se especifican el número de capas, la dimensionalidad oculta, el mecanismo de atención ni la función de activación. Tampoco se documentan el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de ajuste fino supervisado, RLHF o DPO.

La innovación técnica relevante en esta publicación concreta es el uso de cuantización i1 con matriz de importancia (imatrix), generada por mradermacher con apoyo de infraestructura de terceros. Las cuantizaciones i1 buscan minimizar la perplejidad en tipos de cuantización agresivos (IQ1 a IQ3) mediante pesos de importancia calculados sobre un corpus de calibración, lo que permite obtener ficheros de 1,0 a 1,9 GB con una degradación menor que la de cuantizaciones estáticas equivalentes. El autor indica que las variantes IQ suelen ser preferibles a las no-IQ de tamaño similar y que Q4_K_M es la opción recomendada para uso general.

## Capacidades

- Generación de texto conversacional multi-turno en hindi, panyabí, guyaratí, canarés, maratí, télugu, malabar, oriya, tamil, urdu, bengalí e inglés.
- Respuesta a instrucciones y diálogo general, según la naturaleza conversacional declarada en las etiquetas del modelo.
- Capacidad multilingüe centrada en el subcontinente indio, con cobertura de 12 idiomas.
- No se ha documentado soporte de tool calling o function calling.
- No se ha documentado soporte de agentes ni razonamiento multi-paso explícito.
- No se ha documentado modo de razonamiento (thinking), visión, audio ni otras modalidades.
- No se ha documentado capacidad específica de generación de código o matemáticas.

## Casos de uso

- Atención al cliente en idiomas índicos: el modelo puede gestionar conversaciones multi-turno en hindi, tamil, télugu o bengalí, lo que permite desplegar un asistente local para usuarios del subcontinente sin enviar datos a servicios externos.
- Traducción y adaptación de contenidos entre inglés y lenguas índicas: útil para localizar documentación, mensajes de producto o material de soporte a varios idiomas con un único modelo de 3,2 mil millones de parámetros.
- Asistentes de voz o chat en dispositivos de gama baja: con cuantizaciones Q4_K_M (2,1 GB) o IQ3_S (1,6 GB) cabe en equipos con 4-8 GB de RAM o VRAM, lo que habilita despliegues en portátiles, mini-PC y dispositivos edge.
- Prototipado rápido de aplicaciones multilingües: al ser un GGUF compatible con llama.cpp y Ollama, permite validar flujos conversacionales en local antes de invertir en infraestructura mayor.
- Procesamiento de texto en entornos con conectividad limitada o requisitos de soberanía de datos: la inferencia local evita la dependencia de API externas, relevante para administraciones y empresas que operan en la India.
- Investigación en PLN multilingüe de bajo recursos: sirve como línea base para experimentos de ajuste fino o evaluación en lenguas índicas con hardware asequible.
- Generación de respuestas en centros de contacto con mezcla de idiomas (code-switching hindi-inglés): el modelo cubre ambos idiomas, lo que facilita conversaciones mixtas frecuentes en la región.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: aproximadamente 1,5-2,5 GB para IQ2-IQ3, 2,5-3,5 GB para Q4_K_M, 3,5-4,5 GB para Q5_K_M y Q6_K (incluyendo overhead de contexto y runtime de llama.cpp).
- GPU recomendadas: cualquier GPU con 4 GB o más de VRAM, como GTX 1650, RTX 3050, RTX 4060, RTX 4090; también A100 o H100 para despliegues con mayor concurrencia.
- Cabe en GPU de consumo: sí, en la práctica totalidad de GPUs consumer actuales, incluidas las integradas con memoria unificada suficiente (Apple Silicon, APUs con 8 GB o más).
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python y servidores compatibles con la API de OpenAI mediante llama.cpp; los ficheros GGUF también son compatibles con endpoints que aceptan este formato.
- Latencia y throughput: no disponibles en la información proporcionada. En un modelo de 3,2 mil millones de parámetros cuantizado a Q4, es razonable esperar decenas de tokens por segundo en GPUs consumer, pero no se aportan cifras verificadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| BharatGPT-3B-Indic-i1-GGUF | 3,21 B | No disponible | 12 (índicos + en) | other | GGUF |
| CoRover/BharatGPT-3B-Indic (base) | 3,21 B | No disponible | 12 (índicos + en) | other | safetensors |
| BharatGPT-3B-Indic-GGUF (cuantizaciones estáticas de mradermacher) | 3,21 B | No disponible | 12 (índicos + en) | other | GGUF |
| Modelos multilingües de ~3 B de propósito general | ~3 B | Variable | Variable | Variable | safetensors/GGUF |

No se dispone de datos de rendimiento comparativo entre estas variantes ni frente a modelos de otros autores, por lo que la comparación se limita a parámetros, idiomas y formato.

## Limitaciones y advertencias

- No se han publicado benchmarks ni evaluaciones independientes del modelo base ni de las cuantizaciones, por lo que el rendimiento real en tareas concretas es desconocido.
- Las cuantizaciones de 1-2 bits (IQ1, IQ2) degradan notablemente la calidad; el autor las etiqueta como "for the desperate" o "mostly desperate".
- Riesgo de alucinación inherente a un modelo de 3,2 mil millones de parámetros, especialmente en tareas de razonamiento complejo, matemáticas o conocimiento factual.
- La licencia es "other": es imprescindible revisar los términos del modelo base CoRover/BharatGPT-3B-Indic antes de cualquier uso comercial.
- La longitud de contexto no está documentada; conviene validarla empíricamente antes de diseñar flujos con contexto largo.
- Cobertura idiomática declarada pero no evaluada: la calidad relativa entre los 12 idiomas puede variar y no se aportan métricas por idioma.
- El modelo no documenta soporte de tool calling ni de agentes, por lo que integrarlo en pipelines que requieran estas capacidades exige capas adicionales.
- El repositorio ocupa 39,4 GB por incluir todas las variantes; conviene descargar solo el fichero necesario para evitar consumo innecesario de almacenamiento.
- La fecha de creación es de noviembre de 2024 y la de actualización de noviembre de 2026, pero no se detalla qué cambios se han introducido en las revisiones.

## Enlaces

- Repositorio Hugging Face de esta publicación: https://huggingface.co/mradermacher/BharatGPT-3B-Indic-i1-GGUF
- Modelo base: https://huggingface.co/CoRover/BharatGPT-3B-Indic
- Cuantizaciones estáticas del mismo modelo: https://huggingface.co/mradermacher/BharatGPT-3B-Indic-GGUF
- Página de resumen de descargas del autor: https://hf.tst.eu/model#BharatGPT-3B-Indic-i1-GGUF
- Guía de uso de GGUF (README de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Notas sobre tipos de cuantización de Artefact2: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Peticiones de cuantización del autor: https://huggingface.co/mradermacher/model_requests
- Sitio del patrocinador (nethype GmbH): https://www.nethype.de/
