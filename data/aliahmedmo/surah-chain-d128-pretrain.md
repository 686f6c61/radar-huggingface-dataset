# AliAhmedMo/surah-chain-d128-pretrain

## Resumen

SurahChain d128 Pretrain es un modelo de lenguaje experimental desarrollado por Ali Ahmed Mohammed Alhaimi como parte del proyecto Neural Service Mesh (NSM). Se trata de un prototipo de investigación que introduce una arquitectura novedosa denominada "SurahChain" (cadena de suras), inspirada en la estructura del Corán, donde cada una de las 114 capas intermedias representa una "sura" de la lengua árabe. El modelo está diseñado para procesar texto árabe y explora una jerarquía de representaciones que va desde el nivel de carácter hasta el de frase.

El modelo tiene aproximadamente 2,4 millones de parámetros, un tamaño de contexto de 256 tokens y un vocabulario de 8192 tokens. Fue entrenado sobre 30 000 frases árabes durante 95 épocas en una GPU gratuita de Kaggle, con una pérdida final de 2,788. A pesar de su nombre, no es un modelo útil para tareas reales de generación de texto; el autor lo describe explícitamente como un "toy/prototype" destinado a documentar y reproducir la arquitectura, no a ser usado en producción.

La relevancia de este modelo reside en su propuesta arquitectónica: una combinación de bloques Transformer clásicos con una cadena de capas de dimensiones variables que se expanden dinámicamente durante el entrenamiento. Esto puede interesar a investigadores que estudian arquitecturas eficientes o que buscan alternativas a los modelos densos convencionales, aunque el modelo en sí no ofrece resultados prácticos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con Pre-Norm y cadena de 114 capas de dimensiones variables (SurahChain) |
| Parametros totales | ≈ 2,4 millones |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 256 tokens |
| Tipos de cuantizacion | no disponible (solo pesos en PyTorch) |
| Idiomas soportados | arabe (ar) |
| Licencia | no disponible |
| Formato de pesos | PyTorch (archivo .pt, 44 MB) |

## Arquitectura y entrenamiento

La arquitectura SurahChain combina dos bloques Transformer Pre-Norm al inicio y dos al final, con una cadena intermedia de 114 capas cuyas dimensiones ocultas varían a lo largo de la secuencia: comienzan en 7, se expanden hasta 286 y luego se reducen de nuevo. Cada capa incorpora puertas Highway y mecanismos LayerScale para estabilizar el entrenamiento. La idea central es que cada capa capture un nivel jerárquico distinto de la lengua árabe, desde caracteres hasta frases completas.

Durante el entrenamiento, dos capas de la cadena se expandieron dinámicamente en las épocas 17 y 19 mediante un mecanismo denominado "expansión de la más estrecha", que ajusta las dimensiones de las capas en función de la pérdida observada. Los pesos finales y las dimensiones entrenadas se guardan en `config.json`. El entrenamiento se realizó con el optimizador AdamW (lr=0.001) sobre 30 000 frases árabes, con un total de 84 420 pasos globales. No se menciona el uso de RLHF, DPO ni técnicas de alineación adicionales.

## Capacidades

- Generación de texto en árabe: el modelo puede producir secuencias de texto, aunque el autor advierte que no genera respuestas útiles ni coherentes.
- Procesamiento de texto árabe: está entrenado exclusivamente con frases en árabe y su tokenizador está adaptado a este idioma.
- Arquitectura experimental: sirve como banco de pruebas para la arquitectura SurahChain, incluyendo la expansión dinámica de capas.
- Reproducibilidad: el código del modelo (`model.py`) y los pesos están disponibles para que otros investigadores puedan replicar el entrenamiento o estudiar el comportamiento de la arquitectura.
- No dispone de capacidades de tool calling, agentes, razonamiento multi-paso, visión ni audio.

## Casos de uso

- Investigación académica en arquitecturas de redes neuronales: el modelo permite estudiar cómo se comporta una cadena de capas de dimensiones variables con puertas Highway y LayerScale, y compararla con arquitecturas Transformer estándar.
- Desarrollo de nuevas variantes de modelos de lenguaje: los investigadores pueden partir de `model.py` para modificar la arquitectura y probar configuraciones alternativas.
- Educación en aprendizaje profundo: sirve como ejemplo didáctico de un modelo Transformer con componentes inusuales (Highway, LayerScale, expansión dinámica) implementado en PyTorch.
- Experimentación con tokenizadores árabes: el vocabulario de 8192 tokens puede analizarse y adaptarse para otras tareas de NLP en árabe.
- Pruebas de infraestructura de despliegue: al ser un modelo pequeño (44 MB), puede utilizarse para validar pipelines de inferencia en entornos con recursos limitados, aunque no se recomienda para aplicaciones reales.
- Documentación de metodologías de entrenamiento: el cuaderno de Kaggle asociado documenta el proceso de entrenamiento en GPU gratuita, útil para quienes buscan ejemplos de cómo entrenar modelos pequeños con recursos limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor únicamente reporta la pérdida final de entrenamiento (≈ 2,788) y el número de pasos, pero no hay evaluaciones sobre tareas estándar como MMLU, HumanEval o GSM8K. Tampoco se comparan resultados con otros modelos.

## Requisitos de hardware

- Dado su tamaño (≈ 2,4 M de parámetros y 44 MB de pesos), el modelo puede ejecutarse en CPU sin problemas, así como en cualquier GPU con al menos 1 GB de VRAM, aunque no se han publicado mediciones oficiales de consumo.
- Se puede desplegar con librerías estándar de PyTorch; el propio repositorio incluye un script de carga y generación.
- No se dispone de datos de latencia o throughput, pero para un modelo de este tamaño la inferencia es prácticamente instantánea en hardware moderno.
- No hay soporte oficial para vLLM, llama.cpp u Ollama; el modelo se distribuye en formato PyTorch nativo.

## Comparativa con modelos similares

No disponible. No se han identificado modelos comparables en la misma categoría (prototipos experimentales con arquitectura SurahChain y dimensiones variables). El modelo no tiene competidores directos en el ecosistema de modelos árabes, y su carácter de juguete lo excluye de comparaciones con modelos de producción como AraBERT, CamelBERT o Jais.

## Limitaciones y advertencias

- El autor declara explícitamente que es un prototipo experimental y que no es apto para uso en producción ni genera respuestas útiles.
- La licencia no está especificada, por lo que no se puede garantizar la libertad de uso comercial o modificación.
- El entrenamiento se realizó con un conjunto de datos muy reducido (30 000 frases) y en una sola GPU, lo que limita la calidad y generalización del modelo.
- La longitud de contexto es de solo 256 tokens, insuficiente para tareas que requieran contexto largo.
- El modelo solo soporta árabe; no hay capacidades multilingües.
- No se han evaluado sesgos ni riesgos de alucinación; al ser un modelo de juguete, estos aspectos no han sido considerados.
- La arquitectura SurahChain es experimental y no ha sido validada en tareas de referencia, por lo que su eficacia real es desconocida.
- El repositorio no incluye documentación sobre el preprocesado del texto ni sobre el tokenizador más allá del archivo de vocabulario.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AliAhmedMo/surah-chain-d128-pretrain
- Repositorio GitHub del proyecto Neural Service Mesh: https://github.com/aliahmed369000000-ai/Neural-Service-Mesh
- Aplicación demo en Streamlit: https://neural-service-mesh-b9qfegnlay3iktazbaaaqc.streamlit.app
- Cuaderno de entrenamiento en Kaggle: https://www.kaggle.com/code/aliahmedmo/notebookc3a17dd093
