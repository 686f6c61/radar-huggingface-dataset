# daedalus2027/gemma3n-v3nano-gguf

## Resumen

`daedalus2027/gemma3n-v3nano-gguf` es una reconstruccion independiente de los pesos de Gemma-3n E2B, el modelo on-device que Google distribuye dentro de Chromium (denominado internamente "v3nano"), reempaquetados en formato GGUF para que puedan cargarse en `llama.cpp`. No se trata de un modelo nuevo ni de un fine-tune: los pesos son los de `google/gemma-3n-E2B-it`, y lo unico que cambia es el contenedor, ya que Chromium entrega los tensores como flatbuffers LiteRT/TFLite sin nombres, lo que impide una carga directa.

El modelo base pertenece a la familia Gemma 3n de Google, disenada para ejecucion on-device con arquitectura MatFormer y capas de embeddings por capa (PLE, per-layer embeddings), lo que permite un uso eficiente de memoria en dispositivos con recursos limitados. El repositorio incluye dos ficheros: una version F16 (8,31 GiB) y una cuantizacion Q4_K_S (3,03 GiB, 5,82 BPW), ambas con 727 tensores.

Su relevancia es fundamentalmente practica: permite ejecutar el modelo Gemma-3n E2B en el ecosistema `llama.cpp` (CLI, servidor, integraciones tipo Ollama) sin depender de LiteRT ni de un runtime movil. Es un artefacto de ingenieria de conversión, no una contribucion de modelado, y hereda integramente las capacidades y limitaciones del modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de la familia Gemma 3n (MatFormer, con per-layer embeddings); metadatos `gemma3n` en el GGUF |
| Parametros totales | 4.455.632.480 (4,46 B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible en la informacion proporcionada (el ejemplo de uso emplea `-c 4096`) |
| Tipos de cuantizacion | F16 (F32/F16 por tensor) y Q4_K_S (5,82 BPW); solo estos dos ficheros publicados |
| Idiomas soportados | en (segun la model card y los tags del repositorio) |
| Licencia | Gemma Terms of Use (`license: gemma`) |
| Formato de pesos | GGUF v3 (727 tensores), compatible con `llama.cpp` |

## Arquitectura y entrenamiento

El modelo subyacente es `google/gemma-3n-E2B-it`, un modelo de la familia Gemma 3n orientado a ejecucion on-device. La arquitectura es de tipo transformer con innovaciones propias de Gemma 3n, como MatFormer (submodelos anidados) y embeddings por capa (`per_layer_token_embd`), que en este GGUF se organizan en 30 slices int4 con layout `ne=[7680,262144]`. No se dispone en la informacion proporcionada de datos sobre volumen de tokens de entrenamiento, composicion del dataset ni etapas de alineacion (RLHF/DPO); esos detalles corresponden a la model card oficial de Google, no a este repositorio.

El proceso de construccion de este GGUF es el elemento diferencial del repositorio. Se parte del bundle `weights.bin` que Chromium distribuye como flatbuffers LiteRT/TFLite, con todos los tensores sin nombre. El autor inventaria 2.347 tensores TFLite (1.398 unicos tras deduplicacion por md5) y empareja cada tensor oficial con su candidato v3nano por forma y MSE sobre valores desquantizados muestreados, aceptando el candidato solo si el MSE es inferior a `5e-5` (274 tensores aceptados). Los 452 tensores restantes se reconstruyen desde la desquantizacion del E2B oficial, porque la conversion movil fusiona o pliega normas, coeficientes altup y las proyecciones `altup_proj`/`altup_unembd_proj`. Finalmente se ensambla el embedding por capas, se copia la seccion KV del GGUF oficial (arquitectura, hiperparametros, tokenizer, chat template) y se verifica cada tensor contra el modelo oficial: los 727 tensores quedan dentro de un MSE muestreado de 1e-3 (peor caso 1,59e-4 en `per_layer_token_embd`).

## Capacidades

- Generacion de texto conversacional, heredada de `gemma-3n-E2B-it` (modelo instruct).
- Razonamiento basico y respuesta a preguntas factuales; los oracles de validacion del autor cubren preguntas como el primer presidente de EE. UU. o el simbolo atomico del hidrogeno.
- Capacidades multilingues limitadas: el repositorio declara unicamente `en`.
- Soporte de tool calling / function calling: no confirmado en la informacion proporcionada para este empaquetado.
- Soporte de agentes y razonamiento multi-paso: no confirmado en la informacion proporcionada.
- Capacidades multimodales (vision/audio): no confirmadas en este GGUF; la model card no las menciona y el pipeline declarado es `text-generation`.
- Modo thinking explicito: no disponible en la informacion proporcionada.

## Casos de uso

- Prototipado local en `llama.cpp`: cargar el Q4_K_S (3,03 GiB) con `llama-cli` o `llama-server` para probar el comportamiento de Gemma-3n E2B en escritorio sin instalar LiteRT ni dependencias moviles.
- Servidor de inferencia ligero: desplegar `llama-server -m gemma-3n-E2B-v3nano-Q4_K_S.gguf -c 4096` como endpoint HTTP para aplicaciones internas con cargas moderadas y presupuesto de memoria reducido (~4 GB).
- Evaluacion comparativa de cuantizaciones: usar los dos ficheros publicados (F16 y Q4_K_S) para medir la degradacion de calidad introducida por la cuantizacion en tareas concretas del dominio propio.
- Integracion en herramientas de escritorio: al ser un GGUF compatible con `llama.cpp`, puede integrarse en clientes tipo Ollama o interfaces de chat locales para asistentes off-line.
- Investigacion sobre empaquetado de pesos: el repositorio documenta un metodo reproducible de mapeo de tensores TFLite sin nombres a GGUF, util para quienes trabajen en conversion de modelos on-device.
- Educacion y experimentacion: modelo de 4,46 B parametros que cabe en GPUs de consumo, adecuado para ensenar tecnicas de cuantizacion, inferencia local y validacion de pesos.
- Verificacion de integridad: los hashes SHA-256 publicados permiten auditar la correspondencia entre los ficheros y el proceso de reconstruccion descrito.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: ~4 GB para Q4_K_S y ~10 GB para F16, segun la model card, sin contar el contexto adicional.
- GPU recomendadas: no especificadas en la informacion proporcionada; por tamano, cualquier GPU con al menos 6-8 GB de VRAM para Q4_K_S y 12 GB o mas para F16.
- Cabe en GPU de consumo: si, el Q4_K_S es viable en tarjetas de gama media con 6-8 GB; el F16 requiere gama alta o 12 GB o mas.
- Opciones de despliegue: `llama.cpp` (build con soporte Gemma-3n), `llama-cli` y `llama-server`; otros runtimes no confirmados.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| `daedalus2027/gemma3n-v3nano-gguf` | 4,46 B | no disponible | GGUF (F16, Q4_K_S) | Gemma Terms of Use | Reconstruccion no oficial de pesos de Chromium |
| `google/gemma-3n-E2B-it` | ~4,5 B (E2B) | no disponible en la informacion | safetensors / LiteRT | Gemma Terms of Use | Modelo oficial de Google, referencia de capacidades |
| Gemma 2 2B / otros modelos pequenos de la familia Gemma | no disponible | no disponible | safetensors, GGUF | Gemma Terms of Use | Alternativa de menor tamano de la misma familia; datos no verificados en esta ficha |

No se dispone de datos de rendimiento comparativo en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo nuevo: replica los pesos de `gemma-3n-E2B-it` y hereda sus mismos fallos y sesgos.
- Reconstruccion no oficial: no esta respaldada por Google ni por el proyecto Chromium; el autor lo declara explicitamente.
- Riesgo de divergencia sutil: 452 de los 727 tensores se reconstruyen desde la desquantizacion oficial, no desde v3nano, por lo que el comportamiento puede diferir ligeramente del bundle original de Chromium.
- Riesgo de alucinacion: inherente al modelo base; no se han publicado evaluaciones especificas para este empaquetado.
- Idioma: solo se declara ingles; el rendimiento en castellano no esta verificado.
- Contexto: no se documenta la longitud maxima soportada en este GGUF; el ejemplo de servidor usa 4096 tokens.
- Licencia: se aplican los Gemma Terms of Use, con las restricciones de uso comercial y redistribucion que estos imponen.
- Madurez: repositorio con 0 descargas y 0 likes en el momento de la consulta; sin validacion independiente por terceros.
- Compatibilidad: requiere una build de `llama.cpp` con soporte Gemma-3n; versiones sin ese soporte no cargaran el modelo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/daedalus2027/gemma3n-v3nano-gguf
- Modelo base oficial: https://huggingface.co/google/gemma-3n-E2B-it
- Extractor utilizado: https://github.com/daedalus/gemma3n-v3nano-extractor
- Terminos de uso de Gemma: https://ai.google.dev/gemma/terms
