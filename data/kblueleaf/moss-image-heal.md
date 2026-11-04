# KBlueLeaf/MOSS-Image-heal

## Resumen

MOSS-Image-heal es un ajuste fino completo (full finetune) del modelo de difusión texto-a-imagen MOSS-Image-Base, desarrollado por OpenMOSS-Team y redistribuido por KBlueLeaf bajo licencia Apache 2.0. El modelo resuelve un problema concreto de estabilidad numérica: el flujo residual (residual stream) del transformer original alcanza valores máximos de 58.411, muy cerca del límite de fp16 (65.504), lo que provoca desbordamientos y artefactos al inferir en precisión reducida. Este ajuste reduce ese pico a 3.083, multiplicando por 21 el margen disponible en fp16.

La arquitectura subyacente es un transformer de difusión con flow matching, con 5.082.308.624 parámetros totales (aproximadamente 5,08 mil millones). El repositorio incluye el transformer en formato diffusers junto con archivos únicos para ComfyUI en bf16, fp16 e int8 ConvRot, además de los informes con todas las métricas de validación.

La relevancia actual del modelo es práctica: permite ejecutar un pipeline texto-a-imagen de 5B parámetros en GPUs de consumo con fp16 sin los artefactos asociados al desbordamiento del stream residual, manteniendo una fidelidad casi idéntica al modelo base (coseno de velocidad de 0,9983 y pérdida de flow de 0,4289 frente a 0,4280).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusión con flow matching (MOSSImageTransformer) |
| Parametros totales | 5.082.308.624 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16, fp16, int8 ConvRot (grupo 256) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (diffusers y archivos únicos ComfyUI) |

## Arquitectura y entrenamiento

El modelo es un transformer de difusión que opera mediante flow matching, con un refinador de texto (`text_embedder.*`) congelado que conserva los valores del modelo base. El ajuste se aplicó a todos los pesos del transformer excepto ese refinador de texto. El codificador de texto, el tokenizador, el VAE, el scheduler y el código del pipeline son los oficiales de MOSS-Image-Base, sin modificaciones.

El entrenamiento consistió en 50.000 pasos con 64 muestras por paso (4 GPUs, batch 4, acumulación 4), lo que suma 3,2 millones de muestras a un área de 1024² respetando la relación de aspecto original de cada imagen. Se usó AdamW con learning rate 1e-5 y decaimiento coseno hasta 1e-7, cómputo en fp16 con pesos maestros en fp32 y la técnica de plegado del stream residual de MOSS-Image-FP16-fixed. La función de pérdida combinó flow matching, destilación hacia el modelo base congelado (peso 1,0), concentración de escritura en el stream (peso 5e-3, objetivo de cuota 0,5) y RMS del stream (peso 5e-5), además de un decaimiento desacoplado para valores atípicos en los pesos.

El resultado técnico medible: el valor absoluto máximo del stream residual baja de 58.411 a 3.083, el RMS medio por bloque cae de 27,75 a 3,70 (7,5 veces menor), y ningún elemento de peso supera 64 veces el RMS de su tensor (el base tenía 349). La escritura máxima por bloque pasa de 17.250 a 1.113 y la cuota de los 32 canales principales en las escrituras baja de 0,553 a 0,316.

## Capacidades

- Generación de imágenes texto-a-imagen a partir de prompts descriptivos y etiquetas.
- Soporte de prompt negativo para control de calidad y exclusión de contenido no deseado.
- Inferencia en precisión reducida (fp16, bf16) sin desbordamiento del stream residual.
- Compatibilidad con ComfyUI mediante archivos únicos en bf16, fp16 e int8 ConvRot.
- Integración con la librería diffusers a través de `MOSSImageTransformer`.
- Ejecución con 16 pasos, CFG 3 y shift 5 según la configuración de muestras del autor.
- No se documentan capacidades de tool calling, agentes, visión, audio ni modo de razonamiento; es un modelo exclusivamente de generación de imágenes.

## Casos de uso

- Generación de ilustraciones en producción con ComfyUI: el archivo int8 ConvRot permite desplegar el modelo en GPUs con VRAM limitada manteniendo un error relativo de velocidad de 1,2e-2 y coseno mínimo de 0,9998, adecuado para pipelines de generación por lotes.
- Inferencia en fp16 en GPUs de consumo: el margen de 21,2x hasta el máximo de fp16 elimina los valores no finitos que el modelo base puede producir (pico de 61.696, un 6% por debajo del límite), lo que lo hace apto para estaciones RTX 3090 o similares.
- Sustitución directa del modelo base en pipelines existentes: al conservar el codificador de texto, VAE, scheduler y código de pipeline oficiales, se puede intercambiar el transformer sin reescribir la integración.
- Generación de imágenes con control de calidad mediante prompt negativo: el modelo responde al prompt negativo documentado (calidad, anatomía, marcas de agua) para filtrar artefactos en entornos de producción.
- Experimentación e investigación en estabilidad numérica: los informes del repositorio incluyen estadísticas por bloque del stream residual y de las escrituras, útiles para estudiar técnicas de plegado y regularización en difusión.
- Despliegue en entornos con requisitos de licencia permisiva: la licencia Apache 2.0 permite uso comercial y modificación sin restricciones adicionales.
- Evaluación comparativa de precisión: los archivos bf16, fp16 e int8 permiten medir el impacto de cada precisión sobre la fidelidad de la velocidad predicha antes de elegir el formato de despliegue.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. El autor sí publica métricas internas de fidelidad y estabilidad numérica:

