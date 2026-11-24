# MimicScribe/action-item-detector-coreml

## Resumen

MimicScribe Action Item Detector (Core ML) es un clasificador binario de frases entrenado para detectar elementos de acción y tareas de seguimiento en transcripciones de reuniones. Lo desarrolla MimicScribe y deriva de `FacebookAI/xlm-roberta-base` mediante fine-tuning, para después compilarse como binario Core ML con pesos int8 y una longitud de secuencia fija de 128 tokens. Su propósito es ejecutarse en local dentro de la aplicación MimicScribe sobre hardware Apple Silicon, sin depender de servicios en la nube.

El modelo no es generativo: recibe una frase y devuelve un logit que, comparado con umbrales preconfigurados, indica si esa frase contiene un compromiso, una tarea asignada o un follow-up. La arquitectura subyacente es la de XLM-RoBERTa base (transformer encoder multilingüe), reutilizada como cabecera de clasificación.

Su relevancia actual reside en el despliegue on-device: cuantización int8, vocabulario podado y empaquetado Core ML permiten inferencia de baja latencia en portátiles y equipos de sobremesa de Apple sin conexión. El repositorio es pequeño (0,1 GB) y la licencia MIT, aunque la documentación pública es escasa y no incluye métricas de evaluación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (XLM-RoBERTa base) con cabecera de clasificación binaria |
| Parametros totales | No disponible (deriva de XLM-RoBERTa base, aproximadamente 278 M, no confirmado en la model card) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 128 tokens (longitud fija de entrada) |
| Tipos de cuantizacion | int8 (pesos cuantizados en el binario Core ML) |
| Idiomas soportados | No disponible (el modelo base XLM-RoBERTa es multilingüe; no se documenta el alcance efectivo tras el fine-tuning) |
| Licencia | MIT |
| Formato de pesos | Core ML compilado (`.mlmodelc`), tokenizador SentencePiece (`.bpe.model`) y tablas auxiliares JSON/bin |

## Arquitectura y entrenamiento

El modelo parte de `FacebookAI/xlm-roberta-base`, un encoder transformer multilingüe basado en RoBERTa con tokenizador SentencePiece. Sobre esa base se añade una cabeza de clasificación binaria y se realiza fine-tuning para la tarea de detección de frases con elementos de acción. El resultado se convierte a Core ML con pesos int8 y una entrada de longitud fija de 128 tokens, lo que simplifica el grafo y reduce el coste de inferencia en Apple Silicon.

La model card no detalla el volumen de datos de entrenamiento, la composición del corpus, el idioma de las anotaciones ni si se aplicaron técnicas de ajuste adicionales (RLHF, DPO u otras). Tampoco se documentan estrategias de aumento de datos ni el proceso de calibración de la cuantización. Sí se incluye un vocabulario podado (`vocab_map.json`, `token_remap.bin`) que reduce el tamaño del embedding respecto al vocabulario original de XLM-RoBERTa, y un fichero `detector_config.json` con los umbrales de operación por defecto en espacio de logits (claves `sxlm` y `1pass`).

## Capacidades

- Clasificación binaria de frases: determina si una oración contiene un elemento de acción o follow-up.
- Procesamiento de reuniones: pensado para fragmentos de transcripción de hasta 128 tokens.
- Inferencia on-device: ejecución local en Apple Silicon mediante Core ML, sin llamadas a API.
- Multilingüe potencial: hereda el tokenizador y la representación de XLM-RoBERTa, aunque no se documenta el rendimiento por idioma.
- Integración con tokenizador SentencePiece estándar y tablas de remapeo de vocabulario incluidas.
- No soporta generación de texto, tool calling, agentes ni razonamiento multi-paso: es un clasificador, no un modelo generativo.

## Casos de uso

