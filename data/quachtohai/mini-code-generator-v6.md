# quachtohai/mini-code-generator-v6

## Resumen

Mini Code Generator V6 es un checkpoint experimental de generación de código Python entrenado desde cero por el usuario de HuggingFace quachtohai. Se trata de un transformer causal de tipo denso con 10.845.312 parámetros, 6 capas, tamaño oculto de 384, 6 cabezas de atención y FFN de 1536, con embeddings de entrada y salida atados. El modelo no parte de ningún modelo ni tokenizador preentrenado: el tokenizador es un vocabulario de 259 tokens de byte UTF-8 construido específicamente para este experimento, y la longitud de contexto es de solo 256 tokens.

El modelo se entrenó sobre un dataset propio de 652 registros de implementaciones validadas por ejecución, repartidos en 30 familias de algoritmos con un split disjunto por familia (520 de entrenamiento, 66 de validación, 66 de test). El objetivo del experimento es estudiar si una mejora sustancial en la pérdida de validación a nivel de token se traduce en generación funcional de código autorregresivo. La respuesta documentada por el autor es negativa: el mejor checkpoint (época 14, pérdida de validación 0,643533) no produce ni un solo programa completamente correcto en la evaluación funcional.

Su relevancia actual es, por tanto, metodológica y de reproducibilidad, no práctica. El propio autor lo describe como un checkpoint congelado y lo preserva para comparación con experimentos posteriores. Cualquier uso en producción está fuera de su alcance: es un artefacto de investigación sobre tokenización a nivel de byte, objetivos de modelado de lenguaje causal sobre programas completos y validación funcional de código.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal denso (decoder-only) |
| Parametros totales | 10.845.312 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 256 tokens |
| Tipos de cuantizacion | no disponible (no se documentan cuantizaciones publicadas) |
| Idiomas soportados | no disponible (vocabulario de 259 tokens de byte UTF-8; el dataset es de implementaciones de algoritmos, sin declaración de idioma) |
| Licencia | no disponible |
| Formato de pesos | no disponible (el repositorio ocupa 0,3 GB y no se especifica el formato) |
| Capas | 6 |
| Tamano oculto | 384 |
| Cabezas de atencion | 6 |
| Tamano de FFN | 1536 |
| Vocabulario | 259 tokens de byte UTF-8 |
| Embeddings | entrada/salida atados (tied) |
| Preentrenamiento | ninguno (from scratch, sin modelo ni tokenizador preentrenados) |

## Arquitectura y entrenamiento

La arquitectura es un transformer causal decoder-only estándar, sin mecanismos de atención lineal, SSM ni componentes híbridos documentados. Con 6 capas, dimensión de modelo 384 y FFN de 1536, el ratio de expansión es de 4x, típico en transformers pequeños. El vocabulario de 259 tokens de byte UTF-8 es una decisión de diseño relevante: al operar sobre bytes en lugar de subpalabras BPE, el modelo evita depender de un tokenizador preentrenado, pero paga un coste en longitud de secuencia efectiva, algo crítico con un contexto de solo 256 tokens cuando el objetivo es generar programas completos.

El entrenamiento se realizó desde cero durante 40 épocas sobre 520 registros de entrenamiento. El mejor checkpoint se obtuvo en la época 14 con una pérdida de validación de 0,643533; al final del entrenamiento la pérdida de entrenamiento bajó hasta aproximadamente 0,0964 mientras la de validación subió a aproximadamente 0,7799, lo que indica sobreajuste claro. No se documenta ningún uso de RLHF, DPO, SFT posterior ni decodificación especulativa. La innovación técnica del experimento no está en la arquitectura, sino en la metodología de evaluación: split disjunto por familia de algoritmos para evitar fuga de información entre train y test, y validación funcional mediante tests ocultos ejecutados sobre las generaciones.

## Capacidades

