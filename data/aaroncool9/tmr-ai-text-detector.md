# aaroncool9/tmr-ai-text-detector

## Resumen

TMR (Target Mining RoBERTa) es un clasificador binario de texto disenado para distinguir texto escrito por personas de texto generado por inteligencia artificial. Lo publica el usuario aaroncool9 en Hugging Face, aunque la propia model card atribuye el trabajo a "Oxidane" y enlaza un repositorio distinto (Oxidane/tmr-ai-text-detector). Se construye sobre RoBERTa-base, un encoder transformer de 124.647.170 parametros, y se distribuye con licencia MIT.

El modelo aborda un problema recurrente en el ecosistema actual: la deteccion fiable de contenido sintetico manteniendo baja la tasa de falsos positivos, algo critico cuando la clasificacion se aplica a textos humanos reales (resenas, trabajos academicos, articulos). Frente a detectores entrenados con perdida de entropia cruzada estandar, TMR emplea Focal Loss (gamma=2.0, alpha=[0.85, 0.15]) y una estrategia de mineria iterativa de ejemplos dificiles denominada Self-Hard-Negative, entrenada sobre 50.000 muestras estratificadas del benchmark RAID (45% humanas, 55% generadas por IA).

Su relevancia practica radica en la combinacion de tamano reducido (apto para CPU y GPU de consumo), licencia permisiva y resultados reportados en el leaderboard de RAID, con un AUROC del 99,28% en el conjunto completo (incluyendo ataques adversarios) y del 99,85% en el subconjunto sin adversariales. La ventana de contexto esta limitada a 512 tokens, coherente con la arquitectura RoBERTa que hereda.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (RoBERTa-base); tarea de clasificacion de secuencias con cabeza de 2 clases |
| Parametros totales | 124.647.170 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 512 tokens (max_length usado en el ejemplo de inferencia; RoBERTa-base admite posiciones hasta 514) |
| Tipos de cuantizacion | no disponible (el repositorio solo declara pesos safetensors sin variantes cuantizadas) |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | safetensors |

Datos adicionales del Hub: pipeline `text-classification`, 0 descargas y 0 likes en el momento de la consulta, tamano del repositorio 0,5 GB, modelo base declarado FacebookAI/roberta-base, etiquetas `ai-detection`, `robeta`, `focal-loss`, `raid-benchmark`.

## Arquitectura y entrenamiento

La arquitectura es la de RoBERTa-base: un encoder transformer con normalizacion por capas, 12 capas, 768 dimensiones ocultas y 12 cabezas de atencion (configuracion heredada del modelo base declarado; la model card no reproduce la tabla completa de hiperparametros del backbone). Sobre el encoder se anade una cabeza de clasificacion con dos salidas, interpretadas en el ejemplo de uso como clase 0 = texto humano y clase 1 = texto generado por IA (`probs[0][1]` como probabilidad de IA). No hay componente generativo ni decodificacion especulativa: el modelo es exclusivamente discriminativo.

El entrenamiento usa el dataset RAID (ACL 2024) con 50.000 muestras estratificadas, de las cuales el 45% son humanas y el 55% generadas por IA. La funcion de perdida es Focal Loss con gamma=2.0 y pesos por clase alpha=[0.85, 0.15], disenada para concentrar el gradiente en ejemplos dificiles. La innovacion metodologica declarada es el Self-Hard-Negative (Self-HN) iterative mining: se identifican iterativamente las muestras humanas que el modelo clasifica erroneamente como IA, se incorporan como ejemplos negativos dificiles y se reentrena con ellas. El objetivo explicito es reducir la tasa de falsos positivos sobre texto humano. No se detalla en la informacion disponible el numero de iteraciones, el numero de tokens totales vistos ni si hubo fases de ajuste adicional (RLHF/DPO no aplican a un clasificador de este tipo).

## Capacidades

- Clasificacion binaria de texto: devuelve logits y, tras softmax, una probabilidad de que el texto sea generado por IA.
- Deteccion robusta en presencia de ataques adversarios: los resultados reportados en RAID incluyen el subconjunto con adversariales (AUROC 99,28%).
- Umbral de decision configurable: el ejemplo usa 0.5, pero al exponerse la probabilidad se puede recalibrar el umbral segun el coste relativo de falsos positivos y falsos negativos.
- Procesamiento por lotes con truncado a 512 tokens mediante el tokenizador de RoBERTa.
- Capacidad de ejecucion en CPU o GPU de gama baja por su tamano (124,6 M de parametros).
- No soporta generacion de texto, razonamiento, codigo, matematicas ni vision.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso: es un clasificador de una sola pasada.
- Multilingue: no; el modelo esta entrenado y etiquetado unicamente para ingles.
- Capacidades especiales: ninguna declarada (sin modo thinking, sin audio, sin vision, sin modo de razonamiento extendido).

