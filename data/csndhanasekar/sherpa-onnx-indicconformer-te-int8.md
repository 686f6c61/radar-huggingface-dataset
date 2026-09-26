# csndhanasekar/sherpa-onnx-indicconformer-te-int8

## Resumen

Este modelo es una conversión a sherpa-onnx del checkpoint IndicConformer de AI4Bharat para reconocimiento automático de voz (ASR) en telugu, publicado por el usuario csndhanasekar. Se trata de un Conformer de 120 millones de parámetros, originalmente un modelo híbrido CTC+RNN-T, del que aquí se conserva únicamente la cabeza CTC y cuyos pesos se han cuantizado dinámicamente a INT8 con onnxruntime. El resultado es un artefacto ONNX de unos 0,1 GB, pensado para inferencia eficiente en CPU.

Su relevancia práctica es doble: por un lado, acerca un sistema ASR de calidad razonable para telugu (una lengua con recursos limitados) a entornos sin GPU; por otro, elimina la dependencia del stack completo de NeMo, ya que se integra directamente en sherpa-onnx. El autor reporta un WER del 23,4 % y un CER del 7,2 % sobre las primeras 100 frases distintas del split de test de FLEURS te_in, muy por delante de las alternativas INT8 comparadas en la propia model card.

La licencia es MIT, igual que la del modelo original, lo que permite uso comercial sin restricciones adicionales. El vocabulario se ha recortado a los 256 tokens específicos de telugu más el token blank (257 entradas), replicando el comportamiento del modelo original cuando se decodifica con `language_id="te"`.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Conformer (encoder tipo transformer con convoluciones) con cabeza CTC; exportado desde el modelo híbrido CTC+RNN-T original |
| Parámetros totales | 120 millones (según la model card del autor) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (depende de la duración del audio; sin cifra publicada de ventana máxima) |
| Tipos de cuantización | INT8 dinámica de pesos mediante onnxruntime; no se documentan otras cuantizaciones en la información disponible |
| Idiomas soportados | Telugu (código `te`); el vocabulario original es compartido para 22 lenguas, pero este export conserva solo los tokens de telugu |
| Licencia | MIT |
| Formato de pesos | ONNX (`model.int8.onnx`) más `tokens.txt` con 257 entradas |
| Entrada de audio | Features log-mel de 80 dimensiones con normalización por feature (las calcula sherpa-onnx) |
| Tamaño del repositorio | 0,1 GB |

## Arquitectura y entrenamiento

El modelo base es un Conformer de AI4Bharat, una arquitectura que combina bloques de auto-atención con convoluciones para capturar tanto dependencias globales como patrones locales en la señal de audio, adecuada para ASR sobre secuencias largas. El checkpoint original era híbrido (CTC + RNN-T); esta exportación descarta la cabeza RNN-T y mantiene solo la CTC, lo que simplifica el grafo y permite un decodificador greedy directo sin necesidad de beam search ni de un modelo de lenguaje externo.

La cuantización aplicada es INT8 dinámica sobre los pesos, ejecutada con onnxruntime, que reduce el tamaño del artefacto y acelera la inferencia en CPU a costa de una posible pérdida de precisión no cuantificada en la información disponible. El preprocesado acústico no forma parte del grafo: sherpa-onnx calcula las features log-mel de 80 dimensiones con normalización por feature. En cuanto a los datos de entrenamiento (número de tokens, composición del corpus, uso de RLHF o DPO), no hay información disponible en la model card; se remite al modelo base de AI4Bharat para esos detalles.

## Capacidades

