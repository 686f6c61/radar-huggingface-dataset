# goldhub/Qwen3.8-27B-BF16-INT4-W4A16-G32-AutoRound

## Resumen

Qwen3.8-27B-INT4-W4A16-AutoRound es una variante cuantizada a 4 bits del modelo vision-lenguaje Qwen3.8-27B, publicada por el usuario goldhub sobre la arquitectura original del equipo Qwen. Emplea la tecnica AutoRound (v0.15.0) con esquema W4A16 —pesos de 4 bits y activaciones de 16 bits—, grupo de cuantizacion de tamano 32, cuantizacion simetrica y 1000 iteraciones de calibracion. El resultado es un checkpoint de aproximadamente 28,3 GB que preserva en FP16/BF16 las capas criticas (encoder visual, proyecciones `linear_attn.*`, embeddings y `lm_head`), lo que evita la degradacion multimodal y el colapso de atencion tipicos de las cuantizaciones agresivas.

El modelo mantiene la ventana de contexto de 256K tokens del original, el soporte nativo de entradas de imagen y video (con tamano de parche temporal 2) y la capacidad de Multi-Token Prediction (MTP). La model card declara ademas un alineamiento de tipo "heretic" o semidescensurado, orientado a razonamiento filosofico, escritura creativa y exploracion tecnica sin rechazos corporativos.

Es relevante ahora porque ofrece un equilibrio poco habitual entre calidad multimodal y requisitos de VRAM: al conservar ciertas capas en precision completa, el repo pesa mas que un INT4 convencional (que rondaria 15-18 GB) pero se mantiene desplegable en configuraciones de doble GPU de consumo como 2x RTX 3090 con tensor parallelism, algo imposible para el BF16 original (~54 GB).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (vision-lenguaje) con atencion lineal hibrida y Multi-Token Prediction (MTP); tipo `qwen3_5` |
| Parametros totales | 11.575.659.760 (dato real de safetensors); el nombre comercial indica 27B, discrepancia no aclarada en la model card |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 tokens (256K); `max_position_embeddings: 262144` |
| Tipos de cuantizacion | INT4 W4A16 (AutoRound v0.15.0), grupo 32, simetrica, 1000 iteraciones; formato `auto_round:auto_gptq`; capas `embed_tokens`, `model.visual.*` y `linear_attn.*` conservadas en FP16/BF16 |
| Idiomas soportados | en, zh, ru, uk, el, he |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 28,3 GB) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un transformer multimodal que procesa texto, imagen y video de forma nativa, con un encoder visual integrado y un mecanismo de atencion lineal (`linear_attn`) junto a proyecciones qkv/z y out_proj. Incorpora Multi-Token Prediction (MTP), una cabeza auxiliar que predice varios tokens por paso para acelerar la decodificacion, y una ventana de contexto de 262.144 tokens. La variante aqui descrita no reentrena el modelo: aplica cuantizacion post-entrenamiento con AutoRound, un algoritmo que optimiza los parametros de redondeo mediante calibracion supervisada, en este caso con 1000 iteraciones y granularidad de grupo 32.

La decision tecnica destacable es la preservacion selectiva de capas en FP16/BF16: el encoder visual, las proyecciones de atencion lineal y los embeddings quedan fuera de la cuantizacion. Esto explica que el repo pese 28,3 GB en lugar de los 15-18 GB habituales de un INT4 y que, segun el autor, el modelo mantenga estabilidad en contextos de 128K-256K. No se documentan en la informacion disponible los datos de entrenamiento del modelo base (numero de tokens, composicion del corpus, uso de RLHF/DPO), ni el proceso de alineamiento "heretic" mas alla de la declaracion cualitativa de la model card.

## Capacidades

- Generacion de texto y razonamiento multi-paso, con formato de paso a paso y LaTeX en problemas matematicos y de fisica (el autor cita problemas de velocidad relativa y acertijos clasicos).
- Comprension de imagen (image-text-to-text) y de video (video-text-to-text), con parche temporal de tamano 2.
- Generacion de codigo: la model card menciona codigo Python conforme a PEP-8 y una implementacion optimizada del cribado de Eratostenes con `bitarray`, incluyendo analisis de complejidad y arnes de benchmarking.
- Contexto largo: sintesis y resumen de documentos extensos, citado con el ejemplo de una historia de los LLM desde Word2Vec hasta arquitecturas MoE y MTP.
- Multi-Token Prediction (MTP) para acelerar la inferencia.
- Capacidades multilingues en ingles, chino, ruso, ucraniano, griego y hebreo.
- Escritura creativa y ensayo filosofico sin filtros corporativos declarados (alineamiento "semi-uncensored").
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes: no disponible en la informacion proporcionada.

## Casos de uso

- Analisis de documentos largos con imagenes intercaladas: informes financieros, patentes o expedientes con graficos y tablas pueden procesarse en una sola pasada gracias a los 256K tokens de contexto, sin necesidad de trocear y perder coherencia entre secciones.
- Transcripcion y descripcion de video para catalogacion de archivo audiovisual: el soporte video-text-to-text con parche temporal 2 permite resumir clips y generar metadatos indexables en pipelines de ingestion.
- Asistencia a la programacion en produccion: generacion de codigo Python conforme a PEP-8 y explicacion de complejidad algoritmica, util en revisiones de codigo automatizadas o generacion de tests; requiere validar el soporte real de tool calling antes de integrarlo en CI/CD.
- Despliegue en laboratorios con hardware de consumo: con 2x RTX 3090 y `tensor-parallel-size=2` se puede servir el modelo con contexto de 128K, lo que habilita prototipado de asistentes multimodales sin presupuesto de centro de datos.
- Investigacion en alineamiento y seguridad: al declararse semidescensurado, sirve como contrapunto en estudios comparativos sobre tasas de rechazo, sesgo y comportamiento en prompts sensibles frente a modelos alineados convencionalmente.
- Generacion de contenido creativo y narrativo de largo aliento: ficcion cyberpunk o noir con continuidad argumental gracias al contexto extendido, y ensayo filosofico sobre temas que los modelos con guardarrailes suelen declinar.
- Resumen y traduccion entre los seis idiomas soportados (en, zh, ru, uk, el, he) en entornos editoriales o de inteligencia competitiva.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K) en la informacion disponible. La model card solo incluye pruebas cualitativas internas del autor y una cifra de velocidad:

