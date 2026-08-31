# bratao/PortNOIE

## Resumen

PortNOIE es un modelo neuronal de extracción abierta de información (Open Information Extraction, OpenIE) para portugués, desarrollado por Bruno Cabral, Marlo Souza y Daniela Barreiro Claro del grupo FORMAS de la Universidad Federal de Bahía (Brasil). Fue presentado en 2022 en un artículo académico y su checkpoint histórico se ha publicado ahora en Hugging Face acompañado de una interfaz Python moderna. El modelo extrae tripletas `(ARG0, V, ARG1)` a partir de una oración, es decir, identifica el sujeto, el verbo y el objeto de proposiciones abiertas sin restricción de dominios predefinidos.

A diferencia de los modelos generativos actuales, PortNOIE es un etiquetador de secuencias supervisado basado en una arquitectura LSTM con embeddings contextuales Flair. No utiliza prompts ni instrucciones: recibe texto plano en portugués y devuelve estructuras triples. El checkpoint publicado corresponde a la versión LSTM + Flair de 2022, no al modelo BERT que se reportó posteriormente como mejor en la tesis doctoral. Su relevancia radica en ser una referencia histórica para la investigación en OpenIE para portugués, con una migración experimental a PyTorch moderno y herramientas de verificación de integridad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LSTM bidireccional con embeddings contextuales Flair (sequence labeling) |
| Parametros totales | no disponible (checkpoint de 74,8 MB, pero sin recuento oficial) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de etiquetado por secuencias, sin ventana de contexto explícita) |
| Tipos de cuantizacion | no disponible (pesos en punto flotante, sin versiones cuantizadas publicadas) |
| Idiomas soportados | portugues (pt) |
| Licencia | GPL-3.0-only |
| Formato de pesos | checkpoint PyTorch (`model_final/model.th`) |

## Arquitectura y entrenamiento

PortNOIE emplea una arquitectura de etiquetado de secuencias basada en una LSTM bidireccional combinada con embeddings contextuales de Flair. Este enfoque fue común en tareas de extracción de información antes de la adopción masiva de transformers. El modelo fue entrenado de forma supervisada sobre un corpus anotado manualmente de extracciones OpenIE en portugués, según se describe en el artículo de 2022. No se dispone de detalles sobre el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de refuerzo o ajuste fino adicional.

El checkpoint publicado es el resultado del entrenamiento de 2022 y ha sido migrado experimentalmente a un backend moderno de PyTorch. La migración no garantiza equivalencia numérica con el pipeline original de AllenNLP, aunque la inferencia funciona correctamente en las pruebas realizadas. El modelo no es un checkpoint de Transformers `AutoModel`, por lo que no debe cargarse con `from_pretrained()`; se recomienda usar los paquetes Python oficiales (`portuguese-openie` o `portnoie`) que gestionan la descarga y verificación de integridad.

## Capacidades

- Extracción de tripletas `(ARG0, V, ARG1)` a partir de oraciones en portugués.
- Identificación de sujeto, verbo y objeto en proposiciones abiertas.
- Funcionamiento como etiquetador de secuencias supervisado, sin necesidad de prompts.
- Soporte para uso offline mediante caché local y verificación de checksums.
- Integración con spaCy para anotación lingüística (modelo `pt_core_news_lg`).
- No soporta generación de texto, razonamiento, tool calling, agentes ni capacidades multimodales.

## Casos de uso

- Extracción de relaciones en corpus académicos: investigadores en procesamiento del lenguaje natural pueden utilizar PortNOIE para extraer tripletas de artículos científicos en portugués y construir bases de conocimiento.
- Construcción de grafos de conocimiento: a partir de textos periodísticos o enciclopédicos, el modelo permite poblar grafos con relaciones sujeto-verbo-objeto.
- Análisis de textos legales o administrativos: extracción de obligaciones, sujetos y acciones en documentos normativos en portugués.
- Preprocesamiento para sistemas de pregunta-respuesta: las tripletas extraídas pueden alimentar motores de búsqueda semántica o sistemas de QA basados en conocimiento estructurado.
- Evaluación comparativa de métodos OpenIE: al ser un checkpoint histórico, sirve como línea base para comparar nuevos sistemas de extracción abierta en portugués.
- Enseñanza e investigación en NLP: el código y los paquetes asociados facilitan la reproducción de experimentos y el estudio de arquitecturas de etiquetado de secuencias.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks detallados en la información disponible. El artículo original (Cabral et al., 2022) reporta que PortNOIE supera al estado del arte previo en OpenIE para portugués, tanto en métodos basados en reglas como en métodos neuronales, evaluado sobre un corpus anotado manualmente. Sin embargo, no se proporcionan cifras concretas (como F1, precisión o recall) en la documentación pública del repositorio. La migración moderna no reclama equivalencia de precisión con el modelo original.

## Requisitos de hardware

- El checkpoint del modelo ocupa aproximadamente 75 MB, lo que lo hace viable en CPU sin necesidad de GPU.
- El modelo spaCy `pt_core_news_lg` (568 MB) es necesario para la anotación, pero se descarga por separado.
- Requiere Python 3.10–3.13 y PyTorch (CPU es suficiente para inferencia).
- No se especifican requisitos de VRAM; para uso en GPU, cualquier tarjeta con más de 1 GB de memoria sería suficiente, aunque no es necesario.
- Opciones de despliegue: paquetes Python `portuguese-openie` y `portnoie`; no se menciona compatibilidad con vLLM, llama.cpp u Ollama al no ser un modelo generativo.
- Latencia y throughput no disponibles; en CPU, la inferencia sobre oraciones cortas debería ser de milisegundos, pero no hay mediciones oficiales.

## Comparativa con modelos similares

No se dispone de una comparativa directa con otros modelos OpenIE para portugués en la información proporcionada. El artículo original menciona que PortNOIE supera a sistemas previos como los basados en reglas (p. ej., ReVerb, ClausIE adaptados) y otros métodos neuronales, pero no se listan nombres específicos ni métricas. En el ecosistema actual, existen modelos generativos como Llama o Qwen que pueden realizar extracción de información mediante prompts, pero no son comparables directamente por su naturaleza y tamaño. Por tanto, la comparativa detallada no está disponible.

## Limitaciones y advertencias

- La migración moderna no ha establecido equivalencia numérica con el pipeline original de AllenNLP; no se garantiza la misma precisión.
- El checkpoint publicado no es el mejor modelo BERT reportado en la tesis doctoral, sino la versión LSTM + Flair de 2022.
- La extracción puede ser incompleta o incorrecta; no realiza verificación de hechos.
- El backend legacy (AllenNLP) tiene dependencias con vulnerabilidades conocidas; solo debe usarse en entornos aislados y offline para reproducción, nunca en producción.
- No se deben cargar archivos pickle arbitrarios ni deshabilitar la validación de checksums.
- Licencia GPL-3.0-only, que puede imponer restricciones de copyleft en proyectos comerciales propietarios.
- Idioma limitado al portugués; no soporta otros idiomas.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/bratao/PortNOIE
- Artículo (Springer): https://link.springer.com/chapter/10.1007/978-3-030-98305-5_23
- GitHub del autor: https://github.com/bratao
- Modelo relacionado (Llama fine-tuned OpenIE): https://huggingface.co/bratao/llama7b-finetuned-openie-lora