- Reconocimiento de voz en telugu a partir de audio, en modo offline (por lotes) mediante `sherpa_onnx.OfflineRecognizer.from_nemo_ctc`.
- Decodificación CTC greedy sobre 256 tokens de telugu más blank, equivalente al comportamiento del modelo original con `language_id="te"`.
- Inferencia en CPU con pesos INT8, sin requisito de GPU.
- Integración con el ecosistema sherpa-onnx, que expone enlaces para Python, C++, C, C#, Kotlin y Swift.
- Procesamiento de features log-mel de 80 dimensiones gestionado internamente por la librería.
- No soporta tool calling ni function calling (no es un modelo de lenguaje).
- No soporta razonamiento multi-paso ni comportamiento de agente.
- No tiene capacidades multimodales: solo entrada de audio, salida de texto.
- No se documenta salida con puntuación, mayúsculas ni marcas de tiempo.
- Capacidad multilingüe: no, está restringido a telugu en este export.

## Casos de uso

- Transcripción de audio en telugu en servidores sin GPU: al ser un modelo INT8 de unos 0,1 GB integrado en sherpa-onnx, puede desplegarse en instancias CPU estándar para procesar ficheros de audio por lotes, sin coste de acelerador.
- Análisis de contact center en telugu: transcripción de llamadas para extraer métricas de calidad, detección de motivos de contacto o búsqueda de palabras clave; el CER del 7,2 % es suficientemente bajo para tareas de recuperación de términos.
- Subtitulado y archivado de contenido audiovisual en telugu: generación de transcripciones completas de vídeo o pódcast como paso previo a un sistema de subtítulos, asumiendo postprocesado para puntuación y mayúsculas.
- Aplicaciones móviles y de borde: los bindings de sherpa-onnx para Kotlin y Swift permiten incrustar el modelo en aplicaciones Android e iOS para dictado o comandos de voz en telugu con inferencia local.
- Generación de datasets ASR y pseudo-etiquetado: transcripción automática de grandes volúmenes de audio en telugu para construir corpus de entrenamiento o de evaluación, con revisión humana posterior dado el WER del 23,4 %.
- Indexación y búsqueda de audio: transcripción previa para permitir búsqueda por texto sobre archivos de audio, reuniones o archivos de radio en telugu.
- Etapa previa a traducción automática: la transcripción en telugu puede alimentar un pipeline de traducción telugu→otro idioma, siempre que el sistema posterior tolere errores de reconocimiento moderados.
- Evaluación comparativa de sistemas ASR para lenguas indias: sirve como referencia cuantitativa frente a otros modelos INT8 sobre FLEURS te_in.

## Benchmarks y rendimiento

Resultados reportados por el autor sobre las primeras 100 frases distintas del split de test de FLEURS `te_in`, con texto pasado a minúsculas y sin puntuación:

| Modelo | WER | CER |
|---|---|---|
| Este modelo (IndicConformer Telugu, CTC, INT8) | 23,4 % | 7,2 % |
| Dolphin small CTC INT8 | 61,2 % | 23,7 % |
| Omnilingual 300M CTC INT8 | 42,4 % | 9,6 % |

Advertencia metodológica: la evaluación se limita a 100 frases, por lo que los valores tienen un margen de error considerable y no deben extrapolarse sin cautela al rendimiento sobre corpus completos. No se han publicado otros benchmarks (MMLU, HumanEval, GSM8K u otros) en la información disponible, y no aplican al tratarse de un modelo ASR.

## Requisitos de hardware

