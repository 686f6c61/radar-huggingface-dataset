# qualcomm-ai-hub-community/Qwen3.8-27B-Hi-Fi-fraQtl

## Resumen

Qwen3.8-27B Hi-Fi (fraQtl) es una conversión a GGUF del modelo denso Qwen/Qwen3.8-27B de Alibaba, publicada por la comunidad qualcomm-ai-hub-community y construida por fraQtl. Se trata de una cuantización calibration-aware en formato Q4_K_M de aproximadamente 4,8 bits por peso, optimizada para ejecución en dispositivos de gama alta como los Snapdragon X-Elite o equipos AI-PC. El modelo resultante pesa 16,5 GB y mantiene una fidelidad superior a la cuantización canónica de la comunidad en tareas de código y matemáticas, con una pérdida de perplexity mínima.

La conversión es exclusivamente de texto: la torre de visión del modelo original no se incluye. El contexto nativo del modelo base es de 262 144 tokens, y las pruebas de recuperación en contexto largo verifican un rendimiento perfecto hasta 131 072 tokens. La licencia Apache 2.0 permite uso comercial sin restricciones adicionales. Este artefacto está pensado para desarrolladores que necesitan un modelo de 27B cuantizado, reproducible y con métricas de calidad documentadas, en lugar de una cuantización genérica sin garantías.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (arquitectura Qwen3.8-27B, solo texto) |
| Parametros totales | 27 320 697 856 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262 144 tokens (nativo); verificado hasta 131 072 |
| Tipos de cuantizacion | Q4_K_M calibration-aware (fraQtl), ~4,8 bpw |
| Idiomas soportados | No disponible en la model card; el modelo base Qwen3.8-27B es multilingue |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un transformer denso de 27 000 millones de parametros, disenado por el equipo Qwen de Alibaba para tareas de codificacion, agentes y automatizacion de oficina, con una ventana de contexto nativa de 262 144 tokens. Esta conversion concreta elimina la torre de vision y conserva unicamente el modulo de lenguaje. La cuantizacion aplicada por fraQtl es calibration-aware por tensor, lo que reduce la divergencia KLD respecto a los pesos originales en un 45,3 % en codigo y matematicas, y en un 18,0 % en tareas generales, en comparacion con la cuantizacion canonica de la comunidad (unsloth UD-Q4_K_M) al mismo tamano.

No se dispone de informacion detallada sobre el dataset de entrenamiento del modelo base (numero de tokens, composicion, uso de RLHF o DPO) en la documentacion proporcionada. La model card de la conversion indica que todas las metricas son reproducibles mediante un paquete de recepcion que incluye evaluaciones, volcados del profesor, rejilla de agujas y un runner de llama.cpp de un solo archivo.

## Capacidades

- Generacion de texto y razonamiento: el modelo base es capaz de tareas de lenguaje general, codificacion y matematicas, con razonamiento configurable (modo pensamiento opcional).
- Codigo y matematicas: los benchmarks internos muestran GSM8K 95,0 % y MATH-500 87,6 % en esta cuantizacion, dentro del intervalo de confianza del 95 % respecto a la version canonica.
- Contexto largo: recuperacion perfecta en pruebas de aguja hasta 131 072 tokens, con contexto nativo de 262 144.
- Agentes y automatizacion: el modelo base soporta flujos agénticos de largo horizonte y automatizacion de oficina, segun la documentacion oficial de Qwen.
- Multilingue: el modelo base es multilingue, aunque la model card de esta conversion no especifica los idiomas cubiertos.
- Limitacion de modalidad: esta conversion es solo texto; no incluye capacidades de vision del modelo original.

## Casos de uso

- Asistente de programacion en entornos locales: el modelo puede completar, explicar y depurar codigo en multiples lenguajes, ejecutandose en un portatil con Snapdragon X-Elite o GPU de 16 GB o mas, sin depender de la nube.
- Automatizacion de oficina: generacion de documentos, resumenes de correos, plantillas y analisis de datos tabulares, aprovechando el contexto largo para procesar informes extensos de una sola vez.
- Agente de razonamiento multi-paso: integrado en frameworks de agentes, puede planificar y ejecutar tareas complejas con llamadas a herramientas, gracias a su capacidad de razonamiento configurable y su ventana de 262K tokens.
- Analisis de documentos legales o tecnicos: procesamiento de contratos, especificaciones o manuales de miles de paginas, manteniendo coherencia gracias a la recuperacion verificada en contexto largo.
- Educacion y tutoria: resolucion de problemas matematicos paso a paso, con explicaciones detalladas, util para plataformas de aprendizaje automatico.
- Investigacion academica: asistencia en revision de literatura, generacion de borradores y resumen de articulos cientificos, con capacidad de manejar multiples referencias en una sola consulta.

