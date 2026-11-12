# mradermacher/Mistral-7B-Liberated-GGUF

## Resumen

Mistral-7B-Liberated-GGUF es la versión cuantizada en formato GGUF del modelo nurmix/Mistral-7B-Liberated, un fine-tuning "abliterated" (decensored) del conocido Mistral 7B de Mistral AI. El trabajo de cuantización lo firma mradermacher, un prolífico publicador de cuantizaciones GGUF en Hugging Face, que en esta ficha ofrece cuatro variantes estáticas (Q2_K, Q4_K_S, Q8_0 y f16) listas para su uso con llama.cpp y ecosistemas compatibles.

El modelo hereda la arquitectura transformer decoder-only de Mistral 7B, con 7.248.023.552 parámetros totales y una ventana de contexto de 32.768 tokens (característica de la familia Mistral 7B original, aunque no se explicita en la información disponible). La modificación "abliterated" elimina las direcciones de rechazo del modelo mediante técnicas de abliteration, lo que produce un modelo sin los mecanismos de seguridad habituales y orientado a generar contenido sin restricciones.

La relevancia de esta ficha es doble: por un lado, documenta una opción práctica para desplegar un Mistral 7B sin censura en hardware de consumo gracias a las cuantizaciones GGUF; por otro, advierte de que el modelo está pensado exclusivamente para inglés, no cuenta con datos de benchmarks publicados y su uso comercial, aunque la licencia sea Apache 2.0, debe evaluarse con cautela por la ausencia de filtros de seguridad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basado en Mistral 7B) |
| Parametros totales | 7.248.023.552 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (Mistral 7B original: 32.768 tokens) |
| Tipos de cuantizacion | Q2_K, Q4_K_S, Q8_0, f16 (estaticas; sin quants ponderadas/imatrix) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (tambien disponible el modelo base en transformers/safetensors) |

## Arquitectura y entrenamiento

El modelo subyacente es un fine-tuning de Mistral 7B, un transformer decoder-only denso de aproximadamente 7.200 millones de parámetros con atención de ventana deslizante y GQA (grouped-query attention), tal como se describe en el paper original de Mistral AI. Sobre esa base, nurmix aplicó una técnica de "abliteration": un procedimiento que identifica y elimina las direcciones en el espacio de activaciones asociadas al rechazo de peticiones, de modo que el modelo deja de negarse a responder a ciertos prompts. No se dispone de información sobre el dataset exacto, el número de tokens de entrenamiento ni si hubo RLHF o DPO en el proceso de liberación.

La contribución de mradermacher se limita a la cuantización: convierte los pesos en formato Hugging Face a GGUF mediante llama.cpp y genera variantes estáticas (sin imatrix/ponderadas). El autor indica explícitamente que las cuantizaciones ponderadas "no parecen estar disponibles por mi parte en este momento", por lo que no debe esperarse una versión IQ con calibración de importancia. El repo ocupa 38,5 GB en total, incluyendo todos los archivos de cuantización.

## Capacidades

- Generación de texto conversacional en inglés, con el estilo y capacidades generales de Mistral 7B.
- Razonamiento básico y respuesta a instrucciones, heredado del modelo base.
- Generación de código y matemáticas a nivel de un modelo de 7B, sin garantías específicas documentadas.
- Modo "uncensored": ausencia deliberada de mecanismos de rechazo, lo que permite generar contenido que el Mistral 7B original bloquearía.
- Compatible con llama.cpp y con los endpoints y herramientas que consumen GGUF (Ollama, LM Studio, etc.).
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo thinking.
- Capacidades multilingües: solo inglés declarado; no se garantiza calidad en otros idiomas.

## Casos de uso

