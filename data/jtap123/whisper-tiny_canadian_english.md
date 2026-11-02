# jtap123/whisper-tiny_canadian_english

## Resumen

Whisper tiny canadian_english es un ajuste fino (fine-tuning) del modelo de reconocimiento automatico del habla (ASR) openai/whisper-tiny, publicado por el usuario jtap123 en HuggingFace. El modelo parte de la arquitectura transformer encoder-decoder de Whisper en su variante "tiny", con 37.760.640 parametros totales, y ha sido reentrenado sobre un dataset denominado canadian_english_english para adaptar el reconocimiento del ingles hacia la variante canadiense. Resuelve, por tanto, el problema de la transcripcion de audio en ingles con un sesgo hacia las particularidades foneticas y lexicas del ingles canadiense, un nicho poco cubierto por los modelos ASR genericos.

El modelo es relevante ahora porque los ajustes finos de Whisper sobre acentos o variantes regionales permiten mejorar la tasa de error de palabra (WER) en dominios especificos sin necesidad de desplegar modelos de mayor tamano. Su tamano reducido (0,3 GB de repositorio) lo hace especialmente atractivo para inferencia en CPU, dispositivos de borde o entornos con recursos limitados.

No obstante, la informacion publicada por el autor es muy escasa: la model card esta generada automaticamente por el Trainer y contiene multiples secciones marcadas como "More information needed". El unico resultado declarado es un WER de 18,5681 sobre el split de test del dataset canadian_english_english, un valor no verificado y que debe interpretarse con cautela dado el limitado contexto sobre la composicion del dataset.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper tiny) |
| Parametros totales | 37.760.640 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (Whisper tiny procesa ventanas de audio de 30 segundos por defecto; no confirmado en la informacion) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de openai/whisper-tiny: un transformer encoder-decoder entrenado originalmente por OpenAI para transcripcion y traduccion de voz, con aproximadamente 37,8 millones de parametros. El ajuste fino se realizo con la libreria Transformers (version 5.23.0.dev0) y PyTorch 2.11.0+cu130, usando el Trainer de HuggingFace con los siguientes hiperparametros: learning rate de 1e-05, batch de entrenamiento de 2, batch de evaluacion de 1, semilla 42, optimizador AdamW con betas (0,9, 0,999) y epsilon 1e-08, scheduler lineal con 500 pasos de calentamiento y 2000 pasos de entrenamiento en total.

El entrenamiento se desarrollo durante 2 epocas sobre el dataset canadian_english_english (split de test para evaluacion). La perdida de entrenamiento bajo de 0,2764 en el paso 1000 a 0,1021 en el paso 2000, mientras que la perdida de validacion se mantuvo practicamente estable (0,3959 y 0,3937 respectivamente) y el WER apenas vario (18,5156 y 18,5681). Este comportamiento sugiere un ajuste fino muy ligero, posiblemente con sobreajuste incipiente o con un dataset de validacion limitado. No se especifica en la informacion disponible si hubo RLHF, DPO ni tecnicas de decodificacion especulativa.

## Capacidades

- Reconocimiento automatico del habla (ASR) en ingles, con ajuste especifico hacia la variante canadiense.
- Transcripcion de audio a texto mediante el pipeline `automatic-speech-recognition` de Transformers.
- Compatible con endpoints de HuggingFace (tag `endpoints_compatible`).
- Soporte de inferencia con la libreria Transformers y pesos en safetensors.
- Capacidad multilingue limitada: solo declara el idioma `en`.
- No se documenta soporte de tool calling, function calling, agentes ni razonamiento multi-paso (no aplica a un modelo ASR).
- No se documenta modo "thinking", vision ni audio generativo (solo transcripcion de entrada de audio).

## Casos de uso

- Transcripcion de reuniones y llamadas en ingles canadiense: el ajuste sobre canadian_english_english puede reducir errores en terminos y pronunciaciones propias de esta variante, aunque el WER declarado (18,57 %) limita su uso a transcripciones de baja exigencia o como borrador.
- Subtitulado automatico de contenido audiovisual: al ser un modelo tiny de 37,8 M de parametros, puede ejecutarse en tiempo real o casi real en CPU y generar subtitulos preliminares que luego se revisan manualmente.
- Preprocesado de audio en pipelines de datos: util para generar transcripciones masivas de bajo coste en corpus de habla canadiense antes de un filtrado o etiquetado posterior.
- Asistentes de voz embebidos en dispositivos de borde: su tamano (0,3 GB de repositorio) permite desplegarlo en Raspberry Pi, moviles o sistemas empotrados con memoria limitada para comandos de voz en ingles.
- Prototipado rapido de aplicaciones ASR: sirve como linea base para comparar con modelos mayores o con otros ajustes regionales antes de invertir en infraestructura.
- Investigacion sobre sesgos dialectales en ASR: permite estudiar como un ajuste fino ligero (2 epocas, lr 1e-05) afecta al WER en una variante regional concreta frente al modelo base whisper-tiny.
- Indexacion y busqueda de archivos de audio: transcripcion previa para habilitar busqueda por texto en grabaciones de habla canadiense.

