# jankowal2323/cieslar-qwen

## Resumen

CIESLAR-QWEN es un ajuste fino (fine-tune) del modelo Qwen3.5-4B de Alibaba Cloud, publicado por el usuario jankowal2323 en Hugging Face bajo licencia Apache 2.0. Se trata de una edición personalizada entrenada con LoRA mediante la pila Unsloth, orientada a dotar al modelo de una identidad y un estilo de respuesta propios, además de una firma promocional al final de cada respuesta. El modelo está pensado para generación de texto conversacional en polaco e inglés.

El modelo hereda la arquitectura y el tamaño del Qwen3.5-4B base: 4.326.350.848 parámetros (aproximadamente 4,3 mil millones) y un repositorio de 8,1 GB, lo que sugiere pesos en formato GGUF además de los safetensors originales. La model card no documenta la longitud de contexto, la composición del dataset de entrenamiento ni resultados de benchmarks, por lo que buena parte de las especificaciones técnicas no está disponible.

Su relevancia es limitada en el ecosistema open source: se trata de un experimento de personalización de un modelo base conocido, con una peculiaridad destacable (la inserción automática de publicidad de un memecoin en cada respuesta) que lo hace inadecuado para la mayoría de usos en producción. Resulta útil como ejemplo de fine-tuning con LoRA y Unsloth, pero no como modelo de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen3.5-4B; detalles no disponibles) |
| Parametros totales | 4.326.350.848 |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF; la model card recomienda Q4_K_M para movil y Q8_0 para PC |
| Idiomas soportados | polaco (pl), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors y GGUF (repositorio de 8,1 GB) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-4B, un transformer decoder-only de aproximadamente 4,3 mil millones de parámetros desarrollado por Alibaba Cloud. Sobre esa base se aplicó un ajuste fino con LoRA (Low-Rank Adaptation) utilizando la pila de entrenamiento Unsloth, según declara el autor en la model card. No se especifican el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF o DPO posteriores al ajuste supervisado.

La innovación técnica declarada no es arquitectónica, sino de comportamiento: el modelo incorpora una identidad propia ("CIESLAR EDITION") y añade al final de cada respuesta una pieza promocional del memecoin CieslarCoin ($CIESLAR) junto con una advertencia de riesgo. La model card recomienda desactivar el modo de razonamiento (thinking mode) y usar temperaturas de 0,6 a 0,7. No se documentan técnicas como decodificación especulativa ni atención lineal.

## Capacidades

- Generación de texto conversacional en polaco e inglés.
- Estilo de respuesta personalizado con identidad propia ("CIESLAR-QWEN").
- Inserción automática de una firma publicitaria de CieslarCoin ($CIESLAR) al final de cada respuesta, con aviso de riesgo.
- Compatibilidad con endpoints (etiqueta `endpoints_compatible` en Hugging Face).
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta capacidad de visión, audio ni otras modalidades.
- El modo de razonamiento (thinking) está desaconsejado por el autor; se recomienda desactivarlo.

## Casos de uso

- Experimentación con fine-tuning LoRA: sirve como ejemplo práctico de cómo adaptar un modelo Qwen3.5-4B con Unsloth para dotarlo de una identidad concreta, útil para quienes aprenden el flujo completo de entrenamiento y publicación.
- Pruebas de despliegue GGUF en local: al ofrecer cuantizaciones Q4_K_M y Q8_0, permite validar pipelines de inferencia con llama.cpp u Ollama en equipos de gama media.
- Demostraciones de personalidad de marca: puede emplearse en entornos controlados para mostrar cómo un fine-tune modifica el tono y el estilo de las respuestas de un modelo base.
- Investigación sobre publicidad generada por el modelo: el caso de la firma promocional automática es un ejemplo concreto para estudiar la inserción de contenido comercial en salidas de LLM y sus implicaciones éticas.
- Evaluación comparativa de fine-tunes: útil como punto de comparación frente al Qwen3.5-4B original para medir el impacto del ajuste en la calidad y coherencia de las respuestas.
- Docencia y talleres sobre licencias y riesgos: ilustra las implicaciones de publicar derivados de modelos Apache 2.0 con contenido promocional de criptoactivos y las advertencias que deben acompañarlos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; para un modelo de 4,3 mil millones de parámetros, las cuantizaciones GGUF indicadas (Q4_K_M y Q8_0) implican requisitos del orden de pocos gigabytes, aunque el autor no publica cifras.
- GPU recomendadas: no especificadas por el autor.
- Compatibilidad con GPU de consumo: no confirmada oficialmente; el tamaño del modelo y las cuantizaciones sugeridas apuntan a que podría ejecutarse en GPU de consumo, pero no hay datos publicados.
- Opciones de despliegue: llama.cpp u Ollama para los pesos GGUF; vLLM o TGI para los pesos safetensors, aunque no se documenta compatibilidad explícita.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| CIESLAR-QWEN | 4,33 B | no disponible | Apache 2.0 | Fine-tune LoRA de Qwen3.5-4B con identidad propia y publicidad insertada |
| Qwen3.5-4B (base) | ~4 B | no disponible en la informacion proporcionada | Apache 2.0 | Modelo original de Alibaba Cloud, sin personalización ni firma promocional |
| Qwen3 (serie general) | variable | variable | Apache 2.0 (segun version) | Familia de modelos de Alibaba con enfoque en razonamiento y capacidades agénticas |

La comparación cuantitativa con alternativas no está disponible: no se han publicado benchmarks del fine-tune ni datos de contexto que permitan una comparación rigurosa.

## Limitaciones y advertencias

- Inserción de publicidad: el modelo añade al final de cada respuesta una promoción del memecoin CieslarCoin ($CIESLAR), lo que contamina las salidas y lo inutiliza para la mayoría de aplicaciones en producción.
- Riesgo financiero asociado: la propia model card advierte de que CieslarCoin es un memecoin de alto riesgo y que se pueden perder todos los fondos; no es asesoramiento financiero.
- Sesgos: no documentados por el autor; al derivar de Qwen3.5-4B, hereda los sesgos del modelo base, que tampoco se detallan.
- Alucinación: no se han publicado evaluaciones de fiabilidad ni de tasas de alucinación.
- Idiomas: solo se declaran polaco e inglés; el rendimiento en castellano no está evaluado.
- Contexto: la longitud de contexto no está documentada, lo que impide planificar usos con ventanas largas.
- Licencia: Apache 2.0 permite uso comercial, pero la firma publicitaria integrada en las respuestas puede generar obligaciones o problemas legales según la jurisdicción y el contexto de uso.
- Madurez: el repositorio tiene 0 descargas y 1 like en el momento de la consulta, sin validación externa de la comunidad.
- Reproducibilidad: no se documentan hiperparámetros, dataset ni proceso de evaluación del fine-tune.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jankowal2323/cieslar-qwen
- Modelo base Qwen3.5-4B: https://huggingface.co/Qwen/Qwen3.5-4B
- Guía de modelos Qwen (Data Science Dojo): https://datasciencedojo.com/blog/the-evolution-of-qwen-models/
- Cronología de modelos Qwen (ScriptByAI): https://www.scriptbyai.com/qwen-timeline/
