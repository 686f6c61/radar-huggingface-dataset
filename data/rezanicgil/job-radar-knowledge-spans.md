# rezanicgil/job-radar-knowledge-spans

## Resumen

Job Radar knowledge spans es un modelo de etiquetado de tokens (token classification) desarrollado por rezanicgil que identifica menciones de herramientas y areas de conocimiento dentro de descripciones de ofertas de empleo, siguiendo el esquema de anotacion SkillSpan. El modelo parte del encoder multilingue MoritzLaurer/multilingual-MiniLMv2-L6-mnli-xnli y afina su ultima capa mas una cabeza de clasificacion sobre las etiquetas de conocimiento del dataset SkillSpan. Con 106,8 millones de parametros y un diseno ligero, esta pensado como componente de extraccion dentro de un pipeline mayor de analisis de ofertas laborales (el proyecto Job Radar), no como modelo generativo.

Su relevancia es doble. Por un lado, es un ejemplo reproducible de un flujo completo de entrenamiento, calibracion y evaluacion con scripts publicos y checkpoints fijados. Por otro, publica de forma transparente resultados modestos (F1 exacto de 22,9% en test ingles) frente a la referencia JobBERT (62,5%), lo que lo convierte en un caso util para estudiar los limites del ajuste fino sobre un encoder pequeno y de la calibracion de umbrales. El modelo solo declara ingles como idioma de entrenamiento, aunque el autor mide por separado un comportamiento exploratorio en turco.

La ficha describe exclusivamente lo que el autor documenta en la model card; cualquier dato no publicado se marca como no disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (MiniLMv2-L6, 6 capas) con cabeza de token classification (BIO) |
| Parametros totales | 106.847.235 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (entrada dividida por limites de palabra en el script del autor) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Ingles (entrenamiento); turco solo en evaluacion exploratoria |
| Licencia | MIT |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo es un encoder transformer MiniLMv2 de 6 capas (variante multilingue entrenada originalmente con NLI/XNLI) al que se anade una cabeza de clasificacion token a token con etiquetas B, I y O para spans de conocimiento. Se afina la ultima capa del encoder y la cabeza; el resto del encoder permanece congelado segun la descripcion del autor. La revision del encoder base esta fijada en `0a71e92a985b6e1ad1828cf67ce9c459639c1dca`.

El entrenamiento usa las anotaciones de conocimiento de SkillSpan (CC BY 4.0), con eliminacion de frases duplicadas normalizadas en orden train/dev/test. Se entrenan dos epocas, se pondera la perdida por token con la inversa de la raiz cuadrada de la frecuencia y se selecciona el checkpoint con mayor F1 exacto en desarrollo. Posteriormente se ajusta un sesgo compartido para B e I solo con el split de desarrollo, explorando valores entre -2 y +2 en pasos de 0,25; el valor elegido es -1,25. La innovacion destacable no es arquitectonica sino metodologica: el pipeline completo (entrenamiento, calibracion y extraccion con offsets de caracteres) es reproducible mediante scripts publicos. El script de extraccion usa el primer subtoken de cada palabra y divide entradas largas por limites de palabra.

## Capacidades

- Etiquetado de spans de conocimiento (herramientas y areas de conocimiento) en texto de ofertas de empleo, con etiquetas B/I/O.
- Extraccion con offsets de caracteres sobre el texto original, gracias al script `extract_knowledge_spans.py`.
- Procesamiento de entradas largas mediante division por limites de palabra.
- Entrenamiento y evaluacion en ingles; el autor mide transferencia exploratoria a turco sobre ejemplos propios.
- No realiza generacion de texto, razonamiento, codigo ni matematicas: es un extractor discriminativo.
- No documenta soporte de tool calling, function calling ni comportamiento de agente.
- No documenta capacidades multimodales (vision, audio) ni modo de razonamiento explicito.

## Casos de uso

- Extraccion de skills en pipelines de ofertas de empleo: dado un anuncio, el modelo marca herramientas y areas de conocimiento para alimentar un indice de habilidades; su tamano reducido permite procesar lotes grandes en CPU.
- Normalizacion previa a matching candidato-oferta: los spans extraidos pueden compararse con el CV de un candidato; el autor advierte que la cobertura del CV se decide por revision humana, no por el modelo.
- Investigacion sobre extraccion de spans: sirve como baseline reproducible y como ejemplo de calibracion de sesgos BIO con split de desarrollo.
- Analisis de tendencias tecnologicas: agregar menciones de herramientas a lo largo de un corpus de anuncios para medir su frecuencia relativa por sector o periodo.
- Prototipado rapido en entornos sin GPU: con 106,8 millones de parametros y pesos safetensors, cabe en CPU y en GPUs de consumo para inferencia por lotes.
- Evaluacion comparativa de encoders: util para contrastar el rendimiento de un MiniLM afinado frente a encoders especificos de dominio como JobBERT con el mismo scorer de limites de palabra.
- Filtrado asistido de anuncios: marcar ofertas que mencionan tecnologias concretas para revision manual posterior, sin tratar las predicciones como verdad definitiva.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre 2.404 frases de test en ingles, con F1 de span exacto (ambos limites de palabra correctos):

