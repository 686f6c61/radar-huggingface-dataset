# blaj/LFM2.5-24B-A2B-Uncensored-int8-ov

## Resumen

LFM2.5-24B-A2B-Uncensored-int8-ov es una conversion a OpenVINO IR con cuantizacion INT8 del modelo LiquidAI/LFM2.5-24B-A2B, un transformer de tipo Mixture of Experts (MoE) con 24.000 millones de parametros totales y 2.000 millones de parametros activos por token (top-4 sobre 64 expertos). El autor de la conversion es el usuario blaj, que publica esta variante optimizada para inferencia en GPU Intel Arc mediante OpenVINO GenAI. El modelo base esta desarrollado por LiquidAI y esta pensado para generacion de texto y conversacion.

La particularidad de esta version es doble: por un lado, incorpora un adaptador LoRA de rango 1 denominado `atomic.abliterate` (variante `r24-all-14-39-perlayer`) fusionado en las capas 14 a 39 con escala 1,75, lo que elimina el comportamiento de rechazo y censura del modelo original; por otro, el checkpoint se ha exportado por capas independientes y reensamblado en un unico grafo con estado, comprimido con NNCF en INT8 asimetrico por canal. El resultado es un paquete de 23 GB listo para ejecutarse con `openvino_genai.LLMPipeline` en GPU.

Es relevante porque demuestra un flujo de conversion viable para modelos MoE hibridos de gran tamano en hardware de consumo (se cita un equipo con 30 GB de memoria), y porque ofrece una alternativa sin censura del modelo de LiquidAI con un rendimiento medido de 30 tok/s en una iGPU Intel Core Ultra 7 258V. La licencia LFM Open License v1.0 condiciona su redistribucion y uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `Lfm2MoeForCausalLM` (transformer MoE hibrido conv/attention), 40 capas, 64 expertos, enrutamiento top-4 |
| Parametros totales | 24.000 millones (24B) |
| Parametros activos | 2.000 millones (2B) por token |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT8 asimetrico weight-only, por canal (NNCF); existe variante INT4 del mismo autor |
| Idiomas soportados | no disponible |
| Licencia | LFM Open License v1.0 (`lfm1.0`, marcada como `other`) |
| Formato de pesos | OpenVINO IR (modelo, tokenizer, detokenizer, `graph.pbtxt`, `ovms_config.json`) |
| Tamano del repositorio | 24,0 GB (modelo citado: 23 GB) |
| Libreria / runtime | `openvino` / OpenVINO GenAI (GPU) |
| Modelo base | LiquidAI/LFM2.5-24B-A2B |
| Finetune | LoRA `atomic.abliterate` rango 1, fusionado en capas 14-39, escala 1,75 |

## Arquitectura y entrenamiento

El modelo base es un transformer MoE de 40 capas con 64 expertos y enrutamiento top-4, lo que activa unos 2.000 millones de parametros por token sobre un total de 24.000 millones. La model card de la conversion describe la arquitectura como hibrida conv/attention: mantiene un estado de convolucion corto junto con el estado de atencion, lo que impide tratar su cache como un KV cache paginado convencional. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni el proceso de alineacion (RLHF/DPO) del modelo original en la informacion proporcionada.

El proceso de conversion merece atencion tecnica: el checkpoint original de 45 GB no cabia en un unico grafo en una maquina de 30 GB, por lo que cada capa se exporto de forma independiente preservando el estado hibrido conv/attention, los bloques MoE se extrajeron del export regular por capas y todos los fragmentos se comprimieron con NNCF en INT8 asimetrico por canal antes de injertarse en un unico IR con estado. El adaptador de abliteracion esta horneado en los pesos, de modo que no se necesita cargar ningun adaptador en tiempo de ejecucion. No hay informacion sobre innovaciones de decodificacion especulativa ni atencion lineal en la documentacion disponible.

## Capacidades

- Generacion de texto y conversacion multi-turno (pipeline `text-generation` / `conversational`).
- Razonamiento y generacion de codigo: capacidades heredadas del modelo base LiquidAI/LFM2.5-24B-A2B, sin benchmarks publicados en esta conversion.
- Comportamiento sin censura: el adaptador de abliteracion elimina los rechazos del modelo original en las capas 14-39.
- Soporte de tool calling / function calling: no confirmado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no confirmado en la informacion disponible.
- Capacidades multilingues: no disponible (los idiomas no estan declarados en la model card).
- Modo thinking, vision o audio: no disponible.
- Inferencia en GPU Intel Arc mediante OpenVINO GenAI.

## Casos de uso

