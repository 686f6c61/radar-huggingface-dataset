# Robot-Haus/Qwen3.8-27B-original-oQ3.5e-fp16-mtp

## Resumen

Robot-Haus/Qwen3.8-27B-original-oQ3.5e-fp16-mtp es una cuantización del modelo multimodal Qwen3.8-27B de Alibaba, realizada por el usuario Robot-Haus mediante el pipeline oQe (imatrix-calibrated) de oMLX. El resultado es un checkpoint de aproximadamente 15 GB en formato MLX, pensado exclusivamente para Apple Silicon, que conserva tanto el codificador de visión como los cabezales de Multi-Token Prediction (MTP) verificados por inspección directa de los tensores. Esta versión busca resolver un problema práctico: muchas cuantizaciones comunitarias de Qwen3.x pierden silenciosamente la torre de visión o los módulos MTP durante la conversión, y este modelo garantiza su presencia.

El modelo base, Qwen3.8-27B, es un transformer denso de 27B parámetros con contexto nativo de 262K tokens, licencia Apache 2.0 y capacidades de imagen-texto a texto. La cuantización a Q3.5 (equivalente a 3 bits con guiado por imatrix) reduce el tamaño a menos de la mitad del original, manteniendo la funcionalidad completa. Está diseñado para cargarse con oMLX y activar "Lightning MTP" para acelerar la decodificación. Es relevante porque ofrece una opción compacta y verificada para ejecutar un modelo de vanguardia en hardware local de Apple, con visión y generación acelerada por MTP.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal (vision-language), basado en Qwen3.8-27B |
| Parametros totales | 4.380.854.512 (checkpoint cuantizado); el modelo base tiene 27B |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.000 tokens (nativo del modelo base) |
| Tipos de cuantizacion | Q3.5 (oQe, imatrix-calibrated, pesos fp16) |
| Idiomas soportados | Ingles (segun model card; el modelo base soporta mas idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un transformer denso con arquitectura multimodal nativa: incluye un codificador de vision (vision tower) integrado en el mismo checkpoint, lo que permite procesar imagenes y texto sin necesidad de un adaptador separado. Ademas incorpora Multi-Token Prediction (MTP), un mecanismo de decodificacion especulativa que predice varios tokens por paso, acelerando la generacion. El entrenamiento original incluyo datos de codigo, razonamiento, agentes y automatizacion de oficina, con un contexto de 262K tokens.

Esta version concreta no ha sido reentrenada ni ajustada; es una cuantizacion directa de los pesos oficiales de Qwen/Qwen3.8-27B. El metodo oQe de oMLX recopila estadisticas de activacion sobre un corpus de calibracion y asigna la precision por tensor de forma adaptativa, protegiendo los pesos mas sensibles. Los pesos se almacenan en fp16, que es el tipo nativo de computacion en los chips M1 y M2 de Apple, lo que mejora el rendimiento en esas plataformas. La verificacion posterior a la cuantizacion confirma la presencia de 333 tensores de vision y 29 de MTP, garantizando que no se han eliminado componentes.

## Capacidades

- Generacion de texto y conversacion multimodal: acepta entradas de imagen y texto, y produce respuestas de texto (pipeline image-text-to-text).
- Razonamiento y resolucion de problemas: el modelo base destaca en tareas de razonamiento paso a paso, matematicas y logica.
- Generacion de codigo: soporta lenguajes de programacion y tareas de programacion, incluyendo depuracion y explicacion.
- Tool calling y function calling: el modelo base esta disenado para agentes y flujos de trabajo que requieren invocar herramientas externas.
- Agentes y razonamiento multi-paso: optimizado para tareas agenticas de largo horizonte, con planificacion y ejecucion secuencial.
- Capacidades multilingues: aunque la model card indica solo ingles, el modelo base Qwen3.8-27B soporta multiples idiomas; esta cuantizacion no los elimina, pero no estan documentados en esta version.
- Multi-Token Prediction (MTP): los cabezales MTP estan intactos y permiten una decodificacion mas rapida cuando se activa "Lightning MTP" en oMLX.
- Vision: el codificador de vision esta completo (333 tensores), permitiendo analisis de imagenes, OCR, descripcion visual y respuesta a preguntas sobre contenido visual.

## Casos de uso

- Asistente de codigo en local: un desarrollador puede cargar este modelo en oMLX en un Mac con 16 GB de RAM unificada y usarlo para autocompletar, explicar o refactorizar codigo, aprovechando el contexto de 262K tokens para mantener archivos completos en memoria.
- Automatizacion de oficina: el modelo base esta optimizado para tareas como generacion de documentos, resumen de correos, creacion de presentaciones y analisis de datos, y esta cuantizacion permite ejecutarlo sin conexion en hardware Apple.
- Analisis de imagenes medicas o tecnicas: gracias a la torre de vision intacta, puede describir radiografias, diagramas o capturas de pantalla, y responder preguntas sobre ellas, util en entornos con privacidad de datos.
- Agente de soporte tecnico: con tool calling, puede integrarse en un sistema de tickets para leer documentacion, consultar APIs y generar respuestas contextuales, manteniendo el historial completo de la conversacion.
- Investigacion academica: para investigadores que necesitan procesar articulos largos con figuras y tablas, el contexto de 262K y la vision permiten analizar documentos completos de una sola vez.
- Prototipado de aplicaciones multimodales: desarrolladores de apps para macOS pueden usar este modelo como backend local para funciones de vision por computador, como reconocimiento de objetos o extraccion de texto de imagenes, sin depender de servicios en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks especificos para esta cuantizacion en la informacion disponible. El modelo base Qwen3.8-27B tiene benchmarks publicados en su pagina oficial de HuggingFace y en articulos como el de Yottalabs, que incluyen evaluaciones en tareas de codigo, matematicas y vision (por ejemplo, MathVision). Sin embargo, no se dispone de los numeros concretos en los materiales proporcionados, y no se deben inventar. Se recomienda consultar la pagina del modelo base para obtener las metricas de referencia.

## Requisitos de hardware

- VRAM estimada: el checkpoint ocupa aproximadamente 15,7 GB, por lo que se necesita un Mac con al menos 16 GB de RAM unificada para cargarlo en memoria. Con 32 GB o mas se puede trabajar comodamente con contexto largo.
- GPU recomendadas: Apple Silicon (M1, M2, M3, M4). En M1 y M2, fp16 es el tipo nativo y ofrece mejor rendimiento; en M3 y M4, bf16 puede ser mas rapido, pero esta version es fp16.
- No es compatible con CUDA de forma nativa: el formato MLX esta pensado para Apple Silicon; en NVIDIA se requeriria convertir a otro formato (por ejemplo, GGUF) y el rendimiento de fp16 puede ser suboptimo.
- Opciones de despliegue: oMLX (recomendado, con soporte para Lightning MTP), MLX Python API, o conversion a otros formatos mediante herramientas de la comunidad.
- Latencia y throughput: no se proporcionan datos concretos. La activacion de MTP puede reducir la latencia de decodificacion, pero los valores dependen del hardware y la configuracion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3.8-27B (base) | 27B | 262K | Sin cuantizar (bf16/fp16) | Apache 2.0 | Safetensors (original) |
| Robot-Haus/Qwen3.8-27B-original-oQ3.5e-fp16-mtp | 27B (checkpoint 4.38B) | 262K | Q3.5 oQe, fp16 | Apache 2.0 | Safetensors (MLX) |
| Toomanydatsuns/Qwen3.8-27B-oQ3.5e-fp16-mtp | 27B (similar) | 262K | Q3.5 oQe, fp16 | Apache 2.0 | Safetensors (MLX) |

La diferencia principal entre esta cuantizacion y el modelo base es el tamano (15,7 GB frente a ~54 GB en fp16) y la velocidad en Apple Silicon. Frente a otras cuantizaciones de la comunidad, Robot-Haus verifica explicitamente la presencia de vision y MTP, lo que no siempre ocurre en versiones similares. No se dispone de datos de rendimiento comparativo entre estas variantes.

## Limitaciones y advertencias

- Cuantizacion agresiva: Q3.5 (3 bits) puede degradar la precision en tareas complejas de razonamiento o generacion de codigo en comparacion con el modelo original. Se recomienda probar en el caso de uso concreto.
- Solo para Apple Silicon: el formato MLX y la eleccion de fp16 estan optimizados para chips Apple; en hardware NVIDIA o AMD el rendimiento puede ser pobre o requerir conversion.
- Idioma documentado: la model card indica solo ingles, aunque el modelo base soporta mas idiomas. No se garantiza el mismo nivel de calidad en otros idiomas.
- Riesgo de alucinacion: como cualquier modelo de lenguaje, puede generar contenido falso o inventado, especialmente en tareas de vision o razonamiento complejo.
- Sin ajuste fino: es una cuantizacion directa, por lo que no se han mitigado sesgos ni se ha mejorado la seguridad respecto al modelo base.
- Dependencia de oMLX: para aprovechar MTP y el rendimiento optimo, se necesita el software oMLX; otras herramientas pueden no soportar estas caracteristicas.
- Tamano de contexto: aunque el modelo soporta 262K tokens, en hardware con 16 GB de RAM puede no caber el contexto completo en memoria, limitando el uso practico.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Robot-Haus/Qwen3.8-27B-original-oQ3.5e-fp16-mtp
- Modelo base Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio oficial de Qwen3.8-27B en GitHub: https://github.com/AlibabaCloud-Official/Qwen3.8-27B
- Articulo de Yottalabs sobre Qwen3.8-27B: https://www.yottalabs.ai/post/qwen-3-8-27b-specs-hardware-requirements-how-to-run-2026
- Pagina de Qwen3.8 en LM Studio: https://lmstudio.ai/models/qwen3.8
- Version similar de otro autor: https://huggingface.co/Toomanydatsuns/Qwen3.8-27B-oQ3.5e-fp16-mtp
