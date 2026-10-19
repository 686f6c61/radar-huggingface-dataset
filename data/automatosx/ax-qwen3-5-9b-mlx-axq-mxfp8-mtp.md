# AutomatosX/AX-Qwen3.5-9B-MLX-AXQ-MXFP8-MTP

## Resumen

AX-Qwen3.5-9B-MLX-AXQ-MXFP8-MTP es un artefacto de cuantización publicado por AutomatosX a partir del checkpoint BF16 oficial Qwen/Qwen3.5-9B. No es un modelo entrenado desde cero: aplica AXQuant 2.3.0 para producir pesos MLX de 8 bits en formato MXFP8 group32, con visión, MTP, normalizaciones y cabeza de salida en BF16, y añade un payload MTP separado. Declara 8.953.801.728 parámetros (≈8,95 B) y 11,619 GB en safetensors.

Su interés es práctico: permite probar un Qwen3.5 de ~9B en Apple Silicon con MLX-LM, con un peso de aproximadamente 9,4643 BPW en el modelo principal y 9,6290 BPW incluyendo MTP. También conserva componentes de visión en BF16, aunque el export no los carga con el loader estándar de MLX-VLM. La longitud de contexto, los idiomas y los detalles de arquitectura no se especifican en la información disponible.

El autor lo marca explícitamente como artefacto de desarrollo, sin certificados de calidad, aceptación MTP ni velocidad. Solo hay una prueba acotada de generación de texto en un Mac Studio M2 Ultra; no hay benchmarks amplios ni evaluaciones de imagen, vídeo, uso de herramientas o contexto largo. Por tanto, es relevante para experimentación y auditoría de cuantización, no como sustituto validado del modelo base en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de la familia Qwen3.5 (`model_type=qwen3_5`); no se detallan capas, mecanismo de atención ni contexto |
| Parámetros totales | 8.953.801.728 (≈8,95 B) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | MXFP8 group32 (8 bits) en proyecciones elegibles de atención y MLP del lenguaje y en embeddings; BF16 en visión, MTP, normalizaciones y cabeza de salida. ≈9,4643 BPW principal; ≈9,6290 BPW total con MTP |
| Idiomas soportados | no disponible; no se declara lista de idiomas |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors para MLX; `mtp.safetensors` para el payload MTP; manifiestos JSON (`axquant_manifest.json`, `axquant_compatibility.json`) |

## Arquitectura y entrenamiento

El artefacto parte del checkpoint BF16 de Qwen/Qwen3.5-9B en la revisión inmutable `c202236235762e1c871ad0ccb60c8ee5ba337b9a`. No se entrena ni se aumenta el modelo: AXQuant 2.3.0 reempaqueta los pesos en MLX MXFP8 group32 para las proyecciones de atención y MLP del lenguaje y para los embeddings, mientras que visión, MTP, normalizaciones y cabeza de salida se mantienen en BF16. El plan de cuantización es manual y se basa en priors de arquitectura, no en un método medido de sensibilidad; el propio autor advierte que MXFP8 es un reempaquetado físico no medido y que el nombre del formato no implica que todos los tensores tengan la misma precisión.

No se dispone de datos sobre número de tokens de entrenamiento, composición del dataset, RLHF o DPO, ni sobre innovaciones de atención o decodificación del modelo base. El payload MTP está incluido y protegido, pero su presencia no acredita ejecución, aceptación, exactitud ni aceleración; la ejecución MTP on/off no se ha verificado para este artefacto. El payload BF16 de visión se conserva aparte, protegido y sin indexar, y el loader estándar de MLX-VLM no lo carga.

## Capacidades

