# mradermacher/mario-html-v2-9B-GGUF

## Resumen

mario-html-v2-9B-GGUF es la versión cuantizada en formato GGUF del modelo wesjos/Qwen3.5-9B-HTML-v2, un ajuste fino especializado en generación de HTML, diseño web y comprensión visual de interfaces. Lo publica mradermacher, un conocido cuantizador de la comunidad que distribuye versiones estáticas de modelos abiertos para su uso con llama.cpp y otros runners compatibles. El modelo resuelve el problema de generar marcado y maquetación web a partir de instrucciones en lenguaje natural o de capturas de pantalla, una tarea en la que los modelos generalistas suelen producir HTML funcional pero visualmente pobre.

El modelo base parte de una arquitectura Qwen3.5 de 9B parámetros (9.197.093.888 parámetros reales según los safetensors), con capacidades multimodales de tipo image-text-to-text, lo que le permite recibir imágenes además de texto. Incorpora rasgos declarados por el autor como zero-system-prompt y cot-purity (cadena de pensamiento limpia), orientados a que el modelo razone sin necesidad de un system prompt extenso y sin filtrar trazas de razonamiento en la salida final. El ajuste se realizó sobre el dataset wesjos/mario-html-sft.

La relevancia actual radica en que ofrece una alternativa de 9B ejecutable en hardware de consumo para tareas de generación de UI y HTML, con licencia Apache 2.0 y cuantizaciones que van desde 4,0 GB (Q2_K) hasta 18,5 GB (f16), más los complementos multimodales mmproj. El repo ocupa 85,1 GB en total y acumula 1.236 descargas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) derivada de Qwen3.5; detalles internos no disponibles |
| Parametros totales | 9.197.093.888 (9,2B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16; mmproj en Q8_0 y f16 |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones estáticas); el modelo base en transformers/safetensors |

## Arquitectura y entrenamiento

El modelo base es wesjos/Qwen3.5-9B-HTML-v2, un ajuste fino de un Qwen3.5 de 9B parámetros. La model card del cuantizador no detalla la arquitectura interna más allá de su naturaleza multimodal (pipeline image-text-to-text) y su compatibilidad con transformers. El entrenamiento se realizó sobre el dataset wesjos/mario-html-sft, orientado a generación de HTML y diseño web. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron fases de RLHF o DPO.

Las innovaciones declaradas en las etiquetas del modelo son zero-system-prompt, que indica que el modelo está preparado para funcionar sin un system prompt largo, y cot-purity, que sugiere que las trazas de razonamiento se mantienen separadas y no contaminan la respuesta final. La versión GGUF es una cuantización estática (quantize_version 2, output_tensor_quantised 1) generada por mradermacher; el autor indica que no tiene previstas cuantizaciones con imatrix/weighted para este modelo salvo petición en la discusión comunitaria.

## Capacidades

- Generación de HTML y maquetación web a partir de instrucciones en lenguaje natural.
- Diseño de UI visual y respuesta a preguntas visuales (visual-question-answering) sobre imágenes de interfaces.
- Entrada multimodal image-text-to-text: acepta imágenes junto con texto.
- Razonamiento con cadena de pensamiento limpia (cot-purity), sin filtrar la traza de razonamiento en la salida.
- Funcionamiento sin system prompt (zero-system-prompt).
- Conversación multi-turno (etiqueta conversational).
- Soporte de inglés y chino.
- Compatibilidad con endpoints (etiqueta endpoints_compatible).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agentes y multi-step reasoning más allá de la cadena de pensamiento: no disponible.

## Casos de uso

