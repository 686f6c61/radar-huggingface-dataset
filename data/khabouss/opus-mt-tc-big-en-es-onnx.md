# khabouss/opus-mt-tc-big-en-es-onnx

## Resumen

`khabouss/opus-mt-tc-big-en-es-onnx` es una conversión a ONNX con cuantización int8 del modelo de traducción automática neuronal `Helsinki-NLP/opus-mt-tc-big-en-es`, desarrollado originalmente por el proyecto OPUS-MT del grupo Language Technology de la Universidad de Helsinki. El modelo traduce de inglés (en) a español (es) y forma parte de la familia OPUS-MT, un esfuerzo por ofrecer servicios de traducción abiertos y accesibles para multitud de idiomas.

La relevancia de esta variante concreta reside en su formato: al estar convertida a ONNX e cuantizada a int8, puede ejecutarse mediante `onnxruntime` sin necesidad de PyTorch, lo que reduce drásticamente los requisitos de memoria y permite inferencia en CPU. El autor de la conversión la publicó como modelo integrado en `locale-ai`, una herramienta de línea de comandos que traduce ficheros de localización i18n de forma local.

Arquitectónicamente se trata de un transformer de tipo encoder-decoder (Marian NMT) de tamaño "big", con tokenización SentencePiece de 32k tokens compartidos entre origen y destino. El repositorio ocupa aproximadamente 0,4 GB, coherente con el peso reducido que aporta la cuantización int8.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Marian NMT, variante "big") |
| Parametros totales | no disponible (el modelo original es transformer-big; el recuento exacto no se declara) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (Marian opera por segmentos; no se declara ventana máxima) |
| Tipos de cuantizacion | int8 (ONNX) |
| Idiomas soportados | inglés (en) como origen, español (es) como destino |
| Licencia | CC BY 4.0 |
| Formato de pesos | ONNX (int8 cuantizado) |

## Arquitectura y entrenamiento

El modelo subyacente es un transformer encoder-decoder entrenado con el framework Marian NMT, escrito en C++ y posteriormente convertido a PyTorch mediante la librería Transformers de Hugging Face. La tokenización emplea SentencePiece con vocabularios de 32k tokens tanto para el origen como para el destino (spm32k, spm32k). El modelo original se publicó el 13 de marzo de 2022 bajo el identificador `opusTCv20210807+bt_transformer-big_2022-03-13`.

Los datos de entrenamiento provienen de OPUS (opusTCv20210807+bt), es decir, el corpus de la Tatoeba Translation Challenge versión 20210807 con backtranslation (bt), siguiendo los procedimientos de OPUS-MT-train. No se especifican en la información disponible el número exacto de tokens de entrenamiento ni la composición detallada del dataset, ni si se aplicaron etapas de RLHF o DPO (habitualmente ausentes en modelos NMT clásicos). La innovación técnica de esta variante concreta es la conversión a ONNX mediante `optimum-onnx` y la cuantización int8, que habilita inferencia en CPU sin PyTorch.

## Capacidades

- Traducción automática unidireccional de inglés a español.
- Generación de texto traducido a nivel de segmento (frase u oración), no de documento completo con gestión de contexto largo.
- Tokenización SentencePiece de 32k tokens compartida entre idiomas.
- Ejecución sin PyTorch mediante `onnxruntime`, apta para entornos ligeros y CPU.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento de agente.
- No dispone de modo "thinking", visión ni audio.
- Capacidad multilingüe limitada estrictamente al par en→es.

## Casos de uso

- Traducción de ficheros de localización i18n: es el caso de uso original para el que se creó esta conversión; la herramienta `locale-ai` traduce ficheros de locale en local sobre CPU, aprovechando el formato ONNX int8 para evitar dependencias pesadas.
- Traducción de documentación técnica en pipelines de CI/CD: al ejecutarse con `onnxruntime` y sin GPU, puede integrarse en flujos automatizados que traduzcan READMEs, changelogs o cadenas de interfaz de forma determinista y reproducible.
- Preprocesado de corpus para investigación: útil para generar versiones en español de datasets en inglés antes de tareas posteriores de análisis o entrenamiento, dado su bajo coste computacional.
- Traducción de contenido web en servidores sin GPU: el formato int8 permite desplegar el modelo en instancias CPU modestas, adecuado para servicios de traducción de bajo volumen o entornos embebidos.
- Traducción de correspondencia y textos cortos en aplicaciones de escritorio: el tamaño reducido del repositorio (0,4 GB) facilita su empaquetado en aplicaciones locales que necesiten traducción en→es sin conexión.
- Generación de subtítulos o textos auxiliares: para traducir segmentos cortos de subtítulos en inglés a español en herramientas de postproducción, asumiendo la limitación a nivel de frase.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo (no verificados) para la tarea de traducción eng→spa:

