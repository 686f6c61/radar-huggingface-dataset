# 26B-Suite/OrionOmegaFiction-26B-A4B

## Resumen

OrionOmegaFiction-26B-A4B es un modelo de lenguaje de 26 000 millones de parámetros con 4 000 millones activos (arquitectura MoE), desarrollado por la organización 26B-Suite. Se trata de un *merge* de tres modelos base de la familia Gemma 4: `electroglyph/gemma4-26b-fiction-bf16`, `ReadyArt/Omega-Evolution-26B-A4B-v3.0-HB16-Q8_0` y `TheDrummer/Orion-26B-A4B-v1`, combinados mediante el método `moe_della` para fusionar los expertos de cada modelo. El nombre sugiere un enfoque orientado a la generación de ficción, aunque no se han publicado detalles sobre el propósito exacto ni sobre el proceso de entrenamiento.

El modelo se publica en formato `safetensors` y su repositorio en Hugging Face está vacío (0.0 GB), lo que indica que probablemente se trata de una prueba o un *placeholder* del autor. No se dispone de información sobre licencia, idiomas, contexto ni benchmarks. A pesar de ello, la arquitectura base (Gemma 4) es conocida por su buen rendimiento en razonamiento, codificación y tareas multimodales, por lo que este *merge* podría heredar esas capacidades, aunque no hay evidencia publicada al respecto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gemma4ForConditionalGeneration (MoE) |
| Parametros totales | 26 000 millones (26B) |
| Parametros activos | 4 000 millones (A4B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repo no contiene pesos) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (según etiqueta del repo) |

## Arquitectura y entrenamiento

El modelo es un *merge* de tres modelos MoE de 26B-A4B, todos basados en la arquitectura Gemma 4. El método de fusión empleado es `moe_della`, que combina los expertos de los modelos fuente mediante una estrategia de *routing* basada en Della (una variante de fusión de MoE). Los parámetros del *merge* indican que se aplican pesos uniformes (1.0) a las capas de atención, *lm_head* y *embed_tokens*, con una densidad de 0.9 y un épsilon de 0.09. Se utiliza `normalize_weights`, `normalize_router` y `rescale` activados, y la fusión se realiza en `float32` con salida en `bfloat16`.

No se ha publicado información sobre el dataset de entrenamiento, el número de tokens procesados ni si se aplicaron técnicas como RLHF o DPO. Al ser un *merge*, no hay un entrenamiento desde cero; las capacidades del modelo dependen de los modelos base, que incluyen un modelo especializado en ficción (`gemma4-26b-fiction-bf16`) y dos modelos de la serie Omega y Orion, probablemente orientados a razonamiento y generación creativa.

## Capacidades

No se han publicado descripciones oficiales de las capacidades del modelo. A partir de la arquitectura base (Gemma 4) y de los modelos fusionados, se pueden inferir las siguientes capacidades, aunque sin confirmación:

- Generación de texto creativo y narrativo, dado el componente de ficción en el *merge*.
- Razonamiento y resolución de problemas, heredados de los modelos Omega y Orion.
- Posible soporte de *tool calling* y *function calling*, característico de Gemma 4.
- Capacidades multilingües, aunque no se especifican idiomas concretos.
- No se confirma soporte multimodal, aunque Gemma 4 lo incluye en su versión original.

## Casos de uso

Dado que no hay documentación oficial, los siguientes casos son hipotéticos y deben validarse con pruebas reales:

- Generación de narrativa y ficción: el modelo podría utilizarse para redactar cuentos, novelas o guiones, aprovechando el modelo base de ficción incluido en el *merge*.
- Asistente de escritura creativa: podría ayudar a autores a generar ideas, diálogos o descripciones, aunque se requiere verificar la calidad del texto.
- Chat conversacional: con la arquitectura Gemma 4, podría servir como base para un chatbot de propósito general, siempre que se ajuste con un *fine-tuning* adicional.
- Razonamiento y análisis: los modelos Omega y Orion suelen estar optimizados para tareas de lógica y matemáticas, por lo que podría emplearse en entornos educativos o de investigación.
- Prototipado rápido: al ser un *merge* de 26B con 4B activos, es viable para experimentar con técnicas de fusión de MoE y evaluar su impacto en tareas específicas.
- Investigación académica: el modelo puede servir como caso de estudio para comparar métodos de *merge* como `moe_della` frente a otros enfoques.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de datos de MMLU, HumanEval, GSM8K ni otras métricas estándar. Tampoco hay comparaciones con modelos similares.

## Requisitos de hardware

No se han publicado requisitos específicos. A partir del tamaño (26B totales, 4B activos) y de la arquitectura MoE, se pueden estimar los siguientes requisitos orientativos:

- VRAM estimada para inferencia: con cuantización de 4 bits, aproximadamente 14-16 GB; con 8 bits, alrededor de 26-30 GB. Sin cuantizar (bfloat16), se necesitarían unos 52 GB.
- GPU recomendadas: para cuantización 4 bits, una RTX 3090/4090 o A10G; para 8 bits, una A100 de 40 GB o H100. En *consumer* GPU, solo las de gama alta con 24 GB o más podrían ejecutarlo con cuantización agresiva.
- Opciones de despliegue: vLLM, llama.cpp, Ollama o TGI, siempre que se generen los pesos en formato GGUF o AWQ. El repositorio actual no contiene pesos, por lo que habría que reconstruirlos a partir de los modelos base.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa fiable. El modelo base Gemma 4 26B-A4B es el punto de referencia natural, pero no hay datos de rendimiento de este *merge* frente al original. Tampoco se conocen otros *merges* de la misma familia con los que comparar. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- No hay información sobre sesgos, alucinaciones o limitaciones de contexto. Al ser un *merge* no validado, es probable que presente inconsistencias en la generación.
- El repositorio está vacío (0.0 GB), lo que impide descargar y probar el modelo directamente. Es necesario reconstruirlo a partir de los modelos base y el *script* de fusión.
- La licencia no está especificada, por lo que no se puede garantizar su uso comercial o en proyectos propietarios.
- Al ser un *merge* de tres modelos, la calidad puede variar según la tarea; no hay garantía de que supere a los modelos individuales.
- No se ha verificado la compatibilidad con *tool calling* o *function calling*; estas capacidades son inferencias basadas en Gemma 4, no confirmadas.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/26B-Suite/OrionOmegaFiction-26B-A4B
- Perfil de la organización 26B-Suite: https://huggingface.co/26B-Suite
- Página de Gemma 4 en Ollama: https://ollama.com/library/gemma4:26b
- Página oficial de Gemma 4 (Google DeepMind): https://deepmind.google/models/gemma/gemma-4/
- Repositorio GitHub de TurboFieldfare (inferencia de Gemma 4 26B-A4B en ~2 GB): https://github.com/drumih/turbo-fieldfare
