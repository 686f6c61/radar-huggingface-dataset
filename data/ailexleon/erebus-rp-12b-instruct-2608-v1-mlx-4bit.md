# ailexleon/Erebus-RP-12B-Instruct-2608-v1-mlx-4Bit

## Resumen

Erebus-RP-12B-Instruct-2608-v1-mlx-4Bit es una conversión al formato MLX (Apple Silicon) del modelo Erebus-RP-12B-Instruct-2608-v1, desarrollada por ailexleon. El modelo original está orientado a roleplay, escritura creativa y narrativa conversacional, como indican sus etiquetas (rp, creative, writer, storytelling, character-rp). Esta versión cuantizada a 4 bits permite ejecutar el modelo en hardware de Apple con un consumo de memoria reducido, manteniendo la funcionalidad de generación de texto del modelo base.

El repositorio no incluye información detallada sobre la arquitectura interna, el contexto máximo o los datos de entrenamiento. Por las etiquetas (gemma3_text, gemma3) se infiere que el modelo base pertenece a la familia Gemma 3, probablemente la variante de 12B instruct, aunque el número de parámetros reportado en los safetensors (1.839.088.896) no coincide con esa cifra, lo que sugiere un posible error en el registro o una conversión parcial. La licencia es gemma, la misma que usa Google para sus modelos Gemma.

Esta ficha se basa exclusivamente en la información pública del repositorio de Hugging Face. Los datos técnicos no especificados se marcan como «no disponible».

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gemma 3 (texto), según etiquetas; no confirmado por el autor |
| Parametros totales | 1.839.088.896 (según safetensors; el nombre indica 12B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4-bit |
| Idiomas soportados | en (inglés) |
| Licencia | gemma |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

No se dispone de información oficial sobre la arquitectura interna del modelo original. Las etiquetas del repositorio (gemma3_text, gemma3) sugieren que se basa en la familia Gemma 3 de Google, que utiliza una arquitectura transformer con atención local y global. Sin embargo, no se confirma si el modelo base es exactamente Gemma 3 12B Instruct o una variante modificada para roleplay.

Este repositorio es una conversión de formato realizada con mlx-lm versión 0.31.3, no un entrenamiento original. No se publican datos sobre el dataset de entrenamiento, el número de tokens procesados ni el uso de técnicas como RLHF o DPO. Tampoco se mencionan innovaciones técnicas adicionales más allá de la cuantización a 4 bits.

## Capacidades

- Generación de texto en inglés, con especialización en roleplay, narrativa interactiva y escritura creativa.
- Conversación multi-turno con personajes (character-RP), según las etiquetas del modelo.
- Soporte para storytelling y creación de guiones o historias.
- Capacidad de mantener un tono conversacional y descriptivo, adecuado para juegos de rol por texto.
- No se indica soporte para tool calling, agentes, razonamiento multi-paso, visión ni audio.
- Limitado al idioma inglés; no hay evidencia de capacidades multilingües.

## Casos de uso

- Creación de personajes y diálogos para juegos de rol por escrito: el modelo puede generar respuestas coherentes y con personalidad para NPCs, manteniendo el contexto de la conversación.
- Escritura de ficción interactiva: permite construir historias ramificadas donde el usuario decide las acciones y el modelo describe las consecuencias.
- Asistente de escritura creativa: ayuda a desarrollar tramas, diálogos y descripciones para novelas, relatos o guiones.
- Simulación de conversaciones con personajes históricos o ficticios: útil para entretenimiento o para practicar técnicas de entrevista.
- Generación de contenido para juegos de mesa o videojuegos narrativos: el modelo puede producir encuentros, diálogos y descripciones de escenarios.
- Chatbots con personalidad para aplicaciones de entretenimiento: gracias a su enfoque en roleplay, puede sostener conversaciones con un tono definido y consistente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Formato MLX, exclusivo para Apple Silicon (M1, M2, M3 o superiores). No es compatible directamente con GPUs NVIDIA o AMD.
- Tamaño del repositorio: 6.7 GB, correspondiente a los pesos en 4 bits. Se recomienda al menos 8 GB de memoria unificada para cargar el modelo, siendo preferible 16 GB para mayor margen.
- Inferencia mediante la librería mlx-lm, que aprovecha el Neural Engine y las GPU integradas de Apple.
- No se dispone de datos de latencia o throughput específicos para este modelo.
- Alternativas de despliegue: únicamente vía mlx-lm en Python; no se menciona compatibilidad con vLLM, llama.cpp, Ollama o TGI.

## Comparativa con modelos similares

No disponible. No se han identificado modelos comparables en la información proporcionada, ni se dispone de datos de rendimiento para establecer una comparación objetiva.

## Limitaciones y advertencias

- Idioma limitado al inglés; no se garantiza un buen rendimiento en otros idiomas.
- Licencia Gemma: incluye restricciones de uso, como la prohibición de ciertos fines (por ejemplo, generar contenido ilegal o dañino) y la obligación de mantener la atribución. Consultar los términos completos de la licencia antes de uso comercial.
- Posible discrepancia entre el nombre del modelo (12B) y el número de parámetros reportado (1.8B). Esto puede deberse a un error en la conversión o en el registro; se recomienda verificar el modelo base original.
- Al ser una cuantización a 4 bits, puede existir una degradación leve en la calidad de generación respecto al modelo en precisión completa.
- No hay información sobre sesgos, alucinaciones o comportamientos no deseados. Dado su enfoque en roleplay, puede generar contenido inapropiado si no se filtra adecuadamente.
- El modelo no incluye mecanismos de seguridad adicionales más allá de los que traiga el modelo base.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/ailexleon/Erebus-RP-12B-Instruct-2608-v1-mlx-4Bit
- Modelo base: https://huggingface.co/Indexnusrefather/Erebus-RP-12B-Instruct-2608-v1
- Documentación de mlx-lm: https://github.com/ml-explore/mlx-lm
