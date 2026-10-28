# 0xBrandon/Decision-WAF-V1.1-0.4B-GGUF

## Resumen

`0xBrandon/Decision-WAF-V1.1-0.4B-GGUF` es un repositorio de pesos alojado en HuggingFace por el usuario 0xBrandon, publicado bajo licencia Apache 2.0. El nombre del repositorio indica un modelo de aproximadamente 0,4 mil millones de parametros, en su version 1.1, orientado por nomenclatura a la toma de decisiones en el ambito de un WAF (Web Application Firewall) y distribuido exclusivamente en formato GGUF, lo que sugiere inferencia mediante llama.cpp u otros runners compatibles. Ninguno de estos extremos esta confirmado: la model card publicada no contiene mas que la linea de licencia, sin descripcion, arquitectura, datos de entrenamiento ni resultados.

El repositorio no incluye pipeline declarado, idiomas declarados, ejemplos de uso ni evaluaciones. En el momento de la consulta registra 0 descargas y 0 likes, y la metadata indica fecha de creacion y ultima actualizacion identicas (27 de octubre de 2026), un valor anomalo que conviene verificar. Se trata, por tanto, de un artefacto practicamente sin documentacion, no de un modelo con ficha tecnica verificable.

Su relevancia potencial, si se confirma la hipotesis de uso, residiria en el nicho de la clasificacion ligera de peticiones HTTP para pre-filtrado en un WAF: un modelo de 0,4B cuantizado en GGUF puede ejecutarse en CPU o en GPU de consumo con latencias de milisegundos, lo que encaja en la ruta critica de un proxy inverso. No obstante, sin model card, sin benchmark y sin dataset descrito, no es posible recomendar su uso en produccion ni evaluar su calidad frente a reglas deterministas o clasificadores supervisados convencionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 0,4 B (inferido del nombre del repositorio; no confirmado en la model card) |
| Parametros activos | no disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF; niveles concretos (Q4_K_M, Q8_0, etcetera) no disponibles |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

No disponible. La model card no describe la arquitectura (transformer, MoE, SSM ni hibrida), no detalla el numero de tokens de entrenamiento, la composicion del corpus, ni si se aplicaron tecnicas de alineacion como RLHF, DPO o SFT. Tampoco se documenta ninguna innovacion tecnica (atencion lineal, decodificacion especulativa, destilacion, tokenizer, etcetera).

El unico dato estructural deducible es el formato de publicacion: al tratarse de un unico repositorio GGUF, el artefacto esta pensado para inferencia con llama.cpp y derivados. No se ofrecen pesos en safetensors ni se indica el modelo base a partir del cual se genero la cuantizacion, lo que impide rastrear su procedencia y limita la reproducibilidad.

## Capacidades

- Generacion de texto, razonamiento, codigo o matematicas: no disponible; no hay evidencia de que el modelo sea generativo.
- Clasificacion o decision binaria/multiclase orientada a WAF: plausible por nomenclatura, no confirmado.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Capacidades especiales (modo thinking, vision, audio): no disponible.
- Formato de salida esperado (etiqueta, score, JSON): no disponible.

## Casos de uso

Los siguientes escenarios son hipotesis de aplicacion derivadas del nombre del modelo y de su tamano; no estan respaldados por documentacion del autor. Se indican como tales para evitar atribuciones infundadas.

- Pre-filtrado de peticiones en un WAF: si el modelo emite una etiqueta de decision (permitir/bloquear), un 0,4B en GGUF puede colocarse delante de un motor de reglas para reducir el volumen de peticiones que llegan a la inspeccion profunda. Su tamano permite inferencia en CPU con latencia de milisegundos, aunque la tasa de falsos positivos es desconocida.
- Triage de alertas de seguridad: clasificar payloads sospechosos capturados en logs y priorizar los que requieren revision humana. El interes esta en el coste por inferencia bajo, no en una precision documentada.
- Clasificacion de entrada de usuario en formularios y APIs: detectar cadenas con patrones de inyeccion (SQLi, XSS) como capa complementaria a las firmas. Requiere validacion previa contra un corpus etiquetado propio.
- Procesamiento en el borde (edge): al caber en un contenedor pequeno junto a un proxy inverso, permitiria filtrar trafico en pasarelas con recursos limitados sin depender de un servicio externo.
- Etiquetado asistido de datasets de seguridad: usar el modelo para pre-anotar muestras que luego se revisan manualmente, acelerando la construccion de corpus de entrenamiento para clasificadores mayores.
- Experimentacion e investigacion: servir como linea base ligera en articulos o pruebas internas que comparen heuristicas, reglas y modelos pequenos para decision de trafico.
- Despliegue en entornos con requisitos de soberania del dato: la licencia Apache 2.0 y la ejecucion local permiten procesar trafico sin enviarlo a una API de terceros, condicion habitual en entornos regulados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de precision, recall, F1, AUC ni tasas de falsos positivos, que serian los indicadores relevantes para un modelo de decision tipo WAF. Tampoco hay comparaciones con lineas base.

