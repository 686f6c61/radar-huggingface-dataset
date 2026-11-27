# miloserdev/Inkling-2-Mini-numallama

## Resumen

Inkling-2-Mini-numallama es una conversión de pesos cuantizados del modelo base `thinkingmachines/Inkling-2-Mini` (Apache-2.0) empaquetada para numallama, un motor de inferencia en CPU desarrollado por el mismo autor del repositorio (miloserdev). No se trata de un GGUF ni de un formato compatible con llama.cpp: los ficheros usan el contenedor propietario `INK2JSON`, compuesto por un manifiesto JSON y blobs de tensores mapeables en memoria. El repositorio redistribuye únicamente los pesos derivados, el tokenizador convertido y las herramientas de exportación y validación, no los safetensors originales.

El modelo subyacente es un transformer disperso (MoE) de 26.400 millones de parámetros totales con 3.400 millones activos (5.400 millones efectivos al aplicar las tres pasadas del núcleo de bucle), 24 capas físicas, tamaño oculto 2304, 24 cabezas de atención frente a 8 de KV, `head_dim` 128, 128 expertos con enrutamiento top-8 y un vocabulario de 201.024 entradas (200.058 sin relleno). La atención combina una ventana deslizante de 1024 tokens en 20 capas con atención completa en las capas 5, 11, 17 y 23.

La relevancia de esta ficha es doble: por un lado documenta una cuantización alternativa (Q4 y Q8) de un MoE reciente orientada a ejecución en CPU sin dependencias de CUDA; por otro, deja constancia explícita de las limitaciones del port (inferencia token a token, sin visión, sin audio, sin tool calling en el servidor y sin batching continuo), datos críticos para cualquier evaluación de viabilidad en producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con núcleo de bucle (loop core, capas 6-17 ejecutadas 3 veces), atención híbrida: ventana deslizante de 1024 tokens en 20 capas y atención completa en capas 5/11/17/23 |
| Parametros totales | 26.400 millones (26,4B) |
| Parametros activos | 3.400 millones (5.400 millones efectivos con las tres pasadas del bucle) |
| Longitud de contexto | No especificada de forma explícita en la información disponible; el servidor acepta prompts hasta `INKLING_MAX_PROMPT` (4096 tokens por defecto) y el flag `-c` configura el contexto (ejemplo con 8192) |
| Tipos de cuantizacion | Q4 (expertos, 17,00 GB) y Q8 (expertos, 27,71 GB); matrices fuera del MoE en Q8 en ambos contenedores; escalas por bloque de 64 en Q8 |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | Contenedor propietario `INK2JSON` (manifiesto JSON + blobs de tensores mapeables); no es GGUF ni compatible con llama.cpp |

## Arquitectura y entrenamiento

El modelo base es un transformer disperso con 24 capas físicas, `hidden_size` 2304, 24 cabezas de consulta y 8 de clave/valor, `head_dim` 128 y 128 expertos con enrutamiento top-8. La innovación estructural principal es un núcleo de bucle (capas 6 a 17) que se ejecuta tres veces con ranuras KV y de convolución separadas, lo que da lugar a 48 ranuras en total y eleva los parámetros efectivos de 3,4B a 5,4B. La atención es híbrida: ventana deslizante de 1024 tokens en 20 capas y atención completa en cuatro capas concretas.

En cuanto a los datos de entrenamiento (número de tokens, composición del corpus, uso de RLHF o DPO), la información proporcionada no incluye detalles: la model card del repositorio derivado solo documenta el proceso de conversión y validación. Lo que sí se detalla es el pipeline de cuantización: los expertos del modelo original están en NVFP4 (capas 0-19) y MXFP8 (capas 20-23); el exportador los desquantiza a denso y los recuantiza a Q4 o Q8. Las matrices ajenas al MoE se almacenan en Q8 en ambos contenedores. El cargador reempaqueta los tensores al formato SDOT de 4 filas del motor en tiempo de carga.

## Capacidades

- Generación de texto autoregresiva en modo `generate` y `chat` mediante el motor numallama.
- Razonamiento de un solo turno con exposición de `reasoning_content` en la API compatible con OpenAI.
- Servidor HTTP compatible con `/v1/chat/completions`, con streaming y sin streaming, cadenas de parada, `min_p`, penalizaciones de presencia y frecuencia, semillas e `include_usage`.
- Caché de sesión multi-turno (una sesión por instancia del servidor).
- Tokenizador BPE de 201.024 entradas (200.058 sin relleno) incluido como fichero separado.
- No incluye visión, audio, MTP ni tool calling en el servidor de Inkling.
- No soporta batching continuo ni concurrencia dentro de una misma instancia.

## Casos de uso

