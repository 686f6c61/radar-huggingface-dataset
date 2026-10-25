# gjehrenberg/Gemma3-1B-tools-Q2_K-GGUF

## Resumen

`gjehrenberg/Gemma3-1B-tools-Q2_K-GGUF` es una distribucion en formato GGUF del modelo `iromu/Gemma3-1B-tools`, un ajuste fino mediante LoRA sobre Gemma 3 de 1B de parametros orientado especificamente a *tool calling* y *function calling*. El repositorio lo publica el usuario `gjehrenberg` y no contiene un modelo nuevo: es una conversion de pesos realizada con `llama.cpp` a traves del espacio `GGUF-my-repo` de ggml.ai, cuantizada en Q2_K.

El interes practico del artefacto esta en el binomio tamano/coste: con 999.885.952 parametros totales y una cuantizacion de aproximadamente 2 bits, el fichero cabe en cualquier GPU de consumo, en CPU modesta e incluso en dispositivos de placa unica. Eso lo convierte en candidato para prototipos de agentes locales, pruebas de pipelines de herramientas y despliegue en el borde, donde no hay presupuesto de VRAM para modelos de 7B o superiores.

Ahora bien, se trata de un modelo derivado de terceros, con cero descargas y cero *likes* en el momento de la consulta, sin resultados de benchmarks publicados y sin model card propia mas alla de las instrucciones de uso con `llama.cpp`. La informacion sobre el ajuste fino original (dataset, hiperparametros, evaluacion) solo puede inferirse del repositorio base `iromu/Gemma3-1B-tools`, y el autor de esta conversion no anade documentacion adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Gemma 3, variante de 1B); no disponible el detalle exacto de capas y dimensiones en la informacion proporcionada |
| Parametros totales | 999.885.952 (dato de safetensors del modelo base) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible. La documentacion de la familia Gemma 3 en los resultados de busqueda menciona ventanas de hasta 128K en variantes mayores (27B); no se confirma el valor para este derivado de 1B. El ejemplo de servidor de la model card usa `-c 2048` |
| Tipos de cuantizacion | Q2_K (GGUF, ~2 bits). El repositorio contiene el fichero `gemma3-1b-tools-q2_k.gguf`; no se documentan otras cuantizaciones en este repo |
| Idiomas soportados | Ingles (`en`, declarado en los metadatos). El Gemma 3 original es multilingue, pero este ajuste fino no declara otros idiomas |
| Licencia | Gemma (Gemma Terms of Use) |
| Formato de pesos | GGUF (fichero unico); el modelo base esta en safetensors con adaptador LoRA |
| Tamano del repositorio | 0,7 GB |
| Libreria declarada | transformers (pese a que el artefacto es GGUF para llama.cpp) |
| Modelo base | `iromu/Gemma3-1B-tools` |
| Dataset de ajuste | `r0b0tlab/qwen3.8-max-glm5.2-kimi-k3-distillation` (segun metadatos) |
| Descargas / likes | 0 / 0 en la fecha de consulta |
| Fecha de creacion | 2026-10-25 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Gemma 3 en su variante de 1B parametros: un transformer decoder-only de la familia de modelos abiertos de Google. Segun los resultados de busqueda, la variante de 1B es la version "text-only" de la familia, frente a las variantes mayores con capacidades vision-language. El proceso que da lugar a este repositorio concreto es puramente de conversion y cuantizacion: los pesos de `iromu/Gemma3-1B-tools` se transforman a GGUF mediante `llama.cpp` y se cuantizan a Q2_K con el espacio `GGUF-my-repo` de ggml.ai. No hay entrenamiento adicional en este paso.

El ajuste fino que si existe ocurre en el modelo base: `iromu/Gemma3-1B-tools` se presenta con las etiquetas `lora` y `fine-tuned`, lo que indica un entrenamiento mediante adaptadores LoRA de bajo rango sobre Gemma 3 1B para especializarlo en generacion de llamadas a herramientas. El dataset declarado es `r0b0tlab/qwen3.8-max-glm5.2-kimi-k3-distillation`, cuyo nombre sugiere un corpus de destilacion generado a partir de modelos mayores (referencias a Qwen 3, GLM y Kimi). No se dispone de informacion sobre numero de tokens, composicion del dataset, hiperparametros de entrenamiento ni si hubo fases de RLHF o DPO; tampoco se documenta ninguna innovacion tecnica adicional (atencion lineal, decodificacion especulativa, modos de razonamiento) en la informacion proporcionada.

## Capacidades

