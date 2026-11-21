# mradermacher/sms-spam-detector-GGUF

## Resumen

`sms-spam-detector-GGUF` es una colección de cuantizaciones en formato GGUF del modelo base `ErphanRajai/sms-spam-detector`, publicada por el usuario mradermacher. No se trata de un modelo generativo de propósito general, sino de un modelo de clasificación de texto (etiquetado `feature-extraction` en Hugging Face) afinado para la detección de spam en mensajes SMS en inglés. El modelo base fue generado con la librería `transformers` mediante `Trainer` (`generated_from_trainer`), lo que indica un ajuste fino supervisado sobre una arquitectura tipo transformer encoder.

El interés de esta publicación no reside en una innovación arquitectónica, sino en la disponibilidad de pesos cuantizados en GGUF con distintos niveles de precisión (desde Q2_K hasta f16), lo que permite ejecutar el clasificador en CPU y en hardware modesto mediante `llama.cpp` u otras herramientas compatibles. Con 66.955.010 parámetros totales (aproximadamente 67 millones), el modelo es muy ligero: incluso la versión f16 ocupa alrededor de 0,2 GB según la model card.

Es relevante para desarrolladores que necesiten un filtro de spam de bajo coste, desplegable en local o en el borde (edge), sin dependencia de APIs externas. Sin embargo, la información pública disponible es muy escasa: no se detallan datos de entrenamiento, composición del dataset, métricas ni procedimiento de evaluación, por lo que debe tratarse como un componente a validar empíricamente antes de usarlo en producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (no se especifica la familia exacta; el modelo base se entrenó con `transformers` y `Trainer`) |
| Parametros totales | 66.955.010 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones); el modelo base original presumiblemente en safetensors, no confirmado en la información disponible |

## Arquitectura y entrenamiento

La información disponible no especifica la arquitectura concreta del modelo base `ErphanRajai/sms-spam-detector`. Los metadatos indican que fue generado con `transformers` mediante `Trainer` (`generated_from_trainer`), lo que es consistente con un ajuste fino supervisado de un transformer encoder para clasificación binaria (spam / no spam). El número de parámetros (66,9 millones) es compatible con arquitecturas encoder compactas tipo BERT-base o similares, aunque no se confirma el modelo de partida.

No se dispone de datos sobre el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF/DPO ni innovaciones técnicas (atención lineal, decodificación especulativa, etc.). Las cuantizaciones publicadas por mradermacher son estáticas (no hay versiones ponderadas/imatrix en el momento de la publicación, según la propia model card).

## Capacidades

- Clasificación de mensajes SMS en inglés para distinguir spam de mensajes legítimos (etiqueta `feature-extraction` en Hugging Face).
- Extracción de representaciones (embeddings) del texto de entrada, útil para pipelines de clasificación posteriores.
- Ejecución local en CPU mediante GGUF y `llama.cpp` u otros runtimes compatibles.
- No se documentan capacidades de generación de texto, razonamiento, código, matemáticas, visión ni audio.
- No se documenta soporte de tool calling ni de agentes multi-step.
- Capacidad multilingüe limitada al inglés según los metadatos (`language: en`).

## Casos de uso

- Filtrado de spam en pasarelas SMS: integrar el clasificador en el backend de un gateway para etiquetar mensajes entrantes antes de enrutarlos, aprovechando el tamaño reducido (menos de 0,2 GB en f16) para desplegarlo en la misma máquina que el gateway.
- Moderación en aplicaciones de mensajería: ejecutar el modelo en el dispositivo o en un servidor perimetral para bloquear mensajes promocionales no deseados sin enviar contenido a terceros.
- Preprocesado de datasets: usar el modelo para etiquetar automáticamente grandes volúmenes de SMS y construir conjuntos de datos de entrenamiento o de evaluación para otros clasificadores.
- Filtro previo en sistemas anti-fraude: combinar la señal de spam con reglas heurísticas (remitente desconocido, enlaces acortados) para priorizar la revisión manual de mensajes sospechosos.
- Despliegue en entornos con recursos limitados: usar las cuantizaciones Q4_K_S o Q4_K_M (0,1 GB) en dispositivos edge, contenedores pequeños o funciones serverless con poca memoria.
- Investigación y docencia: emplear el modelo como ejemplo reproducible de ajuste fino de un transformer encoder y de cuantización GGUF para experimentos de clasificación de texto.
- Prototipado rápido: validar una idea de producto de filtrado de SMS en local antes de invertir en un modelo mayor o en una API externa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en todas las cuantizaciones; las versiones Q4_K_S y Q4_K_M ocupan aproximadamente 0,1 GB en disco y las f16/Q8_0 alrededor de 0,2 GB.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM; el modelo es viable incluso en GPUs integradas o en CPU.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer actual (RTX 3060, RTX 4060, RTX 4090, etc.) y en la mayoría de iGPUs.
- Opciones de despliegue: `llama.cpp` y herramientas compatibles con GGUF (Ollama, LM Studio, etc.); el modelo base también puede cargarse con `transformers` si se dispone de los pesos originales.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. Como referencia cualitativa, el modelo se sitúa en la categoría de clasificadores de texto ligeros (decenas de millones de parámetros), pero no se han publicado métricas que permitan una comparación rigurosa con alternativas.

| Modelo | Parametros | Contexto | Licencia | Formato |
|---|---|---|---|---|
| sms-spam-detector-GGUF (este) | 66.955.010 | no disponible | apache-2.0 | GGUF |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- No se documentan sesgos conocidos ni evaluación de equidad; el modelo se entrenó presumiblemente con datos de SMS en inglés y puede comportarse de forma desigual con distintos dialectos o registros.
- Riesgo de alucinación no aplicable en sentido estricto (es un clasificador, no un generador), pero sí riesgo de falsos positivos y falsos negativos no cuantificados.
- Limitación de idioma: solo inglés según los metadatos; su uso con SMS en castellano u otros idiomas no está respaldado.
- No se especifica la longitud máxima de contexto soportada; los SMS suelen ser cortos, pero no hay garantía para entradas más largas.
- Licencia apache-2.0 permite uso comercial, pero conviene verificar la licencia del modelo base `ErphanRajai/sms-spam-detector` y las condiciones de los datos de entrenamiento originales, no detalladas.
- Ausencia de métricas publicadas (precisión, recall, F1) impide garantizar un rendimiento mínimo en producción; se recomienda evaluar con un conjunto propio antes de desplegar.
- Las cuantizaciones de baja precisión (Q2_K, Q3_K_S) pueden degradar la calidad de clasificación; la propia model card recomienda Q4_K_S, Q4_K_M o superiores para un equilibrio calidad/velocidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mradermacher/sms-spam-detector-GGUF
- Modelo base: https://huggingface.co/ErphanRajai/sms-spam-detector
- Página de descargas del cuantizador: https://hf.tst.eu/model#sms-spam-detector-GGUF
- README de referencia para uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- FAQ y solicitudes de cuantización de mradermacher: https://huggingface.co/mradermacher/model_requests
- Comparativa de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
