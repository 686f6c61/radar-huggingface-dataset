# jabbatheduck/ninfer-ext-models

## Resumen

`jabbatheduck/ninfer-ext-models` es un repositorio de artefactos cuantizados para **NInfer Ext**, un motor de inferencia C++/CUDA escrito desde cero y orientado al máximo rendimiento en una sola GPU. El repositorio publica un único artefacto por ahora: los pesos de **Qwen3.8-27B** (clase `Qwen3_5ForCausalLM`) convertidos al formato propio `.ninfer` con cuantización **EXL3 4,0 bpw** (`exl3_mul1` + `trellis_t16_v1`), de 15,35 GiB, que incluye cuerpo de texto, capa MTP y torre de visión en un solo fichero.

Su relevancia está en la relación calidad/tamano: con 15,35 GiB obtiene una perplejidad de 4,2939, mejor que NVFP4 (22,09 GiB, 4,3149) y que Groupwise INT4 (16,96 GiB, 4,3439) sobre el mismo corpus de 261.167 tokens. Además, la decodificación especulativa con la capa MTP eleva el throughput de 71 a 130 tok/s en prosa abierta y a 186 tok/s en salidas con mucha copia, medido en una RTX 5090.

El caveat principal es que no es un checkpoint estándar: los artefactos `.ninfer` solo se cargan con `giveen/ninfer-ext` y **no** funcionan con `transformers`, `vLLM`, `llama.cpp` ni exllamav3. La cuantización no importa ningún checkpoint de exllamav3; se genera con el cuantizador propio `ninfer-quantize` a partir de tensores en precisión completa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido con atencion lineal GDN y atencion completa (clase `Qwen3_5ForCausalLM`); 64 capas, 48 de atencion lineal GDN y 16 de atencion completa, hidden 5120, intermediate 17408 |
| Parametros totales | 27B segun la denominacion del modelo base (`Qwen/Qwen3.8-27B`); el repositorio no desglosa el recuento exacto |
| Longitud de contexto | no disponible (la evaluacion de perplejidad uso contexto/stride 4096/2048, que no implica el maximo del modelo) |
| Tipos de cuantizacion | EXL3 nativo (`exl3_mul1` + `trellis_t16_v1`): cuerpo 4,0 bpw, controles de atencion y GDN 5,0 bpw, cabeza de vocabulario 6,0 bpw, capa MTP 4,0 bpw (5,0 en atencion), calibrada; torre de vision en Q6/Q8/Q4/Q5 groupwise (no EXL3). No hay GGUF, AWQ ni GPTQ en el repositorio |
| Idiomas soportados | en, zh, code |
| Licencia | apache-2.0 (los pesos cuantizados siguen la licencia del modelo base) |
| Formato de pesos | `.ninfer` (formato propietario de NInfer), mas un fichero `.conversion.json` de 336 KiB con la procedencia de la conversion y las tasas por tensor |

## Arquitectura y entrenamiento

El modelo subyacente es Qwen3.8-27B, un transformer hibrido de 64 capas en el que 48 capas usan atencion lineal GDN y solo 16 usan atencion completa, con hidden de 5120, intermediate de 17408 y un vocabulario de 248.320 entradas. Incorpora ademas una capa MTP (multi-token prediction) separada y una torre de vision, ambos empaquetados en el mismo artefacto. No hay informacion disponible sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron fases de RLHF o DPO.

La innovacion tecnica destacable esta en la capa de cuantizacion, no en el entrenamiento. NInfer emplea un trellis de tres instrucciones sobre teselas de 16x16 (`trellis_t16_v1`) con las rotaciones Hadamard de entrada y de salida fusionadas dentro de los kernels, lo que evita costes adicionales en tiempo de inferencia. Las tasas se asignan por tensor segun su sensibilidad. La capa MTP se calibra a partir de los estados ocultos finales y de los embeddings del siguiente token, y es la que habilita la decodificacion especulativa (`--spec mtp --draft-tokens 3 --fixed-draft`). La torre de vision queda fuera del esquema EXL3 porque su intermedio MLP no esta alineado a 128, de modo que se cuantiza de forma groupwise en Q6/Q8/Q4/Q5.

## Capacidades

- Generacion de texto autoregresiva en ingles, chino y codigo.
- Razonamiento y generacion de codigo, segun la etiqueta `code` del repositorio y el vocabulario del modelo base.
- Vision: la torre de vision se carga de forma perezosa y se activa con el flag `--vision`, lo que permite entrada de imagenes junto al texto.
- Decodificacion especulativa mediante la capa MTP integrada, con hasta K=3 tokens de borrador fijos.
- Inferencia de un solo fichero que contiene texto, MTP y vision sin necesidad de componentes externos.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso explicito: no disponible en la informacion proporcionada.
- Modo de pensamiento (thinking mode), audio u otras modalidades: no disponible en la informacion proporcionada.

