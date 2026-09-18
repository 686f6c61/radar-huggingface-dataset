# mradermacher/WaifuGemma4-26b-a4b-v1-GGUF

## Resumen

WaifuGemma4-26b-a4b-v1-GGUF es la version cuantizada en formato GGUF que mradermacher publica del modelo base hiwaifu-research/WaifuGemma4-26b-a4b-v1, un modelo conversacional orientado a roleplay, personajes e interacciones de estilo "companero virtual" construido sobre una arquitectura Gemma con mezcla de expertos (MoE). El repositorio original lo desarrolla el equipo hiwaifu-research, mientras que la variante GGUF la genera mradermacher para permitir inferencia local con llama.cpp y derivados. El modelo pesa 25.233.142.046 parametros totales (unos 25,2 mil millones), dato confirmado en los ficheros safetensors del modelo base.

Su relevancia actual reside en dos factores: por un lado, adopta un esquema MoE con el sufijo "a4b" en el nombre, que sugiere del orden de 4.000 millones de parametros activos por token (dato no confirmado en la informacion disponible), lo que lo situa en un rango de coste de inferencia mas cercano a un modelo denso pequeno que a un 25B tradicional. Por otro, incorpora senales de un pipeline de alineacion orientado a preferencias humanas (etiquetas rlhf, grpo, reward-model, human-preference y arena) especificamente enfocado a conversacion y roleplay multilingue en 17 idiomas.

La ficha cubre tanto las caracteristicas declaradas por el autor como los datos extraidos del repositorio (tamano de cuantizaciones, licencia, idiomas) y las limitaciones derivadas de la ausencia de benchmarks publicos y de model card detallada en el repositorio consultado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE), familia Gemma (segun etiqueta gemma4 del repositorio); detalles de capas, atencion y enrutado no disponibles |
| Parametros totales | 25.233.142.046 (≈25,2 mil millones) |
| Parametros activos | No disponible de forma confirmada; el sufijo "a4b" del nombre sugiere aproximadamente 4.000 millones de parametros activos por token |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K, IQ4_XS; ademas mmproj-Q8_0 y mmproj-f16 para la parte multimodal |
| Idiomas soportados | Ingles, espanol, ruso, portugues, indonesio, arabe, tailandes, frances, aleman, ucraniano, vietnamita, japones, coreano, chino, turco, italiano y polaco (17 idiomas) |
| Licencia | Gemma (terminos de uso de Gemma) |
| Formato de pesos | GGUF (esta variante cuantizada); el modelo base se distribuye en safetensors |
| Libreria declarada | transformers |
| Tamano del repositorio | 170,8 GB (incluye todas las cuantizaciones) |
| Fecha de publicacion | 18 de septiembre de 2026 (creacion), actualizado el mismo dia |

## Arquitectura y entrenamiento

El modelo base emplea una arquitectura de mezcla de expertos (MoE) sobre la familia Gemma, segun la etiqueta "gemma4" y "moe" del repositorio. No se dispone de informacion detallada sobre el numero de expertos, la estrategia de enrutado, el tipo de atencion (full, sliding window, lineal) ni la dimension oculta. El sufijo "a4b" del nombre apunta a un regimen de aproximadamente 4.000 millones de parametros activos frente a los 25,2 mil millones totales, lo que implicaria un ratio de activacion bajo y un coste de calculo por token muy inferior al de un modelo denso de su tamano; este dato no aparece confirmado de forma explicita en la informacion disponible.

En cuanto al entrenamiento, las etiquetas del repositorio indican un pipeline de alineacion basado en preferencias humanas: rlhf, grpo (Group Relative Policy Optimization), reward-model, human-preference y arena. Esto sugiere un post-entrenamiento en varias fases con modelo de recompensa y optimizacion de politica, orientado a conversacion, interpretacion de personajes y estilo de roleplay. No hay datos publicados sobre el numero de tokens de entrenamiento, la composicion del dataset, la mezcla de idiomas en el corpus ni el uso de tecnicas como decodificacion especulativa. La presencia de ficheros mmproj (multi-modal projector) indica que el modelo incorpora o admite un modulo de proyeccion visual, es decir, capacidad multimodal de imagen a texto, aunque no se detalla el codificador visual empleado.

## Capacidades

