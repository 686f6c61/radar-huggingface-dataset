# aimeri/spoomplesmaxx-cardmaker-v2-mlx-8Bit

## Resumen

El modelo aimeri/spoomplesmaxx-cardmaker-v2-mlx-8Bit es una conversión en formato MLX con cuantización de 8 bits del modelo de texto aimeri/spoomplesmaxx-cardmaker-v2, desarrollado por el usuario aimeri. Se trata de un modelo de 13.506 millones de parámetros (13,5B) con licencia Apache 2.0, orientado a la generación de tarjetas de personaje (character cards) y al roleplay conversacional, especialmente en entornos como SillyTavern. Su propósito es combinar creatividad narrativa para encarnar personajes con la capacidad de seguir instrucciones complejas, utilizando datasets de roleplay y escritura creativa con un formato de chat ChatML.

Esta variante MLX 8-bit se generó con mlx-lm 0.31.2 a partir del modelo base y está pensada para ejecutarse en el ecosistema de Apple Silicon. La información disponible no incluye datos sobre la arquitectura interna, la longitud de contexto ni benchmarks, por lo que la evaluación de su rendimiento requiere pruebas adicionales en el caso de uso previsto.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (los metadatos apuntan a la familia Ministral/Mistral) |
| Parametros totales | 13.506.073.600 (13,5B) |
| Parametros activos | no disponible (no se ha indicado que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8-bit MLX (una única variante publicada) |
| Idiomas soportados | Inglés (según la etiqueta 'en') |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (pesos convertidos a formato MLX, tamaño del repo 14,4 GB) |

## Arquitectura y entrenamiento

El modelo se presenta como un full-finetune (SFT) sobre el modelo base aimeri/spoomplesmaxx-cardmaker-v2, entrenado con el dataset aimeri/st-characters-alpaca-v2. Los metadatos asocian el modelo con la familia Ministral/Mistral (tags ministral3, mistral, ministral-3), pero no se detalla la arquitectura exacta: número de capas, dimensión del modelo, tipo de atención ni si se trata de una arquitectura MoE. Tampoco se especifican los tokens de entrenamiento ni las técnicas de alineación aplicadas, como RLHF o DPO.

La versión MLX 8-bit conserva los pesos del modelo base y los representa en 8 bits, lo que reduce el espacio en disco a 14,4 GB. La conversión se realizó con mlx-lm 0.31.2 y el template de conversación es ChatML.

## Capacidades

- Generación de texto y conversación mediante pipeline text-generation con formato ChatML.
- Creación de character cards: el modelo está afinado para producir definiciones de personaje coherentes (nombre, descripción, personalidad, diálogos) aptas para SillyTavern.
- Roleplay conversacional: capaz de adoptar una personalidad y mantener conversaciones multi-turno, según el propósito declarado del proyecto.
- Escritura creativa: generación de narrativa, diálogos y escenas para juegos de rol y ficción interactiva.
- Soporte de tool calling: no disponible, no se menciona en la documentación.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: solo inglés.
- Capacidades multimodales: no disponible; el modelo procesa únicamente texto.

## Casos de uso

- Generación de tarjetas de personaje para SillyTavern: el usuario introduce una idea o resumen de personaje y el modelo devuelve una definición detallada en formato de tarjeta, lista para pegar en la interfaz.
- Roleplay en comunidades de juegos por texto: puede emplearse como un NPC que mantiene conversaciones largas y coherentes con varios participantes, aprovechando el finetune en el dataset st-characters-alpaca-v2.
- Escritura creativa asistida para novelas interactivas: se usa como asistente para generar diálogos, descripciones de escenarios y líneas de personajes secundarios.
- Generación rápida de NPCs para videojuegos: en proyectos de desarrollo, el modelo crea perfiles de personajes con trasfondo y motivaciones para incorporar a la narrativa del juego.
- Prototipado de bots de chat con personalidad: permite producir un bot de chat con una personalidad definida a partir de un breve briefing, útil para demos y pruebas de concepto.
- Investigación en roleplay y alineación instruccional: al tratarse de un finetune SFT con un dataset específico, puede servir como caso de estudio del efecto del dataset en la capacidad de seguir instrucciones frente a la creatividad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El formato MLX está optimizado para Apple Silicon; se requiere un Mac con chip M1 o superior para ejecutar el modelo.
- Los pesos en 8-bit ocupan aproximadamente 13,5 GB, más el overhead de inferencia. Se estima que una máquina con 16 GB de memoria unificada puede ejecutar el modelo con lotes pequeños y contextos cortos, pero 24-32 GB es más recomendable para contextos mayores y uso continuado.
- No se ha documentado soporte para GPU NVIDIA ni para despliegue con vLLM, llama.cpp, Ollama o TGI en esta variante concreta. El uso previsto es mediante mlx-lm.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de información sobre modelos alternativos de la misma categoría (generación de character cards para roleplay) con datos públicos suficientes para establecer una comparación fiable. La versión v1 del mismo proyecto no incluye especificaciones técnicas publicadas.

## Limitaciones y advertencias

- No se han publicado evaluaciones de seguridad ni benchmarks; el riesgo de alucinación es inherente a un modelo de generación de texto de 13,5B entrenado con un dataset restringido.
- Solo soporta inglés, según los metadatos, por lo que no es apto para aplicaciones multilingües.
- No se documenta soporte de tool calling, agentes ni multimodalidad.
- Al ser un modelo afinado para roleplay y ficción, puede generar contenido no veraz, sesgado o inapropiado para entornos profesionales sin supervisión humana.
- La cuantización a 8 bits puede introducir una ligera pérdida de calidad frente a los pesos originales, aunque la degradación no está cuantificada.
- La licencia Apache 2.0 permite el uso comercial, pero el autor no ofrece garantías ni soporte técnico.

## Enlaces

- Repositorio del modelo: https://huggingface.co/aimeri/spoomplesmaxx-cardmaker-v2-mlx-8Bit
- Modelo base: https://huggingface.co/aimeri/spoomplesmaxx-cardmaker-v2
- Versión anterior v1: https://huggingface.co/aimeri/spoomplesmaxx-cardmaker-v1
- Repositorio del proyecto Spoomplesmaxx: https://github.com/aimerib/spoomplesmaxx
