# mradermacher/NIx1.2-GGUF

## Resumen

NIx1.2-GGUF es la versión cuantizada en formato GGUF del modelo ray0rf1re/NIx1.2, publicada por mradermacher, un conocido creador de cuantizaciones para la comunidad de inferencia local. El modelo base es un transformer de aproximadamente 3.090 millones de parámetros (3,1B) orientado a conversación en inglés, según los metadatos disponibles en Hugging Face. Esta versión GGUF permite ejecutar el modelo en hardware de consumo mediante llama.cpp y herramientas compatibles, algo inviable con los pesos originales en precisión completa.

La relevancia de esta ficha radica en que el modelo base apenas cuenta con documentación pública: no se dispone de información sobre arquitectura interna, datos de entrenamiento, benchmarks ni licencia. La model card del repositorio cuantizado se limita a listar los ficheros GGUF generados y a remitir al modelo original. Por tanto, esta ficha documenta con rigor lo que se sabe y marca explícitamente como "no disponible" todo aquello que no puede verificarse.

El modelo está etiquetado como conversacional y compatible con endpoints, lo que sugiere un uso previsto de chat e integración en APIs. Con 156 descargas y sin likes, se trata de una publicación de nicho, probablemente experimental o de un autor individual, sin el respaldo de un laboratorio consolidado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (deducido del uso de transformers y safetensors; detalles internos no disponibles) |
| Parámetros totales | 3.085.938.688 (≈3,1B) |
| Parámetros activos | No aplica (no es MoE según la información disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | Inglés (en) |
| Licencia | No disponible |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

No se dispone de información publicada sobre la arquitectura interna del modelo base ray0rf1re/NIx1.2 más allá de que se trata de un transformer de 3,1B parámetros. El recuento de parámetros proviene de los metadatos de safetensors del modelo original. No hay datos sobre número de capas, dimensión oculta, mecanismo de atención (estándar, GQA, atención lineal), tipo de normalización ni activaciones.

Tampoco se conocen los detalles del entrenamiento: número de tokens, composición del dataset, si hubo fases de ajuste fino supervisado, RLHF o DPO, ni innovaciones técnicas destacables. La model card del repositorio cuantizado no incluye ninguna sección sobre arquitectura o entrenamiento, y se limita a describir el proceso de cuantización estática realizado por mradermacher. Las cuantizaciones con imatrix (weighted/imatrix quants) no estaban disponibles en el momento de la publicación según la propia model card.

## Capacidades

- Generación de texto conversacional en inglés, según la etiqueta "conversational" del repositorio.
- Compatibilidad con endpoints (tag "endpoints_compatible"), lo que indica que puede desplegarse detrás de APIs compatibles con el formato de Hugging Face.
- Inferencia local mediante llama.cpp y derivados gracias al formato GGUF.
- El resto de capacidades (razonamiento, código, matemáticas, tool calling, agentes, multilingüismo, visión, audio, modo thinking) no están documentadas y no pueden confirmarse con la información disponible.

## Casos de uso

- Chat local en hardware de consumo: con cuantizaciones Q4_K_M (2,0 GB) o Q5_K_M (2,3 GB), el modelo puede ejecutarse en portátiles con GPU integrada o en CPU, ofreciendo un asistente conversacional en inglés sin conexión.
- Prototipado rápido de aplicaciones de chat: al ser un modelo pequeño, permite iterar sobre prompts y flujos conversacionales con baja latencia antes de migrar a modelos mayores.
- Despliegue en entornos con recursos limitados: su tamaño (1,4 GB en Q2_K) lo hace apto para dispositivos edge, Raspberry Pi de gama alta o contenedores con poca memoria.
- Pruebas de integración con llama.cpp y servidores compatibles OpenAI: útil para validar pipelines de inferencia y herramientas de orquestación antes de usar modelos de producción.
- Evaluación comparativa de cuantizaciones: el repositorio ofrece doce variantes, lo que permite medir el impacto de la cuantización en calidad y velocidad sobre un mismo modelo base.
- Fines educativos y de investigación sobre cuantización: sirve como caso de estudio de cómo mradermacher genera cuantizaciones estáticas y de la diferencia entre quants IQ y K.
- Filtrado o clasificación de texto en inglés: con ajuste fino adicional podría emplearse en tareas de clasificación, aunque no está documentado que el modelo base esté entrenado para ello.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,5 GB para Q2_K, 2,5 GB para Q4_K_M, 3 GB para Q6_K y 4 GB para Q8_0, incluyendo overhead de contexto.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM (GTX 1650, RTX 3050, RTX 4060) para cuantizaciones Q4–Q8; para f16 se necesitan unos 7 GB (RTX 3060 12 GB, RTX 4070).
- Cabe en GPU de consumo: sí, en prácticamente todas las GPU dedicadas modernas e incluso en muchas integradas con cuantizaciones bajas.
- Opciones de despliegue: llama.cpp, Ollama (previa importación del GGUF), LM Studio, text-generation-webui, y servidores compatibles con la API de llama.cpp. Para el modelo base en safetensors: transformers, vLLM o TGI (sujeto a que la arquitectura sea soportada, lo cual no está confirmado).
- Latencia y throughput: no disponibles. Por el tamaño (3,1B) se espera un throughput alto en GPU de consumo, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| NIx1.2 (este) | 3,1B | No disponible | No disponible | GGUF, safetensors | Modelo de nicho, documentación mínima |
| Qwen2.5-3B | 3,1B | 32K (128K en algunas variantes) | Apache 2.0 (mayoría) | safetensors, GGUF | Ampliamente documentado, multilingüe |
| Llama 3.2 3B | 3,2B | 128K | Llama 3.2 Community License | safetensors, GGUF | Ecosistema amplio, tool calling |
| Phi-3.5-mini | 3,8B | 128K | MIT | safetensors, GGUF | Buen rendimiento en razonamiento |

La comparación se ofrece a título orientativo por tamaño; no se dispone de datos de rendimiento de NIx1.2 que permitan una comparación cuantitativa. Los tres modelos alternativos cuentan con documentación completa, licencias claras y benchmarks publicados, ventajas significativas frente a NIx1.2 para uso en producción.

## Limitaciones y advertencias

- Ausencia total de documentación sobre el modelo base: no se conocen datos de entrenamiento, sesgos, alineación ni evaluación de seguridad.
- Licencia no disponible: no puede confirmarse si el uso comercial está permitido; se recomienda contactar con el autor antes de cualquier despliegue productivo.
- Solo inglés: no hay soporte multilingüe documentado, lo que limita su uso en castellano u otros idiomas.
- Riesgo de alucinación: al no haber información sobre el ajuste (RLHF/DPO), no puede evaluarse el grado de alineación ni la fiabilidad factual.
- Contexto desconocido: sin dato de longitud de contexto, no es posible planificar casos de uso con documentos largos o conversaciones multi-turno extensas.
- Modelo de nicho con muy poca tracción (156 descargas, 0 likes): no hay comunidad, issues ni soporte que permitan resolver problemas.
- Las cuantizaciones son estáticas y sin imatrix según la model card, lo que puede implicar mayor pérdida de calidad en bits bajos (Q2_K, Q3_K) frente a alternativas con imatrix.
- No hay garantía de que la arquitectura del modelo base sea compatible con vLLM o TGI; el uso recomendado es llama.cpp con GGUF.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/NIx1.2-GGUF
- Modelo base: https://huggingface.co/ray0rf1re/NIx1.2
- Página de descargas del cuantizador: https://hf.tst.eu/model#NIx1.2-GGUF
- README de referencia sobre uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de cuantización de mradermacher: https://huggingface.co/mradermacher/model_requests
- Comparativa de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
