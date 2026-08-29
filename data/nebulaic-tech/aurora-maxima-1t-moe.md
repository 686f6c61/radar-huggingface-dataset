# nebulaic-tech/aurora-maxima-1t-moe

## Resumen

Aurora Maxima 1.04T Ultra-Sparse MoE es un modelo de lenguaje presentado por Nebulaic Tech como parte de su flota "Aurora AI Frontier". Según su model card, está diseñado para eliminar el cuello de botella de errores de sintaxis en la creación de software, compilando de forma nativa el lenguaje NNPL (English-Native Programming Language) además de pilas poliglotas como Python, TypeScript, Rust, C++, Go y SQL. También se le atribuyen capacidades de razonamiento STEM profundo, agencia de software autónoma y grounding con búsqueda de Google en tiempo real.

La arquitectura declarada es un MoE ultra-sparse con 64 expertos y routing jerárquico, con un contexto de 1.000.000 de tokens y 64.8 mil millones de parámetros activos. Sin embargo, los pesos reales en safetensors suman 2.098.216.960 parámetros (aproximadamente 2.1 mil millones), lo que contradice frontalmente la cifra de 1.04 billones declarada en la model card. El repositorio ocupa 4.2 GB, consistente con un modelo de ~2.1B en FP16, no con un modelo de 1T. Esta discrepancia es crítica para cualquier evaluación seria del modelo.

La relevancia actual del modelo reside en su propuesta de lenguaje de programación nativo en inglés (NNPL) y su enfoque en generación de código, aunque la falta de benchmarks verificados y la inconsistencia en los parámetros obligan a tratarlo con cautela. No se han publicado resultados de evaluaciones independientes en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE ultra-sparse con 64 expertos y routing jerárquico (declarado) |
| Parametros totales | 1.04 billones (declarado por el autor); 2.098.216.960 (~2.1B) segun pesos safetensors reales |
| Parametros activos | 64.8 mil millones (declarado) |
| Longitud de contexto | 1.000.000 tokens (declarado) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, multilingual |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La model card describe una arquitectura "Ultra-Sparse Frontier MoE" con 64 expertos neuronales y un sistema de routing jerárquico. No se especifican detalles sobre la atención, el tamaño de las capas, ni la disposición exacta de los expertos. La innovación principal declarada es el soporte nativo de NNPL, un lenguaje de programación diseñado para ser escrito en inglés natural, que el modelo compilaría directamente a código ejecutable.

No se proporciona información sobre el proceso de entrenamiento: ni número de tokens, ni composición del dataset, ni si se usaron técnicas como RLHF, DPO o fine-tuning supervisado. Tampoco se mencionan innovaciones técnicas adicionales como decodificación especulativa, atención lineal o mecanismos de memoria externa. La latencia declarada de 110 ms de time-to-first-token no está respaldada por mediciones independientes.

## Capacidades

- Generacion de codigo en NNPL (lenguaje nativo en ingles) y en lenguajes estandar: Python, TypeScript, Rust, C++, Go y SQL.
- Razonamiento STEM profundo, orientado a problemas cientificos y matematicos.
- Agencia de software autonoma: capacidad declarada para orquestar tareas de desarrollo de sistemas distribuidos completos.
- Grounding con busqueda de Google en tiempo real (mencionado en la model card, sin detalles de implementacion).
- Soporte multilingue declarado (en, multilingual), aunque no se especifican idiomas concretos.
- Contexto largo de hasta 1.000.000 de tokens (declarado), util para analisis de repositorios completos o documentacion extensa.

## Casos de uso

