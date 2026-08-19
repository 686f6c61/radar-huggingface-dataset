# RuCoverLAB/RUcover-Lite-Mini-v1

## Resumen

RUcover-Lite-Mini-v1 es un modelo de lenguaje autorregresivo ligero desarrollado por RuCoverLAB, orientado exclusivamente al ruso. Con aproximadamente 10 millones de parámetros, está diseñado para entornos con recursos limitados, como aplicaciones móviles, sistemas embebidos o prototipos rápidos. Su arquitectura Transformer Decoder incorpora mejoras modernas como RoPE, RMSNorm y SwiGLU, lo que permite una generación de texto coherente y fluida en ruso, a pesar de su reducido tamaño.

El modelo se entrenó sobre un corpus de 4,3 GB de textos en ruso, que incluye prosa clásica y contemporánea, artículos de noticias, diálogos del dataset RLDD y textos divulgativos. Su relevancia actual radica en ofrecer una alternativa completamente abierta (licencia MIT) y de muy bajo coste computacional para tareas de generación de texto en ruso, especialmente cuando se necesitan velocidades de inferencia altas en CPU o GPU modestas. La longitud de contexto es de 1024 tokens y el vocabulario BPE es de 32 000 tokens.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Decoder (RoPE + RMSNorm + SwiGLU) |
| Parametros totales | ~10 millones |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 1024 tokens |
| Tipos de cuantizacion | No disponible (no se menciona cuantizacion) |
| Idiomas soportados | Ruso (unicamente) |
| Licencia | MIT |
| Formato de pesos | Archivo `.pt` (PyTorch) |

## Arquitectura y entrenamiento

RUcover-Lite-Mini es un modelo de lenguaje autorregresivo basado en la arquitectura Transformer Decoder. Utiliza incorporaciones posicionales rotativas (RoPE) para codificar la posición de los tokens, normalización RMSNorm en lugar de LayerNorm y funciones de activación SwiGLU en la red feed-forward. La configuración incluye 6 capas de atención con 6 cabezas, un tamaño de embedding de 384 y una dimensión de FFN de 1536. El modelo se entrena con un vocabulario BPE de 32 000 tokens, generado específicamente para ruso.

El entrenamiento se realizó sobre un corpus de 4,3 GB de texto en ruso, compuesto por prosa literaria, noticias, diálogos (dataset RLDD) y textos científicos divulgativos. No se menciona el uso de técnicas de alineación como RLHF o DPO; el modelo se entrena con un objetivo de modelado de lenguaje estándar (predicción del siguiente token). Tampoco se mencionan innovaciones técnicas más allá de las arquitectónicas ya indicadas. El proceso de entrenamiento no está documentado en detalle (número de pasos, tasa de aprendizaje, etc.).

## Capacidades

- Generación de texto coherente en ruso: puede crear relatos, poemas, noticias y respuestas a preguntas simples.
- Mantener diálogos básicos de pregunta-respuesta con contexto limitado (hasta 1024 tokens).
- Alta velocidad de generación: entre 40 y 60 tokens por segundo en CPU y más de 200 tokens por segundo en GPU, según la documentación del autor.
- Uso de memoria reducido: aproximadamente 500 MB de RAM durante la inferencia.
- Funciona exclusivamente en ruso; no tiene soporte multilingüe.
- No dispone de capacidades de tool calling, function calling, razonamiento multi-paso, visión, audio o modo de pensamiento.

## Casos de uso

- Asistente de escritura creativa en ruso: el modelo puede ayudar a redactar borradores de cuentos, poemas o artículos, dado su entrenamiento con prosa literaria y su capacidad para generar texto coherente.
- Chat de atención al cliente básico: con su contexto de 1024 tokens y su habilidad para mantener diálogos, puede gestionar conversaciones sencillas en ruso para soporte de productos, aunque no para tareas complejas.
- Generación de contenido para redes sociales: permite crear publicaciones, respuestas o comentarios en ruso con alta velocidad, adecuado para automatización de contenido.
- Aplicaciones educativas para el aprendizaje del ruso: puede generar ejemplos de oraciones, respuestas a preguntas comunes o ejercicios de práctica de escritura.
- Prototipos de aplicaciones de texto: su bajo coste computacional lo hace ideal para integrar en entornos de desarrollo rápidos, donde se necesita una generación de texto básica sin grandes requisitos de hardware.
- Herramientas de análisis de texto: aunque limitado, puede utilizarse para completar frases o generar continuaciones en tareas de procesamiento de lenguaje natural en ruso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar. La única métrica conocida es la velocidad de inferencia reportada por el autor (40–60 tokens/s en CPU, >200 tokens/s en GPU), pero no se ha verificado de forma independiente.

## Requisitos de hardware

- VRAM estimada para inferencia: al ser un modelo de 10M parámetros en FP32, el peso ocupa aproximadamente 40 MB. Con activaciones y memoria intermedia, se puede ejecutar en cualquier GPU con más de 1 GB de VRAM.
- GPU recomendadas: cualquier GPU moderna, incluidas tarjetas de consumo como NVIDIA GTX 1050 Ti, RTX 2060 o superiores. También funciona en GPU integradas (iGPU) con suficiente memoria.
- En CPU: funciona correctamente, con un consumo de RAM de ~500 MB, según la documentación.
- Opciones de despliegue: se puede usar con Hugging Face Transformers (AutoTokenizer, AutoModelForCausalLM) o con el código personalizado proporcionado en la model card. No se mencionan compatibilidades con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no se proporcionan datos exactos de latencia, pero la velocidad reportada de 40–60 tokens/s en CPU y >200 tokens/s en GPU da una idea del rendimiento esperado.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar con otros modelos pequeños en ruso. La documentación no menciona ningún benchmark ni comparación directa. Se puede considerar que modelos como GPT-2 (125M) o ruGPT-3 (125M) tienen más parámetros, pero no se conocen datos de rendimiento de RUcover-Lite-Mini frente a ellos. Por tanto, no se puede realizar una comparativa objetiva.

## Limitaciones y advertencias

- El modelo solo funciona en ruso; no es útil para otros idiomas.
- Longitud de contexto limitada a 1024 tokens, lo que restringe la coherencia en conversaciones largas o documentos extensos.
- No tiene capacidades de instrucción (instruction tuning), por lo que no sigue instrucciones complejas ni se puede utilizar para tareas de razonamiento avanzado.
- Riesgo de alucinación: como cualquier modelo de lenguaje, puede generar contenido plausible pero falso o sin sentido, especialmente en temas fuera de su dominio de entrenamiento.
- Sesgos potenciales: el corpus de entrenamiento incluye textos de diversas fuentes; pueden existir sesgos culturales o sociales inherentes a los datos, aunque no se han documentado específicamente.
- No se ha publicado información sobre cuantización, por lo que no se puede reducir su tamaño para dispositivos móviles.
- La licencia MIT permite uso comercial, pero el modelo no está auditado para aplicaciones de producción críticas.
- La documentación es escasa y no se han publicado evaluaciones independientes que verifiquen las afirmaciones de rendimiento.

## Enlaces

- HuggingFace: [RuCoverLAB/RUcover-Lite-Mini-v1](https://huggingface.co/RuCoverLAB/RUcover-Lite-Mini-v1)
- Otra variante del modelo (no oficial): [FigaAI/RUcover-Lite-Mini-v1](https://huggingface.co/FigaAI/RUcover-Lite-Mini-v1)
