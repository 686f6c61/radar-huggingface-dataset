# Akahsizrr/AIAAH-1-RL-DPO-iter0

## Resumen

AIAAH-1-RL-DPO-iter0 es un modelo de lenguaje decoder-only con arquitectura LlamaForCausalLM de 42 capas, publicado por el usuario Akahsizrr en HuggingFace. Corresponde a la iteración 0 de un ciclo de ajuste por DPO iterativo (estilo lazyrlGYM) aplicado sobre el modelo base AIAAH-1, orientado a mejorar la alineación y el comportamiento en razonamiento científico, matemáticas y código agéntico mediante pares de preferencia obtenidos en rollouts con decodificación especulativa.

Los pesos en safetensors suman 2.516.756.480 parámetros (~2,52B), aunque la model card declara "~3B" para el modelo base; el repositorio ocupa 5,0 GB y se distribuye bajo licencia Apache 2.0. El entrenamiento usa LoRA (r=32, alpha=64) con solo 303 pares de preferencia en esta iteración y una configuración DPO de beta=0,1, learning rate 5e-6, 2 épocas, batch size 2 y acumulación de gradiente 4.

Su relevancia es fundamentalmente metodológica: documenta un pipeline completo de DPO iterativo acoplado a decodificación especulativa con SGLang y un draft model DSpark de ~323M parámetros, con tasas de aceptación del 28-46% y hasta 467 tokens/s. No obstante, se trata de un artefacto experimental con 0 descargas y 0 "likes", sin sección de uso en la model card, sin longitud de contexto documentada y con evaluaciones sobre muestras muy pequeñas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LlamaForCausalLM (transformer decoder-only, 42 capas) |
| Parametros totales | 2.516.756.480 (~2,52B) segun safetensors; la model card declara "~3B" para el modelo base |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio solo publica safetensors sin cuantizar; no hay GGUF ni GPTQ/AWQ) |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Modelo base | Akahsizrr/AIAAH-1 (fine-tune) |
| Modelo draft asociado | Akahsizrr/MiniCPM5-2B-DSpark-continued-step200 (Qwen3DSparkModel, ~323M parametros) |
| Tamano del repositorio | 5,0 GB |
| Pipeline declarado | reinforcement-learning |
| Fecha de publicacion | 2026-09-10 |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only denso tipo Llama (LlamaForCausalLM) con 42 capas. No se especifica el vocabulario, la dimensión oculta, el número de cabezas de atención ni la ventana de contexto, y no hay indicios de atención lineal, SSM ni mezcla de expertos. El modelo se obtiene por ajuste del checkpoint AIAAH-1 mediante DPO iterativo con adaptadores LoRA de rango 32 y alpha 64, en lugar de un reentrenamiento completo.

Los datos de partida son un corpus de 537K prompts compuesto por trazas de destilación de Qwen, GLM y Kimi, junto con datos de matemáticas de GLM-5.3, código agéntico de Fable-5, LiveCodeBench y AIME 2026. En esta iteración 0 solo se generaron 303 pares de preferencia, con beta=0,1, learning rate 5e-6, 2 épocas, batch size 2 y acumulación de gradiente 4. La innovación operativa destacable es el uso de SGLang con decodificación especulativa DSpark para producir los rollouts de entrenamiento, empleando un draft model de ~323M parámetros (Qwen3DSparkModel) que después se reutiliza en inferencia con tasas de aceptación del 28-46% y longitudes de aceptación de 2,95 a 4,20 tokens.

## Capacidades

