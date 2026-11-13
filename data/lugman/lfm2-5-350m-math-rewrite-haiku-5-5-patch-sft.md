# lugman/LFM2.5-350M-Math-Rewrite-Haiku-5-5-Patch-SFT

## Resumen

LFM2.5-350M-Math-Rewrite-Haiku-5-5-Patch-SFT es un ajuste fino (SFT) del modelo base LiquidAI/LFM2.5-350M, publicado por el usuario lugman en Hugging Face. Se trata de un modelo de generacion de texto de pequeno tamano, con 354.483.968 parametros totales, derivado de la familia LFM2 de Liquid AI y entrenado con las librerias Unsloth y TRL de Hugging Face. El nombre del repositorio sugiere un ajuste orientado a reescritura de contenido matematico y parcheo de respuestas, aunque la model card no detalla la composicion exacta del dataset de entrenamiento.

El modelo hereda la arquitectura LFM2 del modelo base, una familia disenada por Liquid AI para inferencia eficiente en dispositivos de borde. Con apenas 350 millones de parametros, el modelo esta pensado para despliegues con recursos muy limitados, donde un modelo mayor no seria viable. La licencia Apache 2.0 facilita su uso comercial y su integracion en productos.

La relevancia de esta ficha radica en su caracter de ajuste comunitario: no es un modelo oficial de Liquid AI, sino una especializacion realizada por un tercero. La informacion publicada es escasa (sin benchmarks, sin detalles de dataset, sin evaluaciones), por lo que esta ficha refleja unicamente los datos verificables del repositorio y del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LFM2 (hereda del modelo base LiquidAI/LFM2.5-350M; detalles de capas no disponibles) |
| Parametros totales | 354.483.968 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; compatible con cuantizacion via herramientas externas) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino supervisado (SFT) del base LiquidAI/LFM2.5-350M. La arquitectura subyacente es la de la familia LFM2 de Liquid AI, que el autor no describe en la model card; los detalles concretos de capas, atencion y mecanismos internos no estan disponibles en la informacion proporcionada. El entrenamiento se realizo con Unsloth y la libreria TRL de Hugging Face, segun indica la propia model card, lo que sugiere un proceso de SFT estandar sobre el modelo base.

No se especifica el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo etapas de RLHF o DPO. El nombre del repositorio ("Math-Rewrite-Haiku-5-5-Patch-SFT") apunta a un ajuste orientado a reescritura de contenido matematico y correccion de respuestas, pero esta interpretacion no esta confirmada por documentacion adicional. No se documentan innovaciones tecnicas adicionales mas alla del uso de Unsloth para acelerar el entrenamiento.

## Capacidades

- Generacion de texto conversacional en ingles, heredada del modelo base LFM2.5-350M.
- Especializacion probable en reescritura de contenido matematico y correccion de respuestas, segun el nombre del repositorio (no confirmado en la model card).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: limitadas al ingles segun el campo `language` del repositorio.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso

- Reescritura de explicaciones matematicas: el modelo puede reformular soluciones y pasos intermedios en un formato mas claro, aprovechando el ajuste SFT orientado a "math rewrite" que sugiere el nombre del repositorio.
- Correccion de respuestas generadas: dado el sufijo "Patch" del nombre, podria emplearse como paso de post-procesado para corregir o parchear salidas de otro modelo en dominios tecnicos.
- Prototipado rapido en local: con 350 millones de parametros, cabe en GPUs de consumo y permite iterar en entornos de desarrollo sin infraestructura dedicada.
- Generacion de texto en ingles para aplicaciones de bajo coste: chatbots simples, resumenes o respuestas cortas donde el presupuesto computacional es la restriccion principal.
- Filtrado y normalizacion de contenido educativo: reescritura de enunciados y soluciones en plataformas de aprendizaje automatico de matematicas.
- Base para nuevos ajustes comunitarios: al ser Apache 2.0 y de tamano reducido, sirve como punto de partida para fine-tunings especificos con Unsloth o TRL.
- Despliegue en dispositivos de borde: inferencia en CPU o GPUs integradas para tareas de generacion de texto de baja latencia y bajo consumo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,7 GB en precision completa (fp32), en torno a 0,35 GB en fp16/bf16 y menos de 0,3 GB en cuantizaciones de 8 o 4 bits (estimacion a partir de los 354 millones de parametros; no confirmada por el autor).
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM; tarjetas como RTX 3060, RTX 4060, RTX 4090 o superiores son mas que suficientes.
- Cabe en GPU de consumo: si, practicamente en cualquier GPU moderna e incluso en CPU para inferencia por lotes pequenos.
- Opciones de despliegue: transformers, text-generation-inference (segun los tags del repositorio), llama.cpp u Ollama tras conversion a GGUF, y vLLM si se anade soporte para la arquitectura LFM2.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| LFM2.5-350M-Math-Rewrite-Haiku-5-5-Patch-SFT | 354 M | no disponible | Apache 2.0 | Ajuste comunitario SFT del base LFM2.5-350M |
| LiquidAI/LFM2.5-350M | 350 M (aprox.) | no disponible | Apache 2.0 (segun repositorio base) | Modelo base oficial de Liquid AI |
| Qwen2.5-0.5B | 500 M (aprox.) | 32 K (segun documentacion publica de Qwen) | Apache 2.0 | Alternativa de tamano similar con soporte multilingue |
| SmolLM2-360M | 360 M (aprox.) | 8 K (segun documentacion publica) | Apache 2.0 | Modelo pequeno de Hugging Face orientado a eficiencia |

Los datos de los modelos comparables provienen de documentacion publica general y no de la informacion proporcionada en esta ficha; se incluyen como referencia orientativa.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados por el autor; al ser un ajuste comunitario sin evaluacion publicada, no se puede descartar la herencia de sesgos del modelo base y del dataset de SFT.
- Riesgo de alucinacion: alto en modelos de este tamano, especialmente en tareas matematicas donde el ajuste no garantiza correccion formal de los resultados.
- Limitaciones de contexto e idioma: solo se declara soporte de ingles; la longitud de contexto no esta documentada.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el autor no ofrece garantias ni evaluaciones de calidad para produccion.
- Caveat importante: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin benchmarks ni evaluaciones independientes; no se recomienda su uso en produccion sin validacion previa.
- La model card es minima y no documenta el dataset, el proceso de entrenamiento ni los hiperparametros, lo que dificulta la reproducibilidad.

## Enlaces

- Hugging Face: https://huggingface.co/lugman/LFM2.5-350M-Math-Rewrite-Haiku-5-5-Patch-SFT
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-350M
- Unsloth (repositorio): https://github.com/unslothai/unsloth
- TRL de Hugging Face: https://github.com/huggingface/trl