- Generación de texto y conversación: verificada en un caso acotado con MLX-LM; el chat template admite `enable_thinking=False`.
- Razonamiento, código, matemáticas y agentes: el modelo base Qwen3.5 está orientado a estas tareas según la documentación de la serie, pero este export no aporta evaluaciones propias; no se puede confirmar su rendimiento.
- Uso de herramientas y function calling: no evaluado; no hay evidencia en la información disponible.
- Razonamiento multi-paso y flujos de agente: no evaluado.
- Capacidades multilingües: no disponibles; no se declara cobertura de idiomas.
- Visión: el checkpoint conserva proyecciones y payload de visión en BF16, pero el loader estándar de MLX-VLM no carga el sidecar protegido y no indexado; no está soportada en este export.
- MTP: payload incluido, pero ejecución, aceptación y aceleración no verificadas.
- Contexto largo: no evaluado; la longitud de contexto no está disponible.
- Modo thinking: el ejemplo usa `enable_thinking=False`; no se detalla el comportamiento con thinking activado en este export.

## Casos de uso

- Prototipado local en Mac Apple Silicon: cargar el repositorio completo con MLX-LM y generar respuestas conversacionales; la prueba acotada en un Mac Studio M2 Ultra confirma que el payload exacto carga y genera texto.
- Evaluación de cuantización MXFP8: comparar este export de ≈9,63 BPW con las variantes de 6 y 4 bits y con el BF16 en pruebas controladas de perplejidad, memoria y latencia; el autor no aporta esos datos, así que el caso consiste precisamente en generarlos.
- Asistente offline para desarrolladores: integrarlo en una herramienta de escritorio o CLI en un Mac con 24-32 GB de memoria unificada para conversación y resolución de dudas sin enviar datos a la nube, asumiendo que no hay garantías de calidad hasta evaluarlo.
- Auditoría de artefactos AXQuant: usar la revisión inmutable y los manifiestos para verificar digests, identidad del modelo fuente y plan de cuantización en un pipeline interno de reproducibilidad.
- Banco de pruebas para MTP: estudiar el sidecar `mtp.safetensors` y medir aceptación y velocidad con MTP activado y desactivado; el artefacto no certifica MTP, por lo que sirve para experimentación, no para producción.
- Regresión de prompts en CI para MLX: ejecutar un conjunto fijo de prompts con `enable_thinking=False` y comparar salidas entre revisiones para detectar roturas de carga o formato, no para afirmar calidad.
- Investigación de cuantización en Apple Silicon: medir BPW real, uso de memoria y latencia de MXFP8 group32 frente a otras precisiones en MLX.
- I+D de empaquetado de visión: el payload BF16 de visión se conserva para una futura exportación explícita a un runtime compatible; hoy no se puede usar con el loader estándar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

| Evidencia de ejecución | Entorno | Resultado |
|---|---|---|
| Generación de texto con MLX-LM | MLX 0.32.1, MLX-LM 0.31.3, Mac Studio M2 Ultra | superada en un caso acotado de carga y generación |
| Visión con MLX-VLM | MLX-VLM 0.6.17 | no soportada por el loader estándar; sidecar protegido y no indexado |
| Ejecución MTP on/off | no verificada | no verificada |
| Evaluaciones amplias de texto, imagen, vídeo, uso de herramientas, contexto largo y calidad | no realizadas | no disponibles |

## Requisitos de hardware

- Plataforma: MLX sobre Apple Silicon; no es un artefacto para CUDA. No se documenta soporte para A100, H100 ni GPU NVIDIA consumer.
- Memoria: los safetensors ocupan 11,619 GB; el consumo real de memoria unificada es superior por el grafo de ejecución, la caché KV y el tokenizador, y no se publica una cifra medida.
- Mac con 16 GB de memoria unificada: muy justo y no garantizado; puede requerir contextos muy cortos y ajustes de runtime.
- Mac con 24 GB: opción prudente para pruebas de texto con contexto moderado; 32 GB o más ofrece margen adicional.
- Equipo probado: Mac Studio M2 Ultra. Cualquier Apple Silicon con memoria suficiente es candidato, pero solo ese equipo está documentado en la evidencia de ejecución.
- Despliegue: MLX-LM 0.31.3 con MLX 0.32.1; MLX-VLM 0.6.17 no carga la visión de este export. vLLM, TGI, llama.cpp y Ollama no están documentados para este artefacto MLX.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No hay datos de benchmarks ni de calidad para ninguno de estos artefactos; la comparación se limita a formato, tamaño y disponibilidad.

