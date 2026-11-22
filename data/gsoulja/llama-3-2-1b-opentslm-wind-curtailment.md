# gsoulja/Llama-3.2-1B-OpenTSLM-wind-curtailment

## Resumen

Llama-3.2-1B-OpenTSLM-wind-curtailment es un modelo de lenguaje para series temporales desarrollado por el usuario gsoulja (equipo sololeveling) en el marco del hackathon TimeNet Round 1 de 2026. Se construye sobre el modelo base meta-llama/Llama-3.2-1B congelado y le añade un codificador de series temporales y un proyector que transforma las señales en tokens suaves (soft prompts) para el modelo de lenguaje, siguiendo la arquitectura OpenTSLM-SP. Su tarea concreta es responder a una pregunta binaria sobre datos SCADA de aerogeneradores: si una turbina recibió instrucción de recortar su producción (curtailment) durante un día concreto.

El modelo recibe seis señales de 10 minutos a lo largo de un día (potencia, velocidad de viento, velocidad de rotor, ángulo de pitch, dirección de góndola y temperatura ambiente) junto con una descripción textual del comportamiento del resto del parque eólico. A partir de ahí clasifica entre "curtailed" y "not curtailed". Es un lanzamiento de investigación: el propio autor indica que no alcanzó el umbral de rendimiento fijado antes de las pruebas y que su detector de producción es un modelo de gradient boosting no publicado.

La relevancia del modelo es doble. Por un lado, demuestra la viabilidad de aplicar modelos de lenguaje a la clasificación de series temporales industriales con contexto textual. Por otro, su publicación transparente de resultados negativos y de la metodología de evaluación aporta valor a la comunidad de investigación en series temporales y energía eólica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | OpenTSLM-SP (soft-prompt time-series language model) sobre Llama-3.2-1B congelado |
| Parametros totales | 2.375.424 parametros entrenados (codificador de series + proyector); pesos de Llama-3.2-1B no incluidos |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | llama3.2 (Llama 3.2 Community License) |
| Formato de pesos | safetensors (model.safetensors) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura OpenTSLM-SP, que combina un codificador de series temporales con un proyector que genera tokens suaves insertados en el espacio de embeddings de un Llama-3.2-1B congelado. El repositorio contiene únicamente las partes entrenadas: el codificador y el proyector (2.375.424 parámetros por conjunto de pesos). Los pesos del modelo de lenguaje deben cargarse por separado desde meta-llama/Llama-3.2-1B bajo su propia licencia. La respuesta se obtiene puntuando cada respuesta candidata por su verosimilitud bajo el modelo de lenguaje.

El entrenamiento se realizó sobre días de turbinas Senvion con ejemplos de curtailment sintéticos, ya que no había etiquetas reales de curtailment en los datos de entrenamiento. Previamente se eliminaron ejemplos que una revisión consideró poco fiables. Se completaron 4 épocas y los pesos publicados corresponden a la época 2, la de menor pérdida de validación. Los datos de preparación, prompts, etiquetas y código de entrenamiento no son públicos. El `config.json` registra el sha256 del checkpoint de origen, la época de la que provienen los pesos y si el adaptador de fusión está presente.

## Capacidades

- Clasificación binaria de series temporales: determina si una turbina fue objeto de curtailment en un día concreto a partir de seis señales SCADA de 10 minutos.
- Integración de contexto textual: incorpora una descripción en lenguaje natural del comportamiento del resto del parque eólico en la formulación de la pregunta.
- Respuesta por verosimilitud: evalúa respuestas candidatas ("curtailed" / "not curtailed") puntuando su probabilidad bajo el modelo de lenguaje.
- Procesamiento de series temporales multivariadas: maneja seis canales simultáneos con resolución de 10 minutos a lo largo de un día.
- Modelo de investigación: no está diseñado para producción ni para uso general fuera de su tarea específica.
- No dispone de soporte documentado de tool calling, function calling, agentes, razonamiento multi-paso, visión ni audio.

## Casos de uso

- Investigación en detección de curtailment: sirve como referencia reproducible para comparar enfoques de modelos de lenguaje frente a métodos tabulares clásicos en la detección de recortes de producción eólica.
- Análisis de datos SCADA con contexto textual: permite formular consultas en lenguaje natural sobre el estado operativo de una turbina combinando señales numéricas y descripción del parque.
- Prototipado de clasificadores de series temporales basados en LLM: el codificador y el proyector publicados pueden servir de punto de partida para adaptar Llama-3.2-1B a otras tareas de clasificación de series.
- Estudio de la técnica de soft prompting para series temporales: permite analizar cómo se comporta la inserción de tokens suaves en un LLM congelado en tareas de clasificación industrial.
- Benchmark de referencia en investigación energética: su publicación con resultados negativos y metodología de evaluación pre-registrada lo hace útil como caso de estudio en evaluación rigurosa de modelos.
- Educación y divulgación: ejemplo didáctico de cómo combinar un LLM con un codificador de series temporales para una tarea de dominio específico.

