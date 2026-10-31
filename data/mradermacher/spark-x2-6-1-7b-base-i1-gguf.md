# mradermacher/Spark-X2.6-1.7B-Base-i1-GGUF

## Resumen

Spark-X2.6-1.7B-Base-i1-GGUF es una colección de cuantizaciones en formato GGUF del modelo base Spark-X2.6-1.7B-Base, desarrollado por XHToken y cuantizado por el usuario mradermacher, un cuantizador muy activo en la comunidad de Hugging Face. El repositorio ofrece más de 20 variantes de cuantización con matrices de importancia (imatrix), que reducen el tamaño del modelo desde aproximadamente 0,6 GB hasta 1,5 GB, permitiendo ejecutarlo en hardware muy modesto, incluidas CPU y GPUs de consumo.

El modelo original es un modelo de lenguaje base (no instruido) de 1.707.657.216 parámetros (aproximadamente 1,7B), entrenado en inglés y chino. Al tratarse de un modelo base, no está alineado para seguir instrucciones ni para conversación, por lo que su uso principal es la investigación, la experimentación con fine-tuning y la evaluación de capacidades de modelos pequeños. La relevancia de esta ficha radica en la disponibilidad de cuantizaciones imatrix de alta calidad, que facilitan su despliegue local con llama.cpp, Ollama u otras herramientas compatibles con GGUF.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (familia sparkx2_5 según tags) |
| Parametros totales | 1.707.657.216 |
| Parametros activos | no disponible (no hay indicios de que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K_S, Q2_K, IQ3_XXS, IQ3_XS, Q3_K_S, IQ3_S, IQ3_M, Q3_K_M, Q3_K_L, IQ4_XS, Q4_0, Q4_K_S, IQ4_NL, Q4_K_M, Q4_1, Q5_K_S, Q5_K_M, Q6_K |
| Idiomas soportados | inglés, chino |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones imatrix; también existe versión de cuants estáticos) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo original Spark-X2.6-1.7B-Base. Los tags del repositorio indican la familia "sparkx2_5", lo que sugiere que pertenece a la segunda generación de la serie Spark de XHToken, pero no se han publicado datos sobre número de capas, dimensiones ocultas, mecanismo de atención o tipo de codificación posicional. Tampoco se dispone de información sobre el dataset de entrenamiento, el número de tokens ni el uso de técnicas de alineación como RLHF o DPO, algo coherente con que se trate de un modelo base sin ajuste por instrucciones.

En cuanto al trabajo de cuantización, este repositorio emplea cuantizaciones con matriz de importancia (imatrix), una técnica popularizada por ikawrakow en llama.cpp que calcula estadísticas de activación sobre un corpus de calibración para asignar mejor la precisión en los pesos más relevantes. Según el propio autor, los cuants IQ (importance) suelen superar en calidad a los cuants estáticos de tamaño similar, por lo que se recomienda preferir, por ejemplo, IQ3_S frente a Q3_K o IQ4_XS frente a IQ4_NL. La variante recomendada por el autor por equilibrio entre tamaño, velocidad y calidad es i1-Q4_K_S (1,1 GB), y la recomendada por velocidad es i1-Q4_K_M (1,2 GB).

## Capacidades

- Generación de texto en inglés y chino: al ser un modelo base, genera continuaciones de texto sin formato de instrucciones.
- Base para fine-tuning: su tamaño de 1,7B lo hace adecuado para ajuste fino (SFT, DPO) en hardware de consumo.
- Compatibilidad con el ecosistema GGUF: funciona con llama.cpp, Ollama, LM Studio, KoboldCpp y otros runtimes.
- Etiquetado como "conversational" en el repositorio, aunque al ser un modelo base no está alineado para chat.
- No hay evidencia de capacidades de visión, audio, tool calling ni thinking mode en la información disponible.

## Casos de uso