| Metrica | Base | heal |
|---|---|---|
| Pérdida de flow | 0,4280 | 0,4289 |
| Coseno de velocidad respecto al base | 1 | 0,9983 |
| Mayor valor absoluto del stream residual | 58.411 | 3.083 |
| Margen hasta el máximo de fp16 | 1,12x | 21,2x |
| RMS del stream, media por bloque | 27,75 | 3,70 |
| RMS del stream, último bloque | 65,6 | 12,0 |
| Elementos de peso por encima de 64x RMS | 349 | 0 |
| Mayor escritura por bloque | 17.250 | 1.113 |

| Archivo | Cómputo | Error relativo de velocidad (media / máx) | Coseno (mín) | Valores no finitos |
|---|---|---|---|---|
| `moss_image_heal_fp16` | fp16 | 2,1e-3 / 2,7e-3 | 0,999996 | 0 |
| `moss_image_heal_bf16` | bf16 | 1,7e-2 / 2,1e-2 | 0,999787 | 0 |
| `transformer/` | bf16 | 1,7e-2 / 2,1e-2 | 0,999787 | 0 |
| `moss_image_heal_int8_convrot` | int8 pesos, fp16 cómputo | 1,2e-2 / 2,0e-2 | 0,999804 | 0 |
| `moss_image_heal_int8_convrot` | int8 pesos, bf16 cómputo | 2,1e-2 / 2,9e-2 | 0,999583 | 0 |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita en la información proporcionada. Con 5,08 mil millones de parámetros, el peso en bf16/fp16 ronda los 10 GB, y el archivo int8 ConvRot reduce esa cifra aproximadamente a la mitad para los 168 lineales cuantizados.
- GPU recomendadas: el autor validó las métricas de precisión en una RTX 3090 con matmuls de 16 bits y acumulación en fp32. Para producción a mayor escala, GPU de centro de datos tipo A100 o H100 son adecuadas, aunque no se documentan cifras de throughput en ellas.
- Cabe en GPU de consumo: la RTX 3090 se usó para las pruebas de precisión; el formato int8 ConvRot está pensado para reducir aún más el requisito de VRAM en ComfyUI.
- Opciones de despliegue: diffusers (transformer oficial), ComfyUI (archivos únicos bf16, fp16 e int8 ConvRot). No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo de difusión de este tipo.
- Latencia y throughput: no disponibles en la información proporcionada. La configuración de referencia usa 16 pasos con CFG 3 y shift 5.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| MOSS-Image-heal | 5,08B | no disponible | Apache 2.0 | HuggingFace, ComfyUI | Ajuste del base con stream residual estabilizado |
| MOSS-Image-Base | 5,08B (mismo tamaño) | no disponible | Apache 2.0 | HuggingFace | Modelo original; pico de stream de 58.411 y 349 pesos por encima de 64x RMS |
| MOSS-Image-FP16-fixed | no disponible | no disponible | no disponible | HuggingFace | Variante del base con plegado del stream residual para fp16; técnica reutilizada en heal |

No se dispone de datos de benchmarks comparativos con otros modelos de difusión texto-a-imagen en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información proporcionada; al derivar de MOSS-Image-Base, hereda los sesgos de su dataset de entrenamiento, que no se detalla.
- Riesgo de alucinación: no aplica en el sentido de texto factual, pero sí puede generar imágenes con anatomía incorrecta o artefactos; el prompt negativo documentado mitiga parte de estos casos.
- Limitaciones de contexto e idioma: no se documenta la longitud de contexto del codificador de texto ni los idiomas soportados; el prompt de ejemplo está en inglés.
- Restricciones de licencia: Apache 2.0 permite uso comercial, modificación y redistribución con atribución; no se imponen restricciones adicionales conocidas.
- Caveats para producción: el refinador de texto está congelado y conserva valores del base, incluidos tensores con relaciones máximas de 54,7x y 37,4x RMS; el archivo int8 pierde entre un 0,85% y un 0,98% de fidelidad relativa por capa frente al bf16. El modelo tiene 0 descargas y 4 likes en el momento de la ficha, por lo que la validación comunitaria es mínima.
- El repositorio ocupa 35,9 GB, lo que exige espacio de almacenamiento considerable si se descargan todas las variantes.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/KBlueLeaf/MOSS-Image-heal
- Modelo base: https://huggingface.co/OpenMOSS-Team/MOSS-Image-Base
- Técnica de plegado del stream residual: https://huggingface.co/KBlueLeaf/MOSS-Image-FP16-fixed
- Repositorio del entrenador: https://github.com/KohakuBlueleaf/KohakuMossTrainer
- Paper de referencia citado en los tags: https://arxiv.org/abs/2407.06723
