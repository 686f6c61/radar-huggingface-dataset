# Atomic-Germ/Qwen3.8-2B-Distill-GGUF

## Resumen

Qwen3.8-2B-Distill-GGUF es un repositorio de cuantizaciones en formato GGUF del modelo empero-ai/Qwen3.8-2B, publicado por el usuario Atomic-Germ. El modelo subyacente es una destilación de parámetros completos del teacher Qwen3.8 2.4T A95B (MoE de 2,4 billones de parámetros totales y 95.000 millones activos) hacia la arquitectura densa de Qwen3.5-2B, el miembro más pequeno de la familia. El resultado es un modelo de 1.942.653.248 parámetros totales (unos 1,94B) orientado a razonamiento, publicado bajo licencia Apache-2.0 y distribuido exclusivamente en inglés.

La relevancia de esta ficha es doble. Por un lado, el modelo demuestra que la destilación de un teacher de escala frontera hacia una arquitectura de 2B produce ganancias muy grandes en tareas de razonamiento: sobre el modelo base Qwen3.5-2B, el estudiante pasa de 0,283 a 0,548 en MMLU con protocolo CoT (+0,265) y de 0,330 a 0,640 en GSM8K CoT (+0,310), usando el mismo harness y los mismos ajustes. Por otro, el repositorio de Atomic-Germ hace ese resultado desplegable en hardware de gama baja: el fichero Q4_K_M ocupa 1,312 GB y el autor indica que es ejecutable en teléfonos, placas SBC y portátiles modernos en CPU.

El contexto de uso es el de inferencia local con llama.cpp y runtimes compatibles (Ollama, LM Studio, Jan, KoboldCpp). Se trata, por tanto, de una pieza pensada para edge computing y prototipado sin GPU, más que para serving de alta concurrencia. La longitud de contexto no se especifica en la información disponible, y el arquitectura híbrida Gated DeltaNet del modelo exige una compilación reciente de llama.cpp.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con capas Gated DeltaNet y atención completa (proporción 3:1, tres capas Gated DeltaNet por cada capa de atención completa), heredada de Qwen3.5-2B |
| Parametros totales | 1.942.653.248 (~1,94B), dato real de safetensors |
| Parametros activos | No aplica: el modelo estudiante es denso. El teacher Qwen3.8 2.4T A95B sí es MoE (2,4T totales, 95B activos) |
| Longitud de contexto | No disponible en la informacion proporcionada. El ejemplo de uso de llama.cpp emplea `-n 16384`, que es longitud de generacion, no ventana de contexto |
| Tipos de cuantizacion | Q4_K_M (1,312 GB), Q5_K_M (1,455 GB), Q6_K (1,606 GB), Q8_0 (2,077 GB) y BF16 (3,897 GB, referencia a precision completa). Tamanos en GB decimales exactos (1 GB = 1.000.000.000 bytes) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache-2.0, heredada del modelo base Qwen |
| Formato de pesos | GGUF (llama.cpp); el modelo original empero-ai/Qwen3.8-2B se distribuye en safetensors |
| Modelo base declarado | empero-ai/Qwen3.8-2B (la model card tambien lista empero-ai/Qwen3.8-2B-Distill en las etiquetas) |
| Relacion con el base | quantized |
| Libreria | gguf |
| Tamano del repositorio | 10,3 GB |
| Pipeline | text-generation |
| Plantilla de chat | Integrada en el propio fichero GGUF (uso con `-cnv` en llama.cpp) |
| Sampling recomendado | temperature=0,6; top_p=0,95; top_k=20 |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-09-12 |

## Arquitectura y entrenamiento

El estudiante sigue la arquitectura de Qwen3.5-2B, descrita por el autor como un híbrido en el que por cada capa de atención completa hay tres capas Gated DeltaNet. Este diseno combina atención estándar con un mecanismo de estado recurrente con compuerta, lo que reduce el coste de memoria del caché KV en contextos largos. La consecuencia práctica más importante es de compatibilidad: se requiere una compilación reciente de llama.cpp con soporte de Qwen3.5 / Gated DeltaNet, ya que las versiones anteriores fallan al cargar la arquitectura.

El entrenamiento es una destilación de parámetros completos desde el teacher Qwen3.8 2.4T A95B (un MoE de 2,4 billones de parámetros totales y 95.000 millones activos) hacia la arquitectura de 2B, usando aproximadamente 30.000 trazas de profesor curadas procedentes de los conjuntos internos de destilación de Qwen3.8. No se indica en la información disponible si hubo fases posteriores de RLHF, DPO u optimización por preferencias, ni el número total de tokens de entrenamiento. El modelo es de razonamiento explícito: cada respuesta se abre con un bloque `<think>`, que debe extraerse antes de mostrar la salida al usuario final.

