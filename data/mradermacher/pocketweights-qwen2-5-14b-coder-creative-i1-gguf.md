# mradermacher/PocketWeights-Qwen2.5-14B-Coder-Creative-i1-GGUF

## Resumen

PocketWeights-Qwen2.5-14B-Coder-Creative-i1-GGUF es una colección de cuantizaciones GGUF con matriz de importancia (imatrix) del modelo base PocketWeights/PocketWeights-Qwen2.5-14B-Coder-Creative, un merge de la familia Qwen2.5 de 14 000 millones de parámetros orientado a generación de código y tareas creativas. El modelo base ha sido sometido a un proceso de "abliteration" (eliminación de rechazos) y se presenta como "uncensored", lo que lo hace atractivo para entornos donde se requiere una generación de texto sin restricciones temáticas. El cuantizador mradermacher ha producido múltiples versiones GGUF con distintos niveles de compresión, desde IQ2_M (5,5 GB) hasta Q4_K_S (8,7 GB), permitiendo su ejecución en hardware de consumo. La licencia Apache-2.0 facilita su uso comercial y la integración en proyectos propietarios. Este repositorio es relevante para desarrolladores que buscan un modelo de código y creatividad con pesos ligeros y desplegable localmente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basado en Qwen2.5) |
| Parametros totales | 14 770 033 664 (14,77 B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | i1-IQ2_M, i1-Q2_K, i1-IQ3_XXS, i1-IQ3_M, i1-Q3_K_M, i1-IQ4_NL, i1-Q4_K_S (ademas de archivo imatrix) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (con imatrix) |

## Arquitectura y entrenamiento

El modelo base PocketWeights-Qwen2.5-14B-Coder-Creative es un merge de la arquitectura Qwen2.5-14B, combinado mediante mergekit con la tecnica dare_ties. Los tags indican que ha sido "abliterated" (se han eliminado los mecanismos de rechazo del modelo original) y etiquetado como "uncensored". No se dispone de informacion detallada sobre el dataset de entrenamiento, el numero de tokens procesados ni si se aplicaron tecnicas de RLHF o DPO. La cuantizacion realizada por mradermacher utiliza el metodo imatrix (importance matrix) para mejorar la calidad de los pesos comprimidos, generando archivos GGUF optimizados para inferencia con llama.cpp y motores compatibles.

## Capacidades

- Generacion de texto y codigo: al estar basado en Qwen2.5-14B, hereda capacidades de generacion de codigo en multiples lenguajes de programacion, aunque no se especifican detalles concretos.
- Razonamiento y creatividad: el nombre "Coder-Creative" sugiere un enfoque en tareas que combinan logica de programacion con generacion creativa (por ejemplo, documentacion, comentarios, historias tecnicas).
- Conversacion: el tag "conversational" indica que el modelo puede mantener dialogos multi-turno.
- Sin censura: al ser "abliterated" y "uncensored", no aplica filtros de contenido tipicos de otros modelos, lo que permite generar respuestas sobre temas sensibles sin restricciones.
- Soporte de tool calling: no se menciona explicitamente, por lo que se considera no disponible.
- Capacidades multilingues: solo se declara ingles.

## Casos de uso

- Asistente de programacion local: un desarrollador puede ejecutar la cuantizacion Q4_K_S (8,7 GB) en una GPU con 12 GB de VRAM para obtener sugerencias de codigo, explicaciones de algoritmos o refactorizacion de funciones sin depender de servicios en la nube.
- Generacion de documentacion tecnica creativa: el modelo puede redactar comentarios, README o tutoriales a partir de fragmentos de codigo, aprovechando su orientacion "creative".
- Chatbot sin restricciones para entornos de investigacion: al ser "uncensored", permite explorar temas que otros modelos rechazan, util en estudios sobre sesgos o generacion de contenido controvertido en entornos controlados.
- Prototipado rapido de aplicaciones de IA: gracias a la licencia Apache-2.0 y al formato GGUF, se puede integrar en pipelines con llama.cpp o Ollama para pruebas de concepto sin coste de licencia.
- Educacion y formacion en IA: los estudiantes pueden analizar el comportamiento de un modelo "abliterated" y compararlo con la version original de Qwen2.5-14B para entender el impacto de la eliminacion de rechazos.
- Despliegue en entornos con recursos limitados: las cuantizaciones mas pequenas (IQ2_M, 5,5 GB) permiten ejecutar el modelo en CPUs con suficiente RAM o en GPUs de gama baja, habilitando aplicaciones de asistencia en equipos modestos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de puntuaciones en MMLU, HumanEval, GSM8K ni otras pruebas estandar para este modelo o su base.

## Requisitos de hardware

- VRAM estimada para inferencia: segun el archivo GGUF elegido. Para Q4_K_S (8,7 GB) se recomienda al menos 12 GB de VRAM; para IQ2_M (5,5 GB) bastan 8 GB. El archivo imatrix (0,1 GB) no es para inferencia directa.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090 24 GB, o GPUs de datacenter como A10 o A100 si se requiere mayor velocidad.
- En consumer GPU: si, las cuantizaciones de 5,5 a 8,7 GB caben en GPUs de 8-12 GB, aunque con menor velocidad que en GPUs de gama alta.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, o servidores compatibles con GGUF como llama-cpp-python. Tambien es compatible con endpoints via herramientas como llama-server.
- Latencia y throughput: no se proporcionan datos oficiales. En una RTX 4090 con Q4_K_S se puede esperar una velocidad de generacion de 40-60 tokens por segundo, pero es una estimacion no confirmada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| PocketWeights-Qwen2.5-14B-Coder-Creative (este) | 14,77 B | No disponible | Apache-2.0 | GGUF | Merge "abliterated" y "uncensored" |
| Qwen2.5-14B-Instruct (original) | 14,77 B | 32 768 (tipico) | Apache-2.0 | Safetensors, GGUF | Modelo oficial con instrucciones y seguridad |
| Qwen2.5-14B-Coder (original) | 14,77 B | 32 768 (tipico) | Apache-2.0 | Safetensors, GGUF | Especializado en codigo, con filtros de seguridad |

La comparativa se basa en informacion publica de los modelos Qwen2.5. No se dispone de datos de rendimiento comparativo para este merge especifico.

## Limitaciones y advertencias

- Sesgos conocidos: al ser un modelo "uncensored" y "abliterated", puede generar contenido ofensivo, discriminatorio o peligroso sin filtros. No se han documentado sesgos especificos, pero hereda los del modelo base Qwen2.5.
- Riesgo de alucinacion: como cualquier LLM, puede inventar hechos, codigo incorrecto o referencias falsas. La ausencia de filtros no reduce este riesgo.
- Limitaciones de contexto: no se ha especificado la longitud de contexto soportada. Se recomienda asumir la de Qwen2.5 (32 768 tokens) pero no esta confirmado.
- Idioma: solo ingles. No se garantiza un rendimiento adecuado en otros idiomas.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero el modelo base puede tener dependencias de otros modelos con licencias diferentes. Se debe verificar la procedencia de los pesos originales.
- Advertencia para produccion: al ser un merge no oficial y sin benchmarks publicados, su calidad en tareas especificas no esta validada. Se recomienda realizar pruebas exhaustivas antes de usarlo en entornos criticos.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/PocketWeights-Qwen2.5-14B-Coder-Creative-i1-GGUF
- Modelo base: https://huggingface.co/PocketWeights/PocketWeights-Qwen2.5-14B-Coder-Creative
- Cuantizaciones estaticas (sin imatrix): https://huggingface.co/mradermacher/PocketWeights-Qwen2.5-14B-Coder-Creative-GGUF
- Pagina de ayuda de mradermacher para solicitudes: https://huggingface.co/mradermacher/model_requests
