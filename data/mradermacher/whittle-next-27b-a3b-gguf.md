# mradermacher/Whittle-Next-27B-A3B-GGUF

## Resumen

Whittle-Next-27B-A3B es un modelo de lenguaje de tipo Mixture of Experts (MoE) desarrollado por whittleOrg, publicado originalmente en formato safetensors y distribuido aqui en cuantizaciones GGUF por mradermacher. Con 27.553.461.376 parametros totales y la nomenclatura "A3B" que sugiere aproximadamente 3.000 millones de parametros activos por token, el modelo se posiciona en la franja de MoE de grano fino orientados a razonamiento, codigo y matematicas, con soporte explicito de modo "thinking" y contexto largo.

La arquitectura incorpora innovaciones tecnicas poco habituales en modelos de su clase: hyper-connections, memoria basada en n-gramas y embeddings por capa (per-layer embeddings), ademas de un pipeline de destilacion de conocimiento con destilacion online. El modelo esta etiquetado como "qwen4_exp" y "qwen3", lo que sugiere una base o linaje derivado de la familia Qwen, aunque la model card no detalla la relacion exacta. Los idiomas declarados son ingles, chino y multilingue.

La relevancia actual del modelo reside en su combinacion de tamano total moderado (27,5B) con activacion dispersa, lo que permite desplegarlo en hardware de consumo con cuantizaciones agresivas (desde 10,4 GB en Q2_K) manteniendo capacidades de razonamiento y generacion de codigo. La licencia Apache 2.0 facilita su adopcion comercial. Esta ficha documenta la version GGUF, que es la unica disponible publicamente en el repositorio analizado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE) con hyper-connections, n-gram memory y per-layer embeddings |
| Parametros totales | 27.553.461.376 |
| Parametros activos | no disponible (la nomenclatura A3B sugiere ~3B activos, sin confirmacion oficial) |
| Longitud de contexto | no disponible (etiquetado como long-context) |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, F16 (mencionado en metadatos) |
| Idiomas soportados | en, zh, multilingual |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo es un transformer de tipo Mixture of Experts con 27,55 mil millones de parametros totales. La model card y las etiquetas indican el uso de hyper-connections (una variante de conexiones residuales que permite mayor profundidad efectiva y mejor flujo de gradiente), memoria basada en n-gramas (mecanismo de recuperacion de patrones locales que puede mejorar la coherencia en secuencias largas) y embeddings por capa (representaciones especificas por nivel, en lugar de un unico embedding de entrada compartido). Estas tres innovaciones son poco frecuentes en modelos MoE comerciales y apuntan a un diseno experimental orientado a eficiencia y calidad de razonamiento.

El entrenamiento incluye destilacion de conocimiento con destilacion online, segun las etiquetas del repositorio. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF o DPO. Tampoco se detalla el numero de expertos, la estrategia de enrutamiento ni el ratio de activacion. Las etiquetas "qwen4_exp" y "qwen3" sugieren un linaje o inspiracion en la familia Qwen, pero la model card no confirma esta relacion ni los detalles del tokenizador.

## Capacidades

- Generacion de texto conversacional y de proposito general.
- Razonamiento explicito con modo "thinking" (etiqueta `thinking`).
- Generacion de codigo (etiqueta `code`).
- Razonamiento matematico (etiqueta `math`).
- Contexto largo (etiqueta `long-context`), aunque la longitud exacta no esta disponible.
- Capacidades multilingues: ingles, chino y otros idiomas (etiqueta `multilingual`).
- Compatibilidad con llama.cpp para inferencia en CPU y GPU.
- Compatibilidad con endpoints (etiqueta `endpoints_compatible`).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no confirmado explicitamente, aunque el modo thinking y las capacidades de codigo lo hacen plausible.
- Vision o audio: no disponible.

## Casos de uso