- Generacion de texto en ingles y conversacion multi-turno basica, heredadas de Gemma 3 1B.
- *Tool calling* / *function calling*: es la capacidad para la que fue ajustado el modelo base, orientado a emitir llamadas estructuradas a funciones definidas por el desarrollador.
- Integracion en flujos de agentes: las etiquetas del repositorio incluyen `agents`, lo que indica que el ajuste busca soportar razonamiento de varios pasos con herramientas.
- Ejecucion local en `llama.cpp` mediante CLI (`llama-cli`) o servidor (`llama-server`), con API compatible con endpoints.
- Compatibilidad con el ecosistema de herramientas que consumen GGUF (llama.cpp y derivados), lo que facilita su uso en entornos sin GPU.
- Capacidades multimodales: no disponibles en esta variante (Gemma 3 1B es text-only segun la informacion de busqueda).
- Modo *thinking* explicito, soporte de audio o vision: no disponibles / no documentados.

## Casos de uso

- **Prototipado de agentes locales en portatil**: con menos de 1 GB de pesos en Q2_K, el modelo se puede levantar con `llama-server` en una maquina sin GPU dedicada para validar rapidamente el esquema de herramientas (nombres, parametros, formatos JSON) antes de invertir en un modelo mayor.
- **Enrutado de intenciones en pipelines de bajo coste**: usar el modelo como primera etapa que decide que funcion invocar (busqueda, calculo, consulta a API) y delega la ejecucion real en codigo; su tamano permite mantenerlo residente en memoria de forma permanente.
- **Despliegue en el borde o en dispositivos embebidos**: la cuantizacion Q2_K y el tamaÃ±o del fichero lo hacen viable en placas tipo Raspberry Pi o mini-PC para asistentes de voz o automatizacion domotica que requieran generacion de comandos estructurados.
- **Generacion de esquemas de llamadas en tests automatizados**: sirve como generador de casos de prueba para validar parsers de *tool calling* en un framework propio, sin coste de API y con resultados deterministas ajustando temperatura.
- **Asistente de consultas sobre APIs internas**: dado un catalogo de funciones documentadas en el prompt, el modelo puede seleccionar la funcion y rellenar argumentos en flujos de soporte tecnico o consulta de estado, siempre con validacion posterior del lado servidor.
- **Banco de pruebas de cuantizacion**: util para medir cuanto degrada Q2_K la precision en tareas de salida estructurada frente a Q4_K_M o Q8_0 del mismo modelo base, ya que el resto del pipeline es identico.
- **Clasificacion y extraccion con formato fijo**: tareas de extraccion de entidades o etiquetado donde la salida se restringe a un esquema, aprovechando el ajuste orientado a formatos estructurados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Ni el repositorio de conversion ni los resultados de busqueda incluyen cifras de MMLU, HumanEval, GSM8K, BFCL (*Berkeley Function Calling Leaderboard*) ni de ninguna otra evaluacion para este modelo o para su base `iromu/Gemma3-1B-tools`.

## Requisitos de hardware

- **VRAM estimada para inferencia**: por debajo de 1 GB para los pesos en Q2_K (el repositorio completo ocupa 0,7 GB); con cache KV para 2048 tokens el consumo total se mantiene en el entorno de 1 GB o menos. No hay mediciones publicadas; la cifra se deriva del tamano del fichero.
- **GPU recomendadas**: cualquier GPU con 2 GB o mas de memoria es suficiente (GTX 1650, RTX 3050 en adelante). Para throughput alto, una RTX 4090 o A100 estan sobredimensionadas para este modelo y solo se justifican por agregacion de muchas instancias.
- **Cabe en GPU de consumo**: si, en practicamente todas las GPU dedicadas de los ultimos diez anios, y tambien en iGPU con memoria unificada.
- **CPU**: viable en CPU sola. La model card incluye instrucciones explicitas para `llama-cli` y `llama-server`, que funcionan sin GPU.
- **Opciones de despliegue**: `llama.cpp` (CLI y servidor), cualquier frontend compatible con GGUF (LM Studio, Ollama importando el fichero, `llama-cpp-python`). vLLM y TGI no se citan en la informacion disponible como soportados para este artefacto GGUF concreto.
- **Latencia y throughput**: no disponibles. No se han publicado mediciones para este repositorio.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `gjehrenberg/Gemma3-1B-tools-Q2_K-GGUF` | ~1B (999.885.952) | No disponible | Ajuste fino en tool calling, cuantizado a Q2_K en GGUF | Gemma | Publico, 0 descargas, sin benchmarks |
| `iromu/Gemma3-1B-tools` (base) | ~1B | No disponible | Ajuste fino LoRA para tool calling, pesos en safetensors | Gemma | Publico; misma funcionalidad con mayor precision numerica |
| `google/gemma-3-1b-it` | ~1B (variante 1B de la familia) | No disponible para la variante 1B; la familia documenta hasta 128K en modelos mayores | Modelo instruct generalista de Google, sin especializacion en herramientas | Gemma | Publico, ampliamente adoptado |
| `oncu/gemma-3-1b-it-GGUF` | ~1B | No disponible | Cuantizacion GGUF del modelo oficial de Google, sin ajuste en tool calling | Gemma | Publico |

