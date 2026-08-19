# missang/kanana-1.5-8b-instruct-2505-Safe-DPO

## Resumen

El modelo `missang/kanana-1.5-8b-instruct-2505-Safe-DPO` es una variante ajustada del modelo Kanana 1.5 de 8 mil millones de parámetros, desarrollado originalmente por Kakao como parte de su familia de modelos bilingües (coreano e inglés). Esta versión concreta, publicada por el usuario `missang` en Hugging Face, incorpora un ajuste adicional mediante *Direct Preference Optimization* (DPO) orientado a la seguridad, como indica el sufijo "Safe-DPO" en su nombre. El modelo está diseñado para generación de texto conversacional y es compatible con el ecosistema Transformers de Hugging Face.

La relevancia de este modelo radica en que pertenece a la familia Kanana, que se caracteriza por buscar un equilibrio entre rendimiento y eficiencia computacional durante el entrenamiento, estableciendo un nuevo frente de Pareto en coste de cómputo frente a calidad. Aunque la model card proporcionada es mínima y carece de detalles técnicos, la familia Kanana ha sido documentada en un artículo de arXiv y en el repositorio oficial de Kakao, lo que permite contextualizar su arquitectura y propósito. Este checkpoint específico, sin embargo, no incluye información sobre licencia, idiomas soportados ni detalles de entrenamiento en su ficha de Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (no confirmado en la model card; inferido de la familia Kanana) |
| Parametros totales | 8.030.285.824 (8,03 B) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repo contiene safetensors en precision completa) |
| Idiomas soportados | no disponible (la familia Kanana es bilingüe coreano-ingles, pero no se confirma para esta variante) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura exacta de este checkpoint no está documentada en la model card, pero por su pertenencia a la familia Kanana se puede inferir que se trata de un transformer decoder-only con mecanismo de atención estándar, similar a otros modelos de la misma escala como Llama o Qwen. La familia Kanana, descrita en el artículo de arXiv, emplea técnicas de entrenamiento eficiente en cómputo, optimizando el uso de datos y recursos durante el preentrenamiento. El modelo base de 8B fue posteriormente ajustado con instrucciones y, en esta variante, se ha aplicado DPO para reforzar comportamientos seguros y reducir respuestas dañinas. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni los hiperparámetros utilizados en el ajuste.

## Capacidades

- Generación de texto conversacional en formato *instruct*.
- Probable capacidad bilingüe coreano-ingles, heredada de la familia Kanana, aunque no confirmada para esta variante.
- Ajuste orientado a seguridad mediante DPO, lo que sugiere un comportamiento más alineado con directrices de contenido seguro.
- Compatible con la librería Transformers y con `text-generation-inference`.
- No se dispone de información sobre soporte de *tool calling*, razonamiento multi-paso, visión o audio.

## Casos de uso

- Chatbots de atención al cliente en coreano o inglés: el modelo puede gestionar conversaciones multi-turno en un entorno controlado, aprovechando su ajuste instruct y su énfasis en seguridad para reducir respuestas inapropiadas.
- Asistentes virtuales para entornos educativos: su capacidad bilingüe (si se confirma) permitiría su uso en aplicaciones de aprendizaje de idiomas o tutoría en coreano e inglés.
- Generación de contenido moderado en foros o redes sociales: el DPO de seguridad lo hace adecuado para filtrar o generar contenido que cumpla políticas de uso.
- Prototipado rápido de aplicaciones de lenguaje: al ser un modelo de 8B, puede desplegarse en GPUs de consumo para pruebas de concepto.
- Investigación en alineación de modelos: el uso de DPO para seguridad puede servir como caso de estudio en comparación con otros métodos de alineación.
- Traducción automática informal: aunque no está optimizado específicamente para traducción, su naturaleza bilingüe podría utilizarse en tareas de traducción de nivel básico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de evaluación y no se encontraron datos de rendimiento para esta variante específica en la búsqueda web.

## Requisitos de hardware

- VRAM estimada para inferencia: al ser un modelo de 8B parámetros en precisión fp16, se necesitan aproximadamente 16 GB de VRAM para cargar los pesos completos. Con cuantización a 8 bits o 4 bits, la demanda puede reducirse a unos 8-10 GB o 4-6 GB respectivamente, aunque no se han publicado cuantizaciones oficiales para este checkpoint.
- GPUs recomendadas: una GPU con al menos 24 GB de VRAM (por ejemplo, RTX 3090, RTX 4090, A10G) para inferencia cómoda sin cuantizar. Con cuantización 4 bits, podría ejecutarse en GPUs de 8-12 GB como RTX 3060 o RTX 4070.
- Despliegue: al ser un modelo Transformers estándar, puede servirse con vLLM, TGI, llama.cpp (si se convierten los pesos a GGUF) o mediante la API de Hugging Face Inference Endpoints.
- Latencia y throughput: no disponibles. Para un modelo de 8B, se espera una generación de aproximadamente 20-40 tokens por segundo en una GPU moderna como la RTX 4090 con cuantización 4 bits, pero no hay datos verificados.

## Comparativa con modelos similares

No se dispone de datos de rendimiento comparativos para este modelo. Sin embargo, por su tamaño (8B) y naturaleza instruct, se puede situar en la misma categoría que otros modelos de 8B como Llama 3.1 8B Instruct, Qwen 2.5 7B Instruct o Mistral 7B Instruct. La principal diferencia es su enfoque bilingüe coreano-ingles y el ajuste DPO de seguridad, que no está presente en la mayoría de los modelos generalistas. La licencia y disponibilidad no son comparables al no conocerse la licencia de este checkpoint. Se recomienda consultar el repositorio de Kakao para obtener información sobre la familia Kanana en su conjunto.

## Limitaciones y advertencias

- La model card es prácticamente vacía: no se especifican licencia, idiomas, datos de entrenamiento ni métricas de evaluación, lo que dificulta evaluar su idoneidad para uso en producción.
- No se han publicado resultados de benchmarks, por lo que su rendimiento real en tareas estándar es desconocido.
- Al ser una variante de un usuario no oficial, no hay garantía de que los pesos sean exactamente los descritos en el nombre ni de que el proceso de DPO se haya realizado correctamente.
- El modelo puede heredar sesgos de los datos de entrenamiento de la familia Kanana, aunque no se han documentado.
- Riesgo de alucinación inherente a todos los modelos de lenguaje, no mitigado por el DPO de seguridad.
- La licencia desconocida impide su uso comercial sin riesgo legal.
- No hay información sobre la longitud de contexto soportada, lo que puede provocar fallos en tareas que requieran ventanas largas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/missang/kanana-1.5-8b-instruct-2505-Safe-DPO
- Repositorio de Kakao en GitHub: https://github.com/kakao/kanana
- Artículo de arXiv (Kanana: Compute-efficient Bilingual Language Models): https://arxiv.org/abs/2502.18934
- Variante similar de otro usuario: https://huggingface.co/ansoog/kanana-1.5-8b-instruct-2505-Safe-DPO
- Variante con Persona-LORA: https://huggingface.co/missang/kanana-1.5-8b-instruct-2505-Persona-LORA
