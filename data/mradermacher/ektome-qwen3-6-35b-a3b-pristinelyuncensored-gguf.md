# mradermacher/Ektome-Qwen3.6-35B-A3B-PristinelyUncensored-GGUF

## Resumen

Ektome-Qwen3.6-35B-A3B-PristinelyUncensored-GGUF es una conversión a formato GGUF del modelo base Zynerji/Ektome-Qwen3.6-35B-A3B-PristinelyUncensored, realizada por mradermacher. El modelo original es un sistema de mezcla de expertos (MoE) con 35.505.251.456 parámetros totales y una denominación A3B que apunta a 3 mil millones de parámetros activos por token. Incluye componentes multimodales de visión y lenguaje, y ha sido procesado mediante una técnica de "abliteración" para eliminar los mecanismos de rechazo y censura sin reentrenamiento (tags no-finetuning, no-training). El resultado es un modelo sin restricciones de contenido, pensado para experimentación y uso conversacional en inglés.

Esta variante GGUF ofrece cuantizaciones estáticas para su despliegue con llama.cpp, Ollama y otros motores compatibles. Su tamaño reducido en cuantización Q4_K_S (20.5 GB) lo hace utilizable en GPUs de consumo con 24 GB de VRAM, manteniendo una estructura MoE que reduce la carga computacional en comparación con modelos densos del mismo tamaño.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE), variante de la familia Qwen3.6 con proyector multimodal (mmproj). Arquitectura Ektome no documentada públicamente. |
| Parametros totales | 35.505.251.456 (35.5B) |
| Parametros activos | 3B (según la denominación "A3B"; no confirmado en documentación oficial) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K (13.3 GB), Q4_K_S (20.5 GB), mmproj-Q8_0 (0.7 GB), mmproj-f16 (1.0 GB) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repositorio de cuantizaciones); safetensors para el modelo base |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer de mezcla de expertos (MoE) con un total de 35.5 mil millones de parámetros y, según la nomenclatura del modelo, aproximadamente 3 mil millones de parámetros activos durante la decodificación. Esta configuración permite inferencia más rápida y menor consumo de memoria que un modelo denso equivalente. El modelo incorpora además un proyector multimodal (archivos mmproj) capaz de procesar entradas de imagen, lo que lo clasifica como vision-language.

El proceso de entrenamiento no está documentado en la información disponible. Los tags del repositorio indican que el modelo base fue sometido a "abliteración", un procedimiento que elimina los comportamientos de rechazo o censura sin necesidad de entrenamiento adicional. No se dispone de datos sobre el número de tokens de entrenamiento, la composición del dataset ni la aplicación de técnicas como RLHF o DPO. La conversión a GGUF realizada por mradermacher es una cuantización estática, sin ponderaciones de importancia (imatrix).

## Capacidades

- Generacion de texto conversacional en ingles.
- Procesamiento multimodal de imagenes junto con texto (vision-language), mediante el archivo de proyector mmproj.
- Inferencia eficiente gracias a la arquitectura MoE con solo 3B parametros activos.
- Contenido sin restricciones: al haber sido abliterado, el modelo no aplica rechazos de seguridad tipicos, lo que permite generar respuestas sobre temas que otros modelos censuran.
- Uso con herramientas de despliegue de GGUF como llama.cpp u Ollama.
- No se han documentado capacidades de tool calling, agentes ni razonamiento multi-paso en la informacion proporcionada.

## Casos de uso

