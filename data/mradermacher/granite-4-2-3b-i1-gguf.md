# mradermacher/granite-4.2-3b-i1-GGUF

## Resumen

Este repositorio contiene cuantizaciones GGUF del modelo `granite-4.2-3b` de IBM, preparadas por el usuario mradermacher. La model card del repositorio no incluye información detallada sobre el modelo original, por lo que los datos técnicos específicos (arquitectura, parámetros exactos, licencia, etc.) no están disponibles en esta fuente. No obstante, por la familia Granite 4.x de IBM, se sabe que estos modelos emplean una arquitectura híbrida Mamba-2/transformer con opciones densas y Mixture-of-Experts, orientada a reducir uso de memoria y acelerar la inferencia.

El repositorio contiene únicamente pesos en formato GGUF con múltiples cuantizaciones (Q2_K, IQ3_M, Q4_K_M, Q6_K, etc.), lo que permite desplegar el modelo en entornos con recursos limitados. Dado que no hay información sobre el modelo base en la model card, esta ficha se basa en datos generales de la familia Granite y en el propio repositorio de cuantización, indicando explícitamente lo que no se conoce.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida Mamba-2/transformer (según familia Granite 4.x, no confirmado para 4.2) |
| Parametros totales | no disponible (el dato de 942.360 en el repo corresponde al tamaño del archivo de tensores, no al número de parámetros del modelo) |
| Parametros activos | no disponible (podría ser MoE, pero no confirmado) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, IQ3_M, Q4_K_S, IQ3_XXS, Q3_K_M, small-IQ4_NL, Q4_K_M, IQ2_M, Q6_K, IQ4_XS, Q2_K_S, IQ1_M, Q3_K_S, IQ2_XXS, Q3_K_L, IQ2_XS, Q5_K_S, IQ2_S, IQ1_S, Q5_K_M, Q4_0, IQ3_XS, Q4_1, IQ3_S |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (safetensors original en el repo base, no incluido aquí) |

## Arquitectura y entrenamiento

No hay información en la model card sobre la arquitectura, los datos de entrenamiento o el proceso de entrenamiento del modelo `granite-4.2-3b`. Sin embargo, por la documentación pública de IBM sobre la familia Granite 4.0 y 4.1, los modelos de esta serie emplean una arquitectura híbrida que combina capas Mamba-2 (estado-espacio) con capas transformer, lo que permite reducir el uso de memoria y acelerar la inferencia en comparación con transformers puros. Algunas variantes usan Mixture-of-Experts (MoE) para activar solo un subconjunto de parámetros por token, aunque no se puede confirmar si esto aplica a la versión 3B.

El repositorio de cuantizaciones indica que los pesos originales provienen de `ibm-granite/granite-4.2-3b` en formato safetensors, y que se han convertido a GGUF con imatrix (quantización con matrices de importancia). No se especifican detalles de entrenamiento (número de tokens, dataset, RLHF/DPO, etc.).

## Capacidades

- No se han publicado capacidades específicas en la model card de este repositorio.
- Por ser un modelo de la familia Granite, se espera que sea un modelo de lenguaje general con capacidades de generación de texto, razonamiento y posiblemente generación de código, pero no está confirmado para esta versión.
- No hay información sobre tool calling, agentes, visión o audio.
- Soporte multilingüe no especificado.

## Casos de uso

Dado que no se dispone de información oficial sobre el modelo base, los casos de uso son especulativos y deben tomarse con cautela. Si el modelo sigue las capacidades de Granite 4.x, podría aplicarse a:

- Despliegue en edge: gracias al formato GGUF y a las cuantizaciones ligeras (Q2_K, IQ3_M), el modelo podría ejecutarse en dispositivos con poca memoria (Raspberry Pi, móviles) para generación de texto básica.
- Prototipado rápido: los pesos GGUF son compatibles con llama.cpp, Ollama y otros frameworks, lo que facilita experimentos locales sin GPU de gama alta.
- Inferencia de baja latencia: la arquitectura híbrida de Granite (si se confirma) promete inferencia más rápida que un transformer puro, útil para aplicaciones en tiempo real.
- Generación de texto asistida: en entornos sin conexión, como chatbots o asistentes personales en local.
- Educación e investigación: para estudiar el comportamiento de modelos cuantizados de 3B en tareas de lenguaje natural.

Sin embargo, ninguno de estos usos está respaldado por documentación oficial del repositorio, y se recomienda verificar el modelo base antes de usarlo en producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión. Para un modelo de ~3B parámetros cuantizado a Q4_K_M, se estima entre 2 y 3 GB de VRAM, pero no hay datos concretos.
- GPU recomendadas: no disponible. Modelos de 3B cuantizados suelen caber en GPUs de consumo como RTX 3060 (12GB), RTX 4060 (8GB) o incluso en CPU con suficiente RAM.
- Opciones de despliegue: al ser GGUF, compatible con llama.cpp, Ollama, LM Studio, vLLM (con adaptadores GGUF) y TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de datos específicos del modelo base para comparar. Como referencia de la familia, Granite 4.0 incluía tamaños micro, tiny y small con arquitecturas densas e híbridas, pero no se conocen cifras concretas de rendimiento para esta versión. Se recomienda consultar la documentación de IBM Granite para comparar con otros modelos de la misma serie.

## Limitaciones y advertencias

- La model card del repositorio no proporciona información sobre sesgos, alucinaciones o limitaciones de contexto.
- El modelo base es de IBM, pero la licencia no está especificada en este repo; es necesario verificar la licencia del modelo original en `ibm-granite/granite-4.2-3b` antes de uso comercial.
- Las cuantizaciones GGUF pueden degradar la calidad de generación respecto al modelo en fp16, especialmente en tareas complejas.
- No se dispone de información sobre idiomas soportados; si se necesita multilingüe, hay que probar el modelo.
- La arquitectura exacta no está confirmada para la versión 4.2-3b; asumir características de Granite 4.0/4.1 puede ser erróneo.

## Enlaces

- Repositorio de cuantizaciones: https://huggingface.co/mradermacher/granite-4.2-3b-i1-GGUF
- Modelo base (safetensors): https://huggingface.co/ibm-granite/granite-4.2-3b
- Documentación de Granite 4.0: https://www.ibm.com/granite/docs/models/granite
- Repositorio de conversión GGUF de IBM: https://github.com/IBM/gguf
- Repositorio de modelos Granite 4.0: https://github.com/ibm-granite/granite-4.0-language-models
