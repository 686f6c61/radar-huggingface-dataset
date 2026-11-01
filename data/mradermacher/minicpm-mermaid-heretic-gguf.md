# mradermacher/minicpm-mermaid-heretic-GGUF

## Resumen

MiniCPM-V 4.7 1B Mermaid Heretic es un modelo vision-language de aproximadamente 1.006 millones de parámetros (1B) derivado de la familia MiniCPM-V y especializado en la generación de diagramas Mermaid a partir de entradas visuales. El modelo original fue publicado por el usuario Lucasgitguy-co bajo el identificador `Lucasgitguy-co/minicpm-mermaid-heretic`, y esta ficha corresponde a la versión cuantizada en formato GGUF producida por mradermacher, un conocido distribuidor de cuantizaciones para llama.cpp y ecosistemas compatibles.

La relevancia de esta publicación radica en dos factores. Por un lado, empaqueta un modelo multimodal de apenas 1B de parámetros en cuantizaciones que van desde 0,6 GB (Q2_K) hasta 2,1 GB (f16), lo que permite ejecutarlo en hardware muy modesto, incluidas GPU de consumo con poca VRAM o incluso CPU. Por otro, el sufijo "heretic" indica que se trata de una variante descensurada (abliterated o con capas de rechazo modificadas), orientada a reducir los comportamientos de negativa del modelo base.

El modelo está publicado con licencia Apache 2.0, declara únicamente el idioma inglés y está etiquetado como conversacional y compatible con endpoints. La información pública disponible es escasa: no se documentan detalles de entrenamiento, ventana de contexto ni resultados de benchmarks, por lo que esta ficha refleja exclusivamente lo que puede verificarse a partir de los metadatos y la model card del repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer vision-language (familia MiniCPM-V); detalles internos no disponibles |
| Parametros totales | 1.006.209.856 (aprox. 1B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16; además mmproj-Q8_0 y mmproj-f16 para el proyector multimodal |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones estáticas); el modelo base en safetensors |
| Tamano del repositorio | 11,5 GB (incluye todas las cuantizaciones) |
| Cuantizacion mas pequena | Q2_K, 0,6 GB |
| Cuantizacion mas grande | f16, 2,1 GB |
| Proyector multimodal | mmproj-Q8_0 (0,8 GB) y mmproj-f16 (1,2 GB) |
| Compatibilidad | endpoints_compatible, transformers, llama.cpp |

## Arquitectura y entrenamiento

El modelo pertenece a la familia MiniCPM-V, una línea de modelos vision-language compactos. Al tratarse de una cuantización GGUF, la arquitectura subyacente es la del modelo base `Lucasgitguy-co/minicpm-mermaid-heretic`, del cual no se aportan detalles sobre número de capas, dimensión oculta, mecanismo de atención ni estrategia de fusión visual. El tamaño de 1B de parámetros sugiere un modelo compacto, probablemente con un codificador visual ligero y un decoder de lenguaje de pequeño tamaño, aunque esta afirmación no puede confirmarse con la información disponible.

Respecto al entrenamiento, no se documenta el número de tokens, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO o ajuste supervisado. El nombre "mermaid" indica una especialización en la generación de diagramas Mermaid, presumiblemente mediante fine-tuning sobre pares imagen-diagrama o texto-diagrama, pero no se detalla el proceso. El término "heretic" hace referencia a la técnica de ablación de direcciones de rechazo (refusal ablation), que modifica los pesos para reducir la tendencia del modelo a negarse a responder; tampoco se especifica qué método concreto se empleó.

La cuantización fue realizada por mradermacher con `quantize_version: 2` y `output_tensor_quantised: 1`, empleando cuantizaciones estáticas. No se han publicado cuantizaciones ponderadas (imatrix) para este modelo, según indica la propia model card.

## Capacidades

