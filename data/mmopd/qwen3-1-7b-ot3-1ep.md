# MMOPD/Qwen3-1.7B-OT3-1ep

## Resumen

`MMOPD/Qwen3-1.7B-OT3-1ep` es un ajuste fino de tipo SFT de **Qwen/Qwen3-1.7B-Base** sobre el conjunto completo **OpenThoughts3-1.2M** (1,2 millones de ejemplos de cadenas de razonamiento largas en matematicas, codigo y ciencia). Lo publica el proyecto MMOPD (multi-teacher on-policy distillation) como *student* generalista de razonamiento, punto de partida para sus profesores de dominio y para experimentos de destilacion on-policy. Es, por tanto, una recreacion abierta de la receta OpenThinker3 a escala 1,7B.

El modelo es un transformer decoder-only denso de 2.031.739.904 parametros (aproximadamente 2,03B, algo mas que la etiqueta comercial "1,7B" del modelo base) y se distribuye en safetensors con licencia Apache-2.0. Se entreno con plantilla de chat de Qwen3 en modo *thinking*: toda respuesta comienza con un bloque `<think> ... </think>` antes del texto final, por lo que necesita muestreo (no decodificacion greedy) para funcionar bien.

El checkpoint subido corresponde al paso 2.200 de 4.312 (epoca 1,02 de un entrenamiento de 2 epocas), con perdida de entrenamiento de 0,953. El autor indica explicitamente que **este checkpoint no se ha evaluado por separado**: las cifras finales corresponden al checkpoint de 2 epocas (`MMOPD/Qwen3-1.7B-OT3-2ep`). Su relevancia es doble: por un lado es un *reasoner* pequeno y abierto, ejecutable en GPU de consumo; por otro, es una pieza intermedia de una familia de destilacion multi-profesor, util para quien quiera reproducir o continuar ese pipeline.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (familia Qwen3); sin MoE |
| Parametros totales | 2.031.739.904 (dato real de safetensors) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No especificada en la ficha del modelo. Entrenado con secuencias de 18.432 tokens; el autor sugiere `--max-model-len 40960` en vLLM y usó un presupuesto de generacion de 32.768 tokens en sus pruebas |
| Tipos de cuantizacion | No se publican cuantizaciones propias; el repo contiene pesos bf16 en safetensors (convertibles a GGUF/AWQ/GPTQ por terceros) |
| Idiomas soportados | en (ingles); no se declaran otros idiomas |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (transformers); repo de 4,1 GB |

## Arquitectura y entrenamiento

Arquitectura transformer decoder-only estandar de Qwen3 en su variante densa pequena, sin mezcla de expertos ni mecanismos alternativos (no hay SSM ni atencion hibrida). El ajuste se hizo sobre `Qwen/Qwen3-1.7B-Base` con la plantilla de chat de Qwen3 en modo *thinking* y el dataset completo OpenThoughts3-1.2M, compuesto por trazas de razonamiento de matematicas, codigo y ciencia. No se menciona ninguna fase de RLHF, DPO o RL posterior: es SFT puro sobre cadenas de pensamiento.

Detalles del entrenamiento segun la model card: longitud de secuencia de 18.432 tokens con *sequence packing* (aplanado, sin atencion cruzada entre ejemplos), 2 epocas planificadas (4.312 pasos de optimizador, 2.156 por epoca), optimizador AdamW con LR pico 8e-5, 5% de *warmup*, batch global de 512 secuencias empaquetadas (unos 8,1 millones de tokens por paso), precision bf16 y paralelismo de datos ZeRO-2 con transformers 4.57, trl 0.29 y DeepSpeed sobre A100-80GB. El checkpoint publicado esta en el paso 2.200 (epoca 1,02) y su perdida de entrenamiento es 0,953, con checkpoints guardados cada 100 pasos. La innovacion tecnica no esta en la arquitectura sino en el pipeline: este modelo actua como *student* inicial de MMOPD para generar profesores de dominio (`MMOPD/Qwen3-4B-OT3-{medical,law,finance,if}`) y para destilacion on-policy.

