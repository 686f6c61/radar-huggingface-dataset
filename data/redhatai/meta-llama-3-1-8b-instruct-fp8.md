# RedHatAI/Meta-Llama-3.1-8B-Instruct-FP8

## Resumen

RedHatAI/Meta-Llama-3.1-8B-Instruct-FP8 es una version cuantizada en FP8 del modelo Meta-Llama-3.1-8B-Instruct, desarrollada por Neural Magic y publicada en el espacio de Red Hat AI. El modelo reduce a la mitad los requisitos de memoria GPU y espacio en disco respecto al original en BF16, manteniendo un rendimiento casi identico: 73,44 puntos de media en el benchmark OpenLLM (version 1) frente a los 73,79 del modelo sin cuantizar. Esta optimizacion lo hace especialmente adecuado para despliegue en produccion con vLLM, donde se puede servir con una latencia menor y un coste de infraestructura reducido.

El modelo hereda todas las capacidades del Llama 3.1 Instruct de 8B: arquitectura transformer con 8.030 millones de parametros, ventana de contexto de 128k tokens y soporte multilingue en ocho idiomas (ingles, aleman, frances, italiano, portugues, hindi, espanol y tailandes). La cuantizacion se realizo con LLM Compressor, calibrando con 512 secuencias del dataset UltraChat, y solo afecta a los operadores lineales de los bloques transformer, preservando la calidad general del modelo.

