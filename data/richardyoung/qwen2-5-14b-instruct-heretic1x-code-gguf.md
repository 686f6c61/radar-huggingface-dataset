# richardyoung/Qwen2.5-14B-Instruct-heretic1x-code-GGUF

## Resumen

Qwen2.5-14B-Instruct-heretic1x-code-GGUF es una cuantizacion en formato GGUF del modelo richardyoung/Qwen2.5-14B-Instruct-heretic1x-code, un derivado del Qwen2.5-14B-Instruct de Alibaba. La particularidad del modelo es que ha sido sometido a una tecnica de "abliteration" (etiquetada como "heretic"), un proceso que elimina o atenua los mecanismos de rechazo aprendidos durante el ajuste fino por alineamiento, dando como resultado un modelo "uncensored" que responde a practicamente cualquier peticion sin filtros de seguridad. El sufijo "code" indica un enfasis adicional en tareas de programacion.

El modelo cuenta con 14.770.033.664 parametros (aproximadamente 14,8 mil millones) y hereda la arquitectura transformer densa de la familia Qwen2.5, con una ventana de contexto nativa de 128.000 tokens en el modelo original. Esta version GGUF esta pensada para su uso con llama.cpp y Ollama, e incluye cuantizaciones generadas con la tecnica imatrix (importance matrix) para preservar la calidad en precisiones reducidas.

Es relevante para desarrolladores e investigadores que necesiten un modelo de ~14B sin restricciones de contenido para experimentacion, generacion de codigo sin filtros o estudios sobre alineamiento y seguridad. Cabe destacar que el repositorio esta restringido (gated): requiere aceptar condiciones en Hugging Face antes de la descarga, y su licencia declarada es Apache 2.0, aunque las implicaciones de la abliteration sobre el uso responsable deben considerarse con cuidado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen2.5-14B-Instruct) |
| Parametros totales | 14.770.033.664 (~14,8B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el Qwen2.5-14B base soporta 128K) |
| Tipos de cuantizacion | GGUF con imatrix (multiples niveles de cuantizacion; niveles concretos no detallados) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-14B-Instruct: un transformer denso con atencion por grupos (GQA) y las innovaciones propias de la familia Qwen2.5. Sobre ese modelo base, el autor richardyoung aplico un proceso de abliteration ("heretic1x"), una tecnica que identifica la direccion en el espacio de activaciones responsable de los comportamientos de rechazo y la proyecta fuera de los pesos, eliminando la tendencia del modelo a negarse a responder. El sufijo "code" sugiere un ajuste orientado a tareas de programacion, aunque no se dispone de detalles sobre el dataset empleado en ese ajuste.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo fases de RLHF o DPO adicionales mas alla del alineamiento original de Qwen2.5. La version publicada es una cuantizacion GGUF generada con imatrix, una tecnica que calcula una matriz de importancia para minimizar la perdida de calidad en la cuantizacion. No se documentan innovaciones adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto conversacional multi-turno en ingles.
- Generacion y asistencia en codigo, reforzada por el ajuste "code".
- Razonamiento y matematicas, heredados del Qwen2.5-14B-Instruct.
- Respuestas sin filtros de contenido (uncensored/abliterated): no aplica rechazos de seguridad.
- Soporte de tool calling / function calling heredado del modelo base (no verificado en esta version abliterated).
- Capacidades de agente y razonamiento multi-paso (heredadas del modelo base; no verificadas tras la abliteration).
- Capacidades multilingues limitadas segun la ficha: idioma declarado "en" (el Qwen2.5 base es multilingue, pero esta version declara solo ingles).
- No dispone de vision ni audio.

## Casos de uso

