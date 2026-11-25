# mradermacher/Qwen3.5-2B-Uncensored-reaper-i1-GGUF

## Resumen

Qwen3.5-2B-Uncensored-reaper-i1-GGUF es una cuantizacion GGUF del modelo abdukuzi45/Qwen3.5-2B-Uncensored-reaper, publicada por el usuario mradermacher. Se trata de una variante "abliterated" y "uncensored" de un modelo de la familia Qwen3.5 con aproximadamente 1.942 millones de parametros (1,94B), orientada a investigacion y a casos de uso donde se requiere minimizar los rechazos del modelo ante determinadas peticiones. La model card etiqueta el modelo como multimodal, lo que sugiere capacidad de vision, aunque los ficheros mmproj (proyector multimodal) se distribuyen en el repositorio estatico complementario, no en este.

El autor de la cuantizacion, mradermacher, es un conocido generador de cuantizaciones GGUF de la comunidad, y en este caso emplea cuantizaciones de tipo i1 (imatrix, tambien llamadas weighted quants) para mejorar la calidad respecto a las cuantizaciones estaticas equivalentes. El repositorio incluye un amplio abanico de niveles de cuantizacion, desde i1-Q2_K (1,1 GB) hasta i1-Q6_K (1,7 GB), lo que permite desplegar el modelo en hardware muy modesto, incluidas GPUs de consumo e incluso CPU.

Su relevancia actual es doble: por un lado, ofrece una via sencilla de ejecutar un modelo pequeno (sub-2B) con contexto conversacional en entornos con recursos limitados; por otro, su naturaleza "uncensored" lo hace interesante para investigacion sobre alineamiento, seguridad y comportamiento de modelos, aunque tambien conlleva riesgos que deben tenerse en cuenta. La licencia declarada es Apache 2.0 y el idioma soportado segun la model card es unicamente el ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base de la familia Qwen3.5; la model card no detalla la arquitectura) |
| Parametros totales | 1.942.653.248 (~1,94B) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-Q2_K, i1-Q3_K_S, i1-IQ3_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-Q4_0, i1-Q4_K_S, i1-IQ4_NL, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K (imatrix/weighted) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones i1/imatrix); el modelo base en safetensors |
| Tamano del repositorio | 18,6 GB |
| Modelo base | abdukuzi45/Qwen3.5-2B-Uncensored-reaper |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base mas alla de su pertenencia a la familia Qwen3.5 y de su caracter multimodal (la model card indica "This is a vision model"). No se especifican el numero de capas, la dimension oculta, el mecanismo de atencion ni si emplea innovaciones como decodificacion especulativa o atencion lineal. Tampoco se documentan el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO.

Lo que si se conoce es el proceso de cuantizacion: mradermacher ha generado cuantizaciones ponderadas (i1) a partir de un fichero imatrix, lo que en la practica mejora la fidelidad de las cuantizaciones de baja y media precision respecto a las cuantizaciones estaticas equivalentes. El repositorio incluye el propio fichero imatrix (0,1 GB) para quien quiera generar sus propias cuantizaciones. La etiqueta "abliterated" indica que el modelo base ha sido modificado para eliminar (o atenuar) la direccion de rechazo aprendida durante el alineamiento, y "uncensored" refuerza esa orientacion hacia la reduccion de negativas.

## Capacidades

- Generacion de texto conversacional en ingles, con soporte de dialogos multi-turno.
- Capacidad multimodal declarada (vision), con ficheros mmproj disponibles en el repositorio estatico complementario.
- Comportamiento "abliterated"/"uncensored": menor tendencia a rechazar peticiones que un modelo alineado convencional.
- Razonamiento basico y generacion de codigo propios de un modelo de ~2B parametros (no se documentan capacidades especificas ni benchmarks).
- No se documenta soporte explicito de tool calling ni de function calling.
- No se documenta soporte explicito de agentes o razonamiento multi-paso.
- Capacidades multilingues limitadas al ingles segun la model card.

## Casos de uso

