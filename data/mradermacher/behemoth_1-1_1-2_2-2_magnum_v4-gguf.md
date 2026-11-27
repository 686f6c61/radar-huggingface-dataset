# mradermacher/Behemoth_1.1_1.2_2.2_Magnum_V4-GGUF

## Resumen

Behemoth_1.1_1.2_2.2_Magnum_V4 es un modelo de lenguaje de gran escala (122.610.069.504 parametros, aproximadamente 122,6 mil millones) creado mediante la tecnica de fusion de modelos (model merging) con la herramienta mergekit. El modelo original fue publicado por el usuario alansmithee-cpu, y esta ficha describe la version cuantizada en formato GGUF producida por mradermacher, un conocido creador de cuantizaciones estaticas e imatrix para la comunidad open source.

El modelo se presenta como un modelo conversacional (tag "conversational") orientado principalmente al idioma ingles, segun los metadatos de la model card. Al tratarse de una fusion de modelos, no existe documentacion publica sobre la composicion exacta del dataset de entrenamiento, el proceso de alineacion ni los resultados de evaluacion. La model card del repositorio GGUF es puramente operativa: describe los tipos de cuantizacion disponibles y como usarlos, sin aportar informacion sobre capacidades o rendimiento.

La relevancia de esta ficha radica en que permite desplegar un modelo de 122,6 mil millones de parametros en hardware mas modesto gracias a las cuantizaciones GGUF, que van desde Q2_K (45,3 GB) hasta Q8_0 (130,4 GB). Es un ejemplo tipico del ecosistema de modelos fusionados de la comunidad, donde la trazabilidad y la documentacion tecnica son limitadas y el usuario debe evaluar el modelo por si mismo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo fusionado con mergekit; presumiblemente transformer decoder-only, sin confirmar) |
| Parametros totales | 122.610.069.504 (aprox. 122,6 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 (estaticas); versiones imatrix en repositorio separado |
| Idiomas soportados | ingles (segun metadatos de la model card) |
| Licencia | mrl (Mistral Research License 0.1, segun license_link) |
| Formato de pesos | GGUF (cuantizado); el modelo base en safetensors |

## Arquitectura y entrenamiento

No se dispone de informacion tecnica sobre la arquitectura interna del modelo base. Los metadatos indican que fue creado con mergekit, lo que implica que es el resultado de la combinacion de los pesos de varios modelos preexistentes mediante alguna tecnica de fusion (posiblemente SLERP, TIES, DARE u otra, aunque no se especifica cual). El nombre "Behemoth_1.1_1.2_2.2_Magnum_V4" sugiere una version 4 de una fusion acumulativa, pero no hay documentacion que lo confirme.

No se han publicado datos sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo fases de RLHF, DPO o fine-tuning supervisado. Tampoco se documentan innovaciones tecnicas como decodificacion especulativa o atencion lineal. La model card del repositorio GGUF se limita a listar los archivos cuantizados y enlazar a la guia de uso de TheBloke para ficheros GGUF multiparte.

## Capacidades

- Generacion de texto conversacional en ingles, segun el tag "conversational" del repositorio.
- Capacidad de razonamiento y generacion de codigo: no confirmada explicitamente, pero plausible dado el tamano del modelo; no hay documentacion que lo verifique.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: limitadas al ingles segun los metadatos; no se documentan otros idiomas.
- Capacidades especiales (modo thinking, vision, audio): no disponible.

## Casos de uso

- Experimentacion con modelos fusionados de gran escala: el modelo permite a investigadores probar el comportamiento de una fusion de 122,6 mil millones de parametros en formato GGUF sin necesidad de infraestructura de entrenamiento, usando llama.cpp u Ollama en estaciones de trabajo con suficiente RAM o VRAM.
- Generacion de texto creativo en ingles: con cuantizaciones Q4_K_M (73,3 GB) o Q5_K_M (86,6 GB) se puede ejecutar en servidores con 96-128 GB de RAM y obtener texto conversacional de calidad aceptable para prototipos.
- Evaluacion comparativa de tecnicas de fusion: al ser una fusion versionada (V4), sirve como caso de estudio para medir como evoluciona la calidad entre iteraciones de merging, comparando respuestas cualitativas entre versiones.
- Despliegue en entornos con GPU de gran memoria: la cuantizacion Q8_0 (130,4 GB) puede cargarse en configuraciones multi-GPU (por ejemplo, 2x H100 80 GB) para inferencia de alta fidelidad en ingles.
- Base para fine-tuning ligero posterior: aunque el modelo es grande, las versiones Q4_K_S o Q4_K_M permiten experimentar con adaptadores LoRA sobre GGUF en pipelines de investigacion, siempre que se respete la licencia MRL.
- Servicio de chat interno de baja concurrencia: con llama.cpp server o vLLM (si se convierte el modelo) se puede ofrecer un endpoint conversacional en ingles para equipos pequenos, asumiendo latencias altas por el tamano del modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio GGUF no incluye metricas de MMLU, HumanEval, GSM8K ni ninguna otra evaluacion, y el modelo base tampoco aporta datos en la informacion proporcionada.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia (segun cuantizacion): Q2_K requiere unos 45,3 GB; Q3_K_M unos 59,2 GB; Q4_K_M unos 73,3 GB; Q5_K_M unos 86,6 GB; Q6_K unos 100,7 GB; Q8_0 unos 130,4 GB. Hay que anadir overhead de contexto y de la propia aplicacion (tipicamente 2-8 GB adicionales).
- GPU recomendadas: para Q4_K_M o superiores, GPUs con 80 GB de VRAM (A100 80GB, H100 80GB) o configuraciones multi-GPU. Para Q2_K o Q3_K_S, una unica GPU de 48 GB (A6000, L40S) podria ser suficiente, aunque con margen ajustado.
- Cabe en consumer GPU: no de forma completa. Una RTX 4090 (24 GB) no puede alojar ninguna cuantizacion completa; seria necesario usar offloading parcial a RAM del sistema, con penalizacion severa de latencia. Configuraciones con 2x RTX 4090 (48 GB) solo cubririan Q2_K con offloading parcial.
- Opciones de despliegue: llama.cpp (soporte nativo GGUF), Ollama (importando el GGUF), llama-cpp-python, y servidores compatibles con la API de OpenAI mediante llama.cpp server. vLLM y TGI no soportan GGUF de forma nativa para este tamano sin conversion previa a safetensors.
- Latencia y throughput estimados: no disponibles. Para un modelo de 122,6B en Q4_K_M, es razonable esperar decenas de tokens por segundo en configuraciones multi-GPU de gama alta y muy por debajo de 10 tokens/s en configuraciones con offloading a RAM, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Behemoth_1.1_1.2_2.2_Magnum_V4 (esta ficha) | 122,6B | no disponible | MRL | GGUF | Fusion con mergekit, solo ingles |
| Mistral Large 2 | 123B | 128K (segun documentacion publica de Mistral) | MRL | safetensors | Modelo oficial de Mistral, con documentacion y benchmarks |
| Llama 3.1 70B | 70B | 128K | Llama 3.1 Community License | safetensors, GGUF | Menor tamano, ecosistema amplio, benchmarks publicos |
| Qwen2.5 72B | 72B | 128K | Apache 2.0 (segun publicacion de Qwen) | safetensors, GGUF | Alternativa open source con licencia permisiva |

La comparativa se basa en caracteristicas publicas de modelos de tamano similar; no se dispone de datos de rendimiento del modelo de esta ficha para establecer comparaciones cuantitativas. La licencia MRL es restrictiva para uso comercial, similar a la de Mistral Large 2, mientras que Qwen2.5 72B ofrece Apache 2.0.

## Limitaciones y advertencias

- Documentacion practicamente inexistente: no hay informacion sobre arquitectura, datos de entrenamiento, alineacion ni evaluacion. El modelo no debe usarse en produccion sin una evaluacion propia exhaustiva.
- Riesgo de alucinacion: sin datos de alineacion ni benchmarks, el riesgo de alucinacion es desconocido y potencialmente alto, especialmente en tareas factuales.
- Sesgos conocidos: no documentados. Al ser una fusion de modelos, los sesgos de los modelos originales se heredan sin control explicito.
- Limitacion de idioma: solo se declara ingles; el rendimiento en castellano u otros idiomas no esta verificado y probablemente sea deficiente.
- Restricciones de licencia: la licencia MRL (Mistral Research License 0.1) restringe el uso comercial. Es imprescindible revisar los terminos en https://mistral.ai/licenses/MRL-0.1.md antes de cualquier despliegue productivo.
- Requisitos de hardware muy elevados: incluso la cuantizacion mas pequena (Q2_K, 45,3 GB) excede la VRAM de GPUs de consumo, lo que limita su uso a servidores o configuraciones con offloading.
- Calidad de cuantizaciones bajas: Q2_K y Q3_K_S degradan notablemente la calidad; la propia model card recomienda Q4_K_S o Q4_K_M como opciones rapidas y Q6_K/Q8_0 para maxima calidad.
- Ficheros multiparte: Q6_K y Q8_0 se distribuyen en tres partes que deben concatenarse correctamente antes de su uso.
- Modelo de comunidad sin mantenimiento garantizado: el autor original (alansmithee-cpu) y el cuantizador (mradermacher) no ofrecen soporte ni garantias de actualizacion.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Behemoth_1.1_1.2_2.2_Magnum_V4-GGUF
- Modelo base: https://huggingface.co/alansmithee-cpu/Behemoth_1.1_1.2_2.2_Magnum_V4
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/Behemoth_1.1_1.2_2.2_Magnum_V4-i1-GGUF
- Pagina de resumen de descargas: https://hf.tst.eu/model#Behemoth_1.1_1.2_2.2_Magnum_V4-GGUF
- Licencia MRL 0.1: https://mistral.ai/licenses/MRL-0.1.md
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Grafico de calidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
