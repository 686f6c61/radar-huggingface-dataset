# mradermacher/Qwen3.8-27B-Uncensored-Mythos-Class-Agentic-i1-GGUF

## Resumen

Qwen3.8-27B-Uncensored-Mythos-Class-Agentic-i1-GGUF es una cuantizacion en formato GGUF, generada con calibracion imatrix, del modelo 0xSojalSec/Qwen3.8-27B-Uncensored-Mythos-Class-Agentic. El trabajo lo firma mradermacher, un cuantizador habitual de Hugging Face que publica versiones optimizadas de modelos abiertos para su uso con llama.cpp y herramientas compatibles. El modelo base es un derivado de la familia Qwen3.8, con 27.320.697.856 parametros totales, afinado para eliminar restricciones de rechazo (abliterated/uncensored) y orientado a tareas agenticas con soporte de tool calling y function calling.

La relevancia de esta ficha es doble. Por un lado, documenta una practica extendida en el ecosistema abierto: la publicacion de cuantizaciones GGUF de modelos grandes para hacerlos ejecutables en hardware de consumo. Por otro, el modelo base incorpora etiquetas que apuntan a una arquitectura hibrida con atencion lineal y componentes tipo Mamba, ademas de modos de despliegue en sglang y vLLM con cuantizacion fp8 y AWQ. La licencia declarada es Apache 2.0, lo que facilita su adopcion comercial, aunque conviene revisar las condiciones del modelo base.

