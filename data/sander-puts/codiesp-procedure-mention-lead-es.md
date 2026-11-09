# sander-puts/codiesp-procedure-mention-lead-es

## Resumen

Codiesp procedure mention and lead-term detector (Spanish) es un modelo de etiquetado de tokens (token classification) desarrollado por Sander Puts y orientado a la codificacion clinica automatica en espanol. Concretamente, detecta menciones de procedimientos medicos en texto clinico, distinguiendo menciones externas y anidadas, y ademas identifica el termino cabeza (lead term) de cada mencion, es decir, la palabra que un codificador buscaria en el indice de ICD-10-PCS. Por ejemplo, para "biopsia hepatica percutanea" el lead term seria "biopsia".

El modelo parte del encoder PlanTL-GOB-ES/roberta-base-biomedical-clinical-es, un RoBERTa base preentrenado en dominio biomedico y clinico en espanol, al que se le anaden tres cabezas de clasificacion de tokens. Forma parte del ecosistema CEI-Trace, un conjunto de herramientas que codifica texto clinico con los libros oficiales de la CIE-10 usando modelos de lenguaje locales y capas de directrices y practica por entorno. Este detector se usa en combinacion con otros dos detectores de procedimientos del mismo autor para construir unidades de procedimiento que despues se codifican.

Es relevante porque aborda un paso intermedio critico en la codificacion clinica: la identificacion de menciones y terminos cabeza en textos en espanol, una tarea previa a la asignacion de codigos ICD-10-PCS. La licencia CC BY 4.0 permite uso comercial con atribucion, aunque el autor advierte explicitamente que no es apto para uso clinico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (RoBERTa base) con tres cabezas de token classification (mencion externa, mencion anidada, lead term) |
| Parametros totales | no disponible (encoder RoBERTa base, aproximadamente 125M; no confirmado en la informacion) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens (RoBERTa base); ventanas de 256 tokens con stride 128 en entrenamiento e inferencia |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | es (espanol) |
| Licencia | cc-by-4.0 |
| Formato de pesos | safetensors (encoder) y heads.pt (cabezas) |

## Arquitectura y entrenamiento

El modelo se construye sobre el encoder PlanTL-GOB-ES/roberta-base-biomedical-clinical-es (licencia Apache-2.0), un RoBERTa base preentrenado en corpus biomedicos y clinicos en espanol. Sobre el encoder se anaden tres cabezas de clasificacion de tokens: una para menciones externas de procedimientos, otra para menciones anidadas y otra para el termino cabeza de cada mencion. El repositorio separa el encoder afinado (carpeta `encoder/`) de las cabezas (`heads.pt`), y la arquitectura de las cabezas esta definida en `src/cei_trace/detection/ner_train.py` del repositorio CEI-Trace.

El entrenamiento utiliza las anotaciones de procedimientos del corpus CodiEsp. Los terminos cabeza se trazaron a partir de las anotaciones: el 75 % sin modelo y el resto completado por un modelo comercial en la nube (Claude) sobre el texto publico de CodiEsp. Se entrenaron 10 epocas con learning rate 3e-5, batch size 4, ventanas de 256 tokens con stride 128 y semilla 2025. La epoca se selecciono sobre el conjunto de desarrollo, escogiendo la epoca 8, con un F1 de solapamiento de 0.747 para menciones externas y 0.739 para terminos cabeza.

## Capacidades

- Deteccion de menciones de procedimientos medicos en texto clinico en espanol, incluyendo menciones externas y anidadas.
- Identificacion del termino cabeza (lead term) de cada mencion, orientado a la busqueda en el indice ICD-10-PCS.
- Etiquetado de tokens a nivel de subtoken con ventanas deslizantes de 256 tokens y stride 128 para textos largos.
- Integracion en el pipeline CEI-Trace mediante el comando `python pipelines/codiesp.py detect --model <carpeta>`.
- Combinacion con otros dos detectores del mismo autor (`codiesp-procedure-fragment-es` y `codiesp-procedure-dense-lead-es`) para construir unidades de procedimiento.
- Capacidad monoidioma: unicamente espanol.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso; es un modelo discriminativo de etiquetado, no generativo.

## Casos de uso

- Preprocesado para codificacion clinica automatica: el modelo identifica menciones de procedimientos y sus terminos cabeza en informes clinicos en espanol, generando la entrada estructurada que un sistema posterior de mapeo a ICD-10-PCS necesita para asignar codigos.
- Construccion de unidades de procedimiento en CEI-Trace: se usa junto con los detectores de fragmentos y de lead terms densos para componer unidades de procedimiento completas que el arnes de codificacion procesa, tal como describe `docs/REPRODUCE.md`.
- Extraccion de entidades para investigacion clinica: permite localizar procedimientos mencionados en corpus de casos clinicos publicados (por ejemplo, CodiEsp) para estudios retrospectivos o analisis de frecuencia de procedimientos.
- Anotacion asistida de corpus: sirve como preetiquetador para acelerar la anotacion manual de menciones y terminos cabeza en nuevos conjuntos de textos clinicos en espanol, reduciendo el esfuerzo de revisión humana.
- Indexacion y busqueda semantica de informes: las menciones y lead terms detectados pueden alimentar indices que permitan recuperar informes por procedimiento realizado, facilitando auditorias internas.
- Normalizacion de terminologia clinica: al aislar el termino cabeza, el modelo ayuda a agrupar variantes de redaccion de un mismo procedimiento ("biopsia hepatica percutanea", "biopsia del higado") bajo una forma canonica para su consulta en el indice ICD-10-PCS.
- Validacion de codificacion existente: comparar las menciones detectadas con los codigos ya asignados en un sistema de historia clinica permite senalar posibles omisiones o discrepancias para revision por codificadores humanos.

