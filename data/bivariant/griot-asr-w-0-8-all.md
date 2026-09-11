# bivariant/GRIOT-ASR-W-0.8-ALL

## Resumen

GRIOT-ASR-W-0.8-ALL es un modelo de reconocimiento automático del habla (ASR) multilingüe desarrollado por Bivariant, orientado específicamente a lenguas africanas de bajos recursos. Se construye sobre una arquitectura modular: un modelo base Whisper compartido al que se acoplan adaptadores ligeros por idioma, de modo que cada lengua dispone de su propio adaptador (`subfolder="<lang>"`) sin necesidad de duplicar el modelo completo. El checkpoint publicado ocupa 808.878.080 parámetros (unos 808,9 millones) y se distribuye en formato safetensors con pesos de aproximadamente 14,2 GB en el repositorio.

El problema que aborda es la escasez de sistemas ASR con cobertura real de lenguas africanas. El proyecto declara un objetivo de 18 idiomas, con seis ya validados y publicados (baatonou, ewé, fon, fulfulde/peul, lingala y somalí) y el resto en estado preview o en despliegue progresivo. Un rasgo diferencial es la conservación estricta de diacríticos en las lenguas ya validadas y la optimización para habla natural (conversación corriente) en lugar de únicamente lectura aislada de frases.

Es relevante ahora porque cubre un nicho que los modelos ASR generalistas tratan de forma desigual: algunas de estas lenguas (por ejemplo, lingala o swahili) ya reciben reconocimiento parcial en Whisper en zero-shot, pero con tasas de error altas, mientras que otras no están cubiertas en absoluto. La licencia Apache-2.0 y la compatibilidad con la librería `transformers` facilitan su integración en pipelines existentes, aunque el modelo requiere `trust_remote_code=True` por incluir código personalizado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder tipo Whisper, con adaptadores por idioma sobre un modelo base compartido (arquitectura modular) |
| Parametros totales | 808.878.080 (≈ 0,81 mil millones) segun safetensors |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la model card; al derivar de Whisper trabaja con ventanas de audio de 30 segundos (caracteristica de la arquitectura base, no confirmada explicitamente por el autor) |
| Tipos de cuantizacion | No disponible (no se documentan pesos GGUF, AWQ, GPTQ ni int8) |
| Idiomas soportados | 18 lenguas africanas objetivo. Disponibles (estado estable): baatonou (`bba`), ewé (`ewe`), fon (`fon`), fulfulde/peul (`fub`), lingala (`lin`), somali (`som`). En preview: baoulé (`bci`), dioula (`dyu`), mooré (`mos`), sango (`sag`), swahili (`swh`). En despliegue progresivo: ewondo (`ewo`), hausa (`hau`), luganda (`lug`), sar (`mwm`), oromo (`orm`), shona (`sna`), wolof (`wol`) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria `transformers`, `custom_code`, `endpoints_compatible`) |

Nota: el recuento de 808,9 M de parametros no coincide exactamente con ninguna variante publica de Whisper (tiny 39 M, base 74 M, small 244 M, medium 769 M, large 1550 M), lo que sugiere que el dato agregado incluye el modelo base mas los adaptadores y cabezas asociadas. El autor no desglosa esta cifra.

## Arquitectura y entrenamiento

La arquitectura es un transformer encoder-decoder de tipo Whisper (procesamiento de audio a 16 kHz, `WhisperFeatureExtractor`, `WhisperTokenizer` y `WhisperProcessor`) con una capa de modularidad anadida: un unico modelo base compartido y adaptadores especificos por lengua que se seleccionan en tiempo de carga. Segun la model card, para cambiar de idioma no se invoca un metodo sobre el modelo, sino que se realiza una nueva llamada a `from_pretrained` pasando el parametro `language` y el `subfolder` correspondiente en el tokenizador. Los adaptadores se describen como ligeros y se publican de forma progresiva conforme superan validacion.

No se especifica en la informacion disponible el numero de tokens ni de horas de audio empleados en el entrenamiento, ni la composicion exacta de los datasets, ni si se aplicaron tecnicas de RLHF o DPO. La model card indica que el proyecto Griot incluye una fase de "Collecte & Alignement", y que los adaptadores en estado preview pueden ser reemplazados sin previo aviso a medida que mejora la calidad de los datos de entrenamiento. La innovacion tecnica destacable es precisamente el esquema de adaptadores por idioma, que permite ampliar cobertura linguistica sin reentrenar ni redistribuir un modelo completo por lengua, mas el tratamiento explicito de diacriticos en las lenguas validadas.

## Capacidades

