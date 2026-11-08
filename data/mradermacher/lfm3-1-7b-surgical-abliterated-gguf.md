# mradermacher/LFM3-1.7B-Surgical-Abliterated-GGUF

## Resumen

LFM3-1.7B-Surgical-Abliterated-GGUF es la distribucion en formato GGUF del modelo medismera/LFM3-1.7B-Surgical-Abliterated, una version del LiquidAI/LFM3-1.7B a la que se le ha aplicado una ablacion quirurgica del subespacio de rechazo (refusal subspace) mediante alineamiento direccional de representaciones latentes en capas criticas del transformer. El resultado es un modelo "uncensored" que elimina las negativas prefabricadas y las advertencias moralizantes, manteniendo segun el autor el conocimiento factual, la capacidad de codigo y el comportamiento conversacional del modelo original. El trabajo de cuantizacion lo firma mradermacher, un prolifico publicador de cuants estaticos en GGUF.

El modelo base LFM3-1.7B pertenece a la familia LFM3 de LiquidAI, con 1.728.801.600 parametros totales (aproximadamente 1,7 mil millones) y arquitectura causal-LM. Esta version GGUF esta pensada para inferencia local en CPU o GPU de gama baja mediante llama.cpp y ecosistemas compatibles, ya que los cuants van desde 0,9 GB (Q2_K) hasta 3,6 GB (f16). El repositorio ocupa 15,9 GB en total por acumular todas las variantes de cuantizacion.