## Capacidades

- Generación de texto conversacional en inglés, con plantilla de chat embebida en el GGUF.
- Razonamiento con cadena de pensamiento explícita: emite bloques `<think>...</think>` antes de la respuesta final.
- Razonamiento matemático y aritmético de varios pasos: 0,640 en gsm8k_cot con protocolo CoT.
- Conocimiento general y académico en 57 materias: 0,548 en MMLU con CoT.
- Ejecución en CPU y en hardware de gama baja, incluyendo teléfonos y placas SBC.
- Compatibilidad con runtimes GGUF estándar: llama.cpp, Ollama, LM Studio, Jan y KoboldCpp, sin necesidad de código propio.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso orquestado: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles; el modelo se declara únicamente en inglés.
- Capacidades de visión o audio: no disponibles; el pipeline es text-generation.
- Capacidades especiales: modo de razonamiento (thinking) siempre activo, sin modificador de habilitación documentado.

## Casos de uso

- Inferencia local en teléfono o placa SBC: con el fichero Q4_K_M (1,312 GB) el modelo se ejecuta íntegramente en CPU sobre un teléfono o una Raspberry Pi, lo que permite asistentes de texto sin conexión y sin coste de API.
- Prototipado de aplicaciones de razonamiento en portátiles sin GPU: Q6_K o Q8_0 caben en cualquier GPU de 4 GB o en CPU con 8 GB de RAM, lo que permite validar prompts de CoT en un equipo de desarrollo estándar antes de escalar a un modelo mayor.
- Tutor o asistente educativo de matemáticas: los 0,640 de GSM8K CoT permiten resolver y explicar problemas aritméticos paso a paso, mostrando el bloque de razonamiento como justificación pedagógica.
- Evaluación comparativa de destilación: sirve como punto de referencia reproducible (mismo harness, mismos ajustes) frente a Qwen3.5-2B para medir la ganancia real de una destilación desde un teacher de escala frontera.
- Generación de texto en aplicaciones de escritorio con LM Studio o Jan: la plantilla de chat embebida permite cargar el GGUF directamente en herramientas de escritorio sin escribir código de tokenización.
- Chat conversacional con contexto largo en local: la arquitectura híbrida Gated DeltaNet reduce el coste del caché KV respecto a un transformer de atención completa del mismo tamano, lo que abarata mantener conversaciones multi-turno en memoria limitada.
- Filtrado y preprocesado de texto en pipelines de datos: el modelo puede clasificar, resumir o reformatear documentos en inglés ejecutándose en el mismo nodo que el pipeline, sin depender de servicios externos.
- Base para fine-tuning posterior sobre dominio propio: al ser Apache-2.0 y de solo 2B parámetros, es viable reentrenarlo o ajustarlo con LoRA sobre un único GPU consumer.

## Benchmarks y rendimiento

Resultados publicados por el autor para el modelo fuente (empero-ai/Qwen3.8-2B) con protocolos CoT en `lm-evaluation-harness`, con ajustes idénticos entre base y estudiante:

| Tarea | Qwen3.5-2B (base) | Qwen3.8-2B | Delta |
|---|---:|---:|---:|
| MMLU (CoT, 57 materias) | 0,283 | 0,548 | +0,265 |
| GSM8K CoT | 0,330 | 0,640 | +0,310 |

Las cifras corresponden al modelo sin cuantizar. En la información disponible no se publican resultados por cuantización (Q4_K_M, Q5_K_M, Q6_K, Q8_0, BF16), ni benchmarks de HumanEval, MT-Bench, MMLU-Pro u otras tareas. No se han publicado resultados de benchmarks adicionales en la información disponible.

## Requisitos de hardware

