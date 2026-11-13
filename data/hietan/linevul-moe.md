# Hietan/LineVul-MoE

## Resumen

LineVul-MoE es una colección de investigación publicada por el usuario Hietan en Hugging Face que agrupa 110 checkpoints de CodeBERT afinados para detección de vulnerabilidades en código fuente. El modelo base es `microsoft/codebert-base`, un encoder tipo transformer de 125 millones de parámetros preentrenado sobre código y lenguaje natural. A pesar del sufijo "MoE" en el nombre, no se trata de una arquitectura de mezcla de expertos: es un conjunto de clasificadores independientes organizados como variantes de entrenamiento (All-in-One, Exclude y One-Hot), no un modelo con enrutamiento de tokens.

El objetivo del proyecto es replicar y extender el método LineVul, una técnica de localización de líneas vulnerables basada en puntuaciones de atención de la primera capa del transformer. Para ello entrena 11 configuraciones del clasificador binario sobre dos particiones fijas del dataset BigVul (una "official" que respeta la partición publicada por LineVul y otra "project" que agrupa proyectos, CVEs y commits para evitar fuga de datos), con cinco semillas distintas. Las cinco clases objetivo son CWE-119, CWE-20, CWE-399, CWE-125 y CWE-200.

La relevancia actual es doble: por un lado, ofrece un recurso reproducible para investigar detección de vulnerabilidades con métricas de línea a nivel de función; por otro, el tamaño del repositorio (55,1 GB) y la ausencia de licencia confirmada lo convierten en un artefacto de investigación más que en un modelo listo para producción. No tiene descargas ni likes en el momento de esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (CodeBERT, base de 12 capas y 768 dimensiones ocultas) con cabeza de clasificación binaria de una logit; colección de 110 checkpoints independientes |
| Parametros totales | Aproximadamente 125 millones por checkpoint (base codebert-base); no disponible el agregado de la colección completa |
| Parametros activos | No aplica (no es MoE real pese al nombre) |
| Longitud de contexto | 512 tokens de entrada (ventana del tokenizador CodeBERT) |
| Tipos de cuantizacion | No disponible (solo se publican pesos en safetensors de precisión original) |
| Idiomas soportados | No disponible (el código fuente es multilingüe por naturaleza, pero no se declara soporte lingüístico) |
| Licencia | No confirmada para la colección; el repositorio upstream de CodeBERT es MIT |
| Formato de pesos | safetensors (un `model.safetensors` por checkpoint, con encoder y cabeza de una logit) |

## Arquitectura y entrenamiento

Cada checkpoint es un CodeBERT-base completo (12 capas, 12 cabezas de atención, 768 dimensiones ocultas) con una cabeza de clasificación de una sola logit añadida sobre el token `[CLS]`. El entrenamiento se realiza sobre funciones de C/C++ del dataset BigVul, tokenizadas con el tokenizador original de CodeBERT y truncadas a 512 tokens. Se generan tres familias de modelos: All-in-One (clasificador binario vulnerable/no vulnerable sobre toda la partición), Exclude (un clasificador por CWE objetivo entrenado con funciones vulnerables de esa CWE como positivos y todas las no vulnerables como negativos, excluyendo vulnerables de otras CWEs) y One-Hot (un clasificador por CWE inicializado desde el All-in-One correspondiente, con la CWE objetivo como positiva y las otras cuatro CWE del top-5 como negativas).

La innovación metodológica es la doble partición reproducible: la partición "official" mantiene el split publicado por LineVul y la partición "project" agrupa proyectos, CVEs, commits y hashes de funciones coincidentes antes de dividir, lo que evita la fuga de datos entre entrenamiento y evaluación que afecta a muchos trabajos previos de detección de vulnerabilidades. Cada configuración se entrena con cinco semillas (42, 2026, 31415, 27182 y 123456) para permitir estimaciones de varianza. Las huellas de las particiones preparadas se registran en `reproduction.json`. No se documenta uso de RLHF, DPO ni decodificación especulativa, ya que es un modelo discriminativo y no generativo.

## Capacidades

- Clasificación binaria de funciones como vulnerables o no vulnerables (variante All-in-One).
- Clasificación multiclase entre cinco CWEs (CWE-119, CWE-20, CWE-399, CWE-125, CWE-200) mediante las variantes Exclude y One-Hot.
- Localización a nivel de línea de la línea defectuosa, mediante suma de atención de la primera capa por línea de código fuente.
- Estimación de incertidumbre y calibración vía `sigmoid(logit / temperature)` con umbral derivado de validación.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso (es un encoder discriminativo).
- No es un modelo generativo ni conversacional; no produce texto libre.
- Sin capacidades de visión, audio ni modo "thinking".

## Casos de uso

