# nagarhimanshu37/dolphin-2.7-mixtral-8x7b-GGUF

## Resumen

Dolphin 2.7 Mixtral 8X7B es un modelo de lenguaje de tipo Mixture of Experts (MoE) desarrollado por Cognitive Computations como un fine-tuning del modelo base Mixtral-8x7B de Mistral AI. Este fine-tuning se ha entrenado con una combinación de datasets orientados a instrucciones, razonamiento y código, con el objetivo de mejorar la capacidad de seguir instrucciones y generar código de alta calidad. El modelo se distribuye en formato GGUF, cuantizado por TheBloke, lo que permite su ejecución en CPU y GPU con requisitos de memoria reducidos en comparación con el modelo original en fp16.

La versión GGUF aquí descrita es una re-subida del trabajo de TheBloke, con un total de 46.702.809.088 parámetros y una arquitectura MoE con 8 expertos. Está pensada para desarrolladores que necesitan desplegar un modelo de instrucciones potente en entornos locales o con recursos limitados, manteniendo un equilibrio entre calidad y consumo de memoria. Su licencia Apache 2.0 permite uso comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixtral (MoE con 8 expertos) |
| Parametros totales | 46.702.809.088 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K, Q4_K, Q5_K, Q6_K, Q8_0 |
| Idiomas soportados | ingles |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Mixtral-8x7B, un transformer con capas de atención y mezcla de expertos (MoE) que activa solo un subconjunto de los 8 expertos por token, lo que reduce el coste computacional en inferencia. El fine-tuning de Dolphin 2.7 se realizó sobre el modelo base de Mistral, utilizando un conjunto de datos diverso que incluye ehartford/dolphin, jondurbin/airoboros-2.2.1, ehartford/dolphin-coder, teknium/openhermes, ise-uiuc/Magicoder-OSS-Instruct-75K, ise-uiuc/Magicoder-Evol-Instruct-110K y LDJnr/Capybara. Estos datasets cubren instrucciones generales, razonamiento, código y conversación, lo que dota al modelo de una fuerte capacidad para tareas de programación y seguimiento de instrucciones.

El entrenamiento siguió el formato de chat ChatML, con tokens especiales `<|im_start|>` y `<|im_end|>`, y no se menciona el uso de RLHF o DPO en la información disponible. La cuantización a GGUF fue realizada por TheBloke, que generó múltiples niveles de precisión (de 2 a 8 bits) para adaptarse a diferentes capacidades de hardware.

## Capacidades

- Generacion de texto y conversacion multi-turno siguiendo el formato ChatML.
- Razonamiento y resolucion de problemas, gracias al entrenamiento con datasets como airoboros y openhermes.
- Generacion de codigo en multiples lenguajes, reforzada por los datasets dolphin-coder y Magicoder.
- Seguimiento de instrucciones complejas, con capacidad para manejar tareas estructuradas.
- Soporte para uso como asistente conversacional en aplicaciones de chat.
- No se documentan capacidades explicitas de tool calling, vision o audio en la informacion proporcionada.

## Casos de uso

- Asistente de programacion local: el modelo puede integrarse en entornos de desarrollo (IDEs, CLI) para autocompletar codigo, explicar fragmentos o generar funciones completas, gracias a su entrenamiento con datasets de codigo.
- Chatbot de soporte tecnico: al ser un modelo de instrucciones, puede gestionar conversaciones de ayuda al usuario en ingles, con respuestas detalladas y coherentes.
- Generacion de documentacion tecnica: puede redactar comentarios, docstrings o manuales a partir de especificaciones, aprovechando su capacidad de razonamiento.
- Prototipado rapido de aplicaciones de IA: al estar en formato GGUF, se puede desplegar con llama.cpp o servidores compatibles para pruebas locales sin necesidad de GPU de alta gama.
- Analisis de texto y resumen: puede procesar articulos o informes y generar resumenes estructurados, aunque su contexto no esta especificado en la informacion.
- Educacion y formacion: como modelo de conversacion, puede actuar como tutor en ingles para explicar conceptos de programacion o matematicas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Tamaño de archivo de las cuantizaciones: desde 15.64 GB (Q2_K) hasta 49.62 GB (Q8_0), segun datos de aimodels.fyi.
- Para la cuantizacion Q4_K (la mas comun), se estima un tamaño de archivo en torno a 26 GB, aunque este dato no esta confirmado en la informacion proporcionada.
- Se puede ejecutar en CPU con llama.cpp o en GPU con suficiente VRAM (por ejemplo, una RTX 3090/4090 con 24 GB para Q4_K).
- Para cuantizaciones mas bajas (Q2_K, Q3_K), es posible ejecutarlo en GPUs con 16 GB de VRAM o incluso en CPU con 16 GB de RAM.
- Opciones de despliegue: llama.cpp, Ollama, text-generation-webui, KoboldCpp, LM Studio, entre otros clientes compatibles con GGUF.
- No se dispone de datos de latencia o throughput en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la informacion proporcionada. Se puede señalar que el modelo es un fine-tuning de Mixtral-8x7B, por lo que comparte arquitectura y tamaño con el modelo base, pero no se pueden aportar cifras concretas de rendimiento relativo.

## Limitaciones y advertencias

- El modelo esta entrenado exclusivamente en ingles, por lo que su rendimiento en otros idiomas es limitado o nulo.
- Segun la descripcion del creador, el modelo es "intencionalmente no alineado" (uncensored), lo que implica que puede generar contenido inapropiado, ofensivo o peligroso si se le solicita. No es recomendable para aplicaciones de produccion sin filtros de seguridad adicionales.
- No se especifica la longitud de contexto soportada; aunque la arquitectura Mixtral suele manejar 32k tokens, este dato no esta confirmado en la informacion disponible.
- La cuantizacion puede degradar ligeramente la calidad de las respuestas en comparacion con el modelo en fp16, especialmente en cuantizaciones de 2 o 3 bits.
- No se documentan capacidades de tool calling, vision o audio, por lo que no es adecuado para tareas que requieran estas funcionalidades.

## Enlaces

- Repositorio HuggingFace de esta version: https://huggingface.co/nagarhimanshu37/dolphin-2.7-mixtral-8x7b-GGUF
- Repositorio original de TheBloke (cuantizacion GGUF): https://huggingface.co/TheBloke/dolphin-2.7-mixtral-8x7b-GGUF
- Modelo base de Cognitive Computations: https://huggingface.co/cognitivecomputations/dolphin-2.7-mixtral-8x7b
- Repositorio de la version fp16: https://huggingface.co/dphn/dolphin-2.7-mixtral-8x7b
- Pagina de descripcion en Open Laboratory: https://openlaboratory.com/models/dolphin-mixtral/