## Capacidades

- Generacion de texto conversacional con plantilla de chat de Qwen3.
- Razonamiento explicito en modo *thinking*: emite un bloque `<think> ... </think>` antes de la respuesta final.
- Razonamiento matematico de varios pasos, entrenado sobre trazas de OpenThoughts3.
- Razonamiento sobre codigo y problemas cientificos, tambien presentes en el dataset de SFT.
- Capacidad de mantener cadenas de pensamiento largas: el autor usa presupuestos de generacion de hasta 32.768 tokens.
- Soporte de conversacion multi-turno mediante plantilla de chat.
- No se documenta soporte de tool calling o function calling en la informacion disponible.
- No se documenta soporte explicito de agentes o multi-step tool use en la informacion disponible.
- Multilingue: no. Solo se declara ingles (`en`).
- Sin capacidades de vision ni audio.
- Modo no-thinking: la ficha solo describe `enable_thinking=True`; no se documenta el modo sin pensamiento.

## Casos de uso

- Razonamiento matematico asistido: el modelo resuelve problemas tipo competicion paso a paso (por ejemplo, el ejemplo de la model card sobre enteros positivos n < 1000 con n² + 1 divisible por 5), adecuado para tutoria o generacion de soluciones verificables a posteriori.
- Generacion de explicaciones tecnicas para documentacion: al producir una traza `<think>`, permite separar el razonamiento interno de la respuesta final y publicar solo esta ultima.
- Base para destilacion on-policy: es exactamente el uso previsto por MMOPD, como *student* inicial sobre el que aplicar profesores de dominio (medicina, derecho, finanzas, instrucciones).
- Filtrado y anotacion de datos de razonamiento: puede generar cadenas de pensamiento para nuevos problemas que luego se revisan y se usan como datos de SFT.
- Prototipado de asistentes de estudio en local: con cuantizacion de 4 bits cabe en GPUs de consumo, lo que permite desplegar un tutoria de matematicas sin conexion.
- Evaluacion de infraestructura de inferencia: su tamano reducido y su formato de salida largo lo hacen util para medir throughput de vLLM o TGI con presupuestos de generacion grandes (32k tokens).
- Investigacion sobre formatos de razonamiento: permite estudiar como afectan temperatura, top_p y top_k a la calidad y longitud de la traza, o comparar 1 epoca frente a 2 epocas con el checkpoint hermano.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye una seccion "Evaluation" vacia y afirma explicitamente que este checkpoint no se ha evaluado por separado; remite al checkpoint de 2 epocas para las cifras finales. En la tabla de entrenamiento solo se reporta la perdida final de entrenamiento en este punto: 0,953.

## Requisitos de hardware

- Pesos en bf16: aproximadamente 4,1 GB de VRAM solo para los pesos (coincide con el tamano del repo).
- Estimacion orientativa de VRAM en inferencia, sumando pesos y cache KV: unos 5-6 GB en bf16 para contextos cortos, unos 2-3 GB en cuantizacion de 8 bits y en torno a 1,5-2,5 GB en 4 bits.
- La cache KV crece de forma lineal con la longitud de contexto; con presupuestos de generacion de 32k tokens y `--max-model-len 40960` en vLLM conviene reservar varios GB adicionales.
- Cabe en GPU de consumo: una RTX 3060 de 12 GB o una RTX 4060 Ti de 16 GB son suficientes en bf16 con contextos moderados; en 4 bits cabe tambien en GPUs de 8 GB.
- GPU de datacenter recomendadas para produccion: A100-80GB y H100 para lotes grandes y contextos de 40k tokens; A10G/L4 o RTX 4090 para servicio de baja latencia.
- Despliegue: el autor documenta transformers y vLLM (`vllm serve MMOPD/Qwen3-1.7B-OT3-1ep --max-model-len 40960`). La etiqueta `text-generation-inference` indica compatibilidad con TGI. No se publican pesos GGUF, por lo que llama.cpp u Ollama requieren una conversion previa por parte del usuario.
- Ajustes de muestreo recomendados por el autor: `do_sample=True`, temperature 0,6, top_p 0,95, top_k 20, `max_new_tokens=32768`.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MMOPD/Qwen3-1.7B-OT3-1ep | 2,03B | Entrenado a 18.432 tokens; 40.960 sugerido en vLLM | SFT sobre OpenThoughts3-1.2M, modo thinking | Apache-2.0 | HuggingFace, safetensors |
| MMOPD/Qwen3-1.7B-OT3-2ep | No disponible en la informacion proporcionada (mismo base, 2 epocas) | No disponible | Mismo pipeline, checkpoint final | Apache-2.0 | HuggingFace, safetensors |
| MMOPD/Qwen3-4B-OT3-2ep | No disponible en la informacion proporcionada (escala 4B) | No disponible | Mismo pipeline, punto de partida de los profesores de dominio | Apache-2.0 | HuggingFace |
| Qwen/Qwen3-1.7B (oficial) | 1,7B (etiqueta comercial) | No disponible en la informacion proporcionada | Modelo instruct generalista con modos thinking y no-thinking | Apache-2.0 | HuggingFace, multiples formatos |
| DeepSeek-R1-Distill-Qwen-1.5B | 1,78B | No disponible en la informacion proporcionada | Destilado de razonamiento a partir de R1 | No disponible en la informacion proporcionada | HuggingFace |

