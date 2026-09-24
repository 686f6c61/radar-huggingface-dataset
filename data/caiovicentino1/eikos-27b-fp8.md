# caiovicentino1/Eikos-27B-FP8

## Resumen

Eikos-27B-FP8 es una versión cuantizada a FP8 del modelo Eikos-27B, un modelo de aproximadamente 27,8 mil millones de parámetros desarrollado por el usuario caiovicentino1. A diferencia de los modelos generativos convencionales, Eikos no está pensado para producir texto libre, sino para emitir decisiones tipadas (respuestas de sí/no, elección entre N opciones y puntuaciones ordinales) sobre un estado descrito en el prompt, todo ello en una sola pasada hacia delante y con una probabilidad calibrada asociada a cada opción.

Esta build concreta sustituye los pesos en bf16 por pesos en FP8 por canal y activaciones FP8 dinámicas por token, empleando el esquema FP8_DYNAMIC del formato compressed-tensors generado con llm-compressor y sin datos de calibración. El resultado es una reducción del tamaño del repositorio de 55,6 GB a 31,2 GB, manteniendo la torre de visión, los pesos MTP (multi-token prediction), los embeddings y la LM head en mayor precisión.

El modelo resulta relevante para flujos de decisión automatizada en finanzas, trading y trade finance, donde interesa no solo la respuesta sino también la confianza declarada. Su licencia MIT para las contribuciones propias y su compatibilidad con vLLM lo hacen desplegable en infraestructura de servidor estándar, aunque exige vLLM >= 0.30.0 por su arquitectura híbrida.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con Gated DeltaNet (atención lineal), torre de visión y pesos MTP, según la model card |
| Parametros totales | 27.781.427.952 (~27,8 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP8: pesos FP8 por canal y activaciones FP8 dinámicas por token (FP8_DYNAMIC, compressed-tensors, llm-compressor, sin datos de calibración); torre de visión, MTP, embeddings y LM head en mayor precisión |
| Idiomas soportados | no disponible |
| Licencia | MIT para las contribuciones propias; modelo base Qwen3.8-27B bajo Apache-2.0 |
| Formato de pesos | safetensors en formato compressed-tensors (FP8) |
| Modelo base | caiovicentino1/Eikos-27B (relación: quantized) |
| Tamaño del repositorio | 31,2 GB |
| Pipeline declarado | text-classification |
| Librería | transformers |
| Motor de inferencia requerido | vLLM >= 0.30.0 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La model card describe Eikos-27B como una arquitectura híbrida basada en Gated DeltaNet, lo que combina mecanismos de atención con estados recurrentes de atención lineal. Esta elección obliga a usar una versión reciente de vLLM: el propio autor advierte que builds anteriores devuelven respuestas incorrectas cuando se agrupan varias peticiones largas en un mismo lote (*batching*). El repositorio incluye además una torre de visión (el tag `image-text-to-text` lo confirma) y pesos MTP, lo que apunta a predicción multi-token. El tag del repositorio apunta a `qwen3_5`, mientras que la model card cita Qwen3.8-27B como modelo base bajo Apache-2.0; no se dispone de más detalle sobre esta discrepancia.

Respecto al proceso de cuantización, se aplicó `FP8_DYNAMIC` de compressed-tensors sobre los pesos del modelo bf16, con cuantización por canal en los pesos y dinámica por token en las activaciones, y sin conjunto de calibración. El formato de prompt, la lectura por letras (*letter readout*) y la calibración (`calib.json`, con temperatura T = 1) son idénticos a los del modelo bf16. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO.

## Capacidades

- Decisión tipada en una sola pasada: respuestas de sí/no, selección entre N opciones y puntuaciones ordinales sobre un estado dado.
- Calibración explícita: cada opción va acompañada de una probabilidad calibrada (ECE de 0,042 en la build FP8).
- Umbral de confianza: el modelo puede abstenerse, con un 44,2 % de decisiones tomadas y un 2,6 % de error cuando la confianza declarada es >= 0,90.
- Comprensión de imagen y texto: el tag `image-text-to-text` y la presencia de torre de visión indican entrada multimodal.
- Predicción multi-token (MTP) mediante pesos dedicados conservados en mayor precisión.
- Sesiones de agente: la model card indica que la API HTTP y las sesiones de agente son las mismas que en Eikos-27B.
- Reglas de negocio y composición: evaluado en reglas de trade finance y en reglas composicionales, incluyendo dominios y libros de reglas nuevos.
- Tareas financieras específicas: CUAD, análisis de sentimiento y FinQA evaluados como juez.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.

## Casos de uso

- Decisión de trading asistida: el modelo recibe un estado de mercado descrito en texto y devuelve una decisión tipada con probabilidad calibrada, lo que permite fijar umbrales de confianza antes de ejecutar una operación.
- Verificación de reglas de trade finance: evaluación de operaciones frente a libros de reglas (por ejemplo, condiciones documentales de créditos) devolviendo cumplimiento o incumplimiento con una probabilidad asociada, útil cuando los libros de reglas cambian y no se pueden reentrenar.
- Triaje de documentación financiera: clasificación de contratos y cláusulas con el conjunto CUAD como referencia, sustituyendo revisiones manuales preliminares por una primera pasada automática.
- Análisis de sentimiento financiero: etiquetado ordinal de tono de mercado sobre noticias e informes, con probabilidad por clase en lugar de una única etiqueta dura.
- Respuesta a preguntas sobre informes (FinQA): extracción de la respuesta y evaluación mediante juez, integrable en asistentes de análisis de resultados trimestrales.
- Enrutado de aprobaciones con abstención: en pipelines de back office, aceptar automáticamente solo las decisiones con confianza >= 0,90 y escalar el resto a revisión humana, dado el 2,6 % de error en ese tramo.
- Extracción de estado desde capturas o documentos escaneados: gracias a la torre de visión, el modelo puede tomar la entrada como imagen-texto y emitir la decisión tipada correspondiente.
- Agentes multi-paso: uso como componente de decisión dentro de una sesión de agente que gestiona varias preguntas encadenadas sobre el mismo contexto.

## Benchmarks y rendimiento

La model card publica una validación cruzada entre la build bf16 y la build FP8 sobre los mismos 7.371 elementos (7 suites nunca usadas en entrenamiento), con vLLM 0.30, batching y caché de prefijo activados. El criterio de publicación se fijó antes de ver resultados: exactitud dentro de 1 punto respecto a bf16, ECE dentro de 0,01 y al menos un 97 % de respuestas sin cambios.

| Metrica | Eikos-27B (bf16) | Eikos-27B-FP8 |
|---|---|---|
| Tamaño | 55,6 GB | 31,2 GB |
| JevBench public — original / hard | 100,0 / 82,0 | 100,0 / 83,8 |
| DecisionBench — medium / hard | 89,1 / 78,2 | 88,7 / 78,8 |
| Batería general (9 tareas) | 82,6 | 82,8 |
| Finanzas (CUAD, sentimiento, FinQA-judge) | 85,4 | 85,3 |
| Reglas de trade — vistas / no vistas | 85,4 / 87,4 | 85,6 / 86,9 |
| Reglas composicionales — mismo tipo / dominio nuevo / libros de reglas | 95,6 / 94,3 / 95,3 | 95,6 / 94,7 / 95,0 |
| ECE (menor es mejor) | 0,043 | 0,042 |
| Confianza >= 0,90: decide / error | 44,1 % / 2,5 % | 44,2 % / 2,6 % |
| Misma respuesta que bf16 (todas / confianza >= 0,9) | — | 98,8 % / 100,0 % |

No se han publicado resultados de benchmarks de terceros (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para los pesos: aproximadamente 31,2 GB en FP8, según el tamaño del repositorio.
- VRAM total realista en inferencia: los 31,2 GB de pesos más caché KV y activaciones llevan el consumo por encima de los 32-35 GB, por lo que se recomienda un acelerador de 40 GB o más.
- GPU recomendadas: A100 40 GB, A100 80 GB, H100 80 GB, L40S 48 GB o RTX A6000 48 GB.
- GPU de consumo: no cabe en una RTX 4090 de 24 GB ni en tarjetas de 16-24 GB; no se documenta ninguna build GGUF o de menor precisión que sí lo permita.
- Opciones de despliegue: vLLM >= 0.30.0 como único motor documentado, lanzado mediante el script `serve_vllm.sh` incluido, con `serve.py` exponiendo la API HTTP en el puerto 8000 sobre el motor vLLM en el 8001.
- Compatibilidad: el repositorio incluye tensores en formato compressed-tensors; no se documenta soporte para llama.cpp, Ollama, TGI ni otras alternativas.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Tamaño de pesos | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| Eikos-27B-FP8 | ~27,8 B | 31,2 GB (FP8) | no disponible | MIT (propia) + Apache-2.0 (base) | Quantized del bf16; requiere vLLM >= 0.30.0 |
| Eikos-27B | ~27,8 B | 55,6 GB (bf16) | no disponible | MIT (propia) + Apache-2.0 (base) | Modelo de referencia; misma calibración y formato de prompt |
| Qwen3.8-27B | no disponible | no disponible | no disponible | Apache-2.0 | Modelo base citado en la model card; sin datos de benchmarks en la información disponible |

No se dispone de datos de benchmarks ni de especificaciones de contexto de modelos alternativos de la misma categoría (modelos de decisión calibrada de ~27 B) en la información proporcionada, por lo que la comparación cuantitativa se limita al par bf16/FP8 del propio autor.

## Limitaciones y advertencias

- El modelo decide únicamente en el 44,2 % de los casos con confianza >= 0,90, con un 2,6 % de error en ese tramo; el 55,8 % restante queda por debajo del umbral y requiere política de abstención o revisión humana.
- La calibración reportada (ECE 0,042) es agregada sobre 7.371 elementos; no se documenta su comportamiento por subgrupo ni por idioma.
- Dependencia estricta de vLLM >= 0.30.0: con builds anteriores el autor advierte de respuestas incorrectas al agrupar varias peticiones largas, un riesgo real en entornos de producción que reutilicen imágenes antiguas.
- No se indica qué idiomas soporta el modelo; el comportamiento multilingüe es desconocido.
- No se especifica la longitud de contexto soportada, lo que impide planificar despliegues con documentos extensos.
- Riesgo de alucinación: aunque la tarea es de decisión tipada, el modelo sigue siendo un LLM y puede emitir decisiones erróneas con alta confianza en dominios alejados de su distribución de entrenamiento.
- Sesgos: no se documenta ningún análisis de sesgo demográfico, lingüístico o de dominio.
- La cuantización FP8 se realizó sin datos de calibración, por lo que la validación se apoya en el conjunto de suites del autor y no en una cobertura exhaustiva de casos límite.
- Licencia: MIT para las contribuciones propias, pero el modelo base Qwen3.8-27B es Apache-2.0, con atribuciones recogidas en `NOTICE`; conviene revisar ambas antes de uso comercial.
- El propio autor declara que el modelo no constituye asesoramiento legal, fiscal ni de inversión.
- Con 0 descargas y 0 likes, no existe validación independiente de la comunidad en el momento de redactar esta ficha.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/caiovicentino1/Eikos-27B-FP8
- Modelo base Eikos-27B: https://huggingface.co/caiovicentino1/Eikos-27B
- Imagen de presentación de Eikos: https://huggingface.co/caiovicentino1/Eikos-27B/resolve/main/assets/eikos_launch.png
- Perfil del autor en HuggingFace: https://huggingface.co/caiovicentino1/models
- Spaces del autor: https://huggingface.co/caiovicentino1/spaces
- Ficha de otro modelo del mismo autor en LLM Explorer: https://llm-explorer.com/model/caiovicentino1%2FQwopus3.5-27B-v3-HLWQ-Q5,71mywc3a0eP2YIzmh81jGB