- Transcripcion de voz a texto (ASR) en 6 lenguas africanas en estado estable y 5 en estado preview.
- Salida con diacriticos correctamente conservados en las lenguas validadas (requisito critico en ortografias como el ewé, el fon o el fulfulde).
- Transcripcion de habla natural y conversacional, no limitada a lectura aislada de frases.
- Mejora sobre el comportamiento zero-shot de Whisper en lenguas que este ya reconoce parcialmente (marcadas `+wh`, como lingala).
- Procesamiento de audio a 16 kHz mediante el extractor de caracteristicas estandar de Whisper.
- Capacidad de seleccionar el adaptador de idioma en tiempo de carga, permitiendo servir varias lenguas desde un mismo repositorio.
- Compatibilidad con el ecosistema `transformers` (`AutoModelForSpeechSeq2Seq`, `WhisperProcessor`, `generate` + `batch_decode`).
- No se documentan capacidades de tool calling, function calling, agentes, vision, audio generation ni modo de razonamiento explicito. Tampoco se documentan capacidades de traduccion de voz (speech translation) ni deteccion de idioma.

## Casos de uso

- Subtitulado y transcripcion de archivos audiovisuales en lenguas africanas: el modelo permite generar subtitulos en lingala, ewé, fon, fulfulde, somali o baatonou, lenguas para las que las alternativas comerciales de ASR rara vez ofrecen cobertura. Al operar con ventanas de audio propias de Whisper, encaja en pipelines de transcripcion por segmentos.
- Digitalizacion de archivos sonoros y patrimonio oral: radios comunitarias, archivos etnograficos y colecciones de tradicion oral pueden transcribirse de forma masiva y local, sin enviar el audio a servicios en la nube, lo que resulta relevante cuando el material es sensible o tiene restricciones de difusion.
- Atencion ciudadana y servicios publicos en zonas multilingues: integracion en lineas de atencion o formularios por voz donde el usuario habla en su lengua materna; el modelo transcribe y el texto se procesa despues con un sistema de gestion o un LLM.
- Educacion y alfabetizacion: generacion de transcripciones de material docente en lenguas locales, utiles para producir textos de lectura, ejercicios y contenidos de alfabetizacion en ortografias con diacriticos.
- Investigacion linguistica y documentacion de lenguas amenazadas: obtencion de transcripciones preliminares que un linguista corrige y anota, reduciendo el coste de la transcripcion manual en lenguas con pocos hablantes y pocos recursos escritos.
- Procesamiento previo para voz conversacional (ASR + LLM/TTS): la transcripcion sirve como primera etapa de asistentes de voz en lengua local, donde despues se aplica un modelo de lenguaje y un sistema de sintesis.
- Indexacion y busqueda de archivos de audio: transcripcion de podcasts, sermones, programas de radio o reuniones para habilitar busqueda por texto y resumenes automaticos.
- Evaluacion y benchmark de ASR en lenguas de bajos recursos: al publicar CER y WER por lengua con tamanos de conjunto de test, el modelo puede usarse como referencia base en comparativas academicas.

## Benchmarks y rendimiento

La model card publica CER y WER brutos por lengua para los adaptadores en estado estable, medidos sobre conjuntos de test dedicados por idioma.

| Codigo | Idioma | Muestras (test) | CER bruto | WER bruto |
|---|---|---|---|---|
| `lin` +wh | Lingala | 2 906 | 11,67 % | 32,36 % |
| `bba` | Baatonou | no disponible | 9,09 % | 22,16 % |
| `fub` | Peul / Fulfulde | 3 022 | 12,40 % | 28,24 % |
| `fon` | Fon | 3 081 | 11,16 % | 18,62 % |
| `som` | Somali | 3 081 | 11,16 % | 37,52 % |
| `ewe` | Ewé | 3 073 | 9,66 % | 32,44 % |

`+wh` indica lenguas ya soportadas nativamente por Whisper en zero-shot. Las metricas de las lenguas en preview y en despliegue progresivo no se han hecho publicas. El autor advierte que los resultados son especificos del conjunto de test empleado y pueden variar segun dominio, dialecto, convenciones ortograficas y presencia de code-switching. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) porque no son aplicables a un modelo ASR, ni comparativas numericas frente a otras variantes de Whisper sobre los mismos conjuntos de test.

## Requisitos de hardware

- VRAM estimada para inferencia: en FP32 los pesos ocupan aproximadamente 3,2 GB; en FP16/BF16 unos 1,6 GB; en int8 unos 0,8 GB. Anadiendo activaciones, buffers y overhead de runtime, el consumo realista se situa en el entorno de 2-4 GB en FP16 y 4-6 GB en FP32.
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM. Una RTX 3060 (12 GB), RTX 4060 (8 GB), RTX 3070/4070 o superiores funcionan con holgura. Para lotes grandes o varias lenguas en paralelo, una RTX 4090 (24 GB) o una A100/H100 son adecuadas pero sobredimensionadas para 0,81 mil millones de parametros.
- Cabe en GPU de consumo: si. Incluso GPU de gama de entrada con 4 GB (GTX 1650, RTX 3050) pueden ejecutar el modelo en FP16, y la inferencia en CPU es viable para audios de pocos minutos.
- Opciones de despliegue: `transformers` con `AutoModelForSpeechSeq2Seq.from_pretrained(..., trust_remote_code=True)` es la via documentada por el autor. La etiqueta `endpoints_compatible` sugiere compatibilidad con Hugging Face Inference Endpoints. No se documentan pesos GGUF ni soporte en llama.cpp, Ollama o whisper.cpp, y la presencia de `custom_code` implica que los servidores de inferencia genericos (vLLM, TGI) requeririan soporte explicito del codigo personalizado, no confirmado.
- Latencia y throughput estimados: no disponibles. El autor no publica mediciones de tiempo real (RTF), latencia por segmento ni throughput en lotes.

