# exalandru/Arete-27B-oQ6h-mtp

## Resumen

Arete-27B-oQ6h-mtp es una cuantización mixta del modelo NousResearch/Arete-27B, publicada por el usuario exalandru bajo licencia Apache 2.0. Se distribuye en formato MLX (safetensors), lo que la orienta específicamente al ecosistema de Apple Silicon mediante la librería MLX. El checkpoint incorpora además una cabeza MTP (multi-token prediction) restaurada a partir de un modelo Qwen 3.8 27B, lo que habilita decodificación especulativa y predicción de varios tokens por paso.

El modelo base es un transformer multimodal con componente de visión (0,461B de pesos lógicos) y un lenguaje de 7,772B, sobre una arquitectura etiquetada como `qwen3_5`. El checkpoint completo suma 8.657.057.520 parámetros lógicos, aunque la cuantización mixta hace que el almacenamiento real sea de 22,226 GiB (23,865 GB), con un promedio efectivo de 22,054 bits por peso. Esta cifra es alta porque más de la mitad de los pesos (55,935%) se conservan en U32 sin comprimir.

La relevancia de esta ficha es doble: por un lado, documenta una receta de cuantización mixta poco habitual que combina bloques de 6 bits, 8 bits, BF16 y U32 en un mismo checkpoint; por otro, es un ejemplo de integración de MTP en un modelo que originalmente no lo tenía, algo relevante para acelerar la inferencia en hardware de Apple. El número de descargas y likes es cero en el momento de la consulta, por lo que se trata de una publicación reciente y sin validación comunitaria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (etiqueta `qwen3_5`), con cabeza MTP |
| Parametros totales | 8.657.057.520 (lógicos); 7,772B en el modelo de lenguaje, 0,461B en visión, 0,425B en la cabeza MTP |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Mixta: affine 6-bit grupo 64, affine 8-bit grupo 64, BF16 y U32; promedio efectivo 22,054 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El checkpoint es una cuantización del modelo NousResearch/Arete-27B, del que no se detallan en la información disponible ni el número de tokens de entrenamiento ni la composición del dataset ni las etapas de alineación (RLHF/DPO). La arquitectura base se etiqueta como `qwen3_5`, lo que sugiere una familia derivada de Qwen 3.5, con un tronco de lenguaje de 7,772B de pesos lógicos y un codificador de visión de 0,461B. La cabeza MTP, de 0,425B, se restauró desde un modelo Qwen 3.8 27B, un detalle técnico relevante porque permite predicción multi-token y decodificación especulativa.

La innovación principal de esta publicación es la receta de cuantización mixta aplicada con oQ (oMLX v0.8.4). La distribución no es uniforme: 1,602B de pesos se guardan en affine 6-bit (6,50 bits/peso efectivos), 1,313B en affine 8-bit (8,50 bits/peso), 0,900B en BF16 (16 bits/peso) y 4,842B en U32 sin comprimir (32 bits/peso). Esa mezcla eleva el promedio a 22,054 bits/peso y explica que un modelo de 8,657B ocupe 22,226 GiB, muy por encima de lo que ocuparía una cuantización uniforme de 4 o 6 bits. No se documenta qué capas recibieron cada precisión ni el criterio de asignación.

## Capacidades

- Generación de texto y razonamiento: el tronco de lenguaje de 7,772B soporta tareas generativas y de razonamiento multi-paso.
- Procesamiento de visión: incluye un componente visual de 0,461B, por lo que admite entrada de imágenes además de texto.
- Predicción multi-token (MTP): la cabeza restaurada permite decodificación especulativa, con el potencial de aumentar el throughput en MLX.
- Cuantización mixta: mantiene capas sensibles en BF16 y U32 mientras comprime otras, buscando un equilibrio entre calidad y tamaño.
- Compatibilidad con MLX: diseñado para ejecutarse en el framework de Apple, con soporte nativo en Apple Silicon.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo thinking explícito: no disponible en la información proporcionada.

## Casos de uso

