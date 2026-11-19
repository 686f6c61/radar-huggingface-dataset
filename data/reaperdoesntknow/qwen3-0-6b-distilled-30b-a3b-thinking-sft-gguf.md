# reaperdoesntknow/Qwen3-0.6B-Distilled-30B-A3B-Thinking-SFT-GGUF

## Resumen

Qwen3-0.6B-Distilled-30B-A3B-Thinking-SFT-GGUF es la distribucion cuantizada en formato GGUF de un modelo de lenguaje de 0,6 mil millones de parametros desarrollado por Reaperdoesntrun (Convergent Intelligence LLC, division de investigacion). El modelo se construye en dos etapas sobre la base Qwen/Qwen3-0.6B: primero una destilacion de conocimiento desde el profesor Qwen3-30B-A3B-Thinking-2507 sobre 6.122 muestras de cadenas de razonamiento STEM, y despues un ajuste supervisado (SFT) sobre el dataset Alignment-Lab-AI/Lawyer-Instruct para anadir razonamiento juridico.

La propuesta central es la compresion extrema: un profesor de 30B (con 3B activos por ser MoE) se destila en un estudiante denso de 0,6B, lo que supone una reduccion de aproximadamente 50x en parametros y de unas 75x con la cuantizacion Q4_K_M. El resultado es un modelo que cabe en dispositivos de borde, moviles e incluso hardware tipo smartwatch, y que puede ejecutarse con llama.cpp, Ollama o LM Studio.

Es relevante ahora porque demuestra que las tecnicas de destilacion de trazas de razonamiento (chain-of-thought) pueden transferir estructura de deliberacion a modelos muy pequenos, aunque con las limitaciones propias de la capacidad del estudiante. El repositorio acumula 2.819 descargas y esta publicado bajo licencia Apache 2.0, lo que facilita su uso comercial y su integracion en productos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen3-0.6B) |
| Parametros totales | 751.632.384 (aproximadamente 0,75B, segun safetensors) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (los ejemplos de uso emplean n_ctx=1024) |
| Tipos de cuantizacion | F16, Q8_0, Q5_K_M, Q4_K_M |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3-0.6B, un transformer denso de la familia Qwen3. El entrenamiento se estructura en dos etapas documentadas por el autor. La primera es una destilacion de conocimiento desde el profesor Qwen3-30B-A3B-Thinking-2507 (un modelo MoE de 30B totales y 3B activos) sobre 6.122 muestras de cadenas de razonamiento STEM. La variante "Thinking" del profesor genera trazas de razonamiento extendidas con distribuciones de mayor entropia, lo que segun el autor transfiere una estructura de deliberacion mas rica al estudiante. La funcion de perdida combina entropia cruzada ponderada por prueba (2,5x a 1,5x sobre los tokens de derivacion) con divergencia KL a temperatura 2,0.

La segunda etapa es un ajuste supervisado sobre Alignment-Lab-AI/Lawyer-Instruct con una tasa de aprendizaje conservadora de 5e-6, con el objetivo de anadir razonamiento juridico sobre la base STEM sin sobrescribirla. El autor menciona marcos matematicos propios (Discrepancy Calculus, Topological Knowledge Distillation) documentados en la model card del modelo fuente, con un operador de discrepancia Df(x) y una descomposicion BV que, segun afirma, se conservan tras la cuantizacion porque las fronteras estructurales quedan fijadas en los pesos. No se detalla el numero total de tokens de entrenamiento ni la composicion completa del dataset mas alla de las dos fuentes citadas.

## Capacidades

- Generacion de texto conversacional en ingles mediante plantillas de instruccion.
- Razonamiento matematico y derivaciones STEM con cadenas de pensamiento (chain-of-thought).
- Razonamiento juridico de conceptos generales (por ejemplo, promissory estoppel, diferencia entre felony y misdemeanor).
- Generacion de pruebas y derivaciones matematicas de hasta aproximadamente 8 pasos.
- Soporte de dos formatos de prompt diferenciados: derivacion STEM y seguimiento de instrucciones.
- Ejecucion local en dispositivos de borde, moviles e IoT mediante llama.cpp, Ollama y LM Studio.
- Capacidad multilingue: limitada al ingles segun los metadatos del modelo.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, vision, audio ni modo thinking explicito mas alla de las trazas destiladas.

## Casos de uso