## Casos de uso

- Moderacion de contenido generado por usuarios: el clasificador se puede insertar como paso previo en un pipeline de publicacion de resenas o comentarios (foros tipo Reddit, marketplaces) para marcar textos sospechosos de ser sinteticos. Su ventana de 512 tokens encaja con comentarios y resenas de longitud corta y media, y la licencia MIT permite integrarlo en servicios propietarios.
- Limpieza de corpus para entrenamiento de modelos: al filtrar grandes volumenes de texto web antes de entrenar un LLM, el modelo permite descartar o etiquetar documentos generados sinteticamente. El coste por documento es bajo (124,6 M de parametros) y se puede ejecutar en lote sobre GPU de consumo.
- Verificacion editorial en medios: como senal auxiliar para editores que reciben articulos o columnas de colaboradores externos, aplicando el umbral de 0.5 como aviso y no como decision automatica, dado el riesgo de falsos positivos en dominios fuera de distribucion.
- Deteccion de fraude en resenas de comercio electronico: clasificar resenas de producto como humanas o generadas para alimentar un sistema antifraude. Los dominios de resenas estan representados en RAID (la model card cita reviews entre los dominios de entrenamiento), lo que favorece el rendimiento en este escenario.
- Auditoria de contenido SEO y agencias: agencias y equipos de marketing pueden auditar si el contenido entregado por proveedores externos fue generado con IA, con el modelo desplegado como microservicio interno (API de clasificacion).
- Prefiltro en pipelines de verificacion periodistica (fact-checking): clasificar rapidamente grandes volumenes de texto antes de que un analista humano revise los casos, reduciendo el coste de triaje. La salida probabilistica permite priorizar por nivel de sospecha.
- Monitorizacion de plataformas educativas: deteccion de entregas de texto sospechosas de generacion automatica. Requiere acompanamiento humano obligatorio, ya que el propio autor advierte de tasas de falsos positivos mas altas en dominios no vistos y en textos cortos o conversacionales.
- Investigacion en deteccion de texto sintetico: servir de baseline reproducible sobre RAID para comparar nuevas tecnicas de mineria de negativos dificiles o funciones de perdida, gracias a la licencia permisiva y a que los datos de evaluacion estan publicados.

## Benchmarks y rendimiento

Resultados reportados por el autor en el leaderboard oficial de RAID (672.000 muestras de test, incluyendo ataques adversarios):

| Metrica | Todas las configuraciones | Sin adversariales |
|---|---|---|
| AUROC | 99,28% | 99,85% |
| TPR @ 5% FPR | 95,79% | 99,65% |
| TPR @ 1% FPR | 90,17% | 98,56% |

Evaluacion en conjunto reservado (held-out, 100.000 muestras del split de entrenamiento de RAID, semilla 999, excluyendo muestras de entrenamiento y validacion):

| Metrica | Valor |
|---|---|
| AUROC | 99,69% |
| Precision (accuracy) | 97,42% |
| FPR | 2,61% |
| FNR | 2,58% |

No hay en la informacion proporcionada resultados de benchmarks genericos de lenguaje (MMLU, HumanEval, GSM8K u otros), que no aplican a un clasificador de este tipo. Tampoco se dispone de resultados de comparacion directa contra otros detectores en la misma tabla.

## Requisitos de hardware