- Generación de texto en inglés con foco en razonamiento científico y matemático (evaluado en GPQA Diamond y AIME 2026).
- Razonamiento matemático de competición, con datos de entrenamiento procedentes de AIME 2026 y GLM-5.3 math.
- Generación de código, incluyendo escenarios agénticos derivados de trazas de Fable-5 y LiveCodeBench.
- Soporte de decodificación especulativa como modelo objetivo, emparejado con el draft model DSpark de ~323M parámetros bajo SGLang.
- Ajuste de alineación por preferencias humanas/sintéticas mediante DPO, orientado a mejorar la calidad de respuesta frente al checkpoint base.
- Capacidades multilingües: no disponibles; el modelo declara únicamente inglés (en).
- Tool calling, function calling y modo "thinking": no documentados en la información disponible.
- Visión, audio y otras modalidades: no disponibles.

## Casos de uso

- Reproducción de bucles de DPO iterativo: el modelo sirve como referencia práctica de un ciclo completo (iteración 0 con 303 pares de preferencia, LoRA r=32/alpha=64, beta=0,1) para equipos de investigación que quieran replicar la metodología lazyrlGYM a pequeña escala antes de escalarla.
- Investigación en decodificación especulativa: permite estudiar emparejamientos target/draft con DSpark y medir tasas de aceptación (28-46%) y longitud de aceptación (2,95-4,20) en cargas reales con SGLang.
- Evaluación de razonamiento científico en inglés: útil como sujeto de prueba en baterías tipo GPQA Diamond para analizar cómo el DPO afecta a dominios de conocimiento especializado, dado que el autor reporta el delta exacto.
- Generación de código asistida en pipelines internos: al haberse entrenado con trazas de LiveCodeBench y código agéntico, puede integrarse como generador de parches o tests en flujos de revisión, siempre con validación humana y ejecución en sandbox.
- Prototipado y experimentación en una única GPU de consumo: con ~2,52B parámetros, los pesos en FP16 ocupan unos 5 GB, lo que permite desplegarlo en tarjetas de 12-16 GB para pruebas de alineación y prompts.
- Generación de datos sintéticos y destilación: el modelo puede emplearse para producir trazas candidatas que después se filtren como pares de preferencia en iteraciones posteriores del mismo pipeline.
- Servicio de inferencia de alto throughput en inglés: con SGLang y el draft DSpark el autor reporta hasta 467 tokens/s, adecuado para entornos de demostración o generación masiva por lotes donde la latencia no sea crítica.
- Estudio de regresiones por sobreajuste de preferencias: el descenso en AIME 2026 (-3,3 puntos) lo convierte en un caso útil para analizar cómo pocos pares de preferencia pueden degradar una capacidad concreta.

## Benchmarks y rendimiento

| Benchmark | Baseline (AIAAH-1) | Tras DPO (iter0) | Delta |
|---|---|---|---|
| GPQA Diamond (50 preguntas) | 22,4% | 24,5% | +2,0 puntos |
| GPQA Diamond (198 preguntas) | 22,4% | 22,8% | +0,3 puntos |
| AIME 2026 (30 preguntas) | 13,3% | 10,0% | -3,3 puntos |

Datos de decodificación especulativa (SGLang + DSpark, hardware no especificado):

| Metrica | Valor |
|---|---|
| Tasa de aceptacion | 28-46% |
| Longitud de aceptacion | 2,95-4,20 tokens |
| Throughput maximo reportado | hasta 467 tokens/s |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks en la información disponible.

## Requisitos de hardware

Estimaciones de VRAM para los pesos (calculadas a partir de los 2.516.756.480 parámetros; la longitud de contexto es desconocida, por lo que el coste de la caché KV no puede acotarse):

| Precision | VRAM aproximada solo para pesos |
|---|---|
| FP32 | ~10,1 GB |
| FP16 / BF16 | ~5,0 GB |
| INT8 | ~2,5 GB |
| INT4 | ~1,4-1,6 GB (incluyendo escalas y overhead) |