## Requisitos de hardware

Estimaciones calculadas a partir del tamano declarado en el nombre (0,4B parametros), no verificadas contra el repositorio:

- VRAM/RAM para inferencia: aproximadamente 0,8 GB en FP16, unos 0,4 GB en cuantizacion de 8 bits y alrededor de 0,25-0,3 GB en cuantizacion de 4 bits, mas el overhead del contexto y del runner.
- GPU recomendadas: cualquier GPU con 2 GB o mas de VRAM es suficiente; una RTX 4090 o A100 estarian sobredimensionadas para este tamano y solo se justificarian por agregacion de peticiones (batching).
- GPU de consumo: si, cabe holgadamente en GTX 1060, RTX 3060, RTX 4060 y en iGPU recientes con memoria unificada.
- CPU: viable en inferencia pura por CPU gracias al formato GGUF; el rendimiento dependera del numero de nucleos y del nivel de cuantizacion, que no se especifica.
- Opciones de despliegue: llama.cpp, Ollama, llama-cpp-python, servidores compatibles con GGUF; vLLM y TGI no son la via natural para un unico archivo GGUF sin pesos originales.
- Latencia y throughput: no disponibles. No hay datos publicados de tokens por segundo ni de peticiones por segundo.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables ni datos de rendimiento de este modelo, por lo que cualquier tabla comparativa implicaria inventar cifras.

| Modelo | Parametros | Contexto | Licencia | Formato | Rendimiento |
|---|---|---|---|---|---|
| Decision-WAF-V1.1-0.4B-GGUF | 0,4 B (segun nombre) | no disponible | Apache 2.0 | GGUF | no disponible |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Ausencia total de model card: no hay descripcion, arquitectura, dataset ni evaluacion; el repositorio solo contiene la declaracion de licencia.
- Procedencia no trazable: se desconoce el modelo base o el proceso de cuantizacion, lo que impide auditar sesgos o comportamientos heredados.
- Riesgo de alucinacion y de clasificacion erronea: sin metricas no puede acotarse la tasa de falsos positivos y falsos negativos; en un WAF ambos errores tienen coste (bloqueo de trafico legitimo o bypass de ataques).
- No debe usarse como unico control de seguridad: un modelo de 0,4B sin validacion no sustituye a reglas deterministas, firmas ni analisis humano.
- Idiomas y dominio: no declarados; se desconoce si el entrenamiento cubre trafico real multilingue o solo un dominio concreto.
- Licencia: Apache 2.0 permite uso comercial y modificacion, pero se ofrece sin garantias; conviene revisar si el autor incluye avisos adicionales (no los hay en la model card).
- Distribucion solo en GGUF: no hay safetensors, lo que complica el ajuste fino y la conversion a otros runtimes.
- Senales de madurez bajas: 0 descargas y 0 likes en el momento de la consulta, y fechas de creacion y actualizacion identicas en 2026, lo que sugiere un artefacto no contrastado.
- Verificacion recomendada antes de cualquier uso: descargar el archivo, inspeccionar metadatos GGUF (arquitectura, tokenizer, contexto real) y evaluar con un conjunto de validacion propio.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/0xBrandon/Decision-WAF-V1.1-0.4B-GGUF
- Model card: no disponible (el README solo contiene la linea de licencia)
- Paper, blog, repositorio de codigo o demo: no disponible en la informacion proporcionada
