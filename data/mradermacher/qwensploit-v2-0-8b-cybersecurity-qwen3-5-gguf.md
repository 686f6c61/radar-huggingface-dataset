# mradermacher/Qwensploit-V2-0.8B-CyberSecurity-Qwen3.5-GGUF

## Resumen

Qwensploit-V2-0.8B-CyberSecurity-Qwen3.5-GGUF es la versión cuantizada en formato GGUF del modelo Qwensploit-V2-0.8B-CyberSecurity-Qwen3.5, un modelo de lenguaje especializado en ciberseguridad y desarrollado originalmente por el usuario xtools-at. Esta ficha corresponde concretamente al repositorio publicado por mradermacher, que se dedica a generar cuantizaciones estáticas de modelos existentes para facilitar su despliegue en hardware de consumo mediante llama.cpp y herramientas compatibles.

El modelo base parte de la familia Qwen3.5 (etiquetada como qwen3_5/qwen3.5 en los metadatos) y ha sido ajustado mediante técnicas de instruction tuning y LoRA/PEFT sobre un conjunto de datasets orientados a seguridad ofensiva, pentesting, investigación de vulnerabilidades y CTFs. Con 772.845.888 parámetros totales (aproximadamente 0,8 mil millones), se posiciona como un modelo pequeño y ligero, pensado para tareas de análisis de seguridad y razonamiento técnico en entornos con recursos limitados.

