# mradermacher/Qwen3.8-27B-antislop-i1-GGUF

## Resumen

Qwen3.8-27B-antislop-i1-GGUF es la versión cuantizada con imatrix del modelo Qwen3.8-27B-antislop, un ajuste fino de la familia Qwen3.5 orientado a escritura creativa y a la reducción del denominado "slop" (texto genérico, repetitivo y de baja calidad) mediante técnicas de reinforcement learning. El modelo original lo desarrolla AlexWortega (publicado bajo el espacio rawmodels), y esta versión GGUF la produce mradermacher, un conocido cuantizador de la comunidad que mantiene un catálogo extenso de pesos en formato llama.cpp.

El modelo cuenta con 26.895.998.464 parámetros (aproximadamente 26,9 mil millones) en pesos safetensors, licencia Apache 2.0 y soporte declarado para inglés y ruso. La model card lo etiqueta como modelo de visión, lo que implica que los ficheros mmproj (proyector multimodal) se distribuyen en el repositorio estático hermano y no en este de cuantizaciones i1.

Su relevancia radica en dos factores: por un lado, ofrece una alternativa de 27B con licencia permisiva para tareas creativas donde los modelos alineados de forma agresiva suelen producir prosa plana; por otro, la disponibilidad de cuantizaciones desde IQ1_S (7,2 GB) hasta Q6_K (22,2 GB) permite desplegarlo en hardware de consumo, algo poco habitual en modelos de este tamaño con capacidades multimodales.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5), con capacidad de visión según la model card; detalles internos no disponibles |
| Parámetros totales | 26.895.998.464 (~26,9B) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K_S, Q2_K, IQ3_XXS, IQ3_XS, Q3_K_S, IQ3_S, IQ3_M, Q3_K_M, Q3_K_L, IQ4_XS, Q4_0, Q4_K_S, Q4_K_M, Q4_1, Q5_K_S, Q5_K_M, Q6_K (más fichero imatrix) |
| Idiomas soportados | inglés, ruso |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones i1 con imatrix); safetensors en el modelo base |
| Tamaño del repositorio | 300,3 GB |
| Modelo base | rawmodels/Qwen3.8-27B-antislop |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna más allá de la pertenencia a la familia Qwen3.5 y de la etiqueta `qwen3_5` en los tags. El dato de parámetros (26,9B) y la existencia de un proyector multimodal (mmproj) en el repositorio estático apuntan a un transformer denso con torre de visión, aunque no se especifica el número de capas, dimensión oculta ni mecanismo de atención.

En cuanto al entrenamiento, las etiquetas del modelo (`antislop`, `rl-xar`, `grpo`, `creative-writing`, `unslop`) indican que el ajuste fino se realizó con GRPO (Group Relative Policy Optimization) sobre una recompensa orientada a eliminar el "slop" en escritura creativa, probablemente dentro de un pipeline de RL con recompensas explicables (`rl-xar`). No se dispone del número de tokens de entrenamiento, la composición del dataset ni si hubo una fase previa de SFT/DPO. La cuantización i1 de mradermacher emplea ficheros imatrix (matriz de importancia) para ponderar la cuantización por tensor, lo que mejora la perplejidad frente a cuantizaciones estáticas del mismo tamaño.

## Capacidades

- Generación de texto y escritura creativa: el ajuste antislop está específicamente orientado a reducir fórmulas repetitivas, muletillas y prosa genérica.
- Razonamiento y conversación multi-turno: el tag `conversational` indica uso previsto como asistente conversacional.
- Capacidades de visión: la model card declara explícitamente "This is a vision model"; los ficheros mmproj están en el repositorio estático.
- Multilingüe limitado: inglés y ruso declarados; no se mencionan otros idiomas.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y multi-step reasoning: no disponible en la información proporcionada.
- Modo thinking: no disponible en la información proporcionada.
- Compatibilidad con endpoints: el tag `endpoints_compatible` sugiere despliegue en infraestructuras tipo Inference Endpoints.

## Casos de uso

