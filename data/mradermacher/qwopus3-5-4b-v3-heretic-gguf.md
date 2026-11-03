# mradermacher/Qwopus3.5-4B-v3-heretic-GGUF

## Resumen

Qwopus3.5-4B-v3-heretic-GGUF es la distribucion en formato GGUF del modelo tvall43/Qwopus3.5-4B-v3-heretic, un fine-tuning de la familia Qwen 3.5 con 4.205.751.296 parametros (aproximadamente 4,2 mil millones). El modelo ha sido sometido a un proceso de "abliteration" o "decensoring" (etiquetado como heretic, uncensored, abliterated), que consiste en eliminar o reducir los mecanismos de rechazo y alineacion del modelo base, de ahi el sufijo "heretic". El autor de la cuantizacion es mradermacher, un conocido publicador de quants GGUF en HuggingFace.

El modelo esta especializado en razonamiento con cadena de pensamiento (chain-of-thought) y programacion competitiva, segun los tags declarados por el autor. Soporta tres idiomas: ingles, chino y coreano. La licencia es Apache 2.0, lo que permite uso comercial sin restricciones adicionales significativas. El repositorio ocupa 38,9 GB e incluye 11 cuantizaciones distintas, desde Q2_K (2,0 GB) hasta f16 (8,5 GB).