| Metrica | Valor | Fuente |
|---|---|---|
| Velocidad de generacion | ~56,6 tok/s en hardware de consumo estandar (sin especificar GPU) | Model card del autor |
| Razonamiento matematico | Resuelve acertijos y problemas de velocidad relativa con paso a paso | Prueba cualitativa del autor |
| Generacion de codigo | Codigo Python PEP-8; cribado de Eratostenes con `bitarray` | Prueba cualitativa del autor |
| Contexto largo | Sintesis de la historia de los LLM | Prueba cualitativa del autor |

No se dispone de comparaciones numericas con el modelo BF16 original ni con otras cuantizaciones del mismo base.

## Requisitos de hardware

- VRAM estimada: el repo ocupa 28,3 GB en disco; en inferencia hay que sumar cache KV para el contexto. Con 32K tokens de contexto el autor propone `--max-model-len 32768` en una sola GPU, lo que sugiere un minimo practico en torno a 30-32 GB de VRAM para contextos moderados.
- Configuracion recomendada por el autor: 2x RTX 3090 (24 GB cada una) con `tensor-parallel-size=2`, `--max-model-len 131072` y `--max-num-seqs 2` para sostener 128K-256K de contexto con batching conservador.
- GPU de centro de datos: A100 80 GB o H100 permiten servir el modelo en una sola tarjeta con contextos amplios; no se documentan cifras de throughput para estas configuraciones.
- GPU de consumo: cabe en 2x RTX 3090; en una unica RTX 4090 (24 GB) no cabe el checkpoint completo en VRAM, por lo que requeriria offloading o contextos muy reducidos.
- Opciones de despliegue: vLLM (`--trust-remote-code`), SGLang (`--trust-remote-code`) y Transformers con `AutoProcessor` y `AutoModelForCausalLM` en `torch.float16` y `device_map="auto"`. No se menciona soporte de llama.cpp, Ollama ni TGI.
- Latencia y throughput: ~56,6 tok/s segun la model card, sin especificar el hardware exacto ni el tamano de batch; tratar la cifra como orientativa.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| goldhub/Qwen3.8-27B-INT4-W4A16-AutoRound | 11,58B reales (27B nominales) | 256K | INT4 W4A16 AutoRound, capas criticas en FP16 | Apache 2.0 | Hugging Face, 276 descargas, 40 likes |
| Qwen/Qwen3.8-27B (base) | 27B nominales | 256K | BF16 | Apache 2.0 (presumible, no confirmado en la informacion) | Hugging Face |
| Cuantizacion INT4 convencional del mismo base | 27B nominales | 256K | INT4 sin preservacion de capas | Apache 2.0 | No disponible como artefacto concreto en la informacion |

No se dispone de datos de rendimiento comparativo entre estas variantes; la diferencia documentada es de tamano (28,3 GB frente a ~54 GB del BF16 y 15-18 GB de un INT4 estandar, segun el autor) y la preservacion de capas multimodales en precision completa.

## Limitaciones y advertencias

- Discrepancia de parametros: el nombre indica 27B pero los safetensors declaran 11.575.659.760 parametros. Conviene verificar la arquitectura real antes de dimensionar infraestructura.
- El alineamiento "semi-uncensored" o "heretic" implica ausencia de guardarrailes corporativos; inadecuado para aplicaciones orientadas a usuarios finales sin una capa de moderacion propia.
- Riesgo de alucinacion inherente a los modelos de lenguaje, agravado por la cuantizacion a 4 bits; las pruebas de la model card son cualitativas y no cuantifican la perdida de calidad respecto al BF16.
- La cuantizacion AutoRound con calibracion de 1000 iteraciones no garantiza ausencia de degradacion en tareas fuera de la distribucion de calibracion, especialmente en vision con imagenes atipicas.
- Cobertura linguistica limitada a seis idiomas (en, zh, ru, uk, el, he); el espanol no figura entre los soportados.
- Requiere `--trust-remote-code` en vLLM, SGLang y Transformers, lo que implica ejecutar codigo del repositorio; auditar antes de desplegar en produccion.
- El contexto completo de 256K exige hardware de gama alta y batching muy reducido (`--max-num-seqs 2` en la configuracion de 2x RTX 3090); el rendimiento cae con contextos largos.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base y su procedencia deben verificarse de forma independiente; el autor de la cuantizacion es un usuario individual, no el equipo Qwen.
- No hay datos publicados de benchmarks estandarizados ni de evaluacion de sesgos; no se recomienda su adopcion en produccion sin una evaluacion propia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/goldhub/Qwen3.8-27B-INT4-W4A16-G32-AutoRound
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- AutoRound (repositorio del algoritmo de cuantizacion): no disponible en la informacion proporcionada
- Paper o blog tecnico del modelo base: no disponible en la informacion proporcionada
- Demo o espacio interactivo: no disponible en la informacion proporcionada
