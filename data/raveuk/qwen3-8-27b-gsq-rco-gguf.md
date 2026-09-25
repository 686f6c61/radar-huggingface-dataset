# rAVEUK/Qwen3.8-27B-GSQ-RCO-GGUF

## Resumen

Este repositorio publica cuantizaciones GGUF no uniformes del modelo multimodal Qwen3.8-27B, generadas con los metodos GSQ (Gumbel-Softmax Quantization) y RCO (Riemannian Constrained Optimization), desarrollados en el Deep Algorithms and Systems Lab (DASLab) del Institute of Science and Technology Austria. A diferencia de la cuantizacion uniforme, que aplica un unico tipo a todos los tensores, aqui cada tensor recibe su propio tipo de cuantizacion, asignado mediante una busqueda basada en gradientes que reparte la precision segun la sensibilidad por tensor bajo un presupuesto de tamano total fijo.

El modelo base es Qwen3.8-27B, un modelo denso multimodal nativo de pesos abiertos publicado por el equipo Qwen de Alibaba, con 26.895.998.464 parametros y capacidades de codigo, flujos agente y automatizacion de oficina segun la documentacion del proyecto. Los archivos resultantes son GGUF estandar y se ejecutan sin modificaciones en llama.cpp, Ollama y LM Studio, lo que permite desplegar un modelo de ~27B en el orden de 8,4 a 11,8 GB.

