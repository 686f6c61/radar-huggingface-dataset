# infosave/Maxwell-V1-Flash-cmf

## Resumen

Maxwell-V1-Flash es un modelo de lenguaje de tipo mezcla de expertos (MoE) desarrollado por el equipo Maxwell, con 35 000 millones de parametros totales y 3000 millones activos por token, orientado a razonamiento y flujos de trabajo agenticos. Emplea una ventana de contexto de 256 000 tokens y se distribuye bajo licencia Apache-2.0. La version aqui descrita, `infosave/Maxwell-V1-Flash-cmf`, no es el modelo original sino un reempaquetado cuantizado del checkpoint base `maxwell-model/Maxwell-V1-Flash` en el formato CMF propietario del autor del repositorio.

El paquete incluye dos ficheros: uno de 4 bits (20,50 GB) y otro de 8 bits (37,82 GB), ambos ejecutables mediante `cortiq`, un motor de inferencia escrito en Rust que no depende de Python ni de frameworks de aprendizaje automatico. El motor soporta CUDA y Vulkan sobre GPU NVIDIA, ademas de Vulkan/DX12 sobre GPU AMD e Intel y ejecucion en CPU. La propuesta de valor es permitir servir el modelo completo de 35B en una unica tarjeta de 24 GB, algo que con pesos en bf16 (73,64 GB) seria imposible.

La relevancia actual del paquete reside en la combinacion de contexto largo (256K), capacidades de razonamiento y tool calling, y un formato de cuantizacion calibrado con GPTQ que, segun las mediciones del autor, mantiene la perplejidad muy cerca del modelo de referencia en bf16. El repositorio acumula 294 descargas y 1 like en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con atencion block-sparse y capa de prediccion multi-token (multi-token prediction) |
| Parametros totales | 35 000 millones (modelo base); el paquete CMF contiene los mismos pesos cuantizados |
| Parametros activos | 3000 millones por token |
| Longitud de contexto | 256 000 tokens (modelo base); en la practica limitada por `CMF_MAX_SEQ` y la memoria disponible |
| Tipos de cuantizacion | 4 bits (q4tp: expertos enrutados, atencion, expertos compartidos y FFN densas; cabeza en 8 bits) y 8 bits (q8_2f); embeddings en f16, routers, hiperconexiones e indice de bloques de atencion en f32 |
| Idiomas soportados | Ingles, chino, ruso, tailandes, vietnamita e indonesio |
| Licencia | Apache-2.0 |
| Formato de pesos | CMF (ficheros `.cmf`), ejecutables con `cortiq`; el checkpoint base esta en formato Transformers |

## Arquitectura y entrenamiento

El modelo base es un transformer de mezcla de expertos con 35B parametros totales y 3B activos por token, lo que situa su coste computacional por token en el orden de un modelo denso de 3B. Incorpora atencion block-sparse, en la que el modelo selecciona dinamicamente los bloques de contexto a los que atiende, y una capa de prediccion multi-token que puede emplearse para decodificacion especulativa. El paquete CMF conserva esa capa: con `CMF_MAXWELL_SPEC=1` el decode en CUDA genera un borrador del siguiente token, con una tasa de aceptacion de aproximadamente tres cuartas partes en la NVIDIA L4, que eleva el rendimiento de 65,5 a 67,2 tok/s.

La cuantizacion del fichero de 4 bits se calibro con GPTQ sobre texto en prosa, Rust y Python ajeno a los textos de evaluacion: los expertos enrutados sobre 65 536 tokens y la atencion, los expertos compartidos y las FFN densas sobre 3072 tokens. El fichero de 8 bits no requiere esa calibracion especifica. No se dispone de informacion sobre el volumen total de tokens de entrenamiento del modelo base, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO.

## Capacidades

- Generacion de texto y razonamiento multi-paso, con etiqueta explicita `reasoning` en el repositorio.
- Soporte de tool calling y function calling, orientado a flujos agenticos.
- Contexto largo de hasta 256 000 tokens, adecuado para documentos extensos y conversaciones prolongadas.
- Capacidades multilingues en ingles, chino, ruso, tailandes, vietnamita e indonesio.
- Decodificacion especulativa opcional mediante la capa de prediccion multi-token del checkpoint.
- Ejecucion en GPU NVIDIA (CUDA y Vulkan), GPU AMD e Intel (Vulkan/DX12), Apple Silicon y CPU a traves de `cortiq`.
- No se ha documentado soporte de vision, audio ni otras modalidades en la informacion disponible.