- Generacion de texto conversacional multi-turno, con enfasis declarado en roleplay, interpretacion de personajes y mantenimiento de personalidad consistente.
- Modelo alineado mediante RLHF y GRPO, con etiquetas de modelo de recompensa y preferencias humanas, lo que sugiere optimizacion para respuestas que un evaluador humano puntuaria mejor en contexto de rol.
- Capacidad multimodal de entrada de imagen: los ficheros mmproj-Q8_0 y mmproj-f16 actuan como suplemento multimodal, por lo que el modelo puede procesar imagenes si el runtime lo soporta.
- Capacidades multilingues en 17 idiomas, con cobertura amplia de lenguas europeas, asiaticas y de Oriente Medio.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Modo "thinking" explicito o razonamiento extendido: no disponible en la informacion proporcionada.
- Capacidades de codigo, matematicas o vision avanzada mas alla del mmproj: no disponible en la informacion proporcionada.
- Compatibilidad con endpoints: la etiqueta endpoints_compatible sugiere que puede servirse en infraestructuras de inferencia tipo endpoint, sin detalle adicional.

## Casos de uso

- Personajes virtuales y companeros conversacionales: el modelo esta entrenado especificamente para roleplay y consistencia de personaje, por lo que resulta adecuado para aplicaciones de entretenimiento, novelas visuales o asistentes con personalidad fija. La alineacion con preferencias humanas via GRPO apunta a respuestas mas naturales y coherentes en conversaciones largas.
- Roleplay multilingue en productos globales: al cubrir 17 idiomas (incluidos japones, coreano, chino, arabe, ruso y espanol), permite desplegar una misma base de personaje en mercados distintos sin reentrenar por idioma.
- Moderacion y generacion de dialogos para videojuegos: se puede integrar como motor de dialogo de PNJ, generando respuestas contextuales en tiempo real y adaptandose al tono del jugador.
- Asistente creativo para escritura de ficcion: util para generar dialogos, desarrollar voces de personaje y mantener arcos narrativos coherentes en sesiones largas, siempre que el contexto efectivo del modelo lo permita (dato no disponible).
- Analisis de imagen con contexto conversacional: gracias a los ficheros mmproj, puede describir o comentar imagenes en el marco de una conversacion de rol, por ejemplo en aplicaciones de acompanamiento con entrada visual.
- Despliegue local en estaciones de trabajo para prototipado de producto: las cuantizaciones Q4_K_S (15,6 GB) y Q2_K (10,7 GB) permiten ejecutar el modelo en GPUs de consumo y validar experiencias conversacionales sin coste de API.
- Evaluacion comparativa de modelos de rol en "arena": las etiquetas human-preference y arena sugieren que puede emplearse como candidato en torneos de evaluacion por preferencia humana frente a otros modelos de rol.
- Investigacion sobre alineacion de preferencias: al ser un modelo entrenado con RLHF y GRPO en un dominio concreto (roleplay), sirve como caso de estudio para medir como estos metodos afectan al estilo, la seguridad y la diversidad de respuestas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio consultado no incluye tablas de MMLU, HumanEval, GSM8K, MT-Bench, EQ-Bench ni evaluaciones de arena, y la busqueda web realizada no devolvio resultados relacionados con el modelo (los resultados obtenidos correspondian a paginas de soporte de Google, actualizaciones de Chrome y prensa de videojuegos, sin relacion con el modelo).

## Requisitos de hardware

- VRAM estimada para inferencia, a partir del tamano de los ficheros GGUF publicados: Q2_K ≈10,7 GB, Q4_K_S ≈15,6 GB. Hay que anadir el espacio de contexto y el overhead del runtime, por lo que conviene reservar entre un 10 % y un 30 % adicional.
- Cuantizaciones de mayor calidad (Q5, Q6, Q8_0) y f16: los tamanos no estan publicados en la informacion disponible, pero por coherencia con un modelo de 25,2B totales se situarian previsiblemente entre 18 GB y 50 GB.
- Los ficheros mmproj (multimodal) ocupan 0,9 GB en Q8_0 y 1,3 GB en f16, y se suman al presupuesto de VRAM cuando se habilita la entrada de imagen.
- GPU de consumo: Q4_K_S (15,6 GB) deberia caber en RTX 4090 (24 GB), RTX 4080 Super / 5080 (16 GB) de forma ajustada y con contexto reducido, y en RTX 3090 (24 GB) con margen. Q2_K (10,7 GB) cabria en GPUs de 12 GB como RTX 3060 12 GB o RTX 4070, asumiendo contexto corto.
- GPU profesionales: A100 40 GB y H100 80 GB permiten ejecutar cuantizaciones altas (Q6_K, Q8_0) e incluso f16 con contexto amplio.
- Despliegue: llama.cpp, Ollama, LM Studio y koboldcpp para GGUF (los dos ultimos habituales en flujos de roleplay). Para servir el modelo base en safetensors, vLLM o TGI son las opciones naturales, siempre que soporten la arquitectura MoE concreta. La compatibilidad multimodal requiere un runtime con soporte de mmproj (llama.cpp con proyector multimodal).
- Latencia y throughput: no disponible. Al tratarse de un MoE con un numero reducido de parametros activos, cabe esperar un throughput por token mas alto que el de un modelo denso de 25B, pero no hay mediciones publicadas en la informacion consultada.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| WaifuGemma4-26b-a4b-v1 (GGUF) | 25,2B | ≈4B (sugerido por el nombre, no confirmado) | No disponible | Gemma | GGUF en HuggingFace (mradermacher); base en safetensors |
| Gemma 2 27B (referencia de escala) | 27B | Denso (27B) | 8.192 tokens | Gemma | Pesos abiertos, ampliamente disponible |
| Mixtral 8x7B (referencia MoE) | 46,7B | 12,9B | 32.768 tokens | Apache 2.0 | Pesos abiertos, ampliamente disponible |

