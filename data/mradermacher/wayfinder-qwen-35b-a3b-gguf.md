# mradermacher/wayfinder-qwen-35b-a3b-GGUF

## Resumen

Wayfinder Qwen 35B A3B es un modelo de lenguaje de tipo Mixture of Experts (MoE) desarrollado originalmente por MongoDB, especializado en busqueda de codigo, uso de herramientas (tool use) y flujos agenticos. La version aqui descrita es una cuantizacion GGUF estatica producida por mradermacher a partir del modelo base `MongoDB/wayfinder-qwen-35b-a3b`, con 35.505.251.456 parametros totales (35,5 B) y un esquema MoE que activa solo una fraccion de ellos por token (designacion A3B, es decir, aproximadamente 3 B activos). Esta pensado para tareas de agente y subagente en entornos de desarrollo, donde el modelo actua como orquestador o ejecutor de busquedas semanticas sobre repositorios de codigo.

La relevancia de esta publicacion radica en que ofrece el modelo original en formato GGUF listo para inferencia local con llama.cpp y derivados, con un abanico de cuantizaciones que van desde Q2_K (13,3 GB) hasta Q8_0 (37,9 GB), ademas de un modulo multimodal (mmproj) que sugiere capacidades de vision. Al ser un modelo MoE de 35 B con solo 3 B activos, el coste computacional por token es bajo en comparacion con un denso de tamano equivalente, lo que lo hace atractivo para despliegues en hardware consumer de gama alta.

