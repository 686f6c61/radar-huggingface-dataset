# mradermacher/Hy-MT3-7B-i1-GGUF

## Resumen

Hy-MT3-7B-i1-GGUF es la versión cuantizada en formato GGUF del modelo Hy-MT3-7B de Tencent, un modelo de traducción automática de 7.504.568.320 parámetros (aproximadamente 7,5 mil millones). La cuantización la ha realizado mradermacher, un conocido creador de cuantizaciones GGUF, aplicando cuantización con matriz de importancia (imatrix) para preservar la calidad en los niveles de compresión más agresivos. El modelo base está especializado en traducción multilingüe y cubre más de 90 idiomas, incluyendo lenguas de bajos recursos como el camboyano, el birmano, el guyaratí, el urdu, el telugu, el cebuano, el waray o el gaélico escocés.

El problema que resuelve es la necesidad de un motor de traducción local, ejecutable en hardware de consumo, con cobertura lingüística amplia y licencia permisiva. Al estar publicado bajo licencia Apache 2.0 y en formato GGUF, puede desplegarse con llama.cpp, Ollama o cualquier runtime compatible sin depender de servicios en la nube ni de GPU de centro de datos. El repositorio incluye 24 cuantizaciones distintas, desde IQ1_S (1,9 GB) hasta Q6_K (6,3 GB), lo que permite ajustar el equilibrio entre tamaño, velocidad y calidad según el hardware disponible.

La relevancia actual del modelo radica en su combinación de especialización (traducción, no un modelo generalista), amplitud idiomática poco habitual en modelos de 7B y licencia Apache 2.0, que facilita su integración en productos comerciales. La cuantización con imatrix de mradermacher añade valor práctico al permitir ejecutar el modelo en GPU de consumo con pérdida de calidad controlada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base tencent/Hy-MT3-7B); detalles internos no disponibles |
| Parametros totales | 7.504.568.320 (7,5 mil millones) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K_S, Q2_K, IQ3_XXS, IQ3_XS, Q3_K_S, IQ3_S, IQ3_M, Q3_K_M, Q3_K_L, IQ4_XS, Q4_0, IQ4_NL, Q4_K_S, Q4_K_M, Q4_1, Q5_K_S, Q5_K_M, Q6_K (todas con imatrix) |
| Idiomas soportados | Más de 90 idiomas, entre ellos: chino, inglés, español, francés, alemán, italiano, portugués, ruso, japonés, coreano, árabe, hindi, turco, vietnamita, tailandés, indonesio, malayo, neerlandés, polaco, ucraniano, checo, rumano, húngaro, griego, hebreo, persa, urdu, bengalí, tamil, telugu, guyaratí, maratí, camboyano, birmano, cebuano, waray, gaélico escocés, irlandés, galés, euskera, catalán, gallego, esperanto y otras lenguas de bajos recursos |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones i1 con imatrix); el modelo base original usa safetensors |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base tencent/Hy-MT3-7B más allá de que se trata de un transformer de aproximadamente 7,5 mil millones de parámetros. No se especifican el número de capas, la dimensión oculta, el mecanismo de atención ni si incorpora innovaciones como atención lineal o decodificación especulativa. Tampoco se documentan el volumen de tokens de entrenamiento, la composición del corpus ni si se aplicaron técnicas de alineación como RLHF o DPO.

Lo que sí está documentado es el proceso de cuantización. mradermacher ha generado las cuantizaciones i1 utilizando una matriz de importancia (imatrix) calculada sobre el modelo, un fichero de 0,1 GB incluido en el repositorio. Este enfoque permite que las cuantizaciones de baja precisión (especialmente las de la familia IQ) conserven mejor la calidad que las cuantizaciones estáticas equivalentes en tamaño. El autor indica que las cuantizaciones IQ suelen ser preferibles a las no-IQ de tamaño similar y que, por ejemplo, IQ3_S supera a las Q3_K* y IQ4_XS es preferible a IQ4_NL. También ofrece cuantizaciones estáticas en el repositorio mradermacher/Hy-MT3-7B-GGUF.

## Capacidades

