# leeroy-jankins/nani

## Resumen

El modelo `nani` es una variante cuantizada en formato GGUF del modelo Granite-4.0-1B, desarrollado por IBM y publicado originalmente bajo licencia Apache 2.0. Este repositorio, creado por el usuario `leeroy-jankins`, ofrece una versión ligera y optimizada del modelo instructivo de IBM, orientada a despliegues en entornos con recursos limitados, como dispositivos de borde o aplicaciones on-premise.

El modelo base Granite-4.0-1B es un transformer decoder-only con 1.6 mil millones de parámetros, fine-tuneado a partir de Granite-4.0-1B-Base mediante una combinación de datasets de instrucción open source y datos sintéticos internos. Se emplearon técnicas de supervisión fina, aprendizaje por refuerzo y fusión de modelos. Su tamaño compacto lo hace adecuado para fine-tuning en dominios especializados sin requerir una infraestructura masiva de cómputo.

La relevancia de este lanzamiento radica en la combinación de capacidades avanzadas de instrucción (function calling, RAG, diálogo multilingüe) con un peso reducido, lo que permite ejecutarlo en GPUs consumer y en CPU. El formato GGUF facilita su uso con herramientas como llama.cpp, Ollama o LM Studio, ampliando su accesibilidad para desarrolladores e investigadores que necesitan un modelo ligero y eficiente.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Granite-4.0-1B) |
| Parametros totales | 1.631.750.144 |
| Parametros activos | no aplicable (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (no se especifican los niveles exactos; el repositorio incluye pesos cuantizados) |
| Idiomas soportados | Inglés, alemán, español, francés, japonés, portugués, árabe, checo, italiano, coreano, neerlandés y chino |
| Licencia | MIT (repositorio) / Apache 2.0 (modelo base Granite-4.0-1B) |
| Formato de pesos | GGUF (también se indica compatibilidad con transformers/safetensors) |

## Arquitectura y entrenamiento

El modelo `nani` es una adaptación cuantizada de Granite-4.0-1B, cuya arquitectura es un transformer decoder-only estándar, sin mezcla de expertos (MoE). El modelo base fue fine-tuneado a partir de Granite-4.0-1B-Base usando una combinación de datasets de instrucción con licencia permisiva y datasets sintéticos generados internamente. El proceso de entrenamiento incluyó supervisión fina (SFT), aprendizaje por refuerzo (RL) y técnicas de fusión de modelos.

No se han publicado detalles específicos sobre el volumen de tokens de entrenamiento, la composición exacta del dataset ni innovaciones técnicas particulares del modelo base. La cuantización a GGUF se realizó con el objetivo de reducir el tamaño y acelerar la inferencia en hardware limitado, aunque no se especifica el método de cuantización (p. ej., GPTQ, AWQ, imatrix) ni los niveles de precisión disponibles.

## Capacidades

- Generación de texto conversacional con seguimiento de instrucciones robusto.
- Resumen de documentos y textos largos.
- Clasificación de texto y análisis de sentimiento.
- Extracción de entidades y datos estructurados.
- Preguntas y respuestas (QA) sobre documentos.
- Recuperación aumentada por generación (RAG) para integrar conocimiento externo.
- Tareas de generación de código y completado Fill-In-the-Middle (FIM).
- Function calling (llamada a funciones) con soporte para esquemas OpenAI.
- Diálogo multilingüe en 12 idiomas, con posibilidad de fine-tuning para otros.

## Casos de uso

- **Atención al cliente automatizada**: el modelo puede gestionar conversaciones multilingües multi-turno, integrando llamadas a funciones para consultar bases de datos de pedidos o resolver incidencias básicas, gracias a su soporte de tool calling y su tamaño reducido para despliegue en servidores de bajo coste.
- **Generación de código en entornos de desarrollo**: su capacidad de completar código y soporte de FIM permite integrarlo en editores de código (VSCode, Jupyter) para autocompletado y asistencia a desarrolladores, con una latencia baja en hardware consumer.
- **Búsqueda semántica y RAG en intranets corporativas**: combinado con un vector store, el modelo puede responder preguntas sobre documentación interna en varios idiomas, aprovechando su contexto de ventana (no especificado) y su capacidad de extracción.
- **Análisis de sentimiento en redes sociales**: su tamaño compacto lo hace adecuado para procesar streams de datos en tiempo real, clasificando opiniones en español, inglés y otros idiomas soportados.
- **Asistentes de voz en dispositivos de borde**: la cuantización GGUF permite ejecutar el modelo en Raspberry Pi o smartphones para asistentes de voz offline, con respuestas de texto y función de llamada para controlar apps.
- **Fine-tuning en dominios especializados**: su tamaño de 1.6B parámetros permite fine-tuning con una sola GPU consumer (p. ej., RTX 3060 12GB) para tareas como análisis legal o médico, donde los datos son escasos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K u otros tests estandarizados para esta variante concreta. Los benchmarks del modelo base Granite-4.0-1B se pueden consultar en la documentación oficial de IBM, pero no se incluyen aquí por no estar disponibles en el repositorio.

## Requisitos de hardware

- **VRAM estimada**: con cuantización GGUF Q4_K_M, el modelo ocupa aproximadamente 1.2-1.5 GB, por lo que puede ejecutarse en GPUs con 4 GB de VRAM o menos. Para cuantizaciones más altas (Q8), se recomienda al menos 2 GB.
- **GPUs recomendadas**: cualquier GPU consumer con al menos 4 GB de VRAM (GTX 1650, RTX 3060, RTX 4060) es suficiente para inferencia. También puede ejecutarse en CPU con 8 GB de RAM, aunque la latencia será mayor.
- **Despliegue**: compatible con llama.cpp, Ollama, LM Studio, vLLM (con conversión a safetensors), TGI y transformers de HuggingFace. Para uso en producción con alta concurrencia, se recomienda vLLM o TGI con cuantización de 4 bits.
- **Latencia y throughput**: no se han publicado mediciones específicas. En una RTX 3060, se estima una generación de 20-30 tokens por segundo con cuantización Q4, y en CPU (M1 Mac o i7) de 5-10 tokens/s.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Capacidades clave |
|---|---|---|---|---|---|
| nani (Granite-4.0-1B) | 1.6B | no disponible | MIT (repo) / Apache 2.0 (base) | GGUF | Multilingüe, tool calling, RAG, código |
| Qwen2.5-1.5B-Instruct | 1.5B | 32K tokens | Apache 2.0 | safetensors, GGUF | Multilingüe, tool calling, razonamiento |
| Llama-3.2-1B-Instruct | 1.2B | 128K tokens | Llama 3.2 Community License | safetensors, GGUF | Multilingüe, razonamiento |
| SmolLM2-1.7B-Instruct | 1.7B | 8K tokens | Apache 2.0 | safetensors, GGUF | Instrucción, eficiente en CPU |

El modelo `nani` destaca por su licencia MIT en el repositorio (aunque el base es Apache 2.0) y su soporte de tool calling en un rango de 1B, similar a Qwen2.5-1.5B. Sin embargo, carece de datos de contexto y benchmarks públicos, lo que limita la comparación directa.

## Limitaciones y advertencias

- **Sesgos y alucinaciones**: al ser un modelo pequeño (1.6B), es propenso a generar respuestas plausibles pero incorrectas, especialmente en tareas de razonamiento complejo. Se recomienda validar las salidas en producción.
- **Longitud de contexto desconocida**: no se especifica la ventana de contexto máxima, lo que dificulta planificar tareas que requieran procesar documentos largos.
- **Licencia**: el repositorio se declara como MIT, pero el modelo base Granite-4.0-1B está bajo Apache 2.0. Los usuarios deben revisar los términos de la licencia base para uso comercial y redistribución.
- **Idiomas**: aunque soporta 12 idiomas, la calidad puede variar en idiomas con menos datos de entrenamiento. El fine-tuning puede ser necesario para dominios específicos.
- **Riesgo de seguridad**: como modelo de instrucción, puede ser susceptible a jailbreak y generar contenido no deseado si no se aplican filtros de seguridad externos.
- **Dependencia del autor**: el repositorio no tiene descargas ni likes, lo que indica poca validación por la comunidad. Se recomienda probar exhaustivamente antes de usar en producción.

## Enlaces

- [Repositorio HuggingFace del modelo nani](https://huggingface.co/leeroy-jankins/nani)
- [Documentación oficial de Granite (IBM)](https://www.ibm.com/granite/docs/)
- [Colección de modelos Granite 4.0 Nano en HuggingFace](https://huggingface.co/collections/ibm-granite/granite-40-nano-language-models-68e5775c80b60e43b72cfa16)
- [Modelo base unsloth/granite-4.0-1b](https://huggingface.co/unsloth/granite-4.0-1b)
- [Perfil del autor leeroy-jankins](https://huggingface.co/leeroy-jankins)
