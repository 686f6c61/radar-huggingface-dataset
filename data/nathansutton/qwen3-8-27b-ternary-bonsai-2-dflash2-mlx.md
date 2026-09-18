# nathansutton/Qwen3.8-27B-Ternary-Bonsai-2-DFlash2-MLX

## Resumen

El modelo `nathansutton/Qwen3.8-27B-Ternary-Bonsai-2-DFlash2-MLX` es una redistribucion del empaquetado ternario `Ternary-Bonsai-2-27B` de Prism ML, a su vez derivado de `Qwen/Qwen3.8-27B`. Lo publica el autor nathansutton como modelo por defecto de **chad**, un agente de codificacion local estilo Claude Code para Apple Silicon. El repositorio no solo incluye el modelo objetivo, sino tambien el borrador (drafter) de decodificacion especulativa DFlash2 ya cuantizado en el subdirectorio `dflash/`, de modo que una sola descarga de aproximadamente 8,8 GB proporciona ambas mitades del sistema sin compilacion en el primer arranque.

El modelo base es un transformer denso de la familia `qwen3_5` con arquitectura hibrida: 64 capas, de las cuales 48 son GatedDeltaNet y 16 son atencion completa. Cuenta con 26.898.908.672 parametros y 262.144 tokens de contexto nativo. Todas las proyecciones estan almacenadas en una base rotada de Hadamard y cuantizadas a 2 bits afines con grupo de 128, de forma que los tres niveles reproducen el conjunto ternario {−s, 0, +s}. El resultado ocupa 7,15 GB de pesos mas 1,1 GB del borrador.

Su relevancia actual es doble: por un lado demuestra que una cuantizacion ternaria de 2 bits puede mantener la calidad en codigo (NLL con teacher forcing de 1,502 frente a 1,500 del forward fp32 del propio pack) y, por otro, empaqueta decodificacion especulativa por bloques DFlash2 lista para usar, con 64 tok/s en un M4 Pro frente a 21 tok/s en serie. Esta pensado explicitamente para Macs de 24 GB de memoria unificada, donde el umbral de compactacion de chad ronda los 150.000 tokens, frente a los aproximadamente 30.000 tokens del cuantizado de 3 bits al que reemplaza.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso hibrido `qwen3_5`: 64 capas, 48 GatedDeltaNet + 16 atencion completa |
| Parametros totales | 26.898.908.672 (26,9 B), segun cabecera safetensors del repositorio |
| Parametros activos | No aplica: modelo denso, no es MoE |
| Parametros del borrador | 1,9 B adicionales (subdirectorio `dflash/`, 4 bits grupo 64) |
| Longitud de contexto | 262.144 tokens nativos; ventana efectiva de aproximadamente 150.000 tokens en un M4 Pro de 24 GB (umbral de compactacion de chad) |
| Tipos de cuantizacion | Ternario 2 bits afin grupo 128 con rotacion Hadamard (niveles {−s, 0, +s}); borrador en 4 bits grupo 64 |
| Idiomas soportados | No disponible: la model card no enumera idiomas; solo menciona un conjunto de evaluacion interno de idiomas de chad superado 17/17 |
| Licencia | Apache-2.0 (pesos ternarios copyright Prism ML, Inc., sobre Qwen3.8-27B de Alibaba Cloud) |
| Formato de pesos | Safetensors en formato MLX (libreria `mlx`); no se distribuyen GGUF ni pesos PyTorch |
| Tamano del repositorio | 8,8 GB (7,15 GB de pesos objetivo + 1,1 GB de borrador) |
| Modo de razonamiento | Plantilla de chat con `reasoning_effort` por defecto en `medium` (el pack de Prism y el upstream de Qwen usan `xhigh`) |
| Modalidades | Solo texto: la torre de vision FP16 del pack (0,92 GB) se elimina y `config.json` declara `components.vision: false` |
| Tipo de modelo en config | `prism_hadamard_qwen35` |
| Fecha de creacion | 2026-09-18 |

## Arquitectura y entrenamiento