- Analisis de contenido visual en entornos sin restricciones: el modelo puede describir o interrogar imagenes gracias a su proyector multimodal, siendo util en investigacion donde se necesite extraer informacion de fotografias sin filtros de seguridad.
- Generacion de texto creativo y exploracion de temas sensibles: la ausencia de censura permite escribir narrativas, dialogos o ensayos sobre contenido politicamente incorrecto o polemico para propositos de estudio creativo.
- Asistentes conversacionales de uso local: el formato GGUF y la baja cantidad de parametros activos permiten ejecutar el modelo en una GPU de 24 GB, habilitando chatbots privados sin dependencia de servicios en la nube.
- Prototipado de aplicaciones multimodales: la combinacion de entrada de texto e imagen facilita el desarrollo de demos funcionales sin necesidad de un pipeline de vision externo.
- Investigacion en alineacion y seguridad: este modelo sirve como caso de estudio para analizar los efectos de la abliteracion en el comportamiento de LLMs, comparando respuestas con versiones censuradas.
- Experimentacion con arquitecturas MoE: al ser una cuantizacion GGUF, es adecuado para probar estrategias de compresion y rendimiento en frameworks compatibles como llama.cpp, sin necesidad de entrenar o ajustar el modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen datos de evaluaciones comparativas como MMLU, HumanEval o GSM8K para este modelo ni para la variante GGUF. Los unicos datos de rendimiento indirectos son el tamaño de los archivos de cuantizacion, que sugieren una mejora de velocidad respecto a modelos densos del mismo tamano debido a la activacion parcial de expertos, pero este punto no ha sido verificado con pruebas independientes.

## Requisitos de hardware

- La cuantizacion Q4_K_S (20.5 GB de pesos) requiere aproximadamente 24-28 GB de VRAM para cargar los pesos y sus buffers de calculo en GPU, recomendandose una RTX 4090, A100 40GB o superior.
- La cuantizacion Q2_K (13.3 GB) es la unica con posibilidad de ejecucion en una GPU de consumo con 16 GB de VRAM, si bien es previsible una perdida de calidad en la generacion.
- Los archivos mmproj (0.7-1.0 GB) deben cargarse adicionalmente para habilitar el modo multimodal.
- El modelo puede ejecutarse en CPU con suficiente RAM, por ejemplo 32 GB para la cuantizacion Q2_K, aunque la velocidad de generacion sera baja.
- Motores de despliegue compatibles: llama.cpp, Ollama, LM Studio (mediante archivos GGUF). Tambien es posible usar librerias de Python como llama-cpp-python.
- No se dispone de mediciones de latencia ni de throughput para esta variante.

## Comparativa con modelos similares

No disponible. No se han identificado en la informacion proporcionada modelos comparables de mismo tamano, arquitectura o proposito. La combinacion de MoE de 35B con abliteracion y soporte multimodal es, a dia de hoy, una configuracion sin pares directos en el repositorio de modelos GGUF de acceso publico.

## Limitaciones y advertencias

- Solo habla ingles, tal y como se indica en la model card. Cualquier uso en otros idiomas fallara o producira resultados inconsistentes.
- La arquitectura "Ektome" y el proceso de abliteracion no estan documentados tecnicamente, lo que implica una trazabilidad limitada.
- Al ser un modelo "uncensored", existe un riesgo elevado de generar contenido ofensivo, ilegal o perjudicial. Esto lo desaconseja para aplicaciones de produccion orientadas al publico general.
- No se han publicado evaluaciones de sesgos, alucinacion ni robustez, por lo que el comportamiento en entornos reales es impredecible.
- La cuantizacion estatica (sin imatrix) puede degradar la calidad de la generacion en comparacion con pesos originales, especialmente en la version Q2_K.
- La licencia Apache 2.0 permite uso comercial, pero se debe verificar que el modelo base y cualquier dataset de entrenamiento no impongan restricciones adicionales no visibles en el repositorio GGUF.
- No se conoce la longitud de contexto efectiva, lo que impide aplicaciones que requieran ventanas de contexto largas como analisis de documentos extensos.

## Enlaces

- Repositorio GGUF en Hugging Face: https://huggingface.co/mradermacher/Ektome-Qwen3.6-35B-A3B-PristinelyUncensored-GGUF
- Modelo base en Hugging Face: https://huggingface.co/Zynerji/Ektome-Qwen3.6-35B-A3B-PristinelyUncensored
- Instrucciones de uso de GGUF por TheBloke (referencia): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Alternativa de cuantizacion similar: https://huggingface.co/mradermacher/Qwen3.6-35B-A3B-Uncensored-Genesis-Hermes-V11-dequantized-GGUF
