# mradermacher/Eva-9B-GGUF

## Resumen

Eva-9B-GGUF es la version cuantizada en formato GGUF del modelo Eva-9B, un modelo de lenguaje causal afinado para turco y desarrollado originalmente por el usuario aydndglr. La cuantizacion la realiza mradermacher, un conocido publicador de versiones GGUF de modelos open source, y esta pensada para facilitar la inferencia local en hardware de consumo mediante llama.cpp y herramientas compatibles. El modelo base emplea la arquitectura Gemma 2 de Google, con aproximadamente 9.240 millones de parametros, y ha sido afinado con la libreria Unsloth segun los metadatos de la model card.

El interes de esta publicacion es practico: ofrece el modelo original en un espectro amplio de cuantizaciones estaticas (desde Q2_K hasta f16), lo que permite desplegarlo desde entornos con muy poca VRAM hasta configuraciones de mayor calidad. Al estar especializado en turco, cubre un nicho con relativamente pocas alternativas de calidad en el ecosistema open source, y su compatibilidad con endpoints y con el ecosistema transformers/llama.cpp lo hace util para prototipado rapido.

No obstante, la informacion publicada es limitada: no se detalla la composicion del dataset de entrenamiento, no hay resultados de benchmarks y la licencia no esta declarada en la ficha de HuggingFace. Esto condiciona su uso en produccion, especialmente en lo relativo a restricciones legales y a la evaluacion objetiva de su calidad frente a alternativas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 2, segun tags del modelo) |
| Parametros totales | 9.241.705.984 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | Turco (tr) |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones); modelo base en safetensors/transformers |

## Arquitectura y entrenamiento

El modelo base Eva-9B se construye sobre la arquitectura Gemma 2, un transformer decoder-only con atencion por ventanas alternada y atencion global, tal como corresponde a la familia Gemma 2 de Google. Los tags de la model card indican que el afinamiento se realizo con Unsloth, una libreria optimizada para fine-tuning eficiente en memoria, aunque no se especifica si se empleo LoRA, QLoRA u otra tecnica, ni el volumen o composicion del dataset de entrenamiento. Tampoco se documenta si hubo fases de RLHF, DPO o similar.

La publicacion que nos ocupa es una cuantizacion estatica realizada por mradermacher con `quantize_version: 2` y `output_tensor_quantised: 1`, segun los metadatos embebidos. El autor indica que no hay cuantizaciones ponderadas/imatrix disponibles en el momento de la publicacion, y que podrian solicitarse mediante una discusion en la comunidad. El repositorio ocupa 83,5 GB en total, lo que refleja la suma de todas las variantes de cuantizacion incluidas.

## Capacidades

- Generacion de texto conversacional en turco, con formato de chat (tag `conversational`).
- Modelo causal de lenguaje (`causal-lm`), adecuado para completado y generacion libre.
- Afinamiento especifico para turco, lo que deberia mejorar la fluidez y naturalidad en ese idioma frente al modelo base.
- Compatibilidad con endpoints (`endpoints_compatible`), lo que facilita su despliegue en infraestructuras tipo Inference Endpoints.
- Soporte de inferencia local via llama.cpp y derivados (Ollama, LM Studio, etc.) gracias al formato GGUF.
- No se documentan capacidades de tool calling, agentes, vision, audio ni modo thinking en la informacion disponible.

## Casos de uso

