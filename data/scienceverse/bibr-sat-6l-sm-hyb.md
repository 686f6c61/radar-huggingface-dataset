# scienceverse/bibr-sat-6l-sm-hyb

## Resumen

bibr-sat-6l-sm-hyb es una conversión a ONNX en float32 del modelo de segmentación de frases segment-any-text/sat-6l-sm, publicado por el usuario scienceverse. No se trata de un modelo nuevo entrenado desde cero, sino de una recompilación del grafo ONNX original que cambia el formato numérico del encoder para acelerar la inferencia en CPU. Su propósito es servir de motor de segmentación de frases dentro de la herramienta bibr, del mismo autor, que procesa documentos académicos.

El modelo hereda la arquitectura y los pesos de sat-6l-sm, un transformer de 6 capas orientado a la detección de fronteras de frase (sentence segmentation) mediante clasificación token a token. La modificación principal consiste en mantener los pesos y constantes del encoder en float32, mientras que la tabla de embeddings de palabras permanece en float16 con un Cast posterior al Gather. Esto evita las conversiones implícitas que ONNX Runtime realiza en CPU cuando el modelo está almacenado íntegramente en float16.

La relevancia de esta ficha es acotada: es una pieza de infraestructura para pipelines de procesamiento de texto en CPU, no un modelo generativo. Su interés radica en la mejora de velocidad medida (1,19 veces más rápido) manteniendo la paridad de salida con el modelo original, y en que el repositorio no incluye tokenizador, por lo que requiere el tokenizador de xlm-roberta-base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (base: segment-any-text/sat-6l-sm), exportado a ONNX |
| Parametros totales | no disponible (modelo base de 6 capas; cifra exacta no publicada) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | float32 (encoder) y float16 (tabla de embeddings y tensores de E/S); no se documentan otras variantes |
| Idiomas soportados | no disponible (el tokenizador requerido es xlm-roberta-base, multilingüe) |
| Licencia | MIT |
| Formato de pesos | ONNX (model_optimized.onnx) |

## Arquitectura y entrenamiento

El modelo es una exportación ONNX de sat-6l-sm, un encoder transformer de 6 capas especializado en segmentación de frases. La arquitectura subyacente corresponde al trabajo de wtpsplit (segment-any-text), que formula la segmentación como una tarea de clasificación sobre representaciones de tokens. Esta versión concreta no introduce cambios arquitectónicos: el grafo es el mismo que el del modelo upstream en la revisión d85d2b6ddfb19036c4c8e8b3b7ca45da684b0905.

La única modificación respecto al original es de formato numérico. El archivo model_optimized.onnx publicado por el autor original almacena los pesos en float16, lo que provoca conversiones alrededor de la mayoría de operadores en CPU. En esta versión, los pesos y constantes del encoder pasan a float32, mientras que la tabla de embeddings de palabras se mantiene en float16 con un Cast tras el Gather, de modo que el archivo crece unos 85 MB en lugar de unos 470 MB. Los tensores attention_mask y logits permanecen en float16 para que wtpsplit-lite pueda alimentar y leer el modelo sin cambios. No se documenta información sobre datos de entrenamiento, número de tokens, composición del dataset ni procesos de RLHF o DPO, ya que el entrenamiento corresponde al modelo upstream y no se detalla en esta model card.

## Capacidades

- Segmentación de frases: detecta fronteras de oración en texto plano, incluyendo documentos académicos en PDF procesados por bibr.
- Inferencia en CPU: optimizado para ONNX Runtime en CPU con soporte AVX2, sin requerir AVX-512.
- Compatibilidad con wtpsplit-lite: los tensores de entrada y salida en float16 permiten su uso directo con la librería wtpsplit-lite.
- Multilingüismo potencial: al usar el tokenizador de xlm-roberta-base, el modelo puede procesar texto en los idiomas cubiertos por dicho tokenizador, aunque no se documenta el rendimiento por idioma.
- No soporta generación de texto, razonamiento, código, matemáticas, visión, tool calling ni agentes. Es un modelo discriminativo de segmentación.

## Casos de uso

