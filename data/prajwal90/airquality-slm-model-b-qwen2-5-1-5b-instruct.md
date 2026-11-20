# prajwal90/AirQuality-SLM-Model-B-Qwen2.5-1.5B-Instruct

## Resumen

AirQuality-SLM-Model-B-Qwen2.5-1.5B-Instruct es un ajuste fino (fine-tuning) publicado por el usuario prajwal90 en Hugging Face, construido sobre el modelo base Qwen/Qwen2.5-1.5B de Alibaba Cloud. Por el nombre del repositorio, el ajuste esta orientado a tareas de calidad del aire (Air Quality), presumiblemente un modelo de lenguaje pequeno (SLM) especializado en ese dominio. No obstante, la model card publicada es una copia literal de la de Qwen2.5-1.5B-Instruct y no documenta el dataset, el procedimiento de ajuste ni los objetivos concretos del autor.

El modelo hereda la arquitectura de Qwen2.5: un transformer causal con RoPE, SwiGLU, RMSNorm, atencion con Grouped Query Attention (GQA) y embeddings de palabras atados. Con 1.543.714.304 parametros totales (1,31B sin embeddings), 28 capas y una ventana de contexto de 32.768 tokens, se situa en la categoria de modelos pequenos desplegables en hardware de consumo.

Su relevancia practica es limitada por ahora: el repositorio registra 0 descargas y 0 likes, y no se han publicado resultados de evaluacion especificos del ajuste. Resulta util como ejemplo de especializacion de un SLM para un dominio vertical concreto, pero su adopcion en produccion requeriria validacion adicional por parte del usuario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal con RoPE, SwiGLU, RMSNorm, GQA (12 cabezas Q / 2 KV) y embeddings atados |
| Parametros totales | 1.543.714.304 (1,54B); 1,31B sin embeddings |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens (entrada); generacion de hasta 8.192 tokens |
| Tipos de cuantizacion | No disponible en la informacion proporcionada (formato safetensors en fp/bf16; cuantizaciones GGUF/AWQ no publicadas por el autor) |
| Idiomas soportados | La model card declara mas de 29 idiomas (incluido espanol); los tags del repo solo declaran `en` |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers) |
| Capas | 28 |
| Tamano del repositorio | 3,1 GB |
| Modelo base | Qwen/Qwen2.5-1.5B |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-1.5B: un transformer decoder-only denso con 28 capas, normalizacion RMSNorm, activacion SwiGLU, codificacion posicional rotatoria (RoPE) y atencion con Grouped Query Attention (12 cabezas para queries y 2 para claves/valores), lo que reduce el coste de memoria del KV cache. Los embeddings de entrada y la cabeza de salida estan atados, lo que explica la diferencia entre los 1,54B totales y los 1,31B no-embedding.

El modelo base Qwen2.5-1.5B fue preentrenado y posteriormente ajustado con instrucciones por el equipo Qwen, con mejoras declaradas en conocimiento, codigo, matematicas, seguimiento de instrucciones, generacion de JSON y robustez frente a system prompts. Sin embargo, la informacion disponible no detalla el numero de tokens de preentrenamiento ni la composicion del dataset. Respecto al ajuste fino especifico de prajwal90, no se documenta en la model card el corpus utilizado, el numero de pasos, la tecnica (SFT, LoRA, QLoRA, DPO) ni si hubo RLHF; la model card es una copia de la del modelo original.

## Capacidades

- Generacion de texto conversacional multi-turno con plantilla de chat (`apply_chat_template`).
- Razonamiento basico y respuesta a instrucciones, heredado de Qwen2.5-1.5B-Instruct.
- Generacion de codigo y resolucion de problemas matematicos elementales (capacidades mejoradas en la familia Qwen2.5).
- Comprension y generacion de datos estructurados, especialmente JSON y tablas.
- Generacion de textos largos (hasta 8.192 tokens de salida) y manejo de contextos de hasta 32.768 tokens.
- Capacidades multilingues declaradas para mas de 29 idiomas en la model card del modelo base, aunque los tags del repositorio solo indican ingles.
- Especializacion presumible en dominio de calidad del aire, segun el nombre del repositorio; no verificada ni documentada.
- Soporte de tool calling / function calling: no documentado en la informacion disponible para este ajuste.
- Soporte de agentes y razonamiento multi-paso: no documentado especificamente.

## Casos de uso

