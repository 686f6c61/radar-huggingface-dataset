# sigmanih/Qwen-Qwen3.8-27B-GGUF-Q5_K_M

## Resumen

Qwen-Qwen3.8-27B-GGUF-Q5_K_M es una cuantización GGUF en formato Q5_K_M del modelo base Qwen/Qwen3.8-27B, publicada por el usuario sigmanih bajo la etiqueta Sigma Studio. No se trata de un modelo entrenado desde cero, sino de una conversión de pesos a un formato optimizado para inferencia con llama.cpp, pensada para ejecución local en hardware de consumo. El repositorio ocupa 19,5 GB y declara 27.320.697.856 parámetros totales según los safetensors del modelo base.

El modelo base pertenece a la familia Qwen3 y, según la model card del autor, emplea una arquitectura denominada "qwen35" con 65 capas transformer y una dimensión oculta de 5120. La ventana de contexto declarada es de 262.144 tokens, lo que lo sitúa en la categoría de modelos de contexto largo. La cuantización Q5_K_M busca un equilibrio entre calidad y huella de memoria, con un consumo estimado de aproximadamente 19,3 GB de VRAM para descarga completa en GPU.

La relevancia de esta ficha radica en que permite evaluar rápidamente si el modelo es adecuado para despliegues locales sin depender de infraestructura en la nube. Ahora bien, la información disponible procede casi exclusivamente de la model card del autor de la cuantización, con benchmarks medidos sobre subconjuntos parciales y sin validación independiente, por lo que debe interpretarse con cautela.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (denominada "qwen35" en la model card), 65 capas, dimensión oculta 5120 |
| Parametros totales | 27.320.697.856 (27,3 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 262.144 tokens (según model card) |
| Tipos de cuantizacion | Q5_K_M (esta publicación); otras cuantizaciones del base no disponibles en esta ficha |
| Idiomas soportados | en, it (según metadatos del repositorio) |
| Licencia | other (la model card muestra un badge Apache-2.0, pero el campo de licencia del repositorio es "other"; discrepancia sin resolver) |
| Formato de pesos | GGUF (Q5_K_M) |

## Arquitectura y entrenamiento

La arquitectura es un transformer denso con 65 capas y dimensión oculta de 5120, según los datos declarados en la model card del autor de la cuantización. No se especifica si emplea atención lineal, decodificación especulativa u otras innovaciones de eficiencia, ni se detalla la composición del dataset de entrenamiento, el número de tokens vistos o si hubo fases de RLHF o DPO. Toda esa información correspondería al modelo base Qwen/Qwen3.8-27B, que no se ha proporcionado en esta ficha.

Lo único verificable en esta publicación es el proceso de cuantización: conversión de los pesos originales a GGUF con el método Q5_K_M, orientado a inferencia con llama.cpp. La model card menciona una "SigmaEngine" y un "Sigma Studio Training Lab" como herramientas de evaluación, pero no aporta detalles técnicos sobre el pipeline de conversión ni sobre posibles ajustes posteriores al entrenamiento.

## Capacidades

- Generación de texto conversacional en inglés e italiano, según los idiomas declarados en el repositorio.
- Razonamiento multi-paso: la model card documenta un modo "Deep Thinking" con traza de razonamiento explícita, diferenciado del modo de respuesta directa.
- Resolución de problemas matemáticos de competición y de aritmética multi-paso (resultados reportados en MATH y GSM8K).
- Generación de código Python, con resultados reportados en HumanEval y MBPP.
- Razonamiento científico y de sentido común (ARC-Challenge, HellaSwag, BIG-Bench Hard).
- Soporte declarado de tool calling y protocolos agénticos, con una adherencia al protocolo de herramientas del 93,5 % según la evaluación del autor.
- Contexto largo de hasta 262.144 tokens, adecuado para documentos extensos y conversaciones multi-turno prolongadas.
- Capacidades multimodales: no disponibles.
- Capacidades de audio: no disponibles.

## Casos de uso

- Asistente conversacional local: el modelo puede gestionar diálogos multi-turno con contexto de hasta 262.144 tokens, lo que permite mantener historiales largos sin truncamiento agresivo. Es adecuado para despliegues en estaciones de trabajo con una RTX 3090 o 4090 de 24 GB.
- Generación de código en entornos con requisitos de privacidad: al ejecutarse íntegramente en local mediante llama.cpp, permite autocompletar y refactorizar código sin enviar el código fuente a servicios externos. Los resultados reportados en HumanEval (7/7) y MBPP (7/9) sugieren un rendimiento razonable en Python.
- Análisis de documentos extensos: con 262.144 tokens de contexto, puede procesar informes, contratos o bases de código completas en una sola pasada, resumiendo o extrayendo información estructurada.
- Razonamiento matemático asistido: el modo "Deep Thinking" está orientado a problemas de varios pasos; los resultados en MATH (8/9) y GSM8K (8/9) lo hacen utilizable para tutoría o verificación de cálculos, siempre con revisión humana.
- Automatización de flujos agénticos con herramientas: la model card reporta una adherencia del 93,5 % al protocolo de herramientas, lo que permite integrarlo en pipelines que invocan funciones registradas (lectura de ficheros, llamadas a API) con esquemas validados.
- Prototipado rápido en investigación: al ser una cuantización GGUF de 19,5 GB, se puede desplegar en una sola GPU consumer para experimentos de evaluación comparativa sin necesidad de clústeres.
- Soporte en italiano e inglés: útil para aplicaciones bilingües en esos dos idiomas, aunque no se declaran otros idiomas.

## Benchmarks y rendimiento

Los datos siguientes proceden exclusivamente de la model card del autor y fueron medidos sobre subconjuntos parciales de cada suite, no sobre el conjunto completo. El propio autor advierte que la puntuación "no es comparable con una ejecución de suite completa".

| Benchmark | Resultado | Muestras evaluadas | Nota |
|---|---|---|---|
| ARC-Challenge | 100 % | 9/9 | Subconjunto parcial |
| BIG-Bench Hard | 71 % | 5/7 | Subconjunto parcial |
| GPQA | 22 % | 2/9 | Rendimiento bajo declarado |
| GSM8K | 89 % | 8/9 | Subconjunto parcial |
| HellaSwag | 67 % | 6/9 | Subconjunto parcial |
| HumanEval | 100 % | 7/7 | pass@1, subconjunto parcial |
| MATH | 89 % | 8/9 | Subconjunto parcial |
| MBPP | 78 % | 7/9 | Subconjunto parcial |
| MMLU | 64 % | 9/14 | Subconjunto parcial |
| MMLU-Pro | 67 % | 6/9 | Subconjunto parcial |
| TruthfulQA | 89 % | 8/9 | Subconjunto parcial |
| Total agregado | 75 % | 75/100 | Suma de subconjuntos |

Comparativa de modos de razonamiento reportada por el autor:

| Modo | Precisión | Preguntas superadas | Perfil |
|---|---|---|---|
| No-Thinking (respuesta directa) | 80,7 % | 46/57 | Latencia mínima, sin tokens de razonamiento |
| Deep Thinking (CoT) | 67,4 % | 29/43 | Traza de razonamiento multi-paso; delta de -13,3 % frente al modo directo |

Evaluación agéntica reportada: adherencia al protocolo de herramientas del 93,5 %, finalización autónoma de tareas del 0,0 % (0/1 escenarios), contención en sandbox del 100 %. Estos datos indican que el modelo respeta los esquemas de herramientas pero no completó la tarea autónoma de prueba.

No se han publicado resultados de benchmarks independientes en la información disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 19,3 GB para descarga completa en GPU; aproximadamente 19,1 GB de RAM en modo CPU o híbrido, según la model card.
- GPU recomendadas: RTX 3090 o RTX 4090 (24 GB de VRAM) para descarga completa; el autor también menciona configuraciones con 32-64 GB de RAM para ejecución híbrida.
- Cabe en GPU consumer: sí, en tarjetas de 24 GB o más. En GPUs de 16 GB requeriría descarga parcial o una cuantización inferior (no incluida en esta publicación).
- Opciones de despliegue: llama.cpp es el motor principal declarado; al ser GGUF, es compatible con Ollama y otros runners basados en llama.cpp. No se menciona compatibilidad con vLLM o TGI en la información disponible.
- Latencia y throughput: no disponibles. La model card solo indica "latencia mínima" para el modo No-Thinking, sin cifras de tokens por segundo.

## Comparativa con modelos similares

No se dispone de datos de modelos comparables en la información proporcionada. La model card no incluye comparaciones con otras alternativas de la misma categoría (modelos densos de aproximadamente 27 B con contexto largo). Por tanto, la comparativa se indica como no disponible.

| Modelo | Parámetros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Qwen-Qwen3.8-27B-GGUF-Q5_K_M | 27,3 B | 262.144 | other | GGUF Q5_K_M | Hugging Face |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Los benchmarks proceden de subconjuntos parciales (entre 7 y 14 muestras por suite) y el propio autor advierte que no son comparables con ejecuciones completas. No deben usarse para afirmar superioridad frente a otros modelos.
- El resultado en GPQA es del 22 %, lo que indica una capacidad limitada en razonamiento académico de nivel graduate.
- El modo Deep Thinking obtuvo peor precisión que el modo directo en la evaluación del autor (-13,3 %), un resultado contraintuitivo que sugiere que la traza de razonamiento no siempre mejora la respuesta en este modelo.
- La finalización autónoma de tareas agénticas reportada es del 0,0 % (0/1 escenarios), pese a la alta adherencia al protocolo de herramientas. No se recomienda para automatización desatendida sin supervisión.
- Idiomas declarados: solo inglés e italiano. No hay soporte declarado para castellano ni otros idiomas.
- Discrepancia de licencia: el campo del repositorio indica "other", mientras que la model card muestra un badge Apache-2.0. Antes de uso comercial debe verificarse la licencia del modelo base Qwen/Qwen3.8-27B.
- Riesgo de alucinación: no se han publicado evaluaciones independientes de factualidad; el 89 % en TruthfulQA procede de 9 muestras, insuficiente para extraer conclusiones.
- La información sobre el entrenamiento (datos, RLHF, composición del dataset) no está disponible en esta ficha, lo que impide evaluar sesgos conocidos del modelo base.
- Al ser una cuantización Q5_K_M, puede haber una degradación de calidad respecto a los pesos originales en precisión completa, no cuantificada en la información disponible.
- El repositorio tiene 315 descargas y 1 like en el momento de la consulta, lo que indica una validación comunitaria muy limitada.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/sigmanih/Qwen-Qwen3.8-27B-GGUF-Q5_K_M
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio SigmaStudio: https://github.com/Sigmanih/SigmaStudio
- Perfil del autor en Hugging Face: https://huggingface.co/sigmanih