La relevancia de esta ficha radica en que se trata de un modelo pequeno (4B) con capacidades de razonamiento explicito, empaquetado en GGUF para inferencia local en hardware de consumo, pero con la advertencia importante de que ha sido deliberadamente "desbloqueado" de sus salvaguardas originales, lo que plantea consideraciones de seguridad y gobernanza para despliegues en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen 3.5), detalles especificos no disponibles |
| Parametros totales | 4.205.751.296 (~4,2B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 (ademas de variantes i1 con imatrix en repo separado) |
| Idiomas soportados | en, zh, ko |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (tambien disponible el modelo base en transformers/safetensors) |

## Arquitectura y entrenamiento

El modelo base es tvall43/Qwopus3.5-4B-v3-heretic, un fine-tuning de Qwen 3.5 de 4,2B parametros. La arquitectura subyacente es un transformer decoder-only, segun la convencion de la familia Qwen. Los tags del modelo indican que se ha entrenado con enfasis en razonamiento (reasoning), cadena de pensamiento (chain-of-thought) y programacion competitiva (competitive-programming), lo que sugiere un dataset de ajuste orientado a problemas algoritmicos y tareas de razonamiento multi-paso.

El aspecto tecnico mas destacable es el proceso de abliteration/decensoring aplicado por el autor del modelo base (tvall43), que modifica los pesos para suprimir las direcciones de activacion asociadas a comportamientos de rechazo. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion exacta del dataset, ni si se emplearon tecnicas de RLHF o DPO. Tampoco se documenta ninguna innovacion arquitectonica adicional (atencion lineal, decodificacion especulativa, SSM hibrido) en la informacion proporcionada.

## Capacidades

- Generacion de texto y razonamiento explicito con cadena de pensamiento (chain-of-thought), segun los tags del autor.
- Razonamiento orientado a programacion competitiva y resolucion de problemas algoritmicos.
- Capacidades multilingues limitadas a ingles, chino y coreano.
- Comportamiento "uncensored": el proceso de abliteration reduce los rechazos del modelo base ante peticiones que este normalmente declinaria.
- Compatibilidad con endpoints (tag endpoints_compatible), lo que sugiere soporte para APIs tipo OpenAI.
- Formato conversacional (tag conversational).
- No se documenta soporte explicito de tool calling, function calling, agentes, vision, audio ni otras modalidades en la informacion disponible.

## Casos de uso

- Razonamiento local en hardware de consumo: con cuantizaciones Q4_K_M (2,8 GB) o Q5_K_M (3,2 GB), el modelo cabe en GPUs de 6-8 GB de VRAM, lo que permite desplegar razonamiento chain-of-thought en estaciones de trabajo sin GPU dedicada de datacenter.
- Generacion de codigo y resolucion de problemas algoritmicos: el entrenamiento orientado a programacion competitiva lo hace adecuado para asistir en la resolucion de ejercicios de algoritmia, generacion de soluciones en competiciones o explicacion de complejidad computacional.
- Investigacion sobre alineacion y seguridad: al ser un modelo abliterated, sirve como caso de estudio para medir como el decensoring afecta a la tasa de rechazo, la calidad del razonamiento y la tendencia a generar contenido danino, en entornos controlados de evaluacion.
- Prototipado de asistentes conversacionales multilingues (en/zh/ko) en local, usando llama.cpp u Ollama, sin depender de APIs externas.
- Analisis de textos tecnicos en ingles o chino con razonamiento paso a paso, aprovechando la cadena de pensamiento para tareas de depuracion o explicacion de codigo.
- Despliegue en pipelines de CI/CD para revision automatizada de parches o generacion de tests, gracias al formato GGUF y a la compatibilidad con endpoints, aunque con la advertencia de que el decensoring puede producir salidas no filtradas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2,6-3,0 GB para Q4_K_M, 3,0-3,5 GB para Q5_K_M, 3,5-4,0 GB para Q6_K y 4,5-5,0 GB para Q8_0 (incluyendo overhead de contexto).
- GPU recomendadas: cualquier GPU consumer con 6 GB o mas de VRAM (RTX 3060, RTX 4060, RTX 4070, RTX 4090) puede ejecutar las cuantizaciones Q4-Q8. Para f16 (8,5 GB) se recomienda 10-12 GB de VRAM (RTX 3080 12GB, RTX 4070 Ti, A10).
- Cabe en GPU consumer: si, en la mayoria de GPUs modernas con 6 GB o mas. Las cuantizaciones Q2_K y Q3_K caben incluso en GPUs de 4 GB.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, y servidores compatibles con GGUF. El tag endpoints_compatible sugiere integracion con APIs tipo OpenAI. Tambien se puede usar vLLM o TGI con el modelo base en safetensors (no con GGUF directamente).
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwopus3.5-4B-v3-heretic (este) | ~4,2B | no disponible | Apache 2.0 | GGUF, safetensors | Fine-tuning Qwen 3.5 con abliteration, enfocado a razonamiento y programacion competitiva |
| Qwen 3.5 4B (base oficial) | ~4B | no disponible | Apache 2.0 (segun familia Qwen) | safetensors, GGUF | Modelo original con salvaguardas intactas; referencia de comparacion natural |
| Llama 3.2 3B | ~3,2B | 128K (segun ficha oficial) | Llama 3.2 Community License | GGUF, safetensors | Alternativa de tamano similar con licencia mas restrictiva |
| Phi-3.5-mini | ~3,8B | 128K (segun ficha oficial) | MIT | GGUF, safetensors | Alternativa pequena con enfoque en razonamiento |

La comparacion con el Qwen 3.5 4B base es la mas directa: este modelo anade el decensoring y el ajuste para programacion competitiva, a costa de perder las salvaguardas de alineacion. Frente a Llama 3.2 3B y Phi-3.5-mini, la diferencia principal es la licencia (Apache 2.0 frente a licencias con restricciones) y el enfoque declarado en razonamiento algoritmico.

## Limitaciones y advertencias

- El proceso de abliteration elimina o reduce los rechazos de seguridad, lo que aumenta el riesgo de generar contenido danino, sesgado o inapropiado. No es recomendable para aplicaciones de cara al publico sin filtros adicionales.
- Riesgo de alucinacion: como todo modelo de 4B, la precision factografica es limitada, especialmente en tareas que requieren conocimiento enciclopedico amplio.
- Cobertura idiomatica restringida a ingles, chino y coreano; el rendimiento en castellano no esta garantizado ni documentado.
- No se documenta la longitud de contexto, lo que impide planificar tareas de contexto largo con garantias.
- La licencia Apache 2.0 permite uso comercial, pero el autor del modelo base y el cuantizador no ofrecen garantias sobre el comportamiento del modelo decensored; la responsabilidad legal del uso recae en el desplegador.
- El repositorio tiene solo 165 descargas y 1 like, lo que indica una validacion comunitaria muy limitada; no hay evidencia de pruebas extensas en produccion.
- No se dispone de informacion sobre sesgos especificos medidos, pero el decensoring tiende a amplificar sesgos presentes en los datos de entrenamiento.
- La fecha de creacion (2026-04-14) y actualizacion (2026-11-03) son futuras respecto a la fecha habitual de referencia; conviene verificar la vigencia del repositorio.

## Enlaces

- HuggingFace (GGUF): https://huggingface.co/mradermacher/Qwopus3.5-4B-v3-heretic-GGUF
- Modelo base: https://huggingface.co/tvall43/Qwopus3.5-4B-v3-heretic
- Variantes i1 con imatrix: https://huggingface.co/mradermacher/Qwopus3.5-4B-v3-heretic-i1-GGUF
- Pagina de overview del cuantizador: https://hf.tst.eu/model#Qwopus3.5-4B-v3-heretic-GGUF
- FAQ y solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico de calidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
