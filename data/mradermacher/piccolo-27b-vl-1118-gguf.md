# mradermacher/Piccolo-27B-VL-1118-GGUF

## Resumen

Piccolo-27B-VL-1118-GGUF es la versión cuantizada en formato GGUF del modelo multimodal Piccolo-27B-VL-1118, desarrollado originalmente por agentscope-ai. Se trata de un modelo de lenguaje y visión de aproximadamente 27.300 millones de parámetros (27.320.697.856 exactos según los pesos en safetensors), pensado para tareas conversacionales que combinan texto e imagen. La cuantización la firma mradermacher, un conocido publicador de versiones GGUF de modelos open source, lo que facilita su ejecución en entornos con llama.cpp y herramientas compatibles.

El modelo base pertenece a la familia Piccolo de agentscope-ai y sigue una licencia Apache 2.0, lo que permite uso comercial sin restricciones adicionales significativas. Esta versión GGUF incluye tanto los pesos del modelo de lenguaje en distintos niveles de cuantización (desde Q2_K hasta Q8_0) como los ficheros mmproj necesarios para el procesamiento multimodal (proyector de visión), lo que la hace directamente utilizable en pipelines de inferencia locales.

Su relevancia actual radica en que permite desplegar un modelo multimodal de ~27B en hardware de consumo o en servidores modestos, algo impensable con los pesos completos en precisión nativa. La disponibilidad de múltiples niveles de cuantización (Q2 a Q8) ofrece un equilibrio ajustable entre calidad y requisitos de memoria, y el soporte de mmproj habilita casos de uso de visión por computador sin depender de APIs externas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo multimodal texto+visión; detalles del transformer no especificados) |
| Parametros totales | 27.320.697.856 (~27,3B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, mmproj-Q8_0, mmproj-f16 |
| Idiomas soportados | inglés (según la model card: `language: en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizado); modelo base en safetensors |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo base Piccolo-27B-VL-1118 en la documentación proporcionada. Por el nombre y las capacidades declaradas (VL, vision-language), se trata de un modelo multimodal que combina un codificador de visión con un modelo de lenguaje de ~27B parámetros. La presencia de ficheros `mmproj` (multi-modal projector) confirma que el modelo requiere un proyector separado para alinear representaciones visuales con el espacio de embeddings del lenguaje, un patrón habitual en arquitecturas tipo LLaVA o similares.

Tampoco se especifican en la información disponible los datos de entrenamiento (número de tokens, composición del dataset) ni si se aplicaron técnicas de RLHF, DPO u otras fases de alineamiento. La model card del cuantizador se limita a indicar que se trata de cuantizaciones estáticas del modelo original de agentscope-ai, sin aportar detalles sobre el proceso de entrenamiento. No se han publicado innovaciones técnicas destacables (decodificación especulativa, atención lineal, etc.) en la documentación consultada.

## Capacidades

- Generación de texto conversacional multi-turno, orientada a diálogo (tag `conversational`).
- Procesamiento de imágenes en combinación con texto (modelo vision-language), gracias a los ficheros mmproj incluidos.
- Comprensión de instrucciones en inglés (único idioma declarado).
- Inferencia local mediante llama.cpp y herramientas compatibles con GGUF.
- Compatibilidad con endpoints (tag `endpoints_compatible`).
- Capacidades de tool calling, function calling, agentes o razonamiento multi-paso: no disponibles en la información proporcionada.
- Capacidades de audio: no disponibles.
- Modo "thinking" explícito: no disponible.

## Casos de uso

- **Asistente conversacional local con soporte de imágenes**: el modelo puede mantener diálogos multi-turno respondiendo a preguntas sobre imágenes adjuntas (por ejemplo, descripción de capturas, análisis de diagramas), ejecutándose en local con llama.cpp y los ficheros mmproj. Adecuado por su naturaleza VL y su licencia permisiva.
- **Análisis de documentos escaneados en entornos con requisitos de privacidad**: al poder desplegarse on-premise con cuantizaciones Q4_K_M (~17 GB), permite procesar facturas, formularios o capturas sin enviar datos a servicios externos.
- **Prototipado rápido de aplicaciones multimodal en hardware de consumo**: con la cuantización Q4_K_S (~15,9 GB) cabe en GPUs de 24 GB (RTX 3090/4090) o incluso en configuraciones con offloading a RAM, lo que facilita el desarrollo sin infraestructura dedicada.
- **Generación de descripciones automáticas de imágenes para catálogos o accesibilidad**: el modelo puede generar texto descriptivo a partir de imágenes, integrándose en pipelines de preprocesado por lotes mediante llama.cpp.
- **Chatbot de soporte técnico con contexto visual**: útil para escenarios donde el usuario adjunta capturas de pantalla de errores y el modelo debe interpretarlas y responder; el contexto conversacional permite iterar sobre la misma imagen.
- **Evaluación comparativa de cuantizaciones en investigación**: los múltiples niveles (Q2 a Q8) permiten estudiar el impacto de la cuantización en tareas vision-language, un caso de uso académico habitual con modelos GGUF.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- **VRAM estimada para inferencia** (solo pesos, sin contar KV cache ni overhead):
  - Q2_K: ~11,3 GB
  - Q3_K_M: ~13,8 GB
  - Q4_K_S: ~15,9 GB
  - Q4_K_M: ~17,1 GB
  - Q5_K_M: ~19,7 GB
  - Q6_K: ~22,5 GB
  - Q8_0: ~29,1 GB
  - mmproj adicional: 0,7 GB (Q8_0) o 1,0 GB (f16)
- **GPU recomendadas**: para Q4_K_M en su totalidad, una RTX 4090 (24 GB) o A100/H100 en entornos de servidor; para Q8_0 se requiere al menos 32 GB de VRAM (A100 40 GB, H100, o RTX 5090 si estuviera disponible).
- **¿Cabe en consumer GPU?**: sí, las cuantizaciones Q2 a Q5 caben en GPUs de 16-24 GB (RTX 4080, 4090, 3090). Las cuantizaciones Q6 y Q8 requieren GPUs de gama profesional o configuraciones multi-GPU.
- **Opciones de despliegue**: llama.cpp, Ollama (previa importación del GGUF), y cualquier runtime compatible con GGUF (koboldcpp, LM Studio). Para el modelo base en safetensors, vLLM o TGI si se confirma soporte multimodal.
- **Latencia y throughput**: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Piccolo-27B-VL-1118 (esta ficha) | ~27,3B | no disponible | Apache 2.0 | GGUF / safetensors | Multimodal texto+visión, cuantizaciones Q2-Q8 |
| Qwen2.5-VL-32B | ~32B | no disponible en esta ficha | Apache 2.0 (según versión) | safetensors / GGUF | Multimodal, familia ampliamente adoptada |
| InternVL2.5-26B | ~26B | no disponible en esta ficha | MIT (según versión) | safetensors / GGUF | Multimodal, comparable en tamaño |
| Gemma 3 27B (multimodal) | ~27B | no disponible en esta ficha | Gemma license | safetensors / GGUF | Multimodal, licencia más restrictiva |

Nota: los datos de los modelos comparativos no provienen de la información proporcionada en esta ficha y deben verificarse en sus respectivas model cards. La comparativa se ofrece a modo orientativo por categoría y tamaño.

## Limitaciones y advertencias

- **Idioma**: la model card solo declara inglés (`language: en`); el rendimiento en castellano u otros idiomas no está garantizado y probablemente sea inferior.
- **Riesgo de alucinación**: inherente a los modelos generativos de este tamaño; no se han publicado evaluaciones específicas de fidelidad.
- **Cuantización**: las versiones Q2_K y Q3 degradan notablemente la calidad; el propio cuantizador marca Q3_K_M como "lower quality". Para producción se recomienda Q4_K_M o superior.
- **Modelo multimodal**: la calidad del procesamiento de imágenes depende del fichero mmproj; usar mmproj-f16 si la precisión visual es crítica.
- **Licencia**: Apache 2.0 permite uso comercial, pero conviene revisar la model card del modelo base (agentscope-ai/Piccolo-27B-VL-1118) por si hubiera condiciones adicionales no reflejadas en la versión GGUF.
- **Falta de documentación**: no se dispone de información sobre contexto máximo, sesgos conocidos, datos de entrenamiento ni evaluaciones de seguridad; esto dificulta su adopción en entornos regulados.
- **Madurez**: el repositorio tiene pocas descargas (508) y cero likes en el momento de la consulta, lo que sugiere una adopción limitada y poca validación comunitaria.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Piccolo-27B-VL-1118-GGUF
- Modelo base: https://huggingface.co/agentscope-ai/Piccolo-27B-VL-1118
- Página de descargas del cuantizador: https://hf.tst.eu/model#Piccolo-27B-VL-1118-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Análisis de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantización (mradermacher): https://huggingface.co/mradermacher/model_requests