## Casos de uso

- Atencion al cliente automatizada: la ventana de 256K tokens permite mantener historiales de conversacion muy largos y recuperar contexto de interacciones previas sin truncar, con un coste por token propio de un modelo de 3B activos.
- Analisis de documentacion tecnica extensa: el modelo puede procesar manuales, especificaciones o expedientes de decenas de miles de tokens en una sola pasada; con el fichero de 4 bits en una L4, un prompt de 30 000 tokens se lee en 68,2 s y despues genera a 33,6 tok/s.
- Agentes con tool calling: la combinacion de razonamiento multi-paso y soporte de function calling permite construir agentes que consultan APIs, ejecutan busquedas y encadenan llamadas a herramientas dentro de un mismo contexto.
- Despliegue en infraestructura de gama media: el fichero de 4 bits ocupa 20,50 GB y cabe integro en una tarjeta de 24 GB (por ejemplo, NVIDIA L4), lo que habilita servir un modelo de 35B en instancias cloud economicas o en estaciones de trabajo con una sola GPU.
- Generacion de codigo asistida: el calibrado GPTQ incluye corpus de Rust y Python, y el modelo puede integrarse en pipelines de desarrollo para autocompletado, explicacion de codigo o generacion de pruebas, con la ventaja de ejecutarse en local sin dependencias de Python.
- Procesamiento multilingue para el sudeste asiatico: el soporte de tailandes, vietnamita e indonesio, junto con chino, ruso e ingles, lo hace util para moderacion de contenido, traduccion asistida o resumen de documentos en esas lenguas.
- Ejecucion en hardware no NVIDIA: mediante Vulkan o DX12 sobre GPU AMD e Intel, o en CPU, el paquete permite prototipar y desplegar en entornos donde CUDA no esta disponible; en la L4 por Vulkan, el fichero de 4 bits decodifica a 38,8 tok/s.

## Benchmarks y rendimiento

Perplejidad sobre WikiText-2 (12 ventanas de 512 tokens) y sobre ventanas de 6144 tokens, comparada con el checkpoint en bf16 ejecutado con Transformers:

| Fichero | Cuantizacion | Tamano | WikiText-2 ppl | Rust ppl | Python ppl | WikiText-2, ventanas de 6144 |
|---|---|---:|---:|---:|---:|---:|
| `Maxwell-V1-Flash-q4tp.cmf` | 4 bits | 20,50 GB | 31,78 | 7,21 | 7,51 | 20,61 |
| `Maxwell-V1-Flash-q8_2f.cmf` | 8 bits | 37,82 GB | 33,07 | 7,05 | 7,16 | 20,68 |
| Referencia Transformers bf16 | — | 73,64 GB | 32,80 | 7,05 | 7,03 | 20,75 |

Rendimiento medido en una NVIDIA L4 (24 GB) con `cortiq bench --core` (un solo flujo, 64 tokens de decodificacion):

| Prompt (tokens) | Primer token, s (q4tp) | Primer token, s (q8_2f) | Decode, tok/s (q4tp) | Decode, tok/s (q8_2f) | Memoria pico GPU, GB (q4tp) | Memoria pico GPU, GB (q8_2f) |
|---:|---:|---:|---:|---:|---:|---:|
| 2048 | 2,01 | 4,10 | 61,4 | 38,0 | 19,7 | 21,6 |
| 8192 | 10,9 | 17,7 | 47,7 | 31,4 | 20,6 | 20,2 |
| 16 384 | 27,9 | — | 42,0 | — | 21,6 | — |
| 30 000 | 68,2 | 94,9 | 33,6 | 26,1 | 20,3 | 20,4 |