- Inferencia local en Mac con Apple Silicon: el formato MLX y la cuantización mixta permiten cargar el checkpoint en equipos con memoria unificada amplia (el repo ocupa 23,9 GB), usando MLX en lugar de CUDA.
- Experimentación con decodificación especulativa: la cabeza MTP restaurada permite probar y medir la ganancia de throughput de la predicción multi-token frente a la decodificación autoregresiva clásica.
- Investigación sobre cuantización mixta: el checkpoint sirve como caso de estudio de una receta que mezcla 6 bits, 8 bits, BF16 y U32, útil para analizar el impacto de la asignación de precisión por capa en la calidad final.
- Evaluación de modelos multimodales en local: al incluir un codificador de visión, se puede usar para tareas de descripción de imágenes, VQA o extracción de información de documentos en un entorno sin GPU NVIDIA.
- Reproducción de pipelines de NousResearch: al derivar de Arete-27B, permite validar en MLX flujos ya construidos para el modelo base, comparando la salida cuantizada con la del original.
- Desarrollo de prototipos de asistentes con contexto conversacional: el tamaño del tronco de lenguaje (7,772B) es manejable para iterar en local antes de desplegar en infraestructura mayor.
- Pruebas de robustez y alucinación: útil para comparar la tasa de alucinación del checkpoint cuantizado frente al modelo base en tareas controladas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Almacenamiento: el repo ocupa 23,9 GB y el checkpoint descomprimido 22,226 GiB, por lo que se necesita al menos ese espacio libre en disco.
- Memoria: al ser un checkpoint MLX, requiere memoria unificada de Apple Silicon; con 22,226 GiB de pesos más overhead de activaciones y contexto, un equipo de 32 GB es el mínimo razonable y 64 GB o más es recomendable.
- GPU: no aplica CUDA; el destino es Apple Silicon (series M1/M2/M3/M4 con memoria unificada suficiente). No se documentan requisitos para A100, H100 ni RTX 4090.
- Consumer GPU: no es un checkpoint pensado para GPUs de consumo NVIDIA; su formato MLX lo limita al ecosistema Apple.
- Despliegue: MLX (librería `mlx`), con la herramienta oQ/oMLX v0.8.4 empleada para la cuantización. No se indica compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; la presencia de MTP sugiere una mejora potencial, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Arete-27B-oQ6h-mtp | 8,657B lógicos (7,772B LM + 0,461B visión + 0,425B MTP) | no disponible | safetensors MLX | Apache 2.0 | Cuantización mixta 22,054 bits/peso con MTP restaurado |
| NousResearch/Arete-27B | no disponible | no disponible | no disponible | no disponible | Modelo base sin cuantizar del que deriva este checkpoint |
| Qwen 3.8 27B | no disponible | no disponible | no disponible | no disponible | Origen de la cabeza MTP restaurada |

No se dispone de datos de rendimiento del modelo base ni de las alternativas en la información proporcionada, por lo que la comparativa se limita a parámetros y formato.

## Limitaciones y advertencias

- La cuantización mixta con un promedio de 22,054 bits/peso es inusualmente alta y encarece el almacenamiento y la memoria frente a cuantizaciones uniformes de 4 o 6 bits; no hay evidencia publicada de que la mezcla conserve mejor la calidad que una receta más simple.
- Más de la mitad de los pesos (55,935%) están en U32 sin comprimir, lo que reduce el beneficio práctico de la compresión y puede limitar el despliegue en equipos con memoria unificada ajustada.
- La cabeza MTP se restauró desde un modelo distinto (Qwen 3.8 27B); no se documenta la compatibilidad exacta con el tronco de Arete-27B ni el impacto en la calidad de las predicciones especulativas.
- No se especifican idiomas soportados, longitud de contexto ni capacidades de tool calling, agentes o modo thinking.
- No hay benchmarks publicados ni validación comunitaria (0 descargas, 0 likes), por lo que se desconoce el impacto real de la cuantización en MMLU, HumanEval, GSM8K u otras métricas.
- Riesgo de alucinación y sesgos: no documentados para este checkpoint; deben asumirse los del modelo base, no evaluados aquí.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar las condiciones del modelo base NousResearch/Arete-27B y del modelo Qwen 3.8 27B del que procede la cabeza MTP.
- El formato MLX limita el despliegue a Apple Silicon; no es directamente portable a CUDA sin conversión.

## Enlaces

- Hugging Face: https://huggingface.co/exalandru/Arete-27B-oQ6h-mtp
- Modelo base: https://huggingface.co/NousResearch/Arete-27B
- Herramienta de cuantización oQ (oMLX): https://github.com/jundot/omlx