| Modelo | Parámetros | Contexto | Cuantización | Peso en disco | Licencia | Notas |
|---|---|---|---|---|---|---|
| AX-Qwen3.5-9B-MLX-AXQ-MXFP8-MTP | ≈8,95 B | no disponible | MXFP8 group32 + BF16 parcial; ≈9,6290 BPW total | 11,619 GB | Apache-2.0 | Artefacto de desarrollo; texto verificado en prueba acotada; visión y MTP no verificados |
| Qwen/Qwen3.5-9B | ≈8,95 B | no disponible | BF16 | no indicado | Apache-2.0 | Modelo fuente; sin datos de contexto ni benchmarks en la información disponible |
| AX-Qwen3.5-9B-MLX-AXQ-6bit-MTP | ≈8,95 B (mismo base) | no disponible | AXQ 6 bits + MTP | no disponible | no disponible | Variante hermana; sin datos de calidad comparativos |
| AX-Qwen3.5-9B-MLX-AXQ-4bit-MTP | ≈8,95 B (mismo base) | no disponible | AXQ 4 bits + MTP | no disponible | no disponible | Variante hermana; sin datos de calidad comparativos |

## Limitaciones y advertencias

- Artefacto de desarrollo: el autor indica que no hay certificados Tier 1, Tier 2, de calidad, de aceptación MTP ni de velocidad.
- Evaluación insuficiente: solo existe una prueba acotada de generación de texto; no se han realizado evaluaciones amplias de texto, imagen, vídeo, uso de herramientas, contexto largo o calidad de tarea.
- Visión no utilizable con el loader estándar: el sidecar de visión está protegido y no indexado, y MLX-VLM 0.6.17 no lo carga; el payload BF16 se conserva para una futura exportación explícita.
- MTP no verificado: la presencia de `mtp.safetensors` no demuestra ejecución, aceptación, exactitud ni aceleración; no se ha comprobado MTP on/off.
- Compatibilidad limitada: los perfiles oMLX/MTPLX no soportados siguen sin soporte; la publicación no acredita compatibilidad de runtime ni qualificación nativa de AX Engine.
- Contexto e idiomas desconocidos: no se declara longitud de contexto ni lista de idiomas, y no hay evaluaciones de contexto largo o multilingües.
- Riesgo de alucinación y sesgos: no evaluado en este export; se heredan los del modelo base y no se han medido.
- Posible degradación por cuantización: MXFP8 no se ha validado con un método medido de sensibilidad; la pérdida de calidad frente a BF16 no está cuantificada.
- Licencia Apache-2.0: permite uso comercial, pero deben conservarse `LICENSE` y `NOTICE`; el autor no ofrece garantías.
- Dependencia de Apple Silicon: el formato MLX no es portable directamente a CUDA ni a otros runtimes sin conversión adicional, que no está documentada.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/AutomatosX/AX-Qwen3.5-9B-MLX-AXQ-MXFP8-MTP)
- [Modelo base Qwen/Qwen3.5-9B](https://huggingface.co/Qwen/Qwen3.5-9B)
- [Revisión inmutable del modelo fuente](https://huggingface.co/Qwen/Qwen3.5-9B/tree/c202236235762e1c871ad0ccb60c8ee5ba337b9a)
- [Colección AX BI](https://huggingface.co/collections/AutomatosX/ax-bi-6ad54be40f8f1d5415a8d15a)
- [Colección AX Work](https://huggingface.co/collections/AutomatosX/ax-work-6ad54c25c37f597f21344945)
- [Repositorio ax-engine en GitHub](https://github.com/defai-digital/ax-engine)
- [Repositorio Qwen3.5 en GitHub](https://github.com/ABDtmx/Qwen3.5)
- [Variante AXQ 6bit-MTP](https://huggingface.co/AutomatosX/AX-Qwen3.5-9B-MLX-AXQ-6bit-MTP)
- [Variante AXQ 4bit-MTP](https://huggingface.co/AutomatosX/AX-Qwen3.5-9B-MLX-4bit-MTP)
- [Ficha de terceros en Essa](https://essamamdani.com/ai-models/hf-automatosx-ax-qwen3-5-9b-mlx-axq-6bit-mtp)