- VRAM: no requiere GPU; el artefacto de pesos ocupa aproximadamente 0,1 GB en disco (estimación derivada del tamaño del repositorio, coherente con 120 M de parámetros en INT8).
- Memoria RAM estimada para inferencia: del orden de unos cientos de MB, incluyendo runtime y buffers de features; el consumo exacto no está publicado.
- GPU recomendadas: no aplica en el escenario de referencia (CPU). La aceleración por GPU dependería de compilar sherpa-onnx con un execution provider de ONNX Runtime (por ejemplo CUDA), extremo no documentado para este repositorio; no disponible.
- Compatibilidad con GPU de consumo: irrelevante para el caso de uso previsto; el modelo cabe con holgura en cualquier GPU de consumo si se habilita un execution provider, pero no es necesario.
- Opciones de despliegue: sherpa-onnx (Python, C++, C, C#, Kotlin, Swift) sobre ONNX Runtime. vLLM, llama.cpp, Ollama y TGI no son aplicables porque no es un modelo de lenguaje.
- Latencia y throughput: no disponibles; no se publican mediciones de RTF ni de velocidad de decodificación. El número de hilos se configura en la llamada (`num_threads=4` en el ejemplo del autor).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / entrada | WER (FLEURS te_in) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (IndicConformer Telugu CTC INT8) | 120 M | Audio; features log-mel de 80 dim | 23,4 % | MIT | HuggingFace, formato ONNX para sherpa-onnx |
| Dolphin small CTC INT8 | No disponible | Audio | 61,2 % | No disponible | Referenciado en la model card del autor |
| Omnilingual 300M CTC INT8 | 300 M | Audio | 42,4 % | No disponible | Referenciado en la model card del autor |
| ai4bharat/indicconformer_stt_te_hybrid_ctc_rnnt_large (modelo base) | 120 M | Audio | No disponible para esta variante | MIT | HuggingFace, pesos NeMo (CTC + RNN-T) |

En la comparativa publicada por el autor, este export obtiene el mejor WER y el mejor CER de los tres modelos evaluados, con una diferencia amplia respecto a Dolphin small (37,8 puntos de WER) y a Omnilingual 300M (19 puntos de WER), pese a tener menos parámetros que este último.

## Limitaciones y advertencias

- Cobertura de una sola lengua: solo telugu; el vocabulario multilingüe del modelo original (22 lenguas) se ha recortado deliberadamente.
- WER del 23,4 %: implica aproximadamente uno de cada cuatro palabras mal reconocidas en el conjunto de evaluación; para producción conviene combinarlo con revisión humana o con un modelo de lenguaje de rescoring, que aquí no está disponible porque solo se exportó la cabeza CTC.
- Evaluación reducida: los números provienen de 100 frases de FLEURS, no de un test completo; pueden no representar el rendimiento en dominios distintos (llamadas telefónicas, ruido de fondo, acentos regionales).
- Salida sin formato: la evaluación se hizo con texto en minúsculas y sin puntuación, lo que sugiere que el modelo no produce puntuación ni mayúsculas de forma fiable; se necesita postprocesado.
- Sin marcas de tiempo documentadas: no se indica soporte de timestamps a nivel de palabra o segmento.
- Riesgo de alucinación específico de ASR: en audio ruidoso o silencioso el decodificador CTC puede generar texto espurio o repetitivo.
- Sesgos: no hay información disponible sobre la composición demográfica o dialectal de los datos de entrenamiento del modelo base, por lo que no puede evaluarse el sesgo por variedad dialectal, género o edad.
- Pérdida por cuantización: no se publica una comparación INT8 frente al checkpoint en precisión completa, por lo que el impacto exacto de la cuantización es desconocido; las cifras de WER y CER corresponden únicamente a la versión INT8.
- Licencia: MIT, sin restricciones para uso comercial, siempre que se conserve el aviso de copyright; conviene verificar igualmente la licencia y condiciones del modelo base de AI4Bharat.
- Madurez del repositorio: 0 descargas y 0 likes en el momento de la consulta, sin historial de mantenimiento ni issues públicos; el soporte depende del autor.
- Fecha de publicación poco habitual: el repositorio figura creado el 26 de septiembre de 2026, dato a verificar en la plataforma antes de citarlo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/csndhanasekar/sherpa-onnx-indicconformer-te-int8
- Modelo base (AI4Bharat IndicConformer Telugu, híbrido CTC+RNN-T): https://huggingface.co/ai4bharat/indicconformer_stt_te_hybrid_ctc_rnnt_large
- Repositorio de sherpa-onnx: https://github.com/k2-fsa/sherpa-onnx
- No se han encontrado en la información disponible papers, blogs, demos ni repositorios adicionales asociados a esta conversión concreta.
