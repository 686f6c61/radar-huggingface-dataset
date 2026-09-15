# fpadovani/nld-100mb-after-nld_heavy_zipf_fix_zijn-ckpt500_seed3407_seed3407

## Resumen

El modelo `nld-100mb-after-nld_heavy_zipf_fix_zijn-ckpt500_seed3407_seed3407` es un ajuste fino (SFT) del checkpoint `fpadovani/ppt-nld_heavy_zipf_fix_zijn-100mb_seed3407`, publicado por el usuario `fpadovani` (el enlace de Weights & Biases asociado apunta a la Universidad de Groningen). Se trata de un GPT-2 de 124.770.816 parametros (~124 M), es decir, un transformer decoder-only denso de escala pequena, entrenado con la libreria TRL 0.23.0 sobre Transformers 4.56.2 y PyTorch 2.11.0.

Por el nombre del repositorio y del modelo base se deduce que forma parte de una serie de experimentos academicos sobre corpus de ~100 MB, con variantes de correccion de la distribucion de Zipf (`zipf_fix`) y distintas semillas (`seed3407`). El identificador `nld` y la presencia de la palabra neerlandesa `zijn` en el nombre sugieren un corpus en neerlandes, aunque la model card no lo confirma y no se declara ningun idioma en los metadatos.

Es relevante ahora unicamente como artefacto de investigacion reproducible: permite replicar el experimento de ajuste fino, sirve como punto de partida para estudios comparativos de recetas SFT y como modelo de juguete para validar infraestructura de inferencia. No es un modelo orientado a producto: acumula 0 descargas y 0 likes, no publica benchmarks, no declara licencia efectiva y no documenta composicion de datos ni evaluacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo GPT-2 (segun la etiqueta `gpt2` del repositorio) |
| Parametros totales | 124.770.816 (~124 M) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio solo distribuye pesos en `safetensors`; no se publican variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no disponible (el nombre del modelo sugiere corpus en neerlandes, sin confirmacion en la model card) |
| Licencia | no disponible (la model card contiene el marcador de posicion `licence: license`, sin texto legal) |
| Formato de pesos | `safetensors` (libreria `transformers`); tamano del repositorio: 6,0 GB |
| Pipeline | `text-generation` |
| Modelo base | `fpadovani/ppt-nld_heavy_zipf_fix_zijn-100mb_seed3407` |
| Metodo de entrenamiento | SFT con TRL 0.23.0 |
| Fecha de publicacion | 2026-09-14 (creacion), 2026-09-15 (ultima actualizacion) |

## Arquitectura y entrenamiento

La arquitectura corresponde a la familia GPT-2: un transformer decoder-only con atencion causal completa, normalizacion previa a cada subcapa y embeddings posicionales aprendidos. Con 124.770.816 parametros, el modelo encaja en la configuracion clasica de GPT-2 small. La model card no especifica numero de capas, dimensiones ocultas, cabezas de atencion ni longitud de contexto, por lo que esos hiperparametros quedan como no disponibles. La etiqueta `gpt2` del repositorio es el unico indicio explicito de la familia arquitectonica.

El entrenamiento se realizo mediante SFT (supervised fine-tuning) con TRL 0.23.0, partiendo del checkpoint `ppt-nld_heavy_zipf_fix_zijn-100mb_seed3407`. No se documentan el numero de tokens de entrenamiento, la composicion del dataset, la existencia de etapas de RLHF o DPO, ni el formato exacto de las conversaciones de supervision; el ejemplo de la model card pasa una lista de mensajes con rol `user`, lo que indica un formato tipo chat-instruction, pero sin especificar plantilla. El repositorio ocupa 6,0 GB, muy por encima de los ~500 MB que ocuparian los pesos en FP32 y de los ~250 MB en FP16, lo que sugiere la presencia de multiples checkpoints intermedios o estados del optimizador en el mismo repositorio (`ckpt500` en el nombre apunta a un checkpoint del paso 500). Los detalles del run estan enlazados a Weights & Biases, fuera de la informacion proporcionada.

## Capacidades

- Generacion de texto autoregresiva: es la unica capacidad declarada por el pipeline (`text-generation`).
- Generacion condicionada por formato conversacional: el ejemplo oficial pasa una lista de mensajes con rol `user`, lo que indica que el ajuste SFT se hizo sobre datos con estructura de dialogo o instruccion.
- Capacidad multilingue: no disponible; no se declara ningun idioma en los metadatos.
- Tool calling / function calling: no disponible, y no se menciona en la model card.
- Soporte de agentes o razonamiento multi-paso: no disponible.
- Modo de razonamiento explicito (thinking), vision, audio u otras modalidades: no disponibles.
- Razonamiento, codigo y matematicas: no se aportan evaluaciones ni ejemplos que lo respalden.

## Casos de uso

