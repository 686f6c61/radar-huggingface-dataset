# Schiltmans/Ternary-Bonsai-2-27B-DFlash2-ft5-GGUF

## Resumen

Ternary-Bonsai-2-27B-DFlash2-ft5-GGUF es la version cuantizada a Q8_0 de un modelo drafter (borrador) para decodificacion especulativa DFlash 2, publicado por el usuario Schiltmans. No se trata de un modelo de lenguaje autonomo, sino de un componente de aceleracion que se empareja con el modelo objetivo PrismML's Ternary-Bonsai-2-27B: el drafter propone bloques de tokens que el modelo grande verifica de forma paralela, reduciendo el coste por token generado.

El repositorio contiene un unico archivo GGUF de 2.056.415.104 bytes (`Ternary-Bonsai-2-27B-DFlash2-ft5-Q8_0.gguf`) generado con `convert_hf_to_gguf.py` de llama.cpp a partir del drafter en bf16 en la revision `2a2c2c1e`. Segun el autor, los pesos son los mismos que los del modelo base, por lo que no hay un nuevo ciclo de entrenamiento: solo una conversion de formato y cuantizacion.

Su relevancia es de nicho pero clara: permite ejecutar decodificacion especulativa DFlash 2 sobre el pack ternario de Bonsai dentro del ecosistema llama.cpp. El autor advierte explicitamente que su uso previsto es CUDA y no Apple Silicon, donde la ruta DFlash 2 de su fork resulta mas lenta que no usar drafter alguno.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (drafter DFlash 2; la model card no detalla la arquitectura interna) |
| Parametros totales | 1.924.404.480 (según metadatos de safetensors del repositorio) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0 en este repositorio; el modelo base ofrece bf16 y 4 bits |
| Idiomas soportados | no disponible (tokenizer de Qwen/Qwen3.8-27B) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (Q8_0) |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna del drafter; se limita a documentar su comportamiento. Los datos verificables son: opera con un bloque de 8 tokens, un token de mascara con id 248070 y cinco capas objetivo, y su layout GGUF es identico al del archivo Q8_0 de `z-lab/Qwen3.8-27B-DFlash2-GGUF` (los mismos 81 nombres de tensor, con las mismas formas, tipos y metadatos no descriptivos). Esto indica que hereda la estructura del drafter stock de DFlash 2 y solo cambia los pesos.

No hay informacion sobre datos de entrenamiento, numero de tokens, composicion del dataset, ni sobre fases de RLHF o DPO aplicadas al drafter. El modelo base declara ser un ajuste fino (`ft5`) del drafter DFlash 2 contra el modelo PrismML's Ternary-Bonsai-2-27B, que emplea un pack ternario con rotacion de Hadamard. El autor insiste en que esta publicacion GGUF no es un entrenamiento nuevo, sino la misma red convertida a Q8_0. El tokenizer procede de `Qwen/Qwen3.8-27B`, cuyo `tokenizer.json` es identico byte a byte al del pack Bonsai.

## Capacidades

- Generacion de borradores de tokens para decodificacion especulativa DFlash 2 (`--spec-type draft-dflash`), no generacion de texto final por si mismo.
- Propuesta de bloques de 8 tokens para verificacion por parte del modelo objetivo.
- Compatibilidad con el modelo objetivo Ternary-Bonsai-2-27B en su cuantizacion PQ2_0.
- Integracion en llama.cpp mediante `llama-server` con parametros `-md` y `-ngld`.
- Uso exclusivo en pipelines de inferencia acelerada; no soporta tool calling, agentes ni razonamiento multi-paso de forma autonoma.
- No dispone de capacidades de vision, audio ni modo de razonamiento propio.

## Casos de uso

- Acelerar la decodificacion de Ternary-Bonsai-2-27B en servidores CUDA: el drafter se carga junto al modelo objetivo con `-md` y permite verificar varios tokens por paso, reduciendo el coste por token generado. Es el escenario para el que esta disenado.
- Despliegue de inferencia de bajo coste en GPUs con memoria limitada: al ocupar unos 2 GB en Q8_0, el drafter anade una sobrecarga pequena frente al peso del modelo objetivo, haciendo viable la decodificacion especulativa en GPUs de gama media.
- Investigacion en decodificacion especulativa: sirve como referencia reproducible para comparar tasas de aceptacion entre drafters sobre el mismo objetivo y con el mismo tokenizer.
- Evaluacion comparativa de formatos de cuantizacion de drafters: permite contrastar el rendimiento de un drafter Q8_0 frente a las variantes bf16 y 4 bits del mismo ajuste en distintos backends.
- Integracion en servicios `llama-server` existentes: al seguir el layout del drafter stock de z-lab, el archivo puede sustituir al GGUF original en configuraciones que ya usen DFlash 2 sin cambiar nombres de tensor ni metadatos.
- Pruebas de regresion en CI sobre forks de llama.cpp: el repositorio aporta evidencias con hashes por tensor y comparacion de cabeceras que permiten validar que una compilacion concreta carga y draftea correctamente.

## Benchmarks y rendimiento

El autor publica una unica validacion, realizada en un Apple M4 Pro con el fork de PrismML en el commit `0324c665` y DFlash 2 de upstream parcheado. Se trata de un diagnostico contra una medicion previa, no de una comparacion ABBA.

| Metrica | Drafter ft5 (este) | Drafter stock | Sin drafter |
|---|---|---|---|
| Proporcion de drafts aceptados | 0,405 | 0,346 | no aplica |
| Velocidad de decodificacion (tok/s) | 7,97 | 7,10 | 20,56 |
| Longitud de salida (tokens) | 5.706 | 5.706 | no disponible |

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, lo cual es coherente con la naturaleza del artefacto: es un drafter, no un modelo de lenguaje evaluable de forma independiente.

