# mradermacher/Soonlife-Qwen3.5-9B-v2-i1-GGUF

## Resumen
Soonlife-Qwen3.5-9B-v2-i1-GGUF es la versión cuantizada en formato GGUF del modelo wonchandev/Soonlife-Qwen3.5-9B-v2, un ajuste fino orientado a conversación, RAG y tool calling en coreano. El trabajo de cuantización lo firma mradermacher, autor habitual de cuantizaciones GGUF en Hugging Face, que publica tanto cuantizaciones estáticas como cuantizaciones con imatrix (i1) para este modelo. El resultado es un conjunto de ficheros que permite ejecutar un modelo de casi 9.000 millones de parámetros en hardware de consumo mediante llama.cpp y derivados.

El modelo base parte de la familia Qwen3.5 (etiqueta qwen3_5 en la model card) y ha sido sometido a un proceso de destilación y fusión de LoRA (lora-merged) sobre un dataset propio, wonchandev/Soonlife_dataset, con un enfoque declarado en conversación, recuperación aumentada (RAG) y llamada a herramientas. La licencia es Apache 2.0, lo que facilita su uso comercial, y el idioma declarado es exclusivamente coreano (ko).

La relevancia de esta ficha radica en que permite desplegar localmente un modelo de ~9B especializado en coreano con cuantizaciones que van desde 2,8 GB (IQ1_S) hasta 7,5 GB (Q6_K), cubriendo desde GPUs de gama media hasta equipos con poca VRAM. El repositorio tiene 11.446 descargas y un tamaño total de 110,2 GB, lo que refleja el amplio abanico de cuantizaciones publicadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5, según etiqueta qwen3_5; detalles internos no disponibles) |
| Parametros totales | 8.953.803.264 (~8,95B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-IQ1_S, i1-IQ1_M, i1-IQ2_XXS, i1-IQ2_XS, i1-IQ2_S, i1-IQ2_M, i1-Q2_K_S, i1-Q2_K, i1-IQ3_XXS, i1-IQ3_XS, i1-Q3_K_S, i1-IQ3_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-Q4_0, i1-Q4_K_S, i1-IQ4_NL, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K; además de una imatrix propia |
| Idiomas soportados | coreano (ko) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones i1 con imatrix); el modelo base está en safetensors/transformers |

## Arquitectura y entrenamiento
La información disponible no detalla la arquitectura interna más allá de la etiqueta qwen3_5, que sitúa el modelo base en la familia Qwen3.5 de Alibaba. Se trata, por tanto, de un transformer decoder-only de aproximadamente 8,95 mil millones de parámetros. No se especifican número de capas, dimensión oculta, mecanismo de atención ni longitud de contexto en la documentación proporcionada.

El modelo base wonchandev/Soonlife-Qwen3.5-9B-v2 se ha entrenado mediante destilación y fusión de LoRA (lora-merged) sobre el dataset wonchandev/Soonlife_dataset, con objetivos declarados de conversación, RAG y tool calling en coreano. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron fases de RLHF o DPO. La cuantización i1 de mradermacher emplea una imatrix generada específicamente para este modelo, lo que mejora la calidad de las cuantizaciones de baja precisión respecto a las estáticas.

## Capacidades
- Generación de texto conversacional en coreano, con especialización declarada en diálogo multi-turno.
- Recuperación aumentada (RAG): el modelo está etiquetado explícitamente para RAG, por lo que se espera que maneje bien contextos con documentos recuperados.
- Tool calling / function calling: etiqueta tool-calling presente en la model card.
- Destilación: el modelo base incorpora técnicas de destilación, orientadas a mejorar la calidad con menos parámetros.
- Fusión de LoRA: los adaptadores se han integrado en los pesos finales (lora-merged), simplificando el despliegue.
- Capacidades multilingües: limitadas al coreano según la etiqueta de idioma; no se declaran otros idiomas.
- No se declaran capacidades de visión, audio ni modo thinking explícito.

## Casos de uso
- Atención al cliente en coreano: el modelo puede gestionar conversaciones multi-turno con usuarios surcoreanos, aprovechando su especialización conversacional y su entrenamiento sobre un dataset propio de diálogo. Adecuado para chatbots de soporte en producción con despliegue local.
- Asistentes RAG sobre documentación interna: al estar etiquetado para RAG, puede integrarse en pipelines de recuperación (por ejemplo, con un vector store) para responder preguntas sobre manuales, políticas o bases de conocimiento en coreano.
- Automatización con tool calling: puede invocarse desde frameworks de agentes para ejecutar funciones (consultas a APIs, operaciones CRUD, envío de correos) en flujos de trabajo empresariales en coreano.
- Despliegue en hardware de consumo: las cuantizaciones i1-Q4_K_M (5,7 GB) o i1-IQ4_XS (5,3 GB) permiten ejecutar el modelo en GPUs de 8 GB de VRAM, facilitando prototipos y demos locales sin infraestructura cloud.
- Procesamiento de texto en entornos con requisitos de privacidad: al poder ejecutarse íntegramente en local con llama.cpp u Ollama, es apto para datos sensibles que no deben salir de la organización.
- Investigación en modelos coreanos: sirve como base para experimentos de ajuste fino, evaluación de cuantizaciones o comparación con otros modelos coreanos de tamaño similar.
- Generación de contenido y resúmenes en coreano: para redacción asistida, resumen de documentos o extracción de información en aplicaciones editoriales o de análisis.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware
- VRAM estimada para inferencia (según cuantización, solo pesos):
  - i1-IQ1_S: ~2,8 GB
  - i1-IQ2_M: ~3,7 GB
  - i1-IQ3_M: ~4,5 GB
  - i1-IQ4_XS: ~5,3 GB
  - i1-Q4_K_M: ~5,7 GB
  - i1-Q5_K_M: ~6,6 GB
  - i1-Q6_K: ~7,5 GB
  - Añadir entre 1 y 2 GB adicionales para el contexto KV cache según la longitud de contexto configurada.