## Benchmarks y rendimiento

Datos declarados por el autor en el model-index (no verificados):

| Tarea | Dataset | Metrica | Valor |
|---|---|---|---|
| Automatic Speech Recognition | canadian_english English (split test) | WER | 18,5681 |

Resultados de validacion durante el entrenamiento:

| Epoca | Paso | Training loss | Validation loss | WER |
|---|---|---|---|---|
| 1.0 | 1000 | 0,2764 | 0,3959 | 18,5156 |
| 2.0 | 2000 | 0,1021 | 0,3937 | 18,5681 |

No se han publicado en la informacion disponible resultados comparativos con otros modelos (por ejemplo, whisper-tiny base o whisper-small) ni metricas adicionales como WER por subconjunto, exactitud o latencia.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en precision fp32 dado el tamano del modelo (37,8 M de parametros); en la practica cabe en cualquier GPU consumer y en CPU.
- GPU recomendadas: cualquier GPU con al menos 2 GB de memoria (GTX 1050, RTX 2060, RTX 3060, RTX 4090, A100, H100); el modelo no aprovecha GPUs de gama alta por su reducido tamano.
- Cabe en GPU consumer: si, en practicamente todas las GPU dedicadas e integradas modernas, asi como en CPU.
- Opciones de despliegue: Transformers (pipeline `automatic-speech-recognition`), endpoints de HuggingFace (tag `endpoints_compatible`); no se confirma soporte de llama.cpp, Ollama ni TGI en la informacion disponible.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | WER (dataset) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| jtap123/whisper-tiny_canadian_english | 37,8 M | no disponible | 18,57 (canadian_english_english, test) | apache-2.0 | HuggingFace |
| openai/whisper-tiny | 37,8 M | no disponible | no disponible en la informacion | apache-2.0 | HuggingFace |
| openai/whisper-base | no disponible en la informacion | no disponible | no disponible en la informacion | apache-2.0 | HuggingFace |
| openai/whisper-small | no disponible en la informacion | no disponible | no disponible en la informacion | apache-2.0 | HuggingFace |

La comparacion cuantitativa con los modelos base de OpenAI no puede realizarse con los datos proporcionados, ya que no se incluyen sus WER sobre el mismo dataset. El modelo se posiciona como un ajuste regional de whisper-tiny, por lo que su comparacion natural es contra el propio whisper-tiny sin ajustar, dato que no esta disponible.

## Limitaciones y advertencias

- La model card esta generada automaticamente y contiene secciones sin completar ("More information needed"); no hay documentacion sobre usos previstos, limitaciones ni composicion del dataset.
- El WER de 18,57 % es elevado para produccion y no esta verificado (`verified: false`); debe validarse sobre datos propios antes de cualquier despliegue.
- El ajuste fino es muy ligero (2 epocas, 2000 pasos, batch 2) y la perdida de validacion no mejora entre epocas, lo que sugiere posible sobreajuste o un dataset de validacion poco representativo.
- Solo soporta ingles (`en`); no se garantiza un buen rendimiento en otras variantes del ingles ni en otros idiomas.
- El modelo base whisper-tiny tiene capacidad limitada en comparacion con variantes mayores (base, small, medium, large); el ajuste no compensa esa diferencia de capacidad.
- Riesgo de alucinacion en pasajes de audio con ruido, silencios o habla solapada, comun en modelos Whisper pequenos.
- No se documentan sesgos especificos, pero al entrenarse sobre un dataset regional concreto puede presentar sesgos hacia ese dominio y degradarse en otros acentos.
- Licencia apache-2.0: permite uso comercial, pero el autor no ofrece garantias ni soporte.
- No se especifican requisitos de atribucion adicionales mas alla de los de la licencia apache-2.0.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validacion por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jtap123/whisper-tiny_canadian_english
- Modelo base: https://huggingface.co/openai/whisper-tiny
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la busqueda web proporcionada.
