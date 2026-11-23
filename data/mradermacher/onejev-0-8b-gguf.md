# mradermacher/OneJev-0.8B-GGUF

## Resumen

OneJev-0.8B es un modelo de decisión ("system-one") de aproximadamente 1.000 millones de parámetros, desarrollado por OmniJev y publicado en Hugging Face bajo licencia Apache 2.0. La versión aquí descrita es una cuantización GGUF estática realizada por mradermacher a partir del modelo original OmniJev/OneJev-0.8B. El modelo está etiquetado como multimodal, orientado a agentes de interfaz gráfica (GUI agents) y vídeo, y entrenado sobre el dataset OmniJev/OneJev-Data.

La propuesta del modelo no es la generación de texto generalista, sino la toma de decisiones calibrada: sus etiquetas incluyen "decision-model" y "calibration", lo que sugiere un uso como componente de evaluación o selección dentro de pipelines más amplios (por ejemplo, decidir entre varias acciones candidatas de un agente). El tamaño reducido y las cuantizaciones disponibles (desde Q2_K de 0,6 GB hasta f16 de 2,1 GB) lo hacen desplegable en hardware muy modesto.

La relevancia actual radica en la combinación de tres factores: licencia permisiva para uso comercial, un tamaño que cabe en cualquier GPU de consumo e incluso en CPU, y soporte multimodal mediante los ficheros mmproj que acompañan a las cuantizaciones. No obstante, la información pública disponible sobre arquitectura interna, contexto y datos de entrenamiento es muy limitada, como se detalla a continuación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo transformer multimodal; detalles internos no publicados) |
| Parametros totales | 1.006.672.704 (dato real de safetensors) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16; además mmproj-Q8_0 y mmproj-f16 |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones estáticas); el modelo base en transformers se distribuye en safetensors |
| Tamano del repo | 9,9 GB |
| Modelo base | OmniJev/OneJev-0.8B |
| Dataset de entrenamiento | OmniJev/OneJev-Data |

## Arquitectura y entrenamiento

No se han publicado detalles sobre la arquitectura interna del modelo en la información disponible. Las etiquetas del repositorio indican que se trata de un modelo multimodal (con soporte de imagen y vídeo, a juzgar por las etiquetas "multimodal" y "video") y orientado a agentes de GUI. La presencia de ficheros mmproj en las cuantizaciones GGUF confirma la existencia de un proyector multimodal separado del cuerpo del modelo, un patrón habitual en arquitecturas tipo LLaVA o Qwen-VL, aunque no se especifica cuál se emplea aquí.

Tampoco se detalla el volumen de tokens de entrenamiento, la composición del dataset OmniJev/OneJev-Data ni si se aplicaron fases de RLHF, DPO o ajuste por preferencias. Las etiquetas "system-one", "decision-model" y "calibration" sugieren un entrenamiento específico para producir decisiones o puntuaciones calibradas, probablemente en el contexto de selección de acciones de un agente, pero no hay documentación técnica que lo confirme. No se dispone de información sobre innovaciones como decodificación especulativa, atención lineal o mecanismos híbridos.

## Capacidades

- Toma de decisiones calibrada: el modelo está etiquetado como "decision-model" y "calibration", lo que apunta a su uso para puntuar o seleccionar opciones en lugar de generar texto libre.
- Procesamiento multimodal: soporte de entradas visuales mediante el proyector mmproj incluido en las cuantizaciones.
- Comprensión de vídeo: la etiqueta "video" indica capacidad de procesar secuencias de vídeo, aunque no se especifican resolución, número de fotogramas ni formato de entrada.
- Agentes de interfaz gráfica (GUI agents): diseñado para interpretar pantallas y decidir acciones sobre interfaces de usuario.
- Conversación: el repositorio está marcado como "conversational" y "endpoints_compatible", lo que indica compatibilidad con plantillas de chat e infraestructura de endpoints de Hugging Face.
- Capacidades multilingües: limitadas al inglés según el campo `language`.
- Tool calling / function calling: no disponible en la información proporcionada.
- Razonamiento multi-paso autónomo: no disponible en la información proporcionada.
- Modo "thinking" explícito: no disponible en la información proporcionada.

## Casos de uso

