# mradermacher/Ornith-1.5-9B-OBLITERATED-GGUF

## Resumen

Ornith-1.5-9B-OBLITERATED es una versión del modelo Ornith-1.5-9B, desarrollado por DeepReinforce, que ha sido sometido a un proceso de "abliteration" mediante la herramienta OBLITERATUS. Este proceso elimina quirúrgicamente los mecanismos internos de rechazo del modelo sin necesidad de reentrenamiento, dando como resultado un modelo que responde de forma más directa a peticiones que normalmente serían rechazadas. El modelo original es un modelo denso de 9 mil millones de parámetros, multimodal y orientado a tareas de codificación, según la información disponible en el blog de Atomic Chat.

Esta ficha se centra en la versión cuantizada en formato GGUF publicada por mradermacher, que permite ejecutar el modelo en hardware de consumo. El repositorio contiene múltiples cuantizaciones (Q2_K, Q3_K, Q4_K, Q5_K, Q6_K, Q8_0, IQ4_XS, etc.) y ocupa 60.8 GB en total. La fecha de creación del repositorio es el 27 de agosto de 2026, aunque no se dispone de más detalles sobre el modelo base, su licencia o sus idiomas soportados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (se describe como modelo denso multimodal de codificacion) |
| Parametros totales | 9.197.093.888 |
| Parametros activos | no aplicable (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | x-f16, Q4_K_S, Q2_K, Q8_0, Q6_K, Q3_K_M, Q3_K_S, Q3_K_L, Q4_K_M, Q5_K_S, Q5_K_M, IQ4_XS |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base Ornith-1.5-9B. Segun el blog de Atomic Chat, se trata de un modelo denso de 9B parametros, multimodal y especializado en codificacion. No se han publicado datos sobre el numero de tokens de entrenamiento, la composicion del dataset ni el uso de tecnicas como RLHF o DPO.

La version OBLITERATED aplica la tecnica de abliteration, implementada en el repositorio OBLITERATUS de elder-plinius. Esta tecnica identifica y elimina las representaciones internas responsables del rechazo de contenido, sin reentrenar el modelo. El resultado es un modelo que mantiene sus capacidades originales pero con una menor tendencia a negarse a responder a ciertas peticiones.

## Capacidades

- Generacion de codigo: el modelo esta orientado a tareas de programacion, segun la descripcion del blog.
- Multimodal: se menciona que es multimodal, aunque no se especifica que modalidades (probablemente texto e imagen).
- Razonamiento: al ser un modelo de 9B, se espera capacidad de razonamiento basico y seguimiento de instrucciones.
- Tool calling: no se menciona soporte explicito.
- Agentes: no se menciona soporte para agentes multi-paso.
- Multilingue: no se dispone de informacion sobre idiomas soportados.
- Thinking mode: no se menciona.

## Casos de uso

- Asistente de programacion local: al ser un modelo de 9B cuantizado a 4 bits, puede ejecutarse en GPUs de 8 GB, permitiendo un asistente de codigo offline que sugiere fragmentos, explica funciones o genera tests.
- Generacion de codigo en entornos con restricciones de privacidad: al ejecutarse localmente, evita enviar codigo propietario a servicios en la nube.
- Educacion y aprendizaje: puede usarse para explicar conceptos de programacion, depurar ejemplos o generar ejercicios.
- Prototipado rapido: integrable en editores de texto o IDEs mediante herramientas como llama.cpp u Ollama para autocompletar o generar funciones.
- Analisis de codigo legacy: puede ayudar a documentar o refactorizar codigo antiguo, aunque su contexto limitado (desconocido) puede ser una restriccion.
- Experimentacion con abliteration: al ser una version OBLITERATED, permite estudiar el efecto de la eliminacion de rechazos en un modelo de codigo, util para investigacion en seguridad y alineacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de datos de MMLU, HumanEval, GSM8K ni otras evaluaciones para esta version especifica.

## Requisitos de hardware

- VRAM estimada: segun el blog de Atomic Chat, el modelo cabe en una GPU de 8 GB o en un Mac de 16 GB con cuantizacion de 4 bits (probablemente Q4_K_M o similar).
- GPUs recomendadas: RTX 3060/4060 (8 GB), RTX 4070/4080 (12-16 GB), o GPUs de datacenter como A10G o L4 para mayor velocidad.
- En consumer GPU: si, con cuantizacion Q4_K_M o inferior.
- Opciones de despliegue: llama.cpp, Ollama, vLLM (si se convierte a otro formato), TGI (con adaptacion).
- Latencia y throughput: no disponible, pero al ser un modelo de 9B, se espera una generacion de 10-20 tokens/s en una RTX 4090 con cuantizacion 4-bit, y menor en GPUs de 8 GB.

## Comparativa con modelos similares

No se dispone de datos comparativos con otros modelos de la misma categoria (por ejemplo, Qwen2.5-Coder-7B, DeepSeek-Coder-6.7B o CodeLlama-7B). La informacion disponible no incluye benchmarks ni especificaciones tecnicas detalladas del modelo base, por lo que no es posible realizar una comparacion rigurosa.

## Limitaciones y advertencias

- Sesgos conocidos: al ser una version abliterated, el modelo puede generar contenido que el modelo original rechazaria, incluyendo respuestas potencialmente dañinas o inapropiadas. Esto supone un riesgo en entornos de produccion.
- Riesgo de alucinacion: como cualquier modelo de lenguaje, puede inventar informacion, especialmente en tareas de codigo donde los APIs o funciones pueden no existir.
- Limitaciones de contexto: se desconoce la longitud de contexto, lo que puede limitar su uso en tareas que requieran ventanas largas.
- Restricciones de licencia: la licencia no esta especificada, por lo que no se garantiza su uso comercial. Se recomienda contactar con el autor original (DeepReinforce) para aclarar los terminos.
- Caveat de produccion: al no tener informacion sobre el entrenamiento ni evaluaciones, no se recomienda su uso en sistemas criticos sin una validacion exhaustiva.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mradermacher/Ornith-1.5-9B-OBLITERATED-GGUF
- Version Abliterated-i1: https://huggingface.co/mradermacher/Ornith-1.5-9B-Abliterated-i1-GGUF
- Version Abliterated: https://huggingface.co/mradermacher/Ornith-1.5-9B-Abliterated-GGUF
- Pagina en Ollama: https://ollama.com/library/ornith-1.5
- Repositorio OBLITERATUS: https://github.com/elder-plinius/OBLITERATUS
- Guia de ejecucion local: https://atomic.chat/blog/guides/how-to-run-ornith-1-5-locally