- Generación de código Python: el modelo emite texto a nivel de byte orientado a implementaciones de algoritmos, con 6 capas y 10,8M de parámetros.
- Generación de programas completos: el objetivo de entrenamiento de V6 es modelado de lenguaje causal sobre programas enteros, no completado de código (a diferencia de V5).
- Tokenización a nivel de byte: maneja directamente bytes UTF-8 sin tokenizador externo, lo que en teoría permite representar cualquier entrada de texto.
- Razonamiento: no documentado ni evaluado de forma específica.
- Matemáticas: no evaluado de forma específica más allá de la evaluación funcional sobre familias de algoritmos.
- Tool calling / function calling: no soportado ni documentado.
- Uso como agente o razonamiento multi-paso: no soportado ni documentado.
- Capacidades multilingües: no documentadas.
- Modo de pensamiento (thinking), visión o audio: no disponible.
- Capacidad real de generación funcional: muy limitada. En generación greedy, 18 de 66 candidatos fueron válidos sintácticamente, se ejecutaron 40 tests ocultos y solo 4 pasaron (10,00% de precisión de ejecución), con 0 de 18 programas completamente correctos.

## Casos de uso

- Estudio de reproducibilidad en investigación: el modelo está congelado y pensado explícitamente para comparar experimentos posteriores del mismo autor. Se usaría como punto de referencia fijo al evaluar nuevas variantes de dataset u objetivo de entrenamiento.
- Ablación de objetivos de entrenamiento: sirve para contrastar el objetivo de modelado causal de programa completo (V6) frente al objetivo de completado de código (V5), aunque el propio autor advierte que la comparación no es estricta porque cambian dos factores a la vez.
- Investigación sobre tokenización a nivel de byte: con 259 tokens de byte UTF-8 y contexto de 256, es un banco de pruebas para medir cómo la granularidad de byte afecta a la generación de secuencias largas y estructuradas.
- Docencia sobre sobreajuste y métricas: la divergencia entre pérdida de entrenamiento (0,0964) y de validación (0,7799) en la época final, junto al 0% de programas completamente correctos, es un caso didáctico de por qué la pérdida de token no predice corrección funcional.
- Evaluación de pipelines de validación funcional: el protocolo del autor (generación greedy y best-of-5, ejecución de tests ocultos, conteo de candidatos sintácticamente válidos) es reutilizable como plantilla metodológica para evaluar generadores de código pequeños.
- Prototipado didáctico de bajo coste: con 10,8M de parámetros y contexto de 256, puede ejecutarse en CPU para demostraciones de inferencia de un transformer entrenado desde cero, siempre dejando claro que no genera código fiable.
- No es adecuado, con los datos disponibles, para asistencia de programación real, generación de código en producción, atención al cliente, RAG ni integración en CI/CD.

## Benchmarks y rendimiento

Datos de la evaluación funcional publicados por el autor:

| Metrica | Generacion greedy | Best-of-5 sampling |
|---|---|---|
| Candidatos generados | 66 | 330 |
| Candidatos validos | 18/66 | 46/330 sintacticamente validos |
| Prompts con candidato ejecutable | no disponible | 33/66 |
| Tests ocultos ejecutados | 40 | 230 |
| Tests ocultos superados | 4 | 12 |
| Precision de ejecucion | 10,00% | 5,22% |
| Prompts completamente correctos | 0/18 | 0/66 |

