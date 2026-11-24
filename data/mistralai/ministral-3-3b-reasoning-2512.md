# mistralai/Ministral-3-3B-Reasoning-2512

## Resumen

Ministral 3 3B Reasoning 2512 es un modelo de lenguaje y visión de pequeno tamano desarrollado por Mistral AI, lanzado dentro de la familia Ministral 3 (disponible en variantes de 3B, 8B y 14B). Se trata de la version post-entrenada especificamente para tareas de razonamiento, pensada para matematicas, programacion y ambitos STEM, y construida sobre el modelo base Ministral-3-3B-Base-2512. Su propuesta de valor es ofrecer capacidades agenticas y de razonamiento en el borde (edge), con un peso total de aproximadamente 3.849 millones de parametros.

El modelo combina un componente de lenguaje de 3.400 millones de parametros con un codificador de vision de 400 millones, lo que le permite procesar imagenes ademas de texto. Soporta una ventana de contexto de 256.000 tokens, once idiomas declarados (entre ellos castellano, ingles, frances, aleman, chino, japones, coreano y arabe) y se distribuye bajo licencia Apache 2.0, lo que habilita uso comercial y modificacion sin restricciones de peso.

Es relevante ahora porque demuestra que un modelo de menos de 4.000 millones de parametros puede incorporar razonamiento multi-paso, function calling nativo y vision manteniendo un despliegue viable en hardware de consumo (16 GB de VRAM en BF16 y menos de 8 GB cuantizado), un umbral que amplia enormemente las opciones de despliegue local y en dispositivos con recursos limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (3.4B lenguaje + 0.4B codificador de vision) |
| Parametros totales | 3.849.090.048 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 256.000 tokens |
| Tipos de cuantizacion | BF16 en el checkpoint oficial; cuantizaciones adicionales disponibles en la coleccion "additional checkpoints" (GGUF/otros formatos no especificados en detalle) |
| Idiomas soportados | en, fr, es, de, it, pt, nl, zh, ja, ko, ar |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria: vllm) |

## Arquitectura y entrenamiento

Ministral 3 3B Reasoning 2512 es un transformer multimodal compuesto por dos bloques: un modelo de lenguaje de 3.400 millones de parametros y un codificador de vision de 400 millones de parametros. El checkpoint se publica en BF16 y esta etiquetado con la arquitectura `mistral3` y la libreria `vllm`. El modelo parte de Ministral-3-3B-Base-2512, un modelo base pre-entrenado de la misma familia, sobre el que se aplica un post-entrenamiento orientado a razonamiento.

La model card indica que se trata de la version "reasoning post-trained", entrenada para tareas de razonamiento, y recomienda conservar las trazas de razonamiento en el contexto en conversaciones multi-turno. No se detalla en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas concretas como RLHF o DPO. Tampoco se especifican innovaciones de eficiencia (decodificacion especulativa, atencion lineal) mas alla del propio diseno optimizado para el borde. El articulo asociado (arXiv:2601.08584) es la referencia para profundizar en estos detalles.

## Capacidades

- Generacion de texto y razonamiento multi-paso: orientado explicitamente a matematicas, programacion y tareas STEM.
- Vision: analisis de imagenes y generacion de respuestas basadas en contenido visual, ademas del texto.
- Multilingue: once idiomas declarados, incluidos castellano, ingles, frances, aleman, italiano, portugues, neerlandes, chino, japones, coreano y arabe.
- Function calling nativo y salida en JSON: capacidades agenticas de primera clase segun el autor.
- Adherencia a system prompt: mantiene un seguimiento fuerte de las instrucciones del sistema.
- Razonamiento dinamico: resolucion de problemas complejos con trazas de razonamiento que se recomienda mantener en contexto.
- Optimizado para el borde: disenado para ejecutarse en hardware de baja potencia y dispositivos con recursos limitados.

## Casos de uso

- Descripcion de imagenes (image captioning): el codificador de vision de 400 millones de parametros permite generar descripciones de imagenes en local; adecuado para pipelines de catalogacion o accesibilidad que deben ejecutarse sin conexion.
- Clasificacion de texto: con 3.849 millones de parametros y contexto de 256k tokens, puede clasificar documentos largos o lotes de texto en entornos con poca VRAM.
- Traduccion eficiente en tiempo real: el soporte de once idiomas y su tamano reducido permiten desplegar traduccion de baja latencia en dispositivos o servidores modestos.
- Extraccion de datos: la salida en JSON y el function calling nativo lo hacen util para convertir documentos o imagenes en estructuras de datos procesables.
- Generacion de contenido corto: redaccion de respuestas breves, resumenes o mensajes en aplicaciones interactivas donde el coste por inferencia es critico.
- Ajuste fino y especializacion: al publicarse bajo Apache 2.0 y en BF16, es una base asequible para fine-tuning en dominios concretos con recursos limitados.
- Razonamiento STEM asistido en el borde: resolucion de problemas matematicos o de codigo en herramientas locales, con trazas de razonamiento conservadas para auditoria.