- Razonamiento asistido en entornos de desarrollo: el modo thinking permite al modelo exponer cadenas de razonamiento antes de responder, util para depuracion de logica compleja y revision de algoritmos en IDE o asistentes de codigo.
- Generacion de codigo en pipelines de CI/CD: con cuantizacion Q4_K_M (16,9 GB) puede ejecutarse en una GPU de 24 GB y generar tests, parches o documentacion tecnica de forma automatizada.
- Analisis de documentos largos: la etiqueta long-context y la memoria n-gram sugieren buen rendimiento en resumen y extraccion de informacion sobre contratos, informes o articulos extensos.
- Asistencia matematica y cientifica: el modelo esta entrenado para razonamiento matematico, adecuado para resolver problemas paso a paso, verificar derivaciones o generar ejercicios resueltos.
- Despliegue en hardware de consumo: la cuantizacion Q2_K (10,4 GB) permite ejecutar el modelo en GPUs de 12-16 GB o en CPU con llama.cpp, habilitando prototipado local sin infraestructura cloud.
- Atencion al cliente multilingue: con soporte de ingles y chino, puede gestionar conversaciones multi-turno en centros de soporte para mercados angloparlantes y sinofonos.
- Investigacion en arquitecturas MoE: al incorporar hyper-connections, n-gram memory y per-layer embeddings, es un banco de pruebas para estudiar el impacto de estas tecnicas en eficiencia y calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (pesos + overhead de contexto):
  - Q2_K: ~10,4 GB de pesos; ~12-14 GB con contexto moderado.
  - Q3_K_M: ~13,4 GB; ~15-17 GB con contexto.
  - Q4_K_M: ~16,9 GB; ~19-21 GB con contexto.
  - Q5_K_M: ~19,7 GB; ~22-24 GB con contexto.
  - Q6_K: ~22,8 GB; ~25-27 GB con contexto.
  - Q8_0: ~29,4 GB; ~32-34 GB con contexto.
- GPU recomendadas:
  - RTX 4090 (24 GB): Q4_K_M y Q5_K_M con contexto moderado; Q6_K justo.
  - RTX 3090 / 4080 (16-24 GB): Q4_K_S o IQ4_XS.
  - A100 40 GB / H100 80 GB: Q8_0 o F16 con contexto largo.
  - GPUs de 12 GB (RTX 3060, 4070): Q2_K o Q3_K_S con contexto reducido.
- Cabe en GPU de consumo: si, en RTX 3060 12 GB (Q2_K), RTX 4070/4080 (Q3-Q4), RTX 4090 (Q4-Q6).
- Opciones de despliegue: llama.cpp (formato nativo GGUF), Ollama (importando el GGUF), servidores compatibles con endpoints. vLLM y TGI no soportan GGUF de forma nativa; requeririan el modelo base en safetensors.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros totales | Activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Whittle-Next-27B-A3B | 27,55B | ~3B (no confirmado) | no disponible | Apache 2.0 | GGUF, safetensors |
| Qwen3-30B-A3B | 30B | ~3B | 128K (segun Qwen3) | Apache 2.0 | safetensors, GGUF |
| Mixtral 8x7B | 46,7B | ~12,9B | 32K | Apache 2.0 | safetensors, GGUF |
| DeepSeek-V2-Lite | 15,7B | 2,4B | 32K | DeepSeek License | safetensors |

La comparativa con Qwen3-30B-A3B es la mas directa por tamano y ratio de activacion, aunque no se dispone de datos de rendimiento de Whittle-Next para establecer una comparacion cuantitativa. Mixtral 8x7B tiene mas parametros activos y contexto documentado. DeepSeek-V2-Lite es mas pequeno pero con licencia mas restrictiva.

## Limitaciones y advertencias

- No se han publicado benchmarks, por lo que el rendimiento real frente a modelos establecidos es desconocido.
- El numero de parametros activos no esta confirmado oficialmente; la nomenclatura A3B es una inferencia, no un dato verificado.
- La longitud de contexto no esta especificada, lo que dificulta planificar despliegues con ventanas largas.
- El modelo esta etiquetado como "research" y "exp" (experimental), lo que sugiere que puede no estar maduro para produccion critica.
- Riesgo de alucinacion inherente a los modelos de lenguaje; no hay evaluaciones de factualidad publicadas.
- Sesgos desconocidos: no se documenta la composicion del dataset ni procesos de alineacion, por lo que no se pueden evaluar sesgos de genero, raza o idioma.
- Soporte de tool calling y function calling no confirmado; verificar antes de integrar en agentes.
- La version GGUF la produce un tercero (mradermacher), no el autor original; la calidad de las cuantizaciones no esta validada por whittleOrg.
- No hay cuantizaciones con imatrix disponibles segun la model card, lo que puede reducir la calidad en cuantizaciones bajas (Q2, Q3).
- El repo pesa 188,7 GB, lo que implica descargas largas si se quieren multiples cuantizaciones.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Whittle-Next-27B-A3B-GGUF
- Modelo base: https://huggingface.co/whittleOrg/Whittle-Next-27B-A3B
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#Whittle-Next-27B-A3B-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico de calidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- nethype GmbH: https://www.nethype.de/