La relevancia de esta publicación radica en que ofrece el modelo en múltiples niveles de cuantización (desde Q2_K hasta Q8_0, además de variantes IQ4_XS y f16) junto con suplementos multimodales mmproj, lo que permite ejecutarlo en GPUs de consumo e incluso en CPU. El repositorio tiene un tamaño total de 8,0 GB y, en el momento de la consulta, no registra descargas ni likes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer basado en Qwen3.5 (detalles especificos no disponibles) |
| Parametros totales | 772.845.888 (~0,8B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K, IQ4_XS; suplementos mmproj en Q8_0 y f16 |
| Idiomas soportados | en (ingles) |
| Licencia | other (no se especifica el termino concreto) |
| Formato de pesos | GGUF; el modelo base en safetensors |

## Arquitectura y entrenamiento

El modelo base es un transformer de la familia Qwen3.5 con aproximadamente 0,8 mil millones de parámetros, ajustado mediante instruction tuning y adaptadores LoRA/PEFT (los metadatos incluyen las etiquetas lora, peft y unsloth). La model card no detalla el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron fases de RLHF o DPO.

El ajuste se ha realizado sobre una mezcla de datasets de ciberseguridad: PentesterFlow/OffsecCyber, ChaoticNeutrals/Cybersecurity-ShareGPT, Voidreaper2026/cybersec-master-dataset, Trendyol/Trendyol-Cybersecurity-Instruction-Tuning-Dataset, saidutta69/CyberSec-Reasoning-Premium, saidutta69/qwen3.8-max-distillation-50k-clean y xtools-at/Claude-Haiku-5.5-High-Reasoning-TraceInversion-3000x. Los metadatos mencionan también la etiqueta "mtp" (multi-token prediction) y "reasoning", aunque no se aportan detalles técnicos sobre su implementación. No se documentan innovaciones arquitectónicas adicionales más allá de la base Qwen3.5.

## Capacidades

- Generación de texto y razonamiento técnico orientado a ciberseguridad.
- Análisis de seguridad, investigación de vulnerabilidades y apoyo en tareas de red-team y pentesting.
- Resolución de retos CTF (capture the flag).
- Razonamiento multi-paso (etiqueta reasoning en los metadatos).
- Instruction tuning específico para dominios de seguridad ofensiva y defensiva.
- Soporte multimodal aparente: el repositorio incluye ficheros mmproj (suplemento multimodal) en Q8_0 y f16, lo que sugiere capacidad de procesamiento de imágenes/visión, aunque no se detalla en la model card.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según los metadatos.

## Casos de uso

- Análisis de vulnerabilidades en auditorías: el modelo puede asistir en la revisión de configuraciones y en la descripción de vectores de ataque, apoyándose en su ajuste sobre datasets de offsec y research de vulnerabilidades.
- Apoyo en ejercicios de pentesting: generación de hipótesis de explotación y guías paso a paso para pruebas de penetración controladas, gracias al entrenamiento sobre datos de red-team.
- Formación y resolución de CTFs: el modelo puede razonar sobre retos de captura de la bandera y proponer enfoques de resolución, útil en entornos educativos y de práctica.
- Asistente de triaje en SOC: clasificación y explicación de alertas de seguridad y técnicas de ataque, aprovechando su especialización en análisis de seguridad.
- Generación de documentación de seguridad: redacción de informes técnicos, resúmenes de hallazgos y recomendaciones de mitigación a partir de notas de auditoría.
- Despliegue en entornos con recursos limitados: al ser un modelo de 0,8B con cuantizaciones desde Q2_K, puede ejecutarse en portátiles o servidores modestos para tareas de asistencia en seguridad sin depender de la nube.
- Análisis de trazas de razonamiento: el ajuste incluye datos de "reasoning trace inversion", lo que puede emplearse para estudiar y comparar cadenas de razonamiento en tareas de seguridad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de ~0,8B parámetros, las cuantizaciones Q4_K_M ocupan del orden de 0,5 GB y las Q8_0 en torno a 0,8-0,9 GB; f16 se aproxima a 1,5 GB. Los ficheros mmproj añaden 0,2-0,3 GB adicionales si se usa la parte multimodal.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM puede ejecutar las cuantizaciones más pequeñas; RTX 3060, RTX 4060, RTX 4090 o GPUs de datacenter (A100, H100) son sobradamente suficientes.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU moderna e incluso en iGPU y CPU mediante llama.cpp.
- Opciones de despliegue: llama.cpp, Ollama, text-generation-inference (TGI, según etiquetas), transformers con soporte GGUF y servidores compatibles con la API de OpenAI.
- Latencia y throughput: no disponibles en la información proporcionada; por el tamaño del modelo se espera una latencia baja en hardware de consumo, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Qwensploit-V2-0.8B-CyberSecurity-Qwen3.5-GGUF | ~0,8B | no disponible | other | GGUF en HF |
| Qwen3 0.6B (referencia de la familia base) | ~0,6B | no disponible | no disponible | safetensors/GGUF |
| Modelos especializados en ciberseguridad de tamaño similar | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo ni de modelos directamente comparables documentados en la información proporcionada.

## Limitaciones y advertencias

- Modelo especializado en seguridad ofensiva: su uso para actividades no autorizadas puede ser ilegal; debe emplearse únicamente en entornos controlados y con autorización.
- Riesgo de alucinación: al ser un modelo pequeño (0,8B), la probabilidad de generar información técnica incorrecta o inventada es elevada; requiere verificación humana.
- Idiomas: solo se declara soporte de inglés, por lo que el rendimiento en castellano no está garantizado.
- Licencia "other": no se especifican los términos exactos, por lo que es necesario revisar las condiciones del modelo base antes de un uso comercial.
- Longitud de contexto no documentada: limita la planificación para tareas con documentos largos.
- Sin benchmarks publicados: no hay evidencia cuantitativa de su calidad frente a alternativas.
- Cuantizaciones estáticas sin versiones weighted/imatrix: el autor indica que no están disponibles y que podrían no publicarse.
- El repositorio no registra descargas ni likes, lo que dificulta evaluar su adopción y madurez.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Qwensploit-V2-0.8B-CyberSecurity-Qwen3.5-GGUF
- Modelo base: https://huggingface.co/xtools-at/Qwensploit-V2-0.8B-CyberSecurity-Qwen3.5
- Página de descargas del cuantizador: https://hf.tst.eu/model#Qwensploit-V2-0.8B-CyberSecurity-Qwen3.5-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- FAQ y solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Análisis de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
