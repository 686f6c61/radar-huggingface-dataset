# OpenFlowLM/Qwen3.5-2B-NPU2

## Resumen

Qwen3.5-2B-NPU2 es una variante empaquetada del modelo Qwen3.5-2B, publicada por el usuario OpenFlowLM (con presencia paralela del repositorio FastFlowLM/Qwen3.5-2B-NPU2 en Hugging Face). Se trata de un modelo causal con codificador de visión, de 2.000 millones de parámetros y 262.144 tokens de contexto nativo, derivado por fine-tuning del checkpoint Qwen/Qwen3.5-2B-Base. La relevancia de esta ficha concreta no está en el modelo base, sino en el empaquetado: las etiquetas del repositorio (npu2, fastflowlm, q4nx, froggeric-v22.4.0) indican una build orientada a ejecución sobre NPU con un formato de cuantización de 4 bits específico, lo que la sitúa en el nicho de inferencia local en dispositivos con acelerador neuronal.

El modelo pertenece a la familia Qwen3.5 de Alibaba Cloud, que introduce una arquitectura híbrida: capas de Gated DeltaNet (atención lineal recurrente) combinadas con capas de atención con puerta (Gated Attention), lo que reduce el coste de caché KV en contextos largos. La model card declara 24 capas, dimensión oculta de 2048 y un vocabulario de 248.320 tokens, además de entrenamiento con multi-token prediction (MTP) en varios pasos.

El interés práctico de esta variante es doble: por un lado, permite prototipar y hacer fine-tuning específico de tarea a un coste muy bajo; por otro, valida el despliegue de un modelo de 2B con capacidades multimodales y agenticas en hardware de borde, algo que hasta hace poco requería modelos de mayor tamaño o cuantizaciones más agresivas. El repositorio ocupa 3,1 GB y la licencia es Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal híbrido con codificador de visión; alternancia de Gated DeltaNet (atención lineal) y Gated Attention. Patrón: 6 × (3 × (Gated DeltaNet → FFN) → 1 × (Gated Attention → FFN)) |
| Parametros totales | 2B |
| Parametros activos | No disponible. La model card de la serie menciona MoE disperso a nivel de familia, pero la overview de la variante de 2B no detalla expertos ni parámetros activos |
| Longitud de contexto | 262.144 tokens nativos |
| Tipos de cuantizacion | q4nx (etiqueta del repositorio, build para NPU); el ecosistema general admite GGUF (llama.cpp/Ollama) y pesos BF16 en safetensors |
| Idiomas soportados | La serie Qwen3.5 declara 201 idiomas y dialectos; el repositorio no lista idiomas concretos ("no disponible") |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (transformers) y artefactos q4nx para el runtime FastFlowLM/NPU |
| Dimension oculta | 2048 |
| Numero de capas | 24 |
| Tamano de vocabulario | 248.320 (con padding), salida LM atada al embedding |
| FFN (dimension intermedia) | 6144 |
| Gated DeltaNet | 16 cabezas de atención lineal para V y 16 para QK; dimensión de cabeza 128 |
| Gated Attention | 8 cabezas para Q y 2 para KV; dimensión de cabeza 256; dimensión RoPE 64 |
| MTP | Entrenado con multi-token prediction en varios pasos |
| Pipeline | image-text-to-text |
| Tamano del repositorio | 3,1 GB |

## Arquitectura y entrenamiento

Qwen3.5-2B es un modelo de lenguaje causal con codificador de visión, entrenado en dos fases (pre-entrenamiento y post-entrenamiento). Su rasgo arquitectónico principal es la hibridación: de las 24 capas, 18 corresponden a bloques Gated DeltaNet (atención lineal con estado recurrente) y 6 a bloques Gated Attention (atención completa con solo 2 cabezas KV y dimensión de cabeza 256). Esto implica que únicamente una cuarta parte de las capas mantiene caché KV que crece con la secuencia, mientras que el resto usa representaciones de estado de tamaño fijo. En la práctica, el coste de memoria por token es mucho menor que en un transformer denso equivalente, lo que hace viable sostener ventanas de 262.144 tokens.

La familia Qwen3.5 declara fusión temprana sobre tokens multimodales, lo que permite paridad entre generaciones con Qwen3 y, según el autor, supera a los modelos Qwen3-VL en razonamiento, código, agentes y comprensión visual. También se menciona escalado de RL sobre entornos de millones de agentes y una infraestructura de entrenamiento asíncrona con eficiencia multimodal cercana al 100 % respecto a texto puro. El modelo incorpora MTP entrenado con varios pasos, técnica que en la familia Qwen se ha usado para decodificación especulativa. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni los detalles del proceso de alineación (RLHF/DPO).

