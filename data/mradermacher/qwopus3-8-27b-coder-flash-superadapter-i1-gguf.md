# mradermacher/Qwopus3.8-27B-Coder-Flash-SuperAdapter-i1-GGUF

## Resumen

Qwopus3.8-27B-Coder-Flash-SuperAdapter-i1-GGUF es una distribucion cuantizada en formato GGUF del modelo OliviaRossi/Qwopus3.8-27B-Coder-Flash-SuperAdapter, publicada por mradermacher. El modelo original es un merge de tipo LoRA sobre una base etiquetada como Qwen3.5/Qwen3.8, orientado especificamente a codigo agentico (agentic coding). Con 27.320.697.856 parametros totales (unos 27,3 mil millones densos, sin mezcla de expertos segun los datos disponibles), se posiciona en la franja de modelos de talla media-grande que pueden ejecutarse en una sola GPU profesional o en configuraciones consumer de gama alta con cuantizacion agresiva.

El repositorio que nos ocupa no contiene los pesos originales en safetensors, sino exclusivamente cuantizaciones GGUF generadas con imatrix (importance matrix) y el algoritmo i1 de ikawrakow, que suele ofrecer mejor calidad que las cuantizaciones estaticas equivalentes en tamano. Se ofrecen 16 variantes que van desde i1-Q2_K (11,3 GB) hasta i1-Q6_K (22,5 GB), ademas del fichero imatrix para quien quiera generar sus propias cuantizaciones. La model card indica que se trata de un modelo de vision, por lo que los ficheros mmproj (proyector multimodal), si existen, se alojan en el repositorio estatico hermano.

La relevancia actual de esta ficha es doble: por un lado, documenta una opcion practica para desplegar localmente un modelo de codigo de ~27B con soporte de agentes; por otro lado, ilustra el flujo habitual de publicacion de cuantizaciones comunitarias (imatrix + i1) sobre merges de LoRA, un patron cada vez mas frecuente en el ecosistema open source. La licencia Apache 2.0 facilita su adopcion comercial, aunque conviene verificar la procedencia exacta de los datos de entrenamiento del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (etiquetado qwen3_5 / qwen3.8 en los tags; sin detalle oficial de capas ni atencion en la informacion disponible) |
| Parametros totales | 27.320.697.856 (~27,3 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-Q2_K, i1-Q3_K_S, i1-IQ3_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-Q4_0, i1-Q4_K_S, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K, ademas de fichero imatrix |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones); el modelo base esta en safetensors |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base. Los tags del repositorio indican qwen3_5 y qwen3.8, lo que sugiere que el modelo original parte de una familia Qwen de tercera generacion (probablemente una variante de ~27B), pero no se especifican numero de capas, dimension oculta, tipo de atencion (completa, GQA, sliding window) ni si incorpora innovaciones como decodificacion especulativa o atencion lineal. Tampoco se documenta el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron fases de RLHF o DPO.

Lo que si se sabe es que el modelo base es un merge de tipo LoRA (tag lora-merge) sobre una base Qwen, especializado en codigo agentico (agentic-coding). El repositorio de mradermacher no reentrena el modelo: aplica cuantizacion con importance matrix (imatrix) y el algoritmo i1 sobre los pesos del merge, generando las 16 variantes listadas. La model card menciona que el modelo tiene capacidades de vision (los ficheros mmproj estarian en el repo estatico), lo que anade una capa multimodal sobre la base de lenguaje, aunque no se detalla el proyector ni los datos de entrenamiento visual.

## Capacidades

- Generacion de texto conversacional en ingles, con orientacion a tareas de programacion.
- Generacion y edicion de codigo, incluyendo soporte para flujos de codificacion agentica segun los tags del repositorio.
- Capacidades de vision: la model card indica explicitamente que es un modelo de vision; los ficheros mmproj (si existen) se alojan en el repositorio estatico hermano.
- Soporte de tool calling / function calling: no confirmado explicitamente en la informacion disponible, aunque el tag agentic-coding sugiere compatibilidad con flujos de agentes.
- Razonamiento multi-paso y uso como agente: inferido del tag agentic-coding, sin detalles tecnicos publicados.
- Capacidades multilingues: limitadas al ingles segun el campo language del repositorio.
- Capacidades especiales (thinking mode, audio, etc.): no disponible.

## Casos de uso

- Asistente de codigo en local para desarrolladores individuales: con la variante i1-Q4_K_M (17,1 GB) puede ejecutarse en una RTX 4090 de 24 GB o en una RTX 3090, ofreciendo un equilibrio razonable entre calidad y velocidad para autocompletado, explicacion de codigo y refactorizacion.
- Agente de codificacion en pipelines de CI/CD: el tag agentic-coding sugiere que el modelo esta afinado para tareas de varios pasos; puede integrarse como backend de un agente que abra PRs, ejecute tests y proponga parches, siempre que se valide su soporte real de tool calling en produccion.
- Revision de codigo automatizada: con contexto suficiente (no documentado) y cuantizacion Q5_K_M o Q6_K, puede analizar diffs y senalar problemas de estilo, seguridad o logica en repositorios de tamano medio.
- Generacion de documentacion tecnica a partir de codigo fuente: el modelo puede resumir modulos, generar docstrings y explicar APIs, aprovechando su entrenamiento en ingles.
- Prototipado rapido de scripts y utilidades: para equipos que no quieren enviar codigo propietario a APIs en la nube, la licencia Apache 2.0 y el despliegue local con llama.cpp u Ollama permiten iterar sin coste por token.
- Educacion y formacion en programacion: como tutor local que explica conceptos, corrige ejercicios y genera ejemplos, con la ventaja de no depender de conectividad externa.
- Procesamiento de capturas o diagramas de codigo (si se usa con mmproj): la capacidad de vision permitiria extraer codigo de imagenes o interpretar diagramas de arquitectura, aunque esta funcionalidad no esta documentada en detalle.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (aproximada, segun tamano de fichero GGUF mas overhead de contexto y KV cache):
  - i1-Q2_K: ~11,3 GB de pesos; ~13-14 GB en ejecucion con contexto moderado.
  - i1-Q3_K_M: ~13,8 GB de pesos; ~15-17 GB en ejecucion.
  - i1-Q4_K_M: ~17,1 GB de pesos; ~19-21 GB en ejecucion.
  - i1-Q5_K_M: ~19,7 GB de pesos; ~22-24 GB en ejecucion.
  - i1-Q6_K: ~22,5 GB de pesos; ~25-27 GB en ejecucion.
