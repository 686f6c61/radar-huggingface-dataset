# clsx524/Qwen3.5-4B-uzu-EXL3-3bpw

## Resumen

Qwen3.5-4B-uzu-EXL3-3bpw es un paquete de pesos publicado por el usuario clsx524 que adapta el modelo base Qwen/Qwen3.5-4B al motor de inferencia uzu (proyecto trymirai), orientado a ejecucion local sobre Metal en Apple Silicon. No se trata de un modelo entrenado desde cero ni de un fine-tuning nuevo: es una reempaquetado de pesos ya cuantizados en EXL3 a 3,0 bits por peso (codebook mcg), acompanado de un borrador DFlash de 4 bits para decodificacion especulativa y de una tabla de embeddings/readout ligada a 4 bits.

El problema que resuelve es concreto: permitir ejecutar un modelo de la familia Qwen3.5-4B en portatiles Apple con un pico de memoria medido de 1,85 GB y unos 50 tok/s en decodificacion simple sobre un MacBook Air M5. El autor indica que los kernels de prefill y de multiples filas estan afinados para M5 y A19 Pro o posteriores, aprovechando las unidades matriciales de la GPU.

La relevancia del paquete es doble. Por un lado, sirve como banco de pruebas de cuantizacion extrema (3 bpw) con una degradacion medida y declarada: KLD de 0,052 frente a bf16 y perplejidad de 3,77 frente a 3,65. Por otro, ejemplifica el patron de distribucion "modelo + borrador + configuracion de motor" en un unico repositorio. El modelo todavia no tiene descargas ni valoraciones en HuggingFace, y no se han publicado resultados de benchmarks estandar en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso con capas lineales cuantizadas en EXL3 (trellis); la model card no especifica si el modelo base emplea MoE |
| Parametros totales | 688.682.496 segun el recuento de safetensors del repositorio; el modelo base se denomina Qwen3.5-4B, discrepancia no explicada en la model card |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | EXL3 trellis a 3,0 bpw (codebook mcg) en las capas lineales del transformer; embeddings y readout ligados a 4 bits; borrador DFlash a 4 bits |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors en el formato propio de uzu; requiere una build de uzu con soporte EXL3 (Exl3Spec) y carga por ruta de directorio |

Otros datos del repositorio: tamano de 2,1 GB, pipeline text-generation, 0 descargas y 0 likes en el momento de la consulta, y etiquetas que incluyen `uzu`, `exl3`, `on-device`, `apple-silicon` y `speculative-decoding`.

## Arquitectura y entrenamiento

La informacion disponible describe un transformer con las capas lineales cuantizadas mediante EXL3 trellis con codebook mcg a 3,0 bits por peso, mas una tabla de embeddings y readout ligada a 4 bits. El repositorio incluye tres componentes: `model.safetensors` con las lineales cuantizadas, los ficheros de configuracion y tokenizer de uzu (`config.json`, `tokenizer.json`, `encoding.json`), y un subdirectorio `speculator/` con el borrador DFlash de 4 bits, que genera borradores en arbol TopK de 16 nodos para decodificacion especulativa.

No hubo entrenamiento nuevo: el paquete se construye a partir de cuatro fuentes. Los pesos del modelo base Qwen/Qwen3.5-4B (Apache-2.0); las capas EXL3 de UnstableLlama/Qwen3.5-4B-exl3-3.00bpw (Apache-2.0) reempaquetadas para uzu; el borrador de z-lab/Qwen3.5-4B-DFlash (Apache-2.0) cuantizado a 4 bits; y la tabla de embeddings y la configuracion de la exportacion Mirai-M de 4 bits de Qwen3.5-4B realizada por el propio proyecto uzu. Por tanto, no se dispone de informacion sobre datos de entrenamiento, numero de tokens, composicion del dataset ni etapas de RLHF o DPO en el material proporcionado. La innovacion tecnica destacable es la combinacion de cuantizacion trellis a 3 bpw con decodificacion especulativa sobre kernels Metal afinados para las unidades matriciales de M5 y A19 Pro.

## Capacidades

- Generacion de texto en ingles, que es la tarea declarada en el pipeline del repositorio.
- Decodificacion especulativa integrada mediante un borrador DFlash de 4 bits con arboles TopK de 16 nodos, gestionada por el motor uzu.
- Inferencia on-device en Apple Silicon a traves de Metal, con carga de pesos por ruta de directorio y soporte EXL3.
- Reduccion de huella de memoria: pico medido de 1,85 GB durante la decodificacion, lo que permite ejecucion en equipos con memoria unificada reducida.
- Soporte de tool calling o function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: el repositorio declara unicamente `en`; no se documentan otros idiomas.
- Capacidades especiales (modo thinking, vision, audio): no disponibles en la informacion proporcionada.

## Casos de uso

