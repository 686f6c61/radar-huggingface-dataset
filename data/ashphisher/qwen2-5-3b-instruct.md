# ashphisher/Qwen2.5-3B-Instruct

## Resumen

El modelo `ashphisher/Qwen2.5-3B-Instruct` es un ajuste fino (fine-tune) del modelo base `Qwen/Qwen2.5-3B-Instruct`, desarrollado por el usuario ashphisher en Hugging Face. Se trata de un modelo de lenguaje causal de 3.09 mil millones de parámetros, orientado a tareas de generación de texto y conversación, con especial énfasis en instrucciones y chat. Aunque la model card publicada es idéntica a la del modelo original de Alibaba, este repositorio representa una variante específica que no añade información adicional sobre el proceso de ajuste, los datos utilizados o las mejoras concretas respecto al modelo base.

La relevancia de este modelo radica en que Qwen2.5-3B-Instruct es una de las opciones más sólidas en la gama de 3B parámetros, con capacidades destacadas en codificación, matemáticas y generación de salidas estructuradas, además de soporte de contexto largo de hasta 32,768 tokens. Al ser un fine-tune, se espera que herede estas capacidades, aunque no se documentan cambios específicos. La licencia `qwen-research` restringe su uso a fines de investigación, lo que limita su aplicación comercial directa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal con RoPE, SwiGLU, RMSNorm, Attention QKV bias y word embeddings atados |
| Parametros totales | 3.085.938.688 (3,09B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens (generación máxima de 8.192 tokens) |
| Tipos de cuantizacion | No especificados en el repositorio; compatible con cuantizaciones estándar (GGUF, AWQ, GPTQ) mediante herramientas externas |
| Idiomas soportados | Inglés (según la etiqueta `language: en`; el modelo base soporta 29 idiomas, pero este fine-tune solo declara inglés) |
| Licencia | qwen-research (licencia de investigación, no comercial) |
| Formato de pesos | safetensors (tamaño del repo: 6,2 GB) |

## Arquitectura y entrenamiento

La arquitectura es un transformer causal estándar con 36 capas, atención de consultas agrupadas (GQA) con 16 cabezas de consulta y 2 cabezas de clave/valor, y embeddings de palabras atados. Usa RoPE (Rotary Position Embedding) para codificación posicional, SwiGLU como activación y RMSNorm para normalización. El modelo base Qwen2.5 fue preentrenado con hasta 18 billones de tokens según la documentación oficial, e incluye una fase de post-entrenamiento con instrucciones y preferencias humanas (RLHF/DPO), aunque los detalles específicos del fine-tune de ashphisher no se documentan en este repositorio.

No se proporciona información sobre el dataset de ajuste, el número de pasos de entrenamiento o las técnicas de optimización empleadas por el autor del fine-tune. Dado que la model card es una copia de la del modelo original, es probable que el ajuste sea mínimo o que simplemente se haya subido el modelo base con otro nombre, pero no hay evidencia para confirmarlo.

## Capacidades

- Generación de texto conversacional y asistencia en tareas de chat multi-turno.
- Razonamiento y resolución de problemas en dominios generales.
- Generación de código y soporte para tareas de programación (heredado del modelo base).
- Matemáticas y resolución de problemas numéricos.
- Comprensión de datos estructurados (tablas) y generación de salidas JSON.
- Seguimiento de instrucciones y adaptación a system prompts diversos.
- Soporte de contexto largo (hasta 32K tokens) para documentos extensos.
- No se documenta soporte explícito de tool calling, function calling o modo agente en este repositorio, aunque el modelo base Qwen2.5 sí lo incluye.

## Casos de uso

- Asistente de chat para atención al cliente: el modelo puede gestionar conversaciones multi-turno con contexto de hasta 32K tokens, lo que permite mantener historiales largos de interacción sin perder información relevante.
- Generación de documentación técnica: gracias a su capacidad para seguir instrucciones y generar texto estructurado, puede redactar manuales, guías y comentarios de código.
- Prototipado rápido de aplicaciones de IA conversacional: al ser un modelo de 3B parámetros, es viable ejecutarlo en hardware de consumo para pruebas y desarrollo.
- Análisis de datos estructurados: puede interpretar tablas y generar resúmenes o extraer información en formato JSON, útil para pipelines de procesamiento de datos.
- Educación y tutoría: puede responder preguntas de matemáticas, ciencias y programación, sirviendo como herramienta de apoyo en entornos educativos.
- Investigación académica en NLP: dado su tamaño moderado y licencia de investigación, es adecuado para experimentos de fine-tuning adicional o estudios comparativos de modelos pequeños.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para el fine-tune `ashphisher/Qwen2.5-3B-Instruct` en la información disponible. El modelo base Qwen2.5-3B-Instruct reporta resultados en el blog oficial de Qwen (https://qwenlm.github.io/blog/qwen2.5/), pero no se incluyen cifras concretas en la model card ni en los resultados de búsqueda web. Por tanto, no es posible presentar una tabla comparativa fiable sin inventar datos.

## Requisitos de hardware

- VRAM estimada para inferencia: con pesos en fp16, el modelo ocupa aproximadamente 6,2 GB (según el tamaño del repo). Con cuantización a 8 bits, ~3,1 GB; a 4 bits, ~1,6 GB.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para fp16 (p. ej., RTX 3070, RTX 4060 Ti, A10). Para cuantización 4 bits, GPUs con 4 GB (p. ej., RTX 3050, GTX 1660) pueden ser suficientes.
- Cabe en GPUs de consumo: sí, especialmente con cuantización. Una RTX 4090 o RTX 3090 puede ejecutarlo sin problemas en fp16.
- Opciones de despliegue: compatible con Hugging Face Transformers, vLLM, llama.cpp, Ollama (existe una versión oficial de Qwen2.5:3b-instruct en Ollama), Text Generation Inference (TGI) y endpoints compatibles.
- Latencia y throughput: no se proporcionan datos específicos para este fine-tune. En el modelo base, con una RTX 4090 y cuantización 4 bits, se pueden alcanzar velocidades de generación de 50-100 tokens/s, pero estos valores son estimaciones orientativas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Idiomas | Notas |
|---|---|---|---|---|---|
| Qwen2.5-3B-Instruct (base) | 3,09B | 32K | Apache 2.0 (para el modelo base) | 29 idiomas | Modelo original de Alibaba, con licencia permisiva |
| ashphisher/Qwen2.5-3B-Instruct | 3,09B | 32K | qwen-research | Inglés (declarado) | Fine-tune sin documentación adicional |
| Llama 3.2 3B Instruct | 3,21B | 128K | Llama 3.2 Community License | 8 idiomas | Alternativa de Meta con contexto más largo |
| Gemma 2 2B | 2,6B | 8K | Gemma Terms of Use | 28 idiomas | Modelo de Google, más pequeño y con contexto menor |

La comparativa muestra que el modelo base Qwen2.5-3B-Instruct tiene una licencia más permisiva (Apache 2.0) que este fine-tune, que usa `qwen-research`. Llama 3.2 3B ofrece un contexto mucho mayor (128K) y una licencia comercial, mientras que Gemma 2 2B es más ligero pero con contexto limitado.

## Limitaciones y advertencias

- Licencia `qwen-research`: restringe el uso a fines de investigación y no permite uso comercial. Verificar los términos exactos en el enlace de la licencia.
- Idioma: el repositorio declara solo inglés, aunque el modelo base soporta 29 idiomas. El fine-tune podría haber reducido el soporte multilingüe, pero no hay evidencia.
- Falta de documentación: no se especifican los datos de entrenamiento, el proceso de ajuste ni las diferencias con el modelo base, lo que dificulta evaluar su fiabilidad.
- Riesgo de alucinación: como cualquier LLM, puede generar información falsa o inventada, especialmente en dominios especializados.
- Sesgos: el modelo base puede contener sesgos presentes en los datos de preentrenamiento; el fine-tune no documenta medidas de mitigación.
- Contexto: aunque soporta 32K tokens, la generación máxima es de 8K tokens, lo que limita la longitud de las respuestas.
- Compatibilidad: requiere `transformers>=4.37.0` para evitar errores de carga.

## Enlaces

- Repositorio del modelo: https://huggingface.co/ashphisher/Qwen2.5-3B-Instruct
- Modelo base (Qwen/Qwen2.5-3B-Instruct): https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Modelo base sin instrucciones (Qwen/Qwen2.5-3B): https://huggingface.co/Qwen/Qwen2.5-3B
- Blog oficial de Qwen2.5: https://qwenlm.github.io/blog/qwen2.5/
- Repositorio GitHub de Qwen2.5: https://github.com/QwenLM/Qwen2.5
- Documentación de Qwen: https://qwen.readthedocs.io/en/latest/
- Página de Ollama para Qwen2.5:3b-instruct: https://ollama.com/library/qwen2.5:3b-instruct
- Paper técnico de Qwen2 (arXiv:2407.10671): https://arxiv.org/abs/2407.10671