El repositorio ocupa 218,6 GB e incluye un abanico amplio de cuantizaciones (desde i1-Q2_K de 11,0 GB hasta i1-Q6_K de 22,5 GB), ademas del fichero imatrix para generar cuantizaciones propias. La model card indica que se trata de un modelo de vision, con ficheros mmproj alojados en el repositorio de cuantizaciones estaticas del mismo autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido con atencion lineal y componentes tipo Mamba (segun etiquetas del repositorio); detalles exactos no disponibles |
| Parametros totales | 27.320.697.856 |
| Parametros activos | no disponible (no se declara como MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF i1 (imatrix): Q2_K, IQ3_XXS, Q3_K_S, IQ3_XS, IQ3_S, IQ3_M, Q3_K_M, Q3_K_L, IQ4_XS, Q4_0, Q4_K_S, Q4_K_M, Q4_1, Q5_K_S, Q5_K_M, Q6_K; tambien existen cuantizaciones estaticas en repositorio separado |
| Idiomas soportados | en, zh, ar |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (con fichero imatrix adicional); el modelo base en safetensors |

## Arquitectura y entrenamiento

El modelo base se presenta con etiquetas que sugieren una arquitectura hibrida: aparecen los terminos mamba y linear-attention junto a referencias a transformers y a despliegue en sglang y vLLM. Esto apunta a una combinacion de capas de atencion tradicional con capas de estado recurrente o atencion lineal, un patron habitual en modelos recientes que buscan reducir el coste computacional en contextos largos. No se dispone de la configuracion exacta de capas, dimensiones ocultas ni numero de cabezas.

En cuanto al entrenamiento, la model card no detalla el volumen de tokens, la composicion del dataset ni si hubo etapas de RLHF o DPO. Las etiquetas abliterated y uncensored indican que se aplico alguna tecnica de ablacion de direcciones de rechazo para reducir los comportamientos de negativa del modelo original. El sufijo Mythos-Class y las etiquetas hermes-agent y task-tree sugieren un ajuste orientado a razonamiento multi-paso y descomposicion de tareas en arboles, aunque no se aportan detalles tecnicos sobre dicho ajuste.

La cuantizacion i1 de mradermacher emplea calibracion imatrix (matriz de importancia) para ponderar los tensores durante la cuantizacion, lo que en la practica mejora la perplejidad frente a cuantizaciones estaticas del mismo tamano. El autor advierte que los cuants IQ suelen ser preferibles a los no-IQ de tamano similar.

## Capacidades

- Generacion de texto conversacional multi-turno, con orientacion a instrucciones.
- Razonamiento agentico: etiquetas hermes-agent y task-tree indican soporte para descomposicion de tareas y ejecucion multi-paso.
- Tool calling y function calling, con integracion prevista en entornos compatibles con Hermes Agent.
- Capacidades de vision: la model card lo declara explicitamente como modelo de vision, con ficheros mmproj en el repositorio estatico.
- Multilinguee limitado a ingles, chino y arabe segun los metadatos.
- Modo sin censura (abliterated/uncensored): menor probabilidad de rechazo ante peticiones que el modelo original bloquearia.
- Compatibilidad de despliegue con sglang y vLLM, incluyendo variantes fp8 y AWQ en el ecosistema del modelo base.

## Casos de uso

- Agentes autonomos de descomposicion de tareas: el ajuste task-tree permite usar el modelo como planificador que divide un objetivo complejo en subtareas ejecutables, encadenando llamadas a herramientas mediante function calling.
- Automatizacion de soporte tecnico multi-turno: con 27B parametros y capacidades conversacionales, puede mantener dialogos largos y consultar APIs internas mediante tool calling para resolver incidencias.
- Generacion de codigo en pipelines de CI/CD: el soporte de function calling permite integrarlo en flujos que invocan linters, tests o despliegues, y la variante GGUF facilita su ejecucion en runners sin GPU de datacenter.
- Procesamiento de documentos con vision: al ser un modelo multimodal, puede extraer informacion de capturas, formularios o diagramas y combinarla con razonamiento textual en un mismo flujo.
- Investigacion sobre alineacion y censura: la variante abliterated permite estudiar el comportamiento del modelo sin las capas de rechazo, comparando respuestas frente al modelo original en tareas sensibles.
- Despliegue local en estaciones de trabajo: las cuantizaciones Q4_K_M (16,9 GB) y Q5_K_M (19,6 GB) permiten ejecutar el modelo en GPUs de consumo de gama alta con llama.cpp u Ollama, sin depender de servicios en la nube.
- Traduccion y atencion multilinguee en ingles, chino y arabe: util en entornos de soporte regional donde se requieran estos tres idiomas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente el tamano del fichero GGUF mas el overhead de contexto y cache KV. Para i1-Q4_K_M (16,9 GB) se recomiendan al menos 20-22 GB de VRAM; para i1-Q6_K (22,5 GB), en torno a 26-28 GB.
- Cuantizaciones bajas: i1-Q2_K (11,0 GB) e i1-IQ3_XXS pueden caber en GPUs de 12-16 GB, con perdida de calidad apreciable.
- GPU recomendadas: A100 40/80 GB, H100 para despliegue en vLLM o sglang con fp8; RTX 4090 (24 GB) para cuantizaciones Q4_K_M y Q5_K_M; RTX 3090 (24 GB) como alternativa de consumo.
- Cabe en GPU de consumo: si, en RTX 4090, RTX 3090 y, con cuantizaciones bajas, en GPUs de 12-16 GB. En configuraciones multi-GPU tambien es viable con llama.cpp.
- Opciones de despliegue: llama.cpp y Ollama para GGUF; vLLM y sglang para el modelo base en safetensors, fp8 o AWQ; TGI no se menciona en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B-Uncensored-Mythos-Class-Agentic (i1-GGUF) | 27,3B | no disponible | Apache 2.0 | GGUF | Variante sin censura, agentica, con vision |
| Qwen3-32B (referencia de familia) | 32B | no disponible | Apache 2.0 | safetensors, GGUF | Modelo denso de la familia Qwen3, sin ajuste agentico especifico |
| Gemma 2 27B | 27B | no disponible | Gemma license | safetensors, GGUF | Tamano comparable, licencia mas restrictiva |
| Mistral Small 24B | 24B | no disponible | Apache 2.0 | safetensors, GGUF | Alternativa densa de tamano similar |

La comparativa se basa en caracteristicas publicas de cada familia; no se dispone de resultados de benchmarks que permitan comparar rendimiento real entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- La variante abliterated elimina direcciones de rechazo, lo que puede aumentar la probabilidad de generar contenido danino, sesgado o inexacto sin advertencia. No es adecuada para aplicaciones orientadas al publico sin filtros adicionales.
- Riesgo de alucinacion inherente a los modelos de 27B; no se han publicado evaluaciones de fidelidad en la informacion disponible.
- Cobertura linguistica limitada a ingles, chino y arabe; el rendimiento en castellano no esta documentado y probablemente sea inferior.
- La longitud de contexto no se declara en la model card; conviene verificarla en la configuracion del modelo base antes de disenar flujos con contextos largos.
- La licencia Apache 2.0 se declara en este repositorio, pero debe verificarse en el modelo base y en los pesos originales de Qwen, ya que las condiciones pueden diferir.
- El repositorio ocupa 218,6 GB; la descarga completa de todas las cuantizaciones no es practica para la mayoria de usuarios. Conviene descargar solo el cuant deseado.
- Los ficheros mmproj para vision estan en el repositorio estatico del mismo autor, no en este; sin ellos, las capacidades multimodales no estan disponibles en llama.cpp.
- El modelo base tiene pocas descargas y likes (1.409 descargas, 2 likes en este repositorio), lo que sugiere validacion comunitaria limitada.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Qwen3.8-27B-Uncensored-Mythos-Class-Agentic-i1-GGUF
- Modelo base: https://huggingface.co/0xSojalSec/Qwen3.8-27B-Uncensored-Mythos-Class-Agentic
- Cuantizaciones estaticas: https://huggingface.co/mradermacher/Qwen3.8-27B-Uncensored-Mythos-Class-Agentic-GGUF
- Pagina de resumen del autor: https://hf.tst.eu/model#Qwen3.8-27B-Uncensored-Mythos-Class-Agentic-i1-GGUF
- Solicitudes de modelos del autor: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Grafico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