La relevancia de esta ficha radica en dos factores: por un lado, permite ejecutar un modelo conversacional de 1,7B en hardware de consumo sin dependencia de la nube; por otro, documenta un caso de "abliteracion quirurgica" orientada a eliminar el comportamiento de rechazo, lo que tiene implicaciones eticas y de uso que conviene conocer antes de desplegarlo en produccion. El modelo esta etiquetado solo para ingles y su licencia figura como "other", heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal-LM (causal-lm), base LiquidAI/LFM3-1.7B con ablacion de rechazo |
| Parametros totales | 1.728.801.600 (1,7B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (ingles) |
| Licencia | other |
| Formato de pesos | GGUF (cuantizado); safetensors en el modelo base |

## Arquitectura y entrenamiento

El modelo parte de LiquidAI/LFM3-1.7B, un transformer causal de 1,7B parametros. Sobre esa base, medismera aplica una "abliteracion quirurgica" consistente en alineamiento direccional de representaciones latentes para eliminar el subespacio unificado de rechazo en capas criticas del transformer. Segun la model card del autor del modelo base, esta intervencion elimina negativas prefabricadas y advertencias moralizantes preservando el conocimiento factual, la capacidad de codigo y el comportamiento conversacional. No se detalla en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo fases de RLHF o DPO.

La cuantizacion la realiza mradermacher con su pipeline habitual (quantize_version 2, convert_type hf) y produce cuants estaticos; segun la propia model card, los cuants ponderados con imatrix no estaban disponibles en el momento de la publicacion. No se documentan innovaciones adicionales como decodificacion especulativa, atencion lineal o arquitecturas hibridas en la informacion proporcionada.

## Capacidades

- Generacion de texto conversacional multi-turno en ingles (tag `conversational`).
- Modelado de lenguaje causal (`causal-lm`).
- Comportamiento "uncensored": ausencia deliberada de rechazos prefabricados y advertencias moralizantes, segun el autor del modelo base.
- Preservacion declarada de conocimiento factual y capacidad de codigo tras la ablacion.
- No se documenta soporte de tool calling ni function calling en la informacion disponible.
- No se documenta soporte de agentes ni razonamiento multi-paso explicito.
- No se documenta capacidad multilingue mas alla del ingles.
- No se documenta modo thinking, vision ni audio.

## Casos de uso

- Inferencia local en equipos de desarrollador: con cuants Q4_K_M de 1,2 GB, el modelo cabe en cualquier portatil con 8 GB de RAM y permite prototipar asistentes conversacionales sin conexion a la nube.
- Experimentacion con tecnicas de ablacion: util para investigadores que quieran estudiar el efecto de eliminar el subespacio de rechazo sobre el comportamiento del modelo, comparando con el LFM3-1.7B original.
- Generacion de texto creativo sin filtros: escenarios de escritura de ficcion o guiones donde las advertencias moralizantes del modelo base resultan intrusivas.
- Evaluacion de robustez y seguridad: sirve como referencia controlada para medir como cambia la tasa de rechazo y la calidad factual tras una ablacion quirurgica.
- Despliegue en entornos con recursos muy limitados: el cuant Q2_K de 0,9 GB permite ejecutar el modelo en dispositivos de borde o contenedores con poca memoria.
- Base para fine-tuning ligero: al ser un modelo de 1,7B en GGUF, puede servir como punto de partida para adaptaciones de dominio en ingles con LoRA sobre el modelo base en safetensors.
- Pipeline de pruebas de regresion de cuantizaciones: util para comparar la degradacion de calidad entre Q2_K, Q4_K_M y Q8_0 en una misma tarea.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: aproximadamente 0,9 GB (Q2_K), 1,2 GB (Q4_K_M), 1,5 GB (Q6_K), 1,9 GB (Q8_0) y 3,6 GB (f16), segun los tamanos publicados en la model card.
- GPU recomendadas: no se especifican en la informacion disponible; por tamano, cualquier GPU consumer con 4 GB o mas de VRAM puede alojar los cuants de 4 y 5 bits.
- Cabe en GPU consumer: si, practicamente en cualquier GPU moderna (RTX 3060, RTX 4060, RTX 4090, e incluso iGPU con memoria unificada suficiente) usando cuants Q4 o Q5.
- Opciones de despliegue: llama.cpp y derivados (Ollama, LM Studio, llama-cpp-python); el formato GGUF es compatible con los endpoints del ecosistema indicado en los tags.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| LFM3-1.7B-Surgical-Abliterated-GGUF (este) | 1,7B | no disponible | other | GGUF | Ablacion de rechazo, solo ingles |
| LiquidAI/LFM3-1.7B | 1,7B | no disponible | no disponible | safetensors | Modelo original sin ablacion |
| medismera/LFM3-1.7B-Surgical-Abliterated | 1,7B | no disponible | other | safetensors | Version sin cuantizar del mismo modelo |

No se dispone de datos de rendimiento comparado (benchmarks) entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- La ablacion de rechazo elimina salvaguardas: el modelo puede generar contenido que el original rechazaria, con implicaciones de seguridad y cumplimiento normativo.
- Riesgo de alucinacion inherente a un modelo de 1,7B; no se han publicado evaluaciones de fidelidad factual tras la ablacion.
- Solo soporta ingles; no hay evidencia de capacidades multilingues.
- Licencia "other": es imprescindible revisar los terminos exactos del modelo base y del autor de la ablacion antes de cualquier uso comercial.
- No se documenta la longitud de contexto, lo que dificulta planificar aplicaciones con ventanas largas.
- El modelo base es de noviembre de 2026 y el repositorio GGUF no registra descargas ni likes en el momento de la consulta, por lo que carece de validacion comunitaria.
- Los cuants Q2_K y Q3 pueden degradar notablemente la calidad; la propia model card recomienda Q4_K_S o Q4_K_M como equilibrio rapido y Q8_0 como mejor calidad.
- No hay garantia de soporte de tool calling ni de comportamiento agentico; no debe asumirse en produccion sin validacion previa.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/LFM3-1.7B-Surgical-Abliterated-GGUF
- Modelo base (abliterado, safetensors): https://huggingface.co/medismera/LFM3-1.7B-Surgical-Abliterated
- Modelo original: https://huggingface.co/LiquidAI/LFM3-1.7B
- Pagina de descargas de mradermacher para este modelo: https://hf.tst.eu/model#LFM3-1.7B-Surgical-Abliterated-GGUF
- Solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Perfil del cuantizador: https://huggingface.co/mradermacher
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
