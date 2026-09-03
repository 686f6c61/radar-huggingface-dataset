# Snapkitty/sovlm

## Resumen

Sovlm (Sovereign Statistical Language Model) es un modelo de lenguaje estadístico desarrollado por Ahmad Ali Parr dentro del SnapKitty Collective, un ecosistema de herramientas de IA "soberana" que prioriza el control total del usuario sobre el vocabulario y los datos. A diferencia de los modelos neuronales convencionales, sovlm no se entrena mediante retropropagación ni requiere GPU: construye un índice estadístico sobre un corpus local usando n-gramas, suavizado Kneser-Ney, recuperación BM25 y muestreo con generador de números aleatorios cuántico (QRNG).

El modelo resuelve el problema de generar texto coherente a partir de un corpus propio sin depender de pesos preentrenados ni de infraestructura de entrenamiento. Su relevancia actual radica en su enfoque de "soberanía" sobre los tokens y la arquitectura, en un momento donde la transparencia y el control de datos son demandas crecientes. Está diseñado para integrarse con otros componentes del stack SnapKitty, como abjad-machine (espacio de direcciones SUBLEQ) o the-49th-call (verificación Lean 4), lo que sugiere un uso orientado a sistemas verificables y entornos con restricciones de recursos.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | N-gramas (orden configurable) + Kneser-Ney + SkipGram + BM25 + FuzzyPrefix (LSH) + Blender + QRNG |
| Parametros totales | No disponible (no es un modelo de redes neuronales; almacena índices estadísticos) |
| Parametros activos | No aplica |
| Longitud de contexto | Depende del orden de n-gramas y de la ventana de recuperación; no especificada |
| Tipos de cuantizacion | No aplica |
| Idiomas soportados | No disponible (depende del corpus suministrado) |
| Licencia | SOVEREIGN (según el autor); en HuggingFace figura como "no disponible" |
| Formato de pesos | No aplica (se genera un índice a partir del corpus; no hay pesos serializados) |

## Arquitectura y entrenamiento

Sovlm no sigue una arquitectura transformer ni de estado sólido. Es un sistema híbrido de modelado estadístico compuesto por varios módulos: un `Dictionary` que define el vocabulario de forma soberana, un `NGramIndex` que captura coherencia local (qué token sigue a qué), un suavizado `KneserNey` para manejar contextos no vistos, un `SkipGramIndex` para patrones estructurales a distancia, un `FuzzyPrefixIndex` basado en LSH para degradación suave ante prefijos cercanos, y un `InvertedIndex` con BM25 para recuperación de fragmentos relevantes del corpus. Un `Blender` arbitra entre las señales de Markov y de recuperación, y un `Sampler` con soporte QRNG selecciona el siguiente token con entropía cuántica.

No hay entrenamiento en el sentido clásico: el modelo se construye a partir de un corpus mediante el comando `sovlm build`. Tampoco hay retropropagación ni ajuste por RLHF/DPO. La "innovación" reside en la combinación de técnicas clásicas de PLN (n-gramas, BM25, Kneser-Ney) con un muestreo basado en números aleatorios cuánticos, lo que pretende eliminar sesgos de muestreo pseudoaleatorio.

## Capacidades

- Generación de texto basada en n-gramas y recuperación BM25, con coherencia local limitada al orden configurado (por ejemplo, `--order 4`).
- Soporte para construcción de modelos desde corpus variados: pruebas Lean, código Prolog, documentación Markdown, etc.
- Muestreo con QRNG para selección de tokens sin sesgo estadístico conocido.
- API HTTP integrada (`sovlm serve`) para servir el modelo como servicio.
- API Python (`Generator`, `build_from_paths`) para integración programática.
- Sin capacidades de razonamiento, tool calling, agentes o visión. No es un modelo multimodal ni conversacional.
- Capacidades multilingües dependen enteramente del corpus de construcción; no hay garantía de generalización.

## Casos de uso

- Generación de pruebas Lean 4: el modelo puede construir secuencias de texto que sigan patrones sintácticos de Lean, útil para explorar espacios de demostración o generar esqueletos de pruebas a partir de un corpus de teoremas.
- Autocompletado de código Prolog: dado un corpus de programas Prolog, sovlm puede sugerir cláusulas o predicados basándose en patrones estadísticos, sin necesidad de un modelo neuronal pesado.
- Documentación técnica interna: para equipos que quieran generar texto coherente a partir de sus propias guías o manuales, con control absoluto sobre el vocabulario y sin enviar datos a servicios externos.
- Búsqueda y generación aumentada por recuperación (RAG) local: el componente BM25 permite extraer fragmentos relevantes del corpus para enriquecer la generación, útil en dominios especializados.
- Sistemas de generación con requisitos de soberanía de datos: organizaciones que necesitan un generador de texto que opere sin conexión y sin depender de pesos preentrenados de terceros.
- Prototipado rápido de modelos de lenguaje estadísticos: investigadores pueden comparar el comportamiento de n-gramas clásicos con QRNG frente a enfoques neuronales en tareas de generación restringida.
- Integración en pipelines de verificación formal: al conectarse con `the-49th-call` (Lean 4 verificado), puede alimentar herramientas de generación asistida de pruebas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras métricas estándar. Al ser un modelo estadístico no neuronal, su rendimiento en tareas de razonamiento general es previsiblemente bajo, pero no se dispone de evaluaciones cuantitativas.

## Requisitos de hardware

- No requiere GPU: el modelo se ejecuta en CPU, como indican los badges "Zero GPU" y "Zero Training".
- Consumo de memoria proporcional al tamaño del corpus y al orden de n-gramas; no hay cifras exactas disponibles.
- Adecuado para entornos embebidos, servidores ligeros o máquinas sin aceleradores.
- Despliegue mediante la API HTTP integrada (`sovlm serve`) o como biblioteca Python.
- La latencia depende del tamaño del índice y de la complejidad de la consulta BM25; no se proporcionan estimaciones.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría. Sovlm se asemeja conceptualmente a modelos clásicos de n-gramas como KenLM o IRSTLM, pero con componentes adicionales de recuperación y muestreo cuántico. No hay datos públicos que permitan una comparación cuantitativa.

## Limitaciones y advertencias

- La coherencia del texto generado está limitada por el orden de n-gramas; no es capaz de mantener un discurso de largo alcance ni de razonar sobre el mundo.
- Genera texto basado exclusivamente en patrones estadísticos del corpus; si el corpus contiene sesgos, estos se reflejarán en la salida.
- Riesgo de alucinación en el sentido de producir secuencias que no aparecen en el corpus, especialmente con órdenes bajos de n-gramas.
- Sin soporte para tool calling, agentes, ni integración con APIs externas más allá de su propio servidor HTTP.
- La licencia SOVEREIGN no es una licencia estándar reconocida; su compatibilidad con uso comercial no está clara y debe consultarse con el autor.
- No hay garantía de soporte multilingüe: el modelo solo "habla" los idiomas presentes en el corpus de construcción.
- El uso de QRNG puede requerir hardware o servicios específicos no detallados en la documentación.
- No es adecuado para tareas de generación creativa extensa, diálogo conversacional o razonamiento complejo.

## Enlaces

- HuggingFace: https://huggingface.co/Snapkitty/sovlm
- Repositorio y documentación del stack SnapKitty: no disponible en la información proporcionada.
- Componentes mencionados (abjad-machine, sovereign-transformer, the-49th-call, bob-orchestrator): sin enlaces directos disponibles.