- Q4_K_M (1,312 GB de pesos): ejecutable en teléfonos, placas SBC y cualquier portátil moderno; el uso en CPU es plenamente utilizable a esta escala.
- Q5_K_M (1,455 GB de pesos): mismas recomendaciones que Q4_K_M, con mayor calidad a un coste de tamano modesto.
- Q6_K (1,606 GB de pesos): cualquier GPU de 4 GB o más, o CPU con 8 GB de RAM.
- Q8_0 (2,077 GB de pesos): cualquier GPU de 4 GB o más, o CPU con 8 GB de RAM.
- BF16 (3,897 GB de pesos): GPU de 6 GB o más.
- VRAM estimada con caché KV incluido: el autor advierte que el caché KV es el coste dominante en contexto largo, por lo que las cifras anteriores son cotas inferiores que solo son válidas a contexto moderado. La ventana de contexto no se especifica, por lo que no puede darse una estimación cerrada de VRAM a contexto máximo.
- GPU recomendadas: no se enumeran modelos concretos en la información disponible (A100, H100, RTX 4090, etc.). Las indicaciones del autor se expresan en umbrales de memoria (4 GB y 6 GB) y en capacidad de ejecución en CPU.
- Cabe en GPU consumer: sí, en cualquier GPU con 4 GB o más de VRAM para Q6_K y Q8_0, y 6 GB o más para BF16.
- Opciones de despliegue: llama.cpp (binario `llama-cli` con `-cnv`), Ollama, LM Studio, Jan y KoboldCpp. Requiere una compilación reciente de llama.cpp con soporte de Qwen3.5 / Gated DeltaNet; las versiones antiguas fallan al cargar la arquitectura. No se mencionan vLLM ni TGI como opciones soportadas para este formato.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento (MMLU CoT / GSM8K CoT) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-2B-Distill (GGUF de Atomic-Germ) | 1,94B densos | No disponible | 0,548 / 0,640 (medidos sobre el modelo sin cuantizar) | Apache-2.0 | GGUF en HuggingFace, 0 descargas, 0 likes |
| Qwen3.5-2B (base del estudiante) | ~2B densos | No disponible | 0,283 / 0,330 | Apache-2.0 | HuggingFace (Qwen/Qwen3.5-2B) |
| Qwen3.8 2.4T A95B (teacher) | 2,4T totales, 95B activos (MoE) | No disponible | No disponible | No disponible | No disponible |
| Alternativas de ~2B de otros fabricantes (Llama 3.x, Gemma 2, Phi-3-mini, etc.) | No disponible | No disponible | No disponible | No disponible | No disponible en la informacion proporcionada |

El único contraste con datos verificables que aporta la información disponible es el del propio base Qwen3.5-2B, sobre el que la destilación mejora +0,265 en MMLU CoT y +0,310 en GSM8K CoT. No se han proporcionado cifras comparativas frente a modelos de otros fabricantes de tamano similar.

## Limitaciones y advertencias

- Idioma: el modelo solo declara inglés (en). No hay evidencia de rendimiento en castellano ni en otros idiomas.
- Riesgo de alucinacion: no se documenta ninguna mitigación específica; el modelo es de razonamiento con CoT y puede producir cadenas de pensamiento plausibles pero incorrectas, especialmente en conocimiento factual.
- Modelo de razonamiento obligatorio: cada respuesta abre un bloque `<think>` que debe eliminarse antes de mostrarla al usuario. Si no se recorta, la salida es inutilizable en producción.
- Requisito de runtime: la arquitectura Gated DeltaNet exige una compilación reciente de llama.cpp. Las versiones antiguas fallan al cargar el modelo, lo que puede romper pipelines existentes.
- Contexto no documentado: no se publica la ventana de contexto del modelo, lo que impide dimensionar correctamente el caché KV en despliegues con conversaciones largas.
- Validacion comunitaria nula: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, sin evidencia independiente de calidad más alla de las dos cifras publicadas por el autor.
- Datos de entrenamiento limitados: la destilación usa aproximadamente 30.000 trazas de profesor, un volumen reducido que puede limitar la cobertura de dominios poco representados.
- Ambiguedad de procedencia: las etiquetas del repositorio apuntan a empero-ai/Qwen3.8-2B-Distill, mientras que el campo `base_model` y la model card apuntan a empero-ai/Qwen3.8-2B. Conviene verificar el repositorio de origen antes de citarlo en producción.
- Licencia: Apache-2.0 heredada del base Qwen, lo que permite uso comercial. El autor la distribuye "as-is", sin garantías.
- Ausencia de datos sobre sesgos: no se publica ninguna evaluación de sesgos, toxicidad o seguridad.
- La model card incluye direcciones de criptomonedas para donaciones; no deben confundirse con artefactos del modelo ni tratarse como canales oficiales de soporte técnico.

## Enlaces

- Repositorio GGUF: https://huggingface.co/Atomic-Germ/Qwen3.8-2B-Distill-GGUF
- Modelo base (destilado): https://huggingface.co/empero-ai/Qwen3.8-2B
- Modelo base de la arquitectura: https://huggingface.co/Qwen/Qwen3.5-2B
- llama.cpp (soporte de cuantización y de la arquitectura Qwen3.5 / Gated DeltaNet): https://github.com/ggml-org/llama.cpp
- Empero (desarrollador del modelo original): https://empero.org

Nota: la búsqueda web realizada no ha devuelto resultados relevantes sobre este modelo. Los resultados obtenidos corresponden a un fabricante de esquís, una cartera de criptomonedas, un servicio de correo y una serie de televisión, y no guardan relación con el modelo.
