# mradermacher/Tenet-8B-Qwen3-Unslop-v2-i1-GGUF

## Resumen

Tenet-8B-Qwen3-Unslop-v2-i1-GGUF es la version cuantizada en formato GGUF del modelo Tenet-8B-Qwen3-Unslop-v2, desarrollado originalmente por mr-andrey-isachenko y cuantizado por mradermacher. Se trata de un modelo de 8.190.735.360 parametros construido sobre la base de Qwen3, orientado a razonamiento (reasoning/thinking), uso de herramientas (tool-use), codigo y comportamiento agentico, con un proceso de "unslop" y "abliteration" que busca reducir el estilo de respuesta excesivamente generico y eliminar rechazos de contenido (uncensored).

La relevancia de esta publicacion radica en que ofrece el modelo en una amplia gama de cuantizaciones GGUF (desde IQ1_S de 2,2 GB hasta Q6_K de 6,8 GB), lo que permite desplegarlo en hardware de consumo y en entornos con VRAM limitada, manteniendo las capacidades de razonamiento y tool calling del modelo original. El repositorio incluye tambien un fichero imatrix para generar cuantizaciones propias.

La licencia es Apache 2.0 y el autor original declara soporte para FP8, vLLM, OpenRouter y entrenamiento mediante GRPO. No obstante, la informacion disponible sobre benchmarks, idiomas soportados y detalles exactos de entrenamiento es limitada, por lo que varios campos de esta ficha se marcan como "no disponible".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3); detalles exactos no disponibles |
| Parametros totales | 8.190.735.360 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF i1 (imatrix): IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K_S, Q2_K, IQ3_XXS, IQ3_XS, Q3_K_S, IQ3_S, IQ3_M, Q3_K_M, Q3_K_L, IQ4_XS, Q4_0, IQ4_NL, Q4_K_S, Q4_K_M, Q4_1, Q5_K_S, Q5_K_M, Q6_K; disponibles tambien quants estaticos en el repo hermano |
| Idiomas soportados | en (segun la model card); resto no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizado); el modelo base en safetensors |

## Arquitectura y entrenamiento

El modelo base es Tenet-8B-Qwen3-Unslop-v2, construido sobre la familia Qwen3, lo que implica una arquitectura transformer con atencion por capas y, presumiblemente, soporte de modo "thinking" y tool calling propios de Qwen3. El autor original aplica un proceso de "unslop" (eliminacion de respuestas genericas y de estilo sobreajustado) y "abliteration" (eliminacion de direcciones de rechazo en el espacio de activaciones), lo que resulta en un modelo "uncensored" orientado a tareas agenticas y de codigo.

Segun las etiquetas de la model card, el entrenamiento incluye GRPO (Group Relative Policy Optimization), una tecnica de aprendizaje por refuerzo, y el modelo esta pensado para despliegue en FP8 y vLLM, asi como su uso en OpenRouter. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni los detalles exactos del pipeline de RLHF/DPO. La cuantizacion realizada por mradermacher es de tipo "i1" con fichero imatrix, lo que suele mejorar la calidad de las cuantizaciones de baja precision respecto a las estaticas.

## Capacidades

- Generacion de texto conversacional en ingles.
- Razonamiento explicito (modo thinking) heredado de Qwen3.
- Generacion de codigo y tareas de programacion.
- Tool calling / function calling y uso agentico de herramientas.
- Razonamiento multi-paso orientado a agentes.
- Comportamiento "uncensored" (sin rechazos por contenido) gracias a la abliteration.
- Compatibilidad con despliegue en vLLM (formato FP8) y en OpenRouter.
- Capacidades multilingues: solo se declara ingles; el resto no disponible.

## Casos de uso