| Dataset | Metrica | Valor |
|---|---|---|
| flores101-devtest | BLEU | 28,5 |
| news-test2008 | BLEU | 30,1 |
| tatoeba-test-v2021-08-07 | BLEU | 57,2 |
| tico19-test | BLEU | 53,0 |
| newstest2009 | BLEU | 30,2 |
| newstest2010 | BLEU | 37,6 |
| newstest2011 | BLEU | 38,9 |
| newstest2012 | BLEU | 39,5 |
| newstest2013 | BLEU | 35,9 |

No se han publicado en la información disponible resultados de benchmarks comparativos con otros modelos ni métricas de latencia o throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en la mayoría de despliegues, ya que la variante int8 está pensada para CPU; en GPU el consumo sería muy reducido (por debajo de 1 GB en la mayoría de configuraciones).
- GPU recomendadas: no se especifican; el modelo está optimizado para CPU mediante `onnxruntime`.
- Cabe en GPU de consumo: sí, con amplio margen, dado el tamaño del repositorio (0,4 GB) y la cuantización int8.
- Opciones de despliegue: `onnxruntime` (vía `optimum-onnx`); el modelo original puede ejecutarse con Transformers (MarianMTModel) y potencialmente con otros runtimes compatibles con ONNX.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Idiomas | Arquitectura | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| khabouss/opus-mt-tc-big-en-es-onnx | en→es | Marian transformer-big, int8 | no disponible | CC BY 4.0 | ONNX int8 |
| Helsinki-NLP/opus-mt-tc-big-en-es | en→es | Marian transformer-big | no disponible | CC BY 4.0 | PyTorch (safetensors/bin) |
| Otros modelos OPUS-MT en→es (variantes base) | en→es | Marian transformer (tamaño menor) | no disponible | CC BY 4.0 | PyTorch |

No se dispone de datos de rendimiento de las alternativas en la información proporcionada para establecer una comparación cuantitativa de BLEU entre ellas.

## Limitaciones y advertencias

- Traducción unidireccional: solo en→es; no soporta el sentido inverso ni otros pares de idiomas.
- Modelo de traducción por segmentos: no gestiona contexto documental largo ni coherencia entre frases más allá de la oración.
- Riesgo de alucinación y errores en terminología especializada, nombres propios y expresiones idiomáticas, habitual en modelos NMT.
- Sesgos potenciales heredados de los datos de OPUS, que pueden reflejar desequilibrios de género, dominio o registro.
- Los resultados de benchmarks están declarados por el autor y marcados como no verificados.
- Licencia CC BY 4.0: permite uso comercial con atribución; es necesario citar el trabajo original de OPUS-MT (Tiedemann y Thottingal, 2020; Tiedemann, 2020).
- La cuantización int8 puede introducir una ligera degradación de calidad frente al modelo original en PyTorch; no se documenta la magnitud de esa pérdida.
- No apta para tareas generativas generales, razonamiento, código o agentes; su alcance es exclusivamente la traducción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/khabouss/opus-mt-tc-big-en-es-onnx
- Modelo original: https://huggingface.co/Helsinki-NLP/opus-mt-tc-big-en-es
- Repositorio locale-ai: https://github.com/khabouss/locale-ai
- Script de conversión: https://github.com/khabouss/locale-ai/blob/main/scripts/convert-marian.py
- Proyecto OPUS-MT: https://github.com/Helsinki-NLP/Opus-MT
- Marian NMT: https://marian-nmt.github.io/
- OPUS-MT-train: https://github.com/Helsinki-NLP/Opus-MT-train
- Tatoeba Challenge: https://github.com/Helsinki-NLP/Tatoeba-Challenge
- README OPUS-MT eng-spa: https://github.com/Helsinki-NLP/Tatoeba-Challenge/tree/master/models/eng-spa/README.md
- Artículo OPUS-MT (EAMT 2020): https://aclanthology.org/2020.eamt-1.61/
- Artículo Tatoeba Translation Challenge (WMT 2020): https://aclanthology.org/2020.wmt-1.139/
- optimum-onnx: https://github.com/huggingface/optimum-onnx
