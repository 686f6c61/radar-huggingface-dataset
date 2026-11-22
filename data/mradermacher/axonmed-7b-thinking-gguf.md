# mradermacher/AxonMed-7B-Thinking-GGUF

## Resumen

AxonMed-7B-Thinking es un modelo de lenguaje especializado en razonamiento clínico y médico, desarrollado por Saathimed y publicado originalmente en formato transformers. Esta ficha corresponde a la versión cuantizada en GGUF realizada por mradermacher, que facilita su despliegue en entornos con recursos limitados mediante llama.cpp y herramientas compatibles. Con 7.615.616.512 parámetros (aproximadamente 7,6 mil millones), se posiciona en la gama de modelos de 7B, un tamaño que equilibra capacidad de razonamiento y requisitos de hardware.

El modelo está diseñado explícitamente para tareas de razonamiento clínico con modo "thinking" (cadena de pensamiento o CoT), orientado a exámenes médicos como USMLE, AIIMS y NEET-PG, además de tareas de comprensión de literatura biomédica (PubMedQA). Se entrenó sobre datasets de referencia del dominio médico como MedMCQA, MedQA-USMLE-4-options, PubMedQA, medical-o1-reasoning-SFT y medical_meadow_usmle_self_assessment.

Su relevancia actual radica en la combinación de tres factores: especialización vertical en dominio médico, soporte multilingüe declarado (inglés, hindi, español, chino, alemán, francés y ruso) y licencia Apache 2.0, que permite uso comercial sin restricciones adicionales. La disponibilidad de cuantizaciones GGUF desde Q2_K (3,1 GB) hasta f16 (15,3 GB) lo hace desplegable tanto en GPUs de consumo como en servidores.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base derivado de un transformer de 7B; detalles no especificados en la informacion) |
| Parametros totales | 7.615.616.512 (aproximadamente 7,6B) |
| Parametros activos | no aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 (estaticas); variantes i1 (imatrix) en repo separado |
| Idiomas soportados | en, hi, es, zh, de, fr, ru |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (version cuantizada); el modelo base esta en transformers/safetensors |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo base Saathimed/AxonMed-7B-Thinking en la informacion proporcionada. Por el numero de parametros (7,6B) y la libreria declarada (transformers), se trata de un transformer decoder-only de escala 7B, pero no se especifican detalles como el numero de capas, dimensiones ocultas, mecanismo de atencion ni si incorpora innovaciones como atencion lineal o decodificacion especulativa.

Respecto al entrenamiento, la model card lista los datasets utilizados: MedMCQA, GBaker/MedQA-USMLE-4-options, PubMedQA, FreedomIntelligence/medical-o1-reasoning-SFT y medalpaca/medical_meadow_usmle_self_assessment. Estos datasets cubren preguntas de examen medico (USMLE, AIIMS, NEET-PG), razonamiento clinico con cadenas de pensamiento y comprension de literatura biomedica. No se especifica el numero total de tokens de entrenamiento, la composicion exacta del dataset, ni si se aplicaron tecnicas de RLHF, DPO o SFT adicionales. El tag "thinking" y "cot" sugiere que el modelo fue ajustado para generar razonamiento explicito antes de la respuesta final.

## Capacidades

- Razonamiento clinico y medico con modo "thinking" (cadena de pensamiento explicita antes de la respuesta).
- Resolucion de preguntas de examen medico tipo multiple choice (USMLE, AIIMS, NEET-PG).
- Comprension de literatura biomedica y respuesta a preguntas sobre articulos (PubMedQA).
- Generacion de texto conversacional multi-turno (tag "conversational").
- Capacidades multilingues en siete idiomas: ingles, hindi, espanol, chino, aleman, frances y ruso.
- Razonamiento multi-paso orientado a diagnostico y explicacion clinica.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes: no disponible en la informacion proporcionada.
- Capacidades de vision o audio: no disponibles.

## Casos de uso

