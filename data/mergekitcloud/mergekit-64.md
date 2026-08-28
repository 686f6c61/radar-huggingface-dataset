# MergekitCloud/mergekit-64

## Resumen

Mergekit-64 es un modelo de lenguaje de 8.000 millones de parámetros creado mediante la fusión de cuatro modelos base Llama-3.1-8B utilizando el método Model Stock, implementado con la herramienta mergekit. El modelo resultante combina las capacidades de los modelos originales: ArliAI/Llama-3.1-8B-ArliAI-RPMax-v1.3, Orenguteng/Llama-3.1-8B-Lexi-Uncensored-V2 y Undi95/Llama3-Unholy-8B-OAS, tomando como base vicgalle/Humanish-Roleplay-Llama-3.1-8B. El objetivo principal es obtener un modelo conversacional y de roleplay con respuestas menos censuradas, sin necesidad de entrenamiento adicional.

La relevancia de este modelo radica en que demuestra cómo la fusión de pesos puede producir modelos especializados sin coste de entrenamiento, una técnica cada vez más utilizada en la comunidad open source. Al estar basado en Llama 3.1, hereda la arquitectura transformer estándar con 8B parámetros, aunque la longitud de contexto y la licencia no están especificadas en la información disponible. El repositorio contiene únicamente pesos en formato safetensors con precisión float16, lo que facilita su uso con las herramientas habituales del ecosistema Hugging Face.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Llama 3.1 (transformer decoder-only) |
| Parametros totales | 8.030.261.248 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo safetensors float16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es el resultado de un merge de pesos mediante el método Model Stock, descrito en el artículo "Model Stock: Merging Large Language Models" (arXiv:2403.19522). Este método combina los pesos de varios modelos base de forma ponderada, utilizando como referencia un modelo base adicional (vicgalle/Humanish-Roleplay-Llama-3.1-8B). La configuración YAML indica que se usó normalización desactivada, máscara int8 y dtype float16. No se realizó ningún entrenamiento adicional, fine-tuning ni ajuste con RLHF/DPO; el modelo es puramente una combinación algebraica de los pesos de los modelos preentrenados.

Los modelos fusionados son todos variantes de Llama-3.1-8B, por lo que la arquitectura subyacente es la de un transformer decoder-only con atención causal estándar, 32 capas, 8 cabezas de atención por capa y dimensiones ocultas de 4096. Al no haber entrenamiento propio, las capacidades del modelo dependen enteramente de las de sus componentes, que incluyen modelos especializados en roleplay, conversación sin censura y generación de texto general.

## Capacidades

- Generación de texto conversacional y de roleplay: al estar basado en modelos como Humanish-Roleplay y Lexi-Uncensored, el modelo está orientado a mantener diálogos largos con personajes y situaciones ficticias.
- Respuestas menos censuradas: los modelos base incluyen versiones "uncensored" que reducen los filtros de contenido, permitiendo generar texto sobre temas que otros modelos rechazarían.
- Continuación de historias y narrativa creativa: adecuado para escribir ficción, diálogos y guiones.
- Conversación multi-turno: la arquitectura Llama 3.1 soporta diálogos extensos, aunque la longitud de contexto exacta no está documentada.
- Capacidades multilingües: probablemente hereda el soporte multilingüe de Llama 3.1 (inglés, español, francés, alemán, etc.), pero no hay confirmación explícita.
- Sin soporte conocido de tool calling, agentes o razonamiento estructurado: no se mencionan estas capacidades en la documentación.

## Casos de uso

- Roleplay y juegos de texto: el modelo puede mantener personajes coherentes y diálogos inmersivos en sesiones de rol, gracias a la combinación de modelos especializados en roleplay y narrativa.
- Generación de ficción erótica o contenido adulto: al ser un merge de modelos "uncensored", es adecuado para escribir relatos con contenido explícito que otros modelos rechazan, siempre respetando las leyes locales.
- Asistente conversacional sin restricciones temáticas: útil para usuarios que necesitan un chatbot que no evite temas controvertidos, como debates sobre política, religión o sexualidad.
- Creación de personajes para juegos de rol de mesa: puede generar fichas de personaje, trasfondos y diálogos para juegos como D&D, con un tono más natural y menos formal.
- Prototipado rápido de chatbots personalizados: al ser un modelo de 8B, puede ejecutarse en GPUs de consumo, permitiendo a desarrolladores crear demos de asistentes conversacionales sin depender de APIs comerciales.
- Generación de subtítulos o descripciones creativas: puede producir textos descriptivos para imágenes, vídeos o entornos virtuales, aprovechando su estilo narrativo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Al ser un modelo de fusión sin entrenamiento propio, no existen métricas oficiales de MMLU, HumanEval, GSM8K u otros tests estandarizados. El rendimiento real dependerá de los modelos base y del método de fusión, pero no hay datos cuantitativos que respalden afirmaciones específicas.

