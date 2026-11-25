# mradermacher/Qwen3.8-27B-SuperAdapter-i1-GGUF

## Resumen

Qwen3.8-27B-SuperAdapter-i1-GGUF es una cuantizacion del modelo OliviaRossi/Qwen3.8-27B-SuperAdapter, un modelo de lenguaje de 27.320.697.856 parametros (aproximadamente 27,3 mil millones) construido sobre la arquitectura Qwen3.5 y publicado bajo licencia Apache 2.0. El autor de la cuantizacion es mradermacher, un conocido creador de cuantizaciones GGUF que produce versiones con imatrix para reducir la perdida de calidad respecto a las cuantizaciones estaticas convencionales.

El modelo original incorpora la etiqueta "lora-merge", lo que indica que se ha construido fusionando adaptadores LoRA sobre un modelo base de la familia Qwen3.5, y la etiqueta "agentic-coding" sugiere un enfoque de ajuste orientado a tareas de codigo con agentes. Segun la model card del cuantizador, se trata de un modelo de vision, por lo que los ficheros mmproj (proyector multimodal) estarian disponibles en el repositorio estatico complementario.

Este repositorio es relevante para desarrolladores que quieran ejecutar un modelo de 27B en hardware de consumo o en servidores modestos mediante llama.cpp u otros motores compatibles con GGUF, con opciones de cuantizacion que van desde 11,3 GB (i1-Q2_K) hasta 22,5 GB (i1-Q6_K). La licencia Apache 2.0 permite uso comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de la familia Qwen3.5 (tag `qwen3_5`); modelo multimodal (vision) segun la model card |
| Parametros totales | 27.320.697.856 (27,3B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-Q2_K, i1-Q3_K_S, i1-IQ3_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-Q4_0, i1-Q4_K_S, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K; fichero imatrix incluido |
| Idiomas soportados | en (segun la model card del cuantizador) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones i1 con imatrix); pesos originales en safetensors en el repositorio base |

## Arquitectura y entrenamiento

El modelo subyacente pertenece a la familia Qwen3.5 (tags `qwen3_5` y `qwen3.8`), con 27,3 mil millones de parametros y estructura de transformer denso. La etiqueta `lora-merge` indica que el checkpoint publicado por OliviaRossi se obtuvo fusionando uno o varios adaptadores LoRA sobre un modelo base, probablemente con el objetivo de especializarlo en tareas de codigo agentico (`agentic-coding`). La model card del cuantizador menciona explicitamente que es un modelo de vision, lo que implica la existencia de un proyector multimodal (mmproj) que se distribuye por separado en el repositorio de cuantizaciones estaticas.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron fases de RLHF o DPO. Tampoco se documentan innovaciones tecnicas especificas como decodificacion especulativa o atencion lineal. La cuantizacion i1 de mradermacher utiliza ficheros imatrix generados a partir del modelo original para ponderar la cuantizacion por capas, lo que en la practica reduce la perplejidad frente a cuantizaciones estaticas del mismo tamano; el autor incluye una tabla comparativa de calidad por tipo de cuantizacion.

## Capacidades

- Generacion de texto conversacional y razonamiento general, heredadas del modelo base Qwen3.5.
- Especializacion en codigo agentico segun la etiqueta `agentic-coding`: generacion de codigo, edicion multi-paso y tareas de agente.
- Capacidades de vision: la model card indica que es un modelo de vision y remite a los ficheros mmproj del repositorio estatico.
- Compatibilidad con endpoints (`endpoints_compatible`), lo que facilita su despliegue detras de APIs compatibles con OpenAI.
- Soporte de tool calling y function calling: no confirmado explicitamente en la informacion disponible, aunque el enfoque agentico del ajuste lo hace plausible.
- Capacidades multilingues: la model card solo declara ingles (`en`); no se confirma soporte de castellano ni otros idiomas.
- Modo thinking o razonamiento explicito: no disponible en la informacion proporcionada.

## Casos de uso