| Metrica de entrenamiento | Valor |
|---|---|
| Epocas | 40 |
| Mejor checkpoint | epoca 14 |
| Mejor perdida de validacion | 0,643533 |
| Perdida de entrenamiento (epoca final) | aproximadamente 0,0964 |
| Perdida de validacion (epoca final) | aproximadamente 0,7799 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 43 MB solo para pesos (10.845.312 parametros x 4 bytes), mas activaciones y cache KV.
- VRAM estimada en fp16/bf16: aproximadamente 22 MB para pesos; en int8, aproximadamente 11 MB. Son cotas inferiores calculadas a partir del numero de parametros, no cifras publicadas por el autor.
- Cache KV: despreciable en la practica gracias a un contexto maximo de 256 tokens, 6 capas y 6 cabezas de atencion.
- GPU recomendadas: no disponible. El modelo cabe holgadamente en cualquier GPU consumer (GTX 1060, RTX 3060, RTX 4090) e incluso en CPU.
- Cabe en GPU consumer: si, en cualquier GPU con unos pocos cientos de MB libres; tambien cabe en memoria de sistema para inferencia en CPU.
- Opciones de despliegue: no disponible. La informacion proporcionada no especifica compatibilidad con vLLM, llama.cpp, Ollama o TGI; el vocabulario de byte personalizado de 259 tokens exigiria una implementacion ad hoc del tokenizador.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No se dispone de datos de rendimiento, licencia ni contexto de modelos comparables en la informacion proporcionada. Como referencias del mismo autor que aparecen en los resultados de busqueda:

| Modelo | Parametros | Contexto | Objetivo | Licencia | Estado |
|---|---|---|---|---|---|
| quachtohai/mini-code-generator-v6 | 10,8M | 256 | Modelado causal de programa completo | no disponible | Checkpoint congelado |
| quachtohai/pure-python-scratch-34m | 34,1M | no disponible | Text generation | no disponible | Publicado (actualizado hace 25 dias) |
| quachtohai/web-coding-42m | no disponible | no disponible | Codigo | no disponible | Publicado |
| quachtohai/olmo-mini | no disponible | no disponible | no disponible | no disponible | Publicado |
| V5 (mencionado en la model card) | no disponible | no disponible | Completado de codigo | no disponible | Referencia interna del autor |

La model card advierte que la comparacion V5 frente a V6 no es una ablacion estricta de dataset, ya que V5 uso un objetivo de completado de codigo y V6 un objetivo de modelado de lenguaje causal de programa completo, por lo que las diferencias no pueden atribuirse solo a la diversidad del dataset.

## Limitaciones y advertencias

- Rendimiento funcional nulo en el sentido estricto: 0 de 18 candidatos greedy y 0 de 66 prompts en best-of-5 produjeron un programa completamente correcto.
- Precision de ejecucion muy baja: 10,00% en greedy y 5,22% en best-of-5 sobre los tests ocultos ejecutados.
- Sobreajuste evidente: la perdida de validacion final (aproximadamente 0,7799) es mas de ocho veces la de entrenamiento (aproximadamente 0,0964).
- Contexto muy corto: 256 tokens, insuficiente para la mayoria de programas Python completos, especialmente con tokenizacion a nivel de byte.
- Tokenizador de byte propio de 259 tokens: no es compatible con tokenizadores estandar, lo que complica la integracion en frameworks habituales.
- Dataset muy reducido: 652 registros y 30 familias de algoritmos, con solo 66 ejemplos de test, lo que limita la significacion estadistica de los resultados.
- Idiomas soportados: no disponible. El dataset son implementaciones de algoritmos, sin declaracion de cobertura linguistica.
- Licencia: no disponible. No hay autorizacion explicita documentada para uso comercial; debe contactarse con el autor antes de cualquier uso que no sea de investigacion.
- Riesgo de alucinacion: alto en terminos practicos; el modelo puede producir codigo sintacticamente plausible que no supera los tests.
- No soporta tool calling, agentes ni razonamiento multi-paso.
- Es un checkpoint congelado sin mantenimiento previsto; el autor lo preserva unicamente con fines de reproducibilidad.
- Advertencia de comparacion: no debe usarse la diferencia V5/V6 como evidencia de que mas diversidad de dataset mejora el rendimiento, porque el objetivo de entrenamiento tambien cambio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/quachtohai/mini-code-generator-v6
- Perfil del autor en HuggingFace: https://huggingface.co/quachtohai
- Listado de modelos del autor: https://huggingface.co/quachtohai/models
