# mradermacher/Qwen2.5-3B-Model-Stock-v2.1-GGUF

## Resumen

Qwen2.5-3B-Model-Stock-v2.1-GGUF es una recopilación de cuantizaciones en formato GGUF del modelo bunnycore/Qwen2.5-3B-Model-Stock-v2.1, un merge (fusión) de modelos construido con mergekit sobre la base de Qwen2.5-3B de Alibaba. El trabajo de cuantización lo firma mradermacher, un autor habitual en Hugging Face especializado en generar versiones GGUF e imatrix de modelos open source para su uso con llama.cpp y herramientas compatibles. El modelo no aporta arquitectura nueva: hereda la de Qwen2.5-3B, un transformer denso de aproximadamente 3.085 millones de parámetros (3,085 mil millones), y su interés radica en ofrecer una variante fusionada de Qwen2.5-3B lista para ejecutarse en hardware de consumo gracias a las cuantizaciones de 1,4 a 6,3 GB.

La relevancia de esta ficha es doble. Por un lado, documenta un caso típico de la cadena de valor del ecosistema open source: un modelo base (Qwen2.5-3B), un merge comunitario (bunnycore) y un cuantizador (mradermacher) que publica 12 variantes GGUF con distintos niveles de compresión. Por otro, advierte de que la información disponible es muy limitada: la model card del cuantizador no documenta datos de entrenamiento del merge, licencia, benchmarks ni idiomas más allá del inglés declarado en los tags.

El contexto (longitud de ventana) no se especifica en la información proporcionada, aunque al derivar de Qwen2.5-3B es probable que herede su ventana nativa; no obstante, este dato no se confirma en la documentación disponible y se marca como no disponible. El modelo está pensado para conversación y uso general en inglés, con un pipeline no declarado y un volumen de descargas muy bajo (25 descargas, 0 likes en el momento de la consulta), lo que indica que se trata de una publicación reciente y de nicho.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (heredada de Qwen2.5-3B; no se detalla en la model card) |
| Parametros totales | 3.085.383.680 (3,085 mil millones) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (inglés) |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones); el modelo base en safetensors no se incluye en este repo |
| Tamano del repo | 27,9 GB |
| Modelo base | bunnycore/Qwen2.5-3B-Model-Stock-v2.1 |
| Herramienta de fusion | mergekit |
| Libreria declarada | transformers |
| Pipeline | no disponible |
| Fecha de creacion | 2025-02-26 |
| Ultima actualizacion | 2026-11-22 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-3B, un transformer denso decoder-only de aproximadamente 3.085 millones de parámetros. Sin embargo, el modelo que nos ocupa no es el Qwen2.5-3B original, sino un merge comunitario (bunnycore/Qwen2.5-3B-Model-Stock-v2.1) generado con mergekit, una herramienta que combina los pesos de dos o más modelos mediante técnicas como SLERP, TIES, DARE o passthrough. La model card del cuantizador no especifica qué modelos se fusionaron, qué método de merge se empleó ni la proporción de mezcla, por lo que estos detalles se consideran no disponibles.

Tampoco se documentan los datos de entrenamiento del merge: no hay información sobre número de tokens, composición del dataset, ni si hubo etapas de RLHF, DPO o fine-tuning supervisado posteriores a la fusión. Al derivar de Qwen2.5-3B, es razonable esperar que conserve parte del conocimiento y las capacidades del modelo original de Alibaba, pero no se aporta evidencia en la información disponible. La innovación técnica de esta publicación es exclusivamente la cuantización: mradermacher aplica el pipeline estándar de llama.cpp para producir 12 variantes GGUF, con versiones estáticas (este repo) y versiones ponderadas/imatrix publicadas en un repositorio separado (Qwen2.5-3B-Model-Stock-v2.1-i1-GGUF), que suelen ofrecer mejor calidad por bit en tamaños pequeños.

## Capacidades

