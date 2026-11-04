# mradermacher/PhantomReasoning-Qwen3-1.7B-gsminf-GGUF

## Resumen

PhantomReasoning-Qwen3-1.7B-gsminf es un modelo de razonamiento en ingles derivado de Qwen3-1.7B, desarrollado por el grupo de investigacion kilian-group y afinado mediante GRPO (Group Relative Policy Optimization) con la libreria TRL. El objetivo declarado es mejorar el razonamiento multi-salto (multi-hop reasoning) y el rendimiento en problemas tipo GSM, con un enfasis particular en el dataset "GSM-Infinite" y el corpus propietario kilian-group/phantom-reasoning. El modelo base cuenta con 2.031.739.904 parametros totales, lo que lo situa en la categoria de modelos pequenos, aptos para despliegue en hardware modesto.

La ficha que nos ocupa corresponde a la version cuantizada en GGUF publicada por mradermacher, que ofrece un abanico de cuantizaciones estaticas (de Q2_K a f16) para facilitar la inferencia local con llama.cpp y herramientas compatibles. No se trata de un modelo nuevo, sino de una redistribucion del checkpoint original en formato GGUF, por lo que sus capacidades y limitaciones son las del modelo base.

Su relevancia actual radica en la tendencia hacia modelos pequenos especializados en razonamiento, que pueden ejecutarse en GPU de consumo y en CPU, y que sirven como banco de pruebas para tecnicas de RL aplicadas al razonamiento. Al estar licenciado bajo Apache 2.0, es utilizable comercialmente sin restricciones adicionales, aunque su alcance linguistico se limita al ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivado de Qwen3-1.7B); no se detalla en la informacion disponible |
| Parametros totales | 2.031.739.904 (2,03 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (version cuantizada); el modelo base original en safetensors |

## Arquitectura y entrenamiento

El modelo base es un Qwen3-1.7B, es decir, un transformer decoder-only de la familia Qwen3 con aproximadamente 2.000 millones de parametros. Sobre ese checkpoint, kilian-group aplico un ajuste fino con GRPO mediante TRL, una tecnica de aprendizaje por refuerzo que optimiza directamente la recompensa sin necesidad de un modelo critico separado, comparando respuestas dentro de un grupo. El entrenamiento se realizo sobre el dataset kilian-group/phantom-reasoning y esta orientado a tareas de razonamiento multi-salto y a problemas de tipo GSM (problemas matematicos de enunciado), con mencion explicita a "gsm-infinite" en el nombre del checkpoint.

No se dispone en la informacion proporcionada de detalles sobre el numero de tokens de entrenamiento, la composicion exacta del dataset, la existencia de fases de SFT previas o de DPO, ni innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal. La model card del repositorio GGUF es una plantilla generica de mradermacher y no aporta informacion sobre el proceso de entrenamiento mas alla de los tags (grpo, trl, reasoning, multi-hop-reasoning, gsm-infinite).

## Capacidades

- Generacion de texto en ingles con enfasis en razonamiento paso a paso.
- Razonamiento multi-salto (multi-hop reasoning), segun los tags del modelo y el dataset de entrenamiento.
- Resolucion de problemas matematicos de enunciado (estilo GSM), segun el nombre del checkpoint "gsminf".
- Conversacion multi-turno (tag "conversational").
- Compatibilidad con endpoints (tag "endpoints_compatible").
- No se ha documentado soporte de tool calling, function calling, agentes, vision, audio ni modo thinking explicito en la informacion disponible.
- Capacidades multilingues limitadas al ingles.

## Casos de uso

- Prototipado de razonamiento matematico: el modelo puede emplearse para resolver problemas de enunciado tipo GSM en entornos de investigacion, gracias a su ajuste con GRPO sobre el dataset phantom-reasoning y su mencion a gsm-infinite.
- Experimentacion con RL para razonamiento: sirve como punto de partida reproducible para investigadores que quieran comparar tecnicas de GRPO en modelos de ~2 B de parametros, ya que el checkpoint base y el dataset estan publicados.
- Inferencia local en equipos modestos: las cuantizaciones Q4_K_S y Q4_K_M (1,3-1,4 GB) permiten ejecutar el modelo en portatiles y mini-PC con llama.cpp u Ollama, sin GPU dedicada.
- Educacion y demostraciones: util para mostrar cadenas de razonamiento multi-salto en talleres o clases, con un coste computacional minimo.
- Evaluacion comparativa de cuantizaciones: el repositorio ofrece 12 variantes de cuantizacion, lo que facilita estudiar el impacto de la cuantizacion en tareas de razonamiento.
- Filtrado y generacion de datos sinteticos de razonamiento: el modelo puede generar trazas de razonamiento en ingles para aumentar datasets de entrenamiento, aunque con supervision humana por el riesgo de alucinacion.
- Backend ligero para asistentes conversacionales en ingles: al ser conversacional y compatible con endpoints, puede integrarse en servicios de chat de bajo coste.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,0-1,4 GB en cuantizaciones Q2_K a Q4_K_M; 1,5-1,8 GB en Q5_K_S a Q6_K; 2,3 GB en Q8_0; 4,2 GB en f16 (sin contar overhead de contexto y KV cache).
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM (GTX 1650, RTX 3050, RTX 4060, RTX 4090) puede ejecutar las cuantizaciones Q4-Q8 con holgura; en A100/H100 el modelo queda sobredimensionado y se desaprovecha el hardware.
- Cabe en GPU consumer: si, en practicamente todas las GPU modernas con 4 GB o mas; tambien en CPU mediante llama.cpp.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, y servidores compatibles con endpoints (el tag "endpoints_compatible" sugiere compatibilidad con APIs tipo OpenAI). vLLM y TGI no estan confirmados para este repo GGUF en la informacion disponible.
- Latencia y throughput: no disponibles en la informacion proporcionada; por el tamano (2 B) se espera un throughput alto en GPU consumer, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| PhantomReasoning-Qwen3-1.7B-gsminf (este) | 2,03 B | no disponible | Apache 2.0 | GGUF, safetensors | Ajuste GRPO para razonamiento multi-salto y GSM |
| Qwen3-1.7B (base) | ~1,7 B | no disponible | Apache 2.0 | safetensors, GGUF | Modelo generalista sin ajuste especifico de razonamiento |
| DeepSeek-R1-Distill-Qwen-1.5B | ~1,5 B | no disponible | MIT (según modelo base) | safetensors, GGUF | Destilado de razonamiento, ampliamente usado en la categoria |
| Phi-3-mini / Phi-3.5-mini | ~3,8 B | 128 K (Phi-3) | MIT | safetensors, GGUF | Mayor tamano, orientado a razonamiento y codigo |

La comparacion se limita a parametros, licencia y formato, ya que no se dispone de resultados de benchmarks del modelo en la informacion proporcionada. El contexto y el rendimiento de las alternativas no se detallan aqui por falta de datos verificados en esta ficha.

## Limitaciones y advertencias

- Sesgos: no documentados en la informacion disponible; al entrenarse principalmente en ingles y sobre un dataset de investigacion, puede heredar sesgos del corpus y del modelo base Qwen3.
- Riesgo de alucinacion: presente como en cualquier modelo de ~2 B; las trazas de razonamiento pueden contener pasos plausibles pero incorrectos, especialmente en problemas matematicos complejos.
- Limitacion de idioma: solo se declara soporte de ingles; el rendimiento en castellano no esta garantizado ni evaluado.
- Longitud de contexto: no disponible; no se debe asumir una ventana larga sin verificacion empirica.
- Licencia: Apache 2.0 permite uso comercial, pero conviene revisar las condiciones del modelo base Qwen3 y del dataset phantom-reasoning por si imponen restricciones adicionales.
- Modelo de investigacion: el nombre "phantom-reasoning" y la ausencia de benchmarks publicados sugieren que no esta validado para produccion; se recomienda evaluacion propia antes de desplegarlo.
- Cuantizaciones bajas (Q2_K, Q3_K_S) pueden degradar notablemente el razonamiento; para tareas sensibles se recomienda Q5_K_M o superior.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/PhantomReasoning-Qwen3-1.7B-gsminf-GGUF
- Modelo base: https://huggingface.co/kilian-group/PhantomReasoning-Qwen3-1.7B-gsminf
- Dataset: https://huggingface.co/datasets/kilian-group/phantom-reasoning
- Pagina de descargas de mradermacher: https://hf.tst.eu/model#PhantomReasoning-Qwen3-1.7B-gsminf-GGUF
- FAQ y peticiones de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