- Generación de diagramas Mermaid: capacidad principal del modelo, orientada a producir código Mermaid a partir de descripciones o entradas visuales.
- Procesamiento de imágenes: al ser un modelo vision-language, acepta entradas visuales mediante el proyector multimodal (mmproj).
- Conversación multi-turno: etiquetado como `conversational`, admite diálogo.
- Generación de texto en inglés: el único idioma declarado es el inglés.
- Capacidades de rechazo reducidas: la variante "heretic" modifica el comportamiento de negativa del modelo base.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según los metadatos.
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Generación automática de diagramas de flujo: a partir de una descripción textual o una imagen de un proceso, el modelo puede producir código Mermaid listo para insertar en documentación técnica, wikis o repositorios. Su tamaño de 1B permite ejecutarlo localmente sin depender de APIs externas.
- Documentación técnica asistida: integrado en un pipeline de documentación, puede convertir bocetos o capturas de pizarras en diagramas Mermaid versionables junto al código, lo que facilita el mantenimiento de diagramas actualizados.
- Prototipado en entornos con hardware limitado: con cuantizaciones de 0,6 a 0,9 GB, el modelo cabe en portátiles y equipos sin GPU dedicada, lo que permite probar flujos multimodales sin infraestructura de servidor.
- Herramienta educativa para Mermaid: dado que el modelo está especializado en este lenguaje de diagramación, puede usarse como asistente para enseñar sintaxis Mermaid, corrigiendo o transformando diagramas existentes.
- Automatización de diagramas en CI/CD: mediante llama.cpp o servidores compatibles con la API de OpenAI (`endpoints_compatible`), puede desplegarse como servicio interno que genere diagramas a partir de issues o descripciones en pull requests.
- Experimentación con modelos descensurados: la variante "heretic" resulta útil en investigación sobre alineación y comportamiento de rechazo, permitiendo comparar respuestas frente al modelo base original.
- Extracción de estructura visual: al ser vision-language, puede analizar capturas de diagramas existentes y regenerarlos en formato Mermaid editable, útil para migrar documentación heredada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,6-0,8 GB con Q2_K a Q4_K_M; alrededor de 1,2 GB con Q8_0; unos 2,1 GB con f16. A esto hay que sumar el proyector multimodal (0,8 GB con mmproj-Q8_0 o 1,2 GB con mmproj-f16) si se procesan imágenes.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM efectiva puede ejecutar las cuantizaciones pequeñas; tarjetas como RTX 3060, RTX 4060, RTX 4090 o superiores no suponen ningún problema. También es viable en Apple Silicon con memoria unificada.
- Cabe en GPU de consumo: sí, en prácticamente todas las GPU de consumo modernas, e incluso en CPU gracias a las cuantizaciones de menos de 1 GB.
- Opciones de despliegue: llama.cpp, Ollama, servidores compatibles con la API de OpenAI (el repo está etiquetado como `endpoints_compatible`), y transformers para el modelo base en safetensors.
- Latencia y throughput: no disponibles; al ser un modelo de 1B, se espera una latencia baja en hardware moderno, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| MiniCPM-V 4.7 1B Mermaid Heretic (esta ficha) | ~1B | no disponible | Apache 2.0 | GGUF | Especializado en Mermaid, variante heretic |
| MiniCPM-V 2.6 (OpenBMB) | ~8B | 180K (según documentación pública del modelo original) | Apache 2.0 | safetensors, GGUF | Modelo vision-language generalista de la misma familia, mucho mayor |
| Qwen2-VL-2B (Alibaba) | ~2B | 32K nativo, extensible | Apache 2.0 | safetensors, GGUF | Vision-language generalista, no especializado en diagramas |
| SmolVLM-500M (Hugging Face) | ~0,5B | no disponible | Apache 2.0 | safetensors, GGUF | Modelo vision-language muy compacto, orientado a eficiencia |

La comparación con alternativas es aproximada: no se dispone de benchmarks del modelo de esta ficha que permitan contrastar calidad frente a estos modelos.

## Limitaciones y advertencias

- Idiomas: solo se declara inglés; el rendimiento en castellano no está garantizado y probablemente sea deficiente.
- Contexto: no se documenta la longitud de contexto, lo que impide planificar conversaciones largas o documentos extensos con garantías.
- Alucinación: al ser un modelo de 1B, la tasa de errores factuales y de sintaxis Mermaid inválida puede ser elevada; conviene validar la salida con un parser de Mermaid.
- Variante "heretic": la ablación de rechazo puede aumentar la probabilidad de respuestas inapropiadas o de omitir advertencias de seguridad; no es recomendable para aplicaciones orientadas al público sin filtros adicionales.
- Licencia: Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base original y de los datos de entrenamiento, no documentadas.
- Especialización estrecha: el fine-tuning en Mermaid puede degradar capacidades generales de conversación o de descripción de imágenes.
- Cuantizaciones estáticas: no hay versiones imatrix o ponderadas, lo que puede suponer una pérdida de calidad algo mayor en las cuantizaciones bajas (Q2_K, Q3_K_S).
- Documentación escasa: sin benchmarks, sin ficha de datos ni detalles de entrenamiento, la evaluación rigurosa del modelo requiere pruebas propias.
- Repositorio: 0 likes y ~800 descargas en el momento de la consulta, lo que indica una adopción limitada y poca validación comunitaria.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/minicpm-mermaid-heretic-GGUF
- Modelo base: https://huggingface.co/Lucasgitguy-co/minicpm-mermaid-heretic
- Página de descargas del cuantizador: https://hf.tst.eu/model#minicpm-mermaid-heretic-GGUF
- FAQ y solicitudes de cuantización de mradermacher: https://huggingface.co/mradermacher/model_requests
- Guía de uso de GGUF (referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Notas sobre tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
