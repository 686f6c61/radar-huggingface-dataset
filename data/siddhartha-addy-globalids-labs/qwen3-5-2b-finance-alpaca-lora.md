# siddhartha-addy-globalids-labs/qwen3.5-2b-finance-alpaca-lora

## Resumen

El modelo `qwen3.5-2b-finance-alpaca-lora` es un adaptador LoRA (Low-Rank Adaptation) aplicado sobre el modelo base Qwen 3.5 2B, desarrollado por el usuario `siddhartha-addy-globalids-labs`. Se ha ajustado con una única época sobre el dataset Finance-Alpaca, compuesto por pares de instrucción-respuesta centrados en conceptos y preguntas financieras. El objetivo declarado es explorar el ajuste eficiente de parámetros (PEFT) en un modelo pequeño para tareas de dominio financiero, sirviendo como experimento de investigación y demostración de la técnica LoRA.

La relevancia actual radica en que Qwen 3.5 representa la generación "nativa multimodal agente" de la familia Qwen, con capacidades mejoradas de razonamiento, visión y uso de herramientas. Sin embargo, este adaptador se limita a texto y no incorpora las capacidades multimodales del modelo base. Al tratarse de un ajuste LoRA de una sola época, el modelo no está validado profesionalmente para uso financiero real, y su autor lo presenta explícitamente como una herramienta de experimentación, no como un asesor financiero.

El repositorio contiene los pesos en formato safetensors (4,4 GB), lo que sugiere que incluye el modelo base fusionado con el adaptador, aunque la documentación indica que se puede cargar como adaptador PEFT independiente. El número total de parámetros es de 2.213.241.664, correspondiente al modelo base Qwen 3.5 2B.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (basada en Qwen 3.5 2B); detalles específicos de la arquitectura del modelo base no disponibles |
| Parametros totales | 2.213.241.664 (modelo base Qwen 3.5 2B) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el repositorio contiene safetensors, probablemente en FP16/BF16) |
| Idiomas soportados | Inglés (en) |
| Licencia | No disponible (sujeta a la licencia del modelo base Qwen 3.5 y del dataset Finance-Alpaca) |
| Formato de pesos | safetensors; compatible con PEFT (adaptador LoRA) |

## Arquitectura y entrenamiento

El modelo se basa en Qwen 3.5 2B, un modelo de lenguaje causal de la familia Qwen. La arquitectura interna del modelo base no se detalla en la documentación del adaptador; según la información pública de Qwen 3.5, algunos modelos de esta generación incorporan atención lineal para mejorar la eficiencia de inferencia, pero no se confirma si el modelo de 2B la utiliza. El adaptador LoRA introduce un número reducido de parámetros entrenables que se añaden a las capas del modelo base, sin modificar el resto de pesos.

El entrenamiento se realizó con el framework Unsloth, utilizando el dataset Finance-Alpaca, que contiene ejemplos de instrucciones y respuestas sobre temas financieros. Se empleó una única época y los parámetros de entrenamiento restantes se dejaron en sus valores por defecto. No se menciona el uso de técnicas como RLHF o DPO; el ajuste es exclusivamente supervisado sobre el dataset de instrucciones.

## Capacidades

- Generación de texto en inglés, orientada a responder instrucciones y preguntas sobre conceptos financieros básicos (acciones, bonos, etc.).
- Seguimiento de instrucciones en formato conversacional, gracias al ajuste con el dataset Finance-Alpaca.
- Capacidad de razonamiento limitada, heredada del modelo base Qwen 3.5 2B, aunque no se han publicado evaluaciones específicas.
- No se documenta soporte para tool calling, agentes, razonamiento multi-paso, visión, audio ni modos de pensamiento explícitos.
- El modelo no tiene acceso a datos de mercado en tiempo real ni a información actualizada más allá de su conocimiento de entrenamiento.

## Casos de uso

