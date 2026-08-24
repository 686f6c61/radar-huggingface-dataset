# CondarcoIntel/phishing-url-detector

## Resumen

El modelo `CondarcoIntel/phishing-url-detector` es un clasificador de texto diseñado para detectar URLs de phishing, publicado en HuggingFace por el usuario CondarcoIntel. Se basa en la arquitectura DistilBERT, una versión destilada de BERT que reduce el número de parámetros a 66,9 millones, lo que lo hace ligero y adecuado para despliegues con recursos limitados. El pipeline declarado es `text-classification`, por lo que el modelo recibe una URL (o posiblemente un texto asociado) y devuelve una etiqueta binaria indicando si es phishing o legítima.

La relevancia de este modelo radica en la creciente necesidad de herramientas automáticas de ciberseguridad que puedan filtrar enlaces maliciosos en tiempo real, especialmente en entornos de correo electrónico, navegación web o mensajería. Sin embargo, la model card publicada es una plantilla genérica sin información sustancial: no se especifican datos de entrenamiento, hiperparámetros, métricas de evaluación ni licencia. Esto limita seriamente su uso en producción sin una validación adicional por parte del usuario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DistilBERT (transformer encoder) |
| Parametros totales | 66.955.010 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible (DistilBERT tipicamente soporta 512 tokens, pero no se confirma) |
| Tipos de cuantizacion | no disponible (solo se publican pesos en safetensors) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en DistilBERT, una arquitectura transformer encoder que destila el conocimiento de BERT-base mediante destilacion de conocimiento. DistilBERT conserva el 97% de las capacidades de BERT con un 40% menos de parametros y un 60% mas de velocidad en inferencia. La configuracion tipica de DistilBERT incluye 6 capas, 768 dimensiones ocultas y 12 cabezas de atencion, aunque no se confirma si este checkpoint mantiene exactamente esa configuracion.

No se dispone de informacion sobre el proceso de entrenamiento: ni el dataset utilizado, ni el numero de tokens, ni si se aplicaron tecnicas de fine-tuning adicionales como RLHF o DPO. La model card no menciona ningun procedimiento de preprocesado ni hiperparametros. El tag `arxiv:1910.09700` enlaza al paper original de DistilBERT, lo que sugiere que el modelo parte de un checkpoint preentrenado de DistilBERT y se ha fine-tuneado para la tarea de clasificacion de phishing, pero no hay evidencia publica de ello mas alla de la arquitectura.

## Capacidades

- Clasificacion de texto binaria: el modelo esta disenado para distinguir entre URLs de phishing y URLs legitimas, devolviendo una probabilidad o etiqueta para cada clase.
- Inferencia ligera: al ser un modelo de 67M parametros, puede ejecutarse en CPU con baja latencia, lo que lo hace apto para filtrado en tiempo real.
- Integracion con el ecosistema transformers: compatible con la libreria `transformers` de HuggingFace, lo que facilita su uso en pipelines de Python.
- No se han documentado capacidades adicionales como tool calling, agentes, razonamiento multi-paso o soporte multilingue.

## Casos de uso

- Filtrado de correo electronico: el modelo puede integrarse en un servidor de correo para analizar los enlaces contenidos en los mensajes entrantes y marcar aquellos que sean sospechosos de phishing antes de que lleguen al usuario final.
- Extension de navegador de seguridad: una extension que intercepte las URLs visitadas y las envie al modelo para una comprobacion instantanea, mostrando una advertencia si la probabilidad de phishing es alta.
- API de analisis de URLs: desplegar el modelo como un microservicio (por ejemplo, con FastAPI o TGI) que reciba URLs via HTTP y devuelva una puntuacion de riesgo, util para SIEM o plataformas de threat intelligence.
- Preprocesado en pipelines de ciberseguridad: como primer filtro en un sistema de deteccion de amenazas que combine multiples modelos (por ejemplo, analisis de contenido, reputacion de dominio, etc.).
- Educacion y concienciacion: herramienta didactica para demostrar como los modelos de IA pueden identificar enlaces maliciosos, util en cursos de seguridad informatica.
- Monitorizacion de enlaces en redes sociales: analizar URLs compartidas en plataformas publicas para detectar campanas de phishing antes de que se propaguen.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de exactitud, precision, recall o F1 sobre conjuntos de prueba estandar como MMLU, HumanEval o GSM8K (que no aplican a esta tarea), ni sobre datasets especificos de deteccion de phishing como PhishTank o URLhaus. Tampoco se comparan metricas con otros modelos similares.

## Requisitos de hardware

- VRAM estimada: al ser un modelo de 67M parametros, en precision fp32 ocupa aproximadamente 268 MB (66.955.010 x 4 bytes). Con cuantizacion a int8 se reduciria a unos 67 MB, y a int4 a unos 34 MB, aunque no se proporcionan pesos cuantizados.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM es suficiente, incluyendo tarjetas consumer como GTX 1650, RTX 2060 o integradas. En CPU, un procesador moderno puede ejecutar inferencias en decenas de milisegundos.
- Despliegue en consumer GPU: si, cabe perfectamente en GPUs de gama baja e incluso en CPU.
- Opciones de despliegue: al ser un modelo de transformers, puede servirse con vLLM, Text Generation Inference (TGI), o mediante un simple script con la libreria `transformers`. Tambien es compatible con `text-embeddings-inference` segun los tags, aunque no se detalla su uso.
- Latencia y throughput: no se dispone de mediciones oficiales. Como referencia, DistilBERT suele procesar cientos de secuencias por segundo en una GPU moderna, pero estos valores dependen del hardware y del tamaño de la secuencia.

## Comparativa con modelos similares

No se dispone de informacion suficiente para realizar una comparativa rigurosa. Existen otros modelos de deteccion de phishing en HuggingFace, como `r3ddkahili/final-complete-malicious-url-model` (basado en BERT-LoRA) o `pirocheto/phishing-url-detection`, pero no se han encontrado datos publicos de rendimiento de ninguno de ellos que permitan una comparacion objetiva. La falta de benchmarks y de detalles de entrenamiento impide establecer diferencias cuantitativas.

## Limitaciones y advertencias

- La model card no proporciona informacion sobre sesgos, riesgos o limitaciones tecnicas. Es una plantilla generica sin contenido sustancial.
- No se especifica la licencia, por lo que el uso comercial del modelo es incierto. Se recomienda contactar con el autor antes de utilizarlo en entornos de produccion.
- No hay datos de evaluacion: no se puede verificar la precision del modelo en la deteccion de phishing. Podria tener una alta tasa de falsos positivos o negativos.
- El modelo solo analiza la URL como texto, no el contenido de la pagina web. Esto limita su capacidad para detectar phishing que utiliza tecnicas de ofuscacion o que se aloja en dominios legitimos comprometidos.
- No se indica el idioma de entrenamiento, por lo que su rendimiento en URLs de dominios no ingleses o con caracteres no ASCII es desconocido.
- Al ser un modelo pequeno, su capacidad de generalizacion a variantes nuevas de phishing (por ejemplo, homografos o URLs acortadas) puede ser limitada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/CondarcoIntel/phishing-url-detector
- Paper de DistilBERT (arxiv:1910.09700): https://arxiv.org/abs/1910.09700
- Repositorio de ejemplo de deteccion de phishing con ML (no oficial): https://github.com/100Psycho007/ai-phishing-url-detector
- Estudio sobre deteccion de phishing con redes neuronales: https://www.nature.com/articles/s41598-024-74725-6