- Detección de tareas en actas de reuniones: la aplicación procesa cada frase de la transcripción y marca las que contienen compromisos o asignaciones, usando el umbral configurado en `detector_config.json`.
- Resumen de follow-ups en herramientas de notas: se filtran las oraciones candidatas antes de generar un listado de acciones pendientes, reduciendo el ruido frente a un resumen genérico.
- Asistentes de productividad locales: al ejecutarse en Core ML, permite clasificar en tiempo real mientras el usuario revisa la transcripción, sin enviar datos a servidores externos.
- Gestión de correo y mensajes: aplicado a hilos de conversación, identifica frases con peticiones o compromisos para sugerir recordatorios.
- Cumplimiento y privacidad: en entornos donde no se permite enviar transcripciones a la nube, el modelo ofrece clasificación local con un binario de 0,1 GB.
- Prefiltrado en pipelines de NLP: como etapa previa barata antes de un modelo generativo mayor, selecciona las frases relevantes y reduce el coste computacional del resto del pipeline.
- Investigación sobre detección de acciones: sirve como punto de partida reproducible (licencia MIT) para fine-tuning sobre XLM-RoBERTa en tareas de extracción de compromisos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM: no aplica; el modelo se ejecuta en Core ML sobre CPU/GPU/Neural Engine de Apple, no en CUDA.
- Huella en disco: repositorio de 0,1 GB, con pesos int8 y vocabulario podado.
- Hardware recomendado: equipos Apple Silicon (serie M1 en adelante) con macOS compatible con Core ML; el Neural Engine acelera la inferencia.
- GPU NVIDIA: no soportadas por el binario Core ML publicado; para CUDA habría que reconvertir desde el modelo base.
- Opciones de despliegue: Core ML (`.mlmodelc`) en aplicaciones macOS/iOS; no se distribuyen pesos en safetensors ni GGUF, por lo que vLLM, llama.cpp, Ollama o TGI no son aplicables directamente.
- Latencia y throughput: no disponibles en la información proporcionada; al ser un encoder de 128 tokens con pesos int8, se espera latencia de milisegundos por frase en Apple Silicon, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Formato |
|---|---|---|---|---|---|
| MimicScribe Action Item Detector (Core ML) | No disponible (base XLM-RoBERTa ~278 M) | 128 tokens fijos | Clasificación binaria de action items | MIT | Core ML int8 |
| FacebookAI/xlm-roberta-base | ~278 M | 512 tokens | Encoder multilingüe de propósito general | MIT | safetensors, PyTorch |
| Modelos NER/clasificación de reuniones basados en BERT | Variable (110 M-340 M) | 512 tokens | Clasificación y extracción de entidades | Variable | PyTorch, ONNX |

La comparación directa con alternativas especializadas en detección de action items no está disponible en la información proporcionada; no se han localizado métricas ni modelos equivalentes publicados con los que contrastar.

## Limitaciones y advertencias

- Ventana de 128 tokens: frases o fragmentos más largos se truncan, lo que puede perder el contexto necesario para clasificar correctamente.
- Sin métricas publicadas: no hay precisión, recall ni F1 documentados, lo que impide evaluar su fiabilidad antes de desplegarlo.
- Idiomas no documentados: aunque el modelo base es multilingüe, se desconoce el rendimiento real tras el fine-tuning y la poda de vocabulario.
- Especialización estrecha: solo clasifica frases; no genera texto, no extrae la tarea concreta ni identifica responsables o fechas.
- Riesgo de falsos positivos y negativos: al ser un clasificador binario con umbral fijo, la calibración en el dominio de destino es imprescindible.
- Dependencia de plataforma: el binario Core ML solo se ejecuta en el ecosistema Apple; no hay pesos portables a otros runtimes.
- Sesgos: no documentados; al derivar de XLM-RoBERTa, puede heredar sesgos del corpus original, pero no se detalla el dataset de fine-tuning.
- Licencia MIT: permite uso comercial y modificación, pero conviene conservar la atribución a XLM-RoBERTa y a SentencePiece indicada por el autor.
- Madurez: repositorio con cero descargas y cero likes en el momento de la consulta; sin comunidad ni soporte documentado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MimicScribe/action-item-detector-coreml
- Modelo base: https://huggingface.co/FacebookAI/xlm-roberta-base
- Tokenizador SentencePiece: https://github.com/google/sentencepiece
- Aplicación MimicScribe: https://mimicscribe.app