La diferencia clave frente a las alternativas no es de rendimiento medido, del que no hay datos, sino de proposito: este repositorio combina la especializacion en funciones del ajuste de `iromu` con la maxima compresion (Q2_K), lo que maximiza la portabilidad a costa de la fidelidad de los pesos. Frente al GGUF de `oncu` u otros derivados del modelo oficial, la ventaja esperada esta en la tasa de acierto al emitir llamadas estructuradas; frente al modelo base `iromu/Gemma3-1B-tools`, la ventaja es el tamano y la simplicidad de despliegue, y la desventaja es la perdida de calidad por cuantizacion agresiva.

## Limitaciones y advertencias

- **Cuantizacion muy agresiva**: Q2_K introduce una perdida de calidad notable, especialmente sensible en modelos de ~1B y en tareas que requieren salida estructurada (JSON de llamadas a funciones). Es probable que la tasa de llamadas mal formadas aumente respecto al modelo base en safetensors o en cuantizaciones Q4_K_M o superiores; no hay mediciones que lo cuantifiquen.
- **Riesgo de alucinacion en argumentos**: un modelo de 1B especializado en herramientas puede inventar nombres de funciones, parametros inexistentes o valores fuera de rango. Toda llamada debe validarse contra el esquema del lado servidor antes de ejecutarse.
- **Idioma**: solo se declara ingles. El uso en castellano no esta respaldado por el ajuste fino, aunque el Gemma 3 subyacente sea multilingue.
- **Sin validacion comunitaria**: cero descargas y cero *likes* en la fecha de consulta, publicacion reciente y sin model card propia mas alla de las instrucciones de `llama.cpp`. No hay evidencia de terceros sobre su comportamiento.
- **Sin benchmarks**: no existe ninguna evaluacion publicada, ni del modelo ni de su base, que permita comparar con alternativas de forma objetiva.
- **Procedencia de los datos de entrenamiento**: el dataset es una destilacion de modelos de terceros (`qwen3.8-max-glm5.2-kimi-k3-distillation`). No se detalla su composicion, filtrado ni los terminos de uso de los modelos que lo generaron, lo que anade incertidumbre sobre sesgos y sobre la cadena de licencias.
- **Licencia Gemma**: el uso comercial esta permitido bajo los Gemma Terms of Use, que imponen obligaciones de redistribucion (incluir el aviso de licencia), y una politica de usos prohibidos. Conviene revisar los terminos vigentes antes de integrarlo en un producto.
- **Contexto util desconocido**: aunque la familia Gemma 3 soporte ventanas grandes, el ejemplo de la model card arranca el servidor con `-c 2048`; no hay garantia de que el ajuste fino mantenga calidad en contextos largos.
- **Idoneidad para produccion**: dado el estado del repositorio, es razonable tratarlo como artefacto experimental y no como dependencia de produccion sin una evaluacion propia previa.

## Enlaces

- Repositorio del modelo: https://huggingface.co/gjehrenberg/Gemma3-1B-tools-Q2_K-GGUF
- Modelo base del ajuste fino: https://huggingface.co/iromu/Gemma3-1B-tools
- Modelo original de Google: https://huggingface.co/google/gemma-3-1b-it
- Cuantizacion GGUF alternativa del modelo oficial: https://huggingface.co/oncu/gemma-3-1b-it-GGUF
- Dataset declarado: https://huggingface.co/datasets/r0b0tlab/qwen3.8-max-glm5.2-kimi-k3-distillation
- Espacio de conversion GGUF-my-repo: https://huggingface.co/spaces/ggml-org/gguf-my-repo
- Repositorio de llama.cpp: https://github.com/ggerganov/llama.cpp
- Ficha en LM Studio de Gemma 3 1B: https://lmstudio.ai/models/google/gemma-3-1b
- Entrada de Gemma 3 1B en Ollama: https://ollama.com/library/gemma3:1b
- Documentacion de la familia Gemma: https://gemma.ai/models/
