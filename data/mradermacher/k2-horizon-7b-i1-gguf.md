# mradermacher/K2-Horizon-7B-i1-GGUF

## Resumen

K2-Horizon-7B es un modelo de lenguaje denso de tipo decoder-only desarrollado por IFM, presentado como el miembro intermedio de la familia K2-Horizon. Se distribuye bajo licencia Apache-2.0 y su rasgo más distintivo es una ventana de contexto nativa de 524.288 tokens (512K), disponible desde las fases de midtraining. La model card del autor describe la familia como "open-weights" y publica el registro de datos de preentrenamiento y midtraining empleados.

La ficha que nos ocupa, `mradermacher/K2-Horizon-7B-i1-GGUF`, no es el modelo original, sino una recuantización en formato GGUF realizada por mradermacher a partir de los pesos de `IFM/K2-Horizon-7B`. Incluye cuantizaciones generadas con matriz de importancia (imatrix), lo que mejora la calidad respecto a las cuantizaciones estáticas equivalentes, y cubre un rango que va desde IQ1_S (2,6 GB) hasta Q6_K (7,5 GB).

Es relevante ahora porque permite ejecutar un modelo de 7B con contexto de 512K en hardware de consumo mediante llama.cpp u Ollama, algo poco habitual en su categoría: la mayoría de los modelos abiertos de 7-8B de referencia se quedan en 32K o 128K tokens de contexto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso |
| Parametros totales | 8.999.178.240 (segun safetensors del modelo base); la familia lo comercializa como "7B" |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 524.288 tokens (512K) nativo desde la fase de midtraining |
| Tipos de cuantizacion | i1 (imatrix): IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K_S, Q2_K, IQ3_XXS, IQ3_XS, Q3_K_S, IQ3_S, IQ3_M, Q3_K_M, Q3_K_L, IQ4_XS, Q4_0, IQ4_NL, Q4_K_S, Q4_K_M, Q4_1, Q5_K_S, Q5_K_M, Q6_K |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (este repositorio); el modelo base se distribuye en safetensors |
| Tamano del repositorio | 108,7 GB (suma de todas las cuantizaciones) |
| Fecha de publicacion | 14 de octubre de 2026 (recuantizacion); modelo base publicado el 3 de septiembre de 2026 |
| Descargas / likes | 2 descargas, 0 likes |

## Arquitectura y entrenamiento

La informacion disponible describe K2-Horizon-7B como un modelo denso decoder-only, sin mezcla de expertos ni arquitecturas hibridas (SSM, Mamba u otras). El tamano real de parametros, 8.999.178.240 segun los tensores en safetensors, queda ligeramente por encima de la etiqueta comercial "7B". No se detalla en el material disponible el numero de capas, cabezas de atencion, dimension oculta ni si se emplea atencion lineal, ventanas deslizantes o decodificacion especulativa.

El autor del modelo publica dos conjuntos de datos asociados al entrenamiento: `IFM/K2-Horizon-Pretrain-Data` e `IFM/K2-Horizon-Midtrain-Data`. La model card menciona que el contexto de 524.288 tokens es nativo "desde las etapas de midtraining en adelante", lo que sugiere una extension progresiva de la ventana durante el entrenamiento. No se especifica el numero total de tokens de entrenamiento, la composicion del dataset ni si se aplicaron fases de RLHF, DPO o similares. Tampoco se documentan innovaciones tecnicas concretas (atencion lineal, decodificacion especulativa, etc.).

La unica intervencion tecnica documentada en este repositorio es la cuantizacion con imatrix. La model card indica `quantize_version: 2`, `output_tensor_quantised: 1` y `convert_type: hf`, y agradece a @nicoboss el acceso al supercomputador utilizado para generar las cuantizaciones con matriz de importancia a partir del fichero `K2-Horizon-7B.imatrix.gguf`.

## Capacidades

- Generacion de texto conversacional en ingles, con la etiqueta `conversational` declarada en el repositorio.
- Contexto largo: ventana nativa de 524.288 tokens, apta para procesar documentos extensos, repositorios de codigo completos o historiales largos sin truncado.
- Razonamiento y codigo: la familia declara evaluacion en pruebas de tipo agentic, coding, long-context y reasoning, si bien no se publican cifras.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada (la familia menciona evaluacion "agentic", sin detalle).
- Capacidades multilingues: limitadas al ingles; no se declara soporte de otros idiomas.
- Capacidades especiales (modo thinking, vision, audio): no disponible en la informacion proporcionada.
- Inferencia local: al ser un modelo denso de ~9B cuantizado a GGUF, es ejecutable en CPU y GPU consumer mediante llama.cpp y compatibles.

