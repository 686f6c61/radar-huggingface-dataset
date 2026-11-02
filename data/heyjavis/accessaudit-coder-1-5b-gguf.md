# HeyJavis/accessaudit-coder-1.5b-gguf

## Resumen

AccessAudit-coder-1.5b es un ajuste fino (fine-tuning) del modelo Qwen/Qwen2.5-Coder-1.5B-Instruct orientado a una tarea muy concreta: dado un aviso de violacion de accesibilidad web detectado por axe-core y el fragmento HTML que lo provoca, el modelo devuelve un objeto JSON con una explicacion del problema, las personas afectadas, la referencia WCAG correspondiente, un resumen de la correccion y el HTML corregido. Lo desarrolla el usuario HeyJavis en el marco de un proyecto universitario de laboratorio de LLM, y se distribuye bajo licencia Apache 2.0.

El modelo parte de la arquitectura transformer decoder-only de Qwen2.5-Coder-1.5B-Instruct, con 1.543.714.304 parametros, y se ha adaptado mediante QLoRA (base cuantizada en 4 bits NF4, LoRA con r=8, alpha=16 sobre q_proj y v_proj, learning rate 0.0002 y 3 epocas) sobre un conjunto de 473 pares verificados automaticamente, construidos a partir del dataset AccessGuru (Fathallah, Hernandez, Staab, 2025). El resultado se publica tanto en safetensors como en GGUF, con un fichero Q4_K_M de 0,99 GB.

Su relevancia es acotada pero clara: cubre un nicho de automatizacion de auditorias de accesibilidad web con un modelo pequeno que puede ejecutarse en hardware modesto. No obstante, los propios datos del autor muestran una diferencia enorme entre el rendimiento en GPU (85,5 % de correcciones que pasan axe) y en CPU con GGUF Q4_K_M (27,6 %), un dato critico para cualquier despliegue real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Qwen2.5-Coder-1.5B-Instruct), ajuste QLoRA |
| Parametros totales | 1.543.714.304 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q4_K_M (GGUF); base de entrenamiento en 4-bit NF4; safetensors en precision original |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura transformer decoder-only de Qwen2.5-Coder-1.5B-Instruct, sin modificaciones estructurales: el ajuste se realiza con QLoRA, manteniendo la base cuantizada en 4 bits NF4 y entrenando adaptadores LoRA de rango 8 y alpha 16 unicamente en las proyecciones q_proj y v_proj, con learning rate 0.0002 durante 3 epocas. Esta configuracion es deliberadamente ligera, coherente con un proyecto academico y con el tamano reducido del conjunto de datos.

El corpus de entrenamiento son 473 pares entrada-salida verificados automaticamente, derivados del dataset AccessGuru (Fathallah, Hernandez, Staab, 2025, DOI 10.18419/DARUS-5177, CC BY 4.0). Cada par asocia una violacion de axe-core y el elemento HTML fallido con una respuesta JSON estructurada de cinco campos (`explanation`, `who_is_affected`, `wcag`, `fix_summary`, `fixed_html`). No se documenta en la informacion disponible el uso de RLHF, DPO ni tecnicas de decodificacion especulativa.

## Capacidades

- Generacion de correcciones de accesibilidad web: recibe una violacion de axe-core y el HTML del elemento afectado y produce HTML corregido.
- Explicacion del problema en lenguaje natural mediante el campo `explanation`.
- Identificacion de colectivos afectados por la barrera de accesibilidad (`who_is_affected`).
- Referencia a criterios WCAG concretos (`wcag`).
- Resumen de la correccion aplicada (`fix_summary`).
- Salida estructurada en JSON valido (100 % de validez JSON reportada por el autor en ambos entornos de prueba).
- Capacidades heredadas de Qwen2.5-Coder-1.5B-Instruct en generacion de texto y codigo, aunque no se documenta su rendimiento tras el ajuste.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles.
- Capacidades especiales (modo thinking, vision, audio): no disponibles.

## Casos de uso

