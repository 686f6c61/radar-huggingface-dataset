# shloksutar/fraud-detector

## Resumen

`fraud-detector` es un ajuste fino supervisado (SFT) del modelo Qwen2.5-1.5B-Instruct, publicado por el usuario `shloksutar`. El repositorio se generó con la librería TRL (1.16.0) sobre Transformers 5.20.1 y PyTorch 2.11.0, y los pesos se distribuyen en formato `safetensors`. El nombre apunta a un uso orientado a la detección de fraude, pero la model card no documenta el conjunto de datos de entrenamiento, el dominio, el formato de las etiquetas ni ninguna evaluación, por lo que la finalidad real del ajuste no puede verificarse.

Técnicamente hereda la arquitectura del modelo base: un transformer decoder-only de aproximadamente 1.540 millones de parámetros, con atención de consultas agrupadas (GQA) y una ventana de contexto nativa de 32.768 tokens. El entrenamiento se hizo con SFT mediante TRL, sin que se detallen hiperparámetros, número de pasos, composición del dataset ni si hubo etapas posteriores de preferencias (DPO/RLHF).

Su relevancia es doble: por un lado, es un ejemplo reproducible de pipeline de ajuste con TRL sobre un modelo pequeño que cabe en GPU de consumo; por otro, el repositorio presenta inconsistencias (0,1 GB de tamaño frente a los ~3 GB esperables en BF16, licencia sin definir y ausencia total de métricas) que obligan a tratarlo como material experimental y no como un componente listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo Qwen2, con GQA y RoPE (heredada del modelo base; no se detalla en la model card) |
| Parametros totales | ~1.540 millones (heredado de Qwen2.5-1.5B-Instruct; no verificado en este repositorio) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 32.768 tokens nativos en el modelo base; no documentado para el ajuste fino |
| Tipos de cuantizacion | No documentados en el repositorio; el modelo base admite cuantizaciones GPTQ/AWQ/GGUF tras conversión |
| Idiomas soportados | No disponible para el ajuste fino; el modelo base declara 29 idiomas |
| Licencia | No disponible (el YAML de la model card contiene el marcador `licence: license`); el modelo base es Apache-2.0 |
| Formato de pesos | `safetensors` (etiqueta del repositorio); tamano del repo: 0,1 GB |
| Modelo base | Qwen/Qwen2.5-1.5B-Instruct |
| Metodo de ajuste | SFT con TRL 1.16.0 |
| Framework declarado | Transformers 5.20.1, PyTorch 2.11.0+cu130, Datasets 5.1.0, Tokenizers 0.23.3 |
| Descargas / likes | 0 / 0 |
| Fechas del repositorio | Creado el 2026-10-22, actualizado el 2026-10-22 |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-1.5B-Instruct, un transformer decoder-only con normalización RMSNorm, activación SwiGLU, embeddings rotatorios (RoPE) y atención de consultas agrupadas, disenado para generación autoregresiva e instrucciones conversacionales. El ajuste se realizó con SFT usando TRL, lo que implica un entrenamiento supervisado sobre pares de prompt y respuesta, presumiblemente en formato de chat, aunque la model card no incluye la plantilla aplicada ni el esquema de las conversaciones.

No hay información sobre el volumen de tokens de ajuste, la composición del dataset, el origen de los datos de fraude, si se aplicó enmascaramiento de pérdida solo en la respuesta, ni sobre hiperparámetros como learning rate, epochs o estrategia de empaquetado. Tampoco se documenta ninguna innovación técnica adicional (decodificación especulativa, atención lineal, destilación) más allá de las que ya incorpora el modelo base. El ejemplo de "quick start" de la model card es una pregunta genérica sobre viajes en el tiempo, no un caso de fraude, lo que refuerza la ausencia de documentación funcional específica.

## Capacidades

