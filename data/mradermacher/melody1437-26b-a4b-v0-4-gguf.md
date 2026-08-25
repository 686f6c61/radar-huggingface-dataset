# mradermacher/Melody1437-26B-A4B-v0.4-GGUF

## Resumen

Melody1437-26B-A4B-v0.4 es un modelo de lenguaje especializado en roleplay y conversación, desarrollado por ReadyArt a partir de la arquitectura MoE Gemma 4 26B A4B de Google. La versión que aquí se analiza es una cuantización GGUF realizada por mradermacher, diseñada para facilitar la ejecución local del modelo en herramientas como llama.cpp, Ollama o LM Studio. El modelo está explícitamente etiquetado como "unaligned" y "dangerous", orientado a contenido NSFW, roleplay y generación de diálogos sin restricciones.

La arquitectura MoE combina 26 mil millones de parámetros totales con solo 4 mil millones activos por token, lo que permite un coste de memoria similar a un modelo de 4B durante la generación. La familia Gemma 4 soporta un contexto de hasta 256K tokens y capacidades multimodales, aunque el fine-tune puede haber modificado estas características. El modelo está etiquetado únicamente en inglés, a pesar de que la base original soporta más de 140 idiomas.

Este modelo resulta relevante para desarrolladores que buscan un modelo de roleplay de alta calidad ejecutable en hardware de consumo, aprovechando la eficiencia de la arquitectura MoE. Sin embargo, su naturaleza no alineada y su orientación a contenido explícito requieren precaución y un uso responsable en entornos de producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts) basada en Gemma 4 26B A4B |
| Parámetros totales | 25.233.142.046 (~25,2 mil millones) |
| Parámetros activos | 4 mil millones (por token) |
| Longitud de contexto | 256K tokens (según la familia Gemma 4; no se confirma el valor del fine-tune) |
| Tipos de cuantización | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, además de mmproj-Q8_0 y mmproj-f16 (visión) |
| Idiomas soportados | En inglés (etiqueta oficial; la base Gemma 4 soporta 140+ idiomas) |
| Licencia | Apache 2.0 (según la model card; los tags incluyen "Other License" adicional) |
| Formato de pesos | GGUF (cuantizado) y safetensors (modelo original) |

## Arquitectura y entrenamiento

El modelo base es un fine-tune de ReadyArt sobre la arquitectura Gemma 4 26B A4B de Google. Esta arquitectura utiliza un enfoque de mezcla de expertos (MoE) con 26 mil millones de parámetros totales, de los cuales solo 4 mil millones se activan por token, reduciendo drásticamente los requisitos de memoria y acelerando la inferencia en comparación con modelos densos de tamaño equivalente. La familia Gemma 4 incluye capacidades multimodales (visión) y un contexto de hasta 256K tokens, aunque no se especifica si el fine-tune conserva estas características.

No se dispone de información detallada sobre el entrenamiento del fine-tune: no se indican el número de tokens, la composición del dataset ni el método de alineación (RLHF, DPO, etc.). Dado que el modelo se presenta como "unaligned" y "dangerous", es probable que no haya recibido un entrenamiento de seguridad, priorizando la libertad de generación para roleplay y contenido explícito.

La innovación principal proviene de la arquitectura MoE base, que permite obtener las capacidades de un modelo de 26B con el coste de memoria de uno de 4B, lo que lo hace viable en GPU de consumo.

## Capacidades

- Generación de texto conversacional y roleplay multi-turno, con un estilo adaptable a diferentes personajes y escenarios.
- Soporte de contenido explícito y NSFW, sin filtros de moderación.
- Capacidades multimodales (visión) según la base Gemma 4, aunque no se confirma que el fine-tune las haya mantenido (se incluyen archivos mmproj en la cuantización).
- Multilingüismo parcial: la familia base soporta 140+ idiomas, pero el modelo está etiquetado solo en inglés.
- No se ha confirmado soporte de tool calling, function calling o uso como agente autónomo.

## Casos de uso

