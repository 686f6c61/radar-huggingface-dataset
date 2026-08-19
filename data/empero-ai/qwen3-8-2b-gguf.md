# empero-ai/Qwen3.8-2B-GGUF

## Resumen

El modelo **Qwen3.8-2B-GGUF** es una colección de cuantizaciones GGUF del modelo base **empero-ai/Qwen3.8-2B**, desarrollado por la organización **Empero**. Se trata de una destilación de parámetros completos del modelo gigante **Qwen3.8 2.4T A95B** (de Alibaba) sobre la arquitectura del **Qwen3.5-2B**, el miembro más pequeño de la familia Qwen3.5. El resultado es un modelo de aproximadamente 1,94 mil millones de parámetros con capacidades de razonamiento mejoradas respecto a su base, pensado para ejecutarse en dispositivos de borde (edge), teléfonos y ordenadores de gama baja.

La relevancia de este lanzamiento reside en que ofrece un rendimiento de razonamiento notablemente superior al del modelo base original (Qwen3.5-2B) gracias a la destilación de trazas de razonamiento del profesor, manteniendo un tamaño reducido que permite su ejecución en CPU y GPU de consumo. La arquitectura es híbrida: combina capas de atención completa con capas **Gated DeltaNet**, una innovación que reduce el coste del cache de clave-valor a la vez que mantiene la calidad. La licencia es Apache-2.0, lo que facilita su uso comercial y su integración en aplicaciones propietarias.

Esta ficha se centra en las cuantizaciones GGUF, que son las que permiten ejecutar el modelo en runtimes estándar como llama.cpp, Ollama, LM Studio, Jan o KoboldCpp. La model card del autor indica que se requiere una versión reciente de llama.cpp con soporte para la arquitectura Qwen3.5 / Gated DeltaNet; las versiones antiguas no cargarán el archivo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: capas de atención completa alternadas con capas Gated DeltaNet (3 capas DeltaNet por cada capa de atención) |
| Parametros totales | 1.942.653.248 (~1,94 B) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (no especificada en la documentación proporcionada) |
| Tipos de cuantizacion | Q4_K_M, Q5_K_M, Q6_K, Q8_0, BF16 (archivos GGUF) |
| Idiomas soportados | Inglés (único idioma declarado en la model card) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (safetensors para el modelo base, no incluido en este repo) |

## Arquitectura y entrenamiento

El modelo base **Qwen3.8-2B** es una destilación de parámetros completos del modelo **Qwen3.8 2.4T A95B** sobre la arquitectura **Qwen3.5-2B**. La arquitectura Qwen3.5 es híbrida: por cada capa de atención completa se intercalan tres capas **Gated DeltaNet**, un mecanismo de atención lineal que reduce el coste de memoria del cache de clave-valor y permite ventanas de contexto largas con un consumo de recursos menor que la atención tradicional. Esta combinación es especialmente adecuada para despliegues en dispositivos con recursos limitados.

El entrenamiento se realizó mediante destilación supervisada utilizando aproximadamente **30.000 trazas de profesor curadas** procedentes de los datasets internos de destilación de Qwen3.8 de Empero. El modelo estudiante (Qwen3.5-2B) fue entrenado para replicar las respuestas y el proceso de razonamiento del profesor. Según los datos de la model card, el modelo destilado mejora significativamente al base en tareas de razonamiento: en MMLU (con cadena de pensamiento) pasa de 0,283 a 0,548 (+0,265) y en GSM8K con CoT de 0,330 a 0,640 (+0,310). No se menciona el uso de RLHF o DPO; el método principal es la destilación.

## Capacidades

- **Razonamiento con cadena de pensamiento (CoT)**: el modelo es un modelo de razonamiento; cada respuesta abre con un bloque ` thinking` donde genera el proceso de razonamiento antes de la respuesta final.
- **Generación de texto**: puede generar texto coherente y contextual en inglés, con capacidad de mantener conversaciones multi-turno gracias al chat template integrado en los archivos GGUF.
- **Matemáticas**: los resultados en GSM8K con CoT (0,640) indican una capacidad razonable para problemas aritméticos y de razonamiento matemático de nivel escolar.
- **Conocimiento general**: el rendimiento en MMLU (0,548) sugiere un conocimiento enciclopédico moderado, mejor que el de su base pero inferior a modelos de mayor tamaño.
- **Ejecución en dispositivos de borde**: gracias a su tamaño reducido y a las cuantizaciones Q4_K_M y Q5_K_M, puede ejecutarse en teléfonos, SBC y portátiles modernos solo con CPU.
- **Sin soporte explícito de tool calling**: la documentación no menciona function calling ni capacidades de agente. No se asume que las tenga.
- **Sin soporte multimodal**: el modelo es solo texto; no hay indicios de capacidades de visión o audio.

## Casos de uso

- **Asistente de razonamiento en dispositivos móviles**: un desarrollador puede integrar la cuantización Q4_K_M en una app Android o iOS para ofrecer un asistente que resuelva problemas de lógica o matemáticas sin conexión, gracias a su capacidad de razonamiento CoT y su bajo consumo de memoria.
- **Chatbot de atención al cliente en entornos con recursos limitados**: desplegado en un servidor pequeño (por ejemplo, una Raspberry Pi 5 o un VPS de 2 GB de RAM), el modelo puede gestionar conversaciones de soporte en inglés, manteniendo el contexto de la conversación mediante el chat template integrado.
- **Generación de explicaciones paso a paso en aplicaciones educativas**: su capacidad de razonamiento permite generar soluciones detalladas a problemas de matemáticas o física, útil para apps de tutoría que necesiten explicar el proceso, no solo el resultado.
- **Procesamiento de texto en pipelines de automatización**: al ser un modelo pequeño y de licencia Apache-2.0, puede integrarse en flujos de trabajo locales (por ejemplo, resumir documentos, clasificar correos o extraer conclusiones) sin depender de APIs externas.
- **Prototipado rápido de aplicaciones de lenguaje**: los desarrolladores pueden usar las cuantizaciones GGUF con Ollama o LM Studio para probar ideas de productos (generación de historias, brainstorming, etc.) en un portátil sin GPU dedicada.
- **Investigación en destilación y eficiencia**: el modelo sirve como caso de estudio para comparar arquitecturas híbridas y técnicas de destilación; los resultados de MMLU y GSM8K pueden reproducirse fácilmente con llama.cpp.