## Comparativa con modelos similares

La informacion proporcionada no incluye comparativas del autor frente a terceros. La tabla siguiente se apoya en caracteristicas publicas conocidas de la familia Whisper y de otros sistemas ASR multilingues, no en datos de la busqueda web ni en comparaciones oficiales; los campos de rendimiento relativo se marcan como no disponibles.

| Modelo | Parametros | Cobertura linguistica | Licencia | Notas |
|---|---|---|---|---|
| GRIOT-ASR-W-0.8-ALL | 808,9 M (base + adaptadores) | 6 lenguas africanas estables, 18 objetivo | Apache-2.0 | Requiere `trust_remote_code=True`; adaptadores por idioma |
| Whisper large-v3 (OpenAI) | 1550 M | ~99 idiomas | Apache-2.0 (pesos publicados en Hugging Face) | Referencia generalista; cobertura limitada y WER alto en lenguas africanas de bajos recursos |
| Whisper small (OpenAI) | 244 M | ~99 idiomas | Apache-2.0 | Menor coste, precision inferior; no especializado |
| MMS-1B-ALL (Meta) | ~1000 M | mas de 1000 lenguas | CC-BY-NC-4.0 | Cobertura amplisima, pero licencia no comercial, lo que limita su uso en produccion |

Comparativa de rendimiento: no disponible. No existen conjuntos de test comunes publicados en la informacion proporcionada que permitan una comparacion numerica justa entre estos sistemas y GRIOT-ASR.

## Limitaciones y advertencias

- Riesgo de alucinacion y de salida repetitiva: es un comportamiento documentado en modelos tipo Whisper ante audio con ruido, silencios largos, musica o dominios alejados del entrenamiento. El autor no publica mitigaciones especificas.
- Idiomas en preview y en despliegue progresivo: los adaptadores pueden ser reemplazados sin previo aviso y no se han publicado sus metricas de CER/WER, por lo que no hay evidencia publica de calidad para baoule, dioula, moore, sango, swahili, ewondo, hausa, luganda, sar, oromo, shona ni wolof.
- Dependencia de la ortografia y los diacriticos: los buenos resultados en lenguas validadas dependen de convenciones ortograficas concretas; variantes dialectales o grafias alternativas pueden degradar el WER.
- Code-switching: el autor advierte explicitamente de que la presencia de mezcla de lenguas afecta a las metricas. No se documenta soporte para habla mixta.
- Sesgos y dominio de entrenamiento: no hay informacion publica sobre la composicion del dataset, la distribucion de hablantes, genero, edad o acento, por lo que no puede evaluarse el sesgo de representacion.
- Divergencia entre el identificador del repositorio y el ejemplo de la model card: el ejemplo de codigo usa `REPO = "bivariant/griot-asr"` mientras que el identificador publicado es `bivariant/GRIOT-ASR-W-0.8-ALL`. Conviene verificar cual resuelve correctamente antes de integrarlo en produccion.
- Codigo personalizado: el tag `custom_code` obliga a usar `trust_remote_code=True`, lo que implica ejecutar codigo del autor del repositorio. Es un riesgo de seguridad a evaluar en entornos productivos.
- Licencia: Apache-2.0 permite uso comercial y modificacion, pero no se documenta la procedencia ni la licencia de los datos de audio de entrenamiento, lo que puede ser relevante en un despliegue comercial.
- Adopcion muy baja: 70 descargas y 0 likes en el momento de la consulta, con ausencia de validacion por parte de terceros.
- Model card redactada en frances: puede dificultar la revision por parte de equipos que no trabajen en ese idioma.
- Sin soporte documentado de cuantizacion ni de pesos GGUF: el despliegue en entornos sin GPU requiere validar por cuenta propia el rendimiento en CPU.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/bivariant/GRIOT-ASR-W-0.8-ALL
- Repositorio en Hugging Face referenciado en el ejemplo de la model card: https://huggingface.co/bivariant/griot-asr
- GitHub del proyecto: https://github.com/bivariant
- Sitio del autor: https://bivariant.com
- Paper, blog tecnico, demo o documentacion adicional: no disponible
- Busqueda web: los resultados obtenidos no guardan relacion con el modelo (corresponden a fichas de una cadena de tiendas en Estados Unidos) y no aportan informacion tecnica utilizable.
