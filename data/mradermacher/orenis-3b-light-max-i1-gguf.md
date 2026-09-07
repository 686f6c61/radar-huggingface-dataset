# mradermacher/Orenis-3B-Light-Max-i1-GGUF

## Resumen

Este repositorio contiene una version cuantizada en GGUF del modelo Orenis-3B-Light-Max, desarrollado por RandomFrontlines/Orencraft Labs. La cuantizacion ha sido realizada por mradermacher utilizando importance matrix (i1), y esta pensada para ejecutar el modelo en local con llama.cpp o herramientas compatibles. El modelo base tiene 3.085.938.688 parametros y se distribuye bajo licencia Apache 2.0. Las etiquetas del modelo indican capacidades de tool use, search grounding y anti-sycophancy, aunque no se aportan detalles tecnicos sobre el entrenamiento.

La relevancia de este modelo radica en su tamano compacto y en su orientacion a agentes y busqueda con grounding. Al estar disponible en formato GGUF, puede desplegarse en hardware modesto, incluyendo GPUs de consumo y CPU, sin necesidad de infraestructura de servidores grandes. Esto lo hace util para prototipado rapido, aplicaciones de edge y entornos donde se requiera control sobre el despliegue.

No se especifican la longitud de contexto, la arquitectura interna ni los datos de entrenamiento en la informacion proporcionada. Por tanto, cualquier evaluacion de capacidades debe basarse en pruebas propias antes de usar el modelo en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (el modelo base se publica como transformers, sin detalles de arquitectura) |
| Parametros totales | 3.085.938.688 (3B) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Cuantizaciones i1/imatrix: IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K_S, Q2_K, IQ3_XXS, IQ3_XS, Q3_K_S, IQ3_S, IQ3_M, Q3_K_M, Q3_K_L, IQ4_XS, IQ4_NL, Q4_0, Q4_K_S, Q4_K_M, Q4_1, Q5_K_S, Q5_K_M, Q6_K. Incluye fichero imatrix. |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones i1/imatrix; existe una version estatica en el repositorio Orenis-3B-Light-Max-GGUF) |

## Arquitectura y entrenamiento

El modelo base Orenis-3B-Light-Max tiene 3.085.938.688 parametros y se publica originalmente en formato safetensors. La version GGUF de mradermacher aplica cuantizacion con importance matrix (i1), una tecnica que intenta preservar la calidad del modelo en cuantizaciones agresivas, especialmente en los niveles mas bajos como IQ1 e IQ2.

No se proporcionan detalles sobre la arquitectura interna (numero de capas, dimensiones, tipo de atencion), el dataset de entrenamiento, el numero de tokens, la composicion del corpus ni el proceso de alineacion (RLHF, DPO, etc.). Las etiquetas del modelo base sugieren que ha sido afinado para uso de herramientas, grounding de busqueda y anti-sycophancy, pero no hay documentacion tecnica que respalde estas afirmaciones.

## Capacidades

- Generacion de texto en ingles, con orientacion conversacional segun las etiquetas del modelo base.
- Tool use / function calling: el tag `tool-use` indica soporte para invocar herramientas o funciones, aunque no se especifica el formato exacto.
- Search grounding: el tag `search-grounding` sugiere capacidad para integrar resultados de busqueda en las respuestas, util en pipelines de RAG o agentes de busqueda.
- Anti-sycophancy: el tag `anti-sycophancy` indica que el modelo ha sido disenado para resistir sesgos de complacencia con el usuario.
- Capacidades multilingues: no disponibles; el modelo solo declara ingles (`en`).
- Capacidades multimodales: no disponibles; no se indica soporte de vision, audio u otras modalidades.
- No se indican capacidades de razonamiento explicito, thinking mode ni soporte de codigo o matematicas mas alla de lo que pueda derivarse del entrenamiento generico.

## Casos de uso