- Generación de prototipos de interfaz web: a partir de una descripción textual, el modelo produce HTML y maquetación para validar rápidamente un diseño antes de pasarlo a un equipo de front-end.
- Reconstrucción de UI desde capturas de pantalla: gracias a su entrada image-text-to-text, puede recibir una imagen de una interfaz y generar el marcado correspondiente, útil para migraciones o documentación de diseños existentes.
- Asistencia en editores de código: integrado como autocompletado o chat lateral, genera fragmentos de HTML y estructura de componentes en flujos de desarrollo front-end.
- Generación de plantillas de correo y landing pages: produce HTML autocontenido para campañas o páginas promocionales sin depender de un framework pesado.
- Evaluación visual de interfaces: responde preguntas sobre capturas (visual-question-answering) para auditar jerarquía visual, accesibilidad básica o coherencia de maquetación.
- Despliegue local en estaciones de trabajo: con cuantizaciones Q4_K_M de 5,9 GB puede ejecutarse en GPUs de consumo para tareas de generación de HTML sin enviar datos a la nube.
- Automatización de documentación técnica: genera ejemplos de marcado y fragmentos de página a partir de descripciones para manuales y guías internas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia según cuantización: Q2_K ~4,0 GB; Q3_K_S ~4,5 GB; Q3_K_M ~4,8 GB; Q3_K_L ~5,1 GB; IQ4_XS ~5,5 GB; Q4_K_S ~5,6 GB; Q4_K_M ~5,9 GB; Q5_K_S ~6,6 GB; Q5_K_M ~6,7 GB; Q6_K ~7,7 GB; Q8_0 ~9,9 GB; f16 ~18,5 GB. Añadir ~0,7 GB (mmproj Q8_0) o ~1,0 GB (mmproj f16) si se usa la entrada de imagen.
- GPU recomendadas: para Q4_K_M y Q5_K_M, GPUs de consumo con 8-12 GB de VRAM (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070); para Q8_0 y f16, RTX 4090 (24 GB), A100 o H100.
- Cabe en GPU de consumo: sí, en cuantizaciones Q4_K_M y Q5_K_M con 8 GB o más de VRAM; Q6_K y Q8_0 requieren 10-12 GB.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), Ollama, y runners compatibles con GGUF; el modelo base puede servirse con transformers y, presumiblemente, con vLLM o TGI en su formato original (no confirmado en la información disponible).
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la información proporcionada, por lo que la comparativa cuantitativa no está disponible. A modo de referencia estructural, se puede contrastar con el propio modelo base y con el ecosistema de cuantizaciones:

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| mario-html-v2-9B-GGUF | 9,2B | no disponible | apache-2.0 | GGUF | Cuantizaciones estáticas, multimodal, especializado en HTML |
| wesjos/Qwen3.5-9B-HTML-v2 | 9,2B | no disponible | apache-2.0 | safetensors | Modelo base sin cuantizar |
| Alternativas de 9B especializadas en código/HTML | no disponible | no disponible | no disponible | no disponible | Sin datos en la información disponible |

## Limitaciones y advertencias

- Idiomas limitados a inglés y chino; el rendimiento en castellano no está documentado y probablemente sea inferior.
- No se han publicado benchmarks, por lo que no hay evidencia cuantitativa de calidad frente a alternativas.
- Riesgo de alucinación inherente a los modelos generativos, especialmente en HTML que referencia recursos, clases o APIs inexistentes.
- El ajuste está especializado en HTML y UI; su rendimiento en tareas generales de razonamiento o código no relacionado con web puede degradarse respecto al modelo base.
- Las cuantizaciones de baja calidad (Q2_K, Q3_K_M) pueden afectar negativamente a la fidelidad del HTML generado y a la coherencia del razonamiento.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base y de los datos de entrenamiento.
- El autor del cuantizado no ha generado versiones imatrix/weighted; las cuantizaciones disponibles son estáticas.
- El repositorio ocupa 85,1 GB; descargar solo la cuantización necesaria.
- No se especifica la longitud de contexto soportada, lo que impide planificar tareas de contexto largo con garantías.

## Enlaces

- Hugging Face (GGUF): https://huggingface.co/mradermacher/mario-html-v2-9B-GGUF
- Modelo base: https://huggingface.co/wesjos/Qwen3.5-9B-HTML-v2
- Dataset de ajuste: https://huggingface.co/datasets/wesjos/mario-html-sft
- Página de descargas del cuantizador: https://hf.tst.eu/model#mario-html-v2-9B-GGUF
- FAQ y peticiones de modelos de mradermacher: https://huggingface.co/mradermacher/model_requests
- README de referencia para uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Análisis de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