- Segmentación de artículos científicos en pipelines de extracción: bibr utiliza este modelo para dividir el texto de PDFs de papers publicados en frases antes de tareas posteriores de análisis o indexación. La mejora de velocidad en CPU reduce el tiempo de procesamiento de lotes grandes de documentos.
- Preprocesamiento para NLP en entornos sin GPU: al ejecutarse con ONNX Runtime en CPU, es adecuado para servidores sin acelerador hardware que necesitan dividir corpus en frases antes de tareas de embeddings o búsqueda.
- Construcción de corpus paralelos o alineación de frases: la segmentación consistente permite alinear oraciones entre documentos o traducciones, usando el tokenizador multilingüe de xlm-roberta-base.
- Indexación de documentación técnica: división de manuales y documentación en frases para motores de búsqueda o sistemas de recuperación aumentada (RAG) que operan sobre unidades oracionales.
- Análisis lingüístico y estadísticas textuales: cálculo de métricas por frase (longitud media, distribución de oraciones) en corpus académicos, donde la velocidad en CPU es crítica para volúmenes altos.
- Integración en herramientas de escritorio o CLI: al no requerir GPU y pesar 0,6 GB, puede empaquetarse en aplicaciones locales que necesitan segmentación de frases sin dependencias de servicios en la nube.

## Benchmarks y rendimiento

| Metrica | Resultado |
|---|---|
| Velocidad (244 textos de 6 papers, 4 nucleos CPU AVX2) | 1,19 veces más rápido que el modelo upstream (24,53 s a 20,57 s) |
| Paridad de salida | Mismas frases en los 244 textos; exportaciones de bibr idénticas en 20 papers, salvo timings y metadatos |
| Memoria | Aproximadamente la misma (1.877 MB frente a 1.917 MB de pico en el benchmark del segmentador) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible, ya que no es un modelo generativo. Las comprobaciones anteriores cubren una muestra pequeña y no una evaluación completa.

## Requisitos de hardware

- VRAM: no aplica; el modelo está diseñado para inferencia en CPU. El consumo de memoria RAM medido es de aproximadamente 1.877 MB de pico en el benchmark del segmentador.
- GPU recomendadas: no se documentan; el modelo es una build ONNX para CPU. Podría ejecutarse en GPU mediante ONNX Runtime con el proveedor CUDA, pero no se han publicado pruebas.
- CPU: requiere AVX2 como mínimo para el rendimiento medido; no requiere AVX-512.
- Cabe en hardware de consumo: sí, en cualquier CPU moderna con AVX2; el repositorio ocupa 0,6 GB.
- Opciones de despliegue: ONNX Runtime (librería onnxruntime) y wtpsplit-lite. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: 20,57 s para 244 textos de 6 papers en 4 núcleos CPU AVX2, según la model card.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| bibr-sat-6l-sm-hyb | no disponible (6 capas) | no disponible | ONNX (float32/float16 mixto) | MIT | 1,19 veces más rápido en CPU que el upstream |
| segment-any-text/sat-6l-sm | no disponible (6 capas) | no disponible | ONNX (float16) | MIT | Modelo original; referencia de paridad y velocidad |
| Otros modelos de wtpsplit (sat-12l, sat-3l, etc.) | no disponible | no disponible | no disponible | MIT (según familia) | No se dispone de datos comparativos en la información proporcionada |

No se dispone de datos de benchmarks comparativos adicionales en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo generativo: no responde preguntas, no genera texto ni razona; su única función es segmentar frases.
- Los logits se calculan en float32 y luego se redondean a float16, por lo que pueden diferir del modelo upstream en los últimos bits; una frontera justo en el umbral podría cambiar.
- Las comprobaciones de paridad y velocidad cubren una muestra pequeña (244 textos de 6 papers, 20 papers para exportaciones de bibr), no una evaluación exhaustiva.
- El repositorio no incluye tokenizador; es obligatorio usar el de xlm-roberta-base, lo que introduce una dependencia externa.
- No se documentan sesgos conocidos ni riesgos de alucinación, dado que no genera contenido; sin embargo, los errores de segmentación pueden propagarse a tareas posteriores.
- Licencia MIT: permite uso comercial y modificación, pero se recomienda conservar el aviso de copyright de los autores originales de wtpsplit.
- El rendimiento medido depende de AVX2 y de 4 núcleos; en hardware sin AVX2 o con menos núcleos la mejora podría no mantenerse.

## Enlaces

- Hugging Face: https://huggingface.co/scienceverse/bibr-sat-6l-sm-hyb
- Modelo base: https://huggingface.co/segment-any-text/sat-6l-sm
- Repositorio bibr: https://github.com/scienceverse/bibr
- Tokenizador requerido: https://huggingface.co/xlm-roberta-base