- Tutoria STEM en dispositivos sin conectividad: el modelo puede resolver problemas de matematicas y fisica con derivaciones paso a paso en un movil o una tableta, usando la cuantizacion Q5_K_M (aproximadamente 500 MB) y el formato de prompt de derivacion STEM.
- Asistente juridico de primera linea en aplicaciones moviles: con la etapa SFT sobre Lawyer-Instruct, puede explicar conceptos legales generales (por ejemplo, diferencias entre tipos de delito) en un contexto conversacional, adecuado para orientacion preliminar no vinculante.
- Educacion embebida en hardware de bajo consumo: con Q4_K_M (aproximadamente 400 MB) cabe en dispositivos IoT o wearables, permitiendo funciones de generacion de texto sin dependencia de la nube.
- Prototipado rapido de aplicaciones de razonamiento: al ejecutarse con llama-cpp-python y n_ctx reducido, sirve para validar pipelines de generacion con chain-of-thought antes de migrar a modelos mayores.
- Generacion de contenido educativo en ingles: produccion de explicaciones y ejercicios resueltos de matematicas y fisica para plataformas de aprendizaje, con verificacion humana posterior dada la limitacion de capacidad.
- Filtrado y clasificacion de consultas legales o tecnicas en el borde: el modelo puede redactar respuestas breves o resumenes en local antes de escalar a un modelo mayor, reduciendo costes de inferencia en la nube.
- Demostraciones de destilacion y docencia: util como caso de estudio reproducible de destilacion de trazas de razonamiento desde un profesor MoE de 30B a un estudiante denso de 0,6B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas de MMLU, HumanEval, GSM8K ni metricas comparativas con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,3 GB en F16, 700 MB en Q8_0, 500 MB en Q5_K_M y 400 MB en Q4_K_M (tamanos de fichero indicados por el autor; el consumo real de memoria anade overhead del runtime).
- GPU recomendadas: no se especifican en la informacion proporcionada; por tamano, cualquier GPU consumer con 2 GB o mas de VRAM es suficiente, e incluso es viable en CPU.
- Cabe en GPU consumer: si, en practicamente cualquier GPU consumer moderna, y tambien en CPU y en hardware de borde (movil, IoT, smartwatch segun el autor con Q4_K_M).
- Opciones de despliegue: llama.cpp (CLI y binding de Python), Ollama, LM Studio y runtimes compatibles con GGUF.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3-0.6B-Distilled-30B-A3B-Thinking-SFT-GGUF (este) | 0,75B | No disponible | Apache 2.0 | GGUF | Destilado de Qwen3-30B-A3B-Thinking, SFT juridico |
| Qwen/Qwen3-0.6B | 0,6B | No disponible | Apache 2.0 | Safetensors y GGUF | Modelo base original sin destilacion |
| reaperdoesntknow/Qwen3-0.6B-STEM-Proof-Distilled-Thinking | 0,6B | No disponible | No disponible | No disponible | Solo etapa 1, base STEM pura |
| reaperdoesntknow/Qwen3-1.7B-Distilled-30B-A3B-SFT-GGUF | 1,7B | No disponible | No disponible | GGUF | Variante mayor de la misma serie |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- La capacidad de 0,6B es una restriccion dura: el autor reconoce que el modelo comete errores que modelos mayores evitan y que sacrifica profundidad por desplegabilidad.
- Las pruebas multi-paso de mas de aproximadamente 8 pasos se degradan segun la model card.
- El razonamiento juridico cubre conceptos generales pero carece de matices; no sustituye asesoramiento legal profesional.
- Riesgo de alucinacion inherente a modelos pequenos; el autor recomienda verificar siempre las salidas criticas.
- No sustituye la verificacion formal de pruebas ni el analisis profesional.
- Idioma limitado al ingles segun los metadatos; no se documenta soporte de otros idiomas.
- Longitud de contexto no especificada; los ejemplos de uso emplean n_ctx=1024, lo que sugiere ventanas cortas en la practica.
- Licencia Apache 2.0 permite uso comercial, pero las afirmaciones sobre marcos matematicos propios (Discrepancy Calculus, Topological Knowledge Distillation) no estan verificadas de forma independiente en la informacion disponible.
- No se documentan capacidades de tool calling ni de agentes, por lo que no es adecuado para pipelines que dependan de ellas.

## Enlaces

- Repositorio Hugging Face (GGUF): https://huggingface.co/reaperdoesntknow/Qwen3-0.6B-Distilled-30B-A3B-Thinking-SFT-GGUF
- Modelo fuente en precision completa: https://huggingface.co/reaperdoesntknow/Qwen3-0.6B-Distilled-30B-A3B-Thinking-SFT
- Variante solo STEM (etapa 1): https://huggingface.co/reaperdoesntknow/Qwen3-0.6B-STEM-Proof-Distilled-Thinking
- Variante de 1,7B en GGUF: https://huggingface.co/reaperdoesntknow/Qwen3-1.7B-Distilled-30B-A3B-SFT-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B
- Modelo profesor: https://huggingface.co/Qwen/Qwen3-30B-A3B-Thinking-2507
- Dataset de ajuste juridico: https://huggingface.co/datasets/Alignment-Lab-AI/Lawyer-Instruct
- llama.cpp: https://github.com/ggerganov/llama.cpp
- LM Studio: https://lmstudio.ai/
- Perfil del autor: https://huggingface.co/reaperdoesntknow
- Sitio de Convergent Intelligence LLC: https://convergentintel.com
