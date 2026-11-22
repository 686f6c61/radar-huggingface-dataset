# Peymandc/MiniCPM5-1B-Uncensored-Flawless-Peymandc-GGUF

## Resumen

MiniCPM5-1B Uncensored Flawless (GGUF) es una conversión a formato GGUF de un checkpoint de MiniCPM5-1B modificado mediante la técnica Heretic v2.1.0 con ablación de rango arbitrario (ARA). El modelo original lo desarrolla OpenBMB y esta variante la publica el usuario Peymandc. El objetivo de la modificación no es mejorar capacidades, sino eliminar el comportamiento de rechazo aprendido del modelo base, de modo que responda a peticiones que el original declinaría. Está pensado para inferencia local eficiente en CPU o GPU de gama baja.

Arquitectónicamente hereda todo del MiniCPM5-1B original: un transformer de aproximadamente 1.080 millones de parámetros (1,08 B), con soporte declarado de contexto largo, tool calling y uso en dispositivo. La modificación Heretic aplica una ablación sobre las capas 7 a 15 del modelo, sin reentrenamiento ni fine-tuning supervisado convencional. El resultado se distribuye en cuatro cuantizaciones GGUF (Q4_K_M, Q6_K, Q8_0 y BF16) con tamaños de fichero entre 688 MB y 2,17 GB.

La relevancia de esta ficha es doble: por un lado documenta una variante "uncensored" con licencia Apache-2.0 y huella distribucional muy baja respecto al original (divergencia KL de 0,0070); por otro, advierte de que no se han publicado benchmarks de calidad o velocidad para las cuantizaciones GGUF, por lo que las cifras de rendimiento deben tratarse con cautela.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (MiniCPM5, derivada de openbmb/MiniCPM5-1B); detalles internos no disponibles en la informacion proporcionada |
| Parametros totales | 1.080.632.832 (1,08 B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (el autor etiqueta "long-context" pero no especifica la ventana) |
| Tipos de cuantizacion | Q4_K_M (688 MB), Q6_K (892 MB), Q8_0 (1,15 GB), BF16 (2,17 GB) |
| Idiomas soportados | Ingles (en), chino (zh) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp); el checkpoint fuente modificado esta en Safetensors/BF16 |

## Arquitectura y entrenamiento

El modelo es una variante del MiniCPM5-1B de OpenBMB, un transformer de 1,08 B de parametros. La modificacion no consiste en un preentrenamiento nuevo ni en un fine-tuning supervisado convencional: se aplica Heretic v2.1.0 con su metodo de ablacion de rango arbitrario (ARA) sobre el checkpoint BF16 original. La configuracion documentada por el autor es `start_layer_index` = 7, `end_layer_index` = 15, `preserve_good_behavior_weight` = 0,9075, `steer_bad_behavior_weight` = 0,0001, `overcorrect_relative_weight` = 0,5820 y `neighbor_count` = 1. Es decir, la intervencion se concentra en las capas 7 a 15.

No se dispone de informacion sobre el volumen de tokens de entrenamiento del modelo base, la composicion de su dataset ni si se aplicaron tecnicas de RLHF o DPO, ya que la model card de esta variante no los detalla. La innovacion tecnica destacable es precisamente la ablacion selectiva de direcciones de rechazo con un peso alto de preservacion del comportamiento bueno y un peso casi nulo de refuerzo del comportamiento no deseado, lo que se traduce en una divergencia KL muy baja (0,0070) respecto al original segun la evaluacion reportada.

## Capacidades

- Generacion de texto conversacional en ingles y chino.
- Razonamiento y generacion de codigo: el modelo base es un LLM de proposito general; las capacidades especificas de codigo y matematicas no estan cuantificadas en la informacion disponible.
- Tool calling / function calling: etiquetado por el autor como capacidad soportada, heredada del modelo base.
- Contexto largo: etiquetado como "long-context", aunque la longitud exacta no se especifica.
- Uso en dispositivo y edge AI: tamano de 1,08 B que permite ejecucion local en CPU o GPU modesta.
- Comportamiento sin rechazo: la modificacion Heretic reduce las respuestas de rechazo (3/100 frente a 81/100 en el original segun el scorer de palabras clave de Heretic).
- No se documentan capacidades de vision, audio ni modo "thinking" explicito en la informacion proporcionada.

## Casos de uso

- Asistente conversacional local en dispositivos de gama baja: con la cuantizacion Q4_K_M (688 MB) puede ejecutarse en portatiles sin GPU dedicada mediante llama.cpp u Ollama, gestionando dialogos multi-turno con un consumo de memoria contenido.
- Prototipado rapido de agentes con tool calling: su soporte declarado de function calling permite integrarlo en flujos de agente ligeros para pruebas de concepto sin coste de API.
- Generacion de texto en ingles y chino en entornos sin conectividad: util para aplicaciones de escritorio o moviles que requieran inferencia offline en ambos idiomas.
- Investigacion sobre alineacion y seguridad: la variante permite estudiar el efecto de la ablacion ARA comparando respuestas con el modelo original, dado el bajo KL reportado.
- Filtrado y clasificacion de contenido en pipelines internos: su tamano reducido permite desplegarlo como componente auxiliar en tareas de etiquetado o reescritura de texto.
- Educacion y experimentacion con cuantizaciones: los cuatro formatos publicados (Q4_K_M, Q6_K, Q8_0, BF16) permiten medir el impacto de la precision en la calidad de salida en un mismo hardware.
- Despliegue en edge AI para asistentes de texto embebidos: el checkpoint BF16 (2,17 GB) o Q8_0 (1,15 GB) caben en GPUs integradas y en placas con memoria unificada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, etc.) ni de velocidad para esta variante ni para sus cuantizaciones GGUF en la informacion disponible. El autor indica explicitamente que no existen benchmarks comparativos de calidad o velocidad para las variantes GGUF.

