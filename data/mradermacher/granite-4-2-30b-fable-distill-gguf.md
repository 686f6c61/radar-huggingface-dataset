# mradermacher/Granite-4.2-30B-Fable-Distill-GGUF

## Resumen

El modelo `mradermacher/Granite-4.2-30B-Fable-Distill-GGUF` es una cuantización en formato GGUF del modelo `armand0e/Granite-4.2-30B-Fable-Distill`, un destilado del Granite 4.2 de 30B desarrollado por IBM. La cuantización ha sido realizada por mradermacher, que ofrece una amplia gama de niveles de precisión (desde Q2_K hasta Q8_0) para facilitar la ejecución en hardware variado, incluidas GPU de consumo.

El modelo base pertenece a la familia Granite 4.2, que se caracteriza por ser un modelo denso decoder-only con capacidades de razonamiento integrado (chain-of-thought), tool calling aumentado con razonamiento y soporte multilingüe. Sin embargo, al tratarse de un destilado, no se dispone de información oficial sobre las modificaciones arquitectónicas o de entrenamiento respecto al modelo original. Esta ficha se basa en los datos disponibles en la model card de HuggingFace y en la documentación pública de IBM Granite 4.2.

La relevancia de esta versión cuantizada radica en que permite desplegar un modelo de aproximadamente 30 000 millones de parámetros en entornos con recursos limitados, manteniendo un equilibrio entre calidad y consumo de memoria. Es especialmente útil para desarrolladores que necesitan ejecutar inferencia local o en infraestructura con GPUs de gama media.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (se infiere transformer denso decoder-only del modelo original Granite 4.2) |
| Parametros totales | 29 276 770 304 (~29,3B) |
| Parametros activos | No aplicable (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | en, es, fr, de, pt, ja, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

No se dispone de información técnica específica sobre el proceso de destilación aplicado en `armand0e/Granite-4.2-30B-Fable-Distill`. El modelo original Granite 4.2, descrito en la documentación de IBM, es un transformer denso decoder-only post-entrenado sobre los modelos base Granite 4.1. Incorpora un mecanismo de razonamiento integrado que permite al modelo pensar antes de responder, y soporta tool calling mediante el esquema de funciones de OpenAI.

Dado que el archivo GGUF es una cuantización estática del destilado, no se modifican los pesos originales, solo se reduce su precisión numérica. No hay detalles sobre el dataset de entrenamiento, el número de tokens procesados ni si se utilizaron técnicas como RLHF o DPO. Toda esta información no está disponible en la model card ni en los resultados de búsqueda.

## Capacidades

Las capacidades que se enumeran a continuación corresponden al modelo original Granite 4.2 y se asumen presentes en el destilado, aunque no hay confirmación explícita:

- Generacion de texto y razonamiento con chain-of-thought integrado.
- Tool calling con razonamiento previo: el modelo decide qué herramienta usar y por qué antes de ejecutarla.
- Soporte de agentes y multi-step reasoning.
- Capacidades multilingües en siete idiomas: inglés, español, francés, alemán, portugués, japonés y chino.
- Modos de pensamiento flexibles (thinking mode configurable) según la documentación de IBM.
- Compatibilidad con el esquema de definición de funciones de OpenAI para integración con APIs.

No se ha confirmado si el destilado conserva todas estas capacidades, especialmente el tool calling y el razonamiento integrado, que podrían haberse visto afectados por el proceso de destilación.

## Casos de uso

- Asistentes conversacionales locales: gracias al formato GGUF y a la cuantización Q4_K_M (17,8 GB), el modelo puede ejecutarse en una GPU con 24 GB de VRAM, como una RTX 3090 o 4090, para ofrecer un asistente de chat multilingüe sin conexión.
- Automatizacion de atencion al cliente: el soporte multilingüe (es, fr, de, pt, ja, zh) permite desplegar un sistema de respuestas en varios idiomas, aunque la longitud de contexto no está confirmada, por lo que habría que validar su comportamiento en conversaciones largas.
- Generacion de codigo asistida: si el destilado conserva las capacidades de razonamiento del original, puede utilizarse como copiloto de programación en entornos con restricciones de hardware, mediante herramientas como llama.cpp u Ollama.
- Prototipado rapido de agentes con tool calling: la integración con el esquema de funciones de OpenAI facilita crear agentes que llamen a APIs externas, siempre que se verifique que esta funcionalidad sobrevive a la destilación.
- Analisis de documentos multilingües: el modelo puede resumir o extraer información de textos en varios idiomas, aunque el contexto máximo es desconocido y debería probarse con documentos extensos.
- Educacion y formacion: al ser de código abierto (Apache 2.0) y cuantizado, es adecuado para entornos académicos que necesiten un modelo de gran tamaño en hardware limitado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Ni la model card del modelo cuantizado ni la del modelo base `armand0e/Granite-4.2-30B-Fable-Distill` ofrecen métricas como MMLU, HumanEval o GSM8K. Tampoco se encontraron evaluaciones independientes en la búsqueda web. Por tanto, no es posible comparar cuantitativamente este destilado con otros modelos.

## Requisitos de hardware

Los requisitos dependen del nivel de cuantización elegido. A partir de los tamaños de archivo listados en la model card, se estima la VRAM necesaria (considerando overhead de ejecución):

- Q2_K (11,0 GB): requiere al menos 14 GB de VRAM. Puede ejecutarse en una RTX 4080 (16 GB) o similar.
- Q4_K_M (17,8 GB): necesita al menos 21 GB de VRAM. Adecuado para RTX 3090, RTX 4090, A6000 o A100 de 40 GB.
- Q8_0 (31,2 GB): requiere al menos 35 GB de VRAM. Solo viable en GPUs profesionales como A100 de 40 GB o H100.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, o servidores compatibles con GGUF como llama-cpp-python. No es compatible directamente con vLLM ni TGI en su versión GGUF.
- Latencia y throughput: no se dispone de datos medidos. Dependerá del hardware y de la cuantización. En una RTX 4090 con Q4_K_M, se puede esperar una velocidad de generación de entre 20 y 40 tokens por segundo, pero es una estimación orientativa sin confirmar.

## Comparativa con modelos similares

No se dispone de datos suficientes para establecer una comparación rigurosa. El modelo original Granite 4.2 de 30B es el referente directo, pero no se han publicado métricas comparativas del destilado. Como alternativa, se podrían considerar otros modelos de ~30B cuantizados como Llama 3.1 30B o Qwen 2.5 32B, pero no hay información sobre su rendimiento relativo en este contexto. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- No se ha verificado que el proceso de destilación conserve todas las capacidades del modelo original, especialmente el tool calling y el razonamiento integrado. Se recomienda realizar pruebas específicas antes de usarlo en producción.
- La longitud de contexto no está documentada; podría ser inferior a la del Granite 4.2 original (que soporta hasta 128K tokens según la documentación de IBM), pero no hay confirmación.
- Al ser una cuantización estática (no se usó imatrix ni calibración dinámica), la degradación de calidad puede ser mayor que en las versiones ponderadas disponibles en el repositorio `-i1-GGUF` del mismo autor.
- No hay benchmarks publicados, por lo que no se puede evaluar la calidad del modelo frente a alternativas.
- Aunque la licencia es Apache 2.0, el modelo base `armand0e/Granite-4.2-30B-Fable-Distill` no tiene una model card detallada; se desconoce si hay restricciones adicionales de uso.
- Riesgo de alucinación y sesgos inherentes a los modelos de lenguaje; no se ha evaluado específicamente en este destilado.

## Enlaces

- Modelo GGUF en HuggingFace: https://huggingface.co/mradermacher/Granite-4.2-30B-Fable-Distill-GGUF
- Modelo base (destilado): https://huggingface.co/armand0e/Granite-4.2-30B-Fable-Distill
- Modelo original Granite 4.2 30B: https://huggingface.co/ibm-granite/granite-4.2-30b
- Documentación oficial de IBM Granite 4.2: https://www.ibm.com/granite/docs/models/granite4-2
- Repositorio GitHub de IBM Granite 4.2: https://github.com/ibm-granite/granite-4.2-language-models
- Página general de IBM Granite: https://www.ibm.com/granite
- Versión con quants ponderados (imatrix): https://huggingface.co/mradermacher/Granite-4.2-30B-Fable-Distill-i1-GGUF