La relevancia practica esta en el punto de operacion IQ3_S (3,50 bits por peso, 11,8 GB): segun la model card, iguala exactamente al modelo base BF16 en AIME25 (100,00) y LiveCodeBench v6 (85,71) y queda a 0,51 puntos en GPQA-Diamond, con algo mas de una quinta parte del tamano del BF16. Se incluye ademas el proyector de vision (`mmproj`) en BF16 y variantes opcionales con la cabeza de Multi-Token Prediction para decodificacion especulativa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal (modelo base descrito como "native multimodal dense open-weight model"); detalles internos no disponibles |
| Parametros totales | 26.895.998.464 (26,9 B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ2_XS (2,50 bpw), IQ2_S (2,75 bpw), IQ3_XXS (3,00 bpw), IQ3_S (3,50 bpw); no uniformes por tensor mediante GSQ + RCO. Proyector de vision en BF16 (16 bpw). Variantes opcionales `-mtp` (~0,35 GB adicionales) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (llama.cpp); vision projector en GGUF BF16 (`mmproj-Qwen3.8-27B-BF16.gguf`) |

Archivos publicados:

| Archivo | bpw | Tamano | Notas |
|---|---|---|---|
| `Qwen3.8-27B-GSQ-RCO-IQ2_XS.gguf` | 2,50 | 8,4 GB | El mas pequeno; zero-shot por encima del baseline BF16 segun la model card |
| `Qwen3.8-27B-GSQ-RCO-IQ2_S.gguf` | 2,75 | 9,3 GB | Iguala al modelo base en AIME25 |
| `Qwen3.8-27B-GSQ-RCO-IQ3_XXS.gguf` | 3,00 | 10,1 GB | Punto de operacion equilibrado |
| `Qwen3.8-27B-GSQ-RCO-IQ3_S.gguf` | 3,50 | 11,8 GB | Recomendado; definido como task-lossless |
| `mmproj-Qwen3.8-27B-BF16.gguf` | 16 | 0,9 GB | Codificador de vision + proyector; una copia sirve para todas las cuantizaciones |

## Arquitectura y entrenamiento

No se dispone de informacion sobre el entrenamiento del modelo base Qwen3.8-27B (numero de tokens, composicion del dataset, RLHF/DPO) en el material proporcionado. Lo que si se documenta es el proceso de cuantizacion post-entrenamiento: GSQ realiza cuantizacion escalar por tensor aprendiendo conjuntamente las asignaciones de rejilla por coordenada y las escalas por grupo mediante una relajacion Gumbel-Softmax, y segun sus autores cierra buena parte de la brecha entre cuantizacion escalar y vectorial en 2-3 bits manteniendo compatibilidad con formatos escalares estandar como GGUF. RCO resuelve la asignacion de uno de K tipos de cuantizacion a cada uno de los N tensores bajo un presupuesto de tamano total, reformulando la restriccion como una variedad riemanniana suave en el espacio de logits, lo que permite optimizar directamente sobre la perdida de tarea y forzar el presupuesto de forma exacta sin hiperparametros especificos de restriccion.

Los pesos se generan con offsets de cuantizacion por tensor, de modo que el resultado es un GGUF no uniforme del tamano solicitado. El repositorio incluye ademas la cabeza de Multi-Token Prediction (MTP) del modelo en builds opcionales, destinada a decodificacion especulativa en llama.cpp; los pesos son identicos al resto y la calidad no cambia. El proyector multimodal se distribuye por separado en BF16 para el uso image-text-to-text.

## Capacidades

- Generacion de texto conversacional (tag `conversational` en el repositorio).
- Procesamiento multimodal de imagen y texto (pipeline `image-text-to-text`), mediante el archivo `mmproj` en BF16.
- Razonamiento matematico evaluado en AIME25.
- Razonamiento cientifico evaluado en GPQA-Diamond.
- Generacion de codigo evaluada en LiveCodeBench v6.
- El modelo base se describe en su repositorio de GitHub como especialmente capacitado para codigo, flujos de trabajo agenticos y automatizacion de oficina.
- Decodificacion especulativa mediante la cabeza MTP en las variantes `-mtp` (solo en llama.cpp).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte multilingue: no disponible.

## Casos de uso

- Asistente multimodal local: con el archivo `mmproj` en BF16 y una cuantizacion IQ3_S de 11,8 GB, el modelo puede recibir imagenes y texto y responder conversacionalmente, todo en hardware de consumo sin enviar datos a la nube.
- Analisis de documentos con capturas: la combinacion de vision y contexto conversacional permite describir diagramas, capturas de interfaces o tablas escaneadas dentro de un flujo de preguntas y respuestas sucesivas.
- Generacion de codigo asistida en estaciones de trabajo: la cuantizacion IQ3_S mantiene 85,71 en LiveCodeBench v6 segun la model card, lo que la hace apta para sustitucion de codigo, refactorizacion y explicacion de fragmentos en un IDE local.
- Razonamiento matematico y verificacion de calculos: el punto de operacion IQ3_S reporta 100,00 en AIME25, por lo que puede emplearse en pipelines de resolucion y comprobacion de problemas numericos paso a paso.
- Despliegue en portatiles y equipos sin GPU dedicada de gran tamano: los archivos IQ2_XS (8,4 GB) e IQ2_S (9,3 GB) permiten ejecutar un modelo de ~27B en llama.cpp u Ollama sobre memoria unificada o VRAM modesta.
- Servicio de inferencia con decodificacion especulativa: usar la build `-mtp` en llama.cpp para reducir la latencia de generacion en despliegues con requisitos de tiempo de respuesta ajustados.
- Evaluacion comparativa de tecnicas de cuantizacion: el repositorio sirve como referencia para medir GSQ y RCO frente a cuantizaciones uniformes y frente a las Unsloth Dynamic del mismo modelo base.
- Procesamiento por lotes de clasificacion y extraccion de informacion sobre imagenes: al ser un modelo denso de ~27B con vision, puede aplicarse a tareas de etiquetado y descripcion masiva de imagenes en infraestructura propia.

## Benchmarks y rendimiento

Los unicos valores numericos presentes en la informacion extraida son los siguientes. Las tablas completas de resultados (perplejidad en wikitext2, C4 y FineWeb-Edu, y media de cinco tareas zero-shot: arc_easy, arc_challenge, hellaswag, winogrande y piqa) se mencionan en la model card pero no se incluyen en el material disponible.

| Benchmark | IQ3_S (3,50 bpw) | Modelo base BF16 | Notas |
|---|---|---|---|
| AIME25 | 100,00 | 100,00 | Coincidencia exacta segun la model card |
| LiveCodeBench v6 | 85,71 | 85,71 | Coincidencia exacta segun la model card |
| GPQA-Diamond | no disponible | no disponible | La model card indica que IQ3_S queda a 0,51 puntos del base |
| Media de tareas zero-shot (arc_easy, arc_challenge, hellaswag, winogrande, piqa) | no disponible | no disponible | IQ2_XS se describe como "por encima del baseline BF16"; sin cifras |
| Perplejidad (wikitext2, C4, FineWeb-Edu) | no disponible | no disponible | Metricas reportadas pero no incluidas en la informacion extraida |

Comparativas declaradas para otros puntos de operacion: IQ2_S (2,75 bpw) iguala al modelo base en AIME25 e IQ2_XS (2,50 bpw) se situa por encima del baseline BF16 en la media zero-shot. No se proporcionan cifras concretas para estas afirmaciones.

## Requisitos de hardware

Las siguientes cifras de VRAM son estimaciones derivadas del tamano de los archivos y no han sido publicadas por el autor; hay que anadir el coste de la cache KV y del runtime, que depende de la longitud de contexto y del backend.

- IQ2_XS (8,4 GB): entorno de 10-12 GB de memoria. Cabe en RTX 4080 (16 GB), RTX 4070 Ti Super (16 GB), RTX 3090 (24 GB) y RTX 4090 (24 GB).
- IQ2_S (9,3 GB): entorno de 11-13 GB de memoria. Cabe en GPUs consumer de 16 GB o mas.
- IQ3_XXS (10,1 GB): entorno de 12-14 GB de memoria. Cabe en GPUs consumer de 16 GB o mas.
- IQ3_S (11,8 GB): entorno de 13-16 GB de memoria segun contexto. Requiere 16 GB de VRAM como minimo practico; comodo en RTX 4090, RTX 3090 o A100 40 GB.
- Proyector multimodal: 0,9 GB adicionales en BF16 cuando se usa vision.
- Variantes `-mtp`: aproximadamente 0,35 GB adicionales respecto al archivo equivalente.
- Modelo base sin cuantizar (BF16): del orden de 53,8 GB de pesos, solo viable en A100 80 GB, H100 80 GB o configuraciones multi-GPU. Estimacion derivada de los parametros totales.
- Opciones de despliegue documentadas: llama.cpp, Ollama y LM Studio, ejecutando los archivos GGUF sin modificaciones. La decodificacion especulativa con la cabeza MTP esta soportada en llama.cpp.
- Existe un kit de despliegue de terceros (MiaAI-Lab) que sirve Qwen3.8-27B en cuantizaciones EXL3 sobre una unica GPU NVIDIA de consumo de 16 GB, con endpoint compatible con OpenAI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de datos internos (parametros, contexto, resultados) de las alternativas mas alla de lo indicado; la comparativa se limita a lo declarado en la informacion proporcionada.

| Alternativa | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Este repositorio (GSQ-RCO GGUF de Qwen3.8-27B) | 26,9 B | no disponible | GGUF no uniforme (2,50-3,50 bpw) | apache-2.0 | Cuantizacion por tensor con GSQ + RCO; incluye mmproj y variantes MTP |
| Unsloth Dynamic (UD) del mismo modelo base | 26,9 B | no disponible | GGUF (cuantizacion uniforme dinamica) | apache-2.0 | Usada como referencia de comparacion en la evaluacion de este repositorio |
| Cuantizaciones EXL3 de Qwen3.8-27B | 26,9 B | no disponible | EXL3 | apache-2.0 | Usadas por el kit de MiaAI-Lab para servir el modelo en una GPU consumer de 16 GB |
| Qwen3.8-27B BF16 (modelo base) | 26,9 B | no disponible | safetensors | apache-2.0 | Referencia de maxima calidad; ~53,8 GB de pesos en BF16 |

El repositorio original equivalente aparece alojado tambien en la organizacion ISTA-DASLab, con volumenes de descargas y likes muy superiores a los del repositorio indicado por el usuario.

## Limitaciones y advertencias

- La model card del repositorio es una plantilla con marcadores de posicion sin sustituir (por ejemplo, comentarios de tipo `[swap]` y referencias genericas a "Qwen3.8-27B as the example"), lo que sugiere que el repositorio puede no haber sido revisado linea por linea antes de su publicacion.
- El repositorio indicado tiene 0 descargas y 0 likes en el momento de la consulta; no hay validacion independiente de estos archivos concretos.
- El tamano total del repositorio (81,4 GB) es muy superior a la suma de los archivos listados en la model card (unos 41-42 GB incluyendo las variantes `-mtp`), una discrepancia que conviene aclarar antes de descargar.
- Los resultados de cuantizacion citados (AIME25 = 100,00 y LiveCodeBench v6 = 85,71, identicos al base) proceden del propio autor de la cuantizacion y no se han verificado de forma independiente.
- No se especifican los idiomas soportados, por lo que no puede garantizarse un rendimiento homogeneo fuera del ingles y el chino sin evaluacion propia.
- No se documenta la longitud de contexto efectiva, un factor critico para decidir el despliegue y para estimar el consumo de memoria de la cache KV.
- Las cuantizaciones de 2-3 bits degradan inevitablemente algunos comportamientos aunque las metricas agregadas se mantengan; las tareas de razonamiento largo y de instrucciones complejas son las mas sensibles.
- Riesgo de alucinacion inherente al modelo base, no mitigado por la cuantizacion; en produccion conviene anadir verificacion factual y limites de uso.
- La cabecera MTP solo aporta ventajas de decodificacion especulativa en llama.cpp; en otros backends debe comprobarse el soporte antes de contar con ella.
- La licencia apache-2.0 permite uso comercial, pero conviene revisar los terminos del modelo base Qwen3.8-27B por si imponen condiciones adicionales.
- El uso multimodal exige descargar y cargar el archivo `mmproj` en BF16 aparte; sin el, el modelo solo procesara texto.
- Los articulos de GSQ y RCO estan fechados en 2026 y su validacion por terceros es limitada en el momento de redactar esta ficha.

## Enlaces

- Repositorio del usuario: https://huggingface.co/rAVEUK/Qwen3.8-27B-GSQ-RCO-GGUF
- Repositorio original equivalente: https://huggingface.co/ISTA-DASLab/Qwen3.8-27B-GSQ-RCO-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio GitHub del modelo base: https://github.com/AlibabaCloud-Official/Qwen3.8-27B
- Paper de GSQ: https://arxiv.org/abs/2604.18556
- Paper de RCO: https://arxiv.org/abs/2605.00649
- Codigo de GSQ: https://github.com/IST-DASLab/GSQ
- Codigo de RCO: https://github.com/IST-DASLab/RCO
- Laboratorio DASLab: https://github.com/IST-DASLab
- Ficha en local-ai-zone: https://local-ai-zone.github.io/models/qwen3-8-27b-gsq-rco.html
- Kit de despliegue en GPU de 16 GB con cuantizaciones EXL3: https://github.com/MiaAI-Lab/Qwen3.8-27B-16gb-NVIDIA-GPUs-one-click-install