- Generacion de codigo en NNPL: el modelo puede traducir especificaciones en ingles natural a codigo NNPL compilable, reduciendo errores de sintaxis en entornos de desarrollo que adopten este lenguaje.
- Asistente de programacion poliglota: con soporte para Python, TypeScript, Rust, C++ y Go, puede ayudar a developers a escribir, revisar y refactorizar codigo en multiples lenguajes dentro de un mismo proyecto.
- Razonamiento cientifico y matematico: su especializacion declarada en STEM permite usarlo como apoyo en resolucion de problemas de fisica, matematicas o ingenieria, generando explicaciones paso a paso.
- Analisis de codigo legacy: gracias a su contexto de 1M tokens (si se confirma), podria procesar repositorios enteros para identificar patrones, errores o deuda tecnica.
- Agentes de desarrollo autonomo: la capacidad declarada de "agencia de software" sugiere su uso en pipelines de CI/CD para generar, probar y corregir codigo de forma automatica, aunque requiere validacion practica.
- Busqueda con grounding: la integracion con Google Search permitiria respuestas actualizadas sobre APIs, documentacion o errores de compilacion, mejorando la precision en entornos de desarrollo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona que el modelo es evaluado por el Hugging Face Open LLM Leaderboard y LMSYS Chatbot Arena, pero no se proporcionan puntuaciones concretas. Los resultados de busqueda web no incluyen datos especificos de este modelo. Por tanto, no es posible presentar una tabla comparativa con numeros verificados.

## Requisitos de hardware

- Segun los pesos reales (~2.1B parametros), el modelo en FP16 ocupa aproximadamente 4.2 GB, por lo que cabe en GPUs consumer con 8 GB o mas de VRAM, como RTX 3060, RTX 4060, RTX 5070, etc.
- Con cuantizacion Q4 (aproximadamente 1.5-2 GB), podria ejecutarse en GPUs con 4-6 GB de VRAM, aunque la latencia dependera de la implementacion.
- Si se tomara la cifra declarada de 1.04T parametros, se necesitarian multiples GPUs de alta gama (A100, H100) o clusters, pero el tamano real del repo hace inviable esa interpretacion.
- Opciones de despliegue: transformers (con device_map="auto"), vLLM, llama.cpp, Ollama (si se convierte a GGUF), TGI.
- Latencia y throughput: no hay datos medidos. La model card declara 110 ms de TTFT, pero no se ha verificado.

## Comparativa con modelos similares

No se dispone de informacion suficiente para una comparativa rigurosa. El modelo declara ser un MoE de 1T, pero sus pesos reales corresponden a un modelo de ~2.1B. Si se considera el tamano real, podria compararse con modelos como Qwen2.5-1.5B, Gemma-2-2B o SmolLM2-1.7B, pero no hay datos de rendimiento de Aurora Maxima para establecer una comparacion objetiva. La unica diferencia clara es su soporte declarado de NNPL, que no existe en otros modelos. Por tanto, la comparativa se limita a indicar que no hay datos disponibles.

## Limitaciones y advertencias

- Discrepancia grave entre los parametros declarados (1.04T) y los pesos reales (~2.1B). Esto sugiere que la model card es inexacta o que el modelo publicado no corresponde a la descripcion.
- No hay benchmarks verificados ni evaluaciones independientes publicadas. Las menciones a leaderboards no van acompanadas de resultados concretos.
- El soporte de NNPL es una caracteristica propietaria y no hay documentacion publica sobre su sintaxis o compilador, lo que limita su adopcion.
- La licencia Apache 2.0 permite uso comercial, pero la falta de transparencia sobre el entrenamiento y los datos puede plantear riesgos de sesgos no evaluados.
- Riesgo de alucinacion en tareas de codigo y razonamiento, comun en modelos sin fine-tuning especifico verificado.
- El contexto de 1M tokens no ha sido validado en la practica; es posible que el modelo real tenga una ventana mucho menor.
- No se especifican limitaciones de idioma mas alla de "en, multilingual", por lo que el rendimiento en espanol u otros idiomas es incierto.

## Enlaces

- HuggingFace: https://huggingface.co/nebulaic-tech/aurora-maxima-1t-moe
- Sitio web de Nebulaic Tech: https://nebulaictech.com
- Nebulaic Studio: https://studio.nebulaictech.com
- Documentacion: https://nebulaictech.com (sin pagina especifica)
- Contacto: contact@nebulaictech.com
