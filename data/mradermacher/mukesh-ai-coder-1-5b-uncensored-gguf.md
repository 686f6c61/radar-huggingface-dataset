# mradermacher/Mukesh-AI-Coder-1.5B-Uncensored-GGUF

## Resumen

Mukesh-AI-Coder-1.5B-Uncensored-GGUF es la distribucion en formato GGUF del modelo Mukesh-AI-Coder-1.5B-Uncensored, un modelo de lenguaje especializado en generacion de codigo (principalmente Python) desarrollado por el autor "Mukesh" y publicado originalmente por el usuario Kaliyo en Hugging Face. La cuantizacion la realiza mradermacher, un conocido distribuidor de versiones GGUF de modelos open source. El modelo parte de la arquitectura Qwen2, lo que le aporta una base solida para tareas de programacion.

El modelo se presenta como "uncensored" y "abliterated", terminos que indican que se ha aplicado una tecnica de ablacion de direcciones de rechazo para eliminar los mecanismos de negativa aprendidos durante el alineamiento, de modo que el modelo responde a practicamente cualquier peticion sin filtros de contenido. Con 1.543.714.304 parametros (aproximadamente 1,5B), es un modelo pequeno que puede ejecutarse en hardware de consumo.

La relevancia de esta ficha reside en su disponibilidad en multiples cuantizaciones GGUF (desde Q2_K de 0,8 GB hasta f16 de 3,2 GB), lo que lo hace accesible para despliegues locales en CPU o GPU modestas. Esta pensado para desarrolladores que necesitan un asistente de codigo ligero, sin restricciones de contenido y ejecutable en entornos con recursos limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen2) |
| Parametros totales | 1.543.714.304 (aproximadamente 1,5B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en, hi |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones); safetensors en el modelo base |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Qwen2, un transformer decoder-only con atencion por grupos (GQA) y normalizacion RMSNorm, segun la convencion habitual de esta familia. El modelo original fue ajustado por "Mukesh" y publicado por Kaliyo; la informacion disponible no detalla el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron fases de RLHF o DPO.

El rasgo tecnico mas destacable es el proceso de "abliteration" mencionado en las etiquetas: se trata de una tecnica de edicion de pesos que identifica y elimina las direcciones en el espacio de activaciones asociadas al rechazo de peticiones, de modo que el modelo deja de negarse a responder. No se dispone de informacion sobre la metodologia concreta de entrenamiento, los datos utilizados ni las innovaciones adicionales (decodificacion especulativa, atencion lineal, etc.).

## Capacidades

- Generacion de codigo, con enfasis declarado en Python segun las etiquetas del modelo.
- Generacion de texto general y conversacion (etiqueta "conversational").
- Razonamiento basico y respuesta a preguntas tecnicas.
- Comportamiento "uncensored"/"abliterated": responde a peticiones que otros modelos rechazarian.
- Soporte multilingue limitado a ingles (en) e hindi (hi).
- No se ha documentado soporte de tool calling, function calling, agentes, vision, audio ni modo de razonamiento explicito.

## Casos de uso

- Asistente de autocompletado de codigo en el editor: con solo 1,5B de parametros y cuantizaciones de 0,8-1,2 GB, puede ejecutarse en local junto al IDE para sugerir lineas y funciones Python con latencia baja.
- Generacion de scripts y utilidades de automatizacion: el modelo puede producir scripts Python para tareas de procesamiento de datos, scraping o administracion de sistemas, aprovechando su especializacion en codigo.
- Entornos de desarrollo sin conectividad: al ser un GGUF ejecutable con llama.cpp u Ollama, permite disponer de un asistente de codigo en maquinas aisladas o air-gapped.
- Prototipado rapido en hardware de consumo: con cuantizacion Q4_K_M (1,1 GB) cabe en GPU integradas o en CPU, lo que permite experimentar con generacion de codigo sin infraestructura dedicada.
- Educacion y experimentacion con tecnicas de abliteration: util como caso de estudio para investigadores que quieran analizar el comportamiento de modelos sin filtros de rechazo en un tamano manejable.
- Traduccion y generacion de contenido bilingue ingles-hindi: el modelo declara soporte para ambos idiomas, por lo que puede emplearse en tareas de asistencia tecnica en hindi.
- Generacion de documentacion tecnica y comentarios de codigo: puede redactar docstrings y explicaciones a partir de fragmentos de codigo fuente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,8-1,2 GB con cuantizaciones Q2_K a Q5_K_M; 1,4 GB con Q6_K; 1,7 GB con Q8_0; 3,2 GB con f16.
- GPU recomendadas: cualquier GPU consumer con al menos 2-4 GB de VRAM (GTX 1050 Ti, RTX 3050, RTX 4060, etc.); tambien puede ejecutarse en CPU.
- Cabe en GPU consumer: si, practicamente en cualquier GPU moderna e incluso en muchas integradas con cuantizaciones bajas.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF; el modelo base es compatible con transformers.
- Latencia y throughput estimados: no disponible (no se han publicado mediciones).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Mukesh-AI-Coder-1.5B-Uncensored | 1,5B | no disponible | en, hi | Apache 2.0 | GGUF, safetensors |
| Qwen2.5-Coder-1.5B | 1,5B | 32K (segun documentacion publica de Qwen) | multilingue | Apache 2.0 | safetensors, GGUF |
| DeepSeek-Coder-1.3B | 1,3B | 16K (segun documentacion publica de DeepSeek) | en, zh | DeepSeek License | safetensors, GGUF |

La comparativa se limita a parametros, contexto y licencia, ya que no se dispone de resultados de benchmarks de este modelo que permitan una comparacion de rendimiento rigurosa. Frente a alternativas como Qwen2.5-Coder-1.5B o DeepSeek-Coder-1.3B, la diferencia principal es el caracter "uncensored" y el soporte declarado de hindi, a costa de una documentacion tecnica mucho mas limitada.

## Limitaciones y advertencias

- Modelo "uncensored"/"abliterated": no aplica filtros de rechazo, por lo que puede generar contenido ofensivo, ilegal o peligroso; no es adecuado para aplicaciones orientadas al publico sin capas adicionales de moderacion.
- Riesgo elevado de alucinacion: con solo 1,5B de parametros, la fiabilidad factografica y la correccion de codigo complejo son limitadas.
- Contexto no documentado: se desconoce la longitud maxima de contexto, lo que dificulta planificar casos de uso con entradas largas.
- Soporte de idiomas restringido a ingles e hindi; el castellano no esta declarado y su rendimiento en este idioma es incierto.
- Documentacion tecnica minima: no hay informacion sobre datos de entrenamiento, benchmarks ni metodologia de abliteration.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantias sobre el comportamiento del modelo ni sobre la legalidad del contenido generado.
- Sin adopcion verificable: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validacion por parte de la comunidad.
- No recomendado para produccion critica sin evaluacion previa y sin mecanismos de moderacion y validacion de salida.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Mukesh-AI-Coder-1.5B-Uncensored-GGUF
- Modelo base: https://huggingface.co/Kaliyo/Mukesh-AI-Coder-1.5B-Uncensored
- Pagina de resumen de cuantizaciones de mradermacher: https://hf.tst.eu/model#Mukesh-AI-Coder-1.5B-Uncensored-GGUF
- FAQ y solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de tipos de cuantizacion de Artefact2: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
