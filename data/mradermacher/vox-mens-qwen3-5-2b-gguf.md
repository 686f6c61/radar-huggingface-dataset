# mradermacher/vox-mens-qwen3.5-2b-GGUF

## Resumen

vox-mens-qwen3.5-2b-GGUF es una coleccion de cuantizaciones estaticas en formato GGUF del modelo brbrainerd/vox-mens-qwen3.5-2b, publicadas por mradermacher. El modelo original es un ajuste fino (mediante QLoRA y RS-LoRA) sobre una base Qwen3.5 de aproximadamente 2.000 millones de parametros, orientado a generacion de texto conversacional y de codigo. La cuantizacion la lleva a cabo mradermacher de forma automatizada con su pipeline habitual, e incluye variantes desde Q2_K hasta f16 y una version con imatrix en un repositorio separado.

El interes practico de esta publicacion es que permite ejecutar un modelo de ~1.880 millones de parametros en hardware de consumo mediante llama.cpp u otros motores compatibles con GGUF, con tamanos de fichero que van de 1,1 GB (Q2_K) a 3,9 GB (f16). El modelo original declara capacidades de generacion de codigo y conversacion, y su model card menciona arquitectura con gated delta networks, si bien la informacion publica disponible sobre el modelo base es muy limitada.

La licencia declarada es Apache 2.0, lo que facilita el uso comercial. No obstante, conviene senalar que no se han publicado resultados de benchmarks ni especificaciones detalladas de contexto o composicion del dataset de entrenamiento en la informacion disponible, por lo que la evaluacion debe hacerse de forma empirica antes de llevarlo a produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con gated delta networks (segun tags del autor); detalles no disponibles |
| Parametros totales | 1.881.825.088 (~1,88 mil millones) |
| Parametros activos | No aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16; variantes con imatrix en repositorio i1-GGUF |
| Idiomas soportados | Ingles (declarado en la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (el modelo base usa safetensors) |

## Arquitectura y entrenamiento

El modelo base brbrainerd/vox-mens-qwen3.5-2b se presenta como un ajuste fino de una base Qwen3.5 de ~2B parametros. Los tags de la model card indican el uso de QLoRA y RS-LoRA para el ajuste, y mencionan "gated delta networks" como caracteristica arquitectonica, aunque no se detalla si esta presente en todas las capas ni como se combina con la atencion clasica. No se especifica el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO.

Los datasets referenciados en la model card son brbrainerd/vox-mens-data-vox-lang (entrenamiento) y brbrainerd/vox-mens-eval-vox-lang-bench (evaluacion), ambos de tipo "vox-lang". No se aporta informacion sobre su tamano, dominio o idioma mas alla del tag "en". El proceso de cuantizacion de mradermacher emplea su pipeline estandar (quantize_version 2, output_tensor_quantised 1, convert_type hf) y ofrece quants ponderados con imatrix en un repositorio aparte.

## Capacidades

- Generacion de texto conversacional en ingles, segun los tags "conversational" y "text-generation-inference".
- Generacion de codigo, segun el tag "code".
- Compatibilidad declarada con vLLM y text-generation-inference (TGI) para el modelo base, y con llama.cpp para las versiones GGUF.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: solo ingles declarado.
- Capacidades especiales (vision, audio, modo thinking): no disponibles.
- El tag "gate-passed" sugiere que el modelo supero algun criterio de validacion del autor, pero no se detalla cual.

## Casos de uso

- Prototipado local de asistentes conversacionales: con la cuantizacion Q4_K_M (1,4 GB) el modelo cabe en cualquier GPU de consumo moderna o incluso puede ejecutarse en CPU con llama.cpp, lo que permite iterar sobre prompts y flujos conversacionales sin coste de API.
- Generacion de codigo en entornos con requisitos de privacidad: al ser un modelo pequeno y con licencia Apache 2.0, puede desplegarse on-premise para autocompletar o explicar fragmentos de codigo sin enviar datos a terceros, usando Q5_K_M o Q6_K para preservar calidad.
- Educacion y demostraciones de IA generativa: su tamano reducido (1,1-1,5 GB en cuantizaciones bajas) lo hace adecuado para talleres, notebooks y entornos con recursos limitados donde se necesita un LLM funcional y rapido de cargar.
- Clasificacion y etiquetado de texto en ingles: el modelo puede emplearse para tareas de extraccion o categorizacion por prompt, con la ventaja de que la inferencia en Q4_K_S es rapida y el coste por token es minimo en hardware propio.
- Evaluacion comparativa de pipelines de cuantizacion: al ofrecer 12 variantes de cuantizacion del mismo modelo, es util para medir el impacto de Q2_K frente a Q8_0 en calidad y velocidad dentro de un mismo proyecto.
- Base para ajuste fino adicional: con licencia Apache 2.0 y pesos safetensors disponibles en el modelo original, puede servir como punto de partida para QLoRA sobre dominios especificos en ingles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas de MMLU, HumanEval, GSM8K ni metricas comparativas, y el dataset de evaluacion referenciado (vox-mens-eval-vox-lang-bench) no aporta cifras publicas en los datos consultados.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,1-1,5 GB en cuantizaciones Q2_K a Q4_K_M; 1,7-2,1 GB en Q6_K y Q8_0; 3,9 GB en f16 (incluye overhead de contexto adicional).
- GPU recomendadas: cualquier GPU con 4 GB o mas de VRAM, como RTX 3050, RTX 4060, RTX 4090, A100 o H100. El modelo es demasiado pequeno para aprovechar GPU de datacenter, pero funciona en ellas.
- Cabe en GPU de consumo: si, en practicamente todas las GPU dedicadas modernas y en muchas integradas con memoria compartida suficiente.
- Opciones de despliegue: llama.cpp, Ollama (importando el GGUF), LM Studio, y para el modelo base vLLM y TGI. Tambien es compatible con el ecosistema transformers.
- Latencia y throughput estimados: no disponibles. Por el tamano, en una RTX 4090 se espera un throughput alto (cientos de tokens por segundo), pero no hay mediciones publicadas que lo confirmen.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| vox-mens-qwen3.5-2b-GGUF | ~1,88 B | No disponible | Apache 2.0 | GGUF | Este modelo; 12 variantes de cuantizacion |
| Qwen2.5-1.5B-Instruct | ~1,5 B | 32.768 tokens (segun documentacion publica de Qwen) | Apache 2.0 | safetensors, GGUF | Alternativa consolidada en ingles y multilingue |
| Llama 3.2 1B Instruct | ~1,2 B | 128.000 tokens (segun documentacion publica de Meta) | Llama 3.2 Community License | safetensors, GGUF | Requiere aceptar licencia de Meta; no Apache 2.0 |
| SmolLM2-1.7B-Instruct | ~1,7 B | 8.192 tokens (segun documentacion publica de Hugging Face) | Apache 2.0 | safetensors, GGUF | Enfocado a dispositivos y edge |

La comparativa se basa en datos publicos de los modelos alternativos; para el modelo de esta ficha no hay benchmarks que permitan comparar calidad de forma objetiva.

## Limitaciones y advertencias

- No hay resultados de benchmarks publicados, por lo que se desconoce su calidad real frente a alternativas consolidadas de tamano similar.
- El modelo solo declara soporte de ingles; el rendimiento en castellano u otros idiomas no esta documentado y probablemente sea deficiente.
- Riesgo de alucinacion inherente a modelos de ~2B parametros, especialmente en tareas de conocimiento factual o razonamiento largo.
- La longitud de contexto no esta especificada, lo que impide planificar casos de uso con conversaciones o documentos extensos.
- La informacion sobre sesgos no esta disponible; al ser un ajuste fino sobre Qwen3.5 con un dataset no documentado, pueden heredarse sesgos de la base y del dataset "vox-lang".
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar la licencia del modelo base Qwen3.5 subyacente antes de distribuirlo en productos.
- El tag "gate-passed" no se explica; no debe interpretarse como una garantia de calidad.
- Las cuantizaciones Q2_K y Q3_K_S, pese a su tamano reducido, degradan la calidad de forma notable segun las notas del propio autor (Q3_K_M marcado como "lower quality").

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/vox-mens-qwen3.5-2b-GGUF
- Repositorio con quants imatrix: https://huggingface.co/mradermacher/vox-mens-qwen3.5-2b-i1-GGUF
- Modelo base: https://huggingface.co/brbrainerd/vox-mens-qwen3.5-2b
- Dataset de entrenamiento: https://huggingface.co/datasets/brbrainerd/vox-mens-data-vox-lang
- Dataset de evaluacion: https://huggingface.co/datasets/brbrainerd/vox-mens-eval-vox-lang-bench
- Pagina de descargas del autor: https://hf.tst.eu/model#vox-mens-qwen3.5-2b-GGUF
- Solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