| Sistema | Precision | Recall | F1 |
|---|---:|---:|---:|
| Frase memorizada mas larga del entrenamiento | 11,7% | 50,4% | 19,0% |
| Modelo afinado antes de calibracion | 12,8% | 42,1% | 19,6% |
| Modelo publicado (calibrado) | 23,8% | 22,0% | 22,9% |
| Referencia publicada JobBERT | 56,2% | 70,5% | 62,5% |

El modelo publicado recupera 219 de 994 spans de referencia y genera 700 predicciones no emparejadas. En diez ejemplos pareados por idioma creados por el proyecto, encuentra 14 de 18 spans de referencia en cada idioma con cuatro predicciones no emparejadas; por ejemplo, divide "Power BI" en dos spans. En texto turco de ofertas (134 bullets deduplicados de CRENNO y Roof Stacks), recupera 28 de 34 menciones identificadas por diccionario con 314 predicciones totales, frente a 18 de 34 y 359 predicciones de JobBERT. Una epoca adicional con 200 condiciones turcas generadas y 400 ejemplos ingleses recupera las mismas 28 referencias con 254 predicciones, pero reduce el F1 exacto en ingles a 21,4%; esos pesos no se publican.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 para los 106,8 millones de parametros; el repo ocupa 0,4 GB.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de memoria; tambien funciona en CPU, entorno para el que el autor documenta el script de entrenamiento.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU moderna (GTX 1650, RTX 3060, RTX 4090) e incluso en CPU para lotes pequenos.
- Opciones de despliegue: transformers con pipeline `token-classification`; el autor proporciona scripts de extraccion y un Space interactivo. No se documenta soporte verificado de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | F1 span exacto (test SkillSpan) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rezanicgil/job-radar-knowledge-spans | 106,8 M | No disponible | 22,9% | MIT | Hugging Face |
| jjzha/jobbert_knowledge_extraction | No disponible | No disponible | 62,5% (medicion del autor) | No disponible | Hugging Face |
| MoritzLaurer/multilingual-MiniLMv2-L6-mnli-xnli (base) | No disponible | No disponible | No aplica (modelo NLI, no etiquetador de spans) | No disponible | Hugging Face |

La comparacion con JobBERT usa los mismos inputs deduplicados y el mismo scorer de limites de palabra, pero el autor advierte que JobBERT tiene un historial de entrenamiento distinto. No se dispone de datos de otros etiquetadores de spans comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Rendimiento bajo en terminos absolutos: F1 exacto de 22,9% y recall de 22,0% en test ingles, muy por debajo de la referencia JobBERT (62,5%).
- Sesgo hacia predicciones fragmentadas: el autor documenta casos como "Power BI" dividido en dos spans.
- El modelo solo declara entrenamiento en ingles; la evaluacion en turco es exploratoria, con diez ejemplos pareados por idioma y textos no anotados exhaustivamente, por lo que no establece precision general en turco.
- Una prediccion de span no determina si el empleador exige esa habilidad ni si el candidato la posee; el modelo no debe usarse como decision automatica de matching.
- Riesgo de alucinacion de spans: 700 predicciones no emparejadas en test indican una tasa alta de falsos positivos o de desalineacion con la anotacion de referencia.
- Licencia MIT, lo que permite uso comercial, pero el dataset SkillSpan subyacente se distribuye bajo CC BY 4.0 y debe atribuirse.
- Es un modelo de investigacion con 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en produccion.
- No hay datos publicados sobre cuantizacion, longitud de contexto maxima ni latencia, lo que limita la planificacion de despliegues a gran escala.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rezanicgil/job-radar-knowledge-spans
- Script de extraccion: https://github.com/rezanicgil/job-radar-evidence/blob/main/scripts/extract_knowledge_spans.py
- Script de entrenamiento: https://github.com/rezanicgil/job-radar-evidence/blob/main/scripts/train_knowledge_spans.py
- Barrido de calibracion en desarrollo: https://github.com/rezanicgil/job-radar-evidence/blob/main/reports/knowledge-span-calibration.json
- Comparacion con JobBERT: https://github.com/rezanicgil/job-radar-evidence/blob/main/reports/jobbert-span-reference.json
- Protocolo de adaptacion al turco y metricas en ingles: https://github.com/rezanicgil/job-radar-evidence/blob/main/reports/turkish-mention-adaptation.json
- Paper de SkillSpan: https://aclanthology.org/2022.naacl-main.366/
- Anotaciones fijadas de SkillSpan: https://huggingface.co/datasets/jjzha/skillspan/tree/33062e6bd0e03a5e01ae299ce0518f4613ef4298
- Ejemplos interactivos: https://rezanicgil-job-radar-evidence.static.hf.space/model.html#knowledge
- Datos de ejemplo bilingues: https://huggingface.co/datasets/rezanicgil/job-radar-match-pilot/viewer/bilingual_knowledge_spans/validation
- Referencias turcas indexadas: https://huggingface.co/datasets/rezanicgil/job-radar-match-pilot/viewer/turkish_technology_mentions/validation
- Modelo de referencia JobBERT: https://huggingface.co/jjzha/jobbert_knowledge_extraction
- Encoder base: https://huggingface.co/MoritzLaurer/multilingual-MiniLMv2-L6-mnli-xnli