## Casos de uso

- Analisis de repositorios de codigo completos: con 512K tokens de contexto, el modelo puede ingerir un arbol de fuentes entero en una sola pasada y responder preguntas de arquitectura, dependencias o deuda tecnica sin necesidad de trocear el codigo en fragmentos.
- Atencion al cliente automatizada: la ventana larga permite mantener conversaciones multi-turno con historial completo y documentacion de producto adjunta, reduciendo la perdida de contexto que obliga a resumir en modelos de 8K o 32K.
- Revision documental juridica o financiera: procesamiento de contratos, informes anuales o expedientes extensos en una unica invocacion, con extraccion de clausulas y resumenes estructurados.
- Generacion de codigo en produccion: integrable en pipelines de CI/CD mediante llama.cpp o bindings de Python para tareas de revision de diffs, generacion de tests o explicacion de errores.
- Despliegue local en estaciones de trabajo: las cuantizaciones IQ2/IQ3 (3-5 GB) y Q4_K_M (5,7 GB) permiten ejecutar el modelo en portatiles y equipos sin GPU dedicada, con degradacion de calidad controlada.
- Asistentes RAG sobre bases de conocimiento internas: el contexto de 512K admite concatenar recuperaciones de multiples documentos sin recortes agresivos, mejorando la fidelidad de las respuestas.
- Procesamiento por lotes en servidores modestos: un unico modelo denso de ~9B cuantizado permite servir tareas de clasificacion, resumen y extraccion sin necesidad de infraestructura multi-GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numericos en la informacion disponible. La documentacion de la familia K2-Horizon afirma que el modelo ha sido "evaluado en benchmarks de tipo agentic, coding, long-context y reasoning", pero no se adjuntan cifras de MMLU, HumanEval, GSM8K ni de ninguna otra prueba, ni en la model card del modelo base ni en la de esta recuantizacion.

| Benchmark | K2-Horizon-7B | Alternativas comparables |
|---|---|---|
| MMLU | no disponible | no disponible en esta ficha |
| HumanEval | no disponible | no disponible en esta ficha |
| GSM8K | no disponible | no disponible en esta ficha |
| Long-context | no disponible | no disponible en esta ficha |

## Requisitos de hardware

- VRAM estimada segun cuantizacion (solo pesos, sin cache KV ni overhead del runtime):
  - IQ1_S: 2,6 GB | IQ1_M: 2,8 GB | IQ2_XXS: 3,0 GB | IQ2_XS: 3,2 GB | IQ2_S: 3,4 GB | IQ2_M: 3,6 GB
  - Q2_K_S: 3,7 GB | Q2_K: 3,9 GB | IQ3_XXS: 3,9 GB | IQ3_XS: 4,2 GB | Q3_K_S: 4,4 GB | IQ3_S: 4,4 GB | IQ3_M: 4,5 GB | Q3_K_M: 4,7 GB | Q3_K_L: 5,0 GB
  - IQ4_XS: 5,2 GB | Q4_0: 5,5 GB | IQ4_NL: 5,5 GB | Q4_K_S: 5,5 GB | Q4_K_M: 5,7 GB | Q4_1: 5,9 GB
  - Q5_K_S: 6,4 GB | Q5_K_M: 6,6 GB | Q6_K: 7,5 GB
