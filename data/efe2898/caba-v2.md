# Efe2898/caba-v2

## Resumen

ÇABA v2 (repo `Efe2898/caba-v2`) es un modelo de lenguaje causal experimental de aproximadamente 49,96 millones de parametros, publicado por el usuario Efe2898 en HuggingFace. No es un transformer convencional: prescinde por completo de capas de autoatencion y sustituye el mecanismo habitual por una convolucion causal depthwise combinada con tres bancos de matrices asociativas recurrentes que operan a distintas escalas temporales (rapida, media y lenta). Se trata de un checkpoint base de investigacion, no afinado por instrucciones ni pensado como asistente conversacional.

El modelo es una continuacion de `Efe2898/caba-kumru-50m` mediante continued pretraining, y esta vinculado al tokenizer `vngrs-ai/Kumru-2B-Base` (vocabulario de 50.176 entradas) y a un dataset tokenizado propio (`Efe2898/tokenized`). Su interes reside en la arquitectura, no en el rendimiento: explora una alternativa a la atencion cuadratica con un esquema de promocion de informacion entre bancos de memoria de distinta latencia, lo que lo convierte en un banco de pruebas para modelos recurrentes eficientes.

La relevancia actual es, por tanto, academica y experimental. El propio autor advierte que es un checkpoint de investigacion, sin garantia de calidad ni de velocidad, y que el repositorio no declara licencia. No cuenta con descargas ni likes en el momento de la consulta y no publica resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Recurrente sin autoatencion: convolucion causal depthwise por bloque mas tres bancos de matrices asociativas recurrentes (rapida, media, lenta); actualizacion explicita tipo delta-rule |
| Parametros totales | 49.964.096 (aproximadamente 50M) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (un catalogo de terceros atribuye 4.096 tokens al predecesor `caba-kumru-50m`, dato no confirmado por el autor) |
| Tipos de cuantizacion | No disponible (pesos publicados en safetensors, presumiblemente fp32/fp16; no se documentan GGUF ni cuantizaciones de otro tipo) |
| Idiomas soportados | No declarados. Los datos y el tokenizer empleados apuntan al turco como idioma principal de entrenamiento; el `manifest target` para turco figura como 0 en la model card |
| Licencia | No disponible |
| Formato de pesos | Safetensors (libreria transformers, requiere `trust_remote_code=True`) |

## Arquitectura y entrenamiento

La arquitectura es un modelo de lenguaje causal recurrente sin capas de autoatencion. Cada bloque combina una convolucion causal depthwise con tres bancos de matrices asociativas recurrentes: el banco rapido escribe en cada token, mientras que los bancos medio y lento reciben promociones retardadas de ventana fija. La puntuacion de promocion de la version v0 utiliza un residuo de asociacion normalizado con stop-gradient como medida de "no resuelto", y el autor subraya explicitamente que no es una estimacion aprendida de utilidad futura. La seleccion de contenido y la admision en los bancos medio y lento son procesos separados, y la admision suave no implica omision de FLOPs. La actualizacion usa una regla delta explicita y el autor aclara que no se reclama identidad con el kernel oficial de Gated DeltaNet-2.

La configuracion de entrenamiento documentada es: hidden de 512, 8 bloques, 8 cabezas, anchura SwiGLU de 1280 y relojes de promocion de 8 y 64 tokens. El modelo es una continuacion por continued pretraining de `Efe2898/caba-kumru-50m`. El tokenizer es `vngrs-ai/Kumru-2B-Base` en la revision `55711ea224e4bf5d4e11a4baf79130ae73785ece` (vocabulario de 50.176, ID 3 reservado para EOS/separador de empaquetado). El dataset es `Efe2898/tokenized` en la revision `6cb993aa63064cd89b511bb164e8c6e5512902ed`, compuesto por fragmentos de tokens en `uint16` little-endian. El autor indica que esta ejecucion incluyo fragmentos no manifestados, que las fuentes y pesos seleccionados se registran en `training/training_config.json`, y que no consta informacion sobre fases de RLHF o DPO, por lo que se asume entrenamiento puramente autoregresivo sin alineamiento posterior.

## Capacidades

- Generacion de texto autoregresiva causal, con decodificacion greedy y muestreo top-k/top-p implementados en su metodo `.generate()` personalizado.
- Modelado de lenguaje base: no es un asistente conversacional ni esta afinado por instrucciones.
- Procesamiento de secuencias mediante memoria recurrente multiescala en lugar de atencion, lo que en teoria favorece la eficiencia en secuencias largas, aunque no se documentan mediciones.
- Capacidades multilingues: no declaradas; el entrenamiento apunta a turco.
- Soporte de tool calling o function calling: no disponible.
- Soporte de agentes o razonamiento multi-paso: no disponible, no documentado.
- Capacidades especiales (modo thinking, vision, audio): no disponibles.

## Casos de uso