- Investigación reproducible en detección de vulnerabilidades: sirve como baseline con cinco semillas y dos particiones para comparar nuevos métodos de localización de líneas frente a LineVul con control de fuga de datos.
- Auditoría estática de código C/C++ en pipelines de CI: el clasificador All-in-One puede puntuar funciones modificadas en un pull request y marcar candidatas para revisión manual, con umbral calibrado por validación.
- Priorización de hallazgos por CWE: las variantes One-Hot permiten asignar una de las cinco CWEs más frecuentes a una función ya marcada como vulnerable, facilitando el enrutamiento a equipos especializados.
- Localización de líneas sospechosas: la agregación de atención de la primera capa por línea produce un ranking que un revisor humano puede inspeccionar en orden, reduciendo el tiempo de triaje.
- Estudio de estabilidad entre semillas: la colección de cinco semillas permite medir la varianza de las predicciones y detectar funciones con clasificación inestable, candidatas a revisión adicional.
- Evaluación de generalización entre proyectos: la partición "project" permite medir el rendimiento en proyectos no vistos, un escenario realista para desplegar el modelo en un repositorio nuevo.
- Docencia y reproducción: los scripts de reconstrucción de split y evaluación documentados en la model card permiten reproducir resultados en cursos de seguridad de software.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card describe el protocolo de evaluación (métricas por función, promedio sobre la población reportada y las semillas) pero no incluye cifras concretas de precisión, recall, F1 ni métricas de localización de líneas.

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 0,5-1 GB por checkpoint en FP32 (125 M de parámetros), o aproximadamente 250-500 MB en FP16.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; una RTX 3060, RTX 4090, A100 o H100 son suficientes y sobredimensionadas para un solo checkpoint.
- Cabe en cualquier GPU consumer moderna e incluso en CPU para inferencia por lotes pequeños.
- Despliegue: PyTorch con `transformers` (cargando `microsoft/codebert-base` con la cabeza de clasificación del repositorio), ONNX Runtime o TorchScript; no se documenta soporte para vLLM, TGI ni llama.cpp por tratarse de un encoder clasificador.
- Latencia y throughput estimados: no disponibles en la información proporcionada; con 512 tokens de entrada, un encoder base de 12 capas suele procesar decenas de funciones por segundo en GPU moderna, pero no hay cifras oficiales.
- Almacenamiento: el repositorio completo ocupa 55,1 GB, por lo que conviene descargar solo los checkpoints necesarios con `hf_hub_download` y `subfolder`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LineVul-MoE (esta ficha) | ~125 M por checkpoint | 512 tokens | Detección binaria + 5 CWEs + localización de línea | No confirmada | Hugging Face, 110 checkpoints |
| LineVul original (awsm-research) | ~125 M (CodeBERT) | 512 tokens | Detección + localización de línea | MIT (repositorio GitHub) | GitHub |
| CodeBERT-base (microsoft) | 125 M | 512 tokens | Representaciones de código y NL | MIT | Hugging Face |
| GraphCodeBERT | ~125 M | 512 tokens | Representaciones con flujo de datos | MIT | Hugging Face |

Frente a LineVul original, esta colección añade cinco semillas y una partición agrupada por proyecto que reduce la fuga de datos; frente a CodeBERT-base, añade la cabeza de clasificación y el pipeline de evaluación. No se dispone de comparación cuantitativa de rendimiento porque no hay cifras publicadas.

## Limitaciones y advertencias

- El nombre "MoE" es engañoso: no hay mezcla de expertos ni enrutamiento condicional, es una colección de clasificadores independientes.
- Licencia de distribución no confirmada; no se recomienda uso comercial hasta que el autor la aclare, aunque el CodeBERT subyacente sea MIT.
- Solo cubre cinco CWEs (CWE-119, CWE-20, CWE-399, CWE-125, CWE-200); vulnerabilidades de otras clases quedan fuera del alcance de las variantes Exclude y One-Hot.
- Restringido a ventanas de 512 tokens: funciones largas se truncan y parte del código puede quedar fuera del análisis.
- No es un modelo generativo; no produce explicaciones en lenguaje natural, solo logits y puntuaciones de atención.
- Riesgo de falsos positivos y negativos inherente a la detección estática de vulnerabilidades; el umbral calibrado por validación es específico de cada split y CWE.
- El dataset BigVul tiene sesgos conocidos de etiquetado y composición que se heredan en el modelo.
- Cero descargas y cero likes: sin validación comunitaria independiente.
- El código de experimento en GitHub está pendiente de publicar ("repository URL and fixed commit pending"), lo que limita la reproducibilidad inmediata.
- No apto para producción sin evaluación previa en el dominio objetivo y sin revisión humana de los falsos positivos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Hietan/LineVul-MoE
- Modelo base CodeBERT: https://huggingface.co/microsoft/codebert-base
- Repositorio original de LineVul: https://github.com/awsm-research/LineVul
- Licencia del repositorio CodeBERT: https://github.com/microsoft/CodeBERT/blob/master/LICENSE