- Experimentación con modelos base: estudiar el comportamiento de un modelo de 1,7B sin alineación, útil para investigación sobre emergencia de capacidades o análisis de tokenizer.
- Fine-tuning en hardware de consumo: al ocupar entre 0,6 y 1,5 GB en formato GGUF, permite hacer pruebas de LoRA o QLoRA en GPUs de 8-12 GB de VRAM.
- Despliegue en dispositivos edge: las cuantizaciones IQ2 e IQ3 (0,7-1,0 GB) permiten ejecutar el modelo en portátiles sin GPU dedicada o en SBCs tipo Raspberry Pi con suficiente RAM.
- Prototipado de aplicaciones bilingües inglés-chino: su entrenamiento en ambos idiomas lo hace candidato para pruebas de generación de contenido en esos dos mercados.
- Generación de texto sintético para datasets: como modelo base puede usarse para completar y expandir corpus de preentrenamiento.
- Comparativa de cuantizaciones: el repositorio incluye más de 20 variantes, ideal para medir la degradación de calidad frente al tamaño en modelos pequeños.
- Integración en pipelines locales de NLP: generación de continuaciones en procesos batch sin depender de APIs externas, gracias a la licencia Apache 2.0.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: desde aproximadamente 0,6 GB (i1-IQ1_S) hasta 1,5 GB (i1-Q6_K); con contexto y overhead del runtime, conviene contar con 2-3 GB de memoria disponible.
- GPU recomendadas: cualquier GPU moderna con 4 GB de VRAM o más ejecuta el modelo con holgura; también funciona puramente en CPU dado su tamaño reducido.
- Consumer GPUs: cabe sin problemas en RTX 3060, RTX 4060, RTX 4090 o incluso GPUs integradas modernas con memoria compartida.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), Ollama, LM Studio, KoboldCpp, text-generation-webui y cualquier runtime compatible con GGUF. No está pensado para vLLM o TGI en su formato GGUF, aunque el modelo base original en safetensors podría servirse con vLLM.
- Latencia y throughput: no disponible; dada la talla de 1,7B, se espera inferencia muy rápida incluso en CPU, con velocidades de decodificación de decenas de tokens por segundo en portátiles modernos.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Licencia | Idiomas | Notas |
|---|---|---|---|---|---|
| Spark-X2.6-1.7B-Base-i1-GGUF | 1,7B | GGUF (24 cuants imatrix) | Apache 2.0 | en, zh | Modelo base, no instruido |
| Qwen2.5-1.5B-Instruct | 1,5B | safetensors, GGUF (comunidad) | Qwen license (uso comercial condicionado) | multilingüe (29+) | Instruido, benchmarks publicados |
| Llama-3.2-1B-Instruct | 1,2B | safetensors, GGUF (comunidad) | Llama 3.2 license | multilingüe (8) | Instruido, amplio ecosistema |
| Gemma-2-2B-it | 2,6B | safetensors, GGUF (comunidad) | Gemma license | mayormente en | Instruido, buen rendimiento por tamaño |

Spark-X2.6-1.7B se diferencia de estas alternativas en que es un modelo base (no alineado) y en su enfoque bilingüe inglés-chino, mientras que Qwen2.5, Llama 3.2 y Gemma 2 ofrecen versiones instruidas listas para chat. Para uso directo en producción, las alternativas instruidas son más adecuadas; Spark-X2.6 tiene sentido como base de fine-tuning o para investigación.

## Limitaciones y advertencias

- Al ser un modelo base, no sigue instrucciones ni mantiene conversaciones de forma fiable; producirá continuaciones de texto que pueden parecer respuestas incompletas o incoherentes en contextos de chat.
- Riesgo de alucinación elevado y sin mitigación por alineación (no hay indicios de RLHF/DPO).
- Idiomas limitados a inglés y chino; el rendimiento en castellano no está documentado y probablemente sea inferior.
- Longitud de contexto no publicada, lo que dificulta planificar aplicaciones con documentos largos.
- Las cuantizaciones más agresivas (IQ1_S, IQ1_M, IQ2_XXS) degradan notablemente la calidad, como advierte el propio autor ("for the desperate", "mostly desperate"); se recomienda como mínimo IQ3 o Q4_K para uso serio.
- Licencia Apache 2.0: sin restricciones para uso comercial, pero conviene verificar la licencia del modelo base original en XHToken/Spark-X2.6-1.7B-Base.
- Documentación escasa: no hay model card detallada del modelo original con benchmarks, arquitectura ni datos de entrenamiento, lo que añade incertidumbre para evaluaciones en producción.

## Enlaces

- Repositorio de la cuantización: https://huggingface.co/mradermacher/Spark-X2.6-1.7B-Base-i1-GGUF
- Modelo base original: https://huggingface.co/XHToken/Spark-X2.6-1.7B-Base
- Cuants estáticos del mismo modelo: https://huggingface.co/mradermacher/Spark-X2.6-1.7B-Base-GGUF
- Página de descargas resumida: https://hf.tst.eu/model#Spark-X2.6-1.7B-Base-i1-GGUF
- FAQ y solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Notas de Artefact2 sobre tipos de cuantización: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa del cuantizador: https://www.nethype.de/