- Investigacion en arquitecturas recurrentes eficientes: el modelo sirve como referencia reproducible para estudiar alternativas a la atencion, dado que el repositorio incluye la configuracion exacta, los logs de entrenamiento y el punto de entrada de Colab en el directorio `training/`.
- Experimentos de continued pretraining sobre tokenizers de terceros: al partir de `caba-kumru-50m` y usar el tokenizer Kumru, permite evaluar como se comporta un esquema recurrente cuando se reutiliza un vocabulario de 50.176 entradas disenado para un modelo mayor.
- Pruebas de esquemas de memoria multiescala: los bancos rapido, medio y lento con relojes de 8 y 64 tokens ofrecen un entorno controlado para medir promociones de informacion y estrategias de admision.
- Benchmarking de arquitecturas sin atencion en tareas de modelado de lenguaje: util para comparar perplejidad frente a transformers de tamano similar en corpus turcos, siempre que se establezca una evaluacion propia, ya que el autor no publica resultados.
- Prototipado educativo: por su tamano reducido (0,2 GB de repositorio y unos 50M de parametros) puede cargarse en entornos de docencia o experimentacion sin GPU dedicada.
- Validacion de infraestructura de carga con `trust_remote_code=True`: sirve para probar pipelines que integran codigo personalizado de HuggingFace antes de escalar a modelos mayores con el mismo patron.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (calculada a partir del numero de parametros, no confirmada por el autor): aproximadamente 200 MB en fp32, unos 100 MB en fp16/bf16, unos 50 MB en int8 y alrededor de 25 MB en int4, sin contar el overhead del runtime ni las activaciones.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; una RTX 3060, RTX 4090 o incluso una GPU integrada pueden alojar el modelo con holgura. No se requiere A100 ni H100.
- Cabe sin problema en GPU consumer: si, en practicamente cualquier modelo con al menos 1 GB de VRAM, e incluso puede ejecutarse en CPU para inferencia interactiva.
- Opciones de despliegue: al usar una arquitectura personalizada con `trust_remote_code=True`, el despliegue queda restringido a transformers, salvo que se adapte el codigo a otros runtimes. No hay evidencia de soporte para vLLM, llama.cpp, Ollama o TGI con esta arquitectura, y la conversion a GGUF requeriria implementar el grafo correspondiente.
- Latencia y throughput: no disponibles. El autor indica que este primer checkpoint no constituye una garantia de velocidad.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones detalladas de modelos comparables en la informacion proporcionada. La unica referencia directa es el modelo predecesor del que continua:

| Modelo | Parametros | Arquitectura | Contexto | Licencia | Relacion |
|---|---|---|---|---|---|
| `Efe2898/caba-v2` | 49,96M | Recurrente sin atencion (conv depthwise + bancos asociativos) | no disponible | no disponible | Modelo analizado |
| `Efe2898/caba-kumru-50m` | No disponible | No disponible | 4.096 tokens (segun catalogo de terceros) | No disponible | Predecesor del que parte por continued pretraining |

No se dispone de datos verificables de alternativas de la misma categoria (transformers de aproximadamente 50M de parametros) dentro de la informacion suministrada.

## Limitaciones y advertencias

- Modelo base sin afinado por instrucciones: no debe usarse como asistente ni esperar respuestas coherentes a instrucciones en formato chat.
- Riesgo de alucinacion y de texto incoherente: al ser un checkpoint de investigacion con un entrenamiento limitado y sin alineamiento posterior, la calidad de generacion no esta garantizada por el autor.
- Sesgos conocidos: no disponibles, pero al entrenarse sobre un dataset tokenizado de procedencia no declarada, puede heredar sesgos de las fuentes originales, especialmente del corpus en turco.
- Limitaciones de idioma: no se declaran idiomas soportados; el entrenamiento apunta al turco y el `manifest target` para ese idioma figura como 0, lo que indica que la cobertura linguistica no esta formalizada.
- Restricciones de licencia: el repositorio del modelo no declara licencia y el dataset de entrenamiento tampoco declara una licencia de redistribucion, por lo que el uso comercial queda en un limbo legal. El autor recomienda confirmar los derechos sobre los datos antes de compartir el modelo publicamente.
- Carga de codigo personalizado: requiere `trust_remote_code=True`, lo que implica ejecutar codigo del repositorio; debe revisarse antes de habilitarlo en entornos de produccion.
- Ausencia de benchmarks: no hay metricas publicadas que permitan estimar su calidad frente a alternativas, por lo que cualquier evaluacion en produccion requeriria una validacion propia.
- Limitaciones de despliegue: la arquitectura personalizada limita el uso de runtimes optimizados como vLLM, llama.cpp u Ollama sin trabajo de adaptacion adicional.
- Trazabilidad: el autor advierte que la ejecucion incluyo fragmentos no manifestados y que los detalles se registran en `training/training_config.json`, lo que puede dificultar la reproducibilidad exacta.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Efe2898/caba-v2
- Modelo predecesor: https://huggingface.co/Efe2898/caba-kumru-50m
- Tokenizer empleado: https://huggingface.co/vngrs-ai/Kumru-2B-Base (revision `55711ea224e4bf5d4e11a4baf79130ae73785ece`)
- Dataset de entrenamiento: https://huggingface.co/datasets/Efe2898/tokenized (revision `6cb993aa63064cd89b511bb164e8c6e5512902ed`)
- Perfil del autor en HuggingFace: https://huggingface.co/Efe2898/datasets
- Ficha de terceros del predecesor: https://free2aitools.com/model/efe2898/caba-kumru-50m
- Visualizador de arquitecturas de HuggingFace: https://hfviewer.com/
- Catalogo Hugging Bay: https://huggingbay.xyz/