- Escritura creativa asistida: el ajuste GRPO antislop reduce la tendencia a clichés y estructuras repetitivas, lo que lo hace adecuado para generar narrativa, diálogos y descripciones con voz propia en inglés o ruso.
- Reescritura y edición de prosa: puede emplearse para "desloquear" textos generados por otros modelos, eliminando fórmulas vacías y mejorando la variedad léxica.
- Generación de contenido editorial en local: con cuantizaciones Q4_K_M (16,6 GB) o IQ4_XS (15,2 GB) cabe en GPUs de consumo de 24 GB, permitiendo pipelines editoriales sin dependencia de API.
- Asistentes conversacionales en inglés y ruso: el tag `conversational` y la ventana de contexto (no especificada) permiten diálogos multi-turno; útil para atención al cliente en mercados anglófono y rusófono.
- Procesamiento de documentos con imagen: al ser modelo de visión con mmproj, puede describir imágenes o extraer información de capturas y documentos escaneados, siempre que se cargue el proyector multimodal del repositorio estático.
- Investigación en alineación y RL: al estar entrenado con GRPO y recompensas antislop, sirve como caso de estudio reproducible para investigar cómo las recompensas de estilo afectan a la diversidad y calidad del texto.
- Despliegue en entornos con recursos limitados: las cuantizaciones IQ2/IQ3 (8,5-12,7 GB) permiten ejecutar un modelo de 27B en GPUs de 12-16 GB, sacrificando calidad pero manteniendo el estilo antislop en cierta medida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada según cuantización (tamaño de fichero + overhead de contexto/KV cache):
  - IQ1_S: ~7,2 GB; IQ1_M: ~7,7 GB; IQ2_XXS: ~8,5 GB; IQ2_M: ~10,1 GB.
  - IQ3_XXS: ~11,3 GB; IQ3_M: ~12,7 GB; Q3_K_L: ~14,4 GB.
  - IQ4_XS: ~15,2 GB; Q4_K_S: ~15,7 GB; Q4_K_M: ~16,6 GB.
  - Q5_K_M: ~19,3 GB; Q6_K: ~22,2 GB.
- GPU recomendadas: RTX 4090 (24 GB) para Q4_K_M/Q5_K_M; RTX 3090 (24 GB) equivalente; A100 40/80 GB o H100 para Q6_K con contexto largo y para servir varias peticiones concurrentes.
- ¿Cabe en GPU de consumo? Sí: Q4_K_M (16,6 GB) cabe en RTX 4080/4090 (16-24 GB) y en RTX 4060 Ti de 16 GB con contexto moderado; IQ3_M (12,7 GB) cabe en RTX 3060 de 12 GB y RTX 4070.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF; para servir en producción, llama.cpp server o vLLM con soporte GGUF (verificar compatibilidad de la arquitectura Qwen3.5 en la versión concreta).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B-antislop-i1-GGUF (este) | ~26,9B | no disponible | Apache 2.0 | GGUF i1 | Ajuste antislop con GRPO; visión; en/ru |
| Qwen3.8-27B-antislop-GGUF (estático) | ~26,9B | no disponible | Apache 2.0 | GGUF estático | Mismo modelo base, cuantizaciones sin imatrix; incluye mmproj |
| rawmodels/Qwen3.8-27B-antislop (base) | ~26,9B | no disponible | Apache 2.0 | safetensors | Pesos originales sin cuantizar |
| Otros modelos Qwen3.5 de ~27B | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la información proporcionada |

## Limitaciones y advertencias

- Idiomas: solo se declaran inglés y ruso; el rendimiento en castellano no está garantizado y probablemente sea inferior.
- Riesgo de alucinación: no se han publicado evaluaciones de factualidad; un ajuste orientado a estilo creativo puede priorizar fluidez sobre precisión.
- Sesgos: no se documentan sesgos conocidos ni procesos de mitigación; el dataset de RL no es público.
- Licencia: Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base y de los datos de entrenamiento originales, no detalladas.
- Cuantizaciones extremas: IQ1_S, IQ1_M y Q2_K_S degradan notablemente la calidad (el propio autor las describe como "for the desperate" o "very low quality"); no son recomendables para producción.
- Visión: los ficheros mmproj no están en este repositorio; para usar la capacidad multimodal hay que descargarlos del repositorio estático y verificar que el runtime los soporte.
- Contexto: al no publicarse la longitud de contexto, no se puede planificar su uso en tareas de contexto largo sin pruebas empíricas.
- Fecha de creación (2026-09-24) y actualización (2026-11-05): verificar que la versión descargada corresponde a la revisión deseada, ya que el repositorio puede haber cambiado.
- Popularidad baja (3 likes, 5.024 descargas): menor validación comunitaria que otras cuantizaciones, lo que reduce la probabilidad de que los problemas estén documentados.

## Enlaces

- Repositorio Hugging Face (este modelo): https://huggingface.co/mradermacher/Qwen3.8-27B-antislop-i1-GGUF
- Repositorio de cuantizaciones estáticas: https://huggingface.co/mradermacher/Qwen3.8-27B-antislop-GGUF
- Modelo base en Hugging Face: https://huggingface.co/rawmodels/Qwen3.8-27B-antislop
- Página de descargas de mradermacher para este modelo: https://hf.tst.eu/model#Qwen3.8-27B-antislop-i1-GGUF
- FAQ y peticiones de cuantización: https://huggingface.co/mradermacher/model_requests
- README de referencia para uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Gráfica de perplejidad por tipo de cuantización (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- nethype GmbH (infraestructura del cuantizador): https://www.nethype.de/