- Agentes de codigo en local: el modelo puede ejecutarse con llama.cpp u Ollama en una estacion de trabajo con GPU de consumo y utilizarse para autocompletar, refactorizar y generar tests dentro de un pipeline de CI/CD, gracias a su soporte de tool calling.
- Asistente de razonamiento paso a paso: su modo thinking permite descomponer problemas matematicos o logicos en pasos intermedios, util para herramientas de analisis o tutoria tecnica.
- Despliegue en entornos con VRAM limitada: las cuantizaciones IQ2/IQ3 (2,6-4,0 GB) permiten ejecutar el modelo en GPUs de 4-6 GB o incluso en CPU con llama.cpp, lo que facilita prototipado en portatiles.
- Automatizacion de tareas agenticas: con tool calling y contexto conversacional, puede orquestar llamadas a APIs y ejecutar flujos multi-paso en entornos de investigacion.
- Generacion de contenido sin filtros: el caracter uncensored lo hace adecuado para investigacion en seguridad, red teaming y estudio de sesgos, donde se necesita un modelo sin rechazos.
- Servicio de inferencia en produccion: al estar disponible en FP8 y ser compatible con vLLM, puede servirse con alto throughput en GPUs como A100 o H100 para aplicaciones de chat o generacion de codigo.
- Experimentacion con cuantizaciones: el fichero imatrix y la amplia gama de quants permiten comparar calidad y velocidad en distintos hardware para elegir el punto optimo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin overhead de contexto):
  - IQ1_S (2,2 GB): ~2,5-3 GB.
  - IQ2_M (3,2 GB): ~3,5-4 GB.
  - IQ3_M (4,0 GB): ~4,5-5 GB.
  - Q4_K_M (5,1 GB): ~5,5-6,5 GB.
  - Q5_K_M (6,0 GB): ~6,5-7,5 GB.
  - Q6_K (6,8 GB): ~7,5-8,5 GB.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 para cuantizaciones Q4-Q6; A100/H100 para FP8 con vLLM en produccion.
- Cabe en GPU de consumo: si, desde GPUs de 4 GB con IQ2/IQ3 hasta 8 GB con Q6_K.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, vLLM (para el modelo base en FP8), TGI (no confirmado para GGUF).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Tenet-8B-Qwen3-Unslop-v2-i1-GGUF | 8,19 B | no disponible | Apache 2.0 | GGUF | Uncensored, thinking, tool-use |
| Qwen3-8B (base) | ~8 B | no disponible en esta ficha | Apache 2.0 | safetensors/GGUF | Modelo original sin unslop/abliteration |
| Llama 3.1 8B Instruct | 8 B | 128k (segun documentacion publica) | Llama 3.1 Community | safetensors/GGUF | Referencia generalista; datos de esta ficha no verificados |
| Mistral 7B Instruct | 7,3 B | 32k (segun documentacion publica) | Apache 2.0 | safetensors/GGUF | Alternativa ligera; datos no verificados en esta ficha |

Nota: los datos de los modelos comparativos no provienen de la informacion proporcionada y deben verificarse en sus fichas oficiales; se incluyen solo como referencia de categoria.

## Limitaciones y advertencias

- El proceso de abliteration elimina rechazos de contenido, lo que puede producir respuestas inapropiadas, daninas o inexactas; no recomendado para aplicaciones orientadas al usuario sin moderacion adicional.
- Riesgo de alucinacion inherente a los modelos de 8B, especialmente en tareas de conocimiento factual.
- Solo se declara soporte de ingles; el rendimiento en castellano u otros idiomas no esta verificado.
- La longitud de contexto no se especifica en la informacion disponible, lo que impide garantizar conversaciones de contexto largo.
- Las cuantizaciones de baja precision (IQ1, IQ2, Q2_K) degradan notablemente la calidad; el autor las etiqueta como "for the desperate" o "very low quality".
- Aunque la licencia es Apache 2.0, el uso comercial del modelo "uncensored" puede conllevar riesgos legales y reputacionales; se recomienda auditoria previa.
- No hay benchmarks publicados que permitan validar el rendimiento frente a alternativas.
- El repositorio tiene pocas descargas (734) y cero likes, lo que sugiere poca validacion por parte de la comunidad.

## Enlaces

- Repositorio Hugging Face (GGUF i1): https://huggingface.co/mradermacher/Tenet-8B-Qwen3-Unslop-v2-i1-GGUF
- Modelo base: https://huggingface.co/mr-andrey-isachenko/Tenet-8B-Qwen3-Unslop-v2
- Quants estaticos: https://huggingface.co/mradermacher/Tenet-8B-Qwen3-Unslop-v2-GGUF
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#Tenet-8B-Qwen3-Unslop-v2-i1-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico de calidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e394