- GPU recomendadas:
  - RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090: todas pueden ejecutar las cuantizaciones Q4 y Q5 con contexto moderado.
  - GPUs de 8 GB (RTX 3060 Ti, RTX 4060, RTX 3070): viables con i1-IQ4_XS o i1-Q4_K_M y contexto reducido.
  - A100/H100: sobredimensionadas para este tamaño; útiles para servir muchas instancias concurrentes o contextos muy largos.
- Cabe en GPU de consumo: sí, desde GPUs de 8 GB con cuantizaciones Q4; con 4 GB solo las cuantizaciones IQ1/IQ2, con calidad degradada.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, y servidores compatibles con GGUF (endpoints_compatible según etiquetas). vLLM y TGI no soportan GGUF de forma nativa en todas sus versiones, por lo que se recomienda llama.cpp para GGUF.
- Latencia y throughput: no disponibles; dependen del hardware y de la cuantización. Como referencia cualitativa, las cuantizaciones Q4 en una RTX 4090 suelen ofrecer decenas de tokens por segundo para modelos de ~9B, pero no se aportan mediciones oficiales.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Soonlife-Qwen3.5-9B-v2-i1-GGUF (este) | ~8,95B | no disponible | coreano | Apache 2.0 | GGUF | Especializado en conversación, RAG y tool calling en coreano |
| Soonlife-Qwen3.5-9B-v2-GGUF (estático) | ~8,95B | no disponible | coreano | Apache 2.0 | GGUF | Misma base, cuantizaciones estáticas sin imatrix |
| wonchandev/Soonlife-Qwen3.5-9B-v2 (base) | ~8,95B | no disponible | coreano | Apache 2.0 | safetensors | Modelo original sin cuantizar |
| Qwen3.5-9B (genérico) | ~9B | no disponible | multilingüe | según variante | safetensors/GGUF | Modelo base de la familia; no especializado en coreano ni en RAG/tool calling |

No se dispone de datos de benchmarks que permitan comparar rendimiento entre estas alternativas.

## Limitaciones y advertencias
- Especialización exclusiva en coreano: el modelo declara únicamente el idioma ko, por lo que su rendimiento en castellano u otros idiomas será previsiblemente pobre.
- Riesgo de alucinación: como todo modelo generativo, puede inventar información, especialmente en tareas RAG si los documentos recuperados son ambiguos o insuficientes.
- Sesgos: no se documentan sesgos específicos, pero al entrenarse sobre un dataset coreano propio puede heredar sesgos culturales y lingüísticos de esa fuente.
- Contexto desconocido: no se especifica la longitud de contexto, lo que impide garantizar el comportamiento en conversaciones o documentos largos.
- Cuantizaciones de muy baja precisión (IQ1, IQ2): degradan notablemente la calidad; el propio autor las etiqueta como "for the desperate" o "very low quality". No recomendadas para producción.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las condiciones del modelo base y del dataset original por si hubiera restricciones adicionales no reflejadas en la model card.
- Sin benchmarks publicados: no hay evidencia cuantitativa de rendimiento frente a alternativas, por lo que la evaluación debe hacerse con pruebas propias.
- Fecha de creación futura (2026-11-05): dato atípico que puede indicar un error de metadatos; conviene verificar la vigencia del repositorio.

## Enlaces
- Repositorio Hugging Face: https://huggingface.co/mradermacher/Soonlife-Qwen3.5-9B-v2-i1-GGUF
- Modelo base: https://huggingface.co/wonchandev/Soonlife-Qwen3.5-9B-v2
- Cuantizaciones estáticas: https://huggingface.co/mradermacher/Soonlife-Qwen3.5-9B-v2-GGUF
- Dataset: https://huggingface.co/datasets/wonchandev/Soonlife_dataset
- Página de descargas del autor: https://hf.tst.eu/model#Soonlife-Qwen3.5-9B-v2-i1-GGUF
- README de referencia para GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Gráfico de calidad de cuantizaciones de ikawrakow: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantización del autor: https://huggingface.co/mradermacher/model_requests