## Requisitos de hardware

- VRAM estimada: al tener 8.030 millones de parámetros en float16, la inferencia requiere aproximadamente 16 GB de VRAM para cargar los pesos completos. Con cuantización a 8 bits se reduce a ~8 GB, y a 4 bits a ~4 GB, aunque no se proporcionan versiones cuantizadas en el repositorio.
- GPUs recomendadas: una NVIDIA RTX 4090 (24 GB) o A100 (40 GB) pueden ejecutar el modelo sin problemas en float16. GPUs con 16 GB (RTX 4080, A10G) también son suficientes. Para cuantización 4 bits, una RTX 3060 (12 GB) o incluso una RTX 4060 (8 GB) podrían funcionar.
- Despliegue: al ser un modelo estándar de transformers, es compatible con vLLM, llama.cpp (si se convierten los pesos a GGUF), Ollama, TGI y cualquier framework que soporte Llama 3.1.
- Latencia y throughput: no hay datos medidos. Como referencia, un modelo de 8B en float16 en una RTX 4090 suele generar entre 50 y 100 tokens por segundo con vLLM, pero esto es una estimación general, no un dato del modelo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| MergekitCloud/mergekit-64 | 8B | no disponible | no disponible | Merge de 4 modelos Llama-3.1-8B, orientado a roleplay y sin censura |
| Meta-Llama-3.1-8B-Instruct | 8B | 128K | Llama 3.1 Community License | Modelo base oficial, con instrucciones y moderación |
| Undi95/Llama3-Unholy-8B-OAS | 8B | 128K (heredado) | no disponible | Modelo base incluido en el merge, especializado en contenido sin censura |

La comparación directa no es posible por falta de benchmarks y de datos de contexto del modelo fusionado. Sin embargo, se espera que mergekit-64 tenga un comportamiento similar a sus componentes, con un sesgo hacia la conversación creativa y menos restricciones que el Llama-3.1-8B-Instruct oficial.

## Limitaciones y advertencias

- Licencia desconocida: al no especificarse la licencia, no es seguro utilizar el modelo en aplicaciones comerciales o redistribuirlo sin consultar a los autores de los modelos base.
- Sesgos y contenido dañino: al ser un merge de modelos "uncensored", el modelo puede generar contenido ofensivo, discriminatorio o ilegal. No se han realizado evaluaciones de seguridad ni alineación.
- Riesgo de alucinación: como cualquier modelo generativo, puede producir información falsa o inventada, especialmente en temas factuales.
- Falta de documentación: no hay información sobre el contexto máximo, idiomas exactos, ni detalles de entrenamiento de los modelos base más allá de su origen.
- Sin garantía de calidad: al ser un merge automático sin validación, la coherencia del modelo puede ser inferior a la de los modelos base individuales.
- Fecha de creación futura: el modelo fue subido en agosto de 2026, lo que sugiere que puede ser un experimento reciente sin pruebas exhaustivas.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/MergekitCloud/mergekit-64)
- [Model Stock (paper)](https://arxiv.org/abs/2403.19522)
- [Repositorio de mergekit](https://github.com/arcee-ai/mergekit)
- [Modelo base: ArliAI/Llama-3.1-8B-ArliAI-RPMax-v1.3](https://huggingface.co/ArliAI/Llama-3.1-8B-ArliAI-RPMax-v1.3)
- [Modelo base: Orenguteng/Llama-3.1-8B-Lexi-Uncensored-V2](https://huggingface.co/Orenguteng/Llama-3.1-8B-Lexi-Uncensored-V2)
- [Modelo base: Undi95/Llama3-Unholy-8B-OAS](https://huggingface.co/Undi95/Llama3-Unholy-8B-OAS)
- [Modelo base: vicgalle/Humanish-Roleplay-Llama-3.1-8B](https://huggingface.co/vicgalle/Humanish-Roleplay-Llama-3.1-8B)