## Benchmarks y rendimiento

| Test | Este modelo | Comparacion |
|---|---|---|
| Penmanshiel 2021 H2 validacion (un evento de curtailment registrado, 14 turbinas) | AUC 0.942, 11 de 14 detectadas | arbol: AUC 0.930, 8 de 14 |
| Hill of Towie (Siemens) 2025-26, 768 dias-turbina con despacho de red | 188 de 768 detectados | detector de gradient boosting congelado: 742 de 768 (96.6%) |

En Hill of Towie 2025-26 (5.113 días-turbina, 768 días con despacho de red): ROC AUC 0.789, average precision 0.318. Con el nivel de alarma fijado en días de validación sin curtailment (percentil 95), detecta 188 de 768 días de despacho y genera alarma en 491 días adicionales. El modelo posterior del mismo autor (`Llama-3.2-1B-OpenTSLM-wind-joint`) detectó 570 de 768 en la misma prueba.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Los pesos publicados son solo el codificador y el proyector (2.375.424 parámetros), por lo que el requisito principal viene de cargar Llama-3.2-1B completo.
- GPU recomendadas: no disponible. Por el tamaño del modelo base (1B parámetros), es plausible su ejecución en GPU de consumo, pero no se especifica en la información disponible.
- Cabe en GPU de consumo: no disponible (no confirmado en la información proporcionada).
- Opciones de despliegue: no disponible. La librería indicada es PyTorch; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento en la tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Llama-3.2-1B-OpenTSLM-wind-curtailment | 2.375.424 entrenados sobre Llama-3.2-1B congelado | no disponible | AUC 0.942 en Penmanshiel; 188/768 en Hill of Towie | llama3.2 | Hugging Face (público) |
| Llama-3.2-1B-OpenTSLM-wind-joint | no disponible | no disponible | 570/768 en Hill of Towie | llama3.2 | Hugging Face (referenciado por el autor) |
| Detector de gradient boosting (producción, no publicado) | no disponible | no disponible | 742/768 (96.6%) en Hill of Towie | no disponible | No público |
| Árbol de decisión (comparación en Penmanshiel) | no disponible | no disponible | AUC 0.930, 8/14 en Penmanshiel | no disponible | No disponible |

## Limitaciones y advertencias

- No alcanzó el umbral de rendimiento fijado antes de las pruebas en Hill of Towie, según reconoce el propio autor.
- La validación en Penmanshiel contiene un único evento de curtailment independiente, por lo que no permite separar diferencias pequeñas de rendimiento.
- El modelo se entrenó con ejemplos de curtailment sintéticos porque los datos de entrenamiento no contenían etiquetas reales de curtailment.
- Está muy por debajo del detector de producción (188/768 frente a 742/768), que utiliza más contexto del parque eólico.
- Genera una tasa elevada de falsos positivos: 491 días de alarma en días sin curtailment al nivel de alarma del percentil 95.
- Los datos de preparación, prompts, etiquetas y código de entrenamiento no son públicos, lo que limita la reproducibilidad.
- Solo soporta inglés y está especializado en una tarea muy concreta; no es un modelo de propósito general.
- Riesgo de alucinación y sesgos: no documentado en la información disponible, aunque al ser un clasificador binario por verosimilitud el riesgo se limita a las dos respuestas candidatas.
- Restricciones de licencia: se rige por la Llama 3.2 Community License, que incluye la Acceptable Use Policy de Meta; los pesos de Llama-3.2-1B deben obtenerse por separado bajo su propia licencia.
- Es un lanzamiento de investigación para transparencia sobre los resultados publicados, no un modelo listo para producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/gsoulja/Llama-3.2-1B-OpenTSLM-wind-curtailment
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-1B
- Repositorio OpenTSLM: https://github.com/OpenTSLM/OpenTSLM
- PR del dataset en TimeNet: https://github.com/OpenTSLM/TimeNet/pull/838
- Dataset Kelmarsh wind farm: https://zenodo.org/records/16807551
- Dataset Penmanshiel wind farm: https://zenodo.org/records/16807304
- Dataset Hill of Towie wind farm: https://doi.org/10.5281/zenodo.14870021
