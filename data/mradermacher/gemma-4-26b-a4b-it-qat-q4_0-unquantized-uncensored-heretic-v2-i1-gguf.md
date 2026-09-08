# mradermacher/gemma-4-26B-A4B-it-qat-q4_0-unquantized-uncensored-heretic-v2-i1-GGUF

## Resumen

Este repositorio contiene una cuantización GGUF del modelo `OS-Software/gemma-4-26B-A4B-it-qat-q4_0-unquantized-uncensored-heretic-v2`, que a su vez es una versión modificada del modelo Gemma 4 de Google. El sufijo "heretic-v2" y las etiquetas `uncensored`, `decensored` y `abliterated` indican que se ha alterado deliberadamente para reducir o eliminar los mecanismos de rechazo y alineación del modelo original.

El modelo base es un modelo de visión multimodal (según la model card) con arquitectura de Mixture of Experts, con 26.000 millones de parámetros totales y aproximadamente 4.000 millones de parámetros activos según la nomenclatura A4B. Cabe destacar que la información del repositorio indica que el archivo `safetensors` contiene 14.224.235 parámetros, un valor inconsistente con el nombre del modelo; este dato probablemente corresponde a un archivo intermedio y no debe interpretarse como el tamaño real del modelo.

El repositorio actual no contiene los pesos completos del modelo, sino un único archivo de matriz de importancia (imatrix) en formato GGUF, pensado para que los usuarios generen sus propias cuantizaciones. Los archivos GGUF estáticos están disponibles en un repositorio enlazado del mismo autor.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE (según el nombre del modelo) |
| Parámetros totales | No disponible (el metadato del repositorio indica 14.224.235, inconsistente con el nombre) |
| Parámetros activos | 4B activos (según la nomenclatura A4B) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible en este repositorio (contiene un archivo imatrix para crear cuantizaciones) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache-2.0 (con términos adicionales de la licencia de Gemma 4) |
| Formato de pesos | GGUF (archivo de matriz de importancia) |

## Arquitectura y entrenamiento

El modelo base se describe como `gemma-4-26B-A4B-it`, lo que indica una arquitectura de Transformer con Mixture of Experts (MoE). La nomenclatura A4B sugiere que se activan aproximadamente 4.000 millones de parámetros por token, mientras que el total de parámetros sería de 26.000 millones. El sufijo `qat-q4_0-unquantized` apunta a que el modelo podría haber utilizado una técnica de entrenamiento sensible a la cuantización (QAT, quantization-aware training), pero los pesos se mantienen sin cuantizar en el modelo base. El término `abliterated` indica que se ha aplicado una técnica de abliteración, que elimina las direcciones de activación asociadas con el rechazo de solicitudes, produciendo un modelo menos restrictivo.

No se dispone de información detallada sobre el número de tokens de entrenamiento, la composición del dataset ni los procesos de RLHF o DPO.

## Capacidades

- Generación de texto en inglés y procesamiento de imágenes, ya que la model card lo describe como un modelo de visión.
- La variante ha sido modificada para reducir el rechazo de contenidos, lo que se traduce en una mayor disposición a responder solicitudes que un modelo alineado rechazaría.
- Etiquetas como `decensored` y `heretic` refuerzan que el modelo ha sido manipulado para eliminar filtros morales o de seguridad.
- El repositorio está etiquetado como `endpoints_compatible`, lo que sugiere que puede integrarse en entornos de inferencia con API compatibles.
- Compatible con herramientas que utilizan archivos GGUF, como llama.cpp, Ollama o LM Studio.
- No se ha documentado soporte de tool calling, función llamada "function calling", ni capacidades de agente o razonamiento multi-paso.

## Casos de uso

- Generación de contenidos creativos sin filtros: el modelo puede aceptar prompts que versiones alineadas rechazarían, resultando útil en experimentación narrativa o artística donde las restricciones de seguridad interfieren.
- Investigación en abliteración y desalineación: permite estudiar el comportamiento de modelos MoE sometidos a técnicas de eliminación de rechazo, comparando sus respuestas con las del modelo base.
- Creación de cuantizaciones personalizadas: el archivo imatrix puede usarse para generar cuantizaciones GGUF propias con niveles de compresión y calidad adaptados al hardware disponible.
- Prototipado de aplicaciones multimodales en local: gracias a su capacidad de visión, puede integrarse en proyectos que requieran analizar imágenes sin conexión, usando el formato GGUF.
- Evaluación de robustez en modelos sin restricciones: sirve para analizar cómo se comporta un modelo descensurado ante solicitudes de contenido sensible, útil para trabajos sobre seguridad o alineación.
- Despliegue en entornos con recursos limitados: al ser un modelo MoE con 4B activos, su coste computacional por token es menor que el de un modelo denso de 26B, lo que facilita su uso en hardware con VRAM ajustada si se emplean las cuantizaciones adecuadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- No disponible: el repositorio actual no contiene un modelo ejecutable, solo un archivo de matriz de importancia.
- Para ejecutar el modelo es necesario utilizar las cuantizaciones GGUF estáticas del repositorio enlazado.
- No se proporcionan datos de VRAM mínima, GPUs recomendadas ni métricas de latencia o throughput.

## Comparativa con modelos similares

No disponible.

## Limitaciones y advertencias

- El modelo ha sido deliberadamente desalineado mediante abliteración y etiquetas como `uncensored`. Esto elimina los mecanismos de rechazo, por lo que puede generar contenido dañino, ilegal o no seguro sin ninguna advertencia.
- La licencia del repositorio es Apache-2.0, pero el modelo base proviene de Gemma 4, cuya licencia específica puede imponer términos adicionales. Es obligatorio revisar el enlace a la licencia de Gemma 4 antes de usar comercialmente.
- El repositorio solo contiene un archivo imatrix y no es ejecutable directamente; los usuarios deben descargar los pesos desde el repositorio de cuantizaciones estáticas.
- La documentación es escasa y no se especifican benchmarks, limitaciones de contexto ni soporte de herramientas.
- El modelo está limitado al idioma inglés.
- No hay datos del proceso de entrenamiento, lo que impide evaluar la calidad o fiabilidad del modelo con precisión.

## Enlaces

- Repositorio HuggingFace de este modelo: https://huggingface.co/mradermacher/gemma-4-26B-A4B-it-qat-q4_0-unquantized-uncensored-heretic-v2-i1-GGUF
- Modelo base: https://huggingface.co/OS-Software/gemma-4-26B-A4B-it-qat-q4_0-unquantized-uncensored-heretic-v2
- Repositorio de cuantizaciones estáticas: https://huggingface.co/mradermacher/gemma-4-26B-A4B-it-qat-q4_0-unquantized-uncensored-heretic-v2-GGUF
- Licencia de Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Página de descarga del modelo: https://hf.tst.eu/model#gemma-4-26B-A4B-it-qat-q4_0-unquantized-uncensored-heretic-v2-i1-GGUF
- Preguntas frecuentes del cuantizador: https://huggingface.co/mradermacher/model_requests
