# mradermacher/AxonMed-32B-Flash-i1-GGUF

## Resumen

AxonMed-32B-Flash-i1-GGUF es la versión cuantizada en formato GGUF del modelo AxonMed-32B-Flash, desarrollado originalmente por Saathimed y cuantizado por mradermacher. Se trata de un modelo de lenguaje de aproximadamente 32.760 millones de parámetros orientado al dominio médico y clínico, con capacidades declaradas de razonamiento, soporte de decisiones clínicas, procesamiento de historiales médicos electrónicos (EHR) y conocimiento derivado de PubMed. La versión que nos ocupa es una recuantización con imatrix (i1) que ofrece un abanico amplio de niveles de compresión, desde IQ1_S hasta Q6_K.

El modelo base emplea una arquitectura transformer densa (no MoE) de 32B parámetros, presumiblemente derivada de una familia tipo Qwen2.5-32B o similar, aunque la información disponible no confirma la arquitectura exacta ni la longitud de contexto. La licencia Apache 2.0 facilita su uso comercial, y el etiquetado multilingüe incluye inglés, chino, español, ruso, noruego, francés, italiano, portugués y alemán.

La relevancia de esta ficha radica en que ofrece una vía práctica para desplegar un modelo médico de 32B en hardware de consumo o servidores modestos mediante cuantización GGUF, algo imposible con los pesos originales en safetensors (que ocupan decenas de GB). El repositorio acumula casi 3.000 descargas, lo que indica interés real en la comunidad.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer densa (familia no confirmada; probablemente derivada de un modelo base de 32B tipo Qwen2.5) |
| Parámetros totales | 32.763.876.352 (~32,76B) |
| Parámetros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K_S, Q2_K, IQ3_XXS, IQ3_XS, Q3_K_S, IQ3_S, IQ3_M, Q3_K_M, Q3_K_L, IQ4_XS, Q4_0, Q4_K_S, Q4_K_M, Q4_1, Q5_K_S, Q5_K_M, Q6_K (todas i1/imatrix) |
| Idiomas soportados | en, zh, es, ru, no, fr, it, pt, de |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo base en la documentación proporcionada. Por el tamaño (32,76B parámetros) y la nomenclatura "32B", se trata con alta probabilidad de un transformer denso de la familia Qwen2.5-32B o similar, pero este dato no está confirmado. Tampoco se especifican el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF, DPO o ajuste supervisado específico para el dominio médico.

La innovación técnica destacable de esta versión concreta es el proceso de cuantización con imatrix (importance matrix) realizado por mradermacher, que permite generar cuantizaciones de baja precisión (incluso IQ1) con una pérdida de calidad más controlada que las cuantizaciones estáticas tradicionales. El repositorio incluye el fichero imatrix para que otros puedan generar sus propias cuantizaciones. También existe una versión con cuantizaciones estáticas en el repositorio hermano `mradermacher/AxonMed-32B-Flash-GGUF`.

## Capacidades

- Generación de texto y razonamiento clínico en el dominio médico.
- Soporte declarado para decisiones clínicas (clinical decision support).
- Procesamiento de historiales médicos electrónicos (EHR) y conocimiento derivado de PubMed.
- Etiquetado explícito para evaluación en USMLE (examen médico de EE. UU.).
- Capacidades multilingües en nueve idiomas: inglés, chino, español, ruso, noruego, francés, italiano, portugués y alemán.
- Conversación multi-turno (tag `conversational`).
- Compatibilidad con endpoints (tag `endpoints_compatible`) y con llama.cpp.
- No se declara soporte explícito de tool calling, function calling, agentes, visión, audio ni modo thinking en la información disponible.

## Casos de uso

