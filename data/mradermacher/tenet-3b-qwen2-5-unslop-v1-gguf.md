# mradermacher/Tenet-3B-Qwen2.5-Unslop-v1-GGUF

## Resumen

Tenet-3B-Qwen2.5-Unslop-v1 es un modelo de lenguaje de 3.085.938.688 parametros (aproximadamente 3B) construido sobre la arquitectura Qwen2.5 y afinado por mr-andrey-isachenko. La version aqui descrita es la cuantizacion GGUF realizada por mradermacher, un conocido publicador de cuantizaciones estaticas para llama.cpp y entornos de inferencia local. El modelo base incorpora tecnicas de entrenamiento orientadas a "desablandar" (unslop) las respuestas, junto con etiquetas que indican abliteration (eliminacion de direcciones de rechazo), capacidades agenticas, uso de herramientas y generacion de codigo.

El modelo resulta relevante porque ofrece un tamano contenido (3B) que cabe en GPUs de consumo, con una licencia Apache 2.0 permisiva y un conjunto amplio de cuantizaciones GGUF que van desde Q2_K (1,4 GB) hasta f16 (6,3 GB). Esto lo hace atractivo para despliegues locales, prototipado rapido y pipelines donde el coste por token o la privacidad son criticos. La orientacion a tool-use y agentes lo posiciona como candidato para automatizaciones ligeras.

La informacion disponible sobre el modelo es limitada: la model card del repositorio GGUF es principalmente una ficha de cuantizacion y no detalla el dataset de entrenamiento, la longitud de contexto ni los resultados de benchmarks. Los datos tecnicos que se presentan a continuacion provienen de los metadatos de Hugging Face y de la model card del cuantizador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer basada en Qwen2.5 (según tags y nombre del modelo) |
| Parametros totales | 3.085.938.688 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 (estaticas); versiones imatrix en repositorio separado |
| Idiomas soportados | en (segun model card) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (repo de cuantizacion); safetensors en el modelo base |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Qwen2.5, un transformer decoder-only con atencion por rotacion (RoPE) y mecanismos estandar de atencion causal. El nombre y las etiquetas indican que el modelo base fue sometido a un proceso de "unslop" (eliminacion de respuestas excesivamente cautas o genericas) y a tecnicas de abliteration, que consisten en identificar y eliminar las direcciones del espacio de activaciones asociadas a rechazos. Tambien aparecen etiquetas de GRPO (Group Relative Policy Optimization), lo que sugiere un ajuste por refuerzo para mejorar el razonamiento o el seguimiento de instrucciones.

No se dispone de informacion detallada sobre el numero de tokens de entrenamiento, la composicion del dataset ni las fases de RLHF/DPO mas alla de las etiquetas mencionadas. El repositorio de cuantizacion no incluye una model card tecnica del modelo original, por lo que estos datos deben considerarse no disponibles. La innovacion principal destacable es la combinacion de abliteration con un ajuste orientado a agentes y tool-use, que busca un modelo mas directo y menos restrictivo en sus respuestas.

## Capacidades

- Generacion de texto conversacional en ingles.
- Razonamiento y seguimiento de instrucciones, con posible modo de pensamiento derivado de Qwen2.5.
- Generacion de codigo (etiqueta "coding").
- Uso de herramientas y function calling (etiquetas "tool-use", "agentic").
- Capacidades agenticas y razonamiento multi-paso.
- Respuestas menos restrictivas gracias a la abliteration (etiquetas "abliterated", "uncensored").
- Compatibilidad con endpoints y despliegue en vLLM (etiquetas "vllm", "endpoints_compatible").
- Soporte de cuantizacion FP8 en el modelo base (etiqueta "fp8").
- Capacidades multilingues limitadas: la model card solo declara ingles.

## Casos de uso