En cuanto a esta build concreta, las etiquetas indican una conversión a formato q4nx y a un perfil npu2 para el runtime FastFlowLM, con versiones de toolchain fijadas (froggeric-v22.4.0). No se documenta en el repositorio el proceso de cuantización, la pérdida de calidad asociada ni las capas que se mantienen en mayor precisión.

## Capacidades

- Generación de texto conversacional multi-turno, con modo instruct (no thinking) confirmado en los benchmarks publicados.
- Comprensión de imagen y texto (pipeline image-text-to-text), heredada del codificador de visión del modelo base.
- Razonamiento y conocimiento general a escala de 2B: MMLU-Pro 55,3 y MMLU-Redux 69,2 en modo instruct.
- Capacidades multilingües amplias: la serie declara cobertura de 201 idiomas y dialectos.
- Razonamiento sobre código y matemáticas: la familia declara paridad con Qwen3 en benchmarks de coding y agentes, aunque no se han publicado cifras específicas de HumanEval o GSM8K para esta variante en la información disponible.
- Soporte de tool calling y function calling: no confirmado de forma explícita en la información disponible, aunque el modelo base se anuncia con compatibilidad con vLLM, SGLang y KTransformers, lo que habilita plantillas de herramientas.
- Capacidades agenticas y razonamiento multi-paso: la familia menciona RL sobre entornos multiagente, pero no hay validación publicada para la variante de 2B.
- Entrenamiento con multi-token prediction (MTP), que habilita decodificación especulativa interna.
- Ejecución sobre NPU mediante el formato q4nx del runtime FastFlowLM.

## Casos de uso

- Asistente multimodal embebido en portátiles con NPU: la build npu2 con cuantización q4nx está pensada para ejecutarse en aceleradores neuronales integrados, lo que permite un asistente local con entrada de imagen y texto sin depender de la nube ni de GPU dedicada.
- Prototipado rápido y fine-tuning específico de tarea: con 2B de parámetros, el coste de ajuste fino sobre un dominio concreto (soporte técnico, terminología interna) es bajo, y la licencia Apache-2.0 permite redistribuir el resultado.
- RAG sobre documentación extensa: los 262.144 tokens de contexto permiten insertar manuales completos o conjuntos de documentos en una sola ventana, reduciendo la necesidad de troceado agresivo y de reordenación por relevancia.
- Procesamiento de documentos con imagen: al aceptar entrada image-text-to-text, puede extraer información de capturas, diagramas o formularios escaneados combinándola con el texto circundante en una misma consulta.
- Clasificación y moderación multilingüe en el borde: con cobertura declarada de 201 idiomas, es viable filtrar o etiquetar contenido en muchos idiomas dentro de la propia aplicación, sin enviar datos a terceros.
- Agentes ligeros en pipelines internos: para tareas de extracción, resumen y encadenamiento de pasos donde la latencia importa más que la profundidad de razonamiento; su tamaño permite ejecutar varias instancias en paralelo en una sola máquina.
- Generación de código asistida en editor local: útil para autocompletado, explicación de fragmentos y generación de tests, integrable vía Ollama o llama.cpp en el propio entorno de desarrollo.
- Preprocesado y enrutado de consultas: actuar como clasificador o generador de consultas intermedias delante de un modelo mayor, reduciendo el coste por petición.

## Benchmarks y rendimiento

Resultados publicados en la model card para el modo instruct (no thinking). La tabla original está truncada en la información disponible, por lo que solo se reproducen las métricas completas:

| Modelo | MMLU-Pro | MMLU-Redux | C-Eval |
|---|---|---|---|
| Qwen3-4B-2507 | 69,6 | 84,2 | 80,2 |
| Qwen3.5-2B | 55,3 | 69,2 | 65,2 |
| Qwen3-1.7B | 40,2 | 64,4 | 61,0 |
| Qwen3.5-0.8B | 29,7 | 48,5 | 46,4 |

No se han publicado en la información disponible resultados de HumanEval, GSM8K, MMLU general, benchmarks de visión ni métricas de agentes para esta variante. Tampoco hay cifras de throughput o latencia para el formato q4nx sobre NPU.

## Requisitos de hardware

