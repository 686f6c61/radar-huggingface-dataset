# sbcho0325/EXAONE-3.5-7.8B-lg_convfin_mcq_pc_antidiverse_sft_step170

## Resumen

Este repositorio contiene un adaptador LoRA (Low-Rank Adaptation) entrenado sobre el modelo base `LGAI-EXAONE/EXAONE-3.5-7.8B-Instruct`, publicado por el usuario `sbcho0325`. El nombre del checkpoint (`lg_convfin_mcq_pc_antidiverse_sft_step170`) sugiere un ajuste fino supervisado (SFT) orientado a conversación, preguntas de opción múltiple (MCQ) y un posible control de diversidad en la generación, aunque no se proporciona documentación adicional que confirme estos objetivos.

El modelo base, EXAONE 3.5 7.8B Instruct, es un modelo de lenguaje bilingüe (inglés y coreano) desarrollado por LG AI Research, con 7.8 mil millones de parámetros y una ventana de contexto de hasta 32 000 tokens. Este adaptador añade una capa de ajuste fino específica sobre dicha base, pero al tratarse de un adaptador PEFT, no incluye los pesos completos del modelo, solo las matrices LoRA (0,3 GB de tamaño de repositorio).

La relevancia de este adaptador radica en su posible uso para tareas de conversación y razonamiento con preguntas de opción múltiple, aprovechando las capacidades del modelo base. Sin embargo, la ausencia de una model card detallada, datos de entrenamiento o métricas de evaluación limita su aplicabilidad en producción sin una validación previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (adaptador LoRA sobre EXAONE-3.5-7.8B-Instruct) |
| Parametros totales | 7.8B (modelo base) + adaptador LoRA (dimension no especificada) |
| Parametros activos | 7.8B (todos los parametros del modelo base, el adaptador anade un numero reducido de parametros entrenables) |
| Longitud de contexto | 32 000 tokens (modelo base) |
| Tipos de cuantizacion | No especificados para el adaptador; el modelo base esta disponible en FP16, BF16 y GGUF (varias cuantizaciones) |
| Idiomas soportados | Ingles y coreano (modelo base); el adaptador no especifica idiomas adicionales |
| Licencia | No disponible para el adaptador; el modelo base usa la licencia EXAONE de LG AI Research (consultar terminos) |
| Formato de pesos | safetensors (adaptador LoRA) |

## Arquitectura y entrenamiento

El adaptador se basa en la arquitectura del modelo EXAONE-3.5-7.8B-Instruct, un transformer decoder-only con normalización previa y atención multi-cabeza. El modelo base fue preentrenado con datos bilingües (inglés y coreano) y posteriormente ajustado con instrucciones mediante técnicas de supervisión y refuerzo. El adaptador LoRA, por su parte, fue entrenado con el framework PEFT y la librería TRL, utilizando un enfoque de ajuste fino supervisado (SFT). El checkpoint corresponde al paso 170 del entrenamiento, lo que sugiere un ajuste relativamente corto.

No se proporcionan detalles sobre el dataset de entrenamiento, los hiperparámetros (tasa de aprendizaje, rango de LoRA, etc.) ni el régimen de entrenamiento (precisión mixta, etc.). El nombre del adaptador incluye los términos `convfin`, `mcq`, `pc` y `antidiverse`, que podrían indicar tareas de finalización de conversación, preguntas de opción múltiple, y un objetivo de reducción de diversidad en las respuestas, pero estas interpretaciones son especulativas sin documentación oficial.

## Capacidades

- Generación de texto en inglés y coreano, heredada del modelo base EXAONE-3.5-7.8B-Instruct.
- Razonamiento conversacional multi-turno, gracias al ajuste instruct del modelo base.
- Soporte de preguntas de opción múltiple (MCQ) probablemente reforzado por el entrenamiento del adaptador, aunque no hay evidencia empírica en la documentación.
- Capacidad de procesar contextos largos de hasta 32 000 tokens, útil para documentos extensos o conversaciones prolongadas.
- No se confirma soporte de tool calling, function calling o modo agente en la información disponible.
- No se indica soporte de visión, audio u otras modalidades.

## Casos de uso