- VRAM estimada para inferencia (estimacion aritmetica a partir de 124,6 M de parametros, no publicada por el autor): aproximadamente 0,50 GB en fp32, 0,25 GB en fp16/bf16 y 0,13 GB en int8. El repositorio ocupa 0,5 GB, consistente con pesos en fp32.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de memoria libre es suficiente. Para uso individual, RTX 3060, RTX 4060, RTX 4090 o T4. Para procesamiento por lotes a gran escala, A100 o H100 permiten maximizar el throughput, aunque estan sobredimensionadas para 124,6 M de parametros.
- GPU de consumo: si, cabe en practicamente cualquier GPU de consumo de los ultimos diez anos, e incluso permite inferencia en CPU con latencias utilizables para clasificacion de un solo texto.
- Opciones de despliegue: PyTorch + transformers (ruta oficial documentada), exportacion a ONNX Runtime o TorchScript para reducir overhead en produccion. La model card no menciona soporte verificado para vLLM, llama.cpp, Ollama o TGI; llama.cpp requeriria una conversion a GGUF que no se distribuye en el repositorio, y el soporte de clasificacion de secuencias en vLLM/TGI depende de la arquitectura y no esta confirmado para este modelo.
- Latencia y throughput: no disponibles. No se han publicado mediciones de latencia ni de tokens por segundo en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Arquitectura y parametros | Contexto | Licencia | Disponibilidad | Rendimiento |
|---|---|---|---|---|---|
| TMR (aaroncool9/tmr-ai-text-detector) | RoBERTa-base, 124,6 M | 512 tokens | MIT | Pesos safetensors en Hugging Face | AUROC 99,28% en RAID completo; 99,69% en held-out |
| openai-community/roberta-base-openai-detector | RoBERTa-base, ~124,6 M | 512 tokens | no disponible en la informacion proporcionada | Pesos en Hugging Face | no disponible |
| Hello-SimpleAI/chatgpt-detector-roberta | RoBERTa-base, ~124,6 M | 512 tokens | no disponible en la informacion proporcionada | Pesos en Hugging Face | no disponible |
| Detectores propietarios por API (por ejemplo GPTZero) | no disponible | no disponible | propietaria | solo API | no disponible |

Nota: los datos de rendimiento y licencia de los modelos alternativos no estaban presentes en la informacion proporcionada; no se han incluido cifras estimadas. La busqueda web realizada no devolvio resultados relacionados con deteccion de texto generado por IA.

## Limitaciones y advertencias

- Idioma: entrenado principalmente con texto en ingles. El rendimiento en castellano u otros idiomas no esta evaluado y previsiblemente sera deficiente.
- Dominio: el mejor rendimiento se da en dominios similares a los de RAID (noticias, libros, resumenes, resenas, recetas, Wikipedia, poesia, Reddit). Fuera de esos dominios el autor advierte de tasas de falsos positivos potencialmente mayores.
- Texto corto y conversacion casual: la model card senala explicitamente que la tasa de falsos positivos puede aumentar en conversaciones informales y textos breves.
- Umbral: el modelo esta optimizado para un umbral de 0,5. Cambiar el umbral sin recalibrar altera el equilibrio entre FPR y FNR.
- Robustez adversaria: aunque los resultados en RAID incluyen ataques adversariales, cualquier detector de texto es vulnerable a parafraseo humano, reescritura con modelos mas nuevos o edicion manual del texto generado.
- Riesgo de alucinacion: no aplica en el sentido generativo, pero si existe riesgo de clasificacion erronea (falsos positivos y falsos negativos), con implicaciones eticas si se usa para acusar a una persona de usar IA.
- Licencia MIT: permite uso comercial, modificacion y redistribucion con atribucion y sin garantia. Es una de las licencias mas permisivas, sin restricciones de uso comercial declaradas.
- Ausencia de validacion comunitaria: el repositorio tiene 0 descargas y 0 likes, y las fechas de creacion y actualizacion del Hub son identicas (2026-09-22). No hay evidencia de uso independiente ni de replicacion de los resultados por terceros.
- Inconsistencias de metadatos: el repositorio pertenece a `aaroncool9`, pero la model card y la cita bibliografica atribuyen el modelo a "Oxidane" y apuntan a `Oxidane/tmr-ai-text-detector`; ademas la etiqueta `robeta` esta mal escrita. Conviene verificar la procedencia y los pesos antes de usarlo en produccion.
- Sin cuantizaciones publicadas: no se distribuyen variantes GGUF, ONNX ni cuantizadas, por lo que un despliegue fuera de PyTorch requiere conversion propia.
- Uso responsable: cualquier aplicacion en educacion, seleccion de personal o moderacion deberia tratar la salida como una senal probabilistica y no como una prueba concluyente.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/aaroncool9/tmr-ai-text-detector
- Repositorio citado en la model card (autor Oxidane): https://huggingface.co/Oxidane/tmr-ai-text-detector
- Modelo base RoBERTa-base: https://huggingface.co/FacebookAI/roberta-base
- Leaderboard del benchmark RAID: https://raid-bench.xyz/leaderboard
- Paper de RAID (ACL 2024): no disponible en la informacion proporcionada (el nombre del dataset y el ano de publicacion se citan en la model card, sin enlace)
- Contacto indicado por el autor: me@oxidane.net
- Resultados de busqueda web: no se encontraron enlaces relevantes; las busquedas devolvieron unicamente paginas de Wikipedia y Moviepilot sobre peliculas de 2024, sin relacion con el modelo.