## Requisitos de hardware

- VRAM estimada para el drafter: aproximadamente 2 GB en Q8_0, el tamano del propio archivo.
- VRAM total: la del drafter mas la del modelo objetivo Ternary-Bonsai-2-27B en PQ2_0; no disponible en la informacion proporcionada.
- GPU recomendadas: CUDA. El autor no ha medido el GGUF en CUDA y no ofrece cifras de VRAM ni de latencia para esa plataforma.
- Apple Silicon: soportado tecnicamente, pero desaconsejado; en Metal la ruta DFlash 2 del fork cuesta unas diez veces mas que un paso de un solo token y resulta mas lenta que no usar drafter.
- Opciones de despliegue: `llama-server` de llama.cpp. Requiere un build con soporte DFlash 2 y con el soporte de PrismML para el pack ternario rotado con Hadamard, disponible en el fork `PrismML-Eng/llama.cpp` mediante el PR #261. El llama.cpp de upstream incluye DFlash 2 pero no puede cargar el modelo objetivo.
- Comando de referencia indicado por el autor: `llama-server -m Ternary-Bonsai-2-27B-PQ2_0.gguf -md Ternary-Bonsai-2-27B-DFlash2-ft5-Q8_0.gguf --spec-type draft-dflash --spec-draft-n-max 7 -ngld 99 -ngl 99 -fa on --jinja`.
- Latencia y throughput: en Apple M4 Pro se midieron 7,97 tok/s con el drafter ft5 frente a 7,10 tok/s con el stock y 20,56 tok/s sin drafter. No hay datos de rendimiento en CUDA.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Contexto | Rendimiento medido | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Ternary-Bonsai-2-27B-DFlash2-ft5-GGUF (este) | 1.924.404.480 | GGUF Q8_0 | no disponible | 0,405 drafts aceptados; 7,97 tok/s en M4 Pro | Apache-2.0 | HuggingFace, 0 descargas |
| z-lab/Qwen3.8-27B-DFlash2-GGUF (drafter stock) | no disponible | GGUF Q8_0 | no disponible | 0,346 drafts aceptados; 7,10 tok/s en M4 Pro | no disponible | HuggingFace |
| Drafter bf16 del mismo ajuste | no disponible | bf16 | no disponible | no disponible | Apache-2.0 (heredada) | HuggingFace |
| Drafter 4 bits del mismo ajuste | no disponible | 4 bits | no disponible | no disponible | Apache-2.0 (heredada) | HuggingFace |

El autor senala que en Mac resulta preferible usar el drafter bf16 o el de 4 bits con mlx-dspark, o bien MTPLX sin drafter, que segun la model card del bf16 es incluso mas rapido que las alternativas evaluadas.

## Limitaciones y advertencias

- No es un modelo autonomo: requiere el modelo objetivo Ternary-Bonsai-2-27B y no produce texto util por si solo.
- Dependencia de un fork concreto de llama.cpp (`PrismML-Eng/llama.cpp`); el llama.cpp de upstream no puede cargar el modelo objetivo aunque tenga DFlash 2.
- El autor no ha medido el rendimiento del GGUF en CUDA, que es precisamente la plataforma recomendada. Las unicas cifras disponibles provienen de Apple M4 Pro.
- En Metal el uso del drafter empeora el rendimiento frente a no usarlo, por lo que no debe desplegarse en Apple Silicon.
- La validacion publicada es un diagnostico contra una medicion previa, no una comparacion ABBA, y el propio autor la califica como tal.
- El repositorio no registra descargas ni valoraciones, y no tiene pipeline declarado; se trata de un release independiente sin respaldo de Prism ML, Qwen, Inco AI ni z-lab.
- Licencia Apache-2.0 con el `LICENSE` y el `NOTICE` del release bf16, que incluyen el aviso de Prism ML y la atribucion solicitada: "Created using Bonsai by Prism ML". Es obligatorio conservar dicha atribucion.
- No hay informacion sobre idiomas soportados ni sobre el comportamiento del drafter fuera del ingles o del dominio de entrenamiento del modelo objetivo.
- Al no ser un modelo generativo independiente, no procede evaluar sesgos o alucinaciones propios; estos dependerian del modelo objetivo.
- La model card no ofrece datos de contexto, arquitectura interna ni composicion de entrenamiento, lo que limita cualquier auditoria tecnica del artefacto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Schiltmans/Ternary-Bonsai-2-27B-DFlash2-ft5-GGUF
- Modelo base (drafter bf16): https://huggingface.co/Schiltmans/Ternary-Bonsai-2-27B-DFlash2-ft5
- Drafter stock de referencia: https://huggingface.co/z-lab/Qwen3.8-27B-DFlash2-GGUF
- Tokenizer de origen: https://huggingface.co/Qwen/Qwen3.8-27B
- Fork de llama.cpp con soporte de PrismML: https://github.com/PrismML-Eng/llama.cpp
- PR del fork que anade DFlash 2: https://github.com/PrismML-Eng/llama.cpp/pull/261
- Repositorio de evidencias del autor: https://github.com/alexschiltmans/bonsai2-drafter
- Evidencias del fork GGUF: https://github.com/alexschiltmans/bonsai2-drafter/tree/main/evidence/gguf-fork
- Sonda del fork en Metal: https://github.com/alexschiltmans/bonsai2-drafter/tree/main/evidence/fork-probe
- PR de upstream con soporte DFlash 2: llama.cpp PR #27816 (referenciado en la model card)