- GPU consumer: las cuantizaciones de 2,6 a 4,5 GB caben en tarjetas de 6-8 GB (GTX 1660, RTX 3050/4060). Q4_K_M y superiores encajan en 8-12 GB (RTX 3060 12 GB, RTX 4070, RTX 4060 Ti 16 GB). Q6_K requiere 8-12 GB libres.
- GPU profesional: A100 40/80 GB, H100, L40S o A6000 permiten servir el modelo con contexto largo y lotes concurrentes.
- Cache KV: no se dispone de la configuracion de capas y cabezas, por lo que no puede calcularse con precision. Con 524.288 tokens de contexto la cache KV crecera de forma muy significativa y probablemente dominara el consumo de VRAM en GPU consumer; se recomienda cuantizar la cache (Q8_0 o Q4) o reducir la ventana efectiva en esos equipos.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python y text-generation-webui para los ficheros GGUF. Para vLLM o TGI se recomienda partir de los pesos originales en safetensors de `IFM/K2-Horizon-7B`.
- Latencia y throughput estimados: no disponible. No se han publicado mediciones de tokens por segundo para ninguna de las cuantizaciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato / disponibilidad | Rendimiento |
|---|---|---|---|---|---|
| K2-Horizon-7B (i1-GGUF) | 8,999 B | 524.288 tokens | Apache-2.0 | GGUF (24 cuantizaciones), safetensors del base | no disponible |
| Qwen2.5-7B | 7,6 B | 128K (32K nativo, ampliable) | Apache-2.0 | safetensors, GGUF (comunidad) | no comparable aqui |
| Llama-3.1-8B | 8,0 B | 128K | Llama 3.1 Community License | safetensors, GGUF (comunidad) | no comparable aqui |
| Mistral-7B-Instruct-v0.3 | 7,2 B | 32K | Apache-2.0 | safetensors, GGUF (comunidad) | no comparable aqui |

La ventaja diferencial de K2-Horizon-7B en esta tabla es la ventana de contexto, cuatro veces mayor que la de Llama-3.1-8B y Qwen2.5-7B y dieciseis veces mayor que la de Mistral-7B. La licencia Apache-2.0 lo sitúa al mismo nivel permisivo que Qwen2.5 y Mistral, y por encima de Llama-3.1 en cuanto a restricciones de uso comercial. No se dispone de datos de rendimiento que permitan comparar calidad.

## Limitaciones y advertencias

- Idioma: el modelo solo declara soporte de ingles (`en`). El rendimiento en castellano u otros idiomas no esta verificado y previsiblemente sera inferior.
- Sin datos de benchmarks: no hay cifras publicadas de MMLU, HumanEval, GSM8K ni pruebas de contexto largo, lo que dificulta estimar su calidad frente a alternativas consolidadas.
- Riesgo de alucinacion: inherente a los modelos generativos de este tamano; especialmente relevante en tareas facticas y en contextos largos, donde la atencion puede diluirse.
- Cuantizaciones extremas: las versiones IQ1_S, IQ1_M e IQ2_XXS degradan la calidad de forma notable. La propia model card las etiqueta como "for the desperate" o "mostly desperate" y advierte de calidad muy baja en Q2_K_S.
- Licencia: Apache-2.0 permite uso comercial sin restricciones adicionales, pero conviene verificar que el modelo base `IFM/K2-Horizon-7B` mantiene la misma licencia, ya que esta ficha se refiere a una recuantizacion derivada.
- Contexto largo y memoria: aunque el contexto nativo sea de 512.288 tokens, en hardware consumer la cache KV puede agotar la VRAM mucho antes de alcanzar esa longitud. Es necesario ajustar `n_ctx` y cuantizar la cache.
- Repositorio con muy poca traccion: 2 descargas y 0 likes en el momento de redactar esta ficha; existe una version estatica de cuantizaciones en `mradermacher/K2-Horizon-7B-GGUF` con un publico potencialmente mayor.
- Estado del ecosistema: al ser un modelo reciente (septiembre de 2026), el soporte en frameworks de terceros puede no estar maduro.

## Enlaces

- Repositorio HuggingFace (esta recuantizacion): https://huggingface.co/mradermacher/K2-Horizon-7B-i1-GGUF
- Cuantizaciones estaticas del mismo autor: https://huggingface.co/mradermacher/K2-Horizon-7B-GGUF
- Modelo base: https://huggingface.co/IFM/K2-Horizon-7B
- Pagina de resumen y descargas de mradermacher: https://hf.tst.eu/model#K2-Horizon-7B-i1-GGUF
- Dataset de preentrenamiento: https://huggingface.co/datasets/IFM/K2-Horizon-Pretrain-Data
- Dataset de midtraining: https://huggingface.co/datasets/IFM/K2-Horizon-Midtrain-Data
- Ficha en ModelScope: https://www.modelscope.cn/models/IFM/K2-Horizon-7B-GGUF
- Ficha en AI/TLDR: https://ai-tldr.dev/models/k2-horizon-7b/
- Ficha en local-ai-zone: https://local-ai-zone.github.io/models/k2-horizon-7b.html
- Peticiones y FAQ de mradermacher: https://huggingface.co/mradermacher/model_requests
- README de referencia de TheBloke para uso de GGUF: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Notas de Artefact2 sobre tipos de cuantizacion: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