- Roleplay conversacional: el modelo puede mantener diálogos multi-turno con personajes complejos, aprovechando el contexto de hasta 256K tokens (si se mantiene) para tramas largas.
- Escritura creativa: generación de historias, descripciones y diálogos con un estilo inmersivo, útil para autores o juegos de rol escritos.
- Chat de personajes en plataformas locales: integración con herramientas como SillyTavern para crear experiencias de chat con personalidades definidas.
- Generación de contenido adulto (ERP): el modelo está explícitamente diseñado para roleplay erótico sin restricciones.
- Prototipado de aplicaciones de IA: su ligereza permite ejecutarlo en hardware modesto para pruebas y demos de sistemas de conversación.
- Asistencia en creación de narrativas: puede ayudar a escritores a desarrollar tramas, diálogos y personajes, aunque sin garantías de veracidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para este fine-tune en la información disponible. La búsqueda web menciona que el modelo base Gemma 4 26B A4B es competitivo con modelos densos de 30B+ en tareas de codificación y razonamiento, pero no se proporcionan cifras concretas ni comparaciones con alternativas.

## Requisitos de hardware

- Los archivos GGUF varían entre 10,7 GB (Q2_K) y 24 GB (Q8_0). La VRAM necesaria depende de la cuantización y el contexto utilizado.
- Para una cuantización Q4_K_M (16,9 GB) se recomienda una GPU con al menos 20 GB de VRAM, como una RTX 4090 (24 GB) o RTX 5090 (32 GB).
- Las cuantizaciones Q2_K y Q3_K pueden ejecutarse en GPUs de 12 GB (por ejemplo, RTX 3060) limitando el contexto.
- En CPU, llama.cpp puede funcionar con 32 GB de RAM, aunque la velocidad será significativamente menor.
- Herramientas de despliegue compatibles: llama.cpp, Ollama, LM Studio, LM-cpp-python, entre otras que soporten GGUF.
- No se han proporcionado valores de latencia o throughput específicos.

## Comparativa con modelos similares

No se dispone de datos de comparación directa con otros modelos de roleplay. Como referencia, el modelo base Gemma 4 26B A4B (sin fine-tune) ofrece las mismas capacidades arquitectónicas pero sin la especialización en roleplay. Otros modelos de roleplay como Mistral 7B o Llama 3 8B son más pequeños y menos capaces en contexto largo, pero no hay cifras objetivas para comparar. La principal ventaja de este modelo es la eficiencia MoE para su tamaño.

## Limitaciones y advertencias

- Contenido explícito y NSFW: el modelo no tiene filtros de seguridad y puede generar contenido sexual, violento o inapropiado.
- Riesgo de alucinaciones y sesgos: al ser un fine-tune no alineado, las respuestas pueden ser inexactas, prejuiciadas o dañinas.
- Solo inglés: el rendimiento en otros idiomas es probablemente bajo, a pesar de la base multilingüe.
- Licencia: aunque la cuantización tiene licencia Apache 2.0, el modelo original puede tener restricciones adicionales (los tags incluyen "Other License").
- El contexto de 256K tokens es el del modelo base; el fine-tune podría haberlo reducido, pero no se confirma.
- No apto para uso en producción sin supervisión humana y medidas de moderación externas.

## Enlaces

- [Hugging Face - mradermacher/Melody1437-26B-A4B-v0.4-GGUF](https://huggingface.co/mradermacher/Melody1437-26B-A4B-v0.4-GGUF)
- [Hugging Face - Modelo base ReadyArt/Melody1437-26B-A4B-v0.4](https://huggingface.co/ReadyArt/Melody1437-26B-A4B-v0.4)
- [Artículo - Despliegue de Gemma 4 26B A4B en RTX 5090](https://pub.towards.ai.net/deploying-gemma-4-26b-a4b-on-an-rtx-5090-69dacb0c116d)
- [Documentación de Unsloth para Gemma 4](https://unsloth.ai/docs/models/gemma-4)