Este lanzamiento es relevante porque aborda el principal obstaculo para desplegar LLMs de 8B en entornos de produccion: el consumo de memoria. Al reducir los pesos y activaciones a FP8, se puede servir el modelo en GPUs con menos VRAM, como una RTX 4090 de 24GB, o aumentar el throughput en servidores con A100 o H100. Ademas, al estar listo para vLLM, se integra directamente con APIs compatibles con OpenAI, lo que facilita su adopcion en pipelines existentes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Meta-Llama-3.1) |
| Parametros totales | 8.030.261.248 (8,03B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 128.000 tokens (heredado del modelo base) |
| Tipos de cuantizacion | FP8 (pesos y activaciones, simetrico per-tensor) |
| Idiomas soportados | en, de, fr, it, pt, hi, es, th |
| Licencia | llama3.1 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es una cuantizacion FP8 de Meta-Llama-3.1-8B-Instruct, que a su vez es un transformer decoder-only con atencion de consulta agrupada (GQA), 32 capas, dimension oculta de 4096 y 32 cabezas de atencion. El modelo base fue preentrenado por Meta con aproximadamente 15 trillones de tokens de datos publicos, seguido de un ajuste fino instructivo con supervision humana y optimizacion por preferencias (RLHF/DPO). El conocimiento del modelo se corta en diciembre de 2023.

La cuantizacion FP8 se aplico con LLM Compressor, una herramienta de Neural Magic integrada con vLLM. Se cuantizaron tanto los pesos como las activaciones de los operadores lineales dentro de los bloques transformer, excluyendo la capa de salida (lm_head). La cuantizacion es simetrica y per-tensor, con un unico factor de escala para representar los valores FP8. La calibracion se realizo con 512 secuencias del dataset UltraChat, con una longitud maxima de 4096 tokens. El resultado reduce el tamaño de los pesos de 16 a 8 bits, disminuyendo el espacio en disco de ~18,2GB a aproximadamente la mitad y reduciendo los requisitos de VRAM de forma proporcional.

## Capacidades

- Generacion de texto conversacional tipo asistente, con soporte de system prompts y mensajes multi-turno.
- Razonamiento, resolucion de problemas y generacion de codigo, heredados del modelo base Llama 3.1 Instruct.
- Soporte multilingue en 8 idiomas: ingles, aleman, frances, italiano, portugues, hindi, espanol y tailandes.
- Ventana de contexto larga de 128k tokens, que permite procesar documentos extensos o conversaciones de muchas vueltas.
- Integracion nativa con vLLM, incluyendo modo de servicio compatible con la API de OpenAI.
- Inferencia optimizada para entornos con recursos limitados gracias a la cuantizacion FP8.
- No incluye soporte de vision, audio ni tool calling en la model card, aunque el modelo base de Llama 3.1 soporta function calling en su version original (no documentado en esta cuantizacion).

## Casos de uso

- **Despliegue de asistentes conversacionales en produccion**: el modelo puede servir como base para chatbots multilingues con ventana de contexto de 128k, manejando conversaciones largas con memoria de contexto sin perder informacion. La cuantizacion FP8 permite servir el modelo en una sola GPU de 24GB, reduciendo costes de infraestructura.

- **Reduccion de costes en inferencia a gran escala**: al reducir los requisitos de VRAM en un 50% respecto al modelo en BF16, se pueden servir mas peticiones concurrentes en el mismo hardware. Es adecuado para empresas que operan APIs de generacion de texto con alto volumen de trafico.

- **Sustitucion de modelos propietarios en entornos con privacidad**: al ser un modelo abierto con licencia llama3.1, se puede desplegar en infraestructura local o en la nube privada, evitando el envio de datos a servicios externos. La cuantizacion FP8 no altera las capacidades de razonamiento del modelo original.

- **Prototipado rapido con vLLM**: el modelo viene listo para usar con vLLM, lo que permite montar un servidor compatible con OpenAI en minutos. Los desarrolladores pueden probar el modelo con el API de chat, configurando parametros como temperature, top_p y max_tokens mediante SamplingParams.

- **Procesamiento de documentos largos**: con una ventana de 128k tokens, el modelo puede resumir, extraer informacion o responder preguntas sobre documentos extensos (manuscritos, informes, codigo fuente de proyectos grandes) en una sola pasada, sin necesidad de chunking.

- **Sistema de soporte multilingue**: el modelo soporta 8 idiomas, por lo que puede desplegarse en aplicaciones de atencion al cliente que atienden a usuarios de habla hispana, francesa, alemana, etc., manteniendo una calidad de conversacion coherente en todos los idiomas.

## Benchmarks y rendimiento

El modelo fue evaluado con el benchmark OpenLLM (version 1), que incluye MMLU, ARC-Challenge, GSM-8K, Hellaswag, Winogrande y TruthfulQA. La evaluacion se realizo con la version de lm-evaluation-harness de Neural Magic y el motor vLLM.

| Benchmark | Modelo FP8 | Modelo original (BF16) |
|---|---|---|
| OpenLLM (media) | 73,44 | 73,79 |
| Degradacion relativa | -0,47% | - |

No se han publicado resultados desglosados por tarea en la informacion disponible. La diferencia de 0,35 puntos sobre la media (una degradacion relativa de aproximadamente el 0,5%) es marginal y se considera aceptable para la reduccion de recursos conseguida.

## Requisitos de hardware

- **VRAM estimada para inferencia**: aproximadamente 9-10 GB para los pesos FP8 del modelo de 8B, mas overhead de activaciones y cache KV. Con la ventana de contexto completa (128k) la memoria de activaciones puede crecer significativamente, pero para usos tipicos con contextos de 4k-8k tokens cabe en una GPU de 16GB.
- **GPUs recomendadas**: RTX 4090 (24GB) o RTX 4080 (16GB) para entornos de desarrollo; A100 40GB o H100 para servidores de produccion con alto throughput.
- **Compatibilidad con GPU consumer**: si, cabe en GPUs de 16GB o 24GB con cuantizacion FP8, siempre que no se utilice la ventana de contexto completa.
- **Opciones de despliegue**: vLLM (recomendado, soporte nativo), text-generation-inference (TGI), llama.cpp para inferencia en CPU, o servidores compatibles con OpenAI mediante vLLM.
- **Latencia y throughput**: no disponible en la informacion proporcionada. Depende del hardware y de la configuracion de vLLM, pero la cuantizacion FP8 reduce el ancho de banda de memoria, lo que suele mejorar el throughput respecto a BF16.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | OpenLLM (media) | Licencia |
|---|---|---|---|---|---|
| RedHatAI/Meta-Llama-3.1-8B-Instruct-FP8 | 8,03B | 128k | FP8 | 73,44 | llama3.1 |
| meta-llama/Meta-Llama-3.1-8B-Instruct (original) | 8,03B | 128k | BF16 | 73,79 | llama3.1 |
| neuralmagic/Meta-Llama-3.1-8B-Instruct-FP8 | 8,03B | 128k | FP8 | 73,44 | llama3.1 |
| llama-3.1-8b-instruct-gptq (GPTQ) | 8,03B | 128k | 4-bit | no disponible | llama3.1 |

La comparativa con el modelo original muestra una perdida de rendimiento minima del 0,5%. En cuanto a alternativas cuantizadas, la version GPTQ de 4 bits reduce aun mas la memoria (aproximadamente 5-6GB) pero con una perdida de precision mayor. No se dispone de datos de benchmarks de la version GPTQ en la informacion disponible.

## Limitaciones y advertencias

- **Sesgos conocidos**: el modelo base de Llama 3.1 puede reflejar sesgos presentes en los datos de entrenamiento, especialmente en temas sociales y politicos. La cuantizacion no corrige estos sesgos.
- **Riesgo de alucinacion**: como todos los LLM, puede generar informacion falsa o inventada, especialmente en tareas de razonamiento complejo o con datos no presentes en el contexto.
- **Limitaciones de idioma**: aunque soporta 8 idiomas, la calidad puede variar entre ellos. El ingles es el idioma mejor soportado; los otros idiomas pueden presentar errores gramaticales o menos fluidez.
- **Restricciones de licencia**: la licencia llama3.1 permite uso comercial, pero incluye restricciones sobre el uso de los logotipos de Meta y la responsabilidad del usuario. Requiere que las aplicaciones que usen el modelo con mas de 700 millones de usuarios mensuales obtengan una licencia explicita de Meta.
- **Cuantizacion FP8**: aunque la perdida de rendimiento es minima, puede haber casos especificos donde la precision se degrade ligeramente. Se recomienda validar el modelo en el dominio de aplicacion concreto antes de desplegarlo en produccion.
- **Sin soporte de vision ni audio**: el modelo solo acepta texto como entrada y genera texto como salida. No es adecuado para tareas multimodales.

## Enlaces

- [Hugging Face: RedHatAI/Meta-Llama-3.1-8B-Instruct-FP8](https://huggingface.co/RedHatAI/Meta-Llama-3.1-8B-Instruct-FP8)
- [Modelo base: meta-llama/Meta-Llama-3.1-8B-Instruct](https://huggingface.co/meta-llama/Meta-Llama-3.1-8B-Instruct)
- [LLM Compressor (repositorio de cuantizacion)](https://github.com/vllm-project/llm-compressor)
- [Documentacion de vLLM](https://docs.vllm.ai/en/latest/)
- [Benchmark OpenLLM Leaderboard](https://huggingface.co/spaces/open-llm-leaderboard/open_llm_leaderboard)