- Consultas sobre calidad del aire: dado el nombre del repositorio, el uso previsto seria responder preguntas sobre indices AQI, contaminantes (PM2,5, PM10, NO2, O3, SO2, CO) y normativa asociada, aprovechando el ajuste del autor. Requiere validacion previa por falta de documentacion.
- Asistente conversacional ligero en espanol o ingles: con 1,54B parametros y contexto de 32K, puede gestionar dialogos multi-turno en entornos con recursos limitados, aunque la calidad sera inferior a modelos de mayor tamano.
- Extraccion y formateo de datos estructurados: su capacidad para generar JSON permite usarlo en pipelines de parsing de informes medioambientales o de sensores, transformando texto libre en registros estructurados.
- Prototipado rapido y experimentacion: al caber en GPU de consumo y estar disponible en safetensors con transformers, sirve para validar ideas de aplicaciones de IA en dominio medioambiental antes de escalar a modelos mayores.
- Generacion de resumenes de partes meteorologicos o informes de estaciones de medida: con contexto de 32K puede procesar documentos largos y condensar la informacion relevante.
- Educacion y divulgacion: chatbot para explicar conceptos de contaminacion atmosferica a usuarios no tecnicos, con respuestas controladas mediante system prompts.
- Filtrado y clasificacion de textos: uso como modelo auxiliar para clasificar noticias o informes relacionados con calidad del aire dentro de un pipeline mayor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite a los resultados del modelo base Qwen2.5 en el blog oficial de Qwen, pero no aporta cifras propias del ajuste AirQuality-SLM-Model-B.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 3,1 GB de pesos mas overhead de activaciones y KV cache; en la practica, entre 4 y 6 GB para contextos moderados.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 1,6-2 GB; en 4 bits (si se generan pesos GGUF/AWQ, no publicados por el autor): en torno a 1-1,5 GB.
- GPU recomendadas: cualquier GPU con 8 GB o mas de VRAM (RTX 3060 Ti, RTX 4060, RTX 4070, RTX 4090); en entornos de servidor, A100, H100 o L4 sin problema.
- Cabe en GPU de consumo: si, en practicamente todas las GPU modernas con 6-8 GB de VRAM.
- Opciones de despliegue: transformers (libreria nativa), text-generation-inference (tag `text-generation-inference` presente), vLLM (compatible con arquitectura Qwen2), llama.cpp/Ollama si se generan pesos GGUF, y endpoints compatibles (tag `endpoints_compatible`).
- Latencia y throughput: no disponibles en la informacion proporcionada; la documentacion de Qwen incluye un benchmark de velocidad para el modelo base, no para este ajuste.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| AirQuality-SLM-Model-B-Qwen2.5-1.5B-Instruct | 1,54B | 32.768 | Apache 2.0 | Hugging Face (0 descargas) | Ajuste de dominio sin documentar |
| Qwen/Qwen2.5-1.5B-Instruct | 1,54B | 32.768 | Apache 2.0 | Hugging Face (ampliamente usado) | Modelo base, con benchmarks publicados |
| Qwen/Qwen2.5-3B-Instruct | 3,09B | 32.768 | Apache 2.0 | Hugging Face | Mayor capacidad a costa de mas VRAM |
| Llama-3.2-1B-Instruct | 1,24B | 128.000 | Llama 3.2 Community License | Hugging Face | Contexto mayor, licencia mas restrictiva |

## Limitaciones y advertencias

- Ausencia de documentacion del ajuste: la model card es una copia de la del modelo base; no se especifica dataset, tecnica ni evaluacion del fine-tuning, lo que impide verificar la especializacion en calidad del aire.
- Riesgo de alucinacion: como todo modelo de 1,5B, puede generar datos incorrectos, especialmente en cifras, normativa o valores de contaminantes; requiere verificacion humana en aplicaciones criticas.
- Sesgos conocidos: no documentados para este ajuste; el modelo base Qwen2.5 puede presentar sesgos derivados de sus datos de preentrenamiento.
- Limitaciones de idioma: la model card declara multilingueismo, pero los tags del repositorio solo indican ingles; el rendimiento en espanol no esta verificado para este ajuste.
- Capacidad limitada por tamano: con 1,54B parametros, el razonamiento complejo, las matematicas avanzadas y el codigo de produccion quedan por debajo de modelos de 7B o superiores.
- Licencia Apache 2.0: permite uso comercial, pero conviene conservar los avisos de licencia del modelo base Qwen y verificar que el ajuste no introduzca datos con restricciones adicionales.
- Sin senales de adopcion: 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en produccion ni de validacion por terceros.
- Fecha de creacion futura (2026-11-20): el repositorio podria ser un artefacto de prueba o estar mal fechado; conviene verificar su vigencia antes de integrarlo.

## Enlaces

- Hugging Face: https://huggingface.co/prajwal90/AirQuality-SLM-Model-B-Qwen2.5-1.5B-Instruct
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B
- Modelo base instruct: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Blog de Qwen2.5: https://qwenlm.github.io/blog/qwen2.5/
- Repositorio GitHub de Qwen2.5: https://github.com/QwenLM/Qwen2.5
- Documentacion de Qwen: https://qwen.readthedocs.io/en/latest/
- Benchmark de velocidad de Qwen: https://qwen.readthedocs.io/en/latest/benchmark/speed_benchmark.html
- Paper Qwen2 (arXiv:2407.10671): https://arxiv.org/abs/2407.10671
- Licencia Apache 2.0 del modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct/blob/main/LICENSE