- Generación de texto conversacional en inglés, según el tag "conversational" del repositorio.
- Razonamiento general y respuesta a instrucciones, heredado del linaje Qwen2.5 (no verificado en la documentación del merge).
- Ejecución local en CPU y GPU mediante llama.cpp y derivados, gracias al formato GGUF.
- Compatibilidad con endpoints (tag "endpoints_compatible"), lo que permite servir el modelo a través de infraestructura de inferencia estándar.
- Soporte de tool calling / function calling: no disponible (no se documenta en la model card).
- Soporte de agentes y razonamiento multi-paso: no disponible (no se documenta).
- Capacidades multilingües: limitadas al inglés según los tags; no se declaran otros idiomas.
- Capacidades especiales (modo thinking, visión, audio): no disponible.

## Casos de uso

- Prototipado local de asistentes conversacionales: con la cuantización Q4_K_M (2,0 GB) el modelo cabe en cualquier GPU de consumo con 4 GB o más de VRAM, lo que permite iterar en un portátil sin depender de la nube.
- Despliegue en dispositivos de borde: la variante Q2_K (1,4 GB) o Q3_K_S (1,6 GB) permite ejecutar el modelo en mini-PC, Raspberry Pi 5 con 8 GB o routers con NPU, para tareas de clasificación y respuesta breve en inglés.
- Generación de texto en pipelines por lotes: al ser un modelo de 3B, el throughput en CPU con llama.cpp es aceptable para procesar grandes volúmenes de texto (etiquetado, resumen, extracción) sin coste de API.
- Experimentación con merges: sirve como caso de estudio para investigadores que quieran evaluar cómo afecta la fusión con mergekit al rendimiento de Qwen2.5-3B, comparando las cuantizaciones con el modelo base original.
- Base para fine-tuning ligero: las versiones f16 (6,3 GB) y Q8_0 (3,4 GB) permiten servir el modelo con la máxima fidelidad posible dentro del ecosistema GGUF, útil como referencia antes de aplicar LoRA o QLoRA.
- Educación y demos: el tamaño reducido y la disponibilidad de 12 cuantizaciones facilitan demostraciones en talleres y cursos sobre cuantización, sin necesidad de hardware especializado.
- Servicio de chat interno de baja concurrencia: con vLLM o TGI (si se convierte a safetensors) o con llama.cpp server, puede atender un equipo pequeño en inglés con latencia baja en una única GPU de 8-16 GB.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del cuantizador no incluye métricas de MMLU, HumanEval, GSM8K ni comparaciones con el modelo base o con otros merges. Tampoco se aportan datos de perplejidad de las distintas cuantizaciones, más allá de la referencia genérica al gráfico de ikawrakow sobre calidad de cuantizaciones de llama.cpp.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin caché KV): Q2_K 1,4 GB; Q3_K_S 1,6 GB; Q3_K_M 1,7 GB; Q3_K_L 1,8 GB; IQ4_XS 1,9 GB; Q4_K_S 1,9 GB; Q4_K_M 2,0 GB; Q5_K_S 2,3 GB; Q5_K_M 2,3 GB; Q6_K 2,6 GB; Q8_0 3,4 GB; f16 6,3 GB.
- VRAM total recomendada: añadir entre 0,5 y 2 GB para la caché KV según longitud de contexto y número de secuencias concurrentes. Para Q4_K_M con contexto moderado, 4 GB de VRAM son suficientes.
- GPU recomendadas: cualquier GPU consumer con 4 GB o más (GTX 1650, RTX 3050, RTX 4060, RTX 4090) para cuantizaciones Q4 y Q5; para f16 se recomienda una GPU con 8 GB o más (RTX 3060 Ti, RTX 4070). En servidor, A100 y H100 no son necesarias para este tamaño, pero pueden usarse para servir muchas réplicas concurrentes.
- Cabe en GPU de consumo: sí, en todas las cuantizaciones hasta Q8_0 con GPUs de 4-6 GB; f16 requiere 8 GB.
- Opciones de despliegue: llama.cpp (binario principal), Ollama (importando el GGUF), LM Studio, text-generation-webui, llama-cpp-python, y servidores compatibles con la API de OpenAI a través de llama.cpp server. Para transformers/TGI sería necesario convertir el GGUF a safetensors o usar el modelo base original.
- Latencia y throughput estimados: no disponibles en la información proporcionada. Como referencia cualitativa, un modelo de 3B en Q4_K_M en una RTX 4090 suele generar decenas de tokens por segundo, pero no se aportan cifras verificadas para este modelo concreto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen2.5-3B-Model-Stock-v2.1-GGUF (este) | 3,085 mil millones | no disponible | no disponible | GGUF (12 cuantizaciones) | Merge comunitario de Qwen2.5-3B; 25 descargas; solo inglés declarado |
| Qwen2.5-3B (original, Alibaba) | 3,085 mil millones | 32.768 tokens (según documentación pública de Qwen2.5) | Apache 2.0 (según Qwen2.5) | safetensors, GGUF (comunidad) | Modelo base oficial, con licencia y benchmarks publicados |
| Llama 3.2 3B (Meta) | 3,21 mil millones | 128.000 tokens (según Meta) | Llama 3.2 Community License | safetensors, GGUF | Alternativa de tamaño similar con contexto largo y licencia comunitaria |
| Phi-3-mini (Microsoft) | 3,8 mil millones | 4.096 o 128.000 tokens según variante | MIT | safetensors, GGUF | Modelo pequeño con buen rendimiento en razonamiento y código |

