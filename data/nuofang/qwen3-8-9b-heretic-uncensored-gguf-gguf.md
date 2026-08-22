# nuofang/Qwen3.8-9B-heretic-uncensored-GGUF-GGUF

## Resumen

Este repositorio contiene una cuantización GGUF automática del modelo `mradermacher/Qwen3.8-9B-heretic-uncensored-GGUF`, realizada por el usuario nuofang. Se trata de una versión "heretic" (sin censura) del modelo Qwen3.8 de 9B parámetros, adaptada para su ejecución local con llama.cpp. La cuantización utiliza una matriz de importancia (imatrix) calibrada específicamente con datos de novelas chinas y role-playing, manteniendo a la vez capacidades de lógica y sentido común.

El interés de este modelo radica en su naturaleza "uncensored", orientada a usuarios que necesitan generación de texto sin restricciones temáticas, especialmente en contextos de narrativa y juegos de rol. Al estar en formato GGUF, puede ejecutarse en una amplia gama de hardware, desde CPU hasta GPU de consumo, mediante herramientas como llama.cpp u Ollama. La relevancia actual se debe a la demanda creciente de modelos locales sin censura para aplicaciones creativas y de entretenimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible (el nombre sugiere 9B, pero el dato del repositorio es inconsistente) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ4_XS (mencionado en la model card); pueden existir otros no listados |
| Idiomas soportados | no disponibles (la calibración sugiere chino e inglés, sin confirmar) |
| Licencia | no disponible |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura del modelo base. Por el nombre, se infiere que pertenece a la familia Qwen3.8, que en su versión oficial suele emplear arquitecturas transformer densas o MoE, pero no hay confirmación para esta variante concreta. El proceso de cuantización se realizó con llama.cpp, utilizando una imatrix calibrada con datos de novelas chinas y role-playing, con el objetivo de preservar la coherencia lógica y el sentido común. No se han publicado detalles sobre el entrenamiento del modelo original, como número de tokens, composición del dataset o técnicas de alineación (RLHF/DPO).

## Capacidades

- Generación de texto sin censura temática, orientada a narrativa y role-playing.
- Mantenimiento de capacidades de lógica y sentido común según la calibración de la imatrix.
- Ejecución local eficiente gracias al formato GGUF y a la cuantización.
- Compatibilidad con herramientas del ecosistema llama.cpp (llama.cpp, Ollama, etc.).
- No se han documentado capacidades adicionales como tool calling, agentes, visión o audio.

## Casos de uso

- Role-playing conversacional: el modelo puede mantener personajes y tramas complejas en juegos de rol textuales, gracias a su calibración específica para este tipo de contenido.
- Escritura creativa de novelas: adecuado para generar borradores de ficción, especialmente en chino, con menos restricciones temáticas que los modelos estándar.
- Generación de diálogos para videojuegos: puede producir interacciones de personajes sin filtros, útil para prototipos o mods.
- Asistente de escritura sin censura: para autores que necesitan explorar temas sensibles o controvertidos en sus obras.
- Experimentación con modelos "uncensored": útil para investigadores que estudian el impacto de la eliminación de guardarraíles en la generación de texto.
- Despliegue local en entornos sin conexión: al ser GGUF, puede ejecutarse en equipos sin acceso a la nube, garantizando privacidad.

## Benchmarks y rendimiento

La model card proporciona datos de perplexity (PPL) evaluados sobre el dataset de calibración:

| Metrica | Valor |
|---|---|
| PPL base (F16/BF16) | 13.3395 +/- 0.10479 |
| PPL IQ4_XS | 11.5024 +/- 0.08815 |

No se han publicado otros benchmarks (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- El tamaño del repositorio es de 5.2 GB, lo que sugiere que las cuantizaciones ocupan entre 4 y 6 GB en disco.
- Para la cuantización IQ4_XS, se estima una VRAM de aproximadamente 5-6 GB, lo que permite ejecución en GPUs de consumo como RTX 3060, RTX 4060 o superiores.
- También puede ejecutarse en CPU con suficiente RAM (8 GB o más), aunque con mayor latencia.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, o cualquier frontend compatible con GGUF.
- No se dispone de datos de latencia o throughput específicos.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa fiable con otros modelos de la misma categoría. El modelo base "Qwen3.8-9B-heretic-uncensored" pertenece a una serie de variantes sin censura, pero no hay datos públicos de rendimiento frente a alternativas como Dolphin o Gemma 4 Heretic.

## Limitaciones y advertencias

- Al ser un modelo "uncensored", puede generar contenido ofensivo, ilegal o inapropiado. El usuario asume la responsabilidad de su uso.
- La licencia no está especificada, lo que impide conocer las restricciones de uso comercial o redistribución.
- No se han documentado sesgos específicos, pero al estar calibrado con datos en chino, puede tener un sesgo cultural y lingüístico hacia ese idioma.
- La cuantización puede degradar ligeramente la calidad de generación en comparación con el modelo en precisión completa, aunque los datos de PPL sugieren una mejora aparente (posiblemente debida a diferencias en el manejo de tokens especiales, como advierte el autor).
- No hay garantías de soporte o mantenimiento del repositorio, dado que tiene cero descargas y cero likes.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/nuofang/Qwen3.8-9B-heretic-uncensored-GGUF-GGUF
- Modelo base: https://huggingface.co/mradermacher/Qwen3.8-9B-heretic-uncensored-GGUF
- Repositorio oficial de Qwen3.8: https://github.com/QwenLM/Qwen3.8
- Guía de modelos sin censura por VRAM: https://insiderllm.com/guides/best-uncensored-local-llms/