- Asistente de soporte tecnico en ingles: el modelo puede gestionar conversaciones multi-turno en un chat de atencion al cliente. Su caracteristica anti-sycophancy puede resultar util para evitar respuestas excesivamente complacientes y mantener un tono mas directo.
- Agente de busqueda con grounding: gracias al tag `search-grounding`, puede integrarse en un pipeline RAG que recupera documentos o resultados web y los ancla a la respuesta. Es adecuado para responder preguntas sobre informacion actualizada o especifica.
- Automatizacion de tareas mediante tool calling: en un entorno de agente, el modelo puede invocar herramientas como calculadoras, APIs internas o bases de datos. Su tamano de 3B permite ejecutarlo en un servidor modesto sin necesidad de GPUs grandes.
- Prototipado rapido de agentes: al ser un modelo pequeno con soporte de herramientas, permite iterar rapidamente en la logica de agentes y en la definicion de funciones. Las cuantizaciones Q4_K_S o Q4_K_M ofrecen un equilibrio razonable entre calidad y uso de memoria.
- Ejecucion en dispositivos de borde: con pesos de aproximadamente 2 GB en Q4_K_M, el modelo puede ejecutarse en una GPU de consumo o en CPU con llama.cpp. Esto lo hace adecuado para aplicaciones offline en ingles, como asistentes locales o sistemas embebidos.
- Analisis de conversaciones con sesgo reducido: la caracteristica anti-sycophancy puede aprovecharse en sistemas que necesitan respuestas honestas y no complacientes, como revisiones de calidad, evaluacion de respuestas o analisis de interacciones.
- Educacion y demostraciones de LLMs: por su tamano y disponibilidad en GGUF, es util para ensenar conceptos de tool use, grounding y cuantizacion en cursos o talleres, sin necesidad de infraestructura costosa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye puntuaciones de MMLU, HumanEval, GSM8K ni otros benchmarks comparables. Tampoco se aportan mediciones de rendimiento de inferencia, latencia o throughput.

## Requisitos de hardware

- VRAM estimada para inferencia, a partir del tamano de los ficheros de cuantizacion (estimacion orientativa, sin contar overhead de KV cache):
  - Q2_K (1.4 GB): ~2.5 GB de VRAM con contexto corto.
  - Q4_K_S (1.9 GB): ~3.0 GB de VRAM.
  - Q4_K_M (2.0 GB): ~3.0-3.5 GB de VRAM.
  - Q5_K_M (2.3 GB): ~3.5-4.0 GB de VRAM.
  - Q6_K (2.6 GB): ~4.0-4.5 GB de VRAM.
- GPU recomendadas: RTX 3060 12GB, RTX 4060 8GB, RTX 4070, RTX 4090. Tambien puede ejecutarse en CPU con llama.cpp para usos no interactivos.
- Si cabe en GPU de consumo: si, con cuantizaciones Q4 o inferiores en GPUs de 6-8GB, como RTX 2060 6GB, RTX 3060 12GB o RTX 4060 8GB.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, y en Python con bindings como llama-cpp-python. No se indica soporte oficial para vLLM o TGI.
- Latencia y throughput estimados: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye datos de modelos comparables ni resultados de benchmarks que permitan elaborar una comparativa fiable. No se pueden aportar nombres concretos de alternativas sin riesgo de introducir datos no verificados.

## Limitaciones y advertencias

- Sesgos conocidos: no hay evaluaciones publicadas de sesgos. El modelo solo declara ingles, lo que limita su uso a contextos anglofonos.
- Riesgo de alucinacion: como cualquier LLM, puede generar contenido falso. Al no haber benchmarks publicados, el riesgo no esta cuantificado.
- Limitaciones de contexto o idioma: la longitud de contexto no esta especificada, por lo que no se puede asumir soporte para contextos largos. El idioma soportado es unicamente ingles.
- Restricciones de licencia: el repositorio GGUF se distribuye bajo Apache 2.0, que permite uso comercial. No obstante, se debe revisar la licencia del modelo base original para confirmar que no existen restricciones adicionales.
- Capacidades no verificadas: las etiquetas `tool-use`, `search-grounding` y `anti-sycophancy` provienen del autor del modelo base. No hay documentacion tecnica, ejemplos de uso ni evaluaciones que confirmen estas capacidades. Es necesario validar el comportamiento con pruebas propias antes de usarlo en produccion.
- Cuantizaciones agresivas: los niveles mas bajos (IQ1, IQ2) degradan significativamente la calidad del modelo. Se recomienda usar Q4_K_S, Q4_K_M o superiores para tareas que requieran una calidad aceptable.
- Falta de informacion de entrenamiento: al no conocerse el dataset ni el proceso de alineacion, no se puede evaluar la robustez frente a jailbreaks, inyecciones de prompts o ataques adversariales.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Orenis-3B-Light-Max-i1-GGUF
- Modelo base: https://huggingface.co/RandomFrontlines/Orenis-3B-Light-Max
- Version estatica GGUF: https://huggingface.co/mradermacher/Orenis-3B-Light-Max-GGUF
- Pagina de solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Perfil de mradermacher en Hugging Face: https://huggingface.co/mradermacher/models