- Cabe en GPU de consumo: sí, en FP16 en tarjetas con 8-12 GB o más (RTX 3060 12 GB, RTX 4070, RTX 4080, RTX 4090) siempre que la ventana de contexto y el batch sean moderados.
- GPU recomendadas para servicio: A100 40/80 GB, H100, L40S o RTX 4090 para cargas pequeñas; al ser un modelo de ~2,5B no requiere memoria de clase servidor.
- Despliegue: la model card solo documenta y valida SGLang junto con el draft model DSpark; vLLM, TGI, llama.cpp u Ollama no están documentados. Al no publicarse pesos GGUF, ONNX ni cuantizaciones GPTQ/AWQ, usar llama.cpp u Ollama exigiría convertir los safetensors.
- Latencia y throughput: hasta 467 tokens/s con SGLang + DSpark según el autor, sin especificar el hardware empleado; no hay cifras de latencia por token ni de throughput en modo no especulativo.
- Requisito adicional: para reproducir la decodificación especulativa hay que cargar también el draft model Akahsizrr/MiniCPM5-2B-DSpark-continued-step200 (~323M parámetros), que añade aproximadamente 0,6-1,3 GB en FP16/INT8.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye comparaciones con otros modelos de la misma categoría (ni parámetros, ni contexto, ni benchmarks de terceros). La única comparación cuantitativa publicada es la del propio modelo contra su checkpoint base AIAAH-1, recogida en la sección de benchmarks. Tampoco se documentan la longitud de contexto ni el vocabulario, datos necesarios para una comparación técnica rigurosa con alternativas de tamaño similar.

## Limitaciones y advertencias

- Evidencia estadística muy débil: la evaluación se limita a 50 y 198 preguntas de GPQA Diamond y 30 de AIME 2026; la mejora de +0,3 puntos en la muestra de 198 preguntas es compatible con ruido estadístico.
- Regresión medida en matemáticas: AIME 2026 cae de 13,3% a 10,0% tras el DPO, lo que sugiere que el ajuste de preferencias degrada capacidades de razonamiento ya presentes en el modelo base.
- Corpus de preferencias mínimo: solo 303 pares en la iteración 0, una cifra muy baja para extraer conclusiones estables sobre alineación.
- Idioma único: soporte exclusivo de inglés; no hay evidencia de rendimiento en castellano ni en otros idiomas.
- Contexto desconocido: la longitud de contexto no se documenta, lo que impide garantizar conversaciones multi-turno largas o procesamiento de documentos extensos.
- Riesgo de alucinación: no se han publicado evaluaciones de veracidad, tasa de alucinación ni comportamiento en dominios fuera de GPQA/AIME; no hay datos que permitan acotar este riesgo.
- Sesgos: no se documenta ningún análisis de sesgos, toxicidad o seguridad, ni procesos de filtrado del corpus de destilación.
- Trazabilidad del entrenamiento: los datos incluyen trazas de destilación de Qwen, GLM y Kimi; conviene revisar las licencias de esos modelos y de los datasets derivados antes de un uso comercial, aunque la licencia del repositorio sea Apache 2.0.
- Herramientas: no hay información sobre tool calling, plantillas de prompt, tokens especiales ni sección de uso con ejemplos de código; la model card deja el apartado "Usage" vacío.
- Madurez: 0 descargas y 0 "likes", publicación muy reciente y sin validación por terceros; no es un artefacto listo para producción sin evaluación propia.
- Dependencia del draft model: el rendimiento de la decodificación especulativa está ligado a un checkpoint concreto (MiniCPM5-2B-DSpark-continued-step200) y a SGLang; otros motores no están validados.
- Fechas y nomenclatura de los datos de entrenamiento (GLM-5.3, AIME 2026) provienen únicamente de la model card y no han podido contrastarse con fuentes independientes.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Akahsizrr/AIAAH-1-RL-DPO-iter0
- Modelo base: https://huggingface.co/Akahsizrr/AIAAH-1
- Modelo draft para decodificación especulativa: https://huggingface.co/Akahsizrr/MiniCPM5-2B-DSpark-continued-step200
- Paper, blog o repositorio adicionales: no disponible (la búsqueda web no devolvió resultados relevantes sobre este modelo).
