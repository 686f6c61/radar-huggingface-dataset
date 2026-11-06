# CollectionStudio/Muse2-230M-Base

## Resumen

Muse2-230M-Base es un modelo de lenguaje compacto de tipo decoder-only desarrollado por Muse Research (publicado en Hugging Face bajo la cuenta CollectionStudio) y entrenado íntegramente desde cero: arquitectura, tokenizer y stack de inferencia. Forma parte de la colección Muse2, orientada a entornos edge y ejecución on-device donde el tamaño del modelo y la eficiencia de inferencia importan más que la fiabilidad factual.

La arquitectura es un transformer híbrido de inspiración LFM2 que intercala 8 bloques de convolución causal depthwise de kernel 3 con 6 bloques de atención completa con Grouped-Query Attention (GQA, 16 cabezas de query y 8 de key-value). Cada bloque incorpora un MLP SwiGLU paralelo fusionado (hidden 1024, ff 2560), con RMSNorm, RoPE con theta 1e6 y embeddings de entrada/salida atados. El modelo tiene 196,1 millones de parámetros reales (etiquetado comercialmente como 230M) y un vocabulario de 65.536 tokens BPE byte-level entrenado desde cero.

Se publica en versión base, sin alineamiento de seguridad ni RLHF/DPO, con licencia Apache-2.0. Su relevancia actual reside en ser un artefacto de investigación reproducible para estudiar arquitecturas híbridas compactas, extracción estructurada log-a-JSON y despliegue en hardware muy limitado, no como modelo de producción listo para usar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido convolution/attention (8 bloques de convolución causal depthwise kernel 3 + 6 bloques de atención completa), GQA 16Q/8KV, SwiGLU paralelo fusionado, RMSNorm, RoPE theta 1e6 |
| Parametros totales | 196.137.984 (etiquetado como 230M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 8k por defecto, máximo 128k |
| Tipos de cuantizacion | No disponible (el repo solo publica pesos en safetensors; no se documentan cuantizaciones oficiales) |
| Idiomas soportados | Inglés; también maneja código fuente y texto matemático |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (PyTorch, paquete `muse` propio, no nativo de `transformers`) |

## Arquitectura y entrenamiento

Muse2-230M es un modelo autorregresivo implementado desde cero en PyTorch bajo la clase `Muse2ForCausalLM`, sin código de `transformers`. El layout de 14 bloques intercala convoluciones causales depthwise cortas (kernel 3) con atención completa, una disposición híbrida orientada a reducir el coste de inferencia en hardware restringido. Emplea GQA con 16 cabezas de query y 8 de key-value, embeddings de entrada/salida atados (shared embeddings) y un tokenizer BPE byte-level de 65.536 tokens entrenado desde cero con tokens de control estilo ChatML (pad=0, bos=1, eos=7, `<|im_end|>`=4). El esquema de configuración sigue el layout de la familia LFM2 por compatibilidad con tooling edge, aunque la arquitectura no es una clase nativa de transformers.

La model card indica que el modelo se entrenó desde cero, pero no detalla el número de tokens de entrenamiento ni la composición exacta del dataset. La versión Instruct (no la Base aquí descrita) se alinea mediante supervised fine-tuning (SFT) con enmascaramiento de pérdida solo en la completion; no se ha aplicado RLHF ni DPO. El knowledge cutoff declarado es principios de 2024. No se documentan innovaciones adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto en inglés, incluyendo código fuente y texto matemático.
- Conversación multi-turno con plantilla de chat estilo ChatML (en la variante Instruct; la Base requiere prompting directo).
- Extracción estructurada de información: la model card destaca la conversión de logs de desarrollador a JSON y la salida con formato disciplinado.
- Soporte de salida estructurada (tag `structured-output` y `json`), orientado a extracción y formateo.
- Capacidades multilingües: limitadas al inglés (más código y matemáticas); no se declaran otros idiomas.
- Tool calling / function calling: no documentado en la información disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Extracción log-a-JSON: el modelo convierte logs de desarrollador en JSON conforme a un esquema proporcionado en el prompt; su entrenamiento orientado a formato y su ventana de 8k lo hacen adecuado para pipelines de observabilidad con salida estructurada.
- Formateo disciplinado de salida: generación de respuestas con estructura fija (plantillas, campos obligatorios) en entornos donde se prioriza el cumplimiento de formato sobre la precisión factual.
- Chat asistencial en dispositivos con recursos limitados: con 196M parámetros y pesos safetensors de ~0,4 GB, puede ejecutarse en CPU o GPUs de gama baja para asistentes locales de bajo consumo.
- Base para fine-tuning: al ser un modelo Base con licencia Apache-2.0, sirve como punto de partida para ajustar tareas específicas de dominio en investigación.
- Estudio de arquitecturas híbridas: reproducción y experimentación con layouts convolution/attention en entornos académicos, dado que tokenizer, arquitectura e inferencia son abiertos.
- Prototipado de herramientas edge: integración en aplicaciones on-device (asistentes de terminal, procesamiento local de logs) donde no se puede depender de la nube.
- Investigación educativa: análisis de comportamiento de modelos pequeños en tareas de razonamiento y formateo, con expectativas calibradas de alucinación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp32 los 196,1M parámetros ocupan aproximadamente 0,78 GB; en fp16/bf16 unos 0,39 GB; en cuantización de 8 bits unos 0,2 GB y en 4 bits unos 0,1 GB (estimaciones a partir del recuento de parámetros; el repo no publica cuantizaciones oficiales).
- GPU recomendadas: el autor menciona ejecución interactiva en una única T4 en la nube; también es viable en GPUs consumer de gama baja y en CPU.
- Cabe en GPU consumer: sí, en cualquier GPU con al menos ~1 GB de VRAM libre en fp32 (por ejemplo, GTX 1650, RTX 3050, RTX 4090) y en CPU.
- Opciones de despliegue: paquete `muse` propio con PyTorch y safetensors; scripts `scripts/chat.py` para CPU y `modal_app.py` para T4 en Modal. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Muse2-230M-Base | 196,1M | 8k (128k máx.) | Apache-2.0 | Hugging Face, paquete `muse` propio | Híbrido conv/attention, sin benchmarks publicados |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | No se dispone de datos de modelos comparables en la información proporcionada |

## Limitaciones y advertencias

- Sin alineamiento de seguridad: no se ha aplicado safety fine-tuning, red-teaming ni filtrado de contenido; puede generar salidas sesgadas, repetitivas u objetables.
- Alucinación elevada: la propia model card advierte que el modelo alucina hechos con facilidad a esta escala; no debe usarse para fiabilidad factual.
- Idiomas: solo inglés (más código y matemáticas); no se declaran capacidades en castellano ni en otros idiomas.
- Contexto: 8k por defecto con máximo de 128k, pero no se documenta el rendimiento real en ventanas largas.
- Licencia: Apache-2.0 permite uso comercial, pero las licencias de los datasets upstream siguen aplicando a usos derivados; el autor no garantiza idoneidad para producción.
- Uso fuera de alcance: despliegue en producción sin evaluación y guardrails del desarrollador, así como cualquier uso crítico (médico, legal, seguridad).
- Ecosistema: no es una clase nativa de `transformers`, lo que limita la integración con tooling estándar (vLLM, TGI, llama.cpp) salvo adaptación.
- Estado estático: es un modelo congelado; pueden aparecer versiones posteriores con capacidades mejoradas.

## Enlaces

- Hugging Face: https://huggingface.co/CollectionStudio/Muse2-230M-Base
- No se han encontrado otros enlaces (papers, blogs, repos, demos) en la información proporcionada.
