# AlfredJames/jobbert-zh-1m

## Resumen

JobBERT-zh 1M es un modelo de extracción de competencias (skill-span) para anuncios de empleo en chino, desarrollado por AlfredJames. Se basa en un encoder BERT chino (`hfl/chinese-roberta-wwm-ext`) sometido a un preentrenamiento adaptativo al dominio (DAPT) con 1 millón de frases de anuncios de empleo chinos, seguido de una cabeza CRF para el etiquetado de secuencias. El modelo resuelve la tarea Chinese-SkillSpan, que consiste en identificar y delimitar los fragmentos de texto que expresan habilidades o competencias en ofertas de trabajo.

Con 118,5 millones de parámetros y una arquitectura BERT-base (12 capas, 768 unidades ocultas, vocabulario de 21.128 tokens), el modelo es ligero y puede ejecutarse en hardware modesto. Es relevante para el procesamiento de lenguaje natural en el ámbito de recursos humanos, especialmente en el mercado laboral chino, donde la extracción automática de habilidades permite estructurar ofertas de empleo, analizar tendencias de demanda y alimentar sistemas de recomendación. Este repositorio contiene la versión de 1M, distinta de la versión de 3M publicada en `AlfredJames/jobbert-zh`.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer BERT-base (12 capas, hidden 768) + linear-chain CRF con 9 etiquetas BIO |
| Parametros totales | 118.516.616 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 512 (heredado del backbone BERT; el entrenamiento usa secuencias de hasta 256 tokens) |
| Tipos de cuantizacion | No disponible (no se han publicado cuantizaciones) |
| Idiomas soportados | zh (chino) |
| Licencia | other (el backbone es Apache-2.0, pero el modelo no ha sido relicenciado) |
| Formato de pesos | safetensors (encoder) y PyTorch checkpoint (`crf/best.pt`) |

## Arquitectura y entrenamiento

El modelo combina un encoder BERT chino con una cabeza CRF. El encoder es un `AutoModel` cargado desde este repositorio, que continúa el preentrenamiento de `hfl/chinese-roberta-wwm-ext` mediante MLM (masked language modeling) sobre 1 millón de frases de anuncios de empleo chinos durante 3 épocas. La cabeza de etiquetado está formada por una capa lineal de emisiones y una CRF lineal (`torchcrf`, `batch_first=True`) con 9 etiquetas BIO: `O`, `B-L`, `I-L`, `B-K`, `I-K`, `B-S`, `I-S`, `B-T`, `I-T`.

El ajuste fino de la CRF se realizó sobre el conjunto V4 silver de LSKT (etiquetado automático, no oro humano), con semilla 42, 6 épocas, paciencia 2, batch size 16, longitud máxima 256 y tasa de aprendizaje 2e-5. El `config.json` reporta `BertForMaskedLM`, pero el encoder se carga con `AutoModel`. No hay export `AutoModelForTokenClassification` ni proveedor de inferencia alojado. El head CRF se distribuye como un checkpoint de PyTorch separado.

## Capacidades

- Extracción de spans de competencias y habilidades en anuncios de empleo chinos (Chinese-SkillSpan).
- Etiquetado de secuencias con 9 etiquetas BIO para identificar fragmentos de texto que representan competencias.
- Funciona como encoder de dominio para tareas de token-classification en textos laborales chinos.
- No es un modelo generativo: no produce texto libre, sino etiquetas por token.
- No soporta tool calling, function calling, ni razonamiento multi-paso.
- No es multimodal ni tiene capacidades de visión o audio.
- Soporte exclusivo del idioma chino.

## Casos de uso