- Reproduccion de experimentos academicos: el modelo permite replicar la receta SFT aplicada sobre `ppt-nld_heavy_zipf_fix_zijn-100mb_seed3407` con TRL 0.23.0, util para estudiar el efecto de la correccion de la distribucion de Zipf en corpus de ~100 MB.
- Estudios comparativos de ajuste fino: sirve como variante de control (semilla 3407, checkpoint 500) frente a otros checkpoints de la misma serie, aislando el efecto de la semilla y del numero de pasos.
- Docencia y formacion: con 124 M de parametros, se puede cargar y ejecutar en un portatil o en una notebook gratuita para explicar el ciclo completo de `transformers` + `trl` sin coste de GPU.
- Pruebas de infraestructura de inferencia: es adecuado para validar pipelines de text-generation-inference (el repositorio esta etiquetado como `text-generation-inference` y `endpoints_compatible`) antes de desplegar modelos mayores.
- Generacion de datos sinteticos para experimentos: permite producir continuaciones de texto a bajo coste computacional para preentrenar o aumentar otros experimentos, siempre que se valide la calidad del idioma de salida.
- Base para ajuste fino adicional: al ser un checkpoint ya ajustado y de tamano reducido, puede servir como punto de partida para tareas de estilo, dominio o idioma concretos en entornos con recursos limitados.
- Prototipado en el borde (edge): su huella de memoria permite incrustarlo en demos locales o dispositivos con poca VRAM, con expectativas de calidad propias de un modelo de 124 M.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,5 GB en FP32 y 0,25 GB en FP16/BF16 para los pesos, a lo que hay que sumar la cache KV y el overhead del runtime. Cifras derivadas del recuento de parametros; no publicadas por el autor.
- GPU recomendadas: cualquier GPU con 2 GB o mas de memoria es suficiente. No se requieren A100, H100 ni aceleradores de datacenter.
- GPU de consumo: cabe sin problema en RTX 3060, RTX 4060, RTX 4090, GTX 1650 y similares; tambien se puede ejecutar en CPU, aunque con mayor latencia.
- Opciones de despliegue: `transformers` con `pipeline`, text-generation-inference, vLLM y servidores compatibles con la API de Hugging Face. `llama.cpp` y Ollama requeririan convertir los pesos a GGUF, conversion no publicada por el autor.
- Latencia y throughput: no disponibles. No se han publicado mediciones en la informacion proporcionada.
- Nota de almacenamiento: aunque el modelo pesa ~0,5 GB, el repositorio ocupa 6,0 GB, por lo que conviene descargar solo los ficheros necesarios.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Este modelo (`nld-100mb-after-...ckpt500`) | 124,77 M | no disponible | no disponible | Hugging Face, 0 descargas |
| GPT-2 small | 124 M | 1024 tokens | MIT | Ampliamente distribuido |
| DistilGPT-2 | 82 M | 1024 tokens | Apache 2.0 | Ampliamente distribuido |
| Pythia-160m | 160 M | 2048 tokens | Apache 2.0 | Ampliamente distribuido |

Los datos de GPT-2 small, DistilGPT-2 y Pythia-160m proceden de su documentacion publica y no de la informacion proporcionada en esta ficha; se incluyen solo como referencia de categoria (modelos densos de 80-160 M de parametros). No hay datos de rendimiento comparado disponibles para este modelo.

## Limitaciones y advertencias

- No se publica informacion sobre sesgos; al desconocerse el corpus de entrenamiento, no se puede evaluar el sesgo demografico, ideologico o de dominio.
- Riesgo de alucinacion alto: con 124 M de parametros y un corpus de ~100 MB, la capacidad de retener hechos es muy limitada y las continuaciones pueden ser incoherentes o factualmente falsas.
- Longitud de contexto desconocida: no se puede garantizar el comportamiento en conversaciones largas ni en tareas que requieran contexto extenso.
- Idioma no confirmado: no se declara el idioma soportado. Si el corpus es neerlandes, el rendimiento en castellano sera previsiblemente bajo.
- Licencia no efectiva: la model card usa el marcador `licence: license`, sin texto legal. No hay autorizacion explicita para uso comercial ni condiciones de atribucion; hay que contactar con el autor antes de cualquier uso en produccion.
- Artefacto de investigacion sin evaluacion: 0 descargas y 0 likes, sin benchmarks ni evaluaciones humanas publicadas.
- Sin garantia de soporte: no hay documentacion de la composicion del dataset, de la plantilla de chat exacta ni de los hiperparametros de entrenamiento.
- Uso en produccion desaconsejado: no debe emplearse en atencion al cliente, generacion de codigo, decisiones automatizadas ni cualquier flujo que requiera fiabilidad, sin una evaluacion previa propia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/fpadovani/nld-100mb-after-nld_heavy_zipf_fix_zijn-ckpt500_seed3407_seed3407
- Modelo base: https://huggingface.co/fpadovani/ppt-nld_heavy_zipf_fix_zijn-100mb_seed3407
- Run de entrenamiento en Weights & Biases: https://wandb.ai/f-padovani-university-of-groningen/white_cotterell/runs/rufql2z3
- Repositorio de TRL: https://github.com/huggingface/trl