- Generación de texto conversacional e instrucciones en formato chat, heredada de Qwen2.5-1.5B-Instruct.
- Razonamiento básico y matemáticas simples, limitadas por el tamano de 1,5B parámetros del modelo base.
- Capacidad multilingüe potencial (el base declara 29 idiomas), sin evidencia de que se conserve tras el ajuste.
- Salida estructurada en JSON y modo de salida restringida: soportados por el modelo base; no verificados tras el SFT.
- Tool calling / function calling: soportado por la familia Qwen2.5-Instruct, pero el ajuste SFT puede haber degradado esta capacidad; no hay evidencia en el repositorio.
- Ventana de contexto de 32.768 tokens heredada, adecuada para documentos largos o historiales extensos.
- Capacidad específica de detección de fraude: no documentada, no evaluada y sin ejemplos de entrada/salida proporcionados por el autor.
- Sin capacidades de visión, audio ni multimodalidad.

## Casos de uso

- **Triaje de alertas de fraude transaccional (experimental)**: el modelo podría recibir la descripción textual de una operación y devolver una etiqueta y una justificación breve. Es adecuado por tamano y coste de inferencia, pero requiere una validación propia con datos etiquetados antes de cualquier uso real, dado que no hay métricas publicadas.
- **Resumen de casos para analistas**: convertir historiales largos de transacciones, notas y correos en un resumen estructurado para revisión humana, aprovechando la ventana de 32K tokens del modelo base.
- **Extracción de entidades en reclamaciones**: obtener campos concretos (importe, comercio, canal, fecha, motivo) en JSON a partir de texto libre de disputas o chargebacks, integrándolo como paso previo a un motor de reglas.
- **Clasificación de correos y SMS de phishing**: etiquetar mensajes sospechosos y generar una explicación del indicador detectado para el usuario final o para el equipo de soporte.
- **Asistente interno de cumplimiento con RAG**: responder preguntas sobre procedimientos internos de prevención de blanqueo de capitales o política de fraude, recuperando fragmentos documentales e insertándolos en el contexto del modelo.
- **Generación de borradores de informes de incidencias**: redactar la narrativa inicial de un caso (cronología, partes implicadas, importe) que luego revisa un analista humano, reduciendo el tiempo de documentación.
- **Banco de pruebas para pipelines SFT**: servir como caso de estudio reproducible de ajuste con TRL sobre un modelo de 1,5B, útil para equipos que quieran montar su propio flujo de fine-tuning con datasets propios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del ajuste fino no incluye métricas de exactitud, precisión, recall, F1, AUC, MMLU, HumanEval ni GSM8K, ni comparaciones con el modelo base. Tampoco se han publicado mediciones de latencia o throughput. Cualquier cifra de rendimiento en tareas de fraude tendría que obtenerse mediante una evaluación propia sobre un conjunto de validación representativo del dominio objetivo.

## Requisitos de hardware

- **VRAM estimada en BF16/FP16**: ~3,1 GB solo para pesos, más caché KV; en la práctica, unos 4-6 GB para contextos moderados.
- **VRAM estimada en INT8**: ~1,6 GB de pesos, aproximadamente 2,5-3 GB en ejecución.
- **VRAM estimada en INT4 (GGUF Q4_K_M)**: ~1,0-1,2 GB de pesos, ejecutable en GPUs de 4 GB o incluso en CPU.
- **GPU recomendadas**: para desarrollo y pruebas, RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090; para servicio concurrente, L4, L40S, A100 o H100 con vLLM.
- **GPU de consumo**: sí, cabe holgadamente en cualquier GPU consumer con 8 GB o más; también en iGPU y CPU mediante llama.cpp con cuantización.
- **Opciones de despliegue**: `transformers` con `pipeline` (como indica la model card), vLLM, TGI, llama.cpp, Ollama y LM Studio tras conversión a GGUF. La etiqueta `endpoints_compatible` sugiere compatibilidad con Hugging Face Inference Endpoints.
- **Latencia y throughput**: no disponibles. Al no haberse publicado mediciones ni existir un `config.json` verificado en esta ficha, no se pueden estimar cifras fiables.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Rendimiento en fraude |
|---|---|---|---|---|---|
| `shloksutar/fraud-detector` | ~1,54B (heredado) | 32.768 (heredado) | No disponible | 0 descargas, repo de 0,1 GB | Sin metricas publicadas |
| Qwen2.5-1.5B-Instruct (base) | ~1,54B | 32.768 nativos (131.072 con YaRN) | Apache-2.0 | Amplia, con GGUF oficiales | No especializado |
| Llama-3.2-1B-Instruct | ~1,24B | 128.000 | Llama 3.2 Community License | Amplia, con restricciones de uso | No especializado |
| SmolLM2-1.7B-Instruct | ~1,71B | 8.192 | Apache-2.0 | Amplia | No especializado |