- Experimentación en investigación sobre alineación y seguridad: el modelo permite estudiar el comportamiento de un LLM sin mecanismos de rechazo, comparándolo con el Mistral 7B original en tareas de evaluación de sesgos y robustez. Es adecuado porque el abliteration elimina precisamente la capa de rechazo que se quiere analizar.
- Despliegue local en hardware de consumo: la cuantización Q4_K_S (4,2 GB) permite ejecutar el modelo en GPUs con 6-8 GB de VRAM o incluso en CPU con llama.cpp, lo que lo hace útil para prototipos offline y entornos sin conexión.
- Generación creativa sin restricciones: escritura de ficción, guiones o contenido narrativo que requiera temáticas que los modelos alineados suelen rechazar; el modelo está diseñado para no bloquear este tipo de peticiones.
- Chatbot de propósito general en inglés para entornos controlados: con la variante Q8_0 (7,8 GB) se obtiene la mejor calidad de la familia de cuants estáticas, adecuada para asistentes conversacionales internos donde el operador asume la responsabilidad del contenido.
- Evaluación comparativa de cuantizaciones: al ofrecer Q2_K, Q4_K_S, Q8_0 y f16 del mismo modelo, sirve para medir el impacto de la cuantización en perplejidad y calidad de respuesta con llama.cpp.
- Base para fine-tunings posteriores: el modelo en formato transformers (nurmix/Mistral-7B-Liberated) puede emplearse como punto de partida para ajustes específicos de dominio en inglés, partiendo de una base sin censura.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card de la cuantización no incluye métricas de MMLU, HumanEval, GSM8K ni comparaciones con otros modelos, y el modelo base nurmix/Mistral-7B-Liberated tampoco aporta datos en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia (según tamaño de archivo GGUF, con overhead de contexto adicional):
  - Q2_K: ~2,8 GB de pesos, apto para GPUs de 4 GB.
  - Q4_K_S: ~4,2 GB de pesos, recomendado para GPUs de 6-8 GB.
  - Q8_0: ~7,8 GB de pesos, requiere GPUs de 10-12 GB.
  - f16: ~14,6 GB de pesos, requiere GPUs de 16-24 GB.
- GPU recomendadas: RTX 3060 12 GB o RTX 4060 Ti 16 GB para Q8_0; RTX 4090, A100 o H100 para f16 con contexto largo. Para Q4_K_S basta una RTX 3050 8 GB o similar.
- Cabe en GPU de consumo: sí, en todas las variantes hasta Q8_0 con GPUs de 8-12 GB; f16 requiere gama alta o profesional.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, y cualquier runtime compatible con GGUF. No se documenta soporte para vLLM o TGI en formato GGUF.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Mistral-7B-Liberated-GGUF (este) | 7,25 B | no disponible (base Mistral 7B: 32k) | Apache 2.0 | GGUF | Sin censura, solo inglés, sin benchmarks |
| Mistral 7B Instruct (original) | 7,24 B | 32k | Apache 2.0 | safetensors, GGUF | Alineado, multilingüe parcial, benchmarks publicados |
| TheBloke/Mistral-7B-Instruct-v0.2-GGUF | 7,24 B | 32k | Apache 2.0 | GGUF | Referencia de cuantizaciones GGUF de Mistral, con quants imatrix |
| nurmix/Mistral-7B-Liberated | 7,25 B | no disponible | Apache 2.0 | safetensors | Modelo base sin cuantizar del que deriva esta ficha |

## Limitaciones y advertencias

- Modelo "uncensored": no incorpora mecanismos de rechazo, por lo que puede generar contenido ofensivo, ilegal o dañino sin filtro. No es apto para aplicaciones orientadas al público sin una capa de moderación externa.
- Riesgo elevado de alucinación: al ser un modelo de 7B sin benchmarks publicados, no hay evidencia de su fiabilidad factual; el abliteration puede degradar además la coherencia en tareas de razonamiento.
- Solo inglés declarado: el rendimiento en castellano u otros idiomas no está garantizado y probablemente sea deficiente.
- Sin datos de benchmarks ni evaluación de calidad: no se puede comparar objetivamente con el Mistral 7B original ni con otras variantes.
- Cuantizaciones estáticas únicamente: no hay versiones ponderadas/imatrix, lo que puede implicar mayor pérdida de calidad en Q2_K y Q3 respecto a alternativas calibradas.
- Licencia Apache 2.0 permite uso comercial, pero el operador asume toda la responsabilidad legal y ética sobre el contenido generado; la licencia no exime de cumplir la normativa aplicable.
- Fecha de creación futura (2026-11-12) en los metadatos: conviene verificar la integridad y procedencia de los archivos antes de usarlos en producción.
- Sin soporte documentado de tool calling ni agentes: no debe asumirse capacidad de function calling.

## Enlaces

- Hugging Face (cuantización GGUF): https://huggingface.co/mradermacher/Mistral-7B-Liberated-GGUF
- Modelo base: https://huggingface.co/nurmix/Mistral-7B-Liberated
- Página de descargas del autor: https://hf.tst.eu/model#Mistral-7B-Liberated-GGUF
- README de referencia para uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- FAQ y peticiones de cuantización de mradermacher: https://huggingface.co/mradermacher/model_requests
- Gráfico de calidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