- Auditoria de accesibilidad en pipelines de CI/CD: integrar el modelo tras un paso de axe-core para generar automaticamente propuestas de correccion del HTML, que luego se revisan en el pull request antes de fusionar.
- Asistencia a desarrolladores front-end: dado un aviso de axe-core en el editor, el modelo devuelve el fragmento corregido junto con la explicacion y el criterio WCAG, reduciendo el tiempo de busqueda de documentacion.
- Generacion de informes de accesibilidad: usar los campos `explanation`, `who_is_affected` y `wcag` para redactar de forma semi-automatica el informe de no conformidad de un sitio web.
- Formacion y divulgacion: emplear las explicaciones generadas como material didactico sobre por que un patron HTML concreto excluye a determinados usuarios.
- Prototipado rapido en entornos con hardware limitado: el fichero GGUF Q4_K_M de 0,99 GB permite ejecutar el modelo en CPU para pruebas de concepto, asumiendo la caida de calidad documentada en ese modo.
- Preprocesado de grandes volumenes de paginas: clasificar y priorizar violaciones por criterio WCAG antes de una revision manual, usando el campo `wcag` como etiqueta.
- Revision asistida de plantillas y componentes reutilizables: aplicar el modelo a los fragmentos de un design system para detectar patrones de markup inaccesibles de forma sistematica.

## Benchmarks y rendimiento

| Prueba (elementos de 76 sitios web no vistos) | Correccion pasa axe | JSON valido | Segundos por respuesta |
|---|---|---|---|
| GPU T4, bitsandbytes 4-bit | 85,5 % | 100,0 % | 1,99 |
| CPU, 2 hilos, GGUF Q4_K_M | 27,6 % | 100,0 % | 29,2 |

No se han publicado en la informacion disponible resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) para este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia en 4 bits: en torno a 1 GB de pesos mas overhead de contexto y runtime; no se especifica una cifra oficial.
- GPU recomendadas: el autor valida el modelo en una NVIDIA T4 con bitsandbytes en 4 bits; GPUs consumer con 4-8 GB de VRAM son suficientes para la variante cuantizada.
- Compatibilidad con GPU consumer: si, el modelo de 1,5B en Q4_K_M (0,99 GB) cabe en practicamente cualquier GPU consumer moderna.
- Despliegue en CPU: posible via llama.cpp u Ollama con el fichero GGUF, pero con una penalizacion severa de calidad (27,6 % de correcciones validas frente a 85,5 % en GPU) y latencia de 29,2 s por respuesta con 2 hilos.
- Opciones de despliegue: llama.cpp, Ollama y otros runtimes compatibles con GGUF; bitsandbytes 4-bit en PyTorch para GPU. No se documenta soporte verificado en vLLM o TGI.
- Throughput y latencia: aproximadamente 2 s por respuesta en T4 4-bit y 29,2 s por respuesta en CPU con 2 hilos, segun los datos del autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AccessAudit-coder-1.5b | 1,54B | No disponible | Correccion de accesibilidad web (axe-core/WCAG) | Apache 2.0 | HuggingFace (safetensors y GGUF) |
| Qwen2.5-Coder-1.5B-Instruct | 1,54B | No disponible en la informacion proporcionada | Generacion de codigo e instrucciones generales | Apache 2.0 | HuggingFace |
| Modelos especializados en accesibilidad web de tamano comparable | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de benchmarks comparativos con alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- El propio autor advierte que las correcciones automaticas deben ser revisadas por una persona antes de aplicarse.
- Diferencia muy acusada de calidad entre GPU 4-bit (85,5 %) y CPU GGUF Q4_K_M (27,6 %): el mismo fichero cuantizado rinde mucho peor en CPU, por lo que no es equivalente desplegar en un entorno u otro.
- El conjunto de entrenamiento es muy reducido (473 pares), lo que limita la generalizacion a tipos de violaciones o frameworks HTML no representados.
- Riesgo de alucinacion en el HTML corregido: el modelo puede generar markup sintacticamente valido pero semanticamente incorrecto o que introduzca nuevos problemas de accesibilidad.
- Cobertura limitada a las reglas de axe-core y a los criterios WCAG presentes en los datos de entrenamiento; no se documenta su comportamiento fuera de ese dominio.
- Idiomas soportados no documentados; las explicaciones generadas pueden no estar disponibles en castellano.
- Longitud de contexto no documentada, lo que impide planificar el procesamiento de fragmentos HTML grandes.
- Proyecto universitario sin senales de mantenimiento (0 descargas y 0 likes en el momento de la consulta); no hay garantia de soporte ni de actualizaciones.
- Aunque la licencia es Apache 2.0, los datos de entrenamiento derivan de AccessGuru bajo CC BY 4.0, por lo que conviene conservar la atribucion correspondiente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/HeyJavis/accessaudit-coder-1.5b-gguf
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-1.5B-Instruct
- Dataset AccessGuru (Fathallah, Hernandez, Staab, 2025): https://doi.org/10.18419/DARUS-5177