- Evaluación de modelos MoE en CPU sin GPU: el contenedor Q4 de 17 GB permite ejecutar un MoE de 26,4B en máquinas sin CUDA, útil para laboratorios con hardware limitado que quieran estudiar el comportamiento del enrutamiento top-8 y del núcleo de bucle.
- Prototipado de asistentes conversacionales de un solo usuario: el servidor compatible con OpenAI permite integrar el modelo en un chat multi-turno con hasta 4096 tokens de prompt por defecto, suficiente para sesiones de preguntas y respuestas acotadas.
- Validación de pipelines de cuantización: los scripts `export_inkling.py` y `compare_inkling_logits.py` permiten reproducir la conversión desde safetensors y comparar logits contra el oráculo IQ4_NL, un caso de uso directo para ingeniería de formatos.
- Experimentación con decodificación greedy en tareas de respuesta corta: la coincidencia top-1 y top-10 con el oráculo en el prompt de validación respalda su uso en tareas de clasificación o elección múltiple donde la divergencia en la cola no es crítica.
- Reproducción de investigación sobre atención híbrida: la combinación de ventana deslizante y atención completa en capas concretas puede estudiarse con este port para analizar el impacto de cada patrón en la perplejidad.
- Despliegue de réplicas para concurrencia moderada: el script `replica_router.py` permite poner varias instancias detrás de un enrutador, adecuado para entornos de demostración o pruebas internas con pocos usuarios simultáneos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. La model card incluye una validación de fidelidad de la cuantización frente a un oráculo IQ4_NL ejecutado con llama.cpp sobre el prompt "The capital of France is":

| Variante | Top-1 | Logit | KL(oráculo) | Solapamiento top-10 | Correlación | Diferencia máx. de logit |
|---|---|---|---|---|---|---|
| Expertos Q4 | 152717 (` Paris`) | 27,3686 | 0,0594 | 10/10 | 0,97889 | 5,37 |
| Expertos Q8 | 152717 (` Paris`) | 27,4252 | 0,0535 | 10/10 | 0,98145 | 5,08 |

Comparación Q4 frente a Q8: KL de 0,0083, correlación 0,99683 y solapamiento top-10 de 10/10. Las continuaciones greedy de Q4 y Q8 coinciden hasta ` Paris.` y las opciones de elección múltiple posteriores; las colas divergen, al igual que la continuación del oráculo IQ4_NL tras ` Paris.`.

Rendimiento de inferencia declarado: aproximadamente 0,79 s por token en la máquina de referencia, con forward monohilo y decodificación token a token. Los flags `-T` y `-J` no se aplican a esta ruta.

## Requisitos de hardware

- VRAM: no aplica; el motor numallama está diseñado para ejecución en CPU sin dependencias externas de Python ni CUDA en tiempo de ejecución.
- Memoria RAM estimada: al menos 17 GB para el contenedor Q4 y 27,71 GB para el Q8, más el espacio del tokenizador (2,8 MB) y la caché de sesión.
- GPU recomendadas: no disponibles; el motor no utiliza GPU en esta ruta.
- GPU de consumo: no aplicable en la implementación actual.
- Opciones de despliegue: exclusivamente numallama (compilación con `make` y binario `runq`), en modos `generate`, `chat` y `server`. No es compatible con vLLM, llama.cpp, Ollama ni TGI.
- Latencia: aproximadamente 0,79 s/token en la máquina de referencia; el servidor atiende una petición a la vez.
- Concurrencia: mediante réplicas detrás de `scripts/replica_router.py`.

## Comparativa con modelos similares

| Modelo | Parámetros totales / activos | Contexto | Licencia | Formato / motor | Notas |
|---|---|---|---|---|---|
| Inkling-2-Mini-numallama (este) | 26,4B / 3,4B (5,4B efectivos) | Hasta 4096 tokens por defecto en servidor | Apache-2.0 | `INK2JSON` / numallama (CPU) | Cuantización Q4/Q8, sin visión ni tool calling en servidor |
| thinkingmachines/Inkling-2-Mini (base) | 26,4B / 3,4B (5,4B efectivos) | No disponible | Apache-2.0 | Safetensors (upstream) | Pesos originales en NVFP4/MXFP8; requiere motor compatible |
| Oráculo IQ4_NL GGUF (upstream llama.cpp) | 26,4B / 3,4B (5,4B efectivos) | No disponible | Apache-2.0 | GGUF / llama.cpp | Usado como referencia de validación en la model card; artefacto separado no redistribuido |

No se dispone de datos de benchmarks que permitan comparar rendimiento cualitativo con alternativas de la misma categoría.

## Limitaciones y advertencias

- El forward de Inkling en numallama es un port nuevo solo de texto; coincide con el oráculo IQ4_NL en top-1 y top-10 sobre el prompt de validación, pero las continuaciones largas divergen en decodificación greedy.
- Sin visión, audio, MTP, tool calling en el servidor de Inkling ni batching continuo para esta arquitectura.
- Servidor de una sola petición simultánea; `-T` y `-J` no están implementados en esta ruta.
- Prompts por encima de `INKLING_MAX_PROMPT` (4096 tokens por defecto) se rechazan con un error 400.
- El motor y los pesos derivados se distribuyen sin garantía; el autor recomienda verificar el comportamiento para cada caso de uso.
- No se han documentado sesgos conocidos ni riesgos específicos de alucinación en la información disponible; se aplican los riesgos generales de los modelos de lenguaje del modelo base.
- La licencia Apache-2.0 permite uso comercial, pero debe conservarse el aviso de atribución a Thinking Machines y el texto de `NOTICE` incluido en el repositorio.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y un tamaño declarado de 0,0 GB pese a que los ficheros suman más de 44 GB entre Q4 y Q8; conviene verificar la integridad con `checksums.sha256` tras la descarga.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/miloserdev/Inkling-2-Mini-numallama
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Motor numallama: https://github.com/miloserdev/numallama