- Traducción automática multilingüe entre más de 90 idiomas, incluyendo pares que no involucran al inglés y lenguas de bajos recursos.
- Traducción bidireccional: el modelo acepta instrucciones conversacionales, por lo que puede formularse como tarea de traducción directa o inversa.
- Cobertura de lenguas europeas (español, catalán, gallego, euskera, francés, alemán, italiano, portugués, neerlandés, polaco, checo, rumano, húngaro, griego, sueco, finés, danés, noruego, islandés, letón, lituano, estonio, esloveno, croata, serbio, búlgaro, macedonio, albanés, maltés, luxemburgués, galés, irlandés, gaélico escocés, esperanto).
- Cobertura de lenguas asiáticas y de Oriente Medio (chino, japonés, coreano, árabe, hebreo, persa, urdu, hindi, bengalí, tamil, telugu, guyaratí, maratí, punyabí, cingalés, nepalí, camboyano, birmano, tailandés, vietnamita, indonesio, malayo, tagalo, cebuano, waray, javanés, sondanés).
- Cobertura de lenguas africanas y de Asia Central (suajili, amhárico, somalí, malgache, hausa no listado, kazajo, kirguís, uzbeko, turcomano, tayiko, mongol, tibetano, uigur).
- Modo conversacional: la etiqueta `conversational` indica que el modelo acepta plantillas de chat para formular la tarea de traducción.
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` sugiere que puede servirse mediante APIs compatibles con el formato de Hugging Face.
- No se documentan capacidades de tool calling, razonamiento multi-paso, visión, audio ni modo de pensamiento (thinking mode).

## Casos de uso

- Traducción de documentación técnica en pipelines de CI/CD: el modelo puede traducir ficheros Markdown o recursos de localización entre los más de 90 idiomas soportados, ejecutándose localmente con llama.cpp y evitando el envío de contenido propietario a servicios externos. Las cuantizaciones Q4_K_M (4,7 GB) ofrecen un equilibrio adecuado entre calidad y velocidad para este flujo.
- Localización de aplicaciones móviles y webs: con soporte para catalán, gallego, euskera y español, resulta útil para mercados con varias lenguas oficiales; la licencia Apache 2.0 permite integrarlo en productos comerciales sin obligación de liberar el código.
- Traducción de atención al cliente en tiempo real: desplegado en una GPU de consumo con la cuantización IQ4_XS (4,3 GB), puede traducir mensajes de chat entrantes en decenas de idiomas antes de que un agente humano los revise, reduciendo la dependencia de APIs de traducción de pago.
- Procesamiento de corpus multilingües para investigación: investigadores que necesitan normalizar o alinear datasets en lenguas de bajos recursos (camboyano, birmano, cebuano, waray) pueden ejecutar el modelo en local sin cuotas de API ni restricciones de envío de datos.
- Traducción de subtítulos y transcripciones: el modelo puede procesar segmentos de texto cortos de forma secuencial; con cuantizaciones Q5_K_M o Q6_K se maximiza la calidad para contenido editorial donde la fidelidad es prioritaria.
- Generación de datasets sintéticos de traducción: al ser un modelo especializado y con licencia permisiva, puede emplearse para crear pares de entrenamiento en idiomas con poca disponibilidad de corpus paralelos, siempre que se valide la calidad de la salida.
- Despliegue en entornos sin conectividad: la versión GGUF permite ejecutar el modelo en estaciones de trabajo aisladas o en el borde (edge), algo inviable con el modelo original en safetensors de mayor tamaño.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio cuantizado no incluye métricas de calidad de traducción (BLEU, COMET, chrF) ni comparaciones con otros modelos, y la información proporcionada no contiene datos del modelo base tencent/Hy-MT3-7B que permitan presentar una tabla de rendimiento.

## Requisitos de hardware

- VRAM estimada para inferencia: entre 2 y 3 GB para IQ1_S/IQ2_XXS; entre 3 y 4 GB para IQ3_M/Q3_K_M; entre 4,5 y 5,5 GB para Q4_K_M/Q5_K_M; alrededor de 6,5-7 GB para Q6_K (incluyendo overhead de contexto y caché KV, que depende de la longitud de contexto configurada).
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080, RTX 4090 para despliegue en consumo; A100 o H100 para servir muchas peticiones concurrentes con vLLM u otro servidor de inferencia.
- Cabe en GPU de consumo: sí. Las cuantizaciones Q4_K_M (4,7 GB) y Q5_K_M (5,5 GB) caben en GPU con 8 GB de VRAM; Q6_K (6,3 GB) requiere al menos 8 GB y holgura para el contexto.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui y cualquier runtime compatible con GGUF. Para el modelo base en safetensors, transformers con aceleración por GPU; para servir a escala, vLLM o TGI con los pesos originales.
- Latencia y throughput estimados: no disponibles. Dependen del hardware, la cuantización y la longitud de las secuencias; a modo orientativo, un modelo de 7B en Q4_K_M sobre una RTX 4090 suele generar decenas de tokens por segundo, pero no se dispone de mediciones publicadas para este modelo concreto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato disponible |
|---|---|---|---|---|---|
| Hy-MT3-7B-i1-GGUF (este) | 7,5 mil millones | No disponible | Más de 90 | Apache 2.0 | GGUF (24 cuantizaciones) |
| Modelo base tencent/Hy-MT3-7B | 7,5 mil millones | No disponible | Más de 90 | Apache 2.0 | Safetensors |
| NLLB-200 (Meta) | 600M a 54B (varias tallas) | 512 tokens (típico) | 200 | CC-BY-NC 4.0 (no comercial) | Safetensors, GGUF vía conversión comunitaria |
| M2M-100 (Meta) | 418M a 12B | 1024 tokens (típico) | 100 | MIT | Safetensors |

La comparación con NLLB-200 y M2M-100 es la más directa por tratarse de modelos dedicados a traducción multilingüe. Hy-MT3-7B ofrece licencia Apache 2.0 (frente a la CC-BY-NC de NLLB-200, que restringe el uso comercial) y un rango de cuantizaciones GGUF listas para usar, mientras que NLLB-200 cubre más idiomas (200 frente a más de 90). No se dispone de datos de benchmarks que permitan comparar la calidad de traducción entre estos modelos.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información disponible; como todo modelo entrenado con corpus web, es probable que herede sesgos de género, culturales y geográficos, especialmente en lenguas de bajos recursos con menos datos de entrenamiento.
- Riesgo de alucinación: en tareas de traducción, el riesgo se manifiesta como omisiones, adiciones o traducciones inventadas, particularly en pares de idiomas con pocos datos y en cuantizaciones muy agresivas (IQ1_S, IQ2_XXS), donde la calidad se degrada de forma notable.
- Limitaciones de contexto: la longitud de contexto no está documentada; para documentos largos conviene segmentar el texto y traducir por fragmentos, verificando la coherencia entre segmentos.
- Limitaciones de idioma: aunque se listan más de 90 idiomas, la calidad no es uniforme; las lenguas con menos recursos (cebuano, waray, gaélico escocés, camboyano, birmano) probablemente rinden peor que los pares con inglés, español, chino o francés.
- Restricciones de licencia: la licencia Apache 2.0 permite uso comercial, modificación y redistribución con atribución; no obstante, conviene revisar la licencia del modelo base tencent/Hy-MT3-7B por si impone condiciones adicionales no reflejadas en el repositorio cuantizado.
- Caveats para producción: las cuantizaciones por debajo de Q4 pierden calidad de forma perceptible; para traducción profesional se recomienda Q5_K_M o Q6_K. El repositorio tiene 87,8 GB por incluir todas las variantes, por lo que debe descargarse solo el fichero GGUF necesario. La fecha de creación del repositorio (2026-11-25) es posterior a la fecha actual en algunos contextos, lo que puede indicar un error en los metadatos de la plataforma.
- No se documentan capacidades de tool calling ni de agentes; no debe asumirse que el modelo pueda ejecutar funciones o razonamiento multi-paso fuera de la tarea de traducción.

## Enlaces

- Repositorio Hugging Face del modelo cuantizado: https://huggingface.co/mradermacher/Hy-MT3-7B-i1-GGUF
- Modelo base en Hugging Face: https://huggingface.co/tencent/Hy-MT3-7B
- Cuantizaciones estáticas del mismo modelo: https://huggingface.co/mradermacher/Hy-MT3-7B-GGUF
- Página de descargas del autor: https://hf.tst.eu/model#Hy-MT3-7B-i1-GGUF
- README de referencia sobre uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Guía sobre tipos de cuantización de Artefact2: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Peticiones de cuantización de mradermacher: https://huggingface.co/mradermacher/model_requests
- Empresa del autor de las cuantizaciones: https://www.nethype.de/
