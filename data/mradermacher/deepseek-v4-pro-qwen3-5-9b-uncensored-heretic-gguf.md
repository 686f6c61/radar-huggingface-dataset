# mradermacher/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic-GGUF

## Resumen

DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic es un modelo de lenguaje de aproximadamente 9.200 millones de parametros, distribuido en formato GGUF por el usuario mradermacher a partir del modelo base xtools-at/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic. El nombre compone varias referencias: una destilacion de conocimiento de la familia DeepSeek, una arquitectura derivada de Qwen 3.5 y un proceso de "abliteration" (eliminacion de rechazos) que da lugar a la variante marcada como "uncensored/heretic". La ficha que nos ocupa es una repackaging de cuantizaciones estaticas, no un entrenamiento original.

El modelo resuelve el problema de desplegar en hardware modesto un modelo de ~9B con capacidades de razonamiento, matematicas, STEM, uso de herramientas y function calling, manteniendo el multilingueismo en ingles, chino, coreano, japones, espanol y ruso. Su interes actual radica en que ofrece, en un unico paquete GGUF, un abanico amplio de cuantizaciones (desde Q2_K de 4,0 GB hasta f16 de 18,5 GB) listas para llama.cpp y derivados, lo que facilita su evaluacion rapida en entornos de desarrollo.

La licencia Apache 2.0 y el formato GGUF lo hacen especialmente atractivo para experimentacion local y para pipelines que requieran un modelo sin filtros de rechazo, aunque esa misma caracteristica implica riesgos de seguridad que deben gestionarse en produccion. El repositorio acumula cerca de 800.000 descargas, lo que sugiere una adopcion notable dentro de la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only derivado de Qwen 3.5 (tags: qwen3_5, reasoning, distillation, mtp) |
| Parametros totales | 9.197.093.888 (~9,2B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16; mmproj en Q8_0 y f16 |
| Idiomas soportados | en, zh, ko, ja, es, ru |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo de cuantizaciones); el modelo base en safetensors |
| Tamano del repo | 85,1 GB |
| Pipeline | no disponible |
| Fecha de creacion | 2026-11-12 |

## Arquitectura y entrenamiento

La informacion disponible en la model card no detalla la arquitectura interna mas alla de las etiquetas: se trata de un transformer decoder-only asociado a la familia Qwen 3.5, con tecnicas de destilacion desde DeepSeek (tag "distillation", "deepseek"), entrenamiento supervisado (sft), aprendizaje por refuerzo (rl, gspo) y soporte de multi-token prediction (mtp). El tag "reasoning" sugiere un modo de razonamiento extendido, aunque no se especifica su funcionamiento ni la longitud de cadena de pensamiento.

No se han publicado en la informacion proporcionada datos sobre el numero de tokens de entrenamiento, la composicion del dataset, el proceso de RLHF/DPO ni innovaciones tecnicas concretas (atencion lineal, decodificacion especulativa, etc.). El proceso "heretic/abliterated" implica una modificacion de los pesos orientada a eliminar el comportamiento de rechazo, pero no se documenta la metodologia exacta empleada por el autor original (xtools-at).

## Capacidades

- Generacion de texto conversacional multi-turno en seis idiomas (en, zh, ko, ja, es, ru).
- Razonamiento explicito (tag "reasoning") y resolucion de problemas matematicos y STEM.
- Generacion y comprension de codigo, con soporte para function calling y tool use.
- Capacidades multimodales: el repositorio incluye ficheros mmproj (Q8_0 y f16), lo que indica soporte de entrada de imagen en el modelo base.
- Modo "uncensored/abliterated": responde sin los rechazos tipicos de los modelos alineados.
- Compatibilidad con endpoints (tag "endpoints_compatible") y con text-generation-inference.
- Soporte de agentes y razonamiento multi-paso derivado del entrenamiento con RL (gspo).

## Casos de uso

