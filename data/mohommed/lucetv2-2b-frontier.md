# mohommed/LucetV2-2B-Frontier

## Resumen

LucetV2-2B-Frontier es un modelo de lenguaje de tipo conversacional y razonamiento autónomo desarrollado por el usuario mohommed a partir de LiquidAI/LFM3-1.7B, un modelo base de Liquid AI. El modelo se presenta como una edición orientada a la reducción de alucinaciones y al razonamiento estructurado, incorporando técnicas como Next-Concept Modeling (NCM) y protocolos de "anti-hallucination" basados en R-Tuning. Su tamaño real, según los pesos en safetensors, es de aproximadamente 1.729 millones de parámetros (1,73 B), lo que lo sitúa en la categoría de modelos pequeños aptos para hardware de consumo.

La relevancia de este modelo radica en la combinación de tres elementos: la arquitectura Tri-Hybrid de Liquid AI (que combina convoluciones cortas con compuerta, atención por ventana deslizante y atención global con GQA), un contexto extendido de 512K tokens (524.288) mediante RoPE ajustado (rope_theta = 4.000.000), y un proceso de "descensura" mediante SVD que elimina direcciones de rechazo en la capa w2.weight sin modificar las proyecciones de salida de atención. Además, se publican cuantizaciones GGUF calibradas con matrices de importancia (imatrix) para preservar la fidelidad en tareas de razonamiento.

Con licencia Apache 2.0, formato disponible tanto en safetensors como en GGUF, y soporte para la librería transformers, el modelo es adecuado para desarrolladores que buscan un modelo ligero, con contexto muy largo y sin restricciones de uso comercial, para tareas de razonamiento, código y sistemas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Tri-Hybrid (Gated Short Convolutions + Sliding Window Attention + Global GQA), base LFM3 de Liquid AI |
| Parametros totales | 1.728.801.536 (~1,73 B) |
| Parametros activos | no disponible (no se indica si es MoE; todo apunta a modelo denso) |
| Longitud de contexto | 512K tokens (524.288), mediante ABF-RoPE con rope_theta = 4.000.000 |
| Tipos de cuantizacion | GGUF calibrado con imatrix (cuantizaciones concretas no especificadas en la model card) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors y GGUF |

## Arquitectura y entrenamiento

El modelo parte de LiquidAI/LFM3-1.7B, que emplea la arquitectura Tri-Hybrid de Liquid AI. Esta combina tres mecanismos: convoluciones cortas con compuerta (Gated Short Convolutions), atención con ventana deslizante (Sliding Window Attention) y atención global con Grouped Query Attention (GQA). Esta hibridación busca equilibrar eficiencia en contextos largos con calidad de modelado global, reduciendo el coste computacional respecto a la atención global pura.

Sobre esta base, el autor aplica varias modificaciones. En primer lugar, Next-Concept Modeling (NCM), un esquema de planificación de grano grueso a fino que estructura el razonamiento en niveles ([L1.CONCEPT] -> [L2.STRATEGY] -> [L3.COLLAPSE]), con el objetivo de eliminar errores de planificación propios de la generación autorregresiva. En segundo lugar, un protocolo de R-Tuning denominado "Measure Reality", que instruye al modelo para que no invente estados no observados y, en su lugar, emita herramientas de medición deterministas (como `python -c`, `read_file` o `bash`). En tercer lugar, una "descensura" mediante SVD que elimina las direcciones de rechazo del tensor w2.weight, dejando intactas las proyecciones o_proj.weight. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de RLHF/DPO: no disponible.

## Capacidades

- Generacion de texto conversacional (pipeline text-generation).
- Razonamiento autónomo estructurado mediante NCM, con planificación jerárquica de conceptos y estrategias.
- Generacion y razonamiento sobre codigo y tareas de sistemas, con emisión de comandos deterministas (`python -c`, `bash`) en lugar de suposiciones sobre el estado del entorno.
- Protocolo anti-alucinacion: el modelo está ajustado para no conjeturar estados no observados y preferir mediciones reales.
- Contexto extenso de 512K tokens, apto para documentos y sesiones muy largas.
- Descensura mediante SVD: elimina comportamientos de rechazo del modelo base.
- Disponibilidad en GGUF calibrado con imatrix para inferencia local con máxima fidelidad de razonamiento.
- Soporte de tool calling formal: no disponible (la emisión de herramientas forma parte del protocolo de prompting, no se documenta un soporte nativo de function calling).
- Capacidades multilingues: no disponible.
- Capacidades de vision, audio u otras modalidades: no disponibles (modelo de solo texto).

## Casos de uso

