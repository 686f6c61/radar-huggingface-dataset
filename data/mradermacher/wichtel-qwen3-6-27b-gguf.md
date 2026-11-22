# mradermacher/Wichtel-Qwen3.6-27B-GGUF

## Resumen

Wichtel-Qwen3.6-27B es un modelo de lenguaje de 27.320.697.856 parámetros (aproximadamente 27,3 mil millones) desarrollado por schneewolflabs y publicado bajo licencia Apache 2.0. Se trata de un merge de modelos afinados sobre una base Qwen3.6, orientado específicamente a agentes, uso de herramientas (tool-use) y generación de código, con un interés particular en el lenguaje Hemlock. La versión aquí descrita es la cuantización GGUF estática realizada por mradermacher, que permite ejecutar el modelo en hardware de consumo mediante llama.cpp y derivados.

El modelo surge de la combinación de varios conjuntos de datos de ajuste fino supervisado y DPO, entre ellos egirl-delegation-dpo, egirl-hemlock-dpo, Hemlock-SFT, hemlock-codex3-SFT, hemlock-transmutation y GreatFirewall-DPO. Esta composición sugiere un entrenamiento orientado a la delegación de tareas entre agentes, la generación de código en Hemlock y el alineamiento mediante preferencias. El resultado es un modelo conversacional con etiquetas declaradas de agents, tool-use y code.

La relevancia actual del modelo radica en su tamaño contenido (27B) combinado con licencia permisiva y disponibilidad en múltiples cuantizaciones GGUF, lo que lo sitúa en la franja de modelos desplegables en una sola GPU de 24-48 GB o en configuraciones multi-GPU de consumo. No obstante, la información pública disponible es limitada: no se han publicado especificaciones detalladas de contexto, arquitectura interna ni resultados de benchmarks en la documentación proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Qwen3.6; detalles internos no publicados en la informacion disponible) |
| Parametros totales | 27.320.697.856 (27,3B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0; ademas mmproj-Q8_0 y mmproj-f16 (suplemento multimodal) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones estaticas); el modelo base en safetensors |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base Qwen3.6 ni del merge Wichtel. Por el nombre y la familia (Qwen3.6) se infiere una arquitectura transformer decoder-only, pero no se confirma en la documentacion proporcionada. El modelo es un merge de pesos, no un entrenamiento desde cero: combina el modelo base schneewolflabs/Wichtel-Qwen3.6-27B con ajustes derivados de varios datasets.

Los datasets declarados en la model card son schneewolflabs/egirl-delegation-dpo, schneewolflabs/egirl-hemlock-dpo, hemlang/Hemlock-SFT, hemlang/hemlock-codex3-SFT, hemlang/hemlock-transmutation y nbeerbower/GreatFirewall-DPO. La presencia de datasets DPO indica un alineamiento mediante preferencias, y los datasets Hemlock-SFT y hemlock-codex3-SFT apuntan a un ajuste supervisado orientado a código en el lenguaje Hemlock. No se especifica el numero de tokens de entrenamiento, la composicion exacta del dataset ni si hubo RLHF adicional. Tampoco se documentan innovaciones tecnicas como decodificacion especulativa o atención lineal.

## Capacidades

- Generacion de texto conversacional en ingles, con formato de chat multi-turno.
- Razonamiento y generacion de codigo, con enfasis declarado en el lenguaje Hemlock.
- Soporte de tool calling / function calling (etiqueta tool-use en el modelo).
- Orientacion a agentes y delegacion de tareas (etiqueta agents y dataset egirl-delegation-dpo).
- Capacidades multimodales potenciales: el repositorio incluye ficheros mmproj (Q8_0 y f16), lo que sugiere soporte de entrada de imagen en la version base, aunque no se documenta explicitamente en la model card.
- Capacidades multilingues limitadas: solo se declara ingles (en).
- No se documentan modos especiales como thinking mode, audio o vision detallada.

## Casos de uso