Los datos de los modelos comparables proceden de sus model cards publicas y no se han verificado en esta ficha. La comparacion de rendimiento en deteccion de fraude no es posible: ninguno de los modelos alternativos esta especializado y el ajuste evaluado no publica metricas, por lo que la unica comparacion objetiva disponible es de parametros, contexto, licencia y disponibilidad.

## Limitaciones y advertencias

- **Ausencia total de evaluacion**: no hay métricas, matriz de confusión ni curva ROC; no se puede afirmar que el modelo detecte fraude mejor que el modelo base sin ajustar.
- **Dataset no documentado**: se desconoce el origen, el volumen y la calidad de los datos de entrenamiento, lo que impide evaluar sesgos y riesgo de sobreajuste a un dominio concreto.
- **Licencia sin definir**: el campo `licence` del YAML contiene el marcador `license`, no una licencia real. Aunque el modelo base es Apache-2.0, la licencia efectiva de este derivado es jurídicamente ambigua; conviene contactar con el autor antes de cualquier uso comercial.
- **Inconsistencia de tamano**: el repositorio ocupa 0,1 GB, muy por debajo de los ~3 GB esperables para 1,5B parámetros en BF16. Podría tratarse de una subida parcial, de un adaptador o de un error de metadatos; debe verificarse antes de descargar y desplegar.
- **Riesgo de alucinacion**: con 1,5B parámetros, el modelo tiende a inventar justificaciones y entidades cuando el texto de entrada es ambiguo; inaceptable como decisor automático en un ámbito con consecuencias económicas.
- **Sesgos del modelo base**: Qwen2.5 arrastra sesgos de su corpus de preentrenamiento (18 billones de tokens según su model card) que el SFT no corrige y puede amplificar si el dataset de fraude es reducido o no representativo.
- **Posible degradacion de capacidades**: el ajuste SFT sobre un dataset estrecho puede haber reducido el soporte de tool calling, el multilingüismo y la calidad conversacional general del modelo base.
- **Idiomas no verificados**: aunque el base soporta 29 idiomas, no hay evidencia de que el ajuste mantenga un rendimiento aceptable fuera del idioma de los datos de entrenamiento, que no se especifica.
- **Cumplimiento normativo**: un sistema de detección de fraude que afecte a personas requiere evaluaciones de impacto, trazabilidad y supervision humana; el RGPD y el Reglamento europeo de IA imponen obligaciones que este repositorio no documenta en absoluto.
- **Metadatos anomalos**: las fechas del repositorio (octubre de 2026) y la ausencia de pipeline declarado complican la trazabilidad del artefacto.
- **Sin garantias de mantenimiento**: 0 descargas y 0 likes indican un repositorio sin adopción ni revisión por la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/shloksutar/fraud-detector
- Modelo base Qwen2.5-1.5B-Instruct: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Repositorio de TRL (framework de entrenamiento): https://github.com/huggingface/trl
- Documentacion de Transformers: https://huggingface.co/docs/transformers

Nota: la busqueda web realizada no devolvio enlaces relevantes sobre este modelo; los resultados obtenidos fueron paginas de soporte de Google (Gmail, YouTube, Authenticator, Chrome) sin relacion con el artefacto. No se han localizado papers, blogs, demos ni repositorios adicionales del autor.
