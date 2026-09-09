# CollectionStudio/Trinity-Mini

## Resumen

Trinity Mini es un modelo de lenguaje de mezcla de expertos (MoE) desarrollado por Arcee AI y publicado en HuggingFace por CollectionStudio. Es la version intermedia de la familia Trinity, una serie de modelos abiertos pensados para entornos empresariales y para usuarios tecnicos. El modelo se basa en el checkpoint `arcee-ai/Trinity-Mini-Base` y esta afinado especificamente para razonamiento, manteniendo un consumo total de tokens similar al de modelos instructivos competidores.

El modelo tiene 26.100 millones de parametros totales, de los cuales solo 3.000 millones se activan en cada token, con 128 expertos en total, 8 activos y 1 compartido. Ofrece una ventana de contexto de 128.000 tokens y ha sido entrenado sobre 10 billones de tokens curados en colaboracion con Datology. Su relevancia actual radica en proporcionar la calidad de un modelo grande con el coste computacional de uno mucho mas pequeno, lo que lo hace apto para despliegues eficientes en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | AfmoeForCausalLM |
| Parametros totales | 26.123.974.400 |
| Parametros activos | 3.000.000.000 (3B) |
| Longitud de contexto | 128.000 tokens |
| Tipos de cuantizacion | GGUF `q4_k_m` mencionado en instrucciones de llama.cpp; safetensors en bf16. No se publica una lista completa de cuantizaciones |
| Idiomas soportados | en, es, fr, de, it, pt, ru, ar, hi, ko, zh |
| Licencia | OpenMDW-1.1 |
| Formato de pesos | safetensors, transformers, GGUF |

## Arquitectura y entrenamiento

Trinity Mini es un modelo MoE de la clase `AfmoeForCausalLM`, con 128 expertos de los que se activan 8 por token y 1 experto compartido. La arquitectura continua la linea de Arcee AI iniciada con AFM-4.5B, adoptando un esquema de activacion esparcida que permite reducir el coste por token manteniendo una capacidad total de 26B.

El entrenamiento se realizo sobre 10T tokens, curados y seleccionados en colaboracion con Datology, partiendo del dataset usado para AFM-4.5B y anadiendo datos adicionales de matematicas y codigo. El cluster de entrenamiento fue de 512 GPUs H200 de Prime Intellect, usando paralelismo HSDP. No se detalla en la informacion disponible si hubo etapas de RLHF o DPO mas alla del ajuste para razonamiento.

## Capacidades

- Generacion de texto conversacional con plantilla de chat, usando `apply_chat_template`.
- Razonamiento especificamente afinado, con consumo de tokens totales comparable al de modelos instructivos de su categoria.
- Programacion y matematicas, al estar entrenado con un dataset que incluye estas areas de forma adicional.
- Tool calling, compatible con `--enable-auto-tool-choice` y `--tool-call-parser hermes` en vLLM.
- Soporte de agentes, combinable con parsers de herramienta y razonamiento para flujos multi-paso.
- Multilingue en 11 idiomas: ingles, espanol, frances, aleman, italiano, portugues, ruso, arabe, hindi, coreano y chino.
- Ventana de contexto larga de 128.000 tokens, adecuada para analisis de documentos extensos.
- Eficiencia MoE con 3B parametros activos, lo que reduce la carga computacional en comparacion con un modelo denso de 26B.

## Casos de uso

- Atencion al cliente multilingue: gracias a sus 128k de contexto y soporte para 11 idiomas, puede gestionar conversaciones largas con clientes de distintas regiones, manteniendo el historial completo de la interaccion.
- Analisis de documentos legales o tecnicos: la ventana de 128.000 tokens permite procesar contratos, informes o manuales extensos sin necesidad de fragmentar el texto.
- Razonamiento sobre datos complejos: el modelo esta afinado para razonamiento, por lo que puede usarse en tareas de analisis, sintesis y extraccion de conclusiones a partir de informacion estructurada.
- Generacion de codigo en produccion: el entrenamiento adicional en matematicas y codigo lo hace adecuado para tareas de programacion, integrandose en pipelines de desarrollo con tool calling.
- Asistentes con llamada a funciones: con vLLM y el parser Hermes, puede ejecutar herramientas externas, consultar bases de datos o invocar APIs dentro de un flujo conversacional.
- Despliegue eficiente en GPU de uso general: al activar solo 3B de parametros, ofrece una alternativa interesante para entornos con recursos limitados en comparacion con modelos densos de 26B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye una grafica de benchmarks, pero no hay valores numericos transcritos en el texto proporcionado.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio de pesos safetensors pesa 52,3 GB, por lo que en bf16 se requieren aproximadamente 52 GB de memoria de GPU, sin contar la cache KV ni las activaciones.
- GPU recomendadas: H100, A100 80GB o GPUs con memoria similar para ejecutar el modelo completo en bf16.
- Inferencia en GPU de consumo: con cuantizacion GGUF `q4_k_m` podria caber en una GPU de 24 GB, aunque no hay datos oficiales de VRAM en la informacion disponible.
- Opciones de despliegue: transformers (branch main o `trust_remote_code=True`), vLLM 0.11.1, llama.cpp b7061, LM Studio y OpenRouter API.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No disponible. En la informacion proporcionada no se incluyen datos comparativos con otros modelos de la misma categoria.

## Limitaciones y advertencias

- No se detallan sesgos conocidos en la informacion disponible; como todo modelo de lenguaje, puede reflejar sesgos presentes en sus datos de entrenamiento.
- Riesgo de alucinacion no cuantificado en la informacion disponible.
- La licencia OpenMDW-1.1 debe revisarse antes de utilizarlo en entornos comerciales, ya que la informacion no aclara todas las restricciones.
- La lista de cuantizaciones es limitada: solo se menciona `q4_k_m` en las instrucciones de llama.cpp.
- Requiere versiones especificas de software: transformers en la rama main, vLLM superior o igual a 0.11.1 y llama.cpp b7061.
- No se han publicado resultados numericos de benchmarks, lo que dificulta la comparacion con modelos alternativos.

## Enlaces

- https://huggingface.co/CollectionStudio/Trinity-Mini
- https://huggingface.co/CollectionStudio/Trinity-Mini-Base
- https://huggingface.co/arcee-ai/Trinity-Mini-Base
- https://www.arcee.ai/blog/the-trinity-manifesto
- https://openrouter.ai/arcee-ai/trinity-mini
- https://github.com/huggingface/transformers
- https://github.com/ggml-org/llama.cpp/releases