La arquitectura sigue el diseno `qwen3_5` del modelo base: 64 capas que combinan 48 capas GatedDeltaNet (un mecanismo de estado recurrente con compuertas, orientado a reducir el coste de atencion en secuencias largas) con 16 capas de atencion completa. Esta mezcla es la que permite sostener 262.144 tokens de contexto con un perfil de memoria contenido. Sobre esa base, Prism ML aplica una transformacion Hadamard por bloques fuera de linea: cada proyeccion se multiplica por un vector de signos fijo y se pasa por una Walsh-Hadamard transform por bloques antes de cuantizar a 2 bits afines con grupo de 128, cuyos tres niveles reproducen el conjunto ternario. La rotacion no anade bits ni trafico de pesos, pero obliga a aplicar la transformada correspondiente a las activaciones en tiempo de ejecucion y a invertirla tras la consulta de embeddings.

Esta ficha no dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO, ni para el modelo base Qwen3.8-27B ni para el proceso de cuantizacion. Lo que si se documenta es el proceso de empaquetado: los tensores del modelo de lenguaje, los vectores de signos y `hadamard.json` son byte a byte identicos a la revision de origen registrada en la cabecera safetensors como `source_revision`, y se sustituyen el tokenizador y la plantilla de chat por los del modelo base.

La innovacion tecnica mas destacable es el borrador DFlash2, un modelo de 1,9 B que lee el flujo residual del objetivo en cinco capas seleccionadas y propone un bloque completo de tokens en un unico forward, siguiendo el metodo de Chen et al. descrito en *DFlash: Block Diffusion for Flash Speculative Decoding* (arXiv:2602.06036). chad verifica el bloque en un forward por lotes del objetivo y acepta mediante rejection sampling exacto, de modo que la salida greedy es identica a token a token respecto a la decodificacion sin especulacion (salvo redondeo de kernels) y la salida muestreada conserva la distribucion real del modelo a cualquier temperatura. El autor senala que, dado que el borrador lee el flujo residual (solo perturbado por la cuantizacion de pesos), el borrador entrenado contra la base en bf16 se transfiere sin cambios al objetivo ternario. El repositorio no incluye runtime propio: chad reimplementa el forward y no importa codigo desde una descarga de modelo.

## Capacidades

- Generacion de texto y conversacion: tarea declarada en el pipeline (`text-generation`, `conversational`).
- Codificacion: el modelo esta etiquetado como `coding` y es el modelo por defecto del agente chad; el conjunto de evaluacion interno de codigo de chad pasa 13/13.
- Cobertura multilingue: no documentada en detalle; el autor menciona que el nivel de evaluacion interno de idiomas de chad pasa 17/17, pero no publica la lista de idiomas.
- Modo de razonamiento: la plantilla de chat expone el parametro `reasoning_effort`, con valor por defecto `medium` en este repositorio, configurable por el llamante.
- Contexto largo: hasta 262.144 tokens nativos, con compactacion gestionada dinamicamente por chad segun el presupuesto real de Metal (aproximadamente 150.000 tokens en 24 GB).
- Decodificacion especulativa integrada: el borrador DFlash2 por difusion de bloques acelera la generacion con una tasa de aceptacion del 94% de tokens propuestos en la prueba del autor.
- Tool calling, function calling, agentes multi-paso, vision y audio: no documentados en la informacion disponible. La vision esta explicitamente deshabilitada (`components.vision: false`).

## Casos de uso