La unica evaluacion reportada corresponde al checkpoint fuente BF16 modificado, con la metodologia de Heretic:

| Metrica | Checkpoint modificado (BF16) | MiniCPM5-1B original |
|---|---:|---:|
| Coincidencias de palabras clave de rechazo (KeywordRate) | 3/100 (3 %) | 81/100 (81 %) |
| Divergencia KL (KLDivergence) | 0,0070 | 0,0000 (referencia) |

Metodologia: KeywordRate sobre los primeros 100 prompts de `mlabonne/harmful_behaviors` (`test[:100]`), contando coincidencias de palabras clave de rechazo sin distincion de mayusculas. KLDivergence sobre los primeros 100 prompts de `mlabonne/harmless_alpaca` (`test[:100]`), tomando el modelo original como referencia. Ambas son metricas proxy, no evaluaciones semanticas ni revisadas por humanos. Los ficheros GGUF no han sido evaluados de forma independiente.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia (solo pesos): Q4_K_M ~688 MB; Q6_K ~892 MB; Q8_0 ~1,15 GB; BF16 ~2,17 GB. El consumo real es mayor por la cache KV, buffers de runtime y longitud de contexto.
- GPU recomendadas: cualquier GPU consumer con al menos 4-8 GB de VRAM puede alojar las cuantizaciones pequenas con contexto moderado; GPUs de datacenter (A100, H100) no son necesarias y estarian sobredimensionadas para 1,08 B de parametros.
- Cabe en GPU consumer: si, en practicamente todas las GPU dedicadas modernas (RTX 3060 en adelante) e incluso en GPUs integradas con memoria unificada para las cuantizaciones Q4_K_M y Q6_K.
- Opciones de despliegue: llama.cpp y cualquier frontend compatible con GGUF (Ollama, LM Studio, llama-cpp-python); el tag `endpoints_compatible` sugiere compatibilidad con endpoints tipo OpenAI, aunque no se detalla.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---:|---|---|---|---|---|
| MiniCPM5-1B Uncensored Flawless (esta ficha) | 1,08 B | no disponible | en, zh | Apache-2.0 | GGUF | Variante sin rechazo via Heretic ARA |
| openbmb/MiniCPM5-1B (original) | 1,08 B | no disponible | en, zh | Apache-2.0 | Safetensors | Modelo base sin modificar; rechazo 81/100 |
| Peymandc/MiniCPM5-1B-Uncensored-Flawless-Peymandc | 1,08 B | no disponible | en, zh | Apache-2.0 | Safetensors (BF16) | Checkpoint fuente modificado del que derivan estos GGUF |

No se dispone de datos de rendimiento comparativo con otras familias de modelos de ~1 B en la informacion proporcionada, por lo que la comparativa se limita a las variantes del propio MiniCPM5-1B.

## Limitaciones y advertencias

- Modelo "uncensored": la ablacion elimina el comportamiento de rechazo, lo que implica un riesgo elevado de generar contenido danino, sesgado o inapropiado sin filtros. No es apto para aplicaciones de cara al publico sin moderacion adicional.
- Sesgos: no se documentan evaluaciones de sesgo; el modelo hereda los sesgos del MiniCPM5-1B original y de sus datos de entrenamiento, no detallados.
- Alucinacion: no se han publicado mediciones de fidelidad; como todo LLM de 1,08 B, la tasa de alucinacion puede ser significativa en tareas de conocimiento factual.
- Contexto e idiomas: solo se declaran ingles y chino; el castellano no figura como idioma soportado y el rendimiento en el mismo es incierto. La longitud exacta de contexto no se especifica.
- Cuantizaciones no evaluadas: los ficheros GGUF no han sido evaluados de forma independiente y la cuantizacion puede alterar el comportamiento respecto al BF16 fuente.
- Licencia: Apache-2.0 permite uso comercial, pero el usuario asume la responsabilidad legal y etica del contenido generado por una variante sin rechazo.
- Metricas de seguridad limitadas: las cifras de rechazo y KL proceden de scorers proxy de Heretic, no de evaluaciones semanticas ni de revision humana.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ecosistema minimo, sin validacion comunitaria.

## Enlaces

- Repositorio GGUF: https://huggingface.co/Peymandc/MiniCPM5-1B-Uncensored-Flawless-Peymandc-GGUF
- Checkpoint fuente modificado (Safetensors): https://huggingface.co/Peymandc/MiniCPM5-1B-Uncensored-Flawless-Peymandc
- Modelo base original: https://huggingface.co/openbmb/MiniCPM5-1B
- Heretic (herramienta de ablacion): https://github.com/p-e-w/heretic
- Directorio de reproduccion: https://huggingface.co/Peymandc/MiniCPM5-1B-Uncensored-Flawless-Peymandc/tree/main/reproduce
- Pagina de soporte del autor: https://huggingface.co/spaces/Peymandc/support
