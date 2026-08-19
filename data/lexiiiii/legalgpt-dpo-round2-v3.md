# Lexiiiii/legalgpt-dpo-round2-v3

## Resumen

LegalGPT-dpo-round2-v3 es un adaptador LoRA desarrollado por Lexiiiii para el modelo base Qwen/Qwen2.5-7B-Instruct, orientado a la consulta legal sin uso de RAG (recuperación aumentada). Forma parte de un proyecto de post-entrenamiento más amplio denominado LegalGPT, que combina una fase de SFT (supervised fine-tuning) seguida de varias rondas de DPO (direct preference optimization). Este checkpoint concreto corresponde a la segunda ronda de DPO, versión 3, y se publica como un experimento intermedio dentro de una línea de entrenamiento que culmina en el adaptador legalgpt-dpo-round5-v1.

El adaptador se distribuye bajo licencia Apache 2.0 y utiliza la biblioteca PEFT, por lo que no incluye los pesos completos del modelo, sino únicamente los deltas de LoRA. Al estar basado en Qwen2.5-7B-Instruct, hereda la arquitectura transformer decoder-only de 7.000 millones de parámetros y una ventana de contexto de 128.000 tokens, aunque no se confirma si el adaptador modifica o limita dicha ventana. Su relevancia radica en ofrecer una vía ligera y de bajo coste computacional para especializar un modelo general en el dominio jurídico, manteniendo la flexibilidad de poder cargarse sobre el modelo base mediante la librería `peft`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5) con adaptador LoRA |
| Parametros totales | No disponible (adaptador LoRA; modelo base: 7.000 millones) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 128.000 tokens (heredada del modelo base) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (el modelo base Qwen2.5 soporta chino e ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El adaptador se construye sobre Qwen2.5-7B-Instruct, un modelo de lenguaje de tipo transformer decoder-only con atención causal y normalización pre-RMSNorm. La técnica de ajuste empleada es LoRA (Low-Rank Adaptation) con rango 32 y alpha 64, aplicada únicamente a las proyecciones `q_proj` y `v_proj` de las capas de atención. Esta configuración reduce drásticamente el número de parámetros entrenables en comparación con un ajuste completo, lo que permite un entrenamiento eficiente en términos de memoria y tiempo.

El proceso de entrenamiento sigue el pipeline SFT → DPO del proyecto LegalGPT. Primero se realiza un ajuste supervisado con datos de consultas legales y respuestas esperadas, y posteriormente se aplica DPO en varias rondas para alinear las preferencias del modelo. Este checkpoint corresponde a la segunda ronda de DPO, versión 3, y se describe como un experimento de "ablación" (posiblemente variando hiperparámetros o datos). No se especifican detalles sobre el volumen de datos, la composición del dataset ni el número de pasos de entrenamiento. El modelo está diseñado para responder consultas legales sin depender de un sistema de recuperación externo (RAG), lo que implica que el conocimiento jurídico debe estar integrado en los pesos del adaptador.

## Capacidades

- Generación de texto y respuesta a preguntas en dominio legal, basado en el conocimiento adquirido durante el SFT y el DPO.
- Razonamiento y comprensión de consultas complejas, heredado del modelo base Qwen2.5-7B-Instruct.
- Soporte de tool calling y function calling, característica nativa del modelo base, aunque no se ha verificado su funcionamiento tras el ajuste.
- Capacidad multilingüe limitada: el modelo base soporta principalmente chino e inglés; el adaptador no especifica idiomas adicionales.
- No incluye capacidades de visión ni audio; es exclusivamente texto.

## Casos de uso

- Consulta legal interactiva: el modelo puede responder preguntas sobre normativas, derechos y obligaciones en un chat, aprovechando su entrenamiento específico en el dominio jurídico y la ventana de contexto de 128.000 tokens para manejar conversaciones largas con antecedentes.
- Asistencia para redacción de documentos: puede generar borradores de cláusulas, contratos o escritos legales, aunque se recomienda supervisión humana debido a posibles imprecisiones.
- Análisis de casos hipotéticos: el modelo puede razonar sobre escenarios legales planteados por el usuario y ofrecer una orientación preliminar, útil para estudiantes o profesionales que buscan un primer análisis.
- Integración en sistemas de atención al cliente de despachos de abogados: al ser un adaptador ligero, puede desplegarse en infraestructuras existentes con el modelo base para preclasificar consultas o proporcionar respuestas iniciales.
- Educación legal: puede utilizarse como herramienta de estudio para explicar conceptos jurídicos básicos o resolver dudas frecuentes.
- Prototipado de aplicaciones de legaltech: dado su tamaño reducido (solo el adaptador), permite iterar rápidamente en entornos de desarrollo con recursos limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos sobre MMLU, HumanEval, GSM8K ni métricas específicas de dominio legal para este adaptador.

## Requisitos de hardware

- VRAM estimada para inferencia: al ser un adaptador LoRA, los requisitos son los del modelo base Qwen2.5-7B-Instruct. En precisión FP16, se necesitan aproximadamente 14 GB de VRAM para los pesos del modelo más el adaptador. Con cuantización (por ejemplo, 4 bits), se puede reducir a unos 4-6 GB.
- GPU recomendadas: RTX 3090, RTX 4090, A100, H100, o cualquier GPU con al menos 16 GB de VRAM para FP16. Para cuantización, tarjetas con 8 GB pueden ser suficientes.
- Compatibilidad con GPU de consumo: sí, tarjetas como RTX 3060 12 GB o superiores pueden ejecutar el modelo cuantizado.
- Opciones de despliegue: se puede cargar mediante `transformers` + `peft` para inferencia en Python. También es compatible con frameworks como vLLM o TGI si se fusiona el adaptador con el modelo base. Para despliegue ligero, llama.cpp u Ollama pueden utilizarse tras convertir los pesos a GGUF.
- Latencia y throughput: no se dispone de datos medidos. En una GPU A100, se espera una latencia de decodificación de alrededor de 30-50 ms por token con FP16, dependiendo de la longitud de la secuencia.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa directa con otros adaptadores legales. El proyecto LegalGPT en su versión final (round5-v1) sería el punto de comparación natural, pero no se han publicado métricas. Frente al modelo base Qwen2.5-7B-Instruct, este adaptador añade especialización en el dominio legal, pero sacrifica posiblemente la generalidad. No hay datos públicos sobre otros modelos legales de tamaño similar (por ejemplo, LegalBERT, Lawformer) que permitan una comparación cuantitativa.

## Limitaciones y advertencias

- El adaptador no sustituye el asesoramiento legal profesional; las respuestas pueden contener errores, imprecisiones o interpretaciones incorrectas de la ley.
- Al ser un checkpoint intermedio (round2-v3), es posible que su rendimiento sea inferior al del modelo final del proyecto (round5-v1).
- No se especifica el idioma de los datos de entrenamiento; si el corpus es principalmente chino, el rendimiento en otros idiomas, incluido el español, puede ser muy limitado.
- Riesgo de alucinación: como cualquier modelo generativo, puede inventar citas legales, artículos o precedentes que no existen.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda revisar los términos del modelo base Qwen2.5, que también es Apache 2.0.
- El adaptador no incluye pesos completos; requiere cargar el modelo base de 7B, lo que implica un coste de almacenamiento y cómputo adicional.
- No se han publicado evaluaciones de sesgos ni de robustez ante ataques adversariales en el dominio legal.

## Enlaces

- [HuggingFace: Lexiiiii/legalgpt-dpo-round2-v3](https://huggingface.co/Lexiiiii/legalgpt-dpo-round2-v3)
- [Modelo base: Qwen/Qwen2.5-7B-Instruct](https://huggingface.co/Qwen/Qwen2.5-7B-Instruct)
- [Proyecto LegalGPT (GitHub)](https://github.com/czc0407/legalGPT)