La licencia es mixta: Apache 2.0 combinada con la Muse Model License, lo que impone condiciones adicionales al uso comercial que conviene revisar antes de integrarlo en produccion. El modelo esta etiquetado como `lora-merged`, lo que indica que el modelo base incorpora adaptadores LoRA fusionados en los pesos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE) basada en Qwen, con adaptadores LoRA fusionados |
| Parametros totales | 35.505.251.456 (35,5 B) |
| Parametros activos | aproximadamente 3 B (designacion A3B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0; mmproj en Q8_0 y f16 |
| Idiomas soportados | ingles (segun model card) |
| Licencia | apache-2.0-and-muse-model-license |
| Formato de pesos | GGUF (cuantizaciones estaticas) y safetensors (modelo base) |

## Arquitectura y entrenamiento

El modelo es un transformer de tipo Mixture of Experts con 35,5 B de parametros totales y aproximadamente 3 B activos por token, lo que reduce el coste de inferencia frente a un denso de tamano comparable. La designacion "Qwen" en el nombre indica que la arquitectura deriva de la familia Qwen, aunque la model card no detalla la configuracion exacta de expertos, el numero de capas ni la dimension oculta. El modelo base incorpora adaptadores LoRA fusionados (tag `lora-merged`), lo que sugiere un ajuste fino posterior sobre un modelo Qwen preentrenado, orientado a tareas de busqueda de codigo, uso de herramientas y comportamiento agentico.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF o DPO. La presencia de un modulo multimodal (mmproj) en las cuantizaciones indica que el modelo base tiene capacidad de procesar imagenes, aunque no se especifica la arquitectura del encoder visual. Tampoco se detallan innovaciones tecnicas como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto conversacional en ingles.
- Busqueda de codigo (tag `code-search`): orientado a localizar y razonar sobre fragmentos de codigo en repositorios.
- Uso de herramientas y function calling (tags `tool-use`, `agentic`).
- Comportamiento como subagente (tag `subagent`), disenado para integrarse en sistemas multiagente.
- Procesamiento multimodal: la presencia de archivos mmproj sugiere soporte de entrada de imagenes, aunque no se detalla el alcance.
- Razonamiento multi-paso en el contexto de tareas agenticas.
- Capacidades multilingues: la model card solo declara ingles; no se confirma soporte de otros idiomas.

## Casos de uso

- Busqueda semantica en repositorios de codigo: el modelo puede indexar y consultar bases de codigo para localizar funciones, clases o patrones, aprovechando su especializacion en `code-search` y su ventana de contexto (no confirmada) para manejar fragmentos extensos.
- Orquestacion de subagentes en pipelines de desarrollo: gracias a su comportamiento como subagente y soporte de tool calling, puede delegar tareas a otras herramientas o agentes en un flujo multi-paso, por ejemplo en la resolucion automatica de issues.
- Asistente de refactorizacion: integrado en un IDE o CI/CD, puede analizar fragmentos de codigo y proponer cambios, apoyandose en su capacidad de razonamiento sobre codigo y su bajo coste por token al ser MoE.
- Automatizacion de revision de codigo: el modelo puede revisar pull requests y generar comentarios sobre posibles errores, usando tool calling para consultar el diff o ejecutar linters.
- Generacion de documentacion tecnica a partir de codigo fuente: puede recorrer un repositorio y producir descripciones de modulos o funciones, con soporte de contexto largo si la ventana lo permite.
- Despliegue local en estaciones de trabajo de desarrollo: las cuantizaciones Q4_K_M (21,8 GB) permiten ejecutar el modelo en una GPU consumer de 24 GB, habilitando asistentes de codigo privados sin depender de la nube.
- Analisis multimodal de capturas o diagramas: con el modulo mmproj, puede procesar imagenes junto a texto, por ejemplo para interpretar diagramas de arquitectura o capturas de errores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia segun cuantizacion: Q2_K ~13,3 GB; Q3_K_M ~17,3 GB; IQ4_XS ~19,5 GB; Q4_K_M ~21,8 GB; Q5_K_M ~25,4 GB; Q6_K ~29,3 GB; Q8_0 ~37,9 GB. Anadir ~0,7-1,0 GB si se usa el modulo mmproj.
- GPU recomendadas: para Q4_K_M o IQ4_XS, una RTX 4090 (24 GB) o RTX 3090 (24 GB) es suficiente; para Q5_K_M y superiores se recomienda A100 40 GB, H100 o RTX 6000 Ada.
- Cabe en GPU consumer: si, en modelos de 24 GB con cuantizaciones Q4 o inferiores; en GPUs de 16 GB solo con Q2_K o Q3_K_S y posible offload parcial a CPU.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF; el modelo base (safetensors) puede servirse con vLLM o TGI si se dispone de la version no cuantizada.
- Latencia y throughput estimados: no disponibles; al ser MoE con ~3 B activos, se espera un throughput superior al de un denso de 35 B, pero no se han publicado cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Wayfinder Qwen 35B A3B (este) | 35,5 B | ~3 B | no disponible | Apache 2.0 + Muse Model License | GGUF, safetensors |
| Qwen2.5-Coder-32B | 32 B | 32 B (denso) | 128 K (segun documentacion publica de Qwen) | Apache 2.0 | safetensors, GGUF |
| DeepSeek-Coder-V2-Lite | 16 B | 2,4 B | 128 K (segun documentacion publica) | DeepSeek License | safetensors, GGUF |

La comparativa con Qwen2.5-Coder-32B y DeepSeek-Coder-V2-Lite se ofrece como referencia de categoria (modelos de codigo de tamano similar), pero no se dispone de resultados de benchmarks del modelo Wayfinder que permitan una comparacion cuantitativa directa. El modelo de MongoDB se distingue por su enfoque agentico y de subagente, y por una licencia mixta mas restrictiva que Apache 2.0 puro.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la informacion disponible; al entrenarse presumiblemente sobre codigo y datos en ingles, puede heredar sesgos de esos corpus.
- Riesgo de alucinacion: como todo modelo generativo, puede inventar APIs, funciones o referencias de codigo inexistentes; en tareas de busqueda de codigo conviene verificar los resultados contra el repositorio real.
- Limitaciones de contexto o idioma: solo se declara soporte de ingles; la longitud de contexto no esta confirmada, lo que impide garantizar el manejo de repositorios muy extensos en una sola pasada.
- Restricciones de licencia: la licencia combina Apache 2.0 con la Muse Model License, que puede imponer condiciones adicionales al uso comercial; es necesario revisar el archivo LICENSE-MUSE-SPARK-OPEN.md antes de desplegar en produccion.
- Caveats para produccion: las cuantizaciones Q2_K y Q3_K_S degradan la calidad; para uso en produccion se recomienda Q4_K_M o superior. El modelo esta etiquetado como `lora-merged`, por lo que el comportamiento puede diferir del Qwen base subyacente. No hay informacion sobre latencia, throughput ni estabilidad en cargas concurrentes.

## Enlaces

- Repositorio Hugging Face (GGUF): https://huggingface.co/mradermacher/wayfinder-qwen-35b-a3b-GGUF
- Modelo base: https://huggingface.co/MongoDB/wayfinder-qwen-35b-a3b
- Cuantizaciones ponderadas/imatrix: https://huggingface.co/mradermacher/wayfinder-qwen-35b-a3b-i1-GGUF
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#wayfinder-qwen-35b-a3b-GGUF
- Licencia Muse Model: https://huggingface.co/hweller1/wayfinder-qwen-35b-a3b/blob/main/LICENSE-MUSE-SPARK-OPEN.md
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- FAQ y solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