- Generacion de codigo en Hemlock: el modelo ha sido afinado con datasets especificos de Hemlock (Hemlock-SFT, hemlock-codex3-SFT, hemlock-transmutation), por lo que es adecuado para tareas de escritura y transformacion de codigo en ese lenguaje dentro de pipelines de desarrollo.
- Agentes autonomos con tool calling: las etiquetas agents y tool-use y el dataset de delegacion DPO lo orientan a orquestar llamadas a herramientas y descomponer tareas multi-paso en entornos de agentes.
- Asistente de desarrollo en local: con cuantizaciones Q4_K_M (16,9 GB) o Q5_K_M (19,6 GB) puede ejecutarse en una GPU de consumo de 24 GB, permitiendo un asistente de codigo privado sin enviar datos a la nube.
- Prototipado de pipelines de delegacion entre agentes: el ajuste en egirl-delegation-dpo lo hace util para experimentar con arquitecturas de agentes que reparten subtareas.
- Evaluacion de merges y cuantizaciones: al estar disponible en 11 cuantizaciones distintas (de Q2_K a Q8_0), sirve para estudiar el impacto de la cuantizacion en calidad y latencia sobre un modelo de 27B.
- Despliegue en entornos con recursos limitados: la cuantizacion Q2_K (11,0 GB) permite ejecucion en GPUs de 12-16 GB o incluso en CPU con llama.cpp, aunque con perdida de calidad.
- Integracion en herramientas de chat locales: compatible con endpoints y con la libreria transformers, puede integrarse en frontends tipo Ollama o llama.cpp server para uso conversacional en ingles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia segun cuantizacion: Q2_K ~11,0 GB; Q3_K_S ~12,4 GB; Q3_K_M ~13,6 GB; Q3_K_L ~14,7 GB; IQ4_XS ~15,5 GB; Q4_K_S ~15,9 GB; Q4_K_M ~16,9 GB; Q5_K_S ~19,1 GB; Q5_K_M ~19,6 GB; Q6_K ~22,5 GB; Q8_0 ~29,1 GB. A estas cifras hay que sumar el espacio para el contexto KV cache y, si se usa multimodal, el mmproj (0,7-1,0 GB).
- GPU recomendadas: para Q8_0 o Q6_K, una A100 40 GB, H100 o RTX 4090 24 GB (Q6_K justo); para Q4_K_M, una RTX 4090 24 GB o RTX 3090 24 GB; para Q2_K-Q3_K, GPUs de 12-16 GB como RTX 4070 Ti o RTX 4080.
- Cabe en GPU de consumo: si, en RTX 3090/4090 (24 GB) con Q4_K_M o Q5_K_M; en GPUs de 16 GB con Q3_K_M o IQ4_XS; en GPUs de 12 GB con Q2_K.
- Opciones de despliegue: llama.cpp (formato GGUF nativo), Ollama, servidores compatibles con endpoints, y transformers para el modelo base en safetensors. No se documenta soporte explicito de vLLM o TGI en la informacion disponible.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Wichtel-Qwen3.6-27B-GGUF | 27,3B | no disponible | apache-2.0 | GGUF | Merge orientado a agentes, tool-use y Hemlock; solo ingles |
| Qwen3.6-27B (base, si existe publicamente) | no disponible | no disponible | no disponible | no disponible | Modelo base del que deriva el merge; no se dispone de ficha en la informacion |
| Alternativas de ~27-32B en GGUF | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la informacion proporcionada |

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la informacion proporcionada, por lo que la comparativa cuantitativa no es posible.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la informacion disponible; al ser un merge de datasets posiblemente sinteticos (egirl-*, GreatFirewall-DPO), pueden heredarse sesgos de esos conjuntos, pero no se detallan.
- Riesgo de alucinacion: no cuantificado; como todo modelo generativo, puede producir contenido erroneo, especialmente en dominios no cubiertos por sus datasets de ajuste.
- Limitacion de idioma: solo se declara soporte de ingles (en); el rendimiento en castellano u otros idiomas no esta garantizado.
- Longitud de contexto: no documentada, lo que impide planificar despliegues con contextos largos sin verificacion empirica.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene verificar las licencias de los datasets de ajuste (egirl-*, Hemlock-*, GreatFirewall-DPO) por si imponen condiciones adicionales.
- Caveat de produccion: la cuantizacion Q2_K y Q3_K_S degradan la calidad; para produccion se recomienda Q4_K_M o superior. El modelo es un merge, no un entrenamiento validado, por lo que su robustez en dominios fuera de agentes/codigo/Hemlock es incierta.
- Soporte multimodal: la presencia de mmproj sugiere vision, pero no se documenta su funcionamiento ni calidad.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Wichtel-Qwen3.6-27B-GGUF
- Modelo base: https://huggingface.co/schneewolflabs/Wichtel-Qwen3.6-27B
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/Wichtel-Qwen3.6-27B-i1-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#Wichtel-Qwen3.6-27B-GGUF
- FAQ y peticiones de modelos: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Dataset egirl-delegation-dpo: https://huggingface.co/datasets/schneewolflabs/egirl-delegation-dpo
- Dataset egirl-hemlock-dpo: https://huggingface.co/datasets/schneewolflabs/egirl-hemlock-dpo
- Dataset Hemlock-SFT: https://huggingface.co/datasets/hemlang/Hemlock-SFT
- Dataset hemlock-codex3-SFT: https://huggingface.co/datasets/hemlang/hemlock-codex3-SFT
- Dataset hemlock-transmutation: https://huggingface.co/datasets/hemlang/hemlock-transmutation
- Dataset GreatFirewall-DPO: https://huggingface.co/datasets/nbeerbower/GreatFirewall-DPO