## Casos de uso

- **Despliegue local de un modelo de 27B en una GPU de gama alta de consumo**: con 15,35 GiB de pesos, el artefacto deja margen en una GPU de 32 GB como la RTX 5090 (donde se midio 71 tok/s en decodificacion simple), lo que permite ejecutar un modelo de esta escala sin cluster ni servicio en la nube.
- **Generacion de codigo de baja latencia en estaciones de trabajo**: la etiqueta `code` y los 130 tok/s con MTP K=3 hacen viable un asistente de autocompletado local que responda en tiempos interactivos sin enviar codigo propietario a terceros.
- **Documentacion tecnica bilingue ingles-chino**: el modelo cubre ambos idiomas directamente, de modo que sirve para traducir y redactar documentacion tecnica entre las dos lenguas sin modelos auxiliares.
- **Procesamiento de capturas y diagramas tecnicos**: con `--vision` activado y MTP K=3 se midieron 139 tok/s, suficiente para transcribir diagramas de arquitectura, capturas de terminal o tablas de errores a texto estructurado.
- **Tareas de copia y reformateo intensivo**: en salidas con mucha copia (reformatear JSON, reescribir bloques de configuracion, extraer campos repetitivos) el modelo alcanza 186 tok/s con MTP K=3, el regimen mas favorable para decodificacion especulativa.
- **Evaluacion comparativa de esquemas de cuantizacion**: el repositorio publica la perplejidad del mismo corpus para EXL3 4,0 bpw, NVFP4 y Groupwise INT4 con sus tamanos, lo que permite usar este artefacto como referencia en estudios de compromiso calidad/memoria.
- **Investigacion en decodificacion especulativa con MTP**: la capa MTP calibrada y los flags `--spec`, `--draft-tokens` y `--fixed-draft` ofrecen un banco de pruebas controlado para medir la ganancia frente al numero de tokens de borrador.
- **Servicio on-premise en entornos con requisitos de residencia de datos**: `ninfer-serve` expone el artefacto por puerto (por ejemplo 8099) sobre una unica GPU, lo que encaja en despliegues aislados donde no se permite salida a Internet.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K ni equivalentes) en la informacion disponible. Los unicos datos publicados son de perplejidad y de throughput.

Perplejidad sobre corpus completo, 261.167 tokens, contexto/stride 4096/2048, KV en FP8 y decodificacion greedy:

| Artefacto | Tamano | PPL |
|---|---|---|
| Este modelo (EXL3 4,0 bpw) | 15,35 GiB | 4,2939 |
| NVFP4 | 22,09 GiB | 4,3149 |
| Groupwise INT4 | 16,96 GiB | 4,3439 |

Rendimiento medido en una sola NVIDIA GeForce RTX 5090 con CUDA 13.3:

| Regimen | Resultado |
|---|---|
| Decodificacion simple | 71 tok/s |
| Decodificacion con MTP K=3 (`--spec mtp --draft-tokens 3 --fixed-draft`) | 130 tok/s en prosa abierta; 186 tok/s en salidas con mucha copia |
| Prefill, T~1450 | 726 tok/s |
| Imagen + MTP K=3 | 139 tok/s |

La decodificacion esta limitada por ancho de banda: el coste por token equivale a leer una vez los 15,35 GiB de pesos.

## Requisitos de hardware

- Pesos en disco y en VRAM: 15,35 GiB para el artefacto EXL3 4,0 bpw, mas el fichero `.conversion.json` de 336 KiB.
- GPU medida: NVIDIA GeForce RTX 5090 (32 GB) con CUDA 13.3. Es el unico hardware con cifras publicadas.
- Cabe en GPU de consumo: si en la RTX 5090 (32 GB), donde se midieron 71 tok/s en simple y 130 tok/s con MTP. En tarjetas de 24 GB los pesos entrarian por tamano, pero el margen para cache KV, torre de vision y buffers quedaria muy reducido; no hay mediciones publicadas en esa clase de GPU, por lo que cualquier cifra seria una estimacion no verificada.
- GPU de centro de datos: A100 (40/80 GB) y H100 disponen de VRAM suficiente, pero no se han publicado latencias ni throughput para ellas.
- Cache KV: las mediciones de perplejidad usaron KV en FP8. La arquitectura es mayoritariamente de atencion lineal (48 de 64 capas), lo que reduce el crecimiento de la cache KV respecto a un transformer completamente atencional.
- Opciones de despliegue: exclusivamente `ninfer-serve` del repositorio `giveen/ninfer-ext`, compilado desde fuente con CMake en modo Release. No es compatible con vLLM, llama.cpp, Ollama, TGI, `transformers` ni exllamav3.
- Flujo de despliegue documentado: `git clone https://github.com/giveen/ninfer-ext`, `cmake -B build -DCMAKE_BUILD_TYPE=Release -DPython3_EXECUTABLE=$PWD/.venv/bin/python`, `cmake --build build -j` y despues `build/apps/ninfer-serve qwen3_8_27b_exl3_4bpw.ninfer --port 8099 --spec mtp --draft-tokens 3 --fixed-draft`.
- Latencia y throughput conocidos: 71 tok/s (decodificacion simple), 130 tok/s (MTP K=3, prosa abierta), 186 tok/s (MTP K=3, salida con mucha copia), 726 tok/s (prefill a T~1450) y 139 tok/s (imagen + MTP K=3), todos en RTX 5090.