Los datos de los modelos comparadores externos a la familia MMOPD no provienen de la busqueda web realizada para esta ficha; deben verificarse en sus respectivas model cards antes de usarse en una decision de produccion. No se dispone de cifras de rendimiento comparadas para ningun modelo de esta tabla.

## Limitaciones y advertencias

- Es un checkpoint intermedio (epoca 1,02 de 2), no el checkpoint final: el autor recomienda consultar el modelo de 2 epocas para resultados definitivos.
- No hay ninguna evaluacion publicada para este checkpoint, por lo que su calidad real es desconocida.
- Solo se declara soporte de ingles; el rendimiento en castellano u otros idiomas no esta documentado y es previsiblemente inferior.
- El modelo base Qwen3-1.7B-Base puede arrastrar sesgos de su corpus de preentrenamiento; no se documenta ningun proceso de alineacion o mitigacion de sesgos mas alla del SFT.
- Riesgo de alucinacion: al ser un modelo de 1,7B con cadenas de pensamiento largas, puede producir trazas plausibles pero incorrectas, especialmente en matematicas y codigo. La traza `<think>` no garantiza que el resultado final sea correcto.
- Los datos de OpenThoughts3-1.2M son en gran parte generados o sinteticos; pueden contener errores que el modelo aprenda a reproducir.
- El formato de salida obliga a parsear el bloque `<think>` y a usar muestreo; la decodificacion greedy degrada el comportamiento segun el autor.
- Generar hasta 32.768 tokens por respuesta multiplica coste y latencia, con el consiguiente impacto en la cache KV y en el coste por consulta.
- Licencia Apache-2.0: permite uso comercial y modificacion con las obligaciones habituales de atribucion y aviso de cambios; no se declaran restricciones adicionales.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validacion comunitaria independiente.
- La busqueda web realizada no devolvio ningun resultado relacionado con el modelo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/MMOPD/Qwen3-1.7B-OT3-1ep
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B-Base
- Checkpoint hermano de 2 epocas: https://huggingface.co/MMOPD/Qwen3-1.7B-OT3-2ep
- Dataset de entrenamiento: https://huggingface.co/datasets/open-thoughts/OpenThoughts3-1.2M
- Family de profesores de dominio: `MMOPD/Qwen3-4B-OT3-{medical,law,finance,if}` (referenciados en la model card, sin URL directa en la informacion proporcionada)
- Paper, blog o repositorio del proyecto MMOPD: no disponible en la informacion proporcionada
- Demo: no disponible en la informacion proporcionada
- La busqueda web realizada no devolvio resultados relevantes: los unicos resultados obtenidos eran portales de autenticacion del dominio ac-besancon.fr, sin relacion con el modelo.