La comparación con Qwen2.5-3B original es la más directa: este merge hereda su tamaño pero no documenta mejoras medibles ni licencia, lo que lo hace menos adecuado para producción que el modelo oficial. Frente a Llama 3.2 3B y Phi-3-mini, la diferencia principal es la falta de transparencia sobre entrenamiento y licencia en el merge, no el rendimiento bruto.

## Limitaciones y advertencias

- Licencia no disponible: no se puede confirmar si el uso comercial está permitido. Al derivar de Qwen2.5-3B (Apache 2.0 según la documentación pública de Alibaba), es probable que la licencia base sea permisiva, pero el merge comunitario no la declara y no se debe asumir.
- Idiomas: solo se declara inglés; el rendimiento en castellano u otros idiomas no está verificado y probablemente sea limitado.
- Contexto: no se documenta la longitud de ventana del merge; no se debe asumir la de Qwen2.5-3B sin verificación.
- Riesgo de alucinación: inherente a los modelos de 3B y acentuado en merges sin evaluación publicada; no hay benchmarks que cuantifiquen su fiabilidad.
- Sesgos: no se documentan evaluaciones de sesgo; al derivar de Qwen2.5, puede heredar los sesgos del corpus de entrenamiento original, pero no hay evidencia específica para este merge.
- Trazabilidad: la model card no especifica qué modelos se fusionaron ni con qué método, lo que dificulta la auditoría y la reproducibilidad.
- Producción: con 25 descargas y 0 likes, el modelo tiene muy poca validación comunitaria; no se recomienda para sistemas críticos sin evaluación propia.
- Cuantizaciones de baja calidad: Q2_K y Q3_K_M se marcan explícitamente como de menor calidad en la model card; para uso serio se recomienda Q4_K_M o superior.
- Formato: al ser solo GGUF, no es directamente compatible con transformers/TGI sin conversión; el repo no incluye los pesos originales en safetensors.

## Enlaces

- Repositorio Hugging Face (este modelo): https://huggingface.co/mradermacher/Qwen2.5-3B-Model-Stock-v2.1-GGUF
- Modelo base del merge: https://huggingface.co/bunnycore/Qwen2.5-3B-Model-Stock-v2.1
- Cuantizaciones imatrix/ponderadas: https://huggingface.co/mradermacher/Qwen2.5-3B-Model-Stock-v2.1-i1-GGUF
- Página de resumen del cuantizador: https://hf.tst.eu/model#Qwen2.5-3B-Model-Stock-v2.1-GGUF
- FAQ y solicitudes de cuantización de mradermacher: https://huggingface.co/mradermacher/model_requests
- README de referencia de TheBloke sobre uso de GGUF: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Gráfico de calidad de cuantizaciones de ikawrakow: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa del cuantizador: https://www.nethype.de/