- Generacion de codigo sin restricciones de contenido: util para producir fragmentos de codigo en dominios donde los filtros de seguridad del modelo original podrian bloquear respuestas legitimas (por ejemplo, seguridad ofensiva, exploits de laboratorio o analisis de malware).
- Investigacion sobre alineamiento y seguridad: permite estudiar como la abliteration afecta al comportamiento del modelo, comparando respuestas con el Qwen2.5-14B-Instruct original.
- Red teaming y evaluacion de robustez: sirve como modelo "sin censura" de referencia para probar sistemas de moderacion y clasificadores de contenido.
- Despliegue local con Ollama o llama.cpp: al estar en GGUF, se puede ejecutar en estaciones de trabajo con GPU consumer, ideal para prototipado offline y entornos sin conectividad.
- Asistente de programacion en local: con 14,8B parametros y contexto amplio heredado, puede integrarse en editores o pipelines de CI/CD para generacion y revision de codigo, siempre que el caso no requiera garantias de contenido.
- Generacion de texto creativo sin filtros: escritura de ficcion, guiones o contenido donde los rechazos del modelo alineado resultarian un obstaculo.
- Experimentacion academica con cuantizaciones imatrix: permite medir el impacto de la cuantizacion en la calidad de un modelo abliterated frente a su version en safetensors.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: para 14,8B parametros, aproximadamente 9-10 GB en cuantizacion Q4, 14-16 GB en Q8 y ~30 GB en FP16 (estimacion estandar segun tamano; no confirmada en la ficha).
- GPU recomendadas: RTX 4090 (24 GB) para Q4/Q5/Q8, A100 40/80 GB o H100 para precision completa y mayor throughput.
- Cabe en GPU consumer: si, en tarjetas con 12 GB o mas en cuantizaciones Q4; en 24 GB con margen para Q8.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF. La ficha indica compatibilidad con endpoints.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Qwen2.5-14B-Instruct-heretic1x-code-GGUF | ~14,8B | no disponible (base 128K) | apache-2.0 | Abliterated, GGUF, solo ingles declarado |
| Qwen2.5-14B-Instruct (original) | ~14,8B | 128K | apache-2.0 | Alineado, con filtros de seguridad, multilingue |
| Otras variantes abliterated de Qwen2.5-14B | ~14,8B | 128K | variable | Mismo enfoque uncensored, sin ajuste "code" documentado |
| Modelos densos ~13-14B alternativos (p. ej. Llama 3.1 8B/70B, Mistral) | variable | variable | variable | No comparables directamente en tamano; datos de rendimiento no disponibles aqui |

No se dispone de datos de benchmarks para establecer una comparacion cuantitativa de rendimiento.

## Limitaciones y advertencias

- La abliteration elimina los mecanismos de rechazo: el modelo puede generar contenido danino, ilegal o eticamente problematico sin advertencia.
- Riesgo elevado de alucinacion, comun en modelos de ~14B y potencialmente agravado por la perdida de coherencia tras la abliteration.
- Idioma declarado solo ingles; el rendimiento en castellano no esta garantizado pese al multilingusimo del Qwen2.5 base.
- La licencia Apache 2.0 permite uso comercial, pero el uso de un modelo uncensored conlleva responsabilidad legal y reputacional; verificar politicas de la plataforma de despliegue.
- Acceso restringido (gated): requiere aceptar condiciones en Hugging Face, lo que puede limitar la automatizacion de descargas.
- No se documentan detalles del ajuste "code" ni de la cuantizacion imatrix; la calidad de cada nivel GGUF no esta verificada.
- El modelo base Qwen2.5-14B-Instruct tiene sesgos conocidos de sus datos de entrenamiento, que persisten tras la abliteration.

## Enlaces

- Hugging Face: https://huggingface.co/richardyoung/Qwen2.5-14B-Instruct-heretic1x-code-GGUF
- Modelo base (safetensors): https://huggingface.co/richardyoung/Qwen2.5-14B-Instruct-heretic1x-code
- Qwen2.5-14B-Instruct original: https://huggingface.co/Qwen/Qwen2.5-14B-Instruct
- llama.cpp: https://github.com/ggerganov/llama.cpp
- Ollama: https://ollama.com
