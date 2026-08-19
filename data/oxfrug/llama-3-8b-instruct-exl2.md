# oxfrug/Llama-3-8B-instruct-exl2

## Resumen

El modelo `oxfrug/Llama-3-8B-instruct-exl2` es una cuantización EXL2 (formato de ExLlamaV2) del checkpoint `AI-Sweden-Models/Llama-3-8B-instruct`, un ajuste instructivo del modelo Llama 3 8B de Meta, especializado en lenguas nórdicas (sueco, danés y noruego) además de inglés. El autor, oxfrug, ha convertido los pesos originales en BF16 a varias precisiones de bits por peso (bpw) para permitir una inferencia más eficiente en GPUs con memoria limitada, manteniendo la misma arquitectura y capacidades del modelo base.

Esta cuantización es relevante porque no existían versiones EXL2 oficiales de este checkpoint, y el formato EXL2 ofrece un equilibrio óptimo entre calidad y velocidad para usuarios de ExLlamaV2, TabbyAPI o text-generation-webui. El modelo resultante conserva el comportamiento del original, como se muestra en las pruebas de humo incluidas, y está disponible en cinco niveles de cuantización (4.0, 4.5, 5.0, 5.5 y 6.0 bpw) para adaptarse a distintos requisitos de VRAM.

Al ser un derivado de Llama 3 8B, la arquitectura es un transformer decoder-only con 8 mil millones de parámetros, aunque el contexto exacto no se especifica en la información proporcionada. La licencia es la Meta Llama 3 Community License, por lo que su uso comercial está sujeto a las condiciones de dicha licencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3 8B) |
| Parametros totales | 8 mil millones (aprox., no especificado exactamente) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (no especificado en la informacion) |
| Tipos de cuantizacion | EXL2: 4.0, 4.5, 5.0, 5.5, 6.0 bpw |
| Idiomas soportados | Sueco (sv), danes (da), noruego (no), ingles (en) |
| Licencia | Meta Llama 3 Community License (llama3) |
| Formato de pesos | EXL2 (safetensors, via ExLlamaV2) |

## Arquitectura y entrenamiento

El modelo base `AI-Sweden-Models/Llama-3-8B-instruct` es un ajuste instructivo de Llama 3 8B, entrenado por AI Sweden para mejorar el rendimiento en tareas de instrucción en lenguas escandinavas. La arquitectura subyacente es la estándar de Llama 3: transformer autoregresivo con atención de múltiples cabezas, normalización RMSNorm, y capas de atención con sesgo rotatorio (RoPE). No se dispone de detalles sobre el dataset de entrenamiento, el número de tokens o si se utilizaron técnicas como RLHF o DPO en el ajuste instructivo.

La conversión a EXL2 se realizó con ExLlamaV2 0.3.2, fijando `lm_head` a 6 bits y utilizando la calibración por defecto integrada (la misma receta que los quants estilo turboderp). Se realizó una pasada de medición y luego se generaron las distintas ramas de bitrate a partir de `measurement.json`. Esta cuantización no añade nuevas capacidades al modelo, solo reduce el tamaño de los pesos para acelerar la inferencia y reducir el consumo de memoria.

## Capacidades

- Generacion de texto e instrucciones en sueco, danes, noruego e ingles.
- Comprension y respuesta a preguntas factuales simples (verificadas en pruebas de humo, p. ej., capital de Suecia).
- Capacidad de seguir instrucciones en formato chat, gracias al ajuste instructivo del modelo base.
- Soporte para plantillas de chat (chat template) del modelo original.
- No se documentan capacidades adicionales como tool calling, razonamiento multi-paso, vision o audio en la informacion proporcionada.

## Casos de uso

