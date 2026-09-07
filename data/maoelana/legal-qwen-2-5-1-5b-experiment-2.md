# maoelana/legal-qwen-2.5-1.5b-experiment-2

## Resumen

El modelo `maoelana/legal-qwen-2.5-1.5b-experiment-2` es un ajuste fino experimental de `Qwen2.5-1.5B` orientado al dominio legal, desarrollado por el usuario `maoelana`. Se trata de un modelo de texto generativo basado en la arquitectura Qwen2, con 1.543.714.304 parámetros totales, entrenado con la librería Unsloth y el framework TRL de Hugging Face. El modelo base fue cargado en cuantización 4-bit, lo que aceleró el entrenamiento, y posteriormente se subieron los pesos en formato safetensors.

Este modelo pretende abordar tareas de procesamiento de lenguaje natural en el ámbito jurídico, aunque no se han publicado detalles sobre el conjunto de datos utilizado ni sobre el proceso de entrenamiento. Al tratarse de un modelo pequeño (1.5B), su relevancia radica en la posibilidad de ejecutarlo en hardware modesto, lo que lo convierte en una opción interesante para experimentos y prototipos en entornos con recursos limitados. No obstante, al ser un experimento sin evaluaciones públicas, su rendimiento real en tareas legales es desconocido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen2 (transformer decoder-only) |
| Parametros totales | 1.543.714.304 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la ficha del modelo; el modelo base Qwen2.5-1.5B soporta hasta 128K tokens |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino de `unsloth/qwen2.5-1.5b-unsloth-bnb-4bit`, que a su vez es una versión cuantizada en 4-bit del modelo base `Qwen/Qwen2.5-1.5B`. La arquitectura subyacente es un transformer decoder-only de la familia Qwen2, con 1.5B parámetros. El entrenamiento se realizó utilizando Unsloth para acelerar el proceso y la librería TRL de Hugging Face, aunque no se especifican hiperparámetros, duración ni composición del dataset. El modelo base Qwen2.5-1.5B fue preentrenado en un corpus de hasta 18 billones de tokens y soporta un contexto de 128K tokens, pero no hay información que confirme si el ajuste fino ha mantenido o modificado estas características.

No se han descrito innovaciones técnicas destacables en el ajuste fino. El uso de Unsloth es una optimización de eficiencia de entrenamiento, no una mejora arquitectónica.

## Capacidades

- No se han publicado detalles específicos sobre las capacidades del modelo ajustado.
- Hereda las capacidades generales del modelo base Qwen2.5-1.5B, que incluyen generación de texto, razonamiento básico, soporte multilingüe y manejo de contexto largo.
- No se ha confirmado soporte para tool calling, function calling, agentes, visión ni audio.
- Al ser un modelo pequeño, su capacidad de razonamiento complejo es limitada en comparación con modelos de mayor tamaño.
- El ajuste fino puede haber reducido las capacidades generales del modelo base debido a un posible olvido catastrófico, aunque esto no se ha evaluado públicamente.

## Casos de uso

- Asistencia en investigación jurídica: el modelo podría utilizarse para resumir documentos legales o extraer información relevante de textos jurídicos, aunque su eficacia no ha sido validada.
- Redacción de borradores de contratos: puede generar plantillas o cláusulas iniciales a partir de instrucciones en lenguaje natural, siempre que se supervise el resultado.
- Clasificación de documentos legales: potencialmente útil para etiquetar o categorizar textos jurídicos en entornos de bajo coste computacional.
- Chatbots de atención legal básica: podría integrarse en sistemas de respuesta a preguntas frecuentes sobre procedimientos legales, con respuestas generadas a partir de conocimiento general.
- Análisis de sentencias o normativas: uso experimental para extraer puntos clave o comparar fragmentos de texto legal, con la limitación de no contar con evaluaciones de calidad.
- Prototipos de sistemas legales: adecuado para pruebas de concepto en empresas o despachos que necesiten un modelo ligero y de licencia permisiva.

Estos casos de uso son potenciales y no están respaldados por benchmarks ni validaciones publicadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3 GB en FP16 y alrededor de 1 GB en cuantización 4-bit.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM, como una RTX 3060, RTX 4060, T4 o equivalente.
- Es posible ejecutar el modelo en GPUs de consumo.
- Opciones de despliegue: Transformers, vLLM, llama.cpp, Ollama y TGI.
- Latencia y throughput estimados: no disponibles. Dado el tamaño de 1.5B, se espera una latencia baja en GPUs modernas, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| maoelana/legal-qwen-2.5-1.5b-experiment-2 | 1.543.714.304 | No disponible | Apache 2.0 | Hugging Face |
| Qwen/Qwen2.5-1.5B | 1.540.000.000 (aprox.) | 128K | Apache 2.0 | Hugging Face, Ollama |

No se han identificado otros modelos comparables de la misma categoría (tamaño similar y dominio legal) en la información proporcionada.

## Limitaciones y advertencias

- No se ha publicado información sobre sesgos, riesgos de alucinación o comportamiento en dominios legales específicos.
- El modelo es experimental y no ha sido evaluado de forma independiente.
- El ajuste fino puede haber degradado capacidades generales del modelo base.
- La licencia Apache 2.0 permite uso comercial, pero no ofrece garantías de calidad ni de adecuación legal.
- Solo se declara soporte para inglés; no se ha verificado el rendimiento en otros idiomas.
- El contexto máximo no está confirmado para este ajuste fino, por lo que podría diferir del modelo base.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/maoelana/legal-qwen-2.5-1.5b-experiment-2
- Modelo base Qwen2.5-1.5B: https://huggingface.co/Qwen/Qwen2.5-1.5B
- Unsloth: https://github.com/unslothai/unsloth
- Ollama (para Qwen2.5 1.5b): https://ollama.com/library/qwen2.5:1.5b
