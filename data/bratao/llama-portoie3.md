# bratao/Llama-PortOIE3

## Resumen

`Llama-PortOIE3` es un modelo generativo de la familia Llama 3, ajustado mediante fine-tuning supervisado para la extracción abierta de información (Open Information Extraction, OpenIE) en portugués. Desarrollado por el usuario `bratao` y publicado como un único archivo GGUF para su uso con runtimes compatibles con llama.cpp, el modelo genera extracciones binarias en formato `ARG0`, `V`, `ARG1` a partir de frases en portugués. Su relevancia radica en ofrecer una solución especializada y ligera para tareas de extracción de relaciones en textos lusófonos, con un tamaño de 8.030 millones de parámetros y una ventana de contexto de 8.192 tokens según la metadata del GGUF.

La publicación no declara explícitamente el modelo base, el tipo de cuantización, el dataset de entrenamiento ni la licencia, lo que limita su reproducibilidad y auditoría. A pesar de ello, el modelo está integrado en la librería `portuguese-openie` y puede utilizarse directamente con `llama-cpp-python`, lo que facilita su adopción en entornos de producción con requisitos moderados de hardware. La evaluación reportada en la tesis asociada indica un F1 léxico de 0.2446 sobre un conjunto de 100 frases de referencia, aunque estos valores no están verificados para el archivo GGUF concreto.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Llama (Transformer denso, familia Llama 3) |
| Parametros totales | 8.030.261.248 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 8.192 tokens (según metadata GGUF) |
| Tipos de cuantizacion | No disponible (no se declara en la model card) |
| Idiomas soportados | Portugués (pt) |
| Licencia | No disponible |
| Formato de pesos | GGUF (archivo `llama3_finetune.gguf`) |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de un LLM de la familia Llama 3 con 8.030 millones de parámetros, arquitectura Transformer densa. Según la tesis asociada, el entrenamiento se realizó mediante supervisión fina (SFT) con Axolotl sobre una NVIDIA H100, utilizando una mezcla de datasets de OpenIE en portugués: OIEC-PT Silver, Pragmático (400 frases, 485 extracciones), Gamalho (103 frases, 346 extracciones) y ejemplos sintéticos de WikiPUD-Portugués. La configuración de entrenamiento incluyó optimizador AdamW en 8 bits, tamaño de lote 8, tasa de aprendizaje coseno de 0.00002, sample packing y gradient checkpointing. No se menciona el uso de RLHF ni DPO.

El modelo está diseñado específicamente para la tarea de extracción extractiva de relaciones, generando tripletas `ARG0`, `V`, `ARG1` a partir de una frase dada. La plantilla de chat incluida en el GGUF es la de Llama 3, y el prompt del sistema recomendado es: `Dada uma frase S você consegue fazer extrações no formato ARG0 , V, ARG1. Realize a extração para a frase abaixo:`.

## Capacidades

- Extracción de OpenIE extractiva en portugués: genera tripletas `ARG0`, `V`, `ARG1` a partir de frases, identificando el sujeto, el verbo y el objeto de la relación.
- Generación de texto en portugués limitada al contexto de la tarea de extracción; no es un modelo conversacional generalista.
- Compatibilidad con runtimes llama.cpp mediante el archivo GGUF, lo que permite su uso en CPU y GPU con offload de capas.
- Integración con la librería `portuguese-openie`, que facilita la descarga automática del modelo y la extracción de tripletas con una API sencilla.
- Soporte de plantilla de chat Llama 3, aunque el uso recomendado es con `chat_format="llama-3"` y temperatura 0.0 para resultados deterministas.

## Casos de uso

