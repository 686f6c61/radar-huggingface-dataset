# Lufel6848/Qwen3.5-9B-GGUF

## Resumen

Este repositorio contiene una conversión comunitaria a formato GGUF del modelo Qwen3.5-9B, desarrollado originalmente por el equipo Qwen de Alibaba. La conversión ha sido realizada por Lufel6848 utilizando las herramientas de `llama.cpp` y ofrece cuatro niveles de cuantización (Q4_K_M, Q5_K_M, Q6_K y Q8_0) para facilitar la inferencia local en hardware con recursos limitados. No se ha realizado ningún entrenamiento o ajuste adicional sobre los pesos originales; se trata únicamente de una transformación de formato y una reducción de precisión numérica.

El modelo base, Qwen3.5-9B, es un modelo de lenguaje de 9.197 millones de parámetros con licencia Apache 2.0 y soporte para inglés y chino. Sin embargo, la model card de esta conversión no proporciona detalles sobre la arquitectura interna, la longitud de contexto ni las capacidades específicas del modelo original, por lo que estos datos deben consultarse en el repositorio oficial de Qwen. La relevancia de este repositorio radica en que permite ejecutar el modelo en entornos locales mediante software compatible con GGUF, como `llama.cpp`, sin necesidad de depender de servicios en la nube.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 9.197.093.888 |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | en, zh |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo original en la model card de esta conversión. El repositorio se limita a documentar el proceso de conversión de SafeTensors a GGUF y la posterior cuantización, sin aportar detalles sobre el diseño del transformer, el número de capas, el mecanismo de atención o los datos de entrenamiento utilizados por Qwen. Tampoco se menciona si el modelo original emplea técnicas como RLHF, DPO o decodificación especulativa.

La conversión se realizó mediante el script `convert_hf_to_gguf.py` y la herramienta `llama-quantize` de `llama.cpp`, siguiendo un flujo reproducible documentado en un cuaderno Jupyter alojado en GitHub. No se ha aplicado ningún ajuste fino posterior a la conversión, por lo que las capacidades del modelo son las mismas que las del modelo base, aunque la cuantización puede introducir ligeras pérdidas de precisión.

## Capacidades

No se han documentado capacidades específicas en la model card de esta conversión. Al tratarse de una conversión de un modelo de lenguaje de 9 mil millones de parámetros, es razonable esperar que herede las capacidades generales del modelo Qwen3.5-9B, como generación de texto, razonamiento, comprensión de instrucciones y soporte multilingüe (inglés y chino). Sin embargo, no se proporcionan datos concretos sobre tool calling, capacidades de agente, visión o audio. Se recomienda consultar el repositorio original del modelo para obtener una lista detallada de sus capacidades.

## Casos de uso

Dado que la información disponible se limita a la conversión GGUF, los casos de uso se derivan de la naturaleza del modelo y del formato:

- Inferencia local con `llama.cpp`: el formato GGUF permite ejecutar el modelo en CPU o GPU mediante `llama-cli` o `llama-server`, sin necesidad de infraestructura en la nube.
- Asistente conversacional en local: con una cuantización como Q5_K_M, el modelo puede integrarse en aplicaciones de chat que requieran privacidad y control total de los datos.
- Generación de texto en entornos sin conexión: útil para redacción, resumen o traducción cuando no se dispone de acceso a APIs externas.
- Prototipado rápido de aplicaciones de lenguaje: los archivos GGUF son fáciles de cargar con bibliotecas como `llama-cpp-python`, lo que facilita la experimentación en entornos de desarrollo.
- Despliegue en hardware modesto: las cuantizaciones Q4_K_M y Q5_K_M reducen los requisitos de memoria, permitiendo su uso en equipos con 8 GB de VRAM o incluso en CPU.
- Integración en pipelines de automatización: al ser un modelo local, puede integrarse en flujos de trabajo que requieran procesamiento de texto sin depender de servicios externos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El tamaño total del repositorio es de 48,2 GB, que incluye las cuatro cuantizaciones. No se indican los tamaños individuales de cada archivo GGUF.
- Para una cuantización Q4_K_M, se estima que el archivo ocupará aproximadamente 5-6 GB, requiriendo al menos 6-8 GB de VRAM para inferencia con contexto moderado. Esta cifra es orientativa y depende del backend y la configuración de KV cache.
- La cuantización Q8_0, al ser de mayor precisión, requerirá aproximadamente 9-10 GB de VRAM, por lo que necesitará una GPU con al menos 12 GB de memoria.
- En CPU, el modelo puede ejecutarse con `llama.cpp`, aunque la velocidad será significativamente menor que en GPU. Se recomienda al menos 16 GB de RAM para las cuantizaciones más ligeras.
- GPUs recomendadas: RTX 3060 12 GB o superior para Q4_K_M/Q5_K_M; RTX 4090 o A100 para Q8_0 con contextos largos.
- Opciones de despliegue: `llama.cpp`, `llama-cpp-python`, `Ollama`, `LM Studio` y cualquier otro software compatible con GGUF.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa con otros modelos. El repositorio no proporciona datos sobre rendimiento relativo, y no se conocen modelos comparables de la misma familia o tamaño en el contexto de esta conversión.

## Limitaciones y advertencias

- Conversión comunitaria no oficial: no está respaldada por el equipo de Qwen, por lo que puede haber diferencias sutiles respecto al modelo original en cuanto a comportamiento o compatibilidad.
- La cuantización puede degradar la calidad de las respuestas, especialmente en tareas que requieren alta precisión numérica o razonamiento complejo.
- No se ha documentado la longitud de contexto soportada; es posible que el modelo original tenga un límite específico que deba respetarse durante la inferencia.
- La compatibilidad con versiones antiguas de `llama.cpp` no está garantizada; se recomienda usar una versión reciente.
- No se han evaluado sesgos, alucinaciones o riesgos de seguridad en esta conversión. El usuario debe asumir la responsabilidad de su uso.
- La licencia Apache-2.0 permite uso comercial, pero se debe verificar que el modelo original Qwen3.5-9B también esté bajo esa licencia (así se indica en la model card).

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Lufel6848/Qwen3.5-9B-GGUF
- Modelo original Qwen3.5-9B: https://huggingface.co/Qwen/Qwen3.5-9B
- Cuaderno de conversión (GitHub): https://github.com/Lufel3846/Qwen3.5-9B-GGUF-Conversion-Notebook
- Proyecto llama.cpp: https://github.com/ggml-org/llama.cpp
- Sitio oficial de Qwen: https://qwen.ai/