- Investigacion sobre alineamiento y seguridad: el modelo permite estudiar como varia la tasa de rechazo y el comportamiento ante peticiones sensibles tras la ablacion, comparandolo con el modelo base alineado. Su tamano reducido facilita ejecutar experimentos a gran escala en hardware asequible.
- Despliegue en hardware de consumo: con cuantizaciones de 1,1 a 1,7 GB, el modelo cabe en GPUs de gama baja (8 GB o menos) e incluso en CPU, lo que lo hace util para prototipos locales de asistentes conversacionales en ingles.
- Generacion de texto creativo sin filtros: para tareas de escritura de ficcion, guiones o narrativa donde el autor quiere minimizar las interrupciones por parte del modelo, siempre con supervision humana.
- Clasificacion y etiquetado de texto a pequena escala: un modelo de ~2B puede usarse para tareas de extraccion o clasificacion simple en pipelines por lotes donde el coste por token es critico.
- Evaluacion comparativa de cuantizaciones: el repositorio ofrece 15 niveles de cuantizacion distintos, lo que permite medir el impacto de la precision en la calidad de salida para un mismo modelo, algo util para equipos que calibran sus propios pipelines de inferencia.
- Experimentos de vision en local: si se descargan los ficheros mmproj del repositorio estatico, el modelo puede emplearse para tareas basicas de comprension de imagenes en entornos sin acceso a APIs externas.
- Educacion y docencia: su tamano y su amplia gama de cuantizaciones lo convierten en un ejemplo practico para ensenar el funcionamiento de GGUF, llama.cpp y las tecnicas de cuantizacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,1 GB (i1-Q2_K) hasta 1,7 GB (i1-Q6_K) para los pesos, mas el overhead de contexto y del runtime (tipicamente 0,5-2 GB adicionales segun longitud de contexto y backend).
- GPU recomendadas: cualquier GPU con 4 GB o mas de VRAM es suficiente; RTX 3060, RTX 4060, RTX 4090, A100 o H100 funcionan sin problema, aunque en las de gama alta el modelo estara infrautilizado.
- Cabe en GPU de consumo: si, en practicamente todas las GPU consumer modernas (incluso integradas con suficiente memoria compartida), y tambien en CPU.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, y cualquier runtime compatible con GGUF. vLLM y TGI no soportan GGUF de forma nativa en todos los casos, por lo que se recomienda llama.cpp para este formato.
- Latencia y throughput: no disponibles en la informacion proporcionada; en un modelo de este tamano se espera una latencia muy baja, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.5-2B-Uncensored-reaper-i1-GGUF (este) | ~1,94B | no disponible | Apache 2.0 | GGUF (i1) | Variante uncensored/abliterated, multimodal declarada, solo ingles |
| Qwen3.5-2B-Uncensored-reaper (base) | ~1,94B | no disponible | Apache 2.0 | safetensors | Modelo original sin cuantizar del que deriva este |
| Qwen3.5-2B-Uncensored-reaper-GGUF (estatico) | ~1,94B | no disponible | Apache 2.0 | GGUF (estatico) | Mismas cuantizaciones sin imatrix, incluye mmproj |
| Otros modelos ~2B de la familia Qwen3.5 | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificados en la informacion proporcionada |

No se dispone de datos de benchmarks que permitan comparar el rendimiento relativo con alternativas; la comparativa se limita a parametros, formato y licencia.

## Limitaciones y advertencias

- Modelo "uncensored"/"abliterated": la reduccion de rechazos implica un mayor riesgo de generar contenido danino, sesgado o inapropiado; no debe desplegarse en produccion orientada al publico sin filtros adicionales.
- Riesgo de alucinacion: como todo modelo de ~2B parametros, su fiabilidad factica es limitada; no es adecuado para tareas que exijan alta precision sin verificacion.
- Idioma: la model card solo declara soporte de ingles; el rendimiento en castellano u otros idiomas no esta documentado y previsiblemente sera deficiente.
- Contexto: no se especifica la longitud de contexto soportada, lo que impide planificar casos de uso con documentos largos.
- Capacidades multimodales: aunque se declara modelo de vision, los ficheros mmproj no estan en este repositorio sino en el estatico; hay que descargarlos aparte.
- Licencia: Apache 2.0 permite uso comercial, pero el caracter uncensored del modelo puede entrar en conflicto con politicas de plataforma o requisitos regulatorios; conviene revisar el cumplimiento antes de usarlo en productos.
- Procedencia: el modelo base es de un autor de la comunidad (abdukuzi45) sin documentacion detallada sobre datos de entrenamiento ni evaluacion; la trazabilidad es limitada.
- Fecha de creacion: el repositorio data de noviembre de 2026, por lo que puede haber cambiado o desaparecido; verificar disponibilidad antes de integrarlo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Qwen3.5-2B-Uncensored-reaper-i1-GGUF
- Modelo base: https://huggingface.co/abdukuzi45/Qwen3.5-2B-Uncensored-reaper
- Cuantizaciones estaticas (incluye mmproj): https://huggingface.co/mradermacher/Qwen3.5-2B-Uncensored-reaper-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#Qwen3.5-2B-Uncensored-reaper-i1-GGUF
- FAQ y peticiones de modelos de mradermacher: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