- Construcción de grafos de conocimiento a partir de corpus en portugués: el modelo extrae relaciones `ARG0`-`V`-`ARG1` de frases, lo que permite poblar bases de datos semánticas o grafos RDF de forma automatizada.
- Análisis de documentos enciclopédicos o académicos: dado que la evaluación se realizó sobre frases de tipo enciclopédico, el modelo es adecuado para extraer hechos de artículos de Wikipedia o papers en portugués.
- Procesamiento de corpus lingüísticos para investigación en PLN: los investigadores pueden usar el modelo para anotar automáticamente relaciones en conjuntos de texto, reduciendo el esfuerzo manual.
- Enriquecimiento de motores de búsqueda semántica: las tripletas extraídas pueden indexarse para mejorar la recuperación de información basada en entidades y relaciones.
- Automatización de tareas de extracción en pipelines de datos: al ser un modelo ligero (8B) y ejecutable en CPU, puede integrarse en flujos de procesamiento por lotes sin necesidad de GPUs dedicadas.
- Verificación de hechos asistida: aunque el modelo no verifica la veracidad, puede extraer afirmaciones de textos que luego se contrastan con fuentes externas.

## Benchmarks y rendimiento

La model card reporta resultados de evaluación sobre 100 frases Gold de OIEC-PT y 136 extracciones de referencia de la tesis. Sin embargo, se advierte que los valores de perfect match no están corroborados para el archivo GGUF exacto, y solo el F1 léxico coincide con la evaluación local. Los datos son:

| Fuente | Criterio | Precision | Recall | F1 |
|---|---:|---:|---:|---:|
| Tesis | Perfect match | — | — | 0.1290 |
| Tesis | Lexical match | 0.2857 | 0.2058 | 0.2446 |
| Evaluación local | Lexical match | 0.2394 | 0.2500 | 0.2446 |
| Evaluación local (conflicto) | Perfect match | 0.0922 | 0.0956 | 0.0939 |

Estos valores no son métricas verificadas para el archivo GGUF publicado, ya que no se ha establecido la correspondencia entre el checkpoint evaluado y el artefacto distribuido. La latencia media reportada en la tesis es de aproximadamente 1.4 segundos por predicción, dependiente del hardware.

## Requisitos de hardware

- CPU: se recomiendan entre 10 y 12 GB de RAM libre como punto de partida para inferencia en CPU (el archivo GGUF pesa 8.54 GB, más buffers de contexto).
- GPU: opcional; se puede usar `n_gpu_layers` para descargar capas a VRAM. No se especifican requisitos de VRAM concretos, pero un modelo 8B cuantizado típicamente requiere entre 4 y 6 GB en una GPU de consumo (p. ej., RTX 3060 o superior) según la cuantización, desconocida aquí.
- Despliegue: compatible con llama.cpp, `llama-cpp-python`, y la librería `portuguese-openie` con backend GGUF. También puede usarse con servidores compatibles con la API de OpenAI mediante adaptadores.
- Latencia: ~1.4 s por extracción según la tesis, pero depende del hardware y de la configuración de contexto.

## Comparativa con modelos similares

No se dispone de información pública sobre modelos comparables específicos para OpenIE extractiva en portugués con características equivalentes (tamaño, formato GGUF, licencia). La model card no referencia alternativas ni benchmarks comparativos. Por tanto, no es posible realizar una comparativa fundamentada.

## Limitaciones y advertencias

- El modelo puede omitir o duplicar relaciones, alucinar contenido o generar salidas que el parser no pueda normalizar; se recomienda verificar todos los campos contra los tramos de la frase original.
- La licencia no está declarada, lo que impide determinar si su uso comercial está permitido o bajo qué condiciones.
- La identidad del modelo base, el tipo de cuantización y la revisión exacta del dataset de entrenamiento no están establecidos públicamente, lo que dificulta la auditoría y la reproducibilidad.
- La evaluación es pequeña (100 frases) y principalmente de dominio enciclopédico; la robustez frente a portugués dialectal, conversacional, especializado, frases largas o adversarias es desconocida.
- El contexto de 8.192 tokens está registrado en la metadata, pero la librería usa por defecto 2.048 tokens y no se han evaluado entradas más largas.
- Las extracciones no constituyen verificación de hechos y no deben usarse como única fuente para decisiones de alto impacto.
- No se ha establecido un vínculo verificable entre el checkpoint evaluado en la tesis y el archivo GGUF publicado, por lo que los resultados de evaluación deben tomarse con cautela.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/bratao/Llama-PortOIE3
- Paper de Llama 3 (contexto general): https://arxiv.org/abs/2407.21783