- Automatización de pruebas de interfaz gráfica: el modelo puede actuar como componente de decisión que, dada una captura de pantalla, elige la siguiente acción del agente (clic, escritura, scroll). Su tamaño de 1B permite ejecutarlo en la misma máquina que corre el entorno de pruebas sin necesidad de GPU dedicada.
- Evaluación de políticas de agentes en producción: al ser un modelo de decisión calibrada, puede emplearse como árbitro que puntúa las acciones propuestas por un agente mayor y descarta las de baja confianza antes de ejecutarlas.
- Enrutamiento y selección en pipelines RAG: usar el modelo como clasificador de decisión para elegir entre varias fuentes de recuperación o herramientas, aprovechando su baja latencia (cuantización Q4_K_S de 0,7 GB).
- Análisis de grabaciones de vídeo en local: con el proyector mmproj y una cuantización Q5_K_M (0,9 GB), puede desplegarse en portátiles para tareas de clasificación o decisión sobre secuencias de vídeo sin enviar datos a la nube.
- Prototipado rápido en CPU: las cuantizaciones Q2_K y Q3_K_S (0,6 GB) permiten ejecutar el modelo en llama.cpp sobre CPU, útil para validar ideas de agentes antes de invertir en infraestructura.
- Investigación en calibración de modelos: al estar publicado con licencia Apache 2.0 y pesos abiertos, sirve como banco de pruebas para estudiar cómo se comporta la calibración de decisiones en modelos de menos de 1B parámetros.
- Integración en asistentes de escritorio: un agente local que observe la pantalla y decida acciones puntuales puede beneficiarse de un modelo que cabe en 1 GB de VRAM y no requiere conexión externa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,7-1,0 GB con cuantizaciones Q4_K_S o Q4_K_M; alrededor de 1,5 GB con Q8_0; unos 2,5 GB con f16. Añadir 0,2-0,3 GB si se usa el proyector multimodal mmproj.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente; tarjetas como RTX 3060, RTX 4060, RTX 4090 o superiores ofrecen margen de sobra. También funciona en GPUs integradas y en CPU.
- Cabe en GPU de consumo: sí, en prácticamente todas las GPU de consumo de los últimos ocho años, e incluso en dispositivos con poca memoria.
- Opciones de despliegue: llama.cpp (formato GGUF nativo), Ollama, LM Studio, y servidores compatibles con la API de endpoints de Hugging Face. Para el modelo base en safetensors, transformers con aceleración por hardware.
- Latencia y throughput estimados: no disponibles en la información proporcionada; por el tamaño, se espera una latencia muy baja en GPU y aceptable en CPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Licencia | Formato |
|---|---|---|---|---|---|
| OneJev-0.8B (este) | ~1,0B | no disponible | Sí (imagen/vídeo) | Apache 2.0 | GGUF, safetensors |
| Qwen2.5-0.5B / 1.5B | 0,5B / 1,5B | 32K (Qwen2.5) | No | Apache 2.0 | GGUF, safetensors |
| SmolVLM-500M / 2B | 0,5B / 2B | no disponible | Sí (imagen) | Apache 2.0 | GGUF, safetensors |
| Llama 3.2 1B | 1,2B | 128K | No | Llama 3.2 Community | GGUF, safetensors |

La comparación es aproximada: OneJev se posiciona como modelo de decisión multimodal, mientras que los alternativas citadas son modelos generalistas de texto o visión. No hay datos de rendimiento comparables publicados para OneJev, por lo que la elección entre estos modelos debe basarse en la tarea concreta y en validación empírica propia.

## Limitaciones y advertencias

- Idiomas: el modelo solo declara soporte de inglés; su uso en castellano u otros idiomas no está garantizado y probablemente degrade la calidad.
- Documentación escasa: no hay información pública sobre arquitectura, contexto, datos de entrenamiento ni evaluación, lo que dificulta estimar su comportamiento en producción.
- Riesgo de alucinación: inherente a los modelos generativos; en un modelo de decisión el riesgo se traduce en decisiones erróneas con alta confianza, especialmente peligroso en agentes que actúan sobre interfaces reales.
- Sesgos: no se han publicado análisis de sesgos; el dataset OmniJev/OneJev-Data no está descrito en detalle.
- Licencia: Apache 2.0 permite uso comercial y modificación, pero conviene verificar las condiciones del modelo base original y de los datos de entrenamiento, que no se detallan.
- Cuantizaciones de baja calidad: Q2_K y Q3_K_S pueden degradar notablemente la calibración, que es precisamente la capacidad central del modelo; para producción se recomienda Q4_K_M o superior.
- Contexto desconocido: sin la longitud de contexto publicada, no se puede planificar su uso en conversaciones largas o vídeos extensos.
- Madurez: el repositorio tiene muy pocas descargas y likes, y fue creado recientemente; no hay evidencia de uso en producción ni comunidad establecida.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/OneJev-0.8B-GGUF
- Modelo base: https://huggingface.co/OmniJev/OneJev-0.8B
- Dataset de entrenamiento: https://huggingface.co/datasets/OmniJev/OneJev-Data
- Página de descargas del cuantizador: https://hf.tst.eu/model#OneJev-0.8B-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de cuantización de mradermacher: https://huggingface.co/mradermacher/model_requests
- Análisis de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