## Comparativa con modelos similares

La informacion disponible solo permite comparar variantes de cuantizacion del mismo modelo base, no con otras familias de modelos:

| Artefacto | Parametros | Contexto | PPL (corpus 261.167 tokens) | Tamano | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Este modelo (EXL3 4,0 bpw) | 27B (modelo base) | no disponible | 4,2939 | 15,35 GiB | apache-2.0 | en este repositorio, requiere `ninfer-ext` |
| NVFP4 | 27B (modelo base) | no disponible | 4,3149 | 22,09 GiB | no disponible | referenciado como comparativa en la model card |
| Groupwise INT4 | 27B (modelo base) | no disponible | 4,3439 | 16,96 GiB | no disponible | referenciado como comparativa en la model card |

Comparacion con alternativas de otras familias (Llama, Mistral, otros Qwen, etc.): no disponible en la informacion proporcionada.

## Limitaciones y advertencias

- **Formato propietario y no interoperable**: los ficheros `.ninfer` solo los carga `giveen/ninfer-ext`. No son checkpoints de `transformers`, ni GGUF, ni safetensors, y no funcionan con `vLLM`, `llama.cpp`, `transformers` ni exllamav3. Intentar cargarlos en otro runtime falla.
- **Requiere compilar el motor desde fuente**: no hay paquete precompilado ni integracion con gestores de modelos habituales (Ollama, TGI, LM Studio). El proceso depende de CMake y de un entorno CUDA.
- **Sin validacion externa**: el repositorio registra 0 descargas y 0 likes, y no hay benchmarks estandar publicados que permitan contrastar las cifras del autor.
- **Perplejidad medida en regimen concreto**: los 4,2939 se obtuvieron con decodificacion greedy, contexto/stride 4096/2048 y KV en FP8. No son extrapolables a contextos largos ni a decodificacion con sampling.
- **Cuantizacion asimetrica por componente**: la torre de vision no usa EXL3 sino cuantizacion groupwise Q6/Q8/Q4/Q5, porque su intermedio MLP no esta alineado a 128. Esto implica que la calidad relativa de la parte de vision no es directamente comparable con la del cuerpo de texto.
- **Cobertura idiomatica limitada**: solo se declaran en, zh y code. El rendimiento en castellano y en otras lenguas no esta documentado.
- **Riesgo de alucinacion**: no hay datos especificos publicados para este artefacto; se aplican los riesgos habituales de un modelo de 27B sin benchmarking de fidelidad factual disponible.
- **Sesgos**: no disponible. No se documenta ninguna evaluacion de sesgos ni de seguridad.
- **Licencia**: el repositorio se declara apache-2.0 y la model card indica que los pesos cuantizados siguen la licencia del modelo base. No se detalla en la informacion disponible la licencia efectiva de `Qwen/Qwen3.8-27B`, por lo que conviene verificarla antes de un uso comercial.
- **Aviso de caducidad de la informacion**: el autor indica que se iran anadiendo mas artefactos NInfer a este repositorio con el tiempo, de modo que el contenido y las cifras pueden cambiar.
- **Contexto maximo no publicado**: al no indicarse la longitud de contexto soportada, no se puede garantizar el comportamiento en ventanas largas ni el consumo de cache KV asociado.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/jabbatheduck/ninfer-ext-models
- Artefacto de pesos: https://huggingface.co/jabbatheduck/ninfer-ext-models/blob/main/qwen3_8_27b_exl3_4bpw.ninfer
- Fichero de procedencia de la conversion: https://huggingface.co/jabbatheduck/ninfer-ext-models/blob/main/qwen3_8_27b_exl3_4bpw.ninfer.conversion.json
- Motor de inferencia NInfer Ext: https://github.com/giveen/ninfer-ext
- Documentacion de CLI del motor: https://github.com/giveen/ninfer-ext/blob/main/docs/cli.md
- Documentacion de serving del motor: https://github.com/giveen/ninfer-ext/blob/main/docs/serving.md
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
