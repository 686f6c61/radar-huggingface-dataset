# Denisijcu/vertex-core-reasoning

## Resumen

Vertex-Core Reasoning es un ajuste fino del modelo Qwen3-4B-Instruct-2507, publicado por Denisijcu bajo la marca Vertex Coders LLC. Se trata de un modelo denso de 4.022.468.096 parámetros (aproximadamente 4B) orientado a razonamiento explícito mediante cadenas de pensamiento (chain-of-thought) y a tareas de ingeniería de software, ciberseguridad y análisis paso a paso. El entrenamiento se realizó con QLoRA sobre Unsloth y ajuste supervisado (SFT) utilizando el dataset MoreThought/Fable-5.1-Max-Reasoning-Filtered-10000x.

El modelo se distribuye principalmente en formato GGUF con cuantización Q4_K_M, lo que reduce el peso de los pesos a unos 2,5 GB y permite ejecución local en estaciones de trabajo con VRAM limitada, incluyendo integración directa con Ollama mediante un Modelfile documentado por el autor. La longitud de contexto declarada es de 4096 tokens, muy por debajo de la habitual en la familia Qwen3, lo que condiciona su uso en escenarios de contexto largo.

Su relevancia actual es limitada pero concreta: cubre el nicho de modelos pequeños de razonamiento, desplegables en hardware de consumo y con licencia Apache 2.0, lo que facilita su uso comercial sin restricciones adicionales. No obstante, el repositorio no presenta descargas ni valoraciones y no incluye resultados de benchmarks, por lo que su rendimiento real no está validado de forma independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (derivado de Qwen3-4B-Instruct-2507) |
| Parametros totales | 4.022.468.096 (aproximadamente 4B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 4096 tokens (según model card) |
| Tipos de cuantizacion | Q4_K_M (GGUF); no se documentan otras cuantizaciones en la información disponible |
| Idiomas soportados | Inglés (en) y español (es) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (Q4_K_M); tamaño del repositorio 2,5 GB, coherente con pesos cuantizados. No se documenta la presencia de safetensors en la información disponible |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-4B-Instruct-2507, un transformer decoder-only denso de unos 4B parámetros. Sobre esa base se aplicó un ajuste fino con QLoRA (cuantización de bajo rango) usando la librería Unsloth y el optimizador adamw_8bit, con entrenamiento supervisado (SFT) sobre el dataset MoreThought/Fable-5.1-Max-Reasoning-Filtered-10000x, cuyo nombre sugiere un conjunto filtrado de aproximadamente 10.000 ejemplos de razonamiento extendido, aunque la composición exacta, el número de tokens vistos y los criterios de filtrado no se detallan en la información disponible.

El objetivo declarado del ajuste es potenciar el razonamiento paso a paso tipo o1 (descomposición explícita del problema antes de la respuesta final) y reforzar competencias de ingeniería de software y ciberseguridad asociadas a la marca Vertex Coders. No se documenta el uso de RLHF, DPO u otras fases de alineación posteriores al SFT, ni innovaciones técnicas adicionales como decodificación especulativa o atención lineal. La longitud de contexto se fija en 4096 tokens, lo que sugiere que el ajuste no extendió la ventana nativa del modelo base.

## Capacidades

- Generación de texto conversacional multi-turno en inglés y español.
- Razonamiento explícito mediante cadenas de pensamiento (CoT): el modelo desglosa problemas lógicos, matemáticos y de arquitectura de software antes de emitir la respuesta final.
- Resolución de problemas matemáticos y lógicos de complejidad media, apoyada en el modo de razonamiento paso a paso.
- Generación y análisis de código con orientación a producción, incluyendo revisión de arquitectura de software según el enfoque declarado por el autor.
- Contenidos relacionados con ciberseguridad y desarrollo de sistemas, según el posicionamiento de la marca Vertex Coders.
- Compatibilidad con endpoints (tag `endpoints_compatible`) para despliegue como servicio conversacional.
- Ejecución local eficiente gracias a la cuantización Q4_K_M y a la integración documentada con Ollama.
- Soporte de tool calling / function calling: no documentado en la información disponible.
- Capacidades de agente y multi-step reasoning autónomo: no documentadas más allá del razonamiento CoT interno.
- Capacidades de visión o audio: no disponibles.

## Casos de uso

- Asistente de razonamiento técnico en local: desplegado con Ollama en una estación de trabajo, el modelo permite a un desarrollador plantear problemas de diseño de software y recibir un análisis paso a paso sin enviar código propietario a servicios externos, gracias a sus 2,5 GB de pesos cuantizados.
- Revisión de código y explicación de errores: con 4096 tokens de contexto puede procesar fragmentos de código y trazas de error, razonar sobre la causa raíz y proponer una corrección justificada línea a línea.
- Tutoría de matemáticas y lógica: el formato CoT permite mostrar el desarrollo completo de un problema antes del resultado, útil en herramientas educativas que necesitan explicar el procedimiento y no solo la solución.
- Generación de documentación técnica en español: al estar entrenado en `en` y `es`, puede redactar y traducir documentación de APIs, guías de arquitectura y notas de seguridad manteniendo terminología técnica.
- Prototipado rápido de pipelines de análisis: su compatibilidad con endpoints y el formato GGUF permiten integrarlo en un servicio interno de bajo coste para tareas de clasificación, resumen o extracción con razonamiento previo.
- Análisis de configuraciones y políticas de seguridad: el sesgo declarado hacia ciberseguridad lo hace utilizable para revisar configuraciones, explicar vectores de ataque conocidos y proponer mitigaciones en entornos de laboratorio.
- Base para ajustes posteriores: al ser un modelo de 4B con licencia Apache 2.0 y formato abierto, sirve como punto de partida para fine-tunes específicos de dominio en equipos con una sola GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en Q4_K_M: aproximadamente 3,5-4 GB contando pesos (unos 2,5 GB) más caché KV para 4096 tokens. Cifra estimada a partir del tamaño del repositorio, no publicada por el autor.
- VRAM estimada en FP16: alrededor de 8 GB solo para pesos (4.022.468.096 parámetros × 2 bytes), más caché KV; se requeriría una GPU de 12 GB o superior. No se distribuyen pesos en FP16 en el repositorio según la información disponible.
- GPU consumer compatibles: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080, RTX 4090. En Q4_K_M cabe también en GPUs de 6-8 GB con contexto reducido.
- GPU de centro de datos: A100, H100 y similares quedan sobredimensionadas para este tamaño; son útiles únicamente para servir muchas réplicas concurrentes.
- Despliegue: Ollama (opción documentada por el autor con Modelfile y parámetros temperature 0.6, top_p 0.9, num_ctx 4096) y llama.cpp por el formato GGUF. vLLM y TGI no son utilizables directamente sin pesos en safetensors, que no se documentan en la información disponible.
- Latencia y throughput: no disponibles. Al ser un modelo de 4B cuantizado a 4 bits, es esperable una inferencia interactiva en GPU consumer, pero no se aportan mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Vertex-Core Reasoning | 4,02B | 4096 | Apache 2.0 | GGUF Q4_K_M | Fine-tune QLoRA con CoT; sin benchmarks publicados |
| Qwen3-4B-Instruct-2507 (base) | 4,02B | No documentado en la informacion disponible | Apache 2.0 | No documentado en la informacion disponible | Modelo de partida; capacidades instruct generales |
| Denisijcu/vertex-math | No disponible | No disponible | Apache 2.0 | GGUF | Otro fine-tune del mismo autor, orientado a matematicas y edge-ai |
| Denisijcu/vertex-core-gguf | No disponible | No disponible | No disponible en la informacion | GGUF | Publicacion previa de la serie Vertex Core del mismo autor |

No se dispone de datos de benchmarks ni de especificaciones completas de los modelos comparables en la información proporcionada, por lo que la comparación se limita a parámetros, licencia y formato.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay métricas publicadas de MMLU, HumanEval, GSM8K ni de evaluaciones de razonamiento, por lo que la mejora frente al modelo base no está cuantificada.
- Contexto reducido: 4096 tokens limitan casos de uso con documentos largos, repositorios completos o conversaciones extensas; el prompt de sistema y el historial consumen parte de esa ventana.
- Riesgo de alucinación: como cualquier modelo de 4B, puede generar código, APIs o referencias inexistentes, especialmente en dominios de ciberseguridad donde los detalles técnicos importan.
- Sesgos no evaluados: no se documenta ninguna evaluación de sesgos, toxicidad o seguridad, ni filtrado posterior al entrenamiento.
- Dataset de entrenamiento opaco: solo se conoce el nombre del dataset; se desconoce su composición, procedencia y posibles sesgos de dominio (el nombre sugiere datos filtrados y posiblemente sintéticos).
- Riesgo de degradación por QLoRA: un ajuste de bajo rango sobre un modelo de 4B puede reducir capacidades generales del base (multilingüismo amplio, conocimiento factual) a cambio de mejorar el estilo de razonamiento.
- Idiomas limitados: solo se declaran inglés y español; el rendimiento en otros idiomas, incluidos catalán, gallego o euskera, no está documentado.
- Validación comunitaria nula: 0 descargas y 0 likes en el momento de la ficha, sin discusiones ni informes de terceros que confirmen el comportamiento descrito.
- Tool calling y uso como agente no documentados: no debe asumirse soporte de function calling sin verificación previa.
- Licencia: Apache 2.0 permite uso comercial y modificación, pero el autor no ofrece garantías ni soporte; conviene conservar el aviso de licencia y atribución.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Denisijcu/vertex-core-reasoning
- Modelo base Qwen3-4B-Instruct-2507: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Dataset de entrenamiento: https://huggingface.co/datasets/MoreThought/Fable-5.1-Max-Reasoning-Filtered-10000x
- Otro modelo del autor (vertex-math): https://huggingface.co/Denisijcu/vertex-math
- Otro modelo del autor (vertex-core-gguf): https://huggingface.co/Denisijcu/vertex-core-gguf
- Ranking de modelos de razonamiento (referencia externa, no especifica a este modelo): https://llm-stats.com/leaderboards/best-ai-for-reasoning