- Investigación académica sobre adaptación de dominio: el modelo sirve como ejemplo práctico de cómo aplicar LoRA a un modelo pequeño para especializarlo en un dominio concreto, permitiendo estudiar el impacto de una sola época de ajuste.
- Demostración de PEFT en entornos educativos: se puede utilizar en cursos o talleres para ilustrar el flujo de trabajo de fine-tuning eficiente con Unsloth y PEFT, sin necesidad de grandes recursos computacionales.
- Prototipado de asistentes de preguntas frecuentes financieras: puede responder consultas genéricas sobre conceptos como diferencia entre acciones y bonos, aunque con riesgo de errores, por lo que solo es adecuado para entornos controlados de prueba.
- Evaluación comparativa de modelos pequeños en dominios específicos: permite comparar el rendimiento de un modelo de 2B ajustado con LoRA frente a otros modelos de tamaño similar en tareas financieras, para investigar los límites de la adaptación eficiente.
- Generación de contenido educativo preliminar: puede producir explicaciones sencillas de términos financieros que un humano debe revisar y validar antes de su publicación.
- Experimentación con integración en pipelines de generación aumentada por recuperación (RAG): al ser un modelo ligero, puede servir como generador de respuestas en sistemas RAG financieros de prueba, siempre que se verifique la salida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas como MMLU, HumanEval o GSM8K, ni comparaciones con otros modelos. El autor no reporta ningún dato de rendimiento cuantitativo.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de 2.2B parámetros, en FP16 los pesos ocupan aproximadamente 4,4 GB. Con overhead de activaciones y memoria del runtime, se estima un consumo de entre 6 y 8 GB de VRAM para inferencia con contexto moderado.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM, como NVIDIA RTX 3060/3070/4060, RTX 4070, o GPUs de datacenter como A10 o T4. También puede ejecutarse en CPU con cuantización, aunque con mayor latencia.
- Compatibilidad con GPU de consumo: sí, cabe en la mayoría de GPUs consumer modernas con 8 GB o más.
- Opciones de despliegue: al ser un adaptador PEFT, se puede cargar con la librería `transformers` y `peft` en Python. También es posible convertirlo a GGUF para usarlo con llama.cpp u Ollama, aunque no se proporciona una conversión oficial. Para despliegue en producción, se podría usar vLLM o TGI, pero requeriría fusionar el adaptador con el modelo base.
- Latencia y throughput: no se dispone de datos medidos. En una GPU consumer de gama media, se espera una generación de decenas de tokens por segundo, pero no hay cifras oficiales.

## Comparativa con modelos similares

No se dispone de datos de rendimiento del modelo, por lo que la comparativa se limita a características generales. Se compara con otros modelos pequeños de la familia Qwen y con alternativas de tamaño similar.

| Modelo | Parametros | Contexto | Dominio | Licencia |
|---|---|---|---|---|
| qwen3.5-2b-finance-alpaca-lora (este) | 2.2B | No disponible | Finanzas (ajustado) | No disponible |
| Qwen 3 1.7B | 1.7B | 32K (según documentación de Qwen3) | General | Apache 2.0 |
| Qwen 2.5 1.5B | 1.5B | 32K | General | Apache 2.0 |
| Llama 3.2 1B | 1.2B | 128K | General | Llama 3.2 Community License |

La comparación es orientativa; no se han encontrado modelos específicamente ajustados para finanzas con el mismo tamaño y licencia comparable. El modelo base Qwen 3.5 2B no tiene una ficha pública detallada en la información disponible.

## Limitaciones y advertencias

- Puede generar información financiera incorrecta o plausible pero falsa, como advierte el propio autor.
- No tiene acceso a datos de mercado en tiempo real ni a información actualizada; su conocimiento está limitado por el modelo base y el dataset de ajuste.
- El ajuste con una sola época no garantiza un rendimiento óptimo; es un experimento, no un modelo validado.
- No ha sido evaluado profesionalmente para aplicaciones financieras; no debe utilizarse como única fuente para decisiones de inversión o asesoramiento.
- La licencia no está especificada; depende de la licencia del modelo base Qwen 3.5 y del dataset Finance-Alpaca, que deben revisarse antes de cualquier uso comercial o redistribución.
- Solo soporta inglés; no se ha entrenado para otros idiomas.
- No se documentan capacidades de tool calling, agentes ni razonamiento multi-paso, por lo que no es adecuado para tareas que requieran interacción con herramientas externas.
- El repositorio tiene 0 descargas y 1 like, lo que indica un uso muy limitado y poca validación comunitaria.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/siddhartha-addy-globalids-labs/qwen3.5-2b-finance-alpaca-lora
- Artículo sobre Qwen 3.5 (Medium, no oficial): https://medium.com/data-science-in-your-pocket/qwen-3-5-explained-architecture-upgrades-over-qwen-3-benchmarks-and-real-world-use-cases-af38b01e9888
- Repositorio oficial de Qwen3 (GitHub): https://github.com/QwenLM/Qwen3
- Página de Qwen3.5-27B en QwenCloud: https://www.qwencloud.com/models/qwen3.5-27b