## Benchmarks y rendimiento

Los unicos datos publicados en la informacion disponible son los del conjunto de desarrollo del propio autor:

| Metrica | Resultado (epoca 8, desarrollo) |
|---|---|
| F1 de solapamiento, menciones externas | 0.747 |
| F1 de solapamiento, terminos cabeza | 0.739 |

No se han publicado resultados comparativos con otros modelos (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, ya que se trata de un modelo de etiquetado de tokens especifico de dominio y no de un modelo generativo de proposito general.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; al tratarse de un encoder RoBERTa base (aproximadamente 125M de parametros), la inferencia en fp32 requiere del orden de 0.5-1 GB de VRAM, aunque esta cifra no esta confirmada en la informacion proporcionada.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente en la practica para un encoder de este tamano; no se especifican modelos concretos en la informacion disponible.
- Cabe en GPU de consumo: si, previsiblemente en cualquier GPU de consumo moderna (GTX 1060 o superior, RTX 3060, RTX 4090, etc.), aunque no se confirma en la documentacion.
- Opciones de despliegue: la via documentada es el pipeline CEI-Trace (`pipelines/codiesp.py detect`), que carga el encoder desde `encoder/` y las cabezas desde `heads.pt`. No se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI, que ademas no aplican a un modelo de clasificacion de tokens.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se dispone de datos comparativos publicados en la informacion proporcionada. Como referencia estructural, el modelo se apoya en el encoder PlanTL-GOB-ES/roberta-base-biomedical-clinical-es, del que hereda tamano y contexto, pero no se han encontrado en la informacion disponible otros detectores de menciones y terminos cabeza de procedimientos ICD-10-PCS en espanol con los que compararlo de forma cuantitativa.

| Modelo | Parametros | Contexto | Tarea | Licencia |
|---|---|---|---|---|
| codiesp-procedure-mention-lead-es | no disponible (encoder RoBERTa base) | 512 tokens | Menciones y lead terms de procedimientos | CC BY 4.0 |
| PlanTL-GOB-ES/roberta-base-biomedical-clinical-es | no disponible (RoBERTa base) | 512 tokens | Encoder base biomedico (no especifico de la tarea) | Apache-2.0 |
| codiesp-procedure-fragment-es | no disponible | no disponible | Deteccion de fragmentos de procedimientos | no disponible |
| codiesp-procedure-dense-lead-es | no disponible | no disponible | Deteccion densa de lead terms | no disponible |

## Limitaciones y advertencias

- No apto para uso clinico: el autor lo indica explicitamente en la model card. No debe emplearse para decisiones medicas sin supervision humana.
- Entrenado exclusivamente con anotaciones de procedimientos de CodiEsp, un corpus de casos clinicos publicados; puede generalizar mal a otros generos textuales (informes de alta, notas de urgencias, etc.) o a variantes dialectales del espanol no representadas.
- El 25 % de los terminos cabeza de entrenamiento se completaron con un modelo comercial en la nube (Claude), lo que introduce posibles errores de anotacion heredados en las etiquetas.
- Riesgo de alucinacion no aplica en sentido generativo, pero si existe riesgo de falsos positivos y falsos negativos en la deteccion de menciones, especialmente en textos con abreviaturas, siglas o redaccion atipica.
- Ventana de contexto limitada a 512 tokens (RoBERTa base); los textos largos requieren segmentacion con solapamiento, lo que puede fragmentar menciones en los limites de ventana.
- Modelo monoidioma: solo espanol. No soporta otros idiomas.
- Licencia CC BY 4.0: permite uso comercial con atribucion, pero debe citarse adecuadamente al autor y el corpus CodiEsp (Miranda-Escalada et al., CLEF eHealth 2020).
- El modelo no asigna codigos ICD-10-PCS por si mismo; solo detecta menciones y terminos cabeza, por lo que debe integrarse en un pipeline de codificacion completo.
- El rendimiento publicado (F1 de solapamiento 0.747 y 0.739 en desarrollo) es moderado y procede de un unico conjunto de desarrollo; no hay validacion externa reportada en la informacion disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sander-puts/codiesp-procedure-mention-lead-es
- Repositorio CEI-Trace: https://github.com/putssander/CEI-Trace
- Modelo base: https://huggingface.co/PlanTL-GOB-ES/roberta-base-biomedical-clinical-es
- Articulo de referencia: Puts S, Dekker A. *CEI-Trace: fitting ICD-10 coding to a setting's guidelines and practice in layers around one official core* (2026).
- Corpus CodiEsp: Miranda-Escalada et al., CLEF eHealth 2020, doi:10.5281/zenodo.3837305