- Atencion al cliente en lenguas nordicas: el modelo puede gestionar consultas de usuarios en sueco, danes o noruego, proporcionando respuestas coherentes y contextuales en un entorno de chat, gracias a su ajuste instructivo.
- Asistente virtual multilingue para regiones nordicas: integrable en aplicaciones de mensajeria o web para responder preguntas frecuentes, redactar correos o ayudar en tareas administrativas en idiomas escandinavos.
- Traduccion y parafraseo informal: aunque no esta especializado en traduccion, puede reformular o traducir frases cortas entre ingles y las lenguas nordicas, util para borradores rapidos.
- Generacion de contenido localizado: creacion de textos de marketing, descripciones de productos o publicaciones en redes sociales adaptadas al publico escandinavo.
- Educacion y practica de idiomas: como companero de conversacion para estudiantes de sueco, danes o noruego, ofreciendo respuestas correctas y naturales.
- Prototipado de aplicaciones de IA en entornos con recursos limitados: gracias a las cuantizaciones EXL2, puede ejecutarse en GPUs consumer de gama media, permitiendo experimentar con modelos nordicos sin necesidad de hardware profesional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo incluye pruebas de humo (smoke tests) con generacion greedy, que muestran respuestas correctas a preguntas sobre la capital de Suecia tanto en sueco como en ingles. No hay datos de MMLU, HumanEval, GSM8K ni otras metricas estandar. Se recomienda consultar el modelo base `AI-Sweden-Models/Llama-3-8B-instruct` para posibles evaluaciones adicionales.

## Requisitos de hardware

- Tamano de los archivos por rama: 4.7 GB (4.0 bpw), 5.1 GB (4.5 bpw), 5.5 GB (5.0 bpw), 5.9 GB (5.5 bpw), 6.3 GB (6.0 bpw). El tamano total del repositorio es 16.2 GB (incluye todas las ramas).
- VRAM estimada: para la rama de 4.0 bpw, se necesitan al menos 6-8 GB de VRAM (considerando overhead de activaciones y contexto). Para 6.0 bpw, se recomiendan 8-10 GB.
- GPUs compatibles: cualquier GPU NVIDIA con soporte CUDA y al menos 6 GB de VRAM (p. ej., RTX 2060, RTX 3060, RTX 4060, RTX 3090, etc.). La conversion se realizo en una RTX 3090.
- Opciones de despliegue: ExLlamaV2 (via TabbyAPI, ExUI o text-generation-webui con el loader `exllamav2`). No es compatible con llama.cpp ni GGUF.
- Nota: en PyTorch 2.13 sin Flash Attention 2.5.7+, se debe establecer `config.no_sdpa = True` antes de cargar para evitar salidas colapsadas. El autor recomienda usar la pila habitual de la comunidad (torch antiguo + flash-attn) para un rendimiento optimo.

## Comparativa con modelos similares

No se dispone de informacion suficiente para realizar una comparativa cuantitativa con otros modelos similares. Como referencia, este modelo es una cuantizacion de un fine-tune nordico de Llama 3 8B, por lo que es comparable a otros quants de Llama 3 8B (p. ej., versiones GGUF o AWQ) o a otros modelos nordicos como NorwAI-Llama3-8B o Scandinavian-LLaMA, pero no se tienen datos de rendimiento para establecer una tabla comparativa.

## Limitaciones y advertencias

- La licencia Meta Llama 3 Community License impone restricciones de uso comercial si el modelo se utiliza en servicios con mas de 700 millones de usuarios mensuales; ademas, se debe mantener el archivo `NOTICE` incluido.
- El modelo solo cubre cuatro idiomas (sv, da, no, en); su rendimiento en otros idiomas puede ser deficiente o inesperado.
- Al ser una cuantizacion, puede haber una ligera degradacion en la calidad de las respuestas en comparacion con el modelo BF16 original, especialmente en las ramas de menor bitrate (4.0 bpw).
- No se han documentado sesgos especificos, pero como derivado de Llama 3, puede heredar sesgos presentes en los datos de entrenamiento del modelo base.
- Riesgo de alucinacion en preguntas complejas o de conocimiento especializado, comun en modelos de 8B.
- La longitud de contexto no esta especificada; se recomienda asumir la del modelo base (8K tokens) pero sin confirmacion oficial.
- Para produccion, es necesario validar el comportamiento con `no_sdpa=True` en entornos PyTorch modernos, o usar la pila tradicional con flash-attention.

## Enlaces

- [HuggingFace - oxfrug/Llama-3-8B-instruct-exl2](https://huggingface.co/oxfrug/Llama-3-8B-instruct-exl2)
- [Modelo base - AI-Sweden-Models/Llama-3-8B-instruct](https://huggingface.co/AI-Sweden-Models/Llama-3-8B-instruct)
- [Modelo base sin instruct - AI-Sweden-Models/Llama-3-8B](https://huggingface.co/AI-Sweden-Models/Llama-3-8B)
- [Meta Llama 3 - meta-llama/Meta-Llama-3-8B](https://huggingface.co/meta-llama/Meta-Llama-3-8B)
- [Licencia Meta Llama 3](https://llama.meta.com/llama3/license)