- Formacion y preparacion de examenes medicos: el modelo puede generar explicaciones razonadas paso a paso para preguntas tipo USMLE o NEET-PG, lo que lo hace util como tutor interactivo para estudiantes de medicina que necesitan entender el razonamiento detras de cada respuesta.
- Apoyo a la documentacion clinica: puede resumir y estructurar notas clinicas o articulos biomedicos, aprovechando su entrenamiento en PubMedQA para tareas de comprension de literatura medica.
- Asistente de triaje conversacional: con su capacidad conversacional multi-turno, puede gestionar dialogos iniciales de recogida de sintomas en varios idiomas, derivando a profesionales cuando sea necesario.
- Investigacion biomedica asistida: extraccion de informacion relevante de abstracts y articulos, generando resumenes con razonamiento explicito sobre la evidencia.
- Despliegue en entornos con hardware limitado: las cuantizaciones Q4_K_M (4,8 GB) permiten ejecutar el modelo en GPUs de consumo como RTX 3060 o superiores, habilitando prototipos locales de aplicaciones medicas sin depender de la nube.
- Educacion multilingue en ciencias de la salud: al soportar espanol, hindi, chino, aleman, frances y ruso, puede emplearse en programas de formacion medica en distintos mercados linguisticos.
- Generacion de preguntas de evaluacion: el modelo puede crear bancos de preguntas de practica con explicaciones razonadas para plataformas de e-learning medico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin overhead de contexto):
  - Q2_K: aproximadamente 3,1 GB.
  - Q4_K_M: aproximadamente 4,8 GB (recomendado por el cuantizador como rapido y de buena calidad).
  - Q5_K_M: aproximadamente 5,5 GB.
  - Q6_K: aproximadamente 6,4 GB.
  - Q8_0: aproximadamente 8,2 GB.
  - f16: aproximadamente 15,3 GB.
- GPU recomendadas: para Q4_K_M, una RTX 3060 (12 GB) o RTX 4060 Ti (16 GB) es suficiente; para Q8_0, se recomienda RTX 4070 Ti Super o superior; para f16, una RTX 4090 (24 GB) o A100/H100 en entornos de servidor.
- Cabe en GPU de consumo: si, en la mayoria de cuantizaciones (Q2_K a Q6_K) en GPUs con 8 GB o mas de VRAM; Q8_0 requiere al menos 10-12 GB.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, y cualquier runtime compatible con GGUF; el modelo base (transformers) puede servirse con vLLM o TGI, aunque esta ficha corresponde a la version GGUF.
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| AxonMed-7B-Thinking (esta ficha) | 7,6B | no disponible | Apache 2.0 | GGUF / transformers | Especializado en razonamiento clinico con modo thinking |
| Modelos medicos 7B genericos (p. ej. basados en Llama/Mistral) | ~7B | variable | variable | safetensors / GGUF | No disponibles datos concretos en la informacion proporcionada |
| Modelos de razonamiento general 7B | ~7B | variable | variable | safetensors / GGUF | No disponibles datos concretos en la informacion proporcionada |

No se dispone de datos de benchmarks ni de comparativas cuantitativas con alternativas concretas en la informacion proporcionada, por lo que la comparacion se limita a caracteristicas estructurales.

## Limitaciones y advertencias

- No se han publicado resultados de benchmarks que permitan validar cuantitativamente su rendimiento clinico; la ausencia de datos de evaluacion es una limitacion importante para su adopcion en produccion sanitaria.
- Riesgo de alucinacion: como todo modelo de lenguaje, puede generar afirmaciones medicas incorrectas con aparente seguridad; no debe usarse como sustituto del juicio clinico profesional.
- Sesgos conocidos: no documentados en la informacion proporcionada; los datasets medicos de entrenamiento pueden introducir sesgos demograficos y geograficos (predominio de fuentes en ingles y de sistemas sanitarios concretos).
- Limitaciones de contexto: la longitud de contexto no esta especificada, lo que impide evaluar su idoneidad para documentos clinicos largos.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el uso en entornos regulados (dispositivos medicos, diagnostico) requiere cumplimiento normativo adicional (MDR en la UE, FDA en EE. UU.) que la licencia no cubre.
- El modelo esta cuantizado en GGUF; las cuantizaciones de baja calidad (Q2_K, Q3_K_M) pueden degradar notablemente el razonamiento, algo especialmente critico en dominio medico.
- Idiomas: aunque declara soporte de siete idiomas, no se especifica el nivel de calidad por idioma; el espanol podria tener menor cobertura que el ingles.
- No hay informacion sobre soporte de tool calling ni sobre integracion con agentes, lo que limita su uso en pipelines automatizados complejos.

## Enlaces

- Modelo cuantizado en Hugging Face: https://huggingface.co/mradermacher/AxonMed-7B-Thinking-GGUF
- Modelo base original: https://huggingface.co/Saathimed/AxonMed-7B-Thinking
- Cuantizaciones i1 (imatrix): https://huggingface.co/mradermacher/AxonMed-7B-Thinking-i1-GGUF
- Pagina de descripcion del cuantizador: https://hf.tst.eu/model#AxonMed-7B-Thinking-GGUF
- FAQ y solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