Sin prompt, el fichero de 4 bits decodifica a 66,3 tok/s por CUDA y a 38,8 tok/s por Vulkan; el de 8 bits, a 21,8 tok/s en arranque en frio. Con `CMF_MAX_SEQ=32768`, los expertos se transmiten desde memoria del host y el rendimiento baja a 55,0 tok/s. La fidelidad de las respuestas codiciosas del fichero de 8 bits se comprobo token a token contra Transformers bf16 en cuatro prompts de 40 tokens: tres fueron identicos y el cuarto difirio en un token. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM para el fichero de 4 bits: cabe integro en 24 GB, con unos 18 000 posiciones de contexto junto a los pesos; contextos mas largos requieren `CMF_MAX_SEQ` y transmiten los expertos desde memoria del host paginada.
- VRAM para el fichero de 8 bits: 24 GB en la GPU, con 42 GB de memoria del host; los expertos residen en memoria paginada del host y se transfieren en bloques de 18 GB segun los selecciona el router.
- GPU recomendadas: NVIDIA L4 (mediciones del autor), A100 y H100 para mayor throughput; cualquier GPU NVIDIA con 24 GB o mas para el fichero de 4 bits.
- GPU de consumo: no se han publicado mediciones en tarjetas de consumo; el fichero de 4 bits necesita 24 GB de VRAM para residir integro, por lo que queda fuera de tarjetas de 16 GB o menos salvo uso con transmision de expertos desde host.
- Opciones de despliegue: `cortiq` (CLI `cortiq-cli`, version 0.9.12 o superior) con backends CUDA, Vulkan, DX12 y CPU; requiere Rust 1.88 o superior para compilar y, en la ruta CUDA, el driver NVIDIA, NVRTC y cuBLAS de CUDA 12 cargados en tiempo de ejecucion. No se menciona soporte de vLLM, llama.cpp, Ollama ni TGI para el formato CMF.
- Latencia y throughput: primer token de 2,01 s para 2048 tokens y 68,2 s para 30 000 tokens en L4 con CUDA y el fichero de 4 bits; decodificacion de 66,3 tok/s sin prompt y 33,6 tok/s tras 30 000 tokens de contexto.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Formato y despliegue |
|---|---|---|---|---|---|
| Maxwell-V1-Flash (CMF) | 35B | 3B | 256K | Apache-2.0 | CMF con `cortiq` (CUDA, Vulkan, DX12, CPU) |
| Maxwell-V1-Flash (base) | 35B | 3B | 256K | Apache-2.0 | Transformers, safetensors bf16 (73,64 GB) |
| Alternativas de tamano similar | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la informacion proporcionada de datos de benchmarks comparativos con otros modelos de la misma categoria, por lo que la comparativa se limita al propio modelo base y su version cuantizada.

## Limitaciones y advertencias

- La model card no documenta sesgos conocidos del modelo base; al tratarse de un modelo entrenado principalmente con datos web, es previsible que herede sesgos de esa fuente, aunque no se cuantifican.
- Riesgo de alucinacion inherente a los modelos generativos; no se han publicado evaluaciones de factualidad en la informacion disponible.
- El contexto maximo efectivo depende de `CMF_MAX_SEQ` y de la memoria: en el fichero de 4 bits con 24 GB, los contextos superiores a unas 18 000 posiciones obligan a transmitir expertos desde el host, con la consiguiente caida de rendimiento (55,0 tok/s con `CMF_MAX_SEQ=32768`).
- Cobertura linguistica limitada a seis idiomas; el espanol no figura entre los idiomas declarados, por lo que su calidad en castellano no esta garantizada.
- El formato CMF solo es ejecutable con `cortiq`, un motor con version minima 0.9.12 y una comunidad pequena; no hay soporte documentado en vLLM, llama.cpp, Ollama ni TGI, lo que limita la portabilidad y el ecosistema de herramientas.
- El fichero de 8 bits requiere 42 GB de memoria del host ademas de la GPU, lo que condiciona el tipo de instancia en produccion.
- La decodificacion especulativa (`CMF_MAXWELL_SPEC=1`) aporta una mejora marginal (65,5 a 67,2 tok/s) y esta desactivada por defecto.
- Aunque la licencia es Apache-2.0, conviene verificar las condiciones del checkpoint base `maxwell-model/Maxwell-V1-Flash` antes de un uso comercial a gran escala.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/infosave/Maxwell-V1-Flash-cmf
- Modelo base: https://huggingface.co/maxwell-model/Maxwell-V1-Flash
- Motor de inferencia cortiq / formato CMF: https://github.com/infosave2007/cmf
