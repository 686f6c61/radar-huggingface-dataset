# mradermacher/Qwen3.5-4B-Claude-4.6-OS-Auto-Variable-HERETIC-UNCENSORED-THINKING-GGUF

## Resumen

Qwen3.5-4B-Claude-4.6-OS-Auto-Variable-HERETIC-UNCENSORED-THINKING es un modelo de lenguaje de 4.205.751.296 parámetros (aproximadamente 4,2 mil millones) derivado de la familia Qwen y sometido a un proceso de fine-tuning por DavidAU. La versión aquí descrita es la cuantización GGUF estática realizada por mradermacher, un conocido empaquetador de pesos cuantizados para inferencia local. El modelo se distribuye bajo licencia Apache 2.0 y está etiquetado explícitamente como "heretic", "uncensored" y "abliterated", lo que indica que se ha aplicado una técnica de eliminación o atenuación de las capas de rechazo alineadas del modelo original.

El modelo está orientado a la escritura creativa y de ficción, la generación de tramas y subtramas, la continuación de escenas, el roleplaying y la narración vívida en todos los géneros (ciencia ficción, romance, etc.). Incorpora además un modo de razonamiento ("THINKING") según su nombre, y dispone de un suplemento multimodal (mmproj) que sugiere capacidades de visión. Los idiomas declarados son inglés (en) y chino (zh). Su tamaño compacto lo hace apto para ejecución en hardware de consumo, y la disponibilidad de cuantizaciones desde Q2_K hasta f16 permite ajustar el equilibrio entre calidad y requisitos de memoria.