## Benchmarks y rendimiento

La model card proporciona los siguientes resultados comparativos entre esta cuantizacion (fraQtl Q4_K_M) y la cuantizacion canonica de la comunidad (unsloth UD-Q4_K_M), ambos al mismo tamano:

| Metrica | fraQtl Q4_K_M | Canonico (unsloth) | Diferencia |
|---|---|---|---|
| GSM8K | 95,0 % | 94,0 % | +1,0 pp (dentro del IC 95 %) |
| MATH-500 | 87,6 % | 88,2 % | -0,6 pp (dentro del IC 95 %) |
| KLD en codigo/matematicas | 0,123 | 0,225 | -45,3 % |
| KLD en general | 0,231 | 0,282 | -18,0 % |
| Perplexity Wikitext-2 | +0,7 % peor | referencia | - |
| Acuerdo top-1 en general | -0,2 pp | referencia | - |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, etc.) en la informacion disponible.

## Requisitos de hardware

- Tamano del archivo: 16,5 GB (~4,8 bpw), por lo que se recomienda al menos 16 GB de VRAM o RAM unificada para inferencia comoda.
- GPU recomendadas: RTX 4090 (24 GB), RTX 4080 (16 GB), A100 40 GB, o equivalentes. En equipos Apple Silicon, un SoC M1 Pro/Max o superior con 32 GB unificados puede ejecutarlo.
- Dispositivos Snapdragon X-Elite: la model card indica que esta orientado a esta clase de hardware (AI-PC), no a telefonos.
- Opciones de despliegue: compatible con llama.cpp (incluido un runner de un solo archivo en el paquete de recepcion), y por extension con vLLM, Ollama y otros runners que soporten GGUF.
- Latencia y throughput: no se proporcionan cifras concretas en la documentacion; dependen del hardware y del backend utilizado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B (base) | 27B | 262 144 | FP16/BF16 | Apache 2.0 | Modelo original con vision y lenguaje |
| fraQtl Q4_K_M (este) | 27B | 262 144 | Q4_K_M calibration-aware | Apache 2.0 | Solo texto, fidelidad mejorada en codigo/mates |
| unsloth UD-Q4_K_M | 27B | 262 144 | Q4_K_M | Apache 2.0 | Canonico de la comunidad, sin calibration-aware |
| ggml-org Q4_K_M | 27B | 262 144 | Q4_K_M | Apache 2.0 | Cuantizacion estandar de referencia |

La comparativa se limita a las variantes cuantizadas del mismo modelo base, ya que no se dispone de datos de otros modelos de tamano similar en la informacion proporcionada.

## Limitaciones y advertencias

- Solo texto: la torre de vision del modelo original no se incluye; no puede procesar imagenes ni video.
- Perdidas por cuantizacion: la perplexity en Wikitext-2 es un 0,7 % peor que la cuantizacion canonica, y el acuerdo top-1 en tareas generales cae 0,2 puntos porcentuales.
- Riesgo de alucinacion: como cualquier LLM, puede generar contenido falso o inconsistente, especialmente en tareas de razonamiento complejo o con contexto muy largo.
- Sesgos: no se documentan sesgos especificos en la model card; el modelo base puede heredar sesgos de sus datos de entrenamiento, no detallados aqui.
- Contexto extremo: aunque la recuperacion es perfecta hasta 131K tokens, el rendimiento en el rango completo de 262K no esta verificado en esta documentacion.
- Licencia: Apache 2.0 permite uso comercial, pero se recomienda revisar los terminos del modelo base original por si hubiera restricciones adicionales.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/qualcomm-ai-hub-community/Qwen3.8-27B-Hi-Fi-fraQtl
- Repositorio canonico de fraQtl: https://huggingface.co/fraQtl/Qwen3.8-27B-Hi-Fi-GGUF
- Repositorio oficial del modelo base: https://github.com/AlibabaCloud-Official/Qwen3.8-27B
- Qualcomm AI Hub: https://aihub.qualcomm.com/
- Pagina del modelo en LM Studio: https://lmstudio.ai/models/qwen3.8