- Agente de codificacion local en macOS: es el modelo por defecto de chad (`uvx chad-code`), por lo que se usa directamente como agente estilo Claude Code que lee y edita un repositorio local. Su ventana efectiva de aproximadamente 150.000 tokens en 24 GB permite mantener ficheros y contexto de proyecto amplios sin salir de la maquina.
- Asistencia de programacion offline en portatiles Apple Silicon: con 8,25 GB de pesos y borrador en disco y un objetivo de 24 GB de memoria unificada, cabe en un MacBook Pro M4 Pro sin GPU dedicada ni conexion a servicios externos.
- Reescritura y revision de codigo con contexto de repositorio: los 262.144 tokens nativos posibilitan pasar varios modulos o un arbol de ficheros completo en una sola peticion, util para refactorizaciones coherentes entre ficheros.
- Desarrollo con requisitos de privacidad: al ejecutarse integramente en local y no importar codigo de la descarga, es apto para entornos donde el codigo no puede enviarse a APIs en la nube (banca, sanidad, defensa).
- Generacion asistida de parches en un flujo de trabajo de terminal: la salida greedy es token a token identica a la decodificacion sin especulacion, lo que da reproducibilidad determinista, requisito habitual al generar diffs que se aplican automaticamente.
- Aceleracion de tareas de generacion larga: gracias al borrador (64 tok/s frente a 21 tok/s en serie en M4 Pro), resulta adecuado para producir documentacion, tests o comentarios extensos donde la latencia de decodificacion domina.
- Investigacion sobre cuantizacion ternaria y decodificacion especulativa: el repositorio publica NLL con teacher forcing frente al forward fp32, tasas de aceptacion del borrador y metricas de velocidad, lo que lo convierte en una referencia reproducible para estudiar el impacto de 2 bits ternarios con rotacion Hadamard.
- Servidor de inferencia personal en red local: puede exponerse mediante un wrapper propio sobre MLX en la misma maquina, aunque no hay integracion documentada con servidores de inferencia estandar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks convencionales (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. Los unicos datos de evaluacion son internos del autor:

| Metrica | Resultado | Contexto |
|---|---|---|
| NLL con teacher forcing en codigo | 1,502 (ternario 2 bits) frente a 1,500 (fp32 del mismo pack) | Practicamente sin degradacion |
| Nivel de evaluacion interno de codigo de chad | 13/13 | Igual que el cuantizado de 3 bits |
| Nivel de evaluacion interno de idiomas de chad | 17/17 | Igual que el cuantizado de 3 bits |
| Velocidad de decodificacion en serie (M4 Pro) | 21 tok/s | Greedy, prompt de 512 tokens, decodificacion de 128 tokens |
| Velocidad con borrador DFlash2 (M4 Pro) | 64 tok/s | Mismo escenario, 94% de tokens propuestos aceptados |
| Prefill (M4 Pro) | Aproximadamente 99 tok/s | Prompt de 512 tokens |

## Requisitos de hardware

- Memoria unificada: disenado para Apple Silicon con 24 GB. Los pesos objetivo ocupan 7,15 GB y el borrador 1,1 GB, por lo que el margen restante determina la ventana de contexto util (aproximadamente 150.000 tokens en un M4 Pro de 24 GB).
- GPU: exclusivamente Apple Silicon mediante MLX (M4 Pro verificado por el autor). No hay soporte CUDA: no se documentan ejecuciones en A100, H100 ni RTX 4090.
- GPU de consumo: encaja en Macs de 24 GB (por ejemplo, M4 Pro). No se documentan requisitos minimos por debajo de esa cifra.
- Despliegue: la via soportada es chad (`uvx chad-code`). `mlx-lm` por si solo **no** ejecuta el modelo correctamente, porque un cargador afin estandar de MLX encuentra tensores con las formas correctas, omite las dos transformadas Hadamard y produce basura plausible sin lanzar error; es necesario un cargador que reconozca `model_type: prism_hadamard_qwen35`. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, y el repositorio no incluye runtime propio.
- Latencia y throughput medidos: prefill de aproximadamente 99 tok/s y decodificacion de 21 tok/s en serie o 64 tok/s con el borrador, con el 94% de aceptacion, sobre M4 Pro con prompt de 512 tokens y 128 tokens de decodificacion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (ternario 2 bits, DFlash2, MLX) | 26,9 B + borrador de 1,9 B | 262.144 nativos; aproximadamente 150.000 efectivos en 24 GB | Ternario 2 bits grupo 128 con Hadamard; borrador 4 bits grupo 64 | Apache-2.0 | MLX/Apple Silicon; requiere chad o cargador compatible |
| `prism-ml/Ternary-Bonsai-2-27B-mlx-2bit` (pack de origen) | 26,9 B | 262.144 segun el modelo base | Ternario 2 bits grupo 128 con Hadamard | Apache-2.0 | MLX; incluye torre de vision FP16 (0,92 GB) y runtime Python que el llamante debe insertar en `sys.path` |
| `nathansutton/Qwen3.8-27B-UD-Q3_K_XL-DFlash2-MLX` (cuantizado de 3 bits, mismo borrador) | No disponible | 262.144 nativos; aproximadamente 30.000 efectivos en 24 GB | 3 bits tipo UD-Q3_K_XL; borrador 4 bits grupo 64 | No disponible en la informacion proporcionada | MLX/Apple Silicon |
| `Qwen/Qwen3.8-27B` (modelo base) | 26,9 B | 262.144 nativos | Pesos sin cuantizar (bf16) | Apache-2.0 | PyTorch/transformers; no apto para 24 GB de memoria unificada |
| `z-lab/Qwen3.8-27B-DFlash2` (origen del borrador) | 1,9 B | No aplica | No disponible | Se debe respetar la licencia y los terminos de cita del release original | DFlash2 |

## Limitaciones y advertencias

- Solo texto: la torre de vision FP16 del pack original se elimina deliberadamente; cualquier caso de uso multimodal queda fuera de alcance.
- Riesgo grave de carga incorrecta silenciosa: un cargador MLX estandar no lanza error y devuelve resultados plausibles pero incorrectos, porque omite las transformadas Hadamard. En produccion es obligatorio verificar que el cargador aplica la rotacion y la inversa.
- Dependencia de plataforma: requiere Apple Silicon con MLX. No hay ruta documentada para CUDA ni para GPUs de consumo x86.
- Dependencia de herramienta: la ejecucion soportada pasa por chad; `mlx-lm` por si solo no ejecuta el modelo correctamente y no se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Sesgos conocidos: no disponibles. La model card no incluye ninguna evaluacion de sesgo, toxicidad o alineacion.
- Alucinacion: no hay datos publicados sobre tasas de alucinacion ni evaluaciones de veracidad.
- Cobertura de idiomas no documentada: no se enumera la lista de idiomas soportados, solo un resultado agregado de un conjunto de evaluacion interno.
- Cambios en el tokenizador y la plantilla de chat respecto al pack de Prism: se emplea el tokenizador del modelo base (distintas fusiones y pre-tokenizador que el pack) y el valor por defecto de `reasoning_effort` es `medium`, no `xhigh`. Hay que pasar el parametro explicitamente para anularlo.
- Licencia y atribucion: los pesos son Apache-2.0, pero los pesos ternarios son copyright de Prism ML, Inc. y el borrador procede de `z-lab/Qwen3.8-27B-DFlash2`, cuyos terminos de licencia y cita deben respetarse por separado.
- Validacion comunitaria muy limitada: 643 descargas y 2 "likes" en el momento de redactar esta ficha, con una unica revision subida y actualizada el mismo dia. Las cifras de calidad y velocidad proceden del propio autor y no de una evaluacion independiente.
- Precision de las metricas: los resultados de evaluacion citados (13/13 y 17/17) provienen de conjuntos privados de chad y no son reproducibles externamente; el unico dato cuantitativo verificable es la NLL sobre codigo.
- Discrepancia de recuento: los 26.898.908.672 parametros de la cabecera safetensors corresponden al modelo objetivo; el borrador de 1,9 B vive en `dflash/` y no esta incluido en esa cifra.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/nathansutton/Qwen3.8-27B-Ternary-Bonsai-2-DFlash2-MLX
- Pack ternario de origen (Prism ML): https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-mlx-2bit
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Agente chad: https://github.com/nathansutton/chad
- Cuantizado hermano de 3 bits con el mismo borrador: https://huggingface.co/nathansutton/Qwen3.8-27B-UD-Q3_K_XL-DFlash2-MLX
- Release original del borrador DFlash2: https://huggingface.co/z-lab/Qwen3.8-27B-DFlash2
- Paper DFlash (Chen et al., arXiv:2602.06036): https://arxiv.org/abs/2602.06036
- Busqueda web adicional: sin resultados relevantes; las consultas devolvieron unicamente paginas genericas de servicios de Google, sin informacion sobre el modelo.