- GPU recomendadas:
  - Profesionales: A100 40/80 GB, H100 80 GB (permiten Q6_K con contexto largo y buen throughput).
  - Consumer gama alta: RTX 4090 (24 GB) para Q4_K_M con contexto moderado; RTX 3090 (24 GB) similar; RTX 4080 (16 GB) solo para Q3 o Q2.
  - Multi-GPU: dos RTX 3090 o 4090 permiten Q5_K_M o Q6_K con contexto amplio.
- Cabe en consumer GPU: si, en RTX 4090/3090 con cuantizaciones Q4 o inferiores; en GPUs de 16 GB solo con Q3 o Q2.
- Opciones de despliegue: llama.cpp (soporte nativo GGUF), Ollama (importando el GGUF), LM Studio, text-generation-webui, y servidores compatibles con endpoints (el tag endpoints_compatible sugiere compatibilidad con APIs tipo OpenAI). vLLM y TGI no soportan GGUF de forma nativa; para esos motores habria que usar el modelo base en safetensors.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwopus3.8-27B-Coder-Flash-SuperAdapter (este, i1-GGUF) | ~27,3 B | no disponible | Apache 2.0 | GGUF | Merge LoRA orientado a codigo agentico, con vision, cuantizado por mradermacher |
| Modelo base OliviaRossi/Qwopus3.8-27B-Coder-Flash-SuperAdapter | ~27,3 B | no disponible | Apache 2.0 | safetensors | Pesos originales sin cuantizar; referencia para comparar perdida por cuantizacion |
| Qwen2.5-Coder-32B-Instruct | 32,5 B | 128 K (segun documentacion publica de Qwen) | Apache 2.0 | safetensors, GGUF | Alternativa consolidada de codigo en tamano similar; contexto documentado y benchmarks publicos |
| Qwen2.5-Coder-14B-Instruct | 14,7 B | 128 K (segun documentacion publica de Qwen) | Apache 2.0 | safetensors, GGUF | Opcion mas ligera para GPUs de 16-24 GB con menor huella |

La comparativa con Qwen2.5-Coder se ofrece como referencia de categoria (modelo de codigo de talla similar con licencia permisiva), no como equivalencia tecnica: no hay datos publicados que permitan afirmar que Qwopus3.8 supere o iguale a esas alternativas en benchmarks.

## Limitaciones y advertencias

- Solo ingles: el campo language del repositorio indica exclusivamente en; el rendimiento en castellano no esta garantizado ni documentado.
- Sin benchmarks publicados: no hay evidencia cuantitativa de calidad en MMLU, HumanEval, GSM8K ni similares; cualquier afirmacion de rendimiento seria especulativa.
- Procedencia del merge no verificada: el modelo base es un merge de LoRA de OliviaRossi sobre una base Qwen; no se detalla la composicion del dataset de afinado ni si respeta las condiciones de la licencia Apache 2.0 en todos sus componentes.
- Riesgo de alucinacion: inherente a los modelos de lenguaje de esta talla; en codigo puede traducirse en APIs inexistentes o firmas incorrectas, por lo que requiere validacion en CI.
- Perdida por cuantizacion: las variantes Q2 y Q3 degradan la calidad de forma notable; para produccion se recomienda Q4_K_M o superior.
- Contexto no documentado: se desconoce la ventana real; no debe asumirse un contexto largo sin verificacion empirica.
- Vision no incluida en este repo: los ficheros mmproj, si existen, estan en el repositorio estatico; este repositorio i1 no los contiene.
- Soporte de tool calling no confirmado: aunque el tag agentic-coding lo sugiere, no hay documentacion tecnica que garantice un formato de function calling estable.
- Repositorio con pocas descargas (895) y likes (2): menor validacion comunitaria que alternativas consolidadas.

## Enlaces

- Repositorio Hugging Face (este modelo): https://huggingface.co/mradermacher/Qwopus3.8-27B-Coder-Flash-SuperAdapter-i1-GGUF
- Modelo base: https://huggingface.co/OliviaRossi/Qwopus3.8-27B-Coder-Flash-SuperAdapter
- Repositorio de cuantizaciones estaticas: https://huggingface.co/mradermacher/Qwopus3.8-27B-Coder-Flash-SuperAdapter-GGUF
- Pagina de descargas de mradermacher para este modelo: https://hf.tst.eu/model#Qwopus3.8-27B-Coder-Flash-SuperAdapter-i1-GGUF
- FAQ y solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- nethype GmbH: https://www.nethype.de/