- Evaluacion local de modelos de razonamiento: gracias a las cuantizaciones Q4_K_M (5,9 GB) y Q5_K_M (6,7 GB), se puede ejecutar en una GPU de consumo para comparar su desempeno en matematicas y STEM frente a otros modelos de ~9B.
- Generacion de codigo en pipelines de CI/CD: el soporte de tool calling y function calling permite integrarlo en flujos que invocan APIs o ejecutan comandos, con cuantizacion Q6_K para mayor fidelidad.
- Asistente multilingue para atencion al cliente: cubre espanol, ingles, chino, coreano, japones y ruso, lo que lo hace util en entornos con usuarios internacionales, aunque el contexto maximo no esta documentado.
- Analisis de documentos con imagen: el fichero mmproj permite alimentar capturas o diagramas junto con texto para tareas de extraccion o descripcion, usando llama.cpp con soporte multimodal.
- Investigacion sobre alineacion y seguridad: la variante "abliterated" es un objeto de estudio para analizar como la eliminacion de rechazos afecta a la utilidad y al riesgo en dominios sensibles.
- Prototipado de agentes autonomos: el entrenamiento con RL y gspo, junto con el modo reasoning, lo hace adecuado para tareas de planificacion multi-paso en entornos controlados.
- Despliegue en dispositivos con poca VRAM: la cuantizacion Q2_K (4,0 GB) permite ejecutarlo en GPUs de 6-8 GB o incluso en CPU, a costa de perdida de calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (incluye overhead de contexto, orientativo):
  - Q2_K (4,0 GB): ~5-6 GB.
  - Q3_K_M (4,8 GB): ~6-7 GB.
  - Q4_K_M (5,9 GB): ~7-8 GB.
  - Q5_K_M (6,7 GB): ~8-9 GB.
  - Q6_K (7,7 GB): ~9-10 GB.
  - Q8_0 (9,9 GB): ~11-12 GB.
  - f16 (18,5 GB): ~20-21 GB.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 para cuantizaciones Q4-Q8; A100/H100 solo necesarias para f16 o para servir muchas peticiones concurrentes.
- Cabe en GPU de consumo: si, desde Q2_K en adelante; Q4_K_M es el punto de equilibrio recomendado por el autor.
- Opciones de despliegue: llama.cpp, Ollama (importando el GGUF), LM Studio, text-generation-inference (con backend compatible), vLLM (soporte GGUF limitado), y servidores basados en llama-cpp-python.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic (GGUF) | ~9,2B | no disponible | Apache 2.0 | GGUF | Variante abliterated, 6 idiomas, multimodal via mmproj |
| Qwen 3.5 9B (base) | ~9B | no disponible | Apache 2.0 | safetensors/GGUF | Modelo original sin abliteration; contexto no confirmado |
| DeepSeek-V4-Pro (destilado) | no disponible | no disponible | no disponible | no disponible | Fuente de la destilacion; sin datos publicos en esta ficha |
| Llama 3.1 8B Instruct | 8B | 128K | Llama 3.1 Community | safetensors/GGUF | Alternativa ampliamente soportada, pero con filtros de rechazo |

La comparativa se limita a lo que la informacion disponible permite; no se dispone de datos de rendimiento para contrastar calidad entre estos modelos.

## Limitaciones y advertencias

- Modelo "uncensored/abliterated": no aplica los rechazos habituales de seguridad, por lo que puede generar contenido danino, ilegal o sesgado sin filtro. No apto para produccion orientada al publico sin una capa de moderacion externa.
- Riesgo elevado de alucinacion, especialmente en cuantizaciones bajas (Q2_K, Q3_K_S) y en dominios fuera de matematicas/STEM.
- Longitud de contexto no documentada: no se puede garantizar el manejo de conversaciones o documentos largos.
- Cobertura multilingue limitada a seis idiomas; no se garantiza calidad en otros.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias sobre el comportamiento del modelo modificado.
- El proceso de abliteration puede degradar capacidades de razonamiento o coherencia en comparacion con el modelo base; no hay benchmarks que lo cuantifiquen.
- El repositorio es una repackaging de cuantizaciones; los errores de conversion o de pesos deben atribuirse al autor original del modelo base.
- El tag "heretic" y la ausencia de pipeline declarado implican que la integracion con frameworks de alto nivel (p.ej., transformers pipelines) puede requerir configuracion manual.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic-GGUF
- Modelo base: https://huggingface.co/xtools-at/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic-i1-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic-GGUF
- README de referencia para GGUF: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico de calidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