- Asistentes conversacionales en turco: el modelo puede gestionar dialogos multi-turno en turco con una calidad superior a la del modelo base generico, adecuado para chatbots de atencion al cliente en ese idioma.
- Prototipado local en equipos de desarrollo: gracias a las cuantizaciones Q4_K_S y Q4_K_M (5,6-5,9 GB), se puede ejecutar en portatiles con GPU de gama media para iterar rapidamente sobre prompts y flujos.
- Generacion de contenido editorial en turco: redaccion de borradores, resumenes y parafraseo para medios o marketing dirigidos al publico turco.
- Traduccion asistida y localizacion: como modelo especializado en turco, puede emplearse como componente de un pipeline de localizacion (por ejemplo, traduccion ingles-turco con revision humana).
- Educacion y tutoria: generacion de explicaciones y material didactico en turco para plataformas de aprendizaje.
- Investigacion en NLP turco: evaluacion de modelos afinados de ~9B en tareas turcas, comparando cuantizaciones para estudiar el impacto de la precision en la calidad.
- Despliegue en entornos con recursos limitados: las variantes Q2_K (3,9 GB) y Q3_K_S (4,4 GB) permiten ejecucion en CPU o GPUs con poca VRAM para tareas de baja latencia no criticas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (aproximada, segun tamano de cuantizacion):
  - Q2_K: ~4-5 GB
  - Q3_K_S / Q3_K_M / Q3_K_L: ~5-6 GB
  - IQ4_XS / Q4_K_S / Q4_K_M: ~6-7 GB
  - Q5_K_S / Q5_K_M: ~7-8 GB
  - Q6_K: ~8-9 GB
  - Q8_0: ~10-11 GB
  - f16: ~19-20 GB
- GPU recomendadas: RTX 3060 12 GB o RTX 4060 Ti 16 GB para cuantizaciones Q4-Q6; RTX 4090 24 GB para Q8_0 y f16; A100/H100 para despliegues de alta concurrencia con f16 o multiples instancias.
- Cabe en GPU de consumo: si, en la mayoria de cuantizaciones Q4-Q6 con GPUs de 8-12 GB; las variantes Q2/Q3 pueden ejecutarse incluso en CPU.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, y servidores compatibles con GGUF; el modelo base (safetensors) puede servirse con vLLM o TGI si se dispone de la version original.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Eva-9B-GGUF (este) | 9,24 B | no disponible | Turco | no disponible | GGUF |
| Gemma 2 9B (base) | ~9 B | 8.192 tokens (tipico en Gemma 2 9B) | Multilingue | Gemma Terms of Use | safetensors, GGUF |
| Llama 3.1 8B | ~8 B | 128.000 tokens | Multilingue | Llama 3.1 Community License | safetensors, GGUF |
| Qwen 2.5 7B | ~7 B | 128.000 tokens | Multilingue (incluye turco) | Apache 2.0 (mayoria de variantes) | safetensors, GGUF |

La comparativa es orientativa: no se dispone de datos de rendimiento de Eva-9B para confrontar con estas alternativas. La principal ventaja de Eva-9B es su especializacion en turco; sus desventajas son la falta de licencia declarada y la ausencia de benchmarks publicos.

## Limitaciones y advertencias

- Licencia no declarada: no se puede confirmar si el uso comercial esta permitido; es imprescindible verificar la licencia del modelo base aydndglr/Eva-9B y de Gemma 2 antes de usarlo en produccion.
- Ausencia de benchmarks: no hay evidencia publica de calidad frente a alternativas; conviene evaluar con un conjunto de validacion propio en turco.
- Riesgo de alucinacion: como todo modelo causal de ~9B, puede generar afirmaciones incorrectas con aparente seguridad, especialmente en dominios especializados.
- Sesgos: al estar afinado sobre un dataset no documentado, pueden persistir sesgos del corpus de entrenamiento y del modelo base Gemma 2; no se han publicado analisis de sesgo.
- Limitaciones idiomaticas: el modelo esta orientado a turco; su rendimiento en castellano u otros idiomas no esta garantizado y probablemente sea inferior al de modelos multilingues.
- Contexto no documentado: se desconoce la longitud de contexto efectiva del afinamiento; asumir la de Gemma 2 9B puede no ser correcto tras el fine-tuning.
- Cuantizaciones de baja precision: Q2_K y Q3_K_S degradan la calidad de forma notable; para produccion se recomienda Q4_K_M o superior.
- Sin cuantizaciones imatrix: el autor indica que no estan disponibles, lo que puede suponer una ligera perdida de calidad frente a variantes ponderadas de otros publicadores.
- Repositorio grande (83,5 GB): descargar el repo completo es costoso; conviene descargar solo el archivo GGUF necesario.

## Enlaces

- HuggingFace (este modelo): https://huggingface.co/mradermacher/Eva-9B-GGUF
- Modelo base: https://huggingface.co/aydndglr/Eva-9B
- Pagina de conveniencia del autor para este modelo: https://hf.tst.eu/model#Eva-9B-GGUF
- Repositorio de solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
