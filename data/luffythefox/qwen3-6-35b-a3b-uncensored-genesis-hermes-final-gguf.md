# LuffyTheFox/Qwen3.6-35B-A3B-Uncensored-Genesis-Hermes-Final-GGUF

## Resumen

Qwen3.6-35B-A3B-Uncensored-Genesis-Hermes-Final-GGUF es una versión cuantizada en formato GGUF del modelo Qwen3.6-35B-A3B, publicada por LuffyTheFox. Se trata de un modelo de lenguaje multimodal (image-text-to-text) con arquitectura Mixture of Experts (MoE) de aproximadamente 34.66 mil millones de parámetros totales y 3 mil millones activos, basado en el modelo uncensored de HauhauCS. El autor ha aplicado su técnica Genesis, un algoritmo de regeneración y calibración de datos post-entrenamiento que repara el ruido en los tensores del modelo sin necesidad de reentrenar, utilizando la distribución de Marchenko-Pastur y descomposición SVD. Además, incorpora datos del dataset Hermes de NousResearch para mejorar el agentic function calling. La relevancia de este modelo radica en su combinación de capacidades multimodales, soporte para agentes y un comportamiento sin censura, todo ello en un formato GGUF listo para ejecutarse en local con herramientas como llama.cpp u Ollama. La longitud de contexto no está especificada en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts) con soporte multimodal (vision); el autor menciona tensores ssm_conv1d, lo que sugiere un diseno hibrido con capas SSM (no confirmado oficialmente) |
| Parametros totales | 34.660.610.688 (≈34.66B) |
| Parametros activos | 3B (A3B, segun la nomenclatura del modelo) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio contiene archivos GGUF; tamano total 151.5 GB) |
| Idiomas soportados | ingles, chino y multilingue (en, zh, multilingual) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo se basa en Qwen3.6-35B-A3B, un modelo de Mixture of Experts con activacion parcial de expertos. La etiqueta image-text-to-text y la presencia de componentes de vision indican que es multimodal. El autor menciona tensores ssm_conv1d en el proceso de reparacion Genesis, lo que sugiere que la arquitectura incorpora capas de estado espacio (SSM), aunque no se dispone de una especificacion oficial detallada. El modelo parte de HauhauCS/Qwen3.6-35B-A3B-Uncensored-HauhauCS-Aggressive, una version sin censura con 0 rechazos en 465 pruebas, y se le han transferido datos del finetune de DJLougen/hermes-qwen3.5-35b-a3b-GGUF, que usa el dataset NousResearch/hermes-function-calling-v1. Esta transferencia se realizo sobre aproximadamente 2.000 bloques de dos tensores expertos FFN. La innovacion principal es el algoritmo Genesis, que no reentrena el modelo, sino que repara la senal en los tensores en tres etapas: balanceo de cabezas en ssm_conv1d, sustitucion de bloques cero por bloques que mejor se ajustan a la distribucion de pesos, y reduccion de ruido de entrenamiento mediante SVD basada en la distribucion de Marchenko-Pastur, preservando el 99% de la senal y el gradiente aprendido.

## Capacidades

- Generacion de texto y conversacion multimodal: el pipeline image-text-to-text indica que acepta imagenes como entrada, ademas de texto.
- Razonamiento y agentic: soporta function calling gracias al entrenamiento con el dataset Hermes de NousResearch.
- Capacidad multilingue: ingles, chino y otros idiomas (segun las etiquetas del repositorio).
- Sin censura: el modelo base tiene 0/465 rechazos, lo que implica que no filtra contenido.
- Soporte de herramientas y agentes: entrenado con NousResearch/hermes-function-calling-v1 para integrarse en flujos de agentes.
- Modo de pensamiento: la model card recomienda habilitar thinking para el system prompt, lo que sugiere soporte de razonamiento extendido.
- Compatibilidad con GGUF: se puede ejecutar en llama.cpp, Ollama y otros motores que soporten este formato.

## Casos de uso

- Asistentes conversacionales locales sin censura: gracias a su formato GGUF y su naturaleza uncensored, puede desplegarse en local para chatbots que no filtren contenido, usando Ollama o llama.cpp.
- Agentes autonomos con function calling: el entrenamiento con Hermes function calling permite integrarlo en flujos de agentes que llaman a APIs y herramientas externas.
- Analisis de imagenes en entornos privados: al ser multimodal, puede describir o analizar imagenes sin enviar datos a la nube, ejecutandose en local.
- Atencion al cliente multilingue: puede gestionar consultas en ingles y chino, y en otros idiomas, en un entorno local y sin dependencia de servicios externos.
- Investigacion en post-entrenamiento y reparacion de tensores: el algoritmo Genesis es un tema de estudio; el modelo sirve como ejemplo de reparacion de tensores sin reentrenamiento.
- Prototipado rapido de aplicaciones multimodales en entornos con restricciones de datos: al ser GGUF y con licencia Apache-2.0, permite procesar datos sensibles sin conexion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible en la informacion proporcionada; el modelo tiene 34.66B parametros totales y 3B activos, por lo que la VRAM variara segun la cuantizacion y la implementacion.
- GPU recomendadas: no disponible.
- Si cabe en consumer GPU: no disponible.
- Opciones de despliegue: formato GGUF compatible con llama.cpp, Ollama y otros motores de inferencia que soporten GGUF.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de datos suficientes para una comparativa cuantitativa. El modelo se puede comparar cualitativamente con su modelo base HauhauCS/Qwen3.6-35B-A3B-Uncensored-HauhauCS-Aggressive y con la version finetune de DJLougen/hermes-qwen3.5-35b-a3b-GGUF, pero no hay resultados publicados.

## Limitaciones y advertencias

- Sesgos conocidos: no disponible.
- Riesgo de alucinacion: el autor menciona que el ruido en tensores causa alucinaciones y que Genesis lo reduce, pero no hay evaluacion independiente.
- Limitaciones de contexto: no disponible.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero el modelo es uncensored, lo que puede implicar riesgos legales o eticos segun el uso.
- Caveat: el modelo no ha sido evaluado formalmente; el proceso Genesis es una tecnica no convencional sin validacion externa.
- Al ser uncensored, puede generar contenido inapropiado o danino; se recomienda usar con moderacion y en entornos controlados.
- La informacion sobre el contexto y las cuantizaciones no esta completa; se debe consultar el repositorio para detalles.

## Enlaces

- HuggingFace: https://huggingface.co/LuffyTheFox/Qwen3.6-35B-A3B-Uncensored-Genesis-Hermes-Final-GGUF
- Modelo base: https://huggingface.co/HauhauCS/Qwen3.6-35B-A3B-Uncensored-HauhauCS-Aggressive
- Finetune Hermes: https://huggingface.co/DJLougen/hermes-qwen3.5-35b-a3b-GGUF
- Version Genesis final: https://huggingface.co/LuffyTheFox/Qwen3.6-35B-A3B-Uncensored-Genesis-Final-GGUF
- Chat template: https://huggingface.co/LuffyTheFox/Qwen3.6-35B-A3B-Uncensored-Genesis-Hermes-V7-GGUF/raw/main/chat_template.jinja
- Script de cuantizacion: https://pastebin.com/hXhcMJn9
- Discord: https://discord.gg/SZ5vacTXYf