La relevancia actual del modelo radica en su combinación de tamaño reducido, licencia permisiva y ausencia de filtros de contenido, lo que lo convierte en una opción para entornos de investigación sobre alineación, generación creativa sin restricciones y despliegue local en escenarios donde los modelos alineados rechazan ciertas peticiones. No obstante, esa misma característica implica riesgos importantes que se detallan en la sección de limitaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5, según el nombre del modelo); detalles exactos no disponibles |
| Parametros totales | 4.205.751.296 (aproximadamente 4,2 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16; además mmproj-Q8_0 y mmproj-f16 para el componente multimodal |
| Idiomas soportados | inglés (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones estáticas); el modelo base se distribuye en bfloat16 |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna más allá de su origen en la familia Qwen3.5 y de la indicación de que el modelo base fue entrenado en bfloat16. Se trata, por tanto, de un transformer decoder-only de aproximadamente 4,2 mil millones de parámetros. El nombre del modelo sugiere la incorporación de un modo de razonamiento explícito ("THINKING") y de un mecanismo de "Auto-Variable" cuyo funcionamiento no se especifica en la documentación proporcionada. La referencia a "Claude-4.6-OS" en el nombre apunta a un fine-tuning orientado a imitar estilos de escritura o de asistencia, aunque no se aportan detalles sobre el dataset empleado.

El proceso de entrenamiento incluyó, según las etiquetas, una fase de "abliteration" (eliminación de direcciones de rechazo en el espacio de activaciones) que da lugar a las variantes "heretic" y "uncensored". No se especifican el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO. La cuantización realizada por mradermacher es estática (quantize_version 2, output_tensor_quantised 1) y se ofrece también una variante con cuantización ponderada por imatrix en un repositorio separado.

## Capacidades

- Generación de texto creativo y de ficción en todos los géneros (ciencia ficción, romance, etc.), con énfasis en "vivid prosing" y narración vívida.
- Generación de tramas y subtramas, continuación de escenas y construcción de historias.
- Roleplaying y diálogo multi-turno en contextos narrativos.
- Modo de razonamiento ("THINKING") según el nombre del modelo; su comportamiento exacto no está documentado.
- Capacidades multimodales a través del suplemento mmproj (visión), aunque no se detallan las tareas concretas soportadas.
- Soporte multilingüe limitado a inglés y chino.
- No se documenta soporte de tool calling, function calling ni de agentes multi-paso.
- Ausencia de filtros de rechazo (uncensored/abliterated), lo que permite responder a peticiones que los modelos alineados rechazarían.

## Casos de uso

- Escritura creativa asistida: el modelo puede generar borradores de relatos, capítulos y diálogos con un estilo vívido, gracias a su fine-tuning específico en ficción y a su ventana de contexto (no documentada, pero suficiente para escenas y capítulos medios).
- Generación de tramas y subtramas para guionistas y novelistas: permite explorar variantes argumentales y estructuras narrativas de forma iterativa, aprovechando su entrenamiento en "plot generation" y "sub-plot generation".
- Roleplaying y juegos de rol por texto: su naturaleza uncensored y su orientación conversacional lo hacen adecuado para interacciones de personaje sin las restricciones habituales de los modelos alineados.
- Continuación de escenas en pipelines de escritura: puede integrarse en herramientas de edición para sugerir continuaciones coherentes de un texto existente, manteniendo el tono y el género.
- Investigación sobre alineación y seguridad: al ser una variante abliterated, sirve como caso de estudio para analizar qué comportamientos emergen al eliminar las capas de rechazo y cómo varían con la cuantización.
- Despliegue local en entornos con recursos limitados: con cuantizaciones Q4_K_M (2,8 GB) o Q5_K_M (3,2 GB) puede ejecutarse en GPUs de consumo y en CPU, lo que facilita prototipos y demos sin infraestructura en la nube.
- Generación de contenido multimodal básico: el suplemento mmproj permite, en principio, tareas que combinen texto e imagen, aunque la documentación no detalla su alcance.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2,5-3 GB con Q4_K_M (2,8 GB de pesos) y Q5_K_M (3,2 GB); alrededor de 4,5-5 GB con Q8_0 (4,6 GB); en torno a 9-10 GB con f16 (8,5 GB). Añadir el suplemento mmproj (0,5-0,8 GB) si se usa el componente multimodal.
- GPU recomendadas: cualquier GPU con al menos 6-8 GB de VRAM para cuantizaciones Q4/Q5 (RTX 3060, RTX 4060, RTX 2070); para Q8_0 se recomienda 8-12 GB (RTX 3080, RTX 4070); f16 requiere 12-16 GB (RTX 4080, RTX 4090, A100). También puede ejecutarse en CPU con llama.cpp.
- Cabe en GPU de consumo: sí, en la mayoría de GPUs modernas con 8 GB o más usando Q4_K_M o Q5_K_M; incluso en GPUs de 4-6 GB con Q2_K o Q3_K_S.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, y servidores compatibles con GGUF; el repositorio incluye la etiqueta "endpoints_compatible". Para el formato original en bfloat16, transformers con aceleración por GPU.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.5-4B-Claude-4.6-OS-Auto-Variable-HERETIC-UNCENSORED-THINKING (este) | 4,2 B | no disponible | Apache 2.0 | GGUF, bfloat16 | Fine-tuning creativo, uncensored, multimodal vía mmproj |
| Qwen3.5-4B (base, sin fine-tuning) | ~4 B | no disponible | Apache 2.0 | safetensors, GGUF | Modelo alineado estándar; sin capacidades uncensored ni fine-tuning creativo específico |
| Modelos abliterated de 7-8 B (por ejemplo, variantes de Llama o Mistral) | 7-8 B | variable | variable (a menudo Apache 2.0 o Llama) | GGUF, safetensors | Mayor tamaño y, en general, mayor calidad, pero requieren más VRAM; el modelo aquí descrito es más ligero |
| Modelos creativos de 3-4 B (por ejemplo, variantes de Phi o Gemma fine-tuneadas) | 3-4 B | variable | variable | GGUF, safetensors | Alternativas de tamaño similar; la comparación directa de rendimiento no está disponible |

No se dispone de datos de benchmarks que permitan una comparación cuantitativa con estas alternativas.

## Limitaciones y advertencias

- Al ser una variante "uncensored" y "abliterated", el modelo puede generar contenido dañino, ofensivo, ilegal o sexualmente explícito; no es apto para producción sin moderación externa.
- Riesgo elevado de alucinación, especialmente en tareas factuales, dado su tamaño reducido y su orientación creativa.
- Idiomas limitados a inglés y chino; el rendimiento en castellano no está garantizado y probablemente sea deficiente.
- Longitud de contexto no documentada; no se recomienda asumir ventanas largas sin verificación empírica.
- Aunque la licencia es Apache 2.0 (permisiva para uso comercial), el contenido generado y el uso en aplicaciones públicas pueden acarrear responsabilidades legales y reputacionales; se recomienda revisión legal antes de desplegarlo.
- La cuantización Q2_K y Q3_K_M degradan notablemente la calidad; para producción se recomienda Q4_K_M o superior.
- El componente multimodal (mmproj) está poco documentado; su fiabilidad y alcance no están verificados.
- El nombre del modelo hace referencia a "Claude-4.6-OS", lo que puede inducir a confusión sobre su origen; no es un modelo de Anthropic.

## Enlaces

- Repositorio Hugging Face (GGUF): https://huggingface.co/mradermacher/Qwen3.5-4B-Claude-4.6-OS-Auto-Variable-HERETIC-UNCENSORED-THINKING-GGUF
- Modelo base (bfloat16): https://huggingface.co/DavidAU/Qwen3.5-4B-Claude-4.6-OS-Auto-Variable-HERETIC-UNCENSORED-THINKING
- Cuantizaciones con imatrix: https://huggingface.co/mradermacher/Qwen3.5-4B-Claude-4.6-OS-Auto-Variable-HERETIC-UNCENSORED-THINKING-i1-GGUF
- Página de resumen del modelo en mradermacher: https://hf.tst.eu/model#Qwen3.5-4B-Claude-4.6-OS-Auto-Variable-HERETIC-UNCENSORED-THINKING-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Gráfico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