- Asistentes conversacionales bilingües: el modelo puede mantener diálogos en inglés y coreano con contexto amplio, adecuado para aplicaciones de atención al cliente o asistentes personales.
- Evaluación de comprensión lectora: dado el posible entrenamiento en MCQ, podría emplearse para generar o responder preguntas de opción múltiple en entornos educativos.
- Análisis de documentos largos: con 32K de contexto, puede resumir o extraer información de informes extensos, contratos o artículos técnicos.
- Generación de contenido en coreano e inglés: útil para redacción de textos, traducción asistida o creación de materiales bilingües.
- Prototipado de investigación: como adaptador LoRA, permite experimentar con técnicas de ajuste fino eficiente sobre un modelo de 7.8B sin requerir recursos masivos.
- Fine-tuning adicional: al ser un adaptador PEFT, puede combinarse con otros adaptadores o continuar su entrenamiento para tareas específicas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El adaptador LoRA tiene un tamaño de 0,3 GB, por lo que puede cargarse junto al modelo base en una GPU con suficiente VRAM.
- Para el modelo base en FP16 se necesitan aproximadamente 16 GB de VRAM (por ejemplo, una NVIDIA RTX 4090 o A100 16GB).
- Con cuantización 8-bit, se reduce a unos 8-10 GB, compatible con GPUs como RTX 3080/3090.
- Con cuantización 4-bit (GGUF), cabe en GPUs con 6-8 GB, como RTX 3060 o RTX 4060.
- Opciones de despliegue: vLLM, llama.cpp, Ollama (el modelo base está disponible en Ollama), Hugging Face Transformers con PEFT.
- La latencia y el throughput dependen del hardware y la cuantización; no se dispone de mediciones específicas para este adaptador.

## Comparativa con modelos similares

El adaptador no es un modelo independiente, sino un ajuste sobre EXAONE-3.5-7.8B-Instruct. Por tanto, la comparativa debe hacerse entre el modelo base y alternativas de tamaño similar.

| Modelo | Parametros | Contexto | Idiomas | Licencia |
|---|---|---|---|---|
| EXAONE-3.5-7.8B-Instruct (base) | 7.8B | 32K | Ingles, coreano | EXAONE (LG AI Research) |
| Llama-3.1-8B-Instruct | 8B | 128K | Multilingue (principalmente ingles) | Llama 3.1 Community License |
| Qwen2.5-7B-Instruct | 7.6B | 128K | Multilingue (incluye chino, ingles, etc.) | Apache 2.0 (Qwen) |
| Mistral-7B-Instruct-v0.3 | 7.3B | 32K | Multilingue (principalmente ingles) | Apache 2.0 |

No se dispone de datos de rendimiento comparativo para este adaptador específico. La elección entre estas alternativas dependerá de la necesidad de soporte coreano (EXAONE es superior en ese idioma), la licencia y el ecosistema de herramientas.

## Limitaciones y advertencias

- El adaptador no tiene documentación técnica: no se especifican datos de entrenamiento, hiperparámetros ni métricas de evaluación, lo que impide conocer su comportamiento real.
- La licencia del modelo base EXAONE es restrictiva: no permite uso comercial sin autorización expresa de LG AI Research. El adaptador, al no especificar licencia, hereda las condiciones del modelo base.
- El nombre `antidiverse` sugiere un posible sesgo hacia respuestas menos diversas, lo que podría afectar la creatividad o la cobertura de soluciones en tareas abiertas.
- Al ser un adaptador LoRA, su rendimiento depende completamente del modelo base; cualquier limitación de este (sesgos, alucinaciones) se mantiene.
- No se ha verificado la calidad del ajuste: el checkpoint es un paso intermedio (step 170) y podría no estar convergido.
- No se garantiza soporte para tool calling ni capacidades de agente, a pesar de que el modelo base pueda tenerlas.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/sbcho0325/EXAONE-3.5-7.8B-lg_convfin_mcq_pc_antidiverse_sft_step170
- Modelo base: https://huggingface.co/LGAI-EXAONE/EXAONE-3.5-7.8B-Instruct
- Repositorio oficial EXAONE 3.5 (GitHub): https://github.com/LG-AI-EXAONE/EXAONE-3.5
- Cuantizaciones GGUF del modelo base: https://huggingface.co/LGAI-EXAONE/EXAONE-3.5-7.8B-Instruct-GGUF
- Página en Ollama: https://ollama.com/library/exaone3.5:7.8b