- Asistente de texto local y sin conexion en un portatil Apple: el paquete se carga por ruta en uzu y ocupa un pico de 1,85 GB, de modo que puede mantenerse residente en un MacBook Air M5 mientras se usa para redactar o resumir en ingles.
- Generacion de texto en dispositivos con memoria limitada: los 3,0 bpw y el borrador de 4 bits reducen el espacio de pesos a un repositorio de 2,1 GB, lo que permite desplegar el modelo en equipos donde una version bf16 no entraria.
- Servicio de generacion de texto autoalojado en un Mac mini o Mac Studio: uzu expone el modelo como endpoint local, con lo que se evita enviar datos a APIs externas y se mantiene el coste marginal en electricidad.
- Investigacion en cuantizacion extrema: el autor publica KLD de 0,052 y perplejidad de 3,77 frente a 3,65 en bf16, cifras utiles para comparar el compromiso calidad/memoria de EXL3 a 3 bpw frente a otras tecnicas.
- Evaluacion de decodificacion especulativa: el subdirectorio `speculator/` permite medir la ganancia del borrador DFlash de 16 nodos sobre la decodificacion simple a unos 50 tok/s en M5.
- Procesamiento por lotes de texto en ingles fuera de linea: extraccion, reformateo o clasificacion de documentos en un flujo nocturno sobre hardware Apple, sin dependencia de red.
- Prototipado de aplicaciones de lenguaje en portatil antes de escalar a un modelo mayor: al compartir arquitectura con Qwen3.5-4B, los prompts y el tokenizer desarrollados sobre este paquete son trasladables al modelo base completo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible (no hay MMLU, HumanEval, GSM8K ni equivalentes). Las unicas metricas declaradas por el autor son de calidad de cuantizacion y de velocidad, medidas en un MacBook Air M5 con uzu:

| Metrica | Valor |
|---|---|
| Decodificacion simple | ~50 tok/s |
| Memoria pico | ~1,85 GB |
| KLD frente a bf16 (solo capas del transformer) | 0,052 |
| Perplejidad del paquete | 3,77 |
| Perplejidad de bf16 (referencia) | 3,65 |

## Requisitos de hardware

- Plataforma: Apple Silicon exclusivamente, a traves del backend Metal del motor uzu. No se documenta soporte para CUDA ni ROCm.
- Memoria: pico medido de 1,85 GB en decodificacion; el repositorio ocupa 2,1 GB en disco. Es apto para equipos con memoria unificada de 8 GB o superior.
- GPU recomendadas: el autor indica que el paquete esta afinado para M5 y A19 Pro o posteriores, ya que los kernels de prefill y de multiples filas usan las unidades matriciales de la GPU. El rendimiento en generaciones anteriores de Apple Silicon no se documenta.
- Compatibilidad con GPU de escritorio tipo RTX 4090, A100 o H100: no disponible, y en principio no aplicable porque el formato de pesos es especifico de uzu.
- Opciones de despliegue: build de uzu con soporte EXL3 (`Exl3Spec`) y carga del directorio por ruta. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI, dado que el formato de pesos no es GGUF ni safetensors estandar.
- Latencia y throughput: unos 50 tok/s en decodificacion simple sobre MacBook Air M5, segun la model card. No se publican cifras con decodificacion especulativa activa ni de prefill.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Rendimiento declarado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| clsx524/Qwen3.5-4B-uzu-EXL3-3bpw | 688.682.496 en safetensors (base ~4B) | EXL3 3,0 bpw + embeddings 4 bits + borrador DFlash 4 bits | ~50 tok/s y 1,85 GB de pico en M5; perplejidad 3,77; KLD 0,052 | apache-2.0 | Requiere uzu con soporte EXL3; 0 descargas |
| Qwen/Qwen3.5-4B | ~4B | bf16 | Perplejidad 3,65 segun la comparacion del autor | apache-2.0 | Modelo base, compatible con runtimes estandar |
| UnstableLlama/Qwen3.5-4B-exl3-3.00bpw | no disponible | EXL3 3,00 bpw | no disponible | apache-2.0 | Pesos EXL3 sin reempaquetar para uzu |
| z-lab/Qwen3.5-4B-DFlash | no disponible | 4 bits en este paquete | no disponible | apache-2.0 | Borrador de decodificacion especulativa |

No se dispone de datos de benchmarks que permitan comparar el rendimiento en tareas (MMLU, HumanEval, GSM8K) con alternativas de la misma categoria.

## Limitaciones y advertencias

- La cuantizacion a 3,0 bpw degrada la calidad de forma medible: la perplejidad sube de 3,65 a 3,77 y el KLD frente a bf16 es de 0,052 en las capas del transformer. El propio autor lo describe como un intercambio de calidad por velocidad y memoria.
- Solo se declara soporte de ingles. No hay evidencia de capacidades multilingues y el rendimiento en castellano no esta documentado.
- No se publican resultados en benchmarks estandar, por lo que la utilidad real en tareas de razonamiento, codigo o matematicas no esta verificada de forma independiente.
- El repositorio tiene 0 descargas y 0 likes, sin validacion por parte de terceros.
- Dependencia fuerte del runtime: requiere una build de uzu con soporte EXL3 y carga por ruta. No es utilizable con vLLM, llama.cpp, Ollama ni TGI en el estado actual.
- Exclusivo de Apple Silicon y optimizado para M5 y A19 Pro o posteriores; en hardware mas antiguo el rendimiento es indeterminado.
- Existe una discrepancia no aclarada entre el recuento de parametros de safetensors (688.682.496) y el tamano nominal de 4B del modelo base; conviene verificarla antes de asumir equivalencias.
- Riesgo de alucinacion: inherente a un modelo de esta escala y agravado por la cuantizacion agresiva; no se documentan medidas de mitigacion.
- Licencia Apache-2.0 en el paquete y en los cuatro componentes de origen, lo que permite uso comercial con atribucion; no obstante, conviene conservar los avisos de licencia de Qwen, UnstableLlama, z-lab y uzu al redistribuir.
- Al ser una derivacion de pesos de terceros, cualquier cambio en los repositorios de origen puede afectar a la trazabilidad de la procedencia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/clsx524/Qwen3.5-4B-uzu-EXL3-3bpw
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Pesos EXL3 de origen: https://huggingface.co/UnstableLlama/Qwen3.5-4B-exl3-3.00bpw
- Borrador DFlash: https://huggingface.co/z-lab/Qwen3.5-4B-DFlash
- Motor de inferencia uzu: https://github.com/trymirai/uzu