- Asistencia a la programacion en local: con cuantizaciones i1-Q4_K_M (17,1 GB) el modelo cabe en una GPU de 24 GB y permite autocompletado, refactorizacion y explicacion de codigo sin depender de APIs externas, manteniendo el codigo en la maquina del desarrollador.
- Agentes de codigo autonomos: el ajuste orientado a `agentic-coding` lo hace adecuado para pipelines que encadenan lectura de repositorio, edicion de ficheros y ejecucion de tests en bucle, siempre que el motor de inferencia soporte plantillas de herramientas.
- Procesamiento de documentacion tecnica con imagenes: al ser un modelo de vision, puede extraer informacion de diagramas de arquitectura, capturas de pantalla de errores o tablas escaneadas, combinando el proyector mmproj con el modelo principal.
- Despliegue en servidores sin GPU dedicada de gran capacidad: la cuantizacion i1-Q2_K (11,3 GB) permite ejecucion en CPU con llama.cpp o en GPUs de 12-16 GB, util para prototipos y entornos de desarrollo.
- Generacion de codigo en produccion con vLLM o TGI: el repositorio base en safetensors y la compatibilidad con endpoints permiten servir el modelo detras de una API interna, con la ventaja de la licencia Apache 2.0 para uso comercial.
- Fine-tuning posterior y experimentacion: al ser un merge de LoRA sobre Qwen3.5, sirve como punto de partida para nuevos adaptadores en dominios especificos, reutilizando el ecosistema de herramientas de la familia Qwen.
- Evaluacion comparativa de cuantizaciones: el repositorio incluye 14 variantes GGUF y el fichero imatrix, lo que permite medir el impacto de la cuantizacion en tareas concretas antes de fijar una version para produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (pesos mas overhead de contexto y cache KV):
  - i1-Q2_K: ~11,3 GB, apto para GPU de 12-16 GB o ejecucion en CPU.
  - i1-IQ3_M / i1-Q3_K_M: ~13-14 GB, apto para GPU de 16 GB.
  - i1-Q4_K_M: ~17,1 GB, recomendado para GPU de 24 GB (RTX 3090, RTX 4090, A10G).
  - i1-Q5_K_M: ~19,7 GB, requiere 24 GB con contexto moderado.
  - i1-Q6_K: ~22,5 GB, cerca del limite de 24 GB; contexto largo puede requerir offloading.
- GPU recomendadas: RTX 4090 (24 GB) para cuantizaciones Q4-Q5; A100 40/80 GB o H100 para el modelo en BF16 o Q6_K con contexto amplio; RTX 3090 como alternativa economica a la 4090.
- Cabe en GPU de consumo: si, en RTX 3090/4090 con cuantizaciones hasta Q5_K_M; en GPUs de 16 GB con IQ3_M o Q3_K_M; en GPUs de 12 GB solo con Q2_K y contexto reducido.
- Opciones de despliegue: llama.cpp y sus derivados (Ollama, LM Studio, koboldcpp) para GGUF; vLLM y TGI para el modelo base en safetensors; el tag `endpoints_compatible` sugiere compatibilidad con servidores de API tipo OpenAI.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B-SuperAdapter-i1-GGUF (este) | 27,3B | no disponible | Apache 2.0 | GGUF (i1, imatrix) | Vision, ajuste agentic-coding, 14 cuantizaciones |
| Qwen3.8-27B-SuperAdapter (base) | 27,3B | no disponible | Apache 2.0 | safetensors | Modelo original en transformers |
| Qwen3.8-27B-SuperAdapter-GGUF (estatico) | 27,3B | no disponible | Apache 2.0 | GGUF (estatico) | Incluye ficheros mmproj para vision |
| Otros modelos de ~27B de la familia Qwen | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables en la informacion proporcionada |

No se dispone de informacion suficiente para comparar rendimiento numerico con alternativas de la misma categoria; los datos de benchmarks no estan publicados en la informacion disponible.

## Limitaciones y advertencias

- La model card solo declara ingles (`en`); el rendimiento en castellano no esta verificado y podria ser inferior al de modelos multilingues explicitos.
- No se documentan sesgos conocidos ni evaluaciones de seguridad del modelo original ni del merge de LoRA; se recomienda auditoria propia antes de uso en produccion.
- Riesgo de alucinacion inherente a los modelos de 27B sin datos de evaluacion publicados; no hay benchmarks que permitan estimar su tasa de error en tareas factuales.
- La longitud de contexto no esta documentada en la informacion disponible, lo que impide planificar casos de uso con documentos largos.
- El repositorio es una cuantizacion de terceros (mradermacher), no el modelo oficial; la calidad final depende del proceso de cuantizacion y del fichero imatrix, aunque el autor documenta la comparativa de calidad por tipo.
- Las capacidades de vision requieren descargar los ficheros mmproj del repositorio estatico complementario, no incluidos en este repositorio i1.
- Aunque la licencia Apache 2.0 permite uso comercial, el modelo base y los datos de entrenamiento originales no estan documentados en detalle; conviene verificar la procedencia del checkpoint OliviaRossi antes de un despliegue comercial.
- El modelo tiene 27,3B parametros, por lo que la inferencia en CPU es lenta y las cuantizaciones bajas (Q2_K, Q3) degradan la calidad de forma perceptible.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Qwen3.8-27B-SuperAdapter-i1-GGUF
- Modelo base: https://huggingface.co/OliviaRossi/Qwen3.8-27B-SuperAdapter
- Cuantizaciones estaticas (incluye mmproj): https://huggingface.co/mradermacher/Qwen3.8-27B-SuperAdapter-GGUF
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#Qwen3.8-27B-SuperAdapter-i1-GGUF
- Ejemplo de uso de GGUF (README de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico de calidad de cuantizaciones de ikawrakow: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- FAQ y peticiones de modelos de mradermacher: https://huggingface.co/mradermacher/model_requests