## Benchmarks y rendimiento

La model card incluye una tabla comparativa de la familia Ministral 3 frente a Qwen3-14B (Thinking) en pruebas de razonamiento. Los datos disponibles en la informacion proporcionada corresponden a las variantes de 14B y 8B; no se han publicado en la informacion disponible resultados especificos de la variante de 3B.

| Modelo | AIME25 | AIME24 | GPQA Diamond | LiveCodeBench |
|---|---|---|---|---|
| Ministral 3 14B | 0.850 | 0.898 | 0.712 | 0.646 |
| Qwen3-14B (Thinking) | 0.737 | 0.837 | 0.663 | 0.593 |
| Ministral 3 8B | 0.787 | 0.860 | no disponible | no disponible |

No se han publicado resultados de benchmarks especificos del modelo Ministral 3 3B Reasoning 2512 en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 16 GB en BF16 para el modelo completo; menos de 8 GB de RAM/VRAM cuando se cuantiza, segun la model card.
- GPU recomendadas: el modelo esta pensado para despliegue en el borde; cabe en GPUs de consumo con suficiente memoria. No se especifican modelos concretos (A100, H100, RTX 4090) en la informacion disponible.
- GPU de consumo: si, segun el autor, es desplegable en local y encaja en 16 GB de VRAM en BF16 y menos de 8 GB cuantizado, lo que lo hace viable en tarjetas de gama media y alta.
- Opciones de despliegue: la libreria declarada es vLLM; la familia ofrece checkpoints adicionales en otros formatos (coleccion "additional checkpoints"), lo que sugiere soporte para otros runners, aunque no se detallan en la informacion disponible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

La model card compara la familia Ministral 3 con Qwen3-14B (Thinking). Para la variante de 3B no se ofrecen comparaciones directas en la informacion disponible, por lo que la comparativa se limita a lo publicado.

| Modelo | Parametros | Contexto | Licencia | Razonamiento (AIME25) | Disponibilidad |
|---|---|---|---|---|---|
| Ministral 3 3B Reasoning 2512 | 3.849 M (3.4B LM + 0.4B vision) | 256k | Apache 2.0 | no disponible | Hugging Face |
| Ministral 3 8B Reasoning 2512 | no disponible | no disponible | Apache 2.0 | 0.787 | Hugging Face |
| Ministral 3 14B Reasoning 2512 | no disponible | no disponible | Apache 2.0 | 0.850 | Hugging Face |
| Qwen3-14B (Thinking) | 14B | no disponible | no disponible | 0.737 | no disponible |

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan sesgos especificos en la informacion disponible; como todo modelo entrenado con datos web, es probable que herede sesgos de esos datos.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; debe validarse la salida en aplicaciones criticas, especialmente en razonamiento matematico y extraccion de datos.
- Limitaciones de contexto o idioma: aunque declara once idiomas, el rendimiento puede variar entre ellos; no se aportan metricas por idioma.
- Restricciones de licencia: Apache 2.0 permite uso comercial y modificacion; la model card incluye un aviso de acceso condicionado (gated) con referencia a la politica de privacidad de Mistral, que conviene revisar antes del despliegue.
- Caveats de produccion: el autor recomienda mantener las trazas de razonamiento en contexto en conversaciones multi-turno, usar temperatura 0.7 como punto de partida, limitar el numero de herramientas en entornos agenticos y emplear imagenes con proporcion cercana a 1:1 para el modo vision.
- Precision: el checkpoint oficial es BF16; las variantes Instruct de la familia se publican en FP8, pero esta version Reasoning se distribuye en BF16.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mistralai/Ministral-3-3B-Reasoning-2512
- Modelo base: https://huggingface.co/mistralai/Ministral-3-3B-Base-2512
- Variante Instruct 3B: https://huggingface.co/mistralai/Ministral-3-3B-Instruct-2512
- Variante 8B Reasoning: https://huggingface.co/mistralai/Ministral-3-8B-Reasoning-2512
- Variante 14B Reasoning: https://huggingface.co/mistralai/Ministral-3-14B-Reasoning-2512
- Checkpoints adicionales: https://huggingface.co/collections/mistralai/ministral-3-additional-checkpoints
- System prompt recomendado: https://huggingface.co/mistralai/Ministral-3-3B-Reasoning-2512/blob/main/SYSTEM_PROMPT.txt
- Blog de Mistral: https://mistral.ai/news/mistral-3
- Paper: https://arxiv.org/abs/2601.08584
- Cliente Python de Mistral: https://pypi.org/project/mistralai/