- Extracción de competencias en ofertas de empleo chinas: el modelo identifica automáticamente los fragmentos de texto que expresan habilidades (por ejemplo, "Python", "SQL", "CET-6") en anuncios, permitiendo estructurar los requisitos de cada puesto.
- Análisis de tendencias del mercado laboral: al procesar grandes volúmenes de anuncios, las competencias extraídas pueden agregarse para detectar habilidades emergentes o en declive en sectores concretos.
- Enriquecimiento de plataformas de empleo: integrar el modelo en portales de trabajo para etiquetar automáticamente las ofertas con las competencias requeridas, mejorando la búsqueda y el filtrado de candidatos.
- Investigación académica en NLP aplicada a RRHH: servir como modelo de referencia para la tarea Chinese-SkillSpan y para comparar enfoques de extracción de competencias en chino.
- Automatización de informes de inteligencia de talento: extraer competencias de anuncios para generar informes sectoriales sobre la demanda de perfiles profesionales.
- Apoyo a sistemas de recomendación de formación: identificar las competencias solicitadas en el mercado laboral para sugerir cursos o programas de capacitación a trabajadores y desempleados.
- Revisión y curación de bases de datos de competencias: asistir a analistas en la limpieza y categorización de habilidades en textos chinos, reduciendo el trabajo manual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

El paper del modelo reporta un F1 typed exact de 0.427162 para la configuración 1M, obtenido con el encoder, la CRF y un alineamiento con jieba sobre el conjunto V4 hybrid de 2601 muestras de oro. No se dispone de una tabla comparativa con otros modelos.

## Requisitos de hardware

- El encoder en safetensors ocupa 474 MB en fp32; el head CRF ocupa 409 MB. El tamaño total del repositorio es de 0,9 GB.
- VRAM estimada para inferencia: en fp32, se recomienda al menos 2 GB de VRAM; en fp16, puede reducirse a aproximadamente 1 GB. El modelo es ligero y puede ejecutarse en CPU.
- GPU recomendada: cualquier GPU moderna con 2 GB o más de VRAM (por ejemplo, RTX 3050, GTX 1660). No requiere GPUs de centro de datos como A100 o H100.
- Despliegue: no es compatible con vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo generativo. Se integra mediante Hugging Face Transformers y PyTorch, con código personalizado para la CRF (`torchcrf`).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Tarea | Disponibilidad |
|---|---|---|---|---|---|
| JobBERT-zh 1M | 118,5 M | 512 | other | Extracción de competencias (CRF) | Hugging Face |
| JobBERT-zh 3M | no disponible | 512 | other | Extracción de competencias (CRF) | Hugging Face |
| hfl/chinese-roberta-wwm-ext | no disponible | 512 | Apache-2.0 | Encoder MLM | Hugging Face |

El modelo 3M (`AlfredJames/jobbert-zh`) es la versión de mayor rendimiento del mismo enfoque, con un F1 typed exact de 0.4331, y no debe confundirse con este repositorio. Como alternativas en inglés, aunque no directamente comparables por idioma, existen `jjzha/jobbert-base-cased` y `TechWolf/JobBERT-v3`, orientadas a anuncios de empleo en inglés.

## Limitaciones y advertencias

- Solo funciona con texto en chino; no soporta otros idiomas.
- No predice códigos ESCO ni conceptos normalizados; emite únicamente spans LSKT.
- No soporta entidades anidadas o solapadas.
- Entrenado en anuncios de empleo, no en currículos; su rendimiento en otros dominios puede degradarse.
- Los datos de entrenamiento de la CRF son V4 silver (etiquetado automático), no oro humano, lo que puede afectar a la precisión.
- Licencia "other": los derechos sobre los textos de anuncios de empleo no están confirmados; el uso comercial requiere verificación legal.
- No es un modelo generativo: no puede responder preguntas ni generar texto.
- El repositorio no incluye un export `AutoModelForTokenClassification`; la integración requiere código personalizado para la CRF.
- No debe utilizarse para screening de candidatos, automatización de contratación ni inferencia de atributos protegidos.
- No confundir con el modelo 3M de `AlfredJames/jobbert-zh`, que tiene pesos diferentes.

## Enlaces

- Modelo 1M: https://huggingface.co/AlfredJames/jobbert-zh-1m
- Modelo 3M (companion): https://huggingface.co/AlfredJames/jobbert-zh
- Código y datos: https://github.com/AlfredJamesLi/chinese-skillspan-benchmark
- Archivo Zenodo: https://doi.org/10.5281/zenodo.22288338
- Backbone: https://huggingface.co/hfl/chinese-roberta-wwm-ext
- JobBERT inglés (referencia): https://huggingface.co/jjzha/jobbert-base-cased
- JobBERT-v3 (TechWolf, referencia): https://huggingface.co/TechWolf/JobBERT-v3