- Asistentes de razonamiento local: gracias a su tamaño de 1,73 B y a las cuantizaciones GGUF, puede ejecutarse en portátiles y equipos de consumo para razonamiento estructurado sin depender de la nube.
- Analisis de documentos muy largos: la ventana de contexto de 512K tokens permite procesar libros, expedientes completos o bases de código enteras en una sola pasada sin RAG.
- Agentes de sistemas y DevOps: el protocolo "Measure Reality" lo hace adecuado para flujos donde el modelo debe ejecutar comandos (`bash`, `python -c`) y leer archivos reales antes de concluir, reduciendo suposiciones erróneas.
- Generacion de codigo con verificacion: puede integrarse en pipelines donde se emitan scripts de verificación deterministas antes de aceptar una respuesta, útil en CI/CD o revisión automatizada.
- Investigacion sobre mitigacion de alucinaciones: las técnicas de NCM y R-Tuning documentadas en la model card lo convierten en un caso de estudio práctico para investigadores que exploran protocolos anti-alucinación en modelos pequeños.
- Investigacion sobre alineamiento y descensura: la modificación SVD sobre w2.weight es un ejemplo reproducible de ablación de direcciones de rechazo, de interés para estudios de mecánica interpretativa.
- Chatbots con sesiones prolongadas: el contexto extenso permite mantener conversaciones multi-turno muy largas manteniendo el historial completo en ventana.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con ~1,73 B de parámetros, en FP16 se requieren alrededor de 3,5-4 GB; en cuantizaciones GGUF de 4 bits, aproximadamente 1-1,5 GB para los pesos. El tamaño del repositorio (14,9 GB) sugiere que incluye múltiples cuantizaciones y/o el modelo en precisión completa.
- GPU recomendadas: cualquier GPU moderna con 4-6 GB de VRAM es suficiente para inferencia en FP16 (por ejemplo, RTX 3060, RTX 4060 o superiores). Para contextos de 512K tokens, el KV cache puede aumentar significativamente el consumo de memoria, por lo que se recomiendan GPUs con 12-24 GB (RTX 3090, RTX 4090) si se pretende explotar el contexto completo.
- Consumer GPU: sí, cabe con holgura en GPUs de consumo incluso en FP16; en 4 bits puede ejecutarse incluso en equipos sin GPU dedicada mediante CPU.
- Opciones de despliegue: llama.cpp y derivados (Ollama, LM Studio) para los GGUF; transformers de Hugging Face para los safetensors. No se menciona soporte explícito para vLLM o TGI; la etiqueta custom_code sugiere revisar el código del repo antes de desplegar.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Arquitectura | Licencia | Notas |
|---|---|---|---|---|---|
| LucetV2-2B-Frontier | ~1,73 B | 512K | Tri-Hybrid (LFM3) | Apache 2.0 | NCM, anti-alucinación, descensura SVD, GGUF con imatrix |
| LiquidAI/LFM3-1.7B (base) | ~1,7 B | no disponible | Tri-Hybrid | Licencia de Liquid AI (consultar repo) | Modelo base sin modificaciones de NCM ni descensura |
| Qwen3-1.7B | ~1,7 B | 32K (ampliable con YaRN) | Transformer denso | Apache 2.0 | Fuerte en código y multilingüe, contexto mucho menor |
| Llama 3.2 1B/3B | 1,2 B / 3,2 B | 128K | Transformer denso | Licencia Meta Llama | Ecosistema amplio, sin protocolo anti-alucinación específico |

Nota: la comparación con Llama 3.2 y Qwen3 se ofrece como referencia de categoría (modelos pequeños de uso general); sus datos de rendimiento frente a Lucet no están disponibles.

## Limitaciones y advertencias

- Descensura deliberada: el modelo ha sido modificado para eliminar direcciones de rechazo. Esto implica que puede generar contenido que el modelo base rechazaría; su uso requiere filtros y salvaguardas adicionales en producción, y el responsable legal del uso es el desplegador.
- Riesgo de alucinacion: aunque incorpora protocolos anti-alucinación, ningún modelo está libre de alucinaciones; el protocolo "Measure Reality" mitiga pero no elimina el problema.
- Sesgos conocidos: no disponible; hereda potencialmente los sesgos del modelo base LFM3-1.7B y de sus datos de entrenamiento, que no están documentados en la model card.
- Idiomas: no se especifican los idiomas soportados; verificar antes de usar en entornos no anglófonos.
- Contexto de 512K: el KV cache a contexto completo puede requerir memoria considerable; en hardware de consumo el contexto práctico puede ser menor.
- custom_code: el repo está etiquetado con custom_code, por lo que conviene revisar el código de modelado antes de ejecutarlo.
- Procedencia: es un fine-tune comunitario (284 descargas, sin benchmarks publicados ni auditoría conocida); se recomienda evaluación propia antes de uso en producción.
- Licencia: Apache 2.0 permite uso comercial sin restricciones significativas, aunque debe respetarse la licencia del modelo base subyacente si Liquid AI impone condiciones adicionales.

## Enlaces

- Modelo principal: https://huggingface.co/mohommed/LucetV2-2B-Frontier
- Cuantizaciones GGUF: https://huggingface.co/mohommed/Lucet-2B-Frontier-GGUF
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B
- Paper, blog o demo: no disponible
