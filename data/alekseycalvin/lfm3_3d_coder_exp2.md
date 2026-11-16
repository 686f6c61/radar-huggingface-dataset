# AlekseyCalvin/LFM3_3d_coder_exp2

## Resumen

LFM3_3d_coder_exp2 es un ajuste fino (fine-tune) experimental del modelo base LiquidAI/LFM3-1.7B-Base, publicado por el usuario AlekseyCalvin en Hugging Face. Se trata de un modelo de generación de texto de 1.728.801.536 parámetros (aproximadamente 1,73B) orientado, por el nombre del repositorio, a tareas de código y contenido 3D, aunque la model card no documenta explícitamente el conjunto de datos ni el procedimiento de ajuste empleado por el autor del fine-tune. El modelo hereda la arquitectura y las capacidades del LFM3-1.7B de Liquid AI.

La relevancia de este checkpoint deriva de la familia LFM3, que Liquid AI presenta como una arquitectura tri-híbrida pensada para despliegue en el borde (edge): combina convoluciones cortas con puerta (gated short convolutions), atención de ventana deslizante y atención global en una pila de 24 capas. Con 256K tokens de contexto y un consumo de memoria de aproximadamente 1 GB en cuantización de 4 bits, el modelo está diseñado para ejecutarse en portátiles e incluso teléfonos.

Al ser un fine-tune comunitario con cero descargas y cero likes en el momento de la consulta, debe tratarse como un experimento sin validación pública: no hay benchmarks propios, ni datos de entrenamiento documentados, ni garantías de calidad sobre el modelo base. Es útil como punto de partida para experimentación con la arquitectura LFM3, no como modelo listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer híbrido (tri-híbrido): 24 capas con 13 convoluciones cortas con puerta, 5 capas de atención de ventana deslizante y 6 capas de atención global |
| Parámetros totales | 1.728.801.536 (≈1,73B) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 256K tokens (entrada + salida) |
| Tipos de cuantización | No disponible en la información proporcionada (la model card del base menciona ~1 GB en 4 bits) |
| Idiomas soportados | Inglés, árabe, chino, francés, alemán, italiano, japonés, coreano, portugués, español, vietnamita, tailandés, indonesio, hindi, ruso, polaco |
| Licencia | LFM Open License v1.0 (lfm1.0), etiquetada como "other" |
| Formato de pesos | Safetensors (librería transformers, requiere custom_code) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura tri-híbrida de LFM3: una pila de 24 capas que intercala 13 capas de convolución corta con puerta, 5 capas de atención de ventana deslizante y 6 capas de atención global. Este diseño busca reducir el coste computacional y de memoria del mecanismo de atención clásico manteniendo la capacidad de modelar dependencias de largo alcance, lo que permite sostener una ventana de 256K tokens con un presupuesto de memoria reducido. El vocabulario es de 128.000 tokens.

El modelo base LFM3-1.7B-Base fue post-entrenado por Liquid AI para su uso en entornos agénticos (Hermes Agent, Pi, OpenClaw) según la model card. Sin embargo, la información disponible no detalla el proceso de ajuste aplicado por AlekseyCalvin para producir este checkpoint concreto: no se especifican el número de tokens de entrenamiento, la composición del dataset, ni si se emplearon técnicas como RLHF o DPO. El repositorio incluye la etiqueta `custom_code`, por lo que es necesario confiar en el código remoto del modelo (`trust_remote_code=True`) para cargarlo con transformers.

## Capacidades

- Generación de texto conversacional y de propósito general, heredada del modelo base LFM3-1.7B.
- Orientación presumible a código y contenido 3D por el nombre del checkpoint, si bien no está documentada en la model card.
- Soporte multilingüe en 16 idiomas, incluido el español.
- Capacidad de manejar contextos largos de hasta 256K tokens, útil para agentes con historial extenso o documentos grandes.
- Entrenamiento orientado a entornos agénticos según la model card del base (Hermes Agent, Pi, OpenClaw).
- No se documenta soporte explícito de tool calling, visión, audio ni modo de razonamiento (thinking) en la información disponible para este fine-tune.