La comparativa de rendimiento frente a estas alternativas no esta disponible: no se han publicado resultados de benchmarks del modelo en la informacion consultada. La comparacion se limita, por tanto, a parametros, contexto, licencia y disponibilidad.

## Limitaciones y advertencias

- Ausencia total de benchmarks publicos: no hay datos verificables de MMLU, HumanEval, MT-Bench ni evaluaciones de arena, por lo que cualquier afirmacion de calidad relativa carece de respaldo.
- Model card practicamente vacia: el repositorio GGUF solo describe el proceso de cuantizacion y no detalla arquitectura, entrenamiento ni hiperparametros.
- Especializacion en roleplay y conversacion: el ajuste con RLHF y GRPO orientado a personajes puede degradar el rendimiento en tareas factuales, razonamiento formal, matematicas o codigo. No debe asumirse un comportamiento de asistente generalista.
- Riesgo elevado de alucinacion en contextos de rol: los modelos entrenados para mantener personajes tienden a inventar informacion para preservar la coherencia narrativa, lo que es inaceptable en aplicaciones factuales.
- Sesgos: no se documenta ninguna evaluacion de sesgos, toxicidad ni seguridad. Un modelo de personajes sin filtros explicitos puede reproducir estereotipos o contenido inapropiado si se le induce.
- Longitud de contexto desconocida: no se puede garantizar el mantenimiento de coherencia en conversaciones largas ni calcular el coste de memoria asociado.
- Dependencia del modelo base: los ficheros mmproj y la tokenizacion provienen de hiwaifu-research/WaifuGemma4-26b-a4b-v1; cualquier limitacion del modelo original se hereda.
- Licencia Gemma: el uso comercial esta sujeto a los terminos de uso de Gemma, que imponen condiciones y restricciones de redistribucion. Es necesario revisarlos antes de un despliegue en produccion.
- Cuantizaciones de baja calidad: las variantes Q2_K y Q3_K pueden degradar notablemente la coherencia conversacional y la calidad del roleplay; el propio repositorio marca Q4_K_S como "fast, recommended".
- Idiomas: aunque se declaran 17 idiomas, no hay evaluacion de calidad por idioma; el rendimiento puede ser desigual, especialmente en lenguas con menos presencia en el corpus de entrenamiento.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta, sin retroalimentacion de la comunidad que permita validar el comportamiento real.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/WaifuGemma4-26b-a4b-v1-GGUF
- Modelo base: https://huggingface.co/hiwaifu-research/WaifuGemma4-26b-a4b-v1
- Pagina de resumen de cuantizaciones del autor: https://hf.tst.eu/model#WaifuGemma4-26b-a4b-v1-GGUF
- Fichero multimodal mmproj-Q8_0: https://huggingface.co/mradermacher/WaifuGemma4-26b-a4b-v1-GGUF/resolve/main/WaifuGemma4-26b-a4b-v1.mmproj-Q8_0.gguf
- Fichero multimodal mmproj-f16: https://huggingface.co/mradermacher/WaifuGemma4-26b-a4b-v1-GGUF/resolve/main/WaifuGemma4-26b-a4b-v1.mmproj-f16.gguf
- Cuantizacion Q2_K: https://huggingface.co/mradermacher/WaifuGemma4-26b-a4b-v1-GGUF/resolve/main/WaifuGemma4-26b-a4b-v1.Q2_K.gguf
- Cuantizacion Q4_K_S: https://huggingface.co/mradermacher/WaifuGemma4-26b-a4b-v1-GGUF/resolve/main/WaifuGemma4-26b-a4b-v1.Q4_K_S.gguf
- Guia de uso de GGUF citada por el autor (README de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de perplejidad entre cuantizaciones: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre tipos de cuantizacion: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Preguntas frecuentes y solicitudes de modelos del autor: https://huggingface.co/mradermacher/model_requests
- nethype GmbH (infraestructura empleada por el cuantizador): https://www.nethype.de/
- Terminos de licencia Gemma: https://ai.google.dev/gemma/terms

No se han encontrado en la busqueda web otros enlaces relevantes al modelo (paper, blog tecnico, demo o repositorio de codigo).