- Despliegue en equipos con GPU Intel Arc: el paquete OpenVINO IR se carga directamente con `openvino_genai.LLMPipeline(..., "GPU")` y permite ejecutar un MoE de 24B en hardware integrado con 30 tok/s medidos, sin necesidad de CUDA ni de GPU dedicada de gran VRAM.
- Generacion de texto interactiva en local: con `GenerationConfig(max_new_tokens=256, temperature=0.7)` se obtiene un asistente conversacional de baja latencia en un portatil con Core Ultra, adecuado para prototipado y demos sin conexion.
- Investigacion sobre alineacion y abliteracion: al estar el adaptador fusionado y documentado (capas 14-39, escala 1,75), sirve como referencia reproducible para estudiar como afecta la eliminacion de rechazos al comportamiento del modelo.
- Procesamiento por lotes de documentos en estaciones de trabajo Intel: el formato OVMS (`ovms_config.json`) permite servir el modelo con OpenVINO Model Server en infraestructura x86 con aceleracion Arc.
- Evaluacion comparativa INT8 frente a INT4: el mismo autor publica una variante INT4 (37,8-43,6 tok/s) que permite medir el compromiso entre calidad y velocidad en el mismo hardware.
- Entornos con requisitos de contenido sin filtros: generacion de ficcion, role-play o analisis de textos sensibles donde los rechazos del modelo base resultan un obstaculo, asumiendo la responsabilidad legal del uso.

## Benchmarks y rendimiento

Unico dato publicado en la model card: throughput en un solo stream sobre Intel Core Ultra 7 258V (iGPU Arc), OpenVINO GenAI 2026.4.0, generacion de 128 tokens.

| Modelo | Throughput |
|---|---:|
| Esta build INT8 | 30,0 tok/s |
| Variante INT4 del mismo autor | ~37,8-43,6 tok/s |

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. El autor senala que el resultado anterior de ~8 tok/s correspondia al grafo denso sin fusionar y que esta build usa la misma estructura MoE tileada que el modelo INT4.

## Requisitos de hardware

- VRAM/memoria estimada: el modelo ocupa 23 GB en INT8, por lo que se necesita un dispositivo con al menos ~24 GB de memoria utilizable; el autor realizo la conversion en una maquina de 30 GB.
- GPU recomendadas: GPU Intel Arc (integrada o dedicada) compatible con OpenVINO GenAI; el benchmark se ejecuto en una iGPU Arc del Core Ultra 7 258V.
- Cabe en GPU de consumo: si, en iGPU Intel Arc con memoria compartida suficiente; no se documenta compatibilidad con RTX 4090, A100 ni H100, ya que el formato es OpenVINO IR y no CUDA.
- Opciones de despliegue: OpenVINO GenAI (`LLMPipeline`), OpenVINO Model Server (OVMS) mediante `ovms_config.json`. No es compatible con vLLM, llama.cpp, Ollama ni TGI en este formato; para llama.cpp existe una variante GGUF del mismo modelo sin censura publicada por otro autor.
- Latencia y throughput: 30,0 tok/s en single stream con generacion de 128 tokens en la iGPU citada.
- Limitacion de serving: no soporta continuous batching, porque el estado de convolucion corto del modelo hibrido no es un KV cache paginado.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Formato | Licencia | Rendimiento |
|---|---|---|---|---|---|---|
| Este modelo (INT8 OV) | 24B | 2B | no disponible | OpenVINO IR | LFM v1.0 | 30,0 tok/s (iGPU Arc) |
| blaj/LFM2.5-24B-A2B-Uncensored-int4-ov | 24B | 2B | no disponible | OpenVINO IR | LFM v1.0 | ~37,8-43,6 tok/s (misma iGPU) |
| Ishowbackup/LFM2.5-24B-A2B-Uncensored-GGUF | 24B | 2B | no disponible | GGUF | LFM v1.0 | no disponible |
| LiquidAI/LFM2.5-24B-A2B (base) | 24B | 2B | no disponible | safetensors | LFM v1.0 | no disponible |

Las tres variantes derivan del mismo checkpoint base y comparten arquitectura y licencia; difieren en el formato de pesos, el nivel de cuantizacion y la presencia del adaptador de abliteracion.

## Limitaciones y advertencias

- Modelo sin censura: el adaptador de abliteracion elimina los rechazos, por lo que puede generar contenido ofensivo, ilegal o peligroso; requiere moderacion externa en cualquier despliegue publico.
- Riesgo de alucinacion: inherente a los modelos de lenguaje; no se han publicado evaluaciones de fidelidad para esta conversion.
- Sin datos de calidad: no hay benchmarks que cuantifiquen la perdida de rendimiento por la cuantizacion INT8 ni por la fusion del adaptador.
- Contexto e idiomas no declarados: se desconoce la ventana de contexto maxima efectiva y la cobertura linguistica.
- Sin continuous batching: el estado conv del modelo hibrido no es paginable, lo que limita el throughput en escenarios de serving con muchas peticiones concurrentes.
- Compatibilidad restringida: el formato OpenVINO IR solo se ejecuta con el stack de Intel; no hay soporte para CUDA, vLLM ni llama.cpp.
- Licencia LFM Open License v1.0: impone condiciones al uso comercial y a la redistribucion; es necesario revisar el texto completo antes de integrarlo en un producto.
- Repositorio con muy poca traccion (10 descargas, 0 likes) y sin validacion de la comunidad; conviene verificar la integridad de los pesos antes de usarlo en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/blaj/LFM2.5-24B-A2B-Uncensored-int8-ov
- Variante INT4 del mismo autor: https://huggingface.co/blaj/LFM2.5-24B-A2B-Uncensored-int4-ov
- Variante GGUF sin censura: https://huggingface.co/Ishowbackup/LFM2.5-24B-A2B-Uncensored-GGUF
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-24B-A2B
