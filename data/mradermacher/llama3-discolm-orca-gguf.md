# mradermacher/llama3-discolm-orca-GGUF

## Resumen

El modelo `mradermacher/llama3-discolm-orca-GGUF` es una cuantización en formato GGUF del modelo `cstr/llama3-discolm-orca`, un merge creado con `mergekit` (lazymergekit) que combina dos modelos basados en Llama 3 8B: `Locutusque/llama-3-neural-chat-v1-8b` (un fine-tuning conversacional en inglés) y `DiscoResearch/Llama3_DiscoLM_German_8b_v0.1_experimental` (un modelo experimental en alemán). El resultado es un modelo de chat de 8.030 millones de parámetros, orientado a conversación y con licencia Llama 3.

Este repositorio, publicado por el cuantizador mradermacher, ofrece 13 versiones cuantizadas (desde Q2_K hasta f16) para facilitar la ejecución en hardware variado, desde equipos de consumo hasta servidores. Es relevante para desarrolladores que buscan un modelo de chat ligero y desplegable localmente, con la flexibilidad de elegir entre distintas compensaciones de tamaño y calidad.

La cuantización estática (sin imatrix) se realizó con llama.cpp, y el autor indica que las versiones Q4_K_M y Q5_K_M son las recomendadas por equilibrio entre velocidad y calidad. No se han publicado benchmarks específicos para este merge, por lo que su rendimiento debe evaluarse empíricamente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basado en Llama 3 8B) |
| Parametros totales | 8.030.261.248 (8,03B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible (se hereda de Llama 3, probablemente 8K, sin confirmar) |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_0_4_4, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | ingles (segun metadatos; el merge incluye un componente aleman, pero no esta verificado) |
| Licencia | Llama 3 (llama3) |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo es un merge de dos modelos de 8B basados en Llama 3, combinados mediante `mergekit` con la técnica `lazymergekit`. Los modelos base son:

- `Locutusque/llama-3-neural-chat-v1-8b`: un fine-tuning de Llama 3 8B orientado a conversación y seguimiento de instrucciones en ingles.
- `DiscoResearch/Llama3_DiscoLM_German_8b_v0.1_experimental`: un modelo experimental entrenado para tareas en aleman, tambien basado en Llama 3 8B.

El merge busca combinar las capacidades conversacionales del primero con el conocimiento multilingue del segundo, aunque los metadatos del repositorio indican que el idioma principal es ingles. No se dispone de informacion sobre el dataset de entrenamiento, el numero de tokens procesados ni si se aplicaron tecnicas como RLHF o DPO. Al ser un merge, no hay un entrenamiento adicional desde cero; las capacidades son una combinacion de los modelos originales.

## Capacidades

- Generacion de texto conversacional: responde a instrucciones y mantiene dialogos multi-turno, herencia del fine-tuning neural-chat.
- Seguimiento de instrucciones: adecuado para tareas de chat, resumen y generacion de contenido breve.
- Razonamiento basico: al estar basado en Llama 3 8B, puede resolver problemas logicos y aritmeticos simples, aunque sin garantias de rendimiento especifico.
- Multilingue limitado: el componente aleman podria aportar cierta capacidad en ese idioma, pero no esta verificado y los metadatos solo listan ingles.
- No se documentan capacidades avanzadas como tool calling, function calling, modo agente, vision o audio en la informacion disponible.

## Casos de uso

- Atencion al cliente automatizada: el modelo puede gestionar conversaciones de soporte de primer nivel, respondiendo preguntas frecuentes y derivando casos complejos a humanos. Su tamano de 8B permite desplegarlo en un servidor modesto con una GPU de consumo, reduciendo costes frente a modelos mayores.
- Asistente virtual local: integrable en aplicaciones de escritorio o moviles mediante llama.cpp u Ollama, ofreciendo respuestas sin conexion a internet. Ideal para prototipos o entornos con requisitos estrictos de privacidad.
- Generacion de borradores de contenido: util para redactar emails, publicaciones en blogs o resumenes de documentos. Su naturaleza conversacional facilita iterar con prompts en lenguaje natural.
- Chatbot educativo: puede servir como tutor basico para explicar conceptos de programacion, matematicas o historia, gracias a su capacidad de seguir instrucciones y mantener contexto en dialogos cortos.
- Clasificacion y etiquetado de texto: mediante prompts adecuados, puede categorizar comentarios, tickets o articulos, aunque su rendimiento en tareas estructuradas no esta validado con benchmarks.
- Pruebas de concepto en investigacion: al ser un merge experimental, es util para explorar tecnicas de fusion de modelos y evaluar el impacto de combinar especializaciones distintas (ingles conversacional + aleman) en un mismo parametro.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye metricas de MMLU, HumanEval, GSM8K ni otras pruebas estandar. Se recomienda evaluar el modelo en el dominio de uso previsto antes de desplegarlo en produccion.

## Requisitos de hardware

- VRAM estimada segun cuantizacion (solo pesos, sin considerar cache de contexto):
  - Q2_K: 3,3 GB
  - Q3_K_M: 4,1 GB
  - Q4_K_M: 5,0 GB
  - Q5_K_M: 5,8 GB
  - Q6_K: 6,7 GB
  - Q8_0: 8,6 GB
  - f16: 16,2 GB
- GPU recomendadas: para cuantizaciones Q4 y menores, una GPU con 6-8 GB de VRAM (p. ej., RTX 3060, RTX 4060, RTX 2070) es suficiente. Para Q5 y Q6, se recomienda 8-12 GB (RTX 3080, RTX 4070). Q8_0 y f16 requieren 12 GB o mas (RTX 3090, A100).
- En CPU: las cuantizaciones Q4 y Q5 pueden ejecutarse en CPUs modernas con 16 GB de RAM, aunque con mayor latencia.
- Opciones de despliegue: llama.cpp, Ollama, GPT4All, o servidores compatibles con GGUF como text-generation-webui.
- Latencia y throughput: no se han publicado mediciones. En una GPU de gama media (RTX 3060), se espera una velocidad de 20-40 tokens/s con Q4_K_M, pero esto es una estimacion general para modelos de 8B, no un dato verificado para este merge.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| llama3-discolm-orca (este) | 8,03B | no disponible | Llama 3 | GGUF | Merge experimental, sin benchmarks publicados |
| Meta-Llama-3-8B-Instruct | 8,03B | 8K (oficial) | Llama 3 | safetensors, GGUF | Modelo base de referencia, ampliamente evaluado |
| Mistral-7B-Instruct | 7,24B | 8K (extensible a 32K) | Apache 2.0 | safetensors, GGUF | Alternativa con licencia permisiva, buen rendimiento en ingles |
| Zephyr-7B-beta | 7,24B | 8K | MIT | safetensors, GGUF | Fine-tuning de Mistral, enfocado en chat, licencia abierta |

Nota: no se dispone de datos de rendimiento comparativo (MMLU, etc.) para este merge. La comparacion se limita a caracteristicas estructurales y de licencia.

## Limitaciones y advertencias

- Al ser un merge experimental, puede presentar comportamientos inconsistentes o respuestas de menor calidad que los modelos base en tareas especificas.
- No se han publicado evaluaciones de sesgos, alucinaciones ni robustez. El riesgo de generar informacion falsa o desactualizada es inherente a los LLM de este tamano.
- La licencia Llama 3 restringe el uso comercial si el producto supera los 700 millones de usuarios mensuales, segun los terminos de Meta. Para aplicaciones empresariales, es necesario revisar el acuerdo de licencia completo.
- La longitud de contexto no esta confirmada; si se hereda de Llama 3, seria de 8K tokens, pero el proceso de merge podria alterarla. Se recomienda probar con secuencias largas antes de usarlo en produccion.
- El soporte multilingue es incierto: los metadatos solo listan ingles, y el componente aleman podria no estar correctamente integrado.
- Las cuantizaciones de baja precision (Q2_K, Q3) pueden degradar significativamente la calidad de las respuestas. Se recomienda usar Q4_K_M o superior para tareas serias.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mradermacher/llama3-discolm-orca-GGUF
- Modelo base (sin cuantizar): https://huggingface.co/cstr/llama3-discolm-orca
- Modelo componente 1: https://huggingface.co/Locutusque/llama-3-neural-chat-v1-8b
- Modelo componente 2: https://huggingface.co/DiscoResearch/Llama3_DiscoLM_German_8b_v0.1_experimental
- Guia de cuantizaciones de mradermacher (FAQ): https://huggingface.co/mradermacher/model_requests