## Casos de uso

- Prototipado de asistentes de código en local: el modelo puede generar y completar fragmentos de código en un portátil con GPU de consumo, gracias a su tamaño de 1,73B y a la posibilidad de cuantizarlo a 4 bits (~1 GB).
- Experimentación con la arquitectura LFM3: sirve como banco de pruebas para evaluar el comportamiento de las capas convolucionales y de atención híbrida en tareas de generación de código.
- Generación de descripciones y metadatos para activos 3D: dado el nombre del checkpoint, puede emplearse para producir texto asociado a mallas, materiales o escenas, aunque sin garantías de calidad documentadas.
- Procesamiento de repositorios completos: con 256K tokens de contexto puede ingerir varios archivos de código en una sola pasada para tareas de resumen o explicación.
- Fine-tuning ulterior sobre dominios específicos: al ser un modelo pequeño, permite ajustes rápidos en una sola GPU para adaptarlo a formatos o herramientas propias.
- Evaluación comparativa de fine-tunes comunitarios: útil para investigadores que estudien la variabilidad y calidad de ajustes no documentados sobre modelos base abiertos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 1 GB en cuantización de 4 bits; en FP16/BF16 se requieren en torno a 3,5 GB solo para los pesos, más memoria para el contexto.
- GPU recomendadas: cualquier GPU de consumo con al menos 8 GB de VRAM (RTX 3060, RTX 4060, RTX 4090) para FP16; para contextos de 256K se necesita memoria adicional considerable.
- Cabe en GPU de consumo: sí, especialmente en cuantización de 4 bits; la model card del base indica que cabe en teléfonos y portátiles.
- Opciones de despliegue: transformers con `trust_remote_code=True` (requerido por la etiqueta `custom_code`); el soporte en vLLM, llama.cpp, Ollama o TGI no está confirmado en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| LFM3_3d_coder_exp2 | 1,73B | 256K | LFM Open License v1.0 | Hugging Face (fine-tune comunitario) |
| LiquidAI/LFM3-1.7B-Base | 1,73B | 256K | LFM Open License v1.0 | Hugging Face (modelo oficial) |
| Qwen2.5-Coder-1.5B | 1,5B | 32K | Apache 2.0 | Hugging Face |
| SmolLM2-1.7B | 1,7B | 8K | Apache 2.0 | Hugging Face |

La comparación con Qwen2.5-Coder-1.5B y SmolLM2-1.7B es orientativa por tamaño y categoría (modelos pequeños para edge); no se dispone de datos de rendimiento de este checkpoint para establecer una comparación cuantitativa.

## Limitaciones y advertencias

- Fine-tune comunitario sin documentación de datos, método ni evaluación: no hay garantía de que mejore al modelo base en tareas de código o 3D.
- Riesgo elevado de alucinación y de degradación de calidad respecto al base, al no conocerse el procedimiento de ajuste.
- Sesgos desconocidos: no se documenta ninguna evaluación de sesgos ni de seguridad.
- La licencia LFM Open License v1.0 impone restricciones específicas; debe revisarse el archivo LICENSE antes de cualquier uso comercial.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código del autor del modelo; conviene auditar el código antes de usarlo en producción.
- El soporte real de tool calling y de comportamiento agéntico no está verificado en este checkpoint concreto.
- Cero descargas y cero likes en el momento de la consulta: sin validación por parte de la comunidad.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/AlekseyCalvin/LFM3_3d_coder_exp2)
- [Modelo base LiquidAI/LFM3-1.7B-Base](https://huggingface.co/LiquidAI/LFM3-1.7B-Base)
- [Colección LFM3 de Liquid AI](https://huggingface.co/collections/LiquidAI/lfm3)
- [Blog de lanzamiento de LFM3](https://www.liquid.ai/blog/lfm3)
- [Documentación de Liquid AI](https://docs.liquid.ai/lfm/getting-started/welcome)
- [Playground de Liquid AI](https://playground.liquid.ai/)
- [Consola/API de Liquid AI](https://console.liquid.ai/dashboard)
