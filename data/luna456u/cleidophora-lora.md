# Luna456u/cleidophora-lora

## Resumen

cleidophora-lora es un adaptador LoRA publicado en Hugging Face por el usuario Luna456u, entrenado mediante SFT (supervised fine-tuning) sobre el modelo base cuantizado nassimjp/Ministral-8B-Instruct-2410-4bit. El repositorio contiene únicamente los pesos del adaptador en formato safetensors (0,2 GB), no un modelo completo, por lo que su uso requiere cargar el modelo base y aplicar el adaptador mediante la librería PEFT. La model card está prácticamente vacía: el autor no documenta el propósito del fine-tuning, los datos empleados, los hiperparámetros ni los resultados de evaluación.

El interés de esta ficha es limitado y fundamentalmente técnico: se trata de un artefacto de investigación sin métricas publicadas, sin licencia declarada y sin idiomas especificados, lo que lo hace inadecuado para uso en producción sin una evaluación previa por parte del usuario. Su relevancia actual deriva del ecosistema en el que se apoya: Mistral Ministral-8B-Instruct-2410 es un modelo de la familia Ministral de Mistral AI, y el pipeline de entrenamiento declarado (unsloth + trl + peft) es habitual en flujos de ajuste eficiente en VRAM.

Al no existir documentación del autor, todos los datos sobre arquitectura, contexto y capacidades deben inferirse del modelo base, no del adaptador, y se marcan como tales a lo largo de la ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre modelo base transformer decoder-only (Ministral-8B-Instruct-2410, cuantizado a 4 bits) |
| Parametros totales | 0,2 GB de pesos de adaptador; parámetros totales del modelo base: no disponible en la información proporcionada |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible para el adaptador; la del modelo base no se especifica en la información proporcionada |
| Tipos de cuantizacion | Modelo base en 4 bits; el adaptador se distribuye en safetensors (precisión del adaptador no especificada) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA entrenado con SFT, según los tags del repositorio (`lora`, `sft`, `transformers`, `trl`, `unsloth`). La arquitectura subyacente es la del modelo base nassimjp/Ministral-8B-Instruct-2410-4bit, una versión cuantizada a 4 bits del Ministral-8B-Instruct-2410 de Mistral AI, que es un transformer decoder-only. El adaptador modifica un subconjunto de matrices del modelo base mediante descomposiciones de bajo rango, pero el autor no especifica ni el rango, ni los módulos objetivo, ni el alpha, ni la tasa de aprendizaje.

No hay información sobre el dataset de entrenamiento, el número de tokens vistos, la composición de los datos, la existencia de RLHF/DPO posterior ni ninguna innovación técnica destacable. La model card es la plantilla por defecto de Hugging Face sin rellenar, con todos los campos marcados como "[More Information Needed]". La única referencia técnica citada en los tags es el artículo arXiv:1910.09700 (Lacoste et al., 2019), que corresponde a la calculadora de impacto medioambiental y no a la metodología de entrenamiento. La versión de PEFT empleada es 0.21.3.

## Capacidades

Las capacidades reales del adaptador no están documentadas. Las que se enumeran a continuación corresponden al modelo base sobre el que se aplica y deben considerarse como techo potencial, no como garantía de que el adaptador las preserve:

- Generación de texto conversacional, heredada de Ministral-8B-Instruct-2410.
- Razonamiento y matemáticas básicas, sujeto a la degradación típica de la cuantización a 4 bits.
- Generación de código, si el modelo base la conserva tras el ajuste.
- Posible soporte de tool calling y function calling, propio de la familia Ministral, pero no verificado en este adaptador.
- Capacidades multilingües del modelo base, no declaradas para el adaptador.
- No hay evidencia de modo thinking, visión ni audio.

## Casos de uso

Dado que el adaptador no tiene evaluación publicada, los casos de uso deben entenderse como escenarios de experimentación, no como despliegues recomendados:

