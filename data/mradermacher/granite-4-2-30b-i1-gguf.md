# mradermacher/granite-4.2-30b-i1-GGUF

## Resumen

Granite 4.2 30B es un modelo de lenguaje denso de razonamiento desarrollado por IBM, publicado el 25 de agosto de 2026 como parte de la familia Granite 4.2, que incluye variantes de 3B, 8B y 30B de parametros. Este repositorio contiene las cuantizaciones GGUF con imatrix (importance matrix) del modelo base ibm-granite/granite-4.2-30b, preparadas por mradermacher para su ejecucion en entornos de inferencia locales y de consumo.

Con 29.276 millones de parametros y una ventana de contexto de 128.000 tokens, Granite 4.2 30B introduce capacidades de razonamiento nativas con un modo de pensamiento conmutable (thinking mode), que permite al modelo ejecutar cadenas de razonamiento paso a paso antes de emitir la respuesta final. Su licencia Apache-2.0 permite uso comercial sin restricciones, y su puntuacion de 57,0 en SWE-bench Verified lo posiciona como una alternativa solida en el segmento de modelos de razonamiento de tamano medio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso decoder-only |
| Parametros totales | 29.276.770.304 (29,3B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 128.000 tokens |
| Tipos de cuantizacion | i1-Q2_K, i1-IQ3_XXS, i1-IQ3_M, i1-Q3_K_M, i1-Q4_K_S, i1-Q4_K_M (imatrix) |
| Idiomas soportados | en, de, es, fr, ja, pt, ar, cs, it, ko, nl, zh (12 idiomas) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (imatrix) |

## Arquitectura y entrenamiento

Granite 4.2 30B es un modelo de arquitectura transformer densa decoder-only, post-entrenado a partir de los modelos base Granite 4.1. El post-entrenamiento incorpora capacidades de razonamiento nativo con un modo de pensamiento conmutable (thinking mode), que permite al modelo ejecutar cadenas de razonamiento (chain-of-thought) antes de producir la respuesta final. Esta caracteristica es especialmente relevante para tareas de codigo, matematicas y logica.

El modelo soporta tool calling y function calling de forma nativa, lo que lo hace adecuado para integrarse en pipelines de agentes autonomos. No se dispone de informacion detallada sobre el numero de tokens de pre-entrenamiento ni la composicion exacta del dataset en la informacion proporcionada. Las cuantizaciones de este repositorio se han generado con imatrix (importance matrix), una tecnica que pondera la importancia de cada peso durante la cuantizacion para minimizar la perdida de calidad, y requieren versiones recientes de llama.cpp para su correcto funcionamiento.

## Capacidades

- Razonamiento nativo con thinking mode conmutable: el modelo puede realizar razonamiento paso a paso antes de responder, mejorando la precision en tareas complejas de logica, matematica y codigo.
- Generacion de codigo: alcanza 57,0 en SWE-bench Verified, lo que indica capacidad para resolver problemas reales de ingenieria de software.
- Tool calling y function calling: soporte integrado para invocar herramientas externas, adecuado para arquitecturas de agentes y automatizacion.
- Capacidades multilingues: cubre 12 idiomas (ingles, aleman, espanol, frances, japones, portugues, arabe, checo, italiano, coreano, neerlandes y chino), con calidad variable segun el idioma.
- Conversacion multi-turno: disenado para interacciones conversacionales sostenidas gracias a su ventana de 128K tokens.
- Compatibilidad con transformers y endpoints: el repositorio declara compatibilidad con la libreria transformers y con despliegue en endpoints de inferencia.

## Casos de uso

- Asistente de desarrollo de software: con 57,0 en SWE-bench Verified, el modelo puede resolver issues de repositorios, generar parches y revisar pull requests. Se integraria en un pipeline de CI/CD como agente de revision de codigo autonomo.
- Generacion de codigo en produccion: su soporte de tool calling permite conectarlo a entornos de desarrollo integrados (IDE) para autocompletar funciones, generar tests y refactorizar codigo existente.
- Atencion al cliente multilingue: con 12 idiomas y 128K de contexto, puede gestionar conversaciones multi-turno largas en varios idiomas sin perder el hilo de la conversacion, adecuado para centros de soporte internacionales.
- Automatizacion de tareas con agentes: su capacidad de tool calling permite construir agentes que interactuen con APIs, bases de datos y servicios externos para ejecutar tareas multi-paso de forma autonoma (reservas, consultas, generacion de informes).
- Analisis de documentacion extensa: su ventana de 128K tokens permite procesar documentos completos, contratos o informes tecnicos para extraer resumenes, detectar inconsistencias o responder preguntas especificas sobre el contenido.
- Despliegue de sistemas de razonamiento en local: al estar disponible en GGUF cuantizado, puede ejecutarse en hardware de consumo (GPU de 16-24 GB) para aplicaciones que requieren razonamiento complejo sin depender de la nube, como herramientas de diagnostico medico asistido o analisis financiero.

## Benchmarks y rendimiento

Se dispone del siguiente dato de benchmark en la informacion proporcionada:

| Benchmark | Resultado |
|---|---|
| SWE-bench Verified | 57,0 |

No se han publicado resultados de MMLU, HumanEval, GSM8K u otros benchmarks en la informacion disponible. No se dispone de datos comparativos con modelos similares en los mismos benchmarks.

## Requisitos de hardware

- Q4_K_M (17,8 GB): requiere aproximadamente 20-24 GB de VRAM con contexto moderado. Compatible con RTX 4090, RTX 3090, A100, L40.
- Q4_K_S (16,8 GB): requiere aproximadamente 19-22 GB de VRAM. Cabe en RTX 4090 y RTX 3090.
- Q3_K_M (14,2 GB): cabe en 16 GB de VRAM (RTX 4080, RTX 3080 Ti) con contexto reducido.
- Q2_K (11,0 GB): cabe en 12-16 GB de VRAM, pero con degradacion notable de calidad en tareas de razonamiento.
- Despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python y cualquier runtime compatible con GGUF.
- El archivo imatrix (0,1 GB) permite generar cuantizaciones personalizadas con llama.cpp para ajustar el equilibrio entre tamano y calidad.
- La inferencia en CPU es posible con los quants mas pequenos, pero con latencia significativamente mayor; se recomienda GPU para tareas interactivas.

## Comparativa con modelos similares

No se dispone de datos de benchmarks comparativos con modelos de otros proveedores en la informacion proporcionada. Dentro de la misma familia, Granite 4.2 ofrece variantes de 3B y 8B de parametros con la misma licencia y ventana de contexto, pero no se han publicado resultados de benchmarks para estas variantes en los datos fuente. La version original en safetensors esta disponible en ibm-granite/granite-4.2-30b, y las cuantizaciones estaticas (no imatrix) en mradermacher/granite-4.2-30b-GGUF.

## Limitaciones y advertencias

- La cuantizacion degrada la calidad del modelo, especialmente en los quants mas agresivos (Q2_K, IQ3_XXS). Para tareas de razonamiento complejo se recomienda Q4_K_M o superior.
- Riesgo de alucinacion: como cualquier modelo de lenguaje, puede generar contenido falso o inventado, especialmente en modo de razonamiento donde el modelo puede elaborar justificaciones erroneas.
- Limitaciones de idioma: aunque soporta 12 idiomas, la calidad no es uniforme; el ingles es el idioma mejor soportado y los idiomas con menos datos pueden mostrar degradacion.
- Contexto de 128K: el uso de la ventana completa incrementa significativamente el consumo de VRAM y la latencia, lo que puede requerir reducir el contexto en hardware con GPU limitada.
- Los quants i1 (imatrix) requieren versiones recientes de llama.cpp; versiones anteriores pueden no reconocer el formato o producir resultados incorrectos.
- La licencia Apache-2.0 permite uso comercial, pero exige incluir el aviso de licencia correspondiente y la atribucion de IBM.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mradermacher/granite-4.2-30b-i1-GGUF
- Modelo base: https://huggingface.co/ibm-granite/granite-4.2-30b
- Cuantizaciones estaticas: https://huggingface.co/mradermacher/granite-4.2-30b-GGUF
- Documentacion de IBM Granite 4.2: https://www.ibm.com/granite/docs/models/granite4-2
- Repositorio GitHub de Granite 4.2: https://github.com/ibm-granite/granite-4.2-language-models
- Analisis de AI/TLDR: https://ai-tldr.dev/models/granite-4-2-30b/