- Asistencia a la documentación clínica: el modelo puede redactar y estructurar notas clínicas a partir de datos de EHR, aprovechando su ajuste al dominio médico para mantener terminología correcta y formato SOAP.
- Soporte a la decisión clínica en entornos de investigación: dado su etiquetado USMLE y PubMed, puede emplearse para generar hipótesis diagnósticas diferenciales y resúmenes de evidencia, siempre con supervisión humana.
- Búsqueda y resumen de literatura biomédica: con contexto suficiente (no confirmado), puede resumir artículos de PubMed y extraer hallazgos relevantes para revisión sistemática.
- Formación médica y simulación de casos: útil para generar preguntas tipo USMLE y explicaciones razonadas, como herramienta de estudio para estudiantes de medicina.
- Traducción y adaptación de contenido sanitario multilingüe: al cubrir nueve idiomas, puede traducir material clínico entre inglés, español, francés, alemán, etc., manteniendo terminología especializada.
- Despliegue en entornos con recursos limitados: gracias a las cuantizaciones GGUF (desde 7,4 GB en IQ1_S hasta 27 GB en Q6_K), puede ejecutarse en estaciones de trabajo con una sola GPU consumer o incluso en CPU, algo inviable con los pesos originales.
- Prototipado de asistentes sanitarios en investigación: integrable vía llama.cpp u Ollama para pruebas de concepto de chatbots médicos antes de escalar a infraestructura mayor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia según cuantización (pesos + overhead de contexto, aproximadamente):
  - IQ1_S (7,4 GB): ~9-10 GB en GPU; viable en RTX 3060 12 GB, RTX 4060 Ti 16 GB.
  - IQ2_M (11,4 GB): ~13-14 GB; requiere RTX 4080 16 GB o RTX 4090 24 GB.
  - Q3_K_M (16,0 GB) / IQ3_M (14,9 GB): ~17-19 GB; RTX 4090 24 GB.
  - Q4_K_M (20,0 GB): ~22-24 GB; RTX 4090 24 GB al límite, mejor A6000 48 GB.
  - Q5_K_M (23,4 GB): ~26 GB; A6000 48 GB o dos GPUs.
  - Q6_K (27,0 GB): ~30 GB; A6000 48 GB, A100 40 GB.
- GPU recomendadas: RTX 4090 (24 GB) para Q3-Q4; A6000 (48 GB) o A100 40/80 GB para Q5-Q6; H100 para máxima calidad y throughput.
- Cabe en GPU consumer: sí, en cuantizaciones IQ1-IQ3 (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4080 16 GB, RTX 4090 24 GB).
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python; los pesos originales del modelo base son compatibles con transformers, vLLM y TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| AxonMed-32B-Flash-i1-GGUF | 32,76B | No disponible | Apache 2.0 | GGUF | Especializado en dominio médico, multilingüe (9 idiomas) |
| Modelo base AxonMed-32B-Flash | 32,76B | No disponible | Apache 2.0 | Safetensors | Pesos completos, requiere hardware mayor |
| Otros LLM médicos de ~32B | No disponible | No disponible | No disponible | No disponible | No se dispone de datos comparativos verificables en la información proporcionada |

No se dispone de información suficiente para comparar con alternativas concretas de la misma categoría (por ejemplo, Meditron, BioMistral o Med42) sin inventar datos. Se recomienda consultar el Open Medical LLM Leaderboard para obtener comparativas verificadas.

## Limitaciones y advertencias

- Modelo médico: no debe usarse como sustituto del juicio clínico profesional; cualquier salida requiere validación por personal sanitario cualificado.
- Riesgo de alucinación: como todo LLM, puede generar información médica plausible pero incorrecta; el riesgo es especialmente crítico en dosis, diagnósticos y contraindicaciones.
- Sesgos: no se documentan sesgos específicos, pero el modelo hereda los de su corpus de entrenamiento (probablemente sobrerrepresentación de literatura en inglés y de poblaciones occidentales).
- Contexto: la longitud de contexto no está confirmada; no se debe asumir una ventana larga sin verificación empírica.
- Idiomas: aunque se declaran nueve idiomas, la calidad relativa por idioma no está documentada; el rendimiento en noruego o ruso podría ser inferior al del inglés.
- Cuantizaciones muy bajas (IQ1, IQ2, Q2_K): degradación notable de calidad; no recomendadas para uso clínico real, solo para experimentación.
- Licencia Apache 2.0: permite uso comercial, pero la responsabilidad regulatoria (MDR en la UE, FDA en EE. UU.) recae en el desplegador si se usa en contexto sanitario.
- Fecha de creación del repositorio (2026-11-19): verificar vigencia y posibles actualizaciones del modelo base.
- No se declara soporte de tool calling ni agentes; no asumir estas capacidades sin pruebas.

## Enlaces

- Repositorio Hugging Face (esta versión): https://huggingface.co/mradermacher/AxonMed-32B-Flash-i1-GGUF
- Modelo base: https://huggingface.co/Saathimed/AxonMed-32B-Flash
- Cuantizaciones estáticas del mismo modelo: https://huggingface.co/mradermacher/AxonMed-32B-Flash-GGUF
- Página de descargas del cuantizador: https://hf.tst.eu/model#AxonMed-32B-Flash-i1-GGUF
- README de referencia para uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Gráfica comparativa de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- FAQ y peticiones de cuantización: https://huggingface.co/mradermacher/model_requests
- nethype GmbH (patrocinador del cuantizador): https://www.nethype.de/