- VRAM para inferencia en BF16: en torno a 4-5 GB considerando 2B de parámetros más el codificador de visión (estimación a partir del recuento de parámetros; no confirmada por el autor).
- Cuantización q4nx: el repositorio completo ocupa 3,1 GB, cifra que incluye todos los artefactos; el peso efectivo del modelo cuantizado a 4 bits es sustancialmente menor (estimación aproximada de 1,2-1,5 GB, no confirmada).
- Caché KV: solo 6 de las 24 capas usan atención completa con 2 cabezas KV de dimensión 256, lo que reduce drásticamente el crecimiento de memoria con la secuencia frente a un transformer denso equivalente. Aun así, 262.144 tokens exigen planificación de memoria; no hay cifras oficiales publicadas.
- GPU consumer: cabe con holgura en RTX 3060 12 GB, RTX 4060 Ti, RTX 4070 y superiores en BF16; en cuantizaciones de 4 bits es viable en GPUs de 6-8 GB.
- GPU de datacenter: A100, H100 y L40S pueden servir muchas instancias concurrentes en paralelo, aunque el modelo está pensado para uso local más que para servicio masivo.
- Aceleradores neuronales: la build npu2 apunta a NPUs de PC (perfil compatible con runtimes tipo FastFlowLM). Qualcomm mantiene una entrada específica para Qwen3.5-2B en su AI Hub para inferencia en dispositivo.
- Opciones de despliegue: transformers, vLLM, SGLang y KTransformers (según la model card del modelo base), además de llama.cpp, Ollama (existe la etiqueta qwen3.5:2b en la librería oficial) y el runtime FastFlowLM para NPU.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | MMLU-Pro (instruct) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-2B (esta variante) | 2B | 262.144 | 55,3 | Apache-2.0 | Hugging Face, Ollama, Qualcomm AI Hub, builds NPU |
| Qwen3-1.7B | 1,7B | No disponible en la informacion | 40,2 | Apache-2.0 (familia Qwen3) | Hugging Face |
| Qwen3-4B-2507 | 4B | No disponible en la informacion | 69,6 | Apache-2.0 (familia Qwen3) | Hugging Face |
| Qwen3.5-0.8B | 0,8B | No disponible en la informacion | 29,7 | Apache-2.0 | Hugging Face |

El patrón es claro: Qwen3.5-2B se sitúa unos 15 puntos por encima de Qwen3-1.7B en MMLU-Pro con solo 0,3B más de parámetros, pero queda 14 puntos por debajo de Qwen3-4B-2507. La ventaja diferencial de esta variante no es el benchmark, sino la combinación de contexto de 262.144 tokens, entrada multimodal y empaquetado para NPU, que no ofrecen los modelos comparables de la tabla.

## Limitaciones y advertencias

- Escala de 2B: el rendimiento en MMLU-Pro (55,3) queda lejos de modelos de 4B y de cualquier modelo de frontera. No es adecuado para tareas que exijan razonamiento profundo o conocimiento factual extenso.
- Riesgo de alucinación: inherente a modelos de este tamaño, especialmente en preguntas factuales abiertas y en contextos largos donde la información relevante queda diluida entre 262.144 tokens.
- Idiomas: la familia declara 201 idiomas, pero no se publican evaluaciones por idioma. El rendimiento en castellano y en lenguas minoritarias no está verificado para esta variante.
- Benchmarks incompletos: la tabla de la model card está truncada en la información disponible, y no hay datos de visión, código, matemáticas ni agentes. No se puede asumir que las afirmaciones de la familia se trasladen a la variante de 2B.
- Modo thinking: los benchmarks publicados son de modo instruct (no thinking); no hay resultados para un hipotético modo de razonamiento extendido.
- Build q4nx: no se documenta la pérdida de calidad introducida por la cuantización de 4 bits ni las capas preservadas en mayor precisión. La validación del runtime FastFlowLM corresponde al publicador, no a Qwen.
- Dependencia de toolchain: la etiqueta froggeric-v22.4.0 fija una versión concreta del pipeline de conversión, lo que puede complicar la reproducibilidad si esa versión deja de mantenerse.
- Duplicidad de repositorios: existen al menos dos espacios (OpenFlowLM y FastFlowLM) con el mismo artefacto, sin documentación que aclare cuál es el canónico. El repositorio en OpenFlowLM registra 0 descargas y 0 likes en el momento de la consulta.
- Licencia: Apache-2.0 permite uso comercial y modificación, pero conviene revisar la licencia del modelo base enlazada por el autor para confirmar condiciones adicionales de atribución.
- Producción: sin datos de latencia, throughput ni evaluación de estabilidad en NPU, no es recomendable desplegarlo en producción crítica sin una batería de pruebas propia.

## Enlaces

- Repositorio en Hugging Face (OpenFlowLM): https://huggingface.co/OpenFlowLM/Qwen3.5-2B-NPU2
- Repositorio equivalente en FastFlowLM: https://huggingface.co/FastFlowLM/Qwen3.5-2B-NPU2
- Modelo base Qwen3.5-2B: https://huggingface.co/Qwen/Qwen3.5-2B
- Blog oficial de Qwen3.5: https://qwen.ai/blog?id=qwen3.5
- Ficha en Qualcomm AI Hub: https://aihub.qualcomm.com/mobile/models/qwen3_5_2b
- Entrada en la librería de Ollama: https://ollama.com/library/qwen3.5:2b
- Ficha de terceros con benchmarks: https://free2aitools.com/model/fastflowlm/qwen3.5-2b-npu2