- Investigación de ajuste eficiente: reproducir el flujo unsloth + trl + peft para estudiar cómo un LoRA de bajo rango modifica el comportamiento de un modelo de 8B cuantizado a 4 bits.
- Prototipado de dominio específico: si el autor entrenó el adaptador para una tarea concreta (no documentada), puede servir como punto de partida para comparar antes/después frente al modelo base.
- Evaluación comparativa de adaptadores: usar el adaptador como baseline en experimentos que midan la degradación introducida por el fine-tuning sobre un modelo ya cuantizado.
- Experimentos de alineación y estilo: probar cambios de tono o formato de respuesta mediante el adaptador frente a la Instruct original.
- Docencia y formación: ilustrar en un curso cómo se publica y se carga un adaptador PEFT con `PeftModel.from_pretrained`.
- Pruebas de integración de infraestructura: validar pipelines de carga de adaptadores en vLLM, TGI o transformers antes de invertir en un fine-tuning propio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye ninguna sección de evaluación completada, y no hay métricas del adaptador ni comparaciones con el modelo base.

## Requisitos de hardware

- El adaptador en sí ocupa 0,2 GB, pero la inferencia exige cargar el modelo base Ministral-8B-Instruct-2410-4bit completo.
- VRAM estimada para el modelo base en 4 bits: en torno a 5-6 GB de pesos, más overhead de activaciones y caché KV; el total práctico suele situarse entre 8 y 12 GB según longitud de contexto y batch. Cifra estimada, no confirmada en la información proporcionada.
- GPU consumer: previsiblemente viable en RTX 3060 12 GB, RTX 4070 Ti, RTX 4080 y RTX 4090 con cuantización de 4 bits; no verificado.
- GPU de datacenter: A100 y H100 sobradas para el modelo base; útiles si se quiere servir con batch alto.
- Opciones de despliegue: transformers + PEFT (flujo nativo del repositorio), vLLM con soporte de adaptadores LoRA, TGI y llama.cpp/Ollama solo si se fusiona el adaptador y se convierte a GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Luna456u/cleidophora-lora | Adaptador sobre 8B | no disponible | no disponible | Hugging Face, 0 descargas | Sin documentación ni evaluación |
| Ministral-8B-Instruct-2410 (Mistral AI) | 8B | no disponible en esta ficha | no disponible en esta ficha | Modelo oficial de Mistral AI | Modelo base de referencia, con documentación oficial |
| nassimjp/Ministral-8B-Instruct-2410-4bit | 8B cuantizado | no disponible | no disponible | Hugging Face | Variante cuantizada usada como base del adaptador |

La comparación con otras alternativas de la misma categoría (adaptadores LoRA públicos sobre Ministral) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Model card vacía: no hay información sobre datos de entrenamiento, propósito, hiperparámetros ni evaluación, lo que impide auditar el adaptador.
- Licencia no declarada: no se puede asumir uso comercial permitido; la licencia del modelo base (Mistral) puede imponer restricciones adicionales que el autor no ha reflejado.
- Idiomas no declarados: no hay garantía de comportamiento multilingüe del adaptador.
- Riesgo de alucinación heredado del modelo base, sin métricas que cuantifiquen el efecto del fine-tuning.
- Doble degradación potencial: el modelo base ya está cuantizado a 4 bits, y el adaptador se entrena sobre esa versión; la calidad puede ser inferior a un LoRA entrenado sobre pesos en fp16/bf16.
- Sin descargas ni likes: no hay evidencia de uso por parte de la comunidad ni de validación externa.
- Sesgos: no evaluados ni documentados.
- No apto para producción sin una evaluación propia de calidad, seguridad y licencia.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Luna456u/cleidophora-lora
- Modelo base: https://huggingface.co/nassimjp/Ministral-8B-Instruct-2410-4bit
- Referencia citada en los tags (Lacoste et al., 2019): https://arxiv.org/abs/1910.09700
- Calculadora de impacto medioambiental ML CO2: https://mlco2.github.io/impact
- Librería PEFT: https://github.com/huggingface/peft
- Librería TRL: https://github.com/huggingface/trl
- Unsloth: https://github.com/unslothai/unsloth