- Asistente de codigo local: el modelo puede generar y completar fragmentos de codigo en un entorno de desarrollo integrado (IDE) o en un pipeline de CI/CD, aprovechando su tamano reducido para ejecutarse en una GPU de consumo y su etiqueta de coding.
- Agente de automatizacion de tareas: con soporte de tool-use y agentic, puede encadenar llamadas a APIs, consultar bases de datos o ejecutar comandos en un flujo multi-paso, adecuado para prototipos de agentes ligeros.
- Atencion al cliente automatizada: su naturaleza conversacional y su licencia Apache 2.0 permiten desplegarlo en un chatbot de soporte en ingles, con la ventaja de que puede ejecutarse en local para preservar la privacidad de las conversaciones.
- Generacion de contenido sin filtros excesivos: la abliteration lo hace util para tareas creativas o de redaccion donde los modelos estandar aplican rechazos innecesarios, como guiones o ficcion.
- Prototipado rapido en investigación: su tamano de 3B y las multiples cuantizaciones GGUF permiten experimentar con tecnicas de prompting, RLHF o evaluacion en hardware modesto.
- Despliegue en el borde (edge): con cuantizaciones de 1,4 a 2,3 GB, puede ejecutarse en dispositivos con poca VRAM o incluso en CPU mediante llama.cpp, para asistentes offline o embebidos.
- Evaluacion de seguridad y red teaming: al ser un modelo abliterated, sirve como caso de estudio para analizar el comportamiento de modelos sin direcciones de rechazo y disenar contramedidas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,4 GB (Q2_K), 2,0 GB (Q4_K_M), 3,4 GB (Q8_0) y 6,3 GB (f16), sin contar el overhead del contexto y del runtime.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para cuantizaciones Q4; RTX 3060, RTX 4060, RTX 4090, A100 o H100 para mayor throughput.
- Cabe en GPU de consumo: si, en modelos como GTX 1650, RTX 3050, RTX 4060 o superiores con cuantizaciones Q4 o Q5.
- Opciones de despliegue: llama.cpp, Ollama, vLLM (para el modelo base en safetensors o FP8), TGI y otros runtimes compatibles con GGUF.
- Latencia y throughput estimados: no disponibles; dependen del hardware y de la cuantizacion. En una RTX 4090 con Q4_K_M se puede esperar un throughput alto, pero no se han publicado cifras oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Tenet-3B-Qwen2.5-Unslop-v1 | 3,09B | no disponible | Apache 2.0 | GGUF, safetensors | Abliterated, agentic, tool-use |
| Qwen2.5-3B-Instruct | 3,09B | 32K (segun documentacion de Qwen) | Apache 2.0 | safetensors, GGUF | Modelo base oficial, sin abliteration |
| Llama-3.2-3B-Instruct | 3,21B | 128K | Llama 3.2 Community License | safetensors, GGUF | Licencia restrictiva para uso comercial |
| Phi-3.5-mini-instruct | 3,82B | 128K | MIT | safetensors, GGUF | Orientado a razonamiento y codigo |

La comparativa se basa en caracteristicas publicas de modelos de tamano similar; no se dispone de datos de rendimiento del modelo evaluado para comparar numericamente.

## Limitaciones y advertencias

- Sesgos conocidos: no se han documentado, pero al derivar de Qwen2.5 y aplicar abliteration, puede presentar sesgos del dataset original y una menor alineacion de seguridad.
- Riesgo de alucinacion: inherente a los modelos de 3B; la capacidad de razonamiento es limitada en comparacion con modelos mayores.
- Limitaciones de contexto o idioma: la model card solo declara ingles; la longitud de contexto no esta documentada y puede ser menor que la de Qwen2.5 estandar.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero la abliteration puede implicar riesgos legales o eticos si se usa para generar contenido danino; el usuario es responsable del uso.
- Caveats para produccion: la falta de benchmarks y de documentacion tecnica del modelo base dificulta la evaluacion de calidad; se recomienda validar en el dominio concreto antes de desplegar.
- La cuantizacion Q2_K y Q3_K_M pueden degradar notablemente la calidad; se recomienda Q4_K_M o superior para uso en produccion.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Tenet-3B-Qwen2.5-Unslop-v1-GGUF
- Modelo base: https://huggingface.co/mr-andrey-isachenko/Tenet-3B-Qwen2.5-Unslop-v1
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/Tenet-3B-Qwen2.5-Unslop-v1-i1-GGUF
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#Tenet-3B-Qwen2.5-Unslop-v1-GGUF
- Solicitudes de modelos: https://huggingface.co/mradermacher/model_requests
- Grafico de calidad de cuantizaciones: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones de Artefact2: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Ejemplo de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