## Benchmarks y rendimiento

Los únicos benchmarks publicados en la información disponible son los de la model card, obtenidos con `lm-evaluation-harness` y protocolos de cadena de pensamiento (CoT), comparando el modelo destilado con su base Qwen3.5-2B:

| Tarea | Qwen3.5-2B (base) | Qwen3.8-2B | Δ |
|---|---:|---:|---:|
| MMLU (CoT, 57 materias) | 0,283 | **0,548** | +0,265 |
| GSM8K (CoT) | 0,330 | **0,640** | +0,310 |

No se han publicado resultados de benchmarks adicionales (como HumanEval, BBH, etc.) en la información proporcionada. Los valores corresponden al modelo en precisión completa (BF16); las cuantizaciones GGUF pueden presentar pequeñas variaciones, aunque el autor indica que las cuantizaciones Q6_K y superiores son casi sin pérdida.

## Requisitos de hardware

Según la guía práctica de la model card (basada en el tamaño de los pesos, con contexto moderado; el cache KV domina el coste en contextos largos):

- **Q4_K_M y Q5_K_M** (~1,4-1,6 GB): funcionan en teléfonos, SBC y cualquier portátil moderno; CPU-only es completamente utilizable a esta escala.
- **Q6_K y Q8_0** (~1,9-2,4 GB): requieren una GPU con al menos 4 GB de VRAM, o una CPU con 8 GB de RAM.
- **BF16** (~4,5 GB): requiere una GPU con al menos 6 GB de VRAM.
- **Opciones de despliegue**: llama.cpp (llama-cli), Ollama, LM Studio, Jan, KoboldCpp y cualquier runtime compatible con GGUF.
- **Latencia y throughput**: no se proporcionan cifras concretas. En CPU, un modelo de 2B cuantizado a Q4_K_M suele generar entre 10-30 tokens por segundo en un portátil moderno, pero esto depende del hardware y de la longitud de contexto.

## Comparativa con modelos similares

La comparativa más directa es con el modelo base **Qwen3.5-2B** (del que deriva) y con otros modelos pequeños de razonamiento de tamaño similar (por ejemplo, Qwen2.5-1.5B-Instruct o Llama-3.2-1B-Instruct), aunque no se dispone de benchmarks publicados para estos últimos en la información proporcionada.

| Modelo | Parámetros | Contexto | MMLU (CoT) | GSM8K (CoT) | Licencia |
|---|---:|---:|---:|---:|---|
| Qwen3.5-2B (base) | ~2 B | no disponible | 0,283 | 0,330 | Apache-2.0 |
| **Qwen3.8-2B** (destilado) | ~1,94 B | no disponible | **0,548** | **0,640** | Apache-2.0 |
| Qwen2.5-1.5B-Instruct | ~1,5 B | 32 K | no disponible | no disponible | Apache-2.0 |
| Llama-3.2-1B-Instruct | ~1 B | 128 K | no disponible | no disponible | Llama 3.2 Community |

La destilación mejora sustancialmente el rendimiento respecto al base sin aumentar el número de parámetros. No se dispone de datos de otros modelos comparables en la misma categoría de tamaño y razonamiento para una comparativa más amplia.

## Limitaciones y advertencias

- **Idioma limitado**: el modelo solo declara soporte para inglés. No se recomienda su uso en otros idiomas sin evaluación previa.
- **Sesgos y alucinaciones**: no se documentan sesgos específicos, pero al ser un modelo entrenado mediante destilación puede heredar sesgos del profesor. El riesgo de alucinación existe, especialmente en tareas de conocimiento factual, dado su tamaño reducido.
- **Contexto no especificado**: no se indica la longitud máxima de contexto soportada. Se recomienda probar con ventanas cortas y aumentar gradualmente, vigilando el consumo de memoria del cache KV.
- **Requisito de versión de llama.cpp**: se necesita una compilación reciente con soporte para la arquitectura Qwen3.5 / Gated DeltaNet. Las versiones antiguas fallarán al cargar el modelo.
- **Modelo de razonamiento**: todas las respuestas abren con un bloque ` thinking`. Si se integra en producción, hay que extraer la respuesta final (después de ` response`) para mostrarla al usuario final; de lo contrario, la experiencia de usuario se verá afectada.
- **Licencia**: Apache-2.0 permite uso comercial sin restricciones, pero se debe mantener el aviso de copyright y la atribución correspondiente.
- **Sin garantías de soporte**: el proyecto Empero es de código abierto y no ofrece garantías de mantenimiento ni soporte técnico formal.

## Enlaces

- [Repositorio HuggingFace del modelo GGUF](https://huggingface.co/empero-ai/Qwen3.8-2B-GGUF)
- [Modelo base (safetensors)](https://huggingface.co/empero-ai/Qwen3.8-2B)
- [Modelo base original Qwen3.5-2B](https://huggingface.co/Qwen/Qwen3.5-2B)
- [Sitio web de Empero](https://empero.org)
- [Repositorio de llama.cpp](https://github.com/ggml-org/llama.cpp)
